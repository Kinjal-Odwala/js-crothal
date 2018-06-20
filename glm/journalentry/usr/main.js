ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.glm.journalEntry.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.glm.journalEntry.UserInterface",
    Extends: "ui.lay.HouseCodeSearch",
    Definition: {
        init: function() {
            var me = this;

            me.journalEntryId = 0;
            me.lastSelectedRowIndex = -1;
            me.status = "";
            me.wizardCount = 0;
            me.loadCount = 0;
            me.glDebitAccounts = [];
            me.glCreditAccounts = [];

            me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
                me.gateway,
                function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
            );

            me.authorizer = new ii.ajax.Authorizer( me.gateway );
            me.authorizePath = "\\crothall\\chimes\\fin\\GeneralLedger\\JournalEntry";
            me.authorizer.authorize([me.authorizePath],
                function authorizationsLoaded() {
                    me.authorizationProcess.apply(me);
                },
                me);

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);

            me.defineFormControls();
            me.configureCommunications();
			me.setTabIndexes();
            me.initialize();
            me.statusTypesLoaded();
            me.setStatus("Loading");
            me.modified(false);

            if (!parent.fin.appUI.houseCodeId)
                parent.fin.appUI.houseCodeId = 0;
            me.houseCodeSearch = new ui.lay.HouseCodeSearch();
            if (parent.fin.appUI.houseCodeId === 0)
                me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
            else
                me.houseCodesLoaded(me, 0);

            $(window).bind("resize", me, me.resize);
            ui.cmn.behavior.disableBackspaceNavigation();

            if (top.ui.ctl.menu) {
                top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
            }
        },

        authorizationProcess: function() {
            var me = this;

            me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
            me.cancelApproved = me.authorizer.isAuthorized(me.authorizePath + "\\CancelApproved");

            if (me.isAuthorized) {
                $("#pageLoading").hide();
                $("#pageLoading").css({
                    "opacity": "0.5",
                    "background-color": "black"
                });
                $("#messageToUser").css({ "color": "white" });
                $("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
                $("#pageLoading").fadeIn("slow");

                ii.timer.timing("Page displayed");
                me.session.registerFetchNotify(me.sessionLoaded,me);
                me.accountStore.fetch("userId:[user],moduleId:journalEntry", me.accountsLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {
            var me = fin.glm.journalEntryUi;

            if (me === undefined)
                return;

            me.journalEntryGrid.setHeight($(window).height() - 145);
        },

        defineFormControls: function() {
            var me = this;

            me.statusType = new ui.ctl.Input.DropDown.Filtered({
                id: "StatusType",
                formatFunction: function( type ) { return type.title; }
            });

            me.statusType.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation( function( isFinal, dataMap ) {

                    if ((this.focused || this.touched) && me.statusType.indexSelected === -1)
                        this.setInvalid("Please select the correct Status.");
                });

            me.journalEntryGrid = new ui.ctl.Grid({
                id: "JournalEntryGrid",
                appendToId: "divForm",
                allowAdds: false,
                selectFunction: function(index) { me.itemSelect(index); },
                validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
            });

            me.journalEntryGrid.addColumn("accountDebit", "accountDebit", "GL Code - Debit", "GL Code - Debit", 400, function(account) { return account.code + " - " + account.name; });
            me.journalEntryGrid.addColumn("accountCredit", "accountCredit", "GL Code - Credit", "GL Code - Credit", 400, function(account) { return account.code + " - " + account.name; });
            me.journalEntryGrid.addColumn("amount", "amount", "Amount", "Amount", 200);
            me.journalEntryGrid.addColumn("statusType", "statusType", "Status", "Status", null, function(statusType) {
                if (statusType === 8)
                    return "Approved";
                else if (statusType === 9)
                    return "Completed";
                else if (statusType === 6)
                    return "Cancelled";
                else if (statusType === 3)
                    return "Posted";
            });
            me.journalEntryGrid.capColumns();

            me.glCodeDebit = new ui.ctl.Input.DropDown.Filtered({
                id: "GLCodeDebit",
                formatFunction: function (type) { return type.code + " - " + type.name; },
                changeFunction: function() { me.modified();}
            });

            me.glCodeDebit.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function (isFinal, dataMap) {

                    if ((this.focused || this.touched) && me.glCodeDebit.indexSelected === -1)
                        this.setInvalid("Please select the valid GL Code.");
                });

            me.glCodeCredit = new ui.ctl.Input.DropDown.Filtered({
                id: "GLCodeCredit",
                formatFunction: function (type) { return type.code + " - " + type.name; },
                changeFunction: function() { me.modified();}
            });

            me.glCodeCredit.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function (isFinal, dataMap) {

                    if ((this.focused || this.touched) && me.glCodeCredit.indexSelected === -1)
                        this.setInvalid("Please select the valid GL Code.");
                });

            me.amount = new ui.ctl.Input.Text({
                id: "Amount",
                maxLength: 9,
                changeFunction: function() { me.modified(); }
            });

            me.amount.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation( function( isFinal, dataMap ) {

                var enteredText = me.amount.getValue();

                if (enteredText === "")
                    return;

                if (!(/^\d{1,6}(\.\d{1,2})?$/.test(enteredText)) || parseFloat(enteredText) <= 0)
                    this.setInvalid("Please enter valid Amount.");
            });

            me.justification = new ui.ctl.Input.Text({
                id: "Justification",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.justification.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

                var enteredText = me.justification.getValue();

                if (enteredText === "")
                    return;

                if (enteredText.substring(0, 3) !== "RCL")
                    this.setInvalid("Justification must start with 'RCL'.");
            });

            me.assignment = new ui.ctl.Input.Text({
                id: "Assignment",
                maxLength: 18,
                changeFunction: function() { me.modified(); }
            });

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
                id: "AnchorSearch",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionSearchItem(); },
                hasHotState: true
            });

            me.anchorNew = new ui.ctl.buttons.Sizeable({
                id: "AnchorNew",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionNewItem(); },
                hasHotState: true
            });

            me.anchorView = new ui.ctl.buttons.Sizeable({
                id: "AnchorView",
                className: "iiButton",
                text: "<span>&nbsp;View&nbsp;</span>",
                clickFunction: function() { me.actionViewItem(); },
                hasHotState: true
            });

            me.anchorCancelJE = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancelJE",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionCancelJEItem(); },
                hasHotState: true
            });

            me.anchorNext = new ui.ctl.buttons.Sizeable({
                id: "AnchorNext",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionNextItem(); },
                hasHotState: true
            });

            me.anchorSave = new ui.ctl.buttons.Sizeable({
                id: "AnchorSave",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionSaveItem(); },
                hasHotState: true
            });

            me.anchorCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionCancelItem(); },
                hasHotState: true
            });
        },

        configureCommunications: function() {
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.glm.journalEntry.HirNode,
                itemConstructorArgs: fin.glm.journalEntry.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.glm.journalEntry.HouseCode,
                itemConstructorArgs: fin.glm.journalEntry.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.accounts = [];
            me.accountStore = me.cache.register({
                storeId: "accounts",
                itemConstructor: fin.glm.journalEntry.Account,
                itemConstructorArgs: fin.glm.journalEntry.accountArgs,
                injectionArray: me.accounts
            });

            me.journalEntries = [];
            me.journalEntryStore = me.cache.register({
                storeId: "journalEntrys",
                itemConstructor: fin.glm.journalEntry.JournalEntry,
                itemConstructorArgs: fin.glm.journalEntry.journalEntryArgs,
                injectionArray: me.journalEntries,
                lookupSpec: { accountDebit: me.accounts, accountCredit: me.accounts }
            });
        },

        setStatus: function(status) {

            fin.cmn.status.setStatus(status);
        },

        dirtyCheck: function(me) {

            return !fin.cmn.status.itemValid();
        },

        modified: function() {
            var args = ii.args(arguments, {
                modified: {type: Boolean, required: false, defaultValue: true}
            });
            var me = this;

            parent.fin.appUI.modified = args.modified;
            if (args.modified)
                me.setStatus("Edit");
        },

        setLoadCount: function() {
            var me = this;

            me.loadCount++;
            me.setStatus("Loading");
            $("#messageToUser").text("Loading");
            $("#pageLoading").fadeIn("slow");
        },

        checkLoadCount: function() {
            var me = this;

            me.loadCount--;
            if (me.loadCount <= 0) {
                me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
            }
        },

        initialize: function() {

            $("#AnchorView").hide();
            $("#AnchorCancelJE").hide();
        },

        setTabIndexes: function() {
            var me = this;

            me.glCodeDebit.text.tabIndex = 1;
            me.glCodeCredit.text.tabIndex = 2;
            me.amount.text.tabIndex = 3;
            me.justification.text.tabIndex = 4;
            me.assignment.text.tabIndex = 5;
        },

        resizeControls: function() {
            var me = this;

            me.glCodeDebit.resizeText();
            me.glCodeCredit.resizeText();
            me.amount.resizeText();
            me.justification.resizeText();
            me.assignment.resizeText();
            me.resize();
        },

        statusTypesLoaded: function() {
            var me = this;

            me.statusTypes = [];
            me.statusTypes.push(new fin.glm.journalEntry.StatusType(0, "[All]"));
            me.statusTypes.push(new fin.glm.journalEntry.StatusType(8, "Approved"));
            me.statusTypes.push(new fin.glm.journalEntry.StatusType(9, "Completed"));
            me.statusTypes.push(new fin.glm.journalEntry.StatusType(3, "Posted"));
            me.statusTypes.push(new fin.glm.journalEntry.StatusType(6, "Cancelled"));
            me.statusType.setData(me.statusTypes);
            me.statusType.select(1, me.statusType.focused);
        },

        accountsLoaded: function(me, activeId) {

            for (var index = 0; index < me.accounts.length; index++) {
                var item = new fin.glm.journalEntry.Account(me.accounts[index].id, me.accounts[index].code, me.accounts[index].name);
                me.glDebitAccounts.push(item);
            }
            me.glCodeDebit.setData(me.glDebitAccounts);
            me.loadJournalEntries();
        },

        actionSearchItem: function() {
            var me = this;

            me.loadJournalEntries();
        },

        houseCodesLoaded: function(me, activeId) {

            if (parent.fin.appUI.houseCodeId === 0) {
                if (me.houseCodes.length <= 0) {
                    return me.houseCodeSearchError();
                }

                me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
            }

            me.houseCodeGlobalParametersUpdate(false);
            me.resizeControls();
        },

        houseCodeChanged: function() {
            var me = this;

            me.lastSelectedRowIndex = -1;
            me.loadJournalEntries();
        },

        loadJournalEntries: function() {
            var me = this;
            var statusType = me.statusType.indexSelected === -1 ? 0 : me.statusTypes[me.statusType.indexSelected].id;
            var houseCodeId = $("#houseCodeText").val() !== "" ? parent.fin.appUI.houseCodeId : 0;

            if (houseCodeId === 0 || !me.statusType.validate(true))
                return;

            $("#AnchorView").hide();
            $("#AnchorCancelJE").hide();
            me.journalEntryId = 0;
            me.lastSelectedRowIndex = -1;
            me.status = "";
            me.setLoadCount();
            me.journalEntryStore.reset();
            me.journalEntryStore.fetch("userId:[user],journalEntryId:0,houseCodeId:" + houseCodeId + ",statusType:" + statusType, me.journalEntriesLoaded, me);
        },

        journalEntriesLoaded: function (me, activeId) {

            me.journalEntryGrid.setData(me.journalEntries);
            me.checkLoadCount();
        },

        itemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;
            var item = me.journalEntryGrid.data[index];

            me.lastSelectedRowIndex = index;
            me.journalEntryId = item.id;
            me.status = "";
            //$("#AnchorView").show();
            if (me.cancelApproved && item.statusType === 8)
                $("#AnchorCancelJE").show();
            else
                $("#AnchorCancelJE").hide();
        },

        actionNewItem: function() {
            var me = this;

            if (parent.fin.appUI.houseCodeId === 0) {
                alert("Please select the House Code before adding the new Journal Entry.");
                return true;
            }

            me.journalEntryGrid.body.deselectAll();
			me.validator.reset();
			me.glCodeDebit.select(-1, me.glCodeDebit.focused);
			me.glCodeCredit.reset();
            me.amount.setValue("");
            me.justification.setValue("");
            me.assignment.setValue("");
            me.journalEntryId = 0;
            me.lastSelectedRowIndex = -1;
            me.status = "NewJournalEntry";
            me.wizardCount = 1;
            me.modified(false);
            me.setStatus("Normal");
            loadPopup("journalEntryPopup");
            me.actionShowWizard();
			$("#AnchorCancelJE").hide();
        },

        actionViewItem: function() {
            var me = this;

            var item = me.journalEntryGrid.data[me.journalEntryGrid.activeRowIndex];
            var itemIndex = ii.ajax.util.findIndexById(item.accountDebit.id.toString(), me.accounts);
            if (itemIndex !== null && itemIndex >= 0)
                me.glCodeDebit.select(itemIndex, me.glCodeDebit.focused);
            me.glCodeCredit.setData(me.accounts);
            itemIndex = ii.ajax.util.findIndexById(item.accountCredit.id.toString(), me.accounts);
            if (itemIndex !== null && itemIndex >= 0)
                me.glCodeCredit.select(itemIndex, me.glCodeCredit.focused);
            me.amount.setValue(item.amount);
            me.justification.setValue(item.justification);
            me.assignment.setValue(item.assignment);
			me.glCodeDebit.text.readOnly = true;
            me.glCodeCredit.text.readOnly = true;
            me.amount.text.readOnly = true;
            me.justification.text.readOnly = true;
            me.assignment.text.readOnly = true;
            $("#Header").text("Journal Entry Details");
            $("#GLCodeDebitContainer").show();
            $("#GLCodeCreditContainer").show();
            $("#GLCodeDebitAction").removeClass("iiInputAction");
            $("#GLCodeCreditAction").removeClass("iiInputAction");
            $("#AnchorNext").hide();
            $("#AnchorSave").hide();
            loadPopup("journalEntryPopup");
            me.resizeControls();
        },

        actionNextItem: function() {
            var me = this;

            if (!me.validateJournalEntry()) {
                return;
            }

            me.wizardCount++;
            me.actionShowWizard();
        },

        validateJournalEntry: function() {
            var me = this;

            me.validator.forceBlur();
            var valid = me.validator.queryValidity(true);

            if (me.wizardCount === 1) {
                if (!me.glCodeDebit.valid || !me.amount.valid || !me.justification.valid || !me.assignment.valid) {
                    alert("In order to continue, the errors on the page must be corrected.");
                    return false;
                }
            }
            else if (me.wizardCount === 2) {
                if (!me.glCodeCredit.valid) {
                    alert("In order to save, the errors on the page must be corrected.");
                    return false;
                }
            }
            return true;
        },

        actionShowWizard: function() {
            var me = this;

            if (me.wizardCount === 1) {
                $("#Header").text("GL Code To Be Debited");
                $("#GLCodeDebitContainer").show();
                $("#GLCodeCreditContainer").hide();
                $("#AnchorNext").show();
                $("#AnchorSave").hide();
                me.amount.text.readOnly = false;
                me.justification.text.readOnly = false;
                me.assignment.text.readOnly = false;
            }
            else if (me.wizardCount === 2) {
                $("#Header").text("GL Code To Be Credited");
                $("#GLCodeDebitContainer").hide();
                $("#GLCodeCreditContainer").show();
                $("#AnchorNext").hide();
                $("#AnchorSave").show();
                me.amount.text.readOnly = true;
                me.justification.text.readOnly = true;
                me.assignment.text.readOnly = true;

                for (var index = 0; index < me.accounts.length; index++) {
                    if (me.accounts[index].id !== me.glDebitAccounts[me.glCodeDebit.indexSelected].id) {
                        var item = new fin.glm.journalEntry.Account(me.accounts[index].id, me.accounts[index].code, me.accounts[index].name);
                        me.glCreditAccounts.push(item);
                    }
                }
                me.glCodeCredit.setData(me.glCreditAccounts);
            }

            me.resizeControls();
        },

        actionCancelItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            disablePopup("journalEntryPopup");

            if (me.journalEntryGrid.activeRowIndex >= 0) {
                me.journalEntryId = me.journalEntryGrid.data[me.journalEntryGrid.activeRowIndex].id;
            }

            me.wizardCount = 0;
            me.status = "";
            me.modified(false);
            me.setStatus("Normal");
        },

        actionCancelJEItem: function() {
            var me = this;

            if (me.journalEntryGrid.activeRowIndex !== -1) {
                me.status = "CancelJournalEntry";
                me.actionSaveItem();
            }
        },

        actionSaveItem: function() {
            var me = this;
            var item = [];

            if (me.status === "NewJournalEntry") {
                // Check to see if the data entered is valid
                if (!me.validateJournalEntry()) {
                    return false;
                }
                disablePopup("journalEntryPopup");

                item = new fin.glm.journalEntry.JournalEntry(
                    me.journalEntryId
                    , parent.fin.appUI.houseCodeId
                    , 8
					, me.glDebitAccounts[me.glCodeDebit.indexSelected]
                    , me.glCreditAccounts[me.glCodeCredit.indexSelected]
                    , parseFloat(me.amount.getValue()).toFixed(2)
					, me.justification.getValue()
                    , me.assignment.getValue()
                    );
            }
            else if (me.status === "CancelJournalEntry") {
                item = me.journalEntryGrid.data[me.journalEntryGrid.activeRowIndex];
                item.statusType = 6;
            }

            var xml = me.saveXmlBuildJournalEntry(item);

            if (xml === "")
                return;

            me.setStatus("Saving");
            $("#messageToUser").text("Saving");
            $("#pageLoading").fadeIn("slow");

            // Send the object back to the server as a transaction
            me.transactionMonitor.commit({
                transactionType: "itemUpdate",
                transactionXml: xml,
                responseFunction: me.saveResponse,
                referenceData: {me: me, item: item}
            });

            return true;
        },

        saveXmlBuildJournalEntry: function() {
            var args = ii.args(arguments,{
                item: {type: fin.glm.journalEntry.JournalEntry}
            });
            var me = this;
            var item = args.item;
            var xml = "";

            if (me.status === "NewJournalEntry") {
                xml += '<journalEntry';
                xml += ' id="' + item.id + '"';
                xml += ' houseCodeId="' + item.houseCodeId + '"';
                xml += ' statusType="' + item.statusType + '"';
				xml += ' accountDebit="' + item.accountDebit.id + '"';
                xml += ' accountCredit="' + item.accountCredit.id + '"';
                xml += ' amount="' + item.amount + '"';
				xml += ' justification="' + ui.cmn.text.xml.encode(item.justification) + '"';
                xml += ' assignment="' + ui.cmn.text.xml.encode(item.assignment) + '"';
                xml += '/>';
            }
            else if (me.status === "CancelJournalEntry") {
                xml += '<journalEntryStatusUpdate';
                xml += ' id="' + item.id + '"';
                xml += ' statusType="' + item.statusType + '"';
                xml += '/>';
            }

            return xml;
        },

        saveResponse: function() {
            var args = ii.args(arguments, {
                transaction: {type: ii.ajax.TransactionMonitor.Transaction},
                xmlNode: {type: "XmlNode:transaction"}
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");

            if (status === "success") {
                $(args.xmlNode).find("*").each(function () {
                    if (this.tagName === "journalEntry") {
                        if (me.status === "NewJournalEntry") {
                                item.id = parseInt($(this).attr("id"), 10);
                                me.journalEntries.push(item);
                                me.journalEntryGrid.setData(me.journalEntries);
                                me.journalEntryGrid.body.select(me.journalEntries.length - 1);
                        }
                        else if (me.status === "CancelJournalEntry") {
                            me.journalEntries[me.lastSelectedRowIndex] = item;
                            me.journalEntryGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
                            $("#AnchorCancelJE").hide();
                        }
                    }
                });

                me.setStatus("Saved");
                me.status = "";
                me.modified(false);
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while updating Journal Entry details: " + $(args.xmlNode).attr("message"));
            }

            $("#pageLoading").fadeOut("slow");
        }
    }
});

function loadPopup(id) {
    centerPopup(id);

    $("#backgroundPopup").css({
        "opacity": "0.5"
    });
    $("#backgroundPopup").fadeIn("slow");
    $("#" + id).fadeIn("slow");
}

function disablePopup(id) {

    $("#backgroundPopup").fadeOut("slow");
    $("#" + id).fadeOut("slow");
}

function centerPopup(id) {
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    var popupWidth = $("#" + id).width();
    var popupHeight = $("#" + id).height();

    $("#" + id + ", #popupLoading").css({
        "width": popupWidth,
        "height": popupHeight,
        "top": windowHeight/2 - popupHeight/2,
        "left": windowWidth/2 - popupWidth/2
    });
}

function main() {
    fin.glm.journalEntryUi = new fin.glm.journalEntry.UserInterface();
    fin.glm.journalEntryUi.resize();
    fin.houseCodeSearchUi = fin.glm.journalEntryUi;
}
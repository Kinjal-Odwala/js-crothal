ii.Import("ii.krn.sys.ajax");
ii.Import("ii.krn.sys.session");
ii.Import("ui.ctl.usr.input");
ii.Import("ui.ctl.usr.buttons");
ii.Import("ui.ctl.usr.grid");
ii.Import("fin.cmn.usr.util");
ii.Import("ui.ctl.usr.toolbar");
ii.Import("ui.cmn.usr.text");
ii.Import("fin.app.chargebackRate.usr.defs");

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.app.chargebackRate.UserInterface",
    Definition: {
        init: function() {
            var me = this;

            me.yearId = 0;
            me.loadCount = 0;
            me.validHouseCode = true;
            me.houseCodeCache = [];

            me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
                me.gateway
                , function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
            );

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);
            me.authorizer = new ii.ajax.Authorizer( me.gateway );
            me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\ChargebackRates";

            me.authorizer.authorize([me.authorizePath],
                function authorizationsLoaded() {
                    me.authorizationProcess.apply(me);
                },
                me);

            me.defineFormControls();
            me.configureCommunications();
            me.setStatus("Loading");
            me.modified(false);

            $(window).bind("resize", me, me.resize);
            $(document).bind("keydown", me, me.controlKeyProcessor);

            if (top.ui.ctl.menu) {
                top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
            }
        },

        authorizationProcess: function() {
            var me = this;

            me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

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
                me.loadCount = 3;
                me.session.registerFetchNotify(me.sessionLoaded,me);
                me.applicationStore.fetch("userId:[user]", me.applicationsLoaded, me);
                me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
				me.accountStore.fetch("userId:[user],moduleId:chargebackRate", me.accountsLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {

            fin.app.chargebackRateUi.chargebackGrid.setHeight($(window).height() - 180);
        },

        controlKeyProcessor: function() {
            var args = ii.args(arguments, {
                event: {type: Object}
            });
            var event = args.event;
            var me = event.data;
            var processed = false;

            if (event.ctrlKey) {
                if (event.keyCode === 83) {
                    me.actionSaveItem();
                    processed = true;
                }
                else if (event.keyCode === 85) {
                    me.actionUndoItem();
                    processed = true;
                }
            }

            if (processed) {
                return false;
            }
        },

        defineFormControls: function() {
            var me = this;

            me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
                id: "actionMenu"
            });

            me.actionMenu
                .addAction({
                    id: "saveAction",
                    brief: "Save (Ctrl+S)",
                    title: "Save the current application chargeback rates.",
                    actionFunction: function() { me.actionSaveItem(); }
                })
                .addAction({
                    id: "cancelAction",
                    brief: "Undo (Ctrl+U)",
                    title: "Undo the changes to application chargeback rates being edited.",
                    actionFunction: function() { me.actionUndoItem(); }
                });

            me.year = new ui.ctl.Input.DropDown.Filtered({
                id: "Year",
                formatFunction: function( type ) { return type.title; },
                changeFunction: function() { me.yearChanged(); },
                required: false
            });

            me.year.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required )
                .addValidation( function( isFinal, dataMap ) {

                    if (me.year.indexSelected === -1)
                        this.setInvalid("Please select correct Year.");
                });

            me.chargebackGrid = new ui.ctl.Grid({
                id: "ChargebackGrid",
                allowAdds: false,
                preDeactivateFunction: function() { return (me.validHouseCode ? true : false); },
                selectFunction: function(index){ me.itemSelect(index); }
            });

            me.applicationTitle = new ui.ctl.Input.Text({
                id: "ApplicationTitle",
                maxLength: 64,
                appendToId: "ChargebackGridControlHolder"
            });

            me.periodCharge = new ui.ctl.Input.Text({
                id: "PeriodCharge",
                maxLength: 13,
                appendToId: "ChargebackGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.periodCharge.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.periodCharge.getValue();

                    if (enteredText === "")
                        return;

                    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,10}(\\.\\d{1,2})?$")))
                        this.setInvalid("Please enter valid amount. Example: 99.99");
                });

            me.accountCharge = new ui.ctl.Input.DropDown.Filtered({
                id: "AccountCharge" ,
                appendToId: "ChargebackGridControlHolder",
                formatFunction: function( type ) { return type.code; },
                changeFunction: function() { me.modified(); }
            });

            me.accountCharge.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if ((this.focused || this.touched) && me.accountCharge.indexSelected === -1)
                        this.setInvalid("Please select the correct GL account.");
                });

            me.chargeDescription = new ui.ctl.Input.Text({
                id: "ChargeDescription" ,
                maxLength: 256,
                appendToId: "ChargebackGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.accountRevenue = new ui.ctl.Input.DropDown.Filtered({
                id: "AccountRevenue" ,
                appendToId: "ChargebackGridControlHolder",
                formatFunction: function( type ) { return type.code; },
                changeFunction: function() { me.modified(); }
            });

            me.accountRevenue.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if ((this.focused || this.touched) && me.accountRevenue.indexSelected === -1)
                        this.setInvalid("Please select the correct GL account.");
                });

            me.revenueHouseCode = new ui.ctl.Input.Text({
                id: "RevenueHouseCode",
                maxLength: 16,
                appendToId: "ChargebackGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

             me.revenueHouseCode.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.revenueHouseCode.getValue();

                    if (enteredText === "")
                        return;

                    if (!me.validHouseCode)
                        this.setInvalid("The Cost Center [" + enteredText + "] is not valid.");
                });

            me.notes = new ui.ctl.Input.Text({
                id: "Notes",
                maxLength: 512,
                appendToId: "ChargebackGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.chargebackGrid.addColumn("applicationTitle", "applicationTitle", "Application", "Application", 200, null, me.applicationTitle);
            me.chargebackGrid.addColumn("periodCharge", "periodCharge", "Period Charge", "Period Charge", 150, null, me.periodCharge);
            me.chargebackGrid.addColumn("accountCharge", "accountCharge", "Charge GL Code", "Charge GL Code", 170, function(type) { return type.code; }, me.accountCharge);
            me.chargebackGrid.addColumn("chargeDescription", "chargeDescription", "Charge Description", "Charge Description", 300, null, me.chargeDescription);
            me.chargebackGrid.addColumn("houseCode", "houseCode", "Revenue Cost Center", "Revenue Cost Center", 200, null, me.revenueHouseCode);
            me.chargebackGrid.addColumn("accountRevenue", "accountRevenue", "Revenue GL Code", "Revenue GL Code", 170, function(type) { return type.code; }, me.accountRevenue);
            me.chargebackGrid.addColumn("notes", "notes", "Notes", "Notes", null, null, me.notes);
            me.chargebackGrid.capColumns();

            me.applicationTitle.active = false;
            me.periodCharge.active = false;
            me.accountCharge.active = false;
            me.chargeDescription.active = false;
            me.revenueHouseCode.active = false;
            me.accountRevenue.active = false;
            me.notes.active = false;

            me.anchorSave = new ui.ctl.buttons.Sizeable({
                id: "AnchorSave",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionSaveItem(); },
                hasHotState: true
            });

            me.anchorUndo = new ui.ctl.buttons.Sizeable({
                id: "AnchorUndo",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionUndoItem(); },
                hasHotState: true
            });

            $("#RevenueHouseCodeText").bind("blur keyup", me, me.houseCodeChange);
        },

        configureCommunications: function() {
            var me = this;

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.app.chargebackRate.HouseCode,
                itemConstructorArgs: fin.app.chargebackRate.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.app.chargebackRate.FiscalYear,
                itemConstructorArgs: fin.app.chargebackRate.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

            me.accounts = [];
            me.accountStore = me.cache.register({
                storeId: "accounts",
                itemConstructor: fin.app.chargebackRate.Account,
                itemConstructorArgs: fin.app.chargebackRate.accountArgs,
                injectionArray: me.accounts
            });

            me.applications = [];
            me.applicationStore = me.cache.register({
                storeId: "applications",
                itemConstructor: fin.app.chargebackRate.Application,
                itemConstructorArgs: fin.app.chargebackRate.applicationArgs,
                injectionArray: me.applications
            });

            me.chargebackRates = [];
            me.chargebackRateStore = me.cache.register({
                storeId: "chargebackRates",
                itemConstructor: fin.app.chargebackRate.ChargebackRate,
                itemConstructorArgs: fin.app.chargebackRate.chargebackRateArgs,
                injectionArray: me.chargebackRates,
                lookupSpec: {application: me.applications, accountCharge: me.accounts, accountRevenue: me.accounts}
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

        fiscalYearsLoaded: function(me, activeId) {

            me.year.setData(me.fiscalYears);
            me.year.select(0, me.year.focused);
            me.yearChanged();
            me.checkLoadCount();
        },

        accountsLoaded: function (me, activeId) {

            me.accountCharge.setData(me.accounts);
            me.accountRevenue.setData(me.accounts);
            me.checkLoadCount();
        },

        applicationsLoaded: function(me, activeId) {

            me.checkLoadCount();
        },

        chargebacksLoaded: function(me, activeId) {

            for (var index = 0; index < me.applications.length; index++) {
                var result = $.grep(me.chargebackRates, function(item) { return item.application.id === me.applications[index].id; });
                if (result.length === 0) {
                    var item = new fin.app.chargebackRate.ChargebackRate(0
                        , me.yearId
                        , me.applications[index]
                        , me.applications[index].title
                        , ""
                        , new fin.app.chargebackRate.Account(0, "", "")
                        , ""
                        , 0
                        , ""
                        , new fin.app.chargebackRate.Account(0, "", "")
                        );
                    me.chargebackRates.push(item);
                }
            }

            me.chargebackGrid.setData(me.chargebackRates);
            me.checkLoadCount();
        },

        yearChanged: function() {
            var me = this;

            if (me.year.indexSelected === -1)
                return;

            me.yearId = me.fiscalYears[me.year.indexSelected].id;
            me.setLoadCount();
            me.chargebackRateStore.reset();
            me.chargebackRateStore.fetch("userId:[user],yearId:" + me.yearId, me.chargebacksLoaded, me);
        },

        itemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            me.chargebackGrid.data[index].modified = true;
            me.applicationTitle.text.readOnly = true;
            me.validHouseCode = true;
            $("#PeriodChargeText").keypress(function (e) {
                if (e.which !== 8 && e.which !== 0 && e.which !== 46 && (e.which < 48 || e.which > 57))
                    return false;
            });

            $("#RevenueHouseCodeText").keypress(function(e) {
                me.validHouseCode = false;
            });
        },

         houseCodeChange: function() {
            var args = ii.args(arguments, {
                event: { type: Object }
            });
            var event = args.event;
            var me = event.data;
            var houseCode = me.revenueHouseCode.getValue().replace(/[^0-9]/g, "");

            if (event.type === "blur" || event.keyCode === 13 || event.keyCode === 9) {
                me.revenueHouseCode.setValue(houseCode);
                if (houseCode !== "") {
                    me.validHouseCode = false;
                    me.houseCodeCheck(houseCode);
                }
                else {
                    me.validHouseCode = true;
                    if (me.chargebackGrid.data[me.chargebackGrid.activeRowIndex] !== undefined)
                        me.chargebackGrid.data[me.chargebackGrid.activeRowIndex].houseCodeId = 0;
                }
            }
        },

        houseCodeCheck: function(houseCode) {
            var me = this;

            if (me.houseCodeCache[houseCode] !== undefined) {
                if (me.houseCodeCache[houseCode].loaded)
                    me.houseCodeValidate(houseCode);
            }
            else
                me.houseCodeLoad(houseCode);
        },

        houseCodeLoad: function(houseCode) {
            var me = this;

            me.houseCodeCache[houseCode] = {};
            me.houseCodeCache[houseCode].valid = false;
            me.houseCodeCache[houseCode].loaded = false;

            $("#RevenueHouseCodeText").addClass("Loading");

            $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/hcm/act/provider.aspx",
                data: "moduleId=hcm&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],appUnitBrief:" + houseCode + ",<criteria>",

                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;

                    if ($(xml).find("item").length) {
                        //the house code is valid
                        $(xml).find("item").each(function() {
                            me.houseCodeCache[houseCode].valid = true;
                            me.houseCodeCache[houseCode].id = parseInt($(this).attr("id"), 10);
                            me.houseCodeCache[houseCode].revenueHouseCode = $(this).attr("brief");
                            me.houseCodeValidate(houseCode);
                            $("#RevenueHouseCodeText").removeClass("Loading");
                        });
                    }
                    else {
                        //the house code is invalid
                        me.houseCodeValidate(houseCode);
                    }
                }
            });
        },

        houseCodeValidate: function(houseCode) {
            var me = this;

            $("#RevenueHouseCodeText").removeClass("Loading");

            if (!me.houseCodeCache[houseCode].valid) {
                me.revenueHouseCode.setInvalid("The Cost Center [" + houseCode + "] is not valid.");
                if (me.chargebackGrid.data[me.chargebackGrid.activeRowIndex] !== undefined) {
                    me.chargebackGrid.data[me.chargebackGrid.activeRowIndex].houseCodeId = 0;
                    me.chargebackGrid.data[me.chargebackGrid.activeRowIndex].houseCode = houseCode;
                }
            }
            else {
                var index = me.chargebackGrid.activeRowIndex;
                me.validHouseCode = true;
                me.revenueHouseCode.setValue(me.houseCodeCache[houseCode].revenueHouseCode);
                if (me.chargebackGrid.data[index] !== undefined) {
                    me.chargebackGrid.data[index].houseCodeId = me.houseCodeCache[houseCode].id;
                    me.chargebackGrid.data[index].houseCode = me.houseCodeCache[houseCode].revenueHouseCode;
                }
            }
        },

        actionUndoItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            if (me.chargebackGrid.activeRowIndex !== -1)
                me.chargebackGrid.body.deselect(me.chargebackGrid.activeRowIndex, true);

            me.setStatus("Loading");
            me.yearChanged();
        },

        actionSaveItem: function() {
            var me = this;
			var xml = "";
            var item = [];

            if (me.chargebackGrid.activeRowIndex < 0) {
                return false;
            }

            me.chargebackGrid.body.deselectAll();
            me.validator.forceBlur();

            // Check to see if the data entered is valid
            if (!me.validator.queryValidity(true)) {
                alert("In order to save, the errors on the page must be corrected.");
                return false;
            }

            xml = me.saveXmlBuild();
			if (xml === "")
				return false;

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

        saveXmlBuild: function() {
            var me = this;
            var xml = "";

            for (var index = 0; index < me.chargebackRates.length; index++) {
				if (me.chargebackRates[index].modified) {
					xml += '<appChargebackRate';
	                xml += ' id="' + me.chargebackRates[index].id + '"';
	                xml += ' yearId="' + me.chargebackRates[index].yearId + '"';
	                xml += ' applicationId="' + me.chargebackRates[index].application.id + '"';
	                xml += ' periodCharge="' + me.chargebackRates[index].periodCharge + '"';
	                xml += ' accountCharge="' + me.chargebackRates[index].accountCharge.id + '"';
	                xml += ' chargeDescription="' + ui.cmn.text.xml.encode(me.chargebackRates[index].chargeDescription) + '"';
	                xml += ' houseCodeId="' + me.chargebackRates[index].houseCodeId + '"';
	                xml += ' accountRevenue="' + me.chargebackRates[index].accountRevenue.id + '"';
	                xml += ' notes="' + ui.cmn.text.xml.encode(me.chargebackRates[index].notes) + '"';
	                xml += '/>';
				}
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
            var status = $(args.xmlNode).attr("status");
            var id = 0;

            if (status === "success") {
                $(args.xmlNode).find("*").each(function() {
                    if (this.tagName === "appChargebackRate") {
                        id = parseInt($(this).attr("id"), 10);

                        for (var index = 0; index < me.chargebackRates.length; index++) {
                            if (me.chargebackRates[index].modified) {
                                if (me.chargebackRates[index].id === 0)
                                    me.chargebackRates[index].id = id;
                                me.chargebackRates[index].modified = false;
                                break;
                            }
                        }
                    }
                });

                me.modified(false);
                me.setStatus("Saved");
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while updating application chargeback rates: " + $(args.xmlNode).attr("message"));
            }

            $("#pageLoading").fadeOut("slow");
        }
    }
});

function main() {
    fin.app.chargebackRateUi = new fin.app.chargebackRate.UserInterface();
    fin.app.chargebackRateUi.resize();
}
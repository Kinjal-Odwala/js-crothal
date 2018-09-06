ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.hcm.callMetric.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.button", 8 );

ii.Class({
    Name: "fin.hcm.callMetric.UserInterface",
    Extends: "ui.lay.HouseCodeSearch",
    Definition: {

        init: function() {
            var args = ii.args(arguments, {});
            var me = this;

            me.loadCount = 0;

            me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
                me.gateway
                , function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
            );

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);

            me.authorizer = new ii.ajax.Authorizer( me.gateway );
            me.authorizePath = "\\crothall\\chimes\\fin\\Metrics\\CallMetrics";
            me.authorizer.authorize([me.authorizePath],
                function authorizationsLoaded() {
                    me.authorizationProcess.apply(me);
                },
                me);

            me.defineFormControls();
            me.configureCommunications();
            me.setStatus("Loading");
            me.modified(false);

            me.houseCodeSearch = new ui.lay.HouseCodeSearch();
            if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;

            if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad
                me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
            else
                me.houseCodesLoaded(me, 0);

            $(window).bind("resize", me, me.resize);

            if (top.ui.ctl.menu) {
                top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
            }
        },

        authorizationProcess: function(){
            var args = ii.args(arguments,{});
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
                me.loadCount = 2;
                me.session.registerFetchNotify(me.sessionLoaded, me);
                me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
                me.callMetricTypeStore.fetch("userId:[user]", me.callMetricTypesLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
        },

        sessionLoaded: function fin_app_laundry_UserInterface_sessionLoaded() {
            var args = ii.args(arguments, {
                me: {type: Object}
            });

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {
            var me = fin.callMetricUi;
            me.callMetricGrid.setHeight($(window).height() - 150);

        },

        defineFormControls: function () {
            var me = this;

            me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
                id: "actionMenu"
            });

            me.actionMenu
                .addAction({
                    id: "saveAction",
                    brief: "Save EVS Metric (Ctrl+S)",
                    title: "Save the current EVS metric details.",
                    actionFunction: function() { me.actionSaveItem(); }
                })
                .addAction({
                    id: "cancelAction",
                    brief: "Undo current changes to EVS Metric (Ctrl+U)",
                    title: "Undo the changes to EVS metric being edited.",
                    actionFunction: function() { me.actionUndoItem(); }
                });


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

            me.callMetricGrid = new ui.ctl.Grid({
                id: "CallMetricGrid",
                appendToId: "divForm",
                allowAdds: false,
                selectFunction: function( index ) { me.itemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.callMetricTypeTitle = new ui.ctl.Input.Text({
                id: "CallMetricTypeTitle",
                maxLength: 64,
                appendToId: "CallMetricGridControlHolder"
            });

            me.period1 = new ui.ctl.Input.Text({
                id: "Period1",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period1.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period1,me.callMetricGrid);
                });

            me.period2 = new ui.ctl.Input.Text({
                id: "Period2",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period2.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period2,me.callMetricGrid);
                });

            me.period3 = new ui.ctl.Input.Text({
                id: "Period3",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period3.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period3,me.callMetricGrid);
                });

            me.period4 = new ui.ctl.Input.Text({
                id: "Period4",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period4.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period4,me.callMetricGrid);
                });

            me.period5 = new ui.ctl.Input.Text({
                id: "Period5",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period5.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){
                    me.validateControl(me.period5,me.callMetricGrid);
                });

            me.period6 = new ui.ctl.Input.Text({
                id: "Period6",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period6.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period6,me.callMetricGrid);
                });

            me.period7 = new ui.ctl.Input.Text({
                id: "Period7",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period7.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period7,me.callMetricGrid);
                });

            me.period8 = new ui.ctl.Input.Text({
                id: "Period8",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period8.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period8,me.callMetricGrid);
                });

            me.period9 = new ui.ctl.Input.Text({
                id: "Period9",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period9.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period9,me.callMetricGrid);
                });

            me.period10 = new ui.ctl.Input.Text({
                id: "Period10",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period10.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period10,me.callMetricGrid);
                });

            me.period11 = new ui.ctl.Input.Text({
                id: "Period11",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period11.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period11,me.callMetricGrid);
                });

            me.period12 = new ui.ctl.Input.Text({
                id: "Period12",
                appendToId: "CallMetricGridControlHolder",
                maxLength: 11,
                changeFunction: function() { me.modified(); }
            });

            me.period12.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    me.validateControl(me.period12,me.callMetricGrid);
                });


            me.callMetricGrid.addColumn("callMetricTypeTitle", "callMetricTypeTitle", "Metric Type", "Metric Type", null,null,me.callMetricTypeTitle);
            me.callMetricGrid.addColumn("period1", "period1", "Period1", "Period1", 120, null, me.period1);
            me.callMetricGrid.addColumn("period2", "period2", "Period2", "Period2", 120, null, me.period2);
            me.callMetricGrid.addColumn("period3", "period3", "Period3", "Period3", 120, null, me.period3);
            me.callMetricGrid.addColumn("period4", "period4", "Period4", "Period4", 120, null, me.period4);
            me.callMetricGrid.addColumn("period5", "period5", "Period5", "Period5", 120, null, me.period5);
            me.callMetricGrid.addColumn("period6", "period6", "Period6", "Period6", 120, null, me.period6);
            me.callMetricGrid.addColumn("period7", "period7", "Period7", "Period7", 120, null, me.period7);
            me.callMetricGrid.addColumn("period8", "period8", "Period8", "Period8", 120, null, me.period8);
            me.callMetricGrid.addColumn("period9", "period9", "Period9", "Period9", 120, null, me.period9);
            me.callMetricGrid.addColumn("period10", "period10", "Period10", "Period10", 120, null, me.period10);
            me.callMetricGrid.addColumn("period11", "period11", "Period11", "Period11", 120, null, me.period11);
            me.callMetricGrid.addColumn("period12", "period12", "Period12", "Period12", 120, null, me.period12);
            me.callMetricGrid.capColumns();


           /* me.callMetricTypeTitle.active = false;
            me.period1.active = false;
            me.period2.active = false;
            me.period3.active = false;
            me.period4.active = false;
            me.period5.active = false;
            me.period6.active = false;
            me.period7.active = false;
            me.period8.active = false;
            me.period9.active = false;
            me.period10.active = false;
            me.period11.active = false;
            me.period12.active = false;*/



        },

        validateControl: function(control, activeGrid) {
            var enteredText = control.getValue();

            if (enteredText === "" || activeGrid.activeRowIndex === -1)
                return;

            var dataType = activeGrid.data[activeGrid.activeRowIndex].callMetricType.dataType;
            if (dataType === "Decimal") {
                if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                    control.setInvalid("Please enter numeric value.");
            }
            else if ((dataType === "Integer") && !(/^\d{1,9}$/.test(enteredText)))
                control.setInvalid("Please enter valid number.");
        },

        configureCommunications: function fin_app_laundry_UserInterface_configureCommunications() {
            var args = ii.args(arguments, {});
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.hcm.callMetric.HirNode,
                itemConstructorArgs: fin.hcm.callMetric.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.hcm.callMetric.HouseCode,
                itemConstructorArgs: fin.hcm.callMetric.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.hcm.callMetric.FiscalYear,
                itemConstructorArgs: fin.hcm.callMetric.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

            me.callMetricTypes = [];
            me.callMetricTypeStore = me.cache.register({
                storeId: "callMetricTypes",
                itemConstructor: fin.hcm.callMetric.CallMetricType,
                itemConstructorArgs: fin.hcm.callMetric.callMetricTypeArgs,
                injectionArray: me.callMetricTypes
            });

            me.callMetrics = [];
            me.callMetricStore = me.cache.register({
                storeId: "callMetricNumericDetails",
                itemConstructor: fin.hcm.callMetric.CallMetricNumericDetail,
                itemConstructorArgs: fin.hcm.callMetric.callMetricNumericDetailArgs,
                injectionArray: me.callMetrics
            });
        },

        setStatus: function(status) {
            var me = this;

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

        setLoadCount: function(me, activeId) {
            var me = this;

            me.loadCount++;
            me.setStatus("Loading");
            $("#messageToUser").text("Loading");
            $("#pageLoading").fadeIn("slow");
        },

        checkLoadCount: function() {
            var me = this;

            if (me.loadCount == 0)
                return;

            me.loadCount--;
            if (me.loadCount == 0) {
                me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
            }
        },

        resizeControls: function() {
            var me = this;

            me.year.resizeText();
            me.resize();
        },

        houseCodesLoaded: function(me, activeId) {

            if (parent.fin.appUI.houseCodeId == 0) {
                if (me.houseCodes.length <= 0) {
                    return me.houseCodeSearchError();
                }

                me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
            }

            me.houseCodeGlobalParametersUpdate(false);
        },

        houseCodeChanged: function() {
            var args = ii.args(arguments,{});
            var me = this;

            if (parent.fin.appUI.houseCodeId <= 0) return;
            me.yearChanged();
        },

        callMetricTypesLoaded: function(me, activeId) {

            me.checkLoadCount();
            me.resizeControls();
        },

        fiscalYearsLoaded: function(me, activeId) {

            me.year.setData(me.fiscalYears);
            me.year.select(0, me.year.focused);
            me.yearChanged();
            me.checkLoadCount();
        },

        yearChanged: function() {
            var me = this;

            if (me.year.indexSelected === -1)
                return;

            me.setLoadCount();
            me.callMetricStore.reset();
            me.callMetricStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",yearId:" + me.fiscalYears[me.year.indexSelected].id, me.callMetricsLoaded, me);
        },

        callMetricsLoaded: function(me, activeId) {

            if (me.callMetrics.length == 0) {
                for (var index = 0; index < me.callMetricTypes.length; index++) {
                    var item = new fin.hcm.callMetric.CallMetricNumericDetail(0
                        , parent.fin.appUI.houseCodeId
                        ,me.fiscalYears[me.year.indexSelected].id
                        , me.callMetricTypes[index]
                        , me.callMetricTypes[index].title

                    );

                    me.callMetrics.push(item);
                }
            }

                me.anchorSave.display(ui.cmn.behaviorStates.enabled);
                me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
                me.callMetricGrid.setData(me.callMetrics);
                me.callMetricGrid.setHeight($(window).height() - 150);
                me.checkLoadCount();
        },

        itemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}  // The index of the data subItem to select
            });
            var me = this;
            var index = args.index;

            if (me.callMetricGrid.data[index] != undefined) {
                me.callMetricGrid.data[index].modified = true;
                me.period1.text.select();
                me.period1.text.focus();
                me.callMetricTypeTitle.text.readOnly = true;

            }
        },

        actionUndoItem: function() {
            var args = ii.args(arguments, {});
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            if (me.callMetricGrid.activeRowIndex != - 1)
                me.callMetricGrid.body.deselect(me.callMetricGrid.activeRowIndex, true);
            me.callMetricStore.reset();
            me.yearChanged();
        },

        actionSaveItem: function() {
            var args = ii.args(arguments, {});
            var me = this;
            var item = [];
            var xml = "";

            // Check to see if the data entered is valid
            me.callMetricGrid.body.deselectAll();
            me.validator.forceBlur();

            if (me.year.indexSelected == -1 || (!me.validator.queryValidity(true) && me.callMetricGrid.activeRowIndex >= 0)) {
                alert("In order to save, the errors on the page must be corrected.");
                return false;
            }

            for (var index = 0; index < me.callMetrics.length; index++) {
                if (me.callMetrics[index].modified || me.callMetrics[index].id == 0) {
                    me.callMetrics[index].modified = true;
                    xml += '<callMetricNumericDetail';
                    xml += ' id="' + me.callMetrics[index].id + '"';
                    xml += ' callMetricTypeId="' + me.callMetrics[index].callMetricType.id + '"';
                    xml += ' houseCodeId="' + me.callMetrics[index].houseCodeId + '"';
                    xml += ' yearId="' + me.callMetrics[index].yearId + '"';
                    xml += ' period1="' + ui.cmn.text.xml.encode(me.callMetrics[index].period1) + '"';
                    xml += ' period2="' + ui.cmn.text.xml.encode(me.callMetrics[index].period2) + '"';
                    xml += ' period3="' + ui.cmn.text.xml.encode(me.callMetrics[index].period3) + '"';
                    xml += ' period4="' + ui.cmn.text.xml.encode(me.callMetrics[index].period4) + '"';
                    xml += ' period5="' + ui.cmn.text.xml.encode(me.callMetrics[index].period5) + '"';
                    xml += ' period6="' + ui.cmn.text.xml.encode(me.callMetrics[index].period6) + '"';
                    xml += ' period7="' + ui.cmn.text.xml.encode(me.callMetrics[index].period7) + '"';
                    xml += ' period8="' + ui.cmn.text.xml.encode(me.callMetrics[index].period8) + '"';
                    xml += ' period9="' + ui.cmn.text.xml.encode(me.callMetrics[index].period9) + '"';
                    xml += ' period10="' + ui.cmn.text.xml.encode(me.callMetrics[index].period10) + '"';
                    xml += ' period11="' + ui.cmn.text.xml.encode(me.callMetrics[index].period11) + '"';
                    xml += ' period12="' + ui.cmn.text.xml.encode(me.callMetrics[index].period12) + '"';
                    xml += '/>';
                }
            }

            if (xml == "")
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

        saveResponse: function() {
            var args = ii.args(arguments, {
                transaction: {type: ii.ajax.TransactionMonitor.Transaction},
                xmlNode: {type: "XmlNode:transaction"}
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");

            if (status == "success") {
                me.modified(false);

                $(args.xmlNode).find("*").each(function() {
                    switch (this.tagName) {
                        case "callMetricNumericDetail":
                            var id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.callMetricGrid.data.length; index++) {
                                if (me.callMetricGrid.data[index].modified) {
                                    if (me.callMetricGrid.data[index].id == 0)
                                        me.callMetricGrid.data[index].id = id;
                                    me.callMetricGrid.data[index].modified = false;
                                    break;
                                }
                            }
                            break;
                    }
                });

                me.setStatus("Saved");
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while updating call metrics: " + $(args.xmlNode).attr("message"));
            }

            $("#pageLoading").fadeOut("slow");
        }
    }
});

function main() {

    fin.callMetricUi = new fin.hcm.callMetric.UserInterface();
    fin.callMetricUi.resize();
    fin.houseCodeSearchUi = fin.callMetricUi;
}
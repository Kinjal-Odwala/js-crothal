ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.hcm.metricSetup.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.tabs", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );

ii.Class({
    Name: "fin.hcm.metricSetup.UserInterface",
    Definition: {
        init: function() {
            var me = this;

            me.activeFrameId = 0;
            me.loadCount = 0;
            me.reloadData = false;

            me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
                me.gateway,
                function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
            );

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);
            me.authorizer = new ii.ajax.Authorizer( me.gateway );
            me.authorizePath = "\\crothall\\chimes\\fin\\Metrics\\Setup";
            me.authorizer.authorize([me.authorizePath],
                function authorizationsLoaded() {
                    me.authorizationProcess.apply(me);
                },
                me);

            me.defineFormControls();
            me.configureCommunications();
            me.setStatus("Loading");
            me.modified(false);
            me.initialize();

            $(window).bind("resize", me, me.resize);
            $(document).bind("keydown", me, me.controlKeyProcessor);

            ui.cmn.behavior.disableBackspaceNavigation();
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
                me.session.registerFetchNotify(me.sessionLoaded, me);
                me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
                me.ptMetricTypeStore.fetch("userId:[user]", me.ptMetricTypesLoaded, me);
                me.evsMetricTypeStore.fetch("userId:[user]", me.evsMetricTypesLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

            me.ptTabShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\PT");
            me.evsTabShow =parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\EVS");

            if (me.ptTabShow)
                $("#TabPTSetup").show();
            if (me.evsTabShow)
                $("#TabEVSSetup").show();

            if (me.ptTabShow)
                me.activeFrameId = 1;
            else if (me.evsTabShow)
                me.activeFrameId = 2;

            $("#container-1").tabs(me.activeFrameId);
            $("#container-1").triggerTab(me.activeFrameId);
            setTimeout(function() {
                me.resizeControls(me.activeFrameId);
            }, 100);
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {
            var me = fin.hcm.hcmMetricSetupUi;
            var offset = 100;

            $("#PTSetupContainer").height($(window).height() - offset);
            $("#EVSSetupContainer").height($(window).height() - offset);

            if ($("#PTNonTeleTrackingGridContainer").width() < 1800) {
                $("#PTNonTeleTrackingGrid").width(1800);
            }
            if ($("#PTTeleTrackingGridContainer").width() < 1800) {
                $("#PTTeleTrackingGrid").width(1800);
            }

            if ($("#EVSNonTeleTrackingGridContainer").width() < 1600) {
                $("#EVSNonTeleTrackingGrid").width(1600);
            }
            if ($("#EVSTeleTrackingGridContainer").width() < 1600) {
                $("#EVSTeleTrackingGrid").width(1600);
            }

            me.ptNonTeleTrackingGrid.setHeight(200);
            me.ptTeleTrackingGrid.setHeight(200);
            me.evsNonTeleTrackingGrid.setHeight(200);
            me.evsTeleTrackingGrid.setHeight(200);
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
                    brief: "Save Metric (Ctrl+S)",
                    title: "Save the current metric details.",
                    actionFunction: function() { me.actionSaveItem(); }
                })
                .addAction({
                    id: "cancelAction",
                    brief: "Undo Metric (Ctrl+U)",
                    title: "Undo the changes to metric being edited.",
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

            me.ptNonTeleTrackingGrid = new ui.ctl.Grid({
                id: "PTNonTeleTrackingGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.ptNonTeleTrackingItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.ptnMetricTypeTitle = new ui.ctl.Input.Text({
                id: "PTNMetricTypeTitle",
                appendToId: "PTNonTeleTrackingGridControlHolder"
            });

            me.ptnOnTimeScheduled = new ui.ctl.Input.Text({
                id: "PTNOnTimeScheduled",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnOnTimeScheduled.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnOnTimeScheduled.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnOnTimeScheduled.setValue(newValue);
                });

            me.ptnRTA10 = new ui.ctl.Input.Text({
                id: "PTNRTA10",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnRTA10.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnRTA10.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnRTA10.setValue(newValue);
                });

            me.ptnDTC20 = new ui.ctl.Input.Text({
                id: "PTNDTC20",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnDTC20.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnDTC20.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnDTC20.setValue(newValue);
                });

            me.ptnRTC30 = new ui.ctl.Input.Text({
                id: "PTNRTC30",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnRTC30.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnRTC30.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnRTC30.setValue(newValue);
                });

            me.ptnTPPH = new ui.ctl.Input.Text({
                id: "PTNTPPH",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnTPPH.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnTPPH.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnTPPH.setValue(newValue);
                });

            me.ptnTPPD = new ui.ctl.Input.Text({
                id: "PTNTPPD",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnTPPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnTPPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnTPPD.setValue(newValue);
                });

            me.ptnITPPD = new ui.ctl.Input.Text({
                id: "PTNITPPD",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnITPPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnITPPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnITPPD.setValue(newValue);
                });

            me.ptnCancellation = new ui.ctl.Input.Text({
                id: "PTNCancellation",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnCancellation.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnCancellation.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnCancellation.setValue(newValue);
                });

            me.ptnDelay = new ui.ctl.Input.Text({
                id: "PTNDelay",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnDelay.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnDelay.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnDelay.setValue(newValue);
                });

            me.ptnDischarges = new ui.ctl.Input.Text({
                id: "PTNDischarges",
                maxLength: 19,
                appendToId: "PTNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ptnDischarges.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.ptnDischarges.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.ptnDischarges.setValue(newValue);
                });

            me.ptNonTeleTrackingGrid.addColumn("ptnMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.ptnMetricTypeTitle);
            me.ptNonTeleTrackingGrid.addColumn("ptnOnTimeScheduled", "onTimeScheduled", "On Time Scheduled (%)", "On Time Scheduled (%)", 170, null, me.ptnOnTimeScheduled);
            me.ptNonTeleTrackingGrid.addColumn("ptnRTA10", "rta10", "RTA 10 (%)", "RTA 10 (%)", 150, null, me.ptnRTA10);
            me.ptNonTeleTrackingGrid.addColumn("ptnDTC20", "dtc20", "DTC 20 (%)", "DTC 20 (%)", 150, null, me.ptnDTC20);
            me.ptNonTeleTrackingGrid.addColumn("ptnRTC30", "rtc30", "RTC 30 (%)", "RTC 30 (%)", 150, null, me.ptnRTC30);
            me.ptNonTeleTrackingGrid.addColumn("ptnTPPH", "tpph", "TPPH", "TPPH", 150, null, me.ptnTPPH);
            me.ptNonTeleTrackingGrid.addColumn("ptnTPPD", "tppd", "TPPD", "TPPD", 150, null, me.ptnTPPD);
            me.ptNonTeleTrackingGrid.addColumn("ptnITPPD", "itppd", "ITPPD", "ITPPD", 150, null, me.ptnITPPD);
            me.ptNonTeleTrackingGrid.addColumn("ptnCancellation", "cancellation", "Cancellation (%)", "Cancellation (%)", 150, null, me.ptnCancellation);
            me.ptNonTeleTrackingGrid.addColumn("ptnDelay", "delay", "Delay (%)", "Delay (%)", 150, null, me.ptnDelay);
            me.ptNonTeleTrackingGrid.addColumn("ptnDischarges", "discharges", "Discharges (%)", "Discharges (%)", 150, null, me.ptnDischarges);
            me.ptNonTeleTrackingGrid.capColumns();

            me.ptTeleTrackingGrid = new ui.ctl.Grid({
                id: "PTTeleTrackingGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.ptTeleTrackingItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.pttMetricTypeTitle = new ui.ctl.Input.Text({
                id: "PTTMetricTypeTitle",
                appendToId: "PTTeleTrackingGridControlHolder"
            });

            me.pttOnTimeScheduled = new ui.ctl.Input.Text({
                id: "PTTOnTimeScheduled",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttOnTimeScheduled.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttOnTimeScheduled.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttOnTimeScheduled.setValue(newValue);
                });

            me.pttRTA10 = new ui.ctl.Input.Text({
                id: "PTTRTA10",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttRTA10.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttRTA10.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttRTA10.setValue(newValue);
                });

            me.pttDTC20 = new ui.ctl.Input.Text({
                id: "PTTDTC20",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttDTC20.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttDTC20.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttDTC20.setValue(newValue);
                });

            me.pttRTC30 = new ui.ctl.Input.Text({
                id: "PTTRTC30",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttRTC30.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttRTC30.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttRTC30.setValue(newValue);
                });

            me.pttTPPH = new ui.ctl.Input.Text({
                id: "PTTTPPH",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttTPPH.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttTPPH.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttTPPH.setValue(newValue);
                });

            me.pttTPPD = new ui.ctl.Input.Text({
                id: "PTTTPPD",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttTPPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttTPPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttTPPD.setValue(newValue);
                });

            me.pttITPPD = new ui.ctl.Input.Text({
                id: "PTTITPPD",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttITPPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttITPPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttITPPD.setValue(newValue);
                });

            me.pttCancellation = new ui.ctl.Input.Text({
                id: "PTTCancellation",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttCancellation.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttCancellation.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttCancellation.setValue(newValue);
                });

            me.pttDelay = new ui.ctl.Input.Text({
                id: "PTTDelay",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttDelay.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttDelay.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttDelay.setValue(newValue);
                });

            me.pttDischarges = new ui.ctl.Input.Text({
                id: "PTTDischarges",
                maxLength: 19,
                appendToId: "PTTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.pttDischarges.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.pttDischarges.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.pttDischarges.setValue(newValue);
                });

            me.ptTeleTrackingGrid.addColumn("pttMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.pttMetricTypeTitle);
            me.ptTeleTrackingGrid.addColumn("pttOnTimeScheduled", "onTimeScheduled", "On Time Scheduled (%)", "On Time Scheduled (%)", 170, null, me.pttOnTimeScheduled);
            me.ptTeleTrackingGrid.addColumn("pttRTA10", "rta10", "RTA 10 (%)", "RTA 10 (%)", 150, null, me.pttRTA10);
            me.ptTeleTrackingGrid.addColumn("pttDTC20", "dtc20", "DTC 20 (%)", "DTC 20 (%)", 150, null, me.pttDTC20);
            me.ptTeleTrackingGrid.addColumn("pttRTC30", "rtc30", "RTC 30 (%)", "RTC 30 (%)", 150, null, me.pttRTC30);
            me.ptTeleTrackingGrid.addColumn("pttTPPH", "tpph", "TPPH", "TPPH", 150, null, me.pttTPPH);
            me.ptTeleTrackingGrid.addColumn("pttTPPD", "tppd", "TPPD", "TPPD", 150, null, me.pttTPPD);
            me.ptTeleTrackingGrid.addColumn("pttITPPD", "itppd", "ITPPD", "ITPPD", 150, null, me.pttITPPD);
            me.ptTeleTrackingGrid.addColumn("pttCancellation", "cancellation", "Cancellation (%)", "Cancellation (%)", 150, null, me.pttCancellation);
            me.ptTeleTrackingGrid.addColumn("pttDelay", "delay", "Delay (%)", "Delay (%)", 150, null, me.pttDelay);
            me.ptTeleTrackingGrid.addColumn("pttDischarges", "discharges", "Discharges (%)", "Discharges (%)", 150, null, me.pttDischarges);
            me.ptTeleTrackingGrid.capColumns();

            me.evsNonTeleTrackingGrid = new ui.ctl.Grid({
                id: "EVSNonTeleTrackingGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.evsNonTeleTrackingItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.evsnMetricTypeTitle = new ui.ctl.Input.Text({
                id: "EVSNMetricTypeTitle",
                appendToId: "EVSNonTeleTrackingGridControlHolder"
            });

            me.evsnRTA30 = new ui.ctl.Input.Text({
                id: "EVSNRTA30",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnRTA30.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnRTA30.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnRTA30.setValue(newValue);
                });

            me.evsnRTC60 = new ui.ctl.Input.Text({
                id: "EVSNRTC60",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnRTC60.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnRTC60.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnRTC60.setValue(newValue);
                });

            me.evsnTotalTurnTime = new ui.ctl.Input.Text({
                id: "EVSNTotalTurnTime",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnTotalTurnTime.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnTotalTurnTime.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnTotalTurnTime.setValue(newValue);
                });

            me.evsnVacancies = new ui.ctl.Input.Text({
                id: "EVSNVacancies",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnVacancies.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnVacancies.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnVacancies.setValue(newValue);
                });

            me.evsnSquareFeetPerProductiveManHour = new ui.ctl.Input.Text({
                id: "EVSNSquareFeetPerProductiveManHour",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnSquareFeetPerProductiveManHour.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnSquareFeetPerProductiveManHour.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnSquareFeetPerProductiveManHour.setValue(newValue);
                });

            me.evsnCostPerAPD = new ui.ctl.Input.Text({
                id: "EVSNCostPerAPD",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnCostPerAPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnCostPerAPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnCostPerAPD.setValue(newValue);
                });

            me.evsnProductiveHoursWorkedPerAPD = new ui.ctl.Input.Text({
                id: "EVSNProductiveHoursWorkedPerAPD",
                maxLength: 19,
                appendToId: "EVSNonTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsnProductiveHoursWorkedPerAPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evsnProductiveHoursWorkedPerAPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evsnProductiveHoursWorkedPerAPD.setValue(newValue);
                });

            me.evsNonTeleTrackingGrid.addColumn("evsnMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.evsnMetricTypeTitle);
            me.evsNonTeleTrackingGrid.addColumn("evsnRTA30", "rta30", "RTA 30 (%)", "RTA 30 (%)", 150, null, me.evsnRTA30);
            me.evsNonTeleTrackingGrid.addColumn("evsnRTC60", "rtc60", "RTC 60 (%)", "RTC 60 (%)", 150, null, me.evsnRTC60);
            me.evsNonTeleTrackingGrid.addColumn("evsnTotalTurnTime", "totalTurnTime", "Total Turn Time", "Total Turn Time", 150, null, me.evsnTotalTurnTime);
            me.evsNonTeleTrackingGrid.addColumn("evsnVacancies", "vacancies", "# of Vacancies (%)", "# of Vacancies (%)", 150, null, me.evsnVacancies);
            me.evsNonTeleTrackingGrid.addColumn("evsnSquareFeetPerProductiveManHour", "squareFeetPerProductiveManHour", "Sqft Per Productive Man Hour", "Sqft Per Productive Man Hour", 250, null, me.evsnSquareFeetPerProductiveManHour);
            me.evsNonTeleTrackingGrid.addColumn("evsnCostPerAPD", "costPerAPD", "Cost per APD", "Cost per APD", 150, null, me.evsnCostPerAPD);
            me.evsNonTeleTrackingGrid.addColumn("evsnProductiveHoursWorkedPerAPD", "productiveHoursWorkedPerAPD", "Productive Hours Worked per APD", "Productive Hours Worked per APD", 250, null, me.evsnProductiveHoursWorkedPerAPD);
            me.evsNonTeleTrackingGrid.capColumns();

            me.evsTeleTrackingGrid = new ui.ctl.Grid({
                id: "EVSTeleTrackingGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.evsTeleTrackingItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.evstMetricTypeTitle = new ui.ctl.Input.Text({
                id: "EVSTMetricTypeTitle",
                appendToId: "EVSTeleTrackingGridControlHolder"
            });

            me.evstRTA30 = new ui.ctl.Input.Text({
                id: "EVSTRTA30",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstRTA30.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstRTA30.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstRTA30.setValue(newValue);
                });

            me.evstRTC60 = new ui.ctl.Input.Text({
                id: "EVSTRTC60",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstRTC60.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstRTC60.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstRTC60.setValue(newValue);
                });

            me.evstTotalTurnTime = new ui.ctl.Input.Text({
                id: "EVSTTotalTurnTime",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstTotalTurnTime.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstTotalTurnTime.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstTotalTurnTime.setValue(newValue);
                });

            me.evstVacancies = new ui.ctl.Input.Text({
                id: "EVSTVacancies",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstVacancies.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstVacancies.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstVacancies.setValue(newValue);
                });

            me.evstSquareFeetPerProductiveManHour = new ui.ctl.Input.Text({
                id: "EVSTSquareFeetPerProductiveManHour",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstSquareFeetPerProductiveManHour.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstSquareFeetPerProductiveManHour.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstSquareFeetPerProductiveManHour.setValue(newValue);
                });

            me.evstCostPerAPD = new ui.ctl.Input.Text({
                id: "EVSTCostPerAPD",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstCostPerAPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstCostPerAPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstCostPerAPD.setValue(newValue);
                });

            me.evstProductiveHoursWorkedPerAPD = new ui.ctl.Input.Text({
                id: "EVSTProductiveHoursWorkedPerAPD",
                maxLength: 19,
                appendToId: "EVSTeleTrackingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evstProductiveHoursWorkedPerAPD.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.evstProductiveHoursWorkedPerAPD.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(3);

                    if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.evstProductiveHoursWorkedPerAPD.setValue(newValue);
                });

            me.evsTeleTrackingGrid.addColumn("evstMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.evstMetricTypeTitle);
            me.evsTeleTrackingGrid.addColumn("evstRTA30", "rta30", "RTA 30 (%)", "RTA 30 (%)", 150, null, me.evstRTA30);
            me.evsTeleTrackingGrid.addColumn("evstRTC60", "rtc60", "RTC 60 (%)", "RTC 60 (%)", 150, null, me.evstRTC60);
            me.evsTeleTrackingGrid.addColumn("evstTotalTurnTime", "totalTurnTime", "Total Turn Time", "Total Turn Time", 150, null, me.evstTotalTurnTime);
            me.evsTeleTrackingGrid.addColumn("evstVacancies", "vacancies", "# of Vacancies (%)", "# of Vacancies (%)", 150, null, me.evstVacancies);
            me.evsTeleTrackingGrid.addColumn("evstSquareFeetPerProductiveManHour", "squareFeetPerProductiveManHour", "Sqft Per Productive Man Hour", "Sqft Per Productive Man Hour", 250, null, me.evstSquareFeetPerProductiveManHour);
            me.evsTeleTrackingGrid.addColumn("evstCostPerAPD", "costPerAPD", "Cost per APD", "Cost per APD", 150, null, me.evstCostPerAPD);
            me.evsTeleTrackingGrid.addColumn("evstProductiveHoursWorkedPerAPD", "productiveHoursWorkedPerAPD", "Productive Hours Worked per APD", "Productive Hours Worked per APD", 250, null, me.evstProductiveHoursWorkedPerAPD);
            me.evsTeleTrackingGrid.capColumns();
        },

        configureCommunications: function() {
            var me = this;

            me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.hcm.metricSetup.FiscalYear,
                itemConstructorArgs: fin.hcm.metricSetup.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

            me.ptMetricTypes = [];
            me.ptMetricTypeStore = me.cache.register({
                storeId: "ptMetricTypes",
                itemConstructor: fin.hcm.metricSetup.PTMetricType,
                itemConstructorArgs: fin.hcm.metricSetup.ptMetricTypeArgs,
                injectionArray: me.ptMetricTypes
            });

            me.evsMetricTypes = [];
            me.evsMetricTypeStore = me.cache.register({
                storeId: "evsMetricTypes",
                itemConstructor: fin.hcm.metricSetup.EVSMetricType,
                itemConstructorArgs: fin.hcm.metricSetup.evsMetricTypeArgs,
                injectionArray: me.evsMetricTypes
            });

            me.ptStandardMetrics = [];
            me.ptStandardMetricStore = me.cache.register({
                storeId: "ptStandardMetrics",
                itemConstructor: fin.hcm.metricSetup.PTStandardMetric,
                itemConstructorArgs: fin.hcm.metricSetup.ptStandardMetricArgs,
                injectionArray: me.ptStandardMetrics,
                lookupSpec: { ptMetricType: me.ptMetricTypes }
            });

            me.evsStandardMetrics = [];
            me.evsStandardMetricStore = me.cache.register({
                storeId: "evsStandardMetrics",
                itemConstructor: fin.hcm.metricSetup.EVSStandardMetric,
                itemConstructorArgs: fin.hcm.metricSetup.evsStandardMetricArgs,
                injectionArray: me.evsStandardMetrics,
                lookupSpec: { evsMetricType: me.evsMetricTypes }
            });
        },

        initialize: function() {
            var me = this;

            $("#TabCollection a").mousedown(function() {
                me.activeFrameId = 0;

                if (this.id === "TabPTSetup")
                    me.activeFrameId = 1;
                else if (this.id === "TabEVSSetup")
                    me.activeFrameId = 2;

                $("#container-1").tabs(me.activeFrameId);
                $("#container-1").triggerTab(me.activeFrameId);
                setTimeout(function () {
                    me.resizeControls(me.activeFrameId);
                }, 100);
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

        resizeControls: function(selectedTab) {
            var me = this;

             if (selectedTab === 1) {
                if ($("#PTNonTeleTrackingGridContainer").width() < 1800) {
                    $("#PTNonTeleTrackingGrid").width(1800);
                }
                if ($("#PTTeleTrackingGridContainer").width() < 1800) {
                    $("#PTTeleTrackingGrid").width(1800);
                }
                me.ptNonTeleTrackingGrid.setHeight(200);
                me.ptTeleTrackingGrid.setHeight(200);
            }
            else if (selectedTab === 2) {
                 if ($("#EVSNonTeleTrackingGridContainer").width() < 1600) {
                     $("#EVSNonTeleTrackingGrid").width(1600);
                 }
                 if ($("#EVSTeleTrackingGridContainer").width() < 1600) {
                     $("#EVSTeleTrackingGrid").width(1600);
                 }
                 me.evsNonTeleTrackingGrid.setHeight(200);
                 me.evsTeleTrackingGrid.setHeight(200);
            }
        },

        ptMetricTypesLoaded: function(me, activeId) {

        },

        evsMetricTypesLoaded: function(me, activeId) {

        },

        fiscalYearsLoaded: function(me, activeId) {

            me.year.setData(me.fiscalYears);
            me.year.select(0, me.year.focused);
            me.yearChanged();
        },

        yearChanged: function() {
            var me = this;

            if (me.year.indexSelected === -1)
                return;

            me.setLoadCount();
            me.ptStandardMetricStore.reset();
            me.ptStandardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.ptStandardMetricsLoaded, me);
            me.evsStandardMetricStore.reset();
            me.evsStandardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.evsStandardMetricsLoaded, me);
        },

        ptStandardMetricsLoaded: function(me, activeId) {
            var item = [];
            var index = 0;

            me.ptNonTeleTrackings = [];
            me.ptTeleTrackings = [];

            if (me.ptNonTeleTrackingGrid.activeRowIndex !== - 1)
                me.ptNonTeleTrackingGrid.body.deselect(me.ptNonTeleTrackingGrid.activeRowIndex, true);
            if (me.ptTeleTrackingGrid.activeRowIndex !== - 1)
                me.ptTeleTrackingGrid.body.deselect(me.ptTeleTrackingGrid.activeRowIndex, true);

            if (me.ptStandardMetrics.length === 0) {
                for (index = 0; index < me.ptMetricTypes.length; index++) {
                    if (me.ptMetricTypes[index].subType === "Thresholds - In House") {
                        item = new fin.hcm.metricSetup.PTNonTeleTracking(0
                            , me.fiscalYears[me.year.indexSelected].id
                            , me.ptMetricTypes[index]
                            , me.ptMetricTypes[index].title
                            );
                        me.ptNonTeleTrackings.push(item);
                    }
                    else if (me.ptMetricTypes[index].subType === "Thresholds - Third Party") {
                        item = new fin.hcm.metricSetup.PTTeleTracking(0
                            , me.fiscalYears[me.year.indexSelected].id
                            , me.ptMetricTypes[index]
                            , me.ptMetricTypes[index].title
                            );
                        me.ptTeleTrackings.push(item);
                    }
                }
            }
            else {
                for (index = 0; index < me.ptStandardMetrics.length; index++) {
                    if (me.ptStandardMetrics[index].ptMetricType.subType === "Thresholds - In House") {
                        item = new fin.hcm.metricSetup.PTNonTeleTracking(me.ptStandardMetrics[index].id
                            , me.ptStandardMetrics[index].yearId
                            , me.ptStandardMetrics[index].ptMetricType
                            , me.ptStandardMetrics[index].ptMetricType.title
                            , me.ptStandardMetrics[index].onTimeScheduled
                            , me.ptStandardMetrics[index].rta10
                            , me.ptStandardMetrics[index].dtc20
                            , me.ptStandardMetrics[index].rtc30
                            , me.ptStandardMetrics[index].tpph
                            , me.ptStandardMetrics[index].tppd
                            , me.ptStandardMetrics[index].itppd
                            , me.ptStandardMetrics[index].cancellation
                            , me.ptStandardMetrics[index].delay
                            , me.ptStandardMetrics[index].discharges
                            );
                        me.ptNonTeleTrackings.push(item);
                    }
                    else if (me.ptStandardMetrics[index].ptMetricType.subType === "Thresholds - Third Party") {
                        item = new fin.hcm.metricSetup.PTTeleTracking(me.ptStandardMetrics[index].id
                            , me.ptStandardMetrics[index].yearId
                            , me.ptStandardMetrics[index].ptMetricType
                            , me.ptStandardMetrics[index].ptMetricType.title
                            , me.ptStandardMetrics[index].onTimeScheduled
                            , me.ptStandardMetrics[index].rta10
                            , me.ptStandardMetrics[index].dtc20
                            , me.ptStandardMetrics[index].rtc30
                            , me.ptStandardMetrics[index].tpph
                            , me.ptStandardMetrics[index].tppd
                            , me.ptStandardMetrics[index].itppd
                            , me.ptStandardMetrics[index].cancellation
                            , me.ptStandardMetrics[index].delay
                            , me.ptStandardMetrics[index].discharges
                            );
                        me.ptTeleTrackings.push(item);
                    }
                }

                for (index = 0; index < me.ptMetricTypes.length; index++) {
                    if (me.ptMetricTypes[index].subType === "Thresholds - In House") {
                        var result = $.grep(me.ptStandardMetrics, function(item) { return item.ptMetricType.id === me.ptMetricTypes[index].id; });
                        if (result.length === 0)
                            me.ptNonTeleTrackings.push(new fin.hcm.metricSetup.PTNonTeleTracking(0
                                , me.fiscalYears[me.year.indexSelected].id
                                , me.ptMetricTypes[index]
                                , me.ptMetricTypes[index].title
                                ));
                    }
                    else if (me.ptMetricTypes[index].subType === "Thresholds - Third Party") {
                        var result = $.grep(me.ptStandardMetrics, function(item) { return item.ptMetricType.id === me.ptMetricTypes[index].id; });
                        if (result.length === 0)
                            me.ptTeleTrackings.push(new fin.hcm.metricSetup.PTTeleTracking(0
                                , me.fiscalYears[me.year.indexSelected].id
                                , me.ptMetricTypes[index]
                                , me.ptMetricTypes[index].title
                                ));
                    }
                }
            }

            me.ptNonTeleTrackingGrid.setData(me.ptNonTeleTrackings);
            me.ptTeleTrackingGrid.setData(me.ptTeleTrackings);
            me.checkLoadCount();
        },

        evsStandardMetricsLoaded: function(me, activeId) {
            var item = [];
            var index = 0;

            me.evsNonTeleTrackings = [];
            me.evsTeleTrackings = [];

            if (me.evsNonTeleTrackingGrid.activeRowIndex !== - 1)
                me.evsNonTeleTrackingGrid.body.deselect(me.evsNonTeleTrackingGrid.activeRowIndex, true);
            if (me.evsTeleTrackingGrid.activeRowIndex !== - 1)
                me.evsTeleTrackingGrid.body.deselect(me.evsTeleTrackingGrid.activeRowIndex, true);

            if (me.evsStandardMetrics.length === 0) {
                for (index = 0; index < me.evsMetricTypes.length; index++) {
                    if (me.evsMetricTypes[index].subType === "Non-TeleTracking") {
                        item = new fin.hcm.metricSetup.EVSNonTeleTracking(0
                            , me.fiscalYears[me.year.indexSelected].id
                            , me.evsMetricTypes[index]
                            , me.evsMetricTypes[index].title
                        );
                        me.evsNonTeleTrackings.push(item);
                    }
                    else if (me.evsMetricTypes[index].subType === "TeleTracking") {
                        item = new fin.hcm.metricSetup.EVSTeleTracking(0
                            , me.fiscalYears[me.year.indexSelected].id
                            , me.evsMetricTypes[index]
                            , me.evsMetricTypes[index].title
                        );
                        me.evsTeleTrackings.push(item);
                    }
                }
            }
            else {
                for (index = 0; index < me.evsStandardMetrics.length; index++) {
                    if (me.evsStandardMetrics[index].evsMetricType.subType === "Non-TeleTracking") {
                        item = new fin.hcm.metricSetup.EVSNonTeleTracking(me.evsStandardMetrics[index].id
                            , me.evsStandardMetrics[index].yearId
                            , me.evsStandardMetrics[index].evsMetricType
                            , me.evsStandardMetrics[index].evsMetricType.title
                            , me.evsStandardMetrics[index].rta30
                            , me.evsStandardMetrics[index].rtc60
                            , me.evsStandardMetrics[index].totalTurnTime
                            , me.evsStandardMetrics[index].vacancies
                            , me.evsStandardMetrics[index].squareFeetPerProductiveManHour
                            , me.evsStandardMetrics[index].costPerAPD
                            , me.evsStandardMetrics[index].productiveHoursWorkedPerAPD
                        );
                        me.evsNonTeleTrackings.push(item);
                    }
                    else if (me.evsStandardMetrics[index].evsMetricType.subType === "TeleTracking") {
                        item = new fin.hcm.metricSetup.EVSTeleTracking(me.evsStandardMetrics[index].id
                            , me.evsStandardMetrics[index].yearId
                            , me.evsStandardMetrics[index].evsMetricType
                            , me.evsStandardMetrics[index].evsMetricType.title
                            , me.evsStandardMetrics[index].rta30
                            , me.evsStandardMetrics[index].rtc60
                            , me.evsStandardMetrics[index].totalTurnTime
                            , me.evsStandardMetrics[index].vacancies
                            , me.evsStandardMetrics[index].squareFeetPerProductiveManHour
                            , me.evsStandardMetrics[index].costPerAPD
                            , me.evsStandardMetrics[index].productiveHoursWorkedPerAPD
                        );
                        me.evsTeleTrackings.push(item);
                    }
                }

                for (index = 0; index < me.evsMetricTypes.length; index++) {
                    if (me.evsMetricTypes[index].subType === "Non-TeleTracking") {
                        var result = $.grep(me.evsStandardMetrics, function(item) { return item.evsMetricType.id === me.evsMetricTypes[index].id; });
                        if (result.length === 0)
                            me.evsNonTeleTrackings.push(new fin.hcm.metricSetup.EVSNonTeleTracking(0
                                , me.fiscalYears[me.year.indexSelected].id
                                , me.evsMetricTypes[index]
                                , me.evsMetricTypes[index].title
                            ));
                    }
                    else if (me.evsMetricTypes[index].subType === "TeleTracking") {
                        var result = $.grep(me.evsStandardMetrics, function(item) { return item.evsMetricType.id === me.evsMetricTypes[index].id; });
                        if (result.length === 0)
                            me.evsTeleTrackings.push(new fin.hcm.metricSetup.EVSTeleTracking(0
                                , me.fiscalYears[me.year.indexSelected].id
                                , me.evsMetricTypes[index]
                                , me.evsMetricTypes[index].title
                            ));
                    }
                }
            }

            me.evsNonTeleTrackingGrid.setData(me.evsNonTeleTrackings);
            me.evsTeleTrackingGrid.setData(me.evsTeleTrackings);
            me.checkLoadCount();
        },

        // This is a comparison function that will result in data being sorted in display order.
        customSort: function(a, b) {
            if (a.ptMetricType.displayOrder > b.ptMetricType.displayOrder)
                return 1;
            if (a.ptMetricType.displayOrder < b.ptMetricType.displayOrder)
                return -1;
            return 0;
        },

        validateControl: function(control, activeGrid) {
            var enteredText = control.getValue();

            if (enteredText === "" || activeGrid.activeRowIndex === -1)
                return;

            var dataType = activeGrid.data[activeGrid.activeRowIndex].ptMetricType.dataType;
            if (dataType === "Decimal") {
                var newValue = parseFloat(enteredText).toFixed(2);

                if (!(/^\d{1,16}(\.\d{1,2})?$/.test(newValue)))
                    control.setInvalid("Please enter numeric value.");
                else if (newValue !== enteredText)
                    control.setValue(newValue);
            }
            else if ((dataType === "Integer") && !(/^\d+$/.test(enteredText))) {
                control.setInvalid("Please enter valid number.");
            }
        },

        ptNonTeleTrackingItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.ptNonTeleTrackingGrid.data[index] !== undefined) {
                me.ptNonTeleTrackingGrid.data[index].modified = true;
                me.ptnOnTimeScheduled.text.select();
                me.ptnOnTimeScheduled.text.focus();
                me.ptnMetricTypeTitle.text.readOnly = true;
            }
        },

        ptTeleTrackingItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.ptTeleTrackingGrid.data[index] !== undefined) {
                me.ptTeleTrackingGrid.data[index].modified = true;
                me.pttOnTimeScheduled.text.select();
                me.pttOnTimeScheduled.text.focus();
                me.pttMetricTypeTitle.text.readOnly = true;
            }
        },

        evsNonTeleTrackingItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.evsNonTeleTrackingGrid.data[index] !== undefined) {
                me.evsNonTeleTrackingGrid.data[index].modified = true;
                me.evsnRTA30.text.select();
                me.evsnRTA30.text.focus();
                me.evsnMetricTypeTitle.text.readOnly = true;
            }
        },

        evsTeleTrackingItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.evsTeleTrackingGrid.data[index] !== undefined) {
                me.evsTeleTrackingGrid.data[index].modified = true;
                me.evstRTA30.text.select();
                me.evstRTA30.text.focus();
                me.evstMetricTypeTitle.text.readOnly = true;
            }
        },

        actionUndoItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            me.yearChanged();
        },

        actionSaveItem: function() {
            var me = this;
            var item = [];

            // Check to see if the data entered is valid
            me.ptNonTeleTrackingGrid.body.deselectAll();
            me.ptTeleTrackingGrid.body.deselectAll();
            me.evsNonTeleTrackingGrid.body.deselectAll();
            me.evsTeleTrackingGrid.body.deselectAll();

            me.validator.forceBlur();
            me.validator.queryValidity(true);

            if (!me.year.valid) {
                alert("In order to save, the errors on the page must be corrected.");
                return false;
            }
            if (me.ptTabShow && (me.ptNonTeleTrackingGrid.activeRowIndex >= 0 || me.ptTeleTrackingGrid.activeRowIndex >= 0)) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on PT tab.");
                return false;
            }
            if (me.evsTabShow && (me.evsNonTeleTrackingGrid.activeRowIndex >= 0 || me.evsTeleTrackingGrid.activeRowIndex >= 0)) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on EVS tab.");
                return false;
            }

            var xml = me.saveXmlBuild();

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
            var index = 0;
            var xml = "";

            if (me.ptTabShow) {
                for (index = 0; index < me.ptNonTeleTrackings.length; index++) {
                    if (me.ptNonTeleTrackings[index].modified || me.ptNonTeleTrackings[index].id === 0) {
                        me.ptNonTeleTrackings[index].modified = false;
                        if (me.ptNonTeleTrackings[index].id === 0)
                            me.reloadData = true;
                        xml += '<ptStandardMetric';
                        xml += ' id="' + me.ptNonTeleTrackings[index].id + '"';
                        xml += ' yearId="' + me.ptNonTeleTrackings[index].yearId + '"';
                        xml += ' ptMetricTypeId="' + me.ptNonTeleTrackings[index].ptMetricType.id + '"';
                        xml += ' onTimeScheduled="' + me.ptNonTeleTrackings[index].onTimeScheduled + '"';
                        xml += ' rta10="' + me.ptNonTeleTrackings[index].rta10 + '"';
                        xml += ' dtc20="' + me.ptNonTeleTrackings[index].dtc20 + '"';
                        xml += ' rtc30="' + me.ptNonTeleTrackings[index].rtc30 + '"';
                        xml += ' tpph="' + me.ptNonTeleTrackings[index].tpph + '"';
                        xml += ' tppd="' + me.ptNonTeleTrackings[index].tppd + '"';
                        xml += ' itppd="' + me.ptNonTeleTrackings[index].itppd + '"';
                        xml += ' cancellation="' + me.ptNonTeleTrackings[index].cancellation + '"';
                        xml += ' delay="' + me.ptNonTeleTrackings[index].delay + '"';
                        xml += ' discharges="' + me.ptNonTeleTrackings[index].discharges + '"';
                        xml += '/>';
                    }
                }

                for (index = 0; index < me.ptTeleTrackings.length; index++) {
                    if (me.ptTeleTrackings[index].modified || me.ptTeleTrackings[index].id === 0) {
                        me.ptTeleTrackings[index].modified = false;
                        if (me.ptTeleTrackings[index].id === 0)
                            me.reloadData = true;
                        xml += '<ptStandardMetric';
                        xml += ' id="' + me.ptTeleTrackings[index].id + '"';
                        xml += ' yearId="' + me.ptTeleTrackings[index].yearId + '"';
                        xml += ' ptMetricTypeId="' + me.ptTeleTrackings[index].ptMetricType.id + '"';
                        xml += ' onTimeScheduled="' + me.ptTeleTrackings[index].onTimeScheduled + '"';
                        xml += ' rta10="' + me.ptTeleTrackings[index].rta10 + '"';
                        xml += ' dtc20="' + me.ptTeleTrackings[index].dtc20 + '"';
                        xml += ' rtc30="' + me.ptTeleTrackings[index].rtc30 + '"';
                        xml += ' tpph="' + me.ptTeleTrackings[index].tpph + '"';
                        xml += ' tppd="' + me.ptTeleTrackings[index].tppd + '"';
                        xml += ' itppd="' + me.ptTeleTrackings[index].itppd + '"';
                        xml += ' cancellation="' + me.ptTeleTrackings[index].cancellation + '"';
                        xml += ' delay="' + me.ptTeleTrackings[index].delay + '"';
                        xml += ' discharges="' + me.ptTeleTrackings[index].discharges + '"';
                        xml += '/>';
                    }
                }
            }

            if (me.evsTabShow) {
                for (index = 0; index < me.evsNonTeleTrackings.length; index++) {
                    if (me.evsNonTeleTrackings[index].modified || me.evsNonTeleTrackings[index].id === 0) {
                        me.evsNonTeleTrackings[index].modified = false;
                        if (me.evsNonTeleTrackings[index].id === 0)
                            me.reloadData = true;
                        xml += '<evsStandardMetric';
                        xml += ' id="' + me.evsNonTeleTrackings[index].id + '"';
                        xml += ' yearId="' + me.evsNonTeleTrackings[index].yearId + '"';
                        xml += ' evsMetricTypeId="' + me.evsNonTeleTrackings[index].evsMetricType.id + '"';
                        xml += ' rta30="' + me.evsNonTeleTrackings[index].rta30 + '"';
                        xml += ' rtc60="' + me.evsNonTeleTrackings[index].rtc60 + '"';
                        xml += ' totalTurnTime="' + me.evsNonTeleTrackings[index].totalTurnTime + '"';
                        xml += ' vacancies="' + me.evsNonTeleTrackings[index].vacancies + '"';
                        xml += ' squareFeetPerProductiveManHour="' + me.evsNonTeleTrackings[index].squareFeetPerProductiveManHour + '"';
                        xml += ' costPerAPD="' + me.evsNonTeleTrackings[index].costPerAPD + '"';
                        xml += ' productiveHoursWorkedPerAPD="' + me.evsNonTeleTrackings[index].productiveHoursWorkedPerAPD + '"';
                        xml += '/>';
                    }
                }

                for (index = 0; index < me.evsTeleTrackings.length; index++) {
                    if (me.evsTeleTrackings[index].modified || me.evsTeleTrackings[index].id === 0) {
                        me.evsTeleTrackings[index].modified = false;
                        if (me.evsTeleTrackings[index].id === 0)
                            me.reloadData = true;
                        xml += '<evsStandardMetric';
                        xml += ' id="' + me.evsTeleTrackings[index].id + '"';
                        xml += ' yearId="' + me.evsTeleTrackings[index].yearId + '"';
                        xml += ' evsMetricTypeId="' + me.evsTeleTrackings[index].evsMetricType.id + '"';
                        xml += ' rta30="' + me.evsTeleTrackings[index].rta30 + '"';
                        xml += ' rtc60="' + me.evsTeleTrackings[index].rtc60 + '"';
                        xml += ' totalTurnTime="' + me.evsTeleTrackings[index].totalTurnTime + '"';
                        xml += ' vacancies="' + me.evsTeleTrackings[index].vacancies + '"';
                        xml += ' squareFeetPerProductiveManHour="' + me.evsTeleTrackings[index].squareFeetPerProductiveManHour + '"';
                        xml += ' costPerAPD="' + me.evsTeleTrackings[index].costPerAPD + '"';
                        xml += ' productiveHoursWorkedPerAPD="' + me.evsTeleTrackings[index].productiveHoursWorkedPerAPD + '"';
                        xml += '/>';
                    }
                }
            }

            return xml;
        },

        saveResponse: function(){
            var args = ii.args(arguments, {
                transaction: { type: ii.ajax.TransactionMonitor.Transaction },
                xmlNode: { type: "XmlNode:transaction" }
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var status = $(args.xmlNode).attr("status");

            if (status === "success") {
                me.modified(false);
                me.setStatus("Saved");
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while updating metric setup: " + $(args.xmlNode).attr("message"));
            }

            if (!me.reloadData)
                $("#pageLoading").fadeOut("slow");
            else {
                me.ptStandardMetricStore.reset();
                me.ptStandardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.ptStandardMetricsLoaded, me);
                me.evsStandardMetricStore.reset();
                me.evsStandardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.evsStandardMetricsLoaded, me);
            }
        }
    }
});

function main() {
    fin.hcm.hcmMetricSetupUi = new fin.hcm.metricSetup.UserInterface();
    fin.hcm.hcmMetricSetupUi.resize();
}
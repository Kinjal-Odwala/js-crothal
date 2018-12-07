ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.bud.snapshot.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.button", 8 );
ii.Style( "fin.cmn.usr.theme", 9 );
ii.Style( "fin.cmn.usr.core", 10 );
ii.Style( "fin.cmn.usr.multiselect", 11 );
ii.Style( "fin.cmn.usr.angular.css.typeahead", 12 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() {
    var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() {
    var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; });
}

ii.Class({
    Name: "fin.bud.snapshot.UserInterface",
    Definition: {

        init: function() {
            var me = this;

            me.currentPeriod = parent.fin.appUI.glbFscPeriod;
            me.currentPeriodTitle = parent.fin.appUI.glbPeriod;
            me.periods = [];
            me.revenueAccounts = [];
            me.revenueItems = [];
            me.totalItems = [];
            me.loadCount = 0;
            me.periodId = 0;
            me.revenue = 0;
            me.action = "";
            me.reloadData = false;
			me.viewMOPClicked = false;
			me.snapshotLocked = false;

            me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
                me.gateway
                , function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
            );

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);

            me.authorizer = new ii.ajax.Authorizer( me.gateway );
            me.authorizePath = "\\crothall\\chimes\\fin\\Budgeting\\ForecastSnapshot";
            me.authorizer.authorize([me.authorizePath],
                function authorizationsLoaded() {
                    me.authorizationProcess.apply(me);
                },
                me);

            me.defineFormControls();
            me.configureCommunications();
            me.initialize();
            me.resetControls();
            me.setStatus("Loading");
            me.modified(false);

            $(window).bind("resize", me, me.resize);

            if (top.ui.ctl.menu) {
                top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
            }
        },

        authorizationProcess: function() {
            var me = this;

            me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
            me.unlockSnapshot = me.authorizer.isAuthorized(me.authorizePath + "\\UnlockSnapshot");

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
                me.loadCount = 4;
                me.session.registerFetchNotify(me.sessionLoaded, me);
                me.year.fetchingData();
                me.houseCodeStore.fetch("userId:[user],appUnitBrief:", me.houseCodesLoaded, me);
                me.divisionStore.fetch("userId:[user]", me.divisionsLoaded, me);
                me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
                me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {
            var me = fin.snapshotUi;

            me.snapshotGrid.setHeight($(window).height() - 160);

            if ($("#SnapshotDetailGridContainer").width() < 2000) {
                $("#RevenueGrid").width(2000);
                $("#TotalGrid").width(2000);
                $("#CostCenterGrid").width(2000);
                $("#AccountGrid").width(2000);
            }

            me.revenueGrid.setHeight(150);
            me.totalGrid.setHeight(150);
            me.costCenterGrid.setHeight($(window).height() - 275);
            if (me.accountGrid !== undefined)
                me.accountGrid.setHeight($(window).height() - 275);
        },

        defineFormControls: function() {
            var me = this;

            me.anchorLoad = new ui.ctl.buttons.Sizeable({
                id: "AnchorLoad",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
                clickFunction: function() { me.loadSnapshots(); },
                hasHotState: true
            });

            me.anchorCompare = new ui.ctl.buttons.Sizeable({
                id: "AnchorCompare",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Compare&nbsp;&nbsp;</span>",
                clickFunction: function() { me.compareSnapshots(); },
                hasHotState: true
            });

            me.anchorCreateSnapshot = new ui.ctl.buttons.Sizeable({
                id: "AnchorCreateSnapshot",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Create Snapshot&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionCreateSnapshotItem(); },
                hasHotState: true
            });

            me.anchorLockSnapshot = new ui.ctl.buttons.Sizeable({
                id: "AnchorLockSnapshot",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Lock Snapshot&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionLockSnapshotItem(); },
                hasHotState: true
            });

            me.anchorUnlockRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorUnlockRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Unlock Request&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionUnlockRequestItem(); },
                hasHotState: true
            });

			me.anchorDeleteSnapshot = new ui.ctl.buttons.Sizeable({
                id: "AnchorDeleteSnapshot",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Delete Snapshot&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionDeleteSnapshotItem(); },
                hasHotState: true
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

            me.AnchorSendRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorSendRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionSendRequestItem(); },
                hasHotState: true
            });

            me.anchorClose = new ui.ctl.buttons.Sizeable({
                id: "AnchorClose",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionCloseItem(); },
                hasHotState: true
            });

            me.divisionLink = new ui.ctl.buttons.Simple({
                id: "DivisionLink",
                className: "linkButton",
                clickFunction: function() { me.actionViewItem("Division"); },
                hasHotState: true
            });

            me.sectorLink = new ui.ctl.buttons.Simple({
                id: "SectorLink",
                className: "linkButton",
                clickFunction: function() { me.actionViewItem("Sector"); },
                hasHotState: true
            });

            me.costCenterLink = new ui.ctl.buttons.Simple({
                id: "CostCenterLink",
                className: "linkButton",
                clickFunction: function() { me.actionViewItem("CostCenter"); },
                hasHotState: true
            });

            $("#Division").multiselect({
                minWidth: 255
                , header: false
                , noneSelectedText: ""
                , selectedList: 4
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

            me.period = new ui.ctl.Input.DropDown.Filtered({
                id: "Period",
                formatFunction: function( type ) { return type.fscYeaTitle + " - Period " + type.title; },
                changeFunction: function() { me.periodChanged(); },
                required: false
            });

            me.period.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required )
                .addValidation( function( isFinal, dataMap ) {

                    if ((this.focused || this.touched) && me.period.indexSelected === -1)
                        this.setInvalid("Please select correct Period.");
                });

            me.budget = new ui.ctl.Input.Check({
                id: "Budget"
            });

            me.actual = new ui.ctl.Input.Check({
                id: "Actual"
            });

            me.snapshot = new ui.ctl.Input.Check({
                id: "Snapshot",
                changeFunction: function() { me.snapshotChanged(); }
            });

            me.emailId = new ui.ctl.Input.Text({
                id: "EmailId",
                maxLength: 256
            });

            me.emailId.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function (isFinal, dataMap) {

                    var enteredText = me.emailId.getValue();

                    if (enteredText === "")
                        return;

                    if (!(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText)))
                        this.setInvalid("Please enter valid Email Id.");
                });

            me.subject = new ui.ctl.Input.Text({
                id: "Subject",
                maxLength: 256
            });

            me.subject.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required);

            me.notes = $("#Notes")[0];

            me.snapshotGrid = new ui.ctl.Grid({
                id: "SnapshotGrid",
                appendToId: "divForm",
                deleteFunction: function() { return true; }
            });

            me.snapshotGrid.addColumn("name", "name", "Snapshot Period", "Snapshot Period", 200);
            me.snapshotGrid.addColumn("status", "", "Status", "Status", null, function(item) {
                if (item.id > 0) {
                    if (item.locked)
                        return "Snapshot locked by " + item.modBy + " at " + item.modAt;
                    else if (item.modBy !== "")
                        return "Snapshot modified by " + item.modBy + " at " + item.modAt;
                    else
                        return "Created by " + item.crtdBy + " at " + item.crtdAt;
                }
                else
                    return "No snapshot";
            });
            me.snapshotGrid.addColumn("action", "", "Action", "Action", 250, function(item) {
                if (item.id > 0) {
                    var action = "<a class='snapshotLink' title='View the snapshot details' onclick=\"fin.snapshotUi.actionViewSnapshot(" + item.id + ", " + item.divisionId + ", " + item.periodId + ", '" + item.name + "');\">View Snapshot</a>";
                    if (me.unlockSnapshot && item.locked && item.unlockRequested && (item.periodId === me.currentPeriod))
                        action += "<a class='snapshotLink' title='Unlock the snapshot' onclick='fin.snapshotUi.actionUnlockSnapshot(" + item.periodId + ");'>Unlock Snapshot</a>";
                    return action;
                }
                else if (item.allowCreate)
                    return "<div class='snapshotLink' title='Create the snapshot details' onclick=\"fin.snapshotUi.actionCreateSnapshot(" + item.periodId + ", '" + item.name + "');\">Create Snapshot</div>";
                else
                    return "";
            });
            me.snapshotGrid.capColumns();

            me.revenueGrid = new ui.ctl.Grid({
                id: "RevenueGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.revenueItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.revenueGrid.addColumn("rTitle", "title", "Title", "Title", null);
            me.revenueGrid.addColumn("period1", "period1", "Period 1", "Period 1", 130, function(period1) { return period1.toFixed(2); });
            me.revenueGrid.addColumn("period2", "period2", "Period 2", "Period 2", 130, function(period2) { return period2.toFixed(2); });
            me.revenueGrid.addColumn("period3", "period3", "Period 3", "Period 3", 130, function(period3) { return period3.toFixed(2); });
            me.revenueGrid.addColumn("period4", "period4", "Period 4", "Period 4", 130, function(period4) { return period4.toFixed(2); });
            me.revenueGrid.addColumn("period5", "period5", "Period 5", "Period 5", 130, function(period5) { return period5.toFixed(2); });
            me.revenueGrid.addColumn("period6", "period6", "Period 6", "Period 6", 130, function(period6) { return period6.toFixed(2); });
            me.revenueGrid.addColumn("period7", "period7", "Period 7", "Period 7", 130, function(period7) { return period7.toFixed(2); });
            me.revenueGrid.addColumn("period8", "period8", "Period 8", "Period 8", 130, function(period8) { return period8.toFixed(2); });
            me.revenueGrid.addColumn("period9", "period9", "Period 9", "Period 9", 130, function(period9) { return period9.toFixed(2); });
            me.revenueGrid.addColumn("period10", "period10", "Period 10", "Period 10", 130, function(period10) { return period10.toFixed(2); });
            me.revenueGrid.addColumn("period11", "period11", "Period 11", "Period 11", 130, function(period11) { return period11.toFixed(2); });
            me.revenueGrid.addColumn("period12", "period12", "Period 12", "Period 12", 130, function(period12) { return period12.toFixed(2); });
            me.revenueGrid.addColumn("total", "total", "Total", "Total", 130, function(total) { return total.toFixed(2); });
            me.revenueGrid.capColumns();

            me.totalGrid = new ui.ctl.Grid({
                id: "TotalGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.totalItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.totalGrid.addColumn("tTitle", "title", "Title", "Title", null);
            me.totalGrid.addColumn("tPeriod1", "period1", "Period 1", "Period 1", 130, function(period1) { return period1.toFixed(2); });
            me.totalGrid.addColumn("tPeriod2", "period2", "Period 2", "Period 2", 130, function(period2) { return period2.toFixed(2); });
            me.totalGrid.addColumn("tPeriod3", "period3", "Period 3", "Period 3", 130, function(period3) { return period3.toFixed(2); });
            me.totalGrid.addColumn("tPeriod4", "period4", "Period 4", "Period 4", 130, function(period4) { return period4.toFixed(2); });
            me.totalGrid.addColumn("tPeriod5", "period5", "Period 5", "Period 5", 130, function(period5) { return period5.toFixed(2); });
            me.totalGrid.addColumn("tPeriod6", "period6", "Period 6", "Period 6", 130, function(period6) { return period6.toFixed(2); });
            me.totalGrid.addColumn("tPeriod7", "period7", "Period 7", "Period 7", 130, function(period7) { return period7.toFixed(2); });
            me.totalGrid.addColumn("tPeriod8", "period8", "Period 8", "Period 8", 130, function(period8) { return period8.toFixed(2); });
            me.totalGrid.addColumn("tPeriod9", "period9", "Period 9", "Period 9", 130, function(period9) { return period9.toFixed(2); });
            me.totalGrid.addColumn("tPeriod10", "period10", "Period 10", "Period 10", 130, function(period10) { return period10.toFixed(2); });
            me.totalGrid.addColumn("tPeriod11", "period11", "Period 11", "Period 11", 130, function(period11) { return period11.toFixed(2); });
            me.totalGrid.addColumn("tPeriod12", "period12", "Period 12", "Period 12", 130, function(period12) { return period12.toFixed(2); });
            me.totalGrid.addColumn("tTotal", "total", "Total", "Total", 130, function(total) { return total.toFixed(2); });
            me.totalGrid.capColumns();

            me.costCenterGrid = new ui.ctl.Grid({
                id: "CostCenterGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.costCenterItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.costCenterGrid.addColumn("ccTitle", "", "Cost Center", "Cost Center", null, function(item) {
                return "<div class='snapshotLink' onclick='fin.snapshotUi.actionViewMOP(" + item.id + ");'>" + item.title + "</div>";
            });
            me.costCenterGrid.addColumn("ccPeriod1", "period1", "Period 1", "Period 1", 130, function(period1) { return period1.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod2", "period2", "Period 2", "Period 2", 130, function(period2) { return period2.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod3", "period3", "Period 3", "Period 3", 130, function(period3) { return period3.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod4", "period4", "Period 4", "Period 4", 130, function(period4) { return period4.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod5", "period5", "Period 5", "Period 5", 130, function(period5) { return period5.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod6", "period6", "Period 6", "Period 6", 130, function(period6) { return period6.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod7", "period7", "Period 7", "Period 7", 130, function(period7) { return period7.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod8", "period8", "Period 8", "Period 8", 130, function(period8) { return period8.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod9", "period9", "Period 9", "Period 9", 130, function(period9) { return period9.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod10", "period10", "Period 10", "Period 10", 130, function(period10) { return period10.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod11", "period11", "Period 11", "Period 11", 130, function(period11) { return period11.toFixed(2); });
            me.costCenterGrid.addColumn("ccPeriod12", "period12", "Period 12", "Period 12", 130, function(period12) { return period12.toFixed(2); });
            me.costCenterGrid.addColumn("ccTotal", "total", "Total", "Total", 130, function(total) { return total.toFixed(2); });
            me.costCenterGrid.capColumns();
        },

        configureCommunications: function() {
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.bud.snapshot.HirNode,
                itemConstructorArgs: fin.bud.snapshot.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.bud.snapshot.HouseCode,
                itemConstructorArgs: fin.bud.snapshot.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.houseCodeDetails = [];
            me.houseCodeDetailStore = me.cache.register({
                storeId: "houseCodes",
                itemConstructor: fin.bud.snapshot.HouseCodeDetail,
                itemConstructorArgs: fin.bud.snapshot.houseCodeDetailArgs,
                injectionArray: me.houseCodeDetails
            });

            me.divisions = [];
            me.divisionStore = me.cache.register({
                storeId: "divisions",
                itemConstructor: fin.bud.snapshot.Division,
                itemConstructorArgs: fin.bud.snapshot.divisionArgs,
                injectionArray: me.divisions
            });

            me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.bud.snapshot.FiscalYear,
                itemConstructorArgs: fin.bud.snapshot.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

            me.fiscalPeriods = [];
            me.fiscalPeriodStore = me.cache.register({
                storeId: "fiscalPeriods",
                itemConstructor: fin.bud.snapshot.FiscalPeriod,
                itemConstructorArgs: fin.bud.snapshot.fiscalPeriodArgs,
                injectionArray: me.fiscalPeriods
            });

            me.accounts = [];
            me.accountStore = me.cache.register({
                storeId: "budFscAccounts",
                itemConstructor: fin.bud.snapshot.Account,
                itemConstructorArgs: fin.bud.snapshot.accountArgs,
                injectionArray: me.accounts
            });

            me.snapshots = [];
            me.snapshotStore = me.cache.register({
                storeId: "budMopSnapshots",
                itemConstructor: fin.bud.snapshot.Snapshot,
                itemConstructorArgs: fin.bud.snapshot.snapshotArgs,
                injectionArray: me.snapshots
            });

            me.snapshotItems = [];
            me.snapshotItemStore = me.cache.register({
                storeId: "budMopSnapshotItems",
                itemConstructor: fin.bud.snapshot.SnapshotItem,
                itemConstructorArgs: fin.bud.snapshot.snapshotItemArgs,
                injectionArray: me.snapshotItems
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

            if (me.loadCount === 0)
                return;

            me.loadCount--;
            if (me.loadCount === 0) {
				if (parent.fin.appUI.modified)
					me.setStatus("Edit");
				else
                	me.setStatus("Loaded");
                $("#pageLoading").fadeOut("slow");
            }
        },

        initialize: function() {
            var me = this;

            me.description = $("#Description")[0];
            $("#Description").change(function() { me.modified(); });
        },

        resetControls: function() {
            var me = this;

            $("#AnchorCreateSnapshot").hide();
            $("#AnchorLockSnapshot").hide();
            $("#AnchorUnlockRequest").hide();
			$("#AnchorDeleteSnapshot").hide();
            $("#AnchorSave").hide();
            $("#AnchorUndo").hide();
            me.description.value = "";
            me.description.disabled = false;
			me.budget.setValue("false");
			me.actual.setValue("false");
			me.snapshot.setValue("false");
			me.period.reset();
        },

        currentDate: function() {
            var currentDate = new Date(parent.fin.appUI.glbCurrentDate);
            var month = currentDate.getMonth() + 1;
            var day = currentDate.getDate();
            var year = currentDate.getFullYear();

            return month + "/" + day + "/" + year;
        },

		customSort: function(a, b) {
            if (a.periodId > b.periodId)
                return 1;
            if (a.periodId < b.periodId)
                return -1;
            return 0;
        },

        houseCodesLoaded: function(me, activeId) {

            me.checkLoadCount();
        },

        divisionsLoaded: function(me, activeId) {

            for (var index = 0; index < me.divisions.length; index++) {
                $("#Division").append("<option title='" + me.divisions[index].brief + "' value='" + me.divisions[index].id + "'>" + me.divisions[index].brief + "</option>");
            }
            $("#Division").multiselect("refresh");
            me.checkLoadCount();
        },

        accountsLoaded: function(me, activeId) {

            for (var index = 0; index < me.accounts.length; index++) {
                if (me.accounts[index].isNegative)
                    me.revenueAccounts.push(me.accounts[index]);
            }

            me.checkLoadCount();
        },

        fiscalYearsLoaded: function(me, activeId) {

            me.year.setData(me.fiscalYears);
            me.year.select(0, me.year.focused);
            me.yearChanged();
            me.checkLoadCount();
        },

        yearChanged: function() {
            var me = this;

            me.yearId = me.fiscalYears[me.year.indexSelected].id;
            me.setLoadCount();
            me.fiscalPeriodStore.fetch("userId:[user],fiscalYearId:" + me.yearId, me.fiscalPeriodsLoaded, me);
        },

        fiscalPeriodsLoaded: function(me, activeId) {

            me.periods = me.fiscalPeriods.slice();
            me.checkLoadCount();
        },

        snapshotChanged: function() {
            var me = this;

            if (me.snapshot.check.checked) {
                $("#PeriodContainer").show();
                me.period.resizeText();
            }
            else
                $("#PeriodContainer").hide();
        },

        loadSnapshots: function() {
            var me = this;

            if ($("#Division").val() === null || me.year.indexSelected === -1)
                return;

            me.actionViewItem("Division");
            me.setLoadCount();
            me.houseCodeDetailStore.fetch("userId:[user],divisionIds:" + $("#Division").val().join('~'), me.houseCodeDetailsLoaded, me);
            me.fiscalPeriodStore.fetch("userId:[user],divisionIds:" + $("#Division").val().join('~'), me.periodsLoaded, me);
        },

        periodsLoaded: function(me, activeId) {

            me.period.setData(me.fiscalPeriods);
        },

        houseCodeDetailsLoaded: function(me, activeId) {

            for (var index = 0; index < me.houseCodeDetails.length; index++) {
                var itemIndex = ii.ajax.util.findIndexById(me.houseCodeDetails[index].id.toString(), me.houseCodes);
                if (itemIndex !== null) {
                    me.houseCodeDetails[index].name = me.houseCodes[itemIndex].name;
                }
            }

            me.snapshotStore.reset();
            me.snapshotStore.fetch("userId:[user],divisionIds:" + $("#Division").val().join('~') + ",yearId:" + me.yearId, me.snapshotsLoaded, me);
        },

        snapshotsLoaded: function(me, activeId) {
            var index = 0;

            me.snapshotsAll = me.snapshots.slice();
            me.mopSnapshots = me.snapshots.slice();

            for (index = me.mopSnapshots.length - 1; index > 0; index--) {
                if (me.mopSnapshots[index].periodId === me.mopSnapshots[index - 1].periodId)
                    me.mopSnapshots.splice(index, 1);
            }

            for (index = 0; index < me.periods.length; index++) {
                var period = me.periods[index];
                var item = [];
                var found = false;

                if (new Date(me.currentDate()) < period.startDate)
                    continue;

                for (var iIndex = 0; iIndex < me.mopSnapshots.length; iIndex++) {
                    if (me.mopSnapshots[iIndex].periodId === period.id) {
                        me.mopSnapshots[iIndex].name = me.fiscalYears[me.year.indexSelected].title + " - Period " + period.title;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    item = new fin.bud.snapshot.Snapshot(0
                        , $("#Division").val()
                        , period.id
                        , ""
                        , false
                        , false
                        , ""
                        , ""
                        , ""
                        , ""
                        , me.fiscalYears[me.year.indexSelected].title + " - Period " + period.title
                        , new Date(me.currentDate()) >= period.startDate && new Date(me.currentDate()) <= period.endDate
                        );

                    me.mopSnapshots.push(item);
                }
            }

			me.mopSnapshots.sort(me.customSort);
            me.snapshotGrid.setData(me.mopSnapshots);
            if (me.reloadData)
                me.reloadData = false;
            else
                me.checkLoadCount();
        },

        compareSnapshots: function() {
            var me = this;
            var index = 0;

			if (!me.budget.check.checked && !me.actual.check.checked && !me.snapshot.check.checked) {
				alert("Please select at least one option [Budget / Actual / Snapshot] to compare.");
				return;
			}
            else if (me.snapshot.check.checked && me.period.indexSelected === -1) {
				alert("Please select the Period.");
				return;
			}

            for (index = me.revenueItems.length - 1; index > 0; index--) {
                me.revenueItems.splice(index, 1);
            }
            for (index = me.totalItems.length - 1; index > 0; index--) {
                me.totalItems.splice(index, 1);
            }

            if (me.budget.check.checked) {
                me.setLoadCount();
                me.snapshotItemStore.reset();
                me.snapshotItemStore.fetch("userId:[user],level:Budget,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.budgetItemsLoaded, me);
            }
            else if (me.actual.check.checked) {
                me.setLoadCount();
                me.snapshotItemStore.reset();
                me.snapshotItemStore.fetch("userId:[user],level:Actual,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.actualItemsLoaded, me);
            }
            else if (me.snapshot.check.checked) {
                me.setLoadCount();
                me.snapshotItemStore.reset();
                me.snapshotItemStore.fetch("userId:[user],level:PrevSnapshot,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.period.data[me.period.indexSelected].id, me.prevSnapshotItemsLoaded, me);
            }
            else {
                me.revenueGrid.setData(me.revenueItems);
                me.totalGrid.setData(me.totalItems);
            }
        },

        budgetItemsLoaded: function(me, activeId) {

            me.budgetItems = me.snapshotItems.slice();

            for (var index = 0; index < me.budgetItems.length; index++) {
                var item = me.budgetItems[index];
                me.budgetItems[index].title = "Budget";
                me.budgetItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }

            me.revenueItems.push(me.budgetItems[0]);
            me.totalItems.push(me.budgetItems[1]);
            if (me.actual.check.checked)
                me.snapshotItemStore.fetch("userId:[user],level:Actual,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.actualItemsLoaded, me);
            else if (me.snapshot.check.checked)
                me.snapshotItemStore.fetch("userId:[user],level:PrevSnapshot,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.period.data[me.period.indexSelected].id, me.prevSnapshotItemsLoaded, me);
            else {
                me.revenueGrid.setData(me.revenueItems);
                me.totalGrid.setData(me.totalItems);
                me.checkLoadCount();
            }
        },

        actualItemsLoaded: function(me, activeId) {

            me.actualItems = me.snapshotItems.slice();

            for (var index = 0; index < me.actualItems.length; index++) {
                var item = me.actualItems[index];
                me.actualItems[index].title = "Actual";
                me.actualItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }

            me.revenueItems.push(me.actualItems[0]);
            me.totalItems.push(me.actualItems[1]);

            if (me.snapshot.check.checked)
                me.snapshotItemStore.fetch("userId:[user],level:PrevSnapshot,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.period.data[me.period.indexSelected].id, me.prevSnapshotItemsLoaded, me);
            else {
                me.revenueGrid.setData(me.revenueItems);
                me.totalGrid.setData(me.totalItems);
                me.checkLoadCount();
            }
        },

        prevSnapshotItemsLoaded: function(me, activeId) {

            me.prevSnapshotItems = me.snapshotItems.slice();

            for (var index = 0; index < me.prevSnapshotItems.length; index++) {
                var item = me.prevSnapshotItems[index];
                me.prevSnapshotItems[index].title = me.period.data[me.period.indexSelected].fscYeaTitle + " - Period " + me.period.data[me.period.indexSelected].title;
                me.prevSnapshotItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }

            me.revenueItems.push(me.prevSnapshotItems[0]);
            me.totalItems.push(me.prevSnapshotItems[1]);
            me.revenueGrid.setData(me.revenueItems);
            me.totalGrid.setData(me.totalItems);
            me.checkLoadCount();
        },

        isSnapshotAvailable: function(periodId) {
            var me = this;
            var found = true;
            var selectedDivisions = $("#Division").val();

            for (var index = 0; index < selectedDivisions.length; index++) {
                if (found) {
                    found = false;
                    for (var iIndex = 0; iIndex < me.snapshotsAll.length; iIndex++) {
                        if (me.snapshotsAll[iIndex].periodId === periodId && me.snapshotsAll[iIndex].divisionId.toString() === selectedDivisions[index]) {
                            found = true;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }

            return found;
        },

        actionViewSnapshot: function(id, divisionId, periodId, name) {
            var me = this;
            var item = null;
            var itemIndex = ii.ajax.util.findIndexById(id.toString(), me.mopSnapshots);

            if (itemIndex !== null) {
                item = me.mopSnapshots[itemIndex];
            }

            me.snapshotLocked = item.locked;

            if (me.isSnapshotAvailable(periodId)) {
                me.action = "SaveSnapshot";
                $("#DivisionLink").html(name);
                $("#CompareContainer").show();
                if (!me.snapshotLocked && me.currentPeriod === periodId) {
                    $("#AnchorSave").show();
                    $("#AnchorLockSnapshot").show();
					$("#AnchorDeleteSnapshot").show();
                    me.description.disabled = false;
                }
                else {
                    $("#AnchorSave").hide();
                    $("#AnchorLockSnapshot").hide();
					$("#AnchorDeleteSnapshot").hide();
                    me.description.disabled = true;
                }

                if (me.snapshotLocked && me.currentPeriod === periodId)
                    $("#AnchorUnlockRequest").show();
                else
                    $("#AnchorUnlockRequest").hide();

                me.description.value = item.description;
                me.periodId = periodId;
                me.setLoadCount();
                me.snapshotItemStore.reset();
                me.snapshotItemStore.fetch("userId:[user],level:Sector,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.revenueItemsLoaded, me);
            }
            else
                alert("Sanpshot is not available for one or more selected divisions.");
        },

        actionCreateSnapshot: function(periodId, name) {
            var me = this;

            me.resetControls();
            me.action = "CreateSnapshot";
			me.snapshotLocked = false;
            me.periodId = periodId;
			me.setLoadCount();
            me.snapshotItemStore.reset();
            me.snapshotItemStore.fetch("userId:[user],level:Sector,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.revenueItemsLoaded, me);
            $("#DivisionLink").html(name);
			me.modified();
        },

        revenueItemsLoaded: function(me, activeId) {

            me.revenueItems = me.snapshotItems.slice();
            me.revenueItems[0].title = $("#DivisionLink").html();

            for (var index = 0; index < me.revenueItems.length; index++) {
                var item = me.revenueItems[index];
                me.revenueItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }
            me.snapshotItemStore.reset();
            me.snapshotItemStore.fetch("userId:[user],level:Sector,revenue:0,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.totalItemsLoaded, me);
        },

        totalItemsLoaded: function(me, activeId) {

            me.totalItems = me.snapshotItems.slice();
            me.totalItems[0].title = $("#DivisionLink").html();

            for (var index = 0; index < me.totalItems.length; index++) {
                var item = me.totalItems[index];
                me.totalItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }
			$("#Division").multiselect("disable");
            $("#YearAction").removeClass("iiInputAction");
			$("#Notification").show();
            $("#DivisionLink").show();
			if (me.action === "CreateSnapshot")
				$("#AnchorCreateSnapshot").show();
            $("#SnapshotGridContainer").hide();
            $("#SnapshotDetailGridContainer").show();
			$("#CompareContainer").show();
            me.revenueGrid.setData(me.revenueItems);
            me.totalGrid.setData(me.totalItems);
            me.revenueGrid.setHeight(150);
            me.totalGrid.setHeight(150);
			me.anchorLoad.display(ui.cmn.behaviorStates.disabled);
            me.year.text.readOnly = true;
            me.checkLoadCount();
        },

        revenueItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (index > 0)
                return;
            me.revenue = 1;
			me.setLoadCount();
            me.snapshotItemStore.fetch("userId:[user],level:CostCenter,revenue:1,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.costCenterItemsLoaded, me);
        },

        totalItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (index > 0)
                return;
            me.revenue = 0;
			me.setLoadCount();
            me.snapshotItemStore.fetch("userId:[user],level:CostCenter,revenue:0,divisionIds:" + $("#Division").val().join('~') + ",periodId:" + me.periodId, me.costCenterItemsLoaded, me);
        },

        costCenterItemsLoaded: function(me, activeId) {

            me.costCenterItems = me.snapshotItems.slice();
            for (var index = 0; index < me.costCenterItems.length; index++) {
                var item = me.costCenterItems[index];
                me.costCenterItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
            }
            $("#CompareContainer").hide();
            $("#SnapshotDetailGridContainer").hide();
            $("#CostCenterGridContainer").show();
			$("#AnchorLockSnapshot").hide();
			$("#AnchorUnlockRequest").hide();
			$("#AnchorDeleteSnapshot").hide();
            me.costCenterGrid.setData(me.costCenterItems);
            me.costCenterGrid.setHeight($(window).height() - 275);

            var selectedValues = $("#Division").multiselect("getChecked").map(function() {
                return this.title;
            }).get();
            var selectedTitle = "";
            for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
                selectedTitle += ", " + selectedValues[selectedIndex];
            }
            selectedTitle = selectedTitle.substring(1, selectedTitle.length);
            $("#SectorLink").html(selectedTitle);
            $("#SectorLink").show();
            $("#spnDivision").show();
            $("#spnCategory").show();
            $("#spnCategory").html("/ " + (me.revenue === 1 ? "Revenue" : "Total"));
			$("#CostCenterGridContainer").scrollLeft(0);

            var $scope = angular.element($("#CostCenterSearchContainer")).scope();
            $scope.$apply(function() {
                $scope.selectedCostCenter = null;
                $scope.houseCodes = me.houseCodeDetails;
            });
 			me.checkLoadCount();
        },

        costCenterItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

			if (me.viewMOPClicked) {
				me.viewMOPClicked = false;
                me.costCenterGrid.body.deselect(index, true);
				setTimeout(function() {
					$("#CostCenterGridContainer").scrollLeft(0);
	            }, 100);
			}
			else {
				$("#CostCenterLink").html(me.costCenterGrid.data[index].title);
				$("#CostCenterLink").show();
				$("#spnSector").show();
				me.setLoadCount();
				me.snapshotItemStore.fetch("userId:[user],level:GLAccount,divisionIds:" + $("#Division").val().join('~') + ",revenue:" + me.revenue + ",houseCodeId:" + me.costCenterGrid.data[index].id + ",periodId:" + me.periodId, me.accountItemsLoaded, me);
			}
    	},

        accountItemsLoaded: function(me, activeId) {

			me.revenueCurrentPeriodTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            me.accountItems = me.snapshotItems.slice();

            for (var index = 0; index < me.accountItems.length; index++) {
                var item = me.accountItems[index];
                me.accountItems[index].total = item.period1 + item.period2 + item.period3 + item.period4 + item.period5 + item.period6 + item.period7 + item.period8 + item.period9 + item.period10 + item.period11 + item.period12;
                if (me.revenue === 0) {
                    var itemIndex = ii.ajax.util.findIndexById(item.id.toString(), me.accounts);
                    if (itemIndex !== null && me.accounts[itemIndex].isNegative) {
						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							me.revenueCurrentPeriodTotal[iIndex - 1] += Number(item["period" + iIndex]);
						}
					}
				}
            }
            $("#CostCenterGridContainer").hide();
            $("#AccountGridContainer").show();
			if (me.action === "SaveSnapshot" && !me.snapshotLocked && me.currentPeriod === me.periodId)
				$("#AnchorUndo").show();
			$("#AccountGridContainer").scrollLeft(0);
            me.createAccountGrid();
            me.accountGrid.setData(me.accountItems);
            me.accountGrid.setHeight($(window).height() - 275);
            var $scope = angular.element($("#AccountSearchContainer")).scope();
            $scope.$apply(function() {
                $scope.selectedAccount = null;
                if (me.revenue === 1)
                    $scope.accounts = me.revenueAccounts;
                else
                    $scope.accounts = me.accounts.slice();
            });
			me.checkLoadCount();
        },

        selectCostCenter: function(id) {
            var me = this;
            var index = ii.ajax.util.findIndexById(id, me.costCenterGrid.data);

            if (index !== null) {
                if (me.costCenterGrid.activeRowIndex !== -1)
                    me.costCenterGrid.body.deselect(me.costCenterGrid.activeRowIndex, true);
                me.costCenterGrid.body.select(index, true);
            }
            else if (me.action === "SaveSnapshot" && !me.snapshotLocked && me.currentPeriod === me.periodId) {
                index = ii.ajax.util.findIndexById(id, me.houseCodeDetails);

                if (confirm("Do you want to add the Cost Center [" + me.houseCodeDetails[index].name + "] to selected snapshot?")) {
                    var item = new fin.bud.snapshot.SnapshotItem(me.houseCodeDetails[index].id, me.houseCodeDetails[index].name);
                    me.costCenterItems.push(item);
                    if (me.costCenterGrid.activeRowIndex !== -1)
                        me.costCenterGrid.body.deselect(me.costCenterGrid.activeRowIndex, true);
                    me.costCenterGrid.setData(me.costCenterItems);
					me.modified();
                }
            }
        },

        selectAccount: function(id) {
            var me = this;
            var index = ii.ajax.util.findIndexById(id, me.accountGrid.data);

            if (index !== null) {
                if (me.accountGrid.activeRowIndex !== -1)
                    me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
                me.accountGrid.body.select(index, true);
            }
            else if (me.action === "SaveSnapshot" && !me.snapshotLocked && me.currentPeriod === me.periodId) {
                index = ii.ajax.util.findIndexById(id, me.accounts);

                if (confirm("Do you want to add the GL Account Code [" + me.accounts[index].code + "] to selected Cost Center?")) {
                    var item = new fin.bud.snapshot.SnapshotItem(me.accounts[index].id, me.accounts[index].code + " - " + me.accounts[index].name);
                    me.accountItems.push(item);
                    if (me.accountGrid.activeRowIndex !== -1)
                        me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
                    me.accountGrid.setData(me.accountItems);
					me.modified();
                }
            }
        },

        createAccountGrid: function() {
            var me = this;
            var editable = (me.action === "SaveSnapshot" && !me.snapshotLocked && (me.currentPeriod === me.periodId));

            $("#AccountGrid").html("");
            me.accountGrid = new ui.ctl.Grid({
                id: "AccountGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.accountItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.glPeriod1 = new ui.ctl.Input.Text({
                id: "GLPeriod1",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod1.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod1, me.accountGrid);
                });

			me.glPeriod2 = new ui.ctl.Input.Text({
                id: "GLPeriod2",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod2.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod2, me.accountGrid);
                });

			me.glPeriod3 = new ui.ctl.Input.Text({
                id: "GLPeriod3",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod3.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod3, me.accountGrid);
                });

			me.glPeriod4 = new ui.ctl.Input.Text({
                id: "GLPeriod4",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod4.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod4, me.accountGrid);
                });

			me.glPeriod5 = new ui.ctl.Input.Text({
                id: "GLPeriod5",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod5.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod5, me.accountGrid);
                });

			me.glPeriod6 = new ui.ctl.Input.Text({
                id: "GLPeriod6",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod6.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod6, me.accountGrid);
                });

			me.glPeriod7 = new ui.ctl.Input.Text({
                id: "GLPeriod7",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod7.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod7, me.accountGrid);
                });

			me.glPeriod8 = new ui.ctl.Input.Text({
                id: "GLPeriod8",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod8.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod8, me.accountGrid);
                });

			me.glPeriod9 = new ui.ctl.Input.Text({
                id: "GLPeriod9",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod9.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod9, me.accountGrid);
                });

			me.glPeriod10 = new ui.ctl.Input.Text({
                id: "GLPeriod10",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod10.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod10, me.accountGrid);
                });

			me.glPeriod11 = new ui.ctl.Input.Text({
                id: "GLPeriod11",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod11.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod11, me.accountGrid);
                });

			me.glPeriod12 = new ui.ctl.Input.Text({
                id: "GLPeriod12",
                maxLength: 19,
                appendToId: "AccountGridControlHolder",
                changeFunction: function () { me.calculateTotal(); }
            });

			me.glPeriod12.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.glPeriod12, me.accountGrid);
                });

            me.accountGrid.addColumn("aTitle", "title", "Account Code", "Account Code", null);
            me.accountGrid.addColumn("aPeriod1", "period1", "Period 1", "Period 1", 130, function(period1) { return parseFloat(period1).toFixed(2); }, (editable && me.currentPeriodTitle <= 1 ? me.glPeriod1 : null));
            me.accountGrid.addColumn("aPeriod2", "period2", "Period 2", "Period 2", 130, function(period2) { return parseFloat(period2).toFixed(2); }, (editable && me.currentPeriodTitle <= 2 ? me.glPeriod2 : null));
            me.accountGrid.addColumn("aPeriod3", "period3", "Period 3", "Period 3", 130, function(period3) { return parseFloat(period3).toFixed(2); }, (editable && me.currentPeriodTitle <= 3 ? me.glPeriod3 : null));
            me.accountGrid.addColumn("aPeriod4", "period4", "Period 4", "Period 4", 130, function(period4) { return parseFloat(period4).toFixed(2); }, (editable && me.currentPeriodTitle <= 4 ? me.glPeriod4 : null));
            me.accountGrid.addColumn("aPeriod5", "period5", "Period 5", "Period 5", 130, function(period5) { return parseFloat(period5).toFixed(2); }, (editable && me.currentPeriodTitle <= 5 ? me.glPeriod5 : null));
            me.accountGrid.addColumn("aPeriod6", "period6", "Period 6", "Period 6", 130, function(period6) { return parseFloat(period6).toFixed(2); }, (editable && me.currentPeriodTitle <= 6 ? me.glPeriod6 : null));
            me.accountGrid.addColumn("aPeriod7", "period7", "Period 7", "Period 7", 130, function(period7) { return parseFloat(period7).toFixed(2); }, (editable && me.currentPeriodTitle <= 7 ? me.glPeriod7 : null));
            me.accountGrid.addColumn("aPeriod8", "period8", "Period 8", "Period 8", 130, function(period8) { return parseFloat(period8).toFixed(2); }, (editable && me.currentPeriodTitle <= 8 ? me.glPeriod8 : null));
            me.accountGrid.addColumn("aPeriod9", "period9", "Period 9", "Period 9", 130, function(period9) { return parseFloat(period9).toFixed(2); }, (editable && me.currentPeriodTitle <= 9 ? me.glPeriod9 : null));
            me.accountGrid.addColumn("aPeriod10", "period10", "Period 10", "Period 10", 130, function(period10) { return parseFloat(period10).toFixed(2); }, (editable && me.currentPeriodTitle <= 10 ? me.glPeriod10 : null));
            me.accountGrid.addColumn("aPeriod11", "period11", "Period 11", "Period 11", 130, function(period11) { return parseFloat(period11).toFixed(2); }, (editable && me.currentPeriodTitle <= 11 ? me.glPeriod11 : null));
            me.accountGrid.addColumn("aPeriod12", "period12", "Period 12", "Period 12", 130, function(period12) { return parseFloat(period12).toFixed(2); }, (editable && me.currentPeriodTitle <= 12 ? me.glPeriod12 : null));
            me.accountGrid.addColumn("aTotal", "total", "Total", "Total", 130, function(total) { return parseFloat(total).toFixed(2); });
            me.accountGrid.capColumns();
        },

		validateControl: function(control, activeGrid) {
            var enteredText = control.getValue();

            if (enteredText === "" || activeGrid.activeRowIndex === -1)
                return;

            if (!(/^-?\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
            	control.setInvalid("Please enter numeric value.");
        },

        accountItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            me.accountGrid.data[index].modified = true;
            setTimeout(function() {
				$("#GLPeriod" + me.currentPeriodTitle + "Text").select();;
				$("#GLPeriod" + me.currentPeriodTitle + "Text").select();
				$("#AccountGridContainer").scrollLeft(0);
            }, 100);
        },

        calculateTotal: function() {
            var me = this;
            var periodAmount = 0;
			var periodValue = 0;
			var total = 0;

			for (var index = 1; index <= 12; index++) {
				if (me.currentPeriodTitle <= index) {
					periodAmount = $("#GLPeriod" + index + "Text").val();
					if (periodAmount !== "" && !isNaN(periodAmount))
						periodValue = Number(periodAmount);
					else
						periodValue = 0;
				}
				else {
					periodValue = Number(me.accountGrid.data[me.accountGrid.activeRowIndex]["period" + index]);
				}
				total += periodValue;
			}

            $(me.accountGrid.rows[me.accountGrid.activeRowIndex].getElement("aTotal")).text(parseFloat(total).toFixed(2));
			me.modified();
        },

        actionViewItem: function(level) {
            var me = this;
            var index = 0;
            var found = false;

            if (level === "Division") {
                if (!parent.fin.cmn.status.itemValid())
                    return;

				me.setStatus("Normal");
                me.resetControls();
                $("#SnapshotDetailGridContainer").hide();
                $("#CostCenterGridContainer").hide();
                $("#AccountGridContainer").hide();
                $("#SnapshotGridContainer").show();
                $("#Notification").hide();
                $("#DivisionLink").html("");
                $("#DivisionLink").hide();
                $("#CompareContainer").hide();
                $("#SectorLink").html("");
                $("#SectorLink").hide();
                $("#spnDivision").hide();
                $("#spnCategory").hide();
                $("#spnCategory").html("");
                $("#CostCenterLink").html("");
                $("#CostCenterLink").hide();
                $("#spnSector").hide();
                $("#Division").multiselect("enable");
                $("#YearAction").addClass("iiInputAction");
                me.year.text.readOnly = false;
                me.anchorLoad.display(ui.cmn.behaviorStates.enabled);
            }
            else if (level === "Sector") {
                if (me.accountGrid !== undefined) {
                    for (index = 0; index < me.accountGrid.data.length; index++) {
                        if (me.accountGrid.data[index].modified) {
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        if (!parent.fin.cmn.status.itemValid())
                            return;

                        if (me.accountGrid.activeRowIndex !== -1)
                            me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
                        me.snapshotItemStore.reset();
                        me.accountItems = [];
                        me.accountGrid.setData(me.accountItems);
						me.setStatus("Normal");
                    }
                }

                $("#CostCenterGridContainer").hide();
                $("#AccountGridContainer").hide();
                $("#SnapshotDetailGridContainer").show();
                $("#CompareContainer").show();
                $("#SectorLink").html("");
                $("#SectorLink").hide();
                $("#spnDivision").hide();
                $("#spnCategory").hide();
                $("#spnCategory").html("");
                $("#CostCenterLink").html("");
                $("#CostCenterLink").hide();
                $("#spnSector").hide();
				$("#AnchorUndo").hide();
				$("#SnapshotDetailGridContainer").scrollLeft(0);
				if (me.action === "SaveSnapshot" && !me.snapshotLocked && me.currentPeriod === me.periodId) {
					$("#AnchorLockSnapshot").show();
					$("#AnchorDeleteSnapshot").show();
				}
				if (me.snapshotLocked && me.currentPeriod === me.periodId)
                    $("#AnchorUnlockRequest").show();
                if (me.revenueGrid.activeRowIndex !== -1)
                    me.revenueGrid.body.deselect(me.revenueGrid.activeRowIndex, true);
                if (me.totalGrid.activeRowIndex !== -1)
                    me.totalGrid.body.deselect(me.totalGrid.activeRowIndex, true);
            }
            else if (level === "CostCenter") {
                if (me.accountGrid !== undefined) {
                    for (index = 0; index < me.accountGrid.data.length; index++) {
                        if (me.accountGrid.data[index].modified) {
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        if (!parent.fin.cmn.status.itemValid())
                            return;

                        if (me.accountGrid.activeRowIndex !== -1)
                            me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
                        me.snapshotItemStore.reset();
                        me.accountItems = [];
                        me.accountGrid.setData(me.accountItems);
						me.setStatus("Normal");
                    }
                }

                $("#AccountGridContainer").hide();
                $("#CostCenterGridContainer").show();
                $("#CostCenterLink").html("");
                $("#CostCenterLink").hide();
                $("#spnSector").hide();
				$("#AnchorUndo").hide();
				$("#CostCenterGridContainer").scrollLeft(0);
                if (me.costCenterGrid.activeRowIndex !== -1)
                    me.costCenterGrid.body.deselect(me.costCenterGrid.activeRowIndex, true);
            }
        },

        actionViewMOP: function(houseCodeId) {
            var me = this;

			if (!parent.fin.cmn.status.itemValid()) {
				me.viewMOPClicked = true;
				return;
			}

            for (var index = 0; index < me.houseCodes.length; index++) {
                if (me.houseCodes[index].id === houseCodeId) {
                    parent.fin.appUI.unitId = me.houseCodes[index].appUnit;
                    parent.fin.appUI.houseCodeId = me.houseCodes[index].id;
                    parent.fin.appUI.houseCodeTitle = me.houseCodes[index].name;
                    parent.fin.appUI.houseCodeBrief = me.houseCodes[index].brief;
                    parent.fin.appUI.hirNode = me.houseCodes[index].hirNode;
                }
            }

            top.ui.ctl.menu.Dom.me.items["bud"].items["MOP"].select();
            window.location = "/fin/bud/mop/usr/markup.htm";
        },

        actionCreateSnapshotItem: function() {
            var me = this;

            me.action = "CreateSnapshot";
            me.actionSaveItem();
        },

        actionLockSnapshotItem: function() {
            var me = this;

            me.action = "LockSnapshot";
            me.actionSaveItem();
        },

        actionUnlockSnapshot: function(periodId) {
            var me = this;

            if (me.isSnapshotAvailable(periodId)) {
                me.periodId = periodId;
                me.action = "UnlockSnapshot";
                me.actionSaveItem();
            }
            else
                alert("Sanpshot is not available for one or more selected divisions.");
        },

        actionDeleteSnapshotItem: function() {
            var me = this;

            if (confirm("Are you sure you would like to delete the selected snapshot?")) {
                me.action = "DeleteSnapshot";
                me.actionSaveItem();
            }
        },

        actionUnlockRequestItem: function() {
            var me = this;

            me.showPopup("PopupContainer");
            me.validator.reset();
            me.emailId.setValue("");
            me.subject.setValue("");
            me.notes.value = "";
            me.emailId.resizeText();
            me.subject.resizeText();
        },

        actionSendRequestItem: function() {
            var me = this;

            me.action = "UnlockSnapshotRequest";
            me.actionSaveItem();
        },

        actionCloseItem: function() {
            var me = this;

            me.hidePopup("PopupContainer");
        },

		actionUndoItem: function() {
            var me = this;

			if (!parent.fin.cmn.status.itemValid())
            	return;

			if (me.accountGrid.activeRowIndex !== -1)
            	me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
            me.setLoadCount();
			me.snapshotItemStore.reset();
			me.snapshotItemStore.fetch("userId:[user],level:GLAccount,divisionIds:" + $("#Division").val().join('~') + ",revenue:" + me.revenue + ",houseCodeId:" + me.costCenterGrid.data[me.costCenterGrid.activeRowIndex].id + ",periodId:" + me.periodId, me.accountItemsLoaded, me);
        },

        actionSaveItem: function() {
            var me = this;
            var item = [];
            var xml = "";

            if (me.action === "CreateSnapshot" || me.action === "LockSnapshot" || me.action === "UnlockSnapshot" || me.action === "UnlockSnapshotRequest" || me.action === "DeleteSnapshot") {
                if (me.action === "UnlockSnapshotRequest") {
                    if (!me.emailId.validate(true) || !me.subject.validate(true)) {
                        alert("In order to continue, the errors on the page must be corrected.");
                        return false;
                    }
                }

                xml += '<budMopSnapshot';
                xml += ' divisionIds="' + $("#Division").val().join('|') + '|"';
                xml += ' periodId="' + me.periodId + '"';
                xml += ' description="' + ui.cmn.text.xml.encode(me.description.value) + '"';
                xml += ' action="' + me.action + '"';

                if (me.action === "UnlockSnapshotRequest") {
                    xml += ' emailId="' + ui.cmn.text.xml.encode(me.emailId.getValue()) + '"';
                    xml += ' subject="' + ui.cmn.text.xml.encode(me.subject.getValue()) + '"';
                    xml += ' notes="' + ui.cmn.text.xml.encode(me.notes.value) + '"';
                }

                xml += '/>';
            }
            else if (me.action === "SaveSnapshot") {
                if (me.accountGrid !== undefined) {
                    // Check to see if the data entered is valid
                    me.accountGrid.body.deselectAll();
                    me.validator.forceBlur();

                    if (!me.validator.queryValidity(true) && me.accountGrid.activeRowIndex >= 0) {
                        alert("In order to save, the errors on the page must be corrected. Please verify the data on GL Account Code section.");
                        return false;
                    }
                }

                xml += '<budMopSnapshot';
                xml += ' divisionIds="' + $("#Division").val().join('|') + '|"';
                xml += ' periodId="' + me.periodId + '"';
                xml += ' description="' + ui.cmn.text.xml.encode(me.description.value) + '"';
                xml += ' action="' + me.action + '"';
                xml += '/>';

                if (me.accountGrid !== undefined) {
                    if (me.accountGrid.activeRowIndex !== -1)
                        me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);

                    for (var index = 0; index < me.accountGrid.data.length; index++) {
                        if (me.accountGrid.data[index].modified) {
                            xml += '<budMopSnapshotItem';
                            xml += ' divisionIds="' + $("#Division").val().join('|') + '|"';
                            xml += ' periodId="' + me.periodId + '"';
                            xml += ' houseCodeId="' + me.costCenterGrid.data[me.costCenterGrid.activeRowIndex].id + '"';
                            xml += ' accountId="' + me.accountGrid.data[index].id + '"';
                            xml += ' period1="' + me.accountGrid.data[index].period1 + '"';
                            xml += ' period2="' + me.accountGrid.data[index].period2 + '"';
                            xml += ' period3="' + me.accountGrid.data[index].period3 + '"';
                            xml += ' period4="' + me.accountGrid.data[index].period4 + '"';
                            xml += ' period5="' + me.accountGrid.data[index].period5 + '"';
                            xml += ' period6="' + me.accountGrid.data[index].period6 + '"';
                            xml += ' period7="' + me.accountGrid.data[index].period7 + '"';
                            xml += ' period8="' + me.accountGrid.data[index].period8 + '"';
                            xml += ' period9="' + me.accountGrid.data[index].period9 + '"';
                            xml += ' period10="' + me.accountGrid.data[index].period10 + '"';
                            xml += ' period11="' + me.accountGrid.data[index].period11 + '"';
                            xml += ' period12="' + me.accountGrid.data[index].period12 + '"';
                            xml += '/>';
                        }
                    }
                }
            }

            if (xml === "")
                return;

            if (me.action === "UnlockSnapshotRequest") {
                me.hidePopup("PopupContainer");
                me.setStatus("Sending");
                $("#messageToUser").text("Sending");
            }
            else {
                me.setStatus("Saving");
                $("#messageToUser").text("Saving");
            }

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
            var status = $(args.xmlNode).attr("status");

            if (status === "success") {
                me.modified(false);

                if (me.action === "CreateSnapshot") {
                    me.reloadData = true;
                    $("#AnchorCreateSnapshot").hide();
                }
                else if (me.action === "DeleteSnapshot") {
                    me.reloadData = true;
                }
                else if (me.action === "LockSnapshot") {
                    $("#AnchorLockSnapshot").hide();
                    $("#AnchorSave").hide();
					$("#AnchorDeleteSnapshot").hide();
                    $("#AnchorUndo").hide();
                    me.snapshotGrid.data[me.snapshotGrid.activeRowIndex].locked = true;
                    me.snapshotGrid.data[me.snapshotGrid.activeRowIndex].unlockRequested = false;
                    me.snapshotGrid.body.renderRow(me.snapshotGrid.activeRowIndex, me.snapshotGrid.activeRowIndex);
                    me.snapshotLocked = true;
                    me.description.disabled = true;
                }
                else if (me.action === "UnlockSnapshot") {
                    me.snapshotGrid.data[me.snapshotGrid.activeRowIndex].locked = false;
                    me.snapshotGrid.body.renderRow(me.snapshotGrid.activeRowIndex, me.snapshotGrid.activeRowIndex);
                }
                else if (me.action === "UnlockSnapshotRequest") {
                    me.snapshotGrid.data[me.snapshotGrid.activeRowIndex].unlockRequested = true;
                    me.snapshotGrid.body.renderRow(me.snapshotGrid.activeRowIndex, me.snapshotGrid.activeRowIndex);
                }
                else if (me.action === "SaveSnapshot") {
                    me.snapshotGrid.data[me.snapshotGrid.activeRowIndex].description = me.description.value;

                    if (me.accountGrid !== undefined && me.accountGrid.data.length > 0) {
						var periodTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						var revenueTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						var costCenterPeriodTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						var revenuePeriodTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						var totalPeriodTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
						var total = 0;

                        for (var index = 0; index < me.accountGrid.data.length; index++) {
							for (var iIndex = 1; iIndex <= 12; iIndex++) {
								periodTotal[iIndex - 1] += Number(me.accountGrid.data[index]["period" + iIndex]);
							}

                            if (me.revenue === 0) {
                                var itemIndex = ii.ajax.util.findIndexById(me.accountGrid.data[index].id.toString(), me.accounts);
                                if (itemIndex !== null && me.accounts[itemIndex].isNegative) {
									for (var iIndex = 1; iIndex <= 12; iIndex++) {
										revenueTotal[iIndex - 1] += Number(me.accountGrid.data[index]["period" + iIndex]);
									}
								}
                            }
                        }

						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							costCenterPeriodTotal[iIndex - 1] += Number(me.costCenterGrid.data[me.costCenterGrid.activeRowIndex]["period" + iIndex]);
						}

						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							me.costCenterGrid.data[me.costCenterGrid.activeRowIndex]["period" + iIndex] = periodTotal[iIndex - 1];
							total += periodTotal[iIndex - 1];
						}
						me.costCenterGrid.data[me.costCenterGrid.activeRowIndex].total = total;
                        me.costCenterGrid.body.renderRow(me.costCenterGrid.activeRowIndex, me.costCenterGrid.activeRowIndex);

						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							revenuePeriodTotal[iIndex - 1] += Number(me.revenueGrid.data[0]["period" + iIndex]);
						}
						total = 0;
                        if (me.revenue === 1) {
							for (var iIndex = 1; iIndex <= 12; iIndex++) {
								me.revenueGrid.data[0]["period" + iIndex] = revenuePeriodTotal[iIndex - 1] - costCenterPeriodTotal[iIndex - 1] + periodTotal[iIndex - 1];
								total += me.revenueGrid.data[0]["period" + iIndex];
							}
                        }
                        else {
							for (var iIndex = 1; iIndex <= 12; iIndex++) {
								me.revenueGrid.data[0]["period" + iIndex] = revenuePeriodTotal[iIndex - 1] - me.revenueCurrentPeriodTotal[iIndex - 1] + revenueTotal[iIndex - 1];
								total += me.revenueGrid.data[0]["period" + iIndex];
							}
                        }
						me.revenueGrid.data[0].total = total;
                        me.revenueGrid.body.renderRow(0, 0);

						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							totalPeriodTotal[iIndex - 1] += Number(me.totalGrid.data[0]["period" + iIndex]);
						}
						total = 0;
						for (var iIndex = 1; iIndex <= 12; iIndex++) {
							me.totalGrid.data[0]["period" + iIndex] = totalPeriodTotal[iIndex - 1] - costCenterPeriodTotal[iIndex - 1] + periodTotal[iIndex - 1];
							total += me.totalGrid.data[0]["period" + iIndex];
						}
						me.totalGrid.data[0].total = total;
                        me.totalGrid.body.renderRow(0, 0);
                    }
                }

                if (me.action === "UnlockSnapshotRequest")
                    me.setStatus("Sent");
                else
                    me.setStatus("Saved");

                if (me.reloadData) {
                    me.actionViewItem("Division");
                    me.snapshotStore.reset();
                    me.snapshotStore.fetch("userId:[user],divisionIds:" + $("#Division").val().join('~') + ",yearId:" + me.yearId, me.snapshotsLoaded, me);
                }
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while updating snapshot details: " + $(args.xmlNode).attr("message"));
            }

            $("#pageLoading").fadeOut("slow");
        },

        showPopup: function(id) {
            var windowWidth = document.documentElement.clientWidth;
            var windowHeight = document.documentElement.clientHeight;
            var popupWidth = $("#" + id).width();
            var popupHeight = $("#" + id).height();

            $("#" + id).css({
                "width": popupWidth,
                "height": popupHeight,
                "top": windowHeight / 2 - popupHeight / 2,
                "left": windowWidth / 2 - popupWidth / 2
            });
            $("#backgroundPopup").css({
                "opacity": "0.5"
            });
            $("#backgroundPopup").fadeIn("slow");
            $("#" + id).fadeIn("slow");
        },

        hidePopup: function(id) {
            $("#backgroundPopup").fadeOut("slow");
            $("#" + id).fadeOut("slow");
        }
    }
});

function main() {
    var intervalId = setInterval(function() {
        if (importCompleted) {
            clearInterval(intervalId);
            fin.snapshotUi = new fin.bud.snapshot.UserInterface();
            fin.snapshotUi.resize();
        }
    }, 100);
}
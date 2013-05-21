ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.pay.master.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.tabs", 9 );

ii.Class({
    Name: "fin.pay.master.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		
        init: function() {            
			var args = ii.args(arguments, {});
			var me = this;
			
			me.activeFrameId = 0;
			me.timeAndAttendance = false;

			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);

			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;			

			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\SalaryWages";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();			
			me.configureCommunications();
			me.modified(false);
			me.initialize();			
			me.week.fetchingData();
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);
				
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_pay_master_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.salaryWagesReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");			
			me.dailyPayrollReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabDailyPayroll\\Read");
			
			$("#pageLoading").hide();
			
			me.actionMenuVisible();

			ii.timer.timing("Page Displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		actionMenuVisible: function() {
			var me = this;

			if (me.salaryWagesReadOnly) {
				$("#actionMenu").hide();
			}
			if (me.dailyPayrollReadOnly) {
				$("#actionMenu").hide();
			}
		},

		sessionLoaded: function fin_pay_master_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var offset = 84;	

		    $("#iFrameDailyPayroll").height($(window).height() - offset);
		    $("#iFrameWeeklyPayroll").height($(window).height() - offset);
		},
		
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {

					case 83: //Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
				
				if (processed) {
					return false;
				}
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
					brief: "Save Payroll Info (Ctrl+S)", 
					title: "Save the current Payroll Information.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo changes to Payroll Info (Ctrl+U)", 
					title: "Undo changes to Payroll Information.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.week = new ui.ctl.Input.DropDown.Filtered({
				id: "Week",
				formatFunction: function( type ) { return type.weekStartDate + " - " + type.weekEndDate; }
			});

			me.week.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.week.indexSelected == -1)
						this.setInvalid("Please select the correct Week.");
				});

			me.year = new ui.ctl.Input.DropDown.Filtered({
				id: "Year",
				formatFunction: function(type) { return type.name; }
			});

			me.year.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.year.indexSelected == -1)
						this.setInvalid("Please select the correct Year.");
				});

			me.loadButton = new ui.ctl.buttons.Sizeable({
				id: "LoadButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.houseCodeSinglesLoaded(); },
				hasHotState: true
			});
				
			me.printButton = new ui.ctl.buttons.Sizeable({
				id: "PrintButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Print&nbsp;&nbsp;</span>",
				title: "Print Weekly Payroll",
				clickFunction: function() { me.payrollPrint(); },
				hasHotState: true
			});
			
			me.anchorOK = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOKItem(); },
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
		
		configureCommunications:function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pay.master.HirNode,
				itemConstructorArgs: fin.pay.master.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pay.master.HouseCode,
				itemConstructorArgs: fin.pay.master.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeSingles = [];
			me.houseCodeSingleStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.pay.master.HouseCode,
				itemConstructorArgs: fin.pay.master.houseCodeArgs,
				injectionArray: me.houseCodeSingles
			});

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.pay.master.FiscalYear,
				itemConstructorArgs: fin.pay.master.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});

			me.weeks = [];
			me.weekStore = me.cache.register({
				storeId: "payWeeks",
				itemConstructor: fin.pay.master.Week,
				itemConstructorArgs: fin.pay.master.weekArgs,
				injectionArray: me.weeks
			});

			me.weekPeriodYears = [];
			me.weekPeriodYearStore = me.cache.register({
				storeId: "weekPeriodYears",
				itemConstructor: fin.pay.master.WeekPeriodYear,
				itemConstructorArgs: fin.pay.master.weekPeriodYearArgs,
				injectionArray: me.weekPeriodYears
			});
		},

		initialize: function() {
			var me = this;

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid()) 
					return false;
				else {
					var tabIndex = 0;
					if (this.id == "DailyPayroll")
						tabIndex = 1;
					else if (this.id == "WeeklyPayroll")
						tabIndex = 2;

					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}					
			});
			
			$("#TabCollection a").click(function(me) {

				if (this.id == "DailyPayroll") {
					fin.payMasterUi.activeFrameId = 0;
					$("#PrintButton").hide();
				}
				else if (this.id == "WeeklyPayroll") {
					fin.payMasterUi.activeFrameId = 1;
					$("#PrintButton").show();
				}

				fin.payMasterUi.houseCodeSinglesLoaded();
			});

			$("#SearchIcon").click(function() {

				if($("#SearchOption").is(":visible")) {
					$("#SearchIcon").html("<img src='/fin/cmn/usr/media/Common/searchPlus.png'/>");
					$("#SearchOption").hide("slow");
				}
				else {
					$("#SearchIcon").html("<img src='/fin/cmn/usr/media/Common/searchMinus.png'/>");
					$("#SearchOption").show("slow");
					me.year.resizeText();
					me.year.select(0, me.year.focused);
				}		
			});			
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		weekPeriodYearsLoaded: function(me, activeId) {

			me.currentFiscalYear = me.weekPeriodYears[0].fiscalYear;
			me.year.fetchingData();
			me.fiscalYearStore.reset();
			me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
		},
		
		fiscalYearsLoaded: function(me, activeId) {

			me.years = [];
			me.year.setData([]);

			for (var index = 0; index < me.fiscalYears.length; index++) {
				if (parseInt(me.fiscalYears[index].name) <= parseInt(me.currentFiscalYear))
					me.years.push(me.fiscalYears[index]);
			}
			me.year.setData(me.years);
			me.year.select(0, me.year.focused);
		},		

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.weekStore.fetch("userId:[user],year:-1", me.weeksLoaded, me);
		},

		weeksLoaded: function(me, activeId) {

			me.week.setData(me.weeks);
			me.week.select(0, me.week.focused);
			
			me.houseCodeSinglesLoaded();
		},

		houseCodeSinglesLoaded: function() {
			var args = ii.args(arguments,{});
			var me = this;			

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (parent.fin.appUI.houseCodeId <= 0) {
				alert("Please select the House Code.");
				return false;
			}

			me.houseCodeSingleStore.reset();
			me.houseCodeSingleStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.payrollLoaded, me);
		},

		payrollPrint: function fin_pay_master_UserInterface_payrollPrint() {			
			var me = this;

			if (parent.fin.appUI.hirNode == null ||	me.week.indexSelected == -1) {
				alert("Please select House Code, Week.");
				return false;
			}

	        window.open(location.protocol + '//' + location.hostname 
				+ '/reports/printpayroll.aspx?hirnode=' + parent.fin.appUI.hirNode 
				+ '&weekStartDate=' + me.weeks[me.week.indexSelected].weekStartDate
				+ '&weekEndDate=' + me.weeks[me.week.indexSelected].weekEndDate, 
				+ 'PrintPayroll', 'type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
		},

		payrollLoaded: function(me, activeId) {
			var args = ii.args(arguments,{});

			$.each(me.houseCodeSingles, function() {
				me.timeAndAttendance = this.timeAndAttendance;
			});

			$("#container").tabs(0);
			$("#fragment-1").hide();
			$("#fragment-2").hide();

			if (me.timeAndAttendance == false) {
				$("#DailyPayroll").hide();
				$("#fragment-2").show();
				$("#WeeklyPayroll").parent().addClass("tabs-selected");				
				me.activeFrameId = 1;
			}
			else {
				$("#DailyPayroll").show();

				if (me.activeFrameId == 0) {
					$("#fragment-1").show();
					$("#DailyPayroll").parent().addClass("tabs-selected");	
				}
				else
					$("#container").tabs(1);
			}

			$("#pageLoading").hide();

			var queryString = "houseCodeId=" + parent.fin.appUI.houseCodeId;

			if (me.activeFrameId == 0 && me.timeAndAttendance) {
				$("iframe")[0].src = "/fin/pay/dailyPayRoll/usr/markup.htm?" + queryString;
				$("#PrintButton").hide();
			}
			else if (me.activeFrameId == 1) {
				$("iframe")[1].src = "/fin/pay/weeklyPayRoll/usr/markup.htm?" + queryString;
				$("#PrintButton").show();
			}
		},
		
		actionOKItem: function() {
			var me = this;

			me.year.validate(true);
			if (!me.year.valid)
				return true;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#SearchIcon").html("<img src='/fin/cmn/usr/media/Common/searchPlus.png'/>");
			$("#SearchOption").hide("slow");

			me.week.fetchingData();
			me.weekStore.fetch("userId:[user],year:" + me.years[me.year.indexSelected].name + ",currentYear:" + me.currentFiscalYear, me.weeksLoaded, me);
		},

		actionCancelItem: function() {
			var me = this;
		
			$("#SearchIcon").html("<img src='/fin/cmn/usr/media/Common/searchPlus.png'/>");
			$("#SearchOption").hide("slow");
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.activeFrameId == 0) {
				if (me.salaryWagesReadOnly || me.dailyPayrollReadOnly)
					return;
				$("iframe")[0].contentWindow.fin.payDailyPayrollUi.actionSaveDailyPayroll();
			}
			else if (me.activeFrameId == 1)
				$("iframe")[1].contentWindow.fin.payWeeklyPayrollUi.actionSaveWeeklyPayroll();
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
		
			if (me.activeFrameId == 0)
				$("iframe")[0].contentWindow.fin.payDailyPayrollUi.actionUndoDailyPayroll();
			else if (me.activeFrameId == 1)
				$("iframe")[1].contentWindow.fin.payWeeklyPayrollUi.actionUndoWeeklyPayroll();
		}
    }
});

function main() {

	fin.payMasterUi = new fin.pay.master.UserInterface();
	fin.payMasterUi.resize();
	fin.houseCodeSearchUi = fin.payMasterUi;
}
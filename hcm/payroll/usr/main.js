ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.popup" );
ii.Import( "fin.hcm.payroll.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8) ;

ii.Class({
    Name: "fin.hcm.payroll.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.ePaySiteSelect = false;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master(); 
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();
			
			$("#pageBody").show();
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
		
			$("#EPaySiteCheck").click(function() { me.ePaySiteSelect = me.ePaySite.check.checked; });		
			$("input[name='TimeAttendance']").change(function() {parent.fin.hcmMasterUi.modified(true);});
			$("input[name='DefaultLunchBreak']").change(function() {parent.fin.hcmMasterUi.modified(true);});
			$("input[name='LunchBreakTrigger']").change(function() {parent.fin.hcmMasterUi.modified(true);});
			$("input[name='HouseCodeType']").change(function() {parent.fin.hcmMasterUi.modified(true);});
			$("input[name='RoundingTimePeriod']").change(function() {parent.fin.hcmMasterUi.modified(true);});				
		},
		
		authorizationProcess: function fin_hcm_payroll_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			if (me.isAuthorized) {
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				parent.fin.hcmMasterUi.setLoadCount();
				me.payrollProcessing.fetchingData();
				me.payPayrollCompanyStore.fetch("userId:[user],houseCodeId:" + parent.fin.hcmMasterUi.getHouseCodeId(), me.payPayrollCompanysLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
				
			//Payroll
			me.payrollWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.payrollReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			
			me.tabPayrollShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll");
			me.tabPayrollWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabPayroll\\Write");
			me.tabPayrollReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabPayroll\\Read");
						
			//tp=TabPayroll
			me.tpPayrollProcessingLocationShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\PayrollProcessingLocation", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpTimeAndAttendanceShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\TimeAndAttendance", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpDefaultLunchBreakShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\DefaultLunchBreak", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpLunchBreakTriggerShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\LunchBreakTrigger", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpHouseCodeTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\HouseCodeType", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpRoundingTimePeriodShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\RoundingTimePeriod", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpEPaySiteShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\EPaySite", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpEPayTaskShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\EPayTask", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpCeridianCompanyHourlyShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\CeridianCompanyHourly", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpCeridianCompanySalariedShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\CeridianCompanySalaried", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));			
			
			me.tpPayrollProcessingLocationReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\PayrollProcessingLocation\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpTimeAndAttendanceReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\TimeAndAttendance\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpDefaultLunchBreakReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\DefaultLunchBreak\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpLunchBreakTriggerReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\LunchBreakTrigger\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpHouseCodeTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\HouseCodeType\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpRoundingTimePeriodReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\RoundingTimePeriod\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpEPaySiteReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\EPaySite\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpEPayTaskReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\EPayTask\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpCeridianCompanyHourlyReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\CeridianCompanyHourly\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpCeridianCompanySalariedReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\CeridianCompanySalaried\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			
			me.resetUIElements();
		},	
		
		sessionLoaded: function fin_hcm_payroll_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		isCtrlVisible: function fin_hcm_payroll_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});			
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.payrollWrite || me.payrollReadOnly)
				return true;
			
			if (me.tabPayrollWrite || me.tabPayrollReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_hcm_payroll_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabPayrollReadOnly && !me.payrollReadOnly)
				return false;

			if (me.tabPayrollWrite && !me.payrollReadOnly)
				return false;

			if (me.payrollWrite)
				return false;
			
			if (me.payrollReadOnly) return true;
			if (me.tabPayrollReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_hcm_payroll_UserInterface_resetUIElements() {
			var me = this;			
				
			//SectionServices
			me.setControlState("PayrollPro", me.tpPayrollProcessingLocationReadOnly, me.tpPayrollProcessingLocationShow);
			me.setControlState("TimeAttendance", me.tpTimeAndAttendanceReadOnly, me.tpTimeAndAttendanceShow, "Radio", "TimeAttendanceRadio");
			me.setControlState("DefaultLunchBreak", me.tpDefaultLunchBreakReadOnly, me.tpDefaultLunchBreakShow, "Radio", "DefaultLunchBreakRadio");
			me.setControlState("LunchBreakTrigger", me.tpLunchBreakTriggerReadOnly, me.tpLunchBreakTriggerShow, "Radio", "LunchBreakTriggerRadio");
			me.setControlState("HouseCodeType", me.tpHouseCodeTypeReadOnly, me.tpHouseCodeTypeShow, "Radio", "HouseCodeTypeRadio");
			me.setControlState("RoundingTimePeriod", me.tpRoundingTimePeriodReadOnly, me.tpRoundingTimePeriodShow, "Radio", "RoundingTimePeriodRadio");
			me.setControlState("TimeAttendance", me.tpTimeAndAttendanceReadOnly, me.tpTimeAndAttendanceShow, "Radio", "TimeAttendanceRadio");
			me.setControlState("EPaySite", me.tpEPaySiteReadOnly, me.tpEPaySiteShow, "Check", "EPaySiteCheckText");
			me.setControlState("EPayTask", me.tpEPayTaskReadOnly, me.tpEPayTaskShow, "Check", "EPayTaskCheck");			
			me.setControlState("CeridianCompanyHourly", me.tpCeridianCompanyHourlyReadOnly, me.tpCeridianCompanyHourlyShow);
			me.setControlState("CeridianCompanySalaried", me.tpCeridianCompanySalariedReadOnly, me.tpCeridianCompanySalariedShow);
		},
		
		setControlState: function() {
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean}, 
				ctrlShow: {type: Boolean, required: false, defaultValue: false}, 
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});
			var me = this;
			
			if (args.ctrlReadOnly && args.ctrlType != "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			
			if (!args.ctrlShow && args.ctrlType != "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList				
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName + "Yes").attr('disabled', true);
				$("#" + args.ctrlName + "No").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "DefaultLunchBreak") {
				$("#" + args.ctrlName + "025").attr('disabled', true);
				$("#" + args.ctrlName + "050").attr('disabled', true);
				$("#" + args.ctrlName + "075").attr('disabled', true);
				$("#" + args.ctrlName + "100").attr('disabled', true);
				$("#" + args.ctrlName + "other").attr('disabled', true);
				$("#BreakOthersText").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "LunchBreakTrigger") {
				$("#" + args.ctrlName + "4").attr('disabled', true);
				$("#" + args.ctrlName + "6").attr('disabled', true);
				$("#" + args.ctrlName + "8").attr('disabled', true);
				$("#" + args.ctrlName + "Others").attr('disabled', true);
				$("#BreakTriggerText").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "HouseCodeType") {
				$("#" + args.ctrlName + "NU").attr('disabled', true);
				$("#" + args.ctrlName + "UCB").attr('disabled', true);
				$("#" + args.ctrlName + "UACB").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "RoundingTimePeriod") {
				$("#" + args.ctrlName + "15").attr('disabled', true);
				$("#" + args.ctrlName + "6").attr('disabled', true);
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Check" && args.ctrlName == "EPaySite") {
				$("#EPayPayText").attr('disabled', true);
				$("#EPayPayAction").removeClass("iiInputAction");
			}
			
			if (!args.ctrlShow && (args.ctrlType == "Radio" || args.ctrlType == "Check")) {
				$("#" + args.ctrlDiv).hide();
			} 
		},
		
		resize: function() {
			var me = this;	
			
		},
		
		defineFormControls: function() {			
			var args = ii.args(arguments, {});
			
			var me = this;
			
			me.payrollProcessing = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayrollPro" ,
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });	
			
			me.breakOthers = new ui.ctl.Input.Text({
		        id: "BreakOthers" ,
		        maxLength: 5,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.breakOthers.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
		
				if (me.breakOthers.getValue() == "") 
					return;
				
				var otherValue = parseFloat(me.breakOthers.getValue());
				if (/^[0-9]+(\.[0-9]+)?$/.test(me.breakOthers.getValue()) == false 
						|| otherValue == 0.25 || otherValue == 0.5 || otherValue == 0.75 || otherValue == 1)
					this.setInvalid("Please enter valid Default Lunch Break.");
			});
			
			me.breakTrigger = new ui.ctl.Input.Text({
		        id: "BreakTrigger" ,
		        maxLength: 5,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.breakTrigger.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
		
				if (me.breakTrigger.getValue() == "") 
					return;
				
				var otherValue = parseFloat(me.breakTrigger.getValue());
				if (/^[0-9]+(\.[0-9]+)?$/.test(me.breakTrigger.getValue()) == false 
						|| otherValue == 4 || otherValue == 6 || otherValue == 8)
					this.setInvalid("Please enter valid Lunch Break Trigger.");
			});
			
			me.ceridianCompanySalaried = new ui.ctl.Input.DropDown.Filtered({
		        id: "CeridianCompanySalaried" ,
				formatFunction: function( type ) { return type.title; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });	
			
			me.ceridianCompanyHourly = new ui.ctl.Input.DropDown.Filtered({
		        id: "CeridianCompanyHourly" ,
				formatFunction: function( type ) { return type.title; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.ePaySite = new ui.ctl.Input.Check({
		        id: "EPaySite",
				required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); } 
		    });
			
			me.ePayPayGroup = new ui.ctl.Input.DropDown.Filtered({
		        id: "EPayPay" ,
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.ePayTask = new ui.ctl.Input.Check({
		        id: "EPayTask",
				required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); } 
		    });
		},
		
		resizeControls: function() {
			var me = this;
			
			me.payrollProcessing.resizeText();
			me.breakOthers.resizeText();
			me.breakTrigger.resizeText();
			me.ceridianCompanySalaried.resizeText();
			me.ceridianCompanyHourly.resizeText();
			me.ePayPayGroup.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "payrollMasters",
				itemConstructor: fin.hcm.payroll.PayPayrollCompany,
				itemConstructorArgs: fin.hcm.payroll.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys	
			});
			
			me.payrollProcessings = [];
			me.payrollProcessingStore = me.cache.register({
				storeId: "payrollProcessingLocationTypes",
				itemConstructor: fin.hcm.payroll.PayrollProcessingLocationType,
				itemConstructorArgs: fin.hcm.payroll.payrollProcessingLocationTypeArgs,
				injectionArray: me.payrollProcessings	
			});
			
			me.ePayGroupTypes = [];
			me.ePayGroupTypeStore = me.cache.register({
				storeId: "ePayGroupTypes",
				itemConstructor: fin.hcm.payroll.EPayGroupType,
				itemConstructorArgs: fin.hcm.payroll.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});
			
			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.hcm.payroll.HouseCodeType,
				itemConstructorArgs: fin.hcm.payroll.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
			});
		},
		
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: { type: Object } // The (key) event object
			});						
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
					case 83: // Ctrl+S
						parent.fin.hcmMasterUi.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						parent.fin.hcmMasterUi.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},
		
		payPayrollCompanysLoaded: function(me, activeId) {
						
			if (me.payPayrollCompanys[0] == null) {
				alert("No matching record found!!");
				return;
			}
			
			me.ceridianCompanySalaried.reset();
			me.ceridianCompanySalaried.setData(me.payPayrollCompanys);
			
			me.ceridianCompanySalaried.reset();
			me.ceridianCompanyHourly.setData(me.payPayrollCompanys);
			
			var payPayrollCompany;
			
			for (index in me.payPayrollCompanys){
				payPayrollCompany = me.payPayrollCompanys[index];
								
				if (payPayrollCompany.salary == true) {
					me.ceridianCompanySalaried.select(parseInt(index), me.ceridianCompanySalaried.focused);
				}
				
				if (payPayrollCompany.hourly == true) {
					me.ceridianCompanyHourly.select(parseInt(index), me.ceridianCompanyHourly.focused);
				}				
			}
			
			me.payrollProcessings.unshift(new fin.hcm.payroll.PayrollProcessingLocationType({ id: 0, number: 0, name: "None" }));
			me.payrollProcessing.reset();
			me.payrollProcessing.setData(me.payrollProcessings);
			
			me.ePayGroupTypes.unshift(new fin.hcm.payroll.EPayGroupType({ id: 0, number: 0, name: "None"}));
			me.ePayPayGroup.reset();
			me.ePayPayGroup.setData(me.ePayGroupTypes);

			me.houseCodePayrollsLoaded();			
			me.resizeControls();
		},		
		
		houseCodePayrollsLoaded: function(me, activeId) {
			
			var me = this;
			var index = 0;
			
			if (parent.fin.hcmMasterUi == undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] == undefined) return;

			var houseCode = parent.fin.hcmMasterUi.houseCodeDetails[0];

			//Default Lunch Break
			index = ii.ajax.util.findIndexById(houseCode.payrollProcessingLocationTypeId.toString(), me.payrollProcessings);
			if (index != undefined)
				me.payrollProcessing.select(index, me.payrollProcessing.focused);
				
			//Default Lunch Break
			index = ii.ajax.util.findIndexById(houseCode.ePayGroupType.toString(), me.ePayGroupTypes);
			if (index != undefined)
				me.ePayPayGroup.select(index, me.ePayPayGroup.focused);	
				
			me.ePaySiteSelect = houseCode.ePaySite;
			me.ePayTask.check.checked = houseCode.ePayTask;
			
			if (houseCode.ePaySite == true)
				$('#EPaySiteCheck').attr('checked', true);
			else
				$('#EPaySiteCheck').attr('checked', false);
			
			if (houseCode.timeAndAttendance == true)
				$('#TimeAttendanceYes').attr('checked', true);
			else
				$('#TimeAttendanceNo').attr('checked', true);
			
			if (houseCode.defaultLunchBreak == "0.25")
				$('#DefaultLunchBreak025').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "0.50")
				$('#DefaultLunchBreak050').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "0.75")
				$('#DefaultLunchBreak075').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "1.00")
				$('#DefaultLunchBreak100').attr('checked', true);
			else {
				$('#DefaultLunchBreakother').attr('checked', true);
				me.breakOthers.setValue(houseCode.defaultLunchBreak);					
			}  	
			
			//Lunch Break Trigger				
			if (houseCode.lunchBreakTrigger == '4')
				$('#LunchBreakTrigger4').attr('checked', true);
			else if(houseCode.lunchBreakTrigger == '6')
				$('#LunchBreakTrigger6').attr('checked', true);
			else if(houseCode.lunchBreakTrigger == '8')
				$('#LunchBreakTrigger8').attr('checked', true);
			else {
				$('#LunchBreakTriggerOthers').attr('checked', true);
				me.breakTrigger.setValue(houseCode.lunchBreakTrigger);					
			} 
			
			if (houseCode.houseCodeTypeId != undefined) {
				if (houseCode.houseCodeTypeId == '3')
					$('#HouseCodeTypeUACB').attr('checked', true);
				else if (houseCode.houseCodeTypeId == '2')
					$('#HouseCodeTypeUCB').attr('checked', true);
				else
					$('#HouseCodeTypeNU').attr('checked', true);
			}	
			
			//Rounding Time Period
			if (houseCode.roundingTimePeriod == 15)
				$('#RoundingTimePeriod15').attr('checked', true);
			else
				$('#RoundingTimePeriod6').attr('checked', true);
			
			me.assignValue();
			
			parent.fin.hcmMasterUi.checkLoadCount();
			if (parent.parent.fin.appUI.modified)
				parent.fin.hcmMasterUi.setStatus("Edit");
			me.resizeControls();
		},
		
		assignValue: function(){			
			
			var me = this;

			me.payrollTimeAttendance = ($("input[name='TimeAttendance']:checked").val() == "true" ? true : false);
			me.payrollDefaultLunchBreak = $("input[name='DefaultLunchBreak']:checked").val();
			if (me.payrollDefaultLunchBreak != 0) me.breakOthers.setValue("");
			
			me.payrollLunchBreakTrigger= $("input[name='LunchBreakTrigger']:checked").val();
			if (me.payrollLunchBreakTrigger != 0) me.breakTrigger.setValue("");	
			me.payrollHouseCodeType = $("input[name='HouseCodeType']:checked").val();
			me.payrollRoundingTimePeriod = $("input[name='RoundingTimePeriod']:checked").val();			
		}
	}
});

function main() {
	fin.hcmPayrollCodeUi = new fin.hcm.payroll.UserInterface();
	fin.hcmPayrollCodeUi.resize();
}
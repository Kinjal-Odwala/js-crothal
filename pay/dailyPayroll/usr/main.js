ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.pay.dailyPayroll.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);

ii.Class({
    Name: "fin.pay.dailyPayroll.UserInterface",
    Definition: {
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var queryStringArgs = {};
			var queryString = location.search.substring(1);
			var pairs = queryString.split("&"); 
			
			for (var index = 0; index < pairs.length; index++) { 
				var pos = pairs[index].indexOf("="); 
				if (pos == -1) continue; 
				var argName = pairs[index].substring(0, pos); 
				var value = pairs[index].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			me.houseCodeId = queryStringArgs["houseCodeId"];

			me.lastSelectedRowIndex = -1;
			me.productiveHours = 0.00;
			me.grossHours = 0.00;
			me.netHours = 0.00;
			me.actionCommand = "";
			me.empPayPeriod = false;
			me.empApprove = false;
			me.payEmployeePunchId = 0;
			me.employees = [];
			me.weekStartDate = "";
			me.weekEndDate = "";
			me.payrollDate = "";
			me.shiftStartTime = "";
			me.shiftEndTime = "";
			me.shiftType = 0;
			me.workShiftId = 0;
			me.allocatedPaycodes = [];
			
			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 50;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			
			me.validator = new ui.ctl.Input.Validation.Master();			
			
			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\SalaryWages";

			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();

			me.workDay.fetchingData();
			me.workShift.fetchingData();

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);			
			me.weekDayDetailsLoaded();
		},
		
		authorizationProcess: function fin_pay_dailyPayroll_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (!me.isAuthorized) {
				$("#messageToUser").text("Load Failed");
				$("#pageLoading").show();
				return;
			}

			me.dailyPayrollReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabDailyPayroll\\Read");
			me.dailyPayrollWriteApprove = me.authorizer.isAuthorized(me.authorizePath + "\\TabDailyPayroll\\WriteApprove");			
			me.dailyPayrollWriteNoApprove = me.authorizer.isAuthorized(me.authorizePath + "\\TabDailyPayroll\\WriteNoApprove");
			
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pay_dailyPayroll_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},
				
		resize: function() {
			var me = fin.payDailyPayrollUi;
		
			$("#LabelTotal").width($("#divRightGrid").width() - 345);
			
			if (me == undefined)
				return;

			me.dailyEmployeePunchGrid.setHeight(150);

			if (ii.browser.ie) {
				me.payCodeAllocatedGrid.setHeight($(window).height() - 355);
				me.employeeDetailGrid.setHeight($(window).height() - 73);
			}
			else {
				me.payCodeAllocatedGrid.setHeight($(window).height() - 350);
				me.employeeDetailGrid.setHeight($(window).height() - 66);
			}
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
						me.saveDailyPayroll();
						processed = true;
						break;

					case 85: // Ctrl+U
						me.actionUndoDailyPayroll();
						processed = true;
						break;
				}
			}

			if (processed) {
				return false;
			}
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});			
			var me = this;			

			me.saveButton = new ui.ctl.buttons.Sizeable({
				id: "SaveButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveDailyPayroll(); },
				hasHotState: true
			});

			me.undoButton = new ui.ctl.buttons.Sizeable({
				id: "UndoButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoDailyPayroll(); },
				hasHotState: true
			});

			me.approveButton = new ui.ctl.buttons.Sizeable({
				id: "ApproveButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.approveDailyPayroll(); },
				hasHotState: true
			});

			me.unApproveButton = new ui.ctl.buttons.Sizeable({
				id: "UnApproveButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;UnApprove&nbsp;&nbsp;</span>",
				clickFunction: function() { me.unApproveDailyPayroll(); },
				hasHotState: true
			});

			me.okButton = new ui.ctl.buttons.Sizeable({
				id: "btnOkay",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Ok&nbsp;&nbsp;</span>",
				clickFunction: function() { me.btnOkayInsert(); },
				hasHotState: true
			});

			me.cancelButton = new ui.ctl.buttons.Sizeable({
				id: "btnCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.btnCancelClick(); },
				hasHotState: true
			});

			$("#ApproveButton").hide();
			$("#UnApproveButton").hide();

			me.workDay = new ui.ctl.Input.DropDown.Filtered({
				id: "WorkDay",				
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.workDayChanged(); }
			});

			me.workDay.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if ((this.focused || this.touched) && me.workDay.indexSelected == -1)
				        this.setInvalid("Please select the correct Day.");
				});

			me.workShift = new ui.ctl.Input.DropDown.Filtered({
		        id: "WorkShift" ,
		        formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.workShiftChanged(); }
		    });

			me.workShift.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if ((this.focused || this.touched) && me.workShift.indexSelected == -1)
				        this.setInvalid("Please select the correct Shift.");
				});

			me.dailyEmployeePunchGrid = new ui.ctl.Grid({
				id: "DailyEmployeePunchGrid",
				appendToId: "divForm",
				allowAdds: true,
				createNewFunction: fin.pay.dailyPayroll.EmployeePunch,				
				selectFunction: function( index ) { me.itemEmployeePunchSelect(index); }
			});
			
			me.punchOverRideTime = new ui.ctl.Input.Text({
				id:"PunchOverRideTime",
				appendToId: "DailyEmployeePunchGridControlHolder"
			});
			
			me.punchOverRideTime.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function(isFinal, dataMap) {

					var enteredText = me.punchOverRideTime.getValue();
					var dateText = "";

					if (enteredText == "" && me.punchUseTime.getValue() != "")
						return;
	
					if (enteredText.length < 12) {
						dateText = new Date("1/1/1900 " + enteredText);
						
						if (dateText == "Invalid Date" || isNaN(new Date("1/1/1900 " + enteredText))) {
							this.setInvalid("Please enter valid date.");
							return;
						}							
					}
					else {
						dateText = new Date(enteredText);
						
						if (dateText == "Invalid Date" || isNaN(new Date(enteredText))) {
							this.setInvalid("Please enter valid date.");
							return;
						}							
					}

					var overRideTime;
					var shiftStartTime;
					var shiftEndTime;

					if (enteredText.length < 12)
						overRideTime = new Date(me.payrollDate + " " + enteredText);
					else
						overRideTime = new Date(enteredText);

					shiftStartTime = new Date(me.shiftStartTime);
					shiftEndTime = new Date(me.shiftEndTime);

					if (overRideTime < shiftStartTime || overRideTime > shiftEndTime) {
						this.setInvalid("Override Time should be between " + me.shiftStartTime + " and " + me.shiftEndTime + ".");
						return;
					}

					me.punchUseTime.setValue(me.punchOverRideTime.getValue());
					me.setGrossHours();
				});

			me.punchUseTime = new ui.ctl.Input.Text({
				id:"PunchUseTime",
				appendToId: "DailyEmployeePunchGridControlHolder"
			});

			me.dailyEmployeePunchGrid.addColumn("", "", "", "", 30, function() {
				var index = me.dailyEmployeePunchGrid.rows.length - 1;
				var approved = (me.employeeDetailGrid.data[me.employeeDetailGrid.activeRowIndex].name.indexOf("[POSTED]") > 0);

				if (me.dailyEmployeePunchGrid.data[index].punchTime != "" || approved)
					return "";
				else
                	return "<center><img src='/fin/cmn/usr/media/Common/delete.png' title='Delete Overide Punch Time' id=\"imgDelete" + index + "\" onclick=\"fin.payDailyPayrollUi.actionDeletePunch(" + index + ");\" /></center>";
          	});
			me.dailyEmployeePunchGrid.addColumn("punchTime", "punchTime", "Punch Time", "Punch Time", 160, null);
			me.dailyEmployeePunchGrid.addColumn("overRidetime", "overRidetime", "Override Time", "Override Time", 160, null, me.punchOverRideTime); 
			me.dailyEmployeePunchGrid.addColumn("useTime", "useTime", "Use Time", "Use Time", null, null, me.punchUseTime);
			me.dailyEmployeePunchGrid.capColumns();

			me.dailyLunch = new ui.ctl.Input.Check({
		        id: "DailyLunch",
				changeFunction: function() { me.dailyLunchChanged(); }
		    });

			me.payCodeAllocatedGrid = new ui.ctl.Grid({
				id: "PayCodeAllocatedGrid",
				appendToId: "divForm",
				allowAdds: true,
				createNewFunction: fin.pay.dailyPayroll.PaycodeAllocation,
				selectFunction: function( index ) { me.itemEmployeePaycodeAllocationSelect(index); }
			});

			me.payCodeType = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayCodeType" ,
		        formatFunction: function( type ) { return type.name; },
		        appendToId: "PayCodeAllocatedGridControlHolder"
		    });	

			me.payCodeType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.payCodeType.indexSelected == -1)
						this.setInvalid("Please select the correct Pay Code.");
				});

			me.payCodeAllocatedHours = new ui.ctl.Input.Text({
				id: "PayCodeAllocatedHours",
				appendToId: "PayCodeAllocatedGridControlHolder",
				changeFunction: function() { me.calculateTotal(); }
			});
			
			me.payCodeAllocatedHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.payCodeAllocatedHours.getValue();

					if (enteredText == "")
						return;

					if (/^((\d+(\.\d+)?)|(\.\d+))$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});			

			me.payCodeAllocatedGrid.addColumn("", "", "", "", 30, function() {
				var index = me.payCodeAllocatedGrid.rows.length - 1;				
				var approved = (me.employeeDetailGrid.data[me.employeeDetailGrid.activeRowIndex].name.indexOf("[POSTED]") > 0);

				if (me.payCodeAllocatedGrid.data[index].employeePunchPayCodeAllocation == 0 || approved)
					return "";
				else
                	return "<center><img src='/fin/cmn/usr/media/Common/delete.png' title='Delete Pay Code' id=\"imgPayCodeDelete" + index + "\" onclick=\"fin.payDailyPayrollUi.actionDeletePayCode(" + index + ");\" /></center>";
           	});
			me.payCodeAllocatedGrid.addColumn("payCode", "payCode", "Pay Code", "Pay Code", null, function(paycode) { return paycode.name; }, me.payCodeType);
			me.payCodeAllocatedGrid.addColumn("hours", "hours", "Hours", "Hours", 100, null, me.payCodeAllocatedHours);
			me.payCodeAllocatedGrid.addColumn("remainingHours", "remainingHours", "Remaining", "Remaining", 100);
			me.payCodeAllocatedGrid.addColumn("weeklyTotalHours", "weeklyTotalHours", "Weekly Total", "Paycode Weekly Total", 120);
			me.payCodeAllocatedGrid.capColumns();
			
			me.employeeDetailGrid = new ui.ctl.Grid({
				id: "EmployeeDetail",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemEmployeeSelect(index); }				
			});
			
			me.employeeDetailGrid.addColumn("punches", "punches", "", "Status of Punches", 30, function(punches) {
				if (punches == 0)
                	return "<center><img src='/fin/cmn/usr/media/Common/yellow.png' / title='No punches'></center>";
				else if ((punches % 2) == 0)
                	return "<center><img src='/fin/cmn/usr/media/Common/green.png' / title='Correct number of punches'></center>";
				else
                	return "<center><img src='/fin/cmn/usr/media/Common/red.png' / title='Mismatched / an odd number of punches'></center>";
            });
			me.employeeDetailGrid.addColumn("name", "name", "Employee Name", "Employee Name", null);
			me.employeeDetailGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee #", 100);
			me.employeeDetailGrid.capColumns();
			
			me.punchOverRideTime.active = false;
			me.payCodeType.active = false;
			me.payCodeAllocatedHours.active = false;
			
			$("#imgPayCodeAdd").bind("click", function() { me.payCodeOpen(); });
			$("#selFilterWorkShift").bind("change", function() { me.filterWorkShiftChange(); });
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevDailyPayroll(); });
			$("#imgNext").bind("click", function() { me.nextDailyPayroll(); });
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});			
			var me = this;

			me.workShiftTypes = [];
			me.workShiftTypeStore = me.cache.register({
				storeId: "payrollDailyMasters",
				itemConstructor: fin.pay.dailyPayroll.WorkShiftType,
				itemConstructorArgs: fin.pay.dailyPayroll.workShiftTypeArgs,
				injectionArray: me.workShiftTypes	
			});			

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.pay.dailyPayroll.PayCodeType,
				itemConstructorArgs: fin.pay.dailyPayroll.payCodeTypeArgs,
				injectionArray: me.payCodeTypes	
			});

			me.dailyPayrollCount = [];
			me.dailyPayrollCountStore = me.cache.register({
				storeId: "employeePayrollCount",
				itemConstructor: fin.pay.dailyPayroll.DailyPayrollCount,
				itemConstructorArgs: fin.pay.dailyPayroll.dailyPayrollCountArgs,
				injectionArray: me.dailyPayrollCount
			});	

			me.employeeDetails = [];
			me.employeeDetailStore = me.cache.register({
				storeId: "payEmployeeDetails",
				itemConstructor: fin.pay.dailyPayroll.EmployeeDetail,
				itemConstructorArgs: fin.pay.dailyPayroll.employeeDetailArgs,
				injectionArray: me.employeeDetails	
			});

			me.employeePayPeriods = [];
			me.employeePayPeriodStore = me.cache.register({
				storeId: "employeePayPeriods",
				itemConstructor: fin.pay.dailyPayroll.EmployeePayPeriod,
				itemConstructorArgs: fin.pay.dailyPayroll.employeePayPeriodArgs,
				injectionArray: me.employeePayPeriods	
			});	

			me.employeeWorkShifts = [];
			me.employeeWorkShiftStore = me.cache.register({
				storeId: "payrollDailyPayrollMasters",
				itemConstructor: fin.pay.dailyPayroll.EmployeeWorkShift,
				itemConstructorArgs: fin.pay.dailyPayroll.employeeWorkShiftArgs,
				injectionArray: me.employeeWorkShifts	
			});

			me.employeePunches = [];
			me.employeePunchStore = me.cache.register({
				storeId: "payEmployeePunchs",
				itemConstructor: fin.pay.dailyPayroll.EmployeePunch,
				itemConstructorArgs: fin.pay.dailyPayroll.employeePunchArgs,
				injectionArray: me.employeePunches	
			});

			me.paycodeAllocations = [];
			me.paycodeAllocationStore = me.cache.register({
				storeId: "payPaycodeAllocations",
				itemConstructor: fin.pay.dailyPayroll.PaycodeAllocation,
				itemConstructorArgs: fin.pay.dailyPayroll.paycodeAllocationArgs,
				injectionArray: me.paycodeAllocations,
				lookupSpec: {payCode: me.payCodeTypes}
			});

			me.workShifts = [];
			me.workShiftStore = me.cache.register({
				storeId: "payWorkShifts",
				itemConstructor: fin.pay.dailyPayroll.WorkShift,
				itemConstructorArgs: fin.pay.dailyPayroll.workShiftArgs,
				injectionArray: me.workShifts	
			});
		},
		
		controlReadOnly: function(){
			var me = this;

			if (me.dailyPayrollReadOnly || parent.fin.payMasterUi.salaryWagesReadOnly) {

				me.dailyEmployeePunchGrid.columns["overRidetime"].inputControl = null;
				me.dailyEmployeePunchGrid.columns["useTime"].inputControl = null;
				me.dailyEmployeePunchGrid.allowAdds = false;

				me.payCodeAllocatedGrid.columns["payCode"].inputControl = null;
				me.payCodeAllocatedGrid.columns["hours"].inputControl = null;
				me.payCodeAllocatedGrid.allowAdds = false;

				for (var index = 0; index < me.dailyEmployeePunchGrid.rows.length; index++) {
					$("#imgDelete" + index).hide();
				}

				for (var index = 0; index < me.payCodeAllocatedGrid.rows.length; index++) {
					$("#imgPayCodeDelete" + index).hide();
				}

				$("#DailyLunchCheck").attr('disabled', true);
				$("#imgPayCodeAdd").hide();
				$("#actionMenu").hide();
				$("#footerCommand").hide();			
			}

			if (me.dailyPayrollWriteNoApprove) {
				$("#ApproveButton").hide();
				$("#UnApproveButton").hide();
			}
		},		

		resizeControls: function() {
			var me = this;
			
			me.workDay.resizeText();			
			me.workShift.resizeText();
			me.dailyEmployeePunchGrid.setHeight($(me.dailyEmployeePunchGrid.element).parent().height() - 2);
			me.resize();
		},
		
		weekDayDetailsLoaded: function() {
			var me = this;			
			var payMasterUi = parent.fin.payMasterUi;

			me.weekDayDetails = [];
			me.weekStartDate = payMasterUi.weeks[payMasterUi.week.indexSelected].weekStartDate;
			me.weekEndDate = payMasterUi.weeks[payMasterUi.week.indexSelected].weekEndDate;

			for (var index = 0; index < 7; index++) {
				var date = new Date(me.weekStartDate);
				date.setDate(date.getDate() + index);
				var month = date.getMonth() + 1;
				var day = date.getDate();
				var year = date.getFullYear();
				month = (month < 10) ? "0" + month : month;
				day = (day < 10) ? "0" + day : day;
				var item = new fin.pay.dailyPayroll.WeekDayDetail(index + 1, index + 1, month + "/" + day + "/" + year);
				me.weekDayDetails.push(item);
			}

			me.workDay.reset();
			me.workDay.setData(me.weekDayDetails);
			me.workDay.select(0, me.workDay.focused);
			me.payrollDate = me.workDay.lastBlurValue;

			me.resizeControls();
			me.workShiftTypesLoad();
		},

		workShiftTypesLoad: function() {
			var me = this;

			me.workShiftTypeStore.fetch("userId:[user],payCodeType:daily", me.workShiftTypesLoaded, me);
		},

		workShiftTypesLoaded: function(me, activeId) {

			me.workShiftTypes.unshift(new fin.pay.dailyPayroll.WorkShiftType({ id: 0, number: 0, name: "None" }));
			me.workShift.reset();
			me.workShift.setData(me.workShiftTypes);
			me.payCodeType.reset();
			me.payCodeType.setData(me.payCodeTypes);
			me.dailyPayrollCountLoad();
	
		    var payCodeRow = "";
		    var payCodeTemplate = $("#tblPayCodeTemplate").html();
			
			$("#tblPayCode").empty();
		    
		    //add the list of pay codes to the select box
		    for (var index = 0; index < me.payCodeTypes.length; index++) {
		        //add the paycode to the pay code addition list
		        payCodeRow = payCodeTemplate;
		        payCodeRow = payCodeRow.replace("RowStyle", ((index % 2) ? "Regular" : "Alternate"));
		        payCodeRow = payCodeRow.replace(/RowCount/g, index);
				payCodeRow = payCodeRow.replace(/PayCodeId/g, me.payCodeTypes[index].id);
		        payCodeRow = payCodeRow.replace(/PayCode/g, me.payCodeTypes[index].brief);
		        payCodeRow = payCodeRow.replace("Description", me.payCodeTypes[index].name);
		        $("#tblPayCode").append(payCodeRow);		        
		    }
			
			//fill the work shift drop downs
		    var selWorkShift = $("#selWorkShift");
			var selFilterWorkShift = $("#selFilterWorkShift");
		   
		    selWorkShift.empty();
			selFilterWorkShift.empty();
		    selWorkShift.append("<option value=\"0\">(All)</option>");
			selFilterWorkShift.append("<option value=\"0\">(All)</option>");
		    
		    for (var index = 1; index < me.workShiftTypes.length; index++) {
		        selWorkShift.append("<option value=\"" + me.workShiftTypes[index].id + "\">" + me.workShiftTypes[index].name + "</option>");
				selFilterWorkShift.append("<option value=\"" + me.workShiftTypes[index].id + "\">" + me.workShiftTypes[index].name + "</option>");
		    }
		},
		
		dailyPayrollCountLoad: function() {
		    var me = this;
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
				    
		    me.dailyPayrollCountStore.reset();
			me.dailyPayrollCountStore.fetch("userId:[user]," + "houseCodeId:" + me.houseCodeId + ",shiftType:" + me.shiftType + ",type:daily", me.dailyPayrollCountLoaded, me);
		},
		
		dailyPayrollCountLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");

			me.lastSelectedRowIndex = -1;
			me.startPoint = 1;
		    me.recordCount = me.dailyPayrollCount[0].recordCount;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);
		    		    
		    //if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;
		    
		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}
		    
		    selPageNumber.val(me.pageCurrent);
		    $("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");

			me.employeeDetailStore.fetch("houseCodeId:" + me.houseCodeId + ",shiftType:" + me.shiftType + ",punchDate:" + me.payrollDate + ",startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows + ",userId:[user]", me.employeeDetailsLoaded, me);
		},
		
		employeeDetailsLoaded: function(me, activeId) {
			
			me.employeeDetailGrid.setData(me.employeeDetails);
			
			if (me.employeeDetails.length <= 0) {
				me.empEmployeeId = 0;
				$("#pageLoading").hide();
				return false;				
			}
			
			if (me.lastSelectedRowIndex == -1) {
				me.lastSelectedRowIndex = 0;
			}
			
			me.employeeDetailGrid.body.select(me.lastSelectedRowIndex);
			
			//make sure we clean out the employee information
			me.employees = [];
			$("#selEmployee").empty();
			$("#selEmployee").append("<option value=\"\">(All Employees on Page)</option>");
			$("#selEmployee").append("<option value=\"-1\">(All Employees in House Code)</option>");

			for (var rowCount = 0; rowCount < me.employeeDetails.length; rowCount++) {
			    //add the employee to the list of employees
			    var employee = {};
			    employee.index = rowCount;
				employee.id = me.employeeDetails[rowCount].id;
			    employee.name = me.employeeDetails[rowCount].name;
			    employee.employeeNumber = me.employeeDetails[rowCount].employeeNumber;
			    me.employees.push(employee);				    
				
			    //add the employee to the pay code screen
			    $("#selEmployee").append("<option value=\"" + rowCount + "\">" + employee.name + "</option>");
			}

			me.controlReadOnly();
		},
		
		itemEmployeeSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;			
			
			if (me.employeeDetailGrid.data[index].name.indexOf("[POSTED]") > 0) {
				$("#UnApproveButton").show();
				$("#ApproveButton").hide();
			}
			else {
				$("#ApproveButton").show();
				$("#UnApproveButton").hide();
			}

			me.lastSelectedRowIndex = index;
			me.payrollDate = me.workDay.lastBlurValue;
			me.empEmployeeId = me.employeeDetailGrid.data[index].id;
			$("#EmployeeName").text(me.employeeDetails[index].name);
			$("#EmployeeNumber").text(me.employeeDetails[index].employeeNumber);

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();

			me.dailyEmployeePunchGrid.body.deselectAll(true);
			me.payCodeAllocatedGrid.body.deselectAll(true);
			
			me.employeePayPeriodStore.fetch("userId:[user],empEmployee:" + me.empEmployeeId + ",workDay:" + me.payrollDate, me.employeePayPeriodLoaded, me);
		},	
		
		employeePayPeriodLoaded: function(me, activeId) {

			$.each(me.employeePayPeriods, function() {

				me.periodFrequency = this.payPeriodFrequency;
				me.periodStartDate = this.payPeriodStartDate;
				me.periodEndDate = this.payPeriodEndDate;
				me.empPayPeriod = this.allowPayrollModification;
				me.empApprove = this.approve;				
			});

			me.loadPaycodeAllocations();
		},
		
		loadPaycodeAllocations: function() {
			var me = this;

			me.paycodeAllocationStore.reset();
			me.employeeWorkShiftStore.reset();
			me.employeeWorkShiftStore.fetch("empEmployee:" + me.empEmployeeId + ",payrollDate:" + me.payrollDate + ",weekStartDate:" + me.weekStartDate + ",weekEndDate:" + me.weekEndDate + ",userId:[user]", me.employeeWorkShiftsLoaded, me);
		},

		employeeWorkShiftsLoaded: function(me, activeId) {			

			if (me.employeeWorkShifts.length > 0) {
				me.workShiftId = me.employeeWorkShifts[0].workShift;

				var index = ii.ajax.util.findIndexById(me.workShiftId.toString(), me.workShiftTypes);
				if (index != undefined)
					me.workShift.select(index, me.workShift.focused);

				me.shiftStartTime = me.employeeWorkShifts[0].employeeShiftStartTime;
				me.shiftEndTime = me.employeeWorkShifts[0].employeeShiftEndTime;
				me.productiveHours = parseFloat(me.employeeWorkShifts[0].productiveHours);
				me.grossHours  = parseFloat(me.employeeWorkShifts[0].grossHours);
				me.netHours = parseFloat(me.employeeWorkShifts[0].netHours);
				me.dailyLunch.check.checked = me.employeeWorkShifts[0].useLunch;
				me.loadEmployeePunches();

				if (me.workShiftTypes[me.workShift.indexSelected].id == 0)
					$("#PunchWorkShift").text("");
				else
					$("#PunchWorkShift").text(me.employeeWorkShifts[0].employeeShiftStartTime + " - " + me.employeeWorkShifts[0].employeeShiftEndTime);				

				$("#GrossHours").text(me.employeeWorkShifts[0].grossHours);
				$("#NetHours").text(me.employeeWorkShifts[0].netHours);
			}

			me.paycodeAllocationsLoaded(me, 0);
		},
		
		loadEmployeePunches: function() {
			var me = this;

			me.dailyEmployeePunchGrid.body.deselectAll(true);			
			me.dailyEmployeePunchGrid.setData([]);
			me.employeePunchStore.reset();
			me.employeePunchStore.fetch("userId:[user],empEmployee:" + me.empEmployeeId + ",workShift:" + me.workShiftId + ",payrollDate:" + me.payrollDate, me.employeePunchesLoaded, me);
		},

		employeePunchesLoaded: function(me, activeId) {

			me.dailyEmployeePunchGrid.setData(me.employeePunches);
			me.setGrossHours();
			me.controlReadOnly();
		},
		
		paycodeAllocationsLoaded: function(me, activeId) {

			var hours = 0;
			var totalHours = 0;
			var paycodeWeeklyTotal = 0;
			var remainingHours = me.netHours;

			me.allocatedPaycodes = [];
			me.paycodeAllocationsCountOnLoad = me.paycodeAllocations.length;

			if (me.paycodeAllocations.length == 0 && me.employeeWorkShifts[0].defaultPayCode > 0) {
				var payCodeType = [];
				
				for (var index = 0; index < me.payCodeTypes.length; index++) {
					if (me.payCodeTypes[index].id == me.employeeWorkShifts[0].defaultPayCode) {
						payCodeType = me.payCodeTypes[index];
						break;
					}
				}
				
				var item = new fin.pay.dailyPayroll.PaycodeAllocation(0, 0, 0, "", payCodeType, me.netHours.toFixed(2), "0.00", "0.00", false);
				me.paycodeAllocations.push(item);
			}

			for (var index = 0; index < me.paycodeAllocations.length; index++) {
				hours = parseFloat(me.paycodeAllocations[index].hours);
				remainingHours = remainingHours - hours;
				totalHours += hours;
				me.paycodeAllocations[index].remainingHours = (remainingHours > 0 ? remainingHours.toFixed(2) : "0.00")
				
				var allocatedPaycode = {};
			    allocatedPaycode.index = index;
				allocatedPaycode.payCode = me.paycodeAllocations[index].payCode;
				allocatedPaycode.hours = me.paycodeAllocations[index].hours;
			    allocatedPaycode.weeklyTotalHours = me.paycodeAllocations[index].weeklyTotalHours;
			    me.allocatedPaycodes.push(allocatedPaycode);
			}

			me.payCodeAllocatedGrid.setData(me.paycodeAllocations);
			paycodeWeeklyTotal = parseFloat(me.productiveHours) + totalHours;

			if (remainingHours < 0)
				remainingHours = 0;

			$("#TotalHours").text(totalHours.toFixed(2));
			$("#TotalHoursRemaining").text(remainingHours.toFixed(2));
			$("#PaycodeWeeklyTotal").text(paycodeWeeklyTotal.toFixed(2));
			$("#pageLoading").hide();

			me.controlReadOnly();
		},

		calculateTotal: function() {
			var me = this;
			var hours = me.payCodeAllocatedHours.getValue();
			var index = me.payCodeAllocatedGrid.activeRowIndex;
			var paycodeWeeklyTotal = 0;

			if (hours != "" && !isNaN(hours)) {
				if (index < me.allocatedPaycodes.length) {
					var total = parseFloat(me.allocatedPaycodes[index].weeklyTotalHours)
						- parseFloat(me.allocatedPaycodes[index].hours)
						+ parseFloat(hours);

					paycodeWeeklyTotal = parseFloat($("#PaycodeWeeklyTotal").text()) 
						- parseFloat(me.allocatedPaycodes[index].hours)
						+ parseFloat(hours);
						
					$(me.payCodeAllocatedGrid.rows[index].getElement("weeklyTotalHours")).text(total.toFixed(2));
				}
				else {
					paycodeWeeklyTotal = parseFloat($("#PaycodeWeeklyTotal").text()) + parseFloat(hours);
				}
				
				$("#PaycodeWeeklyTotal").text(paycodeWeeklyTotal.toFixed(2));
			}
		},

		itemEmployeePunchSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;
			
			me.punchUseTime.text.readOnly = true;
			
			if (me.dailyEmployeePunchGrid.data[index] != undefined)
				me.payEmployeePunchId = me.dailyEmployeePunchGrid.data[index].id;
			else
				me.payEmployeePunchId = 0;
		},
		
		itemEmployeePaycodeAllocationSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;	

			if (me.paycodeAllocations[index])
				me.paycodeAllocations[index].modified = true;
		},

		prevDailyPayroll: function() {
		    var me = this;
			
			me.pageCurrent--;
			
			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.changeDailyPayroll();
		},

		nextDailyPayroll: function() {
		    var me = this;
			me.pageCurrent++;
			
			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.changeDailyPayroll();
		},
		
		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");
		    
		    me.pageCurrent = Number(selPageNumber.val());
		    me.changeDailyPayroll();
		},

		changeDailyPayroll: function() {
		    var me = this;
		    		        
		    $("#messageToUser").text("Loading");
			$("#pageLoading").show();				
			$("#selPageNumber").val(me.pageCurrent);
			
			me.lastSelectedRowIndex = -1;
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
				
			me.employeeDetailStore.reset();			
			me.employeeDetailStore.fetch("houseCodeId:" + me.houseCodeId + ",shiftType:" + me.shiftType + ",punchDate:" + me.payrollDate + ",startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows + ",userId:[user]", me.employeeDetailsLoaded, me);	
		},
		
		filterWorkShiftChange: function() {
		    var me = this;
			
		    me.shiftType = Number($("#selFilterWorkShift").val());
		    me.dailyPayrollCountLoad();
		},
		
		workDayChanged: function() {			
			var args = ii.args(arguments,{});
			var me = this;

			if (me.workDay.indexSelected == -1)
				return;

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			me.payrollDate = me.workDay.lastBlurValue;
			me.employeeDetailStore.reset();
			me.employeeDetailStore.fetch("houseCodeId:" + me.houseCodeId + ",shiftType:" + me.shiftType + ",punchDate:" + me.payrollDate + ",startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows + ",userId:[user]", me.employeeDetailsLoaded, me);	
		},
		
		workShiftChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.workShift.indexSelected == -1)
				return;

			me.workShiftId = me.workShiftTypes[me.workShift.indexSelected].id;

			if (me.workShiftId == 0)
				$("#PunchWorkShift").text("");
			else {
				$("#messageToUser").text("Loading");
				$("#pageLoading").show();
				me.payrollDate = me.workDay.lastBlurValue;
				me.loadEmployeePunches();
				me.workShiftStore.reset();
				me.workShiftStore.fetch("workShift:" + me.workShiftId + ",punchDate:" + me.payrollDate + ",userId:[user]", me.workShiftsLoaded, me);						
			}
		},
		
		workShiftsLoaded: function(me, activeId) {
			
			if (me.workShifts.length > 0) {				
				$("#PunchWorkShift").text(me.workShifts[0].shiftStartTime + " - " + me.workShifts[0].shiftEndTime);
				me.shiftStartTime = me.workShifts[0].shiftStartTime;
				me.shiftEndTime = me.workShifts[0].shiftEndTime;
			}
			
			$("#pageLoading").hide();
		},
		
		dailyLunchChanged: function() {
			var me = this;
			var netHours = 0;
			var grossHours = parseFloat($("#GrossHours").text());

			if (me.dailyLunch.check.checked && grossHours >= parent.fin.payMasterUi.houseCodeSingles[0].lunchBreakTrigger)
				netHours = grossHours - parent.fin.payMasterUi.houseCodeSingles[0].defaultLunchBreak;
			else
				netHours = grossHours;

			if (netHours < 0)
				me.netHours = 0;
			else
				me.netHours = parseFloat(netHours.toFixed(2));

			$("#NetHours").text(me.netHours.toFixed(2));

			// Assign the net hours to the default paycode automatically only if hours are associated to the single paycode.
			if (me.employeeWorkShifts[0].defaultPayCode > 0 && me.paycodeAllocations.length > 0) {
				var defaultPayCodeIndex = 0;
				var totalHours = 0;

				for (var index = 0; index < me.paycodeAllocations.length; index++) {
					if (me.paycodeAllocations[index].payCode.id == me.employeeWorkShifts[0].defaultPayCode)
						defaultPayCodeIndex = index;
					totalHours += parseFloat(me.paycodeAllocations[index].hours);
				}

				var hours = (me.netHours - totalHours) + parseFloat(me.paycodeAllocations[defaultPayCodeIndex].hours);				
				var weeklyTotal = parseFloat(me.paycodeAllocations[defaultPayCodeIndex].weeklyTotalHours)
						- parseFloat(me.paycodeAllocations[defaultPayCodeIndex].hours)
						+ parseFloat(hours);

				me.paycodeAllocations[defaultPayCodeIndex].hours = hours.toFixed(2);
				me.paycodeAllocations[defaultPayCodeIndex].weeklyTotalHours = weeklyTotal.toFixed(2);
				me.paycodeAllocations[defaultPayCodeIndex].modified = true;
				me.paycodeAllocationsLoaded(me, 0);
			}
		},
		
		// This is a comparison function that will result in dates being sorted in ASCENDING order. 
		dateSort: function (date1, date2) {
		  	
			if (date1 > date2) return 1;
		  	if (date1 < date2) return -1;
		  	return 0;
		},
		
		setGrossHours: function() {
			var me = this;
			var time = "";
			var startTime = "";
			var endTime = "";					
			var useTimes = [];
			var hours = 0;
			var count = 0;

			for (var index = 0; index < me.dailyEmployeePunchGrid.rows.length - 1; index++) {
				if (me.dailyEmployeePunchGrid.activeRowIndex == index)
					time = me.punchUseTime.getValue();
				else
					time = me.dailyEmployeePunchGrid.data[index].useTime;
					
				if (time.length < 12) {
					time = new Date(me.payrollDate + " " + time);
					if (time == "Invalid Date" || isNaN(time))
						time = "";		
				}
				else
					time = new Date(time);
					
				useTimes.push(time);
			}
			
			useTimes.sort(me.dateSort);
			
			while (count < useTimes.length) {
				startTime = useTimes[count];
				count++;
				if (count < useTimes.length) {
					endTime =  useTimes[count]
					hours += me.getGrossHours(startTime, endTime);
				}				
				count++;
			}

			$("#GrossHours").text(hours.toFixed(2));
			me.grossHours = hours.toFixed(2);
			me.dailyLunchChanged();
		},

		getGrossHours: function(startTime, endTime) {
			var me = this;
			var roundingTimePeriod = 0;
			var startTimeMinutes = 0;
			var endTimeMinutes = 0;
			var minutesToAdd = 0;
			var startTimeMinutesMod = 0;
			var endTimeMinutesMod = 0;	
			var roundingTimeCompareValue = 0;
			var hours = 0;
			var minutes = 0;	
			
			if (startTime == "" || endTime == "")
				return 0;
				
			if (startTime.length < 12) {
				startTime = new Date(me.payrollDate + " " + startTime);
				if (startTime == "Invalid Date" || isNaN(startTime))
					return 0;			
			}
			
			if (endTime.length < 12) {
				endTime = new Date(me.payrollDate + " " + endTime);
				if (endTime == "Invalid Date" || isNaN(endTime))
					return 0;			
			}

			roundingTimePeriod = parent.fin.payMasterUi.houseCodeSingles[0].roundingTimePeriod;
			if (roundingTimePeriod == 6)
				roundingTimeCompareValue = 3;
			else
				roundingTimeCompareValue = 8;

			var startDate = new Date(startTime);
			var endDate = new Date(endTime);

			startTimeMinutes =  startDate.getMinutes();
			endTimeMinutes =  endDate.getMinutes();

			startTimeMinutesMod = startTimeMinutes % roundingTimePeriod;
			endTimeMinutesMod = endTimeMinutes % roundingTimePeriod;

			if (startTimeMinutesMod >= roundingTimeCompareValue)
				minutesToAdd = roundingTimePeriod - startTimeMinutesMod;
			else
				minutesToAdd = startTimeMinutesMod * -1;
		
			startDate.setMinutes(startDate.getMinutes() + minutesToAdd );			

			if (endTimeMinutesMod >= roundingTimeCompareValue)
				minutesToAdd = roundingTimePeriod - endTimeMinutesMod;
			else
				minutesToAdd = endTimeMinutesMod * -1;
		
			endDate.setMinutes(endDate.getMinutes() + minutesToAdd );
	
			minutes = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60));
			hours = parseInt(minutes / 60);
			hours += ((minutes % 60) / 60.0);
			
			return hours;
		},
		
		btnCancelClick: function() {
			var me = this;

		    me.payCodeClose();
		},
		
		payCodeOpen: function() {
		    var me = this;
			var employeeIndex = me.employeeDetailGrid.activeRowIndex;

			$("#divPageShield").css({
				"opacity": "0.5"
			});
			$("#divPageShield").fadeIn("slow");
		    $("#divPayCodeDialog").fadeIn("slow");
		    
		    //reset the shift values			
			if (me.workShift.indexSelected >= 0)
				$("#selWorkShift").val(me.workShiftTypes[me.workShift.indexSelected].id);
			else	
		    	$("#selWorkShift").val("");
		    
		    //set the value of the employee
		    $("#selEmployee").val(employeeIndex);
		    
		    //make sure the check boxes are cleared
		    $("#tblPayCode input").attr("checked", false);
		    
		    //set the action of the okay button
		    me.okButton.clickFunction = function() { me.btnOkayInsert(); };
		},
		
		payCodeClose: function() {

			$("#divPageShield").fadeOut("slow");
		    $("#divPayCodeDialog").fadeOut("slow");
		},
		
		btnOkayInsert: function() {
		    //get the information from the form
		    var me = this;
		    var shift = $("#selWorkShift").val();
		    var shifttext = $("#selWorkShift option:selected").text();
		    var employee = $("#selEmployee").val();		   
		    var payCodes = $("#tblPayCode input:checked");
		    var employeeList = [];
		    
		    if (!payCodes.length) {
		        alert("You must select at least one Pay Code.");
		        return;
		    }
			
			if ($("input[name='PayCodeTypes']:checked").val() == "1" && payCodes.length > 1) {
				alert("Only one default Pay Code is allowed.");
		        return;
			}
		   
		    //start the process...		    
	        me.payCodeClose();
		    
	        //are we adding a paycode to the page or entire house code?
	        if (employee == "-1")
	            me.insertHouseCodePayCode(shift, "ALL", payCodes);
	        else {
	            //do we have one employee selected or all?
	            if (employee == "") employeeList = me.employees;
	            else employeeList.push(me.employees[Number(employee)]);
				
				me.insertHouseCodePayCode(shift, employeeList, payCodes);
		    }			
		},
		
		insertHouseCodePayCode: function(shift, employeeList, payCodes) {
		    var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = "";
			var employeeIds = "";
			var payCodeList = "";
			
			//start the process...
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			me.actionCommand = "Insert";
			
			if (employeeList == "ALL")
				employeeIds = "ALL";
			else {
				for (var index = 0; index < employeeList.length; index++) {
					employeeIds += employeeList[index].id + "|"; 
				}
			}

			//convert the jquery array of paycodes to a string
			payCodes.each(function() { payCodeList += this.value + "|"; });

			xml = '<dailyPayrollPaycodeUpdate';				
			xml += ' houseCodeId="' + me.houseCodeId + '"';				
			xml += ' employeeIds="' + employeeIds + '"';				
			xml += ' payCodes="' + payCodeList + '"';
			xml += ' workshift="' + shift + '"';
			xml += ' payrollDate="' + me.payrollDate + '"';
			xml += ' defaultPayCode="' + $("input[name='PayCodeTypes']:checked").val() + '"';
			xml += '/>';
	        
	        // Send the object back to the server as a transaction
		    me.transactionMonitor.commit({
			    transactionType: "itemUpdate",
			    transactionXml: xml,
			    responseFunction: me.saveResponse,
			    referenceData: {me: me, item: item}
		    });
		    
		    return true;
		},
		
		actionUndoDailyPayroll: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.dailyEmployeePunchGrid.body.deselectAll(true);
			me.payCodeAllocatedGrid.body.deselectAll(true);
				
			if (me.employeeDetailGrid.activeRowIndex >= 0) {
				if (!me.validator.queryValidity(true)) {
					alert("In order to undo, the errors on the page must be corrected.");
					return false;
				}
				$("#messageToUser").text("Loading");
				$("#pageLoading").show();
				me.itemEmployeeSelect(me.employeeDetailGrid.activeRowIndex);
			}				
		},
		
		actionDeletePunch: function(index) {
			var me = this;
			var item = [];
			var xml = "";			
			var id = 0;
			
			if (!confirm("Are you sure you want to delete the override punch time " + me.dailyEmployeePunchGrid.data[index].overRidetime + "?"))
				return;

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			id = me.dailyEmployeePunchGrid.data[index].id;
			me.dailyEmployeePunchGrid.body.deselect(index, true);
			me.employeePunches.splice(index, 1);
			me.dailyEmployeePunchGrid.setData(me.employeePunches);
			me.actionCommand = "DeletePunch";

			xml += '<payEmployeePunchDelete';
			xml += ' id="' + id + '"';			
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		actionDeletePayCode: function(index) {
			var me = this;
			var item = [];
			var xml = "";			
			var id = 0;
			
			if (!confirm("Are you sure you want to delete the pay code " + me.payCodeAllocatedGrid.data[index].payCode.name + "?"))
				return;

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			id = me.payCodeAllocatedGrid.data[index].employeePunchPayCodeAllocation;
			me.payCodeAllocatedGrid.body.deselect(index, true);
			me.paycodeAllocations.splice(index, 1);
			me.paycodeAllocationsLoaded(me, 0);
			me.actionCommand = "DeletePayCode";

			xml += '<payEmployeePayCodeDelete';
			xml += ' id="' + id + '"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		actionSaveDailyPayroll: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.actionCommand = "Save";			
			me.saveDailyPayroll();
		},

		approveDailyPayroll: function() {
			var args = ii.args(arguments,{});
			var me = this;			

			if (me.empApprove == false) {
				alert("Previous day has not yet been approved.");
				return;
			}
			else if (new Date(me.payrollDate) > new Date()) {
				alert("Future day punches cannot be approved.");
				return;
			}

			me.actionCommand = "Approving";
			me.saveDailyPayroll();
		},
		
		unApproveDailyPayroll: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.actionCommand = "UnApproving";			
			me.saveDailyPayroll();
		},

		saveDailyPayroll: function() {	
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];

			if (parent.fin.payMasterUi.salaryWagesReadOnly || me.dailyPayrollReadOnly) return;
			
			me.dailyEmployeePunchGrid.body.deselectAll();
			me.payCodeAllocatedGrid.body.deselectAll();
			me.validator.forceBlur();

			if (me.empPayPeriod == false) {
				alert("Closed and future pay periods cannot be edited.");
				return;
			}

			if (me.actionCommand != "UnApproving") {
				if (me.employeeDetailGrid.data[me.employeeDetailGrid.activeRowIndex].name.indexOf("[POSTED]") > 0) {
					alert("Employee already approved.");
					return;
				}
			}

			if (me.actionCommand == "UnApproving") {
				if (me.employeeDetailGrid.data[me.employeeDetailGrid.activeRowIndex].name.indexOf("[POSTED]") < 0) {
					alert("Employee is not approved.");
					return;
				}
			}

			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			var xml = me.saveXmlBuild(item);

			if (xml == "")
				return;
				
			if (me.actionCommand == "Save")
				$("#messageToUser").text("Saving");
			else if (me.actionCommand == "Approving")
				$("#messageToUser").text("Approving");
			else if (me.actionCommand == "UnApproving")
				$("#messageToUser").text("UnApproving");
				
			$("#pageLoading").show();

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
			var args = ii.args(arguments,{
				item: {type: [fin.pay.dailyPayroll.EmployeePunch]}
			});
			var me = this;
			var item = args.item;
			var employeeDailyPayrollId = 0;			
			var index = 0;
			var xml = "";
			var punchIds = "";
			var overRideTimes = "";			
			var payCodeAllocationIds = "";
			var payCodes = "";
			var hours = "";
			var totalHours = 0;
			
			if (me.workShift.indexSelected <= 0) {
				alert("Please select the correct Shift.");
				return "";
			}
			
			//Punches 
			for (index = 0; index < me.dailyEmployeePunchGrid.rows.length - 1; index++) {

				punchIds += (me.dailyEmployeePunchGrid.data[index] != undefined ? me.dailyEmployeePunchGrid.data[index].id.toString() : "0") + "|";
				overRideTimes += (me.dailyEmployeePunchGrid.data[index] != undefined ? me.dailyEmployeePunchGrid.data[index].overRidetime : "") + "|";
		
				if (me.dailyEmployeePunchGrid.data[index].overRidetime != "") {
				
					if (me.dailyEmployeePunchGrid.data[index].overRidetime.length < 9)
						overRideTimeL = new Date(me.payrollDate + " " + me.dailyEmployeePunchGrid.data[index].overRidetime);
					else
						overRideTimeL = new Date(me.dailyEmployeePunchGrid.data[index].overRidetime);
					
					shiftStartTimeL = new Date(me.shiftStartTime);
					shiftEndTimeL = new Date(me.shiftEndTime);

					if (overRideTimeL < shiftStartTimeL || overRideTimeL > shiftEndTimeL) {
						alert("Override Time should be between " + me.shiftStartTime + " and " + me.shiftEndTime + ".");
						return "";
					}
				}
			}

			//Paycode Allocation		
			for (index = 0; index < me.paycodeAllocations.length; index++) {		

				if (me.paycodeAllocations[index].modified || me.actionCommand == "Approving" || me.actionCommand == "UnApproving" || (index >= me.paycodeAllocationsCountOnLoad)) {
					if (me.paycodeAllocations[index].employeePunchPayCodeAllocation > 0 || (parseFloat(me.paycodeAllocations[index].hours) > 0)) {
						payCodeAllocationIds += me.paycodeAllocations[index].employeePunchPayCodeAllocation + "|";
						if (me.actionCommand == "UnApproving")
							payCodes += me.allocatedPaycodes[index].payCode.id + "|";
						else						
							payCodes += me.paycodeAllocations[index].payCode.id + "|";
						hours += me.paycodeAllocations[index].hours + "|";
					}
				}

				totalHours += parseFloat(me.paycodeAllocations[index].hours);
			}

 			totalHours = parseFloat(totalHours.toFixed(2));

			if (parseFloat(totalHours) > parseFloat(me.netHours)) {
				alert("Productive hours cannot be greater than the net hours.");
				return "";
			}

			if (me.actionCommand == "Approving") {
				if (parseFloat(me.netHours) > parseFloat(totalHours)) {
					alert("Net hours must be associated to a productive pay code.");
					return "";
				}					
			}
			
			if ((me.productiveHours + totalHours) > 40) {
				if (!confirm("Warning: You have entered more than 40 hours for Productive Time. "
					+ "Please review OT policy and make adjustments if necessary.\n\n"
					+ "Would you like to continue without making any adjustments?"))
					return "";
			}

			if (me.paycodeAllocations.length > 0)
				employeeDailyPayrollId = me.paycodeAllocations[0].employeeDailyPayroll;

			if (me.actionCommand == "Save") {

				xml = '<dailyPayroll';
				xml += ' houseCodeId="' + me.houseCodeId + '"';
				xml += ' employeeDailyPayrollId="' + employeeDailyPayrollId + '"';						
				xml += ' empEmployee="' + me.empEmployeeId + '"';
				xml += ' payrollDate="' + me.payrollDate + '"';
				xml += ' empWorkShift="' + (me.workShift.indexSelected >= 0 ? me.workShiftTypes[me.workShift.indexSelected].id : 0) + '"';	
				xml += ' shiftStartTime="' + me.shiftStartTime + '"';
				xml += ' shiftEndTime="' + me.shiftEndTime + '"';
				xml += ' grossHours="' + me.grossHours + '"';
				xml += ' netHours="' + me.netHours + '"';
				xml += ' lunch="' + me.dailyLunch.check.checked + '"';
				xml += ' employeePunchIds="' + punchIds + '"';
				xml += ' overrideTimes="' + overRideTimes + '"';
				xml += ' payCodeAllocationIds="' + payCodeAllocationIds + '"';
				xml += ' payCodes="' + payCodes + '"';
				xml += ' hours="' + hours + '"';
				xml += '/>';
			 }
			 else if (me.actionCommand == "Approving") {

				xml = '<dailyPayrollApprove';
				xml += ' houseCodeId="' + me.houseCodeId + '"';
				xml += ' employeeDailyPayrollId="' + employeeDailyPayrollId + '"';				
				xml += ' empEmployee="' + me.empEmployeeId + '"';				
				xml += ' payrollDate="' + me.payrollDate + '"';
				xml += ' empWorkShift="' + (me.workShift.indexSelected >= 0 ? me.workShiftTypes[me.workShift.indexSelected].id : 0) + '"';				
				xml += ' shiftStartTime="' + me.shiftStartTime + '"';
				xml += ' shiftEndTime="' + me.shiftEndTime + '"';
				xml += ' grossHours="' + me.grossHours + '"';
				xml += ' netHours="' + me.netHours + '"';
				xml += ' lunch="' + me.dailyLunch.check.checked + '"';
				xml += ' employeePunchIds="' + punchIds + '"';
				xml += ' overrideTimes="' + overRideTimes + '"';			
				xml += ' payCodeAllocationIds="' + payCodeAllocationIds + '"';
				xml += ' payCodes="' + payCodes + '"';
				xml += ' hours="' + hours + '"';
				xml += '/>';				
			}			
			else if (me.actionCommand == "UnApproving") {

				xml = '<dailyPayrollUnApprove';
				xml += ' houseCodeId="' + me.houseCodeId + '"';
				xml += ' empEmployee="' + me.empEmployeeId + '"';
				xml += ' payrollDate="' + me.payrollDate + '"';
				xml += ' employeePunchIds="' + punchIds + '"';
				xml += ' payCodes="' + payCodes + '"';
				xml += '/>';
			}
			
			return xml;			
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var errorMessage = "";
			var index = 0;

			if (status == "success") {

				if (me.actionCommand == "Save" || me.actionCommand == "Insert") {
					if (me.actionCommand == "Save") {
						index = me.employeeDetailGrid.activeRowIndex;
						if (index >= 0) {
							me.employeeDetails[index].punches = me.dailyEmployeePunchGrid.data.length;
							me.employeeDetailGrid.body.renderRow(index, index);
						}
					}

					me.loadPaycodeAllocations();
				}
				else if (me.actionCommand == "Approving") {

					index = me.employeeDetailGrid.activeRowIndex;
					if (index >= 0) {
						me.employeeDetails[index].name += " [POSTED]";
						me.employeeDetails[index].punches = me.dailyEmployeePunchGrid.data.length;
						me.employeeDetailGrid.body.renderRow(index, index);
						$("#EmployeeName").text(me.employeeDetails[index].name);
					}

					me.loadPaycodeAllocations();

					$("#ApproveButton").hide();
					$("#UnApproveButton").show();
				}
				else if (me.actionCommand == "UnApproving") {

					index = me.employeeDetailGrid.activeRowIndex;
					if (index >= 0) {
						me.employeeDetails[index].name = me.employeeDetails[index].name.replace('[POSTED]', '')
						me.employeeDetailGrid.body.renderRow(index, index);
						$("#EmployeeName").text(me.employeeDetails[index].name);
					}

					me.loadPaycodeAllocations();

					$("#ApproveButton").show();
					$("#UnApproveButton").hide();
				}
				else if (me.actionCommand == "DeletePunch") {
					me.dailyEmployeePunchGrid.body.deselectAll();

					index = me.employeeDetailGrid.activeRowIndex;
					if (index >= 0) {
						me.employeeDetails[index].punches = me.dailyEmployeePunchGrid.data.length;
						me.employeeDetailGrid.body.renderRow(index, index);
					}
					me.setGrossHours();

					var totalHours = 0;
					for (index = 0; index < me.paycodeAllocations.length; index++) {		
						totalHours += parseFloat(me.paycodeAllocations[index].hours);
					}

					totalHours = parseFloat(totalHours.toFixed(2));

					if (parseFloat(totalHours) > parseFloat(me.netHours)) {
						alert("Warning: Productive hours cannot be greater than the net hours.\nPlease make adjustments and save the data.");
					}
				}
				else if (me.actionCommand == "DeletePayCode") {
					me.payCodeAllocatedGrid.body.deselectAll();
				}

				me.actionCommand = "";
				$("#pageLoading").hide();
			}
			else {
				alert("Error while updating Employee Daily Payroll Record: " + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");

				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
				$("#pageLoading").hide();
			}			
		}
	}
});

function main() {
	fin.payDailyPayrollUi = new fin.pay.dailyPayroll.UserInterface();
	fin.payDailyPayrollUi.resize();
}

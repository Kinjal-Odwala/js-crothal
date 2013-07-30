ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.pay.weeklyPayroll.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.dateDropDown", 7 );

ii.Class({
    Name: "fin.pay.weeklyPayroll.UserInterface",
    Definition: {
        init: function() {            
			var args = ii.args(arguments, {});
			var me = this;
			var queryStringArgs = {};
			var queryString = location.search.substring(1);
			var pairs = queryString.split("&");

			for (var index = 0; index < pairs.length; index++) { 
				var pos = pairs[index].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[index].substring(0, pos); 
				var value = pairs[index].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			me.houseCodeId = queryStringArgs["houseCodeId"];
			me.weekDays = [];			
            me.Employees = [];
			me.houseCodeCache = [];
			me.houseCodeLoading = 0;
			me.weeklyPayrollLoading = false;
			me.action = "";
			me.empHourly = 2;
			me.shiftType = 0;
			me.weekStartDate = "";
			me.weekEndDate = "";

			if (parent.fin.payMasterUi != undefined) {
				me.currentWeek = parent.fin.payMasterUi.currentWeek;
				me.currentPeriod = parent.fin.payMasterUi.currentPeriod;
				me.currentFiscalYear = parent.fin.payMasterUi.currentFiscalYear;
			}

			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 25;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			me.pageRows = [];

			//the color that changed fields will be
			me.changedColor = "yellow";          

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
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			
			//load the pay codes and work shifts
			me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.payCodeTypesLoaded, me);
			me.workShiftStore.fetch("userId:[user],", me.workShiftsLoaded, me);
			
			//capture some information about the page
			me.divWeeklyTop = $("#divWeekly").offset().top + 40;
			me.divWeeklyLeft = $("#divWeekly").offset().left + 400;
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			$("#divWeekly").bind("scroll", me.weeklyScroll);
			$("#imgPayCodeAdd").bind("click", function() { me.payCodeOpen("", true); });
			$("#imgPayCodeDelete").bind("click", function() { me.payCodeDeleteAll(""); });
			
			$("#selFilterType").bind("change", function() { me.filterTypeChange(); });
	        $("#selFilterWorkShift").bind("change", function() { me.filterWorkShiftChange(); });
	        $("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
	
			$("#imgSave").bind("click", function() { me.saveWeeklyPayroll(); });
			$("#imgPrev").bind("click", function() { me.prevWeeklyPayroll(); });
			$("#imgNext").bind("click", function() { me.nextWeeklyPayroll(); });
			
			//inputs on the pay code add dialog
			$("#txtHC-1").bind("blur", function() { me.houseCodeBlur(this); });
			$("#selJO-1").bind("blur", function() { me.jobBlur(this); });
			$("#selWO-1").bind("blur", function() { me.workOrderBlur(this); });

			$("#selEmployee, #selType, #selWorkShift, #txtHC-1, #selJO-1, #selWO-1").bind("change", function() { me.modified(); });
        },
		
		authorizationProcess: function fin_pay_weeklyPayroll_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);			

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pay_weeklyPayroll_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			
			if (ii.browser.ie) 				
				this.divWeeklyWidth = $(window).width() - 25;
			else 
				this.divWeeklyWidth = $(window).width() - 10;

			this.divWeeklyHeight = $(window).height() - 110;
			this.divWeeklyBottom = this.divWeeklyTop + this.divWeeklyHeight - 120;
			this.divWeeklyRight = this.divWeeklyLeft + this.divWeeklyWidth - 520;
			
			$("#divWeekly").css({"width" : this.divWeeklyWidth + "px", "height" : this.divWeeklyHeight + "px"});
		},
		
		weeklyScroll: function() {
		    var scrollTop = $("#divWeekly").scrollTop();
		    var scrollLeft = $("#divWeekly").scrollLeft();
		    
		    $("#tblEmployee").css("left", scrollLeft + "px");
		    $("#tblWageHeader").css("left", -scrollLeft + "px");
			$("#tblTotalHeader").css("left", -scrollLeft + "px");
		    $("#tblGrandTotalHeader").css("left", -scrollLeft + "px");
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
						me.actionSaveWeeklyPayroll();
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoWeeklyPayroll();
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
		},
		
		configureCommunications:function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pay.weeklyPayroll.HouseCode,
				itemConstructorArgs: fin.pay.weeklyPayroll.houseCodeArgs,
				injectionArray: me.houseCodes,
				multipleFetchesAllowed: false
			});
				
			me.weeklyPayrolls = [];
			me.weeklyPayrollStore = me.cache.register({
				storeId: "employeeWeeklyPayrolls",
				itemConstructor: fin.pay.weeklyPayroll.WeeklyPayroll,
				itemConstructorArgs: fin.pay.weeklyPayroll.weeklyPayrollArgs,
				injectionArray: me.weeklyPayrolls
			});
			
			me.weeklyPayrollCount = [];
			me.weeklyPayrollCountStore = me.cache.register({
				storeId: "employeePayrollCount",
				itemConstructor: fin.pay.weeklyPayroll.WeeklyPayrollCount,
				itemConstructorArgs: fin.pay.weeklyPayroll.weeklyPayrollCountArgs,
				injectionArray: me.weeklyPayrollCount
			});	
			
			me.weeklyPayrollPayCodes = [];
			me.weeklyPayrollPayCodeStore = me.cache.register({
				storeId: "employeeWeeklyPayrollPayCodes",
				itemConstructor: fin.pay.weeklyPayroll.WeeklyPayrollPayCode,
				itemConstructorArgs: fin.pay.weeklyPayroll.weeklyPayrollPayCodeArgs,
				injectionArray: me.weeklyPayrollPayCodes
			});	
			
			me.workShifts = [];
			me.workShiftStore = me.cache.register({
				storeId: "workShifts",
				itemConstructor: fin.pay.weeklyPayroll.WorkShift,
				itemConstructorArgs: fin.pay.weeklyPayroll.workShiftArgs,
				injectionArray: me.workShifts
			});

			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pay.weeklyPayroll.HouseCodeJob,
				itemConstructorArgs: fin.pay.weeklyPayroll.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.workOrders = [];
			me.workOrderStore = me.cache.register({
				storeId: "womWorkOrders",
				itemConstructor: fin.pay.weeklyPayroll.WorkOrder,
				itemConstructorArgs: fin.pay.weeklyPayroll.workOrderArgs,
				injectionArray: me.workOrders
			});
			
			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.pay.weeklyPayroll.PayCodeType,
				itemConstructorArgs: fin.pay.weeklyPayroll.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});
		},
		
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.parent.fin.appUI.modified = args.modified;
		},

		payCodeTypesLoaded: function(me, activeId) {

		},
		
		workShiftsLoaded: function(me, activeId) {
		    //fill the work shift drop downs
		    var selWorkShift = $("#selWorkShift");
		    var selFilterWorkShift = $("#selFilterWorkShift");
		    
		    selWorkShift.empty();
		    selFilterWorkShift.empty();
		    selWorkShift.append("<option value=\"0\">(All)</option>");
		    selFilterWorkShift.append("<option value=\"0\">(All)</option>");
		    
		    for (var index = 0; index < me.workShifts.length; index++) {
		        selWorkShift.append("<option value=\"" + me.workShifts[index].id + "\">" + me.workShifts[index].name + "</option>");
		        selFilterWorkShift.append("<option value=\"" + me.workShifts[index].id + "\">" + me.workShifts[index].name + "</option>");
		    }
			
			me.weeklyPayrollLoad();
		},
				
		weeklyPayrollLoad: function() {
			var me = this;
			
			if (me.houseCodeId <= 0) {
				alert("Please select House Code.");
				return false;
			}

			$("#pageLoading").show();
			me.startPoint = 1;
			me.pageCurrent = 1;
			me.weeklyPayrollLoading = true;
			
			//start loading the housecode/paycode for our paycode add dialog
			$("#txtHC-1").attr("value", parent.parent.fin.appUI.houseCodeBrief);
			me.houseCodeCheck(-1, parent.parent.fin.appUI.houseCodeBrief);
			
			//start loading the weekdays
			me.weekDaysLoad(); 
		},
		
		weekDaysLoad: function() {
			var me = this;
			var payMasterUi = parent.fin.payMasterUi;
			var item = new fin.pay.weeklyPayroll.WeekDay();
			
			me.weekDays = [];			
			me.weekDays.push(item);
			me.weekStartDate = payMasterUi.weeks[payMasterUi.week.indexSelected].weekStartDate;
			me.weekEndDate = payMasterUi.weeks[payMasterUi.week.indexSelected].weekEndDate;

			for (var index = 0; index < 7; index++) {
				var date = new Date(me.weekStartDate);
				date.setDate(date.getDate() + index);
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();				
				month = (month < 10) ? "0" + month : month;
				day = (day < 10) ? "0" + day : day;				
				me.weekDays[0]["day" + (index + 1)] = month + "/" + day + "/" + year;
			}

	        me.day1 = me.weekDays[0].day1;
		    me.day2 = me.weekDays[0].day2;
		    me.day3 = me.weekDays[0].day3;
		    me.day4 = me.weekDays[0].day4;
		    me.day5 = me.weekDays[0].day5;
		    me.day6 = me.weekDays[0].day6;
		    me.day7 = me.weekDays[0].day7;
 
            $("#spnDay1").html(me.day1);
            $("#spnDay2").html(me.day2);
            $("#spnDay3").html(me.day3);
            $("#spnDay4").html(me.day4);
            $("#spnDay5").html(me.day5);
            $("#spnDay6").html(me.day6);
            $("#spnDay7").html(me.day7);
			
			me.weeklyPayrollPayCodesLoad();
		},
		
		weeklyPayrollPayCodesLoad: function() {
			var me = this;
			
			me.weeklyPayrollPayCodeStore.fetch("userId:[user],"
				+ "houseCodeId:" + me.houseCodeId
				+ ",weekStartDate:" + me.weekStartDate
				+ ",weekEndDate:" + me.weekEndDate
			    , me.weeklyPayrollPayCodesLoaded
			    , me);		
		},
		
		weeklyPayrollPayCodesLoaded: function(me, activeId) {
		    var PayCode = "";
		    var payCodeRow = "";
		    var payCodeTemplate = $("#tblPayCodeTemplate").html();
			
			$("#tblPayCode").empty();
		    
		    //add the list of pay codes to the select box
		    for (var index = 0; index < me.weeklyPayrollPayCodes.length; index++) {
		        //add the paycode to the pay code addition list
		        payCodeRow = payCodeTemplate;
		        payCodeRow = payCodeRow.replace("RowStyle", ((index % 2) ? "Regular" : "Alternate"));
		        payCodeRow = payCodeRow.replace(/RowCount/g, index);
		        payCodeRow = payCodeRow.replace(/PayCode/g, me.weeklyPayrollPayCodes[index].payCode);
		        payCodeRow = payCodeRow.replace("Amount", me.weeklyPayrollPayCodes[index].amount);
		        payCodeRow = payCodeRow.replace("Description", me.weeklyPayrollPayCodes[index].description);
		        $("#tblPayCode").append(payCodeRow);
		        
		        PayCode += "<option value=\"" + me.weeklyPayrollPayCodes[index].payCode + "\">" + me.weeklyPayrollPayCodes[index].description + "</option>";
		    }

		    $("#selPCRowCount").html(PayCode);	
			$("input[id^=chkPC]").bind("change", function() { me.modified(); });
		    me.weeklyPayrollsLoad();
		},
		
		getPayCodeByPayCode: function(payCode) {
		    var me = this;
		    
		    for (var index = 0; index < me.weeklyPayrollPayCodes.length; index++) { 
				if (me.weeklyPayrollPayCodes[index].payCode == payCode) 
					return me.weeklyPayrollPayCodes[index];
			}
		},
		
		weeklyPayrollsLoad: function() {
		    var me = this;

			ii.trace("Weekly payroll total count loading", ii.traceTypes.information, "Info");

		    $("#pageLoading").show();
		    me.weeklyPayrollLoading = true;
		    
		    me.weeklyPayrollCountStore.reset();
			me.weeklyPayrollCountStore.fetch("userId:[user],"
				+ "houseCodeId:" + me.houseCodeId
				+ ",weekStartDate:" + me.weekStartDate
				+ ",weekEndDate:" + me.weekEndDate
				+ ",empHourly:" + me.empHourly
				+ ",shiftType:" + me.shiftType
				, me.weeklyPayrollCountLoaded
				, me);
		},
		
		weeklyPayrollCountLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");
			var rowIndex = 1;
			var startingRowNumber = 1;
			var totalRows = 0;
			var dayTotal = [0, 0, 0, 0, 0, 0, 0];
			var grandTotal = 0;
			var dayRecordCount = 0;
	
			me.pageRows = [];
			me.recordCount = 0;

			for (var index = 0; index < me.weeklyPayrollCount.length; index++) {
				// Calculate the grand total hours
				for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
					dayTotal[dayIndex] += me.weeklyPayrollCount[index]["day" + (dayIndex + 1)];				
				}
				
				me.recordCount += me.weeklyPayrollCount[index].recordCount;
				
				if (totalRows == 0 && me.weeklyPayrollCount[index].recordCount > 25) {
					totalRows = me.weeklyPayrollCount[index].recordCount;
					me.pageRows.push(new fin.pay.weeklyPayroll.PageRow(rowIndex, startingRowNumber, totalRows))
					rowIndex += 1;
					startingRowNumber += totalRows;
					totalRows = 0;
				}
				else if (totalRows + me.weeklyPayrollCount[index].recordCount > 25) {
					me.pageRows.push(new fin.pay.weeklyPayroll.PageRow(rowIndex, startingRowNumber, totalRows))
					rowIndex += 1;
					startingRowNumber += totalRows;
					totalRows = me.weeklyPayrollCount[index].recordCount;
				}
				else
					totalRows += me.weeklyPayrollCount[index].recordCount;
			}
			
			me.pageRows.push(new fin.pay.weeklyPayroll.PageRow(rowIndex, startingRowNumber, totalRows))
			me.pageCount = me.pageRows.length;
			
			//if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;
		    
		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}
		    
		    selPageNumber.val(me.pageCurrent);
		    $("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
			
			me.maximumRows = me.pageRows[me.pageCurrent - 1].totalRows;
		    me.startPoint = me.pageRows[me.pageCurrent - 1].startingRowNumber;
			
			ii.trace("Weekly payroll total count loaded", ii.traceTypes.information, "Info");
			ii.trace("Weekly payroll data loading", ii.traceTypes.information, "Info");
	
			me.weeklyPayrollStore.reset();
			me.weeklyPayrollStore.fetch("userId:[user],"
				+ "houseCodeId:" + me.houseCodeId
				+ ",weekStartDate:" + me.weekStartDate
				+ ",weekEndDate:" + me.weekEndDate
				+ ",startPoint:" + me.startPoint
				+ ",maximumRows:" + me.maximumRows
				+ ",empHourly:" + me.empHourly
				+ ",shiftType:" + me.shiftType
				, me.weeklyPayrollsLoaded
				, me);
				
			// Show the grand total hours at the bottom of the grid
			for (var index = 0; index < 7; index++) {
				$("#spnGrandTotalDay" + (index + 1)).html(dayTotal[index].toFixed(2));
				grandTotal += dayTotal[index];
			}
			$("#spnGrandTotal").html(grandTotal.toFixed(2));
			
			dayTotal = [0, 0, 0, 0, 0, 0, 0];
			grandTotal = 0;

			// Calculate the total hours
			for (var index = 0; index < me.weeklyPayrollCount.length; index++) {
				dayRecordCount += me.weeklyPayrollCount[index].recordCount;

				if ((dayRecordCount >= me.startPoint) && (dayRecordCount < (me.startPoint + me.maximumRows))) {
					for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
						dayTotal[dayIndex] += me.weeklyPayrollCount[index]["day" + (dayIndex + 1)];
					}
				}
			}

			// Show the total hours at the bottom of the grid
			for (var index = 0; index < 7; index++) {
				$("#spnTotalDay" + (index + 1)).html(dayTotal[index].toFixed(2));
				grandTotal += dayTotal[index];
			}
			$("#spnTotal").html(grandTotal.toFixed(2));
		},
		
		weeklyPayrollsLoaded: function(me, activeId) {

			var weeklyPayroll = {};			
			var employeeCount = 0;			
			var employeeNumber = 0;
			var additionalPayCodeExists = false;			

			ii.trace("Weekly payroll data loaded", ii.traceTypes.information, "Info");
			ii.trace("Weekly payroll grid loading", ii.traceTypes.information, "Info");
			
			//make sure we clean out the tables first
			$("#tblEmployeeBody").empty();
			$("#tblWageBody").empty();			

			//and the employee information as well
			me.Employees = [];
			$("#selEmployee").empty();
			$("#selEmployee").append("<option value=\"\">(All Employees on Page)</option>");
			$("#selEmployee").append("<option value=\"-1\">(All Employees in House Code)</option>");
			
			for (var rowCount = 0; rowCount < me.weeklyPayrolls.length; rowCount++) {
			    weeklyPayroll = me.weeklyPayrolls[rowCount];
				additionalPayCodeExists = false;
				
				if (employeeNumber == weeklyPayroll.employeeNumber)
				    additionalPayCodeExists = true;
				else {
				    //add the employee to the list of employees
				    var Employee = {};
				    Employee.index = employeeCount;
				    Employee.name = weeklyPayroll.name;
				    Employee.employeeNumber = weeklyPayroll.employeeNumber;
					Employee.hireDate = weeklyPayroll.hireDate;
				    Employee.type = weeklyPayroll.type;
				    Employee.shift = weeklyPayroll.shift;
				    Employee.payrollHouseCode = weeklyPayroll.payrollHouseCode;
				    Employee.payrollHcmHouseCode = weeklyPayroll.payrollHcmHouseCode;
				    Employee.payrolls = [];
				    me.Employees.push(Employee);				    
					
				    //add the employee to the pay code screen
				    $("#selEmployee").append("<option value=\"" + employeeCount + "\">" + Employee.name + "</option>");
					employeeCount++;
				}
				
				//mark the current employee number and update the last row for the employee
				employeeNumber = weeklyPayroll.employeeNumber;
				Employee.lastPayroll = rowCount;
				Employee.payrolls.push(rowCount);
				
				//make sure we have a legit house code
				if (weeklyPayroll.payrollHouseCode == "")
			        weeklyPayroll.payrollHouseCode = parent.parent.fin.appUI.houseCodeBrief;
			    
			    //build the row
			    me.weeklyPayrollRowBuild(weeklyPayroll, rowCount, employeeCount - 1, !additionalPayCodeExists, rowCount - 1);
			}

			//make sure we aren't loading any house codes..
			me.weeklyPayrollLoading = false;
			if (me.houseCodeLoading <= 0) $("#pageLoading").hide();
			
			//UI level security kaushal kishor
			if (parent.fin.payMasterUi.salaryWagesReadOnly) {
				
				for (var rowNumber = 0; rowNumber < me.weeklyPayrolls.length; rowNumber++) {
					$("#imgAdd" + rowNumber).hide();
					$("#imgDelete" + rowNumber).hide();
					$("#txtHC" + rowNumber).attr('disabled', true);
					$("#selJO" + rowNumber).attr('disabled', true);
					$("#selWO" + rowNumber).attr('disabled', true);
					$("#selPC" + rowNumber).attr('disabled', true);
					$("#txtD1" + rowNumber).attr('disabled', true);
					$("#txtD2" + rowNumber).attr('disabled', true);
					$("#txtD3" + rowNumber).attr('disabled', true);
					$("#txtD4" + rowNumber).attr('disabled', true);
					$("#txtD5" + rowNumber).attr('disabled', true);
					$("#txtD6" + rowNumber).attr('disabled', true);
					$("#txtD7" + rowNumber).attr('disabled', true);					
				}
				
				$("#imgPayCodeAdd").hide();
				$("#imgPayCodeDelete").hide();
				$("#imgSave").hide();				
			}
			
			ii.trace("Weekly payroll grid loaded", ii.traceTypes.information, "Info");
		},
		
		weeklyPayrollRowBuild: function(weeklyPayroll, payrollIndex, employeeIndex, showEmployee, appendRow) {
		    var me = this;
		    var employeeRow = $("#tblEmployeeTemplate").html();
			var wageRow = $("#tblWageTemplate").html();			
			var PayCode = me.getPayCodeByPayCode(weeklyPayroll.payCode);
			var payCodeFound = true;

			if (PayCode == undefined) {
				payCodeFound = false;
				
				for (var index = 0; index < me.payCodeTypes.length; index++) { 
					if (me.payCodeTypes[index].brief == weeklyPayroll.payCode) {
						PayCode = me.payCodeTypes[index];
						break;
					}						
				}
			}
			
			//create the row for the employee
			employeeRow = employeeRow.replace("RowCount", payrollIndex);
			employeeRow = employeeRow.replace("RowStyle", ((employeeIndex % 2) ? "Alternate" : "Regular"));
			
			if (!showEmployee) {
			    employeeRow = employeeRow.replace("Type", "");
			    employeeRow = employeeRow.replace("Shift", "");
			    employeeRow = employeeRow.replace("EmployeeName", "");
			    employeeRow = employeeRow.replace("EmployeeNumber", "");
			    employeeRow = employeeRow.replace("ImageAdd", "");
			}
			else {
			    employeeRow = employeeRow.replace("Type", weeklyPayroll.type);
			    employeeRow = employeeRow.replace("Shift", weeklyPayroll.shift);
			    employeeRow = employeeRow.replace("EmployeeName", weeklyPayroll.name);
			    employeeRow = employeeRow.replace("EmployeeNumber", weeklyPayroll.employeeNumber);
			    employeeRow = employeeRow.replace("ImageAdd", "<img id='imgAdd" + employeeIndex + "'"
			        + " src='/fin/cmn/usr/media/Common/add.png' style='cursor: pointer' alt='Add Pay Code' title='Add Pay Code' />");
			}
			
			employeeRow = employeeRow.replace("ImageDelete", "<img id='imgDelete" + payrollIndex + "'"
				+ " src='/fin/cmn/usr/media/Common/delete.png' style='cursor: pointer' alt='Delete Pay Code' title='Delete Pay Code' />");

			//create the row for the wage information
			wageRow = wageRow.replace(/RowCount/g, payrollIndex);
			wageRow = wageRow.replace("RowStyle", ((employeeIndex % 2) ? "Alternate" : "Regular"));
			wageRow = wageRow.replace("HCValue", weeklyPayroll.payrollHouseCode);
			wageRow = wageRow.replace("D1Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day1);
			wageRow = wageRow.replace("D2Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day2);
			wageRow = wageRow.replace("D3Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day3);
			wageRow = wageRow.replace("D4Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day4);
			wageRow = wageRow.replace("D5Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day5);
			wageRow = wageRow.replace("D6Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day6);
			wageRow = wageRow.replace("D7Value", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.day7);
			wageRow = wageRow.replace("PayStatus", weeklyPayroll.status);			
			wageRow = wageRow.replace("WeekTotal", (PayCode.addToTotal ? "$" : "") + weeklyPayroll.total);
		
			//add the rows
			if (appendRow == -1) {
			    $("#tblEmployeeBody").prepend(employeeRow);
			    $("#tblWageBody").prepend(wageRow);
			}
			else {
			    //get the row we will append after
			    $("#trEmp" + appendRow).after(employeeRow);
			    $("#trPay" + appendRow).after(wageRow);			
			}

			if (weeklyPayroll.status == "Posted") {
				$("#txtHC" + payrollIndex).attr('readonly', true);
				$("#selJO" + payrollIndex).attr('disabled', true);
				$("#selWO" + payrollIndex).attr('disabled', true);
				$("#selPC" + payrollIndex).attr('disabled', true);

				for (var index = 1; index < 8; index++) {					
					$("#txtD" + index + payrollIndex).attr('readonly', true);
				}
			}
			else {
				var hireDate = new Date(weeklyPayroll.hireDate);

				for (var index = 1; index < 8; index++) {
					var dayDate = new Date(me.weekDays[0]["day" + index] + "/" + me.currentFiscalYear);
	
					if (hireDate > dayDate)
						$("#txtD" + index + payrollIndex).attr('readonly', true);
					else
						break;
				}
			}

			//link the add and delete pay code buttons (maybe)
			if (showEmployee)
				$("#imgAdd" + employeeIndex).bind("click", function() { me.payCodeOpen(this.id.replace("imgAdd", ""), true); });
			$("#imgDelete" + payrollIndex).bind("click", function() { me.payCodeDelete(this.id.replace("imgDelete", "")); });
			
			me.houseCodeCheck(payrollIndex, weeklyPayroll.payrollHouseCode);

			// Add the pay code to the dropdown list if it is not available
			if (!payCodeFound && (weeklyPayroll.day1TransactionId > 0
				|| weeklyPayroll.day2TransactionId > 0 || weeklyPayroll.day3TransactionId > 0 
				|| weeklyPayroll.day4TransactionId > 0 || weeklyPayroll.day5TransactionId > 0 
				|| weeklyPayroll.day6TransactionId > 0 || weeklyPayroll.day7TransactionId > 0))
				$("#selPC" + payrollIndex).append("<option value=\"" + PayCode.brief + "\">" + PayCode.name + "</option>");
			
			//select the correct pay code (and see if we remove the others)
			$("#selPC" + payrollIndex).attr("value", weeklyPayroll.payCode);
			if (weeklyPayroll.day1TransactionId != 0) $("#selPC" + payrollIndex + " option:not(:selected)").remove();
			
			//bind all of the functions
			$("#trPay" + payrollIndex + " select[id^=sel]").bind("keyup", function(event) { me.selectKeyUp(event, this); });
			$("#trPay" + payrollIndex + " input[id^=txt]").bind("keyup", function(event) { me.inputKeyUp(event, this); });
			
			$("#trPay" + payrollIndex + " input[id^=txtHC]").bind("blur", function() { me.houseCodeBlur(this); });
			$("#trPay" + payrollIndex + " select[id^=selJO]").bind("blur", function() { me.jobBlur(this); });
			$("#trPay" + payrollIndex + " select[id^=selWO]").bind("blur", function() { me.workOrderBlur(this); });
			$("#trPay" + payrollIndex + " select[id^=selPC]").bind("blur", function() { me.payCodeBlur(this); });
			$("#trPay" + payrollIndex + " input[id^=txtD]").bind("blur", function() { me.wageBlur(this); });
			
			$("#trPay" + payrollIndex + " input").bind("focus", function() { me.inputFocus(this); });
			$("#trPay" + payrollIndex + " select").bind("focus", function() { me.inputFocus(this); });
		},
		
		filterTypeChange: function() {
		    var me = this;

			if ((me.empHourly != Number($("#selFilterType").val())) && !parent.fin.cmn.status.itemValid()) {
	            $("#selFilterType").val(me.empHourly);
	            return false;
	        }

		    me.empHourly = Number($("#selFilterType").val());
		    me.weeklyPayrollsLoad();
		},
		
		filterWorkShiftChange: function() {
		    var me = this;
			
			if ((me.shiftType != Number($("#selFilterWorkShift").val())) && !parent.fin.cmn.status.itemValid()) {
	            $("#selFilterWorkShift").val(me.shiftType);
	            return false;
	        }
			
		    me.shiftType = Number($("#selFilterWorkShift").val());
		    me.weeklyPayrollsLoad();
		},
		
		payrollHouseCodeLoaded: function(me, activeId) {
		
		},
				
		inputFocus: function(objInput) {
		    var inputTop = $(objInput).offset().top;
		    var inputLeft = $(objInput).offset().left;
		    
		    //select the text in the input
		    $(objInput).select();
		    
		    //lets see if we need to do any vertical scrolling
		    if (inputTop > this.divWeeklyBottom) $("#divWeekly").scrollTop($("#divWeekly").scrollTop() + inputTop - this.divWeeklyBottom);
		    else if (inputTop < this.divWeeklyTop) $("#divWeekly").scrollTop($("#divWeekly").scrollTop() + inputTop - this.divWeeklyTop);
		    
		    //lets see if we need to do any horizontal scrolling
		    if (inputLeft > this.divWeeklyRight) $("#divWeekly").scrollLeft($("#divWeekly").scrollLeft() + inputLeft - this.divWeeklyRight);
		    else if (inputLeft < this.divWeeklyLeft) $("#divWeekly").scrollLeft($("#divWeekly").scrollLeft() + inputLeft - this.divWeeklyLeft);
		},
		
		inputKeyUp: function(event, input) {
		    var KeyCode = event.keyCode;
		    //lets make sure we have the correct keycode before we start working
		    if (KeyCode == 13 || KeyCode == 37 || KeyCode == 38 || KeyCode == 39 || KeyCode == 40) {
		        //get the prefix and suffix of the input id
		        var ColPrefix = input.id.substr(0, 5);
		        var RowSuffix = input.id.substr(5, 4);
		        var NextItem = {};
		        var NextColumn = "";
		        var PrevColumn = "";
    		    
		        switch (ColPrefix) {
		            case "txtHC":
		                PrevColumn = "txtD7";
		                NextColumn = "selJO";
		                break;
    		            
		            case "selJO":
		                PrevColumn = "txtHC";
		                NextColumn = "selWO";
		                break;
		                
		            case "selWO":
		                PrevColumn = "selJO";
		                NextColumn = "selPC";
    		            
		            case "selPC":
		                PrevColumn = "selWO";
		                NextColumn = "txtD1";
		                break;
    		            
		            case "txtD1":
		                PrevColumn = "selPC";
		                NextColumn = "txtD2";
		                break;
    		            
		            case "txtD2":
		                PrevColumn = "txtD1";
		                NextColumn = "txtD3";
		                break;
    		            
		            case "txtD3":
		                PrevColumn = "txtD2";
		                NextColumn = "txtD4";
		                break;
    		        
		            case "txtD4":
		                PrevColumn = "txtD3";
		                NextColumn = "txtD5";
		                break;
    		        
		            case "txtD5":
		                PrevColumn = "txtD4";
		                NextColumn = "txtD6";
		                break;
    		            
		            case "txtD6":
		                PrevColumn = "txtD5";
		                NextColumn = "txtD7";
		                break;
    		        
		            case "txtD7":
		                PrevColumn = "txtD6";
		                NextColumn = "txtHC";
		                break;
		        }
    		    
		        //perform our actions based on the key that was pressed
		        switch (KeyCode) {
		            case 37: //left arrow
    		        
		                //trigger the blur
		                $(input).trigger('blur');
    		            
		                NextItem = $(input).parent().prev().prev().find("[id^=" + PrevColumn + "]");
    		            
		                if (NextItem.length) $(NextItem).focus();
		                else $(input).parent().parent().prev().find("[id^=" + PrevColumn + "]").focus();
    		            
		                break;
    		        
		            case 38: //up arrow
    		            
	                    //trigger the blur
	                    $(input).trigger('blur');
    	                
	                    NextItem = $(input).parent().parent().prev().find("[id^=" + ColPrefix + "]");
    	                
	                    if (NextItem.length) $(NextItem).focus().select();
	                    else $("#tblWageBody tr:last-child").find("[id^=" + PrevColumn + "]").focus();
    		            
		                break;
    		            
		            case 39: //right arrow
    		        
		                //trigger the blur
		                $(input).trigger('blur');
    		                
	                    //get the next input
	                    NextItem = $(input).parent().next().next().find("[id^=" + NextColumn + "]");
    	                
	                    if (NextItem.length) $(NextItem).focus();
		                else $(input).parent().parent().next().find("[id^=" + NextColumn + "]").focus();
    		            
		                break;
    		        
		            case 13:  //enter key
		            case 40:  //down arrow
    		        
		                //trigger the blur
		                $(input).trigger('blur');
    		        
		                //get the next item
		                NextItem = $(input).parent().parent().next().find("[id^=" + ColPrefix + "]");
    		            
		                if (NextItem.length) $(NextItem).focus();
		                else if (NextColumn != "") $("#tblWageBody tr:first-child").find("[id^=" + NextColumn + "]").focus();
    		            
		                break;
		        }
		    }
		},
		
		selectKeyUp: function(event, objSelect) {
		    //we are only looking for the enter key
		    if (event.keyCode == 13) {
		        //get the prefix and suffix of the input id
		        var ColPrefix = objSelect.id.substr(0, 5);
		        var RowSuffix = objSelect.id.substr(5, 4);
		        var NextItem = {};
		        var NextColumn = "";
		        var PrevColumn = "";
		        
		        switch (ColPrefix) {
		            case "selJO":
		                PrevColumn = "txtHC";
		                NextColumn = "selPC";
		                break;
    		            
		            case "selPC":
		                PrevColumn = "selJO";
		                NextColumn = "txtD1";
		                break;
		        }
		        
		        //trigger the blur
                $(objSelect).trigger('blur');
	        
                //get the next item
                NextItem = $(objSelect).parent().parent().next().find("[id^=" + ColPrefix + "]");
	            
                if (NextItem.length) $(NextItem).focus().select();
                else if (NextColumn != "") $("#tblWageBody tr:first-child").find("[id^=" + NextColumn + "]").focus().select();
		    }
		},
		
		houseCodeBlur: function(objInput) {
		    var rowNumber = Number(objInput.id.substr(5, 4));
		    
		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");
		    if (objInput.value == "") objInput.value = this.weeklyPayrolls[rowNumber].payrollHouseCode;
		    
		    //before we get started, lets make sure that there was a change
		    //if (objInput.value != this.weeklyPayrolls[rowNumber].payrollHouseCode)
		    //{
		    //    this.houseCodeCheck(rowNumber, objInput.value);
		    //}
		    
		    this.houseCodeCheck(rowNumber, objInput.value);
		},
		
		houseCodeCheck: function(rowNumber, houseCode) {
		    if (this.houseCodeCache[houseCode] != undefined) {
	            if (this.houseCodeCache[houseCode].loaded) {
	                this.houseCodeValidate(houseCode, [rowNumber]);
	            }
	            else
	                this.houseCodeCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            this.houseCodeLoad(rowNumber, houseCode);
		},
		
		houseCodeLoad: function(rowNumber, houseCode) {
		    var me = this;
		    
		    $("#pageLoading").show();
		    me.houseCodeLoading++;
		    
		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
		    me.houseCodeCache[houseCode].buildQueue = [];
		    me.houseCodeCache[houseCode].jobs = [];
		    me.houseCodeCache[houseCode].workOrders = [];
		    me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/pay/act/provider.aspx",
                data: "moduleId=pay&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],"
                    + "appUnitBrief:" + houseCode + ",<criteria>",
                
                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;
		    
		            if ($(xml).find('item').length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = $(this).attr("id");
		                    me.houseCodeJobLoad(houseCode);
		                });
		            }
		            else {
		                //the house code is invalid
		                //validate the list of rows
		                me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);
    		            
		                me.houseCodeLoading--;
		                if (me.houseCodeLoading <= 0 && !me.weeklyPayrollLoading) $("#pageLoading").hide();
		            }
				}
			});
		},
		
		houseCodeJobLoad: function(houseCode) {
		    var me = this;
		    
		    $.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/pay/act/provider.aspx",
                data: "moduleId=pay&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeJobs,userId:[user],"
                    + "houseCodeId:" + me.houseCodeCache[houseCode].id + ",<criteria>",
                
                success: function(xml) {
                    
		            $(xml).find('item').each(function() {
		                var job = {};
		                job.id = $(this).attr("id");
		                job.job = $(this).attr("job");
		                job.jobId = $(this).attr("jobId");
		                job.jobNumber = $(this).attr("jobNumber");
		                job.jobTitle = $(this).attr("jobTitle");
		                job.jobDescription = $(this).attr("jobDescription");
		                me.houseCodeCache[houseCode].jobs.push(job);
		            });
					
					//load the work orders as well
		    		me.houseCodeWorkOrderLoad(houseCode);
				}
			});
		},
		
		houseCodeWorkOrderLoad: function(houseCode) {
		    var me = this;
		    			
			$.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/pay/act/provider.aspx",
                data: "moduleId=pay&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:womWorkOrders,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id
					+ ",houseCodeJobId:0"
					+ ",status:8,<criteria>",
 
                success: function(xml) {
					var workOrder = {};
	                workOrder.id = 0;
	                workOrder.workOrderNumber = "";
	                me.houseCodeCache[houseCode].workOrders.push(workOrder);
		    
		            $(xml).find('item').each(function() {
		                var workOrder = {};
		                workOrder.id = $(this).attr("id");
		                workOrder.workOrderNumber = $(this).attr("workOrderNumber");		                
		                me.houseCodeCache[houseCode].workOrders.push(workOrder);
		            });
					
					//validate the list of rows
		            me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);
		            
		            me.houseCodeLoading--;
		            if (me.houseCodeLoading <= 0 && !me.weeklyPayrollLoading) $("#pageLoading").hide();
				}
			});		    
		},		
		
		houseCodeValidate: function(houseCode, rowArray) {
		    var me = this;
		    var rowNumber = 0;
		    var objInput = {};
		    
		    if (me.houseCodeCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
		            objInput = $("#txtHC" + rowNumber);
		            
	                if (rowNumber >= 0 && objInput.val() != me.weeklyPayrolls[rowNumber].payrollHouseCode) {
	                    me.weeklyPayrolls[rowNumber].changed = true;
	                    me.weeklyPayrolls[rowNumber].payrollHouseCode = houseCode;
	                    me.weeklyPayrolls[rowNumber].payrollHcmHouseCode = me.houseCodeCache[houseCode].id.toString();
	                    objInput.css("background-color", me.changedColor);
						me.modified();
	                }
		            
		            me.jobRebuild(rowNumber, houseCode);
		            me.workOrderRebuild(rowNumber, houseCode);
		        }
		    }
		    else {
		        alert("The House Code of '" + houseCode + "' is not valid.");
		        
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
		            if (rowNumber < 0) $("#txtHC" + rowNumber).attr("value", parent.parent.fin.appUI.houseCodeBrief);
		            else $("#txtHC" + rowNumber).attr("value", me.weeklyPayrolls[rowNumber].payrollHouseCode);
		        }
		        
		        //select the last one changed
		        $("#txtHC" + rowNumber).select();
		    }
		},
		
		jobRebuild: function(rowNumber, houseCode) {
		    var me = this;
			var defaultJobId = 0;
		    var job = {};
		    var selJob = $("#selJO" + rowNumber);
		    
		    selJob.empty();

		    for (var index = 0; index < me.houseCodeCache[houseCode].jobs.length; index++) {
		        job = me.houseCodeCache[houseCode].jobs[index];
		        selJob.append("<option value=\"" + job.id + "\">" + job.jobTitle + "</option>");

				if (job.jobTitle == "[None]")
					defaultJobId = job.id;
		    }
		    
		    //if this isn't the pay code dialog job...
		    if (rowNumber >= 0) {
		        //set the value of the new job
		        if (me.weeklyPayrolls[rowNumber].job == 0)
					selJob.val(defaultJobId.toString());
				else
		        	selJob.val(me.weeklyPayrolls[rowNumber].job.toString());

		        //has it changed?
		        if (selJob.val() != me.weeklyPayrolls[rowNumber].job.toString()) {
		            me.weeklyPayrolls[rowNumber].changed = true;
		            me.weeklyPayrolls[rowNumber].job = Number(selJob.val());
		            selJob.css("background-color", me.changedColor);
					me.modified();
		        }
		    }
		},
		
		jobBlur: function(objSelect) {
			var me = this;		    
		    var rowNumber = Number(objSelect.id.substr(5, 4)); //get the rownumber
		    var found = false;
			
		    //make sure that we have a change
		    if (rowNumber >= 0 && objSelect.value != me.weeklyPayrolls[rowNumber].job) {
				var employee = me.getEmployee(me.weeklyPayrolls[rowNumber].employeeNumber);
				
				for (var index = 0; index < employee.payrolls.length; index++) {
					var weeklyPayroll = me.weeklyPayrolls[employee.payrolls[index]];
					
					if (rowNumber != employee.payrolls[index]) {
						if (weeklyPayroll.payCode == me.weeklyPayrolls[rowNumber].payCode
							&& weeklyPayroll.payrollHcmHouseCode == me.weeklyPayrolls[rowNumber].payrollHcmHouseCode
							&& weeklyPayroll.job == objSelect.value
							&& weeklyPayroll.workOrder == me.weeklyPayrolls[rowNumber].workOrder) {
							found = true;
							break;
						}	
					}
				}
				
				if (!found) {
					me.weeklyPayrolls[rowNumber].changed = true;
		       	 	me.weeklyPayrolls[rowNumber].job = Number(objSelect.value);
		        	$(objSelect).css("background-color", me.changedColor);
					me.modified();
				}
				else
					$("#selJO" + rowNumber).val(me.weeklyPayrolls[rowNumber].job);
		    }
		},
		
		workOrderRebuild: function(rowNumber, houseCode) {
		    var me = this;
		    var workOrder = {};
		    var selWorkOrder = $("#selWO" + rowNumber);
		    
		    selWorkOrder.empty();
		    for (var index = 0; index < me.houseCodeCache[houseCode].workOrders.length; index++) {
		        workOrder = me.houseCodeCache[houseCode].workOrders[index];
		        selWorkOrder.append("<option value=\"" + workOrder.id + "\">" + workOrder.workOrderNumber + "</option>");
		    }
		    
		    //if this isn't the pay code dialog work order...
		    if (rowNumber >= 0) {
		        
		        //set the value of the new work Order
		        selWorkOrder.val(me.weeklyPayrolls[rowNumber].workOrder.toString());
    		    
		        //has it changed?
		        if (selWorkOrder.val() != me.weeklyPayrolls[rowNumber].workOrder.toString()) {
		            me.weeklyPayrolls[rowNumber].changed = true;
		            me.weeklyPayrolls[rowNumber].workOrder = Number(selWorkOrder.val());
		            selWorkOrder.css("background-color", me.changedColor);
					me.modified();
		        }		        
		    }
		},
		
		workOrderBlur: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(5, 4)); //get the rownumber
			var found = false;
		   						
		    //make sure that we have a change
		    if (rowNumber >= 0 && objSelect.value != me.weeklyPayrolls[rowNumber].workOrder) {
				var employee = me.getEmployee(me.weeklyPayrolls[rowNumber].employeeNumber);
				
				for (var index = 0; index < employee.payrolls.length; index++) {
					var weeklyPayroll = me.weeklyPayrolls[employee.payrolls[index]];
					
					if (rowNumber != employee.payrolls[index]) {
						if (weeklyPayroll.payCode == me.weeklyPayrolls[rowNumber].payCode
							&& weeklyPayroll.payrollHcmHouseCode == me.weeklyPayrolls[rowNumber].payrollHcmHouseCode
							&& weeklyPayroll.job == me.weeklyPayrolls[rowNumber].job
							&& weeklyPayroll.workOrder == objSelect.value) {
							found = true;
							break;
						}	
					}
				}
				
				if (!found) {
					me.weeklyPayrolls[rowNumber].changed = true;
		        	me.weeklyPayrolls[rowNumber].workOrder = Number(objSelect.value);
		        	$(objSelect).css("background-color", me.changedColor);
					me.modified();
				}
				else
					$("#selWO" + rowNumber).val(me.weeklyPayrolls[rowNumber].workOrder);
		    }
		},
		
		payCodeBlur: function(objSelect) {
            var me = this;
            var rowNumber = Number(objSelect.id.substr(5, 4));

		    //make sure that we have a change
		    if (objSelect.value != me.weeklyPayrolls[rowNumber].payCode) {
		        //get the old pay code before we change it
		        var oldPayCode = me.getPayCodeByPayCode(me.weeklyPayrolls[rowNumber].payCode);
		        
		        me.weeklyPayrolls[rowNumber].changed = true;
		        me.weeklyPayrolls[rowNumber].payCode = objSelect.value;
		        $(objSelect).css("background-color", me.changedColor);
				me.modified();
		        
		        //now, get the new pay code
		        var newPayCode = me.getPayCodeByPayCode(me.weeklyPayrolls[rowNumber].payCode);
		        
		        //did we change the type of pay code?
		        if (oldPayCode != undefined && newPayCode.addToTotal != oldPayCode.addToTotal) {            
		            
		            //go through and reset the numbers
		            for (var index = 1; index < 8; index++) {
						if (newPayCode.addToTotal)
							$("#txtD" + index + rowNumber).val("$0");
						else
							$("#txtD" + index + rowNumber).val("0");
		                
		                me.weeklyPayrolls[rowNumber]["day" + index] = 0;
		            }
					
					if (newPayCode.addToTotal)
						$("#spnWT" + rowNumber).html("$0");
					else
						$("#spnWT" + rowNumber).html("0");		            
		        }
		    }
		},
		
		wageBlur: function(objInput) {
		    var me = this;
		    var ColPrefix = objInput.id.substr(0, 5);
		    var DayNumber = objInput.id.substr(4, 1);
		    var rowCount = Number(objInput.id.substr(5, 4));
		    var weekTotal = 0;
			var dayTotal = 0;
			var dayGrandTotal = 0;
			var total = 0;
			var grandTotal = 0;

		    //make sure we have a change
		    if (objInput.value != me.weeklyPayrolls[rowCount]["day" + DayNumber]) {
		        //get the pay code for the row
		        var PayCode = me.getPayCodeByPayCode(me.weeklyPayrolls[rowCount].payCode);

		        //remove any unwanted characters
		        objInput.value = objInput.value.replace(/[^0-9\.]/g, "");
 
		        //make sure that it isn't blank
		        if (objInput.value == "") objInput.value = me.weeklyPayrolls[rowCount]["day" + DayNumber];

		        //make sure we don't have too many hours
		        if (!PayCode.addToTotal && objInput.value > 24) {
		            //reset the hours and display a warning
		            objInput.value = me.weeklyPayrolls[rowCount]["day" + DayNumber];
		            alert("Warning: The value entered for days cannot be greater than 24.");
		        }

		        //make sure we don't have a regular code and more than 40 hours in the week
    		    for (var index = 1; index < 8; index++) {
					weekTotal += Number(me.weeklyPayrolls[rowCount]["day" + index]);
				}

    		    weekTotal = weekTotal - Number(me.weeklyPayrolls[rowCount]["day" + DayNumber]) + Number(objInput.value);
				dayTotal = Number($("#spnTotalDay" + DayNumber).html()) - Number(me.weeklyPayrolls[rowCount]["day" + DayNumber]) + Number(objInput.value);
				dayGrandTotal = Number($("#spnGrandTotalDay" + DayNumber).html()) - Number(me.weeklyPayrolls[rowCount]["day" + DayNumber]) + Number(objInput.value);
    		    total = Number($("#spnTotal").html()) - Number(me.weeklyPayrolls[rowCount]["day" + DayNumber]) + Number(objInput.value);
				grandTotal = Number($("#spnGrandTotal").html()) - Number(me.weeklyPayrolls[rowCount]["day" + DayNumber]) + Number(objInput.value);

    		    //make sure that we still have a change...
    		    if (objInput.value != me.weeklyPayrolls[rowCount]["day" + DayNumber]) {
		            me.weeklyPayrolls[rowCount].changed = true;
		            me.weeklyPayrolls[rowCount]["day" + DayNumber] = Number(objInput.value);
		            $(objInput).css("background-color", me.changedColor);
					me.modified();
		            
					if (PayCode.addToTotal)
						$("#spnWT" + rowCount).html("$" + weekTotal.toFixed(2));
					else
						$("#spnWT" + rowCount).html(weekTotal.toFixed(2));
		            
		            if (!PayCode.addToTotal && weekTotal > 40)
		                alert("Warning: You have entered more than 40 hours for Productive Time.\nPlease review OT policy and make adjustments if necessary.");
		        }

				if (PayCode.addToTotal)
					objInput.value = "$" + objInput.value;
				else {
					$("#spnTotalDay" + DayNumber).html(dayTotal.toFixed(2));
					$("#spnGrandTotalDay" + DayNumber).html(dayGrandTotal.toFixed(2));
					$("#spnTotal").html(total.toFixed(2));
					$("#spnGrandTotal").html(grandTotal.toFixed(2));
				}				
		    }
		},
		
		getEmployee: function(employeeNumber) {
			var me = this;
			var employeeIndex = 0;
			
			for (var index = 0; index < me.Employees.length; index++) {
				if (me.Employees[index].employeeNumber == employeeNumber) {
					employeeIndex = index;
					break;
				}
			}
			
			return me.Employees[employeeIndex];
		},
		
		payCodeDelete: function(payrollIndex) {
		    var me = this;
		    var item = [];
			var xml = "";
			var deletePayCode = true;
			var weeklyPayroll = me.weeklyPayrolls[payrollIndex];
			var payCode = me.getPayCodeByPayCode(weeklyPayroll.payCode);

			if (payCode == undefined)
				return;

			if (weeklyPayroll.total == 0) {	

				if (weeklyPayroll.day1TransactionId == 0 && weeklyPayroll.day2TransactionId == 0 
					&& weeklyPayroll.day3TransactionId == 0 && weeklyPayroll.day4TransactionId == 0
					&& weeklyPayroll.day5TransactionId == 0 && weeklyPayroll.day6TransactionId == 0
					&& weeklyPayroll.day7TransactionId == 0) {

					if (!weeklyPayroll.newPayCode)
						return;

					for (var rowIndex = 0; rowIndex < me.Employees.length; rowIndex++) {
						if (me.Employees[rowIndex].employeeNumber == weeklyPayroll.employeeNumber) {
							for (var index = 0; index < me.Employees[rowIndex].payrolls.length; index++) {
								if (me.Employees[rowIndex].payrolls[index] == payrollIndex) {
									if (index == (me.Employees[rowIndex].payrolls.length - 1))
										me.Employees[rowIndex].lastPayroll = me.Employees[rowIndex].payrolls[me.Employees[rowIndex].payrolls.length - 2];
									me.Employees[rowIndex].payrolls.splice(index, 1);
									break;
								}
							}
							break;
						}
					}

					me.recordCount--;
					me.weeklyPayrolls[payrollIndex].changed = false;
					$("#trEmp" + payrollIndex).remove();
					$("#trPay" + payrollIndex).remove();		
					$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
					
					return;
				}
			}
			else
				deletePayCode = false;
				
			if (!deletePayCode) {
				if (payCode.addToTotal)
					alert("You cannot delete the selected pay code. $ Amounts are associated to the pay code [" + payCode.description + "].");
				else
					alert("You cannot delete the selected pay code. Hours are associated to the pay code [" + payCode.description + "].");
				return;
			}

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (!confirm("Are you sure you want to delete the pay code [" + payCode.description + "] for the employee [" + weeklyPayroll.name + "]?"))
				return;
			
			$("#pageLoading").show();
			me.action = "delete";
			xml = me.deleteXmlBuild(weeklyPayroll);
	        			
	        // Send the object back to the server as a transaction
		    me.transactionMonitor.commit({
			    transactionType: "itemUpdate",
			    transactionXml: xml,
			    responseFunction: me.saveResponse,
			    referenceData: {me: me, item: item}
		    });
		    
		    return true;
		},
		
		deleteXmlBuild: function(weeklyPayroll) {
			var me = this;
			var xml = "";
			var dayTransactionId = 0;

			for (var index = 1; index < 8; index++) {

				if (index == 1) dayTransactionId = weeklyPayroll.day1TransactionId;
				else if (index == 2) dayTransactionId = weeklyPayroll.day2TransactionId;
				else if (index == 3) dayTransactionId = weeklyPayroll.day3TransactionId;
				else if (index == 4) dayTransactionId = weeklyPayroll.day4TransactionId;
				else if (index == 5) dayTransactionId = weeklyPayroll.day5TransactionId;
				else if (index == 6) dayTransactionId = weeklyPayroll.day6TransactionId;
				else if (index == 7) dayTransactionId = weeklyPayroll.day7TransactionId;
				
				if (dayTransactionId > 0) {
					xml += "<weeklyPayrollDelete"
						+ " id=\"" + dayTransactionId + "\""
						+ " houseCodeId=\"" + me.houseCodeId + "\""
			            + " weekStartDate=\"" + me.weekStartDate + "\""
			            + " weekEndDate=\"" + me.weekEndDate + "\""
						+ " employeeNumber=\"0\""
			            + " hourly=\"0\""
			            + " workshift=\"0\""
			            + " payCode=\"0\""
			            + " payrollHcmHouseCode=\"0\""
			            + " houseCodeJob=\"0\""
			            + " workOrder=\"0\""
						+ "/>";
				}	            
			}
			        
			return xml;
		},
		
		payCodeDeleteAll: function() {
		    var me = this;
		    
		    //open a window to allow the user to select which paycodes to delete			
		    me.payCodeOpen("", false);
		    
		    //change the action of the OK button
		    me.okButton.clickFunction = function() { me.btnOkayDelete(); };
		},
		
		payCodeOpen: function(employeeIndex, add) {
		    var me = this;
		
			if (!parent.fin.cmn.status.itemValid())
				return;

			if (add)
				$("#PayCodeHeader").html("&nbsp;Add Additional Pay Code");
			else
				$("#PayCodeHeader").html("&nbsp;Delete Pay Code");

			$("#divPageShield").css({
				"opacity": "0.5"
			});
		    $("#divPageShield").fadeIn("slow");
		    $("#divPayCodeDialog").fadeIn("slow");
		    
		    //reset the shift and type values
		    $("#selType").val("2");
		    $("#selWorkShift").val("0");
		    
		    //set the value of the employee
		    $("#selEmployee").val(employeeIndex);
		    
		    //make sure the check boxes are cleared
		    $("#tblPayCode input").attr("checked", false);
			
			if (employeeIndex != "") {
				for (var index = 0; index < me.Employees[employeeIndex].payrolls.length; index++) {				
					$("input[value=" + me.weeklyPayrolls[me.Employees[employeeIndex].payrolls[index]].payCode + "]").attr('checked', true);
				}
			}
		    
		    //set the action of the okay button
		    me.okButton.clickFunction = function() { me.btnOkayInsert(); };
		},
		
		payCodeClose: function() {
		    $("#divPageShield").fadeOut("slow");
		    $("#divPayCodeDialog").fadeOut("slow");
		},
		
		btnOkayDelete: function() {
			//there are two options here
		    //we can remove the existing paycodes that are only on the screen
		    //or we can remove all paycodes for the entire house code		
		    var me = this;
			var type = $("#selType").val();
		    var typeText = $("#selType option:selected").text();
		    var shift = $("#selWorkShift").val();
		    var shiftText = $("#selWorkShift option:selected").text();
		    var employee = $("#selEmployee").val();
			var houseCode = $("#txtHC-1").val();
		    var houseCodeId = me.houseCodeCache[houseCode].id.toString();
		    var job = Number($("#selJO-1").val());
		    var workOrder = $("#selWO-1").val()
		    var payCodes = $("#tblPayCode input:checked");
		    var employeeList = [];
			var selectedPayCodes = [];
			var item = [];
			var xml = "";
		    
		    if (!payCodes.length) {
		        alert("You must select at least one Pay Code.");
		        return;
		    }

			if (!confirm("Are you sure you want to delete the selected Pay Codes?"))
				return;
				
		    //start the process...
		    if (me.houseCodeLoading <= 0) {
		        me.payCodeClose();

		        //are we deleting a paycode to the page or entire house code?
		        if (employee == "-1") {
					me.deleteHouseCodePayCode(type, shift, payCodes, houseCodeId, job, workOrder);				 			           
				}
		        else {
		            //do we have one employee selected or all?
		            if (employee == "") employeeList = me.Employees;
		            else employeeList.push(me.Employees[Number(employee)]);

        		    //go through the list of codes
		            payCodes.each(function() {
		                var payCode = this;						
						selectedPayCodes.push(payCode.value);
					});

	                //go through the list of employees
	                for (var rowIndex = 0; rowIndex < employeeList.length; rowIndex++) {
	                    var employee = employeeList[rowIndex];
						var newPayCodesList = [];
						
						//go through the list of payroll records for the selected employee
						for (var payrollIndex = 0; payrollIndex < employee.payrolls.length; payrollIndex++) {
							var weeklyPayroll = me.weeklyPayrolls[employee.payrolls[payrollIndex]];
							var payCodeIndex = employee.payrolls[payrollIndex];
							var found = false;

							for (var index = 0; index < selectedPayCodes.length; index++) {
								if (selectedPayCodes[index] == weeklyPayroll.payCode) {
									found = true;
									break;
								}
							}

							if (found && ((type != "2" && typeText.substring(0, 1) != weeklyPayroll.type)
								|| (shift != "0" && shiftText != weeklyPayroll.shift)
								|| (houseCodeId != weeklyPayroll.payrollHcmHouseCode)
								|| (job != weeklyPayroll.job)
								|| (workOrder != weeklyPayroll.workOrder))) {
								found = false;
							}

							if (found && weeklyPayroll.total == 0) {										
								if (weeklyPayroll.day1TransactionId > 0 || weeklyPayroll.day2TransactionId > 0 
									|| weeklyPayroll.day3TransactionId > 0 || weeklyPayroll.day4TransactionId > 0
									|| weeklyPayroll.day5TransactionId > 0 ||weeklyPayroll.day6TransactionId > 0
									|| weeklyPayroll.day7TransactionId > 0) {
									xml += me.deleteXmlBuild(weeklyPayroll);
								}
								else {
									if (weeklyPayroll.newPayCode) {
										newPayCodesList.push(payCodeIndex);										
										me.weeklyPayrolls[payCodeIndex].changed = false;
										me.recordCount--;
										$("#trEmp" + payCodeIndex).remove();
										$("#trPay" + payCodeIndex).remove();		
										$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
									}
								}
							}							
						}

						for (var index = 0; index < newPayCodesList.length; index++) {
							for (var payrollIndex = 0; payrollIndex < employee.payrolls.length; payrollIndex++) {
								if (employee.payrolls[payrollIndex] == newPayCodesList[index]) {
									if (payrollIndex == (employee.payrolls.length - 1))
										employee.lastPayroll = employee.payrolls[employee.payrolls.length - 2];
									employee.payrolls.splice(payrollIndex, 1);
									break;
								}
							}
						}
	                }
    		    }
			}
			
			if (xml == "")
				return;
			
			$("#pageLoading").show();
			me.action = "delete";
	        			
	        // Send the object back to the server as a transaction
		    me.transactionMonitor.commit({
			    transactionType: "itemUpdate",
			    transactionXml: xml,
			    responseFunction: me.saveResponse,
			    referenceData: {me: me, item: item}
		    });
		    
		    return true;
		},
		
		deleteHouseCodePayCode: function(type, shift, payCodes, houseCodeId, job, workOrder) {
		    var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = "";
			var payCodeList = "";
			
			//convert the jquery array of paycodes to a string
			payCodes.each(function() { payCodeList += this.value + "|"; });
			
			//start the process...
			$("#pageLoading").show();
			me.action = "delete";
			
			//build the xml string				
			xml = "<weeklyPayrollDelete"
				+ " id=\"0\""
				+ " houseCodeId=\"" + me.houseCodeId + "\""
	            + " weekStartDate=\"" + me.weekStartDate + "\""
			    + " weekEndDate=\"" + me.weekEndDate + "\""
				+ " employeeNumber=\"0\""
	            + " hourly=\"" + type + "\""
	            + " workshift=\"" + shift + "\""
	            + " payCode=\"" + payCodeList + "\""
	            + " payrollHcmHouseCode=\"" + houseCodeId + "\""
	            + " houseCodeJob=\"" + job + "\""
	            + " workOrder=\"" + workOrder + "\""
				+ "/>";
	        
	        // Send the object back to the server as a transaction
		    me.transactionMonitor.commit({
			    transactionType: "itemUpdate",
			    transactionXml: xml,
			    responseFunction: me.saveResponse,
			    referenceData: {me: me, item: item}
		    });
		    
		    return true;
		},
		
		btnOkayInsert: function() {
		    //get the information from the form
		    var me = this;
		    var type = $("#selType").val();
		    var typetext = $("#selType option:selected").text();
		    var shift = $("#selWorkShift").val();
		    var shifttext = $("#selWorkShift option:selected").text();
		    var employee = $("#selEmployee").val();
		    var houseCode = $("#txtHC-1").val();
		    var houseCodeId = me.houseCodeCache[houseCode].id.toString();
		    var job = Number($("#selJO-1").val());
		    var workOrder = $("#selWO-1").val()
		    var payCodes = $("#tblPayCode input:checked");
		    var employeeList = [];
		    
		    if (!payCodes.length) {
		        alert("You must select at least one Pay Code.");
		        return;
		    }
		   
		    //start the process...
		    if (me.houseCodeLoading <= 0) {
		        me.payCodeClose();
    		    
		        //are we adding a paycode to the page or entire house code?
		        if (employee == "-1")
		            me.insertHouseCodePayCode(type, shift, payCodes, houseCodeId, job, workOrder);
		        else {
		            //do we have one employee selected or all?
		            if (employee == "") employeeList = me.Employees;
		            else employeeList.push(me.Employees[Number(employee)]);
        		    
        		    //go through the list of codes
		            payCodes.each(function() {		                
		                var payCode = this;
		                var employee = {};
		                var payrollIndex = 0;
        		        
		                //go through the list of employees
		                for (var index = 0; index < employeeList.length; index++) {
		                    employee = employeeList[index];

		                    //does the employee meet our filters
		                    if ((type == "2" || typetext.substring(0, 1) == employee.type)
		                        && (shift == "0" || shifttext == employee.shift)) {
								
								//prevent adding duplicate pay codes
								//go through the list of payroll records for the selected employee
								for (var weeklyIndex = 0; weeklyIndex < employee.payrolls.length; weeklyIndex++) {
									var weeklyPayroll = me.weeklyPayrolls[employee.payrolls[weeklyIndex]];
									var found = false;
									
									if (weeklyPayroll.payCode == payCode.value
										&& weeklyPayroll.payrollHcmHouseCode == houseCodeId
										&& weeklyPayroll.job == job
										&& weeklyPayroll.workOrder == workOrder) {
										found = true;
										break;
									}					
								}
								
								if (!found) {
			                        //create a new payroll record
			                        var weeklyPayroll = {};
			                        weeklyPayroll.id = 0;
			                        weeklyPayroll.type = employee.type;
			                        weeklyPayroll.shift = employee.shift;
			                        weeklyPayroll.name = employee.name;
			                        weeklyPayroll.employeeNumber = employee.employeeNumber;
									weeklyPayroll.hireDate = employee.hireDate;

			                        //house code, job, work order and pay code
			                        weeklyPayroll.payrollHouseCode = houseCode;
		                            weeklyPayroll.payrollHcmHouseCode = houseCodeId;
			                        weeklyPayroll.job = job;
			                        weeklyPayroll.jobTitle = "";
			                        weeklyPayroll.workOrder = workOrder;			                        
			                        weeklyPayroll.payCode = payCode.value;
			                        weeklyPayroll.payCodeDescription = "";
			                        		                        
			                        //rest of the stuff
			                        weeklyPayroll.day1 = 0;
			                        weeklyPayroll.day2 = 0;
			                        weeklyPayroll.day3 = 0;
			                        weeklyPayroll.day4 = 0;
			                        weeklyPayroll.day5 = 0;
			                        weeklyPayroll.day6 = 0;
			                        weeklyPayroll.day7 = 0;
			                        weeklyPayroll.status = "Dly Appr";
			                        weeklyPayroll.total = 0;
			                        weeklyPayroll.day1TransactionId = "0";
			                        weeklyPayroll.day2TransactionId = "0";
			                        weeklyPayroll.day3TransactionId = "0";
			                        weeklyPayroll.day4TransactionId = "0";
			                        weeklyPayroll.day5TransactionId = "0";
			                        weeklyPayroll.day6TransactionId = "0";
			                        weeklyPayroll.day7TransactionId = "0";
			                        weeklyPayroll.changed = false;
									weeklyPayroll.newPayCode = true;
	        		                
			                        //add it to the list and get the current count
			                        me.weeklyPayrolls.push(weeklyPayroll);
			                        payrollIndex = me.weeklyPayrolls.length - 1;
	        		                
			                        //build the row
			                        me.weeklyPayrollRowBuild(weeklyPayroll, payrollIndex, employee.index, false, employee.lastPayroll);
	        		                
			                        //update the last row the employee has
			                        employee.lastPayroll = payrollIndex;
									employee.payrolls.push(payrollIndex);
									me.recordCount++;
									$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
								}
		                    }
		                }
		            });
    		    }
			}
		},
		
		btnCancelClick: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

		    me.payCodeClose();
		},
		
		pageNumberChange: function() {
		    var me = this;
			
			if (!parent.fin.cmn.status.itemValid()) {
				$("#selPageNumber").val(me.pageCurrent);
				return;
			}

			me.pageCurrent = Number($("#selPageNumber").val());
		    me.changeWeeklyPayroll();
		},		
		
		prevWeeklyPayroll: function() {
		    var me = this;
			
			me.pageCurrent--;
			
			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else {
				if (!parent.fin.cmn.status.itemValid()) {
					me.pageCurrent++;
					return;
				}
				me.changeWeeklyPayroll();
			}
		},
		
		nextWeeklyPayroll: function() {
		    var me = this;
			
			me.pageCurrent++;
			
			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else {
				if (!parent.fin.cmn.status.itemValid()) {
					me.pageCurrent--;
					return;
				}
				 me.changeWeeklyPayroll();
			}
		},
		
		changeWeeklyPayroll: function() {
		    var me = this;
		    var changed = false;
			/*
		    for (var index = 0; index < me.weeklyPayrolls.length; index++) {
				if (me.weeklyPayrolls[index].changed) {
					changed = true;
					break;
				}
			}		        
		    
		    if (!changed)
		        me.weeklyPayrollsLoad();
		    else {
		        if (confirm("There are unsaved changes. Would you like to save before continuing?"))
		            me.saveWeeklyPayroll();
		        else
		            me.weeklyPayrollsLoad();
		    }*/
			 me.weeklyPayrollsLoad();
		},
		
		actionUndoWeeklyPayroll: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			me.weeklyPayrollsLoad();
		},	
		
		insertHouseCodePayCode: function(type, shift, payCodes, houseCodeId, job, workOrder) {
		    var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = "";
			var payCodeList = "";
			
			//convert the jquery array of paycodes to a string
			payCodes.each(function() { payCodeList += this.value + "|"; });
			//if (payCodeList != "") payCodeList = payCodeList.substr(0, payCodeList.length-1);
			
			//start the process...
			$("#pageLoading").show();
			me.action = "insert";
			
			//build the xml string
			xml = "<weeklyPayrollsPaycodeUpdate"
	            + " houseCodeId=\"" + me.houseCodeId + "\""
	            + " weekStartDate=\"" + me.weekStartDate + "\""
			    + " weekEndDate=\"" + me.weekEndDate + "\""
	            + " hourly=\"" + type + "\""
	            + " workshift=\"" + shift + "\""
	            + " payCode=\"" + payCodeList + "\""
	            + " payrollHcmHouseCode=\"" + houseCodeId + "\""
	            + " houseCodeJob=\"" + job + "\""
	            + " workOrder=\"" + workOrder + "\""
	            + "/>";
	        
	        // Send the object back to the server as a transaction
		    me.transactionMonitor.commit({
			    transactionType: "itemUpdate",
			    transactionXml: xml,
			    responseFunction: me.saveResponse,
			    referenceData: {me: me, item: item}
		    });
		    
		    return true;
		},
		
		actionSaveWeeklyPayroll: function() {
			var args = ii.args(arguments,{});
			var me = this;
		
			me.saveWeeklyPayroll();
		},
		
		saveWeeklyPayroll: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = me.saveXmlBuild(item);
			
			if (xml != "") {
				ii.trace("Weekly payroll data saving", ii.traceTypes.information, "Info");
			    $("#pageLoading").show();
    			
    			// Send the object back to the server as a transaction
			    me.transactionMonitor.commit({
				    transactionType: "itemUpdate",
				    transactionXml: xml,
				    responseFunction: me.saveResponse,
				    referenceData: {me: me, item: item}
			    });
			}
			
			return true;
		},
		
		stringRepeat: function() {
			var args = ii.args(arguments, {
				stringToRepeat: { type: String },
				numberOfRepeat: { type: Number }
			});
			var result = "";
			var counter = 0;
			
			while(counter < args.numberOfRepeat) {
				result += args.stringToRepeat + "|";
				counter++;
			}
			
			return result;
		},
		
		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: { type: [fin.pay.weeklyPayroll.WeeklyPayroll] }
			});
			var me = this;
			var weeklyPayroll = {};
			var payrollChanged = false;			
			var xml = "";
			var employeeSalaryTypes = "";
			var houseCodeJobIds = "";
			var houseCodeWorkOrderIds = "";
			var payrollHcmHouseCodeIds = "";
			var employeeIds = "";
			var payCodes = "";
			var weekDays = "";
			var values = "";
			var transactionIds = "";
			
			//go through the list of records to generate the xml
			for (var index = 0; index < me.weeklyPayrolls.length; index++) {
			    weeklyPayroll = me.weeklyPayrolls[index];
			    
			    if (weeklyPayroll.changed) {
			        payrollChanged = true;
			        payrollHcmHouseCodeIds += me.stringRepeat(weeklyPayroll.payrollHcmHouseCode, 7);
				    houseCodeJobIds += me.stringRepeat(weeklyPayroll.job.toString(), 7);
				    houseCodeWorkOrderIds += me.stringRepeat(weeklyPayroll.workOrder.toString(), 7);
				    employeeSalaryTypes += me.stringRepeat(weeklyPayroll.type, 7);
				    employeeIds += me.stringRepeat(weeklyPayroll.employeeNumber, 7);
				    payCodes += me.stringRepeat(weeklyPayroll.payCode, 7);
				    weekDays += "1|2|3|4|5|6|7|";
				    values += weeklyPayroll.day1.toString() + "|" + weeklyPayroll.day2.toString() + "|"
				        + weeklyPayroll.day3.toString() + "|" + weeklyPayroll.day4.toString()+ "|"
				        + weeklyPayroll.day5.toString() + "|" + weeklyPayroll.day6.toString() + "|" + weeklyPayroll.day7.toString() + "|";
				    transactionIds += weeklyPayroll.day1TransactionId + "|" + weeklyPayroll.day2TransactionId + "|"
				        + weeklyPayroll.day3TransactionId + "|" + weeklyPayroll.day4TransactionId + "|"
				        + weeklyPayroll.day5TransactionId + "|" + weeklyPayroll.day6TransactionId + "|" + weeklyPayroll.day7TransactionId + "|";
				}
			}
			
			if (payrollChanged) {
			    xml = "<weeklyPayroll id=\"1\""
		            + " houseCodeId=\"" + me.houseCodeId + "\""
		            + " weekStartDate=\"" + me.weekStartDate + "\""
			        + " weekEndDate=\"" + me.weekEndDate + "\""
		            + " houseCodeJob=\"" + houseCodeJobIds + "\""
		            + " houseCodeWorkOrder=\"" + houseCodeWorkOrderIds + "\""
		            + " hourly=\"" + employeeSalaryTypes + "\""
		            + " employeeId=\"" + employeeIds + "\""
		            + " payCode=\"" + payCodes + "\""
		            + " payrollHcmHouseCode=\"" + payrollHcmHouseCodeIds + "\""
		            + " weekDay=\"" + weekDays + "\""
		            + " value=\"" + values + "\""
		            + " transactionId=\"" + transactionIds + "\""
		            + " clientId=\"1\""
		            + "/>";
		    }
			        
			return xml;
		},
		
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				ii.trace("Weekly payroll data saved successfully", ii.traceTypes.information, "Info");
				me.modified(false);
				me.action = "";
				me.weeklyPayrollsLoad();
			}
			else {
				$("#pageLoading").hide();

				if (me.action == "insert")
					alert("[SAVE FAILURE] Error while inserting Pay Code(s): " + $(args.xmlNode).attr("message"));
				else if (me.action == "delete")
					alert("[SAVE FAILURE] Error while deleting Weekly Payroll details: " + $(args.xmlNode).attr("message"));
				else
					alert("[SAVE FAILURE] Error while updating Weekly Payroll details: " + $(args.xmlNode).attr("message"));
			}
		}
    }
});

function main() {
	fin.payWeeklyPayrollUi = new fin.pay.weeklyPayroll.UserInterface();
	fin.payWeeklyPayrollUi.resize();
}
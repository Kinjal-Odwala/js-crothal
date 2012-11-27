ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.emp.employeePTO.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);
ii.Style( "fin.cmn.usr.dateDropDown" , 9);

ii.Class({
    Name: "fin.emp.employeePTO.UserInterface",
    Definition: {
        init: function() {            
			var args = ii.args(arguments, {});
			var me = this;
			var queryStringArgs = {}; 
			var queryString = location.search.substring(1); 
			var pairs = queryString.split("&"); 
			
			for(var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 
			
			me.personId = queryStringArgs["personId"];
			me.employeeId = 0;
			me.requestCounter = 0;
			me.ptoBalances = [];
			me.dirtyRows = [];

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "emp\\employeePTO";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.defineFormControls();
			me.configureCommunications();

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			$("#balanceReportHost").mouseover(function() {

				var pos;
				var parentElementHeight;
	
				pos = $("#balanceReportHost").offset();
				parentElementHeight = $("#balanceReportHost").outerHeight();
	
				var left = 0;
				var top = 0;
				
				$("#balanceReport").css({
					left: pos.left + 'px'
					,top: pos.top + parentElementHeight + 'px'
				});

				$("#balanceReport").show();
			});
			
			$("#balanceReportHost").mouseout(function(){
				$("#balanceReport").hide();
			});

			me.fiscalYear.fetchingData();
			me.fiscalYearStore.fetch("userId:[user],sortOrder:Asc,", me.fiscalYearsLoaded, me);
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
        },
		
		authorizationProcess: function fin_emp_employeePTO_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_emp_employeePTO_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});

			fin.empPTOUi.ptoGrid.setHeight($(window).height() - 110);
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			
			var me = this;

			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
		        id: "FiscalYear",
		        formatFunction: function( type ) { return type.name; }
		    });

			me.payCodeOption = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayCodeOption",
				formatFunction: function( type ) { return type.name; }
		    });

			me.load = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadPTODetails(); },
				hasHotState: true
			});

			me.ptoGrid = new ui.ctl.Grid({
				id: "PTOGrid",
				allowAdds: true,
				createNewFunction: fin.emp.employeePTO.PTODetail,
				selectFunction: function( index ) { 
					
					var me = this;
					var arrayIndex = 0;
					var found = false;
					
					for (arrayIndex = 0; arrayIndex < fin.empPTOUi.dirtyRows.length; arrayIndex++) {
						if (fin.empPTOUi.dirtyRows[arrayIndex].id == index) {
							found = true;
							break;
						}
					}

					if(!found) fin.empPTOUi.dirtyRows.push({ id: index});
				}
			});

			me.payCode = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayCode",
				formatFunction: function( type ) { return type.name; },
				appendToId: "PTOGridControlHolder"
		    });

			me.payCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = fin.empPTOUi.payCode.lastBlurValue;
					
					if(enteredText == '') return;
					
					if (fin.empPTOUi.payCodeOption.indexSelected > 0 &&
					fin.empPTOUi.payCodeOption.lastBlurValue != fin.empPTOUi.payCode.lastBlurValue) {
						this.setInvalid("Please select appropriate Pay Code.");
					}
					else {
						for (index = 0; index < fin.empPTOUi.ptoBalances.length; index++) {
						
							if (fin.empPTOUi.ptoBalances[index].id == fin.empPTOUi.payCodes[fin.empPTOUi.payCode.indexSelected].id) 
								return;
							this.setInvalid("Selected Pay Code has not been setup with Opening Balance.");
						}
					}
				});

			me.ptoDate = new ui.ctl.Input.Text({
		        id: "PTODate",
		        maxLength: 30,
				appendToId: "PTOGridControlHolder"
		    });

			me.ptoDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );
			
			me.hours = new ui.ctl.Input.Text({
		        id: "Hours",
		        maxLength: 6,
				appendToId: "PTOGridControlHolder"
		    });

			me.hours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = fin.empPTOUi.hours.getValue();
					
					if(enteredText == '') return;
					
					if(/^\d+(\.\d{1,2})?$/.test(enteredText) == false)
						this.setInvalid("Please enter valid hours. Example: 8.0");
				});
			
			me.adjustmentDate = new ui.ctl.Input.Text({
		        id: "AdjustmentDate",
		        maxLength: 30,
				appendToId: "PTOGridControlHolder"
		    });

			me.adjustmentHours = new ui.ctl.Input.Text({
		        id: "AdjustmentHours",
		        maxLength: 6,
				appendToId: "PTOGridControlHolder"
		    });

			me.adjustmentHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){
					
					var message = "";
					var valid = true;
					var enteredText = fin.empPTOUi.adjustmentHours.getValue();
					
					if(enteredText == '') return;
					
					if(/^\d+(\.\d{1,2})?$/.test(enteredText) == false) {
						valid = false;
						message = 'Please enter valid hours. Example: 8.0';
					}
					
					if(parseFloat(enteredText) > 0 && (fin.empPTOUi.adjustmentDate.lastBlurValue == '' || fin.empPTOUi.adjustmentDate.lastBlurValue == undefined)) {
						valid = false;
						message = 'Please enter corresponding valid Adj Date.';
					}
					
					if(parseFloat(enteredText) <= 0 && fin.empPTOUi.adjustmentDate.lastBlurValue != '') {
						valid = false;
						message = 'Please enter corresponding valid Adj Date.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
		
			me.notes = new ui.ctl.Input.Text({
		        id: "Notes",
		        maxLength: 200,
				appendToId: "PTOGridControlHolder"
		    });
						
			me.ptoGrid.addColumn("payCodeId", "payCodeId", "Pay Code", "Pay Code", 120, function( payPayCode ){ return payPayCode.name; }, this.payCode);
			me.ptoGrid.addColumn("ptoDate", "ptoDate", "Date", "Paid Time Off Date", 100, null, this.ptoDate);
			me.ptoGrid.addColumn("hours", "hours", "Hours", "Paid Time Off Hours", 90, null, this.hours);
			me.ptoGrid.addColumn("adjustmentDate", "adjustmentDate", "Adj Date", "Adjustment Paid Time Off Date", 100, null, me.adjustmentDate);
			me.ptoGrid.addColumn("adjustmentHours", "adjustmentHours", "Adj Hours", "Adjustment Paid Time Off Hours", 90, null, me.adjustmentHours);
			me.ptoGrid.addColumn("notes", "notes", "Notes", "Notes", null, null, this.notes);
			me.ptoGrid.capColumns();
			
			me.save = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
		},
			
		resizeControls: function() {
			var me = this;
			
			me.fiscalYear.resizeText();
			me.payCodeOption.resizeText();
			me.payCode.resizeText();
			me.ptoDate.resizeText();
			me.hours.resizeText();
			me.adjustmentDate.resizeText();
			me.adjustmentHours.resizeText();
			me.notes.resizeText();
			me.resize();
		},	
		configureCommunications: function() {
			var args = ii.args(arguments, {});			
			var me = this;		
			
			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.emp.employeePTO.FiscalYear,
				itemConstructorArgs: fin.emp.employeePTO.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});			
			
			me.payCodes = [];
			me.payCodeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.emp.employeePTO.PayCode,
				itemConstructorArgs: fin.emp.employeePTO.payCodeArgs,
				injectionArray: me.payCodes
			});			
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.employeePTO.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeePTO.employeeGeneralArgs,
				injectionArray: me.employeeGenerals
			});			
			
			me.employeePersonals = [];
			me.employeePersonalStore = me.cache.register({
				storeId: "employeePersonals",
				itemConstructor: fin.emp.employeePTO.EmployeePersonal,
				itemConstructorArgs: fin.emp.employeePTO.employeePersonalArgs,
				injectionArray: me.employeePersonals
			});			
			
			me.ptoDefaults = [];
			me.ptoDefaultStore = me.cache.register({
				storeId: "employeePTODefaults",
				itemConstructor: fin.emp.employeePTO.PTODefault,
				itemConstructorArgs: fin.emp.employeePTO.ptoDefaultArgs,
				injectionArray: me.ptoDefaults
			});			
			
			me.ptoDetails = [];
			me.ptoDetailStore = me.cache.register({
				storeId: "employeePTODetails",
				itemConstructor: fin.emp.employeePTO.PTODetail,
				itemConstructorArgs: fin.emp.employeePTO.ptoDetailArgs,
				injectionArray: me.ptoDetails,
				lookupSpec: {payCodeId: me.payCodes}
			});			

			me.weekPeriodYears = [];
			me.weekPeriodYearStore = me.cache.register({
				storeId: "weekPeriodYears",
				itemConstructor: fin.emp.employeePTO.WeekPeriodYear,
				itemConstructorArgs: fin.emp.employeePTO.weekPeriodYearArgs,
				injectionArray: me.weekPeriodYears
			});
		},
		
		fiscalYearsLoaded: function(me, activeId) {
			
			me.fiscalYear.setData(me.fiscalYears);

			if(me.fiscalYears.length > 0) me.fiscalYear.select(0, me.fiscalYear.focused);

			me.payCodeOption.fetchingData();
			me.payCodeStore.fetch("userId:[user],payCodeType:pto,", me.payCodesLoaded, me);
			
			me.resizeControls();
		},
		
		weekPeriodYearsLoaded: function(me, activeId) {
			if(me.weekPeriodYears.length <= 0) return;

			var index = 0;
						
			for(index = 0; index < me.fiscalYears.length; index++){
				if (me.weekPeriodYears[0].fiscalYear == me.fiscalYears[index].name) {
					me.fiscalYear.select(index, me.fiscalYear.focused);
					break;
				}
			}

			me.employeeGeneralStore.fetch("userId:[user],personId:" + me.personId + ",", me.employeeGeneralsLoaded, me);
		},
			
		employeeGeneralsLoaded: function(me, activeId) {
			
			me.employeeId = me.employeeGenerals[0].id;
			me.ptoDefaultStore.fetch("userId:[user],fiscalYearId:" + me.fiscalYears[me.fiscalYear.indexSelected].id + ",employeeId:" + me.employeeId + ",", me.ptoDefaultsLoaded, me);
		},
			
		payCodesLoaded: function(me, activeId) {
			
			me.payCode.setData(me.payCodes);

			var index = 0;

			me.payCodeOptions = [];
			me.payCodeOptions.push(new fin.emp.employeePTO.PayCode(0, 0, "All"));

			for(index = 0; index < me.payCodes.length; index++) {
				me.payCodeOptions.push(new fin.emp.employeePTO.PayCode(me.payCodes[index].id, me.payCodes[index].number, me.payCodes[index].name));
			} 

			me.payCodeOption.setData(me.payCodeOptions);
			me.payCodeOption.select(0, me.payCodeOption.focused);
		},
		
		ptoDefaultsLoaded: function (me, activeId) {
			
			var index = 0;
			
			for (index = 0; index < me.ptoDefaults.length; index++) {

				me.actionUpdateBalance(index
				, 0.00
				, true
				, me.ptoDefaults[index].payCodeId
				, parseFloat(me.ptoDefaults[index].openingBalanceHours)
				);
			}

			me.actionLoadPTODetails();
		},
		
		actionLoadPTODetails: function() {
			var me = this;
			
			$("#pageLoading").show();
			
			me.requestCounter++; //dummy
			
			me.ptoDetailStore.reset();
			me.ptoDetailStore.fetch("userId:[user],requestId:" + me.requestCounter + ",fiscalYearId:" + me.fiscalYears[me.fiscalYear.indexSelected].id + ",employeeId:" + me.employeeId + ",payCodeId:" + me.payCodeOptions[me.payCodeOption.indexSelected].id + ",", me.ptoDetailsLoaded, me)
		},
		
		ptoDetailsLoaded: function(me, activeId) {

			/*
			 	from PayPayCodes where PayPaycOneTimeCharge = 1 And PayPaycProductive = 0
			 	
				32 (2) - Holiday
				, 33 (3) Vacation
				, 34 (4) - Sick
				, 85 (9P) - Personal Day
				, 84 (9M) - Military Duty
				, 83 (9J) - Jury Duty
				, 82 (9B) - Brevment			 
			*/
			
			me.ptoGrid.setData(me.ptoDetails);
			
			var index = 0;

			//me.ptoBalances = [];
			for(index=0; index < me.ptoBalances.length; index++)
				me.ptoBalances[index].closingBalance = 0;
			
			if (me.ptoDetails.length > 0) {
			
				me.employeeId = me.ptoDetails[0].employeeId;
				
				for (index = 0; index < me.ptoDetails.length; index++) {
					me.actionUpdateBalance(index, parseFloat(me.ptoDetails[index].hours) + parseFloat(me.ptoDetails[index].adjustmentHours));
				}
			}

			me.actionUpdateBalanceNotification();
			
			$("#pageLoading").hide();
		},
		
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {
					type: Object
				} // The (key) event object
			});
			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
			
				switch (event.keyCode) {
					case 83: // Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;
						
					case 85: //Ctrl+U
						me.actionUndoItem();  
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},
		
		actionUpdateBalance: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
				, hours: {type: Number}
				, onLoad: {type: Boolean, required: false, defaultValue: false}
				, payCode: {type: Number, required: false}
				, openingBalance: {type: Number, required: false}
			});			
			
			var me = this;
			var indexBalance = 0;
			var balanceUpdated = false;			
			var payCode = 0;
			var hours = 0.00;
			var openingBalance = 0.00;
			var payCodeTitle = '';
			
			if(args.onLoad){
				payCode = args.payCode;

				indexBalance = ii.ajax.util.findIndexById(payCode.toString(), me.payCodes)
				if (indexBalance != undefined) payCodeTitle = me.payCodes[indexBalance].name;
				hours = 0.00;
				openingBalance = args.openingBalance;
			}
			else
			{
				payCode = me.ptoDetails[args.index].payCodeId.id;
				payCodeTitle = me.ptoDetails[args.index].payCodeId.name;
				hours = args.hours;
				openingBalance = parseFloat(me.ptoDetails[args.index].openingBalanceHours);
			}

			for(indexBalance=0; indexBalance < me.ptoBalances.length; indexBalance++)
			{
				if (me.ptoBalances[indexBalance].id == payCode) {
					if (!args.onLoad) {
						me.ptoBalances[indexBalance].title = payCodeTitle;
						me.ptoBalances[indexBalance].closingBalance += args.hours;
					}
					balanceUpdated = true;
				}
			}
			
			if (balanceUpdated == false) {

				me.ptoBalances.push({
					id: payCode
					, title: payCodeTitle
					, openingBalance: openingBalance
					, closingBalance: hours
				});
			}
			
			balanceUpdated = false;
		},
		
		actionUpdateBalanceNotification: function() {
			var me = this;

			var index = 0;	
			var balanceReport = "<br>PTO Balance Hours<br>";		
			
			for(index=0; index < me.ptoBalances.length; index++)
			{
				balanceReport += "<br>[" + me.ptoBalances[index].title + "]"
						+ " - Opening: " + me.ptoBalances[index].openingBalance 
						+ ", Closing: " + me.ptoBalances[index].closingBalance
						+ "<br>";
			}

			$("#balanceReportBody").html(balanceReport);
		},
		
		actionUndoItem: function() {
			var me = this;
						
			me.ptoGrid.body.deselectAll();	
			me.ptoGrid.setData([]);
			
			me.actionLoadPTODetails();
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var itemHolidays = [];
			var item = null;
			var index = 0;
			var indexBalance = 0;
			var balanceUpdated = false;

			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) && me.ptoGrid.activeRowIndex >= 0){
				alert( "In order to save the errors on the page must be corrected.");
				return false;
			}
			
			me.ptoGrid.body.deselectAll();
			
			me.holidayOpeningBalance = me.ptoDetails[0].hours;

			var errorMessage = '';
			var previousPayCode = 0;
			var adjustmentHours = 0.00;
			var dirtyIndex = 0;
			var dirtyRowFound = false;
			
			//me.ptoBalances = [];
			
			for(index=0; index < me.ptoBalances.length; index++)
				me.ptoBalances[index].closingBalance = 0;
			
			for (index = 0; index < me.ptoDetails.length; index++) {

				adjustmentHours = (me.ptoDetails[index].adjustmentHours == ''? 0.00 : parseFloat(me.ptoDetails[index].adjustmentHours));
				
				me.actionUpdateBalance(index, parseFloat(me.ptoDetails[index].hours) + adjustmentHours);
				previousPayCode = me.ptoDetails[index].payCodeId.id;

				//selected only dirty/visited rows
				for(dirtyIndex=0; dirtyIndex < me.dirtyRows.length ; dirtyIndex++){

					if (me.dirtyRows[dirtyIndex].id == index) {
						dirtyRowFound = true;
						break;
					}
				}
				
				if( !dirtyRowFound) continue;
				
				dirtyRowFound = false;
				
				item = new fin.emp.employeePTO.PTODetail(
					me.ptoDetails[index].id
					, parseInt(me.employeeId) //me.ptoDetails[index].employeeId
					, me.ptoDetails[index].payCodeId
					, '' //payCodeTitle
					, me.ptoDetails[index].ptoDate 
					, '0' //openingBalanceHours
					, me.ptoDetails[index].hours
					, adjustmentHours + ''
					, (me.ptoDetails[index].adjustmentDate == '' ? '1/1/1900' : me.ptoDetails[index].adjustmentDate)
					, me.ptoDetails[index].notes
				);
				
				itemHolidays.push(item);
			}

			for(indexBalance=0; indexBalance < me.ptoBalances.length; indexBalance++)
			{
				if (me.ptoBalances[indexBalance].openingBalance < me.ptoBalances[indexBalance].closingBalance) {
					errorMessage += "Please check Pay Code: [" + me.ptoBalances[indexBalance].title + "]"
						+ ", Balance hours Opening: " + me.ptoBalances[indexBalance].openingBalance 
						+ ", Closing: " + me.ptoBalances[indexBalance].closingBalance
						+ "\n";
				}
			}
			
			if(errorMessage.length > 0){
				alert(errorMessage);
				return false;
			}
			
			me.actionUpdateBalanceNotification();
			
			var xml = me.saveXmlBuild(itemHolidays);

			if(xml == ""){
				//alert( "There is no row to edited.");
				return false;
			}
			
			$("#messageToUser").html("Saving");
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
				item: {type: [fin.emp.employeePTO.PTODetail]}
			});		
			var me = this;
			var clientId = 0;
			var item = args.item;
			var xml = "";
			var index = 0;
						
			for (index = 0; index < args.item.length; index++) {
				
				xml += '<employeePTODetail';

				xml += ' id="' + args.item[index].id + '"';
				xml += ' employeeId="' + args.item[index].employeeId + '"';
				xml += ' payCodeId="' + args.item[index].payCodeId.id + '"';
				xml += ' ptoDate="' + args.item[index].ptoDate + '"';
				xml += ' hours="' + args.item[index].hours + '"';
				xml += ' adjustmentDate="' + args.item[index].adjustmentDate + '"';
				xml += ' adjustmentHours="' + args.item[index].adjustmentHours + '"';
				xml += ' notes="' + args.item[index].notes + '"';
				xml += ' clientId="' + ++clientId + '"/>';
			}
	
			return xml;
		},
		
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			
			$("#pageLoading").hide();

			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id = parseInt($(this).attr("id"), 10);
			var clientId = parseInt($(this).attr("clientId"), 10);
			var subItemId = 0;
			var success = true;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;

			if (status == "success") {

				$(args.xmlNode).find("*").each(function (){

					switch (this.tagName) {
						case "employeePTODetail":
							
							id = parseInt($(this).attr("id"), 10);
							clientId = parseInt($(this).attr("clientId"), 10);
							
							if (me.ptoDetails[clientId - 1] != undefined) {
								subItemId = me.ptoDetails[clientId - 1].id;
								if (subItemId == null || subItemId <= 0) {
									me.ptoDetails[clientId - 1].id = id;
									me.ptoGrid.body.renderRow(clientId - 1, clientId - 1);
								}
							}
							break;
					}
				});
			}
			else {
				alert('Error while updating PTO Record: ' + $(args.xmlNode).attr("message"));
			}			
		}
    }
});

function main() {

	fin.empPTOUi = new fin.emp.employeePTO.UserInterface();
	fin.empPTOUi.resize();
}

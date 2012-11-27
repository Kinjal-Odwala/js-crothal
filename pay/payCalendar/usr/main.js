ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pay.payCalendar.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);
ii.Style( "fin.cmn.usr.button" , 7);

ii.Class({
    Name: "fin.pay.payCalendar.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.yearId = 0;
			me.frequencyTypeId = 0;
			
			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.query = new ii.ajax.Query(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);			
				
			me.validator = new ui.ctl.Input.Validation.Master();	//@iiDoc {Property:ui.ctl.Input.Validation.Master}
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\Calendar";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.defineFormControls();			
			me.configureCommunications();
			
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(window).bind("resize", me, me.resize);
			
			me.payFrequency.fetchingData();
			me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
			me.frequencyTypeStore.fetch("userId:[user]", me.frequencyTypesLoaded, me);
		},
		
		authorizationProcess: function fin_pay_payCalendar_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.calendarReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			$("#pageLoading").hide();
			
			me.controlVisible();
			
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pay_payCalendar_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
	
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			fin.payCalendarUi.fiscalYearGrid.setHeight($(window).height() - 80);	
			fin.payCalendarUi.payPeriodGrid.setHeight($(window).height() - 165);	
			$("#payPeriodsLoading").height($(window).height() - 158);
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
					title: "Save the current Pay Calendar.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Calendar (Ctrl+U)", 
					title: "Undo the changes to Pay Calendar being edited.",
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

			me.fiscalYearGrid = new ui.ctl.Grid({
				id: "FiscalYearGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ){ me.actionItemSelect (index); }
			});
			
			me.fiscalYearGrid.addColumn("patternTitle", "patternTitle", "Fiscal Pattern", "Fiscal Pattern", 150);
			me.fiscalYearGrid.addColumn("title", "title", "Fiscal Year", "Fiscal Year", null);
			me.fiscalYearGrid.capColumns();
			
			me.fiscalYear = new ui.ctl.Input.Text({
		        id: "FiscalYear",
		        maxLength: 4
		    });
			
			me.fiscalYear.text.readOnly = true;

			me.payFrequency = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayFrequency",
		        formatFunction: function( type ){ return type.title; },
				changeFunction: function() { me.actionFrequencyTypeChanged(); }
		    });			
			
			me.payFrequency.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);			
			
			me.payPeriodGrid = new ui.ctl.Grid({
				id: "PayPeriodGrid",
				appendToId: "divForm",
				allowAdds: true,
				createNewFunction: fin.pay.payCalendar.PayPeriod,
				selectFunction: function(index) {  if(me.payPeriods[index]) me.payPeriods[index].modified = true; }
			});
			
			me.payPeriodTitle = new ui.ctl.Input.Text({
		        id: "PayPeriodTitle" ,
		        maxLength: 16, 
				appendToId: "PayPeriodGridControlHolder"
		    });
			
			me.payPeriodTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);
			
			me.payStartDate = new ui.ctl.Input.Date({
		        id: "PayStartDate",
		        appendToId: "PayPeriodGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
					
			me.payStartDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
				var enteredText = me.payStartDate.lastBlurValue;
				
				if(enteredText == "") 
					return;
										
				if(/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false) {							
					this.setInvalid("Please enter valid date.");
				}
			});
			
			me.payEndDate = new ui.ctl.Input.Date({
		        id: "PayEndDate",
				appendToId: "PayPeriodGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.payEndDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
				var enteredText = me.payEndDate.lastBlurValue;
				
				if(enteredText == "") 
					return;
										
				if(/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false) {							
					this.setInvalid("Please enter valid date.");
				}					
			});			
			
			me.payPeriodGrid.addColumn("title", "title", "Title", "title", 100, null, this.payPeriodTitle);
			me.payPeriodGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 125, function(startDate) { return ui.cmn.text.date.format(startDate, "mm/dd/yyyy"); }, this.payStartDate);
			me.payPeriodGrid.addColumn("endDate", "endDate", "End Date", "End Date", null, function(endDate) { return ui.cmn.text.date.format(endDate, "mm/dd/yyyy"); }, this.payEndDate);
			me.payPeriodGrid.capColumns();			
		},
		
		resizeControls: function() {
			var me = this;
			
			me.payFrequency.resizeText();
			me.payPeriodTitle.resizeText();
			me.payStartDate.resizeText();
			me.payEndDate.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_pay_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.pay.payCalendar.FiscalYear,
				itemConstructorArgs: fin.pay.payCalendar.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});		
			
			me.payPeriods = [];
			me.payPeriodStore = me.cache.register({
				storeId: "payPeriods",
				itemConstructor: fin.pay.payCalendar.PayPeriod,
				itemConstructorArgs: fin.pay.payCalendar.payPeriodArgs,
				injectionArray: me.payPeriods
			});		
			
			me.frequencyTypes = [];
			me.frequencyTypeStore = me.query.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.pay.payCalendar.FrequencyType,
				itemConstructorArgs: fin.pay.payCalendar.frequencyTypeArgs,
				injectionArray: me.frequencyTypes
			});
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
		
		controlVisible: function(){
			var me = this;
			
			if(me.calendarReadOnly){
				$("#FiscalYearText").attr('disabled', true);
				$("#PayFrequencyText").attr('disabled', true);
				$("#PayFrequencyAction").removeClass("iiInputAction");
				
				me.payPeriodGrid.columns["title"].inputControl = null;
				me.payPeriodGrid.columns["startDate"].inputControl = null;
				me.payPeriodGrid.columns["endDate"].inputControl = null;
				me.payPeriodGrid.allowAdds = false;

				$("#actionMenu").hide();
				$(".footer").hide();				
								
			}
		},

		fiscalYearsLoaded: function fin_pay_UserInterface_fiscalYearsLoaded(me, activeId) {

			if(me.fiscalYears[0] == null)
				alert("No matching record found!!");
				
			me.fiscalYearGrid.setData(me.fiscalYears);
			me.controlVisible();
			me.resizeControls();
		},
		
		frequencyTypesLoaded: function fin_pay_UserInterface_frequencyTypesLoaded(me, activeId) {

			me.payFrequency.setData(me.frequencyTypes);
			me.payFrequency.select(0, me.payFrequency.focused);
			me.frequencyTypeId = me.payFrequency.data[me.payFrequency.indexSelected].id;
		},
		
		payPeriodsLoaded: function fin_pay_UserInterface_payPeriodsLoaded(me, activeId) {
	
			me.payPeriodGrid.setData(me.payPeriods);
			$("#payPeriodsLoading").hide();
		},
		
		actionItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
									
			if (me.fiscalYearGrid.data[index] != undefined) {

				me.yearId = me.fiscalYearGrid.data[index].id;
				me.fiscalYear.setValue(me.fiscalYearGrid.data[index].title);
									
				$("#payPeriodsLoading").show();								
				me.payPeriodStore.fetch("fiscalYearId:" + me.yearId + ",frequencyType:" + me.frequencyTypeId + ",userId:[user]", me.payPeriodsLoaded, me);
				
			}
			else
				me.yearId = 0;
				
			me.controlVisible();	
		},
		
		actionFrequencyTypeChanged: function() {
			var me = this;
			
			if (me.payPeriodGrid.activeRowIndex >= 0)
				me.payPeriodGrid.body.deselect(me.payPeriodGrid.activeRowIndex);
				
			if (me.payFrequency.indexSelected >= 0)
				me.frequencyTypeId = me.payFrequency.data[me.payFrequency.indexSelected].id;
			else
				me.frequencyTypeId = 0;
				
			me.actionItemSelect(me.fiscalYearGrid.activeRowIndex);			
		},		
	
		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
				
			if (me.fiscalYearGrid.activeRowIndex < 0)
				return;
			
  			$("#payPeriodsLoading").show();

			if (me.payPeriodGrid.activeRowIndex >= 0)
				me.payPeriodGrid.body.deselect(me.payPeriodGrid.activeRowIndex, true);
			me.payPeriodStore.reset();	
			me.actionItemSelect(me.fiscalYearGrid.activeRowIndex);
		},

		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if(me.calendarReadOnly) return;
			
			if (me.payPeriodGrid.activeRowIndex >= 0)
				me.payPeriodGrid.body.deselect(me.payPeriodGrid.activeRowIndex);

			me.validator.forceBlur();
						
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) && me.payPeriodGrid.activeRowIndex >= 0){
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}			
			
			if (me.payFrequency.indexSelected == -1) {				
				alert("Please select Pay Frequency.");
				return false;
			}					
		
			var payPeriodDatas = [];
			var payPeriodData;
			var	periodStartDate;
			var	periodEndDate;
			var	prevPeriodEndDate;	

			for (var index = 0; index < me.payPeriodGrid.rows.length - 1; index++) {	

				periodStartDate = new Date(me.payPeriods[index].startDate);	
				periodEndDate = new Date(me.payPeriods[index].endDate);
				
				if (periodStartDate >= periodEndDate) {
					alert("Start Date of Period [" + me.payPeriods[index].title + "] should not be greater than End Date.");
					me.payPeriodGrid.body.select(index);
					me.payStartDate.setInvalid("Please enter valid date.");
					return false;						
				}
				
				if (index != 0) {
					prevPeriodEndDate = new Date(me.payPeriods[index - 1].endDate);	
	
					if (prevPeriodEndDate >= periodStartDate) {
						alert("End Date of Period [" + me.payPeriods[index - 1].title  + "] should not be greater than Start Date of Period [" + me.payPeriods[index].title + "]");
						me.payPeriodGrid.body.select(index - 1);
						me.payEndDate.setInvalid("Please enter valid date.");
						return false;						
					}				
				}

				if(me.payPeriods[index].modified == false && me.payPeriods[index].id > 0)
					continue;
				
				payPeriodData = new fin.pay.payCalendar.PayPeriod(
					me.payPeriodGrid.data[index].id
					, me.yearId
					, me.frequencyTypeId
					, me.payPeriods[index].title
					, me.payPeriods[index].startDate
					, me.payPeriods[index].endDate
				);
				
				me.payPeriods[index].modified = true;
				payPeriodDatas.push(payPeriodData);
			};			

			var item = new fin.pay.payCalendar.FiscalYear(
				me.yearId
				, ""
				, ""
				, payPeriodDatas
			);
			
			var xml = me.saveXmlBuild(item);
			
			if (xml == "")
				return;
				
			$("#messageToUser").text("Saving");
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
				item: {type: fin.pay.payCalendar.FiscalYear}
			});			
			var me = this;
			var index;
			var clientId = 0;
			var item = args.item;
			var xml = "";	
			
			for (index in item.periods) {
				periodItem = item.periods[index];
				
				xml += '<payPeriod'
				xml += ' id="' + periodItem.id + '"';
				xml += ' year="' + periodItem.year + '"';
				xml += ' frequencyType="' + periodItem.frequencyType + '"';
				xml += ' title="' + periodItem.title + '"';
				xml += ' startDate="' + periodItem.startDate.toLocaleString() + '"';
				xml += ' endDate="' + periodItem.endDate.toLocaleString() + '"';
				xml += ' active="true"';
				xml += ' displayOrder="1"';
				xml += ' clientId="' + ++clientId + '"';
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
			var traceType = ii.traceTypes.errorDataCorruption;
			var errorMessage = "";
			
			if (status == "success") {
								
				$(args.xmlNode).find("*").each(function() {

					switch (this.tagName) {
						
						case "payPeriod":
							
							id = parseInt($(this).attr("id"), 10);
							
							for (var index = 0; index < me.payPeriodGrid.data.length; index++) {
								if (me.payPeriodGrid.data[index].modified) {
									if (me.payPeriodGrid.data[index].id <= 0)
										me.payPeriodGrid.data[index].id = id;
									me.payPeriodGrid.data[index].modified = false;
									break;
								}
							}							
											
							break;
					}
				});
			}
			else {
				alert('Error while updating Pay Calendar Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
			
			$("#pageLoading").hide();
		}
	}
});

function main() {
	
	fin.payCalendarUi = new fin.pay.payCalendar.UserInterface();
	fin.payCalendarUi.resize();
}




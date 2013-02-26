ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pay.payCheck.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.dropDown", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.grid", 7 );

ii.Class({
    Name: "fin.pay.payCheck.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		
        init: function() {            
			var args = ii.args(arguments, {});
			var me = this;
			
			me.pageLoading = true;
			me.personId = 0;
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;

			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\PayCheck";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();
			
			me.defineFormControls();			
			me.configureCommunications();
			me.setTabIndexes();
			me.resizeControls();
		
			me.state.fetchingData();
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
			me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.payCodeTypesLoaded, me);
			me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			$(window).bind("resize", me, me.resize);
			
			$("input[type=radio]").click(function() {
				switch (this.id) {
					
					case "UPSDeliveryToUnitYes":
						$("#LabelUnit").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code):");
						$("#LabelUnitAddress").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code) Address:");
						break;
						
					case "UPSDeliveryToUnitNo":
						$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
						$("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
						me.unitAddress.resetValidation(false);
						me.unitAddress.updateStatus();
						break;
						
					case "UPSDeliveryToHomeYes":
						$("#LabelHome").html("<span class='requiredFieldIndicator'>&#149;</span>Home Address:");
						break;
						
					case "UPSDeliveryToHomeNo":
						$("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						me.homeAddress.resetValidation(false);
						me.homeAddress.updateStatus();
						break;
				}
			});
        },
		
		authorizationProcess: function fin_pay_payCheck_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},

		sessionLoaded: function fin_pay_payCheck_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.payCheckUi;

			$("#pageLoading").height(document.body.scrollHeight);
			//$("#container").height($(window).height() - 95);
			$("#container").height(1050);
			me.payCodeDetailGrid.setHeight(150);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.requestedDate = new ui.ctl.Input.Date({
		        id: "RequestedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.requestedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.requestedDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.deliveryDate = new ui.ctl.Input.Date({
		        id: "DeliveryDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.deliveryDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.deliveryDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.employeeNumber = new ui.ctl.Input.Text({
				id: "EmployeeNumber",
				maxLength: 16
			});
			
			me.employeeNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				

					if (me.employeeNumber.getValue() == "") 
						return;

					if (!(/^[0-9]+$/.test(me.employeeNumber.getValue())))
						this.setInvalid("Please enter valid Employee Number.");
					else
						me.searchEmployee();
			});

			me.employeeName = new ui.ctl.Input.Text({
				id: "EmployeeName",
				maxLength: 100
			});

			me.employeeName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.reasonForRequest = new ui.ctl.Input.Text({
				id: "ReasonForRequest",
				maxLength: 1024
			});
			
			me.reasonForRequest.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.state = new ui.ctl.Input.DropDown.Filtered({
				id: "State",
				formatFunction: function( type ) { return type.name; }
			});

			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.unitAddress = new ui.ctl.Input.Text({
				id: "UnitAddress",
				maxLength: 1024
			});

			me.unitAddress.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if ($("input[name='UPSDeliveryToUnit']:checked").val() == "true" && me.unitAddress.getValue() == "")
						this.setInvalid("Please enter the Unit (House Code) Address.");
				});

			me.upsPackageAttentionTo = new ui.ctl.Input.Text({
				id: "UPSPackageAttentionTo",
				maxLength: 512
			});
			
			me.homeAddress = new ui.ctl.Input.Text({
				id: "HomeAddress",
				maxLength: 1024
			});
			
			me.homeAddress.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if ($("input[name='UPSDeliveryToHome']:checked").val() == "true" && me.homeAddress.getValue() == "")
						this.setInvalid("Please enter the Home Address.");
				});
				
			me.deductionCode = new ui.ctl.Input.Text({
				id: "DeductionCode",
				maxLength: 512
			});
			
			me.amount = new ui.ctl.Input.Text({
				id: "Amount",
				maxLength: 11
			});
			
			me.amount.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.amount.text.value;
					
					if (enteredText == "")
						return;
						
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Amount. Example: 99.99");
				});
				
			$("#AmountText").keypress(function (e) {
				if (e.which != 8 && e.which != 0  && e.which != 46 && (e.which < 48 || e.which > 57))
					return false;
			});
			
			me.requestedBy = new ui.ctl.Input.Text({
				id: "RequestedBy",
				maxLength: 150
			});

			me.requestorEmailAddress = new ui.ctl.Input.Text({
				id: "RequestorEmailAddress",
				maxLength: 100
			});
			
			me.requestorEmailAddress.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.requestorEmailAddress.getValue();
					
					if (enteredText == "") return;
					
					if (!(ui.cmn.text.validate.emailAddress(enteredText)))
						this.setInvalid("Please enter valid Email Address of Requestor.");
			});
			
			me.approvedBy = new ui.ctl.Input.Text({
				id: "ApprovedBy",
				maxLength: 100
			});
			
			me.approvedBy.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.approvedDate = new ui.ctl.Input.Date({
		        id: "ApprovedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.approvedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.approvedDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.payCodeDetailGrid = new ui.ctl.Grid({
				id: "PayCodeDetailGrid",
				allowAdds: true,
				createNewFunction: fin.pay.payCheck.PayCodeDetail,
				selectFunction: function (index) { 

					$("#HoursText, #EarningText, #AlternateBaseRate").keypress(function (e) {
						if (e.which != 8 && e.which != 0  && e.which != 46 && (e.which < 48 || e.which > 57))
							return false;
					});
				}
			});

			me.payCodeType = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayCodeType",
				appendToId: "PayCodeDetailGridControlHolder",
				formatFunction: function(type) { return type.brief + " - " + type.name; }
		    });

			me.payCodeType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.payCodeType.indexSelected == -1)
						this.setInvalid("Please select the correct Pay Code.");
				});

			me.hours = new ui.ctl.Input.Text({
		        id: "Hours",
		        maxLength: 11,
				appendToId: "PayCodeDetailGridControlHolder"
		    });
			
			me.hours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.hours.getValue();

					if (enteredText == "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Hours. Example: 99.99");
				});	
				
			me.date = new ui.ctl.Input.Date({
		        id: "Date",
				appendToId: "PayCodeDetailGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.date.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.date.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.earning = new ui.ctl.Input.Text({
		        id: "Earning",
				maxLength: 11,
				appendToId: "PayCodeDetailGridControlHolder"
		    });
			
			me.earning.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.earning.getValue();

					if (enteredText == "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Earnings. Example: 99.99");
				});	
				
			me.alternateBaseRate = new ui.ctl.Input.Text({
		        id: "AlternateBaseRate",
				maxLength: 11,
				appendToId: "PayCodeDetailGridControlHolder"
		    });
			
			me.alternateBaseRate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.earning.getValue();

					if (enteredText == "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Alternate Base Rate. Example: 99.99");
				});
				
			me.workOrderTicketNumber = new ui.ctl.Input.Text({
		        id: "WorkOrderTicketNumber",
		        maxLength: 16, 
				appendToId: "PayCodeDetailGridControlHolder"
		    });

			me.payCodeDetailGrid.addColumn("payCode", "payCode", "Pay Code", "Pay Code", null, null, me.payCodeType);
			me.payCodeDetailGrid.addColumn("hours", "hours", "Hours", "Hours", 100, null, me.hours);
			me.payCodeDetailGrid.addColumn("date", "date", "Date", "Date", 120, null, me.date);
			me.payCodeDetailGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 100, function(earning) { return ui.cmn.text.money.format(earning); }, me.earning);
			me.payCodeDetailGrid.addColumn("alternateBaseRate", "alternateBaseRate", "Alternate Base Rate", "Alternate Base Rate", 180, function(alternateBaseRate) { return ui.cmn.text.money.format(alternateBaseRate); }, me.alternateBaseRate);
			me.payCodeDetailGrid.addColumn("workOrderTicketNumber", "workOrderTicketNumber", "Work Order Ticket #", "Work Order Ticket Number", 170, null, me.workOrderTicketNumber);
			me.payCodeDetailGrid.capColumns();
			
			me.payCodeType.active = false;
			me.hours.active = false;
			me.date.active = false;
			me.earning.active = false;
			me.alternateBaseRate.active = false;
			me.workOrderTicketNumber.active = false;

			me.anchorSendRequest = new ui.ctl.buttons.Sizeable({
				id: "AnchorSendRequest",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSendRequestItem(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
		},
		
		configureCommunications:function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pay.payCheck.HirNode,
				itemConstructorArgs: fin.pay.payCheck.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pay.payCheck.HouseCode,
				itemConstructorArgs: fin.pay.payCheck.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pay.payCheck.StateType,
				itemConstructorArgs: fin.pay.payCheck.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.pay.payCheck.PayCodeType,
				itemConstructorArgs: fin.pay.payCheck.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});
			
			me.payCheckRequests = [];
			me.payCheckRequestStore = me.cache.register({
				storeId: "payCheckRequests",
				itemConstructor: fin.pay.payCheck.PayCheckRequest,
				itemConstructorArgs: fin.pay.payCheck.payCheckRequestArgs,
				injectionArray: me.payCheckRequests
			});
			
			me.payCodeDetails = [];
			me.payCodeDetailStore = me.cache.register({
				storeId: "payCheckRequestPayCodes",
				itemConstructor: fin.pay.payCheck.PayCodeDetail,
				itemConstructorArgs: fin.pay.payCheck.payCodeDetailArgs,
				injectionArray: me.payCodeDetails,
				lookupSpec: { payCode: me.payCodeTypes }
			});

			me.employees = [];
			me.employeeStore = me.cache.register({
				storeId: "employeeSearchs",
				itemConstructor: fin.pay.payCheck.EmployeeSearch,
				itemConstructorArgs: fin.pay.payCheck.employeeSearchArgs,
				injectionArray: me.employees
			});
			
			me.persons = [];
			me.personStore = me.cache.register({ 
				storeId: "persons",
				itemConstructor: fin.pay.payCheck.Person,
				itemConstructorArgs: fin.pay.payCheck.personArgs,
				injectionArray: me.persons	
			});
			
			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.pay.payCheck.Site,
				itemConstructorArgs: fin.pay.payCheck.siteArgs,
				injectionArray: me.sites
			});	
		},
		
		setTabIndexes: function() {
			var me = this;

			$("#houseCodeText")[0].tabIndex = 1;
			me.requestedDate.text.tabIndex = 2;
			me.deliveryDate.text.tabIndex = 3;
			me.employeeNumber.text.tabIndex = 4;
			me.employeeName.text.tabIndex = 5;
			me.reasonForRequest.text.tabIndex = 6;
			$("#TermRequestYes")[0].tabIndex = 7;
			$("#TermRequestNo")[0].tabIndex = 8;
			me.state.text.tabIndex = 9;
			$("#CurrentPayCardUserYes")[0].tabIndex = 10;
			$("#CurrentPayCardUserNo")[0].tabIndex = 11;
			$("#InstantIssueRequestYes")[0].tabIndex = 12;
			$("#InstantIssueRequestNo")[0].tabIndex = 13;
			$("#UPSDeliveryToUnitYes")[0].tabIndex = 14;
			$("#UPSDeliveryToUnitNo")[0].tabIndex = 15;
			$("#SaturdayDeliveryUnitYes")[0].tabIndex = 16;
			$("#SaturdayDeliveryUnitNo")[0].tabIndex = 17;
			$("#houseCodeTemplateText")[0].tabIndex = 18;			
			me.unitAddress.text.tabIndex = 19;
			me.upsPackageAttentionTo.text.tabIndex = 20;			
			$("#UPSDeliveryToHomeYes")[0].tabIndex = 21;
			$("#UPSDeliveryToHomeNo")[0].tabIndex = 22;
			$("#SaturdayDeliveryHomeYes")[0].tabIndex = 23;
			$("#SaturdayDeliveryHomeNo")[0].tabIndex = 24;			
			me.homeAddress.text.tabIndex = 25;
			$("#ProcessingFeeYes")[0].tabIndex = 26;
			$("#ProcessingFeeNo")[0].tabIndex = 27;		
			me.deductionCode.text.tabIndex = 28;
			me.amount.text.tabIndex = 29;
			me.requestedBy.text.tabIndex = 30;
			me.requestorEmailAddress.text.tabIndex = 31;
			me.approvedBy.text.tabIndex = 32;
			me.approvedDate.text.tabIndex = 33;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.requestedDate.resizeText();
			me.deliveryDate.resizeText();
			me.employeeNumber.resizeText();
			me.employeeName.resizeText();
			me.reasonForRequest.resizeText();
			me.unitAddress.resizeText();
			me.upsPackageAttentionTo.resizeText();
			me.homeAddress.resizeText();
			me.state.resizeText();
			me.deductionCode.resizeText();
			me.amount.resizeText();
			me.requestedBy.resizeText();
			me.requestorEmailAddress.resizeText();
			me.approvedBy.resizeText();
			me.approvedDate.resizeText();			
		},
		
		resetControls: function() {
			var me = this;

			me.requestedDate.setValue("");
			me.deliveryDate.setValue("");
			me.employeeNumber.setValue("");
			me.employeeName.setValue("");
			me.reasonForRequest.setValue("");
			me.unitAddress.setValue("");
			me.upsPackageAttentionTo.setValue("");
			me.homeAddress.setValue("");
			me.state.reset();
			me.deductionCode.setValue("");
			me.amount.setValue("");
			me.requestedBy.setValue("");
			me.requestorEmailAddress.setValue("");
			me.approvedBy.setValue("");
			me.approvedDate.setValue("");
			me.payCodeDetailGrid.setData([]);
			$("#TermRequestYes")[0].checked = true;
			$("#CurrentPayCardUserYes")[0].checked = true;
			$("#InstantIssueRequestYes")[0].checked = true;
			$("#UPSDeliveryToUnitYes")[0].checked = true;
			$("#SaturdayDeliveryUnitYes")[0].checked = true;					
			$("#UPSDeliveryToHomeYes")[0].checked = true;			
			$("#SaturdayDeliveryHomeYes")[0].checked = true;			
			$("#ProcessingFeeYes")[0].checked = true;			
		},
		
		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
		},
		
		payCodeTypesLoaded: function(me, activeId) {

			me.payCodeType.setData(me.payCodeTypes);
			me.payCodeDetailGrid.setData(me.payCodeDetails);
			me.payCodeDetailGrid.setHeight(150);
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

		houseCodeTemplateChanged: function() { 
			var args = ii.args(arguments,{});			
			var me = this;	
			
			 me.siteStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",type:invoice", me.sitesLoaded, me);
		},
		
		sitesLoaded: function(me, activeId) {
			
			if (me.sites.length == 0)
				alert("Either Site information not found or Site is not associated to the House Code [" + me.houseCodeSearchTemplate.houseCodeTitleTemplate + "]. Please verify and try again!")
			else {
				var address = me.sites[0].addressLine1 + ", ";
				address += (me.sites[0].addressLine2 == "" ? "" : me.sites[0].addressLine2 + ", ");
				address += me.sites[0].city + ", ";
				address += (me.sites[0].county == "" ? "" : me.sites[0].county + ", ");
				address += me.sites[0].postalCode + ", ";
				var index = ii.ajax.util.findIndexById(me.sites[0].state.toString(), me.stateTypes);
				if (index != undefined && index >= 0)
					address += me.stateTypes[index].name;
				me.unitAddress.setValue(address);
			}
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				if (me.employeeNumber.getValue() == "")
					return false;
				else
					me.searchEmployee();
			}
		},
		
		searchEmployee: function() {
			var me = this;

			$("#EmployeeNumberText").addClass("Loading");
			me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeNumber.getValue()
				+ ",employeeType:SearchFull"
				+ ",filterType:Employee Number"
				, me.employeesLoaded, me);
		},
		
		employeesLoaded: function(me, activeId) {

			$("#EmployeeNumberText").removeClass("Loading");

			if (me.employees.length == 0) {
				alert("There is no Employee with Employe # [" + me.employeeNumber.getValue() + "].");
				me.employeeNumber.setValue("");
				me.employeeName.setValue("");
				return;
			}
			else {
				me.employeeName.setValue(me.employees[0].firstName + " " + me.employees[0].lastName);
				if (me.personId != me.employees[0].id) {
					me.personId = me.employees[0].id;
					me.personStore.fetch("userId:[user],id:" + me.employees[0].id, me.personsLoaded, me);
				}
			}
		},
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			if (me.persons.length > 0) {
				if (me.pageLoading) {
					me.pageLoading = false;
					me.requestedBy.setValue(me.persons[0].firstName + " " + me.persons[0].lastName + " [" + me.session.propertyGet("userName") + "]");
					me.requestorEmailAddress.setValue(me.persons[0].email);
					me.requestedBy.text.readOnly = true;
				}
				else {
					var address = me.persons[0].addressLine1 + ", ";
					address += (me.persons[0].addressLine2 == "" ? "" : me.persons[0].addressLine2 + ", ");
					address += me.persons[0].city + ", ";
					address += me.persons[0].postalCode + ", ";
					var index = ii.ajax.util.findIndexById(me.persons[0].state.toString(), me.stateTypes);
					if (index != undefined && index >= 0)
						address += me.stateTypes[index].name;
					me.homeAddress.setValue(address);
				}
			}
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.payCodeDetailGrid.activeRowIndex >= 0) 
				me.payCodeDetailGrid.body.deselect(me.payCodeDetailGrid.activeRowIndex, true);
			me.resetControls();
		},
		
		actionSendRequestItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if ($("input[name='UPSDeliveryToUnit']:checked").val() == "true" && me.houseCodeSearchTemplate.houseCodeIdTemplate == 0) {
				alert("Please select the Unit (House Code).");
				return false;
			}
			

			me.payCodeDetailGrid.body.deselectAll();
			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			$("#messageToUser").text("Sending Request");
			$("#pageLoading").show();
			
			var item = new fin.pay.payCheck.PayCheckRequest(
				0
				, parent.fin.appUI.houseCodeId
				, parent.fin.appUI.houseCodeTitle
				, me.requestedDate.lastBlurValue
				, me.deliveryDate.lastBlurValue
				, me.employeeNumber.getValue()
				, me.employeeName.getValue()
				, me.reasonForRequest.getValue()
				, $("input[name='TermRequest']:checked").val() == "true" ? true : false
				, me.stateTypes[me.state.indexSelected].id
				, $("input[name='CurrentPayCardUser']:checked").val() == "true" ? true : false
				, $("input[name='InstantIssueRequest']:checked").val() == "true" ? true : false
				, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? true : false
				, $("input[name='SaturdayDeliveryUnit']:checked").val() == "true" ? true : false
				, me.houseCodeSearchTemplate.houseCodeIdTemplate
				, me.houseCodeSearchTemplate.houseCodeTitleTemplate
				, me.unitAddress.getValue()
				, me.upsPackageAttentionTo.getValue()
				, $("input[name='UPSDeliveryToHome']:checked").val() == "true" ? true : false
				, $("input[name='SaturdayDeliveryHome']:checked").val() == "true" ? true : false
				, me.homeAddress.getValue()
				, $("input[name='ProcessingFee']:checked").val() == "true" ? true : false
				, me.deductionCode.getValue()
				, me.amount.getValue()
				, me.requestedBy.getValue()
				, me.requestorEmailAddress.getValue()
				, me.approvedBy.getValue()				
				, me.approvedDate.lastBlurValue
				);	
			
			var xml = me.saveXmlBuildItem(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pay.payCheck.PayCheckRequest}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
		
			xml += '<payCheckRequest';
			xml += ' id="' + item.id + '"';
			xml += ' houseCodeId="' + item.houseCodeId + '"';
			xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
			xml += ' requestedDate="' + item.requestedDate + '"';
			xml += ' deliveryDate="' + item.deliveryDate + '"';
			xml += ' employeeNumber="' + item.employeeNumber + '"';
			xml += ' employeeName="' + ui.cmn.text.xml.encode(item.employeeName) + '"';
			xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
			xml += ' termRequest="' + item.termRequest + '"';
			xml += ' stateType="' + item.stateType + '"';
			xml += ' currentPayCardUser="' + item.currentPayCardUser + '"';
			xml += ' instantIssueRequest="' + item.instantIssueRequest + '"';
			xml += ' upsDeliveryToUnit="' + item.upsDeliveryToUnit + '"';
			xml += ' saturdayDeliveryUnit="' + item.saturdayDeliveryUnit + '"';
			xml += ' deliveryHouseCodeId="' + item.deliveryHouseCodeId + '"';			
			xml += ' deliveryHouseCodeTitle="' + ui.cmn.text.xml.encode(item.deliveryHouseCodeTitle) + '"';
			xml += ' houseCodeAddress="' + ui.cmn.text.xml.encode(item.houseCodeAddress) + '"';
			xml += ' upsPackageAttentionTo="' + ui.cmn.text.xml.encode(item.upsPackageAttentionTo) + '"';
			xml += ' upsDeliveryToHome="' + item.upsDeliveryToHome + '"';
			xml += ' saturdayDeliveryHome="' + item.saturdayDeliveryHome + '"';			
			xml += ' homeAddress="' + ui.cmn.text.xml.encode(item.homeAddress) + '"';
			xml += ' stopPaymentProcessingFee="' + item.stopPaymentProcessingFee + '"';
			xml += ' deductionCodes="' + item.deductionCodes + '"';
			xml += ' amount="' + item.amount + '"';
			xml += ' requestedBy="' + ui.cmn.text.xml.encode(item.requestedBy) + '"';
			xml += ' emailAddressOfRequestor="' + ui.cmn.text.xml.encode(item.emailAddressOfRequestor) + '"';
			xml += ' approvedBy="' + ui.cmn.text.xml.encode(item.approvedBy) + '"';
			xml += ' approvedDate="' + item.approvedDate + '"';
			xml += '/>';

			for (var index = 0; index < me.payCodeDetailGrid.data.length; index++) {
				xml += '<payCheckRequestPayCode';
				xml += ' id="0"';
				xml += ' payCheckRequestId="0"';
				xml += ' payCode="' + me.payCodeDetailGrid.data[index].payCode.id + '"';
				xml += ' hours="' + me.payCodeDetailGrid.data[index].hours + '"';
				xml += ' date="' + me.payCodeDetailGrid.data[index].date.toLocaleString() + '"';
				xml += ' earnings="' + me.payCodeDetailGrid.data[index].earnings + '"';
				xml += ' alternateBaseRate="' + me.payCodeDetailGrid.data[index].alternateBaseRate + '"';
				xml += ' workOrderNumber="' + ui.cmn.text.xml.encode(me.payCodeDetailGrid.data[index].workOrderTicketNumber) + '"';
				xml += '/>';
			}
			
			xml += '<payCheckRequestNotification';
			xml += ' id="0"';
			xml += '/>';

			return xml;			
		},	

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success")
				ii.trace("Payroll check request sent successfully.", ii.traceTypes.Information, "Info");
			else
				alert("[SAVE FAILURE] Error while sending the payroll check request: " + $(args.xmlNode).attr("message"));

			$("#pageLoading").hide();
		}
    }
});

function main() {

	fin.payCheckUi = new fin.pay.payCheck.UserInterface();
	fin.payCheckUi.resize();
	fin.houseCodeSearchUi = fin.payCheckUi;
}
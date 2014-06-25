ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
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
ii.Style( "fin.cmn.usr.toolbar", 8);

ii.Class({
    Name: "fin.pay.payCheck.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		
        init: function() {            
			var args = ii.args(arguments, {});
			var me = this;

			me.pageLoading = true;
			me.status = "CheckRequest";
			me.personId = 0;
			me.users = [];
			me.loadCount = 0;
			me.fileName = "";
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;

			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\CheckRequest";
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
			me.initialize();
			me.setTabIndexes();
			me.resizeControls();
			me.statusesLoaded();
			me.setStatus("Loading");
			me.modified(false);

			$(window).bind("resize", me, me.resize);

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}			
        },

		authorizationProcess: function fin_pay_payCheck_UserInterface_authorizationProcess() {
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
				me.loadCount = 4;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.state.fetchingData();
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.payCodeTypesLoaded, me);
				me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);
				if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
					me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
				else
					me.houseCodesLoaded(me, 0);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
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
			//$("#Container").height($(window).height() - 95);
			$("#Container").height(1180);
			me.payCheckRequestGrid.setHeight(200);
			me.payCodeDetailGrid.setHeight(150);
			me.payCodeDetailReadOnlyGrid.setHeight(150);
			me.documentGrid.setHeight(100);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "importAction",
					brief: "Payroll Check Request", 
					title: "To view the payroll check request form.",
					actionFunction: function() { me.actionPayCheckRequest(); }
				})				
				.addAction({
					id: "batchStatusAction", 
					brief: "Payroll Check Request Status", 
					title: "To view the status of the payroll check request.",
					actionFunction: function() { me.actionPayCheckRequestStatus(); }
				});
				
			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});
			
			me.statusType = new ui.ctl.Input.DropDown.Filtered({
				id: "StatusType",
				formatFunction: function( type ) { return type.title; }
			});

			me.statusType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.statusType.indexSelected == -1)
						this.setInvalid("Please select the correct Status.");
				});
			
			me.payCheckRequestGrid = new ui.ctl.Grid({
				id: "PayCheckRequestGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
			});
			
			me.payCheckRequestGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
			me.payCheckRequestGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee Number", 120);
			me.payCheckRequestGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 300);
			me.payCheckRequestGrid.addColumn("statusType", "statusType", "Status", "Status", 100, function(statusType) {
				if (statusType == 2)
					return "In Process";
				else if (statusType == 8)
                	return "Approved";
				else if (statusType == 9)
                	return "Completed";
				else if (statusType == 6)
                	return "Cancelled";
				else if (statusType == 10)
                	return "Unapproved";
           	});
			me.payCheckRequestGrid.capColumns();

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
						
					me.modified();
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

					me.modified();
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.employeeNumber = new ui.ctl.Input.Text({
				id: "EmployeeNumber",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
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
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});

			me.employeeName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.reasonForRequest = new ui.ctl.Input.Text({
				id: "ReasonForRequest",
				maxLength: 1024,
				changeFunction: function() { me.modified(); }
			});
			
			me.reasonForRequest.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.state = new ui.ctl.Input.DropDown.Filtered({
				id: "State",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
			});

			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ($("#TermRequestNo")[0].checked) {
							this.valid = true;
						}
					else if ((this.focused || this.touched) && me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.unitAddress = new ui.ctl.Input.Text({
				id: "UnitAddress",
				maxLength: 1024,
				changeFunction: function() { me.modified(); }
			});

			me.unitAddress.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if ($("input[name='UPSDeliveryToUnit']:checked").val() == "true" && me.unitAddress.getValue() == "")
						this.setInvalid("Please enter the Unit (House Code) Address.");
				});

			me.upsPackageAttentionTo = new ui.ctl.Input.Text({
				id: "UPSPackageAttentionTo",
				maxLength: 512,
				changeFunction: function() { me.modified(); }
			});
			
			me.homeAddress = new ui.ctl.Input.Text({
				id: "HomeAddress",
				maxLength: 1024,
				changeFunction: function() { me.modified(); }
			});
			
			me.homeAddress.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if ($("input[name='UPSDeliveryToHome']:checked").val() == "true" && me.homeAddress.getValue() == "")
						this.setInvalid("Please enter the Home Address.");
				});
				
			me.deductionCode = new ui.ctl.Input.Text({
				id: "DeductionCode",
				maxLength: 512,
				changeFunction: function() { me.modified(); }
			});
			
			me.amount = new ui.ctl.Input.Text({
				id: "Amount",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
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
			
			me.requestorName = new ui.ctl.Input.Text({
				id: "RequestorName",
				maxLength: 150
			});

			me.requestorEmail = new ui.ctl.Input.Text({
				id: "RequestorEmail",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.requestorEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.requestorEmail.getValue();
					
					if (enteredText == "") return;
					
					if (!(ui.cmn.text.validate.emailAddress(enteredText)))
						this.setInvalid("Please enter valid Requestor Email.");
			});
			
			me.managerName = new ui.ctl.Input.Text({
				id: "ManagerName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.managerName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.managerEmail = new ui.ctl.Input.Text({
				id: "ManagerEmail",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.managerEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerEmail.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.emailAddress(enteredText)))
						this.setInvalid("Please enter valid Manager Email.");
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
				formatFunction: function(type) { return type.brief + " - " + type.name; },
				changeFunction: function() { me.modified(); }
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
				appendToId: "PayCodeDetailGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.hours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.hours.getValue();

					if (me.earning.getValue() == "" && enteredText == "") {
						this.setInvalid("Please enter either Hours or Earnings.");
						me.earning.setInvalid("Please enter either Hours or Earnings.");
					}
					else if (me.earning.getValue() != "" || enteredText != "") {
							this.valid = true;
							me.earning.resetValidation(true);
							if (me.earning.getValue() == "")
								me.earning.setValue("");
						}

					if (enteredText != ""  && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
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

					me.modified();
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.earning = new ui.ctl.Input.Text({
		        id: "Earning",
				maxLength: 11,
				appendToId: "PayCodeDetailGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.earning.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.earning.getValue();
					
					if (me.hours.getValue() == "" && enteredText == "") {
						this.setInvalid("Please enter either Hours or Earnings.");
						me.hours.setInvalid("Please enter either Hours or Earnings.");
					}
					else if (me.hours.getValue() != "" || enteredText != "") {
							this.valid = true;
							me.hours.resetValidation(true);
							if (me.hours.getValue() == "")
								me.hours.setValue("");
						}			
					
					if (enteredText != "" && !(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Earnings. Example: 99.99");
				});	
				
			me.alternateBaseRate = new ui.ctl.Input.Text({
		        id: "AlternateBaseRate",
				maxLength: 11,
				appendToId: "PayCodeDetailGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.alternateBaseRate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.alternateBaseRate.getValue();

					if (enteredText == "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
						this.setInvalid("Please enter valid Alternate Base Rate. Example: 99.99");
				});
				
			me.workOrderNumber = new ui.ctl.Input.Text({
		        id: "WorkOrderNumber",
		        maxLength: 16, 
				appendToId: "PayCodeDetailGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.payCodeDetailGrid.addColumn("payCode", "payCode", "Pay Code", "Pay Code", null, function(payCode) { return payCode.brief + " - " + payCode.name 	} , me.payCodeType);
			me.payCodeDetailGrid.addColumn("hours", "hours", "Hours", "Hours", 100, null, me.hours);
			me.payCodeDetailGrid.addColumn("date", "date", "Date", "Date", 120, null, me.date);
			me.payCodeDetailGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 100, function(earning) { return ui.cmn.text.money.format(earning); }, me.earning);
			me.payCodeDetailGrid.addColumn("alternateBaseRate", "alternateBaseRate", "Alternate Base Rate", "Alternate Base Rate", 180, function(alternateBaseRate) { return ui.cmn.text.money.format(alternateBaseRate); }, me.alternateBaseRate);
			me.payCodeDetailGrid.addColumn("workOrderNumber", "workOrderNumber", "Work Order Ticket #", "Work Order Ticket Number", 170, null, me.workOrderNumber);
			me.payCodeDetailGrid.capColumns();
			
			me.payCodeType.active = false;
			me.hours.active = false;
			me.date.active = false;
			me.earning.active = false;
			me.alternateBaseRate.active = false;
			me.workOrderNumber.active = false;
			
			me.payCodeDetailReadOnlyGrid = new ui.ctl.Grid({
				id: "PayCodeDetailReadOnlyGrid"
			});

			me.payCodeDetailReadOnlyGrid.addColumn("payCode", "payCode", "Pay Code", "Pay Code", null, function(payCode) { return payCode.brief + " - " + payCode.name;	});
			me.payCodeDetailReadOnlyGrid.addColumn("hours", "hours", "Hours", "Hours", 100);
			me.payCodeDetailReadOnlyGrid.addColumn("date", "date", "Date", "Date", 120);
			me.payCodeDetailReadOnlyGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 100, function(earning) { return ui.cmn.text.money.format(earning); });
			me.payCodeDetailReadOnlyGrid.addColumn("alternateBaseRate", "alternateBaseRate", "Alternate Base Rate", "Alternate Base Rate", 180, function(alternateBaseRate) { return ui.cmn.text.money.format(alternateBaseRate); });
			me.payCodeDetailReadOnlyGrid.addColumn("workOrderNumber", "workOrderNumber", "Work Order Ticket #", "Work Order Ticket Number", 170);
			me.payCodeDetailReadOnlyGrid.capColumns();

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});
			
			me.anchorSendRequest = new ui.ctl.buttons.Sizeable({
				id: "AnchorSendRequest",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSendRequestItem(); },
				hasHotState: true
			});
			
			me.anchorResendRequest = new ui.ctl.buttons.Sizeable({
				id: "AnchorResendRequest",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Resend Request&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionResendRequestItem(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});

			me.anchorUploadCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorUploadCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadCancel(); },
				hasHotState: true
			});
			
			me.documentTitle = new ui.ctl.Input.Text({
				id: "DocumentTitle",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});

			me.documentTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.documentGrid = new ui.ctl.Grid({
				id: "DocumentGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.documentGrid.addColumn("title", "title", "Title", "Title", null);
			me.documentGrid.addColumn("fileName", "fileName", "File Name", "File Name", 350);
			me.documentGrid.capColumns();
			
			me.documentTitle.active = false;
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

			me.payCheckRequestDocuments = [];
			me.payCheckRequestDocumentStore = me.cache.register({
				storeId: "payCheckRequestDocuments",
				itemConstructor: fin.pay.payCheck.PayCheckRequestDocument,
				itemConstructorArgs: fin.pay.payCheck.payCheckRequestDocumentArgs,
				injectionArray: me.payCheckRequestDocuments
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "payFileNames",
				itemConstructor: fin.pay.payCheck.FileName,
				itemConstructorArgs: fin.pay.payCheck.fileNameArgs,
				injectionArray: me.fileNames
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

			me.loadCount--;
			if (me.loadCount <= 0) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},
		
		initialize: function() {
			var me = this;
			
			$("input[type=radio]").click(function() {
				switch (this.id) {
					
					case "UPSDeliveryToUnitYes":
						$("#LabelUnit").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code):");
						$("#LabelUnitAddress").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code) Address:");
						$("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						me.setUnitAddress();
						$("#CurrentPayCardUserNo")[0].checked = true;
						$("#UPSDeliveryToHomeNo")[0].checked = true;
						me.homeAddress.resetValidation(true);
						me.homeAddress.setValue("");
						break;
						
					case "UPSDeliveryToUnitNo":
						$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
						$("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
						me.unitAddress.resetValidation(true);
						me.unitAddress.setValue("");
						$("#houseCodeTemplateText").val("");
						break;
						
					case "UPSDeliveryToHomeYes":
						$("#LabelHome").html("<span class='requiredFieldIndicator'>&#149;</span>Home Address:");
						$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
						$("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
						me.setEmployeeAddress();
						$("#CurrentPayCardUserNo")[0].checked = true;
						$("#UPSDeliveryToUnitNo")[0].checked = true;
						me.unitAddress.resetValidation(true);
						me.unitAddress.setValue("");
						break;
						
					case "UPSDeliveryToHomeNo":
						$("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						me.homeAddress.resetValidation(true);
						me.homeAddress.setValue("");
						break;
						
					case "CurrentPayCardUserYes":
						$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
						$("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
						$("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						$("#UPSDeliveryToUnitNo")[0].checked = true;
						$("#UPSDeliveryToHomeNo")[0].checked = true;
						me.homeAddress.resetValidation(true);
						me.homeAddress.setValue("");
						me.unitAddress.resetValidation(true);
						me.unitAddress.setValue("");
						break;
						
					case "TermRequestYes":
						$("#LabelState").html("<span class='requiredFieldIndicator'>&#149;</span>State:");
						break;
						
					case "TermRequestNo":
						$("#LabelState").html("<span id='nonRequiredFieldIndicator'>State:</span>");
						me.state.resetValidation(true);
						me.state.setValue("");
						break;
				}
			});
			
			$("input[type='radio']").change( function() { me.modified(); });
			$("#imgAdd").bind("click", function() { me.actionAttachItem(); });
			$("#imgEdit").bind("click", function() { me.actionEditItem(); });
			$("#imgRemove").bind("click", function() { me.actionRemoveItem(); });
			$("#imgView").bind("click", function() { me.actionViewItem(); });
			$("#AnchorResendRequest").hide();
			me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
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
			me.requestorName.text.tabIndex = 30;
			me.requestorEmail.text.tabIndex = 31;
			me.managerName.text.tabIndex = 32;
			me.managerEmail.text.tabIndex = 33;
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
			me.requestorName.resizeText();
			me.requestorEmail.resizeText();
			me.managerName.resizeText();
			me.managerEmail.resizeText();			
		},
		
		resetControls: function(status) {
			var me = this;

			me.status = status;
			me.payCodeDetailGrid.body.deselectAll();
			me.documentGrid.body.deselectAll();
			me.requestedDate.resetValidation(true);
			me.deliveryDate.resetValidation(true);
			me.employeeNumber.resetValidation(true);
			me.employeeName.resetValidation(true);
			me.reasonForRequest.resetValidation(true);
			me.state.resetValidation(true);
			me.unitAddress.resetValidation(true);
			me.homeAddress.resetValidation(true);
			me.requestorEmail.resetValidation(true);
			me.managerName.resetValidation(true);
			me.managerEmail.resetValidation(true);
			me.state.updateStatus();
			
			//me.requestedDate.setValue("");
			me.deliveryDate.setValue("");
			me.employeeNumber.setValue("");
			me.employeeName.setValue("");
			me.reasonForRequest.setValue("");
			me.state.reset();
			me.unitAddress.setValue("");
			me.upsPackageAttentionTo.setValue("");
			me.homeAddress.setValue("");
			me.deductionCode.setValue("");
			me.amount.setValue("");
			me.requestorName.setValue("");
			me.requestorEmail.setValue("");
			me.managerName.setValue("");
			me.managerEmail.setValue("");
			me.payCodeDetailGrid.setData([]);
			me.documentGrid.setData([]);
			
			$("#houseCodeText").val("");
			$("#houseCodeTemplateText").val("");
			$("#TermRequestNo")[0].checked = true;
			$("#CurrentPayCardUserNo")[0].checked = true;
			$("#InstantIssueRequestNo")[0].checked = true;
			$("#UPSDeliveryToUnitNo")[0].checked = true;
			$("#SaturdayDeliveryUnitNo")[0].checked = true;
			$("#UPSDeliveryToHomeNo")[0].checked = true;
			$("#SaturdayDeliveryHomeNo")[0].checked = true;
			$("#ProcessingFeeYes")[0].checked = true;

			if (me.status == "CheckRequest") {
				me.setUserInfo();
				me.resizeControls();
			}				
		},

		resetGrid: function() {
			var me = this;
			var index = me.payCheckRequestGrid.activeRowIndex;

			if (me.statuses[me.statusType.indexSelected].id == 0) {
				if (me.status == "CheckRequestResend") 
					me.payCheckRequests[index].statusType = 2;
				else
					me.payCheckRequests[index].statusType = 6;
				me.payCheckRequestGrid.body.renderRow(index, index);
				me.payCheckRequestGrid.body.deselect(index, true);
			}
			else {
				me.payCheckRequests.splice(index, 1);
				me.payCheckRequestGrid.setData(me.payCheckRequests);
			}
			me.resetControls("");
			me.setReadOnly(true);
		},

		setReadOnly: function(readOnly) {
			var me = this;

			$("#houseCodeText")[0].readOnly = readOnly;
			$("#houseCodeTemplateText")[0].readOnly = readOnly;
			me.requestedDate.text.readOnly = readOnly;
			me.deliveryDate.text.readOnly = readOnly;
			me.employeeNumber.text.readOnly = readOnly;
			me.employeeName.text.readOnly = readOnly;
			me.reasonForRequest.text.readOnly = readOnly;
			me.state.text.readOnly = readOnly;
			me.unitAddress.text.readOnly = readOnly;
			me.upsPackageAttentionTo.text.readOnly = readOnly;
			me.homeAddress.text.readOnly = readOnly;
			me.deductionCode.text.readOnly = readOnly;
			me.amount.text.readOnly = readOnly;
			me.managerName.text.readOnly = readOnly;
			me.managerEmail.text.readOnly = readOnly;
			me.requestorEmail.text.readOnly = readOnly;
			
			$("#TermRequestYes")[0].disabled = readOnly;
			$("#TermRequestNo")[0].disabled = readOnly;
			$("#CurrentPayCardUserYes")[0].disabled = readOnly;
			$("#CurrentPayCardUserNo")[0].disabled = readOnly;
			$("#InstantIssueRequestYes")[0].disabled = readOnly;
			$("#InstantIssueRequestNo")[0].disabled = readOnly;
			$("#UPSDeliveryToUnitYes")[0].disabled = readOnly;
			$("#UPSDeliveryToUnitNo")[0].disabled = readOnly;
			$("#SaturdayDeliveryUnitYes")[0].disabled = readOnly;
			$("#SaturdayDeliveryUnitNo")[0].disabled = readOnly;
			$("#UPSDeliveryToHomeYes")[0].disabled = readOnly;
			$("#UPSDeliveryToHomeNo")[0].disabled = readOnly;
			$("#SaturdayDeliveryHomeYes")[0].disabled = readOnly;
			$("#SaturdayDeliveryHomeNo")[0].disabled = readOnly;
			$("#ProcessingFeeYes")[0].disabled = readOnly;
			$("#ProcessingFeeNo")[0].disabled = readOnly;

			if (readOnly) {
				$("#RequestedDateAction").removeClass("iiInputAction");
				$("#DeliveryDateAction").removeClass("iiInputAction");
				$("#StateAction").removeClass("iiInputAction");
				$("#houseCodeTextDropImage").removeClass("HouseCodeDropDown");
				$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
			}
			else  {
				$("#RequestedDateAction").addClass("iiInputAction");
				$("#DeliveryDateAction").addClass("iiInputAction");
				$("#StateAction").addClass("iiInputAction");
				$("#houseCodeTextDropImage").addClass("HouseCodeDropDown");
				$("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDown");
			}
		},
		
		currentDate: function() {
			var currentTime = new Date();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			
			return month + "/" + day + "/" + year;
		},
		
		statusesLoaded: function() {
			var me = this;

			me.statuses = [];
			me.statuses.push(new fin.pay.payCheck.Status(0, "[All]"));
			me.statuses.push(new fin.pay.payCheck.Status(2, "In Process"));
			me.statuses.push(new fin.pay.payCheck.Status(8, "Approved"));
			me.statuses.push(new fin.pay.payCheck.Status(9, "Completed"));
			me.statuses.push(new fin.pay.payCheck.Status(6, "Cancelled"));
			me.statuses.push(new fin.pay.payCheck.Status(10, "Unapproved"));

			me.statusType.setData(me.statuses);
			me.statusType.select(0, me.statusType.focused);
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.checkLoadCount();
		},
		
		payCodeTypesLoaded: function(me, activeId) {

			me.payCodeType.setData(me.payCodeTypes);
			me.payCodeDetailGrid.setData(me.payCodeDetails);
			me.payCodeDetailGrid.setHeight(150);
			me.requestedDate.setValue(me.currentDate());
			me.modified(false);
			me.checkLoadCount();
		},

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.checkLoadCount();
		},

		houseCodeTemplateChanged: function() { 
			var args = ii.args(arguments,{});			
			var me = this;	
			
			me.modified();
			me.siteStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",type:invoice", me.sitesLoaded, me);
		},
		
		sitesLoaded: function(me, activeId) {
			
			if (me.sites.length == 0)
				alert("Either Site information not found or Site is not associated to the House Code [" + me.houseCodeSearchTemplate.houseCodeTitleTemplate + "]. Please verify and try again!")
			else
				me.setUnitAddress();
		},
		
		setUnitAddress: function() {
			var me = this;

			if (me.sites.length > 0) {
				var address = me.sites[0].addressLine1 + ", ";
				address += (me.sites[0].addressLine2 == "" ? "" : me.sites[0].addressLine2 + ", ");
				address += me.sites[0].city + ", ";
				address += (me.sites[0].county == "" ? "" : me.sites[0].county + ", ");
				var index = ii.ajax.util.findIndexById(me.sites[0].state.toString(), me.stateTypes);
				if (index != undefined && index >= 0)
					address += me.stateTypes[index].name + ", ";
				address += me.sites[0].postalCode;
				me.unitAddress.setValue(address);
			}
		},

		searchEmployee: function() {
			var me = this;

			if (me.status == "CheckRequest") {
				$("#EmployeeNumberText").addClass("Loading");
				me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeNumber.getValue()
					+ ",employeeType:SearchFull"
					+ ",filterType:Employee Number"
					, me.employeesLoaded, me);
			}
		},
		
		employeesLoaded: function(me, activeId) {

			$("#EmployeeNumberText").removeClass("Loading");
			
			if (me.employees.length == 1) {
				me.employeeName.setValue(me.employees[0].firstName + " " + me.employees[0].lastName);
				if (me.personId != me.employees[0].id) {
					me.personId = me.employees[0].id;
					me.personStore.fetch("userId:[user],id:" + me.employees[0].id, me.personsLoaded, me);
				}
				else
					me.personsLoaded(me, 0);
			}
			else {
				alert("There is no Employee with Employe # [" + me.employeeNumber.getValue() + "].");
				me.employeeNumber.setValue("");
				me.employeeName.setValue("");
				return;
			}
		},
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			if (me.persons.length > 0) {
				if (me.pageLoading) {
					me.pageLoading = false;
					me.users = me.persons.slice();
					me.setUserInfo();
					me.requestorName.text.readOnly = true;
				}
				else
					me.setEmployeeAddress();
			}			
			me.checkLoadCount();
		},
		
		setEmployeeAddress: function() {
			var me = this;

			if (me.employeeNumber.getValue() != "" && me.employeeNumber.valid) {
				var address = me.persons[0].addressLine1 + ", ";
				address += (me.persons[0].addressLine2 == "" ? "" : me.persons[0].addressLine2 + ", ");
				address += me.persons[0].city + ", ";
				var index = ii.ajax.util.findIndexById(me.persons[0].state.toString(), me.stateTypes);
				if (index != undefined && index >= 0)
					address += me.stateTypes[index].name + ", ";
				address += me.persons[0].postalCode;
				me.homeAddress.setValue(address);
			}
		},
		
		setUserInfo: function() {
			var me = this;
			
			me.houseCodeSearchTemplate.houseCodeIdTemplate = 0;
			me.houseCodeSearchTemplate.houseCodeTitleTemplate = "";
			me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + " [" + me.session.propertyGet("userName") + "]");
			me.requestorEmail.setValue(me.users[0].email);			
			$("#houseCodeText").val(parent.fin.appUI.houseCodeTitle);
			$("#houseCodeTemplateText").val("");
		},
		
		actionPayCheckRequest: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#PayCodeDetailGrid").show();
			$("#SearchContainer").hide();
			$("#PayCodeDetailReadOnlyGrid").hide();

			me.setReadOnly(false);
			me.resetControls("CheckRequest");
			me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
			me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
			me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
			me.payCheckRequestGrid.body.deselectAll();
			me.payCodeDetailGrid.setHeight(150);
			$("#AnchorResendRequest").hide();
			$("#AnchorSendRequest").show();
			me.requestedDate.setValue(me.currentDate());
			$("#LabelState").html("<span id='nonRequiredFieldIndicator'>State:</span>");
			$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
			$("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
			$("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
			me.setStatus("Loaded");
			me.modified(false);
		},
		
		actionPayCheckRequestStatus: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#PayCodeDetailGrid").hide();
			$("#SearchContainer").show();
			$("#PayCodeDetailReadOnlyGrid").show();
			
			me.setReadOnly(true);
			me.resetControls("CheckRequestStatus");
			me.searchInput.setValue("");
			me.statusType.select(0, me.statusType.focused);
			me.searchInput.resizeText();
			me.statusType.resizeText();
			me.anchorSendRequest.display(ui.cmn.behaviorStates.disabled);
			me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
			me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
			$("#AnchorResendRequest").hide();
			$("#AnchorSendRequest").show();			
			me.payCheckRequestGrid.setData([]);
			me.payCheckRequestGrid.setHeight(200);
			me.payCodeDetailReadOnlyGrid.setData([]);
			me.payCodeDetailReadOnlyGrid.setHeight(150);
			me.setStatus("Loaded");
			me.modified(false);
		},
		
		actionSearchItem: function() {
			var me = this;

			me.setLoadCount();
			me.resetControls("");			
			me.payCheckRequestGrid.setData([]);
			me.payCodeDetailReadOnlyGrid.setData([]);
			me.payCodeDetailGrid.body.deselectAll();
			me.payCheckRequestStore.reset();
			me.payCheckRequestStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue() 
				+ ",statusType:" + (me.statusType.indexSelected == -1 ? 0 : me.statuses[me.statusType.indexSelected].id)
				, me.payCheckRequestsLoaded, me);
		},
		
		payCheckRequestsLoaded: function(me, activeId) {
			var index = 0;
			
			me.payCheckRequestGrid.setData(me.payCheckRequests);
			me.checkLoadCount();
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var item = me.payCheckRequestGrid.data[index];
			
			if (item.statusType == 10) {
				me.setReadOnly(false);
				me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
				me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
				me.anchorCancel.display(ui.cmn.behaviorStates.enabled);
				me.resizeControls();
				$("#imgAdd").show();
				$("#imgEdit").show();
				$("#imgRemove").show();
				$("#AnchorResendRequest").show();
				$("#AnchorSendRequest").hide();
				$("#PayCodeDetailGrid").show();
				$("#PayCodeDetailReadOnlyGrid").hide();
			}
			else {
				if (item.statusType == 2) {
					me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
					me.anchorCancel.display(ui.cmn.behaviorStates.enabled);
					$("#AnchorResendRequest").show();
					$("#AnchorSendRequest").hide();
				}					
				else {
					me.anchorSendRequest.display(ui.cmn.behaviorStates.disabled);
					me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
					$("#AnchorResendRequest").hide();
					$("#AnchorSendRequest").show();
				}			
				
				me.setReadOnly(true);
				me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
				$("#imgAdd").hide();
				$("#imgEdit").hide();
				$("#imgRemove").hide();				
				$("#PayCodeDetailGrid").hide();
				$("#PayCodeDetailReadOnlyGrid").show();
			}

			$("#houseCodeText").val(item.houseCodeTitle);
			$("#houseCodeTemplateText").val(item.deliveryHouseCodeTitle);
			me.requestedDate.setValue(item.requestedDate);
			me.deliveryDate.setValue(item.deliveryDate);
			me.employeeNumber.setValue(item.employeeNumber);
			me.employeeName.setValue(item.employeeName);
			me.reasonForRequest.setValue(item.reasonForRequest);

			var itemIndex = ii.ajax.util.findIndexById(item.stateType.toString(), me.stateTypes);
			if (itemIndex != undefined && itemIndex >= 0)
				me.state.select(itemIndex, me.state.focused);
			else
				me.state.reset();
			
			$("input[name='TermRequest'][value='" + item.termRequest + "']").attr("checked", "checked");  
			$("input[name='CurrentPayCardUser'][value='" + item.currentPayCardUser + "']").attr("checked", "checked");  
			$("input[name='InstantIssueRequest'][value='" + item.instantIssueRequest + "']").attr("checked", "checked");  
			$("input[name='UPSDeliveryToUnit'][value='" + item.upsDeliveryToUnit + "']").attr("checked", "checked");  
			$("input[name='SaturdayDeliveryUnit'][value='" + item.saturdayDeliveryUnit + "']").attr("checked", "checked");  
			$("input[name='UPSDeliveryToHome'][value='" + item.upsDeliveryToHome + "']").attr("checked", "checked");  
			$("input[name='SaturdayDeliveryHome'][value='" + item.saturdayDeliveryHome + "']").attr("checked", "checked");  
			$("input[name='ProcessingFee'][value='" + item.stopPaymentProcessingFee + "']").attr("checked", "checked");  
		
			me.unitAddress.setValue(item.houseCodeAddress);
			me.upsPackageAttentionTo.setValue(item.upsPackageAttentionTo);
			me.homeAddress.setValue(item.homeAddress);
			me.deductionCode.setValue(item.deductionCodes);
			me.amount.setValue(item.amount);
			me.requestorName.setValue(item.requestorName);
			me.requestorEmail.setValue(item.requestorEmail);
			me.managerName.setValue(item.managerName);
			me.managerEmail.setValue(item.managerEmail);

			me.loadCount += 1;
			me.setLoadCount();
			me.payCodeDetailGrid.body.deselectAll();
			me.documentGrid.body.deselectAll();
			me.payCodeDetailStore.reset();
			me.payCheckRequestDocumentStore.reset();
			me.payCodeDetailStore.fetch("userId:[user],payCheckRequest:" + item.id, me.payCodeDetailsLoaded, me);
			me.payCheckRequestDocumentStore.fetch("userId:[user],payCheckRequestId:" + item.id, me.payCheckRequestDocumentsLoaded, me);
			me.status = "CheckRequestStatus";
		},
		
		payCodeDetailsLoaded: function(me, activeId) {

			me.payCodeDetailGrid.setData(me.payCodeDetails);
			me.payCodeDetailGrid.setHeight(150);
			me.payCodeDetailReadOnlyGrid.setData(me.payCodeDetails);
			me.payCodeDetailReadOnlyGrid.setHeight(150);
			me.checkLoadCount();
			me.modified(false);
		},
		
		payCheckRequestDocumentsLoaded: function(me, activeId) {

			me.documentGrid.setData(me.payCheckRequestDocuments);
			me.documentGrid.setHeight(100);
			me.checkLoadCount();
		},

		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.actionPayCheckRequest();
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.status == "CheckRequest") {
				me.resetControls("CheckRequest");
				me.setStatus("Loaded");
			}								
			else if (me.status == "CheckRequestStatus")
				me.itemSelect(me.payCheckRequestGrid.activeRowIndex);			
		},
		
		actionCancelItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
			
			$("#messageToUser").text("Cancelling Request");
			me.status = "CheckRequestCancel";
			me.actionSaveItem();
		},
		
		actionResendRequestItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.payCheckRequestGrid.activeRowIndex == -1) {
				alert("Please select Payroll Check Requst");
				return false;
			}
			
			$("#messageToUser").text("Resending Request");	 
			me.status = "CheckRequestResend";
			me.actionSaveItem();
		},
		
		actionSendRequestItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			$("#messageToUser").text("Sending Request");
			me.actionSaveItem();
		},

		actionAttachItem: function() {
			var me = this;

			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			me.loadPopup();
			me.documentTitle.setValue("");
			me.documentTitle.resizeText();
			me.documentGrid.body.deselectAll();
		},

		actionEditItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;

			if (index != -1) {
				$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
				me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
				me.loadPopup();
				me.documentTitle.setValue(me.payCheckRequestDocuments[index].title);
				me.documentTitle.resizeText();
			}
		},

		actionUploadItem: function() {
			var me = this;
			var tempFileName = "";

			if (!me.documentTitle.validate(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.hidePopup();
			me.setLoadCount();
			me.setStatus("Uploading");
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow");
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {

				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					tempFileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					me.checkLoadCount();
					me.setStatus("Edit");

					if (tempFileName == "Error") {
						me.setStatus("Info", "Unable to upload the file. Please try again.");
						alert("Unable to upload the file. Please try again.");
					}
					else {
						if (me.documentGrid.activeRowIndex == -1) {
							var item = new fin.pay.payCheck.PayCheckRequestDocument(0, me.documentTitle.getValue(), me.fileName, tempFileName);
							me.payCheckRequestDocuments.push(item);
							me.documentGrid.setData(me.payCheckRequestDocuments);
						}
						else {
							var index = me.documentGrid.activeRowIndex;
							me.payCheckRequestDocuments[index].title = me.documentTitle.getValue();
							me.payCheckRequestDocuments[index].fileName = me.fileName;
							me.payCheckRequestDocuments[index].tempFileName = tempFileName;
							me.documentGrid.body.renderRow(index, index);
						}
					}
				}
			}, 1000);
		},

		actionUploadCancel: function() {
			var me = this;

			me.hidePopup();
			$("#pageLoading").fadeOut("slow");
		},

		actionRemoveItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;

			if (index != -1) {
				if (me.payCheckRequestDocuments[index].id > 0) {
					me.status = "DeleteDocument";
					$("#messageToUser").text("Removing");
					me.actionSaveItem();
				}
				me.payCheckRequestDocuments.splice(index, 1);
				me.documentGrid.setData(me.payCheckRequestDocuments);
			}
		},

		actionViewItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;
				
			if (index != -1) {
				if (me.payCheckRequestDocuments[index].id > 0) {
					me.setStatus("Downloading");
					$("#messageToUser").text("Downloading");
					$("#pageLoading").fadeIn("slow");
					me.fileNameStore.reset();
					me.fileNameStore.fetch("userId:[user],id:" + me.payCheckRequestDocuments[index].id
						+ ",fileName:" + me.payCheckRequestDocuments[index].fileName
						, me.fileNamesLoaded
						, me
						);
				}
			}
		},

		fileNamesLoaded: function(me, activeId) {

			if (parent.fin.appUI.modified)
				me.setStatus("Edit");
			else 
				me.setStatus("Normal");
			$("#pageLoading").fadeOut("slow");

			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var id = 0;
			var xml = "";
			
			if (me.status == "DeleteDocument") {
				xml += '<payCheckRequestDocumentDelete';
				xml += ' id="' + me.payCheckRequestDocuments[me.documentGrid.activeRowIndex].id + '"';			
				xml += '/>';
			}
			else {
				if ($("input[name='UPSDeliveryToUnit']:checked").val() == "true" && me.houseCodeSearchTemplate.houseCodeIdTemplate == 0 && me.action == "checkRequest") {
					alert("Please select the Unit (House Code).");
					return false;
				}
			
				if ($("input[name='CurrentPayCardUser']:checked").val() == "false" && $("input[name='UPSDeliveryToUnit']:checked").val() == "false" && $("input[name='UPSDeliveryToHome']:checked").val() == "false") {
					alert("Please select one pay check delivery location: Comdata Pay Card, Unit Delivery, or Employee Home Delivery.");
					return false;
				}
				
				if ($("input[name='InstantIssueRequest']:checked").val() == "true" && me.payCheckRequestDocuments.length <= 0) {
					alert("Please attach at least one Additional Document.");
					return false;
				}
				
				me.payCodeDetailGrid.body.deselectAll();
				me.validator.forceBlur();
	
				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			
				if (me.payCheckRequestGrid.activeRowIndex >= 0)
					id = me.payCheckRequestGrid.data[me.payCheckRequestGrid.activeRowIndex].id
				
				item = new fin.pay.payCheck.PayCheckRequest(
					id
					, 2
					, parent.fin.appUI.houseCodeId
					, parent.fin.appUI.houseCodeTitle
					, me.requestedDate.lastBlurValue
					, me.deliveryDate.lastBlurValue
					, me.employeeNumber.getValue()
					, me.employeeName.getValue()
					, me.reasonForRequest.getValue()
					, $("input[name='TermRequest']:checked").val() == "true" ? true : false
					, $("input[name='TermRequest']:checked").val() == "true" ? me.stateTypes[me.state.indexSelected].id : 0 
					, $("input[name='CurrentPayCardUser']:checked").val() == "true" ? true : false
					, $("input[name='InstantIssueRequest']:checked").val() == "true" ? true : false
					, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? true : false
					, $("input[name='SaturdayDeliveryUnit']:checked").val() == "true" ? true : false
					, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? me.houseCodeSearchTemplate.houseCodeIdTemplate : 0
					, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? me.houseCodeSearchTemplate.houseCodeTitleTemplate : ""
					, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? me.unitAddress.getValue() : ""
					, $("input[name='UPSDeliveryToUnit']:checked").val() == "true" ? me.upsPackageAttentionTo.getValue() : ""
					, $("input[name='UPSDeliveryToHome']:checked").val() == "true" ? true : false
					, $("input[name='SaturdayDeliveryHome']:checked").val() == "true" ? true : false
					, $("input[name='UPSDeliveryToHome']:checked").val() == "true" ? me.homeAddress.getValue() : ""
					, $("input[name='ProcessingFee']:checked").val() == "true" ? true : false
					, me.deductionCode.getValue()
					, me.amount.getValue()
					, me.requestorName.getValue()
					, me.requestorEmail.getValue()
					, me.managerName.getValue()				
					, me.managerEmail.getValue()
					);

				xml = me.saveXmlBuildItem(item);
			}
			
			if (xml == "")
				return true;
				
			me.setStatus("Saving");	
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
			xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
			xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
			xml += ' managerName="' + ui.cmn.text.xml.encode(item.managerName) + '"';
			xml += ' managerEmail="' + ui.cmn.text.xml.encode(item.managerEmail) + '"';
			xml += '/>';

			for (var index = 0; index < me.payCodeDetailGrid.data.length; index++) {
				xml += '<payCheckRequestPayCode';
				xml += ' id="' + me.payCodeDetailGrid.data[index].id + '"';;
				xml += ' payCheckRequestId="' + item.id + '"';
				xml += ' payCode="' + me.payCodeDetailGrid.data[index].payCode.id + '"';
				xml += ' hours="' + me.payCodeDetailGrid.data[index].hours + '"';				
				xml += ' earnings="' + me.payCodeDetailGrid.data[index].earnings + '"';
				xml += ' alternateBaseRate="' + me.payCodeDetailGrid.data[index].alternateBaseRate + '"';
				xml += ' date="' + ui.cmn.text.date.format(new Date(me.payCodeDetailGrid.data[index].date), "mm/dd/yyyy") + '"';
				xml += ' workOrderNumber="' + me.payCodeDetailGrid.data[index].workOrderNumber + '"';
				xml += '/>';
			}

			for (var index = 0; index < me.payCheckRequestDocuments.length; index++) {
				if (me.payCheckRequestDocuments[index].tempFileName != "") {
					xml += '<payCheckRequestDocument';
					xml += ' id="' + me.payCheckRequestDocuments[index].id + '"';;
					xml += ' title="' + ui.cmn.text.xml.encode(me.payCheckRequestDocuments[index].title) + '"';
					xml += ' description=""';				
					xml += ' fileName="' + ui.cmn.text.xml.encode(me.payCheckRequestDocuments[index].fileName) + '"';
					xml += ' tempFileName="' + ui.cmn.text.xml.encode(me.payCheckRequestDocuments[index].tempFileName) + '"';
					xml += '/>';
				}
			}

			xml += '<payCheckRequestNotification';
			xml += ' id="0"';
			xml += ' action="' + me.status + '"';
			xml += '/>';
			
			if (me.status == "CheckRequestCancel") {
				xml += '<payCheckRequestStatus';
				xml += ' id="' + item.id + '"';
				xml += ' transactionStatusType="6"';			
				xml += '/>';
			}
			
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
			
			if (status == "success") {
				if (me.status == "DeleteDocument") {
					me.setStatus("Edit");
				}
				else {
					if (me.status == "CheckRequest") {
						alert("Payroll check request sent successfully.");
						me.resetControls("CheckRequest");
					}
					else if (me.status == "CheckRequestResend") {
						alert("Payroll check request resent successfully.");
						me.resetGrid();
					}
					else if (me.status == "CheckRequestCancel") {
						alert("Payroll check request cancelled successfully.");
						me.resetGrid();
					}
					me.modified(false);
					me.setStatus("Saved");
				}
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while sending the payroll check request: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow");
		},

		loadPopup: function() {
			var me = this;

			me.centerPopup();

			$("#backgroundPopup").css({
				"opacity": "0.5"
			});
			$("#backgroundPopup").fadeIn("slow");
			$("#uploadPopup").fadeIn("slow");
		},

		hidePopup: function() {

			$("#backgroundPopup").fadeOut("slow");
			$("#uploadPopup").fadeOut("slow");
		},

		centerPopup: function() {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = $("#uploadPopup").width();
			var popupHeight = $("#uploadPopup").height();

			$("#uploadPopup").css({
				"top": windowHeight/2 - popupHeight/2 + $(window).scrollTop(),
				"left": windowWidth/2 - popupWidth/2 + $(window).scrollLeft()
			});
		}
    }
});

function onFileChange() {

	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;
	fileName = fileName.substring(fileName.lastIndexOf("\\") + 1) ;
	fin.payCheckUi.fileName = fileName;

	if (fileName == "")
		fin.payCheckUi.anchorUpload.display(ui.cmn.behaviorStates.disabled);
	else
		fin.payCheckUi.anchorUpload.display(ui.cmn.behaviorStates.enabled);
}

function main() {

	fin.payCheckUi = new fin.pay.payCheck.UserInterface();
	fin.payCheckUi.resize();
	fin.houseCodeSearchUi = fin.payCheckUi;
}
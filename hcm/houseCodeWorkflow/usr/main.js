ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.houseCodeWorkflow.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );
ii.Style( "fin.cmn.usr.grid", 9 );
ii.Style( "fin.cmn.usr.theme", 10 );
ii.Style( "fin.cmn.usr.core", 11 );
ii.Style( "fin.cmn.usr.multiselect", 12 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; }); 
}

ii.Class({
    Name: "fin.hcm.houseCodeWorkflow.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.currentWizard = "";
			me.nextWizard = "";
			me.prevWizard = "";
			me.level = "";
			me.status = "";
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodeWorkflow";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.initialize();
			me.setTabIndexes();
			me.setStatus("Loading");	
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},	
		
		authorizationProcess: function fin_hcm_houseCodeWorkflow_UserInterface_authorizationProcess() {
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
				me.loadCount = 2;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.houseCodeWorkflowMasterStore.fetch("userId:[user]", me.houseCodeWorkflowMastersLoaded, me);
				me.hirNodeStore.fetch("userId:[user],hierarchy:2,", me.hirNodesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	
		
		sessionLoaded: function fin_hcm_houseCodeWorkflow_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			fin.hcm.houseCodeWorkflowUi.houseCodeRequestGrid.setHeight($(window).height() - 110);
			$("#houseCodeDetailContainer").height($(window).height() - 150);
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

//			me.actionMenu
//				.addAction({
//					id: "newAction",
//					brief: "New", 
//					title: "Create the new house code request.",
//					actionFunction: function() { me.actionNewItem(); }
//				})

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});
			
			me.anchorEdit = new ui.ctl.buttons.Sizeable({
				id: "AnchorEdit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Edit&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionEditItem(); },
				hasHotState: true
			});

			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});

			me.anchorReject = new ui.ctl.buttons.Sizeable({
				id: "AnchorReject",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Reject&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionRejectItem(); },
				hasHotState: true
			});

			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});

			me.anchorPrev = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrev",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Prev&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrevItem(); },
				hasHotState: true
			});

			me.anchorNext = new ui.ctl.buttons.Sizeable({
				id: "AnchorNext",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNextItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
				
			me.houseCodeRequestGrid = new ui.ctl.Grid({
				id: "HouseCodeRequestGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() {
					if (me.status != "New") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.houseCodeRequestGrid.addColumn("column4", "column4", "Requestor", "Requestor", null);
			me.houseCodeRequestGrid.addColumn("column6", "column6", "Requested Date", "Requested Date", 140, function(requestedDate) { return ui.cmn.text.date.format(new Date(requestedDate), "mm/dd/yyyy"); });
			me.houseCodeRequestGrid.addColumn("column16", "column16", "Contract Type", "Contract Type", 150, function(contractType) { 
				var itemIndex = ii.ajax.util.findIndexById(contractType, me.contractTypes);
				if (itemIndex >= 0 && itemIndex != undefined)
					return me.contractTypes[itemIndex].name; 
			});
			me.houseCodeRequestGrid.capColumns();
			
			me.primaryContractType = new ui.ctl.Input.DropDown.Filtered({
				id : "PrimaryContractType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.primaryContractType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.primaryContractType.indexSelected == -1)
						this.setInvalid("Please select the correct Primary Type.");
				});
				
			me.division = new ui.ctl.Input.DropDown.Filtered({
				id : "Division",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.division.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.division.indexSelected == -1)
						this.setInvalid("Please select the correct Division.");
				});
				
			me.svp = new ui.ctl.Input.DropDown.Filtered({
				id : "SVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.svpChanged(); } 
		    });

			me.svp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.dvp = new ui.ctl.Input.DropDown.Filtered({
				id : "DVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.dvpChanged(); } 
		    });

			me.dvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.rvp = new ui.ctl.Input.DropDown.Filtered({
				id : "RVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.rvpChanged(); } 
		    });

			me.rvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.srm = new ui.ctl.Input.DropDown.Filtered({
				id : "SRM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.srmChanged(); } 
		    });

			me.srm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.rm = new ui.ctl.Input.DropDown.Filtered({
				id : "RM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.rmChanged(); } 
		    });

			me.rm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.am = new ui.ctl.Input.DropDown.Filtered({
				id : "AM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.am.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid Start Date.");
				});
				
			me.siteName = new ui.ctl.Input.Text({
		        id: "SiteName",
				maxLength: 64,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.siteName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.street1 = new ui.ctl.Input.Text({
		        id: "Street1",
				maxLength: 100,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.street1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.street2 = new ui.ctl.Input.Text({
		        id: "Street2",
				maxLength: 100,
				changeFunction: function() { me.modified(); } 
		    });

			me.street2.makeEnterTab()
				.setValidationMaster(me.validator)

			me.city = new ui.ctl.Input.Text({
		        id: "City",
				maxLength: 50,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.state = new ui.ctl.Input.DropDown.Filtered({
				id : "State",
				formatFunction: function( type ){ return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.zipCode = new ui.ctl.Input.Text({
		        id: "ZipCode",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.zipCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.zipCode.getValue() == "") 
					return;

				if (!(ui.cmn.text.validate.postalCode(me.zipCode.getValue())))
					this.setInvalid("Please enter valid Zip Code. Example: 99999 or 99999-9999");
			});
			
			me.county = new ui.ctl.Input.Text({
		        id: "County",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.county.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.phone = new ui.ctl.Input.Text({
		        id: "Phone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.phone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.phone.text.value;
					
					if (enteredText == "") return;

					me.phone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid Phone #. Example: (999) 999-9999");					
				});
				
			me.primaryServiceProvided = new ui.ctl.Input.DropDown.Filtered({
				id : "PrimaryServiceProvided",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.primaryServiceProvided.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.primaryServiceProvided.indexSelected == -1)
						this.setInvalid("Please select the correct Primary Service Provided.");
				});
			
			$("#OtherServicesProvided").multiselect({
				minWidth: 200
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function() { me.modified(true); }
			});

			me.priorServiceProvider = new ui.ctl.Input.Text({
		        id: "PriorServiceProvider",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.priorServiceProvider.makeEnterTab()
				.setValidationMaster(me.validator)

			me.hourlyCompany = new ui.ctl.Input.DropDown.Filtered({
				id : "HourlyCompany",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.hourlyCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.hourlyCompany.indexSelected == -1) {
						$("#LabelHourlyEmployees").hide();
						$("#HourlyEmployees").hide();
						me.hourlyEmployees.setValue("");
					}
					else {
						$("#LabelHourlyEmployees").show();
						$("#HourlyEmployees").show();
						me.hourlyEmployees.resizeText();
					}

					if (me.hourlyCompany.lastBlurValue != "" && me.hourlyCompany.indexSelected == -1)
						this.setInvalid("Please select correct Hourly Company.");
				});
				
			me.hourlyEmployees = new ui.ctl.Input.Text({
		        id: "HourlyEmployees",
				maxLength: 3,
				changeFunction: function() { me.modified(); }
		    });

			me.hourlyEmployees.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.hourlyEmployees.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.salaryCompany = new ui.ctl.Input.DropDown.Filtered({
				id : "SalaryCompany",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.salaryCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.salaryCompany.indexSelected == -1) {
						$("#LabelSalaryEmployees").hide();
						$("#SalaryEmployees").hide();
						me.salaryEmployees.setValue("");
					}
					else {
						$("#LabelSalaryEmployees").show();
						$("#SalaryEmployees").show();
						me.salaryEmployees.resizeText();
					}

					if (me.salaryCompany.lastBlurValue != "" && me.salaryCompany.indexSelected == -1)
						this.setInvalid("Please select correct Salary Company.");
				});
				
			me.salaryEmployees = new ui.ctl.Input.Text({
		        id: "SalaryEmployees",
				maxLength: 3,
				changeFunction: function() { me.modified(); }
		    });

			me.salaryEmployees.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.salaryEmployees.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.ePay = new ui.ctl.Input.Check({
		        id: "Epay"
		    });
			
			me.ePayOptions = new ui.ctl.Input.Text({
		        id: "EpayOptions",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.ePayOptions.makeEnterTab()
				.setValidationMaster(me.validator)

			me.unionAccount = new ui.ctl.Input.DropDown.Filtered({
				id : "UnionAccount",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.unionAccount.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.unionAccount.indexSelected == -1) {
						$("#LabelUnionName").hide();
						$("#UnionName").hide();
						$("#LabelLocalNumber").hide();
						$("#LocalNumber").hide();
						me.unionName.setValue("");
						me.localNumber.setValue("");
					}
					else {
						$("#LabelUnionName").show();
						$("#UnionName").show();
						$("#LabelLocalNumber").show();
						$("#LocalNumber").show();
						me.unionName.resizeText();
						me.localNumber.resizeText();
					}

					if (me.unionAccount.lastBlurValue != "" && me.unionAccount.indexSelected == -1)
						this.setInvalid("Please select correct Union Account.");
				});
				
			me.unionName = new ui.ctl.Input.Text({
		        id: "UnionName",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.unionName.makeEnterTab()
				.setValidationMaster(me.validator)

			me.localNumber = new ui.ctl.Input.Text({
		        id: "LocalNumber",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.localNumber.makeEnterTab()
				.setValidationMaster(me.validator)

			me.customerNumber = new ui.ctl.Input.Text({
		        id: "CustomerNumber",
				maxLength: 8,
				changeFunction: function() { me.modified(); me.customerNumberCheck(); }
		    });

			me.customerNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.customerNumber.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.clientName = new ui.ctl.Input.Text({
		        id: "ClientName",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientName.makeEnterTab()
				.setValidationMaster(me.validator)

			me.customerStreet = new ui.ctl.Input.Text({
		        id: "CustomerStreet",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.customerStreet.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.customerCity = new ui.ctl.Input.Text({
		        id: "CustomerCity",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.customerCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.customerState = new ui.ctl.Input.DropDown.Filtered({
				id : "CustomerState",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.customerState.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.customerState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.customerZipCode = new ui.ctl.Input.Text({
		        id: "CustomerZipCode",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.customerZipCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.customerZipCode.getValue() == "") 
					return;

				if (ui.cmn.text.validate.postalCode(me.customerZipCode.getValue()) == false)
					this.setInvalid("Please enter valid Zip Code. Example: 99999 or 99999-9999");
			});
			
			me.customerPhone = new ui.ctl.Input.Text({
		        id: "CustomerPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.customerPhone.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.customerPhone.text.value;
					
					if (enteredText == "") return;

					me.customerPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.customerPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid Phone #. Example: (999) 999-9999");					
				});
				
			me.customerBiller = new ui.ctl.Input.Text({
		        id: "CustomerBiller",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.customerBiller.makeEnterTab()
				.setValidationMaster(me.validator)

			me.billingFrequency = new ui.ctl.Input.DropDown.Filtered({
				id : "BillingFrequency",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.billingFrequency.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.billingFrequency.indexSelected == -1)
						this.setInvalid("Please select the correct Billing Frequency.");
				});
				
			me.paymentTerms = new ui.ctl.Input.Text({
		        id: "PaymentTerms",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.paymentTerms.makeEnterTab()
				.setValidationMaster(me.validator)

			me.creditApprovalNumber = new ui.ctl.Input.Text({
		        id: "CreditApprovalNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.creditApprovalNumber.makeEnterTab()
				.setValidationMaster(me.validator)

			me.regularContractPrice = new ui.ctl.Input.Text({
		        id: "RegularContractPrice",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.regularContractPrice.makeEnterTab()
				.setValidationMaster(me.validator)

			me.clientStatus = new ui.ctl.Input.DropDown.Filtered({
				id : "ClientStatus",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.clientStatus.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.clientStatus.lastBlurValue != "" && me.clientStatus.indexSelected == -1)
						this.setInvalid("Please select correct Client Status.");
				});

			me.taxExemptionNumber = new ui.ctl.Input.Text({
		        id: "TaxExemptionNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.taxExemptionNumber.makeEnterTab()
				.setValidationMaster(me.validator)

			me.certificate = new ui.ctl.Input.Text({
		        id: "Certificate",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.certificate.makeEnterTab()
				.setValidationMaster(me.validator)

			me.einNumber = new ui.ctl.Input.Text({
		        id: "EINNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.einNumber.makeEnterTab()
				.setValidationMaster(me.validator)

			me.companyStatus = new ui.ctl.Input.DropDown.Filtered({
				id : "CompanyStatus",
				formatFunction: function( type ){ return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.companyStatus.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.companyStatus.lastBlurValue != "" && me.companyStatus.indexSelected == -1)
						this.setInvalid("Please select correct Company Status.");
				});

			me.contractType = new ui.ctl.Input.Text({
		        id: "ContractType",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.contractType.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.contractLength = new ui.ctl.Input.Text({
		        id: "ContractLength",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.contractLength.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.expirationDate = new ui.ctl.Input.Date({
		        id: "ExpirationDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.expirationDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.expirationDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid Expiration Date.");
				});

			me.squareFootage = new ui.ctl.Input.Text({
		        id: "SquareFootage",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.squareFootage.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.licensedBeds = new ui.ctl.Input.Text({
		        id: "LicensedBeds",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.licensedBeds.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.gpoMember = new ui.ctl.Input.Text({
		        id: "GPOMember",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.gpoMember.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.startDateFirm = new ui.ctl.Input.Text({
		        id: "StartDateFirm",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.startDateFirm.makeEnterTab()
				.setValidationMaster(me.validator)

			me.contactName = new ui.ctl.Input.Text({
		        id: "ContactName",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.contactName.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.contactNumber = new ui.ctl.Input.Text({
		        id: "ContactNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.contactNumber.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.typesOfSuppliesPurchased = new ui.ctl.Input.Text({
		        id: "TypesOfSuppliesPurchased",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.typesOfSuppliesPurchased.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.chargeable = new ui.ctl.Input.DropDown.Filtered({
				id : "Chargeable",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.chargeable.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.chargeable.indexSelected == 0) {
						$("#LabelMarkup").show();
						$("#Markup").show();
						me.markup.resizeText();
					}
					else {
						$("#LabelMarkup").hide();
						$("#Markup").hide();
						me.markup.setValue("");
					}

					if (me.chargeable.lastBlurValue != "" && me.chargeable.indexSelected == -1)
						this.setInvalid("Please select correct Chargeable.");
				});
				
			me.markup = new ui.ctl.Input.Text({
		        id: "Markup",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.markup.makeEnterTab()
				.setValidationMaster(me.validator)

			me.serviceLocationNumber = new ui.ctl.Input.Text({
		        id: "ServiceLocationNumber",
		        maxLength: 8,
				changeFunction: function() { me.modified(); me.serviceLocationNumberCheck(); }
		    });

			me.serviceLocationNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.serviceLocationNumber.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.serviceLocationName = new ui.ctl.Input.Text({
		        id: "ServiceLocationName",
		        maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLocationName.makeEnterTab()
				.setValidationMaster(me.validator)

			me.miscNumber = new ui.ctl.Input.Text({
		        id: "MISCNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.miscNumber.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.exterior = new ui.ctl.Input.Text({
		        id: "Exterior",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.exterior.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.foodCourt = new ui.ctl.Input.Text({
		        id: "FoodCourt",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.foodCourt.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.commonArea = new ui.ctl.Input.Text({
		        id: "CommonArea",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.commonArea.makeEnterTab()
				.setValidationMaster(me.validator)
			
			me.otherAreas = new ui.ctl.Input.Text({
		        id: "OtherAreas",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.otherAreas.makeEnterTab()
				.setValidationMaster(me.validator)
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.houseCodeRequests = [];
			me.houseCodeRequestStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.hcm.houseCodeWorkflow.HouseCodeRequest,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.houseCodeRequestArgs,
				injectionArray: me.houseCodeRequests
			});					

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.houseCodeWorkflow.HirNode,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.houseCodeWorkflow.StateType,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.contractTypes = [];
			me.houseCodeWorkflowMasterStore = me.cache.register({
				storeId: "houseCodeWorkflowMasters",	// contractTypes
				itemConstructor: fin.hcm.houseCodeWorkflow.ContractType,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.contractTypeArgs,
				injectionArray: me.contractTypes	
			});

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.houseCodeWorkflow.ServiceType,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.houseCodeWorkflow.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});

			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.hcm.houseCodeWorkflow.HouseCodeType,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
			});

			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.hcm.houseCodeWorkflow.PayPayrollCompany,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys
			});

			me.jobs = [];
			me.jobStore = me.cache.register({
				storeId: "jobs",
				itemConstructor: fin.hcm.houseCodeWorkflow.Job,
				itemConstructorArgs: fin.hcm.houseCodeWorkflow.jobArgs,
				injectionArray: me.jobs
			});
		},
		
		initialize: function() {
			var me = this;

			$("#AnchorEdit").hide();
			$("#AnchorApprove").hide();
			$("#AnchorReject").hide();

			$("input[name='CompassPurchaseAnySupplies']").click(function() {
				if (this.id == "CompassPurchaseAnySuppliesYes") {
					$("#ContactInfo").show();
					me.contactName.resizeText();
					me.contactNumber.resizeText();
					me.typesOfSuppliesPurchased.resizeText();
				}
				else {
					$("#ContactInfo").hide();
					me.contactName.setValue("");
					me.contactNumber.setValue("");
					me.typesOfSuppliesPurchased.setValue("");
				}
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
		
		resizeControls: function() {
			var me = this;
			
			if (me.currentWizard == "PrimaryDriver") {
				me.primaryContractType.resizeText();
			}
			else if (me.currentWizard == "HierarchyInfo") {
				me.division.resizeText();
				me.svp.resizeText();
				me.dvp.resizeText();
				me.rvp.resizeText();
				me.srm.resizeText();
				me.rm.resizeText();
				me.am.resizeText();
			}
			else if (me.currentWizard == "SiteInfo") {
				me.startDate.resizeText();
				me.siteName.resizeText();
				me.street1.resizeText();
				me.street2.resizeText();
				me.city.resizeText();
				me.state.resizeText();
				me.zipCode.resizeText();
				me.county.resizeText();
				me.phone.resizeText();
			}				
			else if (me.currentWizard == "ServicesProvided") {
				me.primaryServiceProvided.resizeText();
				me.priorServiceProvider.resizeText();
			}
			else if (me.currentWizard == "PayrollInfo") {
				me.hourlyCompany.resizeText();
				me.hourlyEmployees.resizeText();
				me.salaryCompany.resizeText();
				me.salaryEmployees.resizeText();
				me.ePayOptions.resizeText();
			}
			else if (me.currentWizard == "BenefitsInfo") {
				me.unionAccount.resizeText();
				me.unionName.resizeText();
				me.localNumber.resizeText();
			}
			else if (me.currentWizard == "CustomerInfo") {
				me.customerNumber.resizeText();
				me.clientName.resizeText();
				me.customerStreet.resizeText();
				me.customerCity.resizeText();
				me.customerState.resizeText();
				me.customerZipCode.resizeText();
				me.customerPhone.resizeText();
				me.customerBiller.resizeText();
				me.billingFrequency.resizeText();
				me.paymentTerms.resizeText();
				me.creditApprovalNumber.resizeText();
				me.regularContractPrice.resizeText();
			}
			else if (me.currentWizard == "ClientInfo") {
				me.clientStatus.resizeText();
				me.taxExemptionNumber.resizeText();
				me.certificate.resizeText();
				me.einNumber.resizeText();
				me.companyStatus.resizeText();
			}
			else if (me.currentWizard == "ContractInfo") {
				me.contractType.resizeText();
				me.contractLength.resizeText();
				me.expirationDate.resizeText();
				me.squareFootage.resizeText();
				me.licensedBeds.resizeText();
				me.gpoMember.resizeText();
				me.startDateFirm.resizeText();
			}
			else if (me.currentWizard == "SuppliesInfo") {
				me.contactName.resizeText();
				me.contactNumber.resizeText();
				me.typesOfSuppliesPurchased.resizeText();
				me.chargeable.resizeText();
				me.markup.resizeText();
			}
			else if (me.currentWizard == "ServiceLocationInfo") {
				me.serviceLocationNumber.resizeText();
				me.serviceLocationName.resizeText();
				me.miscNumber.resizeText();
				me.exterior.resizeText();
				me.foodCourt.resizeText();
				me.commonArea.resizeText();
				me.otherAreas.resizeText();
			}
		},

		setTabIndexes: function() {
			var me = this;

			me.primaryContractType.text.tabIndex = 1;
			me.division.text.tabIndex = 11;
			me.svp.text.tabIndex = 12;
			me.dvp.text.tabIndex = 13;
			me.rvp.text.tabIndex = 14;
			me.srm.text.tabIndex = 15;
			me.rm.text.tabIndex = 16;
			me.am.text.tabIndex = 17;			
			me.startDate.text.tabIndex = 21;
			me.siteName.text.tabIndex = 22;
			me.street1.text.tabIndex = 23;
			me.street2.text.tabIndex = 24;
			me.city.text.tabIndex = 25;
			me.state.text.tabIndex = 26;
			me.zipCode.text.tabIndex = 27;
			me.county.text.tabIndex = 28;
			me.phone.text.tabIndex = 29;
			me.primaryServiceProvided.text.tabIndex = 31;
			$("#OtherServicesProvided")[0].tabIndex = 32;
			me.priorServiceProvider.text.tabIndex = 33;
			me.hourlyCompany.text.tabIndex = 41;
			me.hourlyEmployees.text.tabIndex = 42;
			me.salaryCompany.text.tabIndex = 43;
			me.salaryEmployees.text.tabIndex = 44;
			me.ePay.check.tabIndex = 45;
			me.ePayOptions.text.tabIndex = 46;
			$("#CrothallBenefitsYes")[0].tabIndex = 51;
			$("#CrothallBenefitsNo")[0].tabIndex = 52;
			me.unionAccount.text.tabIndex = 53;
			me.unionName.text.tabIndex = 54;
			me.localNumber.text.tabIndex = 55;
			me.customerNumber.text.tabIndex = 61;
			me.clientName.text.tabIndex = 62;
			me.customerStreet.text.tabIndex = 63;
			me.customerCity.text.tabIndex = 64;
			me.customerState.text.tabIndex = 65;
			me.customerZipCode.text.tabIndex = 66;
			me.customerPhone.text.tabIndex = 67;
			me.customerBiller.text.tabIndex = 68;
			me.billingFrequency.text.tabIndex = 69;
			me.paymentTerms.text.tabIndex = 70;
			me.creditApprovalNumber.text.tabIndex = 71;
			me.regularContractPrice.text.tabIndex = 72;
			me.clientStatus.text.tabIndex = 81;
			me.taxExemptionNumber.text.tabIndex = 82;
			me.certificate.text.tabIndex = 83;
			me.einNumber.text.tabIndex = 84;
			me.companyStatus.text.tabIndex = 85;
			$("#SelfPreformed")[0].tabIndex = 91;
			$("#SubContracted")[0].tabIndex = 92;
			me.contractType.text.tabIndex = 93;
			me.contractLength.text.tabIndex = 94;
			me.expirationDate.text.tabIndex = 95;
			$("#TenetHealthcareAccountYes")[0].tabIndex = 96;
			$("#TenetHealthcareAccountNo")[0].tabIndex = 97;
			me.squareFootage.text.tabIndex = 98;
			me.licensedBeds.text.tabIndex = 99;
			me.gpoMember.text.tabIndex = 100;
			me.startDateFirm.text.tabIndex = 101;
			$("#CompassPurchaseAnySuppliesYes")[0].tabIndex = 111;
			$("#CompassPurchaseAnySuppliesNo")[0].tabIndex = 112;
			me.contactName.text.tabIndex = 113;
			me.contactNumber.text.tabIndex = 114;
			me.typesOfSuppliesPurchased.text.tabIndex = 115;
			me.chargeable.text.tabIndex = 116;
			me.markup.text.tabIndex = 117;
			me.serviceLocationNumber.text.tabIndex = 121;
			me.serviceLocationName.text.tabIndex = 122;
			me.miscNumber.text.tabIndex = 123;
			me.exterior.text.tabIndex = 124;
			me.foodCourt.text.tabIndex = 125;
			me.commonArea.text.tabIndex = 126;
			me.otherAreas.text.tabIndex = 127;
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.primaryContractType.reset();
			me.primaryContractType.updateStatus();
			me.division.reset();
			me.svp.reset();
			me.dvp.reset();
			me.rvp.reset();
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.startDate.setValue("");
			me.siteName.setValue("");
			me.street1.setValue("");
			me.street2.setValue("");
			me.city.setValue("");
			me.state.reset();
			me.state.updateStatus();
			me.zipCode.setValue("");
			me.county.setValue("");
			me.phone.setValue("");
			me.primaryServiceProvided.reset();
			me.primaryServiceProvided.updateStatus();
			me.priorServiceProvider.setValue("");
			me.hourlyCompany.reset();
			me.hourlyEmployees.setValue("");
			me.salaryCompany.reset();
			me.salaryEmployees.setValue("");
			me.ePay.setValue("false");
			me.ePayOptions.setValue("");
			me.unionAccount.reset();
			me.unionName.setValue("");
			me.localNumber.setValue("");
			me.customerNumber.setValue("");
			me.clientName.setValue("");
			me.customerStreet.setValue("");
			me.customerCity.setValue("");
			me.customerState.reset();
			me.customerState.updateStatus();
			me.customerZipCode.setValue("");
			me.customerPhone.setValue("");
			me.customerBiller.setValue("");
			me.billingFrequency.reset();
			me.billingFrequency.updateStatus();
			me.paymentTerms.setValue("");
			me.creditApprovalNumber.setValue("");
			me.regularContractPrice.setValue("");
			me.clientStatus.reset();
			me.taxExemptionNumber.setValue("");
			me.certificate.setValue("");
			me.einNumber.setValue("");
			me.companyStatus.reset();
			me.contractType.setValue("");
			me.contractLength.setValue("");
			me.expirationDate.setValue("");
			me.squareFootage.setValue("");
			me.licensedBeds.setValue("");
			me.gpoMember.setValue("");
			me.startDateFirm.setValue("");
			me.contactName.setValue("");
			me.contactNumber.setValue("");
			me.typesOfSuppliesPurchased.setValue("");
			me.chargeable.reset();
			me.markup.setValue("");
			me.serviceLocationNumber.setValue("");
			me.serviceLocationName.setValue("");
			me.miscNumber.setValue("");
			me.exterior.setValue("");
			me.foodCourt.setValue("");
			me.commonArea.setValue("");
			me.otherAreas.setValue("");

			$("#OtherServicesProvided").multiselect("uncheckAll");
			$("#CrothallBenefitsYes")[0].checked = true;
			$("#SelfPreformed")[0].checked = true;
			$("#TenetHealthcareAccountYes")[0].checked = true;
			$("#CompassPurchaseAnySuppliesYes")[0].checked = true;
			$("#LabelHourlyEmployees").hide();
			$("#HourlyEmployees").hide();
			$("#LabelSalaryEmployees").hide();
			$("#SalaryEmployees").hide();
			$("#LabelUnionName").hide();
			$("#UnionName").hide();
			$("#LabelLocalNumber").hide();
			$("#LocalNumber").hide();
			$("#ContactInfo").show();
			$("#LabelMarkup").hide();
			$("#Markup").hide();
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.customerState.setData(me.stateTypes);
			me.houseCodeRequestStore.fetch("userId:[user],object:HouseCodeRequest,batch:0,startPoint:0,maximumRows:0", me.houseCodeRequestsLoaded, me);
		},

		houseCodeRequestsLoaded: function(me, activeId) {

			me.houseCodeRequestGrid.setData(me.houseCodeRequests);
			me.checkLoadCount();
			me.resize();
		},

		houseCodeWorkflowMastersLoaded: function(me, activeId) {

			me.clientStatusTypes = [];
			me.companyStatusTypes = [];
			me.supplyContractTypes = [];

			me.clientStatusTypes.push(new fin.hcm.houseCodeWorkflow.ClientStatusType(1, "FP"));
			me.clientStatusTypes.push(new fin.hcm.houseCodeWorkflow.ClientStatusType(1, "NP"));

			me.companyStatusTypes.push(new fin.hcm.houseCodeWorkflow.CompanyStatusType(1, "Public"));
			me.companyStatusTypes.push(new fin.hcm.houseCodeWorkflow.CompanyStatusType(1, "Private"));

			me.supplyContractTypes.push(new fin.hcm.houseCodeWorkflow.SupplyContractType(1, "Chargeable"));
			me.supplyContractTypes.push(new fin.hcm.houseCodeWorkflow.SupplyContractType(1, "Included"));

			me.primaryContractType.setData(me.contractTypes);
			me.primaryServiceProvided.setData(me.serviceTypes);
			me.unionAccount.setData(me.houseCodeTypes);
			me.billingFrequency.setData(me.billingCycleFrequencys);
			me.hourlyCompany.setData(me.payPayrollCompanys);
			me.salaryCompany.setData(me.payPayrollCompanys);
			me.clientStatus.setData(me.clientStatusTypes);
			me.companyStatus.setData(me.companyStatusTypes);
			me.chargeable.setData(me.supplyContractTypes);

			$("#OtherServicesProvided").html("");
			for (var index = 0; index < me.serviceTypes.length; index++) {
				$("#OtherServicesProvided").append("<option title='" + me.serviceTypes[index].name + "' value='" + me.serviceTypes[index].id + "'>" + me.serviceTypes[index].name + "</option>");
			}
			$("#OtherServicesProvided").multiselect("refresh");

			me.checkLoadCount();
			me.resizeControls();
		},

		hirNodesLoaded: function (me, activeId) {

			var divisions = [];
			var svps = [];
			var dvps = [];
			var rvps = [];
			var srms = [];
			var rms = [];
			var ams = [];

			for (var index = 0; index < me.hirNodes.length; index++) {
				if (me.hirNodes[index].hirLevelTitle == "Enterprise")
					divisions.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Senior Vice President")
					svps.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Divisonal Vice President")
					dvps.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Regional Vice President")
					rvps.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Senior Regional Manager")
					srms.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Regional Manager")
					rms.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Area Manager")
					ams.push(new fin.hcm.houseCodeWorkflow.Division(me.hirNodes[index].id, me.hirNodes[index].title));
			}

			if (me.level == "") {
				me.division.setData(divisions);
				me.svp.setData(svps);
			}
			else if (me.level == "Divisonal Vice President") {
				me.dvp.setData(dvps);
			}
			else if (me.level == "Regional Vice President") {
				me.rvp.setData(rvps);
			}
			else if (me.level == "Senior Regional Manager") {
				me.srm.setData(srms);
			}
			else if (me.level == "Regional Manager") {
				me.rm.setData(rms);
			}
			else if (me.level == "Area Manager")
				me.am.setData(ams);
        },

		svpChanged: function() {
			var me = this;

			me.level = "Divisonal Vice President";
			me.dvp.reset();
			me.rvp.reset();
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.dvp.setData([]);
			me.rvp.setData([]);
			me.srm.setData([]);
			me.rm.setData([]);
			me.am.setData([]);

			if (me.svp.indexSelected >= 0) {
				me.dvp.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.svp.data[me.svp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
		},

		dvpChanged: function() {
			var me = this;

			me.level = "Regional Vice President";
			me.rvp.reset();
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.rvp.setData([]);
			me.srm.setData([]);
			me.rm.setData([]);
			me.am.setData([]);

			if (me.dvp.indexSelected >= 0) {
				me.rvp.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.dvp.data[me.dvp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
		},

		rvpChanged: function() {
			var me = this;

			me.level = "Senior Regional Manager";
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.srm.setData([]);
			me.rm.setData([]);
			me.am.setData([]);

			if (me.rvp.indexSelected >= 0) {
				me.srm.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.rvp.data[me.rvp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
		},

		srmChanged: function() {
			var me = this;

			me.level = "Regional Manager";
			me.rm.reset();
			me.am.reset();
			me.rm.setData([]);
			me.am.setData([]);

			if (me.srm.indexSelected >= 0) {
				me.rm.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.srm.data[me.srm.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
		},

		rmChanged: function() {
			var me = this;

			me.level = "Area Manager";
			me.am.reset();
			me.am.setData([]);

			if (me.rm.indexSelected >= 0) {
				me.am.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.rm.data[me.rm.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
		},
		
		customerNumberCheck: function() {
			var me = this;

			if (me.customerNumber.getValue().length > 0) {
				me.jobStore.reset();
				me.jobStore.fetch("userId:[user],jobType:3,jobNumber:" + me.customerNumber.getValue() + ",", me.customersLoaded, me);
			}
		},
		
		customersLoaded: function(me, activeId) {

			if (me.jobs.length > 0) {
				me.clientName.setValue(me.jobs[0].description);
				me.customerStreet.setValue(me.jobs[0].address1);
				me.customerCity.setValue(me.jobs[0].city);
				var index = ii.ajax.util.findIndexById(me.jobs[0].appStateTypeId.toString(), me.stateTypes);
				if (index != undefined) 
					me.customerState.select(index, me.customerState.focused);
				else 
					me.customerState.reset();
				me.customerZipCode.setValue(me.jobs[0].postalCode);
				//me.customerPhone.setValue(me.jobs[0].description);
			}
		},
		
		serviceLocationNumberCheck: function() {
			var me = this;

			if (me.serviceLocationNumber.getValue().length > 0) {
				me.jobStore.reset();
				me.jobStore.fetch("userId:[user],jobType:2,jobNumber:" + me.serviceLocationNumber.getValue() + ",", me.serviceLocationsLoaded, me);
			}
		},

		serviceLocationsLoaded: function(me, activeId) {

			if (me.jobs.length > 0) {
				me.serviceLocationName.setValue(me.jobs[0].description);
			}
		},

		itemSelect: function() {			
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.houseCodeRequestGrid.data[index];

			if (!parent.fin.cmn.status.itemValid()) {
				me.houseCodeRequestGrid.body.deselect(index, true);
				return;
			}
			
			me.lastSelectedRowIndex = index;
			me.status = "";	
			
			if (item == undefined) 
				return;
			
			if (item != undefined) {
				if (item.column7 == "In Process") {
					$("#AnchorEdit").show();
					$("#AnchorApprove").show();
					$("#AnchorReject").show();
				}
				else if (item.column7 == "Rejected") {
					$("#AnchorEdit").show();
					$("#AnchorApprove").hide();
					$("#AnchorReject").hide();
				}

				itemIndex = ii.ajax.util.findIndexById(item.column16, me.contractTypes);
				if (itemIndex >= 0 && itemIndex != undefined)
					$("#ReadonlyContractType").html(me.contractTypes[itemIndex].name);
				$("#ReadonlyDivision").html(item.column17);
				$("#ReadonlySVP").html(item.column18);
				$("#ReadonlyDVP").html(item.column19);
				$("#ReadonlyRVP").html(item.column20);
				$("#ReadonlySRM").html(item.column21);
				$("#ReadonlyRM").html(item.column22);
				$("#ReadonlyAM").html(item.column23);
				$("#ReadonlySiteName").html(item.column25);
			}

			me.setStatus("Loaded");					
		},
		
		initializeWizard: function() {
			var me = this;
			
			if (me.status == "New")
				me.houseCodeRequestGrid.body.deselectAll();
			$("#hierarchyContainer").hide();
			$("#siteInfoContainer").hide();	
			$("#servicesContainer").hide();
			$("#payrollInfoContainer").hide();
			$("#benefitsContainer").hide();
			$("#customerInfoContainer").hide();
			$("#clientInfoContainer").hide();
			$("#contractInfoContainer").hide();
			$("#suppliesInfoContainer").hide();
			$("#serviceLocationInfoContainer").hide();
			me.currentWizard = "PrimaryDriver";
			me.setStatus("Normal");
			me.anchorSave.display(ui.cmn.behaviorStates.disabled);
			me.resetControls();
			loadPopup();
			me.actionShowWizard();
			me.checkWizardSecurity();
		},

		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#popupHeader").text("House Code Request");
			me.status = "New";
			me.initializeWizard();
		},

		actionPrevItem: function() {
			var me = this;
			
			me.currentWizard = me.prevWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},

		actionNextItem: function() {
			var me = this;

			if (me.currentWizard == "PrimaryDriver") {
				if (!me.primaryContractType.validate(true))
					return false;
			}
			else if (me.currentWizard == "HierarchyInfo") {
				if (!me.division.validate(true) || !me.svp.validate(true) || !me.dvp.validate(true) || !me.rvp.validate(true)
					|| !me.srm.validate(true) || !me.rm.validate(true) || !me.am.validate(true))
					return false;
			}
			else if (me.currentWizard == "SiteInfo") {
				if (!me.startDate.validate(true) || !me.siteName.validate(true) || !me.street1.validate(true)
					|| !me.city.validate(true) || !me.state.validate(true) || !me.zipCode.validate(true) || !me.county.validate(true))
					return false;
			}
			else if (me.currentWizard == "ServicesProvided") {
				if (!me.primaryServiceProvided.validate(true))
					return false;
			}
			else if (me.currentWizard == "PayrollInfo") {
				if (!me.hourlyCompany.validate(true) || !me.salaryCompany.validate(true))
					return false;
			}
			else if (me.currentWizard == "BenefitsInfo") {
				if (!me.unionAccount.validate(true))
					return false;
			}
			else if (me.currentWizard == "CustomerInfo") {
				if (!me.customerNumber.validate(true) || !me.customerStreet.validate(true) || !me.customerCity.validate(true) 
					|| !me.customerState.validate(true) || !me.customerZipCode.validate(true) || !me.customerPhone.validate(true)
					|| !me.billingFrequency.validate(true))
					return false;
			}
			else if (me.currentWizard == "ClientInfo") {
				if (!me.clientStatus.validate(true) || !me.companyStatus.validate(true))
					return false;
			}
			else if (me.currentWizard == "SuppliesInfo") {
				if (!me.chargeable.validate(true))
					return false;
			}

			me.currentWizard = me.nextWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},

		actionShowWizard: function() {
			var me = this;

			switch (me.currentWizard) {
				case "PrimaryDriver":
					$("#hierarchyContainer").hide();
					$("#primaryDriverContainer").show();
					break;

				case "HierarchyInfo":
					$("#primaryDriverContainer").hide();
					$("#siteInfoContainer").hide();
					$("#hierarchyContainer").show();
					me.division.select(0, me.division.focused);
					break;

				case "SiteInfo":
					$("#hierarchyContainer").hide();
					$("#servicesContainer").hide();
					$("#siteInfoContainer").show();
					break;

				case "ServicesProvided":
					$("#siteInfoContainer").hide();
					$("#payrollInfoContainer").hide();
					$("#servicesContainer").show();
					break;
					
				case "PayrollInfo":
					$("#servicesContainer").hide();
					$("#benefitsContainer").hide();
					$("#payrollInfoContainer").show();
					break;
					
				case "BenefitsInfo":
					$("#payrollInfoContainer").hide();
					$("#customerInfoContainer").hide();
					$("#benefitsContainer").show();
					break;
					
				case "CustomerInfo":
					$("#benefitsContainer").hide();
					$("#clientInfoContainer").hide();
					$("#customerInfoContainer").show();
					break;
					
				case "ClientInfo":
					$("#customerInfoContainer").hide();
					$("#contractInfoContainer").hide();
					$("#clientInfoContainer").show();
					break;
				
				case "ContractInfo":
					$("#clientInfoContainer").hide();
					$("#suppliesInfoContainer").hide();
					$("#contractInfoContainer").show();
					break;
					
				case "SuppliesInfo":
					$("#contractInfoContainer").hide();
					$("#serviceLocationInfoContainer").hide();
					$("#suppliesInfoContainer").show();
					break;
				
				case "ServiceLocationInfo":
					$("#suppliesInfoContainer").hide();
					$("#serviceLocationInfoContainer").show();
					break;
				}

			me.resizeControls();
		},

		checkWizardSecurity: function() {
			var me = this;

			me.prevWizard = "";
			me.nextWizard = "";

			switch (me.currentWizard) {
				case "PrimaryDriver":
					me.nextWizard = "HierarchyInfo";
					break;
					
				case "HierarchyInfo":
					me.nextWizard = "SiteInfo";
					me.prevWizard = "PrimaryDriver";
					break;
					
				case "SiteInfo":
					me.nextWizard = "ServicesProvided";
					me.prevWizard = "HierarchyInfo";					
					break;					
					
				case "ServicesProvided":
					me.nextWizard = "PayrollInfo";
					me.prevWizard = "SiteInfo";					
					break;
					
				case "PayrollInfo":
					me.nextWizard = "BenefitsInfo";
					me.prevWizard = "ServicesProvided";
					break;
					
				case "BenefitsInfo":
					me.nextWizard = "CustomerInfo";
					me.prevWizard = "PayrollInfo";
					break;

				case "CustomerInfo":
					me.nextWizard = "ClientInfo";
					me.prevWizard = "BenefitsInfo";
					break;

				case "ClientInfo":
					me.nextWizard = "ContractInfo";
					me.prevWizard = "CustomerInfo";
					break;
					
				case "ContractInfo":
					me.nextWizard = "SuppliesInfo";
					me.prevWizard = "ClientInfo";
					break;
					
				case "SuppliesInfo":
					me.nextWizard = "ServiceLocationInfo";
					me.prevWizard = "ContractInfo";
					break;
					
				case "ServiceLocationInfo":					
					me.prevWizard = "SuppliesInfo";
					break;
			}
			
			if (me.nextWizard == "") {
				me.anchorNext.display(ui.cmn.behaviorStates.disabled);
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
			}				
			else {
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
			}

			if (me.prevWizard == "")
				me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
			else
				me.anchorPrev.display(ui.cmn.behaviorStates.enabled);
		},

		actionCancelItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup();
			me.status = "";
			me.nextCount = 0;
			me.setStatus("Normal");
		},

		actionEditItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var index = 0;

//			if (me.lastSelectedRowIndex >= 0) {
//				$("#popupHeader").text("House Code Request - Edit");
//				me.status = "Edit";
//				me.initializeWizard();
//				var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];
//				index = ii.ajax.util.findIndexById(item.column16, me.contractTypes);
//				if (index != undefined && index >= 0)
//					me.primaryContractType.select(index, me.primaryContractType.focused);
//
//				me.division.setValue(item.column17);
//				me.svp.setValue(item.column18);
//				me.dvp.setValue(item.column19);
//				me.rvp.setValue(item.column20);
//				me.srm.setValue(item.column21);
//				me.rm.setValue(item.column22);
//				me.am.setValue(item.column23);
//				me.startDate.setValue(item.column24);
//				me.siteName.setValue(item.column25);
//				me.street1.setValue(item.column26);
//				me.street2.setValue(item.column27);
//				me.city.setValue(item.column28);
//				me.state.reset();
//
//				me.zipCode.setValue("");
//				me.county.setValue("");
//				me.phone.setValue("");
//				me.primaryServiceProvided.reset();
//				me.priorServiceProvider.setValue("");
//				me.hourlyCompany.reset();
//				me.hourlyEmployees.setValue("");
//				me.salaryCompany.reset();
//				me.salaryEmployees.setValue("");
//				me.ePay.setValue("false");
//				me.ePayOptions.setValue("");
//				me.unionAccount.reset();
//				me.unionName.setValue("");
//				me.localNumber.setValue("");
//				me.customerNumber.setValue("");
//				me.clientName.setValue("");
//				me.customerStreet.setValue("");
//				me.customerCity.setValue("");
//				me.customerState.reset();
//				me.customerState.updateStatus();
//				me.customerZipCode.setValue("");
//				me.customerPhone.setValue("");
//				me.customerBiller.setValue("");
//				me.billingFrequency.reset();
//
//				me.paymentTerms.setValue("");
//				me.creditApprovalNumber.setValue("");
//				me.regularContractPrice.setValue("");
//				me.clientStatus.reset();
//				me.taxExemptionNumber.setValue("");
//				me.certificate.setValue("");
//				me.einNumber.setValue("");
//				me.companyStatus.reset();
//				me.contractType.setValue("");
//				me.contractLength.setValue("");
//				me.expirationDate.setValue("");
//				me.squareFootage.setValue("");
//				me.licensedBeds.setValue("");
//				me.gpoMember.setValue("");
//				me.startDateFirm.setValue("");
//				me.contactName.setValue("");
//				me.contactNumber.setValue("");
//				me.typesOfSuppliesPurchased.setValue("");
//				me.chargeable.reset();
//				me.markup.setValue("");
//				me.serviceLocationNumber.setValue("");
//				me.serviceLocationName.setValue("");
//				me.miscNumber.setValue("");
//				me.exterior.setValue("");
//				me.foodCourt.setValue("");
//				me.commonArea.setValue("");
//				me.otherAreas.setValue("");
//	
//				$("#OtherServicesProvided").multiselect("uncheckAll");
//				$("#CrothallBenefitsYes")[0].checked = true;
//				$("#SelfPreformed")[0].checked = true;
//				$("#TenetHealthcareAccountYes")[0].checked = true;
//				$("#CompassPurchaseAnySuppliesYes")[0].checked = true;
//				$("#LabelHourlyEmployees").hide();
//				$("#HourlyEmployees").hide();
//				$("#LabelSalaryEmployees").hide();
//				$("#SalaryEmployees").hide();
//				$("#LabelUnionName").hide();
//				$("#UnionName").hide();
//				$("#LabelLocalNumber").hide();
//				$("#LocalNumber").hide();
//				$("#ContactInfo").show();
//				$("#LabelMarkup").hide();
//				$("#Markup").hide();
//			}
		},

		actionApproveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

		},

		actionRejectItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (!me.serviceLocationNumber.validate(true))
					return false;

			hidePopup();
			me.setStatus("Saving");
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");
				
			var otherServicesProvided = $("#OtherServicesProvided").multiselect("getChecked").map(function() {
				return this.value;    
			}).get();

			var item = new fin.hcm.houseCodeWorkflow.HouseCodeRequest(
				(me.status == "New" ? 0 : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].id)
				, (me.status == "New" ? "0" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column1)
				, me.session.propertyGet("userId")
				, me.session.propertyGet("userName")
				, me.session.propertyGet("userFirstName")
				, me.session.propertyGet("userLastName")
				, (me.status == "New" ? ui.cmn.text.date.format(new Date(), "mm/dd/yyyy") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column6)
				, (me.status == "New" ? "In Process" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column7)
				, (me.status == "New" ? "" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column8)
				, ""
				, ""
				, ""
				, ""
				, ""
				, ""
				, ""
				, me.primaryContractType.data[me.primaryContractType.indexSelected].id
				, me.division.lastBlurValue
				, me.svp.lastBlurValue
				, me.dvp.lastBlurValue
				, me.rvp.lastBlurValue
				, me.srm.lastBlurValue
				, me.rm.lastBlurValue
				, me.am.lastBlurValue
				, me.startDate.lastBlurValue
				, me.siteName.getValue()
				, me.street1.getValue()
				, me.street2.getValue()
				, me.city.getValue()
				, me.state.data[me.state.indexSelected].id
				, me.zipCode.getValue()
				, me.county.getValue()
				, fin.cmn.text.mask.phone(me.phone.getValue(), true)
				, me.primaryServiceProvided.data[me.primaryServiceProvided.indexSelected].id
				, otherServicesProvided
				, me.priorServiceProvider.getValue()
				, (me.hourlyCompany.indexSelected >= 0 ? me.hourlyCompany.data[me.hourlyCompany.indexSelected].id : 0)
				, me.hourlyEmployees.getValue()
				, (me.salaryCompany.indexSelected >= 0 ? me.salaryCompany.data[me.salaryCompany.indexSelected].id : 0)
				, me.salaryEmployees.getValue()
				, me.ePay.check.checked ? "1" : "0"
				, me.ePayOptions.getValue()
				, $("input[name='CrothallBenefits']:checked").val() == "true" ? "1" : "0"
				, (me.unionAccount.indexSelected >= 0 ? me.unionAccount.data[me.unionAccount.indexSelected].id : 0)
				, me.unionName.getValue()
				, me.localNumber.getValue()
				, me.customerNumber.getValue()
				, me.clientName.getValue()
				, me.customerStreet.getValue()
				, me.customerCity.getValue()
				, me.customerState.data[me.customerState.indexSelected].id
				, me.customerZipCode.getValue()
				, fin.cmn.text.mask.phone(me.customerPhone.getValue(), true)
				, me.customerBiller.getValue()
				, me.billingFrequency.data[me.billingFrequency.indexSelected].id
				, me.paymentTerms.getValue()
				, me.creditApprovalNumber.getValue()
				, me.regularContractPrice.getValue()
				, me.clientStatus.lastBlurValue
				, me.taxExemptionNumber.getValue()
				, me.certificate.getValue()
				, me.einNumber.getValue()
				, me.companyStatus.lastBlurValue
				, $("input[name='Contract']:checked").val() == "true" ? "SelfPreformed" : "SubContracted"
				, me.contractType.getValue()
				, me.contractLength.getValue()
				, me.expirationDate.lastBlurValue
				, $("input[name='TenetHealthcareAccount']:checked").val() == "true" ? "1" : "0"
				, me.squareFootage.getValue()
				, me.licensedBeds.getValue()
				, me.gpoMember.getValue()
				, me.startDateFirm.getValue()
				, $("input[name='CompassPurchaseAnySupplies']:checked").val() == "true" ? "1" : "0"
				, me.contactName.getValue()
				, me.contactNumber.getValue()
				, me.typesOfSuppliesPurchased.getValue()
				, me.chargeable.lastBlurValue
				, me.markup.getValue()
				, me.serviceLocationNumber.getValue()
				, me.serviceLocationName.getValue()
				, me.miscNumber.getValue()
				, me.exterior.getValue()
				, me.foodCourt.getValue()
				, me.commonArea.getValue()
				, me.otherAreas.getValue()
				);
			
			var xml = me.saveXmlBuild(item);

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
				item: {type: fin.hcm.houseCodeWorkflow.HouseCodeRequest}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<houseCodeRequest';
			xml += ' id="' + item.id + '"';
			xml += ' userId="' + item.column2 + '"';
			xml += ' userName="' + item.column3 + '"';
			xml += ' firstName="' + ui.cmn.text.xml.encode(item.column4) + '"';
			xml += ' lastName="' + ui.cmn.text.xml.encode(item.column5) + '"';
			xml += ' status="' + item.column7 + '"';
			xml += ' primaryContractType="' + item.column16 + '"';
			xml += ' division="' + ui.cmn.text.xml.encode(item.column17) + '"';
			xml += ' svp="' + ui.cmn.text.xml.encode(item.column18) + '"';
			xml += ' dvp="' + ui.cmn.text.xml.encode(item.column19) + '"';
			xml += ' rvp="' + ui.cmn.text.xml.encode(item.column20) + '"';
			xml += ' srm="' + ui.cmn.text.xml.encode(item.column21) + '"';
			xml += ' rm="' + ui.cmn.text.xml.encode(item.column22) + '"';
			xml += ' am="' + ui.cmn.text.xml.encode(item.column23) + '"';
			xml += ' startDate="' + item.column24 + '"';
			xml += ' siteName="' + ui.cmn.text.xml.encode(item.column25) + '"';
			xml += ' street1="' + ui.cmn.text.xml.encode(item.column26) + '"';
			xml += ' street2="' + ui.cmn.text.xml.encode(item.column27) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.column28) + '"';
			xml += ' state="' + item.column29 + '"';
			xml += ' zipCode="' + item.column30 + '"';
			xml += ' county="' + ui.cmn.text.xml.encode(item.column31) + '"';
			xml += ' phone="' + item.column32 + '"';
			xml += ' primaryServiceProvided="' + item.column33 + '"';
			xml += ' otherServicesProvided="' + item.column34 + '"';
			xml += ' priorServiceProvider="' + ui.cmn.text.xml.encode(item.column35) + '"';
			xml += ' hourlyCompany="' + item.column36 + '"';
			xml += ' hourlyEmployees="' + item.column37 + '"';
			xml += ' salaryCompany="' + item.column38 + '"';
			xml += ' salaryEmployees="' + item.column39 + '"';
			xml += ' ePay="' + item.column40 + '"';
			xml += ' ePayOptions="' + ui.cmn.text.xml.encode(item.column41) + '"';
			xml += ' crothallBenefits="' + item.column42 + '"';
			xml += ' unionAccount="' + item.column43 + '"';
			xml += ' unionName="' + ui.cmn.text.xml.encode(item.column44) + '"';
			xml += ' localNumber="' + ui.cmn.text.xml.encode(item.column45) + '"';
			xml += ' customerNumber="' + item.column46 + '"';
			xml += ' clientName="' + ui.cmn.text.xml.encode(item.column47) + '"';
			xml += ' customerStreet="' + ui.cmn.text.xml.encode(item.column48) + '"';
			xml += ' customerCity="' + ui.cmn.text.xml.encode(item.column49) + '"';
			xml += ' customerState="' + item.column50 + '"';
			xml += ' customerZipCode="' + item.column51 + '"';
			xml += ' customerPhone="' + item.column52 + '"';
			xml += ' customerBiller="' + ui.cmn.text.xml.encode(item.column53) + '"';
			xml += ' billingFrequency="' + item.column54 + '"';
			xml += ' paymentTerms="' + ui.cmn.text.xml.encode(item.column55) + '"';
			xml += ' creditApprovalNumber="' + ui.cmn.text.xml.encode(item.column56) + '"';
			xml += ' regularContractPrice="' + ui.cmn.text.xml.encode(item.column57) + '"';
			xml += ' clientStatus="' + ui.cmn.text.xml.encode(item.column58) + '"';
			xml += ' taxExemptionNumber="' + ui.cmn.text.xml.encode(item.column59) + '"';
			xml += ' certificate="' + ui.cmn.text.xml.encode(item.column60) + '"';
			xml += ' einNumber="' + ui.cmn.text.xml.encode(item.column61) + '"';
			xml += ' companyStatus="' + ui.cmn.text.xml.encode(item.column62) + '"';
			xml += ' contract="' + item.column63 + '"';
			xml += ' contractType="' + ui.cmn.text.xml.encode(item.column64) + '"';
			xml += ' contractLength="' + ui.cmn.text.xml.encode(item.column65) + '"';
			xml += ' expirationDate="' + item.column66 + '"';
			xml += ' tenetHealthcareAccount="' + item.column67 + '"';
			xml += ' squareFootage="' + ui.cmn.text.xml.encode(item.column68) + '"';
			xml += ' licensedBeds="' + ui.cmn.text.xml.encode(item.column69) + '"';
			xml += ' gpoMember="' + ui.cmn.text.xml.encode(item.column70) + '"';
			xml += ' startDateFirm="' + ui.cmn.text.xml.encode(item.column71) + '"';
			xml += ' compassPurchaseAnySupplies="' + item.column72 + '"';
			xml += ' contactName="' + ui.cmn.text.xml.encode(item.column73) + '"';
			xml += ' contactNumber="' + ui.cmn.text.xml.encode(item.column74) + '"';
			xml += ' typesOfSuppliesPurchased="' + ui.cmn.text.xml.encode(item.column75) + '"';
			xml += ' chargeable="' + item.column76 + '"';
			xml += ' markup="' + ui.cmn.text.xml.encode(item.column77) + '"';
			xml += ' serviceLocationNumber="' + item.column78 + '"';
			xml += ' serviceLocationName="' + ui.cmn.text.xml.encode(item.column79) + '"';
			xml += ' miscNumber="' + ui.cmn.text.xml.encode(item.column80) + '"';
			xml += ' exterior="' + ui.cmn.text.xml.encode(item.column81) + '"';
			xml += ' foodCourt="' + ui.cmn.text.xml.encode(item.column82) + '"';
			xml += ' commonArea="' + ui.cmn.text.xml.encode(item.column83) + '"';
			xml += ' otherAreas="' + ui.cmn.text.xml.encode(item.column84) + '"';
			xml += '/>';
	
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

			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function(){
					switch (this.tagName) {
						case "HcmHouseCode":
							if (me.status == "New") {
								item.id = parseInt($(this).attr("id"), 10);
								me.houseCodeRequests.push(item);
								me.lastSelectedRowIndex = me.houseCodeRequestGrid.data.length - 1;
							}
							else {
								me.lastSelectedRowIndex = me.houseCodeRequestGrid.activeRowIndex;
								me.houseCodeRequests[me.lastSelectedRowIndex] = item;
							}
							
							me.status = "";
							me.houseCodeRequestGrid.setData(me.houseCodeRequests);
							me.houseCodeRequestGrid.body.select(me.lastSelectedRowIndex);
							
							break;
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating House Code Request details: " + $(args.xmlNode).attr("message"));
			}	

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function loadPopup() {
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupWorkflow").fadeIn("slow");
}

function hidePopup() {
	
	$("#backgroundPopup").fadeOut("slow");
	$("#popupWorkflow").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupWorkflow").width();
	var popupHeight = $("#popupWorkflow").height();
		
	$("#popupWorkflow").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#popupLoading").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
		
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {

	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.hcm.houseCodeWorkflowUi = new fin.hcm.houseCodeWorkflow.UserInterface();
			fin.hcm.houseCodeWorkflowUi.resize();
		}
	}, 100);
}
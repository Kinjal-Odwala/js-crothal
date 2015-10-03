ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.houseCodeRequest.usr.defs" );

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
    Name: "fin.hcm.houseCodeRequest.UserInterface",
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

			me.workflowId = (queryStringArgs["id"] == undefined) ? 0 : parseInt(queryStringArgs["id"], 10);
			me.workflowStep = (queryStringArgs["stepNumber"] == undefined) ? 0 : parseInt(queryStringArgs["stepNumber"], 10);
			me.currentWizard = "";
			me.nextWizard = "";
			me.prevWizard = "";
			me.level = "";
			me.status = "";
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;
			me.validHouseCode = true;
			me.validSite = true;
			me.searchZipCode = false;
			me.searchZipCodeType = "";
			me.searchCustomerZipCode = false;
			me.searchServiceLocationZipCode = false;
			me.customers = [];
			me.serviceLocations = [];

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodeRequest";
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
		
		authorizationProcess: function fin_hcm_houseCodeRequest_UserInterface_authorizationProcess() {
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
				me.loadCount = 3;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.jdeCompanyStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
				me.houseCodeRequestMasterStore.fetch("userId:[user]", me.houseCodeRequestMastersLoaded, me);
				me.hirNodeStore.fetch("userId:[user],hierarchy:2,", me.hirNodesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	

		sessionLoaded: function fin_hcm_houseCodeRequest_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			fin.hcm.houseCodeRequestUi.houseCodeRequestGrid.setHeight($(window).height() - 80);
			$("#houseCodeDetailContainer").height($(window).height() - 120);
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

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

			me.anchorSendRequest = new ui.ctl.buttons.Sizeable({
				id: "AnchorSendRequest",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSendRequestItem(); },
				hasHotState: true
			});

			me.anchorCancelRequest = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelRequest",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelRequestItem(); },
				hasHotState: true
			});

			me.anchorView = new ui.ctl.buttons.Sizeable({
				id: "AnchorView",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;View&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionViewItem(); },
				hasHotState: true
			});

			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloseItem(); },
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

			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});
			
			me.anchorSaveAndApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorSaveAndApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save and Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveAndApproveItem(); },
				hasHotState: true
			});

			me.anchorGenerateHouseCode = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerateHouseCode",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate House Code & Export&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveAndApproveItem(); },
				hasHotState: true
			});

			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorExit = new ui.ctl.buttons.Sizeable({
				id: "AnchorExit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Exit&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExitItem(); },
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
			me.houseCodeRequestGrid.addColumn("column7", "column7", "Status", "Status", 150);
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

			me.financialCompany = new ui.ctl.Input.DropDown.Filtered({
				id : "FinancialCompany",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.financialCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.financialCompany.indexSelected == -1)
						this.setInvalid("Please select the correct Financial Company.");
				});

			me.serviceLine = new ui.ctl.Input.DropDown.Filtered({
				id : "ServiceLine",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.serviceLine.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.serviceLine.indexSelected == -1)
						this.setInvalid("Please select the correct Service Line.");
				});

			me.svp = new ui.ctl.Input.DropDown.Filtered({
				id : "SVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.svpChanged(); } 
		    });

			me.svp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.svp.getValue())))
						this.setInvalid("Please enter the correct title for SVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.dvp = new ui.ctl.Input.DropDown.Filtered({
				id : "DVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.dvpChanged(); } 
		    });

			me.dvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.dvp.getValue())))
						this.setInvalid("Please enter the correct title for DVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.rvp = new ui.ctl.Input.DropDown.Filtered({
				id : "RVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.rvpChanged(); } 
		    });

			me.rvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.rvp.getValue())))
						this.setInvalid("Please enter the correct title for RVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.srm = new ui.ctl.Input.DropDown.Filtered({
				id : "SRM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.srmChanged(); } 
		    });

			me.srm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.srm.getValue())))
						this.setInvalid("Please enter the correct title for SRM. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.rm = new ui.ctl.Input.DropDown.Filtered({
				id : "RM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.rmChanged(); } 
		    });

			me.rm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.rm.getValue())))
						this.setInvalid("Please enter the correct title for RM. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.am = new ui.ctl.Input.DropDown.Filtered({
				id : "AM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.amChanged(); } 
		    });

			me.am.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.am.getValue())))
						this.setInvalid("Please enter the correct title for AM. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.houseCode = new ui.ctl.Input.Text({
		        id: "HouseCode",
				maxLength: 16,
				changeFunction: function() { me.modified(); me.validateHouseCode(); }
		    });

			me.houseCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(ui.cmn.text.validate.generic(me.houseCode.getValue(), "^\\d+$")))
						this.setInvalid("Please enter valid numeric value.");
					else if (!me.validHouseCode)
						this.setInvalid("House Code [" + me.houseCode.getValue() + "] is already exists. Please enter different House Code.");
				});

			me.svpBrief = new ui.ctl.Input.Text({
		        id: "SVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.svpBrief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.dvpBrief = new ui.ctl.Input.Text({
		        id: "DVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.dvpBrief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.rvpBrief = new ui.ctl.Input.Text({
		        id: "RVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.rvpBrief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.srmBrief = new ui.ctl.Input.Text({
		        id: "SRMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.srmBrief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.rmBrief = new ui.ctl.Input.Text({
		        id: "RMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.rmBrief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.amBrief = new ui.ctl.Input.Text({
		        id: "AMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.amBrief.makeEnterTab()
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
				changeFunction: function() { me.modified(); me.validateSite(); }
		    });

			me.siteName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.siteName.getValue() == "") 
						return;

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.siteName.getValue())))
						this.setInvalid("Please enter the correct Site Name. The Site Name can't contain any of the following characters: \\/:*?\"<>|.,");
					else if (!me.validSite)
						this.setInvalid("Site Name [" + me.siteName.getValue() + "] is already exists. Please enter different Site Name.");
				});

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

			me.zipCode = new ui.ctl.Input.Text({
		        id: "ZipCode",
				maxLength: 10,
				changeFunction: function() {
					if (ui.cmn.text.validate.postalCode(me.zipCode.getValue())) {
						me.searchZipCode = true;
						me.loadZipCodeTypes("Site"); 
						me.modified();
					}
				}
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

			me.city = new ui.ctl.Input.DropDown.Filtered({
		        id: "City",
				formatFunction: function( type ) { return type.city; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.city.data.length > 0 && me.city.indexSelected == -1)
						this.setInvalid("Please select the correct City.");
				});

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

			me.county = new ui.ctl.Input.DropDown.Filtered({
		        id: "County",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.county.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.county.text.value == "") return;

					if ((this.focused || this.touched) && me.county.data.length > 0 && me.county.indexSelected == -1)
						this.setInvalid("Please select the correct County.");
				});

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
					
					if (me.unionAccount.indexSelected == -1 || me.unionAccount.lastBlurValue == "Non-Union") {
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

			me.customerNumber = new ui.ctl.Input.DropDown.Filtered({
				id : "CustomerNumber",
				maxLength: 8,
				title: "To search a specific Customer, type-in Customer Number and press Enter key.",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.customerNumberChanged(); } 
		    });

			me.customerNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.customerNumber.text.value;
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
					else if (enteredText.length < 3)
						this.setInvalid("Please enter search criteria (minimum 3 numbers).");
				});

			me.clientName = new ui.ctl.Input.Text({
		        id: "ClientName",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.customerStreet1 = new ui.ctl.Input.Text({
		        id: "CustomerStreet1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.customerStreet1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.customerStreet2 = new ui.ctl.Input.Text({
		        id: "CustomerStreet2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.customerZipCode = new ui.ctl.Input.Text({
		        id: "CustomerZipCode",
				maxLength: 10,
				changeFunction: function() {
					if (ui.cmn.text.validate.postalCode(me.customerZipCode.getValue())) {
						me.searchZipCode = true;
						me.loadZipCodeTypes("Customer"); 
						me.modified();
					}
				}
		    });

			me.customerZipCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.customerZipCode.getValue() == "") 
					return;

				if (!(ui.cmn.text.validate.postalCode(me.customerZipCode.getValue())))
					this.setInvalid("Please enter valid Zip Code. Example: 99999 or 99999-9999");
			});

			me.customerCity = new ui.ctl.Input.DropDown.Filtered({
		        id: "CustomerCity",
				formatFunction: function( type ) { return type.city; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.customerCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.customerCity.data.length > 0 && me.customerCity.indexSelected == -1)
						this.setInvalid("Please select the correct City.");
				});

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

			me.customerCounty = new ui.ctl.Input.DropDown.Filtered({
		        id: "CustomerCounty",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.customerCounty.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.customerCounty.text.value == "") return;

					if ((this.focused || this.touched) && me.customerCounty.data.length > 0 && me.customerCounty.indexSelected == -1)
						this.setInvalid("Please select the correct County.");
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

			me.contractType = new ui.ctl.Input.DropDown.Filtered({
				id : "ContractType",
				formatFunction: function( type ) { return type.name; },
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

			me.serviceLocationNumber = new ui.ctl.Input.DropDown.Filtered({
				id : "ServiceLocationNumber",
				maxLength: 8,
				title: "To search a specific Service Location, type-in Service Location Number and press Enter key.",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); me.serviceLocationNumberChanged(); } 
		    });

			me.serviceLocationNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.serviceLocationNumber.text.value;
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
					else if (enteredText.length < 3)
						this.setInvalid("Please enter search criteria (minimum 3 numbers).");
				});

			me.serviceLocationName = new ui.ctl.Input.Text({
		        id: "ServiceLocationName",
		        maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLocationName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.serviceLocationStreet1 = new ui.ctl.Input.Text({
		        id: "ServiceLocationStreet1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLocationStreet1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.serviceLocationStreet2 = new ui.ctl.Input.Text({
		        id: "ServiceLocationStreet2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLocationCity = new ui.ctl.Input.DropDown.Filtered({
		        id: "ServiceLocationCity",
				formatFunction: function( type ) { return type.city; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.serviceLocationCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.serviceLocationCity.data.length > 0 && me.serviceLocationCity.indexSelected == -1)
						this.setInvalid("Please select the correct City.");
				});

			me.serviceLocationState = new ui.ctl.Input.DropDown.Filtered({
				id : "ServiceLocationState",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });
			
			me.serviceLocationState.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.serviceLocationState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});

			me.serviceLocationZipCode = new ui.ctl.Input.Text({
		        id: "ServiceLocationZipCode",
				maxLength: 10,
				changeFunction: function() {
					if (ui.cmn.text.validate.postalCode(me.serviceLocationZipCode.getValue())) {
						me.searchZipCode = true;
						me.loadZipCodeTypes("ServiceLocation"); 
						me.modified();
					}
				}
		    });

			me.serviceLocationZipCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.serviceLocationZipCode.getValue() == "") 
					return;

				if (!(ui.cmn.text.validate.postalCode(me.serviceLocationZipCode.getValue())))
					this.setInvalid("Please enter valid Zip Code. Example: 99999 or 99999-9999");
			});

			me.serviceLocationCounty = new ui.ctl.Input.DropDown.Filtered({
		        id: "ServiceLocationCounty",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.serviceLocationCounty.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.serviceLocationCounty.text.value == "") return;

					if ((this.focused || this.touched) && me.serviceLocationCounty.data.length > 0 && me.serviceLocationCounty.indexSelected == -1)
						this.setInvalid("Please select the correct County.");
				});

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

			me.notes = $("#Notes")[0];

			$("#Notes").height(100);
			$("#Notes").keypress(function() {
				if (me.notes.value.length > 1023) {
					me.notes.value = me.notes.value.substring(0, 1024);
					return false;
				}
			});			
			$("#Notes").change(function() { me.modified(true); });

			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});
			
			me.anchorClosePopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorClosePopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionClosePopupItem(); },
				hasHotState: true
			});
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.workflowModules = [];
			me.workflowModuleStore = me.cache.register({
				storeId: "appWorkflowModules",
				itemConstructor: fin.hcm.houseCodeRequest.WorkflowModule,
				itemConstructorArgs: fin.hcm.houseCodeRequest.workflowModuleArgs,
				injectionArray: me.workflowModules
			});

			me.houseCodeRequests = [];
			me.houseCodeRequestStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.hcm.houseCodeRequest.HouseCodeRequest,
				itemConstructorArgs: fin.hcm.houseCodeRequest.houseCodeRequestArgs,
				injectionArray: me.houseCodeRequests
			});					

			me.persons = [];
			me.personStore = me.cache.register({ 
				storeId: "persons",
				itemConstructor: fin.hcm.houseCodeRequest.Person,
				itemConstructorArgs: fin.hcm.houseCodeRequest.personArgs,
				injectionArray: me.persons	
			});

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.houseCodeRequest.HirNode,
				itemConstructorArgs: fin.hcm.houseCodeRequest.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.hcm.houseCodeRequest.Site,
				itemConstructorArgs: fin.hcm.houseCodeRequest.siteArgs,
				injectionArray: me.sites
			});	

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.houseCodeRequest.HouseCode,
				itemConstructorArgs: fin.hcm.houseCodeRequest.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.houseCodeRequest.StateType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.contractTypes = [];
			me.houseCodeRequestMasterStore = me.cache.register({
				storeId: "houseCodeRequestMasters",	// contractTypes
				itemConstructor: fin.hcm.houseCodeRequest.ContractType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.contractTypeArgs,
				injectionArray: me.contractTypes	
			});

			me.jdeCompanys = [];
			me.jdeCompanyStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.hcm.houseCodeRequest.JDECompany,
				itemConstructorArgs: fin.hcm.houseCodeRequest.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});

			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.houseCodeRequest.ServiceLine,
				itemConstructorArgs: fin.hcm.houseCodeRequest.serviceLineArgs,
				injectionArray: me.serviceLines
			});

			me.termsOfContractTypes = [];
			me.termsOfContractTypeStore = me.cache.register({
				storeId: "termsOfContractTypes",
				itemConstructor: fin.hcm.houseCodeRequest.TermsOfContractType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.termsOfContractTypeArgs,
				injectionArray: me.termsOfContractTypes	
			});

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.houseCodeRequest.ServiceType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.houseCodeRequest.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.houseCodeRequest.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});

			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.hcm.houseCodeRequest.HouseCodeType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
			});

			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.hcm.houseCodeRequest.PayPayrollCompany,
				itemConstructorArgs: fin.hcm.houseCodeRequest.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys
			});

			me.jobs = [];
			me.jobStore = me.cache.register({
				storeId: "jobs",
				itemConstructor: fin.hcm.houseCodeRequest.Job,
				itemConstructorArgs: fin.hcm.houseCodeRequest.jobArgs,
				injectionArray: me.jobs
			});

			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.hcm.houseCodeRequest.ZipCodeType,
				itemConstructorArgs: fin.hcm.houseCodeRequest.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});
		},
		
		initialize: function() {
			var me = this;

			$("#AnchorEdit").hide();
			$("#AnchorSendRequest").hide();
			$("#AnchorCancelRequest").hide();
			$("#AnchorView").hide();
			$("#DivHouseCode").hide();

			$("input[name='CompassPurchaseAnySupplies']").click(function() {
				if (this.id == "CompassPurchaseAnySuppliesYes") {
					$("#ContactInfo").show();
					me.contactName.resizeText();
					me.contactNumber.resizeText();
					me.typesOfSuppliesPurchased.resizeText();
					me.chargeable.resizeText();
					me.markup.resizeText();
				}
				else {
					$("#ContactInfo").hide();
					$("#LabelMarkup").hide();
					$("#Markup").hide();
					me.contactName.setValue("");
					me.contactNumber.setValue("");
					me.typesOfSuppliesPurchased.setValue("");
					me.chargeable.reset();
					me.markup.setValue("");
				}
			});
			
			$("#CustomerNumber").bind("keydown", me, me.customerNumberSearch);
			$("#ServiceLocationNumber").bind("keydown", me, me.serviceLocationNumberSearch);
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
				me.financialCompany.resizeText();
				me.serviceLine.resizeText();
			}
			else if (me.currentWizard == "HierarchyInfo") {
				me.svp.resizeText();
				me.dvp.resizeText();
				me.rvp.resizeText();
				me.srm.resizeText();
				me.rm.resizeText();
				me.am.resizeText();
				me.svpBrief.resizeText();
				me.dvpBrief.resizeText();
				me.rvpBrief.resizeText();
				me.srmBrief.resizeText();
				me.rmBrief.resizeText();
				me.amBrief.resizeText();
				me.houseCode.resizeText();
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
				me.customerStreet1.resizeText();
				me.customerStreet2.resizeText();
				me.customerCity.resizeText();
				me.customerState.resizeText();
				me.customerZipCode.resizeText();
				me.customerCounty.resizeText();
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
				me.serviceLocationStreet1.resizeText();
				me.serviceLocationStreet2.resizeText();
				me.serviceLocationCity.resizeText();
				me.serviceLocationState.resizeText();
				me.serviceLocationZipCode.resizeText();
				me.serviceLocationCounty.resizeText();
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
			me.financialCompany.text.tabIndex = 2;
			me.serviceLine.text.tabIndex = 3;
			me.svp.text.tabIndex = 6;
			me.dvp.text.tabIndex = 7;
			me.rvp.text.tabIndex = 8;
			me.srm.text.tabIndex = 9;
			me.rm.text.tabIndex = 10;
			me.am.text.tabIndex = 11;
			me.houseCode.text.tabIndex = 12;
			me.svpBrief.text.tabIndex = 13;
			me.dvpBrief.text.tabIndex = 14;
			me.rvpBrief.text.tabIndex = 15;
			me.srmBrief.text.tabIndex = 16;
			me.rmBrief.text.tabIndex = 17
			me.amBrief.text.tabIndex = 18;
			me.startDate.text.tabIndex = 21;
			me.siteName.text.tabIndex = 22;
			me.street1.text.tabIndex = 23;
			me.street2.text.tabIndex = 24;
			me.zipCode.text.tabIndex = 25;
			me.city.text.tabIndex = 26;
			me.state.text.tabIndex = 27;
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
			me.customerStreet1.text.tabIndex = 63;
			me.customerStreet2.text.tabIndex = 64;
			me.customerZipCode.text.tabIndex = 65;
			me.customerCity.text.tabIndex = 66;
			me.customerState.text.tabIndex = 67;
			me.customerCounty.text.tabIndex = 68;
			me.customerPhone.text.tabIndex = 69;
			me.customerBiller.text.tabIndex = 70;
			me.billingFrequency.text.tabIndex = 71;
			me.paymentTerms.text.tabIndex = 72;
			me.creditApprovalNumber.text.tabIndex = 73;
			me.regularContractPrice.text.tabIndex = 74;
			me.clientStatus.text.tabIndex = 81;
			me.taxExemptionNumber.text.tabIndex = 82;
			me.certificate.text.tabIndex = 83;
			me.einNumber.text.tabIndex = 84;
			me.companyStatus.text.tabIndex = 85;
			$("#SelfPerformed")[0].tabIndex = 91;
			$("#SubContracted")[0].tabIndex = 92;
			me.contractType.text.tabIndex = 93;
			me.contractLength.text.tabIndex = 94;
			me.expirationDate.text.tabIndex = 95;
			$("#TenetHealthcareAccountYes")[0].tabIndex = 96;
			$("#TenetHealthcareAccountNo")[0].tabIndex = 97;
			me.squareFootage.text.tabIndex = 98;
			me.licensedBeds.text.tabIndex = 99;
			me.gpoMember.text.tabIndex = 100;
			$("#StartDateFirmYes")[0].tabIndex = 101;
			$("#StartDateFirmNo")[0].tabIndex = 102;
			$("#CompassPurchaseAnySuppliesYes")[0].tabIndex = 111;
			$("#CompassPurchaseAnySuppliesNo")[0].tabIndex = 112;
			me.contactName.text.tabIndex = 113;
			me.contactNumber.text.tabIndex = 114;
			me.typesOfSuppliesPurchased.text.tabIndex = 115;
			me.chargeable.text.tabIndex = 116;
			me.markup.text.tabIndex = 117;
			me.serviceLocationNumber.text.tabIndex = 121;
			me.serviceLocationName.text.tabIndex = 122;
			me.serviceLocationStreet1.text.tabIndex = 123;
			me.serviceLocationStreet2.text.tabIndex = 124;
			me.serviceLocationZipCode.text.tabIndex = 125;
			me.serviceLocationCity.text.tabIndex = 126;
			me.serviceLocationState.text.tabIndex = 127;
			me.serviceLocationCounty.text.tabIndex = 128;
			me.miscNumber.text.tabIndex = 129;
			me.exterior.text.tabIndex = 130;
			me.foodCourt.text.tabIndex = 131;
			me.commonArea.text.tabIndex = 132;
			me.otherAreas.text.tabIndex = 133;
		},

		resetControls: function() {
			var me = this;

			me.customers = [];
			me.serviceLocations = [];
			me.validator.reset();
			me.primaryContractType.reset();
			me.primaryContractType.updateStatus();
			me.financialCompany.reset();
			me.financialCompany.updateStatus();
			me.serviceLine.reset();
			me.serviceLine.updateStatus();
			me.svp.reset();
			me.dvp.reset();
			me.rvp.reset();
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.houseCode.setValue("");
			me.svpBrief.setValue("");
			me.dvpBrief.setValue("");
			me.rvpBrief.setValue("");
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");
			me.startDate.setValue("");
			me.siteName.setValue("");
			me.street1.setValue("");
			me.street2.setValue("");
			me.city.reset();
			me.city.updateStatus();
			me.state.reset();
			me.state.updateStatus();
			me.zipCode.setValue("");
			me.county.reset("");
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
			me.customerNumber.reset();
			me.customerNumber.setData([]);
			me.clientName.setValue("");
			me.customerStreet1.setValue("");
			me.customerStreet2.setValue("");
			me.customerCity.reset();
			me.customerState.reset();
			me.customerState.updateStatus();
			me.customerZipCode.setValue("");
			me.customerCounty.reset("");
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
			me.contractType.reset("");
			me.contractLength.setValue("");
			me.expirationDate.setValue("");
			me.squareFootage.setValue("");
			me.licensedBeds.setValue("");
			me.gpoMember.setValue("");
			me.contactName.setValue("");
			me.contactNumber.setValue("");
			me.typesOfSuppliesPurchased.setValue("");
			me.chargeable.reset();
			me.markup.setValue("");
			me.serviceLocationNumber.reset();
			me.serviceLocationNumber.setData([]);
			me.serviceLocationName.setValue("");
			me.serviceLocationStreet1.setValue("");
			me.serviceLocationStreet2.setValue("");
			me.serviceLocationCity.reset();
			me.serviceLocationState.reset();
			me.serviceLocationZipCode.setValue("");
			me.serviceLocationCounty.reset("");
			me.miscNumber.setValue("");
			me.exterior.setValue("");
			me.foodCourt.setValue("");
			me.commonArea.setValue("");
			me.otherAreas.setValue("");
			me.notes.value = "";

			$("#OtherServicesProvided").multiselect("uncheckAll");
			$("#CrothallBenefitsYes")[0].checked = true;
			$("#SelfPerformed")[0].checked = true;
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
		
		findIndexByTitle: function() {
			var args = ii.args(arguments, {
				title: {type: String},	// The title to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});		
			var title = args.title;
			var data = args.data;
			
			for (var index = 0; index < data.length; index++ ) {
				if (data[index].name.toLowerCase() == title.toLowerCase()) {
					return index; 
				}
			}			
			return null;
		},

		personsLoaded: function(me, activeId) {

			me.checkLoadCount();
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.customerState.setData(me.stateTypes);
			me.serviceLocationState.setData(me.stateTypes);
			me.houseCodeRequestStore.fetch("userId:[user],object:HouseCodeRequest,batch:" + me.workflowId +",startPoint:0,maximumRows:0", me.houseCodeRequestsLoaded, me);
		},

		jdeCompanysLoaded: function(me, activeId) {
 
			me.financialCompany.setData(me.jdeCompanys);
		},

		houseCodeRequestsLoaded: function(me, activeId) {

			me.houseCodeRequestGrid.setData(me.houseCodeRequests);
			me.checkLoadCount();
			me.resize();

			if (me.workflowId > 0 && me.houseCodeRequests.length > 0)
				me.houseCodeRequestGrid.body.select(0);
		},

		houseCodeRequestMastersLoaded: function(me, activeId) {

			me.clientStatusTypes = [];
			me.companyStatusTypes = [];
			me.supplyContractTypes = [];

			me.clientStatusTypes.push(new fin.hcm.houseCodeRequest.ClientStatusType(1, "FP", "For Profit"));
			me.clientStatusTypes.push(new fin.hcm.houseCodeRequest.ClientStatusType(1, "NP", "Non Profit"));

			me.companyStatusTypes.push(new fin.hcm.houseCodeRequest.CompanyStatusType(1, "Public"));
			me.companyStatusTypes.push(new fin.hcm.houseCodeRequest.CompanyStatusType(1, "Private"));

			me.supplyContractTypes.push(new fin.hcm.houseCodeRequest.SupplyContractType(1, "Chargeable"));
			me.supplyContractTypes.push(new fin.hcm.houseCodeRequest.SupplyContractType(1, "Included"));

			for (var index = me.serviceLines.length - 1; index >= 0; index--) {
				if (me.serviceLines[index].financialEntity)
					me.serviceLines.splice(index, 1);
			}

			me.primaryContractType.setData(me.contractTypes);
			me.serviceLine.setData(me.serviceLines);
			me.primaryServiceProvided.setData(me.serviceTypes);
			me.unionAccount.setData(me.houseCodeTypes);
			me.billingFrequency.setData(me.billingCycleFrequencys);
			me.hourlyCompany.setData(me.payPayrollCompanys);
			me.salaryCompany.setData(me.payPayrollCompanys);
			me.contractType.setData(me.termsOfContractTypes);
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
			var index = 0;
			var hidePopup = true;

			for (index = 0; index < me.hirNodes.length; index++) {
				if (me.hirNodes[index].hirLevelTitle == "Enterprise")
					divisions.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Senior Vice President")
					svps.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Divisonal Vice President")
					dvps.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Regional Vice President")
					rvps.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Senior Regional Manager")
					srms.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Regional Manager")
					rms.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle == "Area Manager")
					ams.push(new fin.hcm.houseCodeRequest.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
			}

			if (me.level == "") {
				me.svp.setData(svps);
			}
			else if (me.level == "Divisonal Vice President") {
				me.dvp.setData(dvps);
				if (me.status == "Edit") {
					index = me.findIndexByTitle(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column19, me.dvp.data);
					if (index != undefined && index >= 0) {
						me.dvp.select(index, me.dvp.focused);
						me.dvpBrief.setValue(me.dvp.data[index].brief);
						me.dvpChanged();
						hidePopup = false;
					}
					else {
						me.dvp.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column19);
						me.rvp.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column20);
						me.srm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column21);
						me.rm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column22);
						me.am.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23);
						me.dvpBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column96);
						me.rvpBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column97);
						me.srmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column98);
						me.rmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column99);
						me.amBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column100);
					}
				}
			}
			else if (me.level == "Regional Vice President") {
				me.rvp.setData(rvps);
				if (me.status == "Edit") {
					index = me.findIndexByTitle(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column20, me.rvp.data);
					if (index != undefined && index >= 0) {
						me.rvp.select(index, me.rvp.focused);
						me.rvpBrief.setValue(me.rvp.data[index].brief);
						me.rvpChanged();
						hidePopup = false;
					}
					else {
						me.rvp.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column20);
						me.srm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column21);
						me.rm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column22);
						me.am.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23);
						me.rvpBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column97);
						me.srmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column98);
						me.rmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column99);
						me.amBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column100);
					}
				}
			}
			else if (me.level == "Senior Regional Manager") {
				me.srm.setData(srms);
				if (me.status == "Edit") {
					index = me.findIndexByTitle(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column21, me.srm.data);
					if (index != undefined && index >= 0) {
						me.srm.select(index, me.srm.focused);
						me.srmBrief.setValue(me.srm.data[index].brief);
						me.srmChanged();
						hidePopup = false;
					}
					else {
						me.srm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column21);
						me.rm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column22);
						me.am.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23);
						me.srmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column98);
						me.rmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column99);
						me.amBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column100);
					}
				}
			}
			else if (me.level == "Regional Manager") {
				me.rm.setData(rms);
				if (me.status == "Edit") {
					index = me.findIndexByTitle(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column22, me.rm.data);
					if (index != undefined && index >= 0) {
						me.rm.select(index, me.rm.focused);
						me.rmBrief.setValue(me.rm.data[index].brief);
						me.rmChanged();
						hidePopup = false;
					}
					else {
						me.rm.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column22);
						me.am.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23);
						me.rmBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column99);
						me.amBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column100);
					}
				}
			}
			else if (me.level == "Area Manager") {
				me.am.setData(ams);
				if (me.status == "Edit") {
					index = me.findIndexByTitle(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23, me.am.data);
					if (index != undefined && index >= 0) {
						me.am.select(index, me.am.focused);
						me.amBrief.setValue(me.am.data[index].brief);
					}
					else {
						me.am.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column23);
						me.amBrief.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column100);
					}
				}
			}

			if (hidePopup)
				$("#popupLoading").fadeOut("slow");
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
			me.svpBrief.setValue("");
			me.dvpBrief.setValue("");
			me.rvpBrief.setValue("");
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");

			if (me.svp.indexSelected >= 0) {
				me.svpBrief.setValue(me.svp.data[me.svp.indexSelected].brief);
				me.dvp.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.svp.data[me.svp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
			else {
				me.svpBrief.setValue(me.svp.lastBlurValue.substring(0, 3).toUpperCase());
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
			me.dvpBrief.setValue("");
			me.rvpBrief.setValue("");
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");

			if (me.dvp.indexSelected >= 0) {
				me.dvpBrief.setValue(me.dvp.data[me.dvp.indexSelected].brief);
				me.rvp.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.dvp.data[me.dvp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
			else {
				me.dvpBrief.setValue(me.dvp.lastBlurValue.substring(0, 3).toUpperCase());
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
			me.rvpBrief.setValue("");
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");

			if (me.rvp.indexSelected >= 0) {
				me.rvpBrief.setValue(me.rvp.data[me.rvp.indexSelected].brief);
				me.srm.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.rvp.data[me.rvp.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
			else {
				me.rvpBrief.setValue(me.rvp.lastBlurValue.substring(0, 3).toUpperCase());
			}
		},

		srmChanged: function() {
			var me = this;

			me.level = "Regional Manager";
			me.rm.reset();
			me.am.reset();
			me.rm.setData([]);
			me.am.setData([]);
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");

			if (me.srm.indexSelected >= 0) {
				me.srmBrief.setValue(me.srm.data[me.srm.indexSelected].brief);
				me.rm.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.srm.data[me.srm.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
			else {
				me.srmBrief.setValue(me.srm.lastBlurValue.substring(0, 3).toUpperCase());
			}
		},

		rmChanged: function() {
			var me = this;

			me.level = "Area Manager";
			me.am.reset();
			me.am.setData([]);
			me.rmBrief.setValue("");
			me.amBrief.setValue("");

			if (me.rm.indexSelected >= 0) {
				me.rmBrief.setValue(me.rm.data[me.rm.indexSelected].brief);
				me.am.fetchingData();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + me.rm.data[me.rm.indexSelected].id + ",", me.hirNodesLoaded, me);
			}
			else {
				me.rmBrief.setValue(me.rm.lastBlurValue.substring(0, 3).toUpperCase());
			}
		},
		
		amChanged: function() {
			var me = this;

			if (me.am.indexSelected >= 0)
				me.amBrief.setValue(me.am.data[me.am.indexSelected].brief);
			else
				me.amBrief.setValue(me.am.lastBlurValue.substring(0, 3).toUpperCase());
		},
		
		loadZipCodeTypes: function(type) {
			var me = this;
			var zipCode = "";
			
			me.searchZipCodeType = type;
			
			if (type == "Site") {
				// remove any unwanted characters
		    	zipCode = me.zipCode.getValue().replace(/[^0-9]/g, "");
				zipCode = zipCode.substring(0, 5);
				me.city.fetchingData();
			}
			else if (type == "Customer") {
				// remove any unwanted characters
		    	zipCode = me.customerZipCode.getValue().replace(/[^0-9]/g, "");
				zipCode = zipCode.substring(0, 5);
				me.customerCity.fetchingData();
			}
			else if (type == "ServiceLocation") {
				// remove any unwanted characters
		    	zipCode = me.serviceLocationZipCode.getValue().replace(/[^0-9]/g, "");
				zipCode = zipCode.substring(0, 5);
				me.serviceLocationCity.fetchingData();
			}

			me.zipCodeTypeStore.fetch("userId:[user],zipCode:" + zipCode, me.zipCodeTypesLoaded, me);
		},

		zipCodeTypesLoaded: function(me, activeId) {
			var cityNamesTemp = [];
			var countyNamesTemp = [];
			var index = 0;

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if ($.inArray(me.zipCodeTypes[index].city, cityNamesTemp) == -1)
					cityNamesTemp.push(me.zipCodeTypes[index].city);
				//if (me.searchZipCodeType == "Site") {
				if ($.inArray(me.zipCodeTypes[index].county, countyNamesTemp) == -1)
					countyNamesTemp.push(me.zipCodeTypes[index].county);
				//}
			}

			cityNamesTemp.sort();
			countyNamesTemp.sort();
			me.cityNames = [];
			me.countyNames = [];

			for (index = 0; index < cityNamesTemp.length; index++) {
				me.cityNames.push(new fin.hcm.houseCodeRequest.CityName({ id: index + 1, city: cityNamesTemp[index] }));
			}
			
			for (index = 0; index < countyNamesTemp.length; index++) {
				me.countyNames.push(new fin.hcm.houseCodeRequest.CountyName({ id: index + 1, name: countyNamesTemp[index] }));
			}
				
			if (me.searchZipCodeType == "Site") {
//				for (index = 0; index < countyNamesTemp.length; index++) {
//					me.countyNames.push(new fin.hcm.houseCodeRequest.CountyName({ id: index + 1, name: countyNamesTemp[index] }));
//				}
				me.city.reset();
				me.county.reset();
				me.city.setData(me.cityNames);
				me.county.setData(me.countyNames);
			}
			else if (me.searchZipCodeType == "Customer") {
				me.customerCity.reset();
				me.customerCounty.reset();
				me.customerCity.setData(me.cityNames);
				me.customerCounty.setData(me.countyNames);
			}
			else if (me.searchZipCodeType == "ServiceLocation") {
				me.serviceLocationCity.reset();
				me.serviceLocationCounty.reset();
				me.serviceLocationCity.setData(me.cityNames);
				me.serviceLocationCounty.setData(me.countyNames);
			}

			if (!me.searchZipCode) {
				if (me.zipCodeTypes.length == 0) {
					if (me.searchZipCodeType == "Site") {
						me.city.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column28);
						me.county.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column31);
					}
					else if (me.searchZipCodeType == "Customer") {
						me.customerCity.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column49);
						me.customerCounty.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column92);
					}
					else if (me.searchZipCodeType == "ServiceLocation") {
						me.serviceLocationCity.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column81);
						me.serviceLocationCounty.setValue(me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column94);
					}
				}
				else {
					for (index = 0; index < me.cityNames.length; index++) {
						if (me.searchZipCodeType == "Site") {
							if (me.cityNames[index].city.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column28.toUpperCase()) {
								me.city.select(index, me.city.focused);
								break;
							}
						}
						else if (me.searchZipCodeType == "Customer") {
							if (me.cityNames[index].city.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column49.toUpperCase()) {
								me.customerCity.select(index, me.customerCity.focused);
								break;
							}
						}
						else if (me.searchZipCodeType == "ServiceLocation") {
							if (me.cityNames[index].city.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column81.toUpperCase()) {
								me.serviceLocationCity.select(index, me.serviceLocationCity.focused);
								break;
							}
						}
					}
					
					for (index = 0; index < me.countyNames.length; index++) {
						if (me.searchZipCodeType == "Site") {
							if (me.countyNames[index].name.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column31.toUpperCase()) {
								me.county.select(index, me.county.focused);
								break;
							}
						}
						else if (me.searchZipCodeType == "Customer") {
							if (me.countyNames[index].name.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column92.toUpperCase()) {
								me.customerCounty.select(index, me.customerCounty.focused);
								break;
							}
						}
						else if (me.searchZipCodeType == "ServiceLocation") {
							if (me.countyNames[index].name.toUpperCase() == me.houseCodeRequestGrid.data[me.lastSelectedRowIndex].column94.toUpperCase()) {
								me.serviceLocationCounty.select(index, me.serviceLocationCounty.focused);
								break;
							}
						}
					}
				}
			}
			else {
				if (me.searchZipCodeType == "Site")
					me.state.reset();
				else if (me.searchZipCodeType == "Customer")
					me.customerState.reset();
				else if (me.searchZipCodeType == "ServiceLocation")
					me.serviceLocationState.reset();

				if (me.zipCodeTypes.length > 0) {
					index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

					if (index != undefined) {
						if (me.searchZipCodeType == "Site")
							me.state.select(index, me.state.focused);
						else if (me.searchZipCodeType == "Customer")
							me.customerState.select(index, me.customerState.focused);
						else if (me.searchZipCodeType == "ServiceLocation")
							me.serviceLocationState.select(index, me.serviceLocationState.focused);
					}
				}

				if (me.searchZipCodeType == "Customer") {
					for (index = 0; index < me.cityNames.length; index++) {
						if (me.cityNames[index].city.toUpperCase() == me.customers[me.customerNumber.indexSelected].city.toUpperCase()) {
							me.customerCity.select(index, me.customerCity.focused);
							break;
						}
					}
				}
				else if (me.searchZipCodeType == "ServiceLocation") {
					for (index = 0; index < me.cityNames.length; index++) {
						if (me.cityNames[index].city.toUpperCase() == me.serviceLocations[me.serviceLocationNumber.indexSelected].city.toUpperCase()) {
							me.serviceLocationCity.select(index, me.serviceLocationCity.focused);
							break;
						}
					}
				}
			}
			
			if (me.searchCustomerZipCode) {
				me.searchCustomerZipCode = false;
				me.loadZipCodeTypes("Customer");
			}
			else if (me.searchServiceLocationZipCode) {
				me.searchServiceLocationZipCode = false;
				me.loadZipCodeTypes("ServiceLocation");
			}
		},
		
		customerNumberSearch: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (event.keyCode == 13 && me.customerNumber.validate(true)) {
				me.customerNumber.fetchingData();
				me.jobStore.reset();
				me.jobStore.fetch("userId:[user],jobSearch:1,jobType:3,jobNumber:" + me.customerNumber.text.value + ",", me.customersLoaded, me);
			}
		},	
		
		customersLoaded: function(me, activeId) {

			me.customers = me.jobs.slice();
			me.customerNumber.setData(me.customers);
			me.clientName.setValue("");
			me.customerStreet1.setValue("");
			me.customerStreet2.setValue("");
			me.customerCity.reset();
			me.customerCity.setData([]);
			me.customerState.reset();
			me.customerZipCode.setValue("");
			me.customerCounty.reset("");
			
			if (me.customers.length > 0) {
				me.customerNumber.reset();
				me.customerNumber.select(0, me.customerNumber.focused);
				me.customerNumberChanged();
			}
		},

		customerNumberChanged: function() {
			var me = this;
			var index = me.customerNumber.indexSelected;

			if (index != -1) {
				me.clientName.setValue(me.customers[index].title);
				me.customerStreet1.setValue(me.customers[index].address1);
				me.customerStreet2.setValue(me.customers[index].address2);
				var itemIndex = ii.ajax.util.findIndexById(me.customers[index].appStateTypeId.toString(), me.stateTypes);
				if (itemIndex != undefined)
					me.customerState.select(itemIndex, me.customerState.focused);
				else
					me.customerState.reset();
				me.customerZipCode.setValue(me.customers[index].postalCode);
				if (me.customers[index].postalCode != "") {
					me.searchZipCode = true;
					me.loadZipCodeTypes("Customer");
				}
			}
		},

		serviceLocationNumberSearch: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (event.keyCode == 13 && me.serviceLocationNumber.validate(true)) {
				me.serviceLocationNumber.fetchingData();
				me.jobStore.reset();
				me.jobStore.fetch("userId:[user],jobSearch:1,jobType:2,jobNumber:" + me.serviceLocationNumber.text.value, me.serviceLocationsLoaded, me);
			}
		},	

		serviceLocationsLoaded: function(me, activeId) {

			me.serviceLocations = me.jobs.slice();
			me.serviceLocationNumber.setData(me.serviceLocations);
			me.serviceLocationName.setValue("");
			me.serviceLocationStreet1.setValue("");
			me.serviceLocationStreet2.setValue("");
			me.serviceLocationCity.reset();
			me.serviceLocationCity.setData([]);
			me.serviceLocationState.reset();
			me.serviceLocationZipCode.setValue("");
			me.serviceLocationCounty.reset("");

			if (me.serviceLocations.length > 0) {
				me.serviceLocationNumber.reset();
				me.serviceLocationNumber.select(0, me.serviceLocationNumber.focused);
				me.serviceLocationNumberChanged();
			}
		},
		
		serviceLocationNumberChanged: function() {
			var me = this;
			var index = me.serviceLocationNumber.indexSelected;

			if (index != -1) {
				me.serviceLocationName.setValue(me.serviceLocations[index].title);
				me.serviceLocationStreet1.setValue(me.serviceLocations[index].address1);
				me.serviceLocationStreet2.setValue(me.serviceLocations[index].address2);
				var itemIndex = ii.ajax.util.findIndexById(me.serviceLocations[index].appStateTypeId.toString(), me.stateTypes);
				if (itemIndex != undefined)
					me.serviceLocationState.select(itemIndex, me.serviceLocationState.focused);
				else
					me.serviceLocationState.reset();
				me.serviceLocationZipCode.setValue(me.serviceLocations[index].postalCode);
				if (me.serviceLocations[index].postalCode != "") {
					me.searchZipCode = true;
					me.loadZipCodeTypes("ServiceLocation");
				}
			}
		},
		
		validateHouseCode: function() {
			var me = this;

			if (me.houseCode.getValue() == "")
				return;
			$("#HouseCodeText").addClass("Loading");
			me.validHouseCode = true;
			me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + me.houseCode.getValue(), me.houseCodeLoaded, me);
		},
		
		houseCodeLoaded: function(me, activeId){

			if (me.houseCodes.length > 0) {
				me.validHouseCode = false;
				me.houseCode.setInvalid("House Code [" + me.houseCode.getValue() + "] is already exists. Please enter different House Code.");
			}
			$("#HouseCodeText").removeClass("Loading");
		},

		validateSite: function() {
			var me = this;

			if (me.siteName.getValue() == "")
				return;
			$("#SiteNameText").addClass("Loading");
			me.validSite = true;
			me.siteStore.fetch("userId:[user],validate:1,title:" + me.siteName.getValue(), me.sitesLoaded, me);
		},
		
		sitesLoaded: function(me, activeId){

			if (me.sites.length > 0) {
				me.validSite = false;
				me.siteName.setInvalid("Site Name [" + me.siteName.getValue() + "] is already exists. Please enter different Site Name.");
			}
			$("#SiteNameText").removeClass("Loading");
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
				$("#AnchorView").show();
				//$("#AnchorSendRequest").show();
				if (me.workflowId > 0) {
					if (item.column7 == "House Code Created")
						$("#AnchorEdit").hide();
					else
						$("#AnchorEdit").show();
					$("#AnchorNew").hide();
					$("#AnchorSendRequest").hide();
					$("#AnchorCancelRequest").hide();
				}
				else if (item.column7 == "Open" || item.column7 == "Unapproved") {
					$("#AnchorEdit").show();
					$("#AnchorSendRequest").show();
					$("#AnchorCancelRequest").show();
				}
				else {
					$("#AnchorEdit").hide();
					$("#AnchorSendRequest").hide();
					$("#AnchorCancelRequest").hide();
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

			$("#AnchorClose").show();
			$("#AnchorSave").show();
			$("#AnchorApprove").hide();
			$("#AnchorSaveAndApprove").hide();
			$("#AnchorGenerateHouseCode").hide();
			$("#AnchorCancel").hide();
			$("#AnchorExit").hide();
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
				if (!me.primaryContractType.validate(true) || !me.financialCompany.validate(true) || !me.serviceLine.validate(true))
					return false;
			}
			else if (me.currentWizard == "HierarchyInfo") {
				
				if (!me.svp.validate(true) || !me.dvp.validate(true) || !me.rvp.validate(true)
					|| !me.srm.validate(true) || !me.rm.validate(true) || !me.am.validate(true))
					return false;
				else if (me.lastSelectedRowIndex >= 0) {
					var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];
					if (item.column7 == "Step 2 Approved" && me.workflowId > 0 && me.workflowStep == 3 && !me.houseCode.validate(true))
						return false;
				}
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
				else if (me.hourlyCompany.lastBlurValue != "" && (me.hourlyCompany.indexSelected == me.salaryCompany.indexSelected)) {
					alert("[Hourly Company] & [Salary Company] cannot be same.");
					return false;
				}
			}
			else if (me.currentWizard == "BenefitsInfo") {
				if (!me.unionAccount.validate(true))
					return false;
			}
			else if (me.currentWizard == "CustomerInfo") {
				if (!me.customerNumber.validate(true) || !me.clientName.validate(true) || !me.customerStreet1.validate(true) || !me.customerCity.validate(true) 
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
			
			if (me.nextWizard == "" || (me.nextWizard == "ServicesProvided" && me.workflowId > 0 && me.workflowStep == 3))
				me.anchorNext.display(ui.cmn.behaviorStates.disabled);
			else
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);

			if (me.prevWizard == "")
				me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
			else
				me.anchorPrev.display(ui.cmn.behaviorStates.enabled);
		},

		actionCloseItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup();
			me.status = "";
			me.nextCount = 0;
			me.setStatus("Normal");
		},

		actionEditItem: function() {
			var me = this;
			var hidePopup = false;

			if (me.lastSelectedRowIndex >= 0) {
				var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];
				if (item.column7 == "Open" && me.workflowId == 0) {
					$("#AnchorClose").show();
					$("#AnchorSave").show();
					$("#AnchorApprove").hide();
					$("#AnchorSaveAndApprove").hide();
					$("#AnchorGenerateHouseCode").hide();
					$("#AnchorCancel").hide();
					$("#AnchorExit").hide();
				}
				else if (me.workflowId > 0 && (item.column7 == "In Process" && me.workflowStep == 1) 
					|| (item.column7 == "Step 1 Approved" && me.workflowStep == 2) || (item.column7 == "Step 2 Approved" && me.workflowStep == 3)) {
					$("#AnchorClose").hide();
					$("#AnchorSave").hide();
					$("#AnchorApprove").show();
					$("#AnchorSaveAndApprove").show();
					$("#AnchorGenerateHouseCode").hide();
					$("#AnchorCancel").show();
					$("#AnchorExit").show();
					if (item.column7 == "Step 2 Approved") {
						$("#AnchorApprove").hide();
						$("#AnchorSaveAndApprove").hide();
						$("#AnchorGenerateHouseCode").show();
						$("#DivHouseCode").show();
						me.houseCode.setValue("");
					}
				}
				else {
					$("#AnchorClose").show();
					$("#AnchorSave").hide();
					$("#AnchorApprove").hide();
					$("#AnchorSaveAndApprove").hide();
					$("#AnchorGenerateHouseCode").hide();
					$("#AnchorCancel").hide();
					$("#AnchorExit").hide();
				}

				$("#popupHeader").text("House Code Request - Edit");
				$("#popupLoading").fadeIn("slow");
				me.status = "Edit";
				me.initializeWizard();
				
				var index = ii.ajax.util.findIndexById(item.column16, me.contractTypes);
				if (index != undefined && index >= 0) 
					me.primaryContractType.select(index, me.primaryContractType.focused);

				index = ii.ajax.util.findIndexById(item.column89, me.jdeCompanys);
				if (index != undefined && index >= 0) 
					me.financialCompany.select(index, me.financialCompany.focused);

				index = ii.ajax.util.findIndexById(item.column90, me.serviceLines);
				if (index != undefined && index >= 0) 
					me.serviceLine.select(index, me.serviceLine.focused);

				index = me.findIndexByTitle(item.column18, me.svp.data);
				if (index != undefined && index >= 0) {
					me.svp.select(index, me.svp.focused);
					me.svpBrief.setValue(me.svp.data[index].brief);
					me.svpChanged();
				}
				else {
					me.dvp.setData([]);
					me.rvp.setData([]);
					me.srm.setData([]);
					me.rm.setData([]);
					me.am.setData([]);
					me.svp.setValue(item.column18);
					me.dvp.setValue(item.column19);
					me.rvp.setValue(item.column20);
					me.srm.setValue(item.column21);
					me.rm.setValue(item.column22);
					me.am.setValue(item.column23);
					me.svpBrief.setValue(item.column95);
					me.dvpBrief.setValue(item.column96);
					me.rvpBrief.setValue(item.column97);
					me.srmBrief.setValue(item.column98);
					me.rmBrief.setValue(item.column99);
					me.amBrief.setValue(item.column100);
					hidePopup = true;
				}
				
				me.houseCode.setValue(item.column13)
				me.startDate.setValue(item.column24);
				me.siteName.setValue(item.column25);
				me.street1.setValue(item.column26);
				me.street2.setValue(item.column27);
				me.state.reset();
				index = ii.ajax.util.findIndexById(item.column29, me.stateTypes);
				if (index != undefined && index >= 0) 
					me.state.select(index, me.state.focused);
				me.zipCode.setValue(item.column30);
				me.phone.setValue(item.column32);
				
				me.primaryServiceProvided.reset();
				index = ii.ajax.util.findIndexById(item.column33, me.serviceTypes);
				if (index != undefined && index >= 0) 
					me.primaryServiceProvided.select(index, me.primaryServiceProvided.focused);
				var otherServicesProvidedTemp = item.column34.split(",");
				$("#OtherServicesProvided").multiselect("widget").find(":checkbox").each(function(){
					if ($.inArray(this.value, otherServicesProvidedTemp) >= 0) {
						this.click();
					}
				});
				me.priorServiceProvider.setValue(item.column35);
				
				me.hourlyCompany.reset();
				index = ii.ajax.util.findIndexById(item.column36, me.payPayrollCompanys);
				if (index != undefined && index >= 0) 
					me.hourlyCompany.select(index, me.hourlyCompany.focused);
				me.hourlyEmployees.setValue(item.column37);
				me.salaryCompany.reset();
				index = ii.ajax.util.findIndexById(item.column38, me.payPayrollCompanys);
				if (index != undefined && index >= 0) 
					me.salaryCompany.select(index, me.salaryCompany.focused);
				me.salaryEmployees.setValue(item.column39);
				me.ePay.setValue(item.column40);
				me.ePayOptions.setValue(item.column41);
				
				$("input[name='CrothallBenefits'][value='" + item.column42 + "']").attr("checked", "checked");
				me.unionAccount.reset();
				index = ii.ajax.util.findIndexById(item.column43, me.houseCodeTypes);
				if (index != undefined && index >= 0) 
					me.unionAccount.select(index, me.unionAccount.focused);
				me.unionName.setValue(item.column44);
				me.localNumber.setValue(item.column45);
				
				me.customers.push(new fin.hcm.houseCodeRequest.Job(0, item.column46, item.column47, item.column48, "", item.column49, item.column50, item.column51));
				me.customerNumber.setData(me.customers);
				me.customerNumber.select(0, me.customerNumber.focused);
				me.clientName.setValue(item.column47);
				me.customerStreet1.setValue(item.column48);
				me.customerStreet2.setValue(item.column91);
				me.customerState.reset();
				index = ii.ajax.util.findIndexById(item.column50, me.stateTypes);
				if (index != undefined && index >= 0) 
					me.customerState.select(index, me.customerState.focused);
				me.customerState.updateStatus();
				me.customerZipCode.setValue(item.column51);
				me.customerPhone.setValue(item.column52);
				me.customerBiller.setValue(item.column53);
				me.billingFrequency.reset();
				index = ii.ajax.util.findIndexById(item.column54, me.billingCycleFrequencys);
				if (index != undefined && index >= 0) 
					me.billingFrequency.select(index, me.billingFrequency.focused);
				me.paymentTerms.setValue(item.column55);
				me.creditApprovalNumber.setValue(item.column56);
				me.regularContractPrice.setValue(item.column57);
				
				me.clientStatus.reset();
				index = me.findIndexByTitle(item.column58, me.clientStatusTypes);
				if (index != undefined && index >= 0) 
					me.clientStatus.select(index, me.clientStatus.focused);
				me.taxExemptionNumber.setValue(item.column59);
				me.certificate.setValue(item.column60);
				me.einNumber.setValue(item.column61);
				me.companyStatus.reset();
				index = me.findIndexByTitle(item.column62, me.companyStatusTypes);
				if (index != undefined && index >= 0) 
					me.companyStatus.select(index, me.companyStatus.focused);
				
				$("input[name='Contract'][value='" + item.column63 + "']").attr("checked", "checked");
				index = ii.ajax.util.findIndexById(item.column64, me.termsOfContractTypes);
				if (index != undefined && index >= 0) 
					me.contractType.select(index, me.contractType.focused);
				me.contractLength.setValue(item.column65);
				me.expirationDate.setValue(item.column66);
				$("input[name='TenetHealthcareAccount'][value='" + item.column67 + "']").attr("checked", "checked");
				me.squareFootage.setValue(item.column68);
				me.licensedBeds.setValue(item.column69);
				me.gpoMember.setValue(item.column70);
				$("input[name='StartDateFirm'][value='" + item.column71 + "']").attr("checked", "checked");
				
				$("input[name='CompassPurchaseAnySupplies'][value='" + item.column72 + "']").attr("checked", "checked");
				if (item.column72 == "No") 
					$("#ContactInfo").hide();
				me.contactName.setValue(item.column73);
				me.contactNumber.setValue(item.column74);
				me.typesOfSuppliesPurchased.setValue(item.column75);
				me.chargeable.reset();
				index = me.findIndexByTitle(item.column76, me.supplyContractTypes);
				if (index != undefined && index >= 0) 
					me.chargeable.select(index, me.chargeable.focused);
				me.markup.setValue(item.column77);
				
				me.serviceLocations.push(new fin.hcm.houseCodeRequest.Job(0, item.column78, item.column79, item.column80, "", item.column81, item.column82, item.column83));
				me.serviceLocationNumber.setData(me.serviceLocations);
				me.serviceLocationNumber.select(0, me.serviceLocationNumber.focused);
				me.serviceLocationName.setValue(item.column79);
				me.serviceLocationStreet1.setValue(item.column80);
				me.serviceLocationStreet2.setValue(item.column93);
				me.serviceLocationState.reset();
				index = ii.ajax.util.findIndexById(item.column82, me.stateTypes);
				if (index != undefined && index >= 0) 
					me.serviceLocationState.select(index, me.serviceLocationState.focused);
				me.serviceLocationState.updateStatus();
				me.serviceLocationZipCode.setValue(item.column83);
				me.miscNumber.setValue(item.column84);
				me.exterior.setValue(item.column85);
				me.foodCourt.setValue(item.column86);
				me.commonArea.setValue(item.column87);
				me.otherAreas.setValue(item.column88);
				
				me.searchZipCode = false;
				me.searchCustomerZipCode = true;
				me.searchServiceLocationZipCode = true;
				me.loadZipCodeTypes("Site");
	
				if (hidePopup)
					$("#popupLoading").fadeOut("slow");
			}
		},

		actionSendRequestItem: function() {
			var me = this;

			if (me.houseCodeRequestGrid.activeRowIndex == -1)
                return true;

			var item = me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex];

			if (parseInt(item.column16, 10) <= 0
				|| item.column18 == "" || item.column19 == "" || item.column20 == "" || item.column21 == "" || item.column22 == "" || item.column23 == ""
				|| !(ui.cmn.text.validate.generic(item.column24, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$"))
				|| item.column25 == "" || item.column26 == "" || item.column28 == "" || parseInt(item.column29, 10) <= 0
				|| !(ui.cmn.text.validate.postalCode(item.column30)) || parseInt(item.column33, 10) <= 0
				|| (parseInt(item.column36, 10) > 0 && (parseInt(item.column36, 10) == parseInt(item.column38, 10)))
				|| !(/^\d+$/.test(item.column46))
				|| item.column47 == "" || item.column48 == "" || item.column49 == "" || parseInt(item.column50, 10) <= 0
				|| !(ui.cmn.text.validate.postalCode(item.column51)) || !(/^\d{10}$/.test(item.column52)) || parseInt(item.column54, 10) <= 0
				|| !(/^\d+$/.test(item.column78))
				|| item.column79 == "" || item.column80 == "" || item.column81 == "" || parseInt(item.column82, 10) <= 0
				|| !(ui.cmn.text.validate.postalCode(item.column83))
			    ) {
				alert("There are few mandatory fields which are not entered. Please enter values for all mandatory fields and try again.");
				return false;
			}
			else {
				$("#messageToUser").text("Sending Request");
				me.status = "SendRequest";
            	me.actionSaveItem();
			}
		},

		actionCancelRequestItem: function() {
			var me = this;

			if (me.houseCodeRequestGrid.activeRowIndex == -1)
                return true;
 
            $("#messageToUser").text("Cancelling Request");
            me.status = "CancelRequest";
            me.actionSaveItem();
		},
		
		actionViewItem: function() {
			var me = this;

			if (me.houseCodeRequestGrid.activeRowIndex == -1)
                return true;
 
            $("#messageToUser").text("Downloading");
            me.status = "ViewRequest";
            me.actionSaveItem();
		},
		
		actionApproveItem: function() {
			var me = this;
			var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];

			$("#messageToUser").text("Approving Request");

			if (item.column7 == "In Process" && me.workflowId > 0 && me.workflowStep == 1) {
				me.status = "ApproveRequestStep1";
			}
			else if (item.column7 == "Step 1 Approved" && me.workflowId > 0 && me.workflowStep == 2) {
				me.status = "ApproveRequestStep2";
			}
			else if (item.column7 == "Step 2 Approved" && me.workflowId > 0 && me.workflowStep == 3) {
				if (!me.houseCode.validate(true)) {
					return;
				}
				me.status = "ApproveRequestStep3";
			}

            me.actionSaveItem();
		},
		
		actionSaveAndApproveItem: function() {
			var me = this;
			var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];

			if (me.workflowId > 0 && ((item.column7 == "In Process" && me.workflowStep == 1) || (item.column7 == "Step 1 Approved" && me.workflowStep == 2))) {
				if (!me.primaryContractType.validate(true) || !me.financialCompany.validate(true) || !me.serviceLine.validate(true)
					|| !me.svp.validate(true) || !me.dvp.validate(true) || !me.rvp.validate(true)
					|| !me.srm.validate(true) || !me.rm.validate(true) || !me.am.validate(true)
					|| !me.startDate.validate(true) || !me.siteName.validate(true) || !me.street1.validate(true)
					|| !me.city.validate(true) || !me.state.validate(true) || !me.zipCode.validate(true) || !me.county.validate(true)
					|| !me.primaryServiceProvided.validate(true)
					|| !me.hourlyCompany.validate(true) || !me.salaryCompany.validate(true)
					|| (me.hourlyCompany.lastBlurValue != "" && (me.hourlyCompany.indexSelected == me.salaryCompany.indexSelected))
					|| !me.unionAccount.validate(true)
					|| !me.customerNumber.validate(true) || !me.clientName.validate(true) || !me.customerStreet1.validate(true) || !me.customerCity.validate(true) 
					|| !me.customerState.validate(true) || !me.customerZipCode.validate(true) || !me.customerPhone.validate(true)
					|| !me.billingFrequency.validate(true)
					|| !me.clientStatus.validate(true) || !me.companyStatus.validate(true)
					|| !me.chargeable.validate(true)
					|| !me.serviceLocationNumber.validate(true) || !me.serviceLocationName.validate(true) || !me.serviceLocationStreet1.validate(true)
					|| !me.serviceLocationCity.validate(true) || !me.serviceLocationState.validate(true) || !me.serviceLocationZipCode.validate(true)
					) {
					alert("There are few mandatory fields which are not entered. Please enter values for all mandatory fields and try again.");
					return false;
				}
				if (item.column7 == "In Process" && me.workflowStep == 1)
					me.status = "SaveAndApproveRequestStep1";
				else if (item.column7 == "Step 1 Approved" && me.workflowStep == 2)
					me.status = "SaveAndApproveRequestStep2";
			}
			else if (item.column7 == "Step 2 Approved" && me.workflowId > 0 && me.workflowStep == 3) {
				if (!me.primaryContractType.validate(true) || !me.financialCompany.validate(true) || !me.serviceLine.validate(true)
					|| !me.svp.validate(true) || !me.dvp.validate(true) || !me.rvp.validate(true)
					|| !me.srm.validate(true) || !me.rm.validate(true) || !me.am.validate(true) || !me.houseCode.validate(true)
					|| !me.startDate.validate(true) || !me.siteName.validate(true) || !me.street1.validate(true)
					|| !me.city.validate(true) || !me.state.validate(true) || !me.zipCode.validate(true) || !me.county.validate(true)
					) {
					alert("There are few mandatory fields which are not entered. Please enter values for all mandatory fields and try again.");
					return false;
				}
				me.status = "SaveAndApproveRequestStep3";
			}

			$("#messageToUser").text("Approving Request");
            me.actionSaveItem();
		},

		actionCancelItem: function() {
			var me = this;	
			var windowWidth = $("#popupRequest").width();
			var windowHeight = $("#popupRequest").height();
			var popupWidth = $("#popupNotes").width();
			var popupHeight = $("#popupNotes").height();

			$("#popupNotes").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});

			$("#popupNotes").fadeIn("slow");
		},

		actionClosePopupItem: function() {

			$("#popupNotes").fadeOut("slow");
		},

		actionExitItem: function() {
			var me = this;

			parent.fin.appUI.modified = false;
			top.window.close();
		},

		actionOkItem: function() {
			var me = this;
			var item = me.houseCodeRequestGrid.data[me.lastSelectedRowIndex];

			if (me.notes.value == "") {
				alert("Please enter the notes");
				return false;
			}
			$("#messageToUser").text("Cancelling Request");
			$("#popupNotes").fadeOut("slow");

			if (item.column7 == "In Process" && me.workflowId > 0 && me.workflowStep == 1)
				me.status = "UnApproveRequestStep1";
			else if (item.column7 == "Step 1 Approved" && me.workflowId > 0 && me.workflowStep == 2)
				me.status = "UnApproveRequestStep2";
			else if (item.column7 == "Step 2 Approved" && me.workflowId > 0 && me.workflowStep == 3)
				me.status = "UnApproveRequestStep3";
            me.actionSaveItem();
			hidePopup();
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];

			if (me.status == "New" || me.status == "Edit" || me.status == "SaveAndApproveRequestStep1" 
				|| me.status == "SaveAndApproveRequestStep2" || me.status == "SaveAndApproveRequestStep3") {
				if (me.currentWizard == "PrimaryDriver") {
					if (!me.primaryContractType.validate(true) || !me.financialCompany.validate(true) || !me.serviceLine.validate(true))
						return false;
				}
				else if (me.currentWizard == "HierarchyInfo") {
					if (!me.svp.validate(true) || !me.dvp.validate(true) || !me.rvp.validate(true)
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
					else if (me.hourlyCompany.lastBlurValue != "" && (me.hourlyCompany.indexSelected == me.salaryCompany.indexSelected)) {
						alert("[Hourly Company] & [Salary Company] cannot be same.");
						return false;
					}
				}
				else if (me.currentWizard == "BenefitsInfo") {
					if (!me.unionAccount.validate(true))
						return false;
				}
				else if (me.currentWizard == "CustomerInfo") {
					if (!me.customerNumber.validate(true) || !me.clientName.validate(true) || !me.customerStreet1.validate(true) || !me.customerCity.validate(true) 
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
				else if (!me.serviceLocationNumber.validate(true) || !me.serviceLocationName.validate(true) || !me.serviceLocationStreet1.validate(true)
					|| !me.serviceLocationCity.validate(true) || !me.serviceLocationState.validate(true) || !me.serviceLocationZipCode.validate(true)) {
					return false;
				}

				var otherServicesProvided = $("#OtherServicesProvided").multiselect("getChecked").map(function() {
					return this.value;    
				}).get();

				item = new fin.hcm.houseCodeRequest.HouseCodeRequest(
					(me.status == "New" ? 0 : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].id)
					, (me.status == "New" ? "0" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column1)
					, (me.status == "New" ? me.session.propertyGet("userId") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column2)
					, (me.status == "New" ? me.session.propertyGet("userName") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column3)
					, (me.status == "New" ? me.session.propertyGet("userFirstName") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column4)
					, (me.status == "New" ? me.session.propertyGet("userLastName") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column5)
					, (me.status == "New" ? ui.cmn.text.date.format(new Date(), "mm/dd/yyyy") : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column6)
					, (me.status == "New" ? "Open" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column7)
					, (me.status == "New" ? "" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column8)
					, ""
					, ""
					, ""
					, (me.status == "New" ? "" : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column12)
					, ""
					, (me.status == "New" ? me.persons[0].email : me.houseCodeRequests[me.houseCodeRequestGrid.activeRowIndex].column14)
					, ""
					, (me.primaryContractType.indexSelected >= 0 ? me.primaryContractType.data[me.primaryContractType.indexSelected].id : 0)
					, "crothall"
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
					, me.city.lastBlurValue
					, (me.state.indexSelected >= 0 ? me.state.data[me.state.indexSelected].id : 0)
					, me.zipCode.getValue()
					, me.county.lastBlurValue
					, fin.cmn.text.mask.phone(me.phone.getValue(), true)
					, (me.primaryServiceProvided.indexSelected >= 0 ? me.primaryServiceProvided.data[me.primaryServiceProvided.indexSelected].id : 0)
					, otherServicesProvided.toString()
					, me.priorServiceProvider.getValue()
					, (me.hourlyCompany.indexSelected >= 0 ? me.hourlyCompany.data[me.hourlyCompany.indexSelected].id : 0)
					, me.hourlyEmployees.getValue()
					, (me.salaryCompany.indexSelected >= 0 ? me.salaryCompany.data[me.salaryCompany.indexSelected].id : 0)
					, me.salaryEmployees.getValue()
					, me.ePay.check.checked ? "1" : "0"
					, me.ePayOptions.getValue()
					, $("input[name='CrothallBenefits']:checked").val()
					, (me.unionAccount.indexSelected >= 0 ? me.unionAccount.data[me.unionAccount.indexSelected].id : 0)
					, me.unionName.getValue()
					, me.localNumber.getValue()
					, me.customerNumber.lastBlurValue
					, me.clientName.getValue()
					, me.customerStreet1.getValue()
					, me.customerCity.lastBlurValue
					, (me.customerState.indexSelected >= 0 ? me.customerState.data[me.customerState.indexSelected].id : 0)
					, me.customerZipCode.getValue()
					, fin.cmn.text.mask.phone(me.customerPhone.getValue(), true)
					, me.customerBiller.getValue()
					, (me.billingFrequency.indexSelected >= 0 ? me.billingFrequency.data[me.billingFrequency.indexSelected].id : 0)
					, me.paymentTerms.getValue()
					, me.creditApprovalNumber.getValue()
					, me.regularContractPrice.getValue()
					, me.clientStatus.lastBlurValue
					, me.taxExemptionNumber.getValue()
					, me.certificate.getValue()
					, me.einNumber.getValue()
					, me.companyStatus.lastBlurValue
					, $("input[name='Contract']:checked").val()
					, (me.contractType.indexSelected >= 0 ? me.contractType.data[me.contractType.indexSelected].id : 0)
					, me.contractLength.getValue()
					, me.expirationDate.lastBlurValue
					, $("input[name='TenetHealthcareAccount']:checked").val()
					, me.squareFootage.getValue()
					, me.licensedBeds.getValue()
					, me.gpoMember.getValue()
					, $("input[name='StartDateFirm']:checked").val()
					, $("input[name='CompassPurchaseAnySupplies']:checked").val()
					, me.contactName.getValue()
					, me.contactNumber.getValue()
					, me.typesOfSuppliesPurchased.getValue()
					, me.chargeable.lastBlurValue
					, me.markup.getValue()
					, me.serviceLocationNumber.lastBlurValue
					, me.serviceLocationName.getValue()
					, me.serviceLocationStreet1.getValue()
					, me.serviceLocationCity.lastBlurValue
					, (me.serviceLocationState.indexSelected >= 0 ? me.serviceLocationState.data[me.serviceLocationState.indexSelected].id : 0)
					, me.serviceLocationZipCode.getValue()
					, me.miscNumber.getValue()
					, me.exterior.getValue()
					, me.foodCourt.getValue()
					, me.commonArea.getValue()
					, me.otherAreas.getValue()
					, (me.financialCompany.indexSelected >= 0 ? me.financialCompany.data[me.financialCompany.indexSelected].id : 0)
					, (me.serviceLine.indexSelected >= 0 ? me.serviceLine.data[me.serviceLine.indexSelected].id : 0)
					, me.customerStreet2.getValue()
					, me.customerCounty.lastBlurValue
					, me.serviceLocationStreet2.getValue()
					, me.serviceLocationCounty.lastBlurValue
					, (me.svp.indexSelected >= 0 ? me.svp.data[me.svp.indexSelected].brief : me.svpBrief.getValue())
					, (me.dvp.indexSelected >= 0 ? me.dvp.data[me.dvp.indexSelected].brief : me.dvpBrief.getValue())
					, (me.rvp.indexSelected >= 0 ? me.rvp.data[me.rvp.indexSelected].brief : me.rvpBrief.getValue())
					, (me.srm.indexSelected >= 0 ? me.srm.data[me.srm.indexSelected].brief : me.srmBrief.getValue())
					, (me.rm.indexSelected >= 0 ? me.rm.data[me.rm.indexSelected].brief : me.rmBrief.getValue())
					, (me.am.indexSelected >= 0 ? me.am.data[me.am.indexSelected].brief : me.amBrief.getValue())
					);

				if (me.status == "SaveAndApproveRequestStep1") {
					item.column7 = "Step 1 Approved";
				}
				else if (me.status == "SaveAndApproveRequestStep2") {
					item.column7 = "Step 2 Approved";
				}
				else if (me.status == "SaveAndApproveRequestStep3") {
					//item.column7 = "Step 3 - In Process";
					item.column7 = "Step 2 Approved";
					item.column13 = me.houseCode.getValue();

					var users = item.column12.split(",");
					var found = false;
					for (var index = 0; index < users.length; index++) {
						if (users[index] == me.session.propertyGet("userId")) {
							found = true;
							break;
						}
					}
					
					if (!found)
						item.column12 = (item.column12 == "" ? me.session.propertyGet("userId") : item.column12 + "," + me.session.propertyGet("userId"));
				}
				hidePopup();
				$("#messageToUser").text("Saving");
			}
			else if (me.status == "ApproveRequestStep1") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "Step 1 Approved";
				hidePopup();
			}
			else if (me.status == "ApproveRequestStep2") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "Step 2 Approved";
				hidePopup();
			}
			else if (me.status == "ApproveRequestStep3") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				//item.column7 = "Step 3 - In Process";
				item.column7 = "Step 2 Approved";
				hidePopup();
			}
			else if (me.status == "SendRequest") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "In Process";
			}
			else if (me.status == "CancelRequest") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "Cancelled";
			}
			else if (me.status == "UnApproveRequestStep1") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "Open";
			}
			else if (me.status == "UnApproveRequestStep2") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "In Process";
			}
			else if (me.status == "UnApproveRequestStep3") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
				item.column7 = "Step 1 Approved";
			}
			else if (me.status == "ViewRequest") {
				item = me.houseCodeRequestGrid.data[me.houseCodeRequestGrid.activeRowIndex];
			}

			if (me.status == "ViewRequest")
				me.setStatus("Downloading");
			else
				me.setStatus("Saving");

			$("#pageLoading").fadeIn("slow");
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
				item: {type: fin.hcm.houseCodeRequest.HouseCodeRequest}
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
			xml += ' requestedDate="' + item.column6 + '"';
			xml += ' status="' + item.column7 + '"';
			xml += ' usersList="' + item.column12 + '"';
			xml += ' houseCode="' + ui.cmn.text.xml.encode(item.column13) + '"';
			xml += ' email="' + ui.cmn.text.xml.encode(item.column14) + '"';
			xml += ' primaryContractType="' + item.column16 + '"';
			xml += ' financialCompany="' + item.column89 + '"';
			xml += ' serviceLine="' + item.column90 + '"';
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
			xml += ' customerStreet1="' + ui.cmn.text.xml.encode(item.column48) + '"';
			xml += ' customerStreet2="' + ui.cmn.text.xml.encode(item.column91) + '"';
			xml += ' customerCity="' + ui.cmn.text.xml.encode(item.column49) + '"';
			xml += ' customerState="' + item.column50 + '"';
			xml += ' customerZipCode="' + item.column51 + '"';
			xml += ' customerCounty="' + ui.cmn.text.xml.encode(item.column92) + '"';
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
			xml += ' contractType="' + item.column64 + '"';
			xml += ' contractLength="' + ui.cmn.text.xml.encode(item.column65) + '"';
			xml += ' expirationDate="' + item.column66 + '"';
			xml += ' tenetHealthcareAccount="' + item.column67 + '"';
			xml += ' squareFootage="' + ui.cmn.text.xml.encode(item.column68) + '"';
			xml += ' licensedBeds="' + ui.cmn.text.xml.encode(item.column69) + '"';
			xml += ' gpoMember="' + ui.cmn.text.xml.encode(item.column70) + '"';
			xml += ' startDateFirm="' + item.column71 + '"';
			xml += ' compassPurchaseAnySupplies="' + item.column72 + '"';
			xml += ' contactName="' + ui.cmn.text.xml.encode(item.column73) + '"';
			xml += ' contactNumber="' + ui.cmn.text.xml.encode(item.column74) + '"';
			xml += ' typesOfSuppliesPurchased="' + ui.cmn.text.xml.encode(item.column75) + '"';
			xml += ' chargeable="' + item.column76 + '"';
			xml += ' markup="' + ui.cmn.text.xml.encode(item.column77) + '"';
			xml += ' serviceLocationNumber="' + item.column78 + '"';
			xml += ' serviceLocationName="' + ui.cmn.text.xml.encode(item.column79) + '"';
			xml += ' serviceLocationStreet1="' + ui.cmn.text.xml.encode(item.column80) + '"';
			xml += ' serviceLocationStreet2="' + ui.cmn.text.xml.encode(item.column93) + '"';
			xml += ' serviceLocationCity="' + ui.cmn.text.xml.encode(item.column81) + '"';
			xml += ' serviceLocationState="' + item.column82 + '"';
			xml += ' serviceLocationZipCode="' + item.column83 + '"';
			xml += ' serviceLocationCounty="' + ui.cmn.text.xml.encode(item.column94) + '"';
			xml += ' miscNumber="' + ui.cmn.text.xml.encode(item.column84) + '"';
			xml += ' exterior="' + ui.cmn.text.xml.encode(item.column85) + '"';
			xml += ' foodCourt="' + ui.cmn.text.xml.encode(item.column86) + '"';
			xml += ' commonArea="' + ui.cmn.text.xml.encode(item.column87) + '"';
			xml += ' otherAreas="' + ui.cmn.text.xml.encode(item.column88) + '"';
			xml += ' svpBrief="' + item.column95 + '"';
			xml += ' dvpBrief="' + item.column96 + '"';
			xml += ' rvpBrief="' + item.column97 + '"';
			xml += ' srmBrief="' + item.column98 + '"';
			xml += ' rmBrief="' + item.column99 + '"';
			xml += ' amBrief="' + item.column100 + '"';
			xml += ' action="' + me.status + '"';
			xml += ' moduleBrief="hcr"';
			xml += ' contractTypeBrief="' + (me.primaryContractType.indexSelected >= 0 ? me.primaryContractType.data[me.primaryContractType.indexSelected].brief : "") + '"';
			xml += ' serviceLineBrief="' + (me.serviceLine.indexSelected >= 0 ? me.serviceLine.data[me.serviceLine.indexSelected].brief : "") + '"';
			xml += ' clientStatusBrief="' + (me.clientStatus.indexSelected >= 0 ? me.clientStatus.data[me.clientStatus.indexSelected].brief : "") + '"';
			xml += ' recordType="F"';

			if (me.status == "SendRequest" || me.status == "ViewRequest" || me.status == "SaveAndApproveRequestStep3") {
				var index = 0;
				var primaryContractTypeTitle = "";
				var financialCompanyTitle = "";
				var serviceLineTitle = "";
				var stateBrief = "";
				var stateTitle = "";
				var primaryServiceProvidedTitle = "";
				var otherServicesProvided = "";
				var hourlyCompanyTitle = "";
				var salaryCompanyTitle = "";
				var unionAccountTitle = "";
				var customerStateTitle = "";
				var billingFrequencyTitle = "";
				var contractTypeTitle = "";
				var serviceLocationStateTitle = "";
				
				index = ii.ajax.util.findIndexById(item.column16, me.contractTypes);
				if (index != undefined && index >= 0)
					primaryContractTypeTitle = me.contractTypes[index].name;

				index = ii.ajax.util.findIndexById(item.column89, me.jdeCompanys);
				if (index != undefined && index >= 0)
					financialCompanyTitle = me.jdeCompanys[index].name;

				index = ii.ajax.util.findIndexById(item.column90, me.serviceLines);
				if (index != undefined && index >= 0)
					serviceLineTitle = me.serviceLines[index].name;

				index = ii.ajax.util.findIndexById(item.column29, me.stateTypes);
				if (index != undefined && index >= 0) {
					stateBrief = me.stateTypes[index].brief;
					stateTitle = me.stateTypes[index].name;
				}
					
				index = ii.ajax.util.findIndexById(item.column33, me.serviceTypes);
				if (index != undefined && index >= 0)
					primaryServiceProvidedTitle = me.serviceTypes[index].name;

				otherServicesProvidedTemp = item.column34.split(',');
				for (var itemIndex = 0; itemIndex < otherServicesProvidedTemp.length; itemIndex++) {
					index = ii.ajax.util.findIndexById(otherServicesProvidedTemp[itemIndex], me.serviceTypes);
					if (index != undefined && index >= 0)
						otherServicesProvided += (otherServicesProvided != "" ? ", " : "") + me.serviceTypes[index].name;
				}
				
				index = ii.ajax.util.findIndexById(item.column36, me.payPayrollCompanys);
				if (index != undefined && index >= 0)
					hourlyCompanyTitle = me.payPayrollCompanys[index].title;
	
				index = ii.ajax.util.findIndexById(item.column38, me.payPayrollCompanys);
				if (index != undefined && index >= 0)
					salaryCompanyTitle = me.payPayrollCompanys[index].title;

				index = ii.ajax.util.findIndexById(item.column43, me.houseCodeTypes);
				if (index != undefined && index >= 0)
					unionAccountTitle = me.houseCodeTypes[index].name;
				
				index = ii.ajax.util.findIndexById(item.column50, me.stateTypes);
				if (index != undefined && index >= 0)
					customerStateTitle = me.stateTypes[index].name;
				
				index = ii.ajax.util.findIndexById(item.column54, me.billingCycleFrequencys);
				if (index != undefined && index >= 0)
					billingFrequencyTitle = me.billingCycleFrequencys[index].name;
				
				index = ii.ajax.util.findIndexById(item.column64, me.termsOfContractTypes);
				if (index != undefined && index >= 0)
					contractTypeTitle = me.termsOfContractTypes[index].name;

				index = ii.ajax.util.findIndexById(item.column82, me.stateTypes);
				if (index != undefined && index >= 0)
					serviceLocationStateTitle = me.stateTypes[index].name;

				xml += ' primaryContractTypeTitle="' + ui.cmn.text.xml.encode(primaryContractTypeTitle) + '"';
				xml += ' financialCompanyTitle="' + ui.cmn.text.xml.encode(financialCompanyTitle) + '"';
				xml += ' serviceLineTitle="' + ui.cmn.text.xml.encode(serviceLineTitle) + '"';
				xml += ' stateBrief="' + ui.cmn.text.xml.encode(stateBrief) + '"';
				xml += ' stateTitle="' + ui.cmn.text.xml.encode(stateTitle) + '"';
				xml += ' primaryServiceProvidedTitle="' + ui.cmn.text.xml.encode(primaryServiceProvidedTitle) + '"';
				xml += ' otherServicesProvidedTitle="' + ui.cmn.text.xml.encode(otherServicesProvided) + '"';
				xml += ' hourlyCompanyTitle="' + ui.cmn.text.xml.encode(hourlyCompanyTitle) + '"';
				xml += ' salaryCompanyTitle="' + ui.cmn.text.xml.encode(salaryCompanyTitle) + '"';
				xml += ' unionAccountTitle="' + ui.cmn.text.xml.encode(unionAccountTitle) + '"';
				xml += ' customerStateTitle="' + ui.cmn.text.xml.encode(customerStateTitle) + '"';
				xml += ' billingFrequencyTitle="' + ui.cmn.text.xml.encode(billingFrequencyTitle) + '"';
				xml += ' contractTypeTitle="' + ui.cmn.text.xml.encode(contractTypeTitle) + '"';
				xml += ' serviceLocationStateTitle="' + ui.cmn.text.xml.encode(serviceLocationStateTitle) + '"';
			}
			
			if (me.status == "UnApproveRequestStep1" || me.status == "UnApproveRequestStep2" || me.status == "UnApproveRequestStep3")
				xml += ' notes="' + ui.cmn.text.xml.encode(me.notes.value) + '"';
			else 
				xml += ' notes=""';
		
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
			var currentStatus = "";

			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {
						case "appGenericImport":
							if (me.status == "SendRequest" || me.status == "CancelRequest") {
								me.houseCodeRequests[me.lastSelectedRowIndex] = item;
								me.houseCodeRequestGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);									
								$("#AnchorEdit").hide();
								$("#AnchorSendRequest").hide();
								$("#AnchorCancelRequest").hide();
							}
							else if (me.status == "New") {
								item.id = parseInt($(this).attr("id"), 10);
								me.houseCodeRequests.push(item);
								me.lastSelectedRowIndex = me.houseCodeRequestGrid.data.length - 1;
							}
							else if (me.status == "ViewRequest") {
								currentStatus = me.status;
								$("iframe")[0].contentWindow.document.getElementById("FileName").value = $(this).attr("fileName");
								$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
							}
							else {
								if (me.status == "SaveAndApproveRequestStep3") {
									item.column7 = $(this).attr("status");
									$("iframe")[0].contentWindow.document.getElementById("FileName").value = $(this).attr("fileName");
									$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
								}
								me.lastSelectedRowIndex = me.houseCodeRequestGrid.activeRowIndex;
								me.houseCodeRequests[me.lastSelectedRowIndex] = item;
							}

							me.status = "";
							me.houseCodeRequestGrid.setData(me.houseCodeRequests);
							me.houseCodeRequestGrid.body.select(me.lastSelectedRowIndex);

							break;
					}
				});

				if (currentStatus == "ViewRequest")
					me.setStatus("Normal");
				else
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
	$("#popupRequest").fadeIn("slow");
}

function hidePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupRequest").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupRequest").width();
	var popupHeight = $("#popupRequest").height();

	$("#popupLoading, #popupRequest").css({
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
			fin.hcm.houseCodeRequestUi = new fin.hcm.houseCodeRequest.UserInterface();
			fin.hcm.houseCodeRequestUi.resize();
		}
	}, 100);
}
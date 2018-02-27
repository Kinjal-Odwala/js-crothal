ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.activateHouseCode.usr.defs" );

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
    iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() {
    iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; });
}

ii.Class({
    Name: "fin.hcm.activateHouseCode.UserInterface",
    Definition: {
		init: function() {
			var me = this;

			me.level = "";
			me.status = "";
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;
			me.validSite = true;
			me.searchZipCode = false;
			me.searchZipCodeType = "";

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\ActivateHouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
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

		authorizationProcess: function() {
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
				me.loadCount = 6;
				me.session.registerFetchNotify(me.sessionLoaded, me);

				me.state.fetchingData();
				me.industryType.fetchingData();
				me.primaryBusiness.fetchingData();
				me.gpo.fetchingData();
				me.jdeCompany.fetchingData();
				me.serviceLine.fetchingData();
				me.remitTo.fetchingData();
				me.contractType.fetchingData();
				me.financialEntity.fetchingData();
				me.billingCycleFrequency.fetchingData();
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.industryTypeStore.fetch("userId:[user]", me.industryTypesLoaded, me);
				me.primaryBusinessTypeStore.fetch("userId:[user]", me.primaryBusinessTypesLoaded, me);
				me.gpoTypeStore.fetch("userId:[user]", me.gpoTypesLoaded, me);
				me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
				me.houseCodeActivateMasterStore.fetch("userId:[user]", me.houseCodeActivateMastersLoaded, me);
				me.hirNodeStore.fetch("userId:[user],hierarchy:2,", me.hirNodesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			fin.hcm.activateHouseCodeUi.houseCodeGrid.setHeight($(window).height() - 80);
			$("#houseCodeDetailContainer").height($(window).height() - 120);
		},

		defineFormControls: function() {
			var me = this;

			me.houseCodeGrid = new ui.ctl.Grid({
				id: "HouseCodeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() {
					if (me.status !== "New")
						return parent.fin.cmn.status.itemValid();
				}
			});

			me.houseCodeGrid.addColumn("brief", "brief", "House Code", "House Code", 120);
			me.houseCodeGrid.addColumn("title", "title", "Title", "Title", 250);
			me.houseCodeGrid.addColumn("description", "description", "Description", "Description", null);
			me.houseCodeGrid.capColumns();

			me.svp = new ui.ctl.Input.DropDown.Filtered({
				id : "SVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() {
					me.modified();
					me.svpChanged();
				}
		    });

			me.svp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && !(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.svp.lastBlurValue)))
						this.setInvalid("Please enter the correct title for SVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.dvp = new ui.ctl.Input.DropDown.Filtered({
				id : "DVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() {
					me.modified();
					me.dvpChanged();
				}
		    });

			me.dvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.dvp.lastBlurValue)))
						this.setInvalid("Please enter the correct title for DVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.rvp = new ui.ctl.Input.DropDown.Filtered({
				id : "RVP",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() {
					me.modified();
					me.rvpChanged();
				}
		    });

			me.rvp.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.rvp.lastBlurValue)))
						this.setInvalid("Please enter the correct title for RVP. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.srm = new ui.ctl.Input.DropDown.Filtered({
				id : "SRM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() {
					me.modified();
					me.srmChanged();
				}
		    });

			me.srm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.srm.lastBlurValue)))
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

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.rm.lastBlurValue)))
						this.setInvalid("Please enter the correct title for RM. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.am = new ui.ctl.Input.DropDown.Filtered({
				id : "AM",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() {
					me.modified();
					me.amChanged();
				}
		    });

			me.am.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.am.lastBlurValue)))
						this.setInvalid("Please enter the correct title for AM. The title can't contain any of the following characters: \\/:*?\"<>|.,");
				});

			me.svpBrief = new ui.ctl.Input.Text({
		        id: "SVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.svpBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.dvpBrief = new ui.ctl.Input.Text({
		        id: "DVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.dvpBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.rvpBrief = new ui.ctl.Input.Text({
		        id: "RVPBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.rvpBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.srmBrief = new ui.ctl.Input.Text({
		        id: "SRMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.srmBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.rmBrief = new ui.ctl.Input.Text({
		        id: "RMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.rmBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.amBrief = new ui.ctl.Input.Text({
		        id: "AMBrief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.amBrief.makeEnterTab()
				.setValidationMaster(me.validator);

			me.siteName = new ui.ctl.Input.Text({
		        id: "SiteName",
				maxLength: 64,
				changeFunction: function() {
					me.modified();
					me.validateSite();
				}
		    });

			me.siteName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.siteName.getValue() === "")
						return;

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.siteName.getValue())))
						this.setInvalid("Please enter the correct Site Name. The Site Name can't contain any of the following characters: \\/:*?\"<>|.,");
					else if (!me.validSite)
						this.setInvalid("Site Name [" + me.siteName.getValue() + "] is already exists. Please enter different Site Name.");
				});

			me.address1 = new ui.ctl.Input.Text({
		        id: "Address1",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.address1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.address2 = new ui.ctl.Input.Text({
		        id: "Address2",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.address2.makeEnterTab()
				.setValidationMaster(me.validator);

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

				if (me.zipCode.getValue() === "")
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

					if (me.city.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.city.data.length > 0 && me.city.indexSelected === -1)
						this.setInvalid("Please select the correct City.");
					else if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.city.lastBlurValue)))
						this.setInvalid("Please enter the correct City name. The name can't contain any of the following characters: \\/:*?\"<>|.,");
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

					if ((this.focused || this.touched) && me.state.indexSelected === -1)
						this.setInvalid("Please select the correct State.");
				});

			me.industryType = new ui.ctl.Input.DropDown.Filtered({
				id : "IndustryType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.industryType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.industryType.indexSelected === -1)
						this.setInvalid("Please select the correct IndustryType Type.");
				});

			me.primaryBusiness = new ui.ctl.Input.DropDown.Filtered({
				id : "PrimaryBusiness",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.primaryBusiness.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.primaryBusiness.indexSelected === -1)
						this.setInvalid("Please select the correct Primary Business.");
				});

			me.gpo = new ui.ctl.Input.DropDown.Filtered({
				id : "GPO",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.gpo.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.gpo.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.gpo.indexSelected === -1)
						this.setInvalid("Please select the correct GPO.");
				});

			me.specifyGPO = new ui.ctl.Input.Text({
		        id: "SpecifyGPO",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.specifyGPO.makeEnterTab()
				.setValidationMaster(me.validator);

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

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.closedDate = new ui.ctl.Input.Date({
		        id: "ClosedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.closedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.closedDate.text.value;

					if (enteredText !== "") {
						if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
							this.setInvalid("Please enter valid date.");
						else if (new Date(enteredText) < new Date(me.startDate.text.value))
							this.setInvalid("The Closed Date should not be less than Start Date.");
					}
				});

			me.jdeCompany = new ui.ctl.Input.DropDown.Filtered({
				id : "JDECompany",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.jdeCompanyChanged(); me.modified(); }
		    });

			me.jdeCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.jdeCompany.indexSelected === -1)
						this.setInvalid("Please select the correct JDE Company.");
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

					if ((this.focused || this.touched) && me.primaryServiceProvided.indexSelected === -1)
						this.setInvalid("Please select the correct Primary Service Provided.");
				});

			$("#OtherServicesProvided").multiselect({
				minWidth: 200
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function() { me.modified(true); }
			});

			me.serviceLine = new ui.ctl.Input.DropDown.Filtered({
				id : "ServiceLine",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLine.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.serviceLine.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.serviceLine.indexSelected === -1)
						this.setInvalid("Please select the correct Service Line.");
				});

			me.remitTo = new ui.ctl.Input.DropDown.Filtered({
		        id: "RemitTo",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.remitTo.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.remitTo.indexSelected === -1)
						this.setInvalid("Please select the correct Remit To.");
				});

			me.contractType = new ui.ctl.Input.DropDown.Filtered({
				id : "ContractType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.contractType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.contractType.indexSelected === -1)
						this.setInvalid("Please select the correct Contract Type.");
				});

			me.billingCycleFrequency = new ui.ctl.Input.DropDown.Filtered({
				id : "BillingCycleFrequency",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.billingCycleFrequency.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.billingCycleFrequency.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.billingCycleFrequency.indexSelected === -1)
						this.setInvalid("Please select the correct Billing Cycle Frequency.");
				});

			me.financialEntity = new ui.ctl.Input.DropDown.Filtered({
				id : "FinancialEntity",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.financialEntity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.financialEntity.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.financialEntity.indexSelected === -1)
						this.setInvalid("Please select the correct Financial Entity.");
				});

			me.netCleanable = new ui.ctl.Input.Text({
		        id: "NetCleanable",
		        maxLength: 5,
				changeFunction: function() { me.modified(); }
		    });

			me.netCleanable.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.netCleanable.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d+$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});

			me.licensedBeds = new ui.ctl.Input.Text({
		        id: "LicensedBeds",
		        maxLength: 5,
				changeFunction: function() { me.modified(); }
		    });

			me.licensedBeds.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.licensedBeds.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d+$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});

			me.contact = new ui.ctl.Input.Text({
		        id: "Contact",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.contact.makeEnterTab()
				.setValidationMaster(me.validator);

			me.hourlyEmployees = new ui.ctl.Input.Text({
		        id: "HourlyEmployees",
				maxLength: 5,
				changeFunction: function() { me.modified(); }
		    });

			me.hourlyEmployees.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.hourlyEmployees.getValue();

					if (enteredText === "")
						return;

					if (!(/^\d+$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
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
		},

		configureCommunications: function() {
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.activateHouseCode.HirNode,
				itemConstructorArgs: fin.hcm.activateHouseCode.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.hcm.activateHouseCode.Site,
				itemConstructorArgs: fin.hcm.activateHouseCode.siteArgs,
				injectionArray: me.sites
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.activateHouseCode.StateType,
				itemConstructorArgs: fin.hcm.activateHouseCode.stateTypeArgs,
				injectionArray: me.stateTypes
			});

			me.industryTypes = [];
			me.industryTypeStore = me.cache.register({
				storeId: "industryTypes",
				itemConstructor: fin.hcm.activateHouseCode.IndustryType,
				itemConstructorArgs: fin.hcm.activateHouseCode.industryTypeArgs,
				injectionArray: me.industryTypes
			});

			me.primaryBusinessTypes = [];
			me.primaryBusinessTypeStore = me.cache.register({
				storeId: "primaryBusinessTypes",
				itemConstructor: fin.hcm.activateHouseCode.PrimaryBusinessType,
				itemConstructorArgs: fin.hcm.activateHouseCode.primaryBusinessTypeArgs,
				injectionArray: me.primaryBusinessTypes
			});

			me.gpoTypes = [];
			me.gpoTypeStore = me.cache.register({
				storeId: "gpoTypes",
				itemConstructor: fin.hcm.activateHouseCode.GPOType,
				itemConstructorArgs: fin.hcm.activateHouseCode.gpoTypeArgs,
				injectionArray: me.gpoTypes
			});

			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.hcm.activateHouseCode.JDECompany,
				itemConstructorArgs: fin.hcm.activateHouseCode.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});

			me.jdeServices = [];
			me.jdeServiceStore = me.cache.register({
				storeId: "houseCodeJDEServices",
				itemConstructor: fin.hcm.activateHouseCode.JDEService,
				itemConstructorArgs: fin.hcm.activateHouseCode.jdeServiceArgs,
				injectionArray: me.jdeServices
			});

			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.hcm.activateHouseCode.RemitTo,
				itemConstructorArgs: fin.hcm.activateHouseCode.remitToArgs,
				injectionArray: me.remitTos
			});

			me.contractTypes = [];
			me.houseCodeActivateMasterStore = me.cache.register({
				storeId: "houseCodeActivateMasters",	// contractTypes
				itemConstructor: fin.hcm.activateHouseCode.ContractType,
				itemConstructorArgs: fin.hcm.activateHouseCode.contractTypeArgs,
				injectionArray: me.contractTypes
			});

			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.activateHouseCode.ServiceLine,
				itemConstructorArgs: fin.hcm.activateHouseCode.serviceLineArgs,
				injectionArray: me.serviceLines
			});

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.activateHouseCode.ServiceType,
				itemConstructorArgs: fin.hcm.activateHouseCode.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.activateHouseCode.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.activateHouseCode.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys
			});

			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.hcm.activateHouseCode.ZipCodeType,
				itemConstructorArgs: fin.hcm.activateHouseCode.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "units",
				itemConstructor: fin.hcm.activateHouseCode.HouseCode,
				itemConstructorArgs: fin.hcm.activateHouseCode.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.hcm.activateHouseCode.HouseCodeDetail,
				itemConstructorArgs: fin.hcm.activateHouseCode.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});
		},

		setStatus: function(status) {

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

		setLoadCount: function() {
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
			me.siteName.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.zipCode.resizeText();
			me.city.resizeText();
			me.state.resizeText();
			me.industryType.resizeText();
			me.primaryBusiness.resizeText();
			me.gpo.resizeText();
			me.specifyGPO.resizeText();
			me.jdeCompany.resizeText();
			me.primaryServiceProvided.resizeText();
			me.serviceLine.resizeText();
			me.remitTo.resizeText();
			me.contractType.resizeText();
			me.financialEntity.resizeText();
			me.billingCycleFrequency.resizeText();
			me.netCleanable.resizeText();
			me.licensedBeds.resizeText();
			me.contact.resizeText();
			me.hourlyEmployees.resizeText();
		},

		setTabIndexes: function() {
			var me = this;

			me.svp.text.tabIndex = 1;
			me.svpBrief.text.tabIndex = 2;
			me.dvp.text.tabIndex = 3;
			me.dvpBrief.text.tabIndex = 4;
			me.rvp.text.tabIndex = 5;
			me.rvpBrief.text.tabIndex = 6;
			me.srm.text.tabIndex = 7;
			me.srmBrief.text.tabIndex = 8;
			me.rm.text.tabIndex = 9;
			me.rmBrief.text.tabIndex = 10;
			me.am.text.tabIndex = 11;
			me.amBrief.text.tabIndex = 12;
			me.siteName.text.tabIndex = 13;
			me.address1.text.tabIndex = 14;
			me.address2.text.tabIndex = 15;
			me.zipCode.text.tabIndex = 16;
			me.city.text.tabIndex = 17;
			me.state.text.tabIndex = 18;
			me.industryType.text.tabIndex = 19;
			me.primaryBusiness.text.tabIndex = 20;
			me.gpo.text.tabIndex = 21;
			me.specifyGPO.text.tabIndex = 22;
			me.jdeCompany.text.tabIndex = 23;
			me.primaryServiceProvided.text.tabIndex = 24;
			$("#OtherServicesProvided")[0].tabIndex = 25;
			me.serviceLine.text.tabIndex = 26;
			me.remitTo.text.tabIndex = 27;
			me.contractType.text.tabIndex = 28;
			me.billingCycleFrequency.text.tabIndex = 29;
			me.financialEntity.text.tabIndex = 30;
			me.netCleanable.text.tabIndex = 31;
			me.licensedBeds.text.tabIndex = 32;
			me.contact.text.tabIndex = 33;
			me.hourlyEmployees.text.tabIndex = 34;
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.svp.reset();
			me.dvp.reset();
			me.rvp.reset();
			me.srm.reset();
			me.rm.reset();
			me.am.reset();
			me.svpBrief.setValue("");
			me.dvpBrief.setValue("");
			me.rvpBrief.setValue("");
			me.srmBrief.setValue("");
			me.rmBrief.setValue("");
			me.amBrief.setValue("");
			me.siteName.setValue("");
			me.address1.setValue("");
			me.address2.setValue("");
			me.zipCode.setValue("");
			me.city.reset();
			me.state.reset();
			me.industryType.reset();
			me.primaryBusiness.reset();
			me.gpo.reset();
			me.specifyGPO.setValue("");
			me.jdeCompany.reset();
			me.primaryServiceProvided.reset();
			me.serviceLine.reset();
			me.remitTo.reset();
			me.contractType.reset();
			me.financialEntity.reset();
			me.billingCycleFrequency.reset();
			me.netCleanable.setValue("");
			me.licensedBeds.setValue("");
			me.contact.setValue("");
			me.hourlyEmployees.setValue("");
			$("#OtherServicesProvided").html("");
			$("#OtherServicesProvided").multiselect("refresh");
			me.svp.updateStatus();
			me.dvp.updateStatus();
			me.rvp.updateStatus();
			me.srm.updateStatus();
			me.rm.updateStatus();
			me.am.updateStatus();
			me.city.updateStatus();
			me.state.updateStatus();
			me.industryType.updateStatus();
			me.primaryBusiness.updateStatus();
			me.gpo.updateStatus();
			me.jdeCompany.updateStatus();
			me.primaryServiceProvided.updateStatus();
			me.serviceLine.updateStatus();
			me.remitTo.updateStatus();
			me.contractType.updateStatus();
			me.financialEntity.updateStatus();
			me.billingCycleFrequency.updateStatus();
			me.city.setData([]);
			me.primaryServiceProvided.setData([]);
		},

		findIndexByTitle: function() {
			var args = ii.args(arguments, {
				title: {type: String},
				data: {type: [Object]}
			});
			var title = args.title;
			var data = args.data;

			for (var index = 0; index < data.length; index++ ) {
				if (data[index].name.toLowerCase() === title.toLowerCase()) {
					return index;
				}
			}
			return null;
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.houseCodeStore.fetch("userId:[user],listInactiveUnits:1", me.houseCodesLoaded, me);
		},

		industryTypesLoaded: function(me, activeId) {

			me.industryType.setData(me.industryTypes);
			me.checkLoadCount();
		},

		primaryBusinessTypesLoaded: function(me, activeId) {

			me.primaryBusiness.setData(me.primaryBusinessTypes);
			me.checkLoadCount();
		},

		jdeCompanysLoaded: function(me, activeId) {

			me.jdeCompany.setData(me.jdeCompanys);
			me.checkLoadCount();
		},

		gpoTypesLoaded: function(me, activeId) {

			me.gpo.setData(me.gpoTypes);
			me.checkLoadCount();
		},

		houseCodesLoaded: function(me, activeId) {

			me.houseCodeGrid.setData(me.houseCodes);
			me.checkLoadCount();
			me.resize();
		},

		houseCodeActivateMastersLoaded: function(me, activeId) {

			me.financialEntities = [];

			for (var index = 0; index < me.serviceLines.length; index++) {
				if (me.serviceLines[index].financialEntity) {
					var item = new fin.hcm.activateHouseCode.FinancialEntity({ id: me.serviceLines[index].id, name:me.serviceLines[index].name });
					me.financialEntities.push(item);
				}
			}

			for (index = me.serviceLines.length - 1; index >= 0; index--) {
				if (me.serviceLines[index].financialEntity)
					me.serviceLines.splice(index, 1);
			}

			me.serviceLine.setData(me.serviceLines);
			me.remitTo.setData(me.remitTos);
			me.contractType.setData(me.contractTypes);
			me.financialEntity.setData(me.financialEntities);
			me.billingCycleFrequency.setData(me.billingCycleFrequencys);
			me.city.setData([]);

			me.checkLoadCount();
			me.resizeControls();
		},

		jdeCompanyChanged: function() {
			var me = this;

			if (me.jdeCompany.indexSelected < 0)
				return;

			me.primaryServiceProvided.fetchingData();
			me.jdeServiceStore.fetch("userId:[user],jdeCompanyId:" + me.jdeCompanys[me.jdeCompany.indexSelected].id, me.jdeServicesLoaded, me);
		},

		jdeServicesLoaded: function(me, activeId) {

			me.primaryServiceProvided.reset();
			me.primaryServiceProvided.setData(me.jdeServices);

			$("#OtherServicesProvided").html("");
			for (index = 0; index < me.jdeServices.length; index++) {
				$("#OtherServicesProvided").append("<option title='" + me.jdeServices[index].name + "' value='" + me.jdeServices[index].id + "'>" + me.jdeServices[index].name + "</option>");
			}
			$("#OtherServicesProvided").multiselect("refresh");
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

			for (index = 0; index < me.hirNodes.length; index++) {
				if (me.hirNodes[index].hirLevelTitle === "Enterprise")
					divisions.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Senior Vice President")
					svps.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Divisonal Vice President")
					dvps.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Regional Vice President")
					rvps.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Senior Regional Manager")
					srms.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Regional Manager")
					rms.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
				else if (me.hirNodes[index].hirLevelTitle === "Area Manager")
					ams.push(new fin.hcm.activateHouseCode.Division(me.hirNodes[index].id, me.hirNodes[index].brief, me.hirNodes[index].title));
			}

			if (me.level === "") {
				me.svp.setData(svps);
			}
			else if (me.level === "Divisonal Vice President") {
				me.dvp.setData(dvps);
				if (me.status === "Edit") {
					index = me.findIndexByTitle(me.houseCodeGrid.data[me.lastSelectedRowIndex].dvp, me.dvp.data);
					if (index !== null) {
						me.dvp.select(index, me.dvp.focused);
						me.dvpBrief.setValue(me.dvp.data[index].brief);
						me.dvpChanged();
					}
				}
			}
			else if (me.level === "Regional Vice President") {
				me.rvp.setData(rvps);
				if (me.status === "Edit") {
					index = me.findIndexByTitle(me.houseCodeGrid.data[me.lastSelectedRowIndex].rvp, me.rvp.data);
					if (index !== null) {
						me.rvp.select(index, me.rvp.focused);
						me.rvpBrief.setValue(me.rvp.data[index].brief);
						me.rvpChanged();
					}
				}
			}
			else if (me.level === "Senior Regional Manager") {
				me.srm.setData(srms);
				if (me.status === "Edit") {
					index = me.findIndexByTitle(me.houseCodeGrid.data[me.lastSelectedRowIndex].srm, me.srm.data);
					if (index !== null) {
						me.srm.select(index, me.srm.focused);
						me.srmBrief.setValue(me.srm.data[index].brief);
						me.srmChanged();
					}
				}
			}
			else if (me.level === "Regional Manager") {
				me.rm.setData(rms);
				if (me.status === "Edit") {
					index = me.findIndexByTitle(me.houseCodeGrid.data[me.lastSelectedRowIndex].rm, me.rm.data);
					if (index !== null) {
						me.rm.select(index, me.rm.focused);
						me.rmBrief.setValue(me.rm.data[index].brief);
						me.rmChanged();
					}
				}
			}
			else if (me.level === "Area Manager") {
				me.am.setData(ams);
				if (me.status === "Edit") {
					index = me.findIndexByTitle(me.houseCodeGrid.data[me.lastSelectedRowIndex].am, me.am.data);
					if (index !== null) {
						me.am.select(index, me.am.focused);
						me.amBrief.setValue(me.am.data[index].brief);
					}
				}
			}
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

			if (type === "Site") {
				// remove any unwanted characters
		    	zipCode = me.zipCode.getValue().replace(/[^0-9]/g, "");
				zipCode = zipCode.substring(0, 5);
				me.city.fetchingData();
			}

			me.zipCodeTypeStore.fetch("userId:[user],zipCode:" + zipCode, me.zipCodeTypesLoaded, me);
		},

		zipCodeTypesLoaded: function(me, activeId) {
			var cityNamesTemp = [];
			var index = 0;

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if ($.inArray(me.zipCodeTypes[index].city, cityNamesTemp) === -1)
					cityNamesTemp.push(me.zipCodeTypes[index].city);
			}

			cityNamesTemp.sort();
			me.cityNames = [];

			for (index = 0; index < cityNamesTemp.length; index++) {
				me.cityNames.push(new fin.hcm.activateHouseCode.CityName({ id: index + 1, city: cityNamesTemp[index] }));
			}

			if (me.searchZipCodeType === "Site") {
				me.city.reset();
				me.city.setData(me.cityNames);
			}

			if (!me.searchZipCode) {
				if (me.zipCodeTypes.length === 0) {
					if (me.searchZipCodeType === "Site") {
						me.city.setValue(me.houseCodeGrid.data[me.lastSelectedRowIndex].city);
					}
				}
				else {
					for (index = 0; index < me.cityNames.length; index++) {
						if (me.searchZipCodeType === "Site" && me.cityNames[index].city.toUpperCase() === me.houseCodeGrid.data[me.lastSelectedRowIndex].city.toUpperCase()) {
							me.city.select(index, me.city.focused);
							break;
						}
					}
				}
			}
			else {
				if (me.searchZipCodeType === "Site")
					me.state.reset();

				if (me.zipCodeTypes.length > 0) {
					index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

					if (index !== null && me.searchZipCodeType === "Site")
						me.state.select(index, me.state.focused);
				}
			}
		},

		validateSite: function() {
			var me = this;

			if (me.siteName.getValue() === "")
				return;
			$("#SiteNameText").addClass("Loading");
			me.validSite = true;
			me.siteStore.fetch("userId:[user],validate:1,title:" + me.siteName.getValue(), me.sitesLoaded, me);
		},

		sitesLoaded: function(me, activeId) {

			if (me.sites.length > 0) {
				me.validSite = false;
				me.siteName.setInvalid("Site Name [" + me.siteName.getValue() + "] is already exists. Please enter different Site Name.");
			}
			$("#SiteNameText").removeClass("Loading");
		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var item = me.houseCodeGrid.data[index];

			if (!parent.fin.cmn.status.itemValid()) {
				me.houseCodeGrid.body.deselect(index, true);
				return;
			}

			me.lastSelectedRowIndex = index;
			me.status = "";
			me.resetControls();
			me.setLoadCount();
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + item.id, me.houseCodeDetailsLoaded, me);
		},

		houseCodeDetailsLoaded: function(me, activeId) {

			me.setSiteInfo();
			me.checkLoadCount();
		},

		setSiteInfo: function() {
			var me = this;

			if (me.houseCodeDetails.length > 0) {
				me.siteName.setValue(me.houseCodes[me.houseCodeGrid.activeRowIndex].title);
				me.address1.setValue(me.houseCodeDetails[0].shippingAddress1);
				me.address2.setValue(me.houseCodeDetails[0].shippingAddress2);
				me.zipCode.setValue(me.houseCodeDetails[0].shippingZip);
				me.city.setValue(me.houseCodeDetails[0].shippingCity);
				var index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].shippingState.toString(), me.stateTypes);
				if (index !== null) 
					me.state.select(index, me.state.focused);
			}
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid()) {
				return;
			}

			me.resetControls();
			me.setSiteInfo();
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];

			if (me.lastSelectedRowIndex === -1)
				return;

			me.validator.forceBlur();
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			var otherServicesProvided = $("#OtherServicesProvided").multiselect("getChecked").map(function() {
				return this.value;
			}).get();

			item = new fin.hcm.activateHouseCode.HouseCode(
				0
				, me.houseCodeGrid.data[me.lastSelectedRowIndex].brief
				, me.houseCodeGrid.data[me.lastSelectedRowIndex].title
				, me.houseCodeGrid.data[me.lastSelectedRowIndex].description
				, me.svp.lastBlurValue
				, me.dvp.lastBlurValue
				, me.rvp.lastBlurValue
				, me.srm.lastBlurValue
				, me.rm.lastBlurValue
				, me.am.lastBlurValue
				, (me.svp.indexSelected >= 0 ? me.svp.data[me.svp.indexSelected].brief : me.svpBrief.getValue())
				, (me.dvp.indexSelected >= 0 ? me.dvp.data[me.dvp.indexSelected].brief : me.dvpBrief.getValue())
				, (me.rvp.indexSelected >= 0 ? me.rvp.data[me.rvp.indexSelected].brief : me.rvpBrief.getValue())
				, (me.srm.indexSelected >= 0 ? me.srm.data[me.srm.indexSelected].brief : me.srmBrief.getValue())
				, (me.rm.indexSelected >= 0 ? me.rm.data[me.rm.indexSelected].brief : me.rmBrief.getValue())
				, (me.am.indexSelected >= 0 ? me.am.data[me.am.indexSelected].brief : me.amBrief.getValue())
				, me.siteName.getValue()
				, me.address1.getValue()
				, me.address2.getValue()
				, me.zipCode.getValue()
				, me.city.lastBlurValue
				, (me.state.indexSelected >= 0 ? me.state.data[me.state.indexSelected].id : 0)
				, (me.industryType.indexSelected >= 0 ? me.industryType.data[me.industryType.indexSelected].id : 0)
				, (me.primaryBusiness.indexSelected >= 0 ? me.primaryBusiness.data[me.primaryBusiness.indexSelected].id : 0)
				, (me.gpo.indexSelected >= 0 ? me.gpo.data[me.gpo.indexSelected].id : 0)
				, me.specifyGPO.getValue()
				, me.startDate.lastBlurValue
				, me.closedDate.lastBlurValue
				, (me.jdeCompany.indexSelected >= 0 ? me.jdeCompany.data[me.jdeCompany.indexSelected].id : 0)
				, (me.primaryServiceProvided.indexSelected >= 0 ? me.primaryServiceProvided.data[me.primaryServiceProvided.indexSelected].id : 0)
				, otherServicesProvided.toString()
				, (me.serviceLine.indexSelected >= 0 ? me.serviceLine.data[me.serviceLine.indexSelected].id : 0)
				, (me.remitTo.indexSelected >= 0 ? me.remitTo.data[me.remitTo.indexSelected].id : 0)
				, (me.contractType.indexSelected >= 0 ? me.contractType.data[me.contractType.indexSelected].id : 0)
				, (me.billingCycleFrequency.indexSelected >= 0 ? me.billingCycleFrequency.data[me.billingCycleFrequency.indexSelected].id : 0)
				, (me.financialEntity.indexSelected >= 0 ? me.financialEntity.data[me.financialEntity.indexSelected].id : 0)
				, me.netCleanable.getValue()
				, me.licensedBeds.getValue()
				, me.contact.getValue()
				, me.hourlyEmployees.getValue()
				);

			$("#messageToUser").text("Saving");
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
				item: {type: fin.hcm.activateHouseCode.HouseCode}
			});
			var item = args.item;
			var xml = "";

			xml += '<houseCodeActivate';
			xml += ' id="' + item.id + '"';
			xml += ' brief="' + item.brief + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
			xml += ' svp="' + ui.cmn.text.xml.encode(item.svp) + '"';
			xml += ' dvp="' + ui.cmn.text.xml.encode(item.dvp) + '"';
			xml += ' rvp="' + ui.cmn.text.xml.encode(item.rvp) + '"';
			xml += ' srm="' + ui.cmn.text.xml.encode(item.srm) + '"';
			xml += ' rm="' + ui.cmn.text.xml.encode(item.rm) + '"';
			xml += ' am="' + ui.cmn.text.xml.encode(item.am) + '"';
			xml += ' svpBrief="' + item.svpBrief + '"';
			xml += ' dvpBrief="' + item.dvpBrief + '"';
			xml += ' rvpBrief="' + item.rvpBrief + '"';
			xml += ' srmBrief="' + item.srmBrief + '"';
			xml += ' rmBrief="' + item.rmBrief + '"';
			xml += ' amBrief="' + item.amBrief + '"';
			xml += ' siteName="' + ui.cmn.text.xml.encode(item.siteName) + '"';
			xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
			xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
			xml += ' zipCode="' + item.zipCode + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
			xml += ' stateType="' + item.state + '"';
			xml += ' industryType="' + item.industryType + '"';
			xml += ' primaryBusiness="' + item.primaryBusiness + '"';
			xml += ' gpoType="' + item.gpo + '"';
			xml += ' specifyGPO="' + ui.cmn.text.xml.encode(item.specifyGPO) + '"';
			xml += ' startDate="' + item.startDate + '"';
			xml += ' closedDate="' + item.closedDate + '"';
			xml += ' jdeCompany="' + item.jdeCompany + '"';
			xml += ' primaryServiceProvided="' + item.primaryServiceProvided + '"';
			xml += ' otherServicesProvided="' + item.otherServicesProvided + '"';
			xml += ' serviceLine="' + item.serviceLine + '"';
			xml += ' remitTo="' + item.remitTo + '"';
			xml += ' contractType="' + item.contractType + '"';
			xml += ' billingCycleFrequency="' + item.billingCycleFrequency + '"';
			xml += ' financialEntity="' + item.financialEntity + '"';
			xml += ' netCleanable="' + item.netCleanable + '"';
			xml += ' licensedBeds="' + item.licensedBeds + '"';
			xml += ' contact="' + ui.cmn.text.xml.encode(item.contact) + '"';
			xml += ' hourlyEmployees="' + item.hourlyEmployees + '"';
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
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {
					if (this.tagName === "houseCode") {
						me.resetControls();
						me.houseCodes.splice(me.lastSelectedRowIndex, 1);
						me.houseCodeGrid.setData(me.houseCodes);
						me.lastSelectedRowIndex = -1;
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while activating House Code details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.hcm.activateHouseCodeUi = new fin.hcm.activateHouseCode.UserInterface();
			fin.hcm.activateHouseCodeUi.resize();
		}
	}, 100);
}
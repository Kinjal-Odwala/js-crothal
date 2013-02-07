ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.hierarchy" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.adh.report.usr.defs" );
ii.Import( "fin.cmn.usr.datepicker" );
ii.Import( "fin.cmn.usr.util" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.hierarchy", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.datepicker", 8 );
ii.Style( "fin.cmn.usr.theme", 9 );
ii.Style( "fin.cmn.usr.demos", 10 );
ii.Style( "fin.cmn.usr.core", 11 );
ii.Style( "fin.cmn.usr.dropDown", 12 );
ii.Style( "fin.cmn.usr.dateDropDown", 13 );

ii.Class({
    Name: "fin.adh.UserInterface",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.reportId = 0;
			me.delimitedOrgSelectedNodes = "";
			me.rowModifed = false;
			me.columnType = 0;
			me.status = "";
			me.searchNode = false;
			me.cellColorValid = "";
			me.cellColorInvalid = "red";
			me.sortColumns = "";
			me.houseCodeSortOrder = "Asc";
			me.typesLoadedCount = 0;
			me.loadDependentTypes = [];
			me.gridData = [];
			
			// Pagination setup
			me.startPoint = 1;
			me.endPoint = 100;
			me.maximumRows = 100;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			
			// Employee module
			me.payrollCompaniesCache = [];
			me.houseCodeJobsCache = [];
			me.statusTypesCache = [];
			me.terminationReasonTypesCache = [];
			me.localTaxCodesCache = [];
			me.statesCache = [];

			// User module
			me.userRolesCache = [];
			
			// Invoice module
			me.invBillToCache = [];

			me.gateway = ii.ajax.addGateway("adh", ii.config.xmlProvider);			
			me.cache = new ii.ajax.Cache(me.gateway);
			me.hierarchy = new ii.ajax.Hierarchy( me.gateway );
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Reports\\Ad-Hoc";

			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();			
			me.configureCommunications();
			me.anchorLoad.display(ui.cmn.behaviorStates.disabled);
			me.report.fetchingData();

			me.siteMasterStore.fetch("userId:[user],siteId:1", me.siteMastersLoaded, me);
			me.serviceTypeStore.fetch("userId:[user],", me.houseCodeServiceLoaded, me);
			me.localTaxCodeStore.fetch("payrollCompany:0,appState:0,userId:[user]", me.typesLoaded, me);
			me.maritalStatusStateTaxTypeSecondaryStore.fetch("appState:0,userId:[user]", me.typesLoaded, me);
			me.statusTypeStore.fetch("userId:[user],personId:0", me.typesLoaded, me);
			me.payFrequencyTypeStore.fetch("userId:[user]", me.typesLoaded, me);
			me.federalAdjustmentStore.fetch("userId:[user]", me.typesLoaded, me);
			me.sdiAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
			me.stateAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
			me.maritalStatusFederalTaxTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
			me.payrollCompanyStore.fetch("userId:[user]", me.maritalStatusTypesLoaded, me);
			me.localTaxAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
			me.separationCodeStore.fetch("userId:[user],terminationType:0,", me.maritalStatusTypesLoaded, me);
			me.transactionStatusTypeStore.fetch("userId:[user]", me.typesLoaded, me);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$("#divAdhReportGrid").bind("scroll", me.adhRportGridScroll);
		},

		authorizationProcess: function fin_adh_report_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;
			
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},
		
		sessionLoaded: function fin_adh_report_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			
			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;						
			var divAdhReportGridWidth = $(window).width() - 22;
			var divAdhReportGridHeight = $(window).height() - 145;

			$("#HirOrgContainer").height($(window).height() - 130);
			$("#divAdhReportGrid").css({"width" : divAdhReportGridWidth + "px", "height" : divAdhReportGridHeight + "px"});
		},
		
		adhRportGridScroll: function() {
		    var scrollLeft = $("#divAdhReportGrid").scrollLeft();
		    
			$("#tblAdhReportGridHeader").css("left", -scrollLeft + "px");
		},
		
		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}	// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
					case 83: // Ctrl+S
						fin.reportUi.actionSaveItem("save");						
						processed = true;
						break;
	
					case 85: // Ctrl+U
						fin.reportUi.actionUndoItem();
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
			
			me.report = new ui.ctl.Input.DropDown.Filtered({
				id: "Report",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.reportChange(); }
			});
			
			me.anchorExportToExcel = new ui.ctl.buttons.Sizeable({
				id: "AnchorExportToExcel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcelItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("save"); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
			
			me.anchorBack = new ui.ctl.buttons.Sizeable({
				id: "AnchorBack",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Back&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBackItem(); },
				hasHotState: true
			});
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUnitLoad(); },
				hasHotState: true
			});
			
			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadItem(); },
				hasHotState: true
			});
			
			me.appUnit = new ui.ctl.Input.Text({
		        id: "AppUnit",
				maxLength: 256,
				title: "To search a specific Unit in the following Hierarchy, type-in Unit# (1455, 900000) and press Enter key/click Search button."
		    });
			
			me.site = new ui.ctl.Input.DropDown.Filtered({
		        id: "Site",
				formatFunction: function( type ) { return type.name; },
		        required: false
		    });	
			
			me.site.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.site.indexSelected == -1)
						this.setInvalid("Please select Site.");
				});
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				hasHotState: true
			});
			
			$("#AnchorOK").click(function() {
				if (me.site.indexSelected >= 0) {
					$("#" + me.selectedAppUnitId).val(me.siteTypes[me.site.indexSelected].name);
					$("#" + me.selectedAppSiteId).val(me.siteTypes[me.site.indexSelected].id);
				}	
				hidePopup();
			});
			
			$("#AnchorCancel").click(function() {
				hidePopup();
			});
			
			$("#AppUnitText").bind("keydown", me, me.actionSearchItem);
			$("#SiteText").bind("keydown", me, me.actionSearchSite);
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevItems(); });
			$("#imgNext").bind("click", function() { me.nextItems(); });
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.users = [];
			me.userStore = me.cache.register({
				storeId: "loggedInUsers",
				itemConstructor: fin.adh.User,
				itemConstructorArgs: fin.adh.userArgs,
				injectionArray: me.users
			});

			me.roles = [];
			me.roleStore = me.cache.register({
				storeId: "loggedInUserRoles",
				itemConstructor: fin.adh.Role,
				itemConstructorArgs: fin.adh.roleArgs,
				injectionArray: me.roles,
				addToParentItem: true,
				parent: me.userStore,
				parentPropertyName: "appRoles",
				multipleFetchesAllowed: true
			});
			
			me.moduleColumnHeaders = [];
			me.moduleColumnHeaderStore = me.cache.register({
				storeId: "adhReportColumnHeaders",
				itemConstructor: fin.adh.ModuleColumnHeader,
				itemConstructorArgs: fin.adh.moduleColumnHeaderArgs,
				injectionArray: me.moduleColumnHeaders
			});
			
			me.moduleColumnDatas = [];
			me.moduleColumnDataStore = me.cache.register({
				storeId: "adhReportColumnDatas",
				itemConstructor: fin.adh.ModuleColumnData,
				itemConstructorArgs: fin.adh.moduleColumnDataArgs,
				injectionArray: me.moduleColumnDatas
			});
			
			me.reports = [];
			me.reportStore = me.cache.register({
				storeId: "adhReports",
				itemConstructor: fin.adh.Report,
				itemConstructorArgs: fin.adh.reportArgs,
				injectionArray: me.reports
			});
						
			me.reportFilters = [];
			me.reportFilterStore = me.cache.register({
				storeId: "adhReportFilters",
				itemConstructor: fin.adh.ReportFilter,
				itemConstructorArgs: fin.adh.reportFilterArgs,
				injectionArray: me.reportFilters
			});
			
			me.adhFileNames = [];
			me.adhFileNameStore = me.cache.register({
				storeId: "adhFileNames",
				itemConstructor: fin.adh.AdhFileName,
				itemConstructorArgs: fin.adh.adhFileNameArgs,
				injectionArray: me.adhFileNames
			});
			
			me.reportTotalRows = [];
			me.reportTotalRowStore = me.cache.register({
				storeId: "adhReportTotalRows",
				itemConstructor: fin.adh.ReportTotalRow,
				itemConstructorArgs: fin.adh.reportTotalRowArgs,
				injectionArray: me.reportTotalRows
			});
			
			me.units = [];
			me.unitStore = me.cache.register({
				storeId: "units",
				itemConstructor: fin.adh.AppUnit,
				itemConstructorArgs: fin.adh.appUnitArgs,
				injectionArray: me.units
			});
			
			me.hirOrgs = [];
			me.hirOrgStore = me.hierarchy.register( {
				storeId: "hirOrgs",
				itemConstructor: ui.ctl.Hierarchy.Node,
				itemConstructorArgs: ui.ctl.Hierarchy.nodeArgs,
				isRecursive: true,
				addToParentItem: true,
				parentPropertyName: "nodes",
				parentField: "parent",
				multipleFetchesAllowed: true,
				injectionArray: me.hirOrgs
			});
			
			// HouseCode Types
			me.siteTypes = [];
			me.siteTypeStore = me.cache.register({
				storeId: "siteTypes",
				itemConstructor: fin.adh.SiteType,
				itemConstructorArgs: fin.adh.siteTypeArgs,
				injectionArray: me.siteTypes
			});			
			
			me.houseCodeServices = [];
			me.houseCodeServiceStore = me.cache.register({
				storeId: "houseCodeServiceMasters",
				itemConstructor: fin.adh.HouseCodeService,
				itemConstructorArgs: fin.adh.houseCodeServiceArgs,
				injectionArray: me.houseCodeServices
			});			

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.adh.ServiceType,
				itemConstructorArgs: fin.adh.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});
			
			me.houseCodeSiteUnits = [];
			me.houseCodeSiteUnitsStore = me.cache.register({
				storeId: "appSiteUnits",
				itemConstructor: fin.adh.HouseCodeSiteUnit,
				itemConstructorArgs: fin.adh.houseCodeSiteUnitArgs,
				injectionArray: me.houseCodeSiteUnits
			});	
			
			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.adh.JdeCompany,
				itemConstructorArgs: fin.adh.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});
			
			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.adh.ServiceLine,
				itemConstructorArgs: fin.adh.serviceLineArgs,
				injectionArray: me.serviceLines
			});			
			
			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.adh.RemitTo,
				itemConstructorArgs: fin.adh.remitToArgs,
				injectionArray: me.remitTos	
			});
			
			me.contractTypes = [];
			me.contractTypeStore = me.cache.register({
				storeId: "financialContractMasters",
				itemConstructor: fin.adh.ContractType,
				itemConstructorArgs: fin.adh.contractTypeArgs,
				injectionArray: me.contractTypes	
			});
						
			me.termsOfContractTypes = [];
			me.termsOfContractTypeStore = me.cache.register({
				storeId: "termsOfContractTypes",
				itemConstructor: fin.adh.TermsOfContractType,
				itemConstructorArgs: fin.adh.termsOfContractTypeArgs,
				injectionArray: me.termsOfContractTypes	
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.adh.BillingCycleFrequency,
				itemConstructorArgs: fin.adh.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});			
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.adh.StateType,
				itemConstructorArgs: fin.adh.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	
			
			me.invoiceLogoTypes = [];
			me.invoiceLogoTypeStore = me.cache.register({
				storeId: "invoiceLogoTypes",
				itemConstructor: fin.adh.InvoiceLogoType,
				itemConstructorArgs: fin.adh.invoiceLogoTypeArgs,
				injectionArray: me.invoiceLogoTypes	
			});
			
			me.budgetTemplates = [];
			me.budgetTemplateStore = me.cache.register({
				storeId: "budgetTemplates",
				itemConstructor: fin.adh.BudgetTemplate,
				itemConstructorArgs: fin.adh.budgetTemplateArgs,
				injectionArray: me.budgetTemplates
			});
			
			me.payrollProcessings = [];
			me.payrollProcessingStore = me.cache.register({
				storeId: "payrollProcessingLocationTypes",
				itemConstructor: fin.adh.PayrollProcessingLocationType,
				itemConstructorArgs: fin.adh.payrollProcessingLocationTypeArgs,
				injectionArray: me.payrollProcessings	
			});
			
			me.ePayGroupTypes = [];
			me.ePayGroupTypeStore = me.cache.register({
				storeId: "ePayGroupTypes",
				itemConstructor: fin.adh.EPayGroupType,
				itemConstructorArgs: fin.adh.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});
			
			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.adh.HouseCodeType,
				itemConstructorArgs: fin.adh.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
			});
			
			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "payrollMasters",
				itemConstructor: fin.adh.PayPayrollCompany,
				itemConstructorArgs: fin.adh.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys	
			});

			// Site Types
			me.siteMasters = [];
			me.siteMasterStore = me.cache.register({
				storeId: "siteMasters",
				itemConstructor: fin.adh.SiteMaster,
				itemConstructorArgs: fin.adh.siteMasterArgs,
				injectionArray: me.siteMasters
			});			

			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.adh.Site,
				itemConstructorArgs: fin.adh.siteArgs,
				injectionArray: me.sites
			});
			
			me.industryTypes = [];
			me.industryTypeStore = me.cache.register({
				storeId: "industryTypes",
				itemConstructor: fin.adh.IndustryType,
				itemConstructorArgs: fin.adh.industryTypeArgs,
				injectionArray: me.industryTypes
			});			

			me.primaryBusinessTypes = [];
			me.primaryBusinessTypeStore = me.cache.register({
				storeId: "primaryBusinessTypes",
				itemConstructor: fin.adh.PrimaryBusinessType,
				itemConstructorArgs: fin.adh.primaryBusinessTypeArgs,
				injectionArray: me.primaryBusinessTypes
			});			

			me.locationTypes = [];
			me.locationTypeStore = me.cache.register({
				storeId: "locationTypes",
				itemConstructor: fin.adh.LocationType,
				itemConstructorArgs: fin.adh.locationTypeArgs,
				injectionArray: me.locationTypes
			});			

			me.traumaLevelTypes = [];
			me.traumaLevelTypeStore = me.cache.register({
				storeId: "traumaLevelTypes",
				itemConstructor: fin.adh.TraumaLevelType,
				itemConstructorArgs: fin.adh.traumaLevelTypeArgs,
				injectionArray: me.traumaLevelTypes
			});			

			me.profitDesignationTypes = [];
			me.profitDesignationTypeStore = me.cache.register({
				storeId: "profitDesignationTypes",
				itemConstructor: fin.adh.ProfitDesignationType,
				itemConstructorArgs: fin.adh.profitDesignationTypeArgs,
				injectionArray: me.profitDesignationTypes
			});			

			me.gpoTypes = [];
			me.gpoTypeStore = me.cache.register({
				storeId: "gpoTypes",
				itemConstructor: fin.adh.GPOType,
				itemConstructorArgs: fin.adh.gpoTypeArgs,
				injectionArray: me.gpoTypes
			});			

			me.ownershipTypes = [];
			me.ownershipTypeStore = me.cache.register({
				storeId: "ownershipTypes",
				itemConstructor: fin.adh.OwnershipType,
				itemConstructorArgs: fin.adh.ownershipTypeArgs,
				injectionArray: me.ownershipTypes
			});
			
			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.adh.ZipCodeType,
				itemConstructorArgs: fin.adh.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});	
			
			// Employee Types
			me.maritalStatusTypes = [];
			me.maritalStatusTypeStore = me.cache.register({
				storeId: "maritalStatusTypes",
				itemConstructor: fin.adh.MaritalStatusType,
				itemConstructorArgs: fin.adh.maritalStatusTypeArgs,
				injectionArray: me.maritalStatusTypes
			});
			
			me.statusTypes = [];
			me.statusTypeStore = me.cache.register({
				storeId: "employeeGeneralMasters",
				itemConstructor: fin.adh.StatusType,
				itemConstructorArgs: fin.adh.statusTypeArgs,
				injectionArray: me.statusTypes	
			});
			
			me.deviceGroupTypes = [];
			me.deviceGroupStore = me.cache.register({
				storeId: "deviceGroupTypes",
				itemConstructor: fin.adh.DeviceGroupType,
				itemConstructorArgs: fin.adh.deviceGroupTypeArgs,
				injectionArray: me.deviceGroupTypes	
			});
			
			me.jobCodeTypes = [];
			me.jobCodeStore = me.cache.register({
				storeId: "jobCodes",
				itemConstructor: fin.adh.JobCodeType,
				itemConstructorArgs: fin.adh.jobCodeTypeArgs,
				injectionArray: me.jobCodeTypes	
			});
			
			me.rateChangeReasons = [];
			me.rateChangeReasonStore = me.cache.register({
				storeId: "rateChangeReasons",
				itemConstructor: fin.adh.RateChangeReasonType,
				itemConstructorArgs: fin.adh.rateChangeReasonTypeArgs,
				injectionArray: me.rateChangeReasons	
			});
			
			me.terminationReasons = [];
			me.terminationReasonStore = me.cache.register({
				storeId: "terminationReasons",
				itemConstructor: fin.adh.TerminationReasonType,
				itemConstructorArgs: fin.adh.terminationReasonTypeArgs,
				injectionArray: me.terminationReasons	
			});
						
			me.workShifts = [];
			me.workShiftStore = me.cache.register({
				storeId: "workShifts",
				itemConstructor: fin.adh.WorkShift,
				itemConstructorArgs: fin.adh.workShiftArgs,
				injectionArray: me.workShifts	
			});
			
			me.ethnicityTypes = [];
			me.ethnicityTypeStore = me.cache.register({
				storeId: "ethnicityTypes",
				itemConstructor: fin.adh.EthnicityType,
				itemConstructorArgs: fin.adh.ethnicityTypeArgs,
				injectionArray: me.ethnicityTypes	
			});
			
			me.unionTypes = [];
			me.unionTypeStore = me.cache.register({
				storeId: "unionTypes",
				itemConstructor: fin.adh.UnionType,
				itemConstructorArgs: fin.adh.unionTypeArgs,
				injectionArray: me.unionTypes	
			});	
			
			me.payFrequencyTypes = [];
			me.payFrequencyTypeStore = me.cache.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.adh.PayFrequencyType,
				itemConstructorArgs: fin.adh.payFrequencyTypeArgs,
				injectionArray: me.payFrequencyTypes	
			});
			
			me.i9Types = [];
			me.i9TypeStore = me.cache.register({
				storeId: "i9Types",
				itemConstructor: fin.adh.I9Type,
				itemConstructorArgs: fin.adh.i9TypeArgs,
				injectionArray: me.i9Types	
			});
			
			me.vetTypes = [];
			me.vetTypeStore = me.cache.register({
				storeId: "vetTypes",
				itemConstructor: fin.adh.VetType,
				itemConstructorArgs: fin.adh.vetTypeArgs,
				injectionArray: me.vetTypes	
			});
			
			me.separationCodes = [];
			me.separationCodeStore = me.cache.register({
				storeId: "separationCodes",
				itemConstructor: fin.adh.SeparationCode,
				itemConstructorArgs: fin.adh.separationCodeArgs,
				injectionArray: me.separationCodes	
			});
			
			me.jobStartReasonTypes = [];
			me.jobStartReasonTypeStore = me.cache.register({
				storeId: "jobStartReasonTypes",
				itemConstructor: fin.adh.JobStartReasonType,
				itemConstructorArgs: fin.adh.jobStartReasonTypeArgs,
				injectionArray: me.jobStartReasonTypes
			});

			me.houseCodePayrollCompanys = [];
			me.houseCodePayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.adh.HouseCodePayrollCompany,
				itemConstructorArgs: fin.adh.houseCodePayrollCompanyArgs,
				injectionArray: me.houseCodePayrollCompanys
			});

			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.adh.HouseCodeJob,
				itemConstructorArgs: fin.adh.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.localTaxCodes = [];
			me.localTaxCodeStore = me.cache.register({
				storeId: "localTaxCodePayrollCompanyStates",
				itemConstructor: fin.adh.LocalTaxCode,
				itemConstructorArgs: fin.adh.localTaxCodeArgs,
				injectionArray: me.localTaxCodes	
			});	
			
			me.statusCategoryTypes = [];
			me.statusCategoryTypeStore = me.cache.register({
				storeId: "statusCategoryTypes",
				itemConstructor: fin.adh.StatusCategoryType,
				itemConstructorArgs: fin.adh.statusCategoryTypeArgs,
				injectionArray: me.statusCategoryTypes	
			});	
			
			me.stateAdjustmentTypes = [];
			me.stateAdjustmentTypeStore = me.cache.register({
				storeId: "stateAdjustmentTypes",
				itemConstructor: fin.adh.StateAdjustmentType,
				itemConstructorArgs: fin.adh.stateAdjustmentTypeArgs,
				injectionArray: me.stateAdjustmentTypes	
			});	
			
			me.sdiAdjustmentTypes = [];
			me.sdiAdjustmentTypeStore = me.cache.register({
				storeId: "sdiAdjustmentTypes",
				itemConstructor: fin.adh.SDIAdjustmentType,
				itemConstructorArgs: fin.adh.sdiAdjustmentTypeArgs,
				injectionArray: me.sdiAdjustmentTypes	
			});
			
			me.maritalStatusFederalTaxTypes = [];
			me.maritalStatusFederalTaxTypeStore = me.cache.register({
				storeId: "maritalStatusFederalTaxTypes",
				itemConstructor: fin.adh.MaritalStatusFederalTaxType,
				itemConstructorArgs: fin.adh.maritalStatusFederalTaxTypeArgs,
				injectionArray: me.maritalStatusFederalTaxTypes	
			});
			
			me.genderTypes = [];
			me.genderTypeStore = me.cache.register({
				storeId: "genderTypes",
				itemConstructor: fin.adh.GenderType,
				itemConstructorArgs: fin.adh.genderTypeArgs,
				injectionArray: me.genderTypes	
			});
			
			me.localTaxAdjustmentTypes = [];
			me.localTaxAdjustmentTypeStore = me.cache.register({
				storeId: "localTaxAdjustmentTypes",
				itemConstructor: fin.adh.LocalTaxAdjustmentType,
				itemConstructorArgs: fin.adh.localTaxAdjustmentTypeArgs,
				injectionArray: me.localTaxAdjustmentTypes	
			});
			
			me.maritalStatusStateTaxTypeSecondarys = [];
			me.maritalStatusStateTaxTypeSecondaryStore = me.cache.register({
				storeId: "maritalStatusSecondaryTypes",
				itemConstructor: fin.adh.SecMaritalStatusType,
				itemConstructorArgs: fin.adh.secMaritalStatusTypeArgs,
				injectionArray: me.maritalStatusStateTaxTypeSecondarys	
			});
			
			me.federalAdjustments = [];
			me.federalAdjustmentStore = me.cache.register({
				storeId: "federalAdjustmentTypes",
				itemConstructor: fin.adh.FederalAdjustment,
				itemConstructorArgs: fin.adh.federalAdjustmentArgs,
				injectionArray: me.federalAdjustments	
			});
			
			me.payrollCompanies = [];
			me.payrollCompanyStore = me.cache.register({
				storeId: "payrollCompanys",
				itemConstructor: fin.adh.PayrollCompany,
				itemConstructorArgs: fin.adh.payrollCompanyArgs,
				injectionArray: me.payrollCompanies
			});	
			
			me.basicLifeIndicatorTypes = [];
			me.basicLifeIndicatorTypeStore = me.cache.register({
				storeId: "basicLifeIndicatorTypes",
				itemConstructor: fin.adh.BasicLifeIndicatorType,
				itemConstructorArgs: fin.adh.basicLifeIndicatorTypeArgs,
				injectionArray: me.basicLifeIndicatorTypes
			});
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.adh.EmployeeGeneral,
				itemConstructorArgs: fin.adh.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
			
			// User Types
			me.userRoles = [];
			me.userRoleStore = me.cache.register({
				storeId: "appUserRoles",
				itemConstructor: fin.adh.UserRole,
				itemConstructorArgs: fin.adh.userRoleArgs,
				injectionArray: me.userRoles
			});
			
			// Invoice Types
			me.invoiceBillTos = [];
            me.invoiceBillToStore = me.cache.register({
                storeId: "revInvoiceBillTos",
                itemConstructor: fin.adh.InvoiceBillTo,
                itemConstructorArgs: fin.adh.invoiceBillToArgs,
                injectionArray: me.invoiceBillTos
            });
			
			me.transactionStatusTypes = [];
			me.transactionStatusTypeStore = me.cache.register({
				storeId: "appTransactionStatusTypes",
				itemConstructor: fin.adh.TransactionStatusType,
				itemConstructorArgs: fin.adh.transactionStatusTypeArgs,
				injectionArray: me.transactionStatusTypes	
			});
		},
		
		resizeControls: function() {
			var me = this;
			
			me.report.resizeText();
			me.resize();
		},
		
		typeNoneAdd: function () {
			var args = ii.args(arguments, {
				data: {type: [Object]}
				, title: {type: String, required: false, defaultValue: ""}
			});			
			var me = this;
			
			//index > 0, condition is included as some droplist already has None as type in it.
			var index = me.findIndexByTitle(args.title, args.data);
			if (index == null || index > 0) 
				args.data.unshift({ id: 0, name: args.title });
		},
		
		findIndexByTitle: function ii_ajax_util_findIndexByTitle() {
			var args = ii.args(arguments, {
				title: {type: String}		// The id to use to find the object.
				, data: {type: [Object]}	// The data array to be searched.
			});		
			var title = args.title;
			var data = args.data;
			var name = "";
			
			for (var index = 0; index < data.length; index++ ) {
				if (data[index].name != undefined)
						name = data[index].name;
					else
					    name = data[index].title;
	
				if (name.toLowerCase() == title.toLowerCase()) {
					return index; 
				}
			}

			return null;
		},
		
		typesLoaded: function(me, activeId) {

		},
		
		siteMastersLoaded: function(me, activeId) {

		},
		
		houseCodeServiceLoaded: function(me, activeId) {
			
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
		},
		
		stateTypesLoaded: function(me, activeId) {
			
			me.contractTypeStore.fetch("userId:[user]", me.contractTypesLoaded, me);				
		},
		
		contractTypesLoaded: function(me, activeId) {
			
			me.payPayrollCompanyStore.fetch("userId:[user]", me.payPayrollCompanysLoaded, me);	
		},
		
		payPayrollCompanysLoaded: function(me, activeId) {
			
			me.jdeCompanysStore.fetch("userId:[user]", me.jdeCompanysLoaded, me);
		},
		
		jdeCompanysLoaded: function(me, activeId) {
			
			me.reportStore.fetch("userId:[user],active:1", me.reportLoaded, me);
		},
		
		maritalStatusTypesLoaded: function(me, activeId) {

			me.typesLoadedCount--;
			me.checkTypesLoaded();
		},
		
		reportLoaded: function(me, activeId) {	
			var found = true;
			
			while (found) {
				found = false;
				for (var index = 0; index < me.reports.length; index++) {
					if (!parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\" + me.reports[index].name)) {
						me.reports.splice(index, 1);
						found = true;
						break;
					}
				}
			}

			me.typeNoneAdd(me.reports, "None");	
			me.report.setData(me.reports);
			me.report.select(0, me.report.focused);
			me.resizeControls();
			me.userStore.fetch("userId:[user]", me.loggedInUsersLoaded, me);
		},
		
		loggedInUsersLoaded: function(me, activeId) {

			if (me.users.length == 0) {
				ii.trace("Failed to load logged-in user information.", ii.traceTypes.Information, "Info");
				return false;
			}
			
			for (var index = 0; index < me.roles.length; index++) {
				if (me.roles[index].id == me.users[0].roleCurrent) {
					me.hirNodeCurrentId = me.roles[index].hirNodeCurrent;
					break;
				}
			}

			me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirOrgsLoaded, me);
		},
		
		hirOrgsLoaded: function (me, activeId) {
			
			if (me.hirOrgs.length == 0) {
				$("#messageToUser").html("Load Failed.");
				$("#pageLoading").show();
				ii.trace("Could not fetch required [Org Info].", ii.traceTypes.errorUserAffected, "Error");
				return false;
			}

			$("#hirOrg").html("");
			$("#pageLoading").hide();
		
			me.orgHierarchy = new ui.ctl.Hierarchy({
				nodeStore: me.hirOrgStore,
				domId: "hirOrg", //OrganizationHierarchy
				baseClass: "iiHierarchy",
				actionLevel: 9,
				actionCallback: function(node) { me.hirNodeCallBack(node); },
				topNode: me.hirOrgs[0],
				currentNode: ii.ajax.util.findItemById(me.hirNodeCurrentId.toString(), me.hirOrgs),
				hasSelectedState: false,
				multiSelect: true
			});	
			
			if (me.searchNode) {
				me.searchNode = false;
				var orgNodes = [];
				var node = me.orgHierarchy.currentNode;
				var item = new fin.adh.HirNode({ id: node.id, number: node.id, fullPath: node.fullPath });
				orgNodes.push(item);
				me.orgHierarchy.setData(orgNodes);
			}
			
			ii.trace("Org/Management Nodes Loaded.", ii.traceTypes.Information, "Info");
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object}  // The (key) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.actionUnitLoad();
			}
		},
		
		actionUnitLoad: function() {
			var me = this;
			var searchText = me.appUnit.getValue();
			var found = false;

			if (searchText == "")
				return;

			for (var index = 0; index < me.hirOrgs.length; index++) {
				if (me.hirOrgs[index].brief == searchText) {
					me.appUnit.setValue(me.hirOrgs[index].title);
					me.hirNodeCurrentId = me.hirOrgs[index].id;
					found = true;
					break;
				}
			}

			if (found) {
				me.searchNode = true;
				me.hirOrgsLoaded(me, 0);
			}
			else {
				$("#AppUnitText").addClass("Loading");			
				me.unitStore.fetch("userId:[user],unitBrief:" + searchText + ",", me.actionUnitsLoaded, me);
			}						
		},
		
		actionUnitsLoaded: function(me, activeId) {

			$("#AppUnitText").removeClass("Loading");

			if (me.units.length <= 0) {
				ii.trace("Could not load the said Unit.", ii.traceTypes.Information, "Info");
				alert("There is no corresponding Unit available or you do not have enough permission to access it.");
				return;
			}

			me.appUnit.setValue(me.units[0].description);
			me.hirNodeCurrentId = me.units[0].hirNode;

			$("#messageToUser").html("Loading");
			$("#pageLoading").show();
			ii.trace("Organization Nodes Loading", ii.traceTypes.Information, "Info");
			me.searchNode = true;
			me.hirOrgLoad("search");
		},

		hirOrgLoad: function() {
			var args = ii.args(arguments, {
				flag: {type: String, required: false}
			});				
			var me = this;
			
			me.actionClearItem(true);			
			me.hirOrgStore.reset();
			
			if (args.flag)
				me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirOrgsLoaded, me);
			else
				me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirOrgsLoaded, me);

			ii.trace("Organization Nodes Loading", ii.traceTypes.Information, "Info");
		},
		
		actionSearchSite: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.site.fetchingData();
				me.siteTypeStore.reset();
				me.siteTypeStore.fetch("userId:[user],title:" + me.site.text.value, me.siteTypesLoaded, me);
			}
		},	
		
		siteTypesLoaded: function(me, activeId) {
            
			me.site.reset();
			me.site.setData(me.siteTypes);
			
			if (me.siteTypes.length > 0)
				me.site.select(0, me.site.focused);
		},
		
		reportChange: function() {
			var me = this;
			
			if (me.report.indexSelected >= 0) {
				$("#messageToUser").html("Loading");
				$("#pageLoading").show();
				me.reportId = me.reports[me.report.indexSelected].id;
				me.reportName = me.reports[me.report.indexSelected].name;
				me.reportFilterStore.fetch("userId:[user],report:" + me.reportId + ",", me.reportFiltersLoaded, me);
			}
			
			if (me.report.indexSelected > 0)
				me.anchorLoad.display(ui.cmn.behaviorStates.enabled);
			else
				me.anchorLoad.display(ui.cmn.behaviorStates.disabled);
		},
		
		reportFiltersLoaded: function(me, activeId) {
			var tableName = "";
			var columnName = "";

			me.typeTableFound = false;
//			me.typesLoadedCount = 0;
//
//			for (var index = 0; index < me.reportFilters.length; index++) {
//
//				tableName = me.reportFilters[index].referenceTableName;
//				columnName = me.reportFilters[index].title;
//
//				if (tableName != "") {
//					if (tableName == "EmpMaritalStatusTypes") {
//						if (me.maritalStatusTypeStore.fetchedCriteria["storeId:maritalStatusTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.maritalStatusTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpStatusTypes") {
//						if (me.statusTypeStore.fetchedCriteria["storeId:statusTypes,userId:[user],personId:0,"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.statusTypeStore.fetch("userId:[user],personId:0,", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpDeviceGroupTypes") {
//						if (me.deviceGroupStore.fetchedCriteria["storeId:deviceGroupTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.deviceGroupStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpJobCodeTypes") {
//						if (me.jobCodeStore.fetchedCriteria["storeId:jobCodes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.jobCodeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpRateChangeReasonTypes") {
//						if (me.rateChangeReasonStore.fetchedCriteria["storeId:rateChangeReasons,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.rateChangeReasonStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpTerminationReasonTypes") {
//						if (me.terminationReasonStore.fetchedCriteria["storeId:terminationReasons,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.terminationReasonStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpWorkShifts") {
//						if (me.workShiftStore.fetchedCriteria["storeId:workShifts,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.workShiftStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpEthnicityTypes") {
//						if (me.ethnicityTypeStore.fetchedCriteria["storeId:ethnicityTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.ethnicityTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpUnionTypes") {
//						if (me.unionTypeStore.fetchedCriteria["storeId:unionTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.unionTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "PayPayFrequencyTypes") {
//						if (me.payFrequencyTypeStore.fetchedCriteria["storeId:frequencyTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.payFrequencyTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
////					else if (tableName == "EmpSeparationCodes") {
////						if (me.separationCodeStore.fetchedCriteria["storeId:separationCodes,userId:[user],terminationType:0,"] != ii.ajax.fetchStatusTypes.fetched) {
////							me.typeTableFound = true;
////							me.typesLoadedCount++;
////							me.separationCodeStore.fetch("userId:[user],terminationType:0,", me.maritalStatusTypesLoaded, me);
////						}
////					}
//					else if (tableName == "EmpJobStartReasonTypes") {
//						if (me.jobStartReasonTypeStore.fetchedCriteria["storeId:jobStartReasonTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.jobStartReasonTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpI9Types") {
//						if (me.i9TypeStore.fetchedCriteria["storeId:i9Types,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.i9TypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "EmpVetTypes") {
//						if (me.vetTypeStore.fetchedCriteria["storeId:vetTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.vetTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
////					else if (tableName == "EmpStatusCategoryTypes") {
////						if (me.statusCategoryTypeStore.fetchedCriteria["storeId:statusCategoryTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
////							me.typeTableFound = true;
////							me.typesLoadedCount++;
////							me.statusCategoryTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
////						}
////					}
////					else if (tableName == "EmpStateAdjustmentTypes") {
////						if (me.stateAdjustmentTypeStore.fetchedCriteria["storeId:stateAdjustmentTypes,appState:0,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
////							me.typeTableFound = true;
////							me.typesLoadedCount++;
////							me.stateAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
////						}
////					}
////					else if (tableName == "EmpSDIAdjustmentTypes") {
////						if (me.sdiAdjustmentTypeStore.fetchedCriteria["storeId:sdiAdjustmentTypes,appState:0,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
////							me.typeTableFound = true;
////							me.typesLoadedCount++;
////							me.sdiAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
////						}
////					}
//					else if (tableName == "EmpMaritalStatusFederalTaxTypes") {
//						if (me.maritalStatusFederalTaxTypeStore.fetchedCriteria["storeId:maritalStatusFederalTaxTypes,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.maritalStatusFederalTaxTypeStore.fetch("userId:[user],", me.maritalStatusTypesLoaded, me);
//						}
//					}
////					else if (tableName == "EmpLocalTaxAdjustmentTypes") {
////						if (me.localTaxAdjustmentTypeStore.fetchedCriteria["storeId:localTaxAdjustmentTypes,appState:0,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
////							me.typeTableFound = true;
////							me.typesLoadedCount++;
////							me.localTaxAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.maritalStatusTypesLoaded, me);
////						}
////					}
//					else if (tableName == "EmpFederalAdjustmentTypes") {
//						if (me.federalAdjustmentStore.fetchedCriteria["storeId:employeePayrollMasters,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.federalAdjustmentStore.fetch("userId:[user]", me.maritalStatusTypesLoaded, me);
//						}
//					}
//					else if (tableName == "PayPayrollCompanies") {
//						if (me.payrollCompanyStore.fetchedCriteria["storeId:payrollCompanys,userId:[user],"] != ii.ajax.fetchStatusTypes.fetched) {
//							me.typeTableFound = true;
//							me.typesLoadedCount++;
//							me.payrollCompanyStore.fetch("userId:[user]", me.maritalStatusTypesLoaded, me);
//						}
//					}
//				}
//			}
			
			if (!me.typeTableFound)
				me.setReportFilters();
		},
		
		checkTypesLoaded: function() {
			var me = this;
			
			if (me.typesLoadedCount <= 0)
				me.setReportFilters();
		},
		
		setReportFilters: function() {
			var me = this;
			
			var rowData = "<tr id='filterHeader'><td colspan='3' height='24px'></td></tr>";
			var dateControls = [];
			
			if (me.reportFilters.length > 0) {
				rowData = "<tr id='filterHeader'><td colspan='3' class='header'>Filter</td></tr>";  

				for (var index = 0; index < me.reportFilters.length; index++) {
					rowData += "<tr>";
					rowData += "<td class='filterLabel' align='left'>" + me.reportFilters[index].name + ':' + "</td>";
					
					if (me.reportFilters[index].referenceTableName == "") {
						contorlValidation = me.reportFilters[index].validation;
						if (contorlValidation == "bit") {
							//rowData += "<td align='left'><input type='checkbox' name='" + me.reportFilters[index].title + "' id='" + me.reportFilters[index].title + "'></input></td>";
							rowData += "<td align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'bit') + "</td>";
						}
						else if (contorlValidation.toLowerCase() == "datetime" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'datetime') + "</td>";
							rowData += "<td align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "datetime" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "int" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'int') + "</td>";
							rowData += "<td align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "int" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "decimal" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'decimal') + "</td>";
							rowData += "<td align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "decimal" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'text') + "</td>";
							rowData += "<td align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else {
							rowData += "<td align='left' colspan='2'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input></td>";
						}
					}
					else 
						rowData += "<td align='left' colspan='2'>" + me.populateFilterDropDown(me.reportFilters[index].referenceTableName, me.reportFilters[index].title) + "</td>";
					rowData += "</tr>"
				}
			}

			$("#AdhReportFilterGridBody").html(rowData);
			
			for (var index = 0; index < me.reportFilters.length; index++) {
				if (me.reportFilters[index].validation.toLowerCase() == "datetime") {
					$("#" + me.reportFilters[index].title).datepicker({
						changeMonth: true,
						changeYear: true
					});
					
					$("#" + me.reportFilters[index].title + "_1").datepicker({
						changeMonth: true,
						changeYear: true
					});
				}
			}
			
			for (var index = 0; index < dateControls.length; index++) {				
				$("#" + dateControls[index]).datepicker({
					changeMonth: true,
					changeYear: true
				});
			}

			$("#pageLoading").hide();
		},
		
		showColumnNames: function() {
			var me = this;

			$("#actualColumnName").toggle();

			if ($("#actualColumnName").is(':visible')) {
				$("#DivAdhReportGridHeader").height(60);
				$("#divAdhReportGrid").height($(window).height() - 158);
			}				
			else {
				$("#DivAdhReportGridHeader").height(30);
				$("#divAdhReportGrid").height($(window).height() - 145);
			}
		},		
		
		actionLoadItem: function() {
			var me = this;

			me.delimitedOrgSelectedNodes = "";

			if (me.report.indexSelected <= 0) {
				alert("Please select valid Report.");
				return;
			}
			
			for (var index in me.orgHierarchy.selectedNodes) {
				orgHierarchy = me.orgHierarchy.selectedNodes[index];
				if (orgHierarchy)
					me.delimitedOrgSelectedNodes += orgHierarchy.id.toString() + "#";
			}
			
			if (me.delimitedOrgSelectedNodes == "") {
				alert("Please select correct House Code.");
				return;
			}
			
			$("#AdhReportGrid").show();
			$("#ReportHierarchy").hide();
			$("#messageToUser").html("Loading");
			$("#pageLoading").show();
			
			me.reportId = me.reports[me.report.indexSelected].id;
			me.reportName = me.reports[me.report.indexSelected].name;	
			me.moduleAssociate = me.reports[me.report.indexSelected].moduleAssociate;	

			me.moduleColumnHeaderStore.fetch("userId:[user],report:"+ me.reportId + ",", me.moduleColumnHeaderLoaded, me);	
			me.actionSaveItem("audit");	
		},
		
		moduleColumnHeaderLoaded: function(me, activeId) {
			
			var rowData = "";
			var className = "gridHeaderColumn";
			var width = (me.moduleColumnHeaders.length * 20);
			
			for (var index = 0; index < me.moduleColumnHeaders.length; index++) {
				if (me.moduleColumnHeaders[index].columnType != 2)
					width += me.moduleColumnHeaders[index].columnWidth;
			}
			
			if (width < $(window).width()) {
				$("#tblAdhReportGridHeader").width($(window).width() - 40);
				$("#tblAdhReportGrid").width($(window).width() - 40);
			}
			else {
				$("#tblAdhReportGridHeader").width(width);
				$("#tblAdhReportGrid").width(width);
			}

			$("#DivAdhReportGridHeader").height(40);
			$("#divAdhReportGrid").height($(window).height() - 145);
			
			me.sortColumns = "";

			if (me.moduleColumnHeaders.length > 0) {
				rowData += "<tr id='trAdhReportItemGridHead' height='40px'>";	
				rowData += "<th onclick=(fin.reportUi.sortColumn(-1)); class='gridHeaderColumn' style='width:100px;'>House Code</th>";

				for (var index = 0; index < me.moduleColumnHeaders.length; index++) {
					if (me.moduleColumnHeaders[index].columnType == 2)
						className = "gridColumnHidden";
					else
						className = "gridHeaderColumn";
					if (index == me.moduleColumnHeaders.length - 1)
						className = "gridHeaderColumnRight";
					rowData += "<th onclick=(fin.reportUi.sortColumn(" + index + ")); class='" + className + "' style='width:" + me.moduleColumnHeaders[index].columnWidth + "px;'>" + me.moduleColumnHeaders[index].description + "</th>";
					if (me.moduleColumnHeaders[index].sortOrder != "")
						me.sortColumns = me.sortColumns + me.moduleColumnHeaders[index].title + "#" + me.moduleColumnHeaders[index].sortOrder + "|";
				}

				rowData += "<th class='gridColumnHidden'></th></tr>";

//				rowData += "<tr id='actualColumnName' style='display:none' height='30px'>";
//				rowData += "<th class='gridHeaderColumnSub'>AppUniBrief</th>";
//				className = "gridHeaderColumnSub";
//
//				for (var index = 0; index < me.moduleColumnHeaders.length; index++) {
//					if (me.moduleColumnHeaders[index].title == "AppUnit")
//						me.moduleColumnHeaders[index].title = "AppSitTitle";
//					if (index == me.moduleColumnHeaders.length - 1)
//						className = "gridHeaderColumnSubRight";
//					rowData += "<th class='" + className + "'>" + me.moduleColumnHeaders[index].title + "</th>";                                
//				}
//				rowData += "<th class='gridColumnHidden'>AppSite</th></tr>";
			}

			$("#AdhReportItemGridHead").html(rowData);
			
			me.filter = "";
			
			for (var index = 0; index < me.reportFilters.length; index++) {
				if (me.reportFilters[index].validation.toLowerCase() == "bit" && $("#sel" + me.reportFilters[index].title).val() != "") {
					me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#sel" + me.reportFilters[index].title).val() + "')";
				}
				else if ($("#" + me.reportFilters[index].title).val() != "") {
					if ($("#" + me.reportFilters[index].title).val() != "0") {
						if (me.reportFilters[index].referenceTableName != "") { //dropdown selection
							me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = " + $("#" + me.reportFilters[index].title).val() + ")";
						}
						else if (me.reportFilters[index].validation.toLowerCase() == "datetime") {
							if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 2) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <= '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 3) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " >= '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#" + me.reportFilters[index].title + "_1").val() != "" && $("#sel" + me.reportFilters[index].title).val() == 4) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Between '" + $("#" + me.reportFilters[index].title).val() + "' And '" + $("#" + me.reportFilters[index].title + "_1").val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 5) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <> '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
						}
						else if (me.reportFilters[index].validation.toLowerCase() == "int"  || me.reportFilters[index].validation.toLowerCase() == "decimal") {
							if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 2) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <= '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 3) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " >= '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#" + me.reportFilters[index].title + "_1").val() != "" && $("#sel" + me.reportFilters[index].title).val() == 4) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Between '" + $("#" + me.reportFilters[index].title).val() + "' And '" + $("#" + me.reportFilters[index].title + "_1").val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 5) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <> '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
						}
						else if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar") {
							if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "')";
							}
							else if ($("#sel" + me.reportFilters[index].title).val() == 2) {
								me.filter += " And (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Like '%" + $("#" + me.reportFilters[index].title).val() + "%')";
							}
						}
					}
				}
			}
			
			me.reportTotalRowStore.fetch("userId:[user],report:" + me.reportId 
				+ ",hirNode:" + me.delimitedOrgSelectedNodes 
				+ ",filter:" + me.filter
				+ ",", me.recordCountsLoaded, me);	
			
			me.loadModuleColumnData();
		},

		loadModuleColumnData: function() {
			var me = this;

			if (me.sortColumns == "")
				me.sortColumns = "HcmHouseCodes.HcmHouseCode#Asc|";

			$("#messageToUser").html("Loading");
			$("#pageLoading").show();
			
			me.moduleColumnDataStore.reset();
			me.moduleColumnDataStore.fetch("userId:[user],report:" + me.reportId 
				+ ",hirNode:" + me.delimitedOrgSelectedNodes 
				+ ",filter:" + me.filter
				+ ",startPoint:" + me.startPoint
				+ ",endPoint:" +  me.endPoint
				+ ",sortColumns:" +  me.sortColumns
				+ ",", me.moduleColumnDataLoaded, me);	
		},
		
		moduleColumnDataLoaded: function(me, activeId) {
			var rowData = "" ;     		
			
			me.gridData = [];
			
			if (me.moduleColumnDatas.length > 0) {
				for(var index = 0; index < me.moduleColumnDatas.length; index++) {
					var rowDetails = me.moduleColumnDatas[index].columnData.split("|");
					var pkId = me.moduleColumnDatas[index].primeColumn;
					var houseCode = me.moduleColumnDatas[index].houseCode;
					var houseCodeId = fin.reportUi.moduleColumnDatas[index].houseCodeId;
					var appSite = me.moduleColumnDatas[index].appSite;
					var appSitTitle = me.moduleColumnDatas[index].appSitTitle;

					rowData += "<tr id='adhReportDataRow" + pkId + "' onclick=(fin.reportUi.getAdhReprotGridRowEdit(" + pkId + "," + index + "," + houseCodeId + "));>";	
					rowData += me.getAdhReprotDetailGridRow(rowDetails, pkId, houseCode, appSite, appSitTitle);
					rowData += "</tr>"		
				}				
			}

			rowData += '<tr height="100%"><td id="tdLastRow" colspan="' + (me.moduleColumnHeaders.length + 2) + '" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';

			$("#AdhReportItemGridBody").html(rowData);
			$("#AdhReportItemGridBody tr:odd").addClass("gridRow");
        	$("#AdhReportItemGridBody tr:even").addClass("alternateGridRow");
			$("#AdhReportItemGridBody tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});

			$("#pageLoading").hide();	
		},
		
		getAdhReprotDetailGridRow: function() {			
			var args = ii.args(arguments, {
				rowDetails: {type: [String]}
				, pkId: {type: Number}
				, houseCode: {type: String}
			    , appSite: {type: Number}
				, appSitTitle: {type: String}
			});
			var me = this;
			var pairs = args.rowDetails;
			var keyValue = {}; 
			var rowData = "";
			var dataValue = "";
			var className = "gridColumn";

			me.gridData[args.pkId] = {};
			me.gridData[args.pkId].buildQueue = [];

			rowData += "<td id='HouseCode" + args.houseCode + "' class='gridColumn' style='width:100px;'>" + args.houseCode + "</td>";

			for (var index = 0; index < pairs.length; index++) { 
				var pos = pairs[index].indexOf("=");
				var posTypeTable = pairs[index].indexOf("_");
				var typeTable = "";
				var columnName = "";

				if (pos == -1) continue;

				var argName = pairs[index].substring(0, pos); 
				var value = "";
				
				if (argName == "AppUnit")
					value = unescape(args.appSitTitle);
				else
					value = unescape(pairs[index].substring(pos + 1));

				if (posTypeTable > 0) {
					columnName = pairs[index].substring(0, posTypeTable);
					typeTable = pairs[index].substring(posTypeTable + 1, pos);
					
					var typeTableData = me.getTypeTableData(typeTable, columnName);
					var itemIndex = me.findIndexByTitle(value, typeTableData);
					if (itemIndex != null)
						keyValue[columnName] = typeTableData[itemIndex].id;
					else
						keyValue[columnName] = -1;
				}				
				else {
					columnName = argName;
					keyValue[columnName] = value;
				}
				
				if (me.gridData[args.pkId].buildQueue.length == 0)
					me.gridData[args.pkId].buildQueue.push(keyValue);
				else
					me.gridData[args.pkId].buildQueue[0][columnName] = keyValue[columnName];
					
				me.columnValidation = me.moduleColumnHeaders[index].columnValidation;
				me.columnType = me.moduleColumnHeaders[index].columnType;

				if (me.columnValidation.toLowerCase() == "phone")
					dataValue = fin.cmn.text.mask.phone(value);
				else if (me.columnValidation.toLowerCase() == "datetime" && value == "01/01/1900")
					dataValue = "";
				else
					dataValue = value;

				if (index == pairs.length - 1)
					className = "gridColumnRight";

				if (me.columnType == 2) //Hidden
					rowData += "<td id=" + argName + " class='gridColumnHidden' style='width:" + me.moduleColumnHeaders[index].columnWidth + "px;'>&nbsp;</td>";
				else
					rowData += "<td id=" + argName + " class='" + className + "' style='width:" + me.moduleColumnHeaders[index].columnWidth + "px;'>" + dataValue + "</td>";
			}

			rowData += "<td id='AppSite' class='gridColumnHidden'>" + args.appSite + "</td>";
			return rowData;	
		},
		
		getAdhReprotGridRowEdit: function() {
			var args = ii.args(arguments, {
				pkId: {type: Number}
				, rowIndex: {type: Number}
				, houseCodeId: {type: Number}
			});
			var me = this;
			var rowData = "";
			var argTypeTable = "";
			var argName = "";
			var argValue = "";
			var posTTable = 0;
			var argscolumn = "";
			var rowsData = "";
			var dateControls = [];
			var dataValue = "";
			var appUnitId = "";
			var appUnitValue = "";
			var appSiteId = "";
			var columnWidth = 0;
			var columnLength = 0;
			var className = "gridColumn";
			var pkId = args.pkId;
			var rowIndex = args.rowIndex;
			var houseCodeId = args.houseCodeId;

			me.loadDependentTypes = [];
			me.typesLoadedCount = 0;

			if (me.moduleColumnDatas[rowIndex] == undefined || me.moduleColumnDatas[rowIndex].modified) 
				return;
	
			me.moduleColumnDatas[rowIndex].modified = true;
			me.rowModifed = true;

			var row = $("#adhReportDataRow" + pkId);

			for (var index = 0; index < row[0].cells.length; index++) {
				//index 0 for HouseCode. This addition
				var style = "";
				if (row[0].cells[index].attributes["style"] != undefined)
					style = row[0].cells[index].attributes["style"].value;
				me.columnType = 0;
				rowData = "";
				argValue = ui.cmn.text.xml.decode(row[0].cells[index].innerHTML);
				className = row[0].cells[index].className;
				
				if (row[0].cells[index].id == "RevInvBillTo") 
					row[0].cells[index].id = "RevInvBillTo_RevInvBillTos";
					
				argscolumn = row[0].cells[index].id;
				posTTable = argscolumn.indexOf("_");

				if (index > 0) {
					if (argscolumn != "" && argscolumn != "AppSite"){
						me.columnValidation = me.moduleColumnHeaders[index - 1].columnValidation;
						me.columnType = me.moduleColumnHeaders[index - 1].columnType;
						columnWidth = me.moduleColumnHeaders[index - 1].columnWidth - 8;
						columnLength = me.moduleColumnHeaders[index - 1].columnLength;
					}
				}
				if (argscolumn == "AppUnit") {
					appUnitValue = row[0].cells[index].innerHTML;
					me.columnValidation = "";
					appUnitId = "AppUnit" + "_" + pkId;
				}
				if (argscolumn == "AppSite")
					appSiteId = argscolumn + "_" + pkId;
				
				if (posTTable > 0) {
					argName = argscolumn.substring(0, posTTable);
					argTypeTable = argscolumn.substring(posTTable + 1, argscolumn.length);

					switch (me.columnType) {
						case 1: //Editable
							rowData += "<td class='" + className + "' style='" + style + "'>" + me.populateDropDown(argTypeTable, argName, argValue, pkId, houseCodeId, columnWidth) + "</td>";
							break;
							
						case 2: //Hidden
							rowData = "<td class='gridColumnHidden' align='left' style='" + style + "'>&nbsp;</td>";
							break;

						case 3: //ReadOnly
							rowData += "<td class='" + className + "' align='left' style='" + style + "'>" + argValue + "</td>";
							break;
					}
				}
				else {
					argName = argscolumn.substring(0, argscolumn.length) + "_" + pkId;
					argTypeTable = "";
					
					if (me.isDate(argValue) || me.columnValidation.toLowerCase() == "datetime")
						dateControls.push(argName);
					
					if (me.columnValidation.toLowerCase() == "phone")
						dataValue = fin.cmn.text.mask.phone(argValue);
					else 
						dataValue = argValue;
					
					switch (me.columnType) {
						case 1: //Editable
							if (me.columnValidation.toLowerCase() == "bit")
								rowData = "<td class='" + className + "' align='center' style='" + style + "'><input type='checkbox' name='" + argName + "' id='" + argName + "' value='" + dataValue + "'" + (dataValue == "1" ? checked='checked' : '') + "></input></td>";
							else
								rowData = "<td class='" + className + "' style='" + style + "'><input type='text' style='width:" + columnWidth + "px;' onblur=fin.reportUi.dataValidation(\'" + fin.reportUi.columnValidation + "\',\'" + argName + "\'); id='" + argName + "' value='" + dataValue + "' maxlength='" + columnLength + "'></input></td>";
							break;
							
						case 2: //Hidden
							rowData += "<td class='gridColumnHidden' align='left' style='" + style + "'>&nbsp;</td>";
							break;
							
						case 3: //ReadOnly
							rowData += "<td class='" + className + "' align='left' style='" + style + "'>" + dataValue + "</td>";
							break;
							
						default: 
							if (argscolumn == "AppSite")
								rowData += "<td class='gridColumnHidden' align='left'><input type='text' id='" + argName + "' value='" + dataValue + "'></input></td>";	
							else
								rowData += "<td class='" + className + "' align='left' style='" + style + "'>" + dataValue + "</td>";
							break;	
					}
				}	
				rowsData += rowData;
			}

			row.html(rowsData);			
			
			for (var index = 0; index < dateControls.length; index++) {
				$("#" + dateControls[index]).datepicker({
					changeMonth: true,
					changeYear: true
				});
			}

			if (appUnitId != "") {
				$("#" + appUnitId).attr("readonly", true);
				$("#" + appUnitId).click(function() {
					me.selectedAppUnitId = appUnitId;
					me.selectedAppSiteId = appSiteId;
					loadPopup();
					me.site.resizeText();

					var tempSiteId = parseInt($("#" + me.selectedAppSiteId).val(), 10);
					var found = false;
					for (var index = 0; index < me.siteTypes.length; index++) {
						if (tempSiteId == me.siteTypes[index].id) {
							found = true;
							break;
						}
					}

					if (!found) {
						var item = new fin.adh.SiteType(tempSiteId, tempSiteId, appUnitValue);
						me.siteTypes.push(item);
						me.site.setData(me.siteTypes);
					}

					var itemIndex = ii.ajax.util.findIndexById(tempSiteId.toString(), me.siteTypes);
					if (itemIndex >= 0 && itemIndex != undefined)
						me.site.select(itemIndex, me.site.focused);
				});
			}

			for (var index = 0; index < me.loadDependentTypes.length; index++) {
				var rowId = me.loadDependentTypes[index].rowId;
				var columnName = me.loadDependentTypes[index].columnName;
				var columnValue = me.loadDependentTypes[index].columnValue;
				var searchValue = me.loadDependentTypes[index].searchValue;

				switch (columnName) {

					case "AppRoleCurrent": 
						me.userRoleCheck(rowId, searchValue, columnValue);
						break;

					case "EmpStatusCategoryType": 
						me.statusTypeCheck(rowId, searchValue, columnValue);
						break;

					case "HcmHouseCodeJob":
						me.houseCodeJobCheck(rowId, searchValue, columnValue);
						break;

					case "PayPayrollCompany": 
						me.payrollCompanyCheck(rowId, searchValue, columnValue);
						break;

					case "EmpSeparationCode":
						me.terminationReasonTypeCheck(rowId, searchValue, columnValue);
						break;

					case "EmpMaritalStatusStateTaxTypeSecondary":
						me.stateCheck(rowId, searchValue, false, columnName, columnValue);
						break;
						
					case "RevInvBillTo":
						me.invBillToCheck(rowId, searchValue, columnValue);
						break;
						
					default:
						if (columnName == "EmpEmpgLocalTaxCode1" || columnName == "EmpEmpgLocalTaxCode2" || columnName == "EmpEmpgLocalTaxCode3") 
			 				me.localTaxCodeCheck(rowId, searchValue, me.loadDependentTypes[index].payPayrollCompany, columnName, columnValue);
						else if (columnName == "EmpMaritalStatusStateTaxTypePrimary" || columnName == "EmpStateAdjustmentType" || columnName == "EmpSDIAdjustmentType" || columnName == "EmpLocalTaxAdjustmentType")
							me.stateCheck(rowId, searchValue, true, columnName, columnValue);
				}
			}
		},
		
		populateDropDown: function() {
			var args = ii.args(arguments, {
				typeTable: {type: String}
				, columnName: {type: String}
				, columnValue: {type: String}
				, pkId: {type: Number}
				, houseCodeId: {type: Number}
				, columnWidth: {type: Number}
			});
			var me = this;
			var rowHtml = "";
			var title = "";
			var typeTableData = [];
			var typeTable = {};
			var dependentTypeFound = false;
			var columnWidth = args.columnWidth;

			if (args.columnName == "AppRoleCurrent" || args.columnName == "PayPayrollCompany" || args.columnName == "HcmHouseCodeJob" 
				|| args.columnName == "EmpStatusCategoryType" || args.columnName == "EmpSeparationCode"
				|| args.columnName == "EmpEmpgLocalTaxCode1" || args.columnName == "EmpEmpgLocalTaxCode2" || args.columnName == "EmpEmpgLocalTaxCode3"
				|| args.columnName == "EmpMaritalStatusStateTaxTypePrimary" || args.columnName == "EmpMaritalStatusStateTaxTypeSecondary"
				|| args.columnName == "EmpStateAdjustmentType" || args.columnName == "EmpSDIAdjustmentType" || args.columnName == "EmpLocalTaxAdjustmentType"
				|| args.columnName == "RevInvBillTo"
			) {				
				typeTable.rowId = args.pkId;
			    typeTable.columnName = args.columnName;
				typeTable.columnValue = args.columnValue;

				if (args.columnName == "AppRoleCurrent")
					typeTable.searchValue = args.pkId;
				else if (args.columnName == "PayPayrollCompany" || args.columnName == "HcmHouseCodeJob")
					typeTable.searchValue = args.houseCodeId;
				else if (args.columnName == "EmpStatusCategoryType")
					typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["EmpStatusType"];
				else if (args.columnName == "EmpSeparationCode")
	 				typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["EmpTerminationReasonType"];
				else if (args.columnName == "EmpEmpgLocalTaxCode1" || args.columnName == "EmpEmpgLocalTaxCode2" || args.columnName == "EmpEmpgLocalTaxCode3") {
					typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["EmpEmpgPrimaryState"];
					typeTable.payPayrollCompany = me.gridData[args.pkId].buildQueue[0]["PayPayrollCompany"];
				}	 				
				else if (args.columnName == "EmpMaritalStatusStateTaxTypePrimary" || args.columnName == "EmpStateAdjustmentType" || args.columnName == "EmpSDIAdjustmentType" || args.columnName == "EmpLocalTaxAdjustmentType")
					typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["EmpEmpgPrimaryState"];
				else if (args.columnName == "EmpMaritalStatusStateTaxTypeSecondary")
	 				typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["EmpEmpgSecondaryState"];
				else if (args.columnName == "RevInvBillTo")
	 				typeTable.searchValue = args.houseCodeId;

			    me.loadDependentTypes.push(typeTable);
				dependentTypeFound = true;
			}

			typeTableData = me.getTypeTableData(args.typeTable, args.columnName);

			if (args.columnName == "EmpStatusType") 
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.statusTypeChange(this);>";	
			else if (args.columnName == "EmpTerminationReasonType")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.terminationReasonTypeChange(this);>";
			else if (args.columnName == "PayPayrollCompany")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.payrollCompanyChange(this);>";
			else if (args.columnName == "EmpEmpgPrimaryState")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.primaryStateChange(this);>";
			else if (args.columnName == "EmpEmpgSecondaryState")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.secondaryStateChange(this);>";
			else
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\');>";

			if (!dependentTypeFound) {
				for (var index = 0; index < typeTableData.length; index++) {
					if (typeTableData[index].name != undefined)
						title = typeTableData[index].name;
					else
					    title = typeTableData[index].title;

					if (args.columnValue == title)
						rowHtml += "	<option title='" + title + "' value='" + typeTableData[index].id + "' selected>" + title + "</option>";
					else
						rowHtml += "	<option title='" + title + "' value='" + typeTableData[index].id + "'>" + title + "</option>";
				}
			}
			
			rowHtml += "</select>";
		
			return rowHtml;
		},
		
		sortColumn: function(index) {
			var me = this;

			if (index == -1) {
				if (me.houseCodeSortOrder == "Asc")
					me.houseCodeSortOrder = "Desc";
				else
					me.houseCodeSortOrder = "Asc";

				me.sortColumns = "HcmHouseCodes.HcmHouseCode#" + me.houseCodeSortOrder + "|";
			}
			else  {
				if (me.moduleColumnHeaders[index].sortOrder == "")
					me.moduleColumnHeaders[index].sortOrder = "Asc";
				else if (me.moduleColumnHeaders[index].sortOrder == "Asc")
					me.moduleColumnHeaders[index].sortOrder = "Desc";
				else if (me.moduleColumnHeaders[index].sortOrder == "Desc")
					me.moduleColumnHeaders[index].sortOrder = "Asc";
					
				me.sortColumns = me.moduleColumnHeaders[index].title + "#" + me.moduleColumnHeaders[index].sortOrder + "|";
			}
			
			me.loadModuleColumnData();
		},

		populateOperatorDropDown: function(id, type) {
			var me = this;
			var rowHtml = "";
			
			if (type == "text") {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:120px; onchange=fin.reportUi.operatorChange('" + id + "');>";
				rowHtml += "<option title='Exact match (=)' value='1' selected>Exact match (=)</option>";
				rowHtml += "<option title='Any part that matches (Like)' value='2'>Any part that matches (Like)</option>";
				rowHtml += "</select>";
			}
			else  if (type == "bit") {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:120px;>";
				rowHtml += "<option title='' value='' selected></option>";
				rowHtml += "<option title='Yes' value='1'>Yes</option>";
				rowHtml += "<option title='No' value='0'>No</option>";
				rowHtml += "</select>";
			}
			else {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:120px; onchange=fin.reportUi.operatorChange('" + id + "');>";
				rowHtml += "<option title='Equal to' value='1' selected>=</option>";
				rowHtml += "<option title='Less than or equal to' value='2'>&lt;=</option>";
				rowHtml += "<option title='Greater than or equal to' value='3'>&gt;=</option>";
				rowHtml += "<option title='Between two values' value='4'>between</option>";
				rowHtml += "<option title='Not equal to' value='5'>!=</option>";
				rowHtml += "</select>";
			}

			return rowHtml;
		},
		
		operatorChange: function(id) {
			var me = this;
			
			$("#" + id).val("");
			$("#" + id + "_1").val("");
			
			if ($("#sel" + id).val() == "4")
				$("#" + id + "_1").show();
			else
				$("#" + id + "_1").hide();
		},
		
		populateFilterDropDown: function() {
			var args = ii.args(arguments, {
				typeTable: {type: String}
				, columnName: {type: String}
			});
			var me = this;
			var rowHtml = "";
			var typeTableData = me.getTypeTableData(args.typeTable, args.columnName);

			rowHtml = "<select id='" + args.columnName + "' class='inputTextSize'>";

			for (var index = 0; index < typeTableData.length; index++) {
				if (typeTableData[index].name != undefined)
						title = typeTableData[index].name;
					else
					    title = typeTableData[index].title;
						
				rowHtml += "	<option title='" + title + "' value='" + typeTableData[index].id + "'>" + title + "</option>";
			}				

			rowHtml += "</select>";

			return rowHtml;
		},
		
		payrollCompanyCheck: function(rowNumber, houseCode, columnValue) {
			var me = this;

		    if (me.payrollCompaniesCache[houseCode] != undefined) {

	            if (me.payrollCompaniesCache[houseCode].loaded)
					me.payrollCompanyValidate(houseCode, [rowNumber], columnValue);              
	            else
	                me.payrollCompaniesCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.payrollCompanyLoad(rowNumber, houseCode, columnValue);
		},

		payrollCompanyValidate: function(houseCode, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.payrollCompaniesCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "PayPayrollCompany", me.payrollCompaniesCache[houseCode].payrollCompanies, columnValue);
		        }
		    }
		},

		payrollCompanyLoad: function(rowNumber, houseCode, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;
		   
		    me.payrollCompaniesCache[houseCode] = {};
		    me.payrollCompaniesCache[houseCode].valid = false;
		    me.payrollCompaniesCache[houseCode].loaded = false;
		    me.payrollCompaniesCache[houseCode].buildQueue = [];
		    me.payrollCompaniesCache[houseCode].payrollCompanies = [];
		    me.payrollCompaniesCache[houseCode].buildQueue.push(rowNumber);
			me.payrollCompaniesCache[houseCode].id = houseCode;
		   
		   $.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodePayrollCompanys,userId:[user]"
                    + ",houseCodeId:" + me.payrollCompaniesCache[houseCode].id
					+ ",listAssociatedCompanyOnly:true"
					+ ",<criteria>",
 
                success: function(xml) {
		            $(xml).find("item").each(function() {
		                var payrollCompany = {};
		                payrollCompany.id = $(this).attr("id");
		                payrollCompany.name = $(this).attr("name");
						payrollCompany.salary = ($(this).attr("salary") == "true");
						payrollCompany.hourly = ($(this).attr("hourly") == "true");
						payrollCompany.payFrequencyType = $(this).attr("payFrequencyType");
		                me.payrollCompaniesCache[houseCode].payrollCompanies.push(payrollCompany);
		            });
					
					me.payrollCompaniesCache[houseCode].valid = true;
					me.payrollCompaniesCache[houseCode].loaded = true;
					//validate the list of rows
		            me.payrollCompanyValidate(houseCode, me.payrollCompaniesCache[houseCode].buildQueue, columnValue);
		            me.typesLoadedCount--;
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});
		},				
		
		houseCodeJobCheck: function(rowNumber, houseCode, columnValue) {
			var me = this;

		    if (me.houseCodeJobsCache[houseCode] != undefined) {

	            if (me.houseCodeJobsCache[houseCode].loaded)
					me.houseCodeJobValidate(houseCode, [rowNumber], columnValue);              
	            else
	                me.houseCodeJobsCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.houseCodeJobLoad(rowNumber, houseCode, columnValue);
		},
		
		houseCodeJobValidate: function(houseCode, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.houseCodeJobsCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "HcmHouseCodeJob", me.houseCodeJobsCache[houseCode].jobs, columnValue);
		        }
		    }
		},

		houseCodeJobLoad: function(rowNumber, houseCode, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;
		   
		    me.houseCodeJobsCache[houseCode] = {};
		    me.houseCodeJobsCache[houseCode].valid = false;
		    me.houseCodeJobsCache[houseCode].loaded = false;
		    me.houseCodeJobsCache[houseCode].buildQueue = [];
		    me.houseCodeJobsCache[houseCode].jobs = [];
		    me.houseCodeJobsCache[houseCode].buildQueue.push(rowNumber);
			me.houseCodeJobsCache[houseCode].id = houseCode;
		   
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeJobs,userId:[user],"
                    + "houseCodeId:" + me.houseCodeJobsCache[houseCode].id + ",<criteria>",
 
                success: function(xml) {
		            $(xml).find("item").each(function() {
		                var job = {};
		                job.id = $(this).attr("id");
		                job.name = $(this).attr("jobNumber");
		                me.houseCodeJobsCache[houseCode].jobs.push(job);
		            });

					me.houseCodeJobsCache[houseCode].valid = true;
					me.houseCodeJobsCache[houseCode].loaded = true;
					//validate the list of rows
		            me.houseCodeJobValidate(houseCode, me.houseCodeJobsCache[houseCode].buildQueue, columnValue);
		            me.typesLoadedCount--;
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});
		},

		statusTypeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(14));			

	        me.statusTypeCheck(rowNumber, objSelect.value, "");		    
		},
		
		statusTypeCheck: function(rowNumber, statusType, columnValue) {
			var me = this;
			
            if (me.statusTypesCache[statusType] != undefined) {
	            if (me.statusTypesCache[statusType].loaded)
	            	me.statusTypeValidate(statusType, [rowNumber], columnValue);
	            else
	                me.statusTypesCache[statusType].buildQueue.push(rowNumber);
	        }
	        else
	            me.statusCategoryTypesLoad(rowNumber, statusType, columnValue);
		},

		statusTypeValidate: function(statusType, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.statusTypesCache[statusType].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "EmpStatusCategoryType", me.statusTypesCache[statusType].statusCategoryTypes, columnValue);
		        }
		    }
		},

		statusCategoryTypesLoad: function(rowNumber, statusType, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;

		    me.statusTypesCache[statusType] = {};
		    me.statusTypesCache[statusType].valid = false;
		    me.statusTypesCache[statusType].loaded = false;
		    me.statusTypesCache[statusType].buildQueue = [];
			me.statusTypesCache[statusType].statusCategoryTypes = [];
		    me.statusTypesCache[statusType].buildQueue.push(rowNumber);

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:statusCategoryTypes,userId:[user],"
					+ "statusTypeId:" + statusType + ",<criteria>",
 
                success: function(xml) {
	                $(xml).find('item').each(function() {
	                    var statusCategoryType = {};
	                	statusCategoryType.id = $(this).attr("id");
	                	statusCategoryType.name = $(this).attr("name");
	                	me.statusTypesCache[statusType].statusCategoryTypes.push(statusCategoryType);
	                });
					
					me.typesLoadedCount--;
					me.statusTypesCache[statusType].valid = true;
					me.statusTypesCache[statusType].loaded = true;
					me.statusTypeValidate(statusType, me.statusTypesCache[statusType].buildQueue, columnValue);
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});			
		},
		
		terminationReasonTypeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(25));

	        me.terminationReasonTypeCheck(rowNumber, objSelect.value, "");
		},
		
		terminationReasonTypeCheck: function(rowNumber, terminationReasonType, columnValue) {
			var me = this;
			 
		    if (me.terminationReasonTypesCache[terminationReasonType] != undefined) {
	            if (me.terminationReasonTypesCache[terminationReasonType].loaded)
	            	me.terminationReasonTypeValidate(terminationReasonType, [rowNumber], columnValue);
	            else
	                me.terminationReasonTypesCache[terminationReasonType].buildQueue.push(rowNumber);
	        }
	        else
	            me.terminationReasonTypesLoad(rowNumber, terminationReasonType, columnValue);
		},
		
		terminationReasonTypeValidate: function(terminationReasonType, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.terminationReasonTypesCache[terminationReasonType].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "EmpSeparationCode", me.terminationReasonTypesCache[terminationReasonType].separationCodes, columnValue);
		        }
		    }
		},
		
		terminationReasonTypesLoad: function(rowNumber, terminationReasonType, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;

		    me.terminationReasonTypesCache[terminationReasonType] = {};
		    me.terminationReasonTypesCache[terminationReasonType].valid = false;
		    me.terminationReasonTypesCache[terminationReasonType].loaded = false;
		    me.terminationReasonTypesCache[terminationReasonType].buildQueue = [];
			me.terminationReasonTypesCache[terminationReasonType].separationCodes = [];
		    me.terminationReasonTypesCache[terminationReasonType].buildQueue.push(rowNumber);

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:separationCodes,userId:[user],"
					+ "terminationType:" + terminationReasonType + ",<criteria>",
 
                success: function(xml) {
	                $(xml).find("item").each(function() {
	                    var separationCode = {};
	                	separationCode.id = $(this).attr("id");
	                	separationCode.name = $(this).attr("name");
	                	me.terminationReasonTypesCache[terminationReasonType].separationCodes.push(separationCode);
	                });

					me.typesLoadedCount--;
					me.terminationReasonTypesCache[terminationReasonType].valid = true;
					me.terminationReasonTypesCache[terminationReasonType].loaded = true;
					me.terminationReasonTypeValidate(terminationReasonType, me.terminationReasonTypesCache[terminationReasonType].buildQueue, columnValue);
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});			
		},
		
		payrollCompanyChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(18));
			var payrollCompany = $("#PayPayrollCompany_" + rowNumber).val();
			var state = $("#EmpEmpgPrimaryState_" + rowNumber).val();
			
			//var index = Number(objSelect.selectedIndex);
			//var row = $("#adhReportDataRow" + rowNumber);
			//var houseCode = row[0].cells[0].innerHTML;
			//var houseCode = me.employees[rowNumber].column1;
	    	//$("#PayPayFrequencyType_" + rowNumber).val(me.payrollCompaniesCache[houseCode].payrollCompanies[index].payFrequencyType);
			//$("#chkHourly" + rowNumber)[0].checked = me.payrollCompaniesCache[houseCode].payrollCompanies[index].hourly;

			if ($("#EmpEmpgLocalTaxCode1_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode1", "");
			if ($("#EmpEmpgLocalTaxCode2_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode2", "");
			if ($("#EmpEmpgLocalTaxCode3_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode3", "");
		},
		
		localTaxCodeCheck: function(rowNumber, state, payrollCompany, columnName, columnValue) {
			var me = this;

			if (me.localTaxCodesCache[state + "," + payrollCompany] != undefined) {
				var rowArray = {};
				rowArray.rowNumber = rowNumber;
				rowArray.columnName = columnName;
				rowArray.columnValue = columnValue;

			 	if (me.localTaxCodesCache[state + "," + payrollCompany].loaded)
					me.localTaxCodeValidate(state, payrollCompany, [rowArray]);
	            else
					me.localTaxCodesCache[state + "," + payrollCompany].buildQueue.push(rowArray);
	        }
	        else
				me.localTaxCodesLoad(rowNumber, state, payrollCompany, columnName, columnValue);
		},
		
		localTaxCodeValidate: function(state, payrollCompany, rowArray) {
		    var me = this;

		    if (me.localTaxCodesCache[state + "," + payrollCompany].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
					me.buildSingleDropDown(rowArray[index].rowNumber, rowArray[index].columnName, me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes, rowArray[index].columnValue);
		        }
		    }
		},

		localTaxCodesLoad: function(rowNumber, state, payrollCompany, columnName, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;

			var rowArray = {};
			rowArray.rowNumber = rowNumber;
			rowArray.columnName = columnName;
			rowArray.columnValue = columnValue;
			
		    me.localTaxCodesCache[state + "," + payrollCompany] = {};
		    me.localTaxCodesCache[state + "," + payrollCompany].valid = false;
		    me.localTaxCodesCache[state + "," + payrollCompany].loaded = false;
		    me.localTaxCodesCache[state + "," + payrollCompany].buildQueue = [];		   
			me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes = [];
		    me.localTaxCodesCache[state + "," + payrollCompany].buildQueue.push(rowArray);
			
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:localTaxCodePayrollCompanyStates,userId:[user]"
					+ ",payrollCompany:" + payrollCompany
                    + ",appState:" + state + ",<criteria>",
 
                 success: function(xml) {
 	                $(xml).find("item").each(function() {
	                    var localTaxCode = {};
	                	localTaxCode.id = $(this).attr("id");
	                	localTaxCode.name = $(this).attr("localTaxCode");
	                	me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes.push(localTaxCode);
	                });

					me.typesLoadedCount--;
					me.localTaxCodesCache[state + "," + payrollCompany].valid = true;
					me.localTaxCodesCache[state + "," + payrollCompany].loaded = true;
					me.localTaxCodeValidate(state, payrollCompany, me.localTaxCodesCache[state + "," + payrollCompany].buildQueue);
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});
		},
		
		primaryStateChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(20));
			var state = objSelect.value;
			var payrollCompany = $("#PayPayrollCompany_" + rowNumber).val();
			
			if ($("#EmpMaritalStatusStateTaxTypePrimary_" + rowNumber).length > 0)
				me.stateCheck(rowNumber, state, true, "EmpMaritalStatusStateTaxTypePrimary", "");
			if ($("#EmpStateAdjustmentType_" + rowNumber).length > 0)
				me.stateCheck(rowNumber, state, true, "EmpStateAdjustmentType", "");
			if ($("#EmpSDIAdjustmentType_" + rowNumber).length > 0)
				me.stateCheck(rowNumber, state, true, "EmpSDIAdjustmentType", "");
			if ($("#EmpLocalTaxAdjustmentType_" + rowNumber).length > 0)
				me.stateCheck(rowNumber, state, true, "EmpLocalTaxAdjustmentType", "");
			
			if ($("#EmpEmpgLocalTaxCode1_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode1", "");
			if ($("#EmpEmpgLocalTaxCode2_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode2", "");
			if ($("#EmpEmpgLocalTaxCode3_" + rowNumber).length > 0)
				me.localTaxCodeCheck(rowNumber, state, payrollCompany, "EmpEmpgLocalTaxCode3", "");
		},
		
		secondaryStateChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(22));			

			if ($("#EmpMaritalStatusStateTaxTypeSecondary_" + rowNumber).length > 0)
				me.stateCheck(rowNumber, objSelect.value, false, "EmpMaritalStatusStateTaxTypeSecondary", "");
		},
		
		stateCheck: function(rowNumber, state, primary, columnName, columnValue) {
			var me = this;

		    if (me.statesCache[state] != undefined) {
				var rowArray = {};
				rowArray.rowNumber = rowNumber;
				rowArray.columnName = columnName;
				rowArray.columnValue = columnValue;
				
	            if (me.statesCache[state].loaded)
	            	me.stateValidate(state, [rowArray], primary);
	            else
	                me.statesCache[state].buildQueue.push(rowArray);
	        }
	        else
	            me.maritalStatusPrimaryTypesLoad(rowNumber, state, primary, columnName, columnValue);
		},
		
		stateValidate: function(state, rowArray, primary) {
		    var me = this;

		    if (me.statesCache[state].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
					var rowNumber = rowArray[index].rowNumber;

					if (primary) {
						if (rowArray[index].columnName == "EmpMaritalStatusStateTaxTypePrimary")
							me.buildSingleDropDown(rowNumber, "EmpMaritalStatusStateTaxTypePrimary", me.statesCache[state].maritalStatusStateTaxTypes, rowArray[index].columnValue);
						else if (rowArray[index].columnName == "EmpStateAdjustmentType")
							me.buildSingleDropDown(rowNumber, "EmpStateAdjustmentType", me.statesCache[state].stateAdjustmentTypes, rowArray[index].columnValue);
						else if (rowArray[index].columnName == "EmpSDIAdjustmentType")
							me.buildSingleDropDown(rowNumber, "EmpSDIAdjustmentType", me.statesCache[state].sdiAdjustmentTypes, rowArray[index].columnValue);
						else if (rowArray[index].columnName == "EmpLocalTaxAdjustmentType")
							me.buildSingleDropDown(rowNumber, "EmpLocalTaxAdjustmentType", me.statesCache[state].localTaxAdjustmentTypes, rowArray[index].columnValue);
					}
					else {
						if (rowArray[index].columnName == "EmpMaritalStatusStateTaxTypeSecondary")
							me.buildSingleDropDown(rowNumber, "EmpMaritalStatusStateTaxTypeSecondary", me.statesCache[state].maritalStatusStateTaxTypes, rowArray[index].columnValue);
					}				  
		        }
		    }
		},
		
		maritalStatusPrimaryTypesLoad: function(rowNumber, state, primary, columnName, columnValue) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.typesLoadedCount++;
			
			var rowArray = {};
			rowArray.rowNumber = rowNumber;
			rowArray.columnName = columnName;
			rowArray.columnValue = columnValue;

		    me.statesCache[state] = {};
		    me.statesCache[state].valid = false;
		    me.statesCache[state].loaded = false;
		    me.statesCache[state].buildQueue = [];
		    me.statesCache[state].maritalStatusStateTaxTypes = [];
		    me.statesCache[state].stateAdjustmentTypes = [];
			me.statesCache[state].sdiAdjustmentTypes = [];
			me.statesCache[state].localTaxAdjustmentTypes = [];
		    me.statesCache[state].buildQueue.push(rowArray);

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:maritalStatusPrimaryTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
	                $(xml).find("item").each(function() {
	                    var maritalStatusStateTaxType = {};
	                	maritalStatusStateTaxType.id = $(this).attr("id");
	                	maritalStatusStateTaxType.name = $(this).attr("name");
	                	me.statesCache[state].maritalStatusStateTaxTypes.push(maritalStatusStateTaxType);
	                });

					me.stateAdjustmentTypesLoad(rowNumber, state, primary, columnName, columnValue);
				}
			});			
		},
		
		stateAdjustmentTypesLoad: function(rowNumber, state, primary, columnName, columnValue) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:stateAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
 	                $(xml).find("item").each(function() {
	                    var stateAdjustmentType = {};
	                	stateAdjustmentType.id = $(this).attr("id");
	                	stateAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].stateAdjustmentTypes.push(stateAdjustmentType);
	                });
					
					me.sdiAdjustmentTypesLoad(rowNumber, state, primary, columnName, columnValue);
				}
			});			
		},
		
		sdiAdjustmentTypesLoad: function(rowNumber, state, primary, columnName, columnValue) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:sdiAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
 	                $(xml).find("item").each(function() {
	                    var sdiAdjustmentType = {};
	                	sdiAdjustmentType.id = $(this).attr("id");
	                	sdiAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].sdiAdjustmentTypes.push(sdiAdjustmentType);
	                });
					
					me.localTaxAdjustmentTypesLoad(rowNumber, state, primary, columnName, columnValue);
				}
			});			
		},
		
		localTaxAdjustmentTypesLoad: function(rowNumber, state, primary, columnName, columnValue) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:localTaxAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
 	                $(xml).find("item").each(function() {
	                    var localTaxAdjustmentType = {};
	                	localTaxAdjustmentType.id = $(this).attr("id");
	                	localTaxAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].localTaxAdjustmentTypes.push(localTaxAdjustmentType);
	                });
					
					me.typesLoadedCount--;
					me.statesCache[state].valid = true;
					me.statesCache[state].loaded = true;
					me.stateValidate(state, me.statesCache[state].buildQueue, primary);
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();
				}
			});
		},

		userRoleCheck: function(rowNumber, userId, columnValue) {
			var me = this;

		    if (me.userRolesCache[userId] != undefined) {

	            if (me.userRolesCache[userId].loaded)
					me.userRoleValidate(userId, [rowNumber], columnValue);              
	            else
	                me.userRolesCache[userId].buildQueue.push(rowNumber);
	        }
	        else
	            me.userRoleLoad(rowNumber, userId, columnValue);
		},

		userRoleValidate: function(userId, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;
			
		    if (me.userRolesCache[userId].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "AppRoleCurrent", me.userRolesCache[userId].userRoles, columnValue);
		        }
		    }
		},

		userRoleLoad: function(rowNumber, userId, columnValue) {
			var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
			me.typesLoadedCount++;
			
		    me.userRolesCache[userId] = {};
		    me.userRolesCache[userId].valid = false;
		    me.userRolesCache[userId].loaded = false;
		    me.userRolesCache[userId].buildQueue = [];
			me.userRolesCache[userId].userRoles = [];
		    me.userRolesCache[userId].buildQueue.push(rowNumber);
			me.userRolesCache[userId].id = userId;
			
	        $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/adh/act/provider.aspx",
                data: "moduleId=adh&requestId=1&targetId=iiCache"
					+ "&requestXml=<criteria>storeId:appUserRoles,userId:[user],"
					+ "appUserId:" + userId + ",<criteria>",
                  
                 success: function(xml) {
  	                $(xml).find("item").each(function() {
	                    var userRole = {};
	                	userRole.id = $(this).attr("id");
	                	userRole.name = $(this).attr("title");
	                	me.userRolesCache[userId].userRoles.push(userRole);
	                });
					
					me.userRolesCache[userId].valid = true;
					me.userRolesCache[userId].loaded = true;
					//validate the list of rows
		            me.userRoleValidate(userId, me.userRolesCache[userId].buildQueue, columnValue);
		            me.typesLoadedCount--;
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();					
				}
			});
		},

		invBillToCheck: function(rowNumber, houseCode, columnValue) {
			var me = this;

		    if (me.invBillToCache[houseCode] != undefined) {

	            if (me.invBillToCache[houseCode].loaded)
					me.invBillToValidate(houseCode, [rowNumber], columnValue);              
	            else
	                me.invBillToCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.invBillTosLoad(rowNumber, houseCode, columnValue);
		},

		invBillToValidate: function(houseCode, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;
			
		    if (me.invBillToCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "RevInvBillTo", me.invBillToCache[houseCode].invoiceBillTos, columnValue);
		        }
		    }
		},

		invBillTosLoad: function(rowNumber, houseCode, columnValue) {
			var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
			me.typesLoadedCount++;
			
		    me.invBillToCache[houseCode] = {};
		    me.invBillToCache[houseCode].valid = false;
		    me.invBillToCache[houseCode].loaded = false;
		    me.invBillToCache[houseCode].buildQueue = [];
			me.invBillToCache[houseCode].invoiceBillTos = [];
		    me.invBillToCache[houseCode].buildQueue.push(rowNumber);
			me.invBillToCache[houseCode].id = houseCode;
			
	        $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/adh/act/provider.aspx",
                data: "moduleId=adh&requestId=1&targetId=iiCache"
					+ "&requestXml=<criteria>storeId:revInvoiceBillTos,userId:[user],"
					+ "houseCode:" + houseCode + ",<criteria>",
                  
                 success: function(xml) {
  	                $(xml).find("item").each(function() {
	                    var invBillTo = {};
	                	invBillTo.id = $(this).attr("billTo");
	                	invBillTo.name = $(this).attr("billTo");
	                	me.invBillToCache[houseCode].invoiceBillTos.push(invBillTo);
	                });
					
					me.invBillToCache[houseCode].valid = true;
					me.invBillToCache[houseCode].loaded = true;
					//validate the list of rows
		            me.invBillToValidate(houseCode, me.invBillToCache[houseCode].buildQueue, columnValue);
		            me.typesLoadedCount--;
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();					
				}
			});
		},

		buildSingleDropDown: function(rowNumber, controlName, types, selectedValue) {
		    var me = this;
		    var type = {};
			var selType = "";

			selType = $("#" + controlName + "_" + rowNumber);
			selType.empty();
			selType.append("<option value='0'></option>");

		    for(var index = 0; index < types.length; index++) {
		        type = types[index];
				if (type.name == selectedValue)
					selType.append("<option  title='" + type.name + "' value='" + type.id + "' selected>" + type.name + "</option>");
				else
		        	selType.append("<option  title='" + type.name + "' value='" + type.id + "'>" + type.name + "</option>");
		    }
		},
		
		getTypeTableData: function() {
			var args = ii.args(arguments,{
				typeTable: {type: String}
				, columnName: {type: String}
			});
			var me = this;
			var typeTable = [];

			if (args.typeTable == "HcmServiceTypes") {
				me.typeNoneAdd(me.serviceTypes);	
				typeTable = me.serviceTypes;
			}
			else if (args.typeTable == "HcmServiceLines") {
				if (args.columnName == "HcmServiceLineFinancialEntity") {
					me.financialEntities = [];

					for (var index = 0; index < me.serviceLines.length; index++) {
						if (me.serviceLines[index].financialEntity) {
							var item = new fin.adh.FinancialEntity({ id: me.serviceLines[index].id, name:me.serviceLines[index].name });
							me.financialEntities.push(item);
						}
					}
					me.typeNoneAdd(me.financialEntities);
					typeTable = me.financialEntities;
				}
				else {
					me.typeNoneAdd(me.serviceLines);
					typeTable = me.serviceLines;
				}
			}
			else if (args.typeTable == "FscJDECompanies") {
				me.typeNoneAdd(me.jdeCompanys);	
				typeTable = me.jdeCompanys;
			}
			else if (args.typeTable == "HcmRemitToLocations") {
				me.typeNoneAdd(me.remitTos);
				typeTable = me.remitTos;
			}
			else if (args.typeTable == "HcmContractTypes") {
				me.typeNoneAdd(me.contractTypes);
				typeTable = me.contractTypes;
			}
			else if (args.typeTable == "HcmTermsOfContractTypes") {
				me.typeNoneAdd(me.termsOfContractTypes);
				typeTable = me.termsOfContractTypes;
			}
			else if (args.typeTable == "HcmBillingCycleFrequencyTypes") {
				me.typeNoneAdd(me.billingCycleFrequencys);
				typeTable = me.billingCycleFrequencys;
			}
			else if (args.typeTable == "HcmPayrollProcessingLocationTypes") {
				me.typeNoneAdd(me.payrollProcessings);
				typeTable = me.payrollProcessings;
			}
			else if (args.typeTable == "HcmHouseCodeTypes") {
				me.typeNoneAdd(me.houseCodeTypes);
				typeTable = me.houseCodeTypes;
			}
			else if (args.typeTable == "HcmInvoiceLogoTypes") {
				me.typeNoneAdd(me.invoiceLogoTypes);
				typeTable = me.invoiceLogoTypes;
			}
			else if (args.typeTable == "HcmBudgetTemplate") {
				me.typeNoneAdd(me.budgetTemplates);
				typeTable = me.budgetTemplates;
			}			
			else if (args.typeTable == "HcmEPayGroupTypes") {
				me.typeNoneAdd(me.ePayGroupTypes);
				typeTable = me.ePayGroupTypes;
			}
			else if (args.typeTable == "AppStateTypes") {
				me.typeNoneAdd(me.stateTypes);
				typeTable = me.stateTypes;
			}
			else if (args.typeTable == "AppIndustryTypes") {
				me.typeNoneAdd(me.industryTypes);
				typeTable = me.industryTypes;
			}
			else if (args.typeTable == "AppPrimaryBusinessTypes") {
				me.typeNoneAdd(me.primaryBusinessTypes);
				typeTable = me.primaryBusinessTypes;
			}
			else if (args.typeTable == "AppLocationTypes") {
				me.typeNoneAdd(me.locationTypes);
				typeTable = me.locationTypes;
			}
			else if (args.typeTable == "AppTraumaLevelTypes") {
				me.typeNoneAdd(me.traumaLevelTypes);
				typeTable = me.traumaLevelTypes;
			}
			else if (args.typeTable == "AppProfitDesignationTypes") {
				me.typeNoneAdd(me.profitDesignationTypes);
				typeTable = me.profitDesignationTypes;
			}
			else if (args.typeTable == "AppGPOTypes") {
				me.typeNoneAdd(me.gpoTypes);
				typeTable = me.gpoTypes;
			}
			else if (args.typeTable == "AppOwnershipTypes") {
				me.typeNoneAdd(me.ownershipTypes);
				typeTable = me.ownershipTypes;
			}
			else if (args.typeTable == "EmpMaritalStatusTypes") {
				me.typeNoneAdd(me.maritalStatusTypes);
				typeTable = me.maritalStatusTypes;
			}
			else if (args.typeTable == "EmpI9Types") {
				me.typeNoneAdd(me.i9Types);
				typeTable = me.i9Types;
			}
			else if (args.typeTable == "EmpVetTypes") {
				me.typeNoneAdd(me.vetTypes);
				typeTable = me.vetTypes;
			}
			else if (args.typeTable == "EmpStatusTypes") {
				me.typeNoneAdd(me.statusTypes);
				typeTable = me.statusTypes;
			}
			else if (args.typeTable == "EmpDeviceGroupTypes") {
				me.typeNoneAdd(me.deviceGroupTypes);
				typeTable = me.deviceGroupTypes;
			}
			else if (args.typeTable == "EmpJobCodeTypes") {
				me.typeNoneAdd(me.jobCodeTypes);
				typeTable = me.jobCodeTypes;
			}
			else if (args.typeTable == "EmpRateChangeReasonTypes") {
				me.typeNoneAdd(me.rateChangeReasons);
				typeTable = me.rateChangeReasons;
			}
			else if (args.typeTable == "EmpTerminationReasonTypes") {
				me.typeNoneAdd(me.terminationReasons);
				typeTable = me.terminationReasons;
			}
			else if (args.typeTable == "EmpWorkShifts") {
				me.typeNoneAdd(me.workShifts);
				typeTable = me.workShifts;
			}
			else if (args.typeTable == "EmpEthnicityTypes") {
				me.typeNoneAdd(me.ethnicityTypes);
				typeTable = me.ethnicityTypes;
			}
			else if (args.typeTable == "EmpUnionTypes") {
				me.typeNoneAdd(me.unionTypes);
				typeTable = me.unionTypes;
			}
			else if (args.typeTable == "PayPayFrequencyTypes") {
				me.typeNoneAdd(me.payFrequencyTypes);
				typeTable = me.payFrequencyTypes;
			}
			else if (args.typeTable == "EmpSeparationCodes") {
				me.typeNoneAdd(me.separationCodes);
				typeTable = me.separationCodes;
			}
			else if (args.typeTable == "EmpJobStartReasonTypes") {
				me.typeNoneAdd(me.jobStartReasonTypes);
				typeTable = me.jobStartReasonTypes;
			}
			else if (args.typeTable == "EmpLocalTaxCodePayrollCompanyStates") {
				me.typeNoneAdd(me.localTaxCodes);
				typeTable = me.localTaxCodes;
			}
			else if (args.typeTable == "EmpStatusCategoryTypes") {
				me.typeNoneAdd(me.statusCategoryTypes);
				typeTable = me.statusCategoryTypes;
			}
			else if (args.typeTable == "EmpStateAdjustmentTypes") {
				me.typeNoneAdd(me.stateAdjustmentTypes);
				typeTable = me.stateAdjustmentTypes;
			}
			else if (args.typeTable == "EmpSDIAdjustmentTypes") {
				me.typeNoneAdd(me.sdiAdjustmentTypes);
				typeTable = me.sdiAdjustmentTypes;
			}
			else if (args.typeTable == "EmpMaritalStatusFederalTaxTypes") {
				me.typeNoneAdd(me.maritalStatusFederalTaxTypes);
				typeTable = me.maritalStatusFederalTaxTypes;
			}
			else if (args.typeTable == "EmpGenderTypes") {
				me.genderTypes.unshift(new fin.adh.GenderType({ id: 2, name: "Female" }));
				me.genderTypes.unshift(new fin.adh.GenderType({ id: 1, name: "Male" }));
				me.typeNoneAdd(me.genderTypes);
				typeTable = me.genderTypes;
			}
			else if (args.typeTable == "EmpLocalTaxAdjustmentTypes") {
				me.typeNoneAdd(me.localTaxAdjustmentTypes);
				typeTable = me.localTaxAdjustmentTypes;
			}
			else if (args.typeTable == "EmpMaritalStatusStateTaxTypes") {
				me.typeNoneAdd(me.maritalStatusStateTaxTypeSecondarys);
				typeTable = me.maritalStatusStateTaxTypeSecondarys;
			}
			else if (args.typeTable == "EmpFederalAdjustmentTypes") {
				me.typeNoneAdd(me.federalAdjustments);
				typeTable = me.federalAdjustments;
			}
			else if (args.typeTable == "PayPayrollCompanies") {
				me.typeNoneAdd(me.payrollCompanies);
				typeTable = me.payrollCompanies;
			}
			else if (args.typeTable == "AppTransactionStatusTypes") {
				me.typeNoneAdd(me.transactionStatusTypes);
				typeTable = me.transactionStatusTypes;
			}

			return typeTable;
		},
				
		resetValidation: function(controlName) {
			var me = this;

			$("#" + controlName).attr("title", "");
			$("#" + controlName).css("background-color", me.cellColorValid);
		},
		
		dataValidation: function() {
			var args = ii.args(arguments,{
				controlValidation: {type: String}
				, controlName: {type: String}
			});
			var me = this;
			var valid = true;
			var message = "";

			dataValue = $("#" + args.controlName).val();
			
			if (dataValue == "") 
				return;
			
			if (args.controlValidation.toLowerCase() == "datetime") {			
				if (!me.isDate(dataValue)) {
					valid = false;
					message = "Please enter valid date.";
				}					
			}			
			else if (args.controlValidation.toLowerCase() == "email") {
				if (!me.isEmail(dataValue))	{
					valid = false;
					message = "Please enter valid email id.";
				}				
			}			
			else if (args.controlValidation.toLowerCase() == "phone") {
				if (!me.isPhone(dataValue)) {
					valid = false;
					message = "Please enter valid number. Example: (999) 999-9999)";
				}
				else
					$("#" + args.controlName).val(fin.cmn.text.mask.phone(dataValue));
			}
			else if (args.controlValidation.toLowerCase() == "zip") {
				if (!me.isZip(dataValue)) {
					valid = false;
					message = "Please enter valid zip code. Example: 99999 or 99999-9999.";
				}				
			}
			else if (args.controlValidation.toLowerCase() == "int") {
				if (!me.isNumber(dataValue)) {
					valid = false;
					message = "Please enter valid number. Example: 99";
				}
			}
			else if (args.controlValidation.toLowerCase() == "decimal") {
				if (!me.isNumeric(dataValue)) {
					valid = false;
					message = "Please enter valid numeric data. Example: 9.99";
				}				
			}
				
			if (valid) {
				$("#" + args.controlName).attr("title", "");
				$("#" + args.controlName).css("background-color", me.cellColorValid);
			}
			else {
				$("#" + args.controlName).attr("title", message);
				$("#" + args.controlName).css("background-color", me.cellColorInvalid);
			}

			return valid;
		},
		
		isZip: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});
			
			if (ui.cmn.text.validate.postalCode(args.argValue))
				return true;
			else
				return false;
		},
		
		isEmail: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});
			
			if (ui.cmn.text.validate.emailAddress(args.argValue))				
				return true;
			else
				return false;
		},
		
		isPhone: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});
			
			if (ui.cmn.text.validate.phone(args.argValue))
				return true;
			else
				return false;
		},
		
		isDate: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});			
			
			if (ui.cmn.text.validate.generic(args.argValue, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$"))				
				return true;
			else
				return false;
		},
		
		isNumber: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});

			if (/^-?[0-9]+$/.test(args.argValue))
				return true;
			else
				return false;
		},
		
		isNumeric: function() {			
			var args = ii.args(arguments, {
				argValue: {type: String}
			});

			if (/^\d{1,8}(\.\d{1,2})?$/.test(args.argValue))
				return true;
			else
				return false;
		},
		
		recordCountsLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");
			
			if (me.reportTotalRows.length == 0)
				 me.recordCount = 0;
		    else
				me.recordCount = me.reportTotalRows[0].totalRowId;
			me.startPoint = 1;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);

		    // if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;

		    // fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}

			$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
		    selPageNumber.val(me.pageCurrent);
		},
		
		listAdhReports: function() {
			var me = this;

			$("#selPageNumber").val(me.pageCurrent);
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
			me.endPoint = (me.startPoint + me.maximumRows) - 1;
			me.loadModuleColumnData();
		},
		
		prevItems: function() {
		    var me = this;

			me.pageCurrent--;

			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else
				me.listAdhReports();
		},

		nextItems: function() {
		    var me = this;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.listAdhReports();
		},
		
		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");

		    me.pageCurrent = Number(selPageNumber.val());
			me.listAdhReports();
		},
		
		actionClearItem: function() {
			var args = ii.args(arguments,{
				clearAll: {type: Boolean, required: false, defaultValue: false}
			});
			var me = this;

			if (args.clearAll) {

				me.hirNodeSelected = null;		
				me.hirNodePreviousSelected = null;	
				me.hirNodeParentSelected = null;
				$("#parentNode").hide();
				$("#hirOrgParent").html("");
			}
			
			me.validator.reset();
		},
		
		actionExportToExcelItem: function() {
			var me = this;
			
			$("#messageToUser").html("Exporting");
			$("#pageLoading").show();
			
			me.reportId = me.reports[me.report.indexSelected].id;
			me.reportName = me.reports[me.report.indexSelected].name;
			
			me.adhFileNameStore.fetch("userId:[user],report:"+ me.reportId 
				+ ",hirNode:"+ me.delimitedOrgSelectedNodes 
				+ ",filter:" + me.filter
				+ ",startPoint:" + 0
				+ ",endPoint:" +  0
				+ ",sortColumns:" +  me.sortColumns
				+ ",", me.fileNamesLoaded, me);						
		},
		
		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			$("#pageLoading").hide();

			if (me.adhFileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.adhFileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (me.rowModifed == false) return;

			$("#AdhReportItemGridBody").html("");
			me.loadModuleColumnData();
		},
				
		actionBackItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.status = "";

			$("#AdhReportGrid").hide();
			$("#ReportHierarchy").show();
		},
		
		actionValidateItem: function() {
			var me = this;
			var columnValidation = "";
			var columnNullable = "";
			var id = "";
			var data = "";
			var idIndex = 0;
			var validRow = true;
			var valid = true;
			var showToolTip = false;
			var message = "";			
			
			for (var index = 0; index < me.moduleColumnDatas.length; index++) {
				if (me.moduleColumnDatas[index].modified) {
					idIndex = 0;
					var row = $("#adhReportDataRow" + me.moduleColumnDatas[index].primeColumn);
					
					for (var colIndex = 0; colIndex < row[0].cells.length; colIndex++) {
						if (row[0].cells[colIndex].firstChild != null && row[0].cells[colIndex].firstChild.type != undefined) {
							valid = true;
							showToolTip = false;
							message = "";
							idIndex = row[0].cells[colIndex].firstChild.id.indexOf("_");
							column = row[0].cells[colIndex].firstChild.id.substring(0, idIndex);
							
							if (column != "AppUnit" && column != "AppSite") {
								id = row[0].cells[colIndex].firstChild.id;
								columnValidation = me.moduleColumnHeaders[colIndex - 1].columnValidation;
								columnNullable = me.moduleColumnHeaders[colIndex - 1].columnNullable;
								data = row[0].cells[colIndex].firstChild.value;
								
								if (row[0].cells[colIndex].firstChild.type == "text") {
									if (!columnNullable && (data == "")) {		
										valid = false;
										showToolTip = true;
										message ="Please enter correct value.";	
									}
									else if (data != "") {
										valid = me.dataValidation(columnValidation, id);
									}
								}
								else if (row[0].cells[colIndex].firstChild.type == "select-one") {
									if (!columnNullable && data == "0") {		
										valid = false;
										showToolTip = true;
										message ="Please select correct value.";	
									}
								}
								
								if (showToolTip) {
									if (valid) {
										$("#" + id).attr("title", "");
										$("#" + id).css("background-color", me.cellColorValid);
									}
									else {
										$("#" + id).attr("title", message);
										$("#" + id).css("background-color", me.cellColorInvalid);									
									}
								}
								
								if (!valid) {
									if (validRow)
										validRow = false;
								}
							}
						}
					}
				}
			}
			
			return validRow;
		},
		
		actionSaveItem: function(status) {
			var me = this;
			var item = [];
			
			me.status = status;
			
			if (me.status == "save" && me.rowModifed == false) 
				return;

			var xml = me.saveXmlBuild(item);

			if (xml != "") {
				if (me.status == "save") {
					if (!me.actionValidateItem()) {
						alert("In order to save, the errors on the page must be corrected.");
						return;
					}

					$("#messageToUser").html("Saving");
			    	$("#pageLoading").show(); 
				}		
				
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
		
		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: { type: [fin.adh.ModuleColumnData] }
			});
			var me = this;
			var id = "";
			var column = "";
			var columnValidation = "";
			var data = "";
			var rowData = "";
			var rowsData = "";
			var idIndex = -1;
			var xml = "";
			
			if (me.status == "save") {
				for (var index = 0; index < me.moduleColumnDatas.length; index++ ) {
	
					if (me.moduleColumnDatas[index].modified) {
						idIndex = 0;
						var row = $("#adhReportDataRow" + me.moduleColumnDatas[index].primeColumn);
		
						for (var colIndex = 0; colIndex < row[0].cells.length; colIndex++) {
							if (row[0].cells[colIndex].firstChild != null && row[0].cells[colIndex].firstChild.type != undefined) {

								idIndex = row[0].cells[colIndex].firstChild.id.indexOf("_");
								column = row[0].cells[colIndex].firstChild.id.substring(0, idIndex);
									
								if (column != "AppSite") {
									columnValidation = me.moduleColumnHeaders[colIndex - 1].columnValidation.toLowerCase();
								}

								if (row[0].cells[colIndex].firstChild.type == "text") {
									data = row[0].cells[colIndex].firstChild.value;
									
									if (column != "AppUnit") {
										if (data == "") {
											if (columnValidation == "int" || columnValidation == "decimal")
												rowData += '|' + column + '="0"';
											else if (columnValidation == "datetime")
												rowData += '|' + column + '=Null';
											else
												rowData += '|' + column + '=""';
										}
										else {
											if (columnValidation == "phone")
												rowData += '|' + column + '=' + '"' + fin.cmn.text.mask.phone(data, true) + '"';
											else
												rowData += '|' + column + '=' + '"' + ui.cmn.text.xml.encode(data) + '"';
										}
									}
								}
								else if (row[0].cells[colIndex].firstChild.type == "checkbox") {
									data = row[0].cells[colIndex].firstChild.checked;
									rowData += '|' + column + '=' + '"' + data + '"';
								}
								else if (row[0].cells[colIndex].firstChild.type == "select-one") {
									data = row[0].cells[colIndex].firstChild.value;
									if (data == "" || data == "0")
										rowData += '|' + column + '=Null';
									else
										rowData += '|' + column + '=' + '"' + ui.cmn.text.xml.encode(data) + '"';
								}
							}
						}

						id = me.moduleColumnDatas[index].primeColumn;
						rowsData += 'id=' + id + rowData + '|#';
						data = "";
						column = "";
						rowData = "";
					}
				}			
				
				me.reportId = me.reports[me.report.indexSelected].id;
				
				xml = '<adhReportUpdate '
					+ ' id="' + me.reportId + '"'
					+ ' rowsData="' + ui.cmn.text.xml.encode(rowsData) + '"'
					+ ' />';
			}
			else if (me.status == "audit") {
				xml = '<adhReportAuditUpdate '
					+ ' id="' + me.reportId + '"'
					+ ' />';
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
				if (me.status == "save") {					
					$("#selPageNumber").val(me.pageCurrent);
					$("#AdhReportItemGridBody").html("");
					
					me.rowModifed = false;
					me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
					me.endPoint = (me.startPoint + me.maximumRows) - 1;					
					me.adhFileNameStore.reset();
					me.loadModuleColumnData();
				}				
			}
			else {				
				alert("[SAVE FAILURE] Error while updating the Ad-Hoc Report: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").hide();
			}

			me.status = "";
		}
	}
});

function loadPopup() {
	centerPopup();
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupSite").fadeIn("slow");
}

function hidePopup() {
	$("#backgroundPopup").fadeOut("slow");
	$("#popupSite").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupSite").width();
	var popupHeight = $("#popupSite").height();

	$("#popupSite").css({
		"top": (windowHeight/2 - popupHeight/2) + document.documentElement.scrollTop,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.reportUi = new fin.adh.UserInterface();
	fin.reportUi.resize();
}
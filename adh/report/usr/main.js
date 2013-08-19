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
ii.Import( "fin.cmn.usr.ui.core" );
ii.Import( "fin.cmn.usr.ui.widget" );
ii.Import( "fin.cmn.usr.multiselect" );

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
ii.Style( "fin.cmn.usr.multiselect", 14 );

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
			me.descriptionAccount = 0;
			me.loadDependentTypes = [];
			me.gridData = [];
			me.typesCache = [];
			me.invoiceCache = [];
 			me.editSalesTax = false;
			
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
			
			// Job module
			me.jobTypeCache = [];
			me.geoCodeCache = [];
			
			me.pkeyId = -1;
 			me.invoiceItem = false;
			
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
			me.moduleStore.fetch("userId:[user]", me.modulesLoaded, me);
			me.reportStore.fetch("userId:[user],active:1", me.reportLoaded, me);
			me.userStore.fetch("userId:[user]", me.loggedInUsersLoaded, me);
			me.stateTypeStore.fetch("userId:[user]", me.typesLoaded, me);
			me.accountStore.fetch("userId:[user],moduleId:invoice", me.accountsLoaded, me);
 			me.taxableServiceStore.fetch("userId:[user]", me.taxableServicesLoaded, me);
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$("#divAdhReportGrid").bind("scroll", me.adhReportGridScroll);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
			$("#divFilterHeader").hide();
			$("#FilterGrid").hide();
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
			$("#divFilterGrid").height($(window).height() - 145);
			$("#divAdhReportGrid").css({"width" : divAdhReportGridWidth + "px", "height" : divAdhReportGridHeight + "px"});
		},
		
		adhReportGridScroll: function() {
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
			
			me.modules = [];
			me.moduleStore = me.cache.register({
				storeId: "appModules",
				itemConstructor: fin.adh.Module,
				itemConstructorArgs: fin.adh.moduleArgs,
				injectionArray: me.modules
			});
			
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
			
			me.budgetLaborCalcMethods = [];
			me.budgetLaborCalcMethodStore = me.cache.register({
				storeId: "budgetLaborCalcMethods",
				itemConstructor: fin.adh.BudgetLaborCalcMethod,
				itemConstructorArgs: fin.adh.budgetLaborCalcMethodArgs,
				injectionArray: me.budgetLaborCalcMethods
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
			
			me.unionStatusTypes = [];
			me.unionStatusTypeStore = me.cache.register({
				storeId: "unionStatusTypes",
				itemConstructor: fin.adh.UnionStatusType,
				itemConstructorArgs: fin.adh.unionStatusTypeArgs,
				injectionArray: me.unionStatusTypes	
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
			me.transactionStatusTypes = [];
			me.transactionStatusTypeStore = me.cache.register({
				storeId: "appTransactionStatusTypes",
				itemConstructor: fin.adh.TransactionStatusType,
				itemConstructorArgs: fin.adh.transactionStatusTypeArgs,
				injectionArray: me.transactionStatusTypes	
			});

			me.invoiceAddressTypes = [];
			me.invoiceAddressTypeStore = me.cache.register({
				storeId: "revInvoiceAddressTypes",
				itemConstructor: fin.adh.InvoiceAddressType,
				itemConstructorArgs: fin.adh.invoiceAddressTypeArgs,
				injectionArray: me.invoiceAddressTypes
			});

			me.invoiceBillTos = [];
            me.invoiceBillToStore = me.cache.register({
                storeId: "revInvoiceBillTos",
                itemConstructor: fin.adh.InvoiceBillTo,
                itemConstructorArgs: fin.adh.invoiceBillToArgs,
                injectionArray: me.invoiceBillTos
            });

			//Job
			me.jobTypes = [];
			me.jobTypeStore = me.cache.register({
				storeId: "jobTypes", //jobTypes
				itemConstructor: fin.adh.JobType,
				itemConstructorArgs: fin.adh.jobTypeArgs,
				injectionArray: me.jobTypes	
			});
						
			me.invoiceTemplates = [];
			me.invoiceTemplateStore = me.cache.register({
				storeId: "revInvoiceTemplates",
				itemConstructor: fin.adh.InvoiceTemplate,
				itemConstructorArgs: fin.adh.invoiceTemplateArgs,
				injectionArray: me.invoiceTemplates
			});
			
			me.invoiceItems = [];
			me.invoiceItemStore = me.cache.register({
				storeId: "revInvoiceItems",
				itemConstructor: fin.adh.InvoiceItem,
				itemConstructorArgs: fin.adh.invoiceItemArgs,
				injectionArray: me.invoiceItems
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.adh.Account,
				itemConstructorArgs: fin.adh.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.taxableServices = [];
			me.taxableServiceStore = me.cache.register({
				storeId: "revTaxableServices",
				itemConstructor: fin.adh.TaxableService,
				itemConstructorArgs: fin.adh.taxableServiceArgs,
				injectionArray: me.taxableServices
			});
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
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

		modulesLoaded: function(me, activeId) {

			for (var index = 0; index < me.modules.length; index++) {
				me.typesCache[me.modules[index].name] = {};
				me.typesCache[me.modules[index].name].typesLoaded = false;
			}
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
				me.typesLoadedCount = 0;
				me.reportId = me.reports[me.report.indexSelected].id;
				me.reportName = me.reports[me.report.indexSelected].name;
				me.loadTypes();
				me.reportFilterStore.fetch("userId:[user],report:" + me.reportId + ",", me.reportFiltersLoaded, me);
			}
			
			if (me.report.indexSelected > 0)
				me.anchorLoad.display(ui.cmn.behaviorStates.enabled);
			else
				me.anchorLoad.display(ui.cmn.behaviorStates.disabled);
		},
		
		loadTypes: function() {
			var me = this;
			var itemIndex = 0;
			var moduleAssociate = "";
			var associatedModules = [];
			var modulesList = [];

			if (me.report.indexSelected > 0) {
				itemIndex = ii.ajax.util.findIndexById(me.reports[me.report.indexSelected].module.toString(), me.modules);
				modulesList.push(me.modules[itemIndex].name);
				moduleAssociate = me.reports[me.report.indexSelected].moduleAssociate;
				
				if (me.modules[itemIndex].name == "Invoice Items") 
					me.invoiceItem = true;
				else 
					me.invoiceItem = false;
					
				if (moduleAssociate != "0") {
					associatedModules = moduleAssociate.split("#");
					for (var index = 0; index < associatedModules.length; index++) {
						itemIndex = ii.ajax.util.findIndexById(associatedModules[index].toString(), me.modules);
						modulesList.push(me.modules[itemIndex].name);
					}
				}
			}

			for (var index = 0; index < modulesList.length; index++) {
				if (!me.typesCache[modulesList[index]].typesLoaded) {
				
					switch (modulesList[index]) {
						case "HirNode":
							break;
							
						case "Site":
							me.typesLoadedCount = 1;
							me.stateTypeStore.reset();
							me.siteMasterStore.fetch("userId:[user],siteId:1", me.typesLoaded, me);
							break;
							
						case "Unit":
							break;
							
						case "House Code":
							me.typesLoadedCount = 4;
							me.invoiceLogoTypeStore.reset();
							me.serviceTypeStore.fetch("userId:[user],", me.typesLoaded, me);
							me.contractTypeStore.fetch("userId:[user]", me.typesLoaded, me);
							me.payPayrollCompanyStore.fetch("userId:[user]", me.typesLoaded, me);
							me.jdeCompanysStore.fetch("userId:[user]", me.typesLoaded, me);
							break;
							
						case "Person":
							break;
							
						case "User":
							break;
							
						case "Employee":
							me.typesLoadedCount = 12;							
							me.localTaxCodeStore.fetch("payrollCompany:0,appState:0,userId:[user]", me.typesLoaded, me);
							me.maritalStatusStateTaxTypeSecondaryStore.fetch("appState:0,userId:[user]", me.typesLoaded, me);
							me.statusTypeStore.fetch("userId:[user],personId:0", me.typesLoaded, me);
							me.payFrequencyTypeStore.fetch("userId:[user]", me.typesLoaded, me);
							me.federalAdjustmentStore.fetch("userId:[user]", me.typesLoaded, me);
							me.unionStatusTypeStore.fetch("userId:[user],", me.typesLoaded, me);
							me.sdiAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.typesLoaded, me);
							me.stateAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.typesLoaded, me);
							me.maritalStatusFederalTaxTypeStore.fetch("userId:[user],", me.typesLoaded, me);
							me.payrollCompanyStore.fetch("userId:[user]", me.typesLoaded, me);
							me.localTaxAdjustmentTypeStore.fetch("appState:0,userId:[user]", me.typesLoaded, me);
							me.separationCodeStore.fetch("userId:[user],terminationType:0,", me.typesLoaded, me);
							
							break;
							
						case "Invoice":
							me.typesLoadedCount = 3;
							me.invoiceLogoTypeStore.reset();
							me.transactionStatusTypeStore.fetch("userId:[user]", me.typesLoaded, me);
							me.invoiceLogoTypeStore.fetch("userId:[user]", me.typesLoaded, me);
							me.invoiceAddressTypeStore.fetch("userId:[user]", me.typesLoaded, me);
							break;
							
						case "Job":
							me.typesLoadedCount = 2;
							me.invoiceTemplateStore.fetch("userId:[user]", me.typesLoaded, me);
							me.jobTypeStore.fetch("userId:[user],", me.typesLoaded, me);
							break;
					}
					
					me.typesCache[modulesList[index]].typesLoaded = true;
				}
			}
		},
		
		typesLoaded: function(me, activeId) {

			me.typesLoadedCount--;
			if (me.typesLoadedCount <= 0)
				me.setReportFilters();
		},

		reportFiltersLoaded: function(me, activeId) {

			me.typesLoadedCount--;
			if (me.typesLoadedCount <= 0)
				me.setReportFilters();
		},
		
		setReportFilters: function() {
			var me = this;
			var rowData = "";
			var rowHeadData = "";
			var dateControls = [];
			
			if (me.reportFilters.length > 0) {
				rowHeadData = "<th class='gridHeaderColumn' width='25%'>Title</th><th class='gridHeaderColumn' width='22%'>Filter</th><th class='gridHeaderColumn' width='40%'>Value</th><th class='gridHeaderColumn' width='13%'>Operator</th>";  
				//rowData += "<tr><td><div id='divFilterGrid' style='overflow: scroll'><table id='tblFilterGrid' cellpadding='0' cellspacing='0' style='width: 500px'>";
				
				for (var index = 0; index < me.reportFilters.length; index++) {
					rowData += "<tr>";
					rowData += "<td class='gridColumn' width='25%'>" + me.reportFilters[index].name + ':' + "</td>";
					
					if (me.reportFilters[index].referenceTableName == "") {
						contorlValidation = me.reportFilters[index].validation;
						if (contorlValidation == "bit") {
							rowData += "<td class='gridColumnOperator' align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'bit') + "</td><td class='gridColumnValue'></td>";
						}
						else if (contorlValidation.toLowerCase() == "datetime" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td class='gridColumnOperator' align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'datetime') + "</td>";
							rowData += "<td class='gridColumnValue' align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "datetime" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td class='gridColumnValue' align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "int" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td class='gridColumnOperator' align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'int') + "</td>";
							rowData += "<td class='gridColumnValue' align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "int" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td class='gridColumnValue' align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "decimal" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td class='gridColumnOperator' align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'decimal') + "</td>";
							rowData += "<td class='gridColumnValue' align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (contorlValidation.toLowerCase() == "decimal" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td class='gridColumnValue' align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator == 1) {
							rowData += "<td class='gridColumnOperator' align='left'>" + me.populateOperatorDropDown(me.reportFilters[index].title, 'text') + "</td>";
							rowData += "<td class='gridColumnValue' align='left'><input  class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar" && me.reportFilters[index].columnTypeFilter == 1 && me.reportFilters[index].columnTypeOperator != 1) {
							rowData += "<td class='gridColumnValue' align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input>";
							rowData += "<input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "_1' style='display:none'></input></td>";
						}
						else {
							rowData += "<td class='gridColumnValue' align='left'><input class='inputTextSize' type='text' id='" + me.reportFilters[index].title + "'></input></td>";
						}
					}
					else 
						rowData += "<td class='gridColumnOperator'></td><td class='gridColumnValue' align='left'>" + me.populateFilterDropDown(me.reportFilters[index].referenceTableName, me.reportFilters[index].title) + "</td>";
						
					rowData += "<td align='left' width='13%'>" + me.populateOperatorDropDown(me.reportFilters[index].title + "_andOr", 'andOrOperator') + "</td>";
					rowData += "</tr>"
				}
				
				rowData += "<tr height='100%'><td id='tdLastRow' colspan='4' class='gridColumnRight' style='height: 100%'>&nbsp;</td></tr>";
			}
			
			$("#FilterGridHead").html(rowHeadData);
			$("#FilterGridBody").html(rowData);
									
			$("#FilterGridBody tr:odd").addClass("gridRow");
        	$("#FilterGridBody tr:even").addClass("alternateGridRow");
			
			$("#FilterGridBody tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
			
			if (me.reportFilters.length > 0) {
				$("#divFilterHeader").show();
				$("#FilterGrid").show();
				$("#divFilterGrid").height($(window).height() - 145);
			}
			else {
				$("#divFilterHeader").hide();
				$("#FilterGrid").hide();
				$("#FilterGridBody tr").mouseover(function() {
					$(this).removeClass("trover");});
			}	
				
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
				else if (me.reportFilters[index].referenceTableName != "") {
					$("#" + me.reportFilters[index].title).multiselect({
						minWidth: 185
						, header: false
						, noneSelectedText: ""
						, selectedList: 5
						, create: function(){ $(this).next().width(182); }
//						, selectedText: function(numChecked, numTotal, checkedItems) {
//							return numChecked + ' of ' + numTotal + ' checked';   
//						}
//						, selectedText: function(selected, total, list) {
//							var selectedTitle = "";
//							for (var index =0; index < list.length; index++) {
//								if (selectedTitle == "")
//									selectedTitle = list[index].title;
//								else
//									selectedTitle += ", " + list[index].title;
//							}
//							return selectedTitle; 
//						}
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

		actionLoadItem: function() {
			var me = this;
			var index = ii.ajax.util.findIndexById(me.reports[me.report.indexSelected].module.toString(), me.modules);
			var houseCodeAssociated = me.modules[index].houseCodeAssociated;
			
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

			if (me.delimitedOrgSelectedNodes == "" && (houseCodeAssociated || me.reports[me.report.indexSelected].moduleAssociate != 0)) {
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
			var operator = 'And';
			var filterStatement;
			
			for (var index = 0; index < me.moduleColumnHeaders.length; index++) {
				if (me.moduleColumnHeaders[index].columnType != 2)
					width += me.moduleColumnHeaders[index].columnWidth;
			}
			
			if (me.delimitedOrgSelectedNodes == "")
				width -= 100;
			
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
				
				if (me.delimitedOrgSelectedNodes == "") 
					className = "gridColumnHidden";
				else 
					className = "gridHeaderColumn";
				
				if (me.invoiceItem) {
					rowData += "<th class='gridHeaderColumn' width='50px'>#</th>";
					rowData += "<th class='gridColumnHidden'></th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>House Code</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Job</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Taxable Service</th>";
					rowData += "<th class='gridHeaderColumn' width='200px'>Account Code</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Quantity</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Price</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Total</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Status</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Taxable</th>";
					rowData += "<th class='gridHeaderColumn' width='100px'>Show</th>";
					rowData += "<th class='gridHeaderColumn' width='300px'>Description</th>";
					$("#tblAdhReportGridHeader").width("1510");
					$("#tblAdhReportGrid").width("1510");
				}
				else {
					rowData += "<th onclick=(fin.reportUi.sortColumn(-1)); class='" + className + "' style='width:100px;'>House Code</th>";
					
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
				}
			}
				
			$("#AdhReportItemGridHead").html(rowData);
			
			me.filter = "";
			
			for (var index = 0; index < me.reportFilters.length; index++) {
				
				if ($("#sel" + me.reportFilters[index].title + "_andOr").val() == 2) 
					operator = "Or";
				else 
					operator = "And";
				
				if (me.reportFilters[index].validation.toLowerCase() == "bit" && $("#sel" + me.reportFilters[index].title).val() != "") {
					me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#sel" + me.reportFilters[index].title).val() + "') " + operator + "";
				}
				else 
					if ($("#" + me.reportFilters[index].title).val() != null && $("#" + me.reportFilters[index].title).val() != "") {
						if ($("#" + me.reportFilters[index].title).val() != "0") {
							if (me.reportFilters[index].referenceTableName != "") { //dropdown selection
								var inQuery = "In (";
								var selectedValues = $("#" + me.reportFilters[index].title).multiselect("getChecked").map(function(){
									return this.value;
								}).get();
								for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
									inQuery += ((selectedIndex == 0) ? selectedValues[selectedIndex] : ", " + selectedValues[selectedIndex]);
								}
								inQuery += ")";
								me.filter += "(" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " " + inQuery + ") " + operator + " ";
							}
							else 
								if (me.reportFilters[index].validation.toLowerCase() == "datetime") {
									if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
										me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
									}
									else 
										if ($("#sel" + me.reportFilters[index].title).val() == 2) {
											me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <= '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
										}
										else 
											if ($("#sel" + me.reportFilters[index].title).val() == 3) {
												me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " >= '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
											}
											else 
												if ($("#" + me.reportFilters[index].title + "_1").val() != "" && $("#sel" + me.reportFilters[index].title).val() == 4) {
													me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Between '" + $("#" + me.reportFilters[index].title).val() + "' And '" + $("#" + me.reportFilters[index].title + "_1").val() + "') " + operator + "";
												}
												else 
													if ($("#sel" + me.reportFilters[index].title).val() == 5) {
														me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <> '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
													}
								}
								else 
									if (me.reportFilters[index].validation.toLowerCase() == "int" || me.reportFilters[index].validation.toLowerCase() == "decimal") {
										if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
											me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
										}
										else 
											if ($("#sel" + me.reportFilters[index].title).val() == 2) {
												me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <= '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
											}
											else 
												if ($("#sel" + me.reportFilters[index].title).val() == 3) {
													me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " >= '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
												}
												else 
													if ($("#" + me.reportFilters[index].title + "_1").val() != "" && $("#sel" + me.reportFilters[index].title).val() == 4) {
														me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Between '" + $("#" + me.reportFilters[index].title).val() + "' And '" + $("#" + me.reportFilters[index].title + "_1").val() + "') " + operator + "";
													}
													else 
														if ($("#sel" + me.reportFilters[index].title).val() == 5) {
															me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " <> '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
														}
									}
									else 
										if (me.reportFilters[index].columnDataType.toLowerCase() == "varchar") {
											if ($("#sel" + me.reportFilters[index].title).val() == 1 || $("#sel" + me.reportFilters[index].title).val() == undefined) {
												me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " = '" + $("#" + me.reportFilters[index].title).val() + "') " + operator + "";
											}
											else 
												if ($("#sel" + me.reportFilters[index].title).val() == 2) {
													me.filter += " (" + me.reportFilters[index].tableName + "." + me.reportFilters[index].title + " Like '%" + $("#" + me.reportFilters[index].title).val() + "%') " + operator + "";
												}
										}
						}
					}
			}
			
			filterStatement = me.filter;
			if (me.filter != "") {
				me.filter = filterStatement.substr(0, filterStatement.length - 4);
				me.filter = "And (" + me.filter + ")";
			}
			
			me.reportTotalRowStore.fetch("userId:[user],report:" + me.reportId 
			+ ",hirNode:" + me.delimitedOrgSelectedNodes 
			+ ",filter:" + me.filter
			+ ",", me.recordCountsLoaded, me);	
			
			me.loadModuleColumnData();
		},

		loadModuleColumnData: function() {
			var me = this;

			if (me.sortColumns == "") {
				if (me.delimitedOrgSelectedNodes != "")
					me.sortColumns = "HcmHouseCodes.HcmHouseCode#Asc|";
				else
					me.sortColumns = "HcmJobs.HcmJob#Asc|";
			}	
			
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
			var invoiceIdColumn = -1;
			var invoiceId = -1;
			var invoiceNoColumn = -1;
			var invoiceNo = -1;
			
			me.gridData = [];
			
			for (var index = 0; index < me.moduleColumnHeaders.length; index++) {
				if (me.moduleColumnHeaders[index].title == "RevInvoice") 
					invoiceIdColumn = index;
				if (me.moduleColumnHeaders[index].title == "RevInvInvoiceNumber") 
					invoiceNoColumn = index;
			}
		
			if (me.moduleColumnDatas.length > 0) {
				for(var index = 0; index < me.moduleColumnDatas.length; index++) {
					var pkId = me.moduleColumnDatas[index].primeColumn;
					var houseCode = me.moduleColumnDatas[index].houseCode;
					var houseCodeId = fin.reportUi.moduleColumnDatas[index].houseCodeId;
					var appSite = me.moduleColumnDatas[index].appSite;
					var appSitTitle = me.moduleColumnDatas[index].appSitTitle;
					
					if (invoiceIdColumn != -1) {
						invoiceId = unescape(me.moduleColumnDatas[index]["column" + (invoiceIdColumn + 1)]);
						invoiceNo = unescape(me.moduleColumnDatas[index]["column" + (invoiceNoColumn + 1)]);
					}
					
					if (!me.invoiceItem) {
						rowData += "<tr id='adhReportDataRow" + pkId + "' onclick=(fin.reportUi.getAdhReprotGridRowEdit(" + pkId + "," + index + "," + houseCodeId + "));>";	
						rowData += me.getAdhReprotDetailGridRow(index, pkId, houseCode, appSite, appSitTitle);
						rowData += "</tr>"	
					}
					else {	
						if (invoiceId == "")
							invoiceId = -1;
						rowData += "<tr>"
						rowData += "<td colspan='100'>"
						rowData += "<div >"
						rowData += "<table width='100%' class='invoiceTable'>"
						rowData += "<tr onclick='fin.reportUi.invoiceItemsLoad(" + index + "," + invoiceId + ");'>";
						rowData += "<td class='gridColumn' style='font-weight:bold; border-bottom:solid 2px #99bbe8'><img id='expandCollapse" + index + "' src='/fin/cmn/usr/media/Common/Plus.gif' style='cursor: pointer' alt='expand/collapse' title='expand/collapse' />  Invoice #: " + invoiceNo + "</td>"
						rowData += "</tr>";
						rowData += "<tr id='InvoiceDetailsRow" + index + "'></tr>"
						rowData += "</table>"
						rowData += "</div>"
						rowData += "</td>"
						rowData += "</tr>"
					}	
				}				
			}

			rowData += '<tr height="100%"><td id="tdLastRow" colspan="' + (me.moduleColumnHeaders.length + 2) + '" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';

			$("#AdhReportItemGridBody").html(rowData);
			
			if (!me.invoiceItem) {
				$("#AdhReportItemGridBody tr:odd").addClass("gridRow");
				$("#AdhReportItemGridBody tr:even").addClass("alternateGridRow");
				$("#AdhReportItemGridBody tr").mouseover(function(){
					$(this).addClass("trover");
				}).mouseout(function(){
					$(this).removeClass("trover");
				});
			}

			$("#pageLoading").hide();	
		},
		
		getAdhReprotDetailGridRow: function() {			
			var args = ii.args(arguments, {
				index: {type: Number}
				, pkId: {type: Number}
				, houseCode: {type: String}
			    , appSite: {type: Number}
				, appSitTitle: {type: String}
			});
			var me = this;
			var keyValue = {}; 
			var rowData = "";
			var dataValue = "";
			var className = "gridColumn";

			me.gridData[args.pkId] = {};
			me.gridData[args.pkId].buildQueue = [];
		
			if (me.delimitedOrgSelectedNodes == "")
				className = "gridColumnHidden";

			rowData += "<td id='HouseCode" + args.houseCode + "' class='" + className + "' style='width:100px;'>" + args.houseCode + "</td>";
			className = "gridColumn";

			for (var index = 0; index < me.moduleColumnHeaders.length; index++) { 
				var posTypeTable = me.moduleColumnHeaders[index].referenceTableName;
				var typeTable = "";
				var columnName = "";
				var argName = me.moduleColumnHeaders[index].title;
				var value = "";
				
				if (argName == "AppUnit")
					value = unescape(args.appSitTitle);
				else
					value = unescape(me.moduleColumnDatas[args.index]["column" + (index + 1)]);

				if (posTypeTable != "") {
					columnName = me.moduleColumnHeaders[index].title;
					typeTable = me.moduleColumnHeaders[index].referenceTableName;
					
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

				if (index == me.moduleColumnHeaders.length - 1)
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
				var posTTable = "";
				if (row[0].cells[index].attributes["style"] != undefined)
					style = row[0].cells[index].attributes["style"].value;
				me.columnType = 0;
				rowData = "";
				argValue = ui.cmn.text.xml.decode(row[0].cells[index].innerHTML);
				className = row[0].cells[index].className;
				
				if (row[0].cells[index].id == "RevInvBillTo") 
					row[0].cells[index].id = "RevInvBillTo_RevInvBillTos";

				argscolumn = row[0].cells[index].id;

				if (index > 0) {
					if (argscolumn != "" && argscolumn != "AppSite"){
						posTTable = me.moduleColumnHeaders[index - 1].referenceTableName;
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
				
				if (posTTable != "") {
					argName = me.moduleColumnHeaders[index - 1].title;
					argTypeTable = me.moduleColumnHeaders[index - 1].referenceTableName;

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
							if (argscolumn == "RevInvTaxExempt")
								rowData = "<td class='" + className + "' align='center' style='" + style + "'><input type='checkbox' onChange='fin.reportUi.taxExemptChange(\'" + pkId + "\',\'" + houseCodeId + "\');fin.reportUi.modified(true);' name='" + argName + "' id='" + argName + "' value='" + dataValue + "'" + (dataValue == "1" ? checked='checked' : '') + "></input></td>";
							else if (argscolumn == "HcmJobPostalCode")
								rowData = "<td class='" + className + "' style='" + style + "'><input type='text' style='width:" + columnWidth + "px;' onblur=fin.reportUi.postalCodeChange(this); onchange=fin.reportUi.modified(true); fin.reportUi.dataValidation(\'" + fin.reportUi.columnValidation + "\', \'" + argName + "\'); id='" + argName + "' value='" + dataValue + "' maxlength='" + columnLength + "'></input></td>";
							else if (me.columnValidation.toLowerCase() == "bit")
								rowData = "<td class='" + className + "' align='center' style='" + style + "'><input type='checkbox' onchange=fin.reportUi.modified(true); name='" + argName + "' id='" + argName + "' value='" + dataValue + "'" + (dataValue == "1" ? checked='checked' : '') + "></input></td>";
							else
								rowData = "<td class='" + className + "' style='" + style + "'><input type='text' style='width:" + columnWidth + "px;' onblur='fin.reportUi.dataValidation(\"" + fin.reportUi.columnValidation + "\", \"" + argName + "\");' id='" + argName + "' value=\"" + dataValue + "\" onchange=\"fin.reportUi.modified(true);\" maxlength='" + columnLength + "'></input></td>";
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
					
					case "HcmJobGEOCode":
						me.geoCodeCheck(rowId, searchValue, columnValue);
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
				|| args.columnName == "RevInvBillTo" || args.columnName == "HcmJobGEOCode"
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
				else if (args.columnName == "HcmJobGEOCode")
	 				typeTable.searchValue = me.gridData[args.pkId].buildQueue[0]["HcmJobPostalCode"];
				me.loadDependentTypes.push(typeTable);
				dependentTypeFound = true;
			}

			typeTableData = me.getTypeTableData(args.typeTable, args.columnName);

			if (args.columnName == "EmpStatusType") 
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.statusTypeChange(this);fin.reportUi.modified(true);'>";	
			else if (args.columnName == "EmpTerminationReasonType")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.terminationReasonTypeChange(this);fin.reportUi.modified(true);'>";
			else if (args.columnName == "PayPayrollCompany")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.payrollCompanyChange(this);fin.reportUi.modified(true);'>";
			else if (args.columnName == "EmpEmpgPrimaryState")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.primaryStateChange(this);fin.reportUi.modified(true);'>";
			else if (args.columnName == "EmpEmpgSecondaryState")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.secondaryStateChange(this);fin.reportUi.modified(true);'>";
			else if (args.columnName == "HcmJobGEOCode")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.geoCodeChange(this);fin.reportUi.modified(true);'>";
			else if (args.columnName == "RevInvBillTo")
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange='fin.reportUi.invBillToChange('" + args.pkId + "','" + args.houseCodeId + "');fin.reportUi.modified(true);'>";
			else
				rowHtml = "<select id='" + args.columnName + '_' + args.pkId + "' style='width:" + columnWidth + "px;' onblur=fin.reportUi.resetValidation(\'" + args.columnName + "_" + args.pkId + "\'); onChange=fin.reportUi.modified(true);>";

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

		invoiceItemsLoad: function() {
			var args = ii.args(arguments, {
				pkId: {type: Number}
				, invoiceId: {type: Number}
			});
			
			var me = this;
			var invoiceId = args.invoiceId;
			me.pkeyId = args.pkId;
			//me.invoiceItemStore.fetch("userId:[user],invoiceId:" + invoiceId, me.invoiceItemsLoaded, me);
			
			if (me.invoiceCache[invoiceId] != undefined) {

	            if (me.invoiceCache[invoiceId].loaded)
					me.invoiceValidate(invoiceId, args.pkId);              
	            else
	                me.invoiceCache[invoiceId].buildQueue.push(args.pkId);
	        }
	        else
	            me.invoiceLoad(invoiceId, args.pkId);
		},
		
		invoiceValidate: function(invoiceId,pkId) {
		    var me = this;
			
		    if (me.invoiceCache[invoiceId].valid) {
				me.invoiceItemsLoaded(invoiceId, pkId);
		    }
		},
		
		invoiceLoad: function(invoiceId, pkId) {
			var me = this;
			
		    me.invoiceCache[invoiceId] = {};
		    me.invoiceCache[invoiceId].valid = false;
		    me.invoiceCache[invoiceId].loaded = false;
		    me.invoiceCache[invoiceId].buildQueue = [];
			me.invoiceCache[invoiceId].invoiceItems = [];
		    me.invoiceCache[invoiceId].buildQueue.push(pkId);
			me.invoiceCache[invoiceId].id = invoiceId;
			
	        $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/adh/act/provider.aspx",
                data: "moduleId=adh&requestId=1&targetId=iiCache"
					+ "&requestXml=<criteria>storeId:revInvoiceItems,userId:[user],"
					+ "invoiceId:" + invoiceId + ",<criteria>",
                  
                 success: function(xml) {
  	                $(xml).find("item").each(function() {
	                    var invoice = {};
	                	invoice.id = $(this).attr("id");
	                	invoice.invoiceId = $(this).attr("invoiceId");
						invoice.houseCodeId = $(this).attr("houseCodeId");
						invoice.hirNodeId = $(this).attr("hirNodeId");
						invoice.houseCode = $(this).attr("houseCode");
						invoice.houseCodeJob = $(this).attr("houseCodeJob");
	                	invoice.taxableService = $(this).attr("taxableService");
						invoice.jobBrief = $(this).attr("jobBrief");
						invoice.jobTitle = $(this).attr("jobTitle");
						invoice.overrideSiteTax = $(this).attr("overrideSiteTax");
						invoice.account = $(this).attr("account");
	                	invoice.statusType = $(this).attr("statusType");
						invoice.quantity = $(this).attr("quantity");
						invoice.price = $(this).attr("price");
						invoice.amount = $(this).attr("amount");
						invoice.taxable = $(this).attr("taxable");
	                	invoice.lineShow = $(this).attr("lineShow");
						invoice.description = $(this).attr("description");
						invoice.recurringFixedCost = $(this).attr("recurringFixedCost");
						invoice.version = $(this).attr("version");
						invoice.displayOrder = $(this).attr("displayOrder");
	                	me.invoiceCache[invoiceId].invoiceItems.push(invoice);
	                });
					
					me.invoiceCache[invoiceId].valid = true;
					me.invoiceCache[invoiceId].loaded = true;
					//validate the list of rows
		            me.invoiceValidate(invoiceId, pkId);
				}
			});
		},
		
		invoiceItemsLoaded: function(invoiceId, pkId) {
			var me = this;
			var index = 0;
			var rowHtml = "";
			var subTotal = 0;
			var salesTax = 0;
			var salesTaxTotal = 0;
			var total = 0;
			var rowNumber = 0;
			var overrideSiteTax = false;
			var houseCodeJobChanged = false;
			var houseCode = 0;
			var houseCodeJob = 0;
			var itemIndex = -1;
			var displayOrderSet = false;
			var invoiceRowHtml = "";
			var emptyRowHtml = "";

			if (me.invoiceCache[invoiceId].invoiceItems.length > 0) {
				if (me.invoiceCache[invoiceId].invoiceItems[0].displayOrder > 0)
					displayOrderSet = true;
			}
			
			if (displayOrderSet) {
				for (index = 0; index < me.invoiceCache[invoiceId].invoiceItems.length; index++) {
					if (me.invoiceCache[invoiceId].invoiceItems[index].account == 120) {
						salesTax = parseFloat(me.invoiceCache[invoiceId].invoiceItems[index].amount);
						salesTaxTotal += salesTax;
					}
					rowNumber++;
					invoiceRowHtml += me.getItemGridRow(rowNumber, index, invoiceId);
					if (me.invoiceCache[invoiceId].invoiceItems[index].account != me.descriptionAccount && me.invoiceCache[invoiceId].invoiceItems[index].account != 120)
						subTotal += parseFloat(me.invoiceCache[invoiceId].invoiceItems[index].amount);
				}
			}
			else {
				for (index = 0; index < me.invoiceCache[invoiceId].invoiceItems.length; index++) {
					if (houseCode != me.invoiceCache[invoiceId].invoiceItems[index].houseCode || houseCodeJob != me.invoiceCache[invoiceId].invoiceItems[index].houseCodeJob) {
						if (houseCode != me.invoiceCache[invoiceId].invoiceItems[index].houseCode && houseCode != 0)
							houseCodeJobChanged = true;
						else if (houseCodeJob != 0 && (overrideSiteTax != me.invoiceCache[invoiceId].invoiceItems[index].overrideSiteTax || me.invoiceCache[invoiceId].invoiceItems[index].overrideSiteTax))
							houseCodeJobChanged = true;
						
						houseCode = me.invoiceCache[invoiceId].invoiceItems[index].houseCode;
						houseCodeJob = me.invoiceCache[invoiceId].invoiceItems[index].houseCodeJob;
						overrideSiteTax = me.invoiceCache[invoiceId].invoiceItems[index].overrideSiteTax;
					}
	
					if (houseCodeJobChanged) {
						houseCodeJobChanged = false;
						if (itemIndex != -1) {
							rowNumber++;
							invoiceRowHtml += me.getItemGridRow(rowNumber, itemIndex, invoiceId);
							itemIndex = -1;
						}
					}
	
					if (me.invoiceCache[invoiceId].invoiceItems[index].account == 120) {
						itemIndex = index;
						salesTax = parseFloat(me.invoiceCache[invoiceId].invoiceItems[index].amount);
						salesTaxTotal += salesTax;
					}
					else {
						rowNumber++;
						invoiceRowHtml += me.getItemGridRow(rowNumber, index, invoiceId);
						if (me.invoiceCache[invoiceId].invoiceItems[index].account != me.descriptionAccount)
							subTotal += parseFloat(me.invoiceCache[invoiceId].invoiceItems[index].amount);
					}
				}
	
				if (me.invoiceCache[invoiceId].invoiceItems.length > 0) {
					if (itemIndex != -1) {																						
						rowNumber++;
						invoiceRowHtml += me.getItemGridRow(rowNumber, itemIndex, invoiceId);
					}
				}
			}

			total = subTotal + salesTaxTotal;
			invoiceRowHtml += me.getTotalGridRow(0, subTotal, "Sub Total:", "");
			invoiceRowHtml += me.getTotalGridRow(0, salesTaxTotal, "Sales Tax Total:", "");
			invoiceRowHtml += me.getTotalGridRow(0, total, "Total:", "");
			invoiceRowHtml += "<tr height='100%'><td id='tdLastInvoiceRow' colspan='12' class='gridColumn' style='height: 100%'>&nbsp;</td></tr>";
			
			var invoiceDetailsRow = $("#InvoiceDetailsRow" + pkId);
			
			if ($("#expandCollapse" + pkId).attr('src') == '/fin/cmn/usr/media/Common/Plus.gif') {
				invoiceDetailsRow.html(invoiceRowHtml);
        		$("#InvoiceDetailsRow" + pkId + " tr:odd").addClass("gridRow");
				$("#InvoiceDetailsRow" + pkId + " tr:even").addClass("alternateGridRow");
				$("#InvoiceDetailsRow" + pkId + " tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
				$("#expandCollapse" + pkId).attr('src','/fin/cmn/usr/media/Common/Minus.gif');
			}	
		    else {
				invoiceDetailsRow.html(emptyRowHtml);
				$("#expandCollapse" + pkId).attr('src','/fin/cmn/usr/media/Common/Plus.gif');
			}
		},
		
		getItemGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, index: {type: Number}
				, invoiceId: {type: Number}
			});	
			var me = this;
			var index = args.index;
			var rowHtml = "<tr>";
			var accountName = "";
			var quantity = "";
			var price = "";
			var invoiceId = args.invoiceId;
			
			if (me.invoiceCache[invoiceId].invoiceItems[index].account == 120) {
				accountName = "Sales Tax:";
				quantity = "&nbsp";
				price = "&nbsp";
			}				
			else {
				accountName = me.getAccountNumberName(me.invoiceCache[invoiceId].invoiceItems[index].account);
				quantity = me.invoiceCache[invoiceId].invoiceItems[index].quantity.toString()
				price = me.invoiceCache[invoiceId].invoiceItems[index].price;
			}
			
			rowHtml += me.getInvoiceItemGridRow(
				args.rowNumber
				, false
				, me.invoiceCache[invoiceId].invoiceItems[index].id
				, me.invoiceCache[invoiceId].invoiceItems[index].houseCode
				, me.getJobTitle(me.invoiceCache[invoiceId].invoiceItems[index].jobBrief, me.invoiceCache[invoiceId].invoiceItems[index].jobTitle)
				, me.getTaxableServiceTitle(me.invoiceCache[invoiceId].invoiceItems[index].taxableService)
				, accountName
				, quantity
				, price
				, me.invoiceCache[invoiceId].invoiceItems[index].amount
				, me.getStatusTitle(me.invoiceCache[invoiceId].invoiceItems[index].statusType)
				, me.getDisplayValue(me.invoiceCache[invoiceId].invoiceItems[index].taxable)
				, me.getDisplayValue(me.invoiceCache[invoiceId].invoiceItems[index].lineShow)
				, me.invoiceCache[invoiceId].invoiceItems[index].description
			);						
			rowHtml += "</tr>";
			
			return rowHtml;
		},
		
		getInvoiceItemGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, rowEditable: {type: Boolean}
				, id: {type: Number}
				, houseCode: {type: String}
				, job: {type: String}
				, taxableService: {type: String}
				, account: {type: String}
				, quantity: {type: String}
				, price: {type: String}
				, amount: {type: String}
				, status: {type: String}
				, taxable: {type: String}
				, lineShow: {type: String}
				, description: {type: String}
			});
			var me = this;
			var rowHtml = "";
			var columnBold = false;
			var align = "left";
			var rowNumberText = "";
			var editHouseCode = false;
			
			if (args.id == 0 || args.account == "Sales Tax:") {
				columnBold = true;
				align = "right";
			}

			if (args.rowNumber > 0)
				rowNumberText = args.rowNumber.toString();
			else
				rowNumberText = "&nbsp;"

			rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", rowNumberText, 50, "right");
			rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
			rowHtml += me.getEditableRowColumn(false, false, 11, "houseCode", args.houseCode, 100, "left");
			rowHtml += me.getEditableRowColumn(false, false, 2, "job", args.job, 100, align);
			rowHtml += me.getEditableRowColumn(false, false, 12, "taxableService", args.taxableService, 100, align);
			rowHtml += me.getEditableRowColumn(false, columnBold, 3, "account", args.account, 200, align);
			rowHtml += me.getEditableRowColumn(false, false, 4, "quantity", args.quantity, 100, "right");
			rowHtml += me.getEditableRowColumn(false, false, 5, "price", args.price, 100, "right");
			rowHtml += me.getEditableRowColumn(false, columnBold, 6, "amount", args.amount, 100, "right");
			rowHtml += me.getEditableRowColumn(false, false, 7, "status", args.status, 100, "center");
			rowHtml += me.getEditableRowColumn(false, false, 8, "taxable", args.taxable, 100, "center");
			rowHtml += me.getEditableRowColumn(false, false, 9, "lineShow", args.lineShow, 100, "center");
			rowHtml += me.getEditableRowColumn(false, false, 10, "description", args.description, 300, "left");

			return rowHtml;
		},
																		
		getEditableRowColumn: function() {
			var args = ii.args(arguments, {
				editable: {type: Boolean}
				, bold: {type: Boolean}
				, columnNumber: {type: Number}
				, columnName: {type: String}
				, columnValue: {type: String}
				, columnWidth: {type: Number}
				, columnAlign: {type: String}
			});
			var me = this;
			var styleName = "text-align:" + args.columnAlign + ";"
			
			if (args.bold)
				styleName += " font-weight:bold;"
			
			if (args.columnWidth == 0) 
				return "<td class='gridColumnHidden'>" + args.columnValue + "</td>";
			else 
				return "<td class='gridColumn' style='" + styleName + "' width='" + args.columnWidth + "'>" + args.columnValue + "</td>";
		},
		
		getTotalGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, totalAmount: {type: Number}
				, title: {type: String}
				, description: {type: String}
			});			
			var me = this;
			var rowHtml = "";

			rowHtml = "<tr>";

			rowHtml += me.getInvoiceItemGridRow(
				args.rowNumber
				, false
				, 0
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
		        , args.title
				, "&nbsp;"
				, "&nbsp;"
				, args.totalAmount.toFixed(5)
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, args.description
				);

			rowHtml += "</tr>";

			return rowHtml;
		},
		
		getStatusTitle: function(status) {
			if (status == 1)
				return "Open";
			else if (status == 2)
				return "In Progress";
			else if (status == 3)
				return "Posted";
			else if (status == 5)
				return "Closed";
		 	else
                return "";
		},
		
		getDisplayValue: function(item) {
			if (item == "true")
				return "Yes";
			else if (item == "false")
				return "No";
		},
		
		getJobTitle: function(brief, title) {
			var me = this;
			var jobTitle = "";

			if (brief != "")
				jobTitle = brief + " - " + title;

			return jobTitle == "" ? "&nbsp;" : jobTitle;
		},
		
		getTaxableServiceTitle: function(id) {
			var me = this;

			var index = ii.ajax.util.findIndexById(id.toString(), me.taxableServices);
			if (index != undefined && index >= 0)
				return me.taxableServices[index].title;
			else
				return "";
		},
			
		taxableServicesLoaded: function(me, activeId) {
 
 			me.taxableServices.unshift(new fin.adh.TaxableService({ id: 0, title: "" }));
        },
			
		accountsLoaded: function(me, activeId) {
			for (var index = 0; index < me.accounts.length; index++) {
				if (me.accounts[index].code == "0000") {
					me.descriptionAccount = me.accounts[index].id;
					me.accounts.push(me.accounts[index]);
					me.accounts.splice(index, 1);
					break;
				}
			}
		},
		
		getAccountNumberName: function(id) {
			var me = this;
			var accountNumberName = "";

			for (var index = 0; index < me.accounts.length; index++) {
				if (me.accounts[index].id == id) {
					accountNumberName = me.accounts[index].code + " - " + me.accounts[index].description;
					break;
				}
			}

			if (accountNumberName == "")
				return "&nbsp;"
			else
				return accountNumberName;
		},
		
		sortColumn: function(index) {
			var me = this;

			if (index == -1) {
				if (me.houseCodeSortOrder == "Asc")
					me.houseCodeSortOrder = "Desc";
				else
					me.houseCodeSortOrder = "Asc";
					
				if (me.delimitedOrgSelectedNodes != "")
					me.sortColumns = "HcmHouseCodes.HcmHouseCode#" + me.houseCodeSortOrder + "|";
				else
					me.sortColumns = "HcmJobs.HcmJOb#" + me.houseCodeSortOrder + "|";
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
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:100px; onchange=fin.reportUi.operatorChange('" + id + "');>";
				rowHtml += "<option title='Exact match (=)' value='1' selected>Exact match (=)</option>";
				rowHtml += "<option title='Any part that matches (Like)' value='2'>Any part that matches (Like)</option>";
				rowHtml += "</select>";
			}
			else  if (type == "bit") {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:100px;>";
				rowHtml += "<option title='' value='' selected></option>";
				rowHtml += "<option title='Yes' value='1'>Yes</option>";
				rowHtml += "<option title='No' value='0'>No</option>";
				rowHtml += "</select>";
			}
			else  if (type == "andOrOperator") {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:50px;>";
				rowHtml += "<option title='' value='' selected></option>";
				rowHtml += "<option title='And' value='1'>And</option>";
				rowHtml += "<option title='Or' value='2'>Or</option>";
				rowHtml += "</select>";
			}
			else {
				rowHtml = "<select id=sel" + id + " style=margin-left:5px;width:100px; onchange=fin.reportUi.operatorChange('" + id + "');>";
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

			rowHtml = "<select id='" + args.columnName + "' multiple='multiple'>";

			for (var index = 0; index < typeTableData.length; index++) {
				if (typeTableData[index].name != undefined)
					title = typeTableData[index].name;
				else
				    title = typeTableData[index].title;
				
				if (title != "")
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
					me.buildSingleDropDown(rowNumber, "HcmJobType", me.houseCodeJobsCache[houseCode].jobs, columnValue);
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
		
		taxExemptChange: function(rowNumber,houseCodeId) {
			var me = this;

	        me.invBillToCheck(rowNumber, houseCodeId, $("#RevInvBillTo_" + rowNumber).val());
		},
		
		invBillToChange: function(rowNumber,houseCodeId) {
			var me = this;
			me.invBillToOnChange = 1;
			
	        me.invBillToCheck(rowNumber, houseCodeId, $("#RevInvBillTo_" + rowNumber).val());
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
			me.invBillToDependents(rowNumber,me.invBillToCache[houseCode].invoiceBillTos,columnValue);
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
	                	invBillTo.company = $(this).attr("company");
						invBillTo.address1 = $(this).attr("address1");
						invBillTo.address2 = $(this).attr("address2");
						invBillTo.city = $(this).attr("city");
						invBillTo.stateType = $(this).attr("stateType");
						invBillTo.postalCode = $(this).attr("postalCode");
						invBillTo.taxId = $(this).attr("taxId");
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
		
		invBillToDependents: function(rowNumber, types, selectedValue) {
		    var me = this;
		    var type = {};
			if (me.invBillToOnChange == 1) {
				for(var index = 0; index < types.length; index++) {
			        type = types[index];
					if (type.name == selectedValue)
					{
						$("#RevInvCompany_" + rowNumber).val(type.company);
						$("#RevInvAddress1_" + rowNumber).val(type.address1);
						$("#RevInvAddress2_" + rowNumber).val(type.address2);
						$("#RevInvCity_" + rowNumber).val(type.city);
						$("#AppStateType_" + rowNumber).val(type.stateType.toString());
						$("#RevInvPostalCode_" + rowNumber).val(type.postalCode);
						if ($("#RevInvTaxExempt_" + rowNumber)[0].checked && type.taxId > 0) {
							$("#RevInvTaxNumber_" + rowNumber).val(type.taxId);
						}
						else {
							$("#RevInvTaxNumber_" + rowNumber).val("");
						}
					}
			    }
			}
			
			me.invBillToOnChange = 0;
		},
		
		geoCodeChange: function(objSelect) {
			var me = this;
			var rowNumber = Number(objSelect.id.substr(14));
			
	        me.geoCodeCheck(rowNumber, $("#HcmJobPostalCode_" + rowNumber).val(), $("#HcmJobGEOCode_" + rowNumber).val());
		},
		
		postalCodeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(17));			

	        me.geoCodeCheck(rowNumber, objSelect.value, $("#HcmJobGEOCode_" + rowNumber).val());
		},
		
		geoCodeCheck: function(rowNumber, postalCode, columnValue) {
			var me = this;

		    if (me.geoCodeCache[postalCode] != undefined) {

	            if (me.geoCodeCache[postalCode].loaded)
					me.geoCodeValidate(postalCode, [rowNumber], columnValue);              
	            else
	                me.geoCodeCache[postalCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.geoCodeLoad(rowNumber, postalCode, columnValue);
		},

		geoCodeValidate: function(postalCode, rowArray, columnValue) {
		    var me = this;
		    var rowNumber = 0;
			
		    if (me.geoCodeCache[postalCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "HcmJobGEOCode", me.geoCodeCache[postalCode].zipCodeTypes, columnValue);
		        }
		    }
			me.geoCodeDependents(rowNumber,me.geoCodeCache[postalCode].zipCodeTypes,columnValue);
		},

		geoCodeLoad: function(rowNumber, postalCode, columnValue) {
			var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
			me.typesLoadedCount++;
			
		    me.geoCodeCache[postalCode] = {};
		    me.geoCodeCache[postalCode].valid = false;
		    me.geoCodeCache[postalCode].loaded = false;
		    me.geoCodeCache[postalCode].buildQueue = [];
			me.geoCodeCache[postalCode].zipCodeTypes = [];
		    me.geoCodeCache[postalCode].buildQueue.push(rowNumber);
			me.geoCodeCache[postalCode].id = postalCode;
			
	        $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/adh/act/provider.aspx",
                data: "moduleId=adh&requestId=1&targetId=iiCache"
					+ "&requestXml=<criteria>storeId:zipCodeTypes,userId:[user],"
					+ "zipCode:" + postalCode + ",<criteria>",
                  
                 success: function(xml) {
  	                $(xml).find("item").each(function() {
	                    var geoCode = {};
	                	geoCode.id = $(this).attr("geoCode");
	                	geoCode.name = $(this).attr("geoCode");
						geoCode.zipCode = $(this).attr("zipCode");
						geoCode.city = $(this).attr("city");
						geoCode.stateType = $(this).attr("stateType");
	                	me.geoCodeCache[postalCode].zipCodeTypes.push(geoCode);
	                });
					
					me.geoCodeCache[postalCode].valid = true;
					me.geoCodeCache[postalCode].loaded = true;
					//validate the list of rows
		            me.geoCodeValidate(postalCode, me.geoCodeCache[postalCode].buildQueue, columnValue);
		            me.typesLoadedCount--;
					if (me.typesLoadedCount <= 0) $("#pageLoading").hide();					
				}
			});
		},
		
		geoCodeDependents: function(rowNumber, types, selectedValue) {
		    var me = this;
		    var type = {};
				
			if (selectedValue == "0" || types.length < 1) {
				$("#HcmJobCity_" + rowNumber).attr("readonly", false);
				$("#AppStateType_" + rowNumber).attr('disabled', false);
			}
			else {
				for(var index = 0; index < types.length; index++) {
			        type = types[index];
					if (type.name == selectedValue)
					{
						$("#HcmJobCity_" + rowNumber).val(type.city);
						$("#AppStateType_" + rowNumber).val(type.stateType.toString());
						$("#HcmJobCity_" + rowNumber).attr("readonly", true);
						$("#AppStateType_" + rowNumber).attr('disabled', true);
					}
			    }
			}
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
							var item = new fin.adh.FinancialEntity({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
							me.financialEntities.push(item);
						}				
					}
					me.typeNoneAdd(me.financialEntities);
					typeTable = me.financialEntities;
				}
				else {
					me.serviceLineTypes = [];
					for (var index = 0; index < me.serviceLines.length; index++) {
						if (!me.serviceLines[index].financialEntity) {
							var item = new fin.adh.ServiceLine({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
							me.serviceLineTypes.push(item);
						}				
					}
					me.typeNoneAdd(me.serviceLineTypes);
					typeTable = me.serviceLineTypes;
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
			else if (args.typeTable == "HcmBudgetTemplates") {
				me.typeNoneAdd(me.budgetTemplates);
				typeTable = me.budgetTemplates;
			}
			else if (args.typeTable == "HcmBudgetLaborCalcMethods") {
				me.typeNoneAdd(me.budgetLaborCalcMethods);
				typeTable = me.budgetLaborCalcMethods;
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
				me.genderTypes = [];
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
			else if (args.typeTable == "EmpBasicLifeIndicatorTypes") {
				me.typeNoneAdd(me.basicLifeIndicatorTypes);
				typeTable = me.basicLifeIndicatorTypes;
			}
			else if (args.typeTable == "EmpUnionStatusTypes") {
				me.typeNoneAdd(me.unionStatusTypes);
				typeTable = me.unionStatusTypes;
			}
			else if (args.typeTable == "PayPayrollCompanies") {
				me.typeNoneAdd(me.payrollCompanies);
				typeTable = me.payrollCompanies;
			}
			else if (args.typeTable == "AppTransactionStatusTypes") {
				me.typeNoneAdd(me.transactionStatusTypes);
				typeTable = me.transactionStatusTypes;
			}
			else if (args.typeTable == "RevInvoiceAddressTypes") {
				var found = false;
				for (var index = 0; index < me.invoiceAddressTypes.length; index++) {
					if (me.invoiceAddressTypes[index].title == "ALL") {
						found = true;
						break;
					}						
				}
				if (!found)
					me.invoiceAddressTypes.unshift(new fin.adh.InvoiceAddressType({ id: 0, title: "ALL" }));
				me.typeNoneAdd(me.invoiceAddressTypes);
				typeTable = me.invoiceAddressTypes;
			}
			else if (args.typeTable == "HcmJobTypes") {
				for (var index = 0; index < me.jobTypes.length; index++) {
					if (me.jobTypes[index].name == "Epay Site")
						me.jobTypes.splice(index, 1);
				}
				me.typeNoneAdd(me.jobTypes);
				typeTable = me.jobTypes;
			}
			else if (args.typeTable == "RevInvoiceTemplates") {
				me.typeNoneAdd(me.invoiceTemplates);
				typeTable = me.invoiceTemplates;
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
				
			if (!me.isSpecialCharacter(dataValue)) {
				valid = false;
				message = "The special characters \" | # are not allowed.";
			}
			else if (args.controlValidation.toLowerCase() == "datetime") {			
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
		
		isSpecialCharacter: function() {
			var args = ii.args(arguments, {
				argValue: {type: String}
			});

			if (/^[^\|\#\"]+$/.test(args.argValue))
				return true;
			else
				return false;
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
				+ ",invoiceItem:" +  me.invoiceItem
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
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.rowModifed == false) return;

			$("#AdhReportItemGridBody").html("");
			me.loadModuleColumnData();
		},
				
		actionBackItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
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
												rowData += '|' + column + '=' + '"' + data + '"';
										}
									}
								}
								else if (row[0].cells[colIndex].firstChild.type == "checkbox") {
									data = row[0].cells[colIndex].firstChild.checked;
									if (column == "HcmHoucEPayTask")
										rowData += '|' + column + '=' + '"' + (row[0].cells[colIndex].firstChild.checked ? 1 : 0) + '"';
									else
										rowData += '|' + column + '=' + '"' + data + '"';
								}
								else if (row[0].cells[colIndex].firstChild.type == "select-one") {
									data = row[0].cells[colIndex].firstChild.value;
									if (data == "" || data == "0")
										rowData += '|' + column + '=Null';
									else
										rowData += '|' + column + '=' + '"' + data + '"';
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
				me.modified(false);	

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
				alert("[SAVE FAILURE] Error while updating the Ad-Hoc Report details: " + $(args.xmlNode).attr("message"));
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
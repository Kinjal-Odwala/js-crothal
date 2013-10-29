ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.houseCodeImport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dateDropDown", 7 );

ii.Class({
    Name: "fin.hcm.houseCodeImport.UserInterface",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionSave = false;
			me.fileName = "";
			//me.typesLoading = 5;
			me.cellColorValid = "";
			me.cellColorInvalid = "red";
			me.pages = [];
			me.batchId = 0;
			me.firstTimeLoading = true;
			me.loadCount = 0;
			
			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 30;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "hcm\\houseCodeImport";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);			

			$(window).bind("resize", me, me.resize);
			$("#divHouseCodeGrid").bind("scroll", me.houseCodeGridScroll);
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevHouseCodeList(); });
			$("#imgNext").bind("click", function() { me.nextHouseCodeList(); });
			
			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},		
		
		authorizationProcess: function fin_hcm_houseCodeImport_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			$("#pageLoading").hide();
			$("#pageLoading").css({
				"opacity": "0.5",
				"background-color": "black"
			});
			$("#messageToUser").css({ "color": "white" });
			$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
			$("#pageLoading").fadeIn("slow");
			
			ii.timer.timing("Page displayed");
			me.loadCount = 5;
			me.session.registerFetchNotify(me.sessionLoaded, me);
			me.siteMasterStore.fetch("userId:[user],siteId:1", me.siteMastersLoaded, me);
			me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
			me.houseCodeServiceStore.fetch("userId:[user],houseCodeId:0", me.houseCodeServicesLoaded, me);			
			me.contractTypeStore.fetch("userId:[user]", me.contractTypesLoaded, me);
			me.payPayrollCompanyStore.fetch("userId:[user],houseCodeId:0", me.payPayrollCompanysLoaded, me);
		},	
		
		sessionLoaded: function fin_hcm_houseCodeImport_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;
			var divGridWidth = $(window).width() - 22;
			var divGridHeight = $(window).height() - 225;

			$("#divHouseCodeGrid").css({"width" : divGridWidth + "px", "height" : divGridHeight + "px"});
		},
		
		houseCodeGridScroll: function() {
		    var scrollLeft = $("#divHouseCodeGrid").scrollLeft();
		    
			$("#tblHouseCodeGridHeader").css("left", -scrollLeft + "px");
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "importAction",
					brief: "Bulk House Code Import", 
					title: "Upload the Excel file for importing bulk house codes.",
					actionFunction: function() { me.actionImportItem(); }
				})				

			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorValidate = new ui.ctl.buttons.Sizeable({
				id: "AnchorValidate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Validate&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionValidateItem(false); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveHouseCodes(); },
				hasHotState: true
			});
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.hcm.houseCodeImport.HouseCode,
				itemConstructorArgs: fin.hcm.houseCodeImport.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.bulkImportValidations = [];
			me.bulkImportValidationStore = me.cache.register({
				storeId: "houseCodeImportValidations",
				itemConstructor: fin.hcm.houseCodeImport.BulkImportValidation,
				itemConstructorArgs: fin.hcm.houseCodeImport.bulkImportValidationArgs,
				injectionArray: me.bulkImportValidations
			});
			
			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "appRecordCounts",
				itemConstructor: fin.hcm.houseCodeImport.RecordCount,
				itemConstructorArgs: fin.hcm.houseCodeImport.recordCountArgs,
				injectionArray: me.recordCounts
			});
			
			me.siteMasters = [];
			me.siteMasterStore = me.cache.register({
				storeId: "siteMasters",
				itemConstructor: fin.hcm.houseCodeImport.SiteMaster,
				itemConstructorArgs: fin.hcm.houseCodeImport.siteMasterArgs,
				injectionArray: me.siteMasters
			});
			
			me.industryTypes = [];
			me.industryTypeStore = me.cache.register({
				storeId: "industryTypes",
				itemConstructor: fin.hcm.houseCodeImport.IndustryType,
				itemConstructorArgs: fin.hcm.houseCodeImport.industryTypeArgs,
				injectionArray: me.industryTypes
			});			

			me.primaryBusinessTypes = [];
			me.primaryBusinessTypeStore = me.cache.register({
				storeId: "primaryBusinessTypes",
				itemConstructor: fin.hcm.houseCodeImport.PrimaryBusinessType,
				itemConstructorArgs: fin.hcm.houseCodeImport.primaryBusinessTypeArgs,
				injectionArray: me.primaryBusinessTypes
			});			

			me.locationTypes = [];
			me.locationTypeStore = me.cache.register({
				storeId: "locationTypes",
				itemConstructor: fin.hcm.houseCodeImport.LocationType,
				itemConstructorArgs: fin.hcm.houseCodeImport.locationTypeArgs,
				injectionArray: me.locationTypes
			});			

			me.traumaLevelTypes = [];
			me.traumaLevelTypeStore = me.cache.register({
				storeId: "traumaLevelTypes",
				itemConstructor: fin.hcm.houseCodeImport.TraumaLevelType,
				itemConstructorArgs: fin.hcm.houseCodeImport.traumaLevelTypeArgs,
				injectionArray: me.traumaLevelTypes
			});			

			me.profitDesignationTypes = [];
			me.profitDesignationTypeStore = me.cache.register({
				storeId: "profitDesignationTypes",
				itemConstructor: fin.hcm.houseCodeImport.ProfitDesignationType,
				itemConstructorArgs: fin.hcm.houseCodeImport.profitDesignationTypeArgs,
				injectionArray: me.profitDesignationTypes
			});			

			me.gpoTypes = [];
			me.gpoTypeStore = me.cache.register({
				storeId: "gpoTypes",
				itemConstructor: fin.hcm.houseCodeImport.GPOType,
				itemConstructorArgs: fin.hcm.houseCodeImport.gpoTypeArgs,
				injectionArray: me.gpoTypes
			});			

			me.ownershipTypes = [];
			me.ownershipTypeStore = me.cache.register({
				storeId: "ownershipTypes",
				itemConstructor: fin.hcm.houseCodeImport.OwnershipType,
				itemConstructorArgs: fin.hcm.houseCodeImport.ownershipTypeArgs,
				injectionArray: me.ownershipTypes
			});	

			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.hcm.houseCodeImport.JdeCompany,
				itemConstructorArgs: fin.hcm.houseCodeImport.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});
			
			me.houseCodeServices = [];
			me.houseCodeServiceStore = me.cache.register({
				storeId: "houseCodeServiceMasters",
				itemConstructor: fin.hcm.houseCodeImport.HouseCodeService,
				itemConstructorArgs: fin.hcm.houseCodeImport.houseCodeServiceArgs,
				injectionArray: me.houseCodeServices
			});	

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.houseCodeImport.ServiceType,
				itemConstructorArgs: fin.hcm.houseCodeImport.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.houseCodeImport.ServiceLine,
				itemConstructorArgs: fin.hcm.houseCodeImport.serviceLineArgs,
				injectionArray: me.serviceLines
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.houseCodeImport.StateType,
				itemConstructorArgs: fin.hcm.houseCodeImport.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	
			
			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.hcm.houseCodeImport.RemitTo,
				itemConstructorArgs: fin.hcm.houseCodeImport.remitToArgs,
				injectionArray: me.remitTos	
			});
			
			me.contractTypes = [];
			me.contractTypeStore = me.cache.register({
				storeId: "financialContractMasters",
				itemConstructor: fin.hcm.houseCodeImport.ContractType,
				itemConstructorArgs: fin.hcm.houseCodeImport.contractTypeArgs,
				injectionArray: me.contractTypes	
			});

			me.termsOfContractTypes = [];
			me.termsOfContractTypeStore = me.cache.register({
				storeId: "termsOfContractTypes",
				itemConstructor: fin.hcm.houseCodeImport.TermsOfContractType,
				itemConstructorArgs: fin.hcm.houseCodeImport.termsOfContractTypeArgs,
				injectionArray: me.termsOfContractTypes	
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.houseCodeImport.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.houseCodeImport.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});			

			me.invoiceLogoTypes = [];
			me.invoiceLogoTypeStore = me.cache.register({
				storeId: "invoiceLogoTypes",
				itemConstructor: fin.hcm.houseCodeImport.InvoiceLogoType,
				itemConstructorArgs: fin.hcm.houseCodeImport.invoiceLogoTypeArgs,
				injectionArray: me.invoiceLogoTypes	
			});

			me.budgetTemplates = [];
			me.budgetTemplateStore = me.cache.register({
				storeId: "budgetTemplates",
				itemConstructor: fin.hcm.houseCodeImport.BudgetTemplate,
				itemConstructorArgs: fin.hcm.houseCodeImport.budgetTemplateArgs,
				injectionArray: me.budgetTemplates
			});

			me.budgetLaborCalcMethods = [];
			me.budgetLaborCalcMethodStore = me.cache.register({
				storeId: "budgetLaborCalcMethods",
				itemConstructor: fin.hcm.houseCodeImport.BudgetLaborCalcMethod,
				itemConstructorArgs: fin.hcm.houseCodeImport.budgetLaborCalcMethodArgs,
				injectionArray: me.budgetLaborCalcMethods
			});

			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "payrollMasters",
				itemConstructor: fin.hcm.houseCodeImport.PayPayrollCompany,
				itemConstructorArgs: fin.hcm.houseCodeImport.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys	
			});
			
			me.payrollProcessings = [];
			me.payrollProcessingStore = me.cache.register({
				storeId: "payrollProcessingLocationTypes",
				itemConstructor: fin.hcm.houseCodeImport.PayrollProcessingLocationType,
				itemConstructorArgs: fin.hcm.houseCodeImport.payrollProcessingLocationTypeArgs,
				injectionArray: me.payrollProcessings	
			});
			
			me.ePayGroupTypes = [];
			me.ePayGroupTypeStore = me.cache.register({
				storeId: "ePayGroupTypes",
				itemConstructor: fin.hcm.houseCodeImport.EPayGroupType,
				itemConstructorArgs: fin.hcm.houseCodeImport.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});
			
			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.hcm.houseCodeImport.HouseCodeType,
				itemConstructorArgs: fin.hcm.houseCodeImport.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
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
		
		siteMastersLoaded: function (me, activeId) {

			me.stateTypes.unshift(new fin.hcm.houseCodeImport.StateType({ id: 0,  name: "" }));
			me.industryTypes.unshift(new fin.hcm.houseCodeImport.IndustryType({ id: 0, name: "" }));
			me.primaryBusinessTypes.unshift(new fin.hcm.houseCodeImport.PrimaryBusinessType({ id: 0, name: "" }));
			me.locationTypes.unshift(new fin.hcm.houseCodeImport.LocationType({ id: 0, name: "" }));
			me.traumaLevelTypes.unshift(new fin.hcm.houseCodeImport.TraumaLevelType({ id: 0, name: "" }));
			me.profitDesignationTypes.unshift(new fin.hcm.houseCodeImport.ProfitDesignationType({ id: 0, name: "" }));
			me.gpoTypes.unshift(new fin.hcm.houseCodeImport.GPOType({ id: 0, name: "" }));
			me.ownershipTypes.unshift(new fin.hcm.houseCodeImport.OwnershipType({ id: 0, name: "" }));
			
//			me.typesLoading--;
//			
//			if (me.typesLoading <= 0)
//				$("#pageLoading").hide();
			me.checkLoadCount();
		},
		
		jdeCompanysLoaded: function(me, activeId) {
		
            me.jdeCompanys.unshift(new fin.hcm.houseCodeImport.JdeCompany({ id: 0, name: "" }));
//			me.typesLoading--;
//			
//			if (me.typesLoading <= 0)
//				$("#pageLoading").hide();
			me.checkLoadCount();
		},
	
		houseCodeServicesLoaded: function (me, activeId) {

			me.financialEntities = [];
			me.serviceLineTypes = [];

			for (var index = 0; index < me.serviceLines.length; index++) {
				if (me.serviceLines[index].financialEntity) {
					var item = new fin.hcm.houseCodeImport.FinancialEntity({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
					me.financialEntities.push(item);
				}
				else {
					var item = new fin.hcm.houseCodeImport.ServiceLine({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
					me.serviceLineTypes.push(item);
				}
			}
		    
			me.financialEntities.unshift(new fin.hcm.houseCodeImport.FinancialEntity({ id: 0, name: "" }));			
			me.serviceLineTypes.unshift(new fin.hcm.houseCodeImport.ServiceLine({ id: 0, name: "" }));
			me.serviceTypes.unshift(new fin.hcm.houseCodeImport.ServiceType({ id: 0, name: "" }));
//			me.typesLoading--;
//			
//			if (me.typesLoading <= 0)
//				$("#pageLoading").hide();
			me.checkLoadCount();
		},
		
		contractTypesLoaded: function(me, activeId) {

			me.contractTypes.unshift(new fin.hcm.houseCodeImport.ContractType({ id: 0, name: "" }));
			me.remitTos.unshift(new fin.hcm.houseCodeImport.RemitTo({ id: 0, name: "" }));
			me.termsOfContractTypes.unshift(new fin.hcm.houseCodeImport.TermsOfContractType({ id: 0, name: "" }));
			me.billingCycleFrequencys.unshift(new fin.hcm.houseCodeImport.BillingCycleFrequency({ id: 0, name: "" }));
			me.invoiceLogoTypes.unshift(new fin.hcm.houseCodeImport.InvoiceLogoType({ id: 0, name: "" }));
//			me.typesLoading--;
//			
//			if (me.typesLoading <= 0)
//				$("#pageLoading").hide();
			me.checkLoadCount();
		},
		
		payPayrollCompanysLoaded: function(me, activeId) {
			
			me.payPayrollCompanys.unshift(new fin.hcm.houseCodeImport.PayPayrollCompany({ id: 0, name: "" }));
			me.payrollProcessings.unshift(new fin.hcm.houseCodeImport.PayrollProcessingLocationType({ id: 0, name: "" }));
			me.houseCodeTypes.unshift(new fin.hcm.houseCodeImport.HouseCodeType({ id: 0, name: ""}));
			me.ePayGroupTypes.unshift(new fin.hcm.houseCodeImport.EPayGroupType({ id: 0, name: ""}));
//			me.typesLoading--;
//			
//			if (me.typesLoading <= 0)
//				$("#pageLoading").hide();
			me.checkLoadCount();
		},
		
		prevHouseCodeList: function() {
		    var me = this;
			
			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid())
				return;

			me.pageCurrent--;
			
			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.changeHouseCodeList();
		},

		nextHouseCodeList: function() {
		    var me = this;
			
			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid())
				return;

			me.pageCurrent++;
			
			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.changeHouseCodeList();
		},
		
		pageNumberChange: function() {
		    var me = this;

			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid()) {
				$("#selPageNumber").val(me.pageCurrent);
				return;
			}

		    me.pageCurrent = Number($("#selPageNumber").val());
		    me.changeHouseCodeList();
		},

		changeHouseCodeList: function() {
		    var me = this;
		    		        
		    me.setLoadCount();				
			$("#selPageNumber").val(me.pageCurrent);			

			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;		
			me.houseCodeStore.fetch("userId:[user],batch:" + me.batchId + ",object:HouseCode,startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows, me.houseCodesLoaded, me);
		},
		
		houseCodeCountLoad: function() {
		    var me = this;
			
			me.setLoadCount();
				    
		    me.recordCountStore.reset();
			me.recordCountStore.fetch("userId:[user]," + "id:" + me.batchId + ",module:ImportHouseCodes", me.recordCountLoaded, me);
		},
		
		recordCountLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");			
			
			me.pages = [];
			me.startPoint = 1;
		    me.recordCount = me.recordCounts[0].recordCount;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);
		    		    
		    //if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;
		    
		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
				var page = {};
		    	page.saved = false;
		    	me.pages.push(page);
			}
		    
		    selPageNumber.val(me.pageCurrent);
		    $("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");

			me.houseCodeStore.reset();
			me.houseCodeStore.fetch("userId:[user],batch:" + me.batchId + ",object:HouseCode,startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows, me.houseCodesLoaded, me);
		},
		
		actionImportItem: function() {
			var me = this;

			if (!fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Bulk House Code Import");
			$("#AnchorValidate").hide();
			$("#AnchorSave").hide();
			$("#tblHouseCodes").hide();
			$("#iFrameUpload").height(30);
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},
		
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);			
		},
		
		actionUploadItem: function() {
			var me = this;

			me.fileName = "";
			
			me.setStatus("Loading");			
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow");
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (me.fileName == "Error") {
						me.setStatus("Loaded");
						alert("Unable to upload the file. Please try again.")
						$("#pageLoading").fadeOut("slow");
					}
					else {
						me.actionImportSave();
					}
				}			
				
			}, 1000);
		},
		
		houseCodesLoaded: function(me, activeId) {
			
			var houseCodeRow = "";
			var houseCodeRowTemplate = $("#tblHouseCodeTemplate").html();
			var idIndex = 0;

			$("#HouseCodeGridBody").html("");			
			$("#divFrame").hide();
			$("#divUpload").hide();			
			$("#AnchorSave").hide();
			$("#tblHouseCodes").show();

			if (me.pages[me.pageCurrent - 1].saved || me.houseCodes.length == 0)
				$("#AnchorValidate").hide();
			else {
				$("#AnchorValidate").show();
				me.modified(true);
			}

			if (me.houseCodes.length == 0)
				alert("House Codes imported successfully. Invalid records are not found during the import process.");

			for (var index = 0; index < me.houseCodes.length; index++) {					
					
				//create the row for the house code information
				houseCodeRow = houseCodeRowTemplate;
				houseCodeRow = houseCodeRow.replace(/RowCount/g, index);
				houseCodeRow = houseCodeRow.replace("#", index + 1);
				
				$("#HouseCodeGridBody").append(houseCodeRow);
			}

			me.buildDropDown("SiteStateType", me.stateTypes);
			me.buildDropDown("IndustryType", me.industryTypes);
			me.buildDropDown("PrimaryBusinessType", me.primaryBusinessTypes);
			me.buildDropDown("LocationType", me.locationTypes);
			me.buildDropDown("TraumaLevelType", me.traumaLevelTypes);
			me.buildDropDown("ProfitDesignationType", me.profitDesignationTypes);
			me.buildDropDown("GPOType", me.gpoTypes);
			me.buildDropDown("OwnershipType", me.ownershipTypes);
			me.buildDropDown("JDECompany", me.jdeCompanys);
			me.buildDropDown("ServiceType", me.serviceTypes);	
			me.buildDropDown("ServiceLine", me.serviceLineTypes);
			me.buildDropDown("ShippingState", me.stateTypes);
			me.buildDropDown("RemitToLocation", me.remitTos);
			me.buildDropDown("ContractType", me.contractTypes);
			me.buildDropDown("TermsOfContractType", me.termsOfContractTypes);
			me.buildDropDown("BillingCycleFrequencyType", me.billingCycleFrequencys);
			me.buildDropDown("FinancialEntityType", me.financialEntities);
			me.buildDropDown("BankState", me.stateTypes);
			me.buildDropDown("InvoiceLogoType", me.invoiceLogoTypes);
			me.buildDropDown("PayrollProcessingLocationType", me.payrollProcessings);
			me.buildDropDown("HouseCodeType", me.houseCodeTypes);
			me.buildDropDown("EPayGroupType", me.ePayGroupTypes);
			me.buildDropDown("PayrollCompanyHourly", me.payPayrollCompanys);
			me.buildDropDown("PayrollCompanySalaried", me.payPayrollCompanys);

			houseCodeRow = '<tr height="100%"><td colspan="103" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#HouseCodeGridBody").append(houseCodeRow);
			$("#HouseCodeGrid tr:odd").addClass("gridRow");
        	$("#HouseCodeGrid tr:even").addClass("alternateGridRow");
			
			/*for (var index = 0; index < $("#trHouseCodeGridHead")[0].childNodes.length; index++) {
				if ($("#trHouseCodeGridHead")[0].childNodes[index].clientWidth != $("#trHouseCode0")[0].childNodes[index].clientWidth)
					alert(index);
			}*/

			me.resize();
			me.loadHouseCodeData();
			me.firstTimeLoading = false;
  		},
		
		loadHouseCodeData: function() {
			var me = this;

			for (var index = 0; index < me.houseCodes.length; index++) {
				
				$("#txtBrief" + index).val(me.houseCodes[index].column1);
				$("#txtTitle" + index).val(me.houseCodes[index].column2);
				$("#txtDescription" + index).val(me.houseCodes[index].column3);
				$("#txtLevel1_" + index).val(me.houseCodes[index].column4);
				$("#txtLevel2_" + index).val(me.houseCodes[index].column5);
				$("#txtLevel3_" + index).val(me.houseCodes[index].column6);
				$("#txtLevel4_" + index).val(me.houseCodes[index].column7);
				$("#txtLevel5_" + index).val(me.houseCodes[index].column8);
				$("#txtLevel6_" + index).val(me.houseCodes[index].column9);
				$("#txtLevel7_" + index).val(me.houseCodes[index].column10);
				$("#txtLevel8_" + index).val(me.houseCodes[index].column11);
				$("#txtLevel9_" + index).val(me.houseCodes[index].column12);
				$("#txtLevel10_" + index).val(me.houseCodes[index].column13);
				$("#txtLevel11_" + index).val(me.houseCodes[index].column14);
				$("#txtLevel12_" + index).val(me.houseCodes[index].column15);
				$("#txtLevel13_" + index).val(me.houseCodes[index].column16);
				$("#txtLevel14_" + index).val(me.houseCodes[index].column17);
				$("#txtLevel15_" + index).val(me.houseCodes[index].column18);
				$("#txtLevel16_" + index).val(me.houseCodes[index].column19);				
				$("#txtSiteTitle" + index).val(me.houseCodes[index].column20);
				$("#txtSiteAddressLine1" + index).val(me.houseCodes[index].column21);
				$("#txtSiteAddressLine2" + index).val(me.houseCodes[index].column22);
				$("#txtSiteCity" + index).val(me.houseCodes[index].column23);
				me.setDropDownValue(me.stateTypes, me.houseCodes[index].column24, "SiteStateType", index);
				$("#txtPostalCode" + index).val(me.houseCodes[index].column25);
				$("#txtCounty" + index).val(me.houseCodes[index].column26);
				me.setDropDownValue(me.industryTypes, me.houseCodes[index].column27, "IndustryType", index);
				me.setDropDownValue(me.primaryBusinessTypes, me.houseCodes[index].column28, "PrimaryBusinessType", index);
				me.setDropDownValue(me.locationTypes, me.houseCodes[index].column29, "LocationType", index);
				me.setDropDownValue(me.traumaLevelTypes, me.houseCodes[index].column30, "TraumaLevelType", index);
				me.setDropDownValue(me.profitDesignationTypes, me.houseCodes[index].column31, "ProfitDesignationType", index);
				me.setDropDownValue(me.gpoTypes, me.houseCodes[index].column32, "GPOType", index);
				$("#txtSpecifyGPO" + index).val(me.houseCodes[index].column33);
				me.setDropDownValue(me.ownershipTypes, me.houseCodes[index].column34, "OwnershipType", index);
				me.setDropDownValue(me.jdeCompanys, me.houseCodes[index].column35, "JDECompany", index);
				$("#txtStartDate" + index).val(me.stripTimeStamp(me.houseCodes[index].column36));
				me.setDropDownValue(me.serviceTypes, me.houseCodes[index].column37, "ServiceType", index);
				if (me.houseCodes[index].column38 == "1")
					$("#chkEnforceLaborControl" + index)[0].checked = true;
				me.setDropDownValue(me.serviceLineTypes, me.houseCodes[index].column39, "ServiceLine", index);
				$("#txtManagerName" + index).val(me.houseCodes[index].column40);
				$("#txtManagerEmail" + index).val(me.houseCodes[index].column41);
				$("#txtManagerPhone" + index).val(me.houseCodes[index].column42);
				$("#txtManagerCellPhone" + index).val(me.houseCodes[index].column43);
				$("#txtManagerFax" + index).val(me.houseCodes[index].column44);
				$("#txtManagerPager" + index).val(me.houseCodes[index].column45);
				$("#txtManagerAssistantName" + index).val(me.houseCodes[index].column46);
				$("#txtManagerAssistantPhone" + index).val(me.houseCodes[index].column47);
				$("#txtClientFirstName" + index).val(me.houseCodes[index].column48);
				$("#txtClientLastName" + index).val(me.houseCodes[index].column49);
				$("#txtClientTitle" + index).val(me.houseCodes[index].column50);
				$("#txtClientPhone" + index).val(me.houseCodes[index].column51);
				$("#txtClientFax" + index).val(me.houseCodes[index].column52);
				$("#txtClientAssistantName" + index).val(me.houseCodes[index].column53);
				$("#txtClientAssistantPhone" + index).val(me.houseCodes[index].column54);
				$("#txtManagedEmployees" + index).val(me.houseCodes[index].column55);
				$("#txtBedsLicensed" + index).val(me.houseCodes[index].column56);
				$("#txtPatientDays" + index).val(me.houseCodes[index].column57);
				$("#txtAverageDailyCensus" + index).val(me.houseCodes[index].column58);
				$("#txtAnnualDischarges" + index).val(me.houseCodes[index].column59);
				$("#txtAverageBedTurnaroundTime" + index).val(me.houseCodes[index].column60);
				$("#txtNetCleanableSqft" + index).val(me.houseCodes[index].column61);
				$("#txtAverageLaundryLbs" + index).val(me.houseCodes[index].column62);
				$("#txtCrothallEmployees" + index).val(me.houseCodes[index].column63);
				$("#txtBedsActive" + index).val(me.houseCodes[index].column64);
				$("#txtAdjustedPatientDaysBudgeted" + index).val(me.houseCodes[index].column65);
				$("#txtAnnualTransfers" + index).val(me.houseCodes[index].column66);	
				$("#txtAnnualTransports" + index).val(me.houseCodes[index].column67);
				$("#txtShippingAddress1" + index).val(me.houseCodes[index].column68);
				$("#txtShippingAddress2" + index).val(me.houseCodes[index].column69);
				$("#txtShippingCity" + index).val(me.houseCodes[index].column70);
				me.setDropDownValue(me.stateTypes, me.houseCodes[index].column71, "ShippingState", index);
				$("#txtShippingZip" + index).val(me.houseCodes[index].column72);
				me.setDropDownValue(me.remitTos, me.houseCodes[index].column73, "RemitToLocation", index);
				me.setDropDownValue(me.contractTypes, me.houseCodes[index].column74, "ContractType", index);
				me.setDropDownValue(me.termsOfContractTypes, me.houseCodes[index].column75, "TermsOfContractType", index);
				me.setDropDownValue(me.billingCycleFrequencys, me.houseCodes[index].column76, "BillingCycleFrequencyType", index);
				me.setDropDownValue(me.financialEntities, me.houseCodes[index].column77, "FinancialEntityType", index);
				$("#txtBankCodeNumber" + index).val(me.houseCodes[index].column78);				
				$("#txtBankAccountNumber" + index).val(me.houseCodes[index].column79);
				$("#txtBankName" + index).val(me.houseCodes[index].column80);
				$("#txtBankContact" + index).val(me.houseCodes[index].column81);
				$("#txtBankAddress1" + index).val(me.houseCodes[index].column82);			
				$("#txtBankAddress2" + index).val(me.houseCodes[index].column83);				
				$("#txtBankCity" + index).val(me.houseCodes[index].column84);				
				me.setDropDownValue(me.stateTypes, me.houseCodes[index].column85, "BankState", index);
				$("#txtBankZip" + index).val(me.houseCodes[index].column86);				
				$("#txtBankPhone" + index).val(me.houseCodes[index].column87);
				$("#txtBankFax" + index).val(me.houseCodes[index].column88);
				$("#txtBankEmail" + index).val(me.houseCodes[index].column89);
				me.setDropDownValue(me.invoiceLogoTypes, me.houseCodes[index].column90, "InvoiceLogoType", index);
				$("#txtStateTaxPercent" + index).val(me.houseCodes[index].column91);
				$("#txtLocalTaxPercent" + index).val(me.houseCodes[index].column92);
				me.setDropDownValue(me.payrollProcessings, me.houseCodes[index].column93, "PayrollProcessingLocationType", index);
				$("#txtDefaultLunchBreak" + index).val(me.houseCodes[index].column94);
				$("#txtLunchBreakTrigger" + index).val(me.houseCodes[index].column95);
				me.setDropDownValue(me.houseCodeTypes, me.houseCodes[index].column96, "HouseCodeType", index);
				$("#txtRoundingTimePeriod" + index).val(me.houseCodes[index].column97);
				if (me.houseCodes[index].column98 == "1")
					$("#chkTimeAndAttendance" + index)[0].checked = true;
				if (me.houseCodes[index].column99 == "1")
					$("#chkEPaySite" + index)[0].checked = true;
				me.setDropDownValue(me.ePayGroupTypes, me.houseCodes[index].column100, "EPayGroupType", index);
				me.setDropDownValue(me.payPayrollCompanys, me.houseCodes[index].column101, "PayrollCompanyHourly", index);
				me.setDropDownValue(me.payPayrollCompanys, me.houseCodes[index].column102, "PayrollCompanySalaried", index);
			}
			
			me.checkLoadCount();
		},

		stripTimeStamp: function(date) {
			var me = this;
			var index = 0;

			date = jQuery.trim(date);
			index = date.indexOf(" ");

            if (index > 0)
                date = date.substring(0, index);

            return date;
		},

		findIndexByTitle: function() {
			var args = ii.args(arguments, {
				title: {type: String},	// The title to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});		
			var title = args.title;
			var data = args.data;
			
			for (var index = 0; index < data.length; index++) {
				if (data[index].name == title) {
					return index;
				}
			}
			
			return null;
		},
		
		setDropDownValue: function(types, title, controlName, index) {
			var me = this;
			var idIndex = 0;
			
			idIndex = me.findIndexByTitle(title, types);
			if (idIndex != undefined) {
				$("#sel" + controlName + index).val(types[idIndex].id);				
			}
		},
		
		buildDropDown: function(controlName, types) {
		    var me = this;
			var type = {};
		    var selType = null;
			var options = "";

		    for (var index = 0; index < types.length; index++) {
				type = types[index];
				
				if (me.firstTimeLoading)
		        	options += "<option title='" + type.name + "' value='" + type.id + "'>" + type.name + "</option>\n";
				else
					options += "<option title='" + type.name + "' value='" + type.id + "'>" + type.name + "</option>";
		    }
				
			for (var index = 0; index < me.houseCodes.length; index++) {
				selType = $("#sel" + controlName + index);
				selType.append(options);
			}
		},		
		
		setCellColor: function(control, cellColor, title) {
			var me = this;
			
			control.css("background-color", cellColor);
			control.attr("title", title);			
		},
		
		actionValidateItem: function() {
			var args = ii.args(arguments, {				
				save: {type: Boolean}
			});
			var me = this;
			
			me.actionSave = args.save;
			
			me.setStatus("Loading");
			$("#messageToUser").text("Validating");
			$("#pageLoading").fadeIn("slow");
			
			setTimeout(function() { 
				me.validate(); 
			}, 100);			
		},
		
		validate: function() {
			var me = this;			
			var valid = true;
			var rowValid = true;
			var briefs = "";
			var fullPath = "";
			var prevFullPath = "";
			var fullPaths = "";

			for (var index = 0; index < me.houseCodes.length; index++) {
				rowValid = true;
				fullPath = "";
				briefs += $("#txtBrief" + index).val() + "|";
				
				for (var indexI = 1; indexI <= 16; indexI++) {
					var level = $("#txtLevel" + indexI + "_" + index).val();
					if (level != "") {
						if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(level))) {
							rowValid = false;
							me.setCellColor($("#txtLevel" + indexI + "_" + index), me.cellColorInvalid, "The Level " + indexI + " can't contain any of the following characters: \\/:*?\"<>|.,");
						}
						else {
							me.setCellColor($("#txtLevel" + indexI + "_" + index), me.cellColorValid, "");
						}
							
						fullPath += "\\" + level;
					}
				}
				
				if (fullPath != prevFullPath) {
					fullPaths += fullPath + "|";
					prevFullPath = fullPath;
				}				

				if (!(/^[0-9]+$/.test($("#txtBrief" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBrief" + index), me.cellColorInvalid, "Please enter valid Brief.");
				}
				else {
					me.setCellColor($("#txtBrief" + index), me.cellColorValid, "");
				}								
				
				if ($("#txtTitle" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtTitle" + index), me.cellColorInvalid, "Please enter valid Title.");
				}
				else if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test($("#txtTitle" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtTitle" + index), me.cellColorInvalid, "The Title can't contain any of the following characters: \\/:*?\"<>|.,");
				}
				else {
					me.setCellColor($("#txtTitle" + index), me.cellColorValid, "");
				}
				
				if ($("#txtDescription" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtDescription" + index), me.cellColorInvalid, "Please enter valid Description.");
				}
				else if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test($("#txtDescription" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtDescription" + index), me.cellColorInvalid, "The Description can't contain any of the following characters: \\/:*?\"<>|.,");
				}
				else {
					me.setCellColor($("#txtDescription" + index), me.cellColorValid, "");
				}
				
				if ($("#txtSiteTitle" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtSiteTitle" + index), me.cellColorInvalid, "Please enter valid Site Title.");
				}
				else {
					me.setCellColor($("#txtSiteTitle" + index), me.cellColorValid, "");
				}
				
				if ($("#txtSiteAddressLine1" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtSiteAddressLine1" + index), me.cellColorInvalid, "Please enter valid Site Address Line 1.");
				}
				else {
					me.setCellColor($("#txtSiteAddressLine1" + index), me.cellColorValid, "");
				}
				
				if ($("#txtSiteCity" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtSiteCity" + index), me.cellColorInvalid, "Please enter valid Site City.");
				}
				else {
					me.setCellColor($("#txtSiteCity" + index), me.cellColorValid, "");
				}
				
				if ($("#selSiteStateType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selSiteStateType" + index), me.cellColorInvalid, "Please select valid Site State.");
				}
				else {
					me.setCellColor($("#selSiteStateType" + index), me.cellColorValid, "");
				}
				
				if (!(ui.cmn.text.validate.postalCode($("#txtPostalCode" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtPostalCode" + index), me.cellColorInvalid, "Please enter valid Postal Code.");
				}
				else {
					me.setCellColor($("#txtPostalCode" + index), me.cellColorValid, "");
				}
				
				if ($("#selPrimaryBusinessType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selPrimaryBusinessType" + index), me.cellColorInvalid, "Please select valid Primary Business.");
				}
				else {
					me.setCellColor($("#selPrimaryBusinessType" + index), me.cellColorValid, "");
				}
				
				if ($("#selJDECompany" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selJDECompany" + index), me.cellColorInvalid, "Please select valid JDE Company.");
				}
				else {
					me.setCellColor($("#selJDECompany" + index), me.cellColorValid, "");
				}
				
				if(ui.cmn.text.validate.generic($("#txtStartDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtStartDate" + index), me.cellColorInvalid, "Please enter valid Start Date.");
				}
				else {
					me.setCellColor($("#txtStartDate" + index), me.cellColorValid, "");
				}
				
				if ($("#selServiceType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selServiceType" + index), me.cellColorInvalid, "Please select valid Service Type.");
				}
				else {
					me.setCellColor($("#selServiceType" + index), me.cellColorValid, "");
				}
				
				if ($("#txtManagerEmail" + index).val() != "" && !(ui.cmn.text.validate.emailAddress($("#txtManagerEmail" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerEmail" + index), me.cellColorInvalid, "Please enter valid Manager Email Id.");
				}
				else {
					me.setCellColor($("#txtManagerEmail" + index), me.cellColorValid, "");
				}
				
				if ($("#txtManagerPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtManagerPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerPhone" + index), me.cellColorInvalid, "Please enter valid Manager Phone.");
				}
				else {
					me.setCellColor($("#txtManagerPhone" + index), me.cellColorValid, "");
				}				

				if ($("#txtManagerCellPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtManagerCellPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerCellPhone" + index), me.cellColorInvalid, "Please enter valid Manager Cell Phone.");
				}
				else {
					me.setCellColor($("#txtManagerCellPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtManagerFax" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtManagerFax" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerFax" + index), me.cellColorInvalid, "Please enter valid Manager Fax.");
				}
				else {
					me.setCellColor($("#txtManagerFax" + index), me.cellColorValid, "");
				}
				
				if ($("#txtManagerPager" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtManagerPager" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerPager" + index), me.cellColorInvalid, "Please enter valid Manager Pager.");
				}
				else {
					me.setCellColor($("#txtManagerPager" + index), me.cellColorValid, "");
				}
				
				if ($("#txtManagerAssistantPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtManagerAssistantPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagerAssistantPhone" + index), me.cellColorInvalid, "Please enter valid Manager Assistant Phone.");
				}
				else {
					me.setCellColor($("#txtManagerAssistantPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtClientPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtClientPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtClientPhone" + index), me.cellColorInvalid, "Please enter valid Client Phone.");
				}
				else {
					me.setCellColor($("#txtClientPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtClientFax" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtClientFax" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtClientFax" + index), me.cellColorInvalid, "Please enter valid Client Fax.");
				}
				else {
					me.setCellColor($("#txtClientFax" + index), me.cellColorValid, "");
				}
				
				if ($("#txtClientAssistantPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtClientAssistantPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtClientAssistantPhone" + index), me.cellColorInvalid, "Please enter valid Client Assistant Phone.");
				}
				else {
					me.setCellColor($("#txtClientAssistantPhone" + index), me.cellColorValid, "");
				}				
				
				if ($("#txtManagedEmployees" + index).val() != "" && !(/^[0-9]+$/.test($("#txtManagedEmployees" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtManagedEmployees" + index), me.cellColorInvalid, "Please enter valid Managed Employeese.");
				}
				else {
					me.setCellColor($("#txtManagedEmployees" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBedsLicensed" + index).val() != "" && !(/^[0-9]+$/.test($("#txtBedsLicensed" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBedsLicensed" + index), me.cellColorInvalid, "Please enter valid Beds Licensed.");
				}
				else {
					me.setCellColor($("#txtBedsLicensed" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPatientDays" + index).val() != "" && !(/^[0-9]+$/.test($("#txtPatientDays" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtPatientDays" + index), me.cellColorInvalid, "Please enter valid Patient Days.");
				}
				else {
					me.setCellColor($("#txtPatientDays" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAverageDailyCensus" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAverageDailyCensus" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAverageDailyCensus" + index), me.cellColorInvalid, "Please enter valid Average Daily Census.");
				}
				else {
					me.setCellColor($("#txtAverageDailyCensus" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAnnualDischarges" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAnnualDischarges" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAnnualDischarges" + index), me.cellColorInvalid, "Please enter valid Annual Discharges.");
				}
				else {
					me.setCellColor($("#txtAnnualDischarges" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAverageBedTurnaroundTime" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAverageBedTurnaroundTime" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAverageBedTurnaroundTime" + index), me.cellColorInvalid, "Please enter valid Average Bed Turnaround Time.");
				}
				else {
					me.setCellColor($("#txtAverageBedTurnaroundTime" + index), me.cellColorValid, "");
				}
				
				if ($("#txtNetCleanableSqft" + index).val() != "" && !(/^[0-9]+$/.test($("#txtNetCleanableSqft" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtNetCleanableSqft" + index), me.cellColorInvalid, "Please enter valid Net Cleanable Sqft.");
				}
				else {
					me.setCellColor($("#txtNetCleanableSqft" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAverageLaundryLbs" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAverageLaundryLbs" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAverageLaundryLbs" + index), me.cellColorInvalid, "Please enter valid Average Laundry Lbs.");
				}
				else {
					me.setCellColor($("#txtAverageLaundryLbs" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAverageLaundryLbs" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAverageLaundryLbs" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAverageLaundryLbs" + index), me.cellColorInvalid, "Please enter valid Average Laundry Lbs.");
				}
				else {
					me.setCellColor($("#txtAverageLaundryLbs" + index), me.cellColorValid, "");
				}
				
				if ($("#txtCrothallEmployees" + index).val() != "" && !(/^[0-9]+$/.test($("#txtCrothallEmployees" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtCrothallEmployees" + index), me.cellColorInvalid, "Please enter valid Crothall Employees.");
				}
				else {
					me.setCellColor($("#txtCrothallEmployees" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBedsActive" + index).val() != "" && !(/^[0-9]+$/.test($("#txtBedsActive" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBedsActive" + index), me.cellColorInvalid, "Please enter valid Beds Active.");
				}
				else {
					me.setCellColor($("#txtBedsActive" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAdjustedPatientDaysBudgeted" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAdjustedPatientDaysBudgeted" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAdjustedPatientDaysBudgeted" + index), me.cellColorInvalid, "Please enter valid Adjusted Patient Days.");
				}
				else {
					me.setCellColor($("#txtAdjustedPatientDaysBudgeted" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAnnualTransfers" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAnnualTransfers" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAnnualTransfers" + index), me.cellColorInvalid, "Please enter valid Annual Transfers.");
				}
				else {
					me.setCellColor($("#txtAnnualTransfers" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAnnualTransports" + index).val() != "" && !(/^[0-9]+$/.test($("#txtAnnualTransports" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAnnualTransports" + index), me.cellColorInvalid, "Please enter valid Annual Transports.");
				}
				else {
					me.setCellColor($("#txtAnnualTransports" + index), me.cellColorValid, "");
				}
				
				if ($("#txtShippingZip" + index).val() != "" && !(ui.cmn.text.validate.postalCode($("#txtShippingZip" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtShippingZip" + index), me.cellColorInvalid, "Please enter valid Postal Code.");
				}
				else {
					me.setCellColor($("#txtShippingZip" + index), me.cellColorValid, "");
				}
				
				if ($("#selRemitToLocation" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selRemitToLocation" + index), me.cellColorInvalid, "Please select valid Remit To Location.");
				}
				else {
					me.setCellColor($("#selRemitToLocation" + index), me.cellColorValid, "");
				}
				
				if ($("#selContractType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selContractType" + index), me.cellColorInvalid, "Please select valid Contract Type.");
				}
				else {
					me.setCellColor($("#selContractType" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBankZip" + index).val() != "" && !(ui.cmn.text.validate.postalCode($("#txtBankZip" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBankZip" + index), me.cellColorInvalid, "Please enter valid Postal Code.");
				}
				else {
					me.setCellColor($("#txtBankZip" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBankPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtBankPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBankPhone" + index), me.cellColorInvalid, "Please enter valid Bank Phone.");
				}
				else {
					me.setCellColor($("#txtBankPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBankFax" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtBankFax" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBankFax" + index), me.cellColorInvalid, "Please enter valid Bank Fax.");
				}
				else {
					me.setCellColor($("#txtBankFax" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBankEmail" + index).val() != "" && !(ui.cmn.text.validate.emailAddress($("#txtBankEmail" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBankEmail" + index), me.cellColorInvalid, "Please enter valid Email Id.");
				}
				else {
					me.setCellColor($("#txtBankEmail" + index), me.cellColorValid, "");
				}
				
				if ($("#txtStateTaxPercent" + index).val() != "" && !(/^[0-9]+(\.[0-9]+)?$/.test($("#txtStateTaxPercent" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtStateTaxPercent" + index), me.cellColorInvalid, "Please enter valid State Tax Percent.");
				}
				else {
					me.setCellColor($("#txtStateTaxPercent" + index), me.cellColorValid, "");
				}
				
				if ($("#txtLocalTaxPercent" + index).val() != "" && !(/^[0-9]+(\.[0-9]+)?$/.test($("#txtLocalTaxPercent" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtLocalTaxPercent" + index), me.cellColorInvalid, "Please enter valid Local Tax Percent.");
				}
				else {
					me.setCellColor($("#txtLocalTaxPercent" + index), me.cellColorValid, "");
				}
				
				if ($("#txtDefaultLunchBreak" + index).val() != "" && !(/^[0-9]+(\.[0-9]+)?$/.test($("#txtDefaultLunchBreak" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtDefaultLunchBreak" + index), me.cellColorInvalid, "Please enter valid Default Lunch Break.");
				}
				else {
					me.setCellColor($("#txtDefaultLunchBreak" + index), me.cellColorValid, "");
				}
				
				if ($("#txtLunchBreakTrigger" + index).val() != "" && !(/^[0-9]+(\.[0-9]+)?$/.test($("#txtLunchBreakTrigger" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtLunchBreakTrigger" + index), me.cellColorInvalid, "Please enter valid Lunch Break Trigger.");
				}
				else {
					me.setCellColor($("#txtLunchBreakTrigger" + index), me.cellColorValid, "");
				}
				
				if ($("#selHouseCodeType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selHouseCodeType" + index), me.cellColorInvalid, "Please enter valid House Code Type.");
				}
				else {
					me.setCellColor($("#selHouseCodeType" + index), me.cellColorValid, "");
				}
				
				if (!($("#txtRoundingTimePeriod" + index).val() == "6" || $("#txtRoundingTimePeriod" + index).val() == "15")) {
					rowValid = false;
					me.setCellColor($("#txtRoundingTimePeriod" + index), me.cellColorInvalid, "Please enter valid Rounding Time Period.");
				}
				else {
					me.setCellColor($("#txtRoundingTimePeriod" + index), me.cellColorValid, "");
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}
			
			for (var index = 0; index < me.houseCodes.length; index++) {				
				
				for (var indexI = index + 1; indexI < me.houseCodes.length; indexI++) {
					if ($("#txtBrief" + index).val() == $("#txtBrief" + indexI).val()) {
						rowValid = false;
						me.setCellColor($("#txtBrief" + indexI), me.cellColorInvalid, "Duplicate Brief is not allowed.");
					}
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}

			// If all required fields are entered correctly then validate the Briefs and FullPaths
			if (valid) {
				$("#messageToUser").text("Validating");
				$("#pageLoading").fadeIn("slow");

				me.bulkImportValidationStore.reset();
				me.bulkImportValidationStore.fetch("userId:[user]"
					+ ",briefs:" + briefs
					+ ",fullPaths:" + fullPaths
					, me.validationsLoaded
					, me);
			}
			else {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
				$("#AnchorSave").hide();
				alert("In order to save, the errors on the page must be corrected.");
			}
		},

		validationsLoaded: function(me, activeId) {

			$("#pageLoading").fadeOut("slow");
			
			for (var rowIndex = 0; rowIndex < me.houseCodes.length; rowIndex++) {
				for (var index = 1; index <= 16; index++) {
					$("#txtLevel" + index + "_" + rowIndex).attr("title", "");
					$("#txtLevel" + index + "_" + rowIndex).css("background-color", me.cellColorValid);
				}
			}

			if (me.bulkImportValidations.length > 0) {				

				var briefs = me.bulkImportValidations[0].briefs.split('|');
				var fullPaths = me.bulkImportValidations[0].fullPaths.split('|');				

				for (var rowIndex = 0; rowIndex < me.houseCodes.length; rowIndex++) {
					
					for (var index = 0; index < briefs.length - 1; index++) {
						if ($("#txtBrief" + rowIndex).val() == briefs[index]) {
							$("#txtBrief" + rowIndex).attr("title", "Brief already exists.");
							$("#txtBrief" + rowIndex).css("background-color", me.cellColorInvalid);							
						}							
					}	
					
					for(var index = 0; index < fullPaths.length - 1; index++) {
						var fullPath = "";
						
						for (var indexI = 1; indexI <= 16; indexI++) {
							if ($("#txtLevel" + indexI + "_" + rowIndex).val() != "")
								fullPath += "\\" + $("#txtLevel" + indexI + "_" + rowIndex).val();
						}

						if (fullPath == fullPaths[index]) {
							for (var indexI = 1; indexI <= 16; indexI++) {
								$("#txtLevel" + indexI + "_" + rowIndex).attr("title", "Invalid FullPath.");
								$("#txtLevel" + indexI + "_" + rowIndex).css("background-color", me.cellColorInvalid);
							}
						}
					}
				}
				
				me.setStatus("Loaded");
				$("#AnchorSave").hide();
				alert("In order to save, the errors on the page must be corrected.");				
			}
			else {
				if (me.actionSave) 
					me.actionSaveItem();
				else {
					$("#AnchorSave").show();
					me.setStatus("Loaded");
				}
			}
		},

		actionSaveHouseCodes: function() {
			var me = this;			
				
			if (confirm("House codes will be saved, Click OK to Continue, or Cancel"))
				me.actionSaveItem();
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			var xml = me.saveXmlBuildHouseCode(item);			

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		saveXmlBuildHouseCode: function() {
			var args = ii.args(arguments, {
				item: { type: [fin.hcm.houseCodeImport.HouseCode] }
			});
			var me = this;
			var xml = "";
			var fullPath = "";
			
			for (var index = 0; index < me.houseCodes.length; index++) {
				
				fullPath = "";
				for (var levelIndex = 1; levelIndex <= 16; levelIndex++) {
					if ($("#txtLevel" + levelIndex + "_" + index).val() != "")
						fullPath += "\\" + $("#txtLevel" + levelIndex + "_" + index).val();
				}				
								
				xml += '<houseCodeImport';
				xml += ' id="0"';
				xml += ' fullPath="' + ui.cmn.text.xml.encode(fullPath) + '"';
				xml += ' brief="' + $("#txtBrief" + index).val() + '"';
				xml += ' title="' + ui.cmn.text.xml.encode($("#txtTitle" + index).val()) + '"';
				xml += ' description="' + ui.cmn.text.xml.encode($("#txtDescription" + index).val()) + '"';
				xml += ' siteTitle="' + ui.cmn.text.xml.encode($("#txtSiteTitle" + index).val()) + '"';
				xml += ' siteAddressLine1="' + ui.cmn.text.xml.encode($("#txtSiteAddressLine1" + index).val()) + '"';
				xml += ' siteAddressLine2="' + ui.cmn.text.xml.encode($("#txtSiteAddressLine2" + index).val()) + '"';
				xml += ' siteCity="' + ui.cmn.text.xml.encode($("#txtSiteCity" + index).val()) + '"';
				xml += ' siteStateType="' + $("#selSiteStateType" + index).val() + '"';
				xml += ' postalCode="' + $("#txtPostalCode" + index).val() + '"';
				xml += ' county="' + ui.cmn.text.xml.encode($("#txtCounty" + index).val()) + '"';
				xml += ' industryType="' + $("#selIndustryType" + index).val() + '"';
				xml += ' primaryBusinessType="' + $("#selPrimaryBusinessType" + index).val() + '"';
				xml += ' locationType="' + $("#selLocationType" + index).val() + '"';
				xml += ' traumaLevelType="' + $("#selTraumaLevelType" + index).val() + '"';
				xml += ' profitDesignationType="' + $("#selProfitDesignationType" + index).val() + '"';
				xml += ' gpoType="' + $("#selGPOType" + index).val() + '"';
				xml += ' specifyGPO="' + ui.cmn.text.xml.encode($("#txtSpecifyGPO" + index).val()) + '"';
				xml += ' ownershipType="' + $("#selOwnershipType" + index).val() + '"';				
				xml += ' jdeCompany="' + $("#selJDECompany" + index).val() + '"';
				xml += ' startDate="' + $("#txtStartDate" + index).val() + '"';
				xml += ' serviceType="' + $("#selServiceType" + index).val() + '"';
				xml += ' enforceLaborControl="' + $("#chkEnforceLaborControl" + index)[0].checked + '"';
				xml += ' serviceLine="' + $("#selServiceLine" + index).val() + '"';
				xml += ' managerName="' + ui.cmn.text.xml.encode($("#txtManagerName" + index).val()) + '"';
				xml += ' managerEmail="' + ui.cmn.text.xml.encode($("#txtManagerEmail" + index).val()) + '"';
				xml += ' managerPhone="' + fin.cmn.text.mask.phone($("#txtManagerPhone" + index).val(), true) + '"';
				xml += ' managerCellPhone="' + fin.cmn.text.mask.phone($("#txtManagerCellPhone" + index).val(), true) + '"';
				xml += ' managerFax="' + fin.cmn.text.mask.phone($("#txtManagerFax" + index).val(), true) + '"';
				xml += ' managerPager="' + fin.cmn.text.mask.phone($("#txtManagerPager" + index).val(), true) + '"';
				xml += ' managerAssistantName="' + ui.cmn.text.xml.encode($("#txtManagerAssistantName" + index).val()) + '"';
				xml += ' managerAssistantPhone="' + fin.cmn.text.mask.phone($("#txtManagerAssistantPhone" + index).val(), true) + '"';
				xml += ' clientFirstName="' + ui.cmn.text.xml.encode($("#txtClientFirstName" + index).val()) + '"';
				xml += ' clientLastName="' + ui.cmn.text.xml.encode($("#txtClientLastName" + index).val()) + '"';						
				xml += ' clientTitle="' + ui.cmn.text.xml.encode($("#txtClientTitle" + index).val()) + '"';
				xml += ' clientPhone="' + fin.cmn.text.mask.phone($("#txtClientPhone" + index).val(), true) + '"';
				xml += ' clientFax="' + fin.cmn.text.mask.phone($("#txtClientFax" + index).val(), true) + '"';
				xml += ' clientAssistantName="' + ui.cmn.text.xml.encode($("#txtClientAssistantName" + index).val()) + '"';
				xml += ' clientAssistantPhone="' + fin.cmn.text.mask.phone($("#txtClientAssistantPhone" + index).val(), true) + '"';				
				xml += ' managedEmployees="' + $("#txtManagedEmployees" + index).val() + '"';
				xml += ' bedsLicensed="' + $("#txtBedsLicensed" + index).val() + '"';				
				xml += ' patientDays="' + $("#txtPatientDays" + index).val() + '"';
				xml += ' avgDailyCensus="' + $("#txtAverageDailyCensus" + index).val() + '"';
				xml += ' annualDischarges="' + $("#txtAnnualDischarges" + index).val() + '"';
				xml += ' avgBedTurnaroundTime="' + $("#txtAverageBedTurnaroundTime" + index).val() + '"';
				xml += ' netCleanableSqft="' + $("#txtNetCleanableSqft" + index).val() + '"';
				xml += ' avgLaundryLbs="' + $("#txtAverageLaundryLbs" + index).val() + '"';
				xml += ' crothallEmployees="' + $("#txtCrothallEmployees" + index).val() + '"';
				xml += ' bedsActive="' + $("#txtBedsActive" + index).val() + '"';
				xml += ' adjustedPatientDaysBudgeted="' + $("#txtAdjustedPatientDaysBudgeted" + index).val() + '"';
				xml += ' annualTransfers="' + $("#txtAnnualTransfers" + index).val() + '"';
				xml += ' annualTransports="' + $("#txtAnnualTransports" + index).val() + '"';				
				xml += ' shippingAddress1="' + ui.cmn.text.xml.encode($("#txtShippingAddress1" + index).val()) + '"';
				xml += ' shippingAddress2="' + ui.cmn.text.xml.encode($("#txtShippingAddress2" + index).val()) + '"';
				xml += ' shippingCity="' + ui.cmn.text.xml.encode($("#txtShippingCity" + index).val()) + '"';
				xml += ' shippingState="' + $("#selShippingState" + index).val() + '"';
				xml += ' shippingZip="' + $("#txtShippingZip" + index).val() + '"';
				xml += ' remitToLocation="' + $("#selRemitToLocation" + index).val() + '"';
				xml += ' contractType="' + $("#selContractType" + index).val() + '"';
				xml += ' termsOfContractType="' + $("#selTermsOfContractType" + index).val() + '"';
				xml += ' billingCycleFrequencyType="' + $("#selBillingCycleFrequencyType" + index).val() + '"';
				xml += ' financialEntityType="' + $("#selFinancialEntityType" + index).val() + '"';
				xml += ' bankCodeNumber="' + ui.cmn.text.xml.encode($("#txtBankCodeNumber" + index).val()) + '"';				
				xml += ' bankAccountNumber="' + ui.cmn.text.xml.encode($("#txtBankAccountNumber" + index).val()) + '"';				
				xml += ' bankName="' + ui.cmn.text.xml.encode($("#txtBankName" + index).val()) + '"';
				xml += ' bankContact="' + ui.cmn.text.xml.encode($("#txtBankContact" + index).val()) + '"';
				xml += ' bankAddress1="' + ui.cmn.text.xml.encode($("#txtBankAddress1" + index).val()) + '"';
				xml += ' bankAddress2="' + ui.cmn.text.xml.encode($("#txtBankAddress2" + index).val()) + '"';
				xml += ' bankCity="' + ui.cmn.text.xml.encode($("#txtBankCity" + index).val()) + '"';
				xml += ' bankState="' + $("#selBankState" + index).val() + '"';
				xml += ' bankZip="' + $("#txtBankZip" + index).val() + '"';
				xml += ' bankPhone="' + fin.cmn.text.mask.phone($("#txtBankPhone" + index).val(), true) + '"';
				xml += ' bankFax="' + fin.cmn.text.mask.phone($("#txtBankFax" + index).val(), true) + '"';
				xml += ' bankEmail="' + ui.cmn.text.xml.encode($("#txtBankEmail" + index).val()) + '"';
				xml += ' invoiceLogoType="' + $("#selInvoiceLogoType" + index).val() + '"';
				xml += ' stateTaxPercent="' + $("#txtStateTaxPercent" + index).val() + '"';
				xml += ' localTaxPercent="' + $("#txtLocalTaxPercent" + index).val() + '"';
				xml += ' payrollProcessingLocationType="' + $("#selPayrollProcessingLocationType" + index).val() + '"';
				xml += ' defaultLunchBreak="' + $("#txtDefaultLunchBreak" + index).val() + '"';
				xml += ' lunchBreakTrigger="' + $("#txtLunchBreakTrigger" + index).val() + '"';
				xml += ' houseCodeType="' + $("#selHouseCodeType" + index).val() + '"';
				xml += ' roundingTimePeriod="' + $("#txtRoundingTimePeriod" + index).val() + '"';
				xml += ' timeAndAttendance="' + $("#chkTimeAndAttendance" + index)[0].checked + '"';
				xml += ' ePaySite="' + $("#chkEPaySite" + index)[0].checked + '"';
				xml += ' ePayGroupType="' + $("#selEPayGroupType" + index).val() + '"';
				xml += ' payrollCompanyHourly="' + $("#selPayrollCompanyHourly" + index).val() + '"';
				xml += ' payrollCompanySalaried="' + $("#selPayrollCompanySalaried" + index).val() + '"';
				xml += '/>';
			}
	
			return xml;
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
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
				me.pages[me.pageCurrent - 1].saved = true;
				me.modified(false);

				$("#AnchorValidate").hide();
				$("#AnchorSave").hide();
			}
			else {
				alert("[SAVE FAILURE] Error while updating House Code details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").hide();
		},
		
		actionImportSave: function() {
			var me = this;
			var item = [];

			$("#messageToUser").text("Importing");
			
			var xml = '<appGenericImport';
				xml += ' fileName="' + me.fileName + '"';
				xml += ' object="HouseCode"';
				xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveImportResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveImportResponse: function() {
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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "appGenericImport":							
							me.batchId = parseInt($(this).attr("batch"), 10);
							me.houseCodeCountLoad();

							break;
					}
				});
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while importing House Code details: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		}		
	}
});

function onFileChange() {
	var me = fin.hcm.houseCodeImportUI;	
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));

	if (fileExtension == ".xlsx")
		me.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {
	fin.hcm.houseCodeImportUI = new fin.hcm.houseCodeImport.UserInterface();
	fin.hcm.houseCodeImportUI.resize();
}
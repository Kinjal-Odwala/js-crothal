ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.emp.employeeImport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dateDropDown", 7 );

ii.Class({
    Name: "fin.emp.employeeImport.UserInterface",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionSave = false;
			me.fileName = "";
			me.cellColorValid = "";
			me.cellColorInvalid = "red";
			me.pages = [];
			me.houseCodeCache = [];
			me.statesCache = [];
			me.localTaxCodesCache = [];
			me.houseCodeLoading = 0;
			me.statesLoading = 0;
			me.localTaxCodesLoading = 0;
			me.employeeLoading = false;
			me.batchId = 0;
			me.minimumRecords = 0;
			me.loadCount = 0;

			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 30;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "emp\\employeeImport";
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
			$("#divEmployeeGrid").bind("scroll", me.employeeGridScroll);
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevEmployeeList(); });
			$("#imgNext").bind("click", function() { me.nextEmployeeList(); });
			
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

		authorizationProcess: function fin_emp_employeeImport_UserInterface_authorizationProcess() {
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
			me.session.registerFetchNotify(me.sessionLoaded,me);
			me.systemVariableStore.fetch("userId:[user],name:EmployeeImportMinimumRecords", me.systemVariablesLoaded, me);
			me.statusTypeStore.fetch("userId:[user],personId:0", me.statusTypesLoaded, me);
			me.payFrequencyTypeStore.fetch("userId:[user]", me.payFrequencyTypesLoaded, me);
			me.federalAdjustmentStore.fetch("userId:[user]", me.federalAdjustmentsLoaded, me);
			me.stateStore.fetch("userId:[user]", me.statesLoaded, me);
		},	
		
		sessionLoaded: function fin_emp_employeeImport_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;
			var divGridWidth = $(window).width() - 22;
			var divGridHeight = $(window).height() - 185;

			$("#divEmployeeGrid").css({"width" : divGridWidth + "px", "height" : divGridHeight + "px"});
		},
		
		employeeGridScroll: function() {
		    var scrollLeft = $("#divEmployeeGrid").scrollLeft();
		    
			$("#tblEmployeeGridHeader").css("left", -scrollLeft + "px");
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
					brief: "Bulk Employee Import", 
					title: "Upload the Excel file for importing bulk employees.",
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
				clickFunction: function() { me.actionSaveEmployees(); },
				hasHotState: true
			});
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.employees = [];
			me.employeeStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.emp.employeeImport.Employee,
				itemConstructorArgs: fin.emp.employeeImport.employeeArgs,
				injectionArray: me.employees
			});
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.employeeImport.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeImport.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
			
			me.bulkImportValidations = [];
			me.bulkImportValidationStore = me.cache.register({
				storeId: "empEmployeeImportValidations",
				itemConstructor: fin.emp.employeeImport.BulkImportValidation,
				itemConstructorArgs: fin.emp.employeeImport.bulkImportValidationArgs,
				injectionArray: me.bulkImportValidations
			});
			
			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "appRecordCounts",
				itemConstructor: fin.emp.employeeImport.RecordCount,
				itemConstructorArgs: fin.emp.employeeImport.recordCountArgs,
				injectionArray: me.recordCounts
			});
			
			me.statusTypes = [];
			me.statusTypeStore = me.cache.register({
				storeId: "employeeGeneralMasters",
				itemConstructor: fin.emp.employeeImport.StatusType,
				itemConstructorArgs: fin.emp.employeeImport.statusTypeArgs,
				injectionArray: me.statusTypes	
			});

			me.houseCodePayrollCompanys = [];
			me.houseCodePayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.emp.employeeImport.HouseCodePayrollCompany,
				itemConstructorArgs: fin.emp.employeeImport.houseCodePayrollCompanyArgs,
				injectionArray: me.houseCodePayrollCompanys
			});

			me.statusCategoryTypes = [];
			me.statusCategoryTypeStore = me.cache.register({
				storeId: "statusCategoryTypes",
				itemConstructor: fin.emp.employeeImport.StatusCategoryType,
				itemConstructorArgs: fin.emp.employeeImport.statusCategoryTypeArgs,
				injectionArray: me.statusCategoryTypes	
			});
			
			me.deviceGroupTypes = [];
			me.deviceGroupStore = me.cache.register({
				storeId: "deviceGroupTypes",
				itemConstructor: fin.emp.employeeImport.DeviceGroupType,
				itemConstructorArgs: fin.emp.employeeImport.deviceGroupTypeArgs,
				injectionArray: me.deviceGroupTypes	
			});
			
			me.genderTypes = [];
			me.genderTypeStore = me.cache.register({
				storeId: "genderTypes",
				itemConstructor: fin.emp.employeeImport.GenderType,
				itemConstructorArgs: fin.emp.employeeImport.genderTypeArgs,
				injectionArray: me.genderTypes	
			});
		
			me.jobCodeTypes = [];
			me.jobCodeStore = me.cache.register({
				storeId: "jobCodes",
				itemConstructor: fin.emp.employeeImport.JobCodeType,
				itemConstructorArgs: fin.emp.employeeImport.jobCodeTypeArgs,
				injectionArray: me.jobCodeTypes	
			});

			me.ethnicityTypes = [];
			me.ethnicityTypeStore = me.cache.register({
				storeId: "ethnicityTypes",
				itemConstructor: fin.emp.employeeImport.EthnicityType,
				itemConstructorArgs: fin.emp.employeeImport.ethnicityTypeArgs,
				injectionArray: me.ethnicityTypes	
			});

			me.unionTypes = [];
			me.unionTypeStore = me.cache.register({
				storeId: "unionTypes",
				itemConstructor: fin.emp.employeeImport.UnionType,
				itemConstructorArgs: fin.emp.employeeImport.unionTypeArgs,
				injectionArray: me.unionTypes	
			});

			me.rateChangeReasons = [];
			me.rateChangeReasonStore = me.cache.register({
				storeId: "rateChangeReasons",
				itemConstructor: fin.emp.employeeImport.RateChangeReasonType,
				itemConstructorArgs: fin.emp.employeeImport.rateChangeReasonTypeArgs,
				injectionArray: me.rateChangeReasons	
			});
			
			me.terminationReasons = [];
			me.terminationReasonStore = me.cache.register({
				storeId: "terminationReasons",
				itemConstructor: fin.emp.employeeImport.TerminationReasonType,
				itemConstructorArgs: fin.emp.employeeImport.terminationReasonTypeArgs,
				injectionArray: me.terminationReasons	
			});
			
			me.workShifts = [];
			me.workShiftStore = me.cache.register({
				storeId: "workShifts",
				itemConstructor: fin.emp.employeeImport.WorkShift,
				itemConstructorArgs: fin.emp.employeeImport.workShiftArgs,
				injectionArray: me.workShifts	
			});
			
			me.payFrequencyTypes = [];
			me.payFrequencyTypeStore = me.cache.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.emp.employeeImport.PayFrequencyType,
				itemConstructorArgs: fin.emp.employeeImport.payFrequencyTypeArgs,
				injectionArray: me.payFrequencyTypes	
			});
			
			me.i9Types = [];
			me.i9TypeStore = me.cache.register({
				storeId: "i9Types",
				itemConstructor: fin.emp.employeeImport.I9Type,
				itemConstructorArgs: fin.emp.employeeImport.i9TypeArgs,
				injectionArray: me.i9Types	
			});
			
			me.vetTypes = [];
			me.vetTypeStore = me.cache.register({
				storeId: "vetTypes",
				itemConstructor: fin.emp.employeeImport.VetType,
				itemConstructorArgs: fin.emp.employeeImport.vetTypeArgs,
				injectionArray: me.vetTypes	
			});
			
			me.separationCodes = [];
			me.separationCodeStore = me.cache.register({
				storeId: "separationCodes",
				itemConstructor: fin.emp.employeeImport.SeparationCode,
				itemConstructorArgs: fin.emp.employeeImport.separationCodeArgs,
				injectionArray: me.separationCodes	
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.emp.employeeImport.HouseCodeJob,
				itemConstructorArgs: fin.emp.employeeImport.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
						
			me.jobStartReasonTypes = [];
			me.jobStartReasonTypeStore = me.cache.register({
				storeId: "jobStartReasonTypes",
				itemConstructor: fin.emp.employeeImport.JobStartReasonType,
				itemConstructorArgs: fin.emp.employeeImport.jobStartReasonTypeArgs,
				injectionArray: me.jobStartReasonTypes
			});
			
			me.maritalStatusTypes = [];
			me.maritalStatusTypeStore = me.cache.register({
				storeId: "maritalStatusTypes",
				itemConstructor: fin.emp.employeeImport.MaritalStatusType,
				itemConstructorArgs: fin.emp.employeeImport.maritalStatusTypeArgs,
				injectionArray: me.maritalStatusTypes
			});
			
			me.federalAdjustments = [];
			me.federalAdjustmentStore = me.cache.register({
				storeId: "employeePayrollMasters",
				itemConstructor: fin.emp.employeeImport.FederalAdjustment,
				itemConstructorArgs: fin.emp.employeeImport.federalAdjustmentArgs,
				injectionArray: me.federalAdjustments	
			});
			
			me.stateAdjustmentTypes = [];
			me.stateAdjustmentTypeStore = me.cache.register({
				storeId: "stateAdjustmentTypes",
				itemConstructor: fin.emp.employeeImport.StateAdjustmentType,
				itemConstructorArgs: fin.emp.employeeImport.stateAdjustmentTypeArgs,
				injectionArray: me.stateAdjustmentTypes	
			});
			
			me.maritalStatusStateTaxTypePrimarys = [];
			me.maritalStatusStateTaxTypePrimaryStore = me.cache.register({
				storeId: "maritalStatusPrimaryTypes",
				itemConstructor: fin.emp.employeeImport.MaritalStatusType,
				itemConstructorArgs: fin.emp.employeeImport.maritalStatusTypeArgs,
				injectionArray: me.maritalStatusStateTaxTypePrimarys	
			});
			
			me.maritalStatusStateTaxTypeSecondarys = [];
			me.maritalStatusStateTaxTypeSecondaryStore = me.cache.register({
				storeId: "maritalStatusSecondaryTypes",
				itemConstructor: fin.emp.employeeImport.SecMaritalStatusType,
				itemConstructorArgs: fin.emp.employeeImport.secMaritalStatusTypeArgs,
				injectionArray: me.maritalStatusStateTaxTypeSecondarys	
			});
			
			me.maritalStatusFederalTaxTypes = [];
			me.maritalStatusFederalTaxTypeStore = me.cache.register({
				storeId: "maritalStatusFederalTaxTypes",
				itemConstructor: fin.emp.employeeImport.MaritalStatusFederalTaxType,
				itemConstructorArgs: fin.emp.employeeImport.maritalStatusFederalTaxTypeArgs,
				injectionArray: me.maritalStatusFederalTaxTypes	
			});
			
			me.states = [];
			me.stateStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.emp.employeeImport.State,
				itemConstructorArgs: fin.emp.employeeImport.stateArgs,
				injectionArray: me.states	
			});
			
			me.sdiAdjustmentTypes = [];
			me.sdiAdjustmentTypeStore = me.cache.register({
				storeId: "sdiAdjustmentTypes",
				itemConstructor: fin.emp.employeeImport.SDIAdjustmentType,
				itemConstructorArgs: fin.emp.employeeImport.sdiAdjustmentTypeArgs,
				injectionArray: me.sdiAdjustmentTypes	
			});
			
			me.localTaxAdjustmentTypes = [];
			me.localTaxAdjustmentTypeStore = me.cache.register({
				storeId: "localTaxAdjustmentTypes",
				itemConstructor: fin.emp.employeeImport.LocalTaxAdjustmentType,
				itemConstructorArgs: fin.emp.employeeImport.localTaxAdjustmentTypeArgs,
				injectionArray: me.localTaxAdjustmentTypes	
			});
			
			me.localTaxCodes = [];
			me.localTaxCodeStore = me.cache.register({
				storeId: "localTaxCodePayrollCompanyStates",
				itemConstructor: fin.emp.employeeImport.LocalTaxCode,
				itemConstructorArgs: fin.emp.employeeImport.localTaxCodeArgs,
				injectionArray: me.localTaxCodes	
			});

			me.basicLifeIndicatorTypes = [];
			me.basicLifeIndicatorTypeStore = me.cache.register({
				storeId: "basicLifeIndicatorTypes",
				itemConstructor: fin.emp.employeeImport.BasicLifeIndicatorType,
				itemConstructorArgs: fin.emp.employeeImport.basicLifeIndicatorTypeArgs,
				injectionArray: me.basicLifeIndicatorTypes
			});
			
			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.emp.employeeImport.SystemVariable,
				itemConstructorArgs: fin.emp.employeeImport.systemVariableArgs,
				injectionArray: me.systemVariables
			});
		},
		
		setStatus: function(status, message) {
			var me = this;

			fin.cmn.status.setStatus(status, message);
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
		
		systemVariablesLoaded:function(me, activeId) {

			if (me.systemVariables.length > 0)
				me.minimumRecords = parseInt(me.systemVariables[0].variableValue);
				
			me.checkLoadCount();
		},
		
		statusTypesLoaded: function(me, activeId) {
			
			me.multiRaceTypes = [];
			me.disabilityTypes = [];
			
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 2, name: "Female" }));
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 1, name: "Male" }));
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 0, name: "" }));

			me.jobCodeTypes.unshift(new fin.emp.employeeImport.JobCodeType({ id: 0, name: "" }));
			me.ethnicityTypes.unshift(new fin.emp.employeeImport.EthnicityType({ id: 0, name: "" }));
			me.unionTypes.unshift(new fin.emp.employeeImport.UnionType({ id: 0, name: "" }));
			me.i9Types.unshift(new fin.emp.employeeImport.I9Type({ id: 0, name: "" }));
			me.vetTypes.unshift(new fin.emp.employeeImport.VetType({ id: 0, name: "" }));			
			me.maritalStatusTypes.unshift(new fin.emp.employeeImport.MaritalStatusType({ id: 0, name: "" }));
			me.basicLifeIndicatorTypes.unshift(new fin.emp.employeeImport.BasicLifeIndicatorType({ id: 0, name: "" }));
			
			me.disabilityTypes.push(new fin.emp.employeeImport.DisabilityType({ id: 0, name: "" }));
			me.disabilityTypes.push(new fin.emp.employeeImport.DisabilityType({ id: 1, name: "Yes, I have a disability (or previously had a disability)" }));
			me.disabilityTypes.push(new fin.emp.employeeImport.DisabilityType({ id: 2, name: "No, I don't have a disability" }));
			me.disabilityTypes.push(new fin.emp.employeeImport.DisabilityType({ id: 3, name: "I don't wish to answer" }));

			for (var index = 0; index < me.ethnicityTypes.length; index++) {
				if (me.ethnicityTypes[index].name != "Two or more races" && me.ethnicityTypes[index].name != "Unknown") {
					me.multiRaceTypes.push(new fin.emp.employeeImport.EthnicityType(me.ethnicityTypes[index].id, me.ethnicityTypes[index].name));
				}
			}
			
			me.checkLoadCount();
		},
		
		payFrequencyTypesLoaded: function(me, activeId) {
			me.checkLoadCount();			
		},
		
		federalAdjustmentsLoaded: function(me, activeId) {			
			
			me.federalAdjustments.unshift(new fin.emp.employeeImport.FederalAdjustment({ id: 0, name: "" }));
			me.maritalStatusFederalTaxTypes.unshift(new fin.emp.employeeImport.MaritalStatusFederalTaxType({ id: 0, name: "" }));
			me.checkLoadCount();
		},
	
		statesLoaded: function(me, activeId) {
			
			me.states.unshift(new fin.emp.employeeImport.State({ id: 0, name: "" }));
			me.checkLoadCount();
		},
		
		prevEmployeeList: function() {
		    var me = this;

			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid())
				return;

			me.pageCurrent--;
			
			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.changeEmployeeList();
		},

		nextEmployeeList: function() {
		    var me = this;

			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid())
				return;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.changeEmployeeList();
		},
		
		pageNumberChange: function() {
		    var me = this;

			if (!me.pages[me.pageCurrent - 1].saved && !fin.cmn.status.itemValid()) {
				$("#selPageNumber").val(me.pageCurrent);
				return;
			}

		    me.pageCurrent = Number($("#selPageNumber").val());
		    me.changeEmployeeList();
		},

		changeEmployeeList: function() {
		    var me = this;
		    		        
		    me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");				
			$("#selPageNumber").val(me.pageCurrent);

			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;		
			me.employeeStore.fetch("userId:[user],batch:" + me.batchId + ",object:Employee,startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows, me.employeesLoaded, me);
		},
		
		employeeCountLoad: function() {
		    var me = this;
			
			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
				    
		    me.recordCountStore.reset();
			me.recordCountStore.fetch("userId:[user]," + "id:" + me.batchId + ",module:ImportEmployees", me.recordCountLoaded, me);
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

			me.employeeStore.reset();
			me.employeeStore.fetch("userId:[user],batch:" + me.batchId + ",object:Employee,startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows, me.employeesLoaded, me);
		},
		
		actionImportItem: function() {
			var me = this;

			if (!fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Bulk Employee Import");
			$("#AnchorValidate").hide();
			$("#AnchorSave").hide();
			$("#tblEmployees").hide();
			$("#iFrameUpload").height(30);
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			me.setStatus("Loaded");
		},
		
		actionCancelItem: function() {
			var me = this;

			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			me.setStatus("Loaded");			
		},
		
		actionUploadItem: function() {
			var me = this;

			me.fileName = "";
			
			me.setStatus("Uploading");
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow");
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (me.fileName == "Error") {
						me.setStatus("Info", "Unable to upload the file. Please try again.");
						alert("Unable to upload the file. Please try again.");
						$("#pageLoading").fadeOut("slow");
					}
					else {
						me.actionImportSave();
					}
				}
				
			}, 1000);
		},
		
		employeesLoaded: function(me, activeId) {
			
			var employeeRow = "";
			var employeeRowTemplate = $("#tblEmployeeTemplate").html();
			var idIndex = 0;
			
			$("#messageToUser").text("Loading");
			$("#EmployeeGridBody").html("");			
			$("#divFrame").hide();
			$("#divUpload").hide();			
			$("#AnchorSave").hide();
			$("#tblEmployees").show();
			
			if (me.pages[me.pageCurrent - 1].saved || me.employees.length == 0)
				$("#AnchorValidate").hide();
			else {
				$("#AnchorValidate").show();
				me.modified(true);
			}
				
			if (me.employees.length == 0)
				alert("Invalid records not found during the import process.");

			me.employeeLoading = true;

			for (var index = 0; index < me.employees.length; index++) {					
				//create the row for the employee information
				employeeRow = employeeRowTemplate;
				employeeRow = employeeRow.replace(/RowCount/g, index);
				employeeRow = employeeRow.replace("#", index + 1);
				
				$("#EmployeeGridBody").append(employeeRow);

				me.houseCodeCheck(index, me.employees[index].column1);

				idIndex = me.findIndexByTitle(me.employees[index].column37, me.states);
				if (idIndex != undefined) {
					me.stateCheck(index,  me.states[idIndex].id, true);
				}
				
				idIndex = me.findIndexByTitle(me.employees[index].column38, me.states);
				if (idIndex != undefined) {
					me.stateCheck(index,  me.states[idIndex].id, false);
				}

				$("#txtHouseCode" + index).bind("blur", function() { me.houseCodeBlur(this); });
				$("#selPrimaryState" + index).bind("change", function() { me.primaryStateChange(this); });
				$("#selSecondaryState" + index).bind("change", function() { me.secondaryStateChange(this); });
				$("#selEthnicityType" + index).bind("change", function() { me.ethnicityTypeChange(this); });
			}
			
			me.buildDropDown("State", me.states);
			me.buildDropDown("JobCodeType", me.jobCodeTypes);
			me.buildDropDown("UnionType", me.unionTypes);
			me.buildDropDown("GenderType", me.genderTypes);
			me.buildDropDown("EthnicityType", me.ethnicityTypes);
			me.buildDropDown("FederalAdjustmentType", me.federalAdjustments);
			me.buildDropDown("MaritalStatusFederalTaxType", me.maritalStatusFederalTaxTypes);
			me.buildDropDown("PrimaryState", me.states);
			me.buildDropDown("SecondaryState", me.states);	
			me.buildDropDown("I9Type", me.i9Types);
			me.buildDropDown("VetType", me.vetTypes);
			me.buildDropDown("MaritalStatusType", me.maritalStatusTypes);
			me.buildDropDown("BasicLifeIndicatorType", me.basicLifeIndicatorTypes);
			me.buildDropDown("MultiRace1", me.multiRaceTypes);
			me.buildDropDown("MultiRace2", me.multiRaceTypes);
			me.buildDropDown("MultiRace3", me.multiRaceTypes);
			me.buildDropDown("MultiRace4", me.multiRaceTypes);
			me.buildDropDown("MultiRace5", me.multiRaceTypes);
			me.buildDropDown("DisabilityType", me.disabilityTypes);
			
			employeeRow = '<tr height="100%"><td colspan="62" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#EmployeeGridBody").append(employeeRow);
			$("#EmployeeGrid tr:odd").addClass("gridRow");
        	$("#EmployeeGrid tr:even").addClass("alternateGridRow");

			/*for (var index = 0; index < $("#trEmployeeGridHead")[0].childNodes.length; index++) {
				if ($("#trEmployeeGridHead")[0].childNodes[index].clientWidth != $("#trEmployee0")[0].childNodes[index].clientWidth)
					alert(index);
			}*/
			
			me.resize();
			
			me.intervalId = setInterval(function() {
				if (me.houseCodeLoading <= 0 && me.statesLoading <= 0 && me.localTaxCodesLoading <= 0) {
					clearInterval(me.intervalId);
					me.loadEmployeeData();
				}
			}, 1000);	
  		},
		
		loadEmployeeData: function() {
			var me = this;

			for (var index = 0; index < me.employees.length; index++) {				

				$("#txtHouseCode" + index).val(me.employees[index].column1);
				$("#txtBrief" + index).val(me.employees[index].column2.substring(0, 16));
				$("#txtFirstName" + index).val(me.employees[index].column3);
				$("#txtLastName" + index).val(me.employees[index].column4);
				$("#txtMiddleName" + index).val(me.employees[index].column5);
				$("#txtAddress1" + index).val(me.employees[index].column6);
				$("#txtAddress2" + index).val(me.employees[index].column7);
				$("#txtCity" + index).val(me.employees[index].column8);
				me.setDropDownValue(me.states, me.employees[index].column9, "State", index);
				$("#txtPostalCode" + index).val(me.employees[index].column10);
				$("#txtHomePhone" + index).val(me.employees[index].column11);
				$("#txtFax" + index).val(me.employees[index].column12);
				$("#txtCellPhone" + index).val(me.employees[index].column13);
				$("#txtEmail" + index).val(me.employees[index].column14);
				$("#txtPager" + index).val(me.employees[index].column15);
				$("#txtSSN" + index).val(me.employees[index].column16);
				var houseCode = $("#txtHouseCode" + index).val();
				me.setDropDownValue(me.jobCodeTypes, me.employees[index].column17, "JobCodeType", index);
				$("#txtHireDate" + index).val(me.stripTimeStamp(me.employees[index].column18));
				$("#txtSeniorityDate" + index).val(me.stripTimeStamp(me.employees[index].column19));
				$("#txtScheduledHours" + index).val(me.employees[index].column20);
				if (me.employees[index].column21 == "1")
					$("#chkUnion" + index)[0].checked = true;
				$("#txtAlternatePayRateA" + index).val(me.employees[index].column22);
				$("#txtAlternatePayRateB" + index).val(me.employees[index].column23);
				$("#txtAlternatePayRateC" + index).val(me.employees[index].column24);
				$("#txtAlternatePayRateD" + index).val(me.employees[index].column25);
				$("#txtOriginalHireDate" + index).val(me.stripTimeStamp(me.employees[index].column26));
				me.setDropDownValue(me.unionTypes, me.employees[index].column27, "UnionType", index);
				$("#txtPayRate" + index).val(me.employees[index].column28);
				me.setDropDownValue(me.genderTypes, me.employees[index].column29, "GenderType", index);
				me.setDropDownValue(me.ethnicityTypes, me.employees[index].column30, "EthnicityType", index);
				$("#txtBirthDate" + index).val(me.stripTimeStamp(me.employees[index].column31))
				$("#txtBackGroundCheckDate" + index).val(me.stripTimeStamp(me.employees[index].column32));				
				$("#txtFederalExemptions" + index).val(me.employees[index].column33);
				me.setDropDownValue(me.federalAdjustments, me.employees[index].column34, "FederalAdjustmentType", index);
				me.setDropDownValue(me.maritalStatusFederalTaxTypes, me.employees[index].column35, "MaritalStatusFederalTaxType", index);
				$("#txtFederalAdjustmentAmount" + index).val(me.employees[index].column36);
				me.setDropDownValue(me.states, me.employees[index].column37, "PrimaryState", index);
				me.setDropDownValue(me.states, me.employees[index].column38, "SecondaryState", index);
				var primaryState = $("#selPrimaryState" + index).val();
				me.setDropDownValue(me.statesCache[primaryState].maritalStatusStateTaxTypes, me.employees[index].column39, "MaritalStatusStateTaxTypePrimary", index);
				var secondaryState = $("#selSecondaryState" + index).val();
				me.setDropDownValue(me.statesCache[secondaryState].maritalStatusStateTaxTypes, me.employees[index].column40, "MaritalStatusStateTaxTypeSecondary", index);
				$("#txtStateExemptions" + index).val(me.employees[index].column41);
				me.setDropDownValue(me.statesCache[primaryState].stateAdjustmentTypes, me.employees[index].column42, "StateAdjustmentType", index);
				$("#txtStateAdjustmentAmount" + index).val(me.employees[index].column43);
				me.setDropDownValue(me.statesCache[primaryState].sdiAdjustmentTypes, me.employees[index].column44, "SDIAdjustmentType", index);
				$("#txtSDIRate" + index).val(me.employees[index].column45);
				me.setDropDownValue(me.statesCache[primaryState].localTaxAdjustmentTypes, me.employees[index].column46, "LocalTaxAdjustmentType", index);
				$("#txtLocalTaxAdjustmentAmount" + index).val(me.employees[index].column47);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column48, "LocalTaxCode1", index);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column49, "LocalTaxCode2", index);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column50, "LocalTaxCode3", index);
				me.setDropDownValue(me.i9Types, me.employees[index].column51, "I9Type", index);
				me.setDropDownValue(me.vetTypes, me.employees[index].column52, "VetType", index);
				me.setDropDownValue(me.maritalStatusTypes, me.employees[index].column53, "MaritalStatusType", index);
				me.setDropDownValue(me.basicLifeIndicatorTypes, me.employees[index].column54, "BasicLifeIndicatorType", index);
				me.setDropDownValue(me.multiRaceTypes, me.employees[index].column55, "MultiRace1", index);
				me.setDropDownValue(me.multiRaceTypes, me.employees[index].column56, "MultiRace2", index);
				me.setDropDownValue(me.multiRaceTypes, me.employees[index].column57, "MultiRace3", index);
				me.setDropDownValue(me.multiRaceTypes, me.employees[index].column58, "MultiRace4", index);
				me.setDropDownValue(me.multiRaceTypes, me.employees[index].column59, "MultiRace5", index);
				me.setDropDownValue(me.disabilityTypes, me.employees[index].column60, "DisabilityType", index);
				
				if (me.employees[index].column30 != "Two or more races") {
					me.ethnicityTypeChange($("#selEthnicityType" + index)[0]);
				}
			}
			
			me.employeeLoading = false;
			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");
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

		getPayrollCompany: function(houseCode) {
			var me = this;
			var payrollCompanyId = 0;

			for (var index = 0; index < me.houseCodeCache[houseCode].payrollCompanies.length; index++) {
				if (me.houseCodeCache[houseCode].payrollCompanies[index].hourly) {
					payrollCompanyId = me.houseCodeCache[houseCode].payrollCompanies[index].id;
					break;
				}
			}

			return payrollCompanyId;
		},
		
		setDropDownValue: function(types, title, controlName, index) {
			var me = this;
			var idIndex = 0;
			
			idIndex = me.findIndexByTitle(title, types);
			if (idIndex != undefined) {
				$("#sel" + controlName + index).val(types[idIndex].id);				
			}
		},

		houseCodeBlur: function(objInput) {
			var me = this;
		    var rowNumber = Number(objInput.id.substr(12));

		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");
		    if (objInput.value == "") objInput.value = me.employees[rowNumber].column1;

			//make sure that we have a change
		    if (objInput.value != me.employees[rowNumber].column1) {				
		        me.employees[rowNumber].column1 = objInput.value;
		    	me.houseCodeCheck(rowNumber, objInput.value);
		    }
		},
		
		houseCodeCheck: function(rowNumber, houseCode) {
			var me = this;

		    if (me.houseCodeCache[houseCode] != undefined) {
	            if (me.houseCodeCache[houseCode].loaded)
					me.houseCodeValidate(houseCode, [rowNumber]);              
	            else
	                me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.houseCodeLoad(rowNumber, houseCode);
		},
		
		houseCodeValidate: function(houseCode, rowArray) {
		    var me = this;
		    var rowNumber = 0;
		    var objInput = null;
			var payrollCompany = 0;
			var idIndex = 0;

		    if (me.houseCodeCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					payrollCompany = me.getPayrollCompany(houseCode);
					idIndex = me.findIndexByTitle(me.employees[rowNumber].column37, me.states);
					if (idIndex != undefined)
						me.localTaxCodeCheck(rowNumber, me.states[idIndex].id.toString(), payrollCompany);
					objInput = $("#txtHouseCode" + rowNumber);
					me.setCellColor(objInput, me.cellColorValid, "");
		        }
		    }
		    else {
				for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					objInput = $("#txtHouseCode" + rowNumber);
					objInput.css("background-color", me.cellColorInvalid);
		        }
		    }
		},
		
		houseCodeLoad: function(rowNumber, houseCode) {
		    var me = this;
			
		    $("#pageLoading").fadeIn("slow");
			$("#messageToUser").text("Loading");
		    me.houseCodeLoading++;
		   
		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
		    me.houseCodeCache[houseCode].buildQueue = [];
		    me.houseCodeCache[houseCode].payrollCompanies = [];
			me.houseCodeCache[houseCode].stateMinimumWages = [];
		    me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],"
                    + "appUnitBrief:" + houseCode + ",<criteria>",
                
                success: function(xml) {
					if ($(xml).find('item').length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = $(this).attr("id");
							me.houseCodePayrollCompaniesLoad(houseCode);
		                });
		            }
		            else {
		                //the house code is invalid
		                //validate the list of rows
		                me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);    		            
		                me.houseCodeLoading--;
						if (me.houseCodeLoading <= 0 && !me.employeeLoading) $("#pageLoading").fadeOut("slow");
		            }
				}
			});
		},
		
		houseCodePayrollCompaniesLoad: function(houseCode) {
		    var me = this;

			$.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodePayrollCompanys,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id
					+ ",listAssociatedCompanyOnly:true"
					+ ",<criteria>",
 
                success: function(xml) {
		            $(xml).find('item').each(function() {						
		                var payrollCompany = {};
		                payrollCompany.id = $(this).attr("id");
		                payrollCompany.title = $(this).attr("title");
						payrollCompany.salary = ($(this).attr("salary") == "true");
						payrollCompany.hourly = ($(this).attr("hourly") == "true");
						payrollCompany.payFrequencyType = $(this).attr("payFrequencyType");
		                me.houseCodeCache[houseCode].payrollCompanies.push(payrollCompany);
		            });
					
					me.houseCodeStateMinimumWagesLoad(houseCode);
				}
			});
		},

		houseCodeStateMinimumWagesLoad: function(houseCode) {
		    var me = this;

			$.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeStateMinimumWages,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id
					+ ",<criteria>",
 
                success: function(xml) {
		            $(xml).find('item').each(function() {						
		                var stateMinimumWage = {};
		                stateMinimumWage.minimumWage = $(this).attr("minimumWage");
		                me.houseCodeCache[houseCode].stateMinimumWages.push(stateMinimumWage);
		            });
					me.houseCodeCache[houseCode].loaded = true;
					//validate the list of rows
		            me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);
		            me.houseCodeLoading--;
					if (me.houseCodeLoading <= 0 && !me.employeeLoading) $("#pageLoading").fadeOut("slow");
				}
			});
		},

		primaryStateChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(15));				
			var houseCode = me.employees[rowNumber].column1;	
			var payrollCompany = me.getPayrollCompany(houseCode);
	        me.stateCheck(rowNumber, objSelect.value, true);
			me.localTaxCodeCheck(rowNumber, objSelect.value, payrollCompany);
		},
		
		secondaryStateChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(17));			

	        me.stateCheck(rowNumber, objSelect.value, false);
		},
		
		stateCheck: function(rowNumber, state, primary) {
			var me = this;
			 
		    if (me.statesCache[state] != undefined) {
	            if (me.statesCache[state].loaded)
	            	me.stateValidate(state, [rowNumber], primary);
	            else
	                me.statesCache[state].buildQueue.push(rowNumber);
	        }
	        else
	            me.maritalStatusPrimaryTypesLoad(rowNumber, state, primary);
		},
		
		stateValidate: function(state, rowArray, primary) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.statesCache[state].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					if (primary) {
						me.buildSingleDropDown(rowNumber, "MaritalStatusStateTaxTypePrimary", me.statesCache[state].maritalStatusStateTaxTypes);
						me.buildSingleDropDown(rowNumber, "StateAdjustmentType", me.statesCache[state].stateAdjustmentTypes);
						me.buildSingleDropDown(rowNumber, "SDIAdjustmentType", me.statesCache[state].sdiAdjustmentTypes);
						me.buildSingleDropDown(rowNumber, "LocalTaxAdjustmentType", me.statesCache[state].localTaxAdjustmentTypes);
					}
					else {
						me.buildSingleDropDown(rowNumber, "MaritalStatusStateTaxTypeSecondary", me.statesCache[state].maritalStatusStateTaxTypes);
					}				  
		        }
		    }
		},
		
		maritalStatusPrimaryTypesLoad: function(rowNumber, state, primary) {
		    var me = this;

			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
		    me.statesLoading++;

		    me.statesCache[state] = {};
		    me.statesCache[state].valid = false;
		    me.statesCache[state].loaded = false;
		    me.statesCache[state].buildQueue = [];
		    me.statesCache[state].maritalStatusStateTaxTypes = [];
		    me.statesCache[state].stateAdjustmentTypes = [];
			me.statesCache[state].sdiAdjustmentTypes = [];
			me.statesCache[state].localTaxAdjustmentTypes = [];
			me.statesCache[state].localTaxCodes = [];
		    me.statesCache[state].buildQueue.push(rowNumber);

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:maritalStatusPrimaryTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {

	                $(xml).find('item').each(function() {
	                    var maritalStatusStateTaxType = {};
	                	maritalStatusStateTaxType.id = $(this).attr("id");
	                	maritalStatusStateTaxType.name = $(this).attr("name");
	                	me.statesCache[state].maritalStatusStateTaxTypes.push(maritalStatusStateTaxType);
	                });
					
					me.stateAdjustmentTypesLoad(rowNumber, state, primary);
				}
			});			
		},
		
		stateAdjustmentTypesLoad: function(rowNumber, state, primary) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:stateAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
  
	                $(xml).find('item').each(function() {
	                    var stateAdjustmentType = {};
	                	stateAdjustmentType.id = $(this).attr("id");
	                	stateAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].stateAdjustmentTypes.push(stateAdjustmentType);
	                });
					
					me.sdiAdjustmentTypesLoad(rowNumber, state, primary);
				}
			});			
		},
		
		sdiAdjustmentTypesLoad: function(rowNumber, state, primary) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:sdiAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
  
	                $(xml).find('item').each(function() {
	                    var sdiAdjustmentType = {};
	                	sdiAdjustmentType.id = $(this).attr("id");
	                	sdiAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].sdiAdjustmentTypes.push(sdiAdjustmentType);
	                });
					
					me.localTaxAdjustmentTypesLoad(rowNumber, state, primary);
				}
			});			
		},
		
		localTaxAdjustmentTypesLoad: function(rowNumber, state, primary) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:localTaxAdjustmentTypes,userId:[user],"
                    + "appState:" + state + ",<criteria>",
 
                success: function(xml) {
  
	                $(xml).find('item').each(function() {
	                    var localTaxAdjustmentType = {};
	                	localTaxAdjustmentType.id = $(this).attr("id");
	                	localTaxAdjustmentType.name = $(this).attr("name");
	                	me.statesCache[state].localTaxAdjustmentTypes.push(localTaxAdjustmentType);
	                });
					
					me.statesLoading--;
					me.statesCache[state].valid = true;
					me.statesCache[state].loaded = true;
					me.stateValidate(state, me.statesCache[state].buildQueue, primary);
					if (me.statesLoading <= 0 && !me.employeeLoading) {
						me.setStatus("Loaded");
						$("#pageLoading").fadeOut("slow");
					}
				}
			});
		},
		
		localTaxCodeCheck: function(rowNumber, state, payrollCompany) {
			var me = this;

			if (me.localTaxCodesCache[state + "," + payrollCompany] != undefined) {
			 	if (me.localTaxCodesCache[state + "," + payrollCompany].loaded)
	            	me.localTaxCodeValidate(state, payrollCompany, [rowNumber]);
	            else
	                me.localTaxCodesCache[state + "," + payrollCompany].buildQueue.push(rowNumber);
	        }
	        else
				me.localTaxCodesLoad(rowNumber, state, payrollCompany);
		},
		
		localTaxCodeValidate: function(state, payrollCompany, rowArray) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.localTaxCodesCache[state + "," + payrollCompany].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "LocalTaxCode1", me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes);
					me.buildSingleDropDown(rowNumber, "LocalTaxCode2", me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes);
					me.buildSingleDropDown(rowNumber, "LocalTaxCode3", me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes);
		        }
		    }
		},

		localTaxCodesLoad: function(rowNumber, state, payrollCompany) {
		    var me = this;

			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
		    me.localTaxCodesLoading++;

		    me.localTaxCodesCache[state + "," + payrollCompany] = {};
		    me.localTaxCodesCache[state + "," + payrollCompany].valid = false;
		    me.localTaxCodesCache[state + "," + payrollCompany].loaded = false;
		    me.localTaxCodesCache[state + "," + payrollCompany].buildQueue = [];		   
			me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes = [];
		    me.localTaxCodesCache[state + "," + payrollCompany].buildQueue.push(rowNumber);

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:localTaxCodePayrollCompanyStates,userId:[user]"
					+ ",payrollCompany:" + payrollCompany
                    + ",appState:" + state + ",<criteria>",
 
                 success: function(xml) {
  
	                $(xml).find('item').each(function() {
	                    var localTaxCode = {};
	                	localTaxCode.id = $(this).attr("id");
	                	localTaxCode.name = $(this).attr("name");
	                	me.localTaxCodesCache[state + "," + payrollCompany].localTaxCodes.push(localTaxCode);
	                });

					me.localTaxCodesLoading--;
					me.localTaxCodesCache[state + "," + payrollCompany].valid = true;
					me.localTaxCodesCache[state + "," + payrollCompany].loaded = true;
					me.localTaxCodeValidate(state, payrollCompany, me.localTaxCodesCache[state + "," + payrollCompany].buildQueue);
					if (me.localTaxCodesLoading <= 0 && !me.employeeLoading) {
						me.setStatus("Loaded");
						$("#pageLoading").fadeOut("slow");
					}
				}
			});
		},
		
		ethnicityTypeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(16));
			var disabled = true;

			if ($("#selEthnicityType" + rowNumber + " option:selected").text() == "Two or more races") {
				disabled = false;
			}

			$("#selMultiRace1" + rowNumber).val("0");
			$("#selMultiRace2" + rowNumber).val("0");
			$("#selMultiRace3" + rowNumber).val("0");
			$("#selMultiRace4" + rowNumber).val("0");
			$("#selMultiRace5" + rowNumber).val("0");
			$("#selMultiRace1" + rowNumber).attr("disabled", disabled);
			$("#selMultiRace2" + rowNumber).attr("disabled", disabled);
			$("#selMultiRace3" + rowNumber).attr("disabled", disabled);
			$("#selMultiRace4" + rowNumber).attr("disabled", disabled);
			$("#selMultiRace5" + rowNumber).attr("disabled", disabled);
		},
		
		buildDropDown: function(controlName, types) {
		    var me = this;
			var type = {};
		    var selType = null;
			var options = "";
	
		    for(var index = 0; index < types.length; index++) {
				type = types[index];
		        options += "<option  title='" + type.name + "' value='" + type.id + "'>" + type.name + "</option>\n";
		    }
				
			for (var index = 0; index < me.employees.length; index++) {
				selType = $("#sel" + controlName + index);
				selType.append(options);
			}
		},
		
		buildSingleDropDown: function(rowNumber, controlName, types) {
		    var me = this;
		    var type = {};
		    var selType = $("#sel" + controlName + rowNumber);

			selType.empty();
			selType.append("<option value='0'></option>");

		    for(var index = 0; index < types.length; index++) {
		        type = types[index];
		        selType.append("<option  title='" + type.name + "' value='" + type.id + "'>" + type.name + "</option>");
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
			
			setTimeout(function() { 
				me.validate(); 
			}, 100);			
		},
		
		validate: function() {
			var me = this;			
			var valid = true;
			var rowValid = true;			
			var briefs = "";
			var houseCodes = "";
			var ssnNumbers = "";
			
			for (var index = 0; index < me.employees.length; index++) {
				rowValid = true;
				houseCodes += $("#txtHouseCode" + index).val() + "|";
				briefs += $("#txtBrief" + index).val() + "|";
				
				if ($("#txtSSN" + index).val() != "")
					ssnNumbers += $("#txtSSN" + index).val() + "|";
					
				if (!(/^[0-9]+$/.test($("#txtHouseCode" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtHouseCode" + index), me.cellColorInvalid, "Please enter valid House Code.");
				}
				else {
					me.setCellColor($("#txtHouseCode" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBrief" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtBrief" + index), me.cellColorInvalid, "Please enter valid Brief.");
				}
				else {
					me.setCellColor($("#txtBrief" + index), me.cellColorValid, "");
				}				
				
				if ($("#txtFirstName" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtFirstName" + index), me.cellColorInvalid, "Please enter valid First Name.");
				}
				else {
					me.setCellColor($("#txtFirstName" + index), me.cellColorValid, "");
				}
				
				if ($("#txtLastName" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtLastName" + index), me.cellColorInvalid, "Please enter valid Last Name.");
				}
				else {
					me.setCellColor($("#txtLastName" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAddress1" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtAddress1" + index), me.cellColorInvalid, "Please enter valid Address1.");
				}
				else {
					me.setCellColor($("#txtAddress1" + index), me.cellColorValid, "");
				}
				
				if ($("#txtCity" + index).val() == "") {
					rowValid = false;
					me.setCellColor($("#txtCity" + index), me.cellColorInvalid, "Please enter valid City.");
				}
				else {
					me.setCellColor($("#txtCity" + index), me.cellColorValid, "");
				}
				
				if ($("#selState" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selState" + index), me.cellColorInvalid, "Please select valid State.");
				}
				else {
					me.setCellColor($("#selState" + index), me.cellColorValid, "");
				}
				
				if (!(ui.cmn.text.validate.postalCode($("#txtPostalCode" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtPostalCode" + index), me.cellColorInvalid, "Please enter valid Postal Code.");
				}
				else {
					me.setCellColor($("#txtPostalCode" + index), me.cellColorValid, "");
				}				
				
				if ($("#txtHomePhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtHomePhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtHomePhone" + index), me.cellColorInvalid, "Please enter valid Home Phone Number.");
				}
				else {
					me.setCellColor($("#txtHomePhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtFax" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtFax" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtFax" + index), me.cellColorInvalid, "Please enter valid Fax Number.");
				}
				else {
					me.setCellColor($("#txtFax" + index), me.cellColorValid, "");
				}
				
				if ($("#txtCellPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtCellPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtCellPhone" + index), me.cellColorInvalid, "Please enter valid Cell Phone Number.");
				}
				else {
					me.setCellColor($("#txtCellPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtEmail" + index).val() != "" && !(ui.cmn.text.validate.emailAddress($("#txtEmail" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtEmail" + index), me.cellColorInvalid, "Please enter valid Email Id.");
				}
				else {
					me.setCellColor($("#txtEmail" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPager" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtPager" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtPager" + index), me.cellColorInvalid, "Please enter valid Pager Number.");
				}
				else {
					me.setCellColor($("#txtPager" + index), me.cellColorValid, "");
				}

				if (!(/^(?!000)^([0-8]\d{2})([ -]?)((?!00)\d{2})([ -]?)((?!0000)\d{4})$/.test($("#txtSSN" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtSSN" + index), me.cellColorInvalid, "Please enter valid Social Security Number. Example: 001-01-0001, 899-99-9999.");
				}
				else {
					me.setCellColor($("#txtSSN" + index), me.cellColorValid, "");
				}		
				
				if ($("#selJobCodeType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selJobCodeType" + index), me.cellColorInvalid, "Please select valid Job Code.");
				}
				else {
					me.setCellColor($("#selJobCodeType" + index), me.cellColorValid, "");
				}
				
				if (ui.cmn.text.validate.generic($("#txtHireDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtHireDate" + index), me.cellColorInvalid, "Please enter valid Hire Date.");
				}
				else {
					me.setCellColor($("#txtHireDate" + index), me.cellColorValid, "");
				}

				if ($("#txtSeniorityDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtSeniorityDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtSeniorityDate" + index), me.cellColorInvalid, "Please enter valid Seniority Date.");
				}
				else {
					me.setCellColor($("#txtSeniorityDate" + index), me.cellColorValid, "");
				}

				if (($("#txtScheduledHours" + index).val() == "") || ($("#txtScheduledHours" + index).val() != "" && !(/^[0-9]+$/.test($("#txtScheduledHours" + index).val())))) {
					rowValid = false;
					me.setCellColor($("#txtScheduledHours" + index), me.cellColorInvalid, "Please enter valid Scheduled Hours.");
				}
				else {
					me.setCellColor($("#txtScheduledHours" + index), me.cellColorValid, "");
				}

				if ($("#txtScheduledHours" + index).val() != "") {
					var houseCode = $("#txtHouseCode" + index).val();
					var scheduledHours = parseInt($("#txtScheduledHours" + index).val(), 10);
					var frequencyType = "";
					
					for (var rowNumber = 0; rowNumber < me.houseCodeCache[houseCode].payrollCompanies.length; rowNumber++) {
						if (me.houseCodeCache[houseCode].payrollCompanies[rowNumber].hourly) {
							frequencyType = me.houseCodeCache[houseCode].payrollCompanies[rowNumber].payFrequencyType;
							break;
						}
					}

					if (frequencyType == "Weekly") {
						if (scheduledHours > 40) {
							rowValid = false;
							me.setCellColor($("#txtScheduledHours" + index), me.cellColorInvalid, "Scheduled Hours should not be greater than 40 hours for the Weekly Pay Frequency.");
						}
						else if (scheduledHours < 30) {
							var message = "Warning: Individual will work less than 30 hours a week and therefore not eligible for full-time benefits. " 
								+ "The employee will be categorized as PART-TIME due to hours per week being less than 30. "
								+ "Minimum eligible hours: 30";
							me.setCellColor($("#txtScheduledHours" + index), "yellow", message);
						}
					}
					else if (frequencyType == "Bi-Weekly") {
						if (scheduledHours > 80) {
							rowValid = false;
							me.setCellColor($("#txtScheduledHours" + index), me.cellColorInvalid, "Scheduled Hours should not be greater than 80 hours for the Bi-Weekly Pay Frequency.");
						}
						else if (scheduledHours < 60) {
							var message = "Warning: Individual will work less than 30 hours a week and therefore not eligible for full-time benefits. " 
								+ "The employee will be categorized as PART-TIME due to hours per week being less than 30. "
								+ "Minimum eligible hours: 60";
							me.setCellColor($("#txtScheduledHours" + index), "yellow", message);
						}
					}
				}

				if ($("#txtAlternatePayRateA" + index).val() != "" && !(ui.cmn.text.validate.generic($("#txtAlternatePayRateA" + index).val(), "^\\d+(\\.\\d{1,2})?$"))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateA" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate A.");
				}
				else if ($("#txtAlternatePayRateA" + index).val() != "" && parseFloat($("#txtAlternatePayRateA" + index).val()) > 99.99) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateA" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Max value for Hourly is 99.99");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateA" + index), me.cellColorValid, "");
				}

				if ($("#txtAlternatePayRateB" + index).val() != "" && !(ui.cmn.text.validate.generic($("#txtAlternatePayRateB" + index).val(), "^\\d+(\\.\\d{1,2})?$"))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateB" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate B.");
				}
				else if ($("#txtAlternatePayRateB" + index).val() != "" && parseFloat($("#txtAlternatePayRateB" + index).val()) > 99.99) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateB" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Max value for Hourly is 99.99");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateB" + index), me.cellColorValid, "");
				}

				if ($("#txtAlternatePayRateC" + index).val() != "" && !(ui.cmn.text.validate.generic($("#txtAlternatePayRateC" + index).val(), "^\\d+(\\.\\d{1,2})?$"))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateC" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate C.");
				}
				else if ($("#txtAlternatePayRateC" + index).val() != "" && parseFloat($("#txtAlternatePayRateC" + index).val()) > 99.99) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateC" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Max value for Hourly is 99.99");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateC" + index), me.cellColorValid, "");
				}

				if ($("#txtAlternatePayRateD" + index).val() != "" && !(ui.cmn.text.validate.generic($("#txtAlternatePayRateD" + index).val(), "^\\d+(\\.\\d{1,2})?$"))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateD" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate D.");
				}
				else if ($("#txtAlternatePayRateD" + index).val() != "" && parseFloat($("#txtAlternatePayRateD" + index).val()) > 99.99) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateD" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Max value for Hourly is 99.99");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateD" + index), me.cellColorValid, "");
				}

				if ($("#txtOriginalHireDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtOriginalHireDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtOriginalHireDate" + index), me.cellColorInvalid, "Please enter valid Original Hire Date.");
				}
				else {
					me.setCellColor($("#txtOriginalHireDate" + index), me.cellColorValid, "");
				}

				if ($("#chkUnion" + index)[0].checked) {
					if ($("#selUnionType" + index).val() == "0") {
						rowValid = false;
						me.setCellColor($("#selUnionType" + index), me.cellColorInvalid, "Please select valid Union Type.");
					}
					else {
						me.setCellColor($("#selUnionType" + index), me.cellColorValid, "");
					}
				}
				else if ($("#chkUnion" + index)[0].checked == false) {
					if ($("#selUnionType" + index).val() != "0") {
						rowValid = false;
						me.setCellColor($("#selUnionType" + index), me.cellColorInvalid, "Union Type should be blank.");
					}
					else {
						me.setCellColor($("#selUnionType" + index), me.cellColorValid, "");
					}
				}

				if (!(ui.cmn.text.validate.generic($("#txtPayRate" + index).val(), "^\\d+(\\.\\d{1,2})?$"))) {
					rowValid = false;
					me.setCellColor($("#txtPayRate" + index), me.cellColorInvalid, "Please enter valid Pay Rate.");
				}
				else if (parseFloat($("#txtPayRate" + index).val()) > 99.99) {
					rowValid = false;
					me.setCellColor($("#txtPayRate" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Max value for Hourly is 99.99");
				}
				else {
					var houseCode = $("#txtHouseCode" + index).val();
					var stateMinimumWage = 0;

					if (me.houseCodeCache[houseCode].stateMinimumWages.length > 0)
						stateMinimumWage = parseFloat(me.houseCodeCache[houseCode].stateMinimumWages[0].minimumWage);

					if (stateMinimumWage > 0 && parseFloat($("#txtPayRate" + index).val()) < stateMinimumWage) {
						rowValid = false;
						me.setCellColor($("#txtPayRate" + index), me.cellColorInvalid, "Please enter valid Pay Rate. Minimum Wage for the House Code State is: " + stateMinimumWage);
					}
					else {
						me.setCellColor($("#txtPayRate" + index), me.cellColorValid, "");
					}
				}

				if ($("#selGenderType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selGenderType" + index), me.cellColorInvalid, "Please select valid Gender Type.");
				}
				else {
					me.setCellColor($("#selGenderType" + index), me.cellColorValid, "");
				}
				
				if ($("#selEthnicityType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selEthnicityType" + index), me.cellColorInvalid, "Please select valid Ethnicity Type.");
				}
				else {
					me.setCellColor($("#selEthnicityType" + index), me.cellColorValid, "");
				}
				
				if (ui.cmn.text.validate.generic($("#txtBirthDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtBirthDate" + index), me.cellColorInvalid, "Please enter valid Birth Date.");
				}
				else {
					var today = new Date(parent.fin.appUI.glbCurrentDate);
					var birthDate = new Date($("#txtBirthDate" + index).val());
					var millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.26;

					if (((today - birthDate) / millisecondsPerYear) < 18)
						me.setCellColor($("#txtBirthDate" + index), "yellow", "Employee age is under 18 years.");
					else	
						me.setCellColor($("#txtBirthDate" + index), me.cellColorValid, "");
				}

				if ($("#txtBackGroundCheckDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtBackGroundCheckDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtBackGroundCheckDate" + index), me.cellColorInvalid, "Please enter valid Background Check Date.");
				}
				else {
					me.setCellColor($("#txtBackGroundCheckDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtFederalExemptions" + index).val() != "" && !(/^[0-9]+$/.test($("#txtFederalExemptions" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtFederalExemptions" + index), me.cellColorInvalid, "Please enter valid Federal Exemptions.");
				}
				else {
					me.setCellColor($("#txtFederalExemptions" + index), me.cellColorValid, "");
				}
				
				if ($("#selMaritalStatusFederalTaxType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selMaritalStatusFederalTaxType" + index), me.cellColorInvalid, "Please select valid Marital Status FederalTax Type.");
				}
				else {
					me.setCellColor($("#selMaritalStatusFederalTaxType" + index), me.cellColorValid, "");
				}
				
				if ($("#txtFederalAdjustmentAmount" + index).val() != "" && ui.cmn.text.validate.generic($("#txtFederalAdjustmentAmount" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtFederalAdjustmentAmount" + index), me.cellColorInvalid, "Please enter valid Federal Adjustment Amount.");
				}
				else {
					me.setCellColor($("#txtFederalAdjustmentAmount" + index), me.cellColorValid, "");
				}
				
				if ($("#selPrimaryState" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selPrimaryState" + index), me.cellColorInvalid, "Please select valid Primary State.");
				}
				else {
					me.setCellColor($("#selPrimaryState" + index), me.cellColorValid, "");
				}
				
				if ($("#selMaritalStatusStateTaxTypePrimary" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selMaritalStatusStateTaxTypePrimary" + index), me.cellColorInvalid, "Please select valid Marital Status State Tax Type Primary.");
				}
				else {
					me.setCellColor($("#selMaritalStatusStateTaxTypePrimary" + index), me.cellColorValid, "");
				}
				
				if ($("#txtStateExemptions" + index).val() != "" && !(/^[0-9]+$/.test($("#txtStateExemptions" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtStateExemptions" + index), me.cellColorInvalid, "Please enter valid State Exemptions.");
				}
				else {
					me.setCellColor($("#txtStateExemptions" + index), me.cellColorValid, "");
				}
				
				if ($("#txtStateAdjustmentAmount" + index).val() != "" && ui.cmn.text.validate.generic($("#txtStateAdjustmentAmount" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtStateAdjustmentAmount" + index), me.cellColorInvalid, "Please enter valid State Adjustment Amount.");
				}
				else {
					me.setCellColor($("#txtStateAdjustmentAmount" + index), me.cellColorValid, "");
				}
				
				if ($("#txtSDIRate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtSDIRate" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtSDIRate" + index), me.cellColorInvalid, "Please enter valid SDI Rate.");
				}
				else {
					me.setCellColor($("#txtSDIRate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtLocalTaxAdjustmentAmount" + index).val() != "" && ui.cmn.text.validate.generic($("#txtLocalTaxAdjustmentAmount" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtLocalTaxAdjustmentAmount" + index), me.cellColorInvalid, "Please enter valid Local Tax Adjustment Amount.");
				}
				else {
					me.setCellColor($("#txtLocalTaxAdjustmentAmount" + index), me.cellColorValid, "");
				}

				if ($("#selMaritalStatusType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selMaritalStatusType" + index), me.cellColorInvalid, "Please select valid Marital Status Type.");
				}
				else {
					me.setCellColor($("#selMaritalStatusType" + index), me.cellColorValid, "");
				}

				if ($("#selEthnicityType" + index + " option:selected").text() == "Two or more races") {
					if ($("#selMultiRace1" + index).val() == "0") {
						rowValid = false;
						me.setCellColor($("#selMultiRace1" + index), me.cellColorInvalid, "Please select valid Race 1.");
					}
					else {
						me.setCellColor($("#selMultiRace1" + index), me.cellColorValid, "");
					}

					if ($("#selMultiRace2" + index).val() == "0") {
						rowValid = false;
						me.setCellColor($("#selMultiRace2" + index), me.cellColorInvalid, "Please select valid Race 2.");
					}
					else {
						me.setCellColor($("#selMultiRace2" + index), me.cellColorValid, "");
					}
				}
				else {
					me.setCellColor($("#selMultiRace1" + index), me.cellColorValid, "");
					me.setCellColor($("#selMultiRace2" + index), me.cellColorValid, "");
				}

				if ($("#selDisabilityType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selDisabilityType" + index), me.cellColorInvalid, "Please select valid Disability.");
				}
				else {
					me.setCellColor($("#selDisabilityType" + index), me.cellColorValid, "");
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}
			
			for (var index = 0; index < me.employees.length; index++) {
				for (var indexI = index + 1; indexI < me.employees.length; indexI++) {
					if ($("#txtBrief" + index).val() == $("#txtBrief" + indexI).val()) {
						rowValid = false;
						me.setCellColor($("#txtBrief" + indexI), me.cellColorInvalid, "Duplicate Brief is not allowed.");
					}
				}

				for (var indexI = index + 1; indexI < me.employees.length; indexI++) {
					if ($("#txtSSN" + index).val() == $("#txtSSN" + indexI).val()) {
						rowValid = false;
						me.setCellColor($("#txtSSN" + indexI), me.cellColorInvalid, "Duplicate SSN is not allowed.");
					}
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}
			
			// If all required fields are entered correctly then validate the House Codes, Briefs, SSN Numbers and Employee Numbers
			if (valid) {
				me.setStatus("Validating");
				$("#messageToUser").text("Validating");
				$("#pageLoading").fadeIn("slow");
			
				me.bulkImportValidationStore.reset();
				me.bulkImportValidationStore.fetch("userId:[user]"
					+ ",houseCodes:" + houseCodes
					+ ",briefs:" + briefs
					+ ",ssnNumbers:" + ssnNumbers
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

			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");

			if (me.bulkImportValidations.length > 0) {				
				
				var houseCodes = me.bulkImportValidations[0].houseCodes.split('|');
				var briefs = me.bulkImportValidations[0].briefs.split('|');
				var ssnNumbers = me.bulkImportValidations[0].ssnNumbers.split('|');
				
				for (var rowIndex = 0; rowIndex < me.employees.length; rowIndex++) {
					for(var index = 0; index < houseCodes.length - 1; index++) {
						if ($("#txtHouseCode" + rowIndex).val() == houseCodes[index]) {
							$("#txtHouseCode" + rowIndex).attr("title", "House Code doesn't exists.");
							$("#txtHouseCode" + rowIndex).css("background-color", me.cellColorInvalid);							
						}							
					}
					
					for(var index = 0; index < briefs.length - 1; index++) {
						if ($("#txtBrief" + rowIndex).val() == briefs[index]) {
							$("#txtBrief" + rowIndex).attr("title", "Brief already exists.");
							$("#txtBrief" + rowIndex).css("background-color", me.cellColorInvalid);							
						}
					}

					for(var index = 0; index < ssnNumbers.length - 1; index++) {
						if ($("#txtSSN" + rowIndex).val() == ssnNumbers[index]) {
							$("#txtSSN" + rowIndex).attr("title", "SSN already exists.");
							$("#txtSSN" + rowIndex).css("background-color", me.cellColorInvalid);							
						}							
					}
				}

				$("#AnchorSave").hide();
				alert("In order to save, the errors on the page must be corrected.");
			}
			else {
				if (me.actionSave)
					me.actionSaveItem();
				else
					$("#AnchorSave").show();
			}
		},

		actionSaveEmployees: function() {
			var me = this;			

			if (confirm("Employees will be saved, Click OK to Continue, or Cancel"))
				me.actionSaveItem();
		},
		
		actionSaveItem: function() {
			var me = this;
			var item = [];
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");
			
			var xml = me.saveXmlBuildEmployee(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},
		
		saveXmlBuildEmployee: function() {
			var args = ii.args(arguments, {
				item: { type: [fin.emp.employeeImport.Employee] }
			});
			var me = this;
			var xml = "";
			
			for (var index = 0; index < me.employees.length; index++) {
								
				xml += '<employeeGeneralImport';
				xml += ' id="0"';
				xml += ' houseCode="' + $("#txtHouseCode" + index).val() + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode($("#txtBrief" + index).val()) + '"';
				xml += ' firstName="' + ui.cmn.text.xml.encode($("#txtFirstName" + index).val()) + '"';
				xml += ' lastName="' + ui.cmn.text.xml.encode($("#txtLastName" + index).val()) + '"';
				xml += ' middleName="' + ui.cmn.text.xml.encode($("#txtMiddleName" + index).val()) + '"';
				xml += ' address1="' + ui.cmn.text.xml.encode($("#txtAddress1" + index).val()) + '"';
				xml += ' address2="' + ui.cmn.text.xml.encode($("#txtAddress2" + index).val()) + '"';
				xml += ' city="' + ui.cmn.text.xml.encode($("#txtCity" + index).val()) + '"';
				xml += ' state="' + $("#selState" + index).val() + '"';
				xml += ' postalCode="' + $("#txtPostalCode" + index).val() + '"';
				xml += ' homePhone="' + fin.cmn.text.mask.phone($("#txtHomePhone" + index).val(), true) + '"';
				xml += ' fax="' + fin.cmn.text.mask.phone($("#txtFax" + index).val(), true) + '"';
				xml += ' cellPhone="' + fin.cmn.text.mask.phone($("#txtCellPhone" + index).val(), true) + '"';
				xml += ' email="' + ui.cmn.text.xml.encode($("#txtEmail" + index).val()) + '"';
				xml += ' pager="' + fin.cmn.text.mask.phone($("#txtPager" + index).val(), true) + '"';
				xml += ' ssn="' + $("#txtSSN" + index).val().replace(/[- ]/g, '') + '"'; 
				xml += ' jobCodeType="' + $("#selJobCodeType" + index).val() + '"';
				xml += ' hireDate="' + $("#txtHireDate" + index).val() + '"';
				xml += ' seniorityDate="' + $("#txtSeniorityDate" + index).val() + '"';
				xml += ' scheduledHours="' + $("#txtScheduledHours" + index).val() + '"';
				xml += ' union="' + $("#chkUnion" + index)[0].checked + '"';
				xml += ' alternatePayRateA="' + $("#txtAlternatePayRateA" + index).val() + '"';
				xml += ' alternatePayRateB="' + $("#txtAlternatePayRateB" + index).val() + '"';
				xml += ' alternatePayRateC="' + $("#txtAlternatePayRateC" + index).val() + '"';
				xml += ' alternatePayRateD="' + $("#txtAlternatePayRateD" + index).val() + '"';
				xml += ' originalHireDate="' + $("#txtOriginalHireDate" + index).val() + '"';
				xml += ' unionType="' + $("#selUnionType" + index).val() + '"';
				xml += ' payRate="' + $("#txtPayRate" + index).val() + '"';
				xml += ' genderType="' + $("#selGenderType" + index).val() + '"';
				xml += ' ethnicityType="' + $("#selEthnicityType" + index).val() + '"';
				xml += ' birthDate="' + $("#txtBirthDate" + index).val() + '"';
				xml += ' backGroundCheckDate="' + $("#txtBackGroundCheckDate" + index).val() + '"';
				xml += ' federalExemptions="' + $("#txtFederalExemptions" + index).val() + '"';
				xml += ' federalAdjustmentType="' + $("#selFederalAdjustmentType" + index).val() + '"';
				xml += ' maritalStatusFederalTaxType="' + $("#selMaritalStatusFederalTaxType" + index).val() + '"';
				xml += ' federalAdjustmentAmount="' + $("#txtFederalAdjustmentAmount" + index).val() + '"';
				xml += ' primaryState="' + $("#selPrimaryState" + index).val() + '"';
				xml += ' secondaryState="' + $("#selSecondaryState" + index).val() + '"';
				xml += ' maritalStatusStateTaxTypePrimary="' + $("#selMaritalStatusStateTaxTypePrimary" + index).val() + '"';
				xml += ' maritalStatusStateTaxTypeSecondary="' + ($("#selMaritalStatusStateTaxTypeSecondary" + index).val() == null ? 0 : $("#selMaritalStatusStateTaxTypeSecondary" + index).val()) + '"';
				xml += ' stateExemptions="' + $("#txtStateExemptions" + index).val() + '"';
				xml += ' stateAdjustmentType="' + $("#selStateAdjustmentType" + index).val() + '"';
				xml += ' stateAdjustmentAmount="' + $("#txtStateAdjustmentAmount" + index).val() + '"';
				xml += ' sdiAdjustmentType="' + $("#selSDIAdjustmentType" + index).val() + '"';
				xml += ' sdiRate="' + $("#txtSDIRate" + index).val() + '"';
				xml += ' localTaxAdjustmentType="' + $("#selLocalTaxAdjustmentType" + index).val() + '"';
				xml += ' localTaxAdjustmentAmount="' + $("#txtLocalTaxAdjustmentAmount" + index).val() + '"';
				xml += ' localTaxCode1="' + $("#selLocalTaxCode1" + index).val() + '"';
				xml += ' localTaxCode2="' + $("#selLocalTaxCode2" + index).val() + '"';
				xml += ' localTaxCode3="' + $("#selLocalTaxCode3" + index).val() + '"';
				xml += ' i9Type="' + $("#selI9Type" + index).val() + '"';
				xml += ' vetType="' + $("#selVetType" + index).val() + '"';
				xml += ' maritalStatusType="' + $("#selMaritalStatusType" + index).val() + '"';
				xml += ' basicLifeIndicatorType="' + $("#selBasicLifeIndicatorType" + index).val() + '"';
				xml += ' multiRace1="' + $("#selMultiRace1" + index).val() + '"';
				xml += ' multiRace2="' + $("#selMultiRace2" + index).val() + '"';
				xml += ' multiRace3="' + $("#selMultiRace3" + index).val() + '"';
				xml += ' multiRace4="' + $("#selMultiRace4" + index).val() + '"';
				xml += ' multiRace5="' + $("#selMultiRace5" + index).val() + '"';
				xml += ' disabilityType="' + $("#selDisabilityType" + index).val() + '"';
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
				
				$("#AnchorValidate").hide();
				$("#AnchorSave").hide();
				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Employee details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		},
		
		actionImportSave: function() {
			var me = this;
			var item = [];

			me.setStatus("Importing");
			$("#messageToUser").text("Importing");
			$("#pageLoading").fadeIn("slow");
			
			var xml = '<appGenericImport';
				xml += ' fileName="' + me.fileName + '"';
				xml += ' object="Employee"';
				xml += ' minimumRecords="' + me.minimumRecords + '"';
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
							me.employeeCountLoad();
							break;
					}
				});
			}
			else if (status == "invalid") {
				me.setStatus("Info", "Minimum " + me.minimumRecords + " records should be available in excel sheet for employee import. Please verify.");
                alert("Minimum " + me.minimumRecords + " records should be available in excel sheet for employee import. Please verify.");
				$("#pageLoading").fadeOut("slow");
            }
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while importing Employee details: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		}
	}
});

function onFileChange() {
	var me = fin.emp.employeeImportUI;
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));
	
	if (fileExtension == ".xlsx")
		me.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {
	fin.emp.employeeImportUI = new fin.emp.employeeImport.UserInterface();
	fin.emp.employeeImportUI.resize();
}
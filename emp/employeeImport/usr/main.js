ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
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
			me.statusTypesCache = [];
			me.terminationReasonTypesCache = [];
			me.localTaxCodesCache = [];
			me.houseCodeLoading = 0;
			me.statesLoading = 0;
			me.statusTypesLoading = 0;
			me.terminationReasonTypesLoading = 0;
			me.localTaxCodesLoading = 0;
			me.employeeLoading = false;
			me.batchId = 0;

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
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);

			me.statusTypeStore.fetch("userId:[user],personId:0", me.statusTypesLoaded, me);
			me.payFrequencyTypeStore.fetch("userId:[user]", me.payFrequencyTypesLoaded, me);
			me.federalAdjustmentStore.fetch("userId:[user]", me.federalAdjustmentsLoaded, me);
			me.stateStore.fetch("userId:[user]", me.statesLoaded, me);
			me.modified(false);
			
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
		},

		authorizationProcess: function fin_emp_employeeImport_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
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
			var divGridHeight = $(window).height() - 180;

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
		},
		
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;

			parent.fin.appUI.modified = args.modified;
		},
		
		statusTypesLoaded: function(me, activeId) {
						
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 2, name: "Female" }));
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 1, name: "Male" }));
			me.genderTypes.unshift(new fin.emp.employeeImport.GenderType({ id: 0, name: "" }));
			
			me.statusTypes.unshift(new fin.emp.employeeImport.StatusType({ id: 0, name: "" }));
			me.workShifts.unshift(new fin.emp.employeeImport.WorkShift({ id: 0, name: "" }));
			me.jobCodeTypes.unshift(new fin.emp.employeeImport.JobCodeType({ id: 0, name: "" }));
			me.deviceGroupTypes.unshift(new fin.emp.employeeImport.DeviceGroupType({ id: 0, name: "" }));
			me.rateChangeReasons.unshift(new fin.emp.employeeImport.RateChangeReasonType({ id: 0, name: "" }));
			me.terminationReasons.unshift(new fin.emp.employeeImport.TerminationReasonType({ id: 0, name: "" }));
			me.ethnicityTypes.unshift(new fin.emp.employeeImport.EthnicityType({ id: 0, name: "" }));
			me.unionTypes.unshift(new fin.emp.employeeImport.UnionType({ id: 0, name: "" }));
			me.i9Types.unshift(new fin.emp.employeeImport.I9Type({ id: 0, name: "" }));
			me.vetTypes.unshift(new fin.emp.employeeImport.VetType({ id: 0, name: "" }));			
			me.maritalStatusTypes.unshift(new fin.emp.employeeImport.MaritalStatusType({ id: 0, name: "" }));
			me.jobStartReasonTypes.unshift(new fin.emp.employeeImport.JobStartReasonType({ id: 0, name: "" }));
		},
		
		payFrequencyTypesLoaded: function(me, activeId) {
						
		},
		
		federalAdjustmentsLoaded: function(me, activeId) {			
			
			me.federalAdjustments.unshift(new fin.emp.employeeImport.FederalAdjustment({ id: 0, name: "" }));
			me.maritalStatusFederalTaxTypes.unshift(new fin.emp.employeeImport.MaritalStatusFederalTaxType({ id: 0, name: "" }));
		},
	
		statesLoaded: function(me, activeId) {
			
			me.states.unshift(new fin.emp.employeeImport.State({ id: 0, name: "" }));
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
		    		        
		    $("#messageToUser").text("Loading");
			$("#pageLoading").show();				
			$("#selPageNumber").val(me.pageCurrent);

			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;		
			me.employeeStore.fetch("userId:[user],batch:" + me.batchId + ",object:Employee,startPoint:" + me.startPoint + ",maximumRows:" + me.maximumRows, me.employeesLoaded, me);
		},
		
		employeeCountLoad: function() {
		    var me = this;
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
				    
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
		},
		
		actionCancelItem: function() {
			var me = this;

			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);			
		},
		
		actionUploadItem: function() {
			var me = this;

			me.fileName = "";
			
			$("#messageToUser").text("Uploading");
			$("#pageLoading").show();
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (me.fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						$("#pageLoading").hide();
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

			for(var index = 0; index < me.employees.length; index++) {					
				//create the row for the employee information
				employeeRow = employeeRowTemplate;
				employeeRow = employeeRow.replace(/RowCount/g, index);
				employeeRow = employeeRow.replace("#", index + 1);
				
				$("#EmployeeGridBody").append(employeeRow);
						
				me.houseCodeCheck(index, me.employees[index].column1);
				
				idIndex = me.findIndexByTitle(me.employees[index].column19, me.statusTypes);
				if (idIndex != undefined) {
					me.statusTypeCheck(index, me.statusTypes[idIndex].id);
				}

				idIndex = me.findIndexByTitle(me.employees[index].column30, me.terminationReasons);
				if (idIndex != undefined) {
					me.terminationReasonTypeCheck(index, me.terminationReasons[idIndex].id);
				}

				idIndex = me.findIndexByTitle(me.employees[index].column67, me.states);
				if (idIndex != undefined) {
					me.stateCheck(index,  me.states[idIndex].id, true);
				}
				
				idIndex = me.findIndexByTitle(me.employees[index].column68, me.states);
				if (idIndex != undefined) {
					me.stateCheck(index,  me.states[idIndex].id, false);
				}

				$("#txtHouseCode" + index).bind("blur", function() { me.houseCodeBlur(this); });
				$("#selStatusType" + index).bind("change", function() { me.statusTypeChange(this); });
				$("#selTerminationReasonType" + index).bind("change", function() { me.terminationReasonTypeChange(this); });
				$("#selPayrollCompany" + index).bind("change", function() { me.payrollCompanyChange(this); });
				$("#selPrimaryState" + index).bind("change", function() { me.primaryStateChange(this); });
				$("#selSecondaryState" + index).bind("change", function() { me.secondaryStateChange(this); });				
			}
			
			me.buildDropDown("State", me.states);
			me.buildDropDown("StatusType", me.statusTypes);	
			me.buildDropDown("DeviceGroupType", me.deviceGroupTypes);
			me.buildDropDown("JobCodeType", me.jobCodeTypes);
			me.buildDropDown("ChangeReasonType", me.rateChangeReasons);
			me.buildDropDown("TerminationReasonType", me.terminationReasons);
			me.buildDropDown("WorkShift", me.workShifts);
			me.buildDropDown("UnionType", me.unionTypes);
			me.buildDropDown("GenderType", me.genderTypes);
			me.buildDropDown("EthnicityType", me.ethnicityTypes);
			me.buildDropDown("FederalAdjustmentType", me.federalAdjustments);
			me.buildDropDown("MaritalStatusFederalTaxType", me.maritalStatusFederalTaxTypes);
			me.buildDropDown("PrimaryState", me.states);
			me.buildDropDown("SecondaryState", me.states);	
			me.buildDropDown("I9Type", me.i9Types);
			me.buildDropDown("VetType", me.vetTypes);
			me.buildDropDown("JobStartReasonType", me.jobStartReasonTypes);
			me.buildDropDown("MaritalStatusType", me.maritalStatusTypes);
			
			employeeRow = '<tr height="100%"><td colspan="92" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#EmployeeGridBody").append(employeeRow);
			$("#EmployeeGrid tr:odd").addClass("gridRow");
        	$("#EmployeeGrid tr:even").addClass("alternateGridRow");

			/*for (var index = 0; index < $("#trEmployeeGridHead")[0].childNodes.length; index++) {
				if ($("#trEmployeeGridHead")[0].childNodes[index].clientWidth != $("#trEmployee0")[0].childNodes[index].clientWidth)
					alert(index);
			}*/
			
			me.resize();
			
			me.intervalId = setInterval(function() {

				if (me.houseCodeLoading <= 0 && me.statesLoading <= 0 && me.statusTypesLoading <= 0 
					&& me.terminationReasonTypesLoading <= 0 && me.localTaxCodesLoading <= 0) {
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
				if (me.employees[index].column16 == "1")
					$("#chkActive" + index)[0].checked = true;
				if (me.employees[index].column17 == "1")
					$("#chkEmployeeHouseCodeUpdated" + index)[0].checked = true;
				$("#txtSSN" + index).val(me.employees[index].column18);								
				me.setDropDownValue(me.statusTypes, me.employees[index].column19, "StatusType", index);
				var houseCode = $("#txtHouseCode" + index).val();
				//me.setPayrollCompanyValue(me.houseCodeCache[houseCode].payrollCompanies, me.employees[index].column20, index);
				me.setDropDownValue(me.deviceGroupTypes, me.employees[index].column21, "DeviceGroupType", index);
				if (me.employees[index].column22 == "1")
					$("#chkExempt" + index)[0].checked = true;				
				me.setDropDownValue(me.jobCodeTypes, me.employees[index].column23, "JobCodeType", index);
				$("#txtHireDate" + index).val(me.stripTimeStamp(me.employees[index].column25));
				me.setDropDownValue(me.rateChangeReasons, me.employees[index].column26, "ChangeReasonType", index);
				$("#txtRateChangeDate" + index).val(me.stripTimeStamp(me.employees[index].column27));
				$("#txtSeniorityDate" + index).val(me.stripTimeStamp(me.employees[index].column28));
				$("#txtTerminationDate" + index).val(me.stripTimeStamp(me.employees[index].column29));				
				me.setDropDownValue(me.terminationReasons, me.employees[index].column30, "TerminationReasonType", index);
				me.setDropDownValue(me.workShifts, me.employees[index].column31, "WorkShift", index);
				$("#txtBenefitsPercentage" + index).val(me.employees[index].column32);
				$("#txtScheduledHours" + index).val(me.employees[index].column33);
				if (me.employees[index].column34 == "1")
					$("#chkUnion" + index)[0].checked = true;
				if (me.employees[index].column35 == "1")
					$("#chkCrothallEmployee" + index)[0].checked = true;				
				$("#txtEmployeeNumber" + index).val(me.employees[index].column36);
				$("#txtAlternatePayRateA" + index).val(me.employees[index].column37);
				$("#txtAlternatePayRateB" + index).val(me.employees[index].column38);
				$("#txtAlternatePayRateC" + index).val(me.employees[index].column39);
				$("#txtAlternatePayRateD" + index).val(me.employees[index].column40);
				$("#txtPTOStartDate" + index).val(me.stripTimeStamp(me.employees[index].column41));
				if (me.employees[index].column42 == "1")
					$("#chkPTOAccruedHourEntryAutomatic" + index)[0].checked = true;
				$("#txtOriginalHireDate" + index).val(me.stripTimeStamp(me.employees[index].column43));
				$("#txtEffectiveDate" + index).val(me.stripTimeStamp(me.employees[index].column44));
				me.setDropDownValue(me.unionTypes, me.employees[index].column45, "UnionType", index);
				var statusType = $("#selStatusType" + index).val();
				me.setDropDownValue(me.statusTypesCache[statusType].statusCategoryTypes, me.employees[index].column46, "StatusCategoryType", index);
				$("#txtPayRate" + index).val(me.employees[index].column47);
				$("#txtPayRateEnteredBy" + index).val(me.employees[index].column48);
				$("#txtPayRateEnteredAt" + index).val(me.stripTimeStamp(me.employees[index].column49));
				$("#txtPrevPayRate" + index).val(me.employees[index].column50);
				$("#txtPrevPayRateEnteredBy" + index).val(me.employees[index].column51);
				$("#txtPrevPayRateEnteredAt" + index).val(me.stripTimeStamp(me.employees[index].column52));
				$("#txtPrevPrevPayRate" + index).val(me.employees[index].column53);
				$("#txtPrevPrevPayRateEnteredBy" + index).val(me.employees[index].column54);
				$("#txtPrevPrevPayRateEnteredAt" + index).val(me.stripTimeStamp(me.employees[index].column55));
				me.setDropDownValue(me.genderTypes, me.employees[index].column56, "GenderType", index);
				me.setDropDownValue(me.ethnicityTypes, me.employees[index].column57, "EthnicityType", index);
				$("#txtBirthDate" + index).val(me.stripTimeStamp(me.employees[index].column58));				
				$("#txtReviewDate" + index).val(me.stripTimeStamp(me.employees[index].column59));
				$("#txtWorkPhone" + index).val(me.employees[index].column60);
				$("#txtWorkPhoneExt" + index).val(me.employees[index].column61);
				$("#txtBackGroundCheckDate" + index).val(me.stripTimeStamp(me.employees[index].column62));				
				$("#txtFederalExemptions" + index).val(me.employees[index].column63);
				me.setDropDownValue(me.federalAdjustments, me.employees[index].column64, "FederalAdjustmentType", index);
				me.setDropDownValue(me.maritalStatusFederalTaxTypes, me.employees[index].column65, "MaritalStatusFederalTaxType", index);
				$("#txtFederalAdjustmentAmount" + index).val(me.employees[index].column66);
				me.setDropDownValue(me.states, me.employees[index].column67, "PrimaryState", index);
				me.setDropDownValue(me.states, me.employees[index].column68, "SecondaryState", index);
				var primaryState = $("#selPrimaryState" + index).val();
				me.setDropDownValue(me.statesCache[primaryState].maritalStatusStateTaxTypes, me.employees[index].column69, "MaritalStatusStateTaxTypePrimary", index);
				var secondaryState = $("#selSecondaryState" + index).val();
				me.setDropDownValue(me.statesCache[secondaryState].maritalStatusStateTaxTypes, me.employees[index].column70, "MaritalStatusStateTaxTypeSecondary", index);
				$("#txtStateExemptions" + index).val(me.employees[index].column71);
				me.setDropDownValue(me.statesCache[primaryState].stateAdjustmentTypes, me.employees[index].column72, "StateAdjustmentType", index);
				$("#txtStateAdjustmentAmount" + index).val(me.employees[index].column73);
				me.setDropDownValue(me.statesCache[primaryState].sdiAdjustmentTypes, me.employees[index].column74, "SDIAdjustmentType", index);
				$("#txtSDIRate" + index).val(me.employees[index].column75);
				me.setDropDownValue(me.statesCache[primaryState].localTaxAdjustmentTypes, me.employees[index].column76, "LocalTaxAdjustmentType", index);
				$("#txtLocalTaxAdjustmentAmount" + index).val(me.employees[index].column77);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column78, "LocalTaxCode1", index);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column79, "LocalTaxCode2", index);
				me.setDropDownValue(me.statesCache[primaryState].localTaxCodes, me.employees[index].column80, "LocalTaxCode3", index);
				$("#txtPayrollStatus" + index).val(me.employees[index].column81);
				$("#txtPreviousPayrollStatus" + index).val(me.employees[index].column82);
				me.setHouseCodeJobValue(me.houseCodeCache[houseCode].jobs, me.employees[index].column84, index);
				me.setDropDownValue(me.i9Types, me.employees[index].column85, "I9Type", index);
				me.setDropDownValue(me.vetTypes, me.employees[index].column86, "VetType", index);
				var terminationReasonType = $("#selTerminationReasonType" + index).val();
				me.setDropDownValue(me.terminationReasonTypesCache[terminationReasonType].separationCodes, me.employees[index].column87, "SeparationCode", index);
				me.setDropDownValue(me.jobStartReasonTypes, me.employees[index].column88, "JobStartReasonType", index);
				$("#txtEffectiveDateJob" + index).val(me.stripTimeStamp(me.employees[index].column89));
				$("#txtEffectiveDateCompensation" + index).val(me.stripTimeStamp(me.employees[index].column90));
				me.setDropDownValue(me.maritalStatusTypes, me.employees[index].column91, "MaritalStatusType", index);
				me.setFrequencyType(index);
			}
			
			me.employeeLoading = false;

			$("#pageLoading").hide();
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
		
		setPayrollCompanyValue: function(types, title, index) {
			var me = this;
			var idIndex = null;
			
			for (var rowNumber = 0; rowNumber < types.length; rowNumber++) {
				if (types[rowNumber].title == title) {
					idIndex = rowNumber;
					break;
				}
			}

			if (idIndex != undefined) {
				$("#selPayrollCompany" + index).val(types[idIndex].id);
			}
		},
		
		setHouseCodeJobValue: function(types, title, index) {
			var me = this;
			var idIndex = null;
			
			for (var rowNumber = 0; rowNumber < types.length; rowNumber++) {
				if (types[rowNumber].jobTitle == title) {
					idIndex = rowNumber;
					break;
				}
			}

			if (idIndex != undefined) {
				$("#selHouseCodeJob" + index).val(types[idIndex].id);
			}
		},
		
		setDropDownValue: function(types, title, controlName, index) {
			var me = this;
			var idIndex = 0;
			
			idIndex = me.findIndexByTitle(title, types);
			if (idIndex != undefined) {
				$("#sel" + controlName + index).val(types[idIndex].id);				
			}
		},
		
		setFrequencyType: function(rowNumber) {
			var me = this;
			var houseCode = me.employees[rowNumber].column1;			
			var index = ii.ajax.util.findIndexById($("#selPayrollCompany" + rowNumber).val(), me.houseCodeCache[houseCode].payrollCompanies);
			
			if (index != undefined)	{
				$("#txtFrequencyType" + rowNumber).val(me.houseCodeCache[houseCode].payrollCompanies[index].payFrequencyType);
				$("#chkHourly" + rowNumber)[0].checked = me.houseCodeCache[houseCode].payrollCompanies[index].hourly;
			}	
		},
		
		getFrequencyType: function(rowNumber) {
			var me = this;			
			var index = me.findIndexByTitle($("#txtFrequencyType" + rowNumber).val(), me.payFrequencyTypes);
			
			if (index != undefined)			
				return me.payFrequencyTypes[index].id;
			else return 0;
		},

		payrollCompanyChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(17));
			var index = Number(objSelect.selectedIndex);
			var houseCode = me.employees[rowNumber].column1;
			var payrollCompany = $("#selPayrollCompany" + rowNumber).val();
			var state = $("#selPrimaryState" + rowNumber).val();
			
	    	$("#txtFrequencyType" + rowNumber).val(me.houseCodeCache[houseCode].payrollCompanies[index].payFrequencyType);
			$("#chkHourly" + rowNumber)[0].checked = me.houseCodeCache[houseCode].payrollCompanies[index].hourly;
			me.localTaxCodeCheck(rowNumber, state, payrollCompany);
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
		            me.jobRebuild(rowNumber, houseCode);
		            me.payrollCompanyRebuild(rowNumber, houseCode);		
					me.setPayrollCompanyValue(me.houseCodeCache[houseCode].payrollCompanies, me.employees[rowNumber].column20, rowNumber);
					payrollCompany = $("#selPayrollCompany" + rowNumber).val();
					idIndex = me.findIndexByTitle(me.employees[rowNumber].column67, me.states);
					if (idIndex != undefined)
						me.localTaxCodeCheck(rowNumber, me.states[idIndex].id.toString(), payrollCompany);
		        }
		    }
		    else {
				for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					objInput = $("#txtHouseCode" + rowNumber);
					objInput.css("background-color", me.cellColorInvalid);
					objInput = $("#selPayrollCompany" + rowNumber);
					objInput.empty();
					objInput = $("#selHouseCodeJob" + rowNumber);
					objInput.empty();
		        }		       
		    }
		},
		
		houseCodeLoad: function(rowNumber, houseCode) {
		    var me = this;
			
		    ii.trace("HouseCode Loading : " + houseCode, ii.traceTypes.information, "Startup");
			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.houseCodeLoading++;
		   
		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
		    me.houseCodeCache[houseCode].buildQueue = [];
		    me.houseCodeCache[houseCode].jobs = [];
		    me.houseCodeCache[houseCode].payrollCompanies = [];
		    me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],"
                    + "appUnitBrief:" + houseCode + ",<criteria>",
                
                success: function(xml) {
		    		ii.trace("HouseCode Loaded : " + houseCode, ii.traceTypes.information, "Startup");
		            
					if ($(xml).find('item').length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = $(this).attr("id");
		                    me.houseCodeJobLoad(houseCode);
		                });
		            }
		            else {
		                //the house code is invalid
		                //validate the list of rows
		                me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);    		            
		                me.houseCodeLoading--;
						if (me.houseCodeLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
		            }
				}
			});
		},
		
		houseCodeJobLoad: function(houseCode) {
		    var me = this;
		    
		    $.ajax({            
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeJobs,userId:[user],"
                    + "houseCodeId:" + me.houseCodeCache[houseCode].id + ",<criteria>",
                
                success: function(xml) {
       				var job = {};
	                job.id = 0;		               
	                job.jobNumber = "";
	                job.jobTitle = "";
	                me.houseCodeCache[houseCode].jobs.push(job);
								
		            $(xml).find('item').each(function() {
		                var job = {};
		                job.id = $(this).attr("id");		               
		                job.jobNumber = $(this).attr("jobNumber");
		                job.jobTitle = $(this).attr("jobTitle");
		                me.houseCodeCache[houseCode].jobs.push(job);
		            });
					
					//load the payroll companies as well
		    		me.houseCodePayrollCompaniesLoad(houseCode);
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
					var payrollCompany = {};
	                payrollCompany.id = 0;
	                payrollCompany.title = "";
					payrollCompany.salary = false;
					payrollCompany.hourly = false;
					payrollCompany.payFrequencyType = "";
	                me.houseCodeCache[houseCode].payrollCompanies.push(payrollCompany);
						
		            $(xml).find('item').each(function() {						
		                var payrollCompany = {};
		                payrollCompany.id = $(this).attr("id");
		                payrollCompany.title = $(this).attr("title");
						payrollCompany.salary = ($(this).attr("salary") == "true");
						payrollCompany.hourly = ($(this).attr("hourly") == "true");
						payrollCompany.payFrequencyType = $(this).attr("payFrequencyType");
		                me.houseCodeCache[houseCode].payrollCompanies.push(payrollCompany);
		            });
					me.houseCodeCache[houseCode].loaded = true;
					//validate the list of rows
		            me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);
		            me.houseCodeLoading--;
					if (me.houseCodeLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
				}
			});
		},
		
		jobRebuild: function(rowNumber, houseCode) {
		    var me = this;
		    var job = {};
		    var selJob = $("#selHouseCodeJob" + rowNumber);
		    
			selJob.empty();
			
		    for(var index = 0; index < me.houseCodeCache[houseCode].jobs.length; index++) {
		        job = me.houseCodeCache[houseCode].jobs[index];				
		        selJob.append("<option  title='" + job.jobTitle + "' value='" + job.id + "'>" + job.jobTitle + "</option>");
		    }
		},
		
		payrollCompanyRebuild: function(rowNumber, houseCode) {
		    var me = this;
		    var payrollCompany = {};
		    var selPayrollCompany = $("#selPayrollCompany" + rowNumber);
			
			selPayrollCompany.empty();

		    for(var index = 0; index < me.houseCodeCache[houseCode].payrollCompanies.length; index++) {
		        payrollCompany = me.houseCodeCache[houseCode].payrollCompanies[index];
		        selPayrollCompany.append("<option  title='" + payrollCompany.title + "' value='" + payrollCompany.id + "'>" + payrollCompany.title + "</option>");
		    }
		},
		
		statusTypeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(13));			

	        me.statusTypeCheck(rowNumber, objSelect.value);		    
		},
		
		statusTypeCheck: function(rowNumber, statusType) {
			var me = this;
			 
		    if (me.statusTypesCache[statusType] != undefined) {
	            if (me.statusTypesCache[statusType].loaded)
	            	me.statusTypeValidate(statusType, [rowNumber]);
	            else
	                me.statusTypesCache[statusType].buildQueue.push(rowNumber);
	        }
	        else
	            me.statusCategoryTypesLoad(rowNumber, statusType);
		},
		
		statusTypeValidate: function(statusType, rowArray) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.statusTypesCache[statusType].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "StatusCategoryType", me.statusTypesCache[statusType].statusCategoryTypes);
		        }
		    }
		},
		
		statusCategoryTypesLoad: function(rowNumber, statusType) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.statusTypesLoading++;

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
					
					me.statusTypesLoading--;
					me.statusTypesCache[statusType].valid = true;
					me.statusTypesCache[statusType].loaded = true;
					me.statusTypeValidate(statusType, me.statusTypesCache[statusType].buildQueue);
					if (me.statusTypesLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
				}
			});			
		},
		
		terminationReasonTypeChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(24));
	
	        me.terminationReasonTypeCheck(rowNumber, objSelect.value);
		},
		
		terminationReasonTypeCheck: function(rowNumber, terminationReasonType) {
			var me = this;
			 
		    if (me.terminationReasonTypesCache[terminationReasonType] != undefined) {
	            if (me.terminationReasonTypesCache[terminationReasonType].loaded)
	            	me.terminationReasonTypeValidate(terminationReasonType, [rowNumber]);
	            else
	                me.terminationReasonTypesCache[terminationReasonType].buildQueue.push(rowNumber);
	        }
	        else
	            me.terminationReasonTypesLoad(rowNumber, terminationReasonType);
		},
		
		terminationReasonTypeValidate: function(terminationReasonType, rowArray) {
		    var me = this;
		    var rowNumber = 0;

		    if (me.terminationReasonTypesCache[terminationReasonType].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		        	rowNumber = Number(rowArray[index]);
					me.buildSingleDropDown(rowNumber, "SeparationCode", me.terminationReasonTypesCache[terminationReasonType].separationCodes);
		        }
		    }
		},
		
		terminationReasonTypesLoad: function(rowNumber, terminationReasonType) {
		    var me = this;

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    me.terminationReasonTypesLoading++;

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
						
	                $(xml).find('item').each(function() {
	                    var separationCode = {};
	                	separationCode.id = $(this).attr("id");
	                	separationCode.name = $(this).attr("name");
	                	me.terminationReasonTypesCache[terminationReasonType].separationCodes.push(separationCode);
	                });
					
					me.terminationReasonTypesLoading--;
					me.terminationReasonTypesCache[terminationReasonType].valid = true;
					me.terminationReasonTypesCache[terminationReasonType].loaded = true;
					me.terminationReasonTypeValidate(terminationReasonType, me.terminationReasonTypesCache[terminationReasonType].buildQueue);
					if (me.terminationReasonTypesLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
				}
			});			
		},
		
		primaryStateChange: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.substr(15));				

			payrollCompany = $("#selPayrollCompany" + rowNumber).val();
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

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
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
					if (me.statesLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
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

			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
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
					if (me.localTaxCodesLoading <= 0 && !me.employeeLoading) $("#pageLoading").hide();
				}
			});
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
			
			$("#messageToUser").text("Validating");
			$("#pageLoading").show();
			
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
			var employeeNumbers = "";
			
			for (var index = 0; index < me.employees.length; index++) {
				rowValid = true;
				houseCodes += $("#txtHouseCode" + index).val() + "|";
				briefs += $("#txtBrief" + index).val() + "|";
				
				if ($("#txtSSN" + index).val() != "")
					ssnNumbers += $("#txtSSN" + index).val() + "|";
					
				if ($("#txtEmployeeNumber" + index).val() != "")
					employeeNumbers += $("#txtEmployeeNumber" + index).val() + "|";

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
				
				if ($("#selStatusType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selStatusType" + index), me.cellColorInvalid, "Please select valid Status Type.");
				}
				else {
					me.setCellColor($("#selStatusType" + index), me.cellColorValid, "");
				}
				
				if ($("#selPayrollCompany" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selPayrollCompany" + index), me.cellColorInvalid, "Please select valid Payroll Company.");
				}
				else {
					me.setCellColor($("#selPayrollCompany" + index), me.cellColorValid, "");
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
				
				if ($("#txtRateChangeDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtRateChangeDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtRateChangeDate" + index), me.cellColorInvalid, "Please enter valid Rate Change Date.");
				}
				else {
					me.setCellColor($("#txtRateChangeDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtSeniorityDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtSeniorityDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtSeniorityDate" + index), me.cellColorInvalid, "Please enter valid Seniority Date.");
				}
				else {
					me.setCellColor($("#txtSeniorityDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtTerminationDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtTerminationDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtTerminationDate" + index), me.cellColorInvalid, "Please enter valid Termination Date.");
				}
				else {
					me.setCellColor($("#txtTerminationDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtBenefitsPercentage" + index).val() != "" && !(/^[0-9]+$/.test($("#txtBenefitsPercentage" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBenefitsPercentage" + index), me.cellColorInvalid, "Please enter valid Benefits Percentage.");
				}
				else {
					me.setCellColor($("#txtBenefitsPercentage" + index), me.cellColorValid, "");
				}
				
				if ($("#txtScheduledHours" + index).val() != "" && !(/^[0-9]+$/.test($("#txtScheduledHours" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtScheduledHours" + index), me.cellColorInvalid, "Please enter valid Scheduled Hours.");
				}
				else {
					me.setCellColor($("#txtScheduledHours" + index), me.cellColorValid, "");
				}
				
				if ($("#txtEmployeeNumber" + index).val() != "" && !(/^[0-9]+$/.test($("#txtEmployeeNumber" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtEmployeeNumber" + index), me.cellColorInvalid, "Please enter valid Employee Number.");
				}
				else {
					me.setCellColor($("#txtEmployeeNumber" + index), me.cellColorValid, "");
				}

				if ($("#txtAlternatePayRateA" + index).val() != "" && !(/^\d{1,6}(\.\d{1,2})?$/.test($("#txtAlternatePayRateA" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateA" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate A.");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateA" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAlternatePayRateB" + index).val() != "" && !(/^\d{1,6}(\.\d{1,2})?$/.test($("#txtAlternatePayRateB" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateB" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate B.");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateB" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAlternatePayRateC" + index).val() != "" && !(/^\d{1,6}(\.\d{1,2})?$/.test($("#txtAlternatePayRateC" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateC" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate C.");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateC" + index), me.cellColorValid, "");
				}
				
				if ($("#txtAlternatePayRateD" + index).val() != "" && !(/^\d{1,6}(\.\d{1,2})?$/.test($("#txtAlternatePayRateD" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtAlternatePayRateD" + index), me.cellColorInvalid, "Please enter valid Alternate Pay Rate D.");
				}
				else {
					me.setCellColor($("#txtAlternatePayRateD" + index), me.cellColorValid, "");
				}
				
				if (ui.cmn.text.validate.generic($("#txtPTOStartDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPTOStartDate" + index), me.cellColorInvalid, "Please enter valid PTO Start Date.");
				}
				else {
					me.setCellColor($("#txtPTOStartDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtOriginalHireDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtOriginalHireDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtOriginalHireDate" + index), me.cellColorInvalid, "Please enter valid Original Hire Date.");
				}
				else {
					me.setCellColor($("#txtOriginalHireDate" + index), me.cellColorValid, "");
				}
				
				if (ui.cmn.text.validate.generic($("#txtEffectiveDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtEffectiveDate" + index), me.cellColorInvalid, "Please enter valid Effective Date.");
				}
				else {
					me.setCellColor($("#txtEffectiveDate" + index), me.cellColorValid, "");
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
				
				if ($("#selStatusCategoryType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selStatusCategoryType" + index), me.cellColorInvalid, "Please select valid Status Category Type.");
				}
				else {
					me.setCellColor($("#selStatusCategoryType" + index), me.cellColorValid, "");
				}
								
				if (ui.cmn.text.validate.generic($("#txtPayRate" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPayRate" + index), me.cellColorInvalid, "Please enter valid Pay Rate.");
				}
				else {
					me.setCellColor($("#txtPayRate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPayRateEnteredAt" + index).val() != "" && ui.cmn.text.validate.generic($("#txtPayRateEnteredAt" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPayRateEnteredAt" + index), me.cellColorInvalid, "Please enter valid Pay Rate Entered At.");
				}
				else {
					me.setCellColor($("#txtPayRateEnteredAt" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPrevPayRate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtPrevPayRate" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPrevPayRate" + index), me.cellColorInvalid, "Please enter valid Prev Pay Rate.");
				}
				else {
					me.setCellColor($("#txtPrevPayRate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPrevPayRateEnteredAt" + index).val() != "" && ui.cmn.text.validate.generic($("#txtPrevPayRateEnteredAt" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPrevPayRateEnteredAt" + index), me.cellColorInvalid, "Please enter valid Prev Pay Rate Entered At.");
				}
				else {
					me.setCellColor($("#txtPrevPayRateEnteredAt" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPrevPrevPayRate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtPrevPrevPayRate" + index).val(), "^\\d+(\\.\\d{1,2})?$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPrevPrevPayRate" + index), me.cellColorInvalid, "Please enter valid Prev Prev Pay Rate.");
				}
				else {
					me.setCellColor($("#txtPrevPrevPayRate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtPrevPrevPayRateEnteredAt" + index).val() != "" && ui.cmn.text.validate.generic($("#txtPrevPrevPayRateEnteredAt" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtPrevPrevPayRateEnteredAt" + index), me.cellColorInvalid, "Please enter valid Prev Prev Pay Rate Entered At.");
				}
				else {
					me.setCellColor($("#txtPrevPrevPayRateEnteredAt" + index), me.cellColorValid, "");
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
					me.setCellColor($("#txtBirthDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtReviewDate" + index).val() != "" && ui.cmn.text.validate.generic($("#txtReviewDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtReviewDate" + index), me.cellColorInvalid, "Please enter valid Review Date.");
				}
				else {
					me.setCellColor($("#txtReviewDate" + index), me.cellColorValid, "");
				}
				
				if ($("#txtWorkPhone" + index).val() != "" && !(ui.cmn.text.validate.phone($("#txtWorkPhone" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtWorkPhone" + index), me.cellColorInvalid, "Please enter valid Work Phone Number.");
				}
				else {
					me.setCellColor($("#txtWorkPhone" + index), me.cellColorValid, "");
				}
				
				if ($("#txtWorkPhoneExt" + index).val() != "" && !(/^[0-9]+$/.test($("#txtWorkPhoneExt" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtWorkPhoneExt" + index), me.cellColorInvalid, "Please enter valid Work Phone Extension Number.");
				}
				else {
					me.setCellColor($("#txtWorkPhoneExt" + index), me.cellColorValid, "");
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
				
				if (ui.cmn.text.validate.generic($("#txtEffectiveDateJob" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtEffectiveDateJob" + index), me.cellColorInvalid, "Please enter valid Effective Date Job.");
				}
				else {
					me.setCellColor($("#txtEffectiveDateJob" + index), me.cellColorValid, "");
				}
				
				if (ui.cmn.text.validate.generic($("#txtEffectiveDateCompensation" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
					rowValid = false;
					me.setCellColor($("#txtEffectiveDateCompensation" + index), me.cellColorInvalid, "Please enter valid Effective Date Compensation.");
				}
				else {
					me.setCellColor($("#txtEffectiveDateCompensation" + index), me.cellColorValid, "");
				}
				
				if ($("#selMaritalStatusType" + index).val() == "0") {
					rowValid = false;
					me.setCellColor($("#selMaritalStatusType" + index), me.cellColorInvalid, "Please select valid Marital Status Type.");
				}
				else {
					me.setCellColor($("#selMaritalStatusType" + index), me.cellColorValid, "");
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
				
				for (var indexI = index + 1; indexI < me.employees.length; indexI++) {
					if ($("#txtEmployeeNumber" + index).val() == $("#txtEmployeeNumber" + indexI).val() && $("#txtEmployeeNumber" + indexI).val() != "") {
						rowValid = false;
						me.setCellColor($("#txtEmployeeNumber" + indexI), me.cellColorInvalid, "Duplicate Employee Number is not allowed.");
					}						
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}
			
			// If all required fields are entered correctly then validate the House Codes, Briefs, SSN Numbers and Employee Numbers
			if (valid) {
				$("#messageToUser").text("Validating");
				$("#pageLoading").show();
			
				me.bulkImportValidationStore.reset();
				me.bulkImportValidationStore.fetch("userId:[user]"
					+ ",houseCodes:" + houseCodes
					+ ",briefs:" + briefs
					+ ",ssnNumbers:" + ssnNumbers
					+ ",employeeNumbers:" + employeeNumbers
					, me.validationsLoaded
					, me);
			}
			else {
				$("#pageLoading").hide();
				$("#AnchorSave").hide();
				alert("In order to save, the errors on the page must be corrected.");
			}			
		},

		validationsLoaded: function(me, activeId) {

			$("#pageLoading").hide();

			if (me.bulkImportValidations.length > 0) {				
				
				var houseCodes = me.bulkImportValidations[0].houseCodes.split('|');
				var briefs = me.bulkImportValidations[0].briefs.split('|');
				var ssnNumbers = me.bulkImportValidations[0].ssnNumbers.split('|');
				var employeeNumbers = me.bulkImportValidations[0].employeeNumbers.split('|');
				
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

					for(var index = 0; index < employeeNumbers.length - 1; index++) {
						if ($("#txtEmployeeNumber" + rowIndex).val() != "" && $("#txtEmployeeNumber" + rowIndex).val() == employeeNumbers[index]) {
							$("#txtEmployeeNumber" + rowIndex).attr("title", "Employee Number already exists.");
							$("#txtEmployeeNumber" + rowIndex).css("background-color", me.cellColorInvalid);							
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

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			
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
				xml += ' active="' + $("#chkActive" + index)[0].checked + '"';
				xml += ' employeeHouseCodeUpdated="' + $("#chkEmployeeHouseCodeUpdated" + index)[0].checked + '"';
				xml += ' ssn="' + $("#txtSSN" + index).val().replace(/[- ]/g, '') + '"'; 
				xml += ' statusType="' + $("#selStatusType" + index).val() + '"';
				xml += ' payrollCompany="' + $("#selPayrollCompany" + index).val() + '"';
				xml += ' deviceGroupType="' + $("#selDeviceGroupType" + index).val() + '"';				
				xml += ' exempt="' + $("#chkExempt" + index)[0].checked + '"';				
				xml += ' jobCodeType="' + $("#selJobCodeType" + index).val() + '"';
				xml += ' hourly="' + $("#chkHourly" + index)[0].checked + '"';
				xml += ' hireDate="' + $("#txtHireDate" + index).val() + '"';
				xml += ' changeReasonType="' + $("#selChangeReasonType" + index).val() + '"';
				xml += ' rateChangeDate="' + $("#txtRateChangeDate" + index).val() + '"';
				xml += ' seniorityDate="' + $("#txtSeniorityDate" + index).val() + '"';
				xml += ' terminationDate="' + $("#txtTerminationDate" + index).val() + '"';
				xml += ' terminationReasonType="' + $("#selTerminationReasonType" + index).val() + '"';
				xml += ' workShift="' + $("#selWorkShift" + index).val() + '"';
				xml += ' benefitsPercentage="' + $("#txtBenefitsPercentage" + index).val() + '"';
				xml += ' scheduledHours="' + $("#txtScheduledHours" + index).val() + '"';
				xml += ' union="' + $("#chkUnion" + index)[0].checked + '"';
				xml += ' crothallEmployee="' + $("#chkCrothallEmployee" + index)[0].checked + '"';
				xml += ' employeeNumber="' + $("#txtEmployeeNumber" + index).val() + '"';
				xml += ' alternatePayRateA="' + $("#txtAlternatePayRateA" + index).val() + '"';
				xml += ' alternatePayRateB="' + $("#txtAlternatePayRateB" + index).val() + '"';
				xml += ' alternatePayRateC="' + $("#txtAlternatePayRateC" + index).val() + '"';
				xml += ' alternatePayRateD="' + $("#txtAlternatePayRateD" + index).val() + '"';
				xml += ' ptoStartDate="' + $("#txtPTOStartDate" + index).val() + '"';
				xml += ' ptoAccruedHourEntryAutomatic="' + $("#chkPTOAccruedHourEntryAutomatic" + index)[0].checked + '"';
				xml += ' originalHireDate="' + $("#txtOriginalHireDate" + index).val() + '"';
				xml += ' effectiveDate="' + $("#txtEffectiveDate" + index).val() + '"';
				xml += ' unionType="' + $("#selUnionType" + index).val() + '"';
				xml += ' statusCategoryType="' + $("#selStatusCategoryType" + index).val() + '"';
				xml += ' payRate="' + $("#txtPayRate" + index).val() + '"';
				xml += ' payRateEnteredBy="' + ui.cmn.text.xml.encode($("#txtPayRateEnteredBy" + index).val()) + '"';
				xml += ' payRateEnteredAt="' + $("#txtPayRateEnteredAt" + index).val() + '"';
				xml += ' prevPayRate="' + $("#txtPrevPayRate" + index).val() + '"';
				xml += ' prevPayRateEnteredBy="' + ui.cmn.text.xml.encode($("#txtPrevPayRateEnteredBy" + index).val()) + '"';
				xml += ' prevPayRateEnteredAt="' + $("#txtPrevPayRateEnteredAt" + index).val() + '"';
				xml += ' prevPrevPayRate="' + $("#txtPrevPrevPayRate" + index).val() + '"';
				xml += ' prevPrevPayRateEnteredBy="' + ui.cmn.text.xml.encode($("#txtPrevPrevPayRateEnteredBy" + index).val()) + '"';
				xml += ' prevPrevPayRateEnteredAt="' + $("#txtPrevPrevPayRateEnteredAt" + index).val() + '"';				
				xml += ' genderType="' + $("#selGenderType" + index).val() + '"';
				xml += ' ethnicityType="' + $("#selEthnicityType" + index).val() + '"';
				xml += ' birthDate="' + $("#txtBirthDate" + index).val() + '"';				
				xml += ' reviewDate="' + $("#txtReviewDate" + index).val() + '"';
				xml += ' workPhone="' + fin.cmn.text.mask.phone($("#txtWorkPhone" + index).val(), true) + '"';
				xml += ' workPhoneExt="' + $("#txtWorkPhoneExt" + index).val() + '"';
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
				xml += ' payrollStatus="' + $("#txtPayrollStatus" + index).val() + '"';
				xml += ' previousPayrollStatus="' + $("#txtPreviousPayrollStatus" + index).val() + '"';
				xml += ' frequencyType="' + me.getFrequencyType(index) + '"';				
				xml += ' houseCodeJob="' + $("#selHouseCodeJob" + index).val() + '"';
				xml += ' i9Type="' + $("#selI9Type" + index).val() + '"';
				xml += ' vetType="' + $("#selVetType" + index).val() + '"';				
				xml += ' separationCode="' + $("#selSeparationCode" + index).val() + '"';
				xml += ' effectiveDateJob="' + $("#txtEffectiveDateJob" + index).val() + '"';
				xml += ' effectiveDateCompensation="' + $("#txtEffectiveDateCompensation" + index).val() + '"';
				xml += ' maritalStatusType="' + $("#selMaritalStatusType" + index).val() + '"';
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
				alert("[SAVE FAILURE] Error while updating Employee Record: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").hide();
		},
		
		actionImportSave: function() {
			var me = this;
			var item = [];

			$("#messageToUser").text("Importing");
			$("#pageLoading").show();
			
			var xml = '<appGenericImport';
				xml += ' fileName="' + me.fileName + '"';
				xml += ' object="Employee"';
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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "appGenericImport":							
							me.batchId = parseInt($(this).attr("batch"), 10);
							me.employeeCountLoad();
							break;
					}
				});
			}
			else {
				alert("[SAVE FAILURE] Error while importing Employee Record: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").hide();
			}
		}
	}
});

function onFileChange() {
	
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));
	
	if (fileExtension == ".xlsx")
		fin.emp.employeeImportUI.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {
	fin.emp.employeeImportUI = new fin.emp.employeeImport.UserInterface();
	fin.emp.employeeImportUI.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.hcm.job.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );
ii.Style( "fin.cmn.usr.tabs", 10);

ii.Class({
    Name: "fin.hcm.job.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function fin_hcm_job_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;

			me.jobId = 0;
			me.status = "";
			me.validZipCode = true;
			me.cityNames = [];
			me.units = [];
			me.jobsList = [];
			me.lastSelectedRowIndex = -1;
			me.activeFrameId = 0;
			me.houseCodesTabNeedUpdate = true;
			me.jobDetailsTabNeedUpdate = true;
			me.loadCount = 0;
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			if (!parent.fin.appUI.hirNode) parent.fin.appUI.hirNode = 0;

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\Jobs";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();
			
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			$("#JobTemplateDiv").hide();
			$("#TaxIdDiv").hide();
			$("#OverrideSiteTaxDiv").hide();
			$("#SearchInput").bind("keydown", me, me.actionSearchItem);
			
			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = document.activeElement;

					if (focusedControl.type != undefined && (focusedControl.type == "text" || focusedControl.type == "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid()) 
					return false;
				else {
					var tabIndex = 0;
					if (this.id == "JobDetails")
						tabIndex = 1;
					else if (this.id == "JobAssociations")
						tabIndex = 2;
						
					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}					
			});
			
			$("#TabCollection a").click(function() {				
				switch(this.id) {
					case "JobDetails":						
						me.activeFrameId = 0;
						if (me.status == "" && me.jobsList[me.lastSelectedRowIndex] != undefined)
							me.jobDetailsLoad(me.jobsList[me.lastSelectedRowIndex]);
						me.jobDetailsTabNeedUpdate = false;
						break;

					case "JobAssociations":
						me.activeFrameId = 1;
						me.houseCodeGrid.resize();
						me.loadHouseCodes();
						me.houseCodesTabNeedUpdate = false;
						break;
				}
			});
			
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
			$("#imgAddHouseCodes").bind("click", function() { me.addHouseCodes(); });
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},	

		authorizationProcess: function fin_hcm_job_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			me.jobsShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.jobsWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.jobsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			//j=Jobs
			me.jJobNumberShow = me.isCtrlVisible(me.authorizePath + "\\JobNumber", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jDescriptionShow = me.isCtrlVisible(me.authorizePath + "\\Description", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jContactShow = me.isCtrlVisible(me.authorizePath + "\\Contact", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jAddress1Show = me.isCtrlVisible(me.authorizePath + "\\Address1", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jAddress2Show = me.isCtrlVisible(me.authorizePath + "\\Address2", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCityShow = me.isCtrlVisible(me.authorizePath + "\\City", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jStateShow = me.isCtrlVisible(me.authorizePath + "\\State", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jPostalCodeShow = me.isCtrlVisible(me.authorizePath + "\\PostalCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jGEOCodeShow = me.isCtrlVisible(me.authorizePath + "\\GEOCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jJobTypeShow = me.isCtrlVisible(me.authorizePath + "\\JobType", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jInvoiceTemplateShow = me.isCtrlVisible(me.authorizePath + "\\InvoiceTemplate", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jTaxIdShow = me.isCtrlVisible(me.authorizePath + "\\TaxId", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jOverrideSiteTaxShow = me.isCtrlVisible(me.authorizePath + "\\OverrideSiteTax", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jServiceContractShow = me.isCtrlVisible(me.authorizePath + "\\ServiceContract", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jGeneralLocationCodeShow = me.isCtrlVisible(me.authorizePath + "\\GeneralLocationCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jActiveShow = me.isCtrlVisible(me.authorizePath + "\\Active", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			
			me.jJobNumberReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\JobNumber\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jDescriptionReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Description\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jContactReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Contact\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jAddress1ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Address1\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jAddress2ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Address2\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\City\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\State\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jPostalCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\PostalCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jGEOCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\GEOCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jJobTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\JobType\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jInvoiceTemplateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\InvoiceTemplate\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jTaxIdReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TaxId\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jOverrideSiteTaxReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\OverrideSiteTax\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jServiceContractReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\ServiceContract\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jGeneralLocationCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\GeneralLocationCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jActiveReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Active\\Read", me.jobsWrite, me.jobsReadOnly);
						
			me.resetUIElements();

			if (me.jobsReadOnly) {
				$(".footer").hide();
				$("#actionMenu").hide();
				$("#imgAddHouseCodes").hide();
			}	
					
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
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.loadCount = 3;
				me.jobState.fetchingData();
				me.invoiceTemplate.fetchingData();
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.invoiceTemplateStore.fetch("userId:[user]", me.invoiceTemplatesLoaded, me);
				me.jobMasterStore.fetch("userId:[user]", me.jobMastersLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	

		sessionLoaded: function fin_hcm_job_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		isCtrlVisible: function fin_hcm_job_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");

			if (me.jobsWrite || me.jobsReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_hcm_job_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.jobsReadOnly)
				return false;

			if (me.jobsWrite)
				return false;

			if (me.jobsReadOnly) return true;
			if (args.sectionReadOnly) return true;

			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_emp_UserInterface_resetUIElements() {
			var me = this;
						
			me.setControlState("JobNumber", me.jJobNumberReadOnly, me.jJobNumberShow);
			me.setControlState("JobDescription", me.jDescriptionReadOnly, me.jDescriptionShow);
			me.setControlState("JobContact", me.jContactReadOnly, me.jContactShow);
			me.setControlState("JobAddress1", me.jAddress1ReadOnly, me.jAddress1Show);
			me.setControlState("JobAddress2", me.jAddress2ReadOnly, me.jAddress2Show);
			me.setControlState("JobCity", me.jCityReadOnly, me.jCityShow);
			me.setControlState("JobState", me.jCityReadOnly, me.jCityShow);
			me.setControlState("JobPostalCode", me.jPostalCodeReadOnly, me.jPostalCodeShow);
			me.setControlState("JobGEOCode", me.jGEOCodeReadOnly, me.jGEOCodeShow);
			me.setControlState("JobType", me.jJobTypeReadOnly, me.jJobTypeShow);
			me.setControlState("InvoiceTemplate", me.jInvoiceTemplateReadOnly, me.jInvoiceTemplateShow);
			me.setControlState("JobTaxId", me.jTaxIdReadOnly, me.jTaxIdShow);
			me.setControlState("OverrideSiteTax", me.jOverrideSiteTaxReadOnly, me.jOverrideSiteTaxShow, "Check", "InputTextAreaRight");
			me.setControlState("ServiceContract", me.jServiceContractReadOnly, me.jServiceContractShow);
			me.setControlState("GeneralLocationCode", me.jGeneralLocationCodeReadOnly, me.jGeneralLocationCodeShow);
			me.setControlState("JobActive", me.jActiveReadOnly, me.jActiveShow, "Check", "InputTextAreaRight");
		},

		setControlState: function() {
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean},
				ctrlShow: {type: Boolean, required: false, defaultValue: false},
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});
			var me = this;

			if (args.ctrlReadOnly) {
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if (!args.ctrlShow) {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
			}
			if (args.ctrlReadOnly && args.ctrlType == "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}
			if (!args.ctrlShow && args.ctrlType == "Check") {
				$("#" + args.ctrlDiv).hide();
			}
		},

		resize: function fin_hcm_job_UserInterface_resize() {
			var args = ii.args(arguments, {});
			
			$("#popupJob").height($(window).height() - 212);
			$("#JobHouseCodeContainer").height($(window).height() - 202);
			fin.hcm.hcmjobUi.jobGrid.setHeight($(window).height() - 140);
			fin.hcm.hcmjobUi.houseCodeGrid.setHeight($(window).height() - 222)
		},
		
		controlKeyProcessor: function fin_hcm_job_UserInterface_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {

				switch (event.keyCode) {
					case 83: // Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 85: // Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}

			if (processed) {
				return false;
			}
		},
		
		resizeControls: function() {
			var me = this;
			
			me.jobTemplate.resizeText();
			me.jobNumber.resizeText();
			me.jobDescription.resizeText();
			me.jobContact.resizeText();
			me.jobAddress1.resizeText();
			me.jobAddress2.resizeText();
			me.jobCity.resizeText();
			me.jobState.resizeText();
			me.jobPostalCode.resizeText();
			me.geoCode.resizeText();
			me.invoiceTemplate.resizeText();
			me.taxId.resizeText();
			me.serviceContract.resizeText();
			me.generalLocationCode.resizeText();
		},

		defineFormControls: function fin_hcm_job_UserInterface_defineFormControls() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current Job details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New (Ctrl+N)", 
					title: "Create the new Job.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo the changes to Job being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New Job&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				title: "Click here to add a new Job Type for selected HouseCode.",
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorClone = new ui.ctl.buttons.Sizeable({
				id: "AnchorClone",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Clone Job&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloneItem(); },
				title: "Click here to create a Clone using Master Job Type list.",
				hasHotState: true
			});

			me.removeAssociation = new ui.ctl.buttons.Sizeable({
				id: "AnchorRemove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Remove&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionRemoveAssociation(); },
				title: "Click here to remove the HouseCode association with selected Job.",
				hasHotState: true
			});

			me.jobTemplate = new ui.ctl.Input.DropDown.Filtered({
				id: "JobTemplate",
				formatFunction: function(item) { return item.title; },
				changeFunction: function() { me.jobTemplateChanged(); },
				title: "Select a Job Template to Clone."
			});
			
			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				title: "To search a specific Job, type-in Job Number or Description and press Enter key/click Search button.",
				maxLength: 50
			});	
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.houseCodeChanged(); },
				hasHotState: true
			});
			
			me.jobNumber = new ui.ctl.Input.Text({
				id: "JobNumber",
				maxLength: 8,
				changeFunction: function() { me.jobNumberCheck(); me.modified(); }
			});

			me.jobNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );

			me.jobDescription = new ui.ctl.Input.Text({
				id: "JobDescription",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
			});

			me.jobDescription.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );

			me.jobContact = new ui.ctl.Input.Text({
				id: "JobContact",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.jobAddress1 = new ui.ctl.Input.Text({
				id: "JobAddress1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.jobAddress2 = new ui.ctl.Input.Text({
				id: "JobAddress2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});
			
			me.jobPostalCode = new ui.ctl.Input.Text({
				id: "JobPostalCode",
				maxLength: 10,
				changeFunction: function() {
					if (ui.cmn.text.validate.postalCode(me.jobPostalCode.getValue()))
						me.loadZipCodeTypes(); me.modified();
				}
			});
			
			me.jobPostalCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.jobPostalCode.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.postalCode(enteredText) == false)
						this.setInvalid("Please enter valid Postal Code. Example: 99999 or 99999-9999");
				});
			
			me.geoCode = new ui.ctl.Input.DropDown.Filtered({
		        id: "JobGEOCode",
				formatFunction: function( type ) { return type.geoCode; },
				changeFunction: function() {  me.modified(); me.geoCodeChanged(); },
		        required: false
		    });
			
			me.geoCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.geoCode.lastBlurValue != "" && me.geoCode.indexSelected == -1)
						this.setInvalid("Please select the correct GEO Code.");
				});

			me.jobCity = new ui.ctl.Input.DropDown.Filtered({
		        id: "JobCity",
				formatFunction: function( type ) { return type.city; },
				changeFunction: function() { me.modified(); },
		        required: false				
		    });
			
			me.jobCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.validZipCode && me.jobCity.indexSelected == -1)
						this.setInvalid("Please select the correct City.");
					else if (me.geoCode.lastBlurValue != "" && me.geoCode.indexSelected != -1) {
						var cityName = "";

						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.zipCodeTypes[index].geoCode == me.geoCode.lastBlurValue) {
								cityName = me.zipCodeTypes[index].city;
								break;
							}
						}

						if (me.jobCity.lastBlurValue.toUpperCase() != cityName.toUpperCase())
							this.setInvalid("Please select the correct City [" + cityName + "].");
					}						
				});

			me.jobState = new ui.ctl.Input.DropDown.Filtered({
				id: "JobState",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
			});
			
			me.jobState.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.jobState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
					else if (ui.cmn.text.validate.postalCode(me.jobPostalCode.getValue())) {
						var found = false;
									
						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.zipCodeTypes[index].stateType == me.stateTypes[me.jobState.indexSelected].id) {
								found = true;
								break;
							}
						}

						if (!found && me.zipCodeTypes.length > 0) {
							var stateName = "";
							var index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);
							
							if (index != undefined)
								stateName = me.stateTypes[index].name;
							this.setInvalid("Please select the correct State [" + stateName + "].");
						}							
					}
				});

			me.jobType = new ui.ctl.Input.DropDown.Filtered({
				id: "JobType",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); me.jobTypeChange(); },
				title: "Select Job Type"
			});
			
			me.jobType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.jobType.indexSelected == -1)
						this.setInvalid("Please select the correct Job Type.");
				});
			
			me.invoiceTemplate = new ui.ctl.Input.DropDown.Filtered({
				id: "InvoiceTemplate",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.modified(); },
				title: "Select Invoice Template"				
			});

			me.taxId = new ui.ctl.Input.Text({
				id: "JobTaxId",
				maxLength: 9,
				changeFunction: function() { me.modified(); }
			});

			me.taxId.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function( isFinal, dataMap) {				
	
				if (me.jobType.indexSelected == 2) {
					if(me.taxId.getValue() == "") 
						return;
					if (/^\d{9}$/.test(me.taxId.getValue()) == false)
						this.setInvalid("Please enter valid Tax Id.");
				}
				else
					this.valid = true;
			});
			
			me.overrideSiteTax = new ui.ctl.Input.Check({
				id: "OverrideSiteTax",
				changeFunction: function() { me.modified(); }
			});
			
			me.serviceContract = new ui.ctl.Input.Text({
				id: "ServiceContract",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.generalLocationCode = new ui.ctl.Input.Text({
				id: "GeneralLocationCode",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});
			
			me.jobActive = new ui.ctl.Input.Check({
				id: "JobActive",
				changeFunction: function() { me.modified(); }
			});

			me.jobGrid = new ui.ctl.Grid({
				id: "Job",
				appendToId: "divForm",
				selectFunction: function(index) { me.itemSelect(index);	},
				validationFunction: function() { 
					if (me.status != "new")
						return parent.fin.cmn.status.itemValid(); 
					}
			});

			me.jobGrid.addColumn("brief", "brief", "Number", "Job Number", 70);
			me.jobGrid.addColumn("description", "description", "Description", "Job Description", null);
			me.jobGrid.addColumn("active", "active", "Active", "Active", 60);
			me.jobGrid.capColumns();
			
			me.houseCodeGrid = new ui.ctl.Grid({
				id: "HouseCodeGrid",
				appendToId: "divForm",
				allowAdds: false
			});
			
			me.houseCodeGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
			me.houseCodeGrid.capColumns();
			me.houseCodeGrid.setHeight(250);
			
			me.houseCodePopupGrid = new ui.ctl.Grid({
				id: "HouseCodePopupGrid",
				appendToId: "divForm"
			});
			
			me.houseCodePopupGrid.addColumn("assigned", "assigned", "", "Checked means associated to the Epay Site", 30, function() { 
				var rowNumber = me.houseCodePopupGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + rowNumber + "\" class=\"iiInputCheck\"" + (me.units[rowNumber].assigned == true ? checked='checked' : '') + " onchange=\"parent.fin.appUI.modified = true;\"/>";				
            });
			me.houseCodePopupGrid.addColumn("name", "name", "House Code", "House Code", null);
			me.houseCodePopupGrid.capColumns();
			me.houseCodePopupGrid.setHeight(250);
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});	
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
		},

		configureCommunications: function fin_hcm_job_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.job.HirNode,
				itemConstructorArgs: fin.hcm.job.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.job.HouseCode,
				itemConstructorArgs: fin.hcm.job.houseCodeArgs,
				injectionArray: me.houseCodes			
			});	

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.job.StateType,
				itemConstructorArgs: fin.hcm.job.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.jobTypes = [];
			me.jobMasterStore = me.cache.register({
				storeId: "jobMasters", //jobTypes
				itemConstructor: fin.hcm.job.JobType,
				itemConstructorArgs: fin.hcm.job.jobTypeArgs,
				injectionArray: me.jobTypes	
			});

			me.invoiceTemplates = [];
			me.invoiceTemplateStore = me.cache.register({
				storeId: "revInvoiceTemplates",
				itemConstructor: fin.hcm.job.InvoiceTemplate,
				itemConstructorArgs: fin.hcm.job.invoiceTemplateArgs,
				injectionArray: me.invoiceTemplates
			});

			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.hcm.job.ZipCodeType,
				itemConstructorArgs: fin.hcm.job.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});

			me.jobTemplates = [];
			me.jobTemplateStore = me.cache.register({
				storeId: "jobTemplates",
				itemConstructor: fin.hcm.job.Job,
				itemConstructorArgs: fin.hcm.job.jobArgs,
				injectionArray: me.jobTemplates
			});

			me.jobs = [];
			me.jobStore = me.cache.register({
				storeId: "jobs",
				itemConstructor: fin.hcm.job.Job,
				itemConstructorArgs: fin.hcm.job.jobArgs,
				injectionArray: me.jobs,
				lookupSpec: {jobType: me.jobTypes}
			});

			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.hcm.job.HouseCodeJob,
				itemConstructorArgs: fin.hcm.job.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
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
		
		stateTypesLoaded: function fin_hcm_job_UserInterface_stateTypesLoaded(me, activeId) {

			me.jobState.setData(me.stateTypes);
			me.checkLoadCount();
		},
		
		invoiceTemplatesLoaded: function fin_hcm_job_UserInterface_invoiceTemplatesLoaded(me, activeId) {

			me.invoiceTemplate.setData(me.invoiceTemplates);
			me.checkLoadCount();
		},

		houseCodesLoaded: function fin_hcm_job_UserInterface_houseCodesLoaded(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},
				
		jobMastersLoaded: function fin_hcm_job_UserInterface_jobMastersLoaded(me, activeId) {

			for (var index = 0; index < me.jobTypes.length; index++) {
				if (me.jobTypes[index].name == "Epay Site")
					me.jobTypes.splice(index, 1);
			}

			me.jobType.setData(me.jobTypes);
			me.jobTemplate.setData(me.jobTemplates);
			me.loadJobs();
		},
		
		loadJobs: function() {
			var me = this;

			if ($("#SearchByHouseCode")[0].checked)
				me.jobStore.fetch("houseCodeId:" + parent.fin.appUI.houseCodeId + ",jobType:1,userId:[user],", me.jobsLoaded, me);
			else if ($("#SearchByJob")[0].checked && me.searchInput.getValue().length >= 3)
				me.jobStore.fetch("title:" + me.searchInput.getValue() + ",jobType:1,userId:[user],", me.jobsLoaded, me);
		},

		jobsLoaded: function fin_hcm_job_UserInterface_jobsLoaded(me, activeId) {

			me.jobsList = me.jobs.slice();

			if (me.jobsList.length <= 0) {
				me.jobGrid.setData([]);
				me.actionClearItem();
				me.status = "new";
				me.checkLoadCount();
				return;
			}

			me.jobGrid.setData(me.jobsList);
			me.jobGrid.body.select(0);
			me.checkLoadCount();
		},
		
		actionSearchItem: function fin_hcm_ePaySite_UserInterface_actionSearchItem() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.houseCodeChanged();
			}
		},
		
		houseCodeChanged: function fin_hcm_job_UserInterface_houseCodeChanged() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if ($("#SearchByJob")[0].checked && me.searchInput.getValue().length < 3) {
				me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}			
			else {
				me.searchInput.valid = true;
				me.searchInput.updateStatus();
			}
			
			me.setLoadCount();
			me.loadJobs();
		},

		jobNumberCheck: function fin_hcm_job_UserInterface_jobNumberCheck() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.jobNumber.getValue().length > 0) {
				me.jobDetailsTabNeedUpdate = true;
				me.jobStore.reset();
				me.jobStore.fetch("jobNumber:" + me.jobNumber.getValue() + ",userId:[user],", me.singleJobLoaded, me);
			}
		},

		singleJobLoaded: function fin_hcm_job_UserInterface_singleJobLoaded(me, activeId) {

			if (me.jobs.length > 0)
				me.jobDetailsLoad(me.jobs[0]);
		},

		jobTemplateChanged: function fin_hcm_job_UserInterface_jobTemplateChanged() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.jobDetailsTabNeedUpdate = true;
			me.jobDetailsLoad(me.jobTemplates[me.jobTemplate.indexSelected]);
		},

		itemSelect: function fin_hcm_job_UserInterface_itemSelect() {
			var args = ii.args(arguments, {index: { type: Number }});
			var me = this;			
			var index = args.index;
			
			if (!parent.fin.cmn.status.itemValid()) {
				me.jobGrid.body.deselect(index, true);
				return;
			}
			
			me.status = "";
			me.jobId = me.jobsList[index].id;
			me.lastSelectedRowIndex = index;
			me.houseCodesTabNeedUpdate = true;
			me.jobDetailsTabNeedUpdate = true;
			
			if (me.jobsList[index] != undefined) 			
				me.jobDetailsLoad(me.jobsList[index]);
				
			me.loadHouseCodes();
		},

		jobDetailsLoad: function fin_hcm_job_UserInterface_jobDetailsLoad() {
			var args = ii.args(arguments, {
				job: { type: fin.hcm.job.Job }
			});
			var me = this;
			
			if (me.jobDetailsTabNeedUpdate) {
				me.jobDetailsTabNeedUpdate = false;
				me.setLoadCount();
				me.jobNumber.setValue(args.job.brief);
				me.jobDescription.setValue(args.job.description);
				me.jobContact.setValue(args.job.contact);
				me.jobAddress1.setValue(args.job.address1);
				me.jobAddress2.setValue(args.job.address2);
				me.jobPostalCode.setValue(args.job.postalCode);
				me.loadZipCodeTypes();
				
				var index = ii.ajax.util.findIndexById(args.job.appStateTypeId.toString(), me.stateTypes);
				if (index != undefined) 
					me.jobState.select(index, me.jobState.focused);
				else 
					me.jobState.reset();
				
				if (args.job.jobType.id) {
					index = ii.ajax.util.findIndexById(args.job.jobType.id.toString(), me.jobTypes);
					if (index != undefined) 
						me.jobType.select(index, me.jobType.focused);
					else 
						me.jobType.reset();
					
					if (index == 2) {
						$("#TaxIdDiv").show();
						$("#OverrideSiteTaxDiv").hide();
						index = ii.ajax.util.findIndexById(args.job.invoiceTemplate.toString(), me.invoiceTemplates);
						if (index != undefined) 
							me.invoiceTemplate.select(index, me.invoiceTemplate.focused);
						else 
							me.invoiceTemplate.reset();
						
						if (args.job.taxId == 0) 
							me.taxId.setValue("");
						else 
							me.taxId.setValue(args.job.taxId);
					}
					else {
						me.invoiceTemplate.reset();
						me.taxId.setValue("");
						$("#TaxIdDiv").hide();
						$("#OverrideSiteTaxDiv").show();
					}
				}
				else 
					me.jobType.reset();
				
				me.overrideSiteTax.setValue(args.job.overrideSiteTax.toString());
				me.serviceContract.setValue(args.job.serviceContract);
				me.generalLocationCode.setValue(args.job.generalLocationCode);
				me.jobActive.setValue(args.job.active.toString());				
			}

			setTimeout(function() {
				me.resizeControls();
			}, 100);
		},
		
		loadZipCodeTypes: function() {
			var me = this;

			// remove any unwanted characters
	    	var zipCode = me.jobPostalCode.getValue().replace(/[^0-9]/g, "");
			zipCode = zipCode.substring(0, 5);
			me.jobCity.fetchingData();
			if (!me.validZipCode)
				me.zipCodeTypeStore.reset();
			me.zipCodeTypeStore.fetch("userId:[user],zipCode:" + zipCode, me.zipCodeTypesLoaded, me);
		},

		zipCodeTypesLoaded: function(me, activeId) {
			var cityNamesTemp = [];
			var index = 0;

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if ($.inArray(me.zipCodeTypes[index].city, cityNamesTemp) == -1)
					cityNamesTemp.push(me.zipCodeTypes[index].city);
			}

			cityNamesTemp.sort();
			me.cityNames = [];

			for (index = 0; index < cityNamesTemp.length; index++) {
				me.cityNames.push(new fin.hcm.job.CityName({ id: index + 1, city: cityNamesTemp[index] }));
			}

			me.jobCity.reset();
			me.geoCode.reset();
			me.jobState.reset();
			me.jobCity.setData(me.cityNames);
			me.geoCode.setData(me.zipCodeTypes);

			if (me.jobGrid.activeRowIndex >= 0 && me.jobsList[me.jobGrid.activeRowIndex].id > 0) {
				for (index = 0; index < me.zipCodeTypes.length; index++) {
					if (me.zipCodeTypes[index].geoCode == me.jobsList[me.jobGrid.activeRowIndex].geoCode) {
						me.geoCode.select(index, me.geoCode.focused);
						break;
					}
				}

				for (index = 0; index < me.cityNames.length; index++) {
					if (me.cityNames[index].city.toUpperCase() == me.jobsList[me.jobGrid.activeRowIndex].city.toUpperCase()) {
						me.jobCity.select(index, me.jobCity.focused);
						break;
					}
				}
			}
			else if (me.jobsList.length > 0) {
				for (index = 0; index < me.zipCodeTypes.length; index++) {
					if (me.zipCodeTypes[index].geoCode == me.jobsList[0].geoCode) {
						me.geoCode.select(index, me.geoCode.focused);
						break;
					}
				}

				for (index = 0; index < me.cityNames.length; index++) {
					if (me.cityNames[index].city.toUpperCase() == me.jobsList[0].city.toUpperCase()) {
						me.jobCity.select(index, me.jobCity.focused);
						break;
					}
				}
			}
		
			if (me.zipCodeTypes.length == 0) {
				me.validZipCode = false;
				
				if (me.jobGrid.activeRowIndex >= 0) {
					me.jobCity.setValue(me.jobsList[me.jobGrid.activeRowIndex].city);
					index = ii.ajax.util.findIndexById(me.jobsList[me.jobGrid.activeRowIndex].appStateTypeId.toString(), me.stateTypes);
					if (index != undefined) 
						me.jobState.select(index, me.jobState.focused);
				}
				else if (me.jobsList.length > 0) {
					me.geoCode.setValue(me.jobsList[0].geoCode);
					me.jobCity.setValue(me.jobsList[0].city);
					index = ii.ajax.util.findIndexById(me.jobsList[0].appStateTypeId.toString(), me.stateTypes);
					if (index != undefined) 
						me.jobState.select(index, me.jobState.focused);
				}
			}
			else {
				me.validZipCode = true;
				index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

				if (index != undefined)
					me.jobState.select(index, me.jobState.focused);
				else
					me.jobState.reset();
			}
			
			me.checkLoadCount();
		},

		geoCodeChanged: function() {
			var me = this;
			var cityName = "";
			
			for (var index = 0; index < me.zipCodeTypes.length; index++) {
				if (me.zipCodeTypes[index].geoCode == me.geoCode.lastBlurValue) {
					cityName = me.zipCodeTypes[index].city;
					break;
				}
			}
			
			for (var index = 0; index < me.cityNames.length; index++) {
				if (me.cityNames[index].city.toUpperCase() == cityName.toUpperCase()) {
					me.jobCity.select(index, me.jobCity.focused);
					break;
				}
			}
		},

		loadHouseCodes: function fin_hcm_job_UserInterface_loadHouseCodes() {
		    var me = this;

			if (me.jobsList[me.lastSelectedRowIndex] == undefined) return;

			if (me.houseCodesTabNeedUpdate) {
				var index = me.houseCodeGrid.activeRowIndex;
				if (index >= 0)				
		   			me.houseCodeGrid.body.deselect(index);

				if (me.jobId == 0) {
					me.houseCodeGrid.setData([]);
				}
				else {
					me.houseCodesTabNeedUpdate = false;
					me.houseCodeJobStore.reset();
					me.houseCodeJobStore.fetch("userId:[user],jobId:" + me.jobId, me.houseCodeJobLoaded, me);
				}
			}
		},

		houseCodeJobLoaded: function fin_hcm_job_UserInterface_houseCodeJobLoaded(me, activeId) {

			me.houseCodeGrid.setData(me.houseCodeJobs);
			me.houseCodeGrid.resize();
		},
		
		addHouseCodes: function() {
			var me = this;

			if (me.jobGrid.activeRowIndex == -1)
				return;

			loadPopup();

			$("#houseCodeTemplateText").val("");
			$("#popupHouseCode").show();

			me.units = [];
			me.houseCodePopupGrid.setData(me.units);
			me.houseCodePopupGrid.setHeight($(window).height() - 200);
			me.setStatus("Loaded");
		},
		
		houseCodeTemplateChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;		

			me.units.push(new fin.hcm.job.Unit( 
				me.houseCodeSearchTemplate.houseCodeIdTemplate
				, me.houseCodeSearchTemplate.houseCodeTitleTemplate
				, me.houseCodeSearchTemplate.hirNodeTemplate
				));

			me.houseCodePopupGrid.setData(me.units);
			me.modified();
		},
		
		jobTypeChange: function() {
			var me = this;

			if (me.jobType.indexSelected == 2) {
				$("#TaxIdDiv").show();
				$("#OverrideSiteTaxDiv").hide();
			}
			else {
				$("#TaxIdDiv").hide();
				$("#OverrideSiteTaxDiv").show();
			}
		},
		
		actionOkItem: function() {
			var me = this;
			var xml = "";
			var item = [];
			
			if (me.houseCodePopupGrid.activeRowIndex >= 0)		
				me.houseCodePopupGrid.body.deselect(me.houseCodePopupGrid.activeRowIndex);
					
			for (var index = 0; index < me.units.length; index++) {
				if ($("#assignInputCheck" + index)[0].checked) {
					xml += '<houseCodeJob';
					xml += ' id="0"';
					xml += ' jobId="' + me.jobId + '"';
					xml += ' houseCodeId="' + me.units[index].id + '"';
					xml += ' hirNode="' + me.units[index].hirNode + '"';
					xml += '/>';
				}											
			};

			if (xml != "")
				me.status = "addHouseCodes";
			else {
				alert("Please select at least one House Code.");
				return;
			}

			disablePopup();
			me.actionSave(item, xml);
		},
		
		actionCancelItem: function() {
			var me = this;
			var index = -1;	
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			index = me.houseCodeGrid.activeRowIndex;
			if (index >= 0)				
	   			me.houseCodeGrid.body.deselect(index);
			
			disablePopup();
			me.setStatus("Loaded");
		},
		
		actionClearItem: function fin_hcm_job_UserInterface_actionClearItem() {
			var me = this;
			
			me.validator.reset();
			me.jobNumber.setValue("");
			me.jobDescription.setValue("");
			me.jobContact.setValue("");
			me.jobAddress1.setValue("");
			me.jobAddress2.setValue("");
			me.jobCity.reset();
			me.jobState.reset();
			me.jobPostalCode.setValue("");
			me.geoCode.reset();
			me.jobType.reset();
			me.invoiceTemplate.reset();
			me.taxId.setValue("");
			me.overrideSiteTax.setValue("false");
			me.serviceContract.setValue("");
			me.generalLocationCode.setValue("");
			me.jobActive.setValue("true");
			me.jobTemplate.reset();
			me.jobTemplate.resizeText();
		},
		
		resetGrids: function() {
			var me = this;
					
			me.jobGrid.body.deselectAll();
			me.houseCodeGrid.body.deselectAll();
			me.houseCodeJobStore.reset();
			me.houseCodeGrid.setData([]);
			me.houseCodesTabNeedUpdate = true;
			me.jobDetailsTabNeedUpdate = true;
		},
		
		actionNewItem: function fin_hcm_job_UserInterface_actionNewItem() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			$("#container-1").triggerTab(1);
			$("#JobTemplateDiv").hide();
			me.jobId = 0;			
			me.actionClearItem();
			me.resetGrids();
			me.status = "new";
			me.setStatus("Loaded");
		},

		actionCloneItem: function fin_hcm_job_UserInterface_actionCloneItem() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "clone";
			me.actionClearItem();
			me.resetGrids();
			$("#JobTemplateDiv").show();
		},

		actionRemoveAssociation: function fin_hcm_job_UserInterface_actionRemoveAssociation() {
			var me = this;
							
			if (me.jobGrid.activeRowIndex < 0) {
				alert("Please select Job to remove association with House Code.");
				return;
			}
			
			if (me.houseCodeGrid.activeRowIndex < 0) {
				alert("Please select House Code to remove association with Job.");
				return;
			}
			
			if (!confirm("Do you want remove House Code association with selected Job?")) {
				return;
			}

			me.status = "removeAssociation";
			me.actionSaveItem();
		},

		actionUndoItem: function fin_hcm_job_UserInterface_actionUndoItem() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			me.status = "";

			$("#JobTemplateDiv").hide();

			if (me.jobGrid.data.length <= 0) return;

			if (me.lastSelectedRowIndex >= 0)
				me.jobGrid.body.select(me.lastSelectedRowIndex);
			else
				me.jobGrid.body.select(0);
		},

		actionSaveItem: function fin_hcm_job_UserInterface_actionSaveItem() {
			var args = ii.args(arguments, {
				flag: {type: String, required: false, defaultValue: ""}
			});
			var me = this;
			var item;
			var errorMessage = "";
			var xml = "";

			if (me.jobsReadOnly) return;

			me.validator.forceBlur();

			if (me.status == "clone" && me.jobTemplate.indexSelected < 0) {
				errorMessage += "Please select Job Template to Clone.\n";
			}

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				errorMessage += "In order to save, the errors on the page must be corrected.";
			}

			if (errorMessage != "") {
				alert(errorMessage);
				return false;
			}

			me.houseCodeJobId = 0;

			if (me.status == "removeAssociation") {
				if (me.jobsList[me.jobGrid.activeRowIndex] != undefined) {
					me.jobId = me.jobsList[me.jobGrid.activeRowIndex].id;
					me.houseCodeJobId = me.houseCodeGrid.data[me.houseCodeGrid.activeRowIndex].id;
				}
			}

			item = new fin.hcm.job.Job({
				id: me.jobId,
				brief: me.jobNumber.getValue(),
				title: me.jobDescription.getValue(),
				description: me.jobDescription.getValue(),
				contact: me.jobContact.getValue(),
				address1: me.jobAddress1.getValue(),
				address2: me.jobAddress2.getValue(),
				city: me.jobCity.lastBlurValue,
				appStateTypeId: me.jobState.indexSelected != -1 ? me.stateTypes[me.jobState.indexSelected].id : 0,
				postalCode: me.jobPostalCode.getValue(),
				geoCode: me.geoCode.lastBlurValue,
				jobType: me.jobType.indexSelected != -1 ? me.jobTypes[me.jobType.indexSelected] : 0,
				invoiceTemplate: me.invoiceTemplate.indexSelected != -1 ? me.invoiceTemplates[me.invoiceTemplate.indexSelected].id : 0,
				taxId: me.taxId.getValue(),
				overrideSiteTax: me.overrideSiteTax.getValue(),
				serviceContract: me.serviceContract.getValue(),
				generalLocationCode: me.generalLocationCode.getValue(),
				active: me.jobActive.getValue()
			});

			xml = me.saveXmlBuild(item);
			
			me.actionSave(item, xml);
		},

		saveXmlBuild: function fin_hcm_job_UserInterface_saveXmlBuild() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.job.Job}
			});
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.status == "removeAssociation") {
				xml += '<houseCodeJobDelete';
				xml += ' id="' + me.houseCodeJobId + '"';
				xml += '/>';
			}
			else {
				xml += '<job';
				xml += ' id="' + item.id + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode(item.brief) + '"';
				xml += ' title="' + ui.cmn.text.xml.encode(item.description) + '"';
				xml += ' description="' + ui.cmn.text.xml.encode(item.description) + '"';
				xml += ' contact="' + ui.cmn.text.xml.encode(item.contact) + '"';
				xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
				xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
				xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"'; 
				xml += ' appStateTypeId="' + item.appStateTypeId + '"'; 
				xml += ' postalCode="' + ui.cmn.text.xml.encode(item.postalCode) + '"';
				xml += ' geoCode="' + item.geoCode + '"';
				xml += ' jobType="' + (item.jobType.id ? item.jobType.id : 0) + '"';
				xml += ' invoiceTemplate="' + item.invoiceTemplate + '"';
				xml += ' taxId="' + item.taxId + '"';
				xml += ' overrideSiteTax="' + item.overrideSiteTax + '"';
				xml += ' serviceContract="' + ui.cmn.text.xml.encode(item.serviceContract) + '"';
				xml += ' generalLocationCode="' + ui.cmn.text.xml.encode(item.generalLocationCode) + '"';
				xml += ' active="' + item.active + '"';				
				xml += ' clone="' + (me.status == "clone" ? true : false) + '"';
				if ($("#SearchByHouseCode")[0].checked) 
					xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';		
				xml += ' clientId="1">';
				
				if ($("#SearchByHouseCode")[0].checked) {
					xml += '<houseCodeJob';
					xml += ' id="' + me.houseCodeJobId + '"';
					xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
					xml += ' hirNode="' + parent.fin.appUI.hirNode + '"';				
					xml += ' jobId="' + me.jobId + '"';
					xml += ' active="' + item.active + '"';
					xml += ' clientId="2"';	
					xml += '/>';
				}				
				
				xml += '</job>';
			}	

			return xml;
		},
				
		actionSave: function() {
			var args = ii.args(arguments,{
				item: {type: fin.hcm.job.HouseCodeJob},
				xml: {type: String}
			});
			var me = this;
			var item = args.item;
			var xml = args.xml;

			if (xml == "")
				return;
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
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
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function fin_hcm_job_UserInterface_saveResponse() {
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
				
				if (me.status == "addHouseCodes") {
					me.houseCodesTabNeedUpdate = true;
					me.loadHouseCodes();
				}
				else {
					$(args.xmlNode).find("*").each(function() {

						switch (this.tagName) {
							case "job":

								if (me.status == "new") {
									ii.trace("New Job Added", ii.traceTypes.information, "Info");
									me.jobId = parseInt($(this).attr("id"), 10);
									item.id = me.jobId;
									me.jobsList.push(item);
									me.lastSelectedRowIndex = me.jobsList.length - 1;
									me.jobGrid.setData(me.jobsList);
									me.jobGrid.body.select(me.lastSelectedRowIndex);
								}
								else {
									me.jobsList[me.lastSelectedRowIndex] = item;
									me.jobGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								}

								break;

							case "houseCodeJob":
								
								if (me.status == "removeAssociation") {
									me.houseCodeJobs.splice(me.houseCodeGrid.activeRowIndex, 1);
									me.houseCodeGrid.setData(me.houseCodeJobs);
									if (me.houseCodeJobs.length > 0)
										me.houseCodeGrid.body.select(me.houseCodeJobs.length - 1);
									else
										me.actionClearItem();
								}
								else {
									var id = parseInt($(this).attr("id"), 10);
									
									for (var index = 0; index < me.houseCodeGrid.data.length; index++) {
										if (me.houseCodeGrid.data[index].modified) {
											if (me.houseCodeGrid.data[index].id <= 0)
												me.houseCodeGrid.data[index].id = id;
											me.houseCodeGrid.data[index].modified = false;
											break;
										}
									}
								}	

								break;
						}
					});
				}
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Job: " + $(args.xmlNode).attr("message"));
			}
			
			me.status = "";
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
	$("#popupHouseCode").fadeIn("slow");
}

function disablePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupHouseCode").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = windowWidth - 400;
	var popupHeight = windowHeight - 100;
	
	$("#popupHouseCode").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.hcm.hcmjobUi = new fin.hcm.job.UserInterface();
	fin.hcm.hcmjobUi.resize();
	fin.houseCodeSearchUi = fin.hcm.hcmjobUi;
}
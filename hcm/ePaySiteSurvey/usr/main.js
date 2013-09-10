ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.ePaySiteSurvey.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 ) ;
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.button", 4 );
ii.Style( "fin.cmn.usr.toolbar", 5 );
ii.Style( "fin.cmn.usr.input", 6) ;
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );
ii.Style( "fin.cmn.usr.grid", 9 );

ii.Class({
    Name: "fin.hcm.ePaySiteSurvey.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		 
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.loadCount = 0;
			me.currentWizard = "";
			me.nextWizard = "";
			me.prevWizard = "";
			me.status = "";
			me.action = "";
			me.exportToExcel = false;
			me.mouseOverContex = false;
			me.houseCodeCache = [];
				
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			$(window).bind("resize", me, me.resize);
			$(document).bind("mousedown", me, me.mouseDownProcessor);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\EPay Site Survey";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			me.initialize();

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },

		resize: function() {
			var me = fin.hcmEPaySiteSurveyUi;

		    $("#fragment-1").height($(window).height() - 110);

			if ($(window).width() < 1300)
				$("#DeviceGrid").width(1300);
			else
				$("#DeviceGrid").width($(window).width() - 45);

			me.payCodeGrid.setHeight($(window).height() - 240);
			me.deviceGrid.setHeight($(window).height() - 320);
			me.deviceTypeGrid.setHeight($(window).height() - 170);
		},
		
		mouseDownProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;

			if (!me.mouseOverContext && event.target.id != "DeviceTypeDropImage")
				$("#DeviceTypeClockAssetGrid").hide();
		},
		
		authorizationProcess: function fin_hcm_ePaySiteSurvey_UserInterface_authorizationProcess() {
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
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.loadCount = 4;
				me.state.fetchingData();
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.frequencyTypeStore.fetch("userId:[user]", me.frequencyTypesLoaded, me);	
				me.payCodeTypeStore.fetch("userId:[user],payCodeType:productive", me.payCodeTypesLoaded, me);
				me.ePaySiteSurveyMasterStore.fetch("userId:[user]", me.ePaySiteSurveyMastersLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			me.siteSurveyShow =  me.authorizer.isAuthorized(me.authorizePath + "\\Site Survey");
			me.siteMethodologyShow = me.authorizer.isAuthorized(me.authorizePath + "\\Site Methodology");
			me.clockManagementShow = me.authorizer.isAuthorized(me.authorizePath + "\\Clock Management");
			me.manageDeviceTypeShow = me.authorizer.isAuthorized(me.authorizePath + "\\Manage Device Type");

			if (!me.siteSurveyShow)
				$("#siteSurveyAction").hide();
			if (!me.siteMethodologyShow)
				$("#siteMethodologylAction").hide();
			if (!me.clockManagementShow)
				$("#clockManagementAction").hide();
			if (!me.manageDeviceTypeShow) {
				$("#manageDeviceTypeAction").hide();
				$("#AnchorManageDeviceTypes").hide();				
			}
		},

		sessionLoaded: function fin_hcm_houseCode_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "siteSurveyAction", 
					brief: "Site Survey - Add / Edit / View", 
					title: "Add or Edit or View the site survey information.",
					actionFunction: function() { me.actionSiteSurveyItem(); }
				})
				.addAction({
					id: "siteMethodologylAction", 
					brief: "Site Methodology - Add / Edit / View", 
					title: "Add or Edit or View the site methodology information.",
					actionFunction: function() { me.actionSiteMethodologyItem(); }
				})
				.addAction({
					id: "clockManagementAction", 
					brief: "Clock Management", 
					title: "Add or Edit the current clock assets, assigned and unassigned.",
					actionFunction: function() { me.actionClockManagementItem(); }
				})
				.addAction({
					id: "manageDeviceTypeAction", 
					brief: "Manage Device Types", 
					title: "Add or Edit the device types.",
					actionFunction: function() { me.actionManageDeviceTypeItem("Manage Device Type"); }
				})

			me.anchorNext = new ui.ctl.buttons.Sizeable({
				id: "AnchorNext",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNextItem(); },
				hasHotState: true
			});

			me.anchorPrev = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrev",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Previous&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrevItem(); },
				hasHotState: true
			});

			me.anchorSaveAndSend = new ui.ctl.buttons.Sizeable({
				id: "AnchorSaveAndSend",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save and Send to EPAY&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveAndExportItem(); },
				hasHotState: true
			});

			me.anchorManageDeviceTypes = new ui.ctl.buttons.Sizeable({
				id: "AnchorManageDeviceTypes",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Manage Device Types&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionManageDeviceTypeItem("Clock Management"); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.AnchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});

			me.houseCodeName = new ui.ctl.Input.Text({
		        id: "HouseCodeName",
		        maxLength: 256
		    });
			
			me.address1 = new ui.ctl.Input.Text({
		        id: "Address1",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.address1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.address2 = new ui.ctl.Input.Text({
		        id: "Address2",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.address2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.city = new ui.ctl.Input.Text({
		        id: "City",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.city.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.state = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.state.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
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
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation(function( isFinal, dataMap) {
					
				if (me.zipCode.getValue() == "") 
					return;

				if (ui.cmn.text.validate.postalCode(me.zipCode.getValue()) == false)
					this.setInvalid("Please enter valid postal code. Example 99999 or 99999-9999");
			});

			me.timeZone = new ui.ctl.Input.Text({
		        id: "TimeZone",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.timeZone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.dayLightSavings = new ui.ctl.Input.Check({
		        id: "DayLightSavings",
				changeFunction: function() { me.modified(); }
		    });

			me.managerName = new ui.ctl.Input.Text({
		        id: "ManagerName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.managerName.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.managerPhone = new ui.ctl.Input.Text({
		        id: "ManagerPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.managerPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerPhone.text.value;

					if (enteredText == "") return;

					me.managerPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerPhone.text.value;

					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");					
				});
				
			me.managerCellPhone = new ui.ctl.Input.Text({
		        id: "ManagerCellPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });

			me.managerCellPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerCellPhone.text.value;
					
					if (enteredText == "") return;

					me.managerCellPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerCellPhone.text.value;

					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid cell number. Example: (999) 999-9999");
				});
				
			me.managerEmail = new ui.ctl.Input.Text({
		        id: "ManagerEmail",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.managerEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerEmail.getValue();

					if (enteredText == "") return;

					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
				});
				
			me.managerAlternateEmail = new ui.ctl.Input.Text({
		        id: "ManagerAlternateEmail",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			    
			me.managerAlternateEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerAlternateEmail.getValue();

					if (enteredText == "") return;

					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Alternate Email Address.");
				});
				
			me.alternateContactName = new ui.ctl.Input.Text({
		        id: "AlternateContactName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.alternateContactPhone = new ui.ctl.Input.Text({
		        id: "AlternateContactPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.alternateContactPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.alternateContactPhone.text.value;
					
					if (enteredText == "") return;

					me.alternateContactPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.alternateContactPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");					
				});
				
			me.alternateContactCellPhone = new ui.ctl.Input.Text({
		        id: "AlternateContactCellPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
				
			me.alternateContactCellPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.alternateContactCellPhone.text.value;
					
					if (enteredText == "") return;

					me.alternateContactCellPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.alternateContactCellPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid cell number. Example: (999) 999-9999");
				});
				
			me.alternateContactEmail = new ui.ctl.Input.Text({
		        id: "AlternateContactEmail",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			    
			me.alternateContactEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.alternateContactEmail.getValue();

					if (enteredText == "") return;

					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
				});
				
			me.alternateContactAlternateEmail = new ui.ctl.Input.Text({
		        id: "AlternateContactAlternateEmail",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			    
			me.alternateContactAlternateEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.alternateContactAlternateEmail.getValue();

					if (enteredText == "") return;

					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Alternate Email Address.");
				});	
				
			me.regionalManagerName = new ui.ctl.Input.Text({
		        id: "RegionalManagerName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.regionalManagerName.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.hourlyEmployees = new ui.ctl.Input.Text({
		        id: "HourlyEmployees",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.maximumEmployeesAtShiftChange = new ui.ctl.Input.Text({
		        id: "MaximumEmployeesAtShiftChange",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.maximumEmployeesAtShiftChange.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.maximumEmployeesAtShiftChange.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.payrollFrequency = new ui.ctl.Input.Text({
		        id: "PayrollFrequency",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.buildingsAtFacility = new ui.ctl.Input.Text({
		        id: "BuildingsAtFacility",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.buildingsAtFacility.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.buildingsAtFacility.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.currentRoundingScheme = new ui.ctl.Input.Text({
		        id: "CurrentRoundingScheme",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.currentOvertimePolicy = new ui.ctl.Input.Text({
		        id: "CurrentOvertimePolicy",
		        maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.currentOvertimePolicy.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.shiftDifferentialsComments = $("#ShiftDifferentialsComments")[0];

			$("#ShiftDifferentialsComments").height(50);
			$("#ShiftDifferentialsComments").keypress(function() {
				if (me.shiftDifferentialsComments.value.length > 511) {
					me.shiftDifferentialsComments.value = me.shiftDifferentialsComments.value.substring(0, 512);
					return false;
				}
			});
			$("#ShiftDifferentialsComments").change(function() { me.modified(); });
			
			me.comments = $("#Comments")[0];

			$("#Comments").height(50);
			$("#Comments").keypress(function() {
				if (me.comments.value.length > 511) {
					me.comments.value = me.comments.value.substring(0, 512);
					return false;
				}
			});
			$("#Comments").change(function() { me.modified(); });
			
			me.payCodeGrid = new ui.ctl.Grid({
				id: "PayCodeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemPayCodeSelect(index); }
			});
			
			me.payCodeTitle = new ui.ctl.Input.Text({
		        id: "PayCodeTitle",
		        maxLength: 100, 
				appendToId: "PayCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.payCodeDescription = new ui.ctl.Input.Text({
		        id: "PayCodeDescription",
		        maxLength: 256, 
				appendToId: "PayCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.payCodeGrid.addColumn("brief", "brief", "Brief", "Brief", 70);
			me.payCodeGrid.addColumn("name", "name", "Title", "Title", 300, null, me.payCodeTitle);
			me.payCodeGrid.addColumn("description", "description", "Description", "Description", null, null, me.payCodeDescription);
			me.payCodeGrid.capColumns();
			
			me.ePayGroupType = new ui.ctl.Input.DropDown.Filtered({
		        id: "EPayGroupType",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.ePayGroupType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.ePayGroupType.indexSelected == -1)
						this.setInvalid("Please select the correct EPay Group Type.");
				});
				
			me.reportingFrequency = new ui.ctl.Input.DropDown.Filtered({
		        id: "ReportingFrequency",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
				
			me.reportingFrequency.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.reportingFrequency.indexSelected == -1)
						this.setInvalid("Please select the correct Reporting Frequency.");
				});

			me.firstDayOfReportingPeriod = new ui.ctl.Input.Date({
		        id: "FirstDayOfReportingPeriod",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.firstDayOfReportingPeriod.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					
					var enteredText = me.firstDayOfReportingPeriod.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
			
			me.firstDayOfWeek = new ui.ctl.Input.DropDown.Filtered({
		        id: "FirstDayOfWeek",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
				
			me.firstDayOfWeek.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.firstDayOfWeek.indexSelected == -1)
						this.setInvalid("Please select the correct First Day of Week.");
				});

			me.deviceType = $("#DeviceType")[0];
			me.deviceType.readOnly = true;

//			me.deviceType = new ui.ctl.Input.DropDown.Filtered({
//		        id: "DeviceType",
//				formatFunction: function(type) { return type.name; },
//				changeFunction: function() { me.modified(); }
//		    });
//			
//			me.deviceType.makeEnterTab()
//				.setValidationMaster( me.validator )
//				.addValidation( ui.ctl.Input.Validation.required )
//				.addValidation( function( isFinal, dataMap ) {
//					
//					if (me.deviceType.indexSelected == -1)
//						this.setInvalid("Please select the correct Device Type.");
//					else {
//						if (me.preferredConnectionMethod.indexSelected >= 0) {
//							var valid = true;
//							var preferredConnectionMethod = me.preferredConnectionMethod.data[me.preferredConnectionMethod.indexSelected].name;
//							if (preferredConnectionMethod == "LAN" && !me.deviceType.data[me.deviceType.indexSelected].lan)
//								valid = false;
//							else if (preferredConnectionMethod == "Wi-Fi" && !me.deviceType.data[me.deviceType.indexSelected].wifi)
//								valid = false;
//							else if (preferredConnectionMethod == "Dialup" && !me.deviceType.data[me.deviceType.indexSelected].dialup)
//								valid = false;
//							else if (preferredConnectionMethod == "Cellular" && !me.deviceType.data[me.deviceType.indexSelected].cellular)
//								valid = false;
//							if (!valid)
//								this.setInvalid("Selected device type does not have the preferred connection method available.");
//						}
//					}
//				});
			
			me.preferredConnectionMethod = new ui.ctl.Input.DropDown.Filtered({
		        id: "PreferredConnectionMethod",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.preferredConnectionMethod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.preferredConnectionMethod.indexSelected == -1)
						this.setInvalid("Please select the correct Preferred Connection Method.");
				});
			
			me.dailyRebootTime = new ui.ctl.Input.Text({
		        id: "DailyRebootTime",
		        maxLength: 20,
				changeFunction: function() { me.modified(); }
		    });
			
			me.dailyRebootTime.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.useWorkOrders = new ui.ctl.Input.Check({
		        id: "UseWorkOrders",
				changeFunction: function() { me.modified(); }
		    });
			
			me.taskSelectionMethod = new ui.ctl.Input.DropDown.Filtered({
		        id: "TaskSelectionMethod",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.taskSelectionMethod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.taskSelectionMethod.indexSelected == -1)
						this.setInvalid("Please select the correct Task Selection Method.");
				});
			
			me.accidentFreeQuestions = new ui.ctl.Input.Check({
		        id: "AccidentFreeQuestions",
				changeFunction: function() { me.modified(); }
		    });
			
			me.enableLunchLogic = new ui.ctl.Input.Check({
		        id: "EnableLunchLogic",
				changeFunction: function() { me.modified(); }
		    });
			
			me.fixPunchesOnClock = new ui.ctl.Input.Check({
		        id: "FixPunchesOnClock",
				changeFunction: function() { me.modified(); }
		    });
			
			me.businessAnalyst = new ui.ctl.Input.Text({
		        id: "BusinessAnalyst",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.businessAnalyst.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.reviewDate = new ui.ctl.Input.Date({
		        id: "ReviewDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });
				
			me.reviewDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					
					var enteredText = me.reviewDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.poNumber = new ui.ctl.Input.Text({
		        id: "PONumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.poNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.siteGroup = new ui.ctl.Input.Check({
		        id: "SiteGroup",
				changeFunction: function() { me.modified(); }
		    });
			
			me.siteGroupID = new ui.ctl.Input.Text({
		        id: "SiteGroupID",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.siteGroupID.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.siteGroupName = new ui.ctl.Input.Text({
		        id: "SiteGroupName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.siteGroupName.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.goLiveDate = new ui.ctl.Input.Date({
		        id: "GoLiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });
				
			me.goLiveDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					
					var enteredText = me.goLiveDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.confirmSiteIsLive = new ui.ctl.Input.Check({
		        id: "ConfirmSiteIsLive",
				changeFunction: function() { me.modified(); }
		    });
			
//			me.serialNumber = new ui.ctl.Input.Text({
//		        id: "SerialNumber",
//		        maxLength: 50,
//				changeFunction: function() { me.modified(); }
//		    });
//
//			me.trackingNumber = new ui.ctl.Input.Text({
//		        id: "TrackingNumber",
//		        maxLength: 50,
//				changeFunction: function() { me.modified(); }
//		    });
			
			me.deviceTypeClockAssetGrid = new ui.ctl.Grid({
				id: "DeviceTypeClockAssetGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.deviceTypeClockAssetGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.deviceTypeClockAssetGrid.rows.length - 1;
               	return "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.hcmEPaySiteSurveyUi.actionClickItem(this);\" onchange=\"parent.fin.appUI.modified = true;\" />";
            });
			me.deviceTypeClockAssetGrid.addColumn("deviceType", "deviceType", "Device Type", "Device Type", 90, function( type ) { return type.name; });
			me.deviceTypeClockAssetGrid.addColumn("serialNumber", "serialNumber", "Serial Number", "Serial Number", 120);
			me.deviceTypeClockAssetGrid.addColumn("trackingNumber", "trackingNumber", "Tracking Number", "Tracking Number", null);
			me.deviceTypeClockAssetGrid.capColumns();
			
			me.deviceTypeCMSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceTypeCMSearch",
				formatFunction: function(type) { return type.name; }
		    });
			
			me.deviceTypeCMSearch.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.deviceTypeCMSearch.indexSelected == -1)
						this.setInvalid("Please select the correct Device Type.");
				});
			
			me.deviceStatusCMSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceStatusCMSearch",
				formatFunction: function(type) { return type.name; }
		    });
			
			me.deviceStatusCMSearch.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.deviceStatusCMSearch.indexSelected == -1)
						this.setInvalid("Please select the correct Device Status.");
				});
			
			me.assetTransferStatusCMSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "AssetTransferStatusCMSearch",
				formatFunction: function(type) { return type.name; }
		    });
			
			me.assetTransferStatusCMSearch.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.assetTransferStatusCMSearch.indexSelected == -1)
						this.setInvalid("Please select the correct Asset Transfer Status.");
				});
			
			me.deviceGrid = new ui.ctl.Grid({
				id: "DeviceGrid",
				appendToId: "divForm",
				allowAdds: true,
				selectFunction: function (index) { me.itemDeviceSelect(index); },
				createNewFunction: fin.hcm.ePaySiteSurvey.ClockAsset
			});
			
			me.houseCodeCM = new ui.ctl.Input.Text({
		        id: "HouseCodeCM",
		        maxLength: 16, 
				appendToId: "DeviceGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.houseCodeCM.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					me.houseCodeBlur();
				});

			me.deviceTypeCM = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceTypeCM",
				appendToId: "DeviceGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			 me.deviceTypeCM.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					if ((this.focused || this.touched) && me.deviceTypeCM.indexSelected == -1)
						this.setInvalid("Please select the correct Device Type.");
				});
				
			me.deviceStatusTypeCM = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceStatusTypeCM",
				appendToId: "DeviceGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			 me.deviceStatusTypeCM.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.deviceStatusTypeCM.indexSelected == -1)
						this.setInvalid("Please select the correct Device Status Type.");
				});
				
			me.assetTransferStatusTypeCM = new ui.ctl.Input.DropDown.Filtered({
		        id: "AssetTransferStatusTypeCM",
				appendToId: "DeviceGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			 me.assetTransferStatusTypeCM.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.assetTransferStatusTypeCM.indexSelected == -1)
						this.setInvalid("Please select the correct Asset Transfer Status Type.");
				});
			
			me.serialNumberCM = new ui.ctl.Input.Text({
		        id: "SerialNumberCM",
		        maxLength: 50, 
				appendToId: "DeviceGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.serialNumberCM.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.groupNumberCM = new ui.ctl.Input.Text({
		        id: "GroupNumberCM",
		        maxLength: 50, 
				appendToId: "DeviceGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.groupNameCM = new ui.ctl.Input.Text({
		        id: "GroupNameCM",
		        maxLength: 100, 
				appendToId: "DeviceGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.upsTrackingNumberCM = new ui.ctl.Input.Text({
		        id: "UPSTrackingNumberCM",
		        maxLength: 100, 
				appendToId: "DeviceGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.deviceGrid.addColumn("houseCode", "houseCode", "House Code", "House Code", 100, null, me.houseCodeCM);
			me.deviceGrid.addColumn("deviceType", "deviceType", "Device Type", "Device Type", 150, function( type ) { return type.name; }, me.deviceTypeCM);
			me.deviceGrid.addColumn("deviceStatusType", "deviceStatusType", "Device Status", "Device Status", 150, function( type ) { return type.name; }, me.deviceStatusTypeCM);
			me.deviceGrid.addColumn("assetTransferStatusType", "assetTransferStatusType", "Asset Transfer Status", "Asset Transfer Status", 170, function( type ) { return type.name; }, me.assetTransferStatusTypeCM);
			me.deviceGrid.addColumn("serialNumber", "serialNumber", "Serial Number", "Serial Number", 150, null, me.serialNumberCM);
			me.deviceGrid.addColumn("groupNumber", "groupNumber", "Group Number", "Group Number", 150, null, me.groupNumberCM);
			me.deviceGrid.addColumn("groupName", "groupName", "Group Name", "Group Name", null, null, me.groupNameCM);
			me.deviceGrid.addColumn("upsTrackingNumber", "upsTrackingNumber", "UPS Tracking Number", "UPS Tracking Number", 160, null, me.upsTrackingNumberCM);
			me.deviceGrid.capColumns();
			
			me.deviceTypeGrid = new ui.ctl.Grid({
				id: "DeviceTypeGrid",
				appendToId: "divForm",
				allowAdds: true,
				selectFunction: function( index ) { me.itemSelect(index); },
				preDeactivateFunction: function( ) { if (me.deviceTypeTitle.getValue() == "") return false; else return true; },
				deselectFunction: function() { me.itemDeSelect(); },
				createNewFunction: fin.hcm.ePaySiteSurvey.DeviceType
			});
			
			me.deviceTypeTitle = new ui.ctl.Input.Text({
		        id: "DeviceTypeTitle",
		        maxLength: 64, 
				appendToId: "DeviceTypeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.deviceTypeTitle.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.lan = new ui.ctl.Input.Check({
		        id: "LAN",
				className: "iiInputCheckDT",
				appendToId: "DeviceTypeGridControlHolder",				
				changeFunction: function() { me.modified(); }				
		    });
			
			me.wifi = new ui.ctl.Input.Check({
		        id: "WiFi",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.dialup = new ui.ctl.Input.Check({
		        id: "Dialup",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.cellular = new ui.ctl.Input.Check({
		        id: "Cellular",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.touchscreen = new ui.ctl.Input.Check({
		        id: "Touchscreen",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.swipeCard = new ui.ctl.Input.Check({
		        id: "SwipeCard",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.trainingVideos = new ui.ctl.Input.Check({
		        id: "TrainingVideos",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckTV",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				appendToId: "DeviceTypeGridControlHolder",
				className: "iiInputCheckDT",			
				changeFunction: function() { me.modified(); }
		    });
			
			me.deviceTypeGrid.addColumn("name", "name", "Device Type", "Device Type", null, null, me.deviceTypeTitle);
			me.deviceTypeGrid.addColumn("lan", "lan", "LAN", "LAN", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.lan);
			me.deviceTypeGrid.addColumn("wifi", "wifi", "Wi-Fi", "Wi-Fi", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.wifi);
			me.deviceTypeGrid.addColumn("dialup", "dialup", "Dialup", "Dialup", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.dialup);
			me.deviceTypeGrid.addColumn("cellular", "cellular", "Cellular", "Cellular", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.cellular);
			me.deviceTypeGrid.addColumn("touchscreen", "touchscreen", "Touchscreen", "Touchscreen", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.touchscreen);
			me.deviceTypeGrid.addColumn("swipeCard", "swipeCard", "Swipe Card", "Swipe Card", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.swipeCard);
			me.deviceTypeGrid.addColumn("trainingVideos", "trainingVideos", "Training Videos", "Training Videos", 120, function(lan) { return (lan == 1 ? "Y" : "N") }, me.trainingVideos);
			me.deviceTypeGrid.addColumn("active", "active", "Active", "Active", 100, function(lan) { return (lan == 1 ? "Y" : "N") }, me.active);			
			me.deviceTypeGrid.capColumns();
			
			$("#houseCodeText")[0].tabIndex = 1;
			me.houseCodeName.text.tabIndex = 2;
			me.address1.text.tabIndex = 3;
			me.address2.text.tabIndex = 4;
			me.city.text.tabIndex = 5;
			me.state.text.tabIndex = 6;
			me.zipCode.text.tabIndex = 7;			
			me.timeZone.text.tabIndex = 8;
			me.dayLightSavings.check.tabIndex = 9;
			me.managerName.text.tabIndex = 10;
			me.managerPhone.text.tabIndex = 10;
			me.managerCellPhone.text.tabIndex = 12;
			me.managerEmail.text.tabIndex = 13;
			me.managerAlternateEmail.text.tabIndex = 14;
			me.alternateContactName.text.tabIndex = 15;
			me.alternateContactPhone.text.tabIndex = 16;
			me.alternateContactCellPhone.text.tabIndex = 17;
			me.alternateContactEmail.text.tabIndex = 18;
			me.alternateContactAlternateEmail.text.tabIndex = 19;
			me.regionalManagerName.text.tabIndex = 20;
			me.hourlyEmployees.text.tabIndex = 21;
			me.maximumEmployeesAtShiftChange.text.tabIndex = 22;
			$("#UnionYes")[0].tabIndex = 23;
			$("#UnionNo")[0].tabIndex = 24;
			me.payrollFrequency.text.tabIndex = 25;
			me.buildingsAtFacility.text.tabIndex = 26;
			me.currentRoundingScheme.text.tabIndex = 27;
			me.currentOvertimePolicy.text.tabIndex = 28;
			$("#KronosYes")[0].tabIndex = 29;
			$("#KronosNo")[0].tabIndex = 30;
			$("#GroupsOfEmployeesWithDifferentPayRulesYes")[0].tabIndex = 31;
			$("#GroupsOfEmployeesWithDifferentPayRulesNo")[0].tabIndex = 32;
			me.shiftDifferentialsComments.tabIndex = 33;
			$("#PhonesAvailableYes")[0].tabIndex = 34;
			$("#PhonesAvailableNo")[0].tabIndex = 35;
			$("#TollFreeYes")[0].tabIndex = 36;
			$("#TollFreeNo")[0].tabIndex = 37;
			me.comments.tabIndex = 38;
			
			me.ePayGroupType.text.tabIndex = 51;
			me.reportingFrequency.text.tabIndex = 52;
			me.firstDayOfReportingPeriod.text.tabIndex = 53;
			me.firstDayOfWeek.text.tabIndex = 54;
			me.deviceType.tabIndex = 55;
			me.preferredConnectionMethod.text.tabIndex = 56;
			me.dailyRebootTime.text.tabIndex = 57;
			me.useWorkOrders.check.tabIndex = 58;
			me.taskSelectionMethod.text.tabIndex = 59;
			me.accidentFreeQuestions.check.tabIndex = 60;
			me.enableLunchLogic.check.tabIndex = 61;
			me.fixPunchesOnClock.check.tabIndex = 62;
			me.businessAnalyst.text.tabIndex = 63;
			me.reviewDate.text.tabIndex = 64;
			me.poNumber.text.tabIndex = 65;
			me.siteGroup.check.tabIndex = 66;
			me.siteGroupID.text.tabIndex = 67;
			me.siteGroupName.text.tabIndex = 68;
			me.goLiveDate.text.tabIndex = 69;
			me.confirmSiteIsLive.check.tabIndex = 70;
			//me.serialNumber.text.tabIndex = 71;
			//me.trackingNumber.text.tabIndex = 72;
			
			$("#HouseCode")[0].tabIndex = 81;
			$("#DeviceInfo")[0].tabIndex = 82;
			$("#houseCodeTemplateText")[0].tabIndex = 83;
			me.deviceTypeCMSearch.text.tabIndex = 84;
			me.deviceStatusCMSearch.text.tabIndex = 85;
			me.assetTransferStatusCMSearch.text.tabIndex = 86;

			me.houseCodeName.text.readOnly = true;
			me.hourlyEmployees.text.readOnly = true;
			$("#UnionYes")[0].disabled = true;
			$("#UnionNo")[0].disabled = true;
			me.payrollFrequency.text.readOnly = true;
			//me.serialNumber.text.readOnly = true;
			//me.trackingNumber.text.readOnly = true;
		},

		configureCommunications: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.ePaySiteSurvey.HirNode,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.ePaySiteSurvey.HouseCode,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.houseCodeArgs,
				injectionArray: me.houseCodes
			});
						
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.StateType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.frequencyTypes = [];
			me.frequencyTypeStore = me.cache.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.FrequencyType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.frequencyTypeArgs,
				injectionArray: me.frequencyTypes
			});

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.hcm.ePaySiteSurvey.PayCodeType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});
			
			me.ePayGroupTypes = [];
			me.ePaySiteSurveyMasterStore = me.cache.register({
				storeId: "ePaySiteSurveyMasters",	//ePayGroupTypes
				itemConstructor: fin.hcm.ePaySiteSurvey.EPayGroupType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});
			
			me.reportingFrequencyTypes = [];
			me.reportingFrequencyTypeStore = me.cache.register({
				storeId: "reportingFrequencyTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.ReportingFrequencyType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.reportingFrequencyTypeArgs,
				injectionArray: me.reportingFrequencyTypes
			});
			
			me.preferredConnectionMethods = [];
			me.preferredConnectionMethodStore = me.cache.register({
				storeId: "preferredConnectionMethods",
				itemConstructor: fin.hcm.ePaySiteSurvey.PreferredConnectionMethod,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.preferredConnectionMethodArgs,
				injectionArray: me.preferredConnectionMethods
			});
			
			me.taskSelectionMethods = [];
			me.taskSelectionMethodStore = me.cache.register({
				storeId: "taskSelectionMethods",
				itemConstructor: fin.hcm.ePaySiteSurvey.TaskSelectionMethod,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.taskSelectionMethodArgs,
				injectionArray: me.taskSelectionMethods
			});
			
			me.deviceStatusTypes = [];
			me.deviceStatusTypeStore = me.cache.register({
				storeId: "deviceStatusTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.DeviceStatusType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.deviceStatusTypeArgs,
				injectionArray: me.deviceStatusTypes
			});
			
			me.assetTransferStatusTypes = [];
			me.assetTransferStatusTypeStore = me.cache.register({
				storeId: "assetTransferStatusTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.AssetTransferStatusType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.assetTransferStatusTypeArgs,
				injectionArray: me.assetTransferStatusTypes
			});
			
			me.deviceTypes = [];
			me.deviceTypeStore = me.cache.register({
				storeId: "deviceTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.DeviceType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.deviceTypeArgs,
				injectionArray: me.deviceTypes
			});
			
			me.clockAssets = [];
			me.clockAssetStore = me.cache.register({
				storeId: "clockAssets",
				itemConstructor: fin.hcm.ePaySiteSurvey.ClockAsset,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.clockAssetArgs,
				injectionArray: me.clockAssets,
				lookupSpec: { deviceType: me.deviceTypes, deviceStatusType: me.deviceStatusTypes, assetTransferStatusType: me.assetTransferStatusTypes }
			});
			
			me.siteDetails = [];
			me.siteDetailStore = me.cache.register({
				storeId: "ePaySiteSurveys",
				itemConstructor: fin.hcm.ePaySiteSurvey.SiteDetail,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.siteDetailArgs,
				injectionArray: me.siteDetails
			});
			
			me.ePaySiteSurveyPayCodes = [];
			me.ePaySiteSurveyPayCodeStore = me.cache.register({
				storeId: "ePaySiteSurveyPayCodes",
				itemConstructor: fin.hcm.ePaySiteSurvey.EPaySiteSurveyPayCode,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.ePaySiteSurveyPayCodeArgs,
				injectionArray: me.ePaySiteSurveyPayCodes
			});
			
			me.ePaySiteSurveyClockAssets = [];
			me.ePaySiteSurveyClockAssetStore = me.cache.register({
				storeId: "ePaySiteSurveyClockAssets",
				itemConstructor: fin.hcm.ePaySiteSurvey.EPaySiteSurveyClockAsset,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.ePaySiteSurveyClockAssetArgs,
				injectionArray: me.ePaySiteSurveyClockAssets,
				lookupSpec: { deviceType: me.deviceTypes }
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
				storeId: "hcmFileNames",
				itemConstructor: fin.hcm.ePaySiteSurvey.FileName,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.fileNameArgs,
				injectionArray: me.fileNames
			});
		},
		
		initialize: function() {
			var me = this;
			
			$("input[name='Union']").change(function() { me.modified(true); });
			$("input[name='Kronos']").change(function() { me.modified(true); });
			$("input[name='GroupsOfEmployeesWithDifferentPayRules']").change(function() { me.modified(true); });
			$("input[name='PhonesAvailable']").change(function() { me.modified(true); });
			$("input[name='TollFree']").change(function() { me.modified(true); });

			$("a").click(function() {
				if (this.id.indexOf("edit") >= 0) {
					me.currentWizard = this.id.replace("edit", "");
					me.actionShowWizard();
					me.checkWizardSecurity();
				}
			});
			
			$("#DeviceTypeClockAssetGrid").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
					
			$("#DeviceTypeDropImage").mousedown(function() {
				if ($("#DeviceTypeClockAssetGrid").is(':visible')) {
					$("#DeviceTypeClockAssetGrid").hide();
					return;
				}
				
				me.showDeviceTypeGrid();
			});
			$("#fragment-1").bind("scroll", me.pageScroll);
		},
		
		showDeviceTypeGrid: function() {			
			var me = this;
			var pos = $("#DeviceTypeContainer").offset();
			var parentElementHeight = $("#DeviceTypeContainer").outerHeight();

			$("#DeviceTypeClockAssetGrid").css({
				left: pos.left + 'px'
				, top: pos.top + parentElementHeight + 'px'
			});

			$("#DeviceTypeClockAssetGrid").show();
			me.deviceTypeClockAssetGrid.setHeight(200);
		},
		
		pageScroll: function() {
			var pos = $("#DeviceTypeContainer").offset();
			var parentElementHeight = $("#DeviceTypeContainer").outerHeight();

			$("#DeviceTypeClockAssetGrid").css({
				left: pos.left + 'px'
				, top: pos.top + parentElementHeight + 'px'
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
		
		resizeControls: function() {
			var me = this;
			
			me.houseCodeName.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.city.resizeText();
			me.zipCode.resizeText();
			me.state.resizeText();
			me.timeZone.resizeText();
			me.managerName.resizeText();
			me.managerPhone.resizeText();
			me.managerCellPhone.resizeText();
			me.managerEmail.resizeText();
			me.managerAlternateEmail.resizeText();
			me.alternateContactName.resizeText();
			me.alternateContactPhone.resizeText();
			me.alternateContactCellPhone.resizeText();
			me.alternateContactEmail.resizeText();
			me.alternateContactAlternateEmail.resizeText();
			me.regionalManagerName.resizeText();
			me.hourlyEmployees.resizeText();
			me.maximumEmployeesAtShiftChange.resizeText();
			me.payrollFrequency.resizeText();
			me.buildingsAtFacility.resizeText();
			me.currentRoundingScheme.resizeText();
			me.currentOvertimePolicy.resizeText();
			me.ePayGroupType.resizeText();
			me.reportingFrequency.resizeText();
			me.firstDayOfReportingPeriod.resizeText();
			me.firstDayOfWeek.resizeText();
			//me.deviceType.resizeText();
			me.preferredConnectionMethod.resizeText();
			me.dailyRebootTime.resizeText();
			me.taskSelectionMethod.resizeText();
			me.businessAnalyst.resizeText();
			me.reviewDate.resizeText();
			me.poNumber.resizeText();
			me.siteGroupID.resizeText();
			me.siteGroupName.resizeText();
			me.goLiveDate.resizeText();
			//me.serialNumber.resizeText();
			//me.trackingNumber.resizeText();

			me.resize();
		},
		
		setReadOnly: function(readOnly) {
			var me = this;

			me.address1.text.readOnly = readOnly;
			me.address2.text.readOnly = readOnly;
			me.city.text.readOnly = readOnly;
			me.zipCode.text.readOnly = readOnly;
			me.state.text.readOnly = readOnly;
			me.timeZone.text.readOnly = readOnly;
			me.dayLightSavings.check.disabled = readOnly;
			me.managerName.text.readOnly = readOnly;
			me.managerPhone.text.readOnly = readOnly;
			me.managerCellPhone.text.readOnly = readOnly;
			me.managerEmail.text.readOnly = readOnly;
			me.managerAlternateEmail.text.readOnly = readOnly;
			me.alternateContactName.text.readOnly = readOnly;
			me.alternateContactPhone.text.readOnly = readOnly;
			me.alternateContactCellPhone.text.readOnly = readOnly;
			me.alternateContactEmail.text.readOnly = readOnly;
			me.alternateContactAlternateEmail.text.readOnly = readOnly;
			me.regionalManagerName.text.readOnly = readOnly;			
			me.maximumEmployeesAtShiftChange.text.readOnly = readOnly;			
			me.buildingsAtFacility.text.readOnly = readOnly;
			me.currentRoundingScheme.text.readOnly = readOnly;
			me.currentOvertimePolicy.text.readOnly = readOnly;
			$("#KronosYes")[0].disabled = readOnly;
			$("#KronosNo")[0].disabled = readOnly;
			$("#GroupsOfEmployeesWithDifferentPayRulesYes")[0].disabled = readOnly;
			$("#GroupsOfEmployeesWithDifferentPayRulesNo")[0].disabled = readOnly;
			me.shiftDifferentialsComments.readOnly = readOnly;
			$("#PhonesAvailableYes")[0].disabled = readOnly;
			$("#PhonesAvailableNo")[0].disabled = readOnly;
			$("#TollFreeYes")[0].disabled = readOnly;
			$("#TollFreeNo")[0].disabled = readOnly;
			//me.comments.readOnly = readOnly;
			/*
			me.ePayGroupType.text.readOnly = readOnly;
			me.reportingFrequency.text.readOnly = readOnly;
			me.firstDayOfReportingPeriod.text.readOnly = readOnly;
			me.firstDayOfWeek.text.readOnly = readOnly;
			me.deviceType.text.readOnly = readOnly;
			me.preferredConnectionMethod.text.readOnly = readOnly;
			me.dailyRebootTime.text.readOnly = readOnly;
			me.useWorkOrders.check.disabled = readOnly;
			me.taskSelectionMethod.text.readOnly = readOnly;
			me.accidentFreeQuestions.check.disabled = readOnly;
			me.enableLunchLogic.check.disabled = readOnly;
			me.fixPunchesOnClock.check.disabled = readOnly;
			me.businessAnalyst.text.readOnly = readOnly;
			me.reviewDate.text.readOnly = readOnly;
			me.poNumber.text.readOnly = readOnly;
			me.siteGroup.check.disabled = readOnly;
			me.siteGroupID.text.readOnly = readOnly;
			me.siteGroupName.text.readOnly = readOnly;
			me.goLiveDate.text.readOnly = readOnly;
			me.confirmSiteIsLive.check.tabIndex = 70;
			me.serialNumber.text.readOnly = readOnly;
			me.trackingNumber.text.readOnly = readOnly;
			*/
			if (readOnly) {
				$("#StateAction").removeClass("iiInputAction");
			}
			else {
				$("#StateAction").addClass("iiInputAction");
			}
		},	
		
		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.checkLoadCount();
			me.houseCodeChanged();
		},
		
		frequencyTypesLoaded: function(me, activeId) {

			me.checkLoadCount();
		},
		
		payCodeTypesLoaded: function(me, activeId) {

			me.checkLoadCount();
		},
		
		ePaySiteSurveyMastersLoaded: function(me, activeId) {

			me.weekDays = [];
			
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Sunday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Monday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Tuesday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Wednesday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Thursday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Friday"}));
			me.weekDays.push(new fin.hcm.ePaySiteSurvey.WeekDay({ id: 1, name: "Saturday"}));
			
			me.deviceTypeCM.setData(me.deviceTypes);
			me.deviceStatusTypeCM.setData(me.deviceStatusTypes);			
			me.assetTransferStatusTypeCM.setData(me.assetTransferStatusTypes);
			
			me.deviceTypesTemp = me.deviceTypes.slice();
			me.deviceStatusTypesTemp = me.deviceStatusTypes.slice();
			me.assetTransferStatusTypesTemp = me.assetTransferStatusTypes.slice();
			
			me.deviceTypesTemp.unshift(new fin.hcm.ePaySiteSurvey.DeviceType({ id: 0, name: "[ALL]"}));
			me.deviceStatusTypesTemp.unshift(new fin.hcm.ePaySiteSurvey.DeviceStatusType({ id: 0, name: "[ALL]"}));
			me.assetTransferStatusTypesTemp.unshift(new fin.hcm.ePaySiteSurvey.AssetTransferStatusType({ id: 0, name: "[ALL]"}));
			
			me.deviceTypeCMSearch.setData(me.deviceTypesTemp);
			me.deviceStatusCMSearch.setData(me.deviceStatusTypesTemp);
			me.assetTransferStatusCMSearch.setData(me.assetTransferStatusTypesTemp);
			me.ePayGroupType.setData(me.ePayGroupTypes);
			
			me.reportingFrequency.setData(me.reportingFrequencyTypes);
			me.firstDayOfWeek.setData(me.weekDays);
			//me.deviceType.setData(me.deviceTypes);
			me.preferredConnectionMethod.setData(me.preferredConnectionMethods);
			me.taskSelectionMethod.setData(me.taskSelectionMethods);

			me.deviceTypeCMSearch.select(0, me.deviceTypeCMSearch.focused);
			me.deviceStatusCMSearch.select(0, me.deviceStatusCMSearch.focused);
			me.assetTransferStatusCMSearch.select(0, me.assetTransferStatusCMSearch.focused);
						
			me.resizeControls();
			me.checkLoadCount();
		},
		
		loadDeviceTypes: function() {
			var me = this;

			if (me.deviceTypeTitle.getValue() == "") 
				return false;
			
			if (me.deviceTypeGrid.activeRowIndex >= 0)
				me.deviceTypeGrid.body.deselect(me.deviceTypeGrid.activeRowIndex, true);
				
			me.setLoadCount();
			me.deviceTypeStore.reset();
			me.deviceTypeStore.fetch("userId:[user]", me.deviceTypesLoaded, me);
		},
		
		deviceTypesLoaded: function(me, activeId) {
			
			me.deviceTypeGrid.setData(me.deviceTypes);
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
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (parent.fin.appUI.houseCodeId <= 0) return;

			me.siteDetailStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.siteDetailsLoaded, me);
		},
		
		siteDetailsLoaded: function(me, activeId) {

 			if (me.siteDetails[0] == undefined) {
				alert("Error: Selected House code is not setup correctly. Please review.");
				return false;
			}

			me.ePaySiteSurveyPayCodeStore.fetch("userId:[user],id:" + me.siteDetails[0].id, me.ePaySiteSurveyPayCodesLoaded, me);
			me.setSiteSurveyDetails();
			if (me.action == "" || me.action == "SiteSurvey")
				me.ePaySiteSurvey();
			else
				me.actionSiteMethodologyItem();
		},
		
		setSiteSurveyDetails: function() {
			var me = this;
			var index = 0;
			
			me.state.reset();
			me.ePayGroupType.reset();
			me.reportingFrequency.reset();
			me.firstDayOfWeek.reset();
			//me.deviceType.reset();
			me.preferredConnectionMethod.reset();
			me.taskSelectionMethod.reset();
			me.reportingFrequency.reset();
			me.reportingFrequency.reset();
			
			me.houseCodeName.setValue(parent.fin.appUI.houseCodeTitle);
			me.address1.setValue(me.siteDetails[0].address1);
			me.address2.setValue(me.siteDetails[0].address2);
			me.city.setValue(me.siteDetails[0].city);
			index = ii.ajax.util.findIndexById(me.siteDetails[0].state.toString(), me.stateTypes);
			if (index != undefined) 
				me.state.select(index, me.state.focused);
			me.zipCode.setValue(me.siteDetails[0].zipCode);
			me.timeZone.setValue(me.siteDetails[0].timeZone);
			me.dayLightSavings.setValue(me.siteDetails[0].dayLightSavings.toString());
			me.managerName.setValue(me.siteDetails[0].managerName);
			me.managerPhone.setValue(me.siteDetails[0].managerPhone);
			me.managerCellPhone.setValue(me.siteDetails[0].managerCellPhone);
			me.managerEmail.setValue(me.siteDetails[0].managerEmail);
			me.managerAlternateEmail.setValue(me.siteDetails[0].managerAlternateEmail);			
			me.alternateContactName.setValue(me.siteDetails[0].alternateContactName);
			me.alternateContactPhone.setValue(me.siteDetails[0].alternateContactPhone);
			me.alternateContactCellPhone.setValue(me.siteDetails[0].alternateContactCellPhone);
			me.alternateContactEmail.setValue(me.siteDetails[0].alternateContactEmail);
			me.alternateContactAlternateEmail.setValue(me.siteDetails[0].alternateContactAlternateEmail);
			me.regionalManagerName.setValue(me.siteDetails[0].regionalManagerName);
			me.hourlyEmployees.setValue(me.siteDetails[0].hourlyEmployees);
			me.maximumEmployeesAtShiftChange.setValue(me.siteDetails[0].maximumEmployeesAtShiftChange);
			$("input[name='Union'][value='" + me.siteDetails[0].union + "']").attr("checked", "checked");
			index = ii.ajax.util.findIndexById(me.siteDetails[0].payFrequencyType.toString(), me.frequencyTypes);
			if (index != undefined) 
				me.payrollFrequency.setValue(me.frequencyTypes[index].title);			
			me.buildingsAtFacility.setValue(me.siteDetails[0].buildingsAtFacility);
			me.currentRoundingScheme.setValue(me.siteDetails[0].currentRoundingScheme);
			me.currentOvertimePolicy.setValue(me.siteDetails[0].currentOvertimePolicy);
			$("input[name='Kronos'][value='" + me.siteDetails[0].kronos + "']").attr("checked", "checked"); 
			$("input[name='GroupsOfEmployeesWithDifferentPayRules'][value='" + me.siteDetails[0].groupsOfEmployeesWithDifferentPayRules + "']").attr("checked", "checked"); 
			me.shiftDifferentialsComments.value = me.siteDetails[0].shiftDifferentialsComments;
			$("input[name='PhonesAvailable'][value='" + me.siteDetails[0].phonesAvailable + "']").attr("checked", "checked"); 
			$("input[name='TollFree'][value='" + me.siteDetails[0].tollFree + "']").attr("checked", "checked"); 
			me.comments.value = me.siteDetails[0].comments;

			if (me.siteDetails[0].id == 0 || me.siteDetails[0].ePayGroupType == 0) {
				index = me.findIndexByTitle("STD OT 1/10 HR Rounding", me.ePayGroupTypes);
				if (index != null) 
					me.ePayGroupType.select(index, me.ePayGroupType.focused);
					
				index = me.findIndexByTitle("Bi-Weekly", me.reportingFrequencyTypes);
				if (index != null) 
					me.reportingFrequency.select(index, me.reportingFrequency.focused);
					
				index = me.findIndexByTitle("Sunday", me.weekDays);
				if (index != null) 
					me.firstDayOfWeek.select(index, me.firstDayOfWeek.focused);
					
//				index = me.findIndexByTitle("T6", me.deviceTypes);
//				if (index != null) 
//					me.deviceType.select(index, me.deviceType.focused);
					
				index = me.findIndexByTitle("LAN", me.preferredConnectionMethods);
				if (index != null) 
					me.preferredConnectionMethod.select(index, me.preferredConnectionMethod.focused);
					
				index = me.findIndexByTitle("Normal", me.taskSelectionMethods);
				if (index != null) 
					me.taskSelectionMethod.select(index, me.taskSelectionMethod.focused);

				me.firstDayOfReportingPeriod.setValue("");
				me.reviewDate.setValue("");
				me.goLiveDate.setValue("");
				me.dailyRebootTime.setValue("03:00:00 AM");				
			}				
			else {
				index = ii.ajax.util.findIndexById(me.siteDetails[0].ePayGroupType.toString(), me.ePayGroupTypes);
				if (index != undefined) 
					me.ePayGroupType.select(index, me.ePayGroupType.focused);
					
				index = ii.ajax.util.findIndexById(me.siteDetails[0].reportingFrequencyType.toString(), me.reportingFrequencyTypes);
				if (index != undefined) 
					me.reportingFrequency.select(index, me.reportingFrequency.focused);
					
				index = me.findIndexByTitle(me.siteDetails[0].firstDayOfWeek, me.weekDays);
				if (index != undefined) 
					me.firstDayOfWeek.select(index, me.firstDayOfWeek.focused);
					
//				index = ii.ajax.util.findIndexById(me.siteDetails[0].clockAsset.toString(), me.deviceTypes);
//				if (index != undefined) 
//					me.deviceType.select(index, me.deviceType.focused);
				
				index = ii.ajax.util.findIndexById(me.siteDetails[0].preferredConnectionMethod.toString(), me.preferredConnectionMethods);
				if (index != undefined) 
					me.preferredConnectionMethod.select(index, me.preferredConnectionMethod.focused);
					
				index = ii.ajax.util.findIndexById(me.siteDetails[0].taskSelectionMethod.toString(), me.taskSelectionMethods);
				if (index != undefined) 
					me.taskSelectionMethod.select(index, me.taskSelectionMethod.focused);
					
				me.firstDayOfReportingPeriod.setValue(me.siteDetails[0].firstDayOfReportingPeriod);
				me.reviewDate.setValue(me.siteDetails[0].reviewDate);
				me.goLiveDate.setValue(me.siteDetails[0].goLiveDate);
				me.dailyRebootTime.setValue(me.siteDetails[0].dailyRebootTime);
			}
			
			me.useWorkOrders.setValue(me.siteDetails[0].useWorkOrders.toString());
			me.accidentFreeQuestions.setValue(me.siteDetails[0].accidentFreeQuestions.toString());
			me.enableLunchLogic.setValue(me.siteDetails[0].enableLunchLogic.toString());
			me.fixPunchesOnClock.setValue(me.siteDetails[0].fixPunchesOnClock.toString());
			me.businessAnalyst.setValue(me.siteDetails[0].businessAnalyst);
			me.poNumber.setValue(me.siteDetails[0].poNumber);
			me.siteGroup.setValue(me.siteDetails[0].siteGroup.toString());
			me.siteGroupID.setValue(me.siteDetails[0].siteGroupID);
			me.siteGroupName.setValue(me.siteDetails[0].siteGroupName);
			me.confirmSiteIsLive.setValue(me.siteDetails[0].confirmSiteIsLive.toString());
		},
		
		ePaySiteSurveyPayCodesLoaded: function(me, activeId) {

			for (var index = 0; index < me.payCodeTypes.length; index++) {
				var found = false;

				for (var iIndex = 0; iIndex < me.ePaySiteSurveyPayCodes.length; iIndex++) {
					if (me.payCodeTypes[index].id == me.ePaySiteSurveyPayCodes[iIndex].payCode) {
						found = true;
						me.ePaySiteSurveyPayCodes[iIndex].brief = me.payCodeTypes[index].brief;
						me.ePaySiteSurveyPayCodes[iIndex].name = me.payCodeTypes[index].name;
						break;
					}
				}

				if (!found) {
					var item = new fin.hcm.ePaySiteSurvey.EPaySiteSurveyPayCode({
						id: 0
						, ePaySiteSurvey: me.siteDetails[0].id
						, payCode: me.payCodeTypes[index].id
						, brief: me.payCodeTypes[index].brief
						, name: me.payCodeTypes[index].name
					});
					me.ePaySiteSurveyPayCodes.push(item);
				}
			}
		},
		
		ePaySiteSurveyClockAssetsLoaded: function(me, activeId) {
			
			var clockAssetsTemp = [];

			for (var index = 0; index < me.clockAssets.length; index++) {
				var found = false;
				for (var iIndex = 0; iIndex < me.ePaySiteSurveyClockAssets.length; iIndex++) {
					if (me.clockAssets[index].id == me.ePaySiteSurveyClockAssets[iIndex].clockAsset) {
						found = true;
						me.ePaySiteSurveyClockAssets[iIndex].deviceType = me.clockAssets[index].deviceType;
						me.ePaySiteSurveyClockAssets[iIndex].serialNumber = me.clockAssets[index].serialNumber;
						me.ePaySiteSurveyClockAssets[iIndex].trackingNumber = me.clockAssets[index].upsTrackingNumber;
						me.ePaySiteSurveyClockAssets[iIndex].assigned = true;
						break;
					}
				}
				if (!found) {
					if (me.clockAssets[index].deviceStatusType.name == "Unassigned")
						clockAssetsTemp.push(me.clockAssets[index]);
				}
			}
			
			for (var index = 0; index < clockAssetsTemp.length; index++) {
				var item = new fin.hcm.ePaySiteSurvey.EPaySiteSurveyClockAsset({
						id: 0
						, ePaySiteSurvey: me.siteDetails[0].id
						, clockAsset: clockAssetsTemp[index].id
						, deviceType: clockAssetsTemp[index].deviceType
						, serialNumber: clockAssetsTemp[index].serialNumber
						, trackingNumber: clockAssetsTemp[index].upsTrackingNumber
					});
					me.ePaySiteSurveyClockAssets.push(item);
			}

			me.deviceTypeClockAssetGrid.setData(me.ePaySiteSurveyClockAssets);
			for (var index = 0; index < me.ePaySiteSurveyClockAssets.length; index++) {
				$("#selectInputCheck" + index)[0].checked = me.ePaySiteSurveyClockAssets[index].assigned;
			}
			me.setDeviceTypeTitle();			
		},
		
		setDeviceTypeTitle: function() {
			var me = this;			
			var selectedDeviceTypes = "";

			for (var index = 0; index < me.deviceTypeClockAssetGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					if (selectedDeviceTypes == "")
						selectedDeviceTypes = me.deviceTypeClockAssetGrid.data[index].deviceType.name;
					else
						selectedDeviceTypes += ", " + me.deviceTypeClockAssetGrid.data[index].deviceType.name;
				}
			}

			me.deviceType.value = selectedDeviceTypes;
		},
		
		actionClickItem: function(objCheckBox) {
			var me = this;
			var index = parseInt(objCheckBox.id.replace("selectInputCheck", ""), 10);

			me.deviceTypeClockAssetGrid.data[index].modified = true;
			me.setDeviceTypeTitle();
		},
		
		itemPayCodeSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			me.payCodeGrid.data[index].modified = true;
			me.payCodeTitle.text.readOnly = true;
			if (me.currentWizard == "Review") 
				me.payCodeDescription.text.readOnly = true;
			else 
				me.payCodeDescription.text.readOnly = false;
		},

		itemDeviceSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (me.deviceGrid.data[index] != undefined)
				me.deviceGrid.data[index].modified = true;			
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (me.deviceTypeGrid.data[index] != undefined) {
				me.lastSelectedRowIndex = index;
				me.deviceTypeGrid.data[index].modified = true;
				me.lan.check.checked = me.deviceTypeGrid.data[index].lan;
				me.wifi.check.checked = me.deviceTypeGrid.data[index].wifi;
				me.dialup.check.checked = me.deviceTypeGrid.data[index].dialup;
				me.cellular.check.checked = me.deviceTypeGrid.data[index].cellular;
				me.touchscreen.check.checked = me.deviceTypeGrid.data[index].touchscreen;
				me.swipeCard.check.checked = me.deviceTypeGrid.data[index].swipeCard;
				me.trainingVideos.check.checked = me.deviceTypeGrid.data[index].trainingVideos;
				me.active.check.checked = me.deviceTypeGrid.data[index].active;
			}
		},
		
		itemDeSelect: function() {
			var me = this;

			if (me.lastSelectedRowIndex >= 0) {
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("lan")).text(me.lan.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("wifi")).text(me.wifi.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("dialup")).text(me.dialup.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("cellular")).text(me.cellular.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("touchscreen")).text(me.touchscreen.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("swipeCard")).text(me.swipeCard.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("trainingVideos")).text(me.trainingVideos.check.checked ? "Y" : "N");
				$(me.deviceTypeGrid.rows[me.lastSelectedRowIndex].getElement("active")).text(me.active.check.checked ? "Y" : "N");
			}
		},
		
		ePaySiteSurvey: function() {
			var me = this;

			me.action = "SiteSurvey";
			me.currentWizard = "HouseCode";			
			me.actionShowWizard();
			me.checkWizardSecurity();
		},
	
		checkWizardSecurity: function() {
			var me = this;

			me.prevWizard = "";
			me.nextWizard = "";

			switch (me.currentWizard) {
				case "":
					me.nextWizard = "HouseCode";
					break;

				case "HouseCode":
					me.nextWizard = "Manager";
					break;
					
				case "Manager":
					me.nextWizard = "Employee";
					me.prevWizard = "HouseCode";
					break;
					
				case "Employee":
					me.nextWizard = "PayCode";
					me.prevWizard = "Manager";					
					break;					
					
				case "PayCode":
					me.nextWizard = "Fonen";
					me.prevWizard = "Employee";					
					break;
					
				case "Fonen":					
					me.nextWizard = "Review";
					me.prevWizard = "PayCode";
					break;
					
				case "Review":					
					me.prevWizard = "Fonen";
					break;
			}
			
			if (me.nextWizard == "")
				me.anchorNext.display(ui.cmn.behaviorStates.disabled);
			else
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);

			if (me.prevWizard == "")
				me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
			else
				me.anchorPrev.display(ui.cmn.behaviorStates.enabled);
		},

		actionPrevItem: function() {
			var me = this;
	
			me.currentWizard = me.prevWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},
		
		actionNextItem: function() {
			var me = this;
	
			if (me.currentWizard == "HouseCode") {
				if (!me.address1.validate(true) || !me.address2.validate(true) || !me.city.validate(true) 
					|| !me.state.validate(true) || !me.zipCode.validate(true) || !me.timeZone.validate(true))
					return false;
			}
			else if (me.currentWizard == "Manager") {
				if (!me.managerName.validate(true) || !me.managerPhone.validate(true) || !me.managerCellPhone.validate(true) 
					|| !me.managerEmail.validate(true) || !me.regionalManagerName.validate(true))
					return false;
			}
			else if (me.currentWizard == "Employee") {
				if (!me.buildingsAtFacility.validate(true) || !me.currentOvertimePolicy.validate(true))
					return false;
			}
					
			me.currentWizard = me.nextWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},
		
		actionShowWizard: function() {
			var me = this;

			$("#editHouseCode").hide();
			$("#editManager").hide();
			$("#editEmployee").hide();
			$("#editPayCode").hide();
			$("#editFonen").hide();
			$("#divHouseCode").hide();
			$("#divHouseCodeInfo").hide();
			$("#divManager").hide();
			$("#divEmployee").hide();
			$("#divPayCode").hide();
			$("#divFonen").hide();
			$("#divReview").hide();
			$("#AnchorSave").hide();

			if (me.currentWizard != "Review")
				me.setReadOnly(false);

			switch (me.currentWizard) {
				case "HouseCode":
					$("#divHouseCode").show();
					$("#divHouseCodeInfo").show();
					break;

				case "Manager":
					$("#divManager").show();
					$("#AlternateInfoLeft").show();
					$("#AlternateInfoRight").show();
					break;

				case "Employee":				
					$("#divEmployee").show();
					break;

				case "PayCode":
					$("#divPayCode").show();
					me.payCodeGrid.setData(me.ePaySiteSurveyPayCodes);
					me.payCodeGrid.setHeight($(window).height() - 240);
					break;

				case "Fonen":			
					$("#divFonen").show();
					break;

				case "Review":				
					$("#divHouseCodeInfo").show();
					$("#divManager").show();
					$("#divEmployee").show();
					$("#divPayCode").show();
					$("#divFonen").show();
					$("#divReview").show();					
					$("#editHouseCode").show();
					$("#editManager").show();
					$("#editEmployee").show();
					$("#editPayCode").show();
					$("#editFonen").show();
					$("#AnchorSave").show();
					me.setReadOnly(true);
					break;
			}

			me.resizeControls();
		},

		actionSiteSurveyItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#SiteSurvey").show();
			$("#SiteMethodology").hide();
			$("#ClockManagement").hide();
			$("#ManageDeviceType").hide();

			$("#AnchorPrev").show();
			$("#AnchorNext").show();
			$("#AnchorSaveAndSend").hide();
			$("#AnchorManageDeviceTypes").hide();
			$("#AnchorSave").hide();
			$("#AnchorCancel").hide();

			$("#header").html("Site Survey");
			me.action = "SiteSurvey";
			me.ePaySiteSurvey();
			me.setStatus("Normal");
		},

		actionSiteMethodologyItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.action = "SiteMethodology";
			$("#header").html("Site Methodology");

			if (me.siteDetails[0].id == 0) {
				me.setStatus("Error", "Epay site survey details not available. Please verify.");
				$("#divHouseCodeInfo").hide();
				$("#divManager").hide();
				$("#SiteMethodology").hide();
				$("#AnchorPrev").hide();
				$("#AnchorNext").hide();
				$("#AnchorSaveAndSend").hide();
				$("#AnchorSave").hide();
				$("#AnchorCancel").hide();
				return;
			}
			
			$("#editHouseCode").hide();
			$("#editManager").hide();
			$("#divHouseCode").show();
			$("#divHouseCodeInfo").show();
			$("#divManager").show();
			$("#divEmployee").hide();
			$("#divPayCode").hide();
			$("#divFonen").hide();
			$("#divReview").hide();			
			$("#AlternateInfoLeft").hide();
			$("#AlternateInfoRight").hide();
			
			$("#SiteSurvey").show();
			$("#SiteMethodology").show();
			$("#ClockManagement").hide();
			$("#ManageDeviceType").hide();
			
			$("#AnchorPrev").hide();
			$("#AnchorNext").hide();
			$("#AnchorSaveAndSend").show();
			$("#AnchorManageDeviceTypes").hide();
			$("#AnchorSave").show();
			$("#AnchorCancel").show();
			
			me.setStatus("Normal");
			me.resizeControls();

			me.clockAssetStore.reset();
			me.ePaySiteSurveyClockAssetStore.reset();
			me.clockAssetStore.fetch("userId:[user],houseCodeId:0,deviceType:0,deviceStatusType:0,assetTransferStatusType:0", me.clockAssetsLoaded, me);
			me.ePaySiteSurveyClockAssetStore.fetch("userId:[user],id:" + me.siteDetails[0].id, me.ePaySiteSurveyClockAssetsLoaded, me);
		},
		
		actionClockManagementItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
						
			$("#SiteSurvey").hide();
			$("#SiteMethodology").hide();
			$("#ClockManagement").show();
			$("#ManageDeviceType").hide();			
			$("#AnchorPrev").hide();
			$("#AnchorNext").hide();
			$("#AnchorSaveAndSend").hide();
			$("#AnchorSave").show();
			$("#AnchorCancel").show();			
			if (me.manageDeviceTypeShow) {
				$("#AnchorManageDeviceTypes").show();				
			}
			
			$("#header").html("Clock Management");
			me.deviceGrid.setData(me.clockAssets);
			me.deviceGrid.setHeight($(window).height() - 320);
			
			me.action = "ClockManagement";
			me.setStatus("Normal");
			me.resizeControls();
		},
		
		actionManageDeviceTypeItem: function(status) {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			$("#SiteSurvey").hide();
			$("#SiteMethodology").hide();
			$("#ClockManagement").hide();
			$("#ManageDeviceType").show();
			
			$("#AnchorPrev").hide();
			$("#AnchorNext").hide();
			$("#AnchorSaveAndSend").hide();
			$("#AnchorManageDeviceTypes").hide();
			$("#AnchorSave").show();
			$("#AnchorCancel").show();
			
			$("#header").html("");
			me.deviceTypeGrid.setData(me.deviceTypes);
			me.deviceTypeGrid.setHeight($(window).height() - 170);
			me.action = "ManageDeviceType";
			me.setStatus("Normal");
			me.status = status;
		},
		
		actionSearchItem: function() {
			var me = this;
			var houseCodeId = 0;
			var deviceType = 0;
			var deviceStatusType = 0;
			var assetTransferStatusType = 0;

			if ($("input[name='CMSearch']:checked").val() == "true") {
				houseCodeId = me.houseCodeSearchTemplate.houseCodeIdTemplate;
			}
			else {
				if (me.deviceTypeCMSearch.indexSelected == -1 || me.deviceStatusCMSearch.indexSelected == -1 
					|| me.assetTransferStatusCMSearch.indexSelected == -1)
					return;
				deviceType = me.deviceTypeCMSearch.data[me.deviceTypeCMSearch.indexSelected].id;
				deviceStatusType = me.deviceStatusCMSearch.data[me.deviceStatusCMSearch.indexSelected].id;
				assetTransferStatusType = me.assetTransferStatusCMSearch.data[me.assetTransferStatusCMSearch.indexSelected].id;
			}

			if (me.deviceGrid.activeRowIndex >= 0)
				me.deviceGrid.body.deselect(me.deviceGrid.activeRowIndex, true);

			me.setLoadCount();
			me.clockAssetStore.reset();
			me.clockAssetStore.fetch("userId:[user],houseCodeId:" + houseCodeId
				+ ",deviceType:" + deviceType
				+ ",deviceStatusType:" + deviceStatusType
				+ ",assetTransferStatusType:" + assetTransferStatusType
				, me.clockAssetsLoaded
				, me);
		},

		clockAssetsLoaded: function(me, activeId) {

			for (var index = 0; index < me.clockAssets.length; index++) {
				var houseCode = me.clockAssets[index].houseCode
				if (me.houseCodeCache[houseCode] == undefined) {
					me.houseCodeCache[houseCode] = {};
		    		me.houseCodeCache[houseCode].valid = true;
					me.houseCodeCache[houseCode].loaded = true;
					me.houseCodeCache[houseCode].id = me.clockAssets[index].houseCodeId;
				}
			}

			me.deviceGrid.setData(me.clockAssets);
			me.checkLoadCount();
		},

		houseCodeBlur: function() {
			var me = this;
			var houseCode = me.houseCodeCM.getValue().replace(/[^0-9]/g, "");

			if (houseCode != "")
				me.houseCodeCheck(houseCode);
		},

		houseCodeCheck: function(houseCode) {
			var me = this;

		    if (me.houseCodeCache[houseCode] != undefined) {
	            if (me.houseCodeCache[houseCode].loaded)
	                me.houseCodeValidate(houseCode);
	        }
	        else
	            me.houseCodeLoad(houseCode);
		},

		houseCodeLoad: function(houseCode) {
		    var me = this;

		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
			
			$("#HouseCodeCMText").addClass("Loading");

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/hcm/act/provider.aspx",
                data: "moduleId=hcm&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],appUnitBrief:" + houseCode + ",<criteria>",
 
                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;

		            if ($(xml).find("item").length) {
		                //the house code is valid
		                $(xml).find("item").each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = parseInt($(this).attr("id"), 10);
							me.houseCodeValidate(houseCode);
							$("#HouseCodeCMText").removeClass("Loading");
		                });
		            }
		            else {
		                //the house code is invalid
		                me.houseCodeValidate(houseCode);
		            }
				}
			});
		},
		
		houseCodeValidate: function(houseCode) {
		    var me = this;

		    if (!me.houseCodeCache[houseCode].valid) {
				$("#HouseCodeCMText").removeClass("Loading");
				me.houseCodeCM.setInvalid("The House Code [" + houseCode + "] is not valid.");
				me.deviceGrid.data[me.deviceGrid.activeRowIndex].houseCodeId = 0;
		    }
			else {
				if (me.deviceGrid.data[me.deviceGrid.activeRowIndex] != undefined)
					me.deviceGrid.data[me.deviceGrid.activeRowIndex].houseCodeId = me.houseCodeCache[houseCode].id;
			}
		},
		
		actionCancelItem: function() {
			var me = this;

			if (me.status == "Clock Management") {
				$("#ManageDeviceType").hide();
				$("#ClockManagement").show();
				if (me.manageDeviceTypeShow) {
					$("#AnchorManageDeviceTypes").show();				
				}
				me.status = "";
			}
			else if (me.status == "Manage Device Type") {
				me.loadDeviceTypes();
			}
			else if (me.status == "" && me.action == "ClockManagement") {
				me.actionSearchItem();
			}
			else if (me.status == "" && me.action == "SiteMethodology") {
				me.setSiteSurveyDetails();
				me.setStatus("Normal");
				$("#houseCodeText").focus();
			}
		},
		
		actionSaveAndExportItem: function() {
			var me = this;

			me.exportToExcel = true;
			me.actionSaveItem();
		},
		
		actionExportToExcelItem: function() {
			var me = this;
			
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],houseCodeId:" + me.siteDetails[0].houseCodeId, me.fileNamesLoaded, me);
		},
		
		fileNamesLoaded: function(me, activeId) {

			$("#pageLoading").fadeOut("slow");
			me.exportToExcel = false;
			
			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.action == "" || parent.fin.appUI.houseCodeId <= 0) {
				alert("House Code information not loaded properly. Please reload.");
				return false;
			}
			
			if (me.action == "SiteSurvey") {
				me.payCodeGrid.body.deselectAll();
			}
			else if (me.action == "SiteMethodology") {					
				me.validator.forceBlur();
				// Check to see if the data entered is valid
				me.validator.queryValidity(true);

				if (!me.address1.valid || !me.address2.valid || !me.city.valid || !me.state.valid || !me.zipCode.valid 
					|| !me.timeZone.valid | !me.managerName.valid || !me.managerPhone.valid || !me.managerCellPhone.valid
					|| !me.ePayGroupType.valid || !me.reportingFrequency.valid || !me.firstDayOfReportingPeriod.valid 
					|| !me.firstDayOfWeek.valid || !me.preferredConnectionMethod.valid 
					|| !me.dailyRebootTime.valid || !me.taskSelectionMethod.valid || !me.businessAnalyst.valid 
					|| !me.reviewDate.valid || !me.poNumber.valid || !me.siteGroupID.valid || !me.siteGroupName.valid 
					|| !me.goLiveDate.valid) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				
				if (me.deviceType.value == "") {
					alert("Please select Device Type.");
					return false;
				}
					
				var preferredConnectionMethod = me.preferredConnectionMethod.data[me.preferredConnectionMethod.indexSelected].name;
				for (var index = 0; index < me.deviceTypeClockAssetGrid.data.length; index++) {
					if ($("#selectInputCheck" + index)[0].checked) {
						if (!((preferredConnectionMethod == "LAN" && me.deviceTypeClockAssetGrid.data[index].deviceType.lan)
							|| (preferredConnectionMethod == "Wi-Fi" && me.deviceTypeClockAssetGrid.data[index].deviceType.wifi)
							|| (preferredConnectionMethod == "Dialup" && me.deviceTypeClockAssetGrid.data[index].deviceType.dialup)
							|| (preferredConnectionMethod == "Cellular" && me.deviceTypeClockAssetGrid.data[index].deviceType.cellular))) {
							alert("Selected device type(s) does not have the preferred connection method available.");
							return false;
						}
					}
				}
			}

			if (me.action == "SiteSurvey" || me.action == "SiteMethodology") {
				item = new fin.hcm.ePaySiteSurvey.SiteDetail(
					me.siteDetails[0].id
					, parent.fin.appUI.houseCodeId
					, me.address1.getValue()
					, me.address2.getValue()
					, me.city.getValue()
					, me.stateTypes[me.state.indexSelected].id
					, me.zipCode.getValue()
					, me.timeZone.getValue()
					, me.dayLightSavings.check.checked
					, me.managerName.getValue()
					, fin.cmn.text.mask.phone(me.managerPhone.getValue(), true)
					, fin.cmn.text.mask.phone(me.managerCellPhone.getValue(), true)
					, me.managerEmail.getValue()
					, me.managerAlternateEmail.getValue()
					, me.alternateContactName.getValue()
					, fin.cmn.text.mask.phone(me.alternateContactPhone.getValue(), true)
					, fin.cmn.text.mask.phone(me.alternateContactCellPhone.getValue(), true)
					, me.alternateContactEmail.getValue()
					, me.alternateContactAlternateEmail.getValue()
					, me.regionalManagerName.getValue()				
					, me.hourlyEmployees.getValue()
					, me.maximumEmployeesAtShiftChange.getValue()
					, $("input[name='Union']:checked").val() == "true" ? true : false
					, me.siteDetails[0].payFrequencyType
					, me.buildingsAtFacility.getValue()
					, me.currentRoundingScheme.getValue()
					, me.currentOvertimePolicy.getValue()
					, $("input[name='Kronos']:checked").val() == "true" ? true : false
					, $("input[name='GroupsOfEmployeesWithDifferentPayRules']:checked").val() == "true" ? true : false
					, me.shiftDifferentialsComments.value
					, $("input[name='PhonesAvailable']:checked").val() == "true" ? true : false
					, $("input[name='TollFree']:checked").val() == "true" ? true : false
					, me.comments.value
					, me.ePayGroupTypes[me.ePayGroupType.indexSelected].id
					, me.reportingFrequencyTypes[me.reportingFrequency.indexSelected].id
					, me.firstDayOfReportingPeriod.lastBlurValue
					, me.firstDayOfWeek.lastBlurValue
					, me.preferredConnectionMethods[me.preferredConnectionMethod.indexSelected].id
					, me.dailyRebootTime.getValue()
					, me.useWorkOrders.check.checked				
					, me.taskSelectionMethods[me.taskSelectionMethod.indexSelected].id
					, me.accidentFreeQuestions.check.checked
					, me.enableLunchLogic.check.checked
					, me.fixPunchesOnClock.check.checked
					, me.businessAnalyst.getValue()
					, me.reviewDate.lastBlurValue
					, me.poNumber.getValue()
					, me.siteGroup.check.checked
					, me.siteGroupID.getValue()
					, me.siteGroupName.getValue()
					, me.goLiveDate.lastBlurValue
					, me.confirmSiteIsLive.check.checked
					, me.siteDetails[0].exported
				);
			}
			else if (me.action == "ClockManagement") {
				me.deviceGrid.body.deselectAll();
				me.validator.forceBlur();

				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true) && me.deviceGrid.activeRowIndex >= 0) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				
				var item = new fin.hcm.ePaySiteSurvey.SiteDetail({ id: 0, houseCodeId: 0});
			}
			else if (me.action == "ManageDeviceType") {
				me.deviceTypeGrid.body.deselectAll();
				me.validator.forceBlur();
				
				if (!me.validator.queryValidity(true) && me.deviceTypeGrid.activeRowIndex >= 0) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				
				var item = new fin.hcm.ePaySiteSurvey.SiteDetail({ id: 0, houseCodeId: 0});
			}
				
			var xml = me.saveXmlBuild(item);

			if (xml == "")
				return false;

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
		
		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.ePaySiteSurvey.SiteDetail}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.action == "SiteSurvey" || me.action == "SiteMethodology") {
				xml += '<ePaySiteSurvey';
				xml += ' id="' + item.id + '"';
				xml += ' houseCodeId="' + item.houseCodeId + '"';
				xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
				xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
				xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
				xml += ' stateType="' + item.state + '"';
				xml += ' zipCode="' + item.zipCode + '"';
				xml += ' timeZone="' + ui.cmn.text.xml.encode(item.timeZone) + '"';
				xml += ' dayLightSavings="' + item.dayLightSavings + '"';
				xml += ' managerName="' + ui.cmn.text.xml.encode(item.managerName) + '"';
				xml += ' managerPhone="' + item.managerPhone + '"';
				xml += ' managerCellPhone="' + item.managerCellPhone + '"';
				xml += ' managerEmail="' + ui.cmn.text.xml.encode(item.managerEmail) + '"';
				xml += ' managerAlternateEmail="' + ui.cmn.text.xml.encode(item.managerAlternateEmail) + '"';
				xml += ' alternateContactName="' + ui.cmn.text.xml.encode(item.alternateContactName) + '"';
				xml += ' alternateContactPhone="' + item.alternateContactPhone + '"';
				xml += ' alternateContactCellPhone="' + item.alternateContactCellPhone + '"';
				xml += ' alternateContactEmail="' + ui.cmn.text.xml.encode(item.alternateContactEmail) + '"';
				xml += ' alternateContactAlternateEmail="' + ui.cmn.text.xml.encode(item.alternateContactAlternateEmail) + '"';
				xml += ' regionalManagerName="' + ui.cmn.text.xml.encode(item.regionalManagerName) + '"';
				xml += ' hourlyEmployees="' + item.hourlyEmployees + '"';
				xml += ' maximumEmployeesAtShiftChange="' + item.maximumEmployeesAtShiftChange + '"';
				xml += ' union="' + item.union + '"';
				xml += ' payFrequencyType="' + item.payFrequencyType + '"';
				xml += ' buildingsAtFacility="' + item.buildingsAtFacility + '"';
				xml += ' currentRoundingScheme="' + item.currentRoundingScheme + '"';
				xml += ' currentOvertimePolicy="' + ui.cmn.text.xml.encode(item.currentOvertimePolicy) + '"';
				xml += ' kronos="' + item.kronos + '"';
				xml += ' groupsOfEmployeesWithDifferentPayRules="' + item.groupsOfEmployeesWithDifferentPayRules + '"';
				xml += ' shiftDifferentialsComments="' + ui.cmn.text.xml.encode(item.shiftDifferentialsComments) + '"';
				xml += ' phonesAvailable="' + item.phonesAvailable + '"';
				xml += ' tollFree="' + item.tollFree + '"';
				xml += ' comments="' + ui.cmn.text.xml.encode(item.comments) + '"';
				xml += ' ePayGroupType="' + item.ePayGroupType + '"';
				xml += ' reportingFrequencyType="' + item.reportingFrequencyType + '"';
				xml += ' firstDayOfReportingPeriod="' + item.firstDayOfReportingPeriod + '"';
				xml += ' firstDayOfWeek="' + item.firstDayOfWeek + '"';
				xml += ' preferredConnectionMethod="' + item.preferredConnectionMethod + '"';
				xml += ' dailyRebootTime="' + ui.cmn.text.xml.encode(item.dailyRebootTime) + '"';
				xml += ' useWorkOrders="' + item.useWorkOrders + '"';
				xml += ' taskSelectionMethod="' + item.taskSelectionMethod + '"';		
				xml += ' accidentFreeQuestions="' + item.accidentFreeQuestions + '"';
				xml += ' enableLunchLogic="' + item.enableLunchLogic + '"';
				xml += ' fixPunchesOnClock="' + item.fixPunchesOnClock + '"';
				xml += ' businessAnalyst="' + ui.cmn.text.xml.encode(item.businessAnalyst) + '"';
				xml += ' reviewDate="' + item.reviewDate + '"';
				xml += ' poNumber="' + ui.cmn.text.xml.encode(item.poNumber) + '"';
				xml += ' siteGroup="' + item.siteGroup + '"';
				xml += ' siteGroupID="' + ui.cmn.text.xml.encode(item.siteGroupID) + '"';
				xml += ' siteGroupName="' + ui.cmn.text.xml.encode(item.siteGroupName) + '"';
				xml += ' goLiveDate="' + item.goLiveDate + '"';
				xml += ' confirmSiteIsLive="' + item.confirmSiteIsLive + '"';
				xml += ' type="' + me.action + '"';
				xml += ' exported="' + me.exportToExcel + '"';
				xml += '/>';

				if (me.action == "SiteSurvey") {
					for (var index = 0; index < me.ePaySiteSurveyPayCodes.length; index++) {
						if (me.ePaySiteSurveyPayCodes[index].modified || me.ePaySiteSurveyPayCodes[index].id == 0) {
							xml += '<ePaySiteSurveyPayCode';
							xml += ' id="' + me.ePaySiteSurveyPayCodes[index].id + '"';
							xml += ' ePaySiteSurvey="' + me.ePaySiteSurveyPayCodes[index].ePaySiteSurvey + '"';
							xml += ' payCode="' + me.ePaySiteSurveyPayCodes[index].payCode + '"';
							xml += ' description="' + ui.cmn.text.xml.encode(me.ePaySiteSurveyPayCodes[index].description) + '"';
							xml += ' active="' + me.ePaySiteSurveyPayCodes[index].active + '"';
							xml += '/>';
						}
					}
				}
				else if (me.action == "SiteMethodology") {
					for (var index = 0; index < me.deviceTypeClockAssetGrid.data.length; index++) {
						if (me.deviceTypeClockAssetGrid.data[index].modified && 
							(me.deviceTypeClockAssetGrid.data[index].id > 0 || $("#selectInputCheck" + index)[0].checked)) {
							xml += '<ePaySiteSurveyClockAsset'
						    xml += ' id="' + me.deviceTypeClockAssetGrid.data[index].id + '"';
						    xml += ' ePaySiteSurveyId="' + me.deviceTypeClockAssetGrid.data[index].ePaySiteSurvey + '"';
						    xml += ' clockAssetId="' + me.deviceTypeClockAssetGrid.data[index].clockAsset + '"';
						    xml += ' status="' + $("#selectInputCheck" + index)[0].checked + '"';
						    xml += ' active="' + me.deviceTypeClockAssetGrid.data[index].active + '"';
						    xml += '/>';
						}
					}
				}				
			}
			else if (me.action == "ClockManagement") {
				for (var index = 0; index < me.clockAssets.length; index++) {
					if (me.clockAssets[index].modified || me.clockAssets[index].id == 0) {
						var houseCodeId = 0;
						if (me.clockAssets[index].houseCode != "")
							houseCodeId = me.houseCodeCache[me.clockAssets[index].houseCode].id;
						xml += '<clockAsset';
						xml += ' id="' + me.clockAssets[index].id + '"';
						xml += ' houseCodeId="' + houseCodeId + '"';
						xml += ' deviceType="' + me.clockAssets[index].deviceType.id + '"';
						xml += ' deviceStatusType="' + me.clockAssets[index].deviceStatusType.id + '"';
						xml += ' assetTransferStatusType="' + me.clockAssets[index].assetTransferStatusType.id + '"';
						xml += ' serialNumber="' + ui.cmn.text.xml.encode(me.clockAssets[index].serialNumber) + '"';
						xml += ' groupNumber="' + ui.cmn.text.xml.encode(me.clockAssets[index].groupNumber)+ '"';
						xml += ' groupName="' + ui.cmn.text.xml.encode(me.clockAssets[index].groupName) + '"';
						xml += ' upsTrackingNumber="' + ui.cmn.text.xml.encode(me.clockAssets[index].upsTrackingNumber) + '"';
						xml += ' active="' + me.clockAssets[index].active + '"';
						xml += '/>';
					}
				}
			}
			else if (me.action == "ManageDeviceType") {
				for (var index = 0; index < me.deviceTypes.length; index++) {
					if (me.deviceTypes[index].modified || me.deviceTypes[index].id == 0) {
						xml += '<deviceType';
						xml += ' id="' + me.deviceTypes[index].id + '"';
						xml += ' name="' + ui.cmn.text.xml.encode(me.deviceTypes[index].name) + '"';
						xml += ' lan="' + me.deviceTypes[index].lan + '"';
						xml += ' wifi="' + me.deviceTypes[index].wifi + '"';
						xml += ' dialup="' + me.deviceTypes[index].dialup + '"';
						xml += ' cellular="' + me.deviceTypes[index].cellular + '"';
						xml += ' touchscreen="' + me.deviceTypes[index].touchscreen + '"';
						xml += ' swipeCard="' + me.deviceTypes[index].swipeCard + '"';
						xml += ' trainingVideos="' + me.deviceTypes[index].trainingVideos + '"';
						xml += ' active="' + me.deviceTypes[index].active + '"';
						xml += '/>';
					}
				}				
			}
			
			return xml;
		},
		
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: { type: ii.ajax.TransactionMonitor.Transaction }, // The transaction that was responded to.
				xmlNode: { type: "XmlNode:transaction" } // The XML transaction node associated with the response.
			});						
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				if (me.action == "SiteSurvey") {
					if (me.siteDetails[0].id == 0) {
						$(args.xmlNode).find("*").each(function(){
							switch (this.tagName) {
								case "ePaySiteSurvey":
									item.id = parseInt($(this).attr("id"), 10);
									me.siteDetails[0] = item;
									break;
							}
						});
					}

					me.ePaySiteSurveyPayCodeStore.reset();
					me.ePaySiteSurveyPayCodeStore.fetch("userId:[user],id:" + me.siteDetails[0].id, me.ePaySiteSurveyPayCodesLoaded, me);
				}
				else if (me.action == "SiteMethodology") {
					me.ePaySiteSurveyClockAssetStore.reset();
					me.ePaySiteSurveyClockAssetStore.fetch("userId:[user],id:" + me.siteDetails[0].id, me.ePaySiteSurveyClockAssetsLoaded, me);
					if (me.exportToExcel)
						me.actionExportToExcelItem();
				}
				else if (me.action == "ClockManagement") {
					me.actionSearchItem();
				}
				else if (me.action == "ManageDeviceType") {
					me.loadDeviceTypes();
				}

				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Epay Site Survey details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {

	fin.hcmEPaySiteSurveyUi = new fin.hcm.ePaySiteSurvey.UserInterface();
	fin.hcmEPaySiteSurveyUi.resize();
	fin.houseCodeSearchUi = fin.hcmEPaySiteSurveyUi;
}
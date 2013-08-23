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

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\EPaySiteSurvey";
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

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}

			$("input[name='Union']").change(function() { me.modified(true); });
			$("input[name='Kronos']").change(function() { me.modified(true); });
			$("input[name='GroupsOfEmployeesWithDifferentPayRules']").change(function() { me.modified(true); });
			$("input[name='PhonesAvailable']").change(function() { me.modified(true); });
			$("input[name='TollFree']").change(function() { me.modified(true); });

			$("a").click(function() {
				me.currentWizard = this.id.replace("edit", "");
				me.actionShowWizard();
				me.checkWizardSecurity();
			});

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

			me.deviceTypeGrid.setHeight($(window).height() - 150);
		},
		
		authorizationProcess: function fin_hcm_ePaySiteSurvey_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

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
				me.payCodeTypeStore.fetch("userId:[user],payCodeType:productive", me.payCodeTypesLoaded, me);
				me.ePaySiteSurveyMasterStore.fetch("userId:[user]", me.ePaySiteSurveyMastersLoaded, me);
				me.clockAssetStore.fetch("userId:[user]", me.clockAssetsLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			me.siteSurveyShow =  me.authorizer.isAuthorized(me.authorizePath + "\\SiteSurvey");
			me.siteMethodologyShow = me.authorizer.isAuthorized(me.authorizePath + "\\SiteMethodology");
			me.clockManagementShow = me.authorizer.isAuthorized(me.authorizePath + "\\ClockManagement");
			me.manageDeviceTypeShow = me.authorizer.isAuthorized(me.authorizePath + "\\ManageDeviceType");

			if (!me.siteSurveyShow)
				$("#siteSurveyAction").hide();
			if (!me.siteMethodologyShow)
				$("#siteMethodologylAction").hide();
			if (!me.clockManagementShow)
				$("#clockManagementAction").hide();
			if (!me.manageDeviceTypeShow)
				$("#manageDeviceTypeAction").hide();
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
					actionFunction: function() { me.actionManageDeviceTypeItem(); }
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
				clickFunction: function() { me.actionManageDeviceTypeItem(); },
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
				selectFunction: function(index) { 
					me.payCodeTitle.text.readOnly = true;
					if (me.currentWizard == "Review")
						me.payCodeDescription.text.readOnly = true;
						//me.itemSelect(index);
					 }
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
				
			me.firstDayOfReportingPeriod = new ui.ctl.Input.Text({
		        id: "FirstDayOfReportingPeriod",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.firstDayOfReportingPeriod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
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
					
			me.deviceType = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceType",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.deviceType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.deviceType.indexSelected == -1)
						this.setInvalid("Please select the correct Device Type.");
				});
			
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
			
			me.serialNumber = new ui.ctl.Input.Text({
		        id: "SerialNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.trackingNumber = new ui.ctl.Input.Text({
		        id: "TrackingNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.deviceTypeCMSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceTypeCMSearch",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
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
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
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
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
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
				selectFunction: function (index) {
					if (fin.hcmEPaySiteSurveyUi.clockAssets[index])
						fin.hcmEPaySiteSurveyUi.clockAssets[index].modified = true;
				}
			});
			
			me.deviceTypeCM = new ui.ctl.Input.DropDown.Filtered({
		        id: "DeviceTypeCM",
				appendToId: "DeviceGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() {me.modified(); }
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
				changeFunction: function() {me.modified(); }
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
				changeFunction: function() {me.modified(); }
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
			
			me.deviceGrid.addColumn("houseCode", "houseCode", "House Code", "House Code", 100);
			me.deviceGrid.addColumn("deviceType", "deviceType", "Device Type", "Device Type", 150, null, me.deviceTypeCM);
			me.deviceGrid.addColumn("deviceStatusType", "deviceStatusType", "Device Status", "Device Status", 150, null, me.deviceStatusTypeCM);
			me.deviceGrid.addColumn("assetTransferStatusType", "assetTransferStatusType", "Asset Transfer Status", "Asset Transfer Status", 170, null, me.assetTransferStatusTypeCM);
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
				deselectFunction: function() { me.itemDeSelect(); }
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
			me.deviceType.text.tabIndex = 55;
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
			me.serialNumber.text.tabIndex = 71;
			me.trackingNumber.text.tabIndex = 72;
			
			$("#HouseCode")[0].tabIndex = 81;
			$("#DeviceInfo")[0].tabIndex = 82;
			$("#houseCodeTemplateText")[0].tabIndex = 83;
			me.deviceTypeCMSearch.text.tabIndex = 84;
			me.deviceStatusCMSearch.text.tabIndex = 85;
			me.assetTransferStatusCMSearch.text.tabIndex = 86;

			me.houseCodeName.text.readOnly = true;
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
			me.hourlyEmployees.text.readOnly = readOnly;
			me.maximumEmployeesAtShiftChange.readOnly = readOnly;
			$("#UnionYes")[0].disabled = readOnly;
			$("#UnionNo")[0].disabled = readOnly;
			me.payrollFrequency.text.readOnly = readOnly;
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
			me.comments.readOnly = readOnly;
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

			me.siteDetails = [];
			me.siteDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.hcm.ePaySiteSurvey.SiteDetail,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.siteDetailArgs,
				injectionArray: me.siteDetails
			});		
						
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.ePaySiteSurvey.StateType,
				itemConstructorArgs: fin.hcm.ePaySiteSurvey.stateTypeArgs,
				injectionArray: me.stateTypes	
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
				lookupSpec: { deviceType: me.deviceTypes },
				lookupSpec: { deviceStatusType: me.deviceStatusTypes }
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
			me.deviceType.resizeText();
			me.preferredConnectionMethod.resizeText();
			me.dailyRebootTime.resizeText();
			me.taskSelectionMethod.resizeText();
			me.businessAnalyst.resizeText();
			me.reviewDate.resizeText();
			me.poNumber.resizeText();
			me.siteGroupID.resizeText();
			me.siteGroupName.resizeText();
			me.goLiveDate.resizeText();
			me.serialNumber.resizeText();
			me.trackingNumber.resizeText();

			me.resize();
		},
		
		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.checkLoadCount();
		},
		
		payCodeTypesLoaded: function(me, activeId) {
			
			//me.payCodeTypes.setData(me.payCodeTypes);
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
			me.deviceType.setData(me.deviceTypes);
			me.preferredConnectionMethod.setData(me.preferredConnectionMethods);
			me.taskSelectionMethod.setData(me.taskSelectionMethods);

			me.deviceTypeCMSearch.select(0, me.deviceTypeCMSearch.focused);
			me.deviceStatusCMSearch.select(0, me.deviceStatusCMSearch.focused);
			me.assetTransferStatusCMSearch.select(0, me.assetTransferStatusCMSearch.focused);
						
			me.resizeControls();
			me.checkLoadCount();
		},
		
		clockAssetsLoaded: function(me, activeId) {
			
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
			me.siteDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.siteDetailsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (parent.fin.appUI.houseCodeId <= 0) return;

			me.siteDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.siteDetailsLoaded, me);
		},
		
		siteDetailsLoaded: function(me, activeId) {

 			if (me.siteDetails[0] == undefined) {
				alert("Error: Selected House code is not setup correctly. Please review.");
				return false;
			}

			me.houseCodeName.setValue(parent.fin.appUI.houseCodeTitle);
			me.address1.setValue(me.siteDetails[0].shippingAddress1);
			me.address2.setValue(me.siteDetails[0].shippingAddress2);
			me.city.setValue(me.siteDetails[0].shippingCity);
			me.zipCode.setValue(me.siteDetails[0].shippingZip);
			me.managerName.setValue(me.siteDetails[0].managerName);
			me.managerPhone.setValue(me.siteDetails[0].managerPhone);
			me.managerCellPhone.setValue(me.siteDetails[0].managerCellPhone);
			me.managerEmail.setValue(me.siteDetails[0].managerEmail);
			me.managerAlternateEmail.setValue(me.siteDetails[0].managerAlternateEmail);

			var index = ii.ajax.util.findIndexById(me.siteDetails[0].shippingState.toString(), me.stateTypes);
			if (index != undefined) 
				me.state.select(index, me.state.focused);
			
			me.ePaySiteSurvey();
		},
		
		houseCodeTemplateChanged: function() { 
			var args = ii.args(arguments,{});			
			var me = this;	

			var id = me.houseCodeSearchTemplate.houseCodeIdTemplate;
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (me.deviceTypeGrid.data[index] != undefined) {
				me.lastSelectedRowIndex = index;
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

			me.currentWizard = "";
			me.checkWizardSecurity();
			me.actionNextItem();
			//me.actionShowWizard();
		},
	
		checkWizardSecurity: function() {
			var me = this;
			ii.trace("checkWizardSecurity", ii.traceTypes.information, "Info");

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
					me.payCodeGrid.setData(me.payCodeTypes);
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
			me.status = "Site Survey";
			me.ePaySiteSurvey();
		},
		
		actionSiteMethodologyItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
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
			$("#header").html("Site Methodology");
			
			me.status = "Site Methodology";
			me.resizeControls();
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
			$("#AnchorManageDeviceTypes").show();
			$("#AnchorSave").show();
			$("#AnchorCancel").show();
			
			$("#header").html("Clock Management");
			me.deviceGrid.setData(me.clockAssets);
			me.deviceGrid.setHeight($(window).height() - 320);
			
			me.status = "Clock Management";
			me.resizeControls();
		},
		
		actionManageDeviceTypeItem: function() {
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
			me.status = "Manage Device Type";
		},
		
		houseCodeBlur: function() {
			var me = this;

		},
		
		actionSearchItem: function() {
			var me = this;
			
		},
		
		actionCancelItem: function() {
			var me = this;

			//$("#ManageDeviceType").hide();
			//$("#ClockManagement").show();
		},
		
		actionSaveAndExportItem: function() {
			var me = this;
			
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.status == "" || parent.fin.appUI.houseCodeId <= 0) {
				alert("House Code information not loaded properly. Please reload.");
				return false;
			}
			return false;
			var item = new fin.hcm.ePaySiteSurvey.SiteDetail(
				parent.fin.appUI.houseCodeId
				, me.address1.getValue()
				, me.address2.getValue()
				, me.city.getValue()
				, me.zipCode.getValue()
				, me.stateTypes[me.state.indexSelected].id
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
				, me.payrollFrequency.getValue()
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
				, me.firstDayOfReportingPeriod.getValue()
				, me.firstDayOfWeek.lastBlurValue
				, me.deviceTypes[me.deviceType.indexSelected].id
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
			);
				
			var xml = me.saveXmlBuild(item);
			
			$("#messageToUser").text("Saving");			
			$("#pageLoading").show();
			
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

			xml += '<ePaySiteSurvey';
			xml += ' id="' + item.id + '"';
			xml += ' houseCode="' + item.houseCode + '"';
			xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
			xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
			xml += ' stateType="' + item.stateType + '"';
			xml += ' zipCode="' + item.zipCode + '"';
			xml += ' timeZone="' + ui.cmn.text.xml.encode(item.timeZone) + '"';
			xml += ' dayLightSavings="' + item.dayLightSavings + '"';
			xml += ' alternateContactName="' + ui.cmn.text.xml.encode(item.alternateContactName) + '"';
			xml += ' alternateContactPhone="' + item.alternateContactPhone + '"';
			xml += ' alternateContactCellPhone="' + item.alternateContactCellPhone + '"';
			xml += ' alternateContactEmail="' + ui.cmn.text.xml.encode(item.alternateContactEmail) + '"';
			xml += ' AlternateContactAlternateEmail="' + ui.cmn.text.xml.encode(item.alternateContactAlternateEmail) + '"';
			xml += ' regionalManagerName="' + ui.cmn.text.xml.encode(item.regionalManagerName) + '"';
			xml += ' hourlyEmployees="' + item.hourlyEmployees + '"';
			xml += ' maximumEmployeesAtShiftChange="' + item.maximumEmployeesAtShiftChange + '"';
			xml += ' union="' + item.union + '"';
			xml += ' payFrequencyType="' + item.payFrequencyType + '"';
			xml += ' buildingsAtFacility="' + item.buildingsAtFacility + '"';
			xml += ' currentRoundingScheme="' + item.currentRoundingScheme + '"';
			xml += ' currentOvertimePolicy="' + ui.cmn.text.xml.encode(item.currentOvertimePolicy) + '"';
			xml += ' kronos="' + item.kronos + '"';
			xml += ' groupsOfEmployeesWithDifferentPayRules="' +item.groupsOfEmployeesWithDifferentPayRules + '"';
			xml += ' shiftDifferentialsComments="' + ui.cmn.text.xml.encode(item.shiftDifferentialsComments) + '"';
			xml += ' phonesAvailable="' + item.phonesAvailable + '"';
			xml += ' tollFree="' + item.tollFree + '"';
			xml += ' comments="' + ui.cmn.text.xml.encode(item.comments) + '"';
			xml += ' ePayGroupType="' + item.ePayGroupType + '"';
			xml += ' reportingFrequencyType="' + item.reportingFrequencyType + '"';
			xml += ' firstDayOfReportingPeriod="' + ui.cmn.text.xml.encode(item.firstDayOfReportingPeriod) + '"';
			xml += ' firstDayOfWeek="' + item.firstDayOfWeek + '"';
			xml += ' deviceType="' + item.deviceType + '"';
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
			xml += '/>';

			for (var index = 0; index < me.payCodeTypes.length; index++) {
				xml += '<ePaySiteSurveyPayCode';
				xml += ' id="' + me.payCodeTypes[index].id + '"';
				xml += ' ePaySiteSurvey="' + me.payCodeTypes[index].id + '"';
				xml += ' payCode="' + me.payCodeTypes[index].id + '"';
				xml += ' description="' + me.payCodeTypes[index].description + '"';	
				xml += ' active="1"';					
				xml += '/>';
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
				me.modified(false);
				ii.trace("Epay Site Survey details saved successfully.", ii.traceTypes.Information, "Info");
			}
			else 
				alert("[SAVE FAILURE] Error while updating Epay Site Survey details: " + $(args.xmlNode).attr("message"));

			$("#pageLoading").hide();
		}		
	}
});

function main() {

	fin.hcmEPaySiteSurveyUi = new fin.hcm.ePaySiteSurvey.UserInterface();
	fin.hcmEPaySiteSurveyUi.resize();
	fin.houseCodeSearchUi = fin.hcmEPaySiteSurveyUi;
}
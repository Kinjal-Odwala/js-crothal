ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.hcm.ptMetric.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.tabs", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );

ii.Class({
    Name: "fin.hcm.ptMetric.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		 
        init: function() {
			var me = this;
			
			me.activeFrameId = 0;
			me.loadCount = 0;
			me.ptMetricId = 0;
			me.reloadData = false;

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.validator = new ui.ctl.Input.Validation.Master(); 
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\PTMetrics";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			me.initialize();
			me.setTabIndexes();

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

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
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
				me.taskManagementSystemStore.fetch("userId:[user]", me.taskManagementSystemsLoaded, me);
				me.administratorObjectiveStore.fetch("userId:[user]", me.administratorObjectivesLoaded, me);
				me.metricTypeStore.fetch("userId:[user]", me.metricTypesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
				
			me.hospitalContractShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\HospitalContract");
			me.laborControlShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\LaborControl");
			me.strategicInitiativesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\StrategicInit");
			me.qualityControlShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\QualityControl");
			me.qualityAssuranceShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\QualityAssurance");
			me.adminObjectivesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\AdminObjectives");
			me.administrativeShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Administrative");
			
			if (me.hospitalContractShow)
				$("#TabHospitalContract").show();
			if (me.laborControlShow)
				$("#TabLaborControl").show();
			if (me.strategicInitiativesShow)
				$("#TabStrategicInitiative").show();
			if (me.qualityControlShow)
				$("#TabQualityControl").show();
			if (me.qualityAssuranceShow)
				$("#TabQualityAssurance").show();
			if (me.adminObjectivesShow)
				$("#TabAdminObjectives").show();
			if (me.administrativeShow)
				$("#TabAdministrative").show();

			if (me.hospitalContractShow)
				me.activeFrameId = 1;
			else if (me.laborControlShow)
				me.activeFrameId = 2;
			else if (me.strategicInitiativesShow)
				me.activeFrameId = 3;
			else if (me.qualityControlShow)
				me.activeFrameId = 4;
			else if (me.qualityAssuranceShow)
				me.activeFrameId = 5;
			else if (me.adminObjectivesShow)
				me.activeFrameId = 6;
			else if (me.administrativeShow)
				me.activeFrameId = 7;

			setTimeout(function() {
				$("#container-1").tabs(me.activeFrameId);
				$("#container-1").triggerTab(me.activeFrameId);
				me.resizeControls(me.activeFrameId);
			}, 100)
		},	
		
		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.hcmPTMetricUi;
			var offset = 100;

		    $("#HospitalContractContainer").height($(window).height() - offset);
		    $("#LaborControlContainer").height($(window).height() - offset);
		    $("#StrategicInitiativeContainer").height($(window).height() - offset);
		    $("#QualityControlContainer").height($(window).height() - offset);
			$("#QualityAssuranceContainer").height($(window).height() - offset);
			$("#AdminObjectiveContainer").height($(window).height() - offset);
			$("#AdministrativeContainer").height($(window).height() - offset);

			if ($("#LaborControlGridContainer").width() < 2650) {
				$("#LaborControlGrid").width(2650);
				me.laborControlGrid.setHeight($(window).height() - 168);
			}
			else {
				me.laborControlGrid.setHeight($(window).height() - 143);
			}
			if ($("#QualityControlGridContainer").width() < 2600) {
				$("#QualityControlGrid").width(2600);
				me.qualityControlGrid.setHeight($(window).height() - 168);
			}
			else {
				me.qualityControlGrid.setHeight($(window).height() - 143);
			}
			if ($("#PTPressGaneyGridContainer").width() < 2600) {
				$("#PTPressGaneyGrid").width(2600);
			}
			if ($("#EVSHCAHPSGridContainer").width() < 2600) {
				$("#EVSHCAHPSGrid").width(2600);
			}
			if ($("#InHouseStandardMetricGridContainer").width() < 1800) {
				$("#InHouseStandardMetricGrid").width(1800);
			}
			if ($("#ThirdPartyStandardMetricGridContainer").width() < 1800) {
				$("#ThirdPartyStandardMetricGrid").width(1800);
			}

			me.strategicInitiativeGrid.setHeight($(window).height() - 145);
			me.ptPressGaneyGrid.setHeight(150);
			me.evsHCAHPSGrid.setHeight(150);
			me.qualityPartnershipGrid.setHeight(150);
			me.auditScoreGrid.setHeight(150);
			me.adminObjectiveGrid.setHeight($(window).height() - 145);
			me.inHouseStandardMetricGrid.setHeight(200);
			me.thirdPartyStandardMetricGrid.setHeight(200);
		},

		controlKeyProcessor: function() {
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

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save PT Metric (Ctrl+S)", 
					title: "Save the current PT metric details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to PT Metric (Ctrl+U)", 
					title: "Undo the changes to PT metric being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.year = new ui.ctl.Input.DropDown.Filtered({
		        id: "Year",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.yearChanged(); },
		        required: false
		    });	

			me.year.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.year.indexSelected == -1)
						this.setInvalid("Please select correct Year.");
				});

			me.chiefExecutiveOfficer = new ui.ctl.Input.Text({
		        id: "ChiefExecutiveOfficer",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.chiefFinancialOfficer = new ui.ctl.Input.Text({
		        id: "ChiefFinancialOfficer",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.chiefOperatingOfficer = new ui.ctl.Input.Text({
		        id: "ChiefOperatingOfficer",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.chiefNursingOfficer = new ui.ctl.Input.Text({
		        id: "ChiefNursingOfficer",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.contractStartDate = new ui.ctl.Input.Date({
		        id: "ContractStartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.contractStartDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.contractStartDate.text.value;

					if (enteredText == "") 
						return;
					
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.contractRenewalDate = new ui.ctl.Input.Date({
		        id: "ContractRenewalDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.contractRenewalDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.contractRenewalDate.text.value;

					if (enteredText == "") 
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.cpiDueDate = new ui.ctl.Input.Date({
		        id: "CPIDueDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });

			me.cpiDueDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.cpiDueDate.text.value;

					if (enteredText == "") 
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.cpiCap = new ui.ctl.Input.Text({
		        id: "CPICap",
		        maxLength: 19,
				changeFunction: function() { me.modified(); }
		    });

			me.cpiCap
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.cpiCap.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});

			me.hourlyFTEVacancies = new ui.ctl.Input.Text({
		        id: "HourlyFTEVacancies",
		        maxLength: 19,
				changeFunction: function() { me.modified(); }
		    });

			me.hourlyFTEVacancies
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.hourlyFTEVacancies.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});
			
			me.fullTimePartTimeRatio = new ui.ctl.Input.Text({
		        id: "FullTimePartTimeRatio",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.operatingCapacity = new ui.ctl.Input.Text({
		        id: "OperatingCapacity",
		        maxLength: 17,
				changeFunction: function() { me.modified(); }
		    });

			me.operatingCapacity
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.operatingCapacity.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,12}(\.\d{1,4})?$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});

			me.serviceLineEVS = new ui.ctl.Input.Text({
		        id: "ServiceLineEVS",
		        maxLength: 128,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLineLaundry = new ui.ctl.Input.Text({
		        id: "ServiceLineLaundry",
		        maxLength: 128,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLinePOM = new ui.ctl.Input.Text({
		        id: "ServiceLinePOM",
		        maxLength: 128,
				changeFunction: function() { me.modified(); }
		    });

			me.serviceLineCES = new ui.ctl.Input.Text({
		        id: "ServiceLineCES",
		        maxLength: 128,
				changeFunction: function() { me.modified(); }
		    });

			me.costedTripCycleTime = new ui.ctl.Input.Text({
		        id: "CostedTripCycleTime",
		        maxLength: 9,
				changeFunction: function() { me.modified(); }
		    });

			me.costedTripCycleTime
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.costedTripCycleTime.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,9}$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});
				
			me.contractedAnnualTrips = new ui.ctl.Input.Text({
		        id: "ContractedAnnualTrips",
		        maxLength: 9,
				changeFunction: function() { me.modified(); }
		    });

			me.contractedAnnualTrips
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.contractedAnnualTrips.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,9}$/.test(enteredText)))
						this.setInvalid("Please enter valid number.");
				});
				
			me.taskManagementSystem = new ui.ctl.Input.DropDown.Filtered({
		        id: "TaskManagementSystem",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { 
					me.modified();
					if (me.taskManagementSystem.lastBlurValue == "Other") {
						$("#TMSOtherContainer").show();
					}
					else {
						$("#TMSOtherContainer").hide();
						me.taskManagementSystemOther.setValue("");
					}
				}
		    });
			
			me.taskManagementSystem.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function( isFinal, dataMap) {				
	
					var enteredText = me.taskManagementSystem.lastBlurValue;

					if (enteredText == "")
						return;
	
					if (me.taskManagementSystem.indexSelected == -1)
						this.setInvalid("Please select the correct Task Management System.");
			});
			
			me.taskManagementSystemOther = new ui.ctl.Input.Text({
		        id: "TaskManagementSystemOther",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.notes = $("#Notes")[0];

			$("#Notes").height(100);
			$("#Notes").change(function() { me.modified(); });
			
			me.laborControlGrid = new ui.ctl.Grid({
				id: "LaborControlGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.laborControlItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.metricTypeTitle = new ui.ctl.Input.Text({
		        id: "MetricTypeTitle",
				appendToId: "LaborControlGridControlHolder"
		    });

			me.period1 = new ui.ctl.Input.Text({
				id: "Period1",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.period1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period1, me.laborControlGrid);
				});

			me.period2 = new ui.ctl.Input.Text({
				id: "Period2",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period2, me.laborControlGrid);
				});
				
			me.period3 = new ui.ctl.Input.Text({
				id: "Period3",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.period3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period3, me.laborControlGrid);
				});
	
			me.period4 = new ui.ctl.Input.Text({
				id: "Period4",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.period4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period4, me.laborControlGrid);
				});
				
			me.period5 = new ui.ctl.Input.Text({
				id: "Period5",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period5.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period5, me.laborControlGrid);
				});
				
			me.period6 = new ui.ctl.Input.Text({
				id: "Period6",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period6.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period6, me.laborControlGrid);
				});

			me.period7 = new ui.ctl.Input.Text({
				id: "Period7",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period7.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period7, me.laborControlGrid);
				});
				
			me.period8 = new ui.ctl.Input.Text({
				id: "Period8",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period8.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period8, me.laborControlGrid);
				});
				
			me.period9 = new ui.ctl.Input.Text({
				id: "Period9",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period9.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period9, me.laborControlGrid);
				});
				
			me.period10 = new ui.ctl.Input.Text({
				id: "Period10",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period10, me.laborControlGrid);
				});
				
			me.period11 = new ui.ctl.Input.Text({
				id: "Period11",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period11.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period11, me.laborControlGrid);
				});
				
			me.period12 = new ui.ctl.Input.Text({
				id: "Period12",
				appendToId: "LaborControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.period12.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.period12, me.laborControlGrid);
				});
				
			me.laborControlGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.metricTypeTitle);
			me.laborControlGrid.addColumn("period1", "period1", "Period 1", "Period 1", 200, null, me.period1);
			me.laborControlGrid.addColumn("period2", "period2", "Period 2", "Period 2", 200, null, me.period2);
			me.laborControlGrid.addColumn("period3", "period3", "Period 3", "Period 3", 200, null, me.period3);
			me.laborControlGrid.addColumn("period4", "period4", "Period 4", "Period 4", 200, null, me.period4);
			me.laborControlGrid.addColumn("period5", "period5", "Period 5", "Period 5", 200, null, me.period5);
			me.laborControlGrid.addColumn("period6", "period6", "Period 6", "Period 6", 200, null, me.period6);
			me.laborControlGrid.addColumn("period7", "period7", "Period 7", "Period 7", 200, null, me.period7);
			me.laborControlGrid.addColumn("period8", "period8", "Period 8", "Period 8", 200, null, me.period8);
			me.laborControlGrid.addColumn("period9", "period9", "Period 9", "Period 9", 200, null, me.period9);
			me.laborControlGrid.addColumn("period10", "period10", "Period 10", "Period 10", 200, null, me.period10);
			me.laborControlGrid.addColumn("period11", "period11", "Period 11", "Period 11", 200, null, me.period11);
			me.laborControlGrid.addColumn("period12", "period12", "Period 12", "Period 12", 200, null, me.period12);
			me.laborControlGrid.capColumns();

			me.strategicInitiativeGrid = new ui.ctl.Grid({
				id: "StrategicInitiativeGrid",
				appendToId: "divForm",
				allowAdds: true,
				createNewFunction: fin.hcm.ptMetric.StrategicInitiative,
				selectFunction: function( index ) { me.strategicInitiativeItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.hospitalIntiative = new ui.ctl.Input.Text({
				id: "HospitalIntiative",
				appendToId: "StrategicInitiativeGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.expectedOutcome = new ui.ctl.Input.Text({
				id: "ExpectedOutcome",
				appendToId: "StrategicInitiativeGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.departmentIntiative = new ui.ctl.Input.Text({
				id: "DepartmentIntiative",
				appendToId: "StrategicInitiativeGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.strategicInitiativeGrid.addColumn("hospitalIntiative", "hospitalIntiative", "Hospital Intiative", "Hospital Intiative", null, null, me.hospitalIntiative);
			me.strategicInitiativeGrid.addColumn("expectedOutcome", "expectedOutcome", "Expected Outcome", "Expected Outcome", 400, null, me.expectedOutcome);
			me.strategicInitiativeGrid.addColumn("departmentIntiative", "departmentIntiative", "Department Intiative", "Department Intiative", 400, null, me.departmentIntiative);
			me.strategicInitiativeGrid.capColumns();
			
			me.qualityControlGrid = new ui.ctl.Grid({
				id: "QualityControlGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.qualityControlItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.qcMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "QCMetricTypeTitle",
				appendToId: "QualityControlGridControlHolder"
		    });

			me.qcPeriod1 = new ui.ctl.Input.Text({
				id: "QCPeriod1",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.qcPeriod1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod1, me.qualityControlGrid);
				});
				
			me.qcPeriod2 = new ui.ctl.Input.Text({
				id: "QCPeriod2",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod2, me.qualityControlGrid);
				});
				
			me.qcPeriod3 = new ui.ctl.Input.Text({
				id: "QCPeriod3",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod3, me.qualityControlGrid);
				});
				
			me.qcPeriod4 = new ui.ctl.Input.Text({
				id: "QCPeriod4",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod4, me.qualityControlGrid);
				});
				
			me.qcPeriod5 = new ui.ctl.Input.Text({
				id: "QCPeriod5",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod5.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod5, me.qualityControlGrid);
				});
	
			me.qcPeriod6 = new ui.ctl.Input.Text({
				id: "QCPeriod6",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod6.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod6, me.qualityControlGrid);
				});
				
			me.qcPeriod7 = new ui.ctl.Input.Text({
				id: "QCPeriod7",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod7.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod7, me.qualityControlGrid);
				});
				
			me.qcPeriod8 = new ui.ctl.Input.Text({
				id: "QCPeriod8",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod8.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod8, me.qualityControlGrid);
				});
				
			me.qcPeriod9 = new ui.ctl.Input.Text({
				id: "QCPeriod9",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod9.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod9, me.qualityControlGrid);
				});
				
			me.qcPeriod10 = new ui.ctl.Input.Text({
				id: "QCPeriod10",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod10, me.qualityControlGrid);
				});
				
			me.qcPeriod11 = new ui.ctl.Input.Text({
				id: "QCPeriod11",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod11.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod11, me.qualityControlGrid);
				});
				
			me.qcPeriod12 = new ui.ctl.Input.Text({
				id: "QCPeriod12",
				appendToId: "QualityControlGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.qcPeriod12.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.qcPeriod12, me.qualityControlGrid);
				});
				
			me.qualityControlGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.qcMetricTypeTitle);
			me.qualityControlGrid.addColumn("qcPeriod1", "period1", "Period 1", "Period 1", 180, null, me.qcPeriod1);
			me.qualityControlGrid.addColumn("qcPeriod2", "period2", "Period 2", "Period 2", 180, null, me.qcPeriod2);
			me.qualityControlGrid.addColumn("qcPeriod3", "period3", "Period 3", "Period 3", 180, null, me.qcPeriod3);
			me.qualityControlGrid.addColumn("qcPeriod4", "period4", "Period 4", "Period 4", 180, null, me.qcPeriod4);
			me.qualityControlGrid.addColumn("qcPeriod5", "period5", "Period 5", "Period 5", 180, null, me.qcPeriod5);
			me.qualityControlGrid.addColumn("qcPeriod6", "period6", "Period 6", "Period 6", 180, null, me.qcPeriod6);
			me.qualityControlGrid.addColumn("qcPeriod7", "period7", "Period 7", "Period 7", 180, null, me.qcPeriod7);
			me.qualityControlGrid.addColumn("qcPeriod8", "period8", "Period 8", "Period 8", 180, null, me.qcPeriod8);
			me.qualityControlGrid.addColumn("qcPeriod9", "period9", "Period 9", "Period 9", 180, null, me.qcPeriod9);
			me.qualityControlGrid.addColumn("qcPeriod10", "period10", "Period 10", "Period 10", 180, null, me.qcPeriod10);
			me.qualityControlGrid.addColumn("qcPeriod11", "period11", "Period 11", "Period 11", 180, null, me.qcPeriod11);
			me.qualityControlGrid.addColumn("qcPeriod12", "period12", "Period 12", "Period 12", 180, null, me.qcPeriod12);
			me.qualityControlGrid.capColumns();
			
			me.ptPressGaneyGrid = new ui.ctl.Grid({
				id: "PTPressGaneyGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.ptPressGaneyItemSelect(index); },
				deleteFunction: function() { return true; }
			});
			
			me.pressGaneyMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "PressGaneyMetricTypeTitle",
				appendToId: "PTPressGaneyGridControlHolder"
		    });
			
			me.pgPeriod1 = new ui.ctl.Input.Text({
				id: "PGPeriod1",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod1, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod2 = new ui.ctl.Input.Text({
				id: "PGPeriod2",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod2, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod3 = new ui.ctl.Input.Text({
				id: "PGPeriod3",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod3, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod4 = new ui.ctl.Input.Text({
				id: "PGPeriod4",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod4, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod5 = new ui.ctl.Input.Text({
				id: "PGPeriod5",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod5.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod5, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod6 = new ui.ctl.Input.Text({
				id: "PGPeriod6",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod6.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod6, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod7 = new ui.ctl.Input.Text({
				id: "PGPeriod7",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod7.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod7, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod8 = new ui.ctl.Input.Text({
				id: "PGPeriod8",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod8.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod8, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod9 = new ui.ctl.Input.Text({
				id: "PGPeriod9",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod9.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod9, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod10 = new ui.ctl.Input.Text({
				id: "PGPeriod10",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod10, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod11 = new ui.ctl.Input.Text({
				id: "PGPeriod11",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod11.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod11, me.ptPressGaneyGrid);
				});
				
			me.pgPeriod12 = new ui.ctl.Input.Text({
				id: "PGPeriod12",
				appendToId: "PTPressGaneyGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.pgPeriod12.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.pgPeriod12, me.ptPressGaneyGrid);
				});
				
			me.ptPressGaneyGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.pressGaneyMetricTypeTitle);
			me.ptPressGaneyGrid.addColumn("pgPeriod1", "period1", "Period 1", "Period 1", 200, null, me.pgPeriod1);
			me.ptPressGaneyGrid.addColumn("pgPeriod2", "period2", "Period 2", "Period 2", 200, null, me.pgPeriod2);
			me.ptPressGaneyGrid.addColumn("pgPeriod3", "period3", "Period 3", "Period 3", 200, null, me.pgPeriod3);
			me.ptPressGaneyGrid.addColumn("pgPeriod4", "period4", "Period 4", "Period 4", 200, null, me.pgPeriod4);
			me.ptPressGaneyGrid.addColumn("pgPeriod5", "period5", "Period 5", "Period 5", 200, null, me.pgPeriod5);
			me.ptPressGaneyGrid.addColumn("pgPeriod6", "period6", "Period 6", "Period 6", 200, null, me.pgPeriod6);
			me.ptPressGaneyGrid.addColumn("pgPeriod7", "period7", "Period 7", "Period 7", 200, null, me.pgPeriod7);
			me.ptPressGaneyGrid.addColumn("pgPeriod8", "period8", "Period 8", "Period 8", 200, null, me.pgPeriod8);
			me.ptPressGaneyGrid.addColumn("pgPeriod9", "period9", "Period 9", "Period 9", 200, null, me.pgPeriod9);
			me.ptPressGaneyGrid.addColumn("pgPeriod10", "period10", "Period 10", "Period 10", 200, null, me.pgPeriod10);
			me.ptPressGaneyGrid.addColumn("pgPeriod11", "period11", "Period 11", "Period 11", 200, null, me.pgPeriod11);
			me.ptPressGaneyGrid.addColumn("pgPeriod12", "period12", "Period 12", "Period 12", 200, null, me.pgPeriod12);
			me.ptPressGaneyGrid.capColumns();
			
			me.evsHCAHPSGrid = new ui.ctl.Grid({
				id: "EVSHCAHPSGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.evsHCAHPSItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.evsHCAHPSMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "EVSHCAHPMetricTypeTitle",
				appendToId: "EVSHCAHPSGridControlHolder"
		    });

			me.evsPeriod1 = new ui.ctl.Input.Text({
				id: "EVSPeriod1",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod1, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod2 = new ui.ctl.Input.Text({
				id: "EVSPeriod2",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod2, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod3 = new ui.ctl.Input.Text({
				id: "EVSPeriod3",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod3, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod4 = new ui.ctl.Input.Text({
				id: "EVSPeriod4",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod4, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod5 = new ui.ctl.Input.Text({
				id: "EVSPeriod5",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod5.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod5, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod6 = new ui.ctl.Input.Text({
				id: "EVSPeriod6",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod6.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod6, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod7 = new ui.ctl.Input.Text({
				id: "EVSPeriod7",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod7.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod7, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod8 = new ui.ctl.Input.Text({
				id: "EVSPeriod8",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod8.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod8, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod9 = new ui.ctl.Input.Text({
				id: "EVSPeriod9",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod9.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod9, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod10 = new ui.ctl.Input.Text({
				id: "EVSPeriod10",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod10, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod11 = new ui.ctl.Input.Text({
				id: "EVSPeriod11",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod11.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod11, me.evsHCAHPSGrid);
				});
				
			me.evsPeriod12 = new ui.ctl.Input.Text({
				id: "EVSPeriod12",
				appendToId: "EVSHCAHPSGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.evsPeriod12.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					me.validateControl(me.evsPeriod12, me.evsHCAHPSGrid);
				});
				
			me.evsHCAHPSGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.evsHCAHPSMetricTypeTitle);
			me.evsHCAHPSGrid.addColumn("evsPeriod1", "period1", "Period 1", "Period 1", 200, null, me.evsPeriod1);
			me.evsHCAHPSGrid.addColumn("evsPeriod2", "period2", "Period 2", "Period 2", 200, null, me.evsPeriod2);
			me.evsHCAHPSGrid.addColumn("evsPeriod3", "period3", "Period 3", "Period 3", 200, null, me.evsPeriod3);
			me.evsHCAHPSGrid.addColumn("evsPeriod4", "period4", "Period 4", "Period 4", 200, null, me.evsPeriod4);
			me.evsHCAHPSGrid.addColumn("evsPeriod5", "period5", "Period 5", "Period 5", 200, null, me.evsPeriod5);
			me.evsHCAHPSGrid.addColumn("evsPeriod6", "period6", "Period 6", "Period 6", 200, null, me.evsPeriod6);
			me.evsHCAHPSGrid.addColumn("evsPeriod7", "period7", "Period 7", "Period 7", 200, null, me.evsPeriod7);
			me.evsHCAHPSGrid.addColumn("evsPeriod8", "period8", "Period 8", "Period 8", 200, null, me.evsPeriod8);
			me.evsHCAHPSGrid.addColumn("evsPeriod9", "period9", "Period 9", "Period 9", 200, null, me.evsPeriod9);
			me.evsHCAHPSGrid.addColumn("evsPeriod10", "period10", "Period 10", "Period 10", 200, null, me.evsPeriod10);
			me.evsHCAHPSGrid.addColumn("evsPeriod11", "period11", "Period 11", "Period 11", 200, null, me.evsPeriod11);
			me.evsHCAHPSGrid.addColumn("evsPeriod12", "period12", "Period 12", "Period 12", 200, null, me.evsPeriod12);
			me.evsHCAHPSGrid.capColumns();
			
			me.qualityPartnershipGrid = new ui.ctl.Grid({
				id: "QualityPartnershipGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.qualityPartnershipItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.qpMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "QPMetricTypeTitle",
				appendToId: "QualityPartnershipGridControlHolder"
		    });

			me.quarter1 = new ui.ctl.Input.Text({
				id: "Quarter1",
				maxLength: 19,
				appendToId: "QualityPartnershipGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.quarter1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					me.validateControl(me.quarter1, me.qualityPartnershipGrid);
				});
				
			me.quarter2 = new ui.ctl.Input.Text({
				id: "Quarter2",
				maxLength: 19,
				appendToId: "QualityPartnershipGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.quarter2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					me.validateControl(me.quarter2, me.qualityPartnershipGrid);
				});
				
			me.quarter3 = new ui.ctl.Input.Text({
				id: "Quarter3",
				maxLength: 19,
				appendToId: "QualityPartnershipGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.quarter3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					me.validateControl(me.quarter3, me.qualityPartnershipGrid);
				});
				
			me.quarter4 = new ui.ctl.Input.Text({
				id: "Quarter4",
				maxLength: 19,
				appendToId: "QualityPartnershipGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.quarter4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					me.validateControl(me.quarter4, me.qualityPartnershipGrid);
				});
				
			me.qualityPartnershipGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.qpMetricTypeTitle);
			me.qualityPartnershipGrid.addColumn("quarter1", "quarter1", "Quarter 1", "Quarter 1", 200, null, me.quarter1);
			me.qualityPartnershipGrid.addColumn("quarter2", "quarter2", "Quarter 2", "Quarter 2", 200, null, me.quarter2);
			me.qualityPartnershipGrid.addColumn("quarter3", "quarter3", "Quarter 3", "Quarter 3", 200, null, me.quarter3);
			me.qualityPartnershipGrid.addColumn("quarter4", "quarter4", "Quarter 4", "Quarter 4", 200, null, me.quarter4);
			me.qualityPartnershipGrid.capColumns();
			
			me.auditScoreGrid = new ui.ctl.Grid({
				id: "AuditScoreGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.auditScoreItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.asMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "ASMetricTypeTitle",
				appendToId: "AuditScoreGridControlHolder"
		    });

			me.annual1 = new ui.ctl.Input.Text({
				id: "Annual1",
				maxLength: 17,
				appendToId: "AuditScoreGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.annual1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.annual1.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(4);

					if (!(/^\d{1,12}(\.\d{1,4})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.annual1.setValue(newValue);
				});
				
			me.annual2 = new ui.ctl.Input.Text({
				id: "Annual2",
				maxLength: 17,
				appendToId: "AuditScoreGridControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.annual2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.annual2.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(4);

					if (!(/^\d{1,12}(\.\d{1,4})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.annual2.setValue(newValue);
				});
				
			me.auditScoreGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.asMetricTypeTitle);
			me.auditScoreGrid.addColumn("annual1", "annual1", "January / February", "January / February", 200, null, me.annual1);
			me.auditScoreGrid.addColumn("annual2", "annual2", "July / August", "July / August", 200, null, me.annual2);
			me.auditScoreGrid.capColumns();

			me.adminObjectiveGrid = new ui.ctl.Grid({
				id: "AdminObjectiveGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.adminObjectiveItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.aoMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "AOMetricTypeTitle",
				appendToId: "AdminObjectiveGridControlHolder"
		    });

			me.aoQuarter1 = new ui.ctl.Input.DropDown.Filtered({
		        id: "AOQuarter1",
		        formatFunction: function(type) { return type.name; },
		        appendToId: "AdminObjectiveGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.aoQuarter1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

					if (me.aoQuarter1.lastBlurValue == "")
						return;

					if (me.aoQuarter1.indexSelected == -1)
						this.setInvalid("Please select the correct Objective.");
				});

			me.aoQuarter2 = new ui.ctl.Input.DropDown.Filtered({
		        id: "AOQuarter2",
		        formatFunction: function(type) { return type.name; },
		        appendToId: "AdminObjectiveGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.aoQuarter2.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

					if (me.aoQuarter2.lastBlurValue == "")
						return;

					if (me.aoQuarter2.indexSelected == -1)
						this.setInvalid("Please select the correct Objective.");
				});

				me.aoQuarter3 = new ui.ctl.Input.DropDown.Filtered({
		        id: "AOQuarter3",
		        formatFunction: function(type) { return type.name; },
		        appendToId: "AdminObjectiveGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.aoQuarter3.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

					if (me.aoQuarter3.lastBlurValue == "")
						return;

					if (me.aoQuarter3.indexSelected == -1)
						this.setInvalid("Please select the correct Objective.");
				});

			me.aoQuarter4 = new ui.ctl.Input.DropDown.Filtered({
		        id: "AOQuarter4",
		        formatFunction: function(type) { return type.name; },
		        appendToId: "AdminObjectiveGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.aoQuarter4.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

					if (me.aoQuarter4.lastBlurValue == "")
						return;

					if (me.aoQuarter4.indexSelected == -1)
						this.setInvalid("Please select the correct Objective.");
				});

			me.adminObjectiveGrid.addColumn("aoMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.aoMetricTypeTitle);
			me.adminObjectiveGrid.addColumn("aoQuarter1", "quarter1", "Quarter 1", "Quarter 1", 300, function(objective) { return objective.name; }, me.aoQuarter1);
			me.adminObjectiveGrid.addColumn("aoQuarter2", "quarter2", "Quarter 2", "Quarter 2", 300, function(objective) { return objective.name; }, me.aoQuarter2);
			me.adminObjectiveGrid.addColumn("aoQuarter3", "quarter3", "Quarter 3", "Quarter 3", 300, function(objective) { return objective.name; }, me.aoQuarter3);
			me.adminObjectiveGrid.addColumn("aoQuarter4", "quarter4", "Quarter 4", "Quarter 4", 300, function(objective) { return objective.name; }, me.aoQuarter4);
			me.adminObjectiveGrid.capColumns();

			me.inHouseStandardMetricGrid = new ui.ctl.Grid({
				id: "InHouseStandardMetricGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.inHouseStandardMetricItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.ihMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "IHMetricTypeTitle",
				appendToId: "InHouseStandardMetricGridControlHolder"
		    });

			me.ihOnTimeScheduled = new ui.ctl.Input.Text({
				id: "IHOnTimeScheduled",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihOnTimeScheduled.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihOnTimeScheduled.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihOnTimeScheduled.setValue(newValue);
				});

			me.ihRTA10 = new ui.ctl.Input.Text({
				id: "IHRTA10",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihRTA10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihRTA10.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihRTA10.setValue(newValue);
				});

			me.ihDTC20 = new ui.ctl.Input.Text({
				id: "IHDTC20",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihDTC20.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihDTC20.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihDTC20.setValue(newValue);
				});

			me.ihRTC30 = new ui.ctl.Input.Text({
				id: "IHRTC30",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihRTC30.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihRTC30.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihRTC30.setValue(newValue);
				});

			me.ihTPPH = new ui.ctl.Input.Text({
				id: "IHTPPH",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihTPPH.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihTPPH.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihTPPH.setValue(newValue);
				});

			me.ihTPPD = new ui.ctl.Input.Text({
				id: "IHTPPD",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihTPPD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihTPPD.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihTPPD.setValue(newValue);
				});

			me.ihITPPD = new ui.ctl.Input.Text({
				id: "IHITPPD",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihITPPD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihITPPD.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihITPPD.setValue(newValue);
				});

			me.ihCancellation = new ui.ctl.Input.Text({
				id: "IHCancellation",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihCancellation.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihCancellation.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihCancellation.setValue(newValue);
				});

			me.ihDelay = new ui.ctl.Input.Text({
				id: "IHDelay",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihDelay.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihDelay.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihDelay.setValue(newValue);
				});

			me.ihDischarges = new ui.ctl.Input.Text({
				id: "IHDischarges",
				maxLength: 19,
				appendToId: "InHouseStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.ihDischarges.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.ihDischarges.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.ihDischarges.setValue(newValue);
				});

			me.inHouseStandardMetricGrid.addColumn("ptMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.ihMetricTypeTitle);
			me.inHouseStandardMetricGrid.addColumn("ihOnTimeScheduled", "onTimeScheduled", "On Time Scheduled (%)", "On Time Scheduled (%)", 170, null, me.ihOnTimeScheduled);
			me.inHouseStandardMetricGrid.addColumn("ihRTA10", "rta10", "RTA 10 (%)", "RTA 10 (%)", 150, null, me.ihRTA10);
			me.inHouseStandardMetricGrid.addColumn("ihDTC20", "dtc20", "DTC 20 (%)", "DTC 20 (%)", 150, null, me.ihDTC20);
			me.inHouseStandardMetricGrid.addColumn("ihRTC30", "rtc30", "RTC 30 (%)", "RTC 30 (%)", 150, null, me.ihRTC30);
			me.inHouseStandardMetricGrid.addColumn("ihTPPH", "tpph", "TPPH", "TPPH", 150, null, me.ihTPPH);
			me.inHouseStandardMetricGrid.addColumn("ihTPPD", "tppd", "TPPD", "TPPD", 150, null, me.ihTPPD);
			me.inHouseStandardMetricGrid.addColumn("ihITPPD", "itppd", "ITPPD", "ITPPD", 150, null, me.ihITPPD);
			me.inHouseStandardMetricGrid.addColumn("ihCancellation", "cancellation", "Cancellation (%)", "Cancellation (%)", 150, null, me.ihCancellation);
			me.inHouseStandardMetricGrid.addColumn("ihDelay", "delay", "Delay (%)", "Delay (%)", 150, null, me.ihDelay);
			me.inHouseStandardMetricGrid.addColumn("ihDischarges", "discharges", "Discharges (%)", "Discharges (%)", 150, null, me.ihDischarges);
			me.inHouseStandardMetricGrid.capColumns();

			me.thirdPartyStandardMetricGrid = new ui.ctl.Grid({
				id: "ThirdPartyStandardMetricGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.thirdPartyStandardMetricItemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.tpMetricTypeTitle = new ui.ctl.Input.Text({
		        id: "TPMetricTypeTitle",
				appendToId: "ThirdPartyStandardMetricGridControlHolder"
		    });

			me.tpOnTimeScheduled = new ui.ctl.Input.Text({
				id: "TPOnTimeScheduled",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpOnTimeScheduled.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpOnTimeScheduled.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpOnTimeScheduled.setValue(newValue);
				});

			me.tpRTA10 = new ui.ctl.Input.Text({
				id: "TPRTA10",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpRTA10.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpRTA10.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpRTA10.setValue(newValue);
				});

			me.tpDTC20 = new ui.ctl.Input.Text({
				id: "TPDTC20",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpDTC20.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpDTC20.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpDTC20.setValue(newValue);
				});

			me.tpRTC30 = new ui.ctl.Input.Text({
				id: "TPRTC30",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpRTC30.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpRTC30.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpRTC30.setValue(newValue);
				});

			me.tpTPPH = new ui.ctl.Input.Text({
				id: "TPTPPH",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpTPPH.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpTPPH.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpTPPH.setValue(newValue);
				});

			me.tpTPPD = new ui.ctl.Input.Text({
				id: "TPTPPD",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpTPPD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpTPPD.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpTPPD.setValue(newValue);
				});

			me.tpITPPD = new ui.ctl.Input.Text({
				id: "TPITPPD",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpITPPD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpITPPD.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpITPPD.setValue(newValue);
				});

			me.tpCancellation = new ui.ctl.Input.Text({
				id: "TPCancellation",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpCancellation.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpCancellation.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpCancellation.setValue(newValue);
				});

			me.tpDelay = new ui.ctl.Input.Text({
				id: "TPDelay",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpDelay.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpDelay.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpDelay.setValue(newValue);
				});

			me.tpDischarges = new ui.ctl.Input.Text({
				id: "TPDischarges",
				maxLength: 19,
				appendToId: "ThirdPartyStandardMetricGridControlHolder",
				changeFunction: function() { me.modified(); }
			});

			me.tpDischarges.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tpDischarges.getValue();

					if (enteredText == "")
						return;

					var newValue = parseFloat(enteredText).toFixed(3);

					if (!(/^\d{1,15}(\.\d{1,3})?$/.test(newValue)))
						this.setInvalid("Please enter numeric value.");
					else if (newValue != enteredText)
						me.tpDischarges.setValue(newValue);
				});

			me.thirdPartyStandardMetricGrid.addColumn("tpMetricTypeTitle", "ptMetricTypeTitle", "", "", null, null, me.tpMetricTypeTitle);
			me.thirdPartyStandardMetricGrid.addColumn("tpOnTimeScheduled", "onTimeScheduled", "On Time Scheduled (%)", "On Time Scheduled (%)", 170, null, me.tpOnTimeScheduled);
			me.thirdPartyStandardMetricGrid.addColumn("tpRTA10", "rta10", "RTA 10 (%)", "RTA 10 (%)", 150, null, me.tpRTA10);
			me.thirdPartyStandardMetricGrid.addColumn("tpDTC20", "dtc20", "DTC 20 (%)", "DTC 20 (%)", 150, null, me.tpDTC20);
			me.thirdPartyStandardMetricGrid.addColumn("tpRTC30", "rtc30", "RTC 30 (%)", "RTC 30 (%)", 150, null, me.tpRTC30);
			me.thirdPartyStandardMetricGrid.addColumn("tpTPPH", "tpph", "TPPH", "TPPH", 150, null, me.tpTPPH);
			me.thirdPartyStandardMetricGrid.addColumn("tpTPPD", "tppd", "TPPD", "TPPD", 150, null, me.tpTPPD);
			me.thirdPartyStandardMetricGrid.addColumn("tpITPPD", "itppd", "ITPPD", "ITPPD", 150, null, me.tpITPPD);
			me.thirdPartyStandardMetricGrid.addColumn("tpCancellation", "cancellation", "Cancellation (%)", "Cancellation (%)", 150, null, me.tpCancellation);
			me.thirdPartyStandardMetricGrid.addColumn("tpDelay", "delay", "Delay (%)", "Delay (%)", 150, null, me.tpDelay);
			me.thirdPartyStandardMetricGrid.addColumn("tpDischarges", "discharges", "Discharges (%)", "Discharges (%)", 150, null, me.tpDischarges);
			me.thirdPartyStandardMetricGrid.capColumns();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.ptMetric.HirNode,
				itemConstructorArgs: fin.hcm.ptMetric.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.ptMetric.HouseCode,
				itemConstructorArgs: fin.hcm.ptMetric.houseCodeArgs,
				injectionArray: me.houseCodes
			});			

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.hcm.ptMetric.FiscalYear,
				itemConstructorArgs: fin.hcm.ptMetric.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});		
			
			me.taskManagementSystems = [];
			me.taskManagementSystemStore = me.cache.register({
				storeId: "ptTaskManagementSystems",
				itemConstructor: fin.hcm.ptMetric.TaskManagementSystem,
				itemConstructorArgs: fin.hcm.ptMetric.taskManagementSystemArgs,
				injectionArray: me.taskManagementSystems
			});
			
			me.administratorObjectives = [];
			me.administratorObjectiveStore = me.cache.register({
				storeId: "ptAdministratorObjectives",
				itemConstructor: fin.hcm.ptMetric.AdministratorObjective,
				itemConstructorArgs: fin.hcm.ptMetric.administratorObjectiveArgs,
				injectionArray: me.administratorObjectives
			});
			
			me.metricTypes = [];
			me.metricTypeStore = me.cache.register({
				storeId: "ptMetricTypes",
				itemConstructor: fin.hcm.ptMetric.MetricType,
				itemConstructorArgs: fin.hcm.ptMetric.metricTypeArgs,
				injectionArray: me.metricTypes
			});
			
			me.metrics = [];
			me.metricStore = me.cache.register({
				storeId: "ptMetrics",
				itemConstructor: fin.hcm.ptMetric.Metric,
				itemConstructorArgs: fin.hcm.ptMetric.metricArgs,
				injectionArray: me.metrics
			});
			
			me.numericDetails = [];
			me.numericDetailStore = me.cache.register({
				storeId: "ptMetricNumericDetails",
				itemConstructor: fin.hcm.ptMetric.NumericDetail,
				itemConstructorArgs: fin.hcm.ptMetric.numericDetailArgs,
				injectionArray: me.numericDetails,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.textDetails = [];
			me.textDetailStore = me.cache.register({
				storeId: "ptMetricTextDetails",
				itemConstructor: fin.hcm.ptMetric.TextDetail,
				itemConstructorArgs: fin.hcm.ptMetric.textDetailArgs,
				injectionArray: me.textDetails,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.strategicInitiatives = [];
			me.strategicInitiativeStore = me.cache.register({
				storeId: "ptMetricStrategicInitiatives",
				itemConstructor: fin.hcm.ptMetric.StrategicInitiative,
				itemConstructorArgs: fin.hcm.ptMetric.strategicInitiativeArgs,
				injectionArray: me.strategicInitiatives
			});
			
			me.qualityPartnerships = [];
			me.qualityPartnershipStore = me.cache.register({
				storeId: "ptMetricQualityPartnerships",
				itemConstructor: fin.hcm.ptMetric.QualityPartnership,
				itemConstructorArgs: fin.hcm.ptMetric.qualityPartnershipArgs,
				injectionArray: me.qualityPartnerships,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.auditScores = [];
			me.auditScoreStore = me.cache.register({
				storeId: "ptMetricAuditScores",
				itemConstructor: fin.hcm.ptMetric.AuditScore,
				itemConstructorArgs: fin.hcm.ptMetric.auditScoreArgs,
				injectionArray: me.auditScores,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.laborControls = [];
			me.laborControlStore = me.cache.register({
				storeId: "ptLaborControls",
				itemConstructor: fin.hcm.ptMetric.LaborControl,
				itemConstructorArgs: fin.hcm.ptMetric.laborControlArgs,
				injectionArray: me.laborControls,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.qualityControls = [];
			me.qualityControlStore = me.cache.register({
				storeId: "ptQualityControls",
				itemConstructor: fin.hcm.ptMetric.QualityControl,
				itemConstructorArgs: fin.hcm.ptMetric.qualityControlArgs,
				injectionArray: me.qualityControls,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.ptPressGaneys = [];
			me.pressGaneyStore = me.cache.register({
				storeId: "ptPressGaneys",
				itemConstructor: fin.hcm.ptMetric.PTPressGaney,
				itemConstructorArgs: fin.hcm.ptMetric.ptPressGaneyArgs,
				injectionArray: me.ptPressGaneys,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
			
			me.evsHCAHPS = [];
			me.evsHCAHPSStore = me.cache.register({
				storeId: "ptEVSHCAHPS",
				itemConstructor: fin.hcm.ptMetric.EVSHCAHPS,
				itemConstructorArgs: fin.hcm.ptMetric.evsHCAHPSArgs,
				injectionArray: me.evsHCAHPS,
				lookupSpec: { ptMetricType: me.metricTypes }
			});

			me.adminObjectives = [];
			me.adminObjectiveStore = me.cache.register({
				storeId: "ptMetricAdminObjectives",
				itemConstructor: fin.hcm.ptMetric.AdminObjective,
				itemConstructorArgs: fin.hcm.ptMetric.adminObjectiveArgs,
				injectionArray: me.adminObjectives,
				lookupSpec: { ptMetricType: me.metricTypes, quarter1: me.administratorObjectives, quarter2: me.administratorObjectives, quarter3: me.administratorObjectives, quarter4: me.administratorObjectives }
			});

			me.standardMetrics = [];
			me.standardMetricStore = me.cache.register({
				storeId: "ptStandardMetrics",
				itemConstructor: fin.hcm.ptMetric.StandardMetric,
				itemConstructorArgs: fin.hcm.ptMetric.standardMetricArgs,
				injectionArray: me.standardMetrics,
				lookupSpec: { ptMetricType: me.metricTypes }
			});
		},
		
		initialize: function() {
			var me = this;
			
			$("#TabCollection a").mousedown(function() {
				me.activeFrameId = 0;
				if (this.id == "TabHospitalContract")
					me.activeFrameId = 1;
				else if (this.id == "TabLaborControl")
					me.activeFrameId = 2;
				else if (this.id == "TabStrategicInitiative")
					me.activeFrameId = 3;
				else if (this.id == "TabQualityControl")
					me.activeFrameId = 4;
				else if (this.id == "TabQualityAssurance")
					me.activeFrameId = 5;
				else if (this.id == "TabAdminObjectives")
					me.activeFrameId = 6;
				else if (this.id == "TabAdministrative")
					me.activeFrameId = 7;
					
				$("#container-1").tabs(me.activeFrameId);
				$("#container-1").triggerTab(me.activeFrameId);
				setTimeout(function() {
					me.resizeControls(me.activeFrameId);
				}, 100)
				
				if (me.activeFrameId == 7)
					$("#HouseCode").hide();
				else
					$("#HouseCode").show();
			});

			$("#QualityAssuranceContainer").bind("scroll", me.qualityAssuranceGridScroll);
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
		
		setTabIndexes: function() {
			var me = this;
			
			me.chiefExecutiveOfficer.text.tabIndex = 1;
			me.chiefFinancialOfficer.text.tabIndex = 2;
			me.chiefOperatingOfficer.text.tabIndex = 3;
			me.chiefNursingOfficer.text.tabIndex = 4;
			me.contractStartDate.text.tabIndex = 5;
			me.contractRenewalDate.text.tabIndex = 6;
			me.cpiDueDate.text.tabIndex = 7;
			me.cpiCap.text.tabIndex = 8;
			me.costedTripCycleTime.text.tabIndex = 9;
			me.contractedAnnualTrips.text.tabIndex = 10;
			me.taskManagementSystem.text.tabIndex = 11;
			me.taskManagementSystemOther.text.tabIndex = 12;
			me.hourlyFTEVacancies.text.tabIndex = 13;
			me.fullTimePartTimeRatio.text.tabIndex = 14;
			me.operatingCapacity.text.tabIndex = 15;
			me.serviceLineEVS.text.tabIndex = 16;
			me.serviceLineLaundry.text.tabIndex = 17;
			me.serviceLinePOM.text.tabIndex = 18;
			me.serviceLineCES.text.tabIndex = 19;
			me.notes.tabIndex = 20;
		},

		qualityAssuranceGridScroll: function() {
		    var me = fin.hcmPTMetricUi;

			me.ptPressGaneyGrid.setHeight(150);
			me.evsHCAHPSGrid.setHeight(150);
			me.qualityPartnershipGrid.setHeight(150);
			me.auditScoreGrid.setHeight(150);
		},

		resizeControls: function(selectedTab) {
			var me = this;

			if (selectedTab == 1) {
				me.chiefExecutiveOfficer.resizeText();
				me.chiefFinancialOfficer.resizeText();
				me.chiefOperatingOfficer.resizeText();
				me.chiefNursingOfficer.resizeText();
				me.contractStartDate.resizeText();
				me.contractRenewalDate.resizeText();
				me.cpiDueDate.resizeText();
				me.cpiCap.resizeText();
				me.hourlyFTEVacancies.resizeText();
				me.fullTimePartTimeRatio.resizeText();
				me.operatingCapacity.resizeText();
				me.serviceLineEVS.resizeText();
				me.serviceLineLaundry.resizeText();
				me.serviceLinePOM.resizeText();
				me.serviceLineCES.resizeText();
				me.costedTripCycleTime.resizeText();
				me.contractedAnnualTrips.resizeText();
				me.taskManagementSystem.resizeText();
				me.taskManagementSystemOther.resizeText();
			}
			else if (selectedTab == 2) {
				if ($("#LaborControlGridContainer").width() < 2650) {
					$("#LaborControlGrid").width(2650);
					me.laborControlGrid.setHeight($(window).height() - 168);
				}
				else {
					me.laborControlGrid.setHeight($(window).height() - 143);
				}
			}
			else if (selectedTab == 3) {
				me.strategicInitiativeGrid.setHeight($(window).height() - 145);
			}
			else if (selectedTab == 4) {
				if ($("#QualityControlGridContainer").width() < 2600) {
					$("#QualityControlGrid").width(2600);
					me.qualityControlGrid.setHeight($(window).height() - 168);
				}
				else {
					me.qualityControlGrid.setHeight($(window).height() - 143);
				}
			}
			else if (selectedTab == 5) {
				if ($("#PTPressGaneyGridContainer").width() < 2600) {
					$("#PTPressGaneyGrid").width(2600);
				}
				if ($("#EVSHCAHPSGridContainer").width() < 2600) {
					$("#EVSHCAHPSGrid").width(2600);
				}
				me.ptPressGaneyGrid.setHeight(150);
				me.evsHCAHPSGrid.setHeight(150);
				me.qualityPartnershipGrid.setHeight(150);
				me.auditScoreGrid.setHeight(150);
			}
			else if (selectedTab == 6) {
				me.adminObjectiveGrid.setHeight($(window).height() - 145);
			}
			else if (selectedTab == 7) {
				if ($("#InHouseStandardMetricGridContainer").width() < 1800) {
					$("#InHouseStandardMetricGrid").width(1800);
				}
				if ($("#ThirdPartyStandardMetricGridContainer").width() < 1800) {
					$("#ThirdPartyStandardMetricGrid").width(1800);
				}
				me.inHouseStandardMetricGrid.setHeight(200);
				me.thirdPartyStandardMetricGrid.setHeight(200);
			}
		},
		
		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.chiefExecutiveOfficer.setValue("");
			me.chiefFinancialOfficer.setValue("");
			me.chiefOperatingOfficer.setValue("");
			me.chiefNursingOfficer.setValue("");
			me.contractStartDate.setValue("");
			me.contractRenewalDate.setValue("");
			me.cpiDueDate.setValue("");
			me.cpiCap.setValue("");
			me.hourlyFTEVacancies.setValue("");
			me.fullTimePartTimeRatio.setValue("");
			me.operatingCapacity.setValue("");
			me.serviceLineEVS.setValue("");
			me.serviceLineLaundry.setValue("");
			me.serviceLinePOM.setValue("");
			me.serviceLineCES.setValue("");
			me.costedTripCycleTime.setValue("");
			me.contractedAnnualTrips.setValue("");
			me.taskManagementSystem.reset();
			me.taskManagementSystemOther.setValue("");
			me.notes.value = "";
			$("#TMSOtherContainer").hide();

			if (me.laborControlGrid.activeRowIndex != - 1)
				me.laborControlGrid.body.deselect(me.laborControlGrid.activeRowIndex, true);
			if (me.strategicInitiativeGrid.activeRowIndex != - 1)
				me.strategicInitiativeGrid.body.deselect(me.strategicInitiativeGrid.activeRowIndex, true);
			if (me.qualityControlGrid.activeRowIndex != - 1)
				me.qualityControlGrid.body.deselect(me.qualityControlGrid.activeRowIndex, true);
			if (me.ptPressGaneyGrid.activeRowIndex != - 1)
				me.ptPressGaneyGrid.body.deselect(me.ptPressGaneyGrid.activeRowIndex, true);
			if (me.evsHCAHPSGrid.activeRowIndex != - 1)
				me.evsHCAHPSGrid.body.deselect(me.evsHCAHPSGrid.activeRowIndex, true);
			if (me.qualityPartnershipGrid.activeRowIndex != - 1)
				me.qualityPartnershipGrid.body.deselect(me.qualityPartnershipGrid.activeRowIndex, true);
			if (me.auditScoreGrid.activeRowIndex != - 1)
				me.auditScoreGrid.body.deselect(me.auditScoreGrid.activeRowIndex, true);
			if (me.adminObjectiveGrid.activeRowIndex != - 1)
				me.adminObjectiveGrid.body.deselect(me.adminObjectiveGrid.activeRowIndex, true);	

			me.laborControlGrid.setData([]);
			me.strategicInitiativeGrid.setData([]);
			me.qualityControlGrid.setData([]);
			me.ptPressGaneyGrid.setData([]);
			me.evsHCAHPSGrid.setData([]);
			me.qualityPartnershipGrid.setData([]);
			me.auditScoreGrid.setData([]);
			me.adminObjectiveGrid.setData([]);

			me.numericDetailStore.reset();
			me.textDetailStore.reset();
			me.strategicInitiativeStore.reset();
			me.qualityPartnershipStore.reset();
			me.auditScoreStore.reset();
			me.adminObjectiveStore.reset();
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

			me.yearChanged();
		},

		metricTypesLoaded: function(me, activeId) {

		},
		
		taskManagementSystemsLoaded: function(me, activeId) {

			me.taskManagementSystem.setData(me.taskManagementSystems);
		},
		
		administratorObjectivesLoaded: function(me, activeId) {

			me.aoQuarter1.setData(me.administratorObjectives);
			me.aoQuarter2.setData(me.administratorObjectives);
			me.aoQuarter3.setData(me.administratorObjectives);
			me.aoQuarter4.setData(me.administratorObjectives);	
		},

		fiscalYearsLoaded: function(me, activeId) {

			me.year.setData(me.fiscalYears);
			me.year.select(0, me.year.focused);
			me.yearChanged();
		},
		
		yearChanged: function() {
			var me = this;

			if (me.year.indexSelected == -1)
				return;

			me.setLoadCount();
			me.metricStore.reset();
			me.standardMetricStore.reset();
			me.metricStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",yearId:" + me.fiscalYears[me.year.indexSelected].id, me.metricsLoaded, me);
			me.standardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.standardMetricsLoaded, me);
		},

		metricsLoaded: function(me, activeId) {

			me.resetControls();
			
			if (me.metrics.length > 0) {
				me.ptMetricId = me.metrics[0].id;
				me.chiefExecutiveOfficer.setValue(me.metrics[0].chiefExecutiveOfficer);
				me.chiefFinancialOfficer.setValue(me.metrics[0].chiefFinancialOfficer);
				me.chiefOperatingOfficer.setValue(me.metrics[0].chiefOperatingOfficer);
				me.chiefNursingOfficer.setValue(me.metrics[0].chiefNursingOfficer);
				me.contractStartDate.setValue(me.metrics[0].contractStartDate);
				me.contractRenewalDate.setValue(me.metrics[0].contractRenewalDate);
				me.cpiDueDate.setValue(me.metrics[0].cpiDueDate);
				me.cpiCap.setValue(me.metrics[0].cpiCap);
				me.hourlyFTEVacancies.setValue(me.metrics[0].hourlyFTEVacancies);
				me.fullTimePartTimeRatio.setValue(me.metrics[0].fullTimePartTimeRatio);
				me.operatingCapacity.setValue(me.metrics[0].percentageOperatingCapacity);
				me.serviceLineEVS.setValue(me.metrics[0].serviceLineEVS);
				me.serviceLineLaundry.setValue(me.metrics[0].serviceLineLaundry);
				me.serviceLinePOM.setValue(me.metrics[0].serviceLinePOM);
				me.serviceLineCES.setValue(me.metrics[0].serviceLineCES);
				me.costedTripCycleTime.setValue(me.metrics[0].costedTripCycleTime);
				me.contractedAnnualTrips.setValue(me.metrics[0].contractedAnnualTrips);
				var itemIndex = ii.ajax.util.findIndexById(me.metrics[0].taskManagementSystem.toString(), me.taskManagementSystems);
				if (itemIndex != undefined && itemIndex >= 0)
					me.taskManagementSystem.select(itemIndex, me.taskManagementSystem.focused);
				me.taskManagementSystemOther.setValue(me.metrics[0].taskManagementSystemOther);
				me.notes.value = me.metrics[0].notes;
				if (me.taskManagementSystem.lastBlurValue == "Other")
					$("#TMSOtherContainer").show();
				else
					$("#TMSOtherContainer").hide();

				me.numericDetailStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.numericDetailsLoaded, me);
				me.strategicInitiativeStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.strategicInitiativesLoaded, me);
				me.qualityPartnershipStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.qualityPartnershipsLoaded, me);
				me.auditScoreStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.auditScoresLoaded, me);
				me.adminObjectiveStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.adminObjectivesLoaded, me);
			}
			else {
				me.ptMetricId = 0;
				me.setGridData();
				me.checkLoadCount();
			}

			$("#container-1").triggerTab(me.activeFrameId);
			setTimeout(function() {
				me.resizeControls(me.activeFrameId);
			}, 100);
		},
		
		standardMetricsLoaded: function(me, activeId) {
		
			me.inHouseStandardMetrics = [];
			me.thirdPartyStandardMetrics = [];
			
			if (me.inHouseStandardMetricGrid.activeRowIndex != - 1)
				me.inHouseStandardMetricGrid.body.deselect(me.inHouseStandardMetricGrid.activeRowIndex, true);
			if (me.thirdPartyStandardMetricGrid.activeRowIndex != - 1)
				me.thirdPartyStandardMetricGrid.body.deselect(me.thirdPartyStandardMetricGrid.activeRowIndex, true);
			
			if (me.standardMetrics.length == 0) {
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Thresholds - In House") {
						var item = new fin.hcm.ptMetric.InHouseStandardMetric(0
							, me.fiscalYears[me.year.indexSelected].id
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)
						me.inHouseStandardMetrics.push(item);
					}
					else if (me.metricTypes[index].subType == "Thresholds - Third Party") {
						var item = new fin.hcm.ptMetric.ThirdPartyStandardMetric(0
							, me.fiscalYears[me.year.indexSelected].id
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)
						me.thirdPartyStandardMetrics.push(item);
					}
				}
			}
			else {
				for (var index = 0; index < me.standardMetrics.length; index++) {
					if (me.standardMetrics[index].ptMetricType.subType == "Thresholds - In House") {
						var item = new fin.hcm.ptMetric.InHouseStandardMetric(me.standardMetrics[index].id
							, me.standardMetrics[index].yearId
							, me.standardMetrics[index].ptMetricType
							, me.standardMetrics[index].ptMetricType.title
							, me.standardMetrics[index].onTimeScheduled
							, me.standardMetrics[index].rta10
							, me.standardMetrics[index].dtc20
							, me.standardMetrics[index].rtc30
							, me.standardMetrics[index].tpph
							, me.standardMetrics[index].tppd
							, me.standardMetrics[index].itppd
							, me.standardMetrics[index].cancellation
							, me.standardMetrics[index].delay
							, me.standardMetrics[index].discharges
							)
						
						me.inHouseStandardMetrics.push(item);
					}
					else if (me.standardMetrics[index].ptMetricType.subType == "Thresholds - Third Party") {
						var item = new fin.hcm.ptMetric.ThirdPartyStandardMetric(me.standardMetrics[index].id
							, me.standardMetrics[index].yearId
							, me.standardMetrics[index].ptMetricType
							, me.standardMetrics[index].ptMetricType.title
							, me.standardMetrics[index].onTimeScheduled
							, me.standardMetrics[index].rta10
							, me.standardMetrics[index].dtc20
							, me.standardMetrics[index].rtc30
							, me.standardMetrics[index].tpph
							, me.standardMetrics[index].tppd
							, me.standardMetrics[index].itppd
							, me.standardMetrics[index].cancellation
							, me.standardMetrics[index].delay
							, me.standardMetrics[index].discharges
							)
						
						me.thirdPartyStandardMetrics.push(item);
					}
				}
				
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Thresholds - In House") {
						var result = $.grep(me.standardMetrics, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                        	me.inHouseStandardMetrics.push(new fin.hcm.ptMetric.InHouseStandardMetric(0
								, me.fiscalYears[me.year.indexSelected].id
								, me.metricTypes[index]
								, me.metricTypes[index].title
								));
					}
					else if (me.metricTypes[index].subType == "Thresholds - Third Party") {
						var result = $.grep(me.standardMetrics, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                        	me.thirdPartyStandardMetrics.push(new fin.hcm.ptMetric.ThirdPartyStandardMetric(0
								, me.fiscalYears[me.year.indexSelected].id
								, me.metricTypes[index]
								, me.metricTypes[index].title
								));
					}
				}
			}
			
			me.inHouseStandardMetricGrid.setData(me.inHouseStandardMetrics);
			me.thirdPartyStandardMetricGrid.setData(me.thirdPartyStandardMetrics);
		},

		numericDetailsLoaded: function(me, activeId) {
			
			me.textDetailStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.textDetailsLoaded, me);
		},
		
		textDetailsLoaded: function(me, activeId) {

			me.setGridData();
		},
		
		strategicInitiativesLoaded: function(me, activeId) {

			me.strategicInitiativeGrid.setData(me.strategicInitiatives);
		},
		
		qualityPartnershipsLoaded: function(me, activeId) {

			for (var index = 0; index < me.metricTypes.length; index++) {
				if (me.metricTypes[index].subType == "Quality Partnership") {
					var result = $.grep(me.qualityPartnerships, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
					if (result.length == 0)
						me.qualityPartnerships.push(new fin.hcm.ptMetric.QualityPartnership(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
				}
			}
			me.qualityPartnershipGrid.setData(me.qualityPartnerships);
		},

		auditScoresLoaded: function(me, activeId) {

			for (var index = 0; index < me.metricTypes.length; index++) {
				if (me.metricTypes[index].subType == "Audit Scores") {
					var result = $.grep(me.auditScores, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
					if (result.length == 0)
						me.auditScores.push(new fin.hcm.ptMetric.AuditScore(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
				}
			}
			me.auditScoreGrid.setData(me.auditScores);
		},

		adminObjectivesLoaded: function(me, activeId) {

			for (var index = 0; index < me.metricTypes.length; index++) {
				if (me.metricTypes[index].subType == "Admin Objective") {
					var result = $.grep(me.adminObjectives, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
					if (result.length == 0)
						me.adminObjectives.push(new fin.hcm.ptMetric.AdminObjective(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
				}
			}
			me.adminObjectiveGrid.setData(me.adminObjectives);
		},

		setGridData: function() {
			var me = this;
			
			me.laborControls = [];
			me.qualityControls = [];
			me.ptPressGaneys = [];
			me.evsHCAHPS = [];

 			if (me.numericDetails.length == 0) {
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Labor Control") {
						var item = new fin.hcm.ptMetric.LaborControl(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.laborControls.push(item);
					}
					else if (me.metricTypes[index].subType == "Quality Control") {
						var item = new fin.hcm.ptMetric.QualityControl(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.qualityControls.push(item);
					}
					else if (me.metricTypes[index].subType == "Quality Assurance - PT Press Ganey") {
						var item = new fin.hcm.ptMetric.PTPressGaney(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.ptPressGaneys.push(item);
					}
					else if (me.metricTypes[index].subType == "Quality Assurance - EVS HCAHPS") {
						var item = new fin.hcm.ptMetric.EVSHCAHPS(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.evsHCAHPS.push(item);
					}
					else if (me.metricTypes[index].subType == "Quality Partnership") {
						var item = new fin.hcm.ptMetric.QualityPartnership(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.qualityPartnerships.push(item);
					}
					else if (me.metricTypes[index].subType == "Audit Scores") {
						var item = new fin.hcm.ptMetric.AuditScore(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)

						me.auditScores.push(item);
					}
					else if (me.metricTypes[index].subType == "Admin Objective") {
						var item = new fin.hcm.ptMetric.AdminObjective(
							0
							, me.ptMetricId
							, me.metricTypes[index]
							, me.metricTypes[index].title
							)
						me.adminObjectives.push(item);
					}
				}

				me.strategicInitiativeGrid.setData(me.strategicInitiatives);
				me.qualityPartnershipGrid.setData(me.qualityPartnerships);
				me.auditScoreGrid.setData(me.auditScores);
				me.adminObjectiveGrid.setData(me.adminObjectives);
			}
			else {
				for (var index = 0; index < me.numericDetails.length; index++) {
					if (me.numericDetails[index].ptMetricType.subType == "Labor Control") {
						var item = new fin.hcm.ptMetric.LaborControl(
							me.numericDetails[index].id
							, me.numericDetails[index].ptMetricId
							, me.numericDetails[index].ptMetricType
							, me.numericDetails[index].ptMetricType.title
							, me.numericDetails[index].period1
							, me.numericDetails[index].period2
							, me.numericDetails[index].period3
							, me.numericDetails[index].period4
							, me.numericDetails[index].period5
							, me.numericDetails[index].period6
							, me.numericDetails[index].period7
							, me.numericDetails[index].period8
							, me.numericDetails[index].period9
							, me.numericDetails[index].period10
							, me.numericDetails[index].period11
							, me.numericDetails[index].period12
							)
							
						me.laborControls.push(item);
					}
					else if (me.numericDetails[index].ptMetricType.subType == "Quality Control") {
						var item = new fin.hcm.ptMetric.QualityControl(
							me.numericDetails[index].id
							, me.numericDetails[index].ptMetricId
							, me.numericDetails[index].ptMetricType
							, me.numericDetails[index].ptMetricType.title
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period1 : (me.numericDetails[index].period1 == "" ? "" : parseInt(me.numericDetails[index].period1, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period2 : (me.numericDetails[index].period2 == "" ? "" : parseInt(me.numericDetails[index].period2, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period3 : (me.numericDetails[index].period3 == "" ? "" : parseInt(me.numericDetails[index].period3, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period4 : (me.numericDetails[index].period4 == "" ? "" : parseInt(me.numericDetails[index].period4, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period5 : (me.numericDetails[index].period5 == "" ? "" : parseInt(me.numericDetails[index].period5, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period6 : (me.numericDetails[index].period6 == "" ? "" : parseInt(me.numericDetails[index].period6, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period7 : (me.numericDetails[index].period7 == "" ? "" : parseInt(me.numericDetails[index].period7, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period8 : (me.numericDetails[index].period8 == "" ? "" : parseInt(me.numericDetails[index].period8, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period9 : (me.numericDetails[index].period9 == "" ? "" : parseInt(me.numericDetails[index].period9, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period10 : (me.numericDetails[index].period10 == "" ? "" : parseInt(me.numericDetails[index].period10, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period11 : (me.numericDetails[index].period11 == "" ? "" : parseInt(me.numericDetails[index].period11, 10)))
							, (me.numericDetails[index].ptMetricType.dataType == "Decimal" ? me.numericDetails[index].period12 : (me.numericDetails[index].period12 == "" ? "" : parseInt(me.numericDetails[index].period12, 10)))
							)

						me.qualityControls.push(item);
					}
					else if (me.numericDetails[index].ptMetricType.subType == "Quality Assurance - PT Press Ganey") {
						var item = new fin.hcm.ptMetric.PTPressGaney(
							me.numericDetails[index].id
							, me.numericDetails[index].ptMetricId
							, me.numericDetails[index].ptMetricType
							, me.numericDetails[index].ptMetricType.title
							, me.numericDetails[index].period1
							, me.numericDetails[index].period2
							, me.numericDetails[index].period3
							, me.numericDetails[index].period4
							, me.numericDetails[index].period5
							, me.numericDetails[index].period6
							, me.numericDetails[index].period7
							, me.numericDetails[index].period8
							, me.numericDetails[index].period9
							, me.numericDetails[index].period10
							, me.numericDetails[index].period11
							, me.numericDetails[index].period12
							)
							
						me.ptPressGaneys.push(item);
					}
					else if (me.numericDetails[index].ptMetricType.subType == "Quality Assurance - EVS HCAHPS") {
						var item = new fin.hcm.ptMetric.EVSHCAHPS(
							me.numericDetails[index].id
							, me.numericDetails[index].ptMetricId
							, me.numericDetails[index].ptMetricType
							, me.numericDetails[index].ptMetricType.title
							, me.numericDetails[index].period1
							, me.numericDetails[index].period2
							, me.numericDetails[index].period3
							, me.numericDetails[index].period4
							, me.numericDetails[index].period5
							, me.numericDetails[index].period6
							, me.numericDetails[index].period7
							, me.numericDetails[index].period8
							, me.numericDetails[index].period9
							, me.numericDetails[index].period10
							, me.numericDetails[index].period11
							, me.numericDetails[index].period12
							)
							
						me.evsHCAHPS.push(item);
					}
				}

				for (var index = 0; index < me.textDetails.length; index++) {
					if (me.textDetails[index].ptMetricType.subType == "Labor Control") {
						var item = new fin.hcm.ptMetric.LaborControl(
							me.textDetails[index].id
							, me.textDetails[index].ptMetricId
							, me.textDetails[index].ptMetricType
							, me.textDetails[index].ptMetricType.title
							, me.textDetails[index].period1
							, me.textDetails[index].period2
							, me.textDetails[index].period3
							, me.textDetails[index].period4
							, me.textDetails[index].period5
							, me.textDetails[index].period6
							, me.textDetails[index].period7
							, me.textDetails[index].period8
							, me.textDetails[index].period9
							, me.textDetails[index].period10
							, me.textDetails[index].period11
							, me.textDetails[index].period12
							)

						if (me.textDetails[index].ptMetricType.title == "Total Paid Labor Comments")
							me.laborControls.splice(2, 0, item);
						else if (me.textDetails[index].ptMetricType.title == "Total Hours Labor Comments")
							me.laborControls.splice(5, 0, item);
						else
							me.laborControls.push(item);
					}
					else if (me.textDetails[index].ptMetricType.subType == "Quality Assurance - PT Press Ganey") {
						var item = new fin.hcm.ptMetric.PTPressGaney(
							me.textDetails[index].id
							, me.textDetails[index].ptMetricId
							, me.textDetails[index].ptMetricType
							, me.textDetails[index].ptMetricType.title
							, me.textDetails[index].period1
							, me.textDetails[index].period2
							, me.textDetails[index].period3
							, me.textDetails[index].period4
							, me.textDetails[index].period5
							, me.textDetails[index].period6
							, me.textDetails[index].period7
							, me.textDetails[index].period8
							, me.textDetails[index].period9
							, me.textDetails[index].period10
							, me.textDetails[index].period11
							, me.textDetails[index].period12
							)
							
						me.ptPressGaneys.push(item);
					}
					else if (me.textDetails[index].ptMetricType.subType == "Quality Assurance - EVS HCAHPS") {
						var item = new fin.hcm.ptMetric.EVSHCAHPS(
							me.textDetails[index].id
							, me.textDetails[index].ptMetricId
							, me.textDetails[index].ptMetricType
							, me.textDetails[index].ptMetricType.title
							, me.textDetails[index].period1
							, me.textDetails[index].period2
							, me.textDetails[index].period3
							, me.textDetails[index].period4
							, me.textDetails[index].period5
							, me.textDetails[index].period6
							, me.textDetails[index].period7
							, me.textDetails[index].period8
							, me.textDetails[index].period9
							, me.textDetails[index].period10
							, me.textDetails[index].period11
							, me.textDetails[index].period12
							)
							
						me.evsHCAHPS.push(item);
					}
				}
				
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Labor Control") {
						var result = $.grep(me.laborControls, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                        	me.laborControls.push(new fin.hcm.ptMetric.LaborControl(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
					}
				}
				
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Quality Control") {
						var result = $.grep(me.qualityControls, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                        	me.qualityControls.push(new fin.hcm.ptMetric.QualityControl(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
					}
				}
				
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Quality Assurance - PT Press Ganey") {
						var result = $.grep(me.ptPressGaneys, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                        	me.ptPressGaneys.push(new fin.hcm.ptMetric.PTPressGaney(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
					}
				}
				
				for (var index = 0; index < me.metricTypes.length; index++) {
					if (me.metricTypes[index].subType == "Quality Assurance - EVS HCAHPS") {
						var result = $.grep(me.evsHCAHPS, function(item) { return item.ptMetricType.id == me.metricTypes[index].id; });
						if (result.length == 0)
                       		me.evsHCAHPS.push(new fin.hcm.ptMetric.EVSHCAHPS(0, me.ptMetricId, me.metricTypes[index], me.metricTypes[index].title));
					}
				}
			}

			me.ptPressGaneys.sort(me.customSort);
			me.evsHCAHPS.sort(me.customSort);
			me.laborControlGrid.setData(me.laborControls);
			me.qualityControlGrid.setData(me.qualityControls);
			me.ptPressGaneyGrid.setData(me.ptPressGaneys);
			me.evsHCAHPSGrid.setData(me.evsHCAHPS);

			if (me.reloadData) {
				me.reloadData = false;
				$("#pageLoading").fadeOut("slow");
			}
			else {
				me.checkLoadCount();
			}
		},

		// This is a comparison function that will result in data being sorted in display order.
		customSort: function(a, b) {
			if (a.ptMetricType.displayOrder > b.ptMetricType.displayOrder) return 1;
		  	if (a.ptMetricType.displayOrder < b.ptMetricType.displayOrder) return -1;
		  	return 0;
		},
		
		validateControl: function(control, activeGrid) {
			var me = this;
			var enteredText = control.getValue();

			if (enteredText == "" || activeGrid.activeRowIndex == -1)
				return;

			var dataType = activeGrid.data[activeGrid.activeRowIndex].ptMetricType.dataType;
			if (dataType == "Decimal") {
				var newValue = parseFloat(enteredText).toFixed(2);
				
				if (!(/^\d{1,16}(\.\d{1,2})?$/.test(newValue))) 
					control.setInvalid("Please enter numeric value.");
				else if (newValue != enteredText) 
					control.setValue(newValue);
			}
			else if (dataType == "Integer") {
				if (!(/^\d+$/.test(enteredText)))
					control.setInvalid("Please enter valid number.");
			}
		},

		laborControlItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.laborControlGrid.data[index] != undefined) {
				me.laborControlGrid.data[index].modified = true;
				me.period1.text.select();
				me.period1.text.focus();
				me.metricTypeTitle.text.readOnly = true;
			}
		},
		
		strategicInitiativeItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.strategicInitiativeGrid.data[index] != undefined) {
				me.strategicInitiativeGrid.data[index].modified = true;
			}
		},
		
		qualityControlItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.qualityControlGrid.data[index] != undefined) {
				me.qualityControlGrid.data[index].modified = true;
				me.qcPeriod1.text.select();
				me.qcPeriod1.text.focus();
				me.qcMetricTypeTitle.text.readOnly = true;
			}
		},
		
		ptPressGaneyItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.ptPressGaneyGrid.data[index] != undefined) {
				me.ptPressGaneyGrid.data[index].modified = true;
				me.pgPeriod1.text.select();
				me.pgPeriod1.text.focus();
				me.pressGaneyMetricTypeTitle.text.readOnly = true;
			}
		},
		
		evsHCAHPSItemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.evsHCAHPSGrid.data[index] != undefined) {
				me.evsHCAHPSGrid.data[index].modified = true;
				me.evsPeriod1.text.select();
				me.evsPeriod1.text.focus();
				me.evsHCAHPSMetricTypeTitle.text.readOnly = true;
			}
		},
		
		qualityPartnershipItemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.qualityPartnershipGrid.data[index] != undefined) {
				me.qualityPartnershipGrid.data[index].modified = true;
				me.qpMetricTypeTitle.text.readOnly = true;
			}
		},
		
		auditScoreItemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.auditScoreGrid.data[index] != undefined) {
				me.auditScoreGrid.data[index].modified = true;
				me.asMetricTypeTitle.text.readOnly = true;
			}
		},
		
		adminObjectiveItemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.adminObjectiveGrid.data[index] != undefined) {
				me.adminObjectiveGrid.data[index].modified = true;
				me.aoMetricTypeTitle.text.readOnly = true;
			}
		},
		
		inHouseStandardMetricItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.inHouseStandardMetricGrid.data[index] != undefined) {
				me.inHouseStandardMetricGrid.data[index].modified = true;
				me.ihOnTimeScheduled.text.select();
				me.ihOnTimeScheduled.text.focus();
				me.ihMetricTypeTitle.text.readOnly = true;
			}
		},

		thirdPartyStandardMetricItemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.thirdPartyStandardMetricGrid.data[index] != undefined) {
				me.thirdPartyStandardMetricGrid.data[index].modified = true;
				me.tpOnTimeScheduled.text.select();
				me.tpOnTimeScheduled.text.focus();
				me.tpMetricTypeTitle.text.readOnly = true;
			}
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
						
			me.yearChanged();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];

			// Check to see if the data entered is valid
			me.laborControlGrid.body.deselectAll();
			me.strategicInitiativeGrid.body.deselectAll();
			me.qualityControlGrid.body.deselectAll();
			me.ptPressGaneyGrid.body.deselectAll();
			me.evsHCAHPSGrid.body.deselectAll();
			me.qualityPartnershipGrid.body.deselectAll();
			me.auditScoreGrid.body.deselectAll();
			me.adminObjectiveGrid.body.deselectAll();
			me.inHouseStandardMetricGrid.body.deselectAll();
			me.thirdPartyStandardMetricGrid.body.deselectAll();

			me.validator.forceBlur();
			me.validator.queryValidity(true);

			if (!me.year.valid) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			if (me.hospitalContractShow) {
				if (!me.chiefExecutiveOfficer.valid || !me.chiefFinancialOfficer.valid || !me.chiefOperatingOfficer.valid
					|| !me.chiefNursingOfficer.valid || !me.contractStartDate.valid || !me.contractRenewalDate.valid
					|| !me.cpiDueDate.valid || !me.cpiCap.valid || !me.hourlyFTEVacancies.valid || !me.fullTimePartTimeRatio.valid
					|| !me.operatingCapacity.valid || !me.serviceLineEVS.valid || !me.serviceLineLaundry.valid
					|| !me.serviceLinePOM.valid || !me.serviceLineCES.valid 
					|| !me.costedTripCycleTime.valid || !me.contractedAnnualTrips.valid || !me.taskManagementSystem.valid || !me.taskManagementSystemOther.valid) {
					alert("In order to save, the errors on the page must be corrected. Please verify the data on Hospital & Contract tab.");
					return false;
				}
			}

			if (me.laborControlShow && me.laborControlGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Labor Control tab.");
				return false;
			}

			if (me.strategicInitiativesShow && me.strategicInitiativeGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Strategic Initiatives tab.");
				return false;
			}

			if (me.qualityControlShow && me.qualityControlGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Quality Control tab.");
				return false;
			}

			if (me.qualityAssuranceShow && (me.ptPressGaneyGrid.activeRowIndex >= 0	|| me.evsHCAHPSGrid.activeRowIndex >= 0 
				|| me.qualityPartnershipGrid.activeRowIndex >= 0 || me.auditScoreGrid.activeRowIndex >= 0)) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Quality Assurance tab.");
				return false;
			}
			
			if (me.adminObjectivesShow && me.adminObjectiveGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Admin Objectives tab.");
				return false;
			}
			
			if (me.administrativeShow && (me.inHouseStandardMetricGrid.activeRowIndex >= 0 || me.thirdPartyStandardMetricGrid.activeRowIndex >= 0)) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Administrative tab.");
				return false;
			}

			item = new fin.hcm.ptMetric.Metric(
				me.ptMetricId
				, parent.fin.appUI.houseCodeId
				, me.fiscalYears[me.year.indexSelected].id
				, me.chiefExecutiveOfficer.getValue()
				, me.chiefFinancialOfficer.getValue()
				, me.chiefOperatingOfficer.getValue()
				, me.chiefNursingOfficer.getValue()
				, me.contractStartDate.lastBlurValue
				, me.contractRenewalDate.lastBlurValue
				, me.cpiDueDate.lastBlurValue
				, me.cpiCap.getValue()
				, me.hourlyFTEVacancies.getValue()
				, me.fullTimePartTimeRatio.getValue()
				, me.operatingCapacity.getValue()
				, me.serviceLineEVS.getValue()
				, me.serviceLineLaundry.getValue()
				, me.serviceLinePOM.getValue()
				, me.serviceLineCES.getValue()
				, me.costedTripCycleTime.getValue()
				, me.contractedAnnualTrips.getValue()
				, (me.taskManagementSystem.indexSelected >= 0 ? me.taskManagementSystems[me.taskManagementSystem.indexSelected].id : 0)
				, me.taskManagementSystemOther.getValue()
				, me.notes.value
				);
			
			var xml = me.saveXmlBuild(item);

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
				item: {type: fin.hcm.ptMetric.Metric}
			});
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.hospitalContractShow || me.laborControlShow || me.strategicInitiativesShow || me.qualityControlShow || me.qualityAssuranceShow || me.adminObjectivesShow) {
				xml += '<ptMetric';
				xml += ' id="' + item.id + '"';
				xml += ' houseCodeId="' + item.houseCodeId + '"';
				xml += ' yearId="' + item.yearId + '"';
				xml += ' chiefExecutiveOfficer="' + ui.cmn.text.xml.encode(item.chiefExecutiveOfficer) + '"';
				xml += ' chiefFinancialOfficer="' + ui.cmn.text.xml.encode(item.chiefFinancialOfficer) + '"';
				xml += ' chiefOperatingOfficer="' + ui.cmn.text.xml.encode(item.chiefOperatingOfficer) + '"';
				xml += ' chiefNursingOfficer="' + ui.cmn.text.xml.encode(item.chiefNursingOfficer) + '"';
				xml += ' contractStartDate="' + item.contractStartDate + '"';
				xml += ' contractRenewalDate="' + item.contractRenewalDate + '"';
				xml += ' cpiDueDate="' + item.cpiDueDate + '"';
				xml += ' cpiCap="' + item.cpiCap + '"';
				xml += ' hourlyFTEVacancies="' + item.hourlyFTEVacancies + '"';
				xml += ' fullTimePartTimeRatio="' + ui.cmn.text.xml.encode(item.fullTimePartTimeRatio) + '"';
				xml += ' percentageOperatingCapacity="' + item.percentageOperatingCapacity + '"';
				xml += ' serviceLineEVS="' + ui.cmn.text.xml.encode(item.serviceLineEVS) + '"';
				xml += ' serviceLineLaundry="' + ui.cmn.text.xml.encode(item.serviceLineLaundry) + '"';
				xml += ' serviceLinePOM="' + ui.cmn.text.xml.encode(item.serviceLinePOM) + '"';
				xml += ' serviceLineCES="' + ui.cmn.text.xml.encode(item.serviceLineCES) + '"';
				xml += ' costedTripCycleTime="' + item.costedTripCycleTime + '"';
				xml += ' contractedAnnualTrips="' + item.contractedAnnualTrips + '"';
				xml += ' taskManagementSystem="' + item.taskManagementSystem + '"';
				xml += ' taskManagementSystemOther="' + ui.cmn.text.xml.encode(item.taskManagementSystemOther) + '"';
				xml += ' notes="' + ui.cmn.text.xml.encode(item.notes) + '"';
				xml += '/>';
			}

			if (me.laborControlShow) {
				for (var index = 0; index < me.laborControls.length; index++) {
					if (me.laborControls[index].modified || me.laborControls[index].id == 0) {
						me.laborControls[index].modified = false;
						if (me.laborControls[index].id == 0)
							me.reloadData = true;
						if (me.laborControls[index].ptMetricType.dataType == "Decimal")
							xml += '<ptMetricNumericDetail';
						else
							xml += '<ptMetricTextDetail';
						xml += ' id="' + me.laborControls[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.laborControls[index].ptMetricType.id + '"';
						xml += ' period1="' + ui.cmn.text.xml.encode(me.laborControls[index].period1) + '"';
						xml += ' period2="' + ui.cmn.text.xml.encode(me.laborControls[index].period2) + '"';
						xml += ' period3="' + ui.cmn.text.xml.encode(me.laborControls[index].period3) + '"';
						xml += ' period4="' + ui.cmn.text.xml.encode(me.laborControls[index].period4) + '"';
						xml += ' period5="' + ui.cmn.text.xml.encode(me.laborControls[index].period5) + '"';
						xml += ' period6="' + ui.cmn.text.xml.encode(me.laborControls[index].period6) + '"';
						xml += ' period7="' + ui.cmn.text.xml.encode(me.laborControls[index].period7) + '"';
						xml += ' period8="' + ui.cmn.text.xml.encode(me.laborControls[index].period8) + '"';
						xml += ' period9="' + ui.cmn.text.xml.encode(me.laborControls[index].period9) + '"';
						xml += ' period10="' + ui.cmn.text.xml.encode(me.laborControls[index].period10) + '"';
						xml += ' period11="' + ui.cmn.text.xml.encode(me.laborControls[index].period11) + '"';
						xml += ' period12="' + ui.cmn.text.xml.encode(me.laborControls[index].period12) + '"';
						xml += '/>';
					}
				}
			}

			if (me.strategicInitiativesShow) {
				for (var index = 0; index < me.strategicInitiatives.length; index++) {
					if (me.strategicInitiatives[index].modified || me.strategicInitiatives[index].id == 0) {
						me.strategicInitiatives[index].modified = true;
						xml += '<ptMetricStrategicInitiative';
						xml += ' id="' + me.strategicInitiatives[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' hospitalIntiative="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].hospitalIntiative) + '"';
						xml += ' expectedOutcome="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].expectedOutcome) + '"';
						xml += ' departmentIntiative="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].departmentIntiative) + '"';
						xml += '/>';
					}
				}
			}

			if (me.qualityControlShow) {
				for (var index = 0; index < me.qualityControls.length; index++) {
					if (me.qualityControls[index].modified || me.qualityControls[index].id == 0) {
						me.qualityControls[index].modified = false;
						if (me.qualityControls[index].id == 0)
							me.reloadData = true;
						if (me.qualityControls[index].ptMetricType.dataType == "Decimal" || me.qualityControls[index].ptMetricType.dataType == "Integer")
							xml += '<ptMetricNumericDetail';
						else
							xml += '<ptMetricTextDetail';
						xml += ' id="' + me.qualityControls[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.qualityControls[index].ptMetricType.id + '"';
						xml += ' period1="' + ui.cmn.text.xml.encode(me.qualityControls[index].period1) + '"';
						xml += ' period2="' + ui.cmn.text.xml.encode(me.qualityControls[index].period2) + '"';
						xml += ' period3="' + ui.cmn.text.xml.encode(me.qualityControls[index].period3) + '"';
						xml += ' period4="' + ui.cmn.text.xml.encode(me.qualityControls[index].period4) + '"';
						xml += ' period5="' + ui.cmn.text.xml.encode(me.qualityControls[index].period5) + '"';
						xml += ' period6="' + ui.cmn.text.xml.encode(me.qualityControls[index].period6) + '"';
						xml += ' period7="' + ui.cmn.text.xml.encode(me.qualityControls[index].period7) + '"';
						xml += ' period8="' + ui.cmn.text.xml.encode(me.qualityControls[index].period8) + '"';
						xml += ' period9="' + ui.cmn.text.xml.encode(me.qualityControls[index].period9) + '"';
						xml += ' period10="' + ui.cmn.text.xml.encode(me.qualityControls[index].period10) + '"';
						xml += ' period11="' + ui.cmn.text.xml.encode(me.qualityControls[index].period11) + '"';
						xml += ' period12="' + ui.cmn.text.xml.encode(me.qualityControls[index].period12) + '"';
						xml += '/>';
					}
				}
			}
			
			if (me.qualityAssuranceShow) {
				for (var index = 0; index < me.ptPressGaneys.length; index++) {
					if (me.ptPressGaneys[index].modified || me.ptPressGaneys[index].id == 0) {
						me.ptPressGaneys[index].modified = false;
						if (me.ptPressGaneys[index].id == 0)
							me.reloadData = true;
						if (me.ptPressGaneys[index].ptMetricType.dataType == "Decimal")
							xml += '<ptMetricNumericDetail';
						else
							xml += '<ptMetricTextDetail';
						xml += ' id="' + me.ptPressGaneys[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.ptPressGaneys[index].ptMetricType.id + '"';
						xml += ' period1="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period1) + '"';
						xml += ' period2="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period2) + '"';
						xml += ' period3="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period3) + '"';
						xml += ' period4="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period4) + '"';
						xml += ' period5="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period5) + '"';
						xml += ' period6="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period6) + '"';
						xml += ' period7="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period7) + '"';
						xml += ' period8="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period8) + '"';
						xml += ' period9="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period9) + '"';
						xml += ' period10="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period10) + '"';
						xml += ' period11="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period11) + '"';
						xml += ' period12="' + ui.cmn.text.xml.encode(me.ptPressGaneys[index].period12) + '"';
						xml += '/>';
					}
				}
	
				for (var index = 0; index < me.evsHCAHPS.length; index++) {
					if (me.evsHCAHPS[index].modified || me.evsHCAHPS[index].id == 0) {
						me.evsHCAHPS[index].modified = false;
						if (me.evsHCAHPS[index].id == 0)
							me.reloadData = true;
						if (me.evsHCAHPS[index].ptMetricType.dataType == "Decimal")
							xml += '<ptMetricNumericDetail';
						else
							xml += '<ptMetricTextDetail';
						xml += ' id="' + me.evsHCAHPS[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.evsHCAHPS[index].ptMetricType.id + '"';
						xml += ' period1="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period1) + '"';
						xml += ' period2="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period2) + '"';
						xml += ' period3="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period3) + '"';
						xml += ' period4="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period4) + '"';
						xml += ' period5="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period5) + '"';
						xml += ' period6="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period6) + '"';
						xml += ' period7="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period7) + '"';
						xml += ' period8="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period8) + '"';
						xml += ' period9="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period9) + '"';
						xml += ' period10="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period10) + '"';
						xml += ' period11="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period11) + '"';
						xml += ' period12="' + ui.cmn.text.xml.encode(me.evsHCAHPS[index].period12) + '"';
						xml += '/>';
					}
				}

				for (var index = 0; index < me.qualityPartnerships.length; index++) {
					if (me.qualityPartnerships[index].modified || me.qualityPartnerships[index].id == 0) {
						me.qualityPartnerships[index].modified = true;
						xml += '<ptMetricQualityPartnership';
						xml += ' id="' + me.qualityPartnerships[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.qualityPartnerships[index].ptMetricType.id + '"';
						xml += ' quarter1="' + me.qualityPartnerships[index].quarter1 + '"';
						xml += ' quarter2="' + me.qualityPartnerships[index].quarter2 + '"';
						xml += ' quarter3="' + me.qualityPartnerships[index].quarter3 + '"';
						xml += ' quarter4="' + me.qualityPartnerships[index].quarter4 + '"';
						xml += '/>';
					}
				}
	
				for (var index = 0; index < me.auditScores.length; index++) {
					if (me.auditScores[index].modified || me.auditScores[index].id == 0) {
						me.auditScores[index].modified = true;
						xml += '<ptMetricAuditScore';
						xml += ' id="' + me.auditScores[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.auditScores[index].ptMetricType.id + '"';
						xml += ' annual1="' + me.auditScores[index].annual1 + '"';
						xml += ' annual2="' + me.auditScores[index].annual2 + '"';
						xml += '/>';
					}
				}
			}

			if (me.adminObjectivesShow) {
				for (var index = 0; index < me.adminObjectives.length; index++) {
					if (me.adminObjectives[index].modified || me.adminObjectives[index].id == 0) {
						me.adminObjectives[index].modified = true;
						xml += '<ptMetricAdminObjective';
						xml += ' id="' + me.adminObjectives[index].id + '"';
						xml += ' ptMetricId="' + me.ptMetricId + '"';
						xml += ' ptMetricTypeId="' + me.adminObjectives[index].ptMetricType.id + '"';
						xml += ' quarter1="' + ((me.adminObjectives[index].quarter1 == null || me.adminObjectives[index].quarter1 == undefined) ? "0" : me.adminObjectives[index].quarter1.id) + '"';
						xml += ' quarter2="' + ((me.adminObjectives[index].quarter2 == null || me.adminObjectives[index].quarter2 == undefined) ? "0" : me.adminObjectives[index].quarter2.id) + '"';
						xml += ' quarter3="' + ((me.adminObjectives[index].quarter3 == null || me.adminObjectives[index].quarter3 == undefined) ? "0" : me.adminObjectives[index].quarter3.id) + '"';
						xml += ' quarter4="' + ((me.adminObjectives[index].quarter4 == null || me.adminObjectives[index].quarter4 == undefined) ? "0" : me.adminObjectives[index].quarter4.id) + '"';
						xml += '/>';
					}
				}
			}

			if (me.administrativeShow) {
				for (var index = 0; index < me.inHouseStandardMetrics.length; index++) {
					if (me.inHouseStandardMetrics[index].modified || me.inHouseStandardMetrics[index].id == 0) {
						me.inHouseStandardMetrics[index].modified = false;
						if (me.inHouseStandardMetrics[index].id == 0)
							me.reloadData = true;
						xml += '<ptStandardMetric';
						xml += ' id="' + me.inHouseStandardMetrics[index].id + '"';
						xml += ' yearId="' + me.inHouseStandardMetrics[index].yearId + '"';
						xml += ' ptMetricTypeId="' + me.inHouseStandardMetrics[index].ptMetricType.id + '"';
						xml += ' onTimeScheduled="' + me.inHouseStandardMetrics[index].onTimeScheduled + '"';
						xml += ' rta10="' + me.inHouseStandardMetrics[index].rta10 + '"';
						xml += ' dtc20="' + me.inHouseStandardMetrics[index].dtc20 + '"';
						xml += ' rtc30="' + me.inHouseStandardMetrics[index].rtc30 + '"';
						xml += ' tpph="' + me.inHouseStandardMetrics[index].tpph + '"';
						xml += ' tppd="' + me.inHouseStandardMetrics[index].tppd + '"';
						xml += ' itppd="' + me.inHouseStandardMetrics[index].itppd + '"';
						xml += ' cancellation="' + me.inHouseStandardMetrics[index].cancellation + '"';
						xml += ' delay="' + me.inHouseStandardMetrics[index].delay + '"';
						xml += ' discharges="' + me.inHouseStandardMetrics[index].discharges + '"';
						xml += '/>';
					}
				}
				
				for (var index = 0; index < me.thirdPartyStandardMetrics.length; index++) {
					if (me.thirdPartyStandardMetrics[index].modified || me.thirdPartyStandardMetrics[index].id == 0) {
						me.thirdPartyStandardMetrics[index].modified = false;
						if (me.thirdPartyStandardMetrics[index].id == 0)
							me.reloadData = true;
						xml += '<ptStandardMetric';
						xml += ' id="' + me.thirdPartyStandardMetrics[index].id + '"';
						xml += ' yearId="' + me.thirdPartyStandardMetrics[index].yearId + '"';
						xml += ' ptMetricTypeId="' + me.thirdPartyStandardMetrics[index].ptMetricType.id + '"';
						xml += ' onTimeScheduled="' + me.thirdPartyStandardMetrics[index].onTimeScheduled + '"';
						xml += ' rta10="' + me.thirdPartyStandardMetrics[index].rta10 + '"';
						xml += ' dtc20="' + me.thirdPartyStandardMetrics[index].dtc20 + '"';
						xml += ' rtc30="' + me.thirdPartyStandardMetrics[index].rtc30 + '"';
						xml += ' tpph="' + me.thirdPartyStandardMetrics[index].tpph + '"';
						xml += ' tppd="' + me.thirdPartyStandardMetrics[index].tppd + '"';
						xml += ' itppd="' + me.thirdPartyStandardMetrics[index].itppd + '"';
						xml += ' cancellation="' + me.thirdPartyStandardMetrics[index].cancellation + '"';
						xml += ' delay="' + me.thirdPartyStandardMetrics[index].delay + '"';
						xml += ' discharges="' + me.thirdPartyStandardMetrics[index].discharges + '"';
						xml += '/>';
					}
				}
			}

			return xml;
		},
		
		/* @iiDoc {Method}
		* Handles the server's response to a save transaction.
		*/
		saveResponse: function(){
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

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {
						case "ptMetric":
							if (me.ptMetricId == 0) {
								me.ptMetricId = parseInt($(this).attr("id"), 10);
								item.id = me.ptMetricId;
								me.metrics.push(item);
								me.reloadData = true;
							}
							break;

						case "ptMetricStrategicInitiative":
							var id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.strategicInitiativeGrid.data.length; index++) {
								if (me.strategicInitiativeGrid.data[index].modified) {
									if (me.strategicInitiativeGrid.data[index].id == 0)
										me.strategicInitiativeGrid.data[index].id = id;
									me.strategicInitiativeGrid.data[index].modified = false;
									break;
								}
							}
							break;
							
						case "ptMetricQualityPartnership":
							var id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.qualityPartnershipGrid.data.length; index++) {
								if (me.qualityPartnershipGrid.data[index].modified) {
									if (me.qualityPartnershipGrid.data[index].id == 0)
										me.qualityPartnershipGrid.data[index].id = id;
									me.qualityPartnershipGrid.data[index].modified = false;
									break;
								}
							}
							break;
							
						case "ptMetricAuditScore":
							var id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.auditScoreGrid.data.length; index++) {
								if (me.auditScoreGrid.data[index].modified) {
									if (me.auditScoreGrid.data[index].id == 0)
										me.auditScoreGrid.data[index].id = id;
									me.auditScoreGrid.data[index].modified = false;
									break;
								}
							}
							break;
							
						case "ptMetricAdminObjective":
							var id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.adminObjectiveGrid.data.length; index++) {
								if (me.adminObjectiveGrid.data[index].modified) {
									if (me.adminObjectiveGrid.data[index].id == 0)
										me.adminObjectiveGrid.data[index].id = id;
									me.adminObjectiveGrid.data[index].modified = false;
									break;
								}
							}
							break;
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating pt metric details: " + $(args.xmlNode).attr("message"));
			}

			if (!me.reloadData)
				$("#pageLoading").fadeOut("slow");
			else {
				me.numericDetailStore.reset();
				me.textDetailStore.reset();
				me.standardMetricStore.reset();
				me.numericDetailStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.numericDetailsLoaded, me);
				me.standardMetricStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.standardMetricsLoaded, me);
			}
		}
	}
});

function main() {

	fin.hcmPTMetricUi = new fin.hcm.ptMetric.UserInterface();
	fin.hcmPTMetricUi.resize();
	fin.houseCodeSearchUi = fin.hcmPTMetricUi;
}
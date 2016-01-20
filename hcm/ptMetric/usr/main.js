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
			var args = ii.args(arguments, {});
			var me = this;
			
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

			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
			$("#QualityAssuranceContainer").bind("scroll", me.qualityAssuranceGridScroll);
			setTimeout(function() {
				me.resizeControls(1);
			}, 100);
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_hcm_ptMetric_UserInterface_authorizationProcess() {
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
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
				me.metricTypeStore.fetch("userId:[user]", me.metricTypesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	
		
		sessionLoaded: function fin_hcm_ptMetric_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			var me = args.me;

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

			if ($("#LaborControlGridContainer").width() < 2600) {
				$("#LaborControlGrid").width(2600);
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
			
			me.strategicInitiativeGrid.setHeight($(window).height() - 145);
			me.ptPressGaneyGrid.setHeight(150);
			me.evsHCAHPSGrid.setHeight(150);
			me.qualityPartnershipGrid.setHeight(150);
			me.auditScoreGrid.setHeight(150);
		},

		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
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
		},
		
		initialize: function() {
			var me = this;
			
			$("#TabCollection a").mousedown(function() {
				var tabIndex = 0;
				if (this.id == "TabHospitalContract")
					tabIndex = 1;
				else if (this.id == "TabLaborControl")
					tabIndex = 2;
				else if (this.id == "TabStrategicInitiative")
					tabIndex = 3;
				else if (this.id == "TabQualityControl")
					tabIndex = 4;
				else if (this.id == "TabQualityAssurance")
					tabIndex = 5;
					
				$("#container-1").tabs(tabIndex);
				$("#container-1").triggerTab(tabIndex);
				setTimeout(function() {
					me.resizeControls(tabIndex);
				}, 100)		
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
			me.hourlyFTEVacancies.text.tabIndex = 9;
			me.fullTimePartTimeRatio.text.tabIndex = 10;
			me.operatingCapacity.text.tabIndex = 11;
			me.serviceLineEVS.text.tabIndex = 12;
			me.serviceLineLaundry.text.tabIndex = 13;
			me.serviceLinePOM.text.tabIndex = 14;
			me.serviceLineCES.text.tabIndex = 15;
			me.notes.tabIndex = 16;
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
			}
			else  if (selectedTab == 2) {
				if ($("#LaborControlGridContainer").width() < 2600) {
					$("#LaborControlGrid").width(2600);
					me.laborControlGrid.setHeight($(window).height() - 168);
				}
				else {
					me.laborControlGrid.setHeight($(window).height() - 143);
				}
			}
			else  if (selectedTab == 3) {
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
			me.notes.value = "";

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

			me.laborControlGrid.setData([]);
			me.strategicInitiativeGrid.setData([]);
			me.qualityControlGrid.setData([]);
			me.ptPressGaneyGrid.setData([]);
			me.evsHCAHPSGrid.setData([]);
			me.qualityPartnershipGrid.setData([]);
			me.auditScoreGrid.setData([]);

			me.numericDetailStore.reset();
			me.textDetailStore.reset();
			me.strategicInitiativeStore.reset();
			me.qualityPartnershipStore.reset();
			me.auditScoreStore.reset();
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
			me.metricStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",yearId:" + me.fiscalYears[me.year.indexSelected].id, me.metricsLoaded, me);
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
				me.notes.value = me.metrics[0].notes;
				
				me.numericDetailStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.numericDetailsLoaded, me);
				me.strategicInitiativeStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.strategicInitiativesLoaded, me);
				me.qualityPartnershipStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.qualityPartnershipsLoaded, me);
				me.auditScoreStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.auditScoresLoaded, me);
			}
			else {
				me.ptMetricId = 0;
				me.setGridData();
				me.checkLoadCount();
			}

			$("#container-1").triggerTab(1);
			setTimeout(function() {
				me.resizeControls(1);
			}, 100);
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
				}

				me.strategicInitiativeGrid.setData(me.strategicInitiatives);
				me.qualityPartnershipGrid.setData(me.qualityPartnerships);
				me.auditScoreGrid.setData(me.auditScores);
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

			me.validator.forceBlur();
			me.validator.queryValidity(true);

			if (!me.chiefExecutiveOfficer.valid || !me.chiefFinancialOfficer.valid || !me.chiefOperatingOfficer.valid
				|| !me.chiefNursingOfficer.valid || !me.contractStartDate.valid || !me.contractRenewalDate.valid
				|| !me.cpiDueDate.valid || !me.cpiCap.valid || !me.hourlyFTEVacancies.valid || !me.fullTimePartTimeRatio.valid
				|| !me.operatingCapacity.valid || !me.serviceLineEVS.valid || !me.serviceLineLaundry.valid
				|| !me.serviceLinePOM.valid || !me.serviceLineCES.valid || !me.year.valid) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Hospital & Contract Tab.");
				return false;
			}

			if (me.laborControlGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Labor Control Tab.");
				return false;
			}

			if (me.strategicInitiativeGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Strategic Initiatives Tab.");
				return false;
			}

			if (me.qualityControlGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Quality Control Tab.");
				return false;
			}

			if (me.ptPressGaneyGrid.activeRowIndex >= 0	|| me.evsHCAHPSGrid.activeRowIndex >= 0 
				|| me.qualityPartnershipGrid.activeRowIndex >= 0 || me.auditScoreGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected. Please verify the data on Quality Assurance Tab.");
				return false;
			}

			item = new fin.hcm.ptMetric.MetricType(
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
			var xml = "";

			xml += '<ptMetric';
			xml += ' id="' + me.ptMetricId + '"';
			xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
			xml += ' yearId="' + me.fiscalYears[me.year.indexSelected].id + '"';
			xml += ' chiefExecutiveOfficer="' + ui.cmn.text.xml.encode(me.chiefExecutiveOfficer.getValue()) + '"';
			xml += ' chiefFinancialOfficer="' + ui.cmn.text.xml.encode(me.chiefFinancialOfficer.getValue()) + '"';
			xml += ' chiefOperatingOfficer="' + ui.cmn.text.xml.encode(me.chiefOperatingOfficer.getValue()) + '"';
			xml += ' chiefNursingOfficer="' + ui.cmn.text.xml.encode(me.chiefNursingOfficer.getValue()) + '"';
			xml += ' contractStartDate="' + me.contractStartDate.lastBlurValue + '"';
			xml += ' contractRenewalDate="' + me.contractRenewalDate.lastBlurValue + '"';
			xml += ' cpiDueDate="' + me.cpiDueDate.lastBlurValue + '"';
			xml += ' cpiCap="' + me.cpiCap.getValue() + '"';
			xml += ' hourlyFTEVacancies="' + me.hourlyFTEVacancies.getValue() + '"';
			xml += ' fullTimePartTimeRatio="' + ui.cmn.text.xml.encode(me.fullTimePartTimeRatio.getValue()) + '"';
			xml += ' percentageOperatingCapacity="' + me.operatingCapacity.getValue() + '"';
			xml += ' serviceLineEVS="' + ui.cmn.text.xml.encode(me.serviceLineEVS.getValue()) + '"';
			xml += ' serviceLineLaundry="' + ui.cmn.text.xml.encode(me.serviceLineLaundry.getValue()) + '"';
			xml += ' serviceLinePOM="' + ui.cmn.text.xml.encode(me.serviceLinePOM.getValue()) + '"';
			xml += ' serviceLineCES="' + ui.cmn.text.xml.encode(me.serviceLineCES.getValue()) + '"';
			xml += ' notes="' + ui.cmn.text.xml.encode(me.notes.value) + '"';
			xml += '/>';

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
				me.numericDetailStore.fetch("userId:[user],ptMetricId:" + me.ptMetricId, me.numericDetailsLoaded, me);
			}
		}
	}
});

function main() {

	fin.hcmPTMetricUi = new fin.hcm.ptMetric.UserInterface();
	fin.hcmPTMetricUi.resize();
	fin.houseCodeSearchUi = fin.hcmPTMetricUi;
}
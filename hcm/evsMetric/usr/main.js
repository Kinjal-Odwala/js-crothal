ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.hcm.evsMetric.usr.defs" );
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
    Name: "fin.hcm.evsMetric.UserInterface",
    Extends: "ui.lay.HouseCodeSearch",
    Definition: {
        init: function() {
            var me = this;

            me.activeFrameId = 0;
            me.loadCount = 1;
            me.evsMetricId = 0;
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
            me.authorizePath = "\\crothall\\chimes\\fin\\Metrics\\EVSMetrics";
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
            me.typesLoaded();

            me.houseCodeSearch = new ui.lay.HouseCodeSearch();
            if (!parent.fin.appUI.houseCodeId)
                parent.fin.appUI.houseCodeId = 0;
            if (parent.fin.appUI.houseCodeId === 0)
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
                me.taskManagementSystemStore.fetch("userId:[user]", me.taskManagementSystemsLoaded, me);
                me.administratorObjectiveStore.fetch("userId:[user]", me.administratorObjectivesLoaded, me);
                me.metricTypeStore.fetch("userId:[user]", me.metricTypesLoaded, me);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

            me.hospitalContractShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\HospitalContract");
            me.laborControlShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\LaborControl");
            me.strategicInitiativesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\StrategicInit");
            me.qualityAssuranceShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\QualityAssurance");
            me.adminObjectivesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\AdminObjectives");
            me.evsStatisticShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\EVSStatistcs");
            me.managementStaffShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\ManagementStaff");

            if (me.hospitalContractShow)
                $("#TabHospitalContract").show();
            if (me.laborControlShow)
                $("#TabLaborControl").show();
            if (me.strategicInitiativesShow)
                $("#TabStrategicInitiative").show();
            if (me.qualityAssuranceShow)
                $("#TabQualityAssurance").show();
            if (me.adminObjectivesShow)
                $("#TabAdminObjectives").show();
            if (me.evsStatisticShow)
                $("#TabEVSStatistics").show();
            if (me.managementStaffShow)
                $("#TabManagementStaff").show();

            if (me.hospitalContractShow)
                me.activeFrameId = 1;
            else if (me.laborControlShow)
                me.activeFrameId = 2;
            else if (me.strategicInitiativesShow)
                me.activeFrameId = 3;
            else if (me.qualityAssuranceShow)
                me.activeFrameId = 4;
            else if (me.adminObjectivesShow)
                me.activeFrameId = 5;
            else if (me.evsStatisticShow)
                me.activeFrameId = 6;
            else if (me.managementStaffShow)
                me.activeFrameId = 7;
            setTimeout(function() {
                $("#container-1").tabs(me.activeFrameId);
                $("#container-1").triggerTab(me.activeFrameId);
                me.resizeControls(me.activeFrameId);
            }, 100);
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.rmation, "Session");
        },

        resize: function() {
            var me = fin.hcmEVSMetricUi;
            var offset = 100;

            $("#HospitalContractContainer").height($(window).height() - offset);
            $("#LaborControlContainer").height($(window).height() - offset);
            $("#StrategicInitiativeContainer").height($(window).height() - offset);
            $("#QualityAssuranceContainer").height($(window).height() - offset);
            $("#AdminObjectiveContainer").height($(window).height() - offset);
            $("#EVSStatisticContainer").height($(window).height() - offset);
            $("#ManagementStaffContainer").height($(window).height() - offset);

			if ($("#StrategicInitiativeGridContainer").width() < 1200) {
                $("#StrategicInitiativeGrid").width(1200);
               	me.strategicInitiativeGrid.setHeight($(window).height() - 168);
            }
            else {
				$("#StrategicInitiativeGrid").width($("#StrategicInitiativeGridContainer").width() - 5);
                me.strategicInitiativeGrid.setHeight($(window).height() - 150);
            }
            if ($("#QualityAssuranceGridContainer").width() < 2600) {
                $("#QualityAssuranceGrid").width(2600);
            }
			if ($("#QualityPartnershipGridContainer").width() < 1000) {
                $("#QualityPartnershipGrid").width(1000);
            }
            else {
				$("#QualityPartnershipGrid").width($("#QualityPartnershipGridContainer").width() - 5);
            }
			if ($("#CompetencyTrainingGridContainer").width() < 1000) {
                $("#CompetencyTrainingGrid").width(1000);
            }
            else {
				$("#CompetencyTrainingGrid").width($("#CompetencyTrainingGridContainer").width() - 5);
            }
			if ($("#AdminObjectiveGridContainer").width() < 1500) {
                $("#AdminObjectiveGrid").width(1500);
               	me.adminObjectiveGrid.setHeight($(window).height() - 168);
            }
            else {
				$("#AdminObjectiveGrid").width($("#AdminObjectiveGridContainer").width() - 5);
                me.adminObjectiveGrid.setHeight($(window).height() - 150);
            }
            if ($("#EVSStatisticGridContainer").width() < 2500) {
                $("#EVSStatisticGrid").width(2500);
                me.evsStatisticGrid.setHeight($(window).height() - 168);
            }
            else {
                me.evsStatisticGrid.setHeight($(window).height() - 143);
            }
            if ($("#ManagementStaffGridContainer").width() < 2800) {
                $("#ManagementStaffGrid").width(2800);
                me.managementStaffGrid.setHeight($(window).height() - 168);
            }
            else {
                me.managementStaffGrid.setHeight($(window).height() - 143);
            }

            me.qualityAssuranceGrid.setHeight(150);
            me.qualityPartnershipGrid.setHeight(150);
            me.auditScoreGrid.setHeight(150);
            me.competencyTrainingGrid.setHeight(150);

            var divLaborControlGridWidth = $(window).width() - 248;
            var divLaborControlGridHeight = 330;
            $("#divLaborControlGrid").css({"width" : divLaborControlGridWidth + "px", "height" : divLaborControlGridHeight + "px"});

            var divCommentsGridWidth = $(window).width() - 248;
            var divCommentsGridHeight = 50;
            $("#divCommentsGrid").css({"width" : divCommentsGridWidth + "px", "height" : divCommentsGridHeight + "px"});

            if (ii.browser.chrome) {
                $("#tblLaborControlGridHeader").css({"width":"3215px"});
            }
        },

        controlKeyProcessor: function() {
            var args = ii.args(arguments, {
                event: {type: Object}
            });
            var event = args.event;
            var me = event.data;
            var processed = false;

            if (event.ctrlKey) {
                if (event.keyCode === 83) {
                    me.actionSaveItem();
                    processed = true;
                }
                else if (event.keyCode === 85) {
                    me.actionUndoItem();
                    processed = true;
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
                    brief: "Save EVS Metric (Ctrl+S)",
                    title: "Save the current EVS metric details.",
                    actionFunction: function() { me.actionSaveItem(); }
                })
                .addAction({
                    id: "cancelAction",
                    brief: "Undo current changes to EVS Metric (Ctrl+U)",
                    title: "Undo the changes to EVS metric being edited.",
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

                    if (me.year.indexSelected === -1)
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

                    if (enteredText === "")
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

                    if (enteredText === "")
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

                    if (enteredText === "")
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

                    if (enteredText === "")
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

                    if (enteredText === "")
                        return;

                    if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                        this.setInvalid("Please enter valid number.");
                });

            me.fullTimePartTimeRatio = new ui.ctl.Input.Text({
                id: "FullTimePartTimeRatio",
                maxLength: 64,
                changeFunction: function() { me.modified(); }
            });

            me.vacantPositions = new ui.ctl.Input.Text({
                id: "VacantPositions",
                maxLength: 9,
                changeFunction: function () { me.modified(); }
            });

            me.vacantPositions
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {
                    var enteredText = me.vacantPositions.getValue();

                    if (enteredText === "")
                        return;

                    if (!(/^\d{1,9}$/.test(enteredText)))
                        this.setInvalid("Please enter valid number.");
                });

            me.budgetedProductivity = new ui.ctl.Input.Text({
                id: "BudgetedProductivity",
                maxLength: 19,
                changeFunction: function() { me.modified(); }
            });

            me.budgetedProductivity
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {
                    var enteredText = me.budgetedProductivity.getValue();

                    if (enteredText === "")
                        return;

                    if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                        this.setInvalid("Please enter valid number.");
                });

            me.contractedProductivity = new ui.ctl.Input.Text({
                id: "ContractedProductivity",
                maxLength: 19,
                changeFunction: function() { me.modified(); }
            });

            me.contractedProductivity
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {
                    var enteredText = me.contractedProductivity.getValue();

                    if (enteredText === "")
                        return;

                    if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                        this.setInvalid("Please enter valid number.");
                });

            me.supportedByNPC = new ui.ctl.Input.DropDown.Filtered({
                id: "SupportedByNPC",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified(); }
            });

            me.supportedByNPC.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.supportedByNPC.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.supportedByNPC.indexSelected === -1)
                        this.setInvalid("Please select the correct Supported by NPC.");
            });

            me.thirdPartySatisfaction = new ui.ctl.Input.DropDown.Filtered({
                id: "ThirdPartySatisfaction",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() {
                    me.modified();
                    if (me.thirdPartySatisfaction.indexSelected > 0)
						$("#spnThirdPartySatisfaction").html(" - " + me.thirdPartySatisfaction.lastBlurValue);
                    else
                        $("#spnThirdPartySatisfaction").html("");
                }
            });

            me.thirdPartySatisfaction.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.thirdPartySatisfaction.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.thirdPartySatisfaction.indexSelected === -1)
                        this.setInvalid("Please select the correct Third Party Satisfaction");
            });

            me.employeeProductiveHoursPerWeekStandard = new ui.ctl.Input.Text({
                id: "EmployeeProductiveHoursPerWeekStandard",
                maxLength: 19,
                changeFunction: function() { me.modified(); }
            });

            me.employeeProductiveHoursPerWeekStandard
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {
                    var enteredText = me.employeeProductiveHoursPerWeekStandard.getValue();

                    if (enteredText === "")
                        return;

                    if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                        this.setInvalid("Please enter valid number.");
                });

            me.taskManagementSystem = new ui.ctl.Input.DropDown.Filtered({
                id: "TaskManagementSystem",
                formatFunction: function(type) { return type.name; },
                changeFunction: function() {
                    me.modified();
                    if (me.taskManagementSystem.lastBlurValue === "Other") {
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

                    if (enteredText === "")
                        return;

                    if (me.taskManagementSystem.indexSelected === -1)
                        this.setInvalid("Please select the correct Task Management System.");
            });

            me.taskManagementSystemOther = new ui.ctl.Input.Text({
                id: "TaskManagementSystemOther",
                maxLength: 64,
                changeFunction: function() { me.modified(); }
            });

            me.serviceLinePT = new ui.ctl.Input.Text({
                id: "ServiceLinePT",
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

            me.uvManufacturer = new ui.ctl.Input.DropDown.Filtered({
                id: "UVManufacturer",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.uvManufacturer.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.uvManufacturer.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.uvManufacturer.indexSelected === -1)
                        this.setInvalid("Please select the correct UV Manufacturer.");
            });

            me.hygiena = new ui.ctl.Input.DropDown.Filtered({
                id: "Hygiena",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.hygiena.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.hygiena.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.hygiena.indexSelected === -1)
                        this.setInvalid("Please select the correct Hygiena.");
            });

            me.wanda = new ui.ctl.Input.DropDown.Filtered({
                id: "Wanda",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.wanda.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.wanda.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.wanda.indexSelected === -1)
                        this.setInvalid("Please select the correct Wanda.");
            });

            me.union = new ui.ctl.Input.DropDown.Filtered({
                id: "Union",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.union.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.union.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.union.indexSelected === -1)
                        this.setInvalid("Please select the correct Union.");
            });

            me.microFiber = new ui.ctl.Input.DropDown.Filtered({
                id: "MicroFiber",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.microFiber.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.microFiber.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.microFiber.indexSelected === -1)
                        this.setInvalid("Please select the correct Micro Fiber.");
            });

            me.mop = new ui.ctl.Input.DropDown.Filtered({
                id: "MOP",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.mop.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.mop.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.mop.indexSelected === -1)
                        this.setInvalid("Please select the correct MOP.");
            });

            me.cartManufacturer = new ui.ctl.Input.DropDown.Filtered({
                id: "CartManufacturer",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modified();	}
            });

            me.cartManufacturer.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function( isFinal, dataMap) {

                    var enteredText = me.cartManufacturer.lastBlurValue;

                    if (enteredText === "")
                        return;

                    if (me.cartManufacturer.indexSelected === -1)
                        this.setInvalid("Please select the correct Cart Manufacturer.");
            });

            me.managerName = new ui.ctl.Input.Text({
                id: "ManagerName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerEmail = new ui.ctl.Input.Text({
                id: "ManagerEmail",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.managerEmail.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ){

                    var enteredText = me.managerEmail.getValue();

                    if (enteredText === "")
                        return;

                    if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
                        this.setInvalid("Please enter valid Email Address.");
                });

            me.managerPhone = new ui.ctl.Input.Text({
                id: "ManagerPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.managerPhone.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.managerPhone.text.value;

                    if (enteredText == "")
                        return;

                    me.managerPhone.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.managerPhone.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
                });

            me.managerFax = new ui.ctl.Input.Text({
                id: "ManagerFax",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.managerFax.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.managerFax.text.value;

                    if (enteredText == "")
                        return;

                    me.managerFax.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.managerFax.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid Fax number. Example: (999) 999-9999");
                });

            me.managerCellPhone = new ui.ctl.Input.Text({
                id: "ManagerCellPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.managerCellPhone.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.managerCellPhone.text.value;

                    if (enteredText == "")
                        return;

                    me.managerCellPhone.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.managerCellPhone.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid cell phone number. Example: (999) 999-9999");
                });

            me.managerPager = new ui.ctl.Input.Text({
                id: "ManagerPager",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.managerPager.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.managerPager.text.value;

                    if (enteredText === "")
                        return;

                    me.managerPager.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.managerPager.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid pager number. Example: (999) 999-9999");
                });

            me.managerAssistantName = new ui.ctl.Input.Text({
                id: "ManagerAssistantName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerAssistantPhone = new ui.ctl.Input.Text({
                id: "ManagerAssistantPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.managerAssistantPhone.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.managerAssistantPhone.text.value;

                    if (enteredText === "")
                        return;

                    me.managerAssistantPhone.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.managerAssistantPhone.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
                });

            me.clientFirstName = new ui.ctl.Input.Text({
                id: "ClientFirstName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.clientLastName = new ui.ctl.Input.Text({
                id: "ClientLastName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.clientTitle = new ui.ctl.Input.Text({
                id: "ClientTitle",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.clientPhone = new ui.ctl.Input.Text({
                id: "ClientPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.clientPhone.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.clientPhone.text.value;

                    if (enteredText == "")
                        return;

                    me.clientPhone.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.clientPhone.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
                });

            me.clientFax = new ui.ctl.Input.Text({
                id: "ClientFax",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.clientFax.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.clientFax.text.value;

                    if (enteredText == "")
                        return;

                    me.clientFax.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.clientFax.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid Fax number. Example: (999) 999-9999");
                });

            me.clientAssistantName = new ui.ctl.Input.Text({
                id: "ClientAssistantName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.clientAssistantPhone = new ui.ctl.Input.Text({
                id: "ClientAssistantPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.clientAssistantPhone.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.clientAssistantPhone.text.value;

                    if (enteredText === "")
                        return;

                    me.clientAssistantPhone.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.clientAssistantPhone.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
                });

            me.notes = $("#Notes")[0];

            $("#Notes").height(100);
            $("#Notes").change(function() { me.modified(); });

            me.strategicInitiativeGrid = new ui.ctl.Grid({
                id: "StrategicInitiativeGrid",
                appendToId: "divForm",
                allowAdds: true,
                createNewFunction: fin.hcm.evsMetric.StrategicInitiative,
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

            me.qualityAssuranceGrid = new ui.ctl.Grid({
                id: "QualityAssuranceGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.qualityAssuranceItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.qaMetricTypeTitle = new ui.ctl.Input.Text({
                id: "QAMetricTypeTitle",
                appendToId: "QualityAssuranceGridControlHolder"
            });

            me.qaPeriod1 = new ui.ctl.Input.Text({
                id: "QAPeriod1",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod1.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod1, me.qualityAssuranceGrid);
                });

            me.qaPeriod2 = new ui.ctl.Input.Text({
                id: "QAPeriod2",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod2.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod2, me.qualityAssuranceGrid);
                });

            me.qaPeriod3 = new ui.ctl.Input.Text({
                id: "QAPeriod3",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod3.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod3, me.qualityAssuranceGrid);
                });

            me.qaPeriod4 = new ui.ctl.Input.Text({
                id: "QAPeriod4",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod4.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod4, me.qualityAssuranceGrid);
                });

            me.qaPeriod5 = new ui.ctl.Input.Text({
                id: "QAPeriod5",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod5.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod5, me.qualityAssuranceGrid);
                });

            me.qaPeriod6 = new ui.ctl.Input.Text({
                id: "QAPeriod6",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod6.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod6, me.qualityAssuranceGrid);
                });

            me.qaPeriod7 = new ui.ctl.Input.Text({
                id: "QAPeriod7",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod7.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod7, me.qualityAssuranceGrid);
                });

            me.qaPeriod8 = new ui.ctl.Input.Text({
                id: "QAPeriod8",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod8.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod8, me.qualityAssuranceGrid);
                });

            me.qaPeriod9 = new ui.ctl.Input.Text({
                id: "QAPeriod9",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod9.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod9, me.qualityAssuranceGrid);
                });

            me.qaPeriod10 = new ui.ctl.Input.Text({
                id: "QAPeriod10",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod10.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod10, me.qualityAssuranceGrid);
                });

            me.qaPeriod11 = new ui.ctl.Input.Text({
                id: "QAPeriod11",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod11.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod11, me.qualityAssuranceGrid);
                });

            me.qaPeriod12 = new ui.ctl.Input.Text({
                id: "QAPeriod12",
                maxLength: 19,
                appendToId: "QualityAssuranceGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.qaPeriod12.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.qaPeriod12, me.qualityAssuranceGrid);
                });

            me.qualityAssuranceGrid.addColumn("qaMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.qaMetricTypeTitle);
            me.qualityAssuranceGrid.addColumn("qaPeriod1", "period1", "Period 1", "Period 1", 200, null, me.qaPeriod1);
            me.qualityAssuranceGrid.addColumn("qaPeriod2", "period2", "Period 2", "Period 2", 200, null, me.qaPeriod2);
            me.qualityAssuranceGrid.addColumn("qaPeriod3", "period3", "Period 3", "Period 3", 200, null, me.qaPeriod3);
            me.qualityAssuranceGrid.addColumn("qaPeriod4", "period4", "Period 4", "Period 4", 200, null, me.qaPeriod4);
            me.qualityAssuranceGrid.addColumn("qaPeriod5", "period5", "Period 5", "Period 5", 200, null, me.qaPeriod5);
            me.qualityAssuranceGrid.addColumn("qaPeriod6", "period6", "Period 6", "Period 6", 200, null, me.qaPeriod6);
            me.qualityAssuranceGrid.addColumn("qaPeriod7", "period7", "Period 7", "Period 7", 200, null, me.qaPeriod7);
            me.qualityAssuranceGrid.addColumn("qaPeriod8", "period8", "Period 8", "Period 8", 200, null, me.qaPeriod8);
            me.qualityAssuranceGrid.addColumn("qaPeriod9", "period9", "Period 9", "Period 9", 200, null, me.qaPeriod9);
            me.qualityAssuranceGrid.addColumn("qaPeriod10", "period10", "Period 10", "Period 10", 200, null, me.qaPeriod10);
            me.qualityAssuranceGrid.addColumn("qaPeriod11", "period11", "Period 11", "Period 11", 200, null, me.qaPeriod11);
            me.qualityAssuranceGrid.addColumn("qaPeriod12", "period12", "Period 12", "Period 12", 200, null, me.qaPeriod12);
            me.qualityAssuranceGrid.capColumns();

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
                .addValidation( function( isFinal, dataMap ) {

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
                .addValidation( function( isFinal, dataMap ) {

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
                .addValidation( function( isFinal, dataMap ) {

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
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.quarter4, me.qualityPartnershipGrid);
                });

            me.qualityPartnershipGrid.addColumn("qpMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.qpMetricTypeTitle);
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
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.annual1.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(4);

                    if (!(/^\d{1,12}(\.\d{1,4})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
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
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.annual2.getValue();

                    if (enteredText === "")
                        return;

                    var newValue = parseFloat(enteredText).toFixed(4);

                    if (!(/^\d{1,12}(\.\d{1,4})?$/.test(newValue)))
                        this.setInvalid("Please enter numeric value.");
                    else if (newValue !== enteredText)
                        me.annual2.setValue(newValue);
                });

            me.auditScoreGrid.addColumn("asMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.asMetricTypeTitle);
            me.auditScoreGrid.addColumn("annual1", "annual1", "Mid-Year", "Mid-Year", 200, null, me.annual1);
            me.auditScoreGrid.addColumn("annual2", "annual2", "Year-End", "Year-End", 200, null, me.annual2);
            me.auditScoreGrid.capColumns();

            me.competencyTrainingGrid = new ui.ctl.Grid({
                id: "CompetencyTrainingGrid",
                appendToId: "divForm",
                selectFunction: function( index ) { me.competencyTrainingItemSelect(index); },
                deleteFunction: function() { return true; }
            });

            me.ctMetricTypeTitle = new ui.ctl.Input.Text({
                id: "CTMetricTypeTitle",
                appendToId: "CompetencyTrainingGridControlHolder"
            });

            me.ctQuarter1 = new ui.ctl.Input.Text({
                id: "CTQuarter1",
                maxLength: 19,
                appendToId: "CompetencyTrainingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ctQuarter1.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.ctQuarter1, me.competencyTrainingGrid);
                });

            me.ctQuarter2 = new ui.ctl.Input.Text({
                id: "CTQuarter2",
                maxLength: 19,
                appendToId: "CompetencyTrainingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ctQuarter2.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.ctQuarter2, me.competencyTrainingGrid);
                });

            me.ctQuarter3 = new ui.ctl.Input.Text({
                id: "CTQuarter3",
                maxLength: 19,
                appendToId: "CompetencyTrainingGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ctQuarter3.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.ctQuarter3, me.competencyTrainingGrid);
                });

            me.ctQuarter4 = new ui.ctl.Input.Text({
                id: "CTQuarter4",
                maxLength: 19,
                appendToId: "QualityPartnershipGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.ctQuarter4.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.ctQuarter4, me.competencyTrainingGrid);
                });

            me.competencyTrainingGrid.addColumn("ctMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.ctMetricTypeTitle);
            me.competencyTrainingGrid.addColumn("ctQuarter1", "quarter1", "Quarter 1", "Quarter 1", 200, null, me.ctQuarter1);
            me.competencyTrainingGrid.addColumn("ctQuarter2", "quarter2", "Quarter 2", "Quarter 2", 200, null, me.ctQuarter2);
            me.competencyTrainingGrid.addColumn("ctQuarter3", "quarter3", "Quarter 3", "Quarter 3", 200, null, me.ctQuarter3);
            me.competencyTrainingGrid.addColumn("ctQuarter4", "quarter4", "Quarter 4", "Quarter 4", 200, null, me.ctQuarter4);
            me.competencyTrainingGrid.capColumns();

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

                    if (me.aoQuarter1.lastBlurValue === "")
                        return;

                    if (me.aoQuarter1.indexSelected === -1)
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

                    if (me.aoQuarter2.lastBlurValue === "")
                        return;

                    if (me.aoQuarter2.indexSelected === -1)
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

                    if (me.aoQuarter3.lastBlurValue === "")
                        return;

                    if (me.aoQuarter3.indexSelected === -1)
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

                    if (me.aoQuarter4.lastBlurValue === "")
                        return;

                    if (me.aoQuarter4.indexSelected === -1)
                        this.setInvalid("Please select the correct Objective.");
                });

            me.adminObjectiveGrid.addColumn("aoMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.aoMetricTypeTitle);
            me.adminObjectiveGrid.addColumn("aoQuarter1", "quarter1", "Quarter 1", "Quarter 1", 300, function(objective) { return objective.name; }, me.aoQuarter1);
            me.adminObjectiveGrid.addColumn("aoQuarter2", "quarter2", "Quarter 2", "Quarter 2", 300, function(objective) { return objective.name; }, me.aoQuarter2);
            me.adminObjectiveGrid.addColumn("aoQuarter3", "quarter3", "Quarter 3", "Quarter 3", 300, function(objective) { return objective.name; }, me.aoQuarter3);
            me.adminObjectiveGrid.addColumn("aoQuarter4", "quarter4", "Quarter 4", "Quarter 4", 300, function(objective) { return objective.name; }, me.aoQuarter4);
            me.adminObjectiveGrid.capColumns();

            me.evsStatisticGrid = new ui.ctl.Grid({
                id: "EVSStatisticGrid",
                appendToId: "divForm",
                selectFunction: function (index) { me.evsStatisticItemSelect(index); },
                deleteFunction: function () { return true; }
            });

            me.evssMetricTypeTitle = new ui.ctl.Input.Text({
                id: "EVSSMetricTypeTitle",
                appendToId: "EVSStatisticGridControlHolder"
            });

            me.evssPeriod1 = new ui.ctl.Input.Text({
                id: "EVSSPeriod1",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod1.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod1, me.evsStatisticGrid);
                });

            me.evssPeriod2 = new ui.ctl.Input.Text({
                id: "EVSsPeriod2",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod2.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod2, me.evsStatisticGrid);
                });

            me.evssPeriod3 = new ui.ctl.Input.Text({
                id: "EVSSPeriod3",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod3.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod3, me.evsStatisticGrid);
                });

            me.evssPeriod4 = new ui.ctl.Input.Text({
                id: "EVSSPeriod4",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod4.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod4, me.evsStatisticGrid);
                });

            me.evssPeriod5 = new ui.ctl.Input.Text({
                id: "EVSSPeriod5",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod5.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod5, me.evsStatisticGrid);
                });

            me.evssPeriod6 = new ui.ctl.Input.Text({
                id: "EVSSPeriod6",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod6.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod6, me.evsStatisticGrid);
                });

            me.evssPeriod7 = new ui.ctl.Input.Text({
                id: "EVSSPeriod7",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod7.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod7, me.evsStatisticGrid);
                });

            me.evssPeriod8 = new ui.ctl.Input.Text({
                id: "EVSSPeriod8",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod8.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod8, me.evsStatisticGrid);
                });

            me.evssPeriod9 = new ui.ctl.Input.Text({
                id: "EVSSPeriod9",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod9.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod9, me.evsStatisticGrid);
                });

            me.evssPeriod10 = new ui.ctl.Input.Text({
                id: "EVSSPeriod10",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod10.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod10, me.evsStatisticGrid);
                });

            me.evssPeriod11 = new ui.ctl.Input.Text({
                id: "EVSSPeriod11",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod11.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod11, me.evsStatisticGrid);
                });

            me.evssPeriod12 = new ui.ctl.Input.Text({
                id: "EVSSPeriod12",
                maxLength: 19,
                appendToId: "EVSStatisticGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.evssPeriod12.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.evssPeriod12, me.evsStatisticGrid);
                });

            me.evsStatisticGrid.addColumn("evssMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.evssMetricTypeTitle);
            me.evsStatisticGrid.addColumn("evssPeriod1", "period1", "Period 1", "Period 1", 180, null, me.evssPeriod1);
            me.evsStatisticGrid.addColumn("evssPeriod2", "period2", "Period 2", "Period 2", 180, null, me.evssPeriod2);
            me.evsStatisticGrid.addColumn("evssPeriod3", "period3", "Period 3", "Period 3", 180, null, me.evssPeriod3);
            me.evsStatisticGrid.addColumn("evssPeriod4", "period4", "Period 4", "Period 4", 180, null, me.evssPeriod4);
            me.evsStatisticGrid.addColumn("evssPeriod5", "period5", "Period 5", "Period 5", 180, null, me.evssPeriod5);
            me.evsStatisticGrid.addColumn("evssPeriod6", "period6", "Period 6", "Period 6", 180, null, me.evssPeriod6);
            me.evsStatisticGrid.addColumn("evssPeriod7", "period7", "Period 7", "Period 7", 180, null, me.evssPeriod7);
            me.evsStatisticGrid.addColumn("evssPeriod8", "period8", "Period 8", "Period 8", 180, null, me.evssPeriod8);
            me.evsStatisticGrid.addColumn("evssPeriod9", "period9", "Period 9", "Period 9", 180, null, me.evssPeriod9);
            me.evsStatisticGrid.addColumn("evssPeriod10", "period10", "Period 10", "Period 10", 180, null, me.evssPeriod10);
            me.evsStatisticGrid.addColumn("evssPeriod11", "period11", "Period 11", "Period 11", 180, null, me.evssPeriod11);
            me.evsStatisticGrid.addColumn("evssPeriod12", "period12", "Period 12", "Period 12", 180, null, me.evssPeriod12);
            me.evsStatisticGrid.capColumns();

            me.managementStaffGrid = new ui.ctl.Grid({
                id: "ManagementStaffGrid",
                appendToId: "divForm",
                selectFunction: function (index) { me.managementStaffItemSelect(index); },
                deselectFunction: function() { me.managementStaffItemDeSelect(); },
                deleteFunction: function () { return true; }
            });

            me.msMetricTypeTitle = new ui.ctl.Input.Text({
                id: "MSMetricTypeTitle",
                appendToId: "ManagementStaffGridControlHolder"
            });

            me.staffManagementRatio = new ui.ctl.Input.Check({
                id: "StaffManagementRatio",
                appendToId: "ManagementStaffGridControlHolder",
                className: "iiInputCheckSMRatio",
                changeFunction: function() { me.modified(); }
            });

            me.msPeriod1 = new ui.ctl.Input.Text({
                id: "MSPeriod1",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod1.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod1, me.managementStaffGrid);
                });

            me.msPeriod2 = new ui.ctl.Input.Text({
                id: "MSPeriod2",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod2.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod2, me.managementStaffGrid);
                });

            me.msPeriod3 = new ui.ctl.Input.Text({
                id: "MSPeriod3",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod3.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod3, me.managementStaffGrid);
                });

            me.msPeriod4 = new ui.ctl.Input.Text({
                id: "MSPeriod4",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod4.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod4, me.managementStaffGrid);
                });

            me.msPeriod5 = new ui.ctl.Input.Text({
                id: "MSPeriod5",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod5.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod5, me.managementStaffGrid);
                });

            me.msPeriod6 = new ui.ctl.Input.Text({
                id: "MSPeriod6",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod6.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod6, me.managementStaffGrid);
                });

            me.msPeriod7 = new ui.ctl.Input.Text({
                id: "MSPeriod7",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod7.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod7, me.managementStaffGrid);
                });

            me.msPeriod8 = new ui.ctl.Input.Text({
                id: "MSPeriod8",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod8.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod8, me.managementStaffGrid);
                });

            me.msPeriod9 = new ui.ctl.Input.Text({
                id: "MSPeriod9",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod9.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod9, me.managementStaffGrid);
                });

            me.msPeriod10 = new ui.ctl.Input.Text({
                id: "MSPeriod10",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod10.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod10, me.managementStaffGrid);
                });

            me.msPeriod11 = new ui.ctl.Input.Text({
                id: "MSPeriod11",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod11.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod11, me.managementStaffGrid);
                });

            me.msPeriod12 = new ui.ctl.Input.Text({
                id: "MSPeriod12",
                maxLength: 9,
                appendToId: "ManagementStaffGridControlHolder",
                changeFunction: function () { me.modified(); }
            });

            me.msPeriod12.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(function (isFinal, dataMap) {

                    me.validateControl(me.msPeriod12, me.managementStaffGrid);
                });

            me.managementStaffGrid.addColumn("msMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.msMetricTypeTitle);
            me.managementStaffGrid.addColumn("staffManagementRatio", "staffManagementRatio", "Include in Staff to Management Ratio", "Include in Staff to Management Ratio", 300, function(staffManagementRatio) { return (staffManagementRatio === true ? "Yes" : "No"); }, me.staffManagementRatio);
            me.managementStaffGrid.addColumn("msPeriod1", "period1", "Period 1", "Period 1", 180, null, me.msPeriod1);
            me.managementStaffGrid.addColumn("msPeriod2", "period2", "Period 2", "Period 2", 180, null, me.msPeriod2);
            me.managementStaffGrid.addColumn("msPeriod3", "period3", "Period 3", "Period 3", 180, null, me.msPeriod3);
            me.managementStaffGrid.addColumn("msPeriod4", "period4", "Period 4", "Period 4", 180, null, me.msPeriod4);
            me.managementStaffGrid.addColumn("msPeriod5", "period5", "Period 5", "Period 5", 180, null, me.msPeriod5);
            me.managementStaffGrid.addColumn("msPeriod6", "period6", "Period 6", "Period 6", 180, null, me.msPeriod6);
            me.managementStaffGrid.addColumn("msPeriod7", "period7", "Period 7", "Period 7", 180, null, me.msPeriod7);
            me.managementStaffGrid.addColumn("msPeriod8", "period8", "Period 8", "Period 8", 180, null, me.msPeriod8);
            me.managementStaffGrid.addColumn("msPeriod9", "period9", "Period 9", "Period 9", 180, null, me.msPeriod9);
            me.managementStaffGrid.addColumn("msPeriod10", "period10", "Period 10", "Period 10", 180, null, me.msPeriod10);
            me.managementStaffGrid.addColumn("msPeriod11", "period11", "Period 11", "Period 11", 180, null, me.msPeriod11);
            me.managementStaffGrid.addColumn("msPeriod12", "period12", "Period 12", "Period 12", 180, null, me.msPeriod12);
            me.managementStaffGrid.capColumns();
        },

        configureCommunications: function() {
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.hcm.evsMetric.HirNode,
                itemConstructorArgs: fin.hcm.evsMetric.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.hcm.evsMetric.HouseCode,
                itemConstructorArgs: fin.hcm.evsMetric.houseCodeArgs,
                injectionArray: me.houseCodes
            });

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.hcm.evsMetric.HouseCodeDetail,
				itemConstructorArgs: fin.hcm.evsMetric.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});

            me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.hcm.evsMetric.FiscalYear,
                itemConstructorArgs: fin.hcm.evsMetric.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

            me.taskManagementSystems = [];
            me.taskManagementSystemStore = me.cache.register({
                storeId: "ptTaskManagementSystems",
                itemConstructor: fin.hcm.evsMetric.TaskManagementSystem,
                itemConstructorArgs: fin.hcm.evsMetric.taskManagementSystemArgs,
                injectionArray: me.taskManagementSystems
            });

            me.administratorObjectives = [];
            me.administratorObjectiveStore = me.cache.register({
                storeId: "evsAdministratorObjectives",
                itemConstructor: fin.hcm.evsMetric.AdministratorObjective,
                itemConstructorArgs: fin.hcm.evsMetric.administratorObjectiveArgs,
                injectionArray: me.administratorObjectives
            });

            me.metricTypes = [];
            me.metricTypeStore = me.cache.register({
                storeId: "evsMetricTypes",
                itemConstructor: fin.hcm.evsMetric.MetricType,
                itemConstructorArgs: fin.hcm.evsMetric.metricTypeArgs,
                injectionArray: me.metricTypes
            });

            me.metrics = [];
            me.metricStore = me.cache.register({
                storeId: "evsMetrics",
                itemConstructor: fin.hcm.evsMetric.Metric,
                itemConstructorArgs: fin.hcm.evsMetric.metricArgs,
                injectionArray: me.metrics
            });

            me.numericDetails = [];
            me.numericDetailStore = me.cache.register({
                storeId: "evsMetricNumericDetails",
                itemConstructor: fin.hcm.evsMetric.NumericDetail,
                itemConstructorArgs: fin.hcm.evsMetric.numericDetailArgs,
                injectionArray: me.numericDetails,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.textDetails = [];
            me.textDetailStore = me.cache.register({
                storeId: "evsMetricTextDetails",
                itemConstructor: fin.hcm.evsMetric.TextDetail,
                itemConstructorArgs: fin.hcm.evsMetric.textDetailArgs,
                injectionArray: me.textDetails,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.strategicInitiatives = [];
            me.strategicInitiativeStore = me.cache.register({
                storeId: "evsMetricStrategicInitiatives",
                itemConstructor: fin.hcm.evsMetric.StrategicInitiative,
                itemConstructorArgs: fin.hcm.evsMetric.strategicInitiativeArgs,
                injectionArray: me.strategicInitiatives
            });

            me.qualityPartnerships = [];
            me.qualityPartnershipStore = me.cache.register({
                storeId: "evsMetricQualityPartnerships",
                itemConstructor: fin.hcm.evsMetric.QualityPartnership,
                itemConstructorArgs: fin.hcm.evsMetric.qualityPartnershipArgs,
                injectionArray: me.qualityPartnerships,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.auditScores = [];
            me.auditScoreStore = me.cache.register({
                storeId: "evsMetricAuditScores",
                itemConstructor: fin.hcm.evsMetric.AuditScore,
                itemConstructorArgs: fin.hcm.evsMetric.auditScoreArgs,
                injectionArray: me.auditScores,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.competencyTrainings = [];
            me.competencyTrainingStore = me.cache.register({
                storeId: "evsMetricCompetencyTrainings",
                itemConstructor: fin.hcm.evsMetric.CompetencyTraining,
                itemConstructorArgs: fin.hcm.evsMetric.competencyTrainingArgs,
                injectionArray: me.competencyTrainings,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.laborControls = [];
            me.laborControlStore = me.cache.register({
                storeId: "evsLaborControls",
                itemConstructor: fin.hcm.evsMetric.LaborControl,
                itemConstructorArgs: fin.hcm.evsMetric.laborControlArgs,
                injectionArray: me.laborControls,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.qualityAssurances = [];
            me.qualityAssuranceStore = me.cache.register({
                storeId: "qualityAssurances",
                itemConstructor: fin.hcm.evsMetric.QualityAssurance,
                itemConstructorArgs: fin.hcm.evsMetric.qualityAssuranceArgs,
                injectionArray: me.qualityAssurances,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.adminObjectives = [];
            me.adminObjectiveStore = me.cache.register({
                storeId: "evsMetricAdminObjectives",
                itemConstructor: fin.hcm.evsMetric.AdminObjective,
                itemConstructorArgs: fin.hcm.evsMetric.adminObjectiveArgs,
                injectionArray: me.adminObjectives,
                lookupSpec: { evsMetricType: me.metricTypes, quarter1: me.administratorObjectives, quarter2: me.administratorObjectives, quarter3: me.administratorObjectives, quarter4: me.administratorObjectives }
            });

            me.evsStatistics = [];
            me.evsStatisticStore = me.cache.register({
                storeId: "evsStaticstics",
                itemConstructor: fin.hcm.evsMetric.EVSStatistic,
                itemConstructorArgs: fin.hcm.evsMetric.evsStatisticArgs,
                injectionArray: me.evsStatistics,
                lookupSpec: { evsMetricType: me.metricTypes }
            });

            me.managementStaffs = [];
            me.managementStaffStore = me.cache.register({
                storeId: "managementStaffs",
                itemConstructor: fin.hcm.evsMetric.ManagementStaff,
                itemConstructorArgs: fin.hcm.evsMetric.managementStaffArgs,
                injectionArray: me.managementStaffs,
                lookupSpec: { evsMetricType: me.metricTypes }
            });
        },

        initialize: function() {
            var me = this;

            $("#TabCollection a").mousedown(function() {
                me.activeFrameId = 0;

                if (this.id === "TabHospitalContract")
                    me.activeFrameId = 1;
                else if (this.id === "TabLaborControl")
                    me.activeFrameId = 2;
                else if (this.id === "TabStrategicInitiative")
                    me.activeFrameId = 3;
                else if (this.id === "TabQualityAssurance")
                    me.activeFrameId = 4;
                else if (this.id === "TabAdminObjectives")
                    me.activeFrameId = 5;
                else if (this.id === "TabEVSStatistics")
                    me.activeFrameId = 6;
                else if (this.id === "TabManagementStaff")
                    me.activeFrameId = 7;

                $("#container-1").tabs(me.activeFrameId);
                $("#container-1").triggerTab(me.activeFrameId);
                setTimeout(function() {
                    me.resizeControls(me.activeFrameId);
                }, 100);
            });

            $("#divLaborControlGrid").bind("scroll", me.laborControlGridScroll);
            $("#divCommentsGrid").bind("scroll", me.commentsGridScroll);
            $("#QualityAssuranceContainer").bind("scroll", me.qualityAssuranceGridScroll);

            me.managerPhone.text.disabled = true;
            me.managerFax.text.disabled = true;
            me.managerCellPhone.text.disabled = true;
        },

        setStatus: function(status) {

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
            me.vacantPositions.text.tabIndex = 11;
            me.budgetedProductivity.text.tabIndex = 12;
            me.contractedProductivity.text.tabIndex = 13;
            me.supportedByNPC.text.tabIndex = 14;
            me.thirdPartySatisfaction.text.tabIndex = 15;
            me.employeeProductiveHoursPerWeekStandard.text.tabIndex = 16;
            me.taskManagementSystem.text.tabIndex = 17;
            me.taskManagementSystemOther.text.tabIndex = 18;
            me.serviceLinePT.text.tabIndex = 19;
            me.serviceLineLaundry.text.tabIndex = 20;
            me.serviceLinePOM.text.tabIndex = 21;
            me.serviceLineCES.text.tabIndex = 22;
            me.uvManufacturer.text.tabIndex = 23;
            me.hygiena.text.tabIndex = 24;
            me.wanda.text.tabIndex = 25;
            me.union.text.tabIndex = 26;
            me.microFiber.text.tabIndex = 27;
            me.mop.text.tabIndex = 28;
            me.cartManufacturer.text.tabIndex = 29;
            me.managerName.text.tabIndex = 30;
            me.managerEmail.text.tabIndex = 31;
            me.managerPhone.text.tabIndex = 32;
            me.managerFax.text.tabIndex = 33;
            me.managerCellPhone.text.tabIndex = 34;
            me.managerPager.text.tabIndex = 35;
            me.managerAssistantName.text.tabIndex = 36;
            me.managerAssistantPhone.text.tabIndex = 37;
            me.clientFirstName.text.tabIndex = 38;
            me.clientLastName.text.tabIndex = 39;
            me.clientTitle.text.tabIndex = 40;
            me.clientPhone.text.tabIndex = 41;
            me.clientFax.text.tabIndex = 42;
            me.clientAssistantName.text.tabIndex = 43;
            me.clientAssistantPhone.text.tabIndex = 44;
            me.notes.tabIndex = 45;
        },

        laborControlGridScroll: function() {
            var scrollLeft = $("#divLaborControlGrid").scrollLeft();

            $("#tblLaborControlGridHeader").css("left", -scrollLeft + "px");
        },

        commentsGridScroll: function() {
            var scrollLeft = $("#divCommentsGrid").scrollLeft();

            $("#tblCommentsGridHeader").css("left", -scrollLeft + "px");
        },

        qualityAssuranceGridScroll: function() {
            var me = fin.hcmEVSMetricUi;

            me.qualityAssuranceGrid.setHeight(150);
            me.qualityPartnershipGrid.setHeight(150);
            me.auditScoreGrid.setHeight(150);
            me.competencyTrainingGrid.setHeight(150);
        },

        resizeControls: function(selectedTab) {
            var me = this;

            if (selectedTab === 1) {
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
                me.vacantPositions.resizeText();
                me.budgetedProductivity.resizeText();
                me.contractedProductivity.resizeText();
                me.supportedByNPC.resizeText();
                me.thirdPartySatisfaction.resizeText();
                me.employeeProductiveHoursPerWeekStandard.resizeText();
                me.taskManagementSystem.resizeText();
                me.taskManagementSystemOther.resizeText();
                me.serviceLinePT.resizeText();
                me.serviceLineLaundry.resizeText();
                me.serviceLinePOM.resizeText();
                me.serviceLineCES.resizeText();
                me.uvManufacturer.resizeText();
                me.hygiena.resizeText();
                me.wanda.resizeText();
                me.union.resizeText();
                me.microFiber.resizeText();
                me.mop.resizeText();
                me.cartManufacturer.resizeText();
                me.managerName.resizeText();
				me.managerEmail.resizeText();
                me.managerPhone.resizeText();
                me.managerFax.resizeText();
                me.managerCellPhone.resizeText();
                me.managerPager.resizeText();
                me.managerAssistantName.resizeText();
                me.managerAssistantPhone.resizeText();
                me.clientFirstName.resizeText();
                me.clientLastName.resizeText();
				me.clientTitle.resizeText();
                me.clientPhone.resizeText();
                me.clientFax.resizeText();
                me.clientAssistantName.resizeText();
                me.clientAssistantPhone.resizeText();
            }
            else if (selectedTab === 3) {
                if ($("#StrategicInitiativeGridContainer").width() < 1200) {
	                $("#StrategicInitiativeGrid").width(1200);
	               	me.strategicInitiativeGrid.setHeight($(window).height() - 168);
	            }
	            else {
					$("#StrategicInitiativeGrid").width($("#StrategicInitiativeGridContainer").width() - 5);
	                me.strategicInitiativeGrid.setHeight($(window).height() - 150);
	            }
            }
            else if (selectedTab === 4) {
                if ($("#QualityAssuranceGridContainer").width() < 2600) {
                    $("#QualityAssuranceGrid").width(2600);
                }
				if ($("#QualityPartnershipGridContainer").width() < 1000) {
	                $("#QualityPartnershipGrid").width(1000);
	            }
	            else {
					$("#QualityPartnershipGrid").width($("#QualityPartnershipGridContainer").width() - 5);
	            }
				if ($("#CompetencyTrainingGridContainer").width() < 1000) {
	                $("#CompetencyTrainingGrid").width(1000);
	            }
	            else {
					$("#CompetencyTrainingGrid").width($("#CompetencyTrainingGridContainer").width() - 5);
	            }
                me.qualityAssuranceGrid.setHeight(150);
                me.qualityPartnershipGrid.setHeight(150);
                me.auditScoreGrid.setHeight(150);
                me.competencyTrainingGrid.setHeight(150);
            }
            else if (selectedTab === 5) {
				if ($("#AdminObjectiveGridContainer").width() < 1500) {
	                $("#AdminObjectiveGrid").width(1500);
					me.adminObjectiveGrid.setHeight($(window).height() - 168);
	            }
	            else {
					$("#AdminObjectiveGrid").width($("#AdminObjectiveGridContainer").width() - 5);
	                me.adminObjectiveGrid.setHeight($(window).height() - 150);
	            }
            }
            else if (selectedTab === 6) {
                if ($("#EVSStatisticGridContainer").width() < 2500) {
                    $("#EVSStatisticGrid").width(2500);
                    me.evsStatisticGrid.setHeight($(window).height() - 168);
                }
                else {
                    me.evsStatisticGrid.setHeight($(window).height() - 143);
                }
            }
            else if (selectedTab === 7) {
                if ($("#ManagementStaffGridContainer").width() < 2800) {
                    $("#ManagementStaffGrid").width(2800);
                    me.managementStaffGrid.setHeight($(window).height() - 168);
                }
                else {
                    me.managementStaffGrid.setHeight($(window).height() - 143);
                }
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
            me.vacantPositions.setValue("");
            me.budgetedProductivity.setValue("");
            me.contractedProductivity.setValue("");
            me.supportedByNPC.reset();
            me.thirdPartySatisfaction.reset();
            me.employeeProductiveHoursPerWeekStandard.setValue("");
            me.taskManagementSystem.reset();
            me.taskManagementSystemOther.setValue("");
            me.serviceLinePT.setValue("");
            me.serviceLineLaundry.setValue("");
            me.serviceLinePOM.setValue("");
            me.serviceLineCES.setValue("");
            me.uvManufacturer.reset();
            me.hygiena.reset();
            me.wanda.reset();
            me.union.reset();
            me.microFiber.reset();
            me.mop.reset();
            me.cartManufacturer.reset();
            me.managerName.setValue("");
			me.managerEmail.setValue("");
            me.managerPhone.setValue("");
            me.managerFax.setValue("");
            me.managerCellPhone.setValue("");
            me.managerPager.setValue("");
            me.managerAssistantName.setValue("");
            me.managerAssistantPhone.setValue("");
            me.clientFirstName.setValue("");
            me.clientLastName.setValue("");
			me.clientTitle.setValue("");
            me.clientPhone.setValue("");
            me.clientFax.setValue("");
            me.clientAssistantName.setValue("");
            me.clientAssistantPhone.setValue("");
            me.notes.value = "";
            $("#TMSOtherContainer").hide();

            if (me.strategicInitiativeGrid.activeRowIndex !== - 1)
                me.strategicInitiativeGrid.body.deselect(me.strategicInitiativeGrid.activeRowIndex, true);
            if (me.qualityAssuranceGrid.activeRowIndex !== - 1)
                me.qualityAssuranceGrid.body.deselect(me.qualityAssuranceGrid.activeRowIndex, true);
            if (me.qualityPartnershipGrid.activeRowIndex !== - 1)
                me.qualityPartnershipGrid.body.deselect(me.qualityPartnershipGrid.activeRowIndex, true);
            if (me.auditScoreGrid.activeRowIndex !== - 1)
                me.auditScoreGrid.body.deselect(me.auditScoreGrid.activeRowIndex, true);
            if (me.competencyTrainingGrid.activeRowIndex !== - 1)
                me.competencyTrainingGrid.body.deselect(me.competencyTrainingGrid.activeRowIndex, true);
            if (me.adminObjectiveGrid.activeRowIndex !== - 1)
                me.adminObjectiveGrid.body.deselect(me.adminObjectiveGrid.activeRowIndex, true);
            if (me.evsStatisticGrid.activeRowIndex !== -1)
                me.evsStatisticGrid.body.deselect(me.evsStatisticGrid.activeRowIndex, true);
            if (me.managementStaffGrid.activeRowIndex !== -1)
                me.managementStaffGrid.body.deselect(me.managementStaffGrid.activeRowIndex, true);

            me.strategicInitiativeGrid.setData([]);
            me.qualityAssuranceGrid.setData([]);
            me.qualityPartnershipGrid.setData([]);
            me.auditScoreGrid.setData([]);
            me.competencyTrainingGrid.setData([]);
            me.adminObjectiveGrid.setData([]);
            me.evsStatisticGrid.setData([]);
            me.managementStaffGrid.setData([]);

            me.numericDetailStore.reset();
            me.textDetailStore.reset();
            me.strategicInitiativeStore.reset();
            me.qualityPartnershipStore.reset();
            me.auditScoreStore.reset();
            me.competencyTrainingStore.reset();
            me.adminObjectiveStore.reset();
        },

        houseCodesLoaded: function(me, activeId) {

            if (parent.fin.appUI.houseCodeId === 0) {
                if (me.houseCodes.length <= 0) {
                    return me.houseCodeSearchError();
                }

                me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
            }

            me.houseCodeGlobalParametersUpdate(false);
			me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
        },

		houseCodeDetailsLoaded: function(me, activeId) {

			me.yearChanged();
			me.checkLoadCount();
		},

        houseCodeChanged: function() {
            var me = this;

            if (parent.fin.appUI.houseCodeId <= 0)
                return;

			me.setLoadCount();
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
        },

        typesLoaded: function() {
            var me = this;

            me.types = [];
            me.types.push(new fin.hcm.evsMetric.Type(1, "Yes"));
            me.types.push(new fin.hcm.evsMetric.Type(0, "No"));
            me.supportedByNPC.setData(me.types);
            me.hygiena.setData(me.types);
            me.union.setData(me.types);
        },

        metricTypesLoaded: function(me, activeId) {

            me.thirdPartySatisfactionTypes = [];
            me.uvManufacturerTypes = [];
            me.wandaTypes = [];
            me.microFiberTypes = [];
            me.mopTypes = [];
            me.cartManufacturerTypes = [];

            for (var index = 0; index < me.metricTypes.length; index++) {
                if (me.metricTypes[index].subType === "Third Party Satisfaction")
                    me.thirdPartySatisfactionTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "UV Manufacturer")
                    me.uvManufacturerTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "Wanda")
                    me.wandaTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "Micro Fiber")
                    me.microFiberTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "MOP")
                    me.mopTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "Cart Manufacturer")
                    me.cartManufacturerTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
            }

            me.thirdPartySatisfactionTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
			me.uvManufacturerTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
			me.wandaTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
			me.microFiberTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
			me.mopTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
			me.cartManufacturerTypes.unshift(new fin.hcm.evsMetric.Type(0, "None"));
            me.thirdPartySatisfaction.setData(me.thirdPartySatisfactionTypes);
            me.uvManufacturer.setData(me.uvManufacturerTypes);
            me.wanda.setData(me.wandaTypes);
            me.microFiber.setData(me.microFiberTypes);
            me.mop.setData(me.mopTypes);
            me.cartManufacturer.setData(me.cartManufacturerTypes);
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
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
        },

        yearChanged: function() {
            var me = this;

            if (me.year.indexSelected === -1)
                return;

            me.setLoadCount();
            me.metricStore.reset();
            me.metricStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",yearId:" + me.fiscalYears[me.year.indexSelected].id, me.metricsLoaded, me);
        },

        metricsLoaded: function(me, activeId) {

            me.resetControls();
			me.managerName.setValue(me.houseCodeDetails[0].managerName);
			me.managerEmail.setValue(me.houseCodeDetails[0].managerEmail);
            me.managerPhone.setValue(me.houseCodeDetails[0].managerPhone);
            me.managerFax.setValue(me.houseCodeDetails[0].managerFax);
            me.managerCellPhone.setValue(me.houseCodeDetails[0].managerCellPhone);
            me.managerPager.setValue(me.houseCodeDetails[0].managerPager);
            me.managerAssistantName.setValue(me.houseCodeDetails[0].managerAssistantName);
            me.managerAssistantPhone.setValue(me.houseCodeDetails[0].managerAssistantPhone);
            me.clientFirstName.setValue(me.houseCodeDetails[0].clientFirstName);
            me.clientLastName.setValue(me.houseCodeDetails[0].clientLastName);
			me.clientTitle.setValue(me.houseCodeDetails[0].clientTitle);
            me.clientPhone.setValue(me.houseCodeDetails[0].clientPhone);
            me.clientFax.setValue(me.houseCodeDetails[0].clientFax);
            me.clientAssistantName.setValue(me.houseCodeDetails[0].clientAssistantName);
            me.clientAssistantPhone.setValue(me.houseCodeDetails[0].clientAssistantPhone);

            if (me.metrics.length > 0) {
                me.evsMetricId = me.metrics[0].id;
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
                me.vacantPositions.setValue(me.metrics[0].vacantPositions);
                me.budgetedProductivity.setValue(me.metrics[0].budgetedProductivity);
                me.contractedProductivity.setValue(me.metrics[0].contractedProductivity);
                var itemIndex = ii.ajax.util.findIndexById(me.metrics[0].supportedByNPC.toString(), me.supportedByNPC.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.supportedByNPC.select(itemIndex, me.supportedByNPC.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].thirdPartySatisfaction.toString(), me.thirdPartySatisfaction.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.thirdPartySatisfaction.select(itemIndex, me.thirdPartySatisfaction.focused);
				if (me.thirdPartySatisfaction.indexSelected > 0)
					$("#spnThirdPartySatisfaction").html(" - " + me.thirdPartySatisfaction.lastBlurValue);
                else
                    $("#spnThirdPartySatisfaction").html("");
                me.employeeProductiveHoursPerWeekStandard.setValue(me.metrics[0].employeeProductiveHoursPerWeekStandard);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].taskManagementSystem.toString(), me.taskManagementSystem.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.taskManagementSystem.select(itemIndex, me.taskManagementSystem.focused);
                if (me.taskManagementSystem.lastBlurValue === "Other")
                    $("#TMSOtherContainer").show();
                else
                    $("#TMSOtherContainer").hide();
                me.taskManagementSystemOther.setValue(me.metrics[0].taskManagementSystemOther);
                me.serviceLinePT.setValue(me.metrics[0].serviceLinePT);
                me.serviceLineLaundry.setValue(me.metrics[0].serviceLineLaundry);
                me.serviceLinePOM.setValue(me.metrics[0].serviceLinePOM);
                me.serviceLineCES.setValue(me.metrics[0].serviceLineCES);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].uvManufacturer.toString(), me.uvManufacturer.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.uvManufacturer.select(itemIndex, me.uvManufacturer.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].hygiena.toString(), me.hygiena.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.hygiena.select(itemIndex, me.hygiena.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].wanda.toString(), me.wanda.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.wanda.select(itemIndex, me.wanda.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].union.toString(), me.union.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.union.select(itemIndex, me.union.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].microFiber.toString(), me.microFiber.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.microFiber.select(itemIndex, me.microFiber.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].mop.toString(), me.mop.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.mop.select(itemIndex, me.mop.focused);
                itemIndex = ii.ajax.util.findIndexById(me.metrics[0].cartManufacturer.toString(), me.cartManufacturer.data);
                if (itemIndex !== null && itemIndex >= 0)
                    me.cartManufacturer.select(itemIndex, me.cartManufacturer.focused);
                me.notes.value = me.metrics[0].notes;

                me.numericDetailStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.numericDetailsLoaded, me);
                me.strategicInitiativeStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.strategicInitiativesLoaded, me);
                me.qualityPartnershipStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.qualityPartnershipsLoaded, me);
                me.auditScoreStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.auditScoresLoaded, me);
                me.competencyTrainingStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.competencyTrainingsLoaded, me);
                me.adminObjectiveStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.adminObjectivesLoaded, me);
            }
            else {
                $("#spnThirdPartySatisfaction").html("");
                me.evsMetricId = 0;
                me.setGridData();
            }

            $("#container-1").triggerTab(me.activeFrameId);
            setTimeout(function() {
                me.resizeControls(me.activeFrameId);
            }, 100);
        },

        numericDetailsLoaded: function(me, activeId) {

            me.textDetailStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.textDetailsLoaded, me);
        },

        textDetailsLoaded: function(me, activeId) {

            me.setGridData();
        },

        strategicInitiativesLoaded: function(me, activeId) {

            me.strategicInitiativeGrid.setData(me.strategicInitiatives);
        },

        qualityPartnershipsLoaded: function(me, activeId) {

            for (var index = 0; index < me.metricTypes.length; index++) {
                if (me.metricTypes[index].subType === "Quality Partnership") {
                    var result = $.grep(me.qualityPartnerships, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                    if (result.length === 0)
                        me.qualityPartnerships.push(new fin.hcm.evsMetric.QualityPartnership(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                }
            }
            me.qualityPartnershipGrid.setData(me.qualityPartnerships);
        },

        auditScoresLoaded: function(me, activeId) {

            for (var index = 0; index < me.metricTypes.length; index++) {
                if (me.metricTypes[index].subType === "Audit Scores") {
                    var result = $.grep(me.auditScores, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                    if (result.length === 0)
                        me.auditScores.push(new fin.hcm.evsMetric.AuditScore(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                }
            }
            me.auditScoreGrid.setData(me.auditScores);
        },

        competencyTrainingsLoaded: function(me, activeId) {

            for (var index = 0; index < me.metricTypes.length; index++) {
                if (me.metricTypes[index].subType === "Competency Training") {
                    var result = $.grep(me.competencyTrainings, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                    if (result.length === 0)
                        me.competencyTrainings.push(new fin.hcm.evsMetric.CompetencyTraining(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                }
            }
            me.competencyTrainingGrid.setData(me.competencyTrainings);
        },

        adminObjectivesLoaded: function(me, activeId) {

            for (var index = 0; index < me.metricTypes.length; index++) {
                if (me.metricTypes[index].subType === "Admin Objective") {
                    var result = $.grep(me.adminObjectives, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                    if (result.length === 0)
                        me.adminObjectives.push(new fin.hcm.evsMetric.AdminObjective(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                }
            }
            me.adminObjectiveGrid.setData(me.adminObjectives);
        },

        setGridData: function() {
            var me = this;
            var item = null;
            var index = 0;

            me.laborControls = [];
            me.qualityAssurances = [];
            me.evsStatistics = [];
            me.managementStaffs = [];

            if (me.numericDetails.length === 0) {
                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "Labor Control" && me.metricTypes[index].brief !== "") {
                        item = new fin.hcm.evsMetric.LaborControl(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.laborControls.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Quality Assurance") {
                        item = new fin.hcm.evsMetric.QualityAssurance(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.qualityAssurances.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Quality Partnership") {
                        item = new fin.hcm.evsMetric.QualityPartnership(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.qualityPartnerships.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Audit Scores") {
                        item = new fin.hcm.evsMetric.AuditScore(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.auditScores.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Competency Training") {
                        item = new fin.hcm.evsMetric.CompetencyTraining(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.competencyTrainings.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Admin Objective") {
                        item = new fin.hcm.evsMetric.AdminObjective(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.adminObjectives.push(item);
                    }
                    else if (me.metricTypes[index].subType === "EVS Statistics") {
                        item = new fin.hcm.evsMetric.EVSStatistic(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.evsStatistics.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Management Staff") {
                        item = new fin.hcm.evsMetric.ManagementStaff(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.managementStaffs.push(item);
                    }
                }

                me.strategicInitiativeGrid.setData(me.strategicInitiatives);
                me.qualityPartnershipGrid.setData(me.qualityPartnerships);
                me.auditScoreGrid.setData(me.auditScores);
                me.competencyTrainingGrid.setData(me.competencyTrainings);
                me.adminObjectiveGrid.setData(me.adminObjectives);
            }
            else {
                for (index = 0; index < me.numericDetails.length; index++) {
                    if (me.numericDetails[index].evsMetricType.subType === "Labor Control" && me.numericDetails[index].evsMetricType.brief !== "") {
                        item = new fin.hcm.evsMetric.LaborControl(
                            me.numericDetails[index].id
                            , me.numericDetails[index].evsMetricId
                            , me.numericDetails[index].evsMetricType
                            , me.numericDetails[index].evsMetricType.title
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
                            );
                        me.laborControls.push(item);
                    }
                    else if (me.numericDetails[index].evsMetricType.subType === "Quality Assurance") {
                        item = new fin.hcm.evsMetric.QualityAssurance(
                            me.numericDetails[index].id
                            , me.numericDetails[index].evsMetricId
                            , me.numericDetails[index].evsMetricType
                            , me.numericDetails[index].evsMetricType.title
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
                            );
                        me.qualityAssurances.push(item);
                    }
                    else if (me.numericDetails[index].evsMetricType.subType === "EVS Statistics") {
                        item = new fin.hcm.evsMetric.EVSStatistic(
                            me.numericDetails[index].id
                            , me.numericDetails[index].evsMetricId
                            , me.numericDetails[index].evsMetricType
                            , me.numericDetails[index].evsMetricType.title
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period1 : (me.numericDetails[index].period1 === "" ? "" : parseInt(me.numericDetails[index].period1, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period2 : (me.numericDetails[index].period2 === "" ? "" : parseInt(me.numericDetails[index].period2, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period3 : (me.numericDetails[index].period3 === "" ? "" : parseInt(me.numericDetails[index].period3, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period4 : (me.numericDetails[index].period4 === "" ? "" : parseInt(me.numericDetails[index].period4, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period5 : (me.numericDetails[index].period5 === "" ? "" : parseInt(me.numericDetails[index].period5, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period6 : (me.numericDetails[index].period6 === "" ? "" : parseInt(me.numericDetails[index].period6, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period7 : (me.numericDetails[index].period7 === "" ? "" : parseInt(me.numericDetails[index].period7, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period8 : (me.numericDetails[index].period8 === "" ? "" : parseInt(me.numericDetails[index].period8, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period9 : (me.numericDetails[index].period9 === "" ? "" : parseInt(me.numericDetails[index].period9, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period10 : (me.numericDetails[index].period10 === "" ? "" : parseInt(me.numericDetails[index].period10, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period11 : (me.numericDetails[index].period11 === "" ? "" : parseInt(me.numericDetails[index].period11, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period12 : (me.numericDetails[index].period12 === "" ? "" : parseInt(me.numericDetails[index].period12, 10)))
                            );
                        me.evsStatistics.push(item);
                    }
                    else if (me.numericDetails[index].evsMetricType.subType === "Management Staff") {
                        item = new fin.hcm.evsMetric.ManagementStaff(
                            me.numericDetails[index].id
                            , me.numericDetails[index].evsMetricId
                            , me.numericDetails[index].evsMetricType
                            , me.numericDetails[index].evsMetricType.title
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period1 : (me.numericDetails[index].period1 === "" ? "" : parseInt(me.numericDetails[index].period1, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period2 : (me.numericDetails[index].period2 === "" ? "" : parseInt(me.numericDetails[index].period2, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period3 : (me.numericDetails[index].period3 === "" ? "" : parseInt(me.numericDetails[index].period3, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period4 : (me.numericDetails[index].period4 === "" ? "" : parseInt(me.numericDetails[index].period4, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period5 : (me.numericDetails[index].period5 === "" ? "" : parseInt(me.numericDetails[index].period5, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period6 : (me.numericDetails[index].period6 === "" ? "" : parseInt(me.numericDetails[index].period6, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period7 : (me.numericDetails[index].period7 === "" ? "" : parseInt(me.numericDetails[index].period7, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period8 : (me.numericDetails[index].period8 === "" ? "" : parseInt(me.numericDetails[index].period8, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period9 : (me.numericDetails[index].period9 === "" ? "" : parseInt(me.numericDetails[index].period9, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period10 : (me.numericDetails[index].period10 === "" ? "" : parseInt(me.numericDetails[index].period10, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period11 : (me.numericDetails[index].period11 === "" ? "" : parseInt(me.numericDetails[index].period11, 10)))
                            , (me.numericDetails[index].evsMetricType.dataType === "Decimal" ? me.numericDetails[index].period12 : (me.numericDetails[index].period12 === "" ? "" : parseInt(me.numericDetails[index].period12, 10)))
                            , me.numericDetails[index].staffManagementRatio
                            );
                        me.managementStaffs.push(item);
                    }
                }

                for (index = 0; index < me.textDetails.length; index++) {
                    if (me.textDetails[index].evsMetricType.subType === "Labor Control" && me.textDetails[index].evsMetricType.brief !== "") {
                        item = new fin.hcm.evsMetric.LaborControl(
                            me.textDetails[index].id
                            , me.textDetails[index].evsMetricId
                            , me.textDetails[index].evsMetricType
                            , me.textDetails[index].evsMetricType.title
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
                            );
                        me.laborControls.push(item);
                    }
                    else if (me.textDetails[index].evsMetricType.subType === "Quality Assurance") {
                        item = new fin.hcm.evsMetric.QualityAssurance(
                            me.textDetails[index].id
                            , me.textDetails[index].evsMetricId
                            , me.textDetails[index].evsMetricType
                            , me.textDetails[index].evsMetricType.title
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
                            );
                        me.qualityAssurances.push(item);
                    }
                }

                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "Labor Control" && me.metricTypes[index].brief !== "") {
                        var result = $.grep(me.laborControls, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.laborControls.push(new fin.hcm.evsMetric.LaborControl(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }

                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "Quality Assurance") {
                        var result = $.grep(me.qualityAssurances, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.qualityAssurances.push(new fin.hcm.evsMetric.QualityAssurance(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }

                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "EVS Statistics") {
                        var result = $.grep(me.evsStatistics, function (item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.evsStatistics.push(new fin.hcm.evsMetric.EVSStatistic(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }

                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "Management Staff") {
                        var result = $.grep(me.managementStaffs, function (item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.managementStaffs.push(new fin.hcm.evsMetric.ManagementStaff(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }
            }

            me.qualityAssurances.sort(me.customSort);
            me.qualityAssuranceGrid.setData(me.qualityAssurances);
            me.evsStatisticGrid.setData(me.evsStatistics);
            me.managementStaffGrid.setData(me.managementStaffs);
            me.setLaborControlGrids();
            if (me.reloadData) {
                me.reloadData = false;
                $("#pageLoading").fadeOut("slow");
            }
            else {
                me.checkLoadCount();
            }
        },

        setLaborControlGrids: function() {
            var me = this;
            var index = 0;
            var iIndex = 0;
            var rowIndex = 0;
            var total = 0;
            var laborControlRow = "";
            var laborControlRowTemplate = $("#tblLaborControlTemplate").html();
            var laborControlRowTotalTemplate = $("#tblLaborControlTotalTemplate").html();
            var commentsRowTemplate = $("#tblCommentsTemplate").html();
            $("#LaborControlGridBody").html("");
            $("#CommentsGridBody").html("");

            for (index = 0; index < me.laborControls.length; index++) {
                if (me.laborControls[index].evsMetricType.brief === "Budget") {
                    laborControlRow = laborControlRowTemplate;
                    laborControlRow = laborControlRow.replace("RowStyle", ((rowIndex % 2) ? "gridRow" : "alternateGridRow"));
                    laborControlRow = laborControlRow.replace(/RowCount/g, index);
                    $("#LaborControlGridBody").append(laborControlRow);
                    $("#tdTitle" + index).html(me.laborControls[index].evsMetricTypeTitle);
                    $("#tdTitle" + index).addClass((rowIndex % 2) ? "gridRow" : "alternateGridRow");
                    rowIndex++;
                }
                else if (me.laborControls[index].evsMetricType.brief === "Comments") {
                    $("#CommentsGridBody").append(commentsRowTemplate);
                    $("#trComments input[id^=txtPeriod]").bind("blur", function() { me.commentsBlur(this); });
                    $("#tdComments").addClass("gridRow");
                }

                if (index === 3 || index === 5 || index === 9 || index === 11) {
                    laborControlRow = laborControlRowTotalTemplate;
                    laborControlRow = laborControlRow.replace(/RowCount/g, index);
                    laborControlRow = laborControlRow.replace("RowStyle", "totalGridRow");
                    $("#LaborControlGridBody").append(laborControlRow);

                    if (index === 3)
                        $("#tdTitleTotal" + index).html("Total Productive Hours");
                    else if (index === 5) {
                        $("#tdTitleTotal" + index).html("Total Non-Productive Hours");
                        laborControlRow = laborControlRowTotalTemplate;
                        laborControlRow = laborControlRow.replace(/RowCount/g, "Paid" + index);
                        laborControlRow = laborControlRow.replace("RowStyle", "grandTotalGridRow");
                        $("#LaborControlGridBody").append(laborControlRow);
                        $("#tdTitleTotalPaid" + index).html("Paid Total Hours");
                    }
                    else if (index === 9)
                        $("#tdTitleTotal" + index).html("Total Productive Dollars");
                    else if (index === 11) {
                        $("#tdTitleTotal" + index).html("Total Non-Productive Dollars");
                        laborControlRow = laborControlRowTotalTemplate;
                        laborControlRow = laborControlRow.replace(/RowCount/g, "Paid" + index);
                        laborControlRow = laborControlRow.replace("RowStyle", "grandTotalGridRow");
                        $("#LaborControlGridBody").append(laborControlRow);
                        $("#tdTitleTotalPaid" + index).html("Paid Total Dollars");
                    }
                    $("#tdTitleTotal" + index).addClass("totalGridRow");
                    $("#tdTitleTotalPaid" + index).addClass("grandTotalGridRow");
                }

                $("#trLaborControl" + index + " input[id^=txtPeriod]").keypress(function (e) {
                    if (e.which !== 46 && e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57))
                        return false;
                });
                $("#trLaborControl" + index + " input[id^=txtPeriod]").bind("blur", function() { me.periodBlur(this); });
            }

            for (index = 0; index < me.laborControls.length; index++) {
                if (me.laborControls[index].evsMetricType.brief === "Budget") {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        $("#txtPeriod" + iIndex + "Budget" + index).val(me.laborControls[index]["period" + iIndex]);
                    }
                }
                else if (me.laborControls[index].evsMetricType.brief === "Actual") {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        $("#txtPeriod" + iIndex + "Actual" + (index - 1)).val(me.laborControls[index]["period" + iIndex]);
                    }
                }
                else if (me.laborControls[index].evsMetricType.brief === "Comments") {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        $("#txtPeriod" + iIndex).val(me.laborControls[index]["period" + iIndex]);
                    }
                }

                if (index === 3 || index === 9) {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        total = ($("#txtPeriod" + iIndex + "Budget" + (index - 3)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Budget" + (index - 3)).val()))
                            + ($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Budget" + index).html(total.toFixed(2));
                        total = ($("#txtPeriod" + iIndex + "Actual" + (index - 3)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Actual" + (index - 3)).val()))
                            + ($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Actual" + index).html(total.toFixed(2));
                    }
                }
                else if (index === 5 || index === 11) {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        total = ($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Budget" + index).html(total.toFixed(2));
                        total = ($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Actual" + index).html(total.toFixed(2));
                        total = parseFloat($("#spnPeriod" + iIndex + "Budget" + (index - 2)).html()) + parseFloat($("#spnPeriod" + iIndex + "Budget" + index).html());
                        $("#spnPeriod" + iIndex + "BudgetPaid" + index).html(total.toFixed(2));
                        total = parseFloat($("#spnPeriod" + iIndex + "Actual" + (index - 2)).html()) + parseFloat($("#spnPeriod" + iIndex + "Actual" + index).html());
                        $("#spnPeriod" + iIndex + "ActualPaid" + index).html(total.toFixed(2));
                    }
                }
            }
        },

        periodBlur: function(objInput) {
            var me = this;
            var rowCount = 0;
            var total = 0;
            var startRowNumber = 0;
            var endRowNumber = 0;
            var totalRowNumber = 0;
            var period = "";
            var type = "";
            var id = objInput.id.replace("txtPeriod", "");

            //Remove any unwanted characters
            objInput.value = objInput.value.replace(/[^0-9.]/g, "");

            if (id.indexOf("Budget") > 0) {
                type = "Budget";
                period = id.substring(0, id.indexOf("Budget"));
                rowCount = parseInt(id.substring(id.indexOf("Budget")).replace("Budget", ""), 10);
            }
            else if (id.indexOf("Actual") > 0) {
                type = "Actual";
                period = id.substring(0, id.indexOf("Actual"));
                rowCount = parseInt(id.substring(id.indexOf("Actual")).replace("Actual", ""), 10) + 1;
            }

            //Make sure we have a change
            if (objInput.value !== me.laborControls[rowCount]["period" + period]) {
                me.laborControls[rowCount]["period" + period] = objInput.value;
                me.laborControls[rowCount].modified = true;
                me.modified();

                if (objInput.value !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(objInput.value))) {
                    $("#" + objInput.id).attr("title", "Please enter numeric value. Example 99.99");
                    $("#" + objInput.id).addClass("invalid");
                    return;
                }
                else {
                    $("#" + objInput.id).attr("title", "");
                    $("#" + objInput.id).removeClass("invalid");
                }

                if (rowCount === 0 || rowCount === 2) {
                    startRowNumber = 0;
                    endRowNumber = 2;
                    totalRowNumber = 3;
                }
                else if (rowCount === 1 || rowCount === 3) {
                    startRowNumber = 1;
                    endRowNumber = 3;
                    totalRowNumber = 3;
                }
                else if (rowCount === 4) {
                    startRowNumber = 4;
                    endRowNumber = 4;
                    totalRowNumber = 5;
                }
                else if (rowCount === 5) {
                    startRowNumber = 5;
                    endRowNumber = 5;
                    totalRowNumber = 5;
                }
                else if (rowCount === 6 || rowCount === 8) {
                    startRowNumber = 6;
                    endRowNumber = 8;
                    totalRowNumber = 9;
                }
                else if (rowCount === 7 || rowCount === 9) {
                    startRowNumber = 7;
                    endRowNumber = 9;
                    totalRowNumber = 9;
                }
                else if (rowCount === 10) {
                    startRowNumber = 10;
                    endRowNumber = 10;
                    totalRowNumber = 11;
                }
                else if (rowCount === 11) {
                    startRowNumber = 11;
                    endRowNumber = 11;
                    totalRowNumber = 11;
                }

                if ((rowCount >= 0 && rowCount <= 3) || (rowCount >= 6 && rowCount <= 9)) {
                    total = (me.laborControls[startRowNumber]["period" + period] === "" ? 0 : parseFloat(me.laborControls[startRowNumber]["period" + period])) +
                    (me.laborControls[endRowNumber]["period" + period] === "" ? 0 : parseFloat(me.laborControls[endRowNumber]["period" + period]));
                    $("#spnPeriod" + period + type + totalRowNumber).html(total.toFixed(2));
                }
                else if (rowCount === 4 || rowCount === 5 || rowCount === 10 || rowCount === 11) {
                    total = (me.laborControls[startRowNumber]["period" + period] === "" ? 0 : parseFloat(me.laborControls[startRowNumber]["period" + period]));
                    $("#spnPeriod" + period + type + totalRowNumber).html(total.toFixed(2));
                }

                if (rowCount >= 0 && rowCount <= 5) {
                    total = ($("#spnPeriod" + period + type + "3").html() === "" ? 0 : parseFloat($("#spnPeriod" + period + type + "3").html()))
                        + ($("#spnPeriod" + period + type + "5").html() === "" ? 0 : parseFloat($("#spnPeriod" + period + type + "5").html()));
                    $("#spnPeriod" + period + type + "Paid5").html(total.toFixed(2));
                }
                else if (rowCount >= 6 && rowCount <= 11) {
                    total = ($("#spnPeriod" + period + type + "9").html() === "" ? 0 : parseInt($("#spnPeriod" + period + type + "9").html(), 10))
                        + ($("#spnPeriod" + period + type + "11").html() === "" ? 0 : parseInt($("#spnPeriod" + period + type + "11").html(), 10));
                    $("#spnPeriod" + period + type + "Paid11").html(total.toFixed(2));
                }
            }
        },

        commentsBlur: function(objInput) {
            var me = this;
            var period = objInput.id.replace("txtPeriod", "");

            if (objInput.value !== me.laborControls[12]["period" + period]) {
                me.laborControls[12]["period" + period] = objInput.value;
                me.laborControls[12].modified = true;
                me.modified();
            }
        },

        // This is a comparison function that will result in data being sorted in display order.
        customSort: function(a, b) {
            if (a.evsMetricType.displayOrder > b.evsMetricType.displayOrder)
                return 1;
            if (a.evsMetricType.displayOrder < b.evsMetricType.displayOrder)
                return -1;
            return 0;
        },

        validateControl: function(control, activeGrid) {
            var enteredText = control.getValue();

            if (enteredText === "" || activeGrid.activeRowIndex === -1)
                return;

            var dataType = activeGrid.data[activeGrid.activeRowIndex].evsMetricType.dataType;
            if (dataType === "Decimal") {
                if (!(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
                    control.setInvalid("Please enter numeric value.");
            }
            else if ((dataType === "Integer") && !(/^\d{1,9}$/.test(enteredText)))
            	control.setInvalid("Please enter valid number.");
        },

        validateLaborControl: function() {
            var me = this;

             for (var index = 0; index < me.laborControls.length; index++) {
                if (me.laborControls[index].evsMetricType.dataType === "Decimal") {
                    if (me.laborControls[index].period1 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period1))
                        || me.laborControls[index].period2 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period2))
                        || me.laborControls[index].period3 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period3))
                        || me.laborControls[index].period4 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period4))
                        || me.laborControls[index].period5 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period5))
                        || me.laborControls[index].period6 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period6))
                        || me.laborControls[index].period7 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period7))
                        || me.laborControls[index].period8 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period8))
                        || me.laborControls[index].period9 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period9))
                        || me.laborControls[index].period10 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period10))
                        || me.laborControls[index].period11 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period11))
                        || me.laborControls[index].period12 !== "" && !(/^\d{0,16}(\.\d{1,2})?$/.test(me.laborControls[index].period12))) {
                        return false;
                    }
                }
            }
            return true;
        },

        strategicInitiativeItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.strategicInitiativeGrid.data[index] !== undefined) {
                me.strategicInitiativeGrid.data[index].modified = true;
            }
        },

        qualityAssuranceItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.qualityAssuranceGrid.data[index] !== undefined) {
                me.qualityAssuranceGrid.data[index].modified = true;
                me.qaPeriod1.text.select();
                me.qaPeriod1.text.focus();
                me.qaMetricTypeTitle.text.readOnly = true;
            }
        },

        qualityPartnershipItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.qualityPartnershipGrid.data[index] !== undefined) {
                me.qualityPartnershipGrid.data[index].modified = true;
                me.qpMetricTypeTitle.text.readOnly = true;
            }
        },

        auditScoreItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.auditScoreGrid.data[index] !== undefined) {
                me.auditScoreGrid.data[index].modified = true;
                me.asMetricTypeTitle.text.readOnly = true;
            }
        },

        competencyTrainingItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.competencyTrainingGrid.data[index] !== undefined) {
                me.competencyTrainingGrid.data[index].modified = true;
                me.ctMetricTypeTitle.text.readOnly = true;
            }
        },

        adminObjectiveItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.adminObjectiveGrid.data[index] !== undefined) {
                me.adminObjectiveGrid.data[index].modified = true;
                me.aoMetricTypeTitle.text.readOnly = true;
            }
        },

        evsStatisticItemSelect: function () {
            var args = ii.args(arguments, {
                index: { type: Number }
            });
            var me = this;
            var index = args.index;

            if (me.evsStatisticGrid.data[index] !== undefined) {
                me.evsStatisticGrid.data[index].modified = true;
                me.evssPeriod1.text.select();
                me.evssPeriod1.text.focus();
                me.evssMetricTypeTitle.text.readOnly = true;
            }
        },

        managementStaffItemSelect: function () {
            var args = ii.args(arguments, {
                index: { type: Number }
            });
            var me = this;
            var index = args.index;

            if (me.managementStaffGrid.data[index] !== undefined) {
                me.managementStaffGrid.data[index].modified = true;
                me.msPeriod1.text.select();
                me.msPeriod1.text.focus();
                me.msMetricTypeTitle.text.readOnly = true;
            }
        },

        managementStaffItemDeSelect: function() {
            var me = this;
            var index = me.managementStaffGrid.selectedRows[0];

            if (index >= 0) {
                $(me.managementStaffGrid.rows[index].getElement("staffManagementRatio")).text(me.staffManagementRatio.check.checked ? "Yes" : "No");
            }
        },

        actionUndoItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            me.yearChanged();
        },

        actionSaveItem: function() {
            var me = this;
            var item = [];

            // Check to see if the data entered is valid
            me.strategicInitiativeGrid.body.deselectAll();
            me.qualityAssuranceGrid.body.deselectAll();
            me.qualityPartnershipGrid.body.deselectAll();
            me.auditScoreGrid.body.deselectAll();
            me.competencyTrainingGrid.body.deselectAll();
            me.adminObjectiveGrid.body.deselectAll();
            me.evsStatisticGrid.body.deselectAll();
            me.managementStaffGrid.body.deselectAll();

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
                    || !me.vacantPositions.valid || !me.budgetedProductivity.valid || !me.contractedProductivity.valid 
                    || !me.supportedByNPC.valid || !me.thirdPartySatisfaction.valid || !me.employeeProductiveHoursPerWeekStandard.valid
                    || !me.serviceLinePT.valid || !me.serviceLineLaundry.valid
                    || !me.serviceLinePOM.valid || !me.serviceLineCES.valid || !me.uvManufacturer.valid || !me.hygiena.valid || !me.wanda.valid
                    || !me.union.valid || !me.microFiber.valid || !me.mop.valid || !me.cartManufacturer.valid
                    || !me.taskManagementSystem.valid || !me.taskManagementSystemOther.valid
					|| !me.managerEmail.valid || !me.managerPhone.valid || !me.managerFax.valid || !me.managerCellPhone.valid || !me.managerPager.valid 
					|| !me.managerAssistantPhone.valid || !me.clientPhone.valid || !me.clientFax.valid || !me.clientAssistantPhone.valid) {
                    alert("In order to save, the errors on the page must be corrected. Please verify the data on Hospital & Contract tab.");
                    return false;
                }
            }

            if (me.laborControlShow && !me.validateLaborControl()) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on Labor Control tab.");
                return false;
            }

            if (me.strategicInitiativesShow && me.strategicInitiativeGrid.activeRowIndex >= 0) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on Strategic Initiatives tab.");
                return false;
            }

            if (me.qualityAssuranceShow && (me.qualityAssuranceGrid.activeRowIndex >= 0 || me.qualityPartnershipGrid.activeRowIndex >= 0 || me.auditScoreGrid.activeRowIndex >= 0 || me.competencyTrainingGrid.activeRowIndex >= 0)) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on Quality Assurance tab.");
                return false;
            }

            if (me.adminObjectivesShow && me.adminObjectiveGrid.activeRowIndex >= 0) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on Admin Objectives tab.");
                return false;
            }

            if (me.evsStatisticShow && me.evsStatisticGrid.activeRowIndex >= 0) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on EVS Statistics tab.");
                return false;
            }

            if (me.managementStaffShow && me.managementStaffGrid.activeRowIndex >= 0) {
                alert("In order to save, the errors on the page must be corrected. Please verify the data on Management Staff tab.");
                return false;
            }

            item = new fin.hcm.evsMetric.Metric(
                me.evsMetricId
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
                , me.vacantPositions.getValue()
                , me.budgetedProductivity.getValue()
                , me.contractedProductivity.getValue()
                , (me.supportedByNPC.indexSelected >= 0 ? me.supportedByNPC.data[me.supportedByNPC.indexSelected].id : -1)
                , (me.thirdPartySatisfaction.indexSelected >= 0 ? me.thirdPartySatisfaction.data[me.thirdPartySatisfaction.indexSelected].id : -1)
                , me.employeeProductiveHoursPerWeekStandard.getValue()
                , (me.taskManagementSystem.indexSelected >= 0 ? me.taskManagementSystems[me.taskManagementSystem.indexSelected].id : 0)
                , me.taskManagementSystemOther.getValue()
                , me.serviceLinePT.getValue()
                , me.serviceLineLaundry.getValue()
                , me.serviceLinePOM.getValue()
                , me.serviceLineCES.getValue()
                , (me.uvManufacturer.indexSelected >= 0 ? me.uvManufacturer.data[me.uvManufacturer.indexSelected].id : -1)
                , (me.hygiena.indexSelected >= 0 ? me.hygiena.data[me.hygiena.indexSelected].id : -1)
                , (me.wanda.indexSelected >= 0 ? me.wanda.data[me.wanda.indexSelected].id : -1)
                , (me.union.indexSelected >= 0 ? me.union.data[me.union.indexSelected].id : -1)
                , (me.microFiber.indexSelected >= 0 ? me.microFiber.data[me.microFiber.indexSelected].id : -1)
                , (me.mop.indexSelected >= 0 ? me.mop.data[me.mop.indexSelected].id : -1)
                , (me.cartManufacturer.indexSelected >= 0 ? me.cartManufacturer.data[me.cartManufacturer.indexSelected].id : -1)
                , me.notes.value
                );

			me.houseCodeDetails[0].managerName = me.managerName.getValue();
			me.houseCodeDetails[0].managerEmail = me.managerEmail.getValue();
            me.houseCodeDetails[0].managerPhone = fin.cmn.text.mask.phone(me.managerPhone.getValue(), true);
            me.houseCodeDetails[0].managerFax = fin.cmn.text.mask.phone(me.managerFax.getValue(), true);
            me.houseCodeDetails[0].managerCellPhone = fin.cmn.text.mask.phone(me.managerCellPhone.getValue(), true);
            me.houseCodeDetails[0].managerPager = fin.cmn.text.mask.phone(me.managerPager.getValue(), true);
            me.houseCodeDetails[0].managerAssistantName = me.managerAssistantName.getValue();
            me.houseCodeDetails[0].managerAssistantPhone = me.managerAssistantPhone.getValue();
            me.houseCodeDetails[0].clientFirstName = me.clientFirstName.getValue();
            me.houseCodeDetails[0].clientLastName = me.clientLastName.getValue();
			me.houseCodeDetails[0].clientTitle = me.clientTitle.getValue();
            me.houseCodeDetails[0].clientPhone = fin.cmn.text.mask.phone(me.clientPhone.getValue(), true);
            me.houseCodeDetails[0].clientFax = fin.cmn.text.mask.phone(me.clientFax.getValue(), true);
            me.houseCodeDetails[0].clientAssistantName = me.clientAssistantName.getValue();
            me.houseCodeDetails[0].clientAssistantPhone = fin.cmn.text.mask.phone(me.clientAssistantPhone.getValue(), true);

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
                item: {type: fin.hcm.evsMetric.Metric}
            });
            var me = this;
            var item = args.item;
            var index = 0;
            var xml = "";

            if (me.hospitalContractShow || me.laborControlShow || me.strategicInitiativesShow || me.qualityAssuranceShow || me.adminObjectivesShow || me.evsStatisticShow || me.managementStaffShow) {
				xml += '<houseCodeDetail';
				xml += ' houseCodeId="' + item.houseCodeId + '"';
                xml += ' managerName="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].managerName) + '"';
				xml += ' managerEmail="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].managerEmail) + '"';
                xml += ' managerPhone="' + me.houseCodeDetails[0].managerPhone + '"';
                xml += ' managerFax="' + me.houseCodeDetails[0].managerFax + '"';
                xml += ' managerCellPhone="' + me.houseCodeDetails[0].managerCellPhone + '"';
                xml += ' managerPager="' + me.houseCodeDetails[0].managerPager + '"';
                xml += ' managerAssistantName="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].managerAssistantName) + '"';
                xml += ' managerAssistantPhone="' + me.houseCodeDetails[0].managerAssistantPhone + '"';
                xml += ' clientFirstName="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].clientFirstName) + '"';
                xml += ' clientLastName="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].clientLastName) + '"';
				xml += ' clientTitle="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].clientTitle) + '"';
                xml += ' clientPhone="' + me.houseCodeDetails[0].clientPhone + '"';
                xml += ' clientFax="' + me.houseCodeDetails[0].clientFax + '"';
                xml += ' clientAssistantName="' + ui.cmn.text.xml.encode(me.houseCodeDetails[0].clientAssistantName) + '"';
                xml += ' clientAssistantPhone="' + me.houseCodeDetails[0].clientAssistantPhone + '"';
                xml += ' notes="' + ui.cmn.text.xml.encode(item.notes) + '"';
                xml += '/>';
                xml += '<evsMetric';
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
                xml += ' vacantPositions="' + item.vacantPositions + '"';
                xml += ' budgetedProductivity="' + item.budgetedProductivity + '"';
                xml += ' contractedProductivity="' + item.contractedProductivity + '"';
                xml += ' supportedByNPC="' + item.supportedByNPC + '"';
                xml += ' thirdPartySatisfaction="' + item.thirdPartySatisfaction + '"';
                xml += ' employeeProductiveHoursPerWeekStandard="' + item.employeeProductiveHoursPerWeekStandard + '"';
                xml += ' taskManagementSystem="' + item.taskManagementSystem + '"';
                xml += ' taskManagementSystemOther="' + ui.cmn.text.xml.encode(item.taskManagementSystemOther) + '"';
                xml += ' serviceLinePT="' + ui.cmn.text.xml.encode(item.serviceLinePT) + '"';
                xml += ' serviceLineLaundry="' + ui.cmn.text.xml.encode(item.serviceLineLaundry) + '"';
                xml += ' serviceLinePOM="' + ui.cmn.text.xml.encode(item.serviceLinePOM) + '"';
                xml += ' serviceLineCES="' + ui.cmn.text.xml.encode(item.serviceLineCES) + '"';
                xml += ' uvManufacturer="' + item.uvManufacturer + '"';
                xml += ' hygiena="' + item.hygiena + '"';
                xml += ' wanda="' + item.wanda + '"';
                xml += ' union="' + item.union + '"';
                xml += ' microFiber="' + item.microFiber + '"';
                xml += ' mop="' + item.mop + '"';
                xml += ' cartManufacturer="' + item.cartManufacturer + '"';
				xml += '/>';
            }

            if (me.laborControlShow) {
                for (index = 0; index < me.laborControls.length; index++) {
                    if (me.laborControls[index].modified || me.laborControls[index].id === 0) {
                        me.laborControls[index].modified = false;
                        if (me.laborControls[index].id === 0)
                            me.reloadData = true;
                        if (me.laborControls[index].evsMetricType.dataType === "Decimal" || me.laborControls[index].evsMetricType.dataType === "Integer")
                            xml += '<evsMetricNumericDetail';
                        else
                            xml += '<evsMetricTextDetail';
                        xml += ' id="' + me.laborControls[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.laborControls[index].evsMetricType.id + '"';
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
                for (index = 0; index < me.strategicInitiatives.length; index++) {
                    if (me.strategicInitiatives[index].modified || me.strategicInitiatives[index].id === 0) {
                        me.strategicInitiatives[index].modified = true;
                        xml += '<evsMetricStrategicInitiative';
                        xml += ' id="' + me.strategicInitiatives[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' hospitalIntiative="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].hospitalIntiative) + '"';
                        xml += ' expectedOutcome="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].expectedOutcome) + '"';
                        xml += ' departmentIntiative="' + ui.cmn.text.xml.encode(me.strategicInitiatives[index].departmentIntiative) + '"';
                        xml += '/>';
                    }
                }
            }

            if (me.qualityAssuranceShow) {
                for (index = 0; index < me.qualityAssurances.length; index++) {
                    if (me.qualityAssurances[index].modified || me.qualityAssurances[index].id === 0) {
                        me.qualityAssurances[index].modified = false;
                        if (me.qualityAssurances[index].id === 0)
                            me.reloadData = true;
                        if (me.qualityAssurances[index].evsMetricType.dataType === "Decimal")
                            xml += '<evsMetricNumericDetail';
                        else
                            xml += '<evsMetricTextDetail';
                        xml += ' id="' + me.qualityAssurances[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.qualityAssurances[index].evsMetricType.id + '"';
                        xml += ' period1="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period1) + '"';
                        xml += ' period2="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period2) + '"';
                        xml += ' period3="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period3) + '"';
                        xml += ' period4="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period4) + '"';
                        xml += ' period5="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period5) + '"';
                        xml += ' period6="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period6) + '"';
                        xml += ' period7="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period7) + '"';
                        xml += ' period8="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period8) + '"';
                        xml += ' period9="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period9) + '"';
                        xml += ' period10="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period10) + '"';
                        xml += ' period11="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period11) + '"';
                        xml += ' period12="' + ui.cmn.text.xml.encode(me.qualityAssurances[index].period12) + '"';
                        xml += '/>';
                    }
                }

                for (index = 0; index < me.qualityPartnerships.length; index++) {
                    if (me.qualityPartnerships[index].modified || me.qualityPartnerships[index].id === 0) {
                        me.qualityPartnerships[index].modified = true;
                        xml += '<evsMetricQualityPartnership';
                        xml += ' id="' + me.qualityPartnerships[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.qualityPartnerships[index].evsMetricType.id + '"';
                        xml += ' quarter1="' + me.qualityPartnerships[index].quarter1 + '"';
                        xml += ' quarter2="' + me.qualityPartnerships[index].quarter2 + '"';
                        xml += ' quarter3="' + me.qualityPartnerships[index].quarter3 + '"';
                        xml += ' quarter4="' + me.qualityPartnerships[index].quarter4 + '"';
                        xml += '/>';
                    }
                }

                for (index = 0; index < me.auditScores.length; index++) {
                    if (me.auditScores[index].modified || me.auditScores[index].id === 0) {
                        me.auditScores[index].modified = true;
                        xml += '<evsMetricAuditScore';
                        xml += ' id="' + me.auditScores[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.auditScores[index].evsMetricType.id + '"';
                        xml += ' annual1="' + me.auditScores[index].annual1 + '"';
                        xml += ' annual2="' + me.auditScores[index].annual2 + '"';
                        xml += '/>';
                    }
                }

                for (index = 0; index < me.competencyTrainings.length; index++) {
                    if (me.competencyTrainings[index].modified || me.competencyTrainings[index].id === 0) {
                        me.competencyTrainings[index].modified = true;
                        xml += '<evsMetricCompetencyTraining';
                        xml += ' id="' + me.competencyTrainings[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.competencyTrainings[index].evsMetricType.id + '"';
                        xml += ' quarter1="' + me.competencyTrainings[index].quarter1 + '"';
                        xml += ' quarter2="' + me.competencyTrainings[index].quarter2 + '"';
                        xml += ' quarter3="' + me.competencyTrainings[index].quarter3 + '"';
                        xml += ' quarter4="' + me.competencyTrainings[index].quarter4 + '"';
                        xml += '/>';
                    }
                }
            }

            if (me.adminObjectivesShow) {
                for (index = 0; index < me.adminObjectives.length; index++) {
                    if (me.adminObjectives[index].modified || me.adminObjectives[index].id === 0) {
                        me.adminObjectives[index].modified = true;
                        xml += '<evsMetricAdminObjective';
                        xml += ' id="' + me.adminObjectives[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.adminObjectives[index].evsMetricType.id + '"';
                        xml += ' quarter1="' + ((me.adminObjectives[index].quarter1 === null || me.adminObjectives[index].quarter1 === undefined) ? "0" : me.adminObjectives[index].quarter1.id) + '"';
                        xml += ' quarter2="' + ((me.adminObjectives[index].quarter2 === null || me.adminObjectives[index].quarter2 === undefined) ? "0" : me.adminObjectives[index].quarter2.id) + '"';
                        xml += ' quarter3="' + ((me.adminObjectives[index].quarter3 === null || me.adminObjectives[index].quarter3 === undefined) ? "0" : me.adminObjectives[index].quarter3.id) + '"';
                        xml += ' quarter4="' + ((me.adminObjectives[index].quarter4 === null || me.adminObjectives[index].quarter4 === undefined) ? "0" : me.adminObjectives[index].quarter4.id) + '"';
                        xml += '/>';
                    }
                }
            }

            if (me.evsStatisticShow) {
                for (index = 0; index < me.evsStatistics.length; index++) {
                    if (me.evsStatistics[index].modified || me.evsStatistics[index].id === 0) {
                        me.evsStatistics[index].modified = false;
                        if (me.evsStatistics[index].id === 0)
                            me.reloadData = true;
                        if (me.evsStatistics[index].evsMetricType.dataType === "Decimal" || me.evsStatistics[index].evsMetricType.dataType === "Integer")
                            xml += '<evsMetricNumericDetail';
                        else
                            xml += '<evsMetricTextDetail';
                        xml += ' id="' + me.evsStatistics[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.evsStatistics[index].evsMetricType.id + '"';
                        xml += ' period1="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period1) + '"';
                        xml += ' period2="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period2) + '"';
                        xml += ' period3="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period3) + '"';
                        xml += ' period4="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period4) + '"';
                        xml += ' period5="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period5) + '"';
                        xml += ' period6="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period6) + '"';
                        xml += ' period7="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period7) + '"';
                        xml += ' period8="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period8) + '"';
                        xml += ' period9="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period9) + '"';
                        xml += ' period10="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period10) + '"';
                        xml += ' period11="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period11) + '"';
                        xml += ' period12="' + ui.cmn.text.xml.encode(me.evsStatistics[index].period12) + '"';
                        xml += '/>';
                    }
                }
            }

            if (me.managementStaffShow) {
                for (index = 0; index < me.managementStaffs.length; index++) {
                    if (me.managementStaffs[index].modified || me.managementStaffs[index].id === 0) {
                        me.managementStaffs[index].modified = false;
                        if (me.managementStaffs[index].id === 0)
                            me.reloadData = true;
                        if (me.managementStaffs[index].evsMetricType.dataType === "Decimal" || me.managementStaffs[index].evsMetricType.dataType === "Integer")
                            xml += '<evsMetricNumericDetail';
                        else
                            xml += '<evsMetricTextDetail';
                        xml += ' id="' + me.managementStaffs[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.managementStaffs[index].evsMetricType.id + '"';
                        xml += ' staffManagementRatio="' + me.managementStaffs[index].staffManagementRatio + '"';
                        xml += ' period1="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period1) + '"';
                        xml += ' period2="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period2) + '"';
                        xml += ' period3="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period3) + '"';
                        xml += ' period4="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period4) + '"';
                        xml += ' period5="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period5) + '"';
                        xml += ' period6="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period6) + '"';
                        xml += ' period7="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period7) + '"';
                        xml += ' period8="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period8) + '"';
                        xml += ' period9="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period9) + '"';
                        xml += ' period10="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period10) + '"';
                        xml += ' period11="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period11) + '"';
                        xml += ' period12="' + ui.cmn.text.xml.encode(me.managementStaffs[index].period12) + '"';
                        xml += '/>';
                    }
                }
            }

            return xml;
        },

        saveResponse: function(){
            var args = ii.args(arguments, {
                transaction: { type: ii.ajax.TransactionMonitor.Transaction },
                xmlNode: { type: "XmlNode:transaction" }
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");
            var id = 0;

            if (status === "success") {
                me.modified(false);

                $(args.xmlNode).find("*").each(function() {
                    switch (this.tagName) {
                        case "evsMetric":
                            if (me.evsMetricId === 0) {
                                me.evsMetricId = parseInt($(this).attr("id"), 10);
                                item.id = me.evsMetricId;
                                me.metrics.push(item);
                                me.reloadData = true;
                            }
                            break;

                        case "evsMetricStrategicInitiative":
                            id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.strategicInitiativeGrid.data.length; index++) {
                                if (me.strategicInitiativeGrid.data[index].modified) {
                                    if (me.strategicInitiativeGrid.data[index].id === 0)
                                        me.strategicInitiativeGrid.data[index].id = id;
                                    me.strategicInitiativeGrid.data[index].modified = false;
                                    break;
                                }
                            }
                            break;

                        case "evsMetricQualityPartnership":
                            id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.qualityPartnershipGrid.data.length; index++) {
                                if (me.qualityPartnershipGrid.data[index].modified) {
                                    if (me.qualityPartnershipGrid.data[index].id === 0)
                                        me.qualityPartnershipGrid.data[index].id = id;
                                    me.qualityPartnershipGrid.data[index].modified = false;
                                    break;
                                }
                            }
                            break;

                        case "evsMetricAuditScore":
                            id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.auditScoreGrid.data.length; index++) {
                                if (me.auditScoreGrid.data[index].modified) {
                                    if (me.auditScoreGrid.data[index].id === 0)
                                        me.auditScoreGrid.data[index].id = id;
                                    me.auditScoreGrid.data[index].modified = false;
                                    break;
                                }
                            }
                            break;

                        case "evsMetricCompetencyTraining":
                            id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.competencyTrainingGrid.data.length; index++) {
                                if (me.competencyTrainingGrid.data[index].modified) {
                                    if (me.competencyTrainingGrid.data[index].id === 0)
                                        me.competencyTrainingGrid.data[index].id = id;
                                    me.competencyTrainingGrid.data[index].modified = false;
                                    break;
                                }
                            }
                            break;

                        case "evsMetricAdminObjective":
                            id = parseInt($(this).attr("id"), 10);

                            for (var index = 0; index < me.adminObjectiveGrid.data.length; index++) {
                                if (me.adminObjectiveGrid.data[index].modified) {
                                    if (me.adminObjectiveGrid.data[index].id === 0)
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
                alert("[SAVE FAILURE] Error while updating evs metric details: " + $(args.xmlNode).attr("message"));
            }

            if (!me.reloadData)
                $("#pageLoading").fadeOut("slow");
            else {
                me.numericDetailStore.reset();
                me.textDetailStore.reset();
                me.numericDetailStore.fetch("userId:[user],evsMetricId:" + me.evsMetricId, me.numericDetailsLoaded, me);
            }
        }
    }
});

function main() {
    fin.hcmEVSMetricUi = new fin.hcm.evsMetric.UserInterface();
    fin.hcmEVSMetricUi.resize();
    fin.houseCodeSearchUi = fin.hcmEVSMetricUi;
}
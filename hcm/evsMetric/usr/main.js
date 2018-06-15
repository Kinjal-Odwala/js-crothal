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
            me.loadCount = 0;
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
            me.qualityAssuranceShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\QualityAssurance");
            me.adminObjectivesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\AdminObjectives");
            me.evsStatisticShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\EVSStatistcs");

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

            setTimeout(function() {
                $("#container-1").tabs(me.activeFrameId);
                $("#container-1").triggerTab(me.activeFrameId);
                me.resizeControls(me.activeFrameId);
            }, 100);
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
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

            if ($("#EVSHCAHPSGridContainer").width() < 2600) {
                $("#EVSHCAHPSGrid").width(2600);
            }
            if ($("#EVSStatisticGridContainer").width() < 2500) {
                $("#EVSStatisticGrid").width(2500);
                me.evsStatisticGrid.setHeight($(window).height() - 168);
            }
            else {
                me.evsStatisticGrid.setHeight($(window).height() - 143);
            }

            me.strategicInitiativeGrid.setHeight($(window).height() - 145);
            me.evsHCAHPSGrid.setHeight(150);
            me.qualityPartnershipGrid.setHeight(150);
            me.auditScoreGrid.setHeight(150);
            me.competencyTrainingGrid.setHeight(150);
            me.adminObjectiveGrid.setHeight($(window).height() - 145);

            var divLaborControlGridWidth = $(window).width() - 258;
            var divLaborControlGridHeight = 190;
            $("#divLaborControlGrid").css({"width" : divLaborControlGridWidth + "px", "height" : divLaborControlGridHeight + "px"});

            var divCommentsGridWidth = $(window).width() - 258;
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
                changeFunction: function() { me.modified();	}
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
                changeFunction: function() { me.modified();	}
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
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
				maxLength: 19,
                appendToId: "EVSHCAHPSGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.evsPeriod12.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {

                    me.validateControl(me.evsPeriod12, me.evsHCAHPSGrid);
                });

            me.evsHCAHPSGrid.addColumn("evsHCAHPSMetricTypeTitle", "evsMetricTypeTitle", "", "", null, null, me.evsHCAHPSMetricTypeTitle);
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
                id: "PTSPeriod1",
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
                id: "PTSPeriod2",
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
                id: "PTSPeriod3",
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
                id: "PTSPeriod4",
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
                id: "PTSPeriod5",
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
                id: "PTSPeriod6",
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
                id: "PTSPeriod7",
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
                id: "PTSPeriod8",
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
                id: "PTSPeriod9",
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
                id: "PTSPeriod10",
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
                id: "PTSPeriod11",
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
                id: "PTSPeriod12",
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

            me.evsHCAHPS = [];
            me.evsHCAHPSStore = me.cache.register({
                storeId: "evsEVSHCAHPS",
                itemConstructor: fin.hcm.evsMetric.EVSHCAHPS,
                itemConstructorArgs: fin.hcm.evsMetric.evsHCAHPSArgs,
                injectionArray: me.evsHCAHPS,
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

                $("#container-1").tabs(me.activeFrameId);
                $("#container-1").triggerTab(me.activeFrameId);
                setTimeout(function() {
                    me.resizeControls(me.activeFrameId);
                }, 100);
            });

            $("#divLaborControlGrid").bind("scroll", me.laborControlGridScroll);
            $("#divCommentsGrid").bind("scroll", me.commentsGridScroll);
            $("#QualityAssuranceContainer").bind("scroll", me.qualityAssuranceGridScroll);
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
            me.taskManagementSystem.text.tabIndex = 16;
            me.taskManagementSystemOther.text.tabIndex = 17;
            me.serviceLinePT.text.tabIndex = 18;
            me.serviceLineLaundry.text.tabIndex = 19;
            me.serviceLinePOM.text.tabIndex = 20;
            me.serviceLineCES.text.tabIndex = 21;
            me.uvManufacturer.text.tabIndex = 22;
            me.hygiena.text.tabIndex = 23;
            me.wanda.text.tabIndex = 24;
            me.union.text.tabIndex = 25;
            me.microFiber.text.tabIndex = 26;
            me.mop.text.tabIndex = 27;
            me.cartManufacturer.text.tabIndex = 28;
            me.notes.tabIndex = 29;
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

            me.evsHCAHPSGrid.setHeight(150);
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
            }
            else if (selectedTab === 3) {
                me.strategicInitiativeGrid.setHeight($(window).height() - 145);
            }
            else if (selectedTab === 4) {
                if ($("#EVSHCAHPSGridContainer").width() < 2600) {
                    $("#EVSHCAHPSGrid").width(2600);
                }
                me.evsHCAHPSGrid.setHeight(150);
                me.qualityPartnershipGrid.setHeight(150);
                me.auditScoreGrid.setHeight(150);
                me.competencyTrainingGrid.setHeight(150);
            }
            else if (selectedTab === 5) {
                me.adminObjectiveGrid.setHeight($(window).height() - 145);
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
            me.notes.value = "";
            $("#TMSOtherContainer").hide();

            if (me.strategicInitiativeGrid.activeRowIndex !== - 1)
                me.strategicInitiativeGrid.body.deselect(me.strategicInitiativeGrid.activeRowIndex, true);
            if (me.evsHCAHPSGrid.activeRowIndex !== - 1)
                me.evsHCAHPSGrid.body.deselect(me.evsHCAHPSGrid.activeRowIndex, true);
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

            me.strategicInitiativeGrid.setData([]);
            me.evsHCAHPSGrid.setData([]);
            me.qualityPartnershipGrid.setData([]);
            me.auditScoreGrid.setData([]);
            me.competencyTrainingGrid.setData([]);
            me.adminObjectiveGrid.setData([]);
            me.evsStatisticGrid.setData([]);

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
        },

        houseCodeChanged: function() {
            var me = this;

            if (parent.fin.appUI.houseCodeId <= 0)
                return;

            me.yearChanged();
        },

        typesLoaded: function() {
            var me = this;

            me.types = [];
            me.types.push(new fin.hcm.evsMetric.Type(1, "Yes"));
            me.types.push(new fin.hcm.evsMetric.Type(0, "No"));
            me.supportedByNPC.setData(me.types);
            me.hygiena.setData(me.types);
        },

        metricTypesLoaded: function(me, activeId) {

            me.thirdPartySatisfactionTypes = [];
            me.uvManufacturerTypes = [];
            me.wandaTypes = [];
            me.unionTypes = [];
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
                else if (me.metricTypes[index].subType === "Union")
                    me.unionTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "Micro Fiber")
                    me.microFiberTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "MOP")
                    me.mopTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
                else if (me.metricTypes[index].subType === "Cart Manufacturer")
                    me.cartManufacturerTypes.push(new fin.hcm.evsMetric.Type(me.metricTypes[index].id, me.metricTypes[index].title));
            }

            me.thirdPartySatisfaction.setData(me.thirdPartySatisfactionTypes);
            me.uvManufacturer.setData(me.uvManufacturerTypes);
            me.wanda.setData(me.wandaTypes);
            me.union.setData(me.unionTypes);
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
            me.yearChanged();
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
                me.evsMetricId = 0;
                me.setGridData();
                me.checkLoadCount();
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
            me.evsHCAHPS = [];
            me.evsStatistics = [];

            if (me.numericDetails.length === 0) {
                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "Labor Control" && me.metricTypes[index].brief !== "") {
                        item = new fin.hcm.evsMetric.LaborControl(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.laborControls.push(item);
                    }
                    else if (me.metricTypes[index].subType === "Quality Assurance - EVS HCAHPS") {
                        item = new fin.hcm.evsMetric.EVSHCAHPS(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title);
                        me.evsHCAHPS.push(item);
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
                    else if (me.numericDetails[index].evsMetricType.subType === "Quality Assurance - EVS HCAHPS") {
                        item = new fin.hcm.evsMetric.EVSHCAHPS(
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
                        me.evsHCAHPS.push(item);
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
                    else if (me.textDetails[index].evsMetricType.subType === "Quality Assurance - EVS HCAHPS") {
                        item = new fin.hcm.evsMetric.EVSHCAHPS(
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
                        me.evsHCAHPS.push(item);
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
                    if (me.metricTypes[index].subType === "Quality Assurance - EVS HCAHPS") {
                        var result = $.grep(me.evsHCAHPS, function(item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.evsHCAHPS.push(new fin.hcm.evsMetric.EVSHCAHPS(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }

                for (index = 0; index < me.metricTypes.length; index++) {
                    if (me.metricTypes[index].subType === "EVS Statistics") {
                        var result = $.grep(me.evsStatistics, function (item) { return item.evsMetricType.id === me.metricTypes[index].id; });
                        if (result.length === 0)
                            me.evsStatistics.push(new fin.hcm.evsMetric.EVSStatistic(0, me.evsMetricId, me.metricTypes[index], me.metricTypes[index].title));
                    }
                }
            }

            me.evsHCAHPS.sort(me.customSort);
            me.evsHCAHPSGrid.setData(me.evsHCAHPS);
            me.evsStatisticGrid.setData(me.evsStatistics);
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
            var index =0;
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
                    if (me.laborControls[index].evsMetricType.brief === "Budget")
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

                if (index === 3 || index === 7) {
                    laborControlRow = laborControlRowTotalTemplate;
                    laborControlRow = laborControlRow.replace(/RowCount/g, index);
                    laborControlRow = laborControlRow.replace("RowStyle", "totalGridRow");
                    if (index === 3 || index === 7)
                        $("#LaborControlGridBody").append(laborControlRow);

                    if (index === 3)
                        $("#tdTitleTotal" + index).html("Paid Total Hours");
                    else if (index === 7)
                        $("#tdTitleTotal" + index).html("Paid Total Dollars");

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

                if (index === 3 || index === 7) {
                    for (iIndex = 1; iIndex <= 12; iIndex++) {
                        total = ($("#txtPeriod" + iIndex + "Budget" + (index - 3)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Budget" + (index - 3)).val()))
                            + ($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Budget" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Budget" + index).html(total.toFixed(2));
                        total = ($("#txtPeriod" + iIndex + "Actual" + (index - 3)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Actual" + (index - 3)).val()))
                            + ($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val() === "" ? 0 : parseFloat($("#txtPeriod" + iIndex + "Actual" + (index - 1)).val()));
                        $("#spnPeriod" + iIndex + "Actual" + index).html(total.toFixed(2));
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
                else if (rowCount === 4 || rowCount === 6) {
                    startRowNumber = 4;
                    endRowNumber = 6;
                    totalRowNumber = 7;
                }
                else if (rowCount === 5 || rowCount === 7) {
                    startRowNumber = 5;
                    endRowNumber = 7;
                    totalRowNumber = 7;
                }

                total = (me.laborControls[startRowNumber]["period" + period] === "" ? 0 : parseFloat(me.laborControls[startRowNumber]["period" + period]))
                    + (me.laborControls[endRowNumber]["period" + period] === "" ? 0 : parseFloat(me.laborControls[endRowNumber]["period" + period]));
                $("#spnPeriod" + period + type + totalRowNumber).html(total.toFixed(2));
            }
        },

        commentsBlur: function(objInput) {
            var me = this;
            var period = objInput.id.replace("txtPeriod", "");

            if (objInput.value !== me.laborControls[8]["period" + period]) {
                me.laborControls[8]["period" + period] = objInput.value;
                me.laborControls[8].modified = true;
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
            else if (dataType === "Integer") {
                if (!(/^\d{1,9}$/.test(enteredText)))
                    control.setInvalid("Please enter valid number.");
            }
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

        evsHCAHPSItemSelect: function() {
            var args = ii.args(arguments, {
                index: {type: Number}
            });
            var me = this;
            var index = args.index;

            if (me.evsHCAHPSGrid.data[index] !== undefined) {
                me.evsHCAHPSGrid.data[index].modified = true;
                me.evsPeriod1.text.select();
                me.evsPeriod1.text.focus();
                me.evsHCAHPSMetricTypeTitle.text.readOnly = true;
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
            me.evsHCAHPSGrid.body.deselectAll();
            me.qualityPartnershipGrid.body.deselectAll();
            me.auditScoreGrid.body.deselectAll();
            me.competencyTrainingGrid.body.deselectAll();
            me.adminObjectiveGrid.body.deselectAll();
            me.evsStatisticGrid.body.deselectAll();

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
                    || !me.vacantPositions || !me.budgetedProductivity || !me.contractedProductivity || !me.supportedByNPC || !me.thirdPartySatisfaction
                    || !me.serviceLinePT.valid || !me.serviceLineLaundry.valid
                    || !me.serviceLinePOM.valid || !me.serviceLineCES.valid || !me.uvManufacturer.valid || !me.hygiena.valid || !me.wanda.valid
                    || !me.union.valid || !me.microFiber.valid || !me.mop.valid || !me.cartManufacturer.valid
                    || !me.taskManagementSystem.valid || !me.taskManagementSystemOther.valid) {
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

            if (me.qualityAssuranceShow && (me.evsHCAHPSGrid.activeRowIndex >= 0 || me.qualityPartnershipGrid.activeRowIndex >= 0 || me.auditScoreGrid.activeRowIndex >= 0 || me.competencyTrainingGrid.activeRowIndex >= 0)) {
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
                , (me.thirdPartySatisfaction.indexSelected >= 0 ? me.thirdPartySatisfaction.data[me.thirdPartySatisfaction.indexSelected].id : 0)
                , (me.taskManagementSystem.indexSelected >= 0 ? me.taskManagementSystems[me.taskManagementSystem.indexSelected].id : 0)
                , me.taskManagementSystemOther.getValue()
                , me.serviceLinePT.getValue()
                , me.serviceLineLaundry.getValue()
                , me.serviceLinePOM.getValue()
                , me.serviceLineCES.getValue()
                , (me.uvManufacturer.indexSelected >= 0 ? me.uvManufacturer.data[me.uvManufacturer.indexSelected].id : 0)
                , (me.hygiena.indexSelected >= 0 ? me.hygiena.data[me.hygiena.indexSelected].id : -1)
                , (me.wanda.indexSelected >= 0 ? me.wanda.data[me.wanda.indexSelected].id : 0)
                , (me.union.indexSelected >= 0 ? me.union.data[me.union.indexSelected].id : 0)
                , (me.microFiber.indexSelected >= 0 ? me.microFiber.data[me.microFiber.indexSelected].id : 0)
                , (me.mop.indexSelected >= 0 ? me.mop.data[me.mop.indexSelected].id : 0)
                , (me.cartManufacturer.indexSelected >= 0 ? me.cartManufacturer.data[me.cartManufacturer.indexSelected].id : 0)
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
                item: {type: fin.hcm.evsMetric.Metric}
            });
            var me = this;
            var item = args.item;
			var index = 0;
            var xml = "";

            if (me.hospitalContractShow || me.laborControlShow || me.strategicInitiativesShow || me.qualityAssuranceShow || me.adminObjectivesShow || me.evsStatisticShow) {
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
                xml += ' notes="' + ui.cmn.text.xml.encode(item.notes) + '"';
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
                for (index = 0; index < me.evsHCAHPS.length; index++) {
                    if (me.evsHCAHPS[index].modified || me.evsHCAHPS[index].id === 0) {
                        me.evsHCAHPS[index].modified = false;
                        if (me.evsHCAHPS[index].id === 0)
                            me.reloadData = true;
                        if (me.evsHCAHPS[index].evsMetricType.dataType === "Decimal")
                            xml += '<evsMetricNumericDetail';
                        else
                            xml += '<evsMetricTextDetail';
                        xml += ' id="' + me.evsHCAHPS[index].id + '"';
                        xml += ' evsMetricId="' + me.evsMetricId + '"';
                        xml += ' evsMetricTypeId="' + me.evsHCAHPS[index].evsMetricType.id + '"';
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

                        case "evsMetriCompetencyTraining":
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
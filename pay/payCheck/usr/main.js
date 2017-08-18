ii.Import("ii.krn.sys.ajax");
ii.Import("ii.krn.sys.session");
ii.Import("ui.ctl.usr.input");
ii.Import("ui.ctl.usr.buttons");
ii.Import("ui.ctl.usr.grid");
ii.Import("fin.cmn.usr.util");
ii.Import("ui.ctl.usr.toolbar");
ii.Import("ui.cmn.usr.text");
ii.Import("fin.pay.payCheck.usr.defs");
ii.Import("fin.cmn.usr.houseCodeSearch");
ii.Import("fin.cmn.usr.houseCodeSearchTemplate");

ii.Style("style", 1);
ii.Style("fin.cmn.usr.common", 2);
ii.Style("fin.cmn.usr.statusBar", 3);
ii.Style("fin.cmn.usr.input", 4);
ii.Style("fin.cmn.usr.dropDown", 5);
ii.Style("fin.cmn.usr.button", 6);
ii.Style("fin.cmn.usr.grid", 7);
ii.Style("fin.cmn.usr.toolbar", 8);

ii.Class({
    Name: "fin.pay.payCheck.UserInterface",
    Extends: "ui.lay.HouseCodeSearch",
    Definition: {
        init: function() {
            var me = this;

            me.pageLoading = true;
            me.personId = 0;
            me.users = [];
            me.loadCount = 0;
            me.fileName = "";
            me.searchBy = "";
            me.validChargeToHouseCode = false;
            me.chargeToHouseCodeCache = [];

            if (!parent.fin.appUI.houseCodeId)
                parent.fin.appUI.houseCodeId = 0;

            me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function (status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

            me.authorizer = new ii.ajax.Authorizer(me.gateway);
            me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\CheckRequest";
            me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
				    me.authorizationProcess.apply(me);
				},
				me);

            me.validator = new ui.ctl.Input.Validation.Master();
            me.session = new ii.Session(me.cache);

            me.houseCodeSearch = new ui.lay.HouseCodeSearch();
            me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();

            me.defineFormControls();
            me.configureCommunications();
            me.initialize();
            me.setTabIndexes();
            me.resizeControls();
            me.filterTypesLoaded();
            me.statusesLoaded();
            me.setStatus("Loading");
            me.modified(false);
			me.resetControls("");
			me.status = "CheckRequest";

            $(window).bind("resize", me, me.resize);

            ui.cmn.behavior.disableBackspaceNavigation();
            if (top.ui.ctl.menu) {
                top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
            }
        },

        authorizationProcess: function() {
            var me = this;

            me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
            me.approveInProcess = me.authorizer.isAuthorized(me.authorizePath + "\\ApproveInProcess");

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
                me.loadCount = 3;
                me.session.registerFetchNotify(me.sessionLoaded, me);
                me.state.fetchingData();
                me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
                me.wageTypeStore.fetch("userId:[user]:", me.wageTypesLoaded, me);
                me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);
                if (parent.fin.appUI.houseCodeId === 0)
                    me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
                else
                    me.houseCodesLoaded(me, 0);
            }
            else
                window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
        },

        sessionLoaded: function() {

            ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
        },

        resize: function() {
            var me = fin.payCheckUi;

            $("#pageLoading").height(document.body.scrollHeight);
            $("#Container").height(880);
            me.payCheckRequestGrid.setHeight(200);
            me.wageTypeDetailGrid.setHeight(150);
            me.wageTypeDetailReadOnlyGrid.setHeight(150);

            if (me.payCheckRequestGrid.activeRowIndex >= 0) {
                if (me.payCheckRequestGrid.data[me.payCheckRequestGrid.activeRowIndex].statusType === 10)
                    $("#TotalRow").width($("#WageTypeDetailGridHeader").width());
                else
                    $("#TotalRow").width($("#WageTypeDetailReadOnlyGridHeader").width());
            }
            else
                $("#TotalRow").width($("#WageTypeDetailGridHeader").width());
        },

        defineFormControls: function() {
            var me = this;

            me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
                id: "actionMenu"
            });

            me.actionMenu
				.addAction({
				    id: "newAction",
				    brief: "Payroll Check Request",
				    title: "To view the payroll check request form.",
				    actionFunction: function() { me.actionPayCheckRequest(); }
				})
				.addAction({
				    id: "viewAction",
				    brief: "Payroll Check Request Status",
				    title: "To view the status of the payroll check request.",
				    actionFunction: function() { me.actionPayCheckRequestStatus(); }
				});

            me.filterType = new ui.ctl.Input.DropDown.Filtered({
                id: "FilterType",
                formatFunction: function(type) { return type.title; },
                changeFunction: function() { me.modifySearch(); }
            });

            me.searchInput = new ui.ctl.Input.Text({
                id: "SearchInput",
                maxLength: 50
            });

            me.searchRequestedDate = new ui.ctl.Input.Date({
                id: "SearchRequestedDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.searchRequestedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {
				    var enteredText = me.deliveryDate.text.value;

				    if (enteredText === "")
				        return;

				    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
				        this.setInvalid("Please enter valid date.");
				});

            me.statusType = new ui.ctl.Input.DropDown.Filtered({
                id: "StatusType",
                formatFunction: function(type) { return type.title; }
            });

            me.statusType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    if ((this.focused || this.touched) && me.statusType.indexSelected === -1)
				        this.setInvalid("Please select the correct Status.");
				});

            me.payCheckRequestGrid = new ui.ctl.Grid({
                id: "PayCheckRequestGrid",
                appendToId: "divForm",
                allowAdds: false,
                selectFunction: function(index) { me.itemSelect(index); }
            });

            me.payCheckRequestGrid.addColumn("checkRequestNumber", "checkRequestNumber", "Check Request #", "Check Request #", 180);
            me.payCheckRequestGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
            me.payCheckRequestGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee Number", 120);
            me.payCheckRequestGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 250);
            me.payCheckRequestGrid.addColumn("requestedDate", "requestedDate", "Requested Date", "Requested Date", 150);
            me.payCheckRequestGrid.addColumn("statusType", "statusType", "Status", "Status", 100, function(statusType) {
                if (statusType === 2)
                    return "In Process";
                else if (statusType === 8)
                    return "Approved";
                else if (statusType === 9)
                    return "Completed";
                else if (statusType === 6)
                    return "Cancelled";
                else if (statusType === 10)
                    return "Unapproved";
            });
            me.payCheckRequestGrid.capColumns();

            me.requestedDate = new ui.ctl.Input.Date({
                id: "RequestedDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.requestedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
				    var enteredText = me.requestedDate.text.value;

				    if (enteredText === "")
				        return;

				    me.modified();
				    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
				        this.setInvalid("Please enter valid date.");
				});

            me.deliveryDate = new ui.ctl.Input.Date({
                id: "DeliveryDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.deliveryDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
				    var enteredText = me.deliveryDate.text.value;

				    if (enteredText === "")
				        return;

				    me.modified();
				    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
				        this.setInvalid("Please enter valid date.");
				});

            me.employeeNumber = new ui.ctl.Input.Text({
                id: "EmployeeNumber",
                maxLength: 16,
                changeFunction: function() { me.modified(); }
            });

            me.employeeNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    if (me.employeeNumber.getValue() === "")
				        return;

				    if (!(/^[0-9]+$/.test(me.employeeNumber.getValue())))
				        this.setInvalid("Please enter valid Employee Number.");
				});

            me.employeeName = new ui.ctl.Input.Text({
                id: "EmployeeName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.employeeName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

            me.reasonForRequest = new ui.ctl.Input.Text({
                id: "ReasonForRequest",
                maxLength: 1024,
                changeFunction: function() { me.modified(); }
            });

            me.reasonForRequest.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

            me.state = new ui.ctl.Input.DropDown.Filtered({
                id: "State",
                formatFunction: function(type) { return type.name; },
                changeFunction: function() { me.modified(); }
            });

            me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    if ($("#TermRequestNo")[0].checked) {
				        this.valid = true;
				    }
				    else if ((this.focused || this.touched) && me.state.indexSelected === -1)
				        this.setInvalid("Please select the correct State.");
				});

            me.terminationDate = new ui.ctl.Input.Date({
                id: "TerminationDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.terminationDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
				    if ($("#TermRequestNo")[0].checked) {
				        this.valid = true;
				    }
				    else {
				        var enteredText = me.terminationDate.text.value;

				        if (enteredText === "")
				            return;

				        me.modified();
				        if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
				            this.setInvalid("Please enter valid date.");
				    }
				});

            me.unitAddress = new ui.ctl.Input.Text({
                id: "UnitAddress",
                maxLength: 1024,
                changeFunction: function() { me.modified(); }
            });

            me.unitAddress.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

				    if ($("input[name='UPSDeliveryToUnit']:checked").val() === "true" && me.unitAddress.getValue() === "")
				        this.setInvalid("Please enter the Unit (House Code) Address.");
				});

            me.upsPackageAttentionTo = new ui.ctl.Input.Text({
                id: "UPSPackageAttentionTo",
                maxLength: 512,
                changeFunction: function() { me.modified(); }
            });

            me.homeAddress = new ui.ctl.Input.Text({
                id: "HomeAddress",
                maxLength: 1024,
                changeFunction: function() { me.modified(); }
            });

            me.homeAddress.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

				    if ($("input[name='UPSDeliveryToHome']:checked").val() === "true" && me.homeAddress.getValue() === "")
				        this.setInvalid("Please enter the Home Address.");
				});

            me.requestorName = new ui.ctl.Input.Text({
                id: "RequestorName",
                maxLength: 150
            });

            me.requestorEmail = new ui.ctl.Input.Text({
                id: "RequestorEmail",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.requestorEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    var enteredText = me.requestorEmail.getValue();

				    if (enteredText === "")
					    return;

				    if (!(ui.cmn.text.validate.emailAddress(enteredText)))
				        this.setInvalid("Please enter valid Requestor Email.");
				});

            me.requestorPhone = new ui.ctl.Input.Text({
                id: "RequestorPhone",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.requestorPhone.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

			        var enteredText = me.requestorPhone.text.value;

			        if (enteredText === "")
						return;

			        me.requestorPhone.text.value = fin.cmn.text.mask.phone(enteredText);
			        enteredText = me.requestorPhone.text.value;

			        if (!(ui.cmn.text.validate.phone(enteredText)))
			            this.setInvalid("Please enter valid Phone #. Example: (999) 999-9999");
				});

            me.managerName = new ui.ctl.Input.Text({
                id: "ManagerName",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

            me.managerEmail = new ui.ctl.Input.Text({
                id: "ManagerEmail",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    var enteredText = me.managerEmail.getValue();

				    if (enteredText === "") return;

				    if (!(ui.cmn.text.validate.emailAddress(enteredText)))
				        this.setInvalid("Please enter valid Manager Email.");
				});

            me.wageTypeDetailGrid = new ui.ctl.Grid({
                id: "WageTypeDetailGrid",
                allowAdds: true,
                createNewFunction: fin.pay.payCheck.WageTypeDetail,
                preDeactivateFunction: function() { return (me.validChargeToHouseCode ? true : false); },
                selectFunction: function(index) {
                    me.validChargeToHouseCode = true;
                    $("#HoursText, #EarningText, #AlternateBaseRate").keypress(function (e) {
                        if (e.which !== 8 && e.which !== 0 && e.which !== 46 && (e.which < 48 || e.which > 57))
                            return false;
                    });

                    $("#ChargeToHouseCodeText").keypress(function(e) {
                        me.validChargeToHouseCode = false;
                    });
                }
            });

            me.wageType = new ui.ctl.Input.DropDown.Filtered({
                id: "WageType",
                appendToId: "WageTypeDetailGridControlHolder",
                formatFunction: function(type) { return type.brief + " - " + type.title; },
                changeFunction: function() { me.modified(); }
            });

            me.wageType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    if ((this.focused || this.touched) && me.wageType.indexSelected === -1)
				        this.setInvalid("Please select the correct Wage Type.");
				});

            me.hours = new ui.ctl.Input.Text({
                id: "Hours",
                maxLength: 11,
                appendToId: "WageTypeDetailGridControlHolder",
                changeFunction: function() {
					me.modified();
					me.calculateTotal("Hours");
				}
            });

            me.hours.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    var enteredText = me.hours.getValue();

				    if (me.earnings.getValue() === "" && enteredText === "") {
				        this.setInvalid("Please enter either Hours or Earnings.");
				        me.earnings.setInvalid("Please enter either Hours or Earnings.");
				    }
				    else if (me.earnings.getValue() !== "" || enteredText !== "") {
				        this.valid = true;
				        me.earnings.resetValidation(true);
				        if (me.earnings.getValue() === "")
				            me.earnings.setValue("");
				    }

				    if (enteredText !== "" && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
				        this.setInvalid("Please enter valid Hours. Example: 99.99");
				});

            me.date = new ui.ctl.Input.Date({
                id: "Date",
                appendToId: "WageTypeDetailGridControlHolder",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.date.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
				    var enteredText = me.date.text.value;

				    if (enteredText === "")
				        return;

				    me.modified();
				    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
				        this.setInvalid("Please enter valid date.");
				});

            me.earnings = new ui.ctl.Input.Text({
                id: "Earnings",
                maxLength: 11,
                appendToId: "WageTypeDetailGridControlHolder",
                changeFunction: function() {
					me.modified();
					me.calculateTotal("Earnings");
				}
            });

            me.earnings.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

				    var enteredText = me.earnings.getValue();

				    if (me.hours.getValue() === "" && enteredText === "") {
				        this.setInvalid("Please enter either Hours or Earnings.");
				        me.hours.setInvalid("Please enter either Hours or Earnings.");
				    }
				    else if (me.hours.getValue() !== "" || enteredText !== "") {
				        this.valid = true;
				        me.hours.resetValidation(true);
				        if (me.hours.getValue() === "")
				            me.hours.setValue("");
				    }

				    if (enteredText !== "" && !(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
				        this.setInvalid("Please enter valid Earnings. Example: 99.99");
				});

            me.alternateBaseRate = new ui.ctl.Input.Text({
                id: "AlternateBaseRate",
                maxLength: 11,
                appendToId: "WageTypeDetailGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.alternateBaseRate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function(isFinal, dataMap) {

				    var enteredText = me.alternateBaseRate.getValue();

				    if (enteredText === "")
				        return;

				    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$")))
				        this.setInvalid("Please enter valid Alternate Base Rate. Example: 99.99");
				});

            me.chargeToHouseCode = new ui.ctl.Input.Text({
                id: "ChargeToHouseCode",
                maxLength: 16,
                appendToId: "WageTypeDetailGridControlHolder",
                changeFunction: function() { me.modified(); }
            });

            me.wageTypeDetailGrid.addColumn("wageType", "wageType", "Wage Type", "Wage Type", 350, function(type) { return type.brief + " - " + type.title; }, me.wageType);
            me.wageTypeDetailGrid.addColumn("hours", "hours", "Hours", "Hours", 100, function(hours) { return ui.cmn.text.money.format(hours); }, me.hours);
            me.wageTypeDetailGrid.addColumn("date", "date", "Date", "Date", 120, null, me.date);
            me.wageTypeDetailGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 100, function(earnings) { return ui.cmn.text.money.format(earnings); }, me.earnings);
            me.wageTypeDetailGrid.addColumn("alternateBaseRate", "alternateBaseRate", "Alternate Base Rate", "Alternate Base Rate", 180, function(alternateBaseRate) { return ui.cmn.text.money.format(alternateBaseRate); }, me.alternateBaseRate);
            me.wageTypeDetailGrid.addColumn("houseCodeTitle", "houseCodeTitle", "CHARGE TO HOUSE CODE", "CHARGE TO HOUSE CODE", null, null, me.chargeToHouseCode);
            me.wageTypeDetailGrid.capColumns();

            me.wageType.active = false;
            me.hours.active = false;
            me.date.active = false;
            me.earnings.active = false;
            me.alternateBaseRate.active = false;
            me.chargeToHouseCode.active = false;

            me.wageTypeDetailReadOnlyGrid = new ui.ctl.Grid({
                id: "WageTypeDetailReadOnlyGrid"
            });

            me.wageTypeDetailReadOnlyGrid.addColumn("wageType", "wageType", "Wage Type", "Wage Type", 350, function(type) { return type.brief + " - " + type.title; });
            me.wageTypeDetailReadOnlyGrid.addColumn("hours", "hours", "Hours", "Hours", 100, function(hours) { return ui.cmn.text.money.format(hours); });
            me.wageTypeDetailReadOnlyGrid.addColumn("date", "date", "Date", "Date", 120);
            me.wageTypeDetailReadOnlyGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 100, function(earnings) { return ui.cmn.text.money.format(earnings); });
            me.wageTypeDetailReadOnlyGrid.addColumn("alternateBaseRate", "alternateBaseRate", "Alternate Base Rate", "Alternate Base Rate", 180, function(alternateBaseRate) { return ui.cmn.text.money.format(alternateBaseRate); });
            me.wageTypeDetailReadOnlyGrid.addColumn("houseCodeTitle", "houseCodeTitle", "CHARGE TO HOUSE CODE", "CHARGE TO HOUSE CODE", null);
            me.wageTypeDetailReadOnlyGrid.capColumns();

            me.anchorSearch = new ui.ctl.buttons.Sizeable({
                id: "AnchorSearch",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
                clickFunction: function() { me.loadSearchResults(); },
                hasHotState: true
            });

            me.anchorNew = new ui.ctl.buttons.Sizeable({
                id: "AnchorNew",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionNewItem(); },
                hasHotState: true
            });

            me.anchorSendRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorSendRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionSendRequestItem(); },
                hasHotState: true
            });

            me.anchorResendRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorResendRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Resend Request&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionResendRequestItem(); },
                hasHotState: true
            });

            me.anchorUndo = new ui.ctl.buttons.Sizeable({
                id: "AnchorUndo",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionUndoItem(); },
                hasHotState: true
            });

            me.anchorCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionCancelItem(); },
                hasHotState: true
            });

            me.anchorApprove = new ui.ctl.buttons.Sizeable({
                id: "AnchorApprove",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionApproveItem(); },
                hasHotState: true
            });

            me.anchorEmployeeOK = new ui.ctl.buttons.Sizeable({
                id: "AnchorEmployeeOK",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionEmployeeOKtem(); },
                hasHotState: true
            });

            me.anchorEmployeeCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorEmployeeCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionEmployeeCancelItem(); },
                hasHotState: true
            });

            me.employeeGrid = new ui.ctl.Grid({
                id: "EmployeeGrid",
                allowAdds: false
            });

            me.employeeGrid.addColumn("firstName", "firstName", "First Name", "First Name", 200);
            me.employeeGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 200);
            me.employeeGrid.addColumn("brief", "brief", "Brief", "Brief", null);
            me.employeeGrid.addColumn("houseCode", "houseCode", "House Code", "House Code", 100);
            me.employeeGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee #", 100);
            me.employeeGrid.addColumn("ssn", "ssn", "SSN", "SSN", 100);
            me.employeeGrid.capColumns();

            me.totalWageTypeGrid = new ui.ctl.Grid({
                id: "TotalWageTypeGrid"
            });

            me.totalWageTypeGrid.addColumn("title", "title", "Wage Type", "Wage Type", null, function(title) { return title; });
            me.totalWageTypeGrid.addColumn("hours", "hours", "Hours", "Hours", 200, function(hours) { return ui.cmn.text.money.format(hours); });
            me.totalWageTypeGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 200, function(earnings) { return ui.cmn.text.money.format(earnings); });
            me.totalWageTypeGrid.capColumns();

            me.anchorClose = new ui.ctl.buttons.Sizeable({
                id: "AnchorClose",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionCloseItem(); },
                hasHotState: true
            });
        },

        configureCommunications: function() {
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.pay.payCheck.HirNode,
                itemConstructorArgs: fin.pay.payCheck.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.pay.payCheck.HouseCode,
                itemConstructorArgs: fin.pay.payCheck.houseCodeArgs,
                injectionArray: me.houseCodes
            });

            me.stateTypes = [];
            me.stateTypeStore = me.cache.register({
                storeId: "stateTypes",
                itemConstructor: fin.pay.payCheck.StateType,
                itemConstructorArgs: fin.pay.payCheck.stateTypeArgs,
                injectionArray: me.stateTypes
            });

			me.sites = [];
            me.siteStore = me.cache.register({
                storeId: "sites",
                itemConstructor: fin.pay.payCheck.Site,
                itemConstructorArgs: fin.pay.payCheck.siteArgs,
                injectionArray: me.sites
            });

			me.persons = [];
            me.personStore = me.cache.register({
                storeId: "persons",
                itemConstructor: fin.pay.payCheck.Person,
                itemConstructorArgs: fin.pay.payCheck.personArgs,
                injectionArray: me.persons
            });

            me.employees = [];
            me.employeeStore = me.cache.register({
                storeId: "employeeSearchs",
                itemConstructor: fin.pay.payCheck.EmployeeSearch,
                itemConstructorArgs: fin.pay.payCheck.employeeSearchArgs,
                injectionArray: me.employees
            });

            me.wageTypes = [];
            me.wageTypeStore = me.cache.register({
                storeId: "wageTypes",
                itemConstructor: fin.pay.payCheck.WageType,
                itemConstructorArgs: fin.pay.payCheck.wageTypeArgs,
                injectionArray: me.wageTypes
            });

            me.payCheckRequests = [];
            me.payCheckRequestStore = me.cache.register({
                storeId: "payCheckRequests",
                itemConstructor: fin.pay.payCheck.PayCheckRequest,
                itemConstructorArgs: fin.pay.payCheck.payCheckRequestArgs,
                injectionArray: me.payCheckRequests
            });

            me.wageTypeDetails = [];
            me.wageTypeDetailStore = me.cache.register({
                storeId: "payCheckRequestWageTypes",
                itemConstructor: fin.pay.payCheck.WageTypeDetail,
                itemConstructorArgs: fin.pay.payCheck.wageTypeDetailArgs,
                injectionArray: me.wageTypeDetails,
                lookupSpec: { wageType: me.wageTypes }
            });

            me.fileNames = [];
            me.fileNameStore = me.cache.register({
                storeId: "payFileNames",
                itemConstructor: fin.pay.payCheck.FileName,
                itemConstructorArgs: fin.pay.payCheck.fileNameArgs,
                injectionArray: me.fileNames
            });
        },

        setStatus: function(status) {

            fin.cmn.status.setStatus(status);
        },

        dirtyCheck: function(me) {

            return !fin.cmn.status.itemValid();
        },

        modified: function() {
            var args = ii.args(arguments, {
                modified: { type: Boolean, required: false, defaultValue: true }
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

        initialize: function() {
            var me = this;

            $("input[type=radio]").click(function () {
                switch (this.id) {

					case "PaymentMethodElectronic":
                        $("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
                        $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
                        $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						$("#houseCodeTemplateText").val("");
                        $("#UPSDeliveryToUnitNo")[0].checked = true;
						$("#SaturdayDeliveryUnitNo")[0].checked = true;
						$("#UPSDeliveryToHomeNo")[0].checked = true;
						$("#SaturdayDeliveryHomeNo")[0].checked = true;
						me.unitAddress.resetValidation(true);
                        me.homeAddress.resetValidation(true);
						me.unitAddress.setValue("");
						me.upsPackageAttentionTo.setValue("");
                        me.homeAddress.setValue("");
						$("#houseCodeTemplateText")[0].readOnly = true;
						$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
 						me.unitAddress.text.readOnly = true;
            			me.upsPackageAttentionTo.text.readOnly = true;
            			me.homeAddress.text.readOnly = true;
						$("#UPSDeliveryToUnitYes")[0].disabled = true;
			            $("#UPSDeliveryToUnitNo")[0].disabled = true;
			            $("#SaturdayDeliveryUnitYes")[0].disabled = true;
			            $("#SaturdayDeliveryUnitNo")[0].disabled = true;
			            $("#UPSDeliveryToHomeYes")[0].disabled = true;
			            $("#UPSDeliveryToHomeNo")[0].disabled = true;
			            $("#SaturdayDeliveryHomeYes")[0].disabled = true;
			            $("#SaturdayDeliveryHomeNo")[0].disabled = true;
                        break;

					case "PaymentMethodPaper":
                        $("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
                        $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
                        $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
						$("#houseCodeTemplateText").val("");
                        $("#UPSDeliveryToUnitNo")[0].checked = true;
						$("#SaturdayDeliveryUnitNo")[0].checked = true;
						$("#UPSDeliveryToHomeNo")[0].checked = true;
						$("#SaturdayDeliveryHomeNo")[0].checked = true;
						me.unitAddress.resetValidation(true);
                        me.homeAddress.resetValidation(true);
						me.unitAddress.setValue("");
						me.upsPackageAttentionTo.setValue("");
                        me.homeAddress.setValue("");
						$("#houseCodeTemplateText")[0].readOnly = false;
						$("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDown");
 						me.unitAddress.text.readOnly = false;
            			me.upsPackageAttentionTo.text.readOnly = false;
            			me.homeAddress.text.readOnly = false;
						$("#UPSDeliveryToUnitYes")[0].disabled = false;
			            $("#UPSDeliveryToUnitNo")[0].disabled = false;
			            $("#SaturdayDeliveryUnitYes")[0].disabled = false;
			            $("#SaturdayDeliveryUnitNo")[0].disabled = false;
			            $("#UPSDeliveryToHomeYes")[0].disabled = false;
			            $("#UPSDeliveryToHomeNo")[0].disabled = false;
			            $("#SaturdayDeliveryHomeYes")[0].disabled = false;
			            $("#SaturdayDeliveryHomeNo")[0].disabled = false;
                        break;

                    case "UPSDeliveryToUnitYes":
                        $("#LabelUnit").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code):");
                        $("#LabelUnitAddress").html("<span class='requiredFieldIndicator'>&#149;</span>Unit (House Code) Address:");
                        $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
                        if ($("#houseCodeTemplateText").html() !== "" && $("#houseCodeTemplateText").html() === me.houseCodeSearchTemplate.houseCodeTitleTemplate)
                            me.setUnitAddress();
                        $("#UPSDeliveryToHomeNo")[0].checked = true;
                        me.homeAddress.resetValidation(true);
                        me.homeAddress.setValue("");
                        break;

                    case "UPSDeliveryToUnitNo":
                        $("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
                        $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
                        me.unitAddress.resetValidation(true);
                        me.unitAddress.setValue("");
                        $("#houseCodeTemplateText").val("");
                        break;

                    case "UPSDeliveryToHomeYes":
                        $("#LabelHome").html("<span class='requiredFieldIndicator'>&#149;</span>Home Address:");
                        $("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
                        $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
                        me.setEmployeeAddress();
                        $("#UPSDeliveryToUnitNo")[0].checked = true;
                        me.unitAddress.resetValidation(true);
                        me.unitAddress.setValue("");
                        break;

                    case "UPSDeliveryToHomeNo":
                        $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
                        me.homeAddress.resetValidation(true);
                        me.homeAddress.setValue("");
                        break;

                    case "TermRequestYes":
                        $("#LabelState").html("<span class='requiredFieldIndicator'>&#149;</span>State:");
                        $("#LabelTerminationDate").html("<span class='requiredFieldIndicator'>&#149;</span>Termination Date:");
                        break;

                    case "TermRequestNo":
                        $("#LabelState").html("<span id='nonRequiredFieldIndicator'>State:</span>");
                        $("#LabelTerminationDate").html("<span id='nonRequiredFieldIndicator'>Termination Date:</span>");
                        me.state.resetValidation(true);
                        me.state.setValue("");
                        me.terminationDate.resetValidation(true);
                        if (me.terminationDate.lastBlurValue === undefined || me.terminationDate.lastBlurValue === "" || !(ui.cmn.text.validate.generic(me.terminationDate.lastBlurValue, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
                            me.terminationDate.setValue("");
                        break;
                }
            });

            $("input[type='radio']").change(function() { me.modified(); });
            $("#EmployeeNumberText").bind("change", function() { me.searchEmployeeByNumber(); });
            $("#ChargeToHouseCodeText").bind("blur keyup", me, me.chargeToHouseCodeChange);
            $("#EmployeeNameText").bind("change", function() { me.searchEmployeeByName(); });
            $("#FilterTypeText").bind("keydown", me, me.actionSearchItem);
            $("#SearchInputText").bind("keydown", me, me.actionSearchItem);
            $("#SearchRequestedDateText").bind("keydown", me, me.actionSearchItem);
            $("#StatusTypesText").bind("keydown", me, me.actionSearchItem);
            $("#ViewWageTypeTotal").bind("click", function() { me.actionWageTypeTotalItem(); });
            $("#CheckRequestNumberInfo").hide();
            $("#EmptyArea").show();
            $("#SearchRequestedDate").hide();
            $("#AnchorResendRequest").hide();
            $("#AnchorApprove").hide();
            me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
        },

        setTabIndexes: function() {
            var me = this;

            $("#houseCodeText")[0].tabIndex = 1;
            me.requestedDate.text.tabIndex = 2;
            me.deliveryDate.text.tabIndex = 3;
            me.employeeNumber.text.tabIndex = 4;
            me.employeeName.text.tabIndex = 5;
            me.reasonForRequest.text.tabIndex = 6;
            $("#TermRequestYes")[0].tabIndex = 7;
            $("#TermRequestNo")[0].tabIndex = 8;
            me.state.text.tabIndex = 9;
            me.terminationDate.text.tabIndex = 10;
            $("#MealBreakComplianceYes")[0].tabIndex = 11;
            $("#MealBreakComplianceNo")[0].tabIndex = 12;
			$("#PaymentMethodElectronic")[0].tabIndex = 13;
            $("#PaymentMethodPaper")[0].tabIndex = 14;
            $("#UPSDeliveryToUnitYes")[0].tabIndex = 15;
            $("#UPSDeliveryToUnitNo")[0].tabIndex = 16;
            $("#SaturdayDeliveryUnitYes")[0].tabIndex = 17;
            $("#SaturdayDeliveryUnitNo")[0].tabIndex = 18;
            $("#houseCodeTemplateText")[0].tabIndex = 19;
            me.unitAddress.text.tabIndex = 20;
            me.upsPackageAttentionTo.text.tabIndex = 21;
            $("#UPSDeliveryToHomeYes")[0].tabIndex = 22;
            $("#UPSDeliveryToHomeNo")[0].tabIndex = 23;
            $("#SaturdayDeliveryHomeYes")[0].tabIndex = 24;
            $("#SaturdayDeliveryHomeNo")[0].tabIndex = 25;
            me.homeAddress.text.tabIndex = 26;
            me.requestorName.text.tabIndex = 27;
            me.requestorEmail.text.tabIndex = 28;
            me.requestorPhone.text.tabIndex = 29;
            me.managerName.text.tabIndex = 30;
            me.managerEmail.text.tabIndex = 31;
        },

        resizeControls: function() {
            var me = this;

            me.requestedDate.resizeText();
            me.deliveryDate.resizeText();
            me.employeeNumber.resizeText();
            me.employeeName.resizeText();
            me.reasonForRequest.resizeText();
            me.terminationDate.resizeText();
            me.unitAddress.resizeText();
            me.upsPackageAttentionTo.resizeText();
            me.homeAddress.resizeText();
            me.state.resizeText();
            me.requestorName.resizeText();
            me.requestorEmail.resizeText();
            me.requestorPhone.resizeText();
            me.managerName.resizeText();
            me.managerEmail.resizeText();
            me.employeeGrid.resize();
        },

        resetControls: function(status) {
            var me = this;

			$("#houseCodeText").val("");
            $("#houseCodeTemplateText").val("");
            $("#CheckRequestNumber").html("");
            $("#TermRequestNo")[0].checked = true;
            $("#MealBreakComplianceYes")[0].checked = false;
            $("#MealBreakComplianceNo")[0].checked = false;
			$("#PaymentMethodElectronic")[0].checked = true;
            $("#UPSDeliveryToUnitNo")[0].checked = true;
            $("#SaturdayDeliveryUnitNo")[0].checked = true;
            $("#UPSDeliveryToHomeNo")[0].checked = true;
            $("#SaturdayDeliveryHomeNo")[0].checked = true;
            $("#TotalHours").html("");
            $("#TotalEarnings").html("");
			$("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
            $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
            $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
			$("#houseCodeTemplateText")[0].readOnly = true;
			$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
			$("#UPSDeliveryToUnitYes")[0].disabled = true;
            $("#UPSDeliveryToUnitNo")[0].disabled = true;
            $("#SaturdayDeliveryUnitYes")[0].disabled = true;
            $("#SaturdayDeliveryUnitNo")[0].disabled = true;
            $("#UPSDeliveryToHomeYes")[0].disabled = true;
            $("#UPSDeliveryToHomeNo")[0].disabled = true;
            $("#SaturdayDeliveryHomeYes")[0].disabled = true;
            $("#SaturdayDeliveryHomeNo")[0].disabled = true;

            me.status = status;
            me.requestedDate.resetValidation(true);
            me.deliveryDate.resetValidation(true);
            me.employeeNumber.resetValidation(true);
            me.employeeName.resetValidation(true);
            me.reasonForRequest.resetValidation(true);
            me.state.resetValidation(true);
            me.terminationDate.resetValidation(true);
            me.unitAddress.resetValidation(true);
            me.homeAddress.resetValidation(true);
            me.requestorEmail.resetValidation(true);
            me.requestorPhone.resetValidation(true);
            me.managerName.resetValidation(true);
            me.managerEmail.resetValidation(true);
            me.state.updateStatus();

            me.deliveryDate.setValue("");
            me.employeeNumber.setValue("");
            me.employeeName.setValue("");
            me.reasonForRequest.setValue("");
            me.state.reset();
            me.terminationDate.setValue("");
            me.unitAddress.setValue("");
            me.upsPackageAttentionTo.setValue("");
            me.homeAddress.setValue("");
            me.requestorName.setValue("");
            me.requestorEmail.setValue("");
            me.requestorPhone.setValue("");
            me.managerName.setValue("");
            me.managerEmail.setValue("");
			me.wageTypeDetailGrid.body.deselectAll();
            me.wageTypeDetailGrid.setData([]);
			me.wageTypeDetailReadOnlyGrid.setData([]);

			me.unitAddress.text.readOnly = true;
			me.upsPackageAttentionTo.text.readOnly = true;
			me.homeAddress.text.readOnly = true;

            if (me.status === "CheckRequest") {
                me.setUserInfo();
                me.resizeControls();
            }
        },

        resetGrid: function() {
            var me = this;
            var index = me.payCheckRequestGrid.activeRowIndex;

            if (me.statuses[me.statusType.indexSelected].id === 0) {
                if (me.status === "CheckRequestResend")
                    me.payCheckRequests[index].statusType = 2;
                else if (me.status === "CheckRequestApprove")
                    me.payCheckRequests[index].statusType = 8;
                else
                    me.payCheckRequests[index].statusType = 6;
                me.payCheckRequestGrid.body.renderRow(index, index);
                me.payCheckRequestGrid.body.deselect(index, true);
            }
            else {
                me.payCheckRequests.splice(index, 1);
                me.payCheckRequestGrid.setData(me.payCheckRequests);
            }
            me.resetControls("");
            me.setReadOnly(true);
        },

        setReadOnly: function(readOnly) {
            var me = this;

            $("#houseCodeText")[0].readOnly = readOnly;
            $("#houseCodeTemplateText")[0].readOnly = readOnly;
            me.requestedDate.text.readOnly = readOnly;
            me.deliveryDate.text.readOnly = readOnly;
            me.employeeNumber.text.readOnly = readOnly;
            me.employeeName.text.readOnly = readOnly;
            me.reasonForRequest.text.readOnly = readOnly;
            me.state.text.readOnly = readOnly;
            me.terminationDate.text.readOnly = readOnly;
            me.unitAddress.text.readOnly = readOnly;
            me.upsPackageAttentionTo.text.readOnly = readOnly;
            me.homeAddress.text.readOnly = readOnly;
            me.managerName.text.readOnly = readOnly;
            me.managerEmail.text.readOnly = readOnly;
            me.requestorEmail.text.readOnly = readOnly;
            me.requestorPhone.text.readOnly = readOnly;

            $("#TermRequestYes")[0].disabled = readOnly;
            $("#TermRequestNo")[0].disabled = readOnly;
            $("#MealBreakComplianceYes")[0].disabled = readOnly;
            $("#MealBreakComplianceNo")[0].disabled = readOnly;
			$("#PaymentMethodElectronic")[0].disabled = readOnly;
			$("#PaymentMethodPaper")[0].disabled = readOnly;
            $("#UPSDeliveryToUnitYes")[0].disabled = readOnly;
            $("#UPSDeliveryToUnitNo")[0].disabled = readOnly;
            $("#SaturdayDeliveryUnitYes")[0].disabled = readOnly;
            $("#SaturdayDeliveryUnitNo")[0].disabled = readOnly;
            $("#UPSDeliveryToHomeYes")[0].disabled = readOnly;
            $("#UPSDeliveryToHomeNo")[0].disabled = readOnly;
            $("#SaturdayDeliveryHomeYes")[0].disabled = readOnly;
            $("#SaturdayDeliveryHomeNo")[0].disabled = readOnly;

            if (readOnly) {
                $("#RequestedDateAction").removeClass("iiInputAction");
                $("#DeliveryDateAction").removeClass("iiInputAction");
                $("#StateAction").removeClass("iiInputAction");
                $("#TerminationDateAction").removeClass("iiInputAction");
                $("#houseCodeTextDropImage").removeClass("HouseCodeDropDown");
                $("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
            }
            else {
                $("#RequestedDateAction").addClass("iiInputAction");
                $("#DeliveryDateAction").addClass("iiInputAction");
                $("#StateAction").addClass("iiInputAction");
                $("#TerminationDateAction").addClass("iiInputAction");
                $("#houseCodeTextDropImage").addClass("HouseCodeDropDown");
                $("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDown");
            }
        },

        currentDate: function() {
            var currentTime = new Date();
            var month = currentTime.getMonth() + 1;
            var day = currentTime.getDate();
            var year = currentTime.getFullYear();

            return month + "/" + day + "/" + year;
        },

        modifySearch: function() {
            var me = this;

            me.searchInput.setValue("");

            if (me.filterType.indexSelected === 3) {
                $("#SearchInput").hide();
                $("#SearchRequestedDate").show();
            }
            else {
                $("#SearchInput").show();
                $("#SearchRequestedDate").hide();
            }
        },

        filterTypesLoaded: function() {
            var me = this;

            me.filterTypes = [];
            me.filterTypes.push(new fin.pay.payCheck.FilterType(1, "House Code"));
            me.filterTypes.push(new fin.pay.payCheck.FilterType(2, "Employee Number"));
            me.filterTypes.push(new fin.pay.payCheck.FilterType(3, "Requestor Name"));
            me.filterTypes.push(new fin.pay.payCheck.FilterType(4, "Requested Date"));
            me.filterTypes.push(new fin.pay.payCheck.FilterType(5, "Check Request Number"));

            me.filterType.setData(me.filterTypes);
            me.filterType.select(0, me.filterType.focused);
        },

        statusesLoaded: function() {
            var me = this;

            me.statuses = [];
            me.statuses.push(new fin.pay.payCheck.Status(0, "[All]"));
            me.statuses.push(new fin.pay.payCheck.Status(2, "In Process"));
            me.statuses.push(new fin.pay.payCheck.Status(8, "Approved"));
            me.statuses.push(new fin.pay.payCheck.Status(9, "Completed"));
            me.statuses.push(new fin.pay.payCheck.Status(6, "Cancelled"));
            me.statuses.push(new fin.pay.payCheck.Status(10, "Unapproved"));

            me.statusType.setData(me.statuses);
            me.statusType.select(0, me.statusType.focused);
        },

        stateTypesLoaded: function(me, activeId) {

            me.state.setData(me.stateTypes);
            me.checkLoadCount();
        },

        wageTypesLoaded: function(me, activeId) {

            me.wageType.setData(me.wageTypes);
            me.wageTypeDetailGrid.setData(me.wageTypeDetails);
            me.wageTypeDetailGrid.setHeight(150);
            me.requestedDate.setValue(me.currentDate());
            me.modified(false);
            me.checkLoadCount();
        },

        houseCodesLoaded: function(me, activeId) {

            if (parent.fin.appUI.houseCodeId === 0) {
                if (me.houseCodes.length <= 0) {
                    return me.houseCodeSearchError();
                }

                me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
            }

            me.houseCodeGlobalParametersUpdate(false);
            me.checkLoadCount();
        },

        houseCodeTemplateChanged: function() {
            var me = this;

            me.modified();
            me.siteStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",type:invoice", me.sitesLoaded, me);
        },

        sitesLoaded: function(me, activeId) {

            if (me.sites.length === 0)
                alert("Either Site information not found or Site is not associated to the House Code [" + me.houseCodeSearchTemplate.houseCodeTitleTemplate + "]. Please verify and try again!")
            else
                me.setUnitAddress();
        },

        setUnitAddress: function() {
            var me = this;

            if (me.sites.length > 0) {
                var address = me.sites[0].addressLine1 + ", ";
                address += (me.sites[0].addressLine2 === "" ? "" : me.sites[0].addressLine2 + ", ");
                address += me.sites[0].city + ", ";
                address += (me.sites[0].county === "" ? "" : me.sites[0].county + ", ");
                var index = ii.ajax.util.findIndexById(me.sites[0].state.toString(), me.stateTypes);
                if (index !== null)
                    address += me.stateTypes[index].name + ", ";
                address += me.sites[0].postalCode;
                me.unitAddress.setValue(address);
            }
        },

        houseCodeChanged: function() {
            var me = this;

            if (me.employees != undefined) {
                if (me.employees.length === 1 && me.employees[0].houseCode !== parent.fin.appUI.houseCodeBrief) {
                    me.employeeNumber.setValue("");
                    me.employeeName.setValue("");
                }
                else if (me.employees.length > 1) {
                    if (me.employeeGrid.activeRowIndex >= 0 && me.employees[me.employeeGrid.activeRowIndex].houseCode !== parent.fin.appUI.houseCodeBrief) {
                        me.employeeNumber.setValue("");
                        me.employeeName.setValue("");
                    }
                }
            }
        },

        searchEmployeeByNumber: function() {
            var me = this;
            me.searchBy = "employeeNumber";

            if (me.employeeNumber.validate(true) && me.employeeNumber.getValue().length > 3) {
                if (me.status === "CheckRequest" || me.status === "CheckRequestStatus") {
                    $("#EmployeeNumberText").addClass("Loading");
                    me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeNumber.getValue()
						+ ",hcmHouseCodeId:" + ($("#houseCodeText").val() !== "" ? parent.fin.appUI.houseCodeId : 0)
						+ ",employeeType:SearchFull"
						+ ",filterType:Employee Number"
						, me.employeesLoaded, me);
                }
            }
            else {
                if (me.employeeNumber.validate(true)) {
                    alert("There is no Employee with Employee # [" + me.employeeNumber.getValue() + "].");
                    me.employeeNumber.setValue("");
                }
            }
        },

        searchEmployeeByName: function() {
            var me = this;
            me.searchBy = "employeeName";

            if (me.employeeName.getValue().length > 3) {
                if (me.status === "CheckRequest" || me.status === "CheckRequestStatus") {
                    $("#EmployeeNameText").addClass("Loading");
                    me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeName.getValue()
						+ ",hcmHouseCodeId:" + ($("#houseCodeText").val() != "" ? parent.fin.appUI.houseCodeId : 0)
						+ ",employeeType:SearchFull"
						+ ",filterType:Name"
						, me.employeesLoaded, me);
                }
            }
            else {
                if (me.employeeName.validate(true)) {
                    alert("There is no Employee with Employee Name [" + me.employeeName.getValue() + "].");
                    me.employeeName.setValue("");
                }
            }
        },

        employeesLoaded: function(me, activeId) {
            $("#EmployeeNumberText").removeClass("Loading");
            $("#EmployeeNameText").removeClass("Loading");
            if (me.employees.length > 1) {
                me.employeeGrid.setData(me.employees);
                me.loadPopup("EmployeePopup");
                me.employeeGrid.setHeight($(window).height() - 180);
            }
            else if (me.employees.length === 1) {
                me.employeeNumber.setValue(me.employees[0].employeeNumber);
                me.employeeName.setValue(me.employees[0].firstName + " " + me.employees[0].lastName);
                if (me.personId !== me.employees[0].id) {
                    me.personId = me.employees[0].id;
                    me.personStore.fetch("userId:[user],id:" + me.employees[0].id, me.personsLoaded, me);
                    if (me.employees[0].houseCode !== parent.fin.appUI.houseCodeBrief || $("#houseCodeText").val() === "")
                        me.houseCodeFetch(me.employees[0].houseCode);
                }
                else
                    me.personsLoaded(me, 0);
            }
            else {
                if (me.searchBy === "employeeNumber")
                    alert("There is no Employee with Employee # [" + me.employeeNumber.getValue() + "].");
                if (me.searchBy === "employeeName")
                    alert("There is no Employee with Employee Name [" + me.employeeName.getValue() + "].");

                me.employeeNumber.setValue("");
                me.employeeName.setValue("");
            }

            me.searchBy = "";
        },

        personsLoaded: function(me, activeId) {
            var index = 0;

            if (me.persons.length > 0) {
                if (me.pageLoading) {
                    me.pageLoading = false;
                    me.users = me.persons.slice();
                    me.setUserInfo();
                    me.requestorName.text.readOnly = true;
                }
                else
                    me.setEmployeeAddress();
            }
        },

        setEmployeeAddress: function() {
            var me = this;

			if ($("#UPSDeliveryToHomeYes")[0].checked) {
				if (me.employeeNumber.getValue() !== "" && me.employeeNumber.valid) {
					var address = me.persons[0].addressLine1 + ", ";
					address += (me.persons[0].addressLine2 === "" ? "" : me.persons[0].addressLine2 + ", ");
					address += me.persons[0].city + ", ";
					var index = ii.ajax.util.findIndexById(me.persons[0].state.toString(), me.stateTypes);
					if (index !== null) 
						address += me.stateTypes[index].name + ", ";
					address += me.persons[0].postalCode;
					me.homeAddress.setValue(address);
				}
			}
        },

        setUserInfo: function() {
            var me = this;

            me.houseCodeSearchTemplate.houseCodeIdTemplate = 0;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = "";
            me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName);
            me.requestorEmail.setValue(me.users[0].email);
            me.requestorPhone.setValue(me.users[0].homePhone);
            $("#houseCodeText").val(parent.fin.appUI.houseCodeTitle);
            $("#houseCodeTemplateText").val("");
        },

        actionPayCheckRequest: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            $("#CheckRequestNumberInfo").hide();
            $("#EmptyArea").show();
            $("#WageTypeDetailGrid").show();
            $("#SearchContainer").hide();
            $("#WageTypeDetailReadOnlyGrid").hide();
            me.setReadOnly(false);
            me.resetControls("CheckRequest");
            me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
            me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
            me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
            me.payCheckRequestGrid.body.deselectAll();
            me.wageTypeDetailGrid.setHeight(150);
            me.requestedDate.setValue(me.currentDate());
            $("#AnchorResendRequest").hide();
            $("#AnchorApprove").hide();
            $("#AnchorSendRequest").show();
            $("#LabelState").html("<span id='nonRequiredFieldIndicator'>State:</span>");
            $("#LabelUnit").html("<span id='nonRequiredFieldIndicator'>Unit (House Code):</span>");
            $("#LabelUnitAddress").html("<span id='nonRequiredFieldIndicator'>Unit (House Code) Address:</span>");
            $("#LabelHome").html("<span id='nonRequiredFieldIndicator'>Home Address:</span>");
            $("#pageLoading").height(document.body.scrollHeight);
            me.setStatus("Loaded");
            me.modified(false);
        },

        actionPayCheckRequestStatus: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            $("#WageTypeDetailGrid").hide();
            $("#SearchContainer").show();
            $("#CheckRequestNumberInfo").show();
            $("#EmptyArea").hide();
            $("#WageTypeDetailReadOnlyGrid").show();
            me.setReadOnly(true);
            me.resetControls("CheckRequestStatus");
            me.searchInput.setValue("");
            me.statusType.select(0, me.statusType.focused);
            me.searchInput.resizeText();
            me.statusType.resizeText();
            me.anchorSendRequest.display(ui.cmn.behaviorStates.disabled);
            me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
            me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
            me.payCheckRequestGrid.setData([]);
            me.payCheckRequestGrid.setHeight(200);
            me.wageTypeDetailReadOnlyGrid.setData([]);
            me.wageTypeDetailReadOnlyGrid.setHeight(150);
            $("#AnchorResendRequest").hide();
            $("#AnchorApprove").hide();
            $("#AnchorSendRequest").show();
            $("#pageLoading").height(document.body.scrollHeight);
            me.setStatus("Loaded");
            me.modified(false);
        },

        actionSearchItem: function() {
            var args = ii.args(arguments, {
                event: { type: Object } // The (key) event object
            });
            var event = args.event;
            var me = event.data;

            if (event.keyCode == 13) {
                me.loadSearchResults();
            }
        },

        loadSearchResults: function() {
            var me = this;

            me.setLoadCount();
            me.resetControls("");
            me.payCheckRequestGrid.setData([]);
            me.wageTypeDetailReadOnlyGrid.setData([]);
            me.wageTypeDetailGrid.body.deselectAll();
            me.payCheckRequestStore.reset();
            me.payCheckRequestStore.fetch("userId:[user]"
				+ ",searchValue:" + (me.filterType.indexSelected === 3 ? me.searchRequestedDate.text.value : me.searchInput.getValue())
			 	+ ",filterType:" + me.filterType.text.value
				+ ",statusType:" + (me.statusType.indexSelected === -1 ? 0 : me.statuses[me.statusType.indexSelected].id)
				, me.payCheckRequestsLoaded, me);
        },

        payCheckRequestsLoaded: function(me, activeId) {

            me.payCheckRequestGrid.setData(me.payCheckRequests);
            me.checkLoadCount();
        },

        itemSelect: function() {
            var args = ii.args(arguments, {
                index: { type: Number }
            });
            var me = this;
            var index = args.index;
            var item = me.payCheckRequestGrid.data[index];

            if (item.statusType === 10) {
                me.setReadOnly(false);
                me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
                me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
                me.anchorCancel.display(ui.cmn.behaviorStates.enabled);
                me.resizeControls();
                $("#AnchorResendRequest").show();
                $("#AnchorApprove").hide();
                $("#AnchorSendRequest").hide();
                $("#WageTypeDetailGrid").show();
                $("#WageTypeDetailReadOnlyGrid").hide();
            }
            else {
                if (item.statusType === 2) {
                    me.anchorSendRequest.display(ui.cmn.behaviorStates.enabled);
                    me.anchorCancel.display(ui.cmn.behaviorStates.enabled);
                    $("#AnchorResendRequest").show();
                    $("#AnchorSendRequest").hide();
                    if (me.approveInProcess)
                        $("#AnchorApprove").show();
                }
                else {
                    me.anchorSendRequest.display(ui.cmn.behaviorStates.disabled);
                    me.anchorCancel.display(ui.cmn.behaviorStates.disabled);
                    $("#AnchorResendRequest").hide();
                    $("#AnchorApprove").hide();
                    $("#AnchorSendRequest").show();
                }

                me.setReadOnly(true);
                me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
                $("#WageTypeDetailGrid").hide();
                $("#WageTypeDetailReadOnlyGrid").show();
            }

            $("#houseCodeText").val(item.houseCodeTitle);
            $("#houseCodeTemplateText").val(item.deliveryHouseCodeTitle);
            $("#CheckRequestNumber").html(item.checkRequestNumber);
            me.requestedDate.setValue(item.requestedDate);
            me.deliveryDate.setValue(item.deliveryDate);
            me.employeeNumber.setValue(item.employeeNumber);
            me.employeeName.setValue(item.employeeName);
            me.reasonForRequest.setValue(item.reasonForRequest);

            var itemIndex = ii.ajax.util.findIndexById(item.stateType.toString(), me.stateTypes);
            if (itemIndex !== null)
                me.state.select(itemIndex, me.state.focused);
            else
                me.state.reset();

            $("input[name='TermRequest'][value='" + item.termRequest + "']").attr("checked", "checked").trigger("click");
            $("input[name='MealBreakCompliance'][value='" + item.mealBreakCompliance + "']").attr("checked", "checked");
			$("input[name='PaymentMethod'][value='" + item.paymentMethod + "']").attr("checked", "checked").trigger("click");
            $("input[name='UPSDeliveryToUnit'][value='" + item.upsDeliveryToUnit + "']").attr("checked", "checked").trigger("click");
            $("input[name='SaturdayDeliveryUnit'][value='" + item.saturdayDeliveryUnit + "']").attr("checked", "checked");
            $("input[name='UPSDeliveryToHome'][value='" + item.upsDeliveryToHome + "']").attr("checked", "checked").trigger("click");
            $("input[name='SaturdayDeliveryHome'][value='" + item.saturdayDeliveryHome + "']").attr("checked", "checked");

            me.terminationDate.setValue(item.terminationDate);
			me.houseCodeSearchTemplate.houseCodeIdTemplate = item.deliveryHouseCodeId;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = item.deliveryHouseCodeTitle;
            me.unitAddress.setValue(item.houseCodeAddress);
            me.upsPackageAttentionTo.setValue(item.upsPackageAttentionTo);
            me.homeAddress.setValue(item.homeAddress);
            me.requestorName.setValue(item.requestorName);
            me.requestorEmail.setValue(item.requestorEmail);
            me.requestorPhone.setValue(item.requestorPhone);
            me.managerName.setValue(item.managerName);
            me.managerEmail.setValue(item.managerEmail);

            me.setLoadCount();
            me.wageTypeDetailGrid.body.deselectAll();
            me.wageTypeDetailStore.reset();
            me.wageTypeDetailStore.fetch("userId:[user],payCheckRequest:" + item.id, me.wageTypeDetailsLoaded, me);
            me.status = "CheckRequestStatus";
        },

        wageTypeDetailsLoaded: function(me, activeId) {

            me.wageTypeDetailGrid.setData(me.wageTypeDetails);
            me.wageTypeDetailGrid.setHeight(150);
            me.wageTypeDetailReadOnlyGrid.setData(me.wageTypeDetails);
            me.wageTypeDetailReadOnlyGrid.setHeight(150);
            me.calculateTotal("");
            me.checkLoadCount();
            me.modified(false);
        },

        calculateTotal: function(type) {
            var me = this;
            var totalHours = 0;
            var totalEarnings = 0;

            if (type === "Hours") {
                var hours = me.hours.getValue();

                if (hours !== "" && !(isNaN(hours)))
                    totalHours += parseFloat(hours);

                for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                    if (me.wageTypeDetailGrid.activeRowIndex !== index) {
                        if (me.wageTypeDetailGrid.data[index].hours !== "" && !(isNaN(me.wageTypeDetailGrid.data[index].hours)))
                            totalHours += parseFloat(me.wageTypeDetailGrid.data[index].hours);
                    }
                }

                $("#TotalHours").html(totalHours.toFixed(2));
            }
            else if (type === "Earnings") {
                var earnings = me.earnings.getValue();

                if (earnings !== "" && !(isNaN(earnings)))
                    totalEarnings += parseFloat(earnings);

                for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                    if (me.wageTypeDetailGrid.activeRowIndex !== index) {
                        if (me.wageTypeDetailGrid.data[index].earnings !== "" && !(isNaN(me.wageTypeDetailGrid.data[index].earnings)))
                            totalEarnings += parseFloat(me.wageTypeDetailGrid.data[index].earnings);
                    }
                }

                $("#TotalEarnings").html(totalEarnings.toFixed(2));
            }
            else {
                for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                    totalHours += parseFloat(me.wageTypeDetailGrid.data[index].hours);
                    totalEarnings += parseFloat(me.wageTypeDetailGrid.data[index].earnings);
                }

                $("#TotalHours").html(totalHours.toFixed(2));
                $("#TotalEarnings").html(totalEarnings.toFixed(2));
            }
        },

        chargeToHouseCodeChange: function() {
            var args = ii.args(arguments, {
                event: { type: Object } // The (key) event object
            });
            var event = args.event;
            var me = event.data;
            var houseCode = me.chargeToHouseCode.getValue().replace(/[^0-9]/g, "");

            if (event.type === "blur" || event.keyCode === 13 || event.keyCode === 9) {
                me.chargeToHouseCode.setValue(houseCode);
                if (houseCode !== "") {
                    me.validChargeToHouseCode = false;
                    me.chargeToHouseCodeCheck(houseCode);
                }
                else {
                    me.validChargeToHouseCode = true;
                    if (me.wageTypeDetailGrid.data[me.wageTypeDetailGrid.activeRowIndex] !== undefined)
                        me.wageTypeDetailGrid.data[me.wageTypeDetailGrid.activeRowIndex].houseCodeId = 0;
                }
            }
        },

        chargeToHouseCodeCheck: function(houseCode) {
            var me = this;

            if (me.chargeToHouseCodeCache[houseCode] !== undefined) {
                if (me.chargeToHouseCodeCache[houseCode].loaded)
                    me.chargeToHouseCodeValidate(houseCode);
            }
            else
                me.chargeToHouseCodeLoad(houseCode);
        },

        chargeToHouseCodeLoad: function(houseCode) {
            var me = this;

            me.chargeToHouseCodeCache[houseCode] = {};
            me.chargeToHouseCodeCache[houseCode].valid = false;
            me.chargeToHouseCodeCache[houseCode].loaded = false;

            $("#ChargeToHouseCodeText").addClass("Loading");

            $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/hcm/act/provider.aspx",
                data: "moduleId=hcm&requestId=1&targetId=iiCache"
					+ "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],appUnitBrief:" + houseCode + ",<criteria>",

                success: function(xml) {
                    me.chargeToHouseCodeCache[houseCode].loaded = true;

                    if ($(xml).find("item").length) {
                        //the house code is valid
                        $(xml).find("item").each(function() {
                            me.chargeToHouseCodeCache[houseCode].valid = true;
                            me.chargeToHouseCodeCache[houseCode].id = parseInt($(this).attr("id"), 10);
                            me.chargeToHouseCodeCache[houseCode].chargeToHouseCode = $(this).attr("name");
                            me.chargeToHouseCodeValidate(houseCode);
                            $("#ChargeToHouseCodeText").removeClass("Loading");
                        });
                    }
                    else {
                        //the house code is invalid
                        me.chargeToHouseCodeValidate(houseCode);
                    }
                }
            });
        },

        chargeToHouseCodeValidate: function(houseCode) {
            var me = this;

            $("#ChargeToHouseCodeText").removeClass("Loading");

            if (!me.chargeToHouseCodeCache[houseCode].valid) {
                me.chargeToHouseCode.setInvalid("The House Code [" + houseCode + "] is not valid.");
                if (me.wageTypeDetailGrid.data[me.wageTypeDetailGrid.activeRowIndex] !== undefined) {
                    me.wageTypeDetailGrid.data[me.wageTypeDetailGrid.activeRowIndex].houseCodeId = 0;
                    me.wageTypeDetailGrid.data[me.wageTypeDetailGrid.activeRowIndex].houseCodeTitle = houseCode;
                }
            }
            else {
                var index = me.wageTypeDetailGrid.activeRowIndex;
                me.validChargeToHouseCode = true;
                me.chargeToHouseCode.setValue(me.chargeToHouseCodeCache[houseCode].chargeToHouseCode);
                me.wageTypeDetailGrid.body.deselect(index);
                if (me.wageTypeDetailGrid.data[index] !== undefined) {
                    me.wageTypeDetailGrid.data[index].houseCodeId = me.chargeToHouseCodeCache[houseCode].id;
                    me.wageTypeDetailGrid.data[index].houseCodeTitle = me.chargeToHouseCodeCache[houseCode].chargeToHouseCode;
                    me.wageTypeDetailGrid.body.select(index + 1);
                }
            }
        },

        actionNewItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            me.actionPayCheckRequest();
        },

        actionUndoItem: function() {
            var me = this;

            if (!parent.fin.cmn.status.itemValid())
                return;

            if (me.status === "CheckRequest") {
                me.resetControls("CheckRequest");
                me.setStatus("Loaded");
            }
            else if (me.status === "CheckRequestStatus")
                me.itemSelect(me.payCheckRequestGrid.activeRowIndex);
        },

        actionCancelItem: function() {
            var me = this;

            $("#messageToUser").text("Cancelling Request");
            me.status = "CheckRequestCancel";
            me.actionSaveItem();
        },

        actionApproveItem: function() {
            var me = this;

            $("#messageToUser").text("Approving Request");
            me.status = "CheckRequestApprove";
            me.actionSaveItem();
        },

        actionResendRequestItem: function() {
            var me = this;

            if (me.payCheckRequestGrid.activeRowIndex === -1) {
                alert("Please select Payroll Check Requst");
                return false;
            }

            $("#messageToUser").text("Resending Request");
            me.status = "CheckRequestResend";
            me.actionSaveItem();
        },

        actionSendRequestItem: function() {
            var me = this;

            $("#messageToUser").text("Sending Request");
            me.actionSaveItem();
        },

        actionEmployeeOKtem: function() {
            var me = this;

            if (me.employeeGrid.activeRowIndex >= 0) {
                me.employeeNumber.setValue(me.employees[me.employeeGrid.activeRowIndex].employeeNumber);
                me.employeeName.setValue(me.employees[me.employeeGrid.activeRowIndex].firstName + " " + me.employees[me.employeeGrid.activeRowIndex].lastName);

                if ($("#houseCodeText").val() === "" || parent.fin.appUI.houseCodeId === 0) {
                    me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + me.employees[me.employeeGrid.activeRowIndex].houseCode + ",", me.employeeHouseCodesLoaded, me);
                }

                if (me.personId !== me.employees[me.employeeGrid.activeRowIndex].id) {
                    me.personId = me.employees[me.employeeGrid.activeRowIndex].id;
                    me.personStore.fetch("userId:[user],id:" + me.employees[me.employeeGrid.activeRowIndex].id, me.personsLoaded, me);
                }
                else
                    me.personsLoaded(me, 0);
            }
            else {
                me.employeeNumber.setValue("");
                me.employeeName.setValue("");
            }

            me.hidePopup("EmployeePopup");
            $("#pageLoading").fadeOut("slow");
        },

        employeeHouseCodesLoaded: function(me, activeId) {
            if (me.houseCodes.length > 0) {
                $("#houseCodeText").val(me.houseCodes[0].name);
                parent.fin.appUI.houseCodeId = me.houseCodes[0].id;
                parent.fin.appUI.houseCodeBrief = me.houseCodes[0].brief;
                parent.fin.appUI.hirNode = me.houseCodes[0].hirNode;
                parent.fin.appUI.houseCodeTitle = me.houseCodes[0].name;
            }
        },

        actionEmployeeCancelItem: function() {
            var me = this;

            me.employeeNumber.setValue("");
            me.employeeName.setValue("");
            me.hidePopup("EmployeePopup");
            $("#pageLoading").fadeOut("slow");
        },

        fileNamesLoaded: function(me, activeId) {

            if (parent.fin.appUI.modified)
                me.setStatus("Edit");
            else
                me.setStatus("Normal");
            $("#pageLoading").fadeOut("slow");

            if (me.fileNames.length === 1) {
                $("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
                $("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
            }
        },

        actionWageTypeTotalItem: function() {
            var me = this;
            var item = [];
            var wageTypeTotalsTemp = [];
            var wageTypeTotals = [];
            var wageTypeId = 0;
            var totalHours = 0;
            var totalEarnings = 0;
            var wageTypeTotalHours = 0;
            var wageTypeTotalEarnings = 0;

            for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                var item = new fin.pay.payCheck.WageTypeTotal(me.wageTypeDetailGrid.data[index].wageType.id
															, me.wageTypeDetailGrid.data[index].wageType.brief + " - " + me.wageTypeDetailGrid.data[index].wageType.title
															, (me.wageTypeDetailGrid.data[index].hours === "" ? 0.00 : parseFloat(me.wageTypeDetailGrid.data[index].hours))
															, (me.wageTypeDetailGrid.data[index].earnings === "" ? 0.00 : parseFloat(me.wageTypeDetailGrid.data[index].earnings))
															)
                wageTypeTotalsTemp.push(item);
            }

            wageTypeTotalsTemp.sort(me.customSort);

            for (var index = 0; index < wageTypeTotalsTemp.length; index++) {
                if (wageTypeId !== wageTypeTotalsTemp[index].id) {
                    if (wageTypeId !== 0) {
                        item = new fin.pay.payCheck.WageTypeTotal(wageTypeId, wageTypeTotalsTemp[index - 1].title, totalHours, totalEarnings);
                        wageTypeTotals.push(item);
                    }

                    wageTypeId = wageTypeTotalsTemp[index].id;
                    totalHours = parseFloat(wageTypeTotalsTemp[index].hours);
                    totalEarnings = parseFloat(wageTypeTotalsTemp[index].earnings);
                    wageTypeTotalHours += parseFloat(wageTypeTotalsTemp[index].hours);
                    wageTypeTotalEarnings += parseFloat(wageTypeTotalsTemp[index].earnings);
                }
                else {
                    totalHours += parseFloat(wageTypeTotalsTemp[index].hours);
                    totalEarnings += parseFloat(wageTypeTotalsTemp[index].earnings);
                    wageTypeTotalHours += parseFloat(wageTypeTotalsTemp[index].hours);
                    wageTypeTotalEarnings += parseFloat(wageTypeTotalsTemp[index].earnings);
                }
            }

            if (wageTypeTotalsTemp.length > 0) {
                item = new fin.pay.payCheck.WageTypeTotal(wageTypeId, wageTypeTotalsTemp[wageTypeTotalsTemp.length - 1].title, totalHours, totalEarnings);
                wageTypeTotals.push(item);
            }

            $("#WageTypeTotalHours").html(wageTypeTotalHours.toFixed(2));
            $("#WageTypeTotalEarnings").html(wageTypeTotalEarnings.toFixed(2));
            me.totalWageTypeGrid.setData(wageTypeTotals);
            me.loadPopup("WageTypeTotalPopup");
            me.totalWageTypeGrid.setHeight(500);
        },

        // This is a comparison function that will result in data being sorted in ascending order.
        customSort: function(a, b) {
            if (a.id > b.id) return 1;
            if (a.id < b.id) return -1;
            return 0;
        },

        actionCloseItem: function() {
            var me = this;

            me.hidePopup("WageTypeTotalPopup");
            $("#pageLoading").fadeOut("slow");
        },

        actionSaveItem: function() {
            var me = this;
            var item = [];
            var id = 0;
            var xml = "";

            if ($("input[name='MealBreakCompliance']:checked").val() === undefined) {
                alert("Please select the Meal Break Compliance.");
                return false;
            }

            if ($("input[name='UPSDeliveryToUnit']:checked").val() === "true" && me.houseCodeSearchTemplate.houseCodeIdTemplate === 0 
				&& (me.status === "CheckRequest" || me.status === "CheckRequestResend")) {
                alert("Please select the Unit (House Code).");
                return false;
            }

            if ($("input[name='PaymentMethod']:checked").val() === "Paper" && $("input[name='UPSDeliveryToUnit']:checked").val() === "false" && $("input[name='UPSDeliveryToHome']:checked").val() === "false") {
                alert("Please select one pay check delivery location: Unit Delivery or Employee Home Delivery.");
                return false;
            }

            if (!me.chargeToHouseCode.valid) {
                alert("In order to save, the errors on the page must be corrected.");
                return false;
            }

            me.wageTypeDetailGrid.body.deselectAll();
            me.validator.forceBlur();

            // Check to see if the data entered is valid
            if (!me.validator.queryValidity(true)) {
                alert("In order to save, the errors on the page must be corrected.");
                return false;
            }

            if (me.wageTypeDetailGrid.data.length === 0) {
                alert("Please add at least one Wage Type information.");
                return false;
            }

            if (me.payCheckRequestGrid.activeRowIndex >= 0)
                id = me.payCheckRequestGrid.data[me.payCheckRequestGrid.activeRowIndex].id

            item = new fin.pay.payCheck.PayCheckRequest(
				id
				, 2
				, parent.fin.appUI.houseCodeId
				, parent.fin.appUI.houseCodeTitle
				, $("#CheckRequestNumber").html()
				, me.requestedDate.lastBlurValue
				, me.deliveryDate.lastBlurValue
				, me.employeeNumber.getValue()
				, me.employeeName.getValue()
				, me.reasonForRequest.getValue()
				, $("input[name='TermRequest']:checked").val() === "true" ? true : false
				, $("input[name='TermRequest']:checked").val() === "true" ? me.stateTypes[me.state.indexSelected].id : 0
				, $("input[name='TermRequest']:checked").val() === "true" ? me.terminationDate.lastBlurValue : ""
				, $("input[name='MealBreakCompliance']:checked").val() === "true" ? true : false
				, $("input[name='PaymentMethod']:checked").val()
				, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? true : false
				, $("input[name='SaturdayDeliveryUnit']:checked").val() === "true" ? true : false
				, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeIdTemplate : 0
				, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeTitleTemplate : ""
				, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.unitAddress.getValue() : ""
				, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.upsPackageAttentionTo.getValue() : ""
				, $("input[name='UPSDeliveryToHome']:checked").val() === "true" ? true : false
				, $("input[name='SaturdayDeliveryHome']:checked").val() === "true" ? true : false
				, $("input[name='UPSDeliveryToHome']:checked").val() === "true" ? me.homeAddress.getValue() : ""
				, me.requestorName.getValue()
				, me.requestorEmail.getValue()
				, fin.cmn.text.mask.phone(me.requestorPhone.getValue(), true)
				, me.managerName.getValue()
				, me.managerEmail.getValue()
				);

            xml = me.saveXmlBuildItem(item);

            if (xml === "")
                return true;

            me.setStatus("Saving");
            $("#pageLoading").fadeIn("slow");

            // Send the object back to the server as a transaction
            me.transactionMonitor.commit({
                transactionType: "itemUpdate",
                transactionXml: xml,
                responseFunction: me.saveResponse,
                referenceData: { me: me, item: item }
            });

            return true;
        },

        saveXmlBuildItem: function() {
            var args = ii.args(arguments, {
                item: { type: fin.pay.payCheck.PayCheckRequest }
            });
            var me = this;
            var item = args.item;
            var xml = "";

            xml += '<payCheckRequest';
            xml += ' id="' + item.id + '"';
            xml += ' houseCodeId="' + item.houseCodeId + '"';
            xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
            xml += ' checkRequestNumber="' + item.checkRequestNumber + '"';
            xml += ' requestedDate="' + item.requestedDate + '"';
            xml += ' deliveryDate="' + item.deliveryDate + '"';
            xml += ' employeeNumber="' + item.employeeNumber + '"';
            xml += ' employeeName="' + ui.cmn.text.xml.encode(item.employeeName) + '"';
            xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
            xml += ' termRequest="' + item.termRequest + '"';
            xml += ' stateType="' + item.stateType + '"';
            xml += ' terminationDate="' + item.terminationDate + '"';
            xml += ' mealBreakCompliance="' + item.mealBreakCompliance + '"';
			xml += ' paymentMethod="' + item.paymentMethod + '"';
            xml += ' upsDeliveryToUnit="' + item.upsDeliveryToUnit + '"';
            xml += ' saturdayDeliveryUnit="' + item.saturdayDeliveryUnit + '"';
            xml += ' deliveryHouseCodeId="' + item.deliveryHouseCodeId + '"';
            xml += ' deliveryHouseCodeTitle="' + ui.cmn.text.xml.encode(item.deliveryHouseCodeTitle) + '"';
            xml += ' houseCodeAddress="' + ui.cmn.text.xml.encode(item.houseCodeAddress) + '"';
            xml += ' upsPackageAttentionTo="' + ui.cmn.text.xml.encode(item.upsPackageAttentionTo) + '"';
            xml += ' upsDeliveryToHome="' + item.upsDeliveryToHome + '"';
            xml += ' saturdayDeliveryHome="' + item.saturdayDeliveryHome + '"';
            xml += ' homeAddress="' + ui.cmn.text.xml.encode(item.homeAddress) + '"';
            xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
            xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
            xml += ' requestorPhone="' + ui.cmn.text.xml.encode(item.requestorPhone) + '"';
            xml += ' managerName="' + ui.cmn.text.xml.encode(item.managerName) + '"';
            xml += ' managerEmail="' + ui.cmn.text.xml.encode(item.managerEmail) + '"';
            xml += '/>';

            for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                xml += '<payCheckRequestWageType';
                xml += ' id="' + me.wageTypeDetailGrid.data[index].id + '"';
                xml += ' payCheckRequestId="' + item.id + '"';
                xml += ' wageTypeId="' + me.wageTypeDetailGrid.data[index].wageType.id + '"';
                xml += ' hours="' + me.wageTypeDetailGrid.data[index].hours + '"';
                xml += ' earnings="' + me.wageTypeDetailGrid.data[index].earnings + '"';
                xml += ' alternateBaseRate="' + me.wageTypeDetailGrid.data[index].alternateBaseRate + '"';
                xml += ' date="' + ui.cmn.text.date.format(new Date(me.wageTypeDetailGrid.data[index].date), "mm/dd/yyyy") + '"';
                xml += ' houseCodeId="' + me.wageTypeDetailGrid.data[index].houseCodeId + '"';
                xml += ' houseCodeTitle="' + (me.wageTypeDetailGrid.data[index].houseCodeId != 0 ? me.wageTypeDetailGrid.data[index].houseCodeTitle : "") + '"';
                xml += '/>';
            }

            xml += '<payCheckRequestNotification';
            xml += ' id="0"';
            xml += ' action="' + me.status + '"';
            xml += ' appVersion="' + me.session.propertyGet("appVersion") + '"';
            xml += '/>';

            if (me.status == "CheckRequestCancel") {
                xml += '<payCheckRequestStatus';
                xml += ' id="' + item.id + '"';
                xml += ' transactionStatusType="6"';
                xml += '/>';
            }

            if (me.status == "CheckRequestApprove") {
                xml += '<payCheckRequestStatus';
                xml += ' id="' + item.id + '"';
                xml += ' transactionStatusType="8"';
                xml += '/>';
            }

            return xml;
        },

        /* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
        saveResponse: function() {
            var args = ii.args(arguments, {
                transaction: { type: ii.ajax.TransactionMonitor.Transaction },
                xmlNode: { type: "XmlNode:transaction" }
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");

            if (status === "success") {
                $(args.xmlNode).find("*").each(function () {
                    switch (this.tagName) {
                        case "payPayCheckRequest":
                            var id = parseInt($(this).attr("id"), 10);

                            item = new fin.pay.payCheck.PayCheckRequest(
								id
								, 2
								, parent.fin.appUI.houseCodeId
								, parent.fin.appUI.houseCodeTitle
								, $("#CheckRequestNumber").html()
								, me.requestedDate.lastBlurValue
								, me.deliveryDate.lastBlurValue
								, me.employeeNumber.getValue()
								, me.employeeName.getValue()
								, me.reasonForRequest.getValue()
								, $("input[name='TermRequest']:checked").val() === "true" ? true : false
								, $("input[name='TermRequest']:checked").val() === "true" ? me.stateTypes[me.state.indexSelected].id : 0
								, $("input[name='TermRequest']:checked").val() === "true" ? me.terminationDate.lastBlurValue : ""
								, $("input[name='MealBreakCompliance']:checked").val() === "true" ? true : false
								, $("input[name='PaymentMethod']:checked").val()
								, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? true : false
								, $("input[name='SaturdayDeliveryUnit']:checked").val() === "true" ? true : false
								, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeIdTemplate : 0
								, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeTitleTemplate : ""
								, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.unitAddress.getValue() : ""
								, $("input[name='UPSDeliveryToUnit']:checked").val() === "true" ? me.upsPackageAttentionTo.getValue() : ""
								, $("input[name='UPSDeliveryToHome']:checked").val() === "true" ? true : false
								, $("input[name='SaturdayDeliveryHome']:checked").val() === "true" ? true : false
								, $("input[name='UPSDeliveryToHome']:checked").val() === "true" ? me.homeAddress.getValue() : ""
								, me.requestorName.getValue()
								, me.requestorEmail.getValue()
								, me.requestorPhone.getValue()
								, me.managerName.getValue()
								, me.managerEmail.getValue()
								);

                            if (me.status === "CheckRequest") {
                                alert("Payroll check request sent successfully.");
                                me.resetControls("CheckRequest");
                            }
                            else if (me.status === "CheckRequestResend") {
                                alert("Payroll check request resent successfully.");
                                me.payCheckRequests[me.payCheckRequestGrid.activeRowIndex] = item;
                                me.resetGrid();
                            }
                            else if (me.status === "CheckRequestCancel") {
                                alert("Payroll check request cancelled successfully.");
                                me.resetGrid();
                            }
                            else if (me.status === "CheckRequestApprove") {
                                alert("Payroll check request approved successfully.");
                                me.resetGrid();
                            }

                         break;
                    }
                });

                me.modified(false);
                me.setStatus("Saved");
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while sending the payroll check request: " + $(args.xmlNode).attr("message"));
            }

            $("#pageLoading").fadeOut("slow");
        },

        loadPopup: function(id) {
            var me = this;

            me.centerPopup(id);

            $("#backgroundPopup").css({
                "opacity": "0.5"
            });
            $("#backgroundPopup").fadeIn("slow");
            $("#" + id).fadeIn("slow");
        },

        hidePopup: function(id) {

            $("#backgroundPopup").fadeOut("slow");
            $("#" + id).fadeOut("slow");
        },

        centerPopup: function(id) {
            var me = this;
            var windowWidth = document.documentElement.clientWidth;
            var windowHeight = document.documentElement.clientHeight;

            if (id === "WageTypeTotalPopup") {
                var popupWidth = $("#" + id).width();
                var popupHeight = $("#" + id).height();

                $("#" + id).css({
                    "width": popupWidth,
                    "height": popupHeight,
                    "top": windowHeight / 2 - popupHeight / 2 + $(window).scrollTop(),
                    "left": windowWidth / 2 - popupWidth / 2 + $(window).scrollLeft()
                });
            }
            else if (id === "EmployeePopup") {
                var popupWidth = windowWidth - 100;
                var popupHeight = windowHeight - 100;

                $("#EmployeePopup").css({
                    "width": popupWidth,
                    "height": popupHeight,
                    "top": windowHeight / 2 - popupHeight / 2,
                    "left": windowWidth / 2 - popupWidth / 2
                });
            }
        }
    }
});

function main() {

    fin.payCheckUi = new fin.pay.payCheck.UserInterface();
    fin.payCheckUi.resize();
    fin.houseCodeSearchUi = fin.payCheckUi;
}
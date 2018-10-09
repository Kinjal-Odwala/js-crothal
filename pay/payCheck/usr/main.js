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
            me.wageTypes = [];
            me.weekDays = [];
            me.weeklyWages = [];
            me.employee = null;
			me.status = "";

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
            me.status = "Display";

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
            me.reExport = me.authorizer.isAuthorized(me.authorizePath + "\\ReExport");

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
                me.loadCount = 4;
                me.session.registerFetchNotify(me.sessionLoaded, me);
                me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
                me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.payCodeTypesLoaded, me);
                me.weekStore.fetch("userId:[user],year:-1", me.weeksLoaded, me);
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
            var divWageWidth = $(window).width() - 150;
            var divWageHeight = $(window).height() - 270;

            $("#Container").height($(window).height() - 370);
            $("#TotalRow").width($("#WageTypeDetailGridHeader").width());
            $("#checkRequestPopup").height($(window).height() - 110);
            $("#popupContainer").height($(window).height() - 210);
            $("#divWage").css({"width" : divWageWidth + "px", "height" : divWageHeight + "px"});
            $("#tblWageHeader").css({"width" : divWageWidth + "px"});
            $("#tblGrandTotalHeader").css({"width" : divWageWidth + "px"});
            me.payCheckRequestGrid.setHeight(200);
            me.wageTypeDetailGrid.setHeight(150);
        },

        defineFormControls: function() {
            var me = this;

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
                    var enteredText = me.searchRequestedDate.text.value;

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

			me.payCheckRequestGrid.addColumn("assigned", "", "", "", 30, function(item) {
				if (item.statusType === 9 && me.reExport) {
					var index = 0;
					if (me.payCheckRequestGrid.activeRowIndex === -1)
						index = me.payCheckRequestGrid.rows.length - 1;
					else
						index = me.payCheckRequestGrid.activeRowIndex;
					return "<center><input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"fin.payCheckUi.actionClickItem(this);\" " + (me.payCheckRequestGrid.data[index].assigned ? checked='checked' : '') + " /></center>";
				}
				else
					return "";
            });
            me.payCheckRequestGrid.addColumn("checkRequestNumber", "checkRequestNumber", "Check Request #", "Check Request #", 140);
            me.payCheckRequestGrid.addColumn("houseCodeTitle", "houseCodeTitle", "Cost Center", "Cost Center", null);
            me.payCheckRequestGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee Number", 110);
            me.payCheckRequestGrid.addColumn("employeeName", "employeeName", "Employee Name", "Employee Name", 200);
            me.payCheckRequestGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 200);
            me.payCheckRequestGrid.addColumn("requestedDate", "requestedDate", "Requested Date", "Requested Date", 140);
            me.payCheckRequestGrid.addColumn("managerName", "managerName", "Manager Name", "Manager Name", 200);
            me.payCheckRequestGrid.addColumn("approvedDate", "approvedDate", "Approved Date", "Approved Date", 140);
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

            me.houseCodeTitle = new ui.ctl.Input.Text({
                id: "HouseCodeTitle",
                maxLength: 64
            });

            me.requestedDate = new ui.ctl.Input.Date({
                id: "RequestedDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.deliveryDate = new ui.ctl.Input.Date({
                id: "DeliveryDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.employeeNumber = new ui.ctl.Input.Text({
                id: "EmployeeNumber",
                maxLength: 16
            });

            me.employeeName = new ui.ctl.Input.Text({
                id: "EmployeeName",
                maxLength: 100
            });

            me.reasonForRequest = new ui.ctl.Input.Text({
                id: "ReasonForRequest",
                maxLength: 255
            });

            me.terminationDate = new ui.ctl.Input.Date({
                id: "TerminationDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.unitTitle = new ui.ctl.Input.Text({
                id: "UnitTitle",
                maxLength: 64
            });

            me.unitAddress = new ui.ctl.Input.Text({
                id: "UnitAddress",
                maxLength: 1024
            });

            me.upsPackageAttentionTo = new ui.ctl.Input.Text({
                id: "UPSPackageAttentionTo",
                maxLength: 512
            });

            me.homeAddress = new ui.ctl.Input.Text({
                id: "HomeAddress",
                maxLength: 1024
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

            me.requestorPhone = new ui.ctl.Input.Text({
                id: "RequestorPhone",
                maxLength: 14
            });

            me.managerName = new ui.ctl.Input.Text({
                id: "ManagerName",
                maxLength: 100
            });

            me.managerEmail = new ui.ctl.Input.Text({
                id: "ManagerEmail",
                maxLength: 100
            });

            me.wageTypeDetailGrid = new ui.ctl.Grid({
                id: "WageTypeDetailGrid"
            });

            me.wageTypeDetailGrid.addColumn("payCode", "payCode", "Wage Type", "Wage Type", 350, function(type) { return type.brief + " - " + type.name; });
            me.wageTypeDetailGrid.addColumn("payRate", "payRate", "Pay Rate", "Pay Rate", 120, function(payRate) { return ui.cmn.text.money.format(payRate); });
            me.wageTypeDetailGrid.addColumn("hours", "hours", "Hours", "Hours", 120, function(hours) { return ui.cmn.text.money.format(hours); });
            me.wageTypeDetailGrid.addColumn("date", "date", "Date", "Date", 120);
            me.wageTypeDetailGrid.addColumn("earnings", "earnings", "Earnings", "Earnings", 120, function(earnings) { return ui.cmn.text.money.format(earnings); });
            me.wageTypeDetailGrid.addColumn("title", "title", "", "", null);
            me.wageTypeDetailGrid.capColumns();

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

            me.anchorResendRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorResendRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Resend Request&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionResendRequestItem(); },
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

            me.anchorReExport = new ui.ctl.buttons.Sizeable({
                id: "AnchorReExport",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Re-Export&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionReExport(); },
                hasHotState: true
            });

			me.anchorExport = new ui.ctl.buttons.Sizeable({
                id: "AnchorExport",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Export&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionExportItem(); },
                hasHotState: true
            });

            me.anchorPopupCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorPopupCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionPopupCancelItem(); },
                hasHotState: true
            });

            me.anchorPrev = new ui.ctl.buttons.Sizeable({
                id: "AnchorPrev",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Prev&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionPrevItem(); },
                hasHotState: true
            });

            me.anchorNext = new ui.ctl.buttons.Sizeable({
                id: "AnchorNext",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionNextItem(); },
                hasHotState: true
            });

            me.anchorSendRequest = new ui.ctl.buttons.Sizeable({
                id: "AnchorSendRequest",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Send Request&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionSendRequestItem(); },
                hasHotState: true
            });

            me.anchorEmployeeOK = new ui.ctl.buttons.Sizeable({
                id: "AnchorEmployeeOK",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;&nbsp;</span>",
                clickFunction: function() { me.actionEmployeeOKItem(); },
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

			me.employeeGrid.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee #", 200);
            me.employeeGrid.addColumn("firstName", "firstName", "First Name", "First Name", 200);
            me.employeeGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 200);
            me.employeeGrid.addColumn("brief", "brief", "Brief", "Brief", null);
            me.employeeGrid.addColumn("houseCode", "houseCode", "Cost Center", "Cost Center", 200);
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

            me.employeeNumberPopup = new ui.ctl.Input.Text({
                id: "EmployeeNumberPopup",
                maxLength: 16,
                changeFunction: function() { me.modified(); }
            });

            me.employeeNumberPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if (me.employeeNumberPopup.getValue() === "")
                        return;

                    if (!(/^[0-9]+$/.test(me.employeeNumberPopup.getValue())))
                        this.setInvalid("Please enter valid Employee Number.");
                });

            me.employeeNamePopup = new ui.ctl.Input.Text({
                id: "EmployeeNamePopup",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.employeeNamePopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required);

            me.reasonForRequestPopup = new ui.ctl.Input.Text({
                id: "ReasonForRequestPopup",
                maxLength: 255,
                changeFunction: function() { me.modified(); }
            });

            me.reasonForRequestPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if (me.reasonForRequestPopup.getValue() === "")
                        return;

                    if (me.reasonForRequestPopup.getValue().indexOf("|") >= 0)
                        this.setInvalid("Reason for Request should not contain '|' character.");
                });

            me.terminationDatePopup = new ui.ctl.Input.Date({
                id: "TerminationDatePopup",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.terminationDatePopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {
                    if ($("#TermRequestNoPopup")[0].checked) {
                        this.valid = true;
                    }
                    else {
                        var enteredText = me.terminationDatePopup.text.value;

                        if (enteredText === "")
                            return;

                        me.modified();
                        if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
                            this.setInvalid("Please enter valid date.");
                    }
                });

            me.deliveryDatePopup = new ui.ctl.Input.Date({
                id: "DeliveryDatePopup",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });

            me.deliveryDatePopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {
                    var enteredText = me.deliveryDatePopup.text.value;

                    if (enteredText === "")
                        return;

                    me.modified();
                    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
                        this.setInvalid("Please enter valid date.");
                });

            me.unitAddressPopup = new ui.ctl.Input.Text({
                id: "UnitAddressPopup",
                maxLength: 1024,
                changeFunction: function() { me.modified(); }
            });

            me.unitAddressPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if ($("input[name='DeliveryToUnitPopup']:checked").val() === "true" && me.unitAddressPopup.getValue() === "")
                        this.setInvalid("Please enter the Unit (Cost Center) Address.");
                });

            me.upsPackageAttentionToPopup = new ui.ctl.Input.Text({
                id: "UPSPackageAttentionToPopup",
                maxLength: 512,
                changeFunction: function() { me.modified(); }
            });

            me.upsPackageAttentionToPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    if ($("input[name='DeliveryToUnitPopup']:checked").val() === "true" && me.upsPackageAttentionToPopup.getValue() === "")
                        this.setInvalid("Please enter the UPS Package Attention to.");
                });

            me.firstNamePopup = new ui.ctl.Input.Text({
                id: "FirstNamePopup",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.firstNamePopup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required );

            me.middleInitialPopup = new ui.ctl.Input.Text({
                id: "MiddleInitialPopup",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.lastNamePopup = new ui.ctl.Input.Text({
                id: "LastNamePopup",
                maxLength: 50,
                changeFunction: function() { me.modified(); }
            });

            me.lastNamePopup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required );

            me.address1Popup = new ui.ctl.Input.Text({
                id: "Address1Popup",
                maxLength: 255,
                changeFunction: function() { me.modified(); }
            });

            me.address1Popup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required );

            me.address2Popup = new ui.ctl.Input.Text({
                id: "Address2Popup",
                maxLength: 255,
                changeFunction: function() { me.modified(); }
            });

            me.address2Popup.makeEnterTab()
                .setValidationMaster( me.validator );

            me.cityPopup = new ui.ctl.Input.Text({
                id: "CityPopup",
                maxLength: 255,
                changeFunction: function() { me.modified(); }
            });

            me.cityPopup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required );

            me.statePopup = new ui.ctl.Input.DropDown.Filtered({
                id: "StatePopup",
                formatFunction: function( type ) { return type.name; },
                changeFunction: function() { me.modified(); },
                required: false
            });

            me.statePopup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required )
                .addValidation( function( isFinal, dataMap ) {

                    if ((this.focused || this.touched) && me.statePopup.indexSelected === -1)
                        this.setInvalid("Please select the correct State.");
                });

            me.postalCodePopup = new ui.ctl.Input.Text({
                id: "PostalCodePopup",
                maxLength: 10,
                changeFunction: function() { me.modified(); }
            });

            me.postalCodePopup.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required )
                .addValidation( function( isFinal, dataMap ) {

                    var enteredText = me.postalCodePopup.getValue();

                    if (enteredText === "")
                        return;

                    if (!(ui.cmn.text.validate.postalCode(enteredText)))
                        this.setInvalid("Please enter valid Postal Code.");
                });

            me.requestorNamePopup = new ui.ctl.Input.Text({
                id: "RequestorNamePopup",
                maxLength: 150
            });

            me.requestorEmailPopup = new ui.ctl.Input.Text({
                id: "RequestorEmailPopup",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.requestorEmailPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.requestorEmailPopup.getValue();

                    if (enteredText === "")
                        return;

                    if (!(ui.cmn.text.validate.emailAddress(enteredText)))
                        this.setInvalid("Please enter valid Requestor Email.");
                });

            me.requestorPhonePopup = new ui.ctl.Input.Text({
                id: "RequestorPhonePopup",
                maxLength: 14,
                changeFunction: function() { me.modified(); }
            });

            me.requestorPhonePopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.requestorPhonePopup.text.value;

                    if (enteredText === "")
                        return;

                    me.requestorPhonePopup.text.value = fin.cmn.text.mask.phone(enteredText);
                    enteredText = me.requestorPhonePopup.text.value;

                    if (!(ui.cmn.text.validate.phone(enteredText)))
                        this.setInvalid("Please enter valid Phone #. Example: (999) 999-9999");
                });

            me.managerNamePopup = new ui.ctl.Input.Text({
                id: "ManagerNamePopup",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerNamePopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required);

            me.managerEmailPopup = new ui.ctl.Input.Text({
                id: "ManagerEmailPopup",
                maxLength: 100,
                changeFunction: function() { me.modified(); }
            });

            me.managerEmailPopup.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.managerEmailPopup.getValue();

                    if (enteredText === "")
                        return;

                    if (!(ui.cmn.text.validate.emailAddress(enteredText)))
                        this.setInvalid("Please enter valid Manager Email.");
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

            me.payCodeTypes = [];
            me.payCodeTypeStore = me.cache.register({
                storeId: "payCodes",
                itemConstructor: fin.pay.payCheck.PayCodeType,
                itemConstructorArgs: fin.pay.payCheck.payCodeTypeArgs,
                injectionArray: me.payCodeTypes
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
                lookupSpec: { payCode: me.payCodeTypes }
            });

            me.weeks = [];
            me.weekStore = me.cache.register({
                storeId: "payWeeks",
                itemConstructor: fin.pay.payCheck.Week,
                itemConstructorArgs: fin.pay.payCheck.weekArgs,
                injectionArray: me.weeks
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

            $("input[type=radio]").click(function() {
                if (this.id === "PaymentMethodElectronicPopup") {
                    $("#DeliveryToPopupContainer").hide();
                    $("#DeliveryInfoPopupContainer").hide();
                    $("#UnitPopupContainer").hide();
                    $("#EmployeePopupContainer").hide();
                    $("#DeliveryToUnitPopup")[0].checked = false;
                    $("#DeliveryToHomePopup")[0].checked = false;
                    $("#SaturdayDeliveryYesPopup")[0].checked = false;
                    $("#SaturdayDeliveryNoPopup")[0].checked = false;
                    $("#houseCodeTemplateText").val("");
                    me.deliveryDatePopup.setValue("");
                    me.unitAddressPopup.setValue("");
                    me.upsPackageAttentionToPopup.setValue("");
                    me.firstNamePopup.setValue("");
                    me.middleInitialPopup.setValue("");
                    me.lastNamePopup.setValue("");
                    me.address1Popup.setValue("");
                    me.address2Popup.setValue("");
                    me.cityPopup.setValue("");
                    me.statePopup.setValue("");
                    me.postalCodePopup.setValue("");
               }
               else if (this.id === "PaymentMethodPaperPopup") {
                    $("#DeliveryToPopupContainer").show();
                    me.setDeliveryDate();
               }
               else if (this.id === "DeliveryToUnitPopup") {
                    $("#DeliveryInfoPopupContainer").show();
                    $("#UnitPopupContainer").show();
                    $("#EmployeePopupContainer").hide();
                    $("#SaturdayDeliveryNoPopup")[0].checked = true;
                    $("#houseCodeTemplateText").val(me.houseCodeSearchTemplate.houseCodeTitleTemplate);
                    me.firstNamePopup.setValue("");
                    me.middleInitialPopup.setValue("");
                    me.lastNamePopup.setValue("");
                    me.address1Popup.setValue("");
                    me.address2Popup.setValue("");
                    me.cityPopup.setValue("");
                    me.statePopup.setValue("");
                    me.postalCodePopup.setValue("");
                    me.deliveryDatePopup.resizeText();
                    me.unitAddressPopup.resizeText();
                    me.upsPackageAttentionToPopup.resizeText();
                    me.setUnitAddress();
                }
                else if (this.id === "DeliveryToHomePopup") {
                    $("#DeliveryInfoPopupContainer").show();
                    $("#EmployeePopupContainer").show();
                    $("#UnitPopupContainer").hide();
                    $("#SaturdayDeliveryNoPopup")[0].checked = true;
                    $("#houseCodeTemplateText").val("");
                    me.unitAddressPopup.setValue("");
                    me.upsPackageAttentionToPopup.setValue("");
                    me.firstNamePopup.setValue(me.persons[0].firstName);
                    me.middleInitialPopup.setValue(me.persons[0].middleName);
                    me.lastNamePopup.setValue(me.persons[0].lastName);
                    me.deliveryDatePopup.resizeText();
                    me.firstNamePopup.resizeText();
                    me.middleInitialPopup.resizeText();
                    me.lastNamePopup.resizeText();
                    me.address1Popup.resizeText();
                    me.address2Popup.resizeText();
                    me.cityPopup.resizeText();
                    me.statePopup.resizeText();
                    me.postalCodePopup.resizeText();
                }
                else if (this.id === "TermRequestYesPopup") {
                    $("#LabelTerminationDate").html("<span class='requiredFieldIndicator'>&#149;</span>Termination Date:");
                    if (me.employee.statusType === 6) {
                        me.terminationDatePopup.setValue(me.employee.terminationDate);
                    }
                }
                else if (this.id === "TermRequestNoPopup") {
                    $("#LabelTerminationDate").html("<span id='nonRequiredFieldIndicator'>Termination Date:</span>");
                    me.terminationDatePopup.resetValidation(true);
                    if (me.terminationDatePopup.lastBlurValue === undefined || me.terminationDatePopup.lastBlurValue === "" || !(ui.cmn.text.validate.generic(me.terminationDatePopup.lastBlurValue, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
                        me.terminationDatePopup.setValue("");
                }
            });

            $("#imgWeekDaysAdd").bind("click", function() { me.addWeekDays(); });
            $("input[type='radio']").change(function() { me.modified(); });
            $("#EmployeeNumberPopupText").bind("change", function() { me.searchEmployeeByNumber(); });
            $("#EmployeeNamePopupText").bind("change", function() { me.searchEmployeeByName(); });
            $("#EmployeeNamePopupText").bind("keydown", me, me.actionEmployeeSearch);
            $("#FilterTypeText").bind("keydown", me, me.actionSearchItem);
            $("#SearchInputText").bind("keydown", me, me.actionSearchItem);
            $("#SearchRequestedDateText").bind("keydown", me, me.actionSearchItem);
            $("#StatusTypesText").bind("keydown", me, me.actionSearchItem);
            $("#ViewWageTypeTotal").bind("click", function() { me.actionWageTypeTotalItem(); });
            $("#SearchRequestedDate").hide();
            $("#AnchorResendRequest").hide();
			$("#AnchorCancel").hide();
            $("#AnchorApprove").hide();
            $("#AnchorReExport").hide();
			$("#AnchorExport").hide();

            me.houseCodeTitle.text.readOnly = true;
            me.requestedDate.text.readOnly = true;
            me.deliveryDate.text.readOnly = true;
            me.employeeNumber.text.readOnly = true;
            me.employeeName.text.readOnly = true;
            me.reasonForRequest.text.readOnly = true;
            me.terminationDate.text.readOnly = true;
            me.unitTitle.text.readOnly = true;
            me.unitAddress.text.readOnly = true;
            me.upsPackageAttentionTo.text.readOnly = true;
            me.homeAddress.text.readOnly = true;
            me.managerName.text.readOnly = true;
            me.managerEmail.text.readOnly = true;
            me.requestorEmail.text.readOnly = true;
            me.requestorPhone.text.readOnly = true;
			me.firstNamePopup.text.readOnly = true;
            me.middleInitialPopup.text.readOnly = true;
            me.lastNamePopup.text.readOnly = true;
            me.requestorNamePopup.text.readOnly = true;

            $("#TermRequestYes")[0].disabled = true;
            $("#TermRequestNo")[0].disabled = true;
            $("#PaymentMethodElectronic")[0].disabled = true;
            $("#PaymentMethodPaper")[0].disabled = true;
            $("#DeliveryToUnit")[0].disabled = true;
            $("#DeliveryToHome")[0].disabled = true;
            $("#SaturdayDeliveryYes")[0].disabled = true;
            $("#SaturdayDeliveryNo")[0].disabled = true;
            $("#RequestedDateAction").removeClass("iiInputAction");
            $("#DeliveryDateAction").removeClass("iiInputAction");
            $("#TerminationDateAction").removeClass("iiInputAction");

            me.payCheckRequestGrid.setHeight(200);
            me.wageTypeDetailGrid.setHeight(150);
            me.resetControls("Display");
        },

        setTabIndexes: function() {
            var me = this;

            me.houseCodeTitle.text.tabIndex = 1;
            me.requestedDate.text.tabIndex = 2;
            me.employeeNumber.text.tabIndex = 3;
            me.employeeName.text.tabIndex = 4;
            me.reasonForRequest.text.tabIndex = 5;
            $("#TermRequestYes")[0].tabIndex = 6;
            $("#TermRequestNo")[0].tabIndex = 7;
            me.terminationDate.text.tabIndex = 8;
            $("#PaymentMethodElectronic")[0].tabIndex = 9;
            $("#PaymentMethodPaper")[0].tabIndex = 10;
            $("#DeliveryToUnit")[0].tabIndex = 11;
            $("#DeliveryToHome")[0].tabIndex = 12;
			me.deliveryDate.text.tabIndex = 13;
            $("#SaturdayDeliveryYes")[0].tabIndex = 14;
            $("#SaturdayDeliveryNo")[0].tabIndex = 15;
            me.unitTitle.text.tabIndex = 16;
            me.unitAddress.text.tabIndex = 17;
            me.upsPackageAttentionTo.text.tabIndex = 18;
            me.homeAddress.text.tabIndex = 19;
            me.requestorName.text.tabIndex = 20;
            me.requestorEmail.text.tabIndex = 21;
            me.requestorPhone.text.tabIndex = 22;
            me.managerName.text.tabIndex = 23;
            me.managerEmail.text.tabIndex = 24;
            me.employeeNumberPopup.text.tabIndex = 51;
            me.employeeNamePopup.text.tabIndex = 52;
            $("#houseCodeText")[0].tabIndex = 53;
            me.reasonForRequestPopup.text.tabIndex = 54;
            $("#TermRequestYesPopup")[0].tabIndex = 55;
            $("#TermRequestNoPopup")[0].tabIndex = 56;
            me.terminationDatePopup.text.tabIndex = 57;
            $("#PaymentMethodElectronicPopup")[0].tabIndex = 58;
            $("#PaymentMethodPaperPopup")[0].tabIndex = 59;
            $("#DeliveryToUnitPopup")[0].tabIndex = 60;
            $("#DeliveryToHomePopup")[0].tabIndex = 61;
            me.deliveryDatePopup.text.tabIndex = 62;
            $("#SaturdayDeliveryYesPopup")[0].tabIndex = 63;
            $("#SaturdayDeliveryNoPopup")[0].tabIndex = 64;
            $("#houseCodeTemplateText")[0].tabIndex = 65;
            me.unitAddressPopup.text.tabIndex = 66;
            me.upsPackageAttentionToPopup.text.tabIndex = 67;
            me.firstNamePopup.text.tabIndex = 68;
            me.middleInitialPopup.text.tabIndex = 69;
            me.lastNamePopup.text.tabIndex = 70;
            me.address1Popup.text.tabIndex = 71;
            me.address2Popup.text.tabIndex = 72;
            me.cityPopup.text.tabIndex = 73;
            me.statePopup.text.tabIndex = 74;
            me.postalCodePopup.text.tabIndex = 75;
            me.requestorNamePopup.text.tabIndex = 76;
            me.requestorEmailPopup.text.tabIndex = 77;
            me.requestorPhonePopup.text.tabIndex = 78;
            me.managerNamePopup.text.tabIndex = 79;
            me.managerEmailPopup.text.tabIndex = 80;
        },

        resizeControls: function() {
            var me = this;

            me.houseCodeTitle.resizeText();
            me.requestedDate.resizeText();
            me.deliveryDate.resizeText();
            me.employeeNumber.resizeText();
            me.employeeName.resizeText();
            me.reasonForRequest.resizeText();
            me.terminationDate.resizeText();
            me.unitAddress.resizeText();
            me.upsPackageAttentionTo.resizeText();
            me.homeAddress.resizeText();
            me.requestorName.resizeText();
            me.requestorEmail.resizeText();
            me.requestorPhone.resizeText();
            me.managerName.resizeText();
            me.managerEmail.resizeText();
            me.employeeGrid.resize();
            me.employeeNumberPopup.resizeText();
            me.employeeNamePopup.resizeText();
            me.reasonForRequestPopup.resizeText();
            me.terminationDatePopup.resizeText();
            me.deliveryDatePopup.resizeText();
            me.unitAddressPopup.resizeText();
            me.upsPackageAttentionToPopup.resizeText();
            me.firstNamePopup.resizeText();
            me.middleInitialPopup.resizeText();
            me.lastNamePopup.resizeText();
            me.address1Popup.resizeText();
            me.address2Popup.resizeText();
            me.cityPopup.resizeText();
            me.statePopup.resizeText();
            me.postalCodePopup.resizeText();
            me.requestorNamePopup.resizeText();
            me.requestorEmailPopup.resizeText();
            me.requestorPhonePopup.resizeText();
            me.managerNamePopup.resizeText();
            me.managerEmailPopup.resizeText();
        },

        resetControls: function(status) {
            var me = this;

            if (status === "Display") {
                $("#AnchorResendRequest").hide();
                $("#AnchorCancel").hide();
                $("#AnchorApprove").hide();
                $("#AnchorReExport").hide();
				$("#AnchorExport").hide();
				$("#DeliveryInfoContainer").hide();
				$("#UnitContainer").hide();
				$("#EmployeeContainer").hide();
                $("#CheckRequestNumber").html("");
                $("#TermRequestNo")[0].checked = true;
                $("#PaymentMethodElectronic")[0].checked = false;
                $("#PaymentMethodPaper")[0].checked = false;
                $("#DeliveryToUnit")[0].checked = false;
                $("#DeliveryToHome")[0].checked = false;
                $("#SaturdayDeliveryYes")[0].checked = false;
                $("#SaturdayDeliveryNo")[0].checked = false;
                $("#TotalHours").html("");
                $("#TotalEarnings").html("");
                me.houseCodeTitle.setValue("");
                me.requestedDate.setValue("");
                me.deliveryDate.setValue("");
                me.employeeNumber.setValue("");
                me.employeeName.setValue("");
                me.reasonForRequest.setValue("");
                me.terminationDate.setValue("");
                me.unitTitle.setValue("");
                me.unitAddress.setValue("");
                me.upsPackageAttentionTo.setValue("");
                me.homeAddress.setValue("");
                me.requestorName.setValue("");
                me.requestorEmail.setValue("");
                me.requestorPhone.setValue("");
                me.managerName.setValue("");
                me.managerEmail.setValue("");
                me.wageTypeDetailGrid.setData([]);
            }
            else if (status === "New") {
                $("#houseCodeText").val("");
                $("#houseCodeTemplateText").val("");
                $("#TermRequestNoPopup")[0].checked = true;
                $("#PaymentMethodElectronicPopup")[0].checked = false;
                $("#PaymentMethodPaperPopup")[0].checked = false;
                $("#DeliveryToUnitPopup")[0].checked = false;
                $("#DeliveryToHomePopup")[0].checked = false;
                $("#SaturdayDeliveryNoPopup")[0].checked = true;
                $("#DeliveryToPopupContainer").hide();
                $("#DeliveryInfoPopupContainer").hide();
                $("#UnitPopupContainer").hide();
                $("#EmployeePopupContainer").hide();
                $("#AnchorPrev").hide();
                $("#AnchorSendRequest").hide();
                $("#AnchorNext").show();
                me.validator.reset();
                me.employeeNumberPopup.setValue("");
                me.employeeNamePopup.setValue("");
                me.reasonForRequestPopup.setValue("");
                me.terminationDatePopup.setValue("");
                me.deliveryDatePopup.setValue("");
                me.unitAddressPopup.setValue("");
                me.upsPackageAttentionToPopup.setValue("");
                me.firstNamePopup.setValue("");
                me.middleInitialPopup.setValue("");
                me.lastNamePopup.setValue("");
                me.address1Popup.setValue("");
                me.address2Popup.setValue("");
                me.cityPopup.setValue("");
                me.statePopup.setValue("");
                me.statePopup.updateStatus();
                me.postalCodePopup.setValue("");
                me.requestorNamePopup.setValue("");
                me.requestorEmailPopup.setValue("");
                me.requestorPhonePopup.setValue("");
                me.managerNamePopup.setValue("");
                me.managerEmailPopup.setValue("");
                me.setUserInfo();
                me.resizeControls();
            }
        },

        setReadOnly: function(readOnly) {
            var me = this;

            $("#houseCodeText")[0].readOnly = readOnly;
            $("#houseCodeTemplateText")[0].readOnly = readOnly;
            me.employeeNumberPopup.text.readOnly = readOnly;
            me.employeeNamePopup.text.readOnly = readOnly;
            me.reasonForRequestPopup.text.readOnly = readOnly;
            me.terminationDatePopup.text.readOnly = readOnly;
            me.deliveryDatePopup.text.readOnly = readOnly;
            me.unitAddressPopup.text.readOnly = readOnly;
            me.upsPackageAttentionToPopup.text.readOnly = readOnly;
            me.address1Popup.text.readOnly = readOnly;
            me.address2Popup.text.readOnly = readOnly;
            me.cityPopup.text.readOnly = readOnly;
            me.statePopup.text.readOnly = readOnly;
            me.postalCodePopup.text.readOnly = readOnly;
            me.requestorEmailPopup.text.readOnly = readOnly;
            me.requestorPhonePopup.text.readOnly = readOnly;
            me.managerNamePopup.text.readOnly = readOnly;
            me.managerEmailPopup.text.readOnly = readOnly;

            $("#TermRequestYesPopup")[0].disabled = readOnly;
            $("#TermRequestNoPopup")[0].disabled = readOnly;
            $("#PaymentMethodElectronicPopup")[0].disabled = readOnly;
            $("#PaymentMethodPaperPopup")[0].disabled = readOnly;
            $("#DeliveryToUnitPopup")[0].disabled = readOnly;
            $("#DeliveryToHomePopup")[0].disabled = readOnly;
            $("#SaturdayDeliveryYesPopup")[0].disabled = readOnly;
            $("#SaturdayDeliveryNoPopup")[0].disabled = readOnly;

            if (readOnly) {
                $("#DeliveryDatePopupAction").removeClass("iiInputAction");
                $("#StatePopupAction").removeClass("iiInputAction");
                $("#TerminationDatePopupAction").removeClass("iiInputAction");
                $("#houseCodeTextDropImage").removeClass("HouseCodeDropDown");
                $("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
            }
            else {
                $("#DeliveryDatePopupAction").addClass("iiInputAction");
                $("#StatePopupAction").addClass("iiInputAction");
                $("#TerminationDatePopupAction").addClass("iiInputAction");
                $("#houseCodeTextDropImage").addClass("HouseCodeDropDown");
                $("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDown");
            }
        },

        resetGrid: function() {
            var me = this;
            var index = me.payCheckRequestGrid.activeRowIndex;

            if (me.statuses[me.statusType.indexSelected].id === 0) {
                if (me.status === "CheckRequestResend")
                    me.payCheckRequests[index].statusType = 2;
                else if (me.status === "CheckRequestApprove" || me.status === "ReExport")
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
            me.resetControls("Display");
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

            me.statePopup.setData(me.stateTypes);
            me.checkLoadCount();
        },

        payCodeTypesLoaded: function(me, activeId) {

            for (var index = 0; index < me.payCodeTypes.length; index++) {
                if (me.payCodeTypes[index].checkRequest && me.payCodeTypes[index].active)
                    me.wageTypes.push(me.payCodeTypes[index]);
            }
            me.checkLoadCount();
        },

        weeksLoaded: function(me, activeId) {

            for (var index = 0; index < me.weeks.length; index++) {
                $("#selWeekType").append("<option value=\"" + me.weeks[index].id + "\">" + me.weeks[index].weekStartDate + " - " + me.weeks[index].weekEndDate + "</option>");
            }
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
            me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = parent.fin.appUI.houseCodeTitle;
            me.siteStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",type:invoice", me.sitesLoaded, me);
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
                me.unitAddressPopup.setValue(address);
            }
        },

        houseCodeChanged: function() {
            var me = this;

            if (me.employee !== null) {
                if (me.employee.houseCode !== parent.fin.appUI.houseCodeBrief) {
                    me.employeeNumberPopup.setValue("");
                    me.employeeNamePopup.setValue("");
                }
            }

            me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = parent.fin.appUI.houseCodeTitle;
            me.siteStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",type:invoice", me.sitesLoaded, me);
        },

        actionEmployeeSearch: function() {
            var args = ii.args(arguments, {
                event: {type: Object}
            });
            var event = args.event;
            var me = event.data;

            if (event.keyCode === 13) {
                me.searchEmployeeByName();
            }
        },

        searchEmployeeByNumber: function() {
            var me = this;
            me.searchBy = "employeeNumber";

            if (me.employeeNumberPopup.validate(true) && me.employeeNumberPopup.getValue().length > 3) {
                if (me.status === "New") {
                    $("#EmployeeNumberPopupText").addClass("Loading");
                    me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeNumberPopup.getValue()
                        + ",hcmHouseCodeId:" + ($("#houseCodeText").val() !== "" ? parent.fin.appUI.houseCodeId : 0)
                        + ",employeeType:SearchFull"
                        + ",filterType:Employee Number,moduleName:CheckRequest"
                        , me.employeesLoaded, me);
                }
            }
            else {
                if (me.employeeNumberPopup.validate(true)) {
                    alert("There is no Employee with Employee # [" + me.employeeNumberPopup.getValue() + "].");
                    me.employeeNumberPopup.setValue("");
                }
            }
        },

        searchEmployeeByName: function() {
            var me = this;
            me.searchBy = "employeeName";

            if (me.employeeNamePopup.getValue().length > 3) {
               if (me.status === "New") {
                    $("#EmployeeNamePopupText").addClass("Loading");
                    me.employeeStore.fetch("userId:[user],searchValue:" + me.employeeNamePopup.getValue()
                        + ",hcmHouseCodeId:" + ($("#houseCodeText").val() !== "" ? parent.fin.appUI.houseCodeId : 0)
                        + ",employeeType:SearchFull"
                        + ",filterType:Name,moduleName:CheckRequest"
                        , me.employeesLoaded, me);
                }
            }
            else {
                if (me.employeeNamePopup.validate(true)) {
                    alert("There is no Employee with Employee Name [" + me.employeeNamePopup.getValue() + "].");
                    me.employeeNamePopup.setValue("");
                }
            }
        },

        employeesLoaded: function(me, activeId) {
            $("#EmployeeNumberPopupText").removeClass("Loading");
            $("#EmployeeNamePopupText").removeClass("Loading");
            if (me.employees.length > 1) {
                me.employeeGrid.setData(me.employees);
                me.loadPopup("EmployeePopup");
                me.employeeGrid.setHeight($(window).height() - 180);
            }
            else if (me.employees.length === 1) {
                me.employee = me.employees[0];
                me.employeeNumberPopup.setValue(me.employee.employeeNumber);
                me.employeeNamePopup.setValue(me.employee.firstName + " " + me.employee.lastName);
                if (me.personId !== me.employee.id) {
                    me.personId = me.employee.id;
                    me.personStore.fetch("userId:[user],id:" + me.employee.id, me.personsLoaded, me);
                    if (me.employee.houseCode !== parent.fin.appUI.houseCodeBrief || $("#houseCodeText").val() === "")
                        me.houseCodeFetch(me.employee.houseCode);
                }
                else
                    me.personsLoaded(me, 0);
                me.siteStore.fetch("userId:[user],houseCodeId:" + me.employee.houseCodeId + ",type:invoice", me.sitesLoaded, me);
            }
            else {
                if (me.searchBy === "employeeNumber")
                    alert("There is no Employee with Employee # [" + me.employeeNumberPopup.getValue() + "].");
                if (me.searchBy === "employeeName")
                    alert("There is no Employee with Employee Name [" + me.employeeNamePopup.getValue() + "].");

                me.employeeNumberPopup.setValue("");
                me.employeeNamePopup.setValue("");
            }

            me.searchBy = "";
        },

        personsLoaded: function(me, activeId) {

            if (me.persons.length > 0) {
                if (me.pageLoading) {
                    me.pageLoading = false;
                    me.users = me.persons.slice();
                    me.setUserInfo();
                    me.requestorName.text.readOnly = true;
                }
                else {
                    me.loadWageTypes();
                }
            }
        },

        actionEmployeeOKItem: function() {
            var me = this;

            if (me.employeeGrid.activeRowIndex >= 0) {
                me.employee = me.employees[me.employeeGrid.activeRowIndex];
                me.employeeNumberPopup.setValue(me.employee.employeeNumber);
                me.employeeNamePopup.setValue(me.employee.firstName + " " + me.employee.lastName);

                if ($("#houseCodeText").val() === "" || parent.fin.appUI.houseCodeId === 0) {
                    me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + me.employee.houseCode + ",", me.employeeHouseCodesLoaded, me);
                }

                if (me.personId !== me.employee.id) {
                    me.personId = me.employee.id;
                    me.personStore.fetch("userId:[user],id:" + me.employee.id, me.personsLoaded, me);
                }
                else
                    me.personsLoaded(me, 0);
                me.siteStore.fetch("userId:[user],houseCodeId:" + me.employee.houseCodeId + ",type:invoice", me.sitesLoaded, me);
            }
            else {
                me.employeeNumberPopup.setValue("");
                me.employeeNamePopup.setValue("");
            }

            $("#EmployeePopup").fadeOut("slow");
        },

        employeeHouseCodesLoaded: function(me, activeId) {
            if (me.houseCodes.length > 0) {
                $("#houseCodeText").val(me.houseCodes[0].name);
                parent.fin.appUI.houseCodeId = me.houseCodes[0].id;
                parent.fin.appUI.houseCodeBrief = me.houseCodes[0].brief;
                parent.fin.appUI.hirNode = me.houseCodes[0].hirNode;
                parent.fin.appUI.houseCodeTitle = me.houseCodes[0].name;
                me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
                me.houseCodeSearchTemplate.houseCodeTitleTemplate = parent.fin.appUI.houseCodeTitle;
            }
        },

        actionEmployeeCancelItem: function() {
            var me = this;

            me.employeeNumberPopup.setValue("");
            me.employeeNamePopup.setValue("");
            $("#EmployeePopup").fadeOut("slow");
        },

        getEmployeeAddress: function() {
            var me = this;

            if ($("#DeliveryToHomePopup")[0].checked) {
                var address = me.address1Popup.getValue() + ", ";
                address += (me.address2Popup.getValue() === "" ? "" : me.address2Popup.getValue() + ", ");
                address += me.cityPopup.getValue() + ", ";
                var index = ii.ajax.util.findIndexById(me.stateTypes[me.statePopup.indexSelected].id.toString(), me.stateTypes);
                if (index !== null)
                    address += me.stateTypes[index].name + ", ";
                address += me.postalCodePopup.getValue();
                return address;
            }
            else
                return "";
        },

        setUserInfo: function() {
            var me = this;

            me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = parent.fin.appUI.houseCodeTitle;
            me.requestorNamePopup.setValue(me.users[0].firstName + " " + me.users[0].lastName);
            me.requestorEmailPopup.setValue(me.users[0].email);
            me.requestorPhonePopup.setValue(me.users[0].homePhone);
            $("#houseCodeText").val(parent.fin.appUI.houseCodeTitle);
        },

        actionSearchItem: function() {
            var args = ii.args(arguments, {
                event: { type: Object }
            });
            var event = args.event;
            var me = event.data;

            if (event.keyCode === 13) {
                me.loadSearchResults();
            }
        },

        loadSearchResults: function() {
            var me = this;

            me.setLoadCount();
            me.resetControls("Display");
            me.payCheckRequestGrid.setData([]);
            me.wageTypeDetailGrid.setData([]);
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

			me.resetControls("Display");

			if (item.statusType === 2) {
                $("#AnchorResendRequest").show();
				$("#AnchorCancel").show();
                if (me.approveInProcess)
                    $("#AnchorApprove").show();
            }
			else if (item.statusType === 8) {
				$("#AnchorCancel").show();
			}
			else if (item.statusType === 9) {
				if (me.reExport)
                    $("#AnchorReExport").show();
			}
            else if (item.statusType === 10) {
                me.resizeControls();
                $("#AnchorResendRequest").show();
				$("#AnchorCancel").show();
            }

			if (me.reExport && (me.statusType.indexSelected === 0 || me.statuses[me.statusType.indexSelected].id === 9))
				$("#AnchorExport").show();

            $("#CheckRequestNumber").html(item.checkRequestNumber);
            me.houseCodeTitle.setValue(item.houseCodeTitle);
            me.requestedDate.setValue(item.requestedDate);
            me.deliveryDate.setValue(item.deliveryDate);
            me.employeeNumber.setValue(item.employeeNumber);
            me.employeeName.setValue(item.employeeName);
            me.reasonForRequest.setValue(item.reasonForRequest);
            $("input[name='TermRequest'][value='" + item.termRequest + "']").attr("checked", "checked");
            $("input[name='PaymentMethod'][value='" + item.paymentMethod + "']").attr("checked", "checked");
			if (item.paymentMethod === "Paper" || item.paymentMethod === "") {
				$("#DeliveryInfoContainer").show();
				if (item.upsDeliveryToUnit) {
					$("#UnitContainer").show();
					$("input[name='DeliveryTo'][value='" + item.upsDeliveryToUnit + "']").attr("checked", "checked");
					$("input[name='SaturdayDelivery'][value='" + item.saturdayDeliveryUnit + "']").attr("checked", "checked");
				}
				else if (item.upsDeliveryToHome) {
					$("#EmployeeContainer").show();
					$("input[name='DeliveryTo'][value='" + !item.upsDeliveryToHome + "']").attr("checked", "checked");
					$("input[name='SaturdayDelivery'][value='" + item.saturdayDeliveryHome + "']").attr("checked", "checked");
				}
			}
            me.terminationDate.setValue(item.terminationDate);
            me.unitTitle.setValue(item.deliveryHouseCodeTitle);
            me.unitAddress.setValue(item.houseCodeAddress);
            me.upsPackageAttentionTo.setValue(item.upsPackageAttentionTo);
            me.homeAddress.setValue(item.homeAddress);
            me.requestorName.setValue(item.requestorName);
            me.requestorEmail.setValue(item.requestorEmail);
            me.requestorPhone.setValue(item.requestorPhone);
            me.managerName.setValue(item.managerName);
            me.managerEmail.setValue(item.managerEmail);

			if (me.status !== "New")
				me.setLoadCount();

            me.wageTypeDetailStore.reset();
            me.wageTypeDetailStore.fetch("userId:[user],payCheckRequest:" + item.id, me.wageTypeDetailsLoaded, me);
        },

        wageTypeDetailsLoaded: function(me, activeId) {

            me.wageTypeDetailGrid.setData(me.wageTypeDetails);
            me.wageTypeDetailGrid.setHeight(150);
            me.calculateTotal();
			if (me.loadCount > 0)
            	me.checkLoadCount();
        },

        calculateTotal: function() {
            var me = this;
            var totalHours = 0;
            var totalEarnings = 0;

            for (var index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                totalHours += parseFloat(me.wageTypeDetailGrid.data[index].hours);
                totalEarnings += parseFloat(me.wageTypeDetailGrid.data[index].earnings);
            }

            $("#TotalHours").html(totalHours.toFixed(2));
            $("#TotalEarnings").html(totalEarnings.toFixed(2));
        },

        setDeliveryDate: function() {
            var me = this;
            var today = new Date(parent.fin.appUI.glbCurrentDate);
            var hours = today.getHours();
            var minutes = today.getMinutes();

            if (me.employee.statusType === 1) {
                if (hours < 12 && minutes < 59) {
                    today.setDate(today.getDate() + 1);
                    me.deliveryDatePopup.setValue((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
                }
                else {
                    today.setDate(today.getDate() + 2);
                    me.deliveryDatePopup.setValue((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
                }
            }
            else if (me.employee.statusType === 6 && hours < 16 && minutes < 59) {
                today.setDate(today.getDate() + 1);
                me.deliveryDatePopup.setValue((today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear());
            }
        },

        loadWageTypes: function() {
            var me  = this;
            var payCode = "";
			var index = 0;
            var hourly = me.employee.hourly;

            me.weekDays = [];
            me.weeklyWages = [];

            $("#selPCRowCount").empty();
            $("#tblWageHeader").empty();
            $("#spnGrandTotal").html("0.00");
            for (index = 1; index < 8; index++) {
                $("#spnGrandTotalDay" + index).html("0.00");
            }

            payCode += "<option value='0'></option>";
                for (index = 0; index < me.wageTypes.length; index++) {
                if (me.wageTypes[index].hourly && hourly)
                    payCode += "<option value=\"" + me.wageTypes[index].id + "\">" + me.wageTypes[index].brief + " - " + me.wageTypes[index].name + "</option>";
                 if (me.wageTypes[index].salary && !hourly)
                    payCode += "<option value=\"" + me.wageTypes[index].id + "\">" + me.wageTypes[index].brief + " - " + me.wageTypes[index].name + "</option>";
            }

            $("#selPCRowCount").html(payCode);
            me.weekDaysLoad(me.weeks[Number($("#selWeekType").val()) - 1], true);
            $("#trWageFooter0").after('<tr id="trLastRow" height="100%"><td id="tdLastRow" colspan="11" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>');
            me.addWageTypeRow(me.weekDays.length - 1, true);
        },

        addWeekDays: function() {
            var me = this;
            var found = false;
            var week = me.weeks[Number($("#selWeekType").val()) - 1];

            for (var index = 0; index < me.weekDays.length; index++) {
                if (me.weekDays[index].weekStartDate === week.weekStartDate) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                me.weekDaysLoad(me.weeks[Number($("#selWeekType").val()) - 1], false);
                me.addWageTypeRow(me.weekDays.length - 1, true);
            }
        },

        weekDaysLoad: function(week, append) {
            var me = this;
            var item = new fin.pay.payCheck.WeekDay();

            item.id = me.weekDays.length + 1;
            item.weekStartDate = week.weekStartDate;
            item.weekEndDate = week.weekEndDate;
            me.weekDays.push(item);

            for (var index = 0; index < 7; index++) {
                var date = new Date(week.weekStartDate);
                date.setDate(date.getDate() + index);
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = (month < 10) ? "0" + month : month;
                day = (day < 10) ? "0" + day : day;
                me.weekDays[me.weekDays.length - 1]["day" + (index + 1)] = month + "/" + day + "/" + year;
            }

            var weekRowIndex = me.weekDays.length - 1;
            var wageHeaderRow = $("#tblWageHeaderTemplate").html();
            wageHeaderRow = wageHeaderRow.replace(/RowCount/g, weekRowIndex);
            var wageFooterRow = $("#tblWageFooterTemplate").html();
            wageFooterRow = wageFooterRow.replace(/RowCount/g, weekRowIndex);

            if (append) {
                $("#tblWageHeader").append(wageHeaderRow);
                $("#trWageHeader0").after(wageFooterRow);
            }
            else {
                $("#trLastRow").before(wageHeaderRow);
                $("#trLastRow").before(wageFooterRow);
            }

            $("#weekDays" + weekRowIndex).html(me.weekDays[weekRowIndex].weekStartDate + " - " + me.weekDays[weekRowIndex].weekEndDate);
            $("#spnDay1" + weekRowIndex).html(me.weekDays[weekRowIndex].day1);
            $("#spnDay2" + weekRowIndex).html(me.weekDays[weekRowIndex].day2);
            $("#spnDay3" + weekRowIndex).html(me.weekDays[weekRowIndex].day3);
            $("#spnDay4" + weekRowIndex).html(me.weekDays[weekRowIndex].day4);
            $("#spnDay5" + weekRowIndex).html(me.weekDays[weekRowIndex].day5);
            $("#spnDay6" + weekRowIndex).html(me.weekDays[weekRowIndex].day6);
            $("#spnDay7" + weekRowIndex).html(me.weekDays[weekRowIndex].day7);
        },

        addWageTypeRow: function(headerIndex, add) {
            var me = this;
            var weeklyWage = {};
            var rowIndex = 0;

            weeklyWage.id = 0;
            weeklyWage.index = headerIndex;
            weeklyWage.payRate = 0;
            weeklyWage.wageType = null;
            weeklyWage.payCodeId = 0;
            weeklyWage.day1 = 0;
            weeklyWage.day2 = 0;
            weeklyWage.day3 = 0;
            weeklyWage.day4 = 0;
            weeklyWage.day5 = 0;
            weeklyWage.day6 = 0;
            weeklyWage.day7 = 0;
            weeklyWage.earnings = 0;
            weeklyWage.day1TransactionId = 0;
            weeklyWage.day2TransactionId = 0;
            weeklyWage.day3TransactionId = 0;
            weeklyWage.day4TransactionId = 0;
            weeklyWage.day5TransactionId = 0;
            weeklyWage.day6TransactionId = 0;
            weeklyWage.day7TransactionId = 0;
            weeklyWage.modified = false;
            me.weeklyWages.push(weeklyWage);
            var wageTypeIndex = me.weeklyWages.length - 1;

            for (var index = 0; index < me.weeklyWages.length; index++) {
                if (me.weeklyWages[index].index === headerIndex)
                    rowIndex++;
            }

            me.wageTypeRowBuild(weeklyWage, headerIndex, wageTypeIndex, add, rowIndex);
        },

        wageTypeRowBuild: function(weeklyWage, headerIndex, wageTypeIndex, showAdd, rowIndex) {
            var me = this;
            var wageRow = $("#tblWageDetailTemplate").html();

            if (showAdd)
                wageRow = wageRow.replace("ImageAdd", "<img id='imgAdd" + headerIndex + "'"
                    + " src='/fin/cmn/usr/media/Common/add.png' style='cursor: pointer' alt='Add Pay Code' title='Add Pay Code' />");
            else
                wageRow = wageRow.replace("ImageAdd", "&nbsp;&nbsp;&nbsp;&nbsp;");

            //wageRow = wageRow.replace("ImageDelete", "<img id='imgDelete" + wageTypeIndex + "'"
            //	+ " src='/fin/cmn/usr/media/Common/delete.png' style='cursor: pointer' alt='Delete Pay Code' title='Delete Pay Code' />");

            wageRow = wageRow.replace(/RowCount/g, wageTypeIndex);
            wageRow = wageRow.replace("RowStyle", ((rowIndex % 2) ? "alternateGridRow" : "gridRow"));
            wageRow = wageRow.replace("PayRateValue", weeklyWage.payRate);
            wageRow = wageRow.replace("D1Value", weeklyWage.day1);
            wageRow = wageRow.replace("D2Value", weeklyWage.day2);
            wageRow = wageRow.replace("D3Value", weeklyWage.day3);
            wageRow = wageRow.replace("D4Value", weeklyWage.day4);
            wageRow = wageRow.replace("D5Value", weeklyWage.day5);
            wageRow = wageRow.replace("D6Value", weeklyWage.day6);
            wageRow = wageRow.replace("D7Value", weeklyWage.day7);
            wageRow = wageRow.replace("EarningsValue", weeklyWage.earnings);

            if (showAdd) {
                $("#trWageHeader" + headerIndex).after(wageRow);
            }
            else {
                $("#trWageFooter" + (Number(headerIndex))).before(wageRow);
            }

            if (showAdd)
                $("#imgAdd" + headerIndex).bind("click", function() { me.addWageTypeRow(Number(this.id.replace("imgAdd", "")), false); });
            //$("#imgDelete" + wageTypeIndex).bind("click", function() { me.payCodeDelete(this.id.replace("imgDelete", "")); });
            $("#trPay" + wageTypeIndex + " select[id^=selPC]").bind("change", function() { me.wageTypeChange(this); });
            $("#trPay" + wageTypeIndex + " input[id^=txtPayRate]").bind("blur", function() { me.payRateBlur(this); });
            $("#trPay" + wageTypeIndex + " input[id^=txtD]").bind("blur", function() { me.hourBlur(this); });
            $("#trPay" + wageTypeIndex + " input[id^=txtEarnings]").bind("blur", function() { me.earningsBlur(this); });
            $("#trPay" + wageTypeIndex + " input[id^=txt]").keypress(function (e) {
                if (e.which !== 46 && e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57))
                    return false;
            });

            for (var index = 1; index < 8; index++) {
                $("#txtD" + index + wageTypeIndex).attr("disabled", true);
            }
            $("#txtPayRate" + wageTypeIndex).attr("disabled", true);
            $("#txtEarnings" + wageTypeIndex).attr("disabled", true);
        },

        getWageType: function(id) {
            var me = this;

            for (var index = 0; index < me.wageTypes.length; index++) {
                if (me.wageTypes[index].id === id)
                    return me.wageTypes[index];
            }
        },

        wageTypeChange: function(objSelect) {
            var me = this;
            var rowNumber = Number(objSelect.id.substr(5));
            var wageType = me.getWageType(Number(objSelect.value));
            var totalIndex = me.weeklyWages[rowNumber].index;
            var total = 0;

            $("#txtPayRate" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD1" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD2" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD3" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD4" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD5" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD6" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtD7" + rowNumber).attr("disabled", wageType.earnings);
            $("#txtEarnings" + rowNumber).attr("disabled", !wageType.earnings);

            if (wageType.earnings) {
                for (var index = 1; index < 8; index++) {
                    total = Number($("#spnTotalDay" + index + totalIndex).html()) - Number(me.weeklyWages[rowNumber]["day" + index]);
                    $("#spnTotalDay" + index + totalIndex).html(total.toFixed(2));
                    total = Number($("#spnGrandTotalDay" + index).html()) - Number(me.weeklyWages[rowNumber]["day" + index]);
                    $("#spnGrandTotalDay" + index).html(total.toFixed(2));
                    $("#txtD" + index + rowNumber).val("0");
                    me.weeklyWages[rowNumber]["day" + index] = 0;
                }
                total = Number($("#spnTotal" + totalIndex).html()) - Number($("#txtEarnings" + rowNumber).val());
                $("#spnTotal" + totalIndex).html(total.toFixed(2));
                total = Number($("#spnGrandTotal").html()) - Number($("#txtEarnings" + rowNumber).val());
                $("#spnGrandTotal").html(total.toFixed(2));
                $("#txtPayRate" + rowNumber).val("0");
                $("#txtEarnings" + rowNumber).val("0");
                me.weeklyWages[rowNumber].payRate = 0;
                me.weeklyWages[rowNumber].earnings = 0;
            }
            else {
                $("#txtPayRate" + rowNumber).val(me.employee.hourly ? me.employee.payRate : 0);
                $("#txtEarnings" + rowNumber).val("0");
                me.weeklyWages[rowNumber].payRate = (me.employee.hourly ? me.employee.payRate : 0);
                me.weeklyWages[rowNumber].earnings = 0;
            }

            if (Number(objSelect.value) !== me.weeklyWages[rowNumber].payCodeId) {
                me.weeklyWages[rowNumber].wageType = wageType;
                me.weeklyWages[rowNumber].payCodeId = Number(objSelect.value);
                me.weeklyWages[rowNumber].modified = true;
            }
        },

        payRateBlur: function(objInput) {
            var me = this;
            var rowCount = Number(objInput.id.substr(10));
            var weekTotal = 0;
            var total = 0;
            var grandTotal = 0;
            var totalIndex = 0;
            var hours = 0;

            //remove any unwanted characters
            objInput.value = objInput.value.replace(/[^0-9\.]/g, "");
            hours = Number(objInput.value);

            //make sure we have a change
            if (objInput.value === "" || objInput.value != me.weeklyWages[rowCount].payRate) {
                var wageType = me.getWageType(me.weeklyWages[rowCount].payCodeId);
                totalIndex = me.weeklyWages[rowCount].index;

                if (objInput.value === "" || hours <= 0 || hours > 99.99) {
                    $("#" + objInput.id).attr("title", "The value should be between 0 and 99.99.");
                    $("#" + objInput.id).addClass("invalid");
                    return;
                }
                else {
                    $("#" + objInput.id).attr("title", "");
                    $("#" + objInput.id).removeClass("invalid");
                }

                for (var index = 1; index < 8; index++) {
                    weekTotal += Number(me.weeklyWages[rowCount]["day" + index]);
                }

                me.weeklyWages[rowCount].payRate = Number(objInput.value);
                me.weeklyWages[rowCount].modified = true;

                if (!wageType.earnings) {
                    var totalEarnings = weekTotal * parseFloat($("#txtPayRate" + rowCount).val());
                    total = Number($("#spnTotal" + totalIndex).html()) - Number($("#txtEarnings" + rowCount).val()) + Number(totalEarnings);
                    grandTotal = Number($("#spnGrandTotal").html()) - Number($("#txtEarnings" + rowCount).val()) + Number(totalEarnings);
                    $("#txtEarnings" + rowCount).val(totalEarnings.toFixed(2));
                    $("#spnTotal" + totalIndex).html(total.toFixed(2));
                    $("#spnGrandTotal").html(grandTotal.toFixed(2));
                }
            }
        },

        earningsBlur: function(objInput) {
            var me = this;
            var rowCount = Number(objInput.id.substr(11));
            var total = 0;
            var grandTotal = 0;
            var totalIndex = 0;

            //remove any unwanted characters
            objInput.value = objInput.value.replace(/[^0-9\.]/g, "");

            //make sure we have a change
            if (objInput.value === "" || objInput.value != me.weeklyWages[rowCount].earnings) {
                var wageType = me.getWageType(me.weeklyWages[rowCount].payCodeId);
                totalIndex = me.weeklyWages[rowCount].index;

                if (objInput.value === "" || Number(objInput.value) <= 0 || !(/^\d{0,8}(\.\d{1,2})?$/.test(objInput.value))) {
                    $("#" + objInput.id).attr("title", "Please enter valid number.");
                    $("#" + objInput.id).addClass("invalid");
                    return;
                }
                else {
                    $("#" + objInput.id).attr("title", "");
                    $("#" + objInput.id).removeClass("invalid");
                }

                if (wageType.earnings) {
                    total = Number($("#spnTotal" + totalIndex).html()) - Number(me.weeklyWages[rowCount].earnings) + Number($("#txtEarnings" + rowCount).val());
                    grandTotal = Number($("#spnGrandTotal").html()) - Number(me.weeklyWages[rowCount].earnings) + Number($("#txtEarnings" + rowCount).val());
                    $("#spnTotal" + totalIndex).html(total.toFixed(2));
                    $("#spnGrandTotal").html(grandTotal.toFixed(2));
                }

                me.weeklyWages[rowCount].earnings = Number(objInput.value);
                me.weeklyWages[rowCount].modified = true;
            }
        },

        hourBlur: function(objInput) {
            var me = this;
            var DayNumber = objInput.id.substr(4, 1);
            var rowCount = Number(objInput.id.substr(5));
            var weekTotal = 0;
            var dayTotal = 0;
            var dayGrandTotal = 0;
            var total = 0;
            var grandTotal = 0;
            var totalIndex = 0;
            var hours = 0;

            //remove any unwanted characters
            objInput.value = objInput.value.replace(/[^0-9\.]/g, "");
            hours = Number(objInput.value);

            //make sure we have a change
            if (objInput.value === "" || objInput.value != me.weeklyWages[rowCount]["day" + DayNumber]) {
                totalIndex = me.weeklyWages[rowCount].index;

                if (objInput.value === "" || hours < 0 || hours > 24) {
                    $("#" + objInput.id).attr("title", "The value should be between 0 and 24.");
                    $("#" + objInput.id).addClass("invalid");
                    return;
                }
                else {
                    $("#" + objInput.id).attr("title", "");
                    $("#" + objInput.id).removeClass("invalid");
                }

                for (var index = 1; index < 8; index++) {
                    weekTotal += Number(me.weeklyWages[rowCount]["day" + index]);
                }

                weekTotal = weekTotal - Number(me.weeklyWages[rowCount]["day" + DayNumber]) + hours;
                dayTotal = Number($("#spnTotalDay" + DayNumber + totalIndex).html()) - Number(me.weeklyWages[rowCount]["day" + DayNumber]) + hours;
                dayGrandTotal = Number($("#spnGrandTotalDay" + DayNumber).html()) - Number(me.weeklyWages[rowCount]["day" + DayNumber]) + hours;
                var weeklyTotal = weekTotal * parseFloat($("#txtPayRate" + rowCount).val());
                total = Number($("#spnTotal" + totalIndex).html()) - Number($("#txtEarnings" + rowCount).val()) + Number(weeklyTotal);
                grandTotal = Number($("#spnGrandTotal").html()) - Number($("#txtEarnings" + rowCount).val()) + Number(weeklyTotal);
                $("#txtEarnings" + rowCount).val(weeklyTotal.toFixed(2));
                $("#spnTotalDay" + DayNumber + totalIndex).html(dayTotal.toFixed(2));
                $("#spnTotal" + totalIndex).html(total.toFixed(2));
                $("#spnGrandTotalDay" + DayNumber).html(dayGrandTotal.toFixed(2));
                $("#spnGrandTotal").html(grandTotal.toFixed(2));

                me.weeklyWages[rowCount]["day" + DayNumber] = hours;
                me.weeklyWages[rowCount].modified = true;
            }
            else {
                $("#" + objInput.id).attr("title", "");
                $("#" + objInput.id).removeClass("invalid");
            }
        },

        actionNewItem: function() {
            var me = this;

            $("#EmployeeInfo").hide();
            $("#RequestInfo").hide();
            $("#PaymentInfo").hide();
            $("#WageInfo").hide();
            $("#RequestorInfo").hide();
            $("#selWeekType").attr("value", me.weeks[0].id);
            me.employee = null;
            me.personId = 0;
            me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
            me.houseCodeSearchTemplate.houseCodeTitleTemplate = parent.fin.appUI.houseCodeTitle;
            me.wizardCount = 1;
			me.status = "New";
            me.resetControls("New");
            me.setReadOnly(false);
            me.loadPopup("checkRequestPopup");
            me.modified(false);
            me.setStatus("Loaded");
            me.actionShowWizard();
        },

        actionPrevItem: function() {
            var me = this;

            me.wizardCount--;
            me.actionShowWizard();
            me.validator.reset();
        },

        actionNextItem: function() {
            var me = this;

            if (!me.validateCheckRequest()) {
                return;
            }

            me.wizardCount++;
            me.actionShowWizard();
            me.validator.reset();
        },

        actionShowWizard: function() {
            var me = this;

            if (me.wizardCount === 1) {
                $("#EmployeeInfo").show();
                $("#RequestInfo").hide();
                $("#Header").text("Check Request - New");
            }
            else if (me.wizardCount === 2) {
                $("#EmployeeInfo").hide();
                $("#RequestInfo").show();
                $("#PaymentInfo").hide();
                $("#AnchorPrev").hide();
            }
            else if (me.wizardCount === 3) {
                $("#RequestInfo").hide();
                $("#PaymentInfo").show();
                $("#WageInfo").hide();
                $("#AnchorPrev").show();
            }
            else if (me.wizardCount === 4) {
                var divWageHeight = $(window).height() - 270;
                $("#PaymentInfo").hide();
                $("#WageInfo").show();
                $("#RequestorInfo").hide();
                $("#divWage").css({"height" : divWageHeight + "px"});
                $("#imgWeekDaysAdd").show();
                $("#tblWageHeader img[id^=img]").show();
                $("#tblWageHeader select[id^=sel]").attr("disabled", false);
                for (var index = 0; index < me.weeklyWages.length; index++) {
                    if (Number(me.weeklyWages[index].payCodeId) > 0) {
                        var wageType = me.getWageType(Number(me.weeklyWages[index].payCodeId));
                        $("#txtPayRate" + index).attr("disabled", wageType.earnings);
                        $("#txtD1" + index).attr("disabled", wageType.earnings);
                        $("#txtD2" + index).attr("disabled", wageType.earnings);
                        $("#txtD3" + index).attr("disabled", wageType.earnings);
                        $("#txtD4" + index).attr("disabled", wageType.earnings);
                        $("#txtD5" + index).attr("disabled", wageType.earnings);
                        $("#txtD6" + index).attr("disabled", wageType.earnings);
                        $("#txtD7" + index).attr("disabled", wageType.earnings);
                        $("#txtEarnings" + index).attr("disabled", !wageType.earnings);
                    }
                }
            }
            else if (me.wizardCount === 5) {
                $("#EmployeeInfo").hide();
                $("#RequestInfo").hide();
                $("#PaymentInfo").hide();
                $("#WageInfo").hide();
                $("#RequestorInfo").show();
                $("#AnchorNext").show();
                $("#AnchorSendRequest").hide();
                me.setReadOnly(false);
            }
            else if (me.wizardCount === 6) {
                var divWageHeight = 50 * me.weekDays.length + 21 * me.weeklyWages.length + 50;
                $("#divWage").css({"height" : divWageHeight + "px"});
                $("#EmployeeInfo").show();
                $("#RequestInfo").show();
                $("#PaymentInfo").show();
                $("#WageInfo").show();
                $("#AnchorNext").hide();
                $("#AnchorSendRequest").show();
                $("#imgWeekDaysAdd").hide();
                $("#tblWageHeader img[id^=img]").hide();
                $("#tblWageHeader input[id^=txt]").attr("disabled", true);
                $("#tblWageHeader select[id^=sel]").attr("disabled", true);
                me.setReadOnly(true);
            }

            me.resizeControls();
        },

        validateCheckRequest: function() {
            var me = this;
            var valid = true;

            if (me.wizardCount === 1) {
                if (!me.employeeNumberPopup.validate(true) || !me.employeeNamePopup.validate(true) || me.employee === null || me.employees.length === 0 || parent.fin.appUI.houseCodeId === 0 || parent.fin.appUI.houseCodeTitle === "") {
                    alert("In order to continue, the errors on the page must be corrected.");	
                    return false;
                }
                else
                    return true;
            }
            else if (me.wizardCount === 2) {
                if (!me.reasonForRequestPopup.validate(true) || !me.terminationDatePopup.validate(true)){
                    alert("In order to continue, the errors on the page must be corrected.");
                    return false;
                }
                else
                    return true;

            }
            else if (me.wizardCount === 3) {
                if ($("input[name='PaymentMethodPopup']:checked").val() === "Electronic")
                    return true;
                else if ($("input[name='PaymentMethodPopup']:checked").val() === "Paper") {
                    if ($("input[name='DeliveryToPopup']:checked").val() === "true") {
                        if (me.houseCodeSearchTemplate.houseCodeIdTemplate === 0) {
                            alert("Please select the Unit (Cost Center).");
                            return false;
                        }
                        else if (!me.unitAddressPopup.validate(true) || !me.upsPackageAttentionToPopup.validate(true)) {
                            alert("In order to continue, the errors on the page must be corrected.");
                            return false;
                        }
                        else
                            return true;
                    }
                    else if ($("input[name='DeliveryToPopup']:checked").val() === "false") {
                        if (!me.firstNamePopup.validate(true) || !me.lastNamePopup.validate(true) || !me.address1Popup.validate(true) || !me.cityPopup.validate(true) || !me.statePopup.validate(true) || !me.postalCodePopup.validate(true)) {
                            alert("In order to continue, the errors on the page must be corrected.");
                            return false;
                        }
                        else
                            return true;
                    }
                    else {
                        alert("Please select one pay check delivery location: Unit or Employee Home.");
                        return false;
                    }
                }
                else {
                    alert("Please select one Payment Method: Electronic Pay or Paper Check.");
                    return false;
                }
            }
            else if (me.wizardCount === 4) {
                for (var index = 0; index < me.weeklyWages.length; index++) {
                    if (me.weeklyWages[index].payCodeId > 0) {
                        var wageType = me.getWageType(me.weeklyWages[index].payCodeId);
                        if (wageType.earnings) {
                            if (Number($("#txtEarnings" + index).val()) <= 0)
                                valid = false;
                        }
                        else {
                            if (Number($("#txtPayRate" + index).val()) <= 0)
                                valid = false;
                            else if ((Number($("#txtD1" + index).val()) <= 0) && (Number($("#txtD2" + index).val()) <= 0) && (Number($("#txtD3" + index).val()) <= 0) && (Number($("#txtD4" + index).val()) <= 0)
                                && (Number($("#txtD5" + index).val()) <= 0) && (Number($("#txtD6" + index).val()) <= 0) && (Number($("#txtD7" + index).val()) <= 0))
                            valid = false;
                        }
                    }
                    else if (me.weeklyWages.length === 1) {
                        alert("Please add at least one Wage Type details.");
                        return false;
                    }
                }

                if (!valid)
                    alert("Please enter all nencessary Wage Type details.")
                return valid;
            }
            else if (me.wizardCount === 5) {
                if (!me.requestorNamePopup.validate(true) || !me.requestorEmailPopup.validate(true) || !me.requestorPhonePopup.validate(true) || !me.managerNamePopup.validate(true) || !me.managerEmailPopup.validate(true)) {
                    alert("In order to continue, the errors on the page must be corrected.");
                    return false;
                }
                else
                    return true;
            }
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

        actionReExport: function () {
            var me = this;

            if (confirm("The selected check request will be exported again during export process. Are you sure you want to continue?")) {
                me.status = "ReExport";
                me.actionSaveItem();
            }
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
            me.hidePopup("checkRequestPopup");
            me.actionSaveItem();
        },

        actionPopupCancelItem: function() {
            var me = this;

            me.hidePopup("checkRequestPopup");
            $("#pageLoading").fadeOut("slow");
        },

		actionClickItem: function(objCheckBox) {
			var me = this;
			var index = parseInt(objCheckBox.id.replace("assignInputCheck", ""), 10);

			me.payCheckRequests[index].assigned = objCheckBox.checked;
		},

		actionExportItem: function() {
			var me = this;
			var selectedIds = "";

			for (var index = 0; index < me.payCheckRequests.length; index++) {
				if (me.payCheckRequests[index].assigned)
					selectedIds +=  me.payCheckRequests[index].id + "~";
			}

			if (selectedIds !== "") {
				$("#messageToUser").text("Exporting");
				$("#pageLoading").fadeIn("slow");
				me.setStatus("Exporting");
				me.fileNameStore.reset();
				me.fileNameStore.fetch("userId:[user],checkRequestIds:" + selectedIds, me.fileNamesLoaded, me);
			}
		},

        fileNamesLoaded: function(me, activeId) {

            me.setStatus("Exported");
			$("#pageLoading").fadeOut("slow");
            if (me.fileNames.length === 1 && me.fileNames[0].fileName !== "") {
                $("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
                $("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
            }

			for (var index = 0; index < me.payCheckRequests.length; index++) {
				if (me.payCheckRequests[index].assigned) {
					me.payCheckRequests[index].assigned = false;
					$("#assignInputCheck" + index)[0].checked = false;
				}
			}
        },

        actionWageTypeTotalItem: function() {
            var me = this;
            var item = [];
            var wageTypeTotalsTemp = [];
            var wageTypeTotals = [];
            var index = 0;
            var payCodeId = 0;
            var totalHours = 0;
            var totalEarnings = 0;
            var wageTypeTotalHours = 0;
            var wageTypeTotalEarnings = 0;

            for (index = 0; index < me.wageTypeDetailGrid.data.length; index++) {
                item = new fin.pay.payCheck.WageTypeTotal(me.wageTypeDetailGrid.data[index].payCode.id
                                                            , me.wageTypeDetailGrid.data[index].payCode.brief + " - " + me.wageTypeDetailGrid.data[index].payCode.name
                                                            , (me.wageTypeDetailGrid.data[index].hours === "" ? 0.00 : parseFloat(me.wageTypeDetailGrid.data[index].hours))
                                                            , (me.wageTypeDetailGrid.data[index].earnings === "" ? 0.00 : parseFloat(me.wageTypeDetailGrid.data[index].earnings))
                                                            );
                wageTypeTotalsTemp.push(item);
            }

            wageTypeTotalsTemp.sort(me.customSort);

            for (index = 0; index < wageTypeTotalsTemp.length; index++) {
                if (payCodeId !== wageTypeTotalsTemp[index].id) {
                    if (payCodeId !== 0) {
                        item = new fin.pay.payCheck.WageTypeTotal(payCodeId, wageTypeTotalsTemp[index - 1].title, totalHours, totalEarnings);
                        wageTypeTotals.push(item);
                    }

                    payCodeId = wageTypeTotalsTemp[index].id;
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
                item = new fin.pay.payCheck.WageTypeTotal(payCodeId, wageTypeTotalsTemp[wageTypeTotalsTemp.length - 1].title, totalHours, totalEarnings);
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
            if (a.id > b.id)
                return 1;
            if (a.id < b.id)
                return -1;
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

            if (me.status === "New") {
                item = new fin.pay.payCheck.PayCheckRequest(
                    id
                    , 2
                    , parent.fin.appUI.houseCodeId
                    , parent.fin.appUI.houseCodeTitle
                    , $("#CheckRequestNumber").html()
                    , me.currentDate()
                    , me.deliveryDatePopup.lastBlurValue
                    , me.employeeNumberPopup.getValue()
                    , me.employeeNamePopup.getValue()
                    , me.reasonForRequestPopup.getValue()
                    , $("input[name='TermRequestPopup']:checked").val() === "true" ? true : false
                    , $("input[name='TermRequestPopup']:checked").val() === "true" ? me.terminationDatePopup.lastBlurValue : ""
                    , $("input[name='PaymentMethodPopup']:checked").val()
                    , $("input[name='DeliveryToPopup']:checked").val() === "true" ? true : false
                    , $("input[name='SaturdayDeliveryPopup']:checked").val() === "true" ? true : false
                    , $("input[name='DeliveryToPopup']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeIdTemplate : 0
                    , $("input[name='DeliveryToPopup']:checked").val() === "true" ? me.houseCodeSearchTemplate.houseCodeTitleTemplate : ""
                    , $("input[name='DeliveryToPopup']:checked").val() === "true" ? me.unitAddressPopup.getValue() : ""
                    , $("input[name='DeliveryToPopup']:checked").val() === "true" ? me.upsPackageAttentionToPopup.getValue() : ""
                    , $("input[name='DeliveryToPopup']:checked").val() === "false" ? true : false
                    , $("input[name='SaturdayDeliveryPopup']:checked").val() === "true" ? true : false
                    , $("input[name='DeliveryToPopup']:checked").val() === "false" ? me.getEmployeeAddress() : ""
                    , me.requestorNamePopup.getValue()
                    , me.requestorEmailPopup.getValue()
                    , fin.cmn.text.mask.phone(me.requestorPhonePopup.getValue(), true)
                    , me.managerNamePopup.getValue()
                    , me.managerEmailPopup.getValue()
                    );
            }
            else {
                if (me.payCheckRequestGrid.activeRowIndex >= 0)
                    id = me.payCheckRequestGrid.data[me.payCheckRequestGrid.activeRowIndex].id;
                    item = me.payCheckRequestGrid.data[me.payCheckRequestGrid.activeRowIndex];
            }

            xml = me.saveXmlBuildItem(item);

            if (xml === "")
                return true;

			if (me.status === "CheckRequest" || me.status === "CheckRequestResend")
            	me.setStatus("Sending");
			else
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
            var index = 0;
            var xml = "";

			if (me.status === "New") {
                xml += '<payCheckRequest';
                xml += ' id="' + item.id + '"';
                xml += ' houseCodeId="' + item.houseCodeId + '"';
                xml += ' personId="' + me.personId + '"';
				xml += ' employeeId="' + me.employee.employeeId + '"';
                xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
                xml += ' checkRequestNumber="' + item.checkRequestNumber + '"';
                xml += ' requestedDate="' + item.requestedDate + '"';
                xml += ' deliveryDate="' + item.deliveryDate + '"';
                xml += ' employeeNumber="' + item.employeeNumber + '"';
                xml += ' employeeName="' + ui.cmn.text.xml.encode(item.employeeName) + '"';
                xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
                xml += ' termRequest="' + item.termRequest + '"';
                xml += ' terminationDate="' + item.terminationDate + '"';
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
                xml += ' firstName="' + ui.cmn.text.xml.encode(me.firstNamePopup.getValue()) + '"';
                xml += ' middleInitial="' + ui.cmn.text.xml.encode(me.middleInitialPopup.getValue()) + '"';
                xml += ' lastName="' + ui.cmn.text.xml.encode(me.lastNamePopup.getValue()) + '"';
                xml += ' address1="' + ui.cmn.text.xml.encode(me.address1Popup.getValue()) + '"';
                xml += ' address2="' + ui.cmn.text.xml.encode(me.address2Popup.getValue()) + '"';
                xml += ' city="' + ui.cmn.text.xml.encode(me.cityPopup.getValue()) + '"';
                xml += ' stateType="' + (me.statePopup.indexSelected !== -1 ? me.stateTypes[me.statePopup.indexSelected].id : 0) + '"';
                xml += ' postalCode="' + me.postalCodePopup.getValue() + '"';
                xml += '/>';

                for (index = 0; index < me.weeklyWages.length; index++) {
                    var weeklyIndex = me.weeklyWages[index].index;
                    var wageType = me.getWageType(me.weeklyWages[index].payCodeId);

                    if (Number($("#selPC" + index).val()) > 0) {
                        if (wageType.earnings) {
                            xml += '<payCheckRequestWageType';
                            xml += ' id="' + me.weeklyWages[index]["day2TransactionId"] + '"';
                            xml += ' payCheckRequestId="' + item.id + '"';
                            xml += ' payCodeId="' + $("#selPC" + index).val() + '"';
                            xml += ' payRate="0"';
                            xml += ' date="' + ui.cmn.text.date.format(new Date(me.weekDays[weeklyIndex]["day2"]), "mm/dd/yyyy") + '"';
                            xml += ' hours="0"';
                            xml += ' earnings="' + $("#txtEarnings" + index).val() + '"';
                            xml += '/>';
                        }
                        else {
                            for (var iIndex = 1; iIndex <= 7; iIndex++) {
                                if (Number($("#txtD" + iIndex + "" + index).val()) > 0) {
                                    xml += '<payCheckRequestWageType';
                                    xml += ' id="' + me.weeklyWages[index]["day" + iIndex + "TransactionId"] + '"';
                                    xml += ' payCheckRequestId="' + item.id + '"';
                                    xml += ' payCodeId="' + $("#selPC" + index).val() + '"';
                                    xml += ' payRate="' + $("#txtPayRate" + index).val() + '"';
                                    xml += ' date="' + ui.cmn.text.date.format(new Date(me.weekDays[weeklyIndex]["day" + iIndex]), "mm/dd/yyyy") + '"';
                                    xml += ' hours="' + $("#txtD" + iIndex + "" + index).val() + '"';
                                    xml += ' earnings="0"';
                                    xml += '/>';
                                }
                            }
                        }
                    }
                }
            }
            else if (me.status === "ReExport") {
                xml += '<payCheckRequestStatus';
                xml += ' id="' + item.id + '"';
                xml += ' transactionStatusType="8"';
                xml += '/>';
            }
            else {
                xml += '<payCheckRequestNotification';
				xml += ' id="' + item.id + '"';
                xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
                xml += ' checkRequestNumber="' + item.checkRequestNumber + '"';
                xml += ' requestedDate="' + item.requestedDate + '"';
                xml += ' deliveryDate="' + item.deliveryDate + '"';
                xml += ' employeeNumber="' + item.employeeNumber + '"';
                xml += ' employeeName="' + ui.cmn.text.xml.encode(item.employeeName) + '"';
                xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
                xml += ' termRequest="' + item.termRequest + '"';
                xml += ' terminationDate="' + item.terminationDate + '"';
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
                xml += ' action="' + me.status + '"';
                xml += '/>';

				if (me.status === "CheckRequestResend") {
					xml += '<payCheckRequestStatus';
                    xml += ' id="' + item.id + '"';
                    xml += ' transactionStatusType="2"';
                    xml += '/>';
				}
                else if (me.status === "CheckRequestCancel") {
                    xml += '<payCheckRequestStatus';
                    xml += ' id="' + item.id + '"';
                    xml += ' transactionStatusType="6"';
                    xml += '/>';
                }
                else if (me.status === "CheckRequestApprove") {
                    xml += '<payCheckRequestStatus';
                    xml += ' id="' + item.id + '"';
                    xml += ' transactionStatusType="8"';
                    xml += '/>';
                }
            }

            return xml;
        },

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
                    if (this.tagName === "payPayCheckRequest") {
                        if (me.status === "New") {
							me.resetControls("Display");
                            item.id = parseInt($(this).attr("id"), 10);;
                            item.checkRequestNumber = $(this).attr("checkRequestNumber");
                            me.payCheckRequests.unshift(item);
                            me.payCheckRequestGrid.setData(me.payCheckRequests);
                            me.payCheckRequestGrid.body.select(0);
                        }
						else if (me.status === "CheckRequest") {
                            alert("Payroll check request sent successfully.");
							me.status = "";
                        }
                        else if (me.status === "CheckRequestResend") {
                            alert("Payroll check request resent successfully.");
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
                        else if (me.status === "ReExport") {
                            alert("Payroll check request status updated successfully.");
                            $("#AnchorReExport").hide();
                            me.resetGrid();
                        }

						return false;
                    }
                });

				if (me.status === "New") {
					me.status = "CheckRequest";
					me.actionSaveItem();
				}
				else if (me.status === "CheckRequestResend")
					me.setStatus("Sent");
				else {
					me.modified(false);
                	me.setStatus("Saved");
				}
            }
            else {
                me.setStatus("Error");
                alert("[SAVE FAILURE] Error while sending the payroll check request: " + $(args.xmlNode).attr("message"));
            }

			if (me.status !== "CheckRequest") {
				me.status = "";
				$("#pageLoading").fadeOut("slow");
			}
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
            var windowWidth = document.documentElement.clientWidth;
            var windowHeight = document.documentElement.clientHeight;
            var popupWidth = windowWidth - 100;
            var popupHeight = windowHeight - 100;

            if (id === "WageTypeTotalPopup") {
                popupWidth = $("#" + id).width();
                popupHeight = $("#" + id).height();

                $("#" + id).css({
                    "width": popupWidth,
                    "height": popupHeight,
                    "top": windowHeight / 2 - popupHeight / 2 + $(window).scrollTop(),
                    "left": windowWidth / 2 - popupWidth / 2 + $(window).scrollLeft()
                });
            }
            else if (id === "EmployeePopup") {
                $("#EmployeePopup").css({
                    "width": popupWidth,
                    "height": popupHeight,
                    "top": (windowHeight/2 - popupHeight/2) + document.documentElement.scrollTop,
                    "left": windowWidth / 2 - popupWidth / 2
                });
            }
            else if (id === "checkRequestPopup") {
                $("#checkRequestPopup, #popupLoading").css({
                    "width": popupWidth,
                    "height": popupHeight,
                    "top": (windowHeight/2 - popupHeight/2) + document.documentElement.scrollTop,
                    "left": windowWidth/2 - popupWidth/2
                });
            }

            $("#backgroundPopup").css({
                "height": windowHeight + 100
            });
        }
    }
});

function main() {
    fin.payCheckUi = new fin.pay.payCheck.UserInterface();
    fin.payCheckUi.resize();
    fin.houseCodeSearchUi = fin.payCheckUi;
}
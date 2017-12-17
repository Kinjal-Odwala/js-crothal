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
ii.Style( "fin.cmn.usr.tabs", 9);

ii.Class({
    Name: "fin.hcm.job.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {

		init: function() {
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

			if (!parent.fin.appUI.houseCodeId)
				parent.fin.appUI.houseCodeId = 0;
			if (!parent.fin.appUI.hirNode)
				parent.fin.appUI.hirNode = 0;

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

			if (parent.fin.appUI.houseCodeId === 0)
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			$("#JobTemplateDiv").hide();
			$("#TaxIdDiv").hide();
			$("#OverrideSiteTaxDiv").hide();
			$("#CPIContainer").hide();
			$("#SearchInput").bind("keydown", me, me.actionSearchItem);

			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = document.activeElement;

					if (focusedControl.type !== undefined && (focusedControl.type === "text" || focusedControl.type === "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid())
					return false;
				else {
					var tabIndex = 0;
					if (this.id === "JobDetails")
						tabIndex = 1;
					else if (this.id === "JobAssociations")
						tabIndex = 2;

					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}
			});

			$("#TabCollection a").click(function() {
				switch(this.id) {
					case "JobDetails":
						me.activeFrameId = 0;
						if (me.status === "" && me.jobsList[me.lastSelectedRowIndex] !== undefined)
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

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			me.jobsShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.jobsWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.jobsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			//j=Jobs
			me.jJobNumberShow = me.isCtrlVisible(me.authorizePath + "\\JobNumber", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jTitleShow = me.isCtrlVisible(me.authorizePath + "\\Title", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jContactNameShow = me.isCtrlVisible(me.authorizePath + "\\ContactName", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jContactPhoneShow = me.isCtrlVisible(me.authorizePath + "\\ContactPhone", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jAddress1Show = me.isCtrlVisible(me.authorizePath + "\\Address1", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jAddress2Show = me.isCtrlVisible(me.authorizePath + "\\Address2", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jPostalCodeShow = me.isCtrlVisible(me.authorizePath + "\\PostalCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jGEOCodeShow = me.isCtrlVisible(me.authorizePath + "\\GEOCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCityShow = me.isCtrlVisible(me.authorizePath + "\\City", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCountyShow = me.isCtrlVisible(me.authorizePath + "\\County", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jStateShow = me.isCtrlVisible(me.authorizePath + "\\State", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCountryShow = me.isCtrlVisible(me.authorizePath + "\\Country", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jIndustryShow = me.isCtrlVisible(me.authorizePath + "\\Industry", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jPaymentTermShow = me.isCtrlVisible(me.authorizePath + "\\PaymentTerm", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jJobTypeShow = me.isCtrlVisible(me.authorizePath + "\\JobType", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jInvoiceTemplateShow = me.isCtrlVisible(me.authorizePath + "\\InvoiceTemplate", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCustomerNameShow = me.isCtrlVisible(me.authorizePath + "\\CustomerName", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCustomerPhoneShow = me.isCtrlVisible(me.authorizePath + "\\CustomerPhone", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jTaxIdShow = me.isCtrlVisible(me.authorizePath + "\\TaxId", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jOverrideSiteTaxShow = me.isCtrlVisible(me.authorizePath + "\\OverrideSiteTax", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jServiceContractShow = me.isCtrlVisible(me.authorizePath + "\\ServiceContract", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jGeneralLocationCodeShow = me.isCtrlVisible(me.authorizePath + "\\GeneralLocationCode", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jBOLSReportTypeShow = me.isCtrlVisible(me.authorizePath + "\\BOLSReportType", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCPIPercentageShow = me.isCtrlVisible(me.authorizePath + "\\CPIPercentage", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCPIAmountShow = me.isCtrlVisible(me.authorizePath + "\\CPIAmount", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCPIDateShow = me.isCtrlVisible(me.authorizePath + "\\CPIDate", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jCPIECIWaivedShow = me.isCtrlVisible(me.authorizePath + "\\CPIECIWaived", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));
			me.jActiveShow = me.isCtrlVisible(me.authorizePath + "\\Active", me.jobsShow, (me.jobsWrite || me.jobsReadOnly));

			me.jJobNumberReadOnly = true;
			me.jTitleReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Title\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jContactNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\ContactName\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jContactPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\ContactPhone\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jAddress1ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Address1\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jAddress2ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Address2\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jPostalCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\PostalCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jGEOCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\GEOCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\City\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCountyReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\County\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\State\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCountryReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Country\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jIndustryReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\Industry\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jPaymentTermReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\PaymentTerm\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jJobTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\JobType\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jInvoiceTemplateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\InvoiceTemplate\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCustomerNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CustomerName\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCustomerPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CustomerPhone\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jTaxIdReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TaxId\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jOverrideSiteTaxReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\OverrideSiteTax\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jServiceContractReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\ServiceContract\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jGeneralLocationCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\GeneralLocationCode\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jBOLSReportTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CPIPercentage\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCPIPercentageReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CPIPercentage\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCPIAmountReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CPIAmount\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCPIDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CPIDate\\Read", me.jobsWrite, me.jobsReadOnly);
			me.jCPIECIWaivedReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\CPIECIWaived\\Read", me.jobsWrite, me.jobsReadOnly);
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
				me.loadCount = 4;
				me.state.fetchingData();
				me.country.fetchingData();
				me.industry.fetchingData();
				me.jobType.fetchingData();
				me.invoiceTemplate.fetchingData();
				me.countryTypeStore.fetch("userId:[user]", me.countryTypesLoaded, me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.invoiceTemplateStore.fetch("userId:[user]", me.invoiceTemplatesLoaded, me);
				me.jobMasterStore.fetch("userId:[user]", me.jobMastersLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		isCtrlVisible: function() {
			var args = ii.args(arguments, {
				path: {type: String},
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

		isCtrlReadOnly: function() {
			var args = ii.args(arguments, {
				path: {type: String},
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});
			var me = this;

			if (args.sectionWrite && !me.jobsReadOnly)
				return false;
			if (me.jobsWrite)
				return false;
			if (me.jobsReadOnly)
				return true;
			if (args.sectionReadOnly)
				return true;

			return me.authorizer.isAuthorized(args.path);
		},

		resetUIElements: function() {
			var me = this;

			me.setControlState("JobNumber", me.jJobNumberReadOnly, me.jJobNumberShow);
			me.setControlState("Title", me.jTitleReadOnly, me.jTitleShow);
			me.setControlState("ContactName", me.jContactNameReadOnly, me.jContactNameShow);
			me.setControlState("ContactPhone", me.jContactPhoneReadOnly, me.jContactPhoneShow);
			me.setControlState("Address1", me.jAddress1ReadOnly, me.jAddress1Show);
			me.setControlState("Address2", me.jAddress2ReadOnly, me.jAddress2Show);
			me.setControlState("PostalCode", me.jPostalCodeReadOnly, me.jPostalCodeShow);
			me.setControlState("GEOCode", me.jGEOCodeReadOnly, me.jGEOCodeShow);
			me.setControlState("City", me.jCityReadOnly, me.jCityShow);
			me.setControlState("County", me.jCountyReadOnly, me.jCountyShow);
			me.setControlState("State", me.jCityReadOnly, me.jCityShow);
			me.setControlState("Country", me.jCountryReadOnly, me.jCountryShow);
			me.setControlState("Industry", me.jIndustryReadOnly, me.jIndustryShow);
			me.setControlState("PaymentTerm", me.jPaymentTermReadOnly, me.jPaymentTermShow);
			me.setControlState("JobType", me.jJobTypeReadOnly, me.jJobTypeShow);
			me.setControlState("InvoiceTemplate", me.jInvoiceTemplateReadOnly, me.jInvoiceTemplateShow);
			me.setControlState("CustomerName", me.jCustomerNameReadOnly, me.jCustomerNameShow);
			me.setControlState("CustomerPhone", me.jCustomerPhoneReadOnly, me.jCustomerPhoneShow);
			me.setControlState("TaxId", me.jTaxIdReadOnly, me.jTaxIdShow);
			me.setControlState("OverrideSiteTax", me.jOverrideSiteTaxReadOnly, me.jOverrideSiteTaxShow, "Check", "InputTextAreaRight");
			me.setControlState("ServiceContract", me.jServiceContractReadOnly, me.jServiceContractShow);
			me.setControlState("GeneralLocationCode", me.jGeneralLocationCodeReadOnly, me.jGeneralLocationCodeShow);
			me.setControlState("BOLSReportType", me.jBOLSReportTypeReadOnly, me.jCPIPercentageShow);
			me.setControlState("CPIPercentage", me.jCPIPercentageReadOnly, me.jCPIPercentageShow);
			me.setControlState("CPIAmount", me.jCPIAmountReadOnly, me.jCPIAmountShow);
			me.setControlState("CPIDate", me.jCPIDateReadOnly, me.jCPIDateShow);
			me.setControlState("CPIECIWaived", me.jCPIECIWaivedReadOnly, me.jCPIECIWaivedShow, "Check", "CPIECIWaivedCheck");
			me.setControlState("Active", me.jActiveReadOnly, me.jActiveShow, "Check", "InputTextAreaRight");
		},

		setControlState: function() {
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean},
				ctrlShow: {type: Boolean, required: false, defaultValue: false},
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});

			if (args.ctrlReadOnly) {
				$("#" + args.ctrlName + "Text").attr("disabled", true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if (!args.ctrlShow) {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
			}
			if (args.ctrlReadOnly && args.ctrlType === "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}
			if (!args.ctrlShow && args.ctrlType === "Check") {
				$("#" + args.ctrlDiv).hide();
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

				switch (event.keyCode) {
					case 83: // Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 78: // Ctrl+N
						me.actionNewItem();
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

		resize: function() {

			$("#JobContainer").height($(window).height() - 212);
			$("#JobHouseCodeContainer").height($(window).height() - 202);
			fin.hcm.hcmjobUi.jobGrid.setHeight($(window).height() - 140);
			fin.hcm.hcmjobUi.houseCodeGrid.setHeight($(window).height() - 222);
		},

		resizeControls: function() {
			var me = this;

			me.jobTemplate.resizeText();
			me.jobNumber.resizeText();
			me.title.resizeText();
			me.contactName.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.postalCode.resizeText();
			me.geoCode.resizeText();
			me.city.resizeText();
			me.state.resizeText();
			me.country.resizeText();
			me.industry.resizeText();
			me.invoiceTemplate.resizeText();
			me.taxId.resizeText();
			me.serviceContract.resizeText();
			me.generalLocationCode.resizeText();
			me.bolsReportType.resizeText();
			me.cpiPercentage.resizeText();
			me.cpiAmount.resizeText();
			me.cpiDate.resizeText();
		},

		defineFormControls: function() {
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
					title: "Create the new Job details.",
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
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				title: "Click here to add a new Job details.",
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

			me.jobTemplate = new ui.ctl.Input.DropDown.Filtered({
				id: "JobTemplate",
				formatFunction: function(item) { return item.title; },
				changeFunction: function() { me.jobTemplateChanged(); },
				title: "Select a Job Template to Clone."
			});

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				title: "To search a specific Job, type-in Job Number or Title and press Enter key/click Search button.",
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
				maxLength: 10
			});

			me.title = new ui.ctl.Input.Text({
				id: "Title",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
			});

			me.title.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );

			me.contactName = new ui.ctl.Input.Text({
				id: "ContactName",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.contactName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if (me.jobType.indexSelected !== -1 && me.jobType.data[me.jobType.indexSelected].name === "Customer" && me.contactPhone.getValue() !== "") {
				        if (me.contactName.getValue() === "")
				            return;
				    }
				    else
				        this.valid = true;
				});

			me.contactPhone = new ui.ctl.Input.Text({
				id: "ContactPhone",
				maxLength: 14,
				changeFunction: function() { me.modified(); me.contactPhoneChanged(); }
			});

			me.contactPhone.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function (isFinal, dataMap) {

				    var enteredText = me.contactPhone.getValue();
					if (enteredText === "")
						return;

				    me.contactPhone.text.value = fin.cmn.text.mask.phone(enteredText);
				    enteredText = me.contactPhone.text.value;

				    if (!(ui.cmn.text.validate.phone(enteredText)))
				        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
		    });

			me.address1 = new ui.ctl.Input.Text({
				id: "Address1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.address1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if (me.jobType.indexSelected !== -1 && me.jobType.data[me.jobType.indexSelected].name === "Customer") {
				        if (me.address1.getValue() === "")
				            return;
				    }
				    else
				        this.valid = true;
				});

			me.address2 = new ui.ctl.Input.Text({
				id: "Address2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.postalCode = new ui.ctl.Input.Text({
				id: "PostalCode",
				maxLength: 10,
				changeFunction: function() {
					if (ui.cmn.text.validate.postalCode(me.postalCode.getValue()))
						me.loadZipCodeTypes(); me.modified();
				}
			});

			me.postalCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.postalCode.getValue();

					if (enteredText === "")
						return;

					if (enteredText === "00000" || enteredText === "00000-0000" || !(ui.cmn.text.validate.postalCode(enteredText)))
						this.setInvalid("Please enter valid Postal Code. Example: 99999 or 99999-9999");
				});

			me.geoCode = new ui.ctl.Input.DropDown.Filtered({
		        id: "GEOCode",
				formatFunction: function( type ) { return type.geoCode; },
				changeFunction: function() {  me.modified(); me.geoCodeChanged(); },
		        required: false
		    });

			me.geoCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.geoCode.lastBlurValue !== "" && me.geoCode.indexSelected === -1)
						this.setInvalid("Please select the correct GEO Code.");
				});

			me.city = new ui.ctl.Input.DropDown.Filtered({
		        id: "City",
				formatFunction: function( type ) { return type.city; },
				changeFunction: function() { me.modified(); },
		        required: false
		    });

			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.validZipCode && me.city.indexSelected === -1)
						this.setInvalid("Please select the correct City.");
					else if (me.geoCode.lastBlurValue !== "" && me.geoCode.indexSelected !== -1) {
						var cityName = "";

						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.zipCodeTypes[index].geoCode === me.geoCode.lastBlurValue) {
								cityName = me.zipCodeTypes[index].city;
								break;
							}
						}

						if (me.city.lastBlurValue.toUpperCase() !== cityName.toUpperCase())
							this.setInvalid("Please select the correct City [" + cityName + "].");
					}
				});

			me.county = new ui.ctl.Input.Text({
				id: "County",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.state = new ui.ctl.Input.DropDown.Filtered({
				id: "State",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
			});

			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.state.indexSelected === -1)
						this.setInvalid("Please select the correct State.");
					else if (ui.cmn.text.validate.postalCode(me.postalCode.getValue())) {
						var found = false;

						for (var index = 0; index < me.zipCodeTypes.length; index++) {
							if (me.state.indexSelected !== -1 && me.zipCodeTypes[index].stateType === me.stateTypes[me.state.indexSelected].id) {
								found = true;
								break;
							}
						}

						if (!found && me.zipCodeTypes.length > 0) {
							var stateName = "";
							var itemIndex = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

							if (itemIndex !== null)
								stateName = me.stateTypes[itemIndex].name;
							this.setInvalid("Please select the correct State [" + stateName + "].");
						}
					}
				});

			me.country = new ui.ctl.Input.DropDown.Filtered({
				id: "Country",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); me.countryTypeChanged(); }
			});

			me.country.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.country.indexSelected === -1)
						this.setInvalid("Please select the correct Country.");
				});

			me.industry = new ui.ctl.Input.DropDown.Filtered({
				id: "Industry",
				formatFunction: function(type) { return type.brief + " - " + type.name; },
				changeFunction: function() { me.modified(); }
			});

			me.industry.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.industry.indexSelected === -1)
						this.setInvalid("Please select the correct Industry.");
				});

			me.paymentTerm = new ui.ctl.Input.DropDown.Filtered({
				id: "PaymentTerm",
				formatFunction: function(type) { return type.brief + " - " + type.name; },
				changeFunction: function() { me.modified(); }
			});

			me.paymentTerm.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.paymentTerm.indexSelected === -1)
						this.setInvalid("Please select the correct Payment Term.");
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

					if ((this.focused || this.touched) && me.jobType.indexSelected === -1)
						this.setInvalid("Please select the correct Job Type.");
				});

			me.invoiceTemplate = new ui.ctl.Input.DropDown.Filtered({
				id: "InvoiceTemplate",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.modified(); },
				title: "Select Invoice Template"
			});

			me.customerName = new ui.ctl.Input.Text({
				id: "CustomerName",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
			});

			me.customerPhone = new ui.ctl.Input.Text({
				id: "CustomerPhone",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
			});

			me.customerPhone.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function (isFinal, dataMap) {

				    var enteredText = me.customerPhone.getValue();
					if (enteredText === "")
						return;

				    me.customerPhone.text.value = fin.cmn.text.mask.phone(enteredText);
				    enteredText = me.customerPhone.text.value;

				    if (!(ui.cmn.text.validate.phone(enteredText)))
				        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
		    });

			me.taxId = new ui.ctl.Input.Text({
				id: "TaxId",
				maxLength: 9,
				changeFunction: function() { me.modified(); }
			});

			me.taxId.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function( isFinal, dataMap) {

				if (me.jobType.indexSelected === 2) {
					if (me.taxId.getValue() === "")
						return;
					if (!(/^\d{9}$/.test(me.taxId.getValue())))
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

			me.bolsReportType = new ui.ctl.Input.DropDown.Filtered({
				id: "BOLSReportType",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); },
				title: "Select BOLS Report Type"
			});

			me.bolsReportType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.bolsReportType.lastBlurValue !== "" && me.bolsReportType.indexSelected === -1)
						this.setInvalid("Please select the correct BOLS Report Type.");
				});

			me.cpiPercentage = new ui.ctl.Input.Text({
		        id: "CPIPercentage",
		        maxLength: 6,
				changeFunction: function() { me.modified(); },
		    });

			me.cpiPercentage
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.cpiPercentage.getValue();

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter valid number.");
			});

			me.cpiAmount = new ui.ctl.Input.Text({
		        id: "CPIAmount",
		        maxLength: 19,
				changeFunction: function() { me.modified(); },
		    });

			me.cpiAmount
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.cpiAmount.getValue();

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter valid number.");
			});

			me.cpiDate = new ui.ctl.Input.Date({
		        id: "CPIDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); },
		    });

			me.cpiDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.cpiDate.text.value;

					if (enteredText === "") 
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.cpiECIWaived = new ui.ctl.Input.Check({
		        id: "CPIECIWaived",
				required: false,
				changeFunction: function() { me.modified(); },
		    });

			me.active = new ui.ctl.Input.Check({
				id: "Active",
				changeFunction: function() { me.modified(); }
			});

			me.jobGrid = new ui.ctl.Grid({
				id: "JobGrid",
				appendToId: "divForm",
				selectFunction: function(index) { me.itemSelect(index);	},
				validationFunction: function() {
					if (me.status !== "new")
						return parent.fin.cmn.status.itemValid();
				}
			});

			me.jobGrid.addColumn("brief", "brief", "Number", "Job Number", 80);
			me.jobGrid.addColumn("title", "title", "Title", "Job Title", null);
			me.jobGrid.addColumn("jobType", "jobType", "Job Type", "Job Type", 160, function( type ) { return type.name; });
			me.jobGrid.addColumn("active", "active", "Active", "Active", 60);
			me.jobGrid.capColumns();

			me.houseCodeGrid = new ui.ctl.Grid({
				id: "HouseCodeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.houseCodeGridSelect(index); }
			});

			me.houseCodeTitle = new ui.ctl.Input.Text({
		        id: "HouseCodeTitle" ,
				appendToId : "HouseCodeGridControlHolder"
		    });

			me.houseCodeJobActive = new ui.ctl.Input.Check({
		        id: "HouseCodeJobActive",
		        className: "iiInputCheck",
				appendToId: "HouseCodeGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.houseCodeGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null, null, me.houseCodeTitle);
			me.houseCodeGrid.addColumn("sapCustomerNumber", "sapCustomerNumber", "SAP Customer #", "SAP Customer Number", 140);
			me.houseCodeGrid.addColumn("active", "active", "Active", "Active", 60, null, me.houseCodeJobActive);
			me.houseCodeGrid.capColumns();
			me.houseCodeGrid.setHeight(250);
			
			me.houseCodeTitle.text.readOnly = true;
			
			me.houseCodePopupGrid = new ui.ctl.Grid({
				id: "HouseCodePopupGrid",
				appendToId: "divForm"
			});

			me.houseCodePopupGrid.addColumn("assigned", "assigned", "", "Checked means associated to the Epay Site", 30, function() {
				var rowNumber = me.houseCodePopupGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + rowNumber + "\" class=\"iiInputCheck\"" + (me.units[rowNumber].assigned === true ? checked='checked' : '') + " onchange=\"parent.fin.appUI.modified = true;\"/>";
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

		configureCommunications: function() {
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

			me.countryTypes = [];
			me.countryTypeStore = me.cache.register({
				storeId: "countryTypes",
				itemConstructor: fin.hcm.job.CountryType,
				itemConstructorArgs: fin.hcm.job.countryTypeArgs,
				injectionArray: me.countryTypes
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.job.StateType,
				itemConstructorArgs: fin.hcm.job.stateTypeArgs,
				injectionArray: me.stateTypes
			});

			me.zipCodeTypes = [];
			me.zipCodeTypeStore = me.cache.register({
				storeId: "zipCodeTypes",
				itemConstructor: fin.hcm.job.ZipCodeType,
				itemConstructorArgs: fin.hcm.job.zipCodeTypeArgs,
				injectionArray: me.zipCodeTypes
			});

			me.industryTypes = [];
			me.industryStore = me.cache.register({
				storeId: "industryTypes",
				itemConstructor: fin.hcm.job.IndustryType,
				itemConstructorArgs: fin.hcm.job.industryTypeArgs,
				injectionArray: me.industryTypes
			});

			me.paymentTerms = [];
			me.paymentTermStore = me.cache.register({
				storeId: "paymentTerms",
				itemConstructor: fin.hcm.job.PaymentTerm,
				itemConstructorArgs: fin.hcm.job.paymentTermArgs,
				injectionArray: me.paymentTerms
			});

			me.jobTypes = [];
			me.jobMasterStore = me.cache.register({
				storeId: "jobMasters", //jobTypes
				itemConstructor: fin.hcm.job.JobType,
				itemConstructorArgs: fin.hcm.job.jobTypeArgs,
				injectionArray: me.jobTypes
			});

			me.bolsReportTypes = [];
			me.bolsReportTypeStore = me.cache.register({
				storeId: "bolsReportTypes",
				itemConstructor: fin.hcm.job.BOLSReportType,
				itemConstructorArgs: fin.hcm.job.bolsReportTypeArgs,
				injectionArray: me.bolsReportTypes
			});

			me.invoiceTemplates = [];
			me.invoiceTemplateStore = me.cache.register({
				storeId: "revInvoiceTemplates",
				itemConstructor: fin.hcm.job.InvoiceTemplate,
				itemConstructorArgs: fin.hcm.job.invoiceTemplateArgs,
				injectionArray: me.invoiceTemplates
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

		contactPhoneChanged: function() {
			var me = this;

			if (me.jobType.data[me.jobType.indexSelected].name === "Customer" && me.contactPhone.getValue() !== "")
				$("#LabelContactName").html("<span class='requiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
			else
				$("#LabelContactName").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
		},

		countryTypesLoaded: function(me, activeId) {

			me.country.setData(me.countryTypes);
			me.checkLoadCount();
		},

		countryTypeChanged: function() {
			var me = this;

			me.state.reset();

			if (me.country.indexSelected !== -1) {
				me.setLoadCount();
				me.state.fetchingData();
				me.stateTypeStore.fetch("userId:[user],countryId:" + me.countryTypes[me.country.indexSelected].id, me.stateTypesLoaded, me);
			}
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.checkLoadCount();

			if (me.jobGrid.activeRowIndex >= 0 && me.jobsList[me.jobGrid.activeRowIndex].id > 0) {
				me.loadZipCodeTypes();
				var index = ii.ajax.util.findIndexById(me.jobsList[me.jobGrid.activeRowIndex].appStateTypeId.toString(), me.stateTypes);
				if (index !== null)
					me.state.select(index, me.state.focused);
				else
					me.state.reset();
			}
		},

		invoiceTemplatesLoaded: function(me, activeId) {

			me.invoiceTemplate.setData(me.invoiceTemplates);
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
		},

		jobMastersLoaded: function(me, activeId) {

			for (var index = 0; index < me.jobTypes.length; index++) {
				if (me.jobTypes[index].name === "Epay Site")
					me.jobTypes.splice(index, 1);
			}

			me.industry.setData(me.industryTypes);
			me.paymentTerm.setData(me.paymentTerms);
			me.jobType.setData(me.jobTypes);
			me.bolsReportType.setData(me.bolsReportTypes);
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

		jobsLoaded: function(me, activeId) {

			me.jobsList = me.jobs.slice();

			if (me.jobsList.length <= 0) {
				me.jobGrid.setData([]);
				me.houseCodeGrid.setData([]);
				me.actionClearItem();
				me.status = "new";
			}
			else {
				me.jobGrid.setData(me.jobsList);
				me.jobGrid.body.select(0);
			}
		
			me.checkLoadCount();
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode === 13) {
				me.houseCodeChanged();
			}
		},

		houseCodeChanged: function() {
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

		jobNumberCheck: function() {
			var me = this;

			if (me.jobNumber.getValue().length > 0) {
				me.jobDetailsTabNeedUpdate = true;
				me.jobStore.reset();
				me.jobStore.fetch("jobNumber:" + me.jobNumber.getValue() + ",userId:[user],", me.singleJobLoaded, me);
			}
		},

		singleJobLoaded: function(me, activeId) {

			if (me.jobs.length > 0)
				me.jobDetailsLoad(me.jobs[0]);
		},

		jobTemplateChanged: function() {
			var me = this;

			me.jobDetailsTabNeedUpdate = true;
			me.jobDetailsLoad(me.jobTemplates[me.jobTemplate.indexSelected]);
		},

		itemSelect: function() {
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

			if (me.jobsList[index] !== undefined)
				me.jobDetailsLoad(me.jobsList[index]);

			me.loadHouseCodes();
		},

		jobDetailsLoad: function() {
			var args = ii.args(arguments, {
				job: { type: fin.hcm.job.Job }
			});
			var me = this;
			var item = args.job;

			if (me.jobDetailsTabNeedUpdate) {
				me.validator.reset();
				me.jobDetailsTabNeedUpdate = false;
				me.setLoadCount();
				me.jobNumber.setValue(item.brief);
				me.title.setValue(item.title);
				me.contactName.setValue(item.contactName);
				me.contactPhone.setValue(item.contactPhone);
				me.address1.setValue(item.address1);
				me.address2.setValue(item.address2);
				me.postalCode.setValue(item.postalCode);
				me.county.setValue(item.county);

				var index = ii.ajax.util.findIndexById(item.countryType.toString(), me.countryTypes);
				if (index !== null)
					me.country.select(index, me.country.focused);
				else
					me.country.reset();

				index = ii.ajax.util.findIndexById(item.industryType.toString(), me.industryTypes);
				if (index !== null)
					me.industry.select(index, me.industry.focused);
				else
					me.industry.reset();

				index = ii.ajax.util.findIndexById(item.paymentTerm.toString(), me.paymentTerms);
				if (index !== null)
					me.paymentTerm.select(index, me.paymentTerm.focused);
				else
					me.paymentTerm.reset();

				if (me.country.indexSelected !== -1)
					me.countryTypeChanged();
				else
					me.loadZipCodeTypes();

				if (item.jobType.id) {
					index = ii.ajax.util.findIndexById(item.jobType.id.toString(), me.jobTypes);
					if (index !== null)
						me.jobType.select(index, me.jobType.focused);
					else
						me.jobType.reset();

					if (me.jobType.data[me.jobType.indexSelected].name === "Customer") {
						$("#TaxIdDiv").show();
						$("#OverrideSiteTaxDiv").hide();
						$("#LabelAddress1").html("<span class='requiredFieldIndicator'>&#149;&nbsp;</span>Address 1:");
						if (me.contactPhone.getValue() !== "")
							$("#LabelContactName").html("<span class='requiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
						else
							$("#LabelContactName").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");

						index = ii.ajax.util.findIndexById(item.invoiceTemplate.toString(), me.invoiceTemplates);
						if (index !== null)
							me.invoiceTemplate.select(index, me.invoiceTemplate.focused);
						else
							me.invoiceTemplate.reset();

						if (item.taxId === "0")
							me.taxId.setValue("");
						else
							me.taxId.setValue(item.taxId);
					}
					else {
						me.invoiceTemplate.reset();
						me.taxId.setValue("");
						$("#TaxIdDiv").hide();
						$("#OverrideSiteTaxDiv").show();
						$("#LabelContactName").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
						$("#LabelAddress1").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Address 1:");
					}

					if (me.jobType.data[me.jobType.indexSelected].name === "Service Location")
						$("#CPIContainer").show();
					else
						$("#CPIContainer").hide();
				}
				else
					me.jobType.reset();

				me.customerName.setValue(item.customerName);
				me.customerPhone.setValue(item.customerPhone);
				me.overrideSiteTax.setValue(item.overrideSiteTax.toString());
				me.serviceContract.setValue(item.serviceContract);
				me.generalLocationCode.setValue(item.generalLocationCode);
				index = ii.ajax.util.findIndexById(args.job.bolsReportType.toString(), me.bolsReportTypes);
				if (index != null) 
					me.bolsReportType.select(index, me.bolsReportType.focused);
				else 
					me.bolsReportType.reset();
				me.cpiPercentage.setValue(args.job.cpiPercentage);
				me.cpiAmount.setValue(args.job.cpiAmount);
				me.cpiDate.setValue(args.job.cpiDate);
				me.cpiECIWaived.setValue(args.job.cpiECIWaived.toString());
				me.active.setValue(item.active.toString());
			}

			setTimeout(function() {
				me.resizeControls();
			}, 100);
		},

		loadZipCodeTypes: function() {
			var me = this;

			// remove any unwanted characters
	    	var zipCode = me.postalCode.getValue().replace(/[^0-9]/g, "");
			zipCode = zipCode.substring(0, 5);
			me.city.fetchingData();
			if (!me.validZipCode)
				me.zipCodeTypeStore.reset();
			me.zipCodeTypeStore.fetch("userId:[user],zipCode:" + zipCode, me.zipCodeTypesLoaded, me);
		},

		zipCodeTypesLoaded: function(me, activeId) {
			var cityNamesTemp = [];
			var index = 0;

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if ($.inArray(me.zipCodeTypes[index].city, cityNamesTemp) === -1)
					cityNamesTemp.push(me.zipCodeTypes[index].city);
			}

			cityNamesTemp.sort();
			me.cityNames = [];

			for (index = 0; index < cityNamesTemp.length; index++) {
				me.cityNames.push(new fin.hcm.job.CityName({ id: index + 1, city: cityNamesTemp[index] }));
			}

			me.city.reset();
			me.geoCode.reset();
			me.state.reset();
			me.city.setData(me.cityNames);
			me.geoCode.setData(me.zipCodeTypes);

			if (me.jobGrid.activeRowIndex >= 0 && me.jobsList[me.jobGrid.activeRowIndex].id > 0) {
				for (index = 0; index < me.zipCodeTypes.length; index++) {
					if (me.zipCodeTypes[index].geoCode === me.jobsList[me.jobGrid.activeRowIndex].geoCode) {
						me.geoCode.select(index, me.geoCode.focused);
						break;
					}
				}

				for (index = 0; index < me.cityNames.length; index++) {
					if (me.cityNames[index].city.toUpperCase() === me.jobsList[me.jobGrid.activeRowIndex].city.toUpperCase()) {
						me.city.select(index, me.city.focused);
						break;
					}
				}
			}
			else if (me.jobsList.length > 0) {
				for (index = 0; index < me.zipCodeTypes.length; index++) {
					if (me.zipCodeTypes[index].geoCode === me.jobsList[0].geoCode) {
						me.geoCode.select(index, me.geoCode.focused);
						break;
					}
				}

				for (index = 0; index < me.cityNames.length; index++) {
					if (me.cityNames[index].city.toUpperCase() === me.jobsList[0].city.toUpperCase()) {
						me.city.select(index, me.city.focused);
						break;
					}
				}
			}

			if (me.zipCodeTypes.length === 0) {
				me.validZipCode = false;

				if (me.jobGrid.activeRowIndex >= 0) {
					me.city.setValue(me.jobsList[me.jobGrid.activeRowIndex].city);
					index = ii.ajax.util.findIndexById(me.jobsList[me.jobGrid.activeRowIndex].appStateTypeId.toString(), me.stateTypes);
					if (index !== null)
						me.state.select(index, me.state.focused);
				}
				else if (me.jobsList.length > 0) {
					me.geoCode.setValue(me.jobsList[0].geoCode);
					me.city.setValue(me.jobsList[0].city);
					index = ii.ajax.util.findIndexById(me.jobsList[0].appStateTypeId.toString(), me.stateTypes);
					if (index !== null)
						me.state.select(index, me.state.focused);
				}
			}
			else {
				me.validZipCode = true;
				index = ii.ajax.util.findIndexById(me.zipCodeTypes[0].stateType.toString(), me.stateTypes);

				if (index !== null)
					me.state.select(index, me.state.focused);
				else
					me.state.reset();
			}

			me.checkLoadCount();
		},

		geoCodeChanged: function() {
			var me = this;
			var index = 0;
			var cityName = "";
			var countyName = "";

			for (index = 0; index < me.zipCodeTypes.length; index++) {
				if (me.zipCodeTypes[index].geoCode === me.geoCode.lastBlurValue) {
					cityName = me.zipCodeTypes[index].city;
					countyName = me.zipCodeTypes[index].county;
					break;
				}
			}

			for (index = 0; index < me.cityNames.length; index++) {
				if (me.cityNames[index].city.toUpperCase() === cityName.toUpperCase()) {
					me.city.select(index, me.city.focused);
					break;
				}
			}

			me.county.setValue(countyName);
		},

		houseCodeGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});
			var me = this;
			var index = args.index;

			if (me.houseCodeJobs[index]) {
				me.houseCodeJobs[index].modified = true;
				me.houseCodeJobActive.check.disabled = !me.active.check.checked;
			}
		},

		loadHouseCodes: function() {
		    var me = this;

			if (me.jobsList[me.lastSelectedRowIndex] === undefined)
				return;

			if (me.houseCodesTabNeedUpdate) {
				var index = me.houseCodeGrid.activeRowIndex;
				if (index >= 0)
		   			me.houseCodeGrid.body.deselect(index);

				if (me.jobId === 0) {
					me.houseCodeGrid.setData([]);
				}
				else {
					me.houseCodesTabNeedUpdate = false;
					me.houseCodeJobStore.reset();
					me.houseCodeJobStore.fetch("userId:[user],jobId:" + me.jobId, me.houseCodeJobLoaded, me);
				}
			}
		},

		houseCodeJobLoaded: function(me, activeId) {

			me.houseCodeGrid.setData(me.houseCodeJobs);
			me.houseCodeGrid.resize();
		},

		addHouseCodes: function() {
			var me = this;

			if (me.jobGrid.activeRowIndex === -1)
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

			if (me.jobType.data[me.jobType.indexSelected].name === "Customer") {
				$("#TaxIdDiv").show();
				$("#OverrideSiteTaxDiv").hide();
				$("#LabelAddress1").html("<span class='requiredFieldIndicator'>&#149;&nbsp;</span>Address 1:");
				if (me.contactPhone.getValue() !== "")
					$("#LabelContactName").html("<span class='requiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
				else
					$("#LabelContactName").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
			}
			else {
				$("#TaxIdDiv").hide();
				$("#OverrideSiteTaxDiv").show();
				$("#LabelContactName").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Contact Name:");
				$("#LabelAddress1").html("<span class='nonRequiredFieldIndicator'>&#149;&nbsp;</span>Address 1:");
			}
			me.contactName.resetValidation(true);
			me.address1.resetValidation(true);
			me.contactName.updateStatus();
			me.address1.updateStatus();
			if (me.jobType.data[me.jobType.indexSelected].name === "Service Location")
				$("#CPIContainer").show();
			else
				$("#CPIContainer").hide();
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
					xml += ' active="' + me.jobGrid.data[me.jobGrid.activeRowIndex].active + '"';
					xml += '/>';
				}
			};

			if (xml !== "")
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

		actionClearItem: function() {
			var me = this;

			me.validator.reset();
			me.jobTemplate.reset();
			me.jobNumber.setValue("");
			me.title.setValue("");
			me.contactName.setValue("");
			me.contactPhone.setValue("");
			me.address1.setValue("");
			me.address2.setValue("");
			me.postalCode.setValue("");
			me.geoCode.reset();
			me.city.reset();
			me.county.setValue("");
			me.state.reset();
			me.country.reset();
			me.industry.reset();
			me.paymentTerm.reset();
			me.jobType.reset();
			me.invoiceTemplate.reset();
			me.customerName.setValue("");
			me.customerPhone.setValue("");
			me.taxId.setValue("");
			me.overrideSiteTax.setValue("false");
			me.serviceContract.setValue("");
			me.generalLocationCode.setValue("");
			me.bolsReportType.reset();
			me.cpiPercentage.setValue("");
			me.cpiAmount.setValue("");
			me.cpiDate.setValue("");
			me.cpiECIWaived.setValue("false");
			me.active.setValue("true");
			me.geoCode.setData([]);
			me.city.setData([]);
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

		findIndexByTitle: function() {
			var args = ii.args(arguments, {
				title: {type: String},
				data: {type: [Object]}
			});
			var title = args.title;
			var data = args.data;

			for (var index = 0; index < data.length; index++ ) {
				if (data[index].brief.toLowerCase() === title.toLowerCase()) {
					return index;
				}
			}
			return null;
		},

		actionNewItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#container-1").triggerTab(1);
			$("#JobTemplateDiv").hide();
			$("#TaxIdDiv").hide();
			$("#OverrideSiteTaxDiv").hide();
			$("#CPIContainer").hide();
			me.jobId = 0;
			me.actionClearItem();
			me.resetGrids();
			var index = me.findIndexByTitle("US", me.countryTypes);
			if (index !== null) {
				me.country.select(index, me.country.focused);
				me.countryTypeChanged();
			}

			index = me.findIndexByTitle("1600", me.industryTypes);
			if (index !== null)
				me.industry.select(index, me.industry.focused);
			index = me.findIndexByTitle("N030", me.paymentTerms);
			if (index !== null)
				me.paymentTerm.select(index, me.paymentTerm.focused);
			me.status = "new";
			me.setStatus("Loaded");
		},

		actionCloneItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.status = "clone";
			me.actionClearItem();
			me.resetGrids();
			$("#JobTemplateDiv").show();
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.status = "";

			$("#JobTemplateDiv").hide();

			if (me.jobGrid.data.length <= 0)
				return;

			if (me.lastSelectedRowIndex >= 0)
				me.jobGrid.body.select(me.lastSelectedRowIndex);
			else
				me.jobGrid.body.select(0);
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			if (me.jobsReadOnly)
				return;

			me.validator.forceBlur();
			me.houseCodeGrid.body.deselectAll();

			if (me.status === "clone" && me.jobTemplate.indexSelected < 0) {
				alert("Please select Job Template to Clone.");
				return false;
			}

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			if (me.jobGrid.activeRowIndex >= 0 && (me.jobGrid.data[me.jobGrid.activeRowIndex].active !== me.active.getValue())) {
				if (me.active.getValue()) {
					if (!confirm("All asoociated house codes will be active. Are you sure you want to continue?")) {
						return;
					}
				}
				else {
					if (!confirm("All asoociated house codes will be inactive. Are you sure you want to continue?")) {
						return;
					}
				}

				for (var index = 0; index < me.houseCodeJobs.length; index++) {
					me.houseCodeJobs[index].modified = true;
					me.houseCodeJobs[index].active = me.active.getValue();
				}

				me.houseCodeGrid.setData(me.houseCodeJobs);
			}

			item = new fin.hcm.job.Job({
				id: me.jobId
				, brief: me.jobNumber.getValue()
				, title: me.title.getValue()
				, contactName: me.contactName.getValue()
				, contactPhone: me.contactPhone.getValue()
				, address1: me.address1.getValue()
				, address2: me.address2.getValue()
				, city: me.city.lastBlurValue
				, county: me.county.getValue()
				, appStateTypeId: me.state.indexSelected !== -1 ? me.stateTypes[me.state.indexSelected].id : 0
				, postalCode: me.postalCode.getValue()
				, geoCode: me.geoCode.lastBlurValue
				, countryType: me.country.indexSelected !== -1 ? me.countryTypes[me.country.indexSelected].id : 0
				, industryType: me.industry.indexSelected !== -1 ? me.industryTypes[me.industry.indexSelected].id : 0
				, paymentTerm: me.paymentTerm.indexSelected !== -1 ? me.paymentTerms[me.paymentTerm.indexSelected].id : 0
				, jobType: me.jobType.indexSelected !== -1 ? me.jobTypes[me.jobType.indexSelected] : 0
				, invoiceTemplate: me.invoiceTemplate.indexSelected !== -1 ? me.invoiceTemplates[me.invoiceTemplate.indexSelected].id : 0
				, customerName: me.customerName.getValue()
				, customerPhone: me.customerPhone.getValue()
				, taxId: me.taxId.getValue()
				, overrideSiteTax: me.overrideSiteTax.getValue()
				, serviceContract: me.serviceContract.getValue()
				, generalLocationCode: me.generalLocationCode.getValue()
				, bolsReportType: me.bolsReportType.indexSelected != -1 ? me.bolsReportTypes[me.bolsReportType.indexSelected].id : 0
				, cpiPercentage: me.cpiPercentage.getValue()
				, cpiAmount: me.cpiAmount.getValue()
				, cpiDate: me.cpiDate.lastBlurValue
				, cpiECIWaived: me.cpiECIWaived.getValue()
				, active: me.active.getValue()
			});

			xml = me.saveXmlBuild(item);
			me.actionSave(item, xml);
		},

		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.job.Job}
			});
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<job';
			xml += ' id="' + item.id + '"';
			xml += ' brief="' + ui.cmn.text.xml.encode(item.brief) + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
			xml += ' contactName="' + ui.cmn.text.xml.encode(item.contactName) + '"';
			xml += ' contactPhone="' + fin.cmn.text.mask.phone(item.contactPhone, true) + '"';
			xml += ' address1="' + ui.cmn.text.xml.encode(item.address1) + '"';
			xml += ' address2="' + ui.cmn.text.xml.encode(item.address2) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
			xml += ' county="' + ui.cmn.text.xml.encode(item.county) + '"';
			xml += ' appStateTypeId="' + item.appStateTypeId + '"';
			xml += ' postalCode="' + ui.cmn.text.xml.encode(item.postalCode) + '"';
			xml += ' geoCode="' + item.geoCode + '"';
			xml += ' countryType="' + item.countryType + '"';
			xml += ' industryType="' + item.industryType + '"';
			xml += ' paymentTerm="' + item.paymentTerm + '"';
			xml += ' jobType="' + (item.jobType.id ? item.jobType.id : 0) + '"';
			xml += ' invoiceTemplate="' + item.invoiceTemplate + '"';
			xml += ' customerName="' + ui.cmn.text.xml.encode(item.customerName) + '"';
			xml += ' customerPhone="' + fin.cmn.text.mask.phone(item.customerPhone, true) + '"';
			xml += ' taxId="' + item.taxId + '"';
			xml += ' overrideSiteTax="' + item.overrideSiteTax + '"';
			xml += ' serviceContract="' + ui.cmn.text.xml.encode(item.serviceContract) + '"';
			xml += ' generalLocationCode="' + ui.cmn.text.xml.encode(item.generalLocationCode) + '"';
			xml += ' bolsReportType="' + item.bolsReportType + '"';	
			xml += ' cpiPercentage="' + item.cpiPercentage + '"';	
			xml += ' cpiAmount="' + item.cpiAmount + '"';	
			xml += ' cpiDate="' + item.cpiDate + '"';	
			xml += ' cpiECIWaived="' + item.cpiECIWaived + '"';	
			xml += ' active="' + item.active + '"';
			xml += ' clone="' + (me.status === "clone" ? true : false) + '"';
			xml += ' clientId="1">';

			if ($("#SearchByHouseCode")[0].checked && item.id === 0) {
				xml += '<houseCodeJob';
				xml += ' id="0"';
				xml += ' jobId="' + me.jobId + '"';
				xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
				xml += ' hirNode="' + parent.fin.appUI.hirNode + '"';
				xml += ' active="' + item.active + '"';
				xml += ' clientId="2"';
				xml += '/>';
			}
			else {
				for (var index = 0; index < me.houseCodeJobs.length; index++) {
					if (me.houseCodeJobs[index].modified) {
						xml += '<houseCodeJob';
						xml += ' id="' + me.houseCodeJobs[index].id + '"';
						xml += ' jobId="' + me.houseCodeJobs[index].jobId + '"';
						xml += ' houseCodeId="' + me.houseCodeJobs[index].houseCodeId + '"';
						xml += ' hirNode="' + me.houseCodeJobs[index].hirNode + '"';
						xml += ' active="' + me.houseCodeJobs[index].active + '"';
						xml += '/>';
					}
				}
			}

			xml += '</job>';

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

			if (xml === "")
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

		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				me.modified(false);

				if (me.status === "addHouseCodes") {
					me.houseCodesTabNeedUpdate = true;
					me.loadHouseCodes();
				}
				else {
					$(args.xmlNode).find("*").each(function() {
						switch (this.tagName) {
							case "job":
								if (me.status === "new") {
									me.jobId = parseInt($(this).attr("id"), 10);
									item.id = me.jobId;
									item.brief = $(this).attr("brief");
									me.jobsList.push(item);
									me.lastSelectedRowIndex = me.jobsList.length - 1;
									me.jobGrid.setData(me.jobsList);
									me.jobGrid.body.select(me.lastSelectedRowIndex);
									alert("Job Number " + item.brief + " has been created successfully.");
								}
								else {
									me.jobsList[me.lastSelectedRowIndex] = item;
									me.jobGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								}

								break;

							case "houseCodeJob":
								var id = parseInt($(this).attr("id"), 10);

								for (var index = 0; index < me.houseCodeGrid.data.length; index++) {
									if (me.houseCodeGrid.data[index].modified) {
										if (me.houseCodeGrid.data[index].id <= 0)
											me.houseCodeGrid.data[index].id = id;
										me.houseCodeGrid.data[index].modified = false;
										break;
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
				alert("[SAVE FAILURE] Error while updating Job details: " + $(args.xmlNode).attr("message"));
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
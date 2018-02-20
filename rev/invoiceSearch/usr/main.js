ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.rev.invoiceSearch.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);

ii.Class({
    Name: "fin.rev.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {

		init: function() {
			var me = this;

			me.loadCount = 0;
			me.houseCodeChangedAtSearch = false;
			me.sortSelections = [];

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.ajaxValidator = new ii.ajax.Validator(me.gateway);

			if (!parent.fin.appUI.houseCodeId)
				parent.fin.appUI.houseCodeId = 0;

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "rev\\invoiceSearch";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");

			$(window).bind("resize", me, me.resize);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();			
			if (parent.fin.appUI.houseCodeId === 0 || parent.fin.appUI.houseCodeId === undefined)
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function() {

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			if (!fin.invoiceSearchUi)
				return;

		    fin.invoiceSearchUi.invoiceGrid.setHeight($(window).height() - 130);
		},

		defineFormControls: function() {
			var me = this;

			me.invoiceNumber = new ui.ctl.Input.Text({
				id: "InvoiceNumber",
				maxLength: 10
			});

			me.invoiceNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.invoiceNumber.getValue();

					if (enteredText === "")
						return;

					if (!(/^[0-9]+$/.test(enteredText)))
						this.setInvalid("Please enter valid Invoice #");
			});

			me.documentNumber = new ui.ctl.Input.Text({
				id: "DocumentNumber",
				maxLength: 10
			});

			me.documentNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.documentNumber.getValue();

					if (enteredText === "")
						return;

					if (!(/^[0-9]+$/.test(enteredText)))
						this.setInvalid("Please enter valid Document #");
			});

			me.invoiceDate = new ui.ctl.Input.Date({
		        id: "InvoiceDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });

			me.invoiceDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.invoiceDate.text.value;

					if (enteredText === "")
						return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");					
			});

			me.customer = new ui.ctl.Input.Text({
				id: "Customer",
				required: false
		    });

			me.serviceLocation = new ui.ctl.Input.Text({
				id: "ServiceLocation",
				required: false
		    });

			me.poNumber = new ui.ctl.Input.Text({
				id: "PONumber",
				required: false
		    });

			me.jdeCompany = new ui.ctl.Input.DropDown.Filtered({
		        id: "JDECompany",
				formatFunction: function( type ) { return type.name; },
		        required: false
		    });

			me.jdeCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.jdeCompany.lastBlurValue === "")
						return;

					if ((this.focused || this.touched) && me.jdeCompany.indexSelected === -1)
						this.setInvalid("Please select the correct Company Code.");
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadInvoices(); },
				hasHotState: true
			});

			me.invoiceGrid = new ui.ctl.Grid({
				id: "InvoiceGrid",
				appendToId: "divForm",
				selectFunction: function(index) { me.itemSelect(index); },
				allowAdds: false
			});

			me.invoiceGrid.addColumn("invoiceNumber", "invoiceNumber", "Invoice #", "Invoice #", 90);
			me.invoiceGrid.addColumn("documentNumber", "documentNumber", "Document #", "Document #", 100);
			me.invoiceGrid.addColumn("amount", "amount", "Amount", "Amount", 110);
			me.invoiceGrid.addColumn("billTo", "billTo", "Customer", "Customer", null);
			me.invoiceGrid.addColumn("houseCodeBrief", "houseCodeBrief", "House Code", "House Code", 110);
			me.invoiceGrid.addColumn("companyCode", "companyCode", "Company Code", "Company Code", 120);
			me.invoiceGrid.addColumn("invoiceDate", "invoiceDate", "Invoice Date", "Invoice Date", 110);
			me.invoiceGrid.addColumn("collected", "collected", "Collected", "Collected", 110);
			me.invoiceGrid.addColumn("credited", "credited", "Credited", "Credited", 110);
			me.invoiceGrid.addColumn("lastPrinted", "lastPrinted", "Last Printed", "Last Printed", 120);
			me.invoiceGrid.addColumn("serviceLocation", "serviceLocation", "Service Location", "Service Location", 250);
			me.invoiceGrid.addColumn("poNumber", "poNumber", "PO Number", "PO Number", 100);
			me.invoiceGrid.capColumns();

			$("#InvoiceNumberText").bind("keydown", me, me.actionSearchItem);
			$("#DocumentNumberText").bind("keydown", me, me.actionSearchItem);
			$("#InvoiceDateText").bind("keydown", me, me.actionSearchItem);
			$("#CustomerText").bind("keydown", me, me.actionSearchItem);
			$("#ServiceLocationText").bind("keydown", me, me.actionSearchItem);
			$("#PONumberText").bind("keydown", me, me.actionSearchItem);
			$("#JDECompanyText").bind("keydown", me, me.actionSearchItem);

			$("#pageLoading").css({
				"opacity": "0.5",
				"background-color": "black"
			});
			$("#messageToUser").css({ "color": "white" });
			$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
		},

		resizeControls: function() {
			var me = this;

			me.invoiceNumber.resizeText();
			me.documentNumber.resizeText();
			me.invoiceDate.resizeText();
			me.customer.resizeText();
			me.serviceLocation.resizeText();
			me.poNumber.resizeText();
			me.jdeCompany.resizeText();
			me.resize();
		},

		configureCommunications: function() {
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.rev.invoiceSearch.HirNode,
				itemConstructorArgs: fin.rev.invoiceSearch.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.rev.invoiceSearch.HouseCode,
				itemConstructorArgs: fin.rev.invoiceSearch.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.rev.invoiceSearch.JdeCompany,
				itemConstructorArgs: fin.rev.invoiceSearch.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});

			me.invoices = [];
			me.invoiceStore = me.cache.register({
				storeId: "revInvoices",
				itemConstructor: fin.rev.invoiceSearch.Invoice,
				itemConstructorArgs: fin.rev.invoiceSearch.invoiceArgs,
				injectionArray: me.invoices
			});
		},

		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
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
		
		houseCodesLoaded: function(me, activeId) {			

			if (parent.fin.appUI.houseCodeId === 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			if (me.houseCodeChangedAtSearch) {
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
				if (!me.columnSorted())
					window.location = "/fin/rev/master/usr/markup.htm?invoiceSearch=true&invoiceId=" + me.invoiceId + "&invoiceNumber=" + me.invoiceNumberValue;
			}
			else {
				me.houseCodeGlobalParametersUpdate(false);
			}

			me.resizeControls();
			me.jdeCompany.fetchingData();
			me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
		},

		houseCodeChanged: function() {
			var me = this;

			$("#pageLoading").fadeIn("slow");
			me.actionLoadInvoices();
		},

		jdeCompanysLoaded: function(me, activeId) {

			me.jdeCompany.setData(me.jdeCompanys);
			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode === 13) {
				me.actionLoadInvoices();
			}
		},

		actionLoadInvoices: function() {
			var me = this;

			me.validator.forceBlur();
			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}

			if (me.invoiceNumber.getValue() === "" && me.documentNumber.getValue() === "" && me.invoiceDate.text.value === "" && me.customer.getValue() === "" 
				&& me.serviceLocation.getValue() === "" && me.poNumber.getValue() === "" && me.jdeCompany.lastBlurValue === "" && $("#houseCodeText").val() === "") {
				alert("Please enter search criteria: Invoice #, Document #, Invoice Date, Customer, Service Location, PO Number, Company Code or House Code.")
				return false;
			}

			me.setLoadCount();

			var invoiceNumber = me.invoiceNumber.getValue();
			var documentNumber = me.documentNumber.getValue();
			var invoiceDate = me.invoiceDate.text.value;
			var customer = me.customer.getValue();
			var serviceLocation = me.serviceLocation.getValue();
			var poNumber = me.poNumber.getValue();
			var jdeCompany = (me.jdeCompany.indexSelected >= 0 ? me.jdeCompany.data[me.jdeCompany.indexSelected].id : 0)

			if (invoiceDate === undefined || invoiceDate === "")
				invoiceDate = "1/1/1900";

			me.invoiceStore.reset();
			me.invoiceStore.fetch("userId:[user],houseCode:"
				+ ($("#houseCodeText").val() !== "" ? + parent.fin.appUI.houseCodeId : "0")
				+ ",status:-1,year:-1,invoiceByHouseCode:-1,invoiceNumber:" + invoiceNumber
				+ ",documentNumber:" + documentNumber
				+ ",invoiceDate:" + invoiceDate 
				+ ",customer:" + customer 
				+ ",serviceLocation:" + serviceLocation 
				+ ",poNumber:" + poNumber 
				+ ",jdeCompany:" + jdeCompany
				, me.invoiceLoaded, me);
		},

		invoiceLoaded: function(me, activeId) {

			me.invoiceGrid.setData(me.invoices);
			me.checkLoadCount();
			me.resize();
  		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;
			var item = me.invoiceGrid.data[index];

			if (parent.fin.appUI.houseCodeId !== item.houseCode) {
				me.houseCodeChangedAtSearch = true;
				me.invoiceId = item.id;
				me.invoiceNumberValue = item.invoiceNumber;
				me.setStatus("Loading");
				$("#messageToUser").text("Loading");
				$("#pageLoading").fadeIn("slow");
				me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + item.houseCodeBrief + ",", me.houseCodesLoaded, me);
			}
			else {
				if (!me.columnSorted())
					window.location = "/fin/rev/master/usr/markup.htm?invoiceSearch=true&invoiceId=" + item.id + "&invoiceNumber=" + item.invoiceNumber + "&fscYear=" + item.fscYear + "&statusType=" + item.paidOff;
			}
		},

		columnSorted: function() {
			var me = this;
			var columnExists = false;
			var generalColumnSorted = false;
			var columnSorted = false;
			var column;
			var columnSelected;

			for (index in me.invoiceGrid.columns) {
				column = me.invoiceGrid.columns[index];
				if (column) {
					if (index === "rowNumber") 
						continue;

					for (sortColumnIndex in me.sortSelections) {
						columnSelected = me.sortSelections[sortColumnIndex];
						if (columnSelected.name === index) {
							columnExists = true;
							if (columnSelected.sortStatus !== column.sortStatus) {
								columnSorted = true;
								me.sortSelections[sortColumnIndex].name = index;
								me.sortSelections[sortColumnIndex].sortStatus = column.sortStatus;
							}
						}
					}

					if (!columnExists) {
						me.sortSelections.push({
							name: index
							, sortStatus: column.sortStatus
						});

						if (column.sortStatus !== "none") 
							columnSorted = true;
					}

					if (columnSorted)
						generalColumnSorted = true;
					columnSorted = false;
				}
			}

			return generalColumnSorted;
		}
	}
});

function main() {
	fin.invoiceSearchUi = new fin.rev.UserInterface();
	fin.invoiceSearchUi.resize();
	fin.houseCodeSearchUi = fin.invoiceSearchUi;
}
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
			var args = ii.args(arguments, {});
			var me = this;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.ajaxValidator = new ii.ajax.Validator(me.gateway);
			
			me.houseCodeChangedAtInvoiceSearch = false;
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "rev\\invoiceSearch";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			
			me.sortSelections = [];
			
			$(window).bind("resize", me, me.resize);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();			
			if (parent.fin.appUI.houseCodeId == 0 || parent.fin.appUI.houseCodeId == undefined) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);
		},
		
		authorizationProcess: function fin_rev_invoiceSearch_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_rev_invoiceSearch_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			
			if(!fin.invoiceSearchUi) return;
			
		    fin.invoiceSearchUi.invoiceSearch.setHeight($(window).height() - 140);
		},
		
		defineFormControls: function() {			
			var me = this;
			
			me.invoice = new ui.ctl.Input.Text({
				id: "Invoice",
				maxLength: 50
			});
			
			me.invoice.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.invoice.getValue();

					if(enteredText == '') return;

					if (!(/^[0-9]+$/.test(enteredText)))
						this.setInvalid("Please enter valid Invoice #");
			});
										
			me.customer = new ui.ctl.Input.Text({
				id: "Customer", 
				required: false
		    });
			
			me.invoiceDate = new ui.ctl.Input.Date({
		        id: "InvoiceDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.invoiceDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.invoiceDate.text.value;
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");					
			});
				
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				appendToId: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;Search&nbsp;</span>",
				clickFunction: function() { me.actionInvoicesLoad(); },
				hasHotState: true
			});
			
			me.invoiceSearch = new ui.ctl.Grid({
				id: "InvoiceSearch",
				appendToId: "divForm",
				selectFunction: function(index) { me.itemSelect(index); },
				allowAdds: false
			});
			
			me.invoiceSearch.addColumn("invoiceNumber", "invoiceNumber", "Invoice", "Invoice", 80);
			me.invoiceSearch.addColumn("amount", "amount", "Amount", "Amount", 100);
			me.invoiceSearch.addColumn("billTo", "billTo", "Customer", "Customer", null);
			me.invoiceSearch.addColumn("houseCodeBrief", "houseCodeBrief", "House Code", "House Code", 110);
			me.invoiceSearch.addColumn("invoiceDate", "invoiceDate", "Invoice Date", "Invoice Date", 110);
			me.invoiceSearch.addColumn("collected", "collected", "Collected", "Collected", 100);
			me.invoiceSearch.addColumn("credited", "credited", "Credited", "Credited", 80);
			me.invoiceSearch.addColumn("lastPrinted", "lastPrinted", "Last Printed", "Last Printed", 120);
			me.invoiceSearch.capColumns();
			me.invoiceSearch.setHeight($("#pageLoading").height() - 155);
			
			$("#InvoiceText").bind("keydown", me, me.actionSearchItem);
			$("#InvoiceDateText").bind("keydown", me, me.actionSearchItem);
			$("#CustomerText").bind("keydown", me, me.actionSearchItem);
			
			$("#pageLoading").css({
				"opacity": "0.5",
				"background-color": "black"
			});
			$("#messageToUser").css({ "color": "white" });
			$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
		},				
		
		resizeControls: function() {
			var me = this;
			
			me.invoice.resizeText();
			me.customer.resizeText();
			me.invoiceDate.resizeText();
			
			me.resize();
		},
		
		configureCommunications: function fin_rev_invoiceSearch_configureCommunications() {
			var args = ii.args(arguments, {});
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
		
		houseCodesLoaded: function(me, activeId) {			
			ii.trace("HouseCodesLoaded", ii.traceTypes.information, "Startup");

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			if (me.houseCodeChangedAtInvoiceSearch == true) {
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
				if (!me.columnSorted()) 
					window.location = "/fin/rev/master/usr/markup.htm?invoiceSearch=true&invoiceId=" + me.invoiceId + "&invoiceNumber=" + me.invoiceNumber;
			}
			else {
				me.houseCodeGlobalParametersUpdate(false);
			}
			
			me.resizeControls();	
			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");
		},

		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;
		},
		
		actionInvoicesLoad: function() {
			var me = this;
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}	
			
			if ($("#InvoiceText").val() == ''
				&& $("#InvoiceDateText").val() == ''
				&& $("#CustomerText").val() == ''
				&& $("#houseCodeText").val() == ''
				) {
					alert("Please enter search criteria: Invoice #, Invoice Date, Customer or House Code.")
					return false;
				}
				
			me.setLoadCount();

			var invoiceNumber = me.invoice.getValue();
			var invoiceDate = me.invoiceDate.text.value;
			var customer = me.customer.getValue();
			
			if(invoiceDate == undefined || invoiceDate == '')
				invoiceDate = '1/1/1900';			
			
			me.invoiceStore.reset();
			me.invoiceStore.fetch("userId:[user],houseCode:" 				
				+ ($("#houseCodeText").val() != "" ? + parent.fin.appUI.houseCodeId : "0")
				+ ",status:-1,year:-1,invoiceNumber:" + invoiceNumber
				+ ",invoiceByHouseCode:-1"
				+ ",invoiceDate:" + invoiceDate + ",customer:" + customer, me.invoiceLoaded, me);
		},
		
		invoiceLoaded: function(me, activeId) { 					
			me.invoiceSearch.setData(me.invoices);
			
			me.checkLoadCount();
			me.resize();
  		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;
			var item = me.invoiceSearch.data[index];
			
			if (parent.fin.appUI.houseCodeId != item.houseCode) {
				me.houseCodeChangedAtInvoiceSearch = true;
				me.invoiceId = item.id;
				me.invoiceNumber = item.invoiceNumber;
				me.setStatus("Loading");
				$("#messageToUser").text("Loading");
				$("#pageLoading").fadeIn("slow");
				me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + item.houseCodeBrief + ",", me.houseCodesLoaded, me);
			}
			else {
				if(!me.columnSorted())
					window.location = "/fin/rev/master/usr/markup.htm?invoiceSearch=true&invoiceId=" + item.id + "&invoiceNumber=" + item.invoiceNumber + "&fscYear=" + item.fscYear + "&statusType=" + item.paidOff;
			}
		},
		
		columnSorted: function esm_ppl_peopleSearch_UserInterface_columnSorted() {
			var args = ii.args(arguments, {
			});
			var me = this;
			var columnExists = false;
			var generalColumnSorted = false;
			var columnSorted = false;
			var column;
			var columnSelected;
			
			for (index in me.invoiceSearch.columns) {
			
				column = me.invoiceSearch.columns[index];
				if (column) {
				
					if (index == "rowNumber") 
						continue;
					
					for (sortColumnIndex in me.sortSelections) {
					
						columnSelected = me.sortSelections[sortColumnIndex];
						if (columnSelected.name == index) {
						
							columnExists = true;
							if (columnSelected.sortStatus != column.sortStatus) {
								columnSorted = true;
								me.sortSelections[sortColumnIndex].name = index;
								me.sortSelections[sortColumnIndex].sortStatus = column.sortStatus;
							}
						}
					}
					
					if (!columnExists) {
						me.sortSelections.push({
							name: index,
							sortStatus: column.sortStatus
						});
						
						if (column.sortStatus != "none") 
							columnSorted = true;
					}
					
					if (columnSorted) generalColumnSorted = true;
					columnSorted = false;
				}
			}
						
			return generalColumnSorted;
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.actionInvoicesLoad();
			}
		}
		
	}
});

function main() {
	fin.invoiceSearchUi = new fin.rev.UserInterface();
	fin.invoiceSearchUi.resize();
	fin.houseCodeSearchUi = fin.invoiceSearchUi;
}




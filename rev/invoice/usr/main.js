ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.rev.invoice.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );

ii.Class({
    Name: "fin.rev.invoice.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");

			me.invoiceId = parseInt(searchString.substring(pos + 1));
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
			me.status = "";
			me.bindRow = false;
			me.houseCodeCache = [];
			me.invoiceByCustomer = false;
			me.editSalesTax = false;
			me.invalidHouseCode = "";
			me.descriptionAccount = parent.fin.revMasterUi.descriptionAccount;
			me.houseCodeCache = parent.fin.revMasterUi.houseCodeCache;
			me.houseCodeBrief = parent.fin.revMasterUi.houseCodeBrief;			

			var index = parent.fin.revMasterUi.lastSelectedRowIndex;
			if (index >= 0) {
				me.invoice = parent.fin.revMasterUi.invoices[index];
				me.invoiceByCustomer = !me.invoice.invoiceByHouseCode;

				if (parent.fin.revMasterUi.invoiceType == parent.invoiceTypes.houseCodeCloneYes 
					|| parent.fin.revMasterUi.invoiceType == parent.invoiceTypes.customerCloneYes)
					me.bindRow = true;

				parent.fin.revMasterUi.invoiceType = parent.invoiceTypes.edit;
			}

			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?
			me.noContext = true;              // disable the context menu?

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\AccountsReceivable\\Invoicing/AR";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();

			$("#pageBody").show();
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);

			if (!me.invoice.printed) {
				$(document).bind("contextmenu", me, me.contextMenuProcessor);
				$("#anchorAlign").show();
			}

			if (parent.fin.revMasterUi.invoicingReadOnly) {				
				$("#AnchorInvoiceLabelLeft").hide();
				me.rowBeingEdited = true;				
			}

			me.accountsLoaded();
			me.taxableServicesLoaded();
			me.invoiceItemStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.invoiceItemsLoaded, me);
		},

		authorizationProcess: function fin_rev_invoice_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (me.isAuthorized) {
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_rev_invoice_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var width = 0;
			var gridDiv = $("#divInvoiceItemGrid");
			
			width = gridDiv[0].offsetWidth - gridDiv[0].clientWidth;
			
			$("#divInvoiceItemGrid").height(document.documentElement.clientHeight - 70);
			$("#InvoiceItemGrid").width(gridDiv.width() - width);
		},
		
		contextMenuProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (me.noContext || me.mouseOverContext || me.rowBeingEdited || !me.isEditableRow())
		        return;
		
		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;
		
		    // we assume we have a standards compliant browser, but check if we have IE
		    var target = event.target != null ? event.target : event.srcElement;
		
		    if (me.replaceContext) {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop :
		            document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft :
		            document.documentElement.scrollLeft;
		
		        // hide the menu first to avoid an "up-then-over" visual effect
				var contextMenu = document.getElementById('InvoiceItemContext');

				contextMenu.style.display = "none";
				contextMenu.style.top = event.clientY + scrollTop + "px";
				contextMenu.style.left = event.clientX + scrollLeft + "px";
				contextMenu.style.display = "";			
		
		        me.replaceContext = false;
		
		        return false;
		    }
		},
		
		mouseDownProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.button == 2)
				me.replaceContext = true;			
			else if (!me.mouseOverContext)
				$("#InvoiceItemContext").hide();
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.invoiceItemGridRowAdd(); },
				hasHotState: true
			});
						
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
			
			me.anchorReorder = new ui.ctl.buttons.Sizeable({
				id: "AnchorReorder",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Reorder&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionReorderItem(); },
				hasHotState: true
			});
			
			me.anchorUpdateSalesTax = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpdateSalesTax",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Update Sales Tax&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUpdateSalesTaxItem(); },
				hasHotState: true
			});
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});
		},
		
		configureCommunications: function fin_rev_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.rev.invoice.HouseCode,
				itemConstructorArgs: fin.rev.invoice.houseCodeArgs,
				injectionArray: me.houseCodes,
				multipleFetchesAllowed: false
			});
			
			me.invoiceItems = [];
			me.invoiceItemStore = me.cache.register({
				storeId: "revInvoiceItems",
				itemConstructor: fin.rev.invoice.InvoiceItem,
				itemConstructorArgs: fin.rev.invoice.invoiceItemArgs,
				injectionArray: me.invoiceItems
			});

			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.rev.invoice.Account,
				itemConstructorArgs: fin.rev.invoice.accountArgs,
				injectionArray: me.accounts	
			});

			me.taxableServices = [];
			me.taxableServiceStore = me.cache.register({
				storeId: "revTaxableServices",
				itemConstructor: fin.rev.invoice.TaxableService,
				itemConstructorArgs: fin.rev.invoice.taxableServiceArgs,
				injectionArray: me.taxableServices
			});
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
			
			if (processed)
				return false;
		},

		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});

			parent.parent.fin.appUI.modified = args.modified;
			if (args.modified)
				parent.fin.revMasterUi.setStatus("Edit");
		},

		resetGrid: function() {
			$("#InvoiceItemGrid tbody").html("");	
		},
		
		accountsLoaded: function() {
			var me = this;

			for (var index = 0; index < parent.fin.revMasterUi.accounts.length; index++) {
				var account = parent.fin.revMasterUi.accounts[index];
				me.accounts.push(new fin.rev.invoice.Account(account.id, account.code, account.description));
			}
		},
		
		taxableServicesLoaded: function() {
			var me = this;

			for (var index = 0; index < parent.fin.revMasterUi.taxableServices.length; index++) {
				var taxableService = parent.fin.revMasterUi.taxableServices[index];
				me.taxableServices.push(new fin.rev.invoice.TaxableService(taxableService.id, taxableService.title));
			}
		},
		
		getJobTitle: function(brief, title) {
			var me = this;
			var jobTitle = "";

			if (brief != "")
				jobTitle = brief + " - " + title;

			return jobTitle == "" ? "&nbsp;" : jobTitle;
		},

		getTaxableServiceTitle: function(id) {
			var me = this;

			var index = ii.ajax.util.findIndexById(id.toString(), me.taxableServices);
			if (index != undefined && index >= 0)
				return me.taxableServices[index].title;
			else
				return "";
		},

		getAccountNumberName: function(id) {
			var me = this;
			var accountNumberName = "";

			for (var index = 0; index < me.accounts.length; index++) {
				if (me.accounts[index].id == id) {
					accountNumberName = me.accounts[index].code + " - " + me.accounts[index].description;
					break;
				}
			}

			if (accountNumberName == "")
				return "&nbsp;"
			else
				return accountNumberName;
		},
		
		getStatusTitle: function(status) {
			if (status == 1)
				return "Open";
			else if (status == 2)
				return "In Progress";
			else if (status == 3)
				return "Posted";
			else if (status == 5)
				return "Closed";
		},
		
		invoiceItemsLoaded: function(me, activeId) {
			var index = 0;
			var rowHtml = "";
			var subTotal = 0;
			var salesTax = 0;
			var salesTaxTotal = 0;
			var total = 0;
			var rowNumber = 0;
			var salesTaxFound = false;
			var salesTaxDescription = "";
			var overrideSiteTax = false;
			var houseCodeJobChanged = false;
			var houseCode = 0;
			var houseCodeJob = 0;
			var itemIndex = -1;
			var displayOrderSet = false;

			if (me.invoiceItems.length > 0) {
				if (me.invoiceItems[0].displayOrder > 0)
					displayOrderSet = true;
			}
			
			if (displayOrderSet) {
				for (index = 0; index < me.invoiceItems.length; index++) {
					if (me.invoiceItems[index].account == 120) {
						salesTax = parseFloat(me.invoiceItems[index].amount);
						salesTaxTotal += salesTax;
					}
					rowNumber++;
					rowHtml += me.getItemGridRow(rowNumber, index);
					if (me.invoiceItems[index].account != me.descriptionAccount && me.invoiceItems[index].account != 120)
						subTotal += parseFloat(me.invoiceItems[index].amount);
				}
			}
			else {
				for (index = 0; index < me.invoiceItems.length; index++) {
					if (houseCode != me.invoiceItems[index].houseCode || houseCodeJob != me.invoiceItems[index].houseCodeJob) {
						if (houseCode != me.invoiceItems[index].houseCode && houseCode != 0)
							houseCodeJobChanged = true;
						else if (houseCodeJob != 0 && (overrideSiteTax != me.invoiceItems[index].overrideSiteTax || me.invoiceItems[index].overrideSiteTax))
							houseCodeJobChanged = true;
						
						houseCode = me.invoiceItems[index].houseCode;
						houseCodeJob = me.invoiceItems[index].houseCodeJob;
						overrideSiteTax = me.invoiceItems[index].overrideSiteTax;
					}
	
					if (houseCodeJobChanged) {
						houseCodeJobChanged = false;
						if (itemIndex != -1) {
							rowNumber++;
							rowHtml += me.getItemGridRow(rowNumber, itemIndex);
							itemIndex = -1;
						}
					}
	
					if (me.invoiceItems[index].account == 120) {
						itemIndex = index;
						salesTax = parseFloat(me.invoiceItems[index].amount);
						salesTaxTotal += salesTax;
					}
					else {
						rowNumber++;
						rowHtml += me.getItemGridRow(rowNumber, index);
						if (me.invoiceItems[index].account != me.descriptionAccount)
							subTotal += parseFloat(me.invoiceItems[index].amount);
					}
				}
	
				if (me.invoiceItems.length > 0) {
					if (itemIndex != -1) {
						rowNumber++;
						rowHtml += me.getItemGridRow(rowNumber, itemIndex);
					}
				}
			}

			total = subTotal + salesTaxTotal;
			rowHtml += me.getTotalGridRow(0, subTotal, "Sub Total:", "");
			rowHtml += me.getTotalGridRow(0, salesTaxTotal, "Sales Tax Total:", "");
			rowHtml += me.getTotalGridRow(0, total, "Total:", "");

			$("#InvoiceItemGrid tbody").html(rowHtml);
			
			me.invoiceItemGridEventSetup(me);
			
			if (me.bindRow) {
				me.bindRow = false;
				var index = parent.fin.revMasterUi.lastSelectedRowIndex;
				parent.fin.revMasterUi.invoices[index].amount = total.toFixed(5);
				parent.fin.revMasterUi.invoiceGrid.body.renderRow(index, index);
			}
	
			me.resize();
			parent.fin.revMasterUi.hidePageLoading("");
		},
		
		getItemGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, index: {type: Number}
			});	
			var me = this;
			var index = args.index;
			var rowHtml = "<tr>";
			var accountName = "";
			var quantity = "";
			var price = "";

			if (me.invoiceItems[index].account == 120) {
				accountName = "Sales Tax:";
				quantity = "&nbsp";
				price = "&nbsp";
			}				
			else {
				accountName = me.getAccountNumberName(me.invoiceItems[index].account);
				quantity = me.invoiceItems[index].quantity.toString()
				price = me.invoiceItems[index].price;
			}

			rowHtml += me.getInvoiceItemGridRow(
				args.rowNumber
				, false
				, me.invoiceItems[index].id
				, me.invoiceItems[index].houseCode
				, me.getJobTitle(me.invoiceItems[index].jobBrief, me.invoiceItems[index].jobTitle)
				, me.getTaxableServiceTitle(me.invoiceItems[index].taxableService)
		        , accountName
				, quantity
				, price
				, me.invoiceItems[index].amount
				, me.getStatusTitle(me.invoiceItems[index].statusType)
				, me.invoiceItems[index].taxable ? "Yes" : "No"
				, me.invoiceItems[index].lineShow ? "Yes" : "No"
				, me.invoiceItems[index].description
			);						
			rowHtml += "</tr>";
			
			return rowHtml;
		},

		getTotalGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, totalAmount: {type: Number}
				, title: {type: String}
				, description: {type: String}
			});			
			var me = this;
			var rowHtml = "";

			rowHtml = "<tr>";

			rowHtml += me.getInvoiceItemGridRow(
				args.rowNumber
				, false
				, 0
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
		        , args.title
				, "&nbsp;"
				, "&nbsp;"
				, args.totalAmount.toFixed(5)
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, args.description
				);

			rowHtml += "</tr>";

			return rowHtml;
		},		

		invoiceItemGridEventSetup: function(me) {
			
			$("#InvoiceItemGrid tr").removeClass("gridRow");
        	$("#InvoiceItemGrid tr").removeClass("alternateGridRow");			
							
			$("#InvoiceItemGrid tr:odd").addClass("gridRow");
        	$("#InvoiceItemGrid tr:even").addClass("alternateGridRow");
			
			$("#InvoiceItemGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
					
			$("#InvoiceItemContextMenu tr:odd").addClass("gridRow");
        	$("#InvoiceItemContextMenu tr:even").addClass("alternateGridRow");

			$("#InvoiceItemContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
						
			$("#InvoiceItemContextMenu tr").click(function() {

				if (this.id == "menuAdd")
					me.invoiceItemGridRowAdd();
				else if (this.id == "menuEdit")
					me.invoiceItemGridRowEdit();
				else if (this.id == "menuDelete")
					me.invoiceItemGridRowDelete();
					
				$("#InvoiceItemContext").hide();
			});
	
			$("#InvoiceItemGridBody td").mousedown(function() {

				if (me.rowBeingEdited) return;
				
				if (this.cellIndex >= 0 && this.cellIndex <= 12)
					me.currentRowSelected = this.parentNode;
				else
					me.currentRowSelected = null;
			});
			
			$("#InvoiceItemGridBody").mouseover(function() { 
				me.noContext = false;}).mouseout(function() { 
					me.noContext = true;});
			
			$("#InvoiceItemContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},
		
		getInvoiceItemGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, rowEditable: {type: Boolean}
				, id: {type: Number}
				, houseCode: {type: String}
				, job: {type: String}
				, taxableService: {type: String}
				, account: {type: String}
				, quantity: {type: String}
				, price: {type: String}
				, amount: {type: String}
				, status: {type: String}
				, taxable: {type: String}
				, lineShow: {type: String}
				, description: {type: String}
			});
			var me = this;
			var rowHtml = "";
			var columnBold = false;
			var align = "left";
			var rowNumberText = "";
			var editHouseCode = false;

			if (args.id == 0 || args.account == "Sales Tax:") {
				columnBold = true;
				align = "right";
			}
			
			if (args.account == "Sales Tax:")
				me.editSalesTax = true;
			else
				me.editSalesTax = false;				
				
			if (!me.editSalesTax && me.invoiceByCustomer)
				editHouseCode = true;

			if (args.rowNumber > 0)
				rowNumberText = args.rowNumber.toString();
			else
				rowNumberText = "&nbsp;"

			if (args.rowEditable) {
				// Row Editable
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", rowNumberText, 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(editHouseCode, false, 11, "houseCode", args.houseCode, 15, "left");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, false, 2, "job", args.job, 15, "left", "dropdown");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, false, 12, "taxableService", args.taxableService, 15, "left", "dropdown");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, columnBold, 3, "account", args.account, 23, align, "dropdown");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, false, 4, "quantity", args.quantity, 8, "right");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, false, 5, "price", args.price, 8, "right");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, columnBold, 6, "amount", args.amount, 8, "right");
				rowHtml += me.getEditableRowColumn(false, false, 7, "status", args.status, 7, "center");
				rowHtml += me.getEditableRowColumn(!me.editSalesTax, false, 8, "taxable", args.taxable, 6, "center", "check");
				rowHtml += me.getEditableRowColumn(true, false, 9, "lineShow", args.lineShow, 6, "center", "check");
				rowHtml += me.getEditableRowColumn(true, false, 10, "description", args.description, 21, "left");
			}
			else {
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", rowNumberText, 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(false, false, 11, "houseCode", args.houseCode, 15, "left");
				rowHtml += me.getEditableRowColumn(false, false, 2, "job", args.job, 15, align);
				rowHtml += me.getEditableRowColumn(false, false, 12, "taxableService", args.taxableService, 15, align);
				rowHtml += me.getEditableRowColumn(false, columnBold, 3, "account", args.account, 23, align);
				rowHtml += me.getEditableRowColumn(false, false, 4, "quantity", args.quantity, 8, "right");
				rowHtml += me.getEditableRowColumn(false, false, 5, "price", args.price, 8, "right");
				rowHtml += me.getEditableRowColumn(false, columnBold, 6, "amount", args.amount, 8, "right");
				rowHtml += me.getEditableRowColumn(false, false, 7, "status", args.status, 7, "center");
				rowHtml += me.getEditableRowColumn(false, false, 8, "taxable", args.taxable, 6, "center");
				rowHtml += me.getEditableRowColumn(false, false, 9, "lineShow", args.lineShow, 6, "center");
				rowHtml += me.getEditableRowColumn(false, false, 10, "description", args.description, 21, "left");
			}

			return rowHtml;
		},
																		
		getEditableRowColumn: function() {
			var args = ii.args(arguments, {
				editable: {type: Boolean}
				, bold: {type: Boolean}
				, columnNumber: {type: Number}
				, columnName: {type: String}
				, columnValue: {type: String}
				, columnWidth: {type: Number}
				, columnAlign: {type: String}
				, columnType: {type: String, defaultValue: ""}
			});
			var me = this;
			var styleName = "text-align:" + args.columnAlign + ";"
			
			if (args.bold)
				styleName += " font-weight:bold;"
			
			if (args.editable) {
				if (args.columnType == "dropdown") 
					return "<td class='gridColumn'>" + me.populateDropDown(args.columnName, args.columnValue) + "</td>";
				else if (args.columnType == "check")
					return "<td class='gridColumn' align='center'><input id='" + args.columnName + "' type='checkbox'" + (args.columnValue == "Yes" ? " checked='checked'" : "") + "/></td>";
				else 
					return "<td class='gridColumn'><input type='text' style='width:95%; text-align:" + args.columnAlign + ";' id='" + args.columnName + "' value='" + args.columnValue + "'></input></td>";
			}
			else if (args.columnWidth == 0) 
				return "<td class='gridColumnHidden'>" + args.columnValue + "</td>";
			else 
				return "<td class='gridColumn' style='" + styleName + "'>" + args.columnValue + "</td>";
		},
		
		populateDropDown: function() {
			var args = ii.args(arguments, {
				columnName: {type: String}
				, columnValue: {type: String}
			});
			var me = this;
			var rowHtml = "";
			var title = "";
			
			rowHtml = "<select id='" + args.columnName + "' style='width:100%;'>";

			if (args.columnName == "job" && !me.invoiceByCustomer) {
				for (var index = 0; index < me.houseCodeCache[me.houseCodeBrief].jobs.length; index++) {
					var job = me.houseCodeCache[me.houseCodeBrief].jobs[index];

					if ((job.jobNumber != "0000") || ((job.jobNumber == "0000") && (me.houseCodeCache[me.houseCodeBrief].jobs.length == 2))) {
						if (job.jobTitle == "")
							title = "";
						else
							title = ui.cmn.text.xml.encode(job.jobNumber + " - " + job.jobTitle);
						if (args.columnValue == title) 
							rowHtml += "	<option title='" + title + "' value='" + job.id + "' selected>" + title + "</option>";
						else 
							rowHtml += "	<option title='" + title + "' value='" + job.id + "'>" + title + "</option>";
					}
				}
			}
			else if (args.columnName == "account") {
				for (var index = 0; index < me.accounts.length; index++) {
					title = me.accounts[index].code + " - " + me.accounts[index].description;
					if (args.columnValue == title)
						rowHtml += "	<option title='" + title + "' value='" + me.accounts[index].id + "' selected>" + title + "</option>";
					else
						rowHtml += "	<option title='" + title + "' value='" + me.accounts[index].id + "'>" + title + "</option>";
				}
			}
			else if (args.columnName == "taxableService") {
				for (var index = 0; index < me.taxableServices.length; index++) {
					title = me.taxableServices[index].title;
					if (args.columnValue == title)
						rowHtml += "	<option title='" + title + "' value='" + me.taxableServices[index].id + "' selected>" + title + "</option>";
					else
						rowHtml += "	<option title='" + title + "' value='" + me.taxableServices[index].id + "'>" + title + "</option>";
				}
			}
			
			rowHtml += "</select>"
			
			return rowHtml;
		},

		isEditableRow: function() {
			var me = this;
			
			if (me.rowBeingEdited || me.currentRowSelected == null) 
				return;

			if (parseInt(me.currentRowSelected.cells[1].innerHTML) == 0) {
				me.currentRowSelected = null;
				return false;
			}
			
			return true;			
		},
		
		setTaxable: function() {
			var me = this;

			if (me.editSalesTax)
				return;

			if ((parseInt($("#account").val(), 10) == me.descriptionAccount) || me.invoice.taxExempt || $("#job")[0].selectedIndex == -1) {
				$("#taxable")[0].checked = false;
			}
			else {
				var jobId = parseInt($("#job").val(), 10);
				var taxableServiceId = parseInt($("#taxableService").val(), 10);
				var stateType = 0;
				var houseCode = me.houseCodeBrief;
				
				if (me.invoiceByCustomer)
					houseCode = $("#houseCode").val();

				for (var index = 0; index < me.houseCodeCache[houseCode].jobs.length; index++) {
					var job = me.houseCodeCache[houseCode].jobs[index];

					if (job.id == jobId) {
						if (job.overrideSiteTax)
							stateType = job.stateType;
						else
							stateType = me.houseCodeCache[houseCode].stateType;
						break;
					}
				}

				for (var index = 0; index < me.houseCodeCache[houseCode].taxableServiceStates.length; index++) {
					var taxableServiceState = me.houseCodeCache[houseCode].taxableServiceStates[index];

					if (taxableServiceState.taxableService == taxableServiceId && taxableServiceState.stateType == stateType) {
						$("#taxable")[0].checked = taxableServiceState.taxable;
						break;
					}
				}
			}			
		},

		calculateTotal: function() {
			var me = this;
			var quantity = $("#quantity").val();
			var price = $("#price").val();
			
			if (!(isNaN(quantity)) && !(isNaN(price)))
				var total = (quantity * price).toFixed(5);
			else
				total = "";

			$("#amount").val(total);
		},
		
		setupEvents: function() {
			var me = this;
			
			$("#quantity, #price").keypress(function(e) {
				if (e.which != 8 && e.which != 0 && e.which != 45 && e.which != 46 && (e.which < 48 || e.which > 57))
					return false;
			});
			
			$("#quantity, #price, #lineShow, #description").change(function() { me.modified(); });
			$("#quantity, #price").bind("blur", function() { me.calculateTotal(); });
			$("#job, #taxableService, #account").bind("change", function() { me.modified(); me.setTaxable(); });

			if (!me.invoiceByCustomer)
				me.setTaxable();
		},
		
		invoiceItemGridRowEdit: function() {
			var me = this;
			var rowHtml = "";
			var description = "";
				
			if (me.rowBeingEdited)
				return;
			
			description = me.currentRowSelected.cells[12].innerHTML;
			
		    rowHtml = me.getInvoiceItemGridRow(
		        parseInt(me.currentRowSelected.cells[0].innerHTML)
				, true // Editing Row
		        , parseInt(me.currentRowSelected.cells[1].innerHTML)
				, me.currentRowSelected.cells[2].innerHTML				
				, me.currentRowSelected.cells[3].innerHTML
				, me.currentRowSelected.cells[4].innerHTML
				, me.currentRowSelected.cells[5].innerHTML
			    , me.currentRowSelected.cells[6].innerHTML
			    , me.currentRowSelected.cells[7].innerHTML
			    , me.currentRowSelected.cells[8].innerHTML
			    , me.currentRowSelected.cells[9].innerHTML
				, me.currentRowSelected.cells[10].innerHTML
				, me.currentRowSelected.cells[11].innerHTML
				, ""
		        );
			    
		    $(me.currentRowSelected).html(rowHtml);
			$("#description").val(description);
			me.setupEvents();
			me.rowBeingEdited = true;
			me.status = "Edit";
			me.invalidHouseCode = "";
			parent.fin.revMasterUi.setStatus("Normal");

			if (!me.editSalesTax) {
				$("#taxable")[0].disabled = true;
				$("#amount").attr("readonly", true);
			}

			if (me.invoiceByCustomer) {
				if ($("#houseCode").val() != "" && !me.editSalesTax) {
					me.houseCodeCheck($("#houseCode").val());
					$("#houseCode").focus();
				}
				else
					$("#description").focus();
				$("#houseCode").bind("keydown", me, me.searchHouseCode);
				$("#houseCode").bind("blur", function() { me.houseCodeBlur(this); });
				$("#houseCode").change(function() { me.modified(); });
			}
			else if (!me.editSalesTax)
				$("#job").focus();
			else
				$("#description").focus();
		},

		invoiceItemGridRowAdd: function() {
			var me = this;
			var rowHtml = "<tr>";
			var insertAt = 0;
			
			if (me.rowBeingEdited) 
				return;
			
			me.status = "Add";
			me.invalidHouseCode = "";
					
		    rowHtml += me.getInvoiceItemGridRow(
		        me.invoiceItems.length + 1
				, true // Editing Row
		        , 0
				, ""
			    , ""
				, ""
				, ""
			    , ""
				, ""
				, ""
			    , "Open"
			    , me.invoice.taxExempt ? "No" : "Yes"
				, "Yes"
			    , ""
		        );

		    rowHtml += "</tr>";

			insertAt = $("#InvoiceItemGridBody").find("tr").length - 3;

			if (insertAt < 0) return;

			$($("#InvoiceItemGridBody tr")[insertAt]).before(rowHtml);

			if (me.invoiceByCustomer) {
				$("#houseCode").bind("keydown", me, me.searchHouseCode);
				$("#houseCode").bind("blur", function() { me.houseCodeBlur(this); });
				$("#houseCode").change(function() { me.modified(); });
				$("#houseCode").focus();
			}
			else
				$("#job").focus();

			$("#taxable")[0].disabled = true;
			$("#amount").attr("readonly", true);
			me.setupEvents();		
			me.invoiceItemGridEventSetup(me);		 
			me.rowBeingEdited = true;
			me.currentRowSelected = $($("#InvoiceItemGridBody tr")[insertAt])[0];
			parent.fin.revMasterUi.setStatus("Normal");
		},
		
		invoiceItemGridRowDelete: function() {
			var me = this;
						
			if (me.rowBeingEdited || me.currentRowSelected == null || me.currentRowSelected.cells[5].innerHTML == "Sales Tax:") 
				return;

			if (parseInt(me.currentRowSelected.cells[1].innerHTML) > 0) {
				var rowNumber = me.currentRowSelected.cells[0].innerHTML;
				if (confirm("Are you sure you would like to delete row number " + rowNumber + " and all its transactions?")) {
					me.status = "Delete";
					me.rowBeingEdited = true;
					me.actionSaveItem();
				} 
				else {
					me.currentRowSelected = null;
					return;
				}
			}
			else {
				me.currentRowSelected = null;
				return;
			}
		},
		
		actionReorderItem: function() {
			var me = this;
			var rowNumber = -1;

			if (me.rowBeingEdited) 
				return;

			$("#InvoiceItemGridBody").find("tr").each(function() {
				rowNumber++;

				if (parseInt(this.cells[1].innerHTML) > 0) {
					var html = "<input type=text style='width:90%; text-align:right;' id='displayOrder" + rowNumber + "' value='" + this.cells[0].innerHTML + "'></input>";
					this.cells[0].innerHTML = html;

					$("#displayOrder" + rowNumber).keypress(function (e) {
						if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
							return false;
					});
					$("#displayOrder" + rowNumber).change(function() { me.modified(); });
				}
			});

			me.status = "Reorder";
			me.rowBeingEdited = true;
			parent.fin.revMasterUi.setStatus("Normal");
		},
		
		actionUpdateSalesTaxItem: function() {
			var me = this;

			if (me.rowBeingEdited) 
				return;

			if (confirm("Are you sure you would like to update the sales tax for all taxable invoice line items?")) {
				me.status = "UpdateSalesTax";
				me.rowBeingEdited = true;
				me.actionSaveItem();
			} 
			else {
				return;
			}
		},
		
		searchHouseCode: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.houseCodeBlur(event.currentTarget);
			}
		},

		houseCodeBlur: function(objInput) {
			var me = this;
   
		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");
		    if (objInput.value == "") objInput.value = parent.parent.fin.appUI.houseCodeBrief;
			
			if (me.invalidHouseCode != objInput.value) {
				me.invalidHouseCode = objInput.value;
				me.houseCodeCheck(objInput.value);
			}
		},

		houseCodeCheck: function(houseCode) {
			var me = this;

		    if (me.houseCodeCache[houseCode] != undefined) {
	            if (me.houseCodeCache[houseCode].loaded)
	                me.houseCodeValidate(houseCode);
	        }
	        else
	            me.houseCodeLoad(houseCode);
		},

		houseCodeLoad: function(houseCode) {
		    var me = this;

			parent.fin.revMasterUi.showPageLoading("Loading");

		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
			me.houseCodeCache[houseCode].customersLoaded = false;
			me.houseCodeCache[houseCode].jobsLoaded = false;
			me.houseCodeCache[houseCode].taxableServiceStatesLoaded = false;
			me.houseCodeCache[houseCode].stateType = 0;
			me.houseCodeCache[houseCode].validCustomer = false;
			me.houseCodeCache[houseCode].customers = [];
		    me.houseCodeCache[houseCode].jobs = [];
			me.houseCodeCache[houseCode].taxableServiceStates = [];
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user]"
                    + ",appUnitBrief:" + houseCode + ",<criteria>",
                
                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;

		            if ($(xml).find('item').length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = Number($(this).attr("id"));
							me.houseCodeCache[houseCode].hirNode = Number($(this).attr("hirNode"));
		                    me.houseCodeJobCustomersLoad(houseCode);
		                });
		            }
		            else {
		                //the house code is invalid
		                me.houseCodeValidate(houseCode);
		            }
				}
			});
		},

		houseCodeValidate: function(houseCode) {
		    var me = this;

		    if (me.houseCodeCache[houseCode].valid) {
				var found = false;

			    for (var index = 0; index < me.houseCodeCache[houseCode].customers.length; index++) {
					if (me.invoice.jobBrief == me.houseCodeCache[houseCode].customers[index].jobNumber) {
						found = true;
						break;
					}
			    }

				if (found) {
					me.invalidHouseCode = "";
					$("#houseCode").css("background-color", "white");
					$("#houseCode").attr("title", "");
					me.houseCodeCache[houseCode].validCustomer = true;
					if (me.houseCodeCache[houseCode].jobsLoaded)
						me.jobRebuild(houseCode);
					else
						me.houseCodeJobsLoad(houseCode);
				}
				else {
					parent.fin.revMasterUi.hidePageLoading("");
					me.houseCodeCache[houseCode].validCustomer = false;
					$("#job").empty();
					$("#houseCode").css("background-color", "red");
					$("#houseCode").attr("title", "Customer it is not associated with the House Code [" + houseCode + "].");
			        $("#houseCode").select();
					alert("Customer it is not associated with the House Code [" + houseCode + "].");
				}
		    }
		    else {
				parent.fin.revMasterUi.hidePageLoading("");
				$("#job").empty();
				$("#houseCode").css("background-color", "red");
				$("#houseCode").attr("title", "The House Code [" + houseCode + "] is not valid.");
		        $("#houseCode").select();
		        alert("The House Code [" + houseCode + "] is not valid.");
		    }
		},
		
		houseCodeJobCustomersLoad: function(houseCode) {
		    var me = this;
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeJobs,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id		
                    + ",jobType:3,<criteria>",
                
                success: function(xml) {
                    
		            $(xml).find("item").each(function() {
		                var job = {};
		                job.id = Number($(this).attr("id"));
		                job.jobNumber = $(this).attr("jobNumber");
		                job.jobTitle = $(this).attr("jobTitle");
		                me.houseCodeCache[houseCode].customers.push(job);
		            });
	
					me.houseCodeCache[houseCode].customersLoaded = true;
					//validate the list of rows
		            me.houseCodeValidate(houseCode);
				}
			});
		},

		houseCodeJobsLoad: function(houseCode) {
		    var me = this;

		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:houseCodeJobs,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id + ",<criteria>",

                success: function(xml) {
					var job = {};
		            job.id = 0;
		            job.jobNumber = "";
					job.jobTitle = "";
					job.overrideSiteTax = false;
					job.stateType = 0;
		            me.houseCodeCache[houseCode].jobs.push(job);
			
		            $(xml).find("item").each(function() {
		                var job = {};						
		                job.id = Number($(this).attr("id"));
		                job.jobNumber = $(this).attr("jobNumber");
		                job.jobTitle = $(this).attr("jobTitle");
						job.overrideSiteTax = ($(this).attr("overrideSiteTax") == "true" ? true: false);
						job.stateType = Number($(this).attr("stateType"));
		                me.houseCodeCache[houseCode].jobs.push(job);
		            });

					me.houseCodeCache[houseCode].jobsLoaded = true;
					me.taxableServiceStatesLoad(houseCode);
				}
			});
		},
		
		taxableServiceStatesLoad: function(houseCode) {
		    var me = this;
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:revTaxableServiceStates,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id + ",<criteria>",

                success: function(xml) {
                    
		            $(xml).find("item").each(function() {
		                var tsState = {};
		                tsState.id = Number($(this).attr("id"));
		                tsState.taxableService = Number($(this).attr("taxableService"));
		                tsState.stateType = Number($(this).attr("stateType"));
						tsState.taxable = ($(this).attr("taxable") == "true" ? true: false);
		                me.houseCodeCache[houseCode].taxableServiceStates.push(tsState);
		            });					

					me.houseCodeCache[houseCode].taxableServiceStatesLoaded = true;
				}
			});
			
			me.siteStateTypeLoad(houseCode);
		},
		
		siteStateTypeLoad: function(houseCode) {
		    var me = this;
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:sites,userId:[user]"
                    + ",houseCodeId:" + me.houseCodeCache[houseCode].id + ",type:invoice,<criteria>",

                success: function(xml) {
                    
		            $(xml).find("item").each(function() {
						me.houseCodeCache[houseCode].stateType = Number($(this).attr("state"));
		            });
				}
			});

			me.jobRebuild(houseCode);
		},

		jobRebuild: function(houseCode) {
		    var me = this;
		    var job = {};
		    var selJob = $("#job");
			var options = "";
			var title = "";
		    
		    for (var index = 0; index < me.houseCodeCache[houseCode].jobs.length; index++) {
		        job = me.houseCodeCache[houseCode].jobs[index];

				if ((job.jobNumber != "0000") || ((job.jobNumber == "0000") && (me.houseCodeCache[houseCode].jobs.length == 2))) {
					if (job.jobTitle == "") 
						title = "";
					else 
						title = ui.cmn.text.xml.encode(job.jobNumber + " - " + job.jobTitle);
					options += "<option  title='" + title + "' value='" + job.id + "'>" + title + "</option>\n";
				}
		    }

			selJob.empty();
			selJob.append(options);

			if (me.status == "Edit") {
				var id = parseInt(me.currentRowSelected.cells[1].innerHTML);

				for (var index = 0; index < me.invoiceItems.length; index++) {
					if (me.invoiceItems[index].id == id) {
						selJob.val(me.invoiceItems[index].houseCodeJob);
						break;
					}
				}
			}

			me.setTaxable();
			parent.fin.revMasterUi.hidePageLoading("");
		},

		actionOkItem: function() {
			var me = this;
			
			disablePopup();
		},
		
		actionUndoItem: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = 0;
			
			if (me.status == "")
				return;
				
			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.status == "Reorder") {
				$("#InvoiceItemGridBody").find("tr").each(function() {
					rowNumber++;

					if (parseInt(this.cells[1].innerHTML) > 0) {
						this.cells[0].innerHTML = rowNumber;
					}
				});
			}			
			else if (me.status == "Add") {
				var insertAt = $("#InvoiceItemGridBody").find("tr").length - 3;
				$($("#InvoiceItemGridBody tr")[insertAt - 1]).remove();
			}
			else {
				var id = parseInt(me.currentRowSelected.cells[1].innerHTML);
					
				for (var index = 0; index < me.invoiceItems.length; index++) {
					if (me.invoiceItems[index].id == id) {
						rowNumber = index;
						break;
					}
				}

				var accountName = "";
				var quantity = "";
				var price = "";

				if (me.editSalesTax) {					
					accountName = "Sales Tax:";
					quantity = "&nbsp";
					price = "&nbsp";
				}			
				else {
					accountName = me.getAccountNumberName(me.invoiceItems[rowNumber].account);
					quantity = me.invoiceItems[rowNumber].quantity.toString();
					price = me.invoiceItems[rowNumber].price;
				}

				rowHtml += me.getInvoiceItemGridRow(
					parseInt(me.currentRowSelected.cells[0].innerHTML)
					, false
					, parseInt(me.currentRowSelected.cells[1].innerHTML)
					, me.invoiceItems[rowNumber].houseCode
					, me.getJobTitle(me.invoiceItems[index].jobBrief, me.invoiceItems[index].jobTitle)
					, me.getTaxableServiceTitle(me.invoiceItems[rowNumber].taxableService)
			        , accountName
					, quantity
					, price
					, me.invoiceItems[rowNumber].amount == "0" ? "&nbsp;" : parseFloat(me.invoiceItems[rowNumber].amount).toFixed(5).toString()
					, me.currentRowSelected.cells[9].innerHTML
					, me.invoiceItems[rowNumber].taxable ? "Yes" : "No"
					, me.invoiceItems[rowNumber].lineShow ? "Yes" : "No"					
					, me.invoiceItems[rowNumber].description
					);
				
				$(me.currentRowSelected).html(rowHtml);
			}
			
			me.invoiceItemGridEventSetup(me);
			parent.fin.revMasterUi.setStatus("Normal");
			me.status = "";			
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
		},
				
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];			
			var itemIndex = 0;
			var id = 0;
			var houseCodeId = 0;
			var hirNodeId = 0;
			var houseCode = "";
			var job = 0;
			var taxableService = 0;
			var account = 0;
			var quantity = 0;
			var price = 0;
			var amount = 0;
			var taxable = false;
			var recurringFixedCost = false;
			var version = 1;
			var valid = true;

			if (parent.fin.revMasterUi.invoicingReadOnly) return;

			if (me.status == "")
				return true;

			if (me.status == "Reorder") {
				var rowNumber = 0;
				var allOrderNumbers = [];
				var orderNumbers = [];				
				
				$("#InvoiceItemGridBody").find("tr").each(function() {
					if (parseInt(this.cells[1].innerHTML) > 0) {
						allOrderNumbers.push(parseInt($("#displayOrder" + rowNumber).val()));
					    orderNumbers.push(parseInt($("#displayOrder" + rowNumber).val()));
						if (this.cells[5].innerHTML == "Sales Tax:") {
							for (var index = 0; index < orderNumbers.length - 1; index++) {
								if (orderNumbers[index] >= orderNumbers[orderNumbers.length - 1]) {
									 valid = false;
									 return false;
								}
							}

							orderNumbers = [];
						}
					}

					rowNumber++;
				});
				
				// Check for the duplicate order numbers when reordering the invoice line items
				if (valid) {
					outerLoop:
					for (var index = 0; index < allOrderNumbers.length; index++) {
						for (var iIndex = index + 1; iIndex < allOrderNumbers.length; iIndex++) {
							if (allOrderNumbers[index] == allOrderNumbers[iIndex]) {
								 valid = false;
								 break outerLoop;
							}
						}
					}
				}				

				if (!valid) {
					alert("Invoice line items order numbers are incorrect. Please enter correct order number and try again.");
					return true;
				}
			}
			else if (me.status != "UpdateSalesTax") {
				if (!me.editSalesTax) {
					if (me.invoiceByCustomer && (me.status == "Add" || me.status == "Edit")) {
						houseCode = $("#houseCode").val();

						if (me.houseCodeCache[houseCode] == undefined) {
							alert("Please enter the valid House Code.");
							$("#houseCode").focus();
							return;
						}

						if (!me.houseCodeCache[houseCode].valid || !me.houseCodeCache[houseCode].validCustomer) 
							return;
						else {
							houseCodeId = parseInt(me.houseCodeCache[houseCode].id);
							hirNodeId = parseInt(me.houseCodeCache[houseCode].hirNode);
						}
					}
					else 
						houseCode = parent.parent.fin.appUI.houseCodeBrief;
 
					if (me.status == "Add" || me.status == "Edit") {
						if (parseInt($("#account").val(), 10) != me.descriptionAccount) {
							if (parseInt($("#job").val()) == 0) {
								alert("Please select the Job.");
								$("#job").focus();
								return false;
							}
							
							if (parseInt($("#taxableService").val()) == 0) {
								alert("Please select the Taxable Service.");
								$("#taxableService").focus();
								return false;
							}
							
							if (isNaN(parseFloat($("#quantity").val())) || parseFloat($("#quantity").val()) == 0) {
								alert("Please enter the valid Quantity.");
								$("#quantity").focus();
								return false;
							}
							
							if (isNaN(parseFloat($("#price").val())) || parseFloat($("#price").val()) == 0) {
								alert("Please enter the valid Price.");
								$("#price").focus();
								return false;
							}						
						}
					}
				}

				if ($("#description").val() == "") {
					alert("Please enter the Description.");
					$("#description").focus();
					return false;
				}
				
				id = parseInt(me.currentRowSelected.cells[1].innerHTML);
			}

			parent.fin.revMasterUi.showPageLoading("Saving");

			if (me.status == "Add" || me.status == "Edit") {
				if (id > 0) {
					for (var index = 0; index < me.invoiceItems.length; index++) {
						if (me.invoiceItems[index].id == id) {
							itemIndex = index;
							recurringFixedCost = me.invoiceItems[index].recurringFixedCost;
							version = me.invoiceItems[index].version;
							break;
						}
					}	
				}

				if (me.editSalesTax) {
					houseCodeId = me.invoiceItems[itemIndex].houseCodeId;
					hirNodeId = me.invoiceItems[itemIndex].hirNodeId;
					houseCode = me.invoiceItems[itemIndex].houseCode;
					job = me.invoiceItems[itemIndex].houseCodeJob;
					taxableService = me.invoiceItems[itemIndex].taxableService;
					account = me.invoiceItems[itemIndex].account;
					quantity = me.invoiceItems[itemIndex].quantity;
					price = me.invoiceItems[itemIndex].price;
					amount = me.invoiceItems[itemIndex].amount;
					taxable = false;
				}
				else {
					job = parseInt($("#job").val());
					taxableService = parseInt($("#taxableService").val());
					account = parseInt($("#account").val());
					quantity = $("#quantity").val() == "" ? "0" : $("#quantity").val();
					price = $("#price").val() == "" ? "0" : $("#price").val();
					amount = $("#amount").val() == "" ? "0" : $("#amount").val();
					taxable = $("#taxable")[0].checked;
				}

				item = new fin.rev.invoice.InvoiceItem(
					id
					, me.invoiceId
					, houseCodeId
					, hirNodeId
					, houseCode
					, job
					, taxableService
					, ""
					, ""
					, false
					, account
					, 1
					, quantity
					, price
					, (quantity * price).toFixed(5)
					, taxable
					, $("#lineShow")[0].checked
					, $("#description").val()
					, recurringFixedCost
					, version
					, 0
				    );
			}
			else if (me.status == "Delete") {
				item = new fin.rev.invoice.InvoiceItem({ id: id });
			}
			else if (me.status == "Reorder") {
				item = new fin.rev.invoice.InvoiceItem({ id: 0 });
			}
			else if (me.status == "UpdateSalesTax") {
				item = new fin.rev.invoice.InvoiceItem({ id: 0 });
			}

			var xml = me.saveXmlBuildInvoiceItem(item);
	
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildInvoiceItem: function() {
			var args = ii.args(arguments, {
				item: { type: fin.rev.invoice.InvoiceItem }
			});
			var me = this;
			var xml = "";			

			if (me.status == "Add" || me.status == "Edit") {
				xml += '<revInvoiceItem';
				xml += ' id="' + args.item.id + '"';
				xml += ' invoiceId="' + args.item.invoiceId + '"';
				xml += ' houseCodeId="' + args.item.houseCodeId + '"';
				xml += ' hirNodeId="' + args.item.hirNodeId + '"';
				xml += ' houseCode="' + args.item.houseCode + '"';
				xml += ' houseCodeJobId="' + args.item.houseCodeJob + '"';
				xml += ' taxableService="' + args.item.taxableService + '"';
				xml += ' account="' + args.item.account + '"';
				xml += ' quantity="' + args.item.quantity + '"';
				xml += ' price="' + args.item.price + '"';
				xml += ' amount="' + args.item.amount + '"';
				xml += ' taxable="' + args.item.taxable + '"';
				xml += ' lineShow="' + args.item.lineShow + '"';
				xml += ' description="' + ui.cmn.text.xml.encode(args.item.description) + '"';
				xml += ' recurringFixedCost="' + args.item.recurringFixedCost + '"';
				xml += ' version="' + args.item.version + '"';
				xml += '/>';
			}
			else if (me.status == "Delete") {
				xml += '<revInvoiceItemDelete';
				xml += ' id="' + args.item.id + '"';
				xml += '/>';
			}
			else if (me.status == "Reorder") {
				var rowNumber = 0;
				
				$("#InvoiceItemGridBody").find("tr").each(function() {
						
					if (parseInt(this.cells[1].innerHTML) > 0) {
						xml += '<revInvoiceItemDisplayOrder';
						xml += ' id="' + parseInt(this.cells[1].innerHTML) + '"';
						xml += ' displayOrder="' + parseInt($("#displayOrder" + rowNumber).val()) + '"';
						xml += '/>';	
					}

					rowNumber++;
				});
			}
			else if (me.status == "UpdateSalesTax") {
				xml += '<revInvoiceItemSalesTaxUpdateAll';
				xml += ' id="' + me.invoiceId + '"';
				xml += '/>';
			}

			return xml;
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
						
			if (status == "success") {
				me.modified(false);
				me.status = "";
				me.rowBeingEdited = false;
				me.currentRowSelected = null;
				me.bindRow = true;
				parent.fin.revMasterUi.accountReceivableNeedUpdate = true;
				me.invoiceItemStore.reset();
				me.invoiceItemStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.invoiceItemsLoaded, me);
			}
			else if (status == "invalid") {
					
				switch ($(args.xmlNode).attr("message")) {
					
					case "1":
						errorMessage = "The data that was being modified is out of date. Please reload this page " +
							"by selecting it from the menu to the left and try again. Thank you!";
						break;
						
					case "1000":
						errorMessage = "Error - There is a mismatch with the Site setup information for the "
							+ "House Code [" + $("#houseCode").val() + "]. "
							+ "Please correct the address of the Site by accessing HouseCode -> Sites prior to continuing.";
						break;
						
					case "1001":
						errorMessage = "Error - There is a mismatch with the Job setup information for the "
							+ "Job [" + $("#job option:selected").text() + "]. "
							+ "Please correct the address of the Job by accessing HouseCode -> Jobs prior to continuing.";
						break;
						
					case "1002":
						errorMessage = "Invoice which is already printed cannot be modified. Please select or reselect the correct Invoice and try again.";
						break;
					
					case "1023":
						errorMessage = "Error Number 1023 - Data integrity check failure; your modiifcations " +
							"have been aborted. There are credits associated with this invoice that exceed the " + 
							"charges OR the total invoice amount is less than zero. Please resolve the problem " +
							"and try again. Thank you!";
						break;
						
					case "1024":
						errorMessage = "Error Number 1024 - Data integrity check failure; your modiifcations " +
							"have been aborted. There are credits associated with Sales Tax that exceed the " +
							"charges OR the total invoice amount is less than zero. Please resolve the problem " +
							"and try again. Thank you!";
						break;						
						
					case "1025":
						errorMessage = "Error Number 1025 - Data integrity check failure; your modiifcations " +
							"have been aborted. The total Accounts Receivables exceed the charged amount. " +
							"Please reduce or remove the Account Receivable items prior to modifying this invoice. Thank you!";
						break;
				}
				
				$("#messageHeader").text("Your modifications have not been saved.");
				$("#divMessage").text(errorMessage);
				parent.fin.revMasterUi.hidePageLoading("Edit");
				centerPopup();
			}
			else {
				parent.fin.revMasterUi.hidePageLoading("Error");
				alert("[SAVE FAILURE] Error while updating Invoice Item Record: " + $(args.xmlNode).attr("message"));				
			}
		}
		
	}
});

function disablePopup() {
	
	$("#popupMessage").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupMessage").width();
	var popupHeight = $("#popupMessage").height();
		
	$("#popupMessage").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#popupMessage").fadeIn("slow");
}

function main() {
	fin.invoiceUi = new fin.rev.invoice.UserInterface();
	fin.invoiceUi.resize();
}
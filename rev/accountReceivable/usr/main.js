
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.rev.accountReceivable.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.dateDropDown", 7 );

ii.Class({
    Name: "fin.rev.accountReceivable.UserInterface",
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
			me.invalidHouseCode = "";
			me.descriptionAccount = parent.fin.revMasterUi.descriptionAccount;

			var index = parent.fin.revMasterUi.lastSelectedRowIndex;
			if (index >= 0) {				
				me.invoice = parent.fin.revMasterUi.invoices[index];
				me.invoiceByCustomer = !me.invoice.invoiceByHouseCode;	
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
			me.authorizePath = "rev\\accountReceivable";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);
			me.session.displaySetStandard();

			me.defineFormControls();
			me.configureCommunications();

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);

			if (parent.fin.revMasterUi.invoicingReadOnly || me.invoice.creditMemoPrinted) {
				$("#anchorAlign").hide();
				me.rowBeingEdited = true;
			}
			else {
				$(document).bind("contextmenu", me, me.contextMenuProcessor);
			}
			
			me.accountStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.accountsLoaded, me);		    
		},
		
		authorizationProcess: function fin_rev_accountReceivable_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},	
		
		sessionLoaded: function fin_rev_accountReceivable_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#divAccountReceivableGrid").height(document.documentElement.clientHeight - 70);			
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
				var contextMenu = document.getElementById("AccountReceivableContext");

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
				$("#AccountReceivableContext").hide();
		},
		
		defineFormControls: function() {
			var me = this;
					
			me.anchorCreditInvoice = new ui.ctl.buttons.Sizeable({
				id: "AnchorCreditInvoice",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Credit Invoice&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCreditInvoiceItem(); },
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
				itemConstructor: fin.rev.accountReceivable.HouseCode,
				itemConstructorArgs: fin.rev.accountReceivable.houseCodeArgs,
				injectionArray: me.houseCodes,
				multipleFetchesAllowed: false
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.rev.accountReceivable.Account,
				itemConstructorArgs: fin.rev.accountReceivable.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.accountReceivables = [];
			me.accountReceivableStore = me.cache.register({
				storeId: "revAccountReceivables",
				itemConstructor: fin.rev.accountReceivable.AccountReceivable,
				itemConstructorArgs: fin.rev.accountReceivable.accountReceivableArgs,
				injectionArray: me.accountReceivables
			});
			
			me.invoiceItems = [];
			me.invoiceItemStore = me.cache.register({
				storeId: "revInvoiceItems",
				itemConstructor: fin.rev.accountReceivable.InvoiceItem,
				itemConstructorArgs: fin.rev.accountReceivable.invoiceItemArgs,
				injectionArray: me.invoiceItems
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
		},
		
		resetGrid: function() {
			
			$("#AccountReceivableGrid tbody").html("");	
		},

		getAccountNumberName: function(Id) {
			var me = this;
			var accountNumberName = "";
		
			for (var index = 0; index < me.accounts.length; index++) {
				if (me.accounts[index].id == Id) {
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
		
		accountsLoaded: function(me, activeId) {

			me.accountReceivableStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.accountReceivablesLoaded, me);
		},

		invoiceItemsLoaded: function(me, activeId) {
			
			var rowHtml = "";
			var currentDate = "";
			var rowNumber = 0;
			var insertAt = 0;
			var date = new Date();

			me.status = "AddFullCredit";
			currentDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
						
			for (var index = 0; index < me.invoiceItems.length; index++) {
				if (me.invoiceItems[index].amount > 0 && me.invoiceItems[index].account != me.descriptionAccount) {
					rowNumber++;
					rowHtml = "<tr>";
					rowHtml += me.getAccountReceivableGridRow(
				        rowNumber
						, true // Editing Row
				        , 0
						, me.invoiceItems[index].houseCode
					    , currentDate
						, currentDate
						, "CM"			    
						, me.invoiceItems[index].amount
					    ,  me.getAccountNumberName(me.invoiceItems[index].account)
						, ""
						, "Open"
					    , ""
				        )
					
				    rowHtml += "</tr>";
					
					insertAt = $("#AccountReceivableGridBody").find("tr").length - 1;
					
					$($("#AccountReceivableGridBody tr")[insertAt]).before(rowHtml);
				}
			}

			$("#AccountReceivableGridBody input[id^=houseCode]").attr("readonly", true);
			$("#AccountReceivableGridBody input[id^=amount]").attr("readonly", true);
			$("#AccountReceivableGridBody option:not(:selected)").attr("disabled", true);

			me.receivablesLoaded(me);
			me.rowBeingEdited = true;
			me.currentRowSelected = $($("#AccountReceivableGridBody tr")[insertAt])[0];
			me.modified();
		},
		
		accountReceivablesLoaded: function(me, activeId) {
			var index = 0;
			var rowHtml = "";
			var total = 0;
			var creditAmount = 0;
			
			for (index = 0; index < me.accountReceivables.length; index++) {
				rowHtml += "<tr>";
				rowHtml += me.getAccountReceivableGridRow(
					index + 1
					, false
					, me.accountReceivables[index].id
					, me.accountReceivables[index].houseCode
					, me.accountReceivables[index].depositDate
					, me.accountReceivables[index].checkDate
					, me.accountReceivables[index].checkNumber
					, me.accountReceivables[index].amount
			        , me.getAccountNumberName(me.accountReceivables[index].account)
					, me.accountReceivables[index].payer
					, me.getStatusTitle(me.accountReceivables[index].statusType)
					, me.accountReceivables[index].notes == "" ? "&nbsp;" : me.accountReceivables[index].notes
					);
							
				rowHtml += "</tr>";
				total += parseFloat(me.accountReceivables[index].amount);
				
				if (me.bindRow && me.accountReceivables[index].checkNumber == "CM")
					creditAmount += parseFloat(me.accountReceivables[index].amount);
			}
			
			rowHtml += me.getTotalGridRow(0, total, "Total:");
			
			$("#AccountReceivableGrid tbody").html(rowHtml);
						
			me.receivablesLoaded(me);
			
			if (me.bindRow) {
				me.bindRow = false;
				var index = parent.fin.revMasterUi.lastSelectedRowIndex;
				parent.fin.revMasterUi.invoices[index].credited = creditAmount.toFixed(5);
				if (parent.fin.revMasterUi.invoices[index].credited > 0)
				    parent.fin.revMasterUi.invoices[index].creditMemoPrintable = true;
				parent.fin.revMasterUi.invoiceGrid.body.renderRow(index, index);
				parent.fin.revMasterUi.refreshPrintMemoButtonStatus();
			}
			
			$("#pageLoading").hide();
		},
		
		getTotalGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, totalAmount: {type: Number}
				, title: {type: String}
			});
			var me = this;
			var rowHtml = "";
			
			rowHtml = "<tr>";

			rowHtml += me.getAccountReceivableGridRow(
				args.rowNumber
				, false
				, 0
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, args.title
				, args.totalAmount.toFixed(5)
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				);
							
			rowHtml += "</tr>";
			
			return rowHtml;
		},
		
		receivablesLoaded: function(me) {
			
			$("#AccountReceivableGrid tr").removeClass("gridRow");
        	$("#AccountReceivableGrid tr").removeClass("alternateGridRow");	
								
			$("#AccountReceivableGrid tr:odd").addClass("gridRow");
        	$("#AccountReceivableGrid tr:even").addClass("alternateGridRow");
			
			$("#AccountReceivableGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
					
			$("#AccountReceivableContextMenu tr:odd").addClass("gridRow");
        	$("#AccountReceivableContextMenu tr:even").addClass("alternateGridRow");

			$("#AccountReceivableContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
						
			$("#AccountReceivableContextMenu tr").click(function() {

				if (this.id == "menuAdd")
					me.accountReceivableGridRowAdd();
				else if (this.id == "menuEdit")
					me.accountReceivableGridRowEdit();
				else if (this.id == "menuDelete")
					me.accountReceivableGridRowDelete();
					
				$("#AccountReceivableContext").hide();
			});
	
			$("#AccountReceivableGridBody td").mousedown(function() {

				if (me.rowBeingEdited) return;
				
				if (this.cellIndex >= 0 && this.cellIndex <= 9)
					me.currentRowSelected = this.parentNode;
				else
					me.currentRowSelected = null;
			});
			
			$("#AccountReceivableGridBody").mouseover(function() { 
				me.noContext = false;}).mouseout(function() { 
					me.noContext = true;});
			
			$("#AccountReceivableContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},
		
		getAccountReceivableGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, rowEditable: {type: Boolean}
				, id: {type: Number}
				, houseCode: {type: String}
				, depositDate: {type: String}
				, checkDate: {type: String}
				, checkNumber: {type: String}
				, amount: {type: String}
				, account: {type: String}
				, payer: {type: String}
				, status: {type: String}
				, notes: {type: String}
			});
			var me = this;
			var rowHtml = "";
			var columnBold = false;
			var align = "left";
			var rowNumberText = "";
			var editHouseCode = false;
			
			if (me.invoiceByCustomer)
				editHouseCode = true;
			
			if (args.id == 0) {
				columnBold = true;
				align = "right";
			}
			
			if (args.rowNumber > 0)
				rowNumberText = args.rowNumber.toString();
			else
				rowNumberText = "&nbsp;"
					
			if (args.rowEditable) {
				// Row Editable
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", rowNumberText, 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(editHouseCode, false, 2, "houseCode" + args.rowNumber, args.houseCode, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 3, "depositDate", args.depositDate, 8, "left");
				rowHtml += me.getEditableRowColumn(false, false, 4, "checkDate", args.checkDate, 8, "left");
				rowHtml += me.getEditableRowColumn(false, false, 5, "checkNumber", args.checkNumber, 8, "left");
				rowHtml += me.getEditableRowColumn(true, false, 6, "amount" + args.rowNumber, args.amount, 8, "right");
				rowHtml += me.getEditableRowColumn(true, false, 7, "account" + args.rowNumber, args.account, 21, "left", "dropdown");
			    rowHtml += me.getEditableRowColumn(true, false, 8, "payer" + args.rowNumber, args.payer, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 9, "status", args.status, 8, "center");
				rowHtml += me.getEditableRowColumn(true, false, 10, "notes" + args.rowNumber, args.notes, 15, "left");
			}
			else {
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", rowNumberText, 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(false, false, 2, "houseCode", args.houseCode, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 3, "depositDate", args.depositDate, 8, "left");
				rowHtml += me.getEditableRowColumn(false, false, 4, "checkDate", args.checkDate, 8, "left");
				rowHtml += me.getEditableRowColumn(false, columnBold, 5, "checkNumber", args.checkNumber, 8, "left");
				rowHtml += me.getEditableRowColumn(false, columnBold, 6, "amount", args.amount, 8, "right");
				rowHtml += me.getEditableRowColumn(false, false, 7, "account", args.account, 21, "left", "dropdown");
			    rowHtml += me.getEditableRowColumn(false, false, 8, "payer", args.payer, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 9, "status", args.status, 8, "center");
				rowHtml += me.getEditableRowColumn(false, false, 10, "notes", args.notes, 15, "left");
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
				else 
					return "<td class='gridColumn'><input type='text' style='width:95%; text-align:" + args.columnAlign + ";' id='" + args.columnName + "' value='" + args.columnValue + "'></input></td>";
			}
			else if (args.columnWidth == 0) 
				return "<td class='gridColumnHidden'>" + args.columnValue + "</td>";
			else 
				return "<td class='gridColumn' width='" + args.columnWidth + "%' style='" + styleName + "'>" + args.columnValue + "</td>";
		},

		populateDropDown: function() {
			var args = ii.args(arguments, {
				columnName: {type: String}
				, columnValue: {type: String}
			});
			var me = this;
			var rowHtml = "";
			
			rowHtml = "<select id='" + args.columnName + "' style='width:100%;'>";
			
			for (var index = 0; index < me.accounts.length; index++) {
				if (args.columnValue == me.accounts[index].code + " - " + me.accounts[index].description)
					rowHtml += "	<option value='" + me.accounts[index].id + "' selected>" + me.accounts[index].code + " - " + me.accounts[index].description + "</option>";
				else
					rowHtml += "	<option value='" + me.accounts[index].id + "'>" + me.accounts[index].code + " - " + me.accounts[index].description + "</option>";
			}
			
			rowHtml += "</select>";
			
			return rowHtml;
		},
		
		isEditableRow: function() {
			var me = this;
			var rowNumber = 0;
			var editable = true;;

			if (me.rowBeingEdited || me.currentRowSelected == null)
				return;

			if (parseInt(me.currentRowSelected.cells[1].innerHTML) == 0 || me.currentRowSelected.cells[5].innerHTML != "CM")
				editable = false;
			else {
				rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML) - 1;
				if (me.accountReceivables[rowNumber].creditMemoPrintedDate != "")
					editable = false;
			}

			if (editable)
				return true;
			else {
				me.currentRowSelected = null;
				return false;
			}
		},
		
		setupEvents: function(rowNumber) {
			var me = this;

			$("#amount" + rowNumber).keypress(function (e) {
				if (e.which != 8 && e.which != 0 && e.which != 45 && e.which != 46 && (e.which < 48 || e.which > 57))
					return false;
			});
			
			$("#amount" + rowNumber).change(function() { me.modified(); });
			$("#account" + rowNumber).change(function() { me.modified(); });
			$("#payer" + rowNumber).change(function() { me.modified(); });
			$("#notes" + rowNumber).change(function() { me.modified(); });
			
			if (me.invoiceByCustomer) {
				$("#houseCode" + rowNumber).bind("keydown", me, me.searchHouseCode);
				$("#houseCode" + rowNumber).bind("blur", function() { me.houseCodeBlur(this); });
				$("#houseCode" + rowNumber).change(function() { me.modified(); });
			}
		},

		accountReceivableGridRowEdit: function() {
			var me = this;
				
			if (me.rowBeingEdited) 
				return;				

			var rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML);
			var payer = me.currentRowSelected.cells[8].innerHTML;
			var notes = me.currentRowSelected.cells[10].innerHTML == "&nbsp;" ? "" : me.currentRowSelected.cells[10].innerHTML;

		    var rowHtml = me.getAccountReceivableGridRow(
		        rowNumber
				, true // Editing Row
		        , parseInt(me.currentRowSelected.cells[1].innerHTML)
				, me.currentRowSelected.cells[2].innerHTML
				, me.currentRowSelected.cells[3].innerHTML
				, me.currentRowSelected.cells[4].innerHTML
				, me.currentRowSelected.cells[5].innerHTML
			    , me.currentRowSelected.cells[6].innerHTML == "&nbsp;" ? "" : me.currentRowSelected.cells[6].innerHTML
			    , me.currentRowSelected.cells[7].innerHTML
			    , ""
			    , me.currentRowSelected.cells[9].innerHTML
				, ""
		        )

		    $(me.currentRowSelected).html(rowHtml);
			$("#payer" + rowNumber).val(payer);
			$("#notes" + rowNumber).val(notes);

			me.setupEvents(rowNumber);
			me.rowBeingEdited = true;
			me.status = "Edit";			
			me.invalidHouseCode = "";
			
			if (me.invoiceByCustomer) {
				if ($("#houseCode" + rowNumber).val() != "") {
					me.houseCodeCheck($("#houseCode" + rowNumber).val());
				}
			}
		},
		
		accountReceivableGridRowAdd: function() {
			var me = this;
			var rowHtml = "<tr>";
			var currentDate = "";
			var insertAt = 0;
			var rowNumber = 0;
			var date = new Date();

			me.status = "Add";
			currentDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
			rowNumber = me.accountReceivables.length + 1;
			
		    rowHtml += me.getAccountReceivableGridRow(
		        rowNumber
				, true // Editing Row
		        , 0
				, ""
			    , currentDate
				, currentDate
				, "CM"			    
				, ""
			    , ""
				, ""
				, "Open"
			    , ""
		        )
				
		    rowHtml += "</tr>";
			
			insertAt = $("#AccountReceivableGridBody").find("tr").length - 1;
			$($("#AccountReceivableGridBody tr")[insertAt]).before(rowHtml);

			me.setupEvents(rowNumber);
			me.receivablesLoaded(me);		 
			me.rowBeingEdited = true;
			me.currentRowSelected = $($("#AccountReceivableGridBody tr")[insertAt])[0];
		},
		
		accountReceivableGridRowDelete: function() {
			var me = this;
						
			if (me.rowBeingEdited || me.currentRowSelected == null) 
				return;

			if (parseInt(me.currentRowSelected.cells[1].innerHTML) > 0) {
				var rowNumber = me.currentRowSelected.cells[0].innerHTML;
				if (confirm("Are you sure you would like to delete row number " + rowNumber + " ?")) {
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
		    
			$("#messageToUser").text("Loading");
		    $("#pageLoading").show();
		    
		    me.houseCodeCache[houseCode] = {};
		    me.houseCodeCache[houseCode].valid = false;
		    me.houseCodeCache[houseCode].loaded = false;
			me.houseCodeCache[houseCode].customersLoaded = false;			
			me.houseCodeCache[houseCode].validCustomer = false;
			me.houseCodeCache[houseCode].customers = [];
		    
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/rev/act/provider.aspx",
                data: "moduleId=rev&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user]"
                    + ",appUnitBrief:" + houseCode + ",<criteria>",
                
                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;

		            if ($(xml).find("item").length) {
		                //the house code is valid
		                $(xml).find("item").each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = $(this).attr("id");
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
		                job.id = $(this).attr("id");
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

		houseCodeValidate: function(houseCode) {
		    var me = this;

			$("#pageLoading").hide();

			var rowNumber = me.currentRowSelected.cells[0].innerHTML;
			
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
					me.houseCodeCache[houseCode].validCustomer = true;
					$("#houseCode" + rowNumber).css("background-color", "white");
					$("#houseCode" + rowNumber).attr("title", "");
				}
				else {
					me.houseCodeCache[houseCode].validCustomer = false;
					$("#houseCode" + rowNumber).css("background-color", "red");
					$("#houseCode" + rowNumber).attr("title", "Customer it is not associated with the House Code [" + houseCode + "].");
			        $("#houseCode" + rowNumber).select();
					alert("Customer it is not associated with the House Code [" + houseCode + "].");
				}
		    }
		    else {
				$("#houseCode" + rowNumber).css("background-color", "red");
				$("#houseCode" + rowNumber).attr("title", "The House Code [" + houseCode + "] is not valid.");
		        $("#houseCode" + rowNumber).select();
		        alert("The House Code [" + houseCode + "] is not valid.");
		    }
		},
		
		actionCreditInvoiceItem: function() {
			var me = this;
			
			if (me.rowBeingEdited) 
				return;
				
			if (me.accountReceivables.length == 0) {
				if (confirm("Would you like to do a Full Credit on the selected Invoice?")) {
					me.invoiceItemStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.invoiceItemsLoaded, me);
					return;
				}
			}

			me.accountReceivableGridRowAdd();
		},
		
		actionOkItem: function() {
			var me = this;
			
			disablePopup();
			$("#pageLoading").hide();
		},
		
		actionUndoItem: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = -1;
			
			if (me.status == "")
				return;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.status == "Add") {
				var insertAt = $("#AccountReceivableGridBody").find("tr").length - 1;
				$($("#AccountReceivableGridBody tr")[insertAt - 1]).remove();
			}
			else if (me.status == "AddFullCredit") {
				var totalRows = $("#AccountReceivableGridBody").find("tr").length - 1;
				for (var index = 0; index < totalRows; index++) {
					$($("#AccountReceivableGridBody tr")[0]).remove();
				}
			}
			else {
				rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML) - 1;
		
				rowHtml += me.getAccountReceivableGridRow(
					parseInt(me.currentRowSelected.cells[0].innerHTML)
					, false
					, parseInt(me.currentRowSelected.cells[1].innerHTML)
					, me.accountReceivables[rowNumber].houseCode
					, me.accountReceivables[rowNumber].depositDate
					, me.accountReceivables[rowNumber].checkDate
					, me.accountReceivables[rowNumber].checkNumber
					, me.accountReceivables[rowNumber].amount == "0" ? "&nbsp;" : parseFloat(me.accountReceivables[rowNumber].amount).toFixed(5).toString()
					, me.getAccountNumberName(me.accountReceivables[rowNumber].account)
					, me.accountReceivables[rowNumber].payer
					, me.currentRowSelected.cells[9].innerHTML
					, me.accountReceivables[rowNumber].notes == "" ? "&nbsp;" : me.accountReceivables[rowNumber].notes
					);
				
				$(me.currentRowSelected).html(rowHtml);
			}
			
			me.receivablesLoaded(me);
			me.status = "";
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
		},
				
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var id = 0;
			var index = 0;
			var rowNumber = 0;
			var version = 1;
			var houseCodeId = 0;
			var valid = true;
			
			if (parent.fin.revMasterUi.invoicingReadOnly) return;
			
			if (me.status == "")
				return true;
	
			if (me.status == "AddFullCredit") {
				$("#AccountReceivableGridBody").find("tr").each(function() {
					rowNumber = parseInt(this.cells[0].innerHTML);

					if (!isNaN(rowNumber)) {
						if ($("#payer" + rowNumber).val() == "") {
							alert("Please enter the Payer.");
							$("#payer" + rowNumber).focus();
							valid = false;
							return false;
						}
						
						if (me.invoiceByCustomer) {
							for (var index = 0; index < me.invoiceItems.length; index++) {
								if (me.invoiceItems[index].houseCode == $("#houseCode" + rowNumber).val()) {
									houseCodeId = me.invoiceItems[index].houseCodeId;
									break;
								}
							}
						}
						
						item.push(new fin.rev.accountReceivable.AccountReceivable(
							0
							, me.invoiceId
							, houseCodeId
							, ""
							, this.cells[3].innerHTML
							, this.cells[4].innerHTML
							, this.cells[5].innerHTML
							, $("#amount" + rowNumber).val()
							, parseInt($("#account" + rowNumber).val())
							, $("#payer" + rowNumber).val()
							, 1
							, $("#notes" + rowNumber).val()
							, 1
						));
					}
				});
			}
			else if (me.status == "Add" || me.status == "Edit") {
				rowNumber = me.currentRowSelected.cells[0].innerHTML;
				
				if (me.invoiceByCustomer) {
					var houseCode = $("#houseCode" + rowNumber).val();

					if (me.houseCodeCache[houseCode] == undefined) {
						alert("Please enter the valid House Code.");
						$("#houseCode" + rowNumber).focus();
						return;
					}

					if (!me.houseCodeCache[houseCode].valid || !me.houseCodeCache[houseCode].validCustomer) 
						return;
					else 
						houseCodeId = parseInt(me.houseCodeCache[houseCode].id);
				}

				if (isNaN(parseFloat($("#amount" + rowNumber).val())) || parseFloat($("#amount" + rowNumber).val()) <= 0) {
					alert("Please enter the valid Amount.");
					return false;
				}

				if ($("#payer" + rowNumber).val() == "") {
					alert("Please enter the Payer.");
					return false;
				}
			}

			if (!valid)
				return false;

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();			
			
			id = parseInt(me.currentRowSelected.cells[1].innerHTML);
			if (id > 0) {
				index = parseInt(me.currentRowSelected.cells[0].innerHTML) - 1;
				version = me.accountReceivables[index].version;
			}
			
			if (me.status == "Add" || me.status == "Edit") {
				item.push(new fin.rev.accountReceivable.AccountReceivable(
					id
					, me.invoiceId
					, houseCodeId
					, ""
					, me.currentRowSelected.cells[3].innerHTML
					, me.currentRowSelected.cells[4].innerHTML
					, me.currentRowSelected.cells[5].innerHTML
					, $("#amount" + rowNumber).val()
					, parseInt($("#account" + rowNumber).val())
					, $("#payer" + rowNumber).val()
					, 1
					, $("#notes" + rowNumber).val()
					, version
				));
			}
			else if (me.status == "Delete") {
				item.push(new fin.rev.accountReceivable.AccountReceivable({ id: id }));
			}			

			var xml = me.saveXmlBuildAccountReceivable(item);
	
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildAccountReceivable: function () {
			var args = ii.args(arguments, {
				items: { type: [fin.rev.accountReceivable.AccountReceivable] }
			});
			var me = this;
			var items = args.items;
			var xml = "";

			if (me.status == "Add" || me.status == "Edit" || me.status == "AddFullCredit") {
				for (var index = 0; index < items.length; index++) {
					xml += '<revAccountReceivable';
					xml += ' id="' + items[index].id + '"';
					xml += ' invoiceId="' + items[index].invoiceId + '"';
					xml += ' houseCodeId="' + items[index].houseCodeId + '"';
					xml += ' depositDate="' + items[index].depositDate + '"';
					xml += ' checkDate="' + items[index].checkDate + '"';
					xml += ' checkNumber="' + ui.cmn.text.xml.encode(items[index].checkNumber) + '"';
					xml += ' amount="' + items[index].amount + '"';
					xml += ' account="' + items[index].account + '"';
					xml += ' payer="' + ui.cmn.text.xml.encode(items[index].payer) + '"';
					xml += ' notes="' + ui.cmn.text.xml.encode(items[index].notes) + '"';
					xml += ' version="' + items[index].version + '"';
					xml += '/>';
				}
			}
			else if (me.status == "Delete") {
				xml += '<revAccountReceivableDelete';
				xml += ' id="' + items[0].id + '"';
				xml += '/>';
			}

			return xml;
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;			
			var status = $(args.xmlNode).attr("status");
			var errorMessage = "";

			if (status == "success") {
				me.modified(false);
				me.status = "";
				me.rowBeingEdited = false;
				me.currentRowSelected = null;
				me.bindRow = true;
				me.accountReceivableStore.reset();	
				me.accountReceivableStore.fetch("userId:[user],invoiceId:" + me.invoiceId, me.accountReceivablesLoaded, me);				
			}
			else {
				if (status == "invalid") {

					switch ($(args.xmlNode).attr("message")) {
						
						case "1":
							errorMessage = "The data that was being modified is out of date. Please reload this page " +
								"by selecting it from the menu to the left and try again. Thank you!";
							break;
							
						case "1011":
							errorMessage = "Error Number 1011 - Sorry, you cannot add account receivable items on " +
								"an invoice whose amount due equals zero. Add charged items to the invoice prior to " +
								"entering account receivables. Your request has been aborted.";
							break;
						
						case "1019":
							errorMessage = "Error Number 1019 - You cannot enter receivables in excess of the " +
								"outstanding invoiced amount for the specified account code OR in excess of the total " +
								"outstanding invoiced amount. Please resolve the issue and try again. Thank you!";
							break;
							
						case "1021":
							errorMessage = "Error Number 1021 - You have attempted to credit an amount greater than the " +
								"charged amount against the specified account code. Transaction aborted. Please enter " +
								"an amount less than or equal to the charged amount and try again. Thank you!";
							break;						
					}
					
					$("#messageHeader").text("Your modifications have not been saved.");
					$("#divMessage").text(errorMessage);
					centerPopup();
				}
				else {
					alert("[SAVE FAILURE] Error while updating Account Receivable record: " + $(args.xmlNode).attr("message"));
					$("#pageLoading").hide();
				}				
			}
		}		
	}
});

function loadPopup() {
	$("#popupMessage").fadeIn("slow");
}

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
	
	loadPopup();
}

function main() {
	fin.accountReceivableUi = new fin.rev.accountReceivable.UserInterface();
	fin.accountReceivableUi.resize();
}
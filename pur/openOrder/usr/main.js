ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.pur.openOrder.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.button" , 5);

ii.Class({
    Name: "fin.pur.openOrder.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");
	
			me.purchaseOrderId = searchString.substring(pos + 1);
					
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
			me.status = "";
			me.bindRow = false;
						
			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?
			me.noContext = true;              // disable the context menu?
		
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(me.gateway, function(status, errorMessage){
				me.nonPendingError(status, errorMessage);
			});
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "pur\\openOrder";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);
			$(document).bind("contextmenu", me, me.contextMenuProcessor);
			me.houseCodeJobsLoaded();
		},		
		
		authorizationProcess: function fin_pur_openOrder_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pur_openOrder_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;			
			var width = 0;
			
			$("#divPurchaseOrderGrid").height($(window).height() - 85);
		},
		
		contextMenuProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (me.noContext || me.mouseOverContext || me.rowBeingEdited)
		        return;
		
		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;
		
		    // we assume we have a standards compliant browser, but check if we have IE
		    var target = event.target != null ? event.target : event.srcElement;
		
		    if (me.replaceContext)
		    {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop :
		            document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft :
		            document.documentElement.scrollLeft;
		
		        // hide the menu first to avoid an "up-then-over" visual effect
				var contextMenu = document.getElementById('PurchaseOrderContext');

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
			
			if(event.button == 2)
				me.replaceContext = true;			
			else if (!me.mouseOverContext)
				$("#PurchaseOrderContext").hide();
		},
		
		defineFormControls: function() {
			var me = this;
						
			me.anchorAdd = new ui.ctl.buttons.Sizeable({
				id: "AnchorAdd",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Add&nbsp;&nbsp;</span>",
				title: "Add Purchase Order Items.",
				clickFunction: function(){ me.purchaseOrderGridAddItems(); },
				hasHotState: true
			});
			
			me.anchorEdit = new ui.ctl.buttons.Sizeable({
				id: "AnchorEdit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Edit&nbsp;&nbsp;</span>",
				title: "Edit Purchase Order Items.",
				clickFunction: function(){ me.purchaseOrderGridColumnEdit(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				title: "Undo Purchase Order item changes.",
				clickFunction: function(){ me.actionUndoItem(); },
				hasHotState: true
			});			
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				title: "Save Purchase Order Items.",
				clickFunction: function(){ me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorView = new ui.ctl.buttons.Sizeable({
				id: "AnchorView",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;View&nbsp;&nbsp;</span>",
				title: "View Purchase Order Report.",
				clickFunction: function(){ me.actionViewOrder(); },
				hasHotState: true
			});
			
			me.anchorViewEditPO = new ui.ctl.buttons.Sizeable({
				id: "AnchorViewEditPO",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Edit Shipping&nbsp;&nbsp;</span>",
				title: "Edit Shipping Order Information.",
				clickFunction: function(){ parent.fin.purMasterUi.actionEditItem(); },
				hasHotState: true
			});
		},
		
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.openOrder.HouseCodeJob,
				itemConstructorArgs: fin.pur.openOrder.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.purchaseOrderDetails = [];
			me.purchaseOrderDetailStore = me.cache.register({
				storeId: "purPurchaseOrderDetails",
				itemConstructor: fin.pur.openOrder.PurchaseOrderDetail,
				itemConstructorArgs: fin.pur.openOrder.purchaseOrderDetailArgs,
				injectionArray: me.purchaseOrderDetails
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
		
		resetGrid: function() {
			$("#PurchaseOrderGrid tbody").html("");	
		},
		
		houseCodeJobsLoaded: function() {			
			var me = this;
			var job;
			
			for (var index = 0; index < parent.fin.purMasterUi.houseCodeJobs.length; index++) {
				job = parent.fin.purMasterUi.houseCodeJobs[index];
				me.houseCodeJobs.push(new fin.pur.openOrder.HouseCodeJob(job.id, job.jobNumber, job.jobTitle));
			}
			
			me.purchaseOrderDetailStore.fetch("userId:[user],purchaseOrder:" + me.purchaseOrderId, me.purchaseOrderDetailsLoaded, me);			
		},
		
		getJobTitle: function(id) {
			var me = this;
			var jobTitle = "None - None";
			var index = 0;
	
			index = ii.ajax.util.findIndexById(id.toString(), me.houseCodeJobs);
	
			if (index >= 0 && index != undefined)
				jobTitle = me.houseCodeJobs[index].jobNumber + " - " + me.houseCodeJobs[index].jobTitle;

			return jobTitle == "None - None" ? "&nbsp;" : jobTitle;
		},
		
		purchaseOrderDetailsLoaded: function(me, activeId) {
			var index = 0;
			var rowNumber = 0;
			var rowHtml = "";
			var cost = 0;
			var totalCost = 0;
			var subTotal = 0;			
			var category = "";
			var prevCategory = "";
			var showCategory = true;
			var periodBudget = 0;
			var totalPeriodBudget = 0;
			var jobTotalCost = 0;
			var jobPeriodBudget = "";
			var jobTitle = "";
			var nextJobTitle = "";
			var budgetRemaining = "";
			var jobBudgetRemaining = "";

			for (index = 0; index < me.purchaseOrderDetails.length; index++) {

				rowNumber++;
				cost = me.purchaseOrderDetails[index].quantityOverride * parseFloat(me.purchaseOrderDetails[index].price);
				jobTotalCost += cost;				
				jobTitle = me.getJobTitle(me.purchaseOrderDetails[index].houseCodeJob);

				if (showCategory) {
					category = me.purchaseOrderDetails[index].category;					
					prevCategory = category;
					showCategory = false;
				}
				else
					category = "&nbsp;";				

				if ((index + 1) < me.purchaseOrderDetails.length) {
					nextJobTitle = me.getJobTitle(me.purchaseOrderDetails[index + 1].houseCodeJob);
					if (nextJobTitle != jobTitle || me.purchaseOrderDetails[index + 1].category != prevCategory) {
						periodBudget = parseFloat(me.purchaseOrderDetails[index].periodBudget);
						jobPeriodBudget = "$" + periodBudget.toFixed(2);
						jobBudgetRemaining = "$" + (periodBudget - jobTotalCost).toFixed(2);
						totalPeriodBudget += periodBudget;
						jobTotalCost = 0;
					}
					else {
						jobPeriodBudget = "&nbsp;";
						jobBudgetRemaining = "&nbsp;";
					}
				}
				else if (index == me.purchaseOrderDetails.length - 1) {
					periodBudget = parseFloat(me.purchaseOrderDetails[index].periodBudget);
					jobPeriodBudget = "$" + periodBudget.toFixed(2);
					jobBudgetRemaining = "$" + (periodBudget - jobTotalCost).toFixed(2);
					totalPeriodBudget += periodBudget;
					jobTotalCost = 0;
				}

				rowHtml += "<tr>";
				rowHtml += me.getPODetailGridRow(
					rowNumber
					, false
					, me.purchaseOrderDetails[index].id
			        , category
					, jobTitle
					, me.purchaseOrderDetails[index].number
					, me.purchaseOrderDetails[index].description
					, me.purchaseOrderDetails[index].unit
					, me.purchaseOrderDetails[index].recQuantity.toString()
					, me.purchaseOrderDetails[index].quantityOverride.toString()
					, "$" + me.purchaseOrderDetails[index].price
					, "$" + cost.toFixed(2)
					, jobPeriodBudget
					, jobBudgetRemaining
					, me.purchaseOrderDetails[index].priceChanged
				);

				rowHtml += "</tr>";

				subTotal += cost;

				if ((index + 1) < me.purchaseOrderDetails.length) {
					if (me.purchaseOrderDetails[index + 1].category != prevCategory) {
						showCategory = true;
						rowNumber++;						
						budgetRemaining = "$" + (parseFloat(totalPeriodBudget) - subTotal).toFixed(2);
						rowHtml += me.getTotalGridRow(rowNumber, "Sub Total:", subTotal, "$" + totalPeriodBudget.toFixed(2), budgetRemaining)
						totalCost += subTotal;
						subTotal = 0;
						totalPeriodBudget = 0;
					}
				}
				else if (index == me.purchaseOrderDetails.length - 1) {
					rowNumber++;
					budgetRemaining = "$" + (parseFloat(totalPeriodBudget) - subTotal).toFixed(2);
					rowHtml += me.getTotalGridRow(rowNumber, "Sub Total:", subTotal, "$" + totalPeriodBudget.toFixed(2), budgetRemaining)
					totalCost += subTotal;
					subTotal = 0;
					totalPeriodBudget = 0;
				}
			}

			if (me.purchaseOrderDetails.length > 0) {
				rowNumber++;
				rowHtml += me.getTotalGridRow(rowNumber, "Total:", totalCost, "&nbsp;", "&nbsp;")
			}			
			
			$("#PurchaseOrderGrid tbody").html(rowHtml);
						
			me.purchaseOrderGridEventSetup(me);
			
			if (parent.fin.purMasterUi.editColumn) {
				parent.fin.purMasterUi.editColumn = false;
				me.purchaseOrderGridColumnEdit();
			}

			me.resize();

			if (me.bindRow) {				
				var index = parent.fin.purMasterUi.lastSelectedRowIndex;

				me.bindRow = false;
				parent.fin.purMasterUi.purchaseOrders[index].orderAmount = "$" + totalCost.toFixed(2);
				parent.fin.purMasterUi.purchaseOrderGrid.body.renderRow(index, index);					
			}

			if (parent.fin.purMasterUi.purchaseOrdersReadOnly) {
				$("#ButtonOpenOrder").hide();
				$("#PurchaseOrderContextMenu").hide();
			}

			$("#pageLoading").hide();
		},
		
		getTotalGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, title: {type: String}
				, totalAmount: {type: Number}
				, periodBudget: {type: String}
				, budgetRemaining: {type: String}
			});			
			var me = this;
			var rowHtml = "<tr>";
			
			rowHtml += me.getPODetailGridRow(
				args.rowNumber
				, false
				, 0
		        , args.title
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "&nbsp;"
				, "$" + args.totalAmount.toFixed(2)
				, args.periodBudget
				, args.budgetRemaining
				, false
				);
							
			rowHtml += "</tr>";
			
			return rowHtml;
		},		
		
		purchaseOrderGridEventSetup: function(me) {
								
			$("#PurchaseOrderGrid tr:odd").addClass("gridRow");
        	$("#PurchaseOrderGrid tr:even").addClass("alternateGridRow");
			
			$("#PurchaseOrderGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
					
			$("#PurchaseOrderContextMenu tr:odd").addClass("gridRow");
        	$("#PurchaseOrderContextMenu tr:even").addClass("alternateGridRow");

			$("#PurchaseOrderContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
						
			$("#PurchaseOrderContextMenu tr").click(function() {

				if(this.id == "menuAdd")
					me.purchaseOrderGridAddItems();
				else if(this.id == "menuEdit")
					me.purchaseOrderGridColumnEdit();
				else if(this.id == "menuDelete")
					me.purchaseOrderGridRowDelete();
					
				$("#PurchaseOrderContext").hide();
			});
	
			me.purchaseOrderGridMouseDownEventSetup();
			
			$("#PurchaseOrderGridBody").mouseover(function() { 
				me.noContext = false;}).mouseout(function() { 
					me.noContext = true;});
			
			$("#PurchaseOrderContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},
		
		purchaseOrderGridMouseDownEventSetup: function() {
			var me = this;
			
			$("#PurchaseOrderGridBody td").mousedown(function() {

				if(me.rowBeingEdited) return;
				
				if (this.cellIndex >= 0 && this.cellIndex <= 10)
					me.currentRowSelected = this.parentNode;
				else
					me.currentRowSelected = null;					
			});			
		},
		
		getPODetailGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, rowEditable: {type: Boolean}
				, id: {type: Number}
				, vendor: {type: String}
				, job: {type: String}
				, itemNumber: {type: String}
				, description: {type: String}
				, unit: {type: String}
				, recommendedQuantity: {type: String}
				, quantityOverride: {type: String}
				, unitPrice: {type: String}
				, cost: {type: String}
				, periodBudget: {type: String}
				, budgetRemaining: {type: String}
				, priceChanged: {type: Boolean}
			});			
			var me = this;
			var rowHtml = "";
			var columnBold = false;
			var categoryAlign = "left";
			
			if (args.id == 0) {
				columnBold = true;
				categoryAlign = "right";
			}
					
			if(args.rowEditable) {
				// Row Editable
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", args.rowNumber.toString(), 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(false, true, 2, "vendor", args.vendor, 17, categoryAlign);
				rowHtml += me.getEditableRowColumn(true, false, 3, "job" + args.rowNumber, args.job, 20, "left");				
				rowHtml += me.getEditableRowColumn(false, false, 4, "itemNumber", args.itemNumber, 8, "left");
				rowHtml += me.getEditableRowColumn(false, false, 5, "description", args.description, 35, "left");
				rowHtml += me.getEditableRowColumn(false, false, 6, "unit", args.unit, 6, "left");
				rowHtml += me.getEditableRowColumn(false, false, 7, "recQuantity" + args.rowNumber, args.recommendedQuantity, 7, "right");
				rowHtml += me.getEditableRowColumn(true, false, 8, "qtyOverride" + args.rowNumber, args.quantityOverride, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 9, "unitPrice", args.unitPrice, 7, "right", args.priceChanged);
				rowHtml += me.getEditableRowColumn(false, false, 10, "cost", args.cost, 7, "right");
				rowHtml += me.getEditableRowColumn(false, true, 11, "periodBudget", args.periodBudget, 7, "right");
				rowHtml += me.getEditableRowColumn(false, true, 12, "budgetRemaining", args.budgetRemaining, 10, "right");
			}
			else {
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", args.rowNumber.toString(), 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(false, true, 2, "vendor", args.vendor, 17, categoryAlign);
				rowHtml += me.getEditableRowColumn(false, false, 3, "job", args.job, 20, "left");
				rowHtml += me.getEditableRowColumn(false, false, 4, "itemNumber", args.itemNumber, 8, "left");
				rowHtml += me.getEditableRowColumn(false, false, 5, "description", args.description, 35, "left");
				rowHtml += me.getEditableRowColumn(false, false, 6, "unit", args.unit, 6, "left");
				rowHtml += me.getEditableRowColumn(false, false, 7, "recQuantity", args.recommendedQuantity, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 8, "qtyOverride", args.quantityOverride, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 9, "unitPrice", args.unitPrice, 7, "right", args.priceChanged);
				rowHtml += me.getEditableRowColumn(false, columnBold, 10, "cost", args.cost, 7, "right");
				rowHtml += me.getEditableRowColumn(false, true, 11, "periodBudget", args.periodBudget, 7, "right");
				rowHtml += me.getEditableRowColumn(false, true, 12, "budgetRemaining", args.budgetRemaining, 10, "right");
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
				, priceChanged: {type: Boolean, required: false, defaultValue: false}
				});
			var me = this;
			var styleName = "text-align:" + args.columnAlign + ";"
			
			if (args.bold)
				styleName += " font-weight:bold;"
				
			if (args.priceChanged)
				styleName += " color:red;"
				
			if (args.editable) {
				if (args.columnName.substring(0,3) == "job") 
					return "<td class='gridColumn'>" + me.populateDropDown(args.columnName, args.columnValue) + "</td>";
				else 
					return "<td class='gridColumn' align='center'><input type=text onkeypress = parent.fin.purMasterUi.modified(true); style='width:90%; text-align:" + args.columnAlign + ";' id='" + args.columnName + "' value='" + args.columnValue + "'></input></td>";
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
			var title = "";
			
			rowHtml = "<select onchange=parent.fin.purMasterUi.modified(true); id='" + args.columnName + "' style='width:100%;'>"			
	
			for (var index = 0; index < me.houseCodeJobs.length; index++) {
				title = me.houseCodeJobs[index].jobNumber + " - " + me.houseCodeJobs[index].jobTitle;
				if (args.columnValue == title)
					rowHtml += "	<option title='" + title + "' value='" + me.houseCodeJobs[index].id + "' selected>" + title + "</option>";
				else
					rowHtml += "	<option title='" + title + "' value='" + me.houseCodeJobs[index].id + "'>" + title + "</option>";
			}				
			
			rowHtml += "</select>"
			
			return rowHtml;
		},
		
		purchaseOrderGridColumnEdit: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = 0;
			var dataRow = 0;
	
			if (me.rowBeingEdited) 
				return;
				
			$("#PurchaseOrderGridBody").find('tr').each(function() {
				rowNumber++;

				if (parseInt(this.cells[1].innerHTML) > 0) {
					rowHtml = me.getPODetailGridRow(
						rowNumber
						, true
						, parseInt(this.cells[1].innerHTML)
						, this.cells[2].innerHTML
						, this.cells[3].innerHTML
						, this.cells[4].innerHTML
						, this.cells[5].innerHTML
						, this.cells[6].innerHTML
						, this.cells[7].innerHTML
						, this.cells[8].innerHTML
						, this.cells[9].innerHTML
						, this.cells[10].innerHTML
						, this.cells[11].innerHTML
						, this.cells[12].innerHTML
						, me.purchaseOrderDetails[dataRow].priceChanged
						)
						
					dataRow++;
					$(this).html(rowHtml);
					
					$("#qtyOverride" + rowNumber).change(function() { parent.fin.purMasterUi.modified(true); });
					$("#qtyOverride" + rowNumber).keypress(function (e) {
						if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
							return false;
					});
				}
			});
			
			me.rowBeingEdited = true;
			me.status = "EditQuantity";
		},
		
		purchaseOrderGridAddItems: function() {
			var me = this;
			
			if (me.rowBeingEdited)
				return true;
				
			me.rowBeingEdited = true;
			parent.fin.purMasterUi.actionAddItems();
		},
		
		purchaseOrderGridRowDelete: function() {
			var me = this;
					
			if (me.rowBeingEdited || me.currentRowSelected == null) 
				return;
	
			if (parseInt(me.currentRowSelected.cells[1].innerHTML) > 0) {
				
				var itemNumber = me.currentRowSelected.cells[4].innerHTML;
				if (confirm("Are you sure you would like to delete the Item # " + itemNumber + " ?")) {
					me.rowBeingEdited = true;
					me.status = "Delete";
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

		actionViewOrder: function fin_pur_openOrder_actionViewOrder() {
			var me = this;
			
			if (me.purchaseOrderId < 0) 
				return;

			window.open(location.protocol + '//' + location.hostname + '/reports/po.aspx?purchaseorder=' + me.purchaseOrderId,'PrintPO','type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
		},
		
		actionUndoItem: function() {
			var me = this;		
			var rowHtml = "";
			var rowNumber = 0;
			var dataRow = 0;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.status == "EditQuantity") {
				$("#PurchaseOrderGridBody").find('tr').each(function() {
					rowNumber++;
					
					if (parseInt(this.cells[1].innerHTML) > 0) {
						rowHtml = me.getPODetailGridRow(
							rowNumber
							, false
							, parseInt(this.cells[1].innerHTML)
							, this.cells[2].innerHTML
							, me.getJobTitle(me.purchaseOrderDetails[dataRow].houseCodeJob)
							, this.cells[4].innerHTML
							, this.cells[5].innerHTML
							, this.cells[6].innerHTML
							, this.cells[7].innerHTML
							, this.cells[8].childNodes[0].defaultValue
							, this.cells[9].innerHTML
							, this.cells[10].innerHTML
							, this.cells[11].innerHTML
							, this.cells[12].innerHTML
							, me.purchaseOrderDetails[dataRow].priceChanged
							)
						
						dataRow++;
						$(this).html(rowHtml);
					}
				});
			}			

			me.rowBeingEdited = false;
			me.status = "";			
			me.purchaseOrderGridMouseDownEventSetup();
		},		
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			
			if (me.status == "")
				return true;
							
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();			

			var xml = me.saveXmlBuildPurchaseOrder(item);
	
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildPurchaseOrder: function() {
			var args = ii.args(arguments,{
				item: {type: [fin.pur.openOrder.PurchaseOrder]}
			});			
			var me = this;
			var rowNumber = 1;
			var quantity = 0;
			var xml = "";			
			
			if (me.status == "EditQuantity") {
				$("#PurchaseOrderGridBody").find('tr').each(function() {
						
					if (parseInt(this.cells[1].innerHTML) > 0) {
						
						if ($("#qtyOverride" + rowNumber).val() == "")
							quantity = 0;
						else
							quantity = parseInt($("#qtyOverride" + rowNumber).val());
									
						xml += '<purPurchaseOrderDetail';
						xml += ' id="' + parseInt(this.cells[1].innerHTML) + '"';
						xml += ' purchaseOrderId="' + me.purchaseOrderId + '"';
						xml += ' catalogItemId="0"';
						xml += ' houseCodeJobId="' + parseInt($("#job" + rowNumber).val()) + '"';
						xml += ' price="' + parseFloat(this.cells[9].innerHTML.substring(1)) + '"';
						xml += ' quantity="' + quantity + '"';
						xml += ' quantityReceived="0"';
						xml += '/>';	
					}
					
					rowNumber++;
				});
			}
			else if (me.status == "Delete") {
				xml += '<purPurchaseOrderDetailDelete';
				xml += ' id="' + parseInt(me.currentRowSelected.cells[1].innerHTML) + '"';
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
			var traceType = ii.traceTypes.errorDataCorruption;
						
			if (status == "success") {	
				parent.fin.purMasterUi.modified(false);			
				me.status = "";
				me.rowBeingEdited = false;
				me.currentRowSelected = null;
				me.bindRow = true;
				me.purchaseOrderDetailStore.reset();	
				me.purchaseOrderDetailStore.fetch("userId:[user],purchaseOrder:" + me.purchaseOrderId, me.purchaseOrderDetailsLoaded, me);
			}
			else {
				errorMessage = $(args.xmlNode).attr("error");
				if(status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
				alert("Error while updating Purchase Order Record: " + $(args.xmlNode).attr("message") + " " + errorMessage);
				$("#pageLoading").hide();
			}
		}
		
	}
});

function main() {
	fin.openOrderUi = new fin.pur.openOrder.UserInterface();
	fin.openOrderUi.resize();
}

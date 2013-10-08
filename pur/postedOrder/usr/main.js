ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.pur.postedOrder.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.button" , 5);

ii.Class({
    Name: "fin.pur.postedOrder.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");
				
			me.purchaseOrderId = searchString.substring(pos + 1);
			me.rowBeingEdited = false;
			me.status = ""
						
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(me.gateway, function(status, errorMessage){
				me.nonPendingError(status, errorMessage);
			});
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "pur\\postedOrder";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			
			me.houseCodeJobsLoaded();
		},
		
		authorizationProcess: function fin_pur_postedOrder_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			//$("#pageLoading").fadeOut("slow");
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pur_postedOrder_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var width = 0;
			var gridDiv = $("#divPurchaseOrderGrid");
			
			width = gridDiv[0].offsetWidth - gridDiv[0].clientWidth;
			
			$("#divPurchaseOrderGrid").height($(window).height() - 85);
			$("#PurchaseOrderGrid").width(gridDiv.width() - width);
		},
				
		defineFormControls: function() {
			var me = this;
						
			me.anchorEdit = new ui.ctl.buttons.Sizeable({
				id: "AnchorEdit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Edit&nbsp;&nbsp;</span>",
				clickFunction: function(){ me.purchaseOrderGridColumnEdit(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function(){ me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function(){ me.actionUndoItem(); },
				hasHotState: true
			});			
		},
		
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.postedOrder.HouseCodeJob,
				itemConstructorArgs: fin.pur.postedOrder.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.purchaseOrderDetails = [];
			me.purchaseOrderDetailStore = me.cache.register({
				storeId: "purPurchaseOrderDetails",
				itemConstructor: fin.pur.postedOrder.PurchaseOrderDetail,
				itemConstructorArgs: fin.pur.postedOrder.purchaseOrderDetailArgs,
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
				me.houseCodeJobs.push(new fin.pur.postedOrder.HouseCodeJob(job.id, job.jobNumber, job.jobTitle));
			}
			
			parent.fin.purMasterUi.setLoadCount();
			me.purchaseOrderDetailStore.fetch("userId:[user],purchaseOrder:" + me.purchaseOrderId, me.purchaseOrderDetailsLoaded, me);
		},
		
		getJobTitle: function(id) {
			var me = this;
			var jobTitle = "None - None";
			var index = 0;
	
			index = ii.ajax.util.findIndexById(id.toString(), me.houseCodeJobs);
	
			if(index >= 0 && index != undefined)
				jobTitle = me.houseCodeJobs[index].jobNumber + " - " + me.houseCodeJobs[index].jobTitle;

			return jobTitle == "None - None" ? "&nbsp;" : jobTitle;
		},
		
		purchaseOrderDetailsLoaded: function(me, activeId) {
			var index = 0;
			var rowHtml = "";	
			var subTotal = 0;
			var totalCost = 0;
			var category = "";
			var prevCategory = "";
			var showCategory = true;
			var rowNumber = 0;
			
			for(index = 0; index < me.purchaseOrderDetails.length; index++) {
				if (showCategory) {
					category = me.purchaseOrderDetails[index].category;
					prevCategory = category;
					showCategory = false;
				}
				else 
					category = "&nbsp;";
				
				rowNumber++;
				cost = me.purchaseOrderDetails[index].quantityOverride * parseFloat(me.purchaseOrderDetails[index].price);	
				rowHtml += "<tr>";

				rowHtml += me.getPODetailGridRow(
					rowNumber
					, false
					, me.purchaseOrderDetails[index].id
			        , category
					, me.getJobTitle(me.purchaseOrderDetails[index].houseCodeJob)
					, me.purchaseOrderDetails[index].number
					, me.purchaseOrderDetails[index].description
					, me.purchaseOrderDetails[index].unit
					, me.purchaseOrderDetails[index].quantityOverride.toString()
					, me.purchaseOrderDetails[index].quantityReceived.toString()
					, "$" + me.purchaseOrderDetails[index].price
					, "$" + cost.toFixed(2)
					, me.purchaseOrderDetails[index].priceChanged
				);
								
				rowHtml += "</tr>";
				subTotal += cost;
				
				if ((index + 1) < me.purchaseOrderDetails.length) {
					if (me.purchaseOrderDetails[index + 1].category != prevCategory) {
						showCategory = true;
						rowNumber++;
						
						rowHtml += me.getTotalGridRow(rowNumber, subTotal, "Sub Total")
						totalCost += subTotal;
						subTotal = 0;
					}
				}
				else if (index == me.purchaseOrderDetails.length - 1) {
					rowNumber++;
					rowHtml += me.getTotalGridRow(rowNumber, subTotal, "Sub Total")
					totalCost += subTotal;
					subTotal = 0;
				}
			}
			
			rowNumber++;
			rowHtml += me.getTotalGridRow(rowNumber, totalCost, "Total")
			
			$("#PurchaseOrderGrid tbody").html(rowHtml);
			me.orderDetailsLoaded(me);
			me.resize();
			
			if(parent.fin.purMasterUi.purchaseOrdersReadOnly){
				$("#ButtonPlacedOrder").hide();
			}
			
			parent.fin.purMasterUi.checkLoadCount();
		},
		
		getTotalGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, totalAmount: {type: Number, defaultValue: 0}
				, title: {type: String}
			});
			var me = this;
			var rowHtml = "";
			
			rowHtml = "<tr>";
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
				, false
				);
							
			rowHtml += "</tr>";
			
			return rowHtml;
		},
		
		orderDetailsLoaded: function(me) {
								
			$("#PurchaseOrderGrid tr:odd").addClass("gridRow");
        	$("#PurchaseOrderGrid tr:even").addClass("alternateGridRow");
			$("#PurchaseOrderGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");}); 
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
				, quantityOverride: {type: String}
				, quantityReceived: {type: String}
				, unitPrice: {type: String}
				, cost: {type: String}
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
				rowHtml += me.getEditableRowColumn(false, true, 2, "vendor", args.vendor, 15, categoryAlign);
				rowHtml += me.getEditableRowColumn(false, false, 3, "job", args.job, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 4, "itemNumber", args.itemNumber, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 5, "description", args.description, 27, "left");
				rowHtml += me.getEditableRowColumn(false, false, 6, "unit", args.unit, 6, "left");
				rowHtml += me.getEditableRowColumn(false, false, 7, "quantityOverride", args.quantityOverride, 7, "right");
				rowHtml += me.getEditableRowColumn(true, false, 8, "quantityReceived" + args.rowNumber, args.quantityReceived, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 9, "unitPrice", args.unitPrice, 7, "right", args.priceChanged);
				rowHtml += me.getEditableRowColumn(false, false, 10, "cost", args.cost, 7, "right");
			}
			else {
				rowHtml += me.getEditableRowColumn(false, false, 0, "rowNumber", args.rowNumber.toString(), 4, "right");
				rowHtml += me.getEditableRowColumn(false, false, 1, "id", args.id.toString(), 0, "left");
				rowHtml += me.getEditableRowColumn(false, true, 2, "vendor", args.vendor, 15, categoryAlign);
				rowHtml += me.getEditableRowColumn(false, false, 3, "job", args.job, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 4, "itemNumber", args.itemNumber, 10, "left");
				rowHtml += me.getEditableRowColumn(false, false, 5, "description", args.description, 27, "left");
				rowHtml += me.getEditableRowColumn(false, false, 6, "unit", args.unit, 6, "left");
				rowHtml += me.getEditableRowColumn(false, false, 7, "quantityOverride", args.quantityOverride, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 8, "quantityReceived", args.quantityReceived, 7, "right");
				rowHtml += me.getEditableRowColumn(false, false, 9, "unitPrice", args.unitPrice, 7, "right", args.priceChanged);
				rowHtml += me.getEditableRowColumn(false, columnBold, 10, "cost", args.cost, 7, "right");
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
			
			if(args.bold)
				styleName += " font-weight:bold;"
				
			if(args.priceChanged)
				styleName += " color:red;"
								
			if(args.editable)
				return "<td class='gridColumn' align='center'><input type=text style='width:95%; text-align:" + args.columnAlign + ";' id='" + args.columnName + "' value='" + args.columnValue + "'></input></td>";
			else if(args.columnWidth == 0)
				return "<td class='gridColumnHidden'>" + args.columnValue + "</td>";
			else 
				return "<td class='gridColumn' width='" + args.columnWidth + "%' style='" + styleName + "'>" + args.columnValue + "</td>";
		},
		
		purchaseOrderGridColumnEdit: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = 0;
			var dataRow = 0;
	
			if(me.rowBeingEdited) 
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
						, me.purchaseOrderDetails[dataRow].priceChanged
						)
					
					dataRow++;
					$(this).html(rowHtml);
					
					$("#quantityReceived" + rowNumber).change(function() { parent.fin.purMasterUi.modified(true); });
					$("#quantityReceived" + rowNumber).keypress(function (e) {
						if( e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
							return false;
					});
				}
			});

			me.rowBeingEdited = true;
			me.status = "EditQuantity";
		},
		
		purchaseOrderGridRowSet: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = 0;
			var dataRow = 0;
	
			$("#PurchaseOrderGridBody").find('tr').each(function() {
				rowNumber++;

				if (parseInt(this.cells[1].innerHTML) > 0) {
					rowHtml = me.getPODetailGridRow(
						rowNumber
						, false
						, parseInt(this.cells[1].innerHTML)
						, this.cells[2].innerHTML
						, this.cells[3].innerHTML
						, this.cells[4].innerHTML
						, this.cells[5].innerHTML
						, this.cells[6].innerHTML
						, this.cells[7].innerHTML
						, $("#quantityReceived" + rowNumber).val()
						, this.cells[9].innerHTML
						, this.cells[10].innerHTML
						, me.purchaseOrderDetails[dataRow].priceChanged
						)
					
					dataRow++;
					$(this).html(rowHtml);
				}
			});
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
							, this.cells[3].innerHTML
							, this.cells[4].innerHTML
							, this.cells[5].innerHTML
							, this.cells[6].innerHTML
							, this.cells[7].innerHTML
							, this.cells[8].childNodes[0].defaultValue
							, this.cells[9].innerHTML
							, this.cells[10].innerHTML
							, me.purchaseOrderDetails[dataRow].priceChanged
							)
						
						dataRow++;
						$(this).html(rowHtml);
					}
				});
			}

			me.rowBeingEdited = false;
			me.status = "";
			parent.fin.purMasterUi.setStatus("Loaded");
		},
		
		actionSaveItem: function(){
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			
			if (me.status == "")
				return true;
			
			parent.fin.purMasterUi.pageLoading();

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
		
		saveXmlBuildPurchaseOrder: function (){
			var args = ii.args(arguments,{
				item: {type: [fin.pur.postedOrder.PurchaseOrder]}
			});
			var me = this;
			var rowNumber = 1;
			var quantityReceived = 0; 
			var xml = "";		
			
			  if (me.status == "EditQuantity") {
				$("#PurchaseOrderGridBody").find('tr').each(function() {
						
					if (parseInt(this.cells[1].innerHTML) > 0) {
						
						if ($("#quantityReceived" + rowNumber).val() == "")
							quantityReceived = 0;
						else
							quantityReceived = parseInt($("#quantityReceived" + rowNumber).val());	
									
						xml += '<purPurchaseOrderDetail';
						xml += ' id="' + parseInt(this.cells[1].innerHTML) + '"';
						xml += ' purchaseOrderId="' + me.purchaseOrderId + '"';
						xml += ' catalogItemId="0"';
						xml += ' price="' + parseFloat(this.cells[9].innerHTML.substring(1)) + '"';
						xml += ' quantity="' + parseFloat(this.cells[7].innerHTML) + '"';
						xml += ' quantityReceived="' + quantityReceived + '"';
						xml += '/>';	
					}
					
					rowNumber++;
				});
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
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
						
			if (status == "success") {
				me.status = "";
				me.rowBeingEdited = false;
				me.purchaseOrderGridRowSet();	
				parent.fin.purMasterUi.modified(false);
				parent.fin.purMasterUi.setStatus("Saved");
			}
			else {
				parent.fin.purMasterUi.setStatus("Error");
				alert('Error while updating Purchase Order Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				if(status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
			
			parent.fin.purMasterUi.pageLoaded();
		}

	}
});

function main() {
	fin.postedOrderUi = new fin.pur.postedOrder.UserInterface();
	fin.postedOrderUi.resize();
}

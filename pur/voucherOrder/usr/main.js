ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "fin.pur.voucherOrder.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.button", 4 );

ii.Class({
    Name: "fin.pur.voucherOrder.UserInterface",
    Definition: {
		init: function() {
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");

			me.purchaseOrderId = searchString.substring(pos + 1);

			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "pur\\voucherOrder";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);
			me.defineFormControls();
			me.configureCommunications();
			me.houseCodeJobsLoaded();

			$("#pageBody").show();
			$(window).bind("resize", me, me.resize);
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			$("#divPurchaseOrderGrid").height($(window).height() - 55);
		},

		defineFormControls: function() {

		},

		configureCommunications: function() {
			var me = this;

			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.voucherOrder.HouseCodeJob,
				itemConstructorArgs: fin.pur.voucherOrder.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});

			me.purchaseOrderDetails = [];
			me.purchaseOrderDetailStore = me.cache.register({
				storeId: "purPurchaseOrderDetails",
				itemConstructor: fin.pur.voucherOrder.PurchaseOrderDetail,
				itemConstructorArgs: fin.pur.voucherOrder.purchaseOrderDetailArgs,
				injectionArray: me.purchaseOrderDetails
			});
		},

		resetGrid: function() {
			$("#PurchaseOrderGrid tbody").html("");
		},

		houseCodeJobsLoaded: function() {
			var me = this;
			var job;

			for (var index = 0; index < parent.fin.purMasterUi.houseCodeJobs.length; index++) {
				job = parent.fin.purMasterUi.houseCodeJobs[index];
				me.houseCodeJobs.push(new fin.pur.voucherOrder.HouseCodeJob(job.id, job.jobNumber, job.jobTitle));
			}

			parent.fin.purMasterUi.setLoadCount();
			me.purchaseOrderDetailStore.fetch("userId:[user],purchaseOrder:" + me.purchaseOrderId, me.purchaseOrderDetailsLoaded, me);
		},

		getJobTitle: function(id) {
			var me = this;
			var jobTitle = "None - None";
			var index = 0;

			index = ii.ajax.util.findIndexById(id.toString(), me.houseCodeJobs);

			if (index !== null && index !== undefined)
				jobTitle = me.houseCodeJobs[index].jobNumber + " - " + me.houseCodeJobs[index].jobTitle;

			return jobTitle === "None - None" ? "&nbsp;" : jobTitle;
		},

		getAccountCode: function(id) {
		    var accountCode = "";

		    for (var index = 0; index < parent.fin.purMasterUi.glAccounts.length; index++) {
		        var item = parent.fin.purMasterUi.glAccounts[index];
		        if (id === item.id) {
		            accountCode = item.code;
		            break;
		        }
		    }
		    return accountCode;
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
			if (parent.fin.purMasterUi.purchaseOrders[parent.fin.purMasterUi.lastSelectedRowIndex].miscPurchaseOrder)
			    $("#divPODHeader")[0].innerHTML = "Miscellaneous Purchase Order Details";
			else
			    $("#divPODHeader")[0].innerHTML = "Purchase Order Details";

			for(index = 0; index < me.purchaseOrderDetails.length; index++) {
				if (showCategory) {
					category = me.purchaseOrderDetails[index].category;
					prevCategory = category;
					showCategory = false;
				}
				else
					category = "&nbsp;";

				rowNumber++;
				var cost = me.purchaseOrderDetails[index].quantity * parseFloat(me.purchaseOrderDetails[index].price);
				rowHtml += "<tr>";

				rowHtml += me.getPODetailGridRow(
					rowNumber
					, me.purchaseOrderDetails[index].id
			        , category
					, me.getJobTitle(me.purchaseOrderDetails[index].houseCodeJob)
					, me.purchaseOrderDetails[index].number
					, me.purchaseOrderDetails[index].description
                    , me.getAccountCode(me.purchaseOrderDetails[index].accountId)
					, me.purchaseOrderDetails[index].unit
					, me.purchaseOrderDetails[index].quantity.toString()
					, "$" + me.purchaseOrderDetails[index].price
					, "$" + cost.toFixed(2)
					, me.purchaseOrderDetails[index].priceChanged
				);

				rowHtml += "</tr>";

				subTotal += cost;

				if ((index + 1) < me.purchaseOrderDetails.length) {
					if (me.purchaseOrderDetails[index + 1].category !== prevCategory) {
						showCategory = true;
						rowNumber++;

						rowHtml += me.getTotalGridRow(rowNumber, subTotal, "Sub Total");
						totalCost += subTotal;
						subTotal = 0;
					}
				}
				else if (index === me.purchaseOrderDetails.length - 1) {
					rowNumber++;
					rowHtml += me.getTotalGridRow(rowNumber, subTotal, "Sub Total");
					totalCost += subTotal;
					subTotal = 0;
				}
			}

			rowNumber++;
			rowHtml += me.getTotalGridRow(rowNumber, totalCost, "Total");

			$("#PurchaseOrderGrid tbody").html(rowHtml);
			me.orderDetailsLoaded();
			me.resize();
			parent.fin.purMasterUi.checkLoadCount();
		},

		orderDetailsLoaded: function() {

			$("#PurchaseOrderGrid tr:odd").addClass("gridRow");
        	$("#PurchaseOrderGrid tr:even").addClass("alternateGridRow");

			$("#PurchaseOrderGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
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

		getPODetailGridRow: function() {
			var args = ii.args(arguments,{
				rowNumber: {type: Number}
				, id: {type: Number}
				, vendor: {type: String}
				, job: {type: String}
				, itemNumber: {type: String}
				, description: { type: String }
                , account: { type: String }
				, unit: {type: String}
				, quantity: {type: String}
				, unitPrice: {type: String}
				, cost: {type: String}
				, priceChanged: {type: Boolean}
			});
			var me = this;
			var rowHtml = "";
			var columnBold = false;
			var categoryAlign = "left";

			if (args.id === 0) {
				columnBold = true;
				categoryAlign = "right";
			}

			rowHtml += me.getEditableRowColumn(false, 0, "rowNumber", args.rowNumber.toString(), 4, "right");
			rowHtml += me.getEditableRowColumn(true, 1, "vendor", args.vendor, 15, categoryAlign);
			rowHtml += me.getEditableRowColumn(false, 2, "job", args.job, 10, "left");
			rowHtml += me.getEditableRowColumn(false, 3, "itemNumber", args.itemNumber, 10, "left");
			rowHtml += me.getEditableRowColumn(false, 4, "description", args.description, 34, "left");
			rowHtml += me.getEditableRowColumn(false, 5, "account", args.account.toString(), 10, "left");
			rowHtml += me.getEditableRowColumn(false, 6, "unit", args.unit, 5, "left");
			rowHtml += me.getEditableRowColumn(false, 7, "quantity", args.quantity, 7, "right");
			rowHtml += me.getEditableRowColumn(false, 8, "unitPrice", args.unitPrice, 7, "right", args.priceChanged);
			rowHtml += me.getEditableRowColumn(columnBold, 9, "cost", args.cost, 8, "right");

			return rowHtml;
		},

		getEditableRowColumn: function() {
			var args = ii.args(arguments, {
				bold: {type: Boolean}
				, columnNumber: {type: Number}
				, columnName: {type: String}
				, columnValue: {type: String}
				, columnWidth: {type: Number}
				, columnAlign: {type: String}
				, priceChanged: {type: Boolean, required: false, defaultValue: false}
				});
			var styleName = "";

			styleName = "text-align:" + args.columnAlign + ";";

			if (args.bold)
				styleName += " font-weight:bold;";

			if (args.priceChanged)
				styleName += " color:red;";

			return "<td class='gridColumn' width='" + args.columnWidth + "%' style='" + styleName + "'>" + args.columnValue + "</td>";
		}
	}
});

function main() {
	fin.voucherOrderUi = new fin.pur.voucherOrder.UserInterface();
	fin.voucherOrderUi.resize();
}
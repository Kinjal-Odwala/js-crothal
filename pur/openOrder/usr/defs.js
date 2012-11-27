ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = {openOrder: {}};
}, 1);

ii.init.register( function() {

	fin.pur.openOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.pur.openOrder.purchaseOrderDetailArgs = {
		id: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, category: {type: String, required: false, defaultValue: ""}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, recQuantity: {type: Number, required: false, defaultValue: 0}
		, quantityOverride: {type: Number, required: false, defaultValue: 0}
		, price: {type: String, required: false, defaultValue: ""}
		, priceChanged: {type: Boolean, required: false, defaultValue: false}
		, periodBudget: {type: String, required: false, defaultValue: ""}
		, budgetRemaining: {type: String, required: false, defaultValue: ""}
	};	
	
}, 2);

ii.Class({
	Name: "fin.pur.openOrder.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.openOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.openOrder.PurchaseOrderDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.openOrder.purchaseOrderDetailArgs);
			$.extend(this, args);
		}
	}
});
ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = {placedOrder: {}};
}, 1);

ii.init.register( function() {
	
	fin.pur.placedOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.pur.placedOrder.purchaseOrderDetailArgs = {
		id: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, category: {type: String, required: false, defaultValue: ""}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, quantityOverride: {type: Number, required: false, defaultValue: 0}
		, price: {type: String, required: false, defaultValue: ""}
		, cost: {type: String, required: false, defaultValue: ""}
		, priceChanged: {type: Boolean, required: false, defaultValue: false}
	};	
}, 2);

ii.Class({
	Name: "fin.pur.placedOrder.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.pur.placedOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.placedOrder.PurchaseOrderDetail",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.placedOrder.purchaseOrderDetailArgs);
			$.extend(this, args);
		}
	}
});



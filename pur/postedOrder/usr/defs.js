ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = {postedOrder: {}};
}, 1);

ii.init.register( function() {
	
	fin.pur.postedOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};

	fin.pur.postedOrder.purchaseOrderDetailArgs = {
		id: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, category: {type: String, required: false, defaultValue: ""}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, quantityOverride: {type: Number, required: false, defaultValue: 0}
		, quantityReceived: {type: Number, required: false, defaultValue: 0}
		, price: {type: String, required: false, defaultValue: ""}
		, cost: {type: String, required: false, defaultValue: ""}
		, priceChanged: {type: Boolean, required: false, defaultValue: false}
	};	
}, 2);

ii.Class({
	Name: "fin.pur.postedOrder.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.pur.postedOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.postedOrder.PurchaseOrderDetail",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.postedOrder.purchaseOrderDetailArgs);
			$.extend(this, args);
		}
	}
});
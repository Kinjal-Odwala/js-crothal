ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = { voucherOrder: {} };
}, 1);

ii.init.register( function() {

	fin.pur.voucherOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};

	fin.pur.voucherOrder.purchaseOrderDetailArgs = {
		id: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, category: {type: String, required: false, defaultValue: ""}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
        , accountId: {type: Number, required: false, defaultValue: 0}
		, unit: {type: String, required: false, defaultValue: ""}
		, quantity: {type: Number, required: false, defaultValue: 0}
		, price: {type: String, required: false, defaultValue: ""}
		, cost: {type: String, required: false, defaultValue: ""}
		, priceChanged: {type: Boolean, required: false, defaultValue: false}
	};
}, 2);

ii.Class({
	Name: "fin.pur.voucherOrder.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.voucherOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.voucherOrder.PurchaseOrderDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.voucherOrder.purchaseOrderDetailArgs);
			$.extend(this, args);
		}
	}
});
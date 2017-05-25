ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pay = { payRateType: {} };
}, 1);

ii.init.register( function() {
	
	fin.pay.payRateType.payRateTypeArgs = {
		id: {type: Number, defaultValue: 0}
		, payCode: {type: fin.pay.payRateType.PayCodeType}
		, rateTypeID: {type: String},
	};
	
	fin.pay.payRateType.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.pay.payRateType.PayRateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payRateType.payRateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payRateType.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payRateType.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});
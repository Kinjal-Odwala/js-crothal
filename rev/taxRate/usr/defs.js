ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.rev = { taxRate: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.rev.taxRate.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.rev.taxRate.stateTaxArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, salesTaxRate: {type: String, required: false, defaultValue: ""}
	};

	fin.rev.taxRate.localTaxArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: Number, required: false, defaultValue: 0}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, cityName: {type: String, required: false, defaultValue: ""}
		, citySalesTaxRate: {type: String, required: false, defaultValue: ""}
		, cityTransitSalesTaxRate: {type: String, required: false, defaultValue: ""}
		, countyName: {type: String, required: false, defaultValue: ""}
		, countySalesTaxRate: {type: String, required: false, defaultValue: ""}
		, countyTransitSalesTaxRate: {type: String, required: false, defaultValue: ""}
		, combinedSalesTaxRate: {type: String, required: false, defaultValue: ""}
	};
	
	fin.rev.taxRate.recordCountArgs = {
	    id: {type: Number}
	    , recordCount: {type: Number}
	};
	
	fin.rev.taxRate.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.rev.taxRate.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxRate.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxRate.StateTax",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxRate.stateTaxArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxRate.LocalTax",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxRate.localTaxArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxRate.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxRate.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxRate.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxRate.fileNameArgs);
			$.extend(this, args);
		}
	}
});
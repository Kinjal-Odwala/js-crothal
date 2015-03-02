ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { laundry: {} };

}, 1);

ii.init.register( function() {

	fin.app.laundry.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};	

	fin.app.laundry.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number, defaultValue: 0}
	};

	fin.app.laundry.payPeriodArgs = {
		id: {type: Number}
		, startDate: {type: String, required: false}
		, endDate: {type: String, required: false}
	};
	
	fin.app.laundry.laundryMetricTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
	};
	
	fin.app.laundry.laundryMetricArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, laundryMetricTypeId: {type: Number, required: false, defaultValue: 0}
		, laundryMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, laundryMetricTypeDescription: {type: String, required: false, defaultValue: ""}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, periodId: {type: Number, required: false, defaultValue: 0}
		, sunday: {type: String, required: false, defaultValue: "0.000"}
		, monday: {type: String, required: false, defaultValue: "0.000"}
		, tuesday: {type: String, required: false, defaultValue: "0.000"}
		, wednesday: {type: String, required: false, defaultValue: "0.000"}
		, thursday: {type: String, required: false, defaultValue: "0.000"}
		, friday: {type: String, required: false, defaultValue: "0.000"}
		, saturday: {type: String, required: false, defaultValue: "0.000"}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.app.laundry.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.laundry.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.laundry.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.laundry.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.laundry.PayPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.laundry.payPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.laundry.LaundryMetricType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.laundry.laundryMetricTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.laundry.LaundryMetric",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.laundry.laundryMetricArgs);
			$.extend(this, args);
		}
	}
});

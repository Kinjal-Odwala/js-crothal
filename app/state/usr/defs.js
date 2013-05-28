ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { state: {} };
 
}, 1);

ii.init.register( function() {

	fin.app.state.stateTypeArgs = {
		id: {type: Number, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, minimumWage: {type: Number, required: false, defaultValue: 0.00}
	};
	
	fin.app.state.stateMinimumWageArgs = {
		id: {type: Number}
		, stateMinimumWage: {type: Number}
		, stateType: {type: Number}
		, groupType: {type: Number}
		, name: {type: String, required: false, defaultValue: ""}
		, minimumWage: {type: Number, required: false, defaultValue: 0.00}
		, effectiveDate: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, affectedNumberOfEmployees: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.app.state.countyArgs = {
		id: {type: Number, defaultValue: 0}
		, stateMinimumWage: {type: Number}
		, stateType: {type: Number}
		, groupType: {type: Number}
		, name: {type: String, required: false, defaultValue: ""}
		, minimumWage: {type: Number, required: false, defaultValue: 0.00}
		, effectiveDate: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, affectedNumberOfEmployees: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.app.state.cityArgs = {
		id: {type: Number, defaultValue: 0}
		, stateMinimumWage: {type: Number}
		, stateType: {type: Number}
		, groupType: {type: Number}
		, name: {type: String, required: false, defaultValue: ""}
		, minimumWage: {type: Number, required: false, defaultValue: 0.00}
		, effectiveDate: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, affectedNumberOfEmployees: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.app.state.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.state.StateMinimumWage",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.stateMinimumWageArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.state.County",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.countyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.state.City",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.cityArgs);
			$.extend(this, args);
		}
	}
});
ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { state: {} };
 
}, 1);

ii.init.register( function() {

	fin.app.state.systemVariableArgs = {
		id: {type: Number, defaultValue: 0}
		, variableName: {type: String, required: false, defaultValue: ""}
		, variableValue: {type: String, required: false, defaultValue: ""}	
	};
	
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
	
	fin.app.state.employeePayRateArgs = {
		id: {type: Number, defaultValue: 0}
		, column6: {type: String, required: false, defaultValue: ""} 	// House Code
		, column8: {type: String, required: false, defaultValue: ""} 	// First Name
		, column9: {type: String, required: false, defaultValue: ""} 	// Last Name
		, column10: {type: String, required: false, defaultValue: ""} 	// Employee Number
		, column11: {type: Number, required: false, defaultValue: 0.00} // Current Pay Rate
		, column12: {type: Number, required: false, defaultValue: 0.00} // Updated Pay Rate
		, column13: {type: String, required: false, defaultValue: ""} 	// Approved
		, column14: {type: String, required: false, defaultValue: ""} 	// Status
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.app.state.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.app.state.SystemVariable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.systemVariableArgs);
			$.extend(this, args);			
		}
	}
});

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

ii.Class({
	Name: "fin.app.state.EmployeePayRate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.employeePayRateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.state.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.fileNameArgs);
			$.extend(this, args);
		}
	}
});
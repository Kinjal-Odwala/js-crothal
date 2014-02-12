ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.emp = { hierarchy: {} };
    
}, 1);

ii.init.register( function() { 
	
	fin.emp.hierarchy.jobArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.emp.hierarchy.employeeArgs = {
		id: {type: Number}
		, employeeId: {type: Number}
		, managerId: {type: Number}		
		, employeeName: {type: String, required: false, defaultValue: ""}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, employeeStatus: {type: String, required: false, defaultValue: ""}
		, orgLevel: {type: Number, required: false, defaultValue: 0}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, status: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};	

}, 2);

ii.Class({
	Name: "fin.emp.hierarchy.Job",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.hierarchy.jobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.hierarchy.Employee",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.hierarchy.employeeArgs);
			$.extend(this, args);
		}
	}
});
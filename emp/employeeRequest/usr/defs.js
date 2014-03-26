ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.emp = {};

}, 1);

ii.init.register( function() {

	fin.emp.employeeGeneralArgs = {
		id: {type: Number, defaultValue: 0}
		, column1: {type: String, required: false, defaultValue: ""} 	// Employee Id
		, column2: {type: String, required: false, defaultValue: ""} 	// Person Id
		, column3: {type: String, required: false, defaultValue: ""} 	// House Code Id
		, column4: {type: String, required: false, defaultValue: ""} 	// House Code
		, column5: {type: String, required: false, defaultValue: ""} 	// First Name
		, column6: {type: String, required: false, defaultValue: ""} 	// Last Name
		, column7: {type: String, required: false, defaultValue: ""} 	// Employee Number
		, column8: {type: String, required: false, defaultValue: ""}    // SSN
		, column9: {type: String, required: false, defaultValue: ""}    // Hire Date
		, column10: {type: String, required: false, defaultValue: ""} 	// Original Hire Date
		, column11: {type: String, required: false, defaultValue: ""} 	// Seniority Date
		, column12: {type: String, required: false, defaultValue: ""} 	// Effective Date
		, column13: {type: String, required: false, defaultValue: ""} 	// Effective Date Job
		, column14: {type: String, required: false, defaultValue: ""} 	// Effective Date Compensation
		, column15: {type: String, required: false, defaultValue: ""}   // New Hire Date
		, column16: {type: String, required: false, defaultValue: ""} 	// New Original Hire Date
		, column17: {type: String, required: false, defaultValue: ""} 	// New Seniority Date
		, column18: {type: String, required: false, defaultValue: ""} 	// New Effective Date
		, column19: {type: String, required: false, defaultValue: ""} 	// New Effective Date Job
		, column20: {type: String, required: false, defaultValue: ""} 	// New Effective Date Compensation
		, column21: {type: String, required: false, defaultValue: ""} 	// Notes
		, column22: {type: String, required: false, defaultValue: ""} 	// Status(Approved/Rejected)
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.emp.EmployeeGeneral",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});
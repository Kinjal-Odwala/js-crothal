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
		, column9: {type: String, required: false, defaultValue: ""}    // Hire Date or New SSN or Status
		, column10: {type: String, required: false, defaultValue: ""} 	// Original Hire Date or SSN Notes or Status Category
		, column11: {type: String, required: false, defaultValue: ""} 	// Seniority Date or Active
		, column12: {type: String, required: false, defaultValue: ""} 	// Effective Date or Change Status Code
		, column13: {type: String, required: false, defaultValue: ""} 	// Effective Date Job or Payroll Status
		, column14: {type: String, required: false, defaultValue: ""} 	// Effective Date Compensation or Previous Payroll Status
		, column15: {type: String, required: false, defaultValue: ""}   // New Hire Date or Effective Date
		, column16: {type: String, required: false, defaultValue: ""} 	// New Original Hire Date or Separation Code
		, column17: {type: String, required: false, defaultValue: ""} 	// New Seniority Date or Termination Date
		, column18: {type: String, required: false, defaultValue: ""} 	// New Effective Date or Termination Reason
		, column19: {type: String, required: false, defaultValue: ""} 	// New Effective Date Job or Export EPerson
		, column20: {type: String, required: false, defaultValue: ""} 	// New Effective Date Compensation or Reverse Termination Notes
		, column21: {type: String, required: false, defaultValue: ""} 	// Date Notes or New Status Type
		, column22: {type: String, required: false, defaultValue: ""} 	// Status(Approved/Rejected)
		, column23: {type: String, required: false, defaultValue: ""}	// New Status Category Type
		, column24: {type: String, required: false, defaultValue: ""}   // New Effective Date
		, column25: {type: String, required: false, defaultValue: ""}   // New Separation Code
		, column26: {type: String, required: false, defaultValue: ""}   // New Termination Date
		, column27: {type: String, required: false, defaultValue: ""}   // New Termination Reason
		, column28: {type: String, required: false, defaultValue: ""}   // Status Type Title
		, column29: {type: String, required: false, defaultValue: ""}   // New Status Type Title
		, column30: {type: String, required: false, defaultValue: ""}   // Status Category Type Title
		, column31: {type: String, required: false, defaultValue: ""}   // New Status Category Type Title
		, column32: {type: String, required: false, defaultValue: ""}   // Separation Code Title
		, column33: {type: String, required: false, defaultValue: ""}   // New Separation Code Title
		, column34: {type: String, required: false, defaultValue: ""}   // Termination Reason Title
		, column35: {type: String, required: false, defaultValue: ""}   // New Termination Reason Title
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
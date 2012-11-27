ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.emp = {
		employeeMaster: {}

	};
	
}, 1);

ii.init.register( function() {
	
	fin.emp.employeeMaster.employeeValidationArgs = {
		id: {type: Number},
		hrBlackOutPeriod: {type: Number, required: false},
		validEmployeeAge: {type: Boolean, required: false},
		ptoStartDate: {type: String, required: false},
		dailyPayrollEntries: {type: Number, required: false},
		validSSN: {type: Boolean, required: false, defaultValue: false},
		ssnHouseCode: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.employeeMaster.employeeGeneralArgs = {
		id: {type: Number},
		personId: {type: Number, required: false},
		brief: {type: Boolean, required: false}		
	};
	
}, 2);

ii.Class({
	Name: "fin.emp.employeeMaster.EmployeeValidation",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeeMaster.employeeValidationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeMaster.EmployeeGeneral",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeeMaster.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});

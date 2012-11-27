ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.bud = { employee: {}};

},	1);


ii.init.register( function(){ //debugger;
	
	fin.bud.employee.employeeLockArgs = {
		id: {type: Number},
		employeeName: {type: String, required: false, defaultValue: ""},
		yearsOfService: {type: String, required: false, defaultValue: "0"},
		vacationDays: {type: String, required: false, defaultValue: "0"},
		dueIncrease: {type: String, required: false, defaultValue: "0"},
		payRate: {type: String, required: false, defaultValue: "0"},
		differentialPayRate: {type: String, required: false, defaultValue: "0"},
		otherPayRate: {type: String, required: false, defaultValue: "0"},
		scheduledHours: {type: String, required: false, defaultValue: "0"},
		totalWageRate: {type: String, required: false, defaultValue: "0"},
		costPerPayPeriod: {type: String, required: false, defaultValue: "0"},
		costBeforeDifferential: {type: String, required: false, defaultValue: "0"},
		annual: {type: String, required: false, defaultValue: "0"}
	};	    

}, 2);

ii.Class({
	Name: "fin.bud.employee.EmployeeLock",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.bud.employee.employeeLockArgs);
			$.extend(this, args);
		}
	}
});



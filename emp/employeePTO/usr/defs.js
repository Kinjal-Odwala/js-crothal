ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.emp = {employeePTO: {}};
    
}, 1);

ii.init.register( function(){

	fin.emp.employeePTO.fiscalYearArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};

	fin.emp.employeePTO.payCodeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};

	fin.emp.employeePTO.employeeGeneralArgs = {
		id: {type: Number},
		personId: {type: Number}
	};

	fin.emp.employeePTO.employeePersonalArgs = {
		id: {type: Number},
		personId: {type: Number}
	};

	fin.emp.employeePTO.ptoDefaultArgs = {
		id: {type: Number},
		employeeId: {type: Number},
		fiscalYearId: {type: Number},
		payCodeId: {type: Number},
		openingBalanceHours: {type: String}
	};

	fin.emp.employeePTO.ptoDetailArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		employeeId: {type: Number, required: false, defaultValue: 0},
		payCodeId: {type: fin.emp.employeePTO.PayCode, required: false},
		payCodeTitle: {type: String, required: false, defaultValue: ""},
		ptoDate: {type: String, required: false},
		openingBalanceHours: {type: String, required: false, defaultValue: "0"},
		hours: {type: String},
		adjustmentHours: {type: String, required: false, defaultValue: "0"},
		adjustmentDate: {type: String, required: false, defaultValue: ""},
		notes: {type: String, required: false, defaultValue: ""}
	};

	fin.emp.employeePTO.weekPeriodYearArgs = {
		id: {type: Number},
		week: {type: Number},
		period: {type: Number},
		fiscalYear: {type: Number},
		WeekStartDate: {type: String},
		periodStartDate: {type: String},
		periodEndDate: {type: String}
	};	    
	
}, 2);

ii.Class({
	Name: "fin.emp.employeePTO.FiscalYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.PayCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.payCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.EmployeeGeneral",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.EmployeePersonal",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.employeePersonalArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.PTODefault",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.ptoDefaultArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.PTODetail",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.ptoDetailArgs);
			$.extend(this, args);
			
			if(!this.payCodeId)
				this.payCodeId = [];
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTO.WeekPeriodYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePTO.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});


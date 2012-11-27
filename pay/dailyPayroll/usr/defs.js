ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.pay = { dailyPayroll: {} };
}, 1);

ii.init.register( function() {

	fin.pay.dailyPayroll.weekDayDetailArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}		
	};

    fin.pay.dailyPayroll.workShiftTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.pay.dailyPayroll.payCodeTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, brief: {type: String}
		, name: {type: String}		
	};

	fin.pay.dailyPayroll.dailyPayrollCountArgs = {
	    id: {type: Number, defaultValue: 0}
	    , recordCount: {type: Number}
	};

	fin.pay.dailyPayroll.employeeDetailArgs = {
		id: {type: Number}
		, name: {type: String}
		, employeeNumber: {type: String, required: false}
		, punches: {type: Number, required: false, defaultValue: 0}
	};

	fin.pay.dailyPayroll.employeePayPeriodArgs = {
		id: {type: Number}
		, payPeriodFrequency: {type: String, required: false, defaultValue: ""}
		, payPeriodStartDate: {type: String, required: false, defaultValue: ""}
		, payPeriodEndDate: {type: String, required: false, defaultValue: ""}
		, allowPayrollModification: {type: Boolean, required: false}
		, approve: {type: Boolean, required: false}
	};

	fin.pay.dailyPayroll.employeeWorkShiftArgs = {
		empEmployee: {type: Number}
		, employeeNumber: {type: String}
		, defaultPayCode: {type: Number}
		, workShift: {type: Number}
		, startTime: {type: String, defaultValue: ""}
		, endTime: {type: String, defaultValue: ""}
		, useLunch: {type: Boolean}
		, grossHours: {type: String}
		, netHours: {type: String}
		, productiveHours: {type: String}
		, postedDateTime: {type: String}		
		, employeeShiftStartTime:{type: String}			
		, employeeShiftEndTime:{type: String}
	};

	fin.pay.dailyPayroll.employeePunchArgs = {
		id:  {type: Number, defaultValue: 0}
		, punchTime: {type: String, required: false, defaultValue: ""}
		, overRidetime: {type: String, required: false, defaultValue: ""}
		, useTime:{type: String, required: false, defaultValue: ""}
	};

	fin.pay.dailyPayroll.paycodeAllocationArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, employeePunchPayCodeAllocation: {type: Number, required: false, defaultValue: 0}
		, employeeDailyPayroll: {type: Number, required: false, defaultValue: 0}
		, punchDate: {type: String, required: false, defaultValue: ""}
		, payCode: {type: fin.pay.dailyPayroll.PayCodeType, required: false, defaultValue: 1}
		, hours: {type: String, required: false, defaultValue: "0"}
		, remainingHours: {type: String, required: false, defaultValue: "0"}
		, weeklyTotalHours: {type: String, required: false, defaultValue: "0"}
		, modified: {type: Boolean, required: false, defaultValue: false}	
	};

	fin.pay.dailyPayroll.workShiftArgs = {
		id: {type: Number}
		, startTime: {type: String}
		, endTime: {type: String}
		, shiftStartTime: {type: String}
		, shiftEndTime: {type: String}		
	};	
}, 2);

ii.Class({
	Name: "fin.pay.dailyPayroll.WeekDayDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.weekDayDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.WorkShiftType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.workShiftTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.DailyPayrollCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.dailyPayrollCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.EmployeeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.employeeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.EmployeePayPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.employeePayPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.EmployeeWorkShift",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.employeeWorkShiftArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.EmployeePunch",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.employeePunchArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.PaycodeAllocation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.paycodeAllocationArgs);
			$.extend(this, args);
			
			if (!this.payCode) {
				this.payCode = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pay.dailyPayroll.WorkShift",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.dailyPayroll.workShiftArgs);
			$.extend(this, args);
		}
	}
});

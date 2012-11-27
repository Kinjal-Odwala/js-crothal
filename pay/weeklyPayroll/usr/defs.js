ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.pay = { weeklyPayroll: {} };
	
}, 1);

ii.init.register( function() {	
	
	fin.pay.weeklyPayroll.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.pay.weeklyPayroll.weeklyPayrollArgs = {
		id: {type: Number, defaultValue: 0}
		, type: {type: String, required: false}
		, shift: {type: String, required: false}
		, name: {type: String, required: false}
		, employeeNumber: {type: String, required: false}
		, hireDate: {type: String, required: false, defaultValue: ""}
		, payrollHouseCode: {type: String, required: false, defaultValue: ""}
		, payrollHcmHouseCode: {type: String, required: false}
		, job: {type: Number, required: false, defaultValue: 0}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, workOrder: {type: Number, required: false, defaultValue: 0}
		, payCode: {type: String, required: false}
		, payCodeDescription: {type: String, required: false}
		, day1: {type: Number, required: false}
		, day2: {type: Number, required: false}
		, day3: {type: Number, required: false}
		, day4: {type: Number, required: false}
		, day5: {type: Number, required: false}
		, day6: {type: Number, required: false}
		, day7: {type: Number, required: false}
		, status: {type: String, required: false}
		, total: {type: Number, required: false}
		, day1TransactionId: {type: String, required: false}
		, day2TransactionId: {type: String, required: false}
		, day3TransactionId: {type: String, required: false}
		, day4TransactionId: {type: String, required: false}
		, day5TransactionId: {type: String, required: false}
		, day6TransactionId: {type: String, required: false}
		, day7TransactionId: {type: String, required: false}
		, changed: {type: Boolean, required: false, defaultValue: false}
		, newPayCode: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.pay.weeklyPayroll.weeklyPayrollCountArgs = {
	    id: {type: Number, defaultValue: 0}
	    , recordCount: {type: Number}
		, day1: {type: Number, required: false}
		, day2: {type: Number, required: false}
		, day3: {type: Number, required: false}
		, day4: {type: Number, required: false}
		, day5: {type: Number, required: false}
		, day6: {type: Number, required: false}
		, day7: {type: Number, required: false}
	};
	
	fin.pay.weeklyPayroll.weeklyPayrollPayCodeArgs = {
		id: {type: Number, defaultValue: 0}
		, active: {type: Boolean}
		, payCode: {type: String}
		, description: {type: String}
		, amount: {type: String}
		, multiplyFactor: {type: Boolean}
		, addToPayRate: {type: Boolean}
		, addToTotal: {type: Boolean}
		, oneTimeCharge: {type: Boolean}
		, timeAndHalf: {type: Boolean}
		, appliedHours: {type: Number}
		, appliedAmount: {type: Number}
		, employees: {type: Number}
		, totalEmployees: {type: Number}
	};	    
	
	fin.pay.weeklyPayroll.workShiftArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
    };
     
	fin.pay.weeklyPayroll.weekDayArgs = {
		day1: {type: String, required: false, defaultValue: ""}
		, day2: {type: String, required: false, defaultValue: ""}
		, day3: {type: String, required: false, defaultValue: ""}
		, day4: {type: String, required: false, defaultValue: ""}
		, day5: {type: String, required: false, defaultValue: ""}
		, day6: {type: String, required: false, defaultValue: ""}
		, day7: {type: String, required: false, defaultValue: ""}
		, periodStartDate: {type: String, required: false, defaultValue: ""}
		, periodEndDate: {type: String, required: false, defaultValue: ""}
	};
	 
	fin.pay.weeklyPayroll.houseCodeJobArgs = {
        id: {type: Number}
        , jobId: {type: Number, required: false, defaultValue: 0}
        , jobTitle: {type: String, required: false, defaultValue: ""}
		, jobNumber: {type: String, required: false, defaultValue: ""}
     };
	 
	fin.pay.weeklyPayroll.workOrderArgs = {
		id: {type: Number}
		, workOrderNumber: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.pay.weeklyPayroll.pageRowArgs = {
	    id: {type: Number}
	    , startingRowNumber: {type: Number}
		, totalRows: {type: Number}
	};
	
	fin.pay.weeklyPayroll.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
		, addToTotal: {type: Boolean}
	};
		
}, 2);

ii.Class({
	Name: "fin.pay.weeklyPayroll.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WeeklyPayroll",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.weeklyPayrollArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WeeklyPayrollCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.weeklyPayrollCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WeeklyPayrollPayCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.weeklyPayrollPayCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WorkShift",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.workShiftArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WeekDay",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.weekDayArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.PayrollHouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.payrollHouseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.WorkOrder",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.workOrderArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.PageRow",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.pageRowArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.weeklyPayroll.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.weeklyPayroll.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});
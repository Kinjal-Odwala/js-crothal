ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.emp = { employeePTOSetup: {} };

}, 1);

ii.init.register( function() {

	fin.emp.employeePTOSetup.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};	

	fin.emp.employeePTOSetup.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number, defaultValue: 0}
	};

	fin.emp.employeePTOSetup.houseCodeDetailArgs = {
		id: {type: Number}
		, ptoStartDate: {type: String, required: false, defaultValue: ""},
	};

	fin.emp.employeePTOSetup.ptoTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.employeePTOSetup.ptoYearArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.employeePTOSetup.ptoPlanTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, minHours: {type: Number, required: false, defaultValue: 0}
		, maxHours: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.emp.employeePTOSetup.ptoEmployeeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, ptoAssignmentId: {type: Number, required: false, defaultValue: 0}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.emp.employeePTOSetup.ptoPlanArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, ptoYear: {type: fin.emp.employeePTOSetup.PTOYear, required: false}
		, ptoType: {type: fin.emp.employeePTOSetup.PTOType, required: false}
		, ptoPlanType: {type: fin.emp.employeePTOSetup.PTOPlanType, required: false}
		, title: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, endDate: {type: String, required: false, defaultValue: ""}
		, days: {type: Number, required: false, defaultValue: 0}
		, accrual: {type: Boolean, required: false, defaultValue: true}
		, accrualInterval: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.emp.employeePTOSetup.ptoAssignmentArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptoPlanId: {type: Number, required: false, defaultValue: 0}
		, employeeId: {type: Number, required: false, defaultValue: 0}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.emp.employeePTOSetup.ptoDayArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, employeeId: {type: Number, required: false, defaultValue: 0}
		, ptoType: {type: fin.emp.employeePTOSetup.PTOType, required: false}
		, weeklyPayrollId: {type: Number, required: false, defaultValue: 0}
		, ptoDate: {type: Date, required: false}
		, hours: {type: String, required: false, defaultValue: "0"}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.emp.employeePTOSetup.managementPTOAssignmentArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptoPlanId: {type: Number, required: false, defaultValue: 0}
		, employeeId: {type: Number, required: false, defaultValue: 0}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.emp.employeePTOSetup.managementPTODayArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, employeeId: {type: Number, required: false, defaultValue: 0}
		, ptoType: {type: fin.emp.employeePTOSetup.PTOType, required: false}
		, startDate: {type: Date, required: false}
		, endDate: {type: Date, required: false}
		, hours: {type: String, required: false, defaultValue: "0"}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.emp.employeePTOSetup.ptoEmployeeBalanceHourArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, employeeId: {type: Number, required: false, defaultValue: 0}
		, ptoType: {type: fin.emp.employeePTOSetup.PTOType, required: false}
		, balanceHours: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.emp.employeePTOSetup.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};
	
	fin.emp.employeePTOSetup.ptoTypePayCodeArgs = {
		id: {type: Number}
		, ptoTypeId: {type: Number}
		, payCodeId: {type: Number}
		, status: {type: String, required: false, defaultValue: ""}
	};

	fin.emp.employeePTOSetup.employeePayPeriodArgs = {
		id: {type: Number}
		, payPeriodStartDate: {type: String, required: false, defaultValue: ""}
		, payPeriodEndDate: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.emp.employeePTOSetup.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOPlanType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoPlanTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOEmployee",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoEmployeeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOPlan",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoPlanArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOAssignment",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoAssignmentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTODay",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoDayArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.ManagementPTOAssignment",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.managementPTOAssignmentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.ManagementPTODay",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.managementPTODayArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOEmployeeBalanceHour",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoEmployeeBalanceHourArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.PTOTypePayCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.ptoTypePayCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeePTOSetup.EmployeePayPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeePTOSetup.employeePayPeriodArgs);
			$.extend(this, args);
		}
	}
});
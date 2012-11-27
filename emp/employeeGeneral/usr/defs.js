ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.emp = {};
    
}, 1);

ii.init.register( function(){
	
	fin.emp.hirNodeArgs = {
		id: {type: Number},
		nodeParentId: {type: Number},
		hirLevel: {type: Number, required: false, defaultValue: 0},
		hierarchyId: {type: Number, required: false, defaultValue: 0},
		brief: {type: String, required: false, defaultValue: ""},
		title: {type: String, required: false, defaultValue: ""},
		childNodeCount: {type: Number, required: false, defaultValue: 0},
		active: {type: Boolean, required: false, defaultValue: true}
	};
		
	fin.emp.employeeGeneralArgs = {
		id: {type: Number},
		hcmHouseCode: {type: String, required: false, defaultValue: "0"},
		hirNode: {type: String, required: false, defaultValue: "0"},
		personId: {type: String, required: false, defaultValue: "0"},
		brief: {type: String, required: false, defaultValue: ""},
		active: {type: Boolean, required: false, defaultValue: false},
		ssn: {type: String, required: false, defaultValue: ""},
		statusType: {type: Number, required: false, defaultValue: 0},
		statusCategoryType: {type: Number, required: false, defaultValue: 0},
		houseCodeJob: {type: Number, required: false, defaultValue: 0},
		payrollCompany: {type: Number, required: false, defaultValue: 0},
		deviceGroup: {type: Number, required: false, defaultValue: 0},
		maritalStatusType: {type: Number, required: false, defaultValue: 0},
		exempt: {type: Boolean, required: false, defaultValue: false},		
		jobCode: {type: Number, required: false, defaultValue: 0},
		hourly: {type: Boolean, required: false, defaultValue: false},
		hireDate: {type: String, required: false, defaultValue: ""},
		rateChangeReason: {type: Number, required: false, defaultValue: 0},
		rateChangeDate: {type: String, required: false, defaultValue: ""},
		originalHireDate: {type: String, required: false, defaultValue: ""},
		seniorityDate: {type: String, required: false, defaultValue: ""},
		effectiveDate: {type: String, required: false, defaultValue: ""},
		effectiveDateJob: {type: String, required: false, defaultValue: ""},
		effectiveDateCompensation: {type: String, required: false, defaultValue: ""},		
		terminationDate: {type: String, required: false, defaultValue: ""},
		terminationReason: {type: Number, required: false, defaultValue: 0},
		workShift: {type: Number, required: false, defaultValue: 0},
		benefitsPercentage: {type: String, required: false, defaultValue: ""},
		scheduledHours: {type: String, required: false, defaultValue: ""},
		unionEmployee: {type: Boolean, required: false, defaultValue: false},
		unionType: {type: Number, required: false, defaultValue: 0},
		crothallEmployee: {type: Boolean, required: false, defaultValue: false},
		employeeNumber: {type: String, required: false, defaultValue: ""},
		ptoAccruedHourEntryAutomatic: {type: Boolean, required: false, defaultValue: false}, // Automatic & Manual
		ptoStartDate: {type: String, required: false, defaultValue: ""},
		payRate: {type: String, required: false, defaultValue: ""},
    	payRateEnteredBy: {type: String, required: false, defaultValue: ""},
		payRateEnteredAt: {type: String, required: false, defaultValue: ""},
		prevPayRate: {type: String, required: false, defaultValue: ""},
		prevPayRateEnteredAt: {type: String, required: false, defaultValue: ""},
		prevPayRateEnteredBy: {type: String, required: false, defaultValue: ""},
		prevPrevPayRate: {type: String, required: false, defaultValue: ""},
		prevPrevPayRateEnteredBy: {type: String, required: false, defaultValue: ""},
		prevPrevPayRateEnteredAt: {type: String, required: false, defaultValue: ""},
		alternatePayRateA: {type: String, required: false, defaultValue: ""},
		alternatePayRateB: {type: String, required: false, defaultValue: ""},
		alternatePayRateC: {type: String, required: false, defaultValue: ""},
		alternatePayRateD: {type: String, required: false, defaultValue: ""},
		genderType: {type: Number, required: false, defaultValue: 0},
		ethnicityType: {type: Number, required: false, defaultValue: 0},
		birthDate: {type: String, required: false, defaultValue: ""},
		reviewDate: {type: String, required: false, defaultValue: ""},
		workPhone: {type: String, required: false, defaultValue: ""},
		workPhoneExt: {type: String, required: false, defaultValue: ""},
		backGroundCheckDate: {type: String, required: false, defaultValue: ""},
		federalExemptions: {type: String, required: false, defaultValue: ""},
		federalAdjustmentType: {type: Number, required: false, defaultValue: 0},
		taxMaritalStatusType: {type: Number, required: false, defaultValue: 0},
		federalAdjustmentAmount: {type: String, required: false, defaultValue: ""},
		primaryState: {type: Number, required: false, defaultValue: 0},
		secondaryState: {type: Number, required: false, defaultValue: 0},
		primaryMaritalStatusType: {type: Number, required: false, defaultValue: 0},
		secondaryMaritalStatusType: {type: Number, required: false, defaultValue: 0},
		stateExemptions: {type: String, required: false, defaultValue: ""},
		stateAdjustmentType: {type: Number, required: false, defaultValue: 0},
		stateAdjustmentAmount: {type: String, required: false, defaultValue: ""},
		sdiAdjustmentType: {type: Number, required: false, defaultValue: 0},
		sdiRate: {type: String, required: false, defaultValue: ""},
		localTaxAdjustmentType: {type: Number, required: false, defaultValue: 0},
		localTaxAdjustmentAmount: {type: String, required: false, defaultValue: ""},
		localTaxCode1: {type: Number, required: false, defaultValue: 0},
		localTaxCode2: {type: Number, required: false, defaultValue: 0},
		localTaxCode3: {type: Number, required: false, defaultValue: 0},
		
		changeStatusCode: {type: String, required:false, defaultValue: ""},
		payrollStatus: {type: String, required: false, defaultValue: ""},		
		previousPayrollStatus: {type: String, required: false, defaultValue: ""},
		
		appTransactionStatusType: {type: String, required: false, defaultValue: ""},
		frequencyType: {type: Number, required: false, defaultValue: 0},
		i9Type: {type: Number, required: false, defaultValue: 0},
		vetType: {type: Number, required: false, defaultValue: 0},
		separationCode:{type: Number, required: false, defaultValue: 0},
		jobStartReason:{type: Number, required: false, defaultValue: 0},
		crtdBy: {type: String, required: false, defaultValue: ""},
		crtdAt: {type: String, required: false, defaultValue: ""},
		modBy: {type: String, required: false, defaultValue: ""},
		modAt: {type: String, required: false, defaultValue: ""},
		houseCodeChanged: {type: Boolean, required: false, defaultValue: false}
	};

	fin.emp.employeePersonalArgs = {
		id: {type: Number},
		personId: {type: String},
		brief: {type: String, required: false, defaultValue: ""},
		active: {type: Boolean},
		gender: {type: Number},
		ethnicity: {type: Number},
		birthDate: {type: String},
		reviewDate: {type: String, required: false, defaultValue: ""},
		workPhone: {type: String, required: false, defaultValue: ""},
		workPhoneExt: {type: String, required: false, defaultValue: ""},
		backGroundCheckDate: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.newEmployeeNumberArgs = {
		newEmployeeNumber: {type: String}
	};
	
	fin.emp.statusTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.statusCategoryTypeArgs = {
		id: {type: Number},
		empStatusTypeId: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.houseCodeArgs = {
		id: {type: Number},
		appUnit: {type: Number},
		number: {type: Number},
		name: {type: String},
		brief: {type: String},
		hirNode: {type: Number}
	};

	fin.emp.houseCodePayrollCompanyArgs = {
		id: {type: Number},
		title: {type: String},
		number: {type: Number},
		name: {type: String},
		houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"},
		salary: {type: Boolean, defaultValue: false},
		hourly: {type: Boolean, defaultValue: false},
		payFrequencyType: {type: String, defaultValue: ""}
	};
	
	fin.emp.deviceGroupTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.jobCodeTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
/*	
	fin.emp.laundryStatusTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
*/	
	fin.emp.rateChangeReasonTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.terminationReasonTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.workShiftArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.ethnicityTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	/*
	fin.emp.positionTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	*/
	fin.emp.unionTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.payFrequencyTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.i9TypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.vetTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.separationCodeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.jobStartReasonTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.maritalStatusTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.emp.employeeValidationArgs = {
		id: {type: Number},
		hrBlackOutPeriod: {type: Number, required: false},
		validEmployeeAge: {type: Boolean, required: false},
		ptoStartDate: {type: String, required: false},
		dailyPayrollEntries: {type: Number, required: false},
		validSSN: {type: Boolean, required: false, defaultValue: false},
		ssnHouseCode: {type: String, required: false, defaultValue: ""},
		payPeriodStartDate: {type: String, required: false, defaultValue: ""},
		payPeriodEndDate: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.houseCodeJobArgs = {
		id: {type: Number},
		jobNumber: {type: String},
		jobTitle: {type: String}
	};
	
	fin.emp.empEmployeeNumberValidationArgs = {
		id: {type: Number},
		employeeNumber: {type: String}
	};
	
	fin.emp.basicLifeIndicatorTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
}, 2);

ii.Class({
	Name: "fin.emp.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.EmployeeGeneral",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.HouseCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.houseCodeArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.emp.EmployeePersonal",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePersonalArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.StatusType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.statusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.StatusCategoryType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.statusCategoryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.HouseCodePayrollCompany",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.houseCodePayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.DeviceGroupType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.deviceGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.JobCodeType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.jobCodeTypeArgs);
			$.extend(this, args);
		}
	}
});
/*
ii.Class({
	Name: "fin.emp.LaundryStatusType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.laundryStatusTypeArgs);
			$.extend(this, args);
		}
	}
});
*/
ii.Class({
	Name: "fin.emp.RateChangeReasonType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.rateChangeReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.TerminationReasonType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.terminationReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.WorkShift",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.workShiftArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.EthnicityType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.ethnicityTypeArgs);
			$.extend(this, args);
		}
	}
});
/*
ii.Class({
	Name: "fin.emp.PositionType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.positionTypeArgs);
			$.extend(this, args);
		}
	}
});
*/
ii.Class({
	Name: "fin.emp.UnionType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.unionTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.NewEmployeeNumber",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.newEmployeeNumberArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.EmployeeValidation",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeeValidationArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.emp.PayFrequencyType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.payFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.I9Type",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.i9TypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.VetType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.vetTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.SeparationCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.separationCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.JobStartReasonType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.jobStartReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.emp.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.EmpEmployeeNumberValidation",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.emp.empEmployeeNumberValidationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.MaritalStatusType",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.emp.maritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.BasicLifeIndicatorType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.basicLifeIndicatorTypeArgs);
			$.extend(this, args);
		}
	}
});
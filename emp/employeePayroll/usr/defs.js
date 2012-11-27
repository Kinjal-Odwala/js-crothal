ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.emp = {};
    
}, 1);

ii.init.register( function(){
		
		/*
		fin.emp.employeePayrollArgs = {
			id: {type: Number},
			personId: {type: Number},
			brief: {type: String, defaultValue: "Test"},
			active: {type: Boolean, defaultValue: true},
			fedExemptions: {type: String},
			federalAdjustment: {type: Number},
			federalAdjustmentAmount: {type: String},
			stateExemptions: {type: String},
			stateAdjustment: {type: Number},
			stateAdjustmentAmount: {type: String},
			stateAuthorityPrimary: {type: Number},
			stateAuthoritySecondary: {type: Number},
			localAuthorityPrimary: {type: String, defaultValue: ""},
			localAuthoritySecondary: {type: String, defaultValue: ""},
			alternateLocalTax: {type: String, defaultValue: ""},
			stateDistributionRate: {type: String},
			maritalStatus: {type: Number},
			taxMaritalStatus: {type: Number, defaultValue: 0},
			payFrequency: {type: Number},
			alternatePayRateA: {type: String},
			alternatePayRateB: {type: String},
			alternatePayRateC: {type: String},
			alternatePayRateD: {type: String},
			payrollStatus: {type: String, defaultValue: "T"},
			previousPayrollStatus: {type: String, defaultValue: "T"},
			transactionStatusType: {type: Number, defaultValue: 1}
		};	
		*/
		fin.emp.employeeGeneralArgs= {
			id: {type: Number},
			hcmHouseCode: {type: Number, required: false, defaultValue: 0},
			personId: {type: Number, required: false, defaultValue: 0},
			brief: {type: String, required: false, defaultValue: ""},
			active: {type: Boolean, required: false, defaultValue: false},
			ssn: {type: String, required: false, defaultValue: ""},
			statusType: {type: Number, required: false, defaultValue: 0},
			statusCategoryType: {type: Number, required: false, defaultValue: 0},
			payrollCompany: {type: Number, required: false, defaultValue: 0},
			deviceGroup: {type: Number, required: false, defaultValue: 0},
			positionType: {type: Number, required: false, defaultValue: 0},
			positionHours: {type: String, required: false, defaultValue: "0"},
			exempt: {type: Boolean, required: false, defaultValue: false},
			
			jobCode: {type: Number, required: false, defaultValue: 0},
			hourly: {type: Boolean, required: false, defaultValue: false},
			hireDate: {type: String, required: false, defaultValue: ""},
			rateChangeReason: {type: Number, required: false, defaultValue: 0},
			rateChangeDate: {type: String, required: false, defaultValue: ""},
			originalHireDate: {type: String, required: false, defaultValue: ""},
			seniorityDate: {type: String, required: false, defaultValue: ""},
			effectiveDate: {type: String, required: false, defaultValue: ""},
			terminationDate: {type: String, required: false, defaultValue: ""},
			terminationReason: {type: Number, required: false, defaultValue: 0},
			workShift: {type: Number, required: false, defaultValue: 0},
			benefitsPercentage: {type: String, required: false, defaultValue: ""},
			scheduledHours: {type: Number, required: false, defaultValue: 0},
			unionEmployee: {type: Boolean, required: false, defaultValue: false},
			union: {type: Number, required: false, defaultValue: 0},
			laundryStatus: {type: Number, required: false, defaultValue: 0},
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

        //new field added from Payroll and Personals

			genderType: {type: Number, required: false, defaultValue: 0},
			ethnicityType: {type: Number, required: false, defaultValue: 0},
			birthDate: {type: String, required: false, defaultValue: ""},
			reviewDate: {type: String, required: false, defaultValue: ""},
			workPhone: {type: String, required: false, defaultValue: ""},
			workPhoneExt: {type: String, required: false, defaultValue: ""},
			backGroundCheckDate: {type: String, required: false, defaultValue: ""},

			federalExemptions: {type: String, required: false, defaultValue: ""},
			federalAdjustmentType: {type: Number, required: false, defaultValue: 0},
			maritalStatusFederalTaxType: {type: Number, required: false, defaultValue: 0},
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

			payrollStatus: {type: String, required: false, defaultValue: "T"},
			previousPayrollStatus: {type: String, required: false, defaultValue: "T"},
			appTransactionStatusType: {type: String, required: false, defaultValue: ""},
			frequencyType: {type: Number, required: false, defaultValue: 0},

			crtdBy: {type: String, required: false, defaultValue: ""},
			crtdAt: {type: String, required: false, defaultValue: ""},
			modBy: {type: String, required: false, defaultValue: ""},
			modAt: {type: String, required: false, defaultValue: ""}
		};
		
		fin.emp.maritalStatusFederalTaxTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};		
		
		fin.emp.federalAdjustmentArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};
	
		fin.emp.stateAdjustmentTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};	
		
		fin.emp.maritalStatusTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};	
		
		fin.emp.secMaritalStatusTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};	
		
		fin.emp.payFrequencyTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};		
		
		fin.emp.taxStateArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};
		
		fin.emp.sdiAdjustmentTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};
		
		fin.emp.localTaxAdjustmentTypeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};
		
		fin.emp.localTaxCodeArgs = {
			id: {type: Number},
			number: {type: Number},
			name: {type: String}
		};
}, 2);
/*
ii.Class({
	Name: "fin.emp.EmployeePayroll",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.employeePayrollArgs);
			$.extend(this, args);
		}
	}
});
*/
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
	Name: "fin.emp.FederalAdjustment",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.federalAdjustmentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.StateAdjustmentType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.stateAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.MaritalStatusType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.maritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.SecMaritalStatusType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.secMaritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.MaritalStatusFederalTaxType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.maritalStatusFederalTaxTypeArgs);
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
	Name: "fin.emp.TaxState",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.taxStateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.SDIAdjustmentType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.sdiAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.LocalTaxAdjustmentType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.localTaxAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.emp.LocalTaxCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.emp.localTaxCodeArgs);
			$.extend(this, args);
		}
	}
});

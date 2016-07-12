ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.emp = { employeeImport: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.emp.employeeImport.employeeArgs = {
		id: {type: Number}		
		, column1: {type: String, required: false, defaultValue: ""} // houseCode
		, column2: {type: String, required: false, defaultValue: ""} // brief
		, column3: {type: String, required: false, defaultValue: ""} // firstName
		, column4: {type: String, required: false, defaultValue: ""} // lastName
		, column5: {type: String, required: false, defaultValue: ""} // middleName
		, column6: {type: String, required: false, defaultValue: ""} // address1
		, column7: {type: String, required: false, defaultValue: ""} // address2
		, column8: {type: String, required: false, defaultValue: ""} // city
		, column9: {type: String, required: false, defaultValue: ""} // state
		, column10: {type: String, required: false, defaultValue: ""} // postalCode
		, column11: {type: String, required: false, defaultValue: ""} // homePhone
		, column12: {type: String, required: false, defaultValue: ""} // fax
		, column13: {type: String, required: false, defaultValue: ""} // cellPhone
		, column14: {type: String, required: false, defaultValue: ""} // email
		, column15: {type: String, required: false, defaultValue: ""} // pager
		, column16: {type: String, required: false, defaultValue: ""} // ssn
		, column17: {type: String, required: false, defaultValue: ""} // jobCodeType
		, column18: {type: String, required: false, defaultValue: ""} // hireDate
		, column19: {type: String, required: false, defaultValue: ""} // seniorityDate
		, column20: {type: String, required: false, defaultValue: ""} // scheduledHours
		, column21: {type: String, required: false, defaultValue: ""} // union
		, column22: {type: String, required: false, defaultValue: ""} // alternatePayRateA
		, column23: {type: String, required: false, defaultValue: ""} // alternatePayRateB
		, column24: {type: String, required: false, defaultValue: ""} // alternatePayRateC
		, column25: {type: String, required: false, defaultValue: ""} // alternatePayRateD
		, column26: {type: String, required: false, defaultValue: ""} // originalHireDate
		, column27: {type: String, required: false, defaultValue: ""} // unionType
		, column28: {type: String, required: false, defaultValue: ""} // payRate
		, column29: {type: String, required: false, defaultValue: ""} // genderType
		, column30: {type: String, required: false, defaultValue: ""} // ethnicityType
		, column31: {type: String, required: false, defaultValue: ""} // birthDate
		, column32: {type: String, required: false, defaultValue: ""} // backGroundCheckDate
		, column33: {type: String, required: false, defaultValue: ""} // federalExemptions
		, column34: {type: String, required: false, defaultValue: ""} // federalAdjustmentType
		, column35: {type: String, required: false, defaultValue: ""} // maritalStatusFederalTaxType
		, column36: {type: String, required: false, defaultValue: ""} // federalAdjustmentAmount
		, column37: {type: String, required: false, defaultValue: ""} // primaryState
		, column38: {type: String, required: false, defaultValue: ""} // secondaryState
		, column39: {type: String, required: false, defaultValue: ""} // maritalStatusStateTaxTypePrimary
		, column40: {type: String, required: false, defaultValue: ""} // maritalStatusStateTaxTypeSecondary
		, column41: {type: String, required: false, defaultValue: ""} // stateExemptions
		, column42: {type: String, required: false, defaultValue: ""} // stateAdjustmentType
		, column43: {type: String, required: false, defaultValue: ""} // stateAdjustmentAmount
		, column44: {type: String, required: false, defaultValue: ""} // sdiAdjustmentType
		, column45: {type: String, required: false, defaultValue: ""} // sdiRate
		, column46: {type: String, required: false, defaultValue: ""} // localTaxAdjustmentType
		, column47: {type: String, required: false, defaultValue: ""} // localTaxAdjustmentAmount
		, column48: {type: String, required: false, defaultValue: ""} // localTaxCode1
		, column49: {type: String, required: false, defaultValue: ""} // localTaxCode3
		, column50: {type: String, required: false, defaultValue: ""} // localTaxCode3
		, column51: {type: String, required: false, defaultValue: ""} // i9Type
		, column52: {type: String, required: false, defaultValue: ""} // vetType
		, column53: {type: String, required: false, defaultValue: ""} // maritalStatusType
		, column54: {type: String, required: false, defaultValue: ""} // basicLifeIndicatorType
		, column55: {type: String, required: false, defaultValue: ""} // multiRace1
		, column56: {type: String, required: false, defaultValue: ""} // multiRace2
		, column57: {type: String, required: false, defaultValue: ""} // multiRace3
		, column58: {type: String, required: false, defaultValue: ""} // multiRace4
		, column59: {type: String, required: false, defaultValue: ""} // multiRace5
		, column60: {type: String, required: false, defaultValue: ""} // disabilityType
		, column61: {type: String, required: false, defaultValue: ""} // wotcCode
	};
	
	fin.emp.employeeImport.employeeGeneralArgs = {
		id: {type: Number}
	};
	
	fin.emp.employeeImport.bulkImportValidationArgs = {
		id: {type: Number}
		, houseCodes: {type: String, required: false, defaultValue: ""}
		, briefs: {type: String, required: false, defaultValue: ""}
		, ssnNumbers: {type: String, required: false, defaultValue: ""}
		, employeeNumbers: {type: String, required: false, defaultValue: ""}
	};
	
	fin.emp.employeeImport.recordCountArgs = {
	    id: {type: Number, defaultValue: 0}
	    , recordCount: {type: Number}
	};
	
	fin.emp.employeeImport.statusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.statusCategoryTypeArgs = {
		id: {type: Number}
		, empStatusTypeId: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.houseCodePayrollCompanyArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"}
		, salary: {type: Boolean, defaultValue: false}
		, hourly: {type: Boolean, defaultValue: false}
		, payFrequencyType: {type: String, defaultValue: ""}
	};
	
	fin.emp.employeeImport.deviceGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.genderTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.jobCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.rateChangeReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.terminationReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.workShiftArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.ethnicityTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.unionTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.payFrequencyTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.i9TypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.vetTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.separationCodeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.jobStartReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.maritalStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.emp.employeeImport.maritalStatusFederalTaxTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};		
		
	fin.emp.employeeImport.federalAdjustmentArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.emp.employeeImport.stateAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.emp.employeeImport.maritalStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.emp.employeeImport.secMaritalStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.emp.employeeImport.payFrequencyTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};		
	
	fin.emp.employeeImport.stateArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.sdiAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.localTaxAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
		
	fin.emp.employeeImport.localTaxCodeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.emp.employeeImport.basicLifeIndicatorTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.emp.employeeImport.systemVariableArgs = {
		id: {type: Number, defaultValue: 0}
		, variableName: {type: String, required: false, defaultValue: ""}
		, variableValue: {type: String, required: false, defaultValue: ""}	
	};

	fin.emp.employeeImport.disabilityTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.emp.employeeImport.Employee",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.employeeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.EmployeeGeneral",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.BulkImportValidation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.bulkImportValidationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.StatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.statusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.StatusCategoryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.statusCategoryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.HouseCodePayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.houseCodePayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.DeviceGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.deviceGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.GenderType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.genderTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.JobCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.jobCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.RateChangeReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.rateChangeReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.TerminationReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.terminationReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.WorkShift",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.workShiftArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.EthnicityType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.ethnicityTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.UnionType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.unionTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.PayFrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.payFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.I9Type",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.i9TypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.VetType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.vetTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.SeparationCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.separationCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.JobStartReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.jobStartReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.emp.employeeImport.MaritalStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.maritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.FederalAdjustment",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.federalAdjustmentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.StateAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.stateAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.MaritalStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.maritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.SecMaritalStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.secMaritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.MaritalStatusFederalTaxType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.maritalStatusFederalTaxTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.PayFrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.payFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.State",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.stateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.SDIAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.sdiAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.LocalTaxAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.localTaxAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.emp.employeeImport.LocalTaxCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.localTaxCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.BasicLifeIndicatorType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.basicLifeIndicatorTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.SystemVariable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.systemVariableArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.emp.employeeImport.DisabilityType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.employeeImport.disabilityTypeArgs);
			$.extend(this, args);			
		}
	}
});
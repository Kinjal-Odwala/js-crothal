ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { houseCodeImport: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.hcm.houseCodeImport.houseCodeArgs = {
		id: {type: Number}		
		, column1: {type: String, required: false, defaultValue: ""} // brief
		, column2: {type: String, required: false, defaultValue: ""} // title
		, column3: {type: String, required: false, defaultValue: ""} // description
		, column4: {type: String, required: false, defaultValue: ""} // level1
		, column5: {type: String, required: false, defaultValue: ""} // level2
		, column6: {type: String, required: false, defaultValue: ""} // level3
		, column7: {type: String, required: false, defaultValue: ""} // level4
		, column8: {type: String, required: false, defaultValue: ""} // level5
		, column9: {type: String, required: false, defaultValue: ""} // level6
		, column10: {type: String, required: false, defaultValue: ""} // level7
		, column11: {type: String, required: false, defaultValue: ""} // level8
		, column12: {type: String, required: false, defaultValue: ""} // level9
		, column13: {type: String, required: false, defaultValue: ""} // level10
		, column14: {type: String, required: false, defaultValue: ""} // level11
		, column15: {type: String, required: false, defaultValue: ""} // level12
		, column16: {type: String, required: false, defaultValue: ""} // level13
		, column17: {type: String, required: false, defaultValue: ""} // level14
		, column18: {type: String, required: false, defaultValue: ""} // level15
		, column19: {type: String, required: false, defaultValue: ""} // level16
		, column20: {type: String, required: false, defaultValue: ""} // siteTitle
		, column21: {type: String, required: false, defaultValue: ""} // siteAddressLine1
		, column22: {type: String, required: false, defaultValue: ""} // siteAddressLine2
		, column23: {type: String, required: false, defaultValue: ""} // siteCity
		, column24: {type: String, required: false, defaultValue: ""} // siteStateType		
		, column25: {type: String, required: false, defaultValue: ""} // postalCode
		, column26: {type: String, required: false, defaultValue: ""} // county
		, column27: {type: String, required: false, defaultValue: ""} // industryType
		, column28: {type: String, required: false, defaultValue: ""} // primaryBusinessType
		, column29: {type: String, required: false, defaultValue: ""} // locationType
		, column30: {type: String, required: false, defaultValue: ""} // traumaLevelType
		, column31: {type: String, required: false, defaultValue: ""} // profitDesignationType
		, column32: {type: String, required: false, defaultValue: ""} // gpoType
		, column33: {type: String, required: false, defaultValue: ""} // specifyGPO
		, column34: {type: String, required: false, defaultValue: ""} // ownershipType
		, column35: {type: String, required: false, defaultValue: ""} // jdeCompany
		, column36: {type: String, required: false, defaultValue: ""} // startDate
		, column37: {type: String, required: false, defaultValue: ""} // serviceType
		, column38: {type: String, required: false, defaultValue: ""} // enforceLaborControl
		, column39: {type: String, required: false, defaultValue: ""} // serviceLine		
		, column40: {type: String, required: false, defaultValue: ""} // managerName
		, column41: {type: String, required: false, defaultValue: ""} // managerEmail		
		, column42: {type: String, required: false, defaultValue: ""} // managerPhone
		, column43: {type: String, required: false, defaultValue: ""} // managerCellPhone
		, column44: {type: String, required: false, defaultValue: ""} // managerFax
		, column45: {type: String, required: false, defaultValue: ""} // managerPager
		, column46: {type: String, required: false, defaultValue: ""} // managerAssistantName
		, column47: {type: String, required: false, defaultValue: ""} // managerAssistantPhone
		, column48: {type: String, required: false, defaultValue: ""} // clientFirstName
		, column49: {type: String, required: false, defaultValue: ""} // clientLastName
		, column50: {type: String, required: false, defaultValue: ""} // clientTitle
		, column51: {type: String, required: false, defaultValue: ""} // clientPhone
		, column52: {type: String, required: false, defaultValue: ""} // clientFax
		, column53: {type: String, required: false, defaultValue: ""} // clientAssistantName
		, column54: {type: String, required: false, defaultValue: ""} // clientAssistantPhone
		, column55: {type: String, required: false, defaultValue: ""} // managedEmployees
		, column56: {type: String, required: false, defaultValue: ""} // bedsLicensed
		, column57: {type: String, required: false, defaultValue: ""} // patientDays
		, column58: {type: String, required: false, defaultValue: ""} // avgDailyCensus
		, column59: {type: String, required: false, defaultValue: ""} // annualDischarges
		, column60: {type: String, required: false, defaultValue: ""} // avgBedTurnaroundTime
		, column61: {type: String, required: false, defaultValue: ""} // netCleanableSqft
		, column62: {type: String, required: false, defaultValue: ""} // avgLaundryLbs
		, column63: {type: String, required: false, defaultValue: ""} // crothallEmployees
		, column64: {type: String, required: false, defaultValue: ""} // bedsActive
		, column65: {type: String, required: false, defaultValue: ""} // adjustedPatientDaysBudgeted
		, column66: {type: String, required: false, defaultValue: ""} // annualTransfers
		, column67: {type: String, required: false, defaultValue: ""} // annualTransports
		, column68: {type: String, required: false, defaultValue: ""} // shippingAddress1
		, column69: {type: String, required: false, defaultValue: ""} // shippingAddress2		
		, column70: {type: String, required: false, defaultValue: ""} // shippingCity
		, column71: {type: String, required: false, defaultValue: ""} // shippingState
		, column72: {type: String, required: false, defaultValue: ""} // shippingZip
		, column73: {type: String, required: false, defaultValue: ""} // remitToLocation
		, column74: {type: String, required: false, defaultValue: ""} // contractType
		, column75: {type: String, required: false, defaultValue: ""} // termsOfContractType
		, column76: {type: String, required: false, defaultValue: ""} // billingCycleFrequencyType		
		, column77: {type: String, required: false, defaultValue: ""} // financialEntityType		
		, column78: {type: String, required: false, defaultValue: ""} // bankCodeNumber
		, column79: {type: String, required: false, defaultValue: ""} // bankAccountNumber
		, column80: {type: String, required: false, defaultValue: ""} // bankName
		, column81: {type: String, required: false, defaultValue: ""} // bankContact
		, column82: {type: String, required: false, defaultValue: ""} // bankAddress1
		, column83: {type: String, required: false, defaultValue: ""} // bankAddress2		
		, column84: {type: String, required: false, defaultValue: ""} // bankCity
		, column85: {type: String, required: false, defaultValue: ""} // bankState
		, column86: {type: String, required: false, defaultValue: ""} // bankZip
		, column87: {type: String, required: false, defaultValue: ""} // bankPhone
		, column88: {type: String, required: false, defaultValue: ""} // bankFax
		, column89: {type: String, required: false, defaultValue: ""} // bankEmail
		, column90: {type: String, required: false, defaultValue: ""} // invoiceLogoType
		, column91: {type: String, required: false, defaultValue: ""} // stateTaxPercent
		, column92: {type: String, required: false, defaultValue: ""} // localTaxPercent
		, column93: {type: String, required: false, defaultValue: ""} // payrollProcessingLocationType		
		, column94: {type: String, required: false, defaultValue: ""} // defaultLunchBreak
		, column95: {type: String, required: false, defaultValue: ""} // lunchBreakTrigger
		, column96: {type: String, required: false, defaultValue: ""} // houseCodeType
		, column97: {type: String, required: false, defaultValue: ""} // roundingTimePeriod
		, column98: {type: String, required: false, defaultValue: ""} // timeAndAttendance
		, column99: {type: String, required: false, defaultValue: ""} // ePaySite
		, column100: {type: String, required: false, defaultValue: ""} // ePayGroupType
		, column101: {type: String, required: false, defaultValue: ""} // payrollCompanyHourly
		, column102: {type: String, required: false, defaultValue: ""} // payrollCompanySalaried
	};
	
	fin.hcm.houseCodeImport.bulkImportValidationArgs = {
		id: {type: Number}
		, briefs: {type: String, required: false, defaultValue: ""}
		, fullPaths: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.hcm.houseCodeImport.recordCountArgs = {
	    id: {type: Number, defaultValue: 0}
	    , recordCount: {type: Number}
	};
	
	fin.hcm.houseCodeImport.siteMasterArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.industryTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.primaryBusinessTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.locationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.traumaLevelTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.profitDesignationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.ownershipTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.gpoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.serviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.houseCodeServiceArgs = {
		id: {type: Number}
		, houseCode: {type: String}
		, serviceTypeId: {type: Number}
		, number: {type: Number}
		, serviceType: {type: String}
	};
	
	fin.hcm.houseCodeImport.serviceLineArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.houseCodeImport.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.remitToArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.contractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.termsOfContractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeImport.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.budgetTemplateArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.budgetLaborCalcMethodArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.payPayrollCompanyArgs = {
		id: {type: Number}
		, name: {type: String}
		, houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"}
		, salary: {type: Boolean, defaultValue: false, defaultValue: false}
		, hourly: {type: Boolean, defaultValue: false, defaultValue: false}
	};
	
	fin.hcm.houseCodeImport.payrollProcessingLocationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeImport.houseCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.hcm.houseCodeImport.ePayGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
}, 2);

ii.Class({
	Name: "fin.hcm.houseCodeImport.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.BulkImportValidation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.bulkImportValidationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.SiteMaster",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.siteMasterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.IndustryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.industryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.PrimaryBusinessType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.primaryBusinessTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.LocationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.locationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.TraumaLevelType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.traumaLevelTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.ProfitDesignationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.profitDesignationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.GPOType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.gpoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.OwnershipType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.ownershipTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.HouseCodeService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.houseCodeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.ServiceLine",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.serviceLineArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.FinancialEntity",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.financialEntityArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.TermsOfContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.termsOfContractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.BudgetTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.budgetTemplateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.BudgetLaborCalcMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.budgetLaborCalcMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.PayPayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.payPayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.PayrollProcessingLocationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.payrollProcessingLocationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.EPayGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeImport.HouseCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeImport.houseCodeTypeArgs);
			$.extend(this, args);
		}
	}
});
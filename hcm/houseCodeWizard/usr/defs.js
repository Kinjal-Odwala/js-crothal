ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.hcm = { houseCodeWizard: {} };
}, 1);

ii.init.register( function() {
	
	fin.hcm.houseCodeWizard.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.houseCodeWizard.houseCodeArgs = {
		id: {type: Number}
		, appUnit: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, brief:{type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.hcm.houseCodeWizard.houseCodeDetailArgs = {
		id: {type: Number}
		, hirNode: {type: Number, defaultValue: 0}
		, appUnitId: {type: String}
		, appSiteId: {type: Number, required: false, defaultValue: 0}
		, jdeCompanyId: {type: String}
		, startDate: {type: String, required: false, defaultValue: ""}
		, serviceTypeId: {type: Number, required: false, defaultValue: 0}
		, serviceLineId: {type: Number, required: false, defaultValue: 0}
		, enforceLaborControl: {type: Boolean, required: false, defaultValue: false}
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, managerPhone: {type: String, required: false, defaultValue: ""}
		, managerCellPhone: {type: String, required: false, defaultValue: ""}
		, managerFax: {type: String, required: false, defaultValue: ""}
		, managerPager: {type: String, required: false, defaultValue: ""}
		, managerAssistantName: {type: String, required: false, defaultValue: ""}
		, managerAssistantPhone: {type: String, required: false, defaultValue: ""}
		, clientFirstName: {type: String, required: false, defaultValue: ""}
		, clientLastName: {type: String, required: false, defaultValue: ""}
		, clientTitle: {type: String, required: false, defaultValue: ""}
		, clientPhone: {type: String, required: false, defaultValue: ""}
		, clientFax: {type: String, required: false, defaultValue: ""}
		, clientAssistantName: {type: String, required: false, defaultValue: ""}
		, clientAssistantPhone: {type: String, required: false, defaultValue: ""}
		, managedEmployees: {type: Number, required: false, defaultValue: 0}
		, bedsLicensed: {type: Number, required: false, defaultValue: 0}
		, patientDays: {type: Number, required: false, defaultValue: 0}
		, avgDailyCensus: {type: Number, required: false, defaultValue: 0}
		, annualDischarges: {type: Number, required: false, defaultValue: 0}
		, avgBedTurnaroundTime: {type: Number, required: false, defaultValue: 0}
		, netCleanableSqft: {type: Number, required: false, defaultValue: 0}
		, avgLaundryLbs: {type: Number, required: false, defaultValue: 0}
		, crothallEmployees: {type: Number, required: false, defaultValue: 0}
		, bedsActive: {type: Number, required: false, defaultValue: 0}
		, adjustedPatientDaysBudgeted: {type: Number, required: false, defaultValue: 0}
		, annualTransfers: {type: Number, required: false, defaultValue: 0}
		, annualTransports: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTerminatedHourlyEmployees: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeActiveHourlyEmployees: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalProductiveLaborHoursWorked: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalNonProductiveLaborHours: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalProductiveLaborDollarsPaid: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalNonProductiveLaborDollarsPaid: {type: Number, required: false, defaultValue: 0}
		, hospitalPaidJanitorialPaperPlasticSupplyCost: {type: Number, required: false, defaultValue: 0}
		, buildingPopulation: {type: Number, required: false, defaultValue: 0}
		, maintainableAcres: {type: String, required: false, defaultValue: ""}
		, scientists: {type: String, required: false, defaultValue: ""}
		, managedRooms: {type: String, required: false, defaultValue: ""}
		, siteType: {type: Number, required: false, defaultValue: 0}
		, integrator: {type: Boolean, required: false, defaultValue: false}	
		, integratorName: {type: String, required: false, defaultValue: ""}
		, auditScore: {type: String, required: false, defaultValue: ""}
		, standardizationScore: {type: String, required: false, defaultValue: ""}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
		, remitToLocationId: {type: Number, required: false}
		, contractTypeId: {type: Number, required: false, defaultValue: 0}
		, termsOfContractTypeId: {type: Number,required: false, defaultValue: 0}
		, billingCycleFrequencyTypeId: {type: Number, required: false, defaultValue: 0}
		, bankCodeNumber: {type: String, required: false, defaultValue: ""}
		, bankAccountNumber: {type: String, required: false, defaultValue: ""}
		, bankName: {type: String, required: false, defaultValue: ""}
		, bankContact: {type: String, required: false, defaultValue: ""}
		, bankAddress1: {type: String, required: false, defaultValue: ""}
		, bankAddress2: {type: String, required: false, defaultValue: ""}
		, bankZip: {type: String, required: false, defaultValue: ""}
		, bankCity: {type: String, required: false, defaultValue: ""}
		, bankState: {type: Number, required: false, defaultValue: 0}
		, bankPhone: {type: String, required: false, defaultValue: ""}
		, bankFax: {type: String, required: false, defaultValue: ""}
		, bankEmail: {type: String, required: false, defaultValue: ""}
		, invoiceLogoTypeId: {type: Number, required: false, defaultValue: 0}
		, budgetTemplateId: {type: Number, required: false, defaultValue: 0}
		, budgetLaborCalcMethod: {type: Number, required: false, defaultValue: 0}
		, budgetComputerRelatedCharge: {type: Boolean, required: false, defaultValue: false}
		, stateTaxPercent: {type: String, required: false, defaultValue: ""}
		, localTaxPercent: {type: String, required: false, defaultValue: ""}
		, financialEntityId: {type: Number, required: false, defaultValue: 0}
		, payrollProcessingLocationTypeId: {type: Number, required: false, defaultValue: 0}
		, timeAndAttendance: {type: Boolean, required: false, defaultValue: 0}		
		, defaultLunchBreak: {type: String, required: false, defaultValue: ""}
		, lunchBreakTrigger: {type: String, required: false, defaultValue: ""}
		, houseCodeTypeId: {type: String, required: false, defaultValue: ""}
		, roundingTimePeriod: {type: String, required: false, defaultValue: ""}
		, ePaySite: {type: Boolean, required: false, defaultValue: false}
		, ePayGroupType: {type: Number, required: false, defaultValue: 0}
		, ePayTask: {type: Number, required: false, defaultValue: 0}
	};

	//HouseCode
	fin.hcm.houseCodeWizard.siteArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWizard.serviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWizard.jdeServiceArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.houseCodeServiceArgs = {
		id: {type: Number}
		, houseCode: {type: String}
		, serviceTypeId: {type: Number}
		, number: {type: Number}		
		, serviceType: {type: String}
	};
	
	fin.hcm.houseCodeWizard.houseCodeSiteUnitArgs = {		
		appSite: {type: Number}		
	};
	
	fin.hcm.houseCodeWizard.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}		
	};
	
	fin.hcm.houseCodeWizard.serviceLineArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};
	
	//Statistics
	fin.hcm.houseCodeWizard.siteTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	//Financial
	fin.hcm.houseCodeWizard.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.remitToArgs = {
		id: {type: Number}
		, name: {type: String}
		, address1: {type: String, required: false}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false}
		, stateType: {type: Number, required: false}
        , zip: {type: String, required: false}	
	};
	
	fin.hcm.houseCodeWizard.contractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.termsOfContractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWizard.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWizard.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.budgetTemplateArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.budgetLaborCalcMethodArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWizard.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	//Payroll
	fin.hcm.houseCodeWizard.payPayrollCompanyArgs = {
		id: {type: Number}
		, title: {type: String}
		, houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"}
		, salary: {type: Boolean, defaultValue: false}
		, hourly: {type: Boolean, defaultValue: false}
	};
	
	fin.hcm.houseCodeWizard.payrollProcessingLocationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWizard.houseCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.hcm.houseCodeWizard.ePayGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
		
}, 2);

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.houseCodeDetailArgs);
			$.extend(this, args);			
		}
	}
});

//HouseCcode
ii.Class({
	Name: "fin.hcm.houseCodeWizard.Site",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.siteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.JDEService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.jdeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HouseCodeService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.houseCodeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HouseCodeSiteUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.houseCodeSiteUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.ServiceLine",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.serviceLineArgs);
			$.extend(this, args);
		}
	}
});

//Statistics
ii.Class({
	Name: "fin.hcm.houseCodeWizard.SiteType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.siteTypeArgs);
			$.extend(this, args);
		}
	}
});

//Financial
ii.Class({
	Name: "fin.hcm.houseCodeWizard.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.TermsOfContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.termsOfContractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.BudgetTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.budgetTemplateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.BudgetLaborCalcMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.budgetLaborCalcMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.FinancialEntity",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.financialEntityArgs);
			$.extend(this, args);
		}
	}
});

//Payroll
ii.Class({
	Name: "fin.hcm.houseCodeWizard.PayPayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.payPayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.PayrollProcessingLocationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.payrollProcessingLocationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.EPayGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWizard.HouseCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWizard.houseCodeTypeArgs);
			$.extend(this, args);
		}
	}
});
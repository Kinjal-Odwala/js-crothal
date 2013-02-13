ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.adh = {};
	
}, 1);

ii.init.register( function() {
	
	fin.adh.moduleArgs = {
		id: {type: Number}
		, name: {type: String}
		, description: {type: String}
		, editable: {type: Boolean, required: false, defaultValue:false}
		, houseCodeAssociated: {type: Boolean, required: false, defaultValue:false}
	};
	
	fin.adh.userArgs = {
		id: {type: Number}
		, roleCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.adh.roleArgs = {
		id: {type: Number}
		, hirNodeCurrent: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.adh.moduleColumnHeaderArgs = {
		id: {type: Number}
		, columnType: {type: Number}
		, reportColumn: {type: Number}
		, columnTypeFilter: {type: Number}
		, title:{type: String}
		, description: {type: String}
		, sortOrder: {type: String, required: false, defaultValue: "" }
		, columnDataType: {type: String}
		, columnNullable: {type: Boolean, required: false, defaultValue: false}
		, columnValidation: {type: String, required: false, defaultValue: ""}
		, columnWidth: {type: Number, required: false, defaultValue: 0}
		, columnLength: {type: Number, required: false, defaultValue: 0}
	};
		
	fin.adh.moduleColumnDataArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number, required:false, defaultValue: 0}
		, houseCode:{type: String, defaultValue: "0"}
		, primeColumn:{type: String, defaultValue: "0"}
		, columnData: {type: String, defaultValue: "" }
		, appSite: {type: Number, required:false, defaultValue: 0}
		, appSitTitle: {type: String, required: false, defaultValue: "" }
		, modified: {type: Boolean, required: false, defaultValue: false }
	};

	fin.adh.adhFileNameArgs = {
		id: {type: Number}
		, fileName: {type: String}
	};
	
	fin.adh.reportArgs = {
		id: {type: Number}
		, name : {type: String}	
		, module: {type: String, defaultValue: "0"}	
		, moduleAssociate: {type: String, defaultValue: "0"}
		, active: {type: Boolean}
		, hirNode: {type: Number ,required:false, defaultValue: 0}
	};
	
	fin.adh.hirNodeArgs = {
		id: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, nodeParentId: {type: Number, required: false, defaultValue: 0}
		, fullPath: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, editable:{type: Boolean, required: false, defaultValue: false}
		, serverStatus:{type: String, required: false, defaultValue: ""}
		, serverMessage:{type: String, required: false, defaultValue: ""}
	};
		
	fin.adh.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};
	
	fin.adh.reportTotalRowArgs = {
		totalRowId: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};
	
	fin.adh.siteTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.adh.serviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.houseCodeServiceArgs = {
		id: {type: Number}
		, houseCode: {type: String}
		, serviceTypeId: {type: Number}
		, serviceType: {type: String}
	};
	
	fin.adh.houseCodeSiteUnitArgs = {		
		appSite: {type: Number}		
	};
	
	fin.adh.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.serviceLineArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.adh.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.remitToArgs = {
		id: {type: Number}
		, name: {type: String}
		, address1: {type: String, required: false}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false}
		, stateType: {type: Number, required: false}
        , zip: {type: String, required: false}
	};
	
	fin.adh.contractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.termsOfContractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.budgetTemplateArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.payPayrollCompanyArgs = {
		id: {type: Number}
		, title: {type: String}
		, houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"}
		, salary: {type: Boolean, defaultValue: false}
		, hourly: {type: Boolean, defaultValue: false}
	};
	
	fin.adh.payrollProcessingLocationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.ePayGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.houseCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.reportFilterArgs = {
		id: {type: Number}
		, name: {type: String}
		, title: {type: String}
		, tableName: {type: String}
		, referenceTableName: {type: String, required: false, defaultValue: ""}
		, validation: {type: String, required: false, defaultValue: ""}
		, columnTypeFilter: {type: Boolean, required: false}
		, columnTypeOperator: {type: Boolean, required: false}
		, columnDataType: {type: String, required: false, defaultValue: ""}
	};

	fin.adh.siteMasterArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.siteArgs = {
		id: {type: Number}
		, title: {type: String}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false}
		, county: {type: String, required: false, defaultValue: ""}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, industryType: {type: Number, required: false}
		, primaryBusinessType: {type: Number, required: false}
		, locationType: {type: Number, required: false}
		, traumaLevelType: {type: Number, required: false}
		, profitDesignationType: {type: Number, required: false}
		, gpoType: {type: Number, required: false}
		, specifyGPO: {type: String, required: false, defaultValue: ""}
		, ownershipType: {type: Number, required: false}		
	};
	
	fin.adh.industryTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.primaryBusinessTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.locationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.traumaLevelTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.profitDesignationTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.ownershipTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.gpoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.zipCodeTypeArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, county: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.adh.maritalStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.statusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.deviceGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.jobCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.rateChangeReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.terminationReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.workShiftArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.ethnicityTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.unionTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.payFrequencyTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.i9TypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.vetTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.separationCodeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.jobStartReasonTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.adh.houseCodeJobArgs = {
		id: {type: Number}
		, jobTitle: {type: String}
	};
	
	fin.adh.localTaxCodeArgs = {
		id: {type: Number}
		, name: {type: String}
	};	
	
	fin.adh.statusCategoryTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.stateAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.sdiAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.maritalStatusFederalTaxTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.genderTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.localTaxAdjustmentTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.secMaritalStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.federalAdjustmentArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.payrollCompanyArgs = {
		id: {type: Number},
		name: {type: String}
	};
	fin.adh.basicLifeIndicatorTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.employeeGeneralArgs = {
		id: {type: Number}
	};
	
	fin.adh.houseCodePayrollCompanyArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.userRoleArgs = {
		id: {type: Number}
		, name: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, roleCurrent: {type: Boolean, required: false, defaultValue: false}
	}
	
	fin.adh.invoiceBillToArgs = {
		id: {type: Number}
		, billTo: {type: String, required: false, defaultValue: ""}
	};
	
	fin.adh.transactionStatusTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.adh.jobTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.invoiceTemplateArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
}, 2);

ii.Class({
	Name: "fin.adh.Module",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.userArgs);
			$.extend(this, args);
			
			if (!this.appRoles) {
				this.appRoles = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.adh.Role",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.roleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ModuleColumnHeader",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleColumnHeaderArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ModuleColumnData",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleColumnDataArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.AdhFileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.adhFileNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.Report",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.reportArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ReportTotalRow",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.reportTotalRowArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.SiteType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.siteTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCodeService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCodeSiteUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodeSiteUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ServiceLine",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.serviceLineArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.FinancialEntity",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.financialEntityArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.TermsOfContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.termsOfContractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.BudgetTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.budgetTemplateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.PayPayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.payPayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.PayrollProcessingLocationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.payrollProcessingLocationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.EPayGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ReportFilter",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.reportFilterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.SiteMaster",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.siteMasterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.Site",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.siteArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.adh.IndustryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.industryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.PrimaryBusinessType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.primaryBusinessTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.LocationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.locationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.TraumaLevelType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.traumaLevelTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ProfitDesignationType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.profitDesignationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.GPOType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.gpoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.OwnershipType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.ownershipTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ZipCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.zipCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.MaritalStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.maritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.StatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.statusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.DeviceGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.deviceGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.JobCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.jobCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.RateChangeReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.rateChangeReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.TerminationReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.terminationReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.WorkShift",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.workShiftArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.EthnicityType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.ethnicityTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.UnionType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.unionTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.PayFrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.payFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.I9Type",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.i9TypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.VetType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.vetTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.SeparationCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.separationCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.JobStartReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.jobStartReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.LocalTaxCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.localTaxCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.StatusCategoryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.statusCategoryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.StateAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.stateAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.SDIAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.sdiAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.MaritalStatusFederalTaxType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.maritalStatusFederalTaxTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.GenderType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.genderTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.LocalTaxAdjustmentType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.localTaxAdjustmentTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.SecMaritalStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.secMaritalStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.FederalAdjustment",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.federalAdjustmentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.PayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.payrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.BasicLifeIndicatorType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.basicLifeIndicatorTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.EmployeeGeneral",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.employeeGeneralArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.UserRole",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.userRoleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCodePayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodePayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.InvoiceBillTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.invoiceBillToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.TransactionStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.transactionStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.JobType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.jobTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.InvoiceTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.invoiceTemplateArgs);
			$.extend(this, args);
		}
	}
});
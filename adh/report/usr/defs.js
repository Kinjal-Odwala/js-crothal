ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.adh = {};
	
}, 1);

ii.init.register( function() {
	
	fin.adh.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hirLevelTitle: {type: String, required: false, defaultValue: ""}
		, hirHierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, fullPath: {type: String, required: false, defaultValue: ""}
	};

	fin.adh.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};
	
	fin.adh.userArgs = {
		id: {type: Number}
		, roleCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.adh.roleArgs = {
		id: {type: Number}
		, hirNodeCurrent: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.adh.roleNodeArgs = {
		id: {type: Number}
		, fullPath: {type: String, required: false, defaultValue: ""}
	};
	
	fin.adh.houseCodeArgs = {
		id: {type: Number}
		, appUnit: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, brief:{type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.adh.moduleArgs = {
		id: {type: Number}
		, name: {type: String}
		, description: {type: String}
		, editable: {type: Boolean, required: false, defaultValue:false}
		, houseCodeAssociated: {type: Boolean, required: false, defaultValue:false}
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
		, referenceTableName: {type: String, required: false, defaultValue: ""}
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
		, column1: {type: String, required: false, defaultValue: "" }
	    , column2: {type: String, required: false, defaultValue: "" }
	    , column3: {type: String, required: false, defaultValue: "" }
	    , column4: {type: String, required: false, defaultValue: "" }
	    , column5: {type: String, required: false, defaultValue: "" }
	    , column6: {type: String, required: false, defaultValue: "" }
	    , column7: {type: String, required: false, defaultValue: "" }
	    , column8: {type: String, required: false, defaultValue: "" }
	    , column9: {type: String, required: false, defaultValue: "" }
	    , column10: {type: String, required: false, defaultValue: "" }
	    , column11: {type: String, required: false, defaultValue: "" }
	    , column12: {type: String, required: false, defaultValue: "" }
	    , column13: {type: String, required: false, defaultValue: "" }
	    , column14: {type: String, required: false, defaultValue: "" }
	    , column15: {type: String, required: false, defaultValue: "" }
	    , column16: {type: String, required: false, defaultValue: "" }
	    , column17: {type: String, required: false, defaultValue: "" }
	    , column18: {type: String, required: false, defaultValue: "" }
	    , column19: {type: String, required: false, defaultValue: "" }
	    , column20: {type: String, required: false, defaultValue: "" }
	    , column21: {type: String, required: false, defaultValue: "" }
	    , column22: {type: String, required: false, defaultValue: "" }
	    , column23: {type: String, required: false, defaultValue: "" }
	    , column24: {type: String, required: false, defaultValue: "" }
	    , column25: {type: String, required: false, defaultValue: "" }
	    , column26: {type: String, required: false, defaultValue: "" }
	    , column27: {type: String, required: false, defaultValue: "" }
	    , column28: {type: String, required: false, defaultValue: "" }
	    , column29: {type: String, required: false, defaultValue: "" }
	    , column30: {type: String, required: false, defaultValue: "" }
	    , column31: {type: String, required: false, defaultValue: "" }
	    , column32: {type: String, required: false, defaultValue: "" }
	    , column33: {type: String, required: false, defaultValue: "" }
	    , column34: {type: String, required: false, defaultValue: "" }
	    , column35: {type: String, required: false, defaultValue: "" }
	    , column36: {type: String, required: false, defaultValue: "" }
	    , column37: {type: String, required: false, defaultValue: "" }
	    , column38: {type: String, required: false, defaultValue: "" }
	    , column39: {type: String, required: false, defaultValue: "" }
	    , column40: {type: String, required: false, defaultValue: "" }
	    , column41: {type: String, required: false, defaultValue: "" }
	    , column42: {type: String, required: false, defaultValue: "" }
	    , column43: {type: String, required: false, defaultValue: "" }
	    , column44: {type: String, required: false, defaultValue: "" }
	    , column45: {type: String, required: false, defaultValue: "" }
	    , column46: {type: String, required: false, defaultValue: "" }
	    , column47: {type: String, required: false, defaultValue: "" }
	    , column48: {type: String, required: false, defaultValue: "" }
	    , column49: {type: String, required: false, defaultValue: "" }
	    , column50: {type: String, required: false, defaultValue: "" }
	    , column51: {type: String, required: false, defaultValue: "" }
	    , column52: {type: String, required: false, defaultValue: "" }
	    , column53: {type: String, required: false, defaultValue: "" }
	    , column54: {type: String, required: false, defaultValue: "" }
	    , column55: {type: String, required: false, defaultValue: "" }
	    , column56: {type: String, required: false, defaultValue: "" }
	    , column57: {type: String, required: false, defaultValue: "" }
	    , column58: {type: String, required: false, defaultValue: "" }
	    , column59: {type: String, required: false, defaultValue: "" }
	    , column60: {type: String, required: false, defaultValue: "" }
	    , column61: {type: String, required: false, defaultValue: "" }
	    , column62: {type: String, required: false, defaultValue: "" }
	    , column63: {type: String, required: false, defaultValue: "" }
	    , column64: {type: String, required: false, defaultValue: "" }
	    , column65: {type: String, required: false, defaultValue: "" }
	    , column66: {type: String, required: false, defaultValue: "" }
	    , column67: {type: String, required: false, defaultValue: "" }
	    , column68: {type: String, required: false, defaultValue: "" }
	    , column69: {type: String, required: false, defaultValue: "" }
	    , column70: {type: String, required: false, defaultValue: "" }
	    , column71: {type: String, required: false, defaultValue: "" }
	    , column72: {type: String, required: false, defaultValue: "" }
	    , column73: {type: String, required: false, defaultValue: "" }
	    , column74: {type: String, required: false, defaultValue: "" }
	    , column75: {type: String, required: false, defaultValue: "" }
	    , column76: {type: String, required: false, defaultValue: "" }
	    , column77: {type: String, required: false, defaultValue: "" }
	    , column78: {type: String, required: false, defaultValue: "" }
	    , column79: {type: String, required: false, defaultValue: "" }
	    , column80: {type: String, required: false, defaultValue: "" }
	    , column81: {type: String, required: false, defaultValue: "" }
	    , column82: {type: String, required: false, defaultValue: "" }
	    , column83: {type: String, required: false, defaultValue: "" }
	    , column84: {type: String, required: false, defaultValue: "" }
	    , column85: {type: String, required: false, defaultValue: "" }
	    , column86: {type: String, required: false, defaultValue: "" }
	    , column87: {type: String, required: false, defaultValue: "" }
	    , column88: {type: String, required: false, defaultValue: "" }
	    , column89: {type: String, required: false, defaultValue: "" }
	    , column90: {type: String, required: false, defaultValue: "" }
	    , column91: {type: String, required: false, defaultValue: "" }
	    , column92: {type: String, required: false, defaultValue: "" }
	    , column93: {type: String, required: false, defaultValue: "" }
	    , column94: {type: String, required: false, defaultValue: "" }
	    , column95: {type: String, required: false, defaultValue: "" }
	    , column96: {type: String, required: false, defaultValue: "" }
	    , column97: {type: String, required: false, defaultValue: "" }
	    , column98: {type: String, required: false, defaultValue: "" }
	    , column99: {type: String, required: false, defaultValue: "" }
	    , column100: {type: String, required: false, defaultValue: "" }
		, column101: {type: String, required: false, defaultValue: "" }
	    , column102: {type: String, required: false, defaultValue: "" }
	    , column103: {type: String, required: false, defaultValue: "" }
	    , column104: {type: String, required: false, defaultValue: "" }
	    , column105: {type: String, required: false, defaultValue: "" }
	    , column106: {type: String, required: false, defaultValue: "" }
	    , column107: {type: String, required: false, defaultValue: "" }
	    , column108: {type: String, required: false, defaultValue: "" }
	    , column109: {type: String, required: false, defaultValue: "" }
	    , column110: {type: String, required: false, defaultValue: "" }
	    , column111: {type: String, required: false, defaultValue: "" }
	    , column112: {type: String, required: false, defaultValue: "" }
	    , column113: {type: String, required: false, defaultValue: "" }
	    , column114: {type: String, required: false, defaultValue: "" }
	    , column115: {type: String, required: false, defaultValue: "" }
	    , column116: {type: String, required: false, defaultValue: "" }
	    , column117: {type: String, required: false, defaultValue: "" }
	    , column118: {type: String, required: false, defaultValue: "" }
	    , column119: {type: String, required: false, defaultValue: "" }
	    , column120: {type: String, required: false, defaultValue: "" }
	    , column121: {type: String, required: false, defaultValue: "" }
	    , column122: {type: String, required: false, defaultValue: "" }
	    , column123: {type: String, required: false, defaultValue: "" }
	    , column124: {type: String, required: false, defaultValue: "" }
	    , column125: {type: String, required: false, defaultValue: "" }
	    , column126: {type: String, required: false, defaultValue: "" }
	    , column127: {type: String, required: false, defaultValue: "" }
	    , column128: {type: String, required: false, defaultValue: "" }
	    , column129: {type: String, required: false, defaultValue: "" }
	    , column130: {type: String, required: false, defaultValue: "" }
	    , column131: {type: String, required: false, defaultValue: "" }
	    , column132: {type: String, required: false, defaultValue: "" }
	    , column133: {type: String, required: false, defaultValue: "" }
	    , column134: {type: String, required: false, defaultValue: "" }
	    , column135: {type: String, required: false, defaultValue: "" }
	    , column136: {type: String, required: false, defaultValue: "" }
	    , column137: {type: String, required: false, defaultValue: "" }
	    , column138: {type: String, required: false, defaultValue: "" }
	    , column139: {type: String, required: false, defaultValue: "" }
	    , column140: {type: String, required: false, defaultValue: "" }
	    , column141: {type: String, required: false, defaultValue: "" }
	    , column142: {type: String, required: false, defaultValue: "" }
	    , column143: {type: String, required: false, defaultValue: "" }
	    , column144: {type: String, required: false, defaultValue: "" }
	    , column145: {type: String, required: false, defaultValue: "" }
	    , column146: {type: String, required: false, defaultValue: "" }
	    , column147: {type: String, required: false, defaultValue: "" }
	    , column148: {type: String, required: false, defaultValue: "" }
	    , column149: {type: String, required: false, defaultValue: "" }
	    , column150: {type: String, required: false, defaultValue: "" }
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
	
	fin.adh.budgetLaborCalcMethodArgs = {
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
	
	fin.adh.unionStatusTypeArgs = {
		id: {type: Number},
		name: {type: String}
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
	
	fin.adh.transactionStatusTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.adh.invoiceAddressTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.adh.invoiceBillToArgs = {
		id: {type: Number}
		, billTo: {type: String, required: false, defaultValue: ""}
		, company: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, taxId: {type: String, required: false, defaultValue: "0"}
	};

	fin.adh.jobTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.invoiceTemplateArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.adh.hcmJobTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.adh.invoiceItemArgs = {
		id: {type: Number}
		, invoiceId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, hirNodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, taxableService: {type: Number, required: false, defaultValue: 0}
		, jobBrief: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, overrideSiteTax: {type: Boolean, required: false, defaultValue: false}
		, account: {type: Number, required: false, defaultValue: 0}
		, statusType: {type: Number, required: false, defaultValue: 1}
		, quantity: {type: String, required: false, defaultValue: "0"}
		, price: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, taxable: {type: Boolean, required: false, defaultValue: false}
		, lineShow: {type: Boolean, required: false, defaultValue: true}		
		, description: {type: String, required: false, defaultValue: ""}
		, recurringFixedCost: {type: Boolean, required: false, defaultValue: false}
		, version: {type: Number, required: false, defaultValue: 0}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.adh.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
	};
	
	fin.adh.taxableServiceArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.adh.hcmSiteTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
}, 2);

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
	Name: "fin.adh.RoleNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.roleNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

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
	Name: "fin.adh.BudgetLaborCalcMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.budgetLaborCalcMethodArgs);
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
	Name: "fin.adh.UnionStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.unionStatusTypeArgs);
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
	Name: "fin.adh.TransactionStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.transactionStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.InvoiceAddressType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.invoiceAddressTypeArgs);
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

ii.Class({
	Name: "fin.adh.HcmJobType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.hcmJobTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.InvoiceItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.invoiceItemArgs);
			$.extend(this, args);
		}
	}
});
	
ii.Class({
	Name: "fin.adh.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.accountArgs);
			$.extend(this, args);
		}
	}
});
	
ii.Class({
	Name: "fin.adh.TaxableService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.taxableServiceArgs);
			$.extend(this, args);
			}				
		}			
});	

ii.Class({
	Name: "fin.adh.HcmSiteType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.hcmSiteTypeArgs);
			$.extend(this, args);
		}
	}
});
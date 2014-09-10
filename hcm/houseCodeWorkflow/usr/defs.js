ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { houseCodeWorkflow: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.houseCodeWorkflow.houseCodeRequestArgs = {
		id: {type: Number, defaultValue: 0}
		, column1: {type: String, required: false, defaultValue: ""} 	// Id
		, column2: {type: String, required: false, defaultValue: ""} 	// User Id
		, column3: {type: String, required: false, defaultValue: ""} 	// User Name
		, column4: {type: String, required: false, defaultValue: ""} 	// First Name
		, column5: {type: String, required: false, defaultValue: ""} 	// Last Name
		, column6: {type: String, required: false, defaultValue: ""} 	// Requested Date
		, column7: {type: String, required: false, defaultValue: ""} 	// Status
		, column8: {type: String, required: false, defaultValue: ""} 	// Approved Date
		, column9: {type: String, required: false, defaultValue: ""}    // 
		, column10: {type: String, required: false, defaultValue: ""}   // 
		, column11: {type: String, required: false, defaultValue: ""} 	//
		, column12: {type: String, required: false, defaultValue: ""}   // 
		, column13: {type: String, required: false, defaultValue: ""}   // 
		, column14: {type: String, required: false, defaultValue: ""} 	// 
		, column15: {type: String, required: false, defaultValue: ""}   // 
		, column16: {type: String, required: false, defaultValue: ""} 	// Contract Type
		, column17: {type: String, required: false, defaultValue: ""} 	// Division
		, column18: {type: String, required: false, defaultValue: ""} 	// SVP
		, column19: {type: String, required: false, defaultValue: ""} 	// DVP
		, column20: {type: String, required: false, defaultValue: ""} 	// RVP
		, column21: {type: String, required: false, defaultValue: ""} 	// SRM
		, column22: {type: String, required: false, defaultValue: ""} 	// RM
		, column23: {type: String, required: false, defaultValue: ""}   // AM
		, column24: {type: String, required: false, defaultValue: ""}   // Start Date
		, column25: {type: String, required: false, defaultValue: ""} 	// Site Name
		, column26: {type: String, required: false, defaultValue: ""} 	// Street 1
		, column27: {type: String, required: false, defaultValue: ""} 	// Street 2
		, column28: {type: String, required: false, defaultValue: ""} 	// City
		, column29: {type: String, required: false, defaultValue: ""} 	// State
		, column30: {type: String, required: false, defaultValue: ""}   // Zip Code
		, column31: {type: String, required: false, defaultValue: ""} 	// County
		, column32: {type: String, required: false, defaultValue: ""} 	// Phone #
		, column33: {type: String, required: false, defaultValue: ""} 	// Primary Service Provided
		, column34: {type: String, required: false, defaultValue: ""} 	// Other Services Provided
		, column35: {type: String, required: false, defaultValue: ""} 	// Prior Service Provider
		, column36: {type: String, required: false, defaultValue: ""} 	// Hourly Company
		, column37: {type: String, required: false, defaultValue: ""} 	// EST # of Hourly Employees
		, column38: {type: String, required: false, defaultValue: ""} 	// Salary Company
		, column39: {type: String, required: false, defaultValue: ""} 	// EST # of Salary Employees		
		, column40: {type: String, required: false, defaultValue: ""} 	// Epay
		, column41: {type: String, required: false, defaultValue: ""} 	// Epay Options
		, column42: {type: String, required: false, defaultValue: ""} 	// Crothall Benefits
		, column43: {type: String, required: false, defaultValue: ""} 	// Union Account
		, column44: {type: String, required: false, defaultValue: ""} 	// Union Name
		, column45: {type: String, required: false, defaultValue: ""} 	// Local #
		, column46: {type: String, required: false, defaultValue: ""} 	// Customer Number
		, column47: {type: String, required: false, defaultValue: ""} 	// Client Name
		, column48: {type: String, required: false, defaultValue: ""} 	// Street
		, column49: {type: String, required: false, defaultValue: ""} 	// City
		, column50: {type: String, required: false, defaultValue: ""} 	// State
		, column51: {type: String, required: false, defaultValue: ""} 	// Zip Code
		, column52: {type: String, required: false, defaultValue: ""} 	// Customer Phone #
		, column53: {type: String, required: false, defaultValue: ""} 	// Customer Biller
		, column54: {type: String, required: false, defaultValue: ""} 	// Billing Frequency		
		, column55: {type: String, required: false, defaultValue: ""} 	// Payment Terms
		, column56: {type: String, required: false, defaultValue: ""} 	// Credit Approval Number		
		, column57: {type: String, required: false, defaultValue: ""} 	// Regular Contract Price
		, column58: {type: String, required: false, defaultValue: ""} 	// Client Status
		, column59: {type: String, required: false, defaultValue: ""} 	// Tax Exemption #
		, column60: {type: String, required: false, defaultValue: ""} 	// Certificate
		, column61: {type: String, required: false, defaultValue: ""} 	// EIN Number
		, column62: {type: String, required: false, defaultValue: ""} 	// Company Status
		, column63: {type: String, required: false, defaultValue: ""} 	// Contract
		, column64: {type: String, required: false, defaultValue: ""} 	// Type of Contract
		, column65: {type: String, required: false, defaultValue: ""} 	// Length of Contract
		, column66: {type: String, required: false, defaultValue: ""} 	// Expiration Date
		, column67: {type: String, required: false, defaultValue: ""} 	// Tenet Healthcare Account
		, column68: {type: String, required: false, defaultValue: ""} 	// Square Footage
		, column69: {type: String, required: false, defaultValue: ""} 	// Licensed Beds
		, column70: {type: String, required: false, defaultValue: ""} 	// GPO Member
		, column71: {type: String, required: false, defaultValue: ""} 	// Start Date Firm
		, column72: {type: String, required: false, defaultValue: ""} 	// Compass purchase any Supplies
		, column73: {type: String, required: false, defaultValue: ""} 	// Contact Name
		, column74: {type: String, required: false, defaultValue: ""} 	// Contact Number
		, column75: {type: String, required: false, defaultValue: ""} 	// Types of Supplies Purchased
		, column76: {type: String, required: false, defaultValue: ""} 	// Chargeable
		, column77: {type: String, required: false, defaultValue: ""} 	// Markup
		, column78: {type: String, required: false, defaultValue: ""} 	// Service Location Number
		, column79: {type: String, required: false, defaultValue: ""} 	// Service Location Name
		, column80: {type: String, required: false, defaultValue: ""} 	// MISC Number
		, column81: {type: String, required: false, defaultValue: ""} 	// Exterior
		, column82: {type: String, required: false, defaultValue: ""} 	// Food Court
		, column83: {type: String, required: false, defaultValue: ""} 	// Common Area
		, column84: {type: String, required: false, defaultValue: ""} 	// Other Areas
	};

	fin.hcm.houseCodeWorkflow.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hirLevelTitle: {type: String, required: false, defaultValue: ""}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.hcm.houseCodeWorkflow.divisionArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCodeWorkflow.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.contractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.serviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.houseCodeTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.payPayrollCompanyArgs = {
		id: {type: Number}
		, title: {type: String}
		, houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"}
		, salary: {type: Boolean, defaultValue: false}
		, hourly: {type: Boolean, defaultValue: false}
	};
	
	fin.hcm.houseCodeWorkflow.jobArgs = {
		id: {type: Number, defaultValue: 0}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, contact: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, appStateTypeId: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.houseCodeWorkflow.clientStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.companyStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCodeWorkflow.supplyContractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.HouseCodeRequest",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.houseCodeRequestArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.Division",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.divisionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.HouseCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.houseCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.PayPayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.payPayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.Job",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.jobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.ClientStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.clientStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.CompanyStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.companyStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCodeWorkflow.SupplyContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCodeWorkflow.supplyContractTypeArgs);
			$.extend(this, args);
		}
	}
});
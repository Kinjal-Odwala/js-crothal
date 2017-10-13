ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { activateHouseCode: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.activateHouseCode.hirNodeArgs = {
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

	fin.hcm.activateHouseCode.siteArgs = {
	   	id: {type: Number}
	   	, title: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.activateHouseCode.stateTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.industryTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.primaryBusinessTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.gpoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.divisionArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}		
	};

	fin.hcm.activateHouseCode.jdeServiceArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.remitToArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.contractTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.serviceLineArgs = {
		id: {type: Number}
		, name: {type: String}
		, brief: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.activateHouseCode.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.serviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.activateHouseCode.zipCodeTypeArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, county: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.activateHouseCode.cityNameArgs = {
		id: {type: Number}
		, city: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.activateHouseCode.houseCodeArgs = {
		id: {type: Number, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, svp: {type: String, required: false, defaultValue: ""}
		, dvp: {type: String, required: false, defaultValue: ""}
		, rvp: {type: String, required: false, defaultValue: ""}
		, srm: {type: String, required: false, defaultValue: ""}
		, rm: {type: String, required: false, defaultValue: ""}
		, am: {type: String, required: false, defaultValue: ""}
		, svpBrief: {type: String, required: false, defaultValue: ""}
		, dvpBrief: {type: String, required: false, defaultValue: ""}
		, rvpBrief: {type: String, required: false, defaultValue: ""}
		, srmBrief: {type: String, required: false, defaultValue: ""}
		, rmBrief: {type: String, required: false, defaultValue: ""}
		, amBrief: {type: String, required: false, defaultValue: ""}
		, siteName: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, state: {type: String, required: false, defaultValue: ""}
		, industryType: {type: String, required: false, defaultValue: ""}
		, primaryBusiness: {type: String, required: false, defaultValue: ""}
		, gpo: {type: String, required: false, defaultValue: ""}
		, specifyGPO: {type: String, required: false, defaultValue: ""}
		, jdeCompany: {type: String, required: false, defaultValue: ""}
		, primaryServiceProvided: {type: String, required: false, defaultValue: ""}
		, otherServicesProvided: {type: String, required: false, defaultValue: ""}
		, serviceLine: {type: String, required: false, defaultValue: ""}
		, remitTo: {type: String, required: false, defaultValue: ""}
		, contractType: {type: String, required: false, defaultValue: ""}
		, billingCycleFrequency: {type: String, required: false, defaultValue: ""}
		, financialEntity: {type: String, required: false, defaultValue: ""}
		, netCleanable: {type: String, required: false, defaultValue: ""}
		, licensedBeds: {type: String, required: false, defaultValue: ""}
		, contact: {type: String, required: false, defaultValue: ""}
		, hourlyEmployees: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.activateHouseCode.houseCodeDetailArgs = {
		id: {type: Number}
		, hirNode: {type: Number, defaultValue: 0}
		, appUnitId: {type: String}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.activateHouseCode.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.Site",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.siteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.IndustryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.industryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.PrimaryBusinessType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.primaryBusinessTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.GPOType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.gpoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.Division",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.divisionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.JDECompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.JDEService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.jdeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.ServiceLine",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.serviceLineArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.FinancialEntity",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.financialEntityArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.ZipCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.zipCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.CityName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.cityNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.activateHouseCode.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.activateHouseCode.houseCodeDetailArgs);
			$.extend(this, args);			
		}
	}
});
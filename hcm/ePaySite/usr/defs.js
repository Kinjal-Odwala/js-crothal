ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { ePaySite: {} };
    
}, 1);

ii.init.register( function() {
	
	fin.hcm.ePaySite.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};	

	fin.hcm.ePaySite.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number, defaultValue: 0}
	};
	
	fin.hcm.ePaySite.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySite.jobTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySite.ePayGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySite.zipCodeTypeArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}	
	};
	
	fin.hcm.ePaySite.cityNameArgs = {
		id: {type: Number}
		, city: {type: String, required: false, defaultValue: ""}
	};
	
	fin.hcm.ePaySite.jobArgs = {
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
		, geoCode: {type: String, required: false, defaultValue: ""}
		, jobType: {type: fin.hcm.ePaySite.JobType, required: false}
		, ePayGroupType: {type: Number, required: false, defaultValue: 0}
		, taxId: {type: String, required: false, defaultValue: "0"}
        , active: {type: Boolean, required: false, defaultValue: false}
		, overrideSiteTax: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySite.houseCodeJobArgs = {
		id: {type: Number, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, hirNode: {type: Number, required: false, defaultValue: 0}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, language1: {type: String, required: false, defaultValue: ""}
		, language2: {type: String, required: false, defaultValue: ""}
		, language3: {type: String, required: false, defaultValue: ""}
		, defaultHouseCode: {type: Boolean, required: false, defaultValue: false}
        , active: {type: Boolean, required: false, defaultValue: false}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySite.unitArgs = {
		id: {type: Number}
		, name: {type: String}
		, hirNode: {type: Number, defaultValue: 0}
		, language1: {type: String, required: false, defaultValue: ""}
		, language2: {type: String, required: false, defaultValue: ""}
		, language3: {type: String, required: false, defaultValue: ""}
		, assigned: {type: Boolean, required: false, defaultValue: true}
	};
		
}, 2);

ii.Class({
	Name: "fin.hcm.ePaySite.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.JobType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.jobTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.EPayGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.ZipCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.zipCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.CityName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.cityNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.Job",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.jobArgs);
			$.extend(this, args);
			
			if (!this.jobType) {
				this.jobType = [];
			}		
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySite.Unit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySite.unitArgs);
			$.extend(this, args);
		}
	}
});
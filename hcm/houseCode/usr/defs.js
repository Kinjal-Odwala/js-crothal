ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { houseCode: {} };
}, 1);

ii.init.register( function() {

	fin.hcm.houseCode.siteTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCode.serviceTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.hcm.houseCode.jdeServiceArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.houseCode.houseCodeServiceArgs = {
		id: {type: Number}
		, houseCode: {type: String}
		, serviceTypeId: {type: Number}
		, number: {type: Number}		
		, serviceType: {type: String}
	};
	
	fin.hcm.houseCode.houseCodeSiteUnitArgs = {		
		appSite: {type: Number}		
	};
	
	fin.hcm.houseCode.jdeCompanyArgs = {		
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}		
	};
	
	fin.hcm.houseCode.serviceLineArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.houseCode.SiteType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.siteTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.ServiceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.serviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.JDEService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.jdeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.HouseCodeService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.houseCodeServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.HouseCodeSiteUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.houseCodeSiteUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.houseCode.ServiceLine",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.houseCode.serviceLineArgs);
			$.extend(this, args);
		}
	}
});

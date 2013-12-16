ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.bud = { approveBudget: {} };
    
}, 1);

ii.init.register( function() { 
	
	fin.bud.approveBudget.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};

	fin.bud.approveBudget.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hirLevelTitle: {type: String, required: false, defaultValue: ""}
		, hirHierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.bud.approveBudget.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.bud.approveBudget.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}		
	};
	
	fin.bud.approveBudget.houseCodeJobArgs = {
		id: {type: Number}
		, jobId: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.bud.approveBudget.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.bud.approveBudget.annualBudgetArgs = {
		id: {type: Number}
		, hcmHouseCode: {type: String}
		, fscYear: {type: String}
		, approved: {type: Boolean}
	};

}, 2);

ii.Class({
	Name: "fin.bud.approveBudget.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.approveBudget.AnnualBudget",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.approveBudget.annualBudgetArgs);
			$.extend(this, args);
		}
	}
});
ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.bud = { exportBudget: {} };
    
}, 1);

ii.init.register( function() { 
	
	fin.bud.exportBudget.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};

	fin.bud.exportBudget.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hirLevelTitle: {type: String, required: false, defaultValue: ""}
		, hirHierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.bud.exportBudget.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.bud.exportBudget.houseCodeJobArgs = {
		id: {type: Number}
		, jobId: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.bud.exportBudget.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.bud.exportBudget.annualBudgetArgs = {
		id: {type: Number}
		, hcmHouseCode: {type: String}
		, fscYear: {type: String}
		, approved: {type: Boolean}
		, exported: {type: Boolean}
	};
	
	fin.bud.exportBudget.exportArgs = {
		id: {type: Number, required: false, defaultValue: 0}
	};

}, 2);

ii.Class({
	Name: "fin.bud.exportBudget.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.AnnualBudget",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.annualBudgetArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.exportBudget.Export",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.exportBudget.exportArgs);
			$.extend(this, args);
		}
	}
});
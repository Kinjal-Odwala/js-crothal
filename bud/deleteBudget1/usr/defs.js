ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.bud = { deleteBudget: {} };
    
}, 1);

ii.init.register( function() { 	
	
	fin.bud.deleteBudget.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};

	fin.bud.deleteBudget.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hirLevelTitle: {type: String, required: false, defaultValue: ""}
		, hirHierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.bud.deleteBudget.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.bud.deleteBudget.jdeCompanyArgs = {		
		id: {type: Number}
		, name: {type: String}		
	};
	
	fin.bud.deleteBudget.houseCodeJobArgs = {
		id: {type: Number}
		, jobId: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.bud.deleteBudget.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.bud.deleteBudget.weekPeriodYearArgs = {
		id: {type: Number}
		, yearId: {type: Number}
		, fiscalYear: {type: Number}		
	};
	
	fin.bud.deleteBudget.annualBudgetArgs = {
		id: {type: Number}
		, hcmHouseCode: {type: String}
		, fscYear: {type: String}
		, approved: {type: Boolean}
	};
	
	fin.bud.deleteBudget.annualInformationArgs = {
		id: {type: Number}
		, cutOffDate: {type: String,required: false, defaultValue: ""}		
	};

}, 2);

ii.Class({
	Name: "fin.bud.deleteBudget.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.JdeCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.WeekPeriodYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.AnnualBudget",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.annualBudgetArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.deleteBudget.AnnualInformation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.deleteBudget.annualInformationArgs);
			$.extend(this, args);
		}
	}
});
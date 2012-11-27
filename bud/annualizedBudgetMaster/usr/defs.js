ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

	fin.bud = { annualizedBudgetMaster: {}	};
	
}, 1);

ii.init.register( function(){
	
	fin.bud.annualizedBudgetMaster.hirNodeArgs = {
		id: {type: Number},
		nodeParentId: {type: Number},
		hirLevel: {type: Number, required: false, defaultValue: 0},
		hierarchyId: {type: Number, required: false, defaultValue: 0},
		brief: {type: String, required: false, defaultValue: ""},
		title: {type: String, required: false, defaultValue: ""},
		childNodeCount: {type: Number, required: false, defaultValue: 0},
		active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.bud.annualizedBudgetMaster.houseCodeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String},
		appUnit: {type: Number},
		brief: {type: String, required: false, defaultValue: ""},
		hirNode: {type: Number}
	};
	
	fin.bud.annualizedBudgetMaster.yearArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.bud.annualizedBudgetMaster.budAnnualBudgetArgs = {
		id: {type: Number},
		startDate: {type: String,required: false, defaultValue: ""},
		startedBy: {type: String,required: false, defaultValue: ""}
		};
	
}, 2);

ii.Class({
	Name: "fin.bud.annualizedBudgetMaster.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.bud.annualizedBudgetMaster.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualizedBudgetMaster.HouseCode",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.bud.annualizedBudgetMaster.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualizedBudgetMaster.Year",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.bud.annualizedBudgetMaster.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualizedBudgetMaster.BudAnnualBudget",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.bud.annualizedBudgetMaster.budAnnualBudgetArgs);
			$.extend(this, args);
		}
	}
});

ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.bud = { startBudget: {}};

},	1);

ii.init.register( function(){
	
	fin.bud.startBudget.budAnnualBudgetArgs = {
		id: {type: Number},
		crtdAt: {type: String,required: false, defaultValue: ""},
		crtdBy: {type: String,required: false, defaultValue: ""},	
		exported: {type: Boolean},
		fscYear: {type: String},
		hcmHouseCode: {type: String},
		lockedDown: {type: Boolean},
		startDate: {type: String,required: false, defaultValue: ""},
		startedBy: {type: String,required: false, defaultValue: ""}
		};
		
	fin.bud.startBudget.budAnnualBudgetDetailArgs = {
		id: {type: Number},
		announcement: {type: String,required: false, defaultValue: ""}		
		};	
	
}, 2);

ii.Class({
	Name: "fin.bud.startBudget.BudAnnualBudget",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.bud.startBudget.budAnnualBudgetArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.startBudget.BudAnnualBudgetDetail",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.bud.startBudget.budAnnualBudgetDetailArgs);
			$.extend(this, args);
		}
	}
});




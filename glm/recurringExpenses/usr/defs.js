ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.glm = { recurringExpenses: {} };
}, 1);

ii.init.register( function(){ 
		
	fin.glm.recurringExpenses.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.glm.recurringExpenses.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.glm.recurringExpenses.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.glm.recurringExpenses.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.glm.recurringExpenses.periodArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.glm.recurringExpenses.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
	};
	
	fin.glm.recurringExpenses.intervalTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};	  
	
	fin.glm.recurringExpenses.recurringExpenseArgs = {
		id: {type: Number, defaultValue: 0}
		, houseCode: {type: Number, required: false, defaultValue: 0}
		, fscYear: {type: Number, required: false, defaultValue: 0}
		, fscPeriod: {type: Number, required: false, defaultValue: 0}
		, fscAccountTo: {type: Number, required: false, defaultValue: 0}
		, houseCodeJobTo: {type: Number, required: false, defaultValue: 0}		
		, amount: {type: String, required: false, defaultValue: ""}
		, percent: {type: String, required: false, defaultValue: ""}
		, fscAccountFrom: {type: Number, required: false, defaultValue: 0}
		, houseCodeJobFrom: {type: Number, required: false, defaultValue: 0}
		, intervalType: {type: Number, required: false, defaultValue: 0}
		, readOnly: {type: Boolean, required: false, defaultValue: false}		
		, version: {type: Number, required: false, defaultValue: 0}
	};	    

}, 2);

ii.Class({
	Name: "fin.glm.recurringExpenses.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.HouseCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.glm.recurringExpenses.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.Year",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.Period",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.periodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.Account",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.IntervalType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.intervalTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.recurringExpenses.RecurringExpense",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.recurringExpenses.recurringExpenseArgs);
			$.extend(this, args);
		}
	}
});
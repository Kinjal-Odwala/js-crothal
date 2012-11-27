ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.bud = { contractBilling: {}};

},	1);

ii.init.register( function(){
	
	fin.bud.contractBilling.budBillingPeriodArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		hcmHouseCode: {type: Number, required: false, defaultValue: 0},
		fiscalYear: {type: Number, required: false, defaultValue: 0},
		rate: {type: String, required: false, defaultValue: ""},
		percentIncrease: {type: String, required: false, defaultValue: ""},
		dateEffective: {type: String, required: false, defaultValue: ""},
		description: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.bud.contractBilling.budIncomeTypeArgs = {
		//id: {type: Number, required: false, defaultValue: 0},
		description: {type: String},
		period1Amount: {type: String},		
		period2Amount: {type: String},		
		period3Amount: {type: String},		
		period4Amount: {type: String},		
		period5Amount: {type: String},		
		period6Amount: {type: String},		
		period7Amount: {type: String},		
		period8Amount: {type: String},		
		period9Amount: {type: String},		
		period10Amount: {type: String},		
		period11Amount: {type: String},		
		period12Amount: {type: String},	
		period13Amount: {type: String},		
		period14Amount: {type: String}	
	};	
	
	fin.bud.contractBilling.hcmHouseCodeArgs = {		
		id: {type: Number},
		contractTypeId: {type: String, required: false, defaultValue: ""},		
		billingCycleFrequencyType: {type: String, required: false, defaultValue: ""}	
	};	
	
	fin.bud.contractBilling.periodEndDateArgs = {
		year: {type: Number},
		title: {type: Number},	
		endDate: {type: String, required: false, defaultValue: ""}		
	};	
	
	fin.bud.contractBilling.periodArgs = {
		periodEndDate:{type: String},
		period1: {type: String},
		period2: {type: String, required: false, defaultValue: ""},	
		period3: {type: String, required: false, defaultValue: ""},
		period4: {type: String, required: false, defaultValue: ""},
		period5: {type: String, required: false, defaultValue: ""},	
		period6: {type: String, required: false, defaultValue: ""},
		period7: {type: String, required: false, defaultValue: ""},
		period8: {type: String, required: false, defaultValue: ""},	
		period9: {type: String, required: false, defaultValue: ""},
		period10: {type: String, required: false, defaultValue: ""},
		period11: {type: String, required: false, defaultValue: ""},	
		period12: {type: String, required: false, defaultValue: ""},
		period13: {type: String, required: false, defaultValue: ""},
		period14: {type: String, required: false, defaultValue: ""}	
	};	
	
}, 2);

ii.Class({
	Name: "fin.bud.contractBilling.BudBillingPeriod",
	Definition: {
		init: function (){
			var args = ii.args(arguments,fin.bud.contractBilling.budBillingPeriodArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.bud.contractBilling.BudIncomeType",
	Definition: {
		init: function (){
			var args = ii.args(arguments,fin.bud.contractBilling.budIncomeTypeArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.bud.contractBilling.HcmHouseCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments,fin.bud.contractBilling.hcmHouseCodeArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.bud.contractBilling.PeriodEndDate",
	Definition: {
		init: function (){
			var args = ii.args(arguments,fin.bud.contractBilling.periodEndDateArgs);
			$.extend(this, args);

		}
	}
});


ii.Class({
	Name: "fin.bud.contractBilling.Period",
	Definition: {
		init: function (){
			var args = ii.args(arguments,fin.bud.contractBilling.periodArgs);
			$.extend(this, args);

		}
	}
});




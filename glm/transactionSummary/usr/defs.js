ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.glm = { transactionSummary: {}};
	
}, 1);

ii.init.register( function(){
	
	fin.glm.transactionSummary.hirNodeArgs = {
		id: {type: Number},
		nodeParentId: {type: Number},
		hirLevel: {type: Number, required: false, defaultValue: 0},
		hierarchyId: {type: Number, required: false, defaultValue: 0},
		brief: {type: String, required: false, defaultValue: ""},
		title: {type: String, required: false, defaultValue: ""},
		childNodeCount: {type: Number, required: false, defaultValue: 0},
		active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.glm.transactionSummary.transactionSummaryArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		accountCode: {type: String, required: false, defaultValue: ""},
		glHeader: {type: String, required: false, defaultValue: ""},
		fscAcccTitle: {type: String, required: false, defaultValue: ""},
		description: {type: String, required: false, defaultValue: ""},
		negativeValue: {type: String, required: false, defaultValue: ""},
		wkAmount1: {type: String, required: false, defaultValue: ""},
		wkAmount2: {type: String, required: false, defaultValue: ""},
		wkAmount3: {type: String, required: false, defaultValue: ""},
		wkAmount4: {type: String, required: false, defaultValue: ""},
		wkAmount5: {type: String, required: false, defaultValue: ""},
		sumWKAmount: {type: String, required: false, defaultValue: ""},
		budgetAmount: {type: String, required: false, defaultValue: ""},
		variance: {type: String, required: false, defaultValue: ""},
		prevPeriodAmount: {type: String, required: false, defaultValue: ""},
		forecastAmount: {type: String, required: false, defaultValue: ""},
		forecastAmountProj: {type: String, required: false, defaultValue: ""}	
	};	 
	
	fin.glm.transactionSummary.jdeTransactionArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		vendor: {type: String, required: false, defaultValue: ""},	
		week1Amount: {type: String, required: false, defaultValue: ""},						
		week2Amount: {type: String, required: false, defaultValue: ""},
		week3Amount: {type: String, required: false, defaultValue: ""},
		week4Amount: {type: String, required: false, defaultValue: ""},
		week5Amount: {type: String, required: false, defaultValue: ""},
		negativeValue: {type: String, required: false, defaultValue: ""}
	};	  
	
	fin.glm.transactionSummary.jdeTransactionDetailArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		amount: {type: String, required: false, defaultValue: ""},
		crtdAt: {type: String, required: false, defaultValue: ""},
		crtdBy: {type: String, required: false, defaultValue: ""},
		description: {type: String, required: false, defaultValue: ""},
		documentNo: {type: String, required: false, defaultValue: ""},
		documentType: {type: String, required: false, defaultValue: ""},
		glDate: {type: String, required: false, defaultValue: ""},
		invoiceDate: {type: String, required: false, defaultValue: ""},
		invoiceNo: {type: String, required: false, defaultValue: ""},
		lineNumber: {type: String, required: false, defaultValue: ""},
		post: {type: String, required: false, defaultValue: ""},
		orderNumber: {type: String, required: false, defaultValue: ""},
		tableType: {type: String, required: false, defaultValue: ""},
		teamFinId: {type: String, required: false, defaultValue: ""},
		vendor: {type: String, required: false, defaultValue: ""},	
		vendorNumber: {type: String, required: false, defaultValue: ""},	
		fscAccount: {type: String, required: false, defaultValue: ""},	
		hcmHouseCode: {type: String, required: false, defaultValue: ""}	
	};	 
	
	fin.glm.transactionSummary.houseCodeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String},
		appUnit: {type: String},
		brief: {type: String},
		hirNode: {type: Number}
	};
	
	fin.glm.transactionSummary.periodArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};	    

	fin.glm.transactionSummary.fiscalYearArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.glm.transactionSummary.weekPeriodYearArgs = {
		id: {type: Number},
		week: {type: Number},
		period: {type: Number},
		fiscalYear: {type: Number},
		WeekStartDate: {type: String},
		periodStartDate: {type: String},
		previousPeriodEndDate: {type: String},
		periodEndDate: {type: String},
		totalWeek: {type: String}
	};	  
	
	fin.glm.transactionSummary.importArgs = {
		id: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.glm.transactionSummary.payPeriodArgs = {
		id: {type: Number},
		payPeriodFrequency: {type: String, required: false, defaultValue: ""},
		payPeriodStartDate: {type: String, required: false, defaultValue: ""},
		payPeriodEndDate: {type: String, required: false, defaultValue: ""},
		allowPayrollModification: {type: Boolean},
		approve: {type: Boolean}
	};
	
	fin.glm.transactionSummary.houseCodeJobArgs = {
		id: {type: Number, defaultValue: 0},
        jobNumber: {type: String, required: false, defaultValue: ""},
        jobTitle: {type: String, required: false, defaultValue: ""}
	};
		
}, 2);


ii.Class({
	Name: "fin.glm.transactionSummary.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.HouseCode",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.glm.transactionSummary.houseCodeArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.glm.transactionSummary.TransactionSummary",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.transactionSummaryArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.JDETransaction",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.jdeTransactionArgs);
			$.extend(this, args);					
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.JDETransactionDetail",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.jdeTransactionDetailArgs);
			$.extend(this, args);					
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.Period",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.periodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.FiscalYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.WeekPeriodYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});


ii.Class({
	Name: "fin.glm.transactionSummary.Import",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.importArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.PayPeriod",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.payPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.transactionSummary.HouseCodeJob",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.transactionSummary.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Import("fin.cmn.usr.defs");


ii.init.register( function() {

    fin.hcm = { financial: {} };
    
}, 1);

ii.init.register( function() {
	
	fin.hcm.financial.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.financial.remitToArgs = {
		id: {type: Number}
		, name: {type: String}
		, address1: {type: String, required: false}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false}
		, stateType: {type: Number, required: false}
        , zip: {type: String, required: false}
	};
	
	fin.hcm.financial.contractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.financial.termsOfContractTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.financial.billingCycleFrequencyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.financial.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.financial.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.financial.budgetTemplateArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.financial.budgetLaborCalcMethodArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.financial.fiscalYearArgs = {
        id: {type: Number}
        , title: {type: String}
    };

	fin.hcm.financial.applicationArgs = {
        id: {type: Number}
        , title: {type: String}
    };

	fin.hcm.financial.moduleArgs = {
		id: {type: Number}
		, name: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.financial.chargebackRateArgs = {
        id: {type: Number, required: false, defaultValue: 0}
		, yearId: {type: Number, required: false, defaultValue: 0}
		, application: {type: fin.hcm.financial.Application, required: false}
        , periodCharge: {type: String, required: false, defaultValue: ""}
    };

	fin.hcm.financial.appChargebackArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, yearId: {type: Number, required: false, defaultValue: 0}
		, chargebackRateId: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: false}
		, chargeAmount: {type: String, required: false, defaultValue: ""}
		, module: {type: fin.hcm.financial.Module, required: false, defaultValue: null}
		, startDate: {type: String, required: false, defaultValue: ""}
		, endDate: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.financial.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.ContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.contractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.TermsOfContractType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.termsOfContractTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.billingCycleFrequencyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.FinancialEntity",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.financialEntityArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.BudgetTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.budgetTemplateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.financial.BudgetLaborCalcMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.budgetLaborCalcMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.hcm.financial.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.financial.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});


ii.Class({
    Name: "fin.hcm.financial.Application",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.financial.applicationArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.hcm.financial.Module",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.moduleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.hcm.financial.ChargebackRate",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.financial.chargebackRateArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.hcm.financial.AppChargeback",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.appChargebackArgs);
			$.extend(this, args);
		}
	}
});
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

	fin.hcm.financial.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.financial.financialEntityArgs = {
		id: {type: Number}
		, name: {type: String}
		, financialEntity: {type: Boolean, required: false, defaultValue: false}
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
	Name: "fin.hcm.financial.BillingCycleFrequency",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.billingCycleFrequencyArgs);
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
	Name: "fin.hcm.financial.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.financial.invoiceLogoTypeArgs);
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
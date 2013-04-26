ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.rev = { invoice: {} };
}, 1);

ii.init.register( function() {

	fin.rev.invoice.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.rev.invoice.invoiceItemArgs = {
		id: {type: Number}
		, invoiceId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, hirNodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, taxableService: {type: Number, required: false, defaultValue: 0}
		, jobBrief: {type: String, required: false, defaultValue: ""}
		, overrideSiteTax: {type: Boolean, required: false, defaultValue: false}
		, account: {type: Number, required: false, defaultValue: 0}
		, statusType: {type: Number, required: false, defaultValue: 1}
		, quantity: {type: String, required: false, defaultValue: "0"}
		, price: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, taxable: {type: Boolean, required: false, defaultValue: false}
		, lineShow: {type: Boolean, required: false, defaultValue: true}		
		, description: {type: String, required: false, defaultValue: ""}
		, recurringFixedCost: {type: Boolean, required: false, defaultValue: false}
		, version: {type: Number, required: false, defaultValue: 0}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
	};

	fin.rev.invoice.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
	};
	
	fin.rev.invoice.taxableServiceArgs = {
		id: {type: Number}
		, title: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.rev.invoice.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoice.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoice.InvoiceItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoice.invoiceItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoice.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoice.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoice.TaxableService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoice.taxableServiceArgs);
			$.extend(this, args);
		}
	}
});
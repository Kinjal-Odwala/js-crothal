ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.rev = { accountReceivable: {} };
}, 1);

ii.init.register( function() {

	fin.rev.accountReceivable.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.rev.accountReceivable.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
	};
	
	fin.rev.accountReceivable.accountReceivableArgs = {
		id: {type: Number}
		, invoiceId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, jobBrief: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, depositDate: {type: String, required: false, defaultValue: ""}
		, checkDate: {type: String, required: false, defaultValue: ""}
		, checkNumber: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, account: {type: Number, required: false, defaultValue: 0}
		, payer: {type: String, required: false, defaultValue: ""}
		, statusType: {type: Number, required: false, defaultValue: 1}
		, notes: {type: String, required: false, defaultValue: ""}
		, version: {type: Number, required: false, defaultValue: 0}
		, creditMemoPrintedDate: {type: String, required: false, defaultValue: ""}
		, exportedDate: {type: String, required: false, defaultValue: ""}
	};

	fin.rev.accountReceivable.invoiceItemArgs = {
		id: {type: Number}
		, invoiceId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, hirNodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, jobBrief: {type: String, required: false, defaultValue: ""}
		, jobTitle: {type: String, required: false, defaultValue: ""}
		, account: {type: Number, required: false, defaultValue: 0}
		, amount: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.rev.accountReceivable.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.accountReceivable.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.accountReceivable.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.accountReceivable.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.accountReceivable.AccountReceivable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.accountReceivable.accountReceivableArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.accountReceivable.InvoiceItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.accountReceivable.invoiceItemArgs);
			$.extend(this, args);
		}
	}
});
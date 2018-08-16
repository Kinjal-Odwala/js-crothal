ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.fsc = { account: {} };
    
}, 1);

ii.init.register( function() {

	fin.fsc.account.accountCategoryArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String}
        , active: {type: Boolean}
	};
	
	fin.fsc.account.mopTotalTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.fsc.account.accountArgs = {
		id: {type: Number, defaultValue: 0}
		, accountCategoryId: {type: Number, defaultValue: 0}
		, statusType: {type: Number, defaultValue: 0}
		, code: {type: String}
		, description: {type: String}
		, postingEditCode: {type: String, required: false, defaultValue: ""}
		, glHeader: {type: String, required: false, defaultValue: ""}
		, mopTotalType: {type: Number, defaultValue: 0}
		, accountList: {type: String, required: false, defaultValue: ""}
		, group: {type: String, required: false, defaultValue: ""}
		, matchCode: {type: String, required: false, defaultValue: ""}
		, shortDescription: {type: String, required: false, defaultValue: ""}
        , negativeValue: {type: Boolean}
        , blockImportExport: {type: Boolean}
        , budget: {type: Boolean}
        , accountsPayable: {type: Boolean}
        , salariesWages: {type: Boolean}
        , recurringExpenses: {type: Boolean}
        , fieldTransfers: {type: Boolean}
        , inventory: {type: Boolean}
        , payrollWorkSheet: {type: Boolean}
        , managementFee: {type: Boolean}
        , directCost: {type: Boolean}
        , supplies: {type: Boolean}
        , accountReceivables: {type: Boolean}
        , wor: {type: Boolean}
        , otherRevenue: {type: Boolean}
        , poCapitalRequisition: {type: Boolean}
		, journalEntry: {type: Boolean}
		, chargebackRate: {type: Boolean}
		, balanceSheet: {type: Boolean}
		, profitAndLoss: {type: Boolean}
		, blockDeletion: {type: Boolean}
		, blockCreation: {type: Boolean}
		, blockPosting: {type: Boolean}
		, active: {type: Boolean}
	};
    
}, 2);

ii.Class({
	Name: "fin.fsc.account.AccountCategory",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.fsc.account.accountCategoryArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.fsc.account.MOPTotalType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.fsc.account.mopTotalTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.fsc.account.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.fsc.account.accountArgs);
			$.extend(this, args);
		}
	}
});
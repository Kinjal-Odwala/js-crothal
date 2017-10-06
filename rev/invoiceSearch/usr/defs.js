ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.rev = { invoiceSearch: {} };

}, 1);

ii.init.register( function() {

	fin.rev.invoiceSearch.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.rev.invoiceSearch.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.rev.invoiceSearch.invoiceArgs = {
		id: {type: Number}
		, houseCode: {type: Number, required: false, defaultValue: 0}
		, houseCodeBrief: {type: String, required: false, defaultValue: "0"}
		, invoiceNumber: {type: Number, required: false, defaultValue: 0}
		, documentNumber: {type: String, required: false, defaultValue: ""}
		, invoiceDate: {type: String, required: false, defaultValue: ""}
		, dueDate: {type: String, required: false, defaultValue: ""}
		, periodStartDate: {type: String, required: false, defaultValue: ""}
		, periodEndDate: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, collected: {type: String, required: false, defaultValue: ""}
		, credited: {type: String, required: false, defaultValue: ""}
		, statusType: {type: Number, required: false, defaultValue: 0}
		, billTo: {type: String, required: false, defaultValue: ""}
		, company: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, printed: {type: Boolean, required: false, defaultValue: false}
		, printedBy: {type: String, required: false, defaultValue: ""}
		, lastPrinted: {type: String, required: false, defaultValue: ""}
		, fscYear: {type: String, required: false, defaultValue:"0"}
		, paidOff: {type: Boolean, required:false, defaultValue: false}
		, taxExempt: {type: Boolean, required: false, defaultValue: false}
		, taxNumber: {type: String, required: false, defaultValue: ""}
		, stateTax: {type: String, required: false, defaultValue: ""}
		, localTax: {type: String, required: false, defaultValue: ""}
		, serviceLocation: {type: String, required: false, defaultValue: ""}
		, poNumber: {type: String, required: false, defaultValue: ""}
		, version: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}		
	};

}, 2);

ii.Class({
	Name: "fin.rev.invoiceSearch.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceSearch.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceSearch.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceSearch.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceSearch.Invoice",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceSearch.invoiceArgs);
			$.extend(this, args);
		}
	}
});
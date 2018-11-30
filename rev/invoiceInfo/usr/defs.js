ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.rev = { invoiceInfo: {} };
	
	fin.rev.invoiceInfo.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.rev.invoiceInfo.taxExemptArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.rev.invoiceInfo.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.rev.invoiceInfo.invoiceAddressTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.rev.invoiceInfo.serviceLocationArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.rev.invoiceInfo.invoiceBillToArgs = {
		id: {type: Number}
		, billTo: {type: String, required: false, defaultValue: ""}
		, company: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, taxId: {type: String, required: false, defaultValue: "0"}
		, sapCustomerNumber: {type: String, required: false, defaultValue: ""}
		, sendMethodType: {type: String, required: false, defaultValue: ""}
		, emailAddress: {type: String, required: false, defaultValue: ""}
		, dueDays: {type: Number, required: false, defaultValue: 0}
	};
	
}, 1);

ii.Class({
	Name: "fin.rev.invoiceInfo.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceInfo.TaxExempt",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.taxExemptArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceInfo.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceInfo.InvoiceAddressType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.invoiceAddressTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceInfo.ServiceLocation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.serviceLocationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.invoiceInfo.InvoiceBillTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.invoiceInfo.invoiceBillToArgs);
			$.extend(this, args);
		}
	}
});
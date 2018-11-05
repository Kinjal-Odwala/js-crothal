ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pur = { vendor: {} };

}, 1);

ii.init.register( function() {

	fin.pur.vendor.vendorStatusArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.pur.vendor.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.pur.vendor.poSendMethodTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.pur.vendor.selectVendorTypeArgs = {
		id: {type: Number}
		, name: {type: String}
		, value: {type: String}
	};

	fin.pur.vendor.recordCountArgs = {
	    id: {type: Number}
	    , recordCount: {type: Number}
	};

	fin.pur.vendor.vendorArgs = {
		id: {type: Number, defaultValue: 0}
		, statusType: {type: Number, defaultValue: 0}
		, vendorNumber: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zip: {type: String, required: false, defaultValue: ""}
		, contactName: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, phoneNumber: {type: String, required: false, defaultValue: ""}
		, faxNumber: {type: String, required: false, defaultValue: ""}
		, trainStation: {type: String, required: false, defaultValue: ""}
		, groupKey: {type: String, required: false, defaultValue: ""}
		, paymentTerm: {type: String, required: false, defaultValue: ""}
		, accountNumber: {type: String, required: false, defaultValue: ""}
		, memo: {type: String, required: false, defaultValue: ""}
		, minorityIndicator: {type: String, required: false, defaultValue: ""}
		, consolidatedCode: {type: String, required: false, defaultValue: ""}
		, consolidatedText: {type: String, required: false, defaultValue: ""}
		, categoryCode: {type: String, required: false, defaultValue: ""}
		, categoryText: {type: String, required: false, defaultValue: ""}
		, nominatedCode: {type: String, required: false, defaultValue: ""}
		, nominatedText: {type: String, required: false, defaultValue: ""}
		, paymentKeyTerms: {type: String, required: false, defaultValue: ""}
		, businessType: {type: String, required: false, defaultValue: ""}
		, country: {type: String, required: false, defaultValue: ""}
		, name3: {type: String, required: false, defaultValue: ""}
		, name4: {type: String, required: false, defaultValue: ""}
		, blockCentralPosting: {type: Boolean, required: false}
		, blockPayment: {type: Boolean, required: false}
		, blockPostingCompanyCode: {type: Boolean, required: false}
		, sendMethodType: {type: Number, required: false}
		, autoEmail: {type: Boolean, required: false}
		, nameSelectBy: {type: String, required: false, defaultValue: ""}
        , clientMandated: {type: Boolean, required: false}
        , nonCompliant: {type: Boolean, required: false}
        , active: {type: Boolean}
	};
}, 2);

ii.Class({
	Name: "fin.pur.vendor.VendorStatus",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.vendorStatusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.POSendMethodType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.poSendMethodTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.SelectVendorType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.selectVendorTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.Vendor",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.vendor.vendorArgs);
			$.extend(this, args);
		}
	}
});
ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.pur = { vendor: {}};
    
}, 1);

ii.init.register( function(){
	
	
	fin.pur.vendor.vendorArgs = {
		id: {type: Number, defaultValue: 0},
		vendorNumber: {type: String},
		title: {type: String, required: false, defaultValue: ""},
		addressLine1: {type: String, required: false, defaultValue: ""},
		addressLine2: {type: String, required: false, defaultValue: ""},
		city: {type: String, required: false, defaultValue: ""},
		stateType: {type: Number, required: false, defaultValue: 0},
		zip: {type: String, required: false, defaultValue: ""},
		sendMethodId: {type: Number, required: false},
		contactName: {type: String, required: false, defaultValue: ""},
		email: {type: String, required: false, defaultValue: ""},
		autoEmail: {type: Boolean, required: false},
		faxNumber: {type: String, required: false, defaultValue: ""},		
		phoneNumber: {type: String, required: false, defaultValue: ""},
		displayOrder: {type: Number, required: false, defaultValue: 1},
		active: {type: Boolean}
	};
	
	fin.pur.vendor.stateTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.pur.vendor.vendorStatusArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.pur.vendor.poSendMethodArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
    
}, 2);

ii.Class({
	Name: "fin.pur.vendor.Vendor",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.vendor.vendorArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.StateType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.vendor.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.POSendMethod",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.vendor.poSendMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.vendor.VendorStatus",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.vendor.vendorStatusArgs);
			$.extend(this, args);
		}
	}
});


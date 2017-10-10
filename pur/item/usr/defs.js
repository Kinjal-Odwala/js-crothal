ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.pur = { item: {}};
    
}, 1);

ii.init.register( function(){
	
	fin.pur.item.itemArgs = {
		id: {type: Number, defaultValue: 0},
		number: {type: String},
		number2: {type: String},
		description: {type: String},
		comClass: {type: String},
		comSubClass: {type: String},
		supplierClass: {type: String},
		uom: {type: String},
		account: {type: Number},
		price: {type: String},
		displayOrder: {type: Number, required: false},
		active: {type: Boolean}
	};
	
	fin.pur.item.itemStatusArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.pur.item.accountArgs = {
		id: {type: Number},
		code: {type: String},
		description: {type: String}
	};
    
	fin.pur.item.appApplicationHistoryArgs = {
	    id: { type: Number },
	    module: { type: String, required: false, defaultValue: "" },
	    refernce: { type: Number, required: false, defaultValue: 0 },
	    fieldName: { type: String, required: false, defaultValue: "" },
	    previousFieldValue: { type: String, required: false, defaultValue: "" },
	    lastModifiedBy: { type: String, required: false, defaultValue: "" },
	    lastModifiedAt: { type: String, required: false, defaultValue: "" }
	};

}, 2);

ii.Class({
	Name: "fin.pur.item.Item",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.item.itemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.item.ItemStatus",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.item.itemStatusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.item.Account",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.item.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.pur.item.AppApplicationHistory",
    Definition: {
        init: function () {
            var args = ii.args(arguments, fin.pur.item.appApplicationHistoryArgs);
            $.extend(this, args);
        }
    }
});
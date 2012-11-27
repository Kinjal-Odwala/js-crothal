ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.inv = { inventoryItem: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.inv.inventoryItem.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.inv.inventoryItem.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.inv.inventoryItem.fiscalYearArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.inv.inventoryItem.periodArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.inv.inventoryItem.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
	};
	
	fin.inv.inventoryItem.uomArgs = {
		id: {type: Number}
		, uom: {type: String}
	};
	
	fin.inv.inventoryItem.inventoryArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, yearId: {type: Number, required: false, defaultValue: 0}
		, periodId: {type: Number, required: false, defaultValue: 0}
		, year: {type: String, required: false, defaultValue: ""}
		, period: {type: String, required: false, defaultValue: ""}
		, countComplete: {type: Boolean, required: false, defaultValue: 0}
		, totalCost: {type: String, required: false, defaultValue: ""}
	};
	
	fin.inv.inventoryItem.recordCountArgs = {
	    id: {type: Number}
	    , recordCount: {type: Number}
	};
	
	fin.inv.inventoryItem.inventoryItemArgs = {
		id: {type: Number}
		, inventoryId: {type: Number}
		, account: {type: Number}
		, accountCode: {type: String, required: false, defaultValue: ""}
		, itemNumber: {type: String, required: false, defaultValue: ""}		
		, description: {type: String, required: false, defaultValue: ""}
		, comClass: {type: String, required: false, defaultValue: ""}
		, comSubClass: {type: String, required: false, defaultValue: ""}
		, supplierClass: {type: String, required: false, defaultValue: ""}
		, uom: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, totalCost: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}	
	};
	
	fin.inv.inventoryItem.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.inv.inventoryItem.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.Period",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.periodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.Uom",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.uomArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.Inventory",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.inventoryArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.InventoryItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.inventoryItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.inventoryItem.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.inventoryItem.fileNameArgs);
			$.extend(this, args);
		}
	}
});
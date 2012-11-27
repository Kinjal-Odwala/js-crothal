ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.inv = { administration: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.inv.administration.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.inv.administration.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.inv.administration.fiscalYearArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.inv.administration.periodArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.inv.administration.countCompleteArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.inv.administration.inventoryArgs = {
		id: {type: Number}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, year: {type: String, required: false, defaultValue: ""}
		, period: {type: String, required: false, defaultValue: ""}
		, yearTitle: {type: String, required: false, defaultValue: ""}
		, periodTitle: {type: String, required: false, defaultValue: ""}
		, countComplete: {type: Boolean, required: false, defaultValue: 0}
		, totalCost: {type: String, required: false, defaultValue: ""}
		, modBy: {type: String, required: false, defaultValue: ""}
		, modAt: {type: String, required: false, defaultValue: ""}
	};
	
	fin.inv.administration.recordCountArgs = {
	    id: {type: Number}
	    , recordCount: {type: Number}
	};
	
	fin.inv.administration.inventoryItemArgs = {
		id: {type: Number}
		, inventoryId: {type: Number, required: false, defaultValue: 0}
		, account: {type: Number, required: false, defaultValue: 0}
		, accountCode: {type: String, required: false, defaultValue: ""}
		, itemNumber: {type: String, required: false, defaultValue: ""}		
		, description: {type: String, required: false, defaultValue: ""}
		, comClass: {type: String, required: false, defaultValue: ""}
		, comSubClass: {type: String, required: false, defaultValue: ""}
		, supplierClass: {type: String, required: false, defaultValue: ""}
		, uom: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: "0.00"}
		, quantity: {type: String, required: false, defaultValue: "0"}
		, totalCost: {type: String, required: false, defaultValue: ""}
		, modBy: {type: String, required: false, defaultValue: ""}	
	};
	
	fin.inv.administration.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.inv.administration.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.Period",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.periodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.CountComplete",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.countCompleteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.Inventory",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.inventoryArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.InventoryItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.inventoryItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.inv.administration.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.inv.administration.fileNameArgs);
			$.extend(this, args);
		}
	}
});
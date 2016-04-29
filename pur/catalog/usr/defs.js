ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pur = { catalog: {} };
    
}, 1);

ii.init.register( function() {
	
	fin.pur.catalog.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.pur.catalog.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.pur.catalog.unitArgs = {
		id: {type: Number}
		, name: {type: String}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.pur.catalog.vendorArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.pur.catalog.catalogArgs = {
		id: {type: Number, defaultValue: 0}	
		, title: {type: String}
		, vendorId: {type: Number}
		, displayOrder: {type: Number, required: false}
		, active: {type: Boolean}
		, catalogHouseCodes: {type: [fin.pur.catalog.CatalogHouseCode], required: false}
		, catalogItems: {type: [fin.pur.catalog.CatalogItem], required: false}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};	
	
	fin.pur.catalog.catalogItemArgs = {
		id: {type: Number, defaultValue: 0}
		, itemId: {type: Number}
		, itemNumber: {type: String, required: false}
		, itemDescription: {type: String, required: false}
		, catalogId: {type: Number}
		, catalogTitle: {type: String}
		, price: {type: String}
		, displayOrder: {type: Number, required: false}
		, active: {type: Boolean}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.pur.catalog.catalogHouseCodeArgs = {
		id: {type: Number, defaultValue: 0}
		, catalogId: {type: Number, required: false}
		, houseCode: {type: Number, required: false}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean}
		, modified: {type: Boolean, required: false, defaultValue: false}	
	};
	
	fin.pur.catalog.purItemArgs = {
		id: {type: Number}
		, number: {type: String}
		, description: {type: String}
		, price: {type: String, required: false}
		, active:{type: Boolean}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};

	fin.pur.catalog.recordCountArgs = {
	    id: {type: Number}
	    , recordCount: {type: Number}
	};
	
	fin.pur.catalog.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.catalog.activeStatusArgs = {
	    id: { type: Number },
	    number: { type: Number },
	    name: { type: String }
	};
	    
}, 2);

ii.Class({
	Name: "fin.pur.catalog.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.Unit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.unitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.Vendor",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.vendorArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.PurItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.purItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.Catalog",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.catalogArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.CatalogItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.catalogItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.CatalogHouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.catalogHouseCodeArgs);
			$.extend(this, args);
			
			if(!this.houseCode){
				this.houseCode = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.RecordCount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.recordCountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.catalog.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.catalog.fileNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.pur.catalog.ActiveStatus",
    Definition: {
        init: function () {
            var args = ii.args(arguments, fin.pur.catalog.activeStatusArgs);
            $.extend(this, args);
        }
    }
});

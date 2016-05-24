ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pur = { itemPriceUpdate: {}};

}, 1);

ii.init.register( function() {

	fin.pur.itemPriceUpdate.itemArgs = {
		id: {type: Number}
		, number: {type: String}
		, description: {type: String}
		, price: { type: String }
   		, active: { type: Boolean }
	};

	fin.pur.itemPriceUpdate.catalogItemArgs = {
		id: {type: Number}
		, itemId: {type: Number}
		, catalogId: {type: Number}
		, catalogTitle: {type: String}
		, price: {type: String}
		, displayOrder: {type: Number, required: false}
		, active: {type: Boolean}
		, itemSelect: {type: Boolean, required: false, defaultValue: false}
		, effectivePrice: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.itemPriceUpdate.activeStatusArgs = {
	    id: { type: Number },
	    number: { type: Number },
	    name: { type: String }
	};

}, 2);

ii.Class({
	Name: "fin.pur.itemPriceUpdate.Item",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.itemPriceUpdate.itemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.itemPriceUpdate.CatalogItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.itemPriceUpdate.catalogItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.pur.itemPriceUpdate.ActiveStatus",
    Definition: {
        init: function () {
            var args = ii.args(arguments, fin.pur.itemPriceUpdate.activeStatusArgs);
            $.extend(this, args);
        }
    }
});
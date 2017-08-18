ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = {master: {}};
}, 1);

ii.init.register( function() {

	fin.pur.master.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.pur.master.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.pur.master.houseCodeDetailArgs = {
		id: {type: Number}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
	};

	fin.pur.master.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.pur.master.purchaseOrderArgs = {
		id: {type: Number}
		, houseCode: {type: Number}
		, houseCodeName: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, statusType: {type: Number, required: false, defaultValue: 1}		
		, year: {type: String, required: false, defaultValue: ""}
		, period: {type: String, required: false, defaultValue: ""}
		, week: {type: Number, required: false, defaultValue: 1}		
		, vendorId: {type: Number, required: false, defaultValue: 0}
		, vendorName: {type: String, required: false, defaultValue: ""}
		, vendorEmail: {type: String, required: false, defaultValue: ""}
		, sendMethod: {type: String, required: false, defaultValue: ""}
		, faxNumber: {type: String, required: false, defaultValue: ""}
		, orderNumber: {type: Number}
		, orderDate: {type: Date, required: false, defaultValue: ""}
		, orderAmount: {type: String, required: false, defaultValue: ""}
		, contactName: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zip: {type: String, required: false, defaultValue: ""}
		, phone: {type: String, required: false, defaultValue: ""}
		, fax: {type: String, required: false, defaultValue: ""}		
		, template: {type: Boolean, required: false, defaultValue: false}
		, templateTitle: {type: String, required: false, defaultValue: ""}		
		, reportFooter: {type: String, required: false, defaultValue: ""}
		, placedBy: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.pur.master.vendorArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.master.accountArgs = {
		id: {type: Number}
		, description: {type: String}
	};
	
	fin.pur.master.catalogArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.master.stateTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.pur.master.searchTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.master.purchaseOrderItemArgs = {
		id: {type: Number, defaultValue: 0}
		, itemSelect: {type: Boolean, required: false, defaultValue: false}
		, catalogTitle: {type: String, required: false, defaultValue: ""}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: "0"}
	};
	
}, 2);

ii.Class({
	Name: "fin.pur.master.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.HouseCode",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.pur.master.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.HouseCodeDetail",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.pur.master.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.PurchaseOrder",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.purchaseOrderArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.Vendor",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.vendorArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.Account",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.Catalog",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.catalogArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.StateType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.SearchType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.master.searchTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.master.PurchaseOrderItem",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.master.purchaseOrderItemArgs);
			$.extend(this, args);
		}
	}
});
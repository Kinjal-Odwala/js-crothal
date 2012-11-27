ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.rev = { workOrderToInvoice: {} };
}, 1);

ii.init.register( function() {
	
	fin.rev.workOrderToInvoice.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.rev.workOrderToInvoice.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.rev.workOrderToInvoice.closeReasonTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.rev.workOrderToInvoice.workOrderArgs = {
		id: {type: Number}
		, houseCodeBrief: {type: String, required: false, defaultValue: ""}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, closeReasonType: {type: fin.rev.workOrderToInvoice.CloseReasonType, required: false}
		, workOrderNumber: {type: Number, required: false, defaultValue: 0}
		, customer: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, completedDate: {type: String, required: false, defaultValue: ""}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.rev.workOrderToInvoice.taxValidationArgs = {
		id: {type: Number}
		, taxHouseCodes: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.rev.workOrderToInvoice.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.workOrderToInvoice.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.workOrderToInvoice.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.workOrderToInvoice.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.workOrderToInvoice.CloseReasonType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.workOrderToInvoice.closeReasonTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.workOrderToInvoice.WorkOrder",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.workOrderToInvoice.workOrderArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.workOrderToInvoice.TaxValidation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.workOrderToInvoice.taxValidationArgs);
			$.extend(this, args);
		}
	}
});
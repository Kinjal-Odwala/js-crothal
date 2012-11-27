ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.wom = { completeWorkOrder: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.wom.completeWorkOrder.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.wom.completeWorkOrder.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.wom.completeWorkOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.wom.completeWorkOrder.workOrderArgs = {
		id: {type: Number}
		, workOrderNumber: {type: Number, required: false, defaultValue: 0}
		, serviceLocation: {type: String, required: false, defaultValue: ""}
		, customer: {type: String, required: false, defaultValue: ""}
		, notes: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, completedDate: {type: String, required: false, defaultValue: ""}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};
	
}, 2);

ii.Class({
	Name: "fin.wom.completeWorkOrder.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.completeWorkOrder.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.completeWorkOrder.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.completeWorkOrder.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.completeWorkOrder.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.completeWorkOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.completeWorkOrder.WorkOrder",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.completeWorkOrder.workOrderArgs);
			$.extend(this, args);
		}
	}
});
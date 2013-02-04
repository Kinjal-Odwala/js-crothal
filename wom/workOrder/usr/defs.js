ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.wom = { workOrder: {} };

}, 1);

ii.init.register( function() {

	fin.wom.workOrder.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.wom.workOrder.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.wom.workOrder.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.wom.workOrder.statusArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.wom.workOrder.workOrderTaskArgs = {
		id: {type: Number}
		, title: {type: String}
		, markup: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.wom.workOrder.remitToArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.wom.workOrder.workOrderArgs = {
		id: {type: Number}
		, houseCode: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}
		, statusType: {type: Number, required: false, defaultValue: 1}
		, workOrderNumber: {type: Number, required: false, defaultValue: 0}
		, serviceLocationBrief: {type: String, required: false, defaultValue: ""}
		, serviceLocation: {type: String, required: false, defaultValue: ""}
		, customerBrief: {type: String, required: false, defaultValue: ""}
		, customer: {type: String, required: false, defaultValue: ""}
		, requestedBy: {type: String, required: false, defaultValue: ""}
		, tennant: {type: String, required: false, defaultValue: ""}
		, phone: {type: String, required: false, defaultValue: ""}
		, poNumber: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, overtimeAuthorized: {type: Boolean, required: false, defaultValue: false}
		, serviceContract: {type: String, required: false, defaultValue: ""}
		, generalLocationCode: {type: String, required: false, defaultValue: ""}
		, customerWorkOrderNumber: {type: String, required: false, defaultValue: ""}
		, squareFeet: {type: String, required: false, defaultValue: ""}
		, areaManagerEmail: {type: String, required: false, defaultValue: ""}
		, regionalManagerEmail: {type: String, required: false, defaultValue: ""}
		, subcontracted: {type: Boolean, required: false, defaultValue: false}
		, commissionable: {type: Boolean, required: false, defaultValue: false}		
		, notes: {type: String, required: false, defaultValue: ""}
		, invoiceNumber: {type: Number, required: false, defaultValue: 0}
		, completedDate: {type: String, required: false, defaultValue: ""}
		, closedDate: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.wom.workOrder.workOrderItemArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, workOrder: {type: Number, required: false, defaultValue: 0}
		, workOrderTask: {type: fin.wom.workOrder.WorkOrderTask, required: false}
		, description: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, price: {type: Number, required: false, defaultValue: 0}
		, markup: {type: Number, required: false, defaultValue: 0}
		, total: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.wom.workOrder.weekArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.wom.workOrder.hourArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.wom.workOrder.minuteArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.wom.workOrder.systemVariableArgs = {
		id: {type: Number, defaultValue: 0}
		, variableName: {type: String, required: false, defaultValue: ""}
		, variableValue: {type: String, required: false, defaultValue: ""}	
	};
	
}, 2);

ii.Class({
	Name: "fin.wom.workOrder.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.Status",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.statusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.WorkOrderTask",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.workOrderTaskArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.RemitTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.WorkOrder",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.workOrderArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.WorkOrderItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.workOrderItemArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.Week",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.weekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.Hour",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.hourArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.Minute",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.minuteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.wom.workOrder.SystemVariable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.wom.workOrder.systemVariableArgs);
			$.extend(this, args);			
		}
	}
});
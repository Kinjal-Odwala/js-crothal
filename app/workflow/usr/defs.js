ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { workflow: {} };

}, 1);

ii.init.register( function() {

	fin.app.workflow.hirNodeArgs = {
		id: {type: Number}
		, title: {type: String, required:false, defaultValue: ""}
	};

	fin.app.workflow.jdeCompanyArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.app.workflow.workflowModuleArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.app.workflow.workflowStepArgs = {
		id: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, addWorkflowUser: {type: Boolean, required: false, defaultValue: true}
		, addJDECompanyUser: {type: Boolean, required: false, defaultValue: true}
	};

	fin.app.workflow.userArgs = {
		id: {type: Number}
		, userId: {type: Number}
		, userName: {type: String, required: false, defaultValue: ""}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};

	fin.app.workflow.workflowJDECompanyArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, jdeCompanyId: {type: Number, required: false, defaultValue: 0}
		, workflowModuleId: {type: Number, required: false, defaultValue: 0}
		, workflowStepId: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: false}
	};

	fin.app.workflow.workflowHierarchyArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, nodeId: {type: Number, required: false, defaultValue: 0}
		, workflowModuleId: {type: Number, required: false, defaultValue: 0}
		, workflowStepId: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.app.workflow.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.JDECompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.jdeCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.WorkflowModule",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.workflowModuleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.WorkflowStep",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.workflowStepArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.userArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.WorkflowJDECompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.workflowJDECompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.workflow.WorkflowHierarchy",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.workflowHierarchyArgs);
			$.extend(this, args);
		}
	}
});
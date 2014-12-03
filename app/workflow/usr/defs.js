ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { workflow: {} };

}, 1);

ii.init.register( function() {

	fin.app.workflow.workflowStepArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
	};

	fin.app.workflow.userArgs = {
		id: {type: Number}
		, userName: {type: String, required: false, defaultValue: ""}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.app.workflow.WorkflowStep",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.workflowStepArgs);
			$.extend(this, args);
		}
	}
})

ii.Class({
	Name: "fin.app.workflow.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.workflow.userArgs);
			$.extend(this, args);
		}
	}
})
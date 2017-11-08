ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.emp = {
		cpm: {}
	};

}, 1);

ii.init.register( function() {

	fin.emp.cpm.systemVariableArgs = {
		id: {type: Number}
		, variableName: {type: String, required: false, defaultValue: ""}
		, variableValue: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.emp.cpm.SystemVariable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.cpm.systemVariableArgs);
			$.extend(this, args);
		}
	}
});
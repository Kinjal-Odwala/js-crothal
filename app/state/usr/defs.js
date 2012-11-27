ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { state: {}};
 
}, 1);

ii.init.register( function() {

	fin.app.state.stateTypeArgs = {
		id: {type: Number, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, minimumWage: {type: Number, required: false, defaultValue: 0.00}
	};

}, 2);

ii.Class({
	Name: "fin.app.state.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.stateTypeArgs);
			$.extend(this, args);
		}
	}
});
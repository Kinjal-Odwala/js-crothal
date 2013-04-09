ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { feedback: {} };

}, 1);

ii.init.register( function() {

	fin.app.feedback.moduleArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.app.feedback.Module",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.state.moduleArgs);
			$.extend(this, args);
		}
	}
});
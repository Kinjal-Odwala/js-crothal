ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.rev = { taxableService: {} };
 
}, 1);

ii.init.register( function() {

	fin.rev.taxableService.stateTypeArgs = {
		id: {type: Number, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
	};
	
	fin.rev.taxableService.taxableServiceArgs = {
		id: {type: Number}
		, title: {type: String}
		, taxable: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.rev.taxableService.taxableServiceStateArgs = {
		id: {type: Number}
		, taxableService: {type: Number, required: false, defaultValue: 0}
		, taxableServiceTitle: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, taxable: {type: Boolean, required: false, defaultValue: false}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.rev.taxableService.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxableService.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxableService.TaxableService",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxableService.taxableServiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.taxableService.TaxableServiceState",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.taxableService.taxableServiceStateArgs);
			$.extend(this, args);
		}
	}
});
ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.hcm = { remitTo: {}};
    
}, 1);

ii.init.register( function(){
	
	fin.hcm.remitTo.remitToArgs = {
		id: {type: Number, defaultValue: 0},
		title: {type: String},
		address1: {type: String, required: false},
		address2: {type: String, required: false, defaultValue: ""},
		city: {type: String, required: false},
		stateType: {type: Number, required: false},
        zip: {type: String, required: false},
        active: {type: Boolean, required: false},
		displayOrder: {type: String, required: false}
	};
	
	fin.hcm.remitTo.stateTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
    
}, 2);

ii.Class({
	Name: "fin.hcm.remitTo.RemitTo",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.remitTo.remitToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.remitTo.StateType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.remitTo.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

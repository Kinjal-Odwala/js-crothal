ii.Import("fin.cmn.usr.defs");


ii.init.register( function(){
    fin.fsc = { fiscalPattern: {}};

}, 1);

ii.init.register( function(){ //debugger;
	
	fin.fsc.fiscalPattern.fiscalPatternArgs = {
		id: {type: Number},
		title: {type: String},
		displayOrder: {type: String, defaultValue: "1"},
		active: {type: Boolean},
		modified: {type: Boolean, required: false, defaultValue: false}
	};	    

}, 2);


ii.Class({
	Name: "fin.fsc.fiscalPattern.FiscalPattern",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.fiscalPattern.fiscalPatternArgs);
			$.extend(this, args);
		}
	}
});
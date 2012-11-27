ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.fsc = { jdeCompany: {}};
    
}, 1);

ii.init.register( function(){
	
	fin.fsc.jdeCompany.jdeCompanyArgs = {
		id: {type: Number, defaultValue: 0},
		title: {type: String},
		pattern: {type: fin.fsc.jdeCompany.FiscalPattern, required: false},
		active: {type: Boolean},
		modified: {type: Boolean, required: false, defaultValue:false}
	};
    
	fin.fsc.jdeCompany.fiscalPatternArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};	    

}, 2);

ii.Class({
	Name: "fin.fsc.jdeCompany.JDECompany",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.jdeCompany.jdeCompanyArgs);
			$.extend(this, args);
			
			if(!this.pattern){
				this.pattern = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.fsc.jdeCompany.FiscalPattern",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.jdeCompany.fiscalPatternArgs);
			$.extend(this, args);
		}
	}
});

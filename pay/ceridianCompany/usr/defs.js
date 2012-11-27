ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pay = { ceridianCompany: {} };
}, 1);

ii.init.register( function() { 
	
		fin.pay.ceridianCompany.ceridianCompanyArgs = {
			id: {type: Number, defaultValue: 0}
			, brief: {type: String}
			, title: {type: String}
			, frequencyType: {type: fin.pay.ceridianCompany.FrequencyType, required: false}
			, active: {type: Boolean, defaultValue: true}
			, modified: {type: Boolean, required: false, defaultValue: false}
		};	    
	
		fin.pay.ceridianCompany.frequencyTypeArgs = {
			id: {type: Number}
			, title: {type: String}
		};
}, 2);

ii.Class({
	Name: "fin.pay.ceridianCompany.CeridianCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.ceridianCompany.ceridianCompanyArgs);
			$.extend(this, args);

			if(!this.frequencyType) {
				this.frequencyType = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pay.ceridianCompany.FrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.ceridianCompany.frequencyTypeArgs);
			$.extend(this, args);
		}
	}
});
ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.bud = { annualInformation: {} };
    
}, 1);

ii.init.register( function(){
	
	fin.bud.annualInformation.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.bud.annualInformation.periodArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.bud.annualInformation.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, description: {type: String}
		, assigned: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.bud.annualInformation.annualInformationArgs = {
		id: {type: Number}
		, fscYear: {type: Number}
		, startDate: {type: String, required: false, defaultValue: ""}
		, cutOffDate: {type: String, required: false, defaultValue: ""}
		, genLiabilityRate: {type: String, required: false, defaultValue: ""}	
		, genLiabilityAccCodes: {type: String, required: false, defaultValue: ""}		
		, benefitAdjStartPeriod: {type: Number, required: false, defaultValue: 0}	
		, benefitAdjEndPeriod: {type: Number, required: false, defaultValue: 0}
		, benefitAdjPercent: {type: String, required: false, defaultValue: ""}
		, supplySurchargeRate: {type: String, required: false, defaultValue: ""}
		, computerRelatedChargeUnit: {type: String, required: false, defaultValue: ""}
		, computerRelatedChargeOverhead: {type: String, required: false, defaultValue: ""}
		, retailVacationAccuralPercent: {type: String, required: false, defaultValue: ""}
		, announcement: {type: String, required: false, defaultValue: ""}
	};
	
}, 2);

ii.Class({
	Name: "fin.bud.annualInformation.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.annualInformation.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualInformation.Period",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.annualInformation.periodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualInformation.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.annualInformation.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.annualInformation.AnnualInformation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.bud.annualInformation.annualInformationArgs);
			$.extend(this, args);
		}
	}
});
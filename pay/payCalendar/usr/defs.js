ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pay = { payCalendar: {}};
    
}, 1);

ii.init.register( function() {
	
	fin.pay.payCalendar.fiscalYearArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		patternTitle: {type: String, required: false},
		title: {type: String, required: false},
		periods: {type: [fin.pay.payCalendar.PayPeriod], required: false}
	};
	
	fin.pay.payCalendar.frequencyTypeArgs = {
		id: {type: Number},
		title: {type: String},
		value: {type: String, required: false}
	};
	
	fin.pay.payCalendar.payPeriodArgs = {
		id: {type: Number},
		year: {type: Number, required: false, defaultValue: 0},
		frequencyType: {type: Number, required: false, defaultValue: 0},
		title: {type: String, required: false, defaultValue: ""},
		startDate: {type: Date, required: false},
		endDate: {type: Date, required: false},
		displayOrder: {type: Number, required: false, defaultValue: 1},
		active: {type: Boolean, required: false, defaultValue: true},
		modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.pay.payCalendar.FiscalYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.payCalendar.fiscalYearArgs);
			$.extend(this, args);
			
			if( !this.periods ){
				this.periods = [];
			}			
		}
	}
});

ii.Class({
	Name: "fin.pay.payCalendar.FrequencyType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.payCalendar.frequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCalendar.PayPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCalendar.payPeriodArgs);
			$.extend(this, args);
		}
	}
});
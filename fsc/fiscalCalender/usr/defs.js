ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.fsc = { fiscalCalender: {}};
    
}, 1);

ii.init.register( function(){
	
		fin.fsc.fiscalCalender.fiscalYearArgs = {
			id: {type: Number, required: false, defaultValue: 0},
			patternId: {type: Number, required: false},
			patternTitle: {type: String, required: false},
			title: {type: String, required: false},
			displayOrder: {type: String, required: false, defaultValue: "1"},
			periods: {type: [fin.fsc.fiscalCalender.FiscalPeriod], required: false}
		};	    
		
		fin.fsc.fiscalCalender.fiscalPeriodArgs = {
			id: {type: Number, required: false},
			year: {type: String, required: false},
			fscYeaTitle: {type: String, required: false},
			title: {type: Number,required: false, defaultValue: 0},
			startDate: {type: Date, required: false},
			endDate: {type: Date, required: false},
			week1: {type: Number, required: false, defaultValue: 0},
			week2: {type: Number, required: false, defaultValue: 0},
			week3: {type: Number, required: false, defaultValue: 0},
			week4: {type: Number, required: false, defaultValue: 0},
			week5: {type: Number, required: false, defaultValue: 0},
			week6: {type: Number, required: false, defaultValue: 0},
			displayOrder: {type: String, required: false, defaultValue: "1"},
			modified: {type: Boolean, required: false, defaultValue: false}
		};	 
		
		fin.fsc.fiscalCalender.fiscalPatternArgs = {
			id: {type: Number, required: false },
			number: {type: Number, required: false},
			name: {type: String, required: false}
	};

}, 2);

ii.Class({
	Name: "fin.fsc.fiscalCalender.FiscalYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.fiscalCalender.fiscalYearArgs);
			$.extend(this, args);
			
			if( !this.periods ){
				this.periods = [];
			}			
		}
	}
});

ii.Class({
	Name: "fin.fsc.fiscalCalender.FiscalPeriod",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.fiscalCalender.fiscalPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.fsc.fiscalCalender.FiscalPattern",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.fsc.fiscalCalender.fiscalPatternArgs);
			$.extend(this, args);
		}
	}
});
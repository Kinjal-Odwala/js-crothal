ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

	fin.pay = {master: {}};
	
}, 1);

ii.init.register( function(){
	
	fin.pay.master.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.pay.master.houseCodeArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, timeAndAttendance: {type: Boolean, required: false, defaultValue: false}
		, defaultLunchBreak: {type: Number, required: false, defaultValue: 0}
		, lunchBreakTrigger: {type: Number, required: false, defaultValue: 0}
		, roundingTimePeriod: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.pay.master.fiscalYearArgs = {
		id: {type: Number}
		, name: {type: String}
	};
    
	fin.pay.master.weekArgs = {
		id: {type: Number}
		, weekStartDate: {type: String}
		, weekEndDate: {type: String}
	};

	fin.pay.master.weekPeriodYearArgs = {
		id: {type: Number}
		, week: {type: Number}
		, period: {type: Number}
		, fiscalYear: {type: Number}
		, WeekStartDate: {type: String}
		, periodStartDate: {type: String}
		, periodEndDate: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.pay.master.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.master.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.master.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.master.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.master.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.master.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.master.Week",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.master.weekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.master.WeekPeriodYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.master.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});
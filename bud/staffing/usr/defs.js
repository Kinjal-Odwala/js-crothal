ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.bud = { staffing: {} };

},	1);

ii.init.register( function(){
	
	fin.bud.staffing.shiftTypeArgs = {
		id: {type: Number},
		name: {type: String}
	};
	
	fin.bud.staffing.staffingHourArgs = {
		id: {type: Number},
		houseCode: {type: Number, required: false, defaultValue: 0},
		year: {type: Number, required: false, defaultValue: 0},
		shiftType: {type: Number, required: false, defaultValue: 0},
		unit: {type: Number, required: false, defaultValue: 0},
		shiftTitle: {type: String, required: false, defaultValue: ""},	
		unitTitle: {type: String, required: false, defaultValue: ""},
		currentSunday: {type: Number, required: false, defaultValue: 0},
		currentMonday: {type: Number, required: false, defaultValue: 0},
		currentTuesday: {type: Number, required: false, defaultValue: 0},
		currentWednesday: {type: Number, required: false, defaultValue: 0},
		currentThursday: {type: Number, required: false, defaultValue: 0},
		currentFriday: {type: Number, required: false, defaultValue: 0},
		currentSaturday: {type: Number, required: false, defaultValue: 0},
		currentWeeklyTotal: {type: Number, required: false, defaultValue: 0},
		currentHolidays: {type: Number, required: false, defaultValue: 0},
		proposedSunday: {type: Number, required: false, defaultValue: 0},
		proposedMonday: {type: Number, required: false, defaultValue: 0},
		proposedTuesday: {type: Number, required: false, defaultValue: 0},
		proposedWednesday: {type: Number, required: false, defaultValue: 0},
		proposedThursday: {type: Number, required: false, defaultValue: 0},
		proposedFriday: {type: Number, required: false, defaultValue: 0},
		proposedSaturday: {type: Number, required: false, defaultValue: 0},
		proposedWeeklyTotal: {type: Number, required: false, defaultValue: 0},
		proposedHolidays: {type: Number, required: false, defaultValue: 0},
		modified: {type: Boolean, required: false, defaultValue: false}
	};
	
}, 2);

ii.Class({
	Name: "fin.bud.staffing.ShiftType",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.bud.staffing.shiftTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.bud.staffing.StaffingHour",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.bud.staffing.staffingHourArgs);
			$.extend(this, args);
		}
	}
});


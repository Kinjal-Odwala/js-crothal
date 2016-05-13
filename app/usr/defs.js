ii.Import("fin.cmn.usr.defs");

ii.init.register( function fin_app_startup_init() {
	fin.app = {};

	fin.app.userRoleArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
		, roleCurrent: {type: Boolean, required: false, defaultValue: false}
	}
	
	fin.app.weekPeriodYearArgs = {
		id: {type: Number}
		, week: {type: Number, required: false, defaultValue: 0}
		, periodId: {type: Number, required: false, defaultValue: 0}
		, period: {type: Number, required: false, defaultValue: 0}
		, yearId: {type: Number, required: false, defaultValue: 0}
		, fiscalYear: {type: String, required: false, defaultValue: "0"}
		, currentDate: {type: String, required: false, defaultValue: ""}
		, WeekStartDate: {type: String, required: false, defaultValue: ""}
	}
	
	fin.app.systemVariableArgs = {
		id: {type: Number}
		, variableName: {type: String, required: false, defaultValue: ""}
		, variableValue: {type: String, required: false, defaultValue: ""}	
	};

	fin.app.appApplicationHistoryArgs = {
	    id: { type: Number },
	    module: { type: String, required: false, defaultValue: "" },
	    refernce: { type: Number, required: false, defaultValue: 0 },
        fieldName: { type: String, required: false, defaultValue: "" },
	    previousFieldValue: { type: String, required: false, defaultValue: "" },
	    lastModifiedBy: { type: String, required: false, defaultValue: "" },
	    lastModifiedAt: { type: String, required: false, defaultValue: "" }
	};

}, 1);

ii.Class({
	Name: "fin.app.UserRole",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.userRoleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.WeekPeriodYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.SystemVariable",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.systemVariableArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
    Name: "fin.app.AppApplicationHistory",
    Definition: {
        init: function () {
            var args = ii.args(arguments, fin.app.appApplicationHistoryArgs);
            $.extend(this, args);
        }
    }
});
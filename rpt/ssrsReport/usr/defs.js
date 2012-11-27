ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.rpt = { ssrs: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.rpt.ssrs.userArgs = {
		id: {type: Number}
		, roleCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.rpt.ssrs.roleArgs = {
		id: {type: Number}
		, hirNodeCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.rpt.ssrs.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};

	fin.rpt.ssrs.hirNodeArgs = {
		id: {type: Number}
		, number: {type: Number, required:false, defaultValue: 0}
		, name: {type: String, required:false, defaultValue: ""}
		, title: {type: String, required:false, defaultValue: ""}
		, hirLevel: {type: Number, required:false, defaultValue: 0}
		, nodeParentId: {type: Number, required:false, defaultValue: 0}
		, childNodeCount: {type: Number, required:false, defaultValue: 0}
		, fullPath: {type: String, required: false, defaultValue: ""}
		, editable: {type: Boolean, required: false, defaultValue: false}
		, serverStatus: {type: String, required: false, defaultValue: ""}
		, serverMessage: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.fiscalYearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.rpt.ssrs.fiscalPeriodArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.rpt.ssrs.fiscalWeekArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.rpt.ssrs.reportArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, title: {type: String}
		, name: {type: String, required: false, defaultValue: ""}
		, subscriptionAvailable: {type: Boolean, required: false, defaultValue: false}
		, reportURL: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.reportParameterArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, dataType: {type: String, required: false, defaultValue: ""}
		, controlType: {type: String, required: false, defaultValue: ""}
		, defaultValue: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.subscriptionArgs = {
		id: {type: String}
		, reportName: {type: String, required: false, defaultValue: ""}
		, scheduleType: {type: String, required: false, defaultValue: ""}
		, subscriptionId: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, to: {type: String, required: false, defaultValue: ""}
		, cc: {type: String, required: false, defaultValue: ""}
		, subject: {type: String, required: false, defaultValue: ""}
		, includeReport: {type: Boolean, required: false, defaultValue: false}
		, includeLink: {type: Boolean, required: false, defaultValue: false}
		, reportFormat: {type: String, required: false, defaultValue: ""}
		, priority: {type: String, required: false, defaultValue: ""}
		, comment: {type: String, required: false, defaultValue: ""}
		, parameters: {type: String, required: false, defaultValue: ""}
		, hours: {type: String, required: false, defaultValue: ""}
		, minutes: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, startTime: {type: String, required: false, defaultValue: ""}
		, stopSchedule: {type: Boolean, required: false, defaultValue: false}
		, endDate: {type: String, required: false, defaultValue: ""}
		, days: {type: String, required: false, defaultValue: ""}
		, weekOfMonth: {type: String, required: false, defaultValue: ""}
		, numberOfDays: {type: Number, required:false, defaultValue: 0}
		, numberOfWeeks: {type: Number, required:false, defaultValue: 0}
		, sunday: {type: Boolean, required: false, defaultValue: false}
		, monday: {type: Boolean, required: false, defaultValue: false}
		, tuesday: {type: Boolean, required: false, defaultValue: false}
		, wednesday: {type: Boolean, required: false, defaultValue: false}
		, thursday: {type: Boolean, required: false, defaultValue: false}
		, friday: {type: Boolean, required: false, defaultValue: false}
		, saturday: {type: Boolean, required: false, defaultValue: false}
		, january: {type: Boolean, required: false, defaultValue: false}
		, february: {type: Boolean, required: false, defaultValue: false}
		, march: {type: Boolean, required: false, defaultValue: false}
		, april: {type: Boolean, required: false, defaultValue: false}
		, may: {type: Boolean, required: false, defaultValue: false}
		, june: {type: Boolean, required: false, defaultValue: false}
		, july: {type: Boolean, required: false, defaultValue: false}
		, august: {type: Boolean, required: false, defaultValue: false}
		, september: {type: Boolean, required: false, defaultValue: false}
		, october: {type: Boolean, required: false, defaultValue: false}
		, november: {type: Boolean, required: false, defaultValue: false}
		, december: {type: Boolean, required: false, defaultValue: false}
	};	

	fin.rpt.ssrs.weekArgs = {
		id: {type: Number}
		, brief: {type: String}
		, title: {type: String}
	};

	fin.rpt.ssrs.hourArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.minuteArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.deliveredByArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.reportFormatArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.priorityArgs = {
		id: {type: Number}
		, title: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.rpt.ssrs.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.userArgs);
			$.extend(this, args);
			
			if (!this.appRoles) {
				this.appRoles = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Role",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.roleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalWeek",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalWeekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Report",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ReportParameter",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportParameterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Subscription",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.subscriptionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Week",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.weekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Hour",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.hourArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Minute",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.minuteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.DeliveredBy",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.deliveredByArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ReportFormat",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportFormatArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Priority",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.priorityArgs);
			$.extend(this, args);
		}
	}
});
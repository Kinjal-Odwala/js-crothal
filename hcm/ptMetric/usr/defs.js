ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.hcm = { ptMetric: {} };
}, 1);

ii.init.register( function() {
	
	fin.hcm.ptMetric.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.ptMetric.houseCodeArgs = {
		id: {type: Number}
		, appUnit: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, brief:{type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.hcm.ptMetric.fiscalYearArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false}
	};

	fin.hcm.ptMetric.metricTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, subType: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, dataType: {type: String, required: false, defaultValue: ""}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
	};

	fin.hcm.ptMetric.metricArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number, defaultValue: 0}
		, yearId: {type: Number, defaultValue: 0}
		, chiefExecutiveOfficer: {type: String, required: false, defaultValue: ""}
		, chiefFinancialOfficer: {type: String, required: false, defaultValue: ""}
		, chiefOperatingOfficer: {type: String, required: false, defaultValue: ""}
		, chiefNursingOfficer: {type: String, required: false, defaultValue: ""}
		, contractStartDate: {type: String, required: false, defaultValue: ""}
		, contractRenewalDate: {type: String, required: false, defaultValue: ""}
		, cpiDueDate: {type: String, required: false, defaultValue: ""}
		, cpiCap: {type: String, required: false, defaultValue: ""}
		, hourlyFTEVacancies: {type: String, required: false, defaultValue: ""}
		, fullTimePartTimeRatio: {type: String, required: false, defaultValue: ""}
		, percentageOperatingCapacity: {type: String, required: false, defaultValue: ""}
		, serviceLineEVS: {type: String, required: false, defaultValue: ""}
		, serviceLineLaundry: {type: String, required: false, defaultValue: ""}
		, serviceLinePOM: {type: String, required: false, defaultValue: ""}
		, serviceLineCES: {type: String, required: false, defaultValue: ""}
		, notes: {type: String, required: false, defaultValue: ""}
	};
	
	fin.hcm.ptMetric.numericDetailArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
	};
	
	fin.hcm.ptMetric.textDetailArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
	};
	
	fin.hcm.ptMetric.laborControlArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ptMetric.strategicInitiativeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, hospitalIntiative: {type: String, required: false, defaultValue: ""}
		, expectedOutcome: {type: String, required: false, defaultValue: ""}
		, departmentIntiative: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ptMetric.qualityControlArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ptMetric.ptPressGaneyArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ptMetric.evsHCAHPSArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, period1: {type: String, required: false, defaultValue: ""}
		, period2: {type: String, required: false, defaultValue: ""}
		, period3: {type: String, required: false, defaultValue: ""}
		, period4: {type: String, required: false, defaultValue: ""}
		, period5: {type: String, required: false, defaultValue: ""}
		, period6: {type: String, required: false, defaultValue: ""}
		, period7: {type: String, required: false, defaultValue: ""}
		, period8: {type: String, required: false, defaultValue: ""}
		, period9: {type: String, required: false, defaultValue: ""}
		, period10: {type: String, required: false, defaultValue: ""}
		, period11: {type: String, required: false, defaultValue: ""}
		, period12: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ptMetric.qualityPartnershipArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, quarter1: {type: String, required: false, defaultValue: ""}
		, quarter2: {type: String, required: false, defaultValue: ""}
		, quarter3: {type: String, required: false, defaultValue: ""}
		, quarter4: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.ptMetric.auditScoreArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, ptMetricId: {type: Number, required: false, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, annual1: {type: String, required: false, defaultValue: ""}
		, annual2: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.ptMetric.standardMetricArgs = {
		id: {type: Number}
		, yearId: {type: Number, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, onTimeScheduled: {type: String, required: false, defaultValue: ""}
		, rta10: {type: String, required: false, defaultValue: ""}
		, dtc20: {type: String, required: false, defaultValue: ""}
		, rtc30: {type: String, required: false, defaultValue: ""}
		, tpph: {type: String, required: false, defaultValue: ""}
		, tppd: {type: String, required: false, defaultValue: ""}
		, itppd: {type: String, required: false, defaultValue: ""}
		, cancellation: {type: String, required: false, defaultValue: ""}
		, delay: {type: String, required: false, defaultValue: ""}
		, discharges: {type: String, required: false, defaultValue: ""}
	};
	
	fin.hcm.ptMetric.inHouseStandardMetricArgs = {
		id: {type: Number}
		, yearId: {type: Number, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, onTimeScheduled: {type: String, required: false, defaultValue: ""}
		, rta10: {type: String, required: false, defaultValue: ""}
		, dtc20: {type: String, required: false, defaultValue: ""}
		, rtc30: {type: String, required: false, defaultValue: ""}
		, tpph: {type: String, required: false, defaultValue: ""}
		, tppd: {type: String, required: false, defaultValue: ""}
		, itppd: {type: String, required: false, defaultValue: ""}
		, cancellation: {type: String, required: false, defaultValue: ""}
		, delay: {type: String, required: false, defaultValue: ""}
		, discharges: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.ptMetric.thirdPartyStandardMetricArgs = {
		id: {type: Number}
		, yearId: {type: Number, defaultValue: 0}
		, ptMetricType: {type: fin.hcm.ptMetric.MetricType, required: false}
		, ptMetricTypeTitle: {type: String, required: false, defaultValue: ""}
		, onTimeScheduled: {type: String, required: false, defaultValue: ""}
		, rta10: {type: String, required: false, defaultValue: ""}
		, dtc20: {type: String, required: false, defaultValue: ""}
		, rtc30: {type: String, required: false, defaultValue: ""}
		, tpph: {type: String, required: false, defaultValue: ""}
		, tppd: {type: String, required: false, defaultValue: ""}
		, itppd: {type: String, required: false, defaultValue: ""}
		, cancellation: {type: String, required: false, defaultValue: ""}
		, delay: {type: String, required: false, defaultValue: ""}
		, discharges: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
}, 2);

ii.Class({
	Name: "fin.hcm.ptMetric.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.MetricType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.metricTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.Metric",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.metricArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.NumericDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.numericDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.TextDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.textDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.LaborControl",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.laborControlArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.StrategicInitiative",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.strategicInitiativeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.QualityControl",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.qualityControlArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.PTPressGaney",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.ptPressGaneyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.EVSHCAHPS",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.evsHCAHPSArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.QualityPartnership",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.qualityPartnershipArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.AuditScore",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.auditScoreArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.StandardMetric",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.standardMetricArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.InHouseStandardMetric",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.inHouseStandardMetricArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ptMetric.ThirdPartyStandardMetric",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ptMetric.thirdPartyStandardMetricArgs);
			$.extend(this, args);
		}
	}
});
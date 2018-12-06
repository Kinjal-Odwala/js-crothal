ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { evsMetric: {} };
}, 1);

ii.init.register( function() {

    fin.hcm.evsMetric.hirNodeArgs = {
        id: {type: Number}
        , nodeParentId: {type: Number}
        , hirLevel: {type: Number, required: false, defaultValue: 0}
        , hierarchyId: {type: Number, required: false, defaultValue: 0}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , childNodeCount: {type: Number, required: false, defaultValue: 0}
        , active: {type: Boolean, required: false, defaultValue: true}
    };

    fin.hcm.evsMetric.houseCodeArgs = {
        id: {type: Number}
        , appUnit: {type: Number}
        , number: {type: Number}
        , name: {type: String}
        , brief:{type: String, required: false, defaultValue: ""}
        , hirNode: {type: Number}
    };

	fin.hcm.evsMetric.houseCodeDetailArgs = {
		id: {type: Number}	
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
        , managerPhone: {type: String, required: false, defaultValue: ""}
        , managerFax: {type: String, required: false, defaultValue: ""}
        , managerCellPhone: {type: String, required: false, defaultValue: ""}
        , managerPager: {type: String, required: false, defaultValue: ""}
        , managerAssistantName: {type: String, required: false, defaultValue: ""}
        , managerAssistantPhone: {type: String, required: false, defaultValue: ""}
        , clientFirstName: {type: String, required: false, defaultValue: ""}
        , clientLastName: {type: String, required: false, defaultValue: ""}
		, clientTitle: {type: String, required: false, defaultValue: ""}
        , clientPhone: {type: String, required: false, defaultValue: ""}
        , clientFax: {type: String, required: false, defaultValue: ""}
        , clientAssistantName: {type: String, required: false, defaultValue: ""}
        , clientAssistantPhone: {type: String, required: false, defaultValue: ""}
	};

    fin.hcm.evsMetric.fiscalYearArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , title: {type: String, required: false}
    };

    fin.hcm.evsMetric.metricTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , subType: {type: String, required: false, defaultValue: ""}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , dataType: {type: String, required: false, defaultValue: ""}
		, regExpValidation: { type: String, required: false, defaultValue: ""}
		, validationMessage: { type: String, required: false, defaultValue: ""}
		, displayOrder: {type: Number, required: false, defaultValue: 0}
    };

    fin.hcm.evsMetric.taskManagementSystemArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
    };

    fin.hcm.evsMetric.administratorObjectiveArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
    };

    fin.hcm.evsMetric.typeArgs = {
        id: {type: Number}
        , title: {type: String}
    };

    fin.hcm.evsMetric.metricArgs = {
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
        , vacantPositions: {type: String, required: false, defaultValue: ""}
        , budgetedProductivity: {type: String, required: false, defaultValue: ""}
        , contractedProductivity: {type: String, required: false, defaultValue: ""}
        , supportedByNPC: {type: Number, required: false, defaultValue: 0}
        , thirdPartySatisfaction: {type: Number, required: false, defaultValue: 0}
        , employeeProductiveHoursPerWeekStandard: {type: String, required: false, defaultValue: ""}
        , taskManagementSystem: {type: Number, required: false, defaultValue: 0}
        , taskManagementSystemOther: {type: String, required: false, defaultValue: ""}
        , serviceLinePT: {type: String, required: false, defaultValue: ""}
        , serviceLineLaundry: {type: String, required: false, defaultValue: ""}
        , serviceLinePOM: {type: String, required: false, defaultValue: ""}
        , serviceLineCES: {type: String, required: false, defaultValue: ""}
        , uvManufacturer: {type: Number, required: false, defaultValue: 0}
        , hygiena: {type: Number, required: false, defaultValue: 0}
        , wanda: {type: Number, required: false, defaultValue: 0}
        , union: {type: Number, required: false, defaultValue: 0}
        , microFiber: {type: Number, required: false, defaultValue: 0}
        , mop: {type: Number, required: false, defaultValue: 0}
        , cartManufacturer: {type: Number, required: false, defaultValue: 0}
        , notes: {type: String, required: false, defaultValue: ""}
    };

    fin.hcm.evsMetric.numericDetailArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
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
        , staffManagementRatio: {type: Boolean, required: false, defaultValue: false}
    };

    fin.hcm.evsMetric.textDetailArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
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

    fin.hcm.evsMetric.laborControlArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
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

    fin.hcm.evsMetric.strategicInitiativeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , hospitalIntiative: {type: String, required: false, defaultValue: ""}
        , expectedOutcome: {type: String, required: false, defaultValue: ""}
        , departmentIntiative: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

    fin.hcm.evsMetric.qualityAssuranceArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
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

    fin.hcm.evsMetric.qualityPartnershipArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , quarter1: {type: String, required: false, defaultValue: ""}
        , quarter2: {type: String, required: false, defaultValue: ""}
        , quarter3: {type: String, required: false, defaultValue: ""}
        , quarter4: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

    fin.hcm.evsMetric.auditScoreArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , annual1: {type: String, required: false, defaultValue: ""}
        , annual2: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

    
    fin.hcm.evsMetric.adminObjectiveArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , quarter1: {type: fin.hcm.evsMetric.AdministratorObjective, required: false}
        , quarter2: {type: fin.hcm.evsMetric.AdministratorObjective, required: false}
        , quarter3: {type: fin.hcm.evsMetric.AdministratorObjective, required: false}
        , quarter4: {type: fin.hcm.evsMetric.AdministratorObjective, required: false}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

    fin.hcm.evsMetric.evsStatisticArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
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

    fin.hcm.evsMetric.managementStaffArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , evsMetricId: {type: Number, required: false, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.evsMetric.MetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
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
        , staffManagementRatio: {type: Boolean, required: false, defaultValue: false}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

}, 2);

ii.Class({
    Name: "fin.hcm.evsMetric.HirNode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.hirNodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.HouseCode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.houseCodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.hcm.evsMetric.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.evsMetric.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.hcm.evsMetric.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.TaskManagementSystem",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.taskManagementSystemArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.AdministratorObjective",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.administratorObjectiveArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.Type",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.typeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.MetricType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.metricTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.Metric",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.metricArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.NumericDetail",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.numericDetailArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.TextDetail",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.textDetailArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.LaborControl",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.laborControlArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.StrategicInitiative",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.strategicInitiativeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.QualityAssurance",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.qualityAssuranceArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.QualityPartnership",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.qualityPartnershipArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.AuditScore",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.auditScoreArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.AdminObjective",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.adminObjectiveArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.EVSStatistic",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.evsStatisticArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.evsMetric.ManagementStaff",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.evsMetric.managementStaffArgs);
            $.extend(this, args);
        }
    }
});
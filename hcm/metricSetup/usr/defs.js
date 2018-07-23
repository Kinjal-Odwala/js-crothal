ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { metricSetup: {} };
}, 1);

ii.init.register( function() {

    fin.hcm.metricSetup.fiscalYearArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , title: {type: String, required: false}
    };

    fin.hcm.metricSetup.ptMetricTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , subType: {type: String, required: false, defaultValue: ""}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , dataType: {type: String, required: false, defaultValue: ""}
        , displayOrder: {type: Number, required: false, defaultValue: 0}
    };

    fin.hcm.metricSetup.evsMetricTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , subType: {type: String, required: false, defaultValue: ""}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , dataType: {type: String, required: false, defaultValue: ""}
        , displayOrder: {type: Number, required: false, defaultValue: 0}
    };

    fin.hcm.metricSetup.ptStandardMetricArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , ptMetricType: {type: fin.hcm.metricSetup.PTMetricType, required: false}
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

    fin.hcm.metricSetup.ptNonTeleTrackingArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , ptMetricType: {type: fin.hcm.metricSetup.PTMetricType, required: false}
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

    fin.hcm.metricSetup.ptTeleTrackingArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , ptMetricType: {type: fin.hcm.metricSetup.PTMetricType, required: false}
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

    fin.hcm.metricSetup.evsStandardMetricArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.metricSetup.EVSMetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , rta30: {type: String, required: false, defaultValue: ""}
        , rtc60: {type: String, required: false, defaultValue: ""}
        , totalTurnTime: {type: String, required: false, defaultValue: ""}
        , vacancies: {type: String, required: false, defaultValue: ""}
        , squareFeetPerProductiveManHour: {type: String, required: false, defaultValue: ""}
        , costPerAPD: {type: String, required: false, defaultValue: ""}
        , productiveHoursWorkedPerAPD: {type: String, required: false, defaultValue: ""}
    };

    fin.hcm.metricSetup.evsNonTeleTrackingArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.metricSetup.EVSMetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , rta30: {type: String, required: false, defaultValue: ""}
        , rtc60: {type: String, required: false, defaultValue: ""}
        , totalTurnTime: {type: String, required: false, defaultValue: ""}
        , vacancies: {type: String, required: false, defaultValue: ""}
        , squareFeetPerProductiveManHour: {type: String, required: false, defaultValue: ""}
        , costPerAPD: {type: String, required: false, defaultValue: ""}
        , productiveHoursWorkedPerAPD: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

    fin.hcm.metricSetup.evsTeleTrackingArgs = {
        id: {type: Number}
        , yearId: {type: Number, defaultValue: 0}
        , evsMetricType: {type: fin.hcm.metricSetup.EVSMetricType, required: false}
        , evsMetricTypeTitle: {type: String, required: false, defaultValue: ""}
        , rta30: {type: String, required: false, defaultValue: ""}
        , rtc60: {type: String, required: false, defaultValue: ""}
        , totalTurnTime: {type: String, required: false, defaultValue: ""}
        , vacancies: {type: String, required: false, defaultValue: ""}
        , squareFeetPerProductiveManHour: {type: String, required: false, defaultValue: ""}
        , costPerAPD: {type: String, required: false, defaultValue: ""}
        , productiveHoursWorkedPerAPD: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

}, 2);

ii.Class({
    Name: "fin.hcm.metricSetup.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.PTMetricType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.ptMetricTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.EVSMetricType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.evsMetricTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.PTStandardMetric",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.ptStandardMetricArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.PTNonTeleTracking",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.ptNonTeleTrackingArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.PTTeleTracking",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.ptTeleTrackingArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.EVSStandardMetric",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.evsStandardMetricArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.EVSNonTeleTracking",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.evsNonTeleTrackingArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.metricSetup.EVSTeleTracking",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.metricSetup.evsTeleTrackingArgs);
            $.extend(this, args);
        }
    }
});
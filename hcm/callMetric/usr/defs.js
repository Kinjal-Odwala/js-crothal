ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { callMetric: {} };
}, 1);

ii.init.register( function() {

    fin.hcm.callMetric.hirNodeArgs = {
        id: {type: Number}
        , nodeParentId: {type: Number}
        , hirLevel: {type: Number, required: false, defaultValue: 0}
        , hierarchyId: {type: Number, required: false, defaultValue: 0}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , childNodeCount: {type: Number, required: false, defaultValue: 0}
        , active: {type: Boolean, required: false, defaultValue: true}
    };

    fin.hcm.callMetric.houseCodeArgs = {
        id: {type: Number}
        , appUnit: {type: Number}
        , number: {type: Number}
        , name: {type: String}
        , brief:{type: String, required: false, defaultValue: ""}
        , hirNode: {type: Number}
    };

    fin.hcm.callMetric.fiscalYearArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , title: {type: String, required: false}
    };

    fin.hcm.callMetric.callMetricTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , dataType: {type: String, required: false, defaultValue: ""}
        , displayOrder: {type: Number, required: false, defaultValue: 0}
    };

    fin.hcm.callMetric.callMetricNumericDetailArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , houseCodeId: {type: Number, defaultValue: 0}
        , yearId: {type: Number, defaultValue: 0}
        , callMetricType: {type: fin.hcm.callMetric.CallMetricType, required: false}
        , callMetricTypeTitle: {type: String, required: false, defaultValue: ""}
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


}, 2);

ii.Class({
    Name: "fin.hcm.callMetric.HirNode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.callMetric.hirNodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.callMetric.HouseCode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.callMetric.houseCodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.callMetric.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.callMetric.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.callMetric.CallMetricType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.callMetric.callMetricTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.hcm.callMetric.CallMetricNumericDetail",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.hcm.callMetric.callMetricNumericDetailArgs);
            $.extend(this, args);
        }
    }
});



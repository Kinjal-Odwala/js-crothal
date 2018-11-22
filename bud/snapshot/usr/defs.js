ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.bud = { snapshot: {} };

}, 1);

ii.init.register( function() {

    fin.bud.snapshot.hirNodeArgs = {
        id: {type: Number}
        , nodeParentId: {type: Number}
        , hirLevel: {type: Number, required: false, defaultValue: 0}
        , hierarchyId: {type: Number, required: false, defaultValue: 0}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , childNodeCount: {type: Number, required: false, defaultValue: 0}
        , active: {type: Boolean, required: false, defaultValue: true}
    };

    fin.bud.snapshot.houseCodeArgs = {
        id: {type: Number}
        , number: {type: Number}
        , name: {type: String}
        , appUnit: {type: Number, required: false}
        , brief: {type: String, required: false, defaultValue: ""}
        , hirNode: {type: Number, defaultValue: 0}
    };

    fin.bud.snapshot.houseCodeDetailArgs = {
        id: {type: Number}
        , costCenterShortName: {type: String, required: false, defaultValue: ""}
    };

    fin.bud.snapshot.divisionArgs = {
        id: {type: Number}
        , brief: {type: String}
        , title: {type: String}
    };

    fin.bud.snapshot.fiscalYearArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , title: {type: String, required: false}
    };

    fin.bud.snapshot.fiscalPeriodArgs = {
        id: {type: Number, required: false}
        , year: {type: String, required: false}
        , fscYeaTitle: {type: String, required: false}
        , title: {type: String, required: false}
        , startDate: {type: Date, required: false}
        , endDate: {type: Date, required: false}
    };

    fin.bud.snapshot.accountArgs = {
        id: {type: Number}
        , code: {type: String}
        , name: {type: String}
        , isNegative: {type: Boolean, required: false, defaultValue: false}
    };

    fin.bud.snapshot.snapshotArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , divisionId: {type: Number, required: false, defaultValue: 0}
        , periodId: {type: Number, required: false, defaultValue: 0}
        , description: {type: String, required: false, defaultValue: ""}
        , locked: {type: Boolean, required: false, defaultValue: false}
        , unlockRequested: {type: Boolean, required: false, defaultValue: false}
        , crtdBy: {type: String, required: false, defaultValue: ""}
        , crtdAt: {type: String, required: false, defaultValue: ""}
        , modBy: {type: String, required: false, defaultValue: ""}
        , modAt: {type: String, required: false, defaultValue: ""}
        , name: {type: String, required: false, defaultValue: ""}
        , allowCreate: {type: Boolean, required: false, defaultValue: false}
    };

    fin.bud.snapshot.snapshotItemArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , title: {type: String, required: false, defaultValue: ""}
        , period1: {type: Number, required: false, defaultValue: 0}
        , period2: {type: Number, required: false, defaultValue: 0}
        , period3: {type: Number, required: false, defaultValue: 0}
        , period4: {type: Number, required: false, defaultValue: 0}
        , period5: {type: Number, required: false, defaultValue: 0}
        , period6: {type: Number, required: false, defaultValue: 0}
        , period7: {type: Number, required: false, defaultValue: 0}
        , period8: {type: Number, required: false, defaultValue: 0}
        , period9: {type: Number, required: false, defaultValue: 0}
        , period10: {type: Number, required: false, defaultValue: 0}
        , period11: {type: Number, required: false, defaultValue: 0}
        , period12: {type: Number, required: false, defaultValue: 0}
        , total: {type: Number, required: false, defaultValue: 0}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

}, 2);

ii.Class({
    Name: "fin.bud.snapshot.HirNode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.hirNodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.HouseCode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.houseCodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.HouseCodeDetail",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.houseCodeDetailArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.Division",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.divisionArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.FiscalPeriod",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.fiscalPeriodArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.Account",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.accountArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.Snapshot",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.snapshotArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.bud.snapshot.SnapshotItem",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.bud.snapshot.snapshotItemArgs);
            $.extend(this, args);
        }
    }
});
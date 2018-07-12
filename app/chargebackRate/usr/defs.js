ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.app = { chargebackRate: {} };

}, 1);

ii.init.register( function() {

    fin.app.chargebackRate.houseCodeArgs = {
        id: {type: Number}
        , number: {type: Number}
        , name: {type: String}
        , appUnit: {type: Number, required: false}
        , brief: {type: String, required: false, defaultValue: ""}
        , hirNode: {type: Number, required: false, defaultValue: 0}
    };

    fin.app.chargebackRate.fiscalYearArgs = {
        id: {type: Number}
        , title: {type: String}
    };

    fin.app.chargebackRate.accountArgs = {
        id: {type: Number}
        , code: {type: String}
        , description: {type: String}
    };

    fin.app.chargebackRate.applicationArgs = {
        id: {type: Number}
        , title: {type: String}
    };

    fin.app.chargebackRate.chargebackRateArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , yearId: {type: Number, required: false, defaultValue: 0}
        , application: {type: fin.app.chargebackRate.Application, required: false}
        , applicationTitle: {type: String, required: false, defaultValue: ""}
        , periodCharge: {type: String, required: false, defaultValue: ""}
        , accountCharge: {type: fin.app.chargebackRate.Account, require: false, defaultValue: null}
        , chargeDescription: {type: String, required: false, defaultValue: ""}
        , houseCodeId: {type: Number, required: false, defaultValue: 0}
        , houseCode: {type: String, required: false, defaultValue: ""}
        , accountRevenue: {type: fin.app.chargebackRate.Account, required: false, defaultValue: null}
        , notes: {type: String, required: false, defaultValue: ""}
        , modified: {type: Boolean, required: false, defaultValue: false}
    };

}, 2);

ii.Class({
    Name: "fin.app.chargebackRate.HouseCode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.app.chargebackRate.houseCodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.app.chargebackRate.FiscalYear",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.app.chargebackRate.fiscalYearArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.app.chargebackRate.Account",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.app.chargebackRate.accountArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.app.chargebackRate.Application",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.app.chargebackRate.applicationArgs);
            $.extend(this, args);

        }
    }
});

ii.Class({
    Name: "fin.app.chargebackRate.ChargebackRate",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.app.chargebackRate.chargebackRateArgs);
            $.extend(this, args);
        }
    }
});
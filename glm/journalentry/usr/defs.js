ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

    fin.glm = { journalEntry: {} };
}, 1);

ii.init.register( function() {

    fin.glm.journalEntry.hirNodeArgs = {
        id: {type: Number}
        , nodeParentId: {type: Number}
        , hirLevel: {type: Number, required: false, defaultValue: 0}
        , hierarchyId: {type: Number, required: false, defaultValue: 0}
        , brief: {type: String, required: false, defaultValue: ""}
        , title: {type: String, required: false, defaultValue: ""}
        , childNodeCount: {type: Number, required: false, defaultValue: 0}
        , active: {type: Boolean, required: false, defaultValue: true}
    };

    fin.glm.journalEntry.houseCodeArgs = {
        id: {type: Number}
        , number: {type: Number}
        , name: {type: String}
        , appUnit: {type: Number}
        , brief: {type: String, required: false, defaultValue: ""}
        , hirNode: {type: Number}
    };

    fin.glm.journalEntry.accountArgs = {
        id: {type: Number}
        , code: {type: String}
        , name: {type: String}
    };

    fin.glm.journalEntry.statusTypeArgs = {
        id: {type: Number}
        , title: {type: String}
    };

    fin.glm.journalEntry.journalEntryArgs = {
        id: {type: Number}
        , houseCodeId: {type: Number, required: false, defaultValue: 0}
        , statusType: {type: Number, required: false, defaultValue: 0}
		, accountDebit: {type: fin.glm.journalEntry.Account, required: false}
        , accountCredit: {type: fin.glm.journalEntry.Account, required: false}
        , amount: {type: String, required: false, defaultValue: ""}
		, justification: {type: String, required: false, defaultValue: ""}
        , assignment: {type: String, required: false, defaultValue: ""}
    };

}, 2);

ii.Class({
    Name: "fin.glm.journalEntry.HirNode",
    Definition: {
        init: function (){
            var args = ii.args(arguments, fin.glm.journalEntry.hirNodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.glm.journalEntry.HouseCode",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.glm.journalEntry.houseCodeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.glm.journalEntry.Account",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.glm.journalEntry.accountArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.glm.journalEntry.StatusType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.glm.journalEntry.statusTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.glm.journalEntry.JournalEntry",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.glm.journalEntry.journalEntryArgs);
            $.extend(this, args);
        }
    }
});
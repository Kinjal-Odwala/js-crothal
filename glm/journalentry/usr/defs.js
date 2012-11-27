ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.glm = { journalEntry: {}};
	
}, 1);

ii.init.register( function(){
	
	fin.glm.journalEntry.journalEntryItemArgs = {
		id: {type: Number, required: false, defaultValue: 0},
		journalEntryId: {type: Number, required: false, defaultValue: 0},
		expenseDate: {type: String, required: false, defaultValue: ""},
		associatedRecurringFixedCost: {type: String, required: false, defaultValue: "false"},
		amount: {type: Number},
		accountId: {type: fin.glm.journalEntry.Account, required: false},
		transferTypeId: {type: Number, required: false, defaultValue: 0},
		transactionStatusTypeId: {type: Number, required: false, defaultValue: 0},
		transactionStatusTitle:{type: String, required: false, defaultValue: ""},
		active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.glm.journalEntry.accountArgs = {
		id: {type: Number},
		number: {type: Number},
		code: {type: Number},
		name: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.glm.journalEntry.JournalEntryItem",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.journalEntry.journalEntryItemArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.journalEntry.Account",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.journalEntry.accountArgs);
			$.extend(this, args);
			
			if(!this.account){
				this.account = [];
			}

		}
	}
});

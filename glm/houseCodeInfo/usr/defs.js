ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

    fin.glm = { houseCodeInfo: {}};  
	
}, 1);

ii.init.register( function(){

	fin.glm.houseCodeInfo.journalEntryArgs = {
		id: {type: Number},
		hcmHouseCodeId: {type: Number},
		houseCodeCredit: {type: Number},
		houseCodeCreditTitle: {type: String},
		houseCodeEmailCredit: {type: String, required: false, defaultValue: ""},
		houseCodePhoneCredit: {type: String, required: false, defaultValue: ""},
		houseCodeDebit: {type: Number},
		houseCodeDebitTitle: {type: String},
		houseCodeEmailDebit: {type: String, required: false, defaultValue: ""},
		houseCodePhoneDebit: {type: String, required: false, defaultValue: ""},
		journalDate: {type: String},
		fscPeriodId: {type: Number},
		fscYearId: {type: Number},
		week: {type: Number},
		amount: {type: String, required: false, defaultValue: ""},
		status: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.houseCodeInfo.journalEntrySiteArgs = {
	   id: {type: Number},
	   title: {type: String, required: false, defaultValue: ""},
	   addressLine1: {type: String, required: false, defaultValue: ""},
	   addressLine2: {type: String, required: false, defaultValue: ""},
	   city: {type: String, required: false, defaultValue: ""},
	   state: {type: String, required: false, defaultValue: ""},
	   postalCode: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.houseCodeInfo.stateArgs = {
		name: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.houseCodeInfo.houseCodeJobArgs = {
		id: {type: Number}
		, jobId: {type: Number}
		, jobTitle: {type: String}
		, jobDescription: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.glm.houseCodeInfo.JournalEntry",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.houseCodeInfo.journalEntryArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.houseCodeInfo.JournalEntrySite",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.houseCodeInfo.journalEntrySiteArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.houseCodeInfo.State",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.houseCodeInfo.stateArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.houseCodeInfo.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.glm.houseCodeInfo.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});



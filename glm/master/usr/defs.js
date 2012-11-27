ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){

	fin.glm = {master: {}};
}, 1);

ii.init.register( function(){
	
	fin.glm.master.hirNodeArgs = {
		id: {type: Number},
		nodeParentId: {type: Number},
		hirLevel: {type: Number, required: false, defaultValue: 0},
		hierarchyId: {type: Number, required: false, defaultValue: 0},
		brief: {type: String, required: false, defaultValue: ""},
		title: {type: String, required: false, defaultValue: ""},
		childNodeCount: {type: Number, required: false, defaultValue: 0},
		active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.glm.master.houseCodeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String},
		appUnit: {type: Number, required: false},
		brief: {type: String, required: false, defaultValue: ""},
		hirNode: {type: Number}
	};

	fin.glm.master.fiscalYearArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};

	fin.glm.master.journalEntryArgs = {
		id: {type: Number},
		hcmHouseCodeId: {type: Number},
		houseCodeCredit: {type: Number},
		houseCodeJobCredit: {type: Number, required: false, defaultValue: 0},
		houseCodeCreditTitle: {type: String, required: false, defaultValue: ""},
		houseCodeEmailCredit: {type: String, required: false, defaultValue: ""},
		houseCodePhoneCredit: {type: String, required: false, defaultValue: ""},
		houseCodeDebit: {type: Number},
		houseCodeJobDebit: {type: Number, required: false, defaultValue: 0},
		houseCodeDebitTitle: {type: String, required: false, defaultValue: ""},
		houseCodeEmailDebit: {type: String, required: false, defaultValue: ""},
		houseCodePhoneDebit: {type: String, required: false, defaultValue: ""},
		journalDate: {type: String},
		fscPeriodId: {type: Number},
		fscYearId: {type: Number},
		week: {type: Number},
		amount: {type: String, required: false, defaultValue: ""},
		status: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.master.journalEntrySiteArgs = {
	   id: {type: Number},
	   title: {type: String, required: false, defaultValue: ""},
	   addressLine1: {type: String, required: false, defaultValue: ""},
	   addressLine2: {type: String, required: false, defaultValue: ""},
	   city: {type: String, required: false, defaultValue: ""},
	   state: {type: String, required: false, defaultValue: ""},
	   postalCode: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.master.stateArgs = {
		name: {type: String, required: false, defaultValue: ""}
	};
	
	fin.glm.master.exportArgs = {
		id: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.glm.master.accountArgs = {
		id: {type: Number},
		number: {type: Number},
		code: {type: Number},
		name: {type: String}
	};
	
	fin.glm.master.houseCodeJobArgs = {
		id: {type: Number},
		jobNumber: {type: String},
		jobTitle: {type: String}
	};

}, 2);


ii.Class({
	Name: "fin.glm.master.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.glm.master.HouseCode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.houseCodeArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.FiscalYear",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.fiscalYearArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.JournalEntry",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.journalEntryArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.JournalEntrySite",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.journalEntrySiteArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.State",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.stateArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.Export",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.exportArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.glm.master.Account",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.glm.master.accountArgs);
			$.extend(this, args);
			
			if(!this.account){
				this.account = [];
			}

		}
	}
});

ii.Class({
	Name: "fin.glm.master.HouseCodeJob",
	Definition: {
		init: function () {
			var args = ii.args(arguments, fin.glm.master.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

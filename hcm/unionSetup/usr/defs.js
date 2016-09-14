ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { unionSetup: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.unionSetup.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.unionSetup.deductionFrequencyTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.unionSetup.deductionParameterArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.unionSetup.payTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.unionSetup.operatorTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.unionSetup.unionDeductionArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number}
		, deductionFrequencyId: {type: Number, required: false, defaultValue: ""}
		, deductionType: {type: Number, required: false, defaultValue: 0}
		, payType: {type: Number, required: false, defaultValue: 0}
		, payRate: {type: String, required: false, defaultValue: ""}
		, probationaryPeriod: {type: Number, required: false, defaultValue: ""}
		, minimumDeductionAmount: {type: String, required: false, defaultValue: ""}
		, maximumDeductionAmount: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, endDate: {type: String, required: false, defaultValue: ""}
		, formula: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.unionSetup.unionDeductionPayCodeArgs = {
		id: {type: Number}
		, unionDeductionId: {type: Number}
		, payCodeId: {type: Number, required: false, defaultValue: 0}
		, status: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.unionSetup.unionDeductionPayRateRangeArgs = {
		id: {type: Number}
		, unionDeductionId: {type: Number, required: false, defaultValue: 0}
		, startAmount: {type: String, required: false, defaultValue: ""}
		, endAmount: {type: String, required: false, defaultValue: ""}
		, payRate: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.unionSetup.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.DeductionFrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.deductionFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.DeductionParameter",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.deductionParameterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.PayType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.payTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.OperatorType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.operatorTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.UnionDeduction",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.unionDeductionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.UnionDeductionPayCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.unionDeductionPayCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.unionSetup.UnionDeductionPayRateRange",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.unionSetup.unionDeductionPayRateRangeArgs);
			$.extend(this, args);
		}
	}
});
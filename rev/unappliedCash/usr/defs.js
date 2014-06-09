ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.rev = { unappliedCash: {} };

}, 1);

ii.init.register( function() {

	fin.rev.unappliedCash.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.rev.unappliedCash.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.rev.unappliedCash.unappliedCashArgs = {
		id: {type: Number}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, customer: {type: String, required: false, defaultValue: ""}
		, documentNumber: {type: Number, required: false, defaultValue: ""}
		, receiptDate: {type: String, required: false, defaultValue: ""}
		, grossAmount: {type: String, required: false, defaultValue: ""}
		, openAmount: {type: String, required: false, defaultValue: ""}
		, receiptItems: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.rev.unappliedCash.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.unappliedCash.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.unappliedCash.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.unappliedCash.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.unappliedCash.UnappliedCash",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.unappliedCash.unappliedCashArgs);
			$.extend(this, args);
		}
	}
});
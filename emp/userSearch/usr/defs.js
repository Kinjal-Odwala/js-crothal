ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.emp = {};
}, 1);

ii.init.register( function() {

    fin.emp.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.emp.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.emp.userArgs = {
		id: {type: Number}
		, userId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, userName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.emp.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.emp.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.emp.userArgs);
			$.extend(this, args);
		}
	}
});
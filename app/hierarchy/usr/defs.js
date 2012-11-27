ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
	
    fin.app = { hierarchy: {} };
    
}, 1);

ii.init.register( function() { 

	fin.app.hierarchy.userArgs = {
		id: {type: Number}
		, roleCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.app.hierarchy.roleArgs = {
		id: {type: Number}
		, hirNodeCurrent: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.app.hierarchy.hirLevelArgs = {
		id: {type: Number}
		, hierarchyId: {type: Number}
		, levelParentId: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.app.hierarchy.hirNodeArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, nodeParentId: {type: Number}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, levelBrief: {type: String, required: false, defaultValue: ""}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, status: {type: Number, required: false, defaultValue: 0}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};	

}, 2);

ii.Class({
	Name: "fin.app.hierarchy.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.hierarchy.userArgs);
			$.extend(this, args);
			
			if (!this.appRoles) {
				this.appRoles = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.app.hierarchy.Role",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.hierarchy.roleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.hierarchy.HirLevel",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.hierarchy.hirLevelArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.hierarchy.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.hierarchy.hirNodeArgs);
			$.extend(this, args);
		}
	}
});
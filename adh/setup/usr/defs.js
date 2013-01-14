ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.adh = {};
	
}, 1);

ii.init.register( function() {
	
	fin.adh.moduleArgs = {
		id: {type: Number}
		, name: {type: String}
		, description: {type: String}
		, associateModule: {type: Boolean, required: false, defaultValue:false}
	};
	
	fin.adh.moduleColumnArgs = {
		id: {type: Number}
		, reportColumn: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, columnType: {type: Number}
		, columnTypeFilter: {type: Boolean}
		, columnTypeOperator: {type: Boolean}
		, sortOrder: {type: String, required: false, defaultValue: ""}
		, filter: {type: Boolean, required: false, defaultValue: true}
		, dependantColumns: {type: String, required: false, defaultValue: ""}
	};
	
	fin.adh.reportArgs = {
		id: {type: Number}
		, title: {type: String}
		, module: {type: String}	
		, moduleAssociate: {type: String, defaultValue: "0"}
		, active: {type: Boolean, required: false}
		, hirNode: {type: Number, required: false}
	};
	
	fin.adh.moduleAssociateArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, description: {type: String}		
	};
	
}, 2);

ii.Class({
	Name: "fin.adh.Module",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ModuleColumn",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleColumnArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.Report",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.reportArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.adh.ModuleAssociate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.adh.moduleAssociateArgs);
			$.extend(this, args);
		}
	}
});
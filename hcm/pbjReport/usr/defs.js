ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { pbjReport: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.pbjReport.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.pbjReport.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number, defaultValue: 0}
	};

	fin.hcm.pbjReport.fileLocationArgs = {
		id: {type: Number}
		, fileLocationId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, location: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.pbjReport.yearArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.pbjReport.quarterArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.pbjReport.fileNameArgs = {
		id: {type: Number}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, filePath: {type: String, required: false, defaultValue: ""}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.pbjReport.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.pbjReport.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.pbjReport.FileLocation",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.fileLocationArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.pbjReport.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.pbjReport.Quarter",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.quarterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.pbjReport.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.fileNameArgs);
			$.extend(this, args);
		}
	}
});
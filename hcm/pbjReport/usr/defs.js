ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { pbjReport: {} };

}, 1);

ii.init.register( function() {

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
		, fileName: {type: String, required: false, defaultValue: ""}
		, houseCode: {type: String, required: false, defaultValue: ""}
	};

}, 2);

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
ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { pbjReport: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.pbjReport.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.pbjReport.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.pbjReport.fileNameArgs);
			$.extend(this, args);
		}
	}
});
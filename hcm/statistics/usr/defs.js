ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.hcm = { statistics: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.statistics.siteTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.statistics.SiteType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.statistics.siteTypeArgs);
			$.extend(this, args);
		}
	}
});
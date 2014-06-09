ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.app = { localTaxCode: {} };

}, 1);

ii.init.register( function() {

	fin.app.localTaxCode.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.app.localTaxCode.ceridianCompanyArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.app.localTaxCode.localTaxCodeArgs = {
		id: {type: Number, defaultValue: 0}
		, payrollCompany: {type: Number, required: false, defaultValue: 0}
		, localTaxCode: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}		
	};

}, 2);

ii.Class({
	Name: "fin.app.localTaxCode.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.localTaxCode.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.localTaxCode.CeridianCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.localTaxCode.ceridianCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.app.localTaxCode.LocalTaxCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.app.localTaxCode.localTaxCodeArgs);
			$.extend(this, args);
		}
	}
});
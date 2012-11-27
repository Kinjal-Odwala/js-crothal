ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.pay = { processing: {}};
    
}, 1);


ii.init.register( function(){
	
    fin.pay.processing.hirNodeArgs = {
		id: {type: Number}
		, title: {type: String}
		, nodeParentId: {type: Number}
		, childNodeCount: {type: Number}
	};
	
    fin.pay.processing.ceridianCompanyArgs = {
		id: {type: Number}
		, number: {type: Number}
		, brief: {type: String}
	};
	
	fin.pay.processing.payPeriodEndDateArgs = {
		id: {type: Number}
		, startDate: {type: String}
		, endDate: {type: String}
	};
	
	fin.pay.processing.payrollProcessArgs = {
		id: {type: Number}
		, hirNode: {type: String, required: false, defaultValue: ""}
		, payPayrollCompanyId: {type: String, required: false, defaultValue: ""}
		, payPeriodStartDate: {type: String, required: false, defaultValue: ""}
		, payPeriodEndDate: {type: String, required: false, defaultValue: ""}
		, action: {type: String, required: false, defaultValue: ""} //Close/Open
	};
}, 2);

ii.Class({
	Name: "fin.pay.processing.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.processing.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processing.CeridianCompany",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.processing.ceridianCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processing.PayPeriodEndDate",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.processing.payPeriodEndDateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processing.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.processing.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processing.PayrollProcess",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pay.processing.payrollProcessArgs);
			$.extend(this, args);
		}
	}
});

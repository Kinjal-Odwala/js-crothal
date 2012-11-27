ii.Import("fin.cmn.usr.defs");

ii.init.register( function(){
    fin.hcm = { payroll: {}};

}, 1);

ii.init.register( function(){
	
	fin.hcm.payroll.payPayrollCompanyArgs = {
		id: {type: Number},
		title: {type: String},
		houseCodePayrollCompanyId: {type: String, required: false, defaultValue: "0"},
		salary: {type: Boolean, defaultValue: false},
		hourly: {type: Boolean, defaultValue: false}
	};
	
	fin.hcm.payroll.payrollProcessingLocationTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
	
	fin.hcm.payroll.houseCodeTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};	
	
	fin.hcm.payroll.ePayGroupTypeArgs = {
		id: {type: Number},
		number: {type: Number},
		name: {type: String}
	};
    
}, 2);

ii.Class({
	Name: "fin.hcm.payroll.PayPayrollCompany",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.payroll.payPayrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.payroll.PayrollProcessingLocationType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.payroll.payrollProcessingLocationTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.payroll.EPayGroupType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.payroll.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.payroll.HouseCodeType",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.hcm.payroll.houseCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

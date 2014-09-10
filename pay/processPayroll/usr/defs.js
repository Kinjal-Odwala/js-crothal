ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.pay = { processPayroll: {} };

}, 1);

ii.init.register( function() {

	fin.pay.processPayroll.personArgs = {
		id: {type: Number}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.processPayroll.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.pay.processPayroll.batchStatusArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.pay.processPayroll.ePayBatchArgs = {
		id: {type: Number}
		, batchId: {type: Number, required: false, defaultValue: 0}
		, batchRecordCount: {type: Number, required: false, defaultValue: 0}
		, batchTotalHours: {type: String, required: false, defaultValue: ""}
		, batchTotalAmount: {type: String, required: false, defaultValue: ""}
		, detailRecordCount: {type: Number, required: false, defaultValue: 0}
		, detailTotalHours: {type: String, required: false, defaultValue: ""}
		, detailTotalAmount: {type: String, required: false, defaultValue: ""}
		, cancelledErrorRecordCount: {type: Number, required: false, defaultValue: 0}
		, cancelledErrorTotalHours: {type: String, required: false, defaultValue: ""}
		, cancelledErrorTotalAmount: {type: String, required: false, defaultValue: ""}
		, weeklyPayrollRecordCount: {type: Number, required: false, defaultValue: 0}
		, weeklyPayrollTotalHours: {type: String, required: false, defaultValue: ""}
		, weeklyPayrollTotalAmount: {type: String, required: false, defaultValue: ""}
		, totalHours: {type: String, required: false, defaultValue: ""}
		, valid: {type: Boolean, required: false, defaultValue: true}
	};

	fin.pay.processPayroll.ePayBatchDetailArgs = {
		id: {type: Number}
		, batchId: {type: Number, required: false, defaultValue: 0}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, employeeName: {type: String, required: false, defaultValue: ""}
		, employeeError: {type: Boolean, required: false, defaultValue: false}
		, payCode: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, houseCodeError: {type: Boolean, required: false, defaultValue: false}
		, expenseDate: {type: String, required: false, defaultValue: ""}
		, hours: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, workOrderNumber: {type: String, required: false, defaultValue: ""}
		, workOrderNumberError: {type: Boolean, required: false, defaultValue: false}
		, cancelled: {type: Boolean, required: false, defaultValue: false}
	};

}, 2);

ii.Class({
	Name: "fin.pay.processPayroll.Person",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.processPayroll.personArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processPayroll.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.processPayroll.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processPayroll.BatchStatus",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.processPayroll.batchStatusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processPayroll.EPayBatch",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.processPayroll.ePayBatchArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.processPayroll.EPayBatchDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.processPayroll.ePayBatchDetailArgs);
			$.extend(this, args);
		}
	}
});
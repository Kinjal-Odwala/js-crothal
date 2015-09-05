ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.pay = { payCheck: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.pay.payCheck.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.pay.payCheck.houseCodeArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, number: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, appUnit: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.payCheck.filterTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pay.payCheck.statusArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pay.payCheck.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.pay.payCheck.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}		
	};
	
	fin.pay.payCheck.payCheckRequestArgs = {
		id: {type: Number}
		, statusType: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, checkRequestNumber: {type: String, required: false, defaultValue: ""}
		, requestedDate: {type: String, required: false, defaultValue: ""}
		, deliveryDate: {type: String, required: false, defaultValue: ""}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, employeeName: {type: String, required: false, defaultValue: ""}
		, reasonForRequest: {type: String, required: false, defaultValue: ""}
		, termRequest: {type: Boolean, required: false, defaultValue: true}
		, stateType: {type: String, required: false, defaultValue: ""}
		, terminationDate: {type: String, required: false, defaultValue: ""}
		, mealBreakCompliance: {type: Boolean, required: false, defaultValue: false}
		, currentPayCardUser: {type: Boolean, required: false, defaultValue: true}
		, instantIssueRequest: {type: Boolean, required: false, defaultValue: true}		
		, upsDeliveryToUnit: {type: Boolean, required: false, defaultValue: true}
		, saturdayDeliveryUnit: {type: Boolean, required: false, defaultValue: true}
		, deliveryHouseCodeId: {type: Number, required: false, defaultValue: 0}
		, deliveryHouseCodeTitle: {type: String, required: false, defaultValue: ""}
		, houseCodeAddress: {type: String, required: false, defaultValue: ""}
		, upsPackageAttentionTo: {type: String, required: false, defaultValue: ""}
		, upsDeliveryToHome: {type: Boolean, required: false, defaultValue: true}
		, saturdayDeliveryHome: {type: Boolean, required: false, defaultValue: true}
		, homeAddress: {type: String, required: false, defaultValue: ""}
		, stopPaymentProcessingFee: {type: Boolean, required: false, defaultValue: true}
		, deductionCodes: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, requestorName: {type: String, required: false, defaultValue: ""}
		, requestorEmail: {type: String, required: false, defaultValue: ""}
		, requestorPhone: {type: String, required: false, defaultValue: ""}
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, approvedDate: {type: String, required: false, defaultValue: ""}
		, completedDate: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.payCheck.payCodeDetailArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, payCode: {type: fin.pay.payCheck.PayCodeType, required: false}
		, hours: {type: Number, required: false, defaultValue: 0}
		, date: {type: String, required: false, defaultValue: ""}
		, earnings: {type: Number, required: false, defaultValue: 0}
		, alternateBaseRate: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.payCheck.payCheckRequestDocumentArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, fileName: {type: String, required: false, defaultValue: ""}
		, tempFileName: {type: String, required: false, defaultValue: ""}
	};

	fin.pay.payCheck.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

	fin.pay.payCheck.employeeSearchArgs = {
		id: {type: Number}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, firstName: {type: String}
		, lastName: {type: String, required: false, defaultValue: ""}
		, brief: {type: String, required: false, defaultValue: ""}		
		, houseCode: {type: String, required: false, defaultValue: ""}
		, employeeNumber: {type: String, required: false, defaultValue: ""}
		, ssn: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.payCheck.personArgs = {
		id: {type: Number}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
		, homePhone: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pay.payCheck.siteArgs = {
	  	id: {type: Number}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}		
		, county: {type: String, required: false, defaultValue: ""}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false}
	};

}, 2);

ii.Class({
	Name: "fin.pay.payCheck.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.FilterType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.filterTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.Status",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.statusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.PayCheckRequest",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.payCheckRequestArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.PayCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.payCodeDetailArgs);
			$.extend(this, args);
			
			if (!this.payCode) {
				this.payCode = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.PayCheckRequestDocument",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.payCheckRequestDocumentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.fileNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.EmployeeSearch",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.employeeSearchArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.Person",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.personArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pay.payCheck.Site",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pay.payCheck.siteArgs);
			$.extend(this, args);
		}
	}
});
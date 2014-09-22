ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = { poCapitalRequisition: {} };
}, 1);

ii.init.register( function() {

	fin.pur.poCapitalRequisition.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.pur.poCapitalRequisition.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.pur.poCapitalRequisition.houseCodeDetailArgs = {
		id: {type: Number}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.pur.poCapitalRequisition.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.pur.poCapitalRequisition.statusArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.poCapitalRequisition.stateTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.pur.poCapitalRequisition.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, name: {type: String}
	};
	
	fin.pur.poCapitalRequisition.glAccountArgs = {
		id: {type: Number}
		, code: {type: String}
		, name: {type: String}
	};
	
	fin.pur.poCapitalRequisition.personArgs = {
		id: {type: Number}
		, firstName: {type: String, required: false, defaultValue: ""}
		, lastName: {type: String, required: false, defaultValue: ""}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.poCapitalRequisition.poCapitalRequisitionArgs = {
		id: {type: Number}
		, statusType: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: Number}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}		
		, shipToAddress1: {type: String, required: false, defaultValue: ""}
		, shipToAddress2: {type: String, required: false, defaultValue: ""}
		, shipToCity: {type: String, required: false, defaultValue: ""}
		, shipToState: {type: Number, required: false, defaultValue: 0}
		, shipToZip: {type: String, required: false, defaultValue: ""}
		, shipToPhone: {type: String, required: false, defaultValue: ""}
		, shipToFax: {type: String, required: false, defaultValue: ""}		
		, requestorName: {type: String, required: false, defaultValue: ""}
		, requestorEmail: {type: String, required: false, defaultValue: ""}
		, requestedDate: {type: String, required: false, defaultValue: ""}
		, deliveryDate: {type: String, required: false, defaultValue: ""}
		, vendorTitle: {type: String, required: false, defaultValue: ""}
		, vendorAddressLine1: {type: String, required: false, defaultValue: ""}
		, vendorAddressLine2: {type: String, required: false, defaultValue: ""}
		, vendorCity: {type: String, required: false, defaultValue: ""}
		, vendorStateType: {type: Number, required: false, defaultValue: 0}
		, vendorZip: {type: String, required: false, defaultValue: ""}
		, vendorContactName: {type: String, required: false, defaultValue: ""}
		, vendorPhoneNumber: {type: String, required: false, defaultValue: ""}
		, vendorEmail: {type: String, required: false, defaultValue: ""}
		, reasonForRequest: {type: String, required: false, defaultValue: ""}
		, funding: {type: String, required: false, defaultValue: ""}
		, businessType: {type: String, required: false, defaultValue: ""}
		, budgeting: {type: String, required: false, defaultValue: ""}
		, chargeToPeriod: {type: String, required: false, defaultValue: ""}
		, valid: {type: Boolean, required: false, defaultValue: true}		
	};
	
	fin.pur.poCapitalRequisition.poCapitalRequisitionItemArgs = {
		id: {type: Number, defaultValue: 0}
		, poCapitalRequisitionId: {type: Number, defaultValue: 0}
		, account: {type: fin.pur.poCapitalRequisition.GLAccount, required: false}
		, itemSelect: {type: Boolean, required: false, defaultValue: true}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, manufactured: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.pur.poCapitalRequisition.itemArgs = {
		id: {type: Number, defaultValue: 0}
		, poCapitalRequisitionId: {type: Number, defaultValue: 0}
		, account: {type: fin.pur.poCapitalRequisition.GLAccount, required: false}
		, itemSelect: {type: Boolean, required: false, defaultValue: false}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, manufactured: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.pur.poCapitalRequisition.vendorArgs = {
		id: {type: Number, defaultValue: 0}
		, number: {type: Number}
		, name: {type: String}
		, vendorNumber: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, addressLine1: {type: String, required: false, defaultValue: ""}
		, addressLine2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zip: {type: String, required: false, defaultValue: ""}
		, contactName: {type: String, required: false, defaultValue: ""}
		, email: {type: String, required: false, defaultValue: ""}	
		, phoneNumber: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.poCapitalRequisition.catalogArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.poCapitalRequisition.poCapitalRequisitionDocumentArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, fileName: {type: String, required: false, defaultValue: ""}
		, tempFileName: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.poCapitalRequisition.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.pur.poCapitalRequisition.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Status",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.statusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.GLAccount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.glAccountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Person",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.personArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.POCapitalRequisition",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.poCapitalRequisitionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.POCapitalRequisitionItem",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.poCapitalRequisitionItemArgs);
			$.extend(this, args);
			
			if(!this.account) {
				this.account = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Item",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.itemArgs);
			$.extend(this, args);
			
			if(!this.account) {
				this.account = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Vendor",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.vendorArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.Catalog",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.catalogArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.POCapitalRequisitionDocument",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.poCapitalRequisitionDocumentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poCapitalRequisition.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poCapitalRequisition.fileNameArgs);
			$.extend(this, args);
		}
	}
});
ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.pur = { poRequisition: {} };
}, 1);

ii.init.register( function() {

	fin.pur.poRequisition.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};
	
	fin.pur.poRequisition.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.pur.poRequisition.houseCodeDetailArgs = {
		id: {type: Number}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.pur.poRequisition.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.pur.poRequisition.statusArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.poRequisition.searchTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.poRequisition.stateTypeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.pur.poRequisition.accountArgs = {
		id: {type: Number}
		, code: {type: String}
		, name: {type: String}
	};
	
	fin.pur.poRequisition.glAccountArgs = {
		id: {type: Number}
		, code: {type: String}
		, name: {type: String}
	};
	
	fin.pur.poRequisition.personArgs = {
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

	fin.pur.poRequisition.poRequisitionArgs = {
		id: {type: Number}
		, requisitionNumber: {type: Number, required: false, defaultValue: 0}
		, statusType: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: Number}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, houseCodeJob: {type: Number, required: false, defaultValue: 0}		
		, shipToAddress1: {type: String, required: false, defaultValue: ""}
		, shipToAddress2: {type: String, required: false, defaultValue: ""}
		, shipToCity: {type: String, required: false, defaultValue: ""}
		, shipToState: {type: Number, required: false, defaultValue: 0}
		, shipToZip: {type: String, required: false, defaultValue: ""}
		, shipToPhone: {type: String, required: false, defaultValue: ""}
		, shipToFax: {type: String, required: false, defaultValue: ""}		
		, requestorName: {type: String, required: false, defaultValue: ""}
        , requestorPhone: { type: String, required: false, defaultValue: ""}
		, requestorEmail: {type: String, required: false, defaultValue: ""}
		, requestedDate: {type: String, required: false, defaultValue: ""}
		, deliveryDate: {type: String, required: false, defaultValue: ""}
		, vendorTitle: {type: String, required: false, defaultValue: ""}
		, vendorNumber: {type: String, required: false, defaultValue: ""}
		, vendorAddressLine1: {type: String, required: false, defaultValue: ""}
		, vendorAddressLine2: {type: String, required: false, defaultValue: ""}
		, vendorCity: {type: String, required: false, defaultValue: ""}
		, vendorStateType: {type: Number, required: false, defaultValue: 0}
		, vendorZip: {type: String, required: false, defaultValue: ""}
		, vendorContactName: {type: String, required: false, defaultValue: ""}
		, vendorPhoneNumber: {type: String, required: false, defaultValue: ""}
		, vendorEmail: {type: String, required: false, defaultValue: ""}
		, reasonForRequest: {type: String, required: false, defaultValue: ""}
		, urgency: {type: String, required: false, defaultValue: ""}
		, urgencyDate: {type: String, required: false, defaultValue: ""}
		, chargeToPeriod: {type: String, required: false, defaultValue: ""}
		, template: {type: Boolean, required: false, defaultValue: false}
		, templateTitle: {type: String, required: false, defaultValue: ""}	
		, valid: {type: Boolean, required: false, defaultValue: true}
        , purchaseOrderNumber: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.pur.poRequisition.poRequisitionDetailArgs = {
		id: {type: Number, defaultValue: 0}
		, poRequisitionId: {type: Number, defaultValue: 0}
		, account: {type: fin.pur.poRequisition.GLAccount, required: false}
		, itemSelect: {type: Boolean, required: false, defaultValue: true}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, manufactured: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
		, extendedPrice: {type: String, required: false, defaultValue: ""}
	};
	
	fin.pur.poRequisition.purchaseOrderItemArgs = {
		id: {type: Number, defaultValue: 0}
		, poRequisitionId: {type: Number, defaultValue: 0}
		, account: {type: fin.pur.poRequisition.GLAccount, required: false}
		, itemSelect: {type: Boolean, required: false, defaultValue: false}
		, number: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, unit: {type: String, required: false, defaultValue: ""}
		, manufactured: {type: String, required: false, defaultValue: ""}
		, price: {type: String, required: false, defaultValue: ""}
		, quantity: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: false}
		, extendedPrice: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.poRequisition.itemArgs = {
	    id: { type: Number, defaultValue: 0 }
	    , number: { type: String }
	    , description: { type: String }
	    , uom: { type: String }
	    , account: { type: Number }
	    , price: { type: String }
	};
	
	fin.pur.poRequisition.vendorArgs = {
		id: {type: Number, defaultValue: 0}
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

	fin.pur.poRequisition.catalogArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.pur.poRequisition.poRequisitionDocumentArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, title: {type: String, required: false, defaultValue: ""}
		, fileName: {type: String, required: false, defaultValue: ""}
		, tempFileName: {type: String, required: false, defaultValue: ""}
	};

	fin.pur.poRequisition.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};

}, 2);

ii.Class({
	Name: "fin.pur.poRequisition.HirNode",
	Definition: {
		init: function (){
			var args = ii.args(arguments, fin.pur.poRequisition.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.Status",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.statusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.SearchType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.searchTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.Account",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.accountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.GLAccount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.glAccountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.Person",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.personArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.PORequisition",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.poRequisitionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.PORequisitionDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.poRequisitionDetailArgs);
			$.extend(this, args);
			
			if(!this.account) {
				this.account = [];
			}
		}
	}
});

ii.Class({
    Name: "fin.pur.poRequisition.PurchaseOrderItem",
	Definition: {
		init: function() {
		    var args = ii.args(arguments, fin.pur.poRequisition.purchaseOrderItemArgs);
			$.extend(this, args);
			
			if(!this.account) {
				this.account = [];
			}
		}
	}
});

ii.Class({
    Name: "fin.pur.poRequisition.Item",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.pur.poRequisition.itemArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.pur.poRequisition.Vendor",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.vendorArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.Catalog",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.catalogArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.PORequisitionDocument",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.poRequisitionDocumentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.pur.poRequisition.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.pur.poRequisition.fileNameArgs);
			$.extend(this, args);
		}
	}
});
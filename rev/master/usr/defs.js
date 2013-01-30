ii.Import( "fin.cmn.usr.defs" );

ii.init.register( function() {

	fin.rev = { master: {} };
}, 1);

ii.init.register( function() {
	
	fin.rev.master.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.rev.master.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.rev.master.houseCodeDetailArgs = {
		id: {type: Number}	
		, invoiceLogoTypeId: {type: Number, required: false, defaultValue: 0}
	};

	fin.rev.master.yearArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};
	
	fin.rev.master.invoiceArgs = {
		id: {type: Number}
		, houseCode: {type: Number, required: false, defaultValue: 0}
		, houseCodeBrief: {type: String, required: false, defaultValue: ""}
		, jobBrief: {type: String, required: false, defaultValue: ""}
		, invoiceByHouseCode: {type: Boolean, required: false, defaultValue: false}
		, invoiceNumber: {type: Number, required: false, defaultValue: 0}
		, invoiceDate: {type: String, required: false, defaultValue: ""}
		, dueDate: {type: String, required: false, defaultValue: ""}
		, periodStartDate: {type: String, required: false, defaultValue: ""}
		, periodEndDate: {type: String, required: false, defaultValue: ""}
		, amount: {type: String, required: false, defaultValue: ""}
		, collected: {type: String, required: false, defaultValue: ""}
		, credited: {type: String, required: false, defaultValue: ""}
		, statusType: {type: Number, required: false, defaultValue: 0}
		, billTo: {type: String, required: false, defaultValue: ""}
		, company: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, printed: {type: Boolean, required: false, defaultValue: false}
		, printedBy: {type: String, required: false, defaultValue: ""}
		, lastPrinted: {type: String, required: false, defaultValue: ""}
		, taxExempt: {type: Boolean, required: false, defaultValue: false}
		, taxNumber: {type: String, required: false, defaultValue: ""}
		, stateTax: {type: String, required: false, defaultValue: ""}
		, localTax: {type: String, required: false, defaultValue: ""}
		, poNumber: {type: String, required: false, defaultValue: ""}
		, invoiceLogoType: {type: Number, required: false, defaultValue: 0}
		, notes: {type: String, required: false, defaultValue: ""}
		, version: { type: Number, required: false, defaultValue: 0 }
		, creditMemoPrintable: { type: Boolean, required: false, defaultValue: false }
		, creditMemoLastPrinted: { type: String, required: false, defaultValue: "" }
		, creditMemoPrinted: { type: Boolean, required: false, defaultValue: false }
		, active: {type: Boolean, required: false, defaultValue: true}		
	};
	
	fin.rev.master.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.rev.master.weekPeriodYearArgs = {
		id: {type: Number}
		, periodStartDate: {type: String}
		, periodEndDate: {type: String}
	};
	
	fin.rev.master.taxExemptArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.rev.master.invoiceBillToArgs = {
		id: {type: Number}
		, billTo: {type: String, required: false, defaultValue: ""}
		, company: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, taxId: {type: String, required: false, defaultValue: "0"}
	};
	
	fin.rev.master.exportArgs = {
		id: {type: Number, required: false, defaultValue: 0}
	};
	
	fin.rev.master.siteArgs = {
	  	id: {type: Number}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}		
		, city: {type: String, required: false, defaultValue: ""}		
		, county: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false}
	};
	
	fin.rev.master.taxRateArgs = {
		id: {type: Number}
		, stateTaxRate: {type: String, required: false, defaultValue: ""}
		, localTaxRate: {type: String, required: false, defaultValue: ""}	
	};
	
	fin.rev.master.houseCodeJobArgs = {
		id: {type: Number}
		, jobNumber: {type: String}
		, jobTitle: {type: String}
	};
	
	fin.rev.master.invoiceLogoTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
}, 2);

ii.Class({
	Name: "fin.rev.master.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.Year",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.yearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.Invoice",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.invoiceArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.WeekPeriodYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.weekPeriodYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.TaxExempt",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.taxExemptArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.InvoiceBillTo",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.invoiceBillToArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.Export",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.exportArgs);
			$.extend(this, args);

		}
	}
});

ii.Class({
	Name: "fin.rev.master.Site",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.siteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.TaxRate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.taxRateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.houseCodeJobArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rev.master.InvoiceLogoType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rev.master.invoiceLogoTypeArgs);
			$.extend(this, args);
		}
	}
});
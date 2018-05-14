ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {
    fin.hcm = { job: {} };

}, 1);

ii.init.register( function() {

	fin.hcm.job.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.job.houseCodeArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, appUnit: {type: Number, required: false}
		, brief: {type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number, defaultValue: 0}
	};

	fin.hcm.job.countryTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.job.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.job.zipCodeTypeArgs = {
		id: {type: Number}
		, stateType: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, county: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.job.industryTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.job.paymentTermArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.job.jobTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.job.sendMethodTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};

	fin.hcm.job.bolsReportTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};

	fin.hcm.job.invoiceTemplateArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.hcm.job.jobArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, contactName: {type: String, required: false, defaultValue: ""}
		, contactPhone: {type: String, required: false, defaultValue: ""}
		, address1: {type: String, required: false, defaultValue: ""}
		, address2: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, county: {type: String, required: false, defaultValue: ""}
		, appStateTypeId: {type: Number, required: false, defaultValue: 0}
		, postalCode: {type: String, required: false, defaultValue: ""}
		, geoCode: {type: String, required: false, defaultValue: ""}
		, countryType: {type: Number, required: false, defaultValue: 0}
		, industryType: {type: Number, required: false, defaultValue: 0}
		, paymentTerm: {type: Number, required: false, defaultValue: 0}
		, jobType: {type: fin.hcm.job.JobType, required: false}
		, sendMethodType: {type: Number, required: false, defaultValue: 0}
		, invoiceTemplate: {type: Number, required: false, defaultValue: 0}
		, customerName: {type: String, required: false, defaultValue: ""}
		, customerPhone: {type: String, required: false, defaultValue: ""}
		, taxId: {type: String, required: false, defaultValue: "0"}
		, overrideSiteTax: {type: Boolean, required: false, defaultValue: false}
		, serviceContract: {type: String, required: false, defaultValue: ""}
		, generalLocationCode: {type: String, required: false, defaultValue: ""}
		, bolsReportType: {type: Number, required: false, defaultValue: 0}
		, cpiPercentage: {type: String, required: false, defaultValue: ""}
		, cpiAmount: {type: String, required: false, defaultValue: ""}
		, cpiDate: {type: String, required: false, defaultValue: ""}
		, cpiECIWaived: {type: Boolean, required: false, defaultValue: false}
        , active: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.job.houseCodeJobArgs = {
		id: {type: Number, defaultValue: 0}
		, jobId: {type: Number, required: false, defaultValue: 0}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, hirNode: {type: Number, required: false, defaultValue: 0}
		, houseCodeTitle: {type: String, required: false, defaultValue: ""}
		, sapCustomerNumber : {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: false}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};

	fin.hcm.job.cityNameArgs = {
		id: {type: Number}
		, city: {type: String, required: false, defaultValue: ""}
	};

	fin.hcm.job.unitArgs = {
		id: {type: Number}
		, name: {type: String}
		, hirNode: {type: Number, defaultValue: 0}
		, assigned: {type: Boolean, required: false, defaultValue: true}
	};

}, 2);

ii.Class({
	Name: "fin.hcm.job.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.houseCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.CountryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.countryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.ZipCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.zipCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.IndustryType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.industryTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.PaymentTerm",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.paymentTermArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.JobType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.jobTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.SendMethodType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.sendMethodTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.BOLSReportType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.bolsReportTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.InvoiceTemplate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.invoiceTemplateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.Job",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.jobArgs);
			$.extend(this, args);

			if (!this.jobType) {
				this.jobType = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.HouseCodeJob",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.houseCodeJobArgs);
			$.extend(this, args);

			if (!this.job) {
				this.job = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.CityName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.cityNameArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.job.Unit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.job.unitArgs);
			$.extend(this, args);
		}
	}
});
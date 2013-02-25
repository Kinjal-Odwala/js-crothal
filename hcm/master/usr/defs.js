ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.hcm = { master: {} };
}, 1);

ii.init.register( function() {
	
	fin.hcm.master.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.master.houseCodeArgs = {
		id: {type: Number}
		, appUnit: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, brief:{type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};
	
	fin.hcm.master.houseCodeDetailArgs = {
		id: {type: Number}
		, hirNode: {type: Number, defaultValue: 0}
		, appUnitId: {type: String}
		, appSiteId: {type: Number, required: false, defaultValue: 0}
		, jdeCompanyId: {type: String}
		, startDate: {type: String, required: false, defaultValue: ""}
		, serviceTypeId: {type: Number, required: false, defaultValue: 0}
		, serviceLineId: {type: Number, required: false, defaultValue: 0}
		, enforceLaborControl: {type: Boolean, required: false, defaultValue: false}
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, managerPhone: {type: String, required: false, defaultValue: ""}
		, managerCellPhone: {type: String, required: false, defaultValue: ""}
		, managerFax: {type: String, required: false, defaultValue: ""}
		, managerPager: {type: String, required: false, defaultValue: ""}
		, managerAssistantName: {type: String, required: false, defaultValue: ""}
		, managerAssistantPhone: {type: String, required: false, defaultValue: ""}
		, clientFirstName: {type: String, required: false, defaultValue: ""}
		, clientLastName: {type: String, required: false, defaultValue: ""}
		, clientTitle: {type: String, required: false, defaultValue: ""}
		, clientPhone: {type: String, required: false, defaultValue: ""}
		, clientFax: {type: String, required: false, defaultValue: ""}
		, clientAssistantName: {type: String, required: false, defaultValue: ""}
		, clientAssistantPhone: {type: String, required: false, defaultValue: ""}
		, managedEmployees: {type: Number, required: false, defaultValue: 0}
		, bedsLicensed: {type: Number, required: false, defaultValue: 0}
		, patientDays: {type: Number, required: false, defaultValue: 0}
		, avgDailyCensus: {type: Number, required: false, defaultValue: 0}
		, annualDischarges: {type: Number, required: false, defaultValue: 0}
		, avgBedTurnaroundTime: {type: Number, required: false, defaultValue: 0}
		, netCleanableSqft: {type: Number, required: false, defaultValue: 0}
		, avgLaundryLbs: {type: Number, required: false, defaultValue: 0}
		, crothallEmployees: {type: Number, required: false, defaultValue: 0}
		, bedsActive: {type: Number, required: false, defaultValue: 0}
		, adjustedPatientDaysBudgeted: {type: Number, required: false, defaultValue: 0}
		, annualTransfers: {type: Number, required: false, defaultValue: 0}
		, annualTransports: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTerminatedHourlyEmployees: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeActiveHourlyEmployees: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalProductiveLaborHoursWorked: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalNonProductiveLaborHours: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalProductiveLaborDollarsPaid: {type: Number, required: false, defaultValue: 0}
		, mgmtFeeTotalNonProductiveLaborDollarsPaid: {type: Number, required: false, defaultValue: 0}
		, hospitalPaidJanitorialPaperPlasticSupplyCost: {type: Number, required: false, defaultValue: 0}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
		, remitToLocationId: {type: Number, required: false}
		, contractTypeId: {type: Number, required: false, defaultValue: 0}
		, termsOfContractTypeId: {type: Number,required: false, defaultValue: 0}
		, billingCycleFrequencyTypeId: {type: Number, required: false, defaultValue: 0}
		, bankCodeNumber: {type: String, required: false, defaultValue: ""}
		, bankAccountNumber: {type: String, required: false, defaultValue: ""}
		, bankName: {type: String, required: false, defaultValue: ""}
		, bankContact: {type: String, required: false, defaultValue: ""}
		, bankAddress1: {type: String, required: false, defaultValue: ""}
		, bankAddress2: {type: String, required: false, defaultValue: ""}
		, bankZip: {type: String, required: false, defaultValue: ""}
		, bankCity: {type: String, required: false, defaultValue: ""}
		, bankState: {type: Number, required: false, defaultValue: 0}
		, bankPhone: {type: String, required: false, defaultValue: ""}
		, bankFax: {type: String, required: false, defaultValue: ""}
		, bankEmail: {type: String, required: false, defaultValue: ""}
		, invoiceLogoTypeId: {type: Number, required: false, defaultValue: 0}
		, budgetTemplateId: {type: Number, required: false, defaultValue: 0}
		, budgetComputerRelatedCharge: {type: Boolean, required: false, defaultValue: false}
		, stateTaxPercent: {type: String, required: false, defaultValue: ""}
		, localTaxPercent: {type: String, required: false, defaultValue: ""}
		, financialEntityId: {type: Number, required: false, defaultValue: 0}
		, payrollProcessingLocationTypeId: {type: Number, required: false, defaultValue: 0}
		, timeAndAttendance: {type: Boolean, required: false, defaultValue: 0}		
		, defaultLunchBreak: {type: String, required: false, defaultValue: ""}
		, lunchBreakTrigger: {type: String, required: false, defaultValue: ""}
		, houseCodeTypeId: {type: String, required: false, defaultValue: ""}
		, roundingTimePeriod: {type: String, required: false, defaultValue: ""}
		, ePaySite: {type: Boolean, required: false, defaultValue: false}
		, ePayGroupType: {type: Number, required: false, defaultValue: 0}
		, ePayTask: {type: Number, required: false, defaultValue: 0}		
	};
}, 2);

ii.Class({
	Name: "fin.hcm.master.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.master.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.master.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.master.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.master.HouseCodeDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.master.houseCodeDetailArgs);
			$.extend(this, args);
		}
	}
});
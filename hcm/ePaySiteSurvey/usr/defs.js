ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

	fin.hcm = { ePaySiteSurvey: {} };
}, 1);

ii.init.register( function() {
	
	fin.hcm.ePaySiteSurvey.hirNodeArgs = {
		id: {type: Number}
		, nodeParentId: {type: Number}
		, hirLevel: {type: Number, required: false, defaultValue: 0}
		, hierarchyId: {type: Number, required: false, defaultValue: 0}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
		, childNodeCount: {type: Number, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: true}
	};

	fin.hcm.ePaySiteSurvey.houseCodeArgs = {
		id: {type: Number}
		, appUnit: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, brief:{type: String, required: false, defaultValue: ""}
		, hirNode: {type: Number}
	};

	fin.hcm.ePaySiteSurvey.timeZoneArgs = {
		id: {type: Number}
		, name: {type: String}
		, daylightSavingTime: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.frequencyTypeArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.weekDayArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.ePayGroupTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.reportingFrequencyTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.preferredConnectionMethodArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.taskSelectionMethodArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.deviceStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.assetTransferStatusTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.deviceTypeArgs = {
		id: {type: Number}
		, name: {type: String}
		, lan: {type: Boolean, required: false, defaultValue: false}
		, wifi: {type: Boolean, required: false, defaultValue: false}
		, dialup: {type: Boolean, required: false, defaultValue: false}
		, cellular: {type: Boolean, required: false, defaultValue: false}
		, touchscreen: {type: Boolean, required: false, defaultValue: false}
		, swipeCard: {type: Boolean, required: false, defaultValue: false}
		, trainingVideos: {type: Boolean, required: false, defaultValue: false}
		, active: {type: Boolean, required: false, defaultValue: true}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.clockAssetArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number, required: false, defaultValue: 0}
		, houseCode: {type: String, required: false, defaultValue: ""}
		, deviceType: {type: fin.hcm.ePaySiteSurvey.DeviceType, required: false}
		, deviceStatusType: {type: fin.hcm.ePaySiteSurvey.DeviceStatusType, required: false}
		, assetTransferStatusType: {type: fin.hcm.ePaySiteSurvey.AssetTransferStatusType, required: false}
		, serialNumber: {type: String, required: false, defaultValue: ""}
		, groupNumber: {type: String, required: false, defaultValue: ""}
		, groupName: {type: String, required: false, defaultValue: ""}
		, upsTrackingNumber: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.siteDetailArgs = {
		id: {type: Number}
		, houseCodeId: {type: Number}
		, address1: {type: String, required: false, defaultValue: ""}
		, city: {type: String, required: false, defaultValue: ""}
		, state: {type: Number, required: false, defaultValue: 0}
		, zipCode: {type: String, required: false, defaultValue: ""}
		, timeZone: {type: String, required: false, defaultValue: ""}
		, dayLightSavings: {type: Boolean, required: false, defaultValue: false}
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerPhone: {type: String, required: false, defaultValue: ""}
		, managerCellPhone: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, managerAlternateEmail: {type: String, required: false, defaultValue: ""}
		, alternateContactName: {type: String, required: false, defaultValue: ""}
		, alternateContactPhone: {type: String, required: false, defaultValue: ""}
		, alternateContactCellPhone: {type: String, required: false, defaultValue: ""}
		, alternateContactEmail: {type: String, required: false, defaultValue: ""}
		, alternateContactAlternateEmail: {type: String, required: false, defaultValue: ""}
		, regionalManagerName: {type: String, required: false, defaultValue: ""}
		, hourlyEmployees: {type: Number, required: false, defaultValue: 0}
		, maximumEmployeesAtShiftChange: {type: Number, required: false, defaultValue: 0}
		, union: {type: Boolean, required: false, defaultValue: false}
		, payFrequencyType: {type: Number, required: false, defaultValue: 0}		
		, buildingsAtFacility: {type: Number, required: false, defaultValue: 0}
		, currentRoundingScheme: {type: Number, required: false, defaultValue: 0}
		, currentOvertimePolicy: {type: String, required: false, defaultValue: ""}
		, kronos: {type: Boolean, required: false, defaultValue: false}
		, groupsOfEmployeesWithDifferentPayRules: {type: Boolean, required: false, defaultValue: false}
		, shiftDifferentialsComments: {type: String, required: false, defaultValue: ""}
		, phonesAvailable: {type: Boolean, required: false, defaultValue: false}
		, tollFree: {type: Boolean, required: false, defaultValue: false}
		, comments: {type: String, required: false, defaultValue: ""}
		, ePaySite: {type: Boolean, required: false, defaultValue: false}
		, ePayGroupType: {type: Number, required: false, defaultValue: 0}
		, reportingFrequencyType: {type: Number, required: false, defaultValue: 0}
		, firstDayOfReportingPeriod: {type: String, required: false, defaultValue: ""}
		, firstDayOfWeek: {type: String, required: false, defaultValue: ""}
		, preferredConnectionMethod: {type: Number, required: false, defaultValue: 0}
		, dailyRebootTime: {type: String, required: false, defaultValue: ""}
		, useWorkOrders: {type: Boolean, required: false, defaultValue: false}
		, taskSelectionMethod: {type: Number, required: false, defaultValue: 0}
		, accidentFreeQuestions: {type: Boolean, required: false, defaultValue: false}
		, enableLunchLogic: {type: Boolean, required: false, defaultValue: false}
		, fixPunchesOnClock: {type: Boolean, required: false, defaultValue: false}
		, businessAnalyst: {type: String, required: false, defaultValue: ""}
		, reviewDate: {type: String, required: false, defaultValue: ""}
		, poNumber: {type: String, required: false, defaultValue: ""}
		, siteGroup: {type: Boolean, required: false, defaultValue: false}
		, siteGroupID: {type: String, required: false, defaultValue: ""}
		, siteGroupName: {type: String, required: false, defaultValue: ""}
		, goLiveDate: {type: String, required: false, defaultValue: ""}
		, confirmSiteIsLive: {type: Boolean, required: false, defaultValue: false}
		, exported: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.ePaySiteSurveyPayCodeArgs = {
		id: {type: Number}
		, ePaySiteSurvey: {type: Number}
		, payCode: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.ePaySiteSurveyClockAssetArgs = {
		id: {type: Number}
		, ePaySiteSurvey: {type: Number}
		, clockAsset: {type: Number}
		, deviceType: {type: fin.hcm.ePaySiteSurvey.DeviceType, required: false}
		, serialNumber: {type: String, required: false, defaultValue: ""}
		, trackingNumber: {type: String, required: false, defaultValue: ""}
		, active: {type: Boolean, required: false, defaultValue: true}
		, assigned: {type: Boolean, required: false, defaultValue: false}
		, modified: {type: Boolean, required: false, defaultValue: false}
	};
	
	fin.hcm.ePaySiteSurvey.fileNameArgs = {
		id: {type: Number}
		, fileName: {type: String, required: false, defaultValue: ""}
	};
		
}, 2);

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.HouseCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.houseCodeArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.TimeZone",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.timeZoneArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.FrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.frequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.EPayGroupType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.ePayGroupTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.WeekDay",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.weekDayArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.ReportingFrequencyType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.reportingFrequencyTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.PreferredConnectionMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.preferredConnectionMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.TaskSelectionMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.taskSelectionMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.DeviceStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.deviceStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.AssetTransferStatusType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.assetTransferStatusTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.DeviceType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.deviceTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.ClockAsset",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.clockAssetArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.SiteDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.siteDetailArgs);
			$.extend(this, args);			
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.EPaySiteSurveyPayCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.ePaySiteSurveyPayCodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.EPaySiteSurveyClockAsset",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.ePaySiteSurveyClockAssetArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.hcm.ePaySiteSurvey.FileName",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.fileNameArgs);
			$.extend(this, args);
		}
	}
});
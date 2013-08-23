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
	
	fin.hcm.ePaySiteSurvey.siteDetailArgs = {
		id: {type: Number}
		, shippingAddress1: {type: String, required: false, defaultValue: ""}
		, shippingAddress2: {type: String, required: false, defaultValue: ""}		
		, shippingCity: {type: String, required: false, defaultValue: ""}
		, shippingState: {type: Number, required: false, defaultValue: 0}
		, shippingZip: {type: String, required: false, defaultValue: ""}
		, managerName: {type: String, required: false, defaultValue: ""}
		, managerPhone: {type: String, required: false, defaultValue: ""}
		, managerCellPhone: {type: String, required: false, defaultValue: ""}
		, managerEmail: {type: String, required: false, defaultValue: ""}
		, managerAlternateEmail: {type: String, required: false, defaultValue: ""}
		, timeAndAttendance: {type: Boolean, required: false, defaultValue: 0}
		, defaultLunchBreak: {type: String, required: false, defaultValue: ""}
		, lunchBreakTrigger: {type: String, required: false, defaultValue: ""}
		, houseCodeTypeId: {type: String, required: false, defaultValue: ""}
		, roundingTimePeriod: {type: String, required: false, defaultValue: ""}		
	};

	fin.hcm.ePaySiteSurvey.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.hcm.ePaySiteSurvey.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}
		, description: {type: String, required: false, defaultValue: ""}
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
		, lan: {type: Boolean, required: false, defaultValue: 0}
		, wifi: {type: Boolean, required: false, defaultValue: 0}
		, dialup: {type: Boolean, required: false, defaultValue: 0}
		, cellular: {type: Boolean, required: false, defaultValue: 0}
		, touchscreen: {type: Boolean, required: false, defaultValue: 0}
		, swipeCard: {type: Boolean, required: false, defaultValue: 0}
		, trainingVideos: {type: Boolean, required: false, defaultValue: 0}
		, active: {type: Boolean, required: false, defaultValue: 0}
	};
	
	fin.hcm.ePaySiteSurvey.clockAssetArgs = {
		id: {type: Number}
		, name: {type: String}
		, houseCode: {type: Number}
		, deviceType: {type: fin.hcm.ePaySiteSurvey.DeviceType, required: false}
		, deviceStatusType: {type: fin.hcm.ePaySiteSurvey.DeviceStatusType, required: false}
		, assetTransferStatusType: {type: Number}
		, serialNumber: {type: String, required: false, defaultValue: ""}
		, groupNumber: {type: String, required: false, defaultValue: ""}
		, groupName: {type: String, required: false, defaultValue: ""}
		, upsTrackingNumber: {type: String, required: false, defaultValue: ""}
		, modified: {type: Boolean, required: false, defaultValue: 0}
	};
	
	fin.hcm.ePaySiteSurvey.ePaySiteSurveyPayCodeArgs = {
		id: {type: Number}
		, ePaySiteSurvey: {type: Number}
		, payCode: {type: Number}
		, description: {type: String, required: false, defaultValue: ""}
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
	Name: "fin.hcm.ePaySiteSurvey.SiteDetail",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.siteDetailArgs);
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
	Name: "fin.hcm.ePaySiteSurvey.EPaySiteSurveyPayCode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.hcm.ePaySiteSurvey.ePaySiteSurveyPayCodeArgs);
			$.extend(this, args);
		}
	}
});
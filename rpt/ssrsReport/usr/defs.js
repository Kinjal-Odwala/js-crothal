ii.Import("fin.cmn.usr.defs");

ii.init.register( function() {

    fin.rpt = { ssrs: {} };
	
}, 1);

ii.init.register( function() {
	
	fin.rpt.ssrs.userArgs = {
		id: {type: Number}
		, roleCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.rpt.ssrs.roleArgs = {
		id: {type: Number}
		, hirNodeCurrent: {type: Number, required: false, defaultValue: 0}
	};

	fin.rpt.ssrs.appUnitArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, brief: {type: String}
		, title: {type: String, required: false, defaultValue: ""}
		, description: {type: String}
		, active: {type: Boolean}
	};

	fin.rpt.ssrs.hirNodeArgs = {
		id: {type: Number}
		, number: {type: Number, required:false, defaultValue: 0}
		, name: {type: String, required:false, defaultValue: ""}
		, brief: {type: String, required:false, defaultValue: ""}
		, title: {type: String, required:false, defaultValue: ""}
		, hirLevel: {type: Number, required:false, defaultValue: 0}
		, nodeParentId: {type: Number, required:false, defaultValue: 0}
		, childNodeCount: {type: Number, required:false, defaultValue: 0}
		, fullPath: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.fiscalYearArgs = {
		id: {type: Number, required:false, defaultValue: 0}
		, number: {type: Number, required:false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.fiscalPeriodArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
		, title: {type: String}
		, fscYeaTitle: {type: String}
	};

	fin.rpt.ssrs.fiscalWeekArgs = {
		id: {type: Number}
		, number: {type: Number}
		, name: {type: String}
	};

	fin.rpt.ssrs.reportArgs = {
		id: {type: Number}
		, hirNode: {type: Number}
		, title: {type: String}
		, name: {type: String, required: false, defaultValue: ""}
		, parameterAvailable: {type: Boolean, required: false, defaultValue: false}
		, subscriptionAvailable: {type: Boolean, required: false, defaultValue: false}
		, reportURL: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.reportParameterArgs = {
		id: {type: Number}
		, title: {type: String, required: false, defaultValue: ""}
		, name: {type: String, required: false, defaultValue: ""}
		, dataType: {type: String, required: false, defaultValue: ""}
		, controlType: {type: String, required: false, defaultValue: ""}
		, defaultValue: {type: String, required: false, defaultValue: ""}
		, referenceTableName: {type: String, required: false, defaultValue: ""}
		, mandatory: {type: Boolean, required: false, defaultValue: false}
        , width: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.subscriptionArgs = {
		id: {type: String}
		, reportName: {type: String, required: false, defaultValue: ""}
		, scheduleType: {type: String, required: false, defaultValue: ""}
		, subscriptionId: {type: String, required: false, defaultValue: ""}
		, description: {type: String, required: false, defaultValue: ""}
		, to: {type: String, required: false, defaultValue: ""}
		, cc: {type: String, required: false, defaultValue: ""}
		, subject: {type: String, required: false, defaultValue: ""}
		, includeReport: {type: Boolean, required: false, defaultValue: false}
		, includeLink: {type: Boolean, required: false, defaultValue: false}
		, reportFormat: {type: String, required: false, defaultValue: ""}
		, priority: {type: String, required: false, defaultValue: ""}
		, comment: {type: String, required: false, defaultValue: ""}
		, parameters: {type: String, required: false, defaultValue: ""}
		, hours: {type: String, required: false, defaultValue: ""}
		, minutes: {type: String, required: false, defaultValue: ""}
		, startDate: {type: String, required: false, defaultValue: ""}
		, startTime: {type: String, required: false, defaultValue: ""}
		, stopSchedule: {type: Boolean, required: false, defaultValue: false}
		, endDate: {type: String, required: false, defaultValue: ""}
		, days: {type: String, required: false, defaultValue: ""}
		, weekOfMonth: {type: String, required: false, defaultValue: ""}
		, numberOfDays: {type: Number, required:false, defaultValue: 0}
		, numberOfWeeks: {type: Number, required:false, defaultValue: 0}
		, sunday: {type: Boolean, required: false, defaultValue: false}
		, monday: {type: Boolean, required: false, defaultValue: false}
		, tuesday: {type: Boolean, required: false, defaultValue: false}
		, wednesday: {type: Boolean, required: false, defaultValue: false}
		, thursday: {type: Boolean, required: false, defaultValue: false}
		, friday: {type: Boolean, required: false, defaultValue: false}
		, saturday: {type: Boolean, required: false, defaultValue: false}
		, january: {type: Boolean, required: false, defaultValue: false}
		, february: {type: Boolean, required: false, defaultValue: false}
		, march: {type: Boolean, required: false, defaultValue: false}
		, april: {type: Boolean, required: false, defaultValue: false}
		, may: {type: Boolean, required: false, defaultValue: false}
		, june: {type: Boolean, required: false, defaultValue: false}
		, july: {type: Boolean, required: false, defaultValue: false}
		, august: {type: Boolean, required: false, defaultValue: false}
		, september: {type: Boolean, required: false, defaultValue: false}
		, october: {type: Boolean, required: false, defaultValue: false}
		, november: {type: Boolean, required: false, defaultValue: false}
		, december: {type: Boolean, required: false, defaultValue: false}
	};	

	fin.rpt.ssrs.weekArgs = {
		id: {type: Number}
		, brief: {type: String, required: false, defaultValue: ""}
		, title: {type: String, required: false, defaultValue: ""}
	};

	fin.rpt.ssrs.hourArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.minuteArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.deliveredByArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.reportFormatArgs = {
		id: {type: Number}
		, title: {type: String}
	};

	fin.rpt.ssrs.priorityArgs = {
		id: {type: Number}
		, title: {type: String}
	};
	
	fin.rpt.ssrs.genericTypeArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.weekPeriodArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.workShiftArgs = {
        id: {type: Number},
        number: {type: Number},
        name: {type: String},
        startTime: {type: String, required: false, defaultValue: ""},
        endTime: {type: String, required: false, defaultValue: ""}
    };
	
	fin.rpt.ssrs.payCodeTypeArgs = {
		id: {type: Number}
		, brief: {type: String}
		, name: {type: String}		
	};
	
	fin.rpt.ssrs.payrollCompanyArgs = {
		id: {type: Number, defaultValue: 0}
		, brief: {type: String}
		, name: {type: String}
	};
	
	fin.rpt.ssrs.statusTypeArgs = {
        id: {type: Number},
        number: {type: Number},
        name: {type: String}
    };
    
    fin.rpt.ssrs.accountArgs = {
        id: {type: Number, defaultValue: 0},
        code: {type: String},
        description: {type: String},
        name: {type: String, required: false, defaultValue: ""}
    };
    
    fin.rpt.ssrs.batchArgs = {
        id: {type: Number}
        , batchId: {type: Number}
        , title: {type: String, required: false, defaultValue: ""}
    };
    
    fin.rpt.ssrs.rptStatusTypeArgs = {
        id: {type: Number, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    }
	
	fin.rpt.ssrs.woStatusArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.payPeriodEndingDateArgs = {
		id: {type: Number, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.levelArgs = {
		id: {type: Number, required:false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.excludeOverheadAccountArgs = {
		id: {type: Number, required:false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.payrollReportTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.reportTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.summeryReportTypeArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.budgetTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
	
	fin.rpt.ssrs.crothallEmployeeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
	
	fin.rpt.ssrs.currentWeekArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
	
	fin.rpt.ssrs.commentArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
	
	fin.rpt.ssrs.unionArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.entryMethodArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.hour40ExceptionArgs = {
		id: {type: Number, required: false, defaultValue: 0}
		, name: {type: String, required: false, defaultValue: ""}
		, parameter: {type: String, required: false, defaultValue: ""}		
	};
	
	fin.rpt.ssrs.houseCodeStatusArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
    
    fin.rpt.ssrs.groupLevelArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}        
    };
	
	fin.rpt.ssrs.stateTypeArgs = {
		id: {type: Number}
		, name: {type: String}
	};
	
	fin.rpt.ssrs.serviceTypeArgs = {
        id: {type: Number}
        , name: {type: String}
    };
    
    fin.rpt.ssrs.serviceLineArgs = {
        id: {type: Number}
        , name: {type: String}
        , financialEntity: {type: Boolean, required: false, defaultValue: false}
    };
    
    fin.rpt.ssrs.financialEntityArgs = {
        id: {type: Number}
        , name: {type: String}
    };
    
    fin.rpt.ssrs.contractTypeArgs = {
        id: {type: Number}
        , name: {type: String}
    };
	
	fin.rpt.ssrs.countHourArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}
    };
	
	fin.rpt.ssrs.exceptionArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}
    };
	
	fin.rpt.ssrs.capExpenditureTypeArgs = {
        id: {type: Number, required: false, defaultValue: 0}
        , name: {type: String, required: false, defaultValue: ""}
        , parameter: {type: String, required: false, defaultValue: ""}
    };

	fin.rpt.ssrs.benefitStatusArgs = {
        id: {type: Number}
        , name: {type: String}
        , parameter: {type: String}
    };

	fin.rpt.ssrs.measurementStatusArgs = {
        id: {type: Number}
        , name: {type: String}
        , parameter: {type: String}
    };

	fin.rpt.ssrs.benefitArgs = {
        id: {type: Number}
        , name: {type: String}
        , parameter: {type: String}
    };

	fin.rpt.ssrs.fullPartArgs = {
        id: {type: Number}
        , name: {type: String}
        , parameter: {type: String}
    };

	fin.rpt.ssrs.smartPSIDArgs = {
        id: {type: Number}
        , name: {type: String}
        , parameter: {type: String}
    };

}, 2);

ii.Class({
	Name: "fin.rpt.ssrs.User",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.userArgs);
			$.extend(this, args);
			
			if (!this.appRoles) {
				this.appRoles = [];
			}
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Role",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.roleArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.AppUnit",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.appUnitArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.HirNode",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.hirNodeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalYear",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalYearArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.FiscalWeek",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.fiscalWeekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Report",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ReportParameter",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportParameterArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Subscription",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.subscriptionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Week",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.weekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Hour",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.hourArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Minute",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.minuteArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.DeliveredBy",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.deliveredByArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ReportFormat",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportFormatArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Priority",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.priorityArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.GenericType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.genericTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.WeekPeriod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.weekPeriodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.rpt.ssrs.WorkShift",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.workShiftArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.rpt.ssrs.PayCodeType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.payCodeTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.PayrollCompany",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.payrollCompanyArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.rpt.ssrs.StatusType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.statusTypeArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.Account",
    Definition: {
        init: function (){
            var args = ii.args(arguments, fin.rpt.ssrs.accountArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.Batch",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.batchArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.RptStatusType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.rptStatusTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.rpt.ssrs.WOStatus",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.woStatusArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.PayPeriodEndingDate",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.payPeriodEndingDateArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Level",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.levelArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ExcludeOverheadAccount",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.excludeOverheadAccountArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.PayrollReportType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.payrollReportTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.ReportType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.reportTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.SummeryReportType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.summeryReportTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.BudgetType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.budgetTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.CrothallEmployee",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.crothallEmployeeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.CurrentWeek",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.currentWeekArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Comment",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.commentArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Union",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.unionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.EntryMethod",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.entryMethodArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
	Name: "fin.rpt.ssrs.Hour40Exception",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.hour40ExceptionArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.rpt.ssrs.HouseCodeStatus",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.houseCodeStatusArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.GroupLevel",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.groupLevelArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
	Name: "fin.rpt.ssrs.StateType",
	Definition: {
		init: function() {
			var args = ii.args(arguments, fin.rpt.ssrs.stateTypeArgs);
			$.extend(this, args);
		}
	}
});

ii.Class({
    Name: "fin.rpt.ssrs.ServiceType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.serviceTypeArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.ServiceLine",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.serviceLineArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.FinancialEntity",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.financialEntityArgs);
            $.extend(this, args);
        }
    }
});
 
ii.Class({
    Name: "fin.rpt.ssrs.ContractType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.contractTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.CountHour",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.countHourArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.Exception",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.exceptionArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.CapExpenditureType",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.capExpenditureTypeArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.BenefitStatus",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.benefitStatusArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.MeasurementStatus",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.measurementStatusArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.Benefit",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.benefitArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.FullPart",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.fullPartArgs);
            $.extend(this, args);
        }
    }
});

ii.Class({
    Name: "fin.rpt.ssrs.SmartPSID",
    Definition: {
        init: function() {
            var args = ii.args(arguments, fin.rpt.ssrs.smartPSIDArgs);
            $.extend(this, args);
        }
    }
});
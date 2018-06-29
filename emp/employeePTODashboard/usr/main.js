var pto = angular.module('pto', ['ui.bootstrap', 'ngRoute']);

pto.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({
        controller: 'employeePTOCtrl',
        templateUrl: 'dashboard.htm'
    });
}]);

var setStatus = function(status, message) {
	var me = this;

	me.$itemStatusImage = $("#itemStatusImage");
	me.$itemModifiedImage = $("#itemModifiedImage");
	me.$itemStatusText = $("#itemStatusText");

	if (message === "" || message === undefined) {
		if (status === "New")
			message = "New";
		else if (status === "Loading" || status === "Saving" || status === "Exporting" || status === "Importing" || status === "Validating" || status === "Uploading" || status === "Downloading" || status === "Generating")
			message = status + ", please wait...";
		else if (status === "Saved")
			message = "Data saved successfully.";
		else if (status === "Imported")
			message = "Data imported successfully.";
		else if (status === "Exported")
			message = "Data exported successfully.";
		else if (status === "Locked")
			message = "The current page is Readonly.";
		else if (status === "Error")
			message = "Error while updating the data.";
		else
			message = "Normal";
	}

	if (status === "Locked")
		me.$itemModifiedImage.addClass("Locked");
	else
		me.$itemModifiedImage.removeClass("Locked");

	if (status === "Edit")
		me.$itemModifiedImage.addClass("Modified");
	else
		me.$itemModifiedImage.removeClass("Modified");

	if (status === "Edit" || status === "Loaded" || status === "Saved" || status === "Imported" || status === "Exported")
	    status = "Normal";

	me.$itemStatusImage.attr("class", "itemStatusImage " + status);
	me.$itemStatusText.text(message);
};

if (!window.top.fin) {
    window.top.fin = { appUI: { houseCodeId: 415, glbFscYear: 4, glbFscPeriod: 45, glbWeek: 2 } };
}

var encode = function(value) {
    var returnValue = value.replace(/&/g, "&amp;");
    returnValue = returnValue.replace(/'/g, "&apos;");
    returnValue = returnValue.replace(/"/g, "&quot;");
    returnValue = returnValue.replace(/</g, "&lt;");
    returnValue = returnValue.replace(/>/g, "&gt;");

    return returnValue;
};

var deserializeXml = function(xml, nodeName, options) {
    options = options || {};

    var upperCaseItems = function(input) {
        var items = [];
        if (input && input.length) {
            $.each(input, function(index, item) {
                items.push(item.toUpperCase());
            });
        }
        return items;
    };

    var convertAttrName = function(name) {
        if (options.upperFirstLetter)
            return uppercaseFirstLetter(name);
        else
            return name;
    };

    var intItems = upperCaseItems(options.intItems);
    var boolItems = upperCaseItems(options.boolItems);
    var dateItems = upperCaseItems(options.dateItems);
    var jsonItems = upperCaseItems(options.jsonItems);
    var $xml = null;

    if (angular.isString(xml)) {
        xml = $.parseXML(xml);
    }

    $xml = $(xml);

    var $el = $xml.find(nodeName);
    var items = [];

    $el.each(function(index, element) {
        var obj = {};
        $.each(element.attributes, function(index, key) {
            var value = key.value;

            if (boolItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value === '1' || key.value === 'true';

            if (intItems.indexOf(key.name.toUpperCase()) >= 0)
                value = key.value === 0 ? null : parseInt(key.value);

            if (jsonItems.indexOf(key.name.toUpperCase()) >= 0) {
                if (!key.value)
                    value = {};
                else
                    value = angular.fromJson(key.value.replace(/###/gi, '"'));
            }

            if (dateItems.indexOf(key.name.toUpperCase()) >= 0) {
                value = !key.value || key.value.substr(0, 8) === '1/1/1900' ? null : key.value;
            }
            obj[convertAttrName(key.name)] = value;
        });

        if (Object.keys(obj).length > 0)
            items.push(obj);
    });
    return items;
};

var getCurrentHcmHouseCode = function() {
    return window.top.fin.appUI.houseCodeId;
};

pto.controller('employeePTOCtrl', ['$scope', 'EmpActions', '$filter', '$sce', '$modal', function ($scope, EmpActions, $filter, $sce, $modal) {

	$scope.authorizations = [];
	$scope.states = [];
    $scope.ptoYears = [];
	$scope.planAssignments = [];
    setStatus("Loading");
    $scope.loadingTitle = " Loading...";
    $scope.isPageLoading = function() {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    $scope.mainViewHeight = $(window).height() - 100;
    $scope.employeeGridHeight = $(window).height() - 535;
	$scope.employeeViewHeight = $(window).height() - 560;
	$scope.initialize = true;
	$scope.ptoYearId = 0;
	$scope.dashboard = {};
    $scope.dashboard.houseCodeId = 0;
    $scope.dashboard.houseCodeId = typeof getCurrentHcmHouseCode() === "undefined" ? null : getCurrentHcmHouseCode();
    $scope.previousTabSelected = "Unit Dashboard";
    $scope.currentTabSelected = "";
	$scope.orderByField = "firstName";
	$scope.reverseSort = false;
	$scope.selectedPlanAssignment = null;
	$scope.selectedEmployee = null;
	$scope.selectedPTOType = null;
		
    var getCurrentHouseCodeId = function(callback) {
        EmpActions.getCurrentHouseCodeId(function(response) {
            callback(response);
        });
    };

	var isAuthorized = function(path) {
        var authorized = false;

        for (var index = 0; index < $scope.authorizations.length; index++) {
            if ($scope.authorizations[index].path.indexOf(path) >= 0) {
                authorized = true;
                break;
            }
        }

        return authorized;
    };

	var authorizationsLoaded = function() {
        var authorizePath = "\\crothall\\chimes\\fin\\PTOSetup";
        $scope.showPTODashboard = isAuthorized(authorizePath + "\\PTODashboard");
    };

    if ($scope.dashboard.houseCodeId === null) {
        getCurrentHouseCodeId(function(response) {
            if (!angular.isDefined(response)) {
                return;
            }
            $scope.dashboard.houseCodeId = response.id;

			if ($scope.ptoYearId > 0 && $scope.initialize) {
				$scope.getSiteDetails();
				$scope.actionDashboardItem();
				$scope.initialize = false;
			}
        });
    }

    EmpActions.getAuthorizations(function(result) {
        $scope.authorizations = result;
        authorizationsLoaded();
    });

	EmpActions.getStateTypes(function(result) {
		$scope.states = result;

		EmpActions.getPTOYears(function(result) {
	        $scope.ptoYears = result;
	        if (angular.isDefined(result)) {
				$scope.ptoYear = result[0];
	            $scope.ptoYearId = result[0].id;
	        }

			if ($scope.dashboard.houseCodeId !== null) {
				$scope.actionDashboardItem();
				$scope.getSiteDetails();
				$scope.initialize = false;
			}
	    });
    });

	EmpActions.getReports(function(result) {
		$scope.reports = result;
    });

	EmpActions.getHcmHouseCodes(function(result) {
        $scope.hcmHouseCodes = result;
    });

	$scope.getSiteDetails = function() {
		 EmpActions.getSiteDetails($scope.dashboard.houseCodeId, function(data) {
		 	if (data.length > 0) {
				$scope.site = data[0];
				for(var index = 0; index < $scope.states.length; index++) {
					if ($scope.states[index].id == $scope.site.state) {
						$scope.site.stateTitle = $scope.states[index].name;
						$scope.state = $scope.states[index].name;
						break;
					}
				}
			}
        });

		EmpActions.getEmployees($scope.dashboard.houseCodeId, 0, -1, 0, 0, function(data) {
			$scope.totalEmployees = data.length;
        });
	},

	$scope.$watch("dashboard.houseCodeId", function(newValue, oldValue) {
        if (!newValue && !oldValue)
            return;

 		if (newValue !== "" && newValue !== oldValue && !$scope.initialize) {
            $scope.getSiteDetails();
			$scope.actionDashboardItem();
        }
    });

    $scope.tabClick = function(selectedTab) {
        for (var index = 0; index < selectedTab.$parent.tabs.length ; index++) {
            if (selectedTab.$parent.tabs[index].heading === $scope.previousTabSelected) {
                $scope.previousTabSelected = selectedTab.$parent.tabs[index];
            }
            else if (selectedTab.$parent.tabs[index].active === true)
                $scope.currentTabSelected = selectedTab.$parent.tabs[index].heading;
        }

        if ($scope.currentTabSelected === "Unit Dashboard")
            $scope.actionDashboardItem();

        $scope.previousTabSelected = $scope.currentTabSelected;
    };

	$scope.onYearChange = function(item) {
        $scope.ptoYearId = item.id;
		$scope.actionDashboardItem();
    };

	$scope.actionDashboardItem = function() {
		if ($scope.ptoYearId === 0 || $scope.dashboard.houseCodeId === null)
			return;

        $scope.planAssignments = [];
        $scope.employees = [];
		$scope.empPTOBalanceHours = [];
		$scope.selectedPlanAssignment = null;
		$scope.selectedEmployee = null;
		$scope.selectedPTOType = null;
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");

		EmpActions.getPlanAssignments($scope.dashboard.houseCodeId, $scope.ptoYearId, 0, function(result) {
            $scope.planAssignments = result;
            setStatus("Normal");
        });

		EmpActions.getEmployees($scope.dashboard.houseCodeId, $scope.ptoYearId, 0, 0, 1, function(employees) {
			$scope.employees = employees;
            setStatus("Normal");
        });
    };

	$scope.onPlanAssignmentSelected = function(item) {
        $scope.selectedPlanAssignment = item;
        $scope.employees = [];
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");

        EmpActions.getEmployees($scope.dashboard.houseCodeId, $scope.ptoYearId, $scope.selectedPlanAssignment.ptoPlanId, 0, 1, function(employees) {
			$scope.employees = employees;
			setStatus("Normal");
        });
    };

    $scope.onEmployeeSelected = function(item) {
        $scope.selectedEmployee = item;
		$scope.selectedPTOType = null;
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");

        EmpActions.getPTOBalanceHours($scope.ptoYearId, $scope.selectedEmployee.id, function(result) {
        	$scope.empPTOBalanceHours = result;
			setStatus("Normal");
		});
    };

	$scope.onPTOTypeSelected = function(item) {
        $scope.selectedPTOType = item;
    };

	$scope.showTitle = function(item) {
		return "Employee #: " + item.employeeNumber + "\nStatus: " + item.status + "\nUnion: " + item.union + "\nEnrolled Plans: " + item.enrolledPlans;
    };

	$scope.unitRosterItem = function() {
		var reportURL = "";
		var parametersList = "";

		for(var index = 0; index < $scope.reports.length; index++) {
			if ($scope.reports[index].brief === "Balance Usage") {
				reportURL = $scope.reports[index].reportURL;
				break;
			}
		}

		if (reportURL === "")
			return;

		parametersList = "CostCenter=" + parent.fin.appUI.houseCodeBrief + "~EmpPTOYear=" + $scope.ptoYearId;
		$scope.generateReport(reportURL, parametersList);
    };

	$scope.ptoStubItem = function() {
		var reportURL = "";
		var parametersList = "";

		if ($scope.selectedEmployee === null || $scope.selectedPTOType === null)
			return;

		for(var index = 0; index < $scope.reports.length; index++) {
			if ($scope.reports[index].brief === "PTO Stub") {
				reportURL = $scope.reports[index].reportURL;
				break;
			}
		}

		if (reportURL === "")
			return;

		parametersList = "EmpEmployeeGeneral=" + $scope.selectedEmployee.id + "~EmpPTOYear=" + $scope.ptoYearId + "~EmpPTOType=" + $scope.selectedPTOType.ptoType;
		$scope.generateReport(reportURL, parametersList);
    };

	$scope.generateReport = function(reportURL, parametersList) {
		console.log(parametersList);
		var form = document.createElement("form");
		form.setAttribute("method", "post");
		form.setAttribute("action", reportURL);
		form.setAttribute("target", "_blank");
		
		var parameters = parametersList.split("~");
		for (var index = 0; index < parameters.length; index++) {
			var nameValues = [];
			var nameValueList;
			var hiddenField = document.createElement("input");

			nameValueList = parameters[index].toString();
			nameValues = nameValueList.split("=");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", nameValues[0]);
			hiddenField.setAttribute("value", nameValues[1]);
			form.appendChild(hiddenField);
		}

		document.body.appendChild(form);
		form.submit();
	},

    $scope.getPTODate = function(date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'MM/dd/yyyy');
    };

    $scope.showPTODates = function(ptoTypeId) {
		$scope.ptoDays = [];
		$scope.ptoDates = [];
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");

        EmpActions.getPTODays($scope.selectedEmployee.id, $scope.ptoYearId, ptoTypeId, function(result) {
			$scope.ptoDays = result;
			angular.forEach($scope.ptoDays, function(ptoDay) {
			    if (ptoDay.ptoType == ptoTypeId)
			        ptoDay.ptoDate = $scope.getPTODate(ptoDay.ptoDate);
			    $scope.ptoDates.push(ptoDay);
			});

            var ptoModalInstance = $modal.open({
                templateUrl: 'ptoDates.htm',
                controller: 'modalInstanceCtrl',
                title: "PTO Hours",
                size: 'sm',
                backdrop: 'static',
                keyboard: false,
                scope: $scope
            });

			setStatus("Normal");
		});
    };
}])
.directive('ptoTypeahead', ['$filter', function($filter) {
    return {
        restrict: 'ACE',
        scope: {
            source: '=',
            model: '=ngModel',
            onBlur: '&',
            disabled: '=ngDisabled',
            change: '=ngChange',
            required: '=ngRequired'
        },
        template: '<div><input ng-model="model" ng-required="required" name="{{inputName}}" class="hide"/><input type="text" class="form-control input-sm" ng-model="TypeaheadModel" ng-disabled="disabled" ng-change="change" typeahead-input-formatter="inputFormatter($model)" typeahead="item as item[displayField] for item in source|filter:itemFilter($viewValue)| limitTo:10" ng-blur="onBlur()" /></div>',
        replace: true,
        link: function(scope, elem, attrs) {

            var option = scope.$eval(attrs.typeaheadOption);
            scope.displayField = '';
            scope.inputName = '';

            if (angular.isDefined(option)) {
                scope.displayField = option.displayField;
                scope.inputName = option.name;
            }

            scope.inputFormatter = function($model) {
                if ($model) {
                    scope.model = $model[option.valueField];
                    return $model[scope.displayField];
                }

                return "";
            }

            scope.itemFilter = function(value) {
                return function(item) {
                    return item[scope.displayField].toUpperCase().indexOf(value.toUpperCase()) >= 0;
                }
            }

            var setModelValue = function(source, modelVal) {
                if (angular.isDefined(source) && source != null && angular.isDefined(modelVal) && modelVal != null) {
                    var modelValue = $filter('filter')(source, function(item) {
                        return item[option.valueField] == modelVal;
                    });

                    scope.TypeaheadModel = typeof modelValue == "undefined" ? null : modelValue[0];

                    if (scope.inputName == "HcmHouseCode" && scope.TypeaheadModel != null) {
                        parent.fin.appUI.hirNode = parseInt(modelValue[0].hirNode, 10);
                        parent.fin.appUI.unitId = parseInt(modelValue[0].appUnit, 10);
                        parent.fin.appUI.houseCodeId = parseInt(modelValue[0].id, 10);
                        parent.fin.appUI.houseCodeBrief = modelValue[0].brief;
                        parent.fin.appUI.houseCodeTitle = modelValue[0].name;
                    }
                }
            }

            scope.$watch(function () { return scope.model }, function(value) {
                if (angular.isDefined(value) && value != null) {
                    setModelValue(scope.source, scope.model);
                }
            });

            scope.$watch(function () { return scope.source }, function(value) {
                if (angular.isDefined(value) && value != null) {
                    setModelValue(scope.source, scope.model);
                }
            });

            scope.$watch('TypeaheadModel', function(value) {
                if (typeof (value) == "string" && value.length == 0) {
                    scope.model = null;
                }
            });
        }
    }
}])

pto.controller('modalInstanceCtrl', function($scope, $modalInstance) {
    $scope.ok = function() {
        if ($scope.closeDialog) {
            $modalInstance.close();
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function($http, $filter, $rootScope) {
    var cache = {};

    var apiRequest = function(moduleId, targetId, requestXml, callback) {
        if (top.ii !== undefined) {
            top.ii.Session.singleton.ajaxStart();
            top.ii.Session.singleton.ajaxSend();
        }
        $rootScope.loadingCount = $rootScope.loadingCount || 0;
        $rootScope.loadingCount++;
        $http({
            method: 'POST',
            url: '/net/crothall/chimes/fin/' + moduleId + '/act/Provider.aspx',
            data: "moduleId=" + moduleId + "&requestId=1&targetId=" + targetId
                + "&requestXml=" + encodeURIComponent(requestXml),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        }).success(function(result) {
            callback(result);
			$rootScope.loadingCount--;
            if (top.ii !== undefined) {
                top.ii.Session.singleton.ajaxComplete();
                top.ii.Session.singleton.ajaxStop();
            }
        })
        .error(function(error) {
            $rootScope.loadingCount--;
            if (top.ii !== undefined) {
                top.ii.Session.singleton.ajaxComplete();
                top.ii.Session.singleton.ajaxStop();
            }
        });
    }

    var getAuthorizations = function(callback) {
        if (cache.authorizations) {
            callback(cache.authorizations);
            return;
        }
        apiRequest('emp', 'iiAuthorization', '<authorization id="1"><authorize path="\\crothall\\chimes\\fin\\PTOSetup\\PTODashboard" />', function(xml) {
            cache.authorizations = deserializeXml(xml, 'authorize', { upperFirstLetter: false, intItems: ['id'] });
            getAuthorizations(callback);
        });
    };

	var getStateTypes = function(callback) {
        if (cache.stateTypes) {
            callback(cache.stateTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:stateTypes,userId:[user],</criteria>', function(xml) {
            cache.stateTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            getStateTypes(callback);
        });
    };

    var getPTOYears = function(callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoYears,userId:[user],</criteria>', function(xml) {
		    if (callback) {
		        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'], boolItems: ['active'] }));
		    }
		});
    };

    var getSiteDetails = function(houseCodeId, callback) {
        apiRequest('hcm', 'iiCache', '<criteria>storeId:sites,userId:[user],type:invoice,houseCodeId:' + houseCodeId + ',</criteria>', function(xml) {
		    if (callback) {
		        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
		    }
		});
    };

    var getHcmHouseCodes = function(callback) {
        if (cache.houseCodes) {
            callback(cache.houseCodes);
            return;
        }

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';
        var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&targetId=iiCache';

        apiRequest('hcm', 'iiCache', criteriaXml, function(xml) {
            cache.houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            getHcmHouseCodes(callback);
        });
    };

    var getPlanAssignments = function(houseCodeId, ptoYearId, groupType, callback) {
		var intItems = ['id', 'ptoYearId', 'stateType', 'houseCodeId', 'ptoPlanId', 'ptoPlanType', 'ptoType', 'minHours', 'maxHours', 'groupType', 'appZipCodeType'];
		var boolItems = ['active', 'hourly', 'salary', 'excludeUnion', 'ptoPlanTypeFullTime', 'ptoPlanTypePartTime'];
        var dateItems = ["startDate", "endDate"];
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYearId:' + ptoYearId
           + ',stateType:' + 0
           + ',groupType:' + groupType
		   + ',clonePlan:' + 0
		   + ',houseCode:' + houseCodeId
           + ',</criteria>', function(xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: intItems, boolItems: boolItems, dateItems: dateItems }));
               }
           });
    };

    var getEmployees = function(houseCodeId, ptoYearId, ptoPlanId, groupType, assigned, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoEmployees,userId:[user]'
           + ',houseCodeId:' + houseCodeId
		   + ',ptoYearId:' + ptoYearId
           + ',ptoPlanId:' + ptoPlanId
		   + ',groupType:' + groupType
           + ',assigned:' + assigned
		   + ',searchType:PTODashboard'
           + ',</criteria>', function(xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'ptoAssignmentId', 'employeeNumber'], boolItems: ['active'] }));
               }
           });
    };

    var getPTODays = function(employeeId, yearId, ptoTypeId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoDays,userId:[user]'
           + ',employeeId:' + employeeId
		   + ',ptoYearId:' + yearId
		   + ',ptoTypeId:' + ptoTypeId
           + ',</criteria>', function(xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
               }
        });
    };

    var getPTOBalanceHours = function(yearId, employeeId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoEmployeeBalanceHours,userId:[user]'
			+ ',yearId:' + yearId
            + ',employeeId:' + employeeId
			+ ',searchType:PTODashboard'
            + ',</criteria>', function(xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
               }
           });
    };

    var getCurrentHouseCodeId = function(callback) {
        apiRequest('hcm', 'iiCache', '<criteria>storeId:hcmHouseCodes,userId:[user],defaultOnly:true,</criteria>', function(xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
        });
    };

	var getReports = function(callback) {
        apiRequest('rpt', 'iiCache', '<criteria>storeId:rptReports,userId:[user],</criteria>', function(xml) {
		    if (callback) {
		        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'], boolItems: ['active'] }));
		    }
		});
    };

    return {
		getAuthorizations: getAuthorizations,
		getCurrentHouseCodeId: getCurrentHouseCodeId,
		getHcmHouseCodes: getHcmHouseCodes,
		getStateTypes: getStateTypes,
        getPTOYears: getPTOYears,
		getEmployees: getEmployees,
        getPlanAssignments: getPlanAssignments,
		getSiteDetails: getSiteDetails,
        getPTODays: getPTODays,
		getPTOBalanceHours: getPTOBalanceHours,
		getReports: getReports
    }
}]);
var pto = angular.module('pto', ['ui.bootstrap', 'ngRoute']);

pto.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({
        controller: 'planAssignmentCtrl',
        templateUrl: 'planAssignment.htm'
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

var dirtyCheck = function() {
    if (parent.fin.appUI !== undefined && parent.fin.appUI.modified) {
        if (confirm("The current item was modified and you will lose unsaved data if you navigate from current item. Press OK to continue, or Cancel to remain on the current item.")) {
            parent.fin.appUI.modified = false;
            return true;
        }
        else
            return false;
    }
    else
        return true;
};

var editStatus = function() {
    return !dirtyCheck();
};

var checkStatus = function() {
    var me = this;

    if (top.ii !== undefined) {
        if (top.ui.ctl.menu) {
            top.ui.ctl.menu.Dom.me.registerDirtyCheck(editStatus, me);
        }
    }
};

var modified = function(isModified) {
    parent.fin.appUI.modified = isModified;
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

pto.controller('planAssignmentCtrl', ['$scope', 'EmpActions', '$filter', '$sce', '$modal', function($scope, EmpActions, $filter, $sce, $modal) {
	$scope.ptoYears = [];
	$scope.plans = [];
	$scope.ptoPlans = [];
	$scope.companyPlans = [];
	$scope.statePlans = [];
    $scope.countyPlans = [];
	$scope.cityPlans = [];
    $scope.countys = [];
	$scope.cities = [];
	$scope.houseCodes = [];
    $scope.selectedState = null;
    $scope.showStateGrid = false;
    $scope.showCompanyGrid = true;
    $scope.pageLoading = false;
    $scope.loadingTitle = " Loading...";
    $scope.disableOk = true;
	$scope.showStateName = false;
	$scope.stateName = "";
    $scope.levelSelected = "";
    $scope.closeDialog = true;
    $scope.isPageLoading = function() {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    setStatus("Loading");
    modified(false);
    checkStatus();
    $scope.stateGridMinHeight = $(window).height() - $(window).height() * 1/4;
    $scope.stateGridHeight = $scope.stateGridMinHeight;
    $scope.statePlanGridMinHeight = 200;
    $scope.countyPlanGridMinHeight = 200;
    $scope.cityPlanGridMinHeight = 200;
    $scope.houseCodePlanGridMinHeight = 200;
    $scope.nextYearPlans = [];
    $scope.cloneToYearId = '';
    $scope.cloneFromYearId = '';
    var modalOptions = {
        templateUrl: 'cloneGrid.html',
        controller: 'modalInstanceCtrl',
        title: "Clone Plan",
        size: 'sm',
        scope: $scope
    };
    $scope.showPlans = true;
    $scope.cloneGridMaxHeight = $(window).height() - $(window).height() * 0.1;

    EmpActions.getPTOTypes(function(result) {
    });
	
    EmpActions.getPTOPlanTypes(function(result) {
    });

    EmpActions.getPTOYears(function(result) {
        $scope.ptoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
            $scope.cloneToYear = parseInt(result[0].name);
            $scope.cloneFromYear = $scope.cloneToYear - 1;
            $scope.cloneToYearId = result[0].id;
        }
        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
            $scope.ptoPlans = result;
        });
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function(result) {
            $scope.companyPlans = result;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
        for (var index = 0; index < $scope.ptoYears.length; index++) {
            if ($scope.ptoYears[index].name == $scope.cloneFromYear) {
                $scope.cloneFromYearId = $scope.ptoYears[index].id;
                break;
            }
        }
        if ($scope.cloneToYearId !== '') {
            EmpActions.getPTOPlans($scope.cloneToYearId, function (result) {
                $scope.nextYearPlans = result;
            });
        }
    });

    $scope.onYearChange = function (level) {
        $scope.showPlans = false;
    };

    $scope.onLevelChange = function(level) {
        $scope.disableOk = true;
        if (level === "state") {
            if (editStatus())
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showStateGrid = true;
            $scope.showCompanyGrid = false;
			setStatus("Loading");
            EmpActions.getStateTypes(function(result) {
                $scope.states = result;
                $scope.pageLoading = false;
                setStatus("Normal");
            });
        }
        else if (level === "company") {
            if (editStatus())
                return;
            $scope.showCompanyGrid = true;
            $scope.showStateGrid = false;
        }
    };

    $scope.companyPlanSelected = function(item) {
        $scope.selectedCompanyPlan = item;
        $scope.levelSelected = "company";
    };

    $scope.search = function() {
        $scope.pageLoading = true;
        setStatus("Loading");
		$scope.showStateName = false;
		$scope.stateName = "";
		$scope.selectedCompanyPlan = null;
		$scope.selectedStatePlan = null;
		$scope.selectedCountyPlan = null;
		$scope.selectedCityPlan = null;
		$scope.selectedHouseCodePlan = null;
		$scope.showPlans = true;
		$scope.cloneToYearId = $scope.ptoYear;
		$scope.disableCompanyCloneButton = false;
		$scope.disableStateCloneButton = false;
		$scope.disableCountyCloneButton = false;
		$scope.disableCityCloneButton = false;
		$scope.disableHouseCodeCloneButton = false;

		for (var index = 0; index < $scope.ptoYears.length; index++) {
		    if ($scope.ptoYears[index].id == $scope.cloneToYearId) {
		        $scope.cloneToYear = $scope.ptoYears[index].name;
		        $scope.cloneFromYear = $scope.cloneToYear - 1;
		        break;
		    }
		}
		for (var index = 0; index < $scope.ptoYears.length; index++) {
		    if ($scope.ptoYears[index].name == $scope.cloneFromYear) {
		        $scope.cloneFromYearId = $scope.ptoYears[index].id;
		        break;
		    }
		}
        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
            $scope.ptoPlans = $scope.plans;
        });
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function(result) {
            $scope.companyPlans = result;
            if ($scope.companyPlans.length > 0)
                $scope.disableCompanyCloneButton = true;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
        $scope.selectedState = null;
        $scope.statePlans = [];
        $scope.countys = [];
        $scope.cities = [];
        $scope.houseCodes = [];
    };

    $scope.stateSelected = function(item) {
		$scope.selectedState = item;
        $scope.loadingTitle = " Loading...";
        $scope.pageLoading = true;
		$scope.showStateName = true;
		$scope.stateName = item.name;
		$scope.showState = true;
		$scope.stateExpanded = true;
		$scope.showCounty = true;
		$scope.filterCounty = false;
		$scope.expandAllCounty = true;
		$scope.countyExpanded = true;
		$scope.showCity = true;
		$scope.filterCity = false;
		$scope.expandAllCity = true;
		$scope.cityExpanded = true;
		$scope.showHouseCode = true;
		$scope.filterHouseCode = false;
		$scope.expandAllHouseCode = true;
		$scope.houseCodeExpanded = true;
		setStatus("Loading");
		var totalGridsHeight = '';
		$scope.selectedCounty = null;
		$scope.selectedCity = null;
		$scope.selectedHouseCode = null;
		$scope.selectedStatePlan = null;
		$scope.selectedCountyPlan = null;
		$scope.selectedCityPlan = null;
		$scope.selectedHouseCodePlan = null;

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 2, function(data) {
            $scope.statePlans = [];
            angular.forEach(data, function(statePlan, index) {
                if (statePlan.ptoPlanId > 0) {
                    $scope.statePlans.push(statePlan);
                }
            });
            if ($scope.statePlans.length > 0)
                $scope.disableStateCloneButton = true;

            $scope.setStateGridHeight();
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 3, function(data) {
            $scope.countys = [];

            angular.forEach(data, function(county, index) {
                var found = false;
                if (county.ptoPlanId > 0 && $scope.countys.length > 0) {
					for (var index = 0; index < $scope.countys.length; index++) {
						if ($scope.countys[index].name === county.name) {
							found = true;
							break;
						}  
					}
                    if (!found)
                        $scope.countys.push(county);
                }
                else
                    $scope.countys.push(county);
            });

            angular.forEach($scope.countys, function(county, index) {
                county.countyPlans = [];
            });

            angular.forEach(data, function(county, index) {
                if (county.ptoPlanId > 0) {
                    angular.forEach($scope.countys, function(countyPlan, index) {
                        if (countyPlan.name === county.name) {
                            countyPlan.countyPlans.push(county);
                            $scope.disableCountyCloneButton = true;
                        }
                    });
                }
            });

            $scope.setStateGridHeight();
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 4, function(data) {
            $scope.cities = [];

            angular.forEach(data, function(city, index) {
                var found = false;
                if (city.ptoPlanId > 0 && $scope.cities.length > 0) {
 					for (var index = 0; index < $scope.cities.length; index++) {
						if ($scope.cities[index].name === city.name) {
							found = true;
							break;
						}  
					}
                    if (!found)
                    	$scope.cities.push(city);
                }
                else
                    $scope.cities.push(city);
            });

            angular.forEach($scope.cities, function(city, index) {
                city.cityPlans = [];
            });

            angular.forEach(data, function(city, index) {
                if (city.ptoPlanId > 0) {
                    angular.forEach($scope.cities, function(cityPlan, index) {
                        if (cityPlan.name === city.name) {
                            cityPlan.cityPlans.push(city);
                            $scope.disableCityCloneButton = true;
                        }
                    });
                }
            });

            $scope.assignedCities = $scope.cities;
            $scope.setStateGridHeight();
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 5, function(data) {
            $scope.houseCodes = [];

            angular.forEach(data, function(houseCode, index) {
                var found = false;
                if (houseCode.ptoPlanId > 0 && $scope.houseCodes.length > 0) {
					for (var index = 0; index < $scope.houseCodes.length; index++) {
						if ($scope.houseCodes[index].name === houseCode.name) {
							found = true;
							break;
						}  
					}
                    if (!found)
                        $scope.houseCodes.push(houseCode);
                }
                else
                    $scope.houseCodes.push(houseCode);
            });

            angular.forEach($scope.houseCodes, function(houseCode, index) {
                houseCode.houseCodePlans = [];
            });

            angular.forEach(data, function(houseCode, index) {
                if (houseCode.ptoPlanId > 0) {
                    angular.forEach($scope.houseCodes, function(houseCodePlan, index) {
                        if (houseCodePlan.name === houseCode.name) {
                            houseCodePlan.houseCodePlans.push(houseCode);
                            $scope.disableHouseCodeCloneButton = true;
                        }
                    });
                }
                
            });

            $scope.assignedHouseCodes = $scope.houseCodes;
            $scope.setStateGridHeight();
        });
		$scope.pageLoading = false;
		setStatus("Normal");
    };

    $scope.setStateGridHeight = function () {
        totalGridsHeight = angular.element('#statePlanDetailsGrid').height() + angular.element('#countyPlanDetailsGrid').height()
               + angular.element('#cityPlanDetailsGrid').height() + angular.element('#houseCodePlanDetailsGrid').height();

        if (totalGridsHeight > $scope.stateGridHeight) {
            $scope.stateGridHeight = 1350;
        }
    };

    $scope.setHeight = function (type) {
        totalGridsHeight = angular.element('#statePlanDetailsGrid').height() + angular.element('#countyPlanDetailsGrid').height()
               + angular.element('#cityPlanDetailsGrid').height() + angular.element('#houseCodePlanDetailsGrid').height();

        var height = 70;
        var marginHeight = 270;
        if (type !== "state") {
            height = height + 15;
            marginHeight = marginHeight + 15;
        }

        if (angular.element("#" + type + "PlanDetailsGrid").height() >= 200) {
            if ($scope.stateGridHeight > 770 && totalGridsHeight != 400
                && $scope.stateGridHeight - angular.element("#" + type + "PlanDetailsGrid").height() - height >= $scope.stateGridMinHeight) {
                    $scope.stateGridHeight = $scope.stateGridHeight - angular.element("#" + type + "PlanDetailsGrid").height() - height;
            }
            else {
                $scope.stateGridHeight = $scope.stateGridMinHeight;
                if (angular.element('#statePlanDetailsGrid').height() >= 200 && type !== "state")
                    $scope.statePlanGridMinHeight = $scope.stateGridMinHeight - 300;
                else if (angular.element('#countyPlanDetailsGrid').height() >= 200 && type !== "county")
                    $scope.countyPlanGridMinHeight = $scope.stateGridMinHeight - 305;
                else if (angular.element('#cityPlanDetailsGrid').height() >= 200 && type !== "city")
                    $scope.cityPlanGridMinHeight = $scope.stateGridMinHeight - 305;
                else if (angular.element('#houseCodePlanDetailsGrid').height() >= 200 && type !== "houseCode")
                    $scope.houseCodePlanGridMinHeight = $scope.stateGridMinHeight - 305;
            }
        }
        else if (totalGridsHeight === 0) {
            $scope.stateGridHeight = $scope.stateGridMinHeight;
            if (type === "state")             
                $scope.statePlanGridMinHeight = $scope.stateGridMinHeight - 300;
            else if (type === "county")    
                $scope.countyPlanGridMinHeight = $scope.stateGridMinHeight - 305;
            else if (type === "city") 
                $scope.cityPlanGridMinHeight = $scope.stateGridMinHeight - 305;
            else if (type === "houseCode") 
                $scope.houseCodePlanGridMinHeight = $scope.stateGridMinHeight - 305;
        }
        else if (angular.element("#" + type + "PlanDetailsGrid").height() === 0) {
            if (type === "state")
                $scope.statePlanGridMinHeight = 200;
            else if (type === "county")
                $scope.countyPlanGridMinHeight = 200;
            else if (type === "city")
                $scope.cityPlanGridMinHeight = 200;
            else if (type === "houseCode")
                $scope.houseCodePlanGridMinHeight = 200;

           $scope.stateGridHeight = $scope.stateGridHeight + marginHeight;
        }
        else
            $scope.stateGridHeight = 1350;
    };

    $scope.addPlan = function(level) {
        $scope.disableOk = true;
		$scope.selectedPlan = null;
        $scope.plans = [];
		$scope.modalPlans = [];

        angular.forEach($scope.ptoPlans, function(plan, index) {
            if (plan.isChecked) {
                plan.isChecked = false;
            }
        });

        if (level === "company") {
            angular.forEach($scope.ptoPlans, function(plan, index) {
                var found = false;
				for (var index = 0; index < $scope.companyPlans.length; index++) {
					if ($scope.companyPlans[index].ptoPlanId === plan.id) {
                        found = true;
						break;
                    }
				}
                if (!found)
                    $scope.modalPlans.push(plan);
            });
            if ($scope.showPlans)
                $scope.plans = $scope.modalPlans;
        }
        else if (level === "state") {
            if ($scope.selectedState === undefined || $scope.selectedState === null)
                return;

            angular.forEach($scope.ptoPlans, function(plan, index) {
				var found = false;
				for (var index = 0; index < $scope.statePlans.length; index++) {
					if ($scope.statePlans[index].ptoPlanId === plan.id) {
                        found = true;
						break;
                    }
				}
                if (!found)
                    $scope.modalPlans.push(plan);
            });
            if ($scope.showPlans)
                $scope.plans = $scope.modalPlans;
        }
		else if (level === "county") {
            if ($scope.selectedCounty === undefined || $scope.selectedCounty === null)
                return;

            angular.forEach($scope.ptoPlans, function(plan, index) {
				var found = false;
				for (var index = 0; index < $scope.selectedCounty.countyPlans.length; index++) {
					if ($scope.selectedCounty.countyPlans[index].ptoPlanId === plan.id) {
                        found = true;
						break;
                    }
				}
                if (!found)
                    $scope.modalPlans.push(plan);
            });
            if ($scope.showPlans)
                $scope.plans = $scope.modalPlans;
        }
        else if (level === "city") {
            if ($scope.selectedCity === undefined || $scope.selectedCity === null)
                return;

            angular.forEach($scope.ptoPlans, function(plan, index) {
				var found = false;
				for (var index = 0; index < $scope.selectedCity.cityPlans.length; index++) {
					if ($scope.selectedCity.cityPlans[index].ptoPlanId === plan.id) {
                        found = true;
						break;
                    }
				}
                if (!found)
                    $scope.modalPlans.push(plan);
            });
            if ($scope.showPlans)
                $scope.plans = $scope.modalPlans;
        }
        else if (level === "houseCode") {
            if ($scope.selectedHouseCode === undefined || $scope.selectedHouseCode === null)
                return;

            angular.forEach($scope.ptoPlans, function(plan, index) {
				var found = false;
				for (var index = 0; index < $scope.selectedHouseCode.houseCodePlans.length; index++) {
					if ($scope.selectedHouseCode.houseCodePlans[index].ptoPlanId === plan.id) {
                        found = true;
						break;
                    }
				}
                if (!found)
                    $scope.modalPlans.push(plan);
            });
            if ($scope.showPlans)
                $scope.plans = $scope.modalPlans;
        }

        var ptoModalInstance = $modal.open({
            templateUrl: 'planGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });

        $scope.levelSelected = level;
    };

	$scope.validatePlan = function(assignedPlans) {
		var found = false;

		outerLoop:
		for (var index = 0; index < $scope.plans.length; index++) {
            if ($scope.plans[index].isChecked) {
 				for (var iIndex = 0; iIndex < assignedPlans.length; iIndex++) {
                    if ($scope.plans[index].ptoTypeTitle === assignedPlans[iIndex].ptoTypeTitle && $scope.plans[index].ptoPlanTypeTitle === assignedPlans[iIndex].ptoPlanTypeTitle) {
                        alert("Plan with PTO Type: [" + assignedPlans[iIndex].ptoTypeTitle + "] and Plan Type: [" + assignedPlans[iIndex].ptoPlanTypeTitle + "] is already exists.");
						found = true;
						break outerLoop;
                    }
                }

				for (var iIndex = 0; iIndex < $scope.plans.length; iIndex++) {
					if ($scope.plans[iIndex].isChecked && $scope.plans[index].id !== $scope.plans[iIndex].id 
						&& $scope.plans[index].ptoTypeTitle === $scope.plans[iIndex].ptoTypeTitle && $scope.plans[index].ptoPlanTypeTitle === $scope.plans[iIndex].ptoPlanTypeTitle) {
                        alert("You cannot select plan with same PTO Type: [" + $scope.plans[index].ptoTypeTitle + "] and Plan Type: [" + $scope.plans[index].ptoPlanTypeTitle + "].");
						found = true;
						break outerLoop;
                    }
                }
            }
        }

		return !found;
	};

	$scope.addSelectedPlan = function() {
		var valid = true;

		if ($scope.levelSelected === "company")
            valid = $scope.validatePlan($scope.companyPlans);
		else if ($scope.levelSelected === "state")
            valid = $scope.validatePlan($scope.statePlans);
		else if ($scope.levelSelected === "county")
            valid = $scope.validatePlan($scope.selectedCounty.countyPlans);
		else if ($scope.levelSelected === "city")
            valid = $scope.validatePlan($scope.selectedCity.cityPlans);
		else if ($scope.levelSelected === "houseCode")
            valid = $scope.validatePlan($scope.selectedHouseCode.houseCodePlans);

		$scope.closeDialog = valid;
		
		if (valid) {
			for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    var item = {};
                    item["id"] = 0;
                    item["ptoYearId"] = $scope.ptoYear;
                    item["houseCodeId"] = 0;
                    item["ptoPlanId"] = $scope.plans[index].id;
                    item["active"] = true;
                    item["modified"] = true;
                    item["ptoPlanTitle"] = $scope.plans[index].title;
                    item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                    item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
                   
					if ($scope.levelSelected === "company") {
						item["stateType"] = 0;
						item["groupType"] = 1;
						item["name"] = "";
						$scope.companyPlans.push(item);
						$scope.disableCompanyCloneButton = true;
					}
					else if ($scope.levelSelected === "state") {
						item["stateType"] = $scope.selectedState.id;
						item["groupType"] = 2;
						item["name"] = $scope.selectedState.name;
						$scope.statePlans.push(item);
						$scope.disableStateCloneButton = true;
					}
					else if ($scope.levelSelected === "county") {
	                    item["stateType"] = $scope.selectedState.id;
	                    item["groupType"] = 3;
	                    item["name"] = $scope.selectedCounty.name;
	                    $scope.selectedCounty.countyPlans.push(item);
	                    $scope.disableCountyCloneButton = true;
	                }
					else if ($scope.levelSelected === "city") {
                        item["stateType"] = $scope.selectedState.id;
                        item["groupType"] = 4;
                        item["name"] = $scope.selectedCity.name;
                        $scope.selectedCity.cityPlans.push(item);
                        $scope.disableCityCloneButton = true;
	                }
					else if ($scope.levelSelected === "houseCode") {
                        item["stateType"] = $scope.selectedState.id;
						item["houseCodeId"] = $scope.selectedHouseCode.houseCodeId;
                        item["groupType"] = 5;
                        item["name"] = $scope.selectedHouseCode.name;
                        $scope.selectedHouseCode.houseCodePlans.push(item);
                        $scope.disableHouseCodeCloneButton = true;
	                }
                }
            }
		}

        if ($scope.levelSelected === "company") {
        	EmpActions.actionSaveItem($scope, $scope.companyPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        }
        else if ($scope.levelSelected === "state") {
        	EmpActions.actionSaveItem($scope, $scope.statePlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        }
        else if ($scope.levelSelected === "county") {
            EmpActions.actionSaveItem($scope, $scope.selectedCounty.countyPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        }
        else if ($scope.levelSelected === "city") {
            EmpActions.actionSaveItem($scope, $scope.selectedCity.cityPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        }
        else if ($scope.levelSelected === "houseCode") {
			EmpActions.actionSaveItem($scope, $scope.selectedHouseCode.houseCodePlans, function(data, status) {
				$scope.$apply(function() {
				    $scope.pageLoading = false;
					setStatus("Saved");
				});
			});
        }
    };

    $scope.saveCompanyPlans = function() {
        if ($scope.selectedCompanyPlan === undefined || $scope.selectedCompanyPlan === null)
            return;

		EmpActions.actionSaveItem($scope, $scope.companyPlans, function(data, status) {
			$scope.$apply(function() {
				$scope.pageLoading = false;
				setStatus("Saved");
				modified(false);
            });
		});
    };

    $scope.saveStatePlans = function() {
		if ($scope.selectedStatePlan === undefined || $scope.selectedStatePlan === null)
            return;

        EmpActions.actionSaveItem($scope, $scope.statePlans, function(data, status) {
            $scope.$apply(function() {
                $scope.pageLoading = false;
                setStatus("Saved");
                modified(false);
            });
        });
    };

    $scope.saveCountyPlans = function() {
        if ($scope.selectedCountyPlan === undefined || $scope.selectedCountyPlan === null)
            return;

        var modifiedPlans = [];
        angular.forEach($scope.countys, function(county, index) {
            for (var index = 0; index < county.countyPlans.length; index++) {
                if (county.countyPlans[index].modified)
                    modifiedPlans.push(county.countyPlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
            EmpActions.actionSaveItem($scope, modifiedPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

    $scope.saveCityPlans = function() {
        if ($scope.selectedCityPlan === undefined || $scope.selectedCityPlan === null)
            return;

        var modifiedPlans = [];
        angular.forEach($scope.cities, function(city, index) {
            for (var index = 0; index < city.cityPlans.length; index++) {
                if (city.cityPlans[index].modified)
                    modifiedPlans.push(city.cityPlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
            EmpActions.actionSaveItem($scope, modifiedPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

    $scope.saveHouseCodePlans = function() {
        if ($scope.selectedHouseCodePlan === undefined || $scope.selectedHouseCodePlan === null)
            return;

        var modifiedPlans = [];
        angular.forEach($scope.houseCodes, function(houseCode, index) {
            for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                if (houseCode.houseCodePlans[index].modified)
                    modifiedPlans.push(houseCode.houseCodePlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
            EmpActions.actionSaveItem($scope, modifiedPlans, function(data, status) {
                $scope.$apply(function() {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

	$scope.removeCompanyPlan = function() {
		if ($scope.selectedCompanyPlan === undefined || $scope.selectedCompanyPlan === null)
			return;

		if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCompanyPlan.ptoPlanTitle + "]?"))
			return;

        EmpActions.actionDeleteItem($scope, $scope.selectedCompanyPlan.id, function(data, status) {
			for (var index = 0; index < $scope.companyPlans.length; index++) {
				if ($scope.companyPlans[index].id === $scope.selectedCompanyPlan.id) {
					$scope.companyPlans.splice(index, 1);
					$scope.selectedCompanyPlan = null;
					break;
				}
			}
			if ($scope.companyPlans.length === 0)
			    $scope.disableCompanyCloneButton = false;
            $scope.$apply(function() {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeStatePlan = function() {
        if ($scope.selectedStatePlan === undefined || $scope.selectedStatePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedStatePlan.ptoPlanTitle + "]?"))
            return;

        EmpActions.actionDeleteItem($scope, $scope.selectedStatePlan.id, function(data, status) {
            for (var index = 0; index < $scope.statePlans.length; index++) {
                if ($scope.statePlans[index].id === $scope.selectedStatePlan.id) {
                    $scope.statePlans.splice(index, 1);
                    $scope.selectedStatePlan = null;
                    break;
                }
            }
            if ($scope.statePlans.length === 0)
                $scope.disableStateCloneButton = false;
            $scope.$apply(function() {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeCountyPlan = function() {
        if ($scope.selectedCountyPlan === undefined || $scope.selectedCountyPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCountyPlan.ptoPlanTitle + "]?"))
            return;

        EmpActions.actionDeleteItem($scope, $scope.selectedCountyPlan.id, function(data, status) {
			outerLoop:
			for (var index = 0; index < $scope.countys.length; index++) {
				for (var iIndex = 0; iIndex < $scope.countys[index].countyPlans.length; iIndex++) {
                    if ($scope.countys[index].countyPlans[iIndex].id === $scope.selectedCountyPlan.id) {
                        $scope.countys[index].countyPlans.splice(iIndex, 1);
                        $scope.selectedCountyPlan = null;
                        break outerLoop;
                    }
                }
			}

            var found = false;
            for (var countyIndex = 0; countyIndex < $scope.countys.length; countyIndex++) {
                if ($scope.countys[countyIndex].countyPlans.length > 0) {
                    found = true;
                    break;
                }
            }

            $scope.disableCountyCloneButton = found;
            $scope.$apply(function() {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeCityPlan = function() {
        if ($scope.selectedCityPlan === undefined || $scope.selectedCityPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCityPlan.ptoPlanTitle + "]?"))
            return;

        EmpActions.actionDeleteItem($scope, $scope.selectedCityPlan.id, function(result) {
			outerLoop:
			for (var index = 0; index < $scope.cities.length; index++) {
				for (var iIndex = 0; iIndex < $scope.cities[index].cityPlans.length; iIndex++) {
					if ($scope.cities[index].cityPlans[iIndex].id === $scope.selectedCityPlan.id) {
						$scope.cities[index].cityPlans.splice(iIndex, 1);
						$scope.selectedCityPlan = null;
						break outerLoop;
					}
				}
			}

            var found = false;
            for (var cityIndex = 0; cityIndex < $scope.cities.length; cityIndex++) {
                if ($scope.cities[cityIndex].cityPlans.length > 0) {
                     found = true;
                    break;
                }
            }
            $scope.disableCityCloneButton = found;

            $scope.$apply(function() {
            	$scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeHouseCodePlan = function() {
        if ($scope.selectedHouseCodePlan === undefined || $scope.selectedHouseCodePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedHouseCodePlan.ptoPlanTitle + "]?"))
            return;

        EmpActions.actionDeleteItem($scope, $scope.selectedHouseCodePlan.id, function(result) {
			outerLoop:
			for (var index = 0; index < $scope.houseCodes.length; index++) {
				for (var iIndex = 0; iIndex < $scope.houseCodes[index].houseCodePlans.length; iIndex++) {
					if ($scope.houseCodes[index].houseCodePlans[iIndex].id === $scope.selectedHouseCodePlan.id) {
						$scope.houseCodes[index].houseCodePlans.splice(iIndex, 1);
						$scope.selectedHouseCodePlan = null;
						break outerLoop;
					}
				}
			}

            var found = false;
            for (var houseCodeIndex = 0; houseCodeIndex < $scope.houseCodes.length; houseCodeIndex++) {
                if ($scope.houseCodes[houseCodeIndex].houseCodePlans.length > 0) {
                    found = true;
                    break;
                }
            }
            $scope.disableHouseCodeCloneButton = found;

            $scope.$apply(function() {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.cloneSelectedPlan = function () {
        if ($scope.levelSelected === "company" || $scope.levelSelected === "state") {
            $scope.nextYearClonnedPlans = [];
            for (var index = 0; index < $scope.clonePlans.length; index++) {
                if ($scope.clonePlans[index].isChecked) {
                    var item = {};
                    item["id"] = 0;
                    item["ptoYearId"] = $scope.cloneToYearId;
                    item["houseCodeId"] = 0;
                    item["ptoPlanId"] = $scope.clonePlans[index].id;
                    item["active"] = true;
                    item["modified"] = true;
                    item["ptoPlanTitle"] = $scope.clonePlans[index].title;
                    item["ptoTypeTitle"] = $scope.clonePlans[index].ptoTypeTitle;
                    item["ptoPlanTypeTitle"] = $scope.clonePlans[index].ptoPlanTypeTitle;
                    if ($scope.levelSelected === "company") {
                        item["stateType"] = 0;
                        item["groupType"] = 1;
                        item["name"] = "";
                    }
                    else if ($scope.levelSelected === "state") {
                        item["stateType"] = $scope.selectedState.id;
                        item["groupType"] = 2;
                        item["name"] = $scope.selectedState.name;
                    }
                    $scope.nextYearClonnedPlans.push(item);
                }
            }
            EmpActions.actionSaveItem($scope, $scope.nextYearClonnedPlans, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                });
            });
        }
        else if ($scope.levelSelected === "county" || $scope.levelSelected === "city" || $scope.levelSelected === "houseCode") {
            $scope.nextYearClonePlans = [];
            for (var groupIndex = 0; groupIndex < $scope.groups.length; groupIndex++) {
                for (var index = 0; index < $scope.groups[groupIndex].clonePlans.length; index++) {
                    if ($scope.groups[groupIndex].clonePlans[index].isChecked) {
                        var item = {};
                        item["id"] = 0;
                        item["ptoYearId"] = $scope.cloneToYearId;
                        item["houseCodeId"] = 0;
                        item["ptoPlanId"] = $scope.groups[groupIndex].clonePlans[index].id;
                        item["active"] = true;
                        item["modified"] = true;
                        item["ptoPlanTitle"] = $scope.groups[groupIndex].clonePlans[index].title;
                        item["ptoTypeTitle"] = $scope.groups[groupIndex].clonePlans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.groups[groupIndex].clonePlans[index].ptoPlanTypeTitle;
                        item["stateType"] = $scope.selectedState.id;
                        item["name"] = $scope.groups[groupIndex].name;
                        if ($scope.levelSelected === "county")
                            item["groupType"] = 3;
                        else if ($scope.levelSelected === "city")
                            item["groupType"] = 4;
                        else if ($scope.levelSelected === "houseCode") {
                            item["houseCodeId"] = $scope.groups[groupIndex].houseCodeId;
                            item["groupType"] = 5;
                        }
                        $scope.nextYearClonePlans.push(item);
                    }
                }
            }
            EmpActions.actionSaveItem($scope, $scope.nextYearClonePlans, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                });
            });
        }
    };

    $scope.clonePlanSelected = function (item) {
        $scope.selectedClonePlan = item;
        var disable = true;

        if ($scope.levelSelected === "company" || $scope.levelSelected === "state") {
            for (var index = 0; index < $scope.clonePlans.length; index++) {
                if ($scope.clonePlans[index].isChecked) {
                    disable = false;
                    break;
                }
            }
        }
        else {
            for (var index = 0; index < $scope.groups.length; index++) {
                for (var groupIndex = 0; groupIndex < $scope.groups[index].clonePlans.length; groupIndex++) {
                    if ($scope.groups[index].clonePlans[groupIndex].isChecked) {
                        disable = false;
                        break;
                        break;
                    }
                }
            }
        }

        $scope.disableCloneOk = disable;
    };

    $scope.onClonePlanChecked = function (item, check) {
        item.isChecked = check;
    };

    $scope.clonePlan = function (level) {
        if (level !== "company" && ($scope.selectedState === null || $scope.selectedState === undefined))
            return;
        $scope.groups = [];
        $scope.clonePlans = [];
        $scope.groupExpanded = true;
        $scope.loadingTitle = " Loading...";
        if (level === "company") {
            EmpActions.getPlanAssignments($scope.cloneToYearId, 0, 1, function (result) {
                $scope.nextYearCompanyPlans = result;
                if ($scope.nextYearCompanyPlans.length > 0)
                    alert("Plans are already assigned to next year " + $scope.cloneToYear);
                else {
                    $scope.showGroup = false;
                    $scope.showClonePlans = true;
                    EmpActions.getPlanAssignments($scope.cloneFromYearId, 0, 1, function (result) {
                        $scope.currentYearCompanyPlans = result;
                        angular.forEach($scope.currentYearCompanyPlans, function (companyPlan) {
                            if (companyPlan.active) {
                                for (var index = 0; index < $scope.nextYearPlans.length; index++) {
                                    if (companyPlan.ptoTypeTitle === $scope.nextYearPlans[index].ptoTypeTitle
                                        && companyPlan.ptoPlanTypeTitle === $scope.nextYearPlans[index].ptoPlanTypeTitle) {
                                        $scope.clonePlans.push($scope.nextYearPlans[index]);
                                        break;
                                    }
                                }
                            }
                        });
                        $modal.open(modalOptions);
                    });
                }
            });
        }
        else if (level === "state") {
            EmpActions.getPlanAssignments($scope.cloneToYearId, $scope.selectedState.id, 2, function (data) {
                $scope.nextYearStatePlans = [];
                angular.forEach(data, function (statePlan, index) {
                    if (statePlan.ptoPlanId > 0) {
                        $scope.nextYearStatePlans.push(statePlan);
                    }
                });
                if ($scope.nextYearStatePlans.length > 0)
                    alert("Plans are already assigned to next year " + $scope.cloneToYear);
                else {
                    $scope.showGroup = false;
                    $scope.showClonePlans = true;
                    EmpActions.getPlanAssignments($scope.cloneFromYearId, $scope.selectedState.id, 2, function (data) {
                        $scope.currentYearStatePlans = [];
                        angular.forEach(data, function (statePlan, index) {
                            if (statePlan.ptoPlanId > 0) {
                                $scope.currentYearStatePlans.push(statePlan);
                            }
                        });
                        angular.forEach($scope.currentYearStatePlans, function (statePlan, index) {
                            if (statePlan.active) {
                                for (var index = 0; index < $scope.nextYearPlans.length; index++) {
                                    if (statePlan.ptoTypeTitle === $scope.nextYearPlans[index].ptoTypeTitle
                                        && statePlan.ptoPlanTypeTitle === $scope.nextYearPlans[index].ptoPlanTypeTitle) {
                                        $scope.clonePlans.push($scope.nextYearPlans[index]);
                                        break;
                                    }
                                }
                            }
                        });
                        $modal.open(modalOptions);
                    });
                }
            });
        }
        else if (level === "county") {
            EmpActions.getPlanAssignments($scope.cloneToYearId, $scope.selectedState.id, 3, function (data) {
                $scope.nextYearCountys = [];

                angular.forEach(data, function (county, index) {
                    var found = false;
                    if (county.ptoPlanId > 0 && $scope.nextYearCountys.length > 0) {
                        for (var index = 0; index < $scope.nextYearCountys.length; index++) {
                            if ($scope.nextYearCountys[index].name === county.name) {
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            $scope.nextYearCountys.push(county);
                    }
                    else
                        $scope.nextYearCountys.push(county);
                });

                angular.forEach($scope.nextYearCountys, function (county, index) {
                    county.countyPlans = [];
                });

                angular.forEach(data, function (county, index) {
                    if (county.ptoPlanId > 0) {
                        angular.forEach($scope.nextYearCountys, function (countyPlan, index) {
                            if (countyPlan.name === county.name)
                                countyPlan.countyPlans.push(county);
                        });
                    }
                });
                var plansAssigned = false;
                for (index = 0; index < $scope.nextYearCountys.length; index++) {
                    if ($scope.nextYearCountys[index].countyPlans.length > 0) {
                        plansAssigned = true;
                        alert("Plans are already assigned to next year " + $scope.cloneToYear);
                        break;
                    }
                }
                if (!plansAssigned) {
                    $scope.showGroup = true;
                    $scope.showClonePlans = false;
                    EmpActions.getPlanAssignments($scope.cloneFromYearId, $scope.selectedState.id, 3, function (data) {
                        $scope.currentYearCountys = [];
                        angular.forEach(data, function (county, index) {
                            var found = false;
                            if (county.ptoPlanId > 0 && $scope.currentYearCountys.length > 0) {
                                for (var index = 0; index < $scope.currentYearCountys.length; index++) {
                                    if ($scope.currentYearCountys[index].name === county.name) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found)
                                    $scope.currentYearCountys.push(county);
                            }
                            else
                                $scope.currentYearCountys.push(county);
                        });

                        angular.forEach($scope.currentYearCountys, function (county, index) {
                            county.countyPlans = [];
                        });

                        angular.forEach(data, function (county, index) {
                            if (county.ptoPlanId > 0) {
                                angular.forEach($scope.currentYearCountys, function (countyPlan, index) {
                                    if (countyPlan.name === county.name)
                                        countyPlan.countyPlans.push(county);
                                });
                            }
                        });

                        angular.forEach($scope.currentYearCountys, function (county, index) {
                            if (county.countyPlans.length > 0) {
                                $scope.groups.push(county);
                            }
                        });
                        angular.forEach($scope.groups, function (group, index) {
                            group.clonePlans = [];
                            angular.forEach(group.countyPlans, function (countyPlan, index) {
                                if (countyPlan.active) {
                                    for (var index = 0; index < $scope.nextYearPlans.length; index++) {
                                        if (countyPlan.ptoTypeTitle === $scope.nextYearPlans[index].ptoTypeTitle
                                            && countyPlan.ptoPlanTypeTitle === $scope.nextYearPlans[index].ptoPlanTypeTitle) {
                                            group.clonePlans.push($scope.nextYearPlans[index]);
                                            break;
                                        }
                                    }
                                }
                            });
                        });
                        $modal.open(modalOptions);
                    });
                }
            });
        }
        else if (level === "city") {
            EmpActions.getPlanAssignments($scope.cloneToYearId, $scope.selectedState.id, 4, function (data) {
                $scope.nextYearCities = [];

                angular.forEach(data, function (city, index) {
                    var found = false;
                    if (city.ptoPlanId > 0 && $scope.nextYearCities.length > 0) {
                        for (var index = 0; index < $scope.nextYearCities.length; index++) {
                            if ($scope.nextYearCities[index].name === city.name) {
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            $scope.nextYearCities.push(city);
                    }
                    else
                        $scope.nextYearCities.push(city);
                });

                angular.forEach($scope.nextYearCities, function (city, index) {
                    city.cityPlans = [];
                });

                angular.forEach(data, function (city, index) {
                    if (city.ptoPlanId > 0) {
                        angular.forEach($scope.nextYearCities, function (cityPlan, index) {
                            if (cityPlan.name === city.name)
                                cityPlan.cityPlans.push(city);
                        });
                    }
                });
                var plansAssigned = false;
                for (index = 0; index < $scope.nextYearCities.length; index++) {
                    if ($scope.nextYearCities[index].cityPlans.length > 0) {
                        plansAssigned = true;
                        alert("Plans are already assigned to next year " + $scope.cloneToYear);
                        break;
                    }
                }
                if (!plansAssigned) {
                    $scope.showGroup = true;
                    $scope.showClonePlans = false;
                    EmpActions.getPlanAssignments($scope.cloneFromYearId, $scope.selectedState.id, 4, function (data) {
                        $scope.currentYearCities = [];

                        angular.forEach(data, function (city, index) {
                            var found = false;
                            if (city.ptoPlanId > 0 && $scope.currentYearCities.length > 0) {
                                for (var index = 0; index < $scope.currentYearCities.length; index++) {
                                    if ($scope.currentYearCities[index].name === city.name) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found)
                                    $scope.currentYearCities.push(city);
                            }
                            else
                                $scope.currentYearCities.push(city);
                        });

                        angular.forEach($scope.currentYearCities, function (city, index) {
                            city.cityPlans = [];
                        });

                        angular.forEach(data, function (city, index) {
                            if (city.ptoPlanId > 0) {
                                angular.forEach($scope.currentYearCities, function (cityPlan, index) {
                                    if (cityPlan.name === city.name)
                                        cityPlan.cityPlans.push(city);
                                });
                            }
                        });
                        angular.forEach($scope.currentYearCities, function (city, index) {
                            if (city.cityPlans.length > 0) {
                                $scope.groups.push(city);
                            }
                        });
                        angular.forEach($scope.groups, function (group, index) {
                            group.clonePlans = [];
                            angular.forEach(group.cityPlans, function (cityPlan, index) {
                                if (cityPlan.active) {
                                    for (var index = 0; index < $scope.nextYearPlans.length; index++) {
                                        if (cityPlan.ptoPlanTypeTitle === $scope.nextYearPlans[index].ptoPlanTypeTitle
                                            && cityPlan.ptoTypeTitle === $scope.nextYearPlans[index].ptoTypeTitle) {
                                            group.clonePlans.push($scope.nextYearPlans[index]);
                                            break;
                                        }
                                    }
                                }
                            });
                        });
                        $modal.open(modalOptions);
                    });
                }
            });
        }
        else if (level === "houseCode") {
            EmpActions.getPlanAssignments($scope.cloneToYearId, $scope.selectedState.id, 5, function (data) {
                $scope.nextYearHouseCodes = [];
                angular.forEach(data, function (houseCode, index) {
                    var found = false;
                    if (houseCode.ptoPlanId > 0 && $scope.nextYearHouseCodes.length > 0) {
                        for (var index = 0; index < $scope.nextYearHouseCodes.length; index++) {
                            if ($scope.nextYearHouseCodes[index].name === houseCode.name) {
                                found = true;
                                break;
                            }
                        }
                        if (!found)
                            $scope.nextYearHouseCodes.push(houseCode);
                    }
                    else
                        $scope.nextYearHouseCodes.push(houseCode);
                });

                angular.forEach($scope.nextYearHouseCodes, function (houseCode, index) {
                    houseCode.houseCodePlans = [];
                });

                angular.forEach(data, function (houseCode, index) {
                    if (houseCode.ptoPlanId > 0) {
                        angular.forEach($scope.nextYearHouseCodes, function (houseCodePlan, index) {
                            if (houseCodePlan.name === houseCode.name)
                                houseCodePlan.houseCodePlans.push(houseCode);
                        });
                    }

                });
                var plansAssigned = false;
                for (index = 0; index < $scope.nextYearHouseCodes.length; index++) {
                    if ($scope.selectedHouseCode === $scope.nextYearHouseCodes[index] && $scope.nextYearHouseCodes[index].houseCodePlans.length > 0) {
                        plansAssigned = true;
                        alert("Plans are already assigned to next year " + $scope.cloneToYear);
                    }
                }
                if (!plansAssigned) {
                    $scope.showGroup = true;
                    $scope.showClonePlans = false;
                    EmpActions.getPlanAssignments($scope.cloneFromYearId, $scope.selectedState.id, 5, function (data) {
                        $scope.currentYearHouseCodes = [];

                        angular.forEach(data, function (houseCode, index) {
                            var found = false;
                            if (houseCode.ptoPlanId > 0 && $scope.currentYearHouseCodes.length > 0) {
                                for (var index = 0; index < $scope.currentYearHouseCodes.length; index++) {
                                    if ($scope.currentYearHouseCodes[index].name === houseCode.name) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found)
                                    $scope.currentYearHouseCodes.push(houseCode);
                            }
                            else
                                $scope.currentYearHouseCodes.push(houseCode);
                        });

                        angular.forEach($scope.currentYearHouseCodes, function (houseCode, index) {
                            houseCode.houseCodePlans = [];
                        });

                        angular.forEach(data, function (houseCode, index) {
                            if (houseCode.ptoPlanId > 0) {
                                angular.forEach($scope.currentYearHouseCodes, function (houseCodePlan, index) {
                                    if (houseCodePlan.name === houseCode.name)
                                        houseCodePlan.houseCodePlans.push(houseCode);
                                });
                            }

                        });
                        angular.forEach($scope.currentYearHouseCodes, function (houseCode, index) {
                            if (houseCode.houseCodePlans.length > 0) {
                                $scope.groups.push(houseCode);
                            }
                        });
                        angular.forEach($scope.groups, function (group, index) {
                            group.clonePlans = [];
                            angular.forEach(group.houseCodePlans, function (houseCodePlan, index) {
                                if (houseCodePlan.active) {
                                    for (var index = 0; index < $scope.nextYearPlans.length; index++) {
                                        if (houseCodePlan.ptoTypeTitle === $scope.nextYearPlans[index].ptoTypeTitle
                                            && houseCodePlan.ptoPlanTypeTitle === $scope.nextYearPlans[index].ptoPlanTypeTitle) {
                                            group.clonePlans.push($scope.nextYearPlans[index]);
                                            break;
                                        }
                                    }
                                }
                            });
                        });
                        $modal.open(modalOptions);
                    });
                }
            });
        }
        $scope.levelSelected = level;
    };

    $scope.planSelected = function(item) {
        var disable = true;
		$scope.selectedPlan = item;

		for (var index = 0; index < $scope.plans.length; index++) {
			if ($scope.plans[index].isChecked) {
				disable = false;
				break;
			}
		}

        $scope.disableOk = disable;
    };

    $scope.countySelected = function(item) {
        $scope.selectedCounty = item;
        $scope.levelSelected = "county";
    }

    $scope.citySelected = function(item) {
        $scope.selectedCity = item;
        $scope.levelSelected = "city";
    }

    $scope.houseCodeSelected = function(item) {
        $scope.selectedHouseCode = item;
        $scope.levelSelected = "houseCode";
    }

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        $scope.levelSelected = "state";
    }

    $scope.countyPlanSelected = function(item) {
        $scope.selectedCountyPlan = item;
        $scope.levelSelected = "county";
    };

    $scope.cityPlanSelected = function(item) {
        $scope.selectedCityPlan = item;
        $scope.levelSelected = "city";
    };

	$scope.houseCodePlanSelected = function(item) {
        $scope.selectedHouseCodePlan = item;
        $scope.levelSelected = "houseCode";
    }

    $scope.onCompanyPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

	$scope.onStatePlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

	$scope.onCountyPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

	$scope.onCityPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.onHouseCodePlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.filterCountyPlans = function() {
        $scope.filtercountys = [];

        if ($scope.assignedCountys.length === $scope.countys.length) {
            angular.forEach($scope.countys, function(county, index) {
                if (county.countyPlans != null && county.countyPlans.length > 0) {
                    $scope.filtercountys.push(county);
                }
            });
            $scope.countys = $scope.filtercountys;
        }
        else
            $scope.countys = $scope.assignedCountys;
    };

    $scope.filterCityPlans = function() {
        $scope.filtercities = [];

        if ($scope.assignedCities.length === $scope.cities.length) {
            angular.forEach($scope.cities, function(city, index) {
                if (city.cityPlans != null && city.cityPlans.length > 0) {
                    $scope.filtercities.push(city);
                }
            });
            $scope.cities = $scope.filtercities;
        }
        else
            $scope.cities = $scope.assignedCities;
    };

    $scope.filterHouseCodePlans = function() {
        $scope.filterHouseCodes = [];

        if ($scope.assignedHouseCodes.length === $scope.houseCodes.length) {
            angular.forEach($scope.houseCodes, function(houseCode, index) {
                if (houseCode.houseCodePlans != null && houseCode.houseCodePlans.length > 0) {
                    $scope.filterHouseCodes.push(houseCode);
                }
            });
            $scope.houseCodes = $scope.filterHouseCodes;
        }
        else
            $scope.houseCodes = $scope.assignedHouseCodes;
    };

    $scope.expandCountyAll = function(expanded) {
        $scope.$broadcast('onExpandCountyAll', { countyExpanded: expanded });
    };

    $scope.expandCityAll = function(expanded) {
        $scope.$broadcast('onExpandCityAll', { cityExpanded: expanded });
    };

    $scope.expandHouseCodeAll = function(expanded) {
        $scope.$broadcast('onExpandHouseCodeAll', { houseCodeExpanded: expanded });
    };

    $scope.sortCountyBy = function(item) {
        return item.name;
    };

    $scope.sortCityBy = function(item) {
        return item.name;
    };
	
	$scope.sortHouseCodeBy = function(item) {
        return item.name;
    };
}])

.controller('modalInstanceCtrl', function($scope, $modalInstance) {
    $scope.ok = function() {
        if ($scope.closeDialog) {
            $modalInstance.close();
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});

pto.directive('expandcounty', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandCountyAll', function(event, args) {
                $scope.countyExpanded = args.countyExpanded;
            });
        }]
    };
})

pto.directive('expandcity', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandCityAll', function(event, args) {
                $scope.cityExpanded = args.cityExpanded;
            });
        }]
    };
})

pto.directive('expandhousecode', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandHouseCodeAll', function(event, args) {
                $scope.houseCodeExpanded = args.houseCodeExpanded;
            });
        }]
    };
})

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function($http, $filter, $rootScope) {
    var cache = {};
    var stateTypes = null;
	var ptoTypes = null;
	var ptoPlanTypes = null;
	var ptoPlans = null;

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
	    apiRequest('emp', 'iiCache', '<criteria>storeId:ptoYears,userId:[user]'
			+ ',</criteria>', function(xml) {
		    if (callback) {
		        callback(deserializeXml(xml, 'item', { upperFirstLetter: false }));
		    }
		});
	};

	var getPTOTypes = function(callback) {
        if (cache.ptoTypes) {
            callback(cache.ptoTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoTypes,userId:[user]'
			+ ',</criteria>', function(xml) {
			if (callback) {
			   cache.ptoTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
			   callback(cache.ptoTypes);
			}
		});
    };

	var getPTOPlanTypes = function(callback) {
        if (cache.ptoPlanTypes) {
            callback(cache.ptoPlanTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanTypes,userId:[user]'
           + ',active:' + 0
           + ',</criteria>', function(xml) {
           if (callback) {
               cache.ptoPlanTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
               callback(cache.ptoPlanTypes);
           }
       });
    };

    var getPTOPlans = function(ptoYearId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlans,userId:[user]'
			+ ',houseCodeId:' + 0
			+ ',ptoYearId:' + ptoYearId
			+ ',active:' + 1
			+ ',</criteria>', function(xml) {
			if (callback) {
			    cache.ptoPlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'houseCodeId', 'ptoYear', 'ptoType', 'ptoPlanType'] });
			   	callback(cache.ptoPlans);
			}
		});
    };

	var getPlanAssignments = function(ptoYearId, stateId, groupType, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYearId:' + ptoYearId
           + ',stateType:' + stateId
           + ',groupType:' + groupType
           + ',</criteria>', function(xml) {
           if (callback) {
               callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'ptoYearId', 'houseCodeId', 'ptoPlanId'], boolItems: ['active'] }));
           }
       });
    };

	var actionSaveItem = function($scope, plans, callback) {
        var xml = "";

		for (var index = 0; index < plans.length; index++) {
			if (plans[index].id === 0 ||  plans[index].modified) {
				xml += '<ptoPlanAssignment';
				xml += ' id="' + plans[index].id + '"';
				xml += ' ptoYearId="' + plans[index].ptoYearId + '"';
				xml += ' stateType="' + plans[index].stateType + '"';
				xml += ' houseCodeId="' + plans[index].houseCodeId + '"';
				xml += ' ptoPlanId="' + plans[index].ptoPlanId + '"';
				xml += ' groupType="' + plans[index].groupType + '"';
				xml += ' name="' + plans[index].name + '"';
				xml += ' active="' + plans[index].active + '"';
				xml += '/>';
			}
		}

		if (xml === "")
			return;
		xml = '<transaction id="1">' + xml + '</transaction>';
		console.log(xml)
		var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
		setStatus("Saving");
		$scope.loadingTitle = " Saving...";
		$scope.pageLoading = true;
		transactionMonitor($scope, data, callback);
     };

    var actionDeleteItem = function($scope, id, callback) {
        var xml = '<transaction id="' + id + '"><ptoPlanAssignmentDelete id="' + id + '" /></transaction>';
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
		console.log(xml)
		$scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
		setStatus("Saving");
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function(data, status) {
            if (callback)
                callback(data, status);
        });
    };
	
    var transactionMonitor = function($scope, data, callback) {
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function(data, status, xhr) {
            var transactionNode = $(xhr.responseXML).find("transaction")[0];

            if (transactionNode !== undefined) {
                if ($(transactionNode).attr("status") === "success") {
                    $(transactionNode).find("*").each(function() {
						if (this.tagName === "empPTOPlanAssignment") {
                         	var id = parseInt($(this).attr("id"), 10);
                            actionUpdateItem($scope, id);
                        }
                    });

                    if (callback)
                        callback(data, status);
                }
                else {
                    status = "error";
                    if (callback)
                        callback(data, status, $(transactionNode).attr("error"));
                }
            }
            else {
                var transmissionNode = $(xhr.responseXML).find("transmission")[0];
                if (transmissionNode !== undefined && $(transmissionNode).attr("Error") !== "") {
                    status = "error";
                    if (callback)
                        callback(data, status, $(transmissionNode).attr("Error"));
                }
            }
        });
    };
	
	var actionUpdateItem = function($scope, id) {
        if ($scope.levelSelected === "company") {
            for (var index = 0; index < $scope.companyPlans.length; index++) {
                if ($scope.companyPlans[index].modified) {
                    if ($scope.companyPlans[index].id === 0)
                        $scope.companyPlans[index].id = id;
                    $scope.companyPlans[index].modified = false;
                    break;
                }
            }
        }
        else if ($scope.levelSelected === "state") {
            for (var index = 0; index < $scope.statePlans.length; index++) {
                if ($scope.statePlans[index].modified) {
                    if ($scope.statePlans[index].id === 0)
                        $scope.statePlans[index].id = id;
                    $scope.statePlans[index].modified = false;
                    break;
                }
            }
        }
        else if ($scope.levelSelected === "county") {
			outerLoop:
			for (var index = 0; index < $scope.countys.length; index++) {
				for (var iIndex = 0; iIndex < $scope.countys[index].countyPlans.length; iIndex++) {
                    if ($scope.countys[index].countyPlans[iIndex].modified) {
                        if ($scope.countys[index].countyPlans[iIndex].id === 0)
                            $scope.countys[index].countyPlans[iIndex].id = id;
                        $scope.countys[index].countyPlans[iIndex].modified = false;
                        break outerLoop;
                    }
                }
			}
        }
        else if ($scope.levelSelected === "city") {
			outerLoop:
			for (var index = 0; index < $scope.cities.length; index++) {
				for (var iIndex = 0; iIndex < $scope.cities[index].cityPlans.length; iIndex++) {
					if ($scope.cities[index].cityPlans[iIndex].modified) {
                        if ($scope.cities[index].cityPlans[iIndex].id === 0)
                            $scope.cities[index].cityPlans[iIndex].id = id;
                        $scope.cities[index].cityPlans[iIndex].modified = false;
                        break outerLoop;
                    }
				}
			}
        }
        else if ($scope.levelSelected === "houseCode") {
			outerLoop:
			for (var index = 0; index < $scope.houseCodes.length; index++) {
				for (var iIndex = 0; iIndex < $scope.houseCodes[index].houseCodePlans.length; iIndex++) {
					if ($scope.houseCodes[index].houseCodePlans[iIndex].modified) {
                        if ($scope.houseCodes[index].houseCodePlans[iIndex].id === 0)
                            $scope.houseCodes[index].houseCodePlans[iIndex].id = id;
                        $scope.houseCodes[index].houseCodePlans[iIndex].modified = false;
                        break outerLoop;
                    }
				}
			}
        }
    };

    return {
		getStateTypes: getStateTypes,
        getPTOYears: getPTOYears,
		getPTOTypes: getPTOTypes,
		getPTOPlanTypes: getPTOPlanTypes,
		getPTOPlans: getPTOPlans,
        getPlanAssignments: getPlanAssignments,
        actionDeleteItem: actionDeleteItem,
		actionSaveItem: actionSaveItem,
		actionUpdateItem: actionUpdateItem,
		transactionMonitor: transactionMonitor
    }
}]);
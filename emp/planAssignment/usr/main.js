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

var dirtyCheck = function () {
    if (parent.fin.appUI != undefined && parent.fin.appUI.modified) {
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

var editStatus = function () {
    return !dirtyCheck();
};

var checkStatus = function () {
    var me = this;

    if (top.ii !== undefined) {
        if (top.ui.ctl.menu) {
            top.ui.ctl.menu.Dom.me.registerDirtyCheck(editStatus, me);
        }
    }
};

var modified = function (isModified) {
    parent.fin.appUI.modified = isModified;
};

var levelSelected = "";

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
	$scope.companyPlans = [];
	$scope.statePlans = [];
    $scope.countyPlans = [];
	$scope.cityPlans = [];
    $scope.countys = [];
	$scope.cities = [];
	$scope.houseCodes = [];
    $scope.countyTypes = [];
    $scope.cityTypes = [];
    $scope.selectedState = null;
    $scope.showStateGrid = false;
    $scope.showCompanyGrid = true;
    $scope.pageLoading = false;
    $scope.loadingTitle = " Loading...";
    $scope.disableOk = true;
    $scope.isPageLoading = function() {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    setStatus("Loading");
    modified(false);
    checkStatus();

    EmpActions.getPTOTypes(function(result) {
    });
	
    EmpActions.getPTOPlanTypes(function(result) {
    });

    EmpActions.getPTOYears(function (result) {
        $scope.ptoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
        }
        EmpActions.getPTOPlans($scope.ptoYear, function (result) {
            $scope.plans = result;
        });
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function (result) {
            $scope.companyPlans = result;
            angular.forEach($scope.companyPlans, function (plan) {
            });
            $scope.pageLoading = false;
            setStatus("Normal");
        });
    });

    $scope.onLevelChange = function (level) {
        $scope.disableOk = true;
        if (level == "state") {
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
        else if (level == "company") {
            if (editStatus())
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showCompanyGrid = true;
            $scope.showStateGrid = false;
			setStatus("Loading");
            EmpActions.getPTOPlans($scope.ptoYear, function(result) {
                $scope.plans = result;
            });
            EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function(result) {
                $scope.companyPlans = result;
                $scope.pageLoading = false;
                setStatus("Normal");
            });
        }
    };

    $scope.companyPlanSelected = function(item) {
        $scope.selectedCompanyPlan = item;
        levelSelected = "company";
    };

    $scope.search = function () {
        $scope.pageLoading = true;
        setStatus("Loading");
        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
        });
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function (result) {
            $scope.companyPlans = result;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
        $scope.selectedState = null;
        $scope.statePlans = [];
        $scope.countys = [];
        $scope.cities = [];
        $scope.houseCodes = [];
    };

    $scope.getPlanName = function(planId) {
        return EmpActions.getPlanName(planId);
    }

    $scope.getPTOTypeName = function(planId) {
        return EmpActions.getPTOTypeName(planId);
    };

    $scope.getPTOPlanTypeName = function(planId) {
        return EmpActions.getPTOPlanTypeName(planId);
    };

    $scope.getPlanPTOTypeName = function(planId) {
        return EmpActions.getPlanPTOTypeName(planId);
    };

    $scope.getPlanPTOPlanTypeName = function(planId) {
        return EmpActions.getPlanPTOPlanTypeName(planId);
    };

    $scope.stateSelected = function(item) {
        $scope.loadingTitle = " Loading...";
        $scope.pageLoading = true;
        $scope.selectedState = item;
        $scope.state = item.name;
        $scope.showCompany = false;
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

        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 2, function(result) {
            $scope.statePlans = result;
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 3, function (result) {
            $scope.selectedCountys = result;
            $scope.countys = [];

            angular.forEach($scope.selectedCountys, function(county, index) {
                var similarCounty = false;
                if (county.ptoPlanId > 0) {
                    if ($scope.countys.length >= 1) {
                        angular.forEach($scope.countys, function(planCounty, index) {
                            if (planCounty.name == county.name)
                                similarCounty = true;
                        });
                        if (!similarCounty)
                            $scope.countys.push(county);
                    }
                    else
                        $scope.countys.push(county);
                }
                else if (county.ptoPlanId == 0)
                    $scope.countys.push(county);

            });

            angular.forEach($scope.countys, function(county, index) {
                county.countyPlans = [];
            });

            angular.forEach($scope.selectedCountys, function(selectedCounty, index) {
                if (selectedCounty.ptoPlanId > 0) {
                    angular.forEach($scope.countys, function(planCounty, index) {
                        if (planCounty.name == selectedCounty.name)
                            planCounty.countyPlans.push(selectedCounty);
                    });
                }
                
            });
            $scope.assignedCountys = $scope.countys;
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 4, function (result) {
            $scope.selectedCities = result;
            $scope.cities = [];

            angular.forEach($scope.selectedCities, function(city, index) {
                var similarCity = false;
                if (city.ptoPlanId > 0) {
                    if ($scope.cities.length >= 1) {
                        angular.forEach($scope.cities, function(planCity, index) {
                            if (planCity.name == city.name)
                                similarCity = true;
                        });
                        if (!similarCity)
                            $scope.cities.push(city);
                    }
                    else
                        $scope.cities.push(city);
                }
                else if (city.ptoPlanId == 0)
                    $scope.cities.push(city);

            });

            angular.forEach($scope.selectedCities, function(city, index) {
                city.cityPlans = [];
            });

            angular.forEach($scope.selectedCities, function(selectedCity, index) {
                if (selectedCity.ptoPlanId > 0) {
                    angular.forEach($scope.cities, function(planCity, index) {
                        if (planCity.name == selectedCity.name)
                            planCity.cityPlans.push(selectedCity);
                    });
                }

            });
            $scope.assignedCities = $scope.cities;
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 5, function (result) {
            $scope.selectedHouseCodes = result;
            $scope.pageLoading = false;
            $scope.houseCodes = [];

            angular.forEach($scope.selectedHouseCodes, function(houseCode, index) {
                var similarHouseCode = false;
                if (houseCode.ptoPlanId > 0) {
                    if ($scope.houseCodes.length >= 1) {
                        angular.forEach($scope.houseCodes, function(planHouseCode, index) {
                            if (planHouseCode.name == houseCode.name)
                                similarHouseCode = true;
                        });
                        if (!similarHouseCode)
                            $scope.houseCodes.push(houseCode);
                    }
                    else
                        $scope.houseCodes.push(houseCode);
                }
                else if (houseCode.ptoPlanId == 0)
                    $scope.houseCodes.push(houseCode);
            });

            angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
                houseCode.houseCodePlans = [];
            });

            angular.forEach($scope.selectedHouseCodes, function (selectedHouseCode, index) {
                if (selectedHouseCode.ptoPlanId > 0) {
                    angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                        if (planHouseCode.name == selectedHouseCode.name)
                            planHouseCode.houseCodePlans.push(selectedHouseCode);
                    });
                }
                setStatus("Normal");
            });
            $scope.assignedHouseCodes = $scope.houseCodes;
        });
    };

    $scope.removeStatePlan = function () {
        if ($scope.selectedStatePlan === undefined || $scope.selectedStatePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedStatePlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
		setStatus("Saving");

        EmpActions.deletePlan($scope.selectedStatePlan.id, function (result) {
            for (var index = 0; index < $scope.statePlans.length; index++) {
                if ($scope.statePlans[index].id === $scope.selectedStatePlan.id) {
                    $scope.statePlans.splice(index, 1);
                    $scope.selectedStatePlan = null;
                    break;
                }
            }
            $scope.$apply(function () {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeCompanyPlan = function() {
		if ($scope.selectedCompanyPlan === undefined || $scope.selectedCompanyPlan === null)
			return;

		if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCompanyPlan.ptoPlanId) + "]?"))
			return;

        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
		setStatus("Saving");

        EmpActions.deletePlan($scope.selectedCompanyPlan.id, function (data, status) {
			for (var index = 0; index < $scope.companyPlans.length; index++) {
				if ($scope.companyPlans[index].id === $scope.selectedCompanyPlan.id) {
					$scope.companyPlans.splice(index, 1);
					$scope.selectedCompanyPlan = null;
					break;
				}
			}
            $scope.$apply(function () {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
    };

    $scope.removeCountyPlan = function () {
        if ($scope.selectedCountyPlan === undefined || $scope.selectedCountyPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCountyPlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
		setStatus("Saving");

        EmpActions.deletePlan($scope.selectedCountyPlan.id, function (result) {
            angular.forEach($scope.countys, function (county, index) {
                for (var index = 0; index < county.countyPlans.length; index++) {
                    if ($scope.selectedCountyPlan !== null && county.countyPlans[index].id === $scope.selectedCountyPlan.id) {
                        county.countyPlans.splice(index, 1);
                        $scope.selectedCountyPlan = null;
                        break;
                    }
                }
                $scope.$apply(function () {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        });
    };

    $scope.removeCityPlan = function () {
        if ($scope.selectedCityPlan === undefined || $scope.selectedCityPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCityPlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
	    setStatus("Saving");

        EmpActions.deletePlan($scope.selectedCityPlan.id, function (result) {
            angular.forEach($scope.cities, function (city, index) {
                for (var index = 0; index < city.cityPlans.length; index++) {
                    if ($scope.selectedCityPlan !== null && city.cityPlans[index].id === $scope.selectedCityPlan.id) {
                        city.cityPlans.splice(index, 1);
                        $scope.selectedCityPlan = null;
                        break;
                    }
                }
                $scope.$apply(function () {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        });
    };

    $scope.removeHouseCodePlan = function () {
        if ($scope.selectedHouseCodePlan === undefined || $scope.selectedHouseCodePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedHouseCodePlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
	    setStatus("Saving");

        EmpActions.deletePlan($scope.selectedHouseCodePlan.id, function (result) {
            angular.forEach($scope.houseCodes, function (houseCode, index) {
                for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                    if ($scope.selectedHouseCodePlan !== null && houseCode.houseCodePlans[index].id === $scope.selectedHouseCodePlan.id) {
                        houseCode.houseCodePlans.splice(index, 1);
                        $scope.selectedHouseCodePlan = null;
                        break;
                    }
                }
                $scope.$apply(function () {
                    $scope.pageLoading = false;
					setStatus("Saved");
                });
            });
        });
    };

    $scope.addPlan = function (level) {
        $scope.disableOk = true;
        EmpActions.getPTOPlans($scope.ptoYear, function (result) {
            var plans = result;
            $scope.plans = [];
            if (level == "company") {
                $scope.modalPlans = [];
                angular.forEach(plans, function (plan, index) {
                    var foundCompanyPlan = false;
                    angular.forEach($scope.companyPlans, function (companyPlan, index) {
                        if (companyPlan.ptoPlanId == plan.id) {
                            foundCompanyPlan = true;
                        }
                    });
                    if (!foundCompanyPlan) {
                        if ($scope.modalPlans.length > 0) {
                            var similarModalPlan = false;
                            angular.forEach($scope.modalPlans, function (modalPlan, index) {
                                if (plan.ptoType == modalPlan.ptoType && plan.ptoPlanType == modalPlan.ptoPlanType) {
                                    similarModalPlan = true;
                                }
                            });
                            if (!similarModalPlan) {
                                $scope.modalPlans.push(plan);
                            }
                        }
                        else {
                            $scope.modalPlans.push(plan);
                        }
                    }
                });
                $scope.plans = $scope.modalPlans;

                var ptoModalInstance = $modal.open({
                    templateUrl: 'planGrid.html',
                    controller: 'modalInstanceCtrl',
                    title: "Select Plan",
                    size: 'sm',
                    scope: $scope
                });
            }
            else if (level == "state") {
                $scope.modalPlans = [];
                angular.forEach(plans, function (plan, index) {
                    var foundStatePlan = false;
                    angular.forEach($scope.statePlans, function (statePlan, index) {
                        if (statePlan.ptoPlanId == plan.id) {
                            foundStatePlan = true;
                        }
                    });
                    if (!foundStatePlan) {
                        if ($scope.modalPlans.length > 0) {
                            var similarModalPlan = false;
                            angular.forEach($scope.modalPlans, function (modalPlan, index) {
                                if (plan.ptoType == modalPlan.ptoType && plan.ptoPlanType == modalPlan.ptoPlanType) {
                                    similarModalPlan = true;
                                }
                            });
                            if (!similarModalPlan) {
                                $scope.modalPlans.push(plan);
                            }
                        }
                        else {
                            $scope.modalPlans.push(plan);
                        }
                    }
                });
                $scope.plans = $scope.modalPlans;

                var ptoModalInstance = $modal.open({
                    templateUrl: 'planGrid.html',
                    controller: 'modalInstanceCtrl',
                    title: "Select Plan",
                    size: 'sm',
                    scope: $scope
                });
            }
            else if (level == "city") {
                if ($scope.selectedCity === undefined || $scope.selectedCity === null)
                    return;
                $scope.modalPlans = [];
                angular.forEach(plans, function (plan, index) {
                    var foundCityPlan = false;
                    angular.forEach($scope.cities, function (city) {
                        if (city.id === $scope.selectedCity.id) {
                            angular.forEach(city.cityPlans, function (cityPlan) {
                                if (cityPlan.ptoPlanId == plan.id) {
                                    foundCityPlan = true;
                                }
                            });
                        }
                    });
                    if (!foundCityPlan) {
                        if ($scope.modalPlans.length > 0) {
                            var similarModalPlan = false;
                            angular.forEach($scope.modalPlans, function (modalPlan, index) {
                                if (plan.ptoType == modalPlan.ptoType && plan.ptoPlanType == modalPlan.ptoPlanType) {
                                    similarModalPlan = true;
                                }
                            });
                            if (!similarModalPlan) {
                                $scope.modalPlans.push(plan);
                            }
                        }
                        else {
                            $scope.modalPlans.push(plan);
                        }
                    }
                });
                $scope.plans = $scope.modalPlans;

                var ptoModalInstance = $modal.open({
                    templateUrl: 'planGrid.html',
                    controller: 'modalInstanceCtrl',
                    title: "Select Plan",
                    size: 'sm',
                    scope: $scope
                });
            }
            else if (level == "houseCode") {
                if ($scope.selectedHouseCode === undefined || $scope.selectedHouseCode === null)
                    return;

                $scope.modalPlans = [];
                angular.forEach(plans, function (plan, index) {
                    var foundHouseCodePlan = false;
                    angular.forEach($scope.houseCodes, function (houseCode) {
                        if (houseCode.id === $scope.selectedHouseCode.id) {
                            angular.forEach(houseCode.houseCodePlans, function (houseCodePlan) {
                                if (houseCodePlan.ptoPlanId == plan.id) {
                                    foundHouseCodePlan = true;
                                }
                            });
                        }
                    });
                    if (!foundHouseCodePlan) {
                        $scope.modalPlans.push(plan);
                    }
                });
                $scope.plans = $scope.modalPlans;

                var ptoModalInstance = $modal.open({
                    templateUrl: 'planGrid.html',
                    controller: 'modalInstanceCtrl',
                    title: "Select Plan",
                    size: 'sm',
                    scope: $scope
                });
            }
            else if (level == "county") {
                if ($scope.selectedCounty === undefined || $scope.selectedCounty === null)
                    return;

                $scope.modalPlans = [];
                angular.forEach($scope.plans, function (plan, index) {
                    var foundCountyPlan = false;
                    angular.forEach($scope.countys, function (county) {
                        if (county.id === $scope.selectedCounty.id) {
                            angular.forEach(county.countyPlans, function (countyPlan) {
                                if (countyPlan.ptoPlanId == plan.id) {
                                    foundCountyPlan = true;
                                }
                            });
                        }
                    });
                    if (!foundCountyPlan) {
                        if ($scope.modalPlans.length > 0) {
                            var similarModalPlan = false;
                            angular.forEach($scope.modalPlans, function (modalPlan, index) {
                                if (plan.ptoType == modalPlan.ptoType && plan.ptoPlanType == modalPlan.ptoPlanType) {
                                    similarModalPlan = true;
                                }
                            });
                            if (!similarModalPlan) {
                                $scope.modalPlans.push(plan);
                            }
                        }
                        else {
                            $scope.modalPlans.push(plan);
                        }
                    }
                });
                $scope.plans = $scope.modalPlans;

                var ptoModalInstance = $modal.open({
                    templateUrl: 'planGrid.html',
                    controller: 'modalInstanceCtrl',
                    title: "Select Plan",
                    size: 'sm',
                    scope: $scope
                });
            }
        });
        levelSelected = level;
    };

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        levelSelected = "state";
    };

    $scope.saveCompanyPlans = function() {
		setStatus("Saving");
		EmpActions.actionSaveItem($scope, $scope.companyPlans, function(data, status) {
			$scope.$apply(function () {
				$scope.pageLoading = false;
			   	setStatus("Saved");
            });
		});
		modified(false);
    };

    $scope.saveStatePlans = function () {
		setStatus("Saving");
        EmpActions.actionSaveItem($scope, $scope.statePlans, function (data, status) {
            $scope.$apply(function () {
                $scope.pageLoading = false;
				setStatus("Saved");
            });
        });
        modified(false);
    };

    $scope.saveCountyPlans = function () {
		setStatus("Saving");
        angular.forEach($scope.countys, function(county, index) {
            for (var index = 0; index < county.countyPlans.length; index++) {
                    EmpActions.actionSaveItem($scope, county.countyPlans, function (data, status) {
                        $scope.$apply(function () {
                            $scope.pageLoading = false;
							setStatus("Saved");
                        });
                    });
            }
        });
        modified(false);
    };

    $scope.saveCityPlans = function() {
	    setStatus("Saving");
        angular.forEach($scope.cities, function(city, index) {
            for (var index = 0; index < city.cityPlans.length; index++) {
                    EmpActions.actionSaveItem($scope, city.cityPlans, function (data, status) {
                        $scope.$apply(function () {
                            $scope.pageLoading = false;
							setStatus("Saved");
                        });
                    });
            }
        });
        modified(false);
    };

	$scope.saveHouseCodePlans = function() {
	    setStatus("Saving");
        angular.forEach($scope.houseCodes, function(houseCode, index) {
            for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                    EmpActions.actionSaveItem($scope, houseCode.houseCodePlans, function (data, status) {
                        $scope.$apply(function () {
                            $scope.pageLoading = false;
							setStatus("Saved");
                        });
                    });
                }
        });
        modified(false);
    };

    $scope.addSelectedPlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
		setStatus("Saving");
        if (levelSelected == "company") {
            var found = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.companyPlans, function (companyPlan) {
                        if (EmpActions.getPTOTypeName(companyPlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                            && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(companyPlan.ptoPlanId)) {
                            found = true;
                            alert("Plan with PTO Type: [" + EmpActions.getPTOTypeName(companyPlan.ptoPlanId) + "] and Plan Type: [" + EmpActions.getPTOPlanTypeName(companyPlan.ptoPlanId) + "] is already exists.");
                            $scope.pageLoading = false;
                        }
                    });
                }
            }

            if (!found) {
                for (var index = 0; index < $scope.plans.length; index++) {
                    if ($scope.plans[index].isChecked) {
                        var item = {};
                        item["id"] = 0;
                        item["ptoYearId"] = $scope.ptoYear;
                        item["stateType"] = 0;
                        item["houseCodeId"] = $scope.plans[index].houseCodeId;
                        item["ptoPlanId"] = $scope.plans[index].id;
                        item["groupType"] = 1;
                        item["name"] = "";
                        item["active"] = true;
                        item["modified"] = true;
                        $scope.companyPlans.push(item);
                    }
                }

                EmpActions.actionSaveItem($scope, $scope.companyPlans, function (data, status) {
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
						setStatus("Saved");
                    });
                });
            }
        }
        else if (levelSelected == "state") {
            var found = false;

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.statePlans, function (statePlan) {
                        if (EmpActions.getPTOTypeName(statePlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                            && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(statePlan.ptoPlanId)) {
                            found = true;
                            alert("Plan with PTO Type:" + EmpActions.getPTOTypeName(statePlan.ptoPlanId) + " and Plan Type:" + EmpActions.getPTOPlanTypeName(statePlan.ptoPlanId) + " is already exists.");
                            $scope.pageLoading = false;
                        }
                    });
                }
            }

            if (!found) {
                for (var index = 0; index < $scope.plans.length; index++) {
                    if ($scope.plans[index].isChecked) {
                        var item = {};
                        item["id"] = 0;
                        item["ptoYearId"] = $scope.ptoYear;
                        item["stateType"] = $scope.selectedState.id;
                        item["houseCodeId"] = $scope.plans[index].houseCodeId;
                        item["ptoPlanId"] = $scope.plans[index].id;
                        item["groupType"] = 2;
                        item["name"] = $scope.selectedState.name;
                        item["active"] = true;
                        item["modified"] = true;
                        $scope.statePlans.push(item);
                    }
                }

                EmpActions.actionSaveItem($scope, $scope.statePlans, function (data, status) {
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
						setStatus("Saved");
                    });
                });
            }
        }
        else if (levelSelected == "county") {
            var found = false;

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.countys, function (county) {
                        if (county.id === $scope.selectedCounty.id) {
                            angular.forEach(county.countyPlans, function (countyPlan) {
                                if (EmpActions.getPTOTypeName(countyPlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                                    && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(countyPlan.ptoPlanId)) {
                                    found = true;
                                    alert("Plan with PTO Type:" + EmpActions.getPTOTypeName(countyPlan.ptoPlanId) + " and Plan Type:" + EmpActions.getPTOPlanTypeName(countyPlan.ptoPlanId) + " is already exists.");
                                    $scope.pageLoading = false;
                                }
                            });
                        }
                    });
                }
            }

            if (!found) {
                angular.forEach($scope.countys, function (county, index) {
                    if (county.name == $scope.selectedCounty.name) {
                        for (var index = 0; index < $scope.plans.length; index++) {
                            if ($scope.plans[index].isChecked) {
                                var item = {};
                                item["id"] = 0;
                                item["ptoYearId"] = $scope.ptoYear;
                                item["stateType"] = $scope.selectedState.id;
                                item["houseCodeId"] = $scope.plans[index].houseCodeId;
                                item["ptoPlanId"] = $scope.plans[index].id;
                                item["groupType"] = 3;
                                item["name"] = $scope.selectedCounty.name;
                                item["active"] = true;
                                item["modified"] = true;
                                county.countyPlans.push(item);
                            }
                        }

                        EmpActions.actionSaveItem($scope, county.countyPlans, function (data, status) {
                            $scope.$apply(function () {
                                $scope.pageLoading = false;
								setStatus("Saved");
                            });
                        });
                    }
                });
            }
        }
        else if (levelSelected == "city") {
            var found = false;

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.cities, function (city) {
                        if (city.id === $scope.selectedCity.id) {
                            angular.forEach(city.cityPlans, function (cityPlan) {
                                if (EmpActions.getPTOTypeName(cityPlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                                    && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(cityPlan.ptoPlanId)) {
                                    similarPlan = true;
                                    alert("Plan with PTO Type: [" + EmpActions.getPTOTypeName(cityPlan.ptoPlanId) + "] and Plan Type: [" + EmpActions.getPTOPlanTypeName(cityPlan.ptoPlanId) + "] is already exists.");
                                    $scope.pageLoading = false;
                                }
                            });
                        }
                    });
                }
            }

            if (!found) {
                angular.forEach($scope.cities, function (city, index) {
                    if (city.name == $scope.selectedCity.name) {
                        for (var index = 0; index < $scope.plans.length; index++) {
                            if ($scope.plans[index].isChecked) {
                                var item = {};
                                item["id"] = 0;
                                item["ptoYearId"] = $scope.ptoYear;
                                item["stateType"] = $scope.selectedState.id;
                                item["houseCodeId"] = $scope.plans[index].houseCodeId;
                                item["ptoPlanId"] = $scope.plans[index].id;
                                item["groupType"] = 4;
                                item["name"] = $scope.selectedCity.name;
                                item["active"] = true;
                                item["modified"] = true;
                                city.cityPlans.push(item);
                            }
                        }

                        EmpActions.actionSaveItem($scope, city.cityPlans, function (data, status) {
                            $scope.$apply(function () {
                                $scope.pageLoading = false;
								setStatus("Saved");
                            });
                        });
                    }
                });
            }
        }
        else if (levelSelected == "houseCode") {
            var found = false;

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {

                    angular.forEach($scope.houseCodes, function (houseCode) {
                        if (houseCode.id === $scope.selectedHouseCode.id) {
                            angular.forEach(houseCode.houseCodePlans, function (houseCodePlan) {
                                if (EmpActions.getPTOTypeName(houseCodePlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                                    && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(houseCodePlan.ptoPlanId)) {
                                    similarPlan = true;
                                    alert("Plan with PTO Type:" + EmpActions.getPTOTypeName(houseCodePlan.ptoPlanId) + " and Plan Type:" + EmpActions.getPTOPlanTypeName(houseCodePlan.ptoPlanId) + " is already exists.");
                                    $scope.pageLoading = false;
                                }
                            });
                        }
                    });
                }
            }

            if (!found) {
                angular.forEach($scope.houseCodes, function (houseCode, index) {
                    if (houseCode.name == $scope.selectedHouseCode.name) {
                        for (var index = 0; index < $scope.plans.length; index++) {
                            if ($scope.plans[index].isChecked) {
                                var item = {};
                                item["id"] = 0;
                                item["ptoYearId"] = $scope.ptoYear;
                                item["stateType"] = $scope.selectedState.id;
                                item["houseCodeId"] = $scope.plans[index].houseCodeId;
                                item["ptoPlanId"] = $scope.plans[index].id;
                                item["groupType"] = 5;
                                item["name"] = $scope.selectedHouseCode.name;
                                item["active"] = true;
                                item["modified"] = true;
                                houseCode.houseCodePlans.push(item);
                            }
                        }

                        EmpActions.actionSaveItem($scope, houseCode.houseCodePlans, function (data, status) {
                            $scope.$apply(function () {
                                $scope.pageLoading = false;
								setStatus("Saved");
                            });
                        });
                    }
                });
            }
        }
    };

    $scope.planSelected = function (item) {
        $scope.selectedPlan = item;
        var disable = true;
        angular.forEach($scope.plans, function (plan, index) {
            if (plan.isChecked)
                disable = false;
        });
        $scope.disableOk = disable;
    };

    $scope.countyPlanSelected = function (item) {
        $scope.selectedCountyPlan = item;
        levelSelected = "county";
    };

    $scope.countySelected = function(item) {
        $scope.selectedCounty = item;
        levelSelected = "county";
    }

    $scope.cityPlanSelected = function(item) {
        $scope.selectedCityPlan = item;
        levelSelected = "city";
    }

    $scope.citySelected = function(item) {
        $scope.selectedCity = item;
        levelSelected = "city";
    }

    $scope.houseCodeSelected = function(item) {
        $scope.selectedHouseCode = item;
        levelSelected = "houseCode";
    }

    $scope.houseCodePlanSelected = function(item) {
        $scope.selectedHouseCodePlan = item;
        levelSelected = "houseCode";
    }

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        levelSelected = "state";
    }

    $scope.countyPlanSelected = function(countyPlan) {
        $scope.selectedCountyPlan = countyPlan;
        levelSelected = "county";
    };

    $scope.cityPlanSelected = function(cityPlan) {
        $scope.selectedCityPlan = cityPlan;
        levelSelected = "city";
    };

    $scope.onCompanyPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.onHouseCodePlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.onCityPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.onCountyPlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.onStatePlanChanged = function($event, plan) {
        plan.modified = true;
        setStatus("Edit");
        modified(true);
    };

    $scope.filterCountyPlans = function () {
        $scope.filtercountys = [];
        if ($scope.assignedCountys.length == $scope.countys.length) {
            angular.forEach($scope.countys, function (county, index) {
                if (county.countyPlans != null && county.countyPlans.length > 0) {
                    $scope.filtercountys.push(county);
                }
            });
            $scope.countys = $scope.filtercountys;
        }
        else
            $scope.countys = $scope.assignedCountys;
    };

    $scope.filterCityPlans = function () {
        $scope.filtercities = [];
        if ($scope.assignedCities.length == $scope.cities.length) {
            angular.forEach($scope.cities, function (city, index) {
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
        if ($scope.assignedHouseCodes.length == $scope.houseCodes.length) {
            angular.forEach($scope.houseCodes, function (houseCode, index) {
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

    $scope.sortHouseCodeBy = function(item) {
        return item.name;
    };

    $scope.sortCityBy = function(item) {
        return item.name;
    };
}])

.controller('modalInstanceCtrl', function($scope, $modalInstance) {
    $scope.ok = function() {
        $modalInstance.close();
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
	var ptoYears = null;
	var ptoTypes = null;
	var ptoPlanTypes = null;
	var ptoPlans = null;
    var countyTypes = null;
    var cityTypes = null;
    var houseCodes = null;
    var statePlans = null;
    var countyPlans = null;
    var cityPlans = null;
    var houseCodePlans = null;

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
    }

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
			   cache.ptoPlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
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
               callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'], boolItems: ['active'] }));
           }
       });
    };

    var getPlanName = function(planId) {
        if (cache.ptoPlans == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlans, function(item, index) {
            if (item.id == planId) {
                name = item.title;
            }
        });

        return name;
    };

    var getPTOTypeName = function(planId) {
        if (cache.ptoPlans == null)
            return "";

        var ptoTypeId = "";

        angular.forEach(cache.ptoPlans, function(item, index) {
            if (item.id == planId) {
                ptoTypeId = item.ptoType;
            }
        });

        if (cache.ptoTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoTypes, function(item, index) {
            if (item.id == ptoTypeId) {
                name = item.name;
            }
        });

        return name;
    };

    var getPTOPlanTypeName = function(planId) {
        if (cache.ptoPlans == null)
            return "";

        var ptoPlanTypeId = "";

        angular.forEach(cache.ptoPlans, function(item, index) {
            if (item.id == planId) {
                ptoPlanTypeId = item.ptoPlanType;
            }
        });

        if (cache.ptoPlanTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlanTypes, function(item, index) {
            if (item.id == ptoPlanTypeId) {
                name = item.title;
            }
        });

        return name;
    };

    var getPlanPTOTypeName = function(ptoTypeId) {
        if (cache.ptoTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoTypes, function(item, index) {
            if (item.id == ptoTypeId) {
                name = item.name;
            }
        });

        return name;
    };

    var getPlanPTOPlanTypeName = function(ptoPlanTypeId) {
        if (cache.ptoPlanTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlanTypes, function(item, index) {
            if (item.id == ptoPlanTypeId) {
                name = item.title;
            }
        });

        return name;
    };

	var actionSaveItem = function($scope, plans, callback) {
        var xml = "";

		for (var index = 0; index < plans.length; index++) {
			if (plans[index].id == 0 ||  plans[index].modified) {
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
		$scope.loadingTitle = " Saving...";
		$scope.pageLoading = true;
		transactionMonitor($scope, data, callback);
     };

    var deletePlan = function(id, callback) {
        var xml = '<transaction id="' + id + '"><ptoPlanAssignmentDelete id="' + id + '" /></transaction>';
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
		console.log(xml)
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function(data, status) {
            if (callback)
                callback(data, status);
        });
    };
	
    var transactionMonitor = function ($scope, data, callback) {
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status, xhr) {
            var transactionNode = $(xhr.responseXML).find("transaction")[0];

            if (transactionNode !== undefined) {
                if ($(transactionNode).attr("status") === "success") {
                    $(transactionNode).find("*").each(function () {
                        switch (this.tagName) {
                            case "empPTOPlanAssignment":
                                var id = parseInt($(this).attr("id"), 10);
                                if (levelSelected === "company") {
                                    for (var index = 0; index < $scope.companyPlans.length; index++) {
                                        if ($scope.companyPlans[index].modified) {
                                            if ($scope.companyPlans[index].id === 0)
                                                $scope.companyPlans[index].id = id;
                                            $scope.companyPlans[index].modified = false;
                                            break;
                                        }
                                    }
                                break;
                                }
                                else if (levelSelected === "state") {
                                    for (var index = 0; index < $scope.statePlans.length; index++) {
                                        if ($scope.statePlans[index].modified) {
                                            if ($scope.statePlans[index].id === 0)
                                                $scope.statePlans[index].id = id;
                                            $scope.statePlans[index].modified = false;
                                            break;
                                        }
                                    }
                                    break;
                                }
                                else if (levelSelected === "county") {
                                    angular.forEach($scope.countys, function (county, index) {
                                        for (var index = 0; index < county.countyPlans.length; index++) {
                                            if (county.countyPlans[index].modified) {
                                                if (county.countyPlans[index].id === 0)
                                                    county.countyPlans[index].id = id;
                                                county.countyPlans[index].modified = false;
                                                break;
                                            }
                                        }
                                    });
                                    break;
                                }
                                else if (levelSelected === "city") {
                                    angular.forEach($scope.cities, function (city, index) {
                                        for (var index = 0; index < city.cityPlans.length; index++) {
                                            if (city.cityPlans[index].modified) {
                                                if (city.cityPlans[index].id === 0)
                                                    city.cityPlans[index].id = id;
                                                city.cityPlans[index].modified = false;
                                                break;
                                            }
                                        }
                                    });
                                    break;
                                }
                                else if (levelSelected === "houseCode") {
                                    angular.forEach($scope.houseCodes, function (houseCode, index) {
                                        for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                                            if (houseCode.houseCodePlans[index].modified) {
                                                if (houseCode.houseCodePlans[index].id === 0)
                                                    houseCode.houseCodePlans[index].id = id;
                                                houseCode.houseCodePlans[index].modified = false;
                                                break;
                                            }
                                        }
                                    });
                                    break;
                                }
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

    return {
		getStateTypes: getStateTypes,
        getPTOYears: getPTOYears,
		getPTOTypes: getPTOTypes,
		getPTOPlanTypes: getPTOPlanTypes,
		getPTOPlans: getPTOPlans,
        getPlanName: getPlanName,
        getPTOTypeName: getPTOTypeName,
        getPTOPlanTypeName: getPTOPlanTypeName,
        getPlanPTOTypeName: getPlanPTOTypeName,
        getPlanPTOPlanTypeName: getPlanPTOPlanTypeName,
        getPlanAssignments: getPlanAssignments,
        deletePlan: deletePlan,
		actionSaveItem: actionSaveItem,
		transactionMonitor: transactionMonitor,
    }
}]);
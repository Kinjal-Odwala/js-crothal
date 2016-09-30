var pto = angular.module('pto', ['ui.bootstrap', 'ngRoute']);

pto.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({
        controller: 'planAssignmentCtrl',
        templateUrl: 'planAssignment.htm'
    });
}]);

var setStatus = function(status) {
    var me = this;
    me.$itemStatusImage = $("#itemStatusImage");
    me.$itemModifiedImage = $("#itemModifiedImage");

    if (status == "Edit") {
        me.$itemModifiedImage.addClass("Modified");
        status = "Normal";
    }
    else {
        me.$itemModifiedImage.removeClass("Modified");
    }

    me.$itemStatusImage.attr("class", "itemStatusImage " + status);
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
    var me = this;
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
    $scope.pageStatus = "Loading, Please Wait...";
    $scope.isPageLoading = function() {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    setStatus("Loading");

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
        EmpActions.getCompanyPlanAssignments($scope.ptoYear, function (result) {
            $scope.companyPlans = result;
            angular.forEach($scope.companyPlans, function (plan) {
                if (plan.active === "true")
                    plan.active = true;
                else
                    plan.active = false;
            });
            $scope.pageLoading = false;
            $scope.pageStatus = "Normal";
            setStatus("Normal");
        });
    });

    $scope.onLevelChange = function(level) {
        if (level == "state") {
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showStateGrid = true;
            $scope.showCompanyGrid = false;
            $scope.pageStatus = "Loading, Please Wait...";
			setStatus("Loading");
            EmpActions.getStateTypes(function(result) {
                $scope.states = result;
                $scope.pageLoading = false;
                $scope.pageStatus = "Normal";
                setStatus("Normal");
            });
        }
        else if (level == "company") {
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showCompanyGrid = true;
            $scope.showStateGrid = false;
            $scope.pageStatus = "Loading, Please Wait...";
			setStatus("Loading");
            EmpActions.getPTOPlans($scope.ptoYear, function(result) {
                $scope.plans = result;
            });
            EmpActions.getCompanyPlanAssignments($scope.ptoYear, function(result) {
                $scope.companyPlans = result;
                angular.forEach($scope.companyPlans, function(plan) {
                    if (plan.active === "true")
                        plan.active = true;
                    else
                        plan.active = false;
                });
                $scope.pageLoading = false;
                $scope.pageStatus = "Normal";
                setStatus("Normal");
            });
        }
    };

    $scope.companyPlanSelected = function(item) {
        $scope.selectedCompanyPlan = item;
        levelSelected = "company";
    };

    $scope.search = function() {
        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
        });
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
        $scope.showHouseCode = false;
        $scope.showCounty = false;
        $scope.showCity = false;
        $scope.showCompany = false;
        $scope.pageStatus = 'Loading, Please Wait...';

        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 2, function(result) {
            $scope.statePlans = [];
            $scope.statePlans = result;
        });

        EmpActions.getCountyTypes($scope.ptoYear, item.id, function(result) {
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

        EmpActions.getCityTypes($scope.ptoYear, item.id, function(result) {
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

        EmpActions.getHcmHouseCodes($scope.ptoYear, item.id, function(result) {
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
                $scope.pageStatus = 'Normal';
                setStatus('Normal');
            });
            $scope.assignedHouseCodes = $scope.houseCodes;
        });
    };

    $scope.removeStatePlan = function () {

        if ($scope.selectedStatePlan === undefined || $scope.selectedStatePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedStatePlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;
        
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
            });
        });
    };

    $scope.removeCompanyPlan = function() {
		
		if ($scope.selectedCompanyPlan === undefined || $scope.selectedCompanyPlan === null)
			return;

		if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCompanyPlan.ptoPlanId) + "]?"))
			return;

        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

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
            });
        });
    };

    $scope.removeCountyPlan = function () {

        if ($scope.selectedCountyPlan === undefined || $scope.selectedCountyPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCountyPlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        EmpActions.deletePlan($scope.selectedCountyPlan.id, function (result) {
            angular.forEach($scope.countys, function (county, index) {
                if (county.name === $scope.selectedCounty.name) {
                    for (var index = 0; index < county.countyPlans.length; index++) {
                        if (county.countyPlans[index].id === $scope.selectedCountyPlan.id) {
                            county.countyPlans.splice(index, 1);
                            $scope.selectedCountyPlan = null;
                            break;
                        }
                    }
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
                    });
                }
            });
        });
    };

    $scope.removeCityPlan = function () {
        if ($scope.selectedCityPlan === undefined || $scope.selectedCityPlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedCityPlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        EmpActions.deletePlan($scope.selectedCityPlan.id, function (result) {
            angular.forEach($scope.cities, function (city, index) {
                if (city.name === $scope.selectedCity.name) {
                    for (var index = 0; index < city.cityPlans.length; index++) {
                        if (city.cityPlans[index].id === $scope.selectedCityPlan.id) {
                            city.cityPlans.splice(index, 1);
                            $scope.selectedCityPlan = null;
                            break;
                        }
                    }
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
                    });
                }
            });
        });
    };

    $scope.removeHouseCodePlan = function () {

        if ($scope.selectedHouseCodePlan === undefined || $scope.selectedHouseCodePlan === null)
            return;

        if (!confirm("Are you sure you want to delete the plan name [" + EmpActions.getPlanName($scope.selectedHouseCodePlan.ptoPlanId) + "]?"))
            return;

        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        EmpActions.deletePlan($scope.selectedHouseCodePlan.id, function (result) {
            angular.forEach($scope.houseCodes, function (houseCode, index) {
                if (houseCode.name === $scope.selectedHouseCode.name) {
                    for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                        if (houseCode.houseCodePlans[index].id === $scope.selectedHouseCodePlan.id) {
                            houseCode.houseCodePlans.splice(index, 1);
                            $scope.selectedHouseCodePlan = null;
                            break;
                        }
                    }
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
                    });
                }
            });
        });
    };


    $scope.addPlan = function (level) {
        EmpActions.getPTOPlans($scope.ptoYear, function (result) {
            var plans = result;
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
                        $scope.modalPlans.push(plan);
                    }
                });
                $scope.plans = $scope.modalPlans;
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
                        $scope.modalPlans.push(plan);
                    }
                });
                $scope.plans = $scope.modalPlans;
            }
            else if (level == "city") {
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
                        $scope.modalPlans.push(plan);
                    }
                });
                $scope.plans = $scope.modalPlans;
            }
            else if (level == "houseCode") {
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
            }
            else if (level == "county") {
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
                        $scope.modalPlans.push(plan);
                    }
                });
                $scope.plans = $scope.modalPlans;
            }
        });
        levelSelected = level;
        
        var ptoCompanyModalInstance = $modal.open({
            templateUrl: 'planGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addStatePlan = function() {
        var ptoStateModalInstance = $modal.open({
            templateUrl: 'statePlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addCountyPlan = function() {
        var ptoCountyModalInstance = $modal.open({
            templateUrl: 'countyPlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addCityPlan = function() {
        var ptoCityModalInstance = $modal.open({
            templateUrl: 'cityPlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addHouseCodePlan = function() {
        var ptoHouseCodeModalInstance = $modal.open({
            templateUrl: 'houseCodePlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        levelSelected = "state";
    };

    $scope.saveCompanyPlans = function() {
		
		EmpActions.actionSaveItem($scope, $scope.companyPlans, function(data, status) {
			$scope.$apply(function () {
                $scope.pageLoading = false;
            });
		});
    };

    $scope.saveStatePlans = function() {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        EmpActions.actionSaveItem($scope, $scope.statePlans, function (data, status) {
        });
        $scope.pageLoading = false;
    };

    $scope.saveHouseCodePlans = function() {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.houseCodes, function(houseCode, index) {
            if (houseCode.name === $scope.selectedHouseCode.name) {
                for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                    if (houseCode.houseCodePlans[index].isChecked != undefined) {
                        EmpActions.actionSaveItem($scope, houseCode.houseCodePlans, function (data, status) {
                        });
                    }
                }
            }
            $scope.pageLoading = false;
        });
    };

    $scope.saveCountyPlans = function() {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.countys, function(county, index) {
            if (county.name === $scope.selectedCounty.name) {
                for (var index = 0; index < county.countyPlans.length; index++) {
                    if (!county.countyPlans[index].isChecked && county.countyPlans[index].isChecked != undefined) {
                        EmpActions.actionSaveItem($scope, county.countyPlans, function (data, status) {
                        });
                    }
                }
            }
            $scope.pageLoading = false;
        });
    };

    $scope.saveCityPlans = function() {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.cities, function(city, index) {
            if (city.name === $scope.selectedCity.name) {
                for (var index = 0; index < city.cityPlans.length; index++) {
                    if (!city.cityPlans[index].isChecked && city.cityPlans[index].isChecked != undefined) {
                        EmpActions.actionSaveItem($scope, city.cityPlans, function (data, status) {
                        });
                    }
                }
            }
        });

        $scope.pageLoading = false;
    };

    $scope.addSelectedPlan = function () {
        if (levelSelected == "company") {
            var found = false;
            $scope.loadingTitle = "Saving...";
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.companyPlans, function (companyPlan) {
                        if (EmpActions.getPTOTypeName(companyPlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                            && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(companyPlan.ptoPlanId)) {
                            found = true;
                            alert("Plan with PTO Type: [" + EmpActions.getPTOTypeName(companyPlan.ptoPlanId) + "] and Plan Type: [" + EmpActions.getPTOPlanTypeName(companyPlan.ptoPlanId) + "] is already exists.");
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
                        item["houseCodeId"] = 0;
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
                    });
                });
            }
        }
        else if (levelSelected == "state") {
            $scope.loadingTitle = " Saving...";
            $scope.pageLoading = true;
            var found = false;

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.statePlans, function (statePlan) {
                        if (EmpActions.getPTOTypeName(statePlan.ptoPlanId) === EmpActions.getPlanPTOTypeName($scope.plans[index].ptoType)
                            && EmpActions.getPlanPTOPlanTypeName($scope.plans[index].ptoPlanType) === EmpActions.getPTOPlanTypeName(statePlan.ptoPlanId)) {
                            found = true;
                            alert("Plan with PTO Type:" + EmpActions.getPTOTypeName(statePlan.ptoPlanId) + " and Plan Type:" + EmpActions.getPTOPlanTypeName(statePlan.ptoPlanId) + " is already exists.");
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
                        item["houseCodeId"] = 0;
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
                    });
                });
            }
        }
        else if (levelSelected == "county") {
            $scope.loadingTitle = " Saving...";
            $scope.pageLoading = true;
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
                                item["houseCodeId"] = 0;
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
                            });
                        });
                    }
                });
            }
        }
        else if (levelSelected == "city") {
            $scope.loadingTitle = " Saving...";
            $scope.pageLoading = true;
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
                                item["houseCodeId"] = 0;
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
                            });
                        });
                    }
                });
            }
        }
        else if (levelSelected == "houseCode") {
            $scope.loadingTitle = " Saving...";
            $scope.pageLoading = true;
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
                                item["houseCodeId"] = 0;
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
                            });
                        });
                    }
                });
            }
        }
    };

    $scope.planSelected = function (item) {
        $scope.selectedPlan = item;
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
        setStatus('Edit');
    };

    $scope.onHouseCodePlanChanged = function($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
        setStatus('Edit');
    };

    $scope.onCityPlanChanged = function($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
        setStatus('Edit');
    };

    $scope.onCountyPlanChanged = function($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
        setStatus('Edit');
    };

    $scope.onStatePlanChanged = function($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
        setStatus('Edit');
    };

    $scope.filterCounty = false;

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

    me.expandCountyAll = function(expanded) {
        $scope.$broadcast('onExpandAll', { expanded: expanded });
    };

    me.expandCityAll = function(cityExpanded) {
        $scope.$broadcast('onExpandAll', { cityExpanded: cityExpanded });
    };

    me.expandHouseCodeAll = function(expanded) {
        $scope.$broadcast('onExpandAll', { expanded: expanded });
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

pto.directive('expand', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandAll', function(event, args) {
                $scope.expanded = args.expanded;
            });
        }]
    };
})

pto.directive('expandCity', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandAll', function(event, args) {
                $scope.cityExpanded = args.cityExpanded;
            });
        }]
    };
})

pto.directive('expandHouseCode', function() {
    return {
        restrict: 'A',
        controller: ['$scope', function($scope) {
            $scope.$on('onExpandAll', function(event, args) {
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

    var getCountyTypes = function(ptoYearId, stateId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
			+ ',ptoYearId:' + ptoYearId
           	+ ',stateType:' + stateId
           	+ ',groupType:' + 3
           	+ ',</criteria>', function(xml) {
           	if (callback) {
               cache.countyTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
               callback(cache.countyTypes);
           	}
        });
    };

    var getCityTypes = function(ptoYearId, stateId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
			+ ',ptoYearId:' + ptoYearId
            + ',stateType:' + stateId
            + ',groupType:' + 4
            + ',</criteria>', function(xml) {
			if (callback) {
			   cache.cityTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
			   callback(cache.cityTypes);
			}
		});
    };

    var getHcmHouseCodes = function(ptoYearId, stateId, callback) {
 		apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
			+ ',ptoYearId:' + ptoYearId
			+ ',stateType:' + stateId
			+ ',groupType:' + 5
			+ ',</criteria>', function(xml) {
			if (callback) {
			  cache.houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
			  callback(cache.houseCodes);
			}
		});
    };

	var getCompanyPlanAssignments = function(ptoYearId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYearId:' + ptoYearId
           + ',stateType:' + 0
           + ',groupType:' + 1
           + ',</criteria>', function(xml) {
		   if (callback) {
		       cache.statePlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
		       callback(cache.statePlans);
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
               cache.statePlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
               callback(cache.statePlans);
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
	
    var updatePlans = function(id, stateType, name, groupType, ptoPlan, active, callback) {
        var xml = "";
		var houseCodeId = 0; //TODO: Temporary fix, remove this line
        xml = '<transaction id="1">';
        xml += '<ptoPlanAssignment';
        xml += ' id="' + (id === '' ? "0" : id) + '"';
        xml += ' ptoYearId="' + ptoPlan.ptoYear + '"';
        xml += ' stateType="' + stateType + '"';
		xml += ' houseCodeId="' + houseCodeId + '"';
		xml += ' ptoPlanId="' + ptoPlan.id + '"';
        xml += ' groupType="' + groupType + '"';
        xml += ' name="' + name + '"';
        xml += ' active="' + active + '"';
        xml += '/>';
        xml += '</transaction>';
		console.log(xml)
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
		jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function(data, status) {
            if (callback)
                callback(data, status);
        });
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
                                        if ($scope.companyPlans[index].modified) {
                                            if ($scope.companyPlans[index].id === 0)
                                                $scope.companyPlans[index].id = id;
                                            $scope.companyPlans[index].modified = false;
                                            break;
                                        }
                                    }
                                    break;
                                }
                                else if (levelSelected === "county") {
                                    angular.forEach($scope.countys, function (county, index) {
                                        if (county.name === $scope.selectedCounty.name) {
                                            for (var index = 0; index < county.countyPlans.length; index++) {
                                                if (county.countyPlans[index].modified) {
                                                    if (county.countyPlans[index].id === 0)
                                                        county.countyPlans[index].id = id;
                                                    county.countyPlans[index].modified = false;
                                                    break;
                                                }
                                            }
                                            
                                        }
                                    });
                                    break;
                                }
                                else if (levelSelected === "city") {
                                    angular.forEach($scope.cities, function (city, index) {
                                        if (city.name === $scope.selectedCity.name) {
                                            for (var index = 0; index < city.cityPlans.length; index++) {
                                                if (city.cityPlans[index].modified) {
                                                    if (city.cityPlans[index].id === 0)
                                                        city.cityPlans[index].id = id;
                                                    city.cityPlans[index].modified = false;
                                                    break;
                                                }
                                            }

                                        }
                                    });
                                    break;
                                }
                                else if (levelSelected === "houseCode") {
                                    angular.forEach($scope.houseCodes, function (houseCode, index) {
                                        if (houseCode.name === $scope.selectedHouseCode.name) {
                                            for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                                                if (houseCode.houseCodePlans[index].modified) {
                                                    if (houseCode.houseCodePlans[index].id === 0)
                                                        houseCode.houseCodePlans[index].id = id;
                                                    houseCode.houseCodePlans[index].modified = false;
                                                    break;
                                                }
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
        getCountyTypes: getCountyTypes,
        getCityTypes: getCityTypes,
        getHcmHouseCodes: getHcmHouseCodes,
        getPlanName: getPlanName,
        getPTOTypeName: getPTOTypeName,
        getPTOPlanTypeName: getPTOPlanTypeName,
        getPlanPTOTypeName: getPlanPTOTypeName,
        getPlanPTOPlanTypeName: getPlanPTOPlanTypeName,
        getPlanAssignments: getPlanAssignments,
        getCompanyPlanAssignments: getCompanyPlanAssignments,
		updatePlans: updatePlans,
        deletePlan: deletePlan,
		actionSaveItem: actionSaveItem,
		transactionMonitor: transactionMonitor,
    }
}]);
var pto = angular.module('pto', ['ui.bootstrap', 'ngRoute']);

pto.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .otherwise({
        controller: 'planAssignmentCtrl',
        templateUrl: 'planAssignment.htm'
    });
}]);

var getCurrentHcmHouseCode = function () {
    return window.top.fin.appUI.houseCodeId;
}

var setStatus = function (status) {
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

var deserializeXml = function (xml, nodeName, options) {
    options = options || {};

    var upperCaseItems = function (input) {
        var items = [];
        if (input && input.length) {
            $.each(input, function (index, item) {
                items.push(item.toUpperCase());
            });
        }
        return items;
    };

    var convertAttrName = function (name) {
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

    $el.each(function (index, element) {
        var obj = {};
        $.each(element.attributes, function (index, key) {
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

pto.controller('planAssignmentCtrl', ['$scope', 'EmpActions', '$filter', '$sce', '$modal', function ($scope, EmpActions, $filter, $sce, $modal) {
    $scope.PtoYears = [];
    $scope.selectedState = null;
    $scope.plans = [];
    $scope.statePlans = [];
    $scope.countyPlans = [];
    $scope.countys = [];
    $scope.countyTypes = [];
    $scope.cityPlans = [];
    $scope.cities = [];
    $scope.houseCodes = [];
    $scope.cityTypes = [];
    $scope.showStateGrid = false;
    $scope.showCompanyGrid = false;
    $scope.companyPlans = [];
    $scope.pageLoading = false;
    $scope.loadingTitle = " Loading...";
    $scope.isPageLoading = function () {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    var self = this;
    $scope.pageStatus = 'Normal';
    setStatus('Normal');

    EmpActions.getPtoTypes(function (result) {
    });
    EmpActions.getPtoPlanTypes(function (result) {
    });

    $scope.onLevelChange = function (level) {
        if (level === 'state') {
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showStateGrid = true;
            $scope.showCompanyGrid = false;
            setStatus('Loading');
            $scope.pageStatus = 'Loading, Please Wait...';
            EmpActions.getStateTypes(function (result) {
                $scope.states = result;
                $scope.pageLoading = false;
                $scope.pageStatus = 'Normal';
                setStatus('Normal');
            });
        }
        else if (level === 'company') {
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            $scope.showCompanyGrid = true;
            $scope.showStateGrid = false;
            setStatus('Loading');
            $scope.pageStatus = 'Loading, Please Wait...';
            EmpActions.getPtoPlans($scope.ptoYear, function (result) {
                $scope.plans = result;
            });
            EmpActions.getCompanyPlanAssignments($scope.ptoYear, function (result) {
                $scope.companyPlans = result;
                angular.forEach($scope.companyPlans, function (plan) {
                    if (plan.active == "true")
                        plan.active = true;
                    else
                        plan.active = false;
                });
                $scope.pageLoading = false;
                $scope.pageStatus = 'Normal';
                setStatus('Normal');
            });
        }
    };

    $scope.companyPlanSelected = function (item) {
        $scope.selectedCompanyPlan = item;
    };

    EmpActions.getPtoYears(function (result) {
        $scope.PtoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
        }
    });

    $scope.search = function () {
        EmpActions.getPtoPlans($scope.ptoYear, function (result) {
            $scope.plans = result;
        });
    };

    $scope.getPlanName = function (planId) {
        return EmpActions.getPlanName(planId);
    }

    $scope.getPtoTypeName = function (planId) {
        return EmpActions.getPtoTypeName(planId);
    };

    $scope.getPtoPlanTypeName = function (planId) {
        return EmpActions.getPtoPlanTypeName(planId);
    };

    $scope.getPlanPtoTypeName = function (planId) {
        return EmpActions.getPlanPtoTypeName(planId);
    };

    $scope.getPlanPtoPlanTypeName = function (planId) {
        return EmpActions.getPlanPtoPlanTypeName(planId);
    };

    $scope.stateSelected = function (item) {
        $scope.loadingTitle = " Loading...";
        $scope.pageLoading = true;
        $scope.selectedState = item;
        $scope.state = item.name;
        var ptoYear = '';
        $scope.showHouseCode = false;
        $scope.showCounty = false;
        $scope.showCity = false;
        $scope.showCompany = false;
        $scope.pageStatus = 'Loading, Please Wait...';

        EmpActions.getPtoPlans($scope.ptoYear, function (result) {
            $scope.plans = result;
        });
        angular.forEach($scope.ptoYears, function (year, index) {
            ptoYear = year.title;
        });
       
        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 2, function (result) {
            $scope.statePlans = [];
            $scope.statePlans = result;
        });
        EmpActions.getCountyTypes($scope.ptoYear, item.id, function (result) {
            $scope.selectedCountys = result;
            $scope.countys = [];
            angular.forEach($scope.selectedCountys, function (county, index) {
                var similarCounty = false;
                if (county.ptoPlanAssignment > 0) {
                    if ($scope.countys.length >= 1) {
                       
                        angular.forEach($scope.countys, function (planCounty, index) {
                            if (planCounty.name == county.name)
                                similarCounty = true;
                        });
                        if (!similarCounty)
                            $scope.countys.push(county);
                    }
                    else
                        $scope.countys.push(county);
                }
                else if (county.ptoPlanAssignment == 0)
                    $scope.countys.push(county);

            });

            angular.forEach($scope.countys, function (county, index) {
                county.countyPlans = [];
            });

            angular.forEach($scope.selectedCountys, function (selectedCounty, index) {

                if (selectedCounty.ptoPlanAssignment > 0) {
                        angular.forEach($scope.countys, function (planCounty, index) {
                            if (planCounty.name == selectedCounty.name)
                                planCounty.countyPlans.push(selectedCounty);
                        });
                }
                
            });
        });
        EmpActions.getCityTypes($scope.ptoYear, item.id, function (result) {
            $scope.selectedCities = result;
            $scope.cities = [];
            angular.forEach($scope.selectedCities, function (city, index) {
                var similarCity = false;
                if (city.ptoPlanAssignment > 0) {
                    if ($scope.cities.length >= 1) {
                        angular.forEach($scope.cities, function (planCity, index) {
                            if (planCity.name == city.name)
                                similarCity = true;
                        });
                        if (!similarCity)
                            $scope.cities.push(city);
                    }
                    else
                        $scope.cities.push(city);
                }
                else if (city.ptoPlanAssignment == 0)
                    $scope.cities.push(city);

            });

            angular.forEach($scope.selectedCities, function (city, index) {
                city.cityPlans = [];
            });

            angular.forEach($scope.selectedCities, function (selectedCity, index) {

                if (selectedCity.ptoPlanAssignment > 0) {
                    angular.forEach($scope.cities, function (planCity, index) {
                        if (planCity.name == selectedCity.name)
                            planCity.cityPlans.push(selectedCity);
                    });
                }

            });
        });
        EmpActions.getHcmHouseCodes($scope.ptoYear, item.id, function (result) {
            $scope.selectedHouseCodes = result;
            $scope.pageLoading = false;
            $scope.houseCodes = [];
            angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
                var similarHouseCode = false;
                if (houseCode.ptoPlanAssignment > 0) {
                    if ($scope.houseCodes.length >= 1) {
                        angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                            if (planHouseCode.name == houseCode.name)
                                similarHouseCode = true;
                        });
                        if (!similarHouseCode)
                            $scope.houseCodes.push(houseCode);
                    }
                    else
                        $scope.houseCodes.push(houseCode);
                }
                else if (houseCode.ptoPlanAssignment == 0)
                    $scope.houseCodes.push(houseCode);

            });
        });

        angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
            houseCode.houseCodePlans = [];
        });

        angular.forEach($scope.selectedHouseCodes, function (selectedHouseCode, index) {

            if (selectedHouseCode.ptoPlanAssignment > 0) {
                angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                    if (planHouseCode.name == selectedHouseCode.name)
                        planHouseCode.houseCodePlans.push(selectedHouseCode);
                });
            }
            $scope.pageStatus = 'Normal';
            setStatus('Normal');
        });
    };

    $scope.removeStatePlan = function () {
        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
        
        EmpActions.deletePlan($scope.selectedStatePlan.ptoPlanAssignment, function (result) {
        });

        EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 2, function (result) {
            $scope.statePlans = [];
            $scope.statePlans = result;
            $scope.pageLoading = false;
        });
    };

    $scope.removeCompanyPlan = function () {
        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;

        EmpActions.deletePlan($scope.selectedCompanyPlan.ptoPlanAssignment, function (result) {
        });
        EmpActions.getCompanyPlanAssignments($scope.ptoYear, function (result) {
            $scope.companyPlans = [];
            $scope.companyPlans = result;
            angular.forEach($scope.companyPlans, function (plan) {
                if (plan.active == "true")
                    plan.active = true;
                else
                    plan.active = false;
            });
            $scope.pageLoading = false;
        });
    };

    $scope.addCompanyPlan = function () {
        var ptoCompanyModalInstance = $modal.open({
            templateUrl: 'companyPlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addStatePlan = function () {
        var ptoStateModalInstance = $modal.open({
            templateUrl: 'statePlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addCountyPlan = function () {
        var ptoCountyModalInstance = $modal.open({
            templateUrl: 'countyPlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addCityPlan = function () {
        var ptoCityModalInstance = $modal.open({
            templateUrl: 'cityPlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.addHouseCodePlan = function () {
        var ptoHouseCodeModalInstance = $modal.open({
            templateUrl: 'houseCodePlanGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            scope: $scope
        });
    };

    $scope.statePlanSelected = function (item) {
        $scope.selectedStatePlan = item;
    };

    $scope.saveCompanyPlans = function () {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        for (var i = 0; i < $scope.companyPlans.length; i++) {
            if ($scope.companyPlans[i].isChecked != undefined) {
                EmpActions.updatePlans($scope.companyPlans[i].ptoPlanAssignment, '', '', '', '', $scope.companyPlans[i].isChecked, function (data, status) {
                });
            }
            $scope.pageLoading = false;
        }
    };

    $scope.saveStatePlans = function () {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        for (var i = 0; i < $scope.statePlans.length; i++) {
            if (!$scope.statePlans[i].isChecked && $scope.statePlans[i].isChecked != undefined) {
                EmpActions.updatePlans($scope.statePlans[i].ptoPlanAssignment, '', '', '', '', $scope.statePlans[i].isChecked, function (data, status) {
                });
            }
            $scope.pageLoading = false;
        }
    };

    $scope.saveHouseCodePlans = function () {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.houseCodes, function (houseCode, index) {
            if (houseCode.id == $scope.selectedHouseCodePlan.id) {
                for (var i = 0; i < houseCode.houseCodePlans.length; i++) {
                    if (!houseCode.houseCodePlans[i].isChecked && houseCode.houseCodePlans[i].isChecked != undefined) {
                        EmpActions.updatePlans(houseCode.houseCodePlans[i].ptoPlanAssignment, '', '', '', '', houseCode.houseCodePlans[i].isChecked, function (data, status) {
                        });
                    }
                }
            }
            $scope.pageLoading = false;
        });
    };

    $scope.saveCountyPlans = function () {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.countys, function (county, index) {
            if (county.id == $scope.selectedCountyPlan.id) {
                for (var i = 0; i < county.countyPlans.length; i++) {
                    if (!county.countyPlans[i].isChecked && county.countyPlans[i].isChecked != undefined) {
                        EmpActions.updatePlans(county.countyPlans[i].ptoPlanAssignment, '', '', '', '', county.countyPlans[i].isChecked, function (data, status) {
                        });
                    }
                }
            }
            $scope.pageLoading = false;
        });
    };

    $scope.saveCityPlans = function () {
        $scope.loadingTitle = " Saving...";
        $scope.pageLoading = true;

        angular.forEach($scope.cities, function (city, index) {
            if (city.id == $scope.selectedCityPlan.id) {
                for (var i = 0; i < city.cityPlans.length; i++) {
                    if (!city.cityPlans[i].isChecked && city.cityPlans[i].isChecked != undefined) {
                        EmpActions.updatePlans(city.cityPlans[i].ptoPlanAssignment, '', '', '', '', city.cityPlans[i].isChecked, function (data, status) {
                        });
                    }
                }
            }
            $scope.pageLoading = false;
        });
    };

    $scope.addSelectedCompanyPlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
        for (var i = 0; i < $scope.plans.length; i++) {
            if ($scope.plans[i].isChecked) {
                var similarPlan = false;
                angular.forEach($scope.companyPlans, function (companyPlan) {
                    if (EmpActions.getPtoTypeName(companyPlan.ptoPlan) === EmpActions.getPlanPtoTypeName($scope.plans[i].ptoType)
                        && EmpActions.getPlanPtoPlanTypeName($scope.plans[i].ptoPlanType) === EmpActions.getPtoPlanTypeName(companyPlan.ptoPlan)) {
                        similarPlan = true;
                        alert("Plan with PTO Type: [" + EmpActions.getPtoTypeName(companyPlan.ptoPlan) + "] and Plan Type: [" + EmpActions.getPtoPlanTypeName(companyPlan.ptoPlan) + "] is already exists.");
                    }
                });
                if (!similarPlan) {
                    EmpActions.updatePlans('', '', '', 1, $scope.plans[i], true, function (data, status) {
                    });
                }
            }
        }
        EmpActions.getCompanyPlanAssignments($scope.ptoYear, function (result) {
            $scope.companyPlans = result;
            angular.forEach($scope.companyPlans, function (plan) {
                if (plan.active == "true")
                    plan.active = true;
                else
                    plan.active = false;
            });
            $scope.pageLoading = false;
        });
    };

    $scope.addSelectedStatePlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
        for (var i = 0; i < $scope.plans.length; i++) {
            if ($scope.plans[i].isChecked) {
                var similarPlan = false;
                angular.forEach($scope.statePlans, function (statePlan) {
                    if (EmpActions.getPtoTypeName(statePlan.ptoPlan) === EmpActions.getPlanPtoTypeName($scope.plans[i].ptoType)
                        && EmpActions.getPlanPtoPlanTypeName($scope.plans[i].ptoPlanType) === EmpActions.getPtoPlanTypeName(statePlan.ptoPlan)) {
                        similarPlan = true;
                        alert("Plan with PTO Type:" + EmpActions.getPtoTypeName(statePlan.ptoPlan) + " and Plan Type:" + EmpActions.getPtoPlanTypeName(statePlan.ptoPlan) + " is already exists.");
                    }
                });
                if (!similarPlan) {
                    EmpActions.updatePlans('', $scope.selectedState.id, $scope.selectedState.name, 2, $scope.plans[i], true, function (data, status) {
                    });
                }
            }
        }
        EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 2, function (result) {
            $scope.statePlans = result;
            $scope.pageLoading = false;
        });
    }

    $scope.addSelectedCountyPlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
        for (var i = 0; i < $scope.plans.length; i++) {
            if ($scope.plans[i].isChecked) {
                var similarPlan = false;
                angular.forEach($scope.countys, function (county) {
                    if (county.id == $scope.selectedCounty.id) {
                        angular.forEach(county.countyPlans, function (countyPlan) {
                            if (EmpActions.getPtoTypeName(countyPlan.ptoPlan) === EmpActions.getPlanPtoTypeName($scope.plans[i].ptoType)
                                && EmpActions.getPlanPtoPlanTypeName($scope.plans[i].ptoPlanType) === EmpActions.getPtoPlanTypeName(countyPlan.ptoPlan)) {
                                similarPlan = true;
                                alert("Plan with PTO Type:" + EmpActions.getPtoTypeName(countyPlan.ptoPlan) + " and Plan Type:" + EmpActions.getPtoPlanTypeName(countyPlan.ptoPlan) + " is already exists.");
                            }
                        });
                        if (!similarPlan) {
                            EmpActions.updatePlans('', $scope.selectedState.id, county.name, 3, $scope.plans[i], true, function (data, status) {
                            });
                        }
                    }
                });
                
            }
        }
        EmpActions.getCountyTypes($scope.ptoYear, $scope.selectedState.id, function (result) {
            $scope.selectedCountys = result;
            $scope.countys = [];
            angular.forEach($scope.selectedCountys, function (county, index) {

                if (county.ptoPlanAssignment > 0) {
                    if ($scope.countys.length >= 1) {
                        var similarCounty = false;
                        angular.forEach($scope.countys, function (planCounty, index) {
                            if (planCounty.name == county.name)
                                similarCounty = true;
                        });
                        if (!similarCounty)
                            $scope.countys.push(county);
                    }
                    else
                        $scope.countys.push(county);
                }
                else if (county.ptoPlanAssignment == 0)
                    $scope.countys.push(county);

            });

            angular.forEach($scope.countys, function (county, index) {
                county.countyPlans = [];
            });

            angular.forEach($scope.selectedCountys, function (selectedCounty, index) {

                if (selectedCounty.ptoPlanAssignment > 0) {
                    angular.forEach($scope.countys, function (planCounty, index) {
                        if (planCounty.name == selectedCounty.name)
                            planCounty.countyPlans.push(selectedCounty);
                    });
                }
                $scope.pageLoading = false;
            });
        });
    }

    $scope.addSelectedCityPlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
        for (var i = 0; i < $scope.plans.length; i++) {
            if ($scope.plans[i].isChecked) {
                var similarPlan = false;
                angular.forEach($scope.cities, function (city) {
                    if (city.id == $scope.selectedCity.id) {
                        angular.forEach(city.cityPlans, function (cityPlan) {
                            if (EmpActions.getPtoTypeName(cityPlan.ptoPlan) === EmpActions.getPlanPtoTypeName($scope.plans[i].ptoType)
                                && EmpActions.getPlanPtoPlanTypeName($scope.plans[i].ptoPlanType) === EmpActions.getPtoPlanTypeName(cityPlan.ptoPlan)) {
                                similarPlan = true;
                                alert("Plan with PTO Type: [" + EmpActions.getPtoTypeName(cityPlan.ptoPlan) + "] and Plan Type: [" + EmpActions.getPtoPlanTypeName(cityPlan.ptoPlan) + "] is already exists.");
                            }
                        });
                        if (!similarPlan) {
                            EmpActions.updatePlans('', $scope.selectedState.id, city.name, 4, $scope.plans[i], true, function (data, status) {
                            });
                        }
                    }
                });
            }
        }
        EmpActions.getCityTypes($scope.ptoYear, $scope.selectedState.id, function (result) {
            $scope.selectedCities = result;
            $scope.cities = [];
            angular.forEach($scope.selectedCities, function (city, index) {
                var similarCity = false;
                if (city.ptoPlanAssignment > 0) {
                    if ($scope.cities.length >= 1) {
                        angular.forEach($scope.cities, function (planCity, index) {
                            if (planCity.name == city.name)
                                similarCity = true;
                        });
                        if (!similarCity)
                            $scope.cities.push(city);
                    }
                    else
                        $scope.cities.push(city);
                }
                else if (city.ptoPlanAssignment == 0)
                    $scope.cities.push(city);

            });

            angular.forEach($scope.selectedCities, function (city, index) {
                city.cityPlans = [];
            });

            angular.forEach($scope.selectedCities, function (selectedCity, index) {
                $scope.pageLoading = false;
                if (selectedCity.ptoPlanAssignment > 0) {
                    angular.forEach($scope.cities, function (planCity, index) {
                        if (planCity.name == selectedCity.name)
                            planCity.cityPlans.push(selectedCity);
                    });
                }

            });
        });
        
    }

    $scope.addSelectedHouseCodePlan = function () {
        $scope.loadingTitle = " Adding...";
        $scope.pageLoading = true;
        for (var i = 0; i < $scope.plans.length; i++) {
            if ($scope.plans[i].isChecked) {
                var similarPlan = false;
                angular.forEach($scope.houseCodes, function (houseCode) {
                    if (houseCode.id == $scope.selectedHouseCode.id) {
                        angular.forEach(houseCode.houseCodePlans, function (houseCodePlan) {
                            if (EmpActions.getPtoTypeName(houseCodePlan.ptoPlan) === EmpActions.getPlanPtoTypeName($scope.plans[i].ptoType)
                                && EmpActions.getPlanPtoPlanTypeName($scope.plans[i].ptoPlanType) === EmpActions.getPtoPlanTypeName(houseCodePlan.ptoPlan)) {
                                similarPlan = true;
                                alert("Plan with PTO Type:" + EmpActions.getPtoTypeName(houseCodePlan.ptoPlan) + " and Plan Type:" + EmpActions.getPtoPlanTypeName(houseCodePlan.ptoPlan) + " is already exists.");
                            }
                        });
                    }
                    if (!similarPlan) {
                        EmpActions.updatePlans('', $scope.selectedState.id, houseCode.name, 5, $scope.plans[i], true, function (data, status) {
                        });
                    }
                });
            }
        }
        EmpActions.getHcmHouseCodes($scope.ptoYear, $scope.selectedState.id, function (result) {
            $scope.selectedHouseCodes = result;
            $scope.houseCodes = [];
            angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
                var similarHouseCode = false;
                if (houseCode.ptoPlanAssignment > 0) {
                    if ($scope.houseCodes.length >= 1) {
                        angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                            if (planHouseCode.name == houseCode.name)
                                similarHouseCode = true;
                        });
                        if (!similarHouseCode)
                            $scope.houseCodes.push(houseCode);
                    }
                    else
                        $scope.houseCodes.push(houseCode);
                }
                else if (houseCode.ptoPlanAssignment == 0)
                    $scope.houseCodes.push(houseCode);

            });
        });

        angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
            houseCode.houseCodePlans = [];
        });

        angular.forEach($scope.selectedHouseCodes, function (selectedHouseCode, index) {
            $scope.pageLoading = false;
            if (selectedHouseCode.ptoPlanAssignment > 0) {
                angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                    if (planHouseCode.name == selectedHouseCode.name)
                        planHouseCode.houseCodePlans.push(selectedHouseCode);
                });
            }
        });
    }

    $scope.countyPlanSelected = function (item) {
        $scope.selectedCountyPlan = item;
    }

    $scope.countySelected = function (item) {
        $scope.selectedCounty = item;
    }

    $scope.cityPlanSelected = function (item) {
        $scope.selectedCityPlan = item;
    }

    $scope.citySelected = function (item) {
        $scope.selectedCity = item;
    }

    $scope.houseCodeSelected = function (item) {
        $scope.selectedHouseCode = item;
    }

    $scope.houseCodePlanSelected = function (item) {
        $scope.selectedHouseCodePlan = item;
    }

    $scope.statePlanSelected = function (item) {
        $scope.selectedStatePlan = item;
    }

    $scope.countyPlanSelected = function (countyPlan) {
        $scope.selectedCountyPlan = countyPlan;
    };

    $scope.removeCountyPlan = function () {
        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
        EmpActions.deletePlan($scope.selectedCountyPlan.ptoPlanAssignment, function (result) {
        });
        
        angular.forEach($scope.countys, function (county, index) {
            var plans = county.countyPlans;
            county.countyPlans = [];
            angular.forEach(plans, function (plan) {
                if (plan.ptoPlanAssignment != $scope.selectedCountyPlan.ptoPlanAssignment)
                    county.countyPlans.push(plan);
            });
            $scope.pageLoading = false;
        });
    };

    $scope.cityPlanSelected = function (cityPlan) {
        $scope.selectedCityPlan = cityPlan;
    };

    $scope.removeCityPlan = function () {
        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
        EmpActions.deletePlan($scope.selectedCityPlan.ptoPlanAssignment, function (result) {
        });

        angular.forEach($scope.cities, function (city, index) {
            var plans = city.cityPlans;
            city.cityPlans = [];
            angular.forEach(plans, function (plan) {
                if (plan.ptoPlanAssignment != $scope.selectedCityPlan.ptoPlanAssignment)
                    city.cityPlans.push(plan);
            });
            $scope.pageLoading = false;
        });
    };

    $scope.removeHouseCodePlan = function () {
        $scope.loadingTitle = " Removing...";
        $scope.pageLoading = true;
        EmpActions.deletePlan($scope.selectedHouseCodePlan.ptoPlanAssignment, function (result) {
        });

        angular.forEach($scope.houseCodes, function (houseCode, index) {
            var plans = houseCodes.houseCodePlans;
            houseCodes.houseCodePlans = [];
            angular.forEach(plans, function (plan) {
                if (plan.ptoPlanAssignment != $scope.selectedHouseCodePlan.ptoPlanAssignment)
                    houseCodes.houseCodePlans.push(plan);
            });
            $scope.pageLoading = false;
        });
    };

    $scope.onCompanyPlanChanged = function ($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
    };

    $scope.onHouseCodePlanChanged = function ($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
    };

    $scope.onCityPlanChanged = function ($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
    };

    $scope.onCountyPlanChanged = function ($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
    };

    $scope.onStatePlanChanged = function ($event, plan) {
        var checkbox = $event.target;
        plan.isChecked = checkbox.checked;
    };

    $scope.filterCounty = false;

    $scope.filterCountyPlans = function () {
        $scope.filtercountys = [];
        $scope.originalCountys = $scope.countys;
        if (!$scope.filterCounty) {
            angular.forEach($scope.countys, function (county, index) {
                if (county.countyPlans != null && county.countyPlans.length > 0) {
                    $scope.filtercountys.push(county);
                }
            });
            $scope.countys = $scope.filtercountys;
        }
        else
            $scope.countys = $scope.originalCountys;
    }

    $scope.filterCityPlans = function () {
        $scope.filtercities = [];
        angular.forEach($scope.cities, function (city, index) {
            if (city.cityPlans != null && city.cityPlans.length > 0) {
                $scope.filtercities.push(city);
            }
        });
        $scope.cities = $scope.filtercities;
    }

    $scope.filterHouseCodePlans = function () {
        $scope.filterHouseCodes = [];
        angular.forEach($scope.houseCodes, function (houseCode, index) {
            if (houseCode.houseCodePlans != null && houseCode.houseCodePlans.length > 0) {
                $scope.filterHouseCodes.push(houseCode);
            }
        });
        $scope.houseCodes = $scope.filterHouseCodes;
    };

    self.expandCountyAll = function (expanded) {
        $scope.$broadcast('onExpandAll', { expanded: expanded });
    };

    self.expandCityAll = function (cityExpanded) {
        $scope.$broadcast('onExpandAll', { cityExpanded: cityExpanded });
    };

    self.expandHouseCodeAll = function (expanded) {
        $scope.$broadcast('onExpandAll', { expanded: expanded });
    };

    $scope.sortCountyBy = function (item) {
        return item.name;
    };

    $scope.sortHouseCodeBy = function (item) {
        return item.name;
    };

    $scope.sortCityBy = function (item) {
        return item.name;
    };
    
}])

.controller('modalInstanceCtrl', function ($scope, $modalInstance) {
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

pto.directive('expand', function () {
    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.$on('onExpandAll', function (event, args) {
                $scope.expanded = args.expanded;
            });
        }]
    };
})
pto.directive('expandCity', function () {
    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.$on('onExpandAll', function (event, args) {
                $scope.cityExpanded = args.cityExpanded;
            });
        }]
    };
})
pto.directive('expandHouseCode', function () {
    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.$on('onExpandAll', function (event, args) {
                $scope.houseCodeExpanded = args.houseCodeExpanded;
            });
        }]
    };
})

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
    
    var cache = {};
    var stateTypes = null;
    var countyTypes = null;
    var cityTypes = null;
    var ptoPlans = null;
    var ptoTypes = null;
    var ptoPlanTypes = null;
    var houseCodes = null;
    var statePlans = null;
    var countyPlans = null;
    var cityPlans = null;
    var houseCodePlans = null;
    var ptoYears = null;

    var apiRequest = function (moduleId, targetId, requestXml, callback) {
        
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
        }).success(function (result) {
            callback(result);
            $rootScope.loadingCount--;
            if (top.ii !== undefined) {
                top.ii.Session.singleton.ajaxComplete();
                top.ii.Session.singleton.ajaxStop();
            }
        })
        .error(function (error) {
            $rootScope.loadingCount--;
            if (top.ii !== undefined) {
                top.ii.Session.singleton.ajaxComplete();
                top.ii.Session.singleton.ajaxStop();
            }
        });
    }

    var getPtoYears = function (callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoYears,userId:[user]'
              + ',</criteria>', function (xml) {
                  if (callback) {
                      callback(deserializeXml(xml, 'item', { upperFirstLetter: false }));
                  }
              });
    }

    var getStateTypes = function (callback) {

        if (cache.stateTypes) {
            callback(cache.stateTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:stateTypes,userId:[user],</criteria>', function (xml) {
            cache.stateTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            getStateTypes(callback);
        });
    };

    var getCountyTypes = function (ptoYear, stateId, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYear:' + ptoYear
           + ',stateType:' + stateId
           + ',groupType:' + 3
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.countyTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.countyTypes);
               }
        });
    };

    var getCityTypes = function (ptoYear, stateId, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYear:' + ptoYear
           + ',stateType:' + stateId
           + ',groupType:' + 4
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.cityTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.cityTypes);
               }
           });
    };

    var getHcmHouseCodes = function (ptoYear, stateId, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
                  + ',ptoYear:' + ptoYear
                  + ',stateType:' + stateId
                  + ',groupType:' + 5
                  + ',</criteria>', function (xml) {
                      if (callback) {
                          cache.houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                          callback(cache.houseCodes);
                      }
                  });
    };

    var getPtoPlans = function (ptoYearId, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlans,userId:[user]'
           + ',houseCodeId:' + 0
           + ',ptoYearId:' + ptoYearId
           + ',active:' + 1
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.ptoPlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.ptoPlans);
               }
           });
    };

    var getPtoTypes = function (callback) {

        if (cache.ptoTypes) {
            callback(cache.ptoTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoTypes,userId:[user]'
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.ptoTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.ptoTypes);
               }
           });
    };

    var getPtoPlanTypes = function (callback) {

        if (cache.ptoPlanTypes) {
            callback(cache.ptoPlanTypes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanTypes,userId:[user]'
           + ',active:' + 0
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.ptoPlanTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.ptoPlanTypes);
               }
           });
    };

    var getPlanName = function (planId) {
        if (cache.ptoPlans == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlans, function (item, index) {
            if (item.id == planId) {
                name = item.title;
            }
        });

        return name;
    };

    var getPtoTypeName = function (planId) {
        if (cache.ptoPlans == null)
            return "";

        var ptoTypeId = "";

        angular.forEach(cache.ptoPlans, function (item, index) {
            if (item.id == planId) {
                ptoTypeId = item.ptoType;
            }
        });

        if (cache.ptoTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoTypes, function (item, index) {
            if (item.id == ptoTypeId) {
                name = item.name;
            }
        });

        return name;
    };

    var getPtoPlanTypeName = function (planId) {
        if (cache.ptoPlans == null)
            return "";

        var ptoPlanTypeId = "";

        angular.forEach(cache.ptoPlans, function (item, index) {
            if (item.id == planId) {
                ptoPlanTypeId = item.ptoPlanType;
            }
        });

        if (cache.ptoPlanTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlanTypes, function (item, index) {
            if (item.id == ptoPlanTypeId) {
                name = item.title;
            }
        });

        return name;
    };

    var getPlanPtoTypeName = function (ptoTypeId) {
        if (cache.ptoTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoTypes, function (item, index) {
            if (item.id == ptoTypeId) {
                name = item.name;
            }
        });

        return name;
    };

    var getPlanPtoPlanTypeName = function (ptoPlanTypeId) {
        if (cache.ptoPlanTypes == null)
            return "";

        var name = "";

        angular.forEach(cache.ptoPlanTypes, function (item, index) {
            if (item.id == ptoPlanTypeId) {
                name = item.title;
            }
        });

        return name;
    };

    var updatePlans = function (id, stateType, name, groupType, ptoPlan, active, callback) {
        var xml = "";
        xml = '<transaction id="1">';
        xml += '<ptoPlanAssignment';
        xml += ' id="' + (id == '' ? "0" : id) + '"';
        if (ptoPlan != '') {
            xml += ' ptoYear="' + ptoPlan.ptoYear + '"';
        }
        if (stateType !== '') {
            xml += ' stateType="' + stateType + '"';
        }
        if (name !== '') {
            xml += ' name="' + name + '"';
        }
        if (groupType != '') {
            xml += ' groupType="' + groupType + '"';
        }
        if (ptoPlan != '') {
            xml += ' ptoPlanId="' + ptoPlan.id + '"';
        }
        xml += ' active="' + active + '"';
        xml += '/>';
        xml += '</transaction>';
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var deletePlan = function (id, callback) {
        var xml = '<transaction id="' + id + '"><ptoPlanAssignmentDelete id="' + id + '" /></transaction>';
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';

        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var getPlanAssignments = function (ptoYear, stateId, groupType, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYear:' + ptoYear
           + ',stateType:' + stateId
           + ',groupType:' + groupType
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.statePlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.statePlans);
               }
           });
    };

    var getCompanyPlanAssignments = function (ptoYear, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYear:' + ptoYear
           + ',stateType:' + 0
           + ',groupType:' + 1
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.statePlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.statePlans);
               }
           });
    };

    return {
        getPtoYears: getPtoYears,
        getStateTypes: getStateTypes,
        getCountyTypes: getCountyTypes,
        getCityTypes: getCityTypes,
        getPtoPlans: getPtoPlans,
        getPtoTypes: getPtoTypes,
        getPtoTypeName: getPtoTypeName,
        getPtoPlanTypes: getPtoPlanTypes,
        getPtoPlanTypeName: getPtoPlanTypeName,
        getHcmHouseCodes: getHcmHouseCodes,
        updatePlans: updatePlans,
        getPlanAssignments: getPlanAssignments,
        getCompanyPlanAssignments: getCompanyPlanAssignments,
        deletePlan: deletePlan,
        getPlanName: getPlanName,
        getPlanPtoTypeName: getPlanPtoTypeName,
        getPlanPtoPlanTypeName: getPlanPtoPlanTypeName
    }
}]);


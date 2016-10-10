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
    $scope.state = '';
    $scope.showStateName = false;
    $scope.ptoPlans = [];
    $scope.isPageLoading = function() {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    setStatus("Loading");
    modified(false);
    checkStatus();
    $scope.levelSelected = "";
    $scope.closeDialog = true;

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
            $scope.ptoPlans = result;
        });
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, function (result) {
            $scope.companyPlans = result;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
    });

    $scope.onLevelChange = function (level) {
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

    $scope.search = function () {
        $scope.pageLoading = true;
        setStatus("Loading");
        $scope.state = '';
        $scope.showStateName = false;
        EmpActions.getPTOPlans($scope.ptoYear, function(result) {
            $scope.plans = result;
            $scope.ptoPlans = $scope.plans;
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

    $scope.stateSelected = function(item) {
        $scope.loadingTitle = " Loading...";
        $scope.pageLoading = true;
        $scope.selectedState = item;
        $scope.state = item.name;
        $scope.showStateName = true;
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

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 2, function (result) {
            var statePlans = result;
            $scope.statePlans = [];
            angular.forEach(statePlans, function (statePlan, index) {
                if (statePlan.ptoPlanId > 0) {
                    $scope.statePlans.push(statePlan);
                }
            });
        });

        EmpActions.getPlanAssignments($scope.ptoYear, item.id, 3, function (result) {
            $scope.selectedCountys = result;
            $scope.countys = [];

            angular.forEach($scope.selectedCountys, function(county, index) {
                var similarCounty = false;
                if (county.ptoPlanId > 0) {
                    if ($scope.countys.length >= 1) {
                        angular.forEach($scope.countys, function(planCounty, index) {
                            if (planCounty.name === county.name)
                                similarCounty = true;
                        });
                        if (!similarCounty)
                            $scope.countys.push(county);
                    }
                    else
                        $scope.countys.push(county);
                }
                else if (county.ptoPlanId === 0)
                    $scope.countys.push(county);

            });

            angular.forEach($scope.countys, function(county, index) {
                county.countyPlans = [];
            });

            angular.forEach($scope.selectedCountys, function(selectedCounty, index) {
                if (selectedCounty.ptoPlanId > 0) {
                    angular.forEach($scope.countys, function(planCounty, index) {
                        if (planCounty.name === selectedCounty.name)
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
                            if (planCity.name === city.name)
                                similarCity = true;
                        });
                        if (!similarCity)
                            $scope.cities.push(city);
                    }
                    else
                        $scope.cities.push(city);
                }
                else if (city.ptoPlanId === 0)
                    $scope.cities.push(city);

            });

            angular.forEach($scope.selectedCities, function(city, index) {
                city.cityPlans = [];
            });

            angular.forEach($scope.selectedCities, function(selectedCity, index) {
                if (selectedCity.ptoPlanId > 0) {
                    angular.forEach($scope.cities, function(planCity, index) {
                        if (planCity.name === selectedCity.name)
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
                            if (planHouseCode.name === houseCode.name)
                                similarHouseCode = true;
                        });
                        if (!similarHouseCode)
                            $scope.houseCodes.push(houseCode);
                    }
                    else
                        $scope.houseCodes.push(houseCode);
                }
                else if (houseCode.ptoPlanId === 0)
                    $scope.houseCodes.push(houseCode);
            });

            angular.forEach($scope.selectedHouseCodes, function (houseCode, index) {
                houseCode.houseCodePlans = [];
            });

            angular.forEach($scope.selectedHouseCodes, function (selectedHouseCode, index) {
                if (selectedHouseCode.ptoPlanId > 0) {
                    angular.forEach($scope.houseCodes, function (planHouseCode, index) {
                        if (planHouseCode.name === selectedHouseCode.name)
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

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedStatePlan.ptoPlanTitle + "]?"))
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

		if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCompanyPlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCountyPlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedCityPlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Are you sure you want to delete the plan name [" + $scope.selectedHouseCodePlan.ptoPlanTitle + "]?"))
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
        $scope.plans = [];
        $scope.selectedPlan = null;
        angular.forEach($scope.ptoPlans, function (plan, index) {
            if (plan.isChecked) {
                plan.isChecked = false;
            }
        });
        if (level === "company") {
            $scope.modalPlans = [];
            angular.forEach($scope.ptoPlans, function (plan, index) {
                var foundCompanyPlan = false;
                angular.forEach($scope.companyPlans, function (companyPlan, index) {
                    if (companyPlan.ptoPlanId === plan.id) {
                        foundCompanyPlan = true;
                    }
                });
                if (!foundCompanyPlan) {
                    $scope.modalPlans.push(plan);
                }
            });
            $scope.plans = $scope.modalPlans;
        }
        else if (level === "state") {
            if ($scope.selectedState === undefined || $scope.selectedState === null)
                return;
            $scope.modalPlans = [];
            angular.forEach($scope.ptoPlans, function (plan, index) {
                var foundStatePlan = false;
                angular.forEach($scope.statePlans, function (statePlan, index) {
                    if (statePlan.ptoPlanId === plan.id) {
                        foundStatePlan = true;
                    }
                });
                if (!foundStatePlan) {
                    $scope.modalPlans.push(plan);
                }
            });
            $scope.plans = $scope.modalPlans;
        }
        else if (level === "city") {
            if ($scope.selectedCity === undefined || $scope.selectedCity === null)
                return;
            $scope.modalPlans = [];
            angular.forEach($scope.ptoPlans, function (plan, index) {
                var foundCityPlan = false;
                angular.forEach($scope.selectedCity.cityPlans, function (cityPlan) {
                    if (cityPlan.ptoPlanId === plan.id) {
                        foundCityPlan = true;
                    }
                });
                if (!foundCityPlan) {
                    $scope.modalPlans.push(plan);
                }
            });
            $scope.plans = $scope.modalPlans;
        }
        else if (level === "houseCode") {
            if ($scope.selectedHouseCode === undefined || $scope.selectedHouseCode === null)
                return;

            $scope.modalPlans = [];
            angular.forEach($scope.ptoPlans, function (plan, index) {
                var foundHouseCodePlan = false;
                angular.forEach($scope.selectedHouseCode.houseCodePlans, function (houseCodePlan) {
                    if (houseCodePlan.ptoPlanId === plan.id) {
                        foundHouseCodePlan = true;
                    }
                });
                if (!foundHouseCodePlan) {
                    $scope.modalPlans.push(plan);
                }
            });
            $scope.plans = $scope.modalPlans;
        }
        else if (level === "county") {
            if ($scope.selectedCounty === undefined || $scope.selectedCounty === null)
                return;

            $scope.modalPlans = [];
            angular.forEach($scope.ptoPlans, function (plan, index) {
                var foundCountyPlan = false;
                angular.forEach($scope.selectedCounty.countyPlans, function (countyPlan) {
                    if (countyPlan.ptoPlanId === plan.id) {
                        foundCountyPlan = true;
                    }
                });
                if (!foundCountyPlan) {
                    $scope.modalPlans.push(plan);
                }
            });
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

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        $scope.levelSelected = "state";
    };

    $scope.saveCompanyPlans = function () {
        if ($scope.selectedCompanyPlan === undefined || $scope.selectedCompanyPlan === null)
            return;
		EmpActions.actionSaveItem($scope, $scope.companyPlans, function(data, status) {
			$scope.$apply(function () {
				$scope.pageLoading = false;
				setStatus("Saved");
				modified(false);
            });
		});
    };

    $scope.saveStatePlans = function () {
        EmpActions.actionSaveItem($scope, $scope.statePlans, function (data, status) {
            $scope.$apply(function () {
                $scope.pageLoading = false;
                setStatus("Saved");
                modified(false);
            });
        });
    };

    $scope.saveCountyPlans = function () {
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
            EmpActions.actionSaveItem($scope, modifiedPlans, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

    $scope.saveCityPlans = function () {
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
            EmpActions.actionSaveItem($scope, modifiedPlans, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

    $scope.saveHouseCodePlans = function () {
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
            EmpActions.actionSaveItem($scope, modifiedPlans, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
    };

    $scope.addSelectedPlan = function () {
        $scope.closeDialog = true;
        if ($scope.levelSelected === "company") {
            var found = false;
            var similarPlan = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.companyPlans, function (companyPlan) {
                        if (companyPlan.ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                            && $scope.plans[index].ptoPlanTypeTitle === companyPlan.ptoPlanTypeTitle) {
                            found = true;
                            alert("Plan with PTO Type: [" + companyPlan.ptoTypeTitle + "] and Plan Type: [" + companyPlan.ptoPlanTypeTitle + "] is already exists.");
                        }
                    });
                }
            }
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.plans, function (commonPlan) {
                        if (commonPlan.isChecked && commonPlan.id !== $scope.plans[index].id && $scope.plans[index].ptoTypeTitle === commonPlan.ptoTypeTitle &&
                            $scope.plans[index].ptoPlanTypeTitle === commonPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("You cannot select plans with same PTO Type: [" + commonPlan.ptoTypeTitle + "] and Plan Type: [" + commonPlan.ptoPlanTypeTitle + "].");
                        }
                    });
                }
                if (similarPlan)
                    break;
            }

            if (found || similarPlan) {
                $scope.closeDialog = false;
            }

            if (!found && !similarPlan) {
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
                        item["ptoPlanTitle"] = $scope.plans[index].title;
                        item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
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
        else if ($scope.levelSelected === "state") {
            var found = false;
            var similarPlan = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.statePlans, function (statePlan) {
                        if (statePlan.ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                            && $scope.plans[index].ptoPlanTypeTitle === statePlan.ptoPlanTypeTitle) {
                            found = true;
                            alert("Plan with PTO Type:" + statePlan.ptoTypeTitle + " and Plan Type:" + statePlan.ptoPlanTypeTitle + " is already exists.");
                        }
                    });
                }
            }

            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.plans, function (commonPlan) {
                        if (commonPlan.isChecked && commonPlan.id !== $scope.plans[index].id && $scope.plans[index].ptoTypeTitle === commonPlan.ptoTypeTitle &&
                            $scope.plans[index].ptoPlanTypeTitle === commonPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("You cannot select plans with same PTO Type: [" + commonPlan.ptoTypeTitle + "] and Plan Type: [" + commonPlan.ptoPlanTypeTitle + "].");
                        }
                    });
                }
                if (similarPlan)
                    break;
            }

            if (found || similarPlan) {
                $scope.closeDialog = false;
            }

            if (!found && !similarPlan) {
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
                        item["ptoPlanTitle"] = $scope.plans[index].title;
                        item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
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
        else if ($scope.levelSelected === "county") {
            var found = false;
            var similarPlan = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.selectedCounty.countyPlans, function (countyPlan) {
                        if (countyPlan.ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                            && $scope.plans[index].ptoPlanTypeTitle === countyPlan.ptoPlanTypeTitle) {
                            found = true;
                            alert("Plan with PTO Type:" + countyPlan.ptoTypeTitle + " and Plan Type:" + countyPlan.ptoPlanTypeTitle + " is already exists.");
                        }
                    });
                }
            }
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.plans, function (commonPlan) {
                        if (commonPlan.isChecked && commonPlan.id !== $scope.plans[index].id && $scope.plans[index].ptoTypeTitle === commonPlan.ptoTypeTitle &&
                            $scope.plans[index].ptoPlanTypeTitle === commonPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("You cannot select plans with same PTO Type: [" + commonPlan.ptoType + "] and Plan Type: [" + commonPlan.ptoPlanTypeTitle + "].");
                        }
                    });
                }
                if (similarPlan)
                    break;
            }

            if (found || similarPlan) {
                $scope.closeDialog = false;
            }

            if (!found && !similarPlan) {
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
                        item["ptoPlanTitle"] = $scope.plans[index].title;
                        item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
                        $scope.selectedCounty.countyPlans.push(item);
                    }
                }

                EmpActions.actionSaveItem($scope, $scope.selectedCounty.countyPlans, function (data, status) {
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
						setStatus("Saved");
                    });
                });
            }
        }
        else if ($scope.levelSelected === "city") {
            var found = false;
            var similarPlan = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.selectedCity.cityPlans, function (cityPlan) {
                        if (cityPlan.ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                            && $scope.plans[index].ptoPlanTypeTitle === cityPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("Plan with PTO Type: [" + cityPlan.ptoTypeTitle + "] and Plan Type: [" + cityPlan.ptoPlanTypeTitle + "] is already exists.");
                        }
                    });
                }
            }
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.plans, function (commonPlan) {
                        if (commonPlan.isChecked && commonPlan.id !== $scope.plans[index].id && $scope.plans[index].ptoTypeTitle === commonPlan.ptoTypeTitle &&
                            $scope.plans[index].ptoPlanTypeTitle === commonPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("You can not select plans with same PTO Type: [" + commonPlan.ptoTypeTitle + "] and Plan Type: [" + commonPlan.ptoPlanTypeTitle + "].");
                        }
                    });
                }
                if (similarPlan)
                    break;
            }

            if (found || similarPlan) {
                $scope.closeDialog = false;
            }

            if (!found && !similarPlan) {
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
                        item["ptoPlanTitle"] = $scope.plans[index].title;
                        item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
                        $scope.selectedCity.cityPlans.push(item);
                    }
                }

                EmpActions.actionSaveItem($scope, $scope.selectedCity.cityPlans, function (data, status) {
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
						setStatus("Saved");
                    });
                });
                    
            }
        }
        else if ($scope.levelSelected === "houseCode") {
            var found = false;
            var similarPlan = false;
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.selectedHouseCode.houseCodePlans, function (houseCodePlan) {
                        if (houseCodePlan.ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                            && $scope.plans[index].ptoPlanTypeTitle === houseCodePlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("Plan with PTO Type:" + houseCodePlan.ptoTypeTitle + " and Plan Type:" + houseCodePlan.ptoPlanTypeTitle + " is already exists.");
                        }
                    });
                }
            }
            for (var index = 0; index < $scope.plans.length; index++) {
                if ($scope.plans[index].isChecked) {
                    angular.forEach($scope.plans, function (commonPlan) {
                        if (commonPlan.isChecked && commonPlan.id !== $scope.plans[index].id && $scope.plans[index].ptoTypeTitle === commonPlan.ptoTypeTitle &&
                            $scope.plans[index].ptoPlanTypeTitle === commonPlan.ptoPlanTypeTitle) {
                            similarPlan = true;
                            alert("You can not select plans with same PTO Type: [" + commonPlan.ptoTypeTitle + "] and Plan Type: [" + commonPlan.ptoPlanTypeTitle + "].");
                        }
                    });
                }
                if (similarPlan)
                    break;
            }

            if (found || similarPlan) {
                $scope.closeDialog = false;
            }

            if (!found && !similarPlan) {
                for (var index = 0; index < $scope.plans.length; index++) {
                    if ($scope.plans[index].isChecked) {
                        var item = {};
                        item["id"] = 0;
                        item["ptoYearId"] = $scope.ptoYear;
                        item["stateType"] = $scope.selectedState.id;
                        item["houseCodeId"] = $scope.selectedHouseCode.houseCodeId;
                        item["ptoPlanId"] = $scope.plans[index].id;
                        item["groupType"] = 5;
                        item["name"] = $scope.selectedHouseCode.name;
                        item["active"] = true;
                        item["modified"] = true;
                        item["ptoPlanTitle"] = $scope.plans[index].title;
                        item["ptoTypeTitle"] = $scope.plans[index].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.plans[index].ptoPlanTypeTitle;
                        $scope.selectedHouseCode.houseCodePlans.push(item);
                    }
                }

                EmpActions.actionSaveItem($scope, $scope.selectedHouseCode.houseCodePlans, function (data, status) {
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
						setStatus("Saved");
                    });
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
        $scope.levelSelected = "county";
    };

    $scope.countySelected = function(item) {
        $scope.selectedCounty = item;
        $scope.levelSelected = "county";
    }

    $scope.cityPlanSelected = function(item) {
        $scope.selectedCityPlan = item;
        $scope.levelSelected = "city";
    }

    $scope.citySelected = function(item) {
        $scope.selectedCity = item;
        $scope.levelSelected = "city";
    }

    $scope.houseCodeSelected = function(item) {
        $scope.selectedHouseCode = item;
        $scope.levelSelected = "houseCode";
    }

    $scope.houseCodePlanSelected = function(item) {
        $scope.selectedHouseCodePlan = item;
        $scope.levelSelected = "houseCode";
    }

    $scope.statePlanSelected = function(item) {
        $scope.selectedStatePlan = item;
        $scope.levelSelected = "state";
    }

    $scope.countyPlanSelected = function(countyPlan) {
        $scope.selectedCountyPlan = countyPlan;
        $scope.levelSelected = "county";
    };

    $scope.cityPlanSelected = function(cityPlan) {
        $scope.selectedCityPlan = cityPlan;
        $scope.levelSelected = "city";
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
        if ($scope.assignedCountys.length === $scope.countys.length) {
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
        if ($scope.assignedCities.length === $scope.cities.length) {
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
        if ($scope.assignedHouseCodes.length === $scope.houseCodes.length) {
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
    $scope.ok = function () {
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

	var getPTOYears = function (callback) {
	    apiRequest('emp', 'iiCache', '<criteria>storeId:ptoYears,userId:[user]'
			+ ',</criteria>', function (xml) {
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
                                if ($scope.levelSelected === "company") {
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
                                else if ($scope.levelSelected === "state") {
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
                                else if ($scope.levelSelected === "county") {
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
                                else if ($scope.levelSelected === "city") {
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
                                else if ($scope.levelSelected === "houseCode") {
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
        getPlanAssignments: getPlanAssignments,
        deletePlan: deletePlan,
		actionSaveItem: actionSaveItem,
		transactionMonitor: transactionMonitor
    }
}]);
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
    if (parent.fin !== undefined && parent.fin.appUI !== undefined && parent.fin.appUI.modified) {
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

var modified = function (isModified) {
    var me = this;
 
    if (parent.fin !== undefined) {
        if (parent.fin.appUI !== undefined) {
            parent.fin.appUI.modified = isModified;
        }
    }
};

var getCurrentYear = function () {
    var currentYear = "";

    if (parent.fin !== undefined) {
        if (parent.fin.appUI !== undefined) {
            var currentYear = new Date(parent.fin.appUI.glbCurrentDate).getFullYear();
        }
    }
    return currentYear;
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
    $scope.disableCloneOk = true;
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
    $scope.stateGridMinHeight = $(window).height() - 210;
    $scope.stateGridHeight = $scope.stateGridMinHeight;
    $scope.statePlanGridMinHeight = 200;
    $scope.countyPlanGridMinHeight = 200;
    $scope.cityPlanGridMinHeight = 200;
    $scope.houseCodePlanGridMinHeight = 200;
	$scope.action = "";
	$scope.cloneGridMaxHeight = $(window).height() - 100;
	$scope.disableCompanyCloneButton = false;
	$scope.disableStateCloneButton = false;
	$scope.disableCountyCloneButton = false;
	$scope.disableCityCloneButton = false;
	$scope.disableHouseCodeCloneButton = false;
    var modalOptions = {
        templateUrl: 'cloneGrid.html',
        controller: 'modalInstanceCtrl',
        title: "Clone Plan",
        size: 'sm',
        backdrop: 'static',
        keyboard: false,
        scope: $scope
    };

    EmpActions.getPTOTypes(function(result) {
    });
	
    EmpActions.getPTOPlanTypes(function(result) {
    });

    EmpActions.getPTOYears(function(result) {
        $scope.ptoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
        }
       
        if (result[0].name == getCurrentYear() || result[0].name == parseInt(getCurrentYear()) + 1) {
            $scope.disableCompanyCloneButton = false;
            $scope.disableStateCloneButton = false;
            $scope.disableCountyCloneButton = false;
            $scope.disableCityCloneButton = false;
            $scope.disableHouseCodeCloneButton = false;
        }
        else {
            $scope.disableCompanyCloneButton = true;
            $scope.disableStateCloneButton = true;
            $scope.disableCountyCloneButton = true;
            $scope.disableCityCloneButton = true;
            $scope.disableHouseCodeCloneButton = true;
        }

        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, 0, function(result) {
            $scope.companyPlans = result;
			if ($scope.companyPlans.length > 0)
                $scope.disableCompanyCloneButton = true;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
    });

    $scope.resetSelection = function () {
        $scope.selectedCounty = null;
        $scope.selectedCity = null;
        $scope.selectedHouseCode = null;
        $scope.selectedCompanyPlan = null;
        $scope.selectedStatePlan = null;
        $scope.selectedCountyPlan = null;
        $scope.selectedCityPlan = null;
        $scope.selectedHouseCodePlan = null;
        $scope.statePlans = [];
        $scope.countys = [];
        $scope.cities = [];
        $scope.houseCodes = [];
        $scope.assignedCountys = [];
        $scope.assignedCities = [];
        $scope.assignedHouseCodes = [];
    };

    $scope.onYearChange = function () {
        $scope.selectedState = null;
        $scope.resetSelection();
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");
        $scope.showStateName = false;

        for (var index = 0; index < $scope.ptoYears.length; index++) {
            if ($scope.ptoYears[index].id == $scope.ptoYear) {
                if ($scope.ptoYears[index].name == getCurrentYear() || $scope.ptoYears[index].name == parseInt(getCurrentYear()) + 1) {
                    $scope.disableCompanyCloneButton = false;
                    $scope.disableStateCloneButton = false;
                    $scope.disableCountyCloneButton = false;
                    $scope.disableCityCloneButton = false;
                    $scope.disableHouseCodeCloneButton = false;
                }
                else {
                    $scope.disableCompanyCloneButton = true;
                    $scope.disableStateCloneButton = true;
                    $scope.disableCountyCloneButton = true;
                    $scope.disableCityCloneButton = true;
                    $scope.disableHouseCodeCloneButton = true;
                }
                break;
            }
        }
        
        EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, 0, function (result) {
            $scope.companyPlans = result;
            if ($scope.companyPlans.length > 0)
                $scope.disableCompanyCloneButton = true;
         
            $scope.pageLoading = false;
            setStatus("Normal");
        });
    };

    $scope.onLevelChange = function(level) {
        $scope.disableOk = true;
        $scope.disableCloneOk = true;

        if (level === "state") {
            if (editStatus())
                return;
            $scope.loadingTitle = " Loading...";
            $scope.selectedState = null;
            $scope.pageLoading = true;
            $scope.showStateGrid = true;
            $scope.showCompanyGrid = false;
            setStatus("Loading");
            $scope.showState = false;
            $scope.showCounty = false;
            $scope.showCity = false;
            $scope.showHouseCode = false;
            $scope.stateGridHeight = $scope.stateGridMinHeight;
            EmpActions.getStateTypes(function (result) {
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
        $scope.loadingTitle = " Loading...";
        setStatus("Loading");
		$scope.action = "";
		$scope.showStateName = false;
		$scope.stateName = "";
        $scope.statePlans = [];
        $scope.countys = [];
        $scope.cities = [];
        $scope.houseCodes = [];
		$scope.selectedState = null;
		$scope.selectedCompanyPlan = null;
		$scope.selectedStatePlan = null;
		$scope.selectedCountyPlan = null;
		$scope.selectedCityPlan = null;
		$scope.selectedHouseCodePlan = null;
		if (level === "state")
		    $scope.setHeight();

       EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, 0, function(result) {
            $scope.companyPlans = result;
            if ($scope.companyPlans.length > 0)
                $scope.disableCompanyCloneButton = true;
            $scope.pageLoading = false;
            setStatus("Normal");
        });
    };

    $scope.stateSelected = function(item) {
		$scope.selectedState = item;
		$scope.action = "";
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
		$scope.disableStateCloneButton = false;
		$scope.disableCountyCloneButton = false;
		$scope.disableCityCloneButton = false;
		$scope.disableHouseCodeCloneButton = false;
		setStatus("Loading");
		$scope.getStatePlanAssignments();
        $scope.getCountyPlanAssignments();
		$scope.getCityPlanAssignments();
		$scope.getHouseCodePlanAssignments();
		$scope.resetSelection();
    };

	$scope.getCompanyPlanAssignments = function() {
		EmpActions.getPlanAssignments($scope.ptoYear, 0, 1, 0, function(data) {
            $scope.companyPlans = data;
			if ($scope.companyPlans.length > 0)
                $scope.disableCompanyCloneButton = true;
        });
	};
	
	$scope.getStatePlanAssignments = function() {
		EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 2, 0, function(data) {
            $scope.statePlans = [];
            angular.forEach(data, function(statePlan, index) {
                if (statePlan.ptoPlanId > 0) {
                    $scope.statePlans.push(statePlan);
                }
            });
            if ($scope.statePlans.length > 0)
                $scope.disableStateCloneButton = true;
        });
	};
	
	$scope.getCountyPlanAssignments = function() {
		EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 3, 0, function(data) {
		    $scope.countys = [];
		    $scope.countysWithPlans = [];

            angular.forEach(data, function(county, index) {
                var found = false;
                if (county.ptoPlanId > 0)
                    $scope.countysWithPlans.push(county);

                if ($scope.countys.length > 0) {
                    for (var index = 0; index < $scope.countys.length; index++) {
                        if ($scope.countys[index].name === county.name) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        county.countyPlans = [];
                        $scope.countys.push(county);
                    }
                }
                else {
                    county.countyPlans = [];
                    $scope.countys.push(county);
                }
            });

            angular.forEach($scope.countysWithPlans, function (county, index) {
                if (county.ptoPlanId > 0) {
                    angular.forEach($scope.countys, function (countyPlan, index) {
                        if (countyPlan.name === county.name) {
                            countyPlan.countyPlans.push(county);
                            $scope.disableCountyCloneButton = true;
                        }
                    });
                }
            });

			$scope.assignedCountys = $scope.countys;
            $scope.setStateGridHeight();
        });
	};
	
	$scope.getCityPlanAssignments = function() {
		EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 4, 0, function(data) {
		    $scope.cities = [];
		    $scope.citiesNames = [];
		    $scope.citiesWithPlans = [];

            angular.forEach(data, function(city, index) {
                var found = false;
                if (city.ptoPlanId > 0)
                    $scope.citiesWithPlans.push(city);
               
                if ($scope.citiesNames.length > 0) {
                    for (var index = 0; index < $scope.citiesNames.length; index++) {
                        if ($scope.citiesNames[index] === city.name) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        $scope.citiesNames.push(city.name);
                        var county = city.name.substring(city.name.indexOf("(") + 1, city.name.indexOf(")"));
                        city.tooltipText = "County: " + county;
                        city.name = city.name.slice(0, city.name.indexOf("("));
                        if (city.name !== "" && city.name !== null && city.name !== undefined) {
                            city.cityPlans = [];
                            $scope.cities.push(city);
                        }
                    }
                }
                else {
                    $scope.citiesNames.push(city.name);
                    var county = city.name.substring(city.name.indexOf("(") + 1, city.name.indexOf(")"));
                    city.tooltipText = "County: " + county;
                    city.name = city.name.slice(0, city.name.indexOf("("));
                    if (city.name !== "" && city.name !== null && city.name !== undefined) {
                        city.cityPlans = [];
                        $scope.cities.push(city);
                    }
                }
            });

            angular.forEach($scope.citiesWithPlans, function (city, index) {
                if (city.ptoPlanId > 0) {
                    angular.forEach($scope.cities, function (cityPlan, index) {
                        if (cityPlan.title === city.title) {
                            cityPlan.cityPlans.push(city);
                            $scope.disableCityCloneButton = true;
                        }
                    });
                }
            });

            $scope.assignedCities = $scope.cities;
            $scope.setStateGridHeight();
        });
	};
	
	$scope.getHouseCodePlanAssignments = function() {
		 EmpActions.getPlanAssignments($scope.ptoYear, $scope.selectedState.id, 5, 0, function(data) {
		     $scope.houseCodes = [];
		     $scope.houseCodesWithPlans = [];

            angular.forEach(data, function(houseCode, index) {
                var found = false;
                if (houseCode.ptoPlanId > 0)
                    $scope.houseCodesWithPlans.push(houseCode);

                if ($scope.houseCodes.length > 0) {
                    for (var index = 0; index < $scope.houseCodes.length; index++) {
                        if ($scope.houseCodes[index].title === houseCode.title) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        var county = houseCode.name.substring(houseCode.name.indexOf("(") + 1, houseCode.name.indexOf(")"));
                        var city = houseCode.name.substring(houseCode.name.indexOf("{") + 1, houseCode.name.indexOf("}"));
                        houseCode.tooltipText = ["County: " + county, "City: " + city];
                        if (houseCode.name.indexOf("(") > 0)
                            houseCode.name = houseCode.name.substring(0, houseCode.name.indexOf("("));
                        houseCode.houseCodePlans = [];
                        $scope.houseCodes.push(houseCode);
                    }
                }
                else {
                    var county = houseCode.name.substring(houseCode.name.indexOf("(") + 1, houseCode.name.indexOf(")"));
                    var city = houseCode.name.substring(houseCode.name.indexOf("{") + 1, houseCode.name.indexOf("}"));
                    houseCode.tooltipText = ["County: " + county, "City: " + city];
                    if (houseCode.name.indexOf("(") > 0) 
                        houseCode.name = houseCode.name.substring(0, houseCode.name.indexOf("("));
                    houseCode.houseCodePlans = [];
                    $scope.houseCodes.push(houseCode);
                }
            });

            angular.forEach($scope.houseCodesWithPlans, function (houseCode, index) {
                if (houseCode.ptoPlanId > 0) {
                    angular.forEach($scope.houseCodes, function (houseCodePlan, index) {
                        if (houseCodePlan.title === houseCode.title) {
                            houseCodePlan.houseCodePlans.push(houseCode);
                            $scope.disableHouseCodeCloneButton = true;
                        }
                    });
                }
            });
            $scope.assignedHouseCodes = $scope.houseCodes;
            $scope.setStateGridHeight();
            $scope.pageLoading = false;
            setStatus("Normal");
        });
	};

    $scope.setStateGridHeight = function () {
        var totalGridsHeight = angular.element('#statePlanDetailsGrid').height() + angular.element('#countyPlanDetailsGrid').height()
        	+ angular.element('#cityPlanDetailsGrid').height() + angular.element('#houseCodePlanDetailsGrid').height();

        if (totalGridsHeight > $scope.stateGridHeight) {
            $scope.stateGridHeight = 1350;
        }
    };

    $scope.setHeight = function (type, showGrid) {
        var totalGridsHeight = angular.element('#statePlanDetailsGrid').height() + angular.element('#countyPlanDetailsGrid').height()
        	+ angular.element('#cityPlanDetailsGrid').height() + angular.element('#houseCodePlanDetailsGrid').height();
        var height = 70;
        var marginHeight = 270;

        if (type !== "state") {
            height = height + 15;
            marginHeight = marginHeight + 15;
        }

        if (angular.element("#" + type + "PlanDetailsGrid").height() >= 200 && !showGrid) {
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
        else if (angular.element("#" + type + "PlanDetailsGrid").height() === 0 && showGrid) {
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
        else if (!showGrid)
            $scope.stateGridHeight = 1350;
    };

    $scope.addPlan = function(level) {
        $scope.disableOk = true;
		$scope.selectedPlan = null;
        $scope.plans = [];
        $scope.modalPlans = [];

        if (level === "company") {
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            setStatus("Loading");
            EmpActions.getPTOPlans(0, $scope.ptoYear, 0, 1, 0, '', function (result) {
                $scope.plans = result;
                $scope.ptoPlans = result;
                angular.forEach($scope.ptoPlans, function (plan, index) {
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
                $scope.plans = $scope.modalPlans;
                $scope.pageLoading = false;
                setStatus("Normal");
                $scope.openModel();
            });
        }
        else if (level === "state") {
            if ($scope.selectedState === undefined || $scope.selectedState === null)
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            setStatus("Loading");
            EmpActions.getPTOPlans(0, $scope.ptoYear, $scope.selectedState.id, 2, 0, '', function (result) {
                $scope.ptoPlans = result;
                angular.forEach($scope.ptoPlans, function (plan, index) {
                    var found = false;
                    for (var index = 0; index < $scope.statePlans.length; index++) {
                        if ($scope.statePlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.companyPlans.length; index++) {
                        if ($scope.companyPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        $scope.modalPlans.push(plan);
                });
                $scope.plans = $scope.modalPlans;
                $scope.pageLoading = false;
                setStatus("Normal");
                $scope.openModel();
            });
        }
		else if (level === "county") {
            if ($scope.selectedCounty === undefined || $scope.selectedCounty === null)
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            setStatus("Loading");
            EmpActions.getPTOPlans(0, $scope.ptoYear, $scope.selectedState.id, 3, 0, '', function (result) {
                $scope.ptoPlans = result;
                angular.forEach($scope.ptoPlans, function (plan, index) {
                    var found = false;
                    for (var index = 0; index < $scope.selectedCounty.countyPlans.length; index++) {
                        if ($scope.selectedCounty.countyPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.statePlans.length; index++) {
                        if ($scope.statePlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.companyPlans.length; index++) {
                        if ($scope.companyPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        $scope.modalPlans.push(plan);
                });
                $scope.plans = $scope.modalPlans;
                $scope.pageLoading = false;
                setStatus("Normal");
                $scope.openModel();
            });
        }
        else if (level === "city") {
            if ($scope.selectedCity === undefined || $scope.selectedCity === null)
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            setStatus("Loading");
            EmpActions.getPTOPlans(0, $scope.ptoYear, $scope.selectedState.id, 4, $scope.selectedCity.appZipCodeType, $scope.selectedCity.title.substring($scope.selectedCity.title.indexOf("(") + 1, $scope.selectedCity.title.indexOf(")")), function (result) {
                $scope.ptoPlans = result;
                angular.forEach($scope.ptoPlans, function (plan, index) {
                    var found = false;
                    for (var index = 0; index < $scope.selectedCity.cityPlans.length; index++) {
                        if ($scope.selectedCity.cityPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.statePlans.length; index++) {
                        if ($scope.statePlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.companyPlans.length; index++) {
                        if ($scope.companyPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        $scope.modalPlans.push(plan);
                });
                $scope.plans = $scope.modalPlans;
                $scope.pageLoading = false;
                setStatus("Normal");
                $scope.openModel();
            });
        }
        else if (level === "houseCode") {
            if ($scope.selectedHouseCode === undefined || $scope.selectedHouseCode === null)
                return;
            $scope.loadingTitle = " Loading...";
            $scope.pageLoading = true;
            setStatus("Loading");
            EmpActions.getPTOPlans($scope.selectedHouseCode.houseCodeId, $scope.ptoYear, $scope.selectedState.id, 5, 0, '', function (result) {
                $scope.ptoPlans = result;
                angular.forEach($scope.ptoPlans, function (plan, index) {
                    var found = false;
                    for (var index = 0; index < $scope.selectedHouseCode.houseCodePlans.length; index++) {
                        if ($scope.selectedHouseCode.houseCodePlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.statePlans.length; index++) {
                        if ($scope.statePlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    for (var index = 0; index < $scope.companyPlans.length; index++) {
                        if ($scope.companyPlans[index].ptoPlanId === plan.id) {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        $scope.modalPlans.push(plan);
                });
                $scope.plans = $scope.modalPlans;
                $scope.pageLoading = false;
                setStatus("Normal");
                $scope.openModel();
            });
        }

        angular.forEach($scope.ptoPlans, function (plan, index) {
            if (plan.isChecked) {
                plan.isChecked = false;
            }
        });

        $scope.levelSelected = level;
    };

    $scope.openModel = function () {
        var ptoModalInstance = $modal.open({
            templateUrl: 'planGrid.html',
            controller: 'modalInstanceCtrl',
            title: "Select Plan",
            size: 'sm',
            backdrop: 'static',
            keyboard: false,
            scope: $scope
        });
    };

    $scope.getDate = function (date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'yyyy-MM-dd');
    };

	$scope.validatePlan = function(assignedPlans) {
		var found = false;

		outerLoop:
		for (var index = 0; index < $scope.plans.length; index++) {
		    if ($scope.plans[index].isChecked) {
		        for (var iIndex = 0; iIndex < assignedPlans.length; iIndex++) {
		            if ($scope.plans[index].ptoTypeTitle === assignedPlans[iIndex].ptoTypeTitle
                        && (($scope.plans[index].minHours >= assignedPlans[iIndex].minHours || $scope.plans[index].minHours <= assignedPlans[iIndex].minHours) && $scope.plans[index].minHours <= assignedPlans[iIndex].maxHours)
                        && ($scope.plans[index].maxHours >= assignedPlans[iIndex].minHours && ($scope.plans[index].maxHours <= assignedPlans[iIndex].maxHours || $scope.plans[index].maxHours >= assignedPlans[iIndex].maxHours))
                        && $scope.plans[index].hourly === assignedPlans[iIndex].hourly && $scope.plans[index].salary === assignedPlans[iIndex].salary && $scope.plans[index].excludeUnion === assignedPlans[iIndex].excludeUnion
                        && $scope.plans[index].ptoPlanTypeFullTime === assignedPlans[iIndex].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === assignedPlans[iIndex].ptoPlanTypePartTime) {
		                alert("Plan with PTO Type: [" + assignedPlans[iIndex].ptoTypeTitle + "], Plan Type: [" + assignedPlans[iIndex].ptoPlanTypeTitle + "], Pay Type, Pay Status and Hours Range is already exists.");
		                found = true;
		                break outerLoop;
		            }
		            if ($scope.plans[index].ptoTypeTitle === assignedPlans[iIndex].ptoTypeTitle && (($scope.getDate($scope.plans[index].startDate) >= $scope.getDate(assignedPlans[iIndex].ptoPlanStartDate) && $scope.getDate($scope.plans[index].startDate) <= $scope.getDate(assignedPlans[iIndex].ptoPlanEndDate))
                        || ($scope.getDate($scope.plans[index].endDate) >= $scope.getDate(assignedPlans[iIndex].ptoPlanStartDate) && $scope.getDate($scope.plans[index].endDate) <= $scope.getDate(assignedPlans[iIndex].ptoPlanEndDate)))) {
		                alert("Plan with overlap date already exists.");
		                found = true;
		                break outerLoop;
		            }
		        }

				for (var iIndex = 0; iIndex < $scope.plans.length; iIndex++) {
					if ($scope.plans[iIndex].isChecked && $scope.plans[index].id !== $scope.plans[iIndex].id 
						&& $scope.plans[index].ptoTypeTitle === $scope.plans[iIndex].ptoTypeTitle
                        && (($scope.plans[index].minHours >= $scope.plans[iIndex].minHours || $scope.plans[index].minHours <= $scope.plans[iIndex].minHours) && $scope.plans[index].minHours <= $scope.plans[iIndex].maxHours)
                        && ($scope.plans[index].maxHours >= $scope.plans[iIndex].minHours && ($scope.plans[index].maxHours <= $scope.plans[iIndex].maxHours || $scope.plans[index].maxHours >= $scope.plans[iIndex].maxHours))
                        && $scope.plans[index].hourly === $scope.plans[iIndex].hourly && $scope.plans[index].salary === $scope.plans[iIndex].salary && $scope.plans[index].excludeUnion === $scope.plans[iIndex].excludeUnion
                        && $scope.plans[index].ptoPlanTypeFullTime === $scope.plans[iIndex].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === $scope.plans[iIndex].ptoPlanTypePartTime) {
					    alert("You cannot select plan with same PTO Type: [" + $scope.plans[index].ptoTypeTitle + "], Plan Type: [" + $scope.plans[index].ptoPlanTypeTitle + "], Pay Type, Pay Status and Hours Range.");
						found = true;
						break outerLoop;
                    }
                }
            }
        }

		return !found;
	};

	$scope.validateHigherLevelPlan = function (level, plan) {
	    if (level === "state" || level === "county" || level === "city" || level === "houseCode") {
	        for (var index = 0; index < $scope.companyPlans.length; index++) {
	            if ($scope.companyPlans[index].ptoTypeTitle === plan.ptoTypeTitle
                    && ((plan.minHours <= $scope.companyPlans[index].minHours || plan.minHours >= $scope.companyPlans[index].minHours) && plan.minHours <= $scope.companyPlans[index].maxHours)
                    && ((plan.maxHours <= $scope.companyPlans[index].maxHours || plan.maxHours >= $scope.companyPlans[index].maxHours) && plan.maxHours >= $scope.companyPlans[index].minHours)
                    && plan.hourly === $scope.companyPlans[index].hourly && plan.salary === $scope.companyPlans[index].salary && plan.excludeUnion === $scope.companyPlans[index].excludeUnion
                    && plan.ptoPlanTypeFullTime === $scope.companyPlans[index].ptoPlanTypeFullTime && plan.ptoPlanTypePartTime === $scope.companyPlans[index].ptoPlanTypePartTime) {
	                $scope.assigned = true;
	                if (!$scope.validAlert)
	                if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
	                    $scope.validPlan = false;
	                    $scope.validAlert = true;
	                    return;
	                }
	                $scope.validAlert = true;
	                break;
	            }
	        }
	    }
	    if (!$scope.assigned) {
	        if (level === "county" || level === "city" || level === "houseCode") {
	            for (var index = 0; index < $scope.statePlans.length; index++) {
	                if ($scope.statePlans[index].ptoTypeTitle === plan.ptoTypeTitle
                        && ((plan.minHours <= $scope.statePlans[index].minHours || plan.minHours >= $scope.statePlans[index].minHours) && plan.minHours <= $scope.statePlans[index].maxHours)
                        && ((plan.maxHours <= $scope.statePlans[index].maxHours || plan.maxHours >= $scope.statePlans[index].maxHours) && plan.maxHours >= $scope.statePlans[index].minHours)
                        && plan.hourly === $scope.statePlans[index].hourly && plan.salary === $scope.statePlans[index].salary && plan.excludeUnion === $scope.statePlans[index].excludeUnion
                        && plan.ptoPlanTypeFullTime === $scope.statePlans[index].ptoPlanTypeFullTime && plan.ptoPlanTypePartTime === $scope.statePlans[index].ptoPlanTypePartTime) {
	                    $scope.assigned = true;
	                    if (!$scope.validAlert)
	                    if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
	                        $scope.validPlan = false;
	                        $scope.validAlert = true;
	                        return;
	                    }
	                    $scope.validAlert = true;
	                    break;
	                }
	            }
	        }
	    }
	};

	$scope.addSelectedPlan = function() {
	    var valid = true;
	    $scope.validPlan = true;
	    $scope.assigned = false;
	    $scope.validAlert = false;

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
				$scope.action = "Add";

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
                    item["minHours"] = $scope.plans[index].minHours;
                    item["maxHours"] = $scope.plans[index].maxHours;
                    item["hourly"] = $scope.plans[index].hourly;
                    item["salary"] = $scope.plans[index].salary;
                    item["ptoPlanTypeFullTime"] = $scope.plans[index].ptoPlanTypeFullTime;
                    item["ptoPlanTypePartTime"] = $scope.plans[index].ptoPlanTypePartTime;
                    item["excludeUnion"] = $scope.plans[index].excludeUnion;
                    item["appZipCodeType"] = 0;
                   
					if ($scope.levelSelected === "company") {
						item["stateType"] = 0;
						item["groupType"] = 1;
						item["name"] = "";
						$scope.companyPlans.push(item);
						$scope.disableCompanyCloneButton = true;
					}
					else if ($scope.levelSelected === "state") {
					    if ($scope.companyPlans.length > 0)
					        $scope.validateHigherLevelPlan("state", $scope.plans[index]);

					    if ($scope.validPlan) {
					        item["stateType"] = $scope.selectedState.id;
					        item["groupType"] = 2;
					        item["name"] = $scope.selectedState.name;
					        $scope.statePlans.push(item);
					        $scope.disableStateCloneButton = true;
					    }
					}
					else if ($scope.levelSelected === "county") {
					    if ($scope.statePlans.length > 0 || $scope.companyPlans.length > 0)
					        $scope.validateHigherLevelPlan("county", $scope.plans[index]);

					    if ($scope.validPlan) {
					        item["stateType"] = $scope.selectedState.id;
					        item["groupType"] = 3;
					        item["name"] = $scope.selectedCounty.name;
					        item["appZipCodeType"] = $scope.selectedCounty.appZipCodeType;
					        $scope.selectedCounty.countyPlans.push(item);
					        $scope.disableCountyCloneButton = true;
					    }
	                }
					else if ($scope.levelSelected === "city") {
					    if ($scope.statePlans.length > 0 || $scope.companyPlans.length > 0) {
					        if ($scope.statePlans.length > 0 || $scope.companyPlans.length > 0)
					            $scope.validateHigherLevelPlan("city", $scope.plans[index]);
					    }

					    if (!$scope.assigned) {
					        for (var index1 = 0; index1 < $scope.countys.length; index1++) {
					            if ($scope.countys[index1].name == $scope.selectedCity.title.substring($scope.selectedCity.title.indexOf("(") + 1, $scope.selectedCity.title.indexOf(")")))
					                if ($scope.countys[index1].countyPlans.length > 0) {
					                    for (var index2 = 0; index2 < $scope.countys[index1].countyPlans.length; index2++) {
					                        if ($scope.countys[index1].countyPlans[index2].ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                                                && (($scope.plans[index].minHours <= $scope.countys[index1].countyPlans[index2].minHours || $scope.plans[index].minHours >= $scope.countys[index1].countyPlans[index2].minHours) && $scope.plans[index].minHours <= $scope.countys[index1].countyPlans[index2].maxHours)
                                                && (($scope.plans[index].maxHours <= $scope.countys[index1].countyPlans[index2].maxHours || $scope.plans[index].maxHours >= $scope.countys[index1].countyPlans[index2].maxHours) && $scope.plans[index].maxHours >= $scope.countys[index1].countyPlans[index2].minHours)
                                                && $scope.plans[index].hourly === $scope.countys[index1].countyPlans[index2].hourly && $scope.plans[index].salary === $scope.countys[index1].countyPlans[index2].salary && $scope.plans[index].excludeUnion === $scope.countys[index1].countyPlans[index2].excludeUnion
                                                && $scope.plans[index].ptoPlanTypeFullTime === $scope.countys[index1].countyPlans[index2].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === $scope.countys[index1].countyPlans[index2].ptoPlanTypePartTime) {
					                            $scope.assigned = true;
					                            if (!$scope.validAlert)
					                                if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
					                                    $scope.validPlan = false;
					                                    $scope.validAlert = true;
					                                    return;
					                                }
					                            $scope.validAlert = true;
					                            break;
					                        }
					                    }
					                }
					        }
					    }

					    if ($scope.validPlan) {
					        item["stateType"] = $scope.selectedState.id;
					        item["groupType"] = 4;
					        item["name"] = $scope.selectedCity.name;
					        item["appZipCodeType"] = $scope.selectedCity.appZipCodeType;
					        $scope.selectedCity.cityPlans.push(item);
					        $scope.disableCityCloneButton = true;
					    }
	                }
					else if ($scope.levelSelected === "houseCode") {
					    if ($scope.statePlans.length > 0 || $scope.companyPlans.length > 0) {
					        if ($scope.statePlans.length > 0 || $scope.companyPlans.length > 0)
					            $scope.validateHigherLevelPlan("county", $scope.plans[index]);
					    }
					    if (!$scope.assigned) {
					        for (var index3 = 0; index3 < $scope.countys.length; index3++) {
					            if ($scope.countys[index3].name == $scope.selectedHouseCode.title.substring($scope.selectedHouseCode.title.indexOf("(") + 1, $scope.selectedHouseCode.title.indexOf(")"))) {
					                if ($scope.countys[index3].countyPlans.length > 0) {
					                    for (var index4 = 0; index4 < $scope.countys[index3].countyPlans.length; index4++) {
					                        if ($scope.countys[index3].countyPlans[index4].ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                                                && (($scope.plans[index].minHours <= $scope.countys[index3].countyPlans[index4].minHours || $scope.plans[index].minHours >= $scope.countys[index3].countyPlans[index4].minHours) && $scope.plans[index].minHours <= $scope.countys[index3].countyPlans[index4].maxHours)
                                                && (($scope.plans[index].maxHours <= $scope.countys[index3].countyPlans[index4].maxHours || $scope.plans[index].maxHours >= $scope.countys[index3].countyPlans[index4].maxHours) && $scope.plans[index].maxHours >= $scope.countys[index3].countyPlans[index4].minHours)
                                                && $scope.plans[index].hourly === $scope.countys[index3].countyPlans[index4].hourly && $scope.plans[index].salary === $scope.countys[index3].countyPlans[index4].salary && $scope.plans[index].excludeUnion === $scope.countys[index3].countyPlans[index4].excludeUnion
                                                && $scope.plans[index].ptoPlanTypeFullTime === $scope.countys[index3].countyPlans[index4].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === $scope.countys[index3].countyPlans[index4].ptoPlanTypePartTime) {
					                            $scope.assigned = true;
					                            if (!$scope.validAlert)
					                                if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
					                                    $scope.validPlan = false;
					                                    $scope.validAlert = true;
					                                    return;
					                                }
					                            $scope.validAlert = true;
					                            break;
					                        }
					                    }
					                }
					                break;
					            }
					        }
					    }
					    if (!$scope.assigned) {
					        for (var index5 = 0; index5 < $scope.cities.length; index5++) {
					            if ($scope.cities[index5].name.replace(/\s*$/, "") == $scope.selectedHouseCode.title.substring($scope.selectedHouseCode.title.indexOf("{") + 1, $scope.selectedHouseCode.title.indexOf("}"))) {
					                if ($scope.cities[index5].cityPlans.length > 0) {
					                    for (var index6 = 0; index6 < $scope.cities[index5].cityPlans.length; index6++) {
					                        if ($scope.cities[index5].cityPlans[index6].ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                                                && (($scope.plans[index].minHours <= $scope.cities[index5].cityPlans[index6].minHours || $scope.plans[index].minHours >= $scope.cities[index5].cityPlans[index6].minHours) && $scope.plans[index].minHours <= $scope.cities[index5].cityPlans[index6].maxHours)
                                                && (($scope.plans[index].maxHours <= $scope.cities[index5].cityPlans[index6].maxHours || $scope.plans[index].maxHours >= $scope.cities[index5].cityPlans[index6].maxHours) && $scope.plans[index].maxHours >= $scope.cities[index5].cityPlans[index6].minHours)
                                                && $scope.plans[index].hourly === $scope.cities[index5].cityPlans[index6].hourly && $scope.plans[index].salary === $scope.cities[index5].cityPlans[index6].salary && $scope.plans[index].excludeUnion === $scope.cities[index5].cityPlans[index6].excludeUnion
                                                && $scope.plans[index].ptoPlanTypeFullTime === $scope.cities[index5].cityPlans[index6].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === $scope.cities[index5].cityPlans[index6].ptoPlanTypePartTime) {
					                            $scope.assigned = true;
					                            if (!$scope.validAlert)
					                                if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
					                                    $scope.validPlan = false;
					                                    $scope.validAlert = true;
					                                    return;
					                                }
					                            $scope.validAlert = true;
					                            break;
					                        }
					                    }
					                }
					                break;
					            }
					        }
					    }
					    if (!$scope.assigned) {
					        EmpActions.getPTOPlans($scope.selectedHouseCode, $scope.ptoYear, $scope.selectedState.id, 0, 0, function (result) {
					            if (result.length > 0) {
					                for (var index7 = 0; index7 < result.length; index7++) {
					                    if (result[index7].ptoTypeTitle === $scope.plans[index].ptoTypeTitle
                                            && (($scope.plans[index].minHours <= result[index7].minHours || $scope.plans[index].minHours >= result[index7].minHours) && $scope.plans[index].minHours <= result[index7].maxHours)
                                            && (($scope.plans[index].maxHours <= result[index7].maxHours || $scope.plans[index].maxHours >= result[index7].maxHours) && $scope.plans[index].maxHours >= result[index7].minHours)
                                            && $scope.plans[index].hourly === result[index7].hourly && $scope.plans[index].salary === result[index7].salary && $scope.plans[index].excludeUnion === result[index7].excludeUnion
                                            && $scope.plans[index].ptoPlanTypeFullTime === result[index7].ptoPlanTypeFullTime && $scope.plans[index].ptoPlanTypePartTime === result[index7].ptoPlanTypePartTime) {
					                        $scope.assigned = true;
					                        if (!$scope.validAlert)
					                            if (!confirm("Plans are assigned at higher level. Do you want to override the assigned plans?")) {
					                                $scope.validPlan = false;
					                                $scope.validAlert = true;
					                                return;
					                            }
					                        $scope.validAlert = true;
					                        break;
					                    }
					                }
					            }
					        });
					    }

					    if ($scope.validPlan) {
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

        if (!confirm("Assigned plans at employee level will be updated. Are you sure you want to update the plan name [" + $scope.selectedCompanyPlan.ptoPlanTitle + "]?"))
            return;

		$scope.action = "Update";
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

		if (!confirm("Assigned plans at employee level will be updated. Are you sure you want to update the plan name [" + $scope.selectedStatePlan.ptoPlanTitle + "]?"))
		    return;

		$scope.action = "Update";
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

        if (!confirm("Assigned plans at employee level will be updated. Are you sure you want to update the plan name [" + $scope.selectedCountyPlan.ptoPlanTitle + "]?"))
            return;

        var modifiedPlans = [];
        angular.forEach($scope.countys, function(county, index) {
            for (var index = 0; index < county.countyPlans.length; index++) {
                if (county.countyPlans[index].modified)
                    modifiedPlans.push(county.countyPlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
			$scope.action = "Update";
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

        if (!confirm("Assigned plans at employee level will be updated. Are you sure you want to update the plan name [" + $scope.selectedCityPlan.ptoPlanTitle + "]?"))
            return;

        var modifiedPlans = [];
        angular.forEach($scope.cities, function(city, index) {
            for (var index = 0; index < city.cityPlans.length; index++) {
                if (city.cityPlans[index].modified)
                    modifiedPlans.push(city.cityPlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
			$scope.action = "Update";
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

        if (!confirm("Assigned plans at employee level will be updated. Are you sure you want to update the plan name [" + $scope.selectedHouseCodePlan.ptoPlanTitle + "]?"))
            return;

        var modifiedPlans = [];
        angular.forEach($scope.houseCodes, function(houseCode, index) {
            for (var index = 0; index < houseCode.houseCodePlans.length; index++) {
                if (houseCode.houseCodePlans[index].modified)
                    modifiedPlans.push(houseCode.houseCodePlans[index]);
            }
        });
        if (modifiedPlans.length > 0) {
			$scope.action = "Update";
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

		if (!confirm("Assigned plans at employee level will be removed. Are you sure you want to remove the plan name [" + $scope.selectedCompanyPlan.ptoPlanTitle + "]?"))
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
			    $scope.$apply(function () {
			        $scope.pageLoading = false;
			        setStatus("Saved");
			    });
        });
    };

    $scope.removeStatePlan = function() {
        if ($scope.selectedStatePlan === undefined || $scope.selectedStatePlan === null)
            return;

        if (!confirm("Assigned plans at employee level will be removed. Are you sure you want to remove the plan name [" + $scope.selectedStatePlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Assigned plans at employee level will be removed. Are you sure you want to remove the plan name [" + $scope.selectedCountyPlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Assigned plans at employee level will be removed. Are you sure you want to remove the plan name [" + $scope.selectedCityPlan.ptoPlanTitle + "]?"))
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

        if (!confirm("Assigned plans at employee level will be removed. Are you sure you want to remove the plan name [" + $scope.selectedHouseCodePlan.ptoPlanTitle + "]?"))
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

    $scope.clonePlan = function(level, groupType) {
        if (level !== "company" && ($scope.selectedState === null || $scope.selectedState === undefined))
            return;

        $scope.groups = [];
        $scope.clonePlans = [];
		$scope.showGroup = false;
		$scope.groupExpanded = true;
		$scope.disableCloneOk = true;
		$scope.loadingTitle = " Loading...";
		$scope.pageLoading = true;
		setStatus("Loading");

		for (var index = 0; index < $scope.ptoYears.length; index++) {
		    if ($scope.ptoYears[index].id == $scope.ptoYear) {
		        $scope.cloneToYear = $scope.ptoYears[index].name;
				if (index === $scope.ptoYears.length - 1)
					return;
				$scope.cloneFromYear = $scope.ptoYears[index + 1].name;
				$scope.cloneFromYearId = $scope.ptoYears[index + 1].id;
		        break;
		    }
		}

		if (level === "company") {
		    EmpActions.getPlanAssignments($scope.cloneFromYearId, 0, 1, 0, function (data) {
                $scope.clonePlans = data;
                $scope.pageLoading = false;
                setStatus("Normal");
                $modal.open(modalOptions);
            });
        }
        else {
		    EmpActions.getPlanAssignments($scope.cloneFromYearId, $scope.selectedState.id, groupType, 0, function (data) {
				if (level === "state") {
					$scope.clonePlans = data;
				}
				else {
				    $scope.showGroup = true;
				    $scope.groupWithPlans = [];
					angular.forEach(data, function(group, index) {
					    var found = false;
					    if (group.ptoPlanId > 0)
					        $scope.groupWithPlans.push(group);
		                if ($scope.groups.length > 0) {
		                    for (var index = 0; index < $scope.groups.length; index++) {
		                        if ($scope.groups[index].title === group.title) {
		                            found = true;
		                            break;
		                        }
		                    }
		                    if (!found) {
		                        if (level !== "county")
		                            group.name = group.name.slice(0, group.name.indexOf("("));
		                        group.clonePlans = [];
		                        $scope.groups.push(group);
		                    }
		                }
		                else {
		                    if (level !== "county")
		                        group.name = group.name.slice(0, group.name.indexOf("("));
		                    group.clonePlans = [];
		                    $scope.groups.push(group);
		                }
		            });
	
					angular.forEach($scope.groupWithPlans, function (plan, index) {
		                angular.forEach($scope.groups, function(group, index) {
		                    if (group.title === plan.title)
		                        group.clonePlans.push(plan);
		                });
		            });
				}
				$scope.pageLoading = false;
				setStatus("Normal");
				$modal.open(modalOptions);
            });
        }

        $scope.levelSelected = level;
    };

	$scope.cloneSelectedPlan = function() {
		$scope.clonedPlans = [];

        if ($scope.levelSelected === "company" || $scope.levelSelected === "state") {
            for (var index = 0; index < $scope.clonePlans.length; index++) {
                if ($scope.clonePlans[index].isChecked) {
                    var item = {};
                    item["id"] = 0;
                    item["ptoYearId"] = $scope.ptoYear;
                    item["houseCodeId"] = 0;
                    item["ptoPlanId"] = $scope.clonePlans[index].ptoPlanId;
                    item["active"] = true;
                    item["modified"] = true;
                    item["ptoPlanTitle"] = $scope.clonePlans[index].ptoPlanTitle;
                    item["ptoTypeTitle"] = $scope.clonePlans[index].ptoTypeTitle;
                    item["ptoPlanTypeTitle"] = $scope.clonePlans[index].ptoPlanTypeTitle;
                    item["appZipCodeType"] = 0;
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
                    $scope.clonedPlans.push(item);
                }
            }

			$scope.companyPlans = $scope.clonedPlans;
        }
        else if ($scope.levelSelected === "county" || $scope.levelSelected === "city" || $scope.levelSelected === "houseCode") {
            for (var index = 0; index < $scope.groups.length; index++) {
                for (var iIndex = 0; iIndex < $scope.groups[index].clonePlans.length; iIndex++) {
                    if ($scope.groups[index].clonePlans[iIndex].isChecked) {
                        var item = {};
                        item["id"] = 0;
                        item["ptoYearId"] = $scope.ptoYear;
                        item["houseCodeId"] = 0;
                        item["ptoPlanId"] = $scope.groups[index].clonePlans[iIndex].ptoPlanId;
                        item["active"] = true;
                        item["modified"] = true;
                        item["ptoPlanTitle"] = $scope.groups[index].clonePlans[iIndex].ptoPlanTitle;
                        item["ptoTypeTitle"] = $scope.groups[index].clonePlans[iIndex].ptoTypeTitle;
                        item["ptoPlanTypeTitle"] = $scope.groups[index].clonePlans[iIndex].ptoPlanTypeTitle;
                        item["stateType"] = $scope.selectedState.id;
                        item["name"] = $scope.groups[index].name;
                        item["appZipCodeType"] = $scope.groups[index].appZipCodeType;

                        if ($scope.levelSelected === "county") 
                            item["groupType"] = 3;
                        else if ($scope.levelSelected === "city")
                            item["groupType"] = 4;
                        else if ($scope.levelSelected === "houseCode") {
                            item["houseCodeId"] = $scope.groups[index].houseCodeId;
                            item["groupType"] = 5;
                        }
                        $scope.clonedPlans.push(item);
                    }
                }
            }
        }

		$scope.action = "Clone";
		EmpActions.actionSaveItem($scope, $scope.clonedPlans, function(data, status) {
            $scope.$apply(function () {
                $scope.pageLoading = false;
                setStatus("Saved");
            });
        });
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
            outerLoop:
                for (var index = 0; index < $scope.groups.length; index++) {
                    for (var iIndex = 0; iIndex < $scope.groups[index].clonePlans.length; iIndex++) {
                        if ($scope.groups[index].clonePlans[iIndex].isChecked) {
                            disable = false;
                            break outerLoop;
                        }
                    }
                }
        }

        $scope.disableCloneOk = disable;
    };


    $scope.planToggled = function (isChecked) {
        $scope.allSelected = true;
        if (!isChecked)
            $scope.allSelected = false;
        else {
            for (var index = 0; index < $scope.clonePlans.length; index++) {
                if (!$scope.clonePlans[index].isChecked) {
                    $scope.allSelected = false;
                    break;
                }
            }
        }
    };

    $scope.toggleAll = function (allSelected) {
        var bool = true;
        if (allSelected)
            bool = false;

        if ($scope.levelSelected === "company" || $scope.levelSelected === "state") {
            if ($scope.clonePlans.length === 0)
                $scope.disableCloneOk = true;
            else {
                if (allSelected)
                    $scope.disableCloneOk = false;
                else
                    $scope.disableCloneOk = true;
                angular.forEach($scope.clonePlans, function (item) {
                    item.isChecked = !bool;
                });
            }
        }
        else {
            $scope.check = !bool;
            if ($scope.groups.length === 0)
                $scope.disableCloneOk = true;
            else {
                if (allSelected)
                    $scope.disableCloneOk = false;
                else
                    $scope.disableCloneOk = true;
                for (var index = 0; index < $scope.groups.length; index++) {
                    for (var iIndex = 0; iIndex < $scope.groups[index].clonePlans.length; iIndex++) {
                        $scope.groups[index].clonePlans[iIndex].isChecked = !bool;
                    }
                }
            }
        }
        $scope.allSelected = !bool;
    };

    $scope.onClonePlanChecked = function (item, check) {
        item.isChecked = check;
        var notChecked = true;
        if (!check)
            $scope.allSelected = false;
        else {
            outerLoop:
                for (var index = 0; index < $scope.groups.length; index++) {
                    for (var iIndex = 0; iIndex < $scope.groups[index].clonePlans.length; iIndex++) {
                        if ($scope.groups[index].clonePlans[iIndex].isChecked !== undefined && !$scope.groups[index].clonePlans[iIndex].isChecked) {
                            notChecked = false;
                            break outerLoop;
                        }
                    }
                }
            $scope.allSelected = notChecked;
        }
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

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
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

	var getPTOPlans = function (houseCodeId, ptoYearId, stateType, groupType, appZipCodeType, name, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlans,userId:[user]'
			+ ',houseCodeId:' + houseCodeId
			+ ',ptoYearId:' + ptoYearId
            + ',stateType:' + stateType
			+ ',groupType:' + groupType
            + ',appZipCodeType:' + appZipCodeType
            + ',name:' + name
			+ ',</criteria>', function(xml) {
			if (callback) {
			    callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'houseCodeId', 'ptoYear', 'ptoType', 'ptoPlanType'] }));
			}
		});
    };

	var getPlanAssignments = function(ptoYearId, stateId, groupType, clonePlan, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYearId:' + ptoYearId
           + ',stateType:' + stateId
           + ',groupType:' + groupType
		   + ',clonePlan:' + clonePlan
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
				if (plans[index].groupType === 4 && plans[index].name.indexOf("(") > 0)
				    xml += ' name="' + plans[index].name.substring(0, plans[index].name.indexOf("(")) + '"';
				else
				    xml += ' name="' + plans[index].name + '"';
				xml += ' active="' + plans[index].active + '"';
				xml += ' appZipCodeType="' + plans[index].appZipCodeType + '"';
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
					if ($scope.action === "Add" || $scope.action === "Update") {
						$(transactionNode).find("*").each(function() {
							if (this.tagName === "empPTOPlanAssignment") {
	                         	var id = parseInt($(this).attr("id"), 10);
	                            actionUpdateItem($scope, id);
	                        }
	                    });
	
	                    if (callback) {
							$scope.action = "";
							callback(data, status);
						}
					}
					else if ($scope.action === "Clone") {
						actionUpdateCloneItem($scope);
						if (callback) {
							$scope.action = "";
							callback(data, status);
						}
					}
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

	var actionUpdateCloneItem = function($scope) {
		if ($scope.levelSelected === "company") {
            $scope.getCompanyPlanAssignments();
        }
        else if ($scope.levelSelected === "state") {
           $scope.getStatePlanAssignments();
        }
        else if ($scope.levelSelected === "county") {
			$scope.getCountyPlanAssignments();
        }
        else if ($scope.levelSelected === "city") {
			$scope.getCityPlanAssignments();
        }
        else if ($scope.levelSelected === "houseCode") {
			$scope.getHouseCodePlanAssignments();
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
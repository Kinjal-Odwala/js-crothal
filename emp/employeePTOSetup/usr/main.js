var pto = angular.module('pto', ['ui.bootstrap', 'ngRoute']);

pto.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .otherwise({
        controller: 'employeePTOCtrl',
        templateUrl: 'employeePTO.htm'
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

if (!window.top.fin) {
    window.top.fin = { appUI: { houseCodeId: 415, glbFscYear: 4, glbFscPeriod: 45, glbWeek: 2 } };
}

var getCurrentHcmHouseCode = function () {
    return window.top.fin.appUI.houseCodeId;
}

var encode = function (value) {
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

pto.controller('employeePTOCtrl', ['$scope', 'EmpActions', '$filter', '$sce', '$modal', function ($scope, EmpActions, $filter, $sce, $modal) {
    $scope.ptoYears = [];
    $scope.selectedYear = null;
    $scope.ptoTypePayCodes = null;
    modified(false);
    checkStatus();
    setStatus("Loading");
    $scope.loadingTitle = " Loading...";
    $scope.isPageLoading = function () {
        return ($scope.loadingCount > 0 || $scope.pageLoading);
    };
    $scope.isClone = false;
    $scope.empPTOYear = {};
    $scope.empPTOYear.ptoYearSelected = "";
    $scope.ptoType = {};
    $scope.ptoType.payCode = "";
    $scope.selectedptoTypePayCode = "";
    $scope.selectedptoTypePayCodeId = "";
    $scope.ptoPlanType = {};
    $scope.ptoPlanType.ptoPlanTypeTitle = "";
    $scope.ptoPlanType.ptoPlanTypeMinHours = "";
    $scope.ptoPlanType.ptoPlanTypeMaxHours = "";
    $scope.ptoPlanType.Salary = false;
    $scope.ptoPlanType.Hourly = false;
    $scope.ptoPlanType.ptoPlanTypeActive = true;
    $scope.mainViewHeight = $(window).height() - 110;
    $scope.gridHeight = $(window).height() - 240;
    $scope.ptoYearDetailHeight = $(window).height() - 290;
    $scope.payCodeDetailHeight = $(window).height() - 305;
    $scope.ptoPlanGridHeight = $(window).height() - 270;
    $scope.ptoPlanDetailHeight = $(window).height() - 285;
    $scope.planTypeGridHeight = $(window).height() - 220;
    $scope.PlanTypeDetailHeight = $(window).height() - 240;
    $scope.assignmentGridHeight = $(window).height() - 270;
    $scope.employeeModalHeight = $(window).height() - 50;
    $scope.employeeTableHeight = $scope.employeeModalHeight - 200;
    $scope.ptoPlan = {};
    $scope.ptoPlan.ptoYear = "";
    $scope.assignment = {};
    $scope.assignment.hcmHouseCode = "";
    $scope.currentHouseCode = typeof getCurrentHcmHouseCode() == "undefined" ? null : getCurrentHcmHouseCode();
    $scope.authorizations = [];
    $scope.lastSelectedYear = null;
    $scope.lastSelectedPlanType = null;
    $scope.lastSelectedPlan = null;
    $scope.ptoDay = {};

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    var setCurrentHcmHouseCode = function (callback) {
        EmpActions.setCurrentHcmHouseCode(function (response) {
            callback(response);
        });
    };
    
    if ($scope.currentHouseCode === null) {
        setCurrentHcmHouseCode(function (response) {
            if (!angular.isDefined(response)) {
                return;
            }
            $scope.currentHouseCode = response.id;
        });
    }

    EmpActions.getAuthorizations(function (result) {
        $scope.authorizations = result;
        authorizationsLoaded();
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
    });

    var isAuthorized = function (path) {
        var authorized = false;

        for (var index = 0; index < $scope.authorizations.length; index++) {
            if ($scope.authorizations[index].path.indexOf(path) >= 0) {
                authorized = true;
                break;
            }
        }

        return authorized;
    };

    var authorizationsLoaded = function () {
        var authorizePath = "\\crothall\\chimes\\fin\\PTOSetup\\EmployeePTO";
        $scope.showPTOYears = isAuthorized(authorizePath + "\\PTOYears");
        $scope.showPTOTypes = isAuthorized(authorizePath + "\\PTOTypes");
        $scope.showPTOPlanTypes = isAuthorized(authorizePath + "\\PTOPlanTypes");
        $scope.showPTOPlans = isAuthorized(authorizePath + "\\PTOPlans");
        $scope.showPTOAssignments = isAuthorized(authorizePath + "\\PTOAssignments");
        $scope.showPTODays = isAuthorized(authorizePath + "\\PTODays");
    };
    
    EmpActions.getPTOYears(function (result) {
        $scope.ptoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
            $scope.ptoAssignYear = result[0].id;
        }
    });

    $scope.onPTOYearsTabClick = function (ptoYear) {
        if (editStatus())
            return;
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
        $scope.selectedYear = null;
        $scope.empPTOYear.ptoYearSelected = "";
        $scope.ptoForm.selectedPTOYear.$setValidity("required", true);
        $scope.lastSelectedYear = null;
    };

    $scope.onYearSelected = function (item) {
        if (editStatus())
            return;
        $scope.selectedYear = item;
        $scope.lastSelectedYear = item;
        $scope.empPTOYear.ptoYearSelected = $scope.selectedYear.brief;
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
        $scope.ptoForm.selectedPTOYear.$setValidity("required", true);
    };

    $scope.newPTOYear = function () {
        if (editStatus())
            return;
        $scope.selectedYear = null;
        $scope.empPTOYear.ptoYearSelected = "";
        $scope.ptoForm.selectedPTOYear.$setValidity("required", true);
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
    };

    $scope.onPTOYearChanged = function (year) {
        if ($scope.empPTOYear.ptoYearSelected === null || $scope.empPTOYear.ptoYearSelected === "")
            $scope.ptoForm.selectedPTOYear.$setValidity("required", false);
        else {
            $scope.ptoForm.selectedPTOYear.$setValidity("required", true);
            setStatus('Edit');
            modified(true);
        }
    };

    $scope.undoPTOYear = function () {
        if (editStatus())
            return;
        if ($scope.selectedYear !== null && $scope.selectedYear !== undefined)
            $scope.empPTOYear.ptoYearSelected = $scope.selectedYear.brief;
        else if ($scope.lastSelectedYear !== null) {
            $scope.selectedYear = $scope.lastSelectedYear;
            $scope.onYearSelected($scope.selectedYear);
        }
        else
            $scope.empPTOYear.ptoYearSelected = "";

        $scope.ptoForm.selectedPTOYear.$setValidity("required", true);
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
    };
    
    $scope.savePTOYear = function () {
        if ($scope.ptoForm.selectedPTOYear.$valid && $scope.empPTOYear.ptoYearSelected !== null && $scope.empPTOYear.ptoYearSelected !== "") {
            $scope.years = $scope.ptoYears;
            var duplicate = false;
            if ($scope.selectedYear === null || $scope.selectedYear === "" || $scope.selectedYear === undefined) {
                for (var index = 0; index < $scope.ptoYears.length; index++) {
                    if ($scope.empPTOYear.ptoYearSelected == $scope.ptoYears[index].brief) {
                        duplicate = true;
                        break;
                    }
                }
            }
            
            if (!duplicate) {
                EmpActions.actionSaveItem($scope, "PTO Years", function (data, status) {
                    EmpActions.getPTOYears(function (result) {
                        $scope.ptoYears = result;
                        if (angular.isDefined(result)) {
                            $scope.ptoYear = result[0].id;
                            if ($scope.selectedYear === null || $scope.selectedYear === undefined) {
                                for (var year = 0; year < $scope.ptoYears.length; year++) {
                                    var found = false;
                                    for (var oldYear = 0; oldYear < $scope.years.length; oldYear++) {
                                        if ($scope.years[oldYear].id == $scope.ptoYears[year].id) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        $scope.selectedYear = $scope.ptoYears[year];
                                        $scope.lastSelectedYear = $scope.selectedYear;
                                        break;
                                    }
                                }
                            }
                            else {
                                for (var year = 0; year < $scope.ptoYears.length; year++) {
                                    if ($scope.selectedYear.id === $scope.ptoYears[year].id) {
                                        $scope.selectedYear = $scope.ptoYears[year];
                                        $scope.lastSelectedYear = $scope.selectedYear;
                                        break;
                                    }
                                }
                            }
                        }
                        $scope.pageLoading = false;
                        setStatus("Saved");
                        modified(false);
                    });
                });
            }
            else
                alert("PTO Year [" + $scope.empPTOYear.ptoYearSelected + "] already exists. Please add unique PTO Year.");
        }
        else {
            $scope.ptoForm.selectedPTOYear.$setValidity("required", false);
            showToaster();
        }
    };

    $scope.onPtoTypesTabClick = function (ptoType) {
        if (editStatus())
            return;
        
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        $scope.selectedPTOtype = null;
        $scope.ptoType.payCode = null;
        $scope.selectedptoTypePayCode = null;
        $scope.selectedptoTypePayCodeId = null;

        EmpActions.getPTOTypes(function (result) {
            $scope.ptoTypes = result;
        });

        EmpActions.getPayCodes(function (result) {
            $scope.payCodes = result;
            $scope.pageStatus = 'Normal';
            setStatus('Normal');
            modified(false);
        });
        $scope.ptoForm.payCode.$setValidity("required", true);
    };

    $scope.onPTOtypeSelected = function (item) {
        if (editStatus())
            return;
        $scope.selectedPTOtype = item;
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getPTOTypePayCodes(item.id, function (result) {
            $scope.ptoTypePayCodes = result;
            $scope.ptoType.payCode = $scope.ptoTypePayCodes[0].payCodeId;
            $scope.selectedptoTypePayCode = $scope.ptoTypePayCodes[0].payCodeId;
            $scope.selectedptoTypePayCodeId = $scope.ptoTypePayCodes[0].id;
            $scope.ptoForm.payCode.$setValidity("required", true);
            $scope.pageStatus = 'Normal';
            setStatus("Normal");
            modified(false);
        });
    };

    $scope.onPayCodeChange = function (payCode) {
        if (payCode === null || payCode === "")
            $scope.ptoForm.payCode.$setValidity("required", false);
        else {
            $scope.ptoForm.payCode.$setValidity("required", true);
            $scope.ptoType.payCode = payCode;
            setStatus('Edit');
            modified(true);
        }
    }

    $scope.undoPTOType = function () {
        if (editStatus())
            return;

        if ($scope.selectedPTOtype !== null && $scope.selectedPTOtype !== undefined)
                $scope.ptoType.payCode = $scope.selectedptoTypePayCode;
        else
            $scope.ptoType.payCode = "";

        $scope.ptoForm.payCode.$setValidity("required", true);
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
    };

    $scope.savePTOType = function () {
        if ($scope.ptoForm.payCode.$valid && $scope.selectedPTOtype !== null && $scope.selectedPTOtype !== undefined) {
            EmpActions.actionSaveItem($scope, "PTO Types", function (data, status) {
                EmpActions.getPTOTypes(function (result) {
                    $scope.ptoTypes = result;
                    EmpActions.getPTOTypePayCodes($scope.selectedPTOtype.id, function (result) {
                        $scope.ptoTypePayCodes = result;
                        $scope.ptoType.payCode = $scope.ptoTypePayCodes[0].payCodeId;
                        $scope.selectedptoTypePayCode = $scope.ptoTypePayCodes[0].payCodeId;
                        $scope.selectedptoTypePayCodeId = $scope.ptoTypePayCodes[0].id;
                    });
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
                    });
                    setStatus("Saved");
                    modified(false);
                });
            });
        }
        else {
            $scope.ptoForm.payCode.$setValidity("required", false);
            if ($scope.selectedPTOtype !== null && $scope.selectedPTOtype !== undefined)
                showToaster();
            else
                alert("Please select a PTO Type to save the changes.");
        }
    };

    $scope.onPlanTypeTabClick = function (planType) {
        if (editStatus())
            return;
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        $scope.pageLoading = true;
        $scope.selectedPTOPlanType = null;
        $scope.ptoPlanType.ptoPlanTypeTitle = null;
        $scope.ptoPlanType.ptoPlanTypeMinHours = null;
        $scope.ptoPlanType.ptoPlanTypeMaxHours = null;
        $scope.ptoPlanType.Status = "";
        $scope.ptoPlanType.Salary = false;
        $scope.ptoPlanType.Hourly = false;
        $scope.ptoPlanType.ptoPlanTypeActive = true;
        $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
        $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
        $scope.ptoForm.planTypeTitle.$setValidity("required", true);
        $scope.ptoForm.payType.$setValidity("required", true);
        $scope.ptoForm.status.$setValidity("required", true);
        $scope.statusCategoryTypes = [];
        $scope.lastSelectedPlanType = null;

        EmpActions.getStatusCategoryTypes(function (result) {
            $scope.statusCategoryTypes = result;
        });

        EmpActions.getPTOPlanTypes(function (result) {
            $scope.ptoPlanTypes = result;
            angular.forEach($scope.ptoPlanTypes, function (planType, index) {
                if (planType.statusCategoryTypeId === "0") {
                    planType.statusCategory = "";
                }
                else {
                    for (var index = 0; index < $scope.statusCategoryTypes.length; index++) {
                        if (planType.statusCategoryTypeId == $scope.statusCategoryTypes[index].id) {
                            planType.statusCategory = $scope.statusCategoryTypes[index].name;
                            break;
                        }
                    }
                }

                if (planType.payStatusSalary === true) {
                    planType.payStatus = "Salary";
                    if (planType.payStatusHourly === true)
                        planType.payStatus = "Salary, Hourly";
                }
                else if (planType.payStatusHourly === true) {
                    planType.payStatus = "Hourly";
                }
            });
            setStatus("Normal");
            $scope.pageStatus = 'Normal';
            $scope.pageLoading = false;
        });
    };

    $scope.onPTOPlanTypeSelected = function (item) {
        if (editStatus())
            return;
        $scope.selectedPTOPlanType = item;
        $scope.lastSelectedPlanType = item;
        $scope.ptoPlanType.ptoPlanTypeTitle = item.title;
        
        if (item.statusCategory === "Full Time")
            $scope.ptoPlanType.Status = 1;
        else if (item.statusCategory === "Part Time")
            $scope.ptoPlanType.Status = 2;
        else
            $scope.ptoPlanType.Status = "";

        $scope.ptoPlanType.Hourly = item.payStatusHourly;
        $scope.ptoPlanType.Salary = item.payStatusSalary;
        $scope.ptoPlanType.ptoPlanTypeMinHours = item.minHours;
        $scope.ptoPlanType.ptoPlanTypeMaxHours = item.maxHours;
        $scope.ptoPlanType.ptoPlanTypeActive = item.active;
        $scope.validatePTOPlanType();
        setStatus("Normal");
        modified(false);
        $scope.pageStatus = 'Normal';
    };

    $scope.onMinHoursChange = function (hours) {
        if (hours === null || hours === "" || hours === "0")
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);
        else if ((hours > $scope.ptoPlanType.ptoPlanTypeMaxHours && $scope.ptoPlanType.ptoPlanTypeMaxHours !== null && $scope.ptoPlanType.ptoPlanTypeMaxHours !== undefined)
            || ($scope.ptoPlanType.Status === "1" && (parseInt(hours) > 40 || parseInt(hours) < 30)) || ($scope.ptoPlanType.Status === "2" && (parseInt(hours) > 29 || parseInt(hours) < 1)))
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);
        else {
            if ($scope.ptoPlanType.ptoPlanTypeMinHours !== null && $scope.ptoPlanType.ptoPlanTypeMinHours !== undefined && $scope.ptoPlanType.ptoPlanTypeMinHours !== "0")
                $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
        }
           
        setStatus('Edit');
        modified(true);
    };

    $scope.onMaxHoursChange = function (hours) {
        if (hours === null || hours === "" || hours === "0")
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
        else if ((hours < $scope.ptoPlanType.ptoPlanTypeMinHours && $scope.ptoPlanType.ptoPlanTypeMaxHours !== null && $scope.ptoPlanType.ptoPlanTypeMaxHours !== undefined)
            || ($scope.ptoPlanType.Status === "1" && (parseInt(hours) > 40 || parseInt(hours) < 30)) || ($scope.ptoPlanType.Status === "2" && (parseInt(hours) > 29 || parseInt(hours) < 1)))
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
        else {
            if ($scope.ptoPlanType.ptoPlanTypeMaxHours !== null && $scope.ptoPlanType.ptoPlanTypeMaxHours !== undefined && $scope.ptoPlanType.ptoPlanTypeMaxHours !== "0")
                $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
        }

        setStatus('Edit');
        modified(true);
    };

    $scope.payTypeHourlyChanged = function (hourly) {
        $scope.isHourly = hourly;
        if (hourly) {
            $scope.ptoForm.payType.$setValidity("required", true);
            $scope.ptoPlanType.ptoPlanTypeMinHours == null;
            $scope.ptoPlanType.ptoPlanTypeMaxnHours == null;
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);
        }
        else if (!$scope.ptoPlanType.Salary)
            $scope.ptoForm.payType.$setValidity("required", false);
        setStatus('Edit');
        modified(true);
    };

    $scope.payTypeSalaryChanged = function (salary) {
        setStatus('Edit');
        modified(true);
        if (salary) {
            $scope.ptoForm.payType.$setValidity("required", true);
            if ($scope.ptoPlanType.Hourly === false) {
                $scope.ptoPlanType.ptoPlanTypeMinHours == 0;
                $scope.ptoPlanType.ptoPlanTypeMaxnHours == 0;
                $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
                $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
            }
        }
        else if (!$scope.isHourly) {
            $scope.ptoPlanType.ptoPlanTypeMinHours = 0;
            $scope.ptoPlanType.ptoPlanTypeMaxHours = 0;
            $scope.ptoForm.payType.$setValidity("required", false);
        }
    };

    $scope.onPlanTypeActiveChange = function (active) {
        setStatus('Edit');
        modified(true);
    };

    $scope.newPTOPlanType = function () {
        if (editStatus())
            return;
        $scope.selectedPTOPlanType = null;
        $scope.ptoPlanType.ptoPlanTypeTitle = null;
        $scope.ptoPlanType.ptoPlanTypeMinHours = null;
        $scope.ptoPlanType.ptoPlanTypeMaxHours = null;
        $scope.ptoPlanType.Status = "";
        $scope.ptoPlanType.Salary = false;
        $scope.ptoPlanType.Hourly = false;
        $scope.ptoPlanType.ptoPlanTypeActive = true;
        $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
        $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
        $scope.ptoForm.planTypeTitle.$setValidity("required", true);
        $scope.ptoForm.payType.$setValidity("required", true);
        $scope.ptoForm.status.$setValidity("required", true);
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
    };

    $scope.undoPTOPlanType = function () {
        if (editStatus())
            return;

        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);

        if ($scope.selectedPTOPlanType !== null && $scope.selectedPTOPlanType !== undefined) {
            $scope.ptoPlanType.ptoPlanTypeTitle = $scope.selectedPTOPlanType.title;
            $scope.ptoPlanType.Salary = $scope.selectedPTOPlanType.payStatusSalary;
            $scope.ptoPlanType.Hourly = $scope.selectedPTOPlanType.payStatusHourly;
            if ($scope.selectedPTOPlanType.statusCategory === "Full Time")
                $scope.ptoPlanType.Status = 1;
            else if ($scope.selectedPTOPlanType.statusCategory === "Part Time")
                $scope.ptoPlanType.Status = 2;
            else
                $scope.ptoPlanType.Status = "";
            $scope.ptoPlanType.ptoPlanTypeMinHours = $scope.selectedPTOPlanType.minHours;
            $scope.ptoPlanType.ptoPlanTypeMaxHours = $scope.selectedPTOPlanType.maxHours;
            $scope.ptoPlanType.ptoPlanTypeActive = $scope.selectedPTOPlanType.active;
        }
        else if ($scope.lastSelectedPlanType !== null) {
            $scope.selectedPTOPlanType = $scope.lastSelectedPlanType;
            $scope.onPTOPlanTypeSelected($scope.selectedPTOPlanType);
        }
        else
            $scope.newPTOPlanType();
    };

    $scope.validatePTOPlanType = function () {
        if ($scope.ptoPlanType.Hourly === null || $scope.ptoPlanType.Hourly === undefined || $scope.ptoPlanType.Hourly === false) {
            $scope.ptoPlanType.ptoPlanTypeMinHours = 0;
            $scope.ptoPlanType.ptoPlanTypeMaxHours = 0;
            if ($scope.ptoPlanType.Salary === null || $scope.ptoPlanType.Salary === undefined || $scope.ptoPlanType.Salary === false)
                $scope.ptoForm.payType.$setValidity("required", false);
        }
        else
            $scope.ptoForm.payType.$setValidity("required", true);

        if ($scope.ptoPlanType.Status === null || $scope.ptoPlanType.Status === undefined || $scope.ptoPlanType.Status === "")
            $scope.ptoForm.status.$setValidity("required", false);
        else
            $scope.ptoForm.status.$setValidity("required", true);

        if ($scope.ptoPlanType.ptoPlanTypeMinHours === null || $scope.ptoPlanType.ptoPlanTypeMinHours === undefined || $scope.ptoPlanType.ptoPlanTypeMinHours === "")
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);

        if ($scope.ptoPlanType.ptoPlanTypeMaxHours === null || $scope.ptoPlanType.ptoPlanTypeMaxHours === undefined || $scope.ptoPlanType.ptoPlanTypeMaxHours === "")
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
  
        if ($scope.ptoPlanType.ptoPlanTypeTitle === null || $scope.ptoPlanType.ptoPlanTypeTitle === undefined || $scope.ptoPlanType.ptoPlanTypeTitle === "")
            $scope.ptoForm.planTypeTitle.$setValidity("required", false);
        else
            $scope.ptoForm.planTypeTitle.$setValidity("required", true);
    };

    $scope.savePTOPlanType = function () {
        $scope.validatePTOPlanType();

        if ($scope.ptoForm.planTypeMinHours.$valid && $scope.ptoForm.planTypeMaxHours.$valid && $scope.ptoForm.planTypeTitle.$valid && $scope.ptoForm.payType.$valid
            && $scope.ptoForm.status.$valid) {
            var duplicatePlan = false;
            $scope.planTypes = [];
            $scope.planTypes = $scope.ptoPlanTypes;
            for (var index = 0; index < $scope.planTypes.length; index++) {
                if ($scope.planTypes[index].maxHours == $scope.ptoPlanType.ptoPlanTypeMaxHours && $scope.planTypes[index].minHours == $scope.ptoPlanType.ptoPlanTypeMinHours)
                    if (($scope.planTypes[index].statusCategory === "Full Time" && $scope.ptoPlanType.Status == 1) || ($scope.planTypes[index].statusCategory === "Part Time" && $scope.ptoPlanType.Status == 2))
                        if (($scope.planTypes[index].payStatusHourly === $scope.ptoPlanType.Hourly) && ($scope.planTypes[index].payStatusSalary === $scope.ptoPlanType.Salary)) {
                            duplicatePlan = true;
                            alert("Plan Type [" + $scope.planTypes[index].title + "] has same Pay Type, Status Category, Minimum and Maximum Hours. Please add unique details plan.");
                            break;
                        }
            }
            if (!duplicatePlan) {
                for (var index = 0; index < $scope.statusCategoryTypes.length; index++) {
                    if ($scope.ptoPlanType.Status == 1) {
                        if ($scope.statusCategoryTypes[index].name == "Full Time" && $scope.statusCategoryTypes[index].empStatusTypeId == 1)
                            $scope.statusCategoryTypeId = $scope.statusCategoryTypes[index].id;
                    }
                    else if ($scope.ptoPlanType.Status == 2) {
                        if ($scope.statusCategoryTypes[index].name == "Part Time" && $scope.statusCategoryTypes[index].empStatusTypeId == 1)
                            $scope.statusCategoryTypeId = $scope.statusCategoryTypes[index].id;
                    }
                }
                EmpActions.actionSaveItem($scope, "PTO Plan Types", function (data, status) {
                    EmpActions.getPTOPlanTypes(function (result) {
                        $scope.ptoPlanTypes = result;
                        angular.forEach($scope.ptoPlanTypes, function (planType, index) {
                            if (planType.statusCategory === "0") {
                                planType.statusCategory = "";
                            }
                            else {
                                for (var index = 0; index < $scope.statusCategoryTypes.length; index++) {
                                    if (planType.statusCategoryTypeId == $scope.statusCategoryTypes[index].id) {
                                        planType.statusCategory = $scope.statusCategoryTypes[index].name;
                                        break;
                                    }
                                }
                            }

                            if (planType.payStatusSalary === true) {
                                planType.payStatus = "Salary";
                                if (planType.payStatusHourly === true)
                                    planType.payStatus = "Salary, Hourly";
                            }
                            else if (planType.payStatusHourly === true) {
                                planType.payStatus = "Hourly";
                            }

                            if ($scope.selectedPTOPlanType !== null && $scope.selectedPTOPlanType !== undefined) {
                                if ($scope.selectedPTOPlanType.id === planType.id) {
                                    $scope.selectedPTOPlanType = planType;
                                    $scope.lastSelectedPlanType = $scope.selectedPTOPlanType;
                                }
                            }
                            else {
                                var found = false;
                                for (var oldPlanType = 0; oldPlanType < $scope.planTypes.length; oldPlanType++) {
                                    if ($scope.planTypes[oldPlanType].id == planType.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    $scope.selectedPTOPlanType = planType;
                                    $scope.lastSelectedPlanType = $scope.selectedPTOPlanType;
                                }
                            }
                        });
                        $scope.pageLoading = false;
                        setStatus("Saved");
                        modified(false);
                    });
                });
            }
        }
        else 
            showToaster();
    };

    $scope.onPlanTypeTitleChange = function (title) {
        if (title === null || title === "") 
            $scope.ptoForm.planTypeTitle.$setValidity("required", false);
        else {
            $scope.ptoForm.planTypeTitle.$setValidity("required", true);
            setStatus('Edit');
            modified(true);
        }
    };

    $scope.onStatusChange = function (status) {
        if (status == "1" || status == "2") {
            $scope.ptoForm.status.$setValidity("required", true);
            setStatus('Edit');
            modified(true);
        }
      
        if (status == "1" && ($scope.ptoPlanType.ptoPlanTypeMaxHours > 40 || $scope.ptoPlanType.ptoPlanTypeMaxHours == 0))
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
        else if (status == "1" && $scope.ptoPlanType.ptoPlanTypeMaxHours <= 40 && $scope.ptoPlanType.ptoPlanTypeMaxHours >= 30)
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
        
        if (status == "1" && ($scope.ptoPlanType.ptoPlanTypeMinHours < 30 || $scope.ptoPlanType.ptoPlanTypeMinHours == 0))
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);
        else if (status == "1" && $scope.ptoPlanType.ptoPlanTypeMinHours >= 30 && $scope.ptoPlanType.ptoPlanTypeMinHours <= 40)
            $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
        
        if (status == "2" && ($scope.ptoPlanType.ptoPlanTypeMaxHours > 29 || $scope.ptoPlanType.ptoPlanTypeMaxHours == 0))
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", false);
        else if (status == "2" && $scope.ptoPlanType.ptoPlanTypeMaxHours <= 29 && $scope.ptoPlanType.ptoPlanTypeMaxHours >= 1)
            $scope.ptoForm.planTypeMaxHours.$setValidity("required", true);
        
        if (status == "2" && ($scope.ptoPlanType.ptoPlanTypeMinHours < 1 || $scope.ptoPlanType.ptoPlanTypeMinHours > 29))
            $scope.ptoForm.planTypeMinHours.$setValidity("required", false);
        else if (status == "2" && $scope.ptoPlanType.ptoPlanTypeMinHours >= 1 && $scope.ptoPlanType.ptoPlanTypeMinHours <= 29)
            $scope.ptoForm.planTypeMinHours.$setValidity("required", true);
    };

    $scope.onPTOPlanTabClick = function () {
        if (editStatus()) 
            return;
        $scope.ptoPlan.ptoYear = $scope.ptoYears[0].id;
        $scope.selectedPTOPlan = null;
        $scope.ptoPlan.ptoPlanName = null;
        $scope.ptoPlan.ptoPlanType = null;
        $scope.ptoPlan.ptoType = null;
        $scope.ptoPlan.planPtoYear = null;
        $scope.ptoPlan.ptoPlanDays = null;
        $scope.ptoPlan.ptoPlanAccrual = true;
        $scope.ptoPlan.ptoPlanAccrualInterval = null;
        $scope.ptoPlan.ptoPlanActive = true;
        $scope.ptoPlan.startDate = null;
        $scope.ptoPlan.endDate = null;
        $scope.isClone = false;
        $scope.ptoForm.planForm.planName.$setValidity("required", true);
        $scope.ptoForm.planForm.planType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPTOType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPtoYear.$setValidity("required", true);
        $scope.ptoForm.planForm.startDate.$setValidity("required", true);
        $scope.ptoForm.planForm.endDate.$setValidity("required", true);
        $scope.ptoForm.planForm.planDays.$setValidity("required", true);
        $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);
        $scope.ptoForm.planForm.fromYear.$setValidity("required", true);
        $scope.lastSelectedPlan = null;

        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getPTOPlans($scope.ptoYears[0].id, function (result) {
            $scope.ptoPlans = result;
            $scope.pageStatus = 'Normal';
            setStatus('Normal');
            modified(false);
        });
        EmpActions.getPTOPlanTypes(function (result) {
            $scope.ptoPlanTypes = result;
        });
        EmpActions.getPTOTypes(function (result) {
            $scope.ptoTypes = result;
        });
    };

    $scope.yearSearch = function () {
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getPTOPlans($scope.ptoPlan.ptoYear, function (result) {
            $scope.ptoPlans = result;
            $scope.pageStatus = "Normal";
            setStatus("Normal");
            $scope.newPTOPlan();
            $scope.lastSelectedYear = null;
        });
    }

    $scope.onPTOPlanSelected = function (item) {
        if (editStatus())
            return; 
        $scope.selectedPTOPlan = item;
        $scope.lastSelectedPlan = item;
        $scope.ptoPlan.ptoPlanName = item.title;
        $scope.ptoPlan.ptoPlanType = item.ptoPlanType;
        $scope.ptoPlan.ptoType = item.ptoType;
        $scope.ptoPlan.planPtoYear = item.ptoYear;
        $scope.ptoPlan.ptoPlanDays = item.days;
        $scope.ptoPlan.ptoPlanAccrual = item.accrual;
        $scope.ptoPlan.ptoPlanAccrualInterval = item.accrualInterval;
        $scope.ptoPlan.ptoPlanActive = item.active;
        $scope.ptoPlan.startDate = item.startDate;
        $scope.ptoPlan.endDate = item.endDate;
        $scope.isClone = false;
        $scope.ptoForm.planForm.planName.$setValidity("required", true);
        $scope.ptoForm.planForm.planType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPTOType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPtoYear.$setValidity("required", true);
        $scope.ptoForm.planForm.startDate.$setValidity("required", true);
        $scope.ptoForm.planForm.endDate.$setValidity("required", true);
        $scope.ptoForm.planForm.planDays.$setValidity("required", true);
        $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);
        $scope.pageStatus = "Normal";
        setStatus("Normal");
        modified(false);
    };

    $scope.newPTOPlan = function () {
        if (editStatus())
            return;
        $scope.selectedPTOPlan = null;
        $scope.ptoPlan.ptoPlanName = null;
        $scope.ptoPlan.ptoPlanType = null;
        $scope.ptoPlan.ptoType = null;
        $scope.ptoPlan.planPtoYear = null;
        $scope.ptoPlan.ptoPlanDays = null;
        $scope.ptoPlan.ptoPlanAccrual = true;
        $scope.ptoPlan.ptoPlanAccrualInterval = null;
        $scope.ptoPlan.ptoPlanActive = true;
        $scope.ptoPlan.startDate = null;
        $scope.ptoPlan.endDate = null;
        $scope.cloneToYear = "";
        $scope.ptoPlan.cloneFromYear = null;
        $scope.isClone = false;
        $scope.ptoForm.planForm.planName.$setValidity("required", true);
        $scope.ptoForm.planForm.planType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPTOType.$setValidity("required", true);
        $scope.ptoForm.planForm.planPtoYear.$setValidity("required", true);
        $scope.ptoForm.planForm.startDate.$setValidity("required", true);
        $scope.ptoForm.planForm.endDate.$setValidity("required", true);
        $scope.ptoForm.planForm.planDays.$setValidity("required", true);
        $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);
        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);
    };

    $scope.undoPTOPlan = function () {
        if (editStatus())
            return;

        $scope.pageStatus = 'Normal';
        setStatus('Normal');
        modified(false);

        if ($scope.selectedPTOPlan !== null && $scope.selectedPTOPlan !== undefined) {
            $scope.ptoPlan.ptoPlanName = $scope.selectedPTOPlan.title;
            $scope.ptoPlan.ptoPlanType = $scope.selectedPTOPlan.ptoPlanType;
            $scope.ptoPlan.ptoType = $scope.selectedPTOPlan.ptoType;
            $scope.ptoPlan.planPtoYear = $scope.selectedPTOPlan.ptoYear;
            $scope.ptoPlan.ptoPlanDays = $scope.selectedPTOPlan.days;
            $scope.ptoPlan.ptoPlanAccrual = $scope.selectedPTOPlan.accrual;
            $scope.ptoPlan.ptoPlanAccrualInterval = $scope.selectedPTOPlan.accrualInterval;
            $scope.ptoPlan.ptoPlanActive = $scope.selectedPTOPlan.active;
            $scope.ptoPlan.startDate = $scope.selectedPTOPlan.startDate;
            $scope.ptoPlan.endDate = $scope.selectedPTOPlan.endDate;
            $scope.isClone = false;
        }
        else if ($scope.lastSelectedPlan !== null && $scope.isClone == false) {
            $scope.selectedPTOPlan = $scope.lastSelectedPlan;
            $scope.onPTOPlanSelected($scope.selectedPTOPlan);
        }
        else if ($scope.isClone == true) {
            $scope.ptoPlan.cloneFromYear = null;
            $scope.cloneToYear = null;
            $scope.hasPlans = true;
        }
        else
            $scope.newPTOPlan();
    };

    $scope.savePTOPlan = function () {
        if ($scope.isClone === true && $scope.ptoForm.planForm.fromYear.$valid && $scope.ptoPlan.cloneFromYear !== null && $scope.ptoPlan.cloneFromYear !== "" && $scope.ptoPlan.cloneFromYear !== undefined) {
            angular.forEach($scope.ptoYears, function (item) {
                if (item.name == $scope.ptoPlan.cloneFromYear.name)
                    $scope.cloneFromYearId = item.id;
                else if (item.name == $scope.cloneToYear)
                    $scope.cloneToYearId = item.id;
            });
            EmpActions.actionSaveItem($scope, "PTO Plan", function (data, status) {
                if ($scope.cloneToYearId == $scope.ptoPlan.ptoYear) {
                    EmpActions.getPTOPlans($scope.ptoPlan.ptoYear, function (result) {
                        $scope.ptoPlans = result;
                        $scope.pageLoading = false;
                    });
                }
                $scope.cloneToYear = "";
                $scope.hasPlans = true;
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                    setStatus("Saved");
                    modified(false);
                    $scope.ptoPlan.cloneFromYear = null;
                });
            });
        }
        else if ($scope.ptoForm.planForm.$valid && $scope.ptoPlan.ptoPlanName !== null && $scope.ptoPlan.ptoPlanType !== null && $scope.ptoPlan.ptoType !== null
                 && $scope.ptoPlan.planPtoYear !== null && $scope.ptoPlan.ptoPlanDays !== null && $scope.ptoPlan.ptoPlanAccrualInterval !== null
                 && $scope.ptoPlan.startDate !== null && $scope.ptoPlan.endDate !== null) {
            EmpActions.getPTOPlans($scope.ptoPlan.planPtoYear, function (result) {
                $scope.plans = [];
                $scope.plans = result;
                EmpActions.actionSaveItem($scope, "PTO Plan", function (data, status) {
                    if ($scope.selectedPTOPlan !== null && $scope.selectedPTOPlan !== undefined) {
                        EmpActions.getPTOPlans($scope.selectedPTOPlan.ptoYear, function (result) {
                            $scope.ptoPlans = result;
                            for (var plan = 0; plan < $scope.ptoPlans.length; plan++) {
                                if ($scope.selectedPTOPlan.id === $scope.ptoPlans[plan].id) {
                                    $scope.selectedPTOPlan = $scope.ptoPlans[plan];
                                    $scope.lastSelectedPlan = $scope.selectedPTOPlan;
                                    break;
                                }
                            }
                        });
                    }
                    else {
                        EmpActions.getPTOPlans($scope.ptoPlan.planPtoYear, function (result) {
                            $scope.newPlans = [];
                            $scope.newPlans = result;
                            for (var plan = 0; plan < $scope.newPlans.length; plan++) {
                                var found = false;
                                for (var oldPlan = 0; oldPlan < $scope.plans.length; oldPlan++) {
                                    if ($scope.plans[oldPlan].id == $scope.newPlans[plan].id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    $scope.selectedPTOPlan = $scope.newPlans[plan];
                                    $scope.lastSelectedPlan = $scope.selectedPTOPlan;
                                    $scope.ptoPlans.push($scope.newPlans[plan]);
                                    break;
                                }
                            }
                        });
                    }
                    $scope.$apply(function () {
                        $scope.pageLoading = false;
                        setStatus("Saved");
                        modified(false);
                    });
                });
            });
        }
        else {
            $scope.validatePTOPlan();
            showToaster();
        }
    };

    $scope.validatePTOPlan = function () {
        if ($scope.ptoPlan.ptoPlanName === null || $scope.ptoPlan.ptoPlanName === "")
            $scope.ptoForm.planForm.planName.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.planName.$setValidity("required", true);

        if ($scope.ptoPlan.ptoPlanType === null || $scope.ptoPlan.ptoPlanType === "")
            $scope.ptoForm.planForm.planType.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.planType.$setValidity("required", true);

        if ($scope.ptoPlan.ptoType === null || $scope.ptoPlan.ptoType === "")
            $scope.ptoForm.planForm.planPTOType.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.planPTOType.$setValidity("required", true);

        if ($scope.ptoPlan.planPtoYear === null || $scope.ptoPlan.planPtoYear === "")
            $scope.ptoForm.planForm.planPtoYear.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.planPtoYear.$setValidity("required", true);

        if ($scope.ptoPlan.ptoPlanDays === null || $scope.ptoPlan.ptoPlanDays === "")
            $scope.ptoForm.planForm.planDays.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.planDays.$setValidity("required", true);

        if ($scope.ptoPlan.ptoPlanAccrualInterval === null || $scope.ptoPlan.ptoPlanAccrualInterval === "")
            $scope.ptoForm.planForm.accrualInterval.$setValidity("required", false);
        else
            $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);

        if ($scope.ptoPlan.startDate === null || $scope.ptoPlan.startDate === undefined || $scope.ptoPlan.startDate === "")
            $scope.ptoForm.planForm.startDate.$setValidity("required", false);
        
        if ($scope.ptoPlan.endDate === null || $scope.ptoPlan.endDate === undefined || $scope.ptoPlan.endDate === "")
            $scope.ptoForm.planForm.endDate.$setValidity("required", false);
    };

    $scope.onPTOPlanChange = function (detail) {
        if (detail === 'name') {
            if ($scope.ptoPlan.ptoPlanName === null || $scope.ptoPlan.ptoPlanName === "")
                $scope.ptoForm.planForm.planName.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.planName.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
        else if (detail === 'planType') {
            if ($scope.ptoPlan.ptoPlanType === null || $scope.ptoPlan.ptoPlanType === "")
                $scope.ptoForm.planForm.planType.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.planType.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
        else if (detail === 'ptoType') {
            if ($scope.ptoPlan.ptoType === null || $scope.ptoPlan.ptoType === "")
                $scope.ptoForm.planForm.planPTOType.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.planPTOType.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
        else if (detail === 'year') {
            if ($scope.ptoPlan.planPtoYear === null || $scope.ptoPlan.planPtoYear === "")
                $scope.ptoForm.planForm.planPtoYear.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.planPtoYear.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
        else if (detail === 'days') {
            if ($scope.ptoPlan.ptoPlanDays === null || $scope.ptoPlan.ptoPlanDays === "")
                $scope.ptoForm.planForm.planDays.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.planDays.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
        else if (detail === 'interval') {
            if ($scope.ptoPlan.ptoPlanAccrualInterval === null || $scope.ptoPlan.ptoPlanAccrualInterval === "")
                $scope.ptoForm.planForm.accrualInterval.$setValidity("required", false);
            else {
                $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);
                setStatus('Edit');
                modified(true);
            }
        }
    };

    $scope.onAccrualChange = function (selected) {
        setStatus('Edit');
        modified(true);
        if (!selected) {
            $scope.ptoPlan.ptoPlanAccrualInterval = 0;
            $scope.ptoForm.planForm.accrualInterval.$setValidity("required", true);
        }
    };

    $scope.getDate = function (date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'yyyy-MM-dd');
    };

    $scope.onStartDateChange = function () {
        if ($scope.ptoPlan.startDate === null || $scope.ptoPlan.startDate === undefined || $scope.ptoPlan.startDate === "") {
            $scope.ptoForm.planForm.startDate.$setValidity("required", false);
        }
        else if ($scope.getDate($scope.ptoPlan.startDate) > $scope.getDate($scope.ptoPlan.endDate) && $scope.ptoPlan.endDate !== null && $scope.ptoPlan.endDate !== undefined) {
            $scope.ptoForm.planForm.startDate.$setValidity("required", false);
        }
        else {
            if ($scope.ptoPlan.startDate !== null && $scope.ptoPlan.startDate !== undefined)
                $scope.ptoForm.planForm.startDate.$setValidity("required", true);
            if ($scope.ptoPlan.endDate !== null && $scope.ptoPlan.endDate !== undefined)
                $scope.ptoForm.planForm.endDate.$setValidity("required", true);
        }
        setStatus('Edit');
        modified(true);
    };

    $scope.onEndDateChange = function () {
        if ($scope.ptoPlan.endDate === null || $scope.ptoPlan.endDate === undefined || $scope.ptoPlan.endDate === "") {
            $scope.ptoForm.planForm.endDate.$setValidity("required", false);
        }
        else if ($scope.getDate($scope.ptoPlan.startDate) > $scope.getDate($scope.ptoPlan.endDate) && $scope.ptoPlan.startDate !== null && $scope.ptoPlan.startDate !== undefined) {
            $scope.ptoForm.planForm.endDate.$setValidity("required", false);
        }
        else {
            if ($scope.ptoPlan.endDate !== null && $scope.ptoPlan.endDate !== undefined)
                $scope.ptoForm.planForm.endDate.$setValidity("required", true);
            if ($scope.ptoPlan.startDate !== null && $scope.ptoPlan.startDate !== undefined)
                $scope.ptoForm.planForm.startDate.$setValidity("required", true);
        }
        setStatus('Edit');
        modified(true);
    };

    $scope.clonePTOPlan = function () {
        $scope.hasPlans = true;
        $scope.isClone = true;
        $scope.selectedPTOPlan = null;
        $scope.ptoPlan.cloneFromYear = null;
        $scope.cloneToYear = null;
        $scope.ptoForm.planForm.toYear.$setValidity("required", true);
        $scope.ptoForm.planForm.fromYear.$setValidity("required", true);
    };

    $scope.cloneFromYears = [{ id: 1, name: getCurrentYear() }, { id: 2, name: parseInt(getCurrentYear())-1 }];

    $scope.fromYearChangedValue = function (item) {
        if (item === null || item === "") {
            $scope.ptoForm.planForm.fromYear.$setValidity("required", false);
            $scope.ptoForm.planForm.toYear.$setValidity("required", false);
        }
        else {
            $scope.ptoPlan.cloneFromYear = item;
            $scope.cloneToYear = parseInt(item.name) + 1;
            $scope.ptoForm.planForm.fromYear.$setValidity("required", true);
            $scope.ptoForm.planForm.toYear.$setValidity("required", true);
            $scope.hasPlans = false;
            var found = false;
            $scope.loadingTitle = " Loading...";
            $scope.pageStatus = 'Loading, Please Wait...';
            setStatus("Loading");
            for (var year = 0; year < $scope.ptoYears.length; year++) {
                if ($scope.cloneToYear == $scope.ptoYears[year].name) {
                    EmpActions.getPTOPlans($scope.ptoYears[year].id, function (ptoPlans) {
                        if (ptoPlans.length > 0) {
                            $scope.hasPlans = true;
                            $scope.pageLoading = false;
                            $scope.pageStatus = 'Normal';
                            alert("Plans are already available for year " + $scope.ptoYears[year].name);
                        }
                    });
                    found = true;
                    break;
                }
            }

            if (found == false) {
                $scope.hasPlans = true;
                alert("PTO year [" + $scope.cloneToYear + "] is not available");
            }
        }
        setStatus("Edit");
        modified(true);
    };

    $scope.assignmentsTabClick = function () {
        if (editStatus())
            return;
        $scope.assignment.ptoAssignYear = $scope.ptoYears[0].id;
        $scope.ptoPlanAssignments = [];
        $scope.employees = [];
        $scope.assignedEmployees = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getHcmHouseCodes(function (result) {
            $scope.hcmHouseCodes = result;
            $scope.assignment.hcmHouseCode = result[0].id;

            EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 1, $scope.assignment.hcmHouseCode, function (result) {
                $scope.planAssignments = result;
                angular.forEach($scope.planAssignments, function (item) {
                    item.level = "Company";
                    $scope.ptoPlanAssignments.push(item);
                    EmpActions.getEmployees($scope.assignment.hcmHouseCode, item.ptoPlanId, function (employees) {
                        angular.forEach(employees, function (employee) {
                            $scope.assignedEmployees.push(employee);
                        });
                    });
                });
            });

            EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 2, $scope.assignment.hcmHouseCode, function (result) {
                $scope.planAssignments = result;
                angular.forEach($scope.planAssignments, function (item) {
                    item.level = "State";
                    $scope.ptoPlanAssignments.push(item);
                    EmpActions.getEmployees($scope.assignment.hcmHouseCode, item.ptoPlanId, function (employees) {
                        angular.forEach(employees, function (employee) {
                            $scope.assignedEmployees.push(employee);
                        });
                    });
                });
            });

            EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 3, $scope.assignment.hcmHouseCode, function (result) {
                $scope.planAssignments = result;
                angular.forEach($scope.planAssignments, function (item) {
                    item.level = "County";
                    $scope.ptoPlanAssignments.push(item);
                    EmpActions.getEmployees($scope.assignment.hcmHouseCode, item.ptoPlanId, function (employees) {
                        angular.forEach(employees, function (employee) {
                            $scope.assignedEmployees.push(employee);
                        });
                    });
                });
            });

            EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 4, $scope.assignment.hcmHouseCode, function (result) {
                $scope.planAssignments = result;
                angular.forEach($scope.planAssignments, function (item) {
                    item.level = "City";
                    $scope.ptoPlanAssignments.push(item);
                    EmpActions.getEmployees($scope.assignment.hcmHouseCode, item.ptoPlanId, function (employees) {
                        angular.forEach(employees, function (employee) {
                            $scope.assignedEmployees.push(employee);
                        });
                    });
                });
            });

            EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 5, $scope.assignment.hcmHouseCode, function (result) {
                $scope.planAssignments = result;
                angular.forEach($scope.planAssignments, function (item) {
                    item.level = "HouseCode";
                    $scope.ptoPlanAssignments.push(item);
                    EmpActions.getEmployees($scope.assignment.hcmHouseCode, item.ptoPlanId, function (employees) {
                        angular.forEach(employees, function (employee) {
                            $scope.assignedEmployees.push(employee);
                        });
                    });
                });
                $scope.pageLoading = false;
                $scope.pageStatus = 'Normal';
                setStatus('Normal');
                modified(false);
            });
        });
    };

    $scope.onPTOPlanAssignmentSelected = function (item) {
        $scope.selectedPTOPlanAssignment = item;
        $scope.employees = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getEmployees($scope.assignment.hcmHouseCode, $scope.selectedPTOPlanAssignment.ptoPlanId, function (employees) {
            angular.forEach(employees, function (employee) {
                $scope.employees.push(employee);
            });
            $scope.pageLoading = false;
            $scope.pageStatus = 'Normal';
            setStatus("Normal");
        });
    };

    $scope.assignmentSearch = function () {
        $scope.ptoPlanAssignments = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getPlanAssignments($scope.assignment.ptoAssignYear, 1, $scope.assignment.hcmHouseCode, function (result) {
            $scope.planAssignments = result;
            angular.forEach($scope.planAssignments, function (item) {
                if (item.houseCodeId == 0)
                    $scope.ptoPlanAssignments.push(item);
                else if (item.houseCodeId !== 0 && item.houseCodeId == $scope.assignment.hcmHouseCode)
                    $scope.ptoPlanAssignments.push(item);
            });
            angular.forEach($scope.ptoPlanAssignments, function (assignment) {
                if (assignment.groupType === "1")
                    assignment.level = "Company";
                else if (assignment.groupType === "2")
                    assignment.level = "State";
                else if (assignment.groupType === "3")
                    assignment.level = "County";
                else if (assignment.groupType === "4")
                    assignment.level = "City";
                else if (assignment.groupType === "5")
                    assignment.level = "HouseCode";
            });
            $scope.employees = [];
            $scope.pageLoading = false;
            $scope.pageStatus = 'Normal';
            setStatus("Normal");
        });
    };

    $scope.showEmployees = function () {
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        $scope.selectedPTOPlanAssignment = null;
        $scope.unAssignedEmployees = [];
        EmpActions.getEmployees($scope.assignment.hcmHouseCode, -1, function (employees) {
            angular.forEach(employees, function (employee) {
                var found = false;
                for (index = 0; index < $scope.assignedEmployees.length; index++) {
                    if (employee.employeeNumber == $scope.assignedEmployees[index].employeeNumber) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    $scope.unAssignedEmployees.push(employee);
            });

            var ptoModalInstance = $modal.open({
                templateUrl: 'unAssignedEmployee.html',
                controller: 'modalInstanceCtrl',
                title: "Unassigned Employees",
                size: 'sm',
                backdrop: 'static',
                keyboard: false,
                scope: $scope
            });

            $scope.pageLoading = false;
            $scope.pageStatus = 'Normal';
            setStatus("Normal");
        });
    };

    $scope.daysTabClick = function () {
        if (editStatus())
            return;
        $scope.ptoDay.ptoYear = $scope.ptoYears[0].id;
        $scope.dayEmployees = [];
        $scope.employeePTOs = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        EmpActions.getHcmHouseCodes(function (result) {
            $scope.hcmHouseCodes = result;
            $scope.ptoDay.hcmHouseCode = result[0].id;
           
            EmpActions.getEmployees($scope.ptoDay.hcmHouseCode, -1, function (employees) {
                $scope.dayEmployees = employees;
                $scope.pageLoading = false;
                $scope.pageStatus = 'Normal';
                setStatus('Normal');
                modified(false);
            });
        });
    };

    $scope.ptoDaySearch = function () {
        $scope.dayEmployees = [];
        $scope.employeePTOs = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        
        EmpActions.getEmployees($scope.ptoDay.hcmHouseCode, -1, function (employees) {
            $scope.dayEmployees = employees;
            $scope.pageLoading = false;
            $scope.pageStatus = 'Normal';
            setStatus("Normal");
        });
    };

    $scope.onEmployeeSelected = function (item) {
        $scope.selectedEmployee = item;
        $scope.ptoDays = [];
        $scope.employeePTOs = [];
        $scope.balanceDays = [];
        $scope.ptoPlans = [];
        $scope.empPTODays = [];
        $scope.loadingTitle = " Loading...";
        $scope.pageStatus = 'Loading, Please Wait...';
        setStatus("Loading");
        $scope.currentYear = "";
        var ptoTypes = [];

        EmpActions.getPTOTypes(function (result) {
            ptoTypes = result;

            angular.forEach(ptoTypes, function (ptoType) {
                var pto = [];
                pto.ptoTypeTitle = ptoType.brief;
                pto.totalPTOTaken = 0;
                pto.balanceDays = 0;
                $scope.employeePTOs.push(pto);
            });

            for (var index = 0; index < $scope.ptoYears.length; index++) {
                if ($scope.ptoYears[index].id == $scope.ptoDay.ptoYear) {
                    $scope.currentYear = $scope.ptoYears[index].name;
                    break;
                }
            }

            EmpActions.getPTOPlans($scope.ptoDay.ptoYear, function (plans) {
                $scope.ptoPlans = plans;

                EmpActions.getPTODays($scope.selectedEmployee.id, function (result) {
                    $scope.empPTODays = result;
                    angular.forEach($scope.empPTODays, function (empPTODay) {
                        if ($scope.getPTOYear(empPTODay.ptoDate) == $scope.currentYear)
                            $scope.ptoDays.push(empPTODay);
                    });
                    angular.forEach($scope.ptoDays, function (ptoDay) {
                        ptoDay.totalPTOTaken = 0;
                        if ($scope.employeePTOs.length === 0) {
                            for (var index = 0; index < $scope.ptoDays.length; index++) {
                                if ($scope.ptoDays[index].ptoType == ptoDay.ptoType) {
                                    ptoDay.totalPTOTaken++;
                                }
                            }
                            for (var index = 0; index < $scope.ptoPlans.length; index++) {
                                if ($scope.ptoPlans[index].ptoType == ptoDay.ptoType) {
                                    ptoDay.balanceDays = $scope.ptoPlans[index].days - ptoDay.totalPTOTaken;
                                    ptoDay.totalDays = ptoDay.totalPTOTaken + ptoDay.balanceDays;
                                }
                            }
                            angular.forEach($scope.employeePTOs, function (pto) {
                                if (pto.ptoTypeTitle == ptoDay.ptoTypeTitle) {
                                    pto.totalPTOTaken = ptoDay.totalPTOTaken;
                                    pto.balanceDays = ptoDay.balanceDays;
                                    pto.ptoType = ptoDay.ptoType;
                                    pto.totalDays = ptoDay.totalDays;
                                }
                            });
                        }
                        else {
                            for (var index = 0; index < $scope.employeePTOs.length; index++) {
                                if (ptoDay.ptoType !== $scope.employeePTOs[index].ptoType) {
                                    for (var index = 0; index < $scope.ptoDays.length; index++) {
                                        if ($scope.ptoDays[index].ptoType == ptoDay.ptoType) {
                                            ptoDay.totalPTOTaken++;
                                        }
                                    }
                                    for (var index = 0; index < $scope.ptoPlans.length; index++) {
                                        if ($scope.ptoPlans[index].ptoType == ptoDay.ptoType) {
                                            ptoDay.balanceDays = $scope.ptoPlans[index].days - ptoDay.totalPTOTaken;
                                            ptoDay.totalDays = ptoDay.totalPTOTaken + ptoDay.balanceDays;
                                        }
                                    }
                                    angular.forEach($scope.employeePTOs, function (pto) {
                                        if (pto.ptoTypeTitle == ptoDay.ptoTypeTitle) {
                                            pto.totalPTOTaken = ptoDay.totalPTOTaken;
                                            pto.balanceDays = ptoDay.balanceDays;
                                            pto.ptoType = ptoDay.ptoType;
                                            pto.totalDays = ptoDay.totalDays;
                                        }
                                    });
                                }
                                else
                                    break;
                            }
                        }
                    });
                    angular.forEach($scope.employeePTOs, function (pto) {
                        var found = false;
                        for (var index = 0; index < $scope.empPTODays.length; index++) {
                            if (pto.ptoTypeTitle == $scope.empPTODays[index].ptoTypeTitle) {
                                found = true;
                                break;
                            }
                        }
                        if (found === false)
                            pto.totalDays = "Unassigned";
                    });
                    $scope.pageLoading = false;
                    $scope.pageStatus = 'Normal';
                    setStatus("Normal");
                });
            });
        });
    };

    $scope.getPTODate = function (date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'MM/dd/yyyy');
    };

    $scope.getPTOYear = function (date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'yyyy');
    };

    $scope.showPTODates = function (ptoTypeId) {
        $scope.ptoDates = [];
        if (ptoTypeId !== undefined && ptoTypeId !== null && ptoTypeId !== "") {
            angular.forEach($scope.ptoDays, function (ptoDay) {
                if (ptoDay.ptoType == ptoTypeId)
                    $scope.ptoDates.push($scope.getPTODate(ptoDay.ptoDate));
            });

            var ptoModalInstance = $modal.open({
                templateUrl: 'ptoDates.html',
                controller: 'modalInstanceCtrl',
                title: "PTO Taken",
                size: 'sm',
                backdrop: 'static',
                keyboard: false,
                scope: $scope
            });
        }
    };

    var showToaster = function () {
        var modalInstance = $modal.open({
            template: '<div class="toaster"><div class="header">WARNING</div><div class="content">In order to save, the errors on the page must be corrected.</div></div>',
            size: 'sm',
            backdrop: false
        });

        setTimeout(function () {
            modalInstance.dismiss('cancel');
        }, 2800);
    }

}])
.directive('minLength', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined || inputValue == "") {
                    modelCtrl.$setValidity(attrs.name, true);
                    return "";
                }
                var min = parseInt(attrs.minLength);
                var firstNumber = inputValue.substring(0, 1);
                if (inputValue.length == min && firstNumber != 0) {
                    modelCtrl.$setValidity(attrs.name, true);
                    return inputValue;
                }
                else {
                    modelCtrl.$setValidity(attrs.name, false);
                    return inputValue;
                }
            });
        }
    };
})
.directive('ptoTypeahead', ['$filter', function ($filter) {
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
        link: function (scope, elem, attrs) {

            var option = scope.$eval(attrs.typeaheadOption);
            scope.displayField = '';
            scope.inputName = '';

            if (angular.isDefined(option)) {
                scope.displayField = option.displayField;
                scope.inputName = option.name;
            }

            scope.inputFormatter = function ($model) {
                if ($model) {
                    scope.model = $model[option.valueField];

                    return $model[scope.displayField];
                }

                return '';
            }

            scope.itemFilter = function (value) {
                return function (item) {
                    return item[scope.displayField].toUpperCase().indexOf(value.toUpperCase()) >= 0;
                }
            }

            var setModelValue = function (source, modelVal) {
                if (angular.isDefined(source) && source != null && angular.isDefined(modelVal) && modelVal != null) {
                    var modelValue = $filter('filter')(source, function (item) {
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

            scope.$watch(function () { return scope.model }, function (value) {
                if (angular.isDefined(value) && value != null) {
                    setModelValue(scope.source, scope.model);
                }
            });

            scope.$watch(function () { return scope.source }, function (value) {
                if (angular.isDefined(value) && value != null) {
                    setModelValue(scope.source, scope.model);
                }
            });

            scope.$watch('TypeaheadModel', function (value) {
                if (typeof (value) == "string" && value.length == 0) {
                    scope.model = null;
                }
            });
        }
    }
}])
.directive('ptoEnter', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ptoEnter);
                    });

                    event.preventDefault();
                }
            });
        }
    }
})
.directive('ptoInvalid', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var errorClass = 'has-error';

            var toggleClsss = function () {
                var hasError = Object.byString(scope, attrs.ptoInvalid + '.$invalid');
                hasError ? element.addClass(errorClass) : element.removeClass(errorClass);
            }
            scope.$watch(attrs.ptoInvalid + '.$invalid', toggleClsss);
        }
    }
}])
.directive('ptoInteger', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return ''
                var transformedInput = inputValue.replace(/[^0-9]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
})

pto.directive('ptoDatepicker', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
        scope: {
            dtOption: '=',
            dtModel: '=dtModel',
            minDate: '=',
            dtChange: '&dtChange',
            dtBlur: '&dtBlur',
            maxDate: '='
        },
        restrict: 'E',
        require: '?ngModel',
        template: '<p class="input-group" style="margin-bottom:0px;"><input class="form-control input-sm" name="{{dtName}}" min-date="minDate" max-date="maxDate" ng-change="dtChange()" ng-blur="dtBlur()" ng-required="dtRequired" datepicker-popup="MM/dd/yyyy" pdf-datepicker-popup-config ng-model="dtModel" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
        link: function (scope, elem, attrs, ngModel) {
            scope.opened = false;
            scope.dtPopup = "dd-MMMM-yyyy";
            scope.showButtonBar = false;
            scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.opened = true;
            }

            if (angular.isDefined(attrs.dtPopup)) {
                scope.dtPopup = attrs.dtPopup;
            }

            if (angular.isDefined(attrs.dtName)) {
                scope.dtName = attrs.dtName;
            }

            if (angular.isDefined(attrs.dtRequired)) {
                scope.dtRequired = attrs.dtRequired;
            }
        }
    }
}])
.directive('pdfDatepickerPopupConfig', ['$filter', function ($filter) {
    return {
        restrict: 'A',
        require: '^ngModel',
        link: function (scope, elem, attrs, ngModel) {

            var dateFormat = attrs.datepickerPopup || "MM/dd/yyyy";
            ngModel.$formatters.push(function (value) {
                if (value && value != null)
                    return $filter('date')(new Date(value), dateFormat);
                return null;
            });
        }
    }
}])
pto.controller('modalInstanceCtrl', function ($scope, $modalInstance) {
    $scope.ok = function () {
        if ($scope.closeDialog) {
            $modalInstance.close();
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
    var cache = {};
    var ptoTypes = null;
    var payCodes = null;
    var ptoTypePayCodes = null;
    var ptoPlanTypes = null;
    var houseCodes = null;
    var authorizations = null;
    var statusCategoryTypes = null;

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

    var getAuthorizations = function (callback) {
        if (cache.authorizations) {
            callback(cache.authorizations);
            return;
        }
        apiRequest('emp', 'iiAuthorization', '<authorization id="1"><authorize path="\\crothall\\chimes\\fin\\PTOSetup\\EmployeePTO" />', function (xml) {
            cache.authorizations = deserializeXml(xml, 'authorize', { upperFirstLetter: false, intItems: ['id'] });
            getAuthorizations(callback);
        });
    };

    var getPTOYears = function (callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoYears,userId:[user]'
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
			    }
			});
    };

    var getPTOTypes = function (callback) {
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

    var getPayCodes = function (callback) {
        if (cache.payCodes) {
            callback(cache.payCodes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:payCodes,userId:[user]'
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        cache.payCodes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
			        callback(cache.payCodes);
			    }
			});
    };

    var getPTOTypePayCodes = function (ptoTypeId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoTypePayCodes,userId:[user]'
             + ',ptoTypeId:' + ptoTypeId
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'payCodeId'] }));
			    }
			});
    };

    var getPTOPlanTypes = function (callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanTypes,userId:[user]'
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'maxHours', 'minHours'], boolItems: ['active', 'payStatusHourly', 'payStatusSalary'] }));
			    }
			});
    };

    var getPTOPlans = function (ptoYearId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlans,userId:[user]'
			+ ',houseCodeId:' + 0
			+ ',ptoYearId:' + ptoYearId
			+ ',active:' + -1
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        cache.ptoPlans = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'houseCodeId', 'ptoYear', 'ptoType', 'ptoPlanType'], boolItems: ['accrual', 'active'] });
			        callback(cache.ptoPlans);
			    }
			});
    };

    var getHcmHouseCodes = function (callback) {

        if (cache.houseCodes) {
            callback(cache.houseCodes);
            return;
        }

        var criteriaXml = '<criteria>appUnitBrief:,storeId:hcmHouseCodes,userId:[user],</criteria>';
        var data = 'moduleId=hcm&requestId=1&requestXml=' + encodeURIComponent(criteriaXml) + '&targetId=iiCache';

        apiRequest('hcm', 'iiCache', criteriaXml, function (xml) {
            cache.houseCodes = deserializeXml(xml, 'item', { upperFirstLetter: false });
            getHcmHouseCodes(callback);
        });
    };

    var getPlanAssignments = function (ptoYearId, groupType, hcmHouseCode, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoPlanAssignments,userId:[user]'
           + ',ptoYearId:' + ptoYearId
           + ',stateType:' + 0
           + ',groupType:' + groupType
		   + ',clonePlan:' + 0
		   + ',houseCode:' + hcmHouseCode
           + ',</criteria>', function (xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'ptoYearId', 'houseCodeId', 'ptoPlanId'], boolItems: ['active'] }));
               }
           });
    };

    var getEmployees = function (houseCodeId, ptoPlanId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoEmployees,userId:[user]'
           + ',houseCodeId:' + houseCodeId
           + ',ptoPlanId:' + ptoPlanId
           + ',assigned:' + 1
		   + ',searchType:' + 'Employee'
           + ',</criteria>', function (xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'ptoAssignmentId', 'employeeNumber'], boolItems: ['active'] }));
               }
           });
    };

    var getStatusCategoryTypes = function (callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:statusCategoryTypes,userId:[user]'
           + ',statusTypeId:' + 0
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.statusCategoryTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id', 'empStatusTypeId', 'number'] });
                   callback(cache.statusCategoryTypes);
               }
           });
    };

    var getPTODays = function (employeeId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoDays,userId:[user]'
           + ',employeeId:' + employeeId
           + ',</criteria>', function (xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
               }
        });
    };

    var getPTOBalanceHours = function (employeeId, callback) {
        apiRequest('emp', 'iiCache', '<criteria>storeId:ptoEmployeeBalanceHours,userId:[user]'
           + ',employeeId:' + employeeId
           + ',</criteria>', function (xml) {
               if (callback) {
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] }));
               }
           });
    };

    var setCurrentHcmHouseCode = function (callback) {

        apiRequest('hcm', 'iiCache', '<criteria>storeId:hcmHouseCodes,userId:[user],defaultOnly:true,</criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
        });
    };

    var transactionMonitor = function ($scope, data, callback) {
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status, xhr) {
            var transactionNode = $(xhr.responseXML).find("transaction")[0];

            if (transactionNode !== undefined) {
                if ($(transactionNode).attr("status") === "success") {
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

    var actionSaveItem = function ($scope, action, callback) {
        var xml = "";

        if (action === "PTO Years") {
            xml += '<ptoYear';
            xml += ' id="' + (($scope.selectedYear === undefined || $scope.selectedYear === null) ? "0" : $scope.selectedYear.id) + '"';
            xml += ' title="' + $scope.empPTOYear.ptoYearSelected + '"';
            xml += ' displayOrder="1"';
            xml += ' active="true"';
            xml += '/>';
        }
        else if (action === "PTO Types") {
            xml += '<ptoTypePayCode';
            xml += ' id="' + $scope.selectedptoTypePayCodeId + '"';
            xml += ' ptoTypeId="' + $scope.selectedPTOtype.id + '"';
            xml += ' payCodeId="' + $scope.ptoType.payCode + '"';
            xml += ' add="true"';
            xml += '/>';
        }
        else if (action === "PTO Plan Types") {
            xml += '<ptoPlanType';
            xml += ' id="' + (($scope.selectedPTOPlanType === undefined || $scope.selectedPTOPlanType === null) ? "0" : $scope.selectedPTOPlanType.id) + '"';
            xml += ' title="' + encode($scope.ptoPlanType.ptoPlanTypeTitle) + '"'; 
            xml += ' payStatusHourly="' + $scope.ptoPlanType.Hourly + '"';
            xml += ' payStatusSalary="' + $scope.ptoPlanType.Salary + '"';
            xml += ' statusCategoryTypeId="' + $scope.statusCategoryTypeId + '"';
            xml += ' minHours="' + $scope.ptoPlanType.ptoPlanTypeMinHours + '"';
            xml += ' maxHours="' + $scope.ptoPlanType.ptoPlanTypeMaxHours + '"';
            xml += ' active="' + $scope.ptoPlanType.ptoPlanTypeActive + '"';
            xml += '/>';
        }
        else if (action === "PTO Plan" && $scope.isClone === false) {
            xml += '<ptoPlan';
            xml += ' id="' + (($scope.selectedPTOPlan === undefined || $scope.selectedPTOPlan === null) ? "0" : $scope.selectedPTOPlan.id) + '"';
            xml += ' houseCodeId="' + (($scope.selectedPTOPlan === undefined || $scope.selectedPTOPlan === null) ? $scope.currentHouseCode : $scope.selectedPTOPlan.houseCodeId) + '"';
            xml += ' ptoYearId="' + $scope.ptoPlan.planPtoYear + '"';
            xml += ' ptoTypeId="' + $scope.ptoPlan.ptoType + '"';
            xml += ' ptoPlanTypeId="' + $scope.ptoPlan.ptoPlanType + '"';
            xml += ' title="' + encode($scope.ptoPlan.ptoPlanName) + '"';
            xml += ' startDate="' + $filter("date")(new Date($scope.ptoPlan.startDate), "MM/dd/yyyy") + '"';
            xml += ' endDate="' + $filter("date")(new Date($scope.ptoPlan.endDate), "MM/dd/yyyy") + '"';
            xml += ' days="' + $scope.ptoPlan.ptoPlanDays + '"';
            xml += ' accrual="' + $scope.ptoPlan.ptoPlanAccrual + '"';
            xml += ' accrualInterval="' + $scope.ptoPlan.ptoPlanAccrualInterval + '"';
            xml += ' active="' + $scope.ptoPlan.ptoPlanActive + '"';
            xml += '/>';
        }
        else if (action === "PTO Plan" && $scope.isClone === true) {
            xml += '<ptoPlanClone';
            xml += ' houseCodeId="' + $scope.currentHouseCode + '"';
            xml += ' ptoYearIdFrom="' + $scope.cloneFromYearId + '"';
            xml += ' ptoYearIdTo="' + $scope.cloneToYearId + '"';
            xml += '/>';
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

    return {
        getPTOYears: getPTOYears,
        getPTOTypes: getPTOTypes,
        getPayCodes: getPayCodes,
        getPTOTypePayCodes: getPTOTypePayCodes,
        getPTOPlanTypes: getPTOPlanTypes,
        getPTOPlans: getPTOPlans,
        getHcmHouseCodes: getHcmHouseCodes,
        getPlanAssignments: getPlanAssignments,
        getEmployees: getEmployees,
        actionSaveItem: actionSaveItem,
        getAuthorizations: getAuthorizations,
        setCurrentHcmHouseCode: setCurrentHcmHouseCode,
        getStatusCategoryTypes: getStatusCategoryTypes,
        getPTODays: getPTODays
    }
}]);
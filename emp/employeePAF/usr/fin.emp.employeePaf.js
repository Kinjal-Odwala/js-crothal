var uppercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toUpperCase();
    }) : '';
};

var lowercaseFirstLetter = function (input) {
    return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
        return $1.toLowerCase();
    }) : '';
};

Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }
    return o;
};

var activeRowIndex = -1;
var pafDocuments = [];
var selectedDocId = "";

var onFileChange = function () {
    var scope = angular.element(document.getElementById("modal")).scope();
    var fileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("UploadFile").value;
    fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
    scope.$apply(function () {
        scope.disable = (fileName === "") ? true : false;
    });
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

var encode = function (value) {
    var returnValue = value.replace(/&/g, "&amp;");
    returnValue = returnValue.replace(/'/g, "&apos;");
    returnValue = returnValue.replace(/"/g, "&quot;");
    returnValue = returnValue.replace(/</g, "&lt;");
    returnValue = returnValue.replace(/>/g, "&gt;");

    return returnValue;
};

var paf = angular.module('paf', ['ui.bootstrap', 'ngRoute']);

if (!window.top.fin) {
    window.top.fin = { appUI: { houseCodeId: 415, glbFscYear: 4, glbFscPeriod: 45, glbWeek: 2 } };
}

var getCurrentHcmHouseCode = function () {
    return window.top.fin.appUI.houseCodeId;
}

paf.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/edit/:id', {
        controller: 'pafCtrl',
        templateUrl: 'pafeditor.htm'
    })
    .when('/new', {
        controller: 'pafCtrl',
        templateUrl: 'pafeditor.htm'
    })
    .when('/list', {
        controller: 'pafListCtrl',
        templateUrl: 'paflist.htm'
    })
    .otherwise({
        redirectTo: '/list'
    });
}]);

paf.controller('pafCtrl', ['$scope', '$document', 'EmpActions', '$filter', '$timeout', '$routeParams', '$modal', '$location', function ($scope, $document, EmpActions, $filter, $timeout, $routeParams, $modal, $location) {
	$scope.HcmHouseCodes = [];
    $scope.States = [];
	$scope.JobCodes = [];
	$scope.PersonActionTypes = [];
	$scope.PayGrades = [];
	$scope.pafDocs = [];
	var selectedFileName = "";
	$scope.add = "";
	$scope.selectedPafId = $routeParams.id;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

	$scope.pageLoading = false;
	$scope.loadingTitle = " Loading...";
	$scope.isPageLoading = function () {
	    return ($scope.loadingCount > 0 || $scope.pageLoading);
	};

	$scope.lkup = {
	    CarAllowances: EmpActions.getCarAllowances(),
	    ReviewedWithHR: EmpActions.getReviewedWithHR(),
	    BounsEligibles: null,
	    PlanDetails: null,
	    Reason4Changes: null,
	    Layoffs: null,
	    Terminations: null,
	    Resignations: null
	};

	var initCompensation = function () {
	    return {
	        CurrentPayGrade: 0,
	        CurrentSalary: 0,
	        CurrentPayRange: 0,
	        ReportingName: '',
	        ReportingTitle: '',
	        ReportingEmail: '',
	        ReportingManagerNumber: '',
	        DateLastIncrease: null,
	        PercentLastIncrease: "0%",
	        CurrentPosition: '',
	        EmployeeNumber: '',
	        CurrentPositionType: ''
	    };
	};

	$scope.empAction = {
	    Number: 0,
	    HcmHouseCode: null,
	    EmployeeNumber: null,
	    FirstName: null,
	    LastName: null,
	    NewHire: false,
	    ReHire: false,
	    Separation: false,
	    Loa: false,
	    SalaryChange: false,
	    Promotion: false,
	    Demotion: false,
	    Transfer: false,
	    PersonalInfoChange: false,
	    Relocation: false,
	    Data: {
	        NewHire: {},
	        ReHire: {},
	        Separation: {},
	        Loa: {},
	        Promotion: {},
	        Demotion: {},
	        SalaryChange: {},
	        Transfer: {},
	        PersonalInfoChange: {},
	        Relocation: {},
	        Requisition: {},
	        Compensation: initCompensation()
	    }
	};
	
	var loadHouseCodes = function () {
	    EmpActions.getHcmHouseCodes(function (result) {
	        $scope.HcmHouseCodes = result;
	    });
	};
	
	var loadStateTypes = function () {
	    EmpActions.getStateTypes(function (result) {
	        $scope.States = result;
	    });
	};
	
	var loadJobCodes = function () {
	    EmpActions.getJobCodes(function (result) {
	        $scope.JobCodes = result;
	    });
	};
	
	var loadPersonActionTypes = function () {
	    EmpActions.getPersonActionTypes(function (result) {
	        var filters = function (item) {
	            return $filter('filter')(result, { typeName: item });
	        }

	        $scope.lkup.BounsEligibles = filters("BonusEligible");
	        $scope.lkup.PlanDetails = filters("Plan");
	        $scope.lkup.Reason4Changes = filters("Reason4Change");
	        $scope.lkup.Layoffs = filters("Layoff");
	        $scope.lkup.Terminations = filters("Termination");
	        $scope.lkup.Resignations = filters("Resignation");
	    });
	};
	
	var loadPayGrades = function () {
	    EmpActions.getPayGrades(function (result) {
	        $scope.PayGrades = result;
	    });
	};
	
	var initReporting = function (positionType) {
	    if (!$scope.empAction.Data.Compensation)
	        return;

	    var isManagerInfoChanged = function (obj, existManagerNumber) {

	        if (existManagerNumber && existManagerNumber.length > 0)
	            return true;

	        if (obj.ReportingManagerNumber && angular.equals(parseInt(obj.ReportingManagerNumber), parseInt(existManagerNumber)))
	            return false;

	        if (obj.ReportingName && obj.ReportingEmail && obj.ReportingTitle && obj.ReportingName.length > 0 && obj.ReportingEmail.length > 0 && obj.ReportingTitle.length > 0)
	            return false;

	        return true;
	    }

	    var initReportingValue = function (type, obj) {
	        if ($scope.empAction.Data && !isManagerInfoChanged($scope.empAction.Data[type], obj.ReportingManagerNumber))
	            return;

	        $scope.empAction.Data[type].ReportingType = type;
	        if (type == "NewHire" || type == "ReHire") {
	            $scope.empAction.ManagerName = obj.ReportingName;
	            $scope.empAction.ManagerTitle = obj.ReportingTitle;
	            $scope.empAction.ManagerEmail = obj.ReportingEmail;
	            $scope.empAction.ManagerNumber = obj.ReportingManagerNumber;
	        }
	        if (type == "Promotion" || type == "Demotion" || type == "SalaryChange") {
	            $scope.empAction.NewManagerName = obj.ReportingName;
	            $scope.empAction.NewManagerTitle = obj.ReportingTitle;
	            $scope.empAction.NewManagerEmail = obj.ReportingEmail;
	            $scope.empAction.NewManagerNumber = obj.ReportingManagerNumber;
	            if ($scope.empAction.NewManagerNumber != null) {
	                getManagerDetail($scope.empAction.NewManagerNumber, function (response) {
	                    if (!angular.isDefined(response)) {
	                        $scope.empAction.RegionalManagerNumber = null;
	                        $scope.empAction.RegionalManagerName = null;
	                        $scope.empAction.RegionalManagerTitle = null;
	                        $scope.empAction.RegionalManagerEmail = null;
	                    }
	                    else {
	                        if (response.managerClock == 0) {
	                            $scope.empAction.RegionalManagerNumber = null;
	                        }
	                        else {
	                            $scope.empAction.RegionalManagerNumber = response.managerClock;
	                        }
	                        $scope.empAction.RegionalManagerName = response.managerName;
	                        $scope.empAction.RegionalManagerTitle = response.jobTitle;
	                        $scope.empAction.RegionalManagerEmail = response.managerEmail;
	                    }
	                });
	            }
	        }
	        if (type == "Transfer") {
	            $scope.empAction.TransferManagerName = obj.ReportingName;
	            $scope.empAction.TransferManagerTitle = obj.ReportingTitle;
	            $scope.empAction.TransferManagerEmail = obj.ReportingEmail;
	            $scope.empAction.TransferManagerNumber = obj.ReportingManagerNumber;
	        }
	        $scope.empAction.Data[type].CacheReportingManagerNumber = obj.ReportingManagerNumber;
	        $scope.empAction.Data[type].DisabledReportFields = obj.ReportingManagerNumber && obj.ReportingManagerNumber.length > 0 && obj.ReportingTitle && obj.ReportingTitle.length > 0 && obj.ReportingEmail && obj.ReportingEmail.length > 0;
	        $scope.empAction.Data[type].DisabledReportingManagerNumberField = false;
	    }

	    var items = ["NewHire", "ReHire", "Promotion", "Demotion", "SalaryChange", "Transfer"];
	    if (angular.isDefined(positionType) && items.indexOf(positionType) >= 0 && $scope.empAction.Data.Compensation) {
	        initReportingValue(positionType, $scope.empAction.Data.Compensation);
	    }
	    else {
	        angular.forEach(items, function (item, index) {
	            initReportingValue(item, $scope.empAction.Data.Compensation);
	        });
	    }
	};

	var getEmpCompensation = function (employeeNumber, callback) {
	    EmpActions.getEmpCompensation(employeeNumber, function (response) {
	        callback(response);
	    });
	};

	var getManagerDetail = function (employeeNumber, callback) {
	    EmpActions.getManagerDetail(employeeNumber, function (response) {
	        callback(response);
	    });
	};

	var getAdministratorDetail = function (callback) {
	    EmpActions.getAdministratorDetail(function (response) {
	        callback(response);
	    });
	};

	getAdministratorDetail(function (response) {
	    if (angular.isDefined(response)) {
	        $scope.empAction.AdministratorEmail = resonse.empEmail;
	        $scope.disableAdminEmail = resonse.empEmail && resonse.empEmail.length > 0;
	    }
    });

	var loadCompensations = function (employeeNumber) {

	    getEmpCompensation(employeeNumber, function (response) {
	        if (!angular.isDefined(response)) {
	            $scope.empAction.Data.Compensation = initCompensation();
	        }
	        else {
	            $scope.empAction.Data.Compensation = {
	                CurrentPayGrade: response.payGrade + " (" + response.minPayRange + " - " + response.midPayRange + " - " + response.maxPayRange + ")",
	                CurrentSalary: parseFloat(response.annualPayAmt).toFixed(2),
	                CurrentPayRange: $scope.getPayRange(response.payGrade, response.annualPayAmt),
	                ReportingName: response.mgrFirstName + " " + response.mgrLastName,
	                ReportingTitle: response.mgrTitle,
	                ReportingEmail: response.mgrEmail,
	                ReportingManagerNumber: response.mgrClock,
	                DateLastIncrease: $filter("date")(new Date(response.dateBeg), "MM/dd/yyyy"),
	                PercentLastIncrease: ((response.annualPayAmt - response.priorAnnualPayAmt) / response.priorAnnualPayAmt).toFixed(2) * 100 + "%",
	                CurrentPosition: response.empTitle,
	                EmployeeNumber: response.empNumber,
	                CurrentPositionType: $filter('filter')($scope.JobCodes, { name: response.mgrTitle })
	            }
	        }

	        initReporting();
	    });
	};

	$scope.getManagerInfo = function (employeeNumber, positionType) {

	    if (positionType == "NewHire" || positionType == "ReHire") {
	        var ReportingManagerNumber = $scope.empAction.ManagerNumber;
	    }
	    if (positionType == "Promotion" || positionType == "Demotion" || positionType == "SalaryChange") {
	        var ReportingManagerNumber = $scope.empAction.NewManagerNumber;
	    }
	    if (positionType == "Transfer") {
	        var ReportingManagerNumber = $scope.empAction.TransferManagerNumber;
	    }

	    if (employeeNumber !== "" && $scope.empAction.Data && (ReportingManagerNumber.length === 0 || parseInt(employeeNumber) !== parseInt($scope.empAction.Data[positionType].CacheReportingManagerNumber))) {
            $scope.empAction.Data[positionType].CacheReportingManagerNumber = employeeNumber;

                getManagerDetail(employeeNumber, function (response) {
                    if (!angular.isDefined(response)) {
                        alert("The Managers/Clock Number you enter is not exist.");
                        return;
                    }
                    if (positionType == "NewHire" || positionType == "ReHire") {
                        $scope.empAction.ManagerName = response.empFirstName + " " + response.empLastName;
                        $scope.empAction.ManagerTitle = response.empTitle;
                        $scope.empAction.ManagerEmail = response.empEmail;
                        $scope.empAction.ManagerNumber = response.empClock;
                    }
                    if (positionType == "Promotion" || positionType == "Demotion" || positionType == "SalaryChange") {
                        $scope.empAction.NewManagerName = response.ReportingName;
                        $scope.empAction.NewManagerTitle = response.ReportingTitle;
                        $scope.empAction.NewManagerEmail = response.ReportingEmail;
                        $scope.empAction.NewManagerNumber = response.ReportingManagerNumber;
                    }
                    if (positionType == "Transfer") {
                        $scope.empAction.TransferManagerName = response.ReportingName;
                        $scope.empAction.TransferManagerTitle = response.ReportingTitle;
                        $scope.empAction.TransferManagerEmail = response.ReportingEmail;
                        $scope.empAction.TransferManagerNumber = response.ReportingManagerNumber;
                    }
                    $scope.empAction.Data[positionType].CacheReportingManagerNumber = response.empClock;
                    $scope.empAction.Data[positionType].DisabledReportFields = response.empClock && response.empClock.length > 0 && response.empTitle && response.empTitle.length > 0 && response.empEmail && response.empEmail.length > 0;
                    $scope.empAction.Data[positionType].DisabledReportingManagerNumberField = false;
                });
        }
        else
            return;
    };

    $scope.isManagerFieldRequired = function (item) {

        if (item && item.ReportingName && item.ReportingEmail && item.ReportingTitle && item.ReportingName.length > 0 && item.ReportingEmail.length > 0 && item.ReportingTitle.length > 0)
            return false;

        return true;
    };

    var loadEmployee = function (employeeNumber, callback) {
        EmpActions.getEmployee(employeeNumber, 0, function (result) {
            $scope.empAction.Data.Employee = null;
            $scope.empAction.Data.Person = null;
            $scope.empAction.Data.Compensation = null;

            if (result == null) {
                callback(false);
            }
            else {
                $scope.empAction.EmployeeId = result.id;
                $scope.empAction.Data.Employee = result;
                $scope.empAction.Data.Employee.HcmHouseCode = EmpActions.getHcmHouseCodeByBrief(result.houseCode);
                $scope.empAction.HcmHouseCode = EmpActions.getHcmHouseCodeByBrief(result.houseCode);

                loadCompensations(employeeNumber);

                EmpActions.getPerson(result.id, function (response) {
                    $scope.empAction.PersonId = response.id;
                    $scope.empAction.FirstName = result.firstName;
                    $scope.empAction.MiddleName = response.middleName;
                    $scope.empAction.LastName = result.lastName;
                    $scope.empAction.AddressLine1 = response.addressLine1;
                    $scope.empAction.AddressLine2 = response.addressLine2;
                    $scope.empAction.City = response.city;
                    $scope.empAction.Phone = response.homePhone;
                    $scope.empAction.PostalCode = response.postalCode;
                    $scope.empAction.StateType = parseInt(response.state);
                    $scope.empAction.Data.Person = response;

                    callback(true);
                });
            }
        });
    };

    var lastEmployeeNumber = null;

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
        var authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmployeePAF";
        $scope.readOnly = isAuthorized(authorizePath + "\\Read");
        $scope.write = isAuthorized(authorizePath + "\\Write");
        $scope.writeInProcess = isAuthorized(authorizePath + "\\InProcessWrite");
        $scope.approveInProcess = isAuthorized(authorizePath + "\\ApproveInProcess");
    };

    var init = function () {
        loadHouseCodes();
        loadStateTypes();
        loadJobCodes();
        loadPersonActionTypes();
        loadPayGrades();
        EmpActions.getAuthorizations(function (result) {
            $scope.authorizations = result;
            authorizationsLoaded();
        });
    };

    $scope.getPayRange = function (payGrade, salary) {

        if (!payGrade || isNaN(salary))
            return "";

        var payGradeItem = $filter('filter')($scope.PayGrades, function (item) {
            return item.id == payGrade;
        });

        if (!angular.isDefined(payGradeItem) || !payGradeItem || payGradeItem.length === 0)
            return "";

        payGradeItem = payGradeItem[0];

        var range = "";
        if (salary < payGradeItem.min)
            range = "Below Min";
        else if (salary === payGradeItem.min)
            range = "Min";
        else if (salary > payGradeItem.min && salary < payGradeItem.mid)
            range = "Min to Mid";
        else if (salary === payGradeItem.mid)
            range = "Mid";
        else if (salary > payGradeItem.mid && salary < payGradeItem.max)
            range = "Mid to Max";
        else if (salary === payGradeItem.max)
            range = "Max";
        else if (salary > payGradeItem.max)
            range = "Over Max";

        return range;
    };

    init();

    if ($routeParams.id) {
        EmpActions.findEmployeePersonnelAction($routeParams.id, function (result) {
            if (!result) {
                $location.path('/list');
                return;
            }
            $scope.empAction = result;
            if ($scope.empAction.ResignationType > 0) {
                $scope.empAction.SeparationReason = "ResignationType";
            }
            else if ($scope.empAction.TerminationType > 0) {
                $scope.empAction.SeparationReason = "TerminationType";
            }
            else if ($scope.empAction.LayoffType > 0) {
                $scope.empAction.SeparationReason = "LayoffType";
            }

            loadCompensations($scope.empAction.EmployeeNumber);
        });
        EmpActions.findEmployeePAFDocument($routeParams.id, function (result) {
            $scope.pafDocs = result;
        });
    }

    var validateHcmHouseCode = function () {
        if ($scope.empAction.Data.Employee && $scope.empAction.Data.Employee.HcmHouseCode !== $scope.empAction.HcmHouseCode) {
            $scope.pafForm.HcmHouseCode.$setValidity("matched", false);
        }
        else
            $scope.pafForm.HcmHouseCode.$setValidity("matched", true);
    };

    $scope.$watch('empAction.HcmHouseCode', function (newValue, oldValue) {
        if (!newValue && !oldValue)
            return;
        if ($scope.empAction.Data.Employee && $scope.empAction.Data.Employee.HcmHouseCode != newValue) {
            alert("House Code is not same as Employee Number House Code.");
        }
        validateHcmHouseCode();
    });

    $scope.onEmployeeNumberChanged = function (employeeNumber) {
        if (angular.isDefined($scope.empAction.Data.Employee)) {
            if ($scope.empAction.Data.Employee === null || parseInt($scope.empAction.Data.Employee.employeeNumber) === parseInt(employeeNumber)) {
                return;
            }
        }

        if (employeeNumber) {
            $scope.empAction.Data.Employee = null;
            $scope.empAction.Data.Person = null;
            $scope.empAction.Data.Compensation = null;

            loadEmployee(employeeNumber, function (matched) {
                if (matched) {
                    if ($scope.empAction.HcmHouseCode && $scope.empAction.Data.Employee.HcmHouseCode !== $scope.empAction.HcmHouseCode) {
                        alert("Employee Number is out of House Code.");
                    }
                }
                validateHcmHouseCode();
            });

        }
    };

    $scope.isPersonEditable = function () {
        return $scope.empAction.Data.Person != null;
    };

    $scope.onHouseCodeChange = function () {
        if (lastEmployeeNumber != null) {
            if (_hcmHouseCode !== $scope.empAction.HcmHouseCode) {
                alert("House Code is not same as Employee Number House Code.");
                $scope.pafForm.HcmHouseCode.$setValidity("required", false);
            }
            else {
                $scope.pafForm.EmployeeNumber.$setValidity("required", true);
            }
        }
        else {
            if ($scope.empAction.HcmHouseCode)
                $scope.pafForm.HcmHouseCode.$setValidity("required", true);
        }
    };

    $scope.PositionTypes = [
        { id: 'NewHire', display: 'New Hire' },
        { id: 'ReHire', display: 'Re-Hire' },
        { id: 'Separation', display: 'Separation' },
        { id: 'Loa', display: 'LOA' },
        { id: 'Promotion', display: 'Promotion' },
        { id: 'Demotion', display: 'Demotion' },
        { id: 'SalaryChange', display: 'Salary Change' },
        { id: 'Transfer', display: 'Transfer' },
        { id: 'PersonalInfoChange', display: 'Personal Info Change' },
        { id: 'Relocation', display: 'Relocation' }];

    var postionTypeGroups = [
        ['NewHire', 'ReHire', 'Separation', 'Loa'],
        ['Promotion', 'Demotion', 'SalaryChange', 'Separation'],
        ['Transfer', 'Separation'], 'PersonalInfoChange', ['Relocation', 'Separation']
    ];

    var separationGroupItems = ['Transfer', 'Relocation', 'Promotion', 'Demotion', 'SalaryChange', 'NewHire', 'ReHire', 'Loa'];

    var positionFields = {
        NewHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "PartTimeHours", "AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount", "PerDiemValue", "PayGrade", "PayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        ReHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "PartTimeHours", "AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount", "PerDiemValue", "PayGrade", "PayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        Separation: ["SeparationDate", "VacationDaysDue", "PayNumberOfWeeks", "SeparationReason", "ResignationType", "TerminationType", "LayoffType", "SeparationReHire"],
        Loa: ["LoaDate", "DateOfReturn"],
        Requisition: ["RequisitionNumber", "EmailAddress"],
        Promotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Demotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        SalaryChange: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "ReportingName", "ReportingTitle", "ReportingEmail", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Transfer: ["TransferEffectiveDate", "HouseCodeTransfer", "ReportingName", "ReportingTitle", "ReportingEmail"],
        PersonalInfoChange: ["InfoChangeEffectiveDate", "InfoChangeFirstName", "InfoChangeMiddleName", "InfoChangeLastName", "InfoChangeAddressLine1", "InfoChangeAddressLine2", "InfoChangePhone", "InfoChangeCity", "AppStateTypeInfoChange", "InfoChangePostalCode"],
        Relocation: ["RelocationApprovedBy", "RelocationPlan"]
    };

    var resetPositionTypeFields = function (positionType) {
        var obj = $scope.empAction.Data[positionType];
        if (angular.isObject(obj)) {
            angular.forEach(positionFields[positionType], function (item, index) {
                obj[item] = null;
            });

            initReporting(positionType);
        }
    };

    var initialEmpAction = function () {
        angular.forEach($scope.PositionTypes, function (item, index) {
            resetPositionTypeFields(item.id);
        });
    };

    initialEmpAction();

    var uncheckPositionType = function (positionType) {
        if (!$scope.empAction[positionType])
            return;

        $scope.empAction[positionType] = false;
        resetPositionTypeFields(positionType);
    };

    $scope.onPositionTypeChanged = function (positionType) {
        $scope.empAction[positionType] = !$scope.empAction[positionType];

        if ($scope.empAction[positionType]) {
            if (positionType === 'Separation') {
                $.each(separationGroupItems, function (gi, item) {
                    if (item != positionType)
                        uncheckPositionType(item);
                })
            }
            else {
                $.each(postionTypeGroups, function (gi, group) {

                    if (group.indexOf(positionType) >= 0) {

                        $.each(group, function (ii, item) {
                            if (item != positionType)
                                uncheckPositionType(item);
                        });
                    }
                });
            }
            if (positionType == 'NewHire') {
                $scope.empAction.EmployeeNumber = null;
                $scope.newHireChecked = true;
            }
            else {
                $scope.newHireChecked = false;
            }
        }
        else {
            resetPositionTypeFields(positionType);
        }

        if (!($scope.empAction.NewHire || $scope.empAction.ReHire || $scope.empAction.SalaryChange || $scope.empAction.Promotion || $scope.empAction.Transfer || $scope.empAction.Demotion)) {
            resetPositionTypeFields('Requisition');
        }

        validateActionType();
    };

    $scope.positionTypeChecked = function (positionType) {
        if (!$scope.empAction['NewHire']) {
            $scope.newHireChecked = false;
        }
        return $scope.empAction[positionType];
    };

    $scope.onPercentageChange = function () {
        var increasePercentage = $scope.empAction.IncreaseDecreasePercentage;

        if (increasePercentage === null || increasePercentage === "") {
            increasePercentage = 0;
        }
        increasePercentage = parseFloat(increasePercentage);

        if (isNaN(increasePercentage)) {
            increasePercentage = 0;
            alert("Enter Valid Percentage");
        }
        $scope.empAction.IncreaseDecreasePercentage = increasePercentage.toFixed(2);
    };

    $scope.onAmountChange = function () {
        var increaseAmt = $scope.empAction.IncreaseDecreaseAmount;

        if (increaseAmt === null || increaseAmt === "")
            increaseAmt = 0;

        increaseAmt = parseFloat(increaseAmt);

        if (isNaN(increaseAmt)) {
            increaseAmt = 0;
            alert("Enter Valid Amount");
        }

        $scope.empAction.IncreaseDecreaseAmount = increaseAmt.toFixed(2);
    };

    $scope.onAnnualSalaryChange = function () {
        var salary = $scope.empAction.Amount;

        if (salary == null || salary == "")
            salary = 0;

        salary = parseFloat(salary);

        $scope.empAction.Amount = salary.toFixed(2);
    }

    $scope.onSalaryChange = function (type) {
        var currentSalary = angular.isDefined($scope.empAction.Data.Compensation) ? $scope.empAction.Data.Compensation.CurrentSalary : 0;
        var increaseAmt = $scope.empAction.IncreaseDecreaseAmount;
        var increasePercentage = $scope.empAction.IncreaseDecreasePercentage;

        if (increaseAmt === null || increaseAmt === "")
            increaseAmt = 0;
        else if (increasePercentage === null || increasePercentage === "")
            increasePercentage = 0;

        increaseAmt = parseFloat(increaseAmt);
        increasePercentage = parseFloat(increasePercentage);

        if (isNaN(increaseAmt)) {
            increaseAmt = 0;
        }
        if (isNaN(increasePercentage)) {
            increasePercentage = 0;
        }

        if (angular.isDefined(currentSalary)) {
            currentSalary = parseFloat(currentSalary);
            if (type == 'amt' && currentSalary !== parseFloat(0)) {
                $scope.empAction.IncreaseDecreasePercentage = (increaseAmt * 100 / currentSalary).toFixed(2);
            }
            else if (type == 'percentage')
                $scope.empAction.IncreaseDecreaseAmount = (increasePercentage * currentSalary / 100).toFixed(2);

            if (!$scope.empAction.Demotion)
                $scope.empAction.NewSalary = (currentSalary + parseFloat($scope.empAction.IncreaseDecreaseAmount)).toFixed(2);
            else
                $scope.empAction.NewSalary = (currentSalary - parseFloat($scope.empAction.IncreaseDecreaseAmount)).toFixed(2);

            if (isNaN($scope.empAction.NewSalary)) {
                $scope.empAction.NewSalary = 0;
            }
        }
    };

    $scope.onRowClick = function (item, index) {
        $scope.selectedDocItem = item;
        activeRowIndex = index;
        selectedDocId = item.id;
        selectedFileName = item.fileName;
    };
	
    $scope.addDoc = function () {
        var modalInstance = $modal.open({
            templateUrl: 'upload.html',
            controller: 'modalInstanceCtrl',
            title: "Upload Document",
            size: 'sm',
            scope: $scope
        });
        $scope.add = true;
    };

    $scope.editDoc = function () {
        if (activeRowIndex !== -1) {
            var modalInstance = $modal.open({
                templateUrl: 'upload.html',
                controller: 'modalInstanceCtrl',
                title: "Upload Document",
                size: 'sm',
                scope: $scope
            });
            $scope.docTitle = $scope.pafDocs[activeRowIndex].title;
        }
        $scope.add = false;
    };

    $scope.removeDoc = function () {
        if (selectedDocId > 0 && activeRowIndex !== -1) {
            $scope.pageLoading = true;
            $scope.loadingTitle = " Removing...";
            $scope.pafDocs.splice(activeRowIndex, 1);
            EmpActions.deleteEmployeePAFDocument(selectedDocId, function (data, status) {
                $scope.$apply(function () {
                    $scope.pageLoading = false;
                });
            });
        }
        else if (activeRowIndex !== -1) {
            $scope.pafDocs.splice(activeRowIndex, 1);
        }
        activeRowIndex = -1;
    };

    $scope.viewDoc = function () {
        if (selectedDocId > 0 && activeRowIndex !== -1) {
            $scope.pageLoading = true;
            $scope.loadingTitle = " Downloading...";
            EmpActions.viewEmployeePAFDocument(selectedDocId, selectedFileName, function (data, status) {
                if (data.length === 1) {
                    $("#iFrameDownload")[0].contentWindow.document.getElementById("FileName").value = data[0].fileName;
                    $("#iFrameDownload")[0].contentWindow.document.getElementById("DownloadButton").click();
                }
                $scope.pageLoading = false;
            });
        }
        activeRowIndex = -1;
    };

    var validateActionType = function () {
        var isValid = false;

        angular.forEach($scope.PositionTypes, function (item) {
            if ($scope.empAction[item.id])
                isValid = true;
        });

        if (!isValid) {
            $scope.pafForm.$setValidity('ActionType', false, $scope.pafForm);
        }
        else {
            $scope.pafForm.$setValidity('ActionType', true, $scope.pafForm);
        }
        return isValid;
    };

    $scope.validatePersonalInfo = function () {
        var isValid = false;

        if ($scope.empAction.PersonalInfoChange && angular.isObject($scope.empAction.Data.PersonalInfoChange)) {

            if ($scope.empAction.InfoChangeEffectiveDate && ($scope.empAction.InfoChangeFirstName || $scope.empAction.InfoChangeMiddleName || $scope.empAction.InfoChangeLastName || $scope.empAction.InfoChangeAddressLine1 || $scope.empAction.InfoChangeAddressLine2 || $scope.empAction.InfoChangePhone || $scope.empAction.InfoChangeCity || $scope.empAction.InfoChangeStateType || $scope.empAction.InfoChangePostalCode)) {
                isValid = true;
            }

            if (!isValid)
                $scope.pafForm.$setValidity('personalInfoChange', false, $scope.pafForm);
            else
                $scope.pafForm.$setValidity('personalInfoChange', true, $scope.pafForm);

        }
        else {
            isValid = true;
            $scope.pafForm.$setValidity('personalInfoChange', true, $scope.pafForm);
        }

        return isValid;
    };

    $scope.validateLoa = function () {
        var isValid = false;

        if ($scope.empAction.Loa && angular.isObject($scope.empAction.Data.Loa)) {

            if ($scope.empAction.LoaDate || $scope.empAction.DateReturn) {
                isValid = true;
            }

            if (!isValid)
                $scope.pafForm.$setValidity('loa', false, $scope.pafForm);
            else
                $scope.pafForm.$setValidity('loa', true, $scope.pafForm);

        }
        else {
            isValid = true;
            $scope.pafForm.$setValidity('loa', true, $scope.pafForm);
        }

        return isValid;
    };

    $scope.validateSeparationReason = function () {
        var isValid = false;
        if ($scope.empAction.Separation && angular.isObject($scope.empAction.Data.Separation)) {
            if ($scope.empAction.SeparationReason)
                isValid = true;

            if (!isValid)
                $scope.pafForm.$setValidity('separationReason', false, $scope.pafForm);
            else
                $scope.pafForm.$setValidity('separationReason', true, $scope.pafForm);
        }
        else {
            $scope.pafForm.$setValidity('separationReason', true, $scope.pafForm);
            isValid = true;
        }
        return isValid;
    };

    $scope.save = function () {
        validateActionType();
        $scope.validateSeparationReason();
        $scope.validateLoa();
        $scope.validatePersonalInfo();

        if ($scope.pafForm.$valid) {
            if ($scope.empAction.NewHire || $scope.empAction.ReHire) {
                var salary = 0;
                if ($scope.empAction.PayStatus == "AdminHourlyAmount") {
                    salary = $scope.empAction.Amount * 52 * 40;
                }
                else if ($scope.empAction.PayStatus == "HourlyRateAmount") {
                    salary = $scope.empAction.Amount * 52 * 40;
                }
                var grade = ($scope.empAction.PayGrade == 0 ? $scope.empAction.PayGrade : EmpActions.getPayGradeTitle($scope.empAction.PayGrade));
                $scope.empAction.PayRange = $scope.getPayRange($scope.empAction.PayGrade, salary) + " " + grade.slice(grade.indexOf("("));
            }
            if ($scope.empAction.SalaryChange || $scope.empAction.Demotion || $scope.empAction.Promotion) {
                var newGrade = ($scope.empAction.NewPayGrade == 0 ? $scope.empAction.NewPayGrade : EmpActions.getPayGradeTitle($scope.empAction.NewPayGrade));
                $scope.empAction.NewPayRange = $scope.getPayRange($scope.empAction.NewPayGrade, $scope.empAction.NewSalary) + " " + newGrade.slice(newGrade.indexOf("("));
            }
            if ($scope.empAction.Promotion || $scope.empAction.Demotion || $scope.empAction.SalaryChange) {
                $scope.empAction.CurrentSalary = $scope.empAction.Data.Compensation.CurrentSalary;
                var curPayGrade = $scope.empAction.Data.Compensation.CurrentPayGrade;
                var curGrade = "";
                if (curPayGrade == 0) {
                    $scope.empAction.CurrentPayGrade = 0;
                }
                else if (curPayGrade.indexOf("none") == -1) {
                    $scope.empAction.CurrentPayGrade = curPayGrade.substring(0, curPayGrade.indexOf("("));
                    curGrade = curPayGrade.slice(curPayGrade.indexOf("("));
                }
                $scope.empAction.LastIncreaseDecreaseDate = $scope.empAction.Data.Compensation.DateLastIncrease;
                var lastIncPer = $scope.empAction.Data.Compensation.PercentLastIncrease;
                $scope.empAction.LastIncreaseDecreasePercentage = (lastIncPer == "NaN%" ? "0" : lastIncPer.replace("%", ""));
                $scope.empAction.CurrentPayRange = $scope.empAction.Data.Compensation.CurrentPayRange + curGrade;
            }
            $scope.pageLoading = true;
            $scope.loadingTitle = " Saving...";

            EmpActions.saveEmployeePersonnelAction($scope.empAction, $scope.pafDocs, function (status) {
                $scope.pageLoading = false;
                document.location.hash = 'list';
            });
        }
        else {
            if ($scope.empAction.PersonalInfoChange) {
                showPIToaster();
            }
            else {
                showToaster();
            }
        }
    };

    $scope.saveandsubmit = function () {
        validateActionType();
        $scope.validateSeparationReason();
        $scope.validateLoa();
        $scope.validatePersonalInfo();

        if ($scope.pafForm.$valid) {
            if ($scope.empAction.NewHire || $scope.empAction.ReHire) {
                var salary = 0;
                if ($scope.empAction.PayStatus == "AdminHourlyAmount") {
                    salary = $scope.empAction.Amount * 52 * 40;
                }
                else if ($scope.empAction.PayStatus == "HourlyRateAmount") {
                    salary = $scope.empAction.Amount * 52 * 40;
                }
                var grade = ($scope.empAction.PayGrade == 0 ? $scope.empAction.PayGrade : EmpActions.getPayGradeTitle($scope.empAction.PayGrade));
                $scope.empAction.PayRange = $scope.getPayRange($scope.empAction.PayGrade, salary) + " " + grade.slice(grade.indexOf("("));
            }
            if ($scope.empAction.SalaryChange || $scope.empAction.Demotion || $scope.empAction.Promotion) {
                var newGrade = ($scope.empAction.NewPayGrade == 0 ? $scope.empAction.NewPayGrade : EmpActions.getPayGradeTitle($scope.empAction.NewPayGrade));
                $scope.empAction.NewPayRange = $scope.getPayRange($scope.empAction.NewPayGrade, $scope.empAction.NewSalary) + " " + newGrade.slice(newGrade.indexOf("("));
            }
            if ($scope.empAction.Promotion || $scope.empAction.Demotion || $scope.empAction.SalaryChange) {
                $scope.empAction.CurrentSalary = $scope.empAction.Data.Compensation.CurrentSalary;
                var curPayGrade = $scope.empAction.Data.Compensation.CurrentPayGrade;
                var curGrade = "";
                if (curPayGrade == 0) {
                    $scope.empAction.CurrentPayGrade = 0;
                }
                else if (curPayGrade.indexOf("none") == -1) {
                    $scope.empAction.CurrentPayGrade = curPayGrade.substring(0, curPayGrade.indexOf("("));
                    curGrade = curPayGrade.slice(curPayGrade.indexOf("("));
                }
                $scope.empAction.LastIncreaseDecreaseDate = $scope.empAction.Data.Compensation.DateLastIncrease;
                var lastIncPer = $scope.empAction.Data.Compensation.PercentLastIncrease;
                $scope.empAction.LastIncreaseDecreasePercentage = (lastIncPer == "NaN%" ? "0" : lastIncPer.replace("%", ""));
                $scope.empAction.CurrentPayRange = $scope.empAction.Data.Compensation.CurrentPayRange + curGrade;
            }
            $scope.pageLoading = true;
            $scope.loadingTitle = " Saving and Sumbitting...";

            EmpActions.saveEmployeePersonnelAction($scope.empAction, $scope.pafDocs, function (status) {
            });
        }
        else {
            if ($scope.empAction.PersonalInfoChange) {
                showPIToaster();
            }
            else {
                showToaster();
            }
        }
        EmpActions.getEmployeePersonnelActions($scope.pafFilter, function (items) {
            var i = 0;
            for (var index = 0; index < items.length; index++) {
                i++
            }
            if (i > 0) {
                EmpActions.submitEmployeePersonnelAction(items[i-1], function (data, status) {
                    $scope.pageLoading = false;
                    document.location.hash = 'list';
                    alert("Employee PAF has been submitted successfully.");
                });
            }
        });
    };

    $scope.pafFilter = {
        pafNumber: null,
        hcmHouseCode: null,
        employeeNumber: null,
        createUser: null,
        pafDate: null,
        endDate: null,
        status: 1,
        formType: null
    };
	
    var showPIToaster = function () {
        if ($scope.empAction.Data.PersonalInfoChange.InfoChangeEffectiveDate) {
            var modalInstance = $modal.open({
                template: '<div class="toaster"><div class="header">WARNING</div><div class="content">Please change any personal information.</div></div>',
                // controller: 'modalInstanceCtrl',
                size: 'sm',
                backdrop: false
            });
        }
        else {
            var modalInstance = $modal.open({
                template: '<div class="toaster"><div class="header">WARNING</div><div class="content">Please set the Effective Date and change any personal information.</div></div>',
                // controller: 'modalInstanceCtrl',
                size: 'sm',
                backdrop: false
            });
        }

        setTimeout(function () {
            modalInstance.dismiss('cancel');
        }, 2800);
    }
}])
    .controller('hireCtrl', ['$scope', function ($scope) {
        //status changes
        var Status = ["FullTimeHours", "TemporaryHours", "PartTimeHours"];
        $scope.$watch('empAction.Status', function (newValue, oldValue) {
            angular.forEach(Status, function (item) {
                if (item != newValue) {
                    //$scope.data[item] = null;
                }
            });
        });

        //pay status changes
        var PayStatus = ["AnnualSalaryAmount", "AdminHourlyAmount", "HourlyRateAmount", "PerDiemValue"];
        $scope.$watch('empAction.PayStatus', function (newValue, oldValue) {
            angular.forEach(PayStatus, function (item) {
                if (item != newValue) {
                    //$scope.data[item] = null;
                }
            });

            if ($scope.empAction.PayStatus == 'PerDiemValue')
                $scope.empAction.Status = 'TemporaryHours';
        });

        var calSalary = function () {
            var salary = 0;
            var payStatus = $scope.empAction.PayStatus;
            if (payStatus == 'AnnualSalaryAmount')
                salary = $scope.empAction.Amount;
            else if (payStatus == 'AdminHourlyAmount')
                salary = $scope.empAction.Amount * 52 * 40;
            else if (payStatus == 'HourlyRateAmount')
                salary = $scope.empAction.Amount * 52 * 40;

            return salary;
        }

        $scope.getPayRange = function () {
            var salary = calSalary();
            return $scope.$parent.$parent.getPayRange($scope.empAction.PayGrade, salary);
        }

        $scope.$parent.getManagerInfo = $scope.$parent.$parent.getManagerInfo;
        $scope.$parent.isManagerFieldRequired = $scope.$parent.$parent.isManagerFieldRequired;
    }])
    .controller('separationCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        var SeparationReason = ["ResignationType", "TerminationType", "LayoffType"];
        $scope.$watch('empAction.SeparationReason', function (newValue, oldValue) {

            $scope.$parent.$parent.validateSeparationReason();
            if (!angular.isDefined(newValue) || newValue == null)
                return;
            angular.forEach(SeparationReason, function (item) {
                if (item != newValue) {
                    $scope.data[item] = null;
                }
            });
        });
    }])
    .controller('loaCtrl', ['$scope', function ($scope) {
        var dateChange = function (type) {
            $scope.$parent.$parent.validateLoa();
            if ($scope.empAction.DateReturn && !$scope.empAction.LoaDate || !$scope.empAction.DateReturn && $scope.empAction.LoaDate || !$scope.empAction.DateReturn && !$scope.empAction.LoaDate)
                return;
            var dateOfReturn = new Date($scope.empAction.DateReturn);
            var loaDate = new Date($scope.empAction.LoaDate);

            if (dateOfReturn.getTime() < loaDate.getTime()) {
                if (type == "LoaDate")
                    $scope.empAction.DateReturn = null;
                else
                    $scope.empAction.LoaDate = null;
            }
        }
        //date of return after loa date
        $scope.$watch('empAction.LoaDate', function (newValue, oldValue) {
            if (newValue != oldValue)
                dateChange("LoaDate");
        });

        //date of return change
        $scope.$watch('empAction.DateReturn', function (newValue, oldValue) {
            if (newValue != oldValue)
                dateChange("DateReturn");
        });
    }])
	.filter('reason4ChangeFilter', ['$filter', function ($filter) {
	    return function (item, type) {
	
	        if (type.Demotion) {
	            return $filter("filter")(item, { title: 'Demotion' });
	        }
	
	        if (type.Promotion) {
	            return $filter("filter")(item, { title: 'Promotion' });
	        }
	
	        if (type.SalaryChange) {
	            return $filter("filter")(item, function (value) { return value.title.indexOf("Promotion") == -1 && value.title.indexOf("Demotion") == -1; });
	        }
	    }
	}]);
;

paf.controller('pafListCtrl', ['$scope', 'EmpActions', '$filter', '$sce', '$modal', function ($scope, EmpActions, $filter, $sce, $modal) {

    $scope.pafFilter = {
        pafNumber: null,
        hcmHouseCode: typeof getCurrentHcmHouseCode() == "undefined" ? null : getCurrentHcmHouseCode(),
        employeeNumber: null,
        createUser: null,
        pafDate: null,
        endDate: null,
        status: 1,
        formType: null
    };

    $scope.selectedItem = null;
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

	$scope.pageLoading = false;
	$scope.loadingTitle = " Loading...";
	$scope.isPageLoading = function () {
	    return ($scope.loadingCount > 0 || $scope.pageLoading);
	};
	
	$scope.getPafList = function () {
	    //if ($scope.pafFilter.pafDate)
	    //    $scope.pafFilter.pafDate = $filter('date')($scope.pafFilter.pafDate, 'yyyy-MM-dd')
	    $scope.loadingTitle = " Loading...";
	    EmpActions.getEmployeePersonnelActions($scope.pafFilter, function (items) {
	        $scope.empActions = items;
	    });
	};
	
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
	    var authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmployeePAF";
	    $scope.readOnly = isAuthorized(authorizePath + "\\Read");
	    $scope.write = isAuthorized(authorizePath + "\\Write");
	    $scope.writeInProcess = isAuthorized(authorizePath + "\\InProcessWrite");
	    $scope.approveInProcess = isAuthorized(authorizePath + "\\ApproveInProcess");
	};
	
	var setCurrentHcmHouseCode = function (callback) {
	    EmpActions.setCurrentHcmHouseCode(function (response) {
	        callback(response);
	    });
	};

	var load = function () {
	    EmpActions.getAuthorizations(function (result) {
	        $scope.authorizations = result;
	        authorizationsLoaded();
	    });

	    EmpActions.getHcmHouseCodes(function (result) {
	        $scope.HcmHouseCodes = result;
	        if ($scope.pafFilter.hcmHouseCode != null)
	            $scope.getPafList();
	    });

	    EmpActions.getStateTypes(function (result) {
	    });

	    EmpActions.getJobCodes(function (result) {
	        $scope.JobCodes = result;
	    });

	    EmpActions.getPersonActionTypes(function (result) {
	        var filters = function (item) {
	            return $filter('filter')(result, { typeName: item });
	        }
	    });

	    EmpActions.getPayGrades(function (result) {
	    });

	    EmpActions.getWorkflowSteps(2, function (result) {
	    });

	    if ($scope.pafFilter.hcmHouseCode == null) {
	        setCurrentHcmHouseCode(function (response) {
	            if (!angular.isDefined(response)) {
	                return;
	            }
	            $scope.pafFilter.hcmHouseCode = response.id;
	        });
	    }
	};

    load();

    $scope.getHouseCodeName = function (item) {
        return EmpActions.getTitleById(item.HcmHouseCode, $scope.HcmHouseCodes);
    };

    $scope.getDate = function (date) {
        if (!angular.isDefined(date))
            return;

        date = new Date(date);
        return $filter('date')(date, 'MM/dd/yyyy');
    };

    $scope.clearFilter = function () {
        $scope.pafFilter = {
            pafNumber: null,
            hcmHouseCode: typeof getCurrentHcmHouseCode() == "undefined" ? null : getCurrentHcmHouseCode(),
            employeeNumber: null,
            createUser: null,
            pafDate: null,
            endDate: null,
            status: 1,
            formType: null
        };
    };

    var PositionTypes = [
        { id: 'NewHire', display: 'New Hire' },
        { id: 'ReHire', display: 'Re-Hire' },
        { id: 'Separation', display: 'Separation' },
        { id: 'Loa', display: 'LOA' },
        { id: 'Promotion', display: 'Promotion' },
        { id: 'Demotion', display: 'Demotion' },
        { id: 'SalaryChange', display: 'Salary Change' },
        { id: 'Transfer', display: 'Transfer' },
        { id: 'PersonalInfoChange', display: 'Personal Info Change' },
        { id: 'Relocation', display: 'Relocation' }];

    $scope.FormTypes = PositionTypes;

    $scope.getFormType = function (empItem) {
        var formTypes = [];

        angular.forEach(PositionTypes, function (item, index) {
            if (empItem[item.id] === true) {
                formTypes.push(item.display);
            }
        });

        return $sce.trustAsHtml("<div class='word-wrap'>" + formTypes.join(", ") + "</div>");
    }

    $scope.cancelForm = function (id, houseCodeId) {
        if (!$scope.selectedItem)
            return;

        var modalInstance = $modal.open({
            templateUrl: 'cancel.html',
            controller: 'modalInstanceCtrl',
            title: "Warning",
            size: 'sm'
        });

        modalInstance.result.then(function (result) {
            $scope.loadingTitle = " Cancelling...";
            $scope.pageLoading = true;
            EmpActions.cancelEmployeePersonnelAction(id, houseCodeId, function (data, status) {
                $scope.pageLoading = false;
                $scope.getPafList();
                alert("Employee PAF has been cancelled successfully.");
            });
        });
    };

    $scope.submit = function (selectedItem) {
        $scope.loadingTitle = " Submitting...";
        $scope.pageLoading = true;
        EmpActions.submitEmployeePersonnelAction(selectedItem, function (data, status) {
            $scope.pageLoading = false;
            $scope.getPafList();
            alert("Employee PAF has been submitted successfully.");
        });
    };

    $scope.approve = function (id, HouseCodeId) {
        $scope.loadingTitle = " Approving...";
        $scope.pageLoading = true;
        EmpActions.approveEmployeePersonnelAction(id, HouseCodeId, function (data, status) {
            $scope.pageLoading = false;
            $scope.getPafList();
            alert("Employee PAF has been approved successfully.");
        });
    };

    $scope.itemSelected = function (item) {
        $scope.selectedItem = item;

        if ($scope.selectedItem.WorkflowStep == null || $scope.selectedItem.WorkflowStep == "") {
            $scope.selectedItem.WorkflowStep = 0;
        }
    };

    $scope.Statuses = [
	    { id: 1, title: 'Open' },
	    { id: 2, title: 'In Process' },
	    { id: 8, title: 'Approved' },
	    { id: 9, title: 'Completed' },
	    { id: 6, title: 'Cancelled' },
	    { id: 10, title: 'Unapproved' }
    ];

    $scope.getStatusTitle = function (id) {
        var title = "";

        angular.forEach($scope.Statuses, function (item) {
            if (item.id == id)
                title = item.title;
        });

        return title;
    };

    $scope.getStepTitle = function(stepNumber, statusId) {
        var title = "";

        if (stepNumber != null && stepNumber != "") {
			var brief = EmpActions.getWorkflowBrief(stepNumber);
			
            if (brief != "") {
                if (statusId == 2)
                    title = "- " + brief + " Approved";
                else if (statusId == 10)
                    title = "- " + brief;
            }
        }
		
        return title;
    }
}])
.controller('modalInstanceCtrl', function ($scope, $modalInstance) {
	$scope.disable = true;
	
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.upload = function () {
		if ($scope.docTitle == undefined) {
            return false;
        }

        var fileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("UploadFile").value;
        fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
       
        $("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value = "";
        $("#iFrameUpload")[0].contentWindow.document.getElementById("UploadButton").click();

        $scope.intervalId = setInterval(function () {
            if ($("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value != "") {
                var tempFileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value;
                clearInterval($scope.intervalId);
                $modalInstance.close();

                if (tempFileName == "Error") {
                    alert("Unable to upload the file. Please try again.");
                }
                else {
                    if (activeRowIndex == -1 || activeRowIndex == undefined || $scope.add == true) {
                        var item = {};
                        item["title"] = $scope.docTitle;
                        item["fileName"] = fileName;
                        item["tempFileName"] = tempFileName;
                        $scope.pafDocs.push(item);
                    }
                    else {
						$scope.pafDocs[activeRowIndex].title = $scope.docTitle;
						$scope.pafDocs[activeRowIndex].fileName = fileName;
						$scope.pafDocs[activeRowIndex].tempFileName = tempFileName;
                    }
                }
            }
        }, 1000);
    };
});

paf.directive('pafDatepicker', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
        scope: {
            dtOption: '=',
            dtModel: '=dtModel',
            minDate: '=',
            dtChange: '&dtChange'
        },
        restrict: 'E',
        require: '?ngModel',
        template: '<p class="input-group" style="margin-bottom:0px;"><input class="form-control input-sm" name="{{dtName}}" min-date="minDate" ng-change="dtChange()" ng-required="dtRequired" datepicker-popup="MM/dd/yyyy" pdf-datepicker-popup-config ng-model="dtModel" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
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
.directive('pafInvalid', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var errorClass = 'has-error';

            var toggleClsss = function () {
                var hasError = Object.byString(scope, attrs.pafInvalid + '.$invalid');
                hasError ? element.addClass(errorClass) : element.removeClass(errorClass);
            }
            scope.$watch(attrs.pafInvalid + '.$invalid', toggleClsss);
            //scope.$watch(attrs.pafInvalid + '.$dirty', toggleClsss);
            //scope.$watch('$formAttempted', toggleClsss);
        }
    }
}])
.directive('pafFormat', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {

            if (!ngModel) return;
            var focused = false;

            elem.bind('focus', function () {
                focused = true;

                if (elem.prop('readonly'))
                    return;

                if (typeof ngModel.$viewValue != 'undefined' && ngModel.$viewValue != null)
                    elem.val(ngModel.$viewValue);
            });

            var formatViewValue = function () {
                if (typeof ngModel.$viewValue != 'undefined' && ngModel.$viewValue != null) {
                    var format = /\{0\:?([^}]+)?\}/gi.exec(attrs.pafFormat);

                    if (ngModel.$viewValue != "")
                        elem.val(attrs.pafFormat.replace(/\{0(\:[^}]+)?\}/gi, (!format[1] ? ngModel.$viewValue : parseFloat(ngModel.$viewValue).numberFormat(format[1]))));
                }
            }

            elem.bind('blur', function () {
                focused = false;
                formatViewValue();
            });

            scope.$watch(attrs.ngModel, function () {
                if (!focused) {
                    formatViewValue();
                }
            });
        }
    };
}])
.directive('pafNumeric', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return ''
                var transformedInput = inputValue.replace(/[^0-9.]/g, '');
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
})
.directive('pafInteger', function () {
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
.directive('pafEnter', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.pafEnter);
                    });

                    event.preventDefault();
                }
            });
        }
    }
})
.directive('pafMaxlength', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return ''
                var maxlength = parseInt(attrs.pafMaxlength);
                var transformedInput = inputValue.substring(0, maxlength);
                if (transformedInput != inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }

                return transformedInput;
            });
        }
    };
})
.directive('pafMax', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue == undefined) return ''
                var max = parseInt(attrs.pafMax);
                if (inputValue <= max) {
                    modelCtrl.$setValidity(attrs.name, true);
                    attrs.$set('tooltip', '');
                    return inputValue;
                }
                else {
                    modelCtrl.$setValidity(attrs.name, false);
                    attrs.$set('tooltip', 'Hours must be less than 168');
                    return null;
                }
            });
        }
    };
})
.directive('pafValidation', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var type = angular.uppercase(attrs.pafValidation);

            switch (type) {
                case 'EMAIL':
                    //var EMAIL_REGEXP = new RegExp('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', 'i');
                    ngModel.$parsers.unshift(function (viewValue) {
                        if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(viewValue) || (!attrs.required && viewValue == "")) {
                            ngModel.$setValidity(attrs.name, true);
                            return viewValue;
                        }
                        else {
							ngModel.$setValidity(attrs.name, false);
	                    	return null;
                        }
                    });
                    break;
                case 'NUMERIC':
                    ngModel.$parsers.push(function (inputValue) {
                        if (inputValue == undefined) return '';

                        var transformedInput = inputValue.replace(/[^0-9+.]/g, '');
                        if (transformedInput != inputValue) {
                            modelCtrl.$setViewValue(transformedInput);
                            modelCtrl.$render();
                        }

                        return transformedInput;
                    });
                    break;
            }
        }
    }
})
.factory('Validators', [function () {
    return {
        phoneNumber: function (ctrl, value, attr) {
            var valid = typeof (value) == "string" && /^(\([2-9]|[2-9])(\d{2}|\d{2}\))(-|.|\s)?\d{3}(-|.|\s)?\d{4}$/.test(value);
            if ((attr.required || value != "") && value != null)
                ctrl.$setValidity(attr.name, valid);
            else if (value == "")
				ctrl.$setValidity(attr.name, true);
            return value;
        },
        zipCode: function (ctrl, value, attr) {
			var valid = typeof (value) == "string" && (/(^\d{5}$)|(^\d{9}$)|(^\d{5}-\d{4}$)/.test(value));
			if ((attr.required || value != "") && value != null)
			    ctrl.$setValidity(attr.name, valid);
			else if (value == "")
				ctrl.$setValidity(attr.name, true);
            return value;
        }
    };
}])
.directive('pafMask', ['Validators', function (Validators) {
    /**
     * FIXME: all numbers will have 9 digits after 2016.
     * see http://portal.embratel.com.br/embratel/9-digito/
     */
    var StringMask = (function () {
        var tokens = {
            '0': { pattern: /\d/, _default: '0' },
            '9': { pattern: /\d/, optional: true },
            '#': { pattern: /\d/, optional: true, recursive: true },
            'S': { pattern: /[a-zA-Z]/ },
            '$': { escape: true }
        };
        var isEscaped = function (pattern, pos) {
            var count = 0;
            var i = pos - 1;
            var token = { escape: true };
            while (i >= 0 && token && token.escape) {
                token = tokens[pattern.charAt(i)];
                count += token && token.escape ? 1 : 0;
                i--;
            }
            return count > 0 && count % 2 === 1;
        };
        var calcOptionalNumbersToUse = function (pattern, value) {
            var numbersInP = pattern.replace(/[^0]/g, '').length;
            var numbersInV = value.replace(/[^\d]/g, '').length;
            return numbersInV - numbersInP;
        };
        var concatChar = function (text, character, options) {
            if (options.reverse) return character + text;
            return text + character;
        };
        var hasMoreTokens = function (pattern, pos, inc) {
            var pc = pattern.charAt(pos);
            var token = tokens[pc];
            if (pc === '') return false;
            return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
        };
        var insertChar = function (text, char, position) {
            var t = text.split('');
            t.splice(position >= 0 ? position : 0, 0, char);
            return t.join('');
        };
        var StringMask = function (pattern, opt) {
            this.options = opt || {};
            this.options = {
                reverse: this.options.reverse || false,
                usedefaults: this.options.usedefaults || this.options.reverse
            };
            this.pattern = pattern;

            StringMask.prototype.process = function proccess(value) {
                if (!value) return '';
                value = value + '';
                var pattern2 = this.pattern;
                var valid = true;
                var formatted = '';
                var valuePos = this.options.reverse ? value.length - 1 : 0;
                var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
                var escapeNext = false;
                var recursive = [];
                var inRecursiveMode = false;

                var steps = {
                    start: this.options.reverse ? pattern2.length - 1 : 0,
                    end: this.options.reverse ? -1 : pattern2.length,
                    inc: this.options.reverse ? -1 : 1
                };

                var continueCondition = function (options) {
                    if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
                        return true;
                    } else if (!inRecursiveMode) {
                        inRecursiveMode = recursive.length > 0;
                    }

                    if (inRecursiveMode) {
                        var pc = recursive.shift();
                        recursive.push(pc);
                        if (options.reverse && valuePos >= 0) {
                            i++;
                            pattern2 = insertChar(pattern2, pc, i);
                            return true;
                        } else if (!options.reverse && valuePos < value.length) {
                            pattern2 = insertChar(pattern2, pc, i);
                            return true;
                        }
                    }
                    return i < pattern2.length && i >= 0;
                };

                for (var i = steps.start; continueCondition(this.options) ; i = i + steps.inc) {
                    var pc = pattern2.charAt(i);
                    var vc = value.charAt(valuePos);
                    var token = tokens[pc];
                    if (!inRecursiveMode || vc) {
                        if (this.options.reverse && isEscaped(pattern2, i)) {
                            formatted = concatChar(formatted, pc, this.options);
                            i = i + steps.inc;
                            continue;
                        } else if (!this.options.reverse && escapeNext) {
                            formatted = concatChar(formatted, pc, this.options);
                            escapeNext = false;
                            continue;
                        } else if (!this.options.reverse && token && token.escape) {
                            escapeNext = true;
                            continue;
                        }
                    }

                    if (!inRecursiveMode && token && token.recursive) {
                        recursive.push(pc);
                    } else if (inRecursiveMode && !vc) {
                        if (!token || !token.recursive) formatted = concatChar(formatted, pc, this.options);
                        continue;
                    } else if (recursive.length > 0 && token && !token.recursive) {
                        // Recursive tokens most be the last tokens of the pattern
                        valid = false;
                        continue;
                    } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
                        continue;
                    }

                    if (!token) {
                        formatted = concatChar(formatted, pc, this.options);
                        if (!inRecursiveMode && recursive.length) {
                            recursive.push(pc);
                        }
                    } else if (token.optional) {
                        if (token.pattern.test(vc) && optionalNumbersToUse) {
                            formatted = concatChar(formatted, vc, this.options);
                            valuePos = valuePos + steps.inc;
                            optionalNumbersToUse--;
                        } else if (recursive.length > 0 && vc) {
                            valid = false;
                            break;
                        }
                    } else if (token.pattern.test(vc)) {
                        formatted = concatChar(formatted, vc, this.options);
                        valuePos = valuePos + steps.inc;
                    } else if (!vc && token._default && this.options.usedefaults) {
                        formatted = concatChar(formatted, token._default, this.options);
                    } else {
                        valid = false;
                        break;
                    }
                }

                return { result: formatted, valid: valid };
            };

            StringMask.prototype.apply = function (value) {
                return this.process(value).result;
            };

            StringMask.prototype.validate = function (value) {
                return this.process(value).valid;
            };
        };

        StringMask.process = function (value, pattern, options) {
            return new StringMask(pattern, options).process(value);
        };

        StringMask.apply = function (value, pattern, options) {
            return new StringMask(pattern, options).apply(value);
        };

        StringMask.validate = function (value, pattern, options) {
            return new StringMask(pattern, options).validate(value);
        };

        return StringMask;
    }());

    var phoneMask8D = new StringMask('(000) 000-0000'),
        phoneMask9D = new StringMask('(000) 000-0000X0000');

    var zipcodeMask5D = new StringMask('00000'),
        zipcodeMask6D = new StringMask('00000-00000');

    function clearValue(value) {
        if (!value) {
            return value;
        }

        return value.replace(/[^0-9]/g, '');
    }

    function applyPhoneMask(value) {
        if (!value) {
            return value;
        }

        var formatedValue;
        if (value.length < 11) {
            formatedValue = phoneMask8D.apply(value);
        } else {
            formatedValue = phoneMask9D.apply(value);
        }

        return formatedValue.trim().replace(/[^0-9]$/, '');
    }

    function applyZipCodeMask(value) {
        if (!value) {
            return value;
        }

        var formatedValue;
        if (value.length < 5) {
            formatedValue = zipcodeMask5D.apply(value);
        } else {
            formatedValue = zipcodeMask6D.apply(value);
        }

        return formatedValue.trim().replace(/[^0-9]$/, '');
    }

    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ctrl) {
            if (!ctrl) {
                return;
            }

            var maskType = angular.uppercase(attrs.pafMask);

            var $formatters = '';
            var $parsers = '';

            ctrl.$formatters.push(function (value) {
                if (maskType == 'PHONE')
                    return applyPhoneMask(Validators.phoneNumber(ctrl, value, attrs));
                else if (maskType == 'ZIPCODE')
                    return applyZipCodeMask(Validators.zipCode(ctrl, value, attrs));

                return null;
            });

            ctrl.$parsers.push(function (value) {
                if (!value) {
                    return value;
                }

                var cleanValue = clearValue(value);
                var formatedValue = '';
                if (maskType == 'ZIPCODE')
                    formatedValue = applyZipCodeMask(cleanValue);
                else if (maskType == 'PHONE')
                    formatedValue = applyPhoneMask(cleanValue);

                if (ctrl.$viewValue !== formatedValue) {
                    ctrl.$setViewValue(formatedValue);
                    ctrl.$render();
                }

                return clearValue(formatedValue);
            });

            ctrl.$parsers.push(function (value) {
                if (maskType == 'PHONE')
                    return Validators.phoneNumber(ctrl, value, attrs);
                else if (maskType == 'ZIPCODE')
                    return Validators.zipCode(ctrl, value, attrs);

                return null;
            });
        }
    };
}])
.directive('pafTypeahead', ['$filter', function ($filter) {
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
.directive('pafScope', ['$window', function ($window) {
    return {
        restrict: 'A',
        scope: {
            data: '=pafScope'
        },
        transclude: true,
        link: function (scope, element, attrs, ctrl, transclude) {

            transclude(scope, function (clone, scope) {
                element.append(clone);
            });
        }
    }
}])
//.directive('ngConfirmClick', [function () {
//    return {
//        priority: 1,
//        terminal: true,
//        link: function (scope, element, attr) {
//            var msg = attr.ngConfirmClick || "Are you sure?";
//            var clickAction = attr.ngClick;
//            element.bind('click', function (event) {
//                if (window.confirm(msg)) {
//                    scope.$eval(clickAction)
//                }
//            });
//        }
//    };
//}])
;

$(function () {
    var focusedElement;
    $(document).on('focus', 'input', function () {
        if ($(this).closest('fieldset').prop('disabled')) {
            $(this).blur();
            return;
        }
        if (focusedElement == $(this)) return;  // already focused, return so user can now place cursor at specific point in input.
        focusedElement = $(this);
        setTimeout(function () { focusedElement.select(); }, 50);       // select all text in any field on focus for easy re-entry;
    });
});

paf.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
    var CarAllowances = [
        { Id: '0', Description: '$0/month' },
        { Id: '425', Description: '$425/month' },
        { Id: '500', Description: '$500/month' },
        { Id: '600', Description: '$600/month' },
        { Id: '900', Description: '$900/month' }];

    var ReviewedWithHR = [
        { Id: '0', Description: 'CHRA' },
        { Id: '1', Description: 'CHRC' },
        { Id: '2', Description: 'CSHRC' }
    ]

    var cache = {};

	var authorizations = null;
    var houseCodes = null;
    var stateTypes = null;
	var jobCodes = null;
    var personActionTypes = null;
    var payGrades = null;
    var workflowSteps = null;

    var apiRequest = function (moduleId, targetId, requestXml, callback) {
        //$.ajax({
        //    type: "POST",
        //    dataType: "xml",
        //    url: "/net/crothall/chimes/fin/" + moduleId + "/act/provider.aspx",
        //    data: "moduleId=" + moduleId + "&requestId=1&targetId=iiCache"
        //        + "&requestXml=" + encodeURIComponent(requestXml),
        //    success: function (xml) {
        //        if (callback)
        //            callback(xml);
        //    }
        //});

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
        })
        .error(function (error) {
            $rootScope.loadingCount--;
        });
    }

    var getEmployeePersonnelActions = function (filter, callback) {

        var filterStr = "";
        var boolItems = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];
        var intItems = ["HcmHouseCode", "EmployeeNumber", "StateType", "PositionType", "TrainingLocation", "Duration", "CarAllowance", "BonusEligibleType", "LayoffType", "OldPositionType", "NewPositionType", "ChangeReasonType", "NewCarAllowance", "NewBonusEligibleType", "HouseCodeTransfer", "InfoChangeStateType", "RelocationPlan", "PayGrade", "NewPayGrade"];
        var dateItems = ["Date", "HireDate", "SeparationDate", "LoaDate", "DateOfReturn", "EffectiveDate", "LastIncreaseDate", "EffectiveDate", "TransferEffectiveDate", "InfoChangeEffectiveDate"];

        angular.forEach(filter, function (value, key) {

            if (value != null && angular.isDefined(value) && value.toString().length > 0) {
                if (angular.isDate(value))
                    value = $filter('date')(value, "yyyy-MM-dd");

                filterStr += "," + key + ":" + value;
            }
        });

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeePersonnelActions,userId:[user] ' + filterStr + '</criteria>', function (xml) {

            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: true, boolItems: boolItems, intItems: intItems, dateItems: dateItems, jsonItems: ['Data'] }));
        });

    };
    var findEmployeePersonnelAction = function (id, callback) {
        var boolItems = ["NewHire", "ReHire", "Separation", "LOA", "SalaryChange", "Promotion", "Demotion", "Transfer", "PersonalInfoChange", "Relocation"];
        var intItems = ["HcmHouseCode", "EmployeeNumber", "StateType", "PositionType", "TrainingLocation", "Duration", "CarAllowance", "BonusEligibleType", "LayoffType", "OldPositionType", "NewPositionType", "ChangeReasonType", "NewCarAllowance", "NewBonusEligibleType", "HouseCodeTransfer", "InfoChangeStateType", "RelocationPlan", "PayGrade", "NewPayGrade"];
        var dateItems = ["Date", "HireDate", "SeparationDate", "LoaDate", "DateOfReturn", "EffectiveDate", "LastIncreaseDate", "EffectiveDate", "TransferEffectiveDate", "InfoChangeEffectiveDate"];

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeePersonnelActions,userId:[user]' + ",actionId:" + id + ',</criteria>', function (xml) {
            if (callback) {
                var action = deserializeXml(xml, 'item', { upperFirstLetter: true, boolItems: boolItems, intItems: intItems, dateItems: dateItems, jsonItems: ['Data'] })[0];

                if (!action) {
                    callback();
                    return;
                }

                action.Data = action.Data || {};
                action.Data.NewHire = action.Data.NewHire || {};
                action.Data.ReHire = action.Data.ReHire || {};
                action.Data.Separation = action.Data.Separation || {};
                action.Data.Loa = action.Data.Loa || {};
                action.Data.Promotion = action.Data.Promotion || {};
                action.Data.Demotion = action.Data.Demotion || {};
                action.Data.SalaryChange = action.Data.SalaryChange || {};
                action.Data.Transfer = action.Data.Transfer || {};
                action.Data.PersonalInfoChange = action.Data.PersonalInfoChange || {};
                action.Data.Relocation = action.Data.Relocation || {};
                callback(action);
            }
        });
    };

    var findEmployeePAFDocument = function (id, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeePAFDocuments,userId:[user]' + ",pafId:" + id + ',</criteria>', function (xml) {
            pafDocuments = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            callback(pafDocuments);
        });
    }

    var viewEmployeePAFDocument = function (id, fileName, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:empFileNames,userId:[user]' + ",id:" + id + ",fileName:" + fileName + ',</criteria>', function (xml) {
            pafDocuments = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            callback(pafDocuments);
        });
    };

    var getPayGrades = function (callback) {
        if (cache.payGrades)
            callback(cache.payGrades);
        else {
            apiRequest('emp', 'iiCache', '<criteria>storeId:payGrades,userId:[user] ,</criteria>', function (xml) {
                cache.payGrades = $filter('orderBy')(deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['min', 'max', 'mid', 'id'] }), 'id', false);
                getPayGrades(callback);
            });
        }
    };
	
    var getAuthorizations = function (callback) {
        if (cache.authorizations) {
            callback(cache.authorizations);
            return;
        }
        apiRequest('emp', 'iiAuthorization', '<authorization id="1"><authorize path="\\crothall\\chimes\\fin\\Setup\\EmployeePAF" />', function (xml) {
            cache.authorizations = deserializeXml(xml, 'authorize', { upperFirstLetter: false, intItems: ['id'] });
            getAuthorizations(callback);
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

    var setCurrentHcmHouseCode = function (callback) {

        apiRequest('hcm', 'iiCache', '<criteria>storeId:hcmHouseCodes,userId:[user],defaultOnly:true,</criteria>', function (xml) {
            if (callback)
                callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
        });
    };

    var getTitleById = function (id, data) {
        var title = "";

        for (var index = 0; index < data.length; index++) {
            if (data[index].id + "" === id + "") {
                if (data[index].name != undefined)
                    title = data[index].name;
                else
                    title = data[index].title;
                break;
            }
        }

        return title;
    };
	
    var getHcmHouseCodeByBrief = function (brief) {
        if (cache.houseCodes == null)
            return "";

        var hcmHouseCode = 0;

        angular.forEach(cache.houseCodes, function (item, index) {
            if (item.brief == brief) {
                hcmHouseCode = item.id;
            }
        });

        return hcmHouseCode;
    };

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

    var getEmployee = function (employeeNumber, hcmHouseCode, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeeSearchs,userId:[user]'
	        + ',searchValue:' + employeeNumber
	        + ',hcmHouseCodeId:' + hcmHouseCode
	        + ',employeeType:SearchFull,filterType:Employee Number'
			+ ',</criteria>', function (xml) {
			    if (callback) {
			        var matched = deserializeXml(xml, 'item', { upperFirstLetter: false });
			        callback(matched && matched.length > 0 ? matched[0] : null);
			    }
			});
    };

    var getPerson = function (employeeId, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:persons,userId:[user]'
            + ',id:' + employeeId
            + ',</criteria>', function (xml) {
                if (callback)
                    callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
            });
    };

    var getEmpCompensation = function (employeeNumber, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeeCompensation,userId:[user]'
			+ ',employeeNumber:' + employeeNumber
        	+ ',</criteria>', function (xml) {
        	    if (callback)
        	        callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
        	});
    };

    var getManagerDetail = function (employeeNumber, callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeeManagerDetails,userId:[user]'
			+ ',employeeNumber:' + employeeNumber
            + ',</criteria>', function (xml) {
                if (callback)
                    callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
            });
    };

    var getAdministratorDetail = function (callback) {

        apiRequest('emp', 'iiCache', '<criteria>storeId:employeeManagerDetails,userId:[user]'
           + ',searchValue:' + 'adminEmail'
           + ',</criteria>', function (xml) {
               if (callback)
                   callback(deserializeXml(xml, 'item', { upperFirstLetter: false })[0]);
           });
    };

    var getWorkflowSteps = function (moduleId, callback) {

        if (cache.workflowSteps) {
            callback(cache.workflowSteps);
            return;
        }

        apiRequest('app', 'iiCache', '<criteria>storeId:appWorkflowSteps,userId:[user],workflowModuleId:' + moduleId + ',</criteria>', function (xml) {
            if (callback) {
                cache.workflowSteps = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                callback(cache.workflowSteps);
            }
        });
    };

    var getWorkflowBrief = function (id) {
        if (cache.workflowSteps == null)
            return "";

        var brief = "";

        angular.forEach(cache.workflowSteps, function (item, index) {
            if (item.id == id) {
                brief = item.brief;
            }
        });

        return brief;
    };

    var getPayGradeTitle = function (id) {

        if (cache.payGrades == null)
            return "";

        var title = "";

        for (var index = 0; index < cache.payGrades.length; index++) {
            var item = cache.payGrades[index];
            if (item.id + "" === id + "") {
                title = item.id + " (" + item.min + "-" + item.mid + "-" + item.max + ")";
                break;
            }
        }

        return title;
    };

    var getCarAllowances = function () {
        return CarAllowances;
    };

    var getJobCodes = function (callback) {
        if (cache.jobCodes) {
            callback(cache.jobCodes);
            return;
        }
        apiRequest('emp', 'iiCache', '<criteria>storeId:jobCodes,userId:[user],</criteria>', function (xml) {
            cache.jobCodes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            getJobCodes(callback);
        });
    };

    var getReviewedWithHR = function (callback) {
        return ReviewedWithHR;
    };

    var getPersonActionTypes = function (callback) {

        if (cache.personActionTypes) {
            callback(cache.personActionTypes);
            return;
        }

        apiRequest('emp', 'iiCache', '<criteria>storeId:personnelActionTypes,userId:[user],</criteria>', function (xml) {
            cache.personActionTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
            getPersonActionTypes(callback);
        });
    };

    var saveEmployeePersonnelAction = function (employeePersonnelAction, employeePAFDocuments, callback) {
        var xml = "";

        xml = '<transaction id="1">';
        xml += '<employeePersonnelAction';

        angular.forEach(employeePersonnelAction, function (value, key) {
            key = lowercaseFirstLetter(key);

            if (value == null || !angular.isDefined(value))
                value = "";
            else if (angular.isDate(value)) {
                value = $filter('date')(value, "MM/dd/yyyy");
            }
            else if (angular.isObject(value)) {
                value = angular.toJson(value).replace(/"/gi, "###");
            }

            xml += ' ' + key + '="' + encode(value.toString()) + '"';
        });

        xml += '/>';

        for (var index = 0; index < employeePAFDocuments.length; index++) {
            if (employeePAFDocuments[index].tempFileName != undefined) {
                xml += '<employeePAFDocument';
                xml += ' id="' + (employeePAFDocuments[index].id == undefined ? "0" : employeePAFDocuments[index].id) + '"';
                xml += ' title="' + encode(employeePAFDocuments[index].title) + '"';
                xml += ' description=""';
                xml += ' fileName="' + employeePAFDocuments[index].fileName + '"';
                xml += ' tempFileName="' + employeePAFDocuments[index].tempFileName + '"';
                xml += '/>';
            }
        }

        xml += '</transaction>';

        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var deleteEmployeePAFDocument = function (id, callback) {
        var xml = '<transaction id="' + id + '"><employeePAFDocumentDelete id="' + id + '" /></transaction>';
        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';

        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var cancelEmployeePersonnelAction = function (id, houseCodeId, callback) {
        var xml = "";

        xml = '<transaction id="' + id + '">';
        xml += '<cancelEmployeePersonnelAction';
        xml += ' id="' + id + '"';
        xml += ' houseCodeTitle="' + getTitleById(houseCodeId, cache.houseCodes) + '"';
        xml += '/>';
        xml += '</transaction>';

        var data = "moduleId=emp&requestId=1&requestXml=" + encodeURIComponent(xml) + "&targetId=iiTransaction";

        jQuery.post("/net/crothall/chimes/fin/emp/act/Provider.aspx", data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var approveEmployeePersonnelAction = function (id, houseCodeId, callback) {
        var xml = "";

        xml = '<transaction id="' + id + '">';
        xml += '<approveEmployeePersonnelAction';
        xml += ' id="' + id + '"';
        xml += ' houseCodeTitle="' + getTitleById(houseCodeId, cache.houseCodes) + '"';
        xml += '/>';
        xml += '</transaction>';

        var data = "moduleId=emp&requestId=1&requestXml=" + encodeURIComponent(xml) + "&targetId=iiTransaction";

        jQuery.post("/net/crothall/chimes/fin/emp/act/Provider.aspx", data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    var submitEmployeePersonnelAction = function (item, callback) {
        var reasonId = 0;
        var xml = "";

        if (item.ResignationType > 0)
            reasonId = item.ResignationType;
        else if (item.TerminationType > 0)
            reasonId = item.TerminationType;
        else if (item.LayoffType > 0)
            reasonId = item.LayoffType;

        xml = '<transaction id="' + item.Id + '">';
        xml += '<submitEmployeePersonnelAction';
        xml += ' id="' + item.Id + '"';
        xml += ' houseCodeTitle="' + getTitleById(item.HcmHouseCode, cache.houseCodes) + '"';
        xml += ' stateTitle="' + getTitleById(item.StateType, cache.stateTypes) + '"';
        xml += ' jobCodeTitle="' + getTitleById(item.PositionType, cache.jobCodes) + '"';
        xml += ' payGradeTitle="' + getPayGradeTitle(item.PayGrade) + '"';
        xml += ' bonusEligible="' + getTitleById(item.BonusEligibleType, cache.personActionTypes) + '"';
        xml += ' reasonForChange="' + getTitleById(reasonId, cache.personActionTypes) + '"';
        xml += ' infoStateTitle="' + getTitleById(item.InfoChangeStateType, cache.stateTypes) + '"';
        xml += ' relocationPlan="' + getTitleById(item.RelocationPlan, cache.personActionTypes) + '"';
        xml += ' newUnitTitle="' + getTitleById(item.HouseCodeTransfer, cache.houseCodes) + '"';
        xml += ' newBonusEligible="' + getTitleById(item.NewBonusEligibleType, cache.personActionTypes) + '"';
        xml += ' currentPositionType="' + getTitleById(item.CurrentPositionType, cache.jobCodes) + '"';
        xml += ' newPositionType="' + getTitleById(item.NewPositionType, cache.jobCodes) + '"';
        xml += ' changeReason="' + getTitleById(item.ChangeReasonType, cache.personActionTypes) + '"';
        xml += ' currentPayGradeTitle="' + getPayGradeTitle(item.CurrentPayGrade) + '"';
        xml += ' newPayGradeTitle="' + getPayGradeTitle(item.NewPayGrade) + '"';
        xml += ' trainingLocation="' + getTitleById(item.TrainingLocation, cache.houseCodes) + '"';
        xml += '/>';
        xml += '</transaction>';

        var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml) + '&targetId=iiTransaction';
        jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
            if (callback)
                callback(data, status);
        });
    };

    return {
        getEmployeePersonnelActions: getEmployeePersonnelActions,
        findEmployeePersonnelAction: findEmployeePersonnelAction,
        getCarAllowances: getCarAllowances,
		getAuthorizations: getAuthorizations,
        getHcmHouseCodes: getHcmHouseCodes,
        setCurrentHcmHouseCode: setCurrentHcmHouseCode,
        getHcmHouseCodeByBrief: getHcmHouseCodeByBrief,
        getStateTypes: getStateTypes,
        getEmployee: getEmployee,
        getPerson: getPerson,
        getEmpCompensation: getEmpCompensation,
        getManagerDetail: getManagerDetail,
        getPersonActionTypes: getPersonActionTypes,
        getJobCodes: getJobCodes,
        getPayGrades: getPayGrades,
        getWorkflowSteps: getWorkflowSteps,
        getWorkflowBrief: getWorkflowBrief,
        getReviewedWithHR: getReviewedWithHR,
        saveEmployeePersonnelAction: saveEmployeePersonnelAction,
        cancelEmployeePersonnelAction: cancelEmployeePersonnelAction,
        submitEmployeePersonnelAction: submitEmployeePersonnelAction,
        approveEmployeePersonnelAction: approveEmployeePersonnelAction,
        getPayGradeTitle: getPayGradeTitle,
        getTitleById: getTitleById,
        findEmployeePAFDocument: findEmployeePAFDocument,
        deleteEmployeePAFDocument: deleteEmployeePAFDocument,
        viewEmployeePAFDocument: viewEmployeePAFDocument,
        getAdministratorDetail: getAdministratorDetail
    }
}]);
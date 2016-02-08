var paf = angular.module('paf', ['ui.bootstrap', 'ngRoute']);

paf.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/edit/:id', {
        controller: 'pafCtrl',
        templateUrl: 'pafeditor.html'
    })
    .when('/new', {
        controller: 'pafCtrl',
        templateUrl: 'pafeditor.html'

    })
    .when('/list', {
        controller: 'pafListCtrl',
        templateUrl: 'paflist.html'

    })
    .otherwise({
        redirectTo: '/list'
    });
}]);

paf.controller('pafListCtrl', ['$scope', 'EmpActions', function ($scope, EmpActions) {

    var load = function () {
        $scope.viewLoading = true;
        EmpActions.getHcmHouseCodes(function (result) {

            $scope.HcmHouseCodes = result;
            EmpActions.getEmployeePersonnelActions(function (items) {
                $scope.empActions = items;

                $scope.viewLoading = false;
            });

        });
    }
    load();

    $scope.getHouseCodeDesc = function (item) {
        return EmpActions.getHouseCodeName(item.HcmHouseCode);
    }
    $scope.filter = {};

}]);

paf.controller('pafCtrl', ['$scope', '$document', 'EmpActions', '$filter', '$timeout', '$routeParams', '$modal', '$location', function ($scope, $document, EmpActions, $filter, $timeout, $routeParams, $modal, $location) {
    $scope.HcmHouseCodes = [];
    $scope.viewLoading = false;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.lkup = {
        CarAllowances: EmpActions.getCarAllowances(),
        BounsEligibles: null,
        PlanDetails: null,
        Reason4Changes: null,
        Layoffs: null,
        Terminations: null,
        Resignations: null
    }

    $scope.HcmHouseCodes = [];
    $scope.States = [];

    $scope.empAction = {
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
        Relocation: false
    }

    var lastEmployeeNumber = null;
    var loadCount = 0;
    var loadComplete = function () {
        $scope.viewLoading = !(loadCount == 0);
    }

    var preLoading = function () {
        $scope.viewLoading = true;

        loadCount++;
        EmpActions.getPersonActionTypes(function (result) {
            // $scope.$apply(function () {
            var filters = function (item) {
                return $filter('filter')(result, { typeName: item });
            }
            $scope.lkup.BounsEligibles = filters("BonusEligible");
            $scope.lkup.PlanDetails = filters("Plan");
            $scope.lkup.Reason4Changes = filters("Reason4Change");
            $scope.lkup.Layoffs = filters("Layoff");
            $scope.lkup.Terminations = filters("Termination");
            $scope.lkup.Resignations = filters("Resignation");
            // });
            loadCount--;
            loadComplete();
        });

        loadCount++;
        EmpActions.getStateTypes(function (result) {
            // $scope.$apply(function () {
            $scope.States = result;
            // });

            loadCount--;
            loadComplete();
        });

        loadCount++;
        EmpActions.getHcmHouseCodes(function (result) {
            // $scope.$apply(function () {
            $scope.HcmHouseCodes = result;
            // });

            loadCount--;
            loadComplete();
        });


        loadCount++;
        EmpActions.getJobCodes(function (result) {
            $scope.JobCodes = result;
            loadCount--;
            loadComplete();
        });

        loadCount++;
        EmpActions.getPayGrades(function (result) {
            $scope.PayGrades = result;
            loadCount--;
            loadComplete();
        });
    }

    preLoading();

    if ($routeParams.id) {
        var separationReasonItems = [];
        loadCount++;
        EmpActions.findEmployeePersonnelAction($routeParams.id, function (result) {
            if (!result) {
                $location.path('/list');
                return;
            }
            $scope.empAction = result;
            lastEmployeeNumber = result.EmployeeNumber;

            $scope.viewLoading = false;
            loadCount--;
            loadComplete();
        })
    }

    $scope.pickerCarAllowance = function (item) {
        $scope.empAction.CarAllowance = item.Id;
        $scope.empAction.NewCarAllowance = item.Id;
    }

    $scope.getPositionTypeName = function () {
        var positionType = $scope.empAction.PositionType;
        if (positionType != 0 && positionType != null) {
            return $filter('filter')($scope.JobCodes, function (item) {
                return item.id == positionType;
            })[0].name;
        }

        return null;
    }

    $scope.getPayGradeName = function () {
        var currentPayGrade = null;
        var payGrade = $scope.empAction.PayGrade;
        if (payGrade != 0 && payGrade != null) {
            var payGrade2 = $filter('filter')($scope.PayGrades, function (item) {
                return item.id == payGrade;
            })[0];

            currentPayGrade = payGrade2.min + ' - ' + payGrade2.mid + ' - ' + payGrade2.max;
        }
        else
            currentPayGrade = "";

        $scope.empAction.CurrentPayGrade = currentPayGrade;
    }

    $scope.calPayRange = function (payGrade, payRange) {
        var range = "";

        var salary = 0;

        if (payRange == "PayRange") {
            salary = parseFloat($scope.empAction.YearlySalary | 40 * 52 * $scope.empAction.AdminHourly | 40 * 52 * $scope.empAction.HourlyRate);
        }
        else
            salary = parseFloat($scope.empAction.NewSalary);

        var payGradeItem = $filter('filter')($scope.PayGrades, function (item) {
            return item.id == payGrade;
        });

        if (!angular.isDefined(payGradeItem)) {
            return;
        }

        payGradeItem = payGradeItem[0];

        if (!angular.isDefined(payGradeItem) || payGradeItem == null)
            return null;
        if ((!angular.isDefined(salary) || salary == null) || (payGrade == 0 || payGrade == null))
            range = null;

        var min = parseFloat(payGradeItem.min);
        var mid = parseFloat(payGradeItem.mid);
        var max = parseFloat(payGradeItem.max);

        if (salary < min)
            range = "Below Min";
        else if (salary == min)
            range = "Min";
        else if (salary > min && salary < mid)
            range = "Min to Mid";
        else if (salary == mid)
            range = "Mid";
        else if (salary > mid && salary < max)
            range = "Mid to Max";
        else if (salary == max)
            range = "Max";
        else if (salary > max)
            range = "Over Max";
        else
            range = "";

        $scope.empAction[payRange] = range;
    }

    //  var loadPersonInfoHandler = null;

    var _hcmHouseCode = null;
    $scope.disableInformationFields = false;
    $scope.getPersonInformation = function (employeeNumber) {

        if (employeeNumber && lastEmployeeNumber != employeeNumber) {
            lastEmployeeNumber = employeeNumber;
            //if (loadPersonInfoHandler)
            //    clearTimeout(loadPersonInfoHandler);

            //loadPersonInfoHandler = $timeout(function () {
            $scope.viewLoading = true;
            EmpActions.getEmployee(employeeNumber, 0, function (result) {
                $scope.viewLoading = false;
                if (result == null) {
                    alert("Employee Not Found.");
                }
                else {
                    var hcmHouseCode = EmpActions.getHcmHouseCodeByBrief(result.houseCode);
                    _hcmHouseCode = hcmHouseCode;

                    if ($scope.empAction.HcmHouseCode == null) {
                        $scope.empAction.HcmHouseCode = hcmHouseCode;
                    }
                    else if (hcmHouseCode != $scope.empAction.HcmHouseCode) {
                        alert("Employee Number is out of House Code.");
                        $scope.pafForm.EmployeeNumber.$setValidity("required", false);

                    }

                    // if ($scope.pafForm.EmployeeNumber.$valid) {
                    $scope.empAction.EmployeeId = result.id;
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
                        $scope.empAction.StateType = response.state;

                        $scope.disableInformationFields = true;
                    });
                    //  }
                    //;
                }
            });
            // }, 500);
        }
        else {
            lastEmployeeNumber = null;
            if ($scope.empAction.HcmHouseCode && lastEmployeeNumber == null)
                $scope.pafForm.HcmHouseCode.$setValidity("required", true);
            $scope.disableInformationFields = false;
        }
    }

    $scope.onHouseCodeChange = function () {
        if (lastEmployeeNumber != null) {

            if (_hcmHouseCode != $scope.empAction.HcmHouseCode) {
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
    }

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
        ['Promotion', 'Demotion', 'SalaryChange'],
        'Transfer', 'PersonalInfoChange', 'Relocation'
    ];

    var positionFields = {
        NewHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "Hours", "Amount", "YearlySalary", "AdminHourly", "HourlyRate", "PayGrade", "PayRange", "ReportingName", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        ReHire: ["HireDate", "PositionType", "Status", "PayStatus", "FullTimeHours", "TemporaryHours", "Hours", "Amount", "YearlySalary", "AdminHourly", "HourlyRate", "PayGrade", "PayRange", "ReportingName", "HcmHouseCodeTrainingLocation", "TrainingContact", "Duration", "CarAllowance", "BonusEligibleType"],
        Separation: ["SeparationDate", "VacationDaysDue", "PayNumberOfWeeks", "SeparationReason", "ResignationType", "TerminationType", "LayoffType", "SeparationReHire"],
        Loa: ["LoaDate", "DateOfReturn"],
        Requisition: ["RequisitionNumber", "EmailAddress"],
        Promotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "NewReportingName", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Demotion: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "NewReportingName", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        SalaryChange: ["OldPositionType", "NewPositionType", "EffectiveDate", "ChangeReasonType", "LastIncreaseDate", "LastIncreasePercentage", "CurrentSalary", "IncreaseAmount", "IncreasePercentage", "NewSalary", "CurrentPayGrade", "NewPayGrade", "NewPayRange", "NewReportingName", "NewCarAllowance", "NewBonusEligibleType", "Instructions"],
        Transfer: ["TransferEffectiveDate", "HouseCodeTransfer", "TransferReportingName"],
        PersonalInfoChange: ["InfoChangeEffectiveDate", "InfoChangeFirstName", "InfoChangeMiddleName", "InfoChangeLastName", "InfoChangeAddressLine1", "InfoChangeAddressLine2", "InfoChangePhone", "InfoChangeCity", "AppStateTypeInfoChange", "InfoChangePostalCode"],
        Relocation: ["RelocationApprovedBy", "RelocationPlan"]
    };

    var resetPositionTypeFields = function (positionType) {
        if (positionFields[positionType]) {
            angular.forEach(positionFields[positionType], function (item, index) {
                $scope.empAction[item] = null;
            });
        }
    }

    var initialEmpAction = function () {
        angular.forEach(positionFields, function (value, key) {
            resetPositionTypeFields(key);
        });
    }

    initialEmpAction();


    var uncheckPositionType = function (positionType) {
        if (!$scope.empAction[positionType])
            return;

        $scope.empAction[positionType] = false;
        resetPositionTypeFields(positionType);
    }

    $scope.onPositionTypeChanged = function (positionType) {
        $scope.empAction[positionType] = !$scope.empAction[positionType];

        if ($scope.empAction[positionType])

            $.each(postionTypeGroups, function (gi, group) {

                if (group.indexOf(positionType) >= 0) {

                    $.each(group, function (ii, item) {
                        if (item != positionType)
                            uncheckPositionType(item);
                    });
                }
            });
        else {
            resetPositionTypeFields(positionType);
        }

        if (!($scope.empAction.NewHire || $scope.empAction.ReHire || $scope.empAction.SalaryChange || $scope.empAction.Promotion || $scope.empAction.Transfer || $scope.empAction.Demotion))
            resetPositionTypeFields('Requisition');

        validateActionType();

        //if ($scope.empAction.SalaryChange || $scope.empAction.Promotion || $scope.empAction.Demotion) {
        //    $scope.getPayGradeName();
        //    //$scope.calPayRange(empAction.CurrentPayGrade, 'CurrentPayRange');
        //}
    }

    $scope.positionTypeChecked = function (positionType) {
        return $scope.empAction[positionType];
    }


    //status changes
    var Status = ["FullTimeHours", "TemporaryHours", "Hours", "Amount"];
    $scope.$watch('empAction.Status', function (newValue, oldValue) {
        angular.forEach(Status, function (item) {
            if (item != newValue) {
                $scope.empAction[item] = null;
            }
        });
    });

    //pay status changes
    var PayStatus = ["YearlySalary", "AdminHourly", "HourlyRate"];
    $scope.$watch('empAction.PayStatus', function (newValue, oldValue) {

        angular.forEach(PayStatus, function (item) {
            if (item != newValue) {
                $scope.empAction[item] = null;
            }
        });
    });

    //date of return after loa date
    $scope.$watch('empAction.LoaDate', function (newValue, oldValue) {
        var dateOfReturn = new Date($scope.empAction.DateOfReturn);

        if ((!angular.isDefined(newValue) || newValue == null) || (!angular.isDefined(dateOfReturn) || dateOfReturn == null))
            return;

        if (new Date(newValue).getTime() > dateOfReturn.getTime())
            $scope.empAction.DateOfReturn = null;

        validateLoa();
    });

    //date of return change
    $scope.$watch('empAction.DateOfReturn', function () {
        validateLoa();
    });

    //separation reason changes
    var SeparationReason = ["ResignationType", "TerminationType", "LayoffType"];
    $scope.$watch('empAction.SeparationReason', function (newValue, oldValue) {
        angular.forEach(SeparationReason, function (item) {
            if (item != newValue) {
                $scope.empAction[item] = null;
            }
        });

    });

    $scope.$watch('empAction.NewSalary', function (newValue, oldValue) {
        if (newValue != oldValue) {
            $scope.calPayRange($scope.empAction.NewPayGrade, "NewPayRange");
        }
    });

    $scope.onSalaryChange = function (type) {
        var currentSalary = $scope.empAction.CurrentSalary;
        var increaseAmt = $scope.empAction.IncreaseAmount;
        var increasePercentage = $scope.empAction.IncreasePercentage;

        if (increaseAmt == null || increaseAmt == "")
            increaseAmt = 0;
        else if (increasePercentage == null || increasePercentage == "")
            increasePercentage = 0;

        increaseAmt = parseFloat(increaseAmt);
        increasePercentage = parseFloat(increasePercentage);

        if (currentSalary) {
            currentSalary = parseFloat(currentSalary);
            if (type == 'amt')
                $scope.empAction.IncreasePercentage = (increaseAmt / currentSalary).toFixed(3);
            else if (type == 'percentage')
                $scope.empAction.IncreaseAmount = increasePercentage * currentSalary;
            else {
                $scope.empAction.IncreaseAmount = 0;
                $scope.empAction.IncreasePercentage = 0;
            }

            if (!$scope.empAction.Demotion)
                $scope.empAction.NewSalary = currentSalary + parseFloat($scope.empAction.IncreaseAmount);
            else
                $scope.empAction.NewSalary = currentSalary - parseFloat($scope.empAction.IncreaseAmount);
        }
    }

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
    }

    var validateLoa = function () {
        var isValid = false; 
        if ($scope.empAction.Loa) { 
            if ($scope.empAction.LoaDate || $scope.empAction.DateOfReturn) {
                isValid = true;
            }

            if (!isValid)
                $scope.pafForm.$setValidity('loa', false, $scope.pafForm);
            else
                $scope.pafForm.$setValidity('loa', true, $scope.pafForm);

        }
        else {
            isValid = true;
        }
        return isValid;
    }


    $scope.save = function () {
        validateActionType();
        validateLoa();

        if ($scope.pafForm.$valid) {

            EmpActions.saveEmployeePersonnelAction($scope.empAction, function (status) {
                document.location.hash = 'list';
            });
        }
    }


}]);

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
        template: '<p class="input-group"><input class="form-control input-sm" name="{{dtName}}" min-date="minDate" ng-change="dtChange()" ng-required="dtRequired" datepicker-popup="MM/dd/yyyy" pdf-datepicker-popup-config ng-model="dtModel" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
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

                if (value)
                    return $filter('date')(new Date(value), dateFormat);

                return null;
            });
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
                var transformedInput = inputValue.replace(/[^0-9+.]/g, '');
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
.directive('pafValidation', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            var type = angular.uppercase(attrs.pafValidation);

            switch (type) {
                case 'EMAIL':
                    var INTEGER_REGEXP = new RegExp('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', 'i');
                    ngModel.$parsers.unshift(function (viewValue) {
                        if (INTEGER_REGEXP.test(viewValue)) {
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
            var valid = typeof (value) == "string" && value.length >= 10 && value.length <= 14;
            ctrl.$setValidity(attr.name, valid);
            return value;
        },
        zipCode: function (ctrl, value, attr) {
            var valid = typeof (value) == "string" && value.length >= 5 && value.length <= 10;
            ctrl.$setValidity(attr.name, valid);
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

            scope.$watch(function () { return scope.model }, function (value) {
                if (angular.isDefined(value)) {
                    scope.TypeaheadModel = $filter('filter')(scope.source, function (item) {
                        return item[option.valueField] == scope.model;
                    })[0];

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



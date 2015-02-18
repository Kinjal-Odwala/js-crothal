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

paf.controller('pafListCtrl', ['$scope', 'PAF', function ($scope, PAF) {
    
    PAF.getPAFList(function (result) {
        $scope.$apply(function () { $scope.PAFItems = result; });
        
    });
  
}]);

paf.controller('pafCtrl', ['$scope', '$document', 'PAF', '$filter', '$timeout', '$routeParams', function ($scope, $document, PAF, $filter, $timeout, $routeParams) {
    $scope.HcmHouseCodes = [];

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.lkup = {
        CarAllowances: PAF.getCarAllowances(), BounsEligibles: null,
        PlanDetails: null,
        Reason4Changes: null,
        Layoffs: null,
        Terminations: null,
        Resignations: null
    }

    var lowercaseFirstLetter = function (input) {
        return (!!input) ? input.replace(/^(.)|(\s|\-)(.)/g, function ($1) {
            return $1.toLowerCase();
        }) : '';
    }
    $scope.HcmHouseCodes = [];
    $scope.States = [];

    $scope.pafItem = {
        FirstName: null,
        LastName: null,
        NewHire: false,
        ReHire: false,
        Separation: false,
        LOA: false,
        SalaryChange: false,
        Promotion: false,
        Demotion: false,
        Transfer: false,
        PersonalInfoChange: false,
        Relocation: false
    }

    PAF.getHcmHouseCodes(function (result) {
        $scope.HcmHouseCodes = result;
        if ($scope.pafItem.HcmHouseCode > 0 && $scope.HcmHouseCodes.length > 0) {
            $scope.HcmHouseCodeFilter = $filter('filter')($scope.HcmHouseCodes, { appUnit: $scope.pafItem.HcmHouseCode })[0];
        }
    });

    var loadPersonInfoHandler = null;
    $scope.getPersonInformation = function (employeeNumber, housecode) {
        if (!angular.isDefined(housecode)) {
            $scope.pafItem.HcmHouseCode = null;
        }

        if (angular.isDefined(employeeNumber) && angular.isDefined(housecode) && housecode.length > 0 && employeeNumber.length > 0) {

            if (loadPersonInfoHandler)
                clearTimeout(loadPersonInfoHandler);

            $timeout(function () {
                PAF.getEmployee(employeeNumber, housecode, function (result) {
                   
                    $scope.pafItem.FirstName = result.firstName;
                    $scope.pafItem.LastName = result.lastName;
                    $scope.pafItem.employeeId = result.id;
                    PAF.getPerson(result.id, function (response) {
                        $scope.pafItem.personId = response.id;
                        $scope.pafItem.AddressLine1 = response.addressLine1;
                        $scope.pafItem.City = response.city;
                        $scope.pafItem.Phone = response.homePhone;
                        $scope.pafItem.PostalCode = response.postalCode;
                       $scope.pafItem.StateType = response.state;
                        //$scope.pafItem = angular.extend({}, $scope.pafItem, {
                        //    AddressLine1: response.addressLine1,
                        //    City: response.city,
                        //    Phone: response.homePhone,
                        //    PostalCode: response.postalCode,
                        //    StateType: response.state

                        //});

                        if (response.state > 0) {
                            $scope.StateFilter = $filter('filter')($scope.States, { id: response.state })[0];
                        }
                        
                    });
                })
            }, 300);
        }
    }
    
    if ($routeParams.id) {
        PAF.findPAFInfo($routeParams.id, function (result) {

            if (result.StateType > 0 && $scope.States.length > 0) {
                $scope.StateFilter = $filter('filter')($scope.States, { id: result.state })[0];
            }
            if (result.HcmHouseCode > 0 && $scope.HcmHouseCodes.length > 0) {
                $scope.HcmHouseCodeFilter = $filter('filter')($scope.HcmHouseCodes, { appUnit: result.HcmHouseCode })[0];
            }
           
            $scope.$apply(function () { $scope.pafItem = result; });

        })
    }
   

    PAF.getPersonActionTypes(function (result) {
        $scope.lkup.BounsEligibles = $filter('filter')(result, { typeName: "BonusEligible" });
        $scope.lkup.PlanDetails = $filter('filter')(result, { typeName: "Plan" });
        $scope.lkup.Reason4Changes = $filter('filter')(result, { typeName: "Reason4Change" });
        $scope.lkup.Layoffs = $filter('filter')(result, { typeName: "Layoff" });
        $scope.lkup.Terminations = $filter('filter')(result, { typeName: "Termination" });
        $scope.lkup.Resignations = $filter('filter')(result, { typeName: "Resignation" });
    });


    $scope.States = [];

    PAF.getStateTypes(function (result) {
        $scope.States = result;
        if ($scope.pafItem.StateType > 0 && $scope.States.length > 0) {
            $scope.StateFilter = $filter('filter')($scope.States, { id: $scope.pafItem.StateType })[0];
        }
    });

    $scope.Duration = '';

    $scope.pickerCardAllowance = function (item) {
        $scope.CarAllowance = item.Id;
    }

    $scope.pickerHouseCode = function (item) {
        $scope.HcmHouseCode = item.name;
    }

    $scope.salaryChange = function (salary, adminHourly, hourly) {
        $scope.Salary = salary;
        $scope.AdminHourly = adminHourly;
        $scope.Hourly = hourly;
    }

    $scope.getHouseCode = function ($model, type) {

        if ($scope.HcmHouseCodes.length == 0 || !angular.isDefined($model)) {
            $scope.pafItem.HcmHouseCode = null;
            return;
        }
       
        $scope.pafItem.HcmHouseCode = $model.id;
        $scope.pafItem.HcmHouseCodeTransfer = $model.id;

        return $model.name;
    }

    $scope.getState = function ($model) {
        if ($scope.States.length == 0 || !angular.isDefined($model)) {
            $scope.pafItem.StateType = null;
            return;
        }

        $scope.pafItem.StateType = $model.id;

        return $model.name;
    }

    $scope.save = function (isValid) {
        if (isValid) {
            var xml = ['<transaction id="1">\r\n<employeePersonnelAction '];

            var xmlItem = [];
            angular.forEach($scope.pafItem, function (value, key) {
                key = lowercaseFirstLetter(key);

                if (value == null || !angular.isDefined(value))
                    value = ""
                else if (value == true)
                    value = "1";
                else if (value == false)
                    value = "0";
                else if (angular.isDate(value)) {
                    value = $filter('date')(value, "MM/dd/yyyy");
                }


                xmlItem.push(key + '=' + '"' + value + '"');
            });

            xml.push(xmlItem.join(' '));

            xml.push('/>\r\n</transaction>');

            var data = 'moduleId=emp&requestId=1&requestXml=' + encodeURIComponent(xml.join(' ')) + '&&targetId=iiTransaction';
            jQuery.post('/net/crothall/chimes/fin/emp/act/Provider.aspx', data, function (data, status) {
                document.location.hash = 'list';
            });

        }
    }

}]);

paf.directive('pafDatepicker', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
        scope: {
            dtOption: '=',
            dtModel: '=dtModel'
        },
        restrict: 'E',
        require: '?ngModel',
        template: '<p class="input-group"><input type="text" class="form-control input-sm" name="{{dtName}}" ng-required="dtRequired" datepicker-popup="{{dtPopup}}" ng-model="dtModel" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
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
});

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
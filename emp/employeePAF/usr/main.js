var paf = angular.module('paf', ['ui.bootstrap']);

paf.controller('pafCtrl', ['$scope', '$document', 'PAF', function ($scope, $document, PAF) {

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.pafItem = {
        BounsEligibles: PAF.getBounsEligible(),
        PlanDetails: PAF.getPlanDetails(),
        Reason4Changes: PAF.getReasonForChange(),
        Layoffs: PAF.getLayoff(),
        Terminations: PAF.getTermination(),
        Resignations: PAF.getResignation(),
        CarAllowances: PAF.getCarAllowances()
    }

    $scope.Duration = '';

    $scope.pickerCardAllowance = function (item)
    {
        $scope.CarAllowance = item.Id;
    }

    $scope.salaryChange = function (salary,adminHourly,hourly) {
        $scope.Salary = salary;
        $scope.AdminHourly = adminHourly;
        $scope.Hourly = hourly;
    }

}]);

paf.factory('PAF', function () {
    var BounsEligibles = [
        { Id: '1', Description: 'Supervisor' },
        { Id: '2', Description: 'Assistant Director' },
        { Id: '3', Description: 'Unit Director' },
        { Id: '4', Description: 'Res Reg Manager' },
        { Id: '5', Description: 'Regional Manager' },
        { Id: '6', Description: 'Regional Vice President' }
    ];

    var PlanDetails = [
    { Id: '1', Description: 'Plan A NH' },
    { Id: '2', Description: 'Plan A Existing' },
    { Id: '3', Description: 'Plan B NH' },
    { Id: '4', Description: 'Plan B Existing' },
    { Id: '5', Description: 'Plan C' }
    ];

    var Reason4Changes = [
        { Id: '1', Description: 'Merit' },
        { Id: '2', Description: 'Annual' },
        { Id: '3', Description: 'Promotion' },
        { Id: '4', Description: 'Demotion' },
        { Id: '5', Description: 'Hourly Promotion' },
        { Id: '6', Description: 'Increase in Resposibilities' },
        { Id: '7', Description: 'Decrease in Responsibilities' },
        { Id: '8', Description: 'Other' }
    ];

    var Layoff = [
        { Id: '1', Code: '7600', Description: 'Reduction in force' },
        { Id: '2', Code: '7610', Description: 'End of temporary employment' },
        { Id: '3', Code: '7620', Description: 'Job eliminated' },
        { Id: '4', Code: '7640', Description: 'Account closed' },
        { Id: '5', Code: '7660', Description: 'Client requested removal' }
    ]

    var Temination = [
        { Id: '1', Code: '3100', Description: 'Reported under influence alcohol' },
        { Id: '2', Code: '3700', Description: 'Tardiness-frequent' },
        { Id: '3', Code: '3900', Description: 'Leaving work station' },
        { Id: '4', Code: '4000', Description: 'Absenteeism-excessive absence' },
        { Id: '5', Code: '4100', Description: 'Absenteeism-unreported' },
        { Id: '6', Code: '4300', Description: 'Fighting on company property' },
        { Id: '7', Code: '4400', Description: 'Quantity of work' },
        { Id: '8', Code: '4600', Description: 'Destruction of co. property' },
        { Id: '9', Code: '4800', Description: 'Violation of co. rules/policies' },
        { Id: '10', Code: '4860', Description: 'Reported under influence drugs' },
        { Id: '11', Code: '4900', Description: 'Insubordination' },
        { Id: '12', Code: '5110', Description: 'Misconduct' },
        { Id: '13', Code: '5120', Description: 'Quality of work' },
        { Id: '14', Code: '5400', Description: 'Violation of safety rules' },
        { Id: '15', Code: '5500', Description: 'Dishonesty-monetary theft' },
        { Id: '16', Code: '5800', Description: 'Falsification of records' },
        { Id: '17', Code: '9700', Description: 'Probationary-not qualified for job' }];

    var Resignation = [
        { Id: '1', Code: '0100', Description: 'Abandoned job' },
        { Id: '2', Code: '0300', Description: 'Reason unknow' },
        { Id: '3', Code: '0400', Description: 'In lieu of discharge' },
        { Id: '4', Code: '0800', Description: 'Did not return from leave' },
        { Id: '5', Code: '1000', Description: 'Retirement' },
        { Id: '6', Code: '1400', Description: 'Accept another job' },
        { Id: '7', Code: '1410', Description: 'Go into own business' },
        { Id: '8', Code: '1420', Description: 'Military' },
        { Id: '9', Code: '1500', Description: 'Relocate' },
        { Id: '10', Code: '1600', Description: 'Personal-not job related' },
        { Id: '11', Code: '1610', Description: 'Marriage' },
        { Id: '12', Code: '1620', Description: 'Family obligations' },
        { Id: '13', Code: '1700', Description: 'Transportation' },
        { Id: '14', Code: '1900', Description: 'Illness' },
        { Id: '15', Code: '2000', Description: 'Maternity' },
        { Id: '16', Code: '2110', Description: 'Dissatisfaction-work hours' },
        { Id: '17', Code: '2120', Description: 'Dissatisfaction-salary' },
        { Id: '18', Code: '2130', Description: 'Dissatisfaction-working conditions' },
        { Id: '19', Code: '2140', Description: 'Dissatisfaction-performance review' },
        { Id: '20', Code: '2170', Description: 'Dissatisfaction-company policies' },
        { Id: '21', Code: '2190', Description: 'Dissatisfaction-supervisor' },
        { Id: '22', Code: '2200', Description: 'Wallked off job' },
        { Id: '23', Code: '2500', Description: 'School' },
        { Id: '24', Code: '8500', Description: 'Death' }];

    var CarAllowances = [
        { Id: '425', Description: '425/month' },
        { Id: '500', Description: '500/month' },
        { Id: '600', Description: '600/month' },
        { Id: '900', Description: '900/month' }];

    var getCarAllowances = function () {
        return CarAllowances;
    }

    var getResignation = function () {
        return Resignation;
    }

    var getTermination = function () {
        return Temination;
    }

    var getLayoff = function () {
        return Layoff;
    }

    var getBounsEligible = function () {
        return BounsEligibles;
    }

    var getPlanDetails = function () {
        return PlanDetails;
    }

    var getReasonForChange = function () {
        return Reason4Changes;
    }

    return {
        getCarAllowances: getCarAllowances,
        getResignation: getResignation,
        getTermination: getTermination,
        getLayoff: getLayoff,
        getBounsEligible: getBounsEligible,
        getPlanDetails: getPlanDetails,
        getReasonForChange: getReasonForChange
    }
});

paf.directive('pafDatepicker', ['$timeout', '$filter', function ($timeout, $filter) {
    return {
        scope: {
            dtOption: '='
        },
        restrict: 'E',
        require: '?ngModel',
        template: '<p class="input-group"><input type="text" class="form-control input-sm" datepicker-popup="{{dtPopup}}" ng-model="dt" is-open="opened"  show-button-bar="{{showButtonBar}}" datepicker-append-to-body="false" datepicker-options="dateOptions" date-disabled="disabled(date, mode)"  close-text="Close" /><span class="input-group-btn"><button type="button" class="btn btn-default btn-sm" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></p>',
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
});
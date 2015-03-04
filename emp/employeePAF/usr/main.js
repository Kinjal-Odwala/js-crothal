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

paf.controller('pafCtrl', ['$scope', '$document', 'PAF', '$filter', '$timeout', '$routeParams', '$modal', function ($scope, $document, PAF, $filter, $timeout, $routeParams, $modal) {
    $scope.HcmHouseCodes = [];

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
    };

    $scope.lkup = {
        CarAllowances: PAF.getCarAllowances(),
        BounsEligibles: null,
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
        //if ($scope.pafItem.HcmHouseCode > 0 && $scope.HcmHouseCodes.length > 0) {
        //    $scope.HcmHouseCodeFilter = $filter('filter')($scope.HcmHouseCodes, { appUnit: $scope.pafItem.HcmHouseCode })[0];
        //}

    });

    var loadPersonInfoHandler = null;
    $scope.getPersonInformation = function (employeeNumber, housecode) {
        if (!angular.isDefined(housecode) || housecode == null) {
            $scope.pafItem.HcmHouseCode = null;
            return;
        }

        if (angular.isDefined(employeeNumber) && angular.isDefined(housecode) && housecode.length > 0 && employeeNumber.length > 0) {

            if (loadPersonInfoHandler)
                clearTimeout(loadPersonInfoHandler);

            $timeout(function () {
                PAF.getEmployee(employeeNumber, housecode, function (result) {
                    if (result == null) {
                        alert("Employee Not Found.");
                    }
                    else {
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
                        });
                    }
                })
            }, 300);
        }
    }

    if ($routeParams.id) {
        PAF.findPAFInfo($routeParams.id, function (result) {

            //if (result.HcmHouseCode > 0 && $scope.HcmHouseCodes.length > 0) {
            //    $scope.HcmHouseCodeFilter = $filter('filter')($scope.HcmHouseCodes, { appUnit: result.HcmHouseCode })[0];
            //}
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

    PAF.getStateTypes(function (result) {
        $scope.States = result;
    });

    $scope.pickerCarAllowance = function (item) {
        $scope.pafItem.CarAllowance = item.Id;
        $scope.pafItem.NewCarAllowance = item.Id;
    }

    $scope.pickerHouseCode = function (item) {
        $scope.HcmHouseCode = item.name;
    }

    $scope.salaryChange = function (salary, adminHourly, hourly) {
        $scope.Salary = salary;
        $scope.AdminHourly = adminHourly;
        $scope.Hourly = hourly;
    }

    //$scope.getHouseCode = function ($model, type) {

    //    if ($scope.HcmHouseCodes.length == 0 || !angular.isDefined($model)) {
    //        $scope.pafItem.HcmHouseCode = null;
    //        return;
    //    }

    //    $scope.pafItem.HcmHouseCode = $model.id;
    //    $scope.pafItem.HcmHouseCodeTransfer = $model.id;
    //    $scope.pafItem.HcmHouseCodeTrainingLocation = $model.id;

    //    return $model.name;
    //}

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
            var valid = ctrl.$isEmpty(value) || (value.length >= 10 && value.length <= 14);
            ctrl.$setValidity(attr.name, valid);
            return value;
        },
        zipCode: function (ctrl, value, attr) {
            var valid = ctrl.$isEmpty(value) || (value.length >= 5 && value.length <= 9);
            ctrl.$setValidity(attr.name, valid);
            return value;
        },
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
        zipcodeMask6D = new StringMask('00000-0000');

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
            onBlur: '&'
        },
        template: '<div><input ng-model="model" name="{{inputName}}" class="hide"/><input type="text" class="form-control input-sm" ng-model="TypeaheadModel" typeahead-input-formatter="inputFormatter($model)" typeahead="item as item[displayField] for item in source|filter:itemFilter($viewValue)| limitTo:10" ng-blur="onBlur()" /></div>',
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
                    return item[scope.displayField].indexOf(value) >= 0;
                }
            }

            scope.$watch(function () { return scope.model }, function (value) {

                if (angular.isDefined(value)) {
                    scope.TypeaheadModel = $filter('filter')(scope.source, function (item) {
                        return item[option.valueField] == scope.model;
                    })[0];

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



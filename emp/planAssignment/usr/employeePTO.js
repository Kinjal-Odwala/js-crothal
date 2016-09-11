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
    $scope.state = 'State';
    $scope.selectedState = null;
    $scope.plans = [];
    $scope.statePlans = [];
    $scope.countyPlans = [];
    $scope.countys = [];
    $scope.countyTypes = [];
    $scope.cityPlans = [];
    $scope.cities = [];
    $scope.cityTypes = [];

    EmpActions.getPtoYears(function (result) {
        $scope.PtoYears = result;
        if (angular.isDefined(result)) {
            $scope.ptoYear = result[0].id;
        }
    });

    EmpActions.getStateTypes(function (result) {
        $scope.states = result;
    });

    $scope.search = function () {
        EmpActions.getPtoPlans($scope.ptoYear, function (result) {
            $scope.plans = result;
        });
        EmpActions.getPtoTypes(function (result) {
        });
        EmpActions.getPtoPlanTypes(function (result) {
        });
    };

    $scope.getPtoTypeName = function (ptoTypeId) {
        return EmpActions.getPtoTypeName(ptoTypeId);
    };

    $scope.getPtoPlanTypeName = function (ptoPlanTypeId) {
        return EmpActions.getPtoPlanTypeName(ptoPlanTypeId);
    };

    $scope.stateSelected = function (item) {
        $scope.selectedState = item;
        $scope.state = item.name;
        EmpActions.getCountyTypes(item.id, function (result) {
            $scope.countyTypes = result;
            $scope.countys = [];
            angular.forEach($scope.countyTypes, function (countyType, index) {
                var item = {};
                item["id"] = countyType.id;
                item["name"] = countyType.name;
                item["countyPlans"] = [];
                $scope.countys.push(item);
            });
        });
        EmpActions.getCityTypes(item.id, function (result) {
            $scope.cityTypes = result;
            $scope.cities = [];
            angular.forEach($scope.cityTypes, function (cityType, index) {
                var item = {};
                item["id"] = cityType.id;
                item["name"] = cityType.name;
                item["cityPlans"] = [];
                $scope.cities.push(item);
            });
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

    $scope.statePlanSelected = function (item) {
        $scope.selectedStatePlan = item;
    };

    $scope.addSelectedStatePlan = function () {
        $scope.statePlans.push($scope.selectedStatePlan);
    }

    $scope.addSelectedCountyPlan = function () {
        angular.forEach($scope.countys, function (county, index) {
            if (county.id == $scope.selectedCounty.id) {
                var item = {};
                item["countyId"] = $scope.selectedCounty.id;
                item["id"] = $scope.selectedCountyPlan.id;
                item["title"] = $scope.selectedCountyPlan.title;
                item["ptoType"] = $scope.selectedCountyPlan.ptoType;
                item["ptoPlanType"] = $scope.selectedCountyPlan.ptoPlanType;
                county.countyPlans.push(item);
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

    $scope.statePlanSelected = function (item) {
        $scope.selectedStatePlan = item;
    }

    $scope.addSelectedCityPlan = function () {
        angular.forEach($scope.cities, function (city, index) {
            if (city.id == $scope.selectedCity.id) {
                var item = {};
                item["cityId"] = $scope.selectedCity.id;
                item["id"] = $scope.selectedCityPlan.id;
                item["title"] = $scope.selectedCityPlan.title;
                item["ptoType"] = $scope.selectedCityPlan.ptoType;
                item["ptoPlanType"] = $scope.selectedCityPlan.ptoPlanType;
                city.cityPlans.push(item);
            }
        });
    }

    $scope.removeStatePlan = function () {
        var newStatePlans = []
        angular.forEach($scope.statePlans, function (statePlan, index) {
            if (statePlan.id != $scope.selectedStatePlan.id) {
                newStatePlans.push(statePlan);
            }
        });
        $scope.statePlans = [];
        angular.forEach(newStatePlans, function (newStatePlan, index) {
            if (newStatePlan.id != $scope.selectedStatePlan.id) {
                $scope.statePlans.push(newStatePlan);
            }
        });
    };

    $scope.countyPlanSelected = function (countyPlan) {
        $scope.selectedCountyPlan = countyPlan;
    };

    $scope.removeCountyPlan = function () {
        angular.forEach($scope.countys, function (county, index) {
            if (county.id == $scope.selectedCountyPlan.countyId) {
                var newCountyPlans = [];
                angular.forEach(county.countyPlans, function (countyPlan, index) {
                    if (countyPlan.id != $scope.selectedCountyPlan.id) {
                        newCountyPlans.push(countyPlan);
                    }
                });
                county.countyPlans = [];
                angular.forEach(newCountyPlans, function (newCountyPlan, index) {
                    county.countyPlans.push(newCountyPlan);
                });
            }
        });
    };

    $scope.cityPlanSelected = function (cityPlan) {
        $scope.selectedCityPlan = cityPlan;
    };

    $scope.removeCityPlan = function () {
        angular.forEach($scope.cities, function (city, index) {
            if (city.id == $scope.selectedCityPlan.cityId) {
                var newCityPlans = [];
                angular.forEach(city.cityPlans, function (cityPlan, index) {
                    if (cityPlan.id != $scope.selectedCityPlan.id) {
                        newCityPlans.push(cityPlan);
                    }
                });
                city.cityPlans = [];
                angular.forEach(newCityPlans, function (newCityPlan, index) {
                    city.cityPlans.push(newCityPlan);
                });
            }
        });
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

pto.factory('EmpActions', ["$http", "$filter", '$rootScope', function ($http, $filter, $rootScope) {
    
    var cache = {};
    var stateTypes = null;
    var countyTypes = null;
    var cityTypes = null;
    var ptoPlans = null;
    var ptoTypes = null;
    var ptoPlanTypes = null;

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

    var getCountyTypes = function (stateId, callback) {

        if (cache.countyTypes) {
            callback(cache.countyTypes);
            return;
        }
        apiRequest('app', 'iiCache', '<criteria>storeId:appStateMinimumWages,userId:[user]'
           + ',stateType:' + stateId
           + ',groupType:' + 2
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.countyTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.countyTypes);
               }
        });
    };

    var getCityTypes = function (stateId, callback) {

        if (cache.cityTypes) {
            callback(cache.cityTypes);
            return;
        }
        apiRequest('app', 'iiCache', '<criteria>storeId:appStateMinimumWages,userId:[user]'
           + ',stateType:' + stateId
           + ',groupType:' + 3
           + ',</criteria>', function (xml) {
               if (callback) {
                   cache.cityTypes = deserializeXml(xml, 'item', { upperFirstLetter: false, intItems: ['id'] });
                   callback(cache.cityTypes);
               }
           });
    };

    var getPtoPlans = function (ptoYearId, callback) {

        if (cache.ptoPlans) {
            callback(cache.ptoPlans);
            return;
        }
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

    var getPtoTypeName = function (ptoTypeId) {
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

    var getPtoPlanTypeName = function (ptoPlanTypeId) {
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

    return {
        getPtoYears: getPtoYears,
        getStateTypes: getStateTypes,
        getCountyTypes: getCountyTypes,
        getCityTypes: getCityTypes,
        getPtoPlans: getPtoPlans,
        getPtoTypes: getPtoTypes,
        getPtoTypeName: getPtoTypeName,
        getPtoPlanTypes: getPtoPlanTypes,
        getPtoPlanTypeName: getPtoPlanTypeName
    }
}]);


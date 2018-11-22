var app = angular.module('snapshotApp', ['ui.bootstrap']);

app.controller('AccountSearchCtrl', function($scope, $http) {
    $scope.selectedAccount = null;
    $scope.accounts = [];

    $scope.onSelect = function($item, $model, $label) {
        $scope.selectedAccount = $item;
        fin.snapshotUi.selectAccount($item.id);
    };
});

app.controller('CostCenterSearchCtrl', function($scope, $http) {
    $scope.selectedCostCenter = null;
    $scope.houseCodes = [];

    $scope.onSelect = function($item, $model, $label) {
        $scope.selectedCostCenter = $item;
        fin.snapshotUi.selectCostCenter($item.id);
    };
});
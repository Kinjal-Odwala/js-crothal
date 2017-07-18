angular.module('glAccountApp', ['ui.bootstrap']);
var app = angular.module('glAccountApp').controller('SearchCtrl', function($scope, $http) {
	$scope.selected = undefined;
	$scope.accounts = [];

	$scope.onSelect = function($item, $model, $label) {
	  	$scope.selected = $item;
		fin.fsc.fscAccountUi.selectAccount($item.id);
	};
});
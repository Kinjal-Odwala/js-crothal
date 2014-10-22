angular.module('reportApp', ['ui.bootstrap']);
var app = angular.module('reportApp').controller('SearchCtrl', function($scope, $http) {
	$scope.selected = undefined;
	$scope.nodes = [];

	$scope.onSelect = function($item, $model, $label) {
	  	$scope.selected = $item;
		fin.reportUi.selectNode($item.id, $item.hirLevel, $item.title, $item.fullPath);
	};
});
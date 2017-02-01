describe('Employee PTO', function() {

    var scope, myCtrl;

    beforeEach(module('pto'));

    beforeEach(inject(function($controller, $rootScope){
        scope = $rootScope;
        myCtrl = $controller('planAssignmentCtrl', {$scope: scope});
    }));

	it('It should define the function onLevelChange()', function() {
		expect(scope.onLevelChange).toBeDefined();
    });

	it('It should define the function search()', function() {
		expect(scope.search).toBeDefined();
	});

	it('It should define the function companyPlanSelected()', function () {
	    expect(scope.companyPlanSelected).toBeDefined();
	});

	it('It should define the function stateSelected()', function () {
	    expect(scope.stateSelected).toBeDefined();
	});

	it('It should define the function getCompanyPlanAssignments()', function () {
	    expect(scope.getCompanyPlanAssignments).toBeDefined();
	});

	it('It should define the function getStatePlanAssignments()', function () {
	    expect(scope.getStatePlanAssignments).toBeDefined();
	});

	it('It should define the function getCountyPlanAssignments()', function () {
	    expect(scope.getCountyPlanAssignments).toBeDefined();
	});

	it('It should define the function getCityPlanAssignments()', function () {
	    expect(scope.getCityPlanAssignments).toBeDefined();
	});

	it('It should define the function getHouseCodePlanAssignments()', function () {
	    expect(scope.getHouseCodePlanAssignments).toBeDefined();
	});

	it('It should define the function cloneSelectedPlan()', function () {
	    expect(scope.cloneSelectedPlan).toBeDefined();
	});

	it('It should define the function onYearChange()', function () {
	    expect(scope.onYearChange).toBeDefined();
	});

	it('It should define the function setStateGridHeight()', function () {
	    expect(scope.setStateGridHeight).toBeDefined();
	});

	it('It should define the function setHeight()', function () {
	    expect(scope.setHeight).toBeDefined();
	});

	it('It should define the function addPlan()', function () {
	    expect(scope.addPlan).toBeDefined();
	});

	it('It should define the function validatePlan()', function () {
	    expect(scope.validatePlan).toBeDefined();
	});

	it('It should define the function addSelectedPlan()', function () {
	    expect(scope.addSelectedPlan).toBeDefined();
	});

	it('It should define the function saveCompanyPlans()', function () {
	    expect(scope.saveCompanyPlans).toBeDefined();
	});

	it('It should define the function saveStatePlans()', function () {
	    expect(scope.saveStatePlans).toBeDefined();
	});

	it('It should define the function saveCountyPlans()', function () {
	    expect(scope.saveCountyPlans).toBeDefined();
	});

	it('It should define the function saveCityPlans()', function () {
	    expect(scope.saveCityPlans).toBeDefined();
	});

	it('It should define the function saveHouseCodePlans()', function () {
	    expect(scope.saveHouseCodePlans).toBeDefined();
	});

	it('It should define the function removeCompanyPlan()', function () {
	    expect(scope.removeCompanyPlan).toBeDefined();
	});

	it('It should define the function removeStatePlan()', function () {
	    expect(scope.removeStatePlan).toBeDefined();
	});

	it('It should define the function removeCountyPlan()', function () {
	    expect(scope.removeCountyPlan).toBeDefined();
	});

	it('It should define the function removeCityPlan()', function () {
	    expect(scope.removeCityPlan).toBeDefined();
	});

	it('It should define the function removeHouseCodePlan()', function () {
	    expect(scope.removeHouseCodePlan).toBeDefined();
	});

	it('It should define the function clonePlan()', function () {
	    expect(scope.clonePlan).toBeDefined();
	});

	it('It should define the function cloneSelectedPlan()', function () {
	    expect(scope.cloneSelectedPlan).toBeDefined();
	});

	it('It should define the function planSelected()', function () {
	    expect(scope.planSelected).toBeDefined();
	});

	it('It should define the function countySelected()', function () {
	    expect(scope.countySelected).toBeDefined();
	});

	it('It should define the function citySelected()', function () {
	    expect(scope.citySelected).toBeDefined();
	});

	it('It should define the function houseCodeSelected()', function () {
	    expect(scope.houseCodeSelected).toBeDefined();
	});

	it('It should define the function statePlanSelected()', function () {
	    expect(scope.countySelected).toBeDefined();
	});

	it('It should define the function countyPlanSelected()', function () {
	    expect(scope.countySelected).toBeDefined();
	});

	it('It should define the function cityPlanSelected()', function () {
	    expect(scope.countySelected).toBeDefined();
	});

	it('It should define the function houseCodePlanSelected()', function () {
	    expect(scope.countySelected).toBeDefined();
	});

	it('It should define the function onCompanyPlanChanged()', function () {
	    expect(scope.onCompanyPlanChanged).toBeDefined();
	});

	it('It should define the function onStatePlanChanged()', function () {
	    expect(scope.onStatePlanChanged).toBeDefined();
	});

	it('It should define the function onCountyPlanChanged()', function () {
	    expect(scope.onCountyPlanChanged).toBeDefined();
	});

	it('It should define the function onCityPlanChanged()', function () {
	    expect(scope.onCityPlanChanged).toBeDefined();
	});

	it('It should define the function onHouseCodePlanChanged()', function () {
	    expect(scope.onHouseCodePlanChanged).toBeDefined();
	});

	it('It should define the function filterCountyPlans()', function () {
	    expect(scope.filterCountyPlans).toBeDefined();
	});

	it('It should define the function filterCityPlans()', function () {
	    expect(scope.filterCityPlans).toBeDefined();
	});

	it('It should define the function filterHouseCodePlans()', function () {
	    expect(scope.filterHouseCodePlans).toBeDefined();
	});

	it('It should define the function expandCountyAll()', function () {
	    expect(scope.expandCountyAll).toBeDefined();
	});

	it('It should define the function expandCityAll()', function () {
	    expect(scope.expandCityAll).toBeDefined();
	});

	it('It should define the function expandHouseCodeAll()', function () {
	    expect(scope.expandHouseCodeAll).toBeDefined();
	});

	it('It should define the function sortCountyBy()', function () {
	    expect(scope.sortCountyBy).toBeDefined();
	});

	it('It should define the function sortCityBy()', function () {
	    expect(scope.sortCityBy).toBeDefined();
	});

	it('It should define the function sortHouseCodeBy()', function () {
	    expect(scope.sortHouseCodeBy).toBeDefined();
	});

});
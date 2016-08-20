describe('Employee PAF', function() {

    var scope, myCtrl;

    beforeEach(module('paf'));

    beforeEach(inject(function($controller, $rootScope){
        scope = $rootScope;
        myCtrl = $controller('pafCtrl', {$scope: scope});
    }));

	it('It should define the function getManagerInfo()', function() {
		expect(scope.getManagerInfo).toBeDefined();
    });

	it('It should define the function isManagerFieldRequired()', function() {
		expect(scope.isManagerFieldRequired).toBeDefined();
    });

	it('It should check the manager field required or not', function() {
		var item = {};
		item.ReportingName = "";
		item.ReportingEmail = "";
		item.ReportingTitle = "";
		expect(scope.isManagerFieldRequired(item)).toBe(true);
		
		item.ReportingName = "Chandru";
		item.ReportingEmail = "aa@aa.com";
		item.ReportingTitle = "TM";
		expect(scope.isManagerFieldRequired(item)).toBe(false);
    });

});
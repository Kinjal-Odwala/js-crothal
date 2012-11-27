ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.bud.employee.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);

ii.Class({
    Name: "fin.bud.employee.UserInterface",
    Definition: {
	
		init: function(){
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hcmHouseCode = 0;
			me.fscYear = 0;
			
			var queryStringArgs = {}; 
			var queryString = location.search.substring(1); 
			var pairs = queryString.split("&"); 
			for(var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			me.hcmHouseCode = queryStringArgs["houseCode"];
			me.fscYear = queryStringArgs["fiscalYearId"];
			me.fiscalYearText = queryStringArgs["fiscalYearText"];

			if (me.hcmHouseCode == undefined) {
				me.hcmHouseCode = 0;
				me.fscYear = 0;
			}
			
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			
			me.authorizer = new ii.ajax.Authorizer(me.gateway); //@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\employee";
			me.authorizer.authorize([me.authorizePath], 
			function authorizationsLoaded(){
				me.authorizationProcess.apply(me);
			}, me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			
			if (me.hcmHouseCode > 0) {
				me.employeeLockStore.fetch("hcmHouseCode:" + me.hcmHouseCode + ",fscYear:" + me.fscYear + ",userId:[user]", me.employeeLocksLoaded, me);
			}
		},
		
		authorizationProcess: function fin_bud_employee_UserInterface_authorizationProcess(){
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_employee_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function(){
			var args = ii.args(arguments, {});
			var me = this;
			
			fin.employeeUI.employeeData.setHeight($(window).height() - 90);
		},
		
		defineFormControls: function(){
			var me = this;
			
			
			me.employeeNumber = new ui.ctl.Input.Text({
				id: "EmployeeNumber",
				required: false
			});
			me.averageWageRate = new ui.ctl.Input.Text({
				id: "AverageWageRate",
				maxLength: 64
			});
			me.wageRateExcludingDifferential = new ui.ctl.Input.Text({
				id: "WageRateExcludingDifferential",
				maxLength: 64
			});
			
			me.employeeData = new ui.ctl.Grid({
				id: "EmployeeData",
				appendToId: "divForm",
				allowAdds: false
			});
			me.employeeData.addColumn("employeeName", "employeeName", "Employee", "Employee", 160);
			me.employeeData.addColumn("yearsOfService", "yearsOfService", " Service", "Years Of Service", 70);
			me.employeeData.addColumn("vacationDays", "vacationDays", "Vacation", "Vacation Earned (Days)", 80);
			me.employeeData.addColumn("dueIncrease", "dueIncrease", "Increases", "Employees Due Increases", 80);
			me.employeeData.addColumn("payRate", "payRate", "Rate", "Base Wage Rate ($/hr)", 70);
			me.employeeData.addColumn("differentialPayRate", "differentialPayRate", "Differential", "Shift Differential ($/hr)", 110);
			me.employeeData.addColumn("otherPayRate", "otherPayRate", "Other", "Other ($/hr)", 70);
			me.employeeData.addColumn("scheduledHours", "scheduledHours", "Total", "Total Current Wage rate per hr", 60);
			me.employeeData.addColumn("totalWageRate", "totalWageRate", "Hours", "Hours Worked Per Pay Period", 70);
			me.employeeData.addColumn("costPerPayPeriod", "costPerPayPeriod", "Period", "Cost Per Pay Period", 70);
			me.employeeData.addColumn("costBeforeDifferential", "costBeforeDifferential", "Before", "Cost Before Differential", 80);
			me.employeeData.addColumn("annual", "annual", "Annual", "Annual", null);
			me.employeeData.capColumns();
			//me.employeeData.setHeight($(me.employeeData.element).parent().height() - 2);
			
			$("#pageLoading").hide();
		},
		
		
		configureCommunications: function(){
			
			var args = ii.args(arguments, {});
			var me = this;
			
			me.employeeLocks = [];
			me.employeeLockStore = me.cache.register({
				storeId: "budEmployeeLocks",
				itemConstructor: fin.bud.employee.EmployeeLock,
				itemConstructorArgs: fin.bud.employee.employeeLockArgs,
				injectionArray: me.employeeLocks
			});
			
		},
		
		employeeLocksLoaded: function(me, activeId) {
			
			me.employeeData.setData(me.employeeLocks);
			$("#pageLoading").hide();
		}
		
		
	}
});



function main(){
	fin.employeeUI = new fin.bud.employee.UserInterface();
	fin.employeeUI.resize();
}

ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.bud.managementHistory.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);

ii.Class({
    Name: "fin.bud.managementHistory.UserInterface",
    Definition: {
	
		init: function(){
			var args = ii.args(arguments, {});
			var me = this;

			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
				me.authorizePath = "bud\\managementHistory";
				me.authorizer.authorize([me.authorizePath],
					function authorizationsLoaded(){
						me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);
				
			me.defineFormControls();
			me.configureCommunications();
			
			$('#ManagementAdmin').hide();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			
			$("input[@name='Management']").click
			//$("input[@StaffingOption]").click
			(function(){
				if (this.id == 'PersonalSalary') {
					$('#ManagementAdmin').hide();
					$('#PersonalSalaryReview').show();
					fin.managementHistoryUI.reviewWorksheet.setHeight($(fin.managementHistoryUI.reviewWorksheet.element).parent().height() - 2);
				}
				
				if (this.id == 'ManagementWorksheet') {
					$('#PersonalSalaryReview').hide();
					$('#ManagementAdmin').show();
					fin.managementHistoryUI.managementAdministration.setHeight($(fin.managementHistoryUI.managementAdministration.element).parent().height() - 2);
				}
				
			});
		
		},
		
		authorizationProcess: function fin_bud_managementHistory_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;
	
			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
			
		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
			fin.managementHistoryUI.reviewWorksheet.setHeight($(window).height() - 150);
			fin.managementHistoryUI.managementAdministration.setHeight($(window).height() - 150);
		},	
		
		sessionLoaded: function fin_bud_managementHistory_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		defineFormControls: function(){
			var me = this;
			
			me.reviewWorksheet = new ui.ctl.Grid({
				id: "ReviewWorksheet",
				appendToId: "divForm",
				allowAdds: true
			});
			
			me.reviewWorksheet.addColumn("Name", "Name", "Name", "Name", 145);
			me.reviewWorksheet.addColumn("Position", "Position", " Position", "Position", 80);
			me.reviewWorksheet.addColumn("Annaual Salary", "Annaual Salary", "Annaual Salary", "Annaual Salary", 150);
			me.reviewWorksheet.addColumn("Period of increase", "Period of increase", "Period of increase", "Period of increase", 160);
			me.reviewWorksheet.addColumn("Type Merit/Promotion", "Type Merit/Promotion", "Promotion", "Type Merit/Promotion", 130);
			me.reviewWorksheet.addColumn("2008 Fiscal Increase", "2008 Fiscal Increase", "Fiscal Increase", "2008 Fiscal Increase (%)", 150);
			me.reviewWorksheet.addColumn("New Salary", "New Salary", "Salary", "New Salary", null);
			me.reviewWorksheet.capColumns();
			me.reviewWorksheet.setHeight($(me.reviewWorksheet.element).parent().height() - 2);
			
			me.managementAdministration = new ui.ctl.Grid({
				id: "ManagementAdministration",
				appendToId: "divForm",
				allowAdds: true
			});
			me.managementAdministration.addColumn("Name", "Name", "Name", "Name", 125);
			me.managementAdministration.addColumn("Period 1", "Period 1", "Period 1", "Period 1", 80);
			me.managementAdministration.addColumn("Period 2", "Period 2", "Period 2", "Period 2", 80);
			me.managementAdministration.addColumn("Period 3", "Period 3", "Period 3", "Period 3", 80);
			me.managementAdministration.addColumn("Period 4", "Period 4", "Period 4", "Period 4", 80);
			me.managementAdministration.addColumn("Period 5", "Period 5", "Period 5", "Period 5", 80);
			me.managementAdministration.addColumn("Period 6", "Period 6", "Period 6", "Period 6", 80);
			me.managementAdministration.addColumn("Period 7", "Period 7", "Period 7", "Period 7", 80);
			me.managementAdministration.addColumn("Period 8", "Period 8", "Period 8", "Period 8", 80);
			me.managementAdministration.addColumn("Period 9", "Period 9", "Period 9", "Period 9", 80);
			me.managementAdministration.addColumn("Period 10", "Period 10", "Period 10", "Period 10", 85);
			me.managementAdministration.addColumn("Period 11", "Period 11", "Period 11", "Period 11", 85);
			me.managementAdministration.addColumn("Period 12", "Period 12", "Period 12", "Period 12", 85);
			me.managementAdministration.addColumn("Period 13", "Period 13", "Period 13", "Period 13", 85);
			me.managementAdministration.addColumn("Total", "Total", "Total", "Total", null);
			me.managementAdministration.capColumns();
			me.managementAdministration.setHeight($(me.managementAdministration.element).parent().height() - 2);
			
			$("#pageLoading").hide();
		},
			
		
		configureCommunications: function(){
			
		}

	
		}
});



function main(){
	fin.managementHistoryUI = new fin.bud.managementHistory.UserInterface();
	fin.managementHistoryUI.resize();
}

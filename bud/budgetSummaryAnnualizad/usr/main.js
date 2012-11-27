ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.bud.budgetSummaryAnnualizad.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);

ii.Class({
    Name: "fin.bud.budgetSummaryAnnualizad.UserInterface",
    Definition: {
	
		init: function(){
			var args = ii.args(arguments, {});
			var me = this;
			
			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\budgetSummaryAnnualizad";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);

			me.configureCommunications();
			me.defineFormControls();
			
			$(window).bind("resize", me, me.resize);
				$().bind("keydown", me, me.controlKeyProcessor);
			},
			
			authorizationProcess: function fin_bud_budgetSummaryAnnualized_UserInterface_authorizationProcess(){
				var args = ii.args(arguments,{});
				var me = this;
	
				$("#pageLoading").hide();
			
				me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded,me);
			},	
			
			sessionLoaded: function fin_bud_budgetSummaryAnnualized_UserInterface_sessionLoaded(){
				var args = ii.args(arguments, {
					me: {type: Object}
				});
	
				ii.trace("session loaded.", ii.traceTypes.Information, "Session");
			},
			
			resize: function(){
				var args = ii.args(arguments,{});
				var me = this;

				fin.budgetSummaryAnnualizadUI.budgetSummaryAnnualizadGrid.setHeight($(window).height() - 65);			
			},
			
			defineFormControls: function(){
			var me = this;
						
			me.budgetSummaryAnnualizadGrid = new ui.ctl.Grid({
				id: "budgetSummaryAnnualizadGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.budgetSummaryAnnualizadGrid.addColumn("GL Account", "GL Account", "GL Account", "GL Account", 150);
			me.budgetSummaryAnnualizadGrid.addColumn("Account Number", "Account Number ", " Account Number ", "Account Number", 150);
			me.budgetSummaryAnnualizadGrid.addColumn("2007 Annual Projections", "2007 Annual Projections", "Projections", "2007 Annual Projections", 120);
			me.budgetSummaryAnnualizadGrid.addColumn("2007 Orginal Projections", "2007 Orginal Projections", "Projections", "2007 Orginal Projections", 120);
			me.budgetSummaryAnnualizadGrid.addColumn("2008 Budget", "2008 Budget", "Budget", "2008 Budget", 70);
			me.budgetSummaryAnnualizadGrid.addColumn("Variance", "Variance", "Variance", "Variance", 90);
			me.budgetSummaryAnnualizadGrid.addColumn("Variance Perc", "Variance Perc", "Variance", "Variance Perc", 90);
			me.budgetSummaryAnnualizadGrid.addColumn("Comment", "Comment", "Comment", "Comment", null);
			me.budgetSummaryAnnualizadGrid.capColumns();
			//me.budgetSummaryAnnualizad.setHeight($(me.budgetSummaryAnnualizad.element).parent().height() - 2);
			
			
			$("#pageLoading").hide();
		},
			
		
		configureCommunications: function(){
			
		}

		
	}
});



function main(){
	fin.budgetSummaryAnnualizadUI = new fin.bud.budgetSummaryAnnualizad.UserInterface();
	fin.budgetSummaryAnnualizadUI.resize();
}

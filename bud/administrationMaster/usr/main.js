ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.bud.administrationMaster.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.tabsBud" , 5);

ii.Class({
    Name: "fin.bud.administrationMaster.UserInterface",
    Definition: {
		
        init: function() {
  			var args = ii.args(arguments, {});
			var me = this;

		    me.activeFrameId = 0;
			me.annualInfoNeedUpdate = true;
			me.approveBudgetNeedUpdate = true;
			me.deleteBudgetNeedUpdate = true;
			me.exportBudgetNeedUpdate = true;
						
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);			
			
			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\bud\\administrationMaster";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$("#TabCollection a").click(function() {
				
				switch(this.id) {
					
					case "TabAnnualInfo":
					
						if (($("iframe")[0].contentWindow.fin == undefined || me.annualInfoNeedUpdate))
							$("iframe")[0].src = "/fin/bud/annualInformation/usr/markup.htm";
	
							me.activeFrameId = 0;
							me.annualInfoNeedUpdate = false;
							break;

					case "TabApproveBudget":
					
						if (($("iframe")[1].contentWindow.fin == undefined || me.approveBudgetNeedUpdate))
							$("iframe")[1].src = "/fin/bud/approveBudget/usr/markup.htm";
	
							me.activeFrameId = 1;
							me.approveBudgetNeedUpdate = false;
							break;
							
					case "TabDeleteBudget":
					
						if (($("iframe")[2].contentWindow.fin == undefined || me.deleteBudgetNeedUpdate))
							$("iframe")[2].src = "/fin/bud/deleteBudget/usr/markup.htm";
	
							me.activeFrameId = 2;
							me.deleteBudgetNeedUpdate = false;
							break;
							
					case "TabExportBudget":
					
						if (($("iframe")[3].contentWindow.fin == undefined || me.exportBudgetNeedUpdate))
							$("iframe")[3].src = "/fin/bud/exportBudget/usr/markup.htm";
	
							me.activeFrameId = 3;
							me.exportBudgetNeedUpdate = false;
							break;
				}		
			});
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
			$("iframe")[0].src = "/fin/bud/annualInformation/usr/markup.htm";
        },
		
		authorizationProcess: function fin_bud_administrationMaster_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_administrationMaster_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var offset = 42;
			
			$("#iFrameAnnualInfo").height($(window).height() - offset);
			$("#iFrameApproveBudget").height($(window).height() - offset);
		    $("#iFrameDeleteBudget").height($(window).height() - offset);
			$("#iFrameExportBudget").height($(window).height() - offset);	
		},
		
		defineFormControls: function() {
			var me = this;			
			
		},
				
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

		},
		
		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
			
				switch (event.keyCode) {
					case 83: // Ctrl+S
						//me.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						//me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed)
				return false;
		},		
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
		},
				
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
		}
    }
});

function main() {
	
	fin.budAdminMasterUi = new fin.bud.administrationMaster.UserInterface();
	fin.budAdminMasterUi.resize();
}


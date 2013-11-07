ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.bud.administrationMaster.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.tabsBud", 5 );

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
			me.loadCount = 0;

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
			me.setStatus("Loading");

			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = $("iframe")[me.activeFrameId].contentWindow.document.activeElement;

					if (focusedControl.type != undefined && (focusedControl.type == "text" || focusedControl.type == "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {

				if (!parent.fin.cmn.status.itemValid()) 
					return false;
				else {
					var tabIndex = 0;
					if (this.id == "TabAnnualInfo")
						tabIndex = 1;
					else if (this.id == "TabApproveBudget")
						tabIndex = 2;
					else if (this.id == "TabDeleteBudget")
						tabIndex = 3;
					else if (this.id == "TabExportBudget")
						tabIndex = 4;

					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}
			});
			
			$("#TabCollection a").click(function() {

				switch(this.id) {
					
					case "TabAnnualInfo":
					
						if (($("iframe")[0].contentWindow.fin == undefined || me.annualInfoNeedUpdate))
							$("iframe")[0].src = "/fin/bud/annualInformation/usr/markup.htm";
						else if (parent.fin.appUI.modified)
							me.setStatus("Edit");
						else 
							me.setStatus("Loaded");
	
						me.activeFrameId = 0;
						me.annualInfoNeedUpdate = false;
						break;

					case "TabApproveBudget":
					
						if (($("iframe")[1].contentWindow.fin == undefined || me.approveBudgetNeedUpdate)) {
							me.setLoadCount();
							$("iframe")[1].src = "/fin/bud/approveBudget/usr/markup.htm";
						}
						else if (parent.fin.appUI.modified)
							me.setStatus("Edit");
						else 
							me.setStatus("Loaded");
							
						me.activeFrameId = 1;
						me.approveBudgetNeedUpdate = false;
						break;
							
					case "TabDeleteBudget":
					
						if (($("iframe")[2].contentWindow.fin == undefined || me.deleteBudgetNeedUpdate)) {
							me.setLoadCount();
							$("iframe")[2].src = "/fin/bud/deleteBudget/usr/markup.htm";
						}
						else if (parent.fin.appUI.modified)
							me.setStatus("Edit");
						else 
							me.setStatus("Loaded");
	
						me.activeFrameId = 2;
						me.deleteBudgetNeedUpdate = false;
						break;
							
					case "TabExportBudget":
					
						if (($("iframe")[3].contentWindow.fin == undefined || me.exportBudgetNeedUpdate)) {
							me.setLoadCount();
							$("iframe")[3].src = "/fin/bud/exportBudget/usr/markup.htm";
						}
						else if (parent.fin.appUI.modified)
							me.setStatus("Edit");
						else 
							me.setStatus("Loaded");
	
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
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_bud_administrationMaster_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);			
			
			$("#pageLoading").hide();
			$("#pageLoading").css({
				"opacity": "0.5",
				"background-color": "black"
			});
			$("#messageToUser").css({ "color": "white" });
			$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
			$("#pageLoading").fadeIn("slow");
		},	
		
		sessionLoaded: function fin_bud_administrationMaster_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var offset = 67;
			
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
		
		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
		},
		
		dirtyCheck: function(me) {

			return !fin.cmn.status.itemValid();
		},
		
		setLoadCount: function(me, activeId) {
			var me = this;

			me.loadCount++;
			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
		},
		
		checkLoadCount: function() {
			var me = this;

			me.loadCount--;
			if (me.loadCount <= 0) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},
		
		showPageLoading: function(status) {
			var me = this;

			me.setStatus(status);
			$("#messageToUser").text(status);
			$("#pageLoading").fadeIn("slow");
		},
		
		hidePageLoading: function() {
			var me = this;
			$("#pageLoading").fadeOut("slow");
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
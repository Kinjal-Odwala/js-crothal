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
			var me = this;

		    me.activeFrameId = 0;
			me.loadCount = 0;
			me.annualInfoNeedUpdate = true;
			me.approveBudgetNeedUpdate = true;
			me.deleteBudgetNeedUpdate = true;
			me.exportBudgetNeedUpdate = true;
			me.benefitsCostNeedUpdate = true;

			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.session = new ii.Session(me.cache);
			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Budgeting\\Administration";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.initialize();
			$(window).bind("resize", me, me.resize);

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			me.annualInfoShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\AnnualInfo");
			me.approveBudgetShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\ApproveBudget");
			me.deleteBudgetShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\DeleteBudget");
			me.exportBudgetShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\ExportBudget");
			me.benefitsCostShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\BenefitsCost");

			if (me.annualInfoShow)
				$("#TabAnnualInfo").show();
			if (me.approveBudgetShow)
				$("#TabApproveBudget").show();
			if (me.deleteBudgetShow)
				$("#TabDeleteBudget").show();
			if (me.exportBudgetShow)
				$("#TabExportBudget").show();
			if (me.benefitsCostShow)
				$("#TabBenefitsCost").show();

			if (me.annualInfoShow)
				me.activeFrameId = 1;
			else if (me.approveBudgetShow)
				me.activeFrameId = 2;
			else if (me.deleteBudgetShow)
				me.activeFrameId = 3;
			else if (me.exportBudgetShow)
				me.activeFrameId = 4;
			else if (me.benefitsCostShow)
				me.activeFrameId = 5;

			$("#container-1").tabs(me.activeFrameId);
			$("#container-1").triggerTab(me.activeFrameId);
			if (me.activeFrameId === 5)
    			$("iframe")[4].src = "/fin/bud/benefitCostSetup/usr/markup.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var offset = 44;

			$("#iFrameAnnualInfo").height($(window).height() - offset);
			$("#iFrameApproveBudget").height($(window).height() - offset);
		    $("#iFrameDeleteBudget").height($(window).height() - offset);
		    $("#iFrameExportBudget").height($(window).height() - offset);
		    $("#iFrameBenefitsCost").height($(window).height() - offset);
		},

		dirtyCheck: function(me) {

			return !fin.cmn.status.itemValid();
		},

		initialize: function() {
			var me = this;

			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = $("iframe")[me.activeFrameId].contentWindow.document.activeElement;

					if (focusedControl.type !== undefined && (focusedControl.type === "text" || focusedControl.type === "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid())
					return false;
				else {
					var tabIndex = 0;
					if (this.id === "TabAnnualInfo")
					    tabIndex = 1;
					else if (this.id === "TabApproveBudget")
					    tabIndex = 2;
					else if (this.id === "TabDeleteBudget")
					    tabIndex = 3;
					else if (this.id === "TabExportBudget")
					    tabIndex = 4;
					else if (this.id === 'TabBenefitsCost')
					    tabIndex = 5;

					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}
			});

			$("#TabCollection a").click(function() {
				switch(this.id) {

					case "TabAnnualInfo":

						if (($("iframe")[0].contentWindow.fin === undefined || me.annualInfoNeedUpdate))
							$("iframe")[0].src = "/fin/bud/annualInformation/usr/markup.htm";
						else
							$("iframe")[0].contentWindow.fin.annualInformationUI.setStatus("Loaded");

						me.activeFrameId = 0;
						me.annualInfoNeedUpdate = false;
						break;

					case "TabApproveBudget":

						if (($("iframe")[1].contentWindow.fin === undefined || me.approveBudgetNeedUpdate))
							$("iframe")[1].src = "/fin/bud/approveBudget/usr/markup.htm";
						else
							$("iframe")[1].contentWindow.fin.approveBudgetUi.setStatus("Loaded");

						me.activeFrameId = 1;
						me.approveBudgetNeedUpdate = false;
						break;

					case "TabDeleteBudget":

						if (($("iframe")[2].contentWindow.fin === undefined || me.deleteBudgetNeedUpdate))
							$("iframe")[2].src = "/fin/bud/deleteBudget/usr/markup.htm";
						else
							$("iframe")[2].contentWindow.fin.deleteBudgetUi.setStatus("Loaded");

						me.activeFrameId = 2;
						me.deleteBudgetNeedUpdate = false;
						break;

					case "TabExportBudget":

						if (($("iframe")[3].contentWindow.fin === undefined || me.exportBudgetNeedUpdate))
							$("iframe")[3].src = "/fin/bud/exportBudget/usr/markup.htm";
						else
							$("iframe")[3].contentWindow.fin.exportBudgetUi.setStatus("Loaded");

						me.activeFrameId = 3;
						me.exportBudgetNeedUpdate = false;
						break;

				    case "TabBenefitsCost":

				        if (($("iframe")[4].contentWindow.fin === undefined || me.benefitsCostNeedUpdate))
				            $("iframe")[4].src = "/fin/bud/benefitCostSetup/usr/markup.htm";

				        me.activeFrameId = 4;
				        me.benefitsCostNeedUpdate = false;
				        break;
				}
			});
		}
    }
});

function main() {

	fin.budAdminMasterUi = new fin.bud.administrationMaster.UserInterface();
	fin.budAdminMasterUi.resize();
}
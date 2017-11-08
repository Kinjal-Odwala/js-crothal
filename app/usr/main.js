ii.Import( "ui.lay.usr.twoTab" );
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.app.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.app.usr.media.help.help" , 2);
ii.Style( "fin.app.usr.media.dialog.dialog" , 3);
ii.Style( "fin.cmn.usr.common" , 4);
ii.Style( "fin.cmn.usr.statusBar" , 5);

ii.Class({
	Name: "fin.app.UserInterface",
	Definition: {

		init: function() {
			var me = this;

			ui.cmn.behavior.disableBackspaceNavigation();

			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.layout = new ui.lay.TwoTab(
				me.gateway,
				"Left",
				true
			);

			var tabs = me.layout.sideTabs.tabs;

			// Menu tab is automatically created by the two-tab layout
			tabs.addTab("Role", "Role", "Application User Roles.");
			tabs.addTab("Notes", "Notes", "Application Notes.");
			tabs.addTab("Flow", "Flow", "Application Flow (Map).");

			tabs.tabs.Menu.button.display("Selected");
			tabs.tabs.Menu.click();

			if (me.gateway.targets["iiCache"])
				me.cache = me.gateway.targets.iiCache.referenceData;
			else
				me.cache = new ii.ajax.Cache(me.gateway);

			me.session = new ii.Session(me.cache);
			me.configureCommunications();
			me.userRoleStore.fetch("userId:[user],", me.userRolesLoaded, me);
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearLoaded, me);
			me.systemVariableStore.fetch("userId:[user],name:ShowFeedbackLink", me.systemVariablesLoaded, me);

			// Redirect to Housecode Workflow UI if user click on email link for approving the request.
			var queryStringArgs = {};
			var queryString = location.search.substring(1);
			var pairs = queryString.split("&");

			for (var index = 0; index < pairs.length; index++) {
				var pos = pairs[index].indexOf("=");
				if (pos === -1)
					continue;
				var argName = pairs[index].substring(0, pos);
				var value = pairs[index].substring(pos + 1);
				queryStringArgs[argName] = unescape(value);
			}

			if (queryStringArgs["type"] === "hcRequest") {
				me.intervalId = setInterval(function() {
					if (top.ui.ctl.menu.Dom.me) {
						clearInterval(me.intervalId);
						$(top.ui.ctl.menu.Dom.me.items["hcm"].xmlNode).find("item").each(function() {
							if ($(this).attr("id") === "hcRequest") {
								var actionData = $(this).attr("actionData") + "?id=" + queryStringArgs["id"] + "&stepNumber=" + queryStringArgs["stepNumber"];
								$(this).attr("actionData", actionData);
								$(this).attr("state", "Selected");
								$(top.ui.ctl.menu.Dom.me.items["hcm"]).select();
							}
						});
					}
				}, 500);
			}
		},

		configureCommunications: function() {
			var me = this;

			me.userRoles = [];
			me.userRoleStore = me.cache.register({
				storeId: "appUserRoles",
				itemConstructor: fin.app.UserRole,
				itemConstructorArgs: fin.app.userRoleArgs,
				injectionArray: me.userRoles
			});

			me.weekPeriodYears = [];
			me.weekPeriodYearStore = me.cache.register({
				storeId: "weekPeriodYears",
				itemConstructor: fin.app.WeekPeriodYear,
				itemConstructorArgs: fin.app.weekPeriodYearArgs,
				injectionArray: me.weekPeriodYears
			});

			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.app.SystemVariable,
				itemConstructorArgs: fin.app.systemVariableArgs,
				injectionArray: me.systemVariables
			});
		},

		weekPeriodYearLoaded: function(me, activeId) {

			if (me.weekPeriodYears.length > 0) {
				me.glbWeek = me.weekPeriodYears[0].week;
				me.glbFscPeriod = me.weekPeriodYears[0].periodId;
				me.glbPeriod = me.weekPeriodYears[0].period;
				me.glbFscYear = me.weekPeriodYears[0].yearId;
				me.glbfiscalYear = me.weekPeriodYears[0].fiscalYear;
				me.glbCurrentDate = me.weekPeriodYears[0].currentDate;
				me.glbWeekStartDate = me.weekPeriodYears[0].WeekStartDate;
			}
		},

		systemVariablesLoaded: function(me, activeId) {

			if (me.systemVariables.length > 0 && me.systemVariables[0].variableValue === "Yes") {
				$("#ToolMenuLogout").after("<div id='ToolMenuFeedback'></div>");

				me.toolMenuFeedback = new ui.ctl.buttons.Simple({
					id: "ToolMenuFeedback",
					clickFunction: function() {	me.showFeedbackForm(); },
					appendToId: "iiMenuHorizontalHeaderMiddle",
					className: "ToolMenuLogout",
					hasHotState: true,
					text: "Feedback",
					title: "Provide feedback/comments."
				});
			}

			me.systemVariableStore.fetch("userId:[user],name:TeamFinV2URL", me.teamFinV2URLLoaded, me);
		},

		teamFinV2URLLoaded: function(me, activeId) {

			if (me.systemVariables.length > 0) {
				$("#ToolMenuFeedback").after("<div id='ToolMenuTeamFinV2'></div>");

				me.toolMenuTeamFin2 = new ui.ctl.buttons.Simple({
					id: "ToolMenuTeamFinV2",
					clickFunction: function() {	window.open(me.systemVariables[0].variableValue); },
					appendToId: "iiMenuHorizontalHeaderMiddle",
					className: "ToolMenuLogout",
					hasHotState: true,
					text: "TeamFin V2",
					title: "Click here to view the TeamFin V2 application."
				});
			}
		},

		userRolesLoaded: function(me, activeId) {

			var userRole, appUserRoleId;
			var userRoleMenuXml = "<div id='iiMenuVertical'>";

 			for (var index = 0; index < me.userRoles.length; index++) {
				userRole = me.userRoles[index];
				userRoleMenuXml += "<div"
					+ " id='iiMenuVerticalMain" + userRole.title.replace(" ", "") + userRole.id + "'"
					+ " class='iiMenuVerticalMain " + (userRole.roleCurrent ? "Selected": "Enabled") + "'"
					+ " title='" + userRole.title.replace(" ", "") + "'"
					+ " tag='" + userRole.id + "'"
					+ ">";
				userRoleMenuXml += "<span class='iiMenuVerticalMainPart " + (userRole.roleCurrent ? 'Selected': '') + "'>" + userRole.title;
				userRoleMenuXml += "</span>";
				userRoleMenuXml += "</div>";

				if (userRole.roleCurrent) {
					appUserRoleId = userRole.id;
				}
			}

			userRoleMenuXml += "</div>";

			$("#sideTabsContentRole").html(userRoleMenuXml);
			$("#sideTabsContentRole div").each(function() {
				if (this.id.indexOf("iiMenuVerticalMain") === 0) {
					$(this).click(function() {
						if (appUserRoleId.toString() === this.id.replace("iiMenuVerticalMain" + this.title, ""))
							return;

						me.roleUpdate(parseInt(this.id.replace("iiMenuVerticalMain" + this.title, "")));
					});
				}
			});

			me.lastLogOnUpdate(appUserRoleId);
			$("#about").after("<div id='environmentLabel' class='statusBarPanel'>Environment: </div><div id='environmentName' class='statusBarPanel'>" + me.session.propertyGet("environmentName") + "</div>");
		},

		roleUpdate: function() {
			var args = ii.args(arguments, {
				appUserRoleId: {type: Number, required: false, defaultValue:0}
			});
			var me = this;
			var item = new fin.app.UserRole(args.appUserRoleId);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: "<user flag='roleChangedAtLeftMenu' appUserRoleId='" + args.appUserRoleId + "'/>",
				responseFunction: me.responseRoleUpdate,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		responseRoleUpdate: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				//reload the application after updating the User's current AppRole.
				window.location = window.location;
			}
			else {
				alert("[SAVE FAILURE] Error while updating User Role.\n" + $(args.xmlNode).attr("message"));
			}
		},

		lastLogOnUpdate: function() {
			var args = ii.args(arguments, {
				appUserRoleId: {type: Number}
			});
			var me = this;
			var item = new fin.app.UserRole(args.appUserRoleId);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: "<user flag='lastLogOnUpdate' appUserRoleId='" + args.appUserRoleId + "'/>",
				responseFunction: me.responseLastLogOnUpdate,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		responseLastLogOnUpdate: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				//reload the application after updating the User's current AppRole.
			}
			else {
				alert("[SAVE FAILURE] Error while updating User Last LogOn.\n" + $(args.xmlNode).attr("message"));
			}
		},

		showFeedbackForm: function() {
			var windowWidth = $("#appContent").width();
			var windowHeight = $("#appContent").height();
			var popupWidth = $("#popupFeedback").width();
			var popupHeight = $("#popupFeedback").height();

			$("iFrame")[1].src = "/fin/app/feedback/usr/markup.htm";

			$("#backgroundPopup").css({
				"opacity": "0.5",
				"width": windowWidth,
				"height": windowHeight,
				"top": $("#appContent").position().top,
				"left": $("#appContent").position().left + 10
			});

			$("#popupFeedback").css({
				"top": (windowHeight/2 - popupHeight/2) + $("#panelTop").height(),
				"left": (windowWidth/2 - popupWidth/2) + $("#sideTabs").width()
			});

			$("#backgroundPopup").fadeIn("slow");
			$("#popupFeedback").fadeIn("slow");
		},

		hideFeedbackForm: function() {
			$("#popupFeedback").fadeOut("slow");
			$("#backgroundPopup").fadeOut("slow");
		}
	}
});

function main() {
	fin.appUI = new fin.app.UserInterface();
	$("#pageLoading").hide();
}
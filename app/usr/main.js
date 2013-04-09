ii.Import( "ui.lay.usr.twoTab" );
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.app.usr.defs" );

/* @iiDoc {Class}
 * Application Module
 */
ii.Style( "style" , 1);
ii.Style( "fin.app.usr.media.help.help" , 2);
ii.Style( "fin.app.usr.media.dialog.dialog" , 3);
ii.Style( "fin.cmn.usr.common" , 4);
ii.Style( "fin.cmn.usr.statusBar" , 5);

ii.Class({
	Name: "fin.app.UserInterface",
	Definition: {
		
		init: function fin_app_UserInterface_init(){
			var args = ii.args(arguments,{});

			var me = this;

			ui.cmn.behavior.disableBackspaceNavigation();

			me.gateway = ii.ajax.addGateway( "app", ii.config.xmlProvider );		//@iiDoc {Property:ii.ajax.Gateway} The AP Ajax gateway.
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);

			me.layout = new ui.lay.TwoTab(
				me.gateway, 
				"Left",
				true //Session enabled.
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
			
			me.userRoleStore.fetch("userId:[user],", me.userRolesLoaded, me);
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearLoaded, me);
			me.systemVariableStore.fetch("userId:[user],name:ShowFeedbackLink", me.systemVariablesLoaded, me);
		},
		
		weekPeriodYearLoaded: function fin_app_UserInterface_weekPeriodYearLoaded(me, activeId) {
			
			if (me.weekPeriodYears.length > 0) {
				me.glbWeek = me.weekPeriodYears[0].week;
				me.glbFscPeriod = me.weekPeriodYears[0].periodId;
				me.glbPeriod = me.weekPeriodYears[0].period;
				me.glbFscYear = me.weekPeriodYears[0].yearId;
				me.glbfiscalYear = me.weekPeriodYears[0].fiscalYear;
				me.glbCurrentDate = me.weekPeriodYears[0].currentDate;
			}
		},
		
		systemVariablesLoaded: function fin_app_UserInterface_systemVariablesLoaded(me, activeId) {

			if (me.systemVariables.length > 0 && me.systemVariables[0].variableValue == "Yes") {
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
		},
		
		userRolesLoaded: function fin_app_UserInterface_userRolesLoaded(me, activeId) {
						
			var userRole, appUserRoleId, appUserRoleTitle;
			var userRoleMenuXml = "<div id='iiMenuVertical'>";
			
 			for(index in me.userRoles){

				userRole = me.userRoles[index];

				userRoleMenuXml += "<div"
					+ " id='iiMenuVerticalMain" + userRole.title.replace(' ', '') + userRole.id + "'"
					+ " class='iiMenuVerticalMain " + (userRole.roleCurrent ? 'Selected': 'Enabled') + "'"
					+ " title='" + userRole.title.replace(' ', '') + "'"
					+ " tag='" + userRole.id + "'"
					+ ">";
				userRoleMenuXml += "<span class='iiMenuVerticalMainPart " + (userRole.roleCurrent ? 'Selected': '') + "'>" + userRole.title;
				userRoleMenuXml += "</span>";
				userRoleMenuXml += "</div>";
				
				if (userRole.roleCurrent) {
					appUserRoleId = userRole.id;
					appUserRoleTitle = userRole.title;
				}				
			}

			userRoleMenuXml += "</div>";
			
			$("#sideTabsContentRole").html(userRoleMenuXml);

			$("#sideTabsContentRole div").each(function(){

				if (this.id.indexOf('iiMenuVerticalMain') == 0) {
					
					$(this).click(function(){
					
						if (appUserRoleId.toString() == this.id.replace('iiMenuVerticalMain' + this.title, '')) 
							return;
						
						me.roleUpdate(parseInt(this.id.replace('iiMenuVerticalMain' + this.title, '')));
					});
				}
			});
		
			me.lastLogOnUpdate(appUserRoleId);
			$("#about").after("<div id='environmentLabel' class='statusBarPanel'>Environment: </div><div id='environmentName' class='statusBarPanel'>" + me.session.propertyGet("environmentName") + "</div>");
		},
		
		roleUpdate: function fin_app_UserInterface_roleUpdate(){
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
		
		responseRoleUpdate: function fin_app_UserInterface_responseRoleUpdate() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});

			var status = $(args.xmlNode).attr("status");

			if(status == "success") {
				//reload the application after updating the User's current AppRole.
				window.location = window.location;
			}
			else {

				alert("Error while updating User Role.\n" + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if( status == "invalid" ) {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
		},
		
		lastLogOnUpdate: function fin_app_UserInterface_lastLogOnUpdate(){
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
		
		responseLastLogOnUpdate: function fin_app_UserInterface_responseLastLogOnUpdate() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});

			var status = $(args.xmlNode).attr("status");

			if(status == "success") {
				//reload the application after updating the User's current AppRole.
			}
			else {

				alert("Error while updating User Last LogOn.\n" + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if( status == "invalid" ) {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
		},
		
		showFeedbackForm: function fin_app_UserInterface_showFeedbackForm() {
			var me = this;

			$("iFrame")[1].src = "/fin/app/feedback/usr/markup.htm";

			var windowWidth = $("#appContent").width();
			var windowHeight = $("#appContent").height();
			var popupWidth = $("#popupFeedback").width();
			var popupHeight = $("#popupFeedback").height();

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

		hideFeedbackForm: function fin_app_UserInterface_actionCancelItem() {
			var me = this;

			$("#popupFeedback").fadeOut("slow");
			$("#backgroundPopup").fadeOut("slow");
		}
	}
});

function main(){
	
	fin.appUI = new fin.app.UserInterface();
	$("#pageLoading").hide();
}
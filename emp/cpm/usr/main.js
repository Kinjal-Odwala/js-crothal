ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.emp.cpm.usr.defs" );

ii.Style( "fin.cmn.usr.common", 1 );
ii.Style( "fin.cmn.usr.statusBar", 2 );

ii.Class({
    Name: "fin.emp.cpm.UserInterface",
    Definition: {

		init: function() {
			var me = this;

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);

			me.session = new ii.Session();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\CPM";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.configureCommunications();
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.systemVariableStore.fetch("userId:[user],name:CPMWebURL", me.systemVariablesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		configureCommunications: function() {
			var me = this;

			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.emp.cpm.SystemVariable,
				itemConstructorArgs: fin.emp.cpm.systemVariableArgs,
				injectionArray: me.systemVariables
			});
		},

		systemVariablesLoaded:function(me, activeId) {

			if (me.systemVariables.length > 0) {
				window.open(me.systemVariables[0].variableValue);
			}

			$("#pageLoading").fadeOut("slow");
			$("#cpmMessage").show();
		}
	}
});

function main() {
	fin.emp.cpmUi = new fin.emp.cpm.UserInterface();
}
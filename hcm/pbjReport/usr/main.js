ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.pbjReport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );

ii.Class({
    Name: "fin.hcm.pbjReport.UserInterface",
    Definition: {
		init: function() {
			var me = this;

			me.loadCount = 1;

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(me.gateway, function(status, errorMessage){
				me.nonPendingError(status, errorMessage);
			});
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\CMS/PBJReport";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");	
			me.modified(false);

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
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.checkLoadCount();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	
		
		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {

			$("#ContainerArea").height($(window).height() - 115);
		},
		
		defineFormControls: function() {
			var me = this;

			me.anchorGenerate = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate XML&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateItem(); },
				hasHotState: true
			});
		},

		configureCommunications: function() {
			var me = this;

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
				storeId: "hcmFileNames",
				itemConstructor: fin.hcm.pbjReport.FileName,
				itemConstructorArgs: fin.hcm.pbjReport.fileNameArgs,
				injectionArray: me.fileNames
			});
		},

		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
		},

		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
		
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;
			
			parent.fin.appUI.modified = args.modified;
			if (args.modified)
				me.setStatus("Edit");
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

		actionGenerateItem: function() {
			var me = this;

			me.setLoadCount();
			me.setStatus("Generating");
			$("#messageToUser").text("Generating XML Files");

			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],type:pbj", me.fileNamesLoaded, me);
		},
		
		fileNamesLoaded: function(me, activeId) {

			me.checkLoadCount();
			alert("PBJ XML files generated successfully.")

//			if (me.fileNames.length == 1) {
//				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
//				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
//			}
		}
	}
});

function main() {
	fin.hcm.pbjReportUi = new fin.hcm.pbjReport.UserInterface();
	fin.hcm.pbjReportUi.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.hcm.pbjReport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.grid", 7 );

ii.Class({
    Name: "fin.hcm.pbjReport.UserInterface",
    Definition: {
		init: function() {
			var me = this;

			me.loadCount = 1;
			me.years = [];
			me.quarters = [];

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
			var me = this;
			$("#PBJReportContainer").height($(window).height() - 120);
			me.fileNameGrid.setHeight($(window).height() - 110);
		},

		defineFormControls: function() {
			var me = this;

			me.year = new ui.ctl.Input.DropDown.Filtered({
				id: "Year",
				formatFunction: function( type ) { return type.title; }
		    });

			me.year.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.year.indexSelected === -1)
					this.setInvalid("Please select the correct Year.");
			});

			me.quarter = new ui.ctl.Input.DropDown.Filtered({
				id: "Quarter",
				formatFunction: function( type ) { return type.title; }
		    });

			me.quarter.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.quarter.indexSelected === -1)
					this.setInvalid("Please select the correct Quarter.");
			});

			me.fileNameGrid = new ui.ctl.Grid({
				id: "FileNameGrid",
				appendToId: "divForm"
			});

			me.fileNameGrid.addColumn("houseCode", "houseCode", "House Code", "House Code", 120);
			me.fileNameGrid.addColumn("fileName", "fileName", "File Name", "File Name", null);
			me.fileNameGrid.capColumns();

			me.anchorGenerate = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate XML&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateItem(); },
				hasHotState: true
			});

			me.anchorDownload = new ui.ctl.buttons.Sizeable({
				id: "AnchorDownload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Download&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDownloadItem(); },
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

		setLoadCount: function() {
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

		initialize: function() {
			var me = this;

			me.years.push(new fin.hcm.pbjReport.Year(1, "2016"));
			me.quarters.push(new fin.hcm.pbjReport.Quarter(1, "1 (October 1 - December 31)"));
			me.quarters.push(new fin.hcm.pbjReport.Quarter(2, "2 (January 1 - March 31)"));
			me.quarters.push(new fin.hcm.pbjReport.Quarter(3, "3 (April 1 - June 30)"));
			me.quarters.push(new fin.hcm.pbjReport.Quarter(4, "4 (July 1 - September 30)"));

			me.year.setData(me.years);
			me.quarter.setData(me.quarters);
			me.year.select(0, me.year.focused);
			me.quarter.select(0, me.quarter.focused);
		},

		actionGenerateItem: function() {
			var me = this;

			me.validator.forceBlur();
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to generate, the errors on the page must be corrected.");
				return false;
			}

			me.setLoadCount();
			me.setStatus("Generating");
			$("#messageToUser").text("Generating XML Files");

			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],type:pbj,year:" + me.years[me.year.indexSelected].title + ",quarter:" + me.quarters[me.quarter.indexSelected].id, me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {

			for (var index = 0; index < me.fileNames.length; index++) {
				me.fileNames[index].houseCode = me.fileNames[index].fileName.substring(0, me.fileNames[index].fileName.indexOf("_"));
			}

			me.fileNameGrid.setData(me.fileNames);
			me.checkLoadCount();

			if (me.fileNames.length > 0)
				alert("PBJ XML files generated successfully.");
			else
				alert("No records found to generate XML files.");
		},

		actionDownloadItem: function() {
			var me = this;

			if (me.fileNameGrid.activeRowIndex >= 0) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[me.fileNameGrid.activeRowIndex].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		}
	}
});

function main() {
	fin.hcm.pbjReportUi = new fin.hcm.pbjReport.UserInterface();
	fin.hcm.pbjReportUi.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.hcm.pbjReport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.grid", 8 );

ii.Class({
    Name: "fin.hcm.pbjReport.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
		init: function() {
			var me = this;

			me.loadCount = 1;
			me.years = [];
			me.quarters = [];
			me.action = "";

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

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId)
				parent.fin.appUI.houseCodeId = 0;

			if (parent.fin.appUI.houseCodeId === 0)
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

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
			var me = fin.hcm.pbjReportUi;

			$("#PBJReportGridContainer").height($(window).height() - 120);
			$("#FileLocationContainer").height($(window).height() - 120);
			me.fileNameGrid.setHeight($(window).height() - 110);
			me.fileLocationGrid.setHeight($(window).height() - 110);
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "GeneratePBJReportAction",
					brief: "Generate CMS/PBJ Report",
					title: "To generate the CMS/PBJ report",
					actionFunction: function() { me.actionGeneratePBJReportItem(); }
				})
				.addAction({
					id: "ExportFileLocationAction",
					brief: "Report File Location",
					title: "To set the report file location",
					actionFunction: function() { me.actionFileLocationItem(); }
				});

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

			me.fileLocation = new ui.ctl.Input.Text({
                id: "FileLocation",
                maxLength: 512,
				changeFunction: function() { me.modified(); }
            });

			me.fileLocation.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.fileLocationGrid = new ui.ctl.Grid({
				id: "FileLocationGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.itemSelect(index); },
				validationFunction: function() {
					return parent.fin.cmn.status.itemValid();
				}
			});

			me.fileLocationGrid.addColumn("houseCode", "houseCode", "House Code", "House Code", 120);
			me.fileLocationGrid.addColumn("location", "location", "File Location", "File Location", null);
			me.fileLocationGrid.capColumns();

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

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
		},

		configureCommunications: function() {
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.pbjReport.HirNode,
				itemConstructorArgs: fin.hcm.pbjReport.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.pbjReport.HouseCode,
				itemConstructorArgs: fin.hcm.pbjReport.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.fileLocations = [];
			me.fileLocationStore = me.cache.register({
				storeId: "fileLocations",
				itemConstructor: fin.hcm.pbjReport.FileLocation,
				itemConstructorArgs: fin.hcm.pbjReport.fileLocationArgs,
				injectionArray: me.fileLocations
			});

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

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId === 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},

		actionGeneratePBJReportItem: function() {
			var me = this;

			$("#PBJReportContainer").show();
			$("#PBJFileLocationContainer").hide();
			$("#header").html("CMS/PBJ Report");
			me.action = "GenerateReport";
			me.year.resizeText();
			me.quarter.resizeText();
		},

		actionFileLocationItem: function() {
			var me = this;

			$("#PBJReportContainer").hide();
			$("#PBJFileLocationContainer").show();
			$("#header").html("CMS/PBJ File Location");
			me.action = "ReportLocation";
			me.fileLocationGrid.setHeight($(window).height() - 110);
			me.fileLocation.resizeText();
			me.setLoadCount();
			me.fileLocationStore.fetch("userId:[user]", me.fileLocationsLoaded, me);
		},

		fileLocationsLoaded: function(me, activeId) {

			me.fileLocationGrid.setData(me.fileLocations);
			me.checkLoadCount();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;
			var index = args.index;

			me.status = "";
			me.setStatus("Normal");

			if (me.fileLocationGrid.data[index] !== undefined) {
				me.fileLocation.setValue(me.fileLocationGrid.data[index].location);
			}
		},

		actionGenerateItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			// Check to see if the data entered is valid
			me.validator.forceBlur();
			me.validator.queryValidity(true);

			if (!me.year.valid || !me.quarter.valid) {
				alert("In order to generate, the errors on the page must be corrected.");
				return false;
			}

			me.setLoadCount();
			me.setStatus("Generating");
			$("#messageToUser").text("Generating XML Files");

			xml += '<pbjDataImport';
			xml += ' year="' + me.years[me.year.indexSelected].title + '"';
			xml += ' quarter="' + me.quarters[me.quarter.indexSelected].id + '"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		fileNamesLoaded: function(me, activeId) {

			for (var index = 0; index < me.fileNames.length; index++) {
				var fileName = me.fileNames[index].fileName.substring(me.fileNames[index].fileName.lastIndexOf("\\") + 1);
				me.fileNames[index].houseCode = fileName.substring(0, fileName.indexOf("_"));
				me.fileNames[index].filePath = me.fileNames[index].fileName.substring(0, me.fileNames[index].fileName.lastIndexOf("\\")) + "\\";
				me.fileNames[index].fileName = fileName;
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
				$("iframe")[0].contentWindow.document.getElementById("FilePath").value = me.fileNames[me.fileNameGrid.activeRowIndex].filePath;
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[me.fileNameGrid.activeRowIndex].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.fileLocationGrid.activeRowIndex >= 0) {
				me.fileLocationGrid.body.select(me.fileLocationGrid.activeRowIndex);
				me.itemSelect(me.fileLocationGrid.activeRowIndex);
			}

			me.status = "";
			me.setStatus("Normal");
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			if (me.fileLocationGrid.activeRowIndex === -1)
				return false;

			// Check to see if the data entered is valid
			me.validator.forceBlur();
			me.validator.queryValidity(true);

			if (!me.fileLocation.valid) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			xml += '<pbjFileLocation';
			xml += ' id="' + me.fileLocations[me.fileLocationGrid.activeRowIndex].fileLocationId + '"';
			xml += ' houseCodeId="' + me.fileLocations[me.fileLocationGrid.activeRowIndex].houseCodeId + '"';
			xml += ' location="' + ui.cmn.text.xml.encode(me.fileLocation.getValue()) + '"';
			xml += '/>';

			me.setStatus("Saving");
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		saveResponseItem: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				me.modified(false);

				if (me.action === "ReportLocation") {
					$(args.xmlNode).find("*").each(function() {
						if (this.tagName === "pbjFileLocation") {
							me.fileLocations[me.fileLocationGrid.activeRowIndex].fileLocationId = parseInt($(this).attr("fileLocationId"), 10);
							me.fileLocations[me.fileLocationGrid.activeRowIndex].location = me.fileLocation.getValue();
							me.fileLocationGrid.body.renderRow(me.fileLocationGrid.activeRowIndex, me.fileLocationGrid.activeRowIndex);
							me.setStatus("Saved");
							$("#pageLoading").fadeOut("slow");
						}
					});
				}
				else {
					me.fileNameStore.reset();
					me.fileNameStore.fetch("userId:[user],type:pbj,year:" + me.years[me.year.indexSelected].title + ",quarter:" + me.quarters[me.quarter.indexSelected].id, me.fileNamesLoaded, me);
				}
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating the data: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		}
	}
});

function main() {
	fin.hcm.pbjReportUi = new fin.hcm.pbjReport.UserInterface();
	fin.hcm.pbjReportUi.resize();
	fin.houseCodeSearchUi = fin.hcm.pbjReportUi;
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.rev.apImport.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.button" , 5);

ii.Class({
    Name: "fin.rev.apImport.UserInterface",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.fileName = "";
				
			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Rev\\APImport";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();

			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			$(window).bind("resize", me, me.resize);

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
		},

		authorizationProcess: function fin_rev_apImport_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;		

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);

			$("#pageLoading").hide();
		},	

		sessionLoaded: function fin_rev_apImport_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;

		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

		},

		actionImportItem: function() {
			var me = this;

			$("#pageHeader").text("AP Import");
			$("#divTaxes").hide();
			$("#iFrameUpload").height(30);
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},
		
		actionCancelItem: function() {
			var me = this;

			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
		},

		actionUploadItem: function() {
			var me = this;

			me.fileName = "";

			$("#messageToUser").text("Upload process will take few minutes, please wait...");
			$("#pageLoading").show();
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();

			me.intervalId = setInterval(function() {

				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "") {
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;
					clearInterval(me.intervalId);

					if (me.fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						$("#pageLoading").hide();
					}
					else {
						me.actionImportSave();
					}
				}
				
			}, 1000);
		},

		actionImportSave: function() {
			var me = this;
			var item = [];

			$("#messageToUser").text("Import process will take few minutes, please wait...");
			$("#pageLoading").show();

			var xml = '<apImport';
				xml += ' fileName="' + me.fileName + '"';
				xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			$("#pageLoading").hide();

			if (status == "success") {
				me.actionCancelItem();
				alert("AP file imported successfully.")
			}
			else {
				alert("[SAVE FAILURE] Error while importing AP File: " + $(args.xmlNode).attr("message"));
			}
		}				
	}
});

function onFileChange() {

	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));

	if (fileExtension.toLowerCase() == ".txt")
		fin.rev.apImportUI.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else {
		alert("Invalid file format. Please select the correct text file.");
		fin.rev.apImportUI.anchorUpload.display(ui.cmn.behaviorStates.disabled);
	}		
}

function main() {

	fin.rev.apImportUI = new fin.rev.apImport.UserInterface();
	fin.rev.apImportUI.resize();
}
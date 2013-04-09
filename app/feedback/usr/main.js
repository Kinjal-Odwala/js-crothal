ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.app.feedback.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );

ii.Class({
    Name: "fin.app.feedback.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Feedback";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.modulesLoaded();

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);	
		},

		authorizationProcess: function fin_app_feedback_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},

		sessionLoaded: function fin_app_feedback_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

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
						me.actionSaveItem();
						processed = true;
						break;

					case 85: // Ctrl+U
						me.actionCancelItem();
						processed = true;
						break;
				}
			}

			if (processed) {
				return false;
			}
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.subject = new ui.ctl.Input.Text({
		        id: "Subject",
				maxLength: 256
		    });
			
			me.subject.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.comments = $("#Comments")[0];

			$("#Comments").keypress(function() {
				if (me.comments.value.length > 7999) {
					me.comments.value = me.comments.value.substring(0, 8000);
					return false;
				}
			});
			
			me.anchorSend = new ui.ctl.buttons.Sizeable({
                id: "AnchorSend",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Send&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionSaveItem(); },
                hasHotState: true
            });
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionCancelItem(); },
                hasHotState: true
            });
		},

		configureCommunications: function() {
			var me = this;

			me.modules = [];
			me.moduleStore = me.cache.register({
				storeId: "modules",
				itemConstructor: fin.app.feedback.Module,
				itemConstructorArgs: fin.app.feedback.moduleArgs,
				injectionArray: me.modules	
			});
		},

		modulesLoaded: function() {
			var me = this;
			
			me.subject.setValue("");
			me.comments.value = "";
			me.subject.resizeText();
			$("#pageLoading").hide();
		},

		actionCancelItem: function () {
			var me = this;

			parent.fin.appUI.hideFeedbackForm();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var browserName = "";
			var browserVersion = "";

			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			if (me.comments.value == "") {
				alert("Please enter the Feedback or Comments.");
				return;
			}
			
			if (navigator.userAgent.search("MSIE") >= 0) {
			    browserName = "Microsoft Internet Explorer";
			    var position = navigator.userAgent.search("MSIE") + 5;
			    var end = navigator.userAgent.search("; Windows");
			    browserVersion = navigator.userAgent.substring(position, end);
			}
			else if (navigator.userAgent.search("Maxthon") >= 0) {
				browserName = "Maxthon";
			    var position = navigator.userAgent.search("Maxthon") + 8;
			    var end = navigator.userAgent.search(" Chrome");
			    browserVersion = navigator.userAgent.substring(position, end);			
			}
			else if (navigator.userAgent.search("Chrome") >= 0) {
				browserName = "Google Chrome";
			    var position = navigator.userAgent.search("Chrome") + 7;
			    var end = navigator.userAgent.search(" Safari");
			    browserVersion = navigator.userAgent.substring(position, end);			
			}
			else if (navigator.userAgent.search("Firefox") >= 0) {
			    browserName = "Mozilla Firefox";
			    var position = navigator.userAgent.search("Firefox") + 8;
			    browserVersion = navigator.userAgent.substring(position);
			}
			else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
			    browserName = "Apple Safari";
			    var position = navigator.userAgent.search("Version") + 8;
			    var end = navigator.userAgent.search(" Safari");
			    browserVersion = navigator.userAgent.substring(position, end);
			}
			else if (navigator.userAgent.search("Opera") >= 0) {
			    browserName = "Opera";
			    var position = navigator.userAgent.search("Version") + 8;
			    browserVersion = navigator.userAgent.substring(position);
			}
			else {
			    browserName = "Other";
			}

			$("#messageToUser").text("Sending");
			$("#pageLoading").show();
			
			var xml = '<appUserFeedback';
			xml += ' id="0"';
			xml += ' userId="' + me.session.propertyGet("userId") + '"';
			xml += ' subject="' + ui.cmn.text.xml.encode(me.subject.getValue()) + '"';
			xml += ' comments="' + ui.cmn.text.xml.encode(me.comments.value) + '"';
			xml += ' moduleName="' + ui.cmn.text.xml.encode(parent.$("#iiMenuHorizontalHeaderTitle").html()) + '"';
			xml += ' browserName="' + browserName + '"';
			xml += ' browserVersion="' + browserVersion + '"';
			xml += ' browserPlatform="' + ui.cmn.text.xml.encode(navigator.platform) + '"';
			xml += ' browserUserAgent="' + ui.cmn.text.xml.encode(navigator.userAgent) + '"';
			xml += ' screenResolution="' + screen.width + " * " + screen.height + '"';
			xml += ' appContentScreenSize="' + parent.$("#appContent").width() + " * " + parent.$("#appContent").height() + '"';
			xml += ' />';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: { me: me, item: item }
			});

			return true;
		},

		saveResponseItem: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			$("#pageLoading").hide();

			if (status == "success") {
				alert("Feedback sent successfully");
				me.actionCancelItem();
			}
			else
				alert("[SAVE FAILURE] Error while sending the feedback: " + $(args.xmlNode).attr("message"));
		}
	}
});

function main() {
	fin.app.feedbackUi = new fin.app.feedback.UserInterface();
	fin.app.feedbackUi.resize();
}
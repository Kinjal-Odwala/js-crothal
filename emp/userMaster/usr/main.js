ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.emp.userMaster.usr.defs" );

ii.Style( "style", 1);
ii.Style( "fin.cmn.usr.common", 2);
ii.Style( "fin.cmn.usr.statusBar", 3);
ii.Style( "fin.cmn.usr.toolbar", 4);
ii.Style( "fin.cmn.usr.tabs", 5);

ii.Class({
    Name: "fin.emp.userMaster.UserInterface",
    Definition: {

        init: function() {
            var me = this;
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

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.session = new ii.Session(me.cache);

			me.personNeedUpdate = false;
			me.userNeedUpdate = true;
			me.modified = false;
			me.activeFrameId = 0;
			me.personId = queryStringArgs["personId"];

			if (queryStringArgs["prevPersonId"] !== undefined)
				me.previousPersonId = parseInt(queryStringArgs["prevPersonId"], 10);
			else
				me.previousPersonId = me.personId;

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Users";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			// Disable the context menu but not on localhost because its used for debugging
			if( location.hostname !== "localhost" ) {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}

			$("#TabCollection a").click(function() {
				fin.userMasterUi.tabSelected(this.id);
			});

			$("#container-1").tabs(1);
			$("#fragment-1").show();
			$("#fragment-2").hide();
			$("#TabCollection li").removeClass("tabs-selected");
			$("#TabPerson").parent().addClass("tabs-selected");
        	$("iframe")[0].src = "/esm/ppl/person/usr/markup.htm?personId=" + me.personId;
			if (parseInt(me.personId, 10) <= 0) {
				$("#TabUser").hide();
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
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var offset = 90;

		    $("#iFramePerson").height($(window).height() - offset);
		    $("#iFrameUser").height($(window).height() - offset);
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save User ( Ctrl+S )",
					title: "Save the current user details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction",
					brief: "New User ( Ctrl+N )",
					title: "Add a new user details.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo User Changes ( Ctrl+U )",
					title: "Undo the changes to user being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})
				.addAction({
					id: "searchAction",
					brief: "Search User",
					title: "Search for existing user.",
					actionFunction: function() { me.actionSearchItem(); }
				});
		},

		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});
			var event = args.event;
			var me = event.data;
			var processed = false;

			if (event.ctrlKey) {
				switch(event.keyCode) {
					case 83:
						me.actionSaveItem();
						processed = true;
						break;

					case 78:
						me.actionNewItem();
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;

					default:
						break;
				}
			}

			if (processed) {
				return false;
			}
		},

		itemModified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;

			me.modified = args.modified;
		},

		getPersonBrief: function() {
			if ($("iframe")[0].contentWindow.esm) {
				return $("iframe")[0].contentWindow.esm.pplPersonUi.personBrief.getValue();
			}

			return "";
		},

		tabSelected: function(tabId) {
			var me = this;

			me.personId = $("iframe")[0].contentWindow.esm.pplPersonUi.personId;

			if (tabId === "TabPerson") {
				me.activeFrameId = 0;
				if (me.personNeedUpdate) {
					me.personNeedUpdate = false;
					$("iframe")[0].src = "/esm/ppl/person/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (tabId === "TabUser") {
				me.activeFrameId = 1;
				if (me.userNeedUpdate) {
					me.userNeedUpdate = false;
					$("iframe")[1].src = "/esm/app/user/usr/markup.htm?personId=" + me.personId;
				}
			}
		},

		showOtherTabs: function() {
			var me = this;

			$("#TabUser").show();
			$("#TabCollection li").removeClass("tabs-selected");
			$("#TabUser").parent().addClass("tabs-selected");
			$("#fragment-" + (me.activeFrameId + 1)).hide();
			$("#fragment-" + (me.activeFrameId + 2)).show();
			me.tabSelected("TabUser");
		},

		actionSaveItem: function() {
			var me = this;

			if (me.activeFrameId === 0)
				$("iframe")[0].contentWindow.esm.pplPersonUi.actionSaveItem();
			else if (me.activeFrameId === 1)
				$("iframe")[1].contentWindow.esm.appUserUi.actionSaveItem();
		},

		actionNewItem: function() {
			var me = this;

			me.personId = 0;
			$("#container-1").tabs(1);
			window.location = "/fin/emp/userMaster/usr/markup.htm?personId=" + me.personId + "&prevPersonId=" + me.previousPersonId;
		},

		actionUndoItem: function() {
			var me = this;

			if (me.activeFrameId === 0) {
				if (me.personId === "0")
					window.location = "/fin/emp/userMaster/usr/markup.htm?personId=" + me.previousPersonId;
				else
					$("iframe")[0].contentWindow.esm.pplPersonUi.actionUndoItem();
			}
			else if (me.activeFrameId === 1)
				$("iframe")[1].src = "/esm/app/user/usr/markup.htm?personId=" + me.personId;
		},

		actionSearchItem: function() {

			window.location = "/fin/emp/userSearch/usr/markup.htm";
		}
    }
});

function main() {
	fin.userMasterUi = new fin.emp.userMaster.UserInterface();
	fin.userMasterUi.resize();
}
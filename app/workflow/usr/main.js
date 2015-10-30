ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.app.workflow.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.grid", 8 );

ii.Class({
    Name: "fin.app.workflow.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.status = "";
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Workflow";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.initialize();
			me.setStatus("Loading");	
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_app_workflow_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.workflowModuleStore.fetch("userId:[user]", me.workflowModulesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	


		sessionLoaded: function fin_app_workflow_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.app.workflowUi;

			if ($("#AssignedUserGridContainer").width() < 850) {
				$("#AssignedUserGrid").width(850);
				$("#header").width(850);
				$("#Paging").width(850);
				me.assignedUserGrid.setHeight($(window).height() - 120);
			}
			else {
				me.assignedUserGrid.setHeight($(window).height() - 105);
			}

			$("#WokkflowStepContainer").height($(window).height() - 90);
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.workflowModule = new ui.ctl.Input.DropDown.Filtered({
				id: "WorkflowModule",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.workflowModuleChanged(); }
		    });

			me.workflowModule.makeEnterTab()
				.setValidationMaster(me.validator)

			me.workflowStep = new ui.ctl.Input.DropDown.Filtered({
				id: "WorkflowStep",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.workflowStepChanged(); }
		    });

			me.workflowStep.makeEnterTab()
				.setValidationMaster(me.validator)

			me.assignedUserGrid = new ui.ctl.Grid({
				id: "AssignedUserGrid",
				appendToId: "divForm"
			});
			
			me.assignedUserGrid.addColumn("userName", "userName", "User Name", "User Name", 150);
			me.assignedUserGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.assignedUserGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.assignedUserGrid.addColumn("email", "email", "Email", "Email", null);
			me.assignedUserGrid.addColumn("active", "active", "Active", "Active", 70, function(active) { return (active == "1" ? "Yes" : "No") });
			me.assignedUserGrid.capColumns();

			me.userGrid = new ui.ctl.Grid({
				id: "UserGrid",
				appendToId: "divForm"		
			});
						
			me.userGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.userGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.app.workflowUi.actionClickItem(this);\"/>";
            });
			me.userGrid.addColumn("userName", "userName", "User Name", "User Name", 150);
			me.userGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.userGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.userGrid.addColumn("email", "email", "Email", "Email", null);
			me.userGrid.capColumns();
			
			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});
			
			me.searchInput.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					if (me.searchInput.getValue() == "")
						this.setInvalid("Please enter search criteria.");
					else
						me.actionSearchItem();
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
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

			me.workflowModules = [];
			me.workflowModuleStore = me.cache.register({
				storeId: "appWorkflowModules",
				itemConstructor: fin.app.workflow.WorkflowModule,
				itemConstructorArgs: fin.app.workflow.workflowModuleArgs,
				injectionArray: me.workflowModules
			});

			me.workflowSteps = [];
			me.workflowStepStore = me.cache.register({
				storeId: "appWorkflowSteps",
				itemConstructor: fin.app.workflow.WorkflowStep,
				itemConstructorArgs: fin.app.workflow.workflowStepArgs,
				injectionArray: me.workflowSteps
			});

			me.appUsers = [];
			me.appUserStore = me.cache.register({
				storeId: "appUsers",
				itemConstructor: fin.app.workflow.User,
				itemConstructorArgs: fin.app.workflow.userArgs,
				injectionArray: me.appUsers
			});
		},

		initialize: function() {
			var me = this;
			
			$("#imgAddUsers").bind("click", function() { me.actionAddItem(); });
			$("#imgEditUser").bind("click", function() { me.actionEditItem(); });
			$("#imgRemoveUser").bind("click", function() { me.actionRemoveItem(); });
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
		
		workflowModulesLoaded: function(me, activeId) {

			me.workflowModule.setData(me.workflowModules);
			me.checkLoadCount();
			me.resize();
		},

		workflowModuleChanged: function() {
			var me = this;
			
			if (me.workflowModule.indexSelected >= 0) {
				me.setLoadCount();
				me.workflowStepStore.fetch("userId:[user],workflowModuleId:" + me.workflowModules[me.workflowModule.indexSelected].id, me.workflowStepsLoaded, me);
			}
		},

		workflowStepsLoaded: function(me, activeId) {

			me.workflowStep.setData(me.workflowSteps);
			me.workflowStep.reset();
			me.assignedUserGrid.setData([]);
			me.checkLoadCount();
			$("#Description").html("");
		},

		workflowStepChanged: function() {
			var me = this;
			
			if (me.workflowStep.indexSelected >= 0) {
				$("#Description").html(me.workflowSteps[me.workflowStep.indexSelected].description);
				me.setLoadCount();
				me.appUserStore.fetch("userId:[user],module:Workflow,id:" + me.workflowSteps[me.workflowStep.indexSelected].id, me.appAssignedUsersLoaded, me);
			}
		},
		
		appAssignedUsersLoaded: function(me, activeId) {

			me.assignedUsers = me.appUsers.slice();
			me.assignedUserGrid.setData(me.assignedUsers);
			me.checkLoadCount();
		},
		
		actionAddItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.workflowModule.indexSelected == -1 || me.workflowStep.indexSelected == -1)
				return;

			loadPopup("popupUser");
			me.userGrid.setData([]);
			me.userGrid.setHeight($("#popupUser").height() - 100);
			me.searchInput.resizeText();
			me.searchInput.setValue("");
			me.searchInput.valid = true;
			me.searchInput.updateStatus();
			$("#popupLoading").fadeOut("slow");
		},
		
		actionSearchItem: function() {
			var me = this;

			if (me.searchInput.getValue() == "") {
				me.searchInput.setInvalid("Please enter search criteria.");
				return;
			}
			
			$("#popupLoading").fadeIn("slow");	
			me.setStatus("Loading");
			me.appUserStore.fetch("userId:[user],module:Workflow" +
				",id:" + me.workflowSteps[me.workflowStep.indexSelected].id + 
				",searchValue:" + me.searchInput.getValue()
				, me.appUsersLoaded, me);
		},
		
		appUsersLoaded: function(me, activeId) {

			me.status = "AddUser";
			me.setStatus("Normal");
			me.userGrid.setData(me.appUsers);
			$("#popupLoading").fadeOut("slow");
		},
		
		actionEditItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.assignedUserGrid.activeRowIndex == -1)
				return;

			me.status = "EditUser";
			me.actionSaveItem();
		},

		actionRemoveItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.assignedUserGrid.activeRowIndex == -1)
				return;

			me.status = "DeleteUser";
			me.actionSaveItem();
		},

		actionClickItem: function(objCheckBox) {
			var me = this;

			me.modified(true);
		},

		actionCancelItem: function() {
			var me = this;
			var index = -1;			

			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup("popupUser");
			me.setStatus("Normal");
			me.status = "";
		},
		
		actionSaveItem: function() {
			var me = this;
			var item = [];

			if (me.status == "AddUser")
				hidePopup("popupUser");

			var xml = me.saveXmlBuild(item);
			
			if (xml == "")
				return true;

			me.setStatus("Saving");
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: {type: fin.app.workflow.WorkflowStep}
			});			
			var me = this;
			var xml = "";

			if (me.status == "AddUser") {
				for (var index = 0; index < me.appUsers.length; index++) {
					if ($("#assignInputCheck" + index)[0].checked) {
						me.assignedUsers.push(new fin.app.workflow.User(0
											 , me.appUsers[index].userId
											 , me.appUsers[index].userName
											 , me.appUsers[index].firstName
											 , me.appUsers[index].lastName
											 , me.appUsers[index].email
											 , true
											 , true)
											 );
						xml += '<appWorkflowUser';
						xml += ' id="0"';
						xml += ' userId="' + me.appUsers[index].userId + '"';
						xml += ' workflowStepId="' + me.workflowSteps[me.workflowStep.indexSelected].id + '"';
						xml += ' active="true"';
						xml += '/>';
					}
				}
			}
			else if (me.status == "EditUser") {
				xml += '<appWorkflowUser';
				xml += ' id="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].id + '"';
				xml += ' userId="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].userId + '"';
				xml += ' workflowStepId="' + me.workflowSteps[me.workflowStep.indexSelected].id + '"';
				xml += ' active="' + !me.assignedUsers[me.assignedUserGrid.activeRowIndex].active + '"';
				xml += '/>';
			}
			else if (me.status == "DeleteUser") {
				xml += '<appWorkflowUserDelete';
				xml += ' id="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].id + '"';
				xml += '/>';
			}

			return xml;
		},

		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function(){
					switch (this.tagName) {
						case "appWorkflowUser":
							if (me.status == "AddUser") {
								var id = parseInt($(this).attr("id"), 10);

								for (var index = 0; index < me.assignedUsers.length; index++) {
									if (me.assignedUsers[index].assigned) {
										if (me.assignedUsers[index].id == 0)
											me.assignedUsers[index].id = id;
										me.assignedUsers[index].assigned = false;
										break;
									}
								}
							}
							else if (me.status == "EditUser") {
								me.assignedUsers[me.assignedUserGrid.activeRowIndex].active = !me.assignedUsers[me.assignedUserGrid.activeRowIndex].active;
								me.assignedUserGrid.body.renderRow(me.assignedUserGrid.activeRowIndex, me.assignedUserGrid.activeRowIndex);
							}
							else if (me.status == "DeleteUser") {
								me.assignedUsers.splice(me.assignedUserGrid.activeRowIndex, 1);
								me.assignedUserGrid.setData(me.assignedUsers);
							}

							break;
					}
				});

				if (me.status == "AddUser") {
					me.assignedUserGrid.setData(me.assignedUsers);
				}
				me.status = "";
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Workflow Step details: " + $(args.xmlNode).attr("message"));
			}	

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function loadPopup(id) {
	centerPopup(id);
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#" + id).fadeIn("slow");
	$("#popupLoading").fadeIn("slow");
}

function hidePopup(id) {
	
	$("#backgroundPopup").fadeOut("slow");
	$("#" + id).fadeOut("slow");
}

function centerPopup(id) {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#" + id).width();
	var popupHeight = $("#" + id).height();

	$("#popupLoading").css({
		"width": popupWidth,
		"height": popupHeight
	});
	
	$("#backgroundPopup").css({
		"height": windowHeight
	});
	
	$("#popupLoading, #" + id).css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
}

function main() {

	fin.app.workflowUi = new fin.app.workflow.UserInterface();
	fin.app.workflowUi.resize();
}
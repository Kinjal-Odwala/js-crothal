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
			var me = this;

			me.action = "";
			me.status = "";
			me.loadCount = 0;
			me.lastSelectedRowIndex = -1;
			me.workflowModulesTemp = [];

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
			me.actionMenuItem("Workflow Users");
			me.setStatus("Loading");
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			ui.cmn.behavior.disableBackspaceNavigation();
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
				me.loadCount = 2;
				me.jdeCompany.fetchingData();
				me.workflowModule.fetchingData();
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
				me.workflowModuleStore.fetch("userId:[user]", me.workflowModulesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.app.workflowUi;

			if (me === undefined)
				return;

			if (me.action === "Workflow Users") {
				if ($("#AssignedUserGridContainer").width() < 850) {
					$("#AssignedUserGrid").width(850);
					$("#gridHeader").width(850);
					$("#Paging").width(850);
					me.assignedUserGrid.setHeight($(window).height() - 140);
				}
				else {
					me.assignedUserGrid.setHeight($(window).height() - 125);
				}

				$("#WokkflowStepContainer").height($(window).height() - 110);
			}
			else if (me.action === "Workflow JDE Company Users") {
				me.jdeCompanyGrid.setHeight($(window).height() - 110);
				$("#ContainerArea").height($(window).height() - 155);
			}
			else if (me.action === "Workflow Hierarchy Users") {
				me.hierarchyGrid.setHeight($(window).height() - 110);
				$("#ContainerArea").height($(window).height() - 155);
			}
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "workflowUserAction",
					brief: "Workflow Users",
					title: "To view or modify the workflow user details.",
					actionFunction: function() { me.actionMenuItem("Workflow Users"); }
				})
				.addAction({
					id: "workflowJDECompanyUserAction",
					brief: "Workflow JDE Company Users",
					title: "To view or modify the workflow JDE company associated user details.",
					actionFunction: function() { me.actionMenuItem("Workflow JDE Company Users"); }
				})
				.addAction({
					id: "workflowHierarchyUserAction",
					brief: "Workflow Hierarchy Level Users",
					title: "To view or modify the workflow hierarchy level associated user details.",
					actionFunction: function() { me.actionMenuItem("Workflow Hierarchy Users"); }
				});

			me.workflowModule = new ui.ctl.Input.DropDown.Filtered({
				id: "WorkflowModule",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.workflowModuleChanged(); }
		    });

			me.workflowModule.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.workflowModule.indexSelected === -1)
					this.setInvalid("Please select the correct Workflow Module.");
			});

			me.workflowStep = new ui.ctl.Input.DropDown.Filtered({
				id: "WorkflowStep",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.workflowStepChanged(); }
		    });

			me.workflowStep.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.workflowStep.indexSelected === -1)
					this.setInvalid("Please select the correct Workflow Step.");
			});

			me.assignedUserGrid = new ui.ctl.Grid({
				id: "AssignedUserGrid",
				appendToId: "divForm"
			});

			me.assignedUserGrid.addColumn("userName", "userName", "User Name", "User Name", 150);
			me.assignedUserGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.assignedUserGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.assignedUserGrid.addColumn("email", "email", "Email", "Email", null);
			me.assignedUserGrid.addColumn("active", "active", "Active", "Active", 70, function(active) { return (active === true ? "Yes" : "No"); });
			me.assignedUserGrid.capColumns();

			me.userGrid = new ui.ctl.Grid({
				id: "UserGrid",
				appendToId: "divForm"
			});

			me.userGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.userGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.app.workflowUi.actionClickItem();\"/>";
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
				.addValidation( function( isFinal, dataMap ) {

					if (me.searchInput.getValue() === "")
						this.setInvalid("Please enter search criteria.");
				});

			me.anchorUserSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorUserSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});

			me.anchorOK = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;&nbsp;OK&nbsp;&nbsp;&nbsp;&nbsp;</span>",
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

			me.jdeCompany = new ui.ctl.Input.DropDown.Filtered({
		        id: "JDECompany",
				formatFunction: function(type) { return type.name; }
		    });

			me.jdeCompany.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.jdeCompany.indexSelected === -1)
					this.setInvalid("Please select the correct JDE Company.");
			});

			me.hierarchyTitle = new ui.ctl.Input.DropDown.Filtered({
		        id: "HierarchyTitle",
				formatFunction: function(type) { return type.title; }
		    });

			me.hierarchyTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.hierarchyTitle.indexSelected === -1)
					this.setInvalid("Please select the correct Hierarchy Title.");
			});

			me.workflowModuleSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "WorkflowModuleSearch",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.workflowModuleChanged(); }
		    });

			me.workflowModuleSearch.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.workflowModuleSearch.indexSelected === -1)
					this.setInvalid("Please select the correct Workflow Module.");
			});

			me.workflowStepSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "WorkflowStepSearch",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.workflowStepChanged(); }
		    });

			me.workflowStepSearch.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (me.workflowStepSearch.indexSelected === -1)
					this.setInvalid("Please select the correct Workflow Step.");
			});

			me.jdeCompanyGrid = new ui.ctl.Grid({
				id: "JDECompanyGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemSelect(index); },
				validationFunction: function() {
					if (me.status !== "New")
						return parent.fin.cmn.status.itemValid();
				}
			});

			me.jdeCompanyGrid.addColumn("name", "name", "Name", "Name", null);
			me.jdeCompanyGrid.addColumn("email", "email", "Email", "Email Id", 350);
			me.jdeCompanyGrid.addColumn("active", "active", "Active", "Active", 100, function(active) { return (active === true ? "Yes" : "No"); });
			me.jdeCompanyGrid.capColumns();

			me.hierarchyGrid = new ui.ctl.Grid({
				id: "HierarchyGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemHierarchySelect(index); },
				validationFunction: function() {
					if (me.status !== "New")
						return parent.fin.cmn.status.itemValid();
				}
			});

			me.hierarchyGrid.addColumn("title", "title", "Hierarchy Title", "Hierarchy Title", null);
			me.hierarchyGrid.addColumn("name", "name", "Name", "Name", 250);
			me.hierarchyGrid.addColumn("email", "email", "Email", "Email Id", 250);
			me.hierarchyGrid.addColumn("active", "active", "Active", "Active", 80, function(active) { return (active === true ? "Yes" : "No"); });
			me.hierarchyGrid.capColumns();

			me.name = new ui.ctl.Input.Text({
		        id: "Name",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.name.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);

			me.email = new ui.ctl.Input.Text({
		        id: "Email",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.email.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.email.getValue();

					if (enteredText === "") return;

					var emailArray = enteredText.split(";");

					for (var index in emailArray) {
						if (!(ui.cmn.text.validate.emailAddress(emailArray[index])))
							this.setInvalid("Please enter valid Email Address. Use semicolon to separate two addresses.");
					}
			});

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				changeFunction: function() { me.modified(); }
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

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
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
				itemConstructor: fin.app.workflow.HirNode,
				itemConstructorArgs: fin.app.workflow.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.app.workflow.JDECompany,
				itemConstructorArgs: fin.app.workflow.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});

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

			me.workflowJDECompanys = [];
			me.workflowJDECompanyStore = me.cache.register({
			storeId: "appWorkflowJDECompanys",
				itemConstructor: fin.app.workflow.WorkflowJDECompany,
				itemConstructorArgs: fin.app.workflow.workflowJDECompanyArgs,
				injectionArray: me.workflowJDECompanys
			});

			me.workflowHierarchys = [];
			me.workflowHierarchyStore = me.cache.register({
			storeId: "appWorkflowHierarchys",
				itemConstructor: fin.app.workflow.WorkflowHierarchy,
				itemConstructorArgs: fin.app.workflow.workflowHierarchyArgs,
				injectionArray: me.workflowHierarchys
			});
		},

		initialize: function() {
			var me = this;

			$("#imgAddUsers").bind("click", function() { me.actionAddItem(); });
			$("#imgEditUser").bind("click", function() { me.actionEditItem(); });
			$("#imgRemoveUser").bind("click", function() { me.actionRemoveItem(); });
			$("#SearchInputText").bind("keydown", me, me.searchInputChanged);
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

		resizeControls: function() {
			var me = this;

			if (me.action === "Workflow Users") {
				me.workflowModule.resizeText();
				me.workflowStep.resizeText();
			}
			else if (me.action === "Workflow JDE Company Users") {
				me.jdeCompany.resizeText();
				me.workflowModuleSearch.resizeText();
				me.workflowStepSearch.resizeText();
				me.name.resizeText();
				me.email.resizeText();
			}
			else if (me.action === "Workflow Hierarchy Users") {
				me.workflowModuleSearch.resizeText();
				me.workflowStepSearch.resizeText();
				me.hierarchyTitle.resizeText();
				me.name.resizeText();
				me.email.resizeText();
			}

			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();

			if (me.action === "Workflow Users") {
				me.workflowModule.reset();
				me.workflowStep.reset();
				me.workflowStep.setData([]);
				me.workflowStep.valid = true;
				me.workflowStep.updateStatus();
				me.assignedUserGrid.setData([]);
				$("#Description").html("");
			}
			else if (me.action === "Workflow JDE Company Users") {
				me.workflowModuleSearch.reset();
				me.workflowStepSearch.reset();
				me.workflowStepSearch.setData([]);
				me.workflowStepSearch.valid = true;
				me.workflowStepSearch.updateStatus();
				me.jdeCompanyGrid.setData([]);
				me.name.setValue("");
				me.email.setValue("");
				me.active.setValue("true");
			}
			else if (me.action === "Workflow Hierarchy Users") {
				me.workflowModuleSearch.reset();
				me.workflowStepSearch.reset();
				me.workflowStepSearch.setData([]);
				me.workflowStepSearch.valid = true;
				me.workflowStepSearch.updateStatus();
				me.hierarchyGrid.setData([]);
				me.hierarchyTitle.reset();
				me.hierarchyTitle.setData([]);
				me.hierarchyTitle.valid = true;
				me.hierarchyTitle.updateStatus();
				me.name.setValue("");
				me.email.setValue("");
				me.active.setValue("true");
			}
		},

		actionMenuItem: function(section) {
			var me = this;
			var index = 0;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.workflowModulesTemp = [];
			me.lastSelectedRowIndex = -1;
			me.action = section;
			me.resetControls();
			me.setStatus("Normal");
			$("#header").html(section);

			if (me.action === "Workflow Users") {
				$("#WorkflowJDECompanies").hide();
				$("#WorkflowUsers").show();
			}
			else if (me.action === "Workflow JDE Company Users") {
				$("#WorkflowUsers").hide();
				$("#WorkflowJDECompanies").show();
				$("#JDECompanyContainer").show();
				$("#JDECompanyGrid").show();
				$("#HierarchyLevelContainer").hide();
				$("#HierarchyGrid").hide();

				for (index = 0; index < me.workflowModules.length; index++) {
					if (me.workflowModules[index].id === 2 || me.workflowModules[index].id === 3)
						me.workflowModulesTemp.push(new fin.app.workflow.WorkflowModule(me.workflowModules[index].id, me.workflowModules[index].title));
				}
				me.workflowModuleSearch.setData(me.workflowModulesTemp);
				me.workflowModuleSearch.reset();
				me.workflowModuleSearch.updateStatus();
			}
			else if (me.action === "Workflow Hierarchy Users") {
				$("#WorkflowUsers").hide();
				$("#WorkflowJDECompanies").show();
				$("#JDECompanyContainer").hide();
				$("#JDECompanyGrid").hide();
				$("#HierarchyLevelContainer").show();
				$("#HierarchyGrid").show();

				for (index = 0; index < me.workflowModules.length; index++) {
					if (me.workflowModules[index].id === 3)
						me.workflowModulesTemp.push(new fin.app.workflow.WorkflowModule(me.workflowModules[index].id, me.workflowModules[index].title));
				}
				me.workflowModuleSearch.setData(me.workflowModulesTemp);
				me.workflowModuleSearch.select(0, me.workflowModuleSearch.focused);
				me.workflowModuleChanged();
			}

			me.resizeControls();
		},

		jdeCompanysLoaded: function(me, activeId) {

			me.jdeCompany.setData(me.jdeCompanys);
			me.jdeCompany.select(0, me.jdeCompany.focused);
			me.checkLoadCount();
		},

		workflowModulesLoaded: function(me, activeId) {

			me.workflowModule.setData(me.workflowModules);
			me.workflowModule.reset();
			me.workflowModule.updateStatus();
			me.checkLoadCount();
			me.resize();
		},

		workflowModuleChanged: function() {
			var me = this;

			if (me.action === "Workflow Users") {
				if (me.workflowModule.indexSelected >= 0) {
					me.workflowStep.fetchingData();
					me.workflowStepStore.fetch("userId:[user],workflowModuleId:" + me.workflowModules[me.workflowModule.indexSelected].id, me.workflowStepsLoaded, me);
				}
			}
			else if (me.action === "Workflow JDE Company Users") {
				if (me.workflowModuleSearch.indexSelected >= 0) {
					me.workflowStepSearch.fetchingData();
					me.workflowStepStore.fetch("userId:[user],workflowModuleId:" + me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id + ",addJDECompanyUser:1", me.workflowStepsLoaded, me);
				}
			}
			else if (me.action === "Workflow Hierarchy Users" && me.workflowModuleSearch.indexSelected >= 0) {
				me.workflowStepSearch.fetchingData();
				me.workflowStepStore.fetch("userId:[user],workflowModuleId:" + me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id + ",addHierarchyUser:1", me.workflowStepsLoaded, me);
			}
		},

		workflowStepsLoaded: function(me, activeId) {

			if (me.action === "Workflow Users") {
				me.workflowStep.setData(me.workflowSteps);
				me.workflowStep.reset();
				me.workflowStep.updateStatus();
				me.assignedUserGrid.setData([]);
				$("#Description").html("");
			}
			else if (me.action === "Workflow JDE Company Users") {
				me.workflowStepSearch.setData(me.workflowSteps);
				me.workflowStepSearch.reset();
				me.workflowStepSearch.updateStatus();
				me.jdeCompanyGrid.setData([]);
			}
			else if (me.action === "Workflow Hierarchy Users") {
				me.workflowStepSearch.setData(me.workflowSteps);
				me.workflowStepSearch.reset();
				me.workflowStepSearch.updateStatus();
				me.hierarchyGrid.setData([]);
			}
		},

		workflowStepChanged: function() {
			var me = this;

			if (me.action === "Workflow Users") {
				if (me.workflowStep.indexSelected >= 0) {
					$("#Description").html(me.workflowSteps[me.workflowStep.indexSelected].description);
					if (me.workflowSteps[me.workflowStep.indexSelected].addWorkflowUser)
						$("#Paging").show();
					else
						$("#Paging").hide();
					me.setLoadCount();
					me.appUserStore.fetch("userId:[user],module:Workflow,id:" + me.workflowSteps[me.workflowStep.indexSelected].id, me.appAssignedUsersLoaded, me);
				}
			}
			else if (me.action === "Workflow JDE Company Users") {
				if (me.jdeCompany.indexSelected >= 0 && me.workflowModuleSearch.indexSelected >= 0 && me.workflowStepSearch.indexSelected >= 0) {
					var jdeCompanyId = me.jdeCompanys[me.jdeCompany.indexSelected].id;
					var workflowModuleId = me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id;
					var workflowStepId = me.workflowSteps[me.workflowStepSearch.indexSelected].id;
					me.setLoadCount();
					me.workflowJDECompanyStore.fetch("userId:[user],jdeCompanyId:" + jdeCompanyId + ",workflowModuleId:" + workflowModuleId + ",workflowStepId:" + workflowStepId, me.workflowJDECompanysLoaded, me);
				}
			}
			else if (me.action === "Workflow Hierarchy Users") {
				if (me.workflowModuleSearch.indexSelected >= 0 && me.workflowStepSearch.indexSelected >= 0) {
					me.setLoadCount();
					me.hirNodeStore.reset();
					me.hierarchyTitle.fetchingData();
					if (me.workflowSteps[me.workflowStepSearch.indexSelected].brief === "Step 2")
						me.hirNodeStore.fetch("userId:[user],levelBrief:RVP", me.hirNodesLoaded, me);
					else
						me.hirNodeStore.fetch("userId:[user],levelBrief:DVP", me.hirNodesLoaded, me);
				}
			}
		},

		appAssignedUsersLoaded: function(me, activeId) {

			me.assignedUsers = me.appUsers.slice();
			me.assignedUserGrid.setData(me.assignedUsers);
			me.checkLoadCount();
		},

		workflowJDECompanysLoaded: function(me, activeId) {

			me.jdeCompanyGrid.setData(me.workflowJDECompanys);
			me.validator.reset();
			me.name.setValue("");
			me.email.setValue("");
			me.active.setValue("true");
			me.checkLoadCount();
		},

		hirNodesLoaded: function(me, activeId) {

			me.hierarchyTitle.setData(me.hirNodes);
			me.hierarchyTitle.reset();
			me.hierarchyTitle.updateStatus();

			var workflowModuleId = me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id;
			var workflowStepId = me.workflowSteps[me.workflowStepSearch.indexSelected].id;
			me.workflowHierarchyStore.fetch("userId:[user],workflowModuleId:" + workflowModuleId + ",workflowStepId:" + workflowStepId, me.workflowHierarchysLoaded, me);
		},

		workflowHierarchysLoaded: function(me, activeId) {

			for (var index = 0; index < me.workflowHierarchys.length; index++) {
				var itemIndex = ii.ajax.util.findIndexById(me.workflowHierarchys[index].nodeId.toString(), me.hirNodes);
				if (itemIndex !== undefined)
					me.workflowHierarchys[index].title = me.hirNodes[itemIndex].title;
			}

			me.hierarchyGrid.setData(me.workflowHierarchys);
			me.validator.reset();
			me.name.setValue("");
			me.email.setValue("");
			me.active.setValue("true");
			me.checkLoadCount();
		},

		actionAddItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.workflowModule.indexSelected === -1 || me.workflowStep.indexSelected === -1)
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

		searchInputChanged: function() {
			var args = ii.args(arguments, {
				event: {type: Object}
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode === 13) {
				me.loadAppUsers();
			}
		},

		actionSearchItem: function() {
			var me = this;

			if (me.action === "Workflow Users")
				me.loadAppUsers();
			else if (me.action === "Workflow JDE Company Users" || me.action === "Workflow Hierarchy Users")
				me.workflowStepChanged();
		},

		loadAppUsers: function() {
			var me = this;

			if (me.searchInput.getValue() === "") {
				me.searchInput.setInvalid("Please enter search criteria.");
				return;
			}

			$("#popupLoading").fadeIn("slow");
			me.setStatus("Loading");
			me.appUserStore.fetch("userId:[user],module:Workflow" +	",id:" + me.workflowSteps[me.workflowStep.indexSelected].id + ",searchValue:" + me.searchInput.getValue(), me.appUsersLoaded, me);
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

			if (me.assignedUserGrid.activeRowIndex === -1)
				return;

			me.status = "EditUser";
			me.actionSaveItem();
		},

		actionRemoveItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.assignedUserGrid.activeRowIndex === -1)
				return;

			me.status = "DeleteUser";
			me.actionSaveItem();
		},

		actionClickItem: function() {
			var me = this;

			me.modified(true);
		},

		actionCancelItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup("popupUser");
			me.setStatus("Normal");
			me.status = "";
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;
			var index = args.index;

			me.status = "";
			me.setStatus("Normal");

			if (me.jdeCompanyGrid.data[index] !== undefined) {
				me.lastSelectedRowIndex = me.jdeCompanyGrid.activeRowIndex;
				me.name.setValue(me.jdeCompanyGrid.data[index].name);
				me.email.setValue(me.jdeCompanyGrid.data[index].email);
				me.active.setValue(me.jdeCompanyGrid.data[index].active.toString());
			}
		},

		itemHierarchySelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;
			var index = args.index;

			me.status = "";
			me.setStatus("Normal");

			if (me.hierarchyGrid.data[index] !== undefined) {
				me.lastSelectedRowIndex = me.hierarchyGrid.activeRowIndex;
				var itemIndex = ii.ajax.util.findIndexById(me.hierarchyGrid.data[index].nodeId.toString(), me.hirNodes);
				if (itemIndex !== undefined)
					me.hierarchyTitle.select(itemIndex, me.hierarchyTitle.focused);
				me.name.setValue(me.hierarchyGrid.data[index].name);
				me.email.setValue(me.hierarchyGrid.data[index].email);
				me.active.setValue(me.hierarchyGrid.data[index].active.toString());
			}
		},

		actionNewItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.validator.reset();
			if (me.action === "Workflow JDE Company Users") {
				me.jdeCompanyGrid.body.deselectAll();
			}
			else if (me.action === "Workflow Hierarchy Users") {
				me.hierarchyGrid.body.deselectAll();
				me.hierarchyTitle.reset();
			}

			me.name.setValue("");
			me.email.setValue("");
			me.active.setValue("true");
			me.status = "New";
			me.setStatus("Normal");
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.lastSelectedRowIndex >= 0) {
				if (me.action === "Workflow JDE Company Users") {
					me.jdeCompanyGrid.body.select(me.lastSelectedRowIndex);
					me.itemSelect(me.lastSelectedRowIndex);
				}
				else if (me.action === "Workflow Hierarchy Users") {
					me.hierarchyGrid.body.select(me.lastSelectedRowIndex);
					me.itemHierarchySelect(me.lastSelectedRowIndex);
				}
			}

			me.status = "";
			me.setStatus("Normal");
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];

			if (me.status === "AddUser")
				hidePopup("popupUser");
			else if (me.status === "New" || me.status === "") {
				if (me.action === "Workflow JDE Company Users") {
					if (me.status === "" && me.jdeCompanyGrid.activeRowIndex === -1)
						return;
					// Check to see if the data entered is valid
					me.validator.forceBlur();
					me.validator.queryValidity(true);

					if (!me.jdeCompany.valid || !me.workflowModuleSearch.valid || !me.workflowStepSearch.valid || !me.name.valid || !me.email.valid) {
						alert("In order to save, the errors on the page must be corrected.");
						return false;
					}

					item = new fin.app.workflow.WorkflowJDECompany(me.status === "New" ? 0 : me.workflowJDECompanys[me.jdeCompanyGrid.activeRowIndex].id
						, me.jdeCompanys[me.jdeCompany.indexSelected].id
						, me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id
						, me.workflowSteps[me.workflowStepSearch.indexSelected].id
						, me.name.getValue()
						, me.email.getValue()
						, me.status === "New" ? me.workflowJDECompanys.length + 1 : me.workflowJDECompanys[me.jdeCompanyGrid.activeRowIndex].displayOrder
						, me.active.check.checked
						);
				}
				else if (me.action === "Workflow Hierarchy Users") {
					if (me.status === "" && me.hierarchyGrid.activeRowIndex === -1)
						return;
					// Check to see if the data entered is valid
					me.validator.forceBlur();
					me.validator.queryValidity(true);

					if (!me.workflowModuleSearch.valid || !me.workflowStepSearch.valid || !me.hierarchyTitle.valid || !me.name.valid || !me.email.valid){
						alert("In order to save, the errors on the page must be corrected.");
						return false;
					}

					item = new fin.app.workflow.WorkflowHierarchy(me.status === "New" ? 0 : me.workflowHierarchys[me.hierarchyGrid.activeRowIndex].id
						, me.hirNodes[me.hierarchyTitle.indexSelected].id
						, me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id
						, me.workflowSteps[me.workflowStepSearch.indexSelected].id
						, me.hirNodes[me.hierarchyTitle.indexSelected].title
						, me.name.getValue()
						, me.email.getValue()
						, me.status === "New" ? me.workflowHierarchys.length + 1 : me.workflowHierarchys[me.hierarchyGrid.activeRowIndex].displayOrder
						, me.active.check.checked
						);
				}
			}

			var xml = me.saveXmlBuild();

			if (xml === "")
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
			var me = this;
			var xml = "";

			if (me.status === "AddUser") {
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
			else if (me.status === "EditUser") {
				xml += '<appWorkflowUser';
				xml += ' id="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].id + '"';
				xml += ' userId="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].userId + '"';
				xml += ' workflowStepId="' + me.workflowSteps[me.workflowStep.indexSelected].id + '"';
				xml += ' active="' + !me.assignedUsers[me.assignedUserGrid.activeRowIndex].active + '"';
				xml += '/>';
			}
			else if (me.status === "DeleteUser") {
				xml += '<appWorkflowUserDelete';
				xml += ' id="' + me.assignedUsers[me.assignedUserGrid.activeRowIndex].id + '"';
				xml += '/>';
			}
			else if (me.status === "New" || me.status === "") {
				if (me.action === "Workflow JDE Company Users") {
					xml += '<appWorkflowJDECompany';
					xml += ' id="' + (me.status === "New" ? 0 : me.workflowJDECompanys[me.jdeCompanyGrid.activeRowIndex].id) + '"';
					xml += ' jdeCompanyId="' + me.jdeCompanys[me.jdeCompany.indexSelected].id + '"';
					xml += ' workflowModuleId="' + me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id + '"';
					xml += ' workflowStepId="' + me.workflowSteps[me.workflowStepSearch.indexSelected].id + '"';
					xml += ' name="' + ui.cmn.text.xml.encode(me.name.getValue()) + '"';
					xml += ' email="' + ui.cmn.text.xml.encode(me.email.getValue()) + '"';
					xml += ' displayOrder="' + (me.status === "New" ? me.workflowJDECompanys.length + 1 : me.workflowJDECompanys[me.jdeCompanyGrid.activeRowIndex].displayOrder) + '"';
					xml += ' active="' + me.active.check.checked + '"';
					xml += '/>';
				}
				else if (me.action === "Workflow Hierarchy Users") {
					xml += '<appWorkflowHierarchy';
					xml += ' id="' + (me.status === "New" ? 0 : me.workflowHierarchys[me.hierarchyGrid.activeRowIndex].id) + '"';
					xml += ' nodeId="' +  me.hirNodes[me.hierarchyTitle.indexSelected].id + '"';
					xml += ' workflowModuleId="' + me.workflowModuleSearch.data[me.workflowModuleSearch.indexSelected].id + '"';
					xml += ' workflowStepId="' + me.workflowSteps[me.workflowStepSearch.indexSelected].id + '"';
					xml += ' name="' + ui.cmn.text.xml.encode(me.name.getValue()) + '"';
					xml += ' email="' + ui.cmn.text.xml.encode(me.email.getValue()) + '"';
					xml += ' displayOrder="' + (me.status === "New" ? me.workflowHierarchys.length + 1 : me.workflowHierarchys[me.hierarchyGrid.activeRowIndex].displayOrder) + '"';
					xml += ' active="' + me.active.check.checked + '"';
					xml += '/>';
				}
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

			if (status === "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function(){
					switch (this.tagName) {
						case "appWorkflowUser":
							if (me.status === "AddUser") {
								var id = parseInt($(this).attr("id"), 10);

								for (var index = 0; index < me.assignedUsers.length; index++) {
									if (me.assignedUsers[index].assigned) {
										if (me.assignedUsers[index].id === 0)
											me.assignedUsers[index].id = id;
										me.assignedUsers[index].assigned = false;
										break;
									}
								}
							}
							else if (me.status === "EditUser") {
								me.assignedUsers[me.assignedUserGrid.activeRowIndex].active = !me.assignedUsers[me.assignedUserGrid.activeRowIndex].active;
								me.assignedUserGrid.body.renderRow(me.assignedUserGrid.activeRowIndex, me.assignedUserGrid.activeRowIndex);
							}
							else if (me.status === "DeleteUser") {
								me.assignedUsers.splice(me.assignedUserGrid.activeRowIndex, 1);
								me.assignedUserGrid.setData(me.assignedUsers);
							}

							break;

						case "appWorkflowJDECompany":
							if (me.status === "New") {
								item.id = parseInt($(this).attr("id"), 10);
								me.workflowJDECompanys.push(item);
								me.lastSelectedRowIndex = me.workflowJDECompanys.length - 1;
								me.jdeCompanyGrid.setData(me.workflowJDECompanys);
								me.jdeCompanyGrid.body.select(me.lastSelectedRowIndex);
							}
							else {
								me.workflowJDECompanys[me.lastSelectedRowIndex] = item;
								me.jdeCompanyGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							break;

						case "appWorkflowHierarchy":
							if (me.status === "New") {
								item.id = parseInt($(this).attr("id"), 10);
								me.workflowHierarchys.push(item);
								me.lastSelectedRowIndex = me.workflowHierarchys.length - 1;
								me.hierarchyGrid.setData(me.workflowHierarchys);
								me.hierarchyGrid.body.select(me.lastSelectedRowIndex);
							}
							else {
								me.workflowHierarchys[me.lastSelectedRowIndex] = item;
								me.hierarchyGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							break;
					}
				});

				if (me.status === "AddUser") {
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
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.app.hierarchy.usr.defs" );
ii.Import( "fin.cmn.usr.treeView" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.treeview", 8 );
ii.Style( "fin.cmn.usr.grid", 9 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.mouse", function() { mouseLoaded(); }); 
}

function mouseLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.draggable", function() { draggableLoaded(); });
}

function draggableLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.droppable", function() { importCompleted = true; });
}

ii.Class({
    Name: "fin.app.hierarchy.UserInterface",
    Definition: {
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodesList = [];
			me.hirNodesTemp = [];
			me.unitsList = [];
			me.levels = [];
			me.removedUnits = [];
			me.hirNode = 0;
			me.hirNodeCurrentId = 0;
			me.selectedNodeId = 0;
			me.selectedNode = null;
			me.dropped = false;
			me.loadAncestors = false;
			me.moveSearchedNodes = false;
			me.searchUnit = false;
			me.searchSingleUnit = false;
			me.searchNode = false;
			me.levelClass = "";
			me.nodeAction = "";
			me.preview = false;
			me.expand = false;
			me.loadCount = 0;
			me.actionSave = false;
			me.fileName = "";
			me.cellColorValid = "";
			me.cellColorInvalid = "red";

			me.levels["ENT"] = "";
			me.levels["SVP"] = "ENT";
			me.levels["DVP"] = "SVP";
			me.levels["RVP"] = "DVP";
			me.levels["SRM"] = "RVP";
			me.levels["RM"] = "SRM";
			me.levels["AM"] = "RM";
			me.levels["UNIT"] = "AM";

			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?

			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			me.hierarchy = new ii.ajax.Hierarchy( me.gateway );

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\HirManagement";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			me.session.displaySetStandard();

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);	

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);
			$("#divHouseCodeGrid").bind("scroll", me.houseCodeGridScroll);
			$("#ulEdit0").bind("contextmenu", me, me.contextMenuProcessor);
			$("#chkSelectAll").click(function () {
				$("input[id^='chkNodeM']").attr("checked", this.checked);
			});

			ii.trace("Hierarchy Nodes Loading", ii.traceTypes.Information, "Info");
			me.hierarchyTreeMouseDownEventSetup();
			me.movableNodeEventSetup();			
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},

		contextMenuProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;

			if (me.isReadOnly)
				return;

		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;

		    if (me.replaceContext) {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft : document.documentElement.scrollLeft;

				scrollTop -= 10;

				var offset = $("#hirContainer").offset();						
				var bottom = offset.top + $("#hirContainer").height();

				if (event.clientY + scrollTop + $("#HierarchyContext").height() > bottom)
					scrollTop = (scrollTop + (bottom - event.clientY)) - ($("#HierarchyContext").height() - 20);

				var contextMenu = document.getElementById("HierarchyContext");

				contextMenu.style.top = event.clientY + scrollTop + "px";
				contextMenu.style.left = event.clientX + scrollLeft + "px";
				contextMenu.style.display = "";			

		        me.replaceContext = false;

		        return false;
		    }
		},

		mouseDownProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}	// The (mousedown) event object
			});
			var event = args.event;
			var me = event.data;

			if (event.button == 2) {
				if (event.target.tagName == "SPAN") {
					me.selectedNode = event.target;
					me.selectedNodeId = parseInt(event.target.id.replace("span", ""));
					me.replaceContext = true;
				}					
				else {					
					// Disable the context menu but not on localhost because its used for debugging
					if (location.hostname != "localhost") {
						$(document).bind("contextmenu", function(event) {
							return false;
						});
					}
					$("#HierarchyContext").hide();
				}
			}			
			else if (!me.mouseOverContext)				
				$("#HierarchyContext").hide();
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
						me.actionSaveSnapshot();
						processed = true;
						break;

					case 85: // Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}

			if (processed) {
				return false;
			}
		},

		authorizationProcess: function fin_app_hierarchy_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.isReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");			

			if (me.isReadOnly) {
				$("#actionMenu").hide();
				$("#AnchorSave").hide();
				$("#AnchorCommit").hide();
				$("#AnchorUndo").hide();
				$("#hierarchyAreaRight").hide();
			}
			
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
            	me.session.registerFetchNotify(me.sessionLoaded, me);
				me.level.fetchingData();
				me.hirLevelStore.fetch("userId:[user],hierarchy:2", me.hirLevelsLoaded, me);
				me.roleNodeStore.fetch("userId:[user],roleId:" + me.session.propertyGet("roleId"), me.roleNodesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_app_hierarchy_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function fin_app_hierarchy_UserInterface_resize() {
			var me = fin.hierarchyUi;

			$("#hirContainer").height($(window).height() - 155);
			me.setUnitContainerHeight();
			
			var divGridWidth = $(window).width() - 22;
			var divGridHeight = $(window).height() - 125;

			$("#divHouseCodeGrid").css({"width" : divGridWidth + "px", "height" : divGridHeight + "px"});
		},
		
		houseCodeGridScroll: function() {
		    var scrollLeft = $("#divHouseCodeGrid").scrollLeft();
		    
			$("#tblHouseCodeGridHeader").css("left", -scrollLeft + "px");
		},

		defineFormControls: function fin_app_hierarchy_UserInterface_defineFormControls() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "getVersionAction",
					brief: "Get Original Version",
					title: "Get the original version of Hierarchy.",
					actionFunction: function() { me.actionGetVersionItem(); }
				})
				.addAction({
					id: "hierarchyUpdateAction",
					brief: "View / Edit Hierarchy",
					title: "View or edit the Hierarchy.",
					actionFunction: function() { me.actionHierarchyUpdateItem(); }
				})
				.addAction({
					id: "bulkHierarchyUpdateAction",
					brief: "Bulk Hierarchy Update",
					title: "Upload a sheet and change the Hierarchy of existing house codes.",
					actionFunction: function() { me.actionBulkHierarchyUpdateItem(); }
				});

			$("#ulEdit0").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true,
				toggle: function() { me.setUnitContainerHeight(); }
	        });

			$("#ulEditM").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true
	        });
			
			$("#ulEditP").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: false
	        });

			me.brief = new ui.ctl.Input.Text({
		        id: "Brief",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.brief.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					me.actionValidateItem();
				});

			me.title = new ui.ctl.Input.Text({
		        id: "Title",
				maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.title.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					me.actionValidateItem();
				});

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				changeFunction: function() { me.modified(); }
		    });

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchLoad(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save Snapshot&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveSnapshot(); },
				hasHotState: true
			});

			me.anchorPreview = new ui.ctl.buttons.Sizeable({
				id: "AnchorPreview",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Preview Snapshot&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPreviewSnapshot(); },
				hasHotState: true
			});

			me.anchorCommit = new ui.ctl.buttons.Sizeable({
				id: "AnchorCommit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save & Commit&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveAndCommit(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorSaveNode = new ui.ctl.buttons.Sizeable({
				id: "AnchorSaveNode",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveNode(); },
				hasHotState: true
			});

			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});

			me.anchorRemove = new ui.ctl.buttons.Sizeable({
				id: "AnchorRemove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Remove&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionRemoveItem(); },
				hasHotState: true
			});

			me.anchorPrint = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrint",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Print&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrintItem(); },
				hasHotState: true
			});

			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionClosePreview(); },
				hasHotState: true
			});

			me.appUnit = new ui.ctl.Input.Text({
		        id: "AppUnit",
				maxLength: 1024,
				title: "To search a specific Unit in the following Hierarchy, type-in Unit# (1455, 900000) and press Enter key/click Search button."
		    });

			me.level = new ui.ctl.Input.DropDown.Filtered({
		        id: "Level",
				formatFunction: function( type ) { return type.title; }
		    });

			me.level.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.level.indexSelected == -1)
						this.setInvalid("Please select the correct Level.");
				});

			me.nodeGrid = new ui.ctl.Grid({
				id: "NodeGrid"
			});

			me.nodeGrid.addColumn("brief", "brief", "Brief", "Brief", 150);
			me.nodeGrid.addColumn("title", "title", "Title", "Title", null);
			me.nodeGrid.capColumns();

			me.anchorOK = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});
			
			me.anchorClosePopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorClosePopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloseNodesListPopup(); },
				hasHotState: true
			});
			
			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});
			
			me.anchorUploadCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorUploadCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadCanceItem(); },
				hasHotState: true
			});
			
			me.anchorValidate = new ui.ctl.buttons.Sizeable({
				id: "AnchorValidate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Validate&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBulkValidateItem(false); },
				hasHotState: true
			});
			
			me.anchorBulkSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorBulkSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBulkValidateItem(true); },
				hasHotState: true
			});

			$("#AppUnitText").bind("keydown", me, me.actionSearchItem);
			$("#LevelText").bind("keydown", me, me.actionSearchItem);
		},

		configureCommunications: function fin_app_hierarchy_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirLevels = [];
			me.hirLevelStore = me.cache.register({
				storeId: "hirLevels",
				itemConstructor: fin.app.hierarchy.HirLevel,
				itemConstructorArgs: fin.app.hierarchy.hirLevelArgs,
				injectionArray: me.hirLevels
			});

			me.roleNodes = [];
			me.roleNodeStore = me.cache.register({
				storeId: "roleNodes",
				itemConstructor: fin.app.hierarchy.RoleNode,
				itemConstructorArgs: fin.app.hierarchy.roleNodeArgs,
				injectionArray: me.roleNodes
			});

//			me.hierarchyNodes = [];
//			me.hierarchyNodeStore = me.cache.register({
//				storeId: "hirNodes",
//				itemConstructor: fin.app.hierarchy.HierarchyNode,
//				itemConstructorArgs: fin.app.hierarchy.hierarchyNodeArgs,
//				injectionArray: me.hierarchyNodes	
//			});

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodeSnapshots",
				itemConstructor: fin.app.hierarchy.HirNode,
				itemConstructorArgs: fin.app.hierarchy.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.app.hierarchy.HouseCode,
				itemConstructorArgs: fin.app.hierarchy.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.bulkImportValidations = [];
			me.bulkImportValidationStore = me.cache.register({
				storeId: "houseCodeImportValidations",
				itemConstructor: fin.app.hierarchy.BulkImportValidation,
				itemConstructorArgs: fin.app.hierarchy.bulkImportValidationArgs,
				injectionArray: me.bulkImportValidations
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
		
		hierarchyTreeMouseDownEventSetup: function() {
			var me = this;
			
			$("#HierarchyContextMenu tr:odd").addClass("gridRow");
        	$("#HierarchyContextMenu tr:even").addClass("alternateGridRow");

			$("#HierarchyContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});

				$("#HierarchyContextMenu tr").click(function() {

				if (this.id == "menuAdd")
					me.addNode();
				else if (this.id == "menuEdit")
					me.editNode();
				else if (this.id == "menuDelete")
					me.deleteNode();
				else if (this.id == "menuCut")
					me.cutNode();
				else if (this.id == "menuPaste")
					me.pasteNode();
					
				$("#HierarchyContext").hide();
			});

			$("#HierarchyContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},

		movableNodeEventSetup: function() {
			var me = this;

			$("#unitContainer").droppable({
				drop: function(event, ui) {
					if (ui.draggable[0].id == "ulEditM")
						return;

					me.dropMovableNode($(this)[0]);

					if (me.dropped)
						ui.draggable.draggable("option", "revert", false);
				}
			});

			$("#ulEditM").draggable({
				revert: true,
				opacity: .50,
				containment: [0, 0, 0, 0],
				helper: function(event) {
					if ($("#ulEditM")[0] != undefined) {
						var checkedNodes = $("input[id^='chkNodeM']:checked");
						var html = "<div><ul id='ulEditM' class='treeview'>";

						for (var index = 0; index < checkedNodes.length; index++) {
							var id = parseInt(checkedNodes[index].id.replace("chkNodeM", ""));
							var liNode = $("#liNodeM" + id)[0];
							html += "<li id='" + liNode.id + "' class='" + liNode.className + "'>" + liNode.innerHTML + "</li>";
						}
						html += "</ul></div>";
				 		return html;
					}
				},
				start: function(event, ui) {
					var offset = $("#hirContainer").offset();
					var region = [];

					region[0] = offset.left;
					region[1] = offset.top;
					region[2] = offset.left + $("#hirContainer").width() - 400;
					region[3] = offset.top + $("#hirContainer").height() - 10;
					$(this).data("draggable").containment = region;
					$(this).draggable("option", "revert", true);
					me.moveSearchedNodes = true;
					me.dropped = false;
				},
				drag: function(event, ui) {
					var offset = $("#hirContainer").offset();

					if (ui.offset.top - 20 < offset.top)
						$("#hirContainer").scrollTop($("#hirContainer").scrollTop() - 20);
					else if (ui.offset.top + 36 > (offset.top + $("#hirContainer").height()))
						$("#hirContainer").scrollTop($("#hirContainer").scrollTop() + 20);
				},
				stop: function(event, ui) {
					if (me.dropped) {

						if (me.unitsList.length == 0) {
							$("#ulEditM").empty();
						}
						else {
							for (var index = 0; index < me.removedUnits.length; index++) {
								me.actionNodeRemove($("#liNodeM" + me.removedUnits[index])[0]);
							}
						}

						me.removedUnits = [];
						me.dropped = false;
					}
				}
			});
		},

		dropMovableNode: function(node) {
			var me = this;
			var id = parseInt(me.selectedNode.id.replace("liNode", ""));
			var nodeIndex = me.getNodeIndex(id);
			var found = false;

			if (nodeIndex == -1 || me.hirNodesList[nodeIndex].levelBrief.toUpperCase() != "UNIT")
				return;

			me.dropped = true;

			var count  = me.selectedNode.childNodes.length;
			$(me.selectedNode.childNodes[count - 1]).remove();

			for (var index = 0; index < me.unitsList.length; index++) {
				if (me.unitsList[index].hirNode == id) {
					found = true;
					break;
				}
			}

			if (!found) {
				me.unitsList.push(me.hirNodesList[nodeIndex]);
				me.actionMovableNodeAppend(id, me.hirNodesList[nodeIndex].title);
			}
		},

		actionMovableNodeAppend: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirNodeTitle: {type: String}
			});
			var me = this;

            nodeHtml = "<li id='liNodeM" + args.hirNode + "'>"
				+ "<input type='checkbox' id='chkNodeM" + args.hirNode + "' style='width:16px' onclick='fin.hierarchyUi.actionClickItem(this);' />"
				+ "<span id='spanM" + args.hirNode + "' class='mUnit'>" + args.hirNodeTitle + "</span></li>";

	        var treeNode = $(nodeHtml).appendTo("#ulEditM");
            $("#ulEditM").treeview({add: treeNode});
		},

		resizeControls: function() {
			var me = this;
			
			me.appUnit.resizeText();		
			me.resize();
		},

		setUnitContainerHeight: function() {
			var me = this;

			$("#unitContainer").height($(window).height() - 230);

			if ($("#hirContainer")[0].scrollHeight > ($("#hirContainer").height() + 20)) {
				var height = ($("#hirContainer")[0].scrollHeight) - $("#hirContainer").height();
				$("#unitContainer").height($(window).height() + height - 230);
			}
		},

 		hirLevelsLoaded: function fin_app_UserInterface_hirLevelsLoaded(me, activeId) {

			hirLevelsTemp = me.hirLevels.slice();
			hirLevelsTemp.splice(0, 1);
			hirLevelsTemp.splice(0, 1);
			me.level.setData(hirLevelsTemp);
			me.level.select(5, me.level.focused);
		},

		roleNodesLoaded: function(me, activeId) {

			me.setLoadCount();
			//me.hierarchyNodeStore.fetch("userId:[user],hierarchy:2,", me.hierarchyNodesLoaded, me);
			me.hirNodeStore.fetch("userId:[user],hirNodeRoot:1,", me.hirNodesLoaded, me);
		},

		actionSearchItem: function fin_app_hierarchy_UserInterface_actionSearchItem() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.actionSearchLoad();
			}
		},
		
		actionSearchLoad: function fin_app_hierarchy_UserInterface_actionSearchLoad() {			
			var me = this;
			var levelId = 0;
			var levelTitle = "";
			var criteria = "";
			var searchText = me.appUnit.getValue();

			if (searchText == "" || me.level.indexSelected == -1)
				return;			

			$("#AppUnitText").addClass("Loading");
			levelTitle = me.level.data[me.level.indexSelected].title;
			levelId = me.level.data[me.level.indexSelected].id;
			
			if (levelTitle == "Unit") {
				if (searchText.indexOf(",") > 0) {
					me.loadAncestors = false;
					me.searchUnit = true;
				}
				else {
					me.loadAncestors = true;
					me.searchNode = true;
					me.searchSingleUnit = true;
				}

				criteria = "brief:" + searchText.replace(new RegExp(",", "g"), "|") + "|";
			}
			else {
				me.loadAncestors = true;
				me.searchNode = true;
				criteria = "hirLevel:" + levelId + ",title:" + searchText;
			}
			
			me.setLoadCount();
			me.hirNodeStore.reset();
			me.hirNodeStore.fetch("userId:[user],hirNodeRoot:-1," + criteria, me.hirNodesLoaded, me);
		},

		loadHirNodes: function() {
			var me = this;
			var found = false;

			for (var index = 0; index < me.hirNodesList.length; index++) {
				if (me.hirNodesList[index].hirNode == me.hirNodeCurrentId) {
					found = true;
					break;
				}
			}

			if (!found) {
				me.setLoadCount();
				ii.trace("Hirnodes Loading", ii.traceTypes.Information, "Info");
				me.hirNodeStore.fetch("userId:[user],hirNodeSnapshotId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirNodesLoaded, me);
			}
			else
				me.selectNode();
		},
		
		selectNode: function() {
			var me = this;
			var hirNodeId = me.hirNodeCurrentId;
			var found = true;

			while (found) {
				for (var index = 0; index < me.hirNodesList.length; index++) {
					if (me.hirNodesList[index].hirNode == hirNodeId) {
						var parentId = me.hirNodesList[index].nodeParentId;
						var parentNode = $("#liNode" + parentId)[0];
						hirNodeId = parentId;

						if (parentNode != undefined) {
							found = true;

							if (parentNode.className == "expandable" || parentNode.className == "expandable lastExpandable")
								$("#liNode" + hirNodeId).find(">.hitarea").click();										
						}

						break;
					}
					else
						found = false;					
				}
			}

			$("#liNode" + me.hirNodeCurrentId).focus();
		},

//		hierarchyNodesLoaded: function(me, activeId) {
//
//			for (var index = 0; index < me.hierarchyNodes.length; index++) {
//				var levelBrief = "";
//				if (me.hierarchyNodes[index].hirLevel == 37)
//					levelBrief = "ENT";
//				else if (me.hierarchyNodes[index].hirLevel == 2)
//					levelBrief = "SVP";
//				else if (me.hierarchyNodes[index].hirLevel == 34)
//					levelBrief = "DVP";
//				else if (me.hierarchyNodes[index].hirLevel == 3)
//					levelBrief = "RVP";
//				else if (me.hierarchyNodes[index].hirLevel == 36)
//					levelBrief = "SRM";
//				else if (me.hierarchyNodes[index].hirLevel == 4)
//					levelBrief = "RM";
//				else if (me.hierarchyNodes[index].hirLevel == 41)
//					levelBrief = "AM";
//				else if (me.hierarchyNodes[index].hirLevel == 7)
//					levelBrief = "Unit";
//					
//				var item = new fin.app.hierarchy.HirNode(me.hierarchyNodes[index].id
//					, me.hierarchyNodes[index].id
//					, me.hierarchyNodes[index].nodeParentId
//					, me.hierarchyNodes[index].hierarchyId
//					, me.hierarchyNodes[index].hirLevel
//					, levelBrief
//					, me.hierarchyNodes[index].brief
//					, me.hierarchyNodes[index].title
//					, me.hierarchyNodes[index].active
//					, me.hierarchyNodes[index].fullPath
//					, me.hierarchyNodes[index].status
//					, me.hierarchyNodes[index].childNodeCount
//					)
//
//				me.hirNodesTemp.push(item);
//			}
//			
//			me.actionAddNodes(true);
//			me.checkLoadCount();
//			
//			if (me.hirNodesList.length == me.hirNodesTemp.length) {
//				me.resizeControls();
//				if (me.hirNodesList.length > 0)
//					$("#liNode" + me.hirNodesList[0].hirNode).find(">.hitarea").click();
//			}
//		},

		hirNodesLoaded: function(me, activeId) {

			$("#AppUnitText").removeClass("Loading");

			if (me.hirNodes.length == 0 && !me.preview) {
				alert("There is no corresponding node available or you do not have enough permission to access it.");
			}

			if (me.preview) {
				me.addPreviewNodes();
			}
			else if (me.loadAncestors) {
				if (me.expand || me.searchSingleUnit || me.hirNodes.length == 1) {
					me.loadAncestors = false;					
					me.searchSingleUnit = false;

					if (me.hirNodes.length > 0) {
						me.hirNodeCurrentId = me.hirNodes[0].hirNode;
						me.loadHirNodes();
					}
				}
				else {
					if (me.hirNodes.length > 0) {
						me.loadPopup("hierarchyNodesListPopup");
						me.nodeGrid.setData(me.hirNodes);
						me.nodeGrid.setHeight(420);
					}
				}
			}
			else if (me.searchUnit) {
				me.searchUnit = false;

				for (var index = 0; index < me.hirNodes.length; index++) {
					var found = false;

					for (var rowIndex = 0; rowIndex < me.unitsList.length; rowIndex++) {
						if (me.unitsList[rowIndex].hirNode == me.hirNodes[index].hirNode) {
							found = true;
							break;
						}
					}

					if (!found) {
						me.unitsList.push(me.hirNodes[index]);
						me.actionMovableNodeAppend(me.hirNodes[index].hirNode, me.hirNodes[index].title);
					}
				}
			}
			else {
				var found = false;
				me.hirNodesTemp = [];

				for (var index = 0; index < me.hirNodes.length; index++) {
					if (me.hirNodes[index].hirLevel != -1) {
						found = false;

						for (var nodeIndex = 0; nodeIndex < me.hirNodesList.length; nodeIndex++) {
							if (me.hirNodesList[nodeIndex].id == me.hirNodes[index].id) {
								found = true;
								break;
							}
						}

						if (!found) {
							var item = new fin.app.hierarchy.HirNode(me.hirNodes[index].id
								, me.hirNodes[index].hirNode
								, me.hirNodes[index].nodeParentId
								, me.hirNodes[index].hierarchyId
								, me.hirNodes[index].hirLevel
								, me.hirNodes[index].levelBrief
								, me.hirNodes[index].brief
								, me.hirNodes[index].title
								, me.hirNodes[index].active
								, me.hirNodes[index].fullPath
								, me.hirNodes[index].status
								, me.hirNodes[index].childNodeCount
								)

							me.hirNodesTemp.push(item);
						}
					}
				}

				me.actionAddNodes(true);

				if (me.searchNode) {
					me.searchNode = false;
					me.selectNode();
				}

				if (me.hirNodesList.length == me.hirNodesTemp.length) {
					me.resizeControls();
					if (me.hirNodesList.length > 0)
						$("#liNode" + me.hirNodesList[0].hirNode).find(">.hitarea").click();
				}

				me.expand = false;
				me.hirNodesTemp = [];				
				ii.trace("Hirnodes Loaded", ii.traceTypes.Information, "Info");
			}
			
			me.checkLoadCount();
		},

		actionAddNodes: function(storeNodes) {
			var me = this;
			var index = 0;
			var levelBrief = "";
			var hirParentNode = 0;
		 	var hirNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;
			var fullPath = "";
			
			if (storeNodes)
				me.storeHirNodes();

			for (index = 0; index < me.hirNodesTemp.length; index++) {
				levelBrief = me.hirNodesTemp[index].levelBrief;
				hirParentNode = me.hirNodesTemp[index].nodeParentId;
				hirNode = me.hirNodesTemp[index].hirNode;				
				hirNodeTitle = me.hirNodesTemp[index].title;
				childNodeCount = me.hirNodesTemp[index].childNodeCount;
				fullPath = me.hirNodesTemp[index].fullPath;

				//set up the edit tree
                //add the item underneath the parent list
				me.actionNodeAppend(levelBrief, hirNode, hirNodeTitle, hirParentNode, childNodeCount, fullPath);
			}

			$("#pageLoading").fadeOut("slow");

			if (me.levelClass != "" ) {
				$("#span" + me.hirNode).replaceClass("loading", me.levelClass);
				me.levelClass = "";
			}
		},

		actionNodeAppend: function() {
			var args = ii.args(arguments, {
				levelBrief: {type: String}
				, hirNode: {type: Number}
				, hirNodeTitle: {type: String}
				, hirNodeParent: {type: Number}
				, childNodeCount: {type: Number}
				, fullPath: {type: String}
			});
			var me = this;
			var className = args.levelBrief.toLowerCase();

            nodeHtml = "<li id='liNode" + args.hirNode + "'>"
		    	+ "<span class='" + className + "' id='span" + args.hirNode + "'>" + args.hirNodeTitle + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id='ulEdit" + args.hirNode + "'></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNode" + args.hirNodeParent)[0] == undefined)
				args.hirNodeParent = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.hirNodeParent);
            $("#ulEdit0").treeview({add: treeNode});
 
 		    $("#liNode" + args.hirNode).find(">.hitarea").bind("click", function() {
				me.hitAreaSelect(args.hirNode);
			});

			me.hierarchyNodeEventSetup(args.levelBrief, args.hirNode, args.fullPath);
		},

		hierarchyNodeEventSetup: function(levelBrief, hirNode, fullPath) {
			var me = this;
			var nodeAuthorized = false;
			
			if (me.isReadOnly)
				return;

			if (levelBrief.toUpperCase() == "ENT")
				return;

			for (var index = 0; index < me.roleNodes.length; index++) {
				if (fullPath.indexOf(me.roleNodes[index].fullPath) >= 0) {
					nodeAuthorized = true;
					break;
				}
			}

			if (!nodeAuthorized)
				return;

			if (levelBrief.toUpperCase() != "SVP") {
				$("#span" + hirNode).draggable({ 
					revert: true,
					opacity: .75,
					containment: [0, 0, 0, 0],
					helper: "clone",
					start: function(event, ui) {
						var offset = $("#hirContainer").offset();
						var region = [];
						
						region[0] = offset.left;
						region[1] = offset.top;
						region[2] = offset.left + $("#hirContainer").width();
						region[3] = offset.top + $("#hirContainer").height();
						$(this).data("draggable").containment = region;
						me.selectedNode = $("#" + this.id)[0].parentNode;
						me.dropped = false;
					},
					drag: function(event, ui) {
						var offset = $("#hirContainer").offset();

						if (ui.offset.top - 20 < offset.top)
							$("#hirContainer").scrollTop($("#hirContainer").scrollTop() - 20);
						else if (ui.offset.top + 20 > (offset.top + $("#hirContainer").height()))
							$("#hirContainer").scrollTop($("#hirContainer").scrollTop() + 20);
					},
					stop: function(event, ui) {
						if (me.dropped) {
							if (me.selectedNode != null) {
								var count  = me.selectedNode.childNodes.length - 1;
								for (var index = count; index >= 0; index--) {
									$(me.selectedNode.childNodes[index]).remove();
								}

								me.actionNodeRemove(me.selectedNode);
								me.selectedNode = null;
								me.actionAddNodes(false);

								for (var index = 0; index < me.hirNodesTemp.length; index++) {
									if ($("#ulEdit" + me.hirNodesTemp[index].id)[0] != undefined && $("#ulEdit" + me.hirNodesTemp[index].id)[0].innerHTML != "") {
										var treeNode = $("#liNode" + me.hirNodesTemp[index].id)[0];
										if (treeNode != undefined ) {
											if (treeNode.className == "expandable" || treeNode.className == "expandable lastExpandable")
												$("#liNode" + me.hirNodesTemp[index].id).find(">.hitarea").click();
										}
									}
								}
							}

							me.hirNodesTemp = [];
							me.dropped = false;
						}
					}
				});
			}

			$("#span" + hirNode).droppable({
				hoverClass: "drophover",
				tolerance: "pointer",
				drop: function(event, ui) {
					me.dropNode($(this)[0]);

					if (me.dropped)
						ui.draggable.draggable("option", "revert", false);
				}
			});

			$("#span" + hirNode).bind("mousedown", me, me.mouseDownProcessor);
		},

		dropNode: function(node) {
			var me = this;
			var parentId = parseInt(node.id.replace("span", ""));
			var parentIndex = me.getNodeIndex(parentId);
			var	parentNode = $("#ulEdit" + parentId)[0];
			
			if (me.moveSearchedNodes) {
				var nodeId = 0;
				var found = false;
				var checkedNodes = $("input[id^='chkNodeM']:checked");

				if (me.hirNodesList[parentIndex].levelBrief.toUpperCase() != "AM" || checkedNodes.length == 0)
					return;
									
				if (parentNode == undefined) {
					$($("#liNode" + parentId)[0]).remove();
					me.actionNodeAppend(me.hirNodesList[parentIndex].levelBrief, me.hirNodesList[parentIndex].id, me.hirNodesList[parentIndex].title, me.hirNodesList[parentIndex].nodeParentId, 1, me.hirNodesList[parentIndex].fullPath);
				}

				for (var index = 0; index < checkedNodes.length; index++) {
					var id = parseInt(checkedNodes[index].id.replace("chkNodeM", ""));
					found = false;

					if ($("#ulEdit" + parentId)[0] != undefined) {
						for (var rowIndex = 0; rowIndex < $("#ulEdit" + parentId)[0].childNodes.length; rowIndex++) {
							nodeId = parseInt($("#ulEdit" + parentId)[0].childNodes[rowIndex].id.replace("liNode", ""));
							if (id == nodeId) {
								found = true;
								break;
							}
						}
					}

					if (!found) {
						var unitListIndex = 0;
		
						for (var listIndex = 0; listIndex < me.unitsList.length; listIndex++) {
							if (me.unitsList[listIndex].id == id) {
								unitListIndex = listIndex;								
								break;
							}
						}

						me.actionNodeAppend("UNIT", me.unitsList[unitListIndex].hirNode, me.unitsList[unitListIndex].title, parentId, 0, me.unitsList[unitListIndex].fullPath);
						var nodeIndex = me.getNodeIndex(me.unitsList[unitListIndex].hirNode);

						if (nodeIndex == -1) {
							me.unitsList[unitListIndex].nodeParentId = parentId;
							me.unitsList[unitListIndex].modified = true;
							me.modified();
							if (me.unitsList[unitListIndex].status == 0)
								me.unitsList[unitListIndex].status = 2;
							me.hirNodesList.push(me.unitsList[unitListIndex]);
						}
						else {
							me.hirNodesList[nodeIndex].nodeParentId = parentId;
							me.hirNodesList[nodeIndex].modified = true;
							me.modified();
							if (me.hirNodesList[nodeIndex].status == 0)
								me.hirNodesList[nodeIndex].status = 2;
						}
						
						me.unitsList.splice(unitListIndex, 1);
						me.removedUnits.push(id);
					}
				}

				var treeNode = $("#liNode" + parentId)[0];
				if (treeNode.className == "expandable" || treeNode.className == "expandable lastExpandable")
					$("#liNode" + parentId).find(">.hitarea").click();

				me.moveSearchedNodes = false;
				me.dropped = true;

				if (me.unitsList.length == 0)
					$("#chkSelectAll").removeAttr("checked");
				else {
					var message = "";
					for (var index = 0; index < me.unitsList.length; index++) {
						if ($("#chkNodeM" + me.unitsList[index].id).is(":checked"))
							message += me.unitsList[index].brief + ", ";
					}
					if (message != "") {
						message = message.substring(0, message.lastIndexOf(","));
						alert("Unit(s) [" + message + "] already exists in the location [" + me.hirNodesList[parentIndex].title + "]. Please verify.");
					}
				}
			}
			else {
				var id = parseInt(me.selectedNode.id.replace("liNode", ""));
				var nodeIndex = me.getNodeIndex(id);
				var removed = false;

				me.hirNodesTemp = [];

				if (me.hirNodesList[nodeIndex].nodeParentId == parentId
					|| me.levels[me.hirNodesList[nodeIndex].levelBrief.toUpperCase()] != me.hirNodesList[parentIndex].levelBrief.toUpperCase())
					return;

				if (parentNode == undefined) {
					$($("#liNode" + parentId)[0]).remove();
					if (me.hirNodesList[parentIndex].childNodeCount == 0)
						me.hirNodesList[parentIndex].childNodeCount = 1;
					me.hirNodesTemp.push(me.hirNodesList[parentIndex]);
				}

				me.dropped = true;

				me.hirNodesList[nodeIndex].nodeParentId = parentId;
				me.hirNodesList[nodeIndex].modified = true;
				me.modified();
				if (me.hirNodesList[nodeIndex].status == 0)
					me.hirNodesList[nodeIndex].status = 2;

				me.childNodeCheck(me.selectedNode);
			}
		},

		childNodeCheck: function(node) {
		    var me = this;
			var id = parseInt(node.id.replace("liNode", ""));
	  	  	var index = me.getNodeIndex(id);

			me.hirNodesTemp.push(me.hirNodesList[index]);

		    if ($("#ulEdit" + id)[0] != undefined) {
				for (var rowIndex = 0; rowIndex < node.childNodes[2].childNodes.length; rowIndex++) {
					var childNode = node.childNodes[2].childNodes[rowIndex];
					id = parseInt(childNode.id.replace("liNode", ""));
			  	  	index = me.getNodeIndex(id);

					if ($("#ulEdit" + me.hirNodesList[index].id)[0] != undefined)
						me.childNodeCheck(childNode, id);
					else
						me.hirNodesTemp.push(me.hirNodesList[index]);
				}
			}
		},

		storeHirNodes: function() {
			var me = this;
			var hirLevelTitle = "";

			for (var index = 0; index < me.hirNodesTemp.length; index++) {
				me.hirNodesList.push(me.hirNodesTemp[index]);
			}
		},

		hitAreaSelect: function(nodeId) {        
   			var me = this;

			if ($("#ulEdit" + nodeId)[0].innerHTML == "") {
				var nodeIndex = me.getNodeIndex(nodeId);
				me.hirNode = me.hirNodesList[nodeIndex].hirNode;
				me.levelClass = me.hirNodesList[nodeIndex].levelBrief.toLowerCase();
				me.expand = true;
				$("#span" + nodeId).replaceClass(me.levelClass, "loading");
				me.setLoadCount();
				me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + nodeId + ",", me.hirNodesLoaded, me);
			}
		},

		getNodeIndex: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number} 
			});
			var me = this;

			for (var index = 0; index < me.hirNodesList.length; index++) {
				if (me.hirNodesList[index].id == args.hirNode)
					return index;
			}

			return -1;
		},

		actionNodeRemove: function(treeNode) {
			var me = this;

			if (treeNode.className.indexOf("last") >= 0) {

				if ($(treeNode).prev()[0] == undefined) {

					var parentNode = treeNode.parentNode.parentNode;

					$(parentNode.childNodes[0]).remove();
					$(parentNode.childNodes[1]).remove();
					$(parentNode).removeClass("collapsable");
					$(parentNode).removeClass("expandable");
					
					if (parentNode.className.indexOf("last") >= 0) {
						me.actionCssClassUpdate(parentNode, true);
						$(parentNode).addClass("last");
					}										
				}
				else
					me.actionCssClassUpdate($(treeNode).prev()[0], false);
			}

			$(treeNode).remove();			
		},

		actionCssClassUpdate: function(treeNode, isPreviousNode) {
			var me = this;

			if (!treeNode) return; //if undefined

			if (isPreviousNode) {
				$(treeNode).removeClass("lastCollapsable");
				$(treeNode).removeClass("lastExpandable");
				$(treeNode).removeClass("last");
				
				if ($(treeNode)[0].childNodes.length > 1) { //change the class for corresponding DIV					
					$($(treeNode)[0].childNodes[0]).removeClass("lastExpandable-hitarea");
					$($(treeNode)[0].childNodes[0]).removeClass("lastCollapsable-hitarea");
				}
			} 
			else {
				if (treeNode.className.indexOf("expandable") >= 0) {
					$(treeNode).addClass("lastExpandable");
					if ($(treeNode)[0].childNodes.length > 1) { //change the class for corresponding DIV
						$($(treeNode)[0].childNodes[0]).addClass("lastExpandable-hitarea");
					}
				}
				if (treeNode.className.indexOf("collapsable") >= 0) {
					$(treeNode).addClass("lastCollapsable");
					if ($(treeNode)[0].childNodes.length > 1) { //change the class for corresponding DIV
						$($(treeNode)[0].childNodes[0]).addClass("lastCollapsable-hitarea");
					}
				}

				if (treeNode.className == "")
					$(treeNode).addClass("last");
			}
		},

		loadPopup: function(id) {
			var me = this;
			me.centerPopup(id);

			$("#backgroundPopup").css({
				"opacity": "0.5"
			});
			$("#backgroundPopup").fadeIn("slow");
			$("#" + id).fadeIn("slow");
		},

		hidePopup: function(id) {

			$("#backgroundPopup").fadeOut("slow");
			$("#" + id).fadeOut("slow");
		},

		centerPopup: function(id) {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = 0;
			var popupHeight = 0;

			if (id == "hierarchyPreviewPopup") {
				popupWidth = windowWidth - 40;
				popupHeight = windowHeight - 40;
			}
			else {
				popupWidth = $("#" + id).width();
				popupHeight = $("#" + id).height();
			}

			$("#popupLoading").css({
				"width": popupWidth,
				"height": popupHeight,
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});

			$("#" + id).css({
				"width": popupWidth,
				"height": popupHeight,
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
		},

		getLevelTitle: function(brief) {
			var me = this;
			var title = "";

			for (var index = 0; index < me.hirLevels.length; index++) {
				if (me.hirLevels[index].brief.toUpperCase() == brief) {
					title = me.hirLevels[index].title;
					break;
				}
			}

			return title;
		},

		getChildLevelBrief: function(index) {
			var me = this;
			var brief = "";

			if (me.hirNodesList[index].levelBrief == "ENT")
				brief = "SVP";
			else if (me.hirNodesList[index].levelBrief == "SVP")
				brief = "DVP";
			else if (me.hirNodesList[index].levelBrief == "DVP")
				brief = "RVP";
			else if (me.hirNodesList[index].levelBrief == "RVP")
				brief = "SRM";
			else if (me.hirNodesList[index].levelBrief == "SRM")
				brief = "RM";
			else if (me.hirNodesList[index].levelBrief == "RM")
				brief = "AM";
			else if (me.hirNodesList[index].levelBrief == "AM")
				brief = "UNIT";

			return brief;
		},

		updateNode: function(item) {
			var me = this;

			if (me.nodeAction == "add") {
				var nodeFound = true;
				var nodeIndex = me.getNodeIndex(me.selectedNodeId);
				var	newParentNode = $("#ulEdit" + me.selectedNodeId)[0];

				item.id = me.hirNode;
				item.hirNode = me.hirNode;
				me.hirNodesList.push(item);

				if (newParentNode == undefined) {
					nodeFound = false;
					$(me.selectedNode.parentNode).remove();
					me.actionNodeAppend(me.hirNodesList[nodeIndex].levelBrief, me.hirNodesList[nodeIndex].id, me.hirNodesList[nodeIndex].title, me.hirNodesList[nodeIndex].nodeParentId, 1, me.hirNodesList[nodeIndex].fullPath);
				}

				me.actionNodeAppend(item.levelBrief, item.id, item.title, item.nodeParentId, 0, item.fullPath);
				if (!nodeFound)
					$("#liNode" + me.hirNodesList[nodeIndex].hirNode).find(">.hitarea").click();
			}
			else if (me.nodeAction == "edit") {
				$("#span" + me.selectedNodeId).html(me.title.getValue());
			}
			else if (me.nodeAction == "delete") {
				me.actionNodeRemove(me.selectedNode.parentNode);
			}
			else if (me.nodeAction == "save") {
				for (var index = 0; index < me.hirNodesList.length; index++) {
					if (me.hirNodesList[index].modified) {
						me.hirNodesList[index].modified = false;
					}
				}
			}
			else if (me.nodeAction == "saveAndCommit") {
				me.actionUndoItem();
			}
			else if (me.nodeAction == "reset") {
				me.actionResetItem();
				me.roleNodesLoaded(me, 0);
			}
			else if (me.nodeAction == "bulkUpload") {
				$("#HouseCodeGridBody input[id^=txt]").attr("readonly", true);
				$("#AnchorValidate").hide();
				$("#AnchorBulkSave").hide();
				me.setStatus("Saved");
			}

			me.nodeAction = "";
		},

		addNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);
			var brief = me.hirNodesList[nodeIndex].levelBrief.toUpperCase();
			var childBrief = "";

			if (brief == "UNIT")
				return;

			childBrief = me.getChildLevelBrief(nodeIndex);
			me.loadPopup("hierarchyPopup");						
			me.validator.reset();
			me.brief.setValue("");
			me.title.setValue("");
			me.active.setValue("true");
			me.nodeAction = "add";
			$("#LevelTitle").html(me.getLevelTitle(childBrief));
			$("#ParentLevelTitle").html(me.hirNodesList[nodeIndex].title + " [" + me.getLevelTitle(brief) + "]");
		},

		editNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);
			var brief = me.hirNodesList[nodeIndex].levelBrief.toUpperCase();
			var parentBrief = me.levels[me.hirNodesList[nodeIndex].levelBrief.toUpperCase()];
			var parentIndex = me.getNodeIndex(me.hirNodesList[nodeIndex].nodeParentId);

			me.loadPopup("hierarchyPopup");
			me.brief.setValue(me.hirNodesList[nodeIndex].brief);
			me.title.setValue(me.hirNodesList[nodeIndex].title);
			me.active.setValue(me.hirNodesList[nodeIndex].active.toString());
			me.nodeAction = "edit";
			$("#LevelTitle").html(me.getLevelTitle(brief));
			
			if (parentIndex == -1)
				$("#ParentLevelTitle").html("");
			else
				$("#ParentLevelTitle").html(me.hirNodesList[parentIndex].title + " [" + me.getLevelTitle(parentBrief) + "]");
		},

		deleteNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);
			var message = "";

			if (me.hirNodesList[nodeIndex].childNodeCount == 0)
				message = "Are you sure you want to delete the node - [" + me.hirNodesList[nodeIndex].title + "] permanently?";
			else
				message = "Are you sure you want to delete the node - [" + me.hirNodesList[nodeIndex].title + "] and its child nodes permanently?";

			if (!confirm(message)) 	
				return false;

			me.nodeAction = "delete";
			me.actionSaveNode();
		},

		cutNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);

		},

		pasteNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);

		},

		actionGetVersionItem: function() {
			var me = this;
			var item = [];

			if (!fin.cmn.status.itemValid())
				return;

			if (!confirm("The changes you made will be lost if you get original version. Are you sure you want to get the original version of Hierarchy?")) 	
				return false;

			$("#messageToUser").text("Loading");
			me.nodeAction = "reset";
			me.actionSaveItem(item);
		},

		actionValidateItem: function() {
			var me = this;
			var brief = "";
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);

			if (me.nodeAction == "add")
				brief = me.getChildLevelBrief(nodeIndex);
			else
				brief = me.hirNodesList[nodeIndex].levelBrief.toUpperCase();

			if (brief == "UNIT" && (!(ui.cmn.text.validate.generic(me.brief.getValue(), "^\\d+$"))))
				me.brief.setInvalid("Unit-Brief expects a numeric value.");

			if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(me.title.getValue())))
				me.title.setInvalid("Please enter the correct Title. The title can't contain any of the following characters: \\/:*?\"<>|.,");
		},

		actionPreviewSnapshot: function() {
			var me = this;

			$("#popupLoading").show();
			$("#previewContainer").width($(window).width() - 80);
			$("#previewContainer").height($(window).height() - 130);
			$("#ulEditP").empty();
			me.loadPopup("hierarchyPreviewPopup");
			me.preview = true;
			me.setLoadCount();
			me.hirNodeStore.reset();
			me.hirNodeStore.fetch("userId:[user],preview:1", me.hirNodesLoaded, me);
		},

		addPreviewNodes: function() {
			var me = this;
			var levelBrief = "";
			var hirParentNode = 0;
		 	var hirNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;
			var status = 0;

			for (var index = 0; index < me.hirNodes.length; index++) {
				levelBrief = me.hirNodes[index].levelBrief;
				hirParentNode = me.hirNodes[index].nodeParentId;
				hirNode = me.hirNodes[index].hirNode;
				hirNodeTitle = me.hirNodes[index].title;
				childNodeCount = me.hirNodes[index].childNodeCount;
				status = me.hirNodes[index].status;

				//set up the edit tree
                //add the item underneath the parent list
				me.actionPreviewNodeAppend(levelBrief, hirNode, hirNodeTitle, hirParentNode, childNodeCount, status);
			}

			$("#popupLoading").hide();

			if (me.hirNodes.length == 0)
				alert("There is no changes in hierarchy management.");
		},

		actionPreviewNodeAppend: function() {
			var args = ii.args(arguments, {
				levelBrief: {type: String}
				, hirNode: {type: Number}
				, hirNodeTitle: {type: String}
				, hirNodeParent: {type: Number}
				, childNodeCount: {type: Number}
				, status: {type: Number}
			});
			var me = this;
			var className = args.levelBrief.toLowerCase();
			var style = "";

			if (args.status == 1)
				style = "color: green;font-weight: bold;";
			else if (args.status == 2)
				style = "color: blue;font-weight: bold;";
			else if (args.status == 3)
				style = "color: red;font-weight: bold;";

            nodeHtml = "<li id='liNodeP" + args.hirNode + "'>"
		    	+ "<span class='" + className + "' id='spanP" + args.hirNode + "' style='" + style + "'>" + args.hirNodeTitle + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id='ulEditP" + args.hirNode + "'></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNodeP" + args.hirNodeParent)[0] == undefined)
				args.hirNodeParent = 0;

			if (args.hirNodeParent == 0)
            	treeNode = $(nodeHtml).appendTo("#ulEditP");
			else
				treeNode = $(nodeHtml).appendTo("#ulEditP" + args.hirNodeParent);

            $("#ulEditP").treeview({add: treeNode});
		},
		
		actionOkItem: function() {
			var me = this;

			me.hidePopup("hierarchyNodesListPopup");

			if (me.nodeGrid.activeRowIndex >= 0) {
				me.loadAncestors = false;
				me.hirNodeCurrentId = me.hirNodes[me.nodeGrid.activeRowIndex].hirNode;
				me.loadHirNodes();
			}
		},
		
		actionCloseNodesListPopup: function() {
			var me = this;

			me.hidePopup("hierarchyNodesListPopup");
		},

		actionPrintItem: function() {
			var me = this;
			var documentContainer = $("#previewContainer")[0];
			var windowObject = window.open('', 'PrintWindow', 'width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
			var htmlContent = "<html><head><link rel='stylesheet' type='text/css' href='style.css'>"
				+ "<link rel='stylesheet' type='text/css'  href='/fin/cmn/usr/treeview.css'></head><body>"
				+ documentContainer.innerHTML + "</body></html>";

			windowObject.document.writeln(htmlContent);
		    windowObject.document.close();
		    windowObject.focus();
		    windowObject.print();
		    windowObject.close();
		},

		actionClosePreview: function() {
			var me = this;

			me.preview = false;
			me.hidePopup("hierarchyPreviewPopup");
		},

		actionSaveSnapshot: function() {
			var me = this;
			var item = [];
			
			if (me.isReadOnly)
				return;

			me.nodeAction = "save";
			me.actionSaveItem(item);
		},

		actionSaveAndCommit: function() {
			var me = this;
			var item = [];

			if (!confirm("Are you sure you want to make the changes on Hierarchy permanently?")) 	
				return false;

			me.nodeAction = "saveAndCommit";
			me.actionSaveItem(item);
		},

		actionResetItem: function() {
			var me = this;
			
			$("#ulEdit0").empty();
			$("#ulEditM").empty();
			me.appUnit.setValue("");
			me.hirNodesList = [];
			me.hirNodesTemp = [];
			me.unitsList = [];
			me.hirNode = 0;
			me.selectedNodeId = 0;
			me.selectedNode = null;
			me.dropped = false;
			me.loadAncestors = false;
			me.moveSearchedNodes = false;
			me.searchUnit = false;
			me.searchNode = false;
			me.levelClass = "";
			me.nodeAction = "";
		},

		actionUndoItem: function() {
			var me = this;
			
			if (me.isReadOnly)
				return;

			if (!fin.cmn.status.itemValid())
				return;

			me.actionResetItem();
			me.roleNodesLoaded(me, 0);
		},

		actionCancelItem: function() {
			var me = this;

			if (!fin.cmn.status.itemValid())
				return;

			me.hidePopup("hierarchyPopup");
			me.nodeAction = "";
			me.setStatus("Loaded");
		},

		actionClickItem: function(objCheckBox) {
			var me = this;

			if ($("input[id^='chkNodeM']:checked").length == me.unitsList.length)
				$("#chkSelectAll").attr("checked", "checked");
			else
				$("#chkSelectAll").removeAttr("checked");
		},

		actionRemoveItem: function() {
			var me = this;
			var checkedNodes = $("input[id^='chkNodeM']:checked");

			if (me.unitsList.length == checkedNodes.length) {
				$("#ulEditM").empty();
				me.unitsList = [];
			}
			else {
				for (var index = 0; index < checkedNodes.length; index++) {
					var id = parseInt(checkedNodes[index].id.replace("chkNodeM", ""));
					me.actionNodeRemove($("#liNodeM" + id)[0]);
	
					for (var rowIndex = 0; rowIndex < me.unitsList.length; rowIndex++) {
						if (me.unitsList[rowIndex].id == id) {
							me.unitsList.splice(rowIndex, 1);
							break;
						}
					}
				}
			}

			if (me.unitsList.length == 0)
				$("#chkSelectAll").removeAttr("checked");
		},

		actionHierarchyUpdateItem: function() {
			var me = this;

			if (!fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Hierarchy Management");
			$("#UploadContainer").hide();
			$("#HierarchyContainer").show();
			me.actionUndoItem();
		},
		
		actionBulkHierarchyUpdateItem: function() {
			var me = this;

			if (!fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Bulk Hierarchy Update");
			$("#HierarchyContainer").hide();
			$("#AnchorValidate").hide();
			$("#AnchorBulkSave").hide();
			$("#tblHouseCodes").hide();
			$("#iFrameUpload").height(30);
			$("#UploadContainer").show();
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},
		
		actionUploadCanceItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);			
		},
		
		actionUploadItem: function() {
			var me = this;

			me.fileName = "";
			me.setStatus("Uploading");
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow");
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();

			me.intervalId = setInterval(function() {
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "") {
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;
					clearInterval(me.intervalId);

					if (me.fileName == "Error") {
						me.setStatus("Info", "Unable to upload the file. Please try again.");
						alert("Unable to upload the file. Please try again.");
						$("#pageLoading").fadeOut("slow");
					}
					else {
						me.actionImportSave();
					}
				}
			}, 1000);
		},
		
		houseCodeCountLoad: function() {
		    var me = this;
			
			me.setLoadCount();
		    me.houseCodeStore.reset();
			me.houseCodeStore.fetch("userId:[user],batch:" + me.batchId + ",object:Hierarchy,startPoint:0,maximumRows:10000", me.houseCodesLoaded, me);
		},
				
		houseCodesLoaded: function(me, activeId) {

			var houseCodeRow = "";
			var houseCodeRowTemplate = $("#tblHouseCodeTemplate").html();

			$("#HouseCodeGridBody").html("");			
			$("#divFrame").hide();
			$("#divUpload").hide();			
			$("#AnchorBulkSave").hide();
			$("#tblHouseCodes").show();

			if (me.houseCodes.length == 0)
				$("#AnchorValidate").hide();
			else {
				$("#AnchorValidate").show();
				me.modified(true);
			}

			for (var index = 0; index < me.houseCodes.length; index++) {
				//create the row for the house code information
				houseCodeRow = houseCodeRowTemplate;
				houseCodeRow = houseCodeRow.replace(/RowCount/g, index);
				houseCodeRow = houseCodeRow.replace("#", index + 1);

				$("#HouseCodeGridBody").append(houseCodeRow);
			}

			houseCodeRow = '<tr height="100%"><td colspan="9" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#HouseCodeGridBody").append(houseCodeRow);
			$("#HouseCodeGrid tr:odd").addClass("gridRow");
        	$("#HouseCodeGrid tr:even").addClass("alternateGridRow");

			for (var index = 0; index < me.houseCodes.length; index++) {
				$("#txtBrief" + index).val(me.houseCodes[index].column1);
				$("#txtLevel1_" + index).val(me.houseCodes[index].column2);
				$("#txtLevel2_" + index).val(me.houseCodes[index].column3);
				$("#txtLevel3_" + index).val(me.houseCodes[index].column4);
				$("#txtLevel4_" + index).val(me.houseCodes[index].column5);
				$("#txtLevel5_" + index).val(me.houseCodes[index].column6);
				$("#txtLevel6_" + index).val(me.houseCodes[index].column7);
				$("#txtLevel7_" + index).val(me.houseCodes[index].column8);
			}

			me.checkLoadCount();
			me.resize();
  		},
		
		setCellColor: function(control, cellColor, title) {
			var me = this;
			
			control.css("background-color", cellColor);
			control.attr("title", title);			
		},
		
		actionBulkValidateItem: function() {
			var args = ii.args(arguments, {				
				save: {type: Boolean}
			});
			var me = this;
			
			me.actionSave = args.save;

			setTimeout(function() { 
				me.validate(); 
			}, 100);			
		},
		
		validate: function() {
			var me = this;			
			var valid = true;
			var rowValid = true;
			var briefs = "";
			var fullPath = "";
			var prevFullPath = "";
			var fullPaths = "";

			for (var index = 0; index < me.houseCodes.length; index++) {
				rowValid = true;
				fullPath = "";
				briefs += $("#txtBrief" + index).val() + "|";
				
				for (var indexI = 1; indexI <= 7; indexI++) {
					var level = $("#txtLevel" + indexI + "_" + index).val();
					if (level != "") {
						if (!(/^[^\\\/\:\*\?\"\<\>\|\.\,]+$/.test(level))) {
							rowValid = false;
							me.setCellColor($("#txtLevel" + indexI + "_" + index), me.cellColorInvalid, "The Level " + indexI + " can't contain any of the following characters: \\/:*?\"<>|.,");
						}
						else {
							me.setCellColor($("#txtLevel" + indexI + "_" + index), me.cellColorValid, "");
						}
							
						fullPath += "\\" + level;
					}
				}
				
				if (fullPath != prevFullPath) {
					fullPaths += fullPath + "|";
					prevFullPath = fullPath;
				}				

				if (!(/^[0-9]+$/.test($("#txtBrief" + index).val()))) {
					rowValid = false;
					me.setCellColor($("#txtBrief" + index), me.cellColorInvalid, "Please enter valid House Code.");
				}
				else {
					me.setCellColor($("#txtBrief" + index), me.cellColorValid, "");
				}								

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}
			
			for (var index = 0; index < me.houseCodes.length; index++) {
				for (var indexI = index + 1; indexI < me.houseCodes.length; indexI++) {
					if ($("#txtBrief" + index).val() == $("#txtBrief" + indexI).val()) {
						rowValid = false;
						me.setCellColor($("#txtBrief" + indexI), me.cellColorInvalid, "Duplicate House Code is not allowed.");
					}
				}

				if (!rowValid) {
					if (valid)
						valid = false;
				}
			}

			// If all required fields are entered correctly then validate the House Code and FullPaths
			if (valid) {
				me.setStatus("Validating");
				$("#messageToUser").text("Validating");
				$("#pageLoading").fadeIn("slow");

				me.bulkImportValidationStore.reset();
				me.bulkImportValidationStore.fetch("userId:[user]"
					+ ",briefs:" + briefs
					+ ",fullPaths:" + fullPaths
					, me.validationsLoaded
					, me);
			}
			else {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
				$("#AnchorBulkSave").hide();
				alert("In order to save, the errors on the page must be corrected.");
			}
		},

		validationsLoaded: function(me, activeId) {

			var valid = true;

			for (var rowIndex = 0; rowIndex < me.houseCodes.length; rowIndex++) {
				for (var index = 1; index <= 7; index++) {
					$("#txtLevel" + index + "_" + rowIndex).attr("title", "");
					$("#txtLevel" + index + "_" + rowIndex).css("background-color", me.cellColorValid);
				}
			}

			if (me.bulkImportValidations.length > 0) {
				var briefs = me.bulkImportValidations[0].briefs.split('|');
				var fullPaths = me.bulkImportValidations[0].fullPaths.split('|');				

				for (var rowIndex = 0; rowIndex < me.houseCodes.length; rowIndex++) {
					var found = false;
					for (var index = 0; index < briefs.length - 1; index++) {
						if ($("#txtBrief" + rowIndex).val() == briefs[index]) {
							found = true;
							break;
						}							
					}

					if (!found) {
						$("#txtBrief" + rowIndex).attr("title", "House Code doesn't exists.");
						$("#txtBrief" + rowIndex).css("background-color", me.cellColorInvalid);
						valid = false;
					}

					for(var index = 0; index < fullPaths.length - 1; index++) {
						var fullPath = "";
						
						for (var indexI = 1; indexI <= 7; indexI++) {
							if ($("#txtLevel" + indexI + "_" + rowIndex).val() != "")
								fullPath += "\\" + $("#txtLevel" + indexI + "_" + rowIndex).val();
						}

						if (fullPath == fullPaths[index]) {
							for (var indexI = 1; indexI <= 7; indexI++) {
								$("#txtLevel" + indexI + "_" + rowIndex).attr("title", "Invalid Fullpath.");
								$("#txtLevel" + indexI + "_" + rowIndex).css("background-color", me.cellColorInvalid);
								valid = false;
							}
						}
					}
				}

				if (!valid) {
					me.setStatus("Loaded");
					$("#AnchorBulkSave").hide();
					alert("In order to save, the errors on the page must be corrected.");
					$("#pageLoading").fadeOut("slow");
				}
				else {
					if (me.actionSave)
						me.actionSaveHouseCodes();
					else {
						$("#AnchorBulkSave").show();
						$("#pageLoading").fadeOut("slow");
						me.setStatus("Loaded");
					}
				}		
			}
		},

		actionSaveHouseCodes: function() {
			var me = this;
			var item = [];
			var xml = "";
			
			for (var index = 0; index < me.houseCodes.length; index++) {
				var fullPath = "";

				for (var indexI = 1; indexI <= 7; indexI++) {
					var level = $("#txtLevel" + indexI + "_" + index).val();
					fullPath += "\\" + level;
				}

				xml += '<hirNodeSnapshot';
				xml += ' id="0"';
				xml += ' hirNodeParent="0"';
				xml += ' hirHierarchy="2"';
				xml += ' hirLevel="7"';
				xml += ' brief="' + ui.cmn.text.xml.encode($("#txtBrief" + index).val()) + '"';
				xml += ' title=""';
				xml += ' active="true"';
				xml += ' status="2"';
				xml += ' fullPath="' + ui.cmn.text.xml.encode(fullPath) + '"';
				xml += '/>';
			}
			
			if (xml == "")
				return;

			me.nodeAction = "bulkUpload";
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

		actionImportSave: function() {
			var me = this;
			var item = [];

			me.setStatus("Importing");
			$("#messageToUser").text("Importing");

			var xml = '<appGenericImport';
			xml += ' fileName="' + me.fileName + '"';
			xml += ' object="Hierarchy"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveImportResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveImportResponse: function() {
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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "appGenericImport":							
							me.batchId = parseInt($(this).attr("batch"), 10);
							me.houseCodeCountLoad();

							break;
					}
				});
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while importing Hierarchy details: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		},

		actionSaveNode: function() {
			var me = this;
			var item = [];

			if (me.nodeAction == "add" || me.nodeAction == "edit") {
				me.validator.forceBlur();

				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			}

			var nodeIndex = me.getNodeIndex(me.selectedNodeId);

			if (me.nodeAction == "add") {
				var brief = me.getChildLevelBrief(nodeIndex);
				var hirLevel = 0;
				var fullPath = "";

				for (var index = 0; index < me.hirLevels.length; index++) {
					if (me.hirLevels[index].levelParentId == me.hirNodesList[nodeIndex].hirLevel) {
						hirLevel = me.hirLevels[index].id;
						fullPath = me.hirNodesList[nodeIndex].fullPath + "\\" + me.title.getValue();
						break;
					}
				}

				item = new fin.app.hierarchy.HirNode(0
					, 0
					, me.selectedNodeId
					, 2
					, hirLevel
					, brief
					, me.brief.getValue()
					, me.title.getValue()
					, me.active.check.checked
					, fullPath
					, 1
					, 0
					, 0
					)
			}
			else if (me.nodeAction == "edit") {
				me.hirNodesList[nodeIndex].brief = me.brief.getValue();
				me.hirNodesList[nodeIndex].title = me.title.getValue();
				me.hirNodesList[nodeIndex].active = me.active.check.checked;
				if (me.hirNodesList[nodeIndex].status == 0)
					me.hirNodesList[nodeIndex].status = 2;
					
				item = me.hirNodesList[nodeIndex];
			}
			else if (me.nodeAction == "delete") {
				me.hirNodesList[nodeIndex].status = 3;
				item = me.hirNodesList[nodeIndex];
			}			

			me.actionSaveItem(item);
			me.setStatus("Loaded");				
		},

		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: {type: fin.app.hierarchy.HirNode}
			});			
			var me = this;
			var item = args.item;		
			var xml = "";

			if (me.nodeAction == "add" || me.nodeAction == "edit" || me.nodeAction == "delete") {
				xml = '<hirNodeSnapshot';
				xml += ' id="' + item.id + '"';
				xml += ' hirNodeParent="' + item.nodeParentId + '"';
				xml += ' hirHierarchy="' + item.hierarchyId + '"';
				xml += ' hirLevel="' + item.hirLevel + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode(item.brief) + '"';
				xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
				xml += ' active="' + item.active + '"';
				xml += ' status="' + item.status + '"';
				xml += ' fullPath=""';
				xml += '/>';
			}
			else if (me.nodeAction == "save" || me.nodeAction == "saveAndCommit") {
				for (var index = 0; index < me.hirNodesList.length; index++) {
					if (me.hirNodesList[index].modified) {
						xml += '<hirNodeSnapshot';
						xml += ' id="' + me.hirNodesList[index].id + '"';
						xml += ' hirNodeParent="' + me.hirNodesList[index].nodeParentId + '"';
						xml += ' hirHierarchy="' + me.hirNodesList[index].hierarchyId + '"';
						xml += ' hirLevel="' + me.hirNodesList[index].hirLevel + '"';
						xml += ' brief="' + ui.cmn.text.xml.encode(me.hirNodesList[index].brief) + '"';
						xml += ' title="' + ui.cmn.text.xml.encode(me.hirNodesList[index].title) + '"';
						xml += ' active="' + me.hirNodesList[index].active + '"';
						xml += ' status="' + me.hirNodesList[index].status + '"';
						xml += ' fullPath=""';
						xml += '/>';
					}
				}

				if (me.nodeAction == "saveAndCommit") {
					xml += '<hirNodeSnapshotCommit';
					xml += ' id="0"';					
					xml += '/>';
				}
			}
			else if (me.nodeAction == "reset") {
				xml = '<hirNodeSnapshotReset';
				xml += ' id="0"';					
				xml += '/>';
			}

			return xml;
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.app.hierarchy.HirNode}
			});			
			var me = this;
			var item = args.item;
			var xml = me.saveXmlBuild(item);

			if (xml == "")
				return;

			me.hidePopup("hierarchyPopup");

			if (me.nodeAction != "reset")
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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "hirNodeSnapshot":
							me.hirNode = parseInt($(this).attr("id"), 10);
							break;
					}
				});
				ii.trace("Save Success", ii.traceTypes.Information, "Info");
				me.updateNode(item);
				me.modified(false);
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating the hirnode snapshot information: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function onFileChange() {
	var me = fin.hierarchyUi;	
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));

	if (fileExtension == ".xlsx")
		me.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {

	var intervalId = setInterval(function() {

		if (importCompleted) {
			clearInterval(intervalId);
			fin.hierarchyUi = new fin.app.hierarchy.UserInterface();
			fin.hierarchyUi.resize();
		}

	}, 100);
}
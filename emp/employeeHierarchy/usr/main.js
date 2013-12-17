ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.emp.employeeHierarchy.usr.defs" );
ii.Import( "fin.cmn.usr.treeView" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.button", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.treeview", 7 );
ii.Style( "fin.cmn.usr.grid", 8 );

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
    Name: "fin.emp.hierarchy.UserInterface",
    Definition: {
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.employeesList = [];
			me.employeesTemp = [];
			me.movableEmpList = [];
			me.removedUnits = [];
			me.employeeId = 0;
			me.employeeCurrentId = 0;
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

			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			me.hierarchy = new ii.ajax.Hierarchy( me.gateway );

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmpHierarchy";
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

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);
			$("#ulEdit0").bind("contextmenu", me, me.contextMenuProcessor);
			$("#chkSelectAll").click(function () {
				$("input[id^='chkNodeM']").attr("checked", this.checked);
			});

			me.hierarchyTreeMouseDownEventSetup();
			me.movableNodeEventSetup();
			me.setStatus("Loading");
			me.modified(false);
			
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

		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;

		    if (me.replaceContext) {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft : document.documentElement.scrollLeft;

				scrollTop -= 10;

				var offset = $("#empContainer").offset();						
				var bottom = offset.top + $("#empContainer").height();

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

		authorizationProcess: function fin_emp_hierarchy_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				me.loadCount = 2;
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.job.fetchingData();
				me.jobStore.fetch("userId:[user]", me.jobsLoaded, me);
				me.employeeStore.fetch("userId:[user],jobTitle:,employeeName:,employeeId:0,managerId:0,searchInHierarchy:true", me.employeesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
				
		},

		sessionLoaded: function fin_emp_hierarchy_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function fin_emp_hierarchy_UserInterface_resize() {
			var me = fin.hierarchyUi;

			$("#empContainer").height($(window).height() - 150);
			me.setmovableContainerHeight();
		},

		defineFormControls: function fin_emp_hierarchy_UserInterface_defineFormControls() {
			var me = this;

			$("#ulEdit0").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true,
				toggle: function() { me.setmovableContainerHeight(); }
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

			me.employeeName = new ui.ctl.Input.Text({
		        id: "EmployeeName",
				maxLength: 100,
				title: "To search a specific Employee, type-in Employee name and press Enter key/click Search button."
		    });

			me.job = new ui.ctl.Input.DropDown.Filtered({
		        id: "Job",
				formatFunction: function( type ) { return type.title; }
		    });

			me.searchInHierarchy = new ui.ctl.Input.Check({
		        id: "SearchInHierarchy"
		    });

			me.searchInHierarchy.setValue("true");

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
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveHierarchy(); },
				hasHotState: true
			});

//			me.anchorPreview = new ui.ctl.buttons.Sizeable({
//				id: "AnchorPreview",
//				className: "iiButton",
//				text: "<span>&nbsp;&nbsp;Preview&nbsp;&nbsp;</span>",
//				clickFunction: function() { me.actionPreviewItem(); },
//				hasHotState: true
//			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorClear = new ui.ctl.buttons.Sizeable({
				id: "AnchorClear",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Clear&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionClearItem(); },
				hasHotState: true
			});
			
			me.anchorDelete = new ui.ctl.buttons.Sizeable({
				id: "AnchorDelete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDeleteItem(); },
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

			$("#EmployeeNameText").bind("keydown", me, me.actionSearchItem);
			$("#JobText").bind("keydown", me, me.actionSearchItem);
		},

		configureCommunications: function fin_emp_hierarchy_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.jobs = [];
			me.jobStore = me.cache.register({
				storeId: "employeeHierarchyJobs",
				itemConstructor: fin.emp.hierarchy.Job,
				itemConstructorArgs: fin.emp.hierarchy.jobArgs,
				injectionArray: me.jobs
			});

			me.employees = [];
			me.employeeStore = me.cache.register({
				storeId: "employeeHierarchies",
				itemConstructor: fin.emp.hierarchy.Employee,
				itemConstructorArgs: fin.emp.hierarchy.employeeArgs,
				injectionArray: me.employees	
			});
		},
		
		resizeControls: function() {
			var me = this;
			
			me.job.resizeText();
			me.employeeName.resizeText();
			me.resize();
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
		
		jobsLoaded: function fin_emp_UserInterface_jobsLoaded(me, activeId) {

			me.job.setData(me.jobs);
			me.job.select(0, me.job.focused);
			me.checkLoadCount();
		},
		
		hierarchyTreeMouseDownEventSetup: function() {
			var me = this;

			$("#HierarchyContextMenu tr:odd").addClass("gridRow");
        	$("#HierarchyContextMenu tr:even").addClass("alternateGridRow");

			$("#HierarchyContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});

				$("#HierarchyContextMenu tr").click(function() {

				if (this.id == "menuDelete")
					me.deleteNode();

				$("#HierarchyContext").hide();
			});

			$("#HierarchyContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},

		movableNodeEventSetup: function() {
			var me = this;

			$("#movableContainer").droppable({
				drop: function(event, ui) {
					if (ui.draggable[0].id == "ulEditM")
						return;

					me.dropMovableNode($(this)[0]);

					if (me.dropped)
						ui.draggable.draggable("option", "revert", false);
				}
			});

			$("#ulEditM").draggable({
				cursorAt: {left: 0, top: 0},
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
					var offset = $("#empContainer").offset();
					var region = [];

					region[0] = offset.left;
					region[1] = offset.top;
					region[2] = offset.left + $("#empContainer").width() - 400;
					region[3] = offset.top + $("#empContainer").height() - 10;
					$(this).data("draggable").containment = region;
					$(this).draggable("option", "revert", true);
					me.moveSearchedNodes = true;
					me.dropped = false;
				},
				drag: function(event, ui) {
					var offset = $("#empContainer").offset();

					if (ui.offset.top - 20 < offset.top)
						$("#empContainer").scrollTop($("#empContainer").scrollTop() - 20);
					else if (ui.offset.top + 36 > (offset.top + $("#empContainer").height()))
						$("#empContainer").scrollTop($("#empContainer").scrollTop() + 20);
				},
				stop: function(event, ui) {
					if (me.dropped) {

						if (me.movableEmpList.length == 0) {
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

			if (nodeIndex == -1)
				return;

			me.dropped = true;
			me.moveChildNodeCheck(me.selectedNode);
		},
		
		moveChildNodeCheck: function(node) {
		    var me = this;
			var id = parseInt(node.id.replace("liNode", ""));
	  	  	var nodeIndex = me.getNodeIndex(id);

			me.movableEmpList.push(me.employeesList[nodeIndex]);
			me.actionMovableNodeAppend(id, me.employeesList[nodeIndex].employeeName);

		    if ($("#ulEdit" + id)[0] != undefined) {
				for (var rowIndex = 0; rowIndex < node.childNodes[2].childNodes.length; rowIndex++) {
					var childNode = node.childNodes[2].childNodes[rowIndex];
					id = parseInt(childNode.id.replace("liNode", ""));
			  	  	index = me.getNodeIndex(id);

					if ($("#ulEdit" + me.employeesList[index].employeeId)[0] != undefined)
						me.moveChildNodeCheck(childNode);
					else {
						me.movableEmpList.push(me.employeesList[index]);
						me.actionMovableNodeAppend(id, me.employeesList[index].employeeName);
					}
				}
			}
		},

		actionMovableNodeAppend: function() {
			var args = ii.args(arguments, {
				employeeId: {type: Number}
				, title: {type: String}
			});
			var me = this;

            nodeHtml = "<li id='liNodeM" + args.employeeId + "'>"
				+ "<input type='checkbox' id='chkNodeM" + args.employeeId + "' style='width:16px' onclick='fin.hierarchyUi.actionClickItem(this);' />"
				+ "<span id='spanM" + args.employeeId + "' class='mUnit'>" + args.title + "</span></li>";

	        var treeNode = $(nodeHtml).appendTo("#ulEditM");
            $("#ulEditM").treeview({add: treeNode});
		},

		setmovableContainerHeight: function() {
			var me = this;

			$("#movableContainer").height($(window).height() - 230);

			if ($("#empContainer")[0].scrollHeight > ($("#empContainer").height() + 20)) {
				var height = ($("#empContainer")[0].scrollHeight) - $("#empContainer").height();
				$("#movableContainer").height($(window).height() + height - 230);
			}
		},

		actionSearchItem: function fin_emp_hierarchy_UserInterface_actionSearchItem() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.actionSearchLoad();
			}
		},
		
		actionSearchLoad: function fin_emp_hierarchy_UserInterface_actionSearchLoad() {
			var me = this;
			var jobTitle = "";
			var criteria = "";
			var employeeName = me.employeeName.getValue();

			if (employeeName == "" && me.job.indexSelected == -1)
				return;
				
			if (me.job.indexSelected != -1)
				jobTitle = me.job.data[me.job.indexSelected].title;
			criteria = "jobTitle:" + jobTitle + ",employeeName:" + employeeName + ",employeeId:0,managerId:-1,";
			
			if (me.searchInHierarchy.check.checked) {
				me.loadAncestors = true;
				me.searchNode = true;
				me.searchUnit = false;
				criteria += "searchInHierarchy:true,ancestors:true";
			}
			else {
				me.loadAncestors = false;
				me.searchNode = false;
				me.searchUnit = true;
				criteria += "searchInHierarchy:false,ancestors:false";
			}
			
			me.setLoadCount();
			me.employeeStore.reset();
			me.employeeStore.fetch("userId:[user]," + criteria, me.employeesLoaded, me);
		},

		loadEmployees: function() {
			var me = this;
			var found = false;

			for (var index = 0; index < me.employeesList.length; index++) {
				if (me.employeesList[index].employeeId == me.employeeCurrentId) {
					found = true;
					break;
				}
			}

			if (!found) {
				$("#messageToUser").text("Loading");
				$("#pageLoading").show();
				ii.trace("Employees Loading", ii.traceTypes.Information, "Info");
				me.employeeStore.fetch("userId:[user],employeeId:" + me.employeeCurrentId + ",ancestors:true", me.employeesLoaded, me);
			}
			else
				me.selectNode();
		},
		
		selectNode: function() {
			var me = this;
			var employeeId = me.employeeCurrentId;
			var found = true;

			while (found) {
				for (var index = 0; index < me.employeesList.length; index++) {
					if (me.employeesList[index].employeeId == employeeId) {
						var parentId = me.employeesList[index].managerId;
						var parentNode = $("#liNode" + parentId)[0];
						employeeId = parentId;

						if (parentNode != undefined) {
							found = true;

							if (parentNode.className == "expandable" || parentNode.className == "expandable lastExpandable")
								$("#liNode" + employeeId).find(">.hitarea").click();										
						}

						break;
					}
					else
						found = false;					
				}
			}

			$("#liNode" + me.employeeCurrentId).focus();
		},

		employeesLoaded: function(me, activeId) {

			if (me.employees.length == 0 && !me.preview) {
				alert("No matching records found.");
				me.checkLoadCount();
			}

			if (me.preview) {
				me.addPreviewNodes();
			}
//			else if (me.loadAncestors) {
//				if (me.expand || me.searchSingleUnit || me.employees.length == 1) {
//					me.loadAncestors = false;					
//					me.searchSingleUnit = false;
//
//					if (me.employees.length > 0) {
//						me.employeeCurrentId = me.employees[0].employeeId;
//						me.loadEmployees();
//					}
//				}
//			}else
			if (me.searchUnit) {
				me.searchUnit = false;

				for (var index = 0; index < me.employees.length; index++) {
					var found = false;

					for (var rowIndex = 0; rowIndex < me.movableEmpList.length; rowIndex++) {
						if (me.movableEmpList[rowIndex].employeeId == me.employees[index].employeeId) {
							found = true;
							break;
						}
					}

					if (!found) {
						me.movableEmpList.push(me.employees[index]);
						me.actionMovableNodeAppend(me.employees[index].employeeId, me.employees[index].employeeName);
					}
				}
			}
			else {
				var found = false;
				me.employeesTemp = [];

				for (var index = 0; index < me.employees.length; index++) {
					if (me.employees[index].orgLevel != -1) {
						found = false;

						for (var nodeIndex = 0; nodeIndex < me.employeesList.length; nodeIndex++) {
							if (me.employeesList[nodeIndex].employeeId == me.employees[index].employeeId) {
								found = true;
								break;
							}
						}

						if (!found) {
							var item = new fin.emp.hierarchy.Employee(me.employees[index].id
								, me.employees[index].employeeId
								, me.employees[index].managerId
								, me.employees[index].jobTitle
								, me.employees[index].employeeName
								, me.employees[index].orgLevel
								, me.employees[index].childNodeCount
								, me.employees[index].status
								)

							me.employeesTemp.push(item);
							
							if (me.job.indexSelected != -1) {
								if (me.employees[index].jobTitle == me.job.data[me.job.indexSelected].title)
									me.employeeCurrentId = me.employees[index].employeeId;
							}
							else
								me.employeeCurrentId = me.employees[index].employeeId;
						}
					}
				}

				me.actionAddNodes(true);

				if (me.searchNode) {
					me.searchNode = false;
					me.selectNode();
				}

				if (me.employeesList.length == me.employeesTemp.length) {
					me.resizeControls();
					if (me.employeesList.length > 0)
						$("#liNode" + me.employeesList[0].employeeId).find(">.hitarea").click();
				}

				me.expand = false;
				me.employeesTemp = [];				
			}
			
			me.checkLoadCount();
			ii.trace("Employees Loaded", ii.traceTypes.Information, "Info");
		},

		actionAddNodes: function(storeNodes) {
			var me = this;
			var index = 0;
			var orgLevel = 0;
			var employeeId = 0;
		 	var managerId = 0;
            var title = "";
			var childNodeCount = 0;
			
			if (storeNodes)
				me.storeEmployees();

			for (index = 0; index < me.employeesTemp.length; index++) {
				orgLevel = me.employeesTemp[index].orgLevel;
				employeeId = me.employeesTemp[index].employeeId;
				managerId = me.employeesTemp[index].managerId;
				title = me.employeesTemp[index].employeeName;
				childNodeCount = me.employeesTemp[index].childNodeCount;

				//set up the edit tree
                //add the item underneath the parent list
				me.actionNodeAppend(orgLevel, employeeId, managerId, title, childNodeCount);
			}

			$("#pageLoading").hide();

			if (me.levelClass != "" ) {
				$("#span" + me.employeeId).replaceClass("loading", me.levelClass);
				me.levelClass = "";
			}
		},

		actionNodeAppend: function() {
			var args = ii.args(arguments, {
				orgLevel: {type: Number}
				, employeeId: {type: Number}
				, managerId: {type: Number}
				, title: {type: String}
				, childNodeCount: {type: Number}
			});
			var me = this;
			var className = "level" + args.orgLevel;

            nodeHtml = "<li id='liNode" + args.employeeId + "'>"
		    	+ "<span class='" + className + "' id='span" + args.employeeId + "'>" + args.title + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id='ulEdit" + args.employeeId + "'></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNode" + args.managerId)[0] == undefined)
				args.managerId = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.managerId);
            $("#ulEdit0").treeview({add: treeNode});
 
 		    $("#liNode" + args.employeeId).find(">.hitarea").bind("click", function() {
				me.hitAreaSelect(args.employeeId);
			});

			me.hierarchyNodeEventSetup(args.orgLevel, args.employeeId);
		},

		hierarchyNodeEventSetup: function(orgLevel, employeeId) {
			var me = this;

			if (orgLevel != 0) {
				$("#span" + employeeId).draggable({
					revert: true,
					opacity: .75,
					containment: [0, 0, 0, 0],
					helper: "clone",
					start: function(event, ui) {
						var offset = $("#empContainer").offset();
						var region = [];

						region[0] = offset.left;
						region[1] = offset.top;
						region[2] = offset.left + $("#empContainer").width();
						region[3] = offset.top + $("#empContainer").height();
						$(this).data("draggable").containment = region;
						me.selectedNode = $("#" + this.id)[0].parentNode;
						me.dropped = false;
					},
					drag: function(event, ui) {
						var offset = $("#empContainer").offset();

						if (ui.offset.top - 20 < offset.top)
							$("#empContainer").scrollTop($("#empContainer").scrollTop() - 20);
						else if (ui.offset.top + 20 > (offset.top + $("#empContainer").height()))
							$("#empContainer").scrollTop($("#empContainer").scrollTop() + 20);
					},
					stop: function(event, ui) {
						if (me.dropped) {
							if (me.selectedNode != null) {
								var count  = me.selectedNode.childNodes.length - 1;
								for (var index = count; index >= 0; index--) {
									$(me.selectedNode.childNodes[index]).remove();
								}

								if (me.selectedNode.parentNode.childNodes.length == 1) {
									var parentId = me.selectedNode.parentNode.id.replace("ulEdit", "");
									var parentIndex = me.getNodeIndex(parentId);
									me.employeesList[parentIndex].childNodeCount = 0;
								}
								me.actionNodeRemove(me.selectedNode);
								me.selectedNode = null;
								me.actionAddNodes(false);

								for (var index = 0; index < me.employeesTemp.length; index++) {
									if ($("#ulEdit" + me.employeesTemp[index].id)[0] != undefined && $("#ulEdit" + me.employeesTemp[index].id)[0].innerHTML != "") {
										var treeNode = $("#liNode" + me.employeesTemp[index].id)[0];
										if (treeNode != undefined ) {
											if (treeNode.className == "expandable" || treeNode.className == "expandable lastExpandable")
												$("#liNode" + me.employeesTemp[index].id).find(">.hitarea").click();
										}
									}
								}
							}

							me.employeesTemp = [];
							me.dropped = false;
						}
					}
				});
			}

			$("#span" + employeeId).droppable({
				hoverClass: "drophover",
				tolerance: "pointer",
				drop: function(event, ui) {
					me.dropNode($(this)[0]);

					if (me.dropped)
						ui.draggable.draggable("option", "revert", false);
				}
			});

			$("#span" + employeeId).bind("mousedown", me, me.mouseDownProcessor);
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

				if (checkedNodes.length == 0)
					return;

				if (parentNode == undefined) {
					$($("#liNode" + parentId)[0]).remove();
					me.actionNodeAppend(me.employeesList[parentIndex].orgLevel, me.employeesList[parentIndex].employeeId, me.employeesList[parentIndex].managerId, me.employeesList[parentIndex].employeeName, 1);
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
		
						for (var listIndex = 0; listIndex < me.movableEmpList.length; listIndex++) {
							if (me.movableEmpList[listIndex].employeeId == id) {
								unitListIndex = listIndex;								
								break;
							}
						}

						me.actionNodeAppend(me.employeesList[parentIndex].orgLevel + 1, me.movableEmpList[unitListIndex].employeeId, parentId, me.movableEmpList[unitListIndex].employeeName, 0);
						var nodeIndex = me.getNodeIndex(me.movableEmpList[unitListIndex].employeeId);

						if (nodeIndex == -1) {
							me.movableEmpList[unitListIndex].managerId = parentId;
							me.movableEmpList[unitListIndex].modified = true;
							me.modified();
							if (me.movableEmpList[unitListIndex].status == 0)
								me.movableEmpList[unitListIndex].status = 2;
							me.employeesList.push(me.movableEmpList[unitListIndex]);
						}
						else {
							me.employeesList[nodeIndex].managerId = parentId;
							me.employeesList[nodeIndex].modified = true;
							me.modified();
							if (me.employeesList[nodeIndex].status == 0)
								me.employeesList[nodeIndex].status = 2;
						}
						
						me.movableEmpList.splice(unitListIndex, 1);
						me.removedUnits.push(id);
					}
				}

				var treeNode = $("#liNode" + parentId)[0];
				if (treeNode.className == "expandable" || treeNode.className == "expandable lastExpandable")
					$("#liNode" + parentId).find(">.hitarea").click();

				me.moveSearchedNodes = false;
				me.dropped = true;

				if (me.movableEmpList.length == 0)
					$("#chkSelectAll").removeAttr("checked");
			}
			else {
				var id = parseInt(me.selectedNode.id.replace("liNode", ""));
				var nodeIndex = me.getNodeIndex(id);

				me.employeesTemp = [];

				if (me.employeesList[nodeIndex].managerId == parentId)
					return;

				if (parentNode == undefined) {
					$($("#liNode" + parentId)[0]).remove();
					if (me.employeesList[parentIndex].childNodeCount == 0)
						me.employeesList[parentIndex].childNodeCount = 1;
					me.employeesTemp.push(me.employeesList[parentIndex]);
				}

				me.dropped = true;

				me.employeesList[nodeIndex].managerId = parentId;
				me.employeesList[nodeIndex].modified = true;
				me.modified();
				
				if (me.employeesList[nodeIndex].status == 0)
					me.employeesList[nodeIndex].status = 2;

				me.childNodeCheck(me.selectedNode, me.employeesList[parentIndex].orgLevel + 1);
			}
		},

		childNodeCheck: function(node, orgLevel) {
		    var me = this;
			var id = parseInt(node.id.replace("liNode", ""));
	  	  	var index = me.getNodeIndex(id);

			me.employeesList[index].orgLevel = orgLevel;
			me.employeesTemp.push(me.employeesList[index]);

		    if ($("#ulEdit" + id)[0] != undefined) {
				for (var rowIndex = 0; rowIndex < node.childNodes[2].childNodes.length; rowIndex++) {
					var childNode = node.childNodes[2].childNodes[rowIndex];
					id = parseInt(childNode.id.replace("liNode", ""));
			  	  	index = me.getNodeIndex(id);

					if ($("#ulEdit" + me.employeesList[index].employeeId)[0] != undefined)
						me.childNodeCheck(childNode, orgLevel + 1);
					else {
						me.employeesList[index].orgLevel = orgLevel + 1;
						me.employeesTemp.push(me.employeesList[index]);
					}						
				}
			}
		},

		storeEmployees: function() {
			var me = this;
			var hirLevelTitle = "";

			for (var index = 0; index < me.employeesTemp.length; index++) {
				me.employeesList.push(me.employeesTemp[index]);
			}
		},

		hitAreaSelect: function(nodeId) {
   			var me = this;

			if ($("#ulEdit" + nodeId)[0].innerHTML == "") {				
				var nodeIndex = me.getNodeIndex(nodeId);
				me.employeeId = me.employeesList[nodeIndex].employeeId;
				me.levelClass = "level" + me.employeesList[nodeIndex].orgLevel;
				me.expand = true;
				$("#span" + nodeId).replaceClass(me.levelClass, "loading");
				me.employeeStore.fetch("userId:[user],jobTitle:,managerId:" + me.employeeId + ",searchInHierarchy:true", me.employeesLoaded, me);
			}
		},

		getNodeIndex: function() {
			var args = ii.args(arguments, {
				employeeId: {type: Number} 
			});
			var me = this;

			for (var index = 0; index < me.employeesList.length; index++) {
				if (me.employeesList[index].employeeId == args.employeeId)
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

		updateNode: function(item) {
			var me = this;

			if (me.nodeAction == "delete") {
				//me.actionNodeRemove(me.selectedNode.parentNode);
				var checkedNodes = $("input[id^='chkNodeM']:checked");
						
				if (me.movableEmpList.length == checkedNodes.length) {
					$("#ulEditM").empty();
					me.movableEmpList = [];
				}
				else {
					for (var index = 0; index < checkedNodes.length; index++) {
						var id = parseInt(checkedNodes[index].id.replace("chkNodeM", ""));
						me.actionNodeRemove($("#liNodeM" + id)[0]);
		
						for (var rowIndex = 0; rowIndex < me.movableEmpList.length; rowIndex++) {
							if (me.movableEmpList[rowIndex].employeeId == id) {
								me.movableEmpList.splice(rowIndex, 1);
								break;
							}
						}
					}
				}

				if (me.movableEmpList.length == 0)
					$("#chkSelectAll").removeAttr("checked");
			}
			else if (me.nodeAction == "save") {
				for (var index = 0; index < me.employeesList.length; index++) {
					if (me.employeesList[index].modified) {
						me.employeesList[index].modified = false;
					}
				}
			}

			me.nodeAction = "";
		},

		deleteNode: function() {
			var me = this;
			var nodeIndex = me.getNodeIndex(me.selectedNodeId);
			var message = "";

			if (me.employeesList[nodeIndex].childNodeCount == 0)
				message = "Are you sure you want to delete the employee - [" + me.employeesList[nodeIndex].employeeName + "] permanently?";
			else
				message = "Are you sure you want to delete the employee - [" + me.employeesList[nodeIndex].employeeName + "] and its child nodes permanently?";

			if (!confirm(message)) 	
				return false;

			me.nodeAction = "delete";
			me.actionSaveNode();
		},

		actionPreviewItem: function() {
			var me = this;

			$("#popupLoading").show();
			$("#previewContainer").width($(window).width() - 80);
			$("#previewContainer").height($(window).height() - 130);
			$("#ulEditP").empty();
			me.loadPopup("hierarchyPreviewPopup");
			me.preview = true;
			me.employeeStore.reset();
			me.employeeStore.fetch("userId:[user],preview:1", me.employeesLoaded, me);
		},

		addPreviewNodes: function() {
			var me = this;
			var orgLevel = 0;
			var employeeId = 0;
		 	var managerId = 0;
            var title = "";
			var childNodeCount = 0;
			var status = 0;

			for (var index = 0; index < me.employees.length; index++) {
				orgLevel = me.employees[index].orgLevel;
				employeeId = me.employees[index].employeeId;
				managerId = me.employees[index].managerId;
				title = me.employees[index].title;
				childNodeCount = me.employees[index].childNodeCount;
				status = me.employees[index].status;

				//set up the edit tree
                //add the item underneath the parent list
				me.actionPreviewNodeAppend(orgLevel, employeeId, managerId, title, childNodeCount, status);
			}

			$("#popupLoading").hide();

			if (me.employees.length == 0)
				alert("There is no changes in hierarchy management.");
		},

		actionPreviewNodeAppend: function() {
			var args = ii.args(arguments, {
				orgLevel: {type: Number}
				, employeeId: {type: Number}
				, managerId: {type: Number}
				, title: {type: String}				
				, childNodeCount: {type: Number}
				, status: {type: Number}
			});
			var me = this;
			var className = "level" + args.orgLevel;
			var style = "";

			if (args.status == 1)
				style = "color: green;font-weight: bold;";
			else if (args.status == 2)
				style = "color: blue;font-weight: bold;";
			else if (args.status == 3)
				style = "color: red;font-weight: bold;";

            nodeHtml = "<li id='liNodeP" + args.employeeId + "'>"
		    	+ "<span class='" + className + "' id='spanP" + args.employeeId + "' style='" + style + "'>" + args.title + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id='ulEditP" + args.title + "'></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNodeP" + args.managerId)[0] == undefined)
				args.managerId = 0;

			if (args.managerId == 0)
            	treeNode = $(nodeHtml).appendTo("#ulEditP");
			else
				treeNode = $(nodeHtml).appendTo("#ulEditP" + args.managerId);

            $("#ulEditP").treeview({add: treeNode});
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

		actionSaveHierarchy: function() {
			var me = this;
			var item = [];

			me.nodeAction = "save";
			me.actionSaveItem(item);
		},

		actionResetItem: function() {
			var me = this;
			
			$("#ulEdit0").empty();
			$("#ulEditM").empty();
			me.employeeName.setValue("");
			me.employeesList = [];
			me.employeesTemp = [];
			me.movableEmpList = [];
			me.employeeId = 0;
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

			if (!fin.cmn.status.itemValid())
				return;

			me.actionResetItem();
			me.setLoadCount();
			me.employeeStore.fetch("userId:[user],jobTitle:,employeeId:0,managerId:0,searchInHierarchy:true", me.employeesLoaded, me);
		},

		actionClickItem: function(objCheckBox) {
			var me = this;

			if ($("input[id^='chkNodeM']:checked").length == me.movableEmpList.length)
				$("#chkSelectAll").attr("checked", "checked");
			else
				$("#chkSelectAll").removeAttr("checked");
		},

		actionClearItem: function() {
			var me = this;
			var checkedNodes = $("input[id^='chkNodeM']:checked");

			if (me.movableEmpList.length == checkedNodes.length) {
				$("#ulEditM").empty();
				me.movableEmpList = [];
			}
			else {
				for (var index = 0; index < checkedNodes.length; index++) {
					var id = parseInt(checkedNodes[index].id.replace("chkNodeM", ""));
					me.actionNodeRemove($("#liNodeM" + id)[0]);
	
					for (var rowIndex = 0; rowIndex < me.movableEmpList.length; rowIndex++) {
						if (me.movableEmpList[rowIndex].employeeId == id) {
							me.movableEmpList.splice(rowIndex, 1);
							break;
						}
					}
				}
			}

			if (me.movableEmpList.length == 0)
				$("#chkSelectAll").removeAttr("checked");
		},
		
		actionDeleteItem: function() {
			var me = this;
			var checkedNodes = $("input[id^='chkNodeM']:checked");

			if (checkedNodes.length == 0)
				return;
				
			if (!confirm("Are you sure you want to delete the selected employee(s) permanently?")) 	
				return false;

			me.nodeAction = "delete";
			me.actionSaveNode();
		},

		actionSaveNode: function() {
			var me = this;
			var item = [];

//			var nodeIndex = me.getNodeIndex(me.selectedNodeId);
//			if (me.nodeAction == "delete") {
//				me.employeesList[nodeIndex].status = 3;
//				item = me.employeesList[nodeIndex];
//			}			

			me.actionSaveItem(item);				
		},

		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: {type: fin.emp.hierarchy.Employee}
			});			
			var me = this;
			var item = args.item;		
			var xml = "";

			if (me.nodeAction == "delete") {
				for (var index = 0; index < me.movableEmpList.length; index++) {
					if ($("#chkNodeM" + me.movableEmpList[index].employeeId).is(":checked")) {
						xml += '<employeeHierarchy';
						xml += ' employeeId="' + me.movableEmpList[index].employeeId + '"';
						xml += ' managerId="' + me.movableEmpList[index].managerId + '"';
						xml += ' active="false"';
						xml += '/>';
					}
				}
			}
			else if (me.nodeAction == "save") {
				for (var index = 0; index < me.employeesList.length; index++) {
					if (me.employeesList[index].modified) {
						xml += '<employeeHierarchy';
						xml += ' employeeId="' + me.employeesList[index].employeeId + '"';
						xml += ' managerId="' + me.employeesList[index].managerId + '"';
						xml += ' active="true"';
						xml += '/>';
					}
				}
			}

			return xml;
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.emp.hierarchy.Employee}
			});
			var me = this;
			var item = args.item;
			var xml = me.saveXmlBuild(item);

			if (xml == "")
				return;

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

						case "empEmployeeHierarchy":
							me.employeeId = parseInt($(this).attr("id"), 10);
							break;
					}
				});
				ii.trace("Save Success", ii.traceTypes.Information, "Info");
				me.updateNode(item);
				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				alert("[SAVE FAILURE] Error while updating the employee hierarchy information: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {

	var intervalId = setInterval(function() {

		if (importCompleted) {
			clearInterval(intervalId);
			fin.hierarchyUi = new fin.emp.hierarchy.UserInterface();
			fin.hierarchyUi.resize();
		}

	}, 100);
}
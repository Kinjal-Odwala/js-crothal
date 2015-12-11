ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.app.systemVariable.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );

ii.Class({
    Name: "fin.app.systemVariable.UserInterface",
    Definition: {
	
		init: function () {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.accountId = 0;
			me.status = "";
			me.lastSelectedIndex = -1;
			me.loadCount = 0;	
			
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
						
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\SystemVariable";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
						
			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_app_systemVariable_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			me.systemVariableReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			
			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");
			
				me.resize();
				me.resizeControls();				
				me.controlVisible();				
				ii.timer.timing("Page displayed");
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.systemVariableStore.fetch("userId:[user]", me.systemVariablesLoaded, me); 
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_app_systemVariable_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
			
		resize: function() {
			var args = ii.args(arguments, {});
			
			fin.app.systemVariableUi.systemVariableGrid.setHeight($(window).height() - 110);
			$("#SystemVariableContainer").height($(window).height() - 152);					
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current application system variable.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New (Ctrl+N)", 
					title: "Add the new application system variable.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo the changes to application system variable being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() {	me.actionSaveItem(); },
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
		
			me.systemName = new ui.ctl.Input.Text({
		        id: "SystemName",
				required : false,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.systemName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.systemValue = new ui.ctl.Input.Text({
		        id: "SystemValue",
				required : false,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.systemValue.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.systemVariableGrid = new ui.ctl.Grid({
				id: "SystemVariableGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.systemVariableGrid.addColumn("variableName", "variableName", "Name", "Name", 300);
			me.systemVariableGrid.addColumn("variableValue", "variableValue", "Value", "Value", null);
			me.systemVariableGrid.capColumns();

		},
		
		resizeControls: function() {
			var me = this;
			
			me.systemName.resizeText();
			me.systemValue.resizeText();
			me.resize();
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
						
					case 78: // Ctrl+N
						me.actionNewItem();
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
			
		configureCommunications: function() {
			var me = this;
			
			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.app.systemVariable.SystemVariable,
				itemConstructorArgs: fin.app.systemVariable.systemVariableArgs,
				injectionArray: me.systemVariables
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
		
		controlVisible: function(){
			var me = this;
			
			if (me.systemVariableReadOnly) {
				$("#SystemNameText").attr('disabled', true);
				$("#SystemValueText").attr('disabled', true);
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		systemVariablesLoaded:function(me, activeId) {
			
			me.controlVisible();			
			me.systemVariableGrid.setData(me.systemVariables);
			me.systemVariableGrid.body.select(0);
			me.checkLoadCount();
		},
		
		itemSelect: function() {			
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data item to select
			});			
			var me = this;
			var index = args.index;
			var itemIndex = 0;			
			var item = me.systemVariableGrid.data[index];
			
			me.lastSelectedRowIndex = index;
			
			if (item == undefined) 
				return;
			
			if (me.systemVariableGrid.data[index] != undefined) {

				me.systemVariableId = me.systemVariableGrid.data[index].id;		
				me.systemName.setValue(me.systemVariableGrid.data[index].variableName);
				me.systemValue.setValue(me.systemVariableGrid.data[index].variableValue);
			}
			else
				me.systemVariableId = 0;
				
			me.setStatus("Loaded");
		},
		
		actionNewItem: function() {
			var me = this;			
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.systemVariableReadOnly) return;
			
			me.status = "new";				
			me.systemVariableId = 0;
			me.systemName.setValue("");
			me.systemValue.setValue("");
			me.setStatus("Loaded");
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";
			
			if (me.lastSelectedRowIndex >= 0) {
				me.systemVariableGrid.body.select(me.lastSelectedRowIndex);
				me.itemSelect(me.lastSelectedRowIndex);
			}
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.systemVariableReadOnly) return;
			
			if (me.status == "") {
				if (me.lastSelectedRowIndex == -1 || me.lastSelectedRowIndex == undefined)
					me.status = "new";
				else
					me.status = "update";
			}
		
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");
				
			var item = new fin.app.systemVariable.SystemVariable(
				me.systemVariableId
				, me.systemName.getValue()
				, me.systemValue.getValue()
				, true
				);				
			
			var xml = me.saveXmlBuildItem(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.app.systemVariable.SystemVariable}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
				
			xml += '<systemVariable';
			xml += ' id="' + item.id + '"';
			xml += ' variableName="' + ui.cmn.text.xml.encode(item.variableName) + '"';
			xml += ' variableValue="' + ui.cmn.text.xml.encode(item.variableValue) + '"';
			xml += ' active="true"';			
			xml += '/>';
			
			return xml;			
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
	
			if (status == "success") {
				me.modified(false);
				
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "AppSystemVariable":						
									
							if (me.status == "new") {
								me.systemVariableId = parseInt($(this).attr("id"), 10);
								item.id = me.systemVariableId;
								me.systemVariables.push(item);
								me.lastSelectedRowIndex = me.systemVariables.length - 1;
							}
							else {
								me.lastSelectedRowIndex = me.systemVariableGrid.activeRowIndex;
								me.systemVariables[me.lastSelectedRowIndex] = item;
							}
							
							me.status = "";
							me.systemVariableGrid.setData(me.systemVariables);
							me.systemVariableGrid.body.select(me.lastSelectedRowIndex);
									
							break;	
					}
				});
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating System Variable details: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.app.systemVariableUi = new fin.app.systemVariable.UserInterface();
	fin.app.systemVariableUi.resize();
}
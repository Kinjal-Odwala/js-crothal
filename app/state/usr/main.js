ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.app.state.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );

ii.Class({
    Name: "fin.app.state.UserInterface",
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
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\StateMinWage";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);	

			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
		},

		authorizationProcess: function fin_app_state_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			ii.timer.timing("Page Displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},

		sessionLoaded: function fin_app_state_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			fin.app.stateUi.stateGrid.setHeight($(window).height() - 85);
			$("#StateContentArea").height($(window).height() - 127);			
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
						me.actionUndoItem();
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

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save State (Ctrl+S)",
					title: "Save the State details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo current changes to State (Ctrl+U)",
					title: "Undo the changes to State being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() {	me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
			
			me.minimumWage = new ui.ctl.Input.Text({
		        id: "MinimumWage",
		        maxLength: 6,
				required : false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.minimumWage
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.minimumWage.getValue();
					
					if (enteredText == "") return;

					if (!(/^\d{1,3}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Minimum Wage. Example: 9.99");
				});

			me.stateGrid = new ui.ctl.Grid({
				id: "StateGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.stateGrid.addColumn("brief", "brief", "Brief", "Brief", 120);
			me.stateGrid.addColumn("name", "name", "Title", "Title", null);
			me.stateGrid.addColumn("minimumWage", "minimumWage", "Minimum Wage", "Minimum Wage", 130);
			me.stateGrid.capColumns();
		},

		configureCommunications: function() {
			var me = this;

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.app.state.StateType,
				itemConstructorArgs: fin.app.state.stateTypeArgs,
				injectionArray: me.stateTypes	
			});			
		},

		modified: function fin_cmn_status_modified() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		stateTypesLoaded:function(me, activeId) {

			me.stateGrid.setData(me.stateTypes);
			me.minimumWage.resizeText();
			$("#pageLoading").hide();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data item to select
			});
			var me = this;
			var index = args.index;
			var item = me.stateGrid.data[index];

			if (item == undefined) 
				return;

			$("#Title").html(item.name)
			me.minimumWage.setValue(item.minimumWage);
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.itemSelect(me.stateGrid.activeRowIndex);
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.stateGrid.activeRowIndex == -1)
				return;

			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			var item = me.stateGrid.data[me.stateGrid.activeRowIndex];
			item.minimumWage = me.minimumWage.getValue();
			
			var xml = me.saveXmlBuildItem(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: { me: me, item: item }
			});

			return true;
		},

		saveXmlBuildItem: function() {
			var args = ii.args(arguments, {
				item: { type: fin.app.state.StateType }
			});
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<appState';
			xml += ' id="' + item.id + '"';
			xml += ' minimumWage="' + item.minimumWage + '"';
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

			$("#pageLoading").hide();

			if (status == "success") {
				
				me.modified(false);
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "appStateType":
							me.stateTypes[me.stateGrid.activeRowIndex] = item;
							me.stateGrid.body.renderRow(me.stateGrid.activeRowIndex, me.stateGrid.activeRowIndex);
							break;
					}
				});
			}
			else
				alert("[SAVE FAILURE] Error while updating State: " + $(args.xmlNode).attr("message"));
		}
	}
});

function main() {
	fin.app.stateUi = new fin.app.state.UserInterface();
	fin.app.stateUi.resize();
}
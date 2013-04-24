ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.rev.taxableService.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );

ii.Class({
    Name: "fin.rev.taxableService.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.loadCount = 0;
			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\AccountsReceivable\\TaxableServices";
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
		},

		authorizationProcess: function fin_app_state_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
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
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.taxableServiceStore.fetch("userId:[user]", me.taxableServicesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_app_state_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			fin.rev.taxableServiceUi.stateGrid.setHeight($(window).height() - 100);
			fin.rev.taxableServiceUi.taxableServiceGrid.setHeight($(window).height() - 127);
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
					brief: "Save Taxable Service Association (Ctrl+S)",
					title: "Save the State - Taxable Service association details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo Taxable Service Association (Ctrl+U)",
					title: "Undo the changes to State - Taxable Service Association being edited.",
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

			me.stateGrid = new ui.ctl.Grid({
				id: "StateGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return fin.cmn.status.itemValid(); }
			});

			me.stateGrid.addColumn("brief", "brief", "Brief", "Brief", 150);
			me.stateGrid.addColumn("name", "name", "Title", "Title", null);
			me.stateGrid.capColumns();
			
			me.taxableServiceGrid = new ui.ctl.Grid({
				id: "TaxableServiceGrid",
				appendToId: "divForm",
				allowAdds: false				
			});

			me.taxableServiceGrid.addColumn("taxableServiceTitle", "taxableServiceTitle", "Title", "Title", null);
			me.taxableServiceGrid.addColumn("taxable", "", "Taxable", "Taxable", 80, function(data) {
				var index = me.taxableServiceGrid.rows.length - 1;
	            return "<center><input type=\"radio\" name=\"taxable" + index + "\" id=\"taxableInputRadio" + index + "\" value=\"true\" class=\"iiInputCheck\"" + (data.taxable == true ? 'checked' : '') + " onclick=\"fin.rev.taxableServiceUi.actionClickItem(this, " + index + ");\" /></center>";
            });
			me.taxableServiceGrid.addColumn("exempt", "", "Exempt", "Exempt", 80, function(data) {
				var index = me.taxableServiceGrid.rows.length - 1;
                return "<center><input type=\"radio\" name=\"taxable" + index + "\" id=\"exemptInputRadio" + index + "\" value=\"false\" class=\"iiInputCheck\"" + (data.taxable == false ? 'checked' : '') + " onclick=\"fin.rev.taxableServiceUi.actionClickItem(this, " + index + ");\" /></center>";
            });
			me.taxableServiceGrid.capColumns();
		},

		configureCommunications: function() {
			var me = this;

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.rev.taxableService.StateType,
				itemConstructorArgs: fin.rev.taxableService.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.taxableServices = [];
			me.taxableServiceStore = me.cache.register({
				storeId: "revTaxableServices",
				itemConstructor: fin.rev.taxableService.TaxableService,
				itemConstructorArgs: fin.rev.taxableService.taxableServiceArgs,
				injectionArray: me.taxableServices
			});
			
			me.taxableServiceStates = [];
			me.taxableServiceStateStore = me.cache.register({
				storeId: "revTaxableServiceStates",
				itemConstructor: fin.rev.taxableService.TaxableServiceState,
				itemConstructorArgs: fin.rev.taxableService.taxableServiceStateArgs,
				injectionArray: me.taxableServiceStates
			});
		},
		
		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
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

		stateTypesLoaded:function(me, activeId) {

			me.stateGrid.setData(me.stateTypes);
			me.checkLoadCount();
		},
		
		taxableServicesLoaded: function(me, activeId) {
 
 			me.checkLoadCount();
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

			me.setLoadCount();
			me.taxableServiceStateStore.fetch("userId:[user],stateId:" + item.id, me.taxableServiceStatesLoaded, me);
		},
		
		taxableServiceStatesLoaded: function(me, activeId) {

			for (var index = 0; index < me.taxableServices.length; index++) {
				var found = false;
				for (var iIndex = 0; iIndex < me.taxableServiceStates.length; iIndex++) {
					if (me.taxableServices[index].id ==  me.taxableServiceStates[iIndex].taxableService) {
						found = true;
						break;
					}
				}

				if (!found) {
					var item = new fin.rev.taxableService.TaxableServiceState({id: 0
						, taxableService: me.taxableServices[index].id
						, taxableServiceTitle: me.taxableServices[index].title
						, stateType: me.stateTypes[me.stateGrid.activeRowIndex].id
						, taxable: false
						});
					me.taxableServiceStates.push(item);
				}
			}

 			me.taxableServiceGrid.setData(me.taxableServiceStates);
			me.checkLoadCount();
        },
		
		actionClickItem: function(object, index) {
			var me = this;
			
			me.taxableServiceStates[index].modified = true;
			me.modified(true);
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!fin.cmn.status.itemValid())
				return;

			me.taxableServiceStatesLoaded(me, 0);
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];

			if (me.stateGrid.activeRowIndex == -1)
				return;

			for (var index = 0; index < me.taxableServiceStates.length; index++) {
				if (me.taxableServiceStates[index].modified || me.taxableServiceStates[index].id == 0) {
					me.taxableServiceStates[index].taxable = $("input[name='taxable" + index + "']:checked").val();
					item.push(new fin.rev.taxableService.TaxableServiceState(
						me.taxableServiceStates[index].id
						, me.taxableServiceStates[index].taxableService
						, me.taxableServiceStates[index].taxableServiceTitle
						, me.taxableServiceStates[index].stateType
						, me.taxableServiceStates[index].taxable
					));
				}
			}
			
			var xml = me.saveXmlBuildItem(item);
			
			if (xml == "")
				return;
				
			me.setStatus("Saving");

			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

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
				items: {type: [fin.rev.taxableService.TaxableServiceState]}
			});
			var me = this;
			var items = args.items;
			var xml = "";

			for (var index = 0; index < items.length; index++) {
				xml += '<revTaxableServiceState';
				xml += ' id="' + items[index].id + '"';
				xml += ' taxableService="' + items[index].taxableService + '"';
				xml += ' stateType="' + items[index].stateType + '"';
				xml += ' taxable="' + items[index].taxable + '"';
				xml += ' />';
			}

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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "revTaxableServiceState":
							id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.taxableServiceStates.length; index++) {
								me.taxableServiceStates[index].modified = false;
								if (me.taxableServiceStates[index].id <= 0) {
									me.taxableServiceStates[index].id = id;
									break;
								}
							}

							break;
					}
				});
				
				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating the taxability matrix: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.rev.taxableServiceUi = new fin.rev.taxableService.UserInterface();
	fin.rev.taxableServiceUi.resize();
}
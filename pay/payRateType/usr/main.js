ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.pay.payRateType.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.pay.payRateType.UserInterface",
    Definition: {

		init: function() {
			var me = this;

			me.epayRateTypeId = 0;
			me.loadCount = 0;
			me.lastSelectedRowIndex = -1;
			me.status = "";

			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\PayRateTypes";
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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.payCodeType.fetchingData();
				me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.payCodeTypesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			fin.pay.payRateTypeUi.payRateTypeGrid.setHeight($(window).height() - 110);
			$("#RightContainer").height($(window).height() - 150);
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current Pay Rate Type details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New (Ctrl+N)", 
					title: "Create a new Pay Rate Type details.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "deleteAction", 
					brief: "Delete (Ctrl+U)", 
					title: "Delete the selected Pay Rate Type details.",
					actionFunction: function() { me.actionDeleteItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo the changes to Pay Rate Type being edited.",
					actionFunction: function() { me.actionUndoItem(); }
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

			me.anchorDelete = new ui.ctl.buttons.Sizeable({
				id: "AnchorDelete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDeleteItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.payRateTypeGrid = new ui.ctl.Grid({
				id: "PayRateTypeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { 
					if (me.status != "new") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.payRateTypeGrid.addColumn("rateTypeID", "rateTypeID", "Rate Type ID", "Rate Type ID", 150);
			me.payRateTypeGrid.addColumn("payCode", "payCode", "Pay Code", "Pay Code", null, function(type) { return type.brief + " - " + type.name; });
			me.payRateTypeGrid.capColumns();

			me.rateTypeID = new ui.ctl.Input.Text({
		        id: "RateTypeID",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });

			me.rateTypeID.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.payCodeType = new ui.ctl.Input.DropDown.Filtered({
				id : "PayCodeType",
				formatFunction: function(type) { return type.brief + " - " + type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.payCodeType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.payCodeType.indexSelected === -1)
						this.setInvalid("Please select the correct Pay Code.");
				});
		},

		configureCommunications: function() {
			var me = this;

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.pay.payRateType.PayCodeType,
				itemConstructorArgs: fin.pay.payRateType.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});

			me.payRateTypes = [];
			me.payRateTypeStore = me.cache.register({
				storeId: "ePayRateTypePayCodes",
				itemConstructor: fin.pay.payRateType.PayRateType,
				itemConstructorArgs: fin.pay.payRateType.payRateTypeArgs,
				injectionArray: me.payRateTypes,
				lookupSpec: {payCode: me.payCodeTypes}
			});
		},

		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});
			var event = args.event;
			var me = event.data;
			var processed = false;

			if (event.ctrlKey) {
				switch (event.keyCode) {
					case 83:// Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 78: // Ctrl+N
						me.actionNewItem();
						processed = true;
						break;

					case 68: // Ctrl+D
						me.actionDeleteItem();
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

		resizeControls: function() {
			var me = this;

			me.rateTypeID.resizeText();
			me.payCodeType.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.epayRateTypeId = 0;
			me.validator.reset();
			me.rateTypeID.setValue("");
			me.payCodeType.reset();
		},

		payCodeTypesLoaded: function(me, activeId) {

			me.payCodeType.setData(me.payCodeTypes);
			me.payRateTypeStore.fetch("userId:[user]", me.payRateTypesLoaded, me);
		},

		payRateTypesLoaded: function(me, activeId) {

			me.payRateTypeGrid.setData(me.payRateTypes);
			me.payRateTypeGrid.body.select(0);
			me.checkLoadCount();
			me.resizeControls();
		},

		itemSelect: function() {			
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.payRateTypeGrid.data[index];

			if (!parent.fin.cmn.status.itemValid()) {
				me.payRateTypeGrid.body.deselect(index, true);
				return;
			}

			me.lastSelectedRowIndex = index;
			me.status = "";	

			if (item !== undefined) {
				me.epayRateTypeId = item.id;				
				me.rateTypeID.setValue(item.rateTypeID);
				itemIndex = ii.ajax.util.findIndexById(me.payRateTypeGrid.data[index].payCode.id.toString(), me.payCodeTypes);
				if (itemIndex !== undefined && itemIndex >= 0)
					me.payCodeType.select(itemIndex, me.payCodeType.focused);
			}
			else {
				me.epayRateTypeId = 0;
			}

			me.setStatus("Loaded");					
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.lastSelectedRowIndex >= 0) {
				me.payRateTypeGrid.body.select(me.lastSelectedRowIndex);
				me.itemSelect(me.lastSelectedRowIndex);
			}
		},

		actionNewItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.resetControls();
			me.payRateTypeGrid.body.deselectAll();
			me.status = "new";
			me.setStatus("Loaded");	
		},
		
		actionDeleteItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.lastSelectedRowIndex >= 0) {
				if (!confirm("Are you sure you want to delete the Rate Type ID " + me.payRateTypeGrid.data[me.lastSelectedRowIndex].rateTypeID + "?"))
					return;
				me.status = "delete";
				me.actionSaveItem();
			}
		},

		actionSaveItem: function() {
			var me = this;

			if (me.status === "") {
				if (me.lastSelectedRowIndex === -1 || me.lastSelectedRowIndex === undefined)
					me.status = "new";
				else
					me.status = "update";
			}

			if (me.status !== "delete") {
				me.validator.forceBlur();
				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			}

			me.setStatus("Saving");
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			var item = new fin.pay.payRateType.PayRateType(
				me.epayRateTypeId
				, me.payCodeTypes[me.payCodeType.indexSelected]
				, me.rateTypeID.getValue()
				);

			var xml = me.saveXmlBuild(item);

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
				item: {type: fin.pay.payRateType.PayRateType}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.status === "delete") {
				xml += '<ePayRateTypePayCodeMappingDelete';
				xml += ' id="' + item.id + '"';
				xml += '/>';
			}
			else {
				xml += '<ePayRateTypePayCodeMappingUpdate';
				xml += ' id="' + item.id + '"';
				xml += ' payCodeId="' + item.payCode.id + '"';
				xml += ' rateTypeID="' + ui.cmn.text.xml.encode(item.rateTypeID) + '"';
				xml += '/>';
			}

			return xml;
		},

		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status === "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "payRateTypePayCodeMapping":
							if (me.status === "delete") {
								me.resetControls();
								me.payRateTypes.splice(me.lastSelectedRowIndex, 1);
								me.payRateTypeGrid.setData(me.payRateTypes);
								me.lastSelectedRowIndex = -1;
							}
							else if (me.status === "new") {
								me.epayRateTypeId = parseInt($(this).attr("id"), 10);
								item.id = me.epayRateTypeId;
								me.payRateTypes.push(item);
								me.payRateTypeGrid.setData(me.payRateTypes);
								me.lastSelectedRowIndex = me.payRateTypeGrid.data.length - 1;
								me.payRateTypeGrid.body.select(me.lastSelectedRowIndex);
							}
							else {
								me.payRateTypes[me.lastSelectedRowIndex] = item;
								me.payRateTypeGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							me.status = "";
							break;
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Pay Rate Type details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.pay.payRateTypeUi = new fin.pay.payRateType.UserInterface();
	fin.pay.payRateTypeUi.resize();
}
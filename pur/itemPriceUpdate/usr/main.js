ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.itemPriceUpdate.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );

ii.Class({
    Name: "fin.pur.itemPriceUpdate.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.itemId = 0;
			me.lastSelectedRowIndex = -1;
			me.status = "";
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway,
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\PriceUpdate";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			me.activeStatusesLoaded();

			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			$("#divEffectiveDate").hide();
			$("#UpdateByPercentage").hide();
			$("input[name='ScheduleOn']").click(function() {
				if (this.id == "UpdateNow")
					$("#divEffectiveDate").hide();
				else if (this.id == "EffectiveOn")
					$("#divEffectiveDate").show();
			});
			
			$("input[name='UpdatePriceBy']").click(function() {
				if (this.id == "UpdatePriceByAmount") {
					$("#NewPrice").show();
					$("#UpdateByPercentage").hide();					
				}
				else if (this.id == "UpdatePriceByPercentage") {
					$("#NewPrice").hide();
					$("#UpdateByPercentage").show();
				}
			});
			
			setTimeout(function() { me.resizeControls(); }, 500);
			$("#SelectItemPrice").click(function() { me.modified(true); });
			$("input[name='ScheduleOn']").change(function() { me.modified(true); });
			$("input[name='UpdatePriceBy']").change(function() { me.modified(true); });
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},	

		authorizationProcess: function fin_pur_itemPriceUpdate_UserInterface_authorizationProcess() {
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
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_pur_itemPriceUpdate_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});
			var me = fin.itemPriceUpdateUi;
			
			if (me != undefined) {
				me.itemGrid.setHeight($(window).height() - 160);
				me.catalogItemGrid.setHeight($(window).height() - 385);
			}

			$("#catalogItemsLoading").height($(window).height() - 150);			
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
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "saveAction", 
					brief: "Save (Ctrl+S)", 
					title: "Save the Purchase Order Catalog Items price",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo Changes (Ctrl+U)", 
					title: "Undo changes to the selected Item",
					actionFunction: function() { me.actionUndoItem(); }
				})

			me.anchorEffectivePrice = new ui.ctl.buttons.Sizeable({
				id: "AnchorEffectivePrice",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Effective Price&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionEffectivePriceItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>Search</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});

			me.activeSearch = new ui.ctl.Input.DropDown.Filtered({
			    id: "ActiveSearch",
			    formatFunction: function (type) { return type.name; }
			});

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});

			me.searchInput.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

				if (me.searchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});

			me.selectAll = new ui.ctl.Input.Check({
		        id: "SelectAll",
				changeFunction: function() { me.actionSelectAllItem(); me.modified();}
		    });

			me.effectiveDate = new ui.ctl.Input.Date({
		        id: "EffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFuncAtDateClick: function() { me.modified(); }
		    });

			me.effectiveDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.effectiveDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");

					if (new Date(enteredText) <= new Date()) 
						this.setInvalid("The Effective Date should be greater than Current Date.");
				});

			me.price = new ui.ctl.Input.Money({
		        id: "Price",
				changeFunction: function() { me.modified(); }
		    });

			me.price.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.price.lastBlurValue;

				if (enteredText == "") return;

				if ($("input[name='UpdatePriceBy']:checked").val() == "1") {
					if (!(/^[+]?[0-9]+(\.[0-9]+)?$/.test(enteredText)))
						this.setInvalid("Please enter valid Price.");
				}
				else if (!(/^[-]?[0-9]+(\.[0-9]+)?$/.test(enteredText)))
					this.setInvalid("Please enter valid Price.");
			});
			
			me.selectItemPrice = new ui.ctl.Input.Check({
		        id: "SelectItemPrice"
		    });
			
			me.itemPrice = new ui.ctl.Input.Text({
		        id: "ItemPrice",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemPrice.text.readOnly = true;

			me.itemGrid = new ui.ctl.Grid({
				id: "ItemGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.itemGrid.addColumn("number", "number", "Number", "Number", 120);
			me.itemGrid.addColumn("description", "description", "Description", "Description", null);
			me.itemGrid.addColumn("price", "price", "Price", "Price", 90);
			me.itemGrid.capColumns();
			
			me.catalogItemGrid = new ui.ctl.Grid({
				id: "CatalogItemGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.catalogItemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function() {
				var index = me.catalogItemGrid.rows.length - 1;
               	return "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.itemPriceUpdateUi.actionClickItem(this);\" onchange=\"parent.fin.appUI.modified = true;\"/>";
            });
			me.catalogItemGrid.addColumn("catalogTitle", "catalogTitle", "Catalog Title", "Catalog Title", null);
			me.catalogItemGrid.addColumn("price", "price", "Price", "Price", 90);
			me.catalogItemGrid.addColumn("effectivePrice", "effectivePrice", "Effective Price", "Effective Price", 120);
			me.catalogItemGrid.capColumns();

			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
		},
				
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.items = [];
			me.itemStore = me.cache.register({
				storeId: "purItems",
				itemConstructor: fin.pur.itemPriceUpdate.Item,
				itemConstructorArgs: fin.pur.itemPriceUpdate.itemArgs,
				injectionArray: me.items
			});
			
			me.catalogItems = [];
			me.catalogItemStore = me.cache.register({
				storeId: "purCatalogItems",
				itemConstructor: fin.pur.itemPriceUpdate.CatalogItem,
				itemConstructorArgs: fin.pur.itemPriceUpdate.catalogItemArgs,
				injectionArray: me.catalogItems				
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
		
		resizeControls: function() {
			var me = this;
			
			me.searchInput.resizeText();
			me.price.resizeText();
			me.effectiveDate.resizeText();
			me.itemPrice.resizeText();
			me.resize();
			me.searchInput.text.focus();
		},
		
		resetControls: function() {
			var me = this;
			
			me.itemId = 0;
			me.validator.reset();
			me.price.setValue("");
			me.effectiveDate.setValue("");
			me.selectItemPrice.check.checked = true;
			me.itemPrice.setValue("");
			me.catalogItemGrid.setData([]);
			$("#UpdateNow")[0].checked = true;
			$("#UpdatePriceByAmount")[0].checked = true;
			$("#divEffectiveDate").hide();
			$("#UpdateByPercentage").hide();
			$("#NewPrice").show();
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.loadSearchResults();
			}
		},
		
		loadSearchResults: function() {
			var me = this;	
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.searchInput.getValue().length < 3) {
				me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}			
			else {
				me.searchInput.valid = true;
				me.searchInput.updateStatus();
			}
			me.setLoadCount();
			me.itemStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue()
                               + ",active:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number), me.itemsLoaded, me);
		},

		activeStatusesLoaded: function () {
		    me = this;

		    me.activeStatuses = [];
		    me.activeStatuses.push(new fin.pur.itemPriceUpdate.ActiveStatus(1, -1, "All"));
		    me.activeStatuses.push(new fin.pur.itemPriceUpdate.ActiveStatus(2, 1, "Yes"));
		    me.activeStatuses.push(new fin.pur.itemPriceUpdate.ActiveStatus(3, 0, "No"));

		    me.activeSearch.setData(me.activeStatuses);
		    me.activeSearch.select(0, me.activeSearch.focused);
		},
		
		itemsLoaded: function(me, activeId) {

			if (me.items[0] == null)
				alert("No matching record found!!");
			
			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.itemGrid.setData(me.items);
			me.checkLoadCount();
		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var item = me.itemGrid.data[index];

			me.lastSelectedRowIndex = index;

			if (item != undefined) {
				me.itemId = item.id;
			}
			else {
				me.itemId = 0;
				me.itemPrice.setValue("");
			}
			
			if(me.status == "")
				me.setLoadCount();
			me.catalogItemStore.fetch("userId:[user],itemId:" + me.itemId
                     + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number), me.catalogItemsLoaded, me);
		},

		catalogItemsLoaded: function(me, activeId) {

			me.resetControls();
			me.catalogItemGrid.setData(me.catalogItems);
			me.itemPrice.setValue(me.itemGrid.data[me.lastSelectedRowIndex].price);

			if (me.selectAll.check.checked) {
				$("#SelectAllCheck").trigger("click");
				$("#SelectAllCheck").triggerHandler("click");
				me.modified(false);		
				for (var index = 0; index < me.catalogItems.length; index++) {
					$("#selectInputCheck" + index)[0].checked = me.selectAll.check.checked;
				}		
			}
			
			if(me.status == "")
				me.checkLoadCount();
			else
				me.setStatus("Loaded");
		},

		actionClickItem: function(objCheckBox) {
			var me = this;
			var allSelected = true;

			if (objCheckBox.checked) {
				for (var index = 0; index < me.catalogItems.length; index++) {		
					if ($("#selectInputCheck" + index)[0].checked == false) {
						allSelected = false;
						break;
					}
				}
			}
			else
				allSelected = false;

			me.selectAll.setValue(allSelected.toString());
		},
		
		actionSelectAllItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			for (var index = 0; index < me.catalogItems.length; index++) {
				$("#selectInputCheck" + index)[0].checked = me.selectAll.check.checked;
			}
		},
		
		updateEffectivePrice: function() {
			var me = this;
			var price = 0;
			var effectivePrice = 0;
			var validPrice = true;
			var updatePriceBy = $("input[name='UpdatePriceBy']:checked").val();

			for (var index = 0; index < me.catalogItems.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					price = me.catalogItemGrid.data[index].price;
					if (updatePriceBy == "1")
						effectivePrice = parseFloat(me.price.getValue());
					else
						effectivePrice = parseFloat(price) + (parseFloat(price) * parseFloat(me.price.getValue()) / 100);

					if (validPrice && effectivePrice < 0)
						validPrice = false;

					$(me.catalogItemGrid.rows[index].getElement("effectivePrice")).text(effectivePrice.toFixed(2));
					me.catalogItems[index].effectivePrice = effectivePrice.toFixed(2);
				}
				else {					
					$(me.catalogItemGrid.rows[index].getElement("effectivePrice")).text("");
					me.catalogItems[index].effectivePrice = "";
				}
			}

			price = me.itemGrid.data[me.lastSelectedRowIndex].price;

			if (me.selectItemPrice.check.checked) {				
				if (updatePriceBy == "1")
					effectivePrice = parseFloat(me.price.getValue());
				else 
					effectivePrice = parseFloat(price) + (parseFloat(price) * parseFloat(me.price.getValue()) / 100);

				if (validPrice && effectivePrice < 0)
					validPrice = false;

				me.itemPrice.setValue(effectivePrice.toFixed(2));
			}
			else
				me.itemPrice.setValue(price);

			return validPrice;
		},

		updatePrice: function() {
			var me = this;

			for (var index = 0; index < me.catalogItems.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					me.catalogItems[index].price = me.catalogItems[index].effectivePrice;
					me.catalogItems[index].effectivePrice = "";
					$(me.catalogItemGrid.rows[index].getElement("price")).text(me.catalogItems[index].price);
					$(me.catalogItemGrid.rows[index].getElement("effectivePrice")).text("");
				}
			}
			
			if (me.selectItemPrice.check.checked) {
				me.itemGrid.data[me.lastSelectedRowIndex].price = me.itemPrice.getValue();
				$(me.itemGrid.rows[me.lastSelectedRowIndex].getElement("price")).text(me.itemPrice.getValue());
			}
		},

		actionEffectivePriceItem: function() {
			var me = this;

			if (!(me.price.validate(true))) {
				alert("In order to verify the effective price, the errors on the page must be corrected.");
				return false;
			}
			
			me.updateEffectivePrice();
		},

		actionUndoItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.lastSelectedRowIndex >= 0) {				
				for (var index = 0; index < me.catalogItems.length; index++) {
					if ($("#selectInputCheck" + index)[0].checked)
						me.catalogItems[index].effectivePrice = "";
				}
				
				me.status = "Undo";
				me.itemSelect(me.lastSelectedRowIndex);
			}
			else 
				me.resetControls();	
			
			me.setStatus("Loaded")	
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			var valid = true;
			var ScheduleOn = $("input[name='ScheduleOn']:checked").val();
			
			me.status = "";
			// Check to see if the data entered is valid
			if (!(me.price.validate(true)))
				valid = false;

			if (ScheduleOn == "0" && !(me.effectiveDate.validate(true)))
				valid = false;

			if (!valid) {
				alert("In order to save, the errors on the page must be corrected.");
				return;
			}
			
			var catalogs = $("#itemSelectBodyColumn input:checked");
			if (catalogs.length == 0) {
				alert("Select at least one Catalog.");
				return;
			}			

			if (!me.updateEffectivePrice()) {
				alert("The effective price is not valid.");
				return;
			}

			if (ScheduleOn == "1") {
				if (!confirm("Are you sure you want to update the item price now?"))
					return;

				if (me.selectItemPrice.check.checked) {
					xml = '<purItem';
					xml += ' id="' + me.itemGrid.data[me.lastSelectedRowIndex].id + '"';
					xml += ' price="' + me.itemPrice.getValue() + '"';
					xml += ' updateItemPrice="1"';
					xml += '/>';
				}

				for (var index = 0; index < me.catalogItems.length; index++) {
					if ($("#selectInputCheck" + index)[0].checked) {
						xml += '<purCatalogItem'
					    xml += ' id="' + me.catalogItems[index].id + '"';
					    xml += ' catalogId="' +  me.catalogItems[index].catalogId + '"';
					    xml += ' itemId="' + me.catalogItems[index].itemId + '"';
					    xml += ' price="' + me.catalogItems[index].effectivePrice + '"';
					    xml += ' displayOrder="' + me.catalogItems[index].displayOrder + '"';
					    xml += ' active="' + me.catalogItems[index].active + '"';
					    xml += '/>';
					}
				}
			}
			else {
				if (!confirm("Are you sure you want to update the item price on " + me.effectiveDate.lastBlurValue + "?"))
					return;

				if (me.selectItemPrice.check.checked) {
					xml += '<purCatalogItemPriceUpdateSchedule'
					xml += ' catalogItemId="' + me.catalogItems[0].id + '"';
					xml += ' price="' + me.itemPrice.getValue() + '"';
					xml += ' effectiveDate="' + me.effectiveDate.lastBlurValue + '"';
					xml += ' updateItemPrice="true"';
					xml += '/>';
				}

				for (var index = 0; index < me.catalogItems.length; index++) {
					if ($("#selectInputCheck" + index)[0].checked) {
						xml += '<purCatalogItemPriceUpdateSchedule'
					    xml += ' catalogItemId="' + me.catalogItems[index].id + '"';
						xml += ' price="' + me.catalogItems[index].effectivePrice + '"';
					    xml += ' effectiveDate="' + me.effectiveDate.lastBlurValue + '"';
						xml += ' updateItemPrice="false"';
					    xml += '/>';
					}
				}
			}

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
				referenceData: {me: me, item: item}
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
			
			if (status == "success") {

				if ($("input[name='ScheduleOn']:checked").val() == "1")
					me.updatePrice();
				
				me.modified(false);	
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Catalog Item price: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.itemPriceUpdateUi = new fin.pur.itemPriceUpdate.UserInterface();
	fin.itemPriceUpdateUi.resize();
}
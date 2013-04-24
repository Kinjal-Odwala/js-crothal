ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.item.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);

ii.Class({
    Name: "fin.pur.item.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.itemId = 0;
			me.status = "";
			me.lastSelectedRowIndex = -1;
			me.validateControl = false;
						
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\Items";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);	
			
			me.itemAccount.fetchingData();
			me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);				
			me.itemStatusesLoaded();
			me.modified(false);
		},	
		
		authorizationProcess: function fin_pur_item_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.itemsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			$("#pageLoading").hide();	
			me.controlVisible();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pur_item_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = fin.purItemUi;
			
			if (me != undefined)
				me.itemGrid.setHeight($(window).height() - 130);
			
			$("#itemContentAreaContainer").height($(window).height() - 175);		
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "saveAction", 
					brief: "Save Item (Ctrl+S)", 
					title: "Save the Item",
					actionFunction: function(){ me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction",
					brief: "New Item (Ctrl+N)", 
					title: "Add new Item",
					actionFunction: function(){ me.actionNewItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo Changes (Ctrl+U)", 
					title: "Undo changes to the selected Item",
					actionFunction: function(){ me.actionUndoItem(); }
				})
				
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
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				className: "iiButton",
				text: "<span>Search</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});
			
			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});
			
			me.searchInput.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
				if (me.status != "")
					this.valid = true;
				else if(me.searchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});
			
			me.itemStatus = new ui.ctl.Input.DropDown.Filtered({
		        id: "ItemStatus",
				formatFunction: function( type ){ return type.name; }
		    });
			
			me.itemStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.status != "")
						this.valid = true;
					else if (me.itemStatus.indexSelected == -1)
						this.setInvalid("Please select the correct Status.");
				});

			me.itemMasterId = new ui.ctl.Input.Text({
		        id: "ItemMasterId",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemMasterId.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.itemNumber = new ui.ctl.Input.Text({
		        id: "ItemNumber",
				maxLength: 255,
				changeFunction: function() { me.modified(); } 
		    });
			
			me.itemNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.itemNumber2 = new ui.ctl.Input.Text({
		        id: "ItemNumber2",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemNumber2.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemDescription = new ui.ctl.Input.Text({
		        id: "ItemDescription",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemDescription.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.itemComClass = new ui.ctl.Input.Text({
		        id: "ItemComClass",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemComClass.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemComSubClass = new ui.ctl.Input.Text({
		        id: "ItemComSubClass",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemComSubClass.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemSupplierClass = new ui.ctl.Input.Text({
		        id: "ItemSupplierClass",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemSupplierClass.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemUom = new ui.ctl.Input.Text({
		        id: "ItemUom",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemUom.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.itemAccount = new ui.ctl.Input.DropDown.Filtered({
				id : "ItemAccount",
				formatFunction: function( type ){ return type.code + " - " + type.description; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemAccount.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemAccount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.validateControl && me.itemAccount.indexSelected == -1)
						this.setInvalid("Please select the correct Account.");
				});
				
			me.itemPrice = new ui.ctl.Input.Text({
		        id: "ItemPrice",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemPrice.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
				var message = "";
				var valid = true;
				var enteredText = me.itemPrice.getValue();

				if(enteredText == '') return;
				
				if(/^[0-9]+(\.[0-9]+)?$/.test(me.itemPrice.getValue()) == false)
					this.setInvalid("Please enter valid Price.");
			});
						
			me.itemActive = new ui.ctl.Input.Check({
		        id: "ItemActive",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemActive.setValue("true");
			
			me.itemGrid = new ui.ctl.Grid({
				id: "ItemGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() {
					if (me.status != "new")
						return parent.fin.cmn.status.itemValid();
				}
			});
			
			me.itemGrid.addColumn("masterId", "masterId", "Master Id", "Master Id", 150);
			me.itemGrid.addColumn("number", "number", "Number", "Number", null);
			me.itemGrid.capColumns();
			
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#ItemStatusText").bind("keydown", me, me.actionSearchItem);				  	        
		},
		
		resizeControls: function() {
			var me = this;
			
			me.searchInput.resizeText();
			me.itemStatus.resizeText();
			me.itemMasterId.resizeText();
			me.itemNumber.resizeText();
			me.itemNumber2.resizeText();
			me.itemDescription.resizeText();
			me.itemComClass.resizeText();
			me.itemComSubClass.resizeText();
			me.itemSupplierClass.resizeText();
			me.itemUom.resizeText();
			me.itemAccount.resizeText();
			me.itemPrice.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.items = [];
			me.itemStore = me.cache.register({
				storeId: "purItems",
				itemConstructor: fin.pur.item.Item,
				itemConstructorArgs: fin.pur.item.itemArgs,
				injectionArray: me.items
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.pur.item.Account,
				itemConstructorArgs: fin.pur.item.accountArgs,
				injectionArray: me.accounts	
			});	
		},
	
		modified: function fin_cmn_status_modified() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		itemStatusesLoaded: function() {
			me = this;
			
			me.itemStatuses = [];
			me.itemStatuses.push(new fin.pur.item.ItemStatus(1, -1, "All"));
			me.itemStatuses.push(new fin.pur.item.ItemStatus(2, 1, "Yes"));
			me.itemStatuses.push(new fin.pur.item.ItemStatus(3, 0, "No"));
			
			me.itemStatus.setData(me.itemStatuses);
			me.itemStatus.select(0, me.itemStatus.focused);
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
				
			if(me.searchInput.getValue().length < 3) {
				me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}			
			else {
				me.searchInput.valid = true;
				me.searchInput.updateStatus();
			}
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
						
			me.itemStore.fetch("searchValue:" + me.searchInput.getValue() 
				+ ",active:" + (me.itemStatus.indexSelected == -1 ? -1 : me.itemStatuses[me.itemStatus.indexSelected].number) 
				+ ",userId:[user]", me.itemsLoaded, me);				
		},
		
		controlVisible: function(){
			if(me.itemsReadOnly){
				
				$("#ItemMasterIdText").attr('disabled', true);
				$("#ItemNumberText").attr('disabled', true);
				$("#ItemNumber2Text").attr('disabled', true);
				$("#ItemDescriptionText").attr('disabled', true);
				$("#ItemComClassText").attr('disabled', true);
				$("#ItemComSubClassText").attr('disabled', true);
				$("#ItemSupplierClassText").attr('disabled', true);
				$("#ItemUomText").attr('disabled', true);
				$("#ItemAccountText").attr('disabled', true);
				$("#ItemAccountAction").removeClass("iiInputAction");
				$("#ItemPriceText").attr('disabled', true);
				$("#ItemActiveCheck").attr('disabled', true);
				
				$("#actionMenu").hide();
				$(".footer").hide();
				
			}
		},
		
		itemsLoaded: function(me, activeId) {

			if(me.items[0] == null)
				alert('No matching record found!!');
			
			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.itemGrid.setData(me.items);
			
			me.controlVisible();
			$("#pageLoading").hide();
		},
				
		accountsLoaded: function(me, activeId) {
					
			me.itemAccount.reset();
			me.itemAccount.setData(me.accounts);
			me.validateControl = true;
			me.resizeControls();

			$("#pageLoading").hide();
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.itemGrid.data[index];
				
			if (!parent.fin.cmn.status.itemValid()) {
				me.itemGrid.body.deselect(index, true);
				return;
			}
			
			me.lastSelectedRowIndex = index;
			me.status = "";

			if (item == undefined) 
				return;
				
			if (me.itemGrid.data[index] != undefined) {

				me.itemId = me.itemGrid.data[index].id;		
				me.itemMasterId.setValue(me.itemGrid.data[index].masterId);
				me.itemNumber.setValue(me.itemGrid.data[index].number);
				me.itemNumber2.setValue(me.itemGrid.data[index].number2);
				me.itemDescription.setValue(me.itemGrid.data[index].description);
				me.itemComClass.setValue(me.itemGrid.data[index].comClass);
				me.itemComSubClass.setValue(me.itemGrid.data[index].comSubClass);
				me.itemSupplierClass.setValue(me.itemGrid.data[index].supplierClass);
				me.itemUom.setValue(me.itemGrid.data[index].uom);
				
				itemIndex = ii.ajax.util.findIndexById(me.itemGrid.data[index].account.toString(), me.accounts);
				if (itemIndex >= 0 && itemIndex != undefined)
					me.itemAccount.select(itemIndex, me.itemAccount.focused);

				me.itemPrice.setValue(me.itemGrid.data[index].price);
				me.itemActive.setValue(me.itemGrid.data[index].active.toString());
			}
			else
				me.itemId = 0;	
				
			me.controlVisible();	
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
		
		resetControls: function() {
			var me = this;
			
			me.validator.reset();
			me.validateControl = false;
			me.itemId = 0;
			me.itemMasterId.setValue("");
			me.itemNumber.setValue("");
			me.itemNumber2.setValue("");
			me.itemDescription.setValue("");
			me.itemComClass.setValue("");
			me.itemComSubClass.setValue("");
			me.itemSupplierClass.setValue("");
			me.itemUom.setValue("");
			me.itemAccount.reset();
			me.itemPrice.setValue("");
			me.itemActive.setValue("true");
			me.validateControl = true;
		},

		actionUndoItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";
			if (me.lastSelectedRowIndex >= 0) {
				me.itemGrid.body.select(me.lastSelectedRowIndex);
				me.itemSelect(me.lastSelectedRowIndex);
			}
			else
				me.resetControls();
		},
		
		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			me.resetControls();
			me.itemGrid.body.deselectAll();
			me.status = "new";
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
			if(me.itemsReadOnly) return;
				
			if (me.status == "") {
				if (me.lastSelectedRowIndex == -1)
					me.status = "new";
				else
					me.status = "update";
			}
			
			me.validator.forceBlur();		
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) ){
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			
			var item = new fin.pur.item.Item(
				me.itemId
				, me.itemMasterId.getValue()
				, me.itemNumber.getValue()
				, me.itemNumber2.getValue()
				, me.itemDescription.getValue()
				, me.itemComClass.getValue()
				, me.itemComSubClass.getValue()
				, me.itemSupplierClass.getValue()
				, me.itemUom.getValue()
				, me.accounts[me.itemAccount.indexSelected].id
				, me.itemPrice.getValue()
				, 1
				, me.itemActive.check.checked
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
				item: {type: fin.pur.item.Item}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
				
			xml += '<purItem';
			xml += ' id="' + item.id + '"';
			xml += ' masterId="' + ui.cmn.text.xml.encode(item.masterId) + '"';
			xml += ' number="' + ui.cmn.text.xml.encode(item.number) + '"';
			xml += ' number2="' + ui.cmn.text.xml.encode(item.number2) + '"';
			xml += ' description="' + ui.cmn.text.xml.encode(item.description) + '"';
			xml += ' comClass="' + ui.cmn.text.xml.encode(item.comClass) + '"';
			xml += ' comSubClass="' + ui.cmn.text.xml.encode(item.comSubClass) + '"';
			xml += ' supplierClass="' + ui.cmn.text.xml.encode(item.supplierClass) + '"';
			xml += ' uom="' + ui.cmn.text.xml.encode(item.uom) + '"';				
			xml += ' account="' + item.account + '"';
			xml += ' price="' + item.price + '"';
			xml += ' displayOrder="' + item.displayOrder + '"';
			xml += ' active="' + item.active + '"';
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
			var traceType = ii.traceTypes.errorDataCorruption;
			var errorMessage = "";
			
			if (status == "success") {
				me.modified(false);		
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "purItem":
						
							if (me.status == "new") {
								me.itemId = parseInt($(this).attr("id"), 10);
								item.id = me.itemId;
								me.items.push(item);
								me.lastSelectedRowIndex = me.items.length - 1;
							}
							else {
								me.lastSelectedRowIndex = me.itemGrid.activeRowIndex;
								me.items[me.lastSelectedRowIndex] = item;
							}
							
							me.status = "";
							me.itemGrid.setData(me.items);
							me.itemGrid.body.select(me.lastSelectedRowIndex);
												
							break;
					}
				});
			}
			else {
				alert('Error while updating Item Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
			
			$("#pageLoading").hide();
		}
	}
});

function main() {
	fin.purItemUi = new fin.pur.item.UserInterface();
	fin.purItemUi.resize();
}

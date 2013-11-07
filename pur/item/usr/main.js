ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.item.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

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
			me.loadCount = 0;
						
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
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
			me.setStatus("Loading");
			me.modified(false);
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},	
		
		authorizationProcess: function fin_pur_item_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.itemsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

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
				me.itemAccount.fetchingData();
				me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);				
				me.itemStatusesLoaded();				
				me.controlVisible();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_pur_item_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = fin.purItemUi;
			
			if (me != undefined)
				me.itemGrid.setHeight($(window).height() - 155);
			
			$("#itemContentAreaContainer").height($(window).height() - 200);		
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
			
			me.anchorImport = new ui.ctl.buttons.Sizeable({
				id: "AnchorImport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Import&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionImportItem(); },
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
				clickFunction: function() { me.actionUploadCancelItem(); },
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
			
			me.setLoadCount();
						
			me.itemStore.fetch("searchValue:" + me.searchInput.getValue() 
				+ ",active:" + (me.itemStatus.indexSelected == -1 ? -1 : me.itemStatuses[me.itemStatus.indexSelected].number) 
				+ ",userId:[user]", me.itemsLoaded, me);				
		},
		
		controlVisible: function() {
			
			if (me.itemsReadOnly) {
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

			if (me.items[0] == null)
				alert('No matching record found!!');
			
			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.itemGrid.setData(me.items);
			
			me.controlVisible();
			me.checkLoadCount();
		},
				
		accountsLoaded: function(me, activeId) {
					
			me.itemAccount.reset();
			me.itemAccount.setData(me.accounts);
			me.validateControl = true;
			me.resizeControls();

			me.checkLoadCount();
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
			me.setStatus("Loaded");	
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
				
			me.setStatus("Loaded");
		},
		
		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			me.resetControls();
			me.itemGrid.body.deselectAll();
			me.status = "new";
			me.setStatus("Loaded");
		},

		actionImportItem: function(type) {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.setStatus("Normal");
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			showFrame();
		},

		actionUploadItem: function() {
			var me = this;
			var fileName = "";			

			hideFrame();
			me.setStatus("Uploading");
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow"); 
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						me.setStatus("Error");
						$("#pageLoading").fadeOut("slow");
					}
					else {
						$("#messageToUser").text("Importing");
						me.setStatus("Importing");
						me.actionImport(fileName);
					}
				}			
				
			}, 1000);
		},
		
		actionUploadCancelItem: function() {
			var me = this;
			
			hideFrame();
		},
		
		actionImport: function(fileName) {
			var me = this;
			var item = [];
			var xml = "";

			me.status = "import";
			xml = '<purItemImport';
			xml += ' fileName="' + fileName + '"';
			xml += '/>';
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
			if (me.itemsReadOnly) return;
				
			if (me.status == "") {
				if (me.lastSelectedRowIndex == -1)
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

			if (status == "success") {
				me.modified(false);

				if (me.status == "import") {
					me.setStatus("Imported");
				}
				else {
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

								me.itemGrid.setData(me.items);
								me.itemGrid.body.select(me.lastSelectedRowIndex);

								break;
						}
					});
					
					me.setStatus("Saved");
				}

				me.status = "";
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Item details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function showFrame() {
	
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var frameWidth = $("#divFrame").width();
	var frameHeight = $("#divFrame").height();
	
	$("#divFrame").css({
		"top": windowHeight/2 - frameHeight/2,
		"left": windowWidth/2 - frameWidth/2
	});
	
	$("#backgroundPopup").css({
		"height": windowHeight,
		"opacity": "0.5"
	});	

	$("#backgroundPopup").fadeIn("slow");
	$("#divFrame").fadeIn("slow");	
}

function hideFrame() {

	$("#backgroundPopup").fadeOut("slow");
	$("#divFrame").fadeOut("slow");
}

function onFileChange() {
	
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));
	
	if (fileExtension == ".xlsx")
		fin.purItemUi.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {
	fin.purItemUi = new fin.pur.item.UserInterface();
	fin.purItemUi.resize();
}
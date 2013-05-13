ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.pur.catalog.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.grid" , 8);
ii.Style( "fin.cmn.usr.tabs" , 9);

ii.Class({
    Name: "fin.pur.catalog.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;			
			
			me.catalogId = -1;
			me.activeFrameId = 0;
			me.lastSelectedRowIndex = -1;
			me.loadNewCatalog = false;
			me.status = "";
			me.units = [];
			me.houseCodesTabNeedUpdate = true;
			me.itemsTabNeedUpdate = true;
			
			//pagination setup
			me.maximumRows = 250;
			me.recordCount = 0;
			me.houseCodesStartPoint = 1;			
			me.houseCodesPageCount = 0;
			me.houseCodesPageCurrent = 1;
			me.itemsStartPoint = 1;			
			me.itemsPageCount = 0;
			me.itemsPageCurrent = 1;
			
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\Catalogs";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();
			
			me.catalogUnitGrid.setData([]);
			me.catalogItemGrid.setData([]);
			me.modified(false);
			
			$("#TabCollection a").click(function() {
				
				switch(this.id) {
					case "TabHouseCodes":
						
						me.activeFrameId = 0;
						me.loadCatalogHouseCodesCount();
						me.houseCodesTabNeedUpdate = false;

						break;

					case "TabItems":

						me.activeFrameId = 1;
						me.loadCatalogItemsCount();
						me.itemsTabNeedUpdate = false;

						break;
				}
			});
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);			
			
			$("#divFrame").height(0);
			$("#iFrameUpload").height(0);
			$("#divFrame").show();
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
		},	
		
		authorizationProcess: function fin_pur_catalog_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();	
					
			me.catalogsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.controlVisible();
			me.resizeControls();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pur_catalog_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = fin.pur.purCatalogUi;
	   
			$("#catalogAssociationsContent").height($(window).height() - 203);
		    $("#catalogItemContent").height($(window).height() - 203);
			$("#container-1").tabs(1);
			me.catalogGrid.setHeight($(window).height() - 137);
			me.catalogUnitGrid.setHeight($(window).height() - 315);
			me.catalogItemGrid.setHeight($(window).height() - 235);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "saveAction", 
					brief: "Save Catalog (Ctrl+S)", 
					title: "Save the Catalog",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction",
					brief: "New Catalog (Ctrl+N)", 
					title: "Add new Catalog",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo Changes (Ctrl+U)", 
					title: "Undo changes to the selected Catalog",
					actionFunction: function() { me.actionUndoItem(); }
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
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});
			
			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				title: "To search a specific Catalog, type-in Catalog Name and press Enter key/click Search button.",
				maxLength: 50
			});		
		
			me.searchInput.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.status != "")
					this.valid = true;
				else if(me.searchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});

			me.catalogTitle = new ui.ctl.Input.Text({
		        id: "CatalogTitle",
				maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });
			
			me.catalogTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.catalogVendor = new ui.ctl.Input.DropDown.Filtered({
				id: "CatalogVendor",
				title: "To search a specific Vendor, type-in Vendor Number or Title and press Enter key.",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }				
		    });			
				
			me.catalogVendor.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

					if ((this.focused || this.touched) && me.catalogVendor.indexSelected == -1)
						this.setInvalid("Please select the correct Vendor.");
				});
						
			me.catalogActive = new ui.ctl.Input.Check({
		        id: "CatalogActive",
				changeFunction: function() { me.modified(); }  
		    });
			
			me.catalogActive.setValue("true");
			
			me.catalogGrid = new ui.ctl.Grid({
				id: "CatalogGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() {
					if (me.status != "new") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});
			
			me.catalogGrid.addColumn("title", "title", "Catalog Name", "Catalog Name", null);
			me.catalogGrid.capColumns();
			
			me.catalogUnitGrid = new ui.ctl.Grid({
				id: "CatalogUnitGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.catalogHouseCodeGridSelect(index); }
			});
			
			me.catalogUnitTitle = new ui.ctl.Input.Text({
		        id: "CatalogUnitTitle" ,
				appendToId : "CatalogUnitGridControlHolder",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.catalogUnitActive = new ui.ctl.Input.Check({
		        id: "CatalogUnitActive" ,
		        className: "iiInputCheck",
				appendToId: "CatalogUnitGridControlHolder",
				changeFunction: function() { me.modified(); } 
		    });	
			
			me.catalogUnitGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null, null, me.catalogUnitTitle);
			me.catalogUnitGrid.addColumn("active", "active", "Active", "Active", 70, null, me.catalogUnitActive);
			me.catalogUnitGrid.capColumns();
				
			me.catalogItemGrid = new ui.ctl.Grid({
				id: "CatalogItemGrid",
				appendToId: "divForm",
				allowAdds: false,
			    selectFunction: function(index) { me.catalogItemGridSelect(index); }
			});
			
			me.purCatalogItemPrice = new ui.ctl.Input.Money({
		        id: "PurCatalogItemPrice" ,
				appendToId: "CatalogItemGridControlHolder",
				changeFunction: function() { me.modified(); }		
		    });
			
			me.purCatalogItemPrice.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.purCatalogItemActive = new ui.ctl.Input.Check({
		        id: "PurCatalogItemActive" ,
		        className: "iiInputCheck",
				appendToId: "CatalogItemGridControlHolder",
				changeFunction: function() { me.modified(); } 
		    });	
			
			me.catalogItemGrid.addColumn("itemNumber", "itemNumber", "Number", "Item Number", 120);
			me.catalogItemGrid.addColumn("itemDescription", "itemDescription", "Description", "Item Description", null);
			me.catalogItemGrid.addColumn("price", "price", "Price", "Price", 100, null, me.purCatalogItemPrice);
			me.catalogItemGrid.addColumn("active", "active", "Active", "Active", 70, null, me.purCatalogItemActive);
			me.catalogItemGrid.capColumns();
			
			me.houseCodeGrid = new ui.ctl.Grid({
				id: "HouseCodeGrid",
				appendToId: "divForm"
			});			

			me.houseCodeGrid.addColumn("assigned", "assigned", "", "Checked means associated to the Catalog", 30, function() { 
				var rowNumber = me.houseCodeGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + rowNumber + "\" class=\"iiInputCheck\"" + (me.units[rowNumber].assigned == true ? checked='checked' : '') + "  onclick=\"parent.fin.appUI.modified = true;\" />";				
            });
			me.houseCodeGrid.addColumn("name", "name", "House Code", "House Code", null);
			me.houseCodeGrid.capColumns();
			me.houseCodeGrid.setHeight(250);
			
			me.purItemSearchInput = new ui.ctl.Input.Text({
				id: "PurItemSearchInput",
				title: "To search a specific Items, type-in Item # or Description and press Enter key/click Search button.",
				maxLength: 50
			});
			
			me.purItemSearchInput.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
				
				if(me.purItemSearchInput.getValue().length < 3)
					this.setInvalid("Please enter search criteria (minimum 3 characters).");					
			});
						
			me.purItemSearchButton = new ui.ctl.buttons.Sizeable({
				id: "PurItemSearchButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadItemSearchResults(); },
				hasHotState: true
			});				
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});	
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});			
			
			me.purItemGrid = new ui.ctl.Grid({
				id: "PurItemGrid",
				appendToId: "divForm",
				allowAdds: false				
			});
			
			me.purItemPrice = new ui.ctl.Input.Money({
		        id: "PurItemPrice" ,
				appendToId : "PurItemGridControlHolder",
				changeFunction: function() { me.modified(); }		
		    });
			
			me.purItemPrice.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.purItemActive = new ui.ctl.Input.Check({
		        id: "PurItemActive" ,
		        className: "iiInputCheck",
				appendToId: "PurItemGridControlHolder",
				changeFunction: function() { me.modified(); } 
		    });	
			
			me.purItemGrid.addColumn("assigned", "assigned", "", "Checked means associated to the Catalog", 30, function() { var rowNumber = me.purItemGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignItemInputCheck" + rowNumber + "\" class=\"iiInputCheck\" onclick=\"parent.fin.appUI.modified = true;\" />";				
            });
			me.purItemGrid.addColumn("number", "number", "Number", "Item Number", 150);
			me.purItemGrid.addColumn("description", "description", "Description", "Item Description", null);
			me.purItemGrid.addColumn("price", "price", "Price", "Price", 100, null, me.purItemPrice);
			me.purItemGrid.addColumn("active", "active", "Active", "Active", 70, null, me.purItemActive);
			me.purItemGrid.capColumns();
			me.purItemGrid.setHeight(250);
			
			me.catalogUnitTitle.text.readOnly = true;
			me.purCatalogItemPrice.active = false;			
			me.purItemPrice.active = false;
			me.purItemSearchInput.active = false;
			
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#PurItemSearchInputText").bind("keydown", me, me.actionItemSearch);
			$("#CatalogVendor").bind("keydown", me, me.actionVendorSearch);
			$("#imgAddHouseCodes").bind("click", function() { me.addHouseCodes(); });
			$("#imgDownloadHouseCodes").bind("click", function() { me.actionDownloadItem("houseCodes"); });
			$("#imgImportHouseCodes").bind("click", function() { me.actionImportItem("houseCodes"); });
			$("#selHouseCodesPageNumber").bind("change", function() { me.pageNumberChange("houseCodes"); });
			$("#imgPrevHouseCodes").bind("click", function() { me.prevHouseCodes(); });
			$("#imgNextHouseCodes").bind("click", function() { me.nextHouseCodes(); });
			$("#imgAddItems").bind("click", function() { me.addItems(); });
			$("#imgDownloadItems").bind("click", function() { me.actionDownloadItem("items"); });
			$("#selItemsPageNumber").bind("change", function() { me.pageNumberChange("items"); });
			$("#imgImportItems").bind("click", function() { me.actionImportItem("items"); });
			$("#imgPrevItems").bind("click", function() { me.prevItems(); });
			$("#imgNextItems").bind("click", function() { me.nextItems(); });			
		},
		
		resizeControls: function() {
			var me = this;
			
			me.searchInput.resizeText();
			me.catalogTitle.resizeText();
			me.catalogVendor.resizeText();
			me.purItemSearchInput.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pur.catalog.HirNode,
				itemConstructorArgs: fin.pur.catalog.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pur.catalog.HouseCode,
				itemConstructorArgs: fin.pur.catalog.houseCodeArgs,
				injectionArray: me.houseCodes
			});				
		
			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.catalog.Vendor,
				itemConstructorArgs: fin.pur.catalog.vendorArgs,
				injectionArray: me.vendors	
			});	
			
			me.catalogs = [];
			me.catalogStore = me.cache.register({
				storeId: "purCatalogs",
				itemConstructor: fin.pur.catalog.Catalog,
				itemConstructorArgs: fin.pur.catalog.catalogArgs,
				injectionArray: me.catalogs
			});
			
			me.catalogHouseCodes = [];
			me.catalogHouseCodeStore = me.cache.register({
				storeId: "purCatalogHouseCodes",
				itemConstructor: fin.pur.catalog.CatalogHouseCode,
				itemConstructorArgs: fin.pur.catalog.catalogHouseCodeArgs,
				injectionArray: me.catalogHouseCodes
			});
			
			me.catalogItems = [];
			me.catalogItemStore = me.cache.register({
				storeId: "purCatalogItems",
				itemConstructor: fin.pur.catalog.CatalogItem,
				itemConstructorArgs: fin.pur.catalog.catalogItemArgs,
				injectionArray: me.catalogItems				
			});
			
			me.purItems = [];
			me.purItemStore = me.cache.register({
				storeId: "purItems",
				itemConstructor: fin.pur.catalog.PurItem,
				itemConstructorArgs: fin.pur.catalog.purItemArgs,
				injectionArray: me.purItems	
			});			
			
			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "purRecordCounts",
				itemConstructor: fin.pur.catalog.RecordCount,
				itemConstructorArgs: fin.pur.catalog.recordCountArgs,
				injectionArray: me.recordCounts
			});
			
			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "purCatalogExcelFileNames",
				itemConstructor: fin.pur.catalog.FileName,
				itemConstructorArgs: fin.pur.catalog.fileNameArgs,
				injectionArray: me.fileNames
			});
		},
		
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;
			parent.fin.appUI.modified = args.modified;
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
			
			me.catalogUnitGrid.setData([]);
			me.catalogItemGrid.setData([]);
			me.units = [];

			me.catalogStore.fetch("searchValue:" + me.searchInput.getValue() + ",userId:[user]", me.catalogsLoaded, me);			
		},		
		
		catalogsLoaded: function(me, activeId) {

			me.lastSelectedRowIndex = -1;
			me.resetControls();			
			me.catalogGrid.setData(me.catalogs);
			
			$("#pageLoading").hide();
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;
			var itemIndex = 0;
			var item = me.catalogGrid.data[index];				
			
			if (!parent.fin.cmn.status.itemValid()) {
				me.catalogGrid.body.deselect(index, true);
				return;
			}
			
			me.lastSelectedRowIndex = index;
			me.status = "";	
			
			if (me.loadNewCatalog) {
				me.loadNewCatalog = false;
				return;
			}		
			if (item == undefined) 
				return;
			
			if (me.catalogGrid.data[index] != undefined) {

				me.catalogId = me.catalogGrid.data[index].id;		
				me.catalogTitle.setValue(me.catalogGrid.data[index].title);
				me.catalogActive.setValue(me.catalogGrid.data[index].active.toString());
				me.catalogVendor.fetchingData();
				me.vendorStore.reset();
				me.vendorStore.fetch("userId:[user],vendorId:" + me.catalogGrid.data[index].vendorId, me.vendorsLoaded, me);
			}
			else
				me.catalogId = 0;
				
			me.houseCodesTabNeedUpdate = true;
			me.itemsTabNeedUpdate = true;

			if (me.activeFrameId == 0)
				me.loadCatalogHouseCodesCount();
			else if (me.activeFrameId == 1)
				me.loadCatalogItemsCount();
		},
		
		actionVendorSearch: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (event.keyCode == 13) {
				me.catalogVendor.fetchingData();
				me.vendorStore.reset();
				me.vendorStore.fetch("userId:[user],vendorStatus:-1,searchValue:" + me.catalogVendor.text.value, me.vendorsLoaded, me);
			}
		},	

		vendorsLoaded: function(me, activeId) {
			
			me.catalogVendor.reset();
			me.catalogVendor.setData(me.vendors);
			
			if (me.vendors.length > 0)
				me.catalogVendor.select(0, me.catalogVendor.focused);
		},
		
		loadCatalogHouseCodesCount: function() {
			var me = this;
			
			setTimeout(function() { 
				me.catalogTitle.resizeText(); 
				me.catalogVendor.resizeText();
			}, 100);
			
			if (me.houseCodesTabNeedUpdate) {			
				$("#catalogItemsLoading").show();
				me.houseCodesTabNeedUpdate = false;
				me.recordCountStore.reset();
				me.recordCountStore.fetch("userId:[user]," + "catalogId:" + me.catalogId + ",type:catalogHouseCodes", me.catalogHouseCodesCountLoaded, me);
			}
		},		

		catalogHouseCodesCountLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selHouseCodesPageNumber");
			
			me.houseCodesStartPoint = 1;
		    me.recordCount = me.recordCounts[0].recordCount;
		    me.houseCodesPageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.houseCodesPageCurrent = Math.ceil(me.houseCodesStartPoint / me.maximumRows);
		    		    
		    //if we don't have records...
		    if (me.houseCodesPageCount == 0) me.houseCodesPageCount = 1;
		    
		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.houseCodesPageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}
		    
		    selPageNumber.val(me.houseCodesPageCurrent);
		    $("#spnHouseCodesPageInfo").html(" of " + me.houseCodesPageCount + " (" + me.recordCount + " records)");

			me.loadHouseCodes();
		},
		
		loadHouseCodes: function() {
		    var me = this;
		    
			$("#catalogItemsLoading").show();
			$("#selHouseCodesPageNumber").val(me.houseCodesPageCurrent);
			
			me.houseCodesStartPoint = ((me.houseCodesPageCurrent - 1) * me.maximumRows) + 1;
			me.catalogHouseCodeStore.reset();
			me.catalogHouseCodeStore.fetch("userId:[user],catalogId:" + me.catalogId + ",startPoint:" + me.houseCodesStartPoint + ",maximumRows:" + me.maximumRows, me.catalogHouseCodesLoaded, me);	
		},	
		
		controlVisible: function(){
			var me = this;
			
			if(me.catalogsReadOnly){
				
				$("#CatalogTitleText").attr('disabled', true);
				$("#CatalogVendorText").attr('disabled', true);
				$("#CatalogVendorAction").removeClass("iiInputAction");
				$("#CatalogActiveCheck").attr('disabled', true);
				
				me.catalogUnitGrid.columns["houseCodeTitle"].inputControl = null;
				me.catalogUnitGrid.columns["active"].inputControl = null;
				
				me.catalogItemGrid.columns["price"].inputControl = null;
				me.catalogItemGrid.columns["active"].inputControl = null;
				
				$("#imgAddHouseCodes").hide();
				$("#imgImportHouseCodes").hide();
				$("#imgDownloadHouseCodes").hide();
				
				$("#imgAddItems").hide();
				$("#imgDownloadItems").hide();
				$("#imgImportItems").hide();
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},		
		
		catalogHouseCodesLoaded: function(me, activeId) {

			me.catalogUnitGrid.setData(me.catalogHouseCodes);
			me.catalogUnitGrid.resize();
			me.catalogHouseCodesCountOnLoad = me.catalogHouseCodes.length;
			me.units = [];
			me.controlVisible();
			$("#catalogItemsLoading").hide();
		},
		
		loadCatalogItemsCount: function() {
			var me = this;
			
			if (me.itemsTabNeedUpdate) {			
				$("#catalogItemsLoading").show();
				me.itemsTabNeedUpdate = false;
				me.recordCountStore.reset();
				me.recordCountStore.fetch("userId:[user]," + "catalogId:" + me.catalogId + ",type:catalogItems", me.catalogItemsCountLoaded, me);
			}			
		},
		
		catalogItemsCountLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selItemsPageNumber");
			
			me.itemsStartPoint = 1;
		    me.recordCount = me.recordCounts[0].recordCount;
		    me.itemsPageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.itemsPageCurrent = Math.ceil(me.itemsStartPoint / me.maximumRows);
		    		    
		    //if we don't have records...
		    if (me.itemsPageCount == 0) me.itemsPageCount = 1;
		    
		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.itemsPageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}
		    
		    selPageNumber.val(me.itemsPageCurrent);
		    $("#spnItemsPageInfo").html(" of " + me.itemsPageCount + " (" + me.recordCount + " records)");

			me.loadItems();
		},
		
		loadItems: function() {
		    var me = this;

			$("#catalogItemsLoading").show();
			$("#selItemsPageNumber").val(me.itemsPageCurrent);

			me.itemsStartPoint = ((me.itemsPageCurrent - 1) * me.maximumRows) + 1;
			me.catalogItemStore.reset();
			me.catalogItemStore.fetch("userId:[user],catalogId:" + me.catalogId + ",startPoint:" + me.itemsStartPoint + ",maximumRows:" + me.maximumRows, me.catalogItemsLoaded, me);
		},

		catalogItemsLoaded: function(me, activeId) {

			me.catalogItemGrid.setData(me.catalogItems);
			me.catalogItemGrid.resize();
			me.catalogItemsCountOnLoad = me.catalogItems.length;
			me.controlVisible();			
			$("#catalogItemsLoading").hide();
		},

		catalogHouseCodeGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number} 
			});			
			var me = this;
			var index = args.index;
			
			if (me.catalogHouseCodes[index])
				me.catalogHouseCodes[index].modified = true;
		},
				
		catalogItemGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number} 
			});
			var me = this;
			var index = args.index;
			
			me.controlVisible();
			if (me.catalogItems[index])
				me.catalogItems[index].modified = true;
		},			
		
		pageNumberChange: function(type) {
		    var me = this;

			if (type == "houseCodes") {
				var selPageNumber = $("#selHouseCodesPageNumber");

		    	me.houseCodesPageCurrent = Number(selPageNumber.val());
		    	me.loadHouseCodes();
			}
			else if (type == "items") {
				var selPageNumber = $("#selItemsPageNumber");

		    	me.itemsPageCurrent = Number(selPageNumber.val());
		    	me.loadItems();
			}
		},	
		
		prevHouseCodes: function() {
		    var me = this;
			
			me.houseCodesPageCurrent--;
			
			if (me.houseCodesPageCurrent < 1)
			    me.houseCodesPageCurrent = 1;
			else				
				me.loadHouseCodes();
		},

		nextHouseCodes: function() {
		    var me = this;
			me.houseCodesPageCurrent++;
			
			if (me.houseCodesPageCurrent > me.houseCodesPageCount)
			    me.houseCodesPageCurrent = me.houseCodesPageCount;
			else
				me.loadHouseCodes();
		},
		
		prevItems: function() {
		    var me = this;
			
			me.itemsPageCurrent--;
			
			if (me.itemsPageCurrent < 1)
			    me.itemsPageCurrent = 1;
			else				
				me.loadItems();
		},

		nextItems: function() {
		    var me = this;
			me.itemsPageCurrent++;
			
			if (me.itemsPageCurrent > me.itemsPageCount)
			    me.itemsPageCurrent = me.itemsPageCount;
			else
				me.loadItems();
		},	

		resetControls: function() {
			var me = this;
			
			me.validator.reset();
			me.catalogId = 0;
			me.catalogTitle.setValue("");			
			me.catalogVendor.resetValidation(true);
			me.catalogVendor.reset();
			me.catalogVendor.updateStatus();			
			me.catalogActive.setValue("true");
		},
		
		resetGrids: function() {
			var me = this;
						
			me.catalogGrid.body.deselectAll();
			me.catalogUnitGrid.body.deselectAll();
			me.catalogItemGrid.body.deselectAll();			
			me.catalogItemStore.reset();
			me.catalogHouseCodeStore.reset();			
			me.catalogUnitGrid.setData([]);	
			me.catalogItemGrid.setData([]);
			me.units = [];			
			me.houseCodesTabNeedUpdate = true;
			me.itemsTabNeedUpdate = true;
			
			if (me.activeFrameId == 0)
				me.loadCatalogHouseCodesCount();
			else if (me.activeFrameId == 1)
				me.loadCatalogItemsCount();
		},
		
		addHouseCodes: function() {
			var me = this;
			
			if (me.catalogGrid.activeRowIndex == -1)
				return;
				
			loadPopup();

			$("#houseCodeTemplateText").val("");
			$("#itemsList").hide();
			$("#houseCodesList").show();
			$("#popupContact").show();
			
			me.units = [];
			me.houseCodeGrid.setData(me.units);
			me.houseCodeGrid.setHeight($(window).height() - 200);
		},
		
		houseCodeTemplateChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var found = false;			
			
			me.units.push(new fin.pur.catalog.Unit( 
				me.houseCodeSearchTemplate.houseCodeIdTemplate
				, me.houseCodeSearchTemplate.houseCodeTitleTemplate
				, true
				));

			me.houseCodeGrid.setData(me.units);
		},
		
		addItems: function() {
			var me = this;
			
			if (me.catalogGrid.activeRowIndex == -1)
				return;
					
			loadPopup();
			
			$("#houseCodesList").hide();
			$("#itemsList").show();		
			$("#popupContact").show();
			
			if (me.purItemGrid.activeRowIndex >= 0)		
				me.purItemGrid.body.deselect(me.purItemGrid.activeRowIndex);
					
			me.purItemSearchInput.setValue("");
			me.purItemSearchInput.resizeText();
			me.purItemSearchInput.valid = true;
			me.purItemSearchInput.updateStatus();
			me.purItemGrid.setData([]);
			me.purItemGrid.setHeight($(window).height() - 200);
		},	
		
		actionItemSearch: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.loadItemSearchResults();
			}
		},
			
		loadItemSearchResults: function() {		
		    var me = this;
			
			if(me.purItemSearchInput.getValue().length < 3) {
				me.purItemSearchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}			
			else {
				me.purItemSearchInput.valid = true;
				me.purItemSearchInput.updateStatus();
			}	
		
			$("#popupLoading").show();
			me.purItemStore.fetch("searchValue:" + me.purItemSearchInput.getValue() + ",active:1,userId:[user],", me.itemsGridLoaded, me);		
		},	
		
		itemsGridLoaded: function(me, activeId) {
	    		
			if (me.purItemGrid.activeRowIndex >= 0)		
				me.purItemGrid.body.deselect(me.purItemGrid.activeRowIndex);
			me.purItemGrid.setData(me.purItems);
			
			$("#popupLoading").hide();
		},
		
		isHouseCodeExists: function() {
			var args = ii.args(arguments, {
				houseCodeId: {type: Number} 
			});
			var me = this;		

			for(var index = 0; index < me.catalogHouseCodes.length; index++) {
				if(me.catalogHouseCodes[index].houseCode == args.houseCodeId)
					return true;
			}
			
			return false;
		},
		
		actionOkItem: function() {
			var me = this;
			var xml = "";
			var item = new fin.pur.catalog.Catalog(me.catalogId, "", 0, 1, true, [], []);	
				
			if (me.activeFrameId == 0) {
			
				for (var index = 0; index < me.units.length; index++) {
					if ($("#assignInputCheck" + index)[0].checked) {
						
						xml += '<purCatalogHouseCode'
						xml += ' id="0"';
						xml += ' catalogId="' + me.catalogId + '"';
						xml += ' houseCode="' + me.units[index].id + '"';
						xml += ' active="true"';
						xml += '/>';
					}
				}
				
				if (xml != "")
					me.status = "addHouseCodes";
				else {
					alert("Please select at least one House Code.");
					return;
				}					
			}
			else if (me.activeFrameId == 1) {
				if (me.purItemGrid.activeRowIndex >= 0)		
					me.purItemGrid.body.deselect(me.purItemGrid.activeRowIndex);
				
				for (var index = 0; index < me.purItems.length; index++) {
					if ($("#assignItemInputCheck" + index)[0].checked) {
						
						xml += '<purCatalogItem'
					    xml += ' id="0"';
					    xml += ' catalogId="' +  me.catalogId + '"';
					    xml += ' itemId="' + me.purItems[index].id + '"';
					    xml += ' price="' + me.purItems[index].price + '"';
					    xml += ' displayOrder="1"';
					    xml += ' active="' + me.purItems[index].active + '"';
					    xml += '/>';
					}
				}

				if (xml != "") 
					me.status = "addItems";
				else {
					alert("Please select at least one Item.");
					return;
				}					
			}

			disablePopup();
			me.actionSave(item, xml);
		},
		
		actionCancelItem: function() {
			var me = this;
			var index = -1;			
			
			if (!parent.fin.cmn.status.itemValid())
				return;
					
			if (me.activeFrameId == 0) {
				index = me.catalogUnitGrid.activeRowIndex;
				if (index >= 0)				
		   			me.catalogUnitGrid.body.deselect(index);
			} 
			else {
				index = me.catalogItemGrid.activeRowIndex;
				if (index >= 0)				
		   			me.catalogItemGrid.body.deselect(index); 
			}
			
			disablePopup();
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";
			me.resetGrids();
			
			if (me.lastSelectedRowIndex >= 0)						
				me.catalogGrid.body.select(me.lastSelectedRowIndex);
			else
				me.resetControls();
		},
				
		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;	
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.resetControls();
			me.resetGrids();
			me.status = "new";
		},
		
		actionDownloadItem: function(type) {
			var me = this;
			
			if (me.catalogGrid.activeRowIndex == -1)
				return;
			
			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();
			
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],export:1,catalogId:" + me.catalogId + ",type:" + type, me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			$("#pageLoading").hide();

			if(me.fileNames.length == 1) {

				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},
		
		actionImportItem: function(type) {
			var me = this;
			
			if (me.catalogGrid.activeRowIndex == -1)
				return;
			
			if (type == "houseCodes")
				$("#importHeader").text("Import House Codes");
			else if (type == "items")
				$("#importHeader").text("Import Items");
				
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			showFrame();
		},
		
		actionUploadItem: function() {
			var me = this;
			var fileName = "";			

			hideFrame();

			$("#messageToUser").text("Uploading");
			$("#pageLoading").show();
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						$("#pageLoading").hide();
					}
					else {
						$("#messageToUser").text("Importing");
						me.actionImport(fileName);
					}
				}			
				
			}, 1000);
		},
		
		actionImport: function(fileName) {
			var me = this;
			var item = [];
			var xml = "";
			
			if (me.activeFrameId == 0)
				xml = '<purCatalogHouseCodeImport';
			else
				xml = '<purCatalogItemImport';
			
			xml += ' catalogId="' + me.catalogId + '"';
			xml += ' fileName="' + fileName + '"';
			xml += '/>';
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.importResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		importResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var errorMessage = "";
			
			$("#pageLoading").hide();
									
			if (status == "success") {
				if (me.activeFrameId == 0) {
					me.houseCodesTabNeedUpdate = true;
					me.loadCatalogHouseCodesCount();
				}
				else if (me.activeFrameId == 1) {
					me.itemsTabNeedUpdate = true;
					me.loadCatalogItemsCount();
				}
			}
			else if(status == "invalid") {
				alert("The Id of the selected Catalog and the Catalog Id that exists in selected file doesn't match. Please download the Catalog and try again.");			
			}	
			else {
				if (me.activeFrameId == 0)				
					errorMessage = "Error while importing the house codes: " + $(args.xmlNode).attr("message");
				else
					errorMessage = "Error while importing the items: " + $(args.xmlNode).attr("message");
				alert(errorMessage);
			}			
		},
		
		actionUploadCancelItem: function() {
			var me = this;
			
			hideFrame();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if(me.catalogsReadOnly) return;
			
			var catalogItemDatas = [];
			var catalogItemData;
			var catalogHouseCodeDatas = [];
			var catalogHouseCodeData;

			if (me.status == "") {
				if (me.lastSelectedRowIndex == -1)
					me.status = "new";
				else
					me.status = "update";
			}				
				
			me.validator.forceBlur();
					
			me.catalogUnitGrid.body.deselectAll();
			me.catalogItemGrid.body.deselectAll();

			// Check to see if the data entered is valid
		    if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}			
								
			for (var index = 0; index < me.catalogHouseCodes.length; index++) {
				
				if (me.catalogHouseCodes[index].modified == false && index < me.catalogHouseCodesCountOnLoad) continue;
					
				catalogHouseCodeData = new fin.pur.catalog.CatalogHouseCode(									
					me.catalogHouseCodes[index].id
					, me.catalogId	
					, me.catalogHouseCodes[index].houseCode
					, ""
					, me.catalogHouseCodes[index].active	
					);
				
				me.catalogHouseCodes[index].modified = true;
				catalogHouseCodeDatas.push(catalogHouseCodeData);							
			};	
		
			for (var index = 0; index < me.catalogItems.length; index++) {
				
				if(me.catalogItems[index].modified == false && index < me.catalogItemsCountOnLoad) continue;
				
				catalogItemData = new fin.pur.catalog.CatalogItem(					
					me.catalogItems[index].id						
					, me.catalogItems[index].itemId
					, me.catalogItems[index].itemNumber
					, me.catalogItems[index].itemDescription
					, me.catalogId
					, me.catalogItems[index].price.toString()	
					, 1				
					, me.catalogItems[index].active
				 	);
				
				me.catalogItems[index].modified = true;
				catalogItemDatas.push(catalogItemData);					
			};
				
			var item = new fin.pur.catalog.Catalog(
				me.catalogId
				, me.catalogTitle.getValue()				
				, (me.catalogVendor.indexSelected >= 0 ? me.vendors[me.catalogVendor.indexSelected].id : 0)
				, 1
				, me.catalogActive.check.checked
				, catalogHouseCodeDatas
				, catalogItemDatas
				);				

			var xml = me.saveXmlBuildCatalog(item);
			me.actionSave(item, xml);			
		},
				
		saveXmlBuildCatalog: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pur.catalog.Catalog}
			});
			var me = this;
			var item = args.item;
			var xml = "";
			var index = 0;
						
			xml += '<purCatalog';
			xml += ' id="' + (me.status == "new" ? 0 : item.id ) + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
			xml += ' vendorId="' + item.vendorId + '"';
			xml += ' displayOrder="' + item.displayOrder + '"';
			xml += ' active="' + item.active + '">';
			
			for (index = 0; index < item.catalogItems.length; index++) {
			
			    catalogItemsList = item.catalogItems[index];
				
			    xml += '<purCatalogItem'
			    xml += ' id="' + (me.status == "new" ? 0 : catalogItemsList.id ) + '"';
			    xml += ' catalogId="' +  me.catalogId + '"';
			    xml += ' itemId="' + catalogItemsList.itemId + '"';
			    xml += ' price="' + catalogItemsList.price + '"';
			    xml += ' displayOrder="' + catalogItemsList.displayOrder + '"';
			    xml += ' active="' + catalogItemsList.active + '"';
			    xml += '/>';
			}
						
			for (index = 0; index < item.catalogHouseCodes.length; index++) {
			
			    catalogHouseCodesList = item.catalogHouseCodes[index];
				
				xml += '<purCatalogHouseCode'
				xml += ' id="' + (me.status == "new" ? 0 : catalogHouseCodesList.id ) + '"';				
				xml += ' catalogId="' + (me.status == "new" ? 0 : me.catalogId  ) + '"';
				xml += ' houseCode="' + catalogHouseCodesList.houseCode + '"';
				xml += ' active="' + catalogHouseCodesList.active + '"';
				xml += '/>';
			}
			
			xml += '</purCatalog>';
	
			return xml;			
		},
		
		actionSave: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pur.catalog.Catalog},
				xml: {type: String}
			});
			var me = this;
			var item = args.item;
			var xml = args.xml;
			
			if (xml == "")
				return;
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseCatalog,
				referenceData: {me: me, item: item}
			});			
					
			return true;			
		},

		saveResponseCatalog: function() {
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
			var id = 0;
					
			if (status == "success") {
				
				me.modified(false);
				if (me.status == "addHouseCodes") {
					me.houseCodesTabNeedUpdate = true;
					me.loadCatalogHouseCodesCount();
				}
				else if (me.status == "addItems") {
					me.itemsTabNeedUpdate = true;
					me.loadCatalogItemsCount();
				}
				else {
					$(args.xmlNode).find("*").each(function() {
			
						switch (this.tagName) {
	
							case "purCatalog":
							
				                if (me.status == "new") {
									me.catalogId = parseInt($(this).attr("id"), 10);
									item.id = me.catalogId;
									me.catalogs.push(item);
									me.lastSelectedRowIndex = me.catalogs.length - 1;
									me.catalogGrid.setData(me.catalogs);
									me.loadNewCatalog = true;
									me.catalogGrid.body.select(me.lastSelectedRowIndex);
								}
								else {
									me.catalogs[me.lastSelectedRowIndex] = item;
									me.catalogGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);	
								}
								
								break;
								
							case "purCatalogItem":
								
								id = parseInt($(this).attr("id"), 10);
								
								for (var index = 0; index < me.catalogItemGrid.data.length; index++) {
									if (me.catalogItemGrid.data[index].modified) {
										if (me.catalogItemGrid.data[index].id <= 0)
											me.catalogItemGrid.data[index].id = id;
										me.catalogItemGrid.data[index].modified = false;
										break;
									}
								}							
												
								break;
								
							case "purCatalogHouseCode":
					
								id = parseInt($(this).attr("id"), 10);
									
								for (var index = 0; index < me.catalogUnitGrid.data.length; index++) {
									if (me.catalogUnitGrid.data[index].modified) {
										if (me.catalogUnitGrid.data[index].id <= 0)
											me.catalogUnitGrid.data[index].id = id;
										me.catalogUnitGrid.data[index].modified = false;
										break;
									}
								}	
										
								break;
						}
					});
				}
			}
			else {
				alert('Error while updating Catalog Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid")
					traceType = ii.traceTypes.warning;
				else
					errorMessage += " [SAVE FAILURE]";
			}
			 
			me.status = "";
			me.catalogHouseCodesCountOnLoad = me.catalogHouseCodes.length;
			me.catalogItemsCountOnLoad = me.catalogItems.length;
			
			$("#pageLoading").hide();		
		}
	}
});

function loadPopup() {
	
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupContact").fadeIn("slow");
}

function disablePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupContact").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = windowWidth - 100;
	var popupHeight = windowHeight - 100;
	
	$("#popupContact").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#popupLoading").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function showFrame() {
	
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
		
	$("#divFrame").height(120);
	$("#iFrameUpload").height(30);
	
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
	
	$("#importHeader").show();
	$("#divUpload").show();
	$("#backgroundPopup").fadeIn("slow");
	$("#divFrame").fadeIn("slow");	
}

function hideFrame() {

	$("#importHeader").hide();
	$("#divUpload").hide();
	$("#backgroundPopup").fadeOut("slow");
	$("#divFrame").fadeOut("slow");
}

function onFileChange() {
	
	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;	
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));
	
	if (fileExtension == ".xlsx")
		fin.pur.purCatalogUi.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}
	
function main() {
	fin.pur.purCatalogUi = new fin.pur.catalog.UserInterface();
	fin.pur.purCatalogUi.resize();
	fin.houseCodeSearchUi = fin.pur.purCatalogUi;
}

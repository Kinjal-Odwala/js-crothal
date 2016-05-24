ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.pur.catalog.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import("fin.cmn.usr.houseCodeSearchTemplate");
ii.Import("fin.app.usr.defs");

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.grid", 8 );
ii.Style( "fin.cmn.usr.tabs", 9 );

ii.Class({
    Name: "fin.pur.catalog.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {

		init: function() {
			var me = this;			

			me.catalogId = -1;
			me.activeFrameId = 0;
			me.lastSelectedRowIndex = -1;
			me.loadNewCatalog = false;
			me.status = "";
			me.action = "Catalogs";
			me.units = [];
			me.purItemData = [];
			me.houseCodesTabNeedUpdate = true;
			me.itemsTabNeedUpdate = true;
			me.catalogsTabNeedUpdate = true;
			me.loadCount = 0;
			
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
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			me.activeStatusesLoaded();
			$("#catalogHistory").hide();
			$("#popupHistory").hide();
			me.historyReference = 0;
			me.currentPrice = 0;

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\Catalogs";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();
			me.initialize();
			$(window).bind("resize", me, me.resize );
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.catalogsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

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
				me.controlVisible();
				me.resizeControls();
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.pur.purCatalogUi;

			$("#catalogAssociationsContent").height($(window).height() - 228);
		    $("#catalogItemContent").height($(window).height() - 228);
			$("#itemCatalogContent").height($(window).height() - 228);
			$("#container-1").tabs(1);
			me.catalogGrid.setHeight($(window).height() - 162);
			me.itemGrid.setHeight($(window).height() - 162);
			me.catalogUnitGrid.setHeight($(window).height() - 340);
			me.catalogItemGrid.setHeight($(window).height() - 260);
			me.itemCatalogGrid.setHeight($(window).height() - 260);
		},
		
		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "catalogAction", 
					brief: "Catalogs", 
					title: "Add/Edit catalogs and assign house codes/items to the selected catalog",
					actionFunction: function() { me.actionCatalogItemAssociationItem(); }
				})
				.addAction({
					id: "itemCatalogAssociationAction", 
					brief: "Item - Catalog Associations", 
					title: "Assign catalogs to the selected item",
					actionFunction: function() { me.actionItemCatalogAssociationItem(); }
				});
				
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function () { $("#catalogHistory").hide(); me.actionNewItem(); },
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function () { $("#catalogHistory").hide(); me.actionUndoItem(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function () { $("#catalogHistory").hide(); me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorHistory = new ui.ctl.buttons.Sizeable({
			    id: "AnchorHistory",
			    className: "iiButton",
			    text: "<span>&nbsp;&nbsp;View History&nbsp;&nbsp;</span>",
			    clickFunction: function () { me.viewCatalogHistory(); },
			    hasHotState: true
			});

			me.anchorClose = new ui.ctl.buttons.Sizeable({
			    id: "AnchorClose",
			    className: "iiButton",
			    text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
			    clickFunction: function () { me.actionCloseItem(); },
			    hasHotState: true
			});

			me.historyGrid = new ui.ctl.Grid({
			    id: "HistoryGrid",
			    appendToId: "divForm",
			    allowAdds: false
			});

			me.historyGrid.addColumn("lastModifiedBy", "lastModifiedBy", "Last Modified By", "Last Modified By", null);
			me.historyGrid.addColumn("lastModifiedAt", "lastModifiedAt", "Last Modified At", "Last Modified At", 300);
			me.historyGrid.addColumn("previousFieldValue", "previousFieldValue", "Amount From", "Amount From", 200);
			me.historyGrid.addColumn("fieldName", "fieldName", "Amount To", "Amount To", 200);
			me.historyGrid.capColumns();
			
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

			me.activeSearch = new ui.ctl.Input.DropDown.Filtered({
			    id: "ActiveSearch",
			    formatFunction: function (type) { return type.name; }
			});
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
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

				if (me.status !== "")
					this.valid = true;
				else if (me.searchInput.getValue().length < 3)
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
				selectFunction: function(index) { me.catalogSelect(index); },
				validationFunction: function() {
					if (me.status !== "new") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});
			
			me.catalogGrid.addColumn("title", "title", "Catalog Name", "Catalog Name", null);
			me.catalogGrid.addColumn("active", "active", "Active", "Active", 70, function(active) { return (active == "1" ? "Yes" : "No") });
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
				selectFunction: function (index) { me.catalogItemGridSelect(index); }
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
			
			me.searchInputPopup = new ui.ctl.Input.Text({
				id: "SearchInputPopup",
				title: "To search a specific Items, type-in Item # or Description and press Enter key/click Search button.",
				maxLength: 50
			});

			me.searchInputPopup.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
				
				if (me.searchInputPopup.getValue().length < 3)
				    this.setInvalid("Please enter search criteria (minimum 3 characters).");
			});
						
			me.anchorSearchPopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearchPopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function () { me.enter = false; me.purItemData = []; me.loadPopupSearchResults(); },
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
				clickFunction: function () { $("#catalogHistory").hide(); me.actionCancelItem(); },
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
                return "<input type=\"checkbox\" id=\"assignItemInputCheck" + rowNumber + "\" class=\"iiInputCheck\" onclick=\"fin.pur.purCatalogUi.modified();\" />";				
            });
			me.purItemGrid.addColumn("number", "number", "Number", "Item Number", 150);
			me.purItemGrid.addColumn("description", "description", "Description", "Item Description", null);
			me.purItemGrid.addColumn("price", "price", "Price", "Price", 100, null, me.purItemPrice);
			me.purItemGrid.addColumn("active", "active", "Active", "Active", 70, null, me.purItemActive);
			me.purItemGrid.capColumns();
			me.purItemGrid.setHeight(250);
			
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
			me.itemGrid.addColumn("active", "active", "Active", "Active", 70, function(active) { return (active == "1" ? "Yes" : "No") });
			me.itemGrid.capColumns();
			
			me.itemCatalogGrid = new ui.ctl.Grid({
				id: "ItemCatalogGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemCatalogGridSelect(index); }
			});

			me.itemCatalogCatalogTitle = new ui.ctl.Input.Text({
		        id: "ItemCatalogCatalogTitle",
				appendToId: "ItemCatalogGridControlHolder"
		    });

			me.itemCatalogActive = new ui.ctl.Input.Check({
		        id: "ItemCatalogActive" ,
		        className: "iiInputCheck",
				appendToId: "ItemCatalogGridControlHolder",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.itemCatalogGrid.addColumn("catalogTitle", "catalogTitle", "Catalog Name", "Catalog Name", null, null, me.itemCatalogCatalogTitle);
			me.itemCatalogGrid.addColumn("active", "active", "Active", "Active", 70, null, me.itemCatalogActive);
			me.itemCatalogGrid.capColumns();
			
			me.purCatalogGrid = new ui.ctl.Grid({
				id: "PurCatalogGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.purCatalogGrid.addColumn("assigned", "assigned", "", "", 30, function() { var rowNumber = me.purCatalogGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"addCatalogInputCheck" + rowNumber + "\" class=\"iiInputCheck\" onclick=\"fin.pur.purCatalogUi.modified();\" />";				
            });
			me.purCatalogGrid.addColumn("title", "title", "Catalog Name", "Catalog Name", null);
			me.purCatalogGrid.addColumn("active", "active", "Active", "Active", 70, function(active) { return (active == "1" ? "Yes" : "No") });
			me.purCatalogGrid.capColumns();
			
			me.catalogUnitTitle.text.readOnly = true;
			me.itemCatalogCatalogTitle.text.readOnly = true;
			me.purCatalogItemPrice.active = false;			
			me.purItemPrice.active = false;
			me.searchInputPopup.active = false;
			
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#SearchInputPopupText").bind("keydown", me, me.actionItemSearch);
			$("#CatalogVendor").bind("keydown", me, me.actionVendorSearch);
			$("#imgAddHouseCodes").bind("click", function() { me.addHouseCodes(); });
			$("#imgDownloadHouseCodes").bind("click", function() { me.actionDownloadItem("houseCodes"); });
			$("#imgImportHouseCodes").bind("click", function() { me.actionImportItem("houseCodes"); });
			$("#selHouseCodesPageNumber").bind("change", function() { me.pageNumberChange("houseCodes"); });
			$("#imgPrevHouseCodes").bind("click", function() { me.prevHouseCodes(); });
			$("#imgNextHouseCodes").bind("click", function() { me.nextHouseCodes(); });
			$("#imgAddItems").bind("click", function () { me.purItemData = []; me.addItems(); });
			$("#imgDownloadItems").bind("click", function() { me.actionDownloadItem("items"); });
			$("#selItemsPageNumber").bind("change", function() { me.pageNumberChange("items"); });
			$("#imgImportItems").bind("click", function() { me.actionImportItem("items"); });
			$("#imgPrevItems").bind("click", function() { me.prevItems(); });
			$("#imgNextItems").bind("click", function() { me.nextItems(); });
			$("#imgAddCatalogs").bind("click", function() { me.addCatalogs(); });
		},

		configureCommunications: function() {
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
			storeId: "purFileNames",
				itemConstructor: fin.pur.catalog.FileName,
				itemConstructorArgs: fin.pur.catalog.fileNameArgs,
				injectionArray: me.fileNames
			});

			me.appHistories = [];
			me.appHistoryStore = me.cache.register({
			    storeId: "appApplicationHistorys",
			    itemConstructor: fin.pur.catalog.AppApplicationHistory,
			    itemConstructorArgs: fin.pur.catalog.appApplicationHistoryArgs,
			    injectionArray: me.appHistories
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
	
		initialize: function() {
			var me = this;

			me.catalogUnitGrid.setData([]);
			me.catalogItemGrid.setData([]);
			
			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = document.activeElement;

					if (focusedControl.type !== undefined && (focusedControl.type == "text" || focusedControl.type == "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid()) 
					return false;
				else {
					var tabIndex = 0;
					if (this.id == "TabHouseCodes")
						tabIndex = 1;
					else if (this.id == "TabItems")
						tabIndex = 2;
					else if (this.id == "TabCatalogs")
						tabIndex = 3;
						
					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}					
			});
			
			$("#TabCollection a").click(function() {
				switch(this.id) {
					case "TabHouseCodes":
						me.activeFrameId = 0;
						me.loadCatalogHouseCodesCount();
						me.houseCodesTabNeedUpdate = false;
						$("#catalogHistory").hide();
						break;

					case "TabItems":
						me.activeFrameId = 1;
						me.loadCatalogItemsCount();
						me.itemsTabNeedUpdate = false;
						if (me.catalogItemGrid.activeRowIndex >= 0)
						    $("#catalogHistory").show();
						break;
						
					case "TabCatalogs":
						me.activeFrameId = 2;
						me.catalogsTabNeedUpdate = false;
						$("#catalogHistory").hide();
						break;
				}
			});

			$("#divFrame").height(0);
			$("#iFrameUpload").height(0);
			$("#divFrame").show();
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
			$("#TabCatalogs").hide();
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
		
		loadSearchResults: function () {
		    var me = this;
		    index = me.catalogItemGrid.activeRowIndex;
		    if (index >= 0) {
		        me.catalogItemGrid.body.deselect(index);
		    }
		    iIndex = me.catalogGrid.activeRowIndex;
		    if (iIndex >= 0)
		        me.catalogGrid.body.deselect(iIndex);
			
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
			me.catalogUnitGrid.setData([]);
			me.catalogItemGrid.setData([]);
			me.units = [];

			if (me.action == "Catalogs") {
			    me.catalogStore.reset();
			    me.catalogStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue()
                    + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number), me.catalogsLoaded, me);
			}
			else if (me.action == "ItemCatalogsAssociation")
			    me.purItemStore.fetch("userId:[user],searchValue:" + me.searchInput.getValue()
                    + ",active:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number), me.itemsLoaded, me);
		},		
		
		catalogsLoaded: function(me, activeId) {

			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.catalogGrid.setData(me.catalogs);
			me.checkLoadCount();
		},
		
		itemsLoaded: function(me, activeId) {

			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.itemGrid.setData(me.purItems);
			me.checkLoadCount();
		},
		
		catalogSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;
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

			if (me.catalogGrid.data[index] !== undefined) {
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
			$("#catalogHistory").hide();

			if (me.activeFrameId == 0)
				me.loadCatalogHouseCodesCount();
			else if (me.activeFrameId == 1)
				me.loadCatalogItemsCount();
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var item = me.itemGrid.data[index];				
			
			if (!parent.fin.cmn.status.itemValid()) {
				me.itemGrid.body.deselect(index, true);
				return;
			}

			if (me.itemCatalogGrid.activeRowIndex >= 0)
	   			me.itemCatalogGrid.body.deselect(me.itemCatalogGrid.activeRowIndex, true);

			me.lastSelectedRowIndex = index;
			me.status = "";
			me.setLoadCount();
			me.catalogItemStore.fetch("userId:[user],itemId:" + item.id
                                     + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                                     , me.itemCatalogsLoaded, me);
		},
		
		itemCatalogsLoaded: function(me, activeId) {

			me.itemCatalogGrid.setData(me.catalogItems);
			me.controlVisible();
			me.checkLoadCount();
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

		activeStatusesLoaded: function () {
		    me = this;

		    me.activeStatuses = [];
		    me.activeStatuses.push(new fin.pur.catalog.ActiveStatus(1, -1, "All"));
		    me.activeStatuses.push(new fin.pur.catalog.ActiveStatus(2, 1, "Yes"));
		    me.activeStatuses.push(new fin.pur.catalog.ActiveStatus(3, 0, "No"));

		    me.activeSearch.setData(me.activeStatuses);
		    me.activeSearch.select(0, me.activeSearch.focused);
		},
		
		loadCatalogHouseCodesCount: function() {
			var me = this;
			
			setTimeout(function() { 
				me.catalogTitle.resizeText(); 
				me.catalogVendor.resizeText();
			}, 100);
			
			if (me.houseCodesTabNeedUpdate) {			
				me.setLoadCount();
				me.houseCodesTabNeedUpdate = false;
				me.recordCountStore.reset();
				me.recordCountStore.fetch("userId:[user]," + "catalogId:" + me.catalogId
                                          + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                                          + ",type:catalogHouseCodes", me.catalogHouseCodesCountLoaded, me);
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
			
			$("#selHouseCodesPageNumber").val(me.houseCodesPageCurrent);
			var index = me.catalogUnitGrid.activeRowIndex;
			if (index >= 0)
	   			me.catalogUnitGrid.body.deselect(index, true);
			me.catalogUnitGrid.setData([]);
			me.houseCodesStartPoint = ((me.houseCodesPageCurrent - 1) * me.maximumRows) + 1;
			me.catalogHouseCodeStore.reset();
			me.catalogHouseCodeStore.fetch("userId:[user],catalogId:" + me.catalogId
                + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                + ",startPoint:" + me.houseCodesStartPoint + ",maximumRows:" + me.maximumRows, me.catalogHouseCodesLoaded, me);
		},	
		
		controlVisible: function() {
			var me = this;
			
			if (me.catalogsReadOnly) {
				$("#CatalogTitleText").attr('disabled', true);
				$("#CatalogVendorText").attr('disabled', true);
				$("#CatalogVendorAction").removeClass("iiInputAction");
				$("#CatalogActiveCheck").attr('disabled', true);
				
				me.catalogUnitGrid.columns["houseCodeTitle"].inputControl = null;
				me.catalogUnitGrid.columns["active"].inputControl = null;
				me.catalogItemGrid.columns["price"].inputControl = null;
				me.catalogItemGrid.columns["active"].inputControl = null;
				me.itemCatalogGrid.columns["catalogTitle"].inputControl = null;
				me.itemCatalogGrid.columns["active"].inputControl = null;
				
				$("#imgAddHouseCodes").hide();
				$("#imgImportHouseCodes").hide();
				$("#imgDownloadHouseCodes").hide();
				$("#imgAddItems").hide();
				$("#imgDownloadItems").hide();
				$("#imgImportItems").hide();
				$("#imgAddCatalogs").hide();
				$(".footer").hide();
			}
		},		
		
		catalogHouseCodesLoaded: function(me, activeId) {

			me.catalogUnitGrid.setData(me.catalogHouseCodes);
			me.catalogUnitGrid.resize();
			me.catalogHouseCodesCountOnLoad = me.catalogHouseCodes.length;
			me.units = [];
			me.controlVisible();
			me.checkLoadCount();
		},
		
		loadCatalogItemsCount: function() {
			var me = this;
			
			if (me.itemsTabNeedUpdate) {			
				me.setLoadCount();
				me.itemsTabNeedUpdate = false;
				me.recordCountStore.reset();
				me.recordCountStore.fetch("userId:[user]," + "catalogId:" + me.catalogId
                                         + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                                         + ",type:catalogItems", me.catalogItemsCountLoaded, me);
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
			
			$("#selItemsPageNumber").val(me.itemsPageCurrent);
			var index = me.catalogItemGrid.activeRowIndex;
			if (index >= 0)
	   			me.catalogItemGrid.body.deselect(index, true);
			me.catalogItemGrid.setData([]);
			me.itemsStartPoint = ((me.itemsPageCurrent - 1) * me.maximumRows) + 1;
			me.catalogItemStore.reset();
			me.catalogItemStore.fetch("userId:[user],catalogId:" + me.catalogId
                + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                + ",startPoint:" + me.itemsStartPoint + ",maximumRows:" + me.maximumRows, me.catalogItemsLoaded, me);
		},

		catalogItemsLoaded: function(me, activeId) {

			me.catalogItemGrid.setData(me.catalogItems);
			me.catalogItemGrid.resize();
			me.catalogItemsCountOnLoad = me.catalogItems.length;
			me.controlVisible();			
			me.checkLoadCount();
		},

		catalogHouseCodeGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number} 
			});			
			var me = this;
			var index = args.index;
			
			if (me.catalogHouseCodes[index]) {
			    me.catalogHouseCodes[index].modified = true;
			}
		},
				
		catalogItemGridSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number} 
			});
			var me = this;
			var index = args.index;
			$("#catalogHistory").show();

			me.controlVisible();
			if (me.catalogItems[index]) {
			    me.catalogItems[index].modified = true;
			    me.historyReference = me.catalogItems[index].id;
			    me.currentPrice = me.catalogItems[index].price;
			}
		},

		itemCatalogGridSelect: function() {
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

		resizeControls: function() {
			var me = this;

			me.searchInput.resizeText();
			me.catalogTitle.resizeText();
			me.catalogVendor.resizeText();
			me.searchInputPopup.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.catalogId = 0;
			me.validator.reset();
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
			me.itemCatalogGrid.body.deselectAll();
			me.catalogItemStore.reset();
			me.catalogHouseCodeStore.reset();			
			me.catalogUnitGrid.setData([]);	
			me.catalogItemGrid.setData([]);
			me.itemCatalogGrid.setData([]);
			me.units = [];			
			me.houseCodesTabNeedUpdate = true;
			me.itemsTabNeedUpdate = true;
			me.catalogsTabNeedUpdate = true;
		},
		
		addHouseCodes: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.catalogGrid.activeRowIndex == -1)
				return;
				
			loadPopup();
			me.setStatus("Normal");

			$("#houseCodeTemplateText").val("");
			$("#itemsList").hide();
			$("#popupHistory").hide();
			$("#houseCodesList").show();
			$("#popupContact").show();
			$("#popupFooter").show();
			
			me.units = [];
			me.houseCodeGrid.setData(me.units);
			me.houseCodeGrid.setHeight($(window).height() - 200);
		},
		
		houseCodeTemplateChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var found = false;			
			
			for (index = 0; index < me.units.length; index++) {
			    if (me.units[index].id == me.houseCodeSearchTemplate.houseCodeIdTemplate) {
			        found = true;
			        break;
			    }
			}
			if (!found) {
			    me.units.push(new fin.pur.catalog.Unit(
                    me.houseCodeSearchTemplate.houseCodeIdTemplate
                    , me.houseCodeSearchTemplate.houseCodeTitleTemplate
                    , true
                    ));
			}

			me.houseCodeGrid.setData(me.units);
			me.modified();
		},
		
		addItems: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.catalogGrid.activeRowIndex == -1)
				return;
					
			loadPopup();
			me.setStatus("Normal");

			$("#popupHistory").hide();
			$("#houseCodesList").hide();
			$("#itemsList").show();		
			$("#popupContact").show();
			$("#popupFooter").show();
			
			if (me.purItemGrid.activeRowIndex >= 0)		
				me.purItemGrid.body.deselect(me.purItemGrid.activeRowIndex);
					
			me.searchInputPopup.setValue("");
			me.searchInputPopup.resizeText();
			me.searchInputPopup.valid = true;
			me.searchInputPopup.updateStatus();
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
			    me.enter = true;
			    me.loadPopupSearchResults();
			}
		},

		loadPopupSearchResults: function() {		
		    var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.searchInputPopup.getValue().length < 3) {
				me.searchInputPopup.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}
			else {
				me.searchInputPopup.valid = true;
				me.searchInputPopup.updateStatus();
			}

			$("#popupLoading").show();
			me.setStatus("Loading");

			if (me.action == "Catalogs") {
			    me.purItemStore.fetch("searchValue:" + me.searchInputPopup.getValue()
                    + ",active:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                    + ",userId:[user],", me.itemsGridLoaded, me);
			}
			else if (me.action == "ItemCatalogsAssociation") {
			    me.catalogStore.fetch("userId:[user],searchValue:" + me.searchInputPopup.getValue()
                    + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number), me.catalogsGridLoaded, me);
			}
		},	
		
		itemsGridLoaded: function(me, activeId) {

		    if (me.purItemGrid.activeRowIndex >= 0)
		        me.purItemGrid.body.deselect(me.purItemGrid.activeRowIndex);

		    if (me.enter == true) {
		        for (var index = 0; index < me.purItems.length; index++) {
		            var found = false;
		            for (var iIndex = 0; iIndex < me.purItemData.length; iIndex++) {
		                if (me.purItems[index].number == me.purItemData[iIndex].number) {
		                    found = true; 
		                    break;
		                }
		            }
		            if (!found) {
		                me.purItemData.push(new fin.pur.catalog.PurItem(
                        me.purItems[index].id
                        , me.purItems[index].number
                        , me.purItems[index].description
                        , me.purItems[index].price
                        , me.purItems[index].active
                        , true
                        ));
		            }
		        }
		        me.purItemGrid.setData(me.purItemData);
		        for (var index = 0; index < me.purItemData.length; index++) {
		            $("#assignItemInputCheck" + index)[0].checked = true;
		        }
			}
			else {
			    me.purItemGrid.setData(me.purItems);
			}
			me.setStatus("Loaded");
			$("#popupLoading").hide();
		},
		
		catalogsGridLoaded: function(me, activeId) {
	    		
			if (me.purCatalogGrid.activeRowIndex >= 0)		
				me.purCatalogGrid.body.deselect(me.purCatalogGrid.activeRowIndex);
			me.purCatalogGrid.setData(me.catalogs);
			me.setStatus("Loaded");
			$("#popupLoading").hide();
		},
		
		addCatalogs: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.itemGrid.activeRowIndex == -1)
				return;
					
			loadPopup();
			me.setStatus("Normal");

			$("#houseCodesList").hide();
			$("#PurItemGrid").hide();
			$("#itemsList").show();
			$("#PurCatalogGrid").show();
			$("#popupContact").show();
			
			if (me.purCatalogGrid.activeRowIndex >= 0)		
				me.purCatalogGrid.body.deselect(me.purCatalogGrid.activeRowIndex);
					
			me.searchInputPopup.setValue("");
			me.searchInputPopup.resizeText();
			me.searchInputPopup.valid = true;
			me.searchInputPopup.updateStatus();
			me.purCatalogGrid.setData([]);
			me.purCatalogGrid.setHeight($(window).height() - 200);
		},	
		
		isHouseCodeExists: function() {
			var args = ii.args(arguments, {
				houseCodeId: {type: Number} 
			});
			var me = this;		

			for (var index = 0; index < me.catalogHouseCodes.length; index++) {
				if (me.catalogHouseCodes[index].houseCode == args.houseCodeId)
					return true;
			}
			
			return false;
		},

		actionCatalogItemAssociationItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#CatalogGrid").show();
			$("#TabHouseCodes").show();
			$("#TabItems").show();
			$("#TabCatalogs").hide();
			$("#ItemGrid").hide();
			$("#AnchorNew").show();
			$("#SearchLabel").html("Catalog Name:");
			$("#header").html("Catalog Search");
			$("#leftHeader").html("Catalogs");
			$("#rightHeader").html("Catalog Details");
			$("#container-1").tabs(1);
			$("#container-1").triggerTab(1);
			$("#popupHeader").html("Item Search");
			$("#popupHeaderLabel").html("Item #, Description:");
			me.action = "Catalogs";
			me.resetControls();
			me.resetGrids();
			me.catalogGrid.setData([]);
			me.catalogStore.reset();
			me.searchInput.setValue("");
			me.searchInput.valid = true;
			me.searchInput.updateStatus();
			me.catalogGrid.setHeight($(window).height() - 162);
			me.catalogUnitGrid.setHeight($(window).height() - 340);
			me.catalogItemGrid.setHeight($(window).height() - 260);
			$("#SearchInputText").attr("title", "To search a specific Catalog, type-in Catalog Name and press Enter key/click Search button.");
			$("#SearchInputPopupText").attr("title", "To search a specific Item, type-in Item # or Description and press Enter key/click Search button.");
		},

		actionItemCatalogAssociationItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#CatalogGrid").hide();
			$("#TabHouseCodes").hide();
			$("#TabItems").hide();
			$("#TabCatalogs").show();
			$("#ItemGrid").show();
			$("#AnchorNew").hide();
			$("#SearchLabel").html("Item #, Description:");
			$("#header").html("Item Search");
			$("#leftHeader").html("Items");
			$("#rightHeader").html("Catalogs");
			$("#container-1").tabs(3);
			$("#container-1").triggerTab(3);
			$("#popupHeader").html("Catalog Search");
			$("#popupHeaderLabel").html("Catalog Name:");
			me.action = "ItemCatalogsAssociation";
			me.resetControls();
			me.resetGrids();
			me.itemGrid.setData([]);
			me.purItemStore.reset();
			me.searchInput.setValue("");
			me.searchInput.valid = true;
			me.searchInput.updateStatus();
			me.itemGrid.setHeight($(window).height() - 162);
			me.itemCatalogGrid.setHeight($(window).height() - 260);
			$("#SearchInputText").attr("title", "To search a specific Item, type-in Item # or Description and press Enter key/click Search button.");
			$("#SearchInputPopupText").attr("title", "To search a specific Catalog, type-in Catalog Name and press Enter key/click Search button.");
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

				if (xml !== "") 
					me.status = "addItems";
				else {
					alert("Please select at least one Item.");
					return;
				}					
			}
			else if (me.activeFrameId == 2) {
				if (me.purCatalogGrid.activeRowIndex >= 0)		
					me.purCatalogGrid.body.deselect(me.purCatalogGrid.activeRowIndex);
				
				for (var index = 0; index < me.catalogs.length; index++) {
					if ($("#addCatalogInputCheck" + index)[0].checked) {
						xml += '<purCatalogItem'
					    xml += ' id="0"';
					    xml += ' catalogId="' +  me.catalogs[index].id + '"';
					    xml += ' itemId="' + me.itemGrid.data[me.itemGrid.activeRowIndex].id + '"';
					    xml += ' price="' + me.itemGrid.data[me.itemGrid.activeRowIndex].price + '"';
					    xml += ' displayOrder="1"';
					    xml += ' active="' + me.itemGrid.data[me.itemGrid.activeRowIndex].active + '"';
					    xml += '/>';
					}
				}

				if (xml !== "") 
					me.status = "addCatalogs";
				else {
					alert("Please select at least one Catalog.");
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
			else if (me.activeFrameId == 1) {
				index = me.catalogItemGrid.activeRowIndex;
				if (index >= 0)				
		   			me.catalogItemGrid.body.deselect(index); 
			}
			else if (me.activeFrameId == 2) {
				index = me.itemCatalogGrid.activeRowIndex;
				if (index >= 0)				
		   			me.itemCatalogGrid.body.deselect(index); 
			}
			
			disablePopup();
			me.setStatus("Loaded");
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";
			me.resetGrids();
			
			if (me.lastSelectedRowIndex >= 0) {
				if (me.action == "Catalogs")
					me.catalogGrid.body.select(me.lastSelectedRowIndex);
				else if (me.action == "ItemCatalogsAssociation")
					me.itemGrid.body.select(me.lastSelectedRowIndex);
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
			me.resetGrids();
			me.status = "new";
			me.setStatus("Loaded");
		},
		
		actionDownloadItem: function(type) {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.catalogGrid.activeRowIndex == -1)
				return;
			
			me.setStatus("Exporting");
			$("#messageToUser").text("Exporting");
			$("#pageLoading").fadeIn("slow");
			
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],export:1,catalogId:" + me.catalogId
                                   + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                                   + ",type:" + type, me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			me.setStatus("Exported");
			$("#pageLoading").fadeOut("slow");

			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},
		
		actionImportItem: function(type) {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
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
			
			me.setStatus("Uploading");
			$("#messageToUser").text("Uploading");
			$("#pageLoading").fadeIn("slow"); 
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value !== "")	{
					fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (fileName == "Error") {
						me.setStatus("Info", "Unable to upload the file. Please try again.");
						alert("Unable to upload the file. Please try again.");
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
			else if (status == "invalid") {
				me.setStatus("Error");
				alert("The Id of the selected Catalog and the Catalog Id that exists in selected file doesn't match. Please download the Catalog and try again.");
				$("#pageLoading").fadeOut("slow");			
			}	
			else {
				if (me.activeFrameId == 0)				
					errorMessage = "Error while importing the house codes: " + $(args.xmlNode).attr("message");
				else
					errorMessage = "Error while importing the items: " + $(args.xmlNode).attr("message");
				me.setStatus("Error");
				alert(errorMessage);
				$("#pageLoading").fadeOut("slow");
			}			
		},
		
		actionUploadCancelItem: function() {
			var me = this;
			
			hideFrame();
		},

		viewCatalogHistory: function () {
		    loadPopup();
		    $("#houseCodesList").hide();
		    $("#itemsList").hide();
		    $("#popupFooter").hide();
		    $("#popupContact").show();
		    $("#popupHistory").show();
		    me.appHistoryStore.reset();
		    me.appHistoryStore.fetch("userId:[user],reference:" + me.historyReference + ",module:PurCatalogItem", me.appHistoriesLoaded, me);
		},

		appHistoriesLoaded: function () {
		    if (me.appHistories.length > 0) {
		        for (var index = 0; index < me.appHistories.length; index++) {
		            var modAtDate = ui.cmn.text.date.format(new Date(me.appHistories[index].lastModifiedAt), "mm/dd/yyyy");
		            var modAtTime = me.appHistories[index].lastModifiedAt.substring(10);
		            me.appHistories[index].lastModifiedAt = modAtDate + " " + modAtTime;
		            var modBy = me.appHistories[index].lastModifiedBy.substring(me.appHistories[index].lastModifiedBy.lastIndexOf("\\") + 1);
		            me.appHistories[index].lastModifiedBy = modBy;
		            if (me.appHistories.length > 1) {
		                if (index != (me.appHistories.length - 1)) {
		                    me.appHistories[index].fieldName = me.appHistories[index + 1].previousFieldValue;
		                }
		                else {
		                    me.appHistories[me.appHistories.length - 1].fieldName = me.currentPrice;
		                }
		            }
		            else if (me.appHistories.length == 1) {
		                me.appHistories[index].fieldName = me.currentPrice;
		            }
		        }
		    }
		    me.historyGrid.setData(me.appHistories);
		    me.historyGrid.setHeight($(window).height() - 200);
		},
        
		actionCloseItem: function () {
		    disablePopup();
		    me.setStatus("Loaded");
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.catalogsReadOnly) return;
			
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
				
			if (me.action == "Catalogs") {
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
					if (me.catalogItems[index].modified == false && index < me.catalogItemsCountOnLoad) continue;
					
					catalogItemData = new fin.pur.catalog.CatalogItem(					
						me.catalogItems[index].id						
						, me.catalogItems[index].itemId
						, me.catalogItems[index].itemNumber
						, me.catalogItems[index].itemDescription
						, me.catalogId
						, ""
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
			}
			else if (me.action == "ItemCatalogsAssociation") {
				var item = new fin.pur.catalog.Catalog(0, "", 0, 1, true, [], []);

				me.itemCatalogGrid.body.deselectAll();

				for (var index = 0; index < me.catalogItems.length; index++) {
					if (me.catalogItems[index].modified ) {
						xml += '<purCatalogItem'
					    xml += ' id="' + me.catalogItems[index].id + '"';
					    xml += ' catalogId="' +  me.catalogItems[index].catalogId + '"';
					    xml += ' itemId="' + me.catalogItems[index].itemId + '"';
					    xml += ' price="' + me.catalogItems[index].price + '"';
					    xml += ' displayOrder="' + me.catalogItems[index].displayOrder + '"';
					    xml += ' active="' + me.catalogItems[index].active + '"';
					    xml += '/>';
					}
				};
			}

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
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");
			
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
			var id = 0;
					
			if (status == "success") {
				if (me.status == "addHouseCodes") {
					me.houseCodesTabNeedUpdate = true;
					me.loadCatalogHouseCodesCount();
				}
				else if (me.status == "addItems") {
					me.itemsTabNeedUpdate = true;
					me.loadCatalogItemsCount();
				}
				else if (me.status == "addCatalogs") {
					me.catalogsTabNeedUpdate = true;
					me.catalogItemStore.reset();
					me.catalogItemStore.fetch("userId:[user],itemId:" + me.itemGrid.data[me.itemGrid.activeRowIndex].id
                                            + ",catalogStatus:" + (me.activeSearch.indexSelected == -1 ? -1 : me.activeStatuses[me.activeSearch.indexSelected].number)
                                            , me.itemCatalogsLoaded, me);
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
								
								if (me.action == "Catalogs") {
									for (var index = 0; index < me.catalogItemGrid.data.length; index++) {
										if (me.catalogItemGrid.data[index].modified) {
											if (me.catalogItemGrid.data[index].id <= 0)
												me.catalogItemGrid.data[index].id = id;
											me.catalogItemGrid.data[index].modified = false;
											break;
										}
									}
								}
								else {
									for (var index = 0; index < me.itemCatalogGrid.data.length; index++) {
										if (me.itemCatalogGrid.data[index].modified) {
											if (me.itemCatalogGrid.data[index].id <= 0)
												me.itemCatalogGrid.data[index].id = id;
											me.itemCatalogGrid.data[index].modified = false;
											break;
										}
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
				
				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Catalog details: " + $(args.xmlNode).attr("message"));
			}
			 
			me.status = "";
			if (me.action == "Catalogs") {
				me.catalogHouseCodesCountOnLoad = me.catalogHouseCodes.length;
				me.catalogItemsCountOnLoad = me.catalogItems.length;
			}

			$("#pageLoading").fadeOut("slow");		
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
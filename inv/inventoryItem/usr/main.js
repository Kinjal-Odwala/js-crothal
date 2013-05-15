ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.inv.inventoryItem.usr.defs" );

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
    Name: "fin.inv.inventoryItem.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isReadOnly = false;
			me.yearId = 0;
			me.periodId = 0;
			me.inventoryId = 0;
			me.status = "";
			me.lastSelectedRowIndex = -1;

			// pagination setup
			me.startPoint = 1;
			me.maximumRows = 250;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			me.gateway = ii.ajax.addGateway("inv", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Inventory\\InventoryItems";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			me.fiscalYear.fetchingData();
			me.fiscalPeriod.fetchingData();
			me.fiscalYearStore.fetch("userId:[user],", me.yearsLoaded, me);
			me.modified(false);

			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(window).bind("resize", me, me.resize);

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},

		authorizationProcess: function fin_inv_inventoryItem_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");			

			if (me.isReadOnly) {
				$("#actionMenu").hide();
				$("#AnchorSave").hide();
				$("#AnchorNew").hide();
				me.inventoryGrid.columns["countComplete"].inputControl = null;
				me.inventoryGrid.columns["totalCost"].inputControl = null;
				me.inventoryItemGrid.columns["quantity"].inputControl = null;
			}				

			$("#pageLoading").hide();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	

		sessionLoaded: function fin_inv_inventoryItem_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = fin.inv.inventoryItemUI;			
			
			me.inventoryGrid.setHeight(150);
			me.inventoryItemGrid.setHeight($(window).height() - 290);
		},
		
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;

			if (event.ctrlKey) {

				switch (event.keyCode) {
					case 83: //Ctrl+S
						if ($("#popupInventory").is(":visible"))
							me.actionSaveItem("Add");
						else
							me.actionSaveItem("Edit");
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}

				if (processed) {
					return false;
				}
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
					brief: "Save Inventory (Ctrl+S)", 
					title: "Save the current Inventory.",
					actionFunction: function() { me.actionSaveItem("Edit"); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Inventory (Ctrl+U)", 
					title: "Undo the changes to the Inventory being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
				id: "FiscalYear",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.yearChanged(); }
			});

			me.fiscalPeriod = new ui.ctl.Input.DropDown.Filtered({
				id: "FiscalPeriod",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.periodChanged(); }
			});	

			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("Edit"); },
				hasHotState: true
			});

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});

			me.anchorExport = new ui.ctl.buttons.Sizeable({
				id: "AnchorExport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcel(); },
				hasHotState: true
			});

			me.inventoryGrid = new ui.ctl.Grid({
				id: "InventoryGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.itemSelect(index); },
				deselectFunction: function( index ) { me.itemDeSelect(); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); },
				allowAdds: false
			});			
			
			me.countComplete = new ui.ctl.Input.Check({
		        id: "CountComplete",
		        className: "iiInputCheck",
				appendToId: "InventoryGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.totalCost = new ui.ctl.Input.Text({
		        id: "TotalCost",
		        appendToId: "InventoryGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.inventoryGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
			me.inventoryGrid.addColumn("year", "year", "Year", "Year", 100);
			me.inventoryGrid.addColumn("period", "period", "Period", "Period", 100);
			me.inventoryGrid.addColumn("countComplete", "countComplete", "Count Complete", "Count Complete", 140, function(status) { return (status == "1" ? "Yes" : "No") }, me.countComplete);
			me.inventoryGrid.addColumn("totalCost", "totalCost", "Total Cost", "Total Cost", 100, null, me.totalCost);
			me.inventoryGrid.capColumns();

			me.inventoryItemGrid = new ui.ctl.Grid({
				id: "InventoryItemGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.inventoryItemSelect(index); },
				columnFocusFunction: function() {}
			});

			me.itemQuantity = new ui.ctl.Input.Text({
		        id: "ItemQuantity",
		        appendToId: "InventoryItemGridControlHolder",
				changeFunction: function() { me.modified(); me.calculateCost(); }
		    });

			me.itemQuantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				me.itemQuantity.text.select();

				var enteredText = me.itemQuantity.getValue();

				if (enteredText == "") return;

				if (/^[0-9]+(\.[0-9]+)?$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Quantity.");
			});

			me.inventoryItemGrid.addColumn("itemNumber", "itemNumber", "Item Number", "Item Number", 120);
			me.inventoryItemGrid.addColumn("description", "description", "Description", "Description", null);
			me.inventoryItemGrid.addColumn("uom", "uom", "Uom", "Uom", 100);
			me.inventoryItemGrid.addColumn("accountCode", "accountCode", "Account Code", "Account Code", 120);
			me.inventoryItemGrid.addColumn("price", "price", "Price", "Price", 100);
			me.inventoryItemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100, null, me.itemQuantity, "Quantity");
			me.inventoryItemGrid.addColumn("totalCost", "totalCost", "Item Cost", "Item Cost", 100);
			me.inventoryItemGrid.capColumns();

			me.itemNumber = new ui.ctl.Input.Text({
		        id: "ItemNumber",
				maxLength: 28,
				changeFunction: function() { me.modified(); }
		    });

			me.itemNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.description = new ui.ctl.Input.Text({
		        id: "Description",
				maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.description.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.uom = new ui.ctl.Input.DropDown.Filtered({
		        id: "Uom",
				formatFunction: function( type ) { return type.uom; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.uom.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.uom.lastBlurValue != "" && me.uom.indexSelected == -1)
						this.setInvalid("Please select the correct Uom.");
				});
			
			me.accountCode = new ui.ctl.Input.DropDown.Filtered({
				id: "AccountCode",
				formatFunction: function( type ) { return type.code + " - " + type.description; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.accountCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.accountCode.indexSelected == -1)
						this.setInvalid("Please select the correct Account Code.");
				});
				
			me.price = new ui.ctl.Input.Text({
		        id: "Price",
				changeFunction: function() { me.modified(); me.calculateItemCost(); }
		    });
			
			me.price.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
				var enteredText = me.price.getValue();

				if (enteredText == "") return;
				
				if (/^[0-9]+(\.[0-9]+)?$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Price.");
			});
			
			me.quantity = new ui.ctl.Input.Text({
		        id: "Quantity",
				changeFunction: function() { me.modified(); me.calculateItemCost(); }
		    });
			
			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.quantity.getValue();

				if (enteredText == "") return;
				
				if (/^[0-9]+(\.[0-9]+)?$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Quantity.");
			});
			
			me.anchorSavePopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorSavePopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("Add"); },
				hasHotState: true
			});

			me.anchorSaveNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorSaveNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save and New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("SaveAndNew"); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.itemQuantity.active = false;

			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevInventoryItems(); });
			$("#imgNext").bind("click", function() { me.nextInventoryItems(); });
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.inv.inventoryItem.HirNode,
				itemConstructorArgs: fin.inv.inventoryItem.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.inv.inventoryItem.HouseCode,
				itemConstructorArgs: fin.inv.inventoryItem.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.inv.inventoryItem.FiscalYear,
				itemConstructorArgs: fin.inv.inventoryItem.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});

			me.fiscalPeriods = [];
			me.fiscalPeriodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.inv.inventoryItem.Period,
				itemConstructorArgs: fin.inv.inventoryItem.periodArgs,
				injectionArray: me.fiscalPeriods
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.inv.inventoryItem.Account,
				itemConstructorArgs: fin.inv.inventoryItem.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.uoms = [];
			me.uomStore = me.cache.register({
				storeId: "invInventoryUoms",
				itemConstructor: fin.inv.inventoryItem.Uom,
				itemConstructorArgs: fin.inv.inventoryItem.uomArgs,
				injectionArray: me.uoms	
			});

			me.inventories = [];
			me.inventoryStore = me.cache.register({
				storeId: "invInventorys",
				itemConstructor: fin.inv.inventoryItem.Inventory,
				itemConstructorArgs: fin.inv.inventoryItem.inventoryArgs,
				injectionArray: me.inventories
			});

			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "appRecordCounts",
				itemConstructor: fin.inv.inventoryItem.RecordCount,
				itemConstructorArgs: fin.inv.inventoryItem.recordCountArgs,
				injectionArray: me.recordCounts
			});

			me.inventoryItems = [];
			me.inventoryItemStore = me.cache.register({
				storeId: "invInventoryItems",
				itemConstructor: fin.inv.inventoryItem.InventoryItem,
				itemConstructorArgs: fin.inv.inventoryItem.inventoryItemArgs,
				injectionArray: me.inventoryItems
			});
			
			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "invFileNames",
				itemConstructor: fin.inv.inventoryItem.FileName,
				itemConstructorArgs: fin.inv.inventoryItem.fileNameArgs,
				injectionArray: me.fileNames
			});
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		resizeControls: function() {
			var me = this;

			me.itemNumber.resizeText();
			me.description.resizeText();
			me.uom.resizeText();
			me.accountCode.resizeText();
			me.price.resizeText();
			me.quantity.resizeText();
		},
		
		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.itemNumber.setValue("");
			me.description.setValue("");
			me.uom.reset();
			me.accountCode.reset();			
			me.price.setValue("");
			me.quantity.setValue("");
			$("#TotalItemCost").text("");
		},

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},

		yearsLoaded: function(me, activeId) {
			
			me.fiscalYears.unshift(new fin.inv.inventoryItem.FiscalYear({ id: 0, name: "[All]" }));
			me.fiscalPeriods.push(new fin.inv.inventoryItem.Period({ id: 0, name: "[All]" }));

			me.fiscalYear.setData(me.fiscalYears);
			me.fiscalPeriod.setData(me.fiscalPeriods);
			me.inventoryGrid.setData([]);

			me.fiscalYear.select(0, me.fiscalYear.focused);
			me.fiscalPeriod.select(0, me.fiscalPeriod.focused);

			me.fiscalYear.resizeText();
			me.fiscalPeriod.resizeText();

			me.loadSearchResults();
		},

		yearChanged: function() {
			var me = this;

			if (me.fiscalYear.indexSelected != -1)
				me.yearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
			else
				me.yearId = 0;

			if (me.fiscalYear.indexSelected > 0) {
				parent.fin.appUI.glbFscYear = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
				me.fiscalPeriod.fetchingData();
				me.fiscalPeriodStore.fetch("userId:[user],fiscalYearId:" + me.yearId, me.periodsLoaded, me);
			}
			else {
				me.fiscalPeriods.splice(0);
				me.periodsLoaded(me, 0);
			}
		},
		
		periodsLoaded: function(me, activeId) {

			me.fiscalPeriods.unshift(new fin.inv.inventoryItem.Period({ id: 0, name: "[All]" }));
			me.fiscalPeriod.setData(me.fiscalPeriods);
			me.fiscalPeriod.select(0, me.fiscalPeriod.focused);
		},

		periodChanged: function() {
			var me = this;

			if (me.fiscalPeriod.indexSelected > 0)
				parent.fin.appUI.glbPeriod = me.fiscalPeriod.data[me.fiscalPeriod.indexSelected].id;
		},

		loadSearchResults: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();

			if (me.inventoryGrid.activeRowIndex >= 0)
				me.inventoryGrid.body.deselect(me.inventoryGrid.activeRowIndex, true);

			if (me.fiscalYear.indexSelected == -1)
				me.yearId = 0;
			else
				me.yearId = me.fiscalYears[me.fiscalYear.indexSelected].id;

			if (me.fiscalPeriod.indexSelected == -1)
				me.periodId = 0;
			else
				me.periodId = me.fiscalPeriods[me.fiscalPeriod.indexSelected].id;

			me.inventoryStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId 
				+ ",yearId:" + me.yearId 
				+ ",periodId:" + me.periodId
				+ ",countComplete:0"
				+ ",startPoint:1"
				+ ",maximumRows:1000"
				, me.inventoriesLoaded
				, me
				);
		},

		inventoriesLoaded: function(me, activeId) {

			me.inventoryGrid.setData(me.inventories);
			me.inventoryId = 0;
			me.startPoint = 1;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			var selPageNumber = $("#selPageNumber");
		    selPageNumber.empty();
			selPageNumber.append("<option value='1'>1</option>");
			selPageNumber.val(me.pageCurrent);
			$("#spnPageInfo").html(" of 1 (0 records)");

			var index = me.inventoryItemGrid.activeRowIndex;
			if (index >= 0)
				me.inventoryItemGrid.body.deselect(index, true);
			
			me.inventoryItemGrid.setData([]);
			me.inventoryItemStore.reset();
			$("#pageLoading").hide();
		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();

			me.lastSelectedRowIndex = index;
			me.totalCost.text.readOnly = true;
			me.inventoryId = me.inventories[index].id;
			me.inventoryItemGrid.body.deselectAll(true);
			me.recordCountStore.fetch("userId:[user],module:InventoryItems,id:" + me.inventoryId, me.recordCountsLoaded, me);
		},

		itemDeSelect: function() {
			var me = this;
			var countComplete = "No";

			if (me.lastSelectedRowIndex >= 0) {
				if (me.inventoryGrid.data[me.lastSelectedRowIndex].countComplete)
					countComplete = "Yes";
				$(me.inventoryGrid.rows[me.lastSelectedRowIndex].getElement("countComplete")).text(countComplete);
			}
		},

		recordCountsLoaded: function(me, activeId) {		    
		    var selPageNumber = $("#selPageNumber");

			me.startPoint = 1;
		    me.recordCount = me.recordCounts[0].recordCount;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);

		    // if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;

		    // fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}

			$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
		    selPageNumber.val(me.pageCurrent);
			me.listInventoryItems();			
		},
		
		listInventoryItems: function() {
			var me = this;

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			$("#selPageNumber").val(me.pageCurrent);
	
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
			me.inventoryItemStore.fetch("userId:[user],inventoryId:" + me.inventoryId 
				+ ",startPoint:" + me.startPoint 
				+ ",maximumRows:" + me.maximumRows
				, me.inventoryItemsLoaded
				, me
				);
		},

		inventoryItemsLoaded: function(me, activeId) {	
		
			me.inventoryItemGrid.setData(me.inventoryItems);
			$("#pageLoading").hide();
		},

		inventoryItemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (index >= 0)
				me.inventoryItems[index].modified = true;

			$("#ItemQuantityText").keypress(function (e) {
				if (e.which != 46 && e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
					return false;
			});
		},

		calculateCost: function() {
			var me = this;
			var index = me.inventoryItemGrid.activeRowIndex;
			var quantity = me.itemQuantity.getValue();
			var price = parseFloat($(me.inventoryItemGrid.rows[index].getElement("price")).text());

			if (quantity != "" && !isNaN(quantity) && price != undefined)
				var total = ui.cmn.text.money.format(quantity * price);
			else
				total = "0.00";

			$(me.inventoryItemGrid.rows[index].getElement("totalCost")).text(total);
		},
		
		calculateItemCost: function() {			
			var me = this;
			var quantity = me.quantity.getValue();
			var price = me.price.getValue();
			
			if (quantity != "" && !isNaN(quantity) && price != undefined)
				var total = ui.cmn.text.money.format(quantity * price);
			else
				total = "";
			
			$("#TotalItemCost").text(total);
		},

		prevInventoryItems: function() {
		    var me = this;

			me.pageCurrent--;

			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.listInventoryItems();
		},

		nextInventoryItems: function() {
		    var me = this;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.listInventoryItems();
		},
		
		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");
		    
		    me.pageCurrent = Number(selPageNumber.val());
		    me.listInventoryItems();
		},
		
		actionNewItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.inventoryGrid.activeRowIndex == -1) {
				alert("Please select the Inventory.")
				return;
			}

			var index = me.inventoryItemGrid.activeRowIndex;
			if (index >= 0)
				me.inventoryItemGrid.body.deselect(index, true);

			me.uom.fetchingData();
			me.accountCode.fetchingData();
			me.uomStore.fetch("userId:[user]", me.uomsLoaded, me);
			me.accountStore.fetch("userId:[user],moduleId:inventory", me.accountsLoaded, me);
			me.loadPopup();
			me.resetControls();
			me.resizeControls();
			me.itemNumber.text.focus();
			$("#Year").text(me.inventories[me.inventoryGrid.activeRowIndex].year);
			$("#Period").text(me.inventories[me.inventoryGrid.activeRowIndex].period);
		},

		uomsLoaded: function (me, activeId) {

			me.uom.setData(me.uoms);
		},

		accountsLoaded: function (me, activeId) {

			me.accountCode.setData(me.accounts);
		},		
		
		loadPopup: function() {
			var me = this;
			me.centerPopup();

			$("#backgroundPopup").css({
				"opacity": "0.5"
			});
			$("#backgroundPopup").fadeIn("slow");
			$("#popupInventory").fadeIn("slow");
		},

		hidePopup: function() {
		
			$("#backgroundPopup").fadeOut("slow");
			$("#popupInventory").fadeOut("slow");
		},

		centerPopup: function() {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = $("#popupInventory").width();
			var popupHeight = $("#popupInventory").height();
				
			$("#popupInventory").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
			
			$("#popupLoading").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
				
			$("#backgroundPopup").css({
				"height": windowHeight
			});
		},		

		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.hidePopup();
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.inventoryGrid.activeRowIndex >= 0) {						
				var index = me.inventoryItemGrid.activeRowIndex;
				if (index >= 0)
					me.inventoryItemGrid.body.deselect(index, true);
				me.inventoryItemStore.reset();
				me.listInventoryItems();
			}
		},
		
		actionSaveItem: function(actionType) {
			var me = this;
			var item = [];
			var xml = "";

			if (me.inventoryGrid.activeRowIndex == -1 || me.isReadOnly)
				return;
			
			me.validator.forceBlur();	
			me.status = actionType;
			me.inventoryItemGrid.body.deselectAll();
				
			if (me.status == "Edit") {
				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true) && me.inventoryItemGrid.activeRowIndex >= 0) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}

				if (!confirm("You are about to save your inventory counts. If you checked the Count Complete box you will no longer be able to access the counts for this House Code. Do you wish to continue?")) 
					return false;
				
				$("#messageToUser").text("Saving");
				$("#pageLoading").show();

				for (var index = 0; index < me.inventoryItems.length; index++) {
					if (me.inventoryItems[index].modified) {
						var item = me.inventoryItems[index];
						item.modified = false;						
						xml += me.saveXmlBuildItem(item);
					}
				}

				xml += '<invInventory';
				xml += ' id="' + me.inventoryId + '"';
				xml += ' countComplete="' + me.countComplete.check.checked + '"';
				xml += '/>';
			}
			else if (me.status == "Add" || me.status == "SaveAndNew") {

				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}

				$("#popupMessageToUser").text("Saving");
				$("#popupLoading").show();

				var item = new fin.inv.inventoryItem.InventoryItem(
					0
					, me.inventoryId
					, me.accounts[me.accountCode.indexSelected].id
					, me.accounts[me.accountCode.indexSelected].code
					, me.itemNumber.getValue()
					, me.description.getValue()
					, ""
					, ""
					, ""
					, me.uom.lastBlurValue
					, ui.cmn.text.money.format(parseFloat(me.price.getValue()))
					, me.quantity.getValue() == "" ? "0.00" : ui.cmn.text.money.format(parseFloat(me.quantity.getValue()))
					, me.quantity.getValue() == "" ? "0.00" : $("#TotalItemCost").text()
					, false
					);
					
				xml = me.saveXmlBuildItem(item);
			}			

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildItem: function() {
			var args = ii.args(arguments,{
				item: {type: fin.inv.inventoryItem.InventoryItem}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<invInventoryItem';
			xml += ' id="' + item.id + '"';
			xml += ' inventoryId="' + item.inventoryId + '"';
			xml += ' account="' + item.account + '"';
			xml += ' itemNumber="' + ui.cmn.text.xml.encode(item.itemNumber) + '"';
			xml += ' description="' + ui.cmn.text.xml.encode(item.description) + '"';			
			xml += ' uom="' + ui.cmn.text.xml.encode(item.uom) + '"';				
			xml += ' price="' + item.price + '"';
			xml += ' quantity="' + item.quantity + '"';
			xml += '/>';

			return xml;			
		},	

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
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
				me.modified(false);
				
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "invInventory":
						
							if (me.countComplete.check.checked) {
								var index = me.inventoryGrid.activeRowIndex;
								me.inventoryGrid.body.deselect(index, true);
								me.inventories.splice(index, 1);			
								me.inventoriesLoaded(me, 0);
							}
							else
								me.totalCost.setValue($(this).attr("totalCost"));

							break;

						case "invInventoryItem":

							if (me.status == "Add" || me.status == "SaveAndNew") {
								item.id = parseInt($(this).attr("id"), 10);
								me.inventoryItems.push(item);
								me.inventoryItemGrid.setData(me.inventoryItems);
								var total = parseFloat(me.totalCost.getValue()) + parseFloat(item.totalCost);
								me.totalCost.setValue(total.toFixed(2));
								me.recordCount++;
								$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");

								if (me.status == "Add")
									me.hidePopup();
								else
									me.resetControls();
							}

							$("#popupLoading").hide();

							break;
					}
				});
			}
			else {
				alert("[SAVE FAILURE] Error while updating Inventory details: " + $(args.xmlNode).attr("message"));
			}

			me.status = "";
			$("#pageLoading").hide();
		},

		actionExportToExcel: function() {
			var me = this;

			if (me.inventoryGrid.activeRowIndex == -1)
				return;

			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();

			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],inventoryId:" + me.inventoryId + ",type:InventoryItems", me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			$("#pageLoading").hide();

			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		}
	}
});

function main() {

	fin.inv.inventoryItemUI = new fin.inv.inventoryItem.UserInterface();
	fin.inv.inventoryItemUI.resize();
	fin.houseCodeSearchUi = fin.inv.inventoryItemUI;
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.inv.administration.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);

ii.Class({
    Name: "fin.inv.administration.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isReadOnly = false;
			me.countStatuses = [];
			me.houseCodeId = 0;
			me.yearId = 0;
			me.periodId = 0;
			me.countCompleteId = 0;
			me.inventoryId = 0;
			me.actionType = 0;
			me.module = "";
			me.lastSelectedRowIndex = -1;
			me.setPopupPeriod = false;

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
			me.authorizePath = "\\crothall\\chimes\\fin\\Inventory\\Administration";
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

			$(window).bind("resize", me, me.resize);
			$("#countCompleteHeader").hide();
			
			$("input[name='InventoryList']").click(function() {
				if (this.id == "InventoryListFromPO")
					$("#MaidCartItemGrid").hide();
				else if (this.id == "InventoryListFromMaidCart") {
					$("#MaidCartItemGrid").show();
					me.maidCartItemGrid.setHeight(120);
				}
			});

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
		},

		authorizationProcess: function fin_inv_administration_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			if (me.isReadOnly) {
				me.inventoryGrid.columns["countComplete"].inputControl = null;
				me.inventoryGrid.columns["totalCost"].inputControl = null;
				$("#generateInventoryListAction").hide();
				$("#AnchorSave").hide();
			}

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "searchInventoryCountAction",
					brief: "Search & Edit Inventory Counts", 
					title: "Search & Edit Inventory Counts.",
					actionFunction: function() { me.actionSearchInventoryCount(); }
				})
				.addAction({
					id: "inventoryStatusAction", 
					brief: "Show Inventory Status (Completed / Not Completed)", 
					title: "Show Inventory Status (Completed / Not Completed).",
					actionFunction: function() { me.actionInventoryStatus(); }
				})
				.addAction({
					id: "auditLogReportAction",
					brief: "Audit Log Lookup Web Report",
					title: "Audit Log Lookup Web Report.",
					actionFunction: function(){
						me.actionAuditLogReport();
					}
				});
			
			me.reportInventoryMidYearToYearEnd = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\InventoryMidYear");
			if (me.reportInventoryMidYearToYearEnd) {
				me.actionMenu
					.addAction({
						id: "inventoryReportAction",
						brief: "Inventory Mid Year and Year End",
						title: "Inventory Mid Year and Year End.",
						actionFunction: function() { me.actionInventoryReport(); }
					});
			}

			me.actionMenu
				.addAction({
					id: "generateInventoryListAction", 
					brief: "Generate Inventory List", 
					title: "Generate list of Inventories from Purchase Orders.",
					actionFunction: function() { me.actionGenerateInventoryList(); }
				});

			$("#pageLoading").hide();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	

		sessionLoaded: function fin_inv_administration_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.inv.administrationUI;

			if (me == undefined)
				return;
			
			if (me.actionType == 0) {
				me.inventoryGrid.setHeight(150);
				if (ii.browser.ie && ii.browser.version == 7)
					me.inventoryItemGrid.setHeight($(window).height() - 346);
				else
					me.inventoryItemGrid.setHeight($(window).height() - 320);
			}
			else {
				if (ii.browser.ie && ii.browser.version == 7)
					me.inventoryGrid.setHeight($(window).height() - 145);
				else
					me.inventoryGrid.setHeight($(window).height() - 133);
			}
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
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
			
			me.countCompleteStatus = new ui.ctl.Input.DropDown.Filtered({
				id: "CountCompleteStatus",
				formatFunction: function( type ) { return type.name; }
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
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorExport = new ui.ctl.buttons.Sizeable({
				id: "AnchorExport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcel(); },
				hasHotState: true
			});

			me.createGrid();

			me.inventoryItemGrid = new ui.ctl.Grid({
				id: "InventoryItemGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.inventoryItemGrid.addColumn("itemNumber", "itemNumber", "Item Number", "Item Number", 120);
			me.inventoryItemGrid.addColumn("description", "description", "Description", "Description", null);
			me.inventoryItemGrid.addColumn("uom", "uom", "Uom", "Uom", 100);
			me.inventoryItemGrid.addColumn("accountCode", "accountCode", "Account Code", "Account Code", 120);
			me.inventoryItemGrid.addColumn("price", "price", "Price", "Price", 100);
			me.inventoryItemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100);
			me.inventoryItemGrid.addColumn("totalCost", "totalCost", "Item Cost", "Item Cost", 100);
			me.inventoryItemGrid.addColumn("modBy", "modBy", "Modified By", "Modified By", 160);
			me.inventoryItemGrid.capColumns();
			
			me.yearPopup = new ui.ctl.Input.DropDown.Filtered({
				id: "Year",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.popupYearChanged(); }
			});
			
			me.yearPopup.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.yearPopup.indexSelected == -1)
						this.setInvalid("Please select the correct Fiscal Year.");
				});

			me.periodPopup = new ui.ctl.Input.DropDown.Filtered({
				id: "Period",
				formatFunction: function( type ) { return type.name; }
			});

			me.periodPopup.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.periodPopup.indexSelected == -1)
						this.setInvalid("Please select the correct Period.");
				});
				
			me.maidCartItemGrid = new ui.ctl.Grid({
				id: "MaidCartItemGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.itemPrice = new ui.ctl.Input.Money({
		        id: "ItemPrice",
				appendToId: "MaidCartItemGridControlHolder"
		    });

			me.itemPrice.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.itemQuantity = new ui.ctl.Input.Text({
		        id: "ItemQuantity",
		        maxLength: 10, 
				appendToId: "MaidCartItemGridControlHolder"
		    });

			me.itemQuantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

					if (isNaN(me.itemQuantity.getValue()))
						this.setInvalid("Please enter valid Quantity. Example: 99");
			});

			me.maidCartItemGrid.addColumn("itemNumber", "itemNumber", "Item Number", "Item Number", 120);
			me.maidCartItemGrid.addColumn("description", "description", "Description", "Description", null);
			me.maidCartItemGrid.addColumn("price", "price", "Price", "Price", 100,  null, me.itemPrice);
			me.maidCartItemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100,  null, me.itemQuantity);
			me.maidCartItemGrid.capColumns();

			me.anchorGenerate = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});

			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevItems(); });
			$("#imgNext").bind("click", function() { me.nextItems(); });
		},
		
		createGrid: function() {
			var me = this;

			$("#InventoryGrid").html("");

			me.inventoryGrid = new ui.ctl.Grid({
				id: "InventoryGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.itemSelect(index); },
				deselectFunction: function( index ) { me.itemDeSelect(); },
				allowAdds: false
			});			

			me.inventoryGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", null);
			me.inventoryGrid.addColumn("year", "year", "Year", "Year", 100);
			me.inventoryGrid.addColumn("period", "period", "Period", "Period", 100);

			if (me.actionType == 0) { // Search Inventory Items
				if (me.isReadOnly) {
					me.inventoryGrid.addColumn("countComplete", "countComplete", "Count Complete", "Count Complete", 140, function(status) { return (status == "1" ? "Yes" : "No") });
					me.inventoryGrid.addColumn("totalCost", "totalCost", "Total Cost", "Total Cost", 100);
				}
				else {
					me.countComplete = new ui.ctl.Input.Check({
				        id: "CountComplete",
				        className: "iiInputCheck",
						appendToId: "InventoryGridControlHolder"
				    });
					
					me.totalCost = new ui.ctl.Input.Text({
				        id: "TotalCost",
				        appendToId: "InventoryGridControlHolder"
				    });
					
					me.inventoryGrid.addColumn("countComplete", "countComplete", "Count Complete", "Count Complete", 140, function(status) { return (status == "1" ? "Yes" : "No") }, me.countComplete);
					me.inventoryGrid.addColumn("totalCost", "totalCost", "Total Cost", "Total Cost", 100, null, me.totalCost);
				}
			}			
			else if (me.actionType == 1 || me.actionType == 2) { // Audit Log Lookup Or Inventory Status (completed / not completed)
				me.inventoryGrid.addColumn("countComplete", "countComplete", "Count Complete", "Count Complete", 140, function(status) { return (status == "1" ? "Yes" : "No") });
				me.inventoryGrid.addColumn("modBy", "modBy", "Modified By", "Modified By", 160);
				me.inventoryGrid.addColumn("modAt", "modAt", "Modified At", "Modified At", 160);
			}			

			me.inventoryGrid.capColumns();
			me.inventoryGrid.setData([]);
			me.resize();

			$("#spnPageInfo").html(" of 1 (0 records)");
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.inv.administration.HirNode,
				itemConstructorArgs: fin.inv.administration.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.inv.administration.HouseCode,
				itemConstructorArgs: fin.inv.administration.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.inv.administration.FiscalYear,
				itemConstructorArgs: fin.inv.administration.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});

			me.fiscalPeriods = [];
			me.fiscalPeriodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.inv.administration.Period,
				itemConstructorArgs: fin.inv.administration.periodArgs,
				injectionArray: me.fiscalPeriods
			});			

			me.inventories = [];
			me.inventoryStore = me.cache.register({
				storeId: "invInventorys",
				itemConstructor: fin.inv.administration.Inventory,
				itemConstructorArgs: fin.inv.administration.inventoryArgs,
				injectionArray: me.inventories
			});

			me.recordCounts = [];
			me.recordCountStore = me.cache.register({
				storeId: "appRecordCounts",
				itemConstructor: fin.inv.administration.RecordCount,
				itemConstructorArgs: fin.inv.administration.recordCountArgs,
				injectionArray: me.recordCounts
			});

			me.inventoryItems = [];
			me.inventoryItemStore = me.cache.register({
				storeId: "invInventoryItems",
				itemConstructor: fin.inv.administration.InventoryItem,
				itemConstructorArgs: fin.inv.administration.inventoryItemArgs,
				injectionArray: me.inventoryItems
			});
			
			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "invFileNames",
				itemConstructor: fin.inv.administration.FileName,
				itemConstructorArgs: fin.inv.administration.fileNameArgs,
				injectionArray: me.fileNames
			});
		},
		
		resetControls: function() {
			var me = this;

			me.inventoryId = 0;
			me.startPoint = 1;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			me.inventoryItemGrid.setData([]);
			me.inventoryItemStore.reset();

			var selPageNumber = $("#selPageNumber");
		    selPageNumber.empty();
			selPageNumber.append("<option value='1'>1</option>");
			selPageNumber.val(me.pageCurrent);
			$("#spnPageInfo").html(" of 1 (0 records)");
		},

		houseCodesLoaded: function(me, activeId) { //houseCodes

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},
		
		yearsLoaded: function(me, activeId) {

			me.fiscalYears.unshift(new fin.inv.administration.FiscalYear({ id: 0, name: "[All]" }));
			me.countStatuses.push(new fin.inv.administration.CountComplete(-1, "[All]"));
			me.countStatuses.push(new fin.inv.administration.CountComplete(0, "No"));
			me.countStatuses.push(new fin.inv.administration.CountComplete(1, "Yes"));

			me.fiscalYear.setData(me.fiscalYears);
			me.countCompleteStatus.setData(me.countStatuses);
			me.inventoryGrid.setData([]);

			me.fiscalYear.select(0, me.fiscalYear.focused);
			me.countCompleteStatus.select(0, me.countCompleteStatus.focused);

			me.fiscalYear.resizeText();
			me.fiscalPeriod.resizeText();
			me.countCompleteStatus.resizeText();

			me.yearChanged();
			me.loadSearchResults();
		},
		
		yearChanged: function() {
			var me = this;

			me.setPopupPeriod = false;

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

			if (me.setPopupPeriod) {
				me.periodPopup.setData(me.fiscalPeriods);
				me.periodPopup.select(0, me.periodPopup.focused);
			}
			else {
				me.periods = me.fiscalPeriods.slice(0);
				me.periods.unshift(new fin.inv.administration.Period({ id: 0, name: "[All]" }));
				me.fiscalPeriod.setData(me.periods);
				me.fiscalPeriod.select(0, me.fiscalPeriod.focused);
			}
		},

		periodChanged: function() {
			var me = this;

			if (me.fiscalPeriod.indexSelected > 0)
				parent.fin.appUI.glbPeriod = me.fiscalPeriod.data[me.fiscalPeriod.indexSelected].id;
		},

		loadSearchResults: function() {
			var me = this;

			if (me.actionType == 0 || me.actionType == 2)
				me.houseCodeId = parent.fin.appUI.houseCodeId;
			else
				me.houseCodeId = 0;

			if (me.fiscalYear.indexSelected == -1)
				me.yearId = 0;
			else
				me.yearId = me.fiscalYears[me.fiscalYear.indexSelected].id;

			if (me.fiscalPeriod.indexSelected == -1)
				me.periodId = 0;
			else
				me.periodId = me.fiscalPeriod.data[me.fiscalPeriod.indexSelected].id;

			if (me.countCompleteStatus.indexSelected >= 0 && me.actionType == 1)
				me.countCompleteId = me.countStatuses[me.countCompleteStatus.indexSelected].id;
			else
				me.countCompleteId = -1;

			if (me.actionType == 0) {
				me.module = "Inventories";
				me.listInventories();
			}
			else
				me.listRecordsCount();
		},

		listInventories: function() {
			var me = this;

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();

			$("#selPageNumber").val(me.pageCurrent);
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;

			if (me.inventoryGrid.activeRowIndex >= 0)
				me.inventoryGrid.body.deselect(me.inventoryGrid.activeRowIndex, true);

			me.inventoryStore.fetch("userId:[user],module:" + me.module
				+ ",houseCodeId:" + me.houseCodeId
				+ ",yearId:" + me.yearId
				+ ",periodId:" + me.periodId
				+ ",countComplete:" + me.countCompleteId
				+ ",startPoint:" + (me.actionType == "0" ? "1" : me.startPoint)
				+ ",maximumRows:" + (me.actionType == "0" ? "1000" : me.maximumRows)
				, me.inventoriesLoaded
				, me
				);
		},

		listRecordsCount: function() {
			var me = this;
			
			if (me.actionType == 2)
				me.module = "InventoryAuditLogs";
			else
				me.module = "Inventories";

			me.recordCountStore.fetch("userId:[user],module:" + me.module
				+ ",houseCodeId:" + me.houseCodeId
				+ ",yearId:" + me.yearId
				+ ",period:" + me.periodId
				+ ",countComplete:" + me.countCompleteId
				, me.recordCountsLoaded
				, me
				);
		},

		inventoriesLoaded: function(me, activeId) {

			me.inventoryGrid.setData(me.inventories);
			
			if (me.actionType == 0) {
				me.resetControls();
			}
			
			$("#pageLoading").hide();
		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (me.actionType != 0)
				return;

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
			
			if (me.actionType == 0)
				me.listInventoryItems();
			else
				me.listInventories();
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

		prevItems: function() {
		    var me = this;

			me.pageCurrent--;

			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else {
				if (me.actionType == 0)
					me.listInventoryItems();
				else
					me.listInventories();
			}
		},

		nextItems: function() {
		    var me = this;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else {
				if (me.actionType == 0)
					me.listInventoryItems();
				else
					me.listInventories();
			}
		},

		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");

		    me.pageCurrent = Number(selPageNumber.val());

			if (me.actionType == 0)
				me.listInventoryItems();
			else
				me.listInventories();
		},

		actionSearchInventoryCount: function() {
			var me = this;

			if (me.actionType == 0)
				return;

			if (!me.isReadOnly)
				$("#AnchorSave").show();

			$("#houseCodeHeader").show();
			$("#InventoryItemGridContainer").show();
			$("#countCompleteHeader").hide();
			$("#pageHeader").text("Search Inventory Items");

			me.actionType = 0;
			me.createGrid();
			me.resetControls();
		},

		actionInventoryStatus: function() {
			var me = this;

			if (me.actionType == 1)
				return;

			$("#countCompleteHeader").show();
			$("#houseCodeHeader").hide();
			$("#InventoryItemGridContainer").hide();
			$("#AnchorSave").hide();
			$("#pageHeader").text("Inventory Status (Completed / Not Completed)");

			me.countCompleteStatus.resizeText();
			me.actionType = 1;
			me.createGrid();
		},
		
		actionAuditLogReport: function() {
			var me = this;

			if (me.actionType == 2)
				return;

			$("#houseCodeHeader").show();
			$("#countCompleteHeader").hide();
			$("#InventoryItemGridContainer").hide();
			$("#AnchorSave").hide();
			$("#pageHeader").text("Audit Log Lookup");

			me.actionType = 2;
			me.createGrid();
		},
		
		actionInventoryReport: function() {
			var me = this;
			var title = '';
			var reportURL = '';

			//get the report URL from menuItems			
			$(parent.fin.appUI.layout.menu.items['invt'].xmlNode).find("item").each( 
				function() {
					title = $(this).attr("title");
					if(title == 'Inventory Mid Year And Year En'){ //Inventory Mid Year And Year End
						reportURL = $(this).attr("actionData");						
					}
				}
			);

			window.open(reportURL);
		},

		actionGenerateInventoryList: function() {
			var me = this;

			me.years = [];
			me.loadPopup();

			for (var index = 1; index < me.fiscalYears.length; index++) {
				me.years.push(new fin.inv.administration.FiscalYear({ id: me.fiscalYears[index].id, name: me.fiscalYears[index].name }));
			}

			me.yearPopup.setData(me.years);
			me.periodPopup.setData([]);

			var index = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.years);

			if (index >= 0)
				me.yearPopup.select(index, me.yearPopup.focused);
			else
				me.yearPopup.select(0, me.yearPopup.focused);

			me.popupYearChanged();
			me.yearPopup.resizeText();
			me.periodPopup.resizeText();
			$("#InventoryListFromPO")[0].checked = true;
			$("#MaidCartItemGrid").hide();

			me.maidCartItems = [];
			me.maidCartItems.push(new fin.inv.administration.InventoryItem({ id: 1, itemNumber: 'ERGOWORXMC', description: 'ErgoWorx / Microfiber System - Maid Carts' }));
			me.maidCartItems.push(new fin.inv.administration.InventoryItem({ id: 2, itemNumber: 'MAIDCART', description: 'Maid Carts' }));
			me.maidCartItems.push(new fin.inv.administration.InventoryItem({ id: 3, itemNumber: 'PBSETUP', description: 'Project/Bucket Set-Up' }));
			me.maidCartItemGrid.setData(me.maidCartItems);
		},

		popupYearChanged: function() {
			var me = this;

			if (me.yearPopup.indexSelected == -1)
				return;

			me.setPopupPeriod = true;
			me.periodPopup.fetchingData();
			me.fiscalPeriodStore.reset();
			me.fiscalPeriodStore.fetch("userId:[user],fiscalYearId:" + me.yearPopup.data[me.yearPopup.indexSelected].id, me.periodsLoaded, me);
		},

		actionCancelItem: function() {
			var me = this;

			me.hidePopup();
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

		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			if (me.inventoryGrid.activeRowIndex == -1 || me.isReadOnly)
				return;

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			xml += '<invInventory';
			xml += ' id="' + me.inventoryId + '"';
			xml += ' countComplete="' + me.countComplete.check.checked + '"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
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
			var errorMessage = "";

			if (status == "success") {
				ii.trace("Inventory record updated successfully.", ii.traceTypes.Information, "Info");
			}
			else {
				errorMessage = "Error while updating Inventory record: " + $(args.xmlNode).attr("message");
				errorMessage += $(args.xmlNode).attr("error");
				errorMessage += " [SAVE FAILURE]";
				alert(errorMessage);				
			}

			$("#pageLoading").hide();
		},

		actionExportToExcel: function() {
			var me = this;
			var type = "";

			if (me.actionType == 0 && me.inventoryGrid.activeRowIndex == -1)
				return;

			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();

			if (me.actionType == 0 || me.actionType == 2)
				me.houseCodeId = parent.fin.appUI.houseCodeId;
			else
				me.houseCodeId = 0;

			if (me.fiscalYear.indexSelected == -1)
				me.yearId = 0;
			else
				me.yearId = me.fiscalYears[me.fiscalYear.indexSelected].id;

			if (me.fiscalPeriod.indexSelected == -1)
				me.periodId = 0;
			else
				me.periodId = me.fiscalPeriod.data[me.fiscalPeriod.indexSelected].id;

			if (me.countCompleteStatus.indexSelected >= 0 && me.actionType == 1)
				me.countCompleteId = me.countStatuses[me.countCompleteStatus.indexSelected].id;
			else
				me.countCompleteId = -1;

			if (me.actionType == 0)
				type = "InventoryItems";
			else if (me.actionType == 1)
				type = "Inventories";
			else if (me.actionType == 2)
				type = "InventoryAuditLogs";
	
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],type:" + type
				+ ",inventoryId:" + me.inventoryId
				+ ",houseCodeId:" + me.houseCodeId
				+ ",yearId:" + me.yearId
				+ ",periodId:" + me.periodId
				+ ",countComplete:" + me.countCompleteId
				, me.fileNamesLoaded
				, me
				);
		},

		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			$("#pageLoading").hide();

			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionGenerateItem: function() {
			var me = this;
			var item = [];
			var xml = "";
			var type = 0;
			var valid = true;

			if (!(me.yearPopup.validate(true) && me.periodPopup.validate(true))) {
				alert("In order to generate inventory list, the errors on the page must be corrected.");
				return;
			}

			type = $("input[name='InventoryList']:checked").val();

			if (type == "1") {
				xml += '<invInventoryGenerate';
				xml += ' yearId="' + me.years[me.yearPopup.indexSelected].id + '"';
				xml += ' periodId="' + me.periodPopup.data[me.periodPopup.indexSelected].id + '"';
				xml += ' type="' + type + '"';
				xml += '/>';
			}
			else if (type == "0") {
				
				me.maidCartItemGrid.body.deselectAll();
				
				for (var index = 0; index < me.maidCartItems.length; index++) {
					if (me.maidCartItems[index].price <= 0) {
						valid = false;
						break;
					}
				}

				if (!valid) {
					alert("Please enter the item price. The price should be greater than 0.");
					return;
				}				
				else if (!(me.itemPrice.validate(true) && me.itemQuantity.validate(true))) {
					alert("In order to generate inventory list, the errors on the page must be corrected.");
					return;
				}

				for (var index = 0; index < me.maidCartItems.length; index++) {
					xml += '<invInventoryGenerate';
					xml += ' yearId="' + me.years[me.yearPopup.indexSelected].id + '"';
					xml += ' periodId="' + me.periodPopup.data[me.periodPopup.indexSelected].id + '"';
					xml += ' type="' + type + '"';
					xml += ' itemNumber="' + me.maidCartItems[index].itemNumber + '"';
					xml += ' description="' + ui.cmn.text.xml.encode(me.maidCartItems[index].description) + '"';
					xml += ' price="' + me.maidCartItems[index].price + '"';
					xml += ' quantity="' + me.maidCartItems[index].quantity + '"';
					xml += '/>';
				}
			}

			$("#popupMessageToUser").text("Generating");
			$("#popupLoading").show();

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.generateResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		generateResponse: function() {
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
				$("#popupLoading").hide();
				alert("Inventory list generated successfully.");
				me.hidePopup();
			}
			else {
				errorMessage = "Error while generating Inventory list: " + $(args.xmlNode).attr("message");
				errorMessage += $(args.xmlNode).attr("error");
				errorMessage += " [SAVE FAILURE]";
				alert(errorMessage);				
			}
		}
	}
});

function main() {

	fin.inv.administrationUI = new fin.inv.administration.UserInterface();
	fin.inv.administrationUI.resize();
	fin.houseCodeSearchUi = fin.inv.administrationUI;
}
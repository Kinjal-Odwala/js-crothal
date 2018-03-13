ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.pur.master.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );
ii.Style( "fin.cmn.usr.tabs", 10 );

ii.Class({
    Name: "fin.pur.master.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
        init: function () {
			var args = ii.args(arguments, {});
			var me = this;			

			me.purchaseOrderId = 0;
			me.vendorId = 0;
			me.accountId = 0;
			me.catalogId = 0;
			me.lastSelectedRowIndex = -1;
			me.activeFrameId = 0;			
			me.openOrderNeedUpdate = true;
			me.placedOrderNeedUpdate = true;
			me.transactionStatusType = 0;
			me.status = "";
			me.checkStatus = false;
			me.editColumn = false;
			me.doResize = false;
			me.reloadGrid = false;
			me.windowWidth = 0;
			me.windowHeight = 0;
			me.lastSelectedItemRowIndex = -1;
			me.loadCount = 0;
			me.glAccounts = [];
			
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\PurchaseOrders";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			me.searchTypesLoaded();
			me.setStatus("Loading");
			me.modified(false);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();

			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			me.$reportFooter = $("#ReportFooterTextArea")[0];
			$("#ReportFooterTextArea").keyup(function(){
				if (this.value.length > 1000) {
					alert('Report footer length. max - 1000 characters.');
					return false;
				}
			});	
			
			// blur event is not firing when clicking on the tab. Due to this dirty check function and prompt message was not working.
			$("#TabCollection a").mouseover(function() {
				if (!parent.parent.fin.appUI.modified) {
					var focusedControl = $("iframe")[me.activeFrameId].contentWindow.document.activeElement;

					if (focusedControl.type != undefined && (focusedControl.type == "text" || focusedControl.type == "textarea"))
						$(focusedControl).blur();
				}
			});

			$("#TabCollection a").mousedown(function() {
				if (!parent.fin.cmn.status.itemValid()) 
					return false;
				else {
					var tabIndex = 0;
					if (this.id == "TabOpenOrders")
						tabIndex = 1;
					else if (this.id == "TabPlacedOrders")
						tabIndex = 2;
							
					$("#container-1").tabs(tabIndex);
					$("#container-1").triggerTab(tabIndex);
				}					
			});
			
			$("#TabCollection a").click(function() {
			
				switch(this.id){
					case "TabOpenOrders":

						me.activeFrameId = 0;
						if (me.openOrderNeedUpdate) {
							me.lastSelectedRowIndex = -1;
							me.loadPurchaseOrders();
						}													
						
						$("#Buttons").show();
						me.openOrderNeedUpdate = false;
						me.placedOrderNeedUpdate = true;
						break;
						
					case "TabPlacedOrders":
					
						me.activeFrameId = 1;
						if (me.placedOrderNeedUpdate) {
							me.lastSelectedRowIndex = -1;
							me.loadPurchaseOrders();
						}							
						
						$("#Buttons").hide();
						me.openOrderNeedUpdate = true;
						me.placedOrderNeedUpdate = false;
						break;
				}
			});
			
			$("#minus0").toggle(
	            function() { 
	                $("#image0").attr("src", "/fin/cmn/usr/media/Common/Plus.gif");
					$("#GridContianer").hide();
					me.doResize = true;
					if (!ii.browser.ie || (ii.browser.ie && ii.browser.version > 8))
						me.resize();
	            }, 
				function() {            
					$("#image0").attr("src", "/fin/cmn/usr/media/Common/Minus.gif");
					$("#GridContianer").show();
					me.doResize = true;
					if (!ii.browser.ie || (ii.browser.ie && ii.browser.version > 8))
						me.resize();
	    	});	
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_pur_item_master_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
					
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.purchaseOrdersReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.openPurchaseOrders = me.authorizer.isAuthorized(me.authorizePath + "\\OpenPO");

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");
				
				if (me.purchaseOrdersReadOnly) {
					$("#actionMenu").hide();
					$("#AnchorMasterButtons").hide();				
				}
					
				ii.timer.timing("Page displayed");
				me.loadCount = 2;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				
				if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
					me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
				else
					me.houseCodesLoaded(me, 0);
					
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.accountStore.fetch("userId:[user]", me.glAccountsLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_pur_item_master_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.purMasterUi;
			var offset = 0;

			if (me == undefined)
				return;

			if (me.doResize || (me.windowWidth != $(window).width()) || (me.windowHeight != $(window).height())) {
				var gridHeight = $(me.purchaseOrderGrid.element).parent().height();

				if ($(window).width() < 1000)
					$("#PurchaseOrders").width(1000);
				else
					$("#PurchaseOrders").width($(window).width() - 22);
				
				if (!($("#GridContianer").is(':visible'))) {					
					offset = document.documentElement.clientHeight - 130;
					setTimeout(function() { me.resizeDetailGrid(); }, 100);
				}
				else {
					offset = document.documentElement.clientHeight - gridHeight - 145;
					me.purchaseOrderGrid.setHeight(150);
				}

				$("#iFrameOpenOrders").height(offset);
				$("#iFramePlacedOrders").height(offset);
				
				me.windowWidth = $(window).width();
				me.windowHeight = $(window).height();
				me.doResize = false;
			}
		},
		
		resizeDetailGrid: function() {
			var me = this;
			
			if (me.activeFrameId == 0 && $("iframe")[0].contentWindow.fin != undefined)
				$("iframe")[0].contentWindow.fin.openOrderUi.resize();
			else if (me.activeFrameId == 1 && $("iframe")[1].contentWindow.fin != undefined)
				$("iframe")[1].contentWindow.fin.placedOrderUi.resize();			
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save Purchase Order (Ctrl+S)", 
					title: "Save the current Purchase Order.",
					actionFunction: function() { me.actionSave(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Purchase Order (Ctrl+U)", 
					title: "Undo the changes to Purchase Order being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})
				.addAction({
					id: "EditAction", 
					brief: "View / Edit Purchase Order Info", 
					title: "View / Edit the Purchase Order Shipping Info.",
					actionFunction: function() { me.actionEditItem(); }
				})			

			me.searchType = new ui.ctl.Input.DropDown.Filtered({
				id: "SearchType",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.searchTypeChanged(); }
			});

			me.searchType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.searchType.text.value;

					if (enteredText == "") return;

					if (me.searchType.indexSelected == -1)
						this.setInvalid("Please select correct Search By.");
				});

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});

			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.searchPurchaseOrder(); },
				hasHotState: true
			});
			
			me.anchorNewOrderFromTemplate = new ui.ctl.buttons.Sizeable({
				id: "AnchorNewOrderFromTemplate",
				className: "iiButton",
				text: "<span>PO From Template</span>",
				clickFunction: function() { me.actionNewOrderFromTemplate(); },
				hasHotState: true
			});
			
			me.anchorNewOrder = new ui.ctl.buttons.Sizeable({
				id: "AnchorNewOrder",
				className: "iiButton",
				text: "<span>New Order</span>",
				clickFunction: function() { me.actionNewOrder(); },
				hasHotState: true
			});			
			
			me.anchorPlaceOrder = new ui.ctl.buttons.Sizeable({
				id: "AnchorPlaceOrder",
				className: "iiButton",
				text: "<span>Place Order</span>",
				clickFunction: function() { me.actionPlaceOrder(); },
				hasHotState: true
			});
			
			me.anchorCancelOrder = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelOrder",
				className: "iiButton",
				text: "<span>Cancel Order</span>",
				clickFunction: function() { me.actionCancelOrder(); },
				hasHotState: true
			});
			
			me.vendor = new ui.ctl.Input.DropDown.Filtered({
				id: "Vendor",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.vendorChanged(); },
				required: false
			});
			
			me.vendorName = new ui.ctl.Input.Text({
				id: "VendorName",
				maxLength: 256
			});
			
			me.vendorName.text.readOnly = true;
			
			me.searchItem = new ui.ctl.Input.Text({
		        id: "SearchItem",
				maxLength: 50
		    });
			
			me.account = new ui.ctl.Input.DropDown.Filtered({
				id: "Account",
				formatFunction: function(type) { return type.description; },
				changeFunction: function() { me.accountChanged(); },
				required: false
			});
			
			me.catalog = new ui.ctl.Input.DropDown.Filtered({
				id: "Catalog",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.catalogChanged();},
				required: false
			});
			
			me.searchItemButton = new ui.ctl.buttons.Sizeable({
				id: "SearchItemButton",
				className: "iiButton",
				text: "<span>&nbsp;Search&nbsp;</span>",
				clickFunction: function() { me.loadPurchaseOrderItems(); },
				hasHotState: true
			});
			
			me.loadButton = new ui.ctl.buttons.Sizeable({
				id: "LoadButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.loadPurchaseOrderItems(); },
				hasHotState: true
			});
			
			me.contact = new ui.ctl.Input.Text({
		        id: "Contact",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.contact.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.company = new ui.ctl.Input.Text({
		        id: "Company",
				maxLength: 64
		    });
			
			me.company.text.readOnly = true;
			
			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "Job",
				formatFunction: function(type) { return type.jobNumber + " - " + type.jobTitle; },
				changeFunction: function() { me.modified(); },
				required: false
			});
				
			me.address1 = new ui.ctl.Input.Text({
		        id: "Address1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.address1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.address2 = new ui.ctl.Input.Text({
		        id: "Address2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.city = new ui.ctl.Input.Text({
		        id: "City",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.state = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); },
		        required : false
		    });
			
			me.state.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.zip = new ui.ctl.Input.Text({
		        id: "Zip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.zip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if(me.zip.getValue() == "") 
					return;

				if(ui.cmn.text.validate.postalCode(me.zip.getValue()) == false)
					this.setInvalid("Please enter valid zip code. 99999 or 99999-9999");
			});
			
			me.phone = new ui.ctl.Input.Text({
		        id: "Phone",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.phone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){
					
					var enteredText = me.phone.getValue();
					
					if(enteredText == "") return;
					
					me.phone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phone.text.value;
										
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. (999) 999-9999");
			});
			
			me.fax = new ui.ctl.Input.Text({
		        id: "Fax",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.fax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){
					
					var enteredText = me.fax.getValue();
					
					if(enteredText == "") return;
					
					me.fax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.fax.text.value;
					
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid fax number. (999) 999-9999");
			});
			
			me.template = new ui.ctl.Input.Check({
		        id: "Template",
				changeFunction: function() { me.checkTemplate(); me.modified();}
		    });
			
			me.templateTitle = new ui.ctl.Input.Text({
		        id: "TemplateTitle",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.templateTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if (!me.template.check.checked)
					this.valid = true;
			});
			
			me.anchorItemContinue = new ui.ctl.buttons.Sizeable({
				id: "AnchorItemContinue",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Continue&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionItemContinue(); },
				hasHotState: true
			});
			
			me.anchorItemSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorItemSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionItemSave(); },
				hasHotState: true
			});
			
			me.anchorDelete = new ui.ctl.buttons.Sizeable({
				id: "AnchorDelete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDeleteItem(); },
				hasHotState: true
			});
			
			me.orderItemCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionItemCancel(); },
				hasHotState: true
			});			
		
			me.purchaseOrderGrid = new ui.ctl.Grid({
				id: "PurchaseOrders",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.purchaseOrderGrid.addColumn("houseCodeName", "houseCodeName", "House Code", "House Code", 300);
			me.purchaseOrderGrid.addColumn("orderNumber", "", "Order #", "Order #", 80, function(order) {
				if (order.statusType == 1) {
					var orderNumber = "";
					for (var index = 0; index < order.orderNumber.toString().length; index++)
						orderNumber += "#";
					return orderNumber;
				}
				else
					return order.orderNumber;
            });
			me.purchaseOrderGrid.addColumn("orderDate", "orderDate", "Date", "Order Date", 100, function(orderDate) { return ui.cmn.text.date.format(orderDate, "mm/dd/yyyy"); });
			me.purchaseOrderGrid.addColumn("vendorName", "vendorName", "Vendor", "Vendor", null);
			me.purchaseOrderGrid.addColumn("orderAmount", "orderAmount", "Amount", "Order Amount", 120);
			me.purchaseOrderGrid.addColumn("placedBy", "placedBy", "Placed By", "Placed By", 200);
			me.purchaseOrderGrid.capColumns();
			me.purchaseOrderGrid.setHeight(150);
			
			me.templateGrid = new ui.ctl.Grid({
				id: "TemplateGrid",
				appendToId: "divForm",
				allowAdds: false
			});
			
			me.templateGrid.addColumn("templateTitle", "templateTitle", "Template Title", "Template Title", null);
			me.templateGrid.capColumns();
			
			me.orderItemGrid = new ui.ctl.Grid({
				id: "OrderItemGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 40,
				selectFunction: function( index ) { me.orderItemSelect(index); },
				columnFocusFunction: function() { }
			});
			
			me.quantity = new ui.ctl.Input.Text({
		        id: "Quantity",
		        appendToId: "OrderItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.quantity.getValue();

				if (enteredText == "") return;

				if (me.orderItemGrid.activeRowIndex != -1 && (me.lastSelectedItemRowIndex == me.orderItemGrid.activeRowIndex)) {
					me.quantity.text.select();
					me.lastSelectedItemRowIndex = -1;
				}

				if (!(/^[0-9]+$/.test(enteredText)))
					this.setInvalid("Please enter valid Quantity.");
			});
			
			me.orderItemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function() {
				var index = me.orderItemGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" />";
           });
			me.orderItemGrid.addColumn("catalogTitle", "catalogTitle", "Catalog", "Catalog", 250);			
			me.orderItemGrid.addColumn("number", "number", "Item Number", "Item Number", 150);
			me.orderItemGrid.addColumn("description", "description", "Description", "Item Description", null);
			me.orderItemGrid.addColumn("unit", "unit", "Unit", "Unit", 100);
			me.orderItemGrid.addColumn("price", "price", "Price", "Price", 100, function(price) { return "$" + price; });
			me.orderItemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100, null, me.quantity, "Quantity");
			me.orderItemGrid.capColumns();
			
			me.quantity.active = false;
			me.setTabIndexes();
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
		},		
		
		resizeControls: function() {
			var me = this;
			
			me.searchInput.resizeText();
			me.vendor.resizeText();
			me.searchItem.resizeText();
			me.account.resizeText();
			me.catalog.resizeText();
			me.contact.resizeText();
			me.company.resizeText();
			me.job.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.city.resizeText();
			me.state.resizeText();
			me.resize();
		},
			
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pur.master.HirNode,
				itemConstructorArgs: fin.pur.master.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pur.master.HouseCode,
				itemConstructorArgs: fin.pur.master.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.pur.master.HouseCodeDetail,
				itemConstructorArgs: fin.pur.master.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails	
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.master.HouseCodeJob,
				itemConstructorArgs: fin.pur.master.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.purchaseOrders = [];
			me.purchaseOrderStore = me.cache.register({
				storeId: "purPurchaseOrders",
				itemConstructor: fin.pur.master.PurchaseOrder,
				itemConstructorArgs: fin.pur.master.purchaseOrderArgs,
				injectionArray: me.purchaseOrders
			});
			
			me.purchaseOrderTemplates = [];
			me.purchaseOrderTemplateStore = me.cache.register({
				storeId: "purPurchaseOrderTemplates",
				itemConstructor: fin.pur.master.PurchaseOrder,
				itemConstructorArgs: fin.pur.master.purchaseOrderArgs,
				injectionArray: me.purchaseOrderTemplates
			});			
			
			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.master.Vendor,
				itemConstructorArgs: fin.pur.master.vendorArgs,
				injectionArray: me.vendors	
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.pur.master.Account,
				itemConstructorArgs: fin.pur.master.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.catalogs = [];
			me.catalogStore = me.cache.register({
				storeId: "purCatalogs",
				itemConstructor: fin.pur.master.Catalog,
				itemConstructorArgs: fin.pur.master.catalogArgs,
				injectionArray: me.catalogs	
			});
			
			me.purchaseOrderItems = [];
			me.purchaseOrderItemStore = me.cache.register({
				storeId: "purPurchaseOrderItems",
				itemConstructor: fin.pur.master.PurchaseOrderItem,
				itemConstructorArgs: fin.pur.master.purchaseOrderItemArgs,
				injectionArray: me.purchaseOrderItems	
			});
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pur.master.StateType,
				itemConstructorArgs: fin.pur.master.stateTypeArgs,
				injectionArray: me.stateTypes	
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
		
		showPageLoading: function(status) {
			var me = this;

			me.setStatus(status);
			$("#messageToUser").text(status);
			$("#pageLoading").fadeIn("slow");
		},

		hidePageLoading: function() {
			
			$("#pageLoading").fadeOut("slow");
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
						me.actionSave();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed)
				return false;
		},
		
		setTabIndexes: function() {
			var me = this;

			me.contact.text.tabIndex = 1;
			me.job.text.tabIndex = 2;
			me.company.text.tabIndex = 3;			
			me.address1.text.tabIndex = 4;
			me.address2.text.tabIndex = 5;
			me.city.text.tabIndex = 6;
			me.state.text.tabIndex = 7;
			me.zip.text.tabIndex = 8;
			me.phone.text.tabIndex = 9;
			me.fax.text.tabIndex = 10;
			me.template.check.tabIndex = 11;
			me.templateTitle.text.tabIndex = 12;
			$("#ReportFooterTextArea")[0].tabIndex = 13;
		},			
		
		houseCodesLoaded: function(me, activeId) { 
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			
			$("#container-1").tabs(1);
			$("#fragment-1").show();
			$("#fragment-2").hide();  
			$("#fragment-3").hide();
			$("#TabOpenOrders").parent().addClass("tabs-selected");
			me.houseCodeDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.houseCodeDetailsLoaded, me);
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.loadPurchaseOrders();
			me.resizeControls();
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.lastSelectedRowIndex = -1;
			me.openOrderNeedUpdate = true;
			me.placedOrderNeedUpdate = true;
			me.houseCodeDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.houseCodeDetailsLoaded, me);
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.loadPurchaseOrders();
		},

		searchTypesLoaded: function() {
			var me = this;
			
			me.searchTypes = [];
			me.searchTypes.push(new fin.pur.master.SearchType(1, "Purchase Order #"));
			me.searchTypes.push(new fin.pur.master.SearchType(2, "Vendor #"));
			me.searchTypes.push(new fin.pur.master.SearchType(3, "Vendor Title"));
			me.searchType.setData(me.searchTypes);
		},
		
		searchTypeChanged: function() {
			var me = this;
			
			me.searchInput.setValue("");
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.searchPurchaseOrder();
			}			
		},
		
		searchPurchaseOrder: function() {
			var me = this;
			var statusType = 0;
			var houseCodeId = $("#houseCodeText").val() != "" ? parent.fin.appUI.houseCodeId : 0;
			var searchValue = me.searchInput.getValue();
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			if ($("#houseCodeText").val() == "" && me.searchType.lastBlurValue == "") {
				me.searchType.setInvalid("Please select Search By.");
				return;
			}

			if (me.searchType.lastBlurValue == "Purchase Order #" && (searchValue == "" || !(/^[0-9]+$/.test(searchValue))))
				me.searchInput.setInvalid("Please enter valid Purchase Order #.");
			else if (me.searchType.lastBlurValue == "Vendor #" && (searchValue == "" || !(/^[0-9]+$/.test(searchValue))))
				me.searchInput.setInvalid("Please enter valid Vendor #.");
			else if (me.searchType.lastBlurValue == "Vendor Title" && searchValue.trim() == "")
				me.searchInput.setInvalid("Please enter Search Criteria.");

			if (!me.searchType.validate(true) || !me.searchInput.valid)
				return;

			if (me.activeFrameId == 0)
				statusType = 1;
			else if (me.activeFrameId == 1)
				statusType = 2;
			else if (me.activeFrameId == 2)
				statusType = 3;
				
			if (me.searchType.lastBlurValue == "Purchase Order #")
				statusType = 0;

			me.checkStatus = true;
			me.setLoadCount();
			me.purchaseOrderStore.fetch("userId:[user],"
				+ ",houseCodeId:" + houseCodeId
				+ ",statusType:" + statusType
				+ ",searchType:" + me.searchType.lastBlurValue
				+ ",searchValue:" + searchValue
				, me.purchaseOrdersLoaded
				, me);
		},
		
		loadPurchaseOrders: function() {
			var me = this;
			var statusType = 0;
			
			if (me.activeFrameId == 0)
				statusType = 1;
			else if (me.activeFrameId == 1)
				statusType = 2;
			else if (me.activeFrameId == 2)
				statusType = 3;
			
			me.searchType.reset();
			me.searchInput.setValue("");
			me.resetGrids();
			me.setLoadCount();
			me.purchaseOrderStore.fetch("userId:[user],searchType:,searchValue:,statusType:" + statusType + ",houseCodeId:" + parent.fin.appUI.houseCodeId, me.purchaseOrdersLoaded, me);
		},
		
		purchaseOrdersLoaded: function(me, activeId) {
			var reload = me.reloadGrid;

			if (me.checkStatus && me.purchaseOrders.length == 0) {
				alert("There are no purchase orders matching the given criteria or you do not have enough permission to access it.");	
			    me.resetGrids();				
			}				
				
			me.purchaseOrderGrid.setData(me.purchaseOrders);

			if (me.checkStatus) {
				me.checkStatus = false;			
			
				if (me.purchaseOrders.length > 0) {
					if (parent.fin.appUI.houseCodeId != me.purchaseOrders[0].houseCode) {
						me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.purchaseOrders[0].houseCode, me.houseCodeJobsLoaded, me);
					}						
						
					me.lastSelectedRowIndex = 0;
					me.loadCount--;
					reload = true;
						
					if (me.purchaseOrders[0].statusType == 1) {
						me.activeFrameId = 0;
						me.openOrderNeedUpdate = false;
						$("#container-1").triggerTab(1);						
					}
					else if (me.purchaseOrders[0].statusType == 2) {					
						me.activeFrameId = 1;
						me.placedOrderNeedUpdate = false;
						$("#container-1").triggerTab(2);						
					}
					else if (me.purchaseOrders[0].statusType == 3) {
						me.activeFrameId = 2;
						$("#container-1").triggerTab(3);
					}
				}
			}
			else if (me.reloadGrid) {
				me.reloadGrid = false;

				for (var index = 0; index < me.purchaseOrders.length; index++) {
					if (me.purchaseOrders[index].id == me.purchaseOrderId) {
						me.lastSelectedRowIndex = index;
						break;
					}
				}
			}
			
			if (me.lastSelectedRowIndex >= 0 && me.purchaseOrders.length > 0) {
				me.purchaseOrderGrid.body.select(me.lastSelectedRowIndex);
			}
			
			if (!reload)
				me.checkLoadCount();
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var item = me.purchaseOrderGrid.data[index];
			
			me.openOrderNeedUpdate = true;
			me.placedOrderNeedUpdate = true;
			me.lastSelectedRowIndex = index;
			me.status = "";
			
			if (item == undefined) 
				return;
			
			if (me.purchaseOrderGrid.data[index] != undefined) {
				me.purchaseOrderId = me.purchaseOrderGrid.data[index].id;
				me.showPurchaseOrderDetails();
			}
			else 
				me.purchaseOrderId = 0;
		},
		
		showPurchaseOrderDetails: function() {
			var me = this;
	
			switch(me.activeFrameId) {
				
				case 0:
					$("iframe")[0].src = "/fin/pur/openOrder/usr/markup.htm?orderId=" + me.purchaseOrderId;
					
					me.openOrderNeedUpdate = false;
					break;

				case 1:
					$("iframe")[1].src = "/fin/pur/placedOrder/usr/markup.htm?orderId=" + me.purchaseOrderId;
					
					me.placedOrderNeedUpdate = false;
					break;
				
			}
		},
		
		resetGrids: function() {
			if ($("iframe")[0].contentWindow.fin != undefined)
				$("iframe")[0].contentWindow.fin.openOrderUi.resetGrid();
				
			if ($("iframe")[1].contentWindow.fin != undefined)
				$("iframe")[1].contentWindow.fin.placedOrderUi.resetGrid();

		},
		
		vendorsLoaded: function(me, activeId) {
		
			me.vendor.reset();
			me.vendor.setData(me.vendors);
			$("#popupLoading").hide();
		},
		
		vendorChanged: function() {
			var me = this;
			
			if (me.vendor.indexSelected >= 0)
				me.vendorId = me.vendors[me.vendor.indexSelected].id;
			else
				me.vendorId = 0;
			
			me.accountId = 0;
			me.catalogId = 0;
			me.account.reset();
			me.account.setData([]);
			me.catalog.reset();
			me.catalog.setData([]);
			if (me.orderItemGrid.activeRowIndex != -1)
				me.orderItemGrid.body.deselect(me.orderItemGrid.activeRowIndex, true);
			me.purchaseOrderItemStore.reset();
			me.orderItemGrid.setData([]);
			
			if (me.vendorId > 0) {
				me.account.fetchingData();
				me.catalog.fetchingData();
				me.accountStore.reset();
				me.catalogStore.reset();
				me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.accountsLoaded, me);
				me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
			}
		},

		glAccountsLoaded: function(me, activeId) {

		    for (var index = 0; index < me.accounts.length; index++) {
		        var item = new fin.pur.master.Account(me.accounts[index].id, me.accounts[index].code, me.accounts[index].description);
		        me.glAccounts.push(item);
		    }
		    me.checkLoadCount();
		},
		
		accountsLoaded: function(me, activeId) {
			
			me.account.reset();
			me.account.setData(me.accounts);
		},
		
		accountChanged: function() {
			var me = this;

			if (me.account.indexSelected >= 0)
				me.accountId = me.accounts[me.account.indexSelected].id;
			else
				me.accountId = 0;
				
			if (me.orderItemGrid.activeRowIndex != -1)
				me.orderItemGrid.body.deselect(me.orderItemGrid.activeRowIndex, true);
			me.purchaseOrderItemStore.reset();
			me.orderItemGrid.setData([]);
		},
		
		catalogsLoaded: function(me, activeId) {
			
			me.catalog.reset();
			me.catalog.setData(me.catalogs);
			$("#popupLoading").hide();	
		},
		
		catalogChanged: function() {
			var me = this;
			
			if (me.catalog.indexSelected >= 0)
				me.catalogId = me.catalogs[me.catalog.indexSelected].id;
			else
				me.catalogId = 0;
				
			if (me.orderItemGrid.activeRowIndex != -1)
				me.orderItemGrid.body.deselect(me.orderItemGrid.activeRowIndex, true);
			me.purchaseOrderItemStore.reset();
			me.orderItemGrid.setData([]);
		},
		
		houseCodeJobsLoaded: function(me, activeId) {

			me.job.setData(me.houseCodeJobs);			
		},
	
		loadPurchaseOrderItems: function() {
			var me = this;
			
			if (me.orderItemGrid.activeRowIndex != -1)
				me.orderItemGrid.body.deselect(me.orderItemGrid.activeRowIndex, true);
	
			$("#popupLoading").show();
			me.purchaseOrderItemStore.reset();		
			me.purchaseOrderItemStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId + ",catalogId:" + me.catalogId + ",orderId:" + me.purchaseOrderId + ",accountId:" + me.accountId + ",searchValue:" + me.searchItem.getValue(), me.purchaseOrderItemsLoaded, me);
			me.searchItem.setValue("");
		},
		
		purchaseOrderItemsLoaded: function(me, activeId) {
			
			me.orderItemGrid.setData(me.purchaseOrderItems);			
			$("#popupLoading").hide();
		},
		
		stateTypesLoaded: function(me,activeId) {

			me.stateTypes.unshift(new fin.pur.master.StateType({ id: 0, number: 0, name: "None" }));
			me.state.setData(me.stateTypes);	
			me.checkLoadCount();		
		},
		
		houseCodeDetailsLoaded: function(me, activeId) {		
			
		},
		
		actionNewOrder: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (parent.fin.appUI.houseCodeId == 0) {
				alert('Please select the House Code before adding the new Purchase Order.')
				return true;
			}				
			
			$("#Header").text("New Purchase Order");			
			$("#VendorInfo").show();			
			$("#DropdownVendor").show();
			$("#TextVendor").hide();			
			$("#CategoryInfo").show();
			$("#AnchorItemContinue").show();
			$("#ShippingInfo").hide();
			$("#POTemplates").hide();
			$("#AnchorItemSave").hide();
			$("#AnchorDelete").hide();
			$("#popupLoading").show();
			loadPopup();

			var index = me.orderItemGrid.activeRowIndex;
			if (index >= 0)
				me.orderItemGrid.body.deselect(index, true);
			me.orderItemGrid.setData([]);
			me.orderItemGrid.setHeight($(window).height() - 185);
			me.purchaseOrderId = 0;
			me.vendorId = 0;
			me.status = "NewOrder";
			me.searchItem.setValue("");
			me.searchItem.resizeText();
			me.account.reset();
			me.account.setData([]);
			me.catalog.reset();
			me.catalog.setData([]);
			me.vendor.fetchingData();
			me.vendorStore.reset();
			me.vendorStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.vendorsLoaded, me);
		},
		
		actionNewOrderFromTemplate: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			$("#Header").text("Purchase Order Templates");
			$("#VendorInfo").hide();
			$("#AnchorItemContinue").hide();
			$("#AnchorItemSave").show();
			$("#CategoryInfo").hide();
			$("#ShippingInfo").hide();
			$("#POTemplates").show();
			$("#AnchorDelete").show();						
			$("#popupLoading").show();
			loadPopup();
			me.templateGrid.setHeight($(window).height() - 160);
			$("#houseCodeTemplateText").val(parent.fin.appUI.houseCodeTitle);
			me.purchaseOrderId = 0;
			me.status = "NewOrderFromTemplate";
			me.purchaseOrderTemplateStore.reset();
			me.purchaseOrderTemplateStore.fetch("userId:[user],template:1,sourceHouseCode:" + parent.fin.appUI.houseCodeId + ",destHouseCode:" + parent.fin.appUI.houseCodeId, me.purchaseOrderTemplatesLoaded, me);
		},
		
		actionEditItem: function() {
			var me = this;
			var index = -1;
			var readOnly = false;
			var itemIndex = -1;

			if (!parent.fin.cmn.status.itemValid())
				return;

			index = me.purchaseOrderGrid.activeRowIndex;
			
			if (index == -1)
				return;
		
			$("#AnchorItemContinue").hide();			
			$("#VendorInfo").hide();
			$("#CategoryInfo").hide();
			$("#POTemplates").hide();
			$("#ShippingInfo").show();
			$("#AnchorDelete").hide();
			$("#Header").text("Shipping Information");
			loadPopup();
			
			itemIndex = ii.ajax.util.findIndexById(me.purchaseOrders[index].houseCodeJob.toString(), me.houseCodeJobs);
			if (itemIndex >= 0 && itemIndex != undefined)
				me.job.select(itemIndex, me.job.focused);
			else
				me.job.reset();

			me.company.setValue(me.purchaseOrders[index].houseCodeName);
			me.contact.setValue(me.purchaseOrders[index].contactName);
			me.address1.setValue(me.purchaseOrders[index].address1);
			me.address2.setValue(me.purchaseOrders[index].address2);
			me.city.setValue(me.purchaseOrders[index].city);
			
			itemIndex = ii.ajax.util.findIndexById(me.purchaseOrders[index].stateType.toString(), me.stateTypes);
			if (itemIndex >= 0 && itemIndex != undefined)
				me.state.select(itemIndex, me.state.focused);
	
			me.zip.setValue(me.purchaseOrders[index].zip);
			me.phone.setValue(me.purchaseOrders[index].phone);
			me.fax.setValue(me.purchaseOrders[index].fax);
			me.template.setValue(me.purchaseOrders[index].template.toString());
			me.checkTemplate();
			me.templateTitle.setValue(me.purchaseOrders[index].templateTitle);			
			me.$reportFooter.value = me.purchaseOrders[index].reportFooter;
			
			if (me.activeFrameId == 0) {
				me.status = "EditOrderInfo";
				$("#AnchorItemSave").show();
			}							
			else if (me.activeFrameId == 1 || me.activeFrameId == 2) {
				readOnly = true;				
				$("#AnchorItemSave").hide();
			}

			me.contact.text.readOnly = readOnly;
			me.job.text.readOnly = readOnly;
			me.address1.text.readOnly = readOnly;
			me.address2.text.readOnly = readOnly;
			me.city.text.readOnly = readOnly;
			me.state.text.readOnly = readOnly;
			me.zip.text.readOnly = readOnly;
			me.phone.text.readOnly = readOnly;
			me.fax.text.readOnly = readOnly;
			me.template.check.disabled = readOnly;
			me.templateTitle.text.readOnly = readOnly;
			me.$reportFooter.readOnly = readOnly;
	
			if (readOnly) {				
				$("#JobAction").removeClass("iiInputAction");
				$("#StateAction").removeClass("iiInputAction");
			}
			else {				
				$("#JobAction").addClass("iiInputAction");
				$("#StateAction").addClass("iiInputAction");
				me.job.resizeText();
				me.state.resizeText();
			}
		},
		
		checkTemplate: function() {
			var me = this;
		
			if (me.template.check.checked) {
				$("#LabelTemplateTitle").show();
				$("#TemplateTitle").show();
				me.templateTitle.resizeText();
			}
				
			else {
				$("#LabelTemplateTitle").hide();
				$("#TemplateTitle").hide();
				me.templateTitle.setValue("");
			}	
		},
		
		bindRow: function() {
			var me = this;			
			var index = me.purchaseOrderGrid.activeRowIndex;
			
			me.purchaseOrders[index].houseCodeJobId = me.job.indexSelected == -1 ? 0 : me.houseCodeJobs[me.job.indexSelected].id;
			me.purchaseOrders[index].contactName = me.contact.getValue();
			me.purchaseOrders[index].address1 = me.address1.getValue();
			me.purchaseOrders[index].address2 = me.address2.getValue();
			me.purchaseOrders[index].city = me.city.getValue();
			me.purchaseOrders[index].stateType = me.stateTypes[me.state.indexSelected].id;
			me.purchaseOrders[index].zip = me.zip.getValue();
			me.purchaseOrders[index].phone = fin.cmn.text.mask.phone(me.phone.getValue(), true);
			me.purchaseOrders[index].fax = fin.cmn.text.mask.phone(me.fax.getValue(), true);
			me.purchaseOrders[index].template = me.template.check.checked;
			me.purchaseOrders[index].templateTitle = me.templateTitle.getValue();	
			me.purchaseOrders[index].reportFooter = me.$reportFooter.value;
			
			me.purchaseOrderGrid.body.renderRow(index, index);
		},
		
		bindRowAfterTemplateDelete: function(id) {
			var me = this;
			var index = 0;
			
			for(index = 0; index < me.purchaseOrders.length; index++) {
				if (me.purchaseOrders[index].id == id) {
					me.purchaseOrders[index].template = false;
					me.purchaseOrders[index].templateTitle = "";
					me.purchaseOrderGrid.body.renderRow(index, index);
					break;
				}					
			}			
		},
		
		houseCodeTemplateChanged: function() { 
			var args = ii.args(arguments,{});			
			var me = this;	
			
			$("#popupLoading").show();
			me.purchaseOrderTemplateStore.fetch("userId:[user],template:1,sourceHouseCode:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",destHouseCode:" + parent.fin.appUI.houseCodeId, me.purchaseOrderTemplatesLoaded, me);
		},
		
		purchaseOrderTemplatesLoaded: function(me, activeId) {
			
			me.templateGrid.setData(me.purchaseOrderTemplates);
			me.templateGrid.resize();
			$("#popupLoading").hide();
		},

		printPurchaseOrder: function (id) {
		    var me = this;

		    window.open(location.protocol + '//' + location.hostname + '/reports/po.aspx?purchaseorder=' + id, 'PrintPO', 'type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
		},
				
		actionItemContinue: function() {
			var me = this;
			var index = 0;
			
			if (me.vendorId == 0) {
				alert('Please select the Vendor.')
				return true;
			}

			me.orderItemGrid.body.deselectAll();
			index = me.orderItemGrid.activeRowIndex;
			if (index >= 0) {
				if ($("#selectInputCheck" + index)[0].checked && !(me.quantity.validate(true))) {
					alert("In order to continue, the errors on the page must be corrected.");
					return;
				}
				else
					me.orderItemGrid.body.deselect(index, true);
			}			
			
			$("#AnchorItemContinue").hide();
			$("#AnchorItemSave").show();
			$("#VendorInfo").hide();
			$("#CategoryInfo").hide();
			$("#ShippingInfo").show();
			$("#Header").text("Shipping Information");

			me.validator.reset();
			me.contact.setValue("");
			me.company.setValue(parent.fin.appUI.houseCodeTitle);
			me.address1.setValue(me.houseCodeDetails[0].shippingAddress1);
			me.address2.setValue(me.houseCodeDetails[0].shippingAddress2);
			me.city.setValue(me.houseCodeDetails[0].shippingCity);
			
			index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].shippingState.toString(), me.stateTypes);
			if (index >= 0 && index != undefined)
				me.state.select(index, me.state.focused);
	
			me.zip.setValue(me.houseCodeDetails[0].shippingZip);
			me.phone.setValue("");
			me.fax.setValue("");
			me.template.setValue("false");
			me.templateTitle.setValue("");
			me.$reportFooter.value = "";			
			me.checkTemplate();
			
			me.contact.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.city.resizeText();
			me.state.resizeText();
			me.zip.resizeText();
			me.phone.resizeText();
			me.fax.resizeText();
			me.templateTitle.resizeText();			
		},
		
		actionItemCancel: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			disablePopup();
			if (me.purchaseOrderGrid.activeRowIndex >= 0)
				me.purchaseOrderId = me.purchaseOrderGrid.data[me.purchaseOrderGrid.activeRowIndex].id;

			if (me.status == "AddItems") {
				var index = me.orderItemGrid.activeRowIndex;
				if (index >= 0)
					me.orderItemGrid.body.deselect(index, true);
				$("iframe")[0].contentWindow.fin.openOrderUi.rowBeingEdited = false;
			}
				
			me.status = "";
			me.setStatus("Loaded");
		},
		
		actionDeleteItem: function() {
			var me = this;
			
			if (me.templateGrid.activeRowIndex >= 0) {
				me.status = "DeleteTemplate";
				$("#popupMessageToUser").text("Saving");
				$("#popupLoading").show();
				me.actionSaveItem();
			}			
		},
		
		orderItemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;

			me.lastSelectedItemRowIndex = me.orderItemGrid.activeRowIndex;
			me.quantity.text.focus();

			$("#QuantityText").keypress(function (e) {
				if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
					return false;
			});
		},
		
		actionAddItems: function() {
			var me = this;

			if (me.purchaseOrderGrid.activeRowIndex == -1)
				return true;

			$("#Header").text("Add Items");
			$("#VendorInfo").show();
			$("#DropdownVendor").hide();
			$("#TextVendor").show();
			$("#AnchorItemContinue").hide();
			$("#AnchorDelete").hide();
			$("#AnchorItemSave").show();
			$("#CategoryInfo").show();
			$("#ShippingInfo").hide();
			$("#POTemplates").hide();
			$("#popupLoading").show();
			loadPopup();
			
			me.vendorId = me.purchaseOrderGrid.data[me.purchaseOrderGrid.activeRowIndex].vendorId;
			me.status = "AddItems";
			var index = me.orderItemGrid.activeRowIndex;
			if (index >= 0)
				me.orderItemGrid.body.deselect(index, true);
			me.orderItemGrid.setData([]);
			me.orderItemGrid.setHeight($(window).height() - 185);			
			me.purchaseOrderItemStore.reset();
			me.vendorName.resizeText();	
			me.searchItem.resizeText();
			me.vendorName.setValue(me.purchaseOrderGrid.data[me.purchaseOrderGrid.activeRowIndex].vendorName);
			me.searchItem.setValue("");
			me.account.fetchingData();
			me.catalog.fetchingData();
			me.accountStore.reset();
			me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.accountsLoaded, me);
			me.catalogStore.reset();
			me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
		},
		
		actionSave: function() {
			var me = this;
			
			if (me.activeFrameId == 0)
				me.actionItemSave();
			else
				me.actionSaveItem();
		},
		
		actionItemSave: function() {
			var me = this;
			
			if (me.status == "NewOrder" || me.status == "EditOrderInfo") {
				me.validator.forceBlur();
				
				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			}
			else if (me.status == "NewOrderFromTemplate" && me.templateGrid.activeRowIndex == -1) 
				return false;
			else if (me.status == "AddItems") {
				me.orderItemGrid.body.deselectAll();
				var index = me.orderItemGrid.activeRowIndex;
				if (index >= 0) {
					if ($("#selectInputCheck" + index)[0].checked && !(me.quantity.validate(true))) {
						alert("In order to save, the errors on the page must be corrected.");
						return;
					}
					else
						me.orderItemGrid.body.deselect(index, true);
				}	
			}
			
			disablePopup();
			me.actionSaveItem();
		},
		
		actionCancelOrder: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.purchaseOrderGrid.activeRowIndex >= 0) {
				if (confirm("Please click 'OK' to cancel this order.")) {
					me.status = "CancelOrder";
					me.transactionStatusType = 6;
					me.actionSaveItem();
				}
			}
		},
		
		actionPlaceOrder: function() {
			var me = this;
			var message = "";
			var sendMethod = "0";
			var rowIndex = me.purchaseOrderGrid.activeRowIndex;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (rowIndex >= 0) {
				var purchaseOrderDetails = $("iframe")[0].contentWindow.fin.openOrderUi.purchaseOrderDetails;
				
				for (var index = 0; index < purchaseOrderDetails.length; index++) {
					if (purchaseOrderDetails[index].quantityOverride <= 0) {
						alert("You cannot place a Purchase Order without entering a quantity.");
						return;
					}					
				}
				
				sendMethod = me.purchaseOrderGrid.data[rowIndex].sendMethod;
				
				if (sendMethod == "1") {
					var faxNumber = me.purchaseOrderGrid.data[rowIndex].faxNumber;
					message = "You will then be directed to print this Purchase Order in which you will fax to " + faxNumber + ".";
				}
				else if (sendMethod == "2") {
					var vendorName = me.purchaseOrderGrid.data[rowIndex].vendorName;
					var vendorEmail = me.purchaseOrderGrid.data[rowIndex].vendorEmail;
					message = "The order will then be automatically e-mailed to " + vendorName + " at " + vendorEmail + ".";
				}
				
				if (confirm("Please click 'OK' to place this order." + '\n\n' + message)) {
					me.status = "PlaceOrder";
					me.transactionStatusType = 2;
					me.actionSaveItem();
					me.placedOrderNeedUpdate = true;
				}
			}
		},		

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
				
			if (!parent.fin.cmn.status.itemValid())
				return;
					
			if (me.activeFrameId == 0 && $("iframe")[0].contentWindow.fin != undefined)
				$("iframe")[0].contentWindow.fin.openOrderUi.actionUndoItem();
			else if (me.activeFrameId == 1 && $("iframe")[1].contentWindow.fin != undefined)
				$("iframe")[1].contentWindow.fin.placedOrderUi.actionUndoItem();
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.purchaseOrdersReadOnly) return;
			
			var item = [];
			
			if (me.activeFrameId == 0) {
				if (me.status != "") {		

					var xml = me.saveXmlBuildPurchaseOrder(item);
					
					if (xml == "") {
						if (me.status == "AddItems") {
							$("iframe")[0].contentWindow.fin.openOrderUi.rowBeingEdited = false;
							me.status = "";
						}
							
						return;
					}

					if (me.status != "DeleteTemplate") {
						me.setStatus("Saving");
						
						$("#messageToUser").text("Saving");
						$("#pageLoading").fadeIn("slow");
					}	
			
					// Send the object back to the server as a transaction
					me.transactionMonitor.commit({
						transactionType: "itemUpdate",
						transactionXml: xml,
						responseFunction: me.saveResponse,
						referenceData: {me: me, item: item}
					});
																
					return true;
				}
				else if ($("iframe")[0].contentWindow.fin != undefined)
					$("iframe")[0].contentWindow.fin.openOrderUi.actionSaveItem();
			}				
			else if (me.activeFrameId == 1 && $("iframe")[1].contentWindow.fin != undefined) 
				$("iframe")[1].contentWindow.fin.placedOrderUi.actionSaveItem();
		},
		
		saveXmlBuildPurchaseOrder: function() {
			var args = ii.args(arguments,{
				item: {type: [fin.pur.master.PurchaseOrder]}
			});			
			var me = this;
			var xml = "";			
			var rowIndex = me.purchaseOrderGrid.activeRowIndex;
					
			if (((me.status == "PlaceOrder") || (me.status == "CancelOrder")) && (rowIndex >= 0)) {
				xml += '<purPurchaseOrderStatus';
				xml += ' id="' + (me.purchaseOrderGrid.data[rowIndex].id) + '"';
				xml += ' transactionStatusType="' + me.transactionStatusType + '"';				
				xml += '/>';
			}
			else if (me.status == "NewOrder" || me.status == "EditOrderInfo" || me.status == "AddItems") {
				if (me.status == "NewOrder" || me.status == "EditOrderInfo") {
					xml += '<purPurchaseOrder';
					xml += ' id="' + me.purchaseOrderId + '"';
					
					if (me.status == "NewOrder") {
						xml += ' vendorId="' + me.vendorId + '"';
						xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
					}
					else {
						xml += ' vendorId="' + me.purchaseOrderGrid.data[rowIndex].vendorId + '"';
						xml += ' houseCodeId="' + me.purchaseOrderGrid.data[rowIndex].houseCode + '"';
					}
					
					xml += ' houseCodeJobId="' + (me.job.indexSelected == -1 ? 0 : me.houseCodeJobs[me.job.indexSelected].id) + '"';
					xml += ' contact="' + ui.cmn.text.xml.encode(me.contact.getValue()) + '"';
					xml += ' address1="' + ui.cmn.text.xml.encode(me.address1.getValue()) + '"';
					xml += ' address2="' + ui.cmn.text.xml.encode(me.address2.getValue()) + '"';
					xml += ' city="' + ui.cmn.text.xml.encode(me.city.getValue()) + '"';
					xml += ' stateType="' + me.stateTypes[me.state.indexSelected].id + '"';
					xml += ' zip="' + me.zip.getValue() + '"';
					xml += ' phone="' + fin.cmn.text.mask.phone(me.phone.getValue(), true) + '"';
					xml += ' fax="' + fin.cmn.text.mask.phone(me.fax.getValue(), true) + '"';
					xml += ' template="' + me.template.check.checked + '"';
					xml += ' templateTitle="' + ui.cmn.text.xml.encode(me.templateTitle.getValue()) + '"';					
					xml += ' reportFooter="' + ui.cmn.text.xml.encode(me.$reportFooter.value) + '"';					
					xml += '/>';
				}
				
				if (me.status == "NewOrder" || me.status == "AddItems") {
					var houseCodeJobId = 0;
					
					if (me.status == "NewOrder")
						houseCodeJobId = me.job.indexSelected == -1 ? 0 : me.houseCodeJobs[me.job.indexSelected].id;
					else
						houseCodeJobId = me.purchaseOrderGrid.data[rowIndex].houseCodeJob;
					
					for (var index = 0; index < me.purchaseOrderItems.length; index++) {			
						if ($("#selectInputCheck" + index)[0].checked) {
							xml += '<purPurchaseOrderDetail';
							xml += ' id="0"';
							xml += ' purchaseOrderId="' + me.purchaseOrderId + '"';
							xml += ' catalogItemId="' + me.purchaseOrderItems[index].id + '"';
							xml += ' houseCodeJobId="' + houseCodeJobId + '"';
							xml += ' price="' + parseFloat(me.purchaseOrderItems[index].price) + '"';
							xml += ' quantity="' + me.purchaseOrderItems[index].quantity + '"';
							xml += ' quantityReceived="0"';
							xml += '/>';
						}
					}					
				}				
			}
			else if (me.status == "NewOrderFromTemplate") {
				xml += '<purPurchaseOrderFromTemplate';
				xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
				xml += ' id="' + me.templateGrid.data[me.templateGrid.activeRowIndex].id + '"';
				xml += '/>';
			}
			else if (me.status == "DeleteTemplate") {
				xml += '<purPurchaseOrderTemplateDelete';
				xml += ' id="' + me.templateGrid.data[me.templateGrid.activeRowIndex].id + '"';
				xml += '/>';
			}

			return xml;
		},
		
		sendEmailNotification: function() {
			var me = this;
			var item = [];
			var xml = "";			
			var sendMethodType = "0";
			var vendorEmailId = "";
			var rowIndex = me.purchaseOrderGrid.activeRowIndex;

			if (rowIndex >= 0) {

				sendMethodType = me.purchaseOrderGrid.data[rowIndex].sendMethod;

				if (sendMethodType == "1") {
					me.printPurchaseOrder(me.purchaseOrderGrid.data[rowIndex].id);
				}						

				xml = '<purPurchaseOrderEmailNotification';
				xml += ' id="' + me.purchaseOrderGrid.data[rowIndex].id + '"';
				xml += ' houseCodeName="' + ui.cmn.text.xml.encode(me.purchaseOrderGrid.data[rowIndex].houseCodeName) + '"';
				xml += ' year="' + me.purchaseOrderGrid.data[rowIndex].year + '"';
				xml += ' period="' + me.purchaseOrderGrid.data[rowIndex].period + '"';
				xml += ' week="' + me.purchaseOrderGrid.data[rowIndex].week + '"';
				xml += ' orderNumber="' + me.purchaseOrderGrid.data[rowIndex].orderNumber + '"';
				xml += ' vendorEmailId="' + me.purchaseOrderGrid.data[rowIndex].vendorEmail + '"';
				xml += ' managerEmailId="' + me.houseCodeDetails[0].managerEmail + '"';
				xml += ' sendMethodType="' + sendMethodType + '"';
				xml += '/>';

				// Send the object back to the server as a transaction
				me.transactionMonitor.commit({
					transactionType: "itemUpdate",
					transactionXml: xml,
					responseFunction: me.emailNotificationResponse,
					referenceData: {me: me, item: item}
				});

				return true;		
			}
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
			var status = $(args.xmlNode).attr("status");
			var hidePageLoading = true;

			if (status == "success") {
				me.modified(false);
				if (me.status == "PlaceOrder" || me.status == "CancelOrder") {
					if (me.status == "PlaceOrder") {
						hidePageLoading = false;
						me.sendEmailNotification();
					}
					me.purchaseOrderId = 0;
					me.lastSelectedRowIndex = -1;					
					$("iframe")[0].contentWindow.fin.openOrderUi.resetGrid();
					me.purchaseOrders.splice(me.purchaseOrderGrid.activeRowIndex, 1);
					me.purchaseOrderGrid.setData(me.purchaseOrders);
				}
				else if (me.status == "NewOrder" || me.status == "NewOrderFromTemplate") {
					$(args.xmlNode).find("*").each(function() {
						switch (this.tagName) {
	
							case "purPurchaseOrder":
								me.purchaseOrderId = parseInt($(this).attr("id"), 10)
								//me.editColumn = true;
								me.reloadGrid = true;
								
								break;
						}
					});
				}
				else if (me.status == "EditOrderInfo")
					me.bindRow();
				else if (me.status == "AddItems") {
					//me.editColumn = true;
					hidePageLoading = false;
					me.itemSelect(me.lastSelectedRowIndex);
				}
				else if (me.status == "DeleteTemplate") {
					me.bindRowAfterTemplateDelete(me.templateGrid.data[me.templateGrid.activeRowIndex].id);
					me.purchaseOrderTemplates.splice(me.templateGrid.activeRowIndex, 1);
					me.templateGrid.setData(me.purchaseOrderTemplates);
					$("#popupMessageToUser").text("Loading");
					$("#popupLoading").hide();
				}

				if (me.status == "DeleteTemplate")
					me.status = "NewOrderFromTemplate";
				else
					me.status = "";

				if (me.reloadGrid) {
					me.purchaseOrderStore.reset();	
					me.purchaseOrderStore.fetch("userId:[user],searchType:,searchValue:,statusType:1,houseCodeId:" + parent.fin.appUI.houseCodeId, me.purchaseOrdersLoaded, me);
				}
				else if (hidePageLoading)
					$("#pageLoading").fadeOut("slow");
					
				me.setStatus("Saved");
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while updating Purchase Order details: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		},

		emailNotificationResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});

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
	var popupWidth = windowWidth - 40;
	var popupHeight = windowHeight - 40;	

	$("#popupContact, #popupLoading").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
		
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.purMasterUi = new fin.pur.master.UserInterface();
	fin.purMasterUi.resize();
	fin.houseCodeSearchUi = fin.purMasterUi;
}
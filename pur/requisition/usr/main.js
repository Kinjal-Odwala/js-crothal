ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.requisition.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

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
    Name: "fin.pur.poRequisition.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
        init: function () {
			var args = ii.args(arguments, {});
			var me = this;			
				
			poRequisitionId = 0;
			me.vendorId = 0;
			me.accountId = 0;
			me.catalogId = 0;
			me.lastSelectedRowIndex = -1;		
			me.status = "";
			me.checkStatus = false;
			me.reloadGrid = false;
			me.users = [];
			me.wizardCount = 0;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
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
			me.setStatus("Loading");
			me.modified(false);

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
		
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
			
			me.vendor.text.readOnly = true;
			$("input[name='RequisitionType']").change(function() { me.modified(); });
			$("input[name='Urgency']").change(function() { me.modified(); });
			$("input[name='LifeSpan']").change(function() { me.modified(); });
        },
		
		authorizationProcess: function fin_pur_poRequisition_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
					
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.purchaseOrdersReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

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
				me.loadCount = 3;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				
				if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
					me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
				else
					me.houseCodesLoaded(me, 0);
					
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
				me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);				
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_pur_poRequisition_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.pur.poRequisitionUi;

			if (me == undefined)
				return;
				
			//TO DO: Set the grid height
			fin.pur.poRequisitionUi.requisitionGrid.setHeight($(window).height() - 135);
			fin.pur.poRequisitionUi.itemGrid.setHeight($(window).height() - 165);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save PO Requisition (Ctrl+S)", 
					title: "Save the current PO Requisition.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to PO Requisition (Ctrl+U)", 
					title: "Undo the changes to PO Requisition being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})
				.addAction({
					id: "EditAction", 
					brief: "View / Edit PO Requisition Info", 
					title: "View / Edit the PO Requisition Info.",
					actionFunction: function() { me.actionEditItem(); }
				})			
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});
			
			me.anchorEdit = new ui.ctl.buttons.Sizeable({
				id: "AnchorEdit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Edit&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionEditItem(); },
				hasHotState: true
			});
			
			me.anchorNext = new ui.ctl.buttons.Sizeable({
				id: "AnchorNext",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNextItem(); },
				hasHotState: true
			});
			
			me.anchorBack = new ui.ctl.buttons.Sizeable({
				id: "AnchorBack",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Back&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBackItem(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.requisitionGrid = new ui.ctl.Grid({
				id: "RequisitionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.requisitionGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 150);
			me.requisitionGrid.addColumn("requestorEmail", "requestorEmail", "Requestor Email", "Requestor Email", 150);		
			me.requisitionGrid.addColumn("requestedDate ", "requestedDate", "Requested Date", "Requested Date", 150);
			me.requisitionGrid.addColumn("deliveryDate", "deliveryDate", "Delivery Date", "Delivery Date", 150);
			me.requisitionGrid.addColumn("reasonForRequest", "reasonForRequest", "Reason For Request", "Reason For Request", null);
			me.requisitionGrid.capColumns();
			//me.requisitionGrid.setHeight(341);
			
			me.requestorName = new ui.ctl.Input.Text({
		        id: "RequestorName",
				maxLength: 150,
				changeFunction: function() { me.modified(); }
		    });
			
			me.requestorEmail = new ui.ctl.Input.Text({
		        id: "RequestorEmail",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.requestorEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.requestorEmail.getValue();
					
					if (enteredText == "") return;
					
					if (!(ui.cmn.text.validate.emailAddress(enteredText)))
						this.setInvalid("Please enter valid Requestor Email.");
			});
			
			me.requestedDate = new ui.ctl.Input.Date({
		        id: "RequestedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.requestedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.requestedDate.text.value;
					
					if (enteredText == "") 
						return;
						
					me.modified();
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.deliveryDate = new ui.ctl.Input.Date({
		        id: "DeliveryDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.deliveryDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.deliveryDate.text.value;
					
					if (enteredText == "") 
						return;

					me.modified();
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.vendorName = new ui.ctl.Input.Text({
		        id: "VendorName",
				maxLength: 256,
				changeFunction: function() { me.vendorCheck(); me.modified(); }
		    });
			
			me.vendorName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.vendorAddress1 = new ui.ctl.Input.Text({
		        id: "VendorAddress1",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorAddress1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.vendorAddress2 = new ui.ctl.Input.Text({
		        id: "VendorAddress2",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorCity = new ui.ctl.Input.Text({
		        id: "VendorCity",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.vendorState = new ui.ctl.Input.DropDown.Filtered({
		        id: "VendorState",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.vendorState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.vendorZip = new ui.ctl.Input.Text({
		        id: "VendorZip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorZip.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.vendorZip.getValue();
					
					if(enteredText == '') return;

					if(ui.cmn.text.validate.postalCode(enteredText) == false)
						this.setInvalid("Please enter valid Zip. Example: 99999 or 99999-9999.");
				});
				
			me.vendorContactName = new ui.ctl.Input.Text({
		        id: "VendorContactName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorContactName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.vendorPhone = new ui.ctl.Input.Text({
		        id: "VendorPhone",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.vendorPhone.getValue();
					
					if(enteredText == '') return;

					me.vendorPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.vendorPhone.text.value;
										
					if(enteredText.length < 14)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
				
			me.vendorEmail = new ui.ctl.Input.Text({
		        id: "VendorEmail",
				maxLength: 200,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.vendorEmail.getValue();
					
					if (enteredText == "") return;
					
					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
				});
				
			me.reasonForRequest = new ui.ctl.Input.Text({
		        id: "ReasonForRequest",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendor = new ui.ctl.Input.Text({
				id: "Vendor",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.searchItem = new ui.ctl.Input.Text({
				id: "SearchItem",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});
			
			me.category = new ui.ctl.Input.DropDown.Filtered({
				id: "Category",
				formatFunction: function(type) { return type.description; },
				changeFunction: function() { me.categoryChanged(); },				
				required: false
			});
			
			me.catalog = new ui.ctl.Input.DropDown.Filtered({
				id: "Catalog",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.catalogChanged();},
				required: false
			});
			
			me.AnchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;Search&nbsp;</span>",
				clickFunction: function() { me.loadPOItems(); },
				hasHotState: true
			});
			
			me.itemGrid = new ui.ctl.Grid({
				id: "ItemGrid",
				allowAdds: true,
				createNewFunction: fin.pur.poRequisition.PORequisitionDetail,
				preDeactivateFunction: function( ) {
					var index = me.itemGrid.data.length - 1;
					me.itemGrid.body.renderRow(index, index); 
				}
				//deselectFunction: function() { alert("deselect"); }			
			});
			
			me.itemNumber = new ui.ctl.Input.Text({
		        id: "ItemNumber",
		        maxLength: 255,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.itemDescription = new ui.ctl.Input.Text({
		        id: "ItemDescription",
		        maxLength: 256,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemDescription.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.account = new ui.ctl.Input.DropDown.Filtered({
		        id: "Account",
				appendToId: "ItemGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.account.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.account.indexSelected == -1)
						this.setInvalid("Please select the correct Account No.");
				});
				
			me.price = new ui.ctl.Input.Text({
		        id: "Price",
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
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
		        maxLength: 11,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.uom = new ui.ctl.Input.Text({
		        id: "Uom",
		        maxLength: 255,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.uom.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.manufactured = new ui.ctl.Input.Text({
		        id: "Manufactured",
		        maxLength: 11,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.extendedPrice = new ui.ctl.Input.Text({
		        id: "ExtendedPrice",
		        maxLength: 11,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function() {				
				var index = me.itemGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" />";
            });
			me.itemGrid.addColumn("number", "number", "Item Number", "Item Number", 100, null, me.itemNumber);
			me.itemGrid.addColumn("description", "description", "Item Description", "Item Description", null, null, me.itemDescription);
			me.itemGrid.addColumn("account", "account", "GL Account No", "GL Account No", 120, function( account ) { return account.name; }, me.account);
			me.itemGrid.addColumn("unit", "unit", "UOM", "UOM", 100, null, me.uom);
			me.itemGrid.addColumn("manufactured", "manufactured", "Manufactured", "Manufactured", 120, null, me.manufactured);
			me.itemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100, null, me.quantity);
			me.itemGrid.addColumn("price", "price", "Price", "Price", 100, null, me.price);
//			me.itemGrid.addColumn("price", "", "Price", "Price", "", function(data) {
//				var index = me.itemGrid.rows.length - 1;
//				
//            	return "<div><center><input type=\"text\" name=\"price" + index + "\" id=\"price" + index + "\" class=\"iiInputText\"" + "/></center><div>";
//				
//            });
//			me.itemGrid.addColumn("total", "", "Total", "Total", "", function(data) {
//				var index = me.itemGrid.rows.length - 1;
//				if (me.itemGrid.activeRowIndex != -1)
//					index = me.renderRowIndex;
//				return "<center><input type=\"text\" name=\"total" + index + "\" id=\"total" + index + "\" class=\"iiInputText\"" + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" onchange=\"fin.adhUi.modified(true);\" /></center>";
//            });			
			me.itemGrid.capColumns();
			//me.itemGrid.setHeight(341);
			
			me.company = new ui.ctl.Input.Text({
		        id: "Company",
				maxLength: 64
		    });
			
			me.company.text.readOnly = true;
			
			me.shippingJob = new ui.ctl.Input.DropDown.Filtered({
				id: "ShippingJob",
				formatFunction: function(type) { return type.jobNumber + " - " + type.jobTitle; },
				changeFunction: function() { me.modified(); },
				required: false
			});
			
			me.shippingAddress1 = new ui.ctl.Input.Text({
		        id: "ShippingAddress1",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingAddress1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.shippingAddress2 = new ui.ctl.Input.Text({
		        id: "ShippingAddress2",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingCity = new ui.ctl.Input.Text({
		        id: "ShippingCity",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingCity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.shippingState = new ui.ctl.Input.DropDown.Filtered({
		        id: "ShippingState",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); },
		        required : false
		    });
			
			me.shippingState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.shippingState.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.shippingZip = new ui.ctl.Input.Text({
		        id: "ShippingZip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingZip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if(me.shippingZip.getValue() == "") 
					return;

				if(ui.cmn.text.validate.postalCode(me.shippingZip.getValue()) == false)
					this.setInvalid("Please enter valid zip code. 99999 or 99999-9999");
			});
			
			me.shippingPhone = new ui.ctl.Input.Text({
		        id: "ShippingPhone",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){
					
					var enteredText = me.shippingPhone.getValue();
					
					if(enteredText == "") return;
					
					me.shippingPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.shippingPhone.text.value;
										
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. (999) 999-9999");
			});
			
			me.shippingFax = new ui.ctl.Input.Text({
		        id: "ShippingFax",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingFax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){
					
					var enteredText = me.shippingFax.getValue();
					
					if(enteredText == "") return;
					
					me.shippingFax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.shippingFax.text.value;
					
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid fax number. (999) 999-9999");
			});
					
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#SearchInputText").keypress(function (e) {
				if( e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
					return false;
			});
			
			me.setTabIndexes();
		},		

		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pur.poRequisition.HouseCode,
				itemConstructorArgs: fin.pur.poRequisition.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.pur.poRequisition.HouseCodeDetail,
				itemConstructorArgs: fin.pur.poRequisition.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails	
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.poRequisition.HouseCodeJob,
				itemConstructorArgs: fin.pur.poRequisition.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pur.poRequisition.StateType,
				itemConstructorArgs: fin.pur.poRequisition.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.pur.poRequisition.Account,
				itemConstructorArgs: fin.pur.poRequisition.accountArgs,
				injectionArray: me.accounts					
			});
			
			me.persons = [];
			me.personStore = me.cache.register({ 
				storeId: "persons",
				itemConstructor: fin.pur.poRequisition.Person,
				itemConstructorArgs: fin.pur.poRequisition.personArgs,
				injectionArray: me.persons	
			});
			
			me.poRequisitions = [];
			me.poRequisitionStore = me.cache.register({
				storeId: "purPORequisitions",
				itemConstructor: fin.pur.poRequisition.PORequisition,
				itemConstructorArgs: fin.pur.poRequisition.poRequisitionArgs,
				injectionArray: me.poRequisitions
			});
			
			me.poRequisitionDetails = [];
			me.poRequisitionDetailStore = me.cache.register({
				storeId: "purPurchaseOrderItems",
				itemConstructor: fin.pur.poRequisition.PORequisitionDetail,
				itemConstructorArgs: fin.pur.poRequisition.poRequisitionDetailArgs,
				injectionArray: me.poRequisitionDetails,
				lookupSpec: { account: me.accounts }	
			});
			
			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.poRequisition.Vendor,
				itemConstructorArgs: fin.pur.poRequisition.vendorArgs,
				injectionArray: me.vendors	
			});
			
			me.catalogs = [];
			me.catalogStore = me.cache.register({
				storeId: "purCatalogs",
				itemConstructor: fin.pur.poRequisition.Catalog,
				itemConstructorArgs: fin.pur.poRequisition.catalogArgs,
				injectionArray: me.catalogs	
			});
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

		setTabIndexes: function() {
			var me = this;

		},
		
		resizeControls: function() {
			var me = this;
			
			me.requestorName.resizeText();
			me.requestorEmail.resizeText();
			me.requestedDate.resizeText();
			me.deliveryDate.resizeText();
			me.vendorName.resizeText();
			me.vendorAddress1.resizeText();
			me.vendorAddress2.resizeText();
			me.vendorCity.resizeText();
			me.vendorZip.resizeText();
			me.vendorContactName.resizeText();
			me.vendorPhone.resizeText();
			me.vendorEmail.resizeText();
			me.reasonForRequest.resizeText();
			me.vendor.resizeText();
			me.searchItem.resizeText();
			me.shippingAddress1.resizeText();
			me.shippingAddress2.resizeText();
			me.shippingCity.resizeText();
			me.shippingState.resizeText();
			me.shippingZip.resizeText();
			me.shippingPhone.resizeText();
			me.shippingFax.resizeText();
			me.resize();
		},
		
		currentDate: function() {
			var currentTime = new Date();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			
			return month + "/" + day + "/" + year;
		},
		
		accountsLoaded: function(me,activeId) {
			me.glAccounts = [];			
			
			me.glAccounts = me.accounts.slice();
			me.account.setData(me.glAccounts);	
			me.checkLoadCount();		
		},
		
		stateTypesLoaded: function(me,activeId) {

			me.stateTypes.unshift(new fin.pur.poRequisition.StateType({ id: 0, number: 0, name: "None" }));
			me.shippingState.setData(me.stateTypes);
			me.vendorState.setData(me.stateTypes);	
			me.checkLoadCount();		
		},
		
		houseCodesLoaded: function(me, activeId) { 
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			
			me.houseCodeDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.houseCodeDetailsLoaded, me);
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);			
			me.loadPORequisitions();
			me.resizeControls();
		},
		
		houseCodeDetailsLoaded: function(me, activeId) {		
			
		},
		
		houseCodeJobsLoaded: function(me, activeId) {

			me.shippingJob.setData(me.houseCodeJobs);			
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.lastSelectedRowIndex = -1;			
			me.loadPORequisitions();
		},
		
		loadPORequisitions: function() {
			var me = this;

			me.setLoadCount();
			me.poRequisitionStore.fetch("houseCode:" + parent.fin.appUI.houseCodeId, me.poRequisitionsLoaded, me);
		},
		
		poRequisitionsLoaded: function(me, activeId) {
				
			me.requisitionGrid.setData(me.poRequisitions);			
			me.checkLoadCount();
		},
		
		loadPOItems: function() {
			var me = this;
			
			me.setLoadCount();	
			me.poRequisitionDetailStore.reset();		
			me.poRequisitionDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId + ",catalogId:" + me.catalogId + ",orderId:0,accountId:" + me.accountId + ",searchValue:" + me.searchItem.getValue(), me.poItemsLoaded, me);
			me.searchItem.setValue("");
		},
		
		poItemsLoaded: function(me, activeId) {

			me.itemGrid.setData(me.poRequisitionDetails);
			me.checkLoadCount();
		},
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			if (me.persons.length > 0) {
				me.users = me.persons.slice();				
				me.requestorName.text.readOnly = true;
				me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + " [" + me.session.propertyGet("userName") + "]");
				me.requestorEmail.setValue(me.users[0].email);
				me.requestedDate.setValue(me.currentDate());								
			}
			me.checkLoadCount();
		},
				
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var item = me.requisitionGrid.data[index];			
			
			me.lastSelectedRowIndex = index;
			me.status = "";
			
			if (item == undefined) 
				return;
			
			if (me.requisitionGrid.data[index] != undefined) {
				poRequisitionId = me.requisitionGrid.data[index].id;
				//me.setLoadCount();
				//me.itemStore.fetch("userId:[user],pORequisitionId:" + pORequisitionId, me.itemsLoaded, me);
			}
			else 
				poRequisitionId = 0;
		},	
		
		itemsLoaded: function(me, activeId) {
			
			me.itemGrid.setData(me.items);
			me.checkLoadCount();
		},
		
		vendorCheck: function() {
			var me = this;							
			
			me.vendorStore.reset();
			if(me.vendorName.getValue() != "") {
				me.setLoadCount();
				me.vendorStore.fetch("searchValue:" + me.vendorName.getValue() + ",vendorStatus:-2,userId:[user]", me.vendorsLoaded, me);
			}
			else {
				me.vendorId = 0;
				me.vendor.setValue("");
				me.vendorAddress1.setValue("");
				me.vendorAddress2.setValue("");
				me.vendorCity.setValue("");				
				me.vendorState.select(0, me.vendorState.focused);				
				me.vendorZip.setValue("");
				me.vendorContactName.setValue("");
				me.vendorPhone.setValue("");
				me.vendorEmail.setValue("");
			} 			
		},
		
		vendorsLoaded: function(me, activeId) {
			var itemIndex = 0;
			
			if (me.vendors.length > 0) {
				me.vendorId = me.vendors[0].number;
				me.vendor.setValue(me.vendors[0].name);
				me.vendorAddress1.setValue(me.vendors[0].addressLine1);
				me.vendorAddress2.setValue(me.vendors[0].addressLine2);
				me.vendorCity.setValue(me.vendors[0].city);
				
				itemIndex = ii.ajax.util.findIndexById(me.vendors[0].stateType.toString(), me.stateTypes);				
				if(itemIndex >= 0 && itemIndex != undefined)
					me.vendorState.select(itemIndex, me.vendorState.focused);
					
				me.vendorZip.setValue(me.vendors[0].zip);
				me.vendorContactName.setValue(me.vendors[0].contactName);
				me.vendorPhone.setValue(me.vendors[0].phoneNumber);
				me.vendorEmail.setValue(me.vendors[0].email);
			}
			else {
				me.vendorId = 0;
				me.vendor.setValue("");
				me.vendorAddress1.setValue("");
				me.vendorAddress2.setValue("");
				me.vendorCity.setValue("");				
				me.vendorState.select(0, me.vendorState.focused);				
				me.vendorZip.setValue("");
				me.vendorContactName.setValue("");
				me.vendorPhone.setValue("");
				me.vendorEmail.setValue("");
			}
			
			me.checkLoadCount();
		},
		
		categoriesLoaded: function(me, activeId) {
			
			me.category.reset();
			if(me.vendorId == 0)
				me.category.setData([]);
			else
				me.category.setData(me.accounts);
		},
		
		categoryChanged: function() {
			var me = this;

			if (me.category.indexSelected >= 0)
				me.accountId = me.accounts[me.category.indexSelected].id;
			else
				me.accountId = 0;
		},
		
		catalogsLoaded: function(me, activeId) {
			
			me.catalog.reset();
			me.catalog.setData(me.catalogs);
			me.checkLoadCount();
		},
		
		catalogChanged: function() {
			var me = this;
			
			if (me.catalog.indexSelected >= 0)
				me.catalogId = me.catalogs[me.catalog.indexSelected].id;
			else
				me.catalogId = 0;
		},
		
		actionClickItem: function(object, index) {
			var me = this;

			if (object.type == "text") {
				if (object.id == "price" + index) {
					
					if (me.moduleColumns[index].columnTypeFilter == 0) {
						me.moduleColumns[index].columnTypeFilter = 0;
						$("#filterInputCheck" + index)[0].checked = false;
					}
					else if (me.moduleColumns[index].columnTypeFilter == 1) {
						me.moduleColumns[index].columnTypeFilter = 1;
						$("#filterInputCheck" + index)[0].checked = true;;
					}
				}
			}
		},
				
		actionNewItem: function() {
			var me = this;
				
			if (parent.fin.appUI.houseCodeId == 0) {
				alert('Please select the House Code before adding the new PO Requisition.')
				return true;
			}
						
			$("#GeneralInfo").show();
			$("#ItemInfo").hide();			
			$("#ShippingInfo").hide();
			me.anchorNext.display(ui.cmn.behaviorStates.enabled);
			me.anchorBack.display(ui.cmn.behaviorStates.disabled);
			me.anchorSave.display(ui.cmn.behaviorStates.disabled);
			$("#Header").text("New PO Requisition");
			
			loadPopup();
			
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);
			me.itemGrid.setData([]);
			me.itemGrid.setHeight($(window).height() - 165);
			me.deliveryDate.setValue("");
			me.vendorName.setValue("");
			me.vendorAddress1.setValue("");
			me.vendorAddress2.setValue("");
			me.vendorCity.setValue("");
			me.vendorState.select(0, me.vendorState.focused);
			me.vendorZip.setValue("");
			me.vendorContactName.setValue("");
			me.vendorPhone.setValue("");
			me.vendorEmail.setValue("");
			me.reasonForRequest.setValue("");
			$('input[name="RequisitionType"]').attr('checked', false);
			$('input[name="Urgency"]').attr('checked', false);
			$('input[name="LifeSpan"]').attr('checked', false);
			
			me.vendor.setValue("");
			me.searchItem.setValue("");
			me.category.reset();
			me.category.setData([]);
			me.catalog.reset();
			me.catalog.setData([]);
			me.company.setValue("");
			me.shippingAddress1.setValue("");
			me.shippingAddress2.setValue("");
			me.shippingCity.setValue("");
			me.shippingState.select(0, me.shippingState.focused);
			me.shippingZip.setValue("");
			me.shippingPhone.setValue("");
			me.shippingFax.setValue("");
			
			me.resizeControls();
			poRequisitionId = 0;
			me.status = "NewPORequisition";
			me.wizardCount = 1;
		},
		
		actionEditItem: function() {
			var me = this;
				
			if (parent.fin.appUI.houseCodeId == 0) {
				alert('Please select the House Code before adding the new PO Requisition.')
				return true;
			}
						
			$("#GeneralInfo").show();
			$("#ItemInfo").hide();			
			$("#ShippingInfo").hide();
			me.anchorNext.display(ui.cmn.behaviorStates.enabled);
			me.anchorBack.display(ui.cmn.behaviorStates.disabled);
			me.anchorSave.display(ui.cmn.behaviorStates.disabled);
			$("#Header").text("Edit PO Requisition");
			
			loadPopup();
			
			me.resizeControls();
			poRequisitionId = 0;
			me.vendorId = 0;
			me.status = "EditPORequisition";
			me.wizardCount = 1;
		},
		
		actionNextItem: function() {
			var me = this;								
			
			me.wizardCount = me.wizardCount + 1;
			
			if (me.wizardCount == 2) {				
				$("#GeneralInfo").hide();
				$("#ItemInfo").show();
				$("#ShippingInfo").hide();
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);
				me.anchorBack.display(ui.cmn.behaviorStates.enabled);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				$("#Header").text("PO Requisition Item Information");
				
				me.setLoadCount();
				me.vendor.resizeText();
				me.category.fetchingData();
				me.catalog.fetchingData();
				me.accountStore.reset();
				me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.categoriesLoaded, me);
				me.catalogStore.reset();
				me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
			}
			else if (me.wizardCount == 3) {				
				$("#GeneralInfo").hide();
				$("#ItemInfo").hide();
				$("#ShippingInfo").show();
				me.anchorNext.display(ui.cmn.behaviorStates.disabled);
				me.anchorBack.display(ui.cmn.behaviorStates.enabled);
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
				$("#Header").text("Shipping Information");	
				
				me.company.setValue(parent.fin.appUI.houseCodeTitle);
				me.shippingAddress1.setValue(me.houseCodeDetails[0].shippingAddress1);
				me.shippingAddress2.setValue(me.houseCodeDetails[0].shippingAddress2);
				me.shippingCity.setValue(me.houseCodeDetails[0].shippingCity);
				
				index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].shippingState.toString(), me.stateTypes);
				if (index >= 0 && index != undefined)
					me.shippingState.select(index, me.shippingState.focused);
		
				me.shippingZip.setValue(me.houseCodeDetails[0].shippingZip);
				me.shippingPhone.setValue("");
				me.shippingFax.setValue("");					
			}
			
			me.validator.reset();
			me.itemGrid.setHeight($(window).height() - 165);
		},
		
		actionBackItem: function() {
			var me = this;
			
			if (me.wizardCount == 2) {							
				$("#GeneralInfo").show();
				$("#ItemInfo").hide();				
				$("#ShippingInfo").hide();
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);
				me.anchorBack.display(ui.cmn.behaviorStates.disabled);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				$("#Header").text("Edit PO Requisition");
			}
			else if (me.wizardCount == 3) {
				
				$("#GeneralInfo").hide();
				$("#ItemInfo").show();
				$("#ShippingInfo").hide();
				me.anchorNext.display(ui.cmn.behaviorStates.enabled);
				me.anchorBack.display(ui.cmn.behaviorStates.enabled);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				$("#Header").text("PO Requisition Item Information");					
			}
			
			me.resizeControls();
			me.validator.reset();
			me.itemGrid.setHeight($(window).height() - 165);
			me.wizardCount = me.wizardCount - 1;
		},
		
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			disablePopup();
			if (me.requisitionGrid.activeRowIndex >= 0)
				poRequisitionId = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex].id;
			
			me.wizardCount = 0;	
			me.status = "";
			me.setStatus("Loaded");
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			var item = [];			
			
			if (me.status == "NewPORequisition" || me.status == "EditPORequisition") {
				me.validator.forceBlur();
				
				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true)) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			}
			
			disablePopup();
			
			if (me.status != "") {		

				var xml = me.saveXmlBuildPORequisition(item);
				
				if (xml == "") {
						
					return;
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
		},
		
		saveXmlBuildPORequisition: function() {
			var args = ii.args(arguments,{
				item: {type: [fin.pur.poRequisition.PORequisition]}
			});			
			var me = this;
			var xml = "";			
			var rowIndex = me.requisitionGrid.activeRowIndex;

			if (me.status == "NewPORequisition" || me.status == "EditPORequisition") {
				xml += '<purPORequisition';
				xml += ' id="' + poRequisitionId + '"';
				
				if (me.status == "NewPORequisition") {
					xml += ' vendorId="' + me.vendorId + '"';
					xml += ' houseCode="' + parent.fin.appUI.houseCodeId + '"';
				}
				else {
					xml += ' vendorId="' + me.requisitionGrid.data[rowIndex].vendorId + '"';
					xml += ' houseCode="' + me.requisitionGrid.data[rowIndex].houseCode + '"';
				}
				
				xml += ' houseCodeJob="' + (me.shippingJob.indexSelected == -1 ? 0 : me.houseCodeJobs[me.shippingJob.indexSelected].id) + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(me.requestorName.getValue()) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(me.requestorEmail.getValue()) + '"';
				xml += ' requestedDate="' + me.requestedDate.lastBlurValue + '"';
				xml += ' deliveryDate="' + me.deliveryDate.lastBlurValue + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(me.vendorName.getValue()) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(me.vendorAddress1.getValue()) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(me.vendorAddress2.getValue()) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(me.vendorCity.getValue()) + '"';
				xml += ' vendorStateType="' + me.stateTypes[me.vendorState.indexSelected].id + '"';
				xml += ' vendorZip="' + me.vendorZip.getValue() + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(me.vendorContactName.getValue()) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(me.vendorPhone.getValue()) + '"';
				xml += ' vendorEmail="' + me.vendorEmail.getValue() + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(me.reasonForRequest.getValue()) + '"';
				xml += ' requisitionType="' + $("input[name='RequisitionType']:checked").val() + '"';
				xml += ' urgency="' + $("input[name='Urgency']:checked").val() + '"';
				xml += ' lifeSpan="' + $("input[name='LifeSpan']:checked").val() + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(me.shippingAddress1.getValue()) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(me.shippingAddress2.getValue()) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(me.shippingCity.getValue()) + '"';
				xml += ' shipToState="' + me.stateTypes[me.shippingState.indexSelected].id + '"';
				xml += ' shipToZip="' + me.shippingZip.getValue() + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(me.shippingPhone.getValue(), true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(me.shippingFax.getValue(), true) + '"';
				xml += ' chargeToPeriod=""';
				xml += '/>';
			}
			
			for (var index = 0; index < me.poRequisitionDetails.length; index++) {			
				if ($("#selectInputCheck" + index)[0].checked) {
					xml += '<purPORequisitionDetail';
					xml += ' id="0"';
					xml += ' poRequisitionId="' + poRequisitionId + '"';
					xml += ' account="' +  me.poRequisitionDetails[index].account.id + '"';
					xml += ' number="' + me.poRequisitionDetails[index].number + '"';
					xml += ' description="' + me.poRequisitionDetails[index].description + '"';
					xml += ' price="' + parseFloat(me.poRequisitionDetails[index].price) + '"';
					xml += ' quantity="' + me.poRequisitionDetails[index].quantity + '"';
					xml += ' uom="' + me.poRequisitionDetails[index].unit + '"';
					xml += ' manufactured="' + me.poRequisitionDetails[index].manufactured + '"';										
					xml += '/>';
				}
			}

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
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				me.modified(false);
				if (me.status == "NewPORequisition") {
					poRequisitionId = parseInt($(this).attr("id"), 10)
					me.reloadGrid = true;
				}
				else if (me.status == "EditPORequisition")
					me.bindRow();				
				else
					me.status = "";

				if (me.reloadGrid) {
					me.setLoadCount();
					me.poRequisitionStore.reset();	
					me.poRequisitionStore.fetch("houseCode:" + parent.fin.appUI.houseCodeId, me.poRequisitionsLoaded, me);
				}
					
				me.setStatus("Saved");
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while updating Purchase Order details: " + $(args.xmlNode).attr("message"));				
			}
		},

		emailNotificationResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
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
	var popupHeight = windowHeight - 10;	

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

function main() {

	fin.pur.poRequisitionUi = new fin.pur.poRequisition.UserInterface();
	fin.pur.poRequisitionUi.resize();
	fin.houseCodeSearchUi = fin.pur.poRequisitionUi;
}
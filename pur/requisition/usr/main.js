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
				
			me.poRequisitionId = 0;
			me.vendorId = 0;
			me.accountId = 0;
			me.catalogId = 0;
			me.lastSelectedRowIndex = -1;		
			me.status = "";
			me.users = [];
			me.wizardCount = 0;
			me.loadCount = 0;
			me.glAccounts = [];
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.validator = new ui.ctl.Input.Validation.Master();			
			me.session = new ii.Session(me.cache);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\PORequisition";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.statusesLoaded();
			me.setStatus("Loading");
			me.modified(false);
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
		
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}			
			
			$("input[name='RequisitionType']").change(function() { me.modified(); });
			$("input[name='Urgency']").change(function() { me.modified(); });
			$("input[name='LifeSpan']").change(function() { me.modified(); });
        },
		
		authorizationProcess: function fin_pur_poRequisition_authorizationProcess() {
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
			
			fin.pur.poRequisitionUi.requisitionGrid.setHeight($(window).height() - 145);
			fin.pur.poRequisitionUi.itemGrid.setHeight($(window).height() - 265);
			fin.pur.poRequisitionUi.itemReadOnlyGrid.setHeight($(window).height() - 200);
			$("#GeneralInfo").height($(window).height() - 210);
			$("#ShippingInfo").height($(window).height() - 210);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});
			
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
			
			me.anchorView = new ui.ctl.buttons.Sizeable({
				id: "AnchorView",
				className: "iiButton",
				text: "<span>&nbsp;View&nbsp;</span>",
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
			
			me.anchorPrint = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrint",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Print&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrintItem(); },
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
			
			me.anchorSendRequisition = new ui.ctl.buttons.Sizeable({
				id: "AnchorSendRequisition",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Send Requisition&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSendRequisitionItem(); },
				hasHotState: true
			});
			
			me.anchorResendRequisition = new ui.ctl.buttons.Sizeable({
				id: "AnchorResendRequisition",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Resend Requisition&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionResendRequisitionItem(); },
				hasHotState: true
			});
			
			me.statusType = new ui.ctl.Input.DropDown.Filtered({
				id: "StatusType",
				formatFunction: function( type ) { return type.title; }
			});

			me.statusType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.statusType.indexSelected == -1)
						this.setInvalid("Please select the correct Status.");
				});
				
			me.requisitionGrid = new ui.ctl.Grid({
				id: "RequisitionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.requisitionGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 250);				
			me.requisitionGrid.addColumn("requestedDate ", "requestedDate", "Requested Date", "Requested Date", 150);
			me.requisitionGrid.addColumn("deliveryDate", "deliveryDate", "Delivery Date", "Delivery Date", 150);
			me.requisitionGrid.addColumn("vendorTitle", "vendorTitle", "Vendor Title", "Vendor Title", null);
			me.requisitionGrid.addColumn("statusType", "statusType", "Status", "Status", 100, function(statusType) {
				if (statusType == 1)
					return "Open";
				else if (statusType == 2)
					return "In Process";
				else if (statusType == 8)
                	return "Approved";
				else if (statusType == 9)
                	return "Completed";
				else if (statusType == 6)
                	return "Cancelled";
				else if (statusType == 10)
                	return "Unapproved";
           	});
			me.requisitionGrid.capColumns();
			
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
				
			me.vendorName = new ui.ctl.Input.DropDown.Filtered({
		        id: "VendorName",
				title: "To search a specific Vendor, type-in Vendor Number or Title and press Enter key.",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.vendorChanged(); me.modified();}
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
				formatFunction: function(type) { return type.name; },
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
				createNewFunction: fin.pur.poRequisition.Item,
				selectFunction: function(index){
					if (me.itemGrid.rows[index].getElement("rowNumber").innerHTML == "Add") 
						me.itemGrid.rows[index].getElement("itemSelect").innerHTML = "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" />";
				}			
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
				formatFunction: function(type) { return type.code + " - " + type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.account.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.account.indexSelected == -1)
						this.setInvalid("Please select the correct Account No.");
				});
			
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
			
			me.quantity = new ui.ctl.Input.Text({
		        id: "Quantity",
		        maxLength: 11,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.quantity.getValue();

				if (enteredText == "") return;

				if (/^[0-9]+(\[0-9]+)?$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Quantity.");
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
			
			me.itemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function(data) {
								
				var index = me.itemGrid.rows.length - 1;
				if (me.itemGrid.data[index].itemSelect)
                	return "<center><input type=\"checkbox\" checked=\"true\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" /></center>";
				else
				    return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" /></center>";
            });
			me.itemGrid.addColumn("number", "number", "Item Number", "Item Number", 120, null, me.itemNumber);
			me.itemGrid.addColumn("description", "description", "Item Description", "Item Description", null, null, me.itemDescription);
			me.itemGrid.addColumn("account", "account", "GL Account No", "GL Account No", 120, function( account ) { return account.code + " - " + account.name; }, me.account);
			me.itemGrid.addColumn("unit", "unit", "UOM", "UOM", 100, null, me.uom);
			me.itemGrid.addColumn("manufactured", "manufactured", "Manufactured", "Manufactured", 120, null, me.manufactured);
			me.itemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100, null, me.quantity);
			me.itemGrid.addColumn("price", "price", "Price", "Price", 100, null, me.price);			
			me.itemGrid.capColumns();			
			
			me.itemReadOnlyGrid = new ui.ctl.Grid({
				id: "ItemReadOnlyGrid",
				allowAdds: false			
			});
			
			me.itemReadOnlyGrid.addColumn("number", "number", "Item Number", "Item Number", 120);
			me.itemReadOnlyGrid.addColumn("description", "description", "Item Description", "Item Description", null);
			me.itemReadOnlyGrid.addColumn("account", "account", "GL Account No", "GL Account No", 120, function(account) { return account.code + " - " + account.name;	});
			me.itemReadOnlyGrid.addColumn("unit", "unit", "UOM", "UOM", 100);
			me.itemReadOnlyGrid.addColumn("manufactured", "manufactured", "Manufactured", "Manufactured", 120);
			me.itemReadOnlyGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 100);
			me.itemReadOnlyGrid.addColumn("price", "price", "Price", "Price", 100);
			me.itemReadOnlyGrid.capColumns();
			
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
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingAddress1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.shippingAddress2 = new ui.ctl.Input.Text({
		        id: "ShippingAddress2",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingCity = new ui.ctl.Input.Text({
		        id: "ShippingCity",
				maxLength: 100,
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
			
			me.vendor.text.readOnly = true;
			$("#VendorName").bind("keydown", me, me.actionVendorSearch);
			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorPrint").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorSendRequisition").hide();			
			me.setTabIndexes();
		},		

		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			parent.fin.appUI.houseCodeId = 0;
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
			
			me.items = [];
			me.itemStore = me.cache.register({
				storeId: "purPurchaseOrderItems",
				itemConstructor: fin.pur.poRequisition.Item,
				itemConstructorArgs: fin.pur.poRequisition.itemArgs,
				injectionArray: me.items,
				lookupSpec: { account: me.glAccounts }	
			});
			
			me.poRequisitionDetails = [];
			me.poRequisitionDetailStore = me.cache.register({
				storeId: "purPORequisitionDetails",
				itemConstructor: fin.pur.poRequisition.PORequisitionDetail,
				itemConstructorArgs: fin.pur.poRequisition.poRequisitionDetailArgs,
				injectionArray: me.poRequisitionDetails,
				lookupSpec: { account: me.glAccounts }
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
			me.company.resizeText();
			me.shippingJob.resizeText();
			me.shippingAddress1.resizeText();
			me.shippingAddress2.resizeText();
			me.shippingCity.resizeText();
			me.shippingState.resizeText();
			me.shippingZip.resizeText();
			me.shippingPhone.resizeText();
			me.shippingFax.resizeText();
			me.resize();
		},
		
		setReadOnly: function(readOnly) {
			var me = this;

			me.requestorName.text.readOnly = readOnly;
			me.requestorEmail.text.readOnly = readOnly;
			me.requestedDate.text.readOnly = readOnly;
			me.deliveryDate.text.readOnly = readOnly;			
			me.vendorName.text.readOnly = readOnly;
			me.vendorAddress1.text.readOnly = readOnly;
			me.vendorAddress2.text.readOnly = readOnly;
			me.vendorCity.text.readOnly = readOnly;
			me.vendorState.text.readOnly = readOnly;
			me.vendorZip.text.readOnly = readOnly;
			me.vendorContactName.resizeText();
			me.vendorPhone.text.readOnly = readOnly;
			me.vendorEmail.text.readOnly = readOnly;
			me.reasonForRequest.text.readOnly = readOnly;
			me.company.text.readOnly = readOnly;
			me.shippingJob.text.readOnly = readOnly;
			me.shippingAddress1.text.readOnly = readOnly;
			me.shippingAddress2.text.readOnly = readOnly;
			me.shippingCity.text.readOnly = readOnly;
			me.shippingState.text.readOnly = readOnly;
			me.shippingZip.text.readOnly = readOnly;
			me.shippingPhone.text.readOnly = readOnly;
			me.shippingFax.text.readOnly = readOnly;

			$("#RequisitionTypeSpecialSupply")[0].disabled = readOnly;
			$("#RequisitionTypeOffContract")[0].disabled = readOnly;
			$("#UrgencyUrgent")[0].disabled = readOnly;
			$("#UrgencyNotUrgent")[0].disabled = readOnly;
			$("#LifeSpanPermanent")[0].disabled = readOnly;
			$("#LifeSpanTemporary")[0].disabled = readOnly;

			if (readOnly) {
				$("#RequestedDateAction").removeClass("iiInputAction");
				$("#DeliveryDateAction").removeClass("iiInputAction");
				$("#VendorNameAction").removeClass("iiInputAction");
				$("#VendorStateAction").removeClass("iiInputAction");
				$("#AccountAction").removeClass("iiInputAction");
				$("#ShippingJobAction").removeClass("iiInputAction");
				$("#ShippingStateAction").removeClass("iiInputAction");
				$("#ItemGrid").hide();
				$("#ItemReadOnlyGrid").show();
			}
			else  {
				$("#RequestedDateAction").addClass("iiInputAction");
				$("#DeliveryDateAction").addClass("iiInputAction");
				$("#VendorNameAction").addClass("iiInputAction");
				$("#VendorStateAction").addClass("iiInputAction");
				$("#AccountAction").addClass("iiInputAction");
				$("#ShippingJobAction").addClass("iiInputAction");
				$("#ShippingStateAction").addClass("iiInputAction");
				$("#ItemGrid").show();
				$("#ItemReadOnlyGrid").hide();				
			}
		},
		
		currentDate: function() {
			var currentTime = new Date();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			
			return month + "/" + day + "/" + year;
		},
		
		statusesLoaded: function() {
			var me = this;

			me.statuses = [];
			me.statuses.push(new fin.pur.poRequisition.Status(0, "[All]"));
			me.statuses.push(new fin.pur.poRequisition.Status(1, "Open"));
			me.statuses.push(new fin.pur.poRequisition.Status(2, "In Process"));
			me.statuses.push(new fin.pur.poRequisition.Status(8, "Approved"));
			me.statuses.push(new fin.pur.poRequisition.Status(11, "Completed - PO"));
			me.statuses.push(new fin.pur.poRequisition.Status(12, "Completed - JDE"));
			me.statuses.push(new fin.pur.poRequisition.Status(6, "Cancelled"));
			me.statuses.push(new fin.pur.poRequisition.Status(10, "Unapproved"));

			me.statusType.setData(me.statuses);
			me.statusType.select(0, me.statusType.focused);
		},
		
		accountsLoaded: function(me, activeId) {
			
			for (var index = 0; index < me.accounts.length; index++) {
				var item = new fin.pur.poRequisition.GLAccount(me.accounts[index].id, me.accounts[index].code, me.accounts[index].name);
				me.glAccounts.push(item);
			}
			me.account.setData(me.glAccounts);	
			me.checkLoadCount();		
		},
		
		stateTypesLoaded: function(me,activeId) {

			me.stateTypes.unshift(new fin.pur.poRequisition.StateType({ id: 0, number: 0, name: "None" }));
			me.shippingState.setData(me.stateTypes);
			me.vendorState.setData(me.stateTypes);	
			me.checkLoadCount();		
		},
		
		actionSearchItem: function() {
			var me = this;

			me.setLoadCount();
			me.poRequisitionStore.reset();
			me.poRequisitionStore.fetch("houseCode:" + parent.fin.appUI.houseCodeId
				+ ",statusType:" + (me.statusType.indexSelected == -1 ? 0 : me.statuses[me.statusType.indexSelected].id)
				, me.poRequisitionsLoaded, me);
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
			me.poRequisitionStore.fetch("houseCode:" + parent.fin.appUI.houseCodeId
				+ ",statusType:" + (me.statusType.indexSelected == -1 ? 0 : me.statuses[me.statusType.indexSelected].id)
				, me.poRequisitionsLoaded, me);
		},
		
		poRequisitionsLoaded: function(me, activeId) {
				
			me.requisitionGrid.setData(me.poRequisitions);			
			me.checkLoadCount();
		},
		
		loadPOItems: function() {
			var me = this;
			
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();	
			me.itemStore.reset();		
			me.itemStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId + ",catalogId:" + me.catalogId + ",orderId:0,accountId:" + me.accountId + ",searchValue:" + me.searchItem.getValue(), me.poItemsLoaded, me);
			me.searchItem.setValue("");
		},
		
		poItemsLoaded: function(me, activeId) {	
			
			for (var index = 0; index < me.items.length; index++) {
				var found = false;
				for (var iIndex = 0; iIndex < me.poRequisitionDetails.length; iIndex++) {
					if (me.items[index].number == me.poRequisitionDetails[iIndex].number) {
						found = true; 
						break;
					}	
				}
				if (!found) {
					me.poRequisitionDetails.push(me.items[index]);
				}
			}
		
			me.itemGrid.setData(me.poRequisitionDetails);
			me.itemReadOnlyGrid.setData(me.poRequisitionDetails);
			$("#popupLoading").hide();
		},
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			if (me.persons.length > 0) {
				me.users = me.persons.slice();				
				me.requestorName.text.readOnly = true;
				me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");				
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
				me.poRequisitionId = me.requisitionGrid.data[index].id;
				me.requestorName.setValue(item.requestorName);
				me.requestorEmail.setValue(item.requestorEmail);
				me.requestedDate.setValue(item.requestedDate);
				me.deliveryDate.setValue(item.deliveryDate);
				me.vendorName.lastBlurValue = item.vendorTitle;
				$("#VendorNameText").val(item.vendorTitle);					
				me.vendorAddress1.setValue(item.vendorAddressLine1);
				me.vendorAddress2.setValue(item.vendorAddressLine2);
				me.vendorCity.setValue(item.vendorCity);
				
				var itemIndex = ii.ajax.util.findIndexById(item.vendorStateType.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.vendorState.select(itemIndex, me.vendorState.focused);
				
				me.vendorZip.setValue(item.vendorZip);
				me.vendorContactName.setValue(item.vendorContactName);
				me.vendorPhone.setValue(item.vendorPhoneNumber);
				me.vendorEmail.setValue(item.vendorEmail);
				me.reasonForRequest.setValue(item.reasonForRequest);
				
				if (item.requisitionType == "Special Supply") 
					$('#RequisitionTypeSpecialSupply').attr('checked', true);
				else if (item.requisitionType == "Off Contract") 
					$('#RequisitionTypeOffContract').attr('checked', true);
				
				if (item.urgency == "Urgent") 
					$('#UrgencyUrgent').attr('checked', true);
				else if (item.urgency == "Not Urgent") 
					$('#UrgencyNotUrgent').attr('checked', true);
				
				if (item.lifeSpan == "Permanent") 
					$('#LifeSpanPermanent').attr('checked', true);
				else if (item.lifeSpan == "Temporary") 
					$('#LifeSpanTemporary').attr('checked', true);
				
				me.vendor.setValue(item.vendorTitle);
				
				itemIndex = ii.ajax.util.findIndexById(item.houseCode.toString(), me.houseCodes);
				if (itemIndex != undefined) 
					me.company.setValue(me.houseCodes[itemIndex].name);
				
				itemIndex = ii.ajax.util.findIndexById(item.houseCodeJob.toString(), me.houseCodeJobs);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.shippingJob.select(itemIndex, me.shippingJob.focused);
				
				me.shippingAddress1.setValue(item.shipToAddress1);
				me.shippingAddress2.setValue(item.shipToAddress2);
				me.shippingCity.setValue(item.shipToCity);
				
				itemIndex = ii.ajax.util.findIndexById(item.shipToState.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.shippingState.select(itemIndex, me.shippingState.focused);				
				
				me.shippingZip.setValue(item.shipToZip);
				me.shippingPhone.setValue(item.shipToPhone);
				me.shippingFax.setValue(item.shipToFax);	

				if (me.requisitionGrid.data[index].statusType == 10 || me.requisitionGrid.data[index].statusType == 1) {
					if (me.requisitionGrid.data[index].statusType == 10) {
						$("#AnchorResendRequisition").show();
						$("#AnchorSendRequisition").hide();
					}
					if (me.requisitionGrid.data[index].statusType == 1) {
						$("#AnchorResendRequisition").hide();
						$("#AnchorSendRequisition").show();
					}
					
					$("#AnchorEdit").show();
					$("#AnchorView").hide();
					$("#VendorInfo").show();
					$("#CategoryInfo").show();					
					me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					me.setReadOnly(false);															
				}
				else {
					if (me.requisitionGrid.data[index].statusType == 2) {
						$("#AnchorResendRequisition").show();
						$("#AnchorSendRequisition").hide();
					}					
					else {
						$("#AnchorResendRequisition").hide();
						$("#AnchorSendRequisition").hide();
					}			
					
					$("#AnchorEdit").hide();
					$("#AnchorView").show();
					$("#VendorInfo").hide();
					$("#CategoryInfo").hide();
					me.anchorSave.display(ui.cmn.behaviorStates.disabled);
					me.setReadOnly(true);
				}
				
				$("#AnchorPrint").show();
				me.modified(false);	
				me.setLoadCount();
				me.poRequisitionDetailStore.reset();
				me.poRequisitionDetailStore.fetch("userId:[user],pORequisitionId:" + me.poRequisitionId, me.poRequisitonDetailsLoaded, me);												
			}
			else 
				me.poRequisitionId = 0;
		},	
		
		poRequisitonDetailsLoaded: function(me, activeId) {

			me.itemGrid.setData(me.poRequisitionDetails);
			me.itemReadOnlyGrid.setData(me.poRequisitionDetails);
			me.checkLoadCount();
		},
		
		actionVendorSearch: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				if (me.vendorName.text.value != "") {
					me.vendorName.fetchingData();
					me.vendorStore.reset();
					me.vendorStore.fetch("searchValue:" + me.vendorName.text.value + ",vendorStatus:-1,userId:[user]", me.vendorsLoaded, me);
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
			}
		},
		
		vendorsLoaded: function(me, activeId) {
			
			me.vendorName.reset();
			me.vendorName.setData(me.vendors);
						
			if (me.vendors.length > 0)
				me.vendorName.select(0, me.vendorName.focused);
	
			me.vendorChanged();	
		},
		
		vendorChanged: function() {
			var me = this;
			var index = 0;			
			var itemIndex = -1;
			
			itemIndex = me.vendorName.indexSelected;	
			me.lastIndexSelected = itemIndex;
			
			if (itemIndex >= 0) {
				me.vendorId = me.vendors[itemIndex].number;
				me.vendor.setValue(me.vendors[itemIndex].name);
				me.vendorAddress1.setValue(me.vendors[itemIndex].addressLine1);
				me.vendorAddress2.setValue(me.vendors[itemIndex].addressLine2);
				me.vendorCity.setValue(me.vendors[itemIndex].city);
				
				index = ii.ajax.util.findIndexById(me.vendors[itemIndex].stateType.toString(), me.stateTypes);				
				if(index >= 0 && index != undefined)
					me.vendorState.select(index, me.vendorState.focused);
					
				me.vendorZip.setValue(me.vendors[itemIndex].zip);
				me.vendorContactName.setValue(me.vendors[itemIndex].contactName);
				me.vendorPhone.setValue(me.vendors[itemIndex].phoneNumber);
				me.vendorEmail.setValue(me.vendors[itemIndex].email);
				me.account.setData(me.glAccounts);
				me.category.fetchingData();
				me.catalog.fetchingData();
				me.accountStore.reset();
				me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.categoriesLoaded, me);
				me.catalogStore.reset();
				me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
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
				$("#popupLoading").hide();
			}
		},
		
		vendorsLoad: function(me, activeId) {			
			
			if (me.vendors.length > 0) {
				me.vendorId = me.vendors[0].number;
				
				me.category.fetchingData();
				me.catalog.fetchingData();
				me.accountStore.reset();
				me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.categoriesLoaded, me);
				me.catalogStore.reset();
				me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
			}			
		},
		
		categoriesLoaded: function(me, activeId) {

			me.category.reset();
			if (me.vendorId == 0)
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
			if(me.vendorId == 0)
				me.catalog.setData([]);
			else
				me.catalog.setData(me.catalogs);

			$("#popupLoading").hide();
		},
		
		catalogChanged: function() {
			var me = this;
			
			if (me.catalog.indexSelected >= 0)
				me.catalogId = me.catalogs[me.catalog.indexSelected].id;
			else
				me.catalogId = 0;
		},
		
		validatePORequisition: function() {
			var me = this;
			var valid = true;			
			
			me.validator.forceBlur();
			
			if (me.wizardCount == 1) {
				
				if (me.status == "NewPORequisition")
					valid = me.validator.queryValidity(true);
			
				if (!me.requestorEmail.valid
					|| !me.requestedDate.valid
					|| !me.deliveryDate.valid
					|| !me.vendorName.valid
					|| !me.vendorAddress1.valid					
					|| !me.vendorAddress2.valid					
					|| !me.vendorCity.valid
					|| !me.vendorState.valid
					|| !me.vendorZip.valid
					|| !me.vendorContactName.valid
					|| !me.vendorPhone.valid
					|| !me.vendorEmail.valid
					|| !me.reasonForRequest.valid					
					) {
					me.alertMessage = "In order to continue, the errors on the page must be corrected.";	
					return false;
				}
				else if ($('input:radio[name="RequisitionType"]:checked').length == 0) {
					me.alertMessage = "Please select Requisition Type.";	
					return false;
				}
				else if ($('input:radio[name="Urgency"]:checked').length == 0) {
					me.alertMessage = "Please select Urgency.";	
					return false;
				}
				else if ($('input:radio[name="LifeSpan"]:checked').length == 0) {
					me.alertMessage = "Please select Life Span.";	
					return false;
				}
				else
					return true;
			}
			else if (me.wizardCount == 2) {
				
				if (me.itemGrid.activeRowIndex == -1)
				 	return true;
				
				valid = me.validator.queryValidity(true);				
				
				if ($("#selectInputCheck" + me.itemGrid.activeRowIndex)[0].checked && (!me.itemNumber.valid
					|| !me.itemDescription.valid
					|| !me.account.valid
					|| !me.price.valid
					|| !me.quantity.valid
					|| !me.uom.valid)
				) {
					me.alertMessage = "In order to continue, the errors on the page must be corrected.";
					return false;
				}
				else
					return true;
			}
			else if (me.wizardCount == 3) {				
				
				valid = me.validator.queryValidity(true);
				
				if (!me.requestorEmail.valid
					|| !me.shippingAddress1.valid
					|| !me.shippingCity.valid
					|| !me.shippingState.valid					
					|| !me.shippingZip.valid					
					) {
					me.alertMessage = "In order to continue, the errors on the page must be corrected.";	
					return false;
				}
				else
					return true;
			}			
		},
					
		actionNewItem: function() {
			var me = this;
				
			if (parent.fin.appUI.houseCodeId == 0) {
				alert("Please select the House Code before adding the new PO Requisition.")
				return true;
			}
			
			me.anchorSave.display(ui.cmn.behaviorStates.enabled);
			me.setReadOnly(false);
			me.requisitionGrid.body.deselectAll();
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);		
			me.itemGrid.setData([]);
			me.itemReadOnlyGrid.setData([]);						
			me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");
			me.requestorEmail.setValue(me.users[0].email);
			me.requestedDate.setValue(me.currentDate());
			me.deliveryDate.setValue("");
			me.vendorStore.reset();
			me.vendorName.reset();
			me.vendorName.select(-1, me.vendorName.focused);
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
			
			$("#VendorInfo").show();
			$("#CategoryInfo").show();
			loadPopup();
			me.poRequisitionDetailStore.reset();
			me.poRequisitionId = 0;
			me.status = "NewPORequisition";
			me.wizardCount = 1;			
			me.modified(false);
			me.setStatus("Loaded");			
			me.actionShowWizard();
		},
		
		actionEditItem: function() {
			var me = this;
			var itemIndex = 0;			
			var name;
						
			if (parent.fin.appUI.houseCodeId == 0) {
				alert("Please select the House Code before adding the new PO Requisition.")
				return true;
			}
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			loadPopup();
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();

			if (me.requisitionGrid.data[me.lastSelectedRowIndex] != undefined) {
				me.vendorStore.reset();
				me.vendorStore.fetch("searchValue:" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle + ",vendorStatus:-1,userId:[user]", me.vendorsLoad, me);
			}			

			me.poRequisitionId = me.requisitionGrid.data[me.lastSelectedRowIndex].id;
			me.status = "EditPORequisition";			
			me.wizardCount = 1;
			me.actionShowWizard();
			me.modified(false);
			me.setStatus("Loaded");
		},
		
		actionNextItem: function() {
			var me = this;								
			
			if (!me.validatePORequisition()) {
				alert(me.alertMessage);
				return;
			}
			
			me.wizardCount = me.wizardCount + 1;
			me.actionShowWizard();
			me.validator.reset();
		},
		
		actionBackItem: function() {
			var me = this;
			
			me.wizardCount = me.wizardCount - 1;
			me.actionShowWizard();
			me.validator.reset();			
		},
		
		actionShowWizard: function() {
			var me = this;

			switch (me.wizardCount) {
				case 1:
					$("#GeneralInfo").show();
					$("#ItemInfo").hide();			
					$("#ShippingInfo").hide();
					me.anchorNext.display(ui.cmn.behaviorStates.enabled);
					me.anchorBack.display(ui.cmn.behaviorStates.disabled);
					me.anchorSave.display(ui.cmn.behaviorStates.disabled);
					$("#Header").text("General Information");					
					break;
					
				case 2:
					$("#GeneralInfo").hide();
					$("#ItemInfo").show();
					$("#ShippingInfo").hide();
					me.anchorNext.display(ui.cmn.behaviorStates.enabled);
					me.anchorBack.display(ui.cmn.behaviorStates.enabled);
					me.anchorSave.display(ui.cmn.behaviorStates.disabled);
					$("#Header").text("Item Information");					
					break;
					
				case 3:	
					$("#GeneralInfo").hide();
					$("#ItemInfo").hide();
					$("#ShippingInfo").show();
					me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					me.anchorBack.display(ui.cmn.behaviorStates.enabled);
					
					if (me.status == "NewPORequisition" || me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 10 || me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 1)
						me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					else
						me.anchorSave.display(ui.cmn.behaviorStates.disabled);
						
					$("#Header").text("Shipping Information");
					break;
			}
			
			me.resizeControls();
		},
		
		actionPrintItem: function() {
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			var item = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex];
			var htmlContent = "<html><head><link rel='stylesheet' type='text/css' href='style.css'></head><body>"
				+ "<center><b><span style='font-family: Verdana; font-size: 12pt;'>PO Requisitions</span></b></center></br>"
				+ "<table width=100% border=1 cellspacing=0 cellpadding=5 style='font-family: Verdana; font-size: 8pt;border-color:Gray;border-width:1px;border-style:Solid;border-collapse:collapse;'>"
                + "<tr><td width=25%>House Code:</td><td width=75% colspan=7>" + parent.fin.appUI.houseCodeTitle + "</td></tr>"
				+ "<tr><td colspan=8 align=center><b>Requestor Details</b></td></tr>"
                + "<tr><td width=25%>Requestor Name:</td><td width=75% colspan=7>" + me.requestorName.getValue() + "</td></tr>"
				+ "<tr><td width=25%>Requestor Email:</td><td width=75% colspan=7>" + item.requestorEmail + "</td></tr>"
				+ "<tr><td width=25%>Requested Date:</td><td width=25%>" + item.requestedDate + "</td><td width=25%>Delivery Date:</td><td width=25%>" + item.deliveryDate + "</td></tr>"					
				+ "<tr><td colspan=8 align=center><b>Vendor Details</b></td></tr>"
				+ "<tr><td width=25%>Name:</td><td width=75% colspan=7>" + item.vendorTitle + "</td></tr>"
				+ "<tr><td width=25%>Address 1:</td><td width=25%>" + item.vendorAddressLine1 + "</td><td width=25%>Address 2:</td><td width=25%>" +  item.vendorAddressLine2 + "</td></tr>"					
				+ "<tr><td width=25%>City:</td><td width=25%>" + item.vendorCity + "</td><td width=25%>State:</td><td width=25%>" + me.vendorState.lastBlurValue + "</td></tr>"
				+ "<tr><td width=25%>Zip:</td><td width=25%>" + item.vendorZip + "</td><td width=25%>Contact Name:</td><td width=25%>" + item.vendorContactName + "</td></tr>"
				+ "<tr><td width=25%>Phone:</td><td width=25%>" + item.vendorPhoneNumber + "</td><td width=25%>Email:</td><td width=25%>" + item.vendorEmail + "</td></tr>"					
				+ "<tr><td width=25%>Reason For Request:</td><td width=75% colspan=7>" + item.reasonForRequest + "</td></tr>"
				+ "<tr><td width=25%>Requisition Type:</td><td width=75% colspan=7>" + item.requisitionType + "</td></tr>"
				+ "<tr><td width=25%>Urgency:</td><td width=75% colspan=7>" + item.urgency + "</td></tr>"
				+ "<tr><td width=25%>Life Span:</td><td width=75% colspan=7>" + item.lifeSpan + "</td></tr>"					
				+ "<tr><td colspan=8 align=center><b>Item Information</b></td></tr>"					
				+ "<tr><td width=95% colspan=8><table border=1 cellspacing=0 cellpadding=5 style='font-family: Verdana; font-size: 8pt;border-color:Gray;border-width:1px;border-style:Solid;border-collapse:collapse;'>"
                + "<tr><td width=30 align=center><b>#</b></td>"
                + "<td width=100 align=center><b>Item Number</b></td>"
                + "<td width=100 align=center><b>Item Description</b></td>"
				+ "<td width=100 align=center><b>GL Account No</b></td>"
				+ "<td width=100 align=center><b>UOM</b></td>"
				+ "<td width=100 align=center><b>Manufactured</b></td>"
				+ "<td width=100 align=center><b>Quantity</b></td>"
                + "<td width=100 align=center><b>Price</b></td></tr>";
				
			for (var index = 0; index < me.poRequisitionDetails.length; index++) {
				htmlContent += "<tr><td width=30 align=center>" + (index + 1) + "</td>"
	                + "<td width='100'>" + $(me.itemGrid.rows[index].getElement("number")).text() + "</td>"
	                + "<td width='100'>" + $(me.itemGrid.rows[index].getElement("description")).text() + "</td>"
					+ "<td width='100'>" + $(me.itemGrid.rows[index].getElement("account")).text() + "</td>"
					+ "<td width='100'>" + $(me.itemGrid.rows[index].getElement("unit")).text() + "</td>"
					+ "<td width='100'>" + $(me.itemGrid.rows[index].getElement("manufactured")).text() + "</td>"
					+ "<td width='100' align='right'>" + $(me.itemGrid.rows[index].getElement("quantity")).text() + "</td>"
	                + "<td width='100' align='right'>" + $(me.itemGrid.rows[index].getElement("price")).text() + "</td></tr>";
			}
				
			htmlContent += "</table></td></tr><tr><td colspan=8 align=center><b>Shipping Information</b></td></tr>"
				+ "<tr><td width=25%>Company:</td><td width=25%>" + me.company.lastBlurValue + "</td><td width=25%>Job:</td><td width=25%>" + me.shippingJob.lastBlurValue + "</td></tr>"
				+ "<tr><td width=25%>Address 1:</td><td width=25%>" + item.shipToAddress1 + "</td><td width=25%>Address 2:</td><td width=25%>" + item.shipToAddress2 + "</td></tr>"
				+ "<tr><td width=25%>City:</td><td width=25%>" + item.shipToCity + "</td><td width=25%>State:</td><td width=25%>" + me.shippingState.lastBlurValue + "</td></tr>"
				+ "<tr><td width=25%>Zip:</td><td width=25%>" +  item.shipToZip + "</td><td width=25%>Fax:</td><td width=25%>" + item.shipToFax + "</td></tr>"
				+ "<tr><td width=25%>Phone:</td><td width=75% colspan=7>" + item.shipToPhone + "</td></tr>"
				+ "</table></body></html>";

			$("#iFramePrint").contents().find("html").html(htmlContent);
			$("#iFramePrint").get(0).contentWindow.focus();
			$("#iFramePrint").get(0).contentWindow.print();
		},
				
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			disablePopup();
			if (me.requisitionGrid.activeRowIndex >= 0)
				me.poRequisitionId = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex].id;
			
			me.itemGrid.body.deselectAll();
			me.wizardCount = 0;	
			me.status = "";
			me.setStatus("Loaded");
		},
		
		actionSendRequisitionItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;
			
			$("#messageToUser").text("Sending Requisition");
			me.status = "SendRequisition";
			me.actionSaveItem();
		},

		actionResendRequisitionItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Resending Requisition");
			me.status = "ResendRequisition";
			me.actionSaveItem();
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			var item = [];
			var index = me.requisitionGrid.activeRowIndex;

			if (me.status == "NewPORequisition" || me.status == "EditPORequisition") {
				me.validator.forceBlur();
	
				// Check to see if the data entered is valid
				if (!me.validatePORequisition()) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}

				disablePopup();
				me.itemGrid.body.deselectAll();

				item = new fin.pur.poRequisition.PORequisition(
					me.poRequisitionId
					, (me.status == "NewPORequisition" ? 1 : me.requisitionGrid.data[index].statusType)
					, (me.status == "NewPORequisition" ? parent.fin.appUI.houseCodeId : me.requisitionGrid.data[index].houseCode)
					, (me.shippingJob.indexSelected == -1 ? 0 : me.houseCodeJobs[me.shippingJob.indexSelected].id)
					, me.shippingAddress1.getValue()
					, me.shippingAddress2.getValue()
					, me.shippingCity.getValue()
					, me.stateTypes[me.shippingState.indexSelected].id
					, me.shippingZip.getValue()
					, me.shippingPhone.getValue()
					, me.shippingFax.getValue()
					, me.requestorName.getValue()
					, me.requestorEmail.getValue()
					, me.requestedDate.lastBlurValue
					, me.deliveryDate.lastBlurValue
					, me.vendorName.lastBlurValue
					, me.vendorAddress1.getValue()
					, me.vendorAddress2.getValue()
					, me.vendorCity.getValue()
					, me.stateTypes[me.vendorState.indexSelected].id
					, me.vendorZip.getValue()
					, me.vendorContactName.getValue()
					, me.vendorPhone.getValue()
					, me.vendorEmail.getValue()
					, me.reasonForRequest.getValue()
					, $("input[name='RequisitionType']:checked").val()
					, $("input[name='Urgency']:checked").val()
					, $("input[name='LifeSpan']:checked").val()
					, ""
					);

				$("#messageToUser").text("Saving");
			}
			else {
				item = me.requisitionGrid.data[index];
				item.statusType = 2;
			}
					
			var xml = me.saveXmlBuildPORequisition(item);
			
			if (xml == "") 
				return;
			
			me.setStatus("Saving");			
			$("#pageLoading").fadeIn("slow");
	
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
														
			return true;
		},
		
		saveXmlBuildPORequisition: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pur.poRequisition.PORequisition}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.status == "NewPORequisition" || me.status == "EditPORequisition") {
				xml += '<purPORequisition';
				xml += ' id="' + item.id + '"';
				xml += ' statusType="' + item.statusType + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' deliveryDate="' + item.deliveryDate + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(item.vendorAddressLine1) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(item.vendorAddressLine2) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(item.vendorCity) + '"';
				xml += ' vendorStateType="' + item.vendorStateType + '"';
				xml += ' vendorZip="' + item.vendorZip + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(item.vendorContactName) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(item.vendorPhoneNumber, true) + '"';
				xml += ' vendorEmail="' + item.vendorEmail + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
				xml += ' requisitionType="' + item.requisitionType + '"';
				xml += ' urgency="' + item.urgency + '"';
				xml += ' lifeSpan="' + item.lifeSpan + '"';
				xml += ' chargeToPeriod="' + item.chargeToPeriod + '"';
				xml += ' houseCode="' + item.houseCode + '"';
				xml += ' houseCodeJob="' + item.houseCodeJob + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(item.shipToAddress1) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(item.shipToAddress2) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(item.shipToCity) + '"';
				xml += ' shipToState="' + item.shipToState + '"';
				xml += ' shipToZip="' + item.shipToZip + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(item.shipToPhone, true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(item.shipToFax, true) + '"';
				xml += '/>';
				
				for (var index = 0; index < me.itemGrid.data.length; index++) {
					if ($("#selectInputCheck" + index)[0].checked) {
						xml += '<purPORequisitionDetail';
						xml += ' id="' + (me.status == "NewPORequisition" ? "0" : me.itemGrid.data[index].id) + '"';
						xml += ' poRequisitionId="' + me.poRequisitionId + '"';
						xml += ' number="' + me.itemGrid.data[index].number + '"';
						xml += ' description="' + me.itemGrid.data[index].description + '"';
						xml += ' account="' + me.itemGrid.data[index].account.id + '"';
						xml += ' uom="' + me.itemGrid.data[index].unit + '"';
						xml += ' manufactured="' + me.itemGrid.data[index].manufactured + '"';
						xml += ' quantity="' + me.itemGrid.data[index].quantity + '"';
						xml += ' price="' + me.itemGrid.data[index].price + '"';
						xml += '/>';
					}
				}
			}
			else {
				xml += '<purPORequisitionEmailNotification';
				xml += ' id="' + me.poRequisitionId + '"';
				xml += ' statusType="2"';
				xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(me.company.getValue()) + '"';
				xml += ' houseCodeJobTitle="' + me.shippingJob.lastBlurValue + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(item.shipToAddress1) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(item.shipToAddress2) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(item.shipToCity) + '"';
				xml += ' shipToStateTitle="' + me.shippingState.lastBlurValue + '"';
				xml += ' shipToZip="' + item.shipToZip + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(item.shipToPhone, true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(item.shipToFax, true) + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' deliveryDate="' + item.deliveryDate + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(item.vendorAddressLine1) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(item.vendorAddressLine2) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(item.vendorCity) + '"';
				xml += ' vendorStateTitle="' + me.vendorState.lastBlurValue + '"';
				xml += ' vendorZip="' + item.shipToZip + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(item.vendorContactName) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(item.vendorPhoneNumber, true) + '"';
				xml += ' vendorEmail="' + item.vendorEmail + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
				xml += ' requisitionType="' + item.requisitionType + '"';
				xml += ' urgency="' + item.urgency + '"';
				xml += ' lifeSpan="' + item.lifeSpan + '"';
				xml += ' chargeToPeriod=""';
				xml += ' action="' + me.status + '"';
				xml += '/>';
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
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				$(args.xmlNode).find("*").each(function () {
					switch (this.tagName) {
						case "PurPORequisition":
							if (me.status == "NewPORequisition") {
								item.id = parseInt($(this).attr("id"), 10);
								me.poRequisitions.push(item);
								me.requisitionGrid.setData(me.poRequisitions);
								me.requisitionGrid.body.select(me.poRequisitions.length - 1);
							}
							else {
								me.poRequisitions[me.lastSelectedRowIndex] = item;
								me.requisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);

								if (me.status == "SendRequisition" || me.status == "ResendRequisition") {
									$("#AnchorResendRequisition").show();
									$("#AnchorSendRequisition").hide();
									$("#AnchorEdit").hide();
									$("#AnchorView").show();
									$("#VendorInfo").hide();
									$("#CategoryInfo").hide();
									
									me.anchorSave.display(ui.cmn.behaviorStates.disabled);
									me.setReadOnly(true);
								}
							}
						break;
					}
				});
				
				me.status = "";
				me.modified(false);
				me.setStatus("Saved");
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while updating PO Requisition details: " + $(args.xmlNode).attr("message"));				
			}
			
			$("#pageLoading").fadeOut("slow");
		},	
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
	var popupWidth = windowWidth - 150;
	var popupHeight = windowHeight - 120;	

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
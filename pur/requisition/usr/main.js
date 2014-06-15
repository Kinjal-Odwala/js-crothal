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
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\PORequisition";
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
			
			fin.pur.poRequisitionUi.requisitionGrid.setHeight($(window).height() - 135);
			fin.pur.poRequisitionUi.itemGrid.setHeight($(window).height() - 245);
			$("#GeneralInfo").height($(window).height() - 195);
			$("#ShippingInfo").height($(window).height() - 195);
		},
		
		defineFormControls: function() {
			var me = this;
			
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
			
			me.requisitionGrid = new ui.ctl.Grid({
				id: "RequisitionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.requisitionGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 250);
			me.requisitionGrid.addColumn("requestorEmail", "requestorEmail", "Requestor Email", "Requestor Email", 200);		
			me.requisitionGrid.addColumn("requestedDate ", "requestedDate", "Requested Date", "Requested Date", 150);
			me.requisitionGrid.addColumn("deliveryDate", "deliveryDate", "Delivery Date", "Delivery Date", 150);
			me.requisitionGrid.addColumn("reasonForRequest", "reasonForRequest", "Reason For Request", "Reason For Request", null);
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
			
			me.itemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function(data) {
								
				var index = me.itemGrid.rows.length - 1;
				if (me.itemGrid.data[index].itemSelect)
                	return "<center><input type=\"checkbox\" checked=\"true\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" /></center>";
				else
				    return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" /></center>";
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
			
			me.items = [];
			me.itemStore = me.cache.register({
				storeId: "purPurchaseOrderItems",
				itemConstructor: fin.pur.poRequisition.Item,
				itemConstructorArgs: fin.pur.poRequisition.itemArgs,
				injectionArray: me.items,
				lookupSpec: { account: me.accounts }	
			});
			
			me.poRequisitionDetails = [];
			me.poRequisitionDetailStore = me.cache.register({
				storeId: "purPORequisitionDetails",
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

			//me.setLoadCount();
			me.poRequisitionStore.fetch("houseCode:" + parent.fin.appUI.houseCodeId, me.poRequisitionsLoaded, me);
		},
		
		poRequisitionsLoaded: function(me, activeId) {
				
			me.requisitionGrid.setData(me.poRequisitions);			
			//me.checkLoadCount();
		},
		
		loadPOItems: function() {
			var me = this;
			
			$("#pageLoading").fadeIn("slow");	
			me.itemStore.reset();		
			me.itemStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId + ",catalogId:" + me.catalogId + ",orderId:0,accountId:" + me.accountId + ",searchValue:" + me.searchItem.getValue(), me.poItemsLoaded, me);
			me.searchItem.setValue("");
		},
		
		poItemsLoaded: function(me, activeId) {	
			
			for (var index = 0; index < me.items.length; index++) {
					me.items[index].id = 0				
			}
				
			if (me.status == "EditPORequisition") {
				for (var index = 0; index < me.poRequisitionDetails.length; index++) {				
					var item = new fin.pur.poRequisition.PORequisitionDetail({ 
					id: me.poRequisitionDetails[index].id,
					itemSelect: me.poRequisitionDetails[index].itemSelect, 
					poRequisitionId: me.poRequisitionDetails[index].poRequisitionId,
					account: me.poRequisitionDetails[index].account,
					number: me.poRequisitionDetails[index].number,
					description: me.poRequisitionDetails[index].description,
					unit: me.poRequisitionDetails[index].unit,
					manufactured: me.poRequisitionDetails[index].manufactured,
					price: me.poRequisitionDetails[index].price,
					quantity: me.poRequisitionDetails[index].quantity
					});
					me.items.push(item);
				}
			}
			
			me.itemGrid.setData(me.items);
			$("#pageLoading").fadeOut("slow");
		},
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			if (me.persons.length > 0) {
				me.users = me.persons.slice();				
				me.requestorName.text.readOnly = true;
				//me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + " [" + me.session.propertyGet("userName") + "]");
				me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");				
				//me.requestedDate.setValue(me.currentDate());								
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
			}
			else 
				me.poRequisitionId = 0;
		},	
		
		poRequisitonDetailsLoaded: function(me, activeId) {
			
			//me.itemGrid.body.deselectAll();
			me.itemGrid.setData(me.poRequisitionDetails);
			me.checkLoadCount();
		},
		
		vendorCheck: function() {
			var me = this;
			
			me.vendorStore.reset();
			if(me.vendorName.getValue() != "") {
				//me.setLoadCount();
				$("#VendorNameText").addClass("Loading");
				$("#pageLoading").fadeIn("slow");
				me.vendorStore.reset();
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
			}
			
			$("#VendorNameText").removeClass("Loading");
			$("#pageLoading").fadeOut("slow");			
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
			if(me.vendorId == 0)
				me.catalog.setData([]);
			else
				me.catalog.setData(me.catalogs);
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
				
				//me.itemGrid.body.deselectAll();
				valid = me.validator.queryValidity(true);
				
				if (!me.itemNumber.valid
					|| !me.itemDescription.valid
					|| !me.account.valid
					|| !me.price.valid
					|| !me.quantity.valid
					|| !me.uom.valid
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
				alert('Please select the House Code before adding the new PO Requisition.')
				return true;
			}
			
			loadPopup();
			
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);
			me.itemGrid.setData([]);
			me.requisitionGrid.body.deselectAll();
			//me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + " [" + me.session.propertyGet("userName") + "]");
			me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");
			me.requestorEmail.setValue(me.users[0].email);
			me.requestedDate.setValue(me.currentDate());
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
			
			me.poRequisitionId = 0;
			me.status = "NewPORequisition";
			me.wizardCount = 1;
			me.actionShowWizard();
			me.modified(false);
			me.setStatus("Loaded");
		},
		
		actionEditItem: function() {
			var me = this;
			var itemIndex = 0;			
			var name;
						
			if (parent.fin.appUI.houseCodeId == 0) {
				alert('Please select the House Code before adding the new PO Requisition.')
				return true;
			}
			
			if (me.requisitionGrid.activeRowIndex == -1) {
				alert('Please select PO Requisition to edit.')
				return true;
			}
			
			loadPopup();			
			
			if (me.requisitionGrid.data[me.lastSelectedRowIndex] != undefined) {
				
				me.requestorName.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].requestorName);
				me.requestorEmail.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].requestorEmail);
				me.requestedDate.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].requestedDate);
				me.deliveryDate.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].deliveryDate);
				me.vendorName.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle);
				me.vendorAddress1.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorAddressLine1);
				me.vendorAddress2.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorAddressLine2);
				me.vendorCity.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorCity);
				
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorStateType.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.vendorState.select(itemIndex, me.vendorState.focused);
				
				me.vendorZip.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorZip);
				me.vendorContactName.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorContactName);
				me.vendorPhone.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorPhoneNumber);
				me.vendorEmail.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorEmail);
				me.reasonForRequest.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].reasonForRequest);
				
				if (me.requisitionGrid.data[me.lastSelectedRowIndex].requisitionType == "SpecialSupply") 
					$('#RequisitionTypeSpecialSupply').attr('checked', true);
				else 
					if (me.requisitionGrid.data[me.lastSelectedRowIndex].requisitionType == "OffContract") 
						$('#RequisitionTypeOffContract').attr('checked', true);
				
				if (me.requisitionGrid.data[me.lastSelectedRowIndex].urgency == "Urgent") 
					$('#UrgencyUrgent').attr('checked', true);
				else 
					if (me.requisitionGrid.data[me.lastSelectedRowIndex].urgency == "NotUrgent") 
						$('#UrgencyNotUrgent').attr('checked', true);
				
				if (me.requisitionGrid.data[me.lastSelectedRowIndex].lifeSpan == "Permanent") 
					$('#LifeSpanPermanent').attr('checked', true);
				else 
					if (me.requisitionGrid.data[me.lastSelectedRowIndex].lifeSpan == "Temporary") 
						$('#LifeSpanTemporary').attr('checked', true);
				
				me.vendor.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle);
				
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].houseCode.toString(), me.houseCodes);
				if (itemIndex != undefined) 
					me.company.setValue(me.houseCodes[itemIndex].name);
				
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].houseCodeJob.toString(), me.houseCodeJobs);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.shippingJob.select(itemIndex, me.shippingJob.focused);
				
				me.shippingAddress1.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToAddress1);
				me.shippingAddress2.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToAddress2);
				me.shippingCity.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToCity);
				
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToState.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined) 
					me.shippingState.select(itemIndex, me.shippingState.focused);
				
				me.shippingState.select(0, me.shippingState.focused);
				me.shippingZip.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToZip);
				me.shippingPhone.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToPhone);
				me.shippingFax.setValue(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToFax);
				
				me.setLoadCount();
				//me.itemGrid.setData([]);
				me.poRequisitionDetailStore.reset();
				me.poRequisitionDetailStore.fetch("userId:[user],pORequisitionId:" + me.poRequisitionId, me.poRequisitonDetailsLoaded, me);
				me.vendorStore.reset();
				me.vendorStore.fetch("searchValue:" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle + ",vendorStatus:-2,userId:[user]", me.vendorsLoad, me);
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
					me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					$("#Header").text("Shipping Information");
					break;
			}

			me.resizeControls();
		},
		
		actionPrintItem: function() {
			var me = this;
			var itemIndex;			
			var vendorState = "";								
			var company = "";
			var shippingJob = "";
			var shippingState = "";
			
			if (me.requisitionGrid.activeRowIndex == -1) {
				alert('Please select PO Requisition to print.')
				return true;
			}

			var htmlContent = "<html><head><link rel='stylesheet' type='text/css' href='style.css'></head><body>";
			
			if (me.requisitionGrid.data[me.lastSelectedRowIndex] != undefined) {
				
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].vendorStateType.toString(), me.stateTypes);
				if(itemIndex >= 0 && itemIndex != undefined)
					vendorState = me.stateTypes[itemIndex].name;
					
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].houseCode.toString(), me.houseCodes);
				if(itemIndex != undefined)
					company = me.houseCodes[itemIndex].name;
					
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].houseCodeJob.toString(), me.houseCodeJobs);
				if(itemIndex >= 0 && itemIndex != undefined)
					shippingJob = me.houseCodeJobs[itemIndex].jobNumber + " - " + me.houseCodeJobs[itemIndex].jobTitle;
					
				itemIndex = ii.ajax.util.findIndexById(me.requisitionGrid.data[me.lastSelectedRowIndex].shipToState.toString(), me.stateTypes);				
				if(itemIndex >= 0 && itemIndex != undefined)
					shippingState = me.stateTypes[itemIndex].name;
					
				htmlContent += "<center><b><span style='font-family: Verdana; font-size: 12pt;'>PO Requisitions</span></b></center></br>"
					+ "<table width=100% border=1 cellspacing=0 cellpadding=5 style='font-family: Verdana; font-size: 8pt;border-color:Gray;border-width:1px;border-style:Solid;border-collapse:collapse;'>"
	                + "<tr><td width=25%>House Code:</td><td width=75% colspan=7>" + parent.fin.appUI.houseCodeBrief + "</td></tr>"
					+ "<tr><td colspan=8 align=center><b>Requestor Details</b></td></tr>"
	                + "<tr><td width=25%>Requestor Name:</td><td width=75% colspan=7>" + me.requestorName.getValue() + "</td></tr>"
					+ "<tr><td width=25%>Requestor Email:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].requestorEmail + "</td></tr>"
   				    + "<tr><td width=25%>Requested Date:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].requestedDate + "</td><td width=25%>Delivery Date:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].deliveryDate + "</td></tr>"					
					+ "<tr><td colspan=8 align=center><b>Vendor Details</b></td></tr>"
					+ "<tr><td width=25%>Name:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle + "</td></tr>"
					+ "<tr><td width=25%>Address 1:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorAddressLine1 + "</td><td width=25%>Address 2:</td><td width=25%>" +  me.requisitionGrid.data[me.lastSelectedRowIndex].vendorAddressLine2 + "</td></tr>"					
					+ "<tr><td width=25%>City:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorCity + "</td><td width=25%>State:</td><td width=25%>" + vendorState + "</td></tr>"
					+ "<tr><td width=25%>Zip:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorZip + "</td><td width=25%>Contact Name:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorContactName + "</td></tr>"
					+ "<tr><td width=25%>Phone:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorPhoneNumber + "</td><td width=25%>Email:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorEmail + "</td></tr>"					
					+ "<tr><td width=25%>Reason For Request:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].reasonForRequest + "</td></tr>"
					+ "<tr><td width=25%>Requisition Type:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].requisitionType + "</td></tr>"
					+ "<tr><td width=25%>Urgency:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].urgency + "</td></tr>"
					+ "<tr><td width=25%>Life Span:</td><td width=75% colspan=7>" + me.requisitionGrid.data[me.lastSelectedRowIndex].lifeSpan + "</td></tr>"					
					+ "<tr><td colspan=8 align=center><b>PO Requisition Item Information</b></td></tr>"					
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
			                + "<td width=100>" + $(me.itemGrid.rows[index].getElement("number")).text() + "</td>"
			                + "<td width=100>" + $(me.itemGrid.rows[index].getElement("description")).text() + "</td>"
							+ "<td width=100>" + $(me.itemGrid.rows[index].getElement("account")).text() + "</td>"
							+ "<td width=100>" + $(me.itemGrid.rows[index].getElement("unit")).text() + "</td>"
							+ "<td width=100>" + $(me.itemGrid.rows[index].getElement("manufactured")).text() + "</td>"
							+ "<td width=100>" + $(me.itemGrid.rows[index].getElement("quantity")).text() + "</td>"
			                + "<td width=100>" + $(me.itemGrid.rows[index].getElement("price")).text() + "</td></tr>";
					}
					
					htmlContent += "</table></td></tr><tr><td colspan=8 align=center><b>Shipping Information</b></td></tr>"
					+ "<tr><td width=25%>Company:</td><td width=25%>" + company + "</td><td width=25%>Job:</td><td width=25%>" + shippingJob + "</td></tr>"
					+ "<tr><td width=25%>Address 1:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].shipToAddress1 + "</td><td width=25%>Address 2:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].shipToAddress2 + "</td></tr>"
					+ "<tr><td width=25%>City:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].shipToCity + "</td><td width=25%>State:</td><td width=25%>" + shippingState + "</td></tr>"
					+ "<tr><td width=25%>Zip:</td><td width=25%>" +  me.requisitionGrid.data[me.lastSelectedRowIndex].shipToZip + "</td><td width=25%>Fax:</td><td width=25%>" + me.requisitionGrid.data[me.lastSelectedRowIndex].shipToFax + "</td></tr>";
			}		
			
			htmlContent += "</table></body></html>";

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
			
			me.setLoadCount();
			me.accountStore.reset();
			me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
			me.itemGrid.body.deselectAll();
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
				if (!me.validatePORequisition()) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
			}
			
			disablePopup();
			
			me.itemGrid.body.deselectAll();
			
			if (me.status != "") {		
				
				me.setStatus("Saving");			
				$("#messageToUser").text("Saving");
				$("#pageLoading").fadeIn("slow");
			
				var xml = me.saveXmlBuildPORequisition(item);
				
				if (xml == "") 
					return;
				
		
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
				xml += ' id="' + me.poRequisitionId + '"';
				
				if (me.status == "NewPORequisition")				
					xml += ' houseCode="' + parent.fin.appUI.houseCodeId + '"';				
				else if (me.status == "EditPORequisition")
					xml += ' houseCode="' + me.requisitionGrid.data[rowIndex].houseCode + '"';				
				
				xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(me.company.getValue()) + '"';
				xml += ' houseCodeJob="' + (me.shippingJob.indexSelected == -1 ? 0 : me.houseCodeJobs[me.shippingJob.indexSelected].id) + '"';
				xml += ' houseCodeJobTitle="' + (me.shippingJob.indexSelected == -1 ? '' : me.houseCodeJobs[me.shippingJob.indexSelected].jobNumber + ' - ' + me.houseCodeJobs[me.shippingJob.indexSelected].jobTitle) + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(me.shippingAddress1.getValue()) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(me.shippingAddress2.getValue()) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(me.shippingCity.getValue()) + '"';
				xml += ' shipToState="' + me.stateTypes[me.shippingState.indexSelected].id + '"';
				xml += ' shipToStateTitle="' + me.stateTypes[me.shippingState.indexSelected].name + '"';
				xml += ' shipToZip="' + me.shippingZip.getValue() + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(me.shippingPhone.getValue(), true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(me.shippingFax.getValue(), true) + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(me.requestorName.getValue()) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(me.requestorEmail.getValue()) + '"';
				xml += ' requestedDate="' + me.requestedDate.lastBlurValue + '"';
				xml += ' deliveryDate="' + me.deliveryDate.lastBlurValue + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(me.vendorName.getValue()) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(me.vendorAddress1.getValue()) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(me.vendorAddress2.getValue()) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(me.vendorCity.getValue()) + '"';
				xml += ' vendorStateType="' + me.stateTypes[me.vendorState.indexSelected].id + '"';
				xml += ' vendorStateTitle="' + me.stateTypes[me.vendorState.indexSelected].name + '"';
				xml += ' vendorZip="' + me.vendorZip.getValue() + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(me.vendorContactName.getValue()) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(me.vendorPhone.getValue()) + '"';
				xml += ' vendorEmail="' + me.vendorEmail.getValue() + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(me.reasonForRequest.getValue()) + '"';
				xml += ' requisitionType="' + $("input[name='RequisitionType']:checked").val() + '"';
				xml += ' urgency="' + $("input[name='Urgency']:checked").val() + '"';
				xml += ' lifeSpan="' + $("input[name='LifeSpan']:checked").val() + '"';				
				xml += ' chargeToPeriod=""';
				xml += '/>';
			}
			
			for (var index = 0; index < me.itemGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					xml += '<purPORequisitionDetail';
					
					if (me.status == "NewPORequisition") {
						xml += ' id="0"';
					}
					else if (me.status == "EditPORequisition") {
						xml += ' id="' +  me.itemGrid.data[index].id + '"';
					}
					
					xml += ' poRequisitionId="' + me.poRequisitionId + '"';
					xml += ' account="' + me.itemGrid.data[index].account.id + '"';
					xml += ' accountTitle="' + me.itemGrid.data[index].account.name+ '"';
					xml += ' number="' + me.itemGrid.data[index].number + '"';
					xml += ' description="' + me.itemGrid.data[index].description + '"';
					xml += ' price="' + me.itemGrid.data[index].price + '"';
					xml += ' quantity="' + me.itemGrid.data[index].quantity + '"';
					xml += ' uom="' + me.itemGrid.data[index].unit + '"';
					xml += ' manufactured="' + me.itemGrid.data[index].manufactured + '"';
					xml += '/>';
				}
			} 
			
			xml += '<poRequisitionNotification';
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
				$(args.xmlNode).find("*").each(function () {

					switch (this.tagName) {
						case "PurPORequisition":

							var id = parseInt($(this).attr("id"), 10);
							var housecode = "";
							
							 if (me.status == "NewPORequisition")				
								housecode = parent.fin.appUI.houseCodeId;
							 else if (me.status == "EditPORequisition") 
								housecode = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex].houseCode;
				
							item = new fin.pur.poRequisition.PORequisition(
								id
								, housecode
								, me.company.getValue()
								, (me.shippingJob.indexSelected == -1 ? 0 : me.houseCodeJobs[me.shippingJob.indexSelected].id)
								, (me.shippingJob.indexSelected == -1 ? '' : me.houseCodeJobs[me.shippingJob.indexSelected].jobNumber + ' - ' + me.houseCodeJobs[me.shippingJob.indexSelected].jobTitle)
								, me.shippingAddress1.getValue()
								, me.shippingAddress2.getValue()
								, me.shippingCity.getValue()
								, me.stateTypes[me.shippingState.indexSelected].id
								, me.stateTypes[me.shippingState.indexSelected].name
								, me.shippingZip.getValue()
								, me.shippingPhone.getValue()
								, me.shippingFax.getValue()
								, me.requestorName.getValue()
								, me.requestorEmail.getValue()
								, me.requestedDate.lastBlurValue
								, me.deliveryDate.lastBlurValue
								, me.vendorName.getValue()
								, me.vendorAddress1.getValue()
								, me.vendorAddress2.getValue()
								, me.vendorCity.getValue()
								, me.stateTypes[me.vendorState.indexSelected].id
								, me.stateTypes[me.vendorState.indexSelected].name
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

							if (me.requisitionGrid.activeRowIndex < 0 && me.status == "NewPORequisition") {
								me.poRequisitions.push(item);
								me.requisitionGrid.setData(me.poRequisitions);
								me.requisitionGrid.body.select(me.poRequisitions.length - 1);
							}
							else if (me.requisitionGrid.activeRowIndex >= 0) {
								me.poRequisitions[me.lastSelectedRowIndex] = item;
								me.requisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}							
							
							me.setLoadCount();
							me.accountStore.reset();
							me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
			
							break;
					}
				});

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

function main() {

	fin.pur.poRequisitionUi = new fin.pur.poRequisition.UserInterface();
	fin.pur.poRequisitionUi.resize();
	fin.houseCodeSearchUi = fin.pur.poRequisitionUi;
}
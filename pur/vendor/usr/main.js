ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.vendor.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );

ii.Class({
    Name: "fin.pur.vendor.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.vendorId = 0;
			me.status = "";
			me.lastSelectedRowIndex = -1;
			me.validateControl = false;
			
			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\Vendors";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);	
			
			me.sendMethodId.fetchingData();
			me.poSendMethodStore.fetch("userId:[user]", me.poSendMethodLoaded, me);
			me.stateType.fetchingData();					
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);			
			me.itemStatusesLoaded();	
			me.modified(false);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},	
		
		authorizationProcess: function fin_pur_vendor_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.vendorsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			$("#pageLoading").hide();
			
			me.controlVisible();

			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pur_vendor_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			fin.purVendorUi.vendorGrid.setHeight($(window).height() - 105);
			$("#vendorDetailContentArea").height($(window).height() - 148);
			

			fin.purVendorUi.vendorNumber.resizeText();
			fin.purVendorUi.title.resizeText();
			fin.purVendorUi.addressLine1.resizeText();
			fin.purVendorUi.addressLine2.resizeText();
			fin.purVendorUi.city.resizeText();
			fin.purVendorUi.stateType.resizeText();
			fin.purVendorUi.zip.resizeText();
			fin.purVendorUi.sendMethodId.resizeText();
			fin.purVendorUi.contactName.resizeText();
			fin.purVendorUi.email.resizeText();
			fin.purVendorUi.phoneNumber.resizeText();
			fin.purVendorUi.faxNumber.resizeText();
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			}); 
			
			me.actionMenu
				.addAction({
					id: "saveAction", 
					brief: "Save Vendor (Ctrl+S)", 
					title: "Save the Vendor",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction",
					brief: "New Vendor (Ctrl+N)", 
					title: "Add new Vendor",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo changes to the selected Vendor",
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
			
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
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
			
			me.vendorStatus = new ui.ctl.Input.DropDown.Filtered({
		        id: "VendorStatus",
				formatFunction: function( type ) { return type.name; }
		    });
			
			me.vendorStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.status != "")
						this.valid = true;
					else if (me.vendorStatus.indexSelected == -1)
						this.setInvalid("Please select the correct Status.");
				});

			me.vendorNumber = new ui.ctl.Input.Text({
		        id: "VendorNumber",
				maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });
			
			me.vendorNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.title = new ui.ctl.Input.Text({
		        id: "Title",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.title.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.addressLine1 = new ui.ctl.Input.Text({
		        id: "AddressLine1",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.addressLine1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.addressLine2 = new ui.ctl.Input.Text({
		        id: "AddressLine2",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.city = new ui.ctl.Input.Text({
		        id: "City",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.stateType = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.stateType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.validateControl && me.stateType.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
				
			me.zip = new ui.ctl.Input.Text({
		        id: "Zip",
				maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.zip.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.zip.getValue();
					
					if(enteredText == '') return;

					if(ui.cmn.text.validate.postalCode(enteredText) == false)
						this.setInvalid("Please enter valid postal code. Example: 99999 or 99999-9999.");
				});
			
			me.sendMethodId = new ui.ctl.Input.DropDown.Filtered({
		        id: "SendMethod",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
				
			me.sendMethodId.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.validateControl && me.sendMethodId.indexSelected == -1)
						this.setInvalid("Please select the correct Send Method.");
				});
			
			me.contactName = new ui.ctl.Input.Text({
		        id: "ContactName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.email = new ui.ctl.Input.Text({
		        id: "Email",
				maxLength: 200,
				changeFunction: function() { me.modified(); }
		    });
			
			me.email.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.email.getValue();
					
					if(enteredText == '') return;
					
					var emailArray = enteredText.split(';');
					var emailIndex, emailAddress;
					
					for(emailIndex in emailArray){
						emailAddress = emailArray[emailIndex];
						if (ui.cmn.text.validate.emailAddress(emailAddress) == false) {
							this.setInvalid("Please enter valid Email Address. Use semicolon to separate two addresses.");
						}
					}
				});
			
			me.phoneNumber = new ui.ctl.Input.Text({
		        id: "PhoneNumber",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.phoneNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.phoneNumber.getValue();
					
					if(enteredText == '') return;

					me.phoneNumber.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phoneNumber.text.value;
										
					if(enteredText.length < 14)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
										
			me.faxNumber = new ui.ctl.Input.Text({
		        id: "FaxNumber",
				maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });			
			
			me.faxNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.faxNumber.getValue();
					
					if(enteredText == '') return;

					me.faxNumber.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.faxNumber.text.value;
										
					if(enteredText.length < 14)
						this.setInvalid("Please enter valid fax number. Example: (999) 999-9999");
				});
			
			me.autoEmail = new ui.ctl.Input.Check({
		        id: "AutoEmail",
				changeFunction: function() { me.modified(); }
		    });
				
			me.active = new ui.ctl.Input.Check({
		        id: "VendorActive",
				changeFunction: function() { me.modified(); } 
		    });
			
			me.active.setValue("true");
			
			me.vendorGrid = new ui.ctl.Grid({
				id: "VendorsGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { 
					if (me.status != "new") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});
			
			me.vendorGrid.addColumn("vendorNumber", "vendorNumber", "Vendor#", "Vendor Number", 90);
			me.vendorGrid.addColumn("title", "title", "Title", "Title", null);
			me.vendorGrid.capColumns();
			
			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#VendorStatusText").bind("keydown", me, me.actionSearchItem);			  	        
		},
				
		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.vendor.Vendor,
				itemConstructorArgs: fin.pur.vendor.vendorArgs,
				injectionArray: me.vendors
			});
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pur.vendor.StateType,
				itemConstructorArgs: fin.pur.vendor.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	
			
			me.poSendMethods = [];
			me.poSendMethodStore = me.cache.register({
				storeId: "purPOSendMethodTypes",
				itemConstructor: fin.pur.vendor.POSendMethod,
				itemConstructorArgs: fin.pur.vendor.poSendMethodArgs,
				injectionArray: me.poSendMethods	
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
		
		itemStatusesLoaded: function() {
			me = this;
			
			me.vendorStatuses = [];
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(1, -1, "All"));
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(2, 1, "Active"));
			me.vendorStatuses.push(new fin.pur.vendor.VendorStatus(3, 0, "In Active"));
			
			me.vendorStatus.setData(me.vendorStatuses);
			me.vendorStatus.select(0, me.vendorStatus.focused);
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
				
			if (me.searchInput.getValue().length < 3) {
				me.searchInput.setInvalid("Please enter search criteria (minimum 3 characters).");
				return false;
			}			
			else {
				me.searchInput.valid = true;
				me.searchInput.updateStatus();
			}
			
			$("#messageToUser").text("Loading");		
			$("#pageLoading").show();
 
			me.vendorStore.fetch("searchValue:" + me.searchInput.getValue() 
				+ ",vendorStatus:" + (me.vendorStatus.indexSelected == -1 ? -1 : me.vendorStatuses[me.vendorStatus.indexSelected].number)
				+ ",userId:[user]", me.vendorsLoaded, me);			
		},		
		
		stateTypesLoaded: function(me, activeId) {
			
			me.stateType.setData(me.stateTypes);
			me.validateControl = true;
		},
		
		poSendMethodLoaded: function(me, activeId) {

			me.sendMethodId.setData(me.poSendMethods);
		},
		
		controlVisible: function() {
			var me = this;
			
			if (me.vendorsReadOnly) {
				$("#VendorNumberText").attr('disabled', true);
				$("#TitleText").attr('disabled', true);
				$("#AddressLine1Text").attr('disabled', true);
				$("#AddressLine2Text").attr('disabled', true);
				$("#CityText").attr('disabled', true);
				$("#StateText").attr('disabled', true);
				$("#StateAction").removeClass("iiInputAction");
				$("#ZipText").attr('disabled', true);
				$("#SendMethodText").attr('disabled', true);
				$("#SendMethodAction").removeClass("iiInputAction");
				$("#ContactNameText").attr('disabled', true);
				$("#EmailText").attr('disabled', true);
				$("#PhoneNumberText").attr('disabled', true);
				$("#FaxNumberText").attr('disabled', true);
				$("#AutoEmailCheck").attr('disabled', true);
				$("#VendorActiveCheck").attr('disabled', true);
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		vendorsLoaded: function(me, activeId) {

			me.lastSelectedRowIndex = -1;
			me.resetControls();
			me.vendorGrid.setData(me.vendors);
			me.controlVisible();
			$("#pageLoading").hide();
		},					

		itemSelect: function() {			
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data item to select
			});			
			var me = this;
			var index = args.index;
			var itemIndex = 0;			
			var item = me.vendorGrid.data[index];
			
			if (!parent.fin.cmn.status.itemValid()) {
				me.vendorGrid.body.deselect(index, true);
				return;
			}
			
			me.lastSelectedRowIndex = index;
			me.status = "";
			
			if (item == undefined) 
				return;
			
			if (me.vendorGrid.data[index] != undefined) {

				me.vendorId = me.vendorGrid.data[index].id;		
				me.vendorNumber.setValue(me.vendorGrid.data[index].vendorNumber);
				me.title.setValue(me.vendorGrid.data[index].title);
				me.addressLine1.setValue(me.vendorGrid.data[index].addressLine1 != undefined ? me.vendorGrid.data[index].addressLine1: '');
				me.addressLine2.setValue(me.vendorGrid.data[index].addressLine2 != undefined ? me.vendorGrid.data[index].addressLine2: '');
				me.city.setValue(me.vendorGrid.data[index].city != undefined ? me.vendorGrid.data[index].city : '');
				me.zip.setValue(me.vendorGrid.data[index].zip != undefined ? me.vendorGrid.data[index].zip : '');
				
				itemIndex = ii.ajax.util.findIndexById(me.vendorGrid.data[index].sendMethodId.toString(), me.poSendMethods);
				if(itemIndex >= 0 && itemIndex != undefined)
					me.sendMethodId.select(itemIndex, me.sendMethodId.focused);	
							
				itemIndex = ii.ajax.util.findIndexById(me.vendorGrid.data[index].stateType.toString(), me.stateTypes);				
				if(itemIndex >= 0 && itemIndex != undefined)
					me.stateType.select(itemIndex, me.stateType.focused);	
					
				me.contactName.setValue(me.vendorGrid.data[index].contactName != undefined ? me.vendorGrid.data[index].contactName : '');
				me.email.setValue(me.vendorGrid.data[index].email != undefined ? me.vendorGrid.data[index].email : '');
				me.faxNumber.setValue(me.vendorGrid.data[index].faxNumber != undefined ? me.vendorGrid.data[index].faxNumber : '');
				me.phoneNumber.setValue(me.vendorGrid.data[index].phoneNumber != undefined ? me.vendorGrid.data[index].phoneNumber : '');
				me.autoEmail.setValue(me.vendorGrid.data[index].autoEmail.toString());
				me.active.setValue(me.vendorGrid.data[index].active.toString());
			}
			else
				me.vendorId = 0;
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
			me.vendorId = 0;
			me.vendorNumber.setValue("");
			me.title.setValue("");
			me.addressLine1.setValue("");
			me.addressLine2.setValue("");
			me.city.setValue("");
			me.stateType.setValue("");
			me.zip.setValue("");
			me.sendMethodId.setValue("");
			me.contactName.setValue("");
			me.email.setValue("");
			me.faxNumber.setValue("");
			me.phoneNumber.setValue("");
			me.autoEmail.setValue("false");
			me.active.setValue("true");
			me.validateControl = true;
		},

		actionUndoItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.status = "";
			if (me.lastSelectedRowIndex >= 0) {
				me.vendorGrid.body.select(me.lastSelectedRowIndex);
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
			me.vendorGrid.body.deselectAll();
			me.status = "new";					
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.vendorsReadOnly) return;
			
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
				
			var item = new fin.pur.vendor.Vendor(
				me.vendorId
				, me.vendorNumber.getValue()
				, me.title.getValue()
				, me.addressLine1.getValue()
				, me.addressLine2.getValue()
				, me.city.getValue()
				, me.stateType.data[me.stateType.indexSelected].id
				, me.zip.getValue()
				, me.sendMethodId.data[me.sendMethodId.indexSelected].id
				, me.contactName.getValue()
				, me.email.getValue()
				, me.autoEmail.check.checked				
				, fin.cmn.text.mask.phone(me.faxNumber.getValue(), true)
				, fin.cmn.text.mask.phone(me.phoneNumber.getValue(), true)
				, 1
				, me.active.check.checked
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
				item: {type: fin.pur.vendor.Vendor}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
				
			xml += '<purVendor';
			xml += ' id="' + item.id + '"';
			xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(item.title) + '"';
			xml += ' addressLine1="' + ui.cmn.text.xml.encode(item.addressLine1) + '"';
			xml += ' addressLine2="' + ui.cmn.text.xml.encode(item.addressLine2) + '"';
			xml += ' city="' + ui.cmn.text.xml.encode(item.city) + '"';
			xml += ' stateType="' + item.stateType + '"';
			xml += ' zip="' + item.zip + '"';
			xml += ' sendMethodId="' + item.sendMethodId + '"';				
			xml += ' contactName="' + ui.cmn.text.xml.encode(item.contactName) + '"';
			xml += ' email="' + item.email + '"';
			xml += ' autoEmail="' + item.autoEmail + '"';
			xml += ' faxNumber="' + item.faxNumber + '"';
			xml += ' phoneNumber="' + item.phoneNumber + '"';
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
					
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "purVendor":						
									
							if (me.status == "new") {
								me.vendorId = parseInt($(this).attr("id"), 10);
								item.id = me.vendorId;
								me.vendors.push(item);
								me.lastSelectedRowIndex = me.vendors.length - 1;
							}
							else {
								me.lastSelectedRowIndex = me.vendorGrid.activeRowIndex;
								me.vendors[me.lastSelectedRowIndex] = item;
							}
							
							me.status = "";
							me.vendorGrid.setData(me.vendors);
							me.vendorGrid.body.select(me.lastSelectedRowIndex);
									
							break;	
					}
				});
			}
			else {
				alert("[SAVE FAILURE] Error while updating Vendor Record: " + $(args.xmlNode).attr("message"));
			}
			$("#pageLoading").hide();
		}
	}
});


function main() {
	fin.purVendorUi = new fin.pur.vendor.UserInterface();
	fin.purVendorUi.resize();
}
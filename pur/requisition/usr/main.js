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
			me.vendorNumber = "";
			me.accountId = 0;
			me.catalogId = 0;
			me.lastSelectedRowIndex = -1;		
			me.status = "";
			me.users = [];
			me.wizardCount = 0;
			me.loadCount = 0;
			me.total = 0;
			me.fileName = "";
			me.glAccounts = [];
			me.action = "PORequisition";
			me.currentVendorTitle = "";
			me.vendorsLoading = false;
			me.poRequisitionDetailsTemp = [];

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
			me.initialize();
			me.statusesLoaded(false);
			me.searchTypesLoaded();
			me.setStatus("Loading");
			me.modified(false);

			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			$(window).bind("resize", me, me.resize);
			ui.cmn.behavior.disableBackspaceNavigation();
			$("#houseCodeText").change(function () {
				if (me.approveInProcess)
					me.statusesLoaded($("#houseCodeText").val() === "");
			});

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_pur_poRequisition_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.poRequisitionShow = me.authorizer.isAuthorized(me.authorizePath + "\\PORequisition");
			me.convertPORequisitionToPOShow = me.authorizer.isAuthorized(me.authorizePath + "\\ConvertPORequisitionToPO");
			me.writeInProcess = me.authorizer.isAuthorized(me.authorizePath + "\\WriteInProcess");
			me.approveInProcess = me.authorizer.isAuthorized(me.authorizePath + "\\ApproveInProcess");

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

				if (!me.poRequisitionShow && !me.writeInProcess) {
					$("#AnchorNew").hide();
					$("#AnchorTemplate").hide();
					$("#StatusContainer").hide();
					$("#PORequisitionAction").hide();
				}

				if (!me.convertPORequisitionToPOShow) {
					$("#GeneratePurchaseOrderFromPORequisitionAction").hide();
				}

				if (!me.poRequisitionShow && !me.writeInProcess && me.convertPORequisitionToPOShow) {
					$("#AnchorGeneratePurchaseOrder").show();
					$("#AnchorJDEEntry").show();
					me.action = "GeneratePurchaseOrder";
				}

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
			var me = fin.pur.poRequisitionUi;

			if (me == undefined)
				return;				
			
			me.requisitionGrid.setHeight($(window).height() - 145);
			me.itemGrid.setHeight($(window).height() - 285);
			me.itemReadOnlyGrid.setHeight($(window).height() - 220);
			me.documentGrid.setHeight(100);
			$("#requisitionPopup").height($(window).height() - 110);
			$("#GeneralInfo").height($(window).height() - 210);
			$("#ShippingInfo").height($(window).height() - 210);
			$("#TotalLabel").width($("#ItemGridHeader").width() - 138);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "PORequisitionAction", 
					brief: "PO Requisitions", 
					title: "To list the PO Requisitions",
					actionFunction: function() { me.actionPORequisitionItem(); }
				})
				.addAction({
					id: "GeneratePurchaseOrderFromPORequisitionAction",
					brief: "Generate Purchase Order From PO Requisition", 
					title: "To generate Purchase Order from PO Requisition",
					actionFunction: function() { me.actionGeneratePurchaseOrderFromPORequisition(); }
				});

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
			
			me.anchorCancelRequisition = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelRequisition",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelRequisitionItem(); },
				hasHotState: true
			});
			
			me.anchorGeneratePurchaseOrder = new ui.ctl.buttons.Sizeable({
				id: "AnchorGeneratePurchaseOrder",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate Purchase Order&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGeneratePurchaseOrderItem(); },
				hasHotState: true
			});
			
			me.anchorJDEEntry = new ui.ctl.buttons.Sizeable({
				id: "AnchorJDEEntry",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;JDE Entry&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionJDEEntryItem(); },
				hasHotState: true
			});

			me.anchorPrint = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrint",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Print&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrintItem(); },
				hasHotState: true
			});

			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});

			me.anchorTemplate = new ui.ctl.buttons.Sizeable({
				id: "AnchorTemplate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Templates&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPORequisitionFromTemplate(); },
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

		    me.searchRequestedDate = new ui.ctl.Input.Date({
		        id: "SearchRequestedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.searchRequestedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.searchRequestedDate.text.value;
					
					if (enteredText == "") 
						return;
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
		    	
			me.requisitionGrid = new ui.ctl.Grid({
				id: "RequisitionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});			
			
			me.requisitionGrid.addColumn("requisitionNumber", "requisitionNumber", "Requisition #", "Requisition #", 120);
			me.requisitionGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", 175);
			me.requisitionGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 150);				
			me.requisitionGrid.addColumn("requestedDate ", "requestedDate", "Requested Date", "Requested Date", 150).setSortFunction(function(me, displayProperty, a, b) {
				return fin.cmn.sort.dateSort(me, displayProperty, a, b);
			});
			me.requisitionGrid.addColumn("deliveryDate", "deliveryDate", "Delivery Date", "Delivery Date", 120).setSortFunction(function(me, displayProperty, a, b) {
				return fin.cmn.sort.dateSort(me, displayProperty, a, b);
			});
			me.requisitionGrid.addColumn("vendorTitle", "vendorTitle", "Vendor Title", "Vendor Title", null);
			me.requisitionGrid.addColumn("statusType", "statusType", "Status", "Status", 120, function(statusType) {
				if (statusType == 1)
					return "Open";
				else if (statusType == 2)
					return "In Process";
				else if (statusType == 6)
                	return "Cancelled";
				else if (statusType == 8)
                	return "Approved";
				else if (statusType == 9)
                	return "Completed";				
				else if (statusType == 10)
                	return "Unapproved";
				else if (statusType == 11)
                	return "Completed - PO";
				else if (statusType == 12)
                	return "Completed - JDE";
				else if (statusType == 13)
                	return "Template";
           	});
			me.requisitionGrid.capColumns();
			
			me.requestorName = new ui.ctl.Input.Text({
		        id: "RequestorName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
			});

			me.requestorPhone = new ui.ctl.Input.Text({
			    id: "RequestorPhone",
			    maxLength: 14,
			    changeFunction: function () { me.modified(); }
			});

			me.requestorPhone.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    var enteredText = me.requestorPhone.getValue();

				    me.requestorPhone.text.value = fin.cmn.text.mask.phone(enteredText);
				    enteredText = me.requestorPhone.text.value;

				    if (enteredText == "" && me.requestorPhone.text.readOnly)
						this.valid = true;
					else if (!(ui.cmn.text.validate.phone(enteredText)))
				        this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
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
					
					if ((this.focused || this.touched) && me.vendorState.indexSelected == -1)
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
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.postalCode(enteredText) == false)
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
					
					if (enteredText == "") return;

					me.vendorPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.vendorPhone.text.value;
										
					if (!(ui.cmn.text.validate.phone(enteredText)))
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
				maxLength: 200,
				changeFunction: function() { me.modified(); }
		    });
		    
		    me.urgencyDate = new ui.ctl.Input.Date({
                id: "UrgencyDate",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
            });
            
            me.urgencyDate.makeEnterTab()
                .setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
                .addValidation( function( isFinal, dataMap ) {                  
                    var enteredText = me.urgencyDate.text.value;
                    
					if($("input:radio[name='Urgency']:checked").val() == "Not Urgent" || $('input:radio[name="Urgency"]:checked').length == 0) {
						me.urgencyDate.resetValidation(true);
						return true;
					}
						
                    if (enteredText == "") 
                        return;
                        
                    me.modified();
                    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
                        this.setInvalid("Please enter valid date.");
                });
			
			me.vendor = new ui.ctl.Input.Text({
				id: "Vendor",
				maxLength: 256,
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
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
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
				selectFunction: function(index) {
					if (me.itemGrid.rows[index].getElement("rowNumber").innerHTML == "Add") 
						me.itemGrid.rows[index].getElement("itemSelect").innerHTML = "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poRequisitionUi.calculateTotal(this);\"  checked=\"true\" />";
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
			
			me.alternateDescription = new ui.ctl.Input.Text({
                id: "AlternateDescription",
                maxLength: 256,
                appendToId: "ItemGridControlHolder",
                changeFunction: function() { me.modified(); }
            });
			
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
		        maxLength: 255,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.quantity = new ui.ctl.Input.Text({
		        id: "Quantity",
		        maxLength: 9,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); me.calculateExtendedPrice(); }
		    });
			
			me.quantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				if (me.itemGrid.activeRowIndex != -1) {
					if (!($("#selectInputCheck" + me.itemGrid.activeRowIndex))[0].checked)
						this.valid = true;
				}

				var enteredText = me.quantity.getValue();

				if (enteredText == "") return;

				if (/^[0-9]+(\[0-9]+)?$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Quantity.");
			});
								
			me.price = new ui.ctl.Input.Text({
		        id: "Price",
				maxLength: 19,
				appendToId: "ItemGridControlHolder",
				changeFunction: function() { me.modified(); me.calculateExtendedPrice(); }
		    });
			
			me.price.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				if (me.itemGrid.activeRowIndex != -1) {
					if (!($("#selectInputCheck" + me.itemGrid.activeRowIndex))[0].checked)
						this.valid = true;
				}

				var enteredText = me.price.getValue();

				if (enteredText == "") return;

				if (enteredText != ""  && !(/^\d{1,16}(\.\d{1,2})?$/.test(enteredText)))
					this.setInvalid("Please enter valid Price.");
			});
			
			me.itemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function(data) {
				var index = me.itemGrid.rows.length - 1;
				if (me.itemGrid.data[index].itemSelect)
                	return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poRequisitionUi.calculateTotal(this);\" checked=\"true\" disabled /></center>";
				else
				    return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poRequisitionUi.calculateTotal(this);\" /></center>";
            });
			me.itemGrid.addColumn("number", "number", "Item Number", "Item Number", 120, null, me.itemNumber);
			me.itemGrid.addColumn("description", "description", "Item Description", "Item Description", null, null, me.itemDescription);
			me.itemGrid.addColumn("alternateDescription", "alternateDescription", "Alternate Description", "Alternate Description", 180, null, me.alternateDescription);
			me.itemGrid.addColumn("account", "account", "Gl Account No", "Gl Account No", 140, function( account ) { return account.code + " - " + account.name; }, me.account);
			me.itemGrid.addColumn("unit", "unit", "UOM", "UOM", 50, null, me.uom);
			me.itemGrid.addColumn("manufactured", "manufactured", "Mfg", "Mfg", 120, null, me.manufactured);
			me.itemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 80, null, me.quantity);
			me.itemGrid.addColumn("price", "price", "Price", "Price", 80, null, me.price);
			me.itemGrid.addColumn("extendedPrice", "", "Extended Price", "Extended Price", 120, function(data) {				
				if (!isNaN(data.quantity) && data.price != undefined) {
					var extendedPrice = data.quantity * data.price
					return extendedPrice.toFixed(2);
				}
            });						
			me.itemGrid.capColumns();			
			
			me.itemReadOnlyGrid = new ui.ctl.Grid({
				id: "ItemReadOnlyGrid",
				allowAdds: false			
			});
			
			me.itemReadOnlyGrid.addColumn("number", "number", "Item Number", "Item Number", 120);
			me.itemReadOnlyGrid.addColumn("description", "description", "Item Description", "Item Description", null);
			me.itemReadOnlyGrid.addColumn("alternateDescription", "alternateDescription", "Alternate Description", "Alternate Description", 180);
			me.itemReadOnlyGrid.addColumn("account", "account", "Gl Account No", "Gl Account No", 140, function(account) { return account.code + " - " + account.name;	});
			me.itemReadOnlyGrid.addColumn("unit", "unit", "UOM", "UOM", 50);
			me.itemReadOnlyGrid.addColumn("manufactured", "manufactured", "Mfg", "Mfg", 120);
			me.itemReadOnlyGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 80);
			me.itemReadOnlyGrid.addColumn("price", "price", "Price", "Price", 80);
			me.itemReadOnlyGrid.addColumn("extendedPrice", "", "Extended Price", "Extended Price", 120, function(data) {				
				if (!isNaN(data.quantity) && data.price != undefined) {
					var extendedPrice = data.quantity * data.price
					return extendedPrice.toFixed(2);
				}
            });
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
					
				if (me.shippingZip.getValue() == "") 
					return;

				if (ui.cmn.text.validate.postalCode(me.shippingZip.getValue()) == false)
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
					
					if (enteredText == "") return;
					
					me.shippingPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.shippingPhone.text.value;
										
					if (ui.cmn.text.validate.phone(enteredText) == false)
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
					
					if (enteredText == "") return;
					
					me.shippingFax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.shippingFax.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
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

			me.documentGrid = new ui.ctl.Grid({
				id: "DocumentGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.documentGrid.addColumn("title", "title", "Title", "Title", null);
			me.documentGrid.addColumn("fileName", "fileName", "File Name", "File Name", 350);
			me.documentGrid.capColumns();

			me.documentTitle = new ui.ctl.Input.Text({
				id: "DocumentTitle",
				maxLength: 64,
				changeFunction: function() { me.modified(); }
			});

			me.documentTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
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
				clickFunction: function() { me.actionUploadCancel(); },
				hasHotState: true
			});

			me.templateGrid = new ui.ctl.Grid({
				id: "TemplateGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.templateGrid.addColumn("templateTitle", "templateTitle", "Template Title", "Template Title", null);
			me.templateGrid.capColumns();

			me.anchorGenerateRequisitionFromTemplate = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerateRequisitionFromTemplate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateItem(); },
				hasHotState: true
			});

			me.anchorTemplateCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorTemplateCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateCancel(); },
				hasHotState: true
			});

			me.vendor.text.readOnly = true;
			me.itemNumber.active = false;
			me.itemDescription.active = false;
			me.alternateDescription.active = false;
			me.account.active = false;
			me.uom.active = false;
			me.manufactured.active = false;
			me.price.active = false;
			me.quantity.active = false;
			me.documentTitle.active = false;
			me.setTabIndexes();
		},		

		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pur.poRequisition.HirNode,
				itemConstructorArgs: fin.pur.poRequisition.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
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

			me.poRequisitionTemplates = [];
			me.poRequisitionTemplateStore = me.cache.register({
				storeId: "purPORequisitionTemplates",
				itemConstructor: fin.pur.poRequisition.PORequisition,
				itemConstructorArgs: fin.pur.poRequisition.poRequisitionArgs,
				injectionArray: me.poRequisitionTemplates
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
			
			me.poRequisitionDocuments = [];
			me.poRequisitionDocumentStore = me.cache.register({
				storeId: "purPORequisitionDocuments",
				itemConstructor: fin.pur.poRequisition.PORequisitionDocument,
				itemConstructorArgs: fin.pur.poRequisition.poRequisitionDocumentArgs,
				injectionArray: me.poRequisitionDocuments
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "purFileNames",
				itemConstructor: fin.pur.poRequisition.FileName,
				itemConstructorArgs: fin.pur.poRequisition.fileNameArgs,
				injectionArray: me.fileNames
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
		
		setLoadCount: function() {
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
			
			$("input[name='Urgency']").change(function() { me.modified(); });
			$("#VendorName").bind("keydown", me, me.actionVendorSearch);
			$("#imgAdd").bind("click", function() { me.actionAttachItem(); });
			$("#imgEdit").bind("click", function() { me.actionEditDocumentItem(); });
			$("#imgRemove").bind("click", function() { me.actionRemoveItem(); });
			$("#imgView").bind("click", function() { me.actionViewItem(); });			
			$("#UrgencyUrgent").bind("click", function() {
				$("#LabelUrgencyDate").html("<span class='requiredFieldIndicator'>&#149;</span>Urgency Date:");
 			});
			$("#UrgencyNotUrgent").bind("click", function() { 
				$("#LabelUrgencyDate").html("<span id='nonRequiredFieldIndicator'>Urgency Date:</span>");
				me.urgencyDate.resetValidation(true);
				var urgencyDate = me.urgencyDate.lastBlurValue;
				if (urgencyDate == "" || !(ui.cmn.text.validate.generic(urgencyDate, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
					me.urgencyDate.setValue("");
			});
			$("#SearchInput").bind("keydown", me, me.searchInputChanged);
			
			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorSendRequisition").hide();
			$("#AnchorCancelRequisition").hide();
			$("#AnchorGeneratePurchaseOrder").hide();
			$("#AnchorJDEEntry").hide();
			$("#AnchorPrint").hide();
			$("#AnchorApprove").hide();
		},

		setTabIndexes: function() {
			var me = this;

			me.requestorName.text.tabIndex = 1;
			me.requestorEmail.text.tabIndex = 2;
			me.requestorPhone.text.tabIndex = 3;
			me.requestedDate.text.tabIndex = 4;
			me.deliveryDate.text.tabIndex = 5;
			me.vendorName.text.tabIndex = 6;
			me.vendorAddress1.text.tabIndex = 7;
			me.vendorAddress2.text.tabIndex = 8;
			me.vendorCity.text.tabIndex = 9;
			me.vendorState.text.tabIndex = 10;
			me.vendorZip.text.tabIndex = 11;
			me.vendorContactName.text.tabIndex = 12;
			me.vendorPhone.text.tabIndex = 13;
			me.vendorEmail.text.tabIndex = 14;
			me.reasonForRequest.text.tabIndex = 15;
			//Urgent - 15
			//Not Urgent - 16
			me.urgencyDate.text.tabIndex = 17;
			me.vendor.text.tabIndex = 21;
			me.searchItem.text.tabIndex = 22;
			me.category.text.tabIndex = 23;			
			me.catalog.text.tabIndex = 24;
			me.company.text.tabIndex = 31;
			me.shippingJob.text.tabIndex = 32;
			me.shippingAddress1.text.tabIndex = 33;
			me.shippingAddress2.text.tabIndex = 34;
			me.shippingCity.text.tabIndex = 35;
			me.shippingState.text.tabIndex = 36;
			me.shippingZip.text.tabIndex = 37;
			me.shippingFax.text.tabIndex = 38;
			me.shippingPhone.text.tabIndex = 39;
			me.template.check.tabIndex = 40;
			me.templateTitle.text.tabIndex = 41;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.requestorName.resizeText();
			me.requestorEmail.resizeText();
			me.requestedDate.resizeText();
			me.requestorPhone.resizeText();
			me.deliveryDate.resizeText();
			me.vendorName.resizeText();
			me.vendorAddress1.resizeText();
			me.vendorAddress2.resizeText();
			me.vendorCity.resizeText();
			me.vendorState.resizeText();
			me.vendorZip.resizeText();
			me.vendorContactName.resizeText();
			me.vendorPhone.resizeText();
			me.vendorEmail.resizeText();
			me.reasonForRequest.resizeText();
			me.urgencyDate.resizeText();
			me.vendor.resizeText();
			me.searchItem.resizeText();
			me.category.resizeText();			
			me.catalog.resizeText();
			me.company.resizeText();
			me.shippingJob.resizeText();
			me.shippingAddress1.resizeText();
			me.shippingAddress2.resizeText();
			me.shippingCity.resizeText();
			me.shippingState.resizeText();
			me.shippingZip.resizeText();
			me.shippingFax.resizeText();
			me.shippingPhone.resizeText();
			me.templateTitle.resizeText();
			me.resize();
		},
		
		setReadOnly: function(readOnly) {
			var me = this;

			me.requestorName.text.readOnly = readOnly;
			me.requestorEmail.text.readOnly = readOnly;
			me.requestedDate.text.readOnly = readOnly;
			me.requestorPhone.text.readOnly = readOnly;
			me.deliveryDate.text.readOnly = readOnly;			
			me.vendorName.text.readOnly = readOnly;
			me.vendorAddress1.text.readOnly = readOnly;
			me.vendorAddress2.text.readOnly = readOnly;
			me.vendorCity.text.readOnly = readOnly;
			me.vendorState.text.readOnly = readOnly;
			me.vendorZip.text.readOnly = readOnly;
			me.vendorContactName.text.readOnly = readOnly;
			me.vendorPhone.text.readOnly = readOnly;
			me.vendorEmail.text.readOnly = readOnly;
			me.reasonForRequest.text.readOnly = readOnly;
			me.urgencyDate.text.readOnly = readOnly;
			me.shippingJob.text.readOnly = readOnly;
			me.shippingAddress1.text.readOnly = readOnly;
			me.shippingAddress2.text.readOnly = readOnly;
			me.shippingCity.text.readOnly = readOnly;
			me.shippingState.text.readOnly = readOnly;
			me.shippingZip.text.readOnly = readOnly;
			me.shippingPhone.text.readOnly = readOnly;
			me.shippingFax.text.readOnly = readOnly;
			me.template.check.disabled = readOnly;
			me.templateTitle.text.readOnly = readOnly;

			$("#UrgencyUrgent")[0].disabled = readOnly;
			$("#UrgencyNotUrgent")[0].disabled = readOnly;

			if (readOnly) {
				$("#RequestedDateAction").removeClass("iiInputAction");
				$("#DeliveryDateAction").removeClass("iiInputAction");				
				$("#VendorNameAction").removeClass("iiInputAction");
				$("#VendorStateAction").removeClass("iiInputAction");
				$("#UrgencyDateAction").removeClass("iiInputAction");
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
				$("#UrgencyDateAction").addClass("iiInputAction");
				$("#AccountAction").addClass("iiInputAction");
				$("#ShippingJobAction").addClass("iiInputAction");
				$("#ShippingStateAction").addClass("iiInputAction");
				$("#ItemGrid").show();
				$("#ItemReadOnlyGrid").hide();				
			}
		},

		checkTemplate: function() {
			var me = this;

			if (me.template.check.checked) {
				$("#TemplateContainer").show();
				me.templateTitle.resizeText();
			}
				
			else {
				$("#TemplateContainer").hide();
				me.templateTitle.setValue("");
			}	
		},

		currentDate: function() {
			var currentTime = new Date();
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			
			return month + "/" + day + "/" + year;
		},

		calculateExtendedPrice: function() {
			var me = this;
			var index = me.itemGrid.activeRowIndex;
			var quantity = me.quantity.getValue();
			var price = me.price.getValue();

			if (quantity != "" && !(isNaN(quantity)) && price != "" && !(isNaN(price))) {
				var extendedPrice = parseFloat(quantity) * parseFloat(price);
				$(me.itemGrid.rows[index].getElement("extendedPrice")).text(extendedPrice.toFixed(2));
			}
			else {
				$(me.itemGrid.rows[index].getElement("extendedPrice")).text("");
			}
				
			me.calculateTotal();
		},

		calculateTotal: function(object) {
			var me = this;
			var iIndex = me.itemGrid.activeRowIndex;
			var quantity = me.quantity.getValue();
			var price = me.price.getValue();
			me.total = 0;			

			for (var index = 0; index < me.itemGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0] != undefined && $("#selectInputCheck" + index)[0].checked) {
					if (iIndex == index) {
						if (quantity != "" && !(isNaN(quantity)) && price != "" && !(isNaN(price)))
							me.total += (parseFloat(quantity) * parseFloat(price));
					}
					else {
						if (me.itemGrid.data[index].quantity != "" && !(isNaN(me.itemGrid.data[index].quantity)) && me.itemGrid.data[index].price != "" && !(isNaN(me.itemGrid.data[index].price)))
							me.total += (parseFloat(me.itemGrid.data[index].quantity) * parseFloat(me.itemGrid.data[index].price));
					}
				}
			}

			if (me.itemGrid.activeRowIndex == me.itemGrid.data.length) {
				if ($("#selectInputCheck" + me.itemGrid.activeRowIndex)[0] != undefined && $("#selectInputCheck" + me.itemGrid.activeRowIndex)[0].checked) {
					if (quantity != "" && !(isNaN(quantity)) && price != "" && !(isNaN(price)))
						me.total += parseFloat(quantity) * parseFloat(price);
				}
			}

			$("#spnTotal").html(me.total.toFixed(2));
		},

		statusesLoaded: function(showAll) {
			var me = this;

			me.statuses = [];

			if (showAll) {
				me.statuses.push(new fin.pur.poRequisition.Status(1, "Open"));
				me.statuses.push(new fin.pur.poRequisition.Status(2, "In Process"));
				me.statusType.setData(me.statuses);
				me.statusType.select(0, me.statusType.focused);
			}
			else {
				me.statuses.push(new fin.pur.poRequisition.Status(0, "[All]"));
				me.statuses.push(new fin.pur.poRequisition.Status(1, "Open"));
				me.statuses.push(new fin.pur.poRequisition.Status(2, "In Process"));
				me.statuses.push(new fin.pur.poRequisition.Status(8, "Approved"));
				me.statuses.push(new fin.pur.poRequisition.Status(11, "Completed - PO"));
				me.statuses.push(new fin.pur.poRequisition.Status(12, "Completed - JDE"));
				me.statuses.push(new fin.pur.poRequisition.Status(6, "Cancelled"));
				me.statuses.push(new fin.pur.poRequisition.Status(10, "Unapproved"));
				me.statuses.push(new fin.pur.poRequisition.Status(13, "Template"));
				me.statusType.setData(me.statuses);
				me.statusType.select(1, me.statusType.focused);
			}
		},

		searchTypesLoaded: function() {
			var me = this;
			
			me.searchTypes = [];
			me.searchTypes.push(new fin.pur.poRequisition.SearchType(1, "Requisition #"));
			me.searchTypes.push(new fin.pur.poRequisition.SearchType(2, "Requested Date"));
			me.searchTypes.push(new fin.pur.poRequisition.SearchType(3, "Vendor #"));
			me.searchTypes.push(new fin.pur.poRequisition.SearchType(4, "Vendor Title"));
			me.searchType.setData(me.searchTypes);
		},
		
		searchTypeChanged: function() {
			var me = this;
			
			me.searchInput.setValue("");
			me.searchRequestedDate.setValue("");

			if (me.searchType.indexSelected == 1) {
				$("#SearchInput").hide();
				$("#SearchRequestedDate").show();
			}
			else {
				$("#SearchInput").show();
				$("#SearchRequestedDate").hide();
			}
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

			me.shippingState.setData(me.stateTypes);
			me.vendorState.setData(me.stateTypes);	
			me.checkLoadCount();		
		},
		
		actionSearchItem: function() {
			var me = this;
			
			me.loadPORequisitions();
		},
		
		houseCodesLoaded: function(me, activeId) { 
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.loadData();
			me.resizeControls();
		},

		houseCodeChanged: function() {
			var me = this;

			if (me.approveInProcess)
				me.statusesLoaded($("#houseCodeText").val() === "");
			me.lastSelectedRowIndex = -1;
			me.loadData();
		},

		loadData: function() {
			var me = this;
			
			me.houseCodeDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.houseCodeDetailsLoaded, me);
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
		},

		houseCodeDetailsLoaded: function(me, activeId) {

			me.loadPORequisitions();
		},

		houseCodeJobsLoaded: function(me, activeId) {

			me.shippingJob.setData(me.houseCodeJobs);

			if (me.lastSelectedRowIndex != -1) {
				var item = me.requisitionGrid.data[me.lastSelectedRowIndex];
				var index = ii.ajax.util.findIndexById(item.houseCodeJob.toString(), me.houseCodeJobs);
				if (index != undefined && index >= 0) 
					me.shippingJob.select(index, me.shippingJob.focused);
			}
		},

		searchInputChanged: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.loadPORequisitions();
			}
		},		

		loadPORequisitions: function() {
			var me = this;
			var statusType = "";
			var houseCodeId = $("#houseCodeText").val() != "" ? parent.fin.appUI.houseCodeId : 0;
			var searchValue = me.searchInput.getValue();

			if ($("#houseCodeText").val() == "" && me.searchType.lastBlurValue == "" && !me.approveInProcess) {
				me.searchType.setInvalid("Please select Search By.");
				return;
			}

			if (me.searchType.lastBlurValue == "Requisition #" && (searchValue == "" || !(/^[0-9]+$/.test(searchValue))))
				me.searchInput.setInvalid("Please enter valid Requisition #.");
			else if (me.searchType.lastBlurValue == "Requested Date" && me.searchRequestedDate.text.value == "")
				me.searchRequestedDate.setInvalid("Please enter valid Requested Date.");
			else if (me.searchType.lastBlurValue == "Vendor #" && (searchValue == "" || !(/^[0-9]+$/.test(searchValue))))
				me.searchInput.setInvalid("Please enter valid Vendor #.");
			else if (me.searchType.lastBlurValue == "Vendor Title" && searchValue.trim() == "")
				me.searchInput.setInvalid("Please enter Search Criteria.");

			if (!me.statusType.validate(true) || !me.searchType.validate(true) || !me.searchRequestedDate.valid || !me.searchInput.valid)
				return;
			
			if (me.action == "PORequisition")
				statusType = me.statusType.indexSelected == -1 ? 0 : me.statuses[me.statusType.indexSelected].id;
			else if (me.action == "GeneratePurchaseOrder")
				statusType = "8";
			else
				return;

			me.lastSelectedRowIndex = -1;
			me.setLoadCount();
			me.poRequisitionStore.reset();
			me.poRequisitionStore.fetch("userId:[user],poRequisitionId:0"
				+ ",houseCodeId:" + houseCodeId
				+ ",statusType:" + statusType
				+ ",searchType:" + me.searchType.text.value
				+ ",searchValue:" + (me.searchType.indexSelected == 1 ? me.searchRequestedDate.text.value : searchValue)
				+ ",template:-1"
				, me.poRequisitionsLoaded
				, me);
				
			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorSendRequisition").hide();
			$("#AnchorCancelRequisition").hide();
			$("#AnchorGeneratePurchaseOrder").hide();
			$("#AnchorJDEEntry").hide();
			$("#AnchorPrint").hide();
			$("#AnchorApprove").hide();
		},
		
		poRequisitionsLoaded: function(me, activeId) {
				
			me.requisitionGrid.setData(me.poRequisitions);			
			me.checkLoadCount();
		},
		
		loadPOItems: function() {
			var me = this;
			
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();
			if (me.itemGrid.activeRowIndex >= 0)
				me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);
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
					me.poRequisitionDetails.push(new fin.pur.poRequisition.PORequisitionDetail(
						0
						, me.items[index].poRequisitionId
						, me.items[index].account
						, me.items[index].itemSelect
						, me.items[index].number
						, me.items[index].description
						, me.items[index].alternateDescription
						, me.items[index].unit
						, me.items[index].manufactured
						, me.items[index].price
						, me.items[index].quantity
						, me.items[index].modified
						, me.items[index].extendedPrice
						));
				}
			}

			me.itemGrid.setData(me.poRequisitionDetails);
			me.itemReadOnlyGrid.setData(me.poRequisitionDetails);
			me.setTotal();
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

			if (item == undefined) 
				return;
			
			me.lastSelectedRowIndex = index;
			me.poRequisitionId = me.requisitionGrid.data[index].id;
			me.status = "";
			me.currentVendorTitle = "";

			if (me.action == "PORequisition") {
				$("#AnchorPrint").show();
				$("#AnchorApprove").hide();
				$("#TemplateInfo").hide();
				$("#RequisitionInfo").show();
				$("#divSpace").show();
				$("#RequisitionNumber").html(item.requisitionNumber);
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + item.houseCode, me.houseCodeJobsLoaded, me);
				me.setDetailInfo();

				if (me.requisitionGrid.data[index].statusType == 10 || me.requisitionGrid.data[index].statusType == 1 || me.requisitionGrid.data[index].statusType == 13) {
					if (me.requisitionGrid.data[index].statusType == 10) {
						$("#AnchorResendRequisition").show();
						$("#AnchorSendRequisition").hide();
					}
					if (me.requisitionGrid.data[index].statusType == 1) {
						$("#AnchorResendRequisition").hide();
						$("#AnchorSendRequisition").show();
						$("#TemplateInfo").show();
					}
					if (me.requisitionGrid.data[index].statusType == 13) {
						$("#AnchorSendRequisition").hide();
						$("#AnchorResendRequisition").hide();
						$("#AnchorCancelRequisition").hide();
						$("#TemplateInfo").show();
					}
					else
						$("#AnchorCancelRequisition").show();

					$("#AnchorEdit").show();
					$("#AnchorView").hide();
					$("#VendorInfo").show();
					$("#CategoryInfo").show();
					$("#imgAdd").show();
					$("#imgEdit").show();
					$("#imgRemove").show();
					me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					me.setReadOnly(false);
				}
				else {
					if (me.requisitionGrid.data[index].statusType == 2) {
						$("#AnchorResendRequisition").show();
						$("#AnchorSendRequisition").hide();
						$("#AnchorCancelRequisition").show();
						if (me.approveInProcess)
							$("#AnchorApprove").show();
					}
					else {
						$("#AnchorResendRequisition").hide();
						$("#AnchorSendRequisition").hide();
						$("#AnchorCancelRequisition").hide();
					}

					if (me.writeInProcess && me.requisitionGrid.data[index].statusType == 2) {
						$("#AnchorEdit").show();
						$("#AnchorView").hide();
						$("#VendorInfo").show();
						$("#CategoryInfo").show();
						$("#imgAdd").show();
						$("#imgEdit").show();
						$("#imgRemove").show();				
						me.anchorSave.display(ui.cmn.behaviorStates.enabled);
						me.setReadOnly(false);
					}
					else {
						$("#AnchorEdit").hide();
						$("#AnchorView").show();
						$("#VendorInfo").hide();
						$("#CategoryInfo").hide();
						$("#imgAdd").hide();
						$("#imgEdit").hide();
						$("#imgRemove").hide();
						me.anchorSave.display(ui.cmn.behaviorStates.disabled);
						me.setReadOnly(true);
					}
				}
				
				me.loadCount++;
				me.modified(false);	
				me.setLoadCount();
				me.poRequisitionDetailsTemp = [];
				me.poRequisitionDetailStore.reset();
				me.poRequisitionDocumentStore.reset();
				me.poRequisitionDetailStore.fetch("userId:[user],poRequisitionId:" + me.poRequisitionId, me.poRequisitonDetailsLoaded, me);
				me.poRequisitionDocumentStore.fetch("userId:[user],poRequisitionId:" + me.poRequisitionId, me.poRequisitionDocumentsLoaded, me);
			}
			else {
				$("#AnchorGeneratePurchaseOrder").show();
				$("#AnchorJDEEntry").show();
			}
		},

		setDetailInfo: function() {
			var me = this;
			var item = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex];
			
			me.requestorName.setValue(item.requestorName);
			me.requestorEmail.setValue(item.requestorEmail);
			me.requestorPhone.setValue(item.requestorPhone);
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
			
			if (item.urgencyDate == "" || item.urgencyDate == "1/1/1900 12:00:00 AM") {
				me.urgencyDate.setValue("");
                $("#LabelUrgencyDate").html("<span id='nonRequiredFieldIndicator'>Urgency Date:</span>");
            }                   
            else {                
                me.urgencyDate.setValue(item.urgencyDate);
                $("#LabelUrgencyDate").html("<span class='requiredFieldIndicator'>&#149;</span>Urgency Date:");
            }
			
			if (item.urgency == "Urgent") 
				$('#UrgencyUrgent').attr('checked', true);
			else if (item.urgency == "Not Urgent") 
				$('#UrgencyNotUrgent').attr('checked', true);
			
			me.vendor.setValue(item.vendorTitle);
			me.vendorNumber = item.vendorNumber;
			me.company.setValue(item.houseCodeTitle);
			
			itemIndex = ii.ajax.util.findIndexById(item.houseCodeJob.toString(), me.houseCodeJobs);
			if (itemIndex != undefined && itemIndex >= 0) 
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
			me.template.setValue(item.template.toString());
			me.templateTitle.setValue(item.templateTitle);
			me.checkTemplate();
		},

		poRequisitonDetailsLoaded: function(me, activeId) {

			if (me.itemGrid.activeRowIndex >= 0)
				me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);

			if (me.currentVendorTitle == "") {
				me.resetPORequisitionDetails(true);
				me.checkLoadCount();
			}
			else
				$("#popupLoading").hide();
			me.resetGridData();
		},
		
		resetGridData: function() {
			var me = this;

			me.itemGrid.setData(me.poRequisitionDetails);
			me.itemReadOnlyGrid.setData(me.poRequisitionDetails);
			me.setTotal();
		},

		resetPORequisitionDetails: function(resetTemp) {
			var me = this;

			if (resetTemp) {
				me.poRequisitionDetailsTemp = [];
				for (var index = 0; index < me.poRequisitionDetails.length; index++) {
					me.poRequisitionDetailsTemp.push(new fin.pur.poRequisition.PORequisitionDetail(
						me.poRequisitionDetails[index].id
						, me.poRequisitionDetails[index].poRequisitionId
						, me.poRequisitionDetails[index].account
						, me.poRequisitionDetails[index].itemSelect
						, me.poRequisitionDetails[index].number
						, me.poRequisitionDetails[index].description
						, me.poRequisitionDetails[index].alternateDescription
						, me.poRequisitionDetails[index].unit
						, me.poRequisitionDetails[index].manufactured
						, me.poRequisitionDetails[index].price
						, me.poRequisitionDetails[index].quantity
						, me.poRequisitionDetails[index].modified
						, me.poRequisitionDetails[index].extendedPrice
					));
				}
			}
			else {
				if (me.itemGrid.activeRowIndex >= 0)
					me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);

				me.poRequisitionDetailStore.reset();
				for (var index = 0; index < me.poRequisitionDetailsTemp.length; index++) {
					var item = new fin.pur.poRequisition.PORequisitionDetail(
						me.poRequisitionDetailsTemp[index].id
						, me.poRequisitionDetailsTemp[index].poRequisitionId
						, me.poRequisitionDetailsTemp[index].account
						, me.poRequisitionDetailsTemp[index].itemSelect
						, me.poRequisitionDetailsTemp[index].number
						, me.poRequisitionDetailsTemp[index].description
						, me.poRequisitionDetailsTemp[index].alternateDescription
						, me.poRequisitionDetailsTemp[index].unit
						, me.poRequisitionDetailsTemp[index].manufactured
						, me.poRequisitionDetailsTemp[index].price
						, me.poRequisitionDetailsTemp[index].quantity
						, me.poRequisitionDetailsTemp[index].modified
						, me.poRequisitionDetailsTemp[index].extendedPrice
					);
					me.poRequisitionDetails.push(item);
				}
				me.resetGridData();
			}
		},

		setTotal: function() {
			var me = this;
			me.total = 0;

			for (var index = 0; index < me.itemGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					if (me.itemGrid.data[index].quantity != "" && !isNaN(me.itemGrid.data[index].quantity) && me.itemGrid.data[index].price != undefined)
						me.total += (parseFloat(me.itemGrid.data[index].quantity) * parseFloat(me.itemGrid.data[index].price));
				}
			}

			$("#spnTotal").html(me.total.toFixed(2));
		},

		poRequisitionDocumentsLoaded: function(me, activeId) {

			me.documentGrid.setData(me.poRequisitionDocuments);
			me.documentGrid.setHeight(100);
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
					me.vendorsLoading = true;
					me.vendorName.fetchingData();
					me.vendorStore.reset();
					me.vendorStore.fetch("searchValue:" + me.vendorName.text.value + ",vendorStatus:-1,userId:[user]", me.vendorsLoaded, me);
				}
				else {
					me.vendorId = 0;
					me.vendorNumber = "";
					me.vendor.setValue("");
					me.vendorAddress1.setValue("");
					me.vendorAddress2.setValue("");
					me.vendorCity.setValue("");				
					me.vendorState.select(-1, me.vendorState.focused);				
					me.vendorZip.setValue("");
					me.vendorContactName.setValue("");
					me.vendorPhone.setValue("");
					me.vendorEmail.setValue("");
				}
			}
		},
		
		vendorsLoaded: function(me, activeId) {
			
			me.vendorName.setData(me.vendors);
			me.vendorsLoading = false;

			if (me.vendors.length > 0) {
				me.vendorName.reset();
				me.vendorName.select(0, me.vendorName.focused);
			}

			me.vendorChanged();
		},
		
		vendorChanged: function() {
			var me = this;
			var index = me.vendorName.indexSelected;		

			if (me.status == "EditPORequisition" && !me.vendorsLoading) {
				var item = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex];
				if (me.vendorName.lastBlurValue != "" && item.vendorTitle != me.vendorName.lastBlurValue && item.vendorNumber != "") {
					alert("WARNING: The items which are associated with the previous Vendor [" + item.vendorTitle + "] will be removed permanently when saving the requisition.")
					me.currentVendorTitle = item.vendorTitle;
					if (me.itemGrid.activeRowIndex >= 0)
						me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);
					$("#popupMessageToUser").text("Loading");
					$("#popupLoading").show();
					me.poRequisitionDetailStore.reset();
					me.poRequisitionDetailStore.fetch("userId:[user],poRequisitionId:" + me.poRequisitionId + ",houseCodeId:" + parent.fin.appUI.houseCodeId + ",vendorTitle:" + item.vendorTitle, me.poRequisitonDetailsLoaded, me);
				}
				else {
					me.currentVendorTitle = "";
					me.resetPORequisitionDetails(false);
				}
			}
			else if (me.status == "NewPORequisition" && !me.vendorsLoading) {
				me.poRequisitionDetailsTemp = [];
				me.resetPORequisitionDetails(false);
			}

			if (index >= 0) {
				me.vendorId = me.vendors[index].number;
				me.vendorNumber = me.vendors[index].vendorNumber;
				me.vendor.setValue(me.vendors[index].name);
				me.vendorAddress1.setValue(me.vendors[index].addressLine1);
				me.vendorAddress2.setValue(me.vendors[index].addressLine2);
				me.vendorCity.setValue(me.vendors[index].city);
				
				var itemIndex = ii.ajax.util.findIndexById(me.vendors[index].stateType.toString(), me.stateTypes);				
				if (itemIndex != undefined && itemIndex >= 0)
					me.vendorState.select(itemIndex, me.vendorState.focused);
					
				me.vendorZip.setValue(me.vendors[index].zip);
				me.vendorContactName.setValue(me.vendors[index].contactName);
				me.vendorPhone.setValue(me.vendors[index].phoneNumber);
				me.vendorEmail.setValue(me.vendors[index].email);
				me.account.setData(me.glAccounts);				
				me.category.fetchingData();
				me.catalog.fetchingData();
				me.accountStore.reset();
				me.catalogStore.reset();
				me.accountStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.categoriesLoaded, me);				
				me.catalogStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",vendorId:" + me.vendorId, me.catalogsLoaded, me);
			}
			else {
				me.vendorId = 0;
				me.vendorNumber = "";
				me.vendor.setValue(me.vendorName.text.value);
				me.vendorAddress1.setValue("");
				me.vendorAddress2.setValue("");
				me.vendorCity.setValue("");				
				me.vendorState.select(-1, me.vendorState.focused);				
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
			else 
				$("#popupLoading").hide();			
		},
		
		categoriesLoaded: function(me, activeId) {

			me.accountId = 0;
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

			me.catalogId = 0;
			me.catalog.reset();

			if (me.vendorId == 0)
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
			var alertMessage = false;
			var lineItem = false;
			
			me.validator.forceBlur();
			
			if (me.wizardCount == 1) {
				if (me.status == "NewPORequisition" || me.vendorId == 0 || me.deliveryDate.lastBlurValue == ""
					|| ($("input:radio[name='Urgency']:checked").val() == "Urgent" && (me.urgencyDate.lastBlurValue == "" || !(ui.cmn.text.validate.generic(me.urgencyDate.lastBlurValue, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))))
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
                    || !me.requestorPhone.valid
					|| ($("input:radio[name='Urgency']:checked").val() == "Urgent") && (!me.urgencyDate.valid)		
					) {
					alert("In order to continue, the errors on the page must be corrected.");	
					return false;
				}
				else if ($('input:radio[name="Urgency"]:checked').length == 0) {
					alert("Please select Urgency.");	
					return false;
				}
				else
					return true;
			}
			else if (me.wizardCount == 2) {
				valid = me.validator.queryValidity(true);                
			
				if (me.itemGrid.activeRowIndex != undefined && me.itemGrid.activeRowIndex != -1 && $("#selectInputCheck" + me.itemGrid.activeRowIndex)[0].checked && (!me.itemNumber.valid
					|| !me.itemDescription.valid
					|| !me.account.valid
					|| !me.price.valid
					|| !me.quantity.valid
					|| !me.uom.valid)
				) {
					alert("In order to continue, the errors on the page must be corrected.");
					alertMessage = true;
				}
				
				if (!alertMessage) {
					me.itemGrid.body.deselectAll();
                
	                for (var index = 0; index < me.itemGrid.data.length; index++) {
	                	if ($("#selectInputCheck" + index)[0].checked && me.itemGrid.data[index].quantity == "") {
	                		alert("Please enter Quantity.");
	                		alertMessage = true;
	                		break;
	                	}                		
					}	
				}
				
				if (!alertMessage) {
	                for (var index = 0; index < me.itemGrid.data.length; index++) {
	                	if ($("#selectInputCheck" + index)[0].checked) {
	                		lineItem = true;
	                		break;
	                	}                		
					}
					if (!lineItem) {
                		alert("Please select atleast one line item.");
                		alertMessage = true;
                	}	
				}				
				
				if (alertMessage)
					return false;
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
					|| !me.templateTitle.valid
					) {
					return false;
				}
				else
					return true;
			}			
		},
		
		actionPORequisitionItem: function() {
			var me = this;

			$("#AnchorNew").show();
			$("#AnchorTemplate").show();
			$("#StatusContainer").show();
			me.action = "PORequisition";
			me.loadPORequisitions();
			me.modified(false);
		},

		actionPORequisitionFromTemplate: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			var index = me.requisitionGrid.activeRowIndex;
			if (index >= 0)
				me.requisitionGrid.body.deselect(index, true);	
			me.poRequisitionId = 0;
			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorSendRequisition").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorCancelRequisition").hide();
			$("#AnchorPrint").hide();
			$("#AnchorApprove").hide();
			$("#popupLoading").show();
			loadPopup("templatePopup");
			me.templateGrid.setHeight(320);
			me.poRequisitionTemplateStore.reset();
			me.poRequisitionTemplateStore.fetch("userId:[user],template:1,houseCodeId:" + parent.fin.appUI.houseCodeId, me.poRequisitionTemplatesLoaded, me);
		},

		poRequisitionTemplatesLoaded: function(me, activeId) {

			me.templateGrid.setData(me.poRequisitionTemplates);
			me.templateGrid.resize();
			$("#popupLoading").hide();
		},

		actionGeneratePurchaseOrderFromPORequisition: function() {
			var me = this;

			$("#AnchorNew").hide();
			$("#AnchorTemplate").hide();
			$("#StatusContainer").hide();
			me.action = "GeneratePurchaseOrder";
			me.loadPORequisitions();
			me.modified(false);
		},

		actionNewItem: function() {
			var me = this;

			if (parent.fin.appUI.houseCodeId == 0) {
				alert("Please select the House Code before adding the new PO Requisition.");
				return true;
			}

			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.anchorSave.display(ui.cmn.behaviorStates.enabled);
			me.setReadOnly(false);
			me.requisitionGrid.body.deselectAll();
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);		
			me.itemGrid.setData([]);
			me.itemReadOnlyGrid.setData([]);	
			me.documentGrid.setData([]);
			$("#RequisitionInfo").hide();
			$("#divSpace").hide();					
			me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");
			me.requestorEmail.setValue(me.users[0].email);
			me.requestedDate.setValue(me.currentDate());
			me.requestorPhone.setValue("");
			me.deliveryDate.setValue("");
			me.vendorStore.reset();
			me.vendorName.reset();
			me.vendorName.select(-1, me.vendorName.focused);
			me.vendorNumber = "";
			me.vendorAddress1.setValue("");
			me.vendorAddress2.setValue("");
			me.vendorCity.setValue("");
			me.vendorState.select(-1, me.vendorState.focused);
			me.vendorZip.setValue("");
			me.vendorContactName.setValue("");
			me.vendorPhone.setValue("");
			me.vendorEmail.setValue("");
			me.reasonForRequest.setValue("");
			me.urgencyDate.setValue("");
			$('input[name="Urgency"]').attr('checked', false);
			$("#LabelUrgencyDate").html("<span id='nonRequiredFieldIndicator'>Urgency Date:</span>");

			me.vendor.setValue("");
			me.searchItem.setValue("");
			me.category.reset();
			me.category.setData([]);
			me.catalog.reset();
			me.catalog.setData([]);
			me.company.setValue(parent.fin.appUI.houseCodeTitle);
			me.shippingJob.reset();
			me.shippingAddress1.setValue(me.houseCodeDetails[0].shippingAddress1);
			me.shippingAddress2.setValue(me.houseCodeDetails[0].shippingAddress2);
			me.shippingCity.setValue(me.houseCodeDetails[0].shippingCity);
			
			index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].shippingState.toString(), me.stateTypes);
			if (index >= 0 && index != undefined)
				me.shippingState.select(index, me.shippingState.focused);
	
			me.shippingZip.setValue(me.houseCodeDetails[0].shippingZip);
			me.shippingPhone.setValue("");
			me.shippingFax.setValue("");
			me.template.setValue("false");
			me.templateTitle.setValue("");
			me.checkTemplate();

			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorSendRequisition").hide();
			$("#AnchorCancelRequisition").hide();
			$("#AnchorPrint").hide();
			$("#AnchorApprove").hide();
			$("#VendorInfo").show();
			$("#CategoryInfo").show();
			$("#imgAdd").show();
			$("#imgEdit").show();
			$("#imgRemove").show();
			$("#spnTotal").html("");
			$("#TemplateInfo").show();
			loadPopup("requisitionPopup");
			me.poRequisitionDetailStore.reset();
			me.poRequisitionDocumentStore.reset();
			me.poRequisitionDetailsTemp = [];
			me.poRequisitionId = 0;
			me.total = 0;
			me.currentVendorTitle = "";
			me.status = "NewPORequisition";
			me.wizardCount = 1;
			me.modified(false);
			me.setStatus("Loaded");
			me.actionShowWizard();
		},
		
		actionEditItem: function() {
			var me = this;

			if (me.requisitionGrid.activeRowIndex == -1)
				return true;			

			if (me.itemGrid.activeRowIndex >= 0)
				me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);

			me.currentVendorTitle = "";
			me.setDetailInfo();
			me.resetPORequisitionDetails(false);
			loadPopup("requisitionPopup");
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();
			me.vendorStore.reset();
			me.vendorStore.fetch("searchValue:" + me.requisitionGrid.data[me.lastSelectedRowIndex].vendorTitle + ",vendorStatus:-1,userId:[user]", me.vendorsLoad, me);
			me.poRequisitionId = me.requisitionGrid.data[me.lastSelectedRowIndex].id;
			me.itemGrid.setData(me.poRequisitionDetails);
			me.documentGrid.setData(me.poRequisitionDocuments);
			me.setTotal();
			me.status = "EditPORequisition";			
			me.wizardCount = 1;
			me.actionShowWizard();
			me.modified(false);
			me.setStatus("Loaded");
		},
		
		actionNextItem: function() {
			var me = this;								
			
			if (!me.validatePORequisition()) {
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
					
					if (me.vendorNumber == "") {
						me.searchItem.text.readOnly = true;
						me.category.text.readOnly = true;
						$("#CategoryAction").removeClass("iiInputAction");
						me.catalog.text.readOnly = true;
						$("#CatalogAction").removeClass("iiInputAction");
						me.anchorSearch.display(ui.cmn.behaviorStates.disabled);							
					}
					else {
						me.searchItem.text.readOnly = false;
						me.category.text.readOnly = false;
						$("#CategoryAction").addClass("iiInputAction");
						me.catalog.text.readOnly = false;
						$("#CatalogAction").addClass("iiInputAction");
						me.anchorSearch.display(ui.cmn.behaviorStates.enabled);
					}
										
					break;
					
				case 3:	
					$("#GeneralInfo").hide();
					$("#ItemInfo").hide();
					$("#ShippingInfo").show();
					me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					me.anchorBack.display(ui.cmn.behaviorStates.enabled);
					
					if (me.status == "NewPORequisition" 
						|| me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 10 
						|| me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 1
						|| me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 13
						|| (me.writeInProcess && me.requisitionGrid.data[me.lastSelectedRowIndex].statusType == 2))
						me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					else
						me.anchorSave.display(ui.cmn.behaviorStates.disabled);
						
					$("#Header").text("Shipping Information");
					break;
			}
			
			me.resizeControls();
		},
				
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			disablePopup("requisitionPopup");
			
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);

			for (var index = me.poRequisitionDetails.length - 1; index >= 0; index--) {
				if (me.poRequisitionDetails[index].id == 0)
					me.poRequisitionDetails.splice(index, 1);
			}

			for (var index = me.poRequisitionDocuments.length - 1; index >= 0; index--) {
				if (me.poRequisitionDocuments[index].id == 0)
					me.poRequisitionDocuments.splice(index, 1);
			}

			if (me.requisitionGrid.activeRowIndex >= 0) {
				me.poRequisitionId = me.requisitionGrid.data[me.requisitionGrid.activeRowIndex].id;
				me.setDetailInfo();
			}

			me.wizardCount = 0;
			me.status = "";
			me.currentVendorTitle = "";
			me.modified(false);
			me.setStatus("Loaded");
		},

		actionGenerateCancel: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			disablePopup("templatePopup");
		},
				
		actionAttachItem: function() {
			var me = this;

			$("#uploadPopup").fadeIn("slow");
			$("#iFrameUpload")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
			me.documentTitle.setValue("");
			me.documentTitle.resizeText();
			me.documentGrid.body.deselectAll();
		},

		actionEditDocumentItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;

			if (index != -1) {
				$("#uploadPopup").fadeIn("slow");
				$("#iFrameUpload")[0].contentWindow.document.getElementById("FormReset").click();
				me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
				me.documentTitle.setValue(me.poRequisitionDocuments[index].title);
				me.documentTitle.resizeText();
			}
		},

		actionUploadItem: function() {
			var me = this;
			var tempFileName = "";

			if (!me.documentTitle.validate(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.setStatus("Uploading");
			$("#uploadPopup").fadeOut("slow");
			$("#popupMessageToUser").text("Uploading");
			$("#popupLoading").fadeIn("slow");
			$("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value = "";
			$("#iFrameUpload")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {

				if ($("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value != "")	{
					tempFileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					me.setStatus("Edit");
					$("#popupLoading").fadeOut("slow");

					if (tempFileName == "Error") {
						me.setStatus("Info", "Unable to upload the file. Please try again.");
						alert("Unable to upload the file. Please try again.");
					}
					else {
						if (me.documentGrid.activeRowIndex == -1) {
							var item = new fin.pur.poRequisition.PORequisitionDocument(0, me.documentTitle.getValue(), me.fileName, tempFileName);
							me.poRequisitionDocuments.push(item);
							me.documentGrid.setData(me.poRequisitionDocuments);
						}
						else {
							var index = me.documentGrid.activeRowIndex;
							me.poRequisitionDocuments[index].title = me.documentTitle.getValue();
							me.poRequisitionDocuments[index].fileName = me.fileName;
							me.poRequisitionDocuments[index].tempFileName = tempFileName;
							me.documentGrid.body.renderRow(index, index);
						}
					}
				}
			}, 1000);
		},

		actionUploadCancel: function() {
			var me = this;

			$("#uploadPopup").fadeOut("slow");
		},

		actionRemoveItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;

			if (index != -1) {
				if (me.poRequisitionDocuments[index].id > 0) {
					me.status = "DeleteDocument";
					$("#popupMessageToUser").text("Removing");
					me.actionSaveItem();
				}
				me.poRequisitionDocuments.splice(index, 1);
				me.documentGrid.setData(me.poRequisitionDocuments);
			}
		},

		actionViewItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;
				
			if (index != -1) {
				if (me.poRequisitionDocuments[index].id > 0) {
					me.setStatus("Downloading");
					$("#popupMessageToUser").text("Downloading");
					$("#popupLoading").fadeIn("slow");
					me.fileNameStore.reset();
					me.fileNameStore.fetch("userId:[user],type:poRequisitionDocument"
						+ ",id:" + me.poRequisitionDocuments[index].id
						+ ",fileName:" + me.poRequisitionDocuments[index].fileName
						, me.fileNamesLoaded
						, me
						);
				}
			}
		},
		
		fileNamesLoaded: function(me, activeId) {

			if (parent.fin.appUI.modified)
				me.setStatus("Edit");
			else 
				me.setStatus("Normal");
			$("#popupLoading").fadeOut("slow");

			if (me.fileNames.length == 1) {
				$("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("#iFrameUpload")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionGenerateItem: function() {
			var me = this;

			if (me.templateGrid.activeRowIndex == -1)
				return true;

			disablePopup("templatePopup");
			$("#messageToUser").text("Generating PO Requisition");
			me.status = "GenerateRequisition";
			me.actionSaveItem();
		},

		actionSendRequisitionItem: function() {
			var me = this;

			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			me.validator.forceBlur();
			if (!me.validator.queryValidity(true) || me.itemGrid.data.length == 0) {
				alert("There are few mandatory fields which are not entered. Please enter values for all mandatory fields and try again.");
				return;
			}

			$("#messageToUser").text("Sending Requisition");
			me.status = "SendRequisition";
			me.actionSaveItem();
		},

		actionResendRequisitionItem: function() {
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Resending Requisition");
			me.status = "ResendRequisition";
			me.actionSaveItem();
		},
		
		actionCancelRequisitionItem: function() {
            var me = this;      
            
            if (me.requisitionGrid.activeRowIndex == -1)
                return true;
                
            $("#messageToUser").text("Cancelling Requisition");
            me.status = "CancelRequisition";
            me.actionSaveItem();
        },
		
		actionGeneratePurchaseOrderItem: function() {
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Generating Purchase Order");
			me.status = "GeneratePurchaseOrder";
			me.actionSaveItem();
		},
		
		actionJDEEntryItem: function() {
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Saving JDE Entry");
			me.status = "JDEEntry";
			me.actionSaveItem();
		},
		
		actionPrintItem: function() {
			var me = this;
			
			if (me.requisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Downloading");
			me.status = "PrintRequisition";
			me.actionSaveItem();
		},
		
		actionApproveItem: function() {
			var me = this;		

			$("#messageToUser").text("Approving Requisition");
			me.status = "ApproveRequisition";
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

				disablePopup("requisitionPopup");
				me.itemGrid.body.deselectAll();

				var statusType = 0;
				if (me.template.check.checked)
					statusType = 13;
				else if (me.status == "EditPORequisition" && me.requisitionGrid.data[index].statusType == 13)
					statusType = 1;
				else
					statusType = (me.status == "NewPORequisition" ? 1 : me.requisitionGrid.data[index].statusType);

				item = new fin.pur.poRequisition.PORequisition(
					me.poRequisitionId 
					, (me.status == "NewPORequisition" ? 0 : me.requisitionGrid.data[index].requisitionNumber)
					, statusType
					, (me.status == "NewPORequisition" ? parent.fin.appUI.houseCodeId : me.requisitionGrid.data[index].houseCode)
					, (me.status == "NewPORequisition" ? parent.fin.appUI.houseCodeTitle : me.requisitionGrid.data[index].houseCodeTitle)
					, (me.shippingJob.indexSelected == -1 ? 0 : me.houseCodeJobs[me.shippingJob.indexSelected].id)
					, me.shippingAddress1.getValue()
					, me.shippingAddress2.getValue()
					, me.shippingCity.getValue()
					, me.stateTypes[me.shippingState.indexSelected].id
					, me.shippingZip.getValue()
					, me.shippingPhone.getValue()
					, me.shippingFax.getValue()
					, me.requestorName.getValue()
                    , me.requestorPhone.getValue()
					, me.requestorEmail.getValue()
					, me.requestedDate.lastBlurValue
					, me.deliveryDate.lastBlurValue
					, me.vendorName.lastBlurValue
					, me.vendorNumber
					, me.vendorAddress1.getValue()
					, me.vendorAddress2.getValue()
					, me.vendorCity.getValue()
					, me.stateTypes[me.vendorState.indexSelected].id
					, me.vendorZip.getValue()
					, me.vendorContactName.getValue()
					, me.vendorPhone.getValue()
					, me.vendorEmail.getValue()
					, me.reasonForRequest.getValue()
					, $("input[name='Urgency']:checked").val()
					, me.urgencyDate.lastBlurValue
					, ""
					, me.template.check.checked
					, me.templateTitle.getValue()
					, false
					);

				$("#messageToUser").text("Saving");
			}
			else if (me.status == "SendRequisition" || me.status == "ResendRequisition") {
				item = me.requisitionGrid.data[index];
				item.statusType = 2;
			}
			else if (me.status == "CancelRequisition") {
                item = me.requisitionGrid.data[index];
                item.statusType = 6;
            }
			else if (me.status == "ApproveRequisition") {
                item = me.requisitionGrid.data[index];
                item.statusType = 8;
            }
			else if (me.status == "GeneratePurchaseOrder" || me.status == "PrintRequisition") {
				item = me.requisitionGrid.data[index];
			}
			else if (me.status == "JDEEntry") {
                item = me.requisitionGrid.data[index];
                item.statusType = 9;
            }
			else if (me.status == "GenerateRequisition") {
                item = me.templateGrid.data[me.templateGrid.activeRowIndex];
				item.statusType = 1;
				item.requestedDate = me.currentDate();
				item.deliveryDate = "";
				item.reasonForRequest = "";
				item.urgencyDate = "";
				item.template = false;
				item.templateTitle = "";
			}

			var xml = me.saveXmlBuildPORequisition(item);
			
			if (xml == "") 
				return;

			if (me.status == "PrintRequisition")
				me.setStatus("Downloading");
			else
				me.setStatus("Saving");
			
			if (me.status == "DeleteDocument")
				$("#popupLoading").fadeIn("slow");
			else
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
				if (me.currentVendorTitle != "") {
					xml += '<purPORequisitionDetailDelete';
					xml += ' id="0"';
					xml += ' poRequisitionId="' + me.poRequisitionId + '"';
					xml += ' houseCodeId="' + item.houseCode + '"';
					xml += ' vendorTitle="' + ui.cmn.text.xml.encode(me.currentVendorTitle) + '"';
					xml += '/>';
					me.currentVendorTitle = "";
				}
				xml += '<purPORequisition';
				xml += ' id="' + item.id + '"';
				xml += ' requisitionNumber="' + item.requisitionNumber + '"';
				xml += ' houseCodeId="' + item.houseCode + '"';
				xml += ' houseCodeJobId="' + item.houseCodeJob + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requestorPhone="' + fin.cmn.text.mask.phone(item.requestorPhone, true) + '"';
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' deliveryDate="' + item.deliveryDate + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(item.vendorAddressLine1) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(item.vendorAddressLine2) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(item.vendorCity) + '"';
				xml += ' vendorStateType="' + item.vendorStateType + '"';
				xml += ' vendorZip="' + item.vendorZip + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(item.vendorContactName) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(item.vendorPhoneNumber, true) + '"';
				xml += ' vendorEmail="' + ui.cmn.text.xml.encode(item.vendorEmail) + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
				xml += ' urgency="' + item.urgency + '"';
				xml += ' urgencyDate="' + item.urgencyDate + '"';
				xml += ' chargeToPeriod="' + item.chargeToPeriod + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(item.shipToAddress1) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(item.shipToAddress2) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(item.shipToCity) + '"';
				xml += ' shipToState="' + item.shipToState + '"';
				xml += ' shipToZip="' + item.shipToZip + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(item.shipToPhone, true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(item.shipToFax, true) + '"';
				xml += ' template="' + item.template + '"';
				xml += ' templateTitle="' + ui.cmn.text.xml.encode(item.templateTitle) + '"';	
				xml += '/>';

				for (var index = me.poRequisitionDetails.length - 1; index >= 0; index--) {
					if ($("#selectInputCheck" + index)[0].checked) {
						me.poRequisitionDetails[index].itemSelect = true;
						me.poRequisitionDetails[index].modified = true;
					}	
					else
						me.poRequisitionDetails.splice(index, 1);
				}

				for (var index = 0; index < me.itemGrid.data.length; index++) {
					xml += '<purPORequisitionDetail';
					xml += ' id="' + (me.status == "NewPORequisition" ? "0" : me.itemGrid.data[index].id) + '"';
					xml += ' poRequisitionId="' + me.poRequisitionId + '"';
					xml += ' number="' + ui.cmn.text.xml.encode(me.itemGrid.data[index].number) + '"';
					xml += ' description="' + ui.cmn.text.xml.encode(me.itemGrid.data[index].description) + '"';
					xml += ' alternateDescription="' + ui.cmn.text.xml.encode(me.itemGrid.data[index].alternateDescription) + '"';
					xml += ' account="' + me.itemGrid.data[index].account.id + '"';
					xml += ' uom="' + ui.cmn.text.xml.encode(me.itemGrid.data[index].unit) + '"';
					xml += ' manufactured="' + ui.cmn.text.xml.encode(me.itemGrid.data[index].manufactured) + '"';
					xml += ' quantity="' + me.itemGrid.data[index].quantity + '"';
					xml += ' price="' + me.itemGrid.data[index].price + '"';
					xml += '/>';
				}

				for (var index = 0; index < me.poRequisitionDocuments.length; index++) {
					if (me.poRequisitionDocuments[index].tempFileName != "") {
						xml += '<purPORequisitionDocument';
						xml += ' id="' + me.poRequisitionDocuments[index].id + '"';;
						xml += ' title="' + ui.cmn.text.xml.encode(me.poRequisitionDocuments[index].title) + '"';
						xml += ' description=""';				
						xml += ' fileName="' + ui.cmn.text.xml.encode(me.poRequisitionDocuments[index].fileName) + '"';
						xml += ' tempFileName="' + ui.cmn.text.xml.encode(me.poRequisitionDocuments[index].tempFileName) + '"';
						xml += '/>';
					}
				}
			}
			else if (me.status == "SendRequisition" || me.status == "ResendRequisition" || me.status == "PrintRequisition") {
				xml += '<purPORequisitionEmailNotification';
				xml += ' id="' + me.poRequisitionId + '"';
				xml += ' requisitionNumber="' + item.requisitionNumber + '"';
				xml += ' statusType="2"';
				xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
				xml += ' houseCodeJobTitle="' + ui.cmn.text.xml.encode(me.shippingJob.lastBlurValue) + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(item.shipToAddress1) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(item.shipToAddress2) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(item.shipToCity) + '"';
				xml += ' shipToStateTitle="' + ui.cmn.text.xml.encode(me.shippingState.lastBlurValue) + '"';
				xml += ' shipToZip="' + item.shipToZip + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(item.shipToPhone) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(item.shipToFax) + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requestorPhone="' + fin.cmn.text.mask.phone(item.requestorPhone) + '"';
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' deliveryDate="' + item.deliveryDate + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
				xml += ' vendorAddressLine1="' + ui.cmn.text.xml.encode(item.vendorAddressLine1) + '"';
				xml += ' vendorAddressLine2="' + ui.cmn.text.xml.encode(item.vendorAddressLine2) + '"';
				xml += ' vendorCity="' + ui.cmn.text.xml.encode(item.vendorCity) + '"';
				xml += ' vendorStateTitle="' + ui.cmn.text.xml.encode(me.vendorState.lastBlurValue) + '"';
				xml += ' vendorZip="' + item.shipToZip + '"';
				xml += ' vendorContactName="' + ui.cmn.text.xml.encode(item.vendorContactName) + '"';
				xml += ' vendorPhoneNumber="' + fin.cmn.text.mask.phone(item.vendorPhoneNumber) + '"';
				xml += ' vendorEmail="' + ui.cmn.text.xml.encode(item.vendorEmail) + '"';
				xml += ' reasonForRequest="' + ui.cmn.text.xml.encode(item.reasonForRequest) + '"';
				xml += ' urgency="' + item.urgency + '"';
				xml += ' urgencyDate="' + item.urgencyDate + '"';
				xml += ' chargeToPeriod=""';
				xml += ' action="' + me.status + '"';
				xml += ' jdeCompleted="0"';
				xml += '/>';
			}
			else if (me.status == "DeleteDocument") {
				xml += '<purPORequisitionDocumentDelete';
				xml += ' id="' + me.poRequisitionDocuments[me.documentGrid.activeRowIndex].id + '"';			
				xml += '/>';
			}
			else if (me.status == "CancelRequisition" || me.status == "ApproveRequisition" || me.status == "JDEEntry") {
                xml += '<purPORequisitionStatusUpdate';
				xml += ' id="' + item.id + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requisitionNumber="' + item.requisitionNumber + '"';
				xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
				xml += ' statusType="' + item.statusType + '"';
				xml += ' action="' + me.status + '"';
				if (me.status == "JDEEntry")
					xml += ' jdeCompleted="1"';
				else
					xml += ' jdeCompleted="0"';
				xml += '/>';
            }
			else if (me.status == "GeneratePurchaseOrder") {
				xml += '<purPORequisitionToPurchaseOrder';
				xml += ' id="' + me.poRequisitionId + '"';
				xml += ' houseCodeId="' + item.houseCode + '"';
				xml += ' requisitionNumber="' + item.requisitionNumber + '"';
				xml += ' houseCodeTitle="' + ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
				xml += ' vendorTitle="' + ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += '/>';
			}
			else if (me.status == "GenerateRequisition") {
				xml += '<purPORequisitionFromTemplate';
				xml += ' id="' + item.id + '"';
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
				if (me.status == "DeleteDocument") {
					me.status = "EditPORequisition";
					me.setStatus("Edit");
					$("#popupLoading").fadeOut("slow");
				}
				else {
					$(args.xmlNode).find("*").each(function () {
						switch (this.tagName) {
							case "purPORequisition":
								if (me.status == "NewPORequisition" || me.status == "GenerateRequisition") {
									item.id = parseInt($(this).attr("id"), 10);
									item.requisitionNumber = $(this).attr("requisitionNumber");
									me.poRequisitions.push(item);
									me.requisitionGrid.setData(me.poRequisitions);
									me.requisitionGrid.body.select(me.poRequisitions.length - 1);
								}
								else if (me.status == "EditPORequisition") {
									me.poRequisitions[me.lastSelectedRowIndex] = item;
									me.requisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
									if (item.statusType == 1) {
										$("#AnchorSendRequisition").show();
										$("#AnchorCancelRequisition").show();
									}
									else if (item.statusType == 13) {
										$("#AnchorSendRequisition").hide();
										$("#AnchorCancelRequisition").hide();
									}
								}								
								else if (me.status == "SendRequisition" || me.status == "ResendRequisition" 
									|| me.status == "CancelRequisition" || me.status == "ApproveRequisition") {
									me.poRequisitions[me.lastSelectedRowIndex] = item;
									me.requisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);									
									me.itemReadOnlyGrid.setData(me.poRequisitionDetails);
									
									if (me.status == "SendRequisition" || me.status == "ResendRequisition")
										$("#AnchorResendRequisition").show();
									else if (me.status == "CancelRequisition" || me.status == "ApproveRequisition") {
										$("#AnchorResendRequisition").hide();
										$("#AnchorCancelRequisition").hide();
										$("#AnchorApprove").hide();
									}
																		
									$("#AnchorSendRequisition").hide();
									$("#AnchorEdit").hide();
									$("#AnchorView").show();
									$("#VendorInfo").hide();
									$("#CategoryInfo").hide();
									$("#imgAdd").hide();
									$("#imgEdit").hide();
									$("#imgRemove").hide();
									
									me.anchorSave.display(ui.cmn.behaviorStates.disabled);
									me.setReadOnly(true);
								}
								else if (me.status == "GeneratePurchaseOrder" || me.status == "JDEEntry") {
									me.poRequisitions.splice(me.requisitionGrid.activeRowIndex, 1);
									me.requisitionGrid.setData(me.poRequisitions);
								}
								else if (me.status == "PrintRequisition") {
									$("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value = $(this).attr("fileName");
									$("#iFrameUpload")[0].contentWindow.document.getElementById("DownloadButton").click();
								}
								break;

							case "purPORequisitionDetail":
								var id = parseInt($(this).attr("id"), 10);
								if (id > 0) {
									for (var index = 0; index < me.poRequisitionDetails.length; index++) {
										if (me.poRequisitionDetails[index].modified) {
											if (me.poRequisitionDetails[index].id == 0)
												me.poRequisitionDetails[index].id = parseInt($(this).attr("id"), 10);
											me.poRequisitionDetails[index].modified = false;
											break;
										}
									}
								}
								break;

							case "purPORequisitionDocument":
								for (var index = 0; index < me.poRequisitionDocuments.length; index++) {
									if (me.poRequisitionDocuments[index].tempFileName != "") {
										if (me.poRequisitionDocuments[index].id == 0)
											me.poRequisitionDocuments[index].id = parseInt($(this).attr("id"), 10);
										me.poRequisitionDocuments[index].tempFileName = "";
										break;
									}
								}
								break;
						}
					});

					if (me.status == "EditPORequisition")
						me.resetPORequisitionDetails(true);

					if (me.status == "PrintRequisition")
						me.setStatus("Normal");
					else
						me.setStatus("Saved");

					me.status = "";
					me.modified(false);
				}
			}
			else if (status == "invalid") {
				alert($(args.xmlNode).attr("message"));
				me.setStatus("Normal");
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while updating PO Requisition details: " + $(args.xmlNode).attr("message"));				
			}
			
			if (me.status != "DeleteDocument")
				$("#pageLoading").fadeOut("slow");
		},	
	} 
});

function loadPopup(id) {
	centerPopup(id);

	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#" + id).fadeIn("slow");
}

function disablePopup(id) {
	
	$("#backgroundPopup").fadeOut("slow");
	$("#" + id).fadeOut("slow");
}

function centerPopup(id) {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;	
	var popupWidth = windowWidth - 70;
	var popupHeight = windowHeight - 120;	

	if (id === "requisitionPopup") {
		$("#requisitionPopup, #popupLoading").css({
			"width": popupWidth,
			"height": popupHeight,
			"top": windowHeight/2 - popupHeight/2,
			"left": windowWidth/2 - popupWidth/2
		});
		
		$("#uploadPopup").css({
			"top": windowHeight/2 - $("#uploadPopup").height()/2,
			"left": windowWidth/2 - $("#uploadPopup").width()/2
		});
	}
	else if (id === "templatePopup") {
		popupWidth = 800;
		popupHeight = 400;
		$("#templatePopup, #popupLoading").css({
			"width": popupWidth,
			"height": popupHeight,
			"top": windowHeight/2 - popupHeight/2,
			"left": windowWidth/2 - popupWidth/2
		});
	}

	$("#backgroundPopup").css({
		"height": windowHeight + 100
	});
}

function onFileChange() {

	var fileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("UploadFile").value;
	fileName = fileName.substring(fileName.lastIndexOf("\\") + 1) ;
	fin.pur.poRequisitionUi.fileName = fileName;

	if (fileName == "")
		fin.pur.poRequisitionUi.anchorUpload.display(ui.cmn.behaviorStates.disabled);
	else
		fin.pur.poRequisitionUi.anchorUpload.display(ui.cmn.behaviorStates.enabled);
}

function main() {

	fin.pur.poRequisitionUi = new fin.pur.poRequisition.UserInterface();
	fin.pur.poRequisitionUi.resize();
	fin.houseCodeSearchUi = fin.pur.poRequisitionUi;
}
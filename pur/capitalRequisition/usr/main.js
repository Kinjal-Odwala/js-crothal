ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.pur.capitalRequisition.usr.defs" );
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
    Name: "fin.pur.poCapitalRequisition.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;			
				
			me.poCapitalRequisitionId = 0;
			me.vendorId = 0;
			me.vendorNumber = "";
			me.accountId = 0;
			me.catalogId = 0;
			me.lastSelectedRowIndex = -1;		
			me.status = "";
			me.users = [];
			me.wizardCount = 0;
			me.loadCount = 0;
			me.subTotal = 0;
			me.total = 0;
			me.fileName = "";
			me.glAccounts = [];
			me.action = "POCapitalRequisition";
			me.approvalAmountLimit1 = 0;
			me.approvalAmountLimit2 = 0;
			me.currentVendorTitle = "";
			me.poCapitalRequisitionItemsTemp = [];

			me.gateway = ii.ajax.addGateway("pur", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Purchasing\\CapitalRequisition";
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
			me.statusesLoaded();
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

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}			
        },
		
		authorizationProcess: function fin_pur_poRequisition_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
	
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.poCapitalRequisitionShow = me.authorizer.isAuthorized(me.authorizePath + "\\POCapRequisition");
			me.convertPOCapitalRequisitionToPOShow = me.authorizer.isAuthorized(me.authorizePath + "\\ConvertPOCapRequisitionToPO");
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
				me.loadCount = 6;
				me.session.registerFetchNotify(me.sessionLoaded, me);

				if (!me.poCapitalRequisitionShow && !me.writeInProcess) {
					$("#AnchorNew").hide();
					$("#StatusContainer").hide();
					$("#POCapitalRequisitionAction").hide();
				}

				if (!me.convertPOCapitalRequisitionToPOShow) {
					$("#GeneratePurchaseOrderFromPOCapitalRequisitionAction").hide();
				}

				if (!me.poCapitalRequisitionShow && !me.writeInProcess && me.convertPOCapitalRequisitionToPOShow) {
					$("#AnchorGeneratePurchaseOrder").show();
					$("#AnchorJDEEntry").show();
					me.action = "GeneratePurchaseOrder";
				}

				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
				me.personStore.fetch("userId:[user],id:" + me.session.propertyGet("personId"), me.personsLoaded, me);
				me.systemVariableStore.fetch("userId:[user],name:POCapitalRequisitionApprovalAmountLimit1", me.approvalAmountLimit1Loaded, me);
				me.appUserStore.fetch("userId:[user],module:Workflow,id:0,workflowModuleId:3,stepNumber:4", me.chiefFinancialOfficersLoaded, me);
				me.employeeManagerDetailStore.fetch("userId:[user]", me.employeeManagerDetailsLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_pur_poCapitalRequisition_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.pur.poCapitalRequisitionUi;

			if (me == undefined)
				return;				
			
			me.capitalRequisitionGrid.setHeight($(window).height() - 145);
			me.itemGrid.setHeight($(window).height() - 395);
			me.itemReadOnlyGrid.setHeight($(window).height() - 335);
			me.documentGrid.setHeight(100);
			me.approvalGrid.setHeight(150);
			$("#popupContact").height($(window).height() - 110);
			$("#GeneralInfo").height($(window).height() - 210);
			$("#ShippingInfo").height($(window).height() - 210);
			$(".labelTextAreaBlank").width($("#ItemGridHeader").width() - 238);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "POCapitalRequisitionAction", 
					brief: "PO Capital Requisitions", 
					title: "To list the PO Capital Requisitions",
					actionFunction: function() { me.actionPOCapitalRequisitionItem(); }
				})
				.addAction({
					id: "GeneratePurchaseOrderFromPOCapitalRequisitionAction",
					brief: "Generate Purchase Order From PO Capital Requisition", 
					title: "To generate Purchase Order from PO Capital Requisition",
					actionFunction: function() { me.actionGeneratePurchaseOrderFromPOCapitalRequisition(); }
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
		    
			me.capitalRequisitionGrid = new ui.ctl.Grid({
				id: "CapitalRequisitionGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.capitalRequisitionGrid.addColumn("requisitionNumber", "requisitionNumber", "Requisition #", "Requisition #", 120);
			me.capitalRequisitionGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", 175);			
			me.capitalRequisitionGrid.addColumn("requestorName", "requestorName", "Requestor Name", "Requestor Name", 150);				
			me.capitalRequisitionGrid.addColumn("requestedDate ", "requestedDate", "Requested Date", "Requested Date", 150);
			me.capitalRequisitionGrid.addColumn("deliveryDate", "deliveryDate", "Delivery Date", "Delivery Date", 120);
			me.capitalRequisitionGrid.addColumn("vendorTitle", "vendorTitle", "Vendor Title", "Vendor Title", null);
			me.capitalRequisitionGrid.addColumn("statusType", "statusType", "Status", "Status", 200, function(statusType) {
				var index = 0;
				if (me.capitalRequisitionGrid.activeRowIndex >= 0)
					index = me.capitalRequisitionGrid.activeRowIndex;
				else
					index = me.capitalRequisitionGrid.rows.length - 1
				var stepBrief = "";
				if (index >= 0) {
					stepBrief = me.capitalRequisitionGrid.data[index].stepBrief;;
				}	
				if (statusType == 1)
					return "Open";
				else if (statusType == 2)
					return "In Process" + (stepBrief == "" ? "" : " - " + stepBrief + " Approved");
				else if (statusType == 6)
                	return "Cancelled";
				else if (statusType == 8)
                	return "Approved";
				else if (statusType == 9)
                	return "Completed";				
				else if (statusType == 10)
                	return "Unapproved" + (stepBrief == "" ? "" : " - " + stepBrief);
				else if (statusType == 11)
                	return "Completed - PO";
				else if (statusType == 12)
                	return "Completed - JDE";
           	});
			me.capitalRequisitionGrid.capColumns();
			
			me.requestorName = new ui.ctl.Input.Text({
		        id: "RequestorName",
				maxLength: 100,
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
			
			me.projectNumber = new ui.ctl.Input.Text({
				id: "ProjectNumber",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
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
										
					if (enteredText.length < 14)
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

			me.reasonForRequest.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

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
				createNewFunction: fin.pur.poCapitalRequisition.POCapitalRequisitionItem,
				selectFunction: function(index){
					if (me.itemGrid.rows[index].getElement("rowNumber").innerHTML == "Add") 
						me.itemGrid.rows[index].getElement("itemSelect").innerHTML = "<input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poCapitalRequisitionUi.calculateSubTotal(this);\"  checked=\"true\" />";
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
		        maxLength: 10,
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
				maxLength: 18,
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

				if (enteredText != ""  && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
					this.setInvalid("Please enter valid Price.");
			});
			
			me.taxPercent = new ui.ctl.Input.Text({
		        id: "TaxPercent",
				maxLength: 18,
				changeFunction: function() { me.modified(); me.calculateTotal();}
		    });
		    
		    me.taxPercent.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.taxPercent.getValue();
				
				if (enteredText == "") return;
				
				if (enteredText != ""  && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
					this.setInvalid("Please enter valid Tax %.");
			});
		    
			me.taxAmount = new ui.ctl.Input.Text({
		        id: "TaxAmount",
				maxLength: 18,
				changeFunction: function() { me.modified(); me.calculateTotalByTax(); }
		    });
		    
		    me.taxAmount.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.taxAmount.getValue();
				
				if (enteredText == "") return;
				
				if (enteredText != ""  && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
					this.setInvalid("Please enter valid Tax.");
			});
		    
		    me.freight = new ui.ctl.Input.Text({
		        id: "Freight",
				maxLength: 18,
				changeFunction: function() { me.modified(); me.calculateTotal(); }
		    });
		    
		    me.freight.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.freight.getValue();
				
				if (enteredText == "") return;
				
				if (enteredText != ""  && !(ui.cmn.text.validate.generic(enteredText, "^\\d{0,}\\.?\\d{0,2}$")))
					this.setInvalid("Please enter valid Freight.");
			});
			
			me.itemGrid.addColumn("itemSelect", "itemSelect", "", "", 30, function(data) {
				var index = me.itemGrid.rows.length - 1;
				if (me.itemGrid.data[index].itemSelect)
                	return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poCapitalRequisitionUi.calculateSubTotal(this);\" checked=\"true\" disabled /></center>";
				else
				    return "<center><input type=\"checkbox\" id=\"selectInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true; fin.pur.poCapitalRequisitionUi.calculateSubTotal(this);\" /></center>";
            });
			me.itemGrid.addColumn("number", "number", "Item Number", "Item Number", 120, null, me.itemNumber);
			me.itemGrid.addColumn("description", "description", "Item Description", "Item Description", null, null, me.itemDescription);
			me.itemGrid.addColumn("alternateDescription", "alternateDescription", "Alternate Description", "Alternate Description", 180, null, me.alternateDescription);			
			me.itemGrid.addColumn("account", "account", "GL Account No", "GL Account No", 140, function( account ) { return account.code + " - " + account.name; }, me.account);
			me.itemGrid.addColumn("unit", "unit", "UOM", "UOM", 50, null, me.uom);
			me.itemGrid.addColumn("manufactured", "manufactured", "MFG", "Manufactured", 120, null, me.manufactured);
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
			me.itemReadOnlyGrid.addColumn("account", "account", "GL Account No", "GL Account No", 140, function(account) { return account.code + " - " + account.name;	});
			me.itemReadOnlyGrid.addColumn("unit", "unit", "UOM", "UOM", 50);
			me.itemReadOnlyGrid.addColumn("manufactured", "manufactured", "MFG", "Manufactured", 120);
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
				maxLength: 100,
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

			me.vendor.text.readOnly = true;
			me.documentTitle.active = false;
			
			me.regionalManagerName = new ui.ctl.Input.Text({
		        id: "RegionalManagerName",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.regionalManagerName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.regionalManagerEmail = new ui.ctl.Input.Text({
		        id: "RegionalManagerEmail",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.regionalManagerEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.regionalManagerEmail.getValue();
					
					if (enteredText == "") return;
					
					if (!(ui.cmn.text.validate.emailAddress(enteredText)))
						this.setInvalid("Please enter valid Email.");
			});

			me.regionalManagerTitle = new ui.ctl.Input.Text({
		        id: "RegionalManagerTitle",
				maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });

			me.regionalManagerTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.divisionPresidentName = new ui.ctl.Input.Text({
		        id: "DivisionPresidentName",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.divisionPresidentName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.divisionPresidentName.getValue();

					if (enteredText == "" && me.total <= me.approvalAmountLimit1)
						this.valid = true;
			});

			me.divisionPresidentEmail = new ui.ctl.Input.Text({
		        id: "DivisionPresidentEmail",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.divisionPresidentEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.divisionPresidentEmail.getValue();

					if (enteredText == "" && me.total <= me.approvalAmountLimit1)
						this.valid = true;
					else {
						var emailArray = enteredText.split(";");

						for (var index in emailArray) {
							if (!(ui.cmn.text.validate.emailAddress(emailArray[index])))
								this.setInvalid("Please enter valid Email Address. Use semicolon to separate two addresses.");
						}
					}
			});

			me.financeDirectorName = new ui.ctl.Input.Text({
		        id: "FinanceDirectorName",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.financeDirectorName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.financeDirectorEmail = new ui.ctl.Input.Text({
		        id: "FinanceDirectorEmail",
				maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });

			me.financeDirectorEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.financeDirectorEmail.getValue();

					if (enteredText == "") return;

					var emailArray = enteredText.split(";");

					for (var index in emailArray) {
						if (!(ui.cmn.text.validate.emailAddress(emailArray[index])))
							this.setInvalid("Please enter valid Email Address. Use semicolon to separate two addresses.");
					}
			});

			me.approvalGrid = new ui.ctl.Grid({
				id: "ApprovalGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.approvalGrid.addColumn("approval", "approval", "Approvals", "Approvals", 180);
			me.approvalGrid.addColumn("name", "name", "Print Name", "Print Name", null);
			me.approvalGrid.addColumn("signature", "signature", "Signature", "Signature", 120);
			me.approvalGrid.addColumn("approvedDate", "approvedDate", "Date", "Date", 120);
			me.approvalGrid.capColumns();

			me.setTabIndexes();
		},		

		configureCommunications: function fin_pur_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pur.poCapitalRequisition.HirNode,
				itemConstructorArgs: fin.pur.poCapitalRequisition.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.pur.poCapitalRequisition.HouseCode,
				itemConstructorArgs: fin.pur.poCapitalRequisition.houseCodeArgs,
				injectionArray: me.houseCodes
			});

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.pur.poCapitalRequisition.HouseCodeDetail,
				itemConstructorArgs: fin.pur.poCapitalRequisition.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails	
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.pur.poCapitalRequisition.HouseCodeJob,
				itemConstructorArgs: fin.pur.poCapitalRequisition.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.pur.poCapitalRequisition.StateType,
				itemConstructorArgs: fin.pur.poCapitalRequisition.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.pur.poCapitalRequisition.Account,
				itemConstructorArgs: fin.pur.poCapitalRequisition.accountArgs,
				injectionArray: me.accounts					
			});
			
			me.persons = [];
			me.personStore = me.cache.register({ 
				storeId: "persons",
				itemConstructor: fin.pur.poCapitalRequisition.Person,
				itemConstructorArgs: fin.pur.poCapitalRequisition.personArgs,
				injectionArray: me.persons	
			});
			
			me.poCapitalRequisitions = [];
			me.poCapitalRequisitionStore = me.cache.register({
				storeId: "purPOCapitalRequisitions",
				itemConstructor: fin.pur.poCapitalRequisition.POCapitalRequisition,
				itemConstructorArgs: fin.pur.poCapitalRequisition.poCapitalRequisitionArgs,
				injectionArray: me.poCapitalRequisitions
			});
			
			me.items = [];
			me.itemStore = me.cache.register({
				storeId: "purPurchaseOrderItems",
				itemConstructor: fin.pur.poCapitalRequisition.Item,
				itemConstructorArgs: fin.pur.poCapitalRequisition.itemArgs,
				injectionArray: me.items,
				lookupSpec: { account: me.glAccounts }	
			});
			
			me.poCapitalRequisitionItems = [];
			me.poCapitalRequisitionItemStore = me.cache.register({
				storeId: "purPOCapitalRequisitionItems",
				itemConstructor: fin.pur.poCapitalRequisition.POCapitalRequisitionItem,
				itemConstructorArgs: fin.pur.poCapitalRequisition.poCapitalRequisitionItemArgs,
				injectionArray: me.poCapitalRequisitionItems,
				lookupSpec: { account: me.glAccounts }
			});
			
			me.vendors = [];
			me.vendorStore = me.cache.register({
				storeId: "purVendors",
				itemConstructor: fin.pur.poCapitalRequisition.Vendor,
				itemConstructorArgs: fin.pur.poCapitalRequisition.vendorArgs,
				injectionArray: me.vendors	
			});
			
			me.catalogs = [];
			me.catalogStore = me.cache.register({
				storeId: "purCatalogs",
				itemConstructor: fin.pur.poCapitalRequisition.Catalog,
				itemConstructorArgs: fin.pur.poCapitalRequisition.catalogArgs,
				injectionArray: me.catalogs	
			});
			
			me.poCapitalRequisitionDocuments = [];
			me.poCapitalRequisitionDocumentStore = me.cache.register({
				storeId: "purPOCapitalRequisitionDocuments",
				itemConstructor: fin.pur.poCapitalRequisition.POCapitalRequisitionDocument,
				itemConstructorArgs: fin.pur.poCapitalRequisition.poCapitalRequisitionDocumentArgs,
				injectionArray: me.poCapitalRequisitionDocuments
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
			storeId: "purFileNames",
				itemConstructor: fin.pur.poCapitalRequisition.FileName,
				itemConstructorArgs: fin.pur.poCapitalRequisition.fileNameArgs,
				injectionArray: me.fileNames
			});

			me.appUsers = [];
			me.appUserStore = me.cache.register({
				storeId: "appUsers",
				itemConstructor: fin.pur.poCapitalRequisition.User,
				itemConstructorArgs: fin.pur.poCapitalRequisition.userArgs,
				injectionArray: me.appUsers
			});

			me.employeeManagerDetails = [];
			me.employeeManagerDetailStore = me.cache.register({
			storeId: "employeeManagerDetails",
				itemConstructor: fin.pur.poCapitalRequisition.EmployeeManagerDetail,
				itemConstructorArgs: fin.pur.poCapitalRequisition.employeeManagerDetailArgs,
				injectionArray: me.employeeManagerDetails
			});

			me.workflowJDECompanys = [];
			me.workflowJDECompanyStore = me.cache.register({
			storeId: "appWorkflowJDECompanys",
				itemConstructor: fin.pur.poCapitalRequisition.WorkflowJDECompany,
				itemConstructorArgs: fin.pur.poCapitalRequisition.workflowJDECompanyArgs,
				injectionArray: me.workflowJDECompanys
			});

			me.workflowHistorys = [];
			me.workflowHistoryStore = me.cache.register({
			storeId: "appWorkflowHistorys",
				itemConstructor: fin.pur.poCapitalRequisition.WorkflowHistory,
				itemConstructorArgs: fin.pur.poCapitalRequisition.workflowHistoryArgs,
				injectionArray: me.workflowHistorys
			});

			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.pur.poCapitalRequisition.SystemVariable,
				itemConstructorArgs: fin.pur.poCapitalRequisition.systemVariableArgs,
				injectionArray: me.systemVariables
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
			
			$("input[name='Funding']").change(function() { me.modified(); });
			$("input[name='BusinessType']").change(function() { me.modified(); });
			$("input[name='Budgeting']").change(function() { me.modified(); });
			$("#VendorName").bind("keydown", me, me.actionVendorSearch);
			$("#imgAdd").bind("click", function() { me.actionAttachItem(); });
			$("#imgEdit").bind("click", function() { me.actionEditDocumentItem(); });
			$("#imgRemove").bind("click", function() { me.actionRemoveItem(); });
			$("#imgView").bind("click", function() { me.actionViewItem(); });
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
			me.requestedDate.text.tabIndex = 3;
			me.deliveryDate.text.tabIndex = 4;
			me.projectNumber.text.tabIndex = 5;
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
			//Capital - 16
			//Direct Reimbursement - 17
			//New Business - 18
			//New Construction - 19
			//Existing Business - 20
			//Budgeted - 21
			//Unbudgeted - 22
			me.vendor.text.tabIndex = 31;
			me.searchItem.text.tabIndex = 32;
			me.category.text.tabIndex = 33;			
			me.catalog.text.tabIndex = 34;
			me.taxPercent.text.tabIndex = 35;
			me.taxAmount.text.tabIndex = 36;
			me.freight.text.tabIndex = 37;
			me.company.text.tabIndex = 41;
			me.shippingJob.text.tabIndex = 42;
			me.shippingAddress1.text.tabIndex = 43;
			me.shippingAddress2.text.tabIndex = 44;
			me.shippingCity.text.tabIndex = 45;
			me.shippingState.text.tabIndex = 46;
			me.shippingZip.text.tabIndex = 47;
			me.shippingFax.text.tabIndex = 48;
			me.shippingPhone.text.tabIndex = 49;
			me.regionalManagerName.text.tabIndex = 50;
			me.regionalManagerEmail.text.tabIndex = 51;
			me.regionalManagerTitle.text.tabIndex = 52;
			me.divisionPresidentName.text.tabIndex = 53;
			me.divisionPresidentEmail.text.tabIndex = 54;
			me.financeDirectorName.text.tabIndex = 55;
			me.financeDirectorEmail.text.tabIndex = 56;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.requestorName.resizeText();
			me.requestorEmail.resizeText();
			me.requestedDate.resizeText();
			me.deliveryDate.resizeText();
			me.projectNumber.resizeText();
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
			me.vendor.resizeText();
			me.searchItem.resizeText();
			me.category.resizeText();			
			me.catalog.resizeText();
			me.taxPercent.resizeText();
			me.taxAmount.resizeText();
			me.freight.resizeText();
			me.company.resizeText();
			me.shippingJob.resizeText();
			me.shippingAddress1.resizeText();
			me.shippingAddress2.resizeText();
			me.shippingCity.resizeText();
			me.shippingState.resizeText();
			me.shippingZip.resizeText();
			me.shippingPhone.resizeText();
			me.shippingFax.resizeText();
			me.regionalManagerName.resizeText();
			me.regionalManagerEmail.resizeText();
			me.regionalManagerTitle.resizeText();
			me.divisionPresidentName.resizeText();
			me.divisionPresidentEmail.resizeText();
			me.financeDirectorName.resizeText();
			me.financeDirectorEmail.resizeText();
			me.resize();
		},
		
		setReadOnly: function(readOnly) {
			var me = this;

			me.requestorName.text.readOnly = readOnly;
			me.requestorEmail.text.readOnly = readOnly;
			me.requestedDate.text.readOnly = readOnly;
			me.deliveryDate.text.readOnly = readOnly;
			me.projectNumber.text.readOnly = readOnly;			
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
			me.taxPercent.text.readOnly = readOnly;
			me.taxAmount.text.readOnly = readOnly;
			me.freight.text.readOnly = readOnly;
			me.shippingJob.text.readOnly = readOnly;
			me.shippingAddress1.text.readOnly = readOnly;
			me.shippingAddress2.text.readOnly = readOnly;
			me.shippingCity.text.readOnly = readOnly;
			me.shippingState.text.readOnly = readOnly;
			me.shippingZip.text.readOnly = readOnly;
			me.shippingPhone.text.readOnly = readOnly;
			me.shippingFax.text.readOnly = readOnly;
			me.regionalManagerName.text.readOnly = readOnly;
			me.regionalManagerEmail.text.readOnly = readOnly;
			me.regionalManagerTitle.text.readOnly = readOnly;
			me.divisionPresidentName.text.readOnly = readOnly;
			me.divisionPresidentEmail.text.readOnly = readOnly;
			me.financeDirectorName.text.readOnly = readOnly;
			me.financeDirectorEmail.text.readOnly = readOnly;			
			
			$("#FundingCapital")[0].disabled = readOnly;
			$("#FundingDirectReimbursement")[0].disabled = readOnly;
			$("#FundingClientInvestment")[0].disabled = readOnly;
			$("#BusinessTypeNewBusiness")[0].disabled = readOnly;
			$("#BusinessTypeNewConstruction")[0].disabled = readOnly;
			$("#BusinessTypeExistingBusiness")[0].disabled = readOnly;			
			$("#BudgetingBudgeted")[0].disabled = readOnly;
			$("#BudgetingUnbudgeted")[0].disabled = readOnly;

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

			me.calculateSubTotal();
		},
		
		calculateSubTotal: function(object) {
			var me = this;
			var iIndex = me.itemGrid.activeRowIndex;
			var quantity = me.quantity.getValue();
			var price = me.price.getValue();

			me.subTotal = 0;

			for (var index = 0; index < me.itemGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0] != undefined && $("#selectInputCheck" + index)[0].checked) {
					if (iIndex == index) {
						if (quantity != "" && !(isNaN(quantity)) && price != "" && !(isNaN(price)))
							me.subTotal += (parseFloat(quantity) * parseFloat(price));
					}
					else {
						if (me.itemGrid.data[index].quantity != "" && !(isNaN(me.itemGrid.data[index].quantity)) && me.itemGrid.data[index].price != "" && !(isNaN(me.itemGrid.data[index].price)))
							me.subTotal += (parseFloat(me.itemGrid.data[index].quantity) * parseFloat(me.itemGrid.data[index].price));
					}
				}
			}

			if (me.itemGrid.activeRowIndex == me.itemGrid.data.length) {
				if ($("#selectInputCheck" + me.itemGrid.activeRowIndex)[0] != undefined && $("#selectInputCheck" + me.itemGrid.activeRowIndex)[0].checked) {
					if (quantity != "" && !(isNaN(quantity)) && price != "" && !(isNaN(price)))
						me.subTotal += (parseFloat(quantity) * parseFloat(price));
				}
			}

			$("#spnSubTotal").html(me.subTotal.toFixed(2));
			me.calculateTotal();
		},
		
		calculateTotal: function() {
			var me = this;
			var freight = me.freight.getValue() == "" ? 0 : parseFloat(me.freight.getValue());
			var taxAmount = me.taxAmount.getValue() == "" ? 0 : parseFloat(me.taxAmount.getValue());

			me.total = 0;

			if (me.subTotal != 0 && me.taxPercent.getValue() != "" && !isNaN(me.taxPercent.getValue())) {
				me.taxPercent.setValue(parseFloat(me.taxPercent.getValue()).toFixed(2));
				taxAmount = (me.subTotal * parseFloat(me.taxPercent.getValue())) / 100;
			}

			me.taxAmount.setValue(taxAmount.toFixed(2));
			me.freight.setValue(freight.toFixed(2));
			if (me.subTotal > 0)
				me.total = me.subTotal + parseFloat(taxAmount) + parseFloat(freight);

			$("#spnTotal").html(me.total.toFixed(2));
		},

		calculateTotalByTax: function() {
			var me = this;

			me.taxPercent.setValue("");
			me.calculateTotal();
		},
		
		statusesLoaded: function() {
			var me = this;

			me.statuses = [];
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(0, "[All]"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(1, "Open"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(2, "In Process"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(8, "Approved"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(11, "Completed - PO"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(12, "Completed - JDE"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(6, "Cancelled"));
			me.statuses.push(new fin.pur.poCapitalRequisition.Status(10, "Unapproved"));

			me.statusType.setData(me.statuses);
			me.statusType.select(1, me.statusType.focused);
		},
		
		searchTypesLoaded: function() {
			var me = this;
			
			me.searchTypes = [];
			me.searchTypes.push(new fin.pur.poCapitalRequisition.SearchType(1, "Requisition #"));
			me.searchTypes.push(new fin.pur.poCapitalRequisition.SearchType(2, "Requested Date"));
			me.searchTypes.push(new fin.pur.poCapitalRequisition.SearchType(3, "Vendor #"));
			me.searchTypes.push(new fin.pur.poCapitalRequisition.SearchType(4, "Vendor Title"));
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
				var item = new fin.pur.poCapitalRequisition.GLAccount(me.accounts[index].id, me.accounts[index].code, me.accounts[index].name);
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
			
			me.loadPOCapitalRequisitions();
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
			var args = ii.args(arguments,{});
			var me = this;

			me.lastSelectedRowIndex = -1;
			me.loadData();
		},
		
		loadData: function() {
			var me = this;
			
			me.houseCodeDetailStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.houseCodeDetailsLoaded, me);
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.workflowJDECompanyStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",workflowModuleId:3,stepNumber:2", me.workflowStep2JDECompanysLoaded, me);
		},
		
		houseCodeDetailsLoaded: function(me, activeId) {		

			me.loadPOCapitalRequisitions();
		},
		
		houseCodeJobsLoaded: function(me, activeId) {

			me.shippingJob.setData(me.houseCodeJobs);

			if (me.lastSelectedRowIndex != -1) {
				var item = me.capitalRequisitionGrid.data[me.lastSelectedRowIndex];
				var index = ii.ajax.util.findIndexById(item.houseCodeJob.toString(), me.houseCodeJobs);
				if (index != undefined && index >= 0) 
					me.shippingJob.select(index, me.shippingJob.focused);
			}
		},
		
		workflowStep2JDECompanysLoaded: function(me, activeId) {

			me.divisionPresidentNames = "";
			me.divisionPresidentEmails = "";

			for (var index = 0; index < me.workflowJDECompanys.length; index++) {
				me.divisionPresidentNames += (me.divisionPresidentNames == "" ? me.workflowJDECompanys[index].name : ";" + me.workflowJDECompanys[index].name);
				me.divisionPresidentEmails += (me.divisionPresidentEmails == "" ? me.workflowJDECompanys[index].email : ";" + me.workflowJDECompanys[index].email);
			}

			me.workflowJDECompanyStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",workflowModuleId:3,stepNumber:3", me.workflowStep3JDECompanysLoaded, me);
		},
		
		workflowStep3JDECompanysLoaded: function(me, activeId) {

			me.financeDirectorNames = "";
			me.financeDirectorEmails = "";

			for (var index = 0; index < me.workflowJDECompanys.length; index++) {
				me.financeDirectorNames += (me.financeDirectorNames == "" ? me.workflowJDECompanys[index].name : ";" + me.workflowJDECompanys[index].name);
				me.financeDirectorEmails += (me.financeDirectorEmails == "" ? me.workflowJDECompanys[index].email : ";" + me.workflowJDECompanys[index].email);
			}
		},

		searchInputChanged: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.loadPOCapitalRequisitions();
			}
		},

		loadPOCapitalRequisitions: function() {
			var me = this;
			var statusType = "";
			var houseCodeId = $("#houseCodeText").val() != "" ? parent.fin.appUI.houseCodeId : 0;
			var searchValue = me.searchInput.getValue();
			
			if ($("#houseCodeText").val() == "" && me.searchType.lastBlurValue == "") {
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

			if (me.action == "POCapitalRequisition")
				statusType = me.statusType.indexSelected == -1 ? 0 : me.statuses[me.statusType.indexSelected].id;
			else if (me.action == "GeneratePurchaseOrder")
				statusType = "8";
			else
				return;

			me.lastSelectedRowIndex = -1;
			me.setLoadCount();
			me.poCapitalRequisitionStore.reset();
			me.poCapitalRequisitionStore.fetch("userId:[user],poCapitalRequisitionId:0"
				+ ",houseCodeId:" + houseCodeId
				+ ",statusType:" + statusType
				+ ",searchType:" + me.searchType.text.value
				+ ",searchValue:" + (me.searchType.indexSelected == 1 ? me.searchRequestedDate.text.value : searchValue)
				, me.poCapitalRequisitionsLoaded
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
		
		poCapitalRequisitionsLoaded: function(me, activeId) {
				
			me.capitalRequisitionGrid.setData(me.poCapitalRequisitions);			
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
				for (var iIndex = 0; iIndex < me.poCapitalRequisitionItems.length; iIndex++) {
					if (me.items[index].number == me.poCapitalRequisitionItems[iIndex].number) {
						found = true; 
						break;
					}	
				}
				if (!found) {
					me.poCapitalRequisitionItems.push(new fin.pur.poCapitalRequisition.POCapitalRequisitionItem(
						0
						, me.items[index].poCapitalRequisitionId
						, me.items[index].account
						, me.items[index].itemSelect
						, me.items[index].number
						, me.items[index].description
						, me.items[index].alternateDescription
						, me.items[index].unit
						, me.items[index].manufactured
						, me.items[index].price
						, me.items[index].quantity
						, me.items[index].modified));
				}
			}

			me.itemGrid.setData(me.poCapitalRequisitionItems);
			me.itemReadOnlyGrid.setData(me.poCapitalRequisitionItems);
			me.setTotal();
			$("#popupLoading").hide();
		},

		personsLoaded: function(me, activeId) {

			if (me.persons.length > 0) {
				me.users = me.persons.slice();				
				me.requestorName.text.readOnly = true;
				me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");				
			}
			me.checkLoadCount();
		},

		approvalAmountLimit1Loaded: function(me, activeId) {

			if (me.systemVariables.length > 0) {
				me.approvalAmountLimit1 = parseFloat(me.systemVariables[0].variableValue);
			}

			me.systemVariableStore.fetch("userId:[user],name:POCapitalRequisitionApprovalAmountLimit2", me.approvalAmountLimit2Loaded, me);
		},

		approvalAmountLimit2Loaded: function(me, activeId) {

			if (me.systemVariables.length > 0) {
				me.approvalAmountLimit2 = parseFloat(me.systemVariables[0].variableValue);
			}
			me.checkLoadCount();
		},

		chiefFinancialOfficersLoaded: function(me, activeId) {

			if (me.appUsers.length > 0) {
				me.chiefFinancialOfficer = me.appUsers[0].firstName + " " + me.appUsers[0].lastName;
				$("#ChiefFinancialOfficer").html(me.chiefFinancialOfficer);
			}
			else
				me.chiefFinancialOfficer = "";
			
			me.appUserStore.fetch("userId:[user],module:Workflow,id:0,workflowModuleId:3,stepNumber:5", me.chiefExecutiveOfficersLoaded, me);
		},

		chiefExecutiveOfficersLoaded: function(me, activeId) {

			if (me.appUsers.length > 0) {
				me.chiefExecutiveOfficer = me.appUsers[0].firstName + " " + me.appUsers[0].lastName;
				$("#ChiefExecutiveOfficer").html(me.chiefExecutiveOfficer);
			}
			else
				me.chiefExecutiveOfficer = "";
			me.checkLoadCount();
		},

		employeeManagerDetailsLoaded: function(me, activeId) {

			me.checkLoadCount();
		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var item = me.capitalRequisitionGrid.data[index];			

			if (item == undefined) 
				return;

			me.lastSelectedRowIndex = index;
			me.poCapitalRequisitionId = me.capitalRequisitionGrid.data[index].id;
			me.status = "";

			if (me.action == "POCapitalRequisition") {
				$("#AnchorPrint").show();
				$("#AnchorApprove").hide();
				$("#RequisitionInfo").show();
				$("#divSpace").show();
				$("#ApprovalDetails").show();
				$("#RequisitionNumber").html(item.requisitionNumber);
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + item.houseCode, me.houseCodeJobsLoaded, me);
				me.setDetailInfo();	

				if (me.capitalRequisitionGrid.data[index].statusType == 10 || me.capitalRequisitionGrid.data[index].statusType == 1) {
					if (me.capitalRequisitionGrid.data[index].statusType == 10) {
						$("#AnchorResendRequisition").show();
						$("#AnchorSendRequisition").hide();
					}
					if (me.capitalRequisitionGrid.data[index].statusType == 1) {
						$("#AnchorResendRequisition").hide();
						$("#AnchorSendRequisition").show();
						$("#ApprovalDetails").hide();
					}
	
					$("#AnchorEdit").show();
					$("#AnchorView").hide();
					$("#AnchorCancelRequisition").show();
					$("#VendorInfo").show();
					$("#CategoryInfo").show();
					$("#imgAdd").show();
					$("#imgEdit").show();
					$("#imgRemove").show();				
					me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					me.setReadOnly(false);															
				}
				else {
					if (me.capitalRequisitionGrid.data[index].statusType == 2) {
						if (me.capitalRequisitionGrid.data[index].stepBrief == "")
							$("#AnchorResendRequisition").show();
						else
							$("#AnchorResendRequisition").hide();
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
	
					if (me.writeInProcess && me.capitalRequisitionGrid.data[index].statusType == 2) {
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
				me.poCapitalRequisitionItemStore.reset();
				me.poCapitalRequisitionDocumentStore.reset();
				me.workflowHistoryStore.reset();
				me.poCapitalRequisitionItemStore.fetch("userId:[user],poCapitalRequisitionId:" + me.poCapitalRequisitionId, me.poCapitalRequisitonItemsLoaded, me);
				me.poCapitalRequisitionDocumentStore.fetch("userId:[user],poCapitalRequisitionId:" + me.poCapitalRequisitionId, me.poCapitalRequisitionDocumentsLoaded, me);
			}
			else {
				$("#AnchorGeneratePurchaseOrder").show();
				$("#AnchorJDEEntry").show();
			}
		},

		setDetailInfo: function() {
			var me = this;
			var item = me.capitalRequisitionGrid.data[me.capitalRequisitionGrid.activeRowIndex];
			
			me.requestorName.setValue(item.requestorName);
			me.requestorEmail.setValue(item.requestorEmail);
			me.requestedDate.setValue(item.requestedDate);
			me.deliveryDate.setValue(item.deliveryDate);
			me.projectNumber.setValue(item.projectNumber);
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

			if (item.funding == "Capital") 
				$('#FundingCapital').attr('checked', true);
			else if (item.funding == "Direct Reimbursement") 
				$('#FundingDirectReimbursement').attr('checked', true);
			else if (item.funding == "Client Investment") 
				$('#FundingClientInvestment').attr('checked', true);
				
			if (item.businessType == "New Business") 
				$('#BusinessTypeNewBusiness').attr('checked', true);
			else if (item.businessType == "New Construction") 
				$('#BusinessTypeNewConstruction').attr('checked', true);
			else if (item.businessType == "Existing Business") 
				$('#BusinessTypeExistingBusiness').attr('checked', true);
			
			if (item.budgeting == "Budgeted") 
				$('#BudgetingBudgeted').attr('checked', true);
			else if (item.budgeting == "Unbudgeted") 
				$('#BudgetingUnbudgeted').attr('checked', true);

			me.vendor.setValue(item.vendorTitle);
			me.vendorNumber = item.vendorNumber;
			me.taxPercent.setValue(item.taxPercent == 0 ? "" : item.taxPercent);
			me.taxAmount.setValue(item.taxAmount == 0 ? "" : item.taxAmount);
			me.freight.setValue(item.freight == 0 ? "" : item.freight);
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
			me.regionalManagerName.setValue(item.regionalManagerName);
			me.regionalManagerEmail.setValue(item.regionalManagerEmail);
			me.regionalManagerTitle.setValue(item.regionalManagerTitle);
			me.divisionPresidentName.setValue(item.divisionPresidentName);
			me.divisionPresidentEmail.setValue(item.divisionPresidentEmail);
			me.financeDirectorName.setValue(item.financeDirectorName);
			me.financeDirectorEmail.setValue(item.financeDirectorEmail);
			$("#ChiefFinancialOfficer").html(item.chiefFinancialOfficerName);
			$("#ChiefExecutiveOfficer").html(item.chiefExecutiveOfficerName);
		},

		poCapitalRequisitonItemsLoaded: function(me, activeId) {

			if (me.currentVendorTitle == "")
				me.resetPOCapitalRequisitionItems(true);
			else
				$("#popupLoading").hide();
			me.resetGridData();
			if (me.capitalRequisitionGrid.activeRowIndex >= 0 && me.status == "")
				me.workflowHistoryStore.fetch("userId:[user],referenceId:" + me.poCapitalRequisitionId + ",statusType:8,workflowModuleId:3", me.workflowHistorysLoaded, me);
		},
		
		resetGridData: function() {
			var me = this;

			if (me.itemGrid.activeRowIndex >= 0)
				me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);

			me.itemGrid.setData(me.poCapitalRequisitionItems);
			me.itemReadOnlyGrid.setData(me.poCapitalRequisitionItems);
			me.calculateSubTotal();
		},

		resetPOCapitalRequisitionItems: function(resetTemp) {
			var me = this;

			if (resetTemp) {
				me.poCapitalRequisitionItemsTemp = [];
				for (var index = 0; index < me.poCapitalRequisitionItems.length; index++) {
					me.poCapitalRequisitionItemsTemp.push(new fin.pur.poCapitalRequisition.POCapitalRequisitionItem(
						me.poCapitalRequisitionItems[index].id
						, me.poCapitalRequisitionItems[index].poCapitalRequisitionId
						, me.poCapitalRequisitionItems[index].account
						, me.poCapitalRequisitionItems[index].itemSelect
						, me.poCapitalRequisitionItems[index].number
						, me.poCapitalRequisitionItems[index].description
						, me.poCapitalRequisitionItems[index].alternateDescription
						, me.poCapitalRequisitionItems[index].unit
						, me.poCapitalRequisitionItems[index].manufactured
						, me.poCapitalRequisitionItems[index].price
						, me.poCapitalRequisitionItems[index].quantity
						, me.poCapitalRequisitionItems[index].modified
					));
				}
			}
			else {
				me.poCapitalRequisitionItemStore.reset();
				for (var index = 0; index < me.poCapitalRequisitionItemsTemp.length; index++) {
					var item = new fin.pur.poCapitalRequisition.POCapitalRequisitionItem(
						me.poCapitalRequisitionItemsTemp[index].id
						, me.poCapitalRequisitionItemsTemp[index].poCapitalRequisitionId
						, me.poCapitalRequisitionItemsTemp[index].account
						, me.poCapitalRequisitionItemsTemp[index].itemSelect
						, me.poCapitalRequisitionItemsTemp[index].number
						, me.poCapitalRequisitionItemsTemp[index].description
						, me.poCapitalRequisitionItemsTemp[index].alternateDescription
						, me.poCapitalRequisitionItemsTemp[index].unit
						, me.poCapitalRequisitionItemsTemp[index].manufactured
						, me.poCapitalRequisitionItemsTemp[index].price
						, me.poCapitalRequisitionItemsTemp[index].quantity
						, me.poCapitalRequisitionItemsTemp[index].modified
					);
					me.poCapitalRequisitionItems.push(item);
				}
				me.resetGridData();
			}
		},

		setTotal: function() {
			var me = this;
			var tax = me.taxAmount.getValue() == "" ? 0 : me.taxAmount.getValue();
			var freight = me.freight.getValue() == "" ? 0 : me.freight.getValue();
			me.subTotal = 0;

			for (var index = 0; index < me.itemGrid.data.length; index++) {
				if ($("#selectInputCheck" + index)[0].checked) {
					if (me.itemGrid.data[index].quantity != "" && !isNaN(me.itemGrid.data[index].quantity) && me.itemGrid.data[index].price != undefined)
						me.subTotal += (parseFloat(me.itemGrid.data[index].quantity) * parseFloat(me.itemGrid.data[index].price));
				}
			}

			if (me.subTotal == 0)
				me.total = 0;
			else
				me.total = me.subTotal + parseFloat(tax) + parseFloat(freight);

			$("#spnSubTotal").html(me.subTotal.toFixed(2));
			$("#spnTotal").html(me.total.toFixed(2));
		},

		poCapitalRequisitionDocumentsLoaded: function(me, activeId) {

			me.documentGrid.setData(me.poCapitalRequisitionDocuments);
			me.documentGrid.setHeight(100);
			me.checkLoadCount();
		},

		workflowHistorysLoaded: function(me, activeId) {

			var approvals = [];
			var item = me.capitalRequisitionGrid.data[me.capitalRequisitionGrid.activeRowIndex];

			me.step1ApprovedDate = me.workflowHistorys.length > 0 ? me.workflowHistorys[0].modAt : "";
			me.step2ApprovedDate = me.workflowHistorys.length > 1 ? me.workflowHistorys[1].modAt : "";
			if (me.total <= me.approvalAmountLimit1)
				me.step3ApprovedDate = me.workflowHistorys.length > 1 ? me.workflowHistorys[1].modAt : "";
			else
				me.step3ApprovedDate = me.workflowHistorys.length > 2 ? me.workflowHistorys[2].modAt : "";
            me.step4ApprovedDate = me.workflowHistorys.length > 3 ? me.workflowHistorys[3].modAt : "";
            me.step5ApprovedDate = me.workflowHistorys.length > 4 ? me.workflowHistorys[4].modAt : "";

			approvals.push(new fin.pur.poCapitalRequisition.Approval(1, "Regional Manager", item.regionalManagerName, "", me.step1ApprovedDate));
			approvals.push(new fin.pur.poCapitalRequisition.Approval(2, "Division President", item.divisionPresidentName,  (me.total > me.approvalAmountLimit1 ? "" : "N/A"), (me.total > me.approvalAmountLimit1 ? me.step2ApprovedDate : "N/A")));
			approvals.push(new fin.pur.poCapitalRequisition.Approval(3, "Finance Director", item.financeDirectorName, "", me.step3ApprovedDate));
			approvals.push(new fin.pur.poCapitalRequisition.Approval(4, "Chief Financial Officer", item.chiefFinancialOfficerName, (me.total > me.approvalAmountLimit1 ? "" : "N/A"), (me.total > me.approvalAmountLimit1 ? me.step4ApprovedDate : "N/A")));
			approvals.push(new fin.pur.poCapitalRequisition.Approval(5, "Chief Executive Officer", item.chiefExecutiveOfficerName, (me.total > me.approvalAmountLimit2 ? "" : "N/A"), (me.total > me.approvalAmountLimit2 ? me.step5ApprovedDate : "N/A")));
			me.approvalGrid.setData(approvals);
			me.approvalGrid.setHeight(150);
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
			
			if (me.vendors.length > 0) {				
				me.vendorName.reset();
				me.vendorName.select(0, me.vendorName.focused);
			}
		},
		
		vendorChanged: function() {
			var me = this;
			var index = me.vendorName.indexSelected;
		
			if (me.status == "EditPOCapitalRequisition") {
				var item = me.capitalRequisitionGrid.data[me.capitalRequisitionGrid.activeRowIndex];
				if (index >= 0) {
					if (item.vendorTitle != me.vendors[index].title) {
						if (confirm("WARNING: The items which are associated with the Vendor [" + item.vendorTitle + "] will be removed permanently when saving the requisition. Press OK to continue, or Cancel to remain on the same Vendor.")) {
							me.currentVendorTitle = item.vendorTitle;
							if (me.itemGrid.activeRowIndex >= 0)
								me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);
							$("#popupMessageToUser").text("Loading");
							$("#popupLoading").show();
							me.poCapitalRequisitionItemStore.reset();
							me.poCapitalRequisitionItemStore.fetch("userId:[user],poCapitalRequisitionId:" + me.poCapitalRequisitionId + ",houseCodeId:" + parent.fin.appUI.houseCodeId + ",vendorTitle:" + item.vendorTitle, me.poCapitalRequisitonItemsLoaded, me);
						}
						else {
							for (var iIndex = 0; iIndex < me.vendors.length; iIndex++) {
								if (me.vendors[iIndex].title == item.vendorTitle) {
									me.currentVendorTitle = "";
									me.vendorName.select(iIndex, me.vendorName.focused);
									me.resetPOCapitalRequisitionItems(false);
									break;
								}
							}
						}
					}
					else {
						me.currentVendorTitle = "";
						me.resetPOCapitalRequisitionItems(false);
					}
				}
			}
			
			index = me.vendorName.indexSelected;
			
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
				//me.poCapitalRequisitionItemStore.reset();
				me.accountStore.reset();
				me.catalogStore.reset();
				//me.poCapitalRequisitionItemStore.fetch("userId:[user],poCapitalRequisitionId:" + me.poCapitalRequisitionId, me.poCapitalRequisitonItemsLoaded, me);
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
		
		validatePOCapitalRequisition: function() {
			var me = this;
			var valid = true;			
			var alertMessage = false;
			var lineItem = false;
			
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
					alert("In order to continue, the errors on the page must be corrected.");	
					return false;
				}
				else if ($('input:radio[name="Funding"]:checked').length == 0) {
					alert("Please select Funding.");	
					return false;
				}
				else if ($('input:radio[name="BusinessType"]:checked').length == 0) {
					alert("Please select Business Type.");	
					return false;
				}
				else if ($('input:radio[name="Budgeting"]:checked').length == 0) {
					alert("Please select Budgeting.");	
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
					|| !me.uom.valid
					|| !me.taxPercent.valid
					|| !me.taxAmount.valid
					|| !me.freight.valid)
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
				
				if (!me.taxPercent.valid || !me.taxAmount.valid || !me.freight.valid) {
					alert("In order to continue, the errors on the page must be corrected.");
					alertMessage = true;
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
					|| !me.regionalManagerName.valid
					|| !me.regionalManagerEmail.valid
					|| !me.regionalManagerTitle.valid
					|| !me.divisionPresidentName.valid
					|| !me.divisionPresidentEmail.valid
					|| !me.financeDirectorName.valid
					|| !me.financeDirectorEmail.valid					
					) {
					return false;
				}
				else
					return true;
			}			
		},
		
		actionPOCapitalRequisitionItem: function() {
			var me = this;

			$("#AnchorNew").show();
			$("#StatusContainer").show();
			me.action = "POCapitalRequisition";
			me.loadPOCapitalRequisitions();
			me.modified(false);
		},
		
		actionGeneratePurchaseOrderFromPOCapitalRequisition: function() {
			var me = this;

			$("#AnchorNew").hide();
			$("#StatusContainer").hide();
			me.action = "GeneratePurchaseOrder";
			me.loadPOCapitalRequisitions();
			me.modified(false);
		},

		actionNewItem: function() {
			var me = this;
			
			if (parent.fin.appUI.houseCodeId == 0) {
				alert("Please select the House Code before adding the new PO Capital Requisition.");
				return true;
			}

			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.anchorSave.display(ui.cmn.behaviorStates.enabled);
			me.setReadOnly(false);
			me.capitalRequisitionGrid.body.deselectAll();
			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);
			me.itemGrid.setData([]);
			me.itemReadOnlyGrid.setData([]);	
			me.documentGrid.setData([]);					
			me.requestorName.setValue(me.users[0].firstName + " " + me.users[0].lastName + "");
			me.requestorEmail.setValue(me.users[0].email);
			me.requestedDate.setValue(me.currentDate());
			me.deliveryDate.setValue("");
			me.projectNumber.setValue("");
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
			$('input[name="Funding"]').attr('checked', false);
			$('input[name="BusinessType"]').attr('checked', false);
			$('input[name="Budgeting"]').attr('checked', false);
			me.vendor.setValue("");
			me.searchItem.setValue("");
			me.category.reset();
			me.category.setData([]);
			me.catalog.reset();
			me.catalog.setData([]);
			me.taxPercent.setValue("");
			me.taxAmount.setValue("");
			me.freight.setValue("");
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
			
			if (me.employeeManagerDetails.length > 0) {
				me.regionalManagerName.setValue(me.employeeManagerDetails[0].managerName);
				me.regionalManagerEmail.setValue(me.employeeManagerDetails[0].managerEmail);
				me.regionalManagerTitle.setValue(me.employeeManagerDetails[0].jobTitle);
			}
			else {
				me.regionalManagerName.setValue("");
				me.regionalManagerEmail.setValue("");
				me.regionalManagerTitle.setValue("Regional Manager");
			}

			me.divisionPresidentName.setValue(me.divisionPresidentNames);
			me.divisionPresidentEmail.setValue(me.divisionPresidentEmails);
			me.financeDirectorName.setValue(me.financeDirectorNames);
			me.financeDirectorEmail.setValue(me.financeDirectorEmails);
			$("#ChiefFinancialOfficer").html(me.chiefFinancialOfficer);
			$("#ChiefExecutiveOfficer").html(me.chiefExecutiveOfficer);

			$("#AnchorView").hide();
			$("#AnchorEdit").hide();
			$("#AnchorResendRequisition").hide();
			$("#AnchorSendRequisition").hide();
			$("#AnchorCancelRequisition").hide();
			$("#AnchorPrint").hide();
			$("#AnchorApprove").hide();
			$("#RequisitionInfo").hide();
			$("#divSpace").hide();
			$("#VendorInfo").show();
			$("#CategoryInfo").show();
			$("#imgAdd").show();
			$("#imgEdit").show();
			$("#imgRemove").show();
			$("#spnSubTotal").html("");
			$("#spnTotal").html("");
			$("#ApprovalDetails").hide();
			loadPopup();
			me.poCapitalRequisitionItemStore.reset();
			me.poCapitalRequisitionDocumentStore.reset();
			me.workflowHistoryStore.reset();
			me.poCapitalRequisitionId = 0;
			me.subTotal = 0;
			me.currentVendorTitle = "";
			me.status = "NewPOCapitalRequisition";
			me.wizardCount = 1;			
			me.modified(false);
			me.setStatus("Loaded");			
			me.actionShowWizard();
		},
		
		actionEditItem: function() {
			var me = this;

			if (me.capitalRequisitionGrid.activeRowIndex == -1)
				return true;

			me.currentVendorTitle = "";
			me.setDetailInfo();
			me.resetPOCapitalRequisitionItems(false);
			loadPopup();
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();
			me.vendorStore.reset();
			me.vendorStore.fetch("searchValue:" + me.capitalRequisitionGrid.data[me.lastSelectedRowIndex].vendorTitle + ",vendorStatus:-1,userId:[user]", me.vendorsLoad, me);

			if (me.itemGrid.activeRowIndex >= 0)
				me.itemGrid.body.deselect(me.itemGrid.activeRowIndex, true);
			me.poCapitalRequisitionId = me.capitalRequisitionGrid.data[me.lastSelectedRowIndex].id;
			me.itemGrid.setData(me.poCapitalRequisitionItems);
			me.documentGrid.setData(me.poCapitalRequisitionDocuments);
			me.setTotal();
			me.status = "EditPOCapitalRequisition";
			me.wizardCount = 1;
			me.actionShowWizard();
			me.modified(false);
			me.setStatus("Loaded");
		},
		
		actionNextItem: function() {
			var me = this;								
			
			if (!me.validatePOCapitalRequisition()) {
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
					
					if (me.status == "NewPOCapitalRequisition" 
						|| me.capitalRequisitionGrid.data[me.lastSelectedRowIndex].statusType == 10 
						|| me.capitalRequisitionGrid.data[me.lastSelectedRowIndex].statusType == 1
						|| (me.writeInProcess && me.capitalRequisitionGrid.data[me.lastSelectedRowIndex].statusType == 2))
						me.anchorSave.display(ui.cmn.behaviorStates.enabled);
					else
						me.anchorSave.display(ui.cmn.behaviorStates.disabled);
						
					$("#Header").text("Additional Information");
					
					if (me.total > me.approvalAmountLimit1) {
						$("#DivisionPresidentNameLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Division President Name:");
						$("#DivisionPresidentEmailLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Division President Email:");
						me.divisionPresidentName.text.readOnly = false;
						me.divisionPresidentEmail.text.readOnly = false;
					}
					else {
						$("#DivisionPresidentNameLabel").html("<span id='nonRequiredFieldIndicator'>Division President Name:</span>");
						$("#DivisionPresidentEmailLabel").html("<span id='nonRequiredFieldIndicator'>Division President Email:</span>");
						me.divisionPresidentName.text.readOnly = true;
						me.divisionPresidentEmail.text.readOnly = true;
					}
					
					break;
			}
			
			me.resizeControls();
		},
				
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			disablePopup();

			var index = me.itemGrid.activeRowIndex;
			if (index >= 0)
				me.itemGrid.body.deselect(index, true);

			for (var index = me.poCapitalRequisitionItems.length - 1; index >= 0; index--) {
				if (me.poCapitalRequisitionItems[index].id == 0)
					me.poCapitalRequisitionItems.splice(index, 1);
			}

			for (var index = me.poCapitalRequisitionDocuments.length - 1; index >= 0; index--) {
				if (me.poCapitalRequisitionDocuments[index].id == 0)
					me.poCapitalRequisitionDocuments.splice(index, 1);
			}

			if (me.capitalRequisitionGrid.activeRowIndex >= 0) {
				me.poCapitalRequisitionId = me.capitalRequisitionGrid.data[me.capitalRequisitionGrid.activeRowIndex].id;
				me.setDetailInfo();
			}

			me.wizardCount = 0;	
			me.status = "";
			me.setStatus("Loaded");
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
				me.documentTitle.setValue(me.poCapitalRequisitionDocuments[index].title);
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
							var item = new fin.pur.poCapitalRequisition.POCapitalRequisitionDocument(0, me.documentTitle.getValue(), me.fileName, tempFileName);
							me.poCapitalRequisitionDocuments.push(item);
							me.documentGrid.setData(me.poCapitalRequisitionDocuments);
						}
						else {
							var index = me.documentGrid.activeRowIndex;
							me.poCapitalRequisitionDocuments[index].title = me.documentTitle.getValue();
							me.poCapitalRequisitionDocuments[index].fileName = me.fileName;
							me.poCapitalRequisitionDocuments[index].tempFileName = tempFileName;
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
				if (me.poCapitalRequisitionDocuments[index].id > 0) {
					me.status = "DeleteDocument";
					$("#popupMessageToUser").text("Removing");
					me.actionSaveItem();
				}
				me.poCapitalRequisitionDocuments.splice(index, 1);
				me.documentGrid.setData(me.poCapitalRequisitionDocuments);
			}
		},

		actionViewItem: function() {
			var me = this;
			var index = me.documentGrid.activeRowIndex;
				
			if (index != -1) {
				if (me.poCapitalRequisitionDocuments[index].id > 0) {
					me.setStatus("Downloading");
					$("#popupMessageToUser").text("Downloading");
					$("#popupLoading").fadeIn("slow");
					me.fileNameStore.reset();
					me.fileNameStore.fetch("userId:[user],type:poCapitalRequisitionDocument"
						+ ",id:" + me.poCapitalRequisitionDocuments[index].id
						+ ",fileName:" + me.poCapitalRequisitionDocuments[index].fileName
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
		
		actionSendRequisitionItem: function() {
			var me = this;
			
			if (me.capitalRequisitionGrid.activeRowIndex == -1)
				return true;
			
			$("#messageToUser").text("Sending Requisition");
			me.status = "SendRequisition";
			me.actionSaveItem();
		},

		actionResendRequisitionItem: function() {
			var me = this;
			
			if (me.capitalRequisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Resending Requisition");
			me.status = "ResendRequisition";
			me.actionSaveItem();
		},
		
		actionCancelRequisitionItem: function() {
            var me = this;      
            
            if (me.capitalRequisitionGrid.activeRowIndex == -1)
                return true;
                
            $("#messageToUser").text("Cancelling Requisition");
            me.status = "CancelRequisition";
            me.actionSaveItem();
        },
		
		actionGeneratePurchaseOrderItem: function() {
			var me = this;
			
			if (me.capitalRequisitionGrid.activeRowIndex == -1)
				return true;

			$("#messageToUser").text("Generating Purchase Order");
			me.status = "GeneratePurchaseOrder";
			me.actionSaveItem();
		},
		
		actionJDEEntryItem: function() {
            var me = this;
            
            if (me.capitalRequisitionGrid.activeRowIndex == -1)
                return true;
 
            $("#messageToUser").text("Saving JDE Entry");
            me.status = "JDEEntry";
            me.actionSaveItem();
        },

		actionPrintItem: function() {
			var me = this;
			
			if (me.capitalRequisitionGrid.activeRowIndex == -1)
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
			var index = me.capitalRequisitionGrid.activeRowIndex;

			if (me.status == "NewPOCapitalRequisition" || me.status == "EditPOCapitalRequisition") {
				me.validator.forceBlur();
	
				// Check to see if the data entered is valid
				if (!me.validatePOCapitalRequisition()) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}

				disablePopup();
				me.itemGrid.body.deselectAll();

				item = new fin.pur.poCapitalRequisition.POCapitalRequisition(
					me.poCapitalRequisitionId
					, (me.status == "NewPOCapitalRequisition" ? 0 : me.capitalRequisitionGrid.data[index].requisitionNumber)
					, (me.status == "NewPOCapitalRequisition" ? 1 : me.capitalRequisitionGrid.data[index].statusType)
					, (me.status == "NewPOCapitalRequisition" ? parent.fin.appUI.houseCodeId : me.capitalRequisitionGrid.data[index].houseCode)
					, (me.status == "NewPOCapitalRequisition" ? parent.fin.appUI.houseCodeTitle : me.capitalRequisitionGrid.data[index].houseCodeTitle)
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
					, me.projectNumber.getValue()
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
					, $("input[name='Funding']:checked").val()
					, $("input[name='BusinessType']:checked").val()
					, $("input[name='Budgeting']:checked").val()
					, ""
					, me.regionalManagerName.getValue()
					, me.regionalManagerTitle.getValue()
					, me.regionalManagerEmail.getValue()
					, me.divisionPresidentName.getValue()
					, me.divisionPresidentEmail.getValue()
					, me.financeDirectorName.getValue()
					, me.financeDirectorEmail.getValue()
					, me.chiefFinancialOfficer
					, me.chiefExecutiveOfficer
					, false
					, (me.taxPercent.getValue() != "" && !isNaN(me.taxPercent.getValue())) ? parseFloat(me.taxPercent.getValue()).toFixed(2) : 0
					, (me.taxAmount.getValue() != "" && !isNaN(me.taxAmount.getValue())) ? parseFloat(me.taxAmount.getValue()).toFixed(2) : 0
					, (me.freight.getValue() != "" && !isNaN(me.freight.getValue())) ? parseFloat(me.freight.getValue()).toFixed(2) : 0
					);

				$("#messageToUser").text("Saving");
			}			
			else if (me.status == "SendRequisition" || me.status == "ResendRequisition") {
				item = me.capitalRequisitionGrid.data[index];
				item.statusType = 2;
			}
			else if (me.status == "CancelRequisition") {
                item = me.capitalRequisitionGrid.data[index];
                item.statusType = 6;                
            }
			else if (me.status == "ApproveRequisition") {
                item = me.capitalRequisitionGrid.data[index];
                item.statusType = 8;                
            }
			else if (me.status == "GeneratePurchaseOrder"  || me.status == "PrintRequisition") {
				item = me.capitalRequisitionGrid.data[index];
			}
			else if (me.status == "JDEEntry") {
                item = me.capitalRequisitionGrid.data[index];
                item.statusType = 9;                
            }
					
			var xml = me.saveXmlBuildPOCapitalRequisition(item);
			
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
		
		saveXmlBuildPOCapitalRequisition: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pur.poCapitalRequisition.POCapitalRequisition}
			});			
			var me = this;
			var item = args.item;
			var xml = "";

			if (me.status == "NewPOCapitalRequisition" || me.status == "EditPOCapitalRequisition") {
				if (me.currentVendorTitle != "") {
					xml += '<purPOCapitalRequisitionItemDelete';
					xml += ' id="0"';
					xml += ' poCapitalRequisitionId="' + me.poCapitalRequisitionId + '"';
					xml += ' houseCodeId="' + item.houseCode + '"';
					xml += ' vendorTitle="' + ui.cmn.text.xml.encode(me.currentVendorTitle) + '"';
					xml += '/>';
				}
				xml += '<purPOCapitalRequisition';
				xml += ' id="' + item.id + '"';
				xml += ' requisitionNumber="' + item.requisitionNumber + '"';
				xml += ' houseCodeId="' + item.houseCode + '"';
				xml += ' houseCodeJobId="' + item.houseCodeJob + '"';
				xml += ' requestorName="' + ui.cmn.text.xml.encode(item.requestorName) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' projectNumber="' + ui.cmn.text.xml.encode(item.projectNumber) + '"';
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
				xml += ' funding="' + item.funding + '"';
				xml += ' businessType="' + item.businessType + '"';
				xml += ' budgeting="' + item.budgeting + '"';
				xml += ' chargeToPeriod="' + item.chargeToPeriod + '"';
				xml += ' regionalManagerName="' + ui.cmn.text.xml.encode(item.regionalManagerName) + '"';
				xml += ' regionalManagerTitle="' + ui.cmn.text.xml.encode(item.regionalManagerTitle) + '"';
				xml += ' regionalManagerEmail="' + ui.cmn.text.xml.encode(item.regionalManagerEmail) + '"';
				xml += ' divisionPresidentName="' + ui.cmn.text.xml.encode(item.divisionPresidentName) + '"';
				xml += ' divisionPresidentEmail="' + ui.cmn.text.xml.encode(item.divisionPresidentEmail) + '"';
				xml += ' financeDirectorName="' + ui.cmn.text.xml.encode(item.financeDirectorName) + '"';
				xml += ' financeDirectorEmail="' + ui.cmn.text.xml.encode(item.financeDirectorEmail) + '"';
				xml += ' chiefFinancialOfficerName="' + ui.cmn.text.xml.encode(item.chiefFinancialOfficerName) + '"';
				xml += ' chiefExecutiveOfficerName="' + ui.cmn.text.xml.encode(item.chiefExecutiveOfficerName) + '"';
				xml += ' shipToAddress1="' + ui.cmn.text.xml.encode(item.shipToAddress1) + '"';
				xml += ' shipToAddress2="' + ui.cmn.text.xml.encode(item.shipToAddress2) + '"';
				xml += ' shipToCity="' + ui.cmn.text.xml.encode(item.shipToCity) + '"';
				xml += ' shipToState="' + item.shipToState + '"';
				xml += ' shipToZip="' + item.shipToZip + '"';
				xml += ' shipToPhone="' + fin.cmn.text.mask.phone(item.shipToPhone, true) + '"';
				xml += ' shipToFax="' + fin.cmn.text.mask.phone(item.shipToFax, true) + '"';
				xml += ' taxPercent="' + item.taxPercent + '"';
				xml += ' taxAmount="' + item.taxAmount + '"';
				xml += ' freight="' + item.freight + '"';
				xml += '/>';

				for (var index = me.poCapitalRequisitionItems.length - 1; index >= 0; index--) {
					if ($("#selectInputCheck" + index)[0].checked) {
						me.poCapitalRequisitionItems[index].itemSelect = true;
						me.poCapitalRequisitionItems[index].modified = true;
					}						
					else
						me.poCapitalRequisitionItems.splice(index, 1);
				}

				for (var index = 0; index < me.itemGrid.data.length; index++) {
					xml += '<purPOCapitalRequisitionItem';
					xml += ' id="' + (me.status == "NewPOCapitalRequisition" ? "0" : me.itemGrid.data[index].id) + '"';
					xml += ' poCapitalRequisitionId="' + me.poCapitalRequisitionId + '"';
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

				for (var index = 0; index < me.poCapitalRequisitionDocuments.length; index++) {
					if (me.poCapitalRequisitionDocuments[index].tempFileName != "") {
						xml += '<purPOCapitalRequisitionDocument';
						xml += ' id="' + me.poCapitalRequisitionDocuments[index].id + '"';;
						xml += ' title="' + ui.cmn.text.xml.encode(me.poCapitalRequisitionDocuments[index].title) + '"';
						xml += ' description=""';				
						xml += ' fileName="' + ui.cmn.text.xml.encode(me.poCapitalRequisitionDocuments[index].fileName) + '"';
						xml += ' tempFileName="' + ui.cmn.text.xml.encode(me.poCapitalRequisitionDocuments[index].tempFileName) + '"';
						xml += '/>';
					}
				}
			}

			if (me.status == "SendRequisition" || me.status == "ResendRequisition" || me.status == "PrintRequisition") {
				xml += '<purPOCapitalRequisitionEmailNotification';
				xml += ' id="' + me.poCapitalRequisitionId + '"';
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
				xml += ' requestedDate="' + item.requestedDate + '"';
				xml += ' deliveryDate="' + item.deliveryDate + '"';
				xml += ' projectNumber="' + ui.cmn.text.xml.encode(item.projectNumber) + '"';
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
				xml += ' funding="' + item.funding + '"';
				xml += ' businessType="' + item.businessType + '"';
				xml += ' budgeting="' + item.budgeting + '"';
				xml += ' chargeToPeriod=""';
				xml += ' regionalManagerName="' + ui.cmn.text.xml.encode(item.regionalManagerName) + '"';
				xml += ' regionalManagerTitle="' + ui.cmn.text.xml.encode(item.regionalManagerTitle) + '"';
				xml += ' regionalManagerEmail="' + ui.cmn.text.xml.encode(item.regionalManagerEmail) + '"';
				xml += ' divisionPresidentName="' + ui.cmn.text.xml.encode(item.divisionPresidentName) + '"';
				xml += ' divisionPresidentEmail="' + ui.cmn.text.xml.encode(item.divisionPresidentEmail) + '"';
				xml += ' financeDirectorName="' + ui.cmn.text.xml.encode(item.financeDirectorName) + '"';
				xml += ' financeDirectorEmail="' + ui.cmn.text.xml.encode(item.financeDirectorEmail) + '"';
				xml += ' chiefFinancialOfficerName="' + ui.cmn.text.xml.encode(item.chiefFinancialOfficerName) + '"';
				xml += ' chiefExecutiveOfficerName="' + ui.cmn.text.xml.encode(item.chiefExecutiveOfficerName) + '"';
				xml += ' action="' + me.status + '"';
				xml += ' jdeCompleted="0"';
				xml += ' taxPercent="' + (item.taxPercent != 0 ? item.taxPercent : "") + '"';
				xml += ' freight="' + (item.freight != 0 ? item.freight : "") + '"';
				xml += ' step1ApprovedDate="' + me.step1ApprovedDate + '"';
				xml += ' step2ApprovedDate="' + me.step2ApprovedDate + '"';
				xml += ' step3ApprovedDate="' + me.step3ApprovedDate + '"';
				xml += ' step4ApprovedDate="' + me.step4ApprovedDate + '"';
				xml += ' step5ApprovedDate="' + me.step5ApprovedDate + '"';
				xml += '/>';
			}
			else if (me.status == "DeleteDocument") {
				xml += '<purPOCapitalRequisitionDocumentDelete';
				xml += ' id="' + me.poCapitalRequisitionDocuments[me.documentGrid.activeRowIndex].id + '"';			
				xml += '/>';
			}			
			else if (me.status == "CancelRequisition" || me.status == "ApproveRequisition" || me.status == "JDEEntry") {
                xml += '<purPOCapitalRequisitionStatusUpdate';
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
				xml += '<purPOCapitalRequisitionToPurchaseOrder';
				xml += ' id="' + me.poCapitalRequisitionId + '"';
				xml += ' houseCodeId="' + item.houseCode + '"';
				xml += ' requisitionNumber="' +  item.requisitionNumber + '"';
				xml += ' houseCode="' +  ui.cmn.text.xml.encode(item.houseCodeTitle) + '"';
				xml += ' vendorTitle="' +  ui.cmn.text.xml.encode(item.vendorTitle) + '"';
				xml += ' vendorNumber="' + ui.cmn.text.xml.encode(item.vendorNumber) + '"';
				xml += ' requestorEmail="' + ui.cmn.text.xml.encode(item.requestorEmail) + '"';
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
					me.status = "EditPOCapitalRequisition";
					me.setStatus("Edit");
					$("#popupLoading").fadeOut("slow");
				}
				else {
					$(args.xmlNode).find("*").each(function () { 
						switch (this.tagName) {
							case "purPOCapitalRequisition":
								if (me.status == "NewPOCapitalRequisition") {
									item.id = parseInt($(this).attr("id"), 10);
									item.requisitionNumber = $(this).attr("requisitionNumber");
									me.poCapitalRequisitions.push(item);
									me.capitalRequisitionGrid.setData(me.poCapitalRequisitions);
									me.capitalRequisitionGrid.body.select(me.poCapitalRequisitions.length - 1);
								}
								else if (me.status == "EditPOCapitalRequisition") {
                                    me.poCapitalRequisitions[me.lastSelectedRowIndex] = item;
                                    me.capitalRequisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
                                }								
								else if (me.status == "SendRequisition" || me.status == "ResendRequisition" 
									|| me.status == "CancelRequisition" || me.status == "ApproveRequisition") {
									item.stepBrief = "";
									me.poCapitalRequisitions[me.lastSelectedRowIndex] = item;
									me.capitalRequisitionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);									
									me.itemReadOnlyGrid.setData(me.poCapitalRequisitionItems);
									
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
									me.poCapitalRequisitions.splice(me.capitalRequisitionGrid.activeRowIndex, 1);
									me.capitalRequisitionGrid.setData(me.poCapitalRequisitions);
								}
								else if (me.status == "PrintRequisition") {
									$("#iFrameUpload")[0].contentWindow.document.getElementById("FileName").value = $(this).attr("fileName");
									$("#iFrameUpload")[0].contentWindow.document.getElementById("DownloadButton").click();
								}
								break;

							case "purPOCapitalRequisitionItem":
								var id = parseInt($(this).attr("id"), 10);
								if (id > 0) {
									for (var index = 0; index < me.poCapitalRequisitionItems.length; index++) {
										if (me.poCapitalRequisitionItems[index].modified) {
											if (me.poCapitalRequisitionItems[index].id == 0)
												me.poCapitalRequisitionItems[index].id = parseInt($(this).attr("id"), 10);
											me.poCapitalRequisitionItems[index].modified = false;
											break;
										}
									}
								}
								break;

							case "purPOCapitalRequisitionDocument":
								for (var index = 0; index < me.poCapitalRequisitionDocuments.length; index++) {
									if (me.poCapitalRequisitionDocuments[index].tempFileName != "") {
										if (me.poCapitalRequisitionDocuments[index].id == 0)
											me.poCapitalRequisitionDocuments[index].id = parseInt($(this).attr("id"), 10);
										me.poCapitalRequisitionDocuments[index].tempFileName = "";
										break;
									}
								}
								break;
						}
					});

					if (me.status == "EditPOCapitalRequisition")
						me.resetPOCapitalRequisitionItems(true);

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
				alert("[SAVE FAILURE] Error while updating PO Capital Requisition details: " + $(args.xmlNode).attr("message"));				
			}
			
			if (me.status != "DeleteDocument")
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
	var popupWidth = windowWidth - 70;
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

	$("#uploadPopup").css({
		"top": windowHeight/2 - $("#uploadPopup").height()/2,
		"left": windowWidth/2 - $("#uploadPopup").width()/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight + 100
	});
}

function onFileChange() {

	var fileName = $("#iFrameUpload")[0].contentWindow.document.getElementById("UploadFile").value;
	fileName = fileName.substring(fileName.lastIndexOf("\\") + 1) ;
	fin.pur.poCapitalRequisitionUi.fileName = fileName;

	if (fileName == "")
		fin.pur.poCapitalRequisitionUi.anchorUpload.display(ui.cmn.behaviorStates.disabled);
	else
		fin.pur.poCapitalRequisitionUi.anchorUpload.display(ui.cmn.behaviorStates.enabled);
}

function main() {

	fin.pur.poCapitalRequisitionUi = new fin.pur.poCapitalRequisition.UserInterface();
	fin.pur.poCapitalRequisitionUi.resize();
	fin.houseCodeSearchUi = fin.pur.poCapitalRequisitionUi;
}
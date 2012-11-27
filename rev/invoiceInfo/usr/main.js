ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.rev.invoiceInfo.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.button" , 5);
ii.Style( "fin.cmn.usr.dropDown" , 6);
ii.Style( "fin.cmn.usr.dateDropDown" , 7);

ii.Class({
    Name: "fin.rev.invoiceInfo.UserInterface",
    Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");
			
			me.invoiceId = searchString.substring(pos + 1);
			me.houseCode = 0;
				
			var index = parent.fin.revMasterUi.lastSelectedRowIndex;
			if (index >= 0) {
				me.invoice = parent.fin.revMasterUi.invoices[index];
				me.houseCode = me.invoice.houseCode;
			}				

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway,
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
						
			me.validator = new ui.ctl.Input.Validation.Master(); 
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "rev\\invoiceInfo";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
								
			me.defineFormControls();
			me.setTabIndexes();
			me.configureCommunications();
			
			me.taxExempt.fetchingData();
			me.billTo.fetchingData();
			me.state.fetchingData();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.taxExemptsLoaded();
			me.invoiceBillToStore.fetch("userId:[user],houseCode:" + me.houseCode, me.invoiceBillTosLoaded, me);
			me.stateTypeStore.fetch("userId:[user],", me.statesLoaded, me);
		},
		
		authorizationProcess: function fin_rev_invoiceInfo_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();			

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_rev_invoiceInfo_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
		},
		
		defineFormControls: function(){
			var me = this;
			
			me.taxExempt = new ui.ctl.Input.DropDown.Filtered({
		        id: "TaxExempt",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.taxExemptChanged(); },
				required : false
		    });
			
			me.taxExempt.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.taxId = new ui.ctl.Input.Text({
				id: "TaxId",
				maxLength: 9
			});
			
			me.taxId.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				
	
				if (me.taxExempt.indexSelected == 0) {
					if(me.taxId.getValue() == "") 
						return;
					if(/^\d{9}$/.test(me.taxId.getValue()) == false)
						this.setInvalid("Please enter valid Tax Id.");
				}
				else
					this.valid = true;
			});
			
			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.endDate = new ui.ctl.Input.Date({
		        id: "EndDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.endDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.endDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");

					if (new Date(enteredText) < new Date(me.startDate.text.value)) 
						this.setInvalid("The End Date should not be less than Start Date.");
				});
			
			me.invoiceDate = new ui.ctl.Input.Date({
		        id: "InvoiceDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.invoiceDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.invoiceDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.dueDate = new ui.ctl.Input.Date({
		        id: "DueDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.dueDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.dueDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
						
					if (new Date(enteredText) < new Date(me.invoiceDate.text.value)) 
						this.setInvalid("The Due Date should not be less than Invoice Date.");
				});
			
			me.billTo = new ui.ctl.Input.DropDown.Filtered({
		        id: "BillTo",
				formatFunction: function(type) { return type.billTo; },
				changeFunction: function() { me.billToChanged(); },
				required : false
		    });
			
			me.billTo.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.billTo.indexSelected == -1)
						this.setInvalid("Please select the correct Bill To.");
				});
			
			me.company = new ui.ctl.Input.Text({
				id: "Company",
				maxLength: 64
			});
			
			me.company.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.address1 = new ui.ctl.Input.Text({
				id: "Address1",
				maxLength: 100
			});
			
			me.address1.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.address2 = new ui.ctl.Input.Text({
				id: "Address2",
				maxLength: 100
			});
			
			me.city = new ui.ctl.Input.Text({
				id: "City",
				maxLength: 50
			});
			
			me.city.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.state = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function(type) { return type.name; },
				required : false
		    });
			
			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
			
			me.zip = new ui.ctl.Input.Text({
				id: "Zip",
				maxLength: 10
			});
			
			me.zip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
					
				if(me.zip.getValue() == "") 
					return;

				if(ui.cmn.text.validate.postalCode(me.zip.getValue()) == false)
					this.setInvalid("Please enter valid postal code. 99999 or 99999-9999.");
			});
			
			me.stateTax = new ui.ctl.Input.Money({
				id: "StateTax"
			});			
	
			me.localTax = new ui.ctl.Input.Money({
		        id: "LocalTax"
		    });
			
			me.poNumber = new ui.ctl.Input.Text({
				id: "PONumber",
				maxLength: 50
			});

			me.notes = $("#Notes")[0];

			$("#Notes").height(50);
			$("#Notes").keypress(function() {
				if (me.notes.value.length > 1023) {
					me.notes.value = me.notes.value.substring(0, 1024);
					return false;
				}
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
		},
		
		setTabIndexes: function() {
			var me = this;
			
			me.taxExempt.text.tabIndex = 1;
			me.taxId.text.tabIndex = 2;
			me.startDate.text.tabIndex = 3;
			me.endDate.text.tabIndex = 4;
			me.invoiceDate.text.tabIndex = 5;
			me.dueDate.text.tabIndex = 6;			
			me.billTo.text.tabIndex = 7;
			me.company.text.tabIndex = 8;
			me.address1.text.tabIndex = 9;
			me.address2.text.tabIndex = 10;
			me.city.text.tabIndex = 11;
			me.state.text.tabIndex = 12;
			me.zip.text.tabIndex = 13;
			me.stateTax.text.tabIndex = 14;
			me.localTax.text.tabIndex = 15;
			me.poNumber.text.tabIndex = 16;
			me.notes.tabIndex = 17;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.taxExempt.resizeText();
			me.taxId.resizeText();
			me.startDate.resizeText();
			me.endDate.resizeText();
			me.startPeriod.resizeText();
			me.invoiceDate.resizeText();
			me.dueDate.resizeText();
			me.billTo.resizeText();
			me.company.resizeText();
			me.address1.resizeText();
			me.address2.resizeText();
			me.city.resizeText();
			me.state.resizeText();
			me.startPeriod.resizeText();
			me.zip.resizeText();
			me.stateTax.resizeText();
			me.localTax.resizeText();
			me.poNumber.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_rev_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.rev.invoiceInfo.StateType,
				itemConstructorArgs: fin.rev.invoiceInfo.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.invoiceBillTos = [];
			me.invoiceBillToStore = me.cache.register({
				storeId: "revInvoiceBillTos",
				itemConstructor: fin.rev.invoiceInfo.InvoiceBillTo,
				itemConstructorArgs: fin.rev.invoiceInfo.invoiceBillToArgs,
				injectionArray: me.invoiceBillTos
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
						me.actionSaveItem();
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
		
		taxExemptsLoaded: function() {
			var me = this;
			
			me.taxExempts = [];
			me.taxExempts.push(new fin.rev.invoiceInfo.TaxExempt(1, "Yes"));
			me.taxExempts.push(new fin.rev.invoiceInfo.TaxExempt(0, "No"));
			me.taxExempt.setData(me.taxExempts);
		},
		
		taxExemptChanged: function() {
			var me = this;
			var index = me.taxExempt.indexSelected;
			
			if (index >= 0 && me.taxExempts[index].id == 1) {			
				index = me.billTo.indexSelected;
				
				if (index >= 0) {
					if (me.invoiceBillTos[index].taxId > 0) 
						me.taxId.setValue(me.invoiceBillTos[index].taxId);
				}
				me.taxId.text.readOnly = false;
			}
			else {
				me.taxId.text.readOnly = true;
				me.taxId.setValue("");
			}
		},		
	
		statesLoaded: function(me, activeId) {
			
			me.state.setData(me.stateTypes);
			me.invoiceInfoLoaded();
		},
		
		stateChanged: function() {
			var me = this;
			var stateId = 0;
			
			if (me.state.indexSelected == -1)
				return;
			
			stateId = me.stateTypes[me.state.indexSelected].id;	
		},
		
		invoiceBillTosLoaded: function(me, activeId) {
			
			if(parent.fin.revMasterUi.invoicingReadOnly) {				
				$("#TaxExemptText").attr('disabled', true);
				$("#TaxExemptAction").removeClass("iiInputAction");
				$("#TaxIdText").attr('disabled', true);
				$("#StartDateText").attr('disabled', true);
				$("#StartDateAction").removeClass("iiInputAction");
				$("#EndDateText").attr('disabled', true);
				$("#EndDateAction").removeClass("iiInputAction");
				$("#InvoiceDateText").attr('disabled', true);
				$("#InvoiceDateAction").removeClass("iiInputAction");
				$("#DueDateText").attr('disabled', true);
				$("#DueDateAction").removeClass("iiInputAction");
				$("#BillToText").attr('disabled', true);
				$("#BillToAction").removeClass("iiInputAction");
				$("#CompanyText").attr('disabled', true);
				$("#Address1Text").attr('disabled', true);
				$("#Address2Text").attr('disabled', true);
				$("#CityText").attr('disabled', true);
				$("#StateText").attr('disabled', true);
				$("#StateAction").removeClass("iiInputAction");
				$("#ZipText").attr('disabled', true);
				$("#StateTaxText").attr('disabled', true);
				$("#LocalTaxText").attr('disabled', true);
				$("#PONumberText").attr('disabled', true);
				$("#NotesText").attr('disabled', true);
				
				$("#AnchorSave").hide();
				$("#AnchorUndo").hide();								
			}
						
			me.billTo.setData(me.invoiceBillTos);						
		},
		
		billToChanged: function() {
			var me = this;
			var index = 0;
			var itemIndex = 0;			

			index = me.billTo.indexSelected;
			me.state.reset();

			if (index >= 0) {
				if (parent.parent.fin.appUI.houseCodeTitle == me.billTo.lastBlurValue)
					alert("Warning: You have selected a House Code as the customer.");

				itemIndex = me.taxExempt.indexSelected;

	            if (itemIndex >= 0 && me.taxExempts[itemIndex].id == 1) {
					if (me.invoiceBillTos[index].taxId > 0) 
						me.taxId.setValue(me.invoiceBillTos[index].taxId);
				}

				me.company.setValue(me.invoiceBillTos[index].company);
				me.address1.setValue(me.invoiceBillTos[index].address1);
				me.address2.setValue(me.invoiceBillTos[index].address2);
				me.city.setValue(me.invoiceBillTos[index].city);
				me.zip.setValue(me.invoiceBillTos[index].postalCode);
				
				itemIndex = ii.ajax.util.findIndexById(me.invoiceBillTos[index].stateType.toString(), me.stateTypes);
				if(itemIndex >= 0 && index != undefined)
					me.state.select(itemIndex, me.state.focused);
			}
			else {
				me.company.setValue("");
				me.address1.setValue("");
				me.address2.setValue("");
				me.city.setValue("");
				me.zip.setValue("");
			}
		},

		invoiceInfoLoaded: function() {
			var me = this;
			var index = 0;

			if(me.invoice == undefined) {
				
				$("#pageLoading").hide();
				me.resizeControls();
				return;
			}				

			if (me.invoice.taxExempt)
				me.taxExempt.select(0, me.taxExempt.focused);
			else {
				me.taxExempt.select(1, me.taxExempt.focused);
				me.taxId.text.readOnly = true;
			}				

			me.taxId.setValue(me.invoice.taxNumber);
			me.startDate.setValue(me.invoice.periodStartDate);
			me.endDate.setValue(me.invoice.periodEndDate);
			me.invoiceDate.setValue(me.invoice.invoiceDate);
			me.dueDate.setValue(me.invoice.dueDate);
			me.billTo.setValue(me.invoice.billTo);
			me.company.setValue(me.invoice.company);
			me.address1.setValue(me.invoice.address1);
			me.address2.setValue(me.invoice.address2);
			me.city.setValue(me.invoice.city);
			me.zip.setValue(me.invoice.postalCode);
			
			index = ii.ajax.util.findIndexById(me.invoice.stateType.toString(), me.stateTypes);
			if(index >= 0 && index != undefined)
				me.state.select(index, me.state.focused);

			me.stateTax.setValue(me.invoice.stateTax);
			me.localTax.setValue(me.invoice.localTax);
			me.poNumber.setValue(me.invoice.poNumber);
			me.notes.value = me.invoice.notes;
			me.stateTax.text.readOnly = true;
			me.localTax.text.readOnly = true;
									
			if (me.invoice.printed) {
				me.taxExempt.text.readOnly = true;				
				$("#TaxExemptAction").removeClass("iiInputAction");				
				me.taxId.text.readOnly = true;
				me.startDate.text.readOnly = true;				
				$("#StartDateAction").removeClass("iiInputAction");				
				me.endDate.text.readOnly = true;
				$("#EndDateAction").removeClass("iiInputAction");				
				me.invoiceDate.text.readOnly = true;
				$("#InvoiceDateAction").removeClass("iiInputAction");				
				me.dueDate.text.readOnly = true;
				$("#DueDateAction").removeClass("iiInputAction");				
				me.billTo.text.readOnly = true;
				$("#BillToAction").removeClass("iiInputAction");				
				me.company.text.readOnly = true;
				me.address1.text.readOnly = true;
				me.address2.text.readOnly = true;
				me.city.text.readOnly = true;
				me.state.text.readOnly = true;				
				$("#StateAction").removeClass("iiInputAction");				
				me.zip.text.readOnly = true;
				me.poNumber.text.readOnly = true;
				me.notes.readOnly = true;
				$("#anchorAlign").hide();				
			}
		},
		
		resetControls: function() {
			var me = this;
			
			me.validator.reset();
			me.taxExempt.reset();
			me.taxId.setValue("");
			me.startDate.setValue("");
			me.endDate.setValue("");
			me.invoiceDate.setValue("");
			me.dueDate.setValue("");
			me.billTo.reset();
			me.company.setValue("");
			me.address1.setValue("");
			me.address2.setValue("");
			me.city.setValue("");
			me.state.reset();
			me.zip.setValue("");
			me.stateTax.setValue("");
			me.localTax.setValue("");
			me.poNumber.setValue("");
			me.notes.value = "";
		},
		
		actionUndoItem: function() {
			var me = this;
			
			if (!me.invoice.printed)
				me.invoiceInfoLoaded();
		},
		
		actionSaveItem: function() {
			var me = this;
			
			if (me.invoice.printed)
				return false;
				
			me.validator.forceBlur();		
			
			// Check to see if the data entered is valid
			if(!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}
	
			parent.fin.revMasterUi.status = "Edit";
			parent.fin.revMasterUi.saveInvoice();
		}
		
	}
});

function main() {
	fin.invoiceInfoUi = new fin.rev.invoiceInfo.UserInterface();
	fin.invoiceInfoUi.resize();
}

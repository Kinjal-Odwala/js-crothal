ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.glm.master.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchJournalEntry" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);
ii.Style( "fin.cmn.usr.dateDropDown" , 9);
ii.Style( "fin.cmn.usr.tabs" , 7);

ii.Class({
    Name: "fin.glm.master.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.status = "";
			me.activeFrameId = 0;
			me.journalEntryNeedUpdate = true;
			me.houseCodeInfoNeedUpdate = true;
			me.houseCodeJobCredits = [];
			me.houseCodeJobDebits = [];
			
			if(!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\GeneralLedger\\JournalEntry";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.ajaxValidator = new ii.ajax.Validator(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();									

			me.session = new ii.Session(me.cache);
			
			$("#TabCollection a").click(function() {
				
				switch(this.id){
					case "TabJournalEntry":
						me.activeFrameId = 0;
						break;

					case "TabHouseCodeInfo":
						me.activeFrameId = 1;
						break;
					/*
					case "TabSummaryOfExpenses":
						me.activeFrameId = 2;
						break;
					*/	
				}

				me.journalEntryItemsLoad();
			});			
			
			me.defineFormControls();
			me.configureCommunications();

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchJournalEntry = new ui.lay.HouseCodeSearchJournalEntry();
			
			$('#container-1').tabs(1);
			$("#fragment-1").show();
			$("#fragment-2").hide();  
			$("#TabJournalEntry").parent().addClass("tabs-selected");
	
					
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			if(parent.fin.appUI.houseCodeId == 0)
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);
			
			ii.trace( "journalEntry Master - Init", ii.traceTypes.information, "Startup");			
        },
		
		authorizationProcess: function fin_glm_master_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.journalEntryReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_glm_master_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.glmMasterUi;
			var offset = 263;
			
			if (me != undefined)			
				me.journalEntry.setHeight($(me.journalEntry.element).parent().height() - 10);
			
			$("#iFrameJournalEntry").height($(window).height() - offset);
			$("#iFrameHouseCodeInfo").height($(window).height() - offset);
		},
	
		defineFormControls: function() {			
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save Journal Entry (Ctrl+S)", 
					title: "Save the current Journal Entry.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Journal Entry (Ctrl+N)", 
					title: "Save the current Journal Entry, and create a new blank Journal Entry.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo Journal Entry (Ctrl+U)", 
					title: "Undo the changes to Journal Entry being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})
				.addAction({
					id: "deleteAction", 
					brief: "Delete Journal Entry (Ctrl+D)", 
					title: "Delete the selected Journal Entry.",
					actionFunction: function() { me.actionDeleteItem(); }
				});
			
			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
				id: "FiscalYear",
				formatFunction: function( item ) { return item.name; },
				changeFunction: function() { me.yearChanged(); }
			});				

			me.loadButton = new ui.ctl.buttons.Sizeable({
				id: "LoadButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.journalEntrysLoad(); },
				hasHotState: true
			});			
					
			me.journalDate = new ui.ctl.Input.Date({
		        id: "JournalDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });	
			
			me.journalDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.journalDate.text.value;
					
					if(enteredText == "") 
						return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});		
			
			me.creditJob = new ui.ctl.Input.DropDown.Filtered({
				id: "CreditJob",
				formatFunction: function( type ) { return type.jobNumber + " - " + type.jobTitle; }
			});
							
		    me.creditAddress1 = new ui.ctl.Input.Text({
				id: "CreditAddress1"
			});
			
			me.creditAddress2 = new ui.ctl.Input.Text({
				id: "CreditAddress2"
			});
			
			me.creditCity = new ui.ctl.Input.Text({
				id: "CreditCity"
			});
			
			me.creditState = new ui.ctl.Input.Text({
				id: "CreditState"
			});
			
			me.creditZip = new ui.ctl.Input.Text({
				id: "CreditZip"
			});
			
			me.creditEmail = new ui.ctl.Input.Text({
				id: "CreditEmail",
				maxLength: 50
			});
			
			me.creditEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.creditEmail.getValue();
					
					if(enteredText == '') return;
					
					if(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
			});
				
			me.creditPhone = new ui.ctl.Input.Text({
				id: "CreditPhone",
				maxLength: 14
			});			
				
			me.creditPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.creditPhone.getValue();
					
					if(enteredText == '') return;
					
					me.creditPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.creditPhone.text.value;
					
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
			});
			
			me.debitJob = new ui.ctl.Input.DropDown.Filtered({
				id: "DebitJob",
				formatFunction: function( type ) { return type.jobNumber + " - " + type.jobTitle; }
			});
			
			me.debitAddress1 = new ui.ctl.Input.Text({
				id: "DebitAddress1"
			});			
			
			me.debitAddress2 = new ui.ctl.Input.Text({
				id: "DebitAddress2"
			});		
			
			me.debitCity = new ui.ctl.Input.Text({
				id: "DebitCity"
			});		
				
			me.debitState = new ui.ctl.Input.Text({
				id: "DebitState"
			});	
					
			me.debitZip = new ui.ctl.Input.Text({
				id: "DebitZip"
			});	
					
			me.debitEmail = new ui.ctl.Input.Text({
				id: "DebitEmail",
				maxLength: 50
			});	
			
			me.debitEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.debitEmail.getValue();
					
					if(enteredText == '') return;
					
					if(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
			});
					
			me.debitPhone = new ui.ctl.Input.Text({
				id: "DebitPhone",
				maxLength: 14
			});
				
			me.debitPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.debitPhone.getValue();
					
					if(enteredText == '') return;
					
					me.debitPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.debitPhone.text.value;
										
					if(ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
			});
			
			me.anchorItemSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.orderItemCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorDSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});	
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorDCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});	
			
			me.anchorDelete = new ui.ctl.buttons.Sizeable({
				id: "AnchorDDelete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDeleteItem(); },
				hasHotState: true
			});	
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Add New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});	
			
			me.journalEntry = new ui.ctl.Grid({
				id: "JournalEntry",
				selectFunction: function(index) { me.journalEntrySelect(index); }				
			});
			
			me.journalEntry.addColumn("id", "id", "Entry #", "Entry #", 70);
			me.journalEntry.addColumn("houseCodeCreditTitle", "houseCodeCreditTitle", "Credit Site", "Credit Site", 210);
			me.journalEntry.addColumn("houseCodeDebitTitle", "houseCodeDebitTitle", "Debit Site", "Debit Site", null);
			me.journalEntry.addColumn("amount", "amount", "Amount", "Amount", 100);
			me.journalEntry.addColumn("journalDate", "journalDate", "Date", "Date", 50);
			me.journalEntry.addColumn("status", "status", "Status", "Status", 90);
			me.journalEntry.capColumns();
		},			
		
		resizeControls: function() {
			var me = this;
			
			me.debitJob.resizeText();
			me.debitAddress1.resizeText();
			me.debitAddress2.resizeText();
			me.debitCity.resizeText();
			me.debitState.resizeText();
			me.debitZip.resizeText();
			me.debitEmail.resizeText();
			me.debitPhone.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {			
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.glm.master.HirNode,
				itemConstructorArgs: fin.glm.master.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.glm.master.HouseCode,
				itemConstructorArgs: fin.glm.master.houseCodeArgs,
				injectionArray: me.houseCodes			
			});	
			
			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.glm.master.FiscalYear,
				itemConstructorArgs: fin.glm.master.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});

			me.journalEntrys = [];
			me.journalEntryStore = me.cache.register({
				storeId: "journalEntrys",
				itemConstructor: fin.glm.master.JournalEntry,
				itemConstructorArgs: fin.glm.master.journalEntryArgs,
				injectionArray: me.journalEntrys
			});	
			
			me.journalEntrySites = [];
			me.journalEntrySiteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.glm.master.JournalEntrySite,
				itemConstructorArgs: fin.glm.master.journalEntrySiteArgs,
				injectionArray: me.journalEntrySites
			});	
			
			me.states = [];
			me.stateStore = me.cache.register({
			storeId: "stateTypes",
				itemConstructor: fin.glm.master.State,
				itemConstructorArgs: fin.glm.master.stateArgs,
				injectionArray: me.states
			});				
			
			me.exports = [];
			me.exportStore = me.cache.register({
			storeId: "journalEntryItemExports",
				itemConstructor: fin.glm.master.Export,
				itemConstructorArgs: fin.glm.master.exportArgs,
				injectionArray: me.exports
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.glm.master.Account,
				itemConstructorArgs: fin.glm.master.accountArgs,
				injectionArray: me.accounts
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.glm.master.HouseCodeJob,
				itemConstructorArgs: fin.glm.master.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
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

					case 68: //Ctrl+D
						me.actionDeleteItem();
						processed = true;
						break;

					case 78: // Ctrl+N
						me.actionNewItem();
						processed = true;
						break;
						
					case 83: //Ctrl+S
						me.actionSaveItem();
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

		houseCodesLoaded: function(me, activeId) { // House Codes

			ii.trace( "journalEntry Master - houseCodesLoaded", ii.traceTypes.information, "Startup");			
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}
			
			me.houseCodeGlobalParametersUpdate(false);
			
			me.fiscalYear.fetchingData();
			me.fiscalYearStore.fetch("userId:[user],", me.fiscalYearsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.journalEntrysLoad();
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
				
			if (me.houseCodeSearchJournalEntry.houseCodeType == "Credit") {
				me.houseCodeJobCredits = me.houseCodeJobs.slice();
				me.creditJob.setData(me.houseCodeJobCredits);
			}				
			else {
				me.houseCodeJobDebits = me.houseCodeJobs.slice();
				me.debitJob.setData(me.houseCodeJobDebits);
			}						
		},
		
		fiscalYearsLoaded: function(me, activeId) {
			
			ii.trace( "journalEntry Master - fiscalYearsLoaded", ii.traceTypes.information, "Startup");			
			
			var index = 0;
			
			me.fiscalYear.setData(me.fiscalYears);
			
			if(parent.fin.appUI.glbFscYear != undefined){
				index = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.fiscalYears);
				if (index != undefined) 
					me.fiscalYear.select(index, me.fiscalYear.focused);
			}		
				
			me.accountStore.fetch("userId:[user],moduleId:journalEntry,", me.accountsLoaded, me);
		},
		
		accountsLoaded: function(me, activeId) {
			
			me.journalEntrysLoad();
		},
		
		journalEntrysLoad: function() {

			ii.trace( "journalEntry Master - journalEntrysLoad", ii.traceTypes.information, "Startup");			

			var me = this;
		  
			if (parent.fin.appUI.houseCodeId <= 0) {

				return me.houseCodeSearchReset(true);
			}
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();	
			me.resizeControls();		
					
			me.journalEntryStore.fetch("userId:[user],fscYearId:" + me.fiscalYears[me.fiscalYear.indexSelected].id + ",houseCodeId:" + parent.fin.appUI.houseCodeId + ",", me.journalEntrysLoaded, me);
		},

		journalEntrysLoaded: function(me, activeId) {
			
			ii.trace( "journalEntry Master - journalEntrysLoaded'", ii.traceTypes.information, "Startup");			

			me.journalEntry.setData(me.journalEntrys);
			me.journalEntrySelected = 0;
			me.journalEntryNeedUpdate = true;
			me.houseCodeInfoNeedUpdate = true;
			me.resize();
			
			if (me.journalEntrys.length > 0) {
				me.journalEntry.body.select(0);
			}
			else {
				me.journalEntryItemsLoad();
			}
		},
		
		journalEntrySelect: function() {
			var args = ii.args(arguments, {index: { type: Number}});
			var me = this;

			me.journalEntryNeedUpdate = true;
			me.houseCodeInfoNeedUpdate = true;
			me.journalEntrySelected = me.journalEntrys[args.index].id;
			me.journalEntryItemsLoad();
		},
	
		journalEntryItemsLoad: function() {
			var me = this;					
			var queryString = "";
			
			//UI level security
			if(me.journalEntryReadOnly){
				$("#actionMenu").hide()
				$("#footerButton").hide()
			}

			switch(me.activeFrameId) {

				case 0:
				
					if ($("iframe")[0].contentWindow.fin == undefined || me.journalEntryNeedUpdate) {
						queryString = "?houseCodeId=" + parent.fin.appUI.houseCodeId + "&fiscalYearId=" + me.fiscalYears[me.fiscalYear.indexSelected].id + "&journalEntryId=" + me.journalEntrySelected + "&transferTypeId=0,";
						$("iframe")[0].src = "/fin/glm/journalEntry/usr/markup.htm" + queryString;
						me.journalEntryNeedUpdate = false;
					}			
					break;
					
				case 1:
				
					if ($("iframe")[1].contentWindow.fin == undefined || me.houseCodeInfoNeedUpdate) {
						$("iframe")[1].src = "/fin/glm/houseCodeInfo/usr/markup.htm";
						me.houseCodeInfoNeedUpdate = false;							
					}
					break;		
			}
			
			$("#pageLoading").hide();	
		},
	
		houseCodeJournalEntryChanged: function() { 
			var args = ii.args(arguments, {
				houseCodeType: {type: String}
			});

			var me = this;	
			
			if (args.houseCodeType == "Credit" && me.houseCodeSearchJournalEntry.houseCodeIdCredit > 0) {
				
				$("#journalEntryLoading").show();				
				me.journalEntrySiteStore.reset();
				me.journalEntrySiteStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchJournalEntry.houseCodeIdCredit + ",type:journalEntry,", me.journalEntryHouseCodesLoaded, me);
				me.creditJob.fetchingData();
				me.houseCodeJobStore.reset();
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchJournalEntry.houseCodeIdCredit, me.houseCodeJobsLoaded, me);
			}

			if (args.houseCodeType == "Debit" && me.houseCodeSearchJournalEntry.houseCodeIdDebit > 0) {
				
				$("#journalEntryLoading").show();
				me.journalEntrySiteStore.reset();
				me.journalEntrySiteStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchJournalEntry.houseCodeIdDebit + ",type:journalEntry,", me.journalEntryHouseCodesLoaded, me);
				me.debitJob.fetchingData();
				me.houseCodeJobStore.reset();
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchJournalEntry.houseCodeIdDebit, me.houseCodeJobsLoaded, me);
			}
		},		
		
		yearChanged: function() {
			var me = this;
			
			if (me.fiscalYear.indexSelected) {
				parent.fin.appUI.glbFscYear = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
			}		
		},
	
		journalEntryHouseCodesLoaded: function(me, activeId){
			
			if (me.houseCodeSearchJournalEntry.houseCodeType == "Credit" && me.journalEntrySites[0]) {
				
				me.creditAddress1.setValue(me.journalEntrySites[0].addressLine1);
				me.creditAddress2.setValue(me.journalEntrySites[0].addressLine2);
				me.creditCity.setValue(me.journalEntrySites[0].city);
				me.creditZip.setValue(me.journalEntrySites[0].postalCode);
				me.creditEmail.setValue("");
				me.creditPhone.setValue("");
				
				me.stateStore.reset();
				me.stateStore.fetch("userId:[user],appStateTypeId:" + me.journalEntrySites[0].state + ",", me.stateItemsLoaded, me);
			}
			
			else if (me.houseCodeSearchJournalEntry.houseCodeType == "Debit" && me.journalEntrySites[0]) {
				
				me.debitAddress1.setValue(me.journalEntrySites[0].addressLine1);
				me.debitAddress2.setValue(me.journalEntrySites[0].addressLine2);
				me.debitCity.setValue(me.journalEntrySites[0].city);
				me.debitZip.setValue(me.journalEntrySites[0].postalCode);
				me.debitEmail.setValue("");
				me.debitPhone.setValue("");

				me.stateStore.reset();
				me.stateStore.fetch("userId:[user],appStateTypeId:" + me.journalEntrySites[0].state + ",", me.stateItemsLoaded, me);
			}
			
			else {
				me.userControlsReset(me.houseCodeSearchJournalEntry.houseCodeType);
				$("#journalEntryLoading").hide();
			}
		},
		
		stateItemsLoaded: function(me, activeId) {			
			
			if(me.states.length <= 0){
				$("#journalEntryLoading").hide();
				return;
			}

			if (me.houseCodeSearchJournalEntry.houseCodeType == "Credit") 
				me.creditState.setValue(me.states[0].name);
			else 
				me.debitState.setValue(me.states[0].name);
			
			$("#journalEntryLoading").hide();
		},
		
		userControlsReset: function() {
			var args = ii.args(arguments, {
				houseCodeType: {type: String}
			});
			var me = this;			
			
			if (args.houseCodeType == "Credit") {
				me.creditJob.setData([]);
				me.creditJob.reset();
				me.creditAddress1.setValue("");
				me.creditAddress2.setValue("");
				me.creditCity.setValue("");
				me.creditState.setValue("");
				me.creditZip.setValue("");
				me.creditEmail.setValue("");
				me.creditPhone.setValue("");
			}
			
			if (args.houseCodeType == "Debit") {
				me.debitJob.setData([]);
				me.debitJob.reset();
				me.debitAddress1.setValue("");
				me.debitAddress2.setValue("");
				me.debitCity.setValue("");
				me.debitState.setValue("");
				me.debitZip.setValue("");
				me.debitEmail.setValue("");
				me.debitPhone.setValue("");			
			}
			
			me.validator.reset();
		},
		
		setControlsToReadOnly: function() {
			
			$("#CreditAddress1Text").attr('readonly', true);
			$("#CreditAddress2Text").attr('readonly', true);
			$("#CreditCityText").attr('readonly', true);
			$("#CreditStateText").attr('readonly', true);
			$("#CreditZipText").attr('readonly', true);			

			$("#DebitAddress1Text").attr('readonly', true);
			$("#DebitAddress2Text").attr('readonly', true);
			$("#DebitCityText").attr('readonly', true);
			$("#DebitStateText").attr('readonly', true);
			$("#DebitZipText").attr('readonly', true);
		},
		
		actionExportItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
			
			me.exportStore.fetch("userId:[user],", me.exportItemsLoaded, me);
		},
		
		exportItemsLoaded: function(me, activeId) {
	
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
		
			me.status = "";
			if(me.activeFrameId == 0 && me.journalEntry.activeRowIndex != -1) 
				$("iframe")[0].contentWindow.fin.journalEntryUi.actionUndoItem();
		},
		
		actionNewItem: function() {
			var me = this;	
			
			//UI level Security
			if(me.journalEntryReadOnly) return;		
			
			me.status = "new";
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			$("#divGrid").hide();
			$("#AnchorCancel").show();
			$("#entrySetup").show();
			$("#AnchorSave").show();
			$("#houseCodeCreditStatus").hide();
			$("#houseCodeDebitStatus").hide();
			
			loadPopup();
			
			me.houseCodeSearchJournalEntry.houseCodeJournalEntryParametersUpdate(true, null, "Credit");
			me.houseCodeSearchJournalEntry.houseCodeJournalEntryParametersUpdate(true, null, "Debit");
			
			me.journalDate.setValue("");
			me.userControlsReset("Credit");
			me.userControlsReset("Debit");
			me.setControlsToReadOnly();			
			me.validator.reset();
			
			$("#pageLoading").hide();
		},
		
		actionDeleteItem: function() {
			var me = this;
			
			if(me.journalEntryReadOnly) return;
			
			if (me.journalEntry.activeRowIndex == -1)
				return;
				
			if( me.journalEntrys[me.journalEntry.activeRowIndex].status != "Open") 
			{
				alert("The Journal Entry [" + me.journalEntrys[me.journalEntry.activeRowIndex].id + "] has already been delivered to Accounting for processing and can no longer be modified. Modifications can be made via a new journal entry or within an Open Journal Entry.");
				return;
			}
			
			if(confirm("Do you want to delete Journal Entry # [" + me.journalEntrys[me.journalEntry.activeRowIndex].id + "]?", "Yes", "No") == 0) 
				return;
			
			me.status = "delete";			
			me.actionSaveJournalEntry();
		},
		
		actionCancelItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
			
			if (me.status == "new"){
				$("#divGrid").show();
				
				$("#AnchorSave").hide();
				$("#AnchorCancel").hide();
				$("#entrySetup").hide();
	
				me.status = "";
				
				disablePopup();
			}
			else if(me.activeFrameId == 0) 
				$("iframe")[0].contentWindow.fin.journalEntryUi.actionUndoItem();
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
			
			if(me.journalEntryReadOnly) return;
			
			if (me.status == "new")
				me.actionSaveJournalEntry();
			else if(me.activeFrameId == 0) 
				$("iframe")[0].contentWindow.fin.journalEntryUi.actionSaveItem();
		},
				
		actionSaveJournalEntry: function() {
			var args = ii.args(arguments,{});
			var me = this;	
			var item = [];
			var xml = "";	
			var message = "";
			/*
			$("#houseCodeCreditContainer").html(
				'<input type="text" id="houseCodeCreditText" class="HouseCodeText" tabindex=0/>'
				+ '<div id="houseCodeCreditTextDropImage" class="HouseCodeDropDown"></div>'
				+ '<div class="iiInputStatus Invalid" title="Please Select Site."></div>');
			*/
			//<div class="iiInputStatus Invalid" title="Please Select Site."></div>
			if (me.houseCodeSearchJournalEntry.houseCodeIdCredit <= 0) {
				$("#houseCodeCreditStatus").show();
			}
			
			if (me.houseCodeSearchJournalEntry.houseCodeIdDebit <= 0) {
				$("#houseCodeDebitStatus").show();
			}
			
			if(me.status == "new")
			{
				// Check to see if the data entered is valid
			    if(!me.validator.queryValidity(true)) {
					message += "In order to save, the errors on the page must be corrected.\n";
				}			
			
				if ((parent.fin.appUI.houseCodeId != me.houseCodeSearchJournalEntry.houseCodeIdCredit) 
					&& (parent.fin.appUI.houseCodeId != me.houseCodeSearchJournalEntry.houseCodeIdDebit)){
					message += "House Code # [" + parent.fin.appUI.houseCodeTitle + "] must be selected as either the Credit Site House Code or the Debit Site House Code.\n";
				}
			
				if (me.houseCodeSearchJournalEntry.houseCodeIdCredit == 0 || me.houseCodeSearchJournalEntry.houseCodeIdDebit == 0){
					message += "Please select Credit/Debit House code.\n";
				}

				if (message.length > 0) {
					alert(message);
					return false;
				}
				
				var creditHouseCodeTitle = me.houseCodeSearchJournalEntry.houseCodeTitleCredit;
				var debitHouseCodeTitle = me.houseCodeSearchJournalEntry.houseCodeTitleDebit;
			
				if (me.creditJob.indexSelected > 0)
					creditHouseCodeTitle += " / " + me.houseCodeJobCredits[me.creditJob.indexSelected].jobNumber + " " + me.houseCodeJobCredits[me.creditJob.indexSelected].jobTitle;
				
				if (me.debitJob.indexSelected > 0)
					debitHouseCodeTitle += " / " + me.houseCodeJobDebits[me.debitJob.indexSelected].jobNumber + " " + me.houseCodeJobDebits[me.debitJob.indexSelected].jobTitle;
					
				item = new fin.glm.master.JournalEntry(
					  1
					, parent.fin.appUI.houseCodeId
					, me.houseCodeSearchJournalEntry.houseCodeIdCredit
					, me.creditJob.indexSelected <= 0 ? 0 : me.houseCodeJobCredits[me.creditJob.indexSelected].id
					, creditHouseCodeTitle
					, me.creditEmail.getValue()
					, fin.cmn.text.mask.phone(me.creditPhone.getValue(), true)
					, me.houseCodeSearchJournalEntry.houseCodeIdDebit
					, me.debitJob.indexSelected <= 0 ? 0 : me.houseCodeJobDebits[me.debitJob.indexSelected].id
					, debitHouseCodeTitle
					, me.debitEmail.getValue() 
					, fin.cmn.text.mask.phone(me.debitPhone.getValue(), true)
					, me.journalDate.text.value				
					//, me.weekPeriodYears[0].periodId
					, parent.fin.appUI.glbFscPeriod
					//, me.weekPeriodYears[0].yearId
					, parent.fin.appUI.glbFscYear
					//, me.weekPeriodYears[0].week
					, parent.fin.appUI.glbWeek
					, "0.00"
					, "Open"
					);				
				
				xml = me.saveXmlBuildJournalEntry(item);
			}
		   
			if(me.status == "delete")
			{
				xml = me.saveXmlBuildJournalEntry();
			}
		   
		   	$("#messageToUser").text("Saving");
			$("#pageLoading").show();
		
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseJournalEntry,
				referenceData: {me: me, item: item}
			});	
					
			return true;
		},
		
		saveXmlBuildJournalEntry: function() {
			var args = ii.args(arguments,{
				item: {type: fin.glm.master.JournalEntry, required: false}
			});
			var me = this;			
			var item = args.item;
			var xml = "";			
			
			if (me.status == "new") {
				
				xml += '<journalEntry';
				xml += ' hcmHouseCode="' + item.hcmHouseCodeId + '"';
				xml += ' hcmHouseCodeCredit="' + item.houseCodeCredit + '"';
				xml += ' houseCodeJobCredit="' + item.houseCodeJobCredit + '"';
				xml += ' glmJoueHouseCodeEmailCredit="' + item.houseCodeEmailCredit + '"';
				xml += ' glmJoueHouseCodePhoneCredit="' + item.houseCodePhoneCredit + '"';
				xml += ' hcmHouseCodeDebit="' + item.houseCodeDebit + '"';
				xml += ' houseCodeJobDebit="' + item.houseCodeJobDebit + '"';
				xml += ' glmJoueHouseCodeEmailDebit="' + item.houseCodeEmailDebit + '"';
				xml += ' glmJoueHouseCodePhoneDebit="' + item.houseCodePhoneDebit + '"';
				xml += ' glmJoueJournalDate="' + item.journalDate + '"';
				xml += ' glmJoueWeek="' + item.week + '"';
				xml += ' fscPeriod="' + item.fscPeriodId + '"';
				xml += ' fscYear="' + item.fscYearId + '"';
				xml += '/>';
			}
			
			if(me.status == "delete")
			{
				xml += '<journalEntryDelete';
				xml += ' journalEntryId="' + me.journalEntrys[me.journalEntry.activeRowIndex].id + '"';
				xml += '/>';
			}
			
			return xml;			
		},	
		
		saveResponseJournalEntry: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;				

			if (status == "success") {				
				
				if (me.status == "new") {
					
					$(args.xmlNode).find("*").each(function(){

						switch (this.tagName) {
						
							case "journalEntry":								
								
								$("iframe")[0].contentWindow.fin.journalEntryUi.resetGrids();
								if ($("iframe")[1].contentWindow.fin != undefined)
									$("iframe")[1].contentWindow.fin.houseCodeInfoUi.resetControls();
								
								$("#divGrid").show();
								$("#AnchorCancel").hide();
								$("#entrySetup").hide();
								$("#AnchorSave").hide();
								
								disablePopup();
								
								item.id = parseInt($(this).attr("id"), 10);
								item.journalDate = item.journalDate.substring(0,2) + "/" + item.journalDate.substring(8,10);
								
								me.journalEntrys.unshift(item);
								me.journalEntry.setData(me.journalEntrys);
								me.journalEntry.body.select(0);
								
								break;
						}
					});
				}
				
				if(me.status == "delete")
				{				
					$("iframe")[0].contentWindow.fin.journalEntryUi.resetGrids();
					if ($("iframe")[1].contentWindow.fin != undefined)
						$("iframe")[1].contentWindow.fin.houseCodeInfoUi.resetControls();	
					
					me.journalEntrys.splice(me.journalEntry.activeRowIndex, 1);
					me.journalEntry.setData(me.journalEntrys);
					
					if (me.journalEntrys.length > 0)
						me.journalEntry.body.select(0);								
				}
				
				me.status = "";
			}
			else {
				alert('Error while updating Journal Entry Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
			
			$("#pageLoading").hide();
		}
	}
});

function loadPopup() {
	
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

function main() {

	fin.glmMasterUi = new fin.glm.master.UserInterface();
	fin.glmMasterUi.resize();
	fin.houseCodeSearchUi = fin.glmMasterUi;
}

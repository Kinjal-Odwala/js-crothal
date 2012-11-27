ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.glm.houseCodeInfo.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);

ii.Class({
    Name: "fin.glm.houseCodeInfo.UserInterface",
    Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
				
			me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);			
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "glm\\houseCodeInfo";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.session = new ii.Session(me.cache);

			me.defineFormControls();	
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);	
			
			me.setReadonlyControls();
			me.houseCodeInfoLoaded();
		},
		
		authorizationProcess: function fin_glm_houseCodeInfo_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_glm_houseCodeInfo_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});

		},
			
		defineFormControls: function() {
			var me = this;			
			
			me.creditCompany = new ui.ctl.Input.Text({
				id: "CreditCompany"
			});
			
			me.creditJob = new ui.ctl.Input.Text({
				id: "CreditJob"
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
				id: "CreditEmail"
			});
			
			me.creditPhone = new ui.ctl.Input.Text({
				id: "CreditPhone"
			});
			
			me.creditPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
		
					var enteredText = me.creditPhone.getValue();
					
					if(enteredText == '') return;
					
					me.creditPhone.text.value = fin.cmn.text.mask.phone(enteredText);
			});
			
			me.debitJob = new ui.ctl.Input.Text({
				id: "DebitJob"
			});
			
			me.debitCompany = new ui.ctl.Input.Text({
				id: "DebitCompany"
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
				id: "DebitEmail"
			});
			
			me.debitPhone = new ui.ctl.Input.Text({
				id: "DebitPhone"
			});
				
			me.debitPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.debitPhone.getValue();
					
					if(enteredText == '') return;
					
					me.debitPhone.text.value = fin.cmn.text.mask.phone(enteredText);
			});
		},			
			
		resizeControls: function() {
			var me = this;
			
			me.creditCompany.resizeText();
			me.creditJob.resizeText();
			me.creditAddress1.resizeText();
			me.creditAddress2.resizeText();
			me.creditCity.resizeText();
			me.creditState.resizeText();
			me.creditZip.resizeText();
			me.creditEmail.resizeText();
			me.creditPhone.resizeText();
			me.debitJob.resizeText();
			me.debitCompany.resizeText();
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
			var me = this;
					
			me.journalEntrySites = [];
			me.journalEntrySiteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.glm.houseCodeInfo.JournalEntrySite,
				itemConstructorArgs: fin.glm.houseCodeInfo.journalEntrySiteArgs,
				injectionArray: me.journalEntrySites
			});
			
			me.states = [];
			me.stateStore = me.cache.register({
			storeId: "stateTypes",
				itemConstructor: fin.glm.houseCodeInfo.State,
				itemConstructorArgs: fin.glm.houseCodeInfo.stateArgs,
				injectionArray: me.states
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.glm.houseCodeInfo.HouseCodeJob,
				itemConstructorArgs: fin.glm.houseCodeInfo.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
		},
		
		controlKeyProcessor: function () {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
					case 68: //Ctrl+D
						parent.fin.glmMasterUi.actionDeleteItem();
						processed = true;
						break;

					case 78: // Ctrl+N
						parent.fin.glmMasterUi.actionNewItem();
						processed = true;
						break;
						
					case 83: //Ctrl+S
						processed = true;
						break;

					case 85: //Ctrl+U
						processed = true;
						break;
				}
				
				if (processed) {
					return false;
				}
			}
		},
		
		houseCodeInfoLoaded: function() {			
			var me = this;
			var index = 0;
					
			index = parent.fin.glmMasterUi.journalEntry.activeRowIndex;
						
			if (index >= 0) {
				me.journalEntryInfo = parent.fin.glmMasterUi.journalEntrys[index];
				me.journalEntryCreditId = me.journalEntryInfo.houseCodeCredit;
				me.journalEntryDebitId = me.journalEntryInfo.houseCodeDebit;
				me.journalEntrySiteStore.fetch("userId:[user],houseCodeId:" + me.journalEntryCreditId + ",type:journalEntry,", me.journalEntryCreditSiteItemsLoaded, me);
			}
			else {
				me.resetControls();
				$("#pageLoading").hide();
				me.resizeControls();
			}	
		},
				
		journalEntryCreditSiteItemsLoaded: function(me, activeId) {
			
			if (me.journalEntrySites[0] != undefined) {
				var company = "";
				var jobTitle = "";		
				var index = me.journalEntryInfo.houseCodeCreditTitle.indexOf("/");
				
				if(index >= 0) {
					company = me.journalEntryInfo.houseCodeCreditTitle.substring(0, index - 1);
					jobTitle = me.journalEntryInfo.houseCodeCreditTitle.substring(index + 2);
				}
				else
					company = me.journalEntryInfo.houseCodeCreditTitle;
					
				me.creditCompany.setValue(company);
				me.creditJob.setValue(jobTitle);
				me.creditAddress1.setValue(me.journalEntrySites[0].addressLine1);
				me.creditAddress2.setValue(me.journalEntrySites[0].addressLine2);
				me.creditCity.setValue(me.journalEntrySites[0].city);				
				me.creditZip.setValue(me.journalEntrySites[0].postalCode);
				me.creditEmail.setValue(me.journalEntryInfo.houseCodeEmailCredit);
				me.creditPhone.setValue(me.journalEntryInfo.houseCodePhoneCredit);
				
				me.stateStore.fetch("userId:[user],appStateTypeId:" + me.journalEntrySites[0].state + ",", me.creditStateItemsLoaded, me);	
								
				me.journalEntrySiteStore.reset();
			}
			else
				me.resetCreditControls();
			
			me.journalEntrySiteStore.fetch("userId:[user],houseCodeId:" + me.journalEntryDebitId + ",type:journalEntry,", me.journalEntryDebitSiteItemsLoaded, me);		
		},	
		
		creditStateItemsLoaded: function(me, activeId) {			
			
			me.creditState.setValue(me.states[0].name);
		},
		
		journalEntryDebitSiteItemsLoaded: function(me, activeId) {			
				
			if (me.journalEntrySites[0] != undefined) {
				var company = "";
				var jobTitle = "";		
				var index = me.journalEntryInfo.houseCodeDebitTitle.indexOf("/");
				
				if(index >= 0) {
					company = me.journalEntryInfo.houseCodeDebitTitle.substring(0, index - 1);
					jobTitle = me.journalEntryInfo.houseCodeDebitTitle.substring(index + 2);
				}
				else
					company = me.journalEntryInfo.houseCodeDebitTitle;
					
				me.debitCompany.setValue(company);
				me.debitJob.setValue(jobTitle);
				me.debitAddress1.setValue(me.journalEntrySites[0].addressLine1);
				me.debitAddress2.setValue(me.journalEntrySites[0].addressLine2);
				me.debitCity.setValue(me.journalEntrySites[0].city);				
				me.debitZip.setValue(me.journalEntrySites[0].postalCode);
				me.debitEmail.setValue(me.journalEntryInfo.houseCodeEmailDebit);
				me.debitPhone.setValue(me.journalEntryInfo.houseCodePhoneDebit);	
				
				me.stateStore.fetch("userId:[user],appStateTypeId:" + me.journalEntrySites[0].state + ",", me.debitStateItemsLoaded, me);				
			}
			else
				me.resetDebitControls();
					
			$("#pageLoading").hide();	
		},
		
		debitStateItemsLoaded: function(me, activeId) {			
			
			me.debitState.setValue(me.states[0].name);
		},
		
		setReadonlyControls: function() {
			var me = this;
		
			me.creditCompany.text.readOnly = true;
			me.creditJob.text.readOnly = true;	
			me.creditAddress1.text.readOnly = true;
			me.creditAddress2.text.readOnly = true;
			me.creditCity.text.readOnly = true;
			me.creditState.text.readOnly = true;
			me.creditZip.text.readOnly = true;		
			me.creditEmail.text.readOnly = true;
			me.creditPhone.text.readOnly = true;
			
			me.debitCompany.text.readOnly = true;
			me.debitJob.text.readOnly = true;
			me.debitAddress1.text.readOnly = true;
			me.debitAddress2.text.readOnly = true;
			me.debitCity.text.readOnly = true;
			me.debitState.text.readOnly = true;
			me.debitZip.text.readOnly = true;
			me.debitEmail.text.readOnly = true;
			me.debitPhone.text.readOnly = true;
		},
		
		resetControls: function() {
			var me = this;
			
			me.resetCreditControls();
			me.resetDebitControls();			
		},
		
		resetCreditControls: function() {
			var me = this;
			
			me.creditCompany.setValue("");
			me.creditJob.setValue("");	
			me.creditAddress1.setValue("");
			me.creditAddress2.setValue("");
			me.creditCity.setValue("");
			me.creditState.setValue("");
			me.creditZip.setValue("");			
			me.creditEmail.setValue("");
			me.creditPhone.setValue("");
		},
		
		resetDebitControls: function() {
			var me = this;
			
			me.debitCompany.setValue("");
			me.debitJob.setValue("");
			me.debitAddress1.setValue("");
			me.debitAddress2.setValue("");
			me.debitCity.setValue("");
			me.debitState.setValue("");
			me.debitZip.setValue("");
			me.debitEmail.setValue("");
			me.debitPhone.setValue("");
		}
	}
});

function main() {
	fin.houseCodeInfoUi = new fin.glm.houseCodeInfo.UserInterface();
	fin.houseCodeInfoUi.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.glm.journalEntry.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);

ii.Class({
    Name: "fin.glm.journalEntry.UserInterface",
    Definition: {		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;			
			var queryStringArgs = {}; 
			var queryString = location.search.substring(1); 
			var pairs = queryString.split("&");
			
			for(var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			me.houseCodeId = queryStringArgs["houseCodeId"];
			me.fiscalYearId = queryStringArgs["fiscalYearId"];
			me.journalEntryId = queryStringArgs["journalEntryId"];
			
			me.creditTotal = 0.00;
			me.debitTotal = 0.00;

			me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(me.gateway, function(status, errorMessage){
				me.nonPendingError(status, errorMessage);
			}); 
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "glm\\journalentry";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
							
			me.validator = new ui.ctl.Input.Validation.Master(); 
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();			
			me.configureCommunications();	

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.accountsLoaded();
			
		},
		
		authorizationProcess: function fin_glm_journalEntry_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_glm_journalEntry_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function(){
			var args = ii.args(arguments,{});
			var offset =  65;

			fin.journalEntryUi.journalEntryCredit.setHeight($(window).height() - offset);
			fin.journalEntryUi.journalEntryDebit.setHeight($(window).height() - offset);
		},
			
		defineFormControls: function(){
			var me = this;

			me.journalEntryCredit = new ui.ctl.Grid({
				id: "JournalEntryCredit",
				allowAdds: true,
				createNewFunction: fin.glm.journalEntry.JournalEntryItem		
			});
			
			me.creditAccount = new ui.ctl.Input.DropDown.Filtered({
		        id: "CreditAccount" ,
		        formatFunction: function( account ){ return account.code + ' ' + account.name; },
		        appendToId: "JournalEntryCreditControlHolder",
				changeFunction: function() { parent.fin.glmMasterUi.modified(); }
		    });		
		
		    me.creditAccount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.creditAccount.indexSelected == -1)
						this.setInvalid("Please select the correct Credit Account.");
				});
				
			me.creditAmount = new ui.ctl.Input.Money({
		        id: "CreditAmount" ,
				appendToId : "JournalEntryCreditControlHolder",
				changeFunction: function() { parent.fin.glmMasterUi.modified(); }
		    });	
				
		    me.creditAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )

			me.journalEntryDebit = new ui.ctl.Grid({
				id: "JournalEntryDebit",
				allowAdds: true,
				createNewFunction: fin.glm.journalEntry.JournalEntryItem	
			});
			
			me.debitAccount = new ui.ctl.Input.DropDown.Filtered({
		        id: "DebitAccount" ,
		        formatFunction: function( account ){ return account.code + ' ' + account.name; },
		        appendToId: "JournalEntryDebitControlHolder",
				changeFunction: function() { parent.fin.glmMasterUi.modified(); }
		    });		
		
		    me.debitAccount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.debitAccount.indexSelected == -1)
						this.setInvalid("Please select the correct Debit Account.");
				});
				
		    me.debitAmount = new ui.ctl.Input.Money({
		        id: "DebitAmount" ,
				appendToId : "JournalEntryDebitControlHolder",
				changeFunction: function() { parent.fin.glmMasterUi.modified(); }
		    });	
			
		    me.debitAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )

			if(parent.fin.glmMasterUi.journalEntrys.length <= 0) {

				me.journalEntryCredit.allowAdds = false;
				me.journalEntryDebit.allowAdds = false;
				
				me.journalEntryCredit.addColumn("accountId", "accountId", "Credit Account", "Credit Account", 150);
				me.journalEntryCredit.addColumn("amount", "amount", "Amount", "Amount", 100);
	
				me.journalEntryDebit.addColumn("accountId", "accountId", "Debit Account", "Debit Account", 150);
				me.journalEntryDebit.addColumn("amount", "amount", "Amount", "Amount", 100);
			}
			else if(parent.fin.glmMasterUi.journalEntrys[parent.fin.glmMasterUi.journalEntry.activeRowIndex].status != "Open") {

				me.journalEntryCredit.allowAdds = false;
				me.journalEntryDebit.allowAdds = false;
				
				me.journalEntryCredit.addColumn("accountId", "accountId", "Credit Account", "Credit Account", 150, function( account ){ return account.code + ' ' + account.name; });
				me.journalEntryCredit.addColumn("amount", "amount", "Amount", "Amount", 100, function( amount ){ return amount.toFixed(2); });
	
				me.journalEntryDebit.addColumn("accountId", "accountId", "Debit Account", "Debit Account", 150, function( account ){ return account.code + ' ' + account.name; });
				me.journalEntryDebit.addColumn("amount", "amount", "Amount", "Amount", 100, function( amount ){ return amount.toFixed(2); });
			}
			else {
				me.journalEntryCredit.addColumn("accountId", "accountId", "Credit Account", "Credit Account", 150, function( account ){ return account.code + ' ' + account.name; }, me.creditAccount);
				me.journalEntryCredit.addColumn("amount", "amount", "Amount", "Amount", 100, function( amount ){ return amount.toFixed(2); }, me.creditAmount);
	
				me.journalEntryDebit.addColumn("accountId", "accountId", "Debit Account", "Debit Account", 150, function( account ){ return account.code + ' ' + account.name; }, me.debitAccount);
				me.journalEntryDebit.addColumn("amount", "amount", "Amount", "Amount", 100, function( amount ){ return amount.toFixed(2); }, me.debitAmount);
			}
			
			me.journalEntryCredit.addColumn("transactionStatusTitle", "transactionStatusTitle", "Status", "Status", null);
			me.journalEntryCredit.capColumns();
			
			me.journalEntryDebit.addColumn("transactionStatusTitle", "transactionStatusTitle", "Status", "Status", null);
			me.journalEntryDebit.capColumns();
		},	
		
		resizeControls: function() {
			var me = this;
			
			me.creditAccount.resizeText();
			me.creditAmount.resizeText();
			me.debitAccount.resizeText();
			me.debitAmount.resizeText();
			me.resize();
		},
		
		configureCommunications: function(){
			var me = this;
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.glm.journalEntry.Account,
				itemConstructorArgs: fin.glm.journalEntry.accountArgs,
				injectionArray: me.accounts
			});
			
			me.journalEntryItems = [];
			me.journalEntryItemStore = me.cache.register({
				storeId: "journalEntryItems",
				itemConstructor: fin.glm.journalEntry.JournalEntryItem,
				itemConstructorArgs: fin.glm.journalEntry.journalEntryItemArgs,
				injectionArray: me.journalEntryItems,
				lookupSpec: {accountId: me.accounts}
			});			
		},
				
		accountsLoaded: function() {
			var me = this;
			var account;
			
			for (var index = 0; index < parent.fin.glmMasterUi.accounts.length; index++) {
				account = parent.fin.glmMasterUi.accounts[index];
				me.accounts.push(new fin.glm.journalEntry.Account(account.id, account.number, account.code, account.name))
			}
			
			me.creditAccount.reset();
			me.creditAccount.setData(me.accounts);
			
			me.debitAccount.reset();
			me.debitAccount.setData(me.accounts);	

			me.journalEntryItemsLoad();
		},	

		journalEntryItemsLoad: function(){
			var me = this;
			
			$("#messageToUser").html("Loading");
			$("#pageLoading").show();
			
			me.journalEntryItemStore.reset();
			me.journalEntryItemStore.fetch("userId:[user],journalEntryId:" + me.journalEntryId + ",transferTypeId:0,", me.journalEntryItemsLoaded, me);
		},
		
		journalEntryItemsLoaded: function(me, activeId){

			var index = 0;
			
			//UI level Security
			if(parent.fin.glmMasterUi.journalEntryReadOnly){
				me.journalEntryCredit.columns["accountId"].inputControl = null;
				me.journalEntryCredit.columns["amount"].inputControl = null;
				me.journalEntryCredit.allowAdds = false;
				
				me.journalEntryDebit.columns["accountId"].inputControl = null;
				me.journalEntryDebit.columns["amount"].inputControl = null;
				me.journalEntryDebit.allowAdds = false;
			}

			me.creditTotal = 0.00;
			me.debitTotal = 0.00;

			me.journalEntryCreditItems = [];
			me.journalEntryDebitItems = [];
			
			for(index = 0; index < me.journalEntryItems.length; index++){
				
				if (me.journalEntryItems[index].transferTypeId == "1"){ //Credit
					me.journalEntryCreditItems.push(me.journalEntryItems[index]);
					me.creditTotal += parseFloat(me.journalEntryItems[index].amount);
				}
				else {
					me.journalEntryDebitItems.push(me.journalEntryItems[index]);
					me.debitTotal += parseFloat(me.journalEntryItems[index].amount);
				}
			}

			me.journalEntryCredit.setData(me.journalEntryCreditItems);
			me.journalEntryDebit.setData(me.journalEntryDebitItems);

			$("#CreditTotal").html(me.creditTotal.toFixed(2));
			$("#DebitTotal").html(me.debitTotal.toFixed(2));

			$("#pageLoading").hide();
			me.resizeControls();
		},
		
		resetGrids: function() {
			var me = this;
			
			me.journalEntryCredit.setData([]);
			me.journalEntryDebit.setData([]);
			$("#CreditTotal").html("");
			$("#DebitTotal").html("");
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
		
		actionUndoItem: function(){
			var me = this;			
			
			me.journalEntryCredit.body.deselectAll();
			me.journalEntryDebit.body.deselectAll();
			
			me.journalEntryCredit.setData([]);
			me.journalEntryDebit.setData([]);

			me.journalEntryItemsLoad();
		},
		
		actionSaveItem: function(){
			var me = this;			
			var item = [];
			var index = 0;
			
			if(parent.fin.glmMasterUi.journalEntryReadOnly) return;
			
			if(me.journalEntryCredit.activeRowIndex < 0) return;
			if(me.journalEntryDebit.activeRowIndex < 0) return;
			
			me.journalEntryCredit.body.deselectAll();
			me.journalEntryDebit.body.deselectAll();
			
			me.validator.forceBlur();			
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true)){
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			if ((parent.fin.glmMasterUi.journalEntrys.length == 0) 
				|| (me.journalEntryCredit.data.length == 0 && me.journalEntryDebit.data.length == 0))
				return;
			
			me.creditTotal = 0.00;
			me.debitTotal = 0.00;
			
			for(index = 0; index < me.journalEntryCreditItems.length; index++){
			
				item.push(
					new fin.glm.journalEntry.JournalEntryItem(
						 me.journalEntryCreditItems[index].id //id: {type: Number},
						, parseInt(me.journalEntryId) //journalEntryId: {type: Number},
						, '1/1/1900' //expenseDate: {type: Date},
						, '0' //associatedRecurringFixedCost: {type: String},
						, parseFloat('-' + me.journalEntryCreditItems[index].amount) //amount: {type: String},
						, me.journalEntryCreditItems[index].accountId //accountId: {type: fin.glm.journalEntry.Account, required: false},
						, 1 //transferTypeId: {type: Number},
						, 0 //transactionStatusTypeId: {type: Number},
						, '' //transactionStatusTitle:{type: String},
						, true //active: {type: Boolean}
					)
				);
				
				me.creditTotal += parseFloat(me.journalEntryCreditItems[index].amount);
			}
			
			for(index = 0; index < me.journalEntryDebitItems.length; index++){
			
				item.push(
					new fin.glm.journalEntry.JournalEntryItem(
						 me.journalEntryDebitItems[index].id //id: {type: Number},
						, parseInt(me.journalEntryId) //journalEntryId: {type: Number},
						, '1/1/1900' //expenseDate: {type: Date},
						, '0' //associatedRecurringFixedCost: {type: String},
						, me.journalEntryDebitItems[index].amount //amount: {type: String},
						, me.journalEntryDebitItems[index].accountId //accountId: {type: fin.glm.journalEntry.Account, required: false},
						, 2 //transferTypeId: {type: Number},
						, 0 //transactionStatusTypeId: {type: Number},
						, '' //transactionStatusTitle:{type: String},
						, true //active: {type: Boolean}
					)
				);
				
				me.debitTotal += parseFloat(me.journalEntryDebitItems[index].amount);
			}
			
			$("#CreditTotal").html(me.creditTotal.toFixed(2));
			$("#DebitTotal").html(me.debitTotal.toFixed(2));
			
			if(me.creditTotal != me.debitTotal){
				alert('The Total Credit Amount must equal the Total Debit Amount.');
				return false;
			}

			var xml = me.saveXmlBuild(item);

			$("#messageToUser").html("Saving");
			$("#pageLoading").show();
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuild: function(){
			var args = ii.args(arguments,{
				item: {type: [fin.glm.journalEntry.JournalEntryItem]}
			});
			
			var me = this;
			var item = args.item;
			var xml = "";
			var index = 0;
			
			for (var index=0; index < me.journalEntryCredit.deleteTransactions.length; index++) {

				xml += '<journalEntryItemDelete';
				xml += ' id="' + me.journalEntryCredit.deleteTransactions[index] + '"';
				xml += '/>';
			};
			
			for (var index=0; index < me.journalEntryDebit.deleteTransactions.length; index++) {

				xml += '<journalEntryItemDelete';
				xml += ' id="' + me.journalEntryDebit.deleteTransactions[index] + '"';
				xml += '/>';
			};
			
			for (index in item) {
				
				xml += '<journalEntryItem'
					+ ' id="' + item[index].id + '"'
					+ ' journalEntryId="' + item[index].journalEntryId + '"'
					+ ' expenseDate="' + item[index].expenseDate + '"'
					+ ' associatedRecurringFixedCost="' + item[index].associatedRecurringFixedCost + '"'
					+ ' amount="' + item[index].amount + '"'
					+ ' accountId="' + item[index].accountId.id + '"'
					+ ' transferTypeId="' + item[index].transferTypeId + '"'
					+ ' transactionStatusTypeId="' + item[index].transactionStatusTypeId + '"'
					+ ' transactionStatusTitle="' + item[index].transactionStatusTitle + '"'
					+ ' active="' + item[index].active + '"'
					+ '/>';
			}
			
			return xml;
		},
		
		saveResponse: function(){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});

			$("#pageLoading").hide();

			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id =  parseInt($(this).attr("id"),10);
			var clientId = parseInt($(this).attr("clientId"),10);
			var success = true;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var rowCounter = 0;
			var debitRowCounter = 0;
			
			if(status == "success"){
				parent.fin.glmMasterUi.modified(false);
				$(args.xmlNode).find("*").each(function (){

					switch (this.tagName) {
						case "journalEntryItem":
							
							id = parseInt($(this).attr("id"), 10);
							clientId = parseInt($(this).attr("clientId"), 10);
							
							if (rowCounter < me.journalEntryCreditItems.length) {
								if (me.journalEntryCreditItems[rowCounter] != undefined) {
									//if new record
									if (me.journalEntryCreditItems[rowCounter].id == 0) {
										me.journalEntryCreditItems[rowCounter].transferTypeId = 1; //Credit
										me.journalEntryCreditItems[rowCounter].transactionStatusTypeId = 1;
										me.journalEntryCreditItems[rowCounter].transactionStatusTitle = 'Open';
									}
									
									me.journalEntryCreditItems[rowCounter].id = id;
									me.journalEntryCredit.body.renderRow(rowCounter, rowCounter);
								}
							}
							else{
								if (me.journalEntryDebitItems[debitRowCounter] != undefined) {
									//if new record
									if (me.journalEntryDebitItems[debitRowCounter].id == 0) {
										me.journalEntryDebitItems[debitRowCounter].transferTypeId = 2; //Credit
										me.journalEntryDebitItems[debitRowCounter].transactionStatusTypeId = 1;
										me.journalEntryDebitItems[debitRowCounter].transactionStatusTitle = 'Open';
									}
									
									me.journalEntryDebitItems[debitRowCounter].id = id;
									me.journalEntryDebit.body.renderRow(debitRowCounter, debitRowCounter);
								}
								
								debitRowCounter++;
							}
							
							rowCounter++;
							break;
					}
				});
				
				var indexJournalEntrySelected = parent.fin.glmMasterUi.journalEntry.activeRowIndex;
				parent.fin.glmMasterUi.journalEntrys[indexJournalEntrySelected].amount = me.creditTotal.toFixed(2);
				parent.fin.glmMasterUi.journalEntry.body.renderRow(indexJournalEntrySelected, indexJournalEntrySelected);
			}
			else{
				alert('Error while updating Journal Entry Items: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				if( status == "invalid" ){
					traceType = ii.traceTypes.warning;
				}
				else{
					errorMessage += " [SAVE FAILURE]";
				}
			}
		}
	}
});

function main(){
	fin.journalEntryUi = new fin.glm.journalEntry.UserInterface();
	fin.journalEntryUi.resize();
}

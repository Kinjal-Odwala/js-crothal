ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.fsc.account.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.button" , 8);

ii.Class({
    Name: "fin.fsc.account.UserInterface",
    Definition: {
	
		init: function () {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.accountId = 0;
			me.status = "";
			me.lastSelectedIndex = -1;	
			me.accountReadOnly = false;
			
			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			); //@iiDoc {Property:ii.ajax.TransactionMonitor} The Person Ajax transaction monitor.
						
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Fiscal\\ChartOfAccounts";
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
			
			me.accountCategory.fetchingData();
			me.accountCategoryStore.fetch("userId:[user]", me.accountCategorysLoaded, me);
		},
		
		authorizationProcess: function fin_fsc_account_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.accountReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.controlVisible();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_fsc_account_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
			
		resize: function() {
			var args = ii.args(arguments, {});
			
			fin.fsc.fscAccountUi.fiscalAccountGrid.setHeight($(window).height() - 85);
			$("#accountDetailContentArea").height($(window).height() - 127);					
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the current Account.",
					actionFunction: function(){ me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Account(Ctrl+N)", 
					title: "Save the current Account, and create a new blank Account.",
					actionFunction: function(){ me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Account (Ctrl+U)", 
					title: "Undo the changes to Account being edited.",
					actionFunction: function(){ me.actionUndoItem(); }
				});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() {	me.actionSaveItem(); },
				hasHotState: true
			});
			
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
			
			me.accountCategory = new ui.ctl.Input.DropDown.Filtered({
		        id: "category",
		        formatFunction: function( type ){ return type.name; },
		        required : false
		    });			

			me.accountCategory.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
								
			me.accountCode = new ui.ctl.Input.Text({
		        id: "code",
		        maxLength: 4
		    });
			
			me.accountCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.accountCode.getValue();
					
					if(enteredText == '') return;
					
					if(/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Account Code.");
				});

			me.accountDescription = new ui.ctl.Input.Text({
		        id: "desciption",
		        maxLength: 64
		    });
			
			me.accountDescription.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.accountEditCode = new ui.ctl.Input.Text({
		        id: "editCode",
		        maxLength: 16
		    });
			
			me.accountHeader = new ui.ctl.Input.Text({
		        id: "header",
		        maxLength: 16
		    });
			
			me.negativeValue = new ui.ctl.Input.Check({
		        id: "Negative" 
		    });
			
			me.bockImportExport = new ui.ctl.Input.Check({
		        id: "BockImport"
		    });
			
			me.budget = new ui.ctl.Input.Check({
		        id: "Budget" 
		    });
			
			me.accountPayables = new ui.ctl.Input.Check({
		        id: "AccountPayables" 
		    });
			
			me.salariesWages = new ui.ctl.Input.Check({
		        id: "SalariesWages" 
		    });
			
			me.recurringExpenses = new ui.ctl.Input.Check({
		        id: "RecurringExpenses" 
		    });
			
			me.fieldTransfers = new ui.ctl.Input.Check({
		        id: "FieldTransfers" 
		    });
			
			me.inventory = new ui.ctl.Input.Check({
		        id: "Inventory" 
		    });
			
			me.payrollWorksheet = new ui.ctl.Input.Check({
		        id: "PayrollWorksheet" 
		    });
			
			me.managementFee = new ui.ctl.Input.Check({
		        id: "ManagementFee" 
		    });
			
			me.directCost = new ui.ctl.Input.Check({
		        id: "DirectCost" 
		    });
			
			me.supplies = new ui.ctl.Input.Check({
		        id: "Supplies" 
		    });
			
			me.accountReceivable = new ui.ctl.Input.Check({
		        id: "AccountReceivable" 
		    });
			
			me.wor = new ui.ctl.Input.Check({
		        id: "WOR" 
		    });
			
			me.otherRevenue = new ui.ctl.Input.Check({
		        id: "OtherRevenue" 
		    });
			
			me.fiscalAccountGrid = new ui.ctl.Grid({
				id: "FiscalAccount",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
			});
			
			me.fiscalAccountGrid.addColumn("code", "code", "Code", "Code", 80);
			me.fiscalAccountGrid.addColumn("description", "description", "Description", "Description", null);
			me.fiscalAccountGrid.capColumns();
		},
		
		resizeControls: function() {
			var me = this;
			
			me.accountCategory.resizeText();
			me.accountDescription.resizeText();
			me.accountEditCode.resizeText();
			me.accountHeader.resizeText();
			me.resize();
		},
			
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.accountCategories = [];
			me.accountCategoryStore = me.cache.register({
				storeId: "accountCategorys",
				itemConstructor: fin.fsc.account.AccountCategory,
				itemConstructorArgs: fin.fsc.account.accountCategoryArgs,
				injectionArray: me.accountCategories
			});			

			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.fsc.account.Account,
				itemConstructorArgs: fin.fsc.account.accountArgs,
				injectionArray: me.accounts
			});			
		},
		
		controlVisible: function(){
			var me = this;
			
			if(me.accountReadOnly){
								
				$("#codeText").attr('disabled', true);
				$("#categoryText").attr('disabled', true);
				$("#categoryAction").removeClass("iiInputAction");
				$("#desciptionText").attr('disabled', true);
				$("#editCodeText").attr('disabled', true);
				$("#headerText").attr('disabled', true);
				$("#NegativeCheck").attr('disabled', true);
				$("#BudgetCheck").attr('disabled', true);
				$("#SalariesWagesCheck").attr('disabled', true);
				$("#FieldTransfersCheck").attr('disabled', true);
				$("#PayrollWorksheetCheck").attr('disabled', true);
				$("#DirectCostCheck").attr('disabled', true);
				$("#AccountReceivableCheck").attr('disabled', true);
				$("#OtherRevenueCheck").attr('disabled', true);
				$("#BockImportCheck").attr('disabled', true);
				$("#AccountPayablesCheck").attr('disabled', true);
				$("#RecurringExpensesCheck").attr('disabled', true);
				$("#InventoryCheck").attr('disabled', true);
				$("#ManagementFeeCheck").attr('disabled', true);
				$("#SuppliesCheck").attr('disabled', true);
				$("#WORCheck").attr('disabled', true);	
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
			
		},
		
		accountCategorysLoaded: function(me, activeId) {
			
			me.controlVisible();
			
			me.accountCategory.reset();
			me.accountCategory.setData(me.accountCategories);

			me.fiscalAccountGrid.setData([]);
			me.fiscalAccountGrid.setData(me.accounts);
			
			$("#pageLoading").hide();
			me.resizeControls();			
		},

		itemSelect: function() {
			var args = ii.args(arguments, {index: { type: Number }});
			var me = this;			
			var index = 0;
			var item = me.accounts[args.index];

			me.accountId = item.id;
			me.lastSelectedIndex = args.index;			
			me.accountCode.setValue(item.code);

			index = ii.ajax.util.findIndexById(item.accountCategoryId.toString(), me.accountCategories)
			if (index != undefined)
				me.accountCategory.select(index, me.accountCategory.focused);

			me.accountDescription.setValue(item.description);
			me.accountEditCode.setValue(item.postingEditCode);
			me.accountHeader.setValue(item.glHeader + '');
			
	        me.negativeValue.check.checked = item.negativeValue;
	        me.bockImportExport.check.checked = item.blockImportExport;
	        me.budget.check.checked = item.budget;
	        me.accountPayables.check.checked = item.accountsPayable;
	        me.salariesWages.check.checked = item.salariesWages;
	        me.recurringExpenses.check.checked = item.recurringExpenses;
	        me.fieldTransfers.check.checked = item.fieldTransfers;
	        me.inventory.check.checked = item.inventory;
	        me.payrollWorksheet.check.checked = item.payrollWorkSheet;
	        me.managementFee.check.checked = item.managementFee;
	        me.directCost.check.checked = item.directCost;
	        me.supplies.check.checked = item.supplies;
	        me.accountReceivable.check.checked = item.accountReceivables;
	        me.wor.check.checked = item.wor;
	        me.otherRevenue.check.checked = item.otherRevenue;
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

		actionNewItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if(me.accountReadOnly) return;
			
			me.status = "new";
			$("#NewAccount").show();
			me.actionResetItem();
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.status = "";
			$("#NewAccount").hide();
			
			if (me.lastSelectedIndex > 0) {
				me.fiscalAccountGrid.body.select(me.lastSelectedIndex);
				me.itemSelect(me.lastSelectedIndex);
			}
		},

		actionResetItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.accountId = 0;

			me.accountCode.setValue("");
			me.accountCategory.reset();
			me.accountDescription.setValue("");
			me.accountEditCode.setValue("");
			me.accountHeader.setValue("");
			
	        me.negativeValue.check.checked = false;
	        me.bockImportExport.check.checked = false;
	        me.budget.check.checked = false;
	        me.accountPayables.check.checked = false;
	        me.salariesWages.check.checked = false;
	        me.recurringExpenses.check.checked = false;
	        me.fieldTransfers.check.checked = false;
	        me.inventory.check.checked = false;
	        me.payrollWorksheet.check.checked = false;
	        me.managementFee.check.checked = false;
	        me.directCost.check.checked = false;
	        me.supplies.check.checked = false;
	        me.accountReceivable.check.checked = false;
	        me.wor.check.checked = false;
	        me.otherRevenue.check.checked = false;

			me.fiscalAccountGrid.body.deselectAll();			
			me.accountCode.text.focus();			
			me.validator.reset();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if(me.accountReadOnly) return;
				
			if((me.accountId <= 0 && me.status != "new") 
				|| (me.fiscalAccountGrid.indexSelected == -1 && me.status != "new")) {
				alert('Please select Account to save.');
				return false;
			}

			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if(!me.validator.queryValidity(true)) {
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			var item = new fin.fsc.account.Account(
				me.accountId
				, me.accountCategory.data[me.accountCategory.indexSelected].id
				, me.accountCategory.data[me.accountCategory.indexSelected].name
				, me.accountCode.getValue()
				, me.accountDescription.getValue()
				, me.accountEditCode.getValue()
				, me.accountHeader.getValue()
		        , me.negativeValue.check.checked
		        , me.bockImportExport.check.checked
		        , me.budget.check.checked
		        , me.accountPayables.check.checked
		        , me.salariesWages.check.checked
		        , me.recurringExpenses.check.checked
		        , me.fieldTransfers.check.checked
		        , me.inventory.check.checked
		        , me.payrollWorksheet.check.checked
		        , me.managementFee.check.checked
		        , me.directCost.check.checked
		        , me.supplies.check.checked
		        , me.accountReceivable.check.checked
		        , me.wor.check.checked
		        , me.otherRevenue.check.checked
				, true
			);
				
			var xml = me.saveXmlBuild(item);
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;			
		},
		
		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: { type: fin.fsc.account.Account }
			});
			var xml = "";
			var clientId = 0;

			xml += '<account'
			xml += ' id="' + args.item.id + '"';
			xml += ' accountCategoryId="' + args.item.accountCategoryId + '"';
			xml += ' code="' + args.item.code + '"';
			xml += ' description="' + ui.cmn.text.xml.encode(args.item.description) + '"';
			xml += ' postingEditCode="' + ui.cmn.text.xml.encode(args.item.postingEditCode) + '"';
			xml += ' glHeader="' + ui.cmn.text.xml.encode(args.item.glHeader) + '"';			
	        xml += ' negativeValue="' + args.item.negativeValue + '"';
	        xml += ' blockImportExport="' + args.item.blockImportExport + '"';
	        xml += ' budget="' + args.item.budget + '"';
	        xml += ' accountsPayable="' + args.item.accountsPayable + '"';
	        xml += ' salariesWages="' + args.item.salariesWages + '"';
	        xml += ' recurringExpense="' + args.item.recurringExpenses + '"';
	        xml += ' fieldTransfers="' + args.item.fieldTransfers + '"';
	        xml += ' inventory="' + args.item.inventory + '"';
	        xml += ' payrollWorkSheet="' + args.item.payrollWorkSheet + '"';
	        xml += ' managementFee="' + args.item.managementFee + '"';
	        xml += ' directCost="' + args.item.directCost + '"';
	        xml += ' supplies="' + args.item.supplies + '"';
	        xml += ' accountReceivable="' + args.item.accountReceivables + '"';
	        xml += ' wor="' + args.item.wor + '"';
	        xml += ' otherRevenue="' + args.item.otherRevenue + '"';
	        xml += ' active="' + args.item.active + '"';
	        xml += ' clientId="' + ++clientId + '"';
			xml += '/>';
			
			return xml;
		},	

		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id = parseInt($(this).attr("id"), 10);
			var errorMessage = "";
			var index;
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			
			$("#pageLoading").hide();
			
			if (status == "success") {
				$(args.xmlNode).find("*").each(function () {

					switch (this.tagName) {
						case "account":
							
							id = parseInt($(this).attr("id"), 10);
							
							item = new fin.fsc.account.Account(
								me.accountId
								, me.accountCategory.data[me.accountCategory.indexSelected].id
								, me.accountCategory.data[me.accountCategory.indexSelected].name
								, me.accountCode.getValue()
								, me.accountDescription.getValue()
								, me.accountEditCode.getValue()
								, me.accountHeader.getValue()
						        , me.negativeValue.check.checked
						        , me.bockImportExport.check.checked
						        , me.budget.check.checked
						        , me.accountPayables.check.checked
						        , me.salariesWages.check.checked
						        , me.recurringExpenses.check.checked
						        , me.fieldTransfers.check.checked
						        , me.inventory.check.checked
						        , me.payrollWorksheet.check.checked
						        , me.managementFee.check.checked
						        , me.directCost.check.checked
						        , me.supplies.check.checked
						        , me.accountReceivable.check.checked
						        , me.wor.check.checked
						        , me.otherRevenue.check.checked
								, true
							);
									
							if (me.fiscalAccountGrid.activeRowIndex < 0 && me.status == "new") {
								index = me.fiscalAccountGrid.data.length;
								item.id = id;
								me.accounts.push(item);
							}
							else if(me.fiscalAccountGrid.activeRowIndex >= 0){
								index = me.fiscalAccountGrid.activeRowIndex;
								me.accounts[me.fiscalAccountGrid.activeRowIndex] = item;
							}
															
							me.fiscalAccountGrid.setData(me.accounts);
							me.fiscalAccountGrid.body.select(index);
							me.status = "";
									
							break;
					}
				});
			}
			else {
				alert('Error while updating Chart of Account Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
		}
	}
});

function main() {
	fin.fsc.fscAccountUi = new fin.fsc.account.UserInterface();
	fin.fsc.fscAccountUi.resize();
}

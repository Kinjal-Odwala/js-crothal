ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.fsc.account.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.button", 8 );
ii.Style( "fin.cmn.usr.angular.css.typeahead", 9 );

ii.Class({
    Name: "fin.fsc.account.UserInterface",
    Definition: {

		init: function() {
			var me = this;

			me.accountId = 0;
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Fiscal\\ChartOfAccounts";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},

		authorizationProcess: function() {
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.accountReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.setupGLAccounts = me.authorizer.isAuthorized(me.authorizePath + "\\SetupGLAccounts");

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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.accountCategory.fetchingData();
				me.mopTotalType.fetchingData();
				if (me.setupGLAccounts)
					me.accountCategoryStore.fetch("userId:[user],statusType:2", me.accountCategorysLoaded, me);
				else
					me.accountCategoryStore.fetch("userId:[user]", me.accountCategorysLoaded, me);
				me.controlVisible();
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	

		sessionLoaded: function() {

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {

			fin.fsc.fscAccountUi.accountGrid.setHeight($(window).height() - 155);
			$("#accountDetailContentArea").height($(window).height() - 197);		
		},

		defineFormControls: function() {
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)",
					title: "Save the current Account details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo (Ctrl+U)",
					title: "Undo the changes to Account being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.viewNewGLAccountsLink = new ui.ctl.buttons.Simple({
				id: "ViewNewGLAccountsLink",
				className: "linkButton",
				clickFunction: function() { me.actionSearchItem(2); },
				hasHotState: true,
				title: "Click here to view the new GL Accounts",
			});

			me.viewCurrentGLAccountsLink = new ui.ctl.buttons.Simple({
				id: "ViewCurrentGLAccountsLink",
				className: "linkButton",
				clickFunction: function() { me.actionSearchItem(0); },
				hasHotState: true,
				title: "Click here to view the existing GL Accounts",
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() {	me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.accountGrid = new ui.ctl.Grid({
				id: "AccountGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 40,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.accountGrid.addColumn("code", "code", "Code", "Code", 120);
			me.accountGrid.addColumn("description", "description", "Description", "Description", null);
			me.accountGrid.capColumns();

			me.accountCategory = new ui.ctl.Input.DropDown.Filtered({
		        id: "AccountCategory",
		        formatFunction: function(type) { return type.name; },
		        required : false,
				changeFunction: function() { me.modified(); }
		    });

			me.accountCategory.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )

			me.accountCode = new ui.ctl.Input.Text({
		        id: "AccountCode",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });

			me.description = new ui.ctl.Input.Text({
		        id: "Desciption",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });

			me.postingEditCode = new ui.ctl.Input.Text({
		        id: "PostingEditCode",
		        maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.glHeader = new ui.ctl.Input.Text({
		        id: "GLHeader",
		        maxLength: 16,
				changeFunction: function() { me.modified(); }
		    });

			me.mopTotalType = new ui.ctl.Input.DropDown.Filtered({
		        id: "MOPTotalType",
		        formatFunction: function( type ) { return type.title; },
		        required : false,
				changeFunction: function() { me.modified(); }
		    });

			me.mopTotalType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.mopTotalType.indexSelected === -1)
						this.setInvalid("Please select the MOP / PL Option.");
				});

			me.negativeValue = new ui.ctl.Input.Check({
		        id: "Negative",
				changeFunction: function() { me.modified(); }
		    });

			me.bockImportExport = new ui.ctl.Input.Check({
		        id: "BockImport",
				changeFunction: function() { me.modified(); }
		    });

			me.budget = new ui.ctl.Input.Check({
		        id: "Budget",
				changeFunction: function() { me.modified(); }
		    });

			me.accountPayables = new ui.ctl.Input.Check({
		        id: "AccountPayables",
				changeFunction: function() { me.modified(); }
		    });

			me.salariesWages = new ui.ctl.Input.Check({
		        id: "SalariesWages",
				changeFunction: function() { me.modified(); }
		    });

			me.recurringExpenses = new ui.ctl.Input.Check({
		        id: "RecurringExpenses",
				changeFunction: function() { me.modified(); }
		    });

			me.fieldTransfers = new ui.ctl.Input.Check({
		        id: "FieldTransfers",
				changeFunction: function() { me.modified(); }
		    });

			me.inventory = new ui.ctl.Input.Check({
		        id: "Inventory",
				changeFunction: function() { me.modified(); }
		    });

			me.payrollWorksheet = new ui.ctl.Input.Check({
		        id: "PayrollWorksheet",
				changeFunction: function() { me.modified(); }
		    });

			me.managementFee = new ui.ctl.Input.Check({
		        id: "ManagementFee",
				changeFunction: function() { me.modified(); }
		    });

			me.directCost = new ui.ctl.Input.Check({
		        id: "DirectCost",
				changeFunction: function() { me.modified(); }
		    });

			me.supplies = new ui.ctl.Input.Check({
		        id: "Supplies",
				changeFunction: function() { me.modified(); }
		    });

			me.accountReceivable = new ui.ctl.Input.Check({
		        id: "AccountReceivable",
				changeFunction: function() { me.modified(); }
		    });

			me.wor = new ui.ctl.Input.Check({
		        id: "WOR",
				changeFunction: function() { me.modified(); }
		    });

			me.otherRevenue = new ui.ctl.Input.Check({
		        id: "OtherRevenue",
				changeFunction: function() { me.modified(); }
			});

			me.poCapitalRequisition = new ui.ctl.Input.Check({
			    id: "POCapitalRequisition",
			    changeFunction: function() { me.modified(); }
			});

			me.balanceSheet = new ui.ctl.Input.Check({
			    id: "BalanceSheet"
			});

			me.profitAndLoss = new ui.ctl.Input.Check({
			    id: "ProfitAndLoss"
			});

			me.blockDeletion = new ui.ctl.Input.Check({
			    id: "BlockDeletion"
			});

			me.blockCreation = new ui.ctl.Input.Check({
			    id: "BlockCreation"
			});

			me.blockPosting = new ui.ctl.Input.Check({
			    id: "BlockPosting"
			});

			me.active = new ui.ctl.Input.Check({
			    id: "Active"
			});

			me.accountList = new ui.ctl.Input.Text({
		        id: "AccountList",
		        maxLength: 4
		    });

			me.group = new ui.ctl.Input.Text({
		        id: "Group",
		        maxLength: 4
		    });

			me.matchCode = new ui.ctl.Input.Text({
		        id: "MatchCode",
		        maxLength: 25
		    });

			me.shortDescription = new ui.ctl.Input.Text({
		        id: "ShortDescription",
		        maxLength: 20
		    });
		},

		configureCommunications: function() {
			var me = this;

			me.accountCategories = [];
			me.accountCategoryStore = me.cache.register({
				storeId: "accountCategorys",
				itemConstructor: fin.fsc.account.AccountCategory,
				itemConstructorArgs: fin.fsc.account.accountCategoryArgs,
				injectionArray: me.accountCategories
			});

			me.mopTotalTypes = [];
			me.mopTotalTypeStore = me.cache.register({
				storeId: "mopTotalTypes",
				itemConstructor: fin.fsc.account.MOPTotalType,
				itemConstructorArgs: fin.fsc.account.mopTotalTypeArgs,
				injectionArray: me.mopTotalTypes
			});

			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.fsc.account.Account,
				itemConstructorArgs: fin.fsc.account.accountArgs,
				injectionArray: me.accounts
			});			
		},

		controlKeyProcessor: function() {
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

			if (processed) {
				return false;
			}
		},

		resizeControls: function() {
			var me = this;

			me.accountCategory.resizeText();
			me.description.resizeText();
			me.postingEditCode.resizeText();
			me.glHeader.resizeText();
			me.accountList.resizeText();
			me.group.resizeText();
			me.matchCode.resizeText();
			me.shortDescription.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.accountId = 0;
			me.validator.reset();
			me.accountCode.setValue("");
			me.accountCategory.reset();
			me.description.setValue("");
			me.postingEditCode.setValue("");
			me.glHeader.setValue("");
			me.mopTotalType.reset();
			me.accountList.setValue("");
			me.group.setValue("");
			me.matchCode.setValue("");
			me.shortDescription.setValue("");
	        me.negativeValue.setValue("false");
	        me.bockImportExport.setValue("false");
	        me.budget.setValue("false");
	        me.accountPayables.setValue("false");
	        me.salariesWages.setValue("false");
	        me.recurringExpenses.setValue("false");
	        me.fieldTransfers.setValue("false");
	        me.inventory.setValue("false");
	        me.payrollWorksheet.setValue("false");
	        me.managementFee.setValue("false");
	        me.directCost.setValue("false");
	        me.supplies.setValue("false");
	        me.accountReceivable.setValue("false");
	        me.wor.setValue("false");
	        me.otherRevenue.setValue("false");
	        me.poCapitalRequisition.setValue("false");
			me.balanceSheet.setValue("false");
			me.profitAndLoss.setValue("false");
			me.blockDeletion.setValue("false");
			me.blockCreation.setValue("false");
			me.blockPosting.setValue("false");
			me.active.setValue("false");
			me.accountCode.text.focus();
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

		controlVisible: function() {
			var me = this;

			$("#AccountCodeText").attr("disabled", true);
			$("#DesciptionText").attr("disabled", true);
			$("#BudgetCheck").attr("disabled", true);
			$("#AccountListText").attr("disabled", true);
			$("#GroupText").attr("disabled", true);
			$("#MatchCodeText").attr("disabled", true);
			$("#ShortDescriptionText").attr("disabled", true);
			$("#BalanceSheetCheck").attr("disabled", true);
			$("#ProfitAndLossCheck").attr("disabled", true);
			$("#BlockDeletionCheck").attr("disabled", true);
			$("#BlockCreationCheck").attr("disabled", true);
			$("#BlockPostingCheck").attr("disabled", true);
			$("#ActiveCheck").attr("disabled", true);

			if (me.accountReadOnly) {
				$("#AccountCategoryText").attr("disabled", true);
				$("#AccountCategoryAction").removeClass("iiInputAction");
				$("#PostingEditCodeText").attr("disabled", true);
				$("#GLHeaderText").attr("disabled", true);
				$("#MOPTotalTypeText").attr("disabled", true);
				$("#MOPTotalTypeAction").removeClass("iiInputAction");
				$("#NegativeCheck").attr("disabled", true);
				$("#SalariesWagesCheck").attr("disabled", true);
				$("#FieldTransfersCheck").attr("disabled", true);
				$("#PayrollWorksheetCheck").attr("disabled", true);
				$("#DirectCostCheck").attr("disabled", true);
				$("#AccountReceivableCheck").attr("disabled", true);
				$("#OtherRevenueCheck").attr("disabled", true);
				$("#BockImportCheck").attr("disabled", true);
				$("#AccountPayablesCheck").attr("disabled", true);
				$("#RecurringExpensesCheck").attr("disabled", true);
				$("#InventoryCheck").attr("disabled", true);
				$("#ManagementFeeCheck").attr("disabled", true);
				$("#SuppliesCheck").attr("disabled", true);
				$("#WORCheck").attr("disabled", true);
				$("#POCapitalRequisitionCheck").attr("disabled", true);
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},

		accountCategorysLoaded: function(me, activeId) {

			me.accountCategory.setData(me.accountCategories);
			me.mopTotalType.setData(me.mopTotalTypes);
			me.resizeControls();

			if (me.setupGLAccounts) {
				if (me.accounts.length === 0) {
					me.accountStore.fetch("userId:[user]", me.accountsLoaded, me);
				}
				else {
					$("#Notification").show();
					me.checkLoadCount();
				}
			}
			else {
				me.accountGrid.setData(me.accounts);
				me.checkLoadCount();
				var $scope = angular.element($("#SearchContainer")).scope();
				$scope.$apply(function() {
					$scope.accounts = me.accounts.slice();
				});
			}
		},

		accountsLoaded: function(me, activeId) {

			me.accountGrid.setData(me.accounts);
			var $scope = angular.element($("#SearchContainer")).scope();
			$scope.$apply(function() {
				$scope.accounts = me.accounts.slice();
			});
			me.checkLoadCount();
		},

		selectAccount: function(id) {
			var me = this;
			var index = ii.ajax.util.findIndexById(id, me.accounts);

			if (index !== null) {
				if (!parent.fin.cmn.status.itemValid()) {
//					var $scope = angular.element($("#SearchContainer")).scope();
//		            $scope.$apply(function() {
//		            	$scope.selected = "";
//		            });
					return;
				}

				if (me.accountGrid.activeRowIndex !== -1)
					me.accountGrid.body.deselect(me.accountGrid.activeRowIndex, true);
				me.accountGrid.body.select(index, true);
			}
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: { type: Number }
			});
			var me = this;
			var item = me.accounts[args.index];
			var itemIndex = 0;

			if (!parent.fin.cmn.status.itemValid()) {
				me.accountGrid.body.deselect(args.index, true);
				return;
			}

			me.lastSelectedRowIndex = args.index;
			me.mopTotalType.reset();
			me.accountId = item.id;
			me.accountCode.setValue(item.code);

			itemIndex = ii.ajax.util.findIndexById(item.accountCategoryId.toString(), me.accountCategories);
			if (itemIndex != undefined)
				me.accountCategory.select(itemIndex, me.accountCategory.focused);

			me.description.setValue(item.description);
			me.postingEditCode.setValue(item.postingEditCode);
			me.glHeader.setValue(item.glHeader + "");

			itemIndex = ii.ajax.util.findIndexById(item.mopTotalType.toString(), me.mopTotalTypes);
			if (itemIndex != undefined)
				me.mopTotalType.select(itemIndex, me.mopTotalType.focused);

			me.accountList.setValue(item.accountList);
			me.group.setValue(item.group);
			me.matchCode.setValue(item.matchCode);
			me.shortDescription.setValue(item.shortDescription);
	        me.negativeValue.setValue(item.negativeValue.toString());
	        me.bockImportExport.setValue(item.blockImportExport.toString());
	        me.budget.setValue(item.budget.toString());
	        me.accountPayables.setValue(item.accountsPayable.toString());
	        me.salariesWages.setValue(item.salariesWages.toString());
	        me.recurringExpenses.setValue(item.recurringExpenses.toString());
	        me.fieldTransfers.setValue(item.fieldTransfers.toString());
	        me.inventory.setValue(item.inventory.toString());
	        me.payrollWorksheet.setValue(item.payrollWorkSheet.toString());
	        me.managementFee.setValue(item.managementFee.toString());
	        me.directCost.setValue(item.directCost.toString());
	        me.supplies.setValue(item.supplies.toString());
	        me.accountReceivable.setValue(item.accountReceivables.toString());
	        me.wor.setValue(item.wor.toString());
	        me.otherRevenue.setValue(item.otherRevenue.toString());
	        me.poCapitalRequisition.setValue(item.poCapitalRequisition.toString());
			me.balanceSheet.setValue(item.balanceSheet.toString());
			me.profitAndLoss.setValue(item.profitAndLoss.toString());
			me.blockDeletion.setValue(item.blockDeletion.toString());
			me.blockCreation.setValue(item.blockCreation.toString());
			me.blockPosting.setValue(item.blockPosting.toString());
			me.active.setValue(item.active.toString());

			me.setStatus("Loaded");
		},

		actionSearchItem: function(statusType) {
			var me = this;

			me.setLoadCount();
			me.accountStore.fetch("userId:[user],statusType:" + statusType, me.accountsLoaded, me);
		},

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.lastSelectedRowIndex >= 0) {
				me.accountGrid.body.select(me.lastSelectedRowIndex);
			}
		},

		actionSaveItem: function() {
			var me = this;

			if (me.accountReadOnly || me.accountGrid.activeRowIndex === -1)
				return false;

			me.validator.forceBlur();
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.setStatus("Saving");

			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			var item = new fin.fsc.account.Account(
				me.accountId
				, me.accountCategory.data[me.accountCategory.indexSelected].id
				, me.accounts[me.accountGrid.activeRowIndex].statusType
				, me.accountCode.getValue()
				, me.description.getValue()
				, me.postingEditCode.getValue()
				, me.glHeader.getValue()
				, me.mopTotalType.data[me.mopTotalType.indexSelected].id
				, me.accountList.getValue()
				, me.group.getValue()
				, me.matchCode.getValue()
				, me.shortDescription.getValue()
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
                , me.poCapitalRequisition.check.checked
				, me.balanceSheet.check.checked
				, me.profitAndLoss.check.checked
				, me.blockDeletion.check.checked
				, me.blockCreation.check.checked
				, me.blockPosting.check.checked
				, me.active.check.checked
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
			var item = args.item;
			var xml = "";

			xml += '<account'
			xml += ' id="' + item.id + '"';
			xml += ' accountCategoryId="' + item.accountCategoryId + '"';
			xml += ' mopTotalType="' + item.mopTotalType + '"';
			xml += ' code="' + item.code + '"';
			xml += ' postingEditCode="' + ui.cmn.text.xml.encode(item.postingEditCode) + '"';
			xml += ' glHeader="' + ui.cmn.text.xml.encode(item.glHeader) + '"';
	        xml += ' negativeValue="' + item.negativeValue + '"';
	        xml += ' blockImportExport="' + item.blockImportExport + '"';
	        xml += ' accountsPayable="' + item.accountsPayable + '"';
	        xml += ' salariesWages="' + item.salariesWages + '"';
	        xml += ' recurringExpense="' + item.recurringExpenses + '"';
	        xml += ' fieldTransfers="' + item.fieldTransfers + '"';
	        xml += ' inventory="' + item.inventory + '"';
	        xml += ' payrollWorkSheet="' + item.payrollWorkSheet + '"';
	        xml += ' managementFee="' + item.managementFee + '"';
	        xml += ' directCost="' + item.directCost + '"';
	        xml += ' supplies="' + item.supplies + '"';
	        xml += ' accountReceivable="' + item.accountReceivables + '"';
	        xml += ' wor="' + item.wor + '"';
	        xml += ' otherRevenue="' + item.otherRevenue + '"';
	        xml += ' poCapitalRequisition="' + item.poCapitalRequisition + '"';
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
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function () {
					switch (this.tagName) {
						case "account":
							if (item.statusType === 2) {
								me.resetControls();
								me.accounts.splice(me.lastSelectedRowIndex, 1);
								me.accountGrid.setData(me.accounts);
								me.lastSelectedRowIndex = -1;
								if (me.accounts.length === 0) {
									$("#Notification").hide();
									me.actionSearchItem(0);
								}
							}
							else {
								me.accounts[me.lastSelectedRowIndex] = item;
								me.accountGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							break;
					}
				});

				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Chart of Account details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.fsc.fscAccountUi = new fin.fsc.account.UserInterface();
	fin.fsc.fscAccountUi.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.rev.master.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);
ii.Style( "fin.cmn.usr.tabs" , 9);
ii.Style( "fin.cmn.usr.button" , 11);

invoiceTypes = {	
	customerCloneYes: "CustomerCloneYes",
	customerCloneNo: "CustomerCloneNo",
	houseCodeCloneYes: "HouseCodeCloneYes",
	houseCodeCloneNo: "HouseCodeCloneNo",
	edit: "Edit"
};

ii.Class({
    Name: "fin.rev.master.UserInterface",
    Extends: "ui.lay.HouseCodeSearch",
    Definition: {

        init: function() {
            var args = ii.args(arguments, {});
            var me = this;

			me.invoices = [];
            me.invoiceId = 0;
            me.activeFrameId = 0;
            me.lastSelectedRowIndex = -1;
            me.validate = 1;
            me.windowWidth = 0;
            me.windowHeight = 0;
            me.invoiceNumber = 0;
            me.invoiceSearch = "";
			me.invoiceType = invoiceTypes.edit;

            if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
            
            me.invoiceNeedUpdate = true;
            me.invoiceInfoNeedUpdate = true;
            me.accountReceivableNeedUpdate = true;
            me.invoicingReadOnly = false;
            			
            var queryStringArgs = {};
            var queryString = location.search.substring(1);
            var pairs = queryString.split("&");

            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1) continue;
                var argName = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                queryStringArgs[argName] = unescape(value);
            }

            me.invoiceId = queryStringArgs["invoiceId"];
            me.invoiceNumber = queryStringArgs["invoiceNumber"];
            me.invoiceSearch = queryStringArgs["invoiceSearch"];
            me.statusType = queryStringArgs["statusType"];
			me.fscYear = queryStringArgs["fscYear"];
			
            if (me.invoiceNumber == undefined)
                me.invoiceNumber = 0;

            me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
            me.cache = new ii.ajax.Cache(me.gateway);
            me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway,
				function (status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

            me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

            me.authorizer = new ii.ajax.Authorizer(me.gateway); //@iiDoc {Property:ii.ajax.Authorizer} Boolean
            me.authorizePath = "\\crothall\\chimes\\fin\\AccountsReceivable";
            me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
				    me.authorizationProcess.apply(me);
				},
				me);

            me.defineFormControls();
            me.configureCommunications();
            me.setTabIndexes();
            $("#backLable").hide();

            me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();

            if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
                me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
            else {
                me.houseCodesLoaded(me, 0);
            }
			
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
			me.invoiceLogoTypeStore.fetch("userId:[user]", me.invoiceLogoTypesLoaded, me);
			me.invoiceAddressTypeStore.fetch("userId:[user]", me.invoiceAddressTypesLoaded, me);

            $("#TabCollection a").click(function() {

                switch (this.id) {
                    case "TabCreateInvoices":

                        if (($("iframe")[0].contentWindow.fin == undefined || me.invoiceNeedUpdate) && me.lastSelectedRowIndex >= 0)
                            $("iframe")[0].src = "/fin/rev/invoice/usr/markup.htm?invoiceId=" + me.invoiceId;

                        me.activeFrameId = 0;
                        me.invoiceNeedUpdate = false;
                        if (!me.invoicingReadOnly) {
							$("#AnchorNew").show();
						}
                        break;

                    case "TabInvoiceHeaderInfo":

                        if (($("iframe")[1].contentWindow.fin == undefined || me.invoiceInfoNeedUpdate) && me.lastSelectedRowIndex >= 0)
                            $("iframe")[1].src = "/fin/rev/invoiceInfo/usr/markup.htm?invoiceId=" + me.invoiceId;

                        me.activeFrameId = 1;
                        me.invoiceInfoNeedUpdate = false;
                        $("#AnchorNew").hide();
                        break;

                    case "TabModifyAccountsReceivable":

                        if (($("iframe")[2].contentWindow.fin == undefined || me.accountReceivableNeedUpdate) && me.lastSelectedRowIndex >= 0)
                            $("iframe")[2].src = "/fin/rev/accountReceivable/usr/markup.htm?invoiceId=" + me.invoiceId;

                        me.activeFrameId = 2;
                        me.accountReceivableNeedUpdate = false;
                        $("#AnchorNew").hide();
                        break;
                }
            });

            $(window).bind("resize", me, me.resize);
            $(document).bind("keydown", me, me.controlKeyProcessor);
        },

        authorizationProcess: function fin_rev_master_UserInterface_authorizationProcess() {
            var args = ii.args(arguments, {});
            var me = this;

            me.invoicingReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Invoicing/AR\\Read");
            $("#pageLoading").hide();

            if (me.invoicingReadOnly) {
				$("#AnchorNew").hide();
				$("#AnchorCancelInvoice").hide();
				$("#actionMenu").hide();
			}
			
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
        },
		
		sessionLoaded: function fin_rev_master_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},

        resize: function() {
            var args = ii.args(arguments, {});
            var me = fin.revMasterUi;
            var offset = 0;

            if (me.windowWidth != $(window).width() || me.windowHeight != $(window).height()) {
                offset = document.documentElement.clientHeight - 262;

                me.invoiceGrid.setHeight($(me.invoiceGrid.element).parent().height() - 10);
				me.invoiceSearchGrid.setHeight($("#pageLoading").height() - 160);
				
                $("#iFrameCreateInvoices").height(offset);
                $("#iFrameInvoiceHeaderInfo").height(offset);
                $("#iFrameModifyAccountsReceivable").height(offset);

                me.windowWidth = $(window).width();
                me.windowHeight = $(window).height();
            }
        },

        defineFormControls: function() {
            var me = this;

            me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
                id: "actionMenu"
            });

            me.actionMenu
				.addAction({
				    id: "saveAction",
				    brief: "Save Invoice / AR (Ctrl+S)",
				    title: "Save the current Invoice / AR.",
				    actionFunction: function () { me.actionSaveItem(); }
				})
				.addAction({
				    id: "cancelAction",
				    brief: "Undo current changes to Invoice / AR (Ctrl+U)",
				    title: "Undo the changes to Invoice / AR being edited.",
				    actionFunction: function () { me.actionUndoItem(); }
				});

            me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
                id: "FiscalYear",
                formatFunction: function (type) { return type.name; },
                required: false
            });

            me.anchorLoad = new ui.ctl.buttons.Sizeable({
                id: "AnchorLoad",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionCompletedInvoicesLoad(); },
                hasHotState: true
            });

            me.taxExempt = new ui.ctl.Input.DropDown.Filtered({
                id: "TaxExempt",
                formatFunction: function (type) { return type.name; },
                changeFunction: function () { me.taxExemptChanged(); },
                required: false
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
				.addValidation(function (isFinal, dataMap) {

				    if (me.taxExempt.indexSelected == 0) {
				        if (me.taxId.getValue() == "")
				            return;
				        if (/^\d{9}$/.test(me.taxId.getValue()) == false)
				            this.setInvalid("Please enter valid Tax Id. Example: 999999999");
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
                formatFunction: function (type) { return type.name; },
                required: false
            });

            me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if ((this.focused || this.touched) && me.state.indexSelected == -1)
				        this.setInvalid("Please select the correct State.");
				});

            me.zip = new ui.ctl.Input.Text({
                id: "Zip",
                maxLength: 10
            });

            me.zip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

				    if (me.zip.getValue() == "")
				        return;

				    if (ui.cmn.text.validate.postalCode(me.zip.getValue()) == false)
				        this.setInvalid("Please enter valid postal code. Example: 99999 or 99999-9999");
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
			
			me.invoiceLogo = new ui.ctl.Input.DropDown.Filtered({
		        id: "InvoiceLogo",
				formatFunction: function( type ) { return type.name; },
		        required: false
		    });
			
			me.invoiceAddress = new ui.ctl.Input.DropDown.Filtered({
		        id: "InvoiceAddress",
				formatFunction: function( type ) { return type.title; },
		        required: false
		    });

			me.notes = $("#Notes")[0];

			$("#Notes").height(50);
			$("#Notes").keypress(function() {
				if (me.notes.value.length > 1023) {
					me.notes.value = me.notes.value.substring(0, 1024);
					return false;
				}
			});

            me.anchorNew = new ui.ctl.buttons.Sizeable({
                id: "AnchorNew",
                className: "iiButton",
                text: "<span>New Invoice</span>",
                clickFunction: function () { me.actionNewItem(); },
                hasHotState: true
            });
			
			me.anchorCancelInvoice = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancelInvoice",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionCancelInvoiceItem(); },
                hasHotState: true
            });

            me.anchorSave = new ui.ctl.buttons.Sizeable({
                id: "AnchorSave",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionSaveItem(); },
                hasHotState: true
            });

            me.anchorCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionCancelItem(); },
                hasHotState: true
            });

            me.anchorOk = new ui.ctl.buttons.Sizeable({
                id: "AnchorOk",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionOkItem(); },
                hasHotState: true
            });

            me.anchorEdit = new ui.ctl.buttons.Sizeable({
                id: "AnchorEdit",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Edit&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionEditItem(); },
                hasHotState: true
            });

            me.invoiceGrid = new ui.ctl.Grid({
                id: "InvoiceGrid",
                appendToId: "divForm",
                allowAdds: false,
                selectFunction: function (index) { me.itemSelect(index); }
            });

            me.invoiceGrid.addColumn("invoiceNumber", "invoiceNumber", "Invoice #", "Invoice #", 90);
            me.invoiceGrid.addColumn("amount", "amount", "Amount", "Amount", 80);
            me.invoiceGrid.addColumn("invoiceDate", "invoiceDate", "Date Received", "Date Received", 120);
            me.invoiceGrid.addColumn("collected", "collected", "Collected", "Collected", 100);
            me.invoiceGrid.addColumn("credited", "credited", "Credited", "Credited", 90);
            me.invoiceGrid.addColumn("lastPrinted", "lastPrinted", "Last Printed", "Last Printed", 110);
            me.invoiceGrid.addColumn("billTo", "billTo", "Bill To", "Bill To", null);
            me.invoiceGrid.capColumns();

            me.preview = new ui.ctl.buttons.Sizeable({
                id: "Preview",
                className: "iiButton",
                text: "<span>Preview</span>",
                title: "Preview selected Invoice",
                clickFunction: function () { me.actionPrint("Preview"); },
                hasHotState: true
            });

            me.print = new ui.ctl.buttons.Sizeable({
                id: "Print",
                className: "iiButton",
                text: "<span>&nbsp;Print&nbsp;</span>",
                title: "Print selected Invoice",
                clickFunction: function () { me.actionPrint(); },
                hasHotState: true
            });

            me.printMemo = new ui.ctl.buttons.Sizeable({
                id: "PrintMemo",
                className: "iiButton",
                text: "<span>&nbsp;Print&nbsp;Memo&nbsp;</span>",
                title: "Print selected Invoice Memo",
                clickFunction: function () { me.actionPrintMemo(); },
                hasHotState: true
            });
            
        	$('#' + me.printMemo.id).hide();
			
			me.anchorNewNext = new ui.ctl.buttons.Sizeable({
                id: "AnchorNewNext",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionNewNextItem(); },
                hasHotState: true
            });
			
			me.anchorNewCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorNewCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionNewCancelItem(); },
                hasHotState: true
            });
			
			me.searchInvoiceNumber = new ui.ctl.Input.Text({
				id: "SearchInvoiceNumber",
				maxLength: 50
			});
			
			me.searchInvoiceNumber.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.searchInvoiceNumber.getValue();

					if(enteredText == '') return;

					if (!(/^[0-9]+$/.test(enteredText)))
						this.setInvalid("Please enter valid Invoice #");
			});
										
			me.searchCustomer = new ui.ctl.Input.Text({
				id: "SearchCustomer", 
				required: false
		    });
			
			me.searchInvoiceDate = new ui.ctl.Input.Date({
		        id: "SearchInvoiceDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.searchInvoiceDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.searchInvoiceDate.text.value;
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");					
			});
				
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				appendToId: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionInvoicesLoad(); },
				hasHotState: true
			});
			
			me.invoiceSearchGrid = new ui.ctl.Grid({
				id: "InvoiceSearchGrid",
				appendToId: "divForm",
				allowAdds: false
			});
			
			me.invoiceSearchGrid.addColumn("invoiceNumber", "invoiceNumber", "Invoice #", "Invoice #", 80);
			me.invoiceSearchGrid.addColumn("houseCodeBrief", "houseCodeBrief", "House Code", "House Code", 110);
			me.invoiceSearchGrid.addColumn("billTo", "billTo", "Customer", "Customer", null);			
			me.invoiceSearchGrid.addColumn("invoiceDate", "invoiceDate", "Invoice Date", "Invoice Date", 100);
			me.invoiceSearchGrid.addColumn("amount", "amount", "Amount", "Amount", 100);
			me.invoiceSearchGrid.addColumn("collected", "collected", "Collected", "Collected", 100);
			me.invoiceSearchGrid.addColumn("credited", "credited", "Credited", "Credited", 100);
			me.invoiceSearchGrid.addColumn("lastPrinted", "lastPrinted", "Last Printed", "Last Printed", 110);
			me.invoiceSearchGrid.capColumns();
			
			$("#SearchInvoiceNumberText").bind("keydown", me, me.actionSearchItem);
			$("#SearchInvoiceDateText").bind("keydown", me, me.actionSearchItem);
			$("#SearchCustomerText").bind("keydown", me, me.actionSearchItem);
			
			me.anchorSearchNext = new ui.ctl.buttons.Sizeable({
                id: "AnchorSearchNext",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionSearchNextItem(); },
                hasHotState: true
            });
			
			me.anchorSearchCancel = new ui.ctl.buttons.Sizeable({
                id: "AnchorSearchCancel",
                className: "iiButton",
                text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
                clickFunction: function () { me.actionNewCancelItem(); },
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
			me.invoiceLogo.text.tabIndex = 17;
			me.invoiceAddress.text.tabIndex = 18;
			me.notes.tabIndex = 19;
        },

        configureCommunications: function fin_rev_UserInterface_configureCommunications() {
            var args = ii.args(arguments, {});
            var me = this;

            me.hirNodes = [];
            me.hirNodeStore = me.cache.register({
                storeId: "hirNodes",
                itemConstructor: fin.rev.master.HirNode,
                itemConstructorArgs: fin.rev.master.hirNodeArgs,
                injectionArray: me.hirNodes
            });

            me.houseCodes = [];
            me.houseCodeStore = me.cache.register({
                storeId: "hcmHouseCodes",
                itemConstructor: fin.rev.master.HouseCode,
                itemConstructorArgs: fin.rev.master.houseCodeArgs,
                injectionArray: me.houseCodes
            });

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.rev.master.HouseCodeDetail,
				itemConstructorArgs: fin.rev.master.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});

            me.years = [];
            me.yearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.rev.master.Year,
                itemConstructorArgs: fin.rev.master.yearArgs,
                injectionArray: me.years
            });

            me.invoicesList = [];
            me.invoiceStore = me.cache.register({
                storeId: "revInvoices",
                itemConstructor: fin.rev.master.Invoice,
                itemConstructorArgs: fin.rev.master.invoiceArgs,
                injectionArray: me.invoicesList
            });

            me.stateTypes = [];
            me.stateTypeStore = me.cache.register({
                storeId: "stateTypes",
                itemConstructor: fin.rev.master.StateType,
                itemConstructorArgs: fin.rev.master.stateTypeArgs,
                injectionArray: me.stateTypes
            });

            me.weekPeriodYears = [];
            me.weekPeriodYearStore = me.cache.register({
                storeId: "weekPeriodYears",
                itemConstructor: fin.rev.master.WeekPeriodYear,
                itemConstructorArgs: fin.rev.master.weekPeriodYearArgs,
                injectionArray: me.weekPeriodYears
            });

            me.invoiceBillTos = [];
            me.invoiceBillToStore = me.cache.register({
                storeId: "revInvoiceBillTos",
                itemConstructor: fin.rev.master.InvoiceBillTo,
                itemConstructorArgs: fin.rev.master.invoiceBillToArgs,
                injectionArray: me.invoiceBillTos
            });

            me.exports = [];
            me.exportStore = me.cache.register({
                storeId: "revInvoiceExports",
                itemConstructor: fin.rev.master.Export,
                itemConstructorArgs: fin.rev.master.exportArgs,
                injectionArray: me.exports
            });
			
			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "sites",
				itemConstructor: fin.rev.master.Site,
				itemConstructorArgs: fin.rev.master.siteArgs,
				injectionArray: me.sites
			});	
			
			me.taxRates = [];
            me.taxRateStore = me.cache.register({
                storeId: "revTaxRates",
                itemConstructor: fin.rev.master.TaxRate,
                itemConstructorArgs: fin.rev.master.taxRateArgs,
                injectionArray: me.taxRates
            });
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.rev.master.HouseCodeJob,
				itemConstructorArgs: fin.rev.master.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});

			me.invoiceLogoTypes = [];
			me.invoiceLogoTypeStore = me.cache.register({
				storeId: "invoiceLogoTypes",
				itemConstructor: fin.rev.master.InvoiceLogoType,
				itemConstructorArgs: fin.rev.master.invoiceLogoTypeArgs,
				injectionArray: me.invoiceLogoTypes
			});
			
			me.invoiceAddressTypes = [];
			me.invoiceAddressTypeStore = me.cache.register({
				storeId: "revInvoiceAddressTypes",
				itemConstructor: fin.rev.master.InvoiceAddressType,
				itemConstructorArgs: fin.rev.master.invoiceAddressTypeArgs,
				injectionArray: me.invoiceAddressTypes
			});
        },

        controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
            var args = ii.args(arguments, {
                event: { type: Object} // The (key) event object
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

        houseCodesLoaded: function(me, activeId) {

            if (parent.fin.appUI.houseCodeId == 0) {
                if (me.houseCodes.length <= 0) {

                    return me.houseCodeSearchError();
                }

                me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
            }
            me.houseCodeGlobalParametersUpdate(false);

			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
            me.yearStore.fetch("userId:[user]", me.yearsLoaded, me);

            if (me.statusType == "true") {
				me.actionCompletedInvoicesLoad();				
			}
			else {
				me.invoiceStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",status:1,year:-1,invoiceByHouseCode:-1,invoiceNumber:" + me.invoiceNumber, me.invoiceLoaded, me);
			}
        },       

        houseCodeChanged: function() {
            var args = ii.args(arguments, {});
            var me = this;

            $("#messageToUser").text("Loading");
            $("#pageLoading").show();

            me.lastSelectedRowIndex = -1;
            me.invoiceNeedUpdate = true;
            me.invoiceInfoNeedUpdate = true;
            me.accountReceivableNeedUpdate = true;
            
            me.statusType = "false";
			$("#CompletedInvoices").attr("checked", false);
			$("#OpenInvoices").attr("checked", true);
		
			me.fiscalYear.setData([]);
			me.fiscalYear.text.value = "";
			me.invoiceNumber = 0;
			
            me.resetGrids();
            me.invoiceGrid.setData([]);

            me.invoiceStore.reset();
            me.invoiceStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",status:1,year:-1,invoiceByHouseCode:-1", me.invoiceLoaded, me);
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
        },

		houseCodeDetailsLoaded: function(me, activeId) {

		},

        yearsLoaded: function(me, activeId) { //Fiscal Years

        },

        taxExemptsLoaded: function() {
            var me = this;

            me.taxExempts = [];
            me.taxExempts.push(new fin.rev.master.TaxExempt(1, "Yes"));
            me.taxExempts.push(new fin.rev.master.TaxExempt(0, "No"));
            me.taxExempt.setData(me.taxExempts);
        },

        taxExemptChanged: function() {
            var me = this;
			var index = me.taxExempt.indexSelected;

            if (index >= 0 && me.taxExempts[index].id == 1) {
				index = me.billTo.indexSelected;
				
				if (index >= 0) {
					if (me.billTo.data[index].taxId > 0) 
						me.taxId.setValue(me.billTo.data[index].taxId);						
				}
				me.taxId.text.readOnly = false;
			}
			else {
				me.taxId.text.readOnly = true;
				me.taxId.setValue("");
			}
        },

        resetGrids: function() {
            if ($("iframe")[0].contentWindow.fin != undefined)
                $("iframe")[0].contentWindow.fin.invoiceUi.resetGrid();

            if ($("iframe")[1].contentWindow.fin != undefined)
                $("iframe")[1].contentWindow.fin.invoiceInfoUi.resetControls();

            if ($("iframe")[2].contentWindow.fin != undefined)
                $("iframe")[2].contentWindow.fin.accountReceivableUi.resetGrid();
        },

        actionCompletedInvoicesLoad: function() {
            var me = this;

            $("#messageToUser").text("Loading");
            $("#pageLoading").show();
 
            var yearId = -1;
			if (me.statusType == "true") {
				yearId = me.fscYear;
				$("#CompletedInvoices").attr("checked", true);
				me.fiscalYear.setData(me.years);
			}
			else {
				yearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
				me.invoiceNumber = 0;
			}
			
            me.resetGrids();
            me.invoiceStore.reset();
            me.invoiceStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",status:5,year:" + yearId + ",invoiceByHouseCode:-1", me.invoiceLoaded, me);
        },

        invoiceLoaded: function(me, activeId) {

            if (me.invoicingReadOnly) {
				$("#AnchorNew").hide();
				$("#actionMenu").hide();
			}
			
			me.invoices = me.invoicesList.slice();
			me.invoiceGrid.setData(me.invoices);
			
			if (me.fscYear >= 0 && me.statusType == "true" ) {
				index = ii.ajax.util.findIndexById(me.fscYear.toString(), me.years);
				if (index != undefined) 
					me.fiscalYear.select(index, me.fiscalYear.focused);
			}

            $("#pageLoading").hide();            
            $('#container-1').tabs(1);
			$("#fragment-1").show();
			$("#fragment-2").hide();  
			$("#fragment-3").hide();
			$("#TabCreateInvoices").parent().addClass("tabs-selected");

			me.resize();

            if (me.invoiceSearch == "true" && parseInt(me.invoiceId) > 0 && me.invoices.length > 0) {
                me.invoiceGrid.body.select(0);
                $("#backLable").show();
            }
        },

        invoiceDetailsLoaded: function() {
            var me = this;

            switch (me.activeFrameId) {

                case 0:
                    $("iframe")[0].src = "/fin/rev/invoice/usr/markup.htm?invoiceId=" + me.invoiceId;
                    me.invoiceNeedUpdate = false;
                    break;

                case 1:
                    $("iframe")[1].src = "/fin/rev/invoiceInfo/usr/markup.htm?invoiceId=" + me.invoiceId;
                    me.invoiceInfoNeedUpdate = false;
                    break;

                case 2:
                    $("iframe")[2].src = "/fin/rev/accountReceivable/usr/markup.htm?invoiceId=" + me.invoiceId;					
                  	me.accountReceivableNeedUpdate = false;
                    break;
            }
        },

        itemSelect: function() {
            var args = ii.args(arguments, {
                index: { type: Number}  // The index of the data subItem to select
            });
            var me = this;
            var index = args.index;
            var item = me.invoiceGrid.data[index];

            me.invoiceNeedUpdate = true;
            me.invoiceInfoNeedUpdate = true;
            me.accountReceivableNeedUpdate = true;
            me.lastSelectedRowIndex = index;
            me.status = "";
            me.resetGrids();

            if (me.invoiceGrid.data[index] != undefined) {
                me.invoiceId = me.invoiceGrid.data[index].id;
                me.invoiceDetailsLoaded();
                me.refreshPrintMemoButtonStatus();

				if (me.invoiceGrid.data[index].printed)
					$("#AnchorCancelInvoice").hide();
				else
					$("#AnchorCancelInvoice").show();
            }
            else
                me.invoiceId = 0;
        },

        refreshPrintMemoButtonStatus:function() {
        	var me=this;
            
			if (me.invoices[me.lastSelectedRowIndex].creditMemoPrintable !== true && me.invoices[me.lastSelectedRowIndex].credited <= 0 || me.invoices[me.lastSelectedRowIndex].printed == false)
                $('#' + me.printMemo.id).hide();
            else
                $('#' + me.printMemo.id).show();
        },

        currentDate: function fin_rev_master_UserInterface_currentDate() {
            var today = new Date();
            var month = today.getMonth() + 1;
            var day = today.getDate();
            var year = today.getFullYear();

            return month + "/" + day + "/" + year;
        },
		
		actionCancelInvoiceItem: function fin_rev_master_UserInterface_actionCancelInvoiceItem() {
            var me = this;

            if (me.invoiceGrid.activeRowIndex < 0 || me.invoices[me.invoiceGrid.activeRowIndex].printed)
                return;

            if (confirm("Are you sure you want to cancel the Invoice # " + me.invoices[me.invoiceGrid.activeRowIndex].invoiceNumber + "?")) {
                me.status = "Cancel";
                me.actionSaveItem();
            }
        },

        actionPrint: function fin_rev_master_UserInterface_actionPrint() {
            var args = ii.args(arguments, {
                flag: { type: String, required: false }
            });
            var me = this;

            if (me.invoiceGrid.activeRowIndex < 0)
                return;

            if (args.flag || me.invoices[me.lastSelectedRowIndex].printed == true) { // == "Preview"
                me.printInvoice();
            }
            else
                if (confirm("The selected invoice will become READONLY.\n\nOnce selecting OK you will be able to print the selected invoice and no future modifications or deletions will be accepted. If more modifications are necessary please select the Cancel button and finish making your changes - Thank you!")) {
                    me.status = "Printed";
                    me.actionSaveItem();
                }
        },

        actionPrintMemo: function fin_rev_master_UserInterface_actionPrintMemo() {
            var args = ii.args(arguments, {
                flag: { type: String, required: false }
            });
            var me = this;

            if (me.invoiceGrid.activeRowIndex < 0)
                return;

            if (me.invoices[me.lastSelectedRowIndex].creditMemoPrintable !== true || me.invoices[me.lastSelectedRowIndex].printed == false)
                return;

            me.status = "CreditMemoPrinted";
            me.actionSaveItem();
        },

        printInvoice: function() {
            var me = this;

            window.open(location.protocol + '//' + location.hostname + '/reports/invoice.aspx?invoicenumber=' + me.invoiceId, 'PrintInvoice', 'type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
        },

        printInvoiceMemo: function() {
            var me = this;

            window.open(location.protocol + '//' + location.hostname + '/reports/creditmemo.aspx?invoicenumber=' + me.invoiceId, 'PrintInvoiceMemo', 'type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
        },

        createNewInvoice: function() {
            var me = this;

            $("#divGrid").hide();
            $("#popupSetup").show();
            $("#messageToUser").text("Loading");
            $("#pageLoading").show();
			$("#StateTaxText").addClass("Loading");
            $("#LocalTaxText").addClass("Loading");

			var index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].invoiceLogoTypeId.toString(), me.invoiceLogoTypes);
			if (index != undefined && index >= 0)
				me.invoiceLogo.select(index, me.invoiceLogo.focused);
			else
				me.invoiceLogo.reset();

            me.invoiceId = 0;
            me.status = "Add";
            me.taxExemptsLoaded();
			me.state.fetchingData();
            me.billTo.fetchingData();
			me.anchorSave.display(ui.cmn.behaviorStates.disabled);
            me.siteStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",type:invoice", me.sitesLoaded, me);
		    me.stateTypeStore.fetch("userId:[user],", me.statesLoaded, me);
			me.invoiceBillToStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId, me.invoiceBillTosLoaded, me);
		},

		sitesLoaded: function(me, activeId) {
			
			if (me.sites.length == 0) {
				alert("Either Site information not found or Site is not associated to the House Code [" + parent.fin.appUI.houseCodeBrief + "]. Please verify and try again!")
				$("#pageLoading").hide();
			}
			else
				me.taxRateStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.taxRatesLoaded, me);
		},

        invoiceBillTosLoaded: function(me, activeId) {

			var billTos = me.invoiceBillTos.slice();

			if ($("input[name='InvoiceBy']:checked").val() == 1) {
				for (var index = 0; index < billTos.length; index++ ) {
					if(billTos[index].billTo == parent.fin.appUI.houseCodeTitle) {
						billTos.splice(index, 1);
						break;
					}
				}
			}

            me.billTo.setData(billTos);
        },

        billToChanged: function() {
            var me = this;
            var index = 0;
            var itemIndex = 0;

            index = me.billTo.indexSelected;
            me.state.reset();

            if (index >= 0) {
                if (parent.fin.appUI.houseCodeTitle == me.billTo.lastBlurValue)
					alert("Warning: You have selected a House Code as the customer.");
								
				itemIndex = me.taxExempt.indexSelected;

	            if (itemIndex >= 0 && me.taxExempts[itemIndex].id == 1) {
					if (me.billTo.data[index].taxId > 0) 
						me.taxId.setValue(me.billTo.data[index].taxId);
				}

                me.company.setValue(me.billTo.data[index].company);
                me.address1.setValue(me.billTo.data[index].address1);
                me.address2.setValue(me.billTo.data[index].address2);
                me.city.setValue(me.billTo.data[index].city);
                me.zip.setValue(me.billTo.data[index].postalCode);

                itemIndex = ii.ajax.util.findIndexById(me.billTo.data[index].stateType.toString(), me.stateTypes);
                if (itemIndex >= 0 && index != undefined && itemIndex != null)
                    me.state.select(itemIndex, me.state.focused);
            }
            else {
				me.taxId.setValue("");
                me.company.setValue("");
                me.address1.setValue("");
                me.address2.setValue("");
                me.city.setValue("");
                me.zip.setValue("");
            }
        },

        statesLoaded: function(me, activeId) {

            me.state.setData(me.stateTypes);
        },

        stateChanged: function() {
            var me = this;
            var stateId = 0;

            if (me.state.indexSelected == -1)
                return;

            stateId = me.stateTypes[me.state.indexSelected].id;
        },

        taxRatesLoaded: function(me, activeId) {

            var date = new Date();
			var currentDate = "";
			var dueDate = "";
			
			currentDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
			date.setDate(date.getDate() + 25);
			dueDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
			
			me.startDate.resizeText();
			me.endDate.resizeText();
			me.invoiceDate.resizeText();
			me.dueDate.resizeText();
			me.billTo.resizeText();
			me.state.resizeText();
			me.validator.reset();
			
			me.startDate.setValue(me.weekPeriodYears[0].periodStartDate);
			me.endDate.setValue(me.weekPeriodYears[0].periodEndDate);
			me.invoiceDate.setValue(currentDate);
			me.dueDate.setValue(dueDate);
			
			if (me.taxRates.length == 1) {
				me.stateTax.setValue(me.taxRates[0].stateTaxRate);
				me.localTax.setValue(me.taxRates[0].localTaxRate);
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
			}
			else {
				me.stateTax.setValue("");
				me.localTax.setValue("");
				
				var message = "Error - There is a mismatch with the follow Site setup information "
					+ "Zip=" + me.sites[0].postalCode + ", City=Unknown, State=" + me.getStateTitle(me.sites[0].state) 
					+ ". Please correct the address of the site by accessing HouseCode -> Sites prior to continuing.";
				alert(message);
			}

			me.stateTax.text.readOnly = true;
			me.localTax.text.readOnly = true;

			if ($("input[name='Clone']:checked").val() == 1) {
				var searchInvoice = me.invoiceSearchGrid.data[me.invoiceSearchGrid.activeRowIndex];

				if (searchInvoice.taxExempt)
					me.taxExempt.select(0, me.taxExempt.focused);
				else {
					me.taxExempt.select(1, me.taxExempt.focused);
					me.taxId.text.readOnly = true;
				}
				me.taxId.setValue(searchInvoice.taxNumber);				
				me.billTo.reset();
				me.billTo.setValue(searchInvoice.billTo);
				me.company.setValue(searchInvoice.company);
				me.address1.setValue(searchInvoice.address1);
				me.address2.setValue(searchInvoice.address2);
				me.city.setValue(searchInvoice.city);
				me.state.reset();
				var itemIndex = ii.ajax.util.findIndexById(searchInvoice.stateType.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined)
					me.state.select(itemIndex, me.state.focused);
				me.zip.setValue(searchInvoice.postalCode);
				me.poNumber.setValue(searchInvoice.poNumber);
				me.notes.value = searchInvoice.notes;
			}
			else {				
				me.taxExempt.reset();
				me.taxId.setValue("");				
				me.billTo.reset();
				me.company.setValue("");
				me.address1.setValue("");
				me.address2.setValue("");
				me.city.setValue("");
				me.state.reset();
				me.zip.setValue("");
				me.poNumber.setValue("");
				me.notes.value = "";
			}			

			$("#StateTaxText").removeClass("Loading");
			$("#LocalTaxText").removeClass("Loading");
			$("#pageLoading").hide();
        },
		
		getStateTitle: function(state) {
			var me = this;
			
			for (var index = 0; index < me.stateTypes.length; index++) {
				if (me.stateTypes[index].id == state)
					return me.stateTypes[index].name;
			}
			
			return "";
		},

        weekPeriodYearsLoaded: function(me, activeId) {
 
        },
		
		invoiceLogoTypesLoaded: function(me, activeId) {
 
 			me.invoiceLogo.setData(me.invoiceLogoTypes);
        },
		
		invoiceAddressTypesLoaded: function(me, activeId) {
 
 			me.invoiceAddressTypes.unshift(new fin.rev.master.InvoiceAddressType({ id: 0, title: "ALL" }));
 			me.invoiceAddress.setData(me.invoiceAddressTypes);
        },
				
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.actionInvoicesLoad();
			}
		},
		
		actionInvoicesLoad: function() {
			var me = this;
			
			// Check to see if the data entered is valid
			me.validator.forceBlur();			

		  	if (!me.searchInvoiceNumber.valid || !me.searchInvoiceDate.valid) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}
			
			var invoiceNumber = me.searchInvoiceNumber.getValue();
			var invoiceDate = me.searchInvoiceDate.lastBlurValue;
			var customer = me.searchCustomer.getValue();
			var invoiceByHouseCode = 1;
			
			if (me.invoiceType == invoiceTypes.customerCloneYes || me.invoiceType == invoiceTypes.customerCloneNo)
				invoiceByHouseCode = 0;
			
			if (invoiceNumber == "" && invoiceDate == "" && customer == "" && $("#houseCodeTemplateText").val() == "" ) {
				alert("Please enter search criteria: Invoice #, Invoice Date, Customer or House Code.")
				return false;
			}

			$("#messageToUser").text("Loading");			
			$("#pageLoading").show();

			if(invoiceDate == undefined || invoiceDate == '')
				invoiceDate = '1/1/1900';
				
			me.invoiceStore.reset();
			me.invoiceStore.fetch("userId:[user],houseCode:" 				
				+ ($("#houseCodeTemplateText").val() != "" ? + me.houseCodeSearchTemplate.houseCodeIdTemplate : "0")
				+ ",status:-1,year:-1,invoiceNumber:" + invoiceNumber 
				+ ",invoiceByHouseCode:" + invoiceByHouseCode
				+ ",invoiceDate:" + invoiceDate + ",customer:" + customer, me.invoiceSearchLoaded, me);
		},
		
		invoiceSearchLoaded: function(me, activeId) {

			me.invoiceSearchGrid.setData(me.invoicesList);
			me.invoiceSearchGrid.resize();
			$("#pageLoading").hide();
  		},
		
		 actionCancelItem: function() {
            var me = this;

            if (me.invoiceGrid.activeRowIndex >= 0)
                me.invoiceId = me.invoiceGrid.data[me.invoiceGrid.activeRowIndex].id;

            me.status = "";
            $("#divGrid").show();
            $("#popupSetup").hide();
        },

		actionNewItem: function() {
            var me = this;

            me.status = "";
			disableBackGround();
            showPopup("popupNewInvoice");
			$("#InvoiceByHouseCode")[0].checked = true;
			$("#CloneNo")[0].checked = true;
        },

		actionNewCancelItem: function() {
            var me = this;

            if (me.invoiceGrid.activeRowIndex >= 0)
                me.invoiceId = me.invoiceGrid.data[me.invoiceGrid.activeRowIndex].id;

            me.status = "";
			enableBackGround();
			hidePopup("popupNewInvoice");
			$("#divGrid").show();
			$("#popupSearch").hide();
        },

		actionNewNextItem: function() {
            var me = this;

			hidePopup("popupNewInvoice");
			enableBackGround();

			if ($("input[name='Clone']:checked").val() == 1) {
				if($("input[name='InvoiceBy']:checked").val() == 1)
					me.invoiceType = invoiceTypes.customerCloneYes;
				else
					me.invoiceType = invoiceTypes.houseCodeCloneYes;					

				$("#divGrid").hide();
				$("#popupSearch").show();
				me.searchInvoiceNumber.setValue("");
				me.searchInvoiceDate.setValue("");
				me.searchCustomer.setValue("");
				me.invoiceSearchGrid.setData([]);
				me.searchInvoiceNumber.resizeText();
				me.searchInvoiceDate.resizeText();
				me.searchCustomer.resizeText();
				me.invoiceSearchGrid.setHeight($("#pageLoading").height() - 160);
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",jobType:3", me.customersLoaded, me);
			}			
			else if ($("input[name='Clone']:checked").val() == 0) {

				if($("input[name='InvoiceBy']:checked").val() == 1)
					me.invoiceType = invoiceTypes.customerCloneNo;
				else
					me.invoiceType = invoiceTypes.houseCodeCloneNo;

				me.createNewInvoice();
			}
        },

		customersLoaded: function(me, activeId) {

		},

		actionSearchNextItem: function() {
            var me = this;
			var found = false;

			if (me.invoiceSearchGrid.activeRowIndex < 0) {
				alert('Please select the Invoice from the list.');
				return;
			}
			
			if (me.invoiceType == invoiceTypes.customerCloneYes) {
				for (var index = 0; index < me.houseCodeJobs.length; index++) {
					if (me.houseCodeJobs[index].jobNumber == me.invoiceSearchGrid.data[me.invoiceSearchGrid.activeRowIndex].jobBrief) {
						found = true;
						break;
					}
				}
				
				if (!found) {
					alert("The selected invoice Customer is not associated to the House Code [" 
						+ parent.fin.appUI.houseCodeBrief + "]. Please select the Customer which is "
						+ "associated to the House Code [" + parent.fin.appUI.houseCodeBrief + "].");
					return;
				}
			}

 			$("#popupSearch").hide();
			me.createNewInvoice();
		},

        actionOkItem: function() {
            var me = this;

            hidePopup("popupMessage");
            me.validate = 0;
            me.actionSaveItem();
        },

        actionEditItem: function() {
            var me = this;

            hidePopup("popupMessage");
            $("#pageLoading").hide();
        },

        actionUndoItem: function() {
            var args = ii.args(arguments, {});
            var me = this;

            if (me.invoiceGrid.activeRowIndex < 0)
                return;

            if (me.activeFrameId == 0)
                $("iframe")[0].contentWindow.fin.invoiceUi.actionUndoItem();
            else if (me.activeFrameId == 1)
                $("iframe")[1].contentWindow.fin.invoiceInfoUi.actionUndoItem();
            else if (me.activeFrameId == 2)
                $("iframe")[2].contentWindow.fin.accountReceivableUi.actionUndoItem();
        },

        actionSaveItem: function() {
            var args = ii.args(arguments, {});
            var me = this;

            if (me.status == "Printed" || me.status == "CreditMemoPrinted" || me.status == "Cancel") {
                me.saveInvoice();
            }
            else if (me.activeFrameId == 0) {
                if (me.status == "Add") {
                    me.validator.forceBlur();

                    // Check to see if the data entered is valid

                    if (!me.validator.queryValidity(true)) {
                        alert("In order to save, the errors on the page must be corrected.");
                        return false;
                    }
                    me.saveInvoice();
                }
                else {
                    if (me.invoiceGrid.activeRowIndex < 0)
                        return;

                    me.status = "Edit";
                    $("iframe")[0].contentWindow.fin.invoiceUi.actionSaveItem();
                }
            }
            else {
                if (me.invoiceGrid.activeRowIndex < 0)
                    return;

                if (me.activeFrameId == 1)
                    $("iframe")[1].contentWindow.fin.invoiceInfoUi.actionSaveItem();
                else
                    if (me.activeFrameId == 2)
                        $("iframe")[2].contentWindow.fin.accountReceivableUi.actionSaveItem();
            }
        },

        saveInvoice: function() {
            var me = this;
            var item = [];
          
            if (me.invoicingReadOnly && me.status != "Printed" && me.status != "CreditMemoPrinted") 
                return;

            if (me.status == "Add") {
				var invoiceByHouseCode = true;
				if (me.invoiceType == invoiceTypes.customerCloneYes || me.invoiceType == invoiceTypes.customerCloneNo)
					invoiceByHouseCode = false;
					
                item = new fin.rev.master.Invoice({
                    id: me.invoiceId
					, houseCode: parent.fin.appUI.houseCodeId
					, invoiceByHouseCode: invoiceByHouseCode
					, invoiceNumber: 0
					, invoiceDate: me.invoiceDate.lastBlurValue
					, dueDate: me.dueDate.lastBlurValue
					, periodStartDate: me.startDate.lastBlurValue
					, periodEndDate: me.endDate.lastBlurValue
					, amount: "0.00000"
					, collected: "0.00000"
					, credited: "0.00000"
					, statusType: 1
					, billTo: me.billTo.lastBlurValue
					, company: me.company.getValue()
					, address1: me.address1.getValue()
					, address2: me.address2.getValue()
					, city: me.city.getValue()
					, stateType: me.stateTypes[me.state.indexSelected].id
					, postalCode: me.zip.getValue()
					, printed: false
					, printedBy: ""
					, lastPrinted: ""
					, taxExempt: me.taxExempts[me.taxExempt.indexSelected].id == 1 ? true : false
					, taxNumber: me.taxId.getValue()
					, stateTax: me.stateTax.getValue().toString()
					, localTax: me.localTax.getValue().toString()
					, poNumber: me.poNumber.getValue()
					, invoiceLogoType: (me.invoiceLogo.indexSelected >= 0 ? me.invoiceLogoTypes[me.invoiceLogo.indexSelected].id : 0)
					, invoiceAddressType: (me.invoiceAddress.indexSelected >= 0 ? me.invoiceAddressTypes[me.invoiceAddress.indexSelected].id : 0)
					, notes: me.notes.value
					, version: 1
					, active: true
                });
            }
            else if (me.status == "Edit") {
                var invoiceInfoUIControls;

                invoiceInfoUIControls = $("iframe")[1].contentWindow.fin.invoiceInfoUi;

                item = new fin.rev.master.Invoice({
                    id: me.invoiceId
					, houseCode: parent.fin.appUI.houseCodeId
					, invoiceNumber: me.invoices[me.lastSelectedRowIndex].invoiceNumber
					, invoiceDate: invoiceInfoUIControls.invoiceDate.lastBlurValue
					, dueDate: invoiceInfoUIControls.dueDate.lastBlurValue
					, periodStartDate: invoiceInfoUIControls.startDate.lastBlurValue
					, periodEndDate: invoiceInfoUIControls.endDate.lastBlurValue
					, amount: me.invoices[me.lastSelectedRowIndex].amount
					, collected: me.invoices[me.lastSelectedRowIndex].collected
					, credited: me.invoices[me.lastSelectedRowIndex].credited
					, statusType: me.invoices[me.lastSelectedRowIndex].statusType
					, billTo: invoiceInfoUIControls.billTo.lastBlurValue
					, company: invoiceInfoUIControls.company.getValue()
					, address1: invoiceInfoUIControls.address1.getValue()
					, address2: invoiceInfoUIControls.address2.getValue()
					, city: invoiceInfoUIControls.city.getValue()
					, stateType: invoiceInfoUIControls.stateTypes[invoiceInfoUIControls.state.indexSelected].id
					, postalCode: invoiceInfoUIControls.zip.getValue()
					, printed: false
					, printedBy: me.invoices[me.lastSelectedRowIndex].printedBy
					, lastPrinted: me.invoices[me.lastSelectedRowIndex].lastPrinted
					, taxExempt: invoiceInfoUIControls.taxExempts[invoiceInfoUIControls.taxExempt.indexSelected].id == 1 ? true : false
					, taxNumber: invoiceInfoUIControls.taxId.getValue()
					, stateTax: invoiceInfoUIControls.stateTax.getValue().toString()
					, localTax: invoiceInfoUIControls.localTax.getValue().toString()
					, poNumber: invoiceInfoUIControls.poNumber.getValue()
					, invoiceLogoType: (invoiceInfoUIControls.invoiceLogo.indexSelected >= 0 ? invoiceInfoUIControls.invoiceLogoTypes[invoiceInfoUIControls.invoiceLogo.indexSelected].id : 0)
					, invoiceAddressType: (invoiceInfoUIControls.invoiceAddress.indexSelected >= 0 ? invoiceInfoUIControls.invoiceAddressTypes[invoiceInfoUIControls.invoiceAddress.indexSelected].id : 0)
					, notes: invoiceInfoUIControls.notes.value
					, version: me.invoices[me.lastSelectedRowIndex].version
					, active: true
                });
            }
			else if (me.status == "Cancel") {
                item = new fin.rev.master.Invoice({
                    id: me.invoiceId
                    , statusType: 6
                });
            }
            else if (me.status == "Printed" || me.status == "CreditMemoPrinted") {
                item = new fin.rev.master.Invoice({
                    id: me.invoiceId
                    , printed: true
                });
            }

			if ((me.status == "Add" || me.status == "Edit") && me.validate == 1) {
			
				var periodStartDate = new Date(me.weekPeriodYears[0].periodStartDate);
				var message = "";
				
				if (periodStartDate > new Date(item.periodStartDate)) 
					message = "Service Period Start Date";
				
				if (periodStartDate > new Date(item.periodEndDate))
					message += (message == "" ? "Service Period End Date" : ", End Date");
				
				if (periodStartDate > new Date(item.invoiceDate))
					message += (message == "" ? "Invoice Date" : ", Invoice Date");
				
				if (periodStartDate > new Date(item.dueDate)) 
					message += (message == "" ? "Due Date" : ", Due Date");
				
				if (message != "") {
					alert("Warning: " + message + " is prior to the current period Start Date.");
				}
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

            var xml = me.saveXmlBuildInvoice(item);

            // Send the object back to the server as a transaction
            me.transactionMonitor.commit({
                transactionType: "itemUpdate",
                transactionXml: xml,
                responseFunction: me.saveResponse,
                referenceData: { me: me, item: item }
            });

            return true;
        },

        saveXmlBuildInvoice: function() {
            var args = ii.args(arguments, {
                item: { type: fin.rev.master.Invoice }
            });
            var me = this;
            var xml = "";

            if (me.status == "Printed") {

                xml += '<revInvoicePrinted';
                xml += ' id="' + args.item.id + '"';
                xml += ' printed="' + args.item.printed + '"';
                xml += '/>';

                return xml;
            }

            if (me.status == "CreditMemoPrinted") {

                xml += '<revInvoiceCreditMemoPrinted';
                xml += ' id="' + args.item.id + '"';
                xml += ' printed="' + args.item.printed + '"';
                xml += '/>';

                return xml;
            }
			
			if (me.status == "Cancel") {

                xml += '<revInvoiceStatusUpdate';
                xml += ' id="' + args.item.id + '"';
				xml += ' statusType="' + args.item.statusType + '"';
                xml += '/>';

                return xml;
            }
			
			var cloneInvoiceId = 0;
			
			if (me.invoiceType == invoiceTypes.houseCodeCloneYes || me.invoiceType == invoiceTypes.customerCloneYes)
				cloneInvoiceId = me.invoiceSearchGrid.data[me.invoiceSearchGrid.activeRowIndex].id;

            xml += '<revInvoice';
            xml += ' id="' + args.item.id + '"';
			xml += ' houseCode="' + args.item.houseCode + '"';
			xml += ' cloneInvoiceId="' + cloneInvoiceId + '"';
            xml += ' invoiceByHouseCode="' + args.item.invoiceByHouseCode + '"';
            xml += ' invoiceDate="' + args.item.invoiceDate + '"';
            xml += ' dueDate="' + args.item.dueDate + '"';
            xml += ' periodStartDate="' + args.item.periodStartDate + '"';
            xml += ' periodEndDate="' + args.item.periodEndDate + '"';
            xml += ' billTo="' + ui.cmn.text.xml.encode(args.item.billTo) + '"';
            xml += ' company="' + ui.cmn.text.xml.encode(args.item.company) + '"';
            xml += ' address1="' + ui.cmn.text.xml.encode(args.item.address1) + '"';
            xml += ' address2="' + ui.cmn.text.xml.encode(args.item.address2) + '"';
            xml += ' city="' + ui.cmn.text.xml.encode(args.item.city) + '"';
            xml += ' stateType="' + args.item.stateType + '"';
            xml += ' postalCode="' + args.item.postalCode + '"';
            xml += ' printed="' + args.item.printed + '"';
            xml += ' taxExempt="' + args.item.taxExempt + '"';
            xml += ' taxNumber="' + args.item.taxNumber + '"';
            xml += ' stateTax="' + args.item.stateTax + '"';
            xml += ' localTax="' + args.item.localTax + '"';
            xml += ' poNumber="' + ui.cmn.text.xml.encode(args.item.poNumber) + '"';
			xml += ' invoiceLogoType="' + args.item.invoiceLogoType + '"';
			xml += ' invoiceAddressType="' + args.item.invoiceAddressType + '"';
			xml += ' notes="' + ui.cmn.text.xml.encode(args.item.notes) + '"';
            xml += ' version="' + args.item.version + '"';
            xml += ' validate="' + me.validate + '"';
            xml += '/>';

            return xml;
        },

        /* @iiDoc {Method}
        * Handles the server's response to a save transaction.
        */
        saveResponse: function() {
            var args = ii.args(arguments, {
                transaction: { type: ii.ajax.TransactionMonitor.Transaction },
                xmlNode: { type: "XmlNode:transaction" }
            });
            var transaction = args.transaction;
            var me = transaction.referenceData.me;
            var item = transaction.referenceData.item;
            var status = $(args.xmlNode).attr("status");
            var errorMessage = "";

            if (status == "success") {
                $(args.xmlNode).find("*").each(function() {
                    switch (this.tagName) {

                        case "revInvoice":

                            if (me.status == "Add") {
                                me.invoiceId = parseInt($(this).attr("id"), 10);
                                item.id = me.invoiceId;
                                item.invoiceNumber = parseInt($(this).attr("invoiceNumber"), 10);
								item.jobBrief = $(this).attr("jobBrief");
                                me.invoices.push(item);
                                me.lastSelectedRowIndex = me.invoices.length - 1;
                                me.invoiceGrid.setData(me.invoices);
                                me.invoiceGrid.body.select(me.lastSelectedRowIndex);
                                me.actionCancelItem();
                            }
							else if (me.status == "Cancel") {
             					me.invoiceId = 0;
								me.lastSelectedRowIndex = -1;
								me.resetGrids();
								me.invoices.splice(me.invoiceGrid.activeRowIndex, 1);
								me.invoiceGrid.setData(me.invoices);
                            }
                            else if (me.status == "Printed") {
                                //do reload.
                                me.printInvoice();
                                me.invoices[me.lastSelectedRowIndex].printed = true;
                                me.invoices[me.lastSelectedRowIndex].lastPrinted = me.currentDate();
                                me.invoiceGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
                                me.invoiceGrid.body.select(me.lastSelectedRowIndex);
                            }
                            else if (me.status == "CreditMemoPrinted") {
                                me.printInvoiceMemo();
                                me.invoices[me.lastSelectedRowIndex].creditMemoPrinted = true;
                                me.invoiceGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
                                me.invoiceGrid.body.select(me.lastSelectedRowIndex);
                            }
                            else {
                                me.lastSelectedRowIndex = me.invoiceGrid.activeRowIndex;
                                item.version = parseInt($(this).attr("version"), 10);
                                me.invoices[me.lastSelectedRowIndex] = item;
                                me.invoiceGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
                                $("iframe")[1].contentWindow.fin.invoiceInfoUi.invoice = me.invoices[me.lastSelectedRowIndex];
                            }

                            me.validate = 1;
                            me.status = "";
                            $("#pageLoading").hide();

                            break;
                    }
                });
            }
            else {
                if (status == "invalid") {
                    $("#divMessage").text($(args.xmlNode).attr("message"));
                    showPopup("popupMessage");
                }
                else {
                    alert("[SAVE FAILURE] Error while updating Invoice Record: " + $(args.xmlNode).attr("message"));
                    $("#pageLoading").hide();
                }
            }
        }
    }
});

function hidePopup(id) {
	
	$("#" + id).fadeOut("slow");
}

function showPopup(id) {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#" + id).width();
	var popupHeight = $("#" + id).height();
		
	$("#" + id).css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});	
	
	$("#" + id).fadeIn("slow");
}

function disableBackGround() {
	
	$("#backGroundPopup").css({
		"opacity": "0.5"
	});
	$("#backGroundPopup").fadeIn("slow");
}

function enableBackGround() {
	
	$("#backGroundPopup").fadeOut("slow");
}

function enableFiscalYear(readOnly) {
	var me = fin.revMasterUi;
	
	me.fiscalYear.text.readOnly = readOnly;
	me.statusType = "false"
	me.invoiceNumber = 0;
	
	if (readOnly) {
		me.fiscalYear.reset();
		me.fiscalYear.setData([]);
		$("#AnchorLoad").hide();
		$("#pageLoading").show();
		
		me.resetGrids();
		me.invoiceStore.reset();
		me.invoiceStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",status:1,year:-1,invoiceByHouseCode:-1", me.invoiceLoaded, me);
	}
	else {
		me.fiscalYear.setData(me.years);
		me.fiscalYear.select(0, me.fiscalYear.focused);
		$("#AnchorLoad").show();
	}
}

function main() {

	fin.revMasterUi = new fin.rev.master.UserInterface();
	fin.revMasterUi.resize();
	fin.houseCodeSearchUi = fin.revMasterUi;
}
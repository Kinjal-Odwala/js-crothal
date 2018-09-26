ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.rev.workOrderToInvoice.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );

ii.Class({
    Name: "fin.rev.workOrderToInvoice.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer(me.gateway);
			me.authorizePath = "\\crothall\\chimes\\fin\\Accounts Receivable\\Convert WO to Invoice";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);			

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);

			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.startDate.setValue(me.getDate("firstDayOfMonth"));
			me.endDate.setValue(me.getDate("today"));

			$(window).bind("resize", me, me.resize);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_rev_workOrderToInvoice_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
		
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
			
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
			me.closeReasonTypeStore.fetch("userId:[user]", me.closeReasonTypesLoaded, me);
		},	
		
		sessionLoaded: function fin_rev_workOrderToInvoice_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var offset = document.documentElement.clientHeight - 145;
			
			fin.workOrderToInvoiceUi.workOrderGrid.setHeight(offset);
		},
		
		defineFormControls: function() {
			var me = this;
			
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
				});
				
			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadItem(); },
				hasHotState: true
			});
			
			me.anchorCreate = new ui.ctl.buttons.Sizeable({
				id: "AnchorCreate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate&nbsp;Invoices&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateInvoices(); },
				hasHotState: true
			});
			
			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close WO Without Invoicing&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloseWorkOrders(); },
				hasHotState: true
			});

			me.workOrderGrid = new ui.ctl.Grid({
				id: "WorkOrderGrid",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
			});
			
			me.closeReasonType = new ui.ctl.Input.DropDown.Filtered({
		        id: "CloseReasonType",
				appendToId: "WorkOrderGridControlHolder",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.modified(); }
		    });

			me.closeReasonType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {

					if (me.closeReasonType.lastBlurValue != "" && me.closeReasonType.indexSelected == -1)
						this.setInvalid("Please select the correct Close Reason.");
				});
		   
		  	me.houseCodeTitle = new ui.ctl.Input.Text({
		        id: "HouseCodeTitle",
		        appendToId: "WorkOrderGridControlHolder"
		    });

			me.workOrderGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.workOrderGrid.rows.length - 1;
                return "<span id='spanInputCheck" + index + "'><input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"actionClickItem(this);\" " + (me.workOrders[index].assigned == true ? checked='checked' : '') + " /></span>";
            });
			me.workOrderGrid.addColumn("closeReasonType", "closeReasonType", "Close Reason", "Close Reason", 140, function(reason) { return reason.title; }, me.closeReasonType);
			me.workOrderGrid.addColumn("houseCodeTitle", "houseCodeTitle", "House Code", "House Code", 180, null, me.houseCodeTitle);
			me.workOrderGrid.addColumn("workOrderNumber", "workOrderNumber", "Work Order #", "Work Order Number", 120);
			me.workOrderGrid.addColumn("customer", "customer", "Customer", "Customer", null);
			me.workOrderGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 120);
			me.workOrderGrid.addColumn("completedDate", "completedDate", "Completed Date", "Completed Date", 130);
			me.workOrderGrid.capColumns();
		},		
				
		configureCommunications: function fin_rev_workOrderToInvoice_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.rev.workOrderToInvoice.HirNode,
				itemConstructorArgs: fin.rev.workOrderToInvoice.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.rev.workOrderToInvoice.HouseCode,
				itemConstructorArgs: fin.rev.workOrderToInvoice.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.closeReasonTypes = [];
			me.closeReasonTypeStore = me.cache.register({
				storeId: "womCloseReasonTypes",
				itemConstructor: fin.rev.workOrderToInvoice.CloseReasonType,
				itemConstructorArgs: fin.rev.workOrderToInvoice.closeReasonTypeArgs,
				injectionArray: me.closeReasonTypes
			});

			me.workOrders = [];
			me.workOrderStore = me.cache.register({
				storeId: "womWorkOrders",
				itemConstructor: fin.rev.workOrderToInvoice.WorkOrder,
				itemConstructorArgs: fin.rev.workOrderToInvoice.workOrderArgs,
				injectionArray: me.workOrders
			});
			
			me.taxValidations = [];
			me.taxValidationStore = me.cache.register({
				storeId: "bulkImportValidations",
				itemConstructor: fin.rev.workOrderToInvoice.TaxValidation,
				itemConstructorArgs: fin.rev.workOrderToInvoice.taxValidationArgs,
				injectionArray: me.taxValidations
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
		
		resizeControls: function() {
			var me = this;

			me.startDate.resizeText();
			me.endDate.resizeText();
			me.resize();
		},
		
		getDate: function(monthDay) {
            var today = new Date();
            var month = today.getMonth() + 1;
            var day = today.getDate();
            var year = today.getFullYear();

			if (monthDay == "today")
            	return month + "/" + day + "/" + year;
			else if (monthDay == "firstDayOfMonth")
            	return month + "/01/" + year;
        },
		
		houseCodesLoaded: function(me, activeId) {
			
			ii.trace("House Code Loaded", ii.traceTypes.information, "Info");

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},

		closeReasonTypesLoaded: function(me, activeId) {

			me.closeReasonType.setData(me.closeReasonTypes);
			me.checkLoadCount();
		},

		actionLoadItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var houseCodeId = 0;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.workOrderGrid.activeRowIndex >= 0)
				me.workOrderGrid.body.deselect(me.workOrderGrid.activeRowIndex, true);
				
			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}

			me.setLoadCount();
			
			if ($("#houseCodeText").val() != "" )
				houseCodeId = parent.fin.appUI.houseCodeId;

			me.workOrderStore.reset();
			me.workOrderStore.fetch("userId:[user],houseCodeId:" + houseCodeId
				+ ",houseCodeJobId:0"
				+ ",status:9"
				+ ",startDate:" + me.startDate.lastBlurValue
				+ ",endDate:" + me.endDate.lastBlurValue
				, me.workOrdersLoaded
				, me);
		},
		
		workOrdersLoaded: function(me, activeId) {
			
			me.workOrderGrid.setData(me.workOrders);
			me.checkLoadCount();
			me.resizeControls();
		},
		
		itemSelect: function() {			
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;
			var item = me.workOrderGrid.data[index];
			
			if (index >= 0)
				me.houseCodeTitle.text.readOnly = true;
		},
		
		actionGenerateInvoices: function() {
			var me = this;			
			var count = 0;
			var houseCodes = "";
			
			me.workOrderGrid.body.deselectAll();
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true) && me.workOrderGrid.activeRowIndex >= 0) {
				alert("In order to generate invoices, no need to select the Close Reason.");
				return false;
			}
			
			for (var index = 0; index < me.workOrders.length; index++) {			
				if ($("#assignInputCheck" + index)[0].checked) {
					count++;
					houseCodes += me.workOrders[index].houseCodeBrief + "|";
				}
			}

			if (count == 0) {
				alert("Please select at least one work order to generate invoice.");
				return;
			}			
			else {
				$("#messageToUser").text("Validating");
				$("#pageLoading").fadeIn("slow");

				me.taxValidationStore.reset();
				me.taxValidationStore.fetch("userId:[user],houseCodes:" + houseCodes, me.validationsLoaded, me);
			}
		},
		
		validationsLoaded: function(me, activeId) {

			if (me.taxValidations.length > 0 && me.taxValidations[0].taxHouseCodes != "") {
				$("#pageLoading").fadeOut("slow");
				
				var taxHouseCodes = me.taxValidations[0].taxHouseCodes.split('|');

				for (var rowIndex = 0; rowIndex < me.workOrders.length; rowIndex++) {
					if ($("#assignInputCheck" + rowIndex)[0].checked) {
						for (var index = 0; index < taxHouseCodes.length - 1; index++) {
							if (me.workOrders[rowIndex].houseCodeBrief == taxHouseCodes[index]) {
								var errorMessage = "Error - There is a mismatch with the Site setup information for the "
									+ "House Code [" + me.workOrders[rowIndex].houseCodeBrief + "]. "
									+ "Please correct the address of the site by accessing HouseCode -> Sites prior to continuing.";
							
						        $("#spanInputCheck" + rowIndex).css("background-color", "red");
								$("#spanInputCheck" + rowIndex).attr("title", errorMessage);
							}
						}
					}					
				}

				alert("In order to generate invoices, the errors on the page must be corrected.");
			}
			else {
				var xml = "";

				for (var index = 0; index < me.workOrders.length; index++) {			
					if ($("#assignInputCheck" + index)[0].checked) {
						xml += '<revInvoiceFromWorkOrder';			
						xml += ' id="' + me.workOrders[index].id + '"';
						xml += '/>';
					}
				}
				me.actionSaveItem(xml);
			}
		},
		
		actionCloseWorkOrders: function() {
			var me = this;
			var xml = "";
			var count = 0;
			
			me.workOrderGrid.body.deselectAll();
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if(!me.validator.queryValidity(true) && me.workOrderGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			for (var index = 0; index < me.workOrders.length; index++) {
				if ($("#assignInputCheck" + index)[0].checked) {

					if (me.workOrders[index].closeReasonType == undefined || me.workOrders[index].closeReasonType.title == "") {
						alert("Please select correct Close Reason for selected work orders.");
						return false;
					}
					
					count++;					
					xml += '<womWorkOrderStatus';
					xml += ' id="' + me.workOrders[index].id + '"';
					xml += ' statusType="5"';
					xml += ' notes="' + me.workOrders[index].closeReasonType.title + '"';
					xml += '/>';
				}
			}

			if (count == 0) {
				alert("Please select at least one work order to close without invoicing.");
				return;
			}

			if (xml == "")
				return;

			me.actionSaveItem(xml);
		},

		actionSaveItem: function(xml) {
			var me = this;
			var item = [];
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
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

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
									
			if (status == "success") {
				me.modified(false);
				me.actionLoadItem();
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while converting the Work Order to Invoice: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow"); 
			}
		}		
	} 
});

function actionClickItem(objCheckBox) {
	var me = fin.workOrderToInvoiceUi;
	var index = parseInt(objCheckBox.id.replace("assignInputCheck", ""), 10);

	me.modified();
	me.workOrders[index].assigned = objCheckBox.checked;
	$("#spanInputCheck" + index).removeAttr("style")
	$("#spanInputCheck" + index).attr("title", "");
}

function main() {

	fin.workOrderToInvoiceUi = new fin.rev.workOrderToInvoice.UserInterface();
	fin.workOrderToInvoiceUi.resize();
	fin.houseCodeSearchUi = fin.workOrderToInvoiceUi;
}
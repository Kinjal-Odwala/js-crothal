ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons");
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.rev.bulkInvoiceImport.usr.defs" );

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
    Name: "fin.rev.bulkInvoiceImport.UserInterface",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.batchId = 0;
			me.dataLoaded = false;
			me.batchProcessCompleted = true;
			me.refreshingGrid = false;
			me.fileName = "";
			me.cellColorValid = "";
			me.cellColorInvalid = "red";
			me.batches = [];
			me.status = "";
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("rev", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "rev\\bulkInvoiceImport";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);			

			me.defineFormControls();			
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);

			$(window).bind("resize", me, me.resize);
			$("#divInvoiceGrid").bind("scroll", me.invoiceGridScroll);
			
			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}

			window.onunload = function(event) {
				if (me.dataLoaded) {
					alert("Your session will be cleared.");
					me.actionSaveCancel();
				}
			};

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},

		authorizationProcess: function fin_rev_bulkInvoiceImport_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
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
			me.session.registerFetchNotify(me.sessionLoaded, me);
			me.taxableServiceStore.fetch("userId:[user]", me.taxableServicesLoaded, me);
		},	
		
		sessionLoaded: function fin_rev_bulkInvoiceImport_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;

			fin.rev.bulkInvoiceImportUI.batchGrid.setHeight($(window).height() - 110);			
			
			var divInvoiceGridWidth = $(window).width() - 22;
			var divInvoiceGridHeight = $(window).height() - 140;

			$("#divInvoiceGrid").css({"width" : divInvoiceGridWidth + "px", "height" : divInvoiceGridHeight + "px"});
		},
		
		invoiceGridScroll: function() {
		    var scrollLeft = $("#divInvoiceGrid").scrollLeft();
		    
			$("#tblInvoiceGridHeader").css("left", -scrollLeft + "px");
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "importAction",
					brief: "Bulk Invoice Import", 
					title: "Upload the Excel file for importing bulk invoices.",
					actionFunction: function() { me.actionImportItem(); }
				})				
				.addAction({
					id: "batchStatusAction", 
					brief: "Batch Process Status", 
					title: "View the status of the bulk invoice import batch.",
					actionFunction: function() { me.actionBatchProcessStatus(); }
				});
			
			me.anchorUpload = new ui.ctl.buttons.Sizeable({
				id: "AnchorUpload",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Upload&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUploadItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.validate = new ui.ctl.buttons.Sizeable({
				id: "AnchorValidate",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Validate&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionValidateItem(); },
				hasHotState: true
			});
			
			me.anchorProcessBatch = new ui.ctl.buttons.Sizeable({
				id: "AnchorProcessBatch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Process Batch&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionProcessBatch(); },
				hasHotState: true
			});

			me.anchorSaveCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorSaveCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveCancel(); },
				hasHotState: true
			});
			
			me.anchorExportToExcel = new ui.ctl.buttons.Sizeable({
				id: "AnchorExportToExcel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcel(); },
				hasHotState: true
			});
			
			me.anchorCancelBatch = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelBatch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel Batch&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelBatch(); },
				hasHotState: true
			});

			me.anchorOK = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCreateBatch(); },
				hasHotState: true
			});

			me.anchorBatchCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorBatchCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBatchCancel(); },
				hasHotState: true
			});

			me.title = new ui.ctl.Input.Text({
		        id: "Title",
		        maxLength: 64
		    });

			me.title.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {

					if (me.title.getValue() == "")
						return;

					if (!(/^[^\\\/\:\*\?\"\<\>\|\.\;\,]+$/.test(me.title.getValue())))
						this.setInvalid("Please enter the correct Title. The title can't contain any of the following characters: \\/:*?\"<>|.;,");
				});

			me.batchGrid = new ui.ctl.Grid({
				id: "BatchGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
			});
			
			me.batchGrid.addColumn("statusType", "", "", "Status", 30, function(batch) {
				if (batch.statusType == 2 && batch.insertedRows == 0 && batch.importedRows == 0)
					return "<center><img src='/fin/cmn/usr/media/Common/red.png' title='Failed'></center>";
				else if (batch.statusType == 2)
					return "<center><img src='/fin/cmn/usr/media/Common/indicator.gif' title='Processing'></center>";
				else if (batch.statusType == 9)
                	return "<center><img src='/fin/cmn/usr/media/Common/green.png' title='Completed'></center>";
				else if (batch.statusType == 6)
                	return "<center><img src='/fin/cmn/usr/media/Common/yellow.png' title='Cancelled'></center>";
          	});
			me.batchGrid.addColumn("title", "title", "Title", "Title", null);
			me.batchGrid.addColumn("status", "", "Status", "Status", 250, function(batch) {
				if (batch.statusType == 2 && batch.insertedRows == 0 && batch.importedRows == 0)
					return "Failed due to unknown exception";
				else if (batch.statusType == 2)
					return "Processing (" + batch.importedRows + " rows are imported)";
				else if (batch.statusType == 9)
                	return "Completed";
				else if (batch.statusType == 6)
                	return "Cancelled";
           	});
			me.batchGrid.addColumn("totalRows", "totalRows", "Total Rows", "Total Rows", 100);
			me.batchGrid.addColumn("startedOn", "startedOn", "Started On", "Started On", 170);
			me.batchGrid.addColumn("completedOn", "completedOn", "Completed On", "Completed On", 170);
			me.batchGrid.capColumns();
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.taxableServices = [];
			me.taxableServiceStore = me.cache.register({
				storeId: "revTaxableServices",
				itemConstructor: fin.rev.bulkInvoiceImport.TaxableService,
				itemConstructorArgs: fin.rev.bulkInvoiceImport.taxableServiceArgs,
				injectionArray: me.taxableServices
			});

			me.invoices = [];
			me.invoiceStore = me.cache.register({
				storeId: "revInvoiceImports",
				itemConstructor: fin.rev.bulkInvoiceImport.Invoice,
				itemConstructorArgs: fin.rev.bulkInvoiceImport.invoiceArgs,
				injectionArray: me.invoices
			});

			me.bulkImportValidations = [];
			me.bulkImportValidationStore = me.cache.register({
				storeId: "bulkImportValidations",
				itemConstructor: fin.rev.bulkInvoiceImport.BulkImportValidation,
				itemConstructorArgs: fin.rev.bulkInvoiceImport.bulkImportValidationArgs,
				injectionArray: me.bulkImportValidations
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
				storeId: "revInvoiceExcelFileNames",
				itemConstructor: fin.rev.bulkInvoiceImport.FileName,
				itemConstructorArgs: fin.rev.bulkInvoiceImport.fileNameArgs,
				injectionArray: me.fileNames
			});

			me.invoiceBatches = [];
			me.batchStore = me.cache.register({
				storeId: "revInvoiceBatchs",
				itemConstructor: fin.rev.bulkInvoiceImport.Batch,
				itemConstructorArgs: fin.rev.bulkInvoiceImport.batchArgs,
				injectionArray: me.invoiceBatches
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
		
		taxableServicesLoaded: function(me, activeId) {
 
			me.taxableServices.unshift(new fin.rev.bulkInvoiceImport.TaxableService(0, "", ""));
			me.checkLoadCount();
        },

		buildDropDown: function(controlName, types, title) {
		    var me = this;
			var type = {};
		    var selType = null;
			var options = "";

		    for (var index = 0; index < types.length; index++) {
				type = types[index];
				
				if (type.brief == title)
		        	options += "<option title='" + type.title + "' value='" + type.id + "' selected>" + type.title + "</option>";
				else
					options += "<option title='" + type.title + "' value='" + type.id + "'>" + type.title + "</option>";
		    }

			selType = $("#" + controlName);
			selType.append(options);
		},	

		actionImportItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Bulk Invoice Import");
			$("#AnchorValidate").hide();			
			$("#AnchorProcessBatch").hide();
			$("#AnchorSaveCancel").hide();
			$("#tblInvoices").hide();
			$("#divDownload").hide();
			$("#iFrameUpload").height(30);
			$("#divFrame").height(45);
			$("#divFrame").show();
			$("#divUpload").show();
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},

		actionBatchProcessStatus: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			$("#pageHeader").text("Batch Process Status");
			me.setLoadCount();
			$("#pageLoading").show();
			$("#divFrame").height(0);
			$("#iFrameUpload").height(0);
			$("#divUpload").hide();
			$("#tblInvoices").hide();
			$("#AnchorValidate").hide();
			$("#AnchorProcessBatch").hide();
			$("#AnchorSaveCancel").hide();
			$("#AnchorExportToExcel").show();
			$("#AnchorCancelBatch").show();			
			$("#divDownload").show();
			me.batchGrid.resize();
			me.batchStore.reset();
			me.batchStore.fetch("userId:[user],statusType:0", me.batchesLoaded, me);
			me.anchorExportToExcel.display(ui.cmn.behaviorStates.disabled);
			me.anchorCancelBatch.display(ui.cmn.behaviorStates.disabled);
		},
		
		batchesLoaded: function(me, activeId) {

			if (me.refreshingGrid) {
				for (var index = 0; index < me.invoiceBatches.length; index++) {
					for (var iIndex = 0; iIndex < me.batches.length; iIndex++) {
						if (me.batches[iIndex].id == me.invoiceBatches[index].id) {
							if (me.batches[iIndex].statusType == 2) {
								me.batches[iIndex] = me.invoiceBatches[index];
								me.batchGrid.body.renderRow(iIndex, iIndex);
							}
								
							break;
						}
					}
				}
			}
			else {
				me.batches = me.invoiceBatches.slice();
				me.batchGrid.setData(me.batches);
			}

			me.batchProcessCompleted = true;
			
			me.checkLoadCount();
			
			for (var index = 0; index < me.batches.length; index++) {
				if (me.batches[index].statusType == 2 && me.batches[index].insertedRows > 0) {
					me.batchProcessCompleted = false;
					break;
				}
			}

			if (!me.refreshingGrid && !me.batchProcessCompleted) {
				me.refreshGrid();
				me.refreshingGrid = true;
			}
		},

		refreshGrid: function() {
			var me = this;

			var intervalId = setInterval(function() {
				if (me.batchProcessCompleted) {
					clearInterval(intervalId);
					me.refreshingGrid = false;
				}
				
				var batchIds = "";

				for (var index = 0; index < me.batches.length; index++) {
					if (me.batches[index].statusType == 2 && me.batches[index].insertedRows > 0) {
						batchIds += me.batches[index].id + "|";
					}
				}
				
				if (batchIds == "") {
					clearInterval(intervalId);
					me.refreshingGrid = false;
				}
				else {
					batchIds = batchIds.substring(0, batchIds.length - 1);
					me.batchStore.reset();
					me.batchStore.fetch("userId:[user],statusType:0,batchIds:" + batchIds, me.batchesLoaded, me);
				}
			}, 5000);
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number} 
			});
			var me = this;

			if (me.batches[args.index].statusType == 9) {
				me.anchorExportToExcel.display(ui.cmn.behaviorStates.enabled);
				me.anchorCancelBatch.display(ui.cmn.behaviorStates.enabled);
			}				
			else {
				me.anchorExportToExcel.display(ui.cmn.behaviorStates.disabled);
				me.anchorCancelBatch.display(ui.cmn.behaviorStates.disabled);
			}				
		},
		
		actionExportToExcel: function() {
			var me = this;
			
			if (me.batchGrid.activeRowIndex == -1)
				return;
				
			var batchId = me.batches[me.batchGrid.activeRowIndex].batchId;
			var title = me.batches[me.batchGrid.activeRowIndex].title;
			
			me.setStatus("Exporting");
			$("#messageToUser").text("Exporting to Excel");
			$("#pageLoading").fadeIn("slow");
			
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],title:" + title + ",batchId:" + batchId, me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {
			var excelFileName = "";

			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow");

			if (me.fileNames.length == 1) {

				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},
		
		actionCancelItem: function() {
			var me = this;-
			
			$("iframe")[0].contentWindow.document.getElementById("FormReset").click();
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);			
		},
		
		actionUploadItem: function() {
			var me = this;

			me.dataLoaded = false;
			me.fileName = "";
			
			me.setLoadCount();
			$("#messageToUser").text("Uploading");
			$("iframe")[0].contentWindow.document.getElementById("FileName").value = "";
			$("iframe")[0].contentWindow.document.getElementById("UploadButton").click();
		
			me.intervalId = setInterval(function() {
				
				if ($("iframe")[0].contentWindow.document.getElementById("FileName").value != "")	{
					me.fileName = $("iframe")[0].contentWindow.document.getElementById("FileName").value;					
					clearInterval(me.intervalId);
					
					if (me.fileName == "Error") {
						alert("Unable to upload the file. Please try again.")
						me.checkLoadCount();
					}
					else {
						$("#messageToUser").text("Processing");
						me.invoiceStore.reset();
						me.invoiceStore.fetch("userId:[user],status:import,fileName:" + me.fileName, me.invoiceLoaded, me);
					}
				}			
				
			}, 1000);
		},
		
		invoiceLoaded: function(me, activeId) {

			var invoiceRow = "";
			var invoiceRowTemplate = $("#tblInvoiceTemplate").html();

			$("#messageToUser").text("Loading");
			$("#InvoiceGridBody").html("");

			for (var index = 0; index < me.invoices.length; index++) {
				//create the row for the invoice information
				invoiceRow = invoiceRowTemplate;
				invoiceRow = invoiceRow.replace(/RowCount/g, index);
				invoiceRow = invoiceRow.replace("#", index + 1);
				
				$("#InvoiceGridBody").append(invoiceRow);
				if (me.invoices[index].taxExempt.toUpperCase() == "Y")
					$("#chkTaxExempt" + index)[0].checked = true;
				$("#txtSequence" + index).val(me.invoices[index].sequence);
				$("#txtCustomerNumber" + index).val(me.invoices[index].customerNumber);
				$("#txtTaxExemptId" + index).val(me.invoices[index].taxNumber);
				$("#txtHouseCode" + index).val(me.invoices[index].houseCode);
				$("#txtJobCode" + index).val(me.invoices[index].jobCode);
				me.buildDropDown("selTaxableService" + index, me.taxableServices, me.invoices[index].taxableService);
				$("#txtAccountCode" + index).val(me.invoices[index].accountCode);
				$("#txtInvoiceDate" + index).val(me.invoices[index].invoiceDate);
				$("#txtDueDate" + index).val(me.invoices[index].dueDate);
				$("#txtStartDate" + index).val(me.invoices[index].periodStartDate);
				$("#txtEndDate" + index).val(me.invoices[index].periodEndDate);
				$("#txtPONumber" + index).val(me.invoices[index].poNumber);
				$("#txtDescription" + index).val(me.invoices[index].itemDescription);
				if (me.invoices[index].show.toUpperCase() == "Y")
					$("#chkShow" + index)[0].checked = true;
				$("#txtQuantity" + index).val(me.invoices[index].quantity);
				$("#txtPrice" + index).val(me.invoices[index].price);
				$("#txtStatus" + index).val(me.invoices[index].status);
				if (me.invoices[index].invoiceByHouseCode == "" || me.invoices[index].invoiceByHouseCode.toUpperCase() == "Y")
					$("#chkInvoiceByHouseCode" + index)[0].checked = true;
				$("#tdInvoiceNumber" + index).hide();
				//$("#chkTaxExempt" + index).change(function() { me.setTaxable(this); });
			}
			invoiceRow = '<tr height="100%"><td id="tdLastRow" colspan="20" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#InvoiceGridBody").append(invoiceRow);
			$("#InvoiceGrid tr:odd").addClass("gridRow");
        	$("#InvoiceGrid tr:even").addClass("alternateGridRow");			
			$("#thInvoiceNumber").hide();
			$("#divFrame").hide();
			$("#divUpload").hide();			
			$("#AnchorProcessBatch").hide();
			$("#AnchorSaveCancel").hide();
			$("#AnchorExportToExcel").hide();
			$("#AnchorCancelBatch").hide();
			$("#AnchorValidate").show();
			$("#tblInvoices").show();
			
			me.resize();
			me.dataLoaded = true;
			me.modified();
			
			me.checkLoadCount();
  		},

//		setTaxable: function(objCheckBox) {
//			var me = this;
//			var id = Number(objCheckBox.id.replace("chkTaxExempt", ""));
//			var sequence = $("#txtSequence" + id).val();
//
//			if (!(id != 0 && $("#txtSequence" + (id - 1)).val() == sequence)) {
//				for (var index = id; index < me.invoices.length; index++) {
//					if ($("#txtSequence" + index).val() == sequence) {
//						$("#chkTaxable" + index)[0].checked = objCheckBox.checked;
//						$("#chkTaxable" + index).attr("disabled", objCheckBox.checked);
//					}
//					else {
//						break;
//					}
//				}
//			}
//		},

		actionValidateItem: function() {
			var me = this;			
			var valid = true;
			var rowValid = true;
			var sequenceNumber = 0;
			var customerNumber = "";
			var houseCode = "";
			var customerNumbers = "";
			var houseCodes = "";
			var jobCodes = "";
			var accountCodes = "";
			var invoiceByHouseCode = true;

			for (var index = 0; index < me.invoices.length; index++) {
				rowValid = true;

				if (sequenceNumber != $("#txtSequence" + index).val()) {
					sequenceNumber = $("#txtSequence" + index).val();
					customerNumber = $("#txtCustomerNumber" + index).val();
					houseCode = $("#txtHouseCode" + index).val();
					invoiceByHouseCode = ($("#chkInvoiceByHouseCode" + index)[0].checked);
					me.invoices[index].invoiceNumber = -1;

					if (!(/^[0-9]+$/.test($("#txtSequence" + index).val()))) {
						rowValid = false;
						$("#txtSequence" + index).attr("title", "Invalid Sequence #.");
						$("#txtSequence" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtSequence" + index).attr("title", "");
						$("#txtSequence" + index).css("background-color", me.cellColorValid);
					}						

					if (!(/^[0-9]+$/.test($("#txtCustomerNumber" + index).val()))) {
						rowValid = false;
						$("#txtCustomerNumber" + index).attr("title", "Invalid Customer Number.");
						$("#txtCustomerNumber" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtCustomerNumber" + index).attr("title", "");
						$("#txtCustomerNumber" + index).css("background-color", me.cellColorValid);
					}

					if ($("#chkTaxExempt" + index)[0].checked) {
						if (!(/^[0-9]+$/.test($("#txtTaxExemptId" + index).val()))) {
							rowValid = false;
							$("#txtTaxExemptId" + index).attr("title", "Invalid Tax Exempt Id.");
							$("#txtTaxExemptId" + index).css("background-color", me.cellColorInvalid);
						}
						else {
							$("#txtTaxExemptId" + index).attr("title", "");
							$("#txtTaxExemptId" + index).css("background-color", me.cellColorValid);
						}
					}
					else if ($("#chkTaxExempt" + index)[0].checked == false) {
						if ($("#txtTaxExemptId" + index).val() != "") {
							rowValid = false;
							$("#txtTaxExemptId" + index).attr("title", "Tax Exempt Id should be blank.");
							$("#txtTaxExemptId" + index).css("background-color", me.cellColorInvalid);
						}
						else {
							$("#txtTaxExemptId" + index).attr("title", "");
							$("#txtTaxExemptId" + index).css("background-color", me.cellColorValid);
						}
					}
						
					if (!(/^[0-9]+$/.test($("#txtHouseCode" + index).val()))) {
						rowValid = false;
						$("#txtHouseCode" + index).attr("title", "Invalid House Code.");
						$("#txtHouseCode" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtHouseCode" + index).attr("title", "");
						$("#txtHouseCode" + index).css("background-color", me.cellColorValid);
					}

					if (ui.cmn.text.validate.generic($("#txtInvoiceDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						rowValid = false;
						$("#txtInvoiceDate" + index).attr("title", "Invalid Invoice Date.");
						$("#txtInvoiceDate" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtInvoiceDate" + index).attr("title", "");
						$("#txtInvoiceDate" + index).css("background-color", me.cellColorValid);
					}
						
					if (ui.cmn.text.validate.generic($("#txtDueDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						rowValid = false;
						$("#txtDueDate" + index).attr("title", "Invalid Due Date.");
						$("#txtDueDate" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtDueDate" + index).attr("title", "");
						$("#txtDueDate" + index).css("background-color", me.cellColorValid);						
					}
						
					if (ui.cmn.text.validate.generic($("#txtStartDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						rowValid = false;
						$("#txtStartDate" + index).attr("title", "Invalid Start Date.");
						$("#txtStartDate" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtStartDate" + index).attr("title", "");
						$("#txtStartDate" + index).css("background-color", me.cellColorValid);
					}
	
					if (ui.cmn.text.validate.generic($("#txtEndDate" + index).val(), "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						rowValid = false;
						$("#txtEndDate" + index).attr("title", "Invalid End Date.");
						$("#txtEndDate" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtEndDate" + index).attr("title", "");
						$("#txtEndDate" + index).css("background-color", me.cellColorValid);
					}
						
					if (($("#txtStatus" + index).val().toLowerCase() == "open") || ($("#txtStatus" + index).val().toLowerCase() == "printed")) {
						$("#txtStatus" + index).attr("title", "");
						$("#txtStatus" + index).css("background-color", me.cellColorValid);
					}
					else {
						rowValid = false;
						$("#txtStatus" + index).attr("title", "Invalid Status. It should be either Open or Printed.");
						$("#txtStatus" + index).css("background-color", me.cellColorInvalid);
					}						
				}
				else {
					if ($("#txtCustomerNumber" + index).val() != "" && customerNumber != $("#txtCustomerNumber" + index).val()) {
						rowValid = false;
						$("#txtCustomerNumber" + index).attr("title", "Customer Number should be same for same Sequence #.");
						$("#txtCustomerNumber" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtCustomerNumber" + index).attr("title", "");
						$("#txtCustomerNumber" + index).css("background-color", me.cellColorValid);
					}
					
					if ($("#txtHouseCode" + index).val() != "" && houseCode != $("#txtHouseCode" + index).val() && invoiceByHouseCode) {
						rowValid = false;
						$("#txtHouseCode" + index).attr("title", "House Code should be same for same Sequence #.");
						$("#txtHouseCode" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtHouseCode" + index).attr("title", "");
						$("#txtHouseCode" + index).css("background-color", me.cellColorValid);
					}

					$("#txtSequence" + index).attr("title", "");
					$("#txtTaxExemptId" + index).attr("title", "");
					$("#txtInvoiceDate" + index).attr("title", "");
					$("#txtDueDate" + index).attr("title", "");
					$("#txtStartDate" + index).attr("title", "");
					$("#txtEndDate" + index).attr("title", "");
					$("#txtStatus" + index).attr("title", "");
					
					$("#txtSequence" + index).css("background-color", me.cellColorValid);
					$("#txtTaxExemptId" + index).css("background-color", me.cellColorValid);
					$("#txtInvoiceDate" + index).css("background-color", me.cellColorValid);
					$("#txtDueDate" + index).css("background-color", me.cellColorValid);
					$("#txtStartDate" + index).css("background-color", me.cellColorValid);
					$("#txtEndDate" + index).css("background-color", me.cellColorValid);
					$("#txtStatus" + index).css("background-color", me.cellColorValid);
				}
				
				if ($("#txtJobCode" + index).val() != "" && !(/^[0-9]+$/.test($("#txtJobCode" + index).val()))) {
					rowValid = false;
					$("#txtJobCode" + index).attr("title", "Invalid Job Code.");
					$("#txtJobCode" + index).css("background-color", me.cellColorInvalid);
				}
				else {
					$("#txtJobCode" + index).attr("title", "");
					$("#txtJobCode" + index).css("background-color", me.cellColorValid);
				}
				
				if ($("#selTaxableService" + index).val() == "0") {
					rowValid = false;
					$("#selTaxableService" + index).attr("title", "Please select valid Taxable Service.");
					$("#selTaxableService" + index).css("background-color", me.cellColorInvalid);
				}
				else {
					$("#selTaxableService" + index).attr("title", "");
					$("#selTaxableService" + index).css("background-color", me.cellColorValid);
				}

				jobCodes += $("#txtJobCode" + index).val() + "|";
				accountCodes += $("#txtAccountCode" + index).val() + "|";

				if (!(/^[0-9]+$/.test($("#txtAccountCode" + index).val()))) {
					rowValid = false;
					$("#txtAccountCode" + index).attr("title", "Invalid Account Code.");
					$("#txtAccountCode" + index).css("background-color", me.cellColorInvalid);
				}
				else {
					$("#txtAccountCode" + index).attr("title", "");
					$("#txtAccountCode" + index).css("background-color", me.cellColorValid);
				}

				if (!(/^[+]?[0-9]+(\.[0-9]+)?$/.test($("#txtQuantity" + index).val()))) {
					rowValid = false;
					$("#txtQuantity" + index).attr("title", "Invalid Quantity.");
					$("#txtQuantity" + index).css("background-color", me.cellColorInvalid);
				}
				else {
					$("#txtQuantity" + index).attr("title", "");
					$("#txtQuantity" + index).css("background-color", me.cellColorValid);
				}

				if (!(/^[-]?[0-9]+(\.[0-9]+)?$/.test($("#txtPrice" + index).val()))) {
					rowValid = false;
					$("#txtPrice" + index).attr("title", "Invalid Price.");
					$("#txtPrice" + index).css("background-color", me.cellColorInvalid);
				}
				else {
					$("#txtPrice" + index).attr("title", "");
					$("#txtPrice" + index).css("background-color", me.cellColorValid);
				}

				if (rowValid) {
					if ($("#txtCustomerNumber" + index).val() != "")
						customerNumbers += $("#txtCustomerNumber" + index).val() + "|";
					else
						customerNumbers += customerNumber + "|";

					if ($("#txtHouseCode" + index).val() != "")
						houseCodes += $("#txtHouseCode" + index).val() + "|";
					else
						houseCodes += houseCode + "|";
				}

				if (!rowValid) {					
					if (valid)
						valid = false;
				}
			}

			// If all required fields are entered correctly then validate the Customer Numbers, House Codes and Account Codes
			if (valid) {
				me.setLoadCount();
				$("#messageToUser").text("Validating");
			
				me.bulkImportValidationStore.reset();
				me.bulkImportValidationStore.fetch("userId:[user]"
					+ ",customerNumbers:" + customerNumbers
					+ ",houseCodes:" + houseCodes
					+ ",jobCodes:" + jobCodes
					+ ",accountCodes:" + accountCodes
					, me.validationsLoaded
					, me);
			}
			else {
				$("#AnchorProcessBatch").hide();
				alert("In order to process the batch, the errors on the page must be corrected.");
			}
		},

		validationsLoaded: function(me, activeId) {

			me.checkLoadCount();

			if (me.bulkImportValidations.length > 0) {

				var customerNumbers = me.bulkImportValidations[0].customerNumbers.split('|');
				var houseCodes = me.bulkImportValidations[0].houseCodes.split('|');
				var jobCodes = me.bulkImportValidations[0].jobCodes.split('|');
				var taxHouseCodes = me.bulkImportValidations[0].taxHouseCodes.split('|');
				var accountCodes = me.bulkImportValidations[0].accountCodes.split('|');

				for (var rowIndex = 0; rowIndex < me.invoices.length; rowIndex++) {
					for (var index = 0; index < customerNumbers.length - 1; index++) {
						var invalidCustomerNumbers = customerNumbers[index].split(':');
						var customerNumber = invalidCustomerNumbers[0];
						var houseCode = invalidCustomerNumbers[1];

						if ($("#txtCustomerNumber" + rowIndex).val() == customerNumber && $("#txtHouseCode" + rowIndex).val() == houseCode) {
							$("#txtCustomerNumber" + rowIndex).attr("title", "Either Customer # doesn't exists or it is not associated with the House Code [" + houseCode + "].");
							$("#txtCustomerNumber" + rowIndex).css("background-color", me.cellColorInvalid);							
						}
					}

					for (var index = 0; index < houseCodes.length - 1; index++) {
						if ($("#txtHouseCode" + rowIndex).val() == houseCodes[index]) {
							$("#txtHouseCode" + rowIndex).attr("title", "House Code doesn't exists.");
							$("#txtHouseCode" + rowIndex).css("background-color", me.cellColorInvalid);							
						}							
					}

					for (var index = 0; index < jobCodes.length - 1; index++) {
						var invalidJobCodes = jobCodes[index].split(':');
						var jobCode = invalidJobCodes[0];
						var houseCode = invalidJobCodes[1];

						if ($("#txtJobCode" + rowIndex).val() == jobCode && $("#txtHouseCode" + rowIndex).val() == houseCode) {
							$("#txtJobCode" + rowIndex).attr("title", "Either Job Code doesn't exists or it is not associated with the House Code [" + houseCode + "].");
							$("#txtJobCode" + rowIndex).css("background-color", me.cellColorInvalid);							
						}
					}

					for (var index = 0; index < accountCodes.length - 1; index++) {
						if ($("#txtAccountCode" + rowIndex).val() == accountCodes[index]) {
							$("#txtAccountCode" + rowIndex).attr("title", "Account Code doesn't exists.");
							$("#txtAccountCode" + rowIndex).css("background-color", me.cellColorInvalid);							
						}
					}

					for (var index = 0; index < taxHouseCodes.length - 1; index++) {
						if ($("#txtHouseCode" + rowIndex).val() == taxHouseCodes[index]) {
							var message = "Error - There is a mismatch with the Site setup information for the "
								+ "House Code [" + $("#txtHouseCode" + rowIndex).val() + "]. "
								+ "Please correct the address of the site by accessing HouseCode -> Sites prior to continuing.";
							$("#txtHouseCode" + rowIndex).attr("title", message);
							$("#txtHouseCode" + rowIndex).css("background-color", me.cellColorInvalid);
						}							
					}
				}

				alert("In order to process the batch, the errors on the page must be corrected.");
			}
			else {
				$("#InvoiceGridBody input[id^=txt]").attr('readonly', true);
				$("#InvoiceGridBody input[id^=chk]").attr('disabled', true);
				$("#AnchorProcessBatch").show();
			}
		},
		
		actionProcessBatch: function() {
			var me = this;
			
			me.loadPopup();
			me.validator.reset();
			me.title.resizeText();
			me.title.setValue("");
		},
		
		actionSaveCancel: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.setLoadCount();
			$("#messageToUser").text("Clearing");
			
			me.invoiceStore.reset();
			me.invoiceStore.fetch("userId:[user],status:delete,fileName:" + me.fileName, me.invoiceFileRemoved, me);
			me.dataLoaded = false;
			me.anchorUpload.display(ui.cmn.behaviorStates.disabled);
		},
		
		invoiceFileRemoved: function(me, activeId) {			
			
			$("#InvoiceGridBody").html("");
			$("#AnchorValidate").hide();
			$("#AnchorProcessBatch").hide();
			$("#AnchorSaveCancel").hide();
			$("#tblInvoices").hide();
			$("#divFrame").show();
			$("#divUpload").show();
			me.checkLoadCount();
  		},

		actionCreateBatch: function() {
			var me = this;
			var item = [];
			var xml = "";

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			$("#pageLoading").fadeIn("slow");

			me.status = "createBatch";
			
			xml = '<revInvoiceBatch';
			xml += ' title="' + ui.cmn.text.xml.encode(me.title.getValue()) + '"';
			xml += ' totalRows="' + me.invoices.length + '"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},
		
		actionBatchCancel: function() {
			var me = this;

			me.hidePopup();
			$("#AnchorSaveCancel").show();
			
			me.setStatus("Loaded");
			$("#pageLoading").fadeOut("slow"); 
		},
		
		actionCancelBatch: function() {
			var me = this;
			var item = [];
			var xml = "";

			me.setStatus("Loading");
			$("#messageToUser").text("Cancelling");
			$("#pageLoading").fadeIn("slow");

			me.status = "cancelBatch";

			xml = '<revInvoiceBatchCancel';
			xml += ' id="' + me.batches[me.batchGrid.activeRowIndex].id + '"';
			xml += '/>';

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},
		
		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Processing the batch, please wait...");
			$("#pageLoading").fadeIn("slow"); 

			xml = me.saveXmlBuildInvoice();

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},
	
		saveXmlBuildInvoice: function() {
			var me = this;
			var xml = "";

			for (var index = 0; index < me.invoices.length; index++) {				
				xml += '<revInvoiceBulkImport';
				xml += ' id="0"';
				xml += ' batchId="' + me.batchId + '"';
				xml += ' sequence="' + $("#txtSequence" + index).val() + '"';
				xml += ' customerNumber="' + $("#txtCustomerNumber" + index).val() + '"';
				xml += ' houseCode="' + $("#txtHouseCode" + index).val() + '"';
				xml += ' jobCode="' + $("#txtJobCode" + index).val() + '"';
				xml += ' taxableService="' + $("#selTaxableService" + index + " option:selected").text() + '"';
				xml += ' invoiceDate="' + $("#txtInvoiceDate" + index).val() + '"';
				xml += ' dueDate="' + $("#txtDueDate" + index).val() + '"';
				xml += ' periodStartDate="' + $("#txtStartDate" + index).val() + '"';
				xml += ' periodEndDate="' + $("#txtEndDate" + index).val() + '"';
				xml += ' poNumber="' + ui.cmn.text.xml.encode($("#txtPONumber" + index).val()) + '"';
				xml += ' taxExempt="' + $("#chkTaxExempt" + index)[0].checked + '"';
				xml += ' taxNumber="' + $("#txtTaxExemptId" + index).val() + '"';
				xml += ' show="' + $("#chkShow" + index)[0].checked + '"';
				xml += ' accountCode="' + $("#txtAccountCode" + index).val() + '"';				
				xml += ' itemDescription="' + ui.cmn.text.xml.encode($("#txtDescription" + index).val()) + '"';
				xml += ' quantity="' + $("#txtQuantity" + index).val() + '"';
				xml += ' price="' + $("#txtPrice" + index).val() + '"';
				xml += ' status="' + $("#txtStatus" + index).val() + '"';
				xml += ' invoiceByHouseCode="' + $("#chkInvoiceByHouseCode" + index)[0].checked + '"';
				xml += '/>';
			}

			xml += '<revInvoiceBatchProcess';
			xml += ' batchId="' + me.batchId + '"';
			xml += '/>';

			xml += '<revInvoiceExcelFileDelete';
			xml += ' fileName="' + me.fileName + '"';
			xml += '/>';

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
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {

					switch (this.tagName) {

						case "revInvoiceBatch":
							if (me.status == "createBatch") {
								me.batchId = parseInt($(this).attr("batchId"), 10);
								me.dataLoaded = false;
								me.actionSaveItem();
								me.hidePopup();
								$("#popupLoading").hide();
								setTimeout(function() {
									me.actionBatchProcessStatus();
								}, 5000);
							}
							else if (me.status == "cancelBatch") {
								me.setStatus("Loaded");
								$("#pageLoading").fadeOut("slow"); 
								
								if (parseInt($(this).attr("statustype"), 10) == 6) {
									var index = me.batchGrid.activeRowIndex;
									me.batches[index].statusType = 6;
									me.batchGrid.body.renderRow(index, index);
									me.anchorExportToExcel.display(ui.cmn.behaviorStates.disabled);
									me.anchorCancelBatch.display(ui.cmn.behaviorStates.disabled);
								}
								else {
									alert("Warning: You cannot cancel the invoices which already been exported.");
								}
							}							
					}
				});
			}
			else {
				me.setStatus("Error");
				$("#popupLoading").hide();
				alert("[SAVE FAILURE]: " + $(args.xmlNode).attr("message"));
			}

			me.status = "";
		},

		loadPopup: function() {
			var me = this;
			me.centerPopup();

			$("#backgroundPopup").css({
				"opacity": "0.5"
			});
			$("#backgroundPopup").fadeIn("slow");
			$("#batchPopup").fadeIn("slow");
		},

		hidePopup: function() {

			$("#backgroundPopup").fadeOut("slow");
			$("#batchPopup").fadeOut("slow");
		},

		centerPopup: function() {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = $("#batchPopup").width();
			var popupHeight = $("#batchPopup").height();

			$("#batchPopup").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});

			$("#popupLoading").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
		}
	}
});

function onFileChange() {

	var fileName = $("iframe")[0].contentWindow.document.getElementById("UploadFile").value;
	var fileExtension = fileName.substring(fileName.lastIndexOf("."));

	if (fileExtension == ".xlsx")
		fin.rev.bulkInvoiceImportUI.anchorUpload.display(ui.cmn.behaviorStates.enabled);
	else
		alert("Invalid file format. Please select the correct XLSX file.");
}

function main() {
	fin.rev.bulkInvoiceImportUI = new fin.rev.bulkInvoiceImport.UserInterface();
	fin.rev.bulkInvoiceImportUI.resize();
}
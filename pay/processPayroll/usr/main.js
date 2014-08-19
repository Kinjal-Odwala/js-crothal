ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.datepicker" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.ui.core" );
ii.Import( "fin.cmn.usr.ui.widget" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.pay.processPayroll.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.grid", 8 );
ii.Style( "fin.cmn.usr.datepicker", 9 );
ii.Style( "fin.cmn.usr.theme", 10 );
ii.Style( "fin.cmn.usr.demos", 11 );
ii.Style( "fin.cmn.usr.core", 12 );

ii.Class({
    Name: "fin.pay.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.batchId = 0;
			me.action = "";
			me.status = "";
			me.loadCount = 0;
			me.validateExport = false;
			me.showDetailReport = false;
			me.autoProcess = false;
			me.autoProcessStep = "";
			me.detailRecordCountFinalize = 0;
			me.detailTotalHoursFinalize = 0;
			me.detailTotalAmountFinalize = 0;
			me.cellColorValid = "";
			me.cellColorInvalid = "red";
			me.employeeNumberCache = [];
			me.houseCodeCache = [];
			me.workOrderNumberCache = [];

			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 100;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			//Set the xmlTimeout period to 20 minutes to finish the Import/Reconcile/Finalize process without timeout error.
			$.ajaxSetup({timeout: 1200000});

			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\ProcessPayroll";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			me.initialize();

			$(window).bind("resize", me, me.resize);

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_pay_processPayroll_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			me.prepareBatchShow =  me.authorizer.isAuthorized(me.authorizePath + "\\PrepareBatch");
			me.importBatchShow = me.authorizer.isAuthorized(me.authorizePath + "\\ImportBatch");
			me.reconcileBatchShow = me.authorizer.isAuthorized(me.authorizePath + "\\ReconcileBatch");
			me.finalizeBatchShow = me.authorizer.isAuthorized(me.authorizePath + "\\FinalizeBatch");
			me.exportBatchShow = me.authorizer.isAuthorized(me.authorizePath + "\\ExportBatch");

			if (!me.prepareBatchShow)
				$("#prepareBatchAction").hide();
			if (!me.importBatchShow)
				$("#importBatchAction").hide();
			if (!me.reconcileBatchShow)
				$("#reconcileBatchAction").hide();
			if (!me.finalizeBatchShow)
				$("#finalizeBatchAction").hide();
			if (!me.exportBatchShow) {
				$("#exportBatchAction").hide();
				$("#AnchorManageDeviceTypes").hide();
			}

			if (me.prepareBatchShow)
				me.actionShowItem("Prepare");
			else if (me.importBatchShow)
				me.actionShowItem("Import");
			else if (me.reconcileBatchShow)
				me.actionShowItem("Reconcile");
			else if (me.finalizeBatchShow)
				me.actionShowItem("Finalize");
			else if (me.exportBatchShow)
				me.actionShowItem("Export");

			me.payCodeTypeStore.fetch("userId:[user],payCodeType:ePayBatch", me.payCodeTypesLoaded, me);
		},

		sessionLoaded: function fin_pay_processPayroll_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments,{});
			var me = fin.processPayrollUi;

			if (!me) return;

			if ((me.action == "Finalize" || me.action == "Export") && me.ePayBatchGrid.activeRowIndex != -1)
				me.ePayBatchGrid.setHeight($(window).height() - 330);
			else
				me.ePayBatchGrid.setHeight($(window).height() - 130);
			$("#DetailInfo").width(240 + $("#detailTotalAmountBodyColumn").width() + 19);

			var popupHeight = $(window).height() - 100;
			$("#batchPopup, #tblBatchPopup, #popupLoading").height(popupHeight);
			$("#batchDetails").height(popupHeight - 160);
		},

		defineFormControls: function() {			
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "prepareBatchAction",
					brief: "Prepare Batch",
					title: "Prepare Epay Batch.",
					actionFunction: function() { me.actionShowItem("Prepare"); }
				})
				.addAction({
					id: "importBatchAction",
					brief: "Import Batch",
					title: "Import Epay Batch.",
					actionFunction: function() { me.actionShowItem("Import"); }
				})
				.addAction({
					id: "reconcileBatchAction",
					brief: "Reconcile Batch",
					title: "Reconcile Epay Batch.",
					actionFunction: function() { me.actionShowItem("Reconcile"); }
				})
				.addAction({
					id: "finalizeBatchAction",
					brief: "Finalize Batch",
					title: "Finalize Epay Batch.",
					actionFunction: function() { me.actionShowItem("Finalize"); }
				})
				.addAction({
					id: "exportBatchAction",
					brief: "Export Batch",
					title: "Export Payroll Header and Hours.",
					actionFunction: function() { me.actionShowItem("Export"); }
				})

			me.ePayBatchGrid = new ui.ctl.Grid({
				id: "EPayBatchGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemSelect(index); }
			});

			me.ePayBatchGrid.addColumn("valid", "", "", "Status", 30, function(batch) {
				if (me.action == "Finalize" && me.ePayBatchGrid.activeRowIndex == -1)
					return "&nbsp;"
				else if (batch.valid)
					return "<center><img src='/fin/cmn/usr/media/Common/green.png' title='Valid'></center>";
				else
					return "<center><img src='/fin/cmn/usr/media/Common/red.png' title='Invalid'></center>";
 			});
			me.ePayBatchGrid.addColumn("batchId", "batchId", "Batch #", "Batch #", 70);
			me.ePayBatchGrid.addColumn("batchRecordCount", "batchRecordCount", "Record Count", "Record Count", 120);
			me.ePayBatchGrid.addColumn("batchTotalHours", "batchTotalHours", "Total Hours", "Total Hours", 120);
			me.ePayBatchGrid.addColumn("batchTotalAmount", "batchTotalAmount", "Total Amount", "Total Amount", 120);
			me.ePayBatchGrid.addColumn("detailRecordCount", "detailRecordCount", "Record Count", "Record Count", 120);
			me.ePayBatchGrid.addColumn("detailTotalHours", "detailTotalHours", "Total Hours", "Total Hours", 120);
			me.ePayBatchGrid.addColumn("detailTotalAmount", "detailTotalAmount", "Total Amount", "Total Amount", null);
			me.ePayBatchGrid.capColumns();

			me.batchStatus = new ui.ctl.Input.DropDown.Filtered({
		        id: "BatchStatus",
				formatFunction: function( type ) { return type.name; }
		    });

			me.batchStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.batchStatus.indexSelected == -1)
						this.setInvalid("Please select the correct Status.");
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});

			me.anchorPrepare = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrepare",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Prepare&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrepareItem(); },
				hasHotState: true
			});

			me.anchorImport = new ui.ctl.buttons.Sizeable({
				id: "AnchorImport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Import&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionImportItem(); },
				hasHotState: true
			});
			
			me.anchorReconcile = new ui.ctl.buttons.Sizeable({
				id: "AnchorReconcile",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Reconcile&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionReconcileItem(); },
				hasHotState: true
			});

			me.anchorFinalize = new ui.ctl.buttons.Sizeable({
				id: "AnchorFinalize",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Finalize&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionFinalizeItem(); },
				hasHotState: true
			});

			me.anchorView = new ui.ctl.buttons.Sizeable({
				id: "AnchorView",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;View&nbsp;&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionViewItem(); },
				hasHotState: true
			});

			me.anchorExport = new ui.ctl.buttons.Sizeable({
				id: "AnchorExport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportItem(); },
				hasHotState: true
			});

			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});

			me.anchorAdd = new ui.ctl.buttons.Sizeable({
				id: "AnchorAdd",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;Add&nbsp;&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionAddItem(); },
				hasHotState: true
			});

			me.anchorCancelRecord = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelRecord",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("CancelEpayBatchRecord"); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;Save&nbsp;&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem("SaveEpayBatchRecord"); },
				hasHotState: true
			});
		},

		configureCommunications: function fin_pay_processPayroll_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.pay.processPayroll.PayCodeType,
				itemConstructorArgs: fin.pay.processPayroll.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});

			me.ePayBatches = [];
			me.ePayBatchStore = me.cache.register({
				storeId: "ePayBatchs",
				itemConstructor: fin.pay.processPayroll.EPayBatch,
				itemConstructorArgs: fin.pay.processPayroll.ePayBatchArgs,
				injectionArray: me.ePayBatches
			});

			me.ePayBatchDetails = [];
			me.ePayBatchDetailStore = me.cache.register({
				storeId: "ePayBatchDetails",
				itemConstructor: fin.pay.processPayroll.EPayBatchDetail,
				itemConstructorArgs: fin.pay.processPayroll.ePayBatchDetailArgs,
				injectionArray: me.ePayBatchDetails
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
			
			me.batchStatuses = [];
			me.batchStatuses.push(new fin.pay.processPayroll.BatchStatus(1, "Records with errors"));
			me.batchStatuses.push(new fin.pay.processPayroll.BatchStatus(2, "Cancelled records with errors"));
			
			me.batchStatus.setData(me.batchStatuses);
			me.batchStatus.select(0, me.batchStatus.focused);

			$("#chkSelectAll").bind("change", function() { me.actionSelectAllItem(); });
			$("#imgClose").bind("click", function() { me.hidePopup(); });
			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevEpayBatchDetails(); });
			$("#imgNext").bind("click", function() { me.nextEpayBatchDetails(); });
		},

		payCodeTypesLoaded: function(me, activeId) {

			me.payCodes = "<option value='0'></option>";
			for (var index = 0; index < me.payCodeTypes.length; index++) {
		        me.payCodes += "<option value=\"" + me.payCodeTypes[index].id + "\">" + me.payCodeTypes[index].name + "</option>";
		    }
		},

		ePayBatchesLoaded: function(me, activeId) {

			if (me.autoProcess) {
				var varianceTotalCount = me.detailRecordCountFinalize - parseInt(me.ePayBatches[0].batchRecordCount, 10);
				var varianceTotalHours = me.detailTotalHoursFinalize - parseFloat(me.ePayBatches[0].batchTotalHours) - parseFloat(me.ePayBatches[0].totalHours);
				var varianceTotalAmount = me.detailTotalAmountFinalize - parseFloat(me.ePayBatches[0].batchTotalAmount);
	
				if (varianceTotalCount == 0 && varianceTotalHours == 0 && varianceTotalAmount == 0
					&& me.ePayBatches[0].detailRecordCount == 0
					&& parseFloat(me.ePayBatches[0].detailTotalHours) == 0
					&& parseFloat(me.ePayBatches[0].detailTotalAmount) == 0) {
						me.autoProcessStep = "Finalize";
						me.actionSaveItem("Finalize");
				}
				else {
					var index = me.ePayBatchGrid.activeRowIndex;
					me.ePayBatchList.splice(index, 1);
					me.ePayBatchGrid.setData(me.ePayBatchList);
					me.autoProcess = false;
					me.autoProcessStep = "";
					me.modified(false);
					me.setStatus("Saved");
					$("#pageLoading").fadeOut("slow");
				}

				return;
			}
			
			if (me.showDetailReport && (me.action == "Finalize" || me.action == "Export") && me.ePayBatchGrid.activeRowIndex != -1) {
				var index = me.ePayBatchGrid.activeRowIndex;
				var varianceTotalCount = parseInt(me.ePayBatchGrid.data[index].detailRecordCount, 10) - parseInt(me.ePayBatches[0].batchRecordCount, 10);
				var varianceTotalHours = parseFloat(me.ePayBatchGrid.data[index].detailTotalHours) - parseFloat(me.ePayBatches[0].batchTotalHours) - parseFloat(me.ePayBatches[0].totalHours);
				var varianceTotalAmount = parseFloat(me.ePayBatchGrid.data[index].detailTotalAmount) - parseFloat(me.ePayBatches[0].batchTotalAmount);

				$("#ProcessedTotalCount").html(me.ePayBatchGrid.data[index].detailRecordCount);
				$("#ProcessedTotalHours").html(parseFloat(me.ePayBatchGrid.data[index].detailTotalHours).toFixed(2));
				$("#ProcessedTotalAmount").html(parseFloat(me.ePayBatchGrid.data[index].detailTotalAmount).toFixed(2));
				$("#AmountAndHours").html(parseFloat(me.ePayBatches[0].totalHours).toFixed(2));
				$("#WeeklyTotalCount").html(me.ePayBatches[0].batchRecordCount);
				$("#WeeklyTotalHours").html(parseFloat(me.ePayBatches[0].batchTotalHours).toFixed(2));
				$("#WeeklyTotalAmount").html(parseFloat(me.ePayBatches[0].batchTotalAmount).toFixed(2));
				$("#WeeklyAddTotalCount").html(me.ePayBatches[0].weeklyPayrollRecordCount);
				$("#WeeklyAddTotalHours").html(parseFloat(me.ePayBatches[0].weeklyPayrollTotalHours).toFixed(2));
				$("#WeeklyAddTotalAmount").html(parseFloat(me.ePayBatches[0].weeklyPayrollTotalAmount).toFixed(2));
				$("#VarianceTotalCount").html(varianceTotalCount);
				$("#VarianceTotalHours").html(parseFloat(varianceTotalHours).toFixed(2));
				$("#VarianceTotalAmount").html(parseFloat(varianceTotalAmount).toFixed(2));
				$("#ErrorTotalCount").html("<span style='color: red;'>" + me.ePayBatches[0].detailRecordCount + "</span> - " + me.ePayBatches[0].cancelledErrorRecordCount);
				$("#ErrorTotalHours").html("<span style='color: red;'>" + parseFloat(me.ePayBatches[0].detailTotalHours).toFixed(2) + "</span> - " + parseFloat(me.ePayBatches[0].cancelledErrorTotalHours).toFixed(2));
				$("#ErrorTotalAmount").html("<span style='color: red;'>" + parseFloat(me.ePayBatches[0].detailTotalAmount).toFixed(2) + "</span> - " + parseFloat(me.ePayBatches[0].cancelledErrorTotalAmount).toFixed(2));
				
				if (varianceTotalCount == 0 && varianceTotalHours == 0 && varianceTotalAmount == 0
					&& me.ePayBatches[0].detailRecordCount == 0
					&& parseFloat(me.ePayBatches[0].detailTotalHours) == 0
					&& parseFloat(me.ePayBatches[0].detailTotalAmount) == 0) {
						me.ePayBatchGrid.data[index].valid = true;
						me.ePayBatchGrid.body.renderRow(index, index);
						me.anchorFinalize.display(ui.cmn.behaviorStates.enabled);
				}
				else {
					me.ePayBatchGrid.body.renderRow(index, index);
					me.anchorFinalize.display(ui.cmn.behaviorStates.disabled);
				}
				me.showDetailReport = false;
			}
			else if (me.action == "Export" && me.validateExport) {
				me.validateExport = false;

				if (me.ePayBatches.length == 0)
					me.anchorExport.display(ui.cmn.behaviorStates.enabled);
				else
					me.anchorExport.display(ui.cmn.behaviorStates.disabled);

				me.setLoadCount();
				me.ePayBatchStore.fetch("userId:[user],status:Export", me.ePayBatchesLoaded, me);
			}
			else {
				me.ePayBatchList = me.ePayBatches.slice();
				me.ePayBatchGrid.setData(me.ePayBatchList);
			}

			me.checkLoadCount();
  		},

		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;	

			me.batchId = me.ePayBatchGrid.data[index].batchId;
			
			if (me.ePayBatchGrid.data[index].valid) {
				me.anchorPrepare.display(ui.cmn.behaviorStates.enabled);
				me.anchorImport.display(ui.cmn.behaviorStates.enabled);
				me.anchorReconcile.display(ui.cmn.behaviorStates.enabled);
				me.anchorFinalize.display(ui.cmn.behaviorStates.enabled);
				me.anchorExport.display(ui.cmn.behaviorStates.enabled);
			}
			else {
				me.anchorPrepare.display(ui.cmn.behaviorStates.disabled);
				me.anchorImport.display(ui.cmn.behaviorStates.disabled);
				me.anchorReconcile.display(ui.cmn.behaviorStates.disabled);
				me.anchorFinalize.display(ui.cmn.behaviorStates.disabled);
				me.anchorExport.display(ui.cmn.behaviorStates.disabled);
			}
			
			if (me.action == "Finalize" || me.action == "Export") {
				if (me.action == "Finalize")
					$("#AnchorView").show();
				$("#ReconcileInfo").show();
				me.setLoadCount();
				me.showDetailReport = true;
				me.ePayBatchGrid.setHeight($(window).height() - 330);
				me.ePayBatchStore.fetch("userId:[user],status:FinalizeError,batchId:" + me.ePayBatchGrid.data[me.ePayBatchGrid.activeRowIndex].batchId, me.ePayBatchesLoaded, me);
			}
		},

		actionSearchItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").fadeIn("slow");
			me.ePayBatchDetailStore.fetch("userId:[user]"
				+ ",status:" + (me.batchStatus.indexSelected == -1 ? 1 : me.batchStatuses[me.batchStatus.indexSelected].id)
				+ ",batchId:" + me.batchId
				, me.ePayBatchDetailsLoaded
				, me);
			},

		ePayBatchDetailsLoaded: function(me, activeId) {

			var selPageNumber = $("#selPageNumber");

			me.startPoint = 1;
		    me.recordCount = me.ePayBatchDetails.length;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);

		    //if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;

		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}

		    selPageNumber.val(me.pageCurrent);
		    $("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");

			me.setEpayBatchDetailsGrid();

			if (me.batchStatus.indexSelected == -1 || me.batchStatuses[me.batchStatus.indexSelected].id == 1)
				me.anchorCancelRecord.display(ui.cmn.behaviorStates.enabled);
			else
				me.anchorCancelRecord.display(ui.cmn.behaviorStates.disabled);
  		},
		
		prevEpayBatchDetails: function() {
		    var me = this;

			me.pageCurrent--;
			
			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else {
				if (!parent.fin.cmn.status.itemValid()) {
					me.pageCurrent++;
					return;
				}
				me.changeEpayBatchDetails();
			}
		},

		nextEpayBatchDetails: function() {
		    var me = this;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else {
				if (!parent.fin.cmn.status.itemValid()) {
					me.pageCurrent--;
					return;
				}
				me.changeEpayBatchDetails();
			}				
		},
		
		pageNumberChange: function() {
		    var me = this;

			if (!parent.fin.cmn.status.itemValid()) {
				$("#selPageNumber").val(me.pageCurrent);
				return;
			}

		    me.pageCurrent = Number($("#selPageNumber").val());
		    me.changeEpayBatchDetails();
		},

		changeEpayBatchDetails: function() {
		    var me = this;

			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").fadeIn("slow");
			$("#selPageNumber").val(me.pageCurrent);
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
			setTimeout(function() { 
				me.setEpayBatchDetailsGrid();
			}, 100);
		},
		
		setEpayBatchDetailsGrid: function() {
		    var me = this;
			var batchDetailRow = "";
		    var batchDetailTemplate = $("#tblBatchDetailTemplate").html();
			var startIndex = me.startPoint - 1;
			var endIndex = startIndex + me.maximumRows;

			$("#chkSelectAll")[0].checked = false;
			$("#tblBatchDetails").empty();
			me.ePayBatchDetailsList = [];

			if (me.ePayBatchDetails.length < endIndex)
				endIndex = me.ePayBatchDetails.length;
				
			for (var index = startIndex; index < endIndex; index++) {
				me.ePayBatchDetailsList.push(me.ePayBatchDetails[index]);
			}

		    for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
				me.employeeNumberPreCheck(index, me.ePayBatchDetailsList[index].employeeNumber, me.ePayBatchDetailsList[index].employeeName, !me.ePayBatchDetailsList[index].employeeError);
				me.houseCodePreCheck(index, me.ePayBatchDetailsList[index].houseCode, !me.ePayBatchDetailsList[index].houseCodeError);
				me.workOrderNumberPreCheck(index, me.ePayBatchDetailsList[index].workOrderNumber, !me.ePayBatchDetailsList[index].workOrderNumberError);
				
		        batchDetailRow = batchDetailTemplate;
		        batchDetailRow = batchDetailRow.replace("RowStyle", ((index % 2) ? "gridRow" : "alternateGridRow"));
		        batchDetailRow = batchDetailRow.replace(/RowCount/g, index);
				batchDetailRow = batchDetailRow.replace("#", index + 1);
			
				$("#tblBatchDetails").append(batchDetailRow);
				$("#spnEmployeeName" + index).html(me.ePayBatchDetailsList[index].employeeName);
				$("#txtEmployeeNumber" + index).val(me.ePayBatchDetailsList[index].employeeNumber);
				$("#txtHouseCode" + index).val(me.ePayBatchDetailsList[index].houseCode);
				$("#txtExpenseDate" + index).val(me.ePayBatchDetailsList[index].expenseDate);
				$("#txtHours" + index).val(me.ePayBatchDetailsList[index].hours);
				$("#txtAmount" + index).val(me.ePayBatchDetailsList[index].amount);
				$("#txtWorkOrderNumber" + index).val(me.ePayBatchDetailsList[index].workOrderNumber);
				$("#selPayCode" + index).html(me.payCodes);
				$("#selPayCode" + index).attr("value", me.ePayBatchDetailsList[index].payCode);
				$("#trBatchDetail" + index + " input[id^=txtEmployeeNumber]").bind("blur", function() { me.employeeNumberBlur(this); });
				$("#trBatchDetail" + index + " select[id^=selPayCode]").bind("change", function() { me.selectRow(this); me.payCodeBlur(this); });
				$("#trBatchDetail" + index + " input[id^=txtHouseCode]").bind("blur", function() { me.houseCodeBlur(this); });
				$("#trBatchDetail" + index + " input[id^=txtExpenseDate]").bind("blur", function() { me.expenseDateBlur(this); });
				$("#trBatchDetail" + index + " input[id^=txtHours]").bind("change", function() { me.hoursAmountBlur(this); });
				$("#trBatchDetail" + index + " input[id^=txtAmount]").bind("change", function() { me.hoursAmountBlur(this); });
				$("#trBatchDetail" + index + " input[id^=txtWorkOrderNumber]").bind("blur", function() { me.workOrderNumberBlur(this); });
				$("#txtExpenseDate" + index).datepicker({
					changeMonth: true
					, changeYear: true
				});
 	    	}

			var className = (me.ePayBatchDetailsList.length % 2) ? "gridRow" : "alternateGridRow";
			batchDetailRow = '<tr id="trLastRow" height="100%" class="' + className + '"><td id="tdLastRow" colspan="10" class="gridColumnRight" style="height: 100%">&nbsp;</td></tr>';
			$("#tblBatchDetails").append(batchDetailRow);
			$("input[id^=txt]").bind("change", function() { me.selectRow(this); });
			$("input[id^=chkSelect]").bind("change", function() { me.actionClickItem(); });

			me.actionValidateItem(true);
			$("#popupLoading").fadeOut("slow");
		},
		
		actionSelectAllItem: function() {
			var me = this;

			me.modified();
			
			for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
				$("#chkSelect" + index)[0].checked = $("#chkSelectAll")[0].checked;
			}
		},

		selectRow: function(objInput) {
			var me = this;
			var rowNumber = 0;

			if (objInput.id.indexOf("txtEmployeeNumber") != -1)
		    	rowNumber = Number(objInput.id.replace("txtEmployeeNumber", ""));
			else if (objInput.id.indexOf("txtHouseCode") != -1)
		    	rowNumber = Number(objInput.id.replace("txtHouseCode", ""));
			else if (objInput.id.indexOf("txtExpenseDate") != -1)
		    	rowNumber = Number(objInput.id.replace("txtExpenseDate", ""));
			else if (objInput.id.indexOf("txtHours") != -1)
		    	rowNumber = Number(objInput.id.replace("txtHours", ""));
			else if (objInput.id.indexOf("txtAmount") != -1)
		    	rowNumber = Number(objInput.id.replace("txtAmount", ""));
			else if (objInput.id.indexOf("txtWorkOrderNumber") != -1)
		    	rowNumber = Number(objInput.id.replace("txtWorkOrderNumber", ""));
			else if (objInput.id.indexOf("selPayCode") != -1)
		    	rowNumber = Number(objInput.id.replace("selPayCode", ""));			

			me.modified();
			$("#chkSelect" + rowNumber)[0].checked = true;
		},

		actionAddItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
		    var batchDetailRow = $("#tblBatchDetailTemplate").html();
			var index = $("#tblBatchDetails").find("tr").length - 1;
			var rowIndex = me.ePayBatchDetailsList.length;

	        batchDetailRow = batchDetailRow.replace("RowStyle", ((index % 2) ? "gridRow" : "alternateGridRow"));
	        batchDetailRow = batchDetailRow.replace(/RowCount/g, rowIndex);
			batchDetailRow = batchDetailRow.replace("#", index + 1);

			$($("#tblBatchDetails tr")[index]).before(batchDetailRow);
			$("#trLastRow")[0].className = (index % 2) ? "alternateGridRow" : "gridRow";
			$("#trBatchDetail" + index + " input[id^=txtEmployeeNumber]").bind("blur", function() { me.employeeNumberBlur(this); });
			$("#trBatchDetail" + index + " select[id^=selPayCode]").bind("change", function() { me.selectRow(this); me.payCodeBlur(this); });
			$("#trBatchDetail" + index + " input[id^=txtHouseCode]").bind("blur", function() { me.houseCodeBlur(this); });
			$("#trBatchDetail" + index + " input[id^=txtExpenseDate]").bind("blur", function() { me.expenseDateBlur(this); });
			$("#trBatchDetail" + index + " input[id^=txtHours]").bind("change", function() { me.hoursAmountBlur(this); });
			$("#trBatchDetail" + index + " input[id^=txtAmount]").bind("change", function() { me.hoursAmountBlur(this); });
			$("#trBatchDetail" + index + " input[id^=txtWorkOrderNumber]").bind("blur", function() { me.workOrderNumberBlur(this); });
			$("#selPayCode" + rowIndex).html(me.payCodes);
			$("#txtExpenseDate" + index).datepicker({
				changeMonth: true
				, changeYear: true
			});

			$("#txtEmployeeNumber" + index).focus();
			var item = new fin.pay.processPayroll.EPayBatchDetail({ id: 0});
			me.ePayBatchDetailsList.push(item);
		},

		actionDeleteItem: function(index) {
			var me = this;

			$("#trBatchDetail" + index).remove();
		},
		
		setRowNumber: function() {
			var me = this;
			var rowNumber = 0;

			$("#trLastRow")[0].className = ($("#tblBatchDetails").find("tr").length % 2) ? "alternateGridRow" : "gridRow";
			$("#tblBatchDetails").find("tr").each(function() {
				if (this.cells.length > 1)
					this.cells[0].innerHTML = ++rowNumber;
			});
		},

		actionValidateItem: function(validateAll) {
			var me = this;
			var hoursAmountValid = true;

			for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
				if (validateAll || ($("#chkSelect" + index)[0] != undefined && $("#chkSelect" + index)[0].checked)) {
					if (!(/^[0-9]+$/.test($("#txtEmployeeNumber" + index).val())) || me.ePayBatchDetailsList[index].employeeError) {
						$("#txtEmployeeNumber" + index).attr("title", "Invalid Employee #");
						$("#txtEmployeeNumber" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtEmployeeNumber" + index).attr("title", "");
						$("#txtEmployeeNumber" + index).css("background-color", me.cellColorValid);
					}

					if ($("#selPayCode" + index).val() == "0") {
						$("#selPayCode" + index).attr("title", "Invalid Pay Code");
						$("#selPayCode" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#selPayCode" + index).attr("title", "");
						$("#selPayCode" + index).css("background-color", me.cellColorValid);
					}
					
					if (!(/^[0-9]+$/.test($("#txtHouseCode" + index).val())) || me.ePayBatchDetailsList[index].houseCodeError) {
						$("#txtHouseCode" + index).attr("title", "Invalid House Code");
						$("#txtHouseCode" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtHouseCode" + index).attr("title", "");
						$("#txtHouseCode" + index).css("background-color", me.cellColorValid);
					}

					if ($("#txtExpenseDate" + index).val() == "") {
						$("#txtExpenseDate" + index).attr("title", "Invalid Expense Date");
						$("#txtExpenseDate" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtExpenseDate" + index).attr("title", "");
						$("#txtExpenseDate" + index).css("background-color", me.cellColorValid);
					}
					
					if (me.ePayBatchDetailsList[index].id == 0) {
						if ($("#txtHours" + index).val() == "")
							$("#txtHours" + index).val("0");
						if ($("#txtAmount" + index).val() == "")
							$("#txtAmount" + index).val("0");
					}
					
					if (!(/^[+]?[0-9]+(\.[0-9]+)?$/.test($("#txtHours" + index).val()))) {
						hoursAmountValid = false;
						$("#txtHours" + index).attr("title", "Invalid Hours");
						$("#txtHours" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtHours" + index).attr("title", "");
						$("#txtHours" + index).css("background-color", me.cellColorValid);
					}
	
					if (!(/^[-]?[0-9]+(\.[0-9]+)?$/.test($("#txtAmount" + index).val()))) {
						hoursAmountValid = false;
						$("#txtAmount" + index).attr("title", "Invalid Amount");
						$("#txtAmount" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtAmount" + index).attr("title", "");
						$("#txtAmount" + index).css("background-color", me.cellColorValid);
					}
	
					if (hoursAmountValid) {
						if (parseFloat($("#txtHours" + index).val()) == 0 && parseFloat($("#txtAmount" + index).val()) == 0) {
							$("#txtHours" + index).attr("title", "Both Hours and Amount cannot be zero");
							$("#txtHours" + index).css("background-color", me.cellColorInvalid);
							$("#txtAmount" + index).attr("title", "Both Hours and Amount cannot be zero");
							$("#txtAmount" + index).css("background-color", me.cellColorInvalid);
						}
						else if (parseFloat($("#txtHours" + index).val()) > 0 && parseFloat($("#txtAmount" + index).val()) > 0) {
							$("#txtHours" + index).attr("title", "Both Hours and Amount are not allowed");
							$("#txtHours" + index).css("background-color", me.cellColorInvalid);
							$("#txtAmount" + index).attr("title", "Both Hours and Amount are not allowed");
							$("#txtAmount" + index).css("background-color", me.cellColorInvalid);
						}
						else {
							$("#txtHours" + index).attr("title", "");
							$("#txtHours" + index).css("background-color", me.cellColorValid);
							$("#txtAmount" + index).attr("title", "");
							$("#txtAmount" + index).css("background-color", me.cellColorValid);
						}
					}
					if ($("#txtWorkOrderNumber" + index).val() != "" && (!(/^[0-9]+$/.test($("#txtWorkOrderNumber" + index).val())) || me.ePayBatchDetailsList[index].workOrderNumberError)) {
						$("#txtWorkOrderNumber" + index).attr("title", "Invalid Work Order #");
						$("#txtWorkOrderNumber" + index).css("background-color", me.cellColorInvalid);
					}
					else {
						$("#txtWorkOrderNumber" + index).attr("title", "");
						$("#txtWorkOrderNumber" + index).css("background-color", me.cellColorValid);
					}
				}
			}
		},
		
		payCodeBlur: function(objSelect) {
			var me = this;
		    var rowNumber = Number(objSelect.id.replace("selPayCode", ""));

		    if (objSelect.value == "0") {
				objSelect.title = "Invalid Pay Code";
				objSelect.style.backgroundColor = me.cellColorInvalid;
			}
			else {
				objSelect.title = "";
				objSelect.style.backgroundColor = me.cellColorValid;
			}
		},
		
		expenseDateBlur: function(objInput) {
			var me = this;
		    var rowNumber = Number(objInput.id.replace("txtExpenseDate", ""));

		    if (objInput.value == "" || !(ui.cmn.text.validate.generic(objInput.value, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$"))) {
				objInput.title = "Invalid Expense Date";
				objInput.style.backgroundColor = me.cellColorInvalid;
			}
			else {
				objInput.title = "";
				objInput.style.backgroundColor = me.cellColorValid;
			}
		},

		hoursAmountBlur: function(objInput) {
			var me = this;
			var hoursAmountValid = true;
		    var rowNumber = 0;

			if (objInput.id.indexOf("txtHours") != -1) {
				rowNumber = Number(objInput.id.replace("txtHours", ""));
				$("#txtAmount" + rowNumber).val("0");
			}
			else if (objInput.id.indexOf("txtAmount") != -1) {
				rowNumber = Number(objInput.id.replace("txtAmount", ""));
				$("#txtHours" + rowNumber).val("0");
			}

			me.isHoursAmountValid(rowNumber);
		},
		
		isHoursAmountValid: function(rowNumber) {
			var me = this;
			var hoursAmountValid = true;
			
			if (!(/^[+]?[0-9]+(\.[0-9]+)?$/.test($("#txtHours" + rowNumber).val()))) {
				hoursAmountValid = false;
				$("#txtHours" + rowNumber).attr("title", "Invalid Hours");
				$("#txtHours" + rowNumber).css("background-color", me.cellColorInvalid);
			}
			else {
				$("#txtHours" + rowNumber).attr("title", "");
				$("#txtHours" + rowNumber).css("background-color", me.cellColorValid);
			}

			if (!(/^[-]?[0-9]+(\.[0-9]+)?$/.test($("#txtAmount" + rowNumber).val()))) {
				hoursAmountValid = false;
				$("#txtAmount" + rowNumber).attr("title", "Invalid Amount");
				$("#txtAmount" + rowNumber).css("background-color", me.cellColorInvalid);
			}
			else {
				$("#txtAmount" + rowNumber).attr("title", "");
				$("#txtAmount" + rowNumber).css("background-color", me.cellColorValid);
			}

			if (hoursAmountValid) {
				if (parseFloat($("#txtHours" + rowNumber).val()) == 0 && parseFloat($("#txtAmount" + rowNumber).val()) == 0) {
					$("#txtHours" + rowNumber).attr("title", "Both Hours and Amount cannot be zero");
					$("#txtHours" + rowNumber).css("background-color", me.cellColorInvalid);
					$("#txtAmount" + rowNumber).attr("title", "Both Hours and Amount cannot be zero");
					$("#txtAmount" + rowNumber).css("background-color", me.cellColorInvalid);
					return false;
				}
				else if (parseFloat($("#txtHours" + rowNumber).val()) > 0 && parseFloat($("#txtAmount" + rowNumber).val()) > 0) {
					$("#txtHours" + rowNumber).attr("title", "Both Hours and Amount are not allowed");
					$("#txtHours" + rowNumber).css("background-color", me.cellColorInvalid);
					$("#txtAmount" + rowNumber).attr("title", "Both Hours and Amount are not allowed");
					$("#txtAmount" + rowNumber).css("background-color", me.cellColorInvalid);
					return false;
				}
				else {
					$("#txtHours" + rowNumber).attr("title", "");
					$("#txtHours" + rowNumber).css("background-color", me.cellColorValid);
					$("#txtAmount" + rowNumber).attr("title", "");
					$("#txtAmount" + rowNumber).css("background-color", me.cellColorValid);
					return true;
				}
			}
			else
				return false;
		},

		employeeNumberPreCheck: function(rowNumber, employeeNumber, employeeName, valid) {
			var me = this;

		    if (me.employeeNumberCache[employeeNumber] == undefined) {
				me.employeeNumberCache[employeeNumber] = {};
			    me.employeeNumberCache[employeeNumber].valid = valid;
			    me.employeeNumberCache[employeeNumber].loaded = true;
				me.employeeNumberCache[employeeNumber].name = employeeName;
			    me.employeeNumberCache[employeeNumber].buildQueue = [];
			    me.employeeNumberCache[employeeNumber].buildQueue.push(rowNumber);
	        }
			else
				me.employeeNumberCache[employeeNumber].buildQueue.push(rowNumber);
		},

		employeeNumberBlur: function(objInput) {
			var me = this;
		    var rowNumber = Number(objInput.id.replace("txtEmployeeNumber", ""));
		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");
		    if (objInput.value == "")
				objInput.value = me.ePayBatchDetailsList[rowNumber].employeeNumber;

			if (objInput.value != "")
		    	me.employeeNumberCheck(rowNumber, objInput.value);
			else {
				objInput.title = "Invalid Employee #";
				objInput.style.backgroundColor = me.cellColorInvalid;
			}
		},

		employeeNumberCheck: function(rowNumber, employeeNumber) {
			var me = this;

		    if (me.employeeNumberCache[employeeNumber] != undefined) {
	            if (me.employeeNumberCache[employeeNumber].loaded) {
	                me.employeeNumberValidate(employeeNumber, [rowNumber]);
	            }
	            else
	                me.employeeNumberCache[employeeNumber].buildQueue.push(rowNumber);
	        }
	        else
	            me.employeeNumberLoad(rowNumber, employeeNumber);

		},
		
		employeeNumberLoad: function(rowNumber, employeeNumber) {
		    var me = this;

			if (me.employeeNumberCache[employeeNumber] == undefined) {
				me.employeeNumberCache[employeeNumber] = {};
				me.employeeNumberCache[employeeNumber].valid = false;
				me.employeeNumberCache[employeeNumber].loaded = false;
				me.employeeNumberCache[employeeNumber].buildQueue = [];
				me.employeeNumberCache[employeeNumber].buildQueue.push(rowNumber);
			}

		    $("#txtEmployeeNumber" + rowNumber).addClass("loadingIndicator");
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/emp/act/provider.aspx",
                data: "moduleId=emp&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:employeeSearchs,userId:[user],employeeType:SearchFull,filterType:Employee Number"
                    + ",searchValue:" + employeeNumber + "</criteria>",
 
                success: function(xml) {
                    me.employeeNumberCache[employeeNumber].loaded = true;

		            if ($(xml).find("item").length) {
		                //the employee number is valid
		                $(xml).find('item').each(function() {
		                    me.employeeNumberCache[employeeNumber].valid = true;
		                    me.employeeNumberCache[employeeNumber].id = $(this).attr("id");
							me.employeeNumberCache[employeeNumber].name = $(this).attr("lastName") + ", " + $(this).attr("firstName");
		                });
		            }
		            me.employeeNumberValidate(employeeNumber, me.employeeNumberCache[employeeNumber].buildQueue);
				}
			});
		},
		
		employeeNumberValidate: function(employeeNumber, rowArray) {
		    var me = this;
		    var rowNumber = 0;
		    var objInput = {};

		    if (me.employeeNumberCache[employeeNumber].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
		            objInput = $("#txtEmployeeNumber" + rowNumber);
					objInput.attr("title", "");
					objInput.css("background-color", me.cellColorValid);
					$("#spnEmployeeName" + rowNumber).html(me.employeeNumberCache[employeeNumber].name);
		        }
		    }
		    else {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					objInput = $("#txtEmployeeNumber" + rowNumber);
					objInput.attr("title", "Invalid Employee #");
					objInput.css("background-color", me.cellColorInvalid);
		        }
		    }

			$("#txtEmployeeNumber" + rowNumber).removeClass("loadingIndicator");
		},

		houseCodePreCheck: function(rowNumber, houseCode, valid) {
			var me = this;
		    if (me.houseCodeCache[houseCode] == undefined) {
				me.houseCodeCache[houseCode] = {};
			    me.houseCodeCache[houseCode].valid = valid;
			    me.houseCodeCache[houseCode].loaded = true;
			    me.houseCodeCache[houseCode].buildQueue = [];
			    me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
	        }
		},

		houseCodeBlur: function(objInput) {
			var me = this;
		    var rowNumber = Number(objInput.id.replace("txtHouseCode", ""));
		    
		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");
		    if (objInput.value == "") 
				objInput.value = me.ePayBatchDetailsList[rowNumber].houseCode;

			if (objInput.value != "")
		    	me.houseCodeCheck(rowNumber, objInput.value);
			else {
				objInput.title = "Invalid House Code";
				objInput.style.backgroundColor = me.cellColorInvalid;
			}
		},
		
		houseCodeCheck: function(rowNumber, houseCode) {
			var me = this;

		    if (me.houseCodeCache[houseCode] != undefined) {
	            if (me.houseCodeCache[houseCode].loaded)
	                me.houseCodeValidate(houseCode, [rowNumber]);
	            else
	                me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
	        }
	        else
	            me.houseCodeLoad(rowNumber, houseCode);
		},
		
		houseCodeLoad: function(rowNumber, houseCode) {
		    var me = this;

			if (me.houseCodeCache[houseCode] == undefined) {
				me.houseCodeCache[houseCode] = {};
				me.houseCodeCache[houseCode].valid = false;
				me.houseCodeCache[houseCode].loaded = false;
				me.houseCodeCache[houseCode].buildQueue = [];
				me.houseCodeCache[houseCode].buildQueue.push(rowNumber);
			}

		    $("#txtHouseCode" + rowNumber).addClass("loadingIndicator");
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/pay/act/provider.aspx",
                data: "moduleId=pay&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:hcmHouseCodes,userId:[user],"
                    + "appUnitBrief:" + houseCode + ",</criteria>",
                
                success: function(xml) {
                    me.houseCodeCache[houseCode].loaded = true;
		    
		            if ($(xml).find("item").length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.houseCodeCache[houseCode].valid = true;
		                    me.houseCodeCache[houseCode].id = $(this).attr("id");
		                });
		            }
					me.houseCodeValidate(houseCode, me.houseCodeCache[houseCode].buildQueue);
				}
			});
		},
		
		houseCodeValidate: function(houseCode, rowArray) {
		    var me = this;
		    var rowNumber = 0;
		    var objInput = {};
		    
		    if (me.houseCodeCache[houseCode].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
		            objInput = $("#txtHouseCode" + rowNumber);
					objInput.attr("title", "");
					objInput.css("background-color", me.cellColorValid);
		        }
		    }
		    else {
				 for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					objInput = $("#txtHouseCode" + rowNumber);
					objInput.attr("title", "Invalid House Code");
					objInput.css("background-color", me.cellColorInvalid);
		        }
		    }

			$("#txtHouseCode" + rowNumber).removeClass("loadingIndicator");
		},
		
		workOrderNumberPreCheck: function(rowNumber, workOrderNumber, valid) {
			var me = this;
		    if (me.workOrderNumberCache[workOrderNumber] == undefined) {
				me.workOrderNumberCache[workOrderNumber] = {};
			    me.workOrderNumberCache[workOrderNumber].valid = valid;
			    me.workOrderNumberCache[workOrderNumber].loaded = true;
			    me.workOrderNumberCache[workOrderNumber].buildQueue = [];
			    me.workOrderNumberCache[workOrderNumber].buildQueue.push(rowNumber);
	        }
		},

		workOrderNumberBlur: function(objInput) {
			var me = this;
		    var rowNumber = Number(objInput.id.replace("txtWorkOrderNumber", ""));
		    
		    //remove any unwanted characters
		    objInput.value = objInput.value.replace(/[^0-9]/g, "");

			if (objInput.value != "")
		    	me.workOrderNumberCheck(rowNumber, objInput.value);
			else {
				objInput.title = "";
				objInput.style.backgroundColor = me.cellColorValid;
			}
		},
		
		workOrderNumberCheck: function(rowNumber, workOrderNumber) {
			var me = this;

		    if (me.workOrderNumberCache[workOrderNumber] != undefined) {
	            if (me.workOrderNumberCache[workOrderNumber].loaded)
	                me.workOrderNumberValidate(workOrderNumber, [rowNumber]);
	            else
	                me.workOrderNumberCache[workOrderNumber].buildQueue.push(rowNumber);
	        }
	        else
	            me.workOrderNumberLoad(rowNumber, workOrderNumber);
		},
		
		workOrderNumberLoad: function(rowNumber, workOrderNumber) {
		    var me = this;

			if (me.workOrderNumberCache[workOrderNumber] == undefined) {
				me.workOrderNumberCache[workOrderNumber] = {};
				me.workOrderNumberCache[workOrderNumber].valid = false;
				me.workOrderNumberCache[workOrderNumber].loaded = false;
				me.workOrderNumberCache[workOrderNumber].buildQueue = [];
				me.workOrderNumberCache[workOrderNumber].buildQueue.push(rowNumber);
			}

		    $("#txtWorkOrderNumber" + rowNumber).addClass("loadingIndicator");
		    $.ajax({
                type: "POST",
                dataType: "xml",
                url: "/net/crothall/chimes/fin/pay/act/provider.aspx",
                data: "moduleId=pay&requestId=1&targetId=iiCache"
                    + "&requestXml=<criteria>storeId:womWorkOrders,userId:[user]"
                    + ",houseCodeId:0,houseCodeJobId:0,status:0"
					+ ",workOrderNumber:" + workOrderNumber + "</criteria>",
 
                success: function(xml) {
                    me.workOrderNumberCache[workOrderNumber].loaded = true;

		            if ($(xml).find("item").length) {
		                //the house code is valid
		                $(xml).find('item').each(function() {
		                    me.workOrderNumberCache[workOrderNumber].valid = true;
		                    me.workOrderNumberCache[workOrderNumber].id = $(this).attr("id");
		                });
		            }
					me.workOrderNumberValidate(workOrderNumber, me.workOrderNumberCache[workOrderNumber].buildQueue);
				}
			});
		},
		
		workOrderNumberValidate: function(workOrderNumber, rowArray) {
		    var me = this;
		    var rowNumber = 0;
		    var objInput = {};
		    
		    if (me.workOrderNumberCache[workOrderNumber].valid) {
		        for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
		            objInput = $("#txtWorkOrderNumber" + rowNumber);
					objInput.attr("title", "");
					objInput.css("background-color", me.cellColorValid);
		        }
		    }
		    else {
				 for (var index = 0; index < rowArray.length; index++) {
		            rowNumber = Number(rowArray[index]);
					objInput = $("#txtWorkOrderNumber" + rowNumber);
					objInput.attr("title", "Invalid House Code");
					objInput.css("background-color", me.cellColorInvalid);
		        }
		    }

			$("#txtWorkOrderNumber" + rowNumber).removeClass("loadingIndicator");
		},

		actionClickItem: function(objCheckBox) {
			var me = this;

			me.modified();
		},

		actionShowItem: function(action) {
			var me = this;

			$("#AnchorPrepare").hide();
			$("#AnchorImport").hide();
			$("#AnchorReconcile").hide();
			$("#AnchorFinalize").hide();
			$("#AnchorView").hide();
			$("#AnchorExport").hide();
			$("#ReconcileInfo").hide();

			if (action == "Prepare") {
				$("#AnchorPrepare").show();
				$("#DetailInfo").html("Epay Calculated Detail Info");
			}
			else if (action == "Import") {
				$("#AnchorImport").show();
				$("#DetailInfo").html("Epay Calculated Detail Info");
			}
			else if (action == "Reconcile") {
				$("#AnchorReconcile").show();
				$("#DetailInfo").html("TeamFin Calculated Detail Info");
			}
			else if (action == "Finalize") {
				$("#AnchorFinalize").show();
				$("#DetailInfo").html("TeamFin Processed Detail Info");
			}
			else if (action == "Export") {
				$("#AnchorExport").show();
			}

			$("#header").html("Process Payroll - " + action);
			me.action = action;
			me.setLoadCount();
			
			if (me.action == "Export") {
				me.validateExport = true;
				me.ePayBatchStore.fetch("userId:[user],status:Finalize", me.ePayBatchesLoaded, me);
			}
			else
				me.ePayBatchStore.fetch("userId:[user],status:" + action, me.ePayBatchesLoaded, me);
			me.resize();
		},

		actionPrepareItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.actionSaveItem("Prepare");
		},
		
		actionImportItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.autoProcess = true;
			me.autoProcessStep = "Import";
			me.actionSaveItem("Import");
		},
		
		actionReconcileItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.actionSaveItem("Reconcile");
		},

		actionFinalizeItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.actionSaveItem("Finalize");
		},

		actionViewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.ePayBatchGrid.activeRowIndex == -1)
				return;

			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").fadeIn("slow");

			me.loadPopup();
			me.batchStatus.select(0, me.batchStatus.focused);
			me.batchStatus.resizeText();
			me.ePayBatchDetailStore.reset();
			me.ePayBatchDetailStore.fetch("userId:[user],status:1,batchId:" + me.batchId, me.ePayBatchDetailsLoaded, me);
		},

		actionExportItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.actionSaveItem("Export");
		},

		actionCancelItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.actionSaveItem("Cancel");
		},
		
		actionSaveItem: function(status) {
			var me = this;
			var item = [];
			var xml = "";
			var rowDeleted = false;

			if (me.ePayBatchGrid.activeRowIndex == -1)
				return;

			me.status = status;
			if (me.status == "CancelEpayBatchRecord") {
				for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
					if ($("#chkSelect" + index)[0] != undefined && $("#chkSelect" + index)[0].checked) {
						if (me.ePayBatchDetailsList[index].id == 0) {
							me.actionDeleteItem(index);
							rowDeleted = true;
						}
						else {
							xml += '<epayBatchDetailUpdate';
							xml += ' id="' + me.ePayBatchDetailsList[index].id + '"';
							xml += ' batchId="' + me.ePayBatchDetailsList[index].batchId + '"';
							xml += ' status="' + status + '"';
							xml += '/>';
						}
					}
				}

				if (rowDeleted)
					me.setRowNumber();
			}
			else if (me.status == "SaveEpayBatchRecord") {
				me.actionValidateItem(false);

				for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
					if ($("#chkSelect" + index)[0] != undefined && $("#chkSelect" + index)[0].checked) {
						var employeeNumber = $("#txtEmployeeNumber" + index).val();
						var houseCode = $("#txtHouseCode" + index).val();
						var workOrderNumber = $("#txtWorkOrderNumber" + index).val();
						if (employeeNumber == "" || !me.employeeNumberCache[employeeNumber].valid
							|| houseCode == "" || !me.houseCodeCache[houseCode].valid 
							|| (workOrderNumber != "" && !me.workOrderNumberCache[workOrderNumber].valid)
							|| $("#selPayCode" + index).val() == "0" 
							|| $("#txtExpenseDate" + index).val() == ""
							|| !me.isHoursAmountValid(index)) {
							alert("In order to save, the errors on the page must be corrected for the selected records.");
							return false;
						}
						else {
							xml += '<epayBatchDetailUpdate';
							xml += ' id="' + me.ePayBatchDetailsList[index].id + '"';
							xml += ' batchId="' + me.batchId + '"';
							xml += ' status="' + status + '"';
							xml += ' employeeNumber="' + employeeNumber + '"';
							xml += ' payCode="' + $("#selPayCode" + index).val() + '"';
							xml += ' houseCode="' + houseCode + '"';
							xml += ' expenseDate="' + $("#txtExpenseDate" + index).val() + '"';
							xml += ' hours="' + $("#txtHours" + index).val() + '"';
							xml += ' amount="' + $("#txtAmount" + index).val() + '"';
							xml += ' workOrderNumber="' + workOrderNumber + '"';
							xml += '/>';
						}
					}
				}
			}
			else {
				var index = me.ePayBatchGrid.activeRowIndex;
				xml += '<epayBatchUpdate';
				xml += ' id="' + me.ePayBatchList[index].id + '"';
				xml += ' batchId="' + me.ePayBatchList[index].batchId + '"';
				xml += ' status="' + status + '"';
				xml += '/>';
			}

			if (xml == "")
				return;

			me.setStatus("Saving");
			if (me.status == "CancelEpayBatchRecord" || me.status == "SaveEpayBatchRecord") {
				$("#popupMessageToUser").text("Saving");
				$("#popupLoading").fadeIn("slow");
			}
			else {
				if (me.status == "Prepare")
					$("#messageToUser").text("Preparing");
				else if (me.status == "Import")
					$("#messageToUser").text("Importing");
				else if (me.status == "Reconcile")
					$("#messageToUser").text("Reconcile process will take few minutes, please wait...");
				else if (me.status == "Finalize")
					$("#messageToUser").text("Finalizing");
				else if (me.status == "Export")
					$("#messageToUser").text("Export process will take few minutes, please wait...");
				else if (me.status == "Cancel")
					$("#messageToUser").text("Cancelling");
				else
					$("#messageToUser").text("Saving");
				$("#pageLoading").fadeIn("slow");
			}

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: { me: me, item: item	}
			});

			return true;
		},

		saveResponseItem: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {
				if (me.status == "CancelEpayBatchRecord" || me.status == "SaveEpayBatchRecord") {
					me.setBatchInfo();
				}
				else {
					if (me.action == "Export") {
						me.ePayBatchList = [];
						me.ePayBatchGrid.setData(me.ePayBatchList);
						me.anchorExport.display(ui.cmn.behaviorStates.disabled);
					}
					else {
						if (me.autoProcess) {
							$(args.xmlNode).find("*").each(function() {
								switch (this.tagName) {
									case "payBatch":
										if (me.autoProcessStep == "Import" && $(this).attr("valid") == "true") {
											me.autoProcessStep = "Reconcile";
											me.actionSaveItem("Reconcile");
										}
										else if (me.autoProcessStep == "Reconcile") {
											me.detailRecordCountFinalize = parseInt($(this).attr("detailRecordCount"), 10);
											me.detailTotalHoursFinalize = parseFloat($(this).attr("detailTotalHours"));
											me.detailTotalAmountFinalize = parseFloat($(this).attr("detailTotalAmount"));
											me.ePayBatchStore.fetch("userId:[user],status:FinalizeError,batchId:" + me.ePayBatchGrid.data[me.ePayBatchGrid.activeRowIndex].batchId, me.ePayBatchesLoaded, me);
										}
										else {
											var index = me.ePayBatchGrid.activeRowIndex;
											me.ePayBatchList.splice(index, 1);
											me.ePayBatchGrid.setData(me.ePayBatchList);
											me.autoProcess = false;
											me.autoProcessStep = "";
										}
									break;
								}
							});
						}
						else {
							var index = me.ePayBatchGrid.activeRowIndex;
							me.ePayBatchList.splice(index, 1);
							me.ePayBatchGrid.setData(me.ePayBatchList);
						}
					}

					if (me.action == "Finalize" || me.action == "Export") {
						$("#ReconcileInfo").hide();
						me.ePayBatchGrid.setHeight($(window).height() - 130);
					}
				}
				
				if (!me.autoProcess) {
					me.modified(false);
					me.setStatus("Saved");
				}
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating State Minimum Wage details: " + $(args.xmlNode).attr("message"));
			}

			if (me.status == "CancelEpayBatchRecord" || me.status == "SaveEpayBatchRecord")
				$("#popupLoading").fadeOut("slow");
			else if (!me.autoProcess)
				$("#pageLoading").fadeOut("slow");
		},
		
		setBatchInfo: function(payrollRecordCount, payrollHours, payrollAmount) {
			var me = this;
			var payrollHours = 0;
			var payrollAmount = 0;

			for (var index = 0; index < me.ePayBatchDetailsList.length; index++) {
				if ($("#chkSelect" + index)[0] != undefined && $("#chkSelect" + index)[0].checked) {
					payrollHours = parseFloat($("#txtHours" + index).val());
					payrollAmount = parseFloat($("#txtAmount" + index).val());

					if (me.status == "SaveEpayBatchRecord") {
						if (me.ePayBatchDetailsList[index].id == 0) {
							me.ePayBatches[0].weeklyPayrollRecordCount += 1;
							me.ePayBatches[0].weeklyPayrollTotalHours = parseFloat(me.ePayBatches[0].weeklyPayrollTotalHours) + payrollHours;
							me.ePayBatches[0].weeklyPayrollTotalAmount = parseFloat(me.ePayBatches[0].weeklyPayrollTotalAmount) + payrollAmount;
						}
						else {
							me.ePayBatches[0].batchRecordCount += 1;
							me.ePayBatches[0].batchTotalHours = parseFloat(me.ePayBatches[0].batchTotalHours) + payrollHours;
							me.ePayBatches[0].batchTotalAmount = parseFloat(me.ePayBatches[0].batchTotalAmount) + payrollAmount;
							me.ePayBatches[0].detailRecordCount -= 1;
							me.ePayBatches[0].detailTotalHours = parseFloat(me.ePayBatches[0].detailTotalHours) - payrollHours;
							me.ePayBatches[0].detailTotalAmount = parseFloat(me.ePayBatches[0].detailTotalAmount) - payrollAmount;

							if (me.ePayBatchDetailsList[index].cancelled) {
								me.ePayBatches[0].cancelledErrorRecordCount -= 1;
								me.ePayBatches[0].cancelledErrorTotalHours = parseFloat(me.ePayBatches[0].cancelledErrorTotalHours) - payrollHours;
								me.ePayBatches[0].cancelledErrorTotalAmount = parseFloat(me.ePayBatches[0].cancelledErrorTotalAmount) - payrollAmount;
							}
						}
					}
					else if (me.status == "CancelEpayBatchRecord") {
						if (me.ePayBatchDetailsList[index].id > 0) {
							me.ePayBatches[0].detailRecordCount -= 1;
							me.ePayBatches[0].detailTotalHours = parseFloat(me.ePayBatches[0].detailTotalHours) - payrollHours;
							me.ePayBatches[0].detailTotalAmount = parseFloat(me.ePayBatches[0].detailTotalAmount) - payrollAmount;
							me.ePayBatches[0].cancelledErrorRecordCount += 1;
							me.ePayBatches[0].cancelledErrorTotalHours = parseFloat(me.ePayBatches[0].cancelledErrorTotalHours) + payrollHours;
							me.ePayBatches[0].cancelledErrorTotalAmount = parseFloat(me.ePayBatches[0].cancelledErrorTotalAmount) + payrollAmount;
						}
					}

					var itemIndex = ii.ajax.util.findIndexById(me.ePayBatchDetailsList[index].id.toString(), me.ePayBatchDetails);
					if (itemIndex != undefined && itemIndex >= 0)
						me.ePayBatchDetails.splice(itemIndex, 1);
				}
			}
			
			var index = me.ePayBatchGrid.activeRowIndex;

			me.ePayBatches[0].weeklyPayrollTotalHours = parseFloat(me.ePayBatches[0].weeklyPayrollTotalHours).toFixed(2);
			me.ePayBatches[0].weeklyPayrollTotalAmount = parseFloat(me.ePayBatches[0].weeklyPayrollTotalAmount).toFixed(2);
			me.ePayBatches[0].batchTotalHours = parseFloat(me.ePayBatches[0].batchTotalHours).toFixed(2);
			me.ePayBatches[0].batchTotalAmount = parseFloat(me.ePayBatches[0].batchTotalAmount).toFixed(2);
			me.ePayBatches[0].detailTotalHours = parseFloat(me.ePayBatches[0].detailTotalHours).toFixed(2);
			me.ePayBatches[0].detailTotalAmount = parseFloat(me.ePayBatches[0].detailTotalAmount).toFixed(2);
			me.ePayBatches[0].cancelledErrorTotalHours = parseFloat(me.ePayBatches[0].cancelledErrorTotalHours).toFixed(2);
			me.ePayBatches[0].cancelledErrorTotalAmount = parseFloat(me.ePayBatches[0].cancelledErrorTotalAmount).toFixed(2);
			me.ePayBatches[0].detailTotalHours = parseFloat(me.ePayBatches[0].detailTotalHours).toFixed(2);
			me.ePayBatches[0].detailTotalAmount = parseFloat(me.ePayBatches[0].detailTotalAmount).toFixed(2);
			me.ePayBatches[0].cancelledErrorTotalHours = parseFloat(me.ePayBatches[0].cancelledErrorTotalHours).toFixed(2);
			me.ePayBatches[0].cancelledErrorTotalAmount = parseFloat(me.ePayBatches[0].cancelledErrorTotalAmount).toFixed(2);
									
			me.ePayBatchGrid.data[index].detailRecordCount = me.ePayBatches[0].batchRecordCount;
			me.ePayBatchGrid.data[index].detailTotalHours = me.ePayBatches[0].batchTotalHours;
			me.ePayBatchGrid.data[index].detailTotalAmount = me.ePayBatches[0].batchTotalAmount;
			me.showDetailReport = true;
			me.ePayBatchesLoaded(me, 0);
			me.ePayBatchDetailsLoaded(me, 0);
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
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.setStatus("Normal");
			$("#backgroundPopup").fadeOut("slow");
			$("#batchPopup").fadeOut("slow");
		},

		centerPopup: function() {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = $("#batchPopup").width();
			var popupHeight = $("#batchPopup").height();

			$("#popupLoading, #batchPopup").css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
		}
	}
});

function main() {
	fin.processPayrollUi = new fin.pay.UserInterface();
	fin.processPayrollUi.resize();
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.wom.completeWorkOrder.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );

ii.Class({
    Name: "fin.wom.completeWorkOrder.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.houseCodeJobId = 0;
			me.workOrderIndex = -1;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("wom", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\WorkOrders\\CompleteWorkOrders";
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
		
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
						
			me.startDate.setValue("");
			me.endDate.setValue("");
			
			$(window).bind("resize", me, me.resize);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_wom_completeWorkOrder_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			me.cwoReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			
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
				me.session.registerFetchNotify(me.sessionLoaded,me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_wom_completeWorkOrder_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			var me = args.me;
			
			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var offset = document.documentElement.clientHeight - 170;
			
			fin.completeWorkOrderUi.workOrderGrid.setHeight(offset);
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "Job",
				formatFunction: function(type) { return (type.jobNumber + " - " + type.jobTitle); },
				changeFunction: function() {
					if (me.job.indexSelected >= 0) {
						me.houseCodeJobId = me.houseCodeJobs[me.job.indexSelected].id;
						$("#JobText").attr("title", me.houseCodeJobs[me.job.indexSelected].jobNumber + " - " + me.houseCodeJobs[me.job.indexSelected].jobTitle);
					}
					else
						me.houseCodeJobId = 0;
				}
			});	
						
			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)				
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
			
			me.anchorComplete = new ui.ctl.buttons.Sizeable({
				id: "AnchorComplete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Complete&nbsp;Work Orders&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.selectAll = new ui.ctl.Input.Check({
		        id: "SelectAll",
				changeFunction: function() { me.actionSelectAllItem(); }
		    });

			me.workOrderGrid = new ui.ctl.Grid({
				id: "WorkOrderGrid",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
			});
			
			me.woStartDate = new ui.ctl.Input.Text({
		        id: "WOStartDate",
		        appendToId: "WorkOrderGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.completedDate = new ui.ctl.Input.Date({
		        id: "CompletedDate",
		        appendToId: "WorkOrderGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });

			me.completedDate.makeEnterTab()
				.setValidationMaster( me.validator )		
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.completedDate.lastBlurValue;
				
				if (enteredText == "") 
					return;

				me.modified(true);

				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Completed Date.");
				else if (new Date(enteredText) > new Date())
					this.setInvalid("Completed Date should not be greater than Current Date.");
				else {
					if (me.workOrderGrid.activeRowIndex >= 0) {
						var item = me.workOrderGrid.data[me.workOrderGrid.activeRowIndex];

						if (new Date (enteredText) < new Date(item.startDate))
							this.setInvalid("Completed Date should not be less than Start Date.");
					}
				}
			});
			
			me.workOrderGrid.addColumn("assigned", "assigned", "", "Checked means convert Work Order to Invoice", 30, function() {
				var index = me.workOrderGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onchange=\"parent.fin.appUI.modified = true;\" onclick=\"actionClickItem(this);\" " + (me.workOrders[index].assigned == true ? checked='checked' : '') + " />";
            });			
			me.workOrderGrid.addColumn("workOrderNumber", "workOrderNumber", "Work Order #", "Work Order Number", 100);
			me.workOrderGrid.addColumn("", "", "Notes", "Notes", 60, function() {
				var index = me.workOrderGrid.rows.length - 1;
                return "<center><img src='/fin/cmn/usr/media/Common/notes.png' id=\"imgNotes" + index + "\" onclick=\"actionNotesItem(" + index + ");\" /></center>";
            });
			me.workOrderGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 90, null, me.woStartDate);
			me.workOrderGrid.addColumn("completedDate", "completedDate", "Completed Date", "Completed Date", 120, null, me.completedDate);
			me.workOrderGrid.addColumn("serviceLocation", "serviceLocation", "Service Location", "Service Location",null );
			me.workOrderGrid.addColumn("customer", "customer", "Customer", "Customer", 150);
			me.workOrderGrid.capColumns();

			me.notes = $("#Notes")[0];

			$("#Notes").height(100);
			$("#Notes").keypress(function() {
				if (me.notes.value.length > 1023) {
					me.notes.value = me.notes.value.substring(0, 1024);
					return false;
				}
			});			
			$("#Notes").change(function() { me.modified(true); });
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Ok&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOkItem(); },
				hasHotState: true
			});
		},		
		
		resizeControls: function() {
			var me = this;
			
			me.job.resizeText();
			me.startDate.resizeText();
			me.endDate.resizeText();
			me.woStartDate.resizeText();
			me.completedDate.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.wom.completeWorkOrder.HirNode,
				itemConstructorArgs: fin.wom.completeWorkOrder.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.wom.completeWorkOrder.HouseCode,
				itemConstructorArgs: fin.wom.completeWorkOrder.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.wom.completeWorkOrder.HouseCodeJob,
				itemConstructorArgs: fin.wom.completeWorkOrder.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});			
			
			me.workOrders = [];
			me.workOrderStore = me.cache.register({
				storeId: "womWorkOrders",
				itemConstructor: fin.wom.completeWorkOrder.WorkOrder,
				itemConstructorArgs: fin.wom.completeWorkOrder.workOrderArgs,
				injectionArray: me.workOrders
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
		
		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			
			me.job.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			
		},

		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.job.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
	
			me.job.setData(me.houseCodeJobs);
			me.job.select(0, me.job.focused);
			me.houseCodeJobId = me.houseCodeJobs[me.job.indexSelected].id;

			me.actionLoadItem();
		},
		
		actionLoadItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if(!me.startDate.valid || !me.endDate.valid) {
				alert("In order to search, the errors on the page must be corrected.");
				return false;
			}
			
			if (me.workOrderGrid.activeRowIndex >= 0)
				me.workOrderGrid.body.deselect(me.workOrderGrid.activeRowIndex, true);
				
			me.setLoadCount();
			
			me.workOrderStore.reset();	
			me.workOrderStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId 
				+ ",houseCodeJobId:" + me.houseCodeJobId 
				+ ",status:8"
				+ ",startDate:" + me.startDate.lastBlurValue
				+ ",endDate:" + me.endDate.lastBlurValue
				, me.workOrdersLoaded
				, me);
		},
		
		workOrdersLoaded: function(me, activeId) {

			me.workOrderGrid.setData(me.workOrders);
			me.selectAll.setValue("false");
			me.checkLoadCount();
			me.resizeControls();
			
			if (me.cwoReadOnly) {				
				for (var index = 0; index < me.workOrders.length; index++) {
					$("#assignInputCheck" + index).attr('disabled', true);
					$("#imgNotes" + index).hide();
				}
				$("#CompleteDiv").hide();
				me.workOrderGrid.columns["startDate"].inputControl = null;	
				me.workOrderGrid.columns["completedDate"].inputControl = null;
			}
		},
		
		itemSelect: function() {			
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			
			var index = args.index;
			var item = me.workOrderGrid.data[index];			
			
			if (index >= 0)
				me.woStartDate.text.readOnly = true;
		},	
		
		actionSelectAllItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.modified(true);
			
			for (var index = 0; index < me.workOrders.length; index++) {
				$("#assignInputCheck" + index)[0].checked = me.selectAll.check.checked;
				me.workOrders[index].assigned = me.selectAll.check.checked;
			}
		},
		
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())	 	
					return;	
					
			hidePopup();
			me.setStatus("Loaded");
		},
		
		actionOkItem: function() {
			var me = this;

			hidePopup();
			me.workOrders[me.workOrderIndex].notes = me.notes.value;
			me.setStatus("Loaded");
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			
			if (me.cwoReadOnly) return;
			
			me.workOrderGrid.body.deselectAll();
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if(!me.validator.queryValidity(true) && me.workOrderGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			for (var index = 0; index < me.workOrders.length; index++) {
				if ($("#assignInputCheck" + index)[0].checked) {
					if (me.workOrders[index].completedDate == undefined || me.workOrders[index].completedDate == "") {
						alert("Please enter the completed date for selected work orders.");
						return false;
					}
					
					xml += '<womWorkOrderStatus';
					xml += ' id="' + me.workOrders[index].id + '"';
					xml += ' statusType="9"';
					xml += ' notes="' + ui.cmn.text.xml.encode(me.workOrders[index].notes) + '"';
					xml += ' completedDate="' + me.workOrders[index].completedDate.toLocaleString() + '"';
					xml += '/>';
				}
			}

			if (xml == "")
				return;
			
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
				me.setStatus("Saved");
				me.actionLoadItem();
			}
			else {	
				me.setStatus("Error");			
				alert("[SAVE FAILURE] Error while updating Work Order Status: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow"); 
		}
	}
});

function actionClickItem(objCheckBox) {
	var me = fin.completeWorkOrderUi;
	var allSelected = true;
	var index = 0;
	
	if (objCheckBox.checked) {
		for (index = 0; index < me.workOrders.length; index++) {
		
			if ($("#assignInputCheck" + index)[0].checked == false) {
				allSelected = false;
				break;
			}
		}
	}
	else
		allSelected = false;
	
	index = objCheckBox.id.substring(objCheckBox.id.length - 1);
	me.workOrders[index].assigned = objCheckBox.checked;
	me.selectAll.setValue(allSelected.toString());
}

function actionNotesItem(index) {
	var me = fin.completeWorkOrderUi;
		
	loadPopup();
	me.notes.value = me.workOrders[index].notes;
	me.workOrderIndex = index;
}

function loadPopup() {
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupNotes").fadeIn("slow");
}

function hidePopup() {
	$("#popupNotes").fadeOut("slow");
	$("#backgroundPopup").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupNotes").width();
	var popupHeight = $("#popupNotes").height();
		
	$("#popupNotes").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
		
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.completeWorkOrderUi = new fin.wom.completeWorkOrder.UserInterface();
	fin.completeWorkOrderUi.resize();
	fin.houseCodeSearchUi = fin.completeWorkOrderUi;
}
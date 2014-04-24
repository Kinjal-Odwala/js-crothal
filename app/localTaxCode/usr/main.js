ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.app.localTaxCode.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.theme", 8 );
ii.Style( "fin.cmn.usr.core", 9 );
ii.Style( "fin.cmn.usr.multiselect", 10 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; }); 
}

ii.Class({
    Name: "fin.app.localTaxCode.UserInterface",
    Definition: {
	
		init: function () {
			var args = ii.args(arguments, {});
			var me = this;

			me.loadCount = 0;
			me.validated = false;

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\SystemVariable";
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

			ui.cmn.behavior.disableBackspaceNavigation();
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_app_localTaxCode_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

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
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.loadCount = 2;
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.ceridianCompanyStore.fetch("userId:[user]", me.ceridianCompaniesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_app_localTaxCode_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			$("#Container").height($(window).height() - 120);					
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
					title: "Save the current local tax code details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New (Ctrl+N)", 
					title: "Add the new local tax code details.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo the changes to local tax code details being edited.",
					actionFunction: function() { me.actionUndoItem(); }
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

			$("#CeridianCompany").multiselect({
				minWidth: 200
				, height: 400
				, header: false
				, noneSelectedText: ""
				, selectedList: 1
				, click: function() { me.modified(true); }
			});

			me.localTaxCode = new ui.ctl.Input.Text({
		        id: "LocalTaxCode",
				required : false,
				changeFunction: function() { me.modified(); } 
		    });

			me.localTaxCode.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.description = new ui.ctl.Input.Text({
		        id: "Description",
				required : false,
				changeFunction: function() { me.modified(); } 
		    });

			me.description.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.state = new ui.ctl.Input.DropDown.Filtered({
				id : "State",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); } 
		    });

			me.state.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					if (me.state.indexSelected == -1)
						this.setInvalid("Please select the correct State.");
				});
		},

		configureCommunications: function() {
			var me = this;

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.app.localTaxCode.StateType,
				itemConstructorArgs: fin.app.localTaxCode.stateTypeArgs,
				injectionArray: me.stateTypes	
			});

			me.ceridianCompanys = [];
			me.ceridianCompanyStore = me.cache.register({
				storeId: "payrollCompanys",
				itemConstructor: fin.app.localTaxCode.CeridianCompany,
				itemConstructorArgs: fin.app.localTaxCode.ceridianCompanyArgs,
				injectionArray: me.ceridianCompanys
			});

			me.localTaxCodes = [];
			me.localTaxCodeStore = me.cache.register({
				storeId: "localTaxCodes",
				itemConstructor: fin.app.localTaxCode.LocalTaxCode,
				itemConstructorArgs: fin.app.localTaxCode.localTaxCodeArgs,
				injectionArray: me.localTaxCodes
			});
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

			me.localTaxCode.resizeText();
			me.description.resizeText();
			me.state.resizeText();
			me.resize();
		},

		resetControls: function()  {
			var me = this;
			
			me.validator.reset();
			me.localTaxCode.setValue("");
			me.description.setValue("");
			me.state.reset();
			me.state.updateStatus();
			$("#CeridianCompany").multiselect("uncheckAll");
		},

		stateTypesLoaded: function(me, activeId) {

			me.state.setData(me.stateTypes);
			me.resizeControls();
			me.resetControls();
			me.checkLoadCount();
		},
		
		ceridianCompaniesLoaded: function(me, activeId) {

			$("#CeridianCompany").html("");
			for (var index = 0; index < me.ceridianCompanys.length; index++) {
				$("#CeridianCompany").append("<option title='" + me.ceridianCompanys[index].name + "' value='" + me.ceridianCompanys[index].id + "'>" + me.ceridianCompanys[index].name + "</option>");
			}
			$("#CeridianCompany").multiselect("refresh");
			
			me.checkLoadCount();
		},

		actionNewItem: function() {
			var me = this;			

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.resetControls();
			me.setStatus("Normal");
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.resetControls();
			me.setStatus("Normal");
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			var selectedCompanies = "";

			me.validator.forceBlur();
			selectedCompanies = $("#CeridianCompany").multiselect("getChecked").map(function() {
				return this.value;    
			}).get()

			if (selectedCompanies == "") {
				alert("Please select at least one Ceridian Company.");
				return false;
			}

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.setStatus("Saving");
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			if (me.validated) {
				for (var index = 0; index < selectedCompanies.length; index++) {
					xml += '<employeeLocalTaxCode';
					xml += ' id="0"';
					xml += ' ceridianCompany="' + selectedCompanies[index] + '"';
					xml += ' localTaxCode="' + ui.cmn.text.xml.encode(me.localTaxCode.getValue()) + '"';
					xml += ' description="' + ui.cmn.text.xml.encode(me.description.getValue()) + '"';
					xml += ' stateType="' + me.state.data[me.state.indexSelected].id + '"';
					xml += '/>';
				}
			}
			else {
				for (var index = 0; index < selectedCompanies.length; index++) {
					var itemIndex = ii.ajax.util.findIndexById(selectedCompanies[index], me.ceridianCompanys);
					var title = (itemIndex != undefined && itemIndex >= 0) ? me.ceridianCompanys[itemIndex].name : "";

					xml += '<employeeLocalTaxCodeValidate';
					xml += ' id="0"';
					xml += ' ceridianCompany="' + selectedCompanies[index] + '"';
					xml += ' ceridianCompanyTitle="' + ui.cmn.text.xml.encode(title) + '"';
					xml += ' localTaxCode="' + ui.cmn.text.xml.encode(me.localTaxCode.getValue()) + '"';
					xml += '/>';
				}
			}

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: {me: me, item: item}
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

			if (!me.validated && status == "valid") {
				me.validated = true;
				me.actionSaveItem();
			}
			else if (status == "success") {
				me.validated = false;
				me.modified(false);
				me.setStatus("Saved");
				me.resetControls();
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Local Tax Code details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {

	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.app.localTaxCodeUi = new fin.app.localTaxCode.UserInterface();
			fin.app.localTaxCodeUi.resize();
		}
	}, 100);
}
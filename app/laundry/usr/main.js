ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.app.laundry.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.button", 8 );

ii.Class({
    Name: "fin.app.laundry.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
	
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\LaundryMetrics";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();			
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);

			$(window).bind("resize", me, me.resize);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_app_laundry_UserInterface_authorizationProcess() {
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
				me.loadCount = 2;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.laundryMetricTypeStore.fetch("userId:[user]", me.laundryMetricTypesLoaded, me);
				me.payPeriodStore.fetch("userId:[user],fiscalYearId:-1,frequencyType:2", me.payPeriodsLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_app_laundry_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.laundryUi;

			me.laundryMetricGrid.setHeight($(window).height() - 150);
		},

		defineFormControls: function fin_app_laundry_UserInterface_defineFormControls() {
			var me = this;

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.payPeriod = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayPeriod",
				formatFunction: function(type) { return type.startDate + " - " + type.endDate; },
				changeFunction: function() {  me.actionListItem(); }
		    });
			
			me.payPeriod.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				
	
				if (me.payPeriod.indexSelected == -1)
					this.setInvalid("Please select the correct Period.");
			});

			me.laundryMetricGrid = new ui.ctl.Grid({
				id: "LaundryMetricGrid",
				appendToId: "divForm",
				selectFunction: function( index ) { me.itemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.sunday = new ui.ctl.Input.Text({
				id: "Sunday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.sunday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.sunday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.monday = new ui.ctl.Input.Text({
				id: "Monday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.monday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.monday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.tuesday = new ui.ctl.Input.Text({
				id: "Tuesday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.tuesday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.tuesday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.wednesday = new ui.ctl.Input.Text({
				id: "Wednesday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.wednesday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.wednesday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.thursday = new ui.ctl.Input.Text({
				id: "Thursday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.thursday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.thursday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.friday = new ui.ctl.Input.Text({
				id: "Friday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.friday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.friday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
				
			me.saturday = new ui.ctl.Input.Text({
				id: "Saturday",
				appendToId: "LaundryMetricGridControlHolder",
				maxLength: 11,
				changeFunction: function() { me.modified(); }
			});

			me.saturday.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.saturday.getValue();

					if (enteredText == "")
						return;

					if (!(/^\d{1,8}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid value.");
				});
			
			me.laundryMetricGrid.addColumn("laundryMetricTypeTitle", "laundryMetricTypeTitle", "Metric Type", "Metric Type", null);
			me.laundryMetricGrid.addColumn("sunday", "sunday", "Sunday", "Sunday", 120, null, me.sunday);
			me.laundryMetricGrid.addColumn("monday", "monday", "Monday", "Monday", 120, null, me.monday);
			me.laundryMetricGrid.addColumn("tuesday", "tuesday", "Tuesday", "Tuesday", 120, null, me.tuesday);
			me.laundryMetricGrid.addColumn("wednesday", "wednesday", "Wednesday", "Wednesday", 120, null, me.wednesday);
			me.laundryMetricGrid.addColumn("thursday", "thursday", "Thursday", "Thursday", 120, null, me.thursday);
			me.laundryMetricGrid.addColumn("friday", "friday", "Friday", "Friday", 120, null, me.friday);
			me.laundryMetricGrid.addColumn("saturday", "saturday", "Saturday", "Saturday", 120, null, me.saturday);
			me.laundryMetricGrid.capColumns();
		},

		configureCommunications: function fin_app_laundry_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.app.laundry.HirNode,
				itemConstructorArgs: fin.app.laundry.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.app.laundry.HouseCode,
				itemConstructorArgs: fin.app.laundry.houseCodeArgs,
				injectionArray: me.houseCodes			
			});

			me.payPeriods = [];
			me.payPeriodStore = me.cache.register({
				storeId: "payPeriods",
				itemConstructor: fin.app.laundry.PayPeriod,
				itemConstructorArgs: fin.app.laundry.payPeriodArgs,
				injectionArray: me.payPeriods
			});

			me.laundryMetricTypes = [];
			me.laundryMetricTypeStore = me.cache.register({
				storeId: "appLaundryMetricTypes",
				itemConstructor: fin.app.laundry.LaundryMetricType,
				itemConstructorArgs: fin.app.laundry.laundryMetricTypeArgs,
				injectionArray: me.laundryMetricTypes
			});

			me.laundryMetrics = [];
			me.laundryMetricStore = me.cache.register({
				storeId: "appLaundryMetrics",
				itemConstructor: fin.app.laundry.LaundryMetric,
				itemConstructorArgs: fin.app.laundry.laundryMetricArgs,
				injectionArray: me.laundryMetrics
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

			if (me.loadCount == 0)
				return;

			me.loadCount--;
			if (me.loadCount == 0) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},

		resizeControls: function() {
			var me = this;

			me.payPeriod.resizeText();
			me.resize();
		},

		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {				
					return me.houseCodeSearchError();
				}

				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (parent.fin.appUI.houseCodeId <= 0) return;
			me.loadLaundryMetrics();
		},

		laundryMetricTypesLoaded: function(me, activeId) {

			me.checkLoadCount();
			me.resizeControls();
		},
		
		payPeriodsLoaded: function(me, activeId) {
	
			me.payPeriod.setData(me.payPeriods);
			me.payPeriod.select(0, me.payPeriod.focused);
			me.loadLaundryMetrics();
			me.checkLoadCount();
		},

		actionListItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.loadLaundryMetrics();
		},
		
		loadLaundryMetrics: function() {
			var me = this;

			if (me.payPeriod.indexSelected == -1)
				return;

			if (me.laundryMetricGrid.activeRowIndex != - 1)
				me.laundryMetricGrid.body.deselect(me.laundryMetricGrid.activeRowIndex, true);

			me.setLoadCount();
			me.laundryMetricStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",periodId:" + me.payPeriods[me.payPeriod.indexSelected].id, me.laundryMetricsLoaded, me);
		},

		laundryMetricsLoaded: function(me, activeId) { 

			if (me.laundryMetrics.length == 0) {
				for (var index = 0; index < me.laundryMetricTypes.length; index++) {
					var item = new fin.app.laundry.LaundryMetric(0
						, me.laundryMetricTypes[index].id
						, me.laundryMetricTypes[index].title
						, parent.fin.appUI.houseCodeId
						, me.payPeriods[me.payPeriod.indexSelected].id
						)
						
					me.laundryMetrics.push(item);
				}
			}

			me.laundryMetricGrid.setData(me.laundryMetrics);
			me.checkLoadCount();
		},
		
		itemSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
						
			if (me.laundryMetricGrid.data[index] != undefined) {
				me.laundryMetricGrid.data[index].modified = true;
			}
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.laundryMetricGrid.activeRowIndex != - 1)
				me.laundryMetricGrid.body.deselect(me.laundryMetricGrid.activeRowIndex, true);
			me.laundryMetricStore.reset();
			me.loadLaundryMetrics();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = "";

			// Check to see if the data entered is valid
			me.laundryMetricGrid.body.deselectAll();
			me.validator.forceBlur();

			if (me.payPeriod.indexSelected == -1 || (!me.validator.queryValidity(true) && me.laundryMetricGrid.activeRowIndex >= 0)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			for (var index = 0; index < me.laundryMetrics.length; index++) {
				if (me.laundryMetrics[index].modified || me.laundryMetrics[index].id == 0) {
					me.laundryMetrics[index].modified = true;
					xml += '<appLaundryMetric';
					xml += ' id="' + me.laundryMetrics[index].id + '"';
					xml += ' laundryMetricTypeId="' + me.laundryMetrics[index].laundryMetricTypeId + '"';
					xml += ' houseCodeId="' + me.laundryMetrics[index].houseCodeId + '"';
					xml += ' periodId="' + me.laundryMetrics[index].periodId + '"';
					xml += ' sunday="' + me.laundryMetrics[index].sunday + '"';
					xml += ' monday="' + me.laundryMetrics[index].monday + '"';
					xml += ' tuesday="' + me.laundryMetrics[index].tuesday + '"';
					xml += ' wednesday="' + me.laundryMetrics[index].wednesday + '"';
					xml += ' thursday="' + me.laundryMetrics[index].thursday + '"';
					xml += ' friday="' + me.laundryMetrics[index].friday + '"';
					xml += ' saturday="' + me.laundryMetrics[index].saturday + '"';
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
						case "appLaundryMetric":
							var id = parseInt($(this).attr("id"), 10);

							for (var index = 0; index < me.laundryMetricGrid.data.length; index++) {
								if (me.laundryMetricGrid.data[index].modified) {
									if (me.laundryMetricGrid.data[index].id == 0)
										me.laundryMetricGrid.data[index].id = id;
									me.laundryMetricGrid.data[index].modified = false;
									break;
								}
							}
							break;
					}
				});
				
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating laundry metrics details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {

	fin.laundryUi = new fin.app.laundry.UserInterface();
	fin.laundryUi.resize();
	fin.houseCodeSearchUi = fin.laundryUi;
}
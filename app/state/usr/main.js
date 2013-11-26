ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.app.state.usr.defs" );

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
    Name: "fin.app.state.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			//pagination setup
			me.startPoint = 1;
			me.maximumRows = 250;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;
			
			me.loadCount = 0;
			me.federalMinimumWage = 0;
			me.stateId = 0;
			me.stateMinimumWageId = 0;
			me.stateWages = [];
			me.countyWages = [];
			me.cityWages = [];

			me.gateway = ii.ajax.addGateway("app", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\StateMinWage";
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

		authorizationProcess: function fin_app_state_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				me.loadCount = 1;
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.systemVariableStore.fetch("userId:[user],name:FederalMinimumWage", me.systemVariablesLoaded, me);
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_app_state_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments, {});

			fin.app.stateUi.stateGrid.setHeight($(window).height() - 70);
			fin.app.stateUi.stateWageGrid.setHeight(50);			
			fin.app.stateUi.countyWageGrid.setHeight(200);
			fin.app.stateUi.cityWageGrid.setHeight($(window).height() - 450);
			$("#StateContentArea").height($(window).height() - 110);
			$(".subHeader").width($("#StateWageGridHeader").width());
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

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save State (Ctrl+S)",
					title: "Save the State details.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo current changes to State (Ctrl+U)",
					title: "Undo the changes to State being edited.",
					actionFunction: function() { me.actionUndoItem(); }
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

			me.stateGrid = new ui.ctl.Grid({
				id: "StateGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index, true); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.stateGrid.addColumn("brief", "brief", "Brief", "Brief", 100);
			me.stateGrid.addColumn("name", "name", "Title", "Title", null);
			me.stateGrid.addColumn("minimumWage", "minimumWage", "Min Wage", "Minimum Wage", 90, function(minimumWage) { return ui.cmn.text.money.format(minimumWage); });
			me.stateGrid.capColumns();
			
			me.stateWageGrid = new ui.ctl.Grid({
				id: "StateWageGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 35,
				selectFunction: function(index) { me.stateWages[index].modified = true;	}
			});
			
			me.stateMinimumWage = new ui.ctl.Input.Text({
		        id: "StateMinimumWage",
				appendToId: "StateWageGridControlHolder",
		        maxLength: 6,
				required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.stateMinimumWage
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.stateMinimumWage.getValue();
					
					if (enteredText == "") return;

					if (!(/^\d{1,3}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Minimum Wage. Example: 9.99");
				});
			
			me.stateEffectiveDate = new ui.ctl.Input.Date({
		        id: "StateEffectiveDate",
		        appendToId: "StateWageGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });

			me.stateEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.stateEffectiveDate.lastBlurValue;
				
				if (enteredText == "") 
					return;

				if (me.stateWageGrid.activeRowIndex != -1) {
					var effectiveDate = new Date(me.stateWageGrid.data[me.stateWageGrid.activeRowIndex].effectiveDate);
					if (ui.cmn.text.date.format(effectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
						me.modified(true);
				}
				
				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Effective Date.");
				else if (new Date(enteredText) <= new Date(parent.fin.appUI.glbCurrentDate))
					this.setInvalid("Effective Date should be greater than Current Date.");
			});
			
			me.stateActive = new ui.ctl.Input.Check({
		        id: "StateActive",
		        className: "iiInputCheck",
				appendToId: "StateWageGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.stateWageGrid.addColumn("name", "name", "Title", "Title", null);
			me.stateWageGrid.addColumn("minimumWage", "minimumWage", "Min Wage", "Minimum Wage", 80, function(minimumWage) { return ui.cmn.text.money.format(minimumWage); }, me.stateMinimumWage);
			me.stateWageGrid.addColumn("effectiveDate", "effectiveDate", "Effective Date", "EffectiveDate", 120, null, me.stateEffectiveDate);
			me.stateWageGrid.addColumn("active", "active", "Active", "Active", 60, null, me.stateActive);
			me.stateWageGrid.addColumn("affectedNumberOfEmployees", "affectedNumberOfEmployees", "# of Employees", "Affected Number of Employees", 120, function(affectedEmployees) {
				var index = me.stateWageGrid.rows.length - 1;
				return affectedEmployees > 0 ? "<div class='employeesLink' onclick='fin.app.stateUi.actionEmployeeListItem(1, " + index + ");' >" + affectedEmployees + "</div>" : "";
			});			
			me.stateWageGrid.capColumns();
			
			me.countyWageGrid = new ui.ctl.Grid({
				id: "CountyWageGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 35,
				selectFunction: function(index) { me.countyWages[index].modified = true;	}
			});
			
			me.countyMinimumWage = new ui.ctl.Input.Text({
		        id: "CountyMinimumWage",
				appendToId: "CountyWageGridControlHolder",
		        maxLength: 6,
				required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.countyMinimumWage
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.countyMinimumWage.getValue();
					
					if (enteredText == "") return;

					if (!(/^\d{1,3}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Minimum Wage. Example: 9.99");
				});
			
			me.countyEffectiveDate = new ui.ctl.Input.Date({
		        id: "CountyEffectiveDate",
		        appendToId: "CountyWageGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });

			me.countyEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.countyEffectiveDate.lastBlurValue;
				
				if (enteredText == "") 
					return;

				if (me.countyWageGrid.activeRowIndex != -1) {
					var effectiveDate = new Date(me.countyWageGrid.data[me.countyWageGrid.activeRowIndex].effectiveDate);
					if (ui.cmn.text.date.format(effectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
						me.modified(true);
				}
				
				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Effective Date.");
				else if (new Date(enteredText) <= new Date(parent.fin.appUI.glbCurrentDate))
					this.setInvalid("Effective Date should be greater than Current Date.");
			});
			
			me.countyActive = new ui.ctl.Input.Check({
		        id: "CountyActive",
		        className: "iiInputCheck",
				appendToId: "CountyWageGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.countyWageGrid.addColumn("name", "name", "Title", "Title", null);
			me.countyWageGrid.addColumn("minimumWage", "minimumWage", "Min Wage", "Minimum Wage", 80, function(minimumWage) { return ui.cmn.text.money.format(minimumWage); }, me.countyMinimumWage);
			me.countyWageGrid.addColumn("effectiveDate", "effectiveDate", "Effective Date", "EffectiveDate", 120, null, me.countyEffectiveDate);
			me.countyWageGrid.addColumn("active", "active", "Active", "Active", 60, null, me.countyActive);
			me.countyWageGrid.addColumn("affectedNumberOfEmployees", "affectedNumberOfEmployees", "# of Employees", "Affected Number of Employees", 120, function(affectedEmployees) {
				var index = me.countyWageGrid.rows.length - 1;
				return affectedEmployees > 0 ? "<div class='employeesLink' onclick='fin.app.stateUi.actionEmployeeListItem(2, " + index + ");' >" + affectedEmployees + "</div>" : "";
			});
			me.countyWageGrid.capColumns();
			
			me.cityWageGrid = new ui.ctl.Grid({
				id: "CityWageGrid",
				appendToId: "divForm",
				allowAdds: false,
				rowNumberDisplayWidth: 35,
				selectFunction: function(index) { me.cityWages[index].modified = true;	}
			});
			
			me.cityMinimumWage = new ui.ctl.Input.Text({
		        id: "CityMinimumWage",
				appendToId: "CityWageGridControlHolder",
		        maxLength: 6,
				required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.cityMinimumWage
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.cityMinimumWage.getValue();
					
					if (enteredText == "") return;

					if (!(/^\d{1,3}(\.\d{1,2})?$/.test(enteredText)))
						this.setInvalid("Please enter valid Minimum Wage. Example: 9.99");
				});
			
			me.cityEffectiveDate = new ui.ctl.Input.Date({
		        id: "CityEffectiveDate",
		        appendToId: "CityWageGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });

			me.cityEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )	
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.cityEffectiveDate.lastBlurValue;
				
				if (enteredText == "") 
					return;

				if (me.cityWageGrid.activeRowIndex != -1) {
					var effectiveDate = new Date(me.cityWageGrid.data[me.cityWageGrid.activeRowIndex].effectiveDate);
					if (ui.cmn.text.date.format(effectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
						me.modified(true);
				}
				
				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false)
					this.setInvalid("Please enter valid Effective Date.");
				else if (new Date(enteredText) <= new Date(parent.fin.appUI.glbCurrentDate))
					this.setInvalid("Effective Date should be greater than Current Date.");
			});
			
			me.cityActive = new ui.ctl.Input.Check({
		        id: "CityActive",
		        className: "iiInputCheck",
				appendToId: "CityWageGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.cityWageGrid.addColumn("name", "name", "Title", "Title", null);
			me.cityWageGrid.addColumn("minimumWage", "minimumWage", "Min Wage", "Minimum Wage", 80, function(minimumWage) { return ui.cmn.text.money.format(minimumWage); }, me.cityMinimumWage);
			me.cityWageGrid.addColumn("effectiveDate", "effectiveDate", "Effective Date", "EffectiveDate", 120, null, me.cityEffectiveDate);
			me.cityWageGrid.addColumn("active", "active", "Active", "Active", 60, null, me.cityActive)
			me.cityWageGrid.addColumn("affectedNumberOfEmployees", "affectedNumberOfEmployees", "# of Employees", "Affected Number of Employees", 120, function(affectedEmployees) {
				var index = me.cityWageGrid.rows.length - 1;
				return affectedEmployees > 0 ? "<div class='employeesLink' onclick='fin.app.stateUi.actionEmployeeListItem(3, " + index + ");' >" + affectedEmployees + "</div>" : "";
			});
			me.cityWageGrid.capColumns();

			me.employeeGrid = new ui.ctl.Grid({
				id: "EmployeeGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.employeeGrid.addColumn("column13", "column13", "", "", 30, function() {
				var index = me.employeeGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"actionClickItem(this);\" " + (me.employeePayRates[index].column13 == "1" ? checked='checked' : '') + " />";
            });
			me.employeeGrid.addColumn("column6", "column6", "House Code", "House Code", 90);
			me.employeeGrid.addColumn("column8", "column8", "First Name", "First Name", null);
			me.employeeGrid.addColumn("column9", "column9", "Last Name", "Last Name", 170);
			me.employeeGrid.addColumn("column10", "column10", "Employee #", "Employee Number", 90);
			me.employeeGrid.addColumn("column11", "column11", "Current Pay Rate", "Current Pay Rate", 130, function(payRate) { return ui.cmn.text.money.format(payRate); });
			me.employeeGrid.addColumn("column12", "column12", "Updated Pay Rate", "Updated Pay Rate", 130, function(payRate) { return ui.cmn.text.money.format(payRate); });
			me.employeeGrid.addColumn("column14", "column14", "Status", "Status", 70);
			me.employeeGrid.capColumns();

			me.selectAll = new ui.ctl.Input.Check({
		        id: "SelectAll",
				changeFunction: function() { me.actionSelectAllItem(); }
		    });
			
			me.anchorExportToExcel = new ui.ctl.buttons.Sizeable({
				id: "AnchorExportToExcel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Export To Excel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionExportToExcelItem(); },
				hasHotState: true
			});
			
			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});
			
			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloseItem(); },
				hasHotState: true
			});
			
			me.stateMinimumWage.active = false;
			me.stateEffectiveDate.active = false;
			me.countyMinimumWage.active = false;
			me.countyEffectiveDate.active = false;
			me.cityMinimumWage.active = false;
			me.cityEffectiveDate.active = false;

			$("#selPageNumber").bind("change", function() { me.pageNumberChange(); });
			$("#imgPrev").bind("click", function() { me.prevEmployeePayRates(); });
			$("#imgNext").bind("click", function() { me.nextEmployeePayRates(); });
		},

		configureCommunications: function() {
			var me = this;

			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.app.state.SystemVariable,
				itemConstructorArgs: fin.app.state.systemVariableArgs,
				injectionArray: me.systemVariables
			});

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.app.state.StateType,
				itemConstructorArgs: fin.app.state.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			
			me.stateMinimumWages = [];
			me.stateMinimumWageStore = me.cache.register({
				storeId: "appStateMinimumWages",
				itemConstructor: fin.app.state.StateMinimumWage,
				itemConstructorArgs: fin.app.state.stateMinimumWageArgs,
				injectionArray: me.stateMinimumWages	
			});
			
			me.employeePayRates = [];
			me.employeePayRateStore = me.cache.register({
				storeId: "appGenericImports", //employeePayRates //appGenericImports
				itemConstructor: fin.app.state.EmployeePayRate,
				itemConstructorArgs: fin.app.state.employeePayRateArgs,
				injectionArray: me.employeePayRates
			});

			me.fileNames = [];
			me.fileNameStore = me.cache.register({
				storeId: "appFileNames",
				itemConstructor: fin.app.state.FileName,
				itemConstructorArgs: fin.app.state.fileNameArgs,
				injectionArray: me.fileNames
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
		
		systemVariablesLoaded: function(me, activeId) {

			if (me.systemVariables.length > 0)
				me.federalMinimumWage = me.systemVariables[0].variableValue;
		},
		
		stateTypesLoaded: function(me, activeId) {

			me.stateGrid.setData(me.stateTypes);
			me.stateWageGrid.setData([]);
			me.countyWageGrid.setData([]);
			me.cityWageGrid.setData([]);
			me.checkLoadCount();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number},  // The index of the data item to select
				setStatus: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;
			var index = args.index;
			var item = me.stateGrid.data[index];

			if (item == undefined) 
				return;

			if (me.stateWageGrid.activeRowIndex >= 0)
				me.stateWageGrid.body.deselect(me.stateWageGrid.activeRowIndex, true);
			if (me.countyWageGrid.activeRowIndex >= 0)
				me.countyWageGrid.body.deselect(me.countyWageGrid.activeRowIndex, true);
			if (me.cityWageGrid.activeRowIndex >= 0)
				me.cityWageGrid.body.deselect(me.cityWageGrid.activeRowIndex, true);

			if (args.setStatus)
				me.setLoadCount();
			me.stateId = item.id;
			me.stateWageGrid.setData([]);
			me.countyWageGrid.setData([]);
			me.cityWageGrid.setData([]);

			me.stateMinimumWageStore.fetch("userId:[user],stateType:" + me.stateId + ",groupType:1", me.stateMinimumWagesLoaded, me);
		},
		
		stateMinimumWagesLoaded: function(me, activeId) {

			if (me.stateMinimumWages.length == 0) {
				var item = me.stateGrid.data[me.stateGrid.activeRowIndex];
				me.stateWages = [];
				me.stateWages.push(new fin.app.state.StateMinimumWage(1, 0, me.stateId, 1, item.name, item.minimumWage));
			}
			else
				me.stateWages = me.stateMinimumWages.slice();
				
			me.stateWageGrid.setData(me.stateWages);
			me.stateMinimumWageStore.fetch("userId:[user],stateType:" + me.stateId + ",groupType:2", me.countyMinimumWagesLoaded, me);
		},
		
		countyMinimumWagesLoaded: function(me, activeId) {

			me.countyWages = me.stateMinimumWages.slice();
			me.countyWageGrid.setData(me.countyWages);
			me.stateMinimumWageStore.fetch("userId:[user],stateType:" + me.stateId + ",groupType:3", me.cityMinimumWagesLoaded, me);
		},
		
		cityMinimumWagesLoaded: function(me, activeId) {

			me.cityWages = me.stateMinimumWages.slice();
			me.cityWageGrid.setData(me.cityWages);
			if (me.loadCount > 0)
				me.checkLoadCount();
			else
				$("#pageLoading").fadeOut("slow");
		},
		
		actionEmployeeListItem: function(groupType, index) {
			var me = this;
	
			me.startPoint = 1;
			me.recordCount = 0;
			me.pageCount = 0;
			me.pageCurrent = 1;

			var stateMimimumWage = ui.cmn.text.money.format(me.stateGrid.data[me.stateGrid.activeRowIndex].minimumWage);
			var selPageNumber = $("#selPageNumber");

		    selPageNumber.empty();
			selPageNumber.append("<option value='1'>1</option>");
			selPageNumber.val(me.pageCurrent);			
			$("#spnPageInfo").html(" of 1 (0 records)");
						
			if (groupType == 1) {
				me.stateMinimumWageId = me.stateWageGrid.data[index].stateMinimumWage;
				me.recordCount = me.stateWageGrid.data[index].affectedNumberOfEmployees;
				$("#infoMessage").html("The highest rate of Federal Minimum Wage and State Minimum Wage will be considered as new pay rate.");
				$("#infoRate").html("Federal Minimum Wage is " + me.federalMinimumWage + ", State Minimum Wage is " + stateMimimumWage);
			}
			else if (groupType == 2) {
				me.stateMinimumWageId = me.countyWageGrid.data[index].stateMinimumWage;
				me.recordCount = me.countyWageGrid.data[index].affectedNumberOfEmployees;
				$("#infoMessage").html("The highest rate of Federal Minimum Wage, State Minimum Wage and County Minimum Wage will be considered as new pay rate.");
				$("#infoRate").html("Federal Minimum Wage is " + me.federalMinimumWage + ", State Minimum Wage is " + stateMimimumWage + ", County Minimum Wage is " + ui.cmn.text.money.format(me.countyWageGrid.data[index].minimumWage));
			}				
			else if (groupType == 3) {
				me.stateMinimumWageId = me.cityWageGrid.data[index].stateMinimumWage;
				me.recordCount = me.cityWageGrid.data[index].affectedNumberOfEmployees;
				$("#infoMessage").html("The highest rate of Federal Minimum Wage, State Minimum Wage and City Minimum Wage will be considered as new pay rate.");
				$("#infoRate").html("Federal Minimum Wage is " + me.federalMinimumWage + ", State Minimum Wage is " + stateMimimumWage + ", City Minimum Wage is " + ui.cmn.text.money.format(me.cityWageGrid.data[index].minimumWage));
			}				
			
			loadPopup();
			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();
			me.recordCountsLoaded();
		},
		
		recordCountsLoaded: function() {
			var me = this;
		    var selPageNumber = $("#selPageNumber");

			me.startPoint = 1;
		    me.pageCount = Math.ceil(me.recordCount / me.maximumRows);
		    me.pageCurrent = Math.ceil(me.startPoint / me.maximumRows);

		    //if we don't have records...
		    if (me.pageCount == 0) me.pageCount = 1;

		    //fill the select box
		    selPageNumber.empty();
		    for (var index = 0; index < me.pageCount; index++) {
				selPageNumber.append("<option value=\"" + (index + 1) + "\">" + (index + 1) + "</option>");
			}

			$("#spnPageInfo").html(" of " + me.pageCount + " (" + me.recordCount + " records)");
		    selPageNumber.val(me.pageCurrent);
			me.listEmployeePayRates();
		},
		
		listEmployeePayRates: function() {
			var me = this;

			$("#popupMessageToUser").text("Loading");
			$("#popupLoading").show();				
			$("#selPageNumber").val(me.pageCurrent);
			
			me.setStatus("Loading");
			me.startPoint = ((me.pageCurrent - 1) * me.maximumRows) + 1;
			me.employeePayRateStore.reset();
			me.employeePayRateStore.fetch("userId:[user],object:PayRateUpdate"
				+ ",batch:" + me.stateMinimumWageId
				+ ",startPoint:" + me.startPoint
				+ ",maximumRows:" + me.maximumRows
				, me.employeePayRatesLoaded
				, me
				);
		},
		
		employeePayRatesLoaded: function(me, activeId) { 

			me.employeeGrid.setData(me.employeePayRates);
			me.employeeGrid.setHeight(450);
			me.setStatus("Loaded");
			$("#popupLoading").hide();
		},
	
		prevEmployeePayRates: function() {
		    var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.pageCurrent--;

			if (me.pageCurrent < 1)
			    me.pageCurrent = 1;
			else				
				me.listEmployeePayRates();
		},

		nextEmployeePayRates: function() {
		    var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.pageCurrent++;

			if (me.pageCurrent > me.pageCount)
			    me.pageCurrent = me.pageCount;
			else
				me.listEmployeePayRates();
		},
		
		pageNumberChange: function() {
		    var me = this;
		    var selPageNumber = $("#selPageNumber");
		    
			if (!parent.fin.cmn.status.itemValid())
				return;

		    me.pageCurrent = Number(selPageNumber.val());
		    me.listEmployeePayRates();
		},
		
		actionSelectAllItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.modified(true);
			
			for (var index = 0; index < me.employeePayRates.length; index++) {
				$("#assignInputCheck" + index)[0].checked = me.selectAll.check.checked;
				if (me.selectAll.check.checked)
					me.employeePayRates[index].modified = (me.employeePayRates[index].column13 != "1");
				else
					me.employeePayRates[index].modified = (me.employeePayRates[index].column13 != "0");
			}
		},
		
		actionCloseItem: function() {
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup();
		},
		
		actionExportToExcelItem: function() {
			var me = this;

			$("#popupMessageToUser").text("Exporting");
			$("#popupLoading").show();
			me.setStatus("Exporting");
			me.fileNameStore.reset();
			me.fileNameStore.fetch("userId:[user],object:PayRateUpdate,batch:" + me.stateMinimumWageId, me.fileNamesLoaded, me);
		},

		fileNamesLoaded: function(me, activeId) {

			$("#popupLoading").hide();
			me.setStatus("Exported");
			
			if (me.fileNames.length == 1) {
				$("iframe")[0].contentWindow.document.getElementById("FileName").value = me.fileNames[0].fileName;
				$("iframe")[0].contentWindow.document.getElementById("DownloadButton").click();
			}
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.stateWageGrid.activeRowIndex >= 0)
				me.stateWageGrid.body.deselect(me.stateWageGrid.activeRowIndex, true);
			if (me.countyWageGrid.activeRowIndex >= 0)
				me.countyWageGrid.body.deselect(me.countyWageGrid.activeRowIndex, true);
			if (me.cityWageGrid.activeRowIndex >= 0)
				me.cityWageGrid.body.deselect(me.cityWageGrid.activeRowIndex, true);
			
			me.itemSelect(me.stateGrid.activeRowIndex);
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.stateGrid.activeRowIndex == -1)
				return;

			me.stateWageGrid.body.deselectAll();
			me.countyWageGrid.body.deselectAll();
			me.cityWageGrid.body.deselectAll();
			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			if (me.stateWageGrid.data[0].modified) {
				me.setStatus("Saving");
				$("#messageToUser").text("Saving");
				$("#pageLoading").show();

				var item = me.stateGrid.data[me.stateGrid.activeRowIndex];
				item.minimumWage = parseFloat(me.stateWageGrid.data[0].minimumWage);

				var xml = me.saveXmlBuildItem(item);
				
				// Send the object back to the server as a transaction
				me.transactionMonitor.commit({
					transactionType: "itemUpdate",
					transactionXml: xml,
					responseFunction: me.saveResponseItem,
					referenceData: { me: me, item: item	}
				});
				
				return true;
			}
			else {
				me.saveMinimunWages("");
			}
		},
		
		actionApproveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";

			if (me.selectAll.check.checked) {
				xml += '<appGenericImportPayRateApproveAll';
				xml += ' id="' + me.stateMinimumWageId + '"';				
				xml += '/>';
			}
			else {
				for (var index = 0; index < me.employeePayRates.length; index++) {
					if (me.employeePayRates[index].modified) {
						xml += '<appGenericImportPayRateApprove';
						xml += ' id="' + me.employeePayRates[index].id + '"';
						xml += ' approved="' + ($("#assignInputCheck" + index)[0].checked ? "1" : "0") + '"';
						xml += ' status="' + ($("#assignInputCheck" + index)[0].checked ? "Approved" : "") + '"';
						xml += '/>';
					}
				}
			}
			
			if (xml == "")
				return;

			me.setStatus("Saving");
			$("#popupMessageToUser").text("Approving");
			$("#popupLoading").fadeIn("slow");

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: { me: me, item: item	}
			});

			return true;
		},

		saveXmlBuildItem: function() {
			var args = ii.args(arguments, {
				item: { type: fin.app.state.StateType }
			});
			var me = this;
			var item = args.item;
			var xml = "";

			xml += '<appState';
			xml += ' id="' + item.id + '"';
			xml += ' minimumWage="' + item.minimumWage + '"';
			xml += '/>';

			return xml;
		},
		
		saveMinimunWages: function(status) {
			var me = this;
			var item = [];
			var xml = "";
			
			for (var index = 0; index < me.stateWages.length; index++) {
				if (me.stateWages[index].modified) {
					xml += '<appStateMinimumWage';
					xml += ' id="' + me.stateWages[index].stateMinimumWage + '"';
					xml += ' stateType="' + me.stateWages[index].stateType + '"';
					xml += ' groupType="' + me.stateWages[index].groupType + '"';
					xml += ' name="' + ui.cmn.text.xml.encode(me.stateWages[index].name) + '"';
					xml += ' minimumWage="' + me.stateWages[index].minimumWage + '"';
					xml += ' effectiveDate="' + me.stateWages[index].effectiveDate.toLocaleString() + '"';
					xml += ' active="' + me.stateWages[index].active + '"';
					xml += '/>';
				}				
			}

			for (var index = 0; index < me.countyWages.length; index++) {
				if (me.countyWages[index].modified) {
					xml += '<appStateMinimumWage';
					xml += ' id="' + me.countyWages[index].stateMinimumWage + '"';
					xml += ' stateType="' + me.countyWages[index].stateType + '"';
					xml += ' groupType="' + me.countyWages[index].groupType + '"';
					xml += ' name="' + ui.cmn.text.xml.encode(me.countyWages[index].name) + '"';
					xml += ' minimumWage="' + me.countyWages[index].minimumWage + '"';
					xml += ' effectiveDate="' + me.countyWages[index].effectiveDate.toLocaleString() + '"';
					xml += ' active="' + me.countyWages[index].active + '"';
					xml += '/>';
				}				
			}
			
			for (var index = 0; index < me.cityWages.length; index++) {
				if (me.cityWages[index].modified) {
					xml += '<appStateMinimumWage';
					xml += ' id="' + me.cityWages[index].stateMinimumWage + '"';
					xml += ' stateType="' + me.cityWages[index].stateType + '"';
					xml += ' groupType="' + me.cityWages[index].groupType + '"';
					xml += ' name="' + ui.cmn.text.xml.encode(me.cityWages[index].name) + '"';
					xml += ' minimumWage="' + me.cityWages[index].minimumWage + '"';
					xml += ' effectiveDate="' + me.cityWages[index].effectiveDate.toLocaleString() + '"';
					xml += ' active="' + me.cityWages[index].active + '"';
					xml += '/>';
				}				
			}

			if (xml == "") {
				me.modified(false);
				if (status == "Saved") {
					me.setStatus("Saved");
					$("#pageLoading").fadeOut("slow");
				}
				return;
			}
			else if (status == "") {
				me.setStatus("Saving");
				$("#messageToUser").text("Saving");
				$("#pageLoading").show();
			}

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseItem,
				referenceData: { me: me, item: item }
			});

			return true;
		},

		saveResponseItem: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var found = false;

			if (status == "success") {
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "appStateType":
							me.stateTypes[me.stateGrid.activeRowIndex] = item;
							me.stateGrid.body.renderRow(me.stateGrid.activeRowIndex, me.stateGrid.activeRowIndex);
							me.saveMinimunWages("Saved");
							break;
							
						case "appStateMinimumWage":
							me.modified(false);
							me.setStatus("Saved");
							me.itemSelect(me.stateGrid.activeRowIndex, false);
							found = true;
							break;
							
						case "appGenericImport":
							for (var index = 0; index < me.employeePayRates.length; index++) {
								if (me.selectAll.check.checked) {
									me.employeePayRates[index].column13 = "1";
									me.employeePayRates[index].column14 = "Approved";
								}
								else {
									me.employeePayRates[index].column13 = ($("#assignInputCheck" + index)[0].checked ? "1" : "0");
									me.employeePayRates[index].column14 = ($("#assignInputCheck" + index)[0].checked ? "Approved" : "");
								}
								me.employeePayRates[index].modified = false;
							}
							
							me.employeeGrid.setData(me.employeePayRates);
							me.modified(false);
							me.setStatus("Saved");
							found = true;							
							$("#popupLoading").fadeOut("slow");
							break
					}
					
					if (found)
						return false;
				});
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating State Minimum Wage details: " + $(args.xmlNode).attr("message"));
				$("#pageLoading").fadeOut("slow");
			}
		}
	}
});

function actionClickItem(objCheckBox) {
	var me = fin.app.stateUi;
	var allSelected = true;
	var index = 0;

	me.modified();

//	if (objCheckBox.checked) {
//		for (index = 0; index < me.employeePayRates.length; index++) {
//			if ($("#assignInputCheck" + index)[0].checked == false) {
//				allSelected = false;
//				break;
//			}
//		}
//	}
//	else
//		allSelected = false;
//	
//	me.selectAll.setValue(allSelected.toString());
	index = parseInt(objCheckBox.id.substring(objCheckBox.id.length - 1), 10);
	if (objCheckBox.checked)
		me.employeePayRates[index].modified = (me.employeePayRates[index].column13 != "1");
	else
		me.employeePayRates[index].modified = (me.employeePayRates[index].column13 != "0");
}

function loadPopup() {
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupEmployee").fadeIn("slow");
}

function hidePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupEmployee").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupEmployee").width();
	var popupHeight = $("#popupEmployee").height();

	$("#popupLoading, #popupEmployee").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.app.stateUi = new fin.app.state.UserInterface();
	fin.app.stateUi.resize();
}
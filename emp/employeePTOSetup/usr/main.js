ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.emp.employeePTOSetup.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );
ii.Style( "fin.cmn.usr.button", 9 );
ii.Style( "fin.cmn.usr.theme", 10 );
ii.Style( "fin.cmn.usr.core", 11 );
ii.Style( "fin.cmn.usr.multiselect", 12 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; }); 
}

ii.Class({
    Name: "fin.emp.employeePTOSetup.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.status = "";
			me.action = "";
			me.lastSelectedRowIndex = -1;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmployeePTO";
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
		
		authorizationProcess: function fin_emp_employeePTOSetup_UserInterface_authorizationProcess() {
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
				me.loadCount = 3;
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.ptoTypeStore.fetch("userId:[user]", me.ptoTypesLoaded, me);
				me.ptoYearStore.fetch("userId:[user]", me.ptoYearsLoaded, me);
				me.payCodeTypeStore.fetch("userId:[user]", me.payCodeTypesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			me.ptoYearShow = me.authorizer.isAuthorized(me.authorizePath + "\\PTOYears");
			me.ptoTypeShow = me.authorizer.isAuthorized(me.authorizePath + "\\PTOTypes");
			me.ptoPlanShow = me.authorizer.isAuthorized(me.authorizePath + "\\PTOPlans");
			me.ptoAssignmentShow = me.authorizer.isAuthorized(me.authorizePath + "\\PTOAssignments");
			me.ptoDayShow = me.authorizer.isAuthorized(me.authorizePath + "\\PTODays");

			if (!me.ptoYearShow)
				$("#ptoYearAction").hide();
			if (!me.ptoTypeShow)
				$("#ptoTypeAction").hide();				
			if (!me.ptoPlanShow)
				$("#ptoPlanAction").hide();
			if (!me.ptoAssignmentShow)
				$("#ptoAssignmentAction").hide();
			if (!me.ptoDayShow)
				$("#ptoDayAction").hide();
				
			if (me.ptoYearShow)
				me.actionMenuItem("PTO Years");
			else if (me.ptoTypeShow)
				me.actionMenuItem("PTO Types");
			else if (me.ptoPlanShow)
				me.actionMenuItem("PTO Plans");
			else if (me.ptoAssignmentShow)
				me.actionMenuItem("PTO Assignments");
			else if (me.ptoDayShow)
				me.actionMenuItem("PTO Days");
		},
		
		sessionLoaded: function fin_emp_employeePTOSetup_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.employeePTOSetupUi;

			me.ptoYearGrid.setHeight($(window).height() - 78);
			me.ptoTypeGrid.setHeight($(window).height() - 78);
			me.ptoPlanGrid.setHeight($(window).height() - 115);
			me.ptoAssignmentGrid.setHeight($(window).height() - 155);
			me.employeeGrid.setHeight($(window).height() - 115);
			me.ptoDaysGrid.setHeight($(window).height() - 165);

			if (me.action == "PTO Years" || me.action == "PTO Types")
				$("#ContainerArea").height($(window).height() - 123);
			else if (me.action == "PTO Assignments")
				$("#ContainerArea").height($(window).height() - 127);
			else
				$("#ContainerArea").height($(window).height() - 160);
		},

		defineFormControls: function() {
			var me = this;
				
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
				
			me.actionMenu
				.addAction({
					id: "ptoYearAction",
					brief: "PTO Years",
					title: "To view or modify the PTO year information.",
					actionFunction: function() { me.actionMenuItem("PTO Years"); }
				})
				.addAction({
					id: "ptoTypeAction",
					brief: "PTO Types",
					title: "To view or modify the PTO Type and Pay Codes association.",
					actionFunction: function() { me.actionMenuItem("PTO Types"); }
				})
				.addAction({
					id: "ptoPlanAction",
					brief: "PTO Plans",
					title: "To view or modify the PTO plan information.",
					actionFunction: function() { me.actionMenuItem("PTO Plans"); }
				})
				.addAction({
					id: "ptoAssignmentAction",
					brief: "PTO Assignments",
					title: "To view or modify the PTO assignments.",
					actionFunction: function() { me.actionMenuItem("PTO Assignments"); }
				})
				.addAction({
					id: "ptoDayAction",
					brief: "PTO Days",
					title: "To view or modify the PTO days.",
					actionFunction: function() { me.actionMenuItem("PTO Days"); }
				})
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
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
			
			me.anchorClone = new ui.ctl.buttons.Sizeable({
				id: "AnchorClone",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Clone&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloneItem(); },
				hasHotState: true
			});

			me.ptoYearSearch = new ui.ctl.Input.DropDown.Filtered({
		        id: "PTOYearSearch",
				formatFunction: function(type) { return type.name; }
		    });
			
			me.ptoYearSearch.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				
	
				if (me.ptoYearSearch.indexSelected == -1)
					this.setInvalid("Please select the correct Year.");
			});
			
			me.ptoYearGrid = new ui.ctl.Grid({
				id: "PTOYearGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemYearSelect(index); },
				validationFunction: function() {
					if (me.status != "New") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.ptoYearGrid.addColumn("name", "name", "PTO Year", "PTO Year", null);
			me.ptoYearGrid.capColumns();

			me.ptoYear = new ui.ctl.Input.Text({
		        id: "PTOYear",
		        maxLength: 4,
				changeFunction: function() { me.modified(); }
		    });
			
			me.ptoYear.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				if (me.ptoYear.getValue() == "") 
					return;

				if (!(/^\d{4}$/.test(me.ptoYear.getValue()))) {
					this.setInvalid("Please enter valid year.");
				}
			});
			
			me.ptoTypeGrid = new ui.ctl.Grid({
				id: "PTOTypeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemPTOTypeSelect(index); },
				validationFunction: function() {
					if (me.status != "New")
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.ptoTypeGrid.addColumn("name", "name", "PTO Type", "PTO Type", null);
			me.ptoTypeGrid.capColumns();
			
			$("#PayCodeType").multiselect({
				minWidth: 300
				, header: false
				, noneSelectedText: ""
				, selectedList: 4
				, click: function() { me.modified(true); }
				, selectedText: function(selected, total, list) {
					var selectedTitle = "";
					for (var index =0; index < list.length; index++) {
						var title = list[index].title.substring(list[index].title.indexOf("-") + 2);
						selectedTitle += (selectedTitle == "" ? title : ", " + title);
					}
					return selectedTitle;
				}
			});
			
			me.ptoPlanGrid = new ui.ctl.Grid({
				id: "PTOPlanGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemPlanSelect(index); },
				validationFunction: function() {
					if (me.status != "New") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.ptoPlanGrid.addColumn("title", "title", "Plan Name", "Plan Name", null);
			me.ptoPlanGrid.addColumn("ptoType", "ptoType", "PTO Type", "PTO Type", 150, function( type ) { return type.name; });
			me.ptoPlanGrid.capColumns();
			
			me.planName = new ui.ctl.Input.Text({
		        id: "PlanName",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });
			
			me.planName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.ptoType = new ui.ctl.Input.DropDown.Filtered({
		        id: "PTOType",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.ptoType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				

				if ((this.focused || this.touched) && me.ptoType.indexSelected == -1)
					this.setInvalid("Please select the correct PTO Type.");
			});
			
			me.ptoPlanYear = new ui.ctl.Input.DropDown.Filtered({
		        id: "PTOPlanYear",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.ptoPlanYear.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				
	
				if ((this.focused || this.touched) && me.ptoPlanYear.indexSelected == -1)
					this.setInvalid("Please select the correct Year.");
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
					
					if (me.ptoPlanGrid.activeRowIndex != -1) {
						var startDate = new Date(me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].startDate);
						if (ui.cmn.text.date.format(startDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}

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

					if (me.ptoPlanGrid.activeRowIndex != -1) {
						var endDate = new Date(me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].endDate);
						if (ui.cmn.text.date.format(endDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}

					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");

					if (new Date(enteredText) < new Date(me.startDate.text.value)) 
						this.setInvalid("The End Date should not be less than Start Date.");
				});
				
			me.planDays = new ui.ctl.Input.Text({
		        id: "PlanDays",
		        maxLength: 2,
				changeFunction: function() { me.modified(); }
		    });

			me.planDays.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

				if (me.planDays.getValue() == "") 
					return;

				if (!(/^\d{1,2}$/.test(me.planDays.getValue()))) {
					this.setInvalid("Please enter valid plan days.");
				}
			});

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				changeFunction: function() { me.modified(); }
		    });

			me.ptoPlanYearFrom = new ui.ctl.Input.DropDown.Filtered({
		        id: "PTOPlanYearFrom",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.ptoPlanYearFrom.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				

				if ((this.focused || this.touched) && me.ptoPlanYearFrom.indexSelected == -1)
					this.setInvalid("Please select the correct Year.");
			});

			me.ptoPlanYearTo = new ui.ctl.Input.DropDown.Filtered({
		        id: "PTOPlanYearTo",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });

			me.ptoPlanYearTo.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				

				if ((this.focused || this.touched) && me.ptoPlanYearTo.indexSelected == -1)
					this.setInvalid("Please select the correct Year.");
			});

			me.ptoAssignmentGrid = new ui.ctl.Grid({
				id: "PTOAssignmentGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.ptoAssignmentGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.ptoAssignmentGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.ptoAssignmentGrid.addColumn("jobTitle", "jobTitle", "Job Title", "Job Title", null);
			me.ptoAssignmentGrid.capColumns();
			
			me.employeeGrid = new ui.ctl.Grid({
				id: "EmployeeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemEmployeeSelect(index); },
				validationFunction: function() {
					if (me.status != "New") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});

			me.employeeGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.employeeGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.employeeGrid.addColumn("jobTitle", "jobTitle", "Job Title", "Job Title", null);
			me.employeeGrid.capColumns();

			me.ptoDaysGrid = new ui.ctl.Grid({
				id: "PTODaysGrid",
				appendToId: "divForm",
				allowAdds: true,
				createNewFunction: fin.emp.employeePTOSetup.PTODay,
				selectFunction: function(index) { 
					if (me.ptoDaysGrid.data[index] != undefined)
						me.ptoDaysGrid.data[index].modified = true; 
				}
			});

			me.daysPTOType = new ui.ctl.Input.DropDown.Filtered({
		        id: "DaysPTOType",
				appendToId: "PTODaysGridControlHolder",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });	
			
			me.daysPTOType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {				
	
				if (me.daysPTOType.indexSelected == -1)
					this.setInvalid("Please select the correct PTO Type.");
			});
			
			me.ptoDate = new ui.ctl.Input.Date({
		        id: "PTODate",
				appendToId: "PTODaysGridControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.ptoDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.ptoDate.text.value;
					
					if (enteredText == "") 
						return;

					if (this.focused || this.touched)
						me.modified();

					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.ptoDaysGrid.addColumn("ptoType", "ptoType", "PTO Type", "PTO Type", null, function( type ) { return type.name; }, me.daysPTOType);
			me.ptoDaysGrid.addColumn("ptoDate", "ptoDate", "PTO Date", "PTO Date", 200, function( type ) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }, me.ptoDate);
			me.ptoDaysGrid.capColumns();

			me.unassignedEmployeeGrid = new ui.ctl.Grid({
				id: "UnassignedEmployeeGrid",
				appendToId: "divForm",
				allowAdds: false				
			});
						
			me.unassignedEmployeeGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.unassignedEmployeeGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.employeePTOSetupUi.actionClickItem(this);\"/>";
            });
			me.unassignedEmployeeGrid.addColumn("firstName", "firstName", "First Name", "First Name", 150);
			me.unassignedEmployeeGrid.addColumn("lastName", "lastName", "Last Name", "Last Name", 150);
			me.unassignedEmployeeGrid.addColumn("jobTitle", "jobTitle", "Job Title", "Job Title", null);
			me.unassignedEmployeeGrid.capColumns();

			me.selectAll = new ui.ctl.Input.Check({
		        id: "SelectAll",
				changeFunction: function() { me.actionSelectAllItem(); }
		    });
			
			me.anchorOk = new ui.ctl.buttons.Sizeable({
				id: "AnchorOk",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});	
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});			
			
			$("#imgAddEmployees").bind("click", function() { me.actionAddItem(); });
			$("#imgRemoveEmployees").bind("click", function() { me.actionRemoveItem(); });
		},

		configureCommunications: function fin_emp_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.emp.employeePTOSetup.HirNode,
				itemConstructorArgs: fin.emp.employeePTOSetup.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.emp.employeePTOSetup.HouseCode,
				itemConstructorArgs: fin.emp.employeePTOSetup.houseCodeArgs,
				injectionArray: me.houseCodes			
			});

			me.ptoTypes = [];
			me.ptoTypeStore = me.cache.register({
				storeId: "ptoTypes",
				itemConstructor: fin.emp.employeePTOSetup.PTOType,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoTypeArgs,
				injectionArray: me.ptoTypes
			});

			me.ptoYears = [];
			me.ptoYearStore = me.cache.register({
				storeId: "ptoYears",
				itemConstructor: fin.emp.employeePTOSetup.PTOYear,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoYearArgs,
				injectionArray: me.ptoYears
			});

			me.ptoEmployees = [];
			me.ptoEmployeeStore = me.cache.register({
				storeId: "ptoEmployees",
				itemConstructor: fin.emp.employeePTOSetup.PTOEmployee,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoEmployeeArgs,
				injectionArray: me.ptoEmployees
			});

			me.ptoPlans = [];
			me.ptoPlanStore = me.cache.register({
				storeId: "ptoPlans",
				itemConstructor: fin.emp.employeePTOSetup.PTOPlan,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoPlanArgs,
				injectionArray: me.ptoPlans,
				lookupSpec: { ptoType: me.ptoTypes, ptoYear: me.ptoYears }
			});

			me.ptoAssignments = [];
			me.ptoAssignmentStore = me.cache.register({
				storeId: "ptoAssignments",
				itemConstructor: fin.emp.employeePTOSetup.PTOAssignment,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoAssignmentArgs,
				injectionArray: me.ptoAssignments
			});

			me.ptoDays = [];
			me.ptoDayStore = me.cache.register({
				storeId: "ptoDays",
				itemConstructor: fin.emp.employeePTOSetup.PTODay,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoDayArgs,
				injectionArray: me.ptoDays,
				lookupSpec: { ptoType: me.ptoTypes }
			});

			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.emp.employeePTOSetup.PayCodeType,
				itemConstructorArgs: fin.emp.employeePTOSetup.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});
			
			me.ptoTypePayCodes = [];
			me.ptoTypePayCodeStore = me.cache.register({
				storeId: "ptoTypePayCodes",
				itemConstructor: fin.emp.employeePTOSetup.PTOTypePayCode,
				itemConstructorArgs: fin.emp.employeePTOSetup.ptoTypePayCodeArgs,
				injectionArray: me.ptoTypePayCodes
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

			me.ptoYearSearch.resizeText();
			me.ptoYear.resizeText();
			me.planName.resizeText();
			me.ptoType.resizeText();
			me.ptoPlanYear.resizeText();
			me.startDate.resizeText();
			me.endDate.resizeText();
			me.planDays.resizeText();
			me.ptoPlanYearFrom.resizeText();
			me.ptoPlanYearTo.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();

			if (me.action == "PTO Years") {
				me.ptoYear.setValue("");
				me.ptoYearGrid.body.deselectAll();
			}
			else if (me.action == "PTO Types") {
				me.ptoTypeGrid.body.deselectAll();
				$("#PayCodeType").multiselect("uncheckAll");
			}
			else if (me.action == "PTO Plans") {
				me.planName.setValue("");
				me.ptoType.valid = true;
				me.ptoType.updateStatus();
				me.ptoType.reset();
				me.ptoPlanYear.valid = true;
				me.ptoPlanYear.updateStatus();
				me.ptoPlanYear.reset();
				me.startDate.setValue("");
				me.endDate.setValue("");
				me.planDays.setValue("");
				me.active.setValue("true");
				me.ptoPlanGrid.body.deselectAll();
			}
			else if (me.action == "PTO Assignments") {
				me.ptoAssignmentGrid.setData([]);
			}
			else if (me.action == "PTO Days") {
				me.employeeGrid.body.deselectAll();
				if (me.ptoDaysGrid.activeRowIndex != -1)
					me.ptoDaysGrid.body.deselect(me.ptoDaysGrid.activeRowIndex, true);
				me.ptoDaysGrid.setData([]);
			}
		},

		actionMenuItem: function(section) {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			me.lastSelectedRowIndex = -1;
			me.action = section;
			me.setStatus("Normal");
			$("#header").html(section);
			$("#PTOYearContainerLeft").hide();
			$("#PTOTypeContainerLeft").hide();
			$("#PTOPlanContainerLeft").hide();
			$("#PTOAssignmentContainerLeft").hide();
			$("#PTODaysContainerLeft").hide();
			$("#PTOYearContainerRight").hide();
			$("#PTOTypeContainerRight").hide();
			$("#PTOPlanContainerRight").hide();
			$("#PTOAssignmentContainerRight").hide();
			$("#PTODaysContainerRight").hide();
			$("#AnchorClone").hide();
			$("#AnchorNew").show();
			$("#AnchorSave").show();
			$("#AnchorUndo").show();
			
			if (section == "PTO Years") {
				$("#HouseCode").hide();
				$("#PTOYearContainerLeft").show();
				$("#PTOYearContainerRight").show();
			}
			else if (section == "PTO Types") {
				$("#AnchorNew").hide();
				$("#HouseCode").hide();
				$("#PTOTypeContainerLeft").show();
				$("#PTOTypeContainerRight").show();
			}
			else if (section == "PTO Plans") {
				$("#HouseCode").show();
				$("#SearchTemplate").show();
				$("#PTOPlanContainerLeft").show();
				$("#PTOPlanContainerRight").show();
				$("#AnchorClone").show();
				me.loadPlans(true);
			}
			else if (section == "PTO Assignments") {
				$("#AnchorNew").hide();
				$("#AnchorSave").hide();
				$("#AnchorUndo").hide();
				$("#HouseCode").show();
				$("#SearchTemplate").show();
				$("#PTOPlanContainerLeft").show();
				$("#PTOAssignmentContainerRight").show();
				me.loadPlans(true);
			}
			else if (section == "PTO Days") {
				$("#SearchTemplate").hide();
				$("#AnchorNew").hide();
				$("#HouseCode").show();
				$("#PTODaysContainerLeft").show();
				$("#PTODaysContainerRight").show();
				me.loadEmployees();
			}
			
			me.resetControls();
			me.resizeControls();
		},
		
		actionSearchItem: function(me, activeId) {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.actionMenuItem(me.action);
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
			me.actionMenuItem(me.action);
		},

		ptoTypesLoaded: function(me, activeId) {

			me.checkLoadCount();
			me.ptoTypeGrid.setData(me.ptoTypes);
			me.ptoType.setData(me.ptoTypes);
			me.daysPTOType.setData(me.ptoTypes);
		},
		
		ptoYearsLoaded: function(me, activeId) {

			me.ptoYearSearch.setData(me.ptoYears);
			me.ptoYearGrid.setData(me.ptoYears);
			me.ptoPlanYear.setData(me.ptoYears);
			me.ptoPlanYearFrom.setData(me.ptoYears);
			me.ptoPlanYearTo.setData(me.ptoYears);
			me.resizeControls();
			me.checkLoadCount();

			if (me.ptoYears.length > 0)
				me.ptoYearSearch.select(0, me.ptoYearSearch.focused);
		},
		
		payCodeTypesLoaded: function(me, activeId) {
			
			$("#PayCodeType").html("");
			for (var index = 0; index < me.payCodeTypes.length; index++) {
				$("#PayCodeType").append("<option title='" + me.payCodeTypes[index].name + "' value='" + me.payCodeTypes[index].id + "'>" + me.payCodeTypes[index].brief + " - " + me.payCodeTypes[index].name + "</option>");
			}
			$("#PayCodeType").multiselect("refresh");
			me.checkLoadCount();
		},
		
		loadEmployees: function() {
			var me = this;

			me.setLoadCount();
			me.ptoEmployeeStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",ptoPlanId:-1", me.ptoEmployeesLoaded, me);
		},
		
		ptoEmployeesLoaded: function(me, activeId) {

			me.employeeGrid.setData(me.ptoEmployees);
			me.checkLoadCount();
		},
		
		loadPlans: function(showLoading) {
			var me = this;

			if (me.ptoYearSearch.indexSelected == -1)
				return;
			
			if (showLoading)
				me.setLoadCount();
			me.ptoPlanStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",ptoYearId:" + me.ptoYears[me.ptoYearSearch.indexSelected].id, me.ptoPlansLoaded, me);
		},
		
		ptoPlansLoaded: function(me, activeId) {

			me.ptoPlanGrid.setData(me.ptoPlans);
			me.checkLoadCount();
		},

		ptoDaysLoaded: function(me, activeId) {

			me.ptoDaysGrid.setData(me.ptoDays);
			me.checkLoadCount();
		},
		
		itemYearSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			me.status = "";
			me.setStatus("Normal");

			if (me.ptoYearGrid.data[index] != undefined) {
				me.lastSelectedRowIndex = me.ptoYearGrid.activeRowIndex;
				me.ptoYear.setValue(me.ptoYearGrid.data[index].name);
			}
		},
		
		itemPTOTypeSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			me.status = "";

			if (me.ptoTypeGrid.data[index] != undefined) {
				me.lastSelectedRowIndex = me.ptoTypeGrid.activeRowIndex;
				me.setLoadCount();
				me.ptoTypePayCodeStore.fetch("userId:[user],ptoTypeId:" + me.ptoTypeGrid.data[index].id, me.ptoTypePayCodesLoaded, me);
			}
		},
		
		ptoTypePayCodesLoaded: function(me, activeId) {

			me.setPayCodes();
			me.checkLoadCount();
		},
		
		setPayCodes: function() {
			var me = this;
			var payCodesTemp = [];

			for (var index = 0; index < me.ptoTypePayCodes.length; index++) {
				payCodesTemp.push(me.ptoTypePayCodes[index].payCodeId.toString());
			}
			$("#PayCodeType").multiselect("uncheckAll");
			$("#PayCodeType").multiselect("widget").find(":checkbox").each(function() {
		 		if ($.inArray(this.value, payCodesTemp) >= 0) {
		 			this.click();
		 		}
			});
			me.modified(false);
		},

		itemPlanSelect: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			me.status = "";
			me.setStatus("Normal");

			if (me.ptoPlanGrid.data[index] != undefined) {
				if (me.action == "PTO Plans") {
					$("#PlanTemplate").show();
					$("#CloneTemplate").hide();
					me.lastSelectedRowIndex = me.ptoPlanGrid.activeRowIndex;
					me.planName.setValue(me.ptoPlanGrid.data[index].title);
					
					var itemIndex = ii.ajax.util.findIndexById(me.ptoPlanGrid.data[index].ptoType.id.toString(), me.ptoTypes);
					if (itemIndex >= 0 && itemIndex != undefined) 
						me.ptoType.select(itemIndex, me.ptoType.focused);
					
					itemIndex = ii.ajax.util.findIndexById(me.ptoPlanGrid.data[index].ptoYear.id.toString(), me.ptoYears);
					if (itemIndex >= 0 && itemIndex != undefined) 
						me.ptoPlanYear.select(itemIndex, me.ptoPlanYear.focused);
					
					me.startDate.setValue(me.ptoPlanGrid.data[index].startDate);
					me.endDate.setValue(me.ptoPlanGrid.data[index].endDate);
					me.planDays.setValue(me.ptoPlanGrid.data[index].days);
					me.active.setValue(me.ptoPlanGrid.data[index].active.toString());
				}
				else if (me.action == "PTO Assignments") {
					me.setLoadCount();
					me.loadPTOAssignments();
				}
			}
		},

		loadPTOAssignments: function() {
			var me = this;

			me.ptoAssignmentStore.fetch("userId:[user],planId:" + me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].id, me.ptoAssignmentsLoaded, me);
		},
		
		ptoAssignmentsLoaded: function(me, activeId) {

			me.ptoAssignmentGrid.setData(me.ptoAssignments);
			me.checkLoadCount();
		},

		itemEmployeeSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;

			if (me.ptoDaysGrid.activeRowIndex != -1)
				me.ptoDaysGrid.body.deselect(me.ptoDaysGrid.activeRowIndex, true);
			me.lastSelectedRowIndex = index;
			me.status = "";
			me.setLoadCount();
			me.ptoDayStore.fetch("userId:[user],employeeId:" + me.employeeGrid.data[index].id, me.ptoDaysLoaded, me);
		},
		
		actionAddItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.ptoPlanGrid.activeRowIndex == -1)
				return;

			loadPopup();
			me.selectAll.setValue("false");
			me.setStatus("Loading");
			me.ptoEmployeeStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",ptoPlanId:" + me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].id, me.ptoUnassignedEmployeesLoaded, me);
		},
		
		ptoUnassignedEmployeesLoaded: function(me, activeId) {

			me.setStatus("Normal");
			me.unassignedEmployeeGrid.setData(me.ptoEmployees);
			me.unassignedEmployeeGrid.setHeight($("#popupEmployee").height() - 120);
			$("#popupLoading").fadeOut("slow");
		},
		
		actionRemoveItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.ptoAssignmentGrid.activeRowIndex == -1)
				return;
		
			me.status = "Delete";
			me.actionSaveItem();
		},
		
		actionClickItem: function(objCheckBox) {
			var me = this;
			var allSelected = true;
		
			if (objCheckBox.checked) {
				for (var index = 0; index < me.ptoEmployees.length; index++) {
					if ($("#assignInputCheck" + index)[0].checked == false) {
						allSelected = false;
						break;
					}
				}
			}
			else
				allSelected = false;
		
			me.modified(true);
			me.selectAll.setValue(allSelected.toString());
		},

		actionSelectAllItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.modified(true);

			for (var index = 0; index < me.ptoEmployees.length; index++) {
				$("#assignInputCheck" + index)[0].checked = me.selectAll.check.checked;
			}
		},
		
		actionCancelItem: function() {
			var me = this;
			var index = -1;			

			if (!parent.fin.cmn.status.itemValid())
				return;

			hidePopup();
			me.setStatus("Loaded");
		},
		
		actionNewItem: function(me, activeId) {
			var args = ii.args(arguments, {});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;

			if (me.action == "PTO Years") {
				me.ptoYearGrid.body.deselectAll();
				me.ptoYear.setValue("");
			}
			else if (me.action == "PTO Plans") {
				$("#PlanTemplate").show();
				$("#CloneTemplate").hide();
				me.ptoPlanGrid.body.deselectAll();
				me.resetControls();
			}
			me.status = "New";
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;
			
			if (me.action == "PTO Years") {
				if (me.lastSelectedRowIndex >= 0) {
					me.ptoYearGrid.body.select(me.lastSelectedRowIndex);
					me.itemYearSelect(me.lastSelectedRowIndex);
				}
			}
			else if (me.action == "PTO Types") {
				if (me.lastSelectedRowIndex >= 0) {
					me.setPayCodes();
				}
			}
			else if (me.action == "PTO Plans") {
				$("#PlanTemplate").show();
				$("#CloneTemplate").hide();
				
				if (me.lastSelectedRowIndex >= 0) {
					me.ptoPlanGrid.body.select(me.lastSelectedRowIndex);
					me.itemPlanSelect(me.lastSelectedRowIndex);
				}
			}
			else if (me.action == "PTO Days") {
				if (me.lastSelectedRowIndex >= 0) {
					if (me.ptoDaysGrid.activeRowIndex != -1)
						me.ptoDaysGrid.body.deselect(me.ptoDaysGrid.activeRowIndex, true);
					me.itemEmployeeSelect(me.lastSelectedRowIndex);
				}
			}

			me.status = "";
			me.setStatus("Loaded");
		},
		
		actionCloneItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#PlanTemplate").hide();
			$("#CloneTemplate").show();
			me.ptoPlanGrid.body.deselectAll();
			me.ptoPlanYearFrom.reset();
			me.ptoPlanYearTo.reset();
			me.ptoPlanYearFrom.resizeText();
			me.ptoPlanYearTo.resizeText();
			me.status = "Clone";
		},

		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var item = [];
			var xml = "";
			
			// Check to see if the data entered is valid
			me.validator.forceBlur();
			me.validator.queryValidity(true);

			if (me.action == "PTO Years") {
				if (!me.ptoYear.valid) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				if (me.ptoYearGrid.activeRowIndex == -1)
					me.status = "New";
				item = new fin.emp.employeePTOSetup.PTOYear(
					(me.status == "New" ? 0 : me.ptoYearGrid.data[me.ptoYearGrid.activeRowIndex].id)
					, me.ptoYear.getValue()			
				);
			}
			else if (me.action == "PTO Plans") {
				if (me.status == "Clone") {
					if (!me.ptoPlanYearFrom.valid || !me.ptoPlanYearTo.valid) {
						alert("In order to save, the errors on the page must be corrected.");
						return false;
					}
				}
				else {
					if (!me.ptoPlanYear.valid || !me.ptoType.valid || !me.planName.valid || !me.startDate.valid || !me.endDate.valid || !me.planDays.valid) {
						alert("In order to save, the errors on the page must be corrected.");
						return false;
					}
	
					if (me.ptoPlanGrid.activeRowIndex == -1)
						me.status = "New";

					for (var index = 0; index < me.ptoPlans.length; index++) {
						if (me.status == "New" || index != me.ptoPlanGrid.activeRowIndex) {
							if (me.ptoPlans[index].title == me.planName.getValue()) {
								alert("The Plan Name [" + me.planName.getValue() + "] already exists. Please enter unique Plan Name and Save again.");
								return false;
							}
						}
					}

					item = new fin.emp.employeePTOSetup.PTOPlan(
						(me.status == "New" ? 0 : me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].id)
						, parent.fin.appUI.houseCodeId
						, new fin.emp.employeePTOSetup.PTOYear(me.ptoYears[me.ptoPlanYear.indexSelected].id)
						, new fin.emp.employeePTOSetup.PTOType(me.ptoTypes[me.ptoType.indexSelected].id, me.ptoTypes[me.ptoType.indexSelected].name)
						, me.planName.getValue()
						, me.startDate.lastBlurValue
						, me.endDate.lastBlurValue
						, me.planDays.getValue()
						, me.active.check.checked
					);
				}
			}
			else if (me.action == "PTO Days") {
				me.ptoDaysGrid.body.deselectAll();

				// Check to see if the data entered is valid
				if (!me.validator.queryValidity(true) && me.ptoDaysGrid.activeRowIndex >= 0) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				item = new fin.emp.employeePTOSetup.PTODay(
					0	
				);
			}
			else if (me.action == "PTO Assignments") {
				hidePopup();
			}
			
			if (me.action == "PTO Years") {
				xml += '<ptoYear';
				xml += ' id="' + item.id + '"';
				xml += ' title="' + item.name + '"';
				xml += ' displayOrder="1"';
				xml += ' active="true"';
				xml += '/>';
			}
			else if (me.action == "PTO Types") {
				var payCodes = $("#PayCodeType").val();

				for (var index = 0; index < me.ptoTypePayCodes.length; index++) {
					if ($.inArray(me.ptoTypePayCodes[index].payCodeId.toString(), payCodes) == -1)
						me.ptoTypePayCodes[index].status = "remove";
					xml += '<ptoTypePayCode';
					xml += ' id="' + me.ptoTypePayCodes[index].id + '"';
					xml += ' ptoTypeId="' + me.ptoTypePayCodes[index].ptoTypeId + '"';
					xml += ' payCodeId="' + me.ptoTypePayCodes[index].payCodeId + '"';
					xml += ' add="' + (($.inArray(me.ptoTypePayCodes[index].payCodeId.toString(), payCodes) > -1) ? "true" : "false") + '"';
					xml += '/>';
				}

				if (payCodes != null) {
					for (var index = 0; index < payCodes.length; index++) {
						var found = false;
						for (var iIndex = 0; iIndex < me.ptoTypePayCodes.length; iIndex++) {
							if (me.ptoTypePayCodes[iIndex].payCodeId.toString() == payCodes[index]) {
								found = true;
								break;
							}
						}
	
						if (!found) {
							xml += '<ptoTypePayCode';
							xml += ' id="0"';
							xml += ' ptoTypeId="' + me.ptoTypeGrid.data[me.ptoTypeGrid.activeRowIndex].id + '"';
							xml += ' payCodeId="' + payCodes[index] + '"';
							xml += ' add="true"';
							xml += '/>';
						}
					}
				}
			}
			else if (me.action == "PTO Plans") {
				if (me.status == "Clone") {
					xml += '<ptoPlanClone';
					xml += ' houseCodeId="' + parent.fin.appUI.houseCodeId + '"';
					xml += ' ptoYearIdFrom="' + me.ptoYears[me.ptoPlanYearFrom.indexSelected].id + '"';
					xml += ' ptoYearIdTo="' + me.ptoYears[me.ptoPlanYearTo.indexSelected].id + '"';
					xml += '/>';
				}
				else {
					xml += '<ptoPlan';
					xml += ' id="' + item.id + '"';
					xml += ' houseCodeId="' + item.houseCodeId + '"';
					xml += ' ptoYearId="' + item.ptoYear.id + '"';
					xml += ' ptoTypeId="' + item.ptoType.id + '"';
					xml += ' title="' + item.title + '"';
					xml += ' startDate="' + item.startDate + '"';
					xml += ' endDate="' + item.endDate + '"';
					xml += ' days="' + item.days + '"';
					xml += ' active="' + item.active + '"';
					xml += '/>';
				}
			}
			else if (me.action == "PTO Days") {
				for (var index = 0; index < me.ptoDays.length; index++) {
					if (me.ptoDays[index].modified || me.ptoDays[index].id == 0) {
						me.ptoDays[index].modified = true;
						xml += '<ptoDay';
						xml += ' id="' + me.ptoDays[index].id + '"';
						xml += ' employeeId="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].id + '"';
						xml += ' ptoTypeId="' + me.ptoDays[index].ptoType.id + '"';
						xml += ' ptoDate="' + ui.cmn.text.date.format(me.ptoDays[index].ptoDate, "mm/dd/yyyy") + '"';
						xml += '/>';
					}
				}
			}
			else if (me.action == "PTO Assignments") {
				if (me.status == "Delete") {
					xml += '<ptoAssignmentDelete';
					xml += ' id="' + me.ptoAssignments[me.ptoAssignmentGrid.activeRowIndex].id + '"';
					xml += '/>';
				}
				else {
					for (var index = 0; index < me.ptoEmployees.length; index++) {
						if ($("#assignInputCheck" + index)[0].checked) {
							xml += '<ptoAssignment';
							xml += ' employeeId="' + me.ptoEmployees[index].id + '"';
							xml += ' ptoPlanId="' + me.ptoPlanGrid.data[me.ptoPlanGrid.activeRowIndex].id + '"';
							xml += '/>';
						}
					}
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
						case "empPTOYear":
							if (me.status == "New") {
								item.id = parseInt($(this).attr("id"), 10);
								me.ptoYears.unshift(item);
								me.lastSelectedRowIndex = 0;
							}
							else {
								me.ptoYears[me.lastSelectedRowIndex] = item;
								me.ptoYearGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							me.ptoYearGrid.setData(me.ptoYears);
							me.ptoYearGrid.body.select(me.lastSelectedRowIndex);
							break;
							
						case "empPTOPlan":
							if (me.status == "Clone") {
								me.loadPlans(false);
							}
							else {
								if (me.status == "New") {
									item.id = parseInt($(this).attr("id"), 10);
									me.ptoPlans.push(item);
									me.lastSelectedRowIndex = me.ptoPlans.length - 1;
								}
								else {
									me.ptoPlans[me.lastSelectedRowIndex] = item;
									me.ptoPlanGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								}
	
								me.ptoPlanGrid.setData(me.ptoPlans);
								me.ptoPlanGrid.body.select(me.lastSelectedRowIndex);
							}
							break;
							
						case "empPTODay":
							if (me.action == "PTO Days") {
								var id = parseInt($(this).attr("id"), 10);

								for (var index = 0; index < me.ptoDaysGrid.data.length; index++) {
									if (me.ptoDaysGrid.data[index].modified) {
										if (me.ptoDaysGrid.data[index].id == 0)
											me.ptoDaysGrid.data[index].id = id;
										me.ptoDaysGrid.data[index].modified = false;
										break;
									}
								}
							}
							break;

						case "empPTOAssignment":
							if (me.status == "Delete") {
								me.ptoAssignments.splice(me.ptoAssignmentGrid.activeRowIndex, 1);
								me.ptoAssignmentGrid.setData(me.ptoAssignments);
							}
							else {
								me.loadPTOAssignments();
							}
							break;
							
						case "empPTOTypePayCode":
							var id = parseInt($(this).attr("id"), 10);
							var payCodeId = parseInt($(this).attr("payCodeId"), 10);
							var itemIndex = ii.ajax.util.findIndexById(id.toString(), me.ptoTypePayCodes);
							
							if (itemIndex == undefined)
								me.ptoTypePayCodes.push(new fin.emp.employeePTOSetup.PTOTypePayCode(id, me.ptoTypeGrid.data[me.ptoTypeGrid.activeRowIndex].id, payCodeId));
							else if (itemIndex != undefined && me.ptoTypePayCodes[itemIndex].status == "remove")
								me.ptoTypePayCodes.splice(itemIndex, 1);
							break;
					}
				});
				
				me.status = "";
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Employee PTO details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function loadPopup() {
	
	centerPopup();
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupEmployee").fadeIn("slow");
	$("#popupLoading").fadeIn("slow");
}

function hidePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupEmployee").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = windowWidth - 100;
	var popupHeight = windowHeight - 100;
	
	$("#popupLoading, #popupEmployee").css({
		"width": popupWidth,
		"height": popupHeight,
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.employeePTOSetupUi = new fin.emp.employeePTOSetup.UserInterface();
			fin.employeePTOSetupUi.resize();
			fin.houseCodeSearchUi = fin.employeePTOSetupUi;
		}
	}, 100);
}
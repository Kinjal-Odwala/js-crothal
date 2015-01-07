ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.hierarchy" );
ii.Import( "fin.cmn.usr.treeView" );
ii.Import( "fin.cmn.usr.datepicker" );
ii.Import( "fin.cmn.usr.ui.position" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.rpt.ssrsReport.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.toolbar", 3 );
ii.Style( "fin.cmn.usr.statusBar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.datepicker", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );
ii.Style( "fin.cmn.usr.grid", 10 );
ii.Style( "fin.cmn.usr.hierarchy", 11 );
ii.Style( "fin.cmn.usr.treeview", 12 );
ii.Style( "fin.cmn.usr.theme", 13 );
ii.Style( "fin.cmn.usr.core", 14 );
ii.Style( "fin.cmn.usr.multiselect", 15 );
ii.Style( "fin.cmn.usr.angular.bootstrap", 16 );

var importCompleted = false;
var iiScript = new ii.Script( "fin.cmn.usr.ui.core", function() { coreLoaded(); });

function coreLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.ui.widget", function() { widgetLoaded(); });
}

function widgetLoaded() { 
	var iiScript = new ii.Script( "fin.cmn.usr.multiselect", function() { importCompleted = true; }); 
}

ii.Class({
    Name: "fin.rpt.ssrs.UserInterface",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.pageLoading = true;
			me.levelNamesLoaded = false;
			me.reportType = "";
			me.hirNodeId = 1;
			me.hirNodeCurrentId = 1;
			me.lastSelectedRowIndex = -1;
			me.subscriptionId = "";
			me.scheduleType = "";
			me.status = "";
			me.ssrsReports = [];
			me.ssrsReportSubscriptions = [];
			me.controls = [];
			me.reportNodes = [];
			me.loadCount = 0;
			me.hirNodeCache = [];
			me.customers = [];
			me.houseCodes = [];
			me.filteredHouseCodes = [];
			me.excludeHouseCodes = [];
			me.invoiceStatus = [];
			me.thruFiscalPeriods = [];
			me.payPeriodEndingDates = [];
			me.woStatus = [];
			me.exNames = [];			
			me.name = "";
			me.level = "";
			me.names = "";
			me.reportURL = "";
			me.url = "";
			me.parent = "";
			me.parentNode = "";
			me.ddlists = 0;
			me.siteNodes = [];
			me.dependentTypes = [];
			me.groupLevels = [];

			me.gateway = ii.ajax.addGateway("rpt", ii.config.xmlProvider);			
			me.cache = new ii.ajax.Cache(me.gateway);
			me.hierarchy = new ii.ajax.Hierarchy( me.gateway );
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Reports\\SSRS Reports";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();			
			me.configureCommunications();
			me.setStatus("Loading");
			me.initialize();
			ui.cmn.behavior.disableBackspaceNavigation();

			$(window).bind("resize", me, me.resize);
		},
		
		authorizationProcess: function fin_rpt_ssrs_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
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
				
				ii.timer.timing("Page Displayed");
				me.loadCount = 5;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.fiscalYearStore.fetch("userId:[user],", me.yearsLoaded, me);
				me.reportStore.fetch("userId:[user],", me.reportsLoaded, me);
				me.userStore.fetch("userId:[user]", me.loggedInUsersLoaded, me);
				me.hirNodeStore.fetch("userId:[user],hirHierarchy:1,fullPath:" + me.authorizePath, me.hirNodesLoaded, me);
				me.genericTypeStore.fetch("level:ENT,name:Crothall,genericType:HouseCode,userId:[user]", me.houseCodesLoaded, me);
				me.typesTableLoaded();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_rpt_ssrs_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			var me = args.me;

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var me = fin.reportUi;

			$("#TreeviewContainer").height($(window).height() - 75);
			$("#LevelNamesContainer").height(($(window).height() - 183) - $("#ParameterContainer").height());
			$("#Subscription").height($(window).height() - 115);
			me.subscriptionGrid.setHeight($(window).height() - 105);
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});

			me.actionMenu
				.addAction({
					id: "ssrsReportAction",
					brief: "SSRS Reports",
					title: "SSRS reports.",
					actionFunction: function() { me.actionReportItem(); }
				});

			//me.actionMenu
				//.addAction({
				//	id: "subscriptionAction",
				//	brief: "SSRS Report Subscriptions",
				//	title: "SSRS report subscriptions.",
				//	actionFunction: function() { me.actionSubscriptionItem(); }
				//});

			$("#ulEdit0").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true
	        });

			me.appUnit = new ui.ctl.Input.Text({
		        id: "AppUnit",
				maxLength: 256,
				title: "To search a specific Unit in the following Hierarchy, type-in Unit# (1455, 900000) and press Enter key/click Search button."
		    });

			$("#AppUnitText").bind("keydown", me, me.actionSearchItem);

			me.ssrsReport = new ui.ctl.Input.DropDown.Filtered({
				id: "Report",
				formatFunction: function( type ) { return type.title; },
				changeFunction: function() { me.reportChanged(); }
			});
			
			$("#ulEdit1").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true
	        });
			
			me.ssrsReport.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.ssrsReport.indexSelected == -1)
						this.setInvalid("Please select the correct Report.");
				});

			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUnitLoad(); },
				hasHotState: true
			});

			me.anchorSchedule = new ui.ctl.buttons.Sizeable({
				id: "AnchorSchedule",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Schedule&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionScheduleItem(); },
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

			me.anchorDelete = new ui.ctl.buttons.Sizeable({
				id: "AnchorDelete",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Delete&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionDeleteItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorOK = new ui.ctl.buttons.Sizeable({
				id: "AnchorOK",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionOKSchedule(); },
				hasHotState: true
			});

			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelSchedule(); },
				hasHotState: true
			});

			me.anchorSelect = new ui.ctl.buttons.Sizeable({
				id: "AnchorSelect",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;OK&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSelectNode(); },
				hasHotState: true
			});

			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionClosePopup(); },
				hasHotState: true
			});
	
			me.anchorGenerateReport = new ui.ctl.buttons.Sizeable({
				id: "AnchorGenerateReport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Generate Report&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionGenerateReportItem(); },
				hasHotState: true
			});			
			
			me.subscriptionGrid = new ui.ctl.Grid({
				id: "SubscriptionGrid",
				selectFunction: function (index) { me.actionSelectItem(index); }
			});
			
			me.subscriptionGrid.addColumn("description", "description", "Description", "Description", null);
			me.subscriptionGrid.capColumns();
			
			me.deliveredBy = new ui.ctl.Input.DropDown.Filtered({
				id: "DeliveredBy",
				formatFunction: function(type) { return type.title; }
			});

			me.deliveredBy.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
	
					if (me.deliveredBy.indexSelected == -1)
						this.setInvalid("Please select the correct Delivered By.");
				});
				
			me.description = new ui.ctl.Input.Text({
		        id: "Description",
		        maxLength: 256
		    });
			
			me.description.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);
				
			me.to = new ui.ctl.Input.Text({
		        id: "To",
		        maxLength: 256
		    });
			
			me.to.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.to.getValue();

					if (enteredText == "") 
						return;

					var emailAddresses = enteredText.split(";");

					for (var index = 0; index < emailAddresses.length; index++) {
						if (emailAddresses[index] != "" && !(ui.cmn.text.validate.emailAddress(emailAddresses[index])))
							this.setInvalid("Please enter valid Email Address. Use (;) to separate multiple e-mail addresses.");
					}									
				});
				
			me.cc = new ui.ctl.Input.Text({
		        id: "Cc",
		        maxLength: 256
		    });
			
			me.cc.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.cc.getValue();
					
					if (enteredText == "") 
						return;
					
					var emailAddresses = enteredText.split(";");

					for (var index = 0; index < emailAddresses.length; index++) {
						if (emailAddresses[index] != "" && !(ui.cmn.text.validate.emailAddress(emailAddresses[index])))
							this.setInvalid("Please enter valid Email Address. Use (;) to separate multiple e-mail addresses.");
					}
				});
				
			me.subject = new ui.ctl.Input.Text({
		        id: "Subject",
		        maxLength: 250
		    });
			
			me.subject.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required);
				
			me.includeReport = new ui.ctl.Input.Check({
		        id: "IncludeReport"
		    });
			
			me.includeLink = new ui.ctl.Input.Check({
		        id: "IncludeLink"
		    });
			
			me.reportFormat = new ui.ctl.Input.DropDown.Filtered({
				id: "ReportFormat",
				formatFunction: function(type) { return type.title; }
			})
			
			me.reportFormat.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.reportFormat.indexSelected == -1)
						this.setInvalid("Please select the correct Report Format.");
				});
				
			me.priority = new ui.ctl.Input.DropDown.Filtered({
				id: "Priority",
				formatFunction: function(type) { return type.title; }
			})
			
			me.priority.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.priority.indexSelected == -1)
						this.setInvalid("Please select the correct Priority.");
				});
				
			me.comment = $("#Comment")[0];

			me.hour = new ui.ctl.Input.DropDown.Filtered({
				id: "Hours",
				formatFunction: function(type) { return type.title; }
			});
			
			me.hour.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.hour.indexSelected == -1)
						this.setInvalid("Please select the correct Hours.");
				});
			
			me.minute = new ui.ctl.Input.DropDown.Filtered({
		        id: "Minutes",
		        formatFunction: function(type) { return type.title; }
		    });
			
			me.minute.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.minute.indexSelected == -1)
						this.setInvalid("Please select the correct Minutes.");
				});
				
			me.startHour = new ui.ctl.Input.DropDown.Filtered({
				id: "StartHours",
				formatFunction: function(type) { return type.title; }
			});
			
			me.startHour.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.startHour.indexSelected == -1)
						this.setInvalid("Please select the correct Hours.");
				});
			
			me.startMinute = new ui.ctl.Input.DropDown.Filtered({
		        id: "StartMinutes",
		        formatFunction: function(type) { return type.title; }
		    });
			
			me.startMinute.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.startMinute.indexSelected == -1)
						this.setInvalid("Please select the correct Minutes.");
				});
				
			me.sunday = new ui.ctl.Input.Check({
		        id: "Sunday"
		    });
			
			me.monday = new ui.ctl.Input.Check({
		        id: "Monday"
		    });
			
			me.tuesday = new ui.ctl.Input.Check({
		        id: "Tuesday"
		    });
			
			me.wednesday = new ui.ctl.Input.Check({
		        id: "Wednesday"
		    });
			
			me.thursday = new ui.ctl.Input.Check({
		        id: "Thursday"
		    });
			
			me.friday = new ui.ctl.Input.Check({
		        id: "Friday"
		    });
			
			me.saturday = new ui.ctl.Input.Check({
		        id: "Saturday"
		    });
			
			me.numberOfDays = new ui.ctl.Input.Text({
		        id: "NumberOfDays",
		        maxLength: 2
		    });
			
			me.numberOfDays.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.numberOfDays.getValue();
					
					if (enteredText == "") 
						return;
					
					if ((this.focused || this.touched) && ($("input[name='rbDaily']:checked").val() == 2)
						&& ((!(/^\d+$/.test(enteredText))) || enteredText == "0"))
						this.setInvalid("Please enter valid Days. Example: 4");
				});
				
			me.numberOfWeeks = new ui.ctl.Input.Text({
		        id: "NumberOfWeeks",
		        maxLength: 2
		    });
			
			me.numberOfWeeks.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.numberOfWeeks.getValue();
					
					if (enteredText == "") 
						return;
					
					if ((this.focused || this.touched) && ((!(/^\d+$/.test(enteredText))) || enteredText == "0"))
						this.setInvalid("Please enter valid Weeks. Example: 2");
				});

			me.jan = new ui.ctl.Input.Check({
		        id: "Jan"
		    });
			
			me.feb = new ui.ctl.Input.Check({
		        id: "Feb"
		    });
			
			me.mar = new ui.ctl.Input.Check({
		        id: "Mar"
		    });
			
			me.apr = new ui.ctl.Input.Check({
		        id: "Apr"
		    });
			
			me.may = new ui.ctl.Input.Check({
		        id: "May"
		    });
			
			me.jun = new ui.ctl.Input.Check({
		        id: "Jun"
		    });
			
			me.jul = new ui.ctl.Input.Check({
		        id: "Jul"
		    });
			
			me.aug = new ui.ctl.Input.Check({
		        id: "Aug"
		    });
			
			me.sep = new ui.ctl.Input.Check({
		        id: "Sep"
		    });
			
			me.oct = new ui.ctl.Input.Check({
		        id: "Oct"
		    });
			
			me.nov = new ui.ctl.Input.Check({
		        id: "Nov"
		    });
			
			me.dec = new ui.ctl.Input.Check({
		        id: "Dec"
		    });
			
			me.weekOfMonth = new ui.ctl.Input.DropDown.Filtered({
				id: "WeekOfMonth",
				formatFunction: function(type) { return type.brief; }
			})
			
			me.weekOfMonth.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.weekOfMonth.indexSelected == -1)
						this.setInvalid("Please select the correct Week of the Month.");
				});
				
			me.calendarDays = new ui.ctl.Input.Text({
		        id: "CalendarDays",
		        maxLength: 90
		    });
			
			me.calendarDays.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.calendarDays.getValue();
					
					if (enteredText == "") 
						return;

					var days = enteredText.split(",");
					
					for (var index = 0; index < days.length; index++) {
						var day = jQuery.trim(days[index]);
						
						if (!(/(^\d{1,2}-\d{1,2}$)/.test(day)) && !(/^\d+$/.test(day))) {
							this.setInvalid("Please enter valid Calendar Days. Example: 1,3,5-7");
							break;
						}
					}
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
											
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid Start Date.");
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

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid End Date.");
				});

			me.stopSchedule = new ui.ctl.Input.Check({
		        id: "StopSchedule"
		    });
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.users = [];
			me.userStore = me.cache.register({
				storeId: "loggedInUsers",
				itemConstructor: fin.rpt.ssrs.User,
				itemConstructorArgs: fin.rpt.ssrs.userArgs,
				injectionArray: me.users
			});

			me.roles = [];
			me.roleStore = me.cache.register({
				storeId: "loggedInUserRoles",
				itemConstructor: fin.rpt.ssrs.Role,
				itemConstructorArgs: fin.rpt.ssrs.roleArgs,
				injectionArray: me.roles,
				addToParentItem: true,
				parent: me.userStore,
				parentPropertyName: "appRoles",
				multipleFetchesAllowed: true
			});

			me.units = [];
			me.unitStore = me.cache.register({
				storeId: "units",
				itemConstructor: fin.rpt.ssrs.AppUnit,
				itemConstructorArgs: fin.rpt.ssrs.appUnitArgs,
				injectionArray: me.units
			});

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.rpt.ssrs.HirNode,
				itemConstructorArgs: fin.rpt.ssrs.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.hirOrgs = [];
			me.hirOrgStore = me.hierarchy.register({
				storeId: "hirOrgs",
				itemConstructor: ui.ctl.Hierarchy.Node,
				itemConstructorArgs: ui.ctl.Hierarchy.nodeArgs,
				isRecursive: true,
				addToParentItem: true,
				parentPropertyName: "nodes",
				parentField: "parent",
				multipleFetchesAllowed: true,
				injectionArray: me.hirOrgs
			});

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYearMasters",
				itemConstructor: fin.rpt.ssrs.FiscalYear,
				itemConstructorArgs: fin.rpt.ssrs.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});

			me.fiscalPeriods = [];
			me.periodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.rpt.ssrs.FiscalPeriod,
				itemConstructorArgs: fin.rpt.ssrs.fiscalPeriodArgs,
				injectionArray: me.fiscalPeriods
			});

			me.reports = [];
			me.reportStore = me.cache.register({
				storeId: "rptReports",
				itemConstructor: fin.rpt.ssrs.Report,
				itemConstructorArgs: fin.rpt.ssrs.reportArgs,
				injectionArray: me.reports
			});

			me.reportParameters = [];
			me.reportParameterStore = me.cache.register({
				storeId: "rptReportParameters",
				itemConstructor: fin.rpt.ssrs.ReportParameter,
				itemConstructorArgs: fin.rpt.ssrs.reportParameterArgs,
				injectionArray: me.reportParameters
			});

			me.subscriptions = [];
			me.subscriptionStore = me.cache.register({
				storeId: "rptSubscriptions",
				itemConstructor: fin.rpt.ssrs.Subscription,
				itemConstructorArgs: fin.rpt.ssrs.subscriptionArgs,
				injectionArray: me.subscriptions
			});

			me.genericTypes = [];
			me.genericTypeStore = me.cache.register({
				storeId: "rptGenericTypes",
				itemConstructor: fin.rpt.ssrs.GenericType,
				itemConstructorArgs: fin.rpt.ssrs.genericTypeArgs,
				injectionArray: me.genericTypes
			});			
			
			me.payCodeTypes = [];
			me.payCodeTypeStore = me.cache.register({
				storeId: "payCodes",
				itemConstructor: fin.rpt.ssrs.PayCodeType,
				itemConstructorArgs: fin.rpt.ssrs.payCodeTypeArgs,
				injectionArray: me.payCodeTypes
			});
			
			me.payrollCompanys = [];
			me.payrollCompanyStore = me.cache.register({
				storeId: "payrollCompanys",
				itemConstructor: fin.rpt.ssrs.PayrollCompany,
				itemConstructorArgs: fin.rpt.ssrs.payrollCompanyArgs,
				injectionArray: me.payrollCompanys
			});
			
			me.statusTypes = [];
            me.statusStore = me.cache.register({
                storeId: "statusTypes",
                itemConstructor: fin.rpt.ssrs.StatusType,
                itemConstructorArgs: fin.rpt.ssrs.statusTypeArgs,
                injectionArray: me.statusTypes
            });
            
            me.accounts = []; 
            me.accountStore = me.cache.register({
                storeId: "accounts", 
                itemConstructor: fin.rpt.ssrs.Account, 
                itemConstructorArgs: fin.rpt.ssrs.accountArgs, 
                injectionArray: me.accounts
            });
            
            me.invoiceBatches = []; 
            me.batchStore = me.cache.register({ 
                storeId: "revInvoiceBatchs", 
                itemConstructor: fin.rpt.ssrs.Batch, 
                itemConstructorArgs: fin.rpt.ssrs.batchArgs, 
                injectionArray: me.invoiceBatches 
            });
			
			me.weekPeriods = [];
			me.weekPeriodStore = me.cache.register({
				storeId: "weekPeriods",
				itemConstructor: fin.rpt.ssrs.WeekPeriod,
				itemConstructorArgs: fin.rpt.ssrs.weekPeriodArgs,
				injectionArray: me.weekPeriods
			});
			
			me.workShifts = []; 
            me.workShiftStore = me.cache.register({ 
                storeId: "workShifts", 
                itemConstructor: fin.rpt.ssrs.WorkShift, 
                itemConstructorArgs: fin.rpt.ssrs.workShiftArgs, 
                injectionArray: me.workShifts    
            });
            
            me.rptStatusTypes = [];
            me.rptStatusTypeStore = me.cache.register({
                storeId: "rptStatusTypes",
                itemConstructor: fin.rpt.ssrs.RptStatusType,
                itemConstructorArgs: fin.rpt.ssrs.rptStatusTypeArgs,
                injectionArray: me.rptStatusTypes
            });
			
			me.yearPeriods = [];
			me.yearPeriodStore = me.cache.register({
				storeId: "yearPeriods",
				itemConstructor: fin.rpt.ssrs.YearPeriod,
				itemConstructorArgs: fin.rpt.ssrs.yearPeriodArgs,
				injectionArray: me.yearPeriods
			});
			
			me.woStatus = [];
			me.woStatusStore = me.cache.register({
				storeId: "woStatus",
				itemConstructor: fin.rpt.ssrs.WOStatus,
				itemConstructorArgs: fin.rpt.ssrs.woStatusArgs,
				injectionArray: me.woStatus
			});
						
			me.payPeriodEndingDates = [];
			me.payPeriodEndingDateStore = me.cache.register({
				storeId: "payPeriodEndingDates",
				itemConstructor: fin.rpt.ssrs.PayPeriodEndingDate,
				itemConstructorArgs: fin.rpt.ssrs.payPeriodEndingDateArgs,
				injectionArray: me.payPeriodEndingDates
			});
			
			me.stateTypes = [];
			me.stateStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.rpt.ssrs.StateType,
				itemConstructorArgs: fin.rpt.ssrs.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.serviceTypes = [];
            me.serviceTypeStore = me.cache.register({
                storeId: "serviceTypes",
                itemConstructor: fin.rpt.ssrs.ServiceType,
                itemConstructorArgs: fin.rpt.ssrs.serviceTypeArgs,
                injectionArray: me.serviceTypes
            });
            
            me.serviceLines = [];
            me.serviceLineStore = me.cache.register({
                storeId: "serviceLines",
                itemConstructor: fin.rpt.ssrs.ServiceLine,
                itemConstructorArgs: fin.rpt.ssrs.serviceLineArgs,
                injectionArray: me.serviceLines
            });
            
            me.contractTypes = [];
            me.contractTypeStore = me.cache.register({
                storeId: "contractTypes",
                itemConstructor: fin.rpt.ssrs.ContractType,
                itemConstructorArgs: fin.rpt.ssrs.contractTypeArgs,
                injectionArray: me.contractTypes    
            });
		},

		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
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

			$("#HourlySchedule").hide();
			$("#DailySchedule").hide();
			$("#WeeklySchedule").hide();
			$("#MonthlySchedule").hide();
			$("#OneTimeSchedule").hide();
			$("#OnDays").hide();
			$("#WeekDays").hide();
			$("#DivCalendarDays").hide();
			$("#MonthErrorMessage").hide();
			$("#DayErrorMessage").hide();
			
			$("input[name='rbSchedule']").click(function() {
				me.startHour.resizeText();
				me.startMinute.resizeText();
				me.startDate.resizeText();
				me.endDate.resizeText();

				if (this.id == "Hourly") {
					$("#HourlySchedule").show();
					$("#DailySchedule").hide();
					$("#WeeklySchedule").hide();
					$("#MonthlySchedule").hide();
					$("#OneTimeSchedule").hide();
					$("#OnDays").hide();
					$("#WeekDays").hide();
					$("#DivCalendarDays").hide();
					$("#ScheduleHeader").html("Hourly Schedule");
					
					me.hour.resizeText();
					me.minute.resizeText();
					me.scheduleType = "MinuteRecurrence";
				}
				else if (this.id == "Daily") {
					$("#HourlySchedule").hide();
					$("#DailySchedule").show();
					$("#WeeklySchedule").hide();
					$("#MonthlySchedule").hide();
					$("#OneTimeSchedule").hide();
					$("#LabelDay").html("");
					$("#LabelDay").width(50);
					$("#OnDays").show();
					$("#WeekDays").show();
					$("#DivCalendarDays").hide();
					$("#DayErrorMessage").hide();
					$("#ScheduleHeader").html("Daily Schedule");
					
					me.numberOfDays.resizeText();
					me.scheduleType = "DailyRecurrence";
				}
				else if (this.id == "Weekly") {
					$("#HourlySchedule").hide();
					$("#DailySchedule").hide();
					$("#WeeklySchedule").show();
					$("#MonthlySchedule").hide();
					$("#OneTimeSchedule").hide();
					$("#LabelDay").html("<span class='requiredFieldIndicator'>&#149;</span>&nbsp;On day(s):");
					$("#LabelDay").width(120);
					$("#OnDays").hide();
					$("#WeekDays").show();
					$("#DivCalendarDays").hide();
					$("#DayErrorMessage").hide();
					$("#ScheduleHeader").html("Weekly Schedule");

					me.numberOfWeeks.resizeText();
					me.scheduleType = "WeeklyRecurrence";
				}
				else if (this.id == "Monthly") {
					$("#HourlySchedule").hide();
					$("#DailySchedule").hide();
					$("#WeeklySchedule").hide();
					$("#MonthlySchedule").show();
					$("#OneTimeSchedule").hide();
					$("#LabelDay").html("<span class='requiredFieldIndicator'>&#149;</span>&nbsp;On day of week:");
					$("#LabelDay").width(120);
					$("#OnDays").hide();
					$("#MonthErrorMessage").hide();
					$("#DayErrorMessage").hide();
					$("#WeekDays").show();
					$("#DivCalendarDays").show();					
					$("#ScheduleHeader").html("Monthly Schedule");

					me.weekOfMonth.resizeText();
					me.calendarDays.resizeText();
					me.scheduleType = "MonthlyRecurrence";
				}
				else if (this.id == "OneTime") {
					$("#HourlySchedule").hide();
					$("#DailySchedule").hide();
					$("#WeeklySchedule").hide();
					$("#MonthlySchedule").hide();
					$("#OneTimeSchedule").show();
					$("#OnDays").hide();
					$("#WeekDays").hide();
					$("#DivCalendarDays").hide();
					$("#ScheduleHeader").html("One-time Schedule");
					me.scheduleType = "OneTime";
				}
			});

			$("input[name='rbDaily']").click(function() {
				if (this.id == "RepeatDay")
					me.numberOfDays.text.readOnly = false;
				else
					me.numberOfDays.text.readOnly = true;

				me.numberOfDays.resetValidation(true);
				me.numberOfDays.setValue("");
				$("#DayErrorMessage").hide();
			});

			$("input[name='rbMonthly']").click(function() {
				if (this.id == "rbCalendarDays")
					me.calendarDays.text.readOnly = false;
				else
					me.calendarDays.text.readOnly = true;

				me.calendarDays.resetValidation(true);
				me.calendarDays.setValue("");
				$("#DayErrorMessage").hide();
			});

			me.weeksLoaded();
			me.hoursLoaded();
			me.minutesLoaded();
			me.typesLoaded();
		},
		
		weeksLoaded: function() {
			var me = this;

			me.fiscalWeeks = [];
			me.weeks = [];

			me.fiscalWeeks.push(new fin.rpt.ssrs.FiscalWeek(0, 0, "All"));
			me.fiscalWeeks.push(new fin.rpt.ssrs.FiscalWeek(1, 1, "1"));
			me.fiscalWeeks.push(new fin.rpt.ssrs.FiscalWeek(2, 2, "2"));
			me.fiscalWeeks.push(new fin.rpt.ssrs.FiscalWeek(3, 3, "3"));
			me.fiscalWeeks.push(new fin.rpt.ssrs.FiscalWeek(4, 4, "4"));

			me.weeks.push(new fin.rpt.ssrs.Week(0, "1st", "FirstWeek"));
			me.weeks.push(new fin.rpt.ssrs.Week(1, "2nd", "SecondWeek"));
			me.weeks.push(new fin.rpt.ssrs.Week(2, "3rd", "ThirdWeek"));
			me.weeks.push(new fin.rpt.ssrs.Week(3, "4th", "FourthWeek"));
			me.weeks.push(new fin.rpt.ssrs.Week(4, "Last", "LastWeek"));
			me.weekOfMonth.setData(me.weeks);
			me.weekOfMonth.select(0, me.weekOfMonth.focused);
		},

		hoursLoaded: function() {
			var me = this;
			var title = "";

			me.hours = [];
			me.startHours = [];

			for (var index = 1; index <= 12; index++) {
				if (index < 10)
					title = "0" + index.toString();
				else
					title = index.toString();
				me.hours.push(new fin.rpt.ssrs.Hour(index, title));
				me.startHours.push(new fin.rpt.ssrs.Hour(index, title));
			}

			me.startHour.setData(me.startHours);
			me.startHour.select(11, me.startHour.focused);

			for (var index = 13; index <= 24; index++) {
				title = index.toString();
				me.hours.push(new fin.rpt.ssrs.Hour(index, title));
			}

			me.hour.setData(me.hours);			
			me.hour.select(23, me.hour.focused);
		},

		minutesLoaded: function() {
			var me = this;
			var title = "";

			me.minutes = [];

			for (var index = 0; index < 60; index++) {
				if (index < 10)
					title = "0" + index.toString();
				else
					title = index.toString();
				me.minutes.push(new fin.rpt.ssrs.Minute(index, title));	
			}

			me.minute.setData(me.minutes);
			me.startMinute.setData(me.minutes);
			me.minute.select(0, me.minute.focused);
			me.startMinute.select(0, me.startMinute.focused);
		},
		
		typesLoaded: function() {
			var me = this;

			me.deliveries = [];
			me.reportFormats = [];
			me.priorities = [];

			me.deliveries.push(new fin.rpt.ssrs.DeliveredBy(1, "E-Mail"));

			me.reportFormats.push(new fin.rpt.ssrs.ReportFormat(1, "PDF"));
			me.reportFormats.push(new fin.rpt.ssrs.ReportFormat(1, "Excel"));

			me.priorities.push(new fin.rpt.ssrs.Priority(1, "Normal"));
			me.priorities.push(new fin.rpt.ssrs.Priority(1, "Low"));
			me.priorities.push(new fin.rpt.ssrs.Priority(1, "High"));

			me.deliveredBy.setData(me.deliveries);
			me.deliveredBy.select(0, me.deliveredBy.focused);
			me.reportFormat.setData(me.reportFormats);
			me.reportFormat.select(0, me.reportFormat.focused);
			me.priority.setData(me.priorities);
			me.priority.select(0, me.priority.focused);
		},
		
		yearsLoaded: function(me, activeId) {
			me.checkLoadCount();
		},
				
		houseCodesLoaded: function(me, activeId) {
			me.houseCodes = me.genericTypes.slice();
			me.checkLoadCount();
		},
		
		typesTableLoaded: function() {
			var me = this;
			me.levels = [];
			me.excludeOverheadAccounts = [];
			me.payrollReportTypes = [];
			me.reportTypes = [];
			me.budgetTypes = [];
			me.crothallEmployees = [];
			me.currentWeeks = [];
			me.comments = [];
			me.unions = [];
			me.entryMethods = [];
			me.hour40Exceptions = [];
			me.houseCodeStatus = [];
			me.countHours = [];
			me.exceptions = [];
			
			me.levels.push(new fin.rpt.ssrs.Level(0, "None", "0"));
			me.levels.push(new fin.rpt.ssrs.Level(37, "ENT", "ENT"));
			me.levels.push(new fin.rpt.ssrs.Level(2, "SVP", "SVP"));
			me.levels.push(new fin.rpt.ssrs.Level(34, "DVP", "DVP"));
			me.levels.push(new fin.rpt.ssrs.Level(3, "RVP", "RVP"));
			me.levels.push(new fin.rpt.ssrs.Level(36, "SRM", "SRM"));
			me.levels.push(new fin.rpt.ssrs.Level(4, "RM", "RM"));
			me.levels.push(new fin.rpt.ssrs.Level(41, "AM", "AM"));
			me.levels.push(new fin.rpt.ssrs.Level(7, "SiteName", "SiteName"));
			
			me.excludeOverheadAccounts.push(new fin.rpt.ssrs.ExcludeOverheadAccount(3, "Yes", "3"));//Default
			me.excludeOverheadAccounts.push(new fin.rpt.ssrs.ExcludeOverheadAccount(-1, "No", "-1"));
			
			me.payrollReportTypes.push(new fin.rpt.ssrs.PayrollReportType(1, "By House Code", "HC"));
			me.payrollReportTypes.push(new fin.rpt.ssrs.PayrollReportType(2, "By Employee", "E"));
			me.payrollReportTypes.push(new fin.rpt.ssrs.PayrollReportType(3, "Hierarchy", "H"));
			
			me.reportTypes.push(new fin.rpt.ssrs.ReportType(0, "All House Codes", "0"));//Default
			me.reportTypes.push(new fin.rpt.ssrs.ReportType(1, "Rollup", "1"));
			
			me.budgetTypes.push(new fin.rpt.ssrs.BudgetType(1, "Started", "Started"));//Default
            me.budgetTypes.push(new fin.rpt.ssrs.BudgetType(2, "Not Started", "NotStarted"));
			
			me.crothallEmployees.push(new fin.rpt.ssrs.CrothallEmployee(1, "ALL", "ALL"));//Default
            me.crothallEmployees.push(new fin.rpt.ssrs.CrothallEmployee(2, "YES", "YES"));
            me.crothallEmployees.push(new fin.rpt.ssrs.CrothallEmployee(3, "NO", "NO"));
			
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(1, "1", "1"));
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(2, "2", "2"));
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(3, "3", "3"));
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(4, "4", "4"));
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(5, "5", "5"));
			me.currentWeeks.push(new fin.rpt.ssrs.CurrentWeek(6, "6", "6"));
			
			me.comments.push(new fin.rpt.ssrs.Comment(1, "GL Level", "GL Level"));
            me.comments.push(new fin.rpt.ssrs.Comment(2, "Summary", "Summary"));
            me.comments.push(new fin.rpt.ssrs.Comment(3, "Both", "Both"));//Default
			
			me.unions.push(new fin.rpt.ssrs.Union(1, "Both", "B"));
			me.unions.push(new fin.rpt.ssrs.Union(2, "Union", "U"));
			me.unions.push(new fin.rpt.ssrs.Union(3, "Non Union", "N"));
			
			me.entryMethods.push(new fin.rpt.ssrs.EntryMethod(1, "Epay Site and Task", "1"));//Default
			me.entryMethods.push(new fin.rpt.ssrs.EntryMethod(2, "Kronos Time and Attendance", "2"));
			me.entryMethods.push(new fin.rpt.ssrs.EntryMethod(3, "Manual", "3"));
			
			me.hour40Exceptions.push(new fin.rpt.ssrs.Hour40Exception(0, "Equal To 40", "0"));//Default
			me.hour40Exceptions.push(new fin.rpt.ssrs.Hour40Exception(1, "Greater Than 40", "1"));
			
			me.houseCodeStatus.push(new fin.rpt.ssrs.HouseCodeStatus(1, "Active", "1"));//Default
            me.houseCodeStatus.push(new fin.rpt.ssrs.HouseCodeStatus(0, "Closed", "0"));
			
			me.countHours.push(new fin.rpt.ssrs.CountHour(1, "True", "True"));//Default
            me.countHours.push(new fin.rpt.ssrs.CountHour(2, "False", "False"));
			
			me.exceptions.push(new fin.rpt.ssrs.Exception(1, "Both", "B"));
			me.exceptions.push(new fin.rpt.ssrs.Exception(2, "Open", "O"));
			me.exceptions.push(new fin.rpt.ssrs.Exception(3, "Closed", "C"));
		},
		
		loggedInUsersLoaded: function(me, activeId) {

			if (me.users.length == 0) {
				ii.trace("Failed to load logged-in user information.", ii.traceTypes.Information, "Information");
				return false;
			}

			me.hirNodeCurrentId = me.getHirNodeCurrentId();
			me.checkLoadCount();
		},

		getHirNodeCurrentId: function() {
			var me = this;

			for (var index = 0; index < me.roles.length; index++) {
				if (me.roles[index].id == me.users[0].roleCurrent) {
					return me.roles[index].hirNodeCurrent;
				}
			}
		},

		selectNode: function(id, parentId, title, fullPath) {
			var me = this;
            var parentNode = $("#liNode" + parentId)[0];

            if (parentNode != undefined) {
                if (parentNode.className == "expandable" || parentNode.className == "expandable lastExpandable")
                    $("#liNode" + parentId).find(">.hitarea").click();

				$("#chkNode" + id).attr("checked", "checked");
				setTimeout(function() { 
					$("#chkNode" + id).focus();
				}, 500);

				var parent = "";
				if (parentId == "37")
					parent = "ENT";
				else if (parentId == "2")
					parent = "SVP";
				else if (parentId == "34")
					parent = "DVP";
				else if (parentId == "3")
					parent = "RVP";
				else if (parentId == "36")
					parent = "SRM";
				else if (parentId == "4")
					parent = "RM";
				else if (parentId == "41")
					parent = "AM";
				else if (parentId == "7")
					parent = "SiteName";
 
				me.parentNodeCheck($("#chkNode" + id)[0], title, parent)
            }
		},
		
		resetDependentTypes: function() {
			var me = this;

			me.excludeHouseCodes = [];
			me.filteredHouseCodes = [];
			$("#ExcludeHouseCodes").html("");
			$("#ExcludeHouseCodes").multiselect("refresh");
			$("#HouseCode").html("");
			$("#HouseCode").multiselect("refresh");
		},

		checkDependentTypes: function(fullPath, add) {
			var me = this;

			for (var index = 0; index < me.dependentTypes.length; index++) {
				if (me.dependentTypes[index] == "ExcludeHouseCode" || me.dependentTypes[index] == "Exclude") {
					if (add) {
						var nodes = $.grep(me.siteNodes, function(item, itemIndex) {
						    return item.fullPath.indexOf(fullPath) >= 0;
						});

						$.merge(me.excludeHouseCodes, nodes);

						me.excludeHouseCodes.sort(function(a, b) {
							if (a.title < b.title)
						    	return -1;
						  	if (a.title > b.title)
						    	return 1;
							return 0;
						});
					}
					else {
						me.excludeHouseCodes = $.grep(me.excludeHouseCodes, function(item, itemIndex) {
						    return item.fullPath.indexOf(fullPath) < 0;
						});
					}
					me.setExcludeHouseCodes();
				}
				if (me.dependentTypes[index] == "HouseCode") {
					if (add) {
						var nodes = $.grep(me.houseCodes, function(item, itemIndex) {
						    return item.parameter.indexOf(fullPath) >= 0;
						});

						$.merge(me.filteredHouseCodes, nodes);

						me.filteredHouseCodes.sort(function(a, b) {
							if (a.title < b.title)
						    	return -1;
						  	if (a.title > b.title)
						    	return 1;
							return 0;
						});
					}
					else {
						me.filteredHouseCodes = $.grep(me.filteredHouseCodes, function(item, itemIndex) {
						    return item.parameter.indexOf(fullPath) < 0;
						});
					}
					me.setHouseCodes();
				}				
			}
		},

		setExcludeHouseCodes: function() {
			var me = this;

			$("#ExcludeHouseCodes").html("");
			$("#ExcludeHouseCodes").append("<option title='(Select All)' value='-1'>(Select All)</option>");
			$("#ExcludeHouseCodes").append("<option title='None' value='0' selected>None</option>");	
			for (var index = 0; index < me.excludeHouseCodes.length; index++) {
				$("#ExcludeHouseCodes").append("<option title='" + me.excludeHouseCodes[index].title + "' value='" + me.excludeHouseCodes[index].id + "'>" + me.excludeHouseCodes[index].title + "</option>");
			}
			$("#ExcludeHouseCodes").multiselect("refresh");
		},
		
		setHouseCodes: function() {
			var me = this;

			$("#HouseCode").html("");
				
			for (var index = 0; index < me.filteredHouseCodes.length; index++) {
				$("#HouseCode").append("<option title='" + me.filteredHouseCodes[index].name + "' value='" + me.filteredHouseCodes[index].id + "'>" + me.filteredHouseCodes[index].name + "</option>");
			}
			$("#HouseCode").multiselect("refresh");
		},
		
		reportsLoaded: function(me, activeId) {

			for (var index = 0; index < me.reports.length; index++) {
				me.ssrsReports.push(me.reports[index]);
				if (me.reports[index].subscriptionAvailable)
					me.ssrsReportSubscriptions.push(me.reports[index]);
			}
			
			me.actionReportItem();
			me.checkLoadCount();
		},

		hirNodesLoaded: function(me, activeId) {

			if (me.pageLoading) {
				me.actionAddNodes();
				me.pageLoading = false;
				me.checkLoadCount();
				//me.hirNodeStore.fetch("userId:[user],levelBrief:-1", me.hirNodesLoaded, me);	
			}
			else {
				me.levelNamesLoaded = true;
				var nodes = [];
				var $scope = angular.element($("#SearchContainer")).scope();
				$scope.$apply(function() {
					$scope.nodes = me.hirNodes.slice();
				});

				// Add ENT level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 37;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 37, "ENT", 1, 1, "");
					me.addChildNodes(nodes, "ENT");
				}

				// Add SVP level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 2;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 2, "SVP", 1, 1, "");
					me.addChildNodes(nodes, "SVP");
				}

				// Add DVP level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 34;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 34, "DVP", 1, 1, "");
					me.addChildNodes(nodes, "DVP");
				}

				// Add RVP level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 3;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 3, "RVP", 1, 1, "");
					me.addChildNodes(nodes, "RVP");
				}

				// Add SRM level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 36;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 36, "SRM", 1, 1, "");
					me.addChildNodes(nodes, "SRM");
				}

				// Add RM level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 4;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 4, "RM", 1, 1, "");
					me.addChildNodes(nodes, "RM");
				}

				// Add AM level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 41;
				});
				if (nodes.length > 0) {
					me.addLevelNode("", 41, "AM", 1, 1, "");
					me.addChildNodes(nodes, "AM");
				}
				
				// Add Unit level and its child nodes
				nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == 7;
				});
				me.siteNodes = nodes;
				if (nodes.length > 0) {
					me.addLevelNode("", 7, "SiteName", 1, 1, "");
					me.addChildNodes(nodes, "SiteName");
				}

				//me.checkLoadCount();
			}
		},
		
		addChildNodes: function(nodes, parentLevel) {
			var me = this;
			var hirNode = 0;
            var hirNodeTitle = "";
			var hirLevel = 0;
			var fullPath = "";

			if (nodes.length > 0) {
				for (var index = 0; index < nodes.length; index++) {
					hirNode = nodes[index].id;
					hirNodeTitle = nodes[index].title;
					hirLevel = nodes[index].hirLevel;
					fullPath = nodes[index].fullPath;
					me.addLevelNode(parentLevel, hirNode, hirNodeTitle, hirLevel, 0, fullPath);
				}
			}
		},

		addLevelNode: function() {
			var args = ii.args(arguments, {
				parent: { type: String }
                , hirNode: { type: Number }
				, hirNodeTitle: { type: String }
				, hirLevel: { type: Number }
				, childNodeCount: {type: Number}
				, fullPath: { type: String }
            });			
			var me = this;
			var nodeHtml = "";			
			
			nodeHtml = "<li id=\"liNode" + args.hirNode + "\">";
			nodeHtml += "<input type=\"checkbox\" id=\"chkNode" + args.hirNode + "\" name=\"" + args.hirNodeTitle + "\" fullPath=\"" + args.fullPath + "\" parent=\"" + args.hirLevel + "\" />";
			nodeHtml += "<span id=\"span" + args.hirNode + "\" class='normal' style='vertical-align: middle;'>" + args.hirNodeTitle + "</span>";
			
			if (args.childNodeCount != 0)
                nodeHtml += "<ul id=\"ulEdit" + args.hirNode + "\"></ul>";
            			
			nodeHtml += "</li>";
						
			var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.hirLevel);
            $("#ulEdit1").treeview({ add: treeNode });
			
			$("#span" + args.hirNode).bind("click", function() {
				
			});
			
			$("#liNode" + args.hirNode).find(">.hitarea").bind("click", function () {
				if ($("#ulEdit" + args.hirNode)[0].innerHTML == "") {
					$("#span" + args.hirNode).replaceClass("normal", "loading");
					me.setLoadCount();
					me.parent = args.hirNodeTitle;
					me.parentNode = args.hirNode;
	               	me.hirNodeStore.fetch("userId:[user],levelBrief:" + args.hirNodeTitle, me.namesLoaded, me);					
	            }
            });
			
			$("#chkNode" + args.hirNode).bind("click", function() { 
				if (args.hirLevel == 1)
					me.childNodeCheck(this, args.hirNodeTitle);
				else
					me.parentNodeCheck(this, args.hirNodeTitle, args.parent); 
			});			
		},
		
		namesLoaded: function(me, activeId) {
			
		 	var hirNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;
			var hirLevel = 0;
			var fullPath = "";			
			
			if (me.hirNodes.length > 0) {
				for (var index = 0; index < me.hirNodes.length; index++) {				 
					hirNode = me.hirNodes[index].id;				
					hirNodeTitle = me.hirNodes[index].title;
					childNodeCount = me.hirNodes[index].childNodeCount;
					hirLevel = me.hirNodes[index].hirLevel;
					fullPath = nodes[index].fullPath;

					me.addLevelNode(me.parent, hirNode, hirNodeTitle, hirLevel, childNodeCount, fullPath);
				}
				$("#span" + me.hirNodes[0].hirLevel).replaceClass("loading", "normal");
			}
			else
				$("#span" + me.parentNode).replaceClass("loading", "normal");
			
			me.checkLoadCount();
		},
		
		childNodeCheck: function(chkNodeParent, hirNodeTitle) {
		    var me = this;
		    var hirParentNode = chkNodeParent.id.replace(/chkNode/, "");
		    var nodeChecked = chkNodeParent.checked;
			var fullPaths = [];
			me.name = "";
			me.names = "";

			if (me.lastCheckedNode != undefined && me.lastCheckedNode != hirParentNode) {
				var previousLevelNodeChecked = false;

				$("input[parent=" + me.lastCheckedNode + "]").each(function() {
		            if (this.checked) {
						previousLevelNodeChecked = true;
						return false;
					}	
		        });

				if (previousLevelNodeChecked) {
					if (confirm("Selected nodes in earlier level will be deselected")) {
						$("#chkNode" + me.lastCheckedNode).attr("checked", false);
						$("input[parent=" + me.lastCheckedNode + "]").each(function() {
							this.checked = false;
						});
						me.resetDependentTypes();
					}
					else {
						$("#chkNode" + hirParentNode).attr("checked", false);
						return false;
					}
				}
			}

			me.lastCheckedNode = hirParentNode;

			if (chkNodeParent.checked)
				me.level = "~Level=" + hirNodeTitle;
			else {
				var parameter = "~Level=" + hirNodeTitle;
				me.level = me.level.replace(parameter, "");
			}

		    //get a list of the children of the node
		    $("input[parent=" + hirParentNode + "]").each(function() {
		        //find out if the parent node is checked
		        if (nodeChecked) {
					this.checked = true;
					me.name = me.name + "~Name=" + this.name;
					me.names = me.names + "~" + this.name;
					fullPaths.push($(this).attr("fullPath"));
				}
				else {
					this.checked = false;
					me.name = me.name.replace("~Name=" + this.name, "");
					me.names = me.names.replace("~" + this.name, "");
				}
		    });

			if (nodeChecked) {
				var nodes = $.grep(me.siteNodes, function(item, index) {
					var found = false;
					for (var iIndex = 0; iIndex < fullPaths.length; iIndex++) {
						found = item.fullPath.indexOf(fullPaths[iIndex]) >= 0;
						if (found)
							break;
					}
					return found;
				});
				me.excludeHouseCodes = nodes;
				me.setExcludeHouseCodes();
			}
			else {
				me.resetDependentTypes();
			}
		},
		
		parentNodeCheck: function(chkNodeChild, hirNodeTitle, parent) {
		    var me = this;
		    var hirNode = $(chkNodeChild).attr("parent");
			var fullPath = $(chkNodeChild).attr("fullPath");
		    var allChecked = true;

			if (me.lastCheckedNode != undefined && me.lastCheckedNode != hirNode) {
				var previousLevelNodeChecked = false;

				$("input[parent=" + me.lastCheckedNode + "]").each(function() {
		            if (this.checked) {
						previousLevelNodeChecked = true;
						return false;
					}
		        });

				if (previousLevelNodeChecked) {
					if (confirm("Selected nodes in earlier level will be deselected")) {
						$("#chkNode" + me.lastCheckedNode).attr("checked", false);
						$("input[parent=" + me.lastCheckedNode + "]").each(function() {
							this.checked = false;
						});
						me.name = "";
						me.names = "";
						me.resetDependentTypes();
					}
					else {
						$("#chkNode" + hirNode).attr("checked", false);
						$("input[parent=" + hirNode + "]").each(function() {
							this.checked = false;
						});
						return false;
					}
				}
			}

			me.level = "~Level=" + parent;
			if (chkNodeChild.checked) {
				me.name = me.name + "~Name=" + hirNodeTitle;
				me.names = me.names + "~" + hirNodeTitle;
			}				
			else {				
				me.name = me.name.replace("~Name=" + hirNodeTitle, "");
				me.names = me.names.replace("~" + hirNodeTitle, "");
			}				

			me.lastCheckedNode = hirNode;

		    //make sure that the child has a parent
		    $("#chkNode" + hirNode).each(function() {
		        //go through the list of child nodes of the parent
		        $("input[parent=" + hirNode + "]").each(function() {
		            if (this.checked == false) {
						allChecked = false;
						return false;
					}
		        });
 
    		    //if all have been checked... check this one
		        if (allChecked)
		            this.checked = true;
				else
					$("#" + this.id).attr("checked", false);
		    });

			me.checkDependentTypes(fullPath, chkNodeChild.checked);
			
			if(me.controls[3].selector != undefined && me.controls[3].selector == "#GroupLevel")
            	me.groupLevelsLoaded();
		},
		
		actionAddNodes: function() {
			var me = this;
			var index = 0;
			var hirParentNode = 0;
		 	var hirNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;

			me.removeUnAuthorizedNodes();

			for (index = 0; index < me.reportNodes.length; index++) {
				hirParentNode = me.reportNodes[index].nodeParentId;
				hirNode = me.reportNodes[index].id;				
				hirNodeTitle = me.reportNodes[index].title;
				childNodeCount = me.reportNodes[index].childNodeCount;

				//set up the edit tree
                //add the item underneath the parent list
				me.actionNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount);
			}

			if (me.reportNodes.length > 0)
				$("#liNode" + me.reportNodes[0].id).find(">.hitarea").click();
		},

		actionNodeAppend: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirNodeTitle: {type: String}
				, hirNodeParent: {type: Number}
				, childNodeCount: {type: Number}
			});
			var me = this;

            nodeHtml = "<li id='liNode" + args.hirNode + "'>"
		    	+ "<span class='unit' id='span" + args.hirNode + "'>" + args.hirNodeTitle + "</span>";

            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id='ulEdit" + args.hirNode + "'></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNode" + args.hirNodeParent)[0] == undefined)
				args.hirNodeParent = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.hirNodeParent);
            $("#ulEdit0").treeview({add: treeNode});
			
			 //link up the node
            $("#span" + args.hirNode).bind("click", function() { 
				me.hirNodeSelect(args.hirNode);
			});
		},

		removeUnAuthorizedNodes: function() {
            var me = this;
            var path = "";
			var fullPath;

			me.reportNodes = [];

            for (var index = 0; index < me.hirNodes.length; index++) {
				 for (var authIndex = 0; authIndex < me.authorizer.authorizations.length; authIndex++) {
	                path = me.authorizer.authorizations[authIndex];
					fullPath = me.hirNodes[index].fullPath;

					if (path.indexOf(fullPath) != -1) {
						me.reportNodes.push(me.hirNodes[index]);
	                    break;
	                }
	            }
			}
        },

		hirNodeSelect: function(nodeId) {        
   			var me = this;
			var nodeIndex = me.getNodeIndex(nodeId);
			var found = false;
			var reportURL = "";
			var rowHtml = "";
            var reportTitle = "";
			var reportId = 0;
			var parameterAvailable = false;
			
			if (me.hirNodePreviousSelected > 0)
				$("#span" + me.hirNodePreviousSelected).replaceClass("unitSelected", "unit");

			me.hirNodeSelected = me.reportNodes[nodeIndex].id;
			me.hirNodePreviousSelected = me.hirNodeSelected;

			$("#span" + me.hirNodeSelected).replaceClass("unit", "unitSelected");

			for (var index = 0; index < me.reports.length; index++) {
				if (me.reports[index].hirNode == me.hirNodeSelected) {
					reportURL = me.reports[index].reportURL;
					reportTitle = me.reports[index].title;
					reportId = me.reports[index].id;
					parameterAvailable = me.reports[index].parameterAvailable;
					found = true;
					break;
				}
			}
			
			if (found && reportURL != "")
				me.reportURL = reportURL;

			if (found && reportURL != "" && !parameterAvailable) {
				$("#RightContainer").hide();
				window.open(reportURL);
			}
			else if (reportId != 0) {
				$("#RightContainer").show();
				me.setLoadCount();
				if(!me.levelNamesLoaded)
					me.hirNodeStore.fetch("userId:[user],levelBrief:-1", me.hirNodesLoaded, me);
				me.reportParameterStore.fetch("userId:[user],reportId:" + reportId, me.parametersLoaded, me);				
			}
		},
		
		parametersLoaded: function(me, activeId) {
			me.ddlists = 0;
			me.list = "";
						
			for (var index = 0; index < me.reportParameters.length; index++) {
				if (me.reportParameters[index].referenceTableName == "FscYear") {
					me.ddlists = me.ddlists + 1;
					me.list = "FscYear";
					me.fiscalYearStore.reset();
					me.fiscalYearStore.fetch("userId:[user],fscYear:>=3", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "FscPeriod" || me.reportParameters[index].referenceTableName == "YearPeriods" || me.reportParameters[index].referenceTableName == "FscPeriodFrom") {
					me.ddlists = me.ddlists + 1;
					me.list = "FscPeriod";
					me.periodStore.fetch("userId:[user],fiscalYearId:-1", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "PayCode") {
					me.ddlists = me.ddlists + 1;
					me.list = "PayCode";
					me.payCodeTypeStore.fetch("userId:[user],payCodeType:", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "PayrollCompany") {
					me.ddlists = me.ddlists + 1;
					me.list = "PayrollCompany";
					me.payrollCompanyStore.fetch("userId:[user]", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "EmployeeStatus") {
					me.ddlists = me.ddlists + 1;
					me.list = "EmployeeStatus";
					me.statusStore.fetch("userId:[user],", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "FscAccount") {
					me.ddlists = me.ddlists + 1;
					me.list = "FscAccount";
					me.accountStore.fetch("userId:[user],budget:1,code:code", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "BatchNumber") {
					me.ddlists = me.ddlists + 1;
					me.list = "BatchNumber";
					me.batchStore.fetch("userId:[user],statusType:-1", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "WkPeriod") {
					me.ddlists = me.ddlists + 1;
					me.list = "WkPeriod";
					me.weekPeriodStore.fetch("genericType:" + me.reportParameters[index].referenceTableName + ",userId:[user]", me.dropdownsLoaded, me);
				}				
				else if (me.reportParameters[index].referenceTableName == "Shift") {
					me.ddlists = me.ddlists + 1;
					me.list = "Shift";
					me.workShiftStore.fetch("userId:[user],", me.dropdownsLoaded, me);
				}	
				else if (me.reportParameters[index].referenceTableName == "StatusType" &&  me.reportParameters[index].name == "InvoiceStatus") {
					me.ddlists = me.ddlists + 1;
					me.list = "StatusType";
					me.rptStatusTypeStore.fetch("genericType:" + me.reportParameters[index].referenceTableName + ",userId:[user]", me.dropdownsLoaded, me);
				}
				//else if (me.reportParameters[index].referenceTableName == "YearPeriods") {
				//	me.ddlists = me.ddlists + 1;
				//	me.list = "YearPeriods";
				//	me.yearPeriodStore.fetch("genericType:" + me.reportParameters[index].referenceTableName + ",userId:[user]", me.dropdownsLoaded, me);
				//}
				else if (me.reportParameters[index].referenceTableName == "StatusType" &&  me.reportParameters[index].name == "WOStatus") {
					me.ddlists = me.ddlists + 1;
					me.list = "WOStatus";
					me.woStatusStore.fetch("genericType:" + me.reportParameters[index].name + ",userId:[user]", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "PayPeriod") {
					me.ddlists = me.ddlists + 1;
					me.list = "PayPeriod";
					me.payPeriodEndingDateStore.fetch("genericType:" + me.reportParameters[index].referenceTableName + ",userId:[user]", me.dropdownsLoaded, me);
				}
				else if (me.reportParameters[index].referenceTableName == "States") {
					me.ddlists = me.ddlists + 1;
					me.list = "States";
					me.stateStore.fetch("userId:[user]", me.dropdownsLoaded, me);
				}				
                else if (me.reportParameters[index].referenceTableName == "PrimaryService") {
                    me.ddlists = me.ddlists + 1;
                    me.list = "PrimaryService";
                    me.serviceTypeStore.fetch("userId:[user]", me.dropdownsLoaded, me);
                }
                else if (me.reportParameters[index].referenceTableName == "ServiceLine") {
                    me.ddlists = me.ddlists + 1;
                    me.list = "ServiceLine";
                    me.serviceLineStore.fetch("userId:[user]", me.dropdownsLoaded, me);
                }
                else if (me.reportParameters[index].referenceTableName == "ContractType") {
                    me.ddlists = me.ddlists + 1;
                    me.list = "ContractType";
                    me.contractTypeStore.fetch("userId:[user]", me.dropdownsLoaded, me);
                }	
			}
			
			if (me.list == "")
				me.controlsLoaded();
		},
		
		dropdownsLoaded: function(me, activeId) {

			me.ddlists = me.ddlists - 1;
			if (me.ddlists <= 0)
				me.controlsLoaded();			
		},
		
		controlsLoaded: function() {
			var me = this;
			var html = "";

			me.dependentTypes = [];
			
			for (var index = 0; index < me.reportParameters.length; index++) {
				if (me.reportParameters[index].controlType == "Date" && me.reportParameters[index].mandatory)
					html += "\n<div><div class='labelReport'>" + me.reportParameters[index].title + ":</div><div><input class='inputTextSize' type='text' id='" + me.reportParameters[index].name + "'></input></div><div><input type='checkbox' id='dateCheck' checked='true' class='checkMandatory' onchange='fin.reportUi.dateMandatory(this," + index + ");' /></div><div class='labelSchedule'>NULL</div></div>"
				else if (me.reportParameters[index].controlType == "Date" && !me.reportParameters[index].mandatory)
					html += "\n<div><div class='labelReport'>" + me.reportParameters[index].title + ":</div><div><input class='inputTextSize' type='text' id='" + me.reportParameters[index].name + "'></input></div></div>"
				else
					html += "\n<div><div class='labelReport'>" + me.reportParameters[index].title + ":</div><div id='" + me.reportParameters[index].name + "' class='inputTextMedium' style='width:" + me.reportParameters[index].Width + "px;'></div><div id='customersLoading'></div></div>"										
				html += "\n<div style='clear:both;'></div>";
			}

			$("#ParameterContainer").html(html);

			me.controls = [];

			for (var index = 0; index < me.reportParameters.length; index++) {								
				if (me.reportParameters[index].controlType == "Text") {
					me.controls[index] = new ui.ctl.Input.Text({
				        id: "" + me.reportParameters[index].name,
				        maxLength: 64
				    });

					me.controls[index].makeEnterTab()
						.setValidationMaster(me.validator)
						.addValidation(ui.ctl.Input.Validation.required);

					me.controls[index].resizeText();
					if (me.reportParameters[index].name == "CreateUserID") {
						$("#CreateUserIDText").val(me.session.propertyGet("userName"));
						$("#CreateUserIDText").attr("readonly", true);
					}
				}
				else if (me.reportParameters[index].controlType == "CheckBox") {
					me.controls[index] = new ui.ctl.Input.Check({
				        id: "" + me.reportParameters[index].name
				    });
				}
				else if (me.reportParameters[index].controlType == "DropDown") {
					$("#" + me.reportParameters[index].name).html("");										
					me.populateMultiSelectDropDown(me.reportParameters[index].referenceTableName, me.reportParameters[index].name, me.reportParameters[index].defaultValue);                       						
					$("#" + me.reportParameters[index].name).multiselect({
						minWidth: me.reportParameters[index].Width,
						header: false,
						multiple: false,
						noneSelectedText: "",
						selectedList: 1,						
						selectedText: function(numChecked, numTotal, checkedItems) {
                            var parametersList = "";
							var selectedItems = 0;
                            var selectedValues = $("#" + this.element[0].id).multiselect("getChecked").map(function() {
                                return this.title;
                            }).get();
                            
                            for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
                                if (selectedValues[selectedIndex] != '(Select All)')
                                    parametersList = parametersList + ', ' + selectedValues[selectedIndex];
									selectedItems = selectedItems + 1;
                            }
                            parametersList = parametersList.substring(1, parametersList.length);
							
							if(selectedValues.length > 4)
                                return "" + selectedItems + "" + " selected";
                            else
                            	return parametersList;
                        },
                        click: function(event, ui) {                                                                                    
                            if (event.originalEvent.currentTarget.id.indexOf("FiscalYear") > 0)
                            	me.fiscalweeksLoad(ui.value);                            
                            else if (event.originalEvent.currentTarget.id.indexOf("ExcludeHierarchyLevel") > 0)                           	
                        		me.excludeNamesLoaded(ui.value);                            
                        },						
						position: {
							my: 'left bottom',
							at: 'left top'
						}
					});

					me.controls[index] = $("#" + me.reportParameters[index].name);
				}
				else if (me.reportParameters[index].controlType == "Date") {
					$("#" + me.reportParameters[index].name).datepicker({
						changeMonth: true,
						changeYear: true
					});
					
					me.controls[index] = $("#" + me.reportParameters[index].name);
					if (me.reportParameters[index].mandatory) {
                    	me.controls[index][0].disabled = true;
                    }
				}
				else if (me.reportParameters[index].controlType == "MultiSelect") {
					if (me.reportParameters[index].referenceTableName == "Customer" || me.reportParameters[index].referenceTableName == "Exclude" || me.reportParameters[index].referenceTableName == "ExcludeHouseCode" || me.reportParameters[index].referenceTableName == "HouseCode")
						me.dependentTypes.push(me.reportParameters[index].referenceTableName);

					$("#" + me.reportParameters[index].name).html("");										
					me.populateMultiSelectDropDown(me.reportParameters[index].referenceTableName, me.reportParameters[index].name, me.reportParameters[index].defaultValue);                       						
					$("#" + me.reportParameters[index].name).multiselect({
						minWidth: 280,
						header: false,
						noneSelectedText: "",
						selectedList: 4,						
						selectedText: function(numChecked, numTotal, checkedItems) {
                            var parametersList = "";
							var selectedItems = 0;
                            var selectedValues = $("#" + this.element[0].id).multiselect("getChecked").map(function() {
                                return this.title;
                            }).get();
                            
                            for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
                                if (selectedValues[selectedIndex] != '(Select All)')
                                    parametersList = parametersList + ', ' + selectedValues[selectedIndex];
									selectedItems = selectedItems + 1;
                            }
                            parametersList = parametersList.substring(1, parametersList.length);
							
							if(selectedValues.length > 4)
                                return "" + selectedItems + "" + " selected";
                            else
                            	return parametersList;
                        },
                        click: function(event, ui) {                                                                                    
                            if (ui.text == "(Select All)") {
                                if (ui.checked)
                                    $("#" + event.target.id).multiselect("checkAll");
                                else if (!ui.checked)
                                    $("#" + event.target.id).multiselect("uncheckAll");
                            }
							else {
                                if (!ui.checked
                                && $("#ui-multiselect-"+event.target.id+"-option-0")[0].title == '(Select All)'
                                && $("#ui-multiselect-"+event.target.id+"-option-0")[0].checked)
                                    $("#ui-multiselect-"+event.target.id+"-option-0")[0].checked = false;
                            }
                        },
						open: function( e ){							
							if (e.target.id == 'Customers') {
								if (me.namesList != me.names.replace("~", "") || me.url != me.reportURL) {
									me.url = me.reportURL	
									$("#Customers").html("");
									$("#Customers").multiselect("refresh");
									if (me.level == '' || me.name == '') 									
										return false;
									me.namesList = me.names.replace("~", "");
									me.levelName = me.level.replace("~Level=", "");											
									me.setStatus("Loading");
									$("#customersLoading").addClass('loading');
									me.genericTypeStore.fetch("level:" + me.levelName + ",name:" + me.namesList + ",genericType:Customers,userId:[user]", me.customersLoaded, me);
								}
							}							
						},						
						position: {
							my: 'left bottom',
							at: 'left top'
						}
					});

					me.controls[index] = $("#" + me.reportParameters[index].name);
				}						
			}			
			
			if (me.reportParameters.length > 0) {
                $("#ParameterContainer").show();
                $("#LevelNamesContainer").height(($(window).height() - 183) - $("#ParameterContainer").height());
            }               
            else {
                $("#ParameterContainer").hide();
                $("#LevelNamesContainer").height(($(window).height() - 160));
            }
            
			me.checkLoadCount();
		},
		
		populateMultiSelectDropDown: function() {
			var args = ii.args(arguments, {
				referenceTableName: {type: String}
				, name: {type: String}
				, defaultValue: {type: String}
			});
			var me = this;			
			var typeTableData = [];
			
			if (args.referenceTableName == "PayCode") {
                me.typeAllOrNoneAdd(me.payCodeTypes, "(Select All)");
                typeTableData = me.payCodeTypes;
            }
			else if (args.referenceTableName == "EmployeeStatus") {
                me.typeAllOrNoneAdd(me.statusTypes, "(Select All)");
                typeTableData = me.statusTypes;
            }
			else if (args.referenceTableName == "Shift") {
                me.typeAllOrNoneAdd(me.workShifts, "(Select All)");
                typeTableData = me.workShifts;
            }
			else if (args.referenceTableName == "FscAccount") {
                me.typeAllOrNoneAdd(me.accounts, "(Select All)");
                typeTableData = me.accounts;
            }
			else if (args.referenceTableName == "StatusType" &&  args.name == "InvoiceStatus") {
                me.typeAllOrNoneAdd(me.rptStatusTypes, "(Select All)");
                typeTableData = me.rptStatusTypes;
            }
			else if (args.referenceTableName == "StatusType" &&  args.name == "WOStatus") {
                me.typeAllOrNoneAdd(me.woStatus, "(Select All)");
                typeTableData = me.woStatus;
            }
			else if (args.referenceTableName == "States") {
                me.typeAllOrNoneAdd(me.stateTypes, "(Select All)");
                typeTableData = me.stateTypes;
            }               
            else if (args.referenceTableName == "PrimaryService") {
                me.typeAllOrNoneAdd(me.serviceTypes, "(Select All)");
                typeTableData = me.serviceTypes;
            }       
            else if (args.referenceTableName == "ServiceLine") {
                me.serviceLineTypes = [];
                for (var index = 0; index < me.serviceLines.length; index++) {
                    if (!me.serviceLines[index].financialEntity) {
                        var item = new fin.rpt.ssrs.ServiceLine({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
                        me.serviceLineTypes.push(item);
                    }               
                }
                me.typeAllOrNoneAdd(me.serviceLineTypes, "(Select All)");
                typeTableData = me.serviceLineTypes;
            }               
            else if (args.referenceTableName == "FinancialEntity") {
                me.financialEntities = [];
                for (var index = 0; index < me.serviceLines.length; index++) {
                    if (me.serviceLines[index].financialEntity) {
                        var item = new fin.rpt.ssrs.FinancialEntity({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
                        me.financialEntities.push(item);
                    }               
                }
                me.typeAllOrNoneAdd(me.financialEntities, "(Select All)");
                typeTableData = me.financialEntities;
            }               
            else if (args.referenceTableName == "ContractType") {
                me.typeAllOrNoneAdd(me.contractTypes, "(Select All)");
                typeTableData = me.contractTypes;
            }
            else if (args.referenceTableName == "Exclude" || args.referenceTableName == "ExcludeHouseCode") {
            	if(me.excludeHouseCodes.length > 0) {
            		$("#" + args.name).append("<option title='(Select All)' value='-1'>(Select All)</option>");
            		$("#" + args.name).append("<option title='None' value='0' selected>None</option>");
            	}				
                typeTableData = me.excludeHouseCodes;
            }
            else if (args.referenceTableName == "HouseCode") {
            	me.typeAllOrNoneAdd(me.filteredHouseCodes, "(Select All)");
                typeTableData = me.filteredHouseCodes;
            }
            else if (args.referenceTableName == "ExName")
                $("#" + args.name).append("<option selected title='None' value='0'>None</option>");            
            else if (args.referenceTableName == "FscYear")
				typeTableData = me.fiscalYears;            
            else if (args.referenceTableName == "FscPeriod" || args.referenceTableName == "YearPeriods" || args.referenceTableName == "FscPeriodFrom" || args.referenceTableName == "FscPeriodTo") 
                typeTableData = me.fiscalPeriods;            
            else if (args.referenceTableName == "PayrollCompany")
                typeTableData = me.payrollCompanys;            
            else if (args.referenceTableName == "BatchNumber")
                typeTableData = me.invoiceBatches;            
            else if (args.referenceTableName == "WkPeriod")
                typeTableData = me.weekPeriods;            
            else if (args.referenceTableName == "OverHead" || args.referenceTableName == "Overhead") 
                typeTableData = me.excludeOverheadAccounts;            
            else if (args.referenceTableName == "YearPeriods")
                typeTableData = me.yearPeriods;            
            else if (args.referenceTableName == "PayPeriod")
                typeTableData = me.payPeriodEndingDates;            
            else if (args.referenceTableName == "ExLevel")           	
                typeTableData = me.levels;
            else if (args.referenceTableName == "Report" && args.name == "ReportType")
                typeTableData = me.payrollReportTypes;
            else if (args.referenceTableName == "ReportType")
                typeTableData = me.reportTypes;            
            else if (args.referenceTableName == "Report" && args.name == "Budget")
                typeTableData = me.budgetTypes;            
            else if (args.referenceTableName == "CrothallEmployee")
                typeTableData = me.crothallEmployees;            
            else if (args.referenceTableName == "Week")
                typeTableData = me.currentWeeks;            
            else if (args.referenceTableName == "Comments")
                typeTableData = me.comments;            
            else if (args.referenceTableName == "UnionNonUnion")
                typeTableData = me.unions;            
            else if (args.referenceTableName == "EntryMethod")
                typeTableData = me.entryMethods;            
            else if (args.referenceTableName == "Hour40Exception")
                typeTableData = me.hour40Exceptions;            
            else if (args.referenceTableName == "HouseCodeStatus")
                typeTableData = me.houseCodeStatus;            
            else if (args.referenceTableName == "ShowCntHrs")
                typeTableData = me.countHours;
            else if (args.referenceTableName == "Exception")
                typeTableData = me.exceptions;
            else if (args.referenceTableName == "GroupLevel")
            	me.groupLevelsLoaded();            
				
			for (var index = 0; index < typeTableData.length; index++) {
                var value = typeTableData[index].id;
                var parameter = typeTableData[index].parameter;
                var title = typeTableData[index].name;

                if (args.referenceTableName == "States" 
	                || args.referenceTableName == "PayCode" 
	                || args.referenceTableName == "HouseCode" 
	                || args.referenceTableName == "FscYear")
                    $("#" + args.name).append("<option title='" + title + "' value='" + value + "'>" + title + "</option>");
                else if (args.referenceTableName == "YearPeriods" || args.referenceTableName == "FscPeriod" || args.referenceTableName == "FscPeriodFrom" || args.referenceTableName == "FscPeriodTo")
                    $("#" + args.name).append("<option title='" + 'Period ' + title + ' - ' + typeTableData[index].fscYeaTitle + "' value='" + value + "'>" + 'Period ' + title + ' - ' + typeTableData[index].fscYeaTitle + "</option>");
                else if (args.referenceTableName == "PayrollCompany")
                    $("#" + args.name).append("<option title='" + typeTableData[index].brief + ' - ' + title + "' value='" + typeTableData[index].brief + "'>" + typeTableData[index].brief + ' - ' + title + "</option>");
                else if (args.referenceTableName == "Shift") {
                    if (typeTableData[index].startTime == undefined)
                        $("#" + args.name).append("<option title='" + title + "' value='" + value + "'>" + title + "</option>");
                    else
                        $("#" + args.name).append("<option title='" + title + "' value='" + value + "'>" + title + ' - ' + typeTableData[index].startTime + ' - ' + typeTableData[index].endTime + "</option>");
                }
                else  if (args.referenceTableName == "FscAccount") {
                    if (typeTableData[index].code == undefined)
                        $("#" + args.name).append("<option title='" + title + "' value='" + value + "'>" + title + "</option>");
                    else
                        $("#" + args.name).append("<option title='" + title + "' value='" + value + "'>" + typeTableData[index].code + ' - ' + typeTableData[index].description + "</option>");                       
                }                   
                else if (args.referenceTableName == "EmployeeStatus" ||
                    args.referenceTableName == "PrimaryService" ||
                    args.referenceTableName == "ServiceLine" ||
                    args.referenceTableName == "FinancialEntity" ||
                    args.referenceTableName == "ContractType")
                        $("#" + args.name).append("<option title='" + title + "' value='" + title + "'>" + title + "</option>");
				else if (args.referenceTableName == "Exclude" || args.referenceTableName == "ExcludeHouseCode")                    
                    $("#" + args.name).append("<option title='" + typeTableData[index].title + "' value='" + value + "'>" + typeTableData[index].title + "</option>");
                else if (args.referenceTableName == "BatchNumber")                    
                    $("#" + args.name).append("<option title='" + typeTableData[index].title + "' value='" + value + "'>" + typeTableData[index].batchId + ':' + typeTableData[index].title + "</option>");                        
                else {
                	if (title == args.defaultValue || parameter == args.defaultValue)
                		$("#" + args.name).append("<option title='" + title + "' value='" + parameter + "' Selected>" + title + "</option>");
            		else
            			$("#" + args.name).append("<option title='" + title + "' value='" + parameter + "'>" + title + "</option>");
                }                    
            }
            
            if (args.defaultValue == "(Select All)")
                $("#" + args.name + " option").prop("selected", true);            
		},
		
		dateMandatory: function(object, index) {            
            var me = this;
            
            if (object.checked) {
                me.controls[index][0].value = "";
                me.controls[index][0].disabled = true;
            }
            else if (!object.checked) {
                me.controls[index][0].disabled = false;
            }
        },
        
        typeAllOrNoneAdd: function () {
            var args = ii.args(arguments, {
                data: {type: [Object]}
                , title: {type: String, required: false, defaultValue: ""}
            });         
            var me = this;
            
            //index > 0, condition is included as some droplist already has None as type in it.
            var index = me.findIndexByTitle(args.title, args.data);
            if (index == null || index > 0) 
                args.data.unshift({ id: 0, name: args.title });
        },
		
		getNodeIndex: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number} 
			});
			var me = this;

			for (var index = 0; index < me.reportNodes.length; index++) {
				if (me.reportNodes[index].id == args.hirNode)
					return index;
			}

			return -1;
		},
		
		customersLoaded: function(me, activeId) {
			me.customers = me.genericTypes.slice();
			$("#Customers").html("");
			me.typeAllOrNoneAdd(me.customers, "(Select All)");
			for (var index = 0; index < me.customers.length; index++) {
				$("#Customers").append("<option title='" + me.customers[index].name + "' value='" + me.customers[index].id + "'>" + me.customers[index].name + "</option>");
			}
			$("#Customers option").prop("selected", true);
			$("#Customers").multiselect("refresh");
			me.setStatus("Loaded");
			$("#customersLoading").removeClass('loading');
		},
				
		groupLevelsLoaded: function() {
            var me = this;
            me.groupLevels = [];
            
            if (me.level == "~Level=ENT") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(37, "ENT", "ENT"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(2, "SVP", "SVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(34, "DVP", "DVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(3, "RVP", "RVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(36, "SRM", "SRM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=SVP") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(2, "SVP", "SVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(34, "DVP", "DVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(3, "RVP", "RVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(36, "SRM", "SRM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }   
            else if (me.level == "~Level=DVP") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(34, "DVP", "DVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(3, "RVP", "RVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(36, "SRM", "SRM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=RVP") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(3, "RVP", "RVP"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(36, "SRM", "SRM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=SRM") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(36, "SRM", "SRM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=RM") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(4, "RM", "RM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=AM") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(41, "AM", "AM"));
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }
            else if (me.level == "~Level=SiteName") {
                me.groupLevels.push(new fin.rpt.ssrs.GroupLevel(7, "SiteName", "SiteName"));
            }            
            
            $("#GroupLevel").html("");
            for (var index = 0; index < me.groupLevels.length; index++) {
                $("#GroupLevel").append("<option title='" + me.groupLevels[index].parameter + "' value='" + me.groupLevels[index].id + "'>" + me.groupLevels[index].parameter + "</option>");
            }
            $("#GroupLevel").multiselect("refresh");
        },
		
		fiscalweeksLoad: function(yearSelected) {
			var me = this;
			
			if (me.controls[1].selector != "#FiscalWeek")
				return;
						
			me.setLoadCount(); 
			me.genericTypeStore.fetch("name:" + yearSelected + ",genericType:FiscalWeek,userId:[user]", me.fiscalweeksLoaded, me);			
		},
		
		fiscalweeksLoaded: function(me, activeId) {
			$("#FiscalWeek").html("");
			for (var index = 0; index < me.genericTypes.length; index++) {
                $("#FiscalWeek").append("<option title='" + me.genericTypes[index].parameter + "' value='" + me.genericTypes[index].id + "'>" + me.genericTypes[index].parameter + "</option>");
            }
			$("#FiscalWeek").multiselect("refresh");			
			//me.controls[1].setData(me.genericTypes);
			me.checkLoadCount();			
		},
		
		excludeNamesLoaded: function(levelSelected) {
			var me = this;
			var nodes = [];
			var levelIndex = 0;
			var $scope = angular.element($("#SearchContainer")).scope();
			$scope.$apply(function() {
				$scope.nodes = me.hirNodes.slice();
			});
			
			if(levelSelected != "0")
				levelIndex = me.findIndexByTitle(levelSelected, me.levels)
			
			nodes = $.grep(me.hirNodes, function(item, index) {
				    return item.hirLevel == me.levels[levelIndex].id;
				});
						
			$("#ExcludeNames").html("");
			for (var index = 0; index < nodes.length; index++) {
                $("#ExcludeNames").append("<option title='" + nodes[index].title + "' value='" + nodes[index].id + "'>" + nodes[index].title + "</option>");
            }
			$("#ExcludeNames").multiselect("refresh");			
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object}  // The (key) event object
			});			
			var event = args.event;
			var me = event.data;

			if (event.keyCode == 13) {
				me.actionUnitLoad();
			}
		},

		actionUnitLoad: function() {
			var me = this;
			var searchText = me.appUnit.getValue();

			if (searchText == "")
				return;

			var found = false;
			for (var index = 0; index < me.hirOrgs.length; index++) {
				if (me.hirOrgs[index].brief == searchText) {
					me.hirNodeCurrentId = me.hirOrgs[index].id;
					found = true;
					break;
				}
			}

			if (found) {
				me.hirOrgsLoaded(me, 0);
			}
			else {
				$("#AppUnitText").addClass("Loading");			
				me.unitStore.fetch("userId:[user],unitBrief:" + searchText + ",", me.actionUnitsLoaded, me);
			}						
		},

		actionUnitsLoaded: function(me, activeId) {

			$("#AppUnitText").removeClass("Loading");

			if (me.units.length <= 0) {

				ii.trace("Could not load the said Unit.", ii.traceTypes.Information, "Information");
				alert("There is no corresponding Unit available or you do not have enough permission to access it.");

				return;
			}

			me.appUnit.setValue(me.units[0].description);
			me.hirNodeCurrentId = me.units[0].hirNode;

			$("#popupLoading").show();
			ii.trace("organization node loading", ii.traceTypes.Information, "Information");

			me.hirOrgLoad("search");
		},

		hirOrgLoad: function() {
			var args = ii.args(arguments, {
				flag: {type: String, required: false}
			});				
			var me = this;

			me.hirOrgStore.reset();

			if (args.flag)
				me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true,sFilter:false", me.hirOrgsLoaded, me);
			else
				me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",ancestors:true,sFilter:false", me.hirOrgsLoaded, me);
			ii.trace("Organization nodes loading", ii.traceTypes.Information, "Information");
		},

		hirOrgsLoaded: function (me, activeId) {

			if (me.hirOrgs.length == 0) {
				$("#messageToUser").html("Load Failed.");
				$("#pageLoading").show();
				ii.trace("Could not fetch required [Org Info].", ii.traceTypes.errorUserAffected, "Error");
				return false;
			}

			$("#hirOrg").html("");

			me.nodeHierarchy = new ui.ctl.Hierarchy({
				nodeStore: me.hirOrgStore,
				domId: "hirOrg",
				baseClass: "iiHierarchy",
				actionLevel: 9,
				actionCallback: function(node) { me.hirNodeCallBack(node); },
				topNode: me.hirOrgs[0],
				currentNode: ii.ajax.util.findItemById(me.hirNodeCurrentId.toString(), me.hirOrgs),
				hasSelectedState: false,
				multiSelect: true
			});

			if (me.status == "edit") {
				var orgNodes = [];
				var node = me.nodeHierarchy.currentNode;
				var item = new fin.rpt.ssrs.HirNode({ id: node.id, number: node.id, fullPath: node.fullPath });
				orgNodes.push(item);
				me.nodeHierarchy.setData(orgNodes);
			}

			$("#popupLoading").hide();
			ii.trace("Org/Management Nodes Loaded.", ii.traceTypes.Information, "Information");
		},

		reportChanged: function() {
			var me = this;

			me.status = "";

			if (me.ssrsReport.indexSelected >= 0) {
				if ($("#pageHeader").html() == "SSRS Report Subscriptions") {
					me.resetScheduleInfo();
					me.loadReportParameters(me.ssrsReport.data[me.ssrsReport.indexSelected].id);
				}
			}
		},

		resizeControls: function() {
			var me = this;

			me.ssrsReport.resizeText();
			me.description.resizeText();
			me.deliveredBy.resizeText();
			me.to.resizeText();
			me.cc.resizeText();
			me.subject.resizeText();
			me.reportFormat.resizeText();
			me.priority.resizeText();
			me.hour.resizeText();
			me.minute.resizeText();
			me.startHour.resizeText();
			me.startMinute.resizeText();
			me.numberOfDays.resizeText();
			me.numberOfWeeks.resizeText();
			me.weekOfMonth.resizeText();
			me.calendarDays.resizeText();
			me.startDate.resizeText();
			me.endDate.resizeText();
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.description.setValue("");
			me.deliveredBy.select(0, me.deliveredBy.focused);
			me.to.setValue("");
			me.cc.setValue("");
			me.subject.setValue("");
			me.includeReport.check.checked = false;
			me.includeLink.check.checked = false;
			me.reportFormat.select(0, me.reportFormat.focused);
			me.priority.select(0, me.priority.focused);
			me.comment.value = "";

			me.sunday.check.checked = false;
			me.monday.check.checked = false;
			me.tuesday.check.checked = false;
			me.wednesday.check.checked = false;
			me.thursday.check.checked = false;
			me.friday.check.checked = false;
			me.saturday.check.checked = false;

			me.jan.check.checked = false;
			me.feb.check.checked = false;
			me.mar.check.checked = false;
			me.apr.check.checked = false;
			me.may.check.checked = false;
			me.jun.check.checked = false;
			me.jul.check.checked = false;
			me.aug.check.checked = false;
			me.sep.check.checked = false;
			me.oct.check.checked = false;
			me.nov.check.checked = false;
			me.dec.check.checked = false;

			$("#Hourly")[0].checked = true;
			$("#Days")[0].checked = true;
			$("#rbWeekOfMonth")[0].checked = true;
			$("#AM")[0].checked = true;

			me.hour.select(23, me.hour.focused);
			me.minute.select(0, me.minute.focused);
			me.startHour.select(11, me.hour.focused);
			me.startMinute.select(0, me.minute.focused);
			me.numberOfDays.setValue("");
			me.numberOfWeeks.setValue("");
			me.weekOfMonth.select(0, me.weekOfMonth.focused);
			me.calendarDays.setValue("");
			me.startDate.setValue("");
			me.endDate.setValue("");
			me.stopSchedule.check.checked = false;

			me.numberOfDays.text.readOnly = true;
			me.calendarDays.text.readOnly = true;

			for (var index = 0; index < me.reportParameters.length; index++) {
				if (me.reportParameters[index].controlType == "CheckBox")
					me.controls[index].check.checked = false;
				else if (me.reportParameters[index].controlType == "Text" || me.reportParameters[index].controlType == "TreeView")
					me.controls[index].setValue("");
				else if (me.reportParameters[index].controlType == "DropDown")
					me.controls[index].reset();
			}
		},

		findIndexByTitle: function() {
			var args = ii.args(arguments, {
                title: {type: String}       // The id to use to find the object.
                , data: {type: [Object]}    // The data array to be searched.
            });     
            var title = args.title;
            var data = args.data;
            var name = "";
            
            for (var index = 0; index < data.length; index++ ) {
                if (data[index].name != undefined)
                        name = data[index].name;
                    else
                        name = data[index].title;
    
                if (name.toLowerCase() == title.toLowerCase()) {
                    return index; 
                }
            }
 
            return null;
		},
		/*
		actionRefreshItem: function() {
			var me = this;
			me.levelName = "";
			me.namesList = "";
			
			if (me.reportURL == "") {
				alert("Please select Node.");
				return false;
			}
			
			if (me.level == "") {
				alert("Please select Level.");
				return false;
			}
			
			if (me.name == "") {
				alert("Please select Name.");
				return false;
			}
			
			me.namesList = me.names.replace("~", "");
			me.levelName = me.level.replace("~Level=", "");
			me.setLoadCount();
			me.genericTypeStore.fetch("level:" + me.levelName + ",name:" + me.namesList + ",genericType:Customers,userId:[user]", me.customersLoaded, me);
		},*/
		
		actionGenerateReportItem: function() {
			var me = this;
			var parametersList = "";
			var valid = true;
			var parameter = "";

			for (var index = 0; index < me.controls.length; index++) {
				if (me.reportParameters[index].controlType == "Text")
					me.controls[index].validate(true);
			}

			for (var index = 0; index < me.controls.length; index++) {
				if (me.reportParameters[index].controlType == "Text") {
					if (!me.controls[index].valid) {
						valid = false;
						break;
					}
				}
			}

			if (!valid) {
				alert("In order to generate the report, the errors on the page must be corrected.");
				return false;
			}
			
			if (me.reportURL == "") {
				alert("Please select the Report.");
				return false;
			}
			
			if (me.level == "") {
				alert("Please select the Level.");
				return false;
			}
			
			if (me.name == "") {
				alert("Please select the Name.");
				return false;
			}	 
			
			for (var index = 0; index < me.reportParameters.length; index++) {
                if (me.reportParameters[index].controlType == "Text")
                    parametersList += "~" + me.reportParameters[index].name + "=" + me.controls[index].getValue();
                else if (me.reportParameters[index].controlType == "Date") {
                	if (!me.reportParameters[index].mandatory || (me.reportParameters[index].mandatory && !$("#dateCheck")[0].checked)) {
                		if (ui.cmn.text.validate.generic(me.controls[index][0].value, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$"))
	                		parametersList += "~" + me.reportParameters[index].name + "=" + me.controls[index][0].value;	                		
						else {
							alert("Please enter valid " + me.reportParameters[index].title)
							return false;
						}
                	}                							                    
                }                   
                else if (me.reportParameters[index].controlType == "DropDown")    {
                	var selectedValues = $("#" + me.controls[index][0].id).multiselect("getChecked").map(function(){
                        return this.value;
                    }).get();
                    if(selectedValues.length > 0) {
                        for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
                            if (selectedValues[selectedIndex] != "undefined")
                            parametersList += "~" + me.reportParameters[index].referenceTableName + "=" + selectedValues[selectedIndex];
                        }
                    }
                    else {
                            alert("Please select " + me.reportParameters[index].title);
                            return false;
                    }
                    
                    //if (me.reportParameters[index].referenceTableName == "PayrollCompany")
                    //    parameter = me.controls[index].data[me.controls[index].indexSelected].brief
                    //else if (me.reportParameters[index].referenceTableName == "FscPeriod"
                    //        || me.reportParameters[index].referenceTableName == "BatchNumber"
                    //        || me.reportParameters[index].referenceTableName == "FscPeriodFrom" 
                    //        || me.reportParameters[index].referenceTableName == "FscPeriodTo"
                    //        || me.reportParameters[index].referenceTableName == "FscYear"
                    //        || me.reportParameters[index].referenceTableName == "YearPeriods")
                    //    parameter = me.controls[index].data[me.controls[index].indexSelected].id
                    //else
                    //    parameter = me.controls[index].data[me.controls[index].indexSelected].parameter
                                                
                    //parametersList += "~" + me.reportParameters[index].referenceTableName + "=" + parameter;
                }
                else if (me.reportParameters[index].controlType == "MultiSelect") {
                    var selectedValues = $("#" + me.controls[index][0].id).multiselect("getChecked").map(function(){
                        return this.value;
                    }).get();
                    if(selectedValues.length > 0) {
                        for (var selectedIndex = 0; selectedIndex < selectedValues.length; selectedIndex++) {
                            if (selectedValues[selectedIndex] != "undefined")
                            parametersList += "~" + me.reportParameters[index].referenceTableName + "=" + selectedValues[selectedIndex];
                        }
                    }
                    else {
                            alert("Please select " + me.reportParameters[index].title);
                            return false;
                    }
                }
            }
			
			parametersList = "UserID=" + me.session.propertyGet("userName") + me.level + me.name + parametersList;
			ii.trace("Parameters:", parametersList, "Information");
			var form = document.createElement("form");
			form.setAttribute("method", "post");
			form.setAttribute("action", me.reportURL);			
			form.setAttribute("target", "_blank");
			
			var parameters = parametersList.split("~");
			for (var index = 0; index < parameters.length; index++) {
				var nameValuePair;
				var nameValues = [];
				var hiddenField = document.createElement("input");
				
				nameValuePair = parameters[index].toString();
				nameValues = nameValuePair.split("=");
				hiddenField.setAttribute("type", "hidden");		
				hiddenField.setAttribute("name", nameValues[0]);		
				hiddenField.setAttribute("value", nameValues[1]);		
				form.appendChild(hiddenField);
			}
			
			document.body.appendChild(form);
			form.submit();				
		},
		
		actionReportItem: function() {
			var me = this;

			$("#pageHeader").html("SSRS Reports");
			$("#SubscriptionContainer").hide();
			$("#ReportContainer").show();

			me.reportType = "Report";
		},

		actionSubscriptionItem: function() {
			var me = this;

			$("#pageHeader").html("SSRS Report Subscriptions");
			$("#ReportContainer").hide();
			$("#SubscriptionContainer").show();			

			me.ssrsReport.setData(me.ssrsReportSubscriptions);
			me.reportType = "Subscription";
			me.resetScheduleInfo();
			me.resizeControls();

			if (me.ssrsReportSubscriptions.length > 0) {
				me.ssrsReport.select(0, me.ssrsReport.focused);
				me.loadReportParameters(me.ssrsReport.data[me.ssrsReport.indexSelected].id);
			}
			else
				me.subscriptionsLoaded(me, 0);
		},

		loadReportParameters: function(reportId) {
			var me = this;			

			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			me.reportParameterStore.fetch("userId:[user],reportId:" + reportId, me.reportParametersLoaded, me);
		},

		reportParametersLoaded: function(me, activeId) {

			var html = "";

			for (var index = 0; index < me.reportParameters.length; index++) {
				html += "\n<div class='labelSubscription'>" + me.reportParameters[index].title + ":</div><div id='" + me.reportParameters[index].name + "' class='inputTextMedium'></div>"
				if (me.reportParameters[index].controlType == "TreeView") {
					html += "<div id='nodeSearchImage' class='nodeSearch'></div>";
				}					
				html += "\n<div style='clear:both;'></div>";
			}

			$("#ParemeterContainer").html(html);

			$("#nodeSearchImage").click( function() {
				if (me.status == "edit")
					me.hirNodeCurrentId = me.hirNodeId;
				else
					me.hirNodeCurrentId = me.getHirNodeCurrentId();

				me.hirOrgLoad("search");
				me.loadPopup("hirOrgPopup");
				me.appUnit.setValue("");
				me.appUnit.resizeText();
				$("#popupLoading").show();
			});

			me.controls = [];

			for (var index = 0; index < me.reportParameters.length; index++) {				
				if (me.reportParameters[index].controlType == "Text" || me.reportParameters[index].controlType == "TreeView") {
					me.controls[index] = new ui.ctl.Input.Text({
				        id: "" + me.reportParameters[index].name,
				        maxLength: 64
				    });

					me.controls[index].makeEnterTab()
						.setValidationMaster(me.validator)
						.addValidation(ui.ctl.Input.Validation.required);

					me.controls[index].resizeText();

					if (me.reportParameters[index].controlType == "TreeView") {
						me.controls[index].text.readOnly = true;
						me.hirNode = me.controls[index];
					}						
				}
				else if (me.reportParameters[index].controlType == "CheckBox") {
					me.controls[index] = new ui.ctl.Input.Check({
				        id: "" + me.reportParameters[index].name
				    });
				}
				else if (me.reportParameters[index].controlType == "DropDown") {
					me.controls[index] = new ui.ctl.Input.DropDown.Filtered({
				        id: "" + me.reportParameters[index].name,
						labelName: "" + me.reportParameters[index].title,
						formatFunction: function( type ) { return type.name; }
				    });

					me.controls[index].makeEnterTab()
						.setValidationMaster(me.validator)
						.addValidation(ui.ctl.Input.Validation.required)	
						.addValidation( function( isFinal, dataMap ) {

							if ((this.focused || this.touched) && this.indexSelected == -1)
								this.setInvalid("Please select the correct " + this.labelName + ".");
						});
				}
				else if (me.reportParameters[index].controlType == "Date") {
					me.controls[index] = new ui.ctl.Input.Date({
				        id: "" + me.reportParameters[index].name,
						labelName: "" + me.reportParameters[index].title,
						formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
				    });
					
					me.controls[index].resizeText();
					
					me.controls[index].makeEnterTab()
						.setValidationMaster( me.validator )
						.addValidation( function( isFinal, dataMap ) {
		
							var enteredText = this.text.value;

							if (enteredText == "") return;
													
							if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
								this.setInvalid("Please enter valid " + this.labelName + ".");					
					});
				}						
			}

			me.subscriptionStore.fetch("userId:[user],reportName:" + me.ssrsReportSubscriptions[me.ssrsReport.indexSelected].name, me.subscriptionsLoaded, me);
		},

		subscriptionsLoaded: function(me, activeId) {

			me.setControlData();
			me.subscriptionGrid.setData(me.subscriptions);
			me.subscriptionGrid.setHeight($(window).height() - 80);
			$("#pageLoading").hide();
		},
		
		setControlData: function() {
			var me = this;
			
			for (var index = 0; index < me.controls.length; index++) {
				if (me.controls[index].labelName == "Fiscal Year") {
					me.controls[index].setData(me.fiscalYears);
					if (parent.fin.appUI.glbFscYear != undefined) {
						var itemIndex = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.fiscalYears);
						if (index != undefined)
							me.controls[index].select(itemIndex, me.controls[index].focused);
					}
				}
				else if (me.controls[index].labelName == "Fiscal Period") {
					me.controls[index].setData(me.fiscalPeriods);
					if (parent.fin.appUI.glbPeriod != undefined) {
						var itemIndex = ii.ajax.util.findIndexById(parent.fin.appUI.glbPeriod.toString(), me.fiscalPeriods);
						if (index != undefined)
							me.controls[index].select(itemIndex, me.controls[index].focused);
					}
				}
				else if (me.controls[index].labelName == "Fiscal Week") {
					me.controls[index].setData(me.fiscalWeeks);
					if (parent.fin.appUI.glbWeek != undefined) {
						var itemIndex = ii.ajax.util.findIndexById(parent.fin.appUI.glbWeek.toString(), me.fiscalWeeks);
						if (index != undefined)
							me.controls[index].select(itemIndex, me.controls[index].focused);
					}
				}
			}
		},

		actionSelectItem: function() {
			var args = ii.args(arguments,{
				index: {type: Number}
			});
			var me = this;
			var index = args.index;
			var item = me.subscriptionGrid.data[index];

			if (item == undefined) {
				me.subscriptionId = "";
				return;
			}

			me.resetControls();
			me.status = "edit";
			me.lastSelectedRowIndex = index;			
			me.scheduleType = item.scheduleType;
			me.subscriptionId = item.subscriptionId;		
			me.description.setValue(item.description);
			me.to.setValue(item.to);
			me.cc.setValue(item.cc);
			me.subject.setValue(item.subject);
			me.comment.value = item.comment;
			me.includeReport.check.checked = item.includeReport;
			me.includeLink.check.checked = item.includeLink;

			var idIndex = me.findIndexByTitle(item.reportFormat, me.reportFormats);			
			if (idIndex != null)
				me.reportFormat.select(idIndex, me.reportFormat.focused);

			idIndex = me.findIndexByTitle(item.priority, me.priorities);
			if (idIndex != null)
				me.priority.select(idIndex, me.priority.focused);

			me.sunday.check.checked = item.sunday;
			me.monday.check.checked = item.monday;
			me.tuesday.check.checked = item.tuesday;
			me.wednesday.check.checked = item.wednesday;
			me.thursday.check.checked = item.thursday;
			me.friday.check.checked = item.friday;
			me.saturday.check.checked = item.saturday;

			me.jan.check.checked = item.january;
			me.feb.check.checked = item.february;
			me.mar.check.checked = item.march;
			me.apr.check.checked = item.april;
			me.may.check.checked = item.may;
			me.jun.check.checked = item.june;
			me.jul.check.checked = item.july;
			me.aug.check.checked = item.august;
			me.sep.check.checked = item.september;
			me.oct.check.checked = item.october;
			me.nov.check.checked = item.november;
			me.dec.check.checked = item.december;

			me.startDate.setValue(item.startDate);
			me.stopSchedule.check.checked = item.stopSchedule;
			me.endDate.setValue(item.endDate);

			if (item.numberOfDays == 0)
				me.numberOfDays.setValue("");
			else
				me.numberOfDays.setValue(item.numberOfDays);

			if (item.numberOfWeeks == 0)
				me.numberOfWeeks.setValue("");
			else
				me.numberOfWeeks.setValue(item.numberOfWeeks);
			me.calendarDays.setValue(item.days);

			idIndex = me.findIndexByTitle(item.weekOfMonth, me.weeks);			
			if (idIndex != null)
				me.weekOfMonth.select(idIndex, me.weekOfMonth.focused);
			else
				me.weekOfMonth.select(0, me.weekOfMonth.focused);

			var startTimePart = item.startTime.substring(0, 2);
            var startMinutePart = item.startTime.substring(3, 5);
		
            if (parseInt(startTimePart, 10) >= 12) {
				$("#PM")[0].checked = true;
				startTimePart = parseInt(startTimePart, 10) - 12;
			}                
            else
                $("#AM")[0].checked = true;

			idIndex = me.findIndexByTitle(startTimePart, me.startHours);
			if (idIndex != null)
				me.startHour.select(idIndex, me.startHour.focused);

			idIndex = me.findIndexByTitle(startMinutePart, me.minutes);
			if (idIndex != null)
				me.startMinute.select(idIndex, me.startMinute.focused);

			if (me.scheduleType == "MinuteRecurrence") {
				var hours = (item.hours.length == 1) ? "0" + item.hours : item.hours;
				var minutes = (item.minutes.length == 1) ? "0" + item.minutes : item.minutes;

				idIndex = me.findIndexByTitle(hours, me.hours);
				if (idIndex != null)
					me.hour.select(idIndex, me.hour.focused);

				idIndex = me.findIndexByTitle(minutes, me.minutes);
				if (idIndex != null)
					me.minute.select(idIndex, me.minute.focused);
			}
			else if (me.scheduleType == "DailyRecurrence") {
				if (item.numberOfDays > 0)
					$("#RepeatDay")[0].checked = true;
				else if (!item.sunday && item.monday && item.tuesday && item.wednesday && item.thursday && item.friday && !item.saturday)
					$("#WeekDay")[0].checked = true;
				else
					$("#Days")[0].checked = true;
			}
			else if (me.scheduleType == "MonthlyRecurrence") {
				if (item.weekOfMonth != "")
					$("#rbWeekOfMonth")[0].checked = true;
				else
					$("#rbCalendarDays")[0].checked = true;
			}

			if (item.parameters != "") {
				var parametersList = item.parameters.split(',');

				for (var index = 0; index < parametersList.length; index++) {
					var params = parametersList[index].split(':');

					for (var iIndex = 0; iIndex < me.reportParameters.length; iIndex++) {
						if (me.reportParameters[iIndex].name == params[0]) {
							if (me.reportParameters[iIndex].controlType == "CheckBox")
								me.controls[iIndex].check.checked = params[1];
							else if (me.reportParameters[iIndex].controlType == "DropDown") {
								idIndex = ii.ajax.util.findIndexById(params[1], me.controls[iIndex].data);
								if (idIndex != null)
									me.controls[iIndex].select(idIndex, me.controls[iIndex].focused);
							}
							else if (me.reportParameters[iIndex].controlType == "Text")
								me.controls[iIndex].setValue(params[1]);
							else if (me.reportParameters[iIndex].controlType == "TreeView") {
								$("#HirNodeText").addClass("Loading");
								me.hirNodeId = params[1];
								me.setLoadCount();
								me.hirNodeStore.fetch("userId:[user],hirNode:" + params[1], me.hirNodesLoaded, me);
							}
							break;
						}
					}
				}
			}

			me.setScheduleInfo();
		},
		
		getWeekDaysInfo: function() {
			var me = this;

			var message = me.sunday.check.checked ? "Sun, " : "";
			message += me.monday.check.checked ? "Mon, " : "";
			message += me.tuesday.check.checked ? "Tue, " : "";
			message += me.wednesday.check.checked ? "Wed, " : "";
			message += me.thursday.check.checked ? "Thu, " : "";
			message += me.friday.check.checked ? "Fri, " : "";
			message += me.saturday.check.checked ? "Sat, " : "";

			return message.substring(0, message.lastIndexOf(","));
		},
		
		resetScheduleInfo: function() {
			var me = this;
			var date = new Date();
			var currentDate = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();

			me.resetControls();
			me.scheduleType = "MinuteRecurrence";
			me.startDate.setValue(currentDate);
			me.setScheduleInfo();
		},

		setScheduleInfo: function() {
			var me = this;
			var message = "";
			var startTime = "";
			var recurrenceType = 0;

			startTime = parseInt(me.startHours[me.startHour.indexSelected].title, 10) + ":"
				+ me.minutes[me.startMinute.indexSelected].title + " " + $("input[name='rbStartTime']:checked").val();

			if (me.scheduleType == "MinuteRecurrence") {
				message = "Every " + parseInt(me.hours[me.hour.indexSelected].title, 10) + " hour(s) and "
					+ parseInt(me.minutes[me.minute.indexSelected].title, 10) + " minute(s), starting "
					+ me.startDate.lastBlurValue + " at " + startTime;
			}
			else if (me.scheduleType == "DailyRecurrence") {
				recurrenceType = $("input[name='rbDaily']:checked").val();
				message = "At " + startTime + " every ";

				if (recurrenceType == 0)
					message += me.getWeekDaysInfo() + " of every week, ";
				else if (recurrenceType == 1)
					message += "Mon, Tue, Wed, Thu, Fri of every week, ";
				else if (recurrenceType == 2)
					message += (me.numberOfDays.getValue() == "1") ? "day, " : me.numberOfDays.getValue() + " days, ";

				message += "starting " + me.startDate.lastBlurValue;
			}
			else if (me.scheduleType == "WeeklyRecurrence") {
				message = "At " + startTime + " every " + me.getWeekDaysInfo() + " of every "
					+ ((me.numberOfWeeks.getValue() == "1") ? "week, " : me.numberOfWeeks.getValue() + " weeks, ")
					+ "starting " + me.startDate.lastBlurValue;
			}
			else if (me.scheduleType == "MonthlyRecurrence") {
				recurrenceType = $("input[name='rbMonthly']:checked").val();
				message = "At " + startTime + " on ";

				if (recurrenceType == 0) {
					message += "the " + me.weeks[me.weekOfMonth.indexSelected].title.replace("Week", "").toLowerCase() 
						+ " " + me.getWeekDaysInfo() + " of ";
				}
				else
					message += " day(s) " + me.calendarDays.getValue() + " of ";

				if (!me.jan.check.checked || !me.feb.check.checked || !me.mar.check.checked || !me.apr.check.checked
					|| !me.may.check.checked || !me.jun.check.checked || !me.jul.check.checked || !me.aug.check.checked
					|| !me.sep.check.checked || !me.oct.check.checked || !me.nov.check.checked || !me.dec.check.checked) {
					message += me.jan.check.checked ? "Jan, " : "";
					message += me.feb.check.checked ? "Feb, " : "";
					message += me.mar.check.checked ? "Mar, " : "";
					message += me.apr.check.checked ? "Apr, " : "";
					message += me.may.check.checked ? "May, " : "";
					message += me.jun.check.checked ? "Jun, " : "";
					message += me.jul.check.checked ? "Jul, " : "";
					message += me.aug.check.checked ? "Aug, " : "";
					message += me.sep.check.checked ? "Sep, " : "";
					message += me.oct.check.checked ? "Oct, " : "";
					message += me.nov.check.checked ? "Nov, " : "";
					message += me.dec.check.checked ? "Dec, " : "";
				}
				else
					message += " every month, ";

				message += "starting " + me.startDate.lastBlurValue;
			}
			else {
				message = "At " + startTime	+ " on " + me.startDate.lastBlurValue;
			}

			if (me.stopSchedule.check.checked)
				message += " and ending " + me.endDate.lastBlurValue;

			$("#ScheduleInfo").html(message);
		},

		actionScheduleItem: function() {
			var me = this;

			me.loadPopup("schedulePopup");

			if (me.scheduleType == "MinuteRecurrence" ||  me.status == "")
				$("input:radio[name=rbSchedule][value=0]").trigger("click");
			else if (me.scheduleType == "DailyRecurrence")
				$("input:radio[name=rbSchedule][value=1]").trigger("click");
			else if (me.scheduleType == "WeeklyRecurrence")
				$("input:radio[name=rbSchedule][value=2]").trigger("click");
			else if (me.scheduleType == "MonthlyRecurrence")
				$("input:radio[name=rbSchedule][value=3]").trigger("click");
			else if (me.scheduleType == "OneTime")
				$("input:radio[name=rbSchedule][value=4]").trigger("click");
		},

		isMonthSelected: function() {
			var me = this;

			if (me.jan.check.checked
				|| me.feb.check.checked
				|| me.mar.check.checked
				|| me.apr.check.checked
				|| me.may.check.checked
				|| me.jun.check.checked
				|| me.jul.check.checked
				|| me.aug.check.checked
				|| me.sep.check.checked
				|| me.oct.check.checked
				|| me.nov.check.checked
				|| me.dec.check.checked)
				return true;
			else
				return false;
		},

		isWeekDaySelected: function() {
			var me = this;
			
			if (me.sunday.check.checked
				|| me.monday.check.checked
				|| me.tuesday.check.checked
				|| me.wednesday.check.checked
				|| me.thursday.check.checked
				|| me.friday.check.checked
				|| me.saturday.check.checked)
				return true;
			else
				return false;	
		},

		getWeekDays: function() {
			var me = this;
			var xml = "";

			xml += ' sunday="' + me.sunday.check.checked + '"';
			xml += ' monday="' + me.monday.check.checked + '"';
			xml += ' tuesday="' + me.tuesday.check.checked + '"';
			xml += ' wednesday="' + me.wednesday.check.checked + '"';
			xml += ' thursday="' + me.thursday.check.checked + '"';
			xml += ' friday="' + me.friday.check.checked + '"';
			xml += ' saturday="' + me.saturday.check.checked + '"';

			return xml;
		},

		actionOKSchedule: function() {
			var me = this;
			var valid = true;
			var recurrenceType = 0;

			me.startHour.validate(true);
			me.startMinute.validate(true);
			me.startDate.validate(true);
			me.endDate.validate(true);
			
			if (!me.stopSchedule.check.checked) {
				me.endDate.resetValidation(true);
				me.endDate.setValue("");
			}

			if (me.scheduleType == "MinuteRecurrence") {
				me.hour.validate(true);
				me.minute.validate(true);
				if (!me.hour.valid || !me.minute.valid)
					valid = false;
			}
			else if (me.scheduleType == "DailyRecurrence") {
				recurrenceType = $("input[name='rbDaily']:checked").val();

				if (recurrenceType == 0) {
					valid = me.isWeekDaySelected();
					if (!valid) 
						$("#DayErrorMessage").show();
					else
						$("#DayErrorMessage").hide();
				}
				else if (recurrenceType == 2) {
					me.numberOfDays.validate(true);
					valid = me.numberOfDays.valid;
				}
			}
			else if (me.scheduleType == "WeeklyRecurrence") {
				var weekDaySelected = me.isWeekDaySelected();
				me.numberOfWeeks.validate(true);

				if (!weekDaySelected)
					$("#DayErrorMessage").show();
				else
					$("#DayErrorMessage").hide();
						
				if (!me.numberOfWeeks.valid || !weekDaySelected)
					valid = false;
			}
			else if (me.scheduleType == "MonthlyRecurrence") {
				recurrenceType = $("input[name='rbMonthly']:checked").val();				
				var monthSelected = me.isMonthSelected();

				if (!monthSelected)
					$("#MonthErrorMessage").show();
				else
					$("#MonthErrorMessage").hide();

				if (recurrenceType == 0) {
					var weekDaySelected = me.isWeekDaySelected();
					me.weekOfMonth.validate(true);

					if (!weekDaySelected)
						$("#DayErrorMessage").show();
					else
						$("#DayErrorMessage").hide();

					if (!me.weekOfMonth.valid || !monthSelected || !weekDaySelected)
						valid = false;
				}
				else {
					me.calendarDays.validate(true);
					if (!me.calendarDays.valid || !monthSelected)
						valid = false;
				}
			}
			
			if (!valid || !me.startHour.valid || !me.startMinute.valid 
				|| !me.startDate.valid || !me.endDate.valid) {
				alert("In order to continue, the errors on the page must be corrected.");
				return false;
			}

			me.hidePopup("schedulePopup");
			me.setScheduleInfo();
		},

		actionCancelSchedule: function() {
			var me = this;

			me.hidePopup("schedulePopup");
		},

		actionSelectNode: function() {
			var me = this;

			for (index in me.nodeHierarchy.selectedNodes) {
				var node = me.nodeHierarchy.selectedNodes[index];
				if (node) {
					var title = node.fullPath.substring(node.fullPath.lastIndexOf("\\") + 1);
					me.hirNode.setValue(title);
					me.hirNodeId = node.id;
					break;
				} 
			}

			me.hidePopup("hirOrgPopup");
		},

		actionClosePopup: function() {
			var me = this;

			me.hidePopup("hirOrgPopup");
		},

		actionUndoItem: function() {
			var me = this;

			me.status = "";

			if (me.lastSelectedRowIndex >= 0)
				me.subscriptionGrid.body.select(me.lastSelectedRowIndex);
			else
				me.resetControls();
		},

		actionNewItem: function() {
			var me = this;

			me.status = "new";
			me.subscriptionId = "";			
			me.subscriptionGrid.body.deselectAll();
			me.resetScheduleInfo();
		},

		actionDeleteItem: function() {
			var me = this;

			if (me.subscriptionGrid.activeRowIndex == -1)
				return;

			if (!confirm("Are you sure you want to delete the subscription - [" + me.subscriptions[me.lastSelectedRowIndex].description + "] permanently?")) 	
				return false;

			me.status = "delete";
			me.actionSaveItem();
		},

		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";
			var valid = true;

			if (me.status == "")
				return;

			me.ssrsReport.validate(true);
			me.description.validate(true);
			me.deliveredBy.validate(true);
			me.to.validate(true);
			me.subject.validate(true);
			me.reportFormat.validate(true);
			me.priority.validate(true);

			for (var index = 0; index < me.controls.length; index++) {
				me.controls[index].validate(true);
			}

			for (var index = 0; index < me.controls.length; index++) {
				if (!me.controls[index].valid) {
					valid = false;
					break;
				}
			}

			if (!valid || !me.ssrsReport.valid || !me.description.valid || !me.deliveredBy.valid || !me.to.valid
				|| !me.subject.valid || !me.reportFormat.valid || !me.priority.valid) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}

			if (me.status == "delete") {
				xml += '<ssrsSubscriptionDelete';
				xml += ' subscriptionId="' + me.subscriptionId + '"';
				xml += '/>';
			}
			else {
				var recurrenceType = 0;
				var parametersList = "";
				var startTime = "";

				if (me.status == "new")
					item = new fin.rpt.ssrs.Subscription(0);
				else
					item = me.subscriptions[me.lastSelectedRowIndex];

				for (var index = 0; index < me.reportParameters.length; index++) {
					if (me.reportParameters[index].controlType == "CheckBox")
						parametersList += me.reportParameters[index].name + ":" + me.controls[index].check.checked + ",";
					else if (me.reportParameters[index].controlType == "Text")
						parametersList += me.reportParameters[index].name + ":" + me.controls[index].getValue() + ",";
					else if (me.reportParameters[index].controlType == "TreeView")
						parametersList += me.reportParameters[index].name + ":" + me.hirNodeId + ",";
					else if (me.reportParameters[index].controlType == "DropDown")
						parametersList += me.reportParameters[index].name + ":" + me.controls[index].data[me.controls[index].indexSelected].id + ",";
				}

				if (parametersList != "")
					parametersList = parametersList.substring(0, parametersList.lastIndexOf(","));

				if ($("input[name='rbStartTime']:checked").val() == "AM") {
					if (me.startHours[me.startHour.indexSelected].title == "12")
						startTime = "00";
					else
						startTime = me.startHours[me.startHour.indexSelected].title;
				}
				else if ($("input[name='rbStartTime']:checked").val() == "PM") {
					if (me.startHours[me.startHour.indexSelected].title == "12")
						startTime = me.startHours[me.startHour.indexSelected].title;							
					else
						startTime = 12 + parseInt(me.startHours[me.startHour.indexSelected].title, 10);
				}

				item.reportName = me.ssrsReportSubscriptions[me.ssrsReport.indexSelected].name;
				item.scheduleType = me.scheduleType;
				item.description = me.description.getValue();
				item.to =  me.to.getValue();
				item.cc =  me.cc.getValue();
				item.subject =  me.subject.getValue();
				item.includeReport = me.includeReport.check.checked;
				item.includeLink = me.includeLink.check.checked;
				item.reportFormat = me.reportFormats[me.reportFormat.indexSelected].title;
				item.priority = me.priorities[me.priority.indexSelected].title;
				item.comment = me.comment.value;
				item.hours = me.hours[me.hour.indexSelected].title;
				item.minutes = me.minutes[me.minute.indexSelected].title;
				item.startDate = me.startDate.lastBlurValue;
				item.startTime = startTime + ":" + me.minutes[me.startMinute.indexSelected].title;
				item.stopSchedule = me.stopSchedule.check.checked;
				item.endDate = me.endDate.lastBlurValue;
				item.days = me.calendarDays.getValue();
				item.weekOfMonth = me.weeks[me.weekOfMonth.indexSelected].title;
				item.numberOfDays = me.numberOfDays.getValue();
				item.numberOfWeeks = me.numberOfWeeks.getValue();
				item.sunday = me.sunday.check.checked;
				item.monday = me.monday.check.checked;
				item.tuesday = me.tuesday.check.checked;
				item.wednesday = me.wednesday.check.checked;
				item.thursday = me.thursday.check.checked;
				item.friday = me.friday.check.checked;
				item.saturday = me.saturday.check.checked;
				item.january = me.jan.check.checked;
				item.february = me.feb.check.checked;
				item.march = me.mar.check.checked;
				item.april = me.apr.check.checked;
				item.may = me.may.check.checked;
				item.june = me.jun.check.checked;
				item.july = me.jul.check.checked;
				item.august = me.aug.check.checked;
				item.september = me.sep.check.checked;
				item.october = me.oct.check.checked;
				item.november = me.nov.check.checked;
				item.december = me.dec.check.checked;
				item.parameters = parametersList;

				xml += '<ssrsSubscription';
				xml += ' scheduleType="' + me.scheduleType + '"';
				xml += ' subscriptionId="' + me.subscriptionId + '"';
				xml += ' reportName="' + item.reportName + '"';
				xml += ' description="' + ui.cmn.text.xml.encode(item.description) + '"';
				xml += ' deliveredBy="' + me.deliveries[me.deliveredBy.indexSelected].title + '"';
				xml += ' to="' + item.to + '"';
				xml += ' cc="' + item.cc + '"';
				xml += ' subject="' + ui.cmn.text.xml.encode(item.subject) + '"';
				xml += ' includeReport="' + item.includeReport + '"';
				xml += ' includeLink="' + item.includeLink + '"';
				xml += ' reportFormat="' + item.reportFormat + '"';
				xml += ' priority="' + item.priority + '"';
				xml += ' comment="' + ui.cmn.text.xml.encode(item.comment) + '"';
				xml += ' parameters="' + item.parameters + '"';
				xml += ' startDate="' + item.startDate + '"';
				xml += ' startTime="' + item.startTime + '"';
				xml += ' endDate="' + item.endDate + '"';
				xml += ' stopSchedule="' + item.stopSchedule + '"';

				if (me.scheduleType == "MinuteRecurrence") {
					var minutesInterval = parseInt(item.hours, 10) * 60 + parseInt(item.minutes, 10);
					xml += ' minutesInterval="' + minutesInterval + '"';
				}
				else if (me.scheduleType == "DailyRecurrence") {
					recurrenceType = $("input[name='rbDaily']:checked").val();
	
					if (recurrenceType == 0) {
						xml += me.getWeekDays();
					}
					else if (recurrenceType == 1) {
						xml += ' sunday="false"';
						xml += ' monday="true"';
						xml += ' tuesday="true"';
						xml += ' wednesday="true"';
						xml += ' thursday="true"';
						xml += ' friday="true"';
						xml += ' saturday="false"';
					}
					else if (recurrenceType == 2) {
						xml += ' daysInterval="' + item.numberOfDays + '"';
					}
				}
				else if (me.scheduleType == "WeeklyRecurrence") {
					xml += ' weeksInterval="' + item.numberOfWeeks + '"';
					xml += me.getWeekDays();
				}
				else if (me.scheduleType == "MonthlyRecurrence") {
					recurrenceType = $("input[name='rbMonthly']:checked").val();

					xml += ' january="' + item.january + '"';
					xml += ' february="' + item.february + '"';
					xml += ' march="' + item.march + '"';
					xml += ' april="' + item.april + '"';
					xml += ' may="' + item.may + '"';
					xml += ' june="' + item.june + '"';
					xml += ' july="' + item.july + '"';
					xml += ' august="' + item.august + '"';
					xml += ' september="' + item.september + '"';
					xml += ' october="' + item.october + '"';
					xml += ' november="' + item.november + '"';
					xml += ' december="' + item.december + '"';
					
					if (recurrenceType == 0) {
						xml += ' whichWeek="' + item.weekOfMonth + '"';
						xml += me.getWeekDays();
					}
					else
						xml += ' days="' + item.days + '"';
				}
				xml += '/>';
			}

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

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
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {
						case "rptSubscription":

							if (me.status == "new") {
								me.subscriptionId = $(this).attr("subscriptionId");
								item.id = me.subscriptions.length + 1;
								item.subscriptionId = me.subscriptionId;
								me.subscriptions.push(item);
								me.lastSelectedRowIndex = me.subscriptions.length - 1;
								me.subscriptionGrid.setData(me.subscriptions);
								me.subscriptionGrid.body.select(me.lastSelectedRowIndex);
								me.status = "edit";
							}
							else if (me.status == "delete") {
								me.resetControls();
								me.subscriptions.splice(me.lastSelectedRowIndex, 1);
								me.subscriptionGrid.setData(me.subscriptions);
								me.lastSelectedRowIndex = -1;
								me.status = "";
							}
							else {
								me.subscriptions[me.lastSelectedRowIndex] = item;
								me.subscriptionGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}

							break;
					}
				});
			}
			else {
				alert("[SAVE FAILURE] Error while updating the SSRS Subscription: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").hide();
		},

		loadPopup: function(id) {
			var me = this;

			me.centerPopup(id);

			$("#backgroundPopup").css({
				"opacity": "0.5"
			});
			$("#backgroundPopup").fadeIn("slow");
			$("#" + id).fadeIn("slow");
		},

		hidePopup: function(id) {

			$("#backgroundPopup").fadeOut("slow");
			$("#" + id).fadeOut("slow");
		},

		centerPopup: function(id) {
			var me = this;
			var windowWidth = document.documentElement.clientWidth;
			var windowHeight = document.documentElement.clientHeight;
			var popupWidth = $("#" + id).width();
			var popupHeight = $("#" + id).height();

			$("#" + id).css({
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});

			$("#popupLoading").css({
				"width": popupWidth,
				"height": popupHeight,
				"top": windowHeight/2 - popupHeight/2,
				"left": windowWidth/2 - popupWidth/2
			});
		}
	}
});

function main() {
	var intervalId = setInterval(function() {
		if (importCompleted) {
			clearInterval(intervalId);
			fin.reportUi = new fin.rpt.ssrs.UserInterface();
			fin.reportUi.resize();
		}
	}, 100);
}
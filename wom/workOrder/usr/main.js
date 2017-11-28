ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.wom.workOrder.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

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
    Name: "fin.wom.workOrder.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.nextCount = 0;
			me.workOrderType = 0;
			me.recurringType = 0;
			me.houseCodeJobId = 0;
			me.jobs = [];
			me.serviceLocations = [];
			me.customers = [];
			me.workOrderId = 0;
			me.lastSelectedRowIndex = -1;
			me.action = "";
			me.workOrderBackDays = 0;
			me.search = false;
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
			me.authorizePath = "\\crothall\\chimes\\fin\\WorkOrders\\WorkOrders";
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
			
			me.initialize();
						
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$("input[name='Subcontracted']").change(function() { me.modified(true); });
			$("input[name='Commissionable']").change(function() { me.modified(true); });
			$("input[name='OvertimeAuthorized']").change(function() { me.modified(true); });
			$("input[name='WOM']").change(function() { me.modified(true); });
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},		
		
		initialize: function() {
			var me = this;
			
			$("#WorkOrderPopup").hide();
			$("#workOrderContentAreaPopup").hide();
			$("#WeeklyPopup").hide();
			$("#MonthlyPopup").hide();
			
			$("input[name='WOM']").click(function() {
	
				if (this.id == "WOMTime")
					me.workOrderType = 0;
				else if (this.id == "WOMRecurring")
					me.workOrderType = 1;
			});

			$("#searchIcon").click(function() {
						
				if ($("#searchOption").is(":visible")) {
					
					$("#searchIcon").html("<img src='/fin/cmn/usr/media/Common/searchPlus.png'/>");
					$("#searchOption").hide("slow");
				}
				else {
		
					$("#searchIcon").html("<img src='/fin/cmn/usr/media/Common/searchMinus.png'/>");
					$("#searchOption").show("slow");
					me.woNumber.setValue("");
					me.status.reset();
					me.startDateHeader.setValue("");
					me.endDateHeader.setValue("");
					me.woNumber.resizeText();
					me.status.resizeText();
					me.startDateHeader.resizeText();
					me.endDateHeader.resizeText();
				}		
			});
			
			$("input[name='Recurring']").click(function() {
	
				if (this.id == "Daily")
					me.recurringType = 0;
				else if (this.id == "Weekly")
					me.recurringType = 1;
				else if (this.id == "Monthly")
					me.recurringType = 2;
			});
			
			$("input[name='rbDaily']").click(function() {
	
				if (this.id == "repeatday")
					me.numberOfDays.text.readOnly = false;
				else
					me.numberOfDays.text.readOnly = true;
				
				me.numberOfDays.resetValidation(true);
				me.numberOfDays.setValue("");
			});
			
			$("input[name='rbMonthly']").click(function() {
	
				if (this.id == "monthSch")
					me.calendarDays.text.readOnly = false;
				else
					me.calendarDays.text.readOnly = true;
				
				me.calendarDays.resetValidation(true);
				me.calendarDays.setValue("");
			});
			
			me.startDateHeader.setValue("");
			me.endDateHeader.setValue("");
			me.statusesLoaded();
			me.weeksLoaded();
			me.hoursLoaded();
			me.minutesLoaded();
			me.workOrderTaskStore.fetch("userId:[user]", me.workOrderTaskLoaded, me);
		},
		
		authorizationProcess: function fin_wom_workOrder_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			me.workOrdersShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.workOrdersReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.workOrdersWriteApprove = me.authorizer.isAuthorized(me.authorizePath + "\\WriteApprove");
			me.woWriteNoApprove = me.authorizer.isAuthorized(me.authorizePath + "\\WriteNoApprove");
				
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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded,me);				
				me.systemVariableStore.fetch("userId:[user],name:WorkOrderBackDays", me.systemVariablesLoaded, me);	
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_wom_workOrder_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			var me = args.me;

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;

			fin.wom.workOrderUI.workOrderGrid.setHeight($(window).height() - 430);
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
					brief: "Save Work Order (Ctrl+S)", 
					title: "Save the current Work Order.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Work Order (Ctrl+N)", 
					title: "Create a new Work Order.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "undoAction", 
					brief: "Undo current changes to Work Order (Ctrl+U)", 
					title: "Undo the changes to Work Order being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});			
						
			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionLoadItem(); },
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
			
			me.anchorCancelWorkOrder = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelWorkOrder",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelWorkOrderItem(); },
				hasHotState: true
			});
			
			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});
			
			me.anchorView = new ui.ctl.buttons.Sizeable({
				id: "AnchorView",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;View Items&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionViewItem(); },
				hasHotState: true
			});
			
			me.anchorPrint = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrint",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Print WO&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrintItem(); },
				hasHotState: true
			});
			
			me.anchorNextPopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorNextPopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNextItem(); },
				hasHotState: true
			});
			
			me.anchorCancelPopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancelPopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});
			
			me.anchorSavePopup = new ui.ctl.buttons.Sizeable({
				id: "AnchorSavePopup",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorSearch = new ui.ctl.buttons.Sizeable({
				id: "AnchorSearch",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Search&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSearchItem(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelSearchItem(); },
				hasHotState: true
			});

			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "Job",
				formatFunction: function(type) { return (type.jobNumber + " - " + type.jobTitle); },
				changeFunction: function() {
						
					if (me.job.indexSelected >= 0) {
						me.houseCodeJobId = me.jobs[me.job.indexSelected].id;
						$("#JobText").attr("title", me.jobs[me.job.indexSelected].jobNumber + " - " + me.jobs[me.job.indexSelected].jobTitle);
					}
					else
						me.houseCodeJobId = 0;
				}
			});
			
			me.woNumber = new ui.ctl.Input.Text({
		        id: "WONumber",
				maxLength: 10
		    });
			
			me.woNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.woNumber.getValue();

					if (enteredText == "") 
						return;

					if (!(/^[0-9]+$/.test(enteredText)))
						this.setInvalid("Please enter valid Work Order #.");
				});
			
			$("#WONumberText").keypress(function (e) {
				if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
					return false;
			});
			
			me.status = new ui.ctl.Input.DropDown.Filtered({
				id: "Status",
				formatFunction: function(type) { return type.title; }
			});			
						
			me.startDateHeader = new ui.ctl.Input.Date({
		        id: "StartDateHeader",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.startDateHeader.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDateHeader.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
				
			me.endDateHeader = new ui.ctl.Input.Date({
		        id: "EndDateHeader",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.endDateHeader.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.endDateHeader.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
				
			me.createGrid(7);
			
			me.serviceLocation = new ui.ctl.Input.DropDown.Filtered({
				id: "ServiceLocation",
				formatFunction: function(type) {
					if (type.jobNumber == "")
						return type.jobTitle; 
					else
						return type.jobNumber + " " + type.jobTitle;
				},
				changeFunction: function() { me.modified(); }
			});
			
			me.serviceLocation.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
		
					if ((this.focused || this.touched) && me.serviceLocation.indexSelected == -1)
						this.setInvalid("Please select the correct Service Location.");					
				});
			
			me.customer = new ui.ctl.Input.DropDown.Filtered({
				id: "Customer",
				formatFunction: function(type) {
					return type.jobTitle; 
				},
				changeFunction: function() { me.modified(); }
			});
			
			me.customer.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.customer.indexSelected == -1)
						this.setInvalid("Please select the correct Customer.");
				});
			
			me.requestedBy = new ui.ctl.Input.Text({
		        id: "RequestedBy",
				maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.requestedBy.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.tennant = new ui.ctl.Input.Text({
		        id: "Tennant",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.phoneNumber = new ui.ctl.Input.Text({
		        id: "PhoneNumber",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.phoneNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.phoneNumber.getValue();
					
					if (enteredText == "") return;
					
					me.phoneNumber.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phoneNumber.text.value;
										
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
			});
			
			me.poNumber = new ui.ctl.Input.Text({
		        id: "PONumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });
			
			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid Start Date.");
					else {
						if (me.workOrderGrid.activeRowIndex >= 0) {
							var item = me.workOrderGrid.data[me.workOrderGrid.activeRowIndex];

							if (ui.cmn.text.date.format(new Date(item.startDate), "mm/dd/yyyy") != enteredText) {
								var backDate = new Date();
								backDate.setDate(backDate.getDate() - me.workOrderBackDays);						
								backDate = (backDate.getMonth() + 1) + "/" + backDate.getDate() + "/" + backDate.getFullYear();
		
								if (new Date(enteredText) < new Date(backDate))
									this.setInvalid("Start Date should not be less than " + backDate);
							}
						}
					}
				});
				
			me.serviceContract = new ui.ctl.Input.Text({
		        id: "ServiceContract",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.generalLocationCode = new ui.ctl.Input.Text({
		        id: "GeneralLocationCode",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.customerWorkOrderNumber = new ui.ctl.Input.Text({
		        id: "CustomerWorkOrderNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.squareFeet = new ui.ctl.Input.Text({
		        id: "SquareFeet",
				changeFunction: function() { me.modified(); }
		    });
			
			me.squareFeet.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.squareFeet.text.value;
					
					if (enteredText == "")
						return;
						
					if (ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$") == false)
						this.setInvalid("Please enter valid Square Feet. Example: 99.99");
				});
				
			me.areaManagerEmail = new ui.ctl.Input.Text({
		        id: "AreaManagerEmail",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.areaManagerEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.areaManagerEmail.getValue();
					
					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.emailAddress(enteredText) == false)
						this.setInvalid("Please enter valid Area Manager Email Address.");
			});
			
			me.regionalManagerEmail = new ui.ctl.Input.Text({
		        id: "RegionalManagerEmail",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.regionalManagerEmail.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.regionalManagerEmail.getValue();
					
					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.emailAddress(enteredText) == false)
						this.setInvalid("Please enter valid Regional Manager Email Address.");
			});
			
			me.notes = $("#Notes")[0];

			$("#Notes").height(35);
			$("#Notes").keypress(function() {
				if (me.notes.value.length > 1023) {
					me.notes.value = me.notes.value.substring(0, 1024);
					return false;
				}
			});	
			$("#Notes").change(function() { me.modified(true); });		

			me.serviceLocationPopup = new ui.ctl.Input.DropDown.Filtered({
				id: "ServiceLocationPopup",
				formatFunction: function(type) {
					if (type.jobNumber == "")
						return type.jobTitle;
					else
						return type.jobNumber + " " + type.jobTitle;
				}
			});
			
			me.serviceLocationPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {

					if ((this.focused || this.touched) && me.serviceLocationPopup.indexSelected == -1)
						this.setInvalid("Please select the correct Service Location.");
				});
			
			me.customerPopup = new ui.ctl.Input.DropDown.Filtered({
				id: "CustomerPopup",
				formatFunction: function(type) {
					return type.jobTitle;
				}
			});
			
			me.customerPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.customerPopup.indexSelected == -1)
						this.setInvalid("Please select the correct Customer.");
				});
			
			me.requestedByPopup = new ui.ctl.Input.Text({
		        id: "RequestedByPopup",
				maxLength: 50
		    });
			
			me.requestedByPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.tennantPopup = new ui.ctl.Input.Text({
		        id: "TennantPopup",
		        maxLength: 50
		    });
			
			me.phoneNumberPopup = new ui.ctl.Input.Text({
		        id: "PhoneNumberPopup",
		        maxLength: 14
		    });
			
			me.phoneNumberPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.phoneNumberPopup.getValue();
					
					if (enteredText == "") return;
					
					me.phoneNumberPopup.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.phoneNumberPopup.text.value;
										
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
			});
			
			me.poNumberPopup = new ui.ctl.Input.Text({
		        id: "PONumberPopup",
		        maxLength: 50
		    });
			
			me.startDatePopup = new ui.ctl.Input.Date({
		        id: "StartDatePopup",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.startDatePopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDatePopup.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid Start Date.");
					else {
						var backDate = new Date();
						backDate.setDate(backDate.getDate() - me.workOrderBackDays);						
						backDate = (backDate.getMonth() + 1) + "/" + backDate.getDate() + "/" + backDate.getFullYear();

						if (new Date(enteredText) < new Date(backDate))
							this.setInvalid("Start Date should not be less than " + backDate);
					}
				});
			
			me.endDatePopup = new ui.ctl.Input.Date({
		        id: "EndDatePopup",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.endDatePopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.endDatePopup.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid End Date.");
					else {
						if (new Date(enteredText) < new Date(me.startDatePopup.text.value))
							this.setInvalid("End Date should not be less than Start Date (" + me.startDatePopup.text.value + ")");
					}
				});
				
			me.serviceContractPopup = new ui.ctl.Input.Text({
		        id: "ServiceContractPopup",
		        maxLength: 100
		    });
			
			me.generalLocationCodePopup = new ui.ctl.Input.Text({
		        id: "GeneralLocationCodePopup",
		        maxLength: 50
		    });
			
			me.customerWorkOrderNumberPopup = new ui.ctl.Input.Text({
		        id: "CustomerWorkOrderNumberPopup",
		        maxLength: 50
		    });

			me.squareFeetPopup = new ui.ctl.Input.Text({
		        id: "SquareFeetPopup",
		        maxLength: 12
		    });
			
			me.squareFeetPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					if (this.focused || this.touched) {
						var enteredText = me.squareFeetPopup.text.value;
						
						if (enteredText == "")
							return;
													
						if (ui.cmn.text.validate.generic(enteredText, "^\\d+\\.?\\d{0,2}$") == false)
							this.setInvalid("Please enter valid Square Feet. Example: 99.99");
					}
				});
				
			me.areaManagerEmailPopup = new ui.ctl.Input.Text({
		        id: "AreaManagerEmailPopup",
		        maxLength: 50
		    });
			
			me.areaManagerEmailPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.areaManagerEmailPopup.getValue();
					
					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.emailAddress(enteredText) == false)
						this.setInvalid("Please enter valid Area Manager Email Address.");
			});
			
			me.regionalManagerEmailPopup = new ui.ctl.Input.Text({
		        id: "RegionalManagerEmailPopup",
		        maxLength: 50
		    });
			
			me.regionalManagerEmailPopup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.regionalManagerEmailPopup.getValue();
					
					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.emailAddress(enteredText) == false)
						this.setInvalid("Please enter valid Regional Manager Email Address.");
			});
			
			me.notesPopup = $("#NotesPopup")[0];

			$("#NotesPopup").height(80);
			$("#NotesPopup").keypress(function() {
				if (me.notesPopup.value.length > 1023) {
					me.notesPopup.value = me.notesPopup.value.substring(0, 1024);
					return false;
				}
			});
				
			me.workOrderItemGrid = new ui.ctl.Grid({
				id: "WorkOrderItemGrid",
				allowAdds: true,
				createNewFunction: fin.wom.workOrder.WorkOrderItem,
				selectFunction: function (index) { 
					if (fin.wom.workOrderUI.workOrderItems[index]) 
						fin.wom.workOrderUI.workOrderItems[index].modified = true;

					$("#ItemQuantityText").keypress(function (e) {
						if(e.which != 8 && e.which != 0  && e.which != 46 && (e.which < 48 || e.which > 57))
							return false;
					});
				}
			});
			
			me.workOrderTask = new ui.ctl.Input.DropDown.Filtered({
		        id: "WorkOrderTask",
				appendToId: "WorkOrderItemGridControlHolder",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() {

					if (me.workOrderTask.indexSelected >= 0)
						me.itemMarkup.setValue(me.workOrderTasks[me.workOrderTask.indexSelected].markup);
					else
						me.itemMarkup.setValue(0);

					me.calculateTotal();
					me.modified();
				}
		    });	

		    me.workOrderTask.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if ((this.focused || this.touched) && me.workOrderTask.indexSelected == -1)
						this.setInvalid("Please select the correct Work Order Task.");
				});
			
			me.itemDescription = new ui.ctl.Input.Text({
		        id: "ItemDescription",
		        maxLength: 1024, 
				appendToId: "WorkOrderItemGridControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.itemDescription.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemQuantity = new ui.ctl.Input.Text({
		        id: "ItemQuantity",
		        maxLength: 10, 
				appendToId: "WorkOrderItemGridControlHolder",
				changeFunction: function() { me.calculateTotal(); me.modified(); }
		    });
			
			me.itemQuantity.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {
				
					if (isNaN(me.itemQuantity.getValue()))
						this.setInvalid("Please enter valid Quantity. Example: 99");
			});
				
			me.itemPrice = new ui.ctl.Input.Money({
		        id: "ItemPrice",
				appendToId: "WorkOrderItemGridControlHolder",
				changeFunction: function() { me.calculateTotal(); me.modified(); }
		    });
			
			me.itemPrice.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.itemMarkup = new ui.ctl.Input.Money({
		        id: "ItemMarkup",
				appendToId: "WorkOrderItemGridControlHolder",
				changeFunction: function() { me.calculateTotal(); me.modified(); }
		    });
			
			me.itemMarkup.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.workOrderItemGrid.addColumn("workOrderTask", "workOrderTask", "Task", "Task", 170, function(task) { return task.title; }, me.workOrderTask);
			me.workOrderItemGrid.addColumn("description", "description", "Description", "Description", null, null, me.itemDescription);
			me.workOrderItemGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 90, null, me.itemQuantity);
			me.workOrderItemGrid.addColumn("price", "price", "Unit Price", "Unit Price", 100, function(price) { return ui.cmn.text.money.format(price); }, me.itemPrice);
			me.workOrderItemGrid.addColumn("markup", "markup", "Markup (%)", "Markup (%)", 100, function(markup) { return ui.cmn.text.money.format(markup); }, me.itemMarkup);
			me.workOrderItemGrid.addColumn("total", "total", "Total", "Total", 100, function(total) {
				var index = me.workOrderItemGrid.rows.length - 1;
				if (index >= 0) {
					var total = (me.workOrderItems[index].quantity * me.workOrderItems[index].price) + (me.workOrderItems[index].quantity * me.workOrderItems[index].price * me.workOrderItems[index].markup / 100);
					return ui.cmn.text.money.format(total);
				}				 
			});

			me.workOrderItemGrid.capColumns();
			me.workOrderItemGrid.setHeight(325);

			me.workOrderItemReadOnlyGrid = new ui.ctl.Grid({
				id: "WorkOrderItemReadOnlyGrid"
			});

			me.workOrderItemReadOnlyGrid.addColumn("workOrderTask", "workOrderTask", "Task", "Task", 170, function(task) { return task.title; });
			me.workOrderItemReadOnlyGrid.addColumn("description", "description", "Description", "Description", null);
			me.workOrderItemReadOnlyGrid.addColumn("quantity", "quantity", "Quantity", "Quantity", 90, null);
			me.workOrderItemReadOnlyGrid.addColumn("price", "price", "Unit Price", "Unit Price", 100, function(price) { return ui.cmn.text.money.format(price); });
			me.workOrderItemReadOnlyGrid.addColumn("markup", "markup", "Markup (%)", "Markup (%)", 100, function(markup) { return ui.cmn.text.money.format(markup); });
			me.workOrderItemReadOnlyGrid.addColumn("total", "total", "Total", "Total", 100, function(total) {
				var index = me.workOrderItemReadOnlyGrid.rows.length - 1;
				if (index >= 0) {
					var total = (me.workOrderItems[index].quantity * me.workOrderItems[index].price) + (me.workOrderItems[index].quantity * me.workOrderItems[index].price * me.workOrderItems[index].markup / 100);
					return ui.cmn.text.money.format(total);
				} 
			});

			me.workOrderItemReadOnlyGrid.capColumns();
			me.workOrderItemReadOnlyGrid.setHeight(325);

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
					
					if ($("input[name='rbDaily']:checked").val() == 2 && (/^\d+$/.test(me.numberOfDays.getValue()) == false))
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
					
					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Weeks. Example: 2");
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
			
			me.weekOfMonth = new ui.ctl.Input.DropDown.Filtered({
				id: "WeekOfMonth",
				formatFunction: function(type) { return type.title; }
			})
			
			me.weekOfMonth.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.weekOfMonth.indexSelected == -1)
						this.setInvalid("Please select the correct Week of the Month.");
				});
			
			me.hour = new ui.ctl.Input.DropDown.Filtered({
				id: "Hour",
				formatFunction: function(type) { return type.title; }
			});
			
			me.hour.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.hour.indexSelected == -1)
						this.setInvalid("Please select the correct Hour.");
				});
			
			me.minute = new ui.ctl.Input.DropDown.Filtered({
		        id: "Minute",
		        formatFunction: function(type) { return type.title; }
		    });
			
			me.minute.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.minute.indexSelected == -1)
						this.setInvalid("Please select the correct Minute.");
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
			
			me.setTabIndexes();
		},
		
		createGrid: function(statusType) {
			var me = this;
			
			$("#WorkOrderGrid").html("");
			
			me.workOrderGrid = new ui.ctl.Grid({
				id: "WorkOrderGrid",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});
			
			me.workOrderGrid.addColumn("serviceLocation", "serviceLocation", "Service Location", "Service Location", null);
			me.workOrderGrid.addColumn("workOrderNumber", "workOrderNumber", "Work Order #", "Work Order Number", 120);
			
			if (statusType == 5)
				me.workOrderGrid.addColumn("invoiceNumber", "invoiceNumber", "Invoice #", "Invoice #", 100);
			
			me.workOrderGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 100);
			
			if (statusType == 5)
				me.workOrderGrid.addColumn("closedDate", "closedDate", "Closed Date", "Closed Date", 110);
			else if (statusType == 9)
				me.workOrderGrid.addColumn("completedDate", "completedDate", "Completed Date", "Completed Date", 130);
			
			me.workOrderGrid.addColumn("statusType", "statusType", "Status", "Status", 120, function(statusType) { 
				if (statusType == 7) return "Pending Approval";
				else if (statusType == 8) return "Approved";
				else if (statusType == 9) return "Completed";
				else if (statusType == 5) return "Closed";
				else if (statusType == 6) return "Canceled";
			});
			me.workOrderGrid.capColumns();
			me.workOrderGrid.setHeight($(window).height() - 450);
		},

		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.wom.workOrder.HirNode,
				itemConstructorArgs: fin.wom.workOrder.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.wom.workOrder.HouseCode,
				itemConstructorArgs: fin.wom.workOrder.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.wom.workOrder.HouseCodeJob,
				itemConstructorArgs: fin.wom.workOrder.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.workOrderTasks = [];
			me.workOrderTaskStore = me.cache.register({
				storeId: "womWorkOrderTasks",
				itemConstructor: fin.wom.workOrder.WorkOrderTask,
				itemConstructorArgs: fin.wom.workOrder.workOrderTaskArgs,
				injectionArray: me.workOrderTasks
			});
			
			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.wom.workOrder.RemitTo,
				itemConstructorArgs: fin.wom.workOrder.remitToArgs,
				injectionArray: me.remitTos
			});	
			
			me.workOrders = [];
			me.workOrderStore = me.cache.register({
				storeId: "womWorkOrders",
				itemConstructor: fin.wom.workOrder.WorkOrder,
				itemConstructorArgs: fin.wom.workOrder.workOrderArgs,
				injectionArray: me.workOrders
			});
			
			me.workOrderItems = [];
			me.workOrderItemStore = me.cache.register({
				storeId: "womWorkOrderItems",
				itemConstructor: fin.wom.workOrder.WorkOrderItem,
				itemConstructorArgs: fin.wom.workOrder.workOrderItemArgs,
				injectionArray: me.workOrderItems,
				lookupSpec: { workOrderTask: me.workOrderTasks }
			});
			
			me.systemVariables = [];
			me.systemVariableStore = me.cache.register({
				storeId: "systemVariables",
				itemConstructor: fin.wom.workOrder.SystemVariable,
				itemConstructorArgs: fin.wom.workOrder.systemVariableArgs,
				injectionArray: me.systemVariables
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
		
		setTabIndexes: function() {
			var me = this;
			
			me.serviceLocation.text.tabIndex = 1;
			me.customer.text.tabIndex = 2;
			me.requestedBy.text.tabIndex = 3;
			me.tennant.text.tabIndex = 4;
			me.phoneNumber.text.tabIndex = 5;
			me.poNumber.text.tabIndex = 6;
			me.startDate.text.tabIndex = 7;
			$("#OvertimeAuthorizedYes")[0].tabIndex = 8;
			$("#OvertimeAuthorizedNo")[0].tabIndex = 9;
			me.serviceContract.text.tabIndex = 10;
			me.generalLocationCode.text.tabIndex = 11;
			me.customerWorkOrderNumber.text.tabIndex = 12;
			me.squareFeet.text.tabIndex = 13;
			me.areaManagerEmail.text.tabIndex = 14;
			me.regionalManagerEmail.text.tabIndex = 15;
			$("#SubcontractedYes")[0].tabIndex = 16;
			$("#SubcontractedNo")[0].tabIndex = 17;
			$("#CommissionableYes")[0].tabIndex = 18;
			$("#CommissionableNo")[0].tabIndex = 19;
			me.notes.tabIndex = 20;
			
			me.serviceLocationPopup.text.tabIndex = 21;
			me.customerPopup.text.tabIndex = 22;
			me.requestedByPopup.text.tabIndex = 23;
			me.tennantPopup.text.tabIndex = 24;
			me.phoneNumberPopup.text.tabIndex = 25;
			me.poNumberPopup.text.tabIndex = 26;
			me.startDatePopup.text.tabIndex = 27;
			$("#OvertimeAuthorizedPopupYes")[0].tabIndex = 28;
			$("#OvertimeAuthorizedPopupNo")[0].tabIndex = 29;
			me.serviceContractPopup.text.tabIndex = 30;
			me.generalLocationCodePopup.text.tabIndex = 31;
			me.customerWorkOrderNumberPopup.text.tabIndex = 32;
			me.squareFeetPopup.text.tabIndex = 33;
			me.areaManagerEmailPopup.text.tabIndex = 34;
			me.regionalManagerEmailPopup.text.tabIndex = 35;
			$("#SubcontractedPopupYes")[0].tabIndex = 36;
			$("#SubcontractedPopupNo")[0].tabIndex = 37;
			$("#CommissionablePopupYes")[0].tabIndex = 38;
			$("#CommissionablePopupNo")[0].tabIndex = 39;
			me.notesPopup.tabIndex = 40;
		},
			
		resizeControls: function() {
			var me = this;
			
			me.serviceLocation.resizeText();
			me.customer.resizeText();
			me.requestedBy.resizeText();
			me.tennant.resizeText();
			me.phoneNumber.resizeText();
			me.poNumber.resizeText();
			me.startDate.resizeText();
			me.OvertimeAuthorizedYes.resizeText();
			me.serviceContract.resizeText();
			me.generalLocationCode.resizeText();
			me.customerWorkOrderNumber.resizeText();
			me.squareFeet.resizeText();
			me.areaManagerEmail.resizeText();
			me.regionalManagerEmail.resizeText();
			me.tennantPopup.resizeText();
			me.phoneNumberPopup.resizeText();
			me.poNumberPopup.resizeText();
			me.startDatePopup.resizeText();
			me.OvertimeAuthorizedPopupYes.resizeText();
			me.serviceContractPopup.resizeText();
			me.generalLocationCodePopup.resizeText();
			me.customerWorkOrderNumberPopup.resizeText();
			me.squareFeetPopup.resizeText();
			me.areaManagerEmailPopup.resizeText();
			me.regionalManagerEmailPopup.resizeText();
			me.SubcontractedPopupYes.resizeText();
			me.CommissionablePopupYes.resizeText();
			me.resize();
		},
		
		systemVariablesLoaded:function(me, activeId) {

			if (me.systemVariables.length > 0)
				me.workOrderBackDays = parseInt(me.systemVariables[0].variableValue);
				
			me.checkLoadCount();
		},
		
		statusesLoaded: function() {
			var me = this;
			
			me.statuses = [];
			me.statuses.push(new fin.wom.workOrder.Status(7, "Pending Approval"));
			me.statuses.push(new fin.wom.workOrder.Status(8, "Approved"));			
			me.statuses.push(new fin.wom.workOrder.Status(9, "Completed"));
			me.statuses.push(new fin.wom.workOrder.Status(5, "Closed"));
			
			me.status.setData(me.statuses);
		},
		
		weeksLoaded: function() {
			var me = this;
			
			me.weeks = [];
			
			me.weeks.push(new fin.wom.workOrder.Week(0, "1st"));
			me.weeks.push(new fin.wom.workOrder.Week(1, "2nd"));
			me.weeks.push(new fin.wom.workOrder.Week(2, "3rd"));
			me.weeks.push(new fin.wom.workOrder.Week(3, "4th"));
			me.weeks.push(new fin.wom.workOrder.Week(4, "Last"));
			
			me.weekOfMonth.setData(me.weeks);
			me.weekOfMonth.select(0, me.weekOfMonth.focused);
		},
		
		hoursLoaded: function() {
			var me = this;
			var title = "";
			
			me.hours = [];
			
			for (var index = 1; index <= 12; index++) {
				if (index < 10)
					title = "0" + index.toString();
				else
					title = index.toString();
				me.hours.push(new fin.wom.workOrder.Hour(index, title));	
			}
			
			me.hour.setData(me.hours);
			me.hour.select(11, me.hour.focused);
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
				me.minutes.push(new fin.wom.workOrder.Minute(index, title));	
			}
			
			me.minute.setData(me.minutes);
			me.minute.select(0, me.minute.focused);
		},
		
		workOrderTaskLoaded: function(me, activeId) {
			
			me.workOrderTask.setData(me.workOrderTasks);
		},

		houseCodesLoaded: function(me, activeId) {

			ii.trace("HouseCodesLoaded", ii.traceTypes.information, "Startup");

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
	
			me.jobs = me.houseCodeJobs.slice();
			me.job.setData(me.jobs);
			me.job.select(0, me.job.focused);
			me.houseCodeJobId = me.jobs[me.job.indexSelected].id;

			if (me.search)
				me.search = false;
			else
				me.actionLoadItem();
			me.serviceLocation.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",jobType:2", me.serviceLocationsLoaded, me);
		},
		
		serviceLocationsLoaded: function(me, activeId) {			
		
			me.serviceLocations = me.houseCodeJobs.slice();			
			me.serviceLocations.unshift(new fin.wom.workOrder.HouseCodeJob({ id: parent.fin.appUI.houseCodeId, jobNumber: "", jobTitle: parent.fin.appUI.houseCodeTitle }));
						
			me.serviceLocation.setData(me.serviceLocations);
			me.serviceLocationPopup.setData(me.serviceLocations);
			
			me.customer.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",jobType:3", me.customersLoaded, me);
		},		
		
		customersLoaded: function(me, activeId) {			
		
			me.customers = me.houseCodeJobs.slice();
			me.customer.setData(me.customers);
			me.customerPopup.setData(me.customers);
		},
		
		actionLoadItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
					
			me.setLoadCount();
			me.createGrid(7);
				
			me.workOrderStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId 
				+ ",houseCodeJobId:" + me.houseCodeJobId
				+ ",workOrderNumber:0"
				+ ",status:7"
				+ ",startDate:"
				+ ",endDate:"
				, me.workOrdersLoaded
				, me);
		},
		
		actionSearchItem: function() {
			var me = this;
			var houseCodeId = 0;
			var houseCodeJobId = 0;
			var workOrderNumber = 0;
			var statusType = 8;		
						
			if (!parent.fin.cmn.status.itemValid())
				return;
					
			me.actionCancelSearchItem();
			me.setLoadCount(); 
			
			$("#messageToUser").text("Loading");	
			$("#pageLoading").show();
			
			if (me.status.indexSelected >= 0)
				statusType = me.statuses[me.status.indexSelected].id;
				
			if (me.woNumber.getValue() != "") {
				workOrderNumber = me.woNumber.getValue();
				statusType = 0;
				houseCodeId = 0;
				houseCodeJobId = 0;
			}
			else {
				houseCodeId = parent.fin.appUI.houseCodeId;
				houseCodeJobId = me.houseCodeJobId;
			}

			me.search = true;

			me.workOrderStore.fetch("userId:[user],houseCodeId:" + houseCodeId
				+ ",houseCodeJobId:" + houseCodeJobId
				+ ",workOrderNumber:" + workOrderNumber
				+ ",status:" + statusType
				+ ",startDate:" + me.startDateHeader.lastBlurValue
				+ ",endDate:" + me.endDateHeader.lastBlurValue
				, me.workOrdersLoaded
				, me);
		},
		
		controlReadOnly: function() {
		    var	me = this;
			
			if (me.workOrdersReadOnly) {
				
				$("#ServiceLocationText").attr('disabled', true);
				$("#ServiceLocationAction").removeClass("iiInputAction");
				$("#CustomerText").attr('disabled', true);
				$("#CustomerAction").removeClass("iiInputAction");
				$("#RequestedByText").attr('disabled', true);
				$("#TennantText").attr('disabled', true);
				$("#PhoneNumberText").attr('disabled', true);
				$("#PONumberText").attr('disabled', true);
				$("#StartDateText").attr('disabled', true);
				$("#StartDateAction").removeClass("iiInputAction");
				$("#OvertimeAuthorizedYes").attr('disabled', true);
				$("#OvertimeAuthorizedNo").attr('disabled', true);
				$("#ServiceContractText").attr('disabled', true);
				$("#GeneralLocationCodeText").attr('disabled', true);
				$("#CustomerWorkOrderNumberText").attr('disabled', true);
				$("#SquareFeetText").attr('disabled', true);
				$("#AreaManagerEmailText").attr('disabled', true);
				$("#RegionalManagerEmailText").attr('disabled', true);
				$("#SubcontractedYes").attr('disabled', true);
				$("#SubcontractedNo").attr('disabled', true);
				$("#CommissionableYes").attr('disabled', true);
				$("#CommissionableNo").attr('disabled', true);
				$("#NotesText").attr('disabled', true);
			
				$("#AnchorSave").hide();
				$("#AnchorNew").hide();
				$("#AnchorUndo").hide();
				$("#AnchorCancelWorkOrder").hide();
				$("#AnchorApprove").hide();
				$("#searchIcon").hide();
				$("#AnchorView").hide();
				$("#AnchorPrint").hide();
				$("#actionMenu").hide();
			}
			
			if (me.woWriteNoApprove) {
				$("#AnchorApprove").hide();
				$("#searchIcon").hide();
			}		
		},
		
		workOrdersLoaded: function(me, activeId) {

			if (me.search) {
				if (me.workOrders.length > 0) {
					me.createGrid(me.workOrders[0].statusType);
					
					if (parent.fin.appUI.houseCodeId != me.workOrders[0].houseCode)
						me.houseCodeStore.fetch("userId:[user],hcmHouseCodeId:" + me.workOrders[0].houseCode + ",defaultOnly:false,", me.workOrderHouseCodesLoaded, me);
					else
						me.search = false;
				}
				else {
					me.search = false;
					me.createGrid(7);
				}							
			}			

			me.controlReadOnly();
			me.workOrderGrid.setData(me.workOrders);

			me.serviceLocation.reset();
			me.customer.reset();
			me.requestedBy.setValue("");
			me.tennant.setValue("");
			me.phoneNumber.setValue("");
			me.poNumber.setValue("");
			me.startDate.setValue("");
			me.serviceContract.setValue("");
			me.generalLocationCode.setValue("");
			me.customerWorkOrderNumber.setValue("");
			me.squareFeet.setValue("");
			me.areaManagerEmail.setValue("");
			me.regionalManagerEmail.setValue("");
			me.notes.value = "";
			$("#OvertimeAuthorizedYes")[0].checked = true;
			$("#SubcontractedYes")[0].checked = true;
			$("#CommissionableYes")[0].checked = true;			
			
			me.anchorSave.display(ui.cmn.behaviorStates.disabled);
			me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
			me.anchorCancelWorkOrder.display(ui.cmn.behaviorStates.disabled);
			me.anchorApprove.display(ui.cmn.behaviorStates.disabled);
			me.anchorView.display(ui.cmn.behaviorStates.disabled);
			me.anchorPrint.display(ui.cmn.behaviorStates.disabled);

			me.checkLoadCount(); 
			me.resizeControls();
		},
		
		workOrderHouseCodesLoaded: function(me, activeId) {

			me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			me.houseCodeChanged();
		},
		
		itemSelect: function() {			
			var args = ii.args(arguments,{
				index: {type: Number}
			});			
			var me = this;
			var index = args.index;
			var item = me.workOrderGrid.data[index];
			
			me.lastSelectedRowIndex = index;
			
			if (item == undefined) {
				me.workOrderId = 0;
				return;
			}
			
			if (item.statusType == 7 || item.statusType == 8) {
				me.setReadOnly(false);
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
				me.anchorUndo.display(ui.cmn.behaviorStates.enabled);
				me.anchorCancelWorkOrder.display(ui.cmn.behaviorStates.enabled);
				me.anchorApprove.display(ui.cmn.behaviorStates.enabled);
			}
			else {
				me.setReadOnly(true);
				me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				me.anchorUndo.display(ui.cmn.behaviorStates.disabled);
				me.anchorCancelWorkOrder.display(ui.cmn.behaviorStates.disabled);
				me.anchorApprove.display(ui.cmn.behaviorStates.disabled);
			}
			
			me.anchorView.display(ui.cmn.behaviorStates.enabled);
			me.anchorPrint.display(ui.cmn.behaviorStates.enabled);
			
			me.serviceLocation.reset();
			me.customer.reset();

			for (var index = 0; index < me.serviceLocations.length; index++) {
				if (item.serviceLocationBrief == "") {
					if (me.serviceLocations[index].jobTitle == item.serviceLocation) {
						me.serviceLocation.select(index, me.serviceLocation.focused);
						break;
					}
				}
				else {
					if (me.serviceLocations[index].jobNumber == item.serviceLocationBrief) {
						me.serviceLocation.select(index, me.serviceLocation.focused);
						break;
					}
				}
			}

			for (var index = 0; index < me.customers.length; index++) {
				if (item.customerBrief == "") {
					if (me.customers[index].jobTitle == item.customer) {
						me.customer.select(index, me.customer.focused);
						break;
					}	
				}
				else {
					if (me.customers[index].jobNumber == item.customerBrief) {
						me.customer.select(index, me.customer.focused);
						break;
					}	
				}								
			}

			me.workOrderId = item.id;		
			me.requestedBy.setValue(item.requestedBy);
			me.tennant.setValue(item.tennant);
			me.phoneNumber.setValue(item.phone);
			me.poNumber.setValue(item.poNumber);
			me.startDate.setValue(item.startDate);
			me.serviceContract.setValue(item.serviceContract);
			me.generalLocationCode.setValue(item.generalLocationCode);
			me.customerWorkOrderNumber.setValue(item.customerWorkOrderNumber);
			me.squareFeet.setValue(item.squareFeet);
			me.areaManagerEmail.setValue(item.areaManagerEmail);
			me.regionalManagerEmail.setValue(item.regionalManagerEmail);
			me.notes.value = item.notes;

			if (item.overtimeAuthorized)
				$("#OvertimeAuthorizedYes").attr("checked", true);
			else
				$("#OvertimeAuthorizedNo").attr("checked", true);

			if (item.subcontracted)
				$("#SubcontractedYes").attr("checked", true);
			else
				$("#SubcontractedNo").attr("checked", true);

			if (item.commissionable)
				$("#CommissionableYes").attr("checked", true);
			else
				$("#CommissionableNo").attr("checked", true);	
			me.controlReadOnly();
			me.setStatus("Loaded");				
		},		
		
		setReadOnly: function(readOnly) {
			var me = this;
			
			me.serviceLocation.text.readOnly = readOnly;			
			me.customer.text.readOnly = readOnly;			
			me.requestedBy.text.readOnly = readOnly;
			me.tennant.text.readOnly = readOnly;
			me.phoneNumber.text.readOnly = readOnly;
			me.poNumber.text.readOnly = readOnly;
			me.startDate.text.readOnly = readOnly;
			me.serviceContract.text.readOnly = readOnly;	
			me.generalLocationCode.text.readOnly = readOnly;	
			me.customerWorkOrderNumber.text.readOnly = readOnly;			
			me.squareFeet.text.readOnly = readOnly;
			me.areaManagerEmail.text.readOnly = readOnly;
			me.regionalManagerEmail.text.readOnly = readOnly;
			me.notes.readOnly = readOnly;
			$("#OvertimeAuthorizedYes")[0].disabled = readOnly;
			$("#OvertimeAuthorizedNo")[0].disabled = readOnly;
			$("#SubcontractedYes")[0].disabled = readOnly;
			$("#SubcontractedNo")[0].disabled = readOnly;
			$("#CommissionableYes")[0].disabled = readOnly;
			$("#CommissionableNo")[0].disabled = readOnly;

			if (readOnly) {
				$("#ServiceLocationAction").removeClass("iiInputAction");
				$("#CustomerAction").removeClass("iiInputAction");
				$("#StartDateAction").removeClass("iiInputAction");
			}
			else {
				$("#ServiceLocationAction").addClass("iiInputAction");
				$("#CustomerAction").addClass("iiInputAction");
				$("#StartDateAction").addClass("iiInputAction");
			}
		},		
		
		resizeControls: function() {
			var me = this;
			
			me.serviceLocationPopup.resizeText();
			me.customerPopup.resizeText();
			me.requestedByPopup.resizeText();
			me.tennantPopup.resizeText();
			me.phoneNumberPopup.resizeText();
			me.poNumberPopup.resizeText();
			me.startDatePopup.resizeText();
			me.serviceContractPopup.resizeText();
			me.generalLocationCodePopup.resizeText();
			me.customerWorkOrderNumberPopup.resizeText();
			me.squareFeetPopup.resizeText();
			me.areaManagerEmailPopup.resizeText();
			me.regionalManagerEmailPopup.resizeText();
		},
		
		resetControls: function() {
			var me = this;			
	
			me.validator.reset();
			me.serviceLocationPopup.setValue("");
			me.customerPopup.setValue("");
			me.requestedByPopup.setValue("");
			me.tennantPopup.setValue("");
			me.phoneNumberPopup.setValue("");
			me.poNumberPopup.setValue("");
			me.startDatePopup.setValue("");
			me.serviceContractPopup.setValue("");
			me.generalLocationCodePopup.setValue("");
			me.customerWorkOrderNumberPopup.setValue("");
			me.squareFeetPopup.setValue("");
			me.areaManagerEmailPopup.setValue("");
			me.regionalManagerEmailPopup.setValue("");
			me.notesPopup.value = "";
			$("#OvertimeAuthorizedPopupYes")[0].checked = true;
			$("#SubcontractedPopupYes")[0].checked = true;
			$("#CommissionablePopupYes")[0].checked = true;
			
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
			
			$("#Days")[0].checked = true;
			$("#RepeatDays")[0].checked = true;			
			$("#AM")[0].checked = true;
			
			me.numberOfDays.setValue("");
			me.numberOfWeeks.setValue("");
			me.calendarDays.setValue("");
			me.weekOfMonth.select(0, me.weekOfMonth.focused);
			me.hour.select(11, me.hour.focused);
			me.minute.select(0, me.minute.focused);
			me.endDatePopup.setValue("");
			
			me.numberOfDays.text.readOnly = true;
			me.calendarDays.text.readOnly = true;
		},
		
		hideWorkOrderSetupPopup: function() {
			var me = this;
			
			switch (me.nextCount) {
				case 1:
				
					$("#workOrderContentAreaPopup").hide();
					
					break;
					
				case 4:
				
					$("#StartTime").hide();
					$("#WeekDays").hide();
					
					if (me.recurringType == 0) {
										
						$("#DailyPopup").hide();					
						$("#EveryWeekDay").hide();
					}					
					else if (me.recurringType == 1) {
					
						$("#WeeklyPopup").hide();
						$("#WeeklySchedule").hide();
					}
					else if (me.recurringType == 2) {						
						
						$("#MonthlySchedule").hide();
						$("#MonthlyPopup").hide();
						$("#EveryMonth").hide();
					}
					
					break;
				}
				
			hidePopup();
		},
		
		actionCancelItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.hideWorkOrderSetupPopup();
			me.action = "";
			me.nextCount = 0;
			me.setStatus("Loaded");
		},
		
		actionCancelSearchItem: function() {
			var me = this;
		
			$("#searchIcon").html("<img src='/fin/cmn/usr/media/Common/searchPlus.png'/>");
			$("#searchOption").hide("slow");
		},
		
		actionUndoItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.action != "")
				return;				
			
			if (me.lastSelectedRowIndex >= 0) {
				me.itemSelect(me.lastSelectedRowIndex);
			}		
		},
		
		actionCancelWorkOrderItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.action = "Cancel";
			
			$("#messageToUser").text("Canceling");
			$("#pageLoading").fadeIn("slow"); 
			
			xml += '<womWorkOrderStatus';
			xml += ' id="' + me.workOrderId + '"';
			xml += ' statusType="6"';
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
		
		actionApproveItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			
			if (me.woWriteNoApprove) return;

			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.action = "Approve";
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Approving");
			$("#pageLoading").fadeIn("slow"); 
			
			xml += '<womWorkOrderStatus';
			xml += ' id="' + me.workOrderId + '"';
			xml += ' statusType="8"';
			xml += ' approvedBy="RM"';
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
		
		actionViewItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			$("#popupHeader").text("Work Order Items");
			$("#workOrderType").hide();
			$("#workOrderContentAreaPopup").hide();
			$("#RecurringPopup").hide();
			$("#AnchorNextPopup").hide();
			$("#popupWorkOrder").show();
			$("#AnchorCancelPopup").show();			

			if (me.workOrders[me.lastSelectedRowIndex].statusType == 7 || me.workOrders[me.lastSelectedRowIndex].statusType == 8) {
				$("#WorkOrderPopupReadOnly").hide();
				$("#AnchorSavePopup").show();
				$("#WorkOrderPopup").show();				
			}
			else {
				$("#AnchorSavePopup").hide();
				$("#WorkOrderPopup").hide();
				$("#WorkOrderPopupReadOnly").show();
			}
			
			loadPopup();
			
			me.setLoadCount(); 
			me.workOrderItemStore.reset();
			me.workOrderItemStore.fetch("userId:[user],workOrderId:" + me.workOrderId, me.workOrdersItemsLoaded, me);
		},
		
		workOrdersItemsLoaded: function(me, activeId) {

			if (me.workOrders[me.lastSelectedRowIndex].statusType == 7 || me.workOrders[me.lastSelectedRowIndex].statusType == 8) {
				me.workOrderItemGrid.resize();
				me.workOrderItemGrid.setData(me.workOrderItems);
				me.action = "EditItems";
			}
			else {
				me.workOrderItemReadOnlyGrid.resize();
				me.workOrderItemReadOnlyGrid.setData(me.workOrderItems);
			}
			
			me.workOrderItemsCountOnLoad = me.workOrderItems.length;
			me.checkLoadCount();
		},
		
		actionPrintItem: function() {
			var me = this;

			if (me.workOrderId <= 0)
				return;

			window.open(location.protocol + '//' + location.hostname + '/reports/workorder.aspx?workorder=' + me.workOrderId,'PrintWO','type=fullWindow,status=yes,toolbar=no,menubar=no,location=no,resizable=yes');
		},
		
		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.workOrdersReadOnly) return;
			
			if (me.action != "")
				return;
			
			if (me.job.indexSelected < 0) {
				alert("In order to create new work order please select correct job.");
				return;
			}
			
			$("#popupHeader").text("Work Order Setup");
			$("#popupWorkOrder").show();
			$("#workOrderContentAreaPopup").show();
			$("#WorkOrderPopup").hide();
			$("#WorkOrderPopupReadOnly").hide();
			$("#RecurringPopup").hide();
			$("#AnchorSavePopup").hide();
			$("#workOrderType").hide();
			$("#AnchorCancelPopup").show();
			$("#AnchorNextPopup").show();
			$("#Daily")[0].checked = true;
			$("#WOMTime")[0].checked = true;
            			
			me.workOrderItemsCountOnLoad = 0;
			me.nextCount = 1;
			me.workOrderType = 0;
			me.recurringType = 0;
			me.action = "New";
						
			loadPopup();
			me.setStatus("Loaded");
		},			
		
		actionNextItem: function() {
			var me = this;
			
			me.modified(true);
			if (!me.validateWorkOrder()) {
				alert("In order to continue, the errors on the page must be corrected.");
				return;
			}	
			
			switch (me.nextCount) {
				case 0:
				
					$("#popupWorkOrder").show();
					$("#workOrderType").hide();
					$("#WorkOrderPopup").hide();
					$("#AnchorCancelPopup").show();
					$("#AnchorNextPopup").show();
					$("#AnchorSavePopup").hide();
					$("#AnchorSavePopup").hide();
					$("#workOrderContentAreaPopup").show();
					$("#RecurringPopup").hide();
					
					me.resetControls();
					
					break;
					
				case 1:

					if (parent.fin.appUI.houseCodeTitle == me.customerPopup.lastBlurValue)
						alert("Warning: You have selected a House Code as the customer. This will become the bill to address for the invoice. Click OK to Continue.");

					$("#workOrderContentAreaPopup").hide();
					$("#WorkOrderPopup").show();
					$("#RecurringPopup").hide();
	
					me.workOrderItemGrid.resize();
					me.workOrderItemGrid.setData([]);
					
					if (me.workOrderType == 0) {
						$("#AnchorNextPopup").hide();
						$("#AnchorSavePopup").show();
					}
					
					break;
					
				case 2:
				
					$("#RecurringPopup").show();
					$("#radioButtonRecurring").show();				
					$("#AnchorNextPopup").show();
					$("#WorkOrderPopup").hide();
					$("#WeeklySchedule").hide();
					$("#MonthlySchedule").hide();
					$("#DailyPopup").hide();
					$("#WeeklyPopup").hide();
					$("#MonthlyPopup").hide();
					$("#WeekDays").hide();
					$("#StartTime").hide();
					$("#EveryWeekDay").hide();
					$("#EveryMonth").hide();
					
					break;
					
				case 3:
				
					$("#AnchorNextPopup").hide();
					$("#AnchorSavePopup").show();
					$("#radioButtonRecurring").hide();
					$("#WorkOrderPopup").hide();
					$("#StartTime").show();
					
					me.hour.resizeText();
					me.minute.resizeText();
					me.endDatePopup.resizeText();
					me.endDatePopup.resetValidation(true);
					me.endDatePopup.setValue("");
					
					if (me.recurringType == 0) {
										
						$("#DailyPopup").show();
						$("#WeeklySchedule").hide();
						$("#MonthlySchedule").hide();
						$("#WeeklyPopup").hide();
						$("#MonthlyPopup").hide();
						$("#EveryMonth").hide();
						$("#RecurringPopup").show();
						$("#WeekDays").show();						
						$("#EveryWeekDay").show();
						
						me.numberOfDays.resizeText();
						me.numberOfDays.resetValidation(true);
						me.numberOfDays.setValue("");
					}					
					else if (me.recurringType == 1) {						
						
						$("#MonthlySchedule").hide();
						$("#DailyPopup").hide();
						$("#WeeklyPopup").show();
						$("#MonthlyPopup").hide();
						$("#EveryMonth").hide();
						$("#WeeklySchedule").show();
						$("#WeekDays").show();
						$("#EveryWeekDay").hide();
						
						me.numberOfWeeks.resizeText();
						me.numberOfWeeks.resetValidation(true);
						me.numberOfWeeks.setValue("");
					}
					else if (me.recurringType == 2) {						
						
						$("#WeeklySchedule").hide();
						$("#MonthlySchedule").show();
						$("#DailyPopup").hide();
						$("#WeeklyPopup").hide();
						$("#MonthlyPopup").show();
						$("#EveryMonth").show();
						$("#WeekDays").show();
						$("#EveryWeekDay").hide();
						
						me.weekOfMonth.resizeText();
						me.calendarDays.resizeText();
						me.calendarDays.resetValidation(true);
						me.calendarDays.setValue("");
					}
					
					break;
				}
				
			me.nextCount++;
		},
		
		calculateTotal: function() {
			var me = this;
			var quantity = me.itemQuantity.getValue();
			var price = me.itemPrice.getValue();
			var markup = me.itemMarkup.getValue();
			
			if (quantity != "" && !isNaN(quantity) && price != undefined && markup != undefined)
				var total = ui.cmn.text.money.format((quantity * price) + (quantity * price * markup / 100));
			else
				total = "";
			
			$(me.workOrderItemGrid.rows[me.workOrderItemGrid.activeRowIndex].getElement("total")).text(total);
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
		
		validateWorkOrder: function() {
			var me = this;
			var valid = true;

			if ((me.nextCount == 0 || me.nextCount == 3) && me.action == "New")
				return true;
			
			me.validator.forceBlur();

			if (me.action == "") {
				// Check to see if the data entered is valid
				valid = me.validator.queryValidity(true);
				
				if (!me.serviceLocation.valid
					|| !me.customer.valid
					|| !me.requestedBy.valid					
					|| !me.phoneNumber.valid					
					|| !me.startDate.valid
					|| !me.squareFeet.valid
					|| !me.areaManagerEmail.valid
					|| !me.regionalManagerEmail.valid
					) {
					return false;
				}
				else
					return true;
			}
			else if (me.nextCount == 1) {
				valid = me.validator.queryValidity(true);
				
				if (!me.serviceLocationPopup.valid
					|| !me.customerPopup.valid
					|| !me.requestedByPopup.valid					
					|| !me.phoneNumberPopup.valid					
					|| !me.startDatePopup.valid
					|| !me.squareFeetPopup.valid
					|| !me.areaManagerEmailPopup.valid
					|| !me.regionalManagerEmailPopup.valid
					) {
					return false;
				}
				else
					return true;
			}
			else if (me.nextCount == 2 || me.action == "EditItems") {
				
				if (me.workOrderItemGrid.activeRowIndex == -1)
				 	return true;
				
				me.workOrderItemGrid.body.deselectAll();
				valid = me.validator.queryValidity(true);
				
				if (!me.workOrderTask.valid
					|| !me.itemDescription.valid
					|| !me.itemQuantity.valid
					|| !me.itemPrice.valid
				) {
					return false;
				}
				else
					return true;
			}
			else if (me.nextCount == 4) {
				valid = me.validator.queryValidity(true);
				
				if (!me.endDatePopup.valid || !me.hour.valid || !me.minute.valid) {
					if (me.recurringType == 0) {
						if ($("input[name='rbDaily']:checked").val() != 2) {
							me.numberOfDays.resetValidation(true);
							me.numberOfDays.setValue("");
						}
					}
					else if (me.recurringType == 2) {
						if ($("input[name='rbMonthly']:checked").val() == 0) {
							me.calendarDays.resetValidation(true);
							me.calendarDays.setValue("");
						}
					}
					
					return false;
				}					
					
				if (me.recurringType == 0) {
					
					if ($("input[name='rbDaily']:checked").val() == 0 && !me.isWeekDaySelected()) {
						me.numberOfDays.resetValidation(true);
						me.numberOfDays.setValue("");
						alert('Please select day/s of the Week.');
						return false;
					}	
					else if ($("input[name='rbDaily']:checked").val() == 2 && !me.numberOfDays.valid)
						return false;
					else
						return true;
				}
				else if (me.recurringType == 1) {
					
					if (!me.isWeekDaySelected()) {
						alert('Please select day/s of the Week.');
						return false;
					}
					else if (!me.numberOfWeeks.valid)
						return false;
					else
						return true;
				}
				else if (me.recurringType == 2) {
					
					if(me.jan.check.checked == false 
						&& me.feb.check.checked == false 
						&& me.mar.check.checked == false 
						&& me.apr.check.checked == false 
						&& me.may.check.checked == false 
						&& me.jun.check.checked == false 
						&& me.jul.check.checked == false 
						&& me.aug.check.checked == false 
						&& me.sep.check.checked == false 
						&& me.oct.check.checked == false 
						&& me.nov.check.checked == false 
						&& me.dec.check.checked == false) {
						alert('Please select the Month/s.');
						return false;	
					}
					
					if ($("input[name='rbMonthly']:checked").val() == 0) {
						
						me.calendarDays.resetValidation(true);
						me.calendarDays.setValue("");
				
						if (!me.isWeekDaySelected()) {
							alert('Please select Day/s of the Week.');
							return false;
						}
						else if (!me.weekOfMonth.valid)
							return false;
						else
							return true;
					}
					else if ($("input[name='rbMonthly']:checked").val() == 1) {
						
						if (!me.calendarDays.valid)
							return false;
						else
							return true;
					}
				}
				else
					return true;
			}			
		},
		
		getWeekDays: function() {
			var me = this;
			var weekDays = "";
			
			weekDays += me.sunday.check.checked == true ? "Sunday," : "";
			weekDays += me.monday.check.checked == true ? "Monday," : "";
			weekDays += me.tuesday.check.checked == true ? "Tuesday," : "";
			weekDays += me.wednesday.check.checked == true ? "Wednesday," : "";
			weekDays += me.thursday.check.checked == true ? "Thursday," : "";
			weekDays += me.friday.check.checked == true ? "Friday," : "";
			weekDays += me.saturday.check.checked == true ? "Saturday," : "";
			
			if (weekDays != "")
				weekDays = weekDays.substring(0, weekDays.lastIndexOf(","));
			return weekDays;
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (me.workOrdersReadOnly) return;

			if (me.anchorSave.state == "Disabled" && me.action == "")
				return;

			me.workOrderItemGrid.body.deselectAll();

			if (me.workOrderItemGrid.data != undefined && me.workOrderItemGrid.data.length <= 0) {
				alert("Please enter work order line item.");
				return;
			}

			if (!me.validateWorkOrder()) {
				alert("In order to save, the errors on the page must be corrected.");
				return;
			}

			if (me.action == "New" || me.action == "EditItems") {
				me.hideWorkOrderSetupPopup();
			}
			else {
				me.action = "Edit";				
			}

			me.saveWorkOrder();
		},
		
		saveWorkOrder: function() {
			var me = this;
			var item = [];
			
			me.setStatus("Saving");
											
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow"); 
			
			if (me.action == "New") {
				me.workOrderId = 0;

				item = new fin.wom.workOrder.WorkOrder(
					me.workOrderId
					, parent.fin.appUI.houseCodeId
					, me.houseCodeJobId
					, 7
					, 0
					, me.serviceLocations[me.serviceLocationPopup.indexSelected].jobNumber
					, me.serviceLocations[me.serviceLocationPopup.indexSelected].jobTitle
					, me.customers[me.customerPopup.indexSelected].jobNumber
					, me.customers[me.customerPopup.indexSelected].jobTitle
					, me.requestedByPopup.getValue()
					, me.tennantPopup.getValue()
					, fin.cmn.text.mask.phone(me.phoneNumberPopup.getValue(), true)
					, me.poNumberPopup.getValue()
					, me.startDatePopup.lastBlurValue
					, ($("input[name='OvertimeAuthorizedPopup']:checked").val() == "true" ? true : false)
					, me.serviceContractPopup.getValue()
					, me.generalLocationCodePopup.getValue()
					, me.customerWorkOrderNumberPopup.getValue()
					, me.squareFeetPopup.getValue()
					, me.areaManagerEmailPopup.getValue()
					, me.regionalManagerEmailPopup.getValue()
					, ($("input[name='SubcontractedPopup']:checked").val() == "true" ? true : false)
					, ($("input[name='CommissionablePopup']:checked").val() == "true" ? true : false)
					, me.notesPopup.value
				);
			}
			else if (me.action == "Edit" || me.action == "EditItems") {
				me.workOrderType = 0;

				item = new fin.wom.workOrder.WorkOrder(
					me.workOrderId
					, me.workOrders[me.lastSelectedRowIndex].houseCode
					, me.workOrders[me.lastSelectedRowIndex].houseCodeJob
					, me.workOrders[me.lastSelectedRowIndex].statusType
					, me.workOrders[me.lastSelectedRowIndex].workOrderNumber
					, me.serviceLocations[me.serviceLocation.indexSelected].jobNumber
					, me.serviceLocations[me.serviceLocation.indexSelected].jobTitle
					, me.customers[me.customer.indexSelected].jobNumber
					, me.customers[me.customer.indexSelected].jobTitle
					, me.requestedBy.getValue()
					, me.tennant.getValue()
					, fin.cmn.text.mask.phone(me.phoneNumber.getValue(), true)
					, me.poNumber.getValue()
					, me.startDate.lastBlurValue
					, ($("input[name='OvertimeAuthorized']:checked").val() == "true" ? true : false)
					, me.serviceContract.getValue()
					, me.generalLocationCode.getValue()
					, me.customerWorkOrderNumber.getValue()
					, me.squareFeet.getValue()
					, me.areaManagerEmail.getValue()
					, me.regionalManagerEmail.getValue()
					, ($("input[name='Subcontracted']:checked").val() == "true" ? true : false)
					, ($("input[name='Commissionable']:checked").val() == "true" ? true : false)
					, me.notes.value
				);
			}

			var xml = me.saveXmlBuildWorkOrder(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildWorkOrder: function () {
			var args = ii.args(arguments, {
				item: { type: fin.wom.workOrder.WorkOrder }
			});
			var me = this;
			var xml = "";		

			xml += '<womWorkOrder';
			xml += ' id="' + args.item.id + '"';
			xml += ' houseCodeId="' + args.item.houseCode + '"';
			xml += ' houseCodeJobId="' + args.item.houseCodeJob + '"';
			xml += ' serviceLocationBrief="' + ui.cmn.text.xml.encode(args.item.serviceLocationBrief) + '"';
			xml += ' serviceLocation="' + ui.cmn.text.xml.encode(args.item.serviceLocation) + '"';
			xml += ' customerBrief="' + ui.cmn.text.xml.encode(args.item.customerBrief) + '"';
			xml += ' customer="' + ui.cmn.text.xml.encode(args.item.customer) + '"';
			xml += ' requestedBy="' + ui.cmn.text.xml.encode(args.item.requestedBy) + '"';
			xml += ' tennant="' + ui.cmn.text.xml.encode(args.item.tennant) + '"';
			xml += ' phone="' + args.item.phone + '"';
			xml += ' poNumber="' + ui.cmn.text.xml.encode(args.item.poNumber) + '"';
			xml += ' startDate="' + args.item.startDate + '"';
			xml += ' overtimeAuthorized="' + args.item.overtimeAuthorized + '"';
			xml += ' serviceContract="' + ui.cmn.text.xml.encode(args.item.serviceContract) + '"';
			xml += ' generalLocationCode="' + ui.cmn.text.xml.encode(args.item.generalLocationCode) + '"';
			xml += ' customerWorkOrderNumber="' + ui.cmn.text.xml.encode(args.item.customerWorkOrderNumber) + '"';
			xml += ' squareFeet="' + args.item.squareFeet + '"';
			xml += ' areaManagerEmail="' + args.item.areaManagerEmail + '"';
			xml += ' regionalManagerEmail="' + args.item.regionalManagerEmail + '"';
			xml += ' subcontracted="' + args.item.subcontracted + '"';
			xml += ' commissionable="' + args.item.commissionable + '"';
			xml += ' notes="' + ui.cmn.text.xml.encode(args.item.notes) + '"';
			xml += ' workOrderType="' + me.workOrderType + '"';
			
			if (me.workOrderType == 1) {
				var weekDays = "";
				var months = "";
				var scheduleType = 0;
				var numberOfDays = 0;
				var numberOfWeeks = 0;
				var calendarDays = 0;
				var weekOfMonth = -1;
				var startTime = "";
				
				startTime = me.hours[me.hour.indexSelected].title 
					+ ":" + me.minutes[me.minute.indexSelected].title 
					+ ":00 " + $("input[name='rbStartTime']:checked").val();
			
				if (me.recurringType == 0) {
					scheduleType = $("input[name='rbDaily']:checked").val();
					
					if (scheduleType == 0) {
						weekDays = me.getWeekDays();					
					}
					else if (scheduleType == 2) {
						numberOfDays = me.numberOfDays.getValue();
					}
				}
				else if (me.recurringType == 1) {
					numberOfWeeks = me.numberOfWeeks.getValue();
					weekDays = me.getWeekDays();
				}
				else if (me.recurringType == 2) {
					scheduleType = $("input[name='rbMonthly']:checked").val();
					
					months += me.jan.check.checked == true ? "1," : "";
					months += me.feb.check.checked == true ? "2," : "";
					months += me.mar.check.checked == true ? "3," : "";
					months += me.apr.check.checked == true ? "4," : "";
					months += me.may.check.checked == true ? "5," : "";
					months += me.jun.check.checked == true ? "6," : "";
					months += me.jul.check.checked == true ? "7," : "";
					months += me.aug.check.checked == true ? "8," : "";
					months += me.sep.check.checked == true ? "9," : "";
					months += me.oct.check.checked == true ? "10," : "";
					months += me.nov.check.checked == true ? "11," : "";
					months += me.dec.check.checked == true ? "12," : "";
					
					if (months != "")
						months = months.substring(0, months.lastIndexOf(","));
						
					if (scheduleType == 0) {
						weekOfMonth = me.weeks[me.weekOfMonth.indexSelected].id;
						weekDays = me.getWeekDays();					
					}
					else
						calendarDays = me.calendarDays.getValue();
				}
				
				xml += ' recurringType="' + me.recurringType + '"';
				xml += ' scheduleType="' + scheduleType + '"';
				xml += ' startTime="' + startTime + '"';
				xml += ' endDate="' + me.endDatePopup.lastBlurValue + '"';
				xml += ' weekDays="' + weekDays + '"';
				xml += ' months="' + months + '"';
				xml += ' numberOfDays="' + numberOfDays + '"';
				xml += ' numberOfWeeks="' + numberOfWeeks + '"';
				xml += ' weekOfMonth="' + weekOfMonth + '"';
				xml += ' calendarDays="' + calendarDays + '"';				
			}			
			
			xml += '/>';
			
			if (me.action == "New" || me.action == "EditItems") {
			
				for (var index = 0; index < me.workOrderItemGrid.data.length; index++) {
					
					if (me.workOrderItemGrid.data[index].modified == false && index < me.workOrderItemsCountOnLoad) continue;
					
					xml += '<womWorkOrderItem';
					xml += ' id="' + me.workOrderItemGrid.data[index].id + '"';
					xml += ' workOrderId="' + me.workOrderId + '"';
					xml += ' workOrderTaskId="' + me.workOrderItemGrid.data[index].workOrderTask.id + '"';
					xml += ' price="' + me.workOrderItemGrid.data[index].price + '"';
					xml += ' quantity="' + me.workOrderItemGrid.data[index].quantity + '"';
					xml += ' markup="' + me.workOrderItemGrid.data[index].markup + '"';
					xml += ' description="' + ui.cmn.text.xml.encode(me.workOrderItemGrid.data[index].description) + '"';
					xml += '/>';
				}
			}

			xml += '<womWorkOrderItemRecurring';
			xml += ' id="' + args.item.id + '"';
			xml += '/>';
			
			return xml;
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
			var workOrderCreated = false;
									
			if (status == "success") {
				me.modified(false);

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "womWorkOrder":
						
							if (me.action == "New") {									
									var workOrderItem = new fin.wom.workOrder.WorkOrder(
										parseInt($(this).attr("id"), 10)
										, item.houseCode
										, item.houseCodeJob
										, item.statusType
										, parseInt($(this).attr("workOrderNumber"), 10)
										, item.serviceLocationBrief
										, item.serviceLocation
										, item.customerBrief
										, item.customer
										, item.requestedBy
										, item.tennant
										, item.phone
										, item.poNumber
										, $(this).attr("startDate")
										, item.overtimeAuthorized
										, item.serviceContract
										, item.generalLocationCode
										, item.customerWorkOrderNumber
										, item.squareFeet
										, item.areaManagerEmail
										, item.regionalManagerEmail
										, item.subcontracted
										, item.commissionable
										, item.notes
									);
									
									me.workOrders.push(workOrderItem);
									workOrderCreated = true;
							}
							else if (me.action == "Cancel") {
								me.workOrders[me.lastSelectedRowIndex].statusType = 6;
								me.workOrderGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								me.itemSelect(me.lastSelectedRowIndex);
							}
							else if (me.action == "Approve") {
								me.workOrders[me.lastSelectedRowIndex].statusType = 8;
								me.workOrderGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
								me.itemSelect(me.lastSelectedRowIndex);
							}
							else if (me.action == "Edit") {
								me.workOrders[me.lastSelectedRowIndex] = item;
								me.workOrderGrid.body.renderRow(me.lastSelectedRowIndex, me.lastSelectedRowIndex);
							}
											
							break;
					}
				});
				
				if (me.action == "New") {
					if (workOrderCreated) {
						me.lastSelectedRowIndex = me.workOrders.length - 1;
						me.workOrderGrid.setData(me.workOrders);
						me.workOrderGrid.body.select(me.lastSelectedRowIndex);
					}
					else
						alert("Work Order is not created due to invalid selection criteria.");					
				}
				
				me.action = "";
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Work Order details: " + $(args.xmlNode).attr("message"));
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
	$("#popupWorkOrder").fadeIn("slow");
}

function hidePopup() {
	
	$("#backgroundPopup").fadeOut("slow");
	$("#popupWorkOrder").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupWorkOrder").width();
	var popupHeight = $("#popupWorkOrder").height();
		
	$("#popupWorkOrder").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
	
	$("#popupLoading").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});
		
	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.wom.workOrderUI = new fin.wom.workOrder.UserInterface();
	fin.wom.workOrderUI.resize();
	fin.houseCodeSearchUi = fin.wom.workOrderUI;
}
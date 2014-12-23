ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.statusBar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.emp.employeeRequest.usr.defs" );

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
    Name: "fin.emp.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {
	
		init: function fin_emp_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;

			me.loadCount = 0;
			me.status = "";

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmpRequest";
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

			$("#houseCodeText")[0].tabIndex = 1;
			$(window).bind("resize", me, me.resize);
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
		},

		authorizationProcess: function fin_emp_UserInterface_authorizationProcess() {
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

				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.actionDateModificationItem();
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_emp_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			
			if (!fin.employeeRequestUi) return;

		    fin.employeeRequestUi.employeeGrid.setHeight($(window).height() - 75);
			$("#EmployeeContentArea").height($(window).height() - 120);
			$("#MealProgramContainer").height($(window).height() - 110);
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
 						
			me.actionMenu
				.addAction({
					id: "importAction",
					brief: "Date Modification",
					title: "Employee date modification details.",
					actionFunction: function() { me.actionDateModificationItem(); }
				})
				.addAction({
                    id: "viewSSNAction", 
                    brief: "SSN Modification", 
                    title: "Employee SSN modification details.",
                    actionFunction: function() { me.actionSSNModificationItem(); }
                })				
				.addAction({
					id: "viewReverseTerminationAction", 
					brief: "Reverse Termination", 
					title: "Employee reverse rermination details.",
					actionFunction: function() { me.actionRevTerminationItem(); }
				})
				.addAction({
					id: "mealProgramAction", 
					brief: "Meal Program", 
					title: "Allow a house code to enroll in the meal program.",
					actionFunction: function() { me.actionMealProgramItem(); }
				});
		
			me.employeeGrid = new ui.ctl.Grid({
				id: "EmployeeGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				validationFunction: function() { return parent.fin.cmn.status.itemValid(); }
			});

			me.employeeGrid.addColumn("column4", "column4", "House Code", "House Code", 90);
			me.employeeGrid.addColumn("column5", "column5", "First Name", "First Name", null);
			me.employeeGrid.addColumn("column6", "column6", "Last Name", "Last Name", 110);
			me.employeeGrid.addColumn("column7", "column7", "Employee #", "Employee Number", 90);
			me.employeeGrid.addColumn("column8", "column8", "SSN", "SSN", 80);
			me.employeeGrid.capColumns();

			me.hireDate = new ui.ctl.Input.Date({ 
				id: "HireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.hireDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.hireDate.text.value;

					if (enteredText == "") return;
					
					if (me.employeeGrid.activeRowIndex != -1) {
						var hireDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column15);
						if (ui.cmn.text.date.format(hireDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.originalHireDate = new ui.ctl.Input.Date({ 
				id: "OriginalHireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.originalHireDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.originalHireDate.text.value;

					if (enteredText == "") return;
					
					if (me.employeeGrid.activeRowIndex != -1) {
						var originalHireDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column16);
						if (ui.cmn.text.date.format(originalHireDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.seniorityDate = new ui.ctl.Input.Date({ 
				id: "SeniorityDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.seniorityDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.seniorityDate.text.value;

					if (enteredText == "") return;

					if (me.employeeGrid.activeRowIndex != -1) {
						var seniorityDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column17);
						if (ui.cmn.text.date.format(seniorityDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.effectiveDate = new ui.ctl.Input.Date({ 
				id: "EffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.effectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.effectiveDate.text.value;

					if (enteredText == "") return;

					if (me.employeeGrid.activeRowIndex != -1) {
						var effectiveDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column18);
						if (ui.cmn.text.date.format(effectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.jobEffectiveDate = new ui.ctl.Input.Date({ 
				id: "JobEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.jobEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.jobEffectiveDate.text.value;

					if (enteredText == "") return;

					if (me.employeeGrid.activeRowIndex != -1) {
						var jobEffectiveDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column19);
						if (ui.cmn.text.date.format(jobEffectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});
				
			me.compensationEffectiveDate = new ui.ctl.Input.Date({ 
				id: "CompensationEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
			});

			me.compensationEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					var enteredText = me.compensationEffectiveDate.text.value;

					if (enteredText == "") return;

					if (me.employeeGrid.activeRowIndex != -1) {
						var compensationEffectiveDate = new Date(me.employeeGrid.data[me.employeeGrid.activeRowIndex].column20);
						if (ui.cmn.text.date.format(compensationEffectiveDate, "mm/dd/yyyy") != ui.cmn.text.date.format(new Date(enteredText), "mm/dd/yyyy"))
							me.modified(true);
					}
					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
						this.setInvalid("Please enter valid date.");
				});

			me.notes = $("#Notes")[0];
			me.notes.readOnly = true;
			
			me.proposedSSN = new ui.ctl.Input.Text({
                id: "ProposedSSN",
                maxLength: 11
            });
            
            me.proposedSSN.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( function( isFinal, dataMap ) {
 
                    var enteredText = me.proposedSSN.getValue();
 
                    if (enteredText == "") return;
 
                    me.proposedSSN.text.value = fin.cmn.text.mask.ssn(enteredText);
                    enteredText = me.proposedSSN.text.value;

                    if (/^(?!000)^([0-8]\d{2})([ -]?)((?!00)\d{2})([ -]?)((?!0000)\d{4})$/.test(enteredText) == false)
                        this.setInvalid("Please enter valid Social Security Number. Example: 001-01-0001, 899-99-9999.");
            });
			
			me.proposedSSN.text.readOnly = true;
			
			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});

			me.anchorReject = new ui.ctl.buttons.Sizeable({
				id: "AnchorReject",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Reject&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionRejectItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() {	me.actionMealProgramUpdateItem(); },
				hasHotState: true
			});
		},

		configureCommunications: function fin_emp_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.emp.HirNode,
				itemConstructorArgs: fin.emp.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.emp.HouseCode,
				itemConstructorArgs: fin.emp.houseCodeArgs,
				injectionArray: me.houseCodes			
			});

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.emp.HouseCodeDetail,
				itemConstructorArgs: fin.emp.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});

			me.employees = [];
			me.employeeStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.emp.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeGeneralArgs,
				injectionArray: me.employees
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

			me.hireDate.resizeText();
			me.originalHireDate.resizeText();
			me.seniorityDate.resizeText();
			me.effectiveDate.resizeText();
			me.jobEffectiveDate.resizeText();
			me.compensationEffectiveDate.resizeText();
			me.proposedSSN.resizeText();
			me.resize();
		},

		resetControls: function() {
			var me = this;

			me.validator.reset();
			me.proposedSSN.setValue("");
			me.hireDate.setValue("");
			me.originalHireDate.setValue("");
			me.seniorityDate.setValue("");
			me.effectiveDate.setValue("");
			me.jobEffectiveDate.setValue("");
			me.compensationEffectiveDate.setValue("");
			
			me.notes.value = "";
			$("#CurrentHireDate").text("");
			$("#CurrentOriginalHireDate").text("");
			$("#CurrentSeniorityDate").text("");
			$("#CurrentEffectiveDate").text("");
			$("#CurrentJobEffectiveDate").text("");
			$("#CurrentCompensationEffectiveDate").text("");
			$("#RequestedBy").text("");
			$("#RequestorEmail").text("");
			$("#RequestorPhone").text("");
			$("#Status").text("");
			$("#StatusCategory").text("");
			$("#ReverseTerminationEffectiveDate").text("");
			$("#SeparationCode").text("");
			$("#TerminationDate").text("");
			$("#TerminationReason").text("");
			$("#ProposedStatus").text("");
			$("#ProposedStatusCategory").text("");
			$("#ProposedReverseTerminationEffectiveDate").text("");
			$("#ProposedSeparationCode").text("");
			$("#ProposedTerminationDate").text("");
			$("#ProposedTerminationReason").text("");			
			$("#CurrentSSN").text("");           
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
		
		employeesLoaded: function(me, activeId) { 

			me.employeeGrid.setData(me.employees);
			me.setStatus("Loaded");
			me.checkLoadCount();
			me.resizeControls();
			me.resetControls();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number},  // The index of the data item to select
			});
			var me = this;
			var index = args.index;
			var item = me.employeeGrid.data[index];
			
			if (me.modification == "DateModification") {
				$("#CurrentHireDate").text(item.column9);
				$("#CurrentOriginalHireDate").text(item.column10);
				$("#CurrentSeniorityDate").text(item.column11);
				$("#CurrentEffectiveDate").text(item.column12);
				$("#CurrentJobEffectiveDate").text(item.column13);
				$("#CurrentCompensationEffectiveDate").text(item.column14);
				$("#RequestedBy").text(item.column25);
				$("#RequestorEmail").text(item.column26);
				$("#RequestorPhone").text(item.column27);
				me.hireDate.setValue(item.column15);
				me.originalHireDate.setValue(item.column16);
				me.seniorityDate.setValue(item.column17);
				me.effectiveDate.setValue(item.column18);
				me.jobEffectiveDate.setValue(item.column19);
				me.compensationEffectiveDate.setValue(item.column20);
				me.notes.value = item.column21;
			}
			else if (me.modification == "SSNModification") {
                $("#CurrentSSN").text(item.column8);
                me.proposedSSN.setValue(item.column9);
				$("#RequestedBy").text(item.column14);
				$("#RequestorEmail").text(item.column15);
				$("#RequestorPhone").text(item.column16);
                me.notes.value = item.column10;
            }
			else if (me.modification == "ReverseTermination") {
				$("#Status").text(item.column28);
				$("#StatusCategory").text(item.column30);
				$("#ReverseTerminationEffectiveDate").text(item.column15);
				$("#SeparationCode").text(item.column32);
				$("#TerminationDate").text(item.column17);
				$("#TerminationReason").text(item.column34);
				$("#RequestedBy").text(item.column38);
				$("#RequestorEmail").text(item.column39);
				$("#RequestorPhone").text(item.column40);
				me.notes.value = item.column20;
				$("#ProposedStatus").text(item.column29);
				$("#ProposedStatusCategory").text(item.column31);
				$("#ProposedReverseTerminationEffectiveDate").text(item.column24);
				$("#ProposedSeparationCode").text(item.column33);
				$("#ProposedTerminationDate").text("");
				$("#ProposedTerminationReason").text(item.column35);
			}
			
			me.setStatus("Normal");
		},

		setEmployeeGrid: function() {
			var me = this;

			me.employees.splice(me.employeeGrid.activeRowIndex, 1);
			me.employeeGrid.setData(me.employees);
			me.resetControls();
		},
		
		actionDateModificationItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid()) 
				return false;
			
			if (me.modification != "DateModification") {
				$("#pageHeader").text("Employee Date Modification Details");
				$("#MealProgram").hide();
				$("#EmpRequest").show();
				$("#divSSNCurrentValues").hide();
                $("#divSSNProposedValues").hide();
				$("#divReverseTerminationCurrentValues").hide();
				$("#divReverseTerminationProposedValues").hide();
				$("#divDateProposedValues").show();
				$("#divDateCurrentValues").show();
				$("#divNotes").show();
				$("#divNotes").height(148);
				me.modification = "DateModification";
				me.setLoadCount();
				me.employeeStore.fetch("userId:[user],object:DateModification,batch:0,startPoint:0,maximumRows:0", me.employeesLoaded, me);
			}					
		},
		
		actionSSNModificationItem: function() {
            var me = this;
 			
			if (!parent.fin.cmn.status.itemValid()) 
				return false;
					
            if (me.modification != "SSNModification") {
                $("#pageHeader").text("Employee SSN Modification Details");
				$("#MealProgram").hide();
				$("#EmpRequest").show();
                $("#divDateProposedValues").hide();
                $("#divDateCurrentValues").hide();
				$("#divReverseTerminationCurrentValues").hide();
				$("#divReverseTerminationProposedValues").hide();
                $("#divSSNCurrentValues").show();
                $("#divSSNProposedValues").show();
				$("#divNotes").show();
				$("#divNotes").height(148);
                me.modification = "SSNModification";
                me.setLoadCount();
                me.employeeStore.fetch("userId:[user],object:SSNModification,batch:0,startPoint:0,maximumRows:0", me.employeesLoaded, me);
            }           
        },
		
		actionRevTerminationItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid()) 
				return false;
					
			if (me.modification != "ReverseTermination") {
				$("#pageHeader").text("Employee Reverse Termination Details");
				$("#MealProgram").hide();
				$("#EmpRequest").show();
				$("#divDateProposedValues").hide();
				$("#divDateCurrentValues").hide();
				$("#divSSNCurrentValues").hide();
                $("#divSSNProposedValues").hide();
				$("#divReverseTerminationCurrentValues").show();
				$("#divReverseTerminationProposedValues").show();
				$("#divNotes").show();
				$("#divNotes").height(148);
				me.modification = "ReverseTermination";
				me.setLoadCount();
				me.employeeStore.fetch("userId:[user],object:ReverseTermination,batch:0,startPoint:0,maximumRows:0", me.employeesLoaded, me);
			}					
		},
		
		actionMealProgramItem: function() {
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid()) 
				return false;
				
			if (me.modification != "MealProgram") {
				$("#pageHeader").text("Employee Meal Program");
				$("#MealProgram").show();
				$("#EmpRequest").hide();
				me.modification = "MealProgram";
				me.setLoadCount();
				me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
			}
		},

		houseCodeDetailsLoaded: function(me, activeId) {

			if (me.houseCodeDetails[0].mealPlan == 0) {
				$("#MealPlanYes").attr("checked", false);
				$("#MealPlanNo").attr("checked", false);
			}
			else
				$("input[name='MealPlan'][value='" + me.houseCodeDetails[0].mealPlan + "']").attr("checked", "checked");

			me.checkLoadCount();
		},
		
		houseCodeChanged: function() {
			var me = this;

			if (parent.fin.appUI.houseCodeId <= 0) return;
			me.setLoadCount();
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
		},

		actionApproveItem: function() {
			var me = this;
			
			me.status = "Approved";
			me.actionSaveItem();
		},
		
		actionRejectItem: function() {
			var me = this;
			
			me.status = "Rejected";
			me.actionSaveItem();
		},
		
		actionMealProgramUpdateItem: function() {
			var me = this;
			
			me.status = "MealProgram";
			me.actionSaveItem();
		},
		
		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			if (me.status == "MealProgram") {
				if ($("input[name='MealPlan']:checked").val() == undefined)
					return;

				xml += '<houseCodeMealPlanUpdate';
				xml += ' id="' + parent.fin.appUI.houseCodeId + '"';
				xml += ' mealPlan="' + $("input[name='MealPlan']:checked").val() + '"';
				xml += '/>';
			}
			else {
				if (me.employeeGrid.activeRowIndex == -1)
					return;
	
				// Check to see if the data entered is valid
				me.validator.forceBlur();
	
				if (me.modification == "DateModification" && !me.validator.queryValidity(true) && me.employeeGrid.activeRowIndex >= 0) {
					alert("In order to save, the errors on the page must be corrected.");
					return false;
				}
				
				if (me.modification == "SSNModification" && me.employeeGrid.activeRowIndex >= 0) {
					if (me.proposedSSN.getValue() == "") {
						alert("Please enter SSN.");
	                	return false;
					}
					else if (!me.proposedSSN.validate(true)) {
						alert("In order to save, the errors on the page must be corrected.");
	                	return false;
					}
	            }
				
				if (me.status == "Approved") {
					if (me.modification == "DateModification") {
						xml += '<employeeDateUpdate';
						xml += ' employeeId="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column1 + '"';
						xml += ' hireDate="' + me.hireDate.text.value + '"';
						xml += ' originalHireDate="' + me.originalHireDate.text.value + '"';
						xml += ' seniorityDate="' + me.seniorityDate.text.value + '"';
						xml += ' effectiveDate="' + me.effectiveDate.text.value + '"';
						xml += ' effectiveDateJob="' + me.jobEffectiveDate.text.value + '"';
						xml += ' effectiveDateCompensation="' + me.compensationEffectiveDate.text.value + '"';
						xml += '/>';
					}
					else if (me.modification == "SSNModification") {
	                    xml += '<employeeSSNUpdate';
	                    xml += ' employeeId="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column1 + '"';
	                    xml += ' ssn="' + me.proposedSSN.text.value.replace(/-/g, '') + '"';
	                    xml += '/>';
	                }
					else if (me.modification == "ReverseTermination") {
						xml += '<employeeReverseTerminationUpdate';
						xml += ' employeeId="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column1 + '"';
						xml += ' statusType="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column21 + '"';
						xml += ' statusCategoryType="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column23 + '"';
						xml += ' active="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column11 + '"';
						xml += ' changeStatusCode="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column12 + '"';
						xml += ' payrollStatus="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column13 + '"';
						xml += ' previousPayrollStatus="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column14 + '"';
						xml += ' effectiveDate="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column24 + '"';
						xml += ' separationCode="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column25 + '"';
						xml += ' terminationDate="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column26 + '"';
						xml += ' terminationReason="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column27 + '"';
						xml += ' exportEPerson="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].column19 + '"';
						xml += '/>';
					}
				}
				else {
					xml += '<appGenericImportDateModification';
					xml += ' id="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].id + '"';
					xml += ' status="' + me.status + '"';
					xml += '/>';
				}
			}

			if (xml == "")
				return;

			me.setStatus("Saving");
			$("#messageToUser").html("Saving");
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
		
		actionUpdateItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			xml += '<appGenericImportDateModification';
			xml += ' id="' + me.employeeGrid.data[me.employeeGrid.activeRowIndex].id + '"';
			xml += ' status="' + me.status + '"';
			xml += '/>';

			me.status = "";

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
				if (me.status == "Approved")
					me.actionUpdateItem();
				else if (me.status == "Rejected")
					me.setEmployeeGrid();
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Employee date modification details: " + $(args.xmlNode).attr("message"));
			}

			if (me.status != "Approved") {
				me.modified(false);
				me.status = "";
				me.setStatus("Saved");
			}
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.employeeRequestUi = new fin.emp.UserInterface();
	fin.employeeRequestUi.resize();
	fin.houseCodeSearchUi = fin.employeeRequestUi;
}
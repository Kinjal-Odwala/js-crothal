ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.statusBar" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.emp.employeeSearch.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );
ii.Import( "fin.cmn.usr.houseCodeSearchTemplate" );

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

			me.employees = [];
			me.sortSelections = [];
			me.primaryStateAdditionalInfos = [];
			me.secondaryStateAdditionalInfos = [];
			me.primaryStateControls = [];
			me.secondaryStateControls = [];
			me.employeeSearchType = "";			
			me.personNeedUpdate = false;
			me.userNeedUpdate = true;
			me.empGeneralNeedUpdate = true;
			me.payrollNeedUpdate = true;
			me.ptoNeedUpdate = true;
			me.employeeNumberNew = 0;
			me.terminationType = 0;
			me.payFrequencyType = 0;
			me.payPeriodStartDate = "";
			me.payPeriodEndDate = "";
			me.payrollCompany = 1;
			me.payRateHourlySalary = false;
			me.wizardCount = 0;
			me.personId = 0;
			me.userId = "0";
			me.employeeGeneralId = 0;
			me.actionType = "";
			me.searchValue = "";
			me.editAction = "";
			me.typesLoaded = false;
			me.firstTimeShow = false;
			me.confirmPopup = false;
			me.employeeHireDateValue = "";
			me.payRollEntries = 0;
			me.alertMessage = 0;
			me.personBrief = "";
			me.isPageLoaded = false;
			me.houseCodeStateMinimumWage = 0;
			me.employeeSearchSelectedRowIndex = -1;
			me.employeeNumberChanged = false;			
			me.employeeActiveChanged = false;
			me.employeePayRateChanged = false;
			me.houseCodeChanged = false;
			me.houseCodeJobChanged = false;
			me.employeeValidationCalledFrom = "";
			me.employeeNameChanged = false;
			me.loadCount = 0;

			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?
			me.noContext = true;              // disable the context menu?
			
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);			
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Employees";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
						
			me.session = new ii.Session(me.cache);
			
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);
			$(document).bind("contextmenu", me, me.contextMenuProcessor);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate();
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;	
			
			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
			
			$("input[type=radio]").click(function() {
				
				switch (this.id) {
					
					case "CrothallEmployeeYes": 
							me.employeeEffectiveDate.setValue(me.currentDate());
						break;

					case "CrothallEmployeeNo": 
							me.employeeEffectiveDate.setValue(me.currentDate());	
						break;

					case "UnionYes":
						$("#LabelUnion").html("<span class='requiredFieldIndicator'>&#149;</span>Union:");
						$("#LabelUnionStatus").html("<span class='requiredFieldIndicator'>&#149;</span>Union Status:");
						break;
						
					case "UnionNo":
						$("#LabelUnion").html("<span id='nonRequiredFieldIndicator'>Union:</span>");
						me.employeeUnion.resetValidation(false);
						me.employeeUnion.updateStatus();
						me.employeeUnion.select(0, me.employeeUnion.focused);
						
						$("#LabelUnionStatus").html("<span id='nonRequiredFieldIndicator'>Union Status:</span>");
						me.employeeUnionStatus.resetValidation(false);
						me.employeeUnionStatus.updateStatus();
						me.employeeUnionStatus.select(0, me.employeeUnionStatus.focused);
						break;
				}

				if (this.id == "UnionYes" || this.id == "UnionNo") {
					fin.empSearchUi.actionPerPayPeriodReset();					
				}				
			});
			
			me.editWizardTypes = [];
			me.editWizardTypes.unshift({ id: 0, number: 0, name: "State Tax" });
			me.editWizardTypes.unshift({ id: 1, number: 1, name: "Person" });
			me.editWizardTypes.unshift({ id: 2, number: 2, name: "Local Tax" });
			me.editWizardTypes.unshift({ id: 3, number: 3, name: "Job Information" });
			me.editWizardTypes.unshift({ id: 4, number: 4, name: "Federal" });
			me.editWizardTypes.unshift({ id: 5, number: 5, name: "Employee" });
			me.editWizardTypes.unshift({ id: 6, number: 6, name: "Compensation" });
			me.editWizardAction.setData(me.editWizardTypes);
			
			$("#SSNLookUp").click(function() {

				if (fin.empSearchUi.employeeSSN.getValue() == "") {
					alert("Please enter SSN for Look-Up.");
					if (fin.empSearchUi.sgSSNShow && !fin.empSearchUi.sgSSNReadOnly) fin.empSearchUi.employeeSSN.text.focus();
					return;
				}
				
				fin.empSearchUi.employeeValidationCalledFrom = "ssnLookUp";
				fin.empSearchUi.validateAttribute = "SSN";	//validation for multiple popup			
				fin.empSearchUi.validateEmployeeDetails();
			});
			
			$("#ViewHistory").click(function() {

				$("#popupLoading").show();
				$("#popupHistory").show();

				me.employeeHistoryStore.reset();
				me.employeeHistoryStore.fetch("userId:[user],employeeNumber:" + me.employees[0].employeeNumber + ",fieldName:", me.employeeHistoriesLoaded, me);
			});
			
			$("#CrothallEmployeeYes").attr('disabled', true);
			$("#CrothallEmployeeNo").attr('disabled', true);
		},
		
		authorizationProcess: function fin_emp_employeeSearch_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);

			me.employeeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.employeeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			me.employeeSearchFull = me.authorizer.isAuthorized(me.authorizePath + "\\Search");
			me.employeeSearchHourly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Search\\Hourly");
			me.employeeSearchSalaried = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Search\\Salaried");
			
			me.employeeWizardEdit = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\Edit");
			me.employeeWizardEditOriginalDateRead = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\Edit\\Employee\\OriginalDate\\Read");
			me.employeeWizardEditSeniorityDateRead = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\Edit\\Employee\\SeniorityDate\\Read");
			me.employeeWizardHouseCodeTransfer = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\HouseCodeTransfer");
			me.employeeWizardNewHire = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\NewHire");
			me.employeeWizardReHire = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\ReHire");
			me.employeeWizardTermination = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\Termination");
			me.employeeWizardEditFMLALOA = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\FMLALOAStatusEditable");
			me.employeeWizardDateModification = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\DateModification");
			me.employeeWizardBasicLifeIndicator = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\BasicLifeIndicator");
			me.employeeWizardReverseTermination = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Wizard\\ReverseTermination");
			
			me.employeeSearchType = 'AccessDenied';
			if (me.employeeSearchSalaried) me.employeeSearchType = 'SearchSalaried';
			if (me.employeeSearchHourly) me.employeeSearchType = 'SearchHourly';
			if (me.employeeSearchFull) me.employeeSearchType = 'SearchFull';
			
			$("#pageHeader").html("Employee Search (" + me.employeeSearchType.replace("Search", "") + ")");
			
			if (me.employeeSearchType == 'AccessDenied') {
				$("#messageToUser").html("Access Denied");
				alert('Access Denied. Please contact your Administrator.');
				return false;
			}

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
				me.statusStore.fetch("userId:[user],", me.statusTypesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			if (me.employeeReadOnly) {
				$("#EmployeeButton").hide();
			}

			var contextMenuItems = '';
			
			if (me.employeeWizardNewHire) {
				me.actionMenu.addAction({
					id: "hireAction",
					brief: "New Hire",
					title: "Employee New Hire.",
					actionFunction: function() { me.actionWizardSelect("NewHire"); }
				});
				
				contextMenuItems += '<tr id="menuNewHire" height="20px"><td class="tdBorder">&nbsp;&nbsp;New Hire</td></tr>';
			}

			if (me.employeeWizardReHire) {
				me.actionMenu.addAction({
					id: "rehireAction",
					brief: "Rehire",
					title: "Employee Rehire.",
					actionFunction: function() { me.actionWizardSelect("Rehire"); }
				});
				
				contextMenuItems += '<tr id="menuRehire" height="20px"><td class="tdBorder">&nbsp;&nbsp;Rehire</td></tr>';
			}
			
			if (me.employeeWizardHouseCodeTransfer) {
				me.actionMenu.addAction({
					id: "housecodeTransferAction",
					brief: "House Code Transfer",
					title: "Employee House Code Transfer.",
					actionFunction: function() { me.actionWizardSelect("HouseCodeTransfer"); }
				});

				contextMenuItems += '<tr id="menuHouseCodeTransfer" height="20px"><td class="tdBorder">&nbsp;&nbsp;House Code Transfer</td></tr>';
			}
			
			if (me.employeeWizardTermination) {
				me.actionMenu.addAction({
					id: "terminationAction",
					brief: "Termination",
					title: "Employee Termination.",
					actionFunction: function() { me.actionWizardSelect("Termination"); }
				});

				contextMenuItems += '<tr id="menuTermination" height="20px"><td class="tdBorder">&nbsp;&nbsp;Termination</td></tr>';
			}
			
			if (me.employeeWizardEdit) {
				me.actionMenu.addAction({
					id: "EditAction",
					brief: "Edit",
					title: "Employee Edit.",
					actionFunction: function() { me.actionWizardSelect("Edit"); }
				});

				contextMenuItems += '<tr id="menuEdit" height="20px"><td class="tdBorder">&nbsp;&nbsp;Edit</td></tr>';
			}
			
			if (me.employeeWizardDateModification) {
				me.actionMenu.addAction({
					id: "dateModificationAction",
					brief: "Date Modification",
					title: "Employee Date Modification.",
					actionFunction: function() { me.actionWizardSelect("DateModification"); }
				});

				contextMenuItems += '<tr id="menuDateModification" height="20px"><td class="tdBorder">&nbsp;&nbsp;Date Modification</td></tr>';
			}
			
			if (me.employeeWizardBasicLifeIndicator) {
				me.actionMenu.addAction({
					id: "basicLifeIndicatorAction",
					brief: "Basic Life Indicator",
					title: "Employee Basic Life Indicator.",
					actionFunction: function() { me.actionWizardSelect("BasicLifeIndicator"); }
				});

				contextMenuItems += '<tr id="menuBasicLifeIndicator" height="20px"><td class="tdBorder">&nbsp;&nbsp;Basic Life Indicator</td></tr>';
			}
			
			if (me.employeeWizardReverseTermination) {
				me.actionMenu.addAction({
					id: "reverseTerminationAction",
					brief: "Reverse Termination",
					title: "Employee Reverse Termination.",
					actionFunction: function() { me.actionWizardSelect("ReverseTermination"); }
				});

				contextMenuItems += '<tr id="menuReverseTermination" height="20px"><td class="tdBorder">&nbsp;&nbsp;Reverse Termination</td></tr>';
			}
			
			if (contextMenuItems != "") {
				contextMenuItems = '<table id="EmployeeSearchContextMenu" class="tableBorder" cellpadding="0" cellspacing="0">'
					+ contextMenuItems
					+ '</table>';
				
				$("#EmployeeSearchContext").html(contextMenuItems);
				me.contextSetup();
			}
			
			if (me.employeeWizardEditOriginalDateRead) {
				$("#EmployeeOriginalHireDateText").attr('disabled', true);
				$("#EmployeeOriginalHireDateAction").removeClass("iiInputAction");				
			}
			
			if (me.employeeWizardEditSeniorityDateRead) {
				$("#EmployeeSeniorityDateText").attr('disabled', true);
				$("#EmployeeSeniorityDateAction").removeClass("iiInputAction");				
			}
			
			if ((!me.employeeWizardNewHire) && (!me.employeeWizardReHire) && (!me.employeeWizardHouseCodeTransfer) 
				&& (!me.employeeWizardTermination) && (!me.employeeWizardEdit) && (!me.employeeWizardDateModification)
				&& (!me.employeeWizardBasicLifeIndicator) && (!me.employeeWizardReverseTermination)) {
				$("#actionMenu").hide();
			}

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
		},	
		
		sessionLoaded: function fin_emp_employeeSearch_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			
			if (!fin.empSearchUi) return;
			
			fin.empSearchUi.searchInput.resizeText();
		    fin.empSearchUi.employeeSearch.setHeight($(window).height() - 155);
			
			$("#employeeGridLoading").css({
				"width": $("#EmployeeSearch").width() + 1,
				"height": $(window).height() - 126,
				"top":  $("#EmployeeSearch").offset().top,
				"left":  $("#EmployeeSearch").offset().left
			});
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			}); 
				
			me.anchorBack = new ui.ctl.buttons.Sizeable({
				id: "AnchorBack",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Back&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionBack(); },
				hasHotState: true
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancel(); },
				hasHotState: true
			});
			
			me.anchorNext = new ui.ctl.buttons.Sizeable({
				id: "AnchorNext",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPreNext(); },
				hasHotState: true
			});
			
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSave(); },
				hasHotState: true
			});

			me.searchInput = new ui.ctl.Input.Text({
				id: "SearchInput",
				maxLength: 50
			});

			me.filterType = new ui.ctl.Input.DropDown.Filtered({
				id: "FilterTypes",
				formatFunction: function( type ){ return type.name; },
				required: false
		    });

			me.filterTypes = [];
			me.filterTypes.push({id:0, number:0, name:'All'});
			me.filterTypes.push({id:1, number:1, name:'Brief'});
			me.filterTypes.push({id:2, number:2, name:'Employee Number'});
			me.filterTypes.push({id:3, number:3, name:'Name'});
			me.filterTypes.push({id:4, number:4, name:'SSN'});
			me.filterTypes.push({id:5, number:5, name:'User Name'});
			me.filterType.setData(me.filterTypes);
			me.filterType.select(0, me.filterType.focused);
							
			me.statusType = new ui.ctl.Input.DropDown.Filtered( {
				id: "StatusTypes", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });
				
			me.employeeButton = new ui.ctl.buttons.Sizeable({
				id: "EmployeeButton",
				className: "iiButton",
				text: "<span>&nbsp;New&nbsp;</span>",
				clickFunction: function() { me.loadNewUser(); },
				hasHotState: true
			});
			
			me.searchButton = new ui.ctl.buttons.Sizeable({
				id: "SearchButton",
				appendToId: "SearchButton",
				className: "iiButton",
				text: "<span>&nbsp;Search&nbsp;</span>",
				clickFunction: function() { me.loadSearchResults(); },
				hasHotState: true
			});

			me.anchorClose = new ui.ctl.buttons.Sizeable({
				id: "AnchorClose",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Close&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCloseItem(); },
				hasHotState: true
			});

			me.historyGrid = new ui.ctl.Grid({
				id: "HistoryGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.historyGrid.addColumn("fieldName", "fieldName", "Field Name", "Field Name", 200);
			me.historyGrid.addColumn("previousFieldValue", "previousFieldValue", "Previous Field Value", "Previous Field Value", null);
			me.historyGrid.addColumn("lastModifiedBy", "lastModifiedBy", "Last Modified By", "Last Modified By", 200);
			me.historyGrid.addColumn("lastModifiedAt", "lastModifiedAt", "Last Modified At", "Last Modified At", 160);
			me.historyGrid.capColumns();			
			
			me.employeeSearch = new ui.ctl.Grid({
				id: "EmployeeSearch",
				appendToId: "divForm",
				selectFunction: function( index ){ me.itemSelect(index); },
				allowAdds: false
			});
			
			me.employeeSearch.addColumn("firstName", "firstName", "First Name", "First Name", 150).setSortFunction(function(me, displayProperty, a, b) {
				return fin.empSearchUi.customSort(me, displayProperty, a, b);
			});
			me.employeeSearch.addColumn("lastName", "lastName", "Last Name", "Last Name", 150).setSortFunction(function(me, displayProperty, a, b) {
				return fin.empSearchUi.customSort(me, displayProperty, a, b);
			});
			me.employeeSearch.addColumn("brief", "brief", "Brief", "Brief", 150);
			me.employeeSearch.addColumn("houseCode", "houseCode", "House Code", "House Code", 100);
			me.employeeSearch.addColumn("houseCodeRM", "houseCodeRM", "Regional Manager", "Regional Manager", null);
			me.employeeSearch.addColumn("employeeNumber", "employeeNumber", "Employee #", "Employee #", 100);
			me.employeeSearch.addColumn("ssn", "ssn", "SSN", "SSN", 100);
			me.employeeSearch.capColumns();
			me.employeeSearch.setHeight($("#pageLoading").height() - 130);

			$("#SearchInputText").bind("keydown", me, me.actionSearchItem);
			$("#FilterTypesText").bind("keydown", me, me.actionSearchItem);
			$("#StatusTypesText").bind("keydown", me, me.actionSearchItem);
			$("#EmployeeSearch").bind("dblclick", me, me.employeeDetailsShow);
			
			me.employeeSSN = new ui.ctl.Input.Text({
		        id: "EmployeeSSN",					
				maxLength: 11
			});
			
			me.employeeSSN.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeSSN.getValue();
					
					if (enteredText == "") return;

					me.employeeSSN.text.value = fin.cmn.text.mask.ssn(enteredText);
					enteredText = me.employeeSSN.text.value;
										
					if (/^(?!000)^([0-8]\d{2})([ -]?)((?!00)\d{2})([ -]?)((?!0000)\d{4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Social Security Number. Example: 001-01-0001, 899-99-9999.");
			});
			
			$("#EmployeeSSNText").bind("keydown", me, me.actionPreNext);
			
			me.editWizardAction = new ui.ctl.Input.DropDown.Filtered({
				id: "EditWizardAction", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.editWizardChanged() },				
				required: false
		    });
			
			me.personFirstName = new ui.ctl.Input.Text({
				id: "FirstName",
				maxLength: 30,
				changeFunction: function() { me.employeeNameChanged = true; }
			});

			me.personFirstName.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.personMiddleName = new ui.ctl.Input.Text({
				id: "MiddleInitial",
				maxLength: 30,
				changeFunction: function() { me.employeeNameChanged = true; }
			});	
			
			me.personLastName = new ui.ctl.Input.Text({
				id: "LastName",
				maxLength: 30,
				changeFunction: function() { me.employeeNameChanged = true; }
			});

			me.personLastName.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.personAddressLine1 = new ui.ctl.Input.Text({
				id: "Address1",
				maxLength: 50
			});

			me.personAddressLine1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
			
			me.personAddressLine2 = new ui.ctl.Input.Text({
				id: "Address2",
				maxLength: 50
			});
			
			me.personAddressLine2.makeEnterTab()
				.setValidationMaster( me.validator )					
			
			me.personCity = new ui.ctl.Input.Text({
				id: "City",
				maxLength: 50
			});

			me.personCity.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.personState = new ui.ctl.Input.DropDown.Filtered({
		        id: "State",
				formatFunction: function( type ) { return type.name; },
	        	required: false
		    });
			
			me.personState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				
			me.personPostalCode = new ui.ctl.Input.Text({
				id: "PostalCode",
				maxLength: 10
			});
			
			me.personPostalCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.personPostalCode.getValue();
					
					if (enteredText == "") return;
	
					if (ui.cmn.text.validate.postalCode(enteredText) == false)
						this.setInvalid("Please enter valid postal code.");
				});			
			
			me.personEmail = new ui.ctl.Input.Text({
				id: "Email",
				maxLength: 30
			});
			
			me.personEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.personEmail.getValue();
					
					if (enteredText == "") return;
					
					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid email address.");
				});
			
			me.personHomePhone = new ui.ctl.Input.Text({
				id: "HomePhone",
				maxLength: 14
			});	
				
			me.personHomePhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.personHomePhone.getValue();

					if (enteredText == "") return;

					if (/^\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{4}$/.test(enteredText) == false)
						this.setInvalid("Please enter valid phone number.");

					me.personHomePhone.text.value = me.phoneMask(enteredText);
				});
			
			me.personFax = new ui.ctl.Input.Text({
				id: "Fax",
				maxLength: 14
			});	
			
			me.personFax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.personFax.getValue();

					if (enteredText == "") return;

					if (/^\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{4}$/.test(enteredText) == false)
						this.setInvalid("Please enter valid fax number.");

					me.personFax.text.value = me.phoneMask(enteredText);	
				});
			
			me.personPager = new ui.ctl.Input.Text({
				id: "Pager",
				maxLength: 14
			});	
			
			me.personPager.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.personPager.getValue();

					if (enteredText == "") return;

					if (/^\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{4}$/.test(enteredText) == false)
						this.setInvalid("Please enter valid pager number.");

					me.personPager.text.value = me.phoneMask(enteredText);
				});
			
			me.personCellPhone = new ui.ctl.Input.Text({
				id: "CellPhone",
				maxLength: 14
			});		
			
			me.personCellPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.personCellPhone.getValue();

					if (enteredText == "") return;
											
					if (/^\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{4}$/.test(enteredText) == false)
						this.setInvalid("Please enter valid cell number.");

					me.personCellPhone.text.value = me.phoneMask(enteredText);
				});		
			
			me.employeeNumber = new ui.ctl.Input.Text({
		        id: "EmployeeNumber",
		        maxLength: 6,
				changeFunction: function() { me.employeeNumberChanged = true;} //happens only for HC Transfer.
		    });

			 me.employeeNumber.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function (isFinal, dataMap) {

			        if (/^\d{6}$/.test(me.employeeNumber.getValue()) == false)
			            this.setInvalid("Please enter valid Employee Number.");
				   
				});
			
			me.employeePayrollCompany = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeePayrollCompany", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(index) {
					me.employeeNumberChange();						
					me.payFrequencyChanged();
					fin.empSearchUi.actionPerPayPeriodReset();
					if (me.actionType == "NewHire") {
						me.validateEmployeeDetails(); //introduced to get PayPeriod for selected Company payFrequency.
					}
				},
				required: false
	    	});

			me.employeePayrollCompany.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeePayrollCompany.indexSelected == -1)
						this.setInvalid("Please select Ceridian Company.");
			});	

			me.employeeStatusType = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeGeneralStatusType", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.actionEmployeeStatusChanged(); },
				required: false
	    	});
			
			me.employeeStatusType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeStatusType.indexSelected == -1) {
						this.setInvalid("Please select Status type.");
						return;
					}
					
					if (me.employeeStatusType.text.value != "Terminated") {
						fin.empSearchUi.employeeTerminationDate.text.value = "";
						fin.empSearchUi.employeeTerminationReason.select(0, fin.empSearchUi.employeeTerminationReason.focused);
					}					
				});
			
			me.employeeStatusCategoryType = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeStatusCategoryType", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.employeeEffectiveDateChanged(); },
				required: false
	    	});
			
			me.employeeStatusCategoryType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeStatusCategoryType.indexSelected == -1) {
						this.setInvalid("Please select Status Category.");
						return;
					}				
				});				
					
			me.employeeHireDate = new ui.ctl.Input.Date({ 
				id: "EmployeeHireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.employeeEffectiveDateChanged(); }
			});
			
			me.employeeHireDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeHireDate.text.value;
					
					if (enteredText == "") return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}
					
					if (me.actionType == "DateModification") 
						return true;
					
					//see if employee is hired or terminated.
					if (me.payPeriodStartDate != "" && (me.isEmployeeNewhired() || me.isEmployeeRehired())) {
						if (me.isDateValid(enteredText, "Hire") == false) {
							this.setInvalid("Please enter valid date which is in range of current Pay Period and not a future date.");
							return false;
						}
					}

					if (me.employeeOriginalHireDate.text.value == "" || me.actionType == "NewHire") {
						me.employeeOriginalHireDate.setValue(me.employeeHireDate.text.value + "");
					}

					if (me.actionType == "NewHire") {
						me.employeeEffectiveDate.setValue(me.currentDate() + "");
						
						$("#EmployeeEffectiveDateText").attr('disabled', true);
						$("#EmployeeEffectiveDateAction").removeClass("iiInputAction");
					}
					else if (me.employeeEffectiveDate.text.value == "") {
						me.employeeEffectiveDate.setValue(me.employeeHireDate.text.value + "");

						$("#EmployeeEffectiveDateText").attr('disabled', false);
						$("#EmployeeEffectiveDateAction").addClass("iiInputAction");
					}
							
					me.setSeniorityDate();
					
					//if terminated employee is rehired then set effective dates as per hirDate.
					if (me.employeeGeneralId > 0) {
						if (me.employeeStatusType.text.value.toLowerCase() == "active" &&
							me.employeeGenerals[0].terminationDate.toString() != "") {
							me.jobEffectiveDate.setValue(me.employeeHireDate.text.value);
							me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value);
						}
					}						
				});
			
			me.employeeOriginalHireDate = new ui.ctl.Input.Date({ 
				id: "EmployeeOriginalHireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			
			me.employeeOriginalHireDate.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.employeeSeniorityDate = new ui.ctl.Input.Date({ 
				id: "EmployeeSeniorityDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			
			me.employeeSeniorityDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeSeniorityDate.text.value;

					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}

					if (me.actionType == "DateModification") 
						return true;

					var seniorityDate = new Date(me.employeeSeniorityDate.text.value);
					var hireDate = new Date(me.employeeHireDate.text.value);

					if (seniorityDate > hireDate) {
						this.setInvalid("Please enter valid date. Seniority Date should be less than or equal to Current Hire Date.");
					}
				});

			me.employeeEffectiveDate = new ui.ctl.Input.Date({ 
				id: "EmployeeEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.employeeEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeEffectiveDate.text.value;
					
					if (enteredText == "") {
						if (me.employeeHireDate.text.value != "")
							me.employeeEffectiveDate.setValue(me.employeeHireDate.text.value + "");
						return;
					}
					
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}

					if (me.actionType == "DateModification") 
						return true;

					var hireDate = new Date(me.employeeHireDate.text.value);
					var effectiveDate = new Date(me.employeeEffectiveDate.text.value);

					if (me.employeeEffectiveDate.text.value != "") {
						if (effectiveDate < hireDate)
							this.setInvalid("The Effective Date cannot be before the most recent hire date.");
					}

					//see if employee is hired or terminated.
					if (me.payPeriodStartDate != "" && (me.isEmployeeNewhired() || me.isEmployeeRehired())) {
						if (me.isDateValid(enteredText, 'Effective') == false) {
							this.setInvalid("Please enter valid date which is in range of current pay Period.");
							return false;
						}
					}
				});
			
			me.termEmployeeEffectiveDate = new ui.ctl.Input.Date({ 
				id: "TermEmployeeEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			
			me.termEmployeeEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.employeeTerminationDate = new ui.ctl.Input.Date({ 
				id: "EmployeeTerminationDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.effectiveDateChange(); }
			});
			
			me.employeeTerminationDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var message = "";
					var valid = true;
					var enteredText = me.employeeTerminationDate.text.value;
					
					if (enteredText == "" && me.employeeStatusType.text.value == "Terminated") {
						valid = false;
						message = "Please enter valid date.";
					}
	
					if (enteredText == "") return;
									
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						valid = false;
						message = "Please enter valid date.";
					}
					
					var terminationDate;
					var hireDate = new Date(me.employeeHireDateValue);
					var currentDate = new Date(parent.fin.appUI.glbCurrentDate);
					
					if (me.employeeTerminationDate.text.value != "") {
						
						terminationDate = new Date(me.employeeTerminationDate.text.value);
						me.employeeEffectiveDate.text.value = me.employeeTerminationDate.text.value;
								
						me.employeeEffectiveDate.setValue(me.employeeTerminationDate.text.value);
						me.termEmployeeEffectiveDate.setValue(me.employeeTerminationDate.text.value);
						
						if (me.compareDate(me.employeeHireDate.text.value, me.payPeriodStartDate) >= 0 
							&& me.compareDate(me.employeeHireDate.text.value, me.payPeriodEndDate) <= 0
							&& me.employeeGeneralId > 0 && me.alertMassage == 0) {
							alert("You cannot terminate an employee in the same pay period the employee was hired. \n" 
								+ "Contact the Corporate Payroll department for further instructions."); 
								
							me.alertMessage = me.alertMessage + 1;								
						}
	
						if (terminationDate > currentDate) {
							valid = false;
							message = "Termination cannot be future dated.";
						}
	
						if (terminationDate <= hireDate) {
							valid = false;
							message = "Termination Date cannot be less than or equal to the Date of Currrent Hire.";
						}
					}
	
					if (!valid) {
						this.setInvalid(message);
					}		
				}); 
			
			me.employeeTerminationReason = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeTerminationReason",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.actionEmployeeTerminationChanged(); },
				required: false					
			});
			
			me.employeeTerminationReason.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if (me.employeeTerminationReason.indexSelected > 0 && me.employeeStatusType.text.value != "Terminated")
						this.setInvalid("Please unselect Termination Reason.");
					else if(me.employeeTerminationReason.indexSelected <= 0 && me.employeeStatusType.text.value == "Terminated")
						this.setInvalid("Please select Termination Reason.");
					else
						return;
				});
				
			me.separationCode = new ui.ctl.Input.DropDown.Filtered({
				id: "SeparationCode",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.employeeEffectiveDateChanged(); },
				required: false
		    });
			
			me.separationCode.makeEnterTab()
				.setValidationMaster( me.validator );
		
			me.employeeBirthDate = new ui.ctl.Input.Date({ 
				id: "EmployeeBirthDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});

			me.employeeBirthDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {					

					var enteredText = me.employeeBirthDate.text.value;

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$"))) {
						this.setInvalid("Please enter valid date.");
						return;
					}

					var today = new Date(parent.fin.appUI.glbCurrentDate);
					var birthDate = new Date(enteredText);
					var millisecondsPerYear = 1000 * 60 * 60 * 24 * 365.26;

					if (((today - birthDate) / millisecondsPerYear) < 18)
						this.setInvalid("Please enter valid date. Employee is not eligible to hire.");
				});

			me.employeeEthnicity = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeEthnicity", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });

			me.employeeEthnicity.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.employeeEthnicity.indexSelected == -1)
						this.setInvalid("Please select Ethnicity type.");
				});
			
			me.employeeMaritalStatus = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeMaritalStatus",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeMaritalStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeMaritalStatus.getValue();

					if (enteredText == "") return;
				
					if (me.employeeMaritalStatus.indexSelected == -1)
						this.setInvalid("Please select Marital Status.");
				});
			
			me.employeeI9Status = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeI9Status", 
				formatFunction: function( type ) { return type.name; },				
				required: false
		    });	
			
			me.employeeVETSStatus = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeVETSStatus", 
				formatFunction: function( type ) { return type.name; },
				required: false
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

					if (enteredText == "") {
						if (me.employeeHireDate.text.value != "")
							me.jobEffectiveDate.setValue(me.employeeHireDate.text.value + "");
						return;
					}
					
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}

					if (me.actionType == "DateModification") 
						return true;

					var hireDate = new Date(me.employeeHireDate.text.value);
					var jobEffectiveDate = new Date(me.jobEffectiveDate.text.value);
					
					if (me.jobEffectiveDate.text.value != "") {
						if (jobEffectiveDate < hireDate)
							this.setInvalid("The Job Effective Date cannot be before the most recent hire date.");
					}
				});
					
			me.jobChangeReason = new ui.ctl.Input.DropDown.Filtered({
				id: "JobChangeReason",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.jobChangeReasonChanged(); },
				required: false
		    });
			
			me.jobChangeReason.makeEnterTab()
				.setValidationMaster( me.validator )
			
			me.employeeJobCode = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeJobCode",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function(){ me.actionEmployeeJobCodeChanged(); },
				required: false 
		    });
			
			me.employeeJobCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeJobCode.indexSelected == -1)
						this.setInvalid("Please select Job Code.");
				});
			
			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "DefaultHouseCodeJob",
				formatFunction: function(type) { return type.jobNumber + " - " + type.jobTitle; },
				changeFunction: function() { me.jobChanged(); },
				required: false
			});
			
			me.job.makeEnterTab()
				.setValidationMaster( me.validator )
			
			me.employeeBackgroundCheckDate = new ui.ctl.Input.Date({ 
				id: "EmployeeBackgroundCheckDate",
				formatFunction: function(type){ return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			
			me.employeeBackgroundCheckDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeBackgroundCheckDate.text.value;
					
					if (enteredText == "") return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");					
				});
			
			me.employeeUnionStatus = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeUnionStatus",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeUnionStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					if ($("input[name='Union']:checked").val() == "true" && me.employeeUnionStatus.indexSelected <= 0 && me.wizardCount > 1)
						this.setInvalid("Please select Employee Union Status.");													
				});	
			
			me.employeeUnion = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeUnion",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeUnion.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					if ($("input[name='Union']:checked").val() == "true" && me.employeeUnion.indexSelected <= 0 && me.wizardCount > 1)
						this.setInvalid("Please select Employee Union.");													
				});				
			
			me.compensationEffectiveDate = new ui.ctl.Input.Date({ 
				id: "CompensationEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy");}
			});

			me.compensationEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.compensationEffectiveDate.text.value;
					
					if (enteredText == "") {
						if (me.employeeHireDate.text.value != "")
							me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value + "");
						return;
					}
					
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}

					if (me.actionType == "DateModification") 
						return true;

					var hireDate = new Date(me.employeeHireDate.text.value);
					var compensationEffectiveDate = new Date(me.compensationEffectiveDate.text.value);
					
					if (me.compensationEffectiveDate.text.value != "") {
						if (compensationEffectiveDate < hireDate)
							this.setInvalid("The Compensation Effective Date cannot be before the most recent hire date.");
					}
				});			

			me.employeeRateChangeReason = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeRateChangeReason", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });	

			me.employeePayRate = new ui.ctl.Input.Text({
		        id: "EmployeePayRate",
				changeFunction: function() { me.payRateChanged(); },
		        maxLength: 8
		    });
			
			me.employeePayRate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeePayRate.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false)
						this.setInvalid("Please enter numeric data. Expected number format is 99.99");
					else {
						fin.empSearchUi.actionPerPayPeriodReset();
						
						if ((me.actionType == "NewHire" || me.actionType == "Rehire")) {
							if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined) {
								if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly) {
									if (enteredText > 99.99) {
										this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
									}
								}
							}
						}
						
						if (me.actionType == "Compensation") {
							if (me.employeeGenerals[0] != undefined) {
								if (me.employeeGenerals[0].hourly) {
									if (enteredText > 99.99) {
										this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
									}
								}
							}
						}
						
						if (me.houseCodePayrollCompanys && me.employeePayrollCompany.indexSelected > -1) {
							if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected]) {
								if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly) {
									if (me.houseCodeStateMinimumWage > 0 && parseFloat(enteredText) < me.houseCodeStateMinimumWage) {
										this.setInvalid("Please enter valid Hourly Pay Rate. Minimum Wage for the House Code State is: " + me.houseCodeStateMinimumWage);
									}
								}
							}
						}
					}
				});		
			
			me.employeeScheduledHours = new ui.ctl.Input.Text({
		        id: "EmployeeScheduledHours",
				changeFunction: function() { me.scheduledHoursChanged(); },
		        maxLength: 3
		    });
			
			me.employeeScheduledHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeScheduledHours.getValue();
					var index = me.employeePayrollCompany.indexSelected;

					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.generic(enteredText, "^\\d+$") == false) {
						me.setScheduledHoursWarning(false);
						this.setInvalid("Please enter valid Scheduled hours.");
						return;
					}
					
					if (me.houseCodePayrollCompanys.length > 0 && index >= 0) {
						if (me.houseCodePayrollCompanys[index].payFrequencyType == "Weekly") {
							if (enteredText > 40) {
								me.setScheduledHoursWarning(false);
								this.setInvalid("Schedule Hours should not be greater than 40 hours for the Weekly Pay Frequency.");
								return;
							}
						}
						else if (me.houseCodePayrollCompanys[index].payFrequencyType == "Bi-Weekly") {
							if (enteredText > 80) {
								me.setScheduledHoursWarning(false);
								this.setInvalid("Schedule Hours should not be greater than 80 hours for the Bi-Weekly Pay Frequency.");
								return;
							}
						}

						var scheduledHours = parseFloat(enteredText);

						if (me.houseCodePayrollCompanys[index].payFrequencyType == "Bi-Weekly") 
							scheduledHours = scheduledHours / 2;

						if (scheduledHours >= 30)
							me.setDropListSelectedValueByTitle("employeeStatusCategory", "Full Time");
						else
							me.setDropListSelectedValueByTitle("employeeStatusCategory", "Part Time");
					}

					if (parseInt(enteredText) < (30 * fin.empSearchUi.payPeriodWeeks)) {
						if (me.isPageLoaded == true) { //validation for multiple popup	
							var message = "Warning: Individual will work less than 30 hours a week and therefore not eligible for full-time benefits. " 
								+ "The employee will be categorized as PART-TIME due to hours per week being less than 30. "
								+ "Minimum eligible hours: " + (30 * fin.empSearchUi.payPeriodWeeks);
							me.setScheduledHoursWarning(true, message);
							return;
						}
					}
					else {
						fin.empSearchUi.actionPerPayPeriodReset();
						me.setScheduledHoursWarning(false, "");
					}					
				});
			
			me.employeeReviewDate = new ui.ctl.Input.Date({ 
				id: "EmployeeReviewDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			
			me.employeeReviewDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeReviewDate.text.value;
					
					if (enteredText == "") return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
			});		
			
			me.employeeWorkShift = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeWorkShift",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeWorkShift.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.employeeAlternatePayRateA = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateA",
				changeFunction: function() { me.alternatePayRateChanged(); },
		        maxLength: 9
		    });
			
			me.employeeAlternatePayRateA.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateA.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false)
						this.setInvalid("Please enter numeric data. Expected number format is 99.99");
					else {
						if ((me.actionType == "NewHire" || me.actionType == "Rehire") 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
			
						if (me.actionType == "Compensation" && me.employeeGenerals[0] != undefined
							&& me.employeeGenerals[0].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
					}
				});	
			
			me.employeeAlternatePayRateB = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateB",
				changeFunction: function() { me.alternatePayRateChanged(); },
		        maxLength: 9
		    });
			
			me.employeeAlternatePayRateB.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateB.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false)
						this.setInvalid("Please enter numeric data. Expected number format is 99.99");
					else {
						if ((me.actionType == "NewHire" || me.actionType == "Rehire") 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
			
						if (me.actionType == "Compensation" && me.employeeGenerals[0] != undefined
							&& me.employeeGenerals[0].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
					}
				});	
			
			me.employeeAlternatePayRateC = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateC",
				changeFunction: function() { me.alternatePayRateChanged(); },
		        maxLength: 9
		    });
			
			me.employeeAlternatePayRateC.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateC.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false)
						this.setInvalid("Please enter numeric data. Expected number format is 99.99");
					else {
						if ((me.actionType == "NewHire" || me.actionType == "Rehire") 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
			
						if (me.actionType == "Compensation" && me.employeeGenerals[0] != undefined
							&& me.employeeGenerals[0].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
					}
				});
			
			me.employeeAlternatePayRateD = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateD",
				changeFunction: function() { me.alternatePayRateChanged(); },
		        maxLength: 9
		    });
			
			me.employeeAlternatePayRateD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateD.getValue();
					
					if (enteredText == "") return;

					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false)
						this.setInvalid("Please enter numeric data. Expected number format is 99.99");
					else {
						if ((me.actionType == "NewHire" || me.actionType == "Rehire") 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined 
							&& me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
			
						if (me.actionType == "Compensation" && me.employeeGenerals[0] != undefined
							&& me.employeeGenerals[0].hourly && enteredText > 99.99) {
							this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
						}
					}
				});
			
			me.employeeDeviceGroup = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeDeviceGroup",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeDeviceGroup.makeEnterTab()
				.setValidationMaster( me.validator )
				
			me.federalExemptions = new ui.ctl.Input.Text({
		        id: "EmployeeFedExemptions",
		        maxLength: 16
		    });
			
			me.federalExemptions.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.federalExemptions.getValue();

					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
			});
		
			me.maritalStatusFederalTaxType = new ui.ctl.Input.DropDown.Filtered({
				id: "MaritalStatusFederalTaxType", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });
			
			me.maritalStatusFederalTaxType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );
				
			me.federalAdjustmentType = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeFederalAdjustment", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });
			
			me.federalAdjustmentType.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.federalAdjustmentAmount = new ui.ctl.Input.Text({
		        id: "EmployeeFedAdjustmentAmount",
		        maxLength: 4,
				required: false
		    });
			
			me.federalAdjustmentAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.federalAdjustmentAmount.getValue();
					
					if (enteredText == "" || me.federalAdjustmentType.indexSelected <= 0) return;

					if (me.federalAdjustmentType.text.value == "Fixed Amt" || me.federalAdjustmentType.text.value == "Increased Amt") {
						if (/^\d{1,4}$/.test(enteredText) == false)
							this.setInvalid("Please enter valid amount. Example 9999");
					}
					else if ((/^\d{1,2}(\.\d\d)?$/.test(enteredText) == false) && (/^\d{1,2}(\.\d)?$/.test(enteredText) == false))
						this.setInvalid("Please enter valid amount. Example 99.9");
				});			
			
			me.primaryTaxState = new ui.ctl.Input.DropDown.Filtered({
				id: "PrimaryTaxState",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function() { me.primaryTaxStateSelect(); },
				required: false
		    });
			
			me.primaryTaxState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.primaryTaxState.indexSelected == -1)
						this.setInvalid("Please select Primary Tax State.");
				});
			
			me.maritalStatusStateTaxTypePrimary = new ui.ctl.Input.DropDown.Filtered({
				id: "MaritalStatusStateTaxTypePrimary", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });
				
			me.maritalStatusStateTaxTypePrimary.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
				if (me.maritalStatusStateTaxTypePrimary.indexSelected == -1)
					this.setInvalid("Please select Marital Status.");
			});
			
			me.secTaxState = new ui.ctl.Input.DropDown.Filtered({
				id: "SecondaryTaxState",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function() { me.secMaritalStatusSelect(); },
				required: false
		    });
			
			me.secTaxState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.localTaxCode2.indexSelected > 0) {
				        if (me.secTaxState.indexSelected == -1)
						this.setInvalid("Please select Secondary Tax State.");
				    }
				    else
				        this.valid = true;
				});
				
			me.maritalStatusStateTaxTypeSecondary = new ui.ctl.Input.DropDown.Filtered({
				id: "MaritalStatusStateTaxTypeSecondary", 
				formatFunction: function( type ) { return type.name; },
				required: false
		    });
			
			me.maritalStatusStateTaxTypeSecondary.makeEnterTab()
				.setValidationMaster( me.validator );			
			
			me.stateExemptions = new ui.ctl.Input.Text({
		        id: "EmployeeStateExemptions" ,
		        maxLength: 16,
				required: false
		    });
			
			me.stateExemptions.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.stateExemptions.getValue();

					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
			
			me.employeeStateAdjustmentType = new ui.ctl.Input.DropDown.Filtered({
				id: "StateAdjustmentType",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.employeeStateAdjustmentType.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.stateAdjustmentAmount = new ui.ctl.Input.Text({
		        id: "EmployeeStateAdjustmentAmount",
		        maxLength: 4,
				required: false
		    });
			
			me.stateAdjustmentAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.stateAdjustmentAmount.getValue();

					if (enteredText == "" || me.employeeStateAdjustmentType.indexSelected <= 0) return;

					if (me.employeeStateAdjustmentType.text.value == "Fixed Amt" 
						|| me.employeeStateAdjustmentType.text.value == "Increased Amt"
						|| me.employeeStateAdjustmentType.text.value == "Decreased Fixed Amt"
						|| me.employeeStateAdjustmentType.text.value == "NonRes") {
						if (/^\d{1,4}$/.test(enteredText) == false) {
							this.setInvalid("Please enter valid amount. Example 9999");
						}
					}
					else if ((/^\d{1,2}(\.\d\d)?$/.test(enteredText) == false) && (/^\d{1,2}(\.\d)?$/.test(enteredText) == false))
						this.setInvalid("Please enter valid amount. Example 99.9");
				});	
			
			me.stateSDIAdjustType = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeStateSDIAdjust",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			
			me.stateSDIAdjustType.makeEnterTab()
				.setValidationMaster( me.validator );

			me.stateSDIAdjustRate = new ui.ctl.Input.Text({
		        id: "EmployeeStateSDIAdjustRate",
		        maxLength: 16,
				required: false
		    });
			
			me.stateSDIAdjustRate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.stateSDIAdjustRate.getValue();

					if (enteredText == "") return;

					else if((/^\d+(\.\d\d)?$/.test(enteredText) == false) && (/^\d+(\.\d)?$/.test(enteredText) == false))
						this.setInvalid("Please enter valid number.");
				});			
			
			me.localTaxAdjustmentType = new ui.ctl.Input.DropDown.Filtered({
		        id: "EmployeeLocalTaxAdjustmentType",
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });
			
			me.localTaxAdjustmentType.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.localTaxAdjustmentAmount = new ui.ctl.Input.Text({
		        id: "EmployeeLocalTaxAdjustmentAmount",
		        maxLength: 9,
				required: false
		    });
			
			me.localTaxAdjustmentAmount.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.localTaxCode1 = new ui.ctl.Input.DropDown.Filtered({
		        id: "LocalTaxCode1",
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });
			
			me.localTaxCode1.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.localTaxCode2 = new ui.ctl.Input.DropDown.Filtered({
		        id: "LocalTaxCode2",
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });
			
			me.localTaxCode2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					if (me.actionType == "Local Tax") {
						if (me.localTaxCode2.indexSelected > 0) {
					        if (me.secTaxState.indexSelected == -1) {
								$("#AnchorNext").show();
								$("#AnchorSave").hide();
							}
					    }
					    else {
							$("#AnchorNext").hide();
							$("#AnchorSave").show();
						}
					}
				});
			
			me.localTaxCode3 = new ui.ctl.Input.DropDown.Filtered({
		        id: "LocalTaxCode3",
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });

			me.localTaxCode3.makeEnterTab()
				.setValidationMaster( me.validator );
				
			me.basicLifeIndicatorType = new ui.ctl.Input.DropDown.Filtered({
		        id: "BasicLifeIndicatorType",
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });

			me.setTabIndexes();		
		},		
		
		setScheduledHoursWarning: function(){
			var args = ii.args(arguments, {
				inValid: {type: Boolean},
				message: {type: String, required: false, defaultValue: ""}
			});			
			var me = this;

			if (args.inValid) {
				fin.empSearchUi.employeeScheduledHours.text.title = args.message;
				$("#EmployeeScheduledHoursText").css('background-color', 'yellow'); 
			}
			else {
				fin.empSearchUi.employeeScheduledHours.text.title = '';
				$("#EmployeeScheduledHoursText").css('background-color', 'white'); 
			}						
		},
		
		setTabIndexes: function() {
			var me = this;

			//me.searchInput.text.tabIndex = 81;
			//me.statusType.text.tabIndex = 82;
			//$('#houseCodeText').attr('tabindex', "83");
			
			me.employeeSSN.text.tabIndex = 100;
			me.editWizardAction.text.tabIndex = 101;
			//Personal1
			me.personFirstName.text.tabIndex = 110;
			me.personMiddleName.text.tabIndex = 111; 
			me.personLastName.text.tabIndex = 112;
			//Personal2
			me.personAddressLine1.text.tabIndex = 120; 
			me.personAddressLine2.text.tabIndex = 121; 
			me.personCity.text.tabIndex = 122; 
			me.personState.text.tabIndex = 123; 
			me.personPostalCode.text.tabIndex = 124; 
			//Personal3
			me.personEmail.text.tabIndex = 130; 
			me.personHomePhone.text.tabIndex = 131; 
			me.personFax.text.tabIndex = 132; 
			me.personPager.text.tabIndex = 133;
			me.personCellPhone.text.tabIndex = 134; 
			//General1
			me.employeeNumber.text.tabIndex = 200; 
			$("#houseCodeTemplateText").attr("tabindex", "201");
			me.employeePayrollCompany.text.tabIndex = 202; 
			//CrothallEmployeeYes - 203 //defined in markup.htm
			//CrothallEmployeeYes - 204
			me.employeeStatusType.text.tabIndex = 205; 
			me.employeeStatusCategoryType.text.tabIndex = 206; 
			me.employeeHireDate.text.tabIndex = 207; 
			me.employeeOriginalHireDate.text.tabIndex = 208; 
			me.employeeSeniorityDate.text.tabIndex = 209; 
			me.employeeEffectiveDate.text.tabIndex = 210; 
			//Termination			
			me.employeeTerminationDate.text.tabIndex = 220; 
			me.employeeTerminationReason.text.tabIndex = 221;
			me.separationCode.text.tabIndex = 222;
			me.termEmployeeEffectiveDate.text.tabIndex = 223; 	
			//General2		 
			me.employeeBirthDate.text.tabIndex = 230; 
			me.employeeEthnicity.text.tabIndex = 231; 
			//GenderYes - 232
			//GenderYes - 233
			me.employeeMaritalStatus.text.tabIndex = 234; 
			me.employeeI9Status.text.tabIndex = 235; 
			me.employeeVETSStatus.text.tabIndex = 236;
			//Job
			me.jobEffectiveDate.text.tabIndex = 300; 
			me.jobChangeReason.text.tabIndex = 301; 
			me.employeeJobCode.text.tabIndex = 302; 
			me.job.text.tabIndex = 303; 
			//UnionYes - 304
			//UnionYes - 305
			//ExemptYes - 306
			//ExemptYes - 307
			me.employeeBackgroundCheckDate.text.tabIndex = 308; 
			me.employeeUnion.text.tabIndex = 309; 
			me.employeeUnionStatus.text.tabIndex = 310;
			//Compensation
			me.compensationEffectiveDate.text.tabIndex = 400; 
			me.employeeRateChangeReason.text.tabIndex = 401; 
			me.employeePayRate.text.tabIndex = 402; 
			me.employeeScheduledHours.text.tabIndex = 403; 
			me.employeeReviewDate.text.tabIndex = 404; 
			me.employeeWorkShift.text.tabIndex = 405; 
			me.employeeAlternatePayRateA.text.tabIndex = 406; 
			me.employeeAlternatePayRateB.text.tabIndex = 407;
			me.employeeAlternatePayRateC.text.tabIndex = 408;
			me.employeeAlternatePayRateD.text.tabIndex = 409;
			me.employeeDeviceGroup.text.tabIndex = 410; 
			//Federal Tax
			me.federalExemptions.text.tabIndex = 500; 
			me.maritalStatusFederalTaxType.text.tabIndex = 501; 
			me.federalAdjustmentType.text.tabIndex = 502; 
			me.federalAdjustmentAmount.text.tabIndex = 503; 
			//State Tax
			me.primaryTaxState.text.tabIndex = 510; 
			me.maritalStatusStateTaxTypePrimary.text.tabIndex = 511; 
			me.secTaxState.text.tabIndex = 512; 
			me.maritalStatusStateTaxTypeSecondary.text.tabIndex = 513; 
			me.stateExemptions.text.tabIndex = 514; 
			me.stateAdjustmentAmount.text.tabIndex = 515; 
			me.employeeStateAdjustmentType.text.tabIndex = 516; 			
			me.stateSDIAdjustType.text.tabIndex = 517; 
			me.stateSDIAdjustRate.text.tabIndex = 518;
			//Local Tax 
			me.localTaxAdjustmentType.text.tabIndex = 540; 
			me.localTaxAdjustmentAmount.text.tabIndex = 541; 
			me.localTaxCode1.text.tabIndex = 542; 
			me.localTaxCode2.text.tabIndex = 543;
			me.localTaxCode3.text.tabIndex = 544;
			//Basic Life Indicator
			me.basicLifeIndicatorType.text.tabIndex = 600;
		},		
		
		resizeControls: function() {
			var me = this;

			me.searchInput.resizeText();
			me.statusType.resizeText();
			me.employeeSSN.resizeText();

			me.personFirstName.resizeText();
			me.personMiddleName.resizeText();
			me.personLastName.resizeText();
			me.personAddressLine1.resizeText();
			me.personAddressLine2.resizeText();
			me.personCity.resizeText();
			me.personState.resizeText();
			me.personPostalCode.resizeText();

			me.personEmail.resizeText();
			me.personHomePhone.resizeText();
			me.personFax.resizeText();
			me.personPager.resizeText();
			me.personCellPhone.resizeText();

			me.employeeNumber.resizeText();
			me.employeePayrollCompany.resizeText();
			me.employeeStatusType.resizeText();
			me.employeeStatusCategoryType.resizeText();
			me.employeeHireDate.resizeText();
			me.employeeOriginalHireDate.resizeText();
			me.employeeSeniorityDate.resizeText();
			me.employeeEffectiveDate.resizeText();

			me.employeeBirthDate.resizeText();
			me.employeeEthnicity.resizeText();
			me.employeeMaritalStatus.resizeText();
			me.employeeI9Status.resizeText();
			me.employeeVETSStatus.resizeText();

			me.employeeTerminationDate.resizeText();
			me.employeeTerminationReason.resizeText();
			me.separationCode.resizeText();
			me.termEmployeeEffectiveDate.resizeText();

			me.jobEffectiveDate.resizeText();
			me.jobChangeReason.resizeText();
			me.employeeJobCode.resizeText();
			me.job.resizeText();
			me.employeeBackgroundCheckDate.resizeText();
			me.employeeUnion.resizeText();
			me.employeeUnionStatus.resizeText();

			me.compensationEffectiveDate.resizeText();
			me.employeeRateChangeReason.resizeText();
			me.employeePayRate.resizeText();
			me.employeeScheduledHours.resizeText();
			me.employeeReviewDate.resizeText();
			me.employeeWorkShift.resizeText();
			me.employeeAlternatePayRateA.resizeText();
			me.employeeAlternatePayRateB.resizeText();
			me.employeeAlternatePayRateC.resizeText();
			me.employeeAlternatePayRateD.resizeText();
			me.employeeDeviceGroup.resizeText();

			me.federalExemptions.resizeText();
			me.maritalStatusFederalTaxType.resizeText();
			me.federalAdjustmentType.resizeText();
			me.federalAdjustmentAmount.resizeText();

			me.primaryTaxState.resizeText();
			me.maritalStatusStateTaxTypePrimary.resizeText();
			me.secTaxState.resizeText();
			me.maritalStatusStateTaxTypeSecondary.resizeText();
			me.stateExemptions.resizeText();
			me.employeeStateAdjustmentType.resizeText();
			me.stateAdjustmentAmount.resizeText();
			me.stateSDIAdjustType.resizeText();
			me.stateSDIAdjustRate.resizeText();

			me.localTaxAdjustmentType.resizeText();
			me.localTaxAdjustmentAmount.resizeText();
			me.localTaxCode1.resizeText();
			me.localTaxCode2.resizeText();
			me.localTaxCode3.resizeText();

			me.basicLifeIndicatorType.resizeText();
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
			
			me.employeeStore = me.cache.register({
				storeId: "employeeSearchs",
				itemConstructor: fin.emp.EmployeeSearch,
				itemConstructorArgs: fin.emp.employeeSearchArgs,
				injectionArray: me.employees
			});	
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.emp.HouseCode,
				itemConstructorArgs: fin.emp.houseCodeArgs,
				injectionArray: me.houseCodes
			});		
			
			me.houseCodeStateMinimumWages = [];
			me.houseCodeStateMinimumWageStore = me.cache.register({
				storeId: "houseCodeStateMinimumWages",
				itemConstructor: fin.emp.HouseCodeStateMinimumWage,
				itemConstructorArgs: fin.emp.houseCodeStateMinimumWageArgs,
				injectionArray: me.houseCodeStateMinimumWages
			});		
			
			me.statusTypes = [];
			me.statusStore = me.cache.register({
				storeId: "statusTypes",
				itemConstructor: fin.emp.StatusType,
				itemConstructorArgs: fin.emp.statusTypeArgs,
				injectionArray: me.statusTypes
			});		
			
			me.employeeValidations = [];
			me.employeeValidationStore = me.cache.register({
				storeId: "employeeValidations",
				itemConstructor: fin.emp.EmployeeValidation,
				itemConstructorArgs: fin.emp.employeeValidationArgs,
				injectionArray: me.employeeValidations	
			});
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
			
			
			me.employeeGeneralMasters = [];
			me.employeeGeneralMasterStore = me.cache.register({
				storeId: "employeeGeneralMasters",
				itemConstructor: fin.emp.EmployeeGeneralMaster,
				itemConstructorArgs: fin.emp.employeeGeneralMasterArgs,
				injectionArray: me.employeeGeneralMasters	
			});
		
			me.federalAdjustments = [];
			me.federalAdjustmentStore = me.cache.register({
				storeId: "employeePayrollMasters",
				itemConstructor: fin.emp.FederalAdjustment,
				itemConstructorArgs: fin.emp.federalAdjustmentArgs,
				injectionArray: me.federalAdjustments	
			});	
			
			me.maritalStatusFederalTaxTypes = [];
			me.maritalStatusFederalTaxTypeStore = me.cache.register({
				storeId: "maritalStatusFederalTaxTypes",
				itemConstructor: fin.emp.MaritalStatusFederalTaxType,
				itemConstructorArgs: fin.emp.maritalStatusFederalTaxTypeArgs,
				injectionArray: me.maritalStatusFederalTaxTypes	
			});
		
			me.houseCodePayrollCompanys = [];
			me.houseCodePayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.emp.HouseCodePayrollCompany,
				itemConstructorArgs: fin.emp.houseCodePayrollCompanyArgs,
				injectionArray: me.houseCodePayrollCompanys
			});				
			
			me.employeePersonals = [];
			me.employeePersonalStore = me.cache.register({ 
				storeId: "persons",
				itemConstructor: fin.emp.EmployeePersonal,
				itemConstructorArgs: fin.emp.employeePersonalArgs,
				injectionArray: me.employeePersonals	
			});
			
			me.statusCategoryTypes = [];
			me.statusCategoryTypeStore = me.cache.register({
				storeId: "statusCategoryTypes",
				itemConstructor: fin.emp.StatusCategoryType,
				itemConstructorArgs: fin.emp.statusCategoryTypeArgs,
				injectionArray: me.statusCategoryTypes	
			});
			
			me.deviceGroupTypes = [];
			me.deviceGroupStore = me.cache.register({
				storeId: "deviceGroupTypes",
				itemConstructor: fin.emp.DeviceGroupType,
				itemConstructorArgs: fin.emp.deviceGroupTypeArgs,
				injectionArray: me.deviceGroupTypes	
			});
		
			me.jobCodeTypes = [];
			me.jobCodeStore = me.cache.register({
				storeId: "jobCodes",
				itemConstructor: fin.emp.JobCodeType,
				itemConstructorArgs: fin.emp.jobCodeTypeArgs,
				injectionArray: me.jobCodeTypes	
			});

			me.ethnicityTypes = [];
			me.ethnicityTypeStore = me.cache.register({
				storeId: "ethnicityTypes",
				itemConstructor: fin.emp.EthnicityType,
				itemConstructorArgs: fin.emp.ethnicityTypeArgs,
				injectionArray: me.ethnicityTypes	
			});

			me.unionTypes = [];
			me.unionTypeStore = me.cache.register({
				storeId: "unionTypes",
				itemConstructor: fin.emp.UnionType,
				itemConstructorArgs: fin.emp.unionTypeArgs,
				injectionArray: me.unionTypes	
			});
			
			me.unionStatusTypes = [];
			me.unionStatusTypeStore = me.cache.register({
				storeId: "unionStatusTypes",
				itemConstructor: fin.emp.UnionStatusType,
				itemConstructorArgs: fin.emp.unionStatusTypeArgs,
				injectionArray: me.unionStatusTypes	
			});
			
			me.rateChangeReasons = [];
			me.rateChangeReasonStore = me.cache.register({
				storeId: "rateChangeReasons",
				itemConstructor: fin.emp.RateChangeReasonType,
				itemConstructorArgs: fin.emp.rateChangeReasonTypeArgs,
				injectionArray: me.rateChangeReasons	
			});
			
			me.terminationReasons = [];
			me.terminationReasonStore = me.cache.register({
				storeId: "terminationReasons",
				itemConstructor: fin.emp.TerminationReasonType,
				itemConstructorArgs: fin.emp.terminationReasonTypeArgs,
				injectionArray: me.terminationReasons	
			});
			
			me.workShifts = [];
			me.workShiftStore = me.cache.register({
				storeId: "workShifts",
				itemConstructor: fin.emp.WorkShift,
				itemConstructorArgs: fin.emp.workShiftArgs,
				injectionArray: me.workShifts	
			});
			
			me.EmployeeNumbers = [];
			me.EmployeeNumberStore = me.cache.register({
				storeId: "newemployeeNumbers",
				itemConstructor: fin.emp.NewEmployeeNumber,
				itemConstructorArgs: fin.emp.newEmployeeNumberArgs,
				injectionArray: me.EmployeeNumbers	
			});
			
			me.payFrequencyTypes = [];
			me.payFrequencyTypeStore = me.cache.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.emp.PayFrequencyType,
				itemConstructorArgs: fin.emp.payFrequencyTypeArgs,
				injectionArray: me.payFrequencyTypes	
			});
			
			me.i9Types = [];
			me.i9TypeStore = me.cache.register({
				storeId: "i9Types",
				itemConstructor: fin.emp.I9Type,
				itemConstructorArgs: fin.emp.i9TypeArgs,
				injectionArray: me.i9Types	
			});
			
			me.vetTypes = [];
			me.vetTypeStore = me.cache.register({
				storeId: "vetTypes",
				itemConstructor: fin.emp.VetType,
				itemConstructorArgs: fin.emp.vetTypeArgs,
				injectionArray: me.vetTypes	
			});
			
			me.separationCodes = [];
			me.separationCodeStore = me.cache.register({
				storeId: "separationCodes",
				itemConstructor: fin.emp.SeparationCode,
				itemConstructorArgs: fin.emp.separationCodeArgs,
				injectionArray: me.separationCodes	
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.emp.HouseCodeJob,
				itemConstructorArgs: fin.emp.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.jobStartReasonTypes = [];
			me.jobStartReasonTypeStore = me.cache.register({
				storeId: "jobStartReasonTypes",
				itemConstructor: fin.emp.JobStartReasonType,
				itemConstructorArgs: fin.emp.jobStartReasonTypeArgs,
				injectionArray: me.jobStartReasonTypes
			});
			
			me.maritalStatusTypes = [];
			me.maritalStatusTypeStore = me.cache.register({
				storeId: "maritalStatusTypes",
				itemConstructor: fin.emp.MaritalStatusType,
				itemConstructorArgs: fin.emp.maritalStatusTypeArgs,
				injectionArray: me.maritalStatusTypes
			});
			
			me.stateTypes = [];
			me.stateStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.emp.StateType,
				itemConstructorArgs: fin.emp.stateTypeArgs,
				injectionArray: me.stateTypes	
			});
			
			me.stateAdjustmentTypes = [];
			me.stateAdjustmentTypeStore = me.cache.register({
				storeId: "stateAdjustmentTypes",
				itemConstructor: fin.emp.StateAdjustmentType,
				itemConstructorArgs: fin.emp.stateAdjustmentTypeArgs,
				injectionArray: me.stateAdjustmentTypes	
			});
			
			me.maritalStatusStateTaxTypePrimarys = [];
			me.maritalStatusStateTaxTypePrimaryStore = me.cache.register({
				storeId: "maritalStatusPrimaryTypes",
				itemConstructor: fin.emp.MaritalStatusType,
				itemConstructorArgs: fin.emp.maritalStatusTypeArgs,
				injectionArray: me.maritalStatusStateTaxTypePrimarys	
			});
			
			me.maritalStatusStateTaxTypeSecondarys = [];
			me.maritalStatusStateTaxTypeSecondaryStore = me.cache.register({
				storeId: "maritalStatusSecondaryTypes",
				itemConstructor: fin.emp.SecMaritalStatusType,
				itemConstructorArgs: fin.emp.secMaritalStatusTypeArgs,
				injectionArray: me.maritalStatusStateTaxTypeSecondarys	
			});
			
			me.sdiAdjustmentTypes = [];
			me.sdiAdjustmentTypeStore = me.cache.register({
				storeId: "sdiAdjustmentTypes",
				itemConstructor: fin.emp.SDIAdjustmentType,
				itemConstructorArgs: fin.emp.sdiAdjustmentTypeArgs,
				injectionArray: me.sdiAdjustmentTypes	
			});
			
			me.localTaxAdjustmentTypes = [];
			me.localTaxAdjustmentTypeStore = me.cache.register({
				storeId: "localTaxAdjustmentTypes",
				itemConstructor: fin.emp.LocalTaxAdjustmentType,
				itemConstructorArgs: fin.emp.localTaxAdjustmentTypeArgs,
				injectionArray: me.localTaxAdjustmentTypes	
			});
			
			me.localTaxCodes = [];
			me.localTaxCodeStore = me.cache.register({
				storeId: "localTaxCodePayrollCompanyStates",
				itemConstructor: fin.emp.LocalTaxCode,
				itemConstructorArgs: fin.emp.localTaxCodeArgs,
				injectionArray: me.localTaxCodes	
			});	
			
			me.empEmployeeNumberValidations = [];
			me.empEmployeeNumberValidationStore = me.cache.register({
				storeId: "empEmployeeNumberValidations",
				itemConstructor: fin.emp.EmpEmployeeNumberValidation,
				itemConstructorArgs: fin.emp.empEmployeeNumberValidationArgs,
				injectionArray: me.empEmployeeNumberValidations
			});

			me.employeeHistories = [];
			me.employeeHistoryStore = me.cache.register({
				storeId: "employeeHistorys",
				itemConstructor: fin.emp.EmployeeHistory,
				itemConstructorArgs: fin.emp.employeeHistoryArgs,
				injectionArray: me.employeeHistories
			});

			me.stateAdditionalInfos = [];
			me.stateAdditionalInfoStore = me.cache.register({
				storeId: "employeeStateAdditionalInfos",
				itemConstructor: fin.emp.StateAdditionalInfo,
				itemConstructorArgs: fin.emp.stateAdditionalInfoArgs,
				injectionArray: me.stateAdditionalInfos
			});
			
			me.basicLifeIndicatorTypes = [];
			me.basicLifeIndicatorTypeStore = me.cache.register({
				storeId: "basicLifeIndicatorTypes",
				itemConstructor: fin.emp.BasicLifeIndicatorType,
				itemConstructorArgs: fin.emp.basicLifeIndicatorTypeArgs,
				injectionArray: me.basicLifeIndicatorTypes
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
		
		customSort: function(me, dataProperty, a, b) {
			var aValue = a[dataProperty];
			var bValue = b[dataProperty];

			if (aValue.toLowerCase() < bValue.toLowerCase()) {
				return -1;
			}
			else if(aValue.toLowerCase() > bValue.toLowerCase()) {
				return 1;
			}
			return 0;
		},
		
		employeeHistoriesLoaded: function(me, activeId) { 

			me.historyGrid.setData(me.employeeHistories);
			me.historyGrid.setHeight(340);
			$("#popupLoading").hide();
		},
		
		actionCloseItem: function() {
			
			$("#popupHistory").hide();
		},
		
		setPersonBrief: function fin_emp_UserInterface_setPersonBrief() {
			var me = this;
			
			if (me.actionType != 'NewHire') return; 
			
			var first5 = me.personFirstName.getValue().replace(/'/g, "");
			var last5 = me.personLastName.getValue().replace(/'/g, "");
			
			if (first5.length > 5)
				first5 = first5.substring(0,5);
				
			if (last5.length > 5)
				last5 = last5.substring(0,5);

			//get random# between 100001 & 999999
			var rand = Math.floor(100001 + 899998 * Math.random());

			me.personBrief = first5 + last5 + rand;
		},
		
		houseCodesLoaded: function(me, activeId) { // House Codes

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);			
			me.searchInput.text.focus();			
			me.resizeControls();
			
			me.houseCodeStateMinimumWageStore.fetch("houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeStateMinimumWagesLoaded, me);			
			ii.trace("Checking for Minimum Wage", ii.traceTypes.Information, "Info");
		},
		
		houseCodeStateMinimumWagesLoaded: function(me, activeId) {
			
			if (me.houseCodeStateMinimumWages.length < 0) return;
			
			me.houseCodeStateMinimumWage = me.houseCodeStateMinimumWages[0].minimumWage;
			ii.trace("Minimum Wage: " + me.houseCodeStateMinimumWage, ii.traceTypes.Information, "Info");
		},
		
		statusTypesLoaded: function(me, activeId) {
					
			me.statusType.reset();		
			me.typeNoneAdd(me.statusTypes);
			me.statusType.setData(me.statusTypes);
			me.checkLoadCount();
		},
		
		loadSearchResults: function() {
			var me = this;
			
			if (me.searchInput.getValue() == "" && $("#houseCodeText").val() == "") {
				alert('Please enter search criteria: Employee Name or HouseCode.');
				return false;
			}

			me.setLoadCount();
			me.employeeStore.reset();
			me.employeeStore.fetch("searchValue:" + me.searchInput.getValue()
				+ ($("#houseCodeText").val() != "" ?  "," + "hcmHouseCodeId:" + parent.fin.appUI.houseCodeId : "")
				+ (me.statusType.indexSelected > 0 ? "," + "statusTypeId:" + me.statusTypes[me.statusType.indexSelected].id : "")
				+ ",employeeType:" + me.employeeSearchType
				+ ",filterType:" + me.filterType.text.value
				+ ",userId:[user]", me.employeesLoaded, me);
		},
		
		employeesLoaded: function fin_emp_UserInterface_employeesLoaded(me, activeId) {

			me.checkLoadCount();

			if (me.employees.length == 0) {
				me.employeeSearch.setData([]);
				alert('There is no Employee matching to the given Criteria.');
				return;
			}		

			var index = 0;			
			me.emps = [];
			
			for (index in me.employees){
				me.emps.push(me.employees[index]);
			}
							
			me.employeeSearch.setData(me.emps);
			me.searchInput.text.focus();				
		},
		
		loadNewUser: function() {
			var me = this;			

			window.location = "/fin/emp/employeeMaster/usr/markup.htm?personId=0"; //&hcmHouseCodeId=" + parent.fin.appUI.houseCodeId;
		},
		
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var item = me.employeeSearch.data[args.index];
			
			me.employeeSearchSelectedRowIndex = args.index;
			me.employeeSSN.setValue(item.ssn); //set SSN# for Employee Wizard.
			me.noContext = false;
		},

		employeeDetailsShow: function fin_emp_employeeSearch_UserInterface_employeeDetailsShow() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (me.employeeSearch.activeRowIndex < 0) return;
			
			var item = me.employeeSearch.data[me.employeeSearch.activeRowIndex];
			
			if (!me.columnSorted())
				window.location = "/fin/emp/employeeMaster/usr/markup.htm?personId=" + item.id;
		},

		columnSorted: function fin_emp_employeeSearch_UserInterface_columnSorted() {
			var args = ii.args(arguments, {});
			var me = this;
			var columnExists = false;
			var generalColumnSorted = false;
			var columnSorted = false;
			var column;
			var columnSelected;
			
			for (index in me.employeeSearch.columns) {
			
				column = me.employeeSearch.columns[index];
				if (column) {
				
					if (index == "rowNumber") 
						continue;
					
					for (sortColumnIndex in me.sortSelections) {					
						columnSelected = me.sortSelections[sortColumnIndex];
						if (columnSelected.name == index) {
						
							columnExists = true;
							if (columnSelected.sortStatus != column.sortStatus) {
								columnSorted = true;
								me.sortSelections[sortColumnIndex].name = index;
								me.sortSelections[sortColumnIndex].sortStatus = column.sortStatus;
							}
						}
					}
					
					if (!columnExists) {
						me.sortSelections.push({
							name: index,
							sortStatus: column.sortStatus
						});
						
						if (column.sortStatus != "none") 
							columnSorted = true;
					}
					
					if (columnSorted) generalColumnSorted = true;
					columnSorted = false;
				}
			}			
			return generalColumnSorted;
		},

		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.loadSearchResults();
			}
		},
		
		employeeGeneralSSNSearch: function() {
			var me = this;
			
			if (me.employeeSSN.getValue() == '') {
				alert('Please enter search criteria: SSN.');
				return false;
			}
						
			me.employeeStore.reset();								
			me.employeeStore.fetch("searchValue:" + me.employeeSSN.getValue().replace(/-/g,'')
				+ ",userId:[user]", me.employeesWizardLoaded, me);				
		},
		
		employeesWizardLoaded: function fin_emp_UserInterface_employeesWizardLoaded(me, activeId) {

			if (me.employees.length <= 0) {				
				alert("There is no Employee matching to the given Criteria.");
				me.employeeSSN.setValue("");
				me.wizardCount--;
				$("#popupLoading").hide();
				return;
			}

			if (me.employees.length > 0) {
				me.personId = me.employees[0].id;

				$("#ViewHistory").show();
				$("#popupSubHeaderEmployeeName").html("( Name: " + me.employees[0].firstName + ' ' + me.employees[0].lastName + ' )');

				if (me.actionType == "Rehire") {
					if (me.employees[0].payrollStatus != "T") {
						alert("Please select Terminated Employee for Rehire.");
						me.actionCancel();
						$("#popupLoading").hide();
						return;
					}
				}
				else if (me.actionType == "ReverseTermination") {
					if (me.employees[0].payrollStatus != "T") {
						alert("Please select Terminated Employee for Reverse Termination.");
						me.actionCancel();
						$("#popupLoading").hide();
						return;
					}
				}

				//me.fetchData();
				me.houseCodeStore.fetch("userId:[user],appUnitBrief:" + me.employees[0].houseCode + ",", me.houseCodeWizardSetup, me);
			}
		},
		
		validationsLoaded: function(me, activeId) {			
			if (me.personId <= 0) {
				if (me.employeeValidations.length > 0) {
					if (me.employeeValidations[0].hrBlackOutPeriod > 0 && me.employeeValidations[0].hrBlackOutPeriod <= 37) {
						window.location = "/fin/emp/employeeSearch/usr/markup.htm";
						alert("Employee may not be added or modified during the Payroll Blackout. The Payroll Blackout start date is expected to be Sunday at 12 AM and the end date is expected to be 37 hours later. Please visit after [" + me.employeeValidations[0].hrBlackOutPeriod + "] hours.");
					}
				}
			}
		},
		
		phoneMask: function() {
			var args = ii.args(arguments,{
				phoneNumber: {type: String}
				, unMask: {type: Boolean, required: false, defaultValue: false}
			});			
			var stringToMask = ''; 
			var stringMasked = '';
			var val = args.phoneNumber.split(''); 

			for (var i = 0; i < val.length; i++) { 
				if (!isNaN(val[i]) && val[i] != " ")
					stringToMask = stringToMask + val[i];
			}

			if (args.unMask) return stringToMask; //unMask phone number while saving.			
			if (stringToMask.length < 10) return args.phoneNumber;
			if (stringToMask.length > 10) stringToMask = stringToMask.substring(0, 10);

			val = stringToMask.split(''); 

			for (var i = 0; i < val.length; i++) { 
				if (i == 0) { val[i] = '(' + val[i] } 
				if (i == 2) { val[i] = val[i] + ') ' } 
				if (i == 5) { val[i] = val[i] + '-' } 
				stringMasked = stringMasked + val[i] 
			}

			return stringMasked; 
		},
		
		setDropListSelectedValueById: function() {
			var args = ii.args(arguments, {
				listType: {type: String},
				id: {type: Number}
			});
			var me = this;
			
			me.setDropListSelectedValue(args.listType, args.id, null);
		},
		
		setDropListSelectedValueByTitle: function() {
			var args = ii.args(arguments, {
				listType: {type: String},
				title: {type: String}
			});
			var me = this;
			
			me.setDropListSelectedValue(args.listType, null, args.title);
		},
		
		setDropListSelectedValue: function() {
			var args = ii.args(arguments, {
				listType: {type: String},
				id: {type: Number, required: false},
				title: {type: String, required: false}
			});			
			var me = this;
			var index = 0;
			
			if (args.listType == "rateChange") {
				if (args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.rateChangeReasons);
				if (args.title) index = me.findIndexByTitle(args.title, me.rateChangeReasons);
				me.employeeRateChangeReason.select(index, me.employeeRateChangeReason.focused);
			}
			
			if (args.listType == "jobStartChange") {
				if (args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.jobStartReasonTypes);
				if (args.title) index = me.findIndexByTitle(args.title, me.jobStartReasonTypes);
				me.jobChangeReason.select(index, me.jobChangeReason.focused);
			}
			
			if (args.listType == "employeeStatus") {
				if (args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.statusTypes);
				if (args.title) index = me.findIndexByTitle(args.title, me.statusTypes);
				me.employeeStatusType.select(index, me.employeeStatusType.focused);
			}
			
			if (args.listType == "employeeStatusCategory") {
				if (me.statusCategoryTypes.length > 0) {
					
					if (args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.statusCategoryTypes);
					if (args.title) index = me.findIndexByTitle(args.title, me.statusCategoryTypes);
					if (index != undefined) me.employeeStatusCategoryType.select(index, me.employeeStatusCategoryType.focused);
					ii.trace("Employee Status Category Loaded 1", ii.traceTypes.information, "Info");
				}				
			}
			
			if (args.listType == "jobCode") {
				if (args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.jobCodeTypes);
				if (args.title) index = me.findIndexByTitle(args.title, me.jobCodeTypes);
				me.employeeJobCode.select(index, me.employeeJobCode.focused);
			}
			//can move other DropLists selection here..
		},
		
		compareDate: function() {
			var args = ii.args(arguments, {
				date2Compare : {type: String},
				date2CompareWith : {type: String, required: false}
			});
			//user this function in other place in this code.
			var me = this;
			
			if (!args.date2CompareWith)
				args.date2CompareWith = me.currentDate();
							
			var date2Compare = new Date(args.date2Compare);
			var date2CompareWith = new Date(args.date2CompareWith);
			
			if (date2Compare < date2CompareWith)
				return -1;
			else if (date2Compare > date2CompareWith)
				return 1;
			else
				return 0;
		},
		
		isDateValid: function() {
			var args = ii.args(arguments, {
				date2Validate : {type: String},
				actionType : {type: String} // Hire(New/Re), Termination
			});
			//user this function in other place in this code.
			var me = this;			
			var dateCurrent = new Date(me.currentDate());
			var date2Validate = new Date(args.date2Validate);
			var datePeriodStart = new Date(me.payPeriodStartDate);
			var datePeriodEnd = new Date(me.payPeriodEndDate); 
			
			if (args.actionType == 'Hire') { //Hire Rehire date should be in current payPeriod but not future date
				if (date2Validate < datePeriodStart) 
					return false;
				else if (date2Validate > datePeriodEnd) 
					return false;
				else if (date2Validate > dateCurrent) 
					return false;
				else 
					return true;
			}

			//Termination date (for Rehire), Hire Date (for Termination) should not be in current pay period			
			if (args.actionType == 'Rehire' || args.actionType == 'Termination') {
				if (date2Validate < datePeriodStart) 
					return true;
				else if (date2Validate > datePeriodEnd) 
					return true;
				else 
					return false;
			}
			
			if (args.actionType == 'Effective') { //Effective date should be in current pay period
				if (date2Validate < datePeriodStart) 
					return false;
				else  if (date2Validate > datePeriodEnd) 
					return false;
				else 
					return true;
			}
			
			//Termination date (for ReverseTermination), should be in current pay period			
			if (args.actionType == "ReverseTermination") {
				if (date2Validate < datePeriodStart)
					return false;
				else if (date2Validate > datePeriodEnd)
					return false;
				else
					return true;
			}			
		},
		
		currentDate: function() {
			var currentTime = new Date(parent.fin.appUI.glbCurrentDate);
			var month = currentTime.getMonth() + 1;
			var day = currentTime.getDate();
			var year = currentTime.getFullYear();
			
			return month + "/" + day + "/" + year;
		},
		
		getDateFormat: function(dtValue) {
			var dt = new Date(dtValue);

			var m = dt.getMonth() + 1;
			var month = (m < 10) ? '0' + m : m;

			var d = dt.getDate();
			var day = (d < 10) ? '0' + d : d;
			
			var yy = dt.getFullYear();
			var year = (yy < 1000) ? yy + 1900 : yy;

			return month + "/" + day + "/" + year;
		},
		
		fetchData: function() {
			var me = this;			
			
			me.employeeStatusCategoryType.fetchingData();
			me.employeeWorkShift.fetchingData();
			me.employeeJobCode.fetchingData();
			me.employeeDeviceGroup.fetchingData();
			me.employeeRateChangeReason.fetchingData();
			me.employeeTerminationReason.fetchingData();
			me.employeeEthnicity.fetchingData();
			me.employeeUnion.fetchingData();
			me.employeeUnionStatus.fetchingData();
			me.employeeI9Status.fetchingData();
			me.employeeVETSStatus.fetchingData();
			me.employeeMaritalStatus.fetchingData();
			me.jobChangeReason.fetchingData();			
			me.federalAdjustmentType.fetchingData();
			me.maritalStatusFederalTaxType.fetchingData();
			
			/*if (me.employeeGenerals.length > 0) {
				
				me.houseCodeSearchTemplate.houseCodeIdTemplate = me.employeeGenerals[0].hcmHouseCode;
				me.houseCodeSearchTemplate.hirNodeTemplate = me.employeeGenerals[0].hirNode;
				me.houseCodeStore.fetch("userId:[user],hcmHouseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",", me.houseCodesLoaded, me);
				
				me.employeePayrollCompany.fetchingData();
				me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.employeeGenerals[0].hcmHouseCode + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
				
			}*/
			
			me.stateStore.reset();						
			me.stateStore.fetch("userId:[user]", me.statesLoaded, me);			
			me.unionStatusTypeStore.fetch("userId:[user],", me.unionStatusTypesLoaded, me);
			me.stateAdditionalInfoStore.fetch("userId:[user],", me.stateAdditionalInfosLoaded, me);
		},
		
		stateAdditionalInfosLoaded: function(me, activeId) {

		},
		
		setStateAdditionalInfo: function(type) {
			var me = this;
			var html = "";
			var id = "";
			var tabIndex = 0;
			var selectedIndex = -1;
			var stateAdditionalInfoTemp = [];
			var controls = [];

			if (type == "Primary") {
				selectedIndex = me.primaryTaxState.indexSelected;
				if (selectedIndex == -1)
					return;
				id = "P";
				tabIndex = 520;
				me.primaryStateAdditionalInfos = [];
				me.primaryStateControls = [];
			}
			else if (type == "Secondary") {
				selectedIndex = me.secTaxState.indexSelected;
				if (selectedIndex == -1)
					return;
				id = "S";
				tabIndex = 530;
				me.secondaryStateAdditionalInfos = [];
				me.secondaryStateControls = [];
			}

			for (var index = 0; index < me.stateAdditionalInfos.length; index++) {
				if (me.stateAdditionalInfos[index].state == me.stateTypes[selectedIndex].name)
					stateAdditionalInfoTemp.push(me.stateAdditionalInfos[index]);
			}
			
			if (stateAdditionalInfoTemp.length > 0)
				html = "<div class='stateAdditionalInfoHeader'>&nbsp;" + type + " State Additional Information:</div><div style='clear:both'></div>";
			
			for (var index = 0; index < stateAdditionalInfoTemp.length; index++) {
				html += "\n<div id='TableEditArea'><div class='LabelTextAreaEmployee'>";
				
				if (stateAdditionalInfoTemp[index].mandatory)
					html += "<span class='requiredFieldIndicator'>&#149;</span>";
				else
					html += "&nbsp;";
					
				html += stateAdditionalInfoTemp[index].title + ":</div><div class='InputTextArea'>";
				if (stateAdditionalInfoTemp[index].dataType == "Radio") {
					var titles = stateAdditionalInfoTemp[index].description.split('|');
					var values = stateAdditionalInfoTemp[index].dataValidation.split('|');
					for (var iIndex = 0; iIndex < titles.length; iIndex++) {
						tabIndex++;
						html += "<div class='radioButton'>";
						html += "<input type='radio' id='" + id + stateAdditionalInfoTemp[index].brief + values[iIndex] + "' name='" + id + stateAdditionalInfoTemp[index].brief + "' tabindex='" + tabIndex + "'" + (iIndex == 0 ? 'checked' : '') + " value='" + values[iIndex] + "' /><span class='labelRadio'>" + titles[iIndex] + "</span></div>";	
					}
				}
				else {
					html += "<div id='" + id + stateAdditionalInfoTemp[index].brief + "'></div>";
				}
				html += "</div></div>\n<div style='clear:both;'></div>";
			}

			$("#" + type + "StateAdditionalInfoContainer").html(html);

			for (var index = 0; index < stateAdditionalInfoTemp.length; index++) {
				if (stateAdditionalInfoTemp[index].dataType == "Number" || stateAdditionalInfoTemp[index].dataType == "Text") {
					controls[index] = new ui.ctl.Input.Text({
				        id: "" + id + stateAdditionalInfoTemp[index].brief,
				        maxLength: stateAdditionalInfoTemp[index].dataValidation
				    });

					if (stateAdditionalInfoTemp[index].mandatory) {
						controls[index].makeEnterTab()
							.setValidationMaster(me.validator)
							.addValidation(ui.ctl.Input.Validation.required)
							.addValidation( function( isFinal, dataMap ) {

								for (var iIndex = 0; iIndex < stateAdditionalInfoTemp.length; iIndex++) {
									if (id + stateAdditionalInfoTemp[iIndex].brief == this.id) {
										if (stateAdditionalInfoTemp[iIndex].dataType == "Number") {
											if (this.getValue() == "")
									            return;
											var pattern = "^\\d{" + stateAdditionalInfoTemp[iIndex].dataValidation + "}$";
											if ((!ui.cmn.text.validate.generic(this.getValue(), pattern)))
												this.setInvalid("Please enter valid " + stateAdditionalInfoTemp[iIndex].title + ".");
										}
										break;
									}
								}
							});
					}
					else if (stateAdditionalInfoTemp[index].dataType == "Number") {
						controls[index].makeEnterTab()
							.setValidationMaster( me.validator )
							.addValidation( function( isFinal, dataMap ) {
			
								var enteredText = this.getValue();

								if (enteredText == "") return;
								
								for (var iIndex = 0; iIndex < stateAdditionalInfoTemp.length; iIndex++) {
									if (id + stateAdditionalInfoTemp[iIndex].brief == this.id) {
										var pattern = "^\\d{" + stateAdditionalInfoTemp[iIndex].dataValidation + "}$";
										if ((!ui.cmn.text.validate.generic(this.getValue(), pattern)))
											this.setInvalid("Please enter valid " + stateAdditionalInfoTemp[iIndex].title + ".");

										break;
									}
								}
						});			
					}
					tabIndex++;
					controls[index].text.tabIndex = tabIndex;
					controls[index].resizeText();
				}
				else if (stateAdditionalInfoTemp[index].dataType == "CheckBox") {
					controls[index] = new ui.ctl.Input.Check({
				        id: "" + id + stateAdditionalInfoTemp[index].brief
				    });
				}
				else if (stateAdditionalInfoTemp[index].dataType == "List") {
					controls[index] = new ui.ctl.Input.DropDown.Filtered({
				        id: "" + id + stateAdditionalInfoTemp[index].brief,
						labelName: "" + stateAdditionalInfoTemp[index].title,
						formatFunction: function( type ) { return type.title; }
				    });

					if (stateAdditionalInfoTemp[index].mandatory) {
						controls[index].makeEnterTab()
							.setValidationMaster(me.validator)
							.addValidation(ui.ctl.Input.Validation.required)
							.addValidation( function( isFinal, dataMap ) {
	
								if ((this.focused || this.touched) && this.indexSelected == -1)
									this.setInvalid("Please select the correct " + this.labelName + ".");
							});
					}

					tabIndex++;
					controls[index].text.tabIndex = tabIndex;
					controls[index].resizeText();
					me.setControlData(controls[index], stateAdditionalInfoTemp[index].description);
				}
			}
			
			if (type == "Primary") {
				me.primaryStateAdditionalInfos = stateAdditionalInfoTemp;
				me.primaryStateControls = controls;
				if (me.employeeGenerals.length > 0 && me.employeeGenerals[0].primaryState == me.stateTypes[selectedIndex].id)
					me.setStateAdditionalInformation(type);
			}
			else if (type == "Secondary") {
				me.secondaryStateAdditionalInfos = stateAdditionalInfoTemp;
				me.secondaryStateControls = controls;
				if (me.employeeGenerals.length > 0 && me.employeeGenerals[0].secondaryState == me.stateTypes[selectedIndex].id)
					me.setStateAdditionalInformation(type);
			}			
		},

		setControlData: function(control, data) {
			var me = this;
			var types = [];
			var values = data.split("|");

			for (var index = 0; index < values.length; index++) {
				var value = values[index];
				var idIndex = value.indexOf("-");
				var id = parseInt(value.substring(0, idIndex), 10);
				var title = value.substring(idIndex + 1);
				types.push({id: id, title: title});
			}

			control.setData(types);
			control.select(0, control.focused);
		},
		
		setStateAdditionalInformation: function(type) {
			var me = this;
			var controls = [];
			var values = [];
			var additionalInfos = [];
			var id = "";

			if (type == "Primary") {
				controls = me.primaryStateControls;
				additionalInfos = me.primaryStateAdditionalInfos;
				values = me.employeeGenerals[0].primaryStateAdditionalInformation.split("|");
				id = "P";				
			}
			else if (type == "Secondary") {
				controls = me.secondaryStateControls;
				additionalInfos = me.secondaryStateAdditionalInfos;
				values = me.employeeGenerals[0].secondaryStateAdditionalInformation.split("|");
				id = "S";				
			}
			
			for (var index = 0; index < additionalInfos.length; index++) {
				if (additionalInfos[index].dataType == "Number" || additionalInfos[index].dataType == "Text") {
					for (var iIndex = 0; iIndex < controls.length; iIndex++) {
						if (id + additionalInfos[index].brief == controls[iIndex].id) {
							controls[iIndex].setValue(values[index] == undefined ? "" : values[index]);
							break;
						}
					}
				}
				else if (additionalInfos[index].dataType == "List") {
					for (var iIndex = 0; iIndex < controls.length; iIndex++) {
						if (id + additionalInfos[index].brief == controls[iIndex].id) {
							var idIndex = ii.ajax.util.findIndexById(values[index], controls[iIndex].data);
							if (idIndex >= 0)
								controls[iIndex].select(idIndex, controls[iIndex].focused);
							break;
						}
					}
				}
				else if (additionalInfos[index].dataType == "Radio") {
					if ($("#" + id + additionalInfos[index].brief + values[0])[0] != undefined)
						$("#" + id + additionalInfos[index].brief + values[0])[0].checked = true;
				}
			}
		},
		
		getStateAdditionalInformation: function(type) {
			var me = this;
			var controls = [];
			var values = [];
			var additionalInfos = [];
			var stateAdditionalInformation = "";
			var id = "";
			
			if (type == "Primary") {
				controls = me.primaryStateControls;
				additionalInfos = me.primaryStateAdditionalInfos;
				id = "P";				
			}
			else if (type == "Secondary") {
				controls = me.secondaryStateControls;
				additionalInfos = me.secondaryStateAdditionalInfos;
				id = "S";				
			}
			
			for (var index = 0; index < additionalInfos.length; index++) {
				if (additionalInfos[index].dataType == "Number" || additionalInfos[index].dataType == "Text") {
					for (var iIndex = 0; iIndex < controls.length; iIndex++) {
						if (id + additionalInfos[index].brief == controls[iIndex].id) {
							stateAdditionalInformation += controls[iIndex].getValue() + "|";
							break;
						}
					}
				}
				else if (additionalInfos[index].dataType == "List") {
					for (var iIndex = 0; iIndex < controls.length; iIndex++) {
						if (id + additionalInfos[index].brief == controls[iIndex].id) {
							stateAdditionalInformation += controls[iIndex].data[controls[iIndex].indexSelected].id + "|";
							break;
						}
					}
				}
				else if (additionalInfos[index].dataType == "Radio") {
					stateAdditionalInformation += $("input[name='" + id + additionalInfos[index].brief + "']:checked").val() + "|";
				}
			}
			
			stateAdditionalInformation = stateAdditionalInformation.substring(0, stateAdditionalInformation.length - 1);
			return stateAdditionalInformation;
		},
		
		unionStatusTypesLoaded: function(me, activeId) {
			me.employeeUnionStatus.reset();
			me.typeNoneAdd(me.unionStatusTypes);	
			me.employeeUnionStatus.setData(me.unionStatusTypes);
		},
		
		statesLoaded: function(me, activeId) {
			me.personState.reset();
			me.personState.setData(me.stateTypes);			
			
			ii.trace("State Types Loaded", ii.traceTypes.information, "Info");
			
			if (me.employeeGeneralMasterStore.fetchedCriteria["storeId:employeeGeneralMasters,userId:[user],personId:" + me.personId + ","] != ii.ajax.fetchStatusTypes.fetched) {
				
				me.terminationReasonStore.reset();
				me.jobStartReasonTypeStore.reset();
				me.workShiftStore.reset();
				me.deviceGroupStore.reset();
				me.jobCodeStore.reset();
				me.rateChangeReasonStore.reset();
				me.unionTypeStore.reset();
				me.i9TypeStore.reset();
				me.vetTypeStore.reset();
				me.maritalStatusTypeStore.reset();
				me.statusCategoryTypeStore.reset();
				me.ethnicityTypeStore.reset();
				me.basicLifeIndicatorTypeStore.reset();
			}
			
			me.employeeGeneralMasterStore.fetch("userId:[user],personId:" + me.personId + ",", me.statusTypesGeneralLoaded, me);	
		},

		typeNoneAdd: function() {
			var args = ii.args(arguments, {
				data: {type: [Object]}
			});	
			
			var me = this;
			//index > 0, condition is included as some droplist (terminsation reason) already has None as type in it.
			var index = me.findIndexByTitle("None", args.data);
			if (index == null || index > 0) args.data.unshift({ id: 0, number: 0, name: "None" });
		},
		
		statusTypesGeneralLoaded: function(me, activeId) {	
			
			ii.trace("Employee Status Types Loaded", ii.traceTypes.information, "Info");
			me.employeeStatusType.reset();
			me.employeeStatusType.setData(me.statusTypes);
			
			me.employeeWorkShift.reset();
			//me.typeNoneAdd(me.workShifts);	
			me.employeeWorkShift.setData(me.workShifts);
			if (me.actionType == 'NewHire')
				me.employeeWorkShift.select(0, me.employeeWorkShift.focused);

			me.employeeJobCode.reset();
			me.typeNoneAdd(me.jobCodeTypes);	
			me.employeeJobCode.setData(me.jobCodeTypes);
			
			me.employeeDeviceGroup.reset();
			me.typeNoneAdd(me.deviceGroupTypes);	
			me.employeeDeviceGroup.setData(me.deviceGroupTypes);

			me.typeNoneAdd(me.rateChangeReasons);	
			me.rateChangeReasonSetData();

			me.employeeTerminationReason.reset();
			me.typeNoneAdd(me.terminationReasons);	
			me.employeeTerminationReason.setData(me.terminationReasons);

			me.employeeEthnicity.reset();
			me.typeNoneAdd(me.ethnicityTypes);	
			me.employeeEthnicity.setData(me.ethnicityTypes);
			
			me.employeeUnion.reset();
			me.typeNoneAdd(me.unionTypes);	
			me.employeeUnion.setData(me.unionTypes);
			
			me.employeeI9Status.reset();
			me.typeNoneAdd(me.i9Types);	
			me.employeeI9Status.setData(me.i9Types);
			
			me.employeeVETSStatus.reset();
			me.typeNoneAdd(me.vetTypes);		
			me.employeeVETSStatus.setData(me.vetTypes);
			
			me.employeeMaritalStatus.reset();
			me.typeNoneAdd(me.maritalStatusTypes);	
			me.employeeMaritalStatus.setData(me.maritalStatusTypes);
			
			me.jobChangeReasonSetData();
			
			me.primaryTaxState.reset();
			me.primaryTaxState.setData(me.stateTypes);
			
			me.secTaxState.reset();
			//me.typeNoneAdd(me.stateTypes);	
			me.secTaxState.setData(me.stateTypes);
			
			me.basicLifeIndicatorType.reset();	
			me.basicLifeIndicatorType.setData(me.basicLifeIndicatorTypes);
			
			ii.trace("Employee General: Type Tables Loaded", ii.traceTypes.information, "Info");
			
			me.federalAdjustmentStore.fetch("userId:[user]", me.federalAdjustmentsLoaded, me);							
		},
		
		federalAdjustmentsLoaded: function(me, activeId) {
			me.federalAdjustmentType.reset();
			me.federalAdjustmentType.setData(me.federalAdjustments);

			me.maritalStatusFederalTaxType.reset();
			me.maritalStatusFederalTaxType.setData(me.maritalStatusFederalTaxTypes);			

			ii.trace("Pay Frequency Types Loading", ii.traceTypes.information, "Info");
			me.payFrequencyTypeStore.fetch("userId:[user]", me.payFrequencyTypesLoaded, me);
		},
		
		payFrequencyTypesLoaded: function(me, activeId) {			
			ii.trace("Employee General: Pay Frequency Types Loaded", ii.traceTypes.information, "Info");
			
			me.separationCodeStore.fetch("userId:[user],terminationType:" + me.terminationType + ",", me.separationCodesLoaded, me);										
		},
		
		separationCodesLoaded: function(me, activeId) {				
			me.separationCode.reset();
			me.typeNoneAdd(me.separationCodes);	
			me.separationCode.setData(me.separationCodes);	
					
			ii.trace("Employee General: Separation Codes Loaded", ii.traceTypes.information, "Info");
			
			if (me.personId > 0) {
				me.employeePersonalStore.reset();
				me.employeePersonalStore.fetch("id:" + me.personId + ",userId:[user]", me.personsLoaded, me);
			}
			else {
				me.employeeGeneralDetailsLoaded(me, 0);
			}
			
			$("#pageLoading").hide();
		},	
		
		personsLoaded: function(me, activeId) {
			var index = 0;

			$("#popupLoading").hide();
			$("#EmployeeNumberText").attr('disabled', true);
			
			if (me.employeePersonals.length > 0 && me.actionType != "NewHire") {
				me.personBrief = me.employeePersonals[0].brief;
				me.personFirstName.setValue(me.employeePersonals[0].firstName);
				me.personLastName.setValue(me.employeePersonals[0].lastName);
				me.personMiddleName.setValue((me.employeePersonals[0].middleName == undefined ? "" : me.employeePersonals[0].middleName));
				me.personAddressLine1.setValue((me.employeePersonals[0].addressLine1 == undefined ? "" : me.employeePersonals[0].addressLine1));
				me.personAddressLine2.setValue((me.employeePersonals[0].addressLine2 == undefined ? "" : me.employeePersonals[0].addressLine2));
				me.personCity.setValue((me.employeePersonals[0].city == undefined ? "" : me.employeePersonals[0].city));

				index = ii.ajax.util.findIndexById(me.employeePersonals[0].state.toString(), me.stateTypes);
				if (index >= 0) 
					me.personState.select(index, me.personState.focused);
					
				me.personPostalCode.setValue((me.employeePersonals[0].postalCode == undefined ? "" : me.employeePersonals[0].postalCode));
				me.personHomePhone.setValue((me.employeePersonals[0].homePhone == undefined ? "" : me.employeePersonals[0].homePhone));
				me.personFax.setValue((me.employeePersonals[0].fax == undefined ? "" : me.employeePersonals[0].fax));
				me.personCellPhone.setValue((me.employeePersonals[0].cellPhone == undefined ? "" : me.employeePersonals[0].cellPhone));
				me.personEmail.setValue((me.employeePersonals[0].email == undefined ? "" : me.employeePersonals[0].email));
				me.personPager.setValue((me.employeePersonals[0].pager == undefined ? "" : me.employeePersonals[0].pager));
				me.hirNode = me.employeePersonals[0].hirNode;					
				
				if ((me.actionType == "Rehire") || (me.actionType == "Termination") || (me.actionType == "ReverseTermination")) {
					$("#SSNContianer").hide();
					$("#PersonalDetails").show();
					$("#AddressDetails").hide();
					$("#AnchorBack").show();
					$("#houseCodeTemplateText").attr('disabled', true);
					$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
					$("#EmployeePayrollCompanyText").attr('disabled', true);
					$("#EmployeePayrollCompanyAction").removeClass("iiInputAction");
					$("#JobEffectiveDateText").attr('disabled', true);
					$("#JobEffectiveDateAction").removeClass("iiInputAction");
					$("#CompensationEffectiveDateText").attr('disabled', true);
					$("#CompensationEffectiveDateAction").removeClass("iiInputAction");
					
					if (me.actionType != "Termination") {
						$("#EmployeeOriginalHireDateText").attr('disabled', true);
						$("#EmployeeOriginalHireDateAction").removeClass("iiInputAction");
						$("#EmployeeSeniorityDateText").attr('disabled', true);
						$("#EmployeeSeniorityDateAction").removeClass("iiInputAction");
					}
				}
				
				if (me.actionType == "Compensation") {
					$("#popupSubHeader").text(" Compensation");
					$("#Compensation").show();
					$("#SSNContianer").hide();
					$("#AnchorNext").hide();
					$("#AnchorSave").show();
					$("#AnchorBack").show();
					me.isPageLoaded = true;		
				}
				
				if (me.actionType == "Person") { 
					$("#popupSubHeader").text(" Person");                           
					$("#SSNContianer").hide();
					$("#AddressDetails").hide();
					$("#PersonalDetails").show();
					$("#AnchorNext").show();
					$("#AnchorBack").show();
					me.wizardCount = 1;
                }	
					                             
                if (me.actionType == "Employee") {
				  	$("#popupSubHeader").text(" General");
				  	$("#EmployeeInformation").hide();
					$("#houseCodeTerm").hide();
				  	me.wizardCount = 4;
					me.showWizard(); 
				}
				else if (me.actionType == "Federal") {
				  	$("#popupSubHeader").text(" Federal Tax");
					$("#Federal").hide();
					me.firstTimeShow = true;
				  	me.wizardCount = 8;
					me.showWizard();
				}  
                else if (me.actionType == "Job Information") {
				  	$("#popupSubHeader").text(" Job Information");
					$("#JobInformation").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					me.firstTimeShow = true;
				  	me.wizardCount = 6;
					me.showWizard(); 
				}	 
				else if (me.actionType == "Local Tax") {
				  	$("#popupSubHeader").text(" Local Tax");
					$("#LocalTax").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					me.firstTimeShow = true;
				  	me.wizardCount = 10;
					me.showWizard();
				}
				else if (me.actionType == "State Tax") { 
				  	$("#popupSubHeader").text(" State Tax");                               
					$("#StateTax").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					me.firstTimeShow = true;
					me.wizardCount = 9;
					me.showWizard(); 
                }
				else if (me.actionType == "BasicLifeIndicator") {
				  	$("#popupSubHeader").text(" General");
					me.firstTimeShow = true;
				    me.wizardCount = 11;
					me.showWizard(); 
				}
				else if (me.actionType == "ReverseTermination") {
				  	$("#popupSubHeader").text(" General");
					me.firstTimeShow = true;
				    me.wizardCount = 4;
					me.showWizard(); 
				}
					  
				if (me.actionType == "HouseCodeTransfer" && me.wizardCount == 4) {
					$("#ContactDetails").hide();
					$("#EmployeeInformation").show();
					$("#houseCodeTerm").show();
					$("#EmployeeGeneralInformation").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					$("#GeneralCurrentHireDate").show();
					$("#GeneralOriginalHireDate").show();
					$("#TermDateCode").hide();
					$("#TermReasonDate").hide();
					me.firstTimeShow = true;
					me.houseCodeChanged = true;
					
					$("#EmployeeNumberText").attr('disabled', false);
					$("#EmployeeGeneralStatusTypeText").attr('disabled', true);
					$("#EmployeeGeneralStatusTypeAction").removeClass("iiInputAction");
					$("#EmployeeStatusCategoryTypeText").attr('disabled', true);
					$("#EmployeeStatusCategoryTypeAction").removeClass("iiInputAction");
					$("#EmployeeHireDateText").attr('disabled', true);
					$("#EmployeeHireDateAction").removeClass("iiInputAction");
					$("#EmployeeOriginalHireDateText").attr('disabled', true);
					$("#EmployeeOriginalHireDateAction").removeClass("iiInputAction");
					$("#EmployeeSeniorityDateText").attr('disabled', true);
					$("#EmployeeSeniorityDateAction").removeClass("iiInputAction");
					$("#JobEffectiveDateText").attr('disabled', true);
					$("#JobEffectiveDateAction").removeClass("iiInputAction");
					$("#CompensationEffectiveDateText").attr('disabled', true);
					$("#CompensationEffectiveDateAction").removeClass("iiInputAction");							
				
				  	$("#popupSubHeader").text("General");
				  	$("#SSNContianer").hide();
					$("#JobInformation").hide();
					$("#AnchorBack").show();
					me.wizardCount = 5;
				}
				
				if (me.actionType == "DateModification" && me.wizardCount == 4) {
					$("#ContactDetails").hide();
					$("#EmployeeInformation").show();
					$("#houseCodeTerm").show();
					$("#EmployeeGeneralInformation").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					$("#GeneralCurrentHireDate").show();
					$("#GeneralOriginalHireDate").show();
					$("#TermDateCode").hide();
					$("#TermReasonDate").hide();
					$("#EmployeeNumberText").attr('disabled', true);
					$("#houseCodeTemplateText").attr('disabled', true);
					$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");
					$("#EmployeePayrollCompanyText").attr('disabled', true);
					$("#EmployeePayrollCompanyAction").removeClass("iiInputAction");
					$("#EmployeeGeneralStatusTypeText").attr('disabled', true);
					$("#EmployeeGeneralStatusTypeAction").removeClass("iiInputAction");
					$("#EmployeeStatusCategoryTypeText").attr('disabled', true);
					$("#EmployeeStatusCategoryTypeAction").removeClass("iiInputAction");
					$("#EmployeeHireDateText").attr('disabled', false);
					$("#EmployeeHireDateAction").addClass("iiInputAction");
					$("#EmployeeOriginalHireDateText").attr('disabled', false);
					$("#EmployeeOriginalHireDateAction").addClass("iiInputAction");
					$("#EmployeeSeniorityDateText").attr('disabled', false);
					$("#EmployeeSeniorityDateAction").addClass("iiInputAction");
					$("#EmployeeEffectiveDateText").attr('disabled', false);
					$("#EmployeeEffectiveDateAction").addClass("iiInputAction");					
					$("#JobEffectiveDateText").attr('disabled', false);
					$("#JobEffectiveDateAction").addClass("iiInputAction");
					$("#CompensationEffectiveDateText").attr('disabled', false);
					$("#CompensationEffectiveDateAction").addClass("iiInputAction");
				  	$("#popupSubHeader").text("General");
				  	$("#SSNContianer").hide();
					$("#JobInformation").hide();
					$("#AnchorBack").show();
					me.firstTimeShow = true;
					me.wizardCount = 5;
				}
					  
				me.resizeControls();
			}						
			
			me.employeeGeneralStore.reset();
			me.employeeGeneralStore.fetch("userId:[user],personId:" + me.personId + "," , me.employeeGeneralDetailsLoaded, me);
		},
		
		employeeGeneralDetailsLoaded: function(me, activeId) {
			var index = 0;
			
			me.status = "loading";
			me.employeeNameChanged = false;
			me.houseCodeSearchTemplateLoaded(me, 0);
			
			$("#PrimaryStateAdditionalInfoContainer").html("");
			$("#SecondaryStateAdditionalInfoContainer").html("");
			
			if (me.employeeGenerals.length > 0 && me.actionType != "NewHire") {

				me.employeeGeneralId = me.employeeGenerals[0].id;
				me.personId = me.employeeGenerals[0].personId;	
				
				if (me.tabPayrollShow) $("#TabPayroll").show();
				
				//Employee General Section - Start
				me.employeeSSN.setValue(me.employeeGenerals[0].ssn);
				
				me.houseCodeSearchTemplate.houseCodeIdTemplate = me.employeeGenerals[0].hcmHouseCode;
				me.houseCodeSearchTemplate.hirNodeTemplate = me.employeeGenerals[0].hirNode;
				
				me.employeePayrollCompany.fetchingData();
				me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.employeeGenerals[0].hcmHouseCode + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
				
				me.employeeNumber.setValue(me.employeeGenerals[0].employeeNumber);
				
				if (me.employeeGenerals[0].genderType == 1)
					$('#GenderYes').attr('checked', true); // 1 Male, 2 Female
				else
					$('#GenderNo').attr('checked', true); // 1 Male, 2 Female
					
				me.employeeBirthDate.setValue(me.employeeGenerals[0].birthDate);
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].maritalStatusType.toString(), me.maritalStatusTypes);
				if (index != undefined) 
					me.employeeMaritalStatus.select(index, me.employeeMaritalStatus.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].ethnicityType.toString(), me.ethnicityTypes)
				if (index != undefined) 
					me.employeeEthnicity.select(index, me.employeeEthnicity.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].i9Type.toString(), me.i9Types);
				if (index != undefined) 
					me.employeeI9Status.select(index, me.employeeI9Status.focused);
				
				if (me.employeeGenerals[0].active)
					$('#EmployeeActiveYes').attr('checked', true);
				else
					$('#EmployeeActiveNo').attr('checked', true);
					
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].vetType.toString(), me.vetTypes);
				if (index != undefined) 
					me.employeeVETSStatus.select(index, me.employeeVETSStatus.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].statusType.toString(), me.statusTypes)
				if (index != undefined) 
					me.employeeStatusType.select(index, me.employeeStatusType.focused);
				
				if(me.employeeGenerals[0].crothallEmployee)
					$('#CrothallEmployeeYes').attr('checked', true);
				else
					$('#CrothallEmployeeNo').attr('checked', true);
				
				if (me.employeeGenerals[0].hireDate == "") {//current hire date
					me.employeeHireDate.setValue("");
				}
				else {
					me.employeeHireDate.setValue(me.employeeGenerals[0].hireDate);	
					me.employeeHireDateValue = me.employeeGenerals[0].hireDate;				
				}				
				me.actionEmployeeStatusChanged(); //also get corresponding Status Category.
				
				if (me.employeeGenerals[0].originalHireDate == "") {
					me.employeeOriginalHireDate.setValue(me.employeeHireDate.text.value + '');
				}
				else {
					me.employeeOriginalHireDate.setValue(me.employeeGenerals[0].originalHireDate);					
				}				
				
				if (me.employeeGenerals[0].effectiveDate == "") {
					me.employeeEffectiveDate.setValue(me.employeeHireDate.text.value + '');
				}
				else {
					me.employeeEffectiveDate.setValue(me.employeeGenerals[0].effectiveDate);
					me.termEmployeeEffectiveDate.setValue(me.employeeGenerals[0].effectiveDate);
				}
				
				if (me.employeeGenerals[0].terminationDate == "") {
					me.employeeTerminationDate.setValue("");
				}
				else {
					me.employeeTerminationDate.setValue(me.employeeGenerals[0].terminationDate);
				}
				
				me.actionEmployeeTerminationChanged();
				
				if (me.employeeGenerals[0].seniorityDate == "") {
					me.employeeSeniorityDate.setValue(me.employeeHireDate.text.value + '');
				}
				else {
					me.employeeSeniorityDate.setValue(me.employeeGenerals[0].seniorityDate);
				}
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].terminationReason.toString(), me.terminationReasons);
				if (index != undefined) 
					me.employeeTerminationReason.select(index, me.employeeTerminationReason.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].separationCode.toString(), me.separationCodes);
				if (index != undefined) 
					me.separationCode.select(index, me.separationCode.focused);
				
				//Employee General Section - End
				
				//Job Information Section - Start
				
				if (me.employeeGenerals[0].effectiveDateJob == "") {
					me.jobEffectiveDate.setValue(me.employeeHireDate.text.value + '');
				}
				else {
					me.jobEffectiveDate.setValue(me.employeeGenerals[0].effectiveDateJob);
				}
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].jobCode.toString(), me.jobCodeTypes);
				if (index != undefined) {
					me.employeeJobCode.select(index, me.employeeJobCode.focused);
				}
				
				me.job.fetchingData();
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate, me.houseCodeJobsLoaded, me);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].unionType.toString(), me.unionTypes);
				if (index != undefined) 
					me.employeeUnion.select(index, me.employeeUnion.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].unionStatusType.toString(), me.unionStatusTypes);
				if (index != undefined) 
					me.employeeUnionStatus.select(index, me.employeeUnionStatus.focused);
					
				if (me.employeeGenerals[0].exempt)
					$('#ExemptYes').attr('checked', true);
				else
					$('#ExemptNo').attr('checked', true);
				
				if (me.employeeGenerals[0].backGroundCheckDate == "") 
					me.employeeBackgroundCheckDate.setValue("");
				else 
					me.employeeBackgroundCheckDate.setValue(me.employeeGenerals[0].backGroundCheckDate);
				
				if (me.employeeGenerals[0].unionEmployee)
					$('#UnionYes').attr('checked', true);
				else
					$('#UnionNo').attr('checked', true);
				
				if (me.employeeGenerals[0].unionEmployee) 
					$('#UnionYes').click();
				else
					$('#UnionNo').click();
				
				//Job Information Section - End
				
				//Compensation Section - Start
				
				if (me.employeeGenerals[0].effectiveDateCompensation == "") {
					me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value + '');
				}
				else {
					me.compensationEffectiveDate.setValue(me.employeeGenerals[0].effectiveDateCompensation);
				}
				
				if (me.employeeGenerals[0].hourly) 
					me.payRateHourlySalary = true;
				else 
					me.payRateHourlySalary = false;
				
				if (me.employeeGenerals[0].hourly) 
					$('#HourlyRateYes').click();
				else 
					$('#HourlyRateNo').click();
				
				if (me.employeeGenerals[0].frequencyType > 0) {
					index = ii.ajax.util.findIndexById(me.employeeGenerals[0].frequencyType.toString(), me.payFrequencyTypes);
					$("#PayFrequencyType").text(me.payFrequencyTypes[index].name);
					me.payFrequencyType = me.payFrequencyTypes[index].id;
				}
				else {
					$("#PayFrequencyType").text(me.payFrequencyTypes[0].name);
				}
				
				me.employeePayRate.setValue(me.employeeGenerals[0].payRate);
				me.employeePayRateValue = me.employeeGenerals[0].payRate;
				me.employeeScheduledHours.setValue(me.employeeGenerals[0].scheduledHours);
				me.scheduledHoursValue = me.employeeScheduledHours.getValue();
				
				if (me.employeeGenerals[0].reviewDate == "") 
					me.employeeReviewDate.setValue("");
				else 
					me.employeeReviewDate.setValue(me.employeeGenerals[0].reviewDate);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].workShift.toString(), me.workShifts);
				if (index != undefined) 
					me.employeeWorkShift.select(index, me.employeeWorkShift.focused);
				
				//me.employeeBenefitsPercentage.setValue(me.employeeGenerals[0].benefitsPercentage);
				
				me.employeeAlternatePayRateA.setValue(me.employeeGenerals[0].alternatePayRateA);
				me.employeeAlternatePayRateB.setValue(me.employeeGenerals[0].alternatePayRateB);
				me.employeeAlternatePayRateC.setValue(me.employeeGenerals[0].alternatePayRateC);
				me.employeeAlternatePayRateD.setValue(me.employeeGenerals[0].alternatePayRateD);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].deviceGroup.toString(), me.deviceGroupTypes)
				if (index != undefined) 
					me.employeeDeviceGroup.select(index, me.employeeDeviceGroup.focused);
				
				$("#EmployeeRateChangeDate").text(me.employeeGenerals[0].rateChangeDate);
				
				//Payroll
				
				me.federalExemptions.setValue(me.employeeGenerals[0].federalExemptions);
				me.payrollCompany = me.employeeGenerals[0].payrollCompany;
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].federalAdjustmentType.toString(), me.federalAdjustments);
				if (index <= 0 && index == null)
					me.federalAdjustmentType.select(0, me.federalAdjustmentType.focused);
				else
					me.federalAdjustmentType.select(index, me.federalAdjustmentType.focused);
					
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].maritalStatusFederalTaxType.toString(), me.maritalStatusFederalTaxTypes);
				if (index != undefined)
					me.maritalStatusFederalTaxType.select(index, me.maritalStatusFederalTaxType.focused);	
					
				me.federalAdjustmentAmount.setValue(me.employeeGenerals[0].federalAdjustmentAmount);
				me.stateExemptions.setValue(me.employeeGenerals[0].stateExemptions);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].primaryState.toString(), me.stateTypes);
				if (index >= 0 && index != null)
					me.primaryTaxState.select(index, me.primaryTaxState.focused);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].secondaryState.toString(), me.stateTypes);						
				if (index >= 0 && index != null)
					me.secTaxState.select(index, me.secTaxState.focused);	
				
				//me.stateAdjustmentAmount.setValue(this.stateAdjustmentAmount.replace(".0","").replace(".00",""));
				me.stateAdjustmentAmount.setValue(me.employeeGenerals[0].stateAdjustmentAmount);
					
				me.stateSDIAdjustRate.setValue(me.employeeGenerals[0].sdiRate);
				me.localTaxAdjustmentAmount.setValue(me.employeeGenerals[0].localTaxAdjustmentAmount);
				
				me.primaryTaxStateSelect();
			
				if (parseInt(me.employeeGenerals[0].secondaryState) > 0) {
					me.secMaritalStatusSelect();					
				}

				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].basicLifeIndicatorType.toString(), me.basicLifeIndicatorTypes);
				if (index != undefined) 
					me.basicLifeIndicatorType.select(index, me.basicLifeIndicatorType.focused);
				
				me.validateEmployeeDetails();				
				me.hireDateAccessSetup();	
				me.effectiveDateAccessSetup();

				setTimeout(function() { 
					me.resizeControls();
				}, 100);
			}
									
			if (me.employeeGeneralId <= 0) {
				
				me.employeeStatusType.select(1);
								
				me.setDropListSelectedValueByTitle("jobStartChange", "new hire");
				me.setDropListSelectedValueByTitle("rateChange", "new hire");	
				
				$("#JobChangeReasonText").attr('disabled', true);
				$("#JobChangeReasonAction").removeClass("iiInputAction");
				
				$("#EmployeeRateChangeReasonText").attr('disabled', true);
				$("#EmployeeRateChangeReasonAction").removeClass("iiInputAction");
				
				me.actionEmployeeStatusChanged(); //also get corresponding Status Category.				
			}
			else {
				$("#JobChangeReasonText").attr('disabled', false);
				$("#JobChangeReasonAction").addClass("iiInputAction");
			}
			
			if (me.actionType == "Rehire") {
				me.setDropListSelectedValueByTitle("jobStartChange", "Rehire");
				me.setDropListSelectedValueByTitle("rateChange", "Rehire");	
				$("#EmployeeRateChangeReasonText").attr('disabled', true);
				$("#EmployeeRateChangeReasonAction").removeClass("iiInputAction");
				$("#JobChangeReasonText").attr('disabled', true);
				$("#JobChangeReasonAction").removeClass("iiInputAction");	
			}
			
			if (me.actionType == "HouseCodeTransfer") {
				me.setDropListSelectedValueByTitle("jobStartChange", "Transfer");
				me.setDropListSelectedValueByTitle("rateChange", "Transfer");	
				$("#EmployeeRateChangeReasonText").attr('disabled', true);
				$("#EmployeeRateChangeReasonAction").removeClass("iiInputAction");
				$("#JobChangeReasonText").attr('disabled', true);
				$("#JobChangeReasonAction").removeClass("iiInputAction");	
			}
			
			if (me.actionType == "Termination" || me.actionType == "ReverseTermination") {
				if (me.actionType == "Termination")
					me.setDropListSelectedValueByTitle("employeeStatus", "Terminated");
				else if (me.actionType == "ReverseTermination")
					me.setDropListSelectedValueByTitle("employeeStatus", "Active");

				$("#EmployeeGeneralStatusTypeText").attr('disabled', true);
				$("#EmployeeGeneralStatusTypeAction").removeClass("iiInputAction");

				me.employeeStatusCategoryType.fetchingData();
				me.statusCategoryTypeStore.fetch("userId:[user],statusTypeId:" + me.statusTypes[me.employeeStatusType.indexSelected].id + ",", me.employeeStatusCategorysLoaded, me);
			}

			if (me.actionType == "NewHire" || me.actionType == "Rehire" || me.actionType == "Termination" || me.actionType == "ReverseTermination") {
				$("#EmailText").attr('disabled', false);
				$("#HomePhoneText").attr('disabled', false);
				$("#FaxText").attr('disabled', false);
				$("#PagerText").attr('disabled', false);
				$("#CellPhoneText").attr('disabled', false);
			}
			
			if (me.actionType == "State Tax")
				me.setSecondaryTaxStateLabel();

			if (me.anchorSave.state == ui.cmn.behaviorStates.disabled) {
				me.anchorSave.display(ui.cmn.behaviorStates.enabled);
				$("#AnchorSave").attr("title", "");
			}

			if (!me.employeeWizardEditFMLALOA && me.employeeGenerals.length > 0) {
				var title = me.findTitleById(me.employeeGenerals[0].statusType, me.statusTypes);
				if (title == "FMLA_LOA" || title == "Leave Of Absence") { //To disable save button if employee status is FMLA_LOA or LOA.
					me.anchorSave.display(ui.cmn.behaviorStates.disabled);
					$("#AnchorSave").attr("title", "You can not edit this Employee as its status is FMLA/LOA.");
				}
			}
			else if (me.employeeGenerals.length > 0) {
				var title = me.findTitleById(me.employeeGenerals[0].statusType, me.statusTypes);

				if (title == "Terminated" && (!(me.actionType == "Person" || me.actionType == "Rehire"
					|| me.actionType == "HouseCodeTransfer" || me.actionType == "ReverseTermination"))) {
					me.anchorSave.display(ui.cmn.behaviorStates.disabled);
				}
				else if (title == "Terminated" && me.actionType == "Person") {
					var terminationYear = new Date(me.employeeGenerals[0].terminationDate).getFullYear();
					var currentYear = new Date(parent.fin.appUI.glbCurrentDate).getFullYear();
					var disabled = (terminationYear == currentYear ? false : true);

					$("#EmailText").attr('disabled', disabled);
					$("#HomePhoneText").attr('disabled', disabled);
					$("#FaxText").attr('disabled', disabled);
					$("#PagerText").attr('disabled', disabled);
					$("#CellPhoneText").attr('disabled', disabled);
				}
			}

			me.status = "";
		},
		
		effectiveDateLoaded: function(me, activeId) {

			me.employeeTerminationDate.setValue("");
			me.employeeTerminationReason.select(0, me.employeeTerminationReason.focused);
			me.separationCode.select(0, me.separationCode.focused);

			if (me.employeeHistories.length > 0) {
				var effectiveDate = me.employeeHistories[0].previousFieldValue;
				effectiveDate = new Date($.trim(effectiveDate.replace("12:00AM", "")));
				me.employeeEffectiveDate.setValue((effectiveDate.getMonth() + 1) + "/" + effectiveDate.getDate() + "/" + effectiveDate.getFullYear());
			}

			me.employeeHistoryStore.fetch("userId:[user],employeeNumber:" + me.employees[0].employeeNumber + ",fieldName:EmpStatusCategoryType", me.statusCategoryTypeLoaded, me);
		},
		
		statusCategoryTypeLoaded: function(me, activeId) {
			
			if (me.employeeHistories.length > 0) {
				var index = ii.ajax.util.findIndexById(me.employeeHistories[0].previousFieldValue, me.statusCategoryTypes);
				if (index != undefined) {
					me.employeeStatusCategoryType.select(index, me.employeeStatusCategoryType.focused);
				}
				$("#EmployeeStatusCategoryTypeText").attr('disabled', true);
				$("#EmployeeStatusCategoryTypeAction").removeClass("iiInputAction");
			}
		},
		
		primaryTaxStateSelect: function() {	
			var me = this;	
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0);
			
			if (primaryTaxState == 0) {
				me.secMaritalStatusSelect();
			}
			me.employeeStateAdjustmentType.fetchingData();
			me.stateAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.stateAdjustmentLoaded, me);
			me.setStateAdditionalInfo("Primary");
		},
		
		stateAdjustmentLoaded: function(me, activeId) {
			var index = 0;
			ii.trace("Employee State Adjustment Type Loaded", ii.traceTypes.information, "Info");
			me.employeeStateAdjustmentType.setData([]);

			if (me.stateAdjustmentTypes.length == 0)
				me.stateAdjustmentTypes.unshift(new fin.emp.StateAdjustmentType({id: 0, number: 0, name: "None"}));

			me.employeeStateAdjustmentType.setData(me.stateAdjustmentTypes);
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].stateAdjustmentType.toString(), me.stateAdjustmentTypes);
			else
				index = 0;
			if (index <= 0 && index == null) {
				me.employeeStateAdjustmentType.select(0, me.employeeStateAdjustmentType.focused);
			}
			else			
				me.employeeStateAdjustmentType.select(index, me.employeeStateAdjustmentType.focused);	
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0)
			
			me.maritalStatusStateTaxTypePrimary.fetchingData();
			me.maritalStatusStateTaxTypePrimaryStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.priMaritalStatusLoaded, me);	
		},	
		
		priMaritalStatusLoaded: function(me, activeId) {
			var index = 0;
			
			me.maritalStatusStateTaxTypePrimary.setData([]);
			
			//if(me.maritalStatusStateTaxTypePrimarys.length == 0)
				//me.maritalStatusStateTaxTypePrimarys.unshift(new fin.emp.MaritalStatusType({id: 0, number: 0, name: "None"}));
						
			me.maritalStatusStateTaxTypePrimary.setData(me.maritalStatusStateTaxTypePrimarys);
			
			ii.trace("Marital StatusType Primary Loaded", ii.traceTypes.information, "Info");
			
			if (me.employeeGenerals.length > 0) {
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].primaryMaritalStatusType.toString(), me.maritalStatusStateTaxTypePrimarys);
				if (index != undefined) {
					me.maritalStatusStateTaxTypePrimary.select(index, me.maritalStatusStateTaxTypePrimary.focused);
				}
			}
		
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0)
			
			me.stateSDIAdjustType.fetchingData();
			me.sdiAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.sdiAdjustmentTypeLoaded, me);	
		},
		
		sdiAdjustmentTypeLoaded: function(me, activeId) {
			me.stateSDIAdjustType.setData([]);
			
			if (me.sdiAdjustmentTypes.length == 0)
				me.sdiAdjustmentTypes.unshift(new fin.emp.SDIAdjustmentType({id: 0, number: 0, name: "None"}));

			me.stateSDIAdjustType.setData(me.sdiAdjustmentTypes);	
			
			ii.trace("State SDI Adjust Type Loaded", ii.traceTypes.information, "Info");
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].sdiAdjustmentType.toString(), me.sdiAdjustmentTypes);
			else
				index = 0;	
			if (index <= 0 && index == null) {
				me.stateSDIAdjustType.select(0, me.stateSDIAdjustType.focused);
			}
			else 
				me.stateSDIAdjustType.select(index, me.stateSDIAdjustType.focused);
						
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0)
			
			me.localTaxAdjustmentType.fetchingData();
			me.localTaxAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.localTaxAdjustmentTypeLoaded, me);	
		},
		
		localTaxAdjustmentTypeLoaded: function(me, activeId) {
			me.localTaxAdjustmentType.setData([]);
			
			if (me.localTaxAdjustmentTypes.length == 0)
				me.localTaxAdjustmentTypes.unshift(new fin.emp.LocalTaxAdjustmentType({id: 0, number: 0, name: "None"}));

			me.localTaxAdjustmentType.setData(me.localTaxAdjustmentTypes);
			
			ii.trace("Local Tax Adjustment Type Loaded", ii.traceTypes.information, "Info");
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxAdjustmentType.toString(), me.localTaxAdjustmentTypes);
			else
				index = 0;	
			if (index <= 0 && index == null) {
				me.localTaxAdjustmentType.select(0, me.localTaxAdjustmentType.focused);
			}
			else
				me.localTaxAdjustmentType.select(index, me.localTaxAdjustmentType.focused);
			
			if (me.employeePayrollCompany.indexSelected > -1) {
				if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected]) {
					me.payrollCompany = me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].id;
				}
			}
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0);
			me.typesLoaded = false;
			me.localTaxCode1.fetchingData();
			me.localTaxCode2.fetchingData();
			me.localTaxCode3.fetchingData();
			me.localTaxCodeStore.fetch("payrollCompany:" + me.payrollCompany + ",appState:" + primaryTaxState + ",userId:[user]", me.localTaxCodesLoaded, me);	
		},
		
		localTaxCodesLoaded: function(me, activeId) {
			
			me.localTaxCode1.setData([]);
			me.localTaxCode1.reset();
			me.typeNoneAdd(me.localTaxCodes);	
			me.localTaxCode1.setData(me.localTaxCodes);			

			ii.trace("Local Tax Code1 Loaded", ii.traceTypes.information, "Info");

			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode1.toString(), me.localTaxCodes);
			else
				index = 0;	
			if (index >= 0 && index != null)
				me.localTaxCode1.select(index, me.localTaxCode1.focused);
			else	
				me.localTaxCode1.select(0, me.localTaxCode1.focused);
				
			me.localTaxCode2.setData([]);
			me.localTaxCode2.setData(me.localTaxCodes);			
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode2.toString(), me.localTaxCodes);
			else
				index = 0;	
			if (index >= 0 && index != null)
				me.localTaxCode2.select(index, me.localTaxCode2.focused);
			else
				me.localTaxCode2.select(0, me.localTaxCode2.focused);	
			
			me.localTaxCode3.setData([]);
			me.localTaxCode3.setData(me.localTaxCodes);
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode3.toString(), me.localTaxCodes);
			else	
				index = 0;	
			if (index >= 0 && index != null)
				me.localTaxCode3.select(index, me.localTaxCode3.focused);
			else
				me.localTaxCode3.select(0, me.localTaxCode3.focused);
			
			me.typesLoaded = true;
			$("#pageLoading").hide();
		},
		
		secMaritalStatusSelect: function() {
			var me = this;
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0);
			
			if (primaryTaxState == 0) {
				secTaxState = 0;
				me.secTaxState.select(0, me.secTaxState.focused);
			}
			else {
				secTaxState = (me.secTaxState.indexSelected >= 0 ? me.stateTypes[me.secTaxState.indexSelected].id : 0);
			}			
			
			if (secTaxState == 0) {	
				$("#MaritalStatusStateTaxTypeSecondaryAction").removeClass("iiInputAction");	
				me.maritalStatusStateTaxTypeSecondary.text.readOnly = true;
				$("#MaritalStatusStateTaxTypeSecondaryText").val("None");
				$("#pageLoading").hide();
				return true;
			}
			else {
				$("#MaritalStatusStateTaxTypeSecondaryAction").addClass("iiInputAction");	
				me.maritalStatusStateTaxTypeSecondary.text.readOnly = false;
				me.maritalStatusStateTaxTypeSecondary.fetchingData();
				me.maritalStatusStateTaxTypeSecondaryStore.fetch("appState:" + secTaxState + ",userId:[user]", me.secMaritalStatusLoaded, me);
			}	
			
			me.setStateAdditionalInfo("Secondary");			
			ii.trace("SecMarital Status Select Loaded", ii.traceTypes.information, "Info");		
		},
		
		secMaritalStatusLoaded: function(me, activeId) {
			
			me.maritalStatusStateTaxTypeSecondary.setData([]);
			me.maritalStatusStateTaxTypeSecondary.setData(me.maritalStatusStateTaxTypeSecondarys);
			
			ii.trace("Marital Status Types Secondary Loaded", ii.traceTypes.information, "Info");
			
			if (me.employeeGenerals.length > 0)
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].secondaryMaritalStatusType.toString(), me.maritalStatusStateTaxTypeSecondarys);
			else
				index = 0;
			if (index <= 0 && index == null)
				me.maritalStatusStateTaxTypeSecondary.select(0, me.maritalStatusStateTaxTypeSecondary.focused);
			else
				me.maritalStatusStateTaxTypeSecondary.select(index, me.maritalStatusStateTaxTypeSecondary.focused);
			
			$("#pageLoading").hide();
		},
		
		actionEmployeeTerminationChanged: function() {
			var me =  this;
			
			if (me.employeeTerminationReason.indexSelected < 0) return;
			
			me.separationCode.fetchingData();
			me.separationCodeStore.fetch("userId:[user],terminationType:" + me.terminationReasons[me.employeeTerminationReason.indexSelected].id + ",", me.terminationReasonChangedLoaded, me);						
		},
		
		terminationReasonChangedLoaded:	function(me, activeId) {
			
			me.separationCode.reset();
			me.separationCodes.unshift(new fin.emp.SeparationCode({ id: 0, number: 0, name: "None" }));
			me.separationCode.setData(me.separationCodes);
			
			if (me.employeeGenerals.length > 0) {
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].separationCode.toString(), me.separationCodes)
				if (index != undefined) 
					me.separationCode.select(index, me.separationCode.focused);
			}
		},
		
		houseCodeTemplateChanged: function() { 
			var args = ii.args(arguments,{});			
			var me = this;	
			
			if (me.employeeGeneralId > 0) {
				if(me.employeeGenerals[0].hcmHouseCode != me.houseCodeSearchTemplate.houseCodeIdTemplate) {
					me.houseCodeChangedFlag = true;
					ii.trace("Employee General: HouseCode Changed", ii.traceTypes.information, "Info");
				}
				else {
					me.houseCodeChangedFlag = false;
					ii.trace("Employee General: HouseCode Reset", ii.traceTypes.information, "Info");
				}
			}
			else {
				me.houseCodeChangedFlag = false;
			}	
				
			me.hirNode = me.houseCodes[0].hirNode;	
			
			me.job.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate, me.houseCodeJobsLoaded, me);
			
			me.employeePayrollCompany.fetchingData();
			me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
			
			me.employeeEffectiveDate.setValue(me.currentDate());
			me.jobEffectiveDate.setValue(me.currentDate());
			me.compensationEffectiveDate.setValue(me.currentDate());

			ii.trace("Checking for House Code State Min Wage", ii.traceTypes.information, "Info");
			me.houseCodeStateMinimumWageStore.fetch("houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate, me.houseCodeStateMinimumWagesLoaded, me);			
		},
		
		houseCodeSearchTemplateLoaded: function(me, activeId) {
			
			$("#houseCodeTemplateText").val(parent.fin.appUI.houseCodeTitle);			
			me.houseCodeSearchTemplate.houseCodeIdTemplate = parent.fin.appUI.houseCodeId;
			me.houseCodeSearchTemplate.hirNodeTemplate = parent.fin.appUI.hirNode;	
			
			me.job.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate, me.houseCodeJobsLoaded, me);
			me.houseCodeStateMinimumWageStore.fetch("houseCodeId:" + me.houseCodeSearchTemplate.houseCodeIdTemplate, me.houseCodeStateMinimumWagesLoaded, me);			
			
			if (me.employeeGeneralId == 0) {//executed for new employee
				me.employeePayrollCompany.fetchingData();
				me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
			}				
		},
		
		/*houseCodeChanged: function() {
			var me = this;

			ii.trace("house Code changed.", ii.traceTypes.information, "Information");
			me.houseCodeStateMinimumWageStore.fetch("houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeStateMinimumWagesLoaded, me);			
		},*/
		
		houseCodeWizardSetup: function(me, activeId) {

			parent.fin.appUI.unitId = me.houseCodes[0].appUnit;
			parent.fin.appUI.houseCodeId = me.houseCodes[0].id;
			parent.fin.appUI.houseCodeTitle = me.houseCodes[0].name;
			parent.fin.appUI.houseCodeBrief = me.houseCodes[0].brief;
			parent.fin.appUI.hirNode = me.houseCodes[0].hirNode;

			ii.trace("House Code Changed", ii.traceTypes.information, "Info");
			me.houseCodeStateMinimumWageStore.fetch("houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeStateMinimumWagesLoaded, me);
			
			me.fetchData();
		},
		
		effectiveDateAccessSetup: function() {
			var me = this;

			if ((me.employeeGeneralAreaChanged == true && me.employeeGeneralId > 0) 
				|| me.employeeGeneralId == 0) {
				$("#EmployeeEffectiveDateText").attr('disabled', false);
				$("#EmployeeEffectiveDateAction").addClass("iiInputAction");
				me.employeeGeneralAreaChanged = false;
			}
			else {
				$("#EmployeeEffectiveDateAction").removeClass("iiInputAction");
				$("#EmployeeEffectiveDateText").attr('disabled', true);
			}
			
			me.employeeEffectiveDate.resizeText();			
		},
		
		houseCodePayrollCompanysLoaded: function(me, activeId) {

			me.employeePayrollCompany.reset();
			me.employeePayrollCompany.setData(me.houseCodePayrollCompanys);
			
			ii.trace("Employee General: Payroll Company Loaded", ii.traceTypes.information, "Info");	
			
			if (me.employeeGenerals.length > 0) {
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].payrollCompany.toString(), me.houseCodePayrollCompanys)
				if (index != undefined) 
					me.employeePayrollCompany.select(index, me.employeePayrollCompany.focused);
			}
			me.actionPerPayPeriodReset();
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
			
			if (me.houseCodeJobs.length <= 0) return;
			
			me.job.reset();
			me.job.setData(me.houseCodeJobs);
			
			if (me.employeeGenerals.length > 0) {
				ii.trace("Setting HouseCode Job", ii.traceTypes.Information, "Info");
				var index = ii.ajax.util.findIndexById(me.employeeGenerals[0].houseCodeJob.toString(), me.houseCodeJobs)
				if (index != undefined) 
					me.job.select(index, me.job.focused);
			}

			if (me.actionType == "NewHire") {
				ii.trace("Setting Default HouseCode Job", ii.traceTypes.Information, "Info");
				me.job.select(0, me.job.focused);
			}
		},
		
		payRateChanged: function() {
			var me = this;
			
			if (me.employeeGenerals.length > 0) {
				if (me.employeeGenerals[0].payRate != parseInt(me.employeePayRate.getValue())) {
					me.payRateChangeReasonsUpdate("payRateChange");
					me.employeePayRateChanged = true;
					if (me.actionType == "Compensation") {
						me.compensationEffectiveDate.text.value = me.currentDate();
					}
				}
				else {
					me.payRateChangeReasonsUpdate("");
					me.employeePayRateChanged = false;
				}
			}
		},
		
		payRateTypeChanged: function() {
			var me = this;

			if (me.employeeGenerals.length == 0 || me.employeePayrollCompany.indexSelected < 0) return;
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly &&
				me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
			
				if (me.employeeGenerals[0].hourly && $("input[name='HourlyRate']:checked").val() == "true")
					//changed from Hourly to Salaried
					me.payRateChangeReasonsUpdate("payRateTypeChange");
			}
		},
		
		payFrequencyChanged: function() {
			var me = this;
			
			if (me.employeeGenerals.length == 0 || me.employeePayrollCompany.indexSelected < 0) return;

			var index = me.findIndexByTitle(me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType, me.payFrequencyTypes);
			
			if (parseInt(me.employeeGenerals[0].frequencyType) != me.payFrequencyTypes[index].id)
				me.payRateChangeReasonsUpdate("payFrequencyChange");
			else
				me.payRateChangeReasonsUpdate("");	
						
			if (me.employeePayrollCompany.indexSelected >= 0) {
				me.compensationEffectiveDate.setValue(me.currentDate());
			}
			
			me.validateAttribute = 'payPeriod'; //validation for multiple popup	
			me.validateEmployeeDetails(); //introduced to get PayPeriod for selected Company payFrequency.
		},
		
		scheduledHoursChanged: function() {
			var me = this;
			
			if (me.employeeGenerals.length > 0) {
				if (me.employeeGenerals[0].scheduledHours > parseInt(me.employeeScheduledHours.getValue())) {
					me.payRateChangeReasonsUpdate("scheduledHoursDecrease");
					if (me.actionType == "Compensation") {
						me.compensationEffectiveDate.text.value = me.currentDate();
					}
				}
				else if (me.employeeGenerals[0].scheduledHours < parseInt(me.employeeScheduledHours.getValue())) {
					me.payRateChangeReasonsUpdate("scheduledHoursIncrease");
					if (me.actionType == "Compensation") {
						me.compensationEffectiveDate.text.value = me.currentDate();
					}						
				}
				else 
					me.payRateChangeReasonsUpdate("");
			}
		},
		
		actionEmployeeJobCodeChanged: function() {
			var me = this;
			
			if (me.employeeGeneralId > 0) { //if not a NEW Employee
				
				if (me.employeeGenerals[0].jobCode != me.jobCodeTypes[me.employeeJobCode.indexSelected].number) {
					me.houseCodeJobChanged = true;
					if (me.actionType != "Rehire" && me.actionType != "HouseCodeTransfer")
						me.jobStartReasonChange();
					if (me.actionType == "Job Information") {
						me.jobEffectiveDate.text.value = me.currentDate();
					}
				}
				else {
					me.houseCodeJobChanged = false;
				}
			}
		},		
		
		actionEmployeeStatusChanged: function() {
			var me = this;			
			
			if (me.employeeStatusType.indexSelected < 0) return;
			
			me.employeeStatusCategoryType.fetchingData();
			me.statusCategoryTypeStore.fetch("userId:[user],statusTypeId:" + me.statusTypes[me.employeeStatusType.indexSelected].id + ",", me.employeeStatusCategorysLoaded, me);
			
			if (me.statusTypes[me.employeeStatusType.indexSelected].name == 'Terminated') {
				//$('#EmployeeActiveYes').attr('checked', false);
				$('#EmployeeActiveNo').attr('checked', true);

				//Warn ..if User try to Tearminate an Employee who was hired in same Pay Period..
				if (me.compareDate(me.employeeHireDate.text.value, me.payPeriodStartDate) >= 0 
					&& me.compareDate(me.employeeHireDate.text.value, me.payPeriodEndDate) <= 0
					&& me.employeeGeneralId > 0) {
					alert('You cannot terminate an employee in the same pay period the employee was hired. \n' 
						+ 'Contact the Corporate Payroll department for further instructions.'); 

					me.alertMessage = me.alertMessage + 1;
				}
			}
			else {
				$('#EmployeeActiveYes').attr('checked', true);
				//$('#EmployeeActiveNo').attr('checked', false);
				
				if (me.employeeGeneralId <= 0) return;
				
				//if status is changed from FMLA_LOA/Terminated to Active
				//clear HireDate and prompt user to assign new date within current period.
				if (me.employeeStatusType.text.value.toLowerCase() == 'active'
					&& (me.employeeGenerals[0].statusType == "2" || me.employeeGenerals[0].statusType == "6")) {

					me.employeeHireDate.setValue("");
					me.jobEffectiveDate.setValue("");
					me.compensationEffectiveDate.setValue(""); 
					
					//Warn ..if User try to Rehire an Employee who was Tearminated in same Pay Period..
					if (me.employeeGenerals[0].terminationDate.toString() != "" &&
						me.isDateValid(me.employeeGenerals[0].terminationDate.toString(), 'Rehire') == false) {
						//alert('Employee was Tearminated in the same Pay Period. Please verify before Rehire.');
						alert('You cannot hire an employee in the same pay period the employee was Terminated. \n' 
							+ 'Contact the Corporate Payroll department for further instructions.');		
					}					
					
					me.setDropListSelectedValueByTitle("jobStartChange", "rehire");
					me.setDropListSelectedValueByTitle("rateChange", "rehire");	
									
					me.hireDateAccessSetup();
				}
			}
		},
		
		employeeStatusCategorysLoaded: function(me, activeId) {

			me.employeeStatusCategoryType.reset();
			me.employeeStatusCategoryType.setData(me.statusCategoryTypes);

			if (me.employeeGenerals.length > 0) {
				var index = ii.ajax.util.findIndexById(me.employeeGenerals[0].statusCategoryType.toString(), me.statusCategoryTypes);
				if (index != undefined) {
					me.employeeStatusCategoryType.select(index, me.employeeStatusCategoryType.focused);
				}

				if (me.actionType == "Rehire") {
					me.setDropListSelectedValueByTitle("employeeStatusCategory", "Full Time");
				}
				else if (me.actionType == "Termination") {
					var scheduledHours = parseFloat(me.employeeGenerals[0].scheduledHours);

					if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType == "Bi-Weekly")
						scheduledHours = scheduledHours / 2;

					if (scheduledHours >= 30)
						me.setDropListSelectedValueByTitle("employeeStatusCategory", "Full Time");
					else
						me.setDropListSelectedValueByTitle("employeeStatusCategory", "Part Time");

					$("#EmployeeStatusCategoryTypeText").attr('disabled', true);
					$("#EmployeeStatusCategoryTypeAction").removeClass("iiInputAction");
				}
				else if (me.actionType == "ReverseTermination") {
					me.employeeHistoryStore.fetch("userId:[user],employeeNumber:" + me.employees[0].employeeNumber + ",fieldName:EmpEmpgEffectiveDate", me.effectiveDateLoaded, me);
				}		
			}

			ii.trace("Employee Status Category Loaded 2", ii.traceTypes.information, "Info");
		},
		
		payRateChangeReasonsUpdate: function() {
			var args = ii.args (arguments, {
				changeReason: {type: String}
			});			
			var me = this;
			
			return; //Rate change reason update not required for now as per Matt email dtd. 21 Sept 2010.
			//as there was a question what if more than one confition triggers change event.
			
			if (args.changeReason == "payRateChange") {
				me.rateChangeReasonStore.fetch("changeReason:PayRateChange,userId:[user],", me.rateChangeReasonsLoaded, me);
			}
			else if (args.changeReason == "payRateTypeChange") {
				me.rateChangeReasonStore.fetch("changeReason:PayRateTypeChange,userId:[user],", me.rateChangeReasonsLoaded, me);
			}			
			else if (args.changeReason == "payFrequencyChange") {
				me.rateChangeReasonStore.fetch("changeReason:PayFrequencyChange,userId:[user],", me.rateChangeReasonsLoaded, me);
			}
			else if (args.changeReason == "scheduledHoursDecrease") {
				me.rateChangeReasonStore.fetch("changeReason:ScheduledHoursDecrease,userId:[user],", me.rateChangeReasonsLoaded, me);
			}
			else if (args.changeReason == "scheduledHoursIncrease") {
				me.rateChangeReasonStore.fetch("changeReason:ScheduledHoursIncrease,userId:[user],", me.rateChangeReasonsLoaded, me);
			}
			else{
				me.rateChangeReasonStore.fetch("userId:[user],", me.rateChangeReasonsLoaded, me);				
			}
		},
		
		rateChangeReasonsLoaded: function(me, activeId) { //TODO read this from DB			
			me.rateChangeReasonSetData();
		},
		
		setSeniorityDate: function() {
			var me = this;
			
			if (me.employeeStatusType.text.value == "Rehired") {
						
				var hireDate = new Date(me.employeeHireDate.text.value);
				var originalHireDate = new Date(me.employeeOriginalHireDate.text.value);
			
				originalHireDate.setMonth(originalHireDate.getMonth() + 6);
					
				if (hireDate > originalHireDate)
					me.employeeSeniorityDate.setValue(me.employeeHireDate.text.value);
				else
					me.employeeSeniorityDate.setValue(me.employeeOriginalHireDate.text.value);
			}
			else if (me.actionType == "NewHire") {
				if (me.employeeSeniorityDate.text.value == "")
					me.employeeSeniorityDate.setValue(me.employeeOriginalHireDate.text.value + '');
			}
			else 
				me.employeeSeniorityDate.setValue(me.employeeOriginalHireDate.text.value);
		},
		
		isEmployeeNewhired: function() {
			var me = this;
			
			return (me.jobChangeReason.text.value.toLowerCase() == 'new hire' && me.employeeGeneralId == 0)
		},

		isEmployeeRehired: function() {
			var me = this;
			
			return (me.jobChangeReason.text.value.toLowerCase() == 'rehire')
		},
		
		findIndexByTitle: function ii_ajax_util_findIndexByTitle() {
			var args = ii.args(arguments, {
				title: {type: String},	// The id to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});		
			var title = args.title;
			var data = args.data;
			
			for (var index = 0; index < data.length; index++ ) {
				if (data[index].name.toLowerCase() == title.toLowerCase()) {
					return index; 
				}
			}			
			return null;
		},
		
		//TODO tobe removed
		findIdByTitle: function ii_ajax_util_findIdByTitle() {
			var args = ii.args(arguments, {
				title: {type: String},	// The id to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});		
			var title = args.title;
			var data = args.data;
			
			for (var index = 0; index < data.length; index++ ) {
				if (data[index].name == title) {
					return data[index].id;
				}
			}
			return null;
		},
		
		findTitleById: function() {
			var args = ii.args(arguments, {
				id: {type: Number},	// The id to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});		
			var id = args.id;
			var data = args.data;
			
			for (var index = 0; index < data.length; index++ ) {
				if (data[index].id == id) {
					return data[index].name;
				}
			}
			return "";
		},
		
		jobStartReasonChange: function() {
			var args = ii.args(arguments, {
				reset: {type: Boolean, required:false}
			});			
			var me = this;
			
			if (me.houseCodeChangedFlag == true && me.houseCodeJobChanged == true) {
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:HousecodeJobcodeChange", me.jobStartReasonsLoaded, me);
			}
			else if (me.houseCodeChangedFlag == true) {
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:HousecodeChange", me.jobStartReasonsLoaded, me);				
			}
			else if (me.houseCodeJobChanged == true) {
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:JobcodeChange", me.jobStartReasonsLoaded, me);				
			}
			else if (args.reset) {
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],", me.jobStartReasonsLoaded, me);				
			}
			else {
				me.jobStartReasonsLoaded(me, 0);
			}
		},
		
		jobStartReasonsLoaded: function(me, activeId) {
			me.jobChangeReasonSetData();

			if (me.employeeGeneralId <= 0) {
				me.setDropListSelectedValueByTitle("jobStartChange", "new hire");
				me.setDropListSelectedValueByTitle("rateChange", "new hire");
			}
		},
		
		jobChangeReasonChanged: function() {
			var me = this;
			
			if (me.jobChangeReason.text.value == 'Rehire') {
				me.separationCode.select(0, me.separationCode.focused);
				me.employeeTerminationReason.select(0, me.employeeTerminationReason.focused);
				me.employeeTerminationDate.setValue("");
				
				me.employeeStatusType.reset();
				me.employeeStatusType.setData(me.statusTypes);					
				me.employeeStatusType.select(0, me.employeeStatusType.focused);					
				
				$('#EmployeeActiveYes').attr('checked', true);
			}
			
			me.hireDateAccessSetup();
		},
		
		hireDateAccessSetup: function() {
			var me = this;			
	
			if (me.jobChangeReason.text.value == "New hire" || me.actionType == "DateModification") {
				$("#EmployeeHireDateAction").addClass("iiInputAction");
				$("#EmployeeHireDateText").attr('disabled', false);				
			}			
			else if (me.jobChangeReason.text.value == 'Rehire' && me.employeeGeneralId > 0) {
				//2 = FMLA_LOA, 5 = Severance, 6 = Terminated
				if (me.employeeGenerals[0].statusType == 2 || me.employeeGenerals[0].statusType == 5 || me.employeeGenerals[0].statusType == 6) { 
					$("#EmployeeHireDateText").attr('disabled', false);
					$("#EmployeeHireDateAction").addClass("iiInputAction");
				}
				else {
					$("#EmployeeHireDateText").attr('disabled', true);
					$("#EmployeeHireDateAction").removeClass("iiInputAction");
				}
			}
			else {
				$("#EmployeeHireDateText").attr('disabled', true);
				$("#EmployeeHireDateAction").removeClass("iiInputAction");
			}

			me.employeeHireDate.resizeText();
		},
		
		effectiveDateAccessSetup: function() {
			var me = this;

			if ((me.employeeGeneralAreaChanged == true && me.employeeGeneralId > 0)
				|| me.employeeGeneralId == 0 || me.actionType == "DateModification") {
				$("#EmployeeEffectiveDateText").attr('disabled', false);
				$("#EmployeeEffectiveDateAction").addClass("iiInputAction");
				me.employeeGeneralAreaChanged = false;
			}
			else {
				$("#EmployeeEffectiveDateAction").removeClass("iiInputAction");
				$("#EmployeeEffectiveDateText").attr('disabled', true);
			}
			
			me.employeeEffectiveDate.resizeText();			
		},
		
		rateChangeReasonSetData: function() {
			//we already have filtering logic in place but some User action is not triggering it.
			var me = this;
			var index = 0;
			
			if (me.actionType == "Compensation") {
				index = me.findIndexByTitle("New Hire", me.rateChangeReasons);
				if (index > 0) 
					me.rateChangeReasons.splice(index, 1);
				
				index = me.findIndexByTitle("Rehire", me.rateChangeReasons);
				if (index > 0) 
					me.rateChangeReasons.splice(index, 1);
			}
			
			me.employeeRateChangeReason.reset();			
			me.employeeRateChangeReason.setData(me.rateChangeReasons);
		},
		
		jobChangeReasonSetData: function() {
			//we already have filtering logic in place but some User action is not triggering it.
			var me = this;
			var index = 0;
			
			if (me.actionType == "Job Information") {
				index = me.findIndexByTitle("New hire", me.jobStartReasonTypes);
				if (index > 0) 
					me.jobStartReasonTypes.splice(index, 1);
				
				index = me.findIndexByTitle("Rehire", me.jobStartReasonTypes);
				if (index > 0) 
					me.jobStartReasonTypes.splice(index, 1);
			}
			
			me.jobChangeReason.reset();
			me.jobChangeReason.setData(me.jobStartReasonTypes);
		},
		
		actionPerPayPeriodReset: function() {
			var me = this;
			var dollarPerPayPeriod = 0.00;
			var numberOfSalariesPerYear = 0;
			
			//me.rateChangeReasonSetData();			
			me.payPeriodWeeks = 1;
			
			if (me.employeePayrollCompany.indexSelected < 0 || !me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected]) 
				return;
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType == 'Weekly') {
				numberOfSalariesPerYear = 52;
				me.payPeriodWeeks = 1;
				index = me.findIndexByTitle("Weekly", me.payFrequencyTypes);
				$("#PayFrequencyType").text(me.payFrequencyTypes[index].name);
				me.payFrequencyType = me.payFrequencyTypes[index].id;				
			}
			else if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType == 'Bi-Weekly') {
				numberOfSalariesPerYear = 26;
				me.payPeriodWeeks = 2;
				index = me.findIndexByTitle("Bi-Weekly", me.payFrequencyTypes);
				$("#PayFrequencyType").text(me.payFrequencyTypes[index].name);
				me.payFrequencyType = me.payFrequencyTypes[index].id;					
			}
			
			$("#PayFrequencyType").text(me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType);	
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly == false &&
				me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
				$('#HourlyRateNo').attr('checked', true);
				$("#PayRateLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Annual Salary");
			}
			
			if ($("input[name='HourlyRate']:checked").val() == "true") {
				dollarPerPayPeriod = (parseFloat('0' + me.employeePayRate.getValue()) * parseFloat('0' + me.employeeScheduledHours.getValue()));
			}
			else 
				dollarPerPayPeriod = parseFloat(me.employeePayRate.getValue()) / numberOfSalariesPerYear;
			
			$("#DollarPerPayPeriodLabel").html("$" + dollarPerPayPeriod.toFixed(2));
		},
		
		employeeNumberChange: function() {
			var me = this;

			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly == false &&
				me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
				//Employee Number change - Start with 6.
				salNumber = $("#EmployeeNumberText").val();
				if (salNumber.substring(0, 1) == 6) return;
				me.employeeNewNumber = 6 + salNumber.substring(1, 10);
				me.empEmployeeNumberValidationStore.fetch("userId:[user],employeeNumber:" + me.employeeNewNumber + ",", me.employeeNewNumberLoaded, me);
			}
			else if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly &&
				me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary == false) {
				if (me.actionType == "NewHire") {
					//Employee Number change - Start with 4.
					salNumber = $("#EmployeeNumberText").val();
					if (salNumber.substring(0, 1) == 4) return;
					me.employeeNewNumber = 4 + salNumber.substring(1, 10);
					me.employeeNumber.setValue(me.employeeNewNumber);
				}
				else if (me.actionType == "HouseCodeTransfer")
					me.employeeNumber.setValue(me.employeeGenerals[0].employeeNumber);
			}			
		},

		employeeNewNumberLoaded: function(me, activeId) {

			if (me.empEmployeeNumberValidations.length > 0) {
				me.employeeNumber.setValue(me.employeeNewNumber);
				alert(me.employeeNewNumber + " Employee Number already exists.");
			}
			else {
				me.employeeNumber.setValue(me.employeeNewNumber);
				me.employeeEffectiveDateChanged();
			}
		},

		effectiveDateChange: function() {
			var me = this;
			
			//Warn ..if User try to Tearminate an Employee who was hired in same Pay Period..	
			me.employeeEffectiveDate.setValue(me.employeeTerminationDate.text.value);
			me.termEmployeeEffectiveDate.setValue(me.employeeTerminationDate.text.value);
		},
		
		validateEmployeeDetails: function fin_emp_UserInterface_validateEmployeeDetails() {
			var me = this;
			
			me.employeeValidationStore.fetch("userId:[user]" 
				+ ",hireDate:" + me.employeeHireDate.text.value 
				+ ",employeeId:" + me.employeeGeneralId
				+ ",ssn:" + me.employeeSSN.getValue().replace(/-/g,'')
				+ ",payFrequencyTypeId:" + me.payFrequencyType
				+ "," 
				, me.validationsLoaded, me);
		},

		validationsLoaded: function fin_emp_UserInterface_validationsLoaded(me, activeId) {	

			if (me.employeeValidations.length <= 0) return;
			
			me.employeeSSNAlreadyExists = false;

			if (me.employeeValidations[0].validSSN == false && me.validateAttribute == 'SSN') { //validation for multiple popup	
				alert("Employee with Social Security Number: " + me.employeeSSN.getValue() + " already exists in House Code " + me.employeeValidations[0].ssnHouseCode + "; contact Payroll if assistance is needed.");
				me.employeeSSNAlreadyExists = true;
			}
			else {
				if (me.employeeValidationCalledFrom == "ssnLookUp") 
					alert("SSN " + me.employeeSSN.getValue() + " does not exist in any other house code.");
			}			

			me.payPeriodStartDate = me.employeeValidations[0].payPeriodStartDate;
			me.payPeriodEndDate = me.employeeValidations[0].payPeriodEndDate;
			me.payRollEntries = me.employeeValidations[0].dailyPayrollEntries;
			
			if (me.employeeSSNAlreadyExists == false && me.employeeValidationCalledFrom == "newHire") {
				me.employeeValidationCalledFrom = "";
				me.actionNext(); //continue with Employee record edit..
			}

			me.employeeValidationCalledFrom = "";
			me.validateAttribute = "";
			me.employeeSSNAlreadyExists = false;
		},
		
		//this is to handle Payroll tab when Employee is new, called from EmployeeGeneral UI main.js
		showPayrollTab: function fin_emp_UserInterface_showPayrollTab() {
			var args = ii.args(arguments, {employeeGeneralId:{type: Number}});			
			var me = this;
			
			me.employeeGeneralId = args.employeeGeneralId;
			
			if (me.employeeGeneralId > 0)
				if(me.tabPayrollShow) $("#TabPayroll").show();
			else	
				$("#TabPayroll").hide();				
		},
		
		tabSelected: function fin_emp_UserInterface_tabSelected() {
			var args = ii.args(arguments, {id:{type: String}});
			var me = this;
			
			me.personId = $("iframe")[0].contentWindow.esm.pplPersonUi.personId;
	
			if (args.id == "TabPerson") {

				me.activeFrameId = 0;
				if (me.personNeedUpdate) {
					me.personNeedUpdate = false;
					$("iframe")[0].src = "/esm/ppl/person/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabUser") {

				me.activeFrameId = 1;
				if (me.userNeedUpdate) {
					me.userNeedUpdate = false;
					$("iframe")[1].src = "/esm/app/user/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabGeneral") {

				me.activeFrameId = 2;
				
				if ($("iframe")[2].contentWindow.fin != undefined) {
					var employeeGeneral = $("iframe")[2].contentWindow.fin.empGeneralUi;
					if (employeeGeneral != undefined) {
						if(employeeGeneral.employeeGenerals.length > 0 && employeeGeneral.employeeGenerals[0].primaryState == 0) {
							me.payrollNeedUpdate = true;				
						}
					}		
				}
				if (me.empGeneralNeedUpdate) {
					me.empGeneralNeedUpdate = false;
					$("iframe")[2].src = "/fin/emp/employeeGeneral/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabPayroll") {

				me.activeFrameId = 3;
				if (me.payrollNeedUpdate) {
					me.payrollNeedUpdate = false;					
					$("iframe")[3].src = "/fin/emp/employeePayroll/usr/markup.htm?personId=" + me.personId;
					$("#container-1").triggerTab(4);
					//$('#container-1').tabs(4);
				}
			}
			else if (args.id == "TabPTO") {

				me.activeFrameId = 4;
				if (me.ptoNeedUpdate) {
					me.ptoNeedUpdate = false;
					$("iframe")[4].src = "/fin/emp/employeePTO/usr/markup.htm?personId=" + me.personId;
				}
			}		
		},
		
		showOtherTabs: function fin_emp_UserInterface_showOtherTabs() {
			var me = this;			
			
			if (me.tabUserShow)
				$("#TabUser").show();
			
			if (me.tabGeneralShow) $("#TabGeneral").show();
			
			if (me.employeeGeneralId > 0)
				if(me.tabPayrollShow) $("#TabPayroll").show();
			else	
				$("#TabPayroll").hide();
				
			if (me.tabPTOShow) $("#TabPTO").show();

			if (me.tabUserShow) {
				$("#TabCollection li").removeClass("tabs-selected");
				$("#TabUser").parent().addClass("tabs-selected");
				
				$("#fragment-" + (me.activeFrameId + 1)).hide();
				$("#fragment-" + (me.activeFrameId + 2)).show();
				
				me.tabSelected('TabUser');
			}			
		},
		
		employeeEffectiveDateChanged: function fin_emp_UserInterface_employeeEffectiveDateChanged() {
			var me = this;
			me.employeeGeneralAreaChanged = false;

			if (me.employeeStatusCategoryType.indexSelected >= 0 || me.separationCode.indexSelected >= 0) {					
				me.employeeEffectiveDate.setValue(me.currentDate());							
				me.employeeGeneralAreaChanged = true;
			}
			
			if (me.employeeGenerals.length > 0) {
				if (me.employeeHireDate.text.value != me.employeeGenerals[0].hireDate
					|| me.employeeSSN.text.value != me.employeeGenerals[0].ssn
					|| me.employeeBrief.text.value != me.employeeGenerals[0].brief
					) {
					me.employeeEffectiveDate.setValue(me.currentDate());
					me.employeeGeneralAreaChanged = true;
				}				
			}
			
			me.effectiveDateAccessSetup();		
		},
		
		alternatePayRateChanged: function fin_emp_UserInterface_alternatePayRateChanged() {
			var me = this;
			
			if (me.actionType == "Compensation") {
				me.compensationEffectiveDate.text.value = me.currentDate();
			}						
		},
		
		jobChanged: function fin_emp_UserInterface_jobChanged() {
			var me = this;
			
			if (me.actionType == "Job Information") {
				me.jobEffectiveDate.text.value = me.currentDate();
			}								
		},
		
		actionNewEmployee: function fin_emp_UserInterface_actionNewEmployee() {
			var args = ii.args(arguments,{});			
			var me = this;

			me.personId = -1;
			me.employeeGeneralId = 0;
			me.employeePersonalId = 0;
			me.hirNode = 0;
			me.status = "new";
			me.personBrief = "";
			me.houseCodeChanged = false;
			me.firstTimeShow = false;
			
			me.personFirstName.setValue("");
			me.personLastName.setValue("");
			me.personMiddleName.setValue("");
			me.personAddressLine1.setValue("");
			me.personAddressLine2.setValue("");
			me.personCity.setValue("");
			me.personState.reset();
			me.personPostalCode.setValue("");
			me.personHomePhone.setValue("");
			me.personFax.setValue("");
			me.personCellPhone.setValue("");
			me.personEmail.setValue("");
			me.personPager.setValue("");

			if (!me.RMSESM) {
				$("#HouseCodeSearchDropDown").show();
				$("#HouseCodeSearchDropDownLabel").show();
			}
			
			me.employeeSSN.setValue("");		
			me.employeePayrollCompany.reset();	
			if (me.employeeStatusType.length > 0)
				me.employeeStatusType.select(0);
			else
				me.employeeStatusType.reset();	
			me.employeeStatusCategoryType.reset();			
			me.employeeHireDate.setValue("");
			me.employeeOriginalHireDate.setValue("");
			me.employeeSeniorityDate.setValue("");
			me.employeeEffectiveDate.setValue("");			
			me.employeeBirthDate.setValue("");
			me.employeeEthnicity.reset();
			me.employeeMaritalStatus.reset();
			me.employeeI9Status.reset();
			me.employeeVETSStatus.reset();
			
			me.jobEffectiveDate.setValue("");
			me.jobChangeReason.reset();
			me.employeeJobCode.reset();
			me.job.reset();
			me.employeeBackgroundCheckDate.setValue("");	
			me.employeeUnion.reset();
			
			me.compensationEffectiveDate.setValue("");	
			me.employeeRateChangeReason.reset();
			me.employeePayRate.setValue("");		
			me.employeeScheduledHours.setValue("");		
			me.employeeReviewDate.setValue("");		
			me.employeeWorkShift.reset();
			me.employeeAlternatePayRateA.setValue("");	
			me.employeeAlternatePayRateB.setValue("");	
			me.employeeAlternatePayRateC.setValue("");	
			me.employeeAlternatePayRateD.setValue("");			
			me.employeeDeviceGroup.reset();
			
			$('#ExemptNo').attr('checked', true);
			$('#HourlyRateYes').attr('checked', true);
			$('#UnionNo').attr('checked', true);
			
			$('#GenderYes').attr('checked', true);			
			$("#EmployeeCrtdAt").text('');
			$("#EmployeeModAt").text('');
			
			me.federalExemptions.setValue("");
			me.federalAdjustmentType.reset();
			me.maritalStatusFederalTaxType.reset();
			me.federalAdjustmentAmount.setValue("");
			
			me.primaryTaxState.reset();
			me.secTaxState.reset();
			me.maritalStatusStateTaxTypePrimary.reset();	
			me.maritalStatusStateTaxTypeSecondary.reset();
			me.stateExemptions.setValue("");
			me.employeeStateAdjustmentType.reset();
			me.stateAdjustmentAmount.setValue("");
			me.stateSDIAdjustType.reset();			
			me.stateSDIAdjustRate.setValue("");
			
			me.localTaxAdjustmentType.reset();
			me.localTaxAdjustmentAmount.setValue("");
			me.localTaxCode1.reset();
			me.localTaxCode2.reset();
			me.localTaxCode3.reset();
			
			$("#EmployeeNumberText").attr('disabled', false);
			$("#houseCodeTemplateText").attr('disabled', false);
			$("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDown");
			$("#EmployeePayrollCompanyText").attr('disabled', false);
			$("#EmployeePayrollCompanyAction").addClass("iiInputAction");
			$("#EmployeeGeneralStatusTypeText").attr('disabled', false);
			$("#EmployeeGeneralStatusTypeAction").addClass("iiInputAction");
			$("#EmployeeStatusCategoryTypeText").attr('disabled', false);
			$("#EmployeeStatusCategoryTypeAction").addClass("iiInputAction");
			$("#EmployeeHireDateText").attr('disabled', false);
			$("#EmployeeHireDateAction").addClass("iiInputAction");							
			$("#EmployeeOriginalHireDateText").attr('disabled', false);
			$("#EmployeeOriginalHireDateAction").addClass("iiInputAction");							
			$("#EmployeeSeniorityDateText").attr('disabled', false);
			$("#EmployeeSeniorityDateAction").addClass("iiInputAction");
			$("#EmployeeEffectiveDateText").attr('disabled', false);
			$("#EmployeeEffectiveDateAction").addClass("iiInputAction");
			
			$("#JobEffectiveDateText").attr('disabled', false);
			$("#JobEffectiveDateAction").addClass("iiInputAction");
			$("#JobChangeReasonText").attr('disabled', false);
			$("#JobChangeReasonAction").addClass("iiInputAction");
			$("#EmployeeJobCodeText").attr('disabled', false);
			$("#EmployeeJobCodeAction").addClass("iiInputAction");
			$("#DefaultHouseCodeJobText").attr('disabled', false);
			$("#DefaultHouseCodeJobAction").addClass("iiInputAction");
			$("#UnionYes").attr('disabled', false);
			$("#UnionNo").attr('disabled', false);
			$("#ExemptYes").attr('disabled', false);
			$("#ExemptNo").attr('disabled', false);
			$("#EmployeeBackgroundCheckDateText").attr('disabled', false);
			$("#EmployeeBackgroundCheckDateAction").addClass("iiInputAction");
			$("#EmployeeUnionText").attr('disabled', false);
			$("#EmployeeUnionAction").addClass("iiInputAction");
			$("#EmployeeUnionStatusText").attr('disabled', false);
			$("#EmployeeUnionStatusAction").addClass("iiInputAction");
			
			$("#CompensationEffectiveDateText").attr('disabled', false);
			$("#CompensationEffectiveDateAction").addClass("iiInputAction");
			$("#EmployeeRateChangeReasonText").attr('disabled', false);
			$("#EmployeeRateChangeReasonAction").addClass("iiInputAction");
			$("#EmployeePayRateText").attr('disabled', false);
			$("#EmployeeScheduledHoursText").attr('disabled', false);
			$("#EmployeeReviewDateText").attr('disabled', false);
			$("#EmployeeReviewDateAction").addClass("iiInputAction");
			$("#EmployeeWorkShiftText").attr('disabled', false);
			$("#EmployeeWorkShiftAction").addClass("iiInputAction");
			$("#EmployeeAlternatePayRateAText").attr('disabled', false);
			$("#EmployeeAlternatePayRateBText").attr('disabled', false);
			$("#EmployeeAlternatePayRateCText").attr('disabled', false);
			$("#EmployeeAlternatePayRateDText").attr('disabled', false);
			$("#EmployeeDeviceGroupText").attr('disabled', false);
			$("#EmployeeDeviceGroupAction").addClass("iiInputAction");
				
			me.validator.reset();
			
			if (me.actionType == "Saved") return;
			
			if (me.actionType == "NewHire") {
				me.employeeGeneralStore.reset();
				me.employeeGeneralNewNumber();
			}

			return true;
		},
		
		employeeGeneralNewNumber: function fin_emp_UserInterface_employeeGeneralNewNumber() {
			var args = ii.args(arguments,{});	
			var me = this;						
			var xml = '';
			
			xml += '<employeeGeneralNewNumber'
			xml += ' id="0"';
			xml += ' crothallEmployee="true"';
			xml += '/>';
			
			var item =  ({id:0, newEmployeeNumber:true});
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.employeeNewResponse,
				referenceData: {me: me, item: item}
			});			
		},
		
		employeeNewResponse: function fin_emp_UserInterface_employeeNewResponse() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var status = $(args.xmlNode).attr("status");
			
			$("#pageLoading").hide();
			
			if (status == "success") {

				//new or updated employee Id					
				me.employeeNumberNew = args.xmlNode.firstChild.attributes[0].nodeValue;
				me.employeeNumber.setValue(args.xmlNode.firstChild.attributes[0].nodeValue);
				
				if (me.employeeNumberNew == 0)
					alert('Please verify the Employee Number range.');
			}
		},

		actionWizardSelect: function fin_emp_UserInterface_actionWizardSelect() {
			var args = ii.args(arguments,{
				actionType: {type: String}
			});			
			var me = this;
			
			$("#ViewHistory").hide();
			
			me.employeeSearch.body.deselectAll();			
			me.actionType = args.actionType;
			me.initializeWizard();
			
			switch (args.actionType) {

				case "NewHire":
					$("#popupHeader").text("New Hire -");
					me.actionNewEmployee();
					me.fetchData();	
					break;

				case "Rehire":
					$("#popupHeader").text("Rehire -");
					break;
				
				case "HouseCodeTransfer":
					$("#popupHeader").text("House Code Transfer -");
					break;

				case "Termination":
					$("#popupHeader").text("Termination -");
					break;

				case "Edit":
					$("#popupHeader").text("Edit -");
					$("#popupSubHeader").text("Action");
					$("#EditEmployee").show();
					break;
					
				case "DateModification":
					$("#popupHeader").text("Date Modification -");
					break;

				case "BasicLifeIndicator":
					$("#popupHeader").text("Basic Life Indicator -");
					break;
					
				case "ReverseTermination":
					$("#popupHeader").text("Reverse Termination -");
					break;
			}

			loadPopup();									
			me.resizeControls();
		},
		
		actionCancel: function fin_emp_UserInterface_actionCancel() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isPageLoaded = false;
			me.actionType = "";
			me.wizardCount = 0;

			me.hideControl();
			me.actionNewEmployee();

			$("#SSNContianer").hide();
			$("#popupEmployee").hide();
			$("#AnchorCancel").hide();
			$("#AnchorNext").hide();
			$("#backgroundPopup").hide();
		},
		
		hideControl: function fin_emp_UserInterface_hideControl() {
			var me = this;
			
			$("#PersonalDetails").hide();
			$("#AddressDetails").hide();
			$("#ContactDetails").hide();
			$("#EmployeeInformation").hide();
			$("#TermDateCode").hide();
			$("#TermReasonDate").hide();
			$("#GeneralCurrentHireDate").hide();
			$("#GeneralOriginalHireDate").hide();
			$("#EmployeeGeneralInformation").hide();
			$("#TermEmployeeGeneral").hide();
			$("#houseCodeTerm").hide();
			$("#JobInformation").hide();
			$("#Compensation").hide();
			$("#Federal").hide();
			$("#StateTax").hide();
			$("#LocalTax").hide();
			$("#LifeIndicator").hide();
			$("#AnchorBack").hide();
			$("#AnchorSave").hide();
			$("#Employee").hide();
			$("#Job").hide();
			$("#CompensationHeader").hide();
			$("#FederalHeader").hide();
			$("#StateHeader").hide();
			$("#LocalHeader").hide();
			$("#EditEmployee").hide();
			me.resizeControls();
		},
		
		initializeWizard: function fin_emp_UserInterface_initializeWizard() {
			var me = this;
			
			$("#popupSubHeaderEmployeeName").html("");
			$("#EditWizardActionText").val("");
			$("#SSNContianer").show();
			if (me.actionType != "Edit"){
				$("#EditEmployee").hide();
				$("#AnchorSave").hide();
			}
			$("#Person").show();
			$("#popupEmployee").show();
			$("#popupHeader").show();
			$("#AnchorCancel").show();
			$("#AnchorNext").show();
			$("#PersonalDetails").hide();
			$("#AddressDetails").hide();
			$("#ContactDetails").hide();
			$("#EmployeeInformation").hide();
			$("#TermDateCode").hide();
			$("#TermReasonDate").hide();
			$("#GeneralCurrentHireDate").hide();
			$("#GeneralOriginalHireDate").hide();
			$("#EmployeeGeneralInformation").hide();
			$("#TermEmployeeGeneral").hide();
			$("#houseCodeTerm").hide();
			$("#JobInformation").hide();
			$("#Compensation").hide();
			$("#Federal").hide();
			$("#StateTax").hide();
			$("#LocalTax").hide();			
			$("#AnchorBack").hide();
			$("#AnchorSave").hide();
			$("#Employee").hide();
			$("#Job").hide();
			$("#CompensationHeader").hide();
			$("#FederalHeader").hide();
			$("#StateHeader").hide();
			$("#LocalHeader").hide();
			$("#LifeIndicator").hide();
			me.wizardCount = 0;
			me.alertMessage = 0;
			me.showWizard();
		},
		
		editWizardChanged : function fin_emp_UserInterface_editWizardChanged() {
			var me = this;
			
			me.wizardCount = 0;
		},

		//if User is creating a new Employee Record, then let system validate the SSN first and then continue.
		actionPreNext: function fin_emp_UserInterface_actionPreNext() {
			var args = ii.args(arguments, {
				event: {type: Object, required: false} // The (key) event object
			});
			var event;
			var me;
		
			if (args.event) {
				event = args.event;
				me = event.data;
				if (event.keyCode != 13) 
					return;
			}
			else {
				me = this;
			}	
			
			if (me.actionType != "NewHire" || me.wizardCount > 0) { //actionNext click on Wizard other than first (SSN search)
				me.employeeValidationCalledFrom = "";
				me.actionNext();
				return;
			}

			me.employeeValidationCalledFrom = "newHire";
			me.validateAttribute = 'SSN';
			me.validateEmployeeDetails();
		},
		
		actionNext: function fin_emp_UserInterface_actionNext() {
			var args = ii.args(arguments, {
				event: {type: Object, required: false} // The (key) event object
			});			
			var event;
			var me;
			
			if (args.event) {
				event = args.event;
				me = event.data;
				if (event.keyCode != 13) 
					return;
			}
			else {
				me = this;
			}	
			
			if ($("#EditWizardActionText").val() != "") {
				me.actionType = $("#EditWizardActionText").val();				
			}
			
			if ($("#EditWizardActionText").is(':visible') == true) {
				if ($("#EditWizardActionText").val() == "") {
					alert("Please select edit option.");
					return;
				}
			}
				
			if ($("#AnchorSave").is(':visible') == true) {
				return;
			}				
			
			me.wizardCount++;
			me.showWizard();
		},

		actionBack: function fin_emp_UserInterface_actionBack() {
			var me = this;

			if (me.actionType == "Employee") {
				if (me.wizardCount == 4) 
					me.wizardCount = 1;
			}
			else if (me.actionType == "Federal") {
				if (me.wizardCount == 8) 
					me.wizardCount = 1;
			}
			else if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification") {
				if (me.wizardCount == 5) 
					me.wizardCount = 1;
				else if (me.wizardCount == 6) 
					me.wizardCount = 5;
				else if (me.wizardCount == 8) 
					me.wizardCount = 6;
			}
			else if (me.actionType == "Job Information") {
				if (me.wizardCount == 6) 
					me.wizardCount = 1;
			}
			else if (me.actionType == "Local Tax") {
				if (me.wizardCount == 10 || me.wizardCount == 8) 
					me.wizardCount = 1;
				else if (me.wizardCount == 9)
					me.wizardCount = 11;
			}
			else if (me.actionType == "State Tax") {
				if (me.wizardCount == 9) 
					me.wizardCount = 1;
			}
			else if (me.actionType == "Compensation") {
				me.wizardCount = 1;
			}
			else if (me.actionType == "BasicLifeIndicator") {
				me.wizardCount = 1;
			}
			else if (me.actionType == "ReverseTermination") {
				me.wizardCount = 1;
			}

			if ($("#AnchorBack").is(':visible') == false) {
				me.initializeWizard();
				return;
			}						

			me.wizardCount--;			
			me.showWizard();	
		},
		
		showWizard: function fin_emp_UserInterface_showWizard() {
			var me = this;

			switch (me.wizardCount) {
              
                case 0:

					$("#SSNContianer").show();
					$("#PersonalDetails").hide();                         
                    $("#AnchorBack").hide(); 						  
					me.isPageLoaded = false;
					
					if (me.actionType == "Rehire" || me.actionType == "NewHire" || me.actionType == "Termination") {
						$("#EditEmployee").hide();
						$("#popupSubHeader").text("Person");
					}
					else if (me.actionType == "HouseCodeTransfer") {
						$("#popupSubHeader").text("General")
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						$("#Federal").hide();
						$("#EditEmployee").hide();
						$("#houseCodeTemplateText").attr("tabindex", "201");
						me.wizardCount = 3;
					}
					else if (me.actionType == "Compensation") {
						$("#Compensation").hide();
						$("#EditEmployee").show();
						$("#SSNContianer").show();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
					}
					else if (me.actionType == "Employee") {
						$("#popupSubHeader").text("Person");
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						me.wizardCount = 3;
					}
					else if (me.actionType == "Federal") {
						$("#popupSubHeader").text("Federal Tax");
						$("#Federal").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 7;
					}
					else if (me.actionType == "Job Information") {
						$("#popupSubHeader").text("Job Information");
						$("#JobInformation").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 5;
					}
					else if (me.actionType == "Local Tax") {
						$("#popupSubHeader").text("Local Tax");
						$("#LocalTax").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 9;
					}
					else if (me.actionType == "Person") {
						$("#popupSubHeader").text("Person");
						$("#PersonalDetails").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 0;
					}
					else if (me.actionType == "State Tax") {
						$("#popupSubHeader").text("State Tax");
						$("#StateTax").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 8;
					}
					else if (me.actionType == "DateModification") {
						$("#popupSubHeader").text("General")
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						$("#EditEmployee").hide();
						me.wizardCount = 3;
					}
					else if (me.actionType == "BasicLifeIndicator") {
						$("#popupSubHeader").text("General");
						$("#LifeIndicator").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						if (me.firstTimeShow)
							me.wizardCount = 10;
					}
					else if (me.actionType == "ReverseTermination") {
						$("#popupSubHeader").text("Person");
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						if (me.firstTimeShow)
							me.wizardCount = 3;
					}
					  						                          
					me.resizeControls();
					me.employeeSSN.text.focus();

					break;

                case 1:

					if ((!me.employeeSSN.validate(true))) {
						me.wizardCount--;
						return false;
					}

					if (me.actionType == "NewHire") {
						$("#SSNContianer").hide();
						$("#PersonalDetails").show();
						$("#AddressDetails").hide();
						$("#AnchorBack").show();
						me.personFirstName.text.focus();
					}
					else {
						$("#messageToUser2").html("Loading");
						$("#popupLoading").show();
						me.employeeGeneralSSNSearch();
					}
                    
					me.resizeControls();
 
                    break;
                      
                case 2:					

                    if ((!me.personFirstName.validate(true)) || (!me.personLastName.validate(true))) {
						me.wizardCount--;
						return false;
					}

					$("#AddressDetails").show(); 

					if (me.actionType == "NewHire") {
						me.setPersonBrief();
					}
					if (me.actionType == "Rehire" || me.actionType == "Termination") {
						$("#popupSubHeader").text("Person");
					}

					if (me.actionType == "Person") {
						$("#popupSubHeader").text("Person");
						$("#PersonalDetails").hide();
						$("#ContactDetails").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						me.wizardCount = 2;
					}

                    $("#PersonalDetails").hide();
                    $("#ContactDetails").hide();

					me.personAddressLine1.text.focus();

                    me.resizeControls();
 
                    break;

                case 3:     
                	
					if ((!me.personAddressLine1.validate(true)) ||
						(!me.personCity.validate(true)) ||
						(!me.personState.validate(true)) ||
						(!me.personPostalCode.validate(true))) {
						me.wizardCount--;
						return false;
					}
					
					$("#AddressDetails").hide();
					$("#ContactDetails").show();
					$("#EmployeeInformation").hide();
					$("#TermEmployeeGeneral").hide();
					$("#houseCodeTerm").hide();
					$("#AnchorNext").show();                        
					$("#AnchorSave").hide();

					if (me.actionType == "Rehire") {
						$("#popupSubHeader").text("Person");
					}
					if (me.actionType =="Person") {                                  
						$("#AddressDetails").hide();
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
					}
					
				    me.personEmail.text.focus();
					
					me.resizeControls();
					
					break;
                      
                case 4:     

					if (me.actionType != "HouseCodeTransfer" && me.actionType != "DateModification") {
						$("#ContactDetails").hide();
						$("#EmployeeInformation").show();
						$("#houseCodeTerm").show();
						$("#EmployeeGeneralInformation").hide();
						$("#AnchorNext").show();
						$("#AnchorSave").hide();
						$("#GeneralCurrentHireDate").show();
						$("#GeneralOriginalHireDate").show();
						$("#TermDateCode").hide();
						$("#TermReasonDate").hide();
					}
					else {
						$("#messageToUser2").html("Loading");
						$("#popupLoading").show();
						me.employeeGeneralSSNSearch();
					}
					
					if (me.actionType == "NewHire" || me.actionType == "Rehire") {
						$("#popupSubHeader").text("General")
						me.employeeStatusType.text.disabled = true;
						$("#EmployeeGeneralStatusTypeAction").removeClass("iiInputAction");
						me.setDropListSelectedValueByTitle("employeeStatus", "Active");
						me.setDropListSelectedValueByTitle("employeeStatusCategory", "Full Time");
						ii.trace("Rehire Status Disabled", ii.traceTypes.Information, "Info");
						if (me.actionType == "Rehire") {
							me.actionEmployeeStatusChanged();
							me.employeeEffectiveDateChanged(); //onChange of Category
						}
					}

					if (me.actionType == "Termination") {
						$("#popupSubHeader").text("General");
						$("#TermDateCode").show();
						$("#TermReasonDate").show();
						$("#GeneralCurrentHireDate").hide();
						$("#GeneralOriginalHireDate").hide();						
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
					}
					
					if (me.actionType == "ReverseTermination") {
						$("#popupSubHeader").text("General");
						$("#SSNContianer").hide();
						$("#PersonalDetails").hide();
						$("#GeneralCurrentHireDate").hide();
						$("#GeneralOriginalHireDate").hide();
						$("#AnchorBack").show();
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
					}

					if (me.actionType == "Employee") {
						$("#popupSubHeader").text("General")
						$("#SSNContianer").hide();
						$("#JobInformation").hide();
						$("#AnchorBack").show();
						
						$("#houseCodeTemplateText").attr('disabled', true);
						$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDown");						
						$("#EmployeePayrollCompanyText").attr('disabled', true);
						$("#EmployeePayrollCompanyAction").removeClass("iiInputAction");						
						$("#EmployeeGeneralStatusTypeText").attr('disabled', true);
						$("#EmployeeGeneralStatusTypeAction").removeClass("iiInputAction");						
						$("#EmployeeOriginalHireDateText").attr('disabled', true);
						$("#EmployeeOriginalHireDateAction").removeClass("iiInputAction");						
						$("#EmployeeSeniorityDateText").attr('disabled', true);
						$("#EmployeeSeniorityDateAction").removeClass("iiInputAction");			
						$("#EmployeeEffectiveDateText").attr('disabled', true);
						$("#EmployeeEffectiveDateAction").removeClass("iiInputAction");
						
						me.wizardCount = 4;
					}
                    
					if ($("EmployeePayrollCompany").is('visible') == true
					    && me.employeePayrollCompany.text.disabled == false
					    && me.employeePayrollCompany.text.readOnly == false){
					    me.employeePayrollCompany.text.focus();
					}
					
					me.resizeControls();
					
                    break;
                      
                case 5:
				
					if ((!me.employeeNumber.validate(true)) ||
						(!me.employeePayrollCompany.validate(true)) ||
						(!me.employeeStatusCategoryType.validate(true)) ||
						(!me.employeeStatusType.validate(true)) ||
						(!me.employeeHireDate.validate(true)) ||
						(!me.employeeEffectiveDate.validate(true))) {
						me.wizardCount--;
						return false;
					}           
					
					$("#EmployeeInformation").hide();
					$("#EmployeeGeneralInformation").show();
					$("#JobInformation").hide();
					$("#houseCodeTerm").hide();
					me.isPageLoaded = true;

					if (me.actionType == "Employee") {
						$("#popupSubHeader").text("General");
						$("#AnchorNext").hide();
						$("#AnchorSave").show();				   
					}
					
					me.employeeBirthDate.text.focus();
					
					me.resizeControls();
					
					break;
                      
                case 6:

					if ((!me.employeeBirthDate.validate(true)) ||
						(!me.employeeEthnicity.validate(true)) ||
						(!me.employeeMaritalStatus.validate(true))) {
						if (me.firstTimeShow == false) {
							me.wizardCount--;
							return false;
						}
					}
					
					if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification") {
						if ((!me.employeeNumber.validate(true)) ||
							(!me.employeePayrollCompany.validate(true)) ||
							(!me.employeeStatusCategoryType.validate(true)) ||
							(!me.employeeStatusType.validate(true)) ||
							(!me.employeeHireDate.validate(true)) ||
							(!me.employeeEffectiveDate.validate(true))) {
							me.wizardCount--;
							return false;
						}
					}
					
					$("#EmployeeGeneralInformation").hide();
					$("#JobInformation").show();
					$("#Compensation").hide();
					$("#AnchorSave").hide();
					
					if (me.actionType == "Rehire") {
						$("#popupSubHeader").text("Job Information");
					}
					
					if (me.actionType == "NewHire") {
						me.setDropListSelectedValueByTitle("jobCode", "Field Hourly");
					}
					  
					if (me.actionType == "NewHire" || me.actionType == "Rehire") {
						$("#popupSubHeader").text("Job Information");
						$("#JobEffectiveDateText").attr('disabled', true);
						$("#JobEffectiveDateAction").removeClass("iiInputAction");
						me.jobEffectiveDate.setValue(me.employeeHireDate.text.value);
						me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value);
					}
					
					if (me.actionType == "Employee") {
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						$("#SSNContianer").hide();
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
						$("#AnchorBack").show();
						me.firstTimeShow == false;
					}
					else if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification") {
						$("#popupSubHeader").text("Job Information");
						$("#EmployeeInformation").hide();
						$("#houseCodeTerm").hide();
						$("#Compensation").hide();
						$("#AnchorNext").show();
						$("#AnchorBack").show();
						me.firstTimeShow == false;
						me.wizardCount = 6;
					}
					else if (me.actionType == "Job Information") {
						$("#popupSubHeader").text("Job Information");
						$("#SSNContianer").hide();
						$("#AnchorNext").hide();
						$("#AnchorBack").show();
						$("#AnchorSave").show();
						me.firstTimeShow == false;
					}
					
					if (me.actionType == "DateModification") {
						$("#JobChangeReasonText").attr('disabled', true);
						$("#JobChangeReasonAction").removeClass("iiInputAction");
						$("#EmployeeJobCodeText").attr('disabled', true);
						$("#EmployeeJobCodeAction").removeClass("iiInputAction");
						$("#DefaultHouseCodeJobText").attr('disabled', true);
						$("#DefaultHouseCodeJobAction").removeClass("iiInputAction");
						$("#UnionYes").attr('disabled', true);
						$("#UnionNo").attr('disabled', true);
						$("#ExemptYes").attr('disabled', true);
						$("#ExemptNo").attr('disabled', true);
						$("#EmployeeBackgroundCheckDateText").attr('disabled', true);
						$("#EmployeeBackgroundCheckDateAction").removeClass("iiInputAction");
						$("#EmployeeUnionText").attr('disabled', true);
						$("#EmployeeUnionAction").removeClass("iiInputAction");
						$("#EmployeeUnionStatusText").attr('disabled', true);
						$("#EmployeeUnionStatusAction").removeClass("iiInputAction");
					}
					
					me.resizeControls();
                      
                    break;
                      
                case 7:

					if ((!me.jobEffectiveDate.validate(true)) ||
						(!me.employeeJobCode.validate(true)) ||
						(!me.employeeBackgroundCheckDate.validate(true)) ||
						(!me.employeeUnion.validate(true)) ||
						(!me.employeeUnionStatus.validate(true))) {
						me.wizardCount--;
						return false;
					}
					   
					$("#JobInformation").hide();
					$("#Compensation").show();
					$("#Federal").hide();                     
					
					if (me.actionType == "Rehire") {
						$("#popupSubHeader").text("Compensation");
					}
					else if (me.actionType == "NewHire" || me.actionType == "Rehire") {
						$("#popupSubHeader").text("Compensation");
						$("#CompensationEffectiveDateText").attr('disabled', true);
						$("#CompensationEffectiveDateAction").removeClass("iiInputAction");
					}
					else if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification") {
						$("#popupSubHeader").text("Compensation");
						$("#JobInformation").hide();
						$("#AnchorBack").show();
						$("#AnchorSave").show();
						$("#AnchorNext").hide();
					}

					if (me.actionType == "DateModification") {
						$("#EmployeeRateChangeReasonText").attr('disabled', true);
						$("#EmployeeRateChangeReasonAction").removeClass("iiInputAction");
						$("#EmployeePayRateText").attr('disabled', true);
						$("#EmployeeScheduledHoursText").attr('disabled', true);
						$("#EmployeeReviewDateText").attr('disabled', true);
						$("#EmployeeReviewDateAction").removeClass("iiInputAction");
						$("#EmployeeWorkShiftText").attr('disabled', true);
						$("#EmployeeWorkShiftAction").removeClass("iiInputAction");
						$("#EmployeeAlternatePayRateAText").attr('disabled', true);
						$("#EmployeeAlternatePayRateBText").attr('disabled', true);
						$("#EmployeeAlternatePayRateCText").attr('disabled', true);
						$("#EmployeeAlternatePayRateDText").attr('disabled', true);
						$("#EmployeeDeviceGroupText").attr('disabled', true);
						$("#EmployeeDeviceGroupAction").removeClass("iiInputAction");
					}

					me.employeePayRate.text.focus();
					me.resizeControls();

					break;
 
                case 8: // Local Tax

					if ((!me.compensationEffectiveDate.validate(true)) ||
						(!me.employeePayRate.validate(true)) ||
						(!me.employeeScheduledHours.validate(true)) ||
						(!me.employeeRateChangeReason.validate(true))) {
						if (me.firstTimeShow == false) {
							me.wizardCount--;
							return false;
						}
					}     
					
					$("#Compensation").hide();
					$("#Federal").show();
					$("#StateTax").hide();
					if (me.actionType == "Rehire") {
						$("#popupSubHeader").text("Federal Tax");
					}
					else if (me.actionType == "NewHire") {
						$("#popupSubHeader").text("Federal Tax");
					}
					else if (me.actionType == "Federal") {
						$("#popupSubHeader").text("Federal Tax");
						$("#SSNContianer").hide();
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
						$("#AnchorBack").show();
						me.firstTimeShow = false;
					}
						
					me.federalExemptions.text.focus();					
					me.resizeControls();
					
					break;
                      
                case 9: // State Tax

					if ((!me.maritalStatusFederalTaxType.validate(true))) {
						if (me.firstTimeShow == false) {
							me.wizardCount--;
							return false;
						}
					}   
					
					$("#Federal").hide();
					$("#StateTax").show();
					$("#LocalTax").hide();
					$("#AnchorNext").show();
					$("#AnchorSave").hide();
					$("#popupSubHeader").text("State Tax");

					me.setSecondaryTaxStateLabel();

					if (me.actionType == "State Tax") {
						$("#SSNContianer").hide();
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
						$("#AnchorBack").show();
						me.firstTimeShow = false;
					}
					else if (me.actionType == "Local Tax") {
						$("#AnchorNext").hide();
						$("#AnchorSave").show();
					}
					  	
					me.primaryTaxState.text.focus();					
					me.resizeControls();
					
					break;
                      
                case 10: // Local Tax

					if ((!me.primaryTaxState.validate(true)) || (!me.maritalStatusStateTaxTypePrimary.validate(true)) 
						|| !me.validateStateControls()
						|| (me.localTaxCode2.indexSelected > 0 && !me.secTaxState.validate(true))
						) {
						if (me.firstTimeShow == false) {
							me.wizardCount--;
							return false;
						}
					}     
					
					$("#StateTax").hide();
                    $("#LocalTax").show();
                    $("#AnchorNext").hide();
                    $("#AnchorSave").show();					  
					$("#popupSubHeader").text("Local Tax");
					
					if (me.actionType == "Local Tax") {
						$("#SSNContianer").hide();
						$("#AnchorBack").show();
						me.firstTimeShow = false;
						me.wizardCount = 8;
						
						if (me.localTaxCode2.indexSelected > 0) {
					        if (me.secTaxState.indexSelected == -1) {
								$("#AnchorNext").show();
								$("#AnchorSave").hide();
							}
					    }
					    else {
							$("#AnchorNext").hide();
							$("#AnchorSave").show();
						}
					}

					me.localTaxAdjustmentType.text.focus();
					me.resizeControls();

              		break;
					
				  case 11: // Basic Life Indicator

						$("#SSNContianer").hide();
						$("#AnchorNext").hide();
						$("#AnchorBack").show();						
                    	$("#AnchorSave").show();
						$("#LifeIndicator").show();

						me.basicLifeIndicatorType.text.focus();
 
                    break;
					
				default:
					break;
			}
		},
		
		setSecondaryTaxStateLabel: function() {
			var me = this;
			
			if ((me.employeeGenerals.length > 0 && me.employeeGenerals[0].localTaxCode2 > 0) ||
				(me.localTaxCode2.indexSelected != undefined && me.localTaxCode2.indexSelected > 0))
		        $("#LabelSecondaryTaxState").html("<span class='requiredFieldIndicator'>&#149;</span>Secondary State:");
			else
				$("#LabelSecondaryTaxState").html("<span class='nonRequiredFieldIndicator'>&nbsp;</span>Secondary State:");
		},
		
		validateStateControls: function() {
			var me = this;
			var valid = true;
				
			for (var index = 0; index < me.primaryStateControls.length; index++) {
				me.primaryStateControls[index].validate(true);
			}
			
			for (var index = 0; index < me.secondaryStateControls.length; index++) {
				me.secondaryStateControls[index].validate(true);
			}
			
			for (var index = 0; index < me.primaryStateControls.length; index++) {
				if (!me.primaryStateControls[index].valid) {
					valid = false;
					break;
				}
			}

			for (var index = 0; index < me.secondaryStateControls.length; index++) {
				if (!me.secondaryStateControls[index].valid) {
					valid = false;
					break;
				}
			}

			return valid;
		},
			
		actionSave: function fin_emp_UserInterface_actionSave() {
			var me = this;

			me.actionSavePerson();		
		},
		
		controlValidation: function fin_emp_UserInterface_controlValidation() {
			var me = this;
		
			switch (me.wizardCount) {
			
				case 0:
					break;

				case 1:
					break;
					
				case 2:
				
					if ((!me.personFirstName.validate(true)) || (!me.personLastName.validate(true))) {						
						return false;
					}
					break;
					
				case 3:
					break;
					
				case 4:
					break;	
			}			
		},
		
		actionSavePerson: function fin_emp_UserInterface_actionSavePerson() {
			var args = ii.args(arguments,{});
			var me = this;
			var changeStatusCode = '';
			var payrollStatus = '';
			var previousPayrollStatus = '';
			
			if (me.actionType == "Compensation" && me.employeeRateChangeReason.indexSelected <= 0) {
				if ((me.employeePayRateChanged == true ||
					parseInt(me.employeeScheduledHours.getValue()) != parseInt(me.employeeGenerals[0].scheduledHours))) {
					alert("Please select Pay Rate Change Reason.");
					return false;
				}
			}
			
			if (me.houseCodeJobChanged == true && me.actionType == "Job Information" && me.jobChangeReason.indexSelected == -1){
				alert("Please select Job Change Reason.");
				return false;
			}
			
			if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification" || me.actionType == "Compensation") {						  
			  	if ((!me.compensationEffectiveDate.validate(true))
					|| (!me.employeePayRate.validate(true))
					|| (!me.employeeScheduledHours.validate(true))
					|| (!me.employeeRateChangeReason.validate(true))) { 
					return false;
				}
			}
			
			if (me.actionType == "Termination") {
				if ((!me.employeeNumber.validate(true)) ||
					(!me.employeePayrollCompany.validate(true)) ||
					(!me.employeeStatusCategoryType.validate(true)) ||
					(!me.employeeStatusType.validate(true)) ||
					(!me.employeeTerminationDate.validate(true)) ||
					(!me.employeeTerminationReason.validate(true)) ||
					(!me.employeeEffectiveDate.validate(true))) {
						return false;
					}
			
				if (me.isDateValid(me.employeeHireDate.text.value, 'Termination') == false) {
					alert('You cannot terminate an employee in the same pay period the employee was hired. \n' +
						'Contact the Corporate Payroll department for further instructions.');
					return false;
				}
			}
			
			if (me.actionType == "Rehire") {			
				if (me.isDateValid(me.employeeGenerals[0].terminationDate, 'Rehire') == false) {
					alert('You cannot Rehire an employee in the same pay period the employee was Terminated. \n' +
						'Contact the Corporate Payroll department for further instructions.');
					return false;
				}
			}
			
			if (me.actionType == "Employee") {	
				if ((!me.employeeBirthDate.validate(true))
                  || (!me.employeeEthnicity.validate(true))
                  || (!me.employeeMaritalStatus.validate(true)))
				  return false;
			}
			
			if (me.actionType == "Federal") {	
				if (!me.maritalStatusFederalTaxType.validate(true))
				  return false;
			}
			
			if (me.actionType == "Job Information") {
				if ((!me.jobEffectiveDate.validate(true)) ||
					(!me.employeeJobCode.validate(true)) ||
					(!me.employeeBackgroundCheckDate.validate(true)) ||
					(!me.employeeUnion.validate(true)) ||
					(!me.employeeUnionStatus.validate(true))) {
					return false;
				}
			}
			
			if (me.actionType == "NewHire" || me.actionType == "Rehire" || me.actionType == "Local Tax") {
				if (me.localTaxCode2.indexSelected > 0 && !me.secTaxState.validate(true)) {
					if (me.actionType != "Local Tax")
						alert("Please select Secondary State in State Tax wizard.");
					return false;
				}
			}

			if (me.actionType == "NewHire" || me.actionType == "Rehire" || me.actionType == "State Tax") {
				if (!me.validateStateControls() || !me.primaryTaxState.validate(true) || !me.maritalStatusStateTaxTypePrimary.validate(true) ||
					(me.localTaxCode2.indexSelected > 0 && !me.secTaxState.validate(true))) 
					return false;
			}
		
			if (me.employeeStatusType.text.value == "Terminated") {
				if (me.employeeTerminationDate.text.value == "" || me.employeeTerminationReason.indexSelected == -1) {
					alert("Please select Termination Date and Reason.");
					return false;
				}
				
				if (me.payRollEntries > 0) { 
					alert("This Employee has Payroll hours entered in the current pay period. \nWe can not Terminate this Employee.");
					return false;
				}
			}
			
			if (me.actionType == "ReverseTermination") {			
				if (me.isDateValid(me.employeeGenerals[0].modAt, "ReverseTermination") == false) {
					alert("You cannot reverse terminate an employee who was terminated in a prior pay period. \n" +
						"Contact the Corporate Payroll department for further instructions.");
					return false;
				}

				if ((!me.employeeNumber.validate(true)) ||
					(!me.employeePayrollCompany.validate(true)) ||
					(!me.employeeStatusType.validate(true)) ||
					(!me.employeeStatusCategoryType.validate(true))) {
					return false;
				}
			}
			
			$("#messageToUser2").html("Saving");
			$("#popupLoading").show();
			
			//export update
			if (me.employeeGenerals.length > 0) {
				changeStatusCode = me.employeeGenerals[0].changeStatusCode;
				payrollStatus = me.employeeGenerals[0].payrollStatus;
				previousPayrollStatus = me.employeeGenerals[0].previousPayrollStatus;
			}
			
			//New hire
			if (me.jobChangeReason.indexSelected >= 0) {
				if (me.jobChangeReason.text.value == 'New hire') {
					changeStatusCode = 'N';
					payrollStatus = 'A';
					previousPayrollStatus = '';
				}
				//Rehire
				if (me.jobChangeReason.text.value == 'Rehire') {
					changeStatusCode = 'R';
					payrollStatus = 'A';
					previousPayrollStatus = 'T';
				}
			}

			// Terminated
			if (me.employeeStatusType.indexSelected >= 0) {
				if (me.employeeStatusType.text.value == "Terminated" || me.employeeStatusType.text.value == "Severance") {
					if (me.employeeGenerals.length > 0) {
						if (me.employeeGenerals[0].payrollStatus == "T") {
							changeStatusCode = 'T';
							payrollStatus = 'T';
							previousPayrollStatus = 'T';
						}
						else {
							changeStatusCode = 'T';
							payrollStatus = 'T';
							previousPayrollStatus = 'A';
						}
					}
					else {
						changeStatusCode = 'T';
						payrollStatus = 'T';
						previousPayrollStatus = 'A';
					}
				}
				
				//Inactive
				if ((me.employeeStatusType.text.value == 'FMLA_LOA') 
					|| (me.employeeStatusType.text.value == 'Inactive') 
					|| (me.employeeStatusType.text.value == 'Leave Of Absence')) {						
					changeStatusCode = 'I';
					payrollStatus = 'I';
					previousPayrollStatus = 'A';
				}
				
				//FMLA_LOA, Inactive, Leave of Absence
				//Reactivate
				if (me.employeeGenerals.length > 0) {
					var title = me.findTitleById(me.employeeGenerals[0].statusType, me.statusTypes);
					if ((title == 'FMLA_LOA' || title == 'Inactive' || title == 'Leave Of Absence') &&
						(me.employeeStatusType.text.value) == 'Active') {
						changeStatusCode = 'A';
						payrollStatus = 'A';
						previousPayrollStatus = 'I';
					}
				}
			}
			
			if (me.actionType == "ReverseTermination") {
				changeStatusCode = '';
				payrollStatus = 'A';
				previousPayrollStatus = 'A';
			}
			
			//Hourly - Salary
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected] != undefined) {
				if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly &&
					me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary == false) {
					me.payRateHourlySalary = true;
				}
				
				if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly == false &&
					me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
					me.payRateHourlySalary = false;
				}
			}
			
			me.hirNode = me.houseCodeSearchTemplate.hirNodeTemplate.toString();
			
			var itemPerson = new fin.emp.EmployeePersonal(
				parseInt(me.personId)
				, me.personBrief
				, me.personDescription //RMS-ESM
				, false 	//($("input[name='PersonActive']:checked").val() == "true" ? true : false)
				, me.personFirstName.getValue()
				, me.personLastName.getValue()
				, me.personMiddleName.getValue()
				, me.personAddressLine1.getValue()
				, me.personAddressLine2.getValue()
				, me.personCity.getValue() 
				, me.stateTypes[me.personState.indexSelected].id
				, me.personPostalCode.getValue()
				, me.personHomePhone.getValue()
				, me.personFax.getValue()
				, me.personCellPhone.getValue()
				, me.personEmail.getValue()
				, me.personPager.getValue()
				, parseInt(me.hirNode)
				);				
				
			var itemGeneral = new fin.emp.EmployeeGeneral({
				id: me.employeeGeneralId
				, personId: me.personId.toString()
				//, active: ($("input[name='EmployeeActive']:checked").val() == "true" ? true : false)  // employeeActive
				, crothallEmployee: ($("input[name='CrothallEmployee']:checked").val() == "true" ? true : false)
				, hcmHouseCode: me.houseCodeSearchTemplate.houseCodeIdTemplate.toString()
				, hirNode: me.houseCodeSearchTemplate.hirNodeTemplate.toString()
				, statusType: me.statusTypes[me.employeeStatusType.indexSelected].id						
				, statusCategoryType: (me.employeeStatusCategoryType.indexSelected >= 0 ? me.statusCategoryTypes[me.employeeStatusCategoryType.indexSelected].id : 0)
				, houseCodeJob: (me.job.indexSelected < 0 ? 0 : me.houseCodeJobs[me.job.indexSelected].id)
				, employeeNumber: me.employeeNumber.getValue()				
				, ssn: me.employeeSSN.getValue()	
				, exempt: ($("input[name='Exempt']:checked").val() == "true" ? true : false)							
				, payrollCompany: (me.employeePayrollCompany.indexSelected >= 0 ? me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].id : 0)
				, frequencyType: me.payFrequencyType
				, alternatePayRateA: me.employeeAlternatePayRateA.getValue()
				, alternatePayRateB: me.employeeAlternatePayRateB.getValue()
				, alternatePayRateC: me.employeeAlternatePayRateC.getValue()
				, alternatePayRateD: me.employeeAlternatePayRateD.getValue()
				, jobCode: (me.employeeJobCode.indexSelected >= 0 ? me.jobCodeTypes[me.employeeJobCode.indexSelected].id : 0)
				, hourly: me.payRateHourlySalary 
				, payRate: me.employeePayRate.getValue()	
				, rateChangeReason: (me.employeeRateChangeReason.indexSelected >= 0 ? me.rateChangeReasons[me.employeeRateChangeReason.indexSelected].id : 0)
				, rateChangeDate: '' //me.employeeRateChangeDate.getValue()
				, maritalStatusType: me.maritalStatusTypes[me.employeeMaritalStatus.indexSelected].id
				, hireDate: me.employeeHireDate.text.value
				, originalHireDate: me.employeeOriginalHireDate.text.value
				, seniorityDate: me.employeeSeniorityDate.text.value
				, effectiveDate: me.employeeEffectiveDate.text.value
				, effectiveDateJob: me.jobEffectiveDate.text.value  // (me.jobChangeReason.indexSelected >= 0 ? me.currentDate()  : me.jobEffectiveDate.text.value)
				, effectiveDateCompensation: me.compensationEffectiveDate.text.value // (me.employeeRateChangeReason.indexSelected >= 0 ? me.currentDate() : me.compensationEffectiveDate.text.value)
				, terminationDate: (me.employeeTerminationDate.text.value != '' ? me.employeeTerminationDate.text.value : '01/01/1900') 
				, terminationReason: (me.employeeTerminationReason != undefined ? 
							(me.employeeTerminationReason.indexSelected >= 0 ? 
								me.terminationReasons[me.employeeTerminationReason.indexSelected].id 
								: 0) 
							: 0)
				, workShift: (me.employeeWorkShift.indexSelected >= 0 ? me.workShifts[me.employeeWorkShift.indexSelected].id : 0)
				, benefitsPercentage: "60"
				, scheduledHours: me.employeeScheduledHours.getValue()
				, unionEmployee: ($("input[name='Union']:checked").val() == "true" ? true : false)
				, unionType: (me.employeeUnion.indexSelected >= 0 ? me.unionTypes[me.employeeUnion.indexSelected].id : 0)
				, unionStatusType: (me.employeeUnionStatus.indexSelected >= 0 ? me.unionStatusTypes[me.employeeUnionStatus.indexSelected].id : 0)
				, basicLifeIndicatorType: (me.basicLifeIndicatorType.indexSelected >= 0 ? me.basicLifeIndicatorTypes[me.basicLifeIndicatorType.indexSelected].id : 0)
				, i9Type: (me.employeeI9Status.indexSelected >= 0 ? me.i9Types[me.employeeI9Status.indexSelected].id : 0)
				, vetType: (me.employeeVETSStatus.indexSelected >= 0 ? me.vetTypes[me.employeeVETSStatus.indexSelected].id : 0)
				, separationCode: (me.separationCode != undefined ? 
							(me.separationCode.indexSelected >= 0 ? 
								me.separationCodes[me.separationCode.indexSelected].id 
							: 0) 
								: 0)
				, jobStartReason: (me.jobChangeReason.indexSelected >= 0 ? me.jobStartReasonTypes[me.jobChangeReason.indexSelected].id : 0)
				//Personal
				, genderType: ($("input[name='Gender']:checked").val() == "Male" ? 1 : 2) 		
				, birthDate: me.employeeBirthDate.text.value 		
				, backGroundCheckDate: me.employeeBackgroundCheckDate.text.value 	
				, reviewDate: me.employeeReviewDate.text.value 	
				, ethnicityType: (me.employeeEthnicity.indexSelected >= 0 ? me.ethnicityTypes[me.employeeEthnicity.indexSelected].id : 0) 										
				, deviceGroup: (me.employeeDeviceGroup.indexSelected >= 0 ? me.deviceGroupTypes[me.employeeDeviceGroup.indexSelected].id : 0)
				//Export update
				, changeStatusCode: changeStatusCode
				, payrollStatus: payrollStatus
				, previousPayrollStatus: previousPayrollStatus	
				//Payroll
				, federalExemptions: me.federalExemptions.getValue()
				, maritalStatusFederalTaxType: (me.maritalStatusFederalTaxType.indexSelected >= 0 ? me.maritalStatusFederalTaxTypes[me.maritalStatusFederalTaxType.indexSelected].id: 0)
				, federalAdjustmentType: (me.federalAdjustmentType.indexSelected >= 0 ? me.federalAdjustments[me.federalAdjustmentType.indexSelected].id : 0)
				, federalAdjustmentAmount: me.federalAdjustmentAmount.getValue()
				, primaryState: (me.primaryTaxState.indexSelected >= 0 ? me.stateTypes[me.primaryTaxState.indexSelected].id : 0)
				, secondaryState: (me.secTaxState.indexSelected >= 0 ? me.stateTypes[me.secTaxState.indexSelected].id : 0)
				, primaryMaritalStatusType: (me.maritalStatusStateTaxTypePrimary.indexSelected >= 0 ? me.maritalStatusStateTaxTypePrimarys[me.maritalStatusStateTaxTypePrimary.indexSelected].id : 0)
				, secondaryMaritalStatusType: (me.maritalStatusStateTaxTypeSecondary.indexSelected >= 0 ? me.maritalStatusStateTaxTypeSecondarys[me.maritalStatusStateTaxTypeSecondary.indexSelected].id : 0)
				, stateExemptions: me.stateExemptions.getValue()				
				, stateAdjustmentType: (me.employeeStateAdjustmentType.indexSelected >= 0 ? me.stateAdjustmentTypes[me.employeeStateAdjustmentType.indexSelected].id : 0)
				, stateAdjustmentAmount: me.stateAdjustmentAmount.getValue()
				, sdiAdjustmentType: (me.stateSDIAdjustType.indexSelected >= 0 ? me.sdiAdjustmentTypes[me.stateSDIAdjustType.indexSelected].id : 0)
				, sdiRate: me.stateSDIAdjustRate.getValue()
				, primaryStateAdditionalInformation: me.getStateAdditionalInformation("Primary")
				, secondaryStateAdditionalInformation: me.getStateAdditionalInformation("Secondary")
				, localTaxAdjustmentType: (me.localTaxAdjustmentType.indexSelected >= 0 ? me.localTaxAdjustmentTypes[me.localTaxAdjustmentType.indexSelected].id : 0)
				, localTaxAdjustmentAmount: me.localTaxAdjustmentAmount.getValue()
				, localTaxCode1: (me.localTaxCode1.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode1.indexSelected].id : 0)
				, localTaxCode2: (me.localTaxCode2.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode2.indexSelected].id : 0)
				, localTaxCode3: (me.localTaxCode3.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode3.indexSelected].id : 0)
			});	

			var xml = me.saveXmlBuild(itemPerson, itemGeneral);
			
			me.saving = true;
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: itemPerson, item: itemGeneral}
			});
			
			return true;
		},
		
		saveXmlBuild: function fin_emp_UserInterface_saveXmlBuild() {
			var args = ii.args(arguments,{
				itemPerson: {type: fin.emp.EmployeePersonal}
				, itemGeneral: {type: fin.emp.EmployeeGeneral}
			});
			var me = this;
			var itemPerson = args.itemPerson;
			var itemGeneral = args.itemGeneral;
			var xml = "";
			var updateFlag = false;

			if (me.employeeGenerals.length > 0) {
				var title = me.findTitleById(me.employeeGenerals[0].statusType, me.statusTypes);

				if (title == "Terminated" && me.actionType == "Person") {
					var terminationYear = new Date(me.employeeGenerals[0].terminationDate).getFullYear();
					var currentYear = new Date(parent.fin.appUI.glbCurrentDate).getFullYear();
					if (terminationYear == currentYear) {
						updateFlag = true;
					}
				}
			}			

			if (me.actionType == "Rehire" || me.actionType == "NewHire" ||
				me.actionType == "Person" || me.actionType == "Termination") {
				xml += '<employeeGeneralPerson';
				xml += ' person="' + itemPerson.id + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode(itemPerson.brief) + '"';
				xml += ' firstName="' + ui.cmn.text.xml.encode(itemPerson.firstName) + '"';
				xml += ' lastName="' + ui.cmn.text.xml.encode(itemPerson.lastName) + '"';
				xml += ' middleName="' + ui.cmn.text.xml.encode(itemPerson.middleName) + '"';
				xml += ' address1="' + ui.cmn.text.xml.encode(itemPerson.addressLine1) + '"';
				xml += ' address2="' + ui.cmn.text.xml.encode(itemPerson.addressLine2) + '"';
				xml += ' city="' + ui.cmn.text.xml.encode(itemPerson.city) + '"';
				xml += ' stateType="' + itemPerson.state + '"';
				xml += ' postalCode="' + itemPerson.postalCode + '"';
				xml += ' homePhone="' + me.phoneMask(itemPerson.homePhone, true) + '"';
				xml += ' fax="' + me.phoneMask(itemPerson.fax, true) + '"';
				xml += ' cellPhone="' + me.phoneMask(itemPerson.cellPhone, true) + '"';
				xml += ' email="' + ui.cmn.text.xml.encode(itemPerson.email) + '"';
				xml += ' pager="' + me.phoneMask(itemPerson.pager, true) + '"';
				xml += ' active="' + (itemGeneral.statusType != 6 ? true : false) + '"';
				xml += ' hirNode="' + itemPerson.hirNode + '"';
				if (me.actionType == "Rehire" || me.actionType == "NewHire" ||
					me.actionType == "Person"  || me.actionType == "Termination") {					
					xml += '/>';
				}
			}
			
			if (me.actionType == "Rehire" || 
				me.actionType == "NewHire" ||
				me.actionType == "Employee" ||
				me.actionType == "HouseCodeTransfer" ||
				me.actionType == "DateModification" ||
				me.actionType == "Job Information" ||
				me.actionType == "Compensation" || 
				me.actionType == "Termination" ||
				me.actionType == "Federal" ||
				me.actionType == "State Tax" ||
				me.actionType == "Local Tax" ||
				me.actionType == "BasicLifeIndicator" ||
				me.actionType == "ReverseTermination" ||
				updateFlag == true) {
				xml += '<employeeGeneralWizard';
				xml += ' id="' + itemGeneral.id + '"';
				xml += ' personId="' + itemGeneral.personId + '"';
				xml += ' employeeNumber="' + itemGeneral.employeeNumber + '"';
				xml += ' hcmHouseCode="' + itemGeneral.hcmHouseCode + '"';
				xml += ' hirNode="' + itemGeneral.hirNode + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode(itemPerson.brief) + '"';
				xml += ' ssn="' + itemGeneral.ssn.replace(/-/g, '') + '"';
				xml += ' statusType="' + itemGeneral.statusType + '"';
				xml += ' statusCategoryType="' + itemGeneral.statusCategoryType + '"';
				xml += ' active="' + (itemGeneral.statusType != 6 ? true : false) + '"';
				xml += ' birthDate="' + itemGeneral.birthDate + '"';
				xml += ' hireDate="' + itemGeneral.hireDate + '"';	
				xml += ' frequencyType="' + itemGeneral.frequencyType + '"';
				xml += ' hourly="' + itemGeneral.hourly + '"';
				//xml += ' actionType ="' + me.actionType +'"';
				xml += ' actionType="' + (updateFlag ? 'Person' : me.actionType) + '"';
				xml += ' houseCodeChanged="'+ me.houseCodeChanged +'"';				
				xml += ' changeStatusCode="' + itemGeneral.changeStatusCode + '"';
				xml += ' payrollStatus="' + itemGeneral.payrollStatus + '"';
				xml += ' previousPayrollStatus="' + itemGeneral.previousPayrollStatus + '"';
				xml += ' basicLifeIndicatorType="' + itemGeneral.basicLifeIndicatorType + '"';
			}
			
			if (me.actionType == "Rehire" || me.actionType == "NewHire") {				
				xml += ' rateChangeDate="' + itemGeneral.rateChangeDate + '"';
				xml += ' benefitsPercentage="' + itemGeneral.benefitsPercentage + '"';
				xml += ' separationCode="0"';
				xml += ' terminationDate="1/1/1900"';
				xml += ' terminationReason="0"';
				xml += ' version="1"';
			}
				
			if (me.actionType == "Termination" || me.actionType == "ReverseTermination") {
				xml += ' payrollCompany="' + itemGeneral.payrollCompany + '"';
				xml += ' crothallEmployee="' + itemGeneral.crothallEmployee + '"';
				xml += ' effectiveDate="' + itemGeneral.effectiveDate + '"';
				xml += ' separationCode="' + itemGeneral.separationCode + '"';
				xml += ' terminationDate="' + itemGeneral.terminationDate + '"';
				xml += ' terminationReason="' + itemGeneral.terminationReason + '"';
				xml += '/>';
			}			
					
			if (me.actionType == "Employee" || me.actionType == "Rehire" || me.actionType == "NewHire") { 				
				xml += ' genderType="' + itemGeneral.genderType + '"';
				xml += ' maritalStatusType="' + itemGeneral.maritalStatusType + '"';
				xml += ' ethnicityType="' + itemGeneral.ethnicityType + '"';
				xml += ' i9Type="' + itemGeneral.i9Type + '"';
				xml += ' vetType="' + itemGeneral.vetType + '"';
			}
			
			if (me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification" || me.actionType == "Employee" ||
				me.actionType == "Rehire" || me.actionType == "NewHire") {				
				xml += ' payrollCompany="' + itemGeneral.payrollCompany + '"';
				xml += ' crothallEmployee="' + itemGeneral.crothallEmployee + '"';
				xml += ' originalHireDate="' + itemGeneral.originalHireDate + '"';
				xml += ' seniorityDate="' + itemGeneral.seniorityDate + '"';
				xml += ' effectiveDate="' + itemGeneral.effectiveDate + '"';
			}
			
			if (me.actionType == "Job Information" || me.actionType == "HouseCodeTransfer"  || me.actionType == "DateModification" ||
				me.actionType == "Rehire" || me.actionType == "NewHire") {
				xml += ' effectiveDateJob="' + itemGeneral.effectiveDateJob + '"';
				xml += ' jobCode="' + itemGeneral.jobCode + '"';
				xml += ' unionEmployee="' + itemGeneral.unionEmployee + '"';
				xml += ' unionType="' + itemGeneral.unionType + '"';
				xml += ' unionStatusType="' + itemGeneral.unionStatusType + '"';
				xml += ' backGroundCheckDate="' + itemGeneral.backGroundCheckDate + '"';
				xml += ' jobStartReason="' + itemGeneral.jobStartReason + '"';
				xml += ' houseCodeJob="' + itemGeneral.houseCodeJob + '"';
				xml += ' exempt="' + itemGeneral.exempt + '"';
			}
			
			if (me.actionType == "Compensation" || me.actionType == "HouseCodeTransfer" || me.actionType == "DateModification" ||
				me.actionType == "Rehire" || me.actionType == "NewHire") {
				xml += ' effectiveDateCompensation="' + itemGeneral.effectiveDateCompensation + '"';
				xml += ' payRate="' + itemGeneral.payRate + '"';
				xml += ' reviewDate="' + itemGeneral.reviewDate + '"';
				xml += ' deviceGroup="' + itemGeneral.deviceGroup + '"';
				xml += ' rateChangeReason="' + itemGeneral.rateChangeReason + '"';
				xml += ' scheduledHours="' + itemGeneral.scheduledHours + '"';
				xml += ' workShift="' + itemGeneral.workShift + '"';
				xml += ' alternatePayRateA="' + itemGeneral.alternatePayRateA + '"';
				xml += ' alternatePayRateB="' + itemGeneral.alternatePayRateB + '"';
				xml += ' alternatePayRateC="' + itemGeneral.alternatePayRateC + '"';
				xml += ' alternatePayRateD="' + itemGeneral.alternatePayRateD + '"';
			}
			
			if (me.actionType == "Rehire" || me.actionType == "NewHire" || me.actionType == "Federal") {
				xml += ' federalExemptions="' + itemGeneral.federalExemptions + '"';
				xml += ' maritalStatusFederalTaxType="' + itemGeneral.maritalStatusFederalTaxType + '"';
				xml += ' federalAdjustmentType="' + itemGeneral.federalAdjustmentType + '"';
				xml += ' federalAdjustmentAmount="' + itemGeneral.federalAdjustmentAmount + '"';
			}
				
			if (me.actionType == "Rehire" || me.actionType == "NewHire" || me.actionType == "Local Tax" || me.actionType == "State Tax") {
				xml += ' primaryState="' + itemGeneral.primaryState + '"';
				xml += ' secondaryState="' + itemGeneral.secondaryState + '"';
				xml += ' primaryMaritalStatusType="' + itemGeneral.primaryMaritalStatusType + '"';
				xml += ' secondaryMaritalStatusType="' + itemGeneral.secondaryMaritalStatusType + '"';
				xml += ' stateExemptions="' + itemGeneral.stateExemptions + '"';
				xml += ' stateAdjustmentType="' + itemGeneral.stateAdjustmentType + '"';
				xml += ' stateAdjustmentAmount="' + itemGeneral.stateAdjustmentAmount + '"';
				xml += ' sdiAdjustmentType="' + itemGeneral.sdiAdjustmentType + '"';
				xml += ' sdiRate="' + itemGeneral.sdiRate + '"';
				xml += ' primaryStateAdditionalInformation="' + itemGeneral.primaryStateAdditionalInformation + '"';
				xml += ' secondaryStateAdditionalInformation="' + itemGeneral.secondaryStateAdditionalInformation + '"';
			}
				
			if (me.actionType == "Rehire" || me.actionType == "NewHire" || me.actionType == "Local Tax") {
				xml += ' localTaxAdjustmentType="' + itemGeneral.localTaxAdjustmentType + '"';
				xml += ' localTaxAdjustmentAmount="' + itemGeneral.localTaxAdjustmentAmount + '"';
				xml += ' localTaxCode1="' + itemGeneral.localTaxCode1 + '"';
				xml += ' localTaxCode2="' + itemGeneral.localTaxCode2 + '"';
				xml += ' localTaxCode3="' + itemGeneral.localTaxCode3 + '"';
			}

			if (updateFlag == true) {
				xml += ' exportECard="true"';
				xml += ' employeeNameChanged="' + (me.employeeNameChanged ? true : false) + '"';
			}

			if (me.actionType == "Rehire" || 
				me.actionType == "NewHire" ||
				me.actionType == "Employee" ||
				me.actionType == "HouseCodeTransfer" ||
				me.actionType == "DateModification" ||
				me.actionType == "Job Information" ||
				me.actionType == "Compensation" || 
				me.actionType == "Termination" ||
				me.actionType == "Federal" ||
				me.actionType == "State Tax" ||
				me.actionType == "Local Tax" ||
				me.actionType == "BasicLifeIndicator" ||
				me.actionType == "ReverseTermination" ||
				updateFlag == true) {
				xml += '/>';
			}
								
			if (me.actionType == "NewHire") {
				xml += '<personRole id="0" personId="' + me.personId + '" roleId="2"/>';
			}
			
			return xml;
		},

		controlKeyProcessor: function fin_emp_UserInterface_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
			
				switch (event.keyCode) {
					case 39: //Right Arrow
						me.actionPreNext();
						break;
						
					case 37: //Left Arrow 
						me.actionBack();
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},

		saveResponse: function fin_emp_UserInterface_saveResponse() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id =  parseInt($(this).attr("id"), 10);			
			var status = $(args.xmlNode).attr("status");
			var successMessage = "";

			$("#pageLoading").hide();
			$("#popupLoading").hide();
			me.saving = false;

			if (status == "success") {

				if (me.employeeGenerals.length > 0) {
					if (me.statusTypes[me.employeeStatusType.indexSelected].id != me.employeeGenerals[0].statusType) 
						successMessage += "Employee status updates will be transmitted to Ceridian on Monday at 1:00PM EST.\n";
					else if (me.employeeNumberNew == 0) 
						successMessage += "Notice: Changes will be transmitted to Ceridian on Monday at 1:00 PM EST.\n";
				}
				me.isPageLoaded = false;
				
				if (me.employeeGenerals.length == 0 && me.employeeNumberNew > 0) //New Hire
					successMessage += "Employee Number " + me.employeeNumber.getValue() + " has been created and will be transmitted to Ceridian on Monday at 1:00 PM EST.\n";

				if (me.actionType == "Edit" ||
					me.actionType == "State Tax" ||
					me.actionType == "Person" ||
					me.actionType == "Local Tax" ||
					me.actionType == "Job Information" ||
					me.actionType == "Federal" ||
					me.actionType == "Employee" ||
					me.actionType == "Compensation") {
						me.confirmPopup = true;
						me.employeePayRateChanged = false;
						me.houseCodeJobChanged = false;
				}
				
				//set the Employee# to the SEARCH GRID if it is updated during HC Transfer.
				if (me.employeeNumberChanged && me.emps[me.employeeSearchSelectedRowIndex]) {
					me.emps[me.employeeSearchSelectedRowIndex].employeeNumber = me.employeeNumber.getValue();
					me.employeeSearch.body.renderRow(me.employeeSearchSelectedRowIndex, me.employeeSearchSelectedRowIndex);
				}
				
				me.employeeNumberChanged = false;
				me.actionCancel();
				me.alertMessage = 0;
				me.actionType = "Saved";
				me.actionNewEmployee();
				me.resizeControls();

				if (successMessage.length > 0)
					alert(successMessage);

				me.status = "";

				if (me.confirmPopup) {
					var value = confirm("Do you want to go back to Edit Wizard?");
					if (value) {
						me.confirmPopup = false;
						me.actionWizardSelect("Edit");						
					}
				}
			}
			else {
				alert("[SAVE FAILURE] Error while updating Employee Record: " + $(args.xmlNode).attr("message"));
			}
		},
		
		contextMenuProcessor: function fin_emp_UserInterface_contextMenuProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (me.noContext || me.mouseOverContext)
		        return;
		
		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;
		
		    // we assume we have a standards compliant browser, but check if we have IE
		    var target = event.target != null ? event.target : event.srcElement;
		
		    if (me.replaceContext) {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop : document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft : document.documentElement.scrollLeft;
		
		        // hide the menu first to avoid an "up-then-over" visual effect
				var contextMenu = document.getElementById('EmployeeSearchContext');

				contextMenu.style.display = "none";
				contextMenu.style.top = event.clientY + scrollTop + "px";
				contextMenu.style.left = event.clientX + scrollLeft + "px";
				contextMenu.style.display = "";			
		
		        me.replaceContext = false;
		
		        return false;
		    }
		},
		
		mouseDownProcessor: function fin_emp_UserInterface_mouseDownProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (event.button == 2)
				me.replaceContext = true;			
			else if (!me.mouseOverContext)
				$("#EmployeeSearchContext").hide();
		},
		
		contextSetup: function() {
			var me = this;
			
			$("#EmployeeSearchContextMenu tr:odd").addClass("gridRow");
        	$("#EmployeeSearchContextMenu tr:even").addClass("alternateGridRow");

			$("#EmployeeSearchContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
						
			$("#EmployeeSearchContextMenu tr").click(function() {

				if (this.id == "menuNewHire")
					me.actionWizardSelect("NewHire");
				else if (this.id == "menuRehire")
					me.actionWizardSelect("Rehire");
				else if (this.id == "menuHouseCodeTransfer")
					me.actionWizardSelect("HouseCodeTransfer");
				else if (this.id == "menuTermination")
					me.actionWizardSelect("Termination");
				else if (this.id == "menuEdit")
					me.actionWizardSelect("Edit");
				else if (this.id == "menuDateModification")
					me.actionWizardSelect("DateModification");
				else if (this.id == "menuBasicLifeIndicator")
					me.actionWizardSelect("BasicLifeIndicator");
				else if (this.id == "menuReverseTermination")
					me.actionWizardSelect("ReverseTermination");
					
				$("#EmployeeSearchContext").hide();
			});
	
			$("#EmployeeSearch")
				.mouseover(function() { 
					if (me.employeeSearch.activeRowIndex >= 0) 
						me.noContext = false;
				})
				.mouseout(function() { 
					me.noContext = true;
				});
			
			$("#EmployeeSearchContext")
				.mouseover(function() { 
					me.mouseOverContext = true;
				})
				.mouseout(function() { 
					me.mouseOverContext = false; 
				});
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

	$("#popupEmployee, #popupHistory").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#popupLoading, #popupHistory").css({
		"top": windowHeight/2 - popupHeight/2,
		"left": windowWidth/2 - popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

function main() {
	fin.empSearchUi = new fin.emp.UserInterface();
	fin.empSearchUi.resize();
	fin.houseCodeSearchUi = fin.empSearchUi;
}
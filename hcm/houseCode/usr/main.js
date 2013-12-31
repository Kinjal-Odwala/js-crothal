ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "ui.ctl.usr.checkList" );
ii.Import( "fin.hcm.houseCode.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.checkList", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.dateDropDown", 9 );

ii.Class({
    Name: "fin.hcm.houseCode.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var queryStringArgs = {}; 
			var queryString = location.search.substring(1); 
			var pairs = queryString.split("&");
			
			for (var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			parent.fin.hcmMasterUi.loadCount = 0;
			me.unitId = parseInt(queryStringArgs["unitId"]);

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master(); 
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();			
			me.configureCommunications();
			
			$("#pageBody").show();
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			$("#CheckBoxTextDropImage").click(function() {
				if ($("#ServiceGroup").is(":visible")) {
					$("#CheckBoxTextDropImage").html("<img src='/fin/cmn/usr/media/Common/edit.png' title='detail selection'/>");
					$("#ServiceGroup").hide("slow");
					
					me.additionalServiceDetails();
				}
				else {
					$("#CheckBoxTextDropImage").html("<img src='/fin/cmn/usr/media/Common/editSelected.png' title='detail selection'/>");
					$("#ServiceGroup").show("slow");
				}		
			});
		},
		
		authorizationProcess: function fin_hcm_houseCode_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);		
			
			if (me.isAuthorized) {				
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				parent.fin.hcmMasterUi.setLoadCount();
				me.jdeCompany.fetchingData();
				me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
				me.houseCodeSiteUnitsStore.fetch("unitId:" + me.unitId + ",userId:[user]", me.siteUnitsLoaded, me);
				me.serviceLine.fetchingData();
				me.houseCodeServiceStore.fetch("userId:[user],houseCodeId:" + parent.fin.hcmMasterUi.getHouseCodeId(), me.houseCodeServicesLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
				
			//HouseCode
			me.houseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.houseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabHouseCodeShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode");
			me.tabHouseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\Write");
			me.tabHouseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabHouseCode\\Read");
			//SectionHouseCode
			me.sectionHouseCodeShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode\\SectionHouseCode");
			me.sectionHouseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\Write");
			me.sectionHouseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\Read");
			//SectionServices
			me.sectionServicesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode\\SectionServices");
			me.sectionServicesWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionServices\\Write");
			me.sectionServicesReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionServices\\Read");
			//SectionManager
			me.sectionManagerShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode\\SectionManager");
			me.sectionManagerWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionManager\\Write");
			me.sectionManagerReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionManager\\Read");
			//SectionClient
			me.sectionClientShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode\\SectionClient");
			me.sectionClientWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionClient\\Write");
			me.sectionClientReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\SectionClient\\Read");
						
			//sh=sectionHouseCode
			me.shJDECompanyShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\JDECompany", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			me.shSiteShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\Site", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			me.shHouseCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\HouseCode", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			me.shStartDateShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\StartDate", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			me.shClosedDateShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\ClosedDate", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			me.shClosedReasonShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\ClosedReason", me.sectionHouseCodeShow, (me.sectionHouseCodeWrite || me.sectionHouseCodeReadOnly));
			
			me.shJDECompanyReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\JDECompany\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			me.shSiteReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\Site\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			me.shHouseCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\HouseCode\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			me.shStartDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\StartDate\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			me.shClosedDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\ClosedDate\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			me.shClosedReasonReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionHouseCode\\ClosedReason\\Read", me.sectionHouseCodeWrite, me.sectionHouseCodeReadOnly);
			
			//ss=sectionServices
			me.ssPrimaryServiceShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionServices\\PrimaryService", me.sectionServicesShow, (me.sectionServicesWrite || me.sectionServicesReadOnly));
			me.ssAdditionalServicesShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionServices\\AdditionalServices", me.sectionServicesShow, (me.sectionServicesWrite || me.sectionServicesReadOnly));
			me.ssEnforceLaborControlShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionServices\\EnforceLaborControl", me.sectionServicesShow, (me.sectionServicesWrite || me.sectionServicesReadOnly));
			me.ssServiceLineShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionServices\\ServiceLine", me.sectionServicesShow, (me.sectionServicesWrite || me.sectionServicesReadOnly));
			
			me.ssPrimaryServiceReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionServices\\PrimaryService\\Read", me.sectionServicesWrite, me.sectionServicesReadOnly);
			me.ssAdditionalServicesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionServices\\AdditionalServices\\Read", me.sectionServicesWrite, me.sectionServicesReadOnly);			
			me.ssEnforceLaborControlReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionServices\\EnforceLaborControl\\Read", me.sectionServicesWrite, me.sectionServicesReadOnly);			
			me.ssServiceLineReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionServices\\ServiceLine\\Read", me.sectionServicesWrite, me.sectionServicesReadOnly);
			
			//sm=SectionManager
			me.smManagerNameShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\ManagerName", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smEmailShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\Email", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smManagerPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\Phone", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smFaxShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\Fax", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smCellPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\CellPhone", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smPagerShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\Pager", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smManagerAssistantNameShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\AssistantName", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			me.smManagerAssistantPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionManager\\AssistantPhone", me.sectionManagerShow, (me.sectionManagerWrite || me.sectionManagerReadOnly));
			
			me.smManagerNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\ManagerName\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smEmailReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\Email\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smManagerPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\Phone\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smFaxReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\Fax\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smCellPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\CellPhone\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smPagerReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\Pager\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smManagerAssistantNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\AssistantName\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			me.smManagerAssistantPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionManager\\AssistantPhone\\Read", me.sectionManagerWrite, me.sectionManagerReadOnly);
			
			//sc=sectionClient
			me.scFirstNameShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\FirstName", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scLastNameShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\LastName", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scTitleShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\Title", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scClientPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\Phone", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scClientFaxShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\Fax", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scClientAssistantNameShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\AssistantName", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			me.scClientAssistantPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabHouseCode\\SectionClient\\AssistantPhone", me.sectionClientShow, (me.sectionClientWrite || me.sectionClientReadOnly));
			
			me.scFirstNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\FirstName\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scLastNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\LastName\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scTitleReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\Title\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scClientPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\Phone\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scClientFaxReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\Fax\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scClientAssistantNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\AssistantName\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			me.scClientAssistantPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabHouseCode\\SectionClient\\AssistantPhone\\Read", me.sectionClientWrite, me.sectionClientReadOnly);
			
			me.resetUIElements();
		},	
		
		sessionLoaded: function fin_hcm_houseCode_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		isCtrlVisible: function fin_hcm_houseCode_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.houseCodeWrite || me.houseCodeReadOnly)
				return true;
			
			if (me.tabHouseCodeWrite || me.tabHouseCodeReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_hcm_houseCode_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabHouseCodeReadOnly && !me.houseCodeReadOnly)
				return false;

			if (me.tabHouseCodeWrite && !me.houseCodeReadOnly)
				return false;

			if (me.houseCodeWrite)
				return false;
			
			if (me.houseCodeReadOnly) return true;
			if (me.tabHouseCodeReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_hcm_houseCode_UserInterface_resetUIElements() {
			var me = this;			
			
			//SectionHouseCode
			me.setControlState("JDECompanys", me.shJDECompanyReadOnly, me.shJDECompanyShow);			
			me.setControlState("Sites", me.shSiteReadOnly, me.shSiteShow);
			me.setControlState("HouseCodeNumber", me.shHouseCodeReadOnly, me.shHouseCodeShow);
			me.setControlState("StartDate", me.shStartDateReadOnly, me.shStartDateShow);
			me.setControlState("ClosedDate", me.shClosedDateReadOnly, me.shClosedDateShow);
			me.setControlState("ClosedReason", me.shClosedReasonReadOnly, me.shClosedReasonShow);
			
			//SectionServices
			me.setControlState("PrimaryServiceProvided", me.ssPrimaryServiceReadOnly, me.ssPrimaryServiceShow);			
			me.setControlState("AdditionalServiceContainer", me.ssAdditionalServicesReadOnly, me.ssAdditionalServicesShow);			
			me.setControlState("EnforceLaborControl", me.ssEnforceLaborControlReadOnly, me.ssEnforceLaborControlShow, "Radio", "LabelRadioEnforceLaborControl");			
			//me.setControlState("Gender", me.sgGenderReadOnly, me.sgGenderShow, "Radio", "LabelGeneralRadioButtonGender");
			me.setControlState("ServiceLine", me.ssServiceLineReadOnly, me.ssServiceLineShow);			
			
			//SectionManager 
			me.setControlState("ManagerName", me.smManagerNameReadOnly, me.smManagerNameShow);			
			me.setControlState("ManagerEmail", me.smEmailReadOnly, me.smEmailShow);			
			me.setControlState("ManagerPhone", me.smManagerPhoneReadOnly, me.smManagerPhoneShow);			
			me.setControlState("ManagerFax", me.smFaxReadOnly, me.smFaxShow);			
			me.setControlState("ManagerCellPhone", me.smCellPhoneReadOnly, me.smCellPhoneShow);			
			me.setControlState("ManagerPager", me.smPagerReadOnly, me.smPagerShow);			
			me.setControlState("ManagerAssistantName", me.smManagerAssistantNameReadOnly, me.smManagerAssistantNameShow);			
			me.setControlState("ManagerAssistantPhone", me.smManagerAssistantPhoneReadOnly, me.smManagerAssistantPhoneShow);			
			
			//SectionClient
			me.setControlState("ClientFirstName", me.scFirstNameReadOnly, me.scFirstNameShow);			
			me.setControlState("ClientLastName", me.scLastNameReadOnly, me.scLastNameShow);			
			me.setControlState("ClientTitle", me.scTitleReadOnly, me.scTitleShow);			
			me.setControlState("ClientPhone", me.scClientPhoneReadOnly, me.scClientPhoneShow);			
			me.setControlState("ClientFax", me.scClientFaxReadOnly, me.scClientFaxShow);			
			me.setControlState("ClientAssistantName", me.scClientAssistantNameReadOnly, me.scClientAssistantNameShow);			
			me.setControlState("ClientAssistantPhone", me.scClientAssistantPhoneReadOnly, me.scClientAssistantPhoneShow);			
		},
		
		setControlState: function(){
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean}, 
				ctrlShow: {type: Boolean, required: false, defaultValue: false}, 
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});
			var me = this;
			
			if (args.ctrlReadOnly && args.ctrlType != "Radio") {
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if (!args.ctrlShow && args.ctrlType != "Radio") {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
				
			}
			if (args.ctrlReadOnly && args.ctrlType == "Radio") {
				$("#" + args.ctrlName + "Yes").attr('disabled', true);
				$("#" + args.ctrlName + "No").attr('disabled', true);
			} 
			if (!args.ctrlShow && args.ctrlType == "Radio") {
				$("#" + args.ctrlDiv).hide();
			}			
			if (args.ctrlReadOnly && args.ctrlName == "AdditionalServiceContainer") {
				$("#CheckBoxTextDropImage").hide();
			} 
			if (!args.ctrlShow && args.ctrlName == "AdditionalServiceContainer") {
				$("#CheckBoxTextDropImage").hide();
			}			
		},
	
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.enforceLaborControl = $("#EnforceLaborControl");
			me.enforceLaborControlYes = $("#EnforceLaborControlYes");
			me.enforceLaborControlNo = $("#EnforceLaborControlNo");

			me.site = new ui.ctl.Input.DropDown.Filtered({
		        id: "Sites",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });	
			
			me.site.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.site.indexSelected == -1)
						this.setInvalid("Please select Site.");
				});
			
			me.houseCodeNumber = new ui.ctl.Input.Text({
		        id: "HouseCodeNumber",
		        maxLength: 16,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
		
			me.jdeCompany = new ui.ctl.Input.DropDown.Filtered({
		        id: "JDECompanys",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.jdeCompanyChanged(); parent.fin.hcmMasterUi.modified(); },
		        required: false
		    });	
			
			me.jdeCompany.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.jdeCompany.indexSelected == -1)
						this.setInvalid("Please select JDE Company.");
				});
			
			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDate.text.value;
					
					if (enteredText == "") 
						return;
											
					if (ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.closedDate = new ui.ctl.Input.Date({
		        id: "ClosedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
				
			me.closedDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.closedDate.text.value;
											
					if (enteredText != "" && ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
					
			me.closedReason = new ui.ctl.Input.Text({
		        id: "ClosedReason",
				maxLength: 255,
				textArea: true,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.primaryService = new ui.ctl.Input.DropDown.Filtered({
		        id: "PrimaryServiceProvided",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.primaryService.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.primaryService.indexSelected == -1)
						this.setInvalid("Please select the correct Primary Service.");
				});
				
			me.serviceLine = new ui.ctl.Input.DropDown.Filtered({
		        id: "ServiceLine",
				formatFunction: function(type) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			

			me.serviceGroup = new ui.ctl.Input.CheckList({
				id: "ServiceGroup",
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
			});
			
			me.managerName = new ui.ctl.Input.Text({
		        id: "ManagerName",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerEmail = new ui.ctl.Input.Text({
		        id: "ManagerEmail",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
		    
			me.managerEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var enteredText = me.managerEmail.getValue();
					
					if (enteredText == "") return;
					
					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
				});
			
			me.managerPhone = new ui.ctl.Input.Text({
		        id: "ManagerPhone",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.managerPhone.text.value;
					
					if (enteredText == "") return;

					me.managerPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");					
				});
			
			me.managerFax = new ui.ctl.Input.Text({
		        id: "ManagerFax",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerFax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.managerFax.text.value;
					
					if (enteredText == "") return;

					me.managerFax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerFax.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid fax number. Example: (999) 999-9999");
				});
			
			me.managerCellPhone = new ui.ctl.Input.Text({
		        id: "ManagerCellPhone",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerCellPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.managerCellPhone.text.value;
					
					if (enteredText == "") return;

					me.managerCellPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerCellPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid cell number. Example: (999) 999-9999");
				});
			
			me.managerPager = new ui.ctl.Input.Text({
		        id: "ManagerPager",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerPager.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.managerPager.text.value;
					
					if (enteredText == "") return;

					me.managerPager.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerPager.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid pager number. Example: (999) 999-9999");
				});
			
			me.managerAssistantName = new ui.ctl.Input.Text({
		        id: "ManagerAssistantName",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerAssistantPhone = new ui.ctl.Input.Text({
		        id: "ManagerAssistantPhone",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managerAssistantPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.managerAssistantPhone.text.value;
					
					if (enteredText == "") return;

					me.managerAssistantPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.managerAssistantPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
			
			me.clientFirstName = new ui.ctl.Input.Text({
		        id: "ClientFirstName",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientLastName = new ui.ctl.Input.Text({
		        id: "ClientLastName",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientTitle = new ui.ctl.Input.Text({
		        id: "ClientTitle",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientPhone = new ui.ctl.Input.Text({
		        id: "ClientPhone",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
		
					var enteredText = me.clientPhone.text.value;
					
					if (enteredText == "") return;

					me.clientPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.clientPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
			
			me.clientFax = new ui.ctl.Input.Text({
		        id: "ClientFax",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientFax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.clientFax.text.value;
					
					if (enteredText == "") return;

					me.clientFax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.clientFax.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid fax number. Example: (999) 999-9999");
				});
			
			me.clientAssistantName = new ui.ctl.Input.Text({
		        id: "ClientAssistantName",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientAssistantPhone = new ui.ctl.Input.Text({
		        id: "ClientAssistantPhone",
		        maxLength: 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.clientAssistantPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.clientAssistantPhone.text.value;
					
					if (enteredText == "") return;

					me.clientAssistantPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.clientAssistantPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
				
			$("#SitesText").bind("keydown", me, me.actionSearchItem);
			
			me.jdeCompany.text.tabIndex = 1;
			me.site.text.tabIndex = 2;
			me.houseCodeNumber.text.tabIndex = 3;
			me.startDate.text.tabIndex = 4;
			me.closedDate.text.tabIndex = 5;
			me.closedReason.text.tabIndex = 6;
			me.primaryService.text.tabIndex = 7;
			me.serviceLine.text.tabIndex = 8;
			me.managerName.text.tabIndex = 23;
			me.managerEmail.text.tabIndex = 24;
			me.managerPhone.text.tabIndex = 25;
			me.managerFax.text.tabIndex = 26;
			me.managerCellPhone.text.tabIndex = 27;
			me.managerPager.text.tabIndex = 28;
			me.managerAssistantName.text.tabIndex = 29;
			me.managerAssistantPhone.text.tabIndex = 30;
			me.clientFirstName.text.tabIndex = 40;
			me.clientLastName.text.tabIndex = 41;
			me.clientTitle.text.tabIndex = 42;
			me.clientPhone.text.tabIndex = 43;
			me.clientFax.text.tabIndex = 44;
			me.clientAssistantName.text.tabIndex = 45;
			me.clientAssistantPhone.text.tabIndex = 46;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.jdeCompany.resizeText();
			me.site.resizeText();
			me.houseCodeNumber.resizeText();
			me.startDate.resizeText();
			me.primaryService.resizeText();
			me.serviceLine.resizeText();
			me.managerName.resizeText();
			me.managerPhone.resizeText();
			me.managerFax.resizeText();
			me.managerCellPhone.resizeText();
			me.managerPager.resizeText();
			me.managerAssistantName.resizeText();
			me.managerAssistantPhone.resizeText();
			me.clientFirstName.resizeText();
			me.clientLastName.resizeText();
			me.clientTitle.resizeText();
			me.clientPhone.resizeText();
			me.clientFax.resizeText();
			me.clientAssistantName.resizeText();
			me.clientAssistantPhone.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_hcm_houseCode_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});			
			var me = this;
			
			me.siteTypes = [];
			me.siteTypeStore = me.cache.register({
				storeId: "siteTypes",
				itemConstructor: fin.hcm.houseCode.SiteType,
				itemConstructorArgs: fin.hcm.houseCode.siteTypeArgs,
				injectionArray: me.siteTypes
			});			
			
			me.houseCodeServices = [];
			me.houseCodeServiceStore = me.cache.register({
				storeId: "houseCodeServiceMasters",
				itemConstructor: fin.hcm.houseCode.HouseCodeService,
				itemConstructorArgs: fin.hcm.houseCode.houseCodeServiceArgs,
				injectionArray: me.houseCodeServices
			});			

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.houseCode.ServiceType,
				itemConstructorArgs: fin.hcm.houseCode.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.jdeServices = [];
			me.jdeServiceStore = me.cache.register({
				storeId: "houseCodeJDEServices",
				itemConstructor: fin.hcm.houseCode.JDEService,
				itemConstructorArgs: fin.hcm.houseCode.jdeServiceArgs,
				injectionArray: me.jdeServices
			});
			
			me.houseCodeSiteUnits = [];
			me.houseCodeSiteUnitsStore = me.cache.register({
				storeId: "appSiteUnits",
				itemConstructor: fin.hcm.houseCode.HouseCodeSiteUnit,
				itemConstructorArgs: fin.hcm.houseCode.houseCodeSiteUnitArgs,
				injectionArray: me.houseCodeSiteUnits
			});	
			
			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.hcm.houseCode.JdeCompany,
				itemConstructorArgs: fin.hcm.houseCode.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});
			
			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.houseCode.ServiceLine,
				itemConstructorArgs: fin.hcm.houseCode.serviceLineArgs,
				injectionArray: me.serviceLines
			});						
		},
		
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});							
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
					case 83: // Ctrl+S
						parent.fin.hcmMasterUi.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						parent.fin.hcmMasterUi.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.site.fetchingData();
				me.siteTypeStore.reset();
				me.siteTypeStore.fetch("userId:[user],title:" + me.site.text.value, me.siteTypesLoaded, me);
			}
		},	
		
		siteTypesLoaded: function(me, activeId) {
		
			ii.trace("HouseCode - SitesLoaded", ii.traceTypes.information, "Info");
						
            me.site.reset();
			me.site.setData(me.siteTypes);
			
			if (me.siteTypes.length > 0)
				me.site.select(0, me.site.focused);
		},
		
		jdeCompanysLoaded: function(me, activeId) {
		
			ii.trace("HouseCode - JdeCompaniesLoaded", ii.traceTypes.information, "Info");
            
			me.jdeCompany.reset();
            me.jdeCompanys.unshift(new fin.hcm.houseCode.JdeCompany({ id: 0, number: 0, name: "None" }));
			me.jdeCompany.setData(me.jdeCompanys);
			me.jdeCompany.select(0, me.jdeCompany.focused);
		},
	
		houseCodeServicesLoaded: function (me, activeId) {
            
			ii.trace("HouseCode - HouseCodeServicesLoaded", ii.traceTypes.information, "Info");

			var serviceLinesTemp = [];

			for (var index = 0; index < me.serviceLines.length; index++) {
				if (!me.serviceLines[index].financialEntity) {
					var item = new fin.hcm.houseCode.ServiceLine({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
					serviceLinesTemp.push(item);
				}
			}
			
			me.serviceLines = serviceLinesTemp;
			me.serviceLines.unshift(new fin.hcm.houseCode.ServiceLine({id: 0, name: "None"}));
			me.serviceLine.setData(me.serviceLines);
			me.serviceLine.select(0, me.serviceLine.focused);
			
			me.houseCodesLoaded();
		},		
		
		additionalServiceDetails: function() {
			var me = this;
			var serviceNames = "", item;
			
			for (var index in me.serviceGroup.selectedItems){
				item = ii.ajax.util.findItemById(me.serviceGroup.selectedItems[index].id.toString(), me.jdeServices);
				if (item)
					serviceNames += item.name + ", ";
			}

			$("#AdditionalServiceContainer").html(serviceNames.substring(0, serviceNames.length - 2));			
		},
		
		siteUnitsLoaded: function(me, activeId) {	
			
			ii.trace("HouseCode - SiteUnitsLoaded", ii.traceTypes.information, "Info");
			
			if (me.houseCodeSiteUnits[0]) {
				if (me.houseCodeSiteUnits[0].appSite > 0) {
					me.site.fetchingData();
					me.siteTypeStore.fetch("userId:[user],siteId:" + me.houseCodeSiteUnits[0].appSite, me.siteTypesLoaded, me);
				}
			}
		},		
		
		jdeCompanyChanged: function() {
			var me = this;
			
			if (me.jdeCompany.indexSelected < 0) return;
			
			me.primaryService.fetchingData();
			me.jdeServiceStore.fetch("userId:[user],jdeCompanyId:" + me.jdeCompanys[me.jdeCompany.indexSelected].id, me.jdeServicesLoaded, me);
		},
		
		jdeServicesLoaded: function(me, activeId) {
			var serviceNames = "", item;
			
			me.primaryService.reset();
			me.primaryService.setData(me.jdeServices);
			
			me.serviceGroup.reset();
			me.serviceGroup.renderPending = true;
			me.serviceGroup.setList(me.jdeServices);
			me.serviceGroup.setData(me.houseCodeServices);
			
			if (me.setHouseCodeServices) {//on pageload or housecodeChange
				if (parent.fin.hcmMasterUi.houseCodeDetails[0]) {
					index = ii.ajax.util.findIndexById(parent.fin.hcmMasterUi.houseCodeDetails[0].serviceTypeId.toString(), me.jdeServices);
					if (index != undefined) 
						me.primaryService.select(index, me.primaryService.focused);
				}
				
				for (var index in me.serviceGroup.selectedItems) {			
					item = ii.ajax.util.findItemById(me.serviceGroup.selectedItems[index].id.toString(), me.jdeServices);
					if (item)
						serviceNames += item.name + ", ";
				}
	
				$("#AdditionalServiceContainer").html(serviceNames.substring(0, serviceNames.length - 2));
				me.setHouseCodeServices = false;
			}
			else { //clear if JdeCompanyChange
				me.primaryService.reset();
				me.serviceGroup.reset();
				$("#AdditionalServiceContainer").html("");
			}
		},
		
		houseCodesLoaded: function() {
			var me = this;
			var index = 0;
			
			ii.trace("HouseCode - HouseCodesLoaded", ii.traceTypes.information, "Info");
			
			if (parent.fin.hcmMasterUi == undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] == undefined) return;

			var houseCode = parent.fin.hcmMasterUi.houseCodeDetails[0];

			me.houseCodeNumber.setValue(parent.fin.hcmMasterUi.getHouseCodeBrief());
			$("#HouseCodeNumberText").attr('readonly', true);
			
			if (houseCode.jdeCompanyId) {
				index = ii.ajax.util.findIndexById(houseCode.jdeCompanyId.toString(), me.jdeCompanys);
				if (index) {
					me.jdeCompany.select(index, me.jdeCompany.focused);
					me.setHouseCodeServices = true;
					me.jdeCompanyChanged();
				}
			}
			
			if (houseCode.startDate) {
				me.startDate.setValue(houseCode.startDate); 
			}
			
			me.closedDate.setValue(houseCode.closedDate);
			me.closedReason.setValue(houseCode.closedReason);
			
			if (houseCode.serviceLineId) {
				index = ii.ajax.util.findIndexById(houseCode.serviceLineId.toString(), me.serviceLines);
				if (index) 
					me.serviceLine.select(index, me.serviceLine.focused);
			}
			
			if (houseCode.enforceLaborControl)
				$("#EnforceLaborControlYes").attr('checked', true);
			else
				$("#EnforceLaborControlNo").attr('checked', true);

			if (houseCode.teamChimesAccount)
				$("#TeamChimesAccountYes").attr('checked', true);
			else
				$("#TeamChimesAccountNo").attr('checked', true);

			me.managerName.setValue(houseCode.managerName);
			me.managerEmail.setValue(houseCode.managerEmail);
			me.managerPhone.setValue(houseCode.managerPhone);
			me.managerFax.setValue(houseCode.managerFax);
			me.managerCellPhone.setValue(houseCode.managerCellPhone);
			me.managerPager.setValue(houseCode.managerPager);
			me.managerAssistantName.setValue(houseCode.managerAssistantName);
			me.managerAssistantPhone.setValue(houseCode.managerAssistantPhone);
			me.clientFirstName.setValue(houseCode.clientFirstName);
			me.clientLastName.setValue(houseCode.clientLastName);
			me.clientTitle.setValue(houseCode.clientTitle);
			me.clientPhone.setValue(houseCode.clientPhone);
			me.clientFax.setValue(houseCode.clientFax);
			me.clientAssistantName.setValue(houseCode.clientAssistantName);
			me.clientAssistantPhone.setValue(houseCode.clientAssistantPhone);

			parent.fin.hcmMasterUi.checkLoadCount();
			if (parent.parent.fin.appUI.modified)
				parent.fin.hcmMasterUi.setStatus("Edit");
			me.resizeControls();
		},
		
		reloadHouseCodeServices: function() {
			var me = this;			
			var item = null;
			var id = 0;
			var name = "";
			var houseCodeId = parent.fin.hcmMasterUi.getHouseCodeId();
			
			me.houseCodeServices = [];
			
			for (var index = 0; index < me.serviceGroup.selectedItems.length; index++) {
				id = me.serviceGroup.selectedItems[index].id;

				for (rowIndex = 0; rowIndex < me.serviceGroup.data.length; rowIndex++) {
					if (me.serviceGroup.data[rowIndex].id == id) {
						name = me.serviceGroup.data[rowIndex].name;
						break;
					}
				}

				item = new fin.hcm.houseCode.HouseCodeService(0, houseCodeId, id, id, name);
				me.houseCodeServices.push(item);
			}		
		}
	}
});

function disablePopup() {
	
	$("#CheckBoxTextDropImage").fadeOut("slow");
	$("#AdditionalServices").fadeOut("slow");
}

function main() {
	
	fin.hcmHouseCodeUi = new fin.hcm.houseCode.UserInterface();
	fin.hcmHouseCodeUi.resize();
}
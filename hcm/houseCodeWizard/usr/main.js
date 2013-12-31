ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.checkList" );
ii.Import( "fin.hcm.houseCodeWizard.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 ) ;
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.button", 4 );
ii.Style( "fin.cmn.usr.toolbar", 5 );
ii.Style( "fin.cmn.usr.input", 6 ) ;
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );
ii.Style( "fin.cmn.usr.checkList", 9 );

ii.Class({
    Name: "fin.hcm.houseCodeWizard.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		 
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.currentWizard = "";
			me.nextWizard = "";
			me.prevWizard = "";
			me.loadCount = 0;
				
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			if (!parent.fin.appUI.hirNode) parent.fin.appUI.hirNode = 0;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodeWizard";
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

			$("input[name='TimeAttendance']").change(function() { me.modified(true); });
			$("input[name='DefaultLunchBreak']").change(function() { me.modified(true); });
			$("input[name='LunchBreakTrigger']").change(function() { me.modified(true); });
			$("input[name='HouseCodeType']").change(function() { me.modified(true); });
			$("input[name='RoundingTimePeriod']").change(function() { me.modified(true); });
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },

		resize: function() {
			var me = this;
			var offset = 120;

		    $("#divHouseCode").height($(window).height() - offset);
		    $("#divStatistics").height($(window).height() - offset);
		    $("#divFinancial").height($(window).height() - offset);
		    $("#divPayroll").height($(window).height() - offset);
			$("#divSafety").height($(window).height() - offset);
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

		authorizationProcess: function fin_hcm_houseCodeWizard_UserInterface_authorizationProcess() {
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
				
				// Fetch the default house code after loading the security nodes to set the wizard correctly.
				if (parent.fin.appUI.houseCodeId == 0)
					me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
				else {
					me.houseCodesLoaded(me, 0);
				}
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";

			//HouseCode
			me.houseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.houseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabHouseCodeShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode");
			me.tabHouseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\Write");
			me.tabHouseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\Read");
			
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

			//Statistics
			me.statisticsWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.statisticsReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabStatisticsShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabStatistics");
			me.tabStatisticsWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabStatistics\\Write");
			me.tabStatisticsReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabStatistics\\Read");
						
			//ts=tabStatistics
			me.tsManagedEmployeesShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\ManagedEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsCrothallEmployeesShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\CrothallEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedsLicensedShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\BedsLicensed", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedsActiveShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\BedsActive", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsPatientDaysShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\PatientDays", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAdjustedPatientDaysShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AdjustedPatientDays", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsDailyCensusShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\DailyCensus", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualDischargesShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualDischarges", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualTransfersShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualTransfers", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedTurnaroundTimeShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\BedTurnaroundTime", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsCleanableSquareFeetShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\CleanableSquareFeet", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualTransportsShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualTransports", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));			
			me.tsLundryShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\Lundry", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTerminatedHourlyEmployeesShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTerminatedHourlyEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeActiveHourlyEmployeesShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeActiveHourlyEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalProductiveLaborHoursWorkedShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborHoursWorked", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalNonProductiveLaborHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalProductiveLaborDollarsPaidShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborDollarsPaid", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborDollarsPaid", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsHospitalPaidJanitorialPaperPlasticSupplyCostShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\HospitalPaidJanitorialPaperPlasticSupplyCost", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBuildingPopulationShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\BuildingPopulation", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMaintainableAcresShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\MaintainableAcres", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsScientistsShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\Scientists", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsManagedRoomsShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\ManagedRooms", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsSiteTypeShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\SiteType", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsIntegratorShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\Integrator", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsIntegratorNameShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\IntegratorName", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAuditScoreShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AuditScore", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsStandardizationScoreShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\StandardizationScore", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAdminHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\AdminHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsSurgicalHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\SurgicalHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsEDHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\EDHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsGroundsHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\GroundsHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsOtherLockInHoursShow = me.isCtrlVisibleTabStatistics(me.authorizePath + "\\TabStatistics\\OtherLockInHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			
			me.tsManagedEmployeesReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\ManagedEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsCrothallEmployeesReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\CrothallEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedsLicensedReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\BedsLicensed\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedsActiveReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\BedsActive\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsPatientDaysReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\PatientDays\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAdjustedPatientDaysReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AdjustedPatientDays\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsDailyCensusReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\DailyCensus\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualDischargesReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualDischarges\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualTransfersReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualTransfers\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedTurnaroundTimeReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\BedTurnaroundTime\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsCleanableSquareFeetReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\CleanableSquareFeet\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualTransportsReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AnnualTransports\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsLundryReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\Lundry\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTerminatedHourlyEmployeesReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTerminatedHourlyEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeActiveHourlyEmployeesReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeActiveHourlyEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalProductiveLaborHoursWorkedReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborHoursWorked\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalNonProductiveLaborHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalProductiveLaborDollarsPaidReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborDollarsPaid\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborDollarsPaid\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsHospitalPaidJanitorialPaperPlasticSupplyCostReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\HospitalPaidJanitorialPaperPlasticSupplyCost\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBuildingPopulationReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\BuildingPopulation\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMaintainableAcresReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\MaintainableAcres\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsScientistsReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\Scientists\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsManagedRoomsReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\ManagedRooms\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsSiteTypeReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\SiteType\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsIntegratorReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\Integrator\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsIntegratorNameReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\IntegratorName\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAuditScoreReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AuditScore\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsStandardizationScoreReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\StandardizationScore\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAdminHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\AdminHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsSurgicalHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\SurgicalHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsEDHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\EDHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsGroundsHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\GroundsHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsOtherLockInHoursReadOnly = me.isCtrlReadOnlyTabStatistics(me.authorizePath + "\\TabStatistics\\OtherLockInHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			
			//Financial
			me.financialWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.financialReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabFinancialShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial");
			me.tabFinancialWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\Write");
			me.tabFinancialReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabFinancial\\Read");
			
			//SectionShipping
			me.sectionShippingShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial\\SectionShipping");
			me.sectionShippingWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionShipping\\Write");
			me.sectionShippingReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionShipping\\Read");
			//SectionInvoices
			me.sectionInvoicesShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial\\SectionInvoices");
			me.sectionInvoicesWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Write");
			me.sectionInvoicesReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Read");
			//SectionFinancial
			me.sectionFinancialShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial\\SectionFinancial");
			me.sectionFinancialWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Write");
			me.sectionFinancialReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Read");

			//ss=SectionShipping
			me.ssCompanyShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Company", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssAddress1Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address1", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssAddress2Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address2", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssCityShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\City", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssStateShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\State", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssPostalCodeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\PostalCode", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			
			me.ssCompanyReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Company\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssAddress1ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address1\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssAddress2ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address2\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssCityReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\City\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssStateReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\State\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssPostalCodeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionShipping\\PostalCode\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			
			//si=SectionInvoices
			me.siRemitToShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\RemitTo", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siTitleShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Title", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siAddress1Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address1", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siAddress2Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address2", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siCityShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\City", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siStateShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\State", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siPostalCodeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\PostalCode", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			
			me.siRemitToReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\RemitTo\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siTitleReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Title\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siAddress1ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address1\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siAddress2ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address2\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siCityReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\City\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siStateReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\State\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siPostalCodeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionInvoices\\PostalCode\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			
			//sf=SectionFinancial
			me.sfContractTypeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\ContractType", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfTermsOfContractShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\TermsOfContract", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBillingCycleFrequencyShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BillingCycleFrequency", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfFinancialEntityShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\FinancialEntity", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankCodeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankCode", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankAccountShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankAccount", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankNameShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankName", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfContactShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Contact", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfAddress1Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address1", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfAddress2Show = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address2", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfCityShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\City", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfStateShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\State", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfPostalCodeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\PostalCode", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfPhoneShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Phone", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfFaxShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Fax", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfEmailShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Email", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfInvoiceLogoShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\InvoiceLogo", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetTemplateShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetTemplate", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetLaborCalcMethodShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetLaborCalcMethod", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetComputerRelatedChargeShow = me.isCtrlVisibleTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetComputerRelatedCharge", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			
			me.sfContractTypeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\ContractType\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfTermsOfContractReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\TermsOfContract\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBillingCycleFrequencyReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BillingCycleFrequency\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfFinancialEntityReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\FinancialEntity\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankCodeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankCode\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankAccountReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankAccount\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankNameReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankName\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfContactReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Contact\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfAddress1ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address1\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfAddress2ReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address2\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfCityReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\City\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfStateReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\State\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfPostalCodeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\PostalCode\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfPhoneReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Phone\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfFaxReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Fax\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfEmailReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Email\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfInvoiceLogoReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\InvoiceLogo\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetTemplateReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetTemplate\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetLaborCalcMethodReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetLaborCalcMethod\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetComputerRelatedChargeReadOnly = me.isCtrlReadOnlyTabFinancial(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetComputerRelatedCharge\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);

			//Payroll
			me.payrollWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.payrollReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabPayrollShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll");
			me.tabPayrollWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabPayroll\\Write");
			me.tabPayrollReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabPayroll\\Read");
						
			//tp=tabPayroll
			me.tpPayrollProcessingLocationShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\PayrollProcessingLocation", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpTimeAndAttendanceShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\TimeAndAttendance", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpDefaultLunchBreakShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\DefaultLunchBreak", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpLunchBreakTriggerShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\LunchBreakTrigger", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpHouseCodeTypeShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\HouseCodeType", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpRoundingTimePeriodShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\RoundingTimePeriod", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpEPaySiteShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\EPaySite", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpEPayTaskShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\EPayTask", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpCeridianCompanyHourlyShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\CeridianCompanyHourly", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));
			me.tpCeridianCompanySalariedShow = me.isCtrlVisibleTabPayroll(me.authorizePath + "\\TabPayroll\\CeridianCompanySalaried", me.tabPayrollShow, (me.tabPayrollWrite || me.tabPayrollReadOnly));			
			
			me.tpPayrollProcessingLocationReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\PayrollProcessingLocation\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpTimeAndAttendanceReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\TimeAndAttendance\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpDefaultLunchBreakReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\DefaultLunchBreak\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpLunchBreakTriggerReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\LunchBreakTrigger\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpHouseCodeTypeReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\HouseCodeType\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpRoundingTimePeriodReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\RoundingTimePeriod\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpEPaySiteReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\EPaySite\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpEPayTaskReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\EPayTask\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpCeridianCompanyHourlyReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\CeridianCompanyHourly\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);
			me.tpCeridianCompanySalariedReadOnly = me.isCtrlReadOnlyTabPayroll(me.authorizePath + "\\TabPayroll\\CeridianCompanySalaried\\Read", me.tabPayrollWrite, me.tabPayrollReadOnly);

			//Safety
			me.safetyWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.safetyReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabSafetyShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabSafety");
			me.tabSafetyWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabSafety\\Write");
			me.tabSafetyReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabSafety\\Read");

			//ts=tabSafety
			me.tsIncidentFrequencyRateShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\IncidentFrequencyRate", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsTRIRShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\TRIR", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsLostDaysShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\LostDays", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsReportedClaimsShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\ReportedClaims", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsNearMissesShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\NearMisses", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));
			me.tsOSHARecordableShow = me.isCtrlVisibleTabSafety(me.authorizePath + "\\TabSafety\\OSHARecordable", me.tabSafetyShow, (me.tabSafetyWrite || me.tabSafetyReadOnly));

			me.tsIncidentFrequencyRateReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\IncidentFrequencyRate\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsTRIRReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\TRIR\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsLostDaysReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\LostDays\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsReportedClaimsReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\ReportedClaims\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsNearMissesReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\NearMisses\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);
			me.tsOSHARecordableReadOnly = me.isCtrlReadOnlyTabSafety(me.authorizePath + "\\TabSafety\\OSHARecordable\\Read", me.tabSafetyWrite, me.tabSafetyReadOnly);

			if (me.houseCodeWrite || me.houseCodeReadOnly) {
				me.tabHouseCodeShow = true;
				me.tabStatisticsShow = true;
				me.tabFinancialShow = true;
				me.tabPayrollShow = true;
				me.tabSafetyShow = true;
			}
			
			me.resetUIElements();
		},	
		
		sessionLoaded: function fin_hcm_houseCode_UserInterface_sessionLoaded() {
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
		
		isCtrlVisibleTabStatistics: function fin_hcm_statistics_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.statisticsWrite || me.statisticsReadOnly)
				return true;
			
			if (me.tabStatisticsWrite || me.tabStatisticsReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnlyTabStatistics: function fin_hcm_statistics_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabStatisticsReadOnly && !me.statisticsReadOnly)
				return false;

			if (me.tabStatisticsWrite && !me.statisticsReadOnly)
				return false;

			if (me.statisticsWrite)
				return false;
			
			if (me.statisticsReadOnly) return true;
			if (me.tabStatisticsReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		isCtrlVisibleTabFinancial: function fin_hcm_financial_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});			
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.financialWrite || me.financialReadOnly)
				return true;
			
			if (me.tabFinancialWrite || me.tabFinancialReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnlyTabFinancial: function fin_hcm_financial_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabFinancialReadOnly && !me.financialReadOnly)
				return false;

			if (me.tabFinancialWrite && !me.financialReadOnly)
				return false;

			if (me.houseCodeWrite)
				return false;
			
			if (me.financialReadOnly) return true;
			if (me.tabFinancialReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		isCtrlVisibleTabPayroll: function fin_hcm_payroll_UserInterface_isCtrlVisible() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.payrollWrite || me.payrollReadOnly)
				return true;
			
			if (me.tabPayrollWrite || me.tabPayrollReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnlyTabPayroll: function fin_hcm_payroll_UserInterface_isCtrlReadOnly() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabPayrollReadOnly && !me.payrollReadOnly)
				return false;

			if (me.tabPayrollWrite && !me.payrollReadOnly)
				return false;

			if (me.payrollWrite)
				return false;
			
			if (me.payrollReadOnly) return true;
			if (me.tabPayrollReadOnly) return true;
			if (args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		isCtrlVisibleTabSafety: function fin_hcm_houseCodeWizard_UserInterface_isCtrlVisibleTabSafety() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if (me.safetyWrite || me.safetyReadOnly)
				return true;
			
			if (me.tabSafetyWrite || me.tabSafetyReadOnly)
				return true;

			if (args.sectionReadWrite)
				return true;

			if (args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnlyTabSafety: function fin_hcm_houseCodeWizard_UserInterface_isCtrlReadOnlyTabSafety() { 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});			
			var me = this;

			if (args.sectionWrite && !me.tabSafetyReadOnly && !me.safetyReadOnly)
				return false;

			if (me.tabSafetyWrite && !me.safetyReadOnly)
				return false;

			if (me.safetyWrite)
				return false;
			
			if (me.safetyReadOnly) return true;
			if (me.tabSafetyReadOnly) return true;
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

			//Statistics
			me.setControlState("ManagedEmployees", me.tsManagedEmployeesReadOnly, me.tsManagedEmployeesShow);			
			me.setControlState("CrothallEmployees", me.tsCrothallEmployeesReadOnly, me.tsCrothallEmployeesShow);						
			me.setControlState("BedsLicensed", me.tsBedsLicensedReadOnly, me.tsBedsLicensedShow);						
			me.setControlState("BedsActive", me.tsBedsActiveReadOnly, me.tsBedsActiveShow);						
			me.setControlState("PatientDays", me.tsPatientDaysReadOnly, me.tsPatientDaysShow);						
			me.setControlState("AdjustedPatientDays", me.tsAdjustedPatientDaysReadOnly, me.tsAdjustedPatientDaysShow);						
			me.setControlState("AvgDailyCensus", me.tsDailyCensusReadOnly, me.tsDailyCensusShow);						
			me.setControlState("AnnualDischarges", me.tsAnnualDischargesReadOnly, me.tsAnnualDischargesShow);						
			me.setControlState("AnnualTransfers", me.tsAnnualTransfersReadOnly, me.tsAnnualTransfersShow);						
			me.setControlState("AvgBedTurnaroundTime", me.tsBedTurnaroundTimeReadOnly, me.tsBedTurnaroundTimeShow);						
			me.setControlState("NetCleanableSquareFeet", me.tsCleanableSquareFeetReadOnly, me.tsCleanableSquareFeetShow);						
			me.setControlState("AnnualTransports", me.tsAnnualTransportsReadOnly, me.tsAnnualTransportsShow);						
			me.setControlState("AvgLaundryLBS", me.tsLundryReadOnly, me.tsLundryShow);						
			me.setControlState("MgmtFeeTerminatedHourlyEmployees", me.tsMgmtFeeTerminatedHourlyEmployeesReadOnly, me.tsMgmtFeeTerminatedHourlyEmployeesShow);						
			me.setControlState("MgmtFeeActiveHourlyEmployees", me.tsMgmtFeeActiveHourlyEmployeesReadOnly, me.tsMgmtFeeActiveHourlyEmployeesShow);						
			me.setControlState("MgmtFeeTotalProductiveLaborHoursWorked", me.tsMgmtFeeTotalProductiveLaborHoursWorkedReadOnly, me.tsMgmtFeeTotalProductiveLaborHoursWorkedShow);						
			me.setControlState("MgmtFeeTotalNonProductiveLaborHours", me.tsMgmtFeeTotalNonProductiveLaborHoursReadOnly, me.tsMgmtFeeTotalNonProductiveLaborHoursShow);						
			me.setControlState("MgmtFeeTotalProductiveLaborDollarsPaid", me.tsMgmtFeeTotalProductiveLaborDollarsPaidReadOnly, me.tsMgmtFeeTotalProductiveLaborDollarsPaidShow);						
			me.setControlState("MgmtFeeTotalNonProductiveLaborDollarsPaid", me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidReadOnly, me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidShow);						
			me.setControlState("HospitalPaidJanitorialPaperPlasticSupplyCost", me.tsHospitalPaidJanitorialPaperPlasticSupplyCostReadOnly, me.tsHospitalPaidJanitorialPaperPlasticSupplyCostShow);						
			me.setControlState("BuildingPopulation", me.tsBuildingPopulationReadOnly, me.tsBuildingPopulationShow);
			me.setControlState("MaintainableAcres", me.tsMaintainableAcresReadOnly, me.tsMaintainableAcresShow);
			me.setControlState("Scientists", me.tsScientistsReadOnly, me.tsScientistsShow);
			me.setControlState("ManagedRooms", me.tsManagedRoomsReadOnly, me.tsManagedRoomsShow);
			me.setControlState("SiteType", me.tsSiteTypeReadOnly, me.tsSiteTypeShow);
			me.setControlState("Integrator", me.tsIntegratorReadOnly, me.tsIntegratorShow, "Check");
			me.setControlState("IntegratorName", me.tsIntegratorNameReadOnly, me.tsIntegratorNameShow);
			me.setControlState("AuditScore", me.tsAuditScoreReadOnly, me.tsAuditScoreShow);
			me.setControlState("StandardizationScore", me.tsStandardizationScoreReadOnly, me.tsStandardizationScoreShow);
			me.setControlState("AdminHours", me.tsAdminHoursReadOnly, me.tsAdminHoursShow);
			me.setControlState("SurgicalHours", me.tsSurgicalHoursReadOnly, me.tsSurgicalHoursShow);
			me.setControlState("EDHours", me.tsEDHoursReadOnly, me.tsEDHoursShow);
			me.setControlState("GroundsHours", me.tsGroundsHoursReadOnly, me.tsGroundsHoursShow);
			me.setControlState("OtherLockInHours", me.tsOtherLockInHoursReadOnly, me.tsOtherLockInHoursShow);
			
			//Financial
			//ss=SectionShipping
			me.setControlState("Company", me.ssCompanyReadOnly, me.ssCompanyShow);			
			me.setControlState("ShippingAddress1", me.ssAddress1ReadOnly, me.ssAddress1Show);
			me.setControlState("ShippingAddress2", me.ssAddress2ReadOnly, me.ssAddress2Show);
			me.setControlState("ShippingCity", me.ssCityReadOnly, me.ssCityShow);
			me.setControlState("ShippingState", me.ssStateReadOnly, me.ssStateShow);
			me.setControlState("ShippingZip", me.ssPostalCodeReadOnly, me.ssPostalCodeShow);						
			
			//si=SectionInvoices
			me.setControlState("RemitTo", me.siRemitToReadOnly, me.siRemitToShow);							
			me.setControlState("RemitToTitle", me.siTitleReadOnly, me.siTitleShow);							
			me.setControlState("RemitToAddress1", me.siAddress1ReadOnly, me.siAddress1Show);							
			me.setControlState("RemitToAddress2", me.siAddress2ReadOnly, me.siAddress2Show);							
			me.setControlState("RemitToCity", me.siCityReadOnly, me.siCityShow);							
			me.setControlState("RemitToState", me.siStateReadOnly, me.siStateShow);							
			me.setControlState("RemitToZip", me.siPostalCodeReadOnly, me.siPostalCodeShow);		
			
			//sf=SectionFinancial
			me.setControlState("ContractType", me.sfContractTypeReadOnly, me.sfContractTypeShow);							
			me.setControlState("TermsOfContract", me.sfTermsOfContractReadOnly, me.sfTermsOfContractShow);
			me.setControlState("BillingCycleFrequency", me.sfBillingCycleFrequencyReadOnly, me.sfBillingCycleFrequencyShow);
			me.setControlState("FinancialEntity", me.sfFinancialEntityReadOnly, me.sfFinancialEntityShow);
			me.setControlState("BankCodeNumber", me.sfBankCodeReadOnly, me.sfBankCodeShow);
			me.setControlState("BankAccountNumber", me.sfBankAccountReadOnly, me.sfBankAccountShow);
			me.setControlState("BankName", me.sfBankNameReadOnly, me.sfBankNameShow);
			me.setControlState("BankContact", me.sfContactReadOnly, me.sfContactShow);
			me.setControlState("BankAddress1", me.sfAddress1ReadOnly, me.sfAddress1Show);
			me.setControlState("BankAddress2", me.sfAddress2ReadOnly, me.sfAddress2Show);
			me.setControlState("BankCity", me.sfCityReadOnly, me.sfCityShow);
			me.setControlState("BankState", me.sfStateReadOnly, me.sfStateShow);
			me.setControlState("BankZip", me.sfPostalCodeReadOnly, me.sfPostalCodeShow);
			me.setControlState("BankPhone", me.sfPhoneReadOnly, me.sfPhoneShow);
			me.setControlState("BankFax", me.sfFaxReadOnly, me.sfFaxShow);
			me.setControlState("BankEmail", me.sfEmailReadOnly, me.sfEmailShow);
			me.setControlState("InvoiceLogo", me.sfInvoiceLogoReadOnly, me.sfInvoiceLogoShow);
			me.setControlState("BudgetTemplate", me.sfBudgetTemplateReadOnly, me.sfBudgetTemplateShow);
			me.setControlState("BudgetLaborCalcMethod", me.sfBudgetLaborCalcMethodReadOnly, me.sfBudgetLaborCalcMethodShow);
			me.setControlState("BudgetComputerRelatedCharge", me.sfBudgetComputerRelatedChargeReadOnly, me.sfBudgetComputerRelatedChargeShow, "Check", "BudgetComputerRelatedChargeCheck");
			
			//Payroll
			me.setControlState("PayrollPro", me.tpPayrollProcessingLocationReadOnly, me.tpPayrollProcessingLocationShow);			
			me.setControlState("TimeAttendance", me.tpTimeAndAttendanceReadOnly, me.tpTimeAndAttendanceShow, "Radio", "TimeAttendanceRadio");			
			me.setControlState("DefaultLunchBreak", me.tpDefaultLunchBreakReadOnly, me.tpDefaultLunchBreakShow, "Radio", "DefaultLunchBreakRadio");			
			me.setControlState("LunchBreakTrigger", me.tpLunchBreakTriggerReadOnly, me.tpLunchBreakTriggerShow, "Radio", "LunchBreakTriggerRadio");			
			me.setControlState("HouseCodeType", me.tpHouseCodeTypeReadOnly, me.tpHouseCodeTypeShow, "Radio", "HouseCodeTypeRadio");			
			me.setControlState("RoundingTimePeriod", me.tpRoundingTimePeriodReadOnly, me.tpRoundingTimePeriodShow, "Radio", "RoundingTimePeriodRadio");			
			me.setControlState("TimeAttendance", me.tpTimeAndAttendanceReadOnly, me.tpTimeAndAttendanceShow, "Radio", "TimeAttendanceRadio");			
			me.setControlState("EPaySite", me.tpEPaySiteReadOnly, me.tpEPaySiteShow, "Check", "EPaySiteCheckText");
			me.setControlState("EPayTask", me.tpEPayTaskReadOnly, me.tpEPayTaskShow, "Check", "EPayTaskCheck");			
			me.setControlState("CeridianCompanyHourly", me.tpCeridianCompanyHourlyReadOnly, me.tpCeridianCompanyHourlyShow);			
			me.setControlState("CeridianCompanySalaried", me.tpCeridianCompanySalariedReadOnly, me.tpCeridianCompanySalariedShow);
			
			//Safety
			me.setControlState("IncidentFrequencyRate", me.tsIncidentFrequencyRateReadOnly, me.tsIncidentFrequencyRateShow);
			me.setControlState("TRIR", me.tsTRIRReadOnly, me.tsTRIRShow);
			me.setControlState("LostDays", me.tsLostDaysReadOnly, me.tsLostDaysShow);
			me.setControlState("ReportedClaims", me.tsReportedClaimsReadOnly, me.tsReportedClaimsShow);
			me.setControlState("NearMisses", me.tsNearMissesReadOnly, me.tsNearMissesShow);
			me.setControlState("OSHARecordable", me.tsOSHARecordableReadOnly, me.tsOSHARecordableShow);			
		},
		
		setControlState: function() {
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

			//Payroll
			if (args.ctrlReadOnly && args.ctrlType != "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			
			if (!args.ctrlShow && args.ctrlType != "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlType != "Check") {
				$("#" + args.ctrlName + "Yes").attr('disabled', true);
				$("#" + args.ctrlName + "No").attr('disabled', true);
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "DefaultLunchBreak") {
				$("#" + args.ctrlName + "025").attr('disabled', true);
				$("#" + args.ctrlName + "050").attr('disabled', true);
				$("#" + args.ctrlName + "075").attr('disabled', true);
				$("#" + args.ctrlName + "100").attr('disabled', true);
				$("#" + args.ctrlName + "other").attr('disabled', true);
				$("#BreakOthersText").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "LunchBreakTrigger") {
				$("#" + args.ctrlName + "4").attr('disabled', true);
				$("#" + args.ctrlName + "6").attr('disabled', true);
				$("#" + args.ctrlName + "8").attr('disabled', true);
				$("#" + args.ctrlName + "Others").attr('disabled', true);
				$("#BreakTriggerText").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "HouseCodeType") {
				$("#" + args.ctrlName + "NU").attr('disabled', true);
				$("#" + args.ctrlName + "UCB").attr('disabled', true);
				$("#" + args.ctrlName + "UACB").attr('disabled', true);
			} 
			
			if (args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "RoundingTimePeriod") {
				$("#" + args.ctrlName + "15").attr('disabled', true);
				$("#" + args.ctrlName + "6").attr('disabled', true);
			}

			if (args.ctrlReadOnly && args.ctrlType == "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}
			
			if (args.ctrlReadOnly && args.ctrlType == "Check" && args.ctrlName == "EPaySite") {
				$("#EPayPayText").attr('disabled', true);
				$("#EPayPayAction").removeClass("iiInputAction");
			}
			
			if (!args.ctrlShow && (args.ctrlType == "Radio" || args.ctrlType == "Check")) {
				$("#" + args.ctrlDiv).hide();
			} 
		},

		defineFormControls: function() {			
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  

			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save House Code (Ctrl+S)", 
					title: "Save the current House Code.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to House Code (Ctrl+U)", 
					title: "Undo the changes to House Code being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})

			me.anchorNext = new ui.ctl.buttons.Sizeable({
				id: "AnchorNext",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Next&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNextItem(); },
				hasHotState: true
			});

			me.anchorPrev = new ui.ctl.buttons.Sizeable({
				id: "AnchorPrev",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Previous&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionPrevItem(); },
				hasHotState: true
			});
			
			//HouseCode
			me.site = new ui.ctl.Input.DropDown.Filtered({
		        id: "Sites",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
			
			me.jdeCompany = new ui.ctl.Input.DropDown.Filtered({
		        id: "JDECompanys",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.jdeCompanyChanged(); me.modified(); },
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
						this.setInvalid("Please enter valid date.");
				});
				
			me.closedDate = new ui.ctl.Input.Date({
		        id: "ClosedDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
				
			me.primaryService = new ui.ctl.Input.DropDown.Filtered({
		        id: "PrimaryServiceProvided",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
			
			me.serviceGroup = new ui.ctl.Input.CheckList({
				id: "ServiceGroup",
				changeFunction: function() { me.modified(); }
			});
			
			me.managerName = new ui.ctl.Input.Text({
		        id: "ManagerName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
				
			me.managerEmail = new ui.ctl.Input.Text({
		        id: "ManagerEmail",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			    
			me.managerEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managerEmail.getValue();

					if (enteredText == "") return;

					if (/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
				});
				
			me.managerPhone = new ui.ctl.Input.Text({
		        id: "ManagerPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
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
					changeFunction: function() { me.modified(); }
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
					changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
			
			me.managerAssistantPhone = new ui.ctl.Input.Text({
		        id: "ManagerAssistantPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientLastName = new ui.ctl.Input.Text({
		        id: "ClientLastName",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientTitle = new ui.ctl.Input.Text({
		        id: "ClientTitle",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientPhone = new ui.ctl.Input.Text({
		        id: "ClientPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
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
				changeFunction: function() { me.modified(); }
		    });
			
			me.clientAssistantPhone = new ui.ctl.Input.Text({
		        id: "ClientAssistantPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
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
			me.managerName.text.tabIndex = 20;
			me.managerEmail.text.tabIndex = 21;
			me.managerPhone.text.tabIndex = 22;
			me.managerFax.text.tabIndex = 23;
			me.managerCellPhone.text.tabIndex = 24;
			me.managerPager.text.tabIndex = 25;
			me.managerAssistantName.text.tabIndex = 26;
			me.managerAssistantPhone.text.tabIndex = 27;
			me.clientFirstName.text.tabIndex = 40;
			me.clientLastName.text.tabIndex = 41;
			me.clientTitle.text.tabIndex = 42;
			me.clientPhone.text.tabIndex = 43;
			me.clientFax.text.tabIndex = 44;
			me.clientAssistantName.text.tabIndex = 45;
			me.clientAssistantPhone.text.tabIndex = 46;
				
			//Statistics
			me.managedEmployees = new ui.ctl.Input.Text({
		        id: "ManagedEmployees",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.managedEmployees.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.managedEmployees.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.crothallEmployees = new ui.ctl.Input.Text({
		        id: "CrothallEmployees",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.crothallEmployees.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.crothallEmployees.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.bedsLicensed = new ui.ctl.Input.Text({
		        id: "BedsLicensed",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bedsLicensed.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.bedsLicensed.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.bedsActive = new ui.ctl.Input.Text({
		        id: "BedsActive",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bedsActive.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.bedsActive.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.patientDays = new ui.ctl.Input.Text({
		        id: "PatientDays",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.patientDays.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.patientDays.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.adjustedPatientDays = new ui.ctl.Input.Text({
		        id: "AdjustedPatientDays",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.adjustedPatientDays.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.adjustedPatientDays.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.avgDailyCensus = new ui.ctl.Input.Text({
		        id: "AvgDailyCensus",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.avgDailyCensus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.avgDailyCensus.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.annualDischarges = new ui.ctl.Input.Text({
		        id: "AnnualDischarges",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.annualDischarges.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.annualDischarges.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.annualTransfers = new ui.ctl.Input.Text({
		        id: "AnnualTransfers",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.annualTransfers.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.annualTransfers.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.avgBedTurnAroundTime = new ui.ctl.Input.Text({
		        id: "AvgBedTurnaroundTime",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.avgBedTurnAroundTime.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.avgBedTurnAroundTime.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.netCleanableSquareFeet = new ui.ctl.Input.Text({
		        id: "NetCleanableSquareFeet",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.netCleanableSquareFeet.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.netCleanableSquareFeet.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.annualTransports = new ui.ctl.Input.Text({
		        id: "AnnualTransports",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
		    
			me.annualTransports.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.annualTransports.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});
				
			me.avgLaundryLbs = new ui.ctl.Input.Text({
		        id: "AvgLaundryLBS",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.avgLaundryLbs.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.avgLaundryLbs.getValue();
					
					if (enteredText == "") return;

					if (/^\d+$/.test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.mgmtFeeTerminatedHourlyEmployees = new ui.ctl.Input.Text({
		        id: "MgmtFeeTerminatedHourlyEmployees",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeTerminatedHourlyEmployees
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.mgmtFeeTerminatedHourlyEmployees.getValue();
				
					if (enteredText == "") return;
	
					if (/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.mgmtFeeActiveHourlyEmployees = new ui.ctl.Input.Text({
		        id: "MgmtFeeActiveHourlyEmployees",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeActiveHourlyEmployees
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.mgmtFeeActiveHourlyEmployees.getValue();
					
					if (enteredText == "") return;
	
					if (/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.mgmtFeeTotalProductiveLaborHoursWorked = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalProductiveLaborHoursWorked",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeTotalProductiveLaborHoursWorked
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.mgmtFeeTotalProductiveLaborHoursWorked.getValue();
					
					if (enteredText == "") return;
	
					if (/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.mgmtFeeTotalNonProductiveLaborHours = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalNonProductiveLaborHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeTotalNonProductiveLaborHours
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.mgmtFeeTotalNonProductiveLaborHours.getValue();
					
					if (enteredText == "") return;
	
					if (/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false)
						this.setInvalid("Please enter valid number.");
				});

			me.mgmtFeeTotalProductiveLaborDollarsPaid = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalProductiveLaborDollarsPaid",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeTotalProductiveLaborDollarsPaid
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.isMoney )
				.addValidation( ui.ctl.Input.Validation.moneyRange, {
					min: -99999999.99,
					max: 99999999.99
				});

			me.mgmtFeeTotalNonProductiveLaborDollarsPaid = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalNonProductiveLaborDollarsPaid",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.mgmtFeeTotalNonProductiveLaborDollarsPaid
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.isMoney )
				.addValidation( ui.ctl.Input.Validation.moneyRange, {
					min: -99999999.99,
					max: 99999999.99
				});

			me.hospitalPaidJanitorialPaperPlasticSupplyCost = new ui.ctl.Input.Text({
		        id: "HospitalPaidJanitorialPaperPlasticSupplyCost",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });
			
			me.hospitalPaidJanitorialPaperPlasticSupplyCost
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.isMoney )
				.addValidation( ui.ctl.Input.Validation.moneyRange, {
					min: -99999999.99,
					max: 99999999.99
				});
					
			me.buildingPopulation = new ui.ctl.Input.Text({
		        id: "BuildingPopulation",
		        maxLength: 19,
				changeFunction: function() { me.modified(); }
		    });
			
			me.buildingPopulation.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.buildingPopulation.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,16}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});
			
			me.maintainableAcres = new ui.ctl.Input.Text({
		        id: "MaintainableAcres",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.scientists = new ui.ctl.Input.Text({
		        id: "Scientists",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.managedRooms = new ui.ctl.Input.Text({
		        id: "ManagedRooms",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.siteType = new ui.ctl.Input.DropDown.Filtered({
		        id: "SiteType",
				formatFunction: function( type ) { return type.name; },		        
				changeFunction: function() { me.modified(); }
		    });
			
			me.integrator = new ui.ctl.Input.Check({
		        id: "Integrator",
				required: false,
				changeFunction: function() { me.checkIntegrator(); me.modified(); }
		    });
			
			me.integratorName = new ui.ctl.Input.Text({
		        id: "IntegratorName",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.integratorName.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function( isFinal, dataMap) {

				if (!me.integrator.check.checked)
					this.valid = true;
			});
			
			me.auditScore = new ui.ctl.Input.Text({
		        id: "AuditScore",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.standardizationScore = new ui.ctl.Input.Text({
		        id: "StandardizationScore",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.adminHours = new ui.ctl.Input.Text({
		        id: "AdminHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });

			me.adminHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.adminHours.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,8}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});

			me.surgicalHours = new ui.ctl.Input.Text({
		        id: "SurgicalHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });

			me.surgicalHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.surgicalHours.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,8}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});

			me.edHours = new ui.ctl.Input.Text({
		        id: "EDHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });

			me.edHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.edHours.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,8}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});

			me.groundsHours = new ui.ctl.Input.Text({
		        id: "GroundsHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });

			me.groundsHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.groundsHours.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,8}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});

			me.otherLockInHours = new ui.ctl.Input.Text({
		        id: "OtherLockInHours",
		        maxLength: 11,
				changeFunction: function() { me.modified(); }
		    });

			me.otherLockInHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.otherLockInHours.getValue();

					if (enteredText == "") return;

					if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,8}(\\.\\d{1,2})?$")))
						this.setInvalid("Please enter numeric value. Expected number format is 99.99");
				});

			me.managedEmployees.text.tabIndex = 1;
			me.crothallEmployees.text.tabIndex = 2;
			me.bedsLicensed.text.tabIndex = 3;
			me.bedsActive.text.tabIndex = 4;
			me.patientDays.text.tabIndex = 5;
			me.adjustedPatientDays.text.tabIndex = 6;
			me.avgDailyCensus.text.tabIndex = 7;
			me.annualDischarges.text.tabIndex = 8;
			me.annualTransfers.text.tabIndex = 9;
			me.avgBedTurnAroundTime.text.tabIndex = 10;
			me.netCleanableSquareFeet.text.tabIndex = 11;
			me.annualTransports.text.tabIndex = 12;
			me.avgLaundryLbs.text.tabIndex = 13;			
			me.mgmtFeeTerminatedHourlyEmployees.text.tabIndex = 14;
			me.mgmtFeeActiveHourlyEmployees.text.tabIndex = 15;
			me.mgmtFeeTotalProductiveLaborHoursWorked.text.tabIndex = 16;
			me.mgmtFeeTotalNonProductiveLaborHours.text.tabIndex = 17;
			me.mgmtFeeTotalProductiveLaborDollarsPaid.text.tabIndex = 18;
			me.mgmtFeeTotalNonProductiveLaborDollarsPaid.text.tabIndex = 19;
			me.hospitalPaidJanitorialPaperPlasticSupplyCost.text.tabIndex = 20;
			me.buildingPopulation.text.tabIndex = 21;
			me.maintainableAcres.text.tabIndex = 22;
			me.scientists.text.tabIndex = 23;
			me.managedRooms.text.tabIndex = 24;
			me.siteType.text.tabIndex = 25;
			me.integrator.check.tabIndex = 26;
			me.integratorName.text.tabIndex = 27;
			me.auditScore.text.tabIndex = 28;
			me.standardizationScore.text.tabIndex = 29;
			me.adminHours.text.tabIndex = 30;
			me.surgicalHours.text.tabIndex = 31;
			me.edHours.text.tabIndex = 32;
			me.groundsHours.text.tabIndex = 33;
			me.otherLockInHours.text.tabIndex = 34;

			//Financial
			me.company = new ui.ctl.Input.Text({
		        id: "Company",
		        maxLength: 256,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingAddress1 = new ui.ctl.Input.Text({
		        id: "ShippingAddress1",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingAddress2 = new ui.ctl.Input.Text({
		        id: "ShippingAddress2",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingCity = new ui.ctl.Input.Text({
		        id: "ShippingCity",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingZip = new ui.ctl.Input.Text({
		        id: "ShippingZip",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.shippingZip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.shippingZip.getValue() == "") 
					return;

				if (ui.cmn.text.validate.postalCode(me.shippingZip.getValue()) == false)
					this.setInvalid("Please enter valid postal code. Example 99999 or 99999-9999");
			});
			
			me.shippingState = new ui.ctl.Input.DropDown.Filtered({
		        id: "ShippingState",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitTo = new ui.ctl.Input.DropDown.Filtered({
		        id: "RemitTo",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.remitToChanged(); me.modified();},
		        required: false
		    });
			
			me.remitTo.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.remitTo.indexSelected == -1)
						this.setInvalid("Please select the correct Remit To.");
				});
				
			me.remitToTitle = new ui.ctl.Input.Text({
		        id: "RemitToTitle",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToAddress1 = new ui.ctl.Input.Text({
		        id: "RemitToAddress1",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToAddress2 = new ui.ctl.Input.Text({
		        id: "RemitToAddress2",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToCity = new ui.ctl.Input.Text({
		        id: "RemitToCity",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToState = new ui.ctl.Input.Text({
		        id: "RemitToState",
		        maxLength: 64,
				changeFunction: function() { me.modified(); }
		    });
			
			me.remitToZip = new ui.ctl.Input.Text({
		        id: "RemitToZip",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
				
			me.contractType = new ui.ctl.Input.DropDown.Filtered({
		        id: "ContractType",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.contractType.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.contractType.indexSelected == -1)
						this.setInvalid("Please select the correct Contract Type.");
				});
				
			me.termsOfContract = new ui.ctl.Input.DropDown.Filtered({
		        id: "TermsOfContract",
				formatFunction: function( type ) { return type.name; },
		        required : false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.billingCycleFrequency = new ui.ctl.Input.DropDown.Filtered({
		        id: "BillingCycleFrequency",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.financialEntity = new ui.ctl.Input.DropDown.Filtered({
		        id: "FinancialEntity",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankCodeNumber = new ui.ctl.Input.Text({
		        id: "BankCodeNumber",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankAccountNumber = new ui.ctl.Input.Text({
		        id: "BankAccountNumber",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankName = new ui.ctl.Input.Text({
		        id: "BankName",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankContact = new ui.ctl.Input.Text({
		        id: "BankContact",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankAddress1 = new ui.ctl.Input.Text({
		        id: "BankAddress1",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankAddress2 = new ui.ctl.Input.Text({
		        id: "BankAddress2",
		        maxLength: 255,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankCity = new ui.ctl.Input.Text({
		        id: "BankCity",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankState = new ui.ctl.Input.DropDown.Filtered({
		        id: "BankState",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankZip = new ui.ctl.Input.Text({
		        id: "BankZip",
		        maxLength: 10,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankZip.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(function( isFinal, dataMap) {
					
				if (me.bankZip.getValue() == "") 
					return;

				if (ui.cmn.text.validate.postalCode(me.bankZip.getValue()) == false)
					this.setInvalid("Please enter valid postal code. Example 99999 or 99999-9999");
			});
			
			me.bankPhone = new ui.ctl.Input.Text({
		        id: "BankPhone",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankPhone.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
		
					var enteredText = me.bankPhone.text.value;
					
					if (enteredText == "") return;

					me.bankPhone.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.bankPhone.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid phone number. Example: (999) 999-9999");
				});
			
			me.bankFax = new ui.ctl.Input.Text({
		        id: "BankFax",
		        maxLength: 14,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankFax.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.bankFax.text.value;
					
					if (enteredText == "") return;

					me.bankFax.text.value = fin.cmn.text.mask.phone(enteredText);
					enteredText = me.bankFax.text.value;
					
					if (ui.cmn.text.validate.phone(enteredText) == false)
						this.setInvalid("Please enter valid fax number. Example: (999) 999-9999");
				});
			
			me.bankEmail = new ui.ctl.Input.Text({
		        id: "BankEmail",
		        maxLength: 100,
				changeFunction: function() { me.modified(); }
		    });
			
			me.bankEmail.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.bankEmail.getValue();
					
					if (enteredText == "") return;
					
					if (ui.cmn.text.validate.emailAddress(enteredText) == false)
						this.setInvalid("Please enter valid Email Address.");
			});
			
			me.invoiceLogo = new ui.ctl.Input.DropDown.Filtered({
		        id: "InvoiceLogo",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.budgetTemplate = new ui.ctl.Input.DropDown.Filtered({
		        id: "BudgetTemplate",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.budgetLaborCalcMethod = new ui.ctl.Input.DropDown.Filtered({
		        id: "BudgetLaborCalcMethod",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.budgetComputerRelatedCharge = new ui.ctl.Input.Check({
		        id: "BudgetComputerRelatedCharge",
				required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.company.text.readOnly = true;
			me.remitToTitle.text.readOnly = true;
			me.remitToAddress1.text.readOnly = true;
			me.remitToAddress2.text.readOnly = true;
			me.remitToCity.text.readOnly = true;
			me.remitToState.text.readOnly = true;
			me.remitToZip.text.readOnly = true;
			
			me.company.text.tabIndex = 1;
			me.shippingAddress1.text.tabIndex = 2;
			me.shippingAddress2.text.tabIndex = 3;
			me.shippingCity.text.tabIndex = 4;
			me.shippingState.text.tabIndex = 5;
			me.shippingZip.text.tabIndex = 6;			
			me.remitTo.text.tabIndex = 7;
			me.remitToTitle.text.tabIndex = 8;
			me.remitToAddress1.text.tabIndex = 9;
			me.remitToAddress2.text.tabIndex = 10;
			me.remitToCity.text.tabIndex = 11;
			me.remitToState.text.tabIndex = 12;
			me.remitToZip.text.tabIndex = 13;			
			me.contractType.text.tabIndex = 14;
			me.termsOfContract.text.tabIndex = 15;
			me.billingCycleFrequency.text.tabIndex = 16;
			me.financialEntity.text.tabIndex = 17;
			me.bankCodeNumber.text.tabIndex = 18;
			me.bankAccountNumber.text.tabIndex = 19;
			me.bankName.text.tabIndex = 20;
			me.bankContact.text.tabIndex = 21;			
			me.bankAddress1.text.tabIndex = 22;
			me.bankAddress2.text.tabIndex = 23;
			me.bankCity.text.tabIndex = 24;
			me.bankState.text.tabIndex = 25;
			me.bankZip.text.tabIndex = 26;			
			me.bankPhone.text.tabIndex = 27;
			me.bankFax.text.tabIndex = 28;
			me.bankEmail.text.tabIndex = 29;
			me.invoiceLogo.text.tabIndex = 30;
			me.budgetTemplate.text.tabIndex = 31;
			me.budgetLaborCalcMethod.text.tabIndex = 32;
			me.budgetComputerRelatedCharge.check.tabIndex = 33;

			//Payroll
			me.payrollProcessing = new ui.ctl.Input.DropDown.Filtered({
		        id: "PayrollPro",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });	
			
			me.breakOthers = new ui.ctl.Input.Text({
		        id: "BreakOthers",
		        maxLength: 5,
				changeFunction: function() { me.modified(); }
		    });
			
			me.breakOthers.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
		
				if (me.breakOthers.getValue() == "") 
					return;
				
				var otherValue = parseFloat(me.breakOthers.getValue());
				if (/^[0-9]+(\.[0-9]+)?$/.test(me.breakOthers.getValue()) == false 
						|| otherValue == 0.25 || otherValue == 0.5 || otherValue == 0.75 || otherValue == 1)
					this.setInvalid("Please enter valid Default Lunch Break.");
			});
			
			me.breakTrigger = new ui.ctl.Input.Text({
		        id: "BreakTrigger",
		        maxLength: 5,
				changeFunction: function() { me.modified(); }
		    });
			
			me.breakTrigger.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation( function( isFinal, dataMap ) {
		
				if (me.breakTrigger.getValue() == "") 
					return;
				
				var otherValue = parseFloat(me.breakTrigger.getValue());
				if (/^[0-9]+(\.[0-9]+)?$/.test(me.breakTrigger.getValue()) == false 
						|| otherValue == 4 || otherValue == 6 || otherValue == 8)
					this.setInvalid("Please enter valid Lunch Break Trigger.");
			});
			
			me.ceridianCompanySalaried = new ui.ctl.Input.DropDown.Filtered({
		        id: "CeridianCompanySalaried",
				formatFunction: function( type ) { return type.title; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });	
			
			me.ceridianCompanyHourly = new ui.ctl.Input.DropDown.Filtered({
		        id: "CeridianCompanyHourly",
				formatFunction: function( type ) { return type.title; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.ePaySite = new ui.ctl.Input.Check({
		        id: "EPaySite",
				required: false,
				changeFunction: function() { me.modified(); }
		    });

			me.ePayPayGroup = new ui.ctl.Input.DropDown.Filtered({
		        id: "EPayPay" ,
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { me.modified(); }
		    });

			me.ePayTask = new ui.ctl.Input.Check({
		        id: "EPayTask",
				required: false,
				changeFunction: function() { me.modified(); }
		    });
			
			
			//Safety
			me.incidentFrequencyRate = new ui.ctl.Input.Text({
		        id: "IncidentFrequencyRate",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.trir = new ui.ctl.Input.Text({
		        id: "TRIR",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.lostDays = new ui.ctl.Input.Text({
		        id: "LostDays",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.reportedClaims = new ui.ctl.Input.Text({
		        id: "ReportedClaims",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.nearMisses = new ui.ctl.Input.Text({
		        id: "NearMisses",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });

			me.oshaRecordable = new ui.ctl.Input.Text({
		        id: "OSHARecordable",
		        maxLength: 50,
				changeFunction: function() { me.modified(); }
		    });
			
			me.incidentFrequencyRate.text.tabIndex = 1;
			me.trir.text.tabIndex = 2;
			me.lostDays.text.tabIndex = 3;
			me.reportedClaims.text.tabIndex = 4;
			me.nearMisses.text.tabIndex = 5;
			me.oshaRecordable.text.tabIndex = 6;
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.houseCodeWizard.HirNode,
				itemConstructorArgs: fin.hcm.houseCodeWizard.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.houseCodeWizard.HouseCode,
				itemConstructorArgs: fin.hcm.houseCodeWizard.houseCodeArgs,
				injectionArray: me.houseCodes
			});			

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.hcm.houseCodeWizard.HouseCodeDetail,
				itemConstructorArgs: fin.hcm.houseCodeWizard.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});		
			
			//HouseCode/
			me.sites = [];
			me.siteStore = me.cache.register({
				storeId: "siteTypes",
				itemConstructor: fin.hcm.houseCodeWizard.Site,
				itemConstructorArgs: fin.hcm.houseCodeWizard.siteArgs,
				injectionArray: me.sites
			});			
			
			me.houseCodeServices = [];
			me.houseCodeServiceStore = me.cache.register({
				storeId: "houseCodeServiceMasters",
				itemConstructor: fin.hcm.houseCodeWizard.HouseCodeService,
				itemConstructorArgs: fin.hcm.houseCodeWizard.houseCodeServiceArgs,
				injectionArray: me.houseCodeServices
			});			

			me.serviceTypes = [];
			me.serviceTypeStore = me.cache.register({
				storeId: "serviceTypes",
				itemConstructor: fin.hcm.houseCodeWizard.ServiceType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.serviceTypeArgs,
				injectionArray: me.serviceTypes
			});

			me.jdeServices = [];
			me.jdeServiceStore = me.cache.register({
				storeId: "houseCodeJDEServices",
				itemConstructor: fin.hcm.houseCodeWizard.JDEService,
				itemConstructorArgs: fin.hcm.houseCodeWizard.jdeServiceArgs,
				injectionArray: me.jdeServices
			});
			
			me.houseCodeSiteUnits = [];
			me.houseCodeSiteUnitsStore = me.cache.register({
				storeId: "appSiteUnits",
				itemConstructor: fin.hcm.houseCodeWizard.HouseCodeSiteUnit,
				itemConstructorArgs: fin.hcm.houseCodeWizard.houseCodeSiteUnitArgs,
				injectionArray: me.houseCodeSiteUnits
			});	
			
			me.jdeCompanys = [];
			me.jdeCompanysStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.hcm.houseCodeWizard.JdeCompany,
				itemConstructorArgs: fin.hcm.houseCodeWizard.jdeCompanyArgs,
				injectionArray: me.jdeCompanys
			});
			
			me.serviceLines = [];
			me.serviceLineStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.houseCodeWizard.ServiceLine,
				itemConstructorArgs: fin.hcm.houseCodeWizard.serviceLineArgs,
				injectionArray: me.serviceLines
			});
			
			//Statistics
			me.siteTypes = [];
			me.siteTypeStore = me.cache.register({
				storeId: "hcmSiteTypes",
				itemConstructor: fin.hcm.houseCodeWizard.SiteType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.siteTypeArgs,
				injectionArray: me.siteTypes
			});
			
			//Financial/
			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.hcm.houseCodeWizard.RemitTo,
				itemConstructorArgs: fin.hcm.houseCodeWizard.remitToArgs,
				injectionArray: me.remitTos	
			});
			
			me.contractTypes = [];
			me.contractTypeStore = me.cache.register({
				storeId: "financialContractMasters",
				itemConstructor: fin.hcm.houseCodeWizard.ContractType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.contractTypeArgs,
				injectionArray: me.contractTypes	
			});
						
			me.termsOfContractTypes = [];
			me.termsOfContractTypeStore = me.cache.register({
				storeId: "termsOfContractTypes",
				itemConstructor: fin.hcm.houseCodeWizard.TermsOfContractType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.termsOfContractTypeArgs,
				injectionArray: me.termsOfContractTypes	
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.houseCodeWizard.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.houseCodeWizard.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});			
			
			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.houseCodeWizard.StateType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	
			
			me.invoiceLogoTypes = [];
			me.invoiceLogoTypeStore = me.cache.register({
				storeId: "invoiceLogoTypes",
				itemConstructor: fin.hcm.houseCodeWizard.InvoiceLogoType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.invoiceLogoTypeArgs,
				injectionArray: me.invoiceLogoTypes	
			});
			
			me.budgetTemplates = [];
			me.budgetTemplateStore = me.cache.register({
				storeId: "budgetTemplates",
				itemConstructor: fin.hcm.houseCodeWizard.BudgetTemplate,
				itemConstructorArgs: fin.hcm.houseCodeWizard.budgetTemplateArgs,
				injectionArray: me.budgetTemplates
			});
			
			me.budgetLaborCalcMethods = [];
			me.budgetLaborCalcMethodStore = me.cache.register({
				storeId: "budgetLaborCalcMethods",
				itemConstructor: fin.hcm.houseCodeWizard.BudgetLaborCalcMethod,
				itemConstructorArgs: fin.hcm.houseCodeWizard.budgetLaborCalcMethodArgs,
				injectionArray: me.budgetLaborCalcMethods
			});

			//Payroll
			me.payPayrollCompanys = [];
			me.payPayrollCompanyStore = me.cache.register({
				storeId: "payrollMasters",
				itemConstructor: fin.hcm.houseCodeWizard.PayPayrollCompany,
				itemConstructorArgs: fin.hcm.houseCodeWizard.payPayrollCompanyArgs,
				injectionArray: me.payPayrollCompanys	
			});
			
			me.payrollProcessings = [];
			me.payrollProcessingStore = me.cache.register({
				storeId: "payrollProcessingLocationTypes",
				itemConstructor: fin.hcm.houseCodeWizard.PayrollProcessingLocationType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.payrollProcessingLocationTypeArgs,
				injectionArray: me.payrollProcessings	
			});
			
			me.ePayGroupTypes = [];
			me.ePayGroupTypeStore = me.cache.register({
				storeId: "ePayGroupTypes",
				itemConstructor: fin.hcm.houseCodeWizard.EPayGroupType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.ePayGroupTypeArgs,
				injectionArray: me.ePayGroupTypes	
			});
			
			me.houseCodeTypes = [];
			me.houseCodeTypeStore = me.cache.register({
				storeId: "houseCodeTypes",
				itemConstructor: fin.hcm.houseCodeWizard.HouseCodeType,
				itemConstructorArgs: fin.hcm.houseCodeWizard.houseCodeTypeArgs,
				injectionArray: me.houseCodeTypes	
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
			
			//HouseCode
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
			
			//Statistics
			me.managedEmployees.resizeText();
			me.crothallEmployees.resizeText();
			me.bedsLicensed.resizeText();
			me.bedsActive.resizeText();
			me.patientDays.resizeText();
			me.adjustedPatientDays.resizeText();
			me.avgDailyCensus.resizeText();
			me.annualDischarges.resizeText();
			me.annualTransfers.resizeText();
			me.avgBedTurnAroundTime.resizeText();
			me.netCleanableSquareFeet.resizeText();
			me.annualTransports.resizeText();
			me.avgLaundryLbs.resizeText();
			me.mgmtFeeTerminatedHourlyEmployees.resizeText();
			me.mgmtFeeActiveHourlyEmployees.resizeText();
			me.mgmtFeeTotalProductiveLaborHoursWorked.resizeText();
			me.mgmtFeeTotalNonProductiveLaborHours.resizeText();
			me.mgmtFeeTotalProductiveLaborDollarsPaid.resizeText();
			me.mgmtFeeTotalNonProductiveLaborDollarsPaid.resizeText();
			me.hospitalPaidJanitorialPaperPlasticSupplyCost.resizeText();
			me.buildingPopulation.resizeText();
			me.maintainableAcres.resizeText();
			me.scientists.resizeText();
			me.managedRooms.resizeText();
			me.siteType.resizeText();
			me.integratorName.resizeText();
			me.auditScore.resizeText();
			me.standardizationScore.resizeText();
			me.adminHours.resizeText();
			me.surgicalHours.resizeText();
			me.edHours.resizeText();
			me.groundsHours.resizeText();
			me.otherLockInHours.resizeText();

			//Financial
			me.company.resizeText();
			me.remitToTitle.resizeText();
			me.remitToAddress1.resizeText();
			me.remitToAddress2.resizeText();
			me.remitToCity.resizeText();
			me.remitToState.resizeText();
			me.remitToZip.resizeText();
			me.company.resizeText();
			me.shippingAddress1.resizeText();
			me.shippingAddress2.resizeText();
			me.shippingCity.resizeText();
			me.shippingState.resizeText();
			me.shippingZip.resizeText();
			me.remitTo.resizeText();
			me.remitToTitle.resizeText();
			me.remitToAddress1.resizeText();
			me.remitToAddress2.resizeText();
			me.remitToCity.resizeText();
			me.remitToState.resizeText();
			me.remitToZip.resizeText();
			me.contractType.resizeText();
			me.termsOfContract.resizeText();
			me.billingCycleFrequency.resizeText();
			me.financialEntity.resizeText();
			me.bankCodeNumber.resizeText();
			me.bankAccountNumber.resizeText();
			me.bankName.resizeText();
			me.bankContact.resizeText();
			me.bankAddress1.resizeText();
			me.bankAddress2.resizeText();
			me.bankCity.resizeText();
			me.bankState.resizeText();
			me.bankZip.resizeText();
			me.bankPhone.resizeText();
			me.bankFax.resizeText();
			me.bankEmail.resizeText();
			me.invoiceLogo.resizeText();
			me.budgetTemplate.resizeText();
			me.budgetLaborCalcMethod.resizeText();
			
			//Payroll
			me.payrollProcessing.resizeText();
			me.breakOthers.resizeText();
			me.breakTrigger.resizeText();
			me.ceridianCompanySalaried.resizeText();
			me.ceridianCompanyHourly.resizeText();
			me.ePayPayGroup.resizeText();
			
			//Safety
			me.incidentFrequencyRate.resizeText();
			me.trir.resizeText();
			me.lostDays.resizeText();
			me.reportedClaims.resizeText();
			me.nearMisses.resizeText();
			me.oshaRecordable.resizeText();

			me.resize();
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.site.fetchingData();
				me.siteStore.reset();
				me.siteStore.fetch("userId:[user],title:" + me.site.text.value, me.sitesLoaded, me);
			}
		},	
		
		sitesLoaded: function(me, activeId) {
		
            me.site.reset();
			me.site.setData(me.sites);
			
			if (me.sites.length > 0)
				me.site.select(0, me.site.focused);
		},
		
		houseCodesLoaded: function(me, activeId) {

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			ii.trace("HouseCode HouseCodeWizard - UnitChanged", ii.traceTypes.information, "Startup");

			if (parent.fin.appUI.houseCodeId <= 0) return;

			me.status = true;		
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
		},
		
		houseCodeDetailsLoaded: function(me, activeId) {

			ii.trace("HouseCode HouseCodeWizard - HouseCodeLoaded", ii.traceTypes.information, "Startup");			
           
			if (me.houseCodeDetails[0] == undefined) {
				alert("Error: Selected House code is not setup correctly. Please review.");
				me.status = false;
				return false;
			}
						
			parent.fin.appUI.houseCodeId = me.houseCodeDetails[0].id;	
			if (me.houseCodes.length > 0) {
				parent.fin.appUI.hirNode = me.houseCodes[0].hirNode;
			}			

			me.houseCodeWizard();
		},
		
		houseCodeWizard: function(){
			var me = this;
			
			me.setLoadCount();
			me.unitId = parent.fin.appUI.unitId;
			me.currentWizard = "";
			me.jdeCompany.fetchingData();
			me.jdeCompanysStore.fetch("userId:[user],", me.jdeCompanysLoaded, me);
			
			me.houseCodeSiteUnitsStore.reset();
			me.houseCodeSiteUnitsStore.fetch("unitId:" + me.unitId + ",userId:[user]", me.siteUnitsLoaded, me);
			
			me.serviceLine.fetchingData();
			me.primaryService.fetchingData();
			me.serviceLineStore.reset();
			me.houseCodeServiceStore.reset();
			me.houseCodeServiceStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeServicesLoaded, me);
			
			$("#CheckBoxTextDropImage").unbind("click"); 
			
			$("#CheckBoxTextDropImage").click(function imageClickHandler() {
						
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
			
			me.checkWizardSecurity();
			me.actionNextItem();
		},		
		
		jdeCompanysLoaded: function(me, activeId) {
		
            me.jdeCompany.reset();
			if (!ii.ajax.util.findItemByField("name", "None", me.jdeCompanys))
	            me.jdeCompanys.unshift(new fin.hcm.houseCodeWizard.JdeCompany({ id: 0, name: "None" }));
			me.jdeCompany.setData(me.jdeCompanys);
			me.jdeCompany.select(0, me.jdeCompany.focused);
		},
	
		houseCodeServicesLoaded: function (me, activeId) {
 
			me.financialEntities = [];
			me.serviceLineTypes = [];

			for (var index = 0; index < me.serviceLines.length; index++) {
				if (me.serviceLines[index].financialEntity) {
					var item = new fin.hcm.houseCodeWizard.FinancialEntity({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
					me.financialEntities.push(item);
				}
				else {
					var item = new fin.hcm.houseCodeWizard.ServiceLine({ id: me.serviceLines[index].id, name: me.serviceLines[index].name });
					me.serviceLineTypes.push(item);
				}
			}

			if (!ii.ajax.util.findItemByField("name", "None", me.serviceLineTypes)) {
				me.serviceLineTypes.unshift(new fin.hcm.houseCodeWizard.ServiceLine({id: 0, name: "None"}));
			}

			me.serviceLine.setData(me.serviceLineTypes);
			me.serviceLine.select(0, me.serviceLine.focused);

			me.houseCodePanelLoaded();
		},		
		
		additionalServiceDetails: function() {
			var me = this;
			var serviceNames = "";

			for (var index in me.serviceGroup.selectedItems) {
				var item = ii.ajax.util.findItemById(me.serviceGroup.selectedItems[index].id.toString(), me.jdeServices);
				if (item)
					serviceNames += item.name + ", ";
			}
			$("#AdditionalServiceContainer").html(serviceNames.substring(0, serviceNames.length - 2));			
		},
		
		siteUnitsLoaded: function(me, activeId) {	
			
			if (me.houseCodeSiteUnits[0]) {
				
				if (me.houseCodeSiteUnits[0].appSite > 0) {
					me.site.fetchingData();
					me.siteStore.fetch("userId:[user],siteId:" + me.houseCodeSiteUnits[0].appSite, me.sitesLoaded, me);
				}
			}
		},		
		
		jdeCompanyChanged: function() {
			var me = this;
		
			if (me.jdeCompany.indexSelected < 0) return;
			
			me.jdeServiceStore.fetch("userId:[user],jdeCompanyId:" + me.jdeCompanys[me.jdeCompany.indexSelected].id, me.jdeServicesLoaded, me);
		},
		
		jdeServicesLoaded: function(me, activeId) {

			me.primaryService.reset();
			me.primaryService.setData(me.jdeServices);
			
			me.serviceGroup.reset();
			me.serviceGroup.renderPending = true;
			me.serviceGroup.setList(me.jdeServices);
			me.serviceGroup.setData(me.houseCodeServices);
			
			var serviceNames = "";
			
			if (me.setHouseCodeServices) {//on pageload or housecodeChange
				
				if (me.houseCodeDetails[0]) {
					var index = ii.ajax.util.findIndexById(me.houseCodeDetails[0].serviceTypeId.toString(), me.jdeServices);
					if (index != undefined) 
						me.primaryService.select(index, me.primaryService.focused);
				}
				
				for (var index in me.serviceGroup.selectedItems) {
					var item = ii.ajax.util.findItemById(me.serviceGroup.selectedItems[index].id.toString(), me.jdeServices);
					if (item)
						serviceNames += item.name + ', ';
				}
	
				$("#AdditionalServiceContainer").html(serviceNames.substring(0, serviceNames.length - 2));
				me.setHouseCodeServices = false;
			}
			else { //clear if JdeCompanyChange

				me.primaryService.reset();
				me.serviceGroup.reset();
				$("#AdditionalServiceContainer").html('');
			}
		},
		
		houseCodePanelLoaded: function() {
			var me = this;
			var index = 0;
			var houseCode = me.houseCodeDetails[0];

			me.houseCodeNumber.setValue((parent.fin.appUI.houseCodeBrief ? parent.fin.appUI.houseCodeBrief : ""));
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
				index = ii.ajax.util.findIndexById(houseCode.serviceLineId.toString(), me.serviceLineTypes);
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

			me.houseCodeStatisticsPanelLoad();
			me.houseCodeFinancialPanelLoad();
		},
		
		houseCodeStatisticsPanelLoad: function() {
			var me = this;
			
			me.siteType.fetchingData();
			me.siteTypeStore.fetch("userId:[user]", me.siteTypesLoaded, me);
		},
		
		siteTypesLoaded: function(me, activeId) {

			me.siteTypes.unshift(new fin.hcm.houseCodeWizard.SiteType({ id: 0, name: "None" }));
			me.siteType.setData(me.siteTypes);
			me.houseCodeStatisticsLoaded();
		},

		houseCodeStatisticsLoaded: function() {
			var me = this;			
			var houseCode = me.houseCodeDetails[0];

			me.managedEmployees.setValue(houseCode.managedEmployees.toString());
			me.bedsLicensed.setValue(houseCode.bedsLicensed.toString());				
			me.patientDays.setValue(houseCode.patientDays.toString());
			me.avgDailyCensus.setValue(houseCode.avgDailyCensus.toString());
			me.annualDischarges.setValue(houseCode.annualDischarges.toString());
			me.avgBedTurnAroundTime.setValue(houseCode.avgBedTurnaroundTime.toString());
			me.netCleanableSquareFeet.setValue(houseCode.netCleanableSqft.toString());
			me.avgLaundryLbs.setValue(houseCode.avgLaundryLbs.toString());
			me.crothallEmployees.setValue(houseCode.crothallEmployees.toString());
			me.bedsActive.setValue(houseCode.bedsActive.toString());
			me.adjustedPatientDays.setValue(houseCode.adjustedPatientDaysBudgeted.toString());
			me.annualTransfers.setValue(houseCode.annualTransfers.toString());
			me.annualTransports.setValue(houseCode.annualTransports.toString());
			me.mgmtFeeTerminatedHourlyEmployees.setValue(houseCode.mgmtFeeTerminatedHourlyEmployees.toString());
			me.mgmtFeeActiveHourlyEmployees.setValue(houseCode.mgmtFeeActiveHourlyEmployees.toString());
			me.mgmtFeeTotalProductiveLaborHoursWorked.setValue(houseCode.mgmtFeeTotalProductiveLaborHoursWorked.toString());
			me.mgmtFeeTotalNonProductiveLaborHours.setValue(houseCode.mgmtFeeTotalNonProductiveLaborHours.toString());
			me.mgmtFeeTotalProductiveLaborDollarsPaid.setValue(houseCode.mgmtFeeTotalProductiveLaborDollarsPaid.toString());
			me.mgmtFeeTotalNonProductiveLaborDollarsPaid.setValue(houseCode.mgmtFeeTotalNonProductiveLaborDollarsPaid.toString());
			me.hospitalPaidJanitorialPaperPlasticSupplyCost.setValue(houseCode.hospitalPaidJanitorialPaperPlasticSupplyCost.toString());
			me.buildingPopulation.setValue(houseCode.buildingPopulation);
			me.maintainableAcres.setValue(houseCode.maintainableAcres);
			me.scientists.setValue(houseCode.scientists);
			me.managedRooms.setValue(houseCode.managedRooms);

			var itemIndex = ii.ajax.util.findIndexById(houseCode.siteType.toString(), me.siteTypes);
			if (itemIndex != undefined && itemIndex >= 0)
				me.siteType.select(itemIndex, me.siteType.focused);

			me.integrator.setValue(houseCode.integrator.toString());
			me.integratorName.setValue(houseCode.integratorName);
			me.auditScore.setValue(houseCode.auditScore);
			me.standardizationScore.setValue(houseCode.standardizationScore);
			me.adminHours.setValue(houseCode.adminHours);
			me.surgicalHours.setValue(houseCode.surgicalHours);
			me.edHours.setValue(houseCode.edHours);
			me.groundsHours.setValue(houseCode.groundsHours);
			me.otherLockInHours.setValue(houseCode.otherLockInHours);
			me.checkIntegrator();
		},

		checkIntegrator: function() {
			var me = this;

			if (me.integrator.check.checked)
				$("#LabelIntegratorName").html("<span class='requiredFieldIndicator'>&#149;</span>Integrator Name:");
			else
				$("#LabelIntegratorName").html("Integrator Name:");
		},
		
		houseCodeFinancialPanelLoad:function() {
			var me = this;

			me.shippingState.fetchingData();
			me.bankState.fetchingData();
			me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);		
			
			me.houseCodePayrollPanelLoad();
		},
		
		stateTypesLoaded: function(me,activeId) {

			if (!ii.ajax.util.findItemByField("name", "None", me.stateTypes))
				me.stateTypes.unshift(new fin.hcm.houseCodeWizard.StateType({ id: 0, name: "None" }));
			me.shippingState.reset();
			me.shippingState.setData(me.stateTypes);

			me.bankState.reset();
			me.bankState.setData(me.stateTypes);
			me.remitTo.fetchingData();
			me.contractType.fetchingData();			
			me.termsOfContract.fetchingData();
			me.billingCycleFrequency.fetchingData();
			me.invoiceLogo.fetchingData();
			me.budgetTemplate.fetchingData();
			me.budgetLaborCalcMethod.fetchingData();

			me.contractTypeStore.fetch("userId:[user]", me.contractTypesLoaded, me);	
		},
		
		contractTypesLoaded: function(me, activeId) {

			if (!ii.ajax.util.findItemByField("name", "None", me.contractTypes))
				me.contractTypes.unshift(new fin.hcm.houseCodeWizard.ContractType({ id: 0, name: "None" }));
			me.contractType.reset();
			me.contractType.setData(me.contractTypes);

			if (!ii.ajax.util.findItemByField("name", "None", me.remitTos))
				me.remitTos.unshift(new fin.hcm.houseCodeWizard.RemitTo({ id: 0, name: "None" }));
			me.remitTo.reset();
			me.remitTo.setData(me.remitTos);

			if (!ii.ajax.util.findItemByField("name", "None", me.termsOfContractTypes))
				me.termsOfContractTypes.unshift(new fin.hcm.houseCodeWizard.TermsOfContractType({ id: 0, name: "None" }));
			me.termsOfContract.reset();
			me.termsOfContract.setData(me.termsOfContractTypes);

			if (!ii.ajax.util.findItemByField("name", "None", me.billingCycleFrequencys))
				me.billingCycleFrequencys.unshift(new fin.hcm.houseCodeWizard.BillingCycleFrequency({ id: 0, name: "None" }));
			me.billingCycleFrequency.reset();
			me.billingCycleFrequency.setData(me.billingCycleFrequencys);

			me.invoiceLogo.reset();
			me.invoiceLogo.setData(me.invoiceLogoTypes);

			if (!ii.ajax.util.findItemByField("name", "None", me.budgetTemplates))
				me.budgetTemplates.unshift(new fin.hcm.houseCodeWizard.BudgetTemplate({ id: 0, name: "None" }));
			me.budgetTemplate.reset();
			me.budgetTemplate.setData(me.budgetTemplates);
			
			if (!ii.ajax.util.findItemByField("name", "None", me.budgetLaborCalcMethods))
				me.budgetLaborCalcMethods.unshift(new fin.hcm.houseCodeWizard.BudgetLaborCalcMethod({ id: 0, name: "None" }));
			me.budgetLaborCalcMethod.reset();
			me.budgetLaborCalcMethod.setData(me.budgetLaborCalcMethods);

			me.financialEntity.reset();			
			me.financialEntity.setData(me.financialEntities);

			me.houseCodeFinancialsLoaded();
		},
		
		houseCodeFinancialsLoaded: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var houseCode = me.houseCodeDetails[0];
			var index = 0;

			me.company.setValue(parent.parent.fin.appUI.houseCodeTitle);			
			me.shippingAddress1.setValue(houseCode.shippingAddress1.toString());
			me.shippingAddress2.setValue(houseCode.shippingAddress2.toString());
			me.shippingCity.setValue(houseCode.shippingCity.toString());
			
			index = ii.ajax.util.findIndexById(houseCode.shippingState.toString(), me.stateTypes);
			if (index >= 0 && index != undefined)
				me.shippingState.select(index, me.shippingState.focused);
								
			me.shippingZip.setValue(houseCode.shippingZip);
			
			index = ii.ajax.util.findIndexById(houseCode.remitToLocationId.toString(), me.remitTos);
			if (index >= 0 && index != undefined) {
				me.remitTo.select(index, me.remitTo.focused);
				me.remitToChanged();
			}				
								
			index = ii.ajax.util.findIndexById(houseCode.contractTypeId.toString(), me.contractTypes);
			if (index >= 0 && index != undefined)
				me.contractType.select(index, me.contractType.focused);
				
			index = ii.ajax.util.findIndexById(houseCode.termsOfContractTypeId.toString(), me.termsOfContractTypes);
			if (index >= 0 && index != undefined)
				me.termsOfContract.select(index, me.termsOfContract.focused);
				
			index = ii.ajax.util.findIndexById(houseCode.billingCycleFrequencyTypeId.toString(), me.billingCycleFrequencys);
			if (index >= 0)
				me.billingCycleFrequency.select(index, me.billingCycleFrequency.focused);

			index = ii.ajax.util.findIndexById(houseCode.financialEntityId.toString(), me.financialEntities);
			if (index >= 0 && index != undefined)
				me.financialEntity.select(index, me.financialEntity.focused);

			me.bankCodeNumber.setValue(houseCode.bankCodeNumber);
			me.bankAccountNumber.setValue(houseCode.bankAccountNumber);
			me.bankName.setValue(houseCode.bankName);
			me.bankContact.setValue(houseCode.bankContact);
			me.bankAddress1.setValue(houseCode.bankAddress1);
			me.bankAddress2.setValue(houseCode.bankAddress2);
			me.bankCity.setValue(houseCode.bankCity);
			
			index = ii.ajax.util.findIndexById(houseCode.bankState.toString(), me.stateTypes);
			if (index >= 0 && index != undefined)
				me.bankState.select(index, me.bankState.focused);
				
			me.bankZip.setValue(houseCode.bankZip);
			me.bankPhone.setValue(houseCode.bankPhone);
			me.bankFax.setValue(houseCode.bankFax);
			me.bankEmail.setValue(houseCode.bankEmail);
			
			index = ii.ajax.util.findIndexById(houseCode.invoiceLogoTypeId.toString(), me.invoiceLogoTypes);
			if (index >= 0 && index != undefined)
				me.invoiceLogo.select(index, me.invoiceLogo.focused);

			index = ii.ajax.util.findIndexById(houseCode.budgetTemplateId.toString(), me.budgetTemplates);
			if (index >= 0 && index != undefined)
				me.budgetTemplate.select(index, me.budgetTemplate.focused);
				
			index = ii.ajax.util.findIndexById(houseCode.budgetLaborCalcMethod.toString(), me.budgetLaborCalcMethods);
			if (index >= 0 && index != undefined)
				me.budgetLaborCalcMethod.select(index, me.budgetLaborCalcMethod.focused);

			me.budgetComputerRelatedCharge.check.checked = houseCode.budgetComputerRelatedCharge;
		},
		
		remitToChanged: function() {
			var me = this;
			var index = me.remitTo.indexSelected;
			
			if (index >= 1 && index != undefined) {
				me.remitToTitle.setValue(me.remitTos[index].name);
				me.remitToAddress1.setValue(me.remitTos[index].address1);
				me.remitToAddress2.setValue(me.remitTos[index].address2);
				me.remitToCity.setValue(me.remitTos[index].city);
				me.remitToZip.setValue(me.remitTos[index].zip);
				
				var itemIndex = ii.ajax.util.findIndexById(me.remitTos[index].stateType.toString(), me.stateTypes);
				if (itemIndex >= 0 && itemIndex != undefined)
					me.remitToState.setValue(me.stateTypes[itemIndex].name);
			}
			else {
				me.remitToTitle.setValue("");
				me.remitToAddress1.setValue("");
				me.remitToAddress2.setValue("");
				me.remitToCity.setValue("");
				me.remitToZip.setValue("");
				me.remitToState.setValue("");
			}
		},
		
		houseCodePayrollPanelLoad: function() {
			var me = this;

			$("#EPaySiteCheck").click(function() {
				me.ePaySiteSelect = me.ePaySite.check.checked;
			});

			me.payrollProcessing.fetchingData();
			me.payPayrollCompanyStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.payPayrollCompanysLoaded, me);	
		},
		
		payPayrollCompanysLoaded: function(me, activeId) {
						
			if (me.payPayrollCompanys[0] == null) {
				alert('No matching record found!!');
				return;
			}
			
			me.ceridianCompanySalaried.reset();
			me.ceridianCompanySalaried.setData(me.payPayrollCompanys);
			
			me.ceridianCompanySalaried.reset();
			me.ceridianCompanyHourly.setData(me.payPayrollCompanys);
			
			var payPayrollCompany;
			
			for (var index in me.payPayrollCompanys){
				payPayrollCompany = me.payPayrollCompanys[index];
								
				if (payPayrollCompany.salary == true)
					me.ceridianCompanySalaried.select(parseInt(index), me.ceridianCompanySalaried.focused);
				
				if (payPayrollCompany.hourly == true)
					me.ceridianCompanyHourly.select(parseInt(index), me.ceridianCompanyHourly.focused);
			}
			
			if (!ii.ajax.util.findItemByField("name", "None", me.payrollProcessings))
				me.payrollProcessings.unshift(new fin.hcm.houseCodeWizard.PayrollProcessingLocationType({ id: 0, name: "None" }));
			me.payrollProcessing.reset();
			me.payrollProcessing.setData(me.payrollProcessings);

			if (!ii.ajax.util.findItemByField("name", "None", me.ePayGroupTypes))
				me.ePayGroupTypes.unshift(new fin.hcm.houseCodeWizard.EPayGroupType({ id: 0, name: "None"}));
			me.ePayPayGroup.reset();
			me.ePayPayGroup.setData(me.ePayGroupTypes);

			me.houseCodePayrollsLoaded();
			me.houseCodeSafetyLoaded();
			me.checkLoadCount();
		},		
		
		houseCodePayrollsLoaded: function() {			
			var me = this;
			var houseCode = me.houseCodeDetails[0];
			var index = 0;

			//Default Lunch Break
			index = ii.ajax.util.findIndexById(houseCode.payrollProcessingLocationTypeId.toString(), me.payrollProcessings);
			if (index != undefined)
				me.payrollProcessing.select(index, me.payrollProcessing.focused);
				
			//Default Lunch Break
			index = ii.ajax.util.findIndexById(houseCode.ePayGroupType.toString(), me.ePayGroupTypes);
			if (index != undefined)
				me.ePayPayGroup.select(index, me.ePayPayGroup.focused);	
				
			me.ePaySiteSelect = houseCode.ePaySite;
			me.ePayTask.check.checked = houseCode.ePayTask;
				
			if (houseCode.ePaySite == true)
				$('#EPaySiteCheck').attr('checked', true);
			else
				$('#EPaySiteCheck').attr('checked', false);
			
			if (houseCode.timeAndAttendance == true)
				$('#TimeAttendanceYes').attr('checked', true);
			else
				$('#TimeAttendanceNo').attr('checked', true);
			
			if (houseCode.defaultLunchBreak == "0.25")
				$('#DefaultLunchBreak025').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "0.50")
				$('#DefaultLunchBreak050').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "0.75")
				$('#DefaultLunchBreak075').attr('checked', true);
			else if(houseCode.defaultLunchBreak == "1.00")
				$('#DefaultLunchBreak100').attr('checked', true);
			else {
				$('#DefaultLunchBreakother').attr('checked', true);
				me.breakOthers.setValue(houseCode.defaultLunchBreak);					
			}  	
			
			//Lunch Break Trigger				
			if (houseCode.lunchBreakTrigger == '4')
				$('#LunchBreakTrigger4').attr('checked', true);
			else if(houseCode.lunchBreakTrigger == '6')
				$('#LunchBreakTrigger6').attr('checked', true);
			else if(houseCode.lunchBreakTrigger == '8')
				$('#LunchBreakTrigger8').attr('checked', true);
			else {
				$('#LunchBreakTriggerOthers').attr('checked', true);
				me.breakTrigger.setValue(houseCode.lunchBreakTrigger);					
			} 
			
			if (houseCode.houseCodeTypeId != undefined) {
				if (houseCode.houseCodeTypeId == '3')
					$('#HouseCodeTypeUACB').attr('checked', true);
				else if (houseCode.houseCodeTypeId == '2')
					$('#HouseCodeTypeUCB').attr('checked', true);
				else
					$('#HouseCodeTypeNU').attr('checked', true);
			}	
			
			//Rounding Time Period
			if (houseCode.roundingTimePeriod == 15)
				$('#RoundingTimePeriod15').attr('checked', true);
			else
				$('#RoundingTimePeriod6').attr('checked', true);
			
			me.assignValue();
		},
				
		houseCodeSafetyLoaded: function() {
			var me = this;
			var houseCode = me.houseCodeDetails[0];

			me.incidentFrequencyRate.setValue(houseCode.incidentFrequencyRate);
			me.trir.setValue(houseCode.trir);
			me.lostDays.setValue(houseCode.lostDays);
			me.reportedClaims.setValue(houseCode.reportedClaims);
			me.nearMisses.setValue(houseCode.nearMisses);
			me.oshaRecordable.setValue(houseCode.oshaRecordable);
		},
		
		assignValue: function() {			
			var me = this;

			me.payrollTimeAttendance = ($("input[name='TimeAttendance']:checked").val() == "true" ? true : false);
			me.payrollDefaultLunchBreak = $("input[name='DefaultLunchBreak']:checked").val();
			if (me.payrollDefaultLunchBreak != 0) me.breakOthers.setValue("");
			
			me.payrollLunchBreakTrigger= $("input[name='LunchBreakTrigger']:checked").val();
			if (me.payrollLunchBreakTrigger != 0) me.breakTrigger.setValue("");	
			me.payrollHouseCodeType = $("input[name='HouseCodeType']:checked").val();
			me.payrollRoundingTimePeriod = $("input[name='RoundingTimePeriod']:checked").val();			
		},
	
		checkWizardSecurity: function() {
			var me = this;
			
			me.prevWizard = "";
			me.nextWizard = "";

			switch (me.currentWizard) {
				case "":

					if (me.tabHouseCodeShow)
						me.nextWizard = "HouseCode";
					else if (me.tabStatisticsShow)
						me.nextWizard = "Statistic";
					else if (me.tabFinancialShow)						
						me.nextWizard = "Financial";
					else if (me.tabPayrollShow)
						me.nextWizard = "Payroll";
					else if (me.tabSafetyShow)
						me.nextWizard = "Safety";
					
					if (me.nextWizard == "")
						me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorNext.display(ui.cmn.behaviorStates.enabled);
			
					me.anchorPrev.display(ui.cmn.behaviorStates.disabled);

					break;

				case "HouseCode":

					if (me.tabStatisticsShow)
						me.nextWizard = "Statistic";
					else if (me.tabFinancialShow)						
						me.nextWizard = "Financial";
					else if (me.tabPayrollShow)
						me.nextWizard = "Payroll";
					else if (me.tabSafetyShow)
						me.nextWizard = "Safety";

					if (me.nextWizard == "")
						me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorNext.display(ui.cmn.behaviorStates.enabled);

					me.anchorPrev.display(ui.cmn.behaviorStates.disabled);

					break;
					
				case "Statistic":

					if (me.tabFinancialShow)						
						me.nextWizard = "Financial";
					else if (me.tabPayrollShow)
						me.nextWizard = "Payroll";
					else if (me.tabSafetyShow)
						me.nextWizard = "Safety";
					
					if (me.tabHouseCodeShow)
						me.prevWizard = "HouseCode";
					
					if (me.nextWizard == "")
						me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorNext.display(ui.cmn.behaviorStates.enabled);
						
					if (me.prevWizard == "")
						me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorPrev.display(ui.cmn.behaviorStates.enabled);

					break;
					
				case "Financial":

					if (me.tabPayrollShow)
						me.nextWizard = "Payroll";
					else if (me.tabSafetyShow)
						me.nextWizard = "Safety";
					
					if (me.tabStatisticsShow)
						me.prevWizard = "Statistic";
					else if (me.tabHouseCodeShow)
						me.prevWizard = "HouseCode";
					
					if (me.nextWizard == "")
						me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorNext.display(ui.cmn.behaviorStates.enabled);

					if (me.prevWizard == "")
						me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorPrev.display(ui.cmn.behaviorStates.enabled);

					break;
					
				case "Payroll":
					
					if (me.tabSafetyShow)
						me.nextWizard = "Safety";
						
					if (me.tabFinancialShow)						
						me.prevWizard = "Financial";
					else if (me.tabStatisticsShow)
						me.prevWizard = "Statistic";
					else if (me.tabHouseCodeShow)
						me.prevWizard = "HouseCode";
					
					if (me.nextWizard == "")
						me.anchorNext.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorNext.display(ui.cmn.behaviorStates.enabled);

					if (me.prevWizard == "")
						me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorPrev.display(ui.cmn.behaviorStates.enabled);

					break;
					
				case "Safety":
					
					if (me.tabPayrollShow)
						me.prevWizard = "Payroll";
					else if (me.tabFinancialShow)						
						me.prevWizard = "Financial";
					else if (me.tabStatisticsShow)
						me.prevWizard = "Statistic";
					else if (me.tabHouseCodeShow)
						me.prevWizard = "HouseCode";
					
					me.anchorNext.display(ui.cmn.behaviorStates.disabled);

					if (me.prevWizard == "")
						me.anchorPrev.display(ui.cmn.behaviorStates.disabled);
					else
						me.anchorPrev.display(ui.cmn.behaviorStates.enabled);

					break;
			}			
		},
	
		actionPrevItem: function() {
			var me = this;
	
			me.currentWizard = me.prevWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},
		
		actionNextItem: function() {
			var me = this;
	
			me.currentWizard = me.nextWizard;
			me.actionShowWizard();
			me.checkWizardSecurity();
		},
		
		actionShowWizard: function() {
			var me = this;

			switch (me.currentWizard) {
				case "HouseCode":

					$("#divHouseCode").show();
					$("#divStatistics").hide();
					$("#divFinancial").hide();
					$("#divPayroll").hide();
					$("#divSafety").hide();
					
					if (me.houseCodeWrite || me.tabHouseCodeWrite)
						$("#actionMenu").show();
					else
						$("#actionMenu").hide();
						
					break;

				case "Statistic":

					$("#divHouseCode").hide();
					$("#divStatistics").show();
					$("#divFinancial").hide();
					$("#divPayroll").hide();
					$("#divSafety").hide();

					if (me.statisticsWrite || me.tabStatisticsWrite)
						$("#actionMenu").show();
					else
						$("#actionMenu").hide();

					break;
					
				case "Financial":
				
					$("#divHouseCode").hide();
					$("#divStatistics").hide();
					$("#divFinancial").show();
					$("#divPayroll").hide();
					$("#divSafety").hide();

					if (me.financialWrite || me.tabFinancialWrite)
						$("#actionMenu").show();
					else
						$("#actionMenu").hide();

					break;
					
				case "Payroll":
				
					$("#divHouseCode").hide();
					$("#divStatistics").hide();
					$("#divFinancial").hide();
					$("#divPayroll").show();
					$("#divSafety").hide();

					if (me.payrollWrite || me.tabPayrollWrite)
						$("#actionMenu").show();
					else
						$("#actionMenu").hide();

					break;
					
				case "Safety":
				
					$("#divHouseCode").hide();
					$("#divStatistics").hide();
					$("#divFinancial").hide();
					$("#divPayroll").hide();
					$("#divSafety").show();

					if (me.safetyWrite || me.tabSafetyWrite)
						$("#actionMenu").show();
					else
						$("#actionMenu").hide();

					break;
			}

			me.resizeControls();
		},

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
						
			me.houseCodeWizard();
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			if (!($("#actionMenu").is(":visible")))
				 return;

			if (me.status == false || parent.fin.appUI.houseCodeId <= 0) {
				alert("House Code information not loaded properly. Please reload.");
				return false;
			}

			me.houseCodeDetails[0].appSiteId = (me.site.indexSelected < 0 ? 0 : me.sites[me.site.indexSelected].id);		
			me.houseCodeDetails[0].jdeCompanyId = (me.jdeCompany.indexSelected <= 0 ? "0" : me.jdeCompanys[me.jdeCompany.indexSelected].id.toString());		
			me.houseCodeDetails[0].startDate = me.startDate.lastBlurValue;
			me.houseCodeDetails[0].closedDate = me.closedDate.lastBlurValue;
			me.houseCodeDetails[0].closedReason = me.closedReason.getValue();
			me.houseCodeDetails[0].serviceTypeId = (me.primaryService.indexSelected < 0 ? 0 : me.jdeServices[me.primaryService.indexSelected].id);
			me.houseCodeDetails[0].serviceLineId = (me.serviceLine.indexSelected <= 0 ? 0 : me.serviceLineTypes[me.serviceLine.indexSelected].id);
			me.houseCodeDetails[0].enforceLaborControl = true;
			me.houseCodeDetails[0].managerName = me.managerName.getValue();
			me.houseCodeDetails[0].managerEmail = me.managerEmail.getValue();
			me.houseCodeDetails[0].managerPhone = me.managerPhone.getValue();
			me.houseCodeDetails[0].managerCellPhone = me.managerCellPhone.getValue();
			me.houseCodeDetails[0].managerFax = me.managerFax.getValue();
			me.houseCodeDetails[0].managerPager = me.managerPager.getValue();
			me.houseCodeDetails[0].managerAssistantName = me.managerAssistantName.getValue();
			me.houseCodeDetails[0].managerAssistantPhone = me.managerAssistantPhone.getValue();
			me.houseCodeDetails[0].clientFirstName = me.clientFirstName.getValue();
			me.houseCodeDetails[0].clientLastName = me.clientLastName.getValue();
			me.houseCodeDetails[0].clientTitle = me.clientTitle.getValue();
			me.houseCodeDetails[0].clientPhone = me.clientPhone.getValue();
			me.houseCodeDetails[0].clientFax = me.clientFax.getValue();
			me.houseCodeDetails[0].clientAssistantName = me.clientAssistantName.getValue();
			me.houseCodeDetails[0].clientAssistantPhone = me.clientAssistantPhone.getValue();

			//Statistics				
			me.houseCodeDetails[0].managedEmployees = me.managedEmployees.getValue();
			me.houseCodeDetails[0].bedsLicensed = me.bedsLicensed.getValue();
			me.houseCodeDetails[0].patientDays = me.patientDays.getValue();
			me.houseCodeDetails[0].avgDailyCensus = me.avgDailyCensus.getValue();
			me.houseCodeDetails[0].annualDischarges = me.annualDischarges.getValue();
			me.houseCodeDetails[0].avgBedTurnaroundTime = me.avgBedTurnAroundTime.getValue();
			me.houseCodeDetails[0].netCleanableSqft = me.netCleanableSquareFeet.getValue();
			me.houseCodeDetails[0].avgLaundryLbs = me.avgLaundryLbs.getValue();
			me.houseCodeDetails[0].crothallEmployees = me.crothallEmployees.getValue();
			me.houseCodeDetails[0].bedsActive = me.bedsActive.getValue();
			me.houseCodeDetails[0].adjustedPatientDaysBudgeted = me.adjustedPatientDays.getValue();
			me.houseCodeDetails[0].annualTransfers = me.annualTransfers.getValue();
			me.houseCodeDetails[0].annualTransports = me.annualTransports.getValue();
			me.houseCodeDetails[0].mgmtFeeTerminatedHourlyEmployees = me.mgmtFeeTerminatedHourlyEmployees.getValue();
			me.houseCodeDetails[0].mgmtFeeActiveHourlyEmployees = me.mgmtFeeActiveHourlyEmployees.getValue();
			me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborHoursWorked = me.mgmtFeeTotalProductiveLaborHoursWorked.getValue();
			me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborHours = me.mgmtFeeTotalNonProductiveLaborHours.getValue();
			me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborDollarsPaid = me.mgmtFeeTotalProductiveLaborDollarsPaid.getValue();
			me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborDollarsPaid = me.mgmtFeeTotalNonProductiveLaborDollarsPaid.getValue();
			me.houseCodeDetails[0].hospitalPaidJanitorialPaperPlasticSupplyCost = me.hospitalPaidJanitorialPaperPlasticSupplyCost.getValue();
			me.houseCodeDetails[0].buildingPopulation = me.buildingPopulation.getValue();
			me.houseCodeDetails[0].maintainableAcres = me.maintainableAcres.getValue();
			me.houseCodeDetails[0].scientists = me.scientists.getValue();
			me.houseCodeDetails[0].managedRooms = me.managedRooms.getValue();
			me.houseCodeDetails[0].siteType = (me.siteType.indexSelected <= 0 ? 0 : me.siteTypes[me.siteType.indexSelected].id);
			me.houseCodeDetails[0].integrator = me.integrator.check.checked;
			me.houseCodeDetails[0].integratorName = me.integratorName.getValue();
			me.houseCodeDetails[0].auditScore = me.auditScore.getValue();
			me.houseCodeDetails[0].standardizationScore = me.standardizationScore.getValue();
			me.houseCodeDetails[0].adminHours = me.adminHours.getValue();
			me.houseCodeDetails[0].surgicalHours = me.surgicalHours.getValue();
			me.houseCodeDetails[0].edHours = me.edHours.getValue();
			me.houseCodeDetails[0].groundsHours = me.groundsHours.getValue();
			me.houseCodeDetails[0].otherLockInHours = me.otherLockInHours.getValue();

			//Financial				
			me.houseCodeDetails[0].shippingAddress1 = me.shippingAddress1.getValue();
			me.houseCodeDetails[0].shippingAddress2 = me.shippingAddress2.getValue();
			me.houseCodeDetails[0].shippingCity = me.shippingCity.getValue();
			me.houseCodeDetails[0].shippingZip = me.shippingZip.getValue();
			me.houseCodeDetails[0].shippingState = (me.shippingState.indexSelected <= 0 ? 0 : me.stateTypes[me.shippingState.indexSelected].id);
			me.houseCodeDetails[0].remitToLocationId = (me.remitTo.indexSelected <= 0 ? 0 : me.remitTos[me.remitTo.indexSelected].id);
			me.houseCodeDetails[0].contractTypeId = (me.contractType.indexSelected <= 0 ? 0 : me.contractTypes[me.contractType.indexSelected].id);
			me.houseCodeDetails[0].termsOfContractTypeId = (me.termsOfContract.indexSelected <= 0 ? 0 :me.termsOfContractTypes[me.termsOfContract.indexSelected].id);
			me.houseCodeDetails[0].billingCycleFrequencyTypeId = (me.billingCycleFrequency.indexSelected <= 0 ? 0 : me.billingCycleFrequencys[me.billingCycleFrequency.indexSelected].id);
			me.houseCodeDetails[0].financialEntityId = (me.financialEntity.indexSelected < 0 ? 0 : me.financialEntities[me.financialEntity.indexSelected].id);
			me.houseCodeDetails[0].bankCodeNumber = me.bankCodeNumber.getValue();
			me.houseCodeDetails[0].bankAccountNumber = me.bankAccountNumber.getValue();
			me.houseCodeDetails[0].bankName = me.bankName.getValue();
			me.houseCodeDetails[0].bankContact = me.bankContact.getValue();
			me.houseCodeDetails[0].bankAddress1 = me.bankAddress1.getValue();
			me.houseCodeDetails[0].bankAddress2 = me.bankAddress2.getValue();
			me.houseCodeDetails[0].bankCity = me.bankCity.getValue();
			me.houseCodeDetails[0].bankState = (me.bankState.indexSelected <= 0 ? 0 : me.stateTypes[me.bankState.indexSelected].id);
			me.houseCodeDetails[0].bankZip = me.bankZip.getValue();
			me.houseCodeDetails[0].bankPhone = me.bankPhone.getValue();
			me.houseCodeDetails[0].bankFax = me.bankFax.getValue();
			me.houseCodeDetails[0].bankEmail = me.bankEmail.getValue();
			me.houseCodeDetails[0].invoiceLogoTypeId = (me.invoiceLogo.indexSelected < 0 ? 0 : me.invoiceLogoTypes[me.invoiceLogo.indexSelected].id);
			me.houseCodeDetails[0].budgetTemplateId = (me.budgetTemplate.indexSelected < 0 ? 0 : me.budgetTemplates[me.budgetTemplate.indexSelected].id);
			me.houseCodeDetails[0].budgetLaborCalcMethod = (me.budgetLaborCalcMethod.indexSelected < 0 ? 0 : me.budgetLaborCalcMethods[me.budgetLaborCalcMethod.indexSelected].id);
			me.houseCodeDetails[0].budgetComputerRelatedCharge = (me.budgetComputerRelatedCharge.check.checked ? 1 : 0);
			
			//Payroll				
			me.houseCodeDetails[0].payrollProcessingLocationTypeId = (me.payrollProcessing.indexSelected <= 0 ? 0 : me.payrollProcessings[me.payrollProcessing.indexSelected].id);
			me.houseCodeDetails[0].timeAndAttendance = me.payrollTimeAttendance;
			me.houseCodeDetails[0].defaultLunchBreak = me.payrollDefaultLunchBreak;
			
			if (me.houseCodeDetails[0].defaultLunchBreak == 0) {
				me.houseCodeDetails[0].defaultLunchBreak = me.breakOthers.getValue();
			}
			
			me.houseCodeDetails[0].lunchBreakTrigger = me.payrollLunchBreakTrigger;

			if (me.houseCodeDetails[0].lunchBreakTrigger == 0) {
				me.houseCodeDetails[0].lunchBreakTrigger = me.breakTrigger.getValue();
			}
				
			me.houseCodeDetails[0].houseCodeTypeId = me.payrollHouseCodeType;
			me.houseCodeDetails[0].roundingTimePeriod = me.payrollRoundingTimePeriod;
			me.houseCodeDetails[0].ePaySite = me.ePaySiteSelect;
			me.houseCodeDetails[0].ePayGroupType = (me.ePayPayGroup.indexSelected <= 0 ? 0 : me.ePayGroupTypes[me.ePayPayGroup.indexSelected].id);
			me.houseCodeDetails[0].ePayTask = (me.ePayTask.check.checked ? 1 : 0);
			
			//Safety
			me.houseCodeDetails[0].incidentFrequencyRate = me.incidentFrequencyRate.getValue();
			me.houseCodeDetails[0].trir = me.trir.getValue();
			me.houseCodeDetails[0].lostDays = me.lostDays.getValue();
			me.houseCodeDetails[0].reportedClaims = me.reportedClaims.getValue();
			me.houseCodeDetails[0].nearMisses = me.nearMisses.getValue();
			me.houseCodeDetails[0].oshaRecordable = me.oshaRecordable.getValue();
			
			if (me.houseCodeDetails[0].jdeCompanyId == 0) {
				alert("[JDE Company] is a required field. Please select it on HouseCode Wizard.");
				return;
			}
						
			if (me.houseCodeDetails[0].appSiteId == 0) {
				alert("[Site] is a required field. Please select it on HouseCode Wizard.");
				return;
			}
						
			if (me.houseCodeDetails[0].startDate == "" || !me.startDate.validate(true)) {
				alert("[Start Date] is required in order for TeamFin to recognize the House Code throughout the application. Please select it on HouseCode Wizard.");
				me.houseCodeDetails[0].startDate = '01/01/1900';
				return;
			}
	
			if (me.houseCodeDetails[0].serviceTypeId <= 0) {
				alert("[Primary Service] Provided is required for accurate reporting. Please select it on HouseCode Wizard.");
				return;
			}
			
			if (!me.buildingPopulation.validate(true)) {
				alert("[Building Population] is invalid. Please enter numeric value on Statistics Wizard.");
				return false;
			}

			if (me.houseCodeDetails[0].integrator && me.houseCodeDetails[0].integratorName == "") {
				alert("[Integrator Name] is a required field. Please select it on Statistics Wizard.");
				return false;
			}
			
			if (me.houseCodeDetails[0].remitToLocationId <= 0) {
				alert("[Remit To] is a required field. Please select it on Financial Wizard.");
				return false;
			}
			
			if (me.houseCodeDetails[0].contractTypeId <= 0) {
				alert("[Contract Type] is a required field. Please select it on Financial Wizard.");
				return false;
			}

			if (me.houseCodeDetails[0].defaultLunchBreak  == "" && me.houseCodeDetails[0].timeAndAttendance == true) {
				alert("[Default Lunch Break] enter data for others option. Please select it on Payroll Wizard.");
				return false;
			}
			
			if (me.houseCodeDetails[0].lunchBreakTrigger == "" && me.houseCodeDetails[0].timeAndAttendance == true) {
				alert("[Lunch Break Trigger] enter data for others option. Please select it on Payroll Wizard.");
				return false;
			}
			
			var item = new fin.hcm.houseCodeWizard.HouseCodeDetail(
				parent.fin.appUI.houseCodeId
				, parent.fin.appUI.hirNode
				, parent.fin.appUI.unitId.toString()
				, me.houseCodeDetails[0].appSiteId
				, me.houseCodeDetails[0].jdeCompanyId
				, me.houseCodeDetails[0].startDate
				, me.houseCodeDetails[0].closedDate
				, me.houseCodeDetails[0].closedReason
				, me.houseCodeDetails[0].serviceTypeId
				, me.houseCodeDetails[0].serviceLineId
				, me.houseCodeDetails[0].enforceLaborControl
				, me.houseCodeDetails[0].managerName
				, me.houseCodeDetails[0].managerEmail
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].managerPhone, true)
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].managerCellPhone, true)
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].managerFax, true)
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].managerPager, true)
				, me.houseCodeDetails[0].managerAssistantName
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].managerAssistantPhone, true)
				, me.houseCodeDetails[0].clientFirstName
				, me.houseCodeDetails[0].clientLastName
				, me.houseCodeDetails[0].clientTitle
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].clientPhone, true)
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].clientFax, true)
				, me.houseCodeDetails[0].clientAssistantName
				, me.houseCodeDetails[0].clientAssistantPhone
				
				//Statistics				
				, me.houseCodeDetails[0].managedEmployees == "" ? 0 : parseInt(me.houseCodeDetails[0].managedEmployees)
				, me.houseCodeDetails[0].bedsLicensed == "" ? 0 : parseInt(me.houseCodeDetails[0].bedsLicensed)
				, me.houseCodeDetails[0].patientDays == "" ? 0 : parseInt(me.houseCodeDetails[0].patientDays)
				, me.houseCodeDetails[0].avgDailyCensus == "" ? 0 : parseInt(me.houseCodeDetails[0].avgDailyCensus)
				, me.houseCodeDetails[0].annualDischarges == "" ? 0 : parseInt(me.houseCodeDetails[0].annualDischarges)
				, me.houseCodeDetails[0].avgBedTurnaroundTime == "" ? 0 : parseInt(me.houseCodeDetails[0].avgBedTurnaroundTime)
				, me.houseCodeDetails[0].netCleanableSqft == "" ? 0 : parseInt(me.houseCodeDetails[0].netCleanableSqft)
				, me.houseCodeDetails[0].avgLaundryLbs == "" ? 0 : parseInt(me.houseCodeDetails[0].avgLaundryLbs)
				, me.houseCodeDetails[0].crothallEmployees == "" ? 0 : parseInt(me.houseCodeDetails[0].crothallEmployees)
				, me.houseCodeDetails[0].bedsActive == "" ? 0 : parseInt(me.houseCodeDetails[0].bedsActive)
				, me.houseCodeDetails[0].adjustedPatientDaysBudgeted == "" ? 0 : parseInt(me.houseCodeDetails[0].adjustedPatientDaysBudgeted)
				, me.houseCodeDetails[0].annualTransfers == "" ? 0 : parseInt(me.houseCodeDetails[0].annualTransfers)
				, me.houseCodeDetails[0].annualTransports == "" ? 0 : parseInt(me.houseCodeDetails[0].annualTransports)
				, me.houseCodeDetails[0].mgmtFeeTerminatedHourlyEmployees == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeTerminatedHourlyEmployees)
				, me.houseCodeDetails[0].mgmtFeeActiveHourlyEmployees == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeActiveHourlyEmployees)
				, me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborHoursWorked == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborHoursWorked)
				, me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborHours)
				, me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborDollarsPaid == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborDollarsPaid)
				, me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborDollarsPaid == "" ? 0 : parseFloat(me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborDollarsPaid)
				, me.houseCodeDetails[0].hospitalPaidJanitorialPaperPlasticSupplyCost == "" ? 0 : parseFloat(me.houseCodeDetails[0].hospitalPaidJanitorialPaperPlasticSupplyCost)
				, me.houseCodeDetails[0].buildingPopulation == "" ? 0 : me.houseCodeDetails[0].buildingPopulation
				, me.houseCodeDetails[0].maintainableAcres
				, me.houseCodeDetails[0].scientists
				, me.houseCodeDetails[0].managedRooms
				, me.houseCodeDetails[0].siteType
				, me.houseCodeDetails[0].integrator
				, me.houseCodeDetails[0].integratorName
				, me.houseCodeDetails[0].auditScore
				, me.houseCodeDetails[0].standardizationScore
				, me.houseCodeDetails[0].adminHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].adminHours)
				, me.houseCodeDetails[0].surgicalHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].surgicalHours)
				, me.houseCodeDetails[0].edHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].edHours)
				, me.houseCodeDetails[0].groundsHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].groundsHours)
				, me.houseCodeDetails[0].otherLockInHours == "" ? 0 : parseFloat(me.houseCodeDetails[0].otherLockInHours)
				
				//Financial
				, me.houseCodeDetails[0].shippingAddress1
				, me.houseCodeDetails[0].shippingAddress2
				, me.houseCodeDetails[0].shippingZip
				, me.houseCodeDetails[0].shippingCity
				, me.houseCodeDetails[0].shippingState
				, me.houseCodeDetails[0].remitToLocationId
				, me.houseCodeDetails[0].contractTypeId
				, me.houseCodeDetails[0].termsOfContractTypeId
				, me.houseCodeDetails[0].billingCycleFrequencyTypeId
				, me.houseCodeDetails[0].bankCodeNumber
				, me.houseCodeDetails[0].bankAccountNumber
				, me.houseCodeDetails[0].bankName
				, me.houseCodeDetails[0].bankContact
				, me.houseCodeDetails[0].bankAddress1
				, me.houseCodeDetails[0].bankAddress2
				, me.houseCodeDetails[0].bankZip
				, me.houseCodeDetails[0].bankCity
				, me.houseCodeDetails[0].bankState
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].bankPhone, true)
				, fin.cmn.text.mask.phone(me.houseCodeDetails[0].bankFax, true)
				, me.houseCodeDetails[0].bankEmail
				, me.houseCodeDetails[0].invoiceLogoTypeId
				, me.houseCodeDetails[0].budgetTemplateId
				, me.houseCodeDetails[0].budgetLaborCalcMethod
				, me.houseCodeDetails[0].budgetComputerRelatedCharge
				, me.houseCodeDetails[0].stateTaxPercent
				, me.houseCodeDetails[0].localTaxPercent
				, me.houseCodeDetails[0].financialEntityId
				
				//Payroll
				, parseInt(me.houseCodeDetails[0].payrollProcessingLocationTypeId)
				, me.houseCodeDetails[0].timeAndAttendance
				, me.houseCodeDetails[0].defaultLunchBreak
				, me.houseCodeDetails[0].lunchBreakTrigger
				, me.houseCodeDetails[0].houseCodeTypeId
				, me.houseCodeDetails[0].roundingTimePeriod
				, me.houseCodeDetails[0].ePaySite
				, me.houseCodeDetails[0].ePayGroupType
				, me.houseCodeDetails[0].ePayTask

				//Safety
				, me.houseCodeDetails[0].incidentFrequencyRate
				, me.houseCodeDetails[0].trir
				, me.houseCodeDetails[0].lostDays
				, me.houseCodeDetails[0].reportedClaims
				, me.houseCodeDetails[0].nearMisses
				, me.houseCodeDetails[0].oshaRecordable
			);

			var xml = me.saveXmlBuild(item);
			
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
		
		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.houseCodeWizard.HouseCodeDetail}
			});			
			var me = this;
			var clientId = 0;
			var item = args.item;						
			var xml = "";		
			
			xml += '<houseCode';
			xml += ' id="' + item.id + '"';
			xml += ' hirNode="' + item.hirNode + '"';
			xml += ' appUnitId="' + item.appUnitId + '"';
			xml += ' appSiteId="' + item.appSiteId + '"';
			xml += ' jdeCompanyId="' + item.jdeCompanyId + '"';
			xml += ' startDate="' + item.startDate + '"';
			xml += ' closedDate="' + item.closedDate + '"';
			xml += ' closedReason="' + item.closedReason + '"';
			xml += ' serviceTypeId="' + item.serviceTypeId + '"';
			xml += ' serviceLineId="' + item.serviceLineId + '"';
			xml += ' enforceLaborControl="' + item.enforceLaborControl + '"';
			xml += ' managerName="' + ui.cmn.text.xml.encode(item.managerName) + '"';
			xml += ' managerEmail="' + item.managerEmail + '"';
			xml += ' managerPhone="' + item.managerPhone + '"';
			xml += ' managerCellPhone="' + item.managerCellPhone + '"';
			xml += ' managerFax="' + item.managerFax + '"';
			xml += ' managerPager="' + item.managerPager + '"';
			xml += ' managerAssistantName="' + ui.cmn.text.xml.encode(item.managerAssistantName) + '"';
			xml += ' managerAssistantPhone="' + item.managerAssistantPhone + '"';
			xml += ' clientFirstName="' + ui.cmn.text.xml.encode(item.clientFirstName) + '"';
			xml += ' clientLastName="' + ui.cmn.text.xml.encode(item.clientLastName) + '"';
			xml += ' clientTitle="' + ui.cmn.text.xml.encode(item.clientTitle) + '"';
			xml += ' clientPhone="' + item.clientPhone + '"';
			xml += ' clientFax="' + item.clientFax + '"';
			xml += ' clientAssistantName="' + ui.cmn.text.xml.encode(item.clientAssistantName) + '"';
			xml += ' clientAssistantPhone="' + item.clientAssistantPhone + '"';
			
			//Statistics
			xml += ' managedEmployees="' + item.managedEmployees + '"';
			xml += ' bedsLicensed="' + item.bedsLicensed + '"';
			xml += ' patientDays="' + item.patientDays + '"';
			xml += ' avgDailyCensus="' + item.avgDailyCensus + '"';
			xml += ' annualDischarges="' + item.annualDischarges + '"';
			xml += ' avgBedTurnaroundTime="' + item.avgBedTurnaroundTime + '"';
			xml += ' netCleanableSqft="' + item.netCleanableSqft + '"';
			xml += ' avgLaundryLbs="' + item.avgLaundryLbs + '"';
			xml += ' crothallEmployees="' + item.crothallEmployees + '"';
			xml += ' bedsActive="' + item.bedsActive + '"';
			xml += ' adjustedPatientDaysBudgeted="' + item.adjustedPatientDaysBudgeted + '"';
			xml += ' annualTransfers="' + item.annualTransfers + '"';
			xml += ' annualTransports="' + item.annualTransports + '"';
			xml += ' mgmtFeeTerminatedHourlyEmployees="' + item.mgmtFeeTerminatedHourlyEmployees + '"';
			xml += ' mgmtFeeActiveHourlyEmployees="' + item.mgmtFeeActiveHourlyEmployees + '"';
			xml += ' mgmtFeeTotalProductiveLaborHoursWorked="' + item.mgmtFeeTotalProductiveLaborHoursWorked + '"';
			xml += ' mgmtFeeTotalNonProductiveLaborHours="' + item.mgmtFeeTotalNonProductiveLaborHours + '"';
			xml += ' mgmtFeeTotalProductiveLaborDollarsPaid="' + item.mgmtFeeTotalProductiveLaborDollarsPaid + '"';
			xml += ' mgmtFeeTotalNonProductiveLaborDollarsPaid="' + item.mgmtFeeTotalNonProductiveLaborDollarsPaid + '"';
			xml += ' hospitalPaidJanitorialPaperPlasticSupplyCost="' + item.hospitalPaidJanitorialPaperPlasticSupplyCost + '"';
			xml += ' buildingPopulation="' + item.buildingPopulation + '"';
			xml += ' maintainableAcres="' + ui.cmn.text.xml.encode(item.maintainableAcres) + '"';
			xml += ' scientists="' + ui.cmn.text.xml.encode(item.scientists) + '"';
			xml += ' managedRooms="' + ui.cmn.text.xml.encode(item.managedRooms) + '"';
			xml += ' siteType="' + item.siteType + '"';
			xml += ' integrator="' + item.integrator + '"';
			xml += ' integratorName="' + ui.cmn.text.xml.encode(item.integratorName) + '"';
			xml += ' auditScore="' + ui.cmn.text.xml.encode(item.auditScore) + '"';
			xml += ' standardizationScore="' + ui.cmn.text.xml.encode(item.standardizationScore) + '"';
			xml += ' adminHours="' + item.adminHours + '"';
			xml += ' surgicalHours="' + item.surgicalHours + '"';
			xml += ' edHours="' + item.edHours + '"';
			xml += ' groundsHours="' + item.groundsHours + '"';
			xml += ' otherLockInHours="' + item.otherLockInHours + '"';

			//Financial
			xml += ' shippingAddress1="' + ui.cmn.text.xml.encode(item.shippingAddress1) + '"';
			xml += ' shippingAddress2="' + ui.cmn.text.xml.encode(item.shippingAddress2) + '"';
			xml += ' shippingZip="' + item.shippingZip + '"';
			xml += ' shippingCity="' + ui.cmn.text.xml.encode(item.shippingCity) + '"';
			xml += ' shippingState="' + item.shippingState + '"';
			xml += ' remitToLocationId="' + item.remitToLocationId + '"'; 
			xml += ' contractTypeId="' + item.contractTypeId + '"';
			xml += ' termsOfContractTypeId="' + item.termsOfContractTypeId + '"';			
			xml += ' billingCycleFrequencyTypeId="' + item.billingCycleFrequencyTypeId + '"';
			xml += ' bankCodeNumber="' + ui.cmn.text.xml.encode(item.bankCodeNumber) + '"';
			xml += ' bankAccountNumber="' + ui.cmn.text.xml.encode(item.bankAccountNumber) + '"';
			xml += ' bankName="' + ui.cmn.text.xml.encode(item.bankName) + '"';
			xml += ' bankContact="' + ui.cmn.text.xml.encode(item.bankContact) + '"';
			xml += ' bankAddress1="' + ui.cmn.text.xml.encode(item.bankAddress1) + '"';
			xml += ' bankAddress2="' + ui.cmn.text.xml.encode(item.bankAddress2) + '"';
			xml += ' bankZip="' + item.bankZip + '"';
			xml += ' bankCity="' + ui.cmn.text.xml.encode(item.bankCity) + '"';
			xml += ' bankState="' + item.bankState + '"';
			xml += ' bankPhone="' + item.bankPhone + '"';
			xml += ' bankFax="' + item.bankFax + '"';
			xml += ' bankEmail="' + item.bankEmail + '"';
			xml += ' invoiceLogoTypeId="' + item.invoiceLogoTypeId + '"';
			xml += ' budgetTemplateId="' + item.budgetTemplateId + '"';
			xml += ' budgetLaborCalcMethod="' + item.budgetLaborCalcMethod + '"';
			xml += ' budgetComputerRelatedCharge="' + item.budgetComputerRelatedCharge + '"';
			xml += ' stateTaxPercent="' + item.stateTaxPercent + '"';
			xml += ' localTaxPercent="' + item.localTaxPercent + '"';
			xml += ' financialEntityId="' + item.financialEntityId + '"';
	
			//Payrolls
			xml += ' payrollProcessingLocationTypeId="' + item.payrollProcessingLocationTypeId + '"';
			xml += ' timeAndAttendance="' + item.timeAndAttendance + '"';
			xml += ' defaultLunchBreak="' + item.defaultLunchBreak + '"';
			xml += ' lunchBreakTrigger="' + item.lunchBreakTrigger + '"';
			xml += ' houseCodeTypeId="' + item.houseCodeTypeId + '"';
			xml += ' roundingTimePeriod="' + item.roundingTimePeriod + '"';
			xml += ' ePaySite="' + item.ePaySite + '"';
			xml += ' ePayGroupType="' + item.ePayGroupType + '"';
			xml += ' ePayTask="' + item.ePayTask + '"';
			
			//Safety
			xml += ' incidentFrequencyRate="' + ui.cmn.text.xml.encode(item.incidentFrequencyRate) + '"';
			xml += ' trir="' + ui.cmn.text.xml.encode(item.trir) + '"';
			xml += ' lostDays="' + ui.cmn.text.xml.encode(item.lostDays) + '"';
			xml += ' reportedClaims="' + ui.cmn.text.xml.encode(item.reportedClaims) + '"';
			xml += ' nearMisses="' + ui.cmn.text.xml.encode(item.nearMisses) + '"';
			xml += ' oshaRecordable="' + ui.cmn.text.xml.encode(item.oshaRecordable) + '"';

			xml += ' clientId="' + ++clientId + '">';

			var serviceNames = "";
			for (var index in me.serviceGroup.selectedItems) {
				if (index >= 0) {
					xml += '<houseCodeService id="0" houseCodeId="' + item.id + '" serviceTypeId="' + me.serviceGroup.selectedItems[index].id + '" clientId="' + ++clientId + '"/>';
				}					
			}				
				
			xml += '<houseCodePayrollCompany';
			xml += ' id="0"';
			xml += ' payrollCompanyId="' + (me.ceridianCompanySalaried.indexSelected >= 0 ? me.payPayrollCompanys[me.ceridianCompanySalaried.indexSelected].id : 0) + '"';
			xml += ' houseCodeId="' + item.id.toString() + '"';
			xml += ' salary="1"';					
			xml += '/>';
			
			xml += '<houseCodePayrollCompany';
			xml += ' id="0"';
			xml += ' payrollCompanyId="' + (me.ceridianCompanyHourly.indexSelected >= 0 ? me.payPayrollCompanys[me.ceridianCompanyHourly.indexSelected].id : 0) + '"';
			xml += ' houseCodeId="' + item.id.toString() + '"';
			xml += ' hourly="1"';
			xml += '/>';
				
			xml += '</houseCode>';
			
			return xml;
		},
		
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: { type: ii.ajax.TransactionMonitor.Transaction }, // The transaction that was responded to.
				xmlNode: { type: "XmlNode:transaction" } // The XML transaction node associated with the response.
			});						
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			if (status == "success") {				
				ii.trace("House Code details saved successfully.", ii.traceTypes.Information, "Info");
				me.modified(false);
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating House Code details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}		
	}
});

function main() {

	fin.hcmhouseCodeWizardUi = new fin.hcm.houseCodeWizard.UserInterface();
	fin.hcmhouseCodeWizardUi.resize();
	fin.houseCodeSearchUi = fin.hcmhouseCodeWizardUi;
}
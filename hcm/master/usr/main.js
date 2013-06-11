ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.hcm.master.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.tabs", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );

ii.Class({
    Name: "fin.hcm.master.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {		 
        init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.status = true;
			me.hirNode = 0;
			
			if (!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			if (!parent.fin.appUI.hirNode) parent.fin.appUI.hirNode = 0;

			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.session = new ii.Session(me.cache);
			
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			
			me.activeFrameId = 0;			
			me.houseCodeNeedUpdate = true;
			me.statisticsNeedUpdate = true;
			me.financialNeedUpdate = true;
			me.payrollNeedUpdate = true;
			me.safetyNeedUpdate = true;
			me.modified(false);
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();

			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
			
			$("#TabCollection a").click(function() {
				
				switch(this.id) {
					case "TabHouseCode":

						if ($("iframe")[0].contentWindow.fin == undefined || fin.hcmMasterUi.houseCodeNeedUpdate)
							$("iframe")[0].src = "/fin/hcm/houseCode/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;

						fin.hcmMasterUi.activeFrameId = 0;
						fin.hcmMasterUi.houseCodeNeedUpdate = false;
						break;
						
					case "TabStatistics":

						if ($("iframe")[1].contentWindow.fin == undefined || fin.hcmMasterUi.statisticsNeedUpdate)
							$("iframe")[1].src = "/fin/hcm/statistics/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;

						fin.hcmMasterUi.activeFrameId = 1;
						fin.hcmMasterUi.statisticsNeedUpdate = false;
						break;

					case "TabFinancial":

						if ($("iframe")[2].contentWindow.fin == undefined || fin.hcmMasterUi.financialNeedUpdate)
							$("iframe")[2].src = "/fin/hcm/financial/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
							
						fin.hcmMasterUi.activeFrameId = 2;
						fin.hcmMasterUi.financialNeedUpdate = false;
						break;

					case "TabPayroll":

						if ($("iframe")[3].contentWindow.fin == undefined || fin.hcmMasterUi.payrollNeedUpdate)
							$("iframe")[3].src = "/fin/hcm/payroll/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
	
						fin.hcmMasterUi.activeFrameId = 3;
						fin.hcmMasterUi.payrollNeedUpdate = false;
						break;
						
					case "TabSafety":

						if ($("iframe")[4].contentWindow.fin == undefined || fin.hcmMasterUi.safetyNeedUpdate)
							$("iframe")[4].src = "/fin/hcm/safety/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
	
						fin.hcmMasterUi.activeFrameId = 4;
						fin.hcmMasterUi.safetyNeedUpdate = false;
						break;
				}
			});

			$("#container-1").tabs(1);
			$("iframe")[0].src = "/fin/hcm/houseCode/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
			$(window).bind("resize", me, me.resize);
			ii.trace("HouseCode Master Init", ii.traceTypes.information, "Info");
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
        },
		
		authorizationProcess: function fin_hcm_master_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if (me.isAuthorized)
				$("#pageLoading").hide();
			else {
				$("#messageToUser").html("Unauthorized");
				alert("You are not authorized to view this content. Please contact your Administrator.");
				return false;
			}
			
			me.houseCodeWrite = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Write");
			me.houseCodeReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\Read");
			
			me.tabHouseCodeShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabHouseCode");
			me.tabStatisticsShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabStatistics");
			me.tabFinancialShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial");
			me.tabPayrollShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll");
			me.tabSafetyShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabSafety");
			
			me.tabHouseCodeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\Write");
			me.tabHouseCodeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabHouseCode\\Read");
			
			/*if(!me.tabHouseCodeShow && !me.houseCodeWrite && !me.houseCodeReadOnly)
				$("#TabHouseCode").hide();
			else //when child nodes under HouseCode>tabs are not selected
				me.tabHouseCodeShow = true;
			*/	
			if (!me.tabStatisticsShow && !me.houseCodeWrite && !me.houseCodeReadOnly)
				$("#TabStatistics").hide();
			else
				me.tabStatisticsShow = true;
				
			if (!me.tabFinancialShow && !me.houseCodeWrite && !me.houseCodeReadOnly)
				$("#TabFinancial").hide();
			else
				me.tabFinancialShow = true;
			
			if (!me.tabPayrollShow && !me.houseCodeWrite && !me.houseCodeReadOnly)
				$("#TabPayroll").hide();
			else
				me.tabPayrollShow = true;
				
			if (!me.tabSafetyShow && !me.houseCodeWrite && !me.houseCodeReadOnly)
				$("#TabSafety").hide();
			else
				me.tabSafetyShow = true;		
				
			if (me.tabHouseCodeReadOnly || me.houseCodeReadOnly) {
				$("#actionMenu").hide();
			}		
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_hcm_master_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});
			var me = args.me;

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var offset = 85;

		    $("#iFrameHouseCode").height($(window).height() - offset);
		    $("#iFrameStatistics").height($(window).height() - offset);
		    $("#iFrameFinancial").height($(window).height() - offset);
		    $("#iFramePayroll").height($(window).height() - offset);
			$("#iFrameSafety").height($(window).height() - offset);
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
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.hcm.master.HirNode,
				itemConstructorArgs: fin.hcm.master.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = []; //used for dropdown on top
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.hcm.master.HouseCode,
				itemConstructorArgs: fin.hcm.master.houseCodeArgs,
				injectionArray: me.houseCodes
			});			

			me.houseCodeDetails = [];
			me.houseCodeDetailStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.hcm.master.HouseCodeDetail,
				itemConstructorArgs: fin.hcm.master.houseCodeDetailArgs,
				injectionArray: me.houseCodeDetails
			});			
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		houseCodesLoaded: function(me, activeId) {
					
			ii.trace("HouseCode Master - UnitsLoaded", ii.traceTypes.information, "Info");			
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}
			
			me.houseCodeGlobalParametersUpdate(false);			
			
			$("#pageLoading").hide();
			
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			ii.trace("HouseCode Master - UnitChanged", ii.traceTypes.information, "Info");			

			if (parent.fin.appUI.houseCodeId <= 0) return;

			me.houseCodeNeedUpdate = true;
			me.statisticsNeedUpdate = true;
			me.financialNeedUpdate = true;
			me.payrollNeedUpdate = true;
			me.safetyNeedUpdate = true;
			me.status = true;
			fin.hcmMasterUi.activeFrameId = 0;
		
			me.houseCodeDetailStore.fetch("userId:[user],unitId:" + parent.fin.appUI.unitId, me.houseCodeDetailsLoaded, me);
		},
		
		getHouseCodeId: function() {
			var args = ii.args(arguments,{});
			var me = this;

			return parent.fin.appUI.houseCodeId;
		},
		
		getHouseCodeBrief: function() {
			var args = ii.args(arguments,{});
			var me = this;

			return (parent.fin.appUI.houseCodeBrief ? parent.fin.appUI.houseCodeBrief : "");
		},

		houseCodeDetailsLoaded: function(me, activeId) {

			ii.trace("HouseCode Master - HouseCode Loaded", ii.traceTypes.information, "Info");			
			
			$("#unitLoading").hide();
           
			if (me.houseCodeDetails[0] == undefined) {
				alert("Error: Selected House code is not setup correctly. Please review.");
				me.status = false;
				return false;
			}
						
			parent.fin.appUI.houseCodeId = me.houseCodeDetails[0].id;	
			if (me.houseCodes.length > 0) {
				parent.fin.appUI.hirNode = me.houseCodes[0].hirNode;
			}			
			
			switch (fin.hcmMasterUi.activeFrameId) {
				
				case 0:	
					
					$("iframe")[0].src = "/fin/hcm/houseCode/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
					$("#container-1").triggerTab(1);
					me.houseCodeNeedUpdate = false;					
					break;

				case 1:

					$("iframe")[1].src = "/fin/hcm/statistics/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
					me.statisticsNeedUpdate = false;
					break;

				case 2:

					$("iframe")[2].src = "/fin/hcm/financial/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
					me.financialNeedUpdate = false;
					break;

				case 3:

					$("iframe")[3].src = "/fin/hcm/payroll/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
					me.payrollNeedUpdate = false;
					break;
					
				case 4:

					$("iframe")[4].src = "/fin/hcm/safety/usr/markup.htm?unitId=" + parent.fin.appUI.unitId;
					me.safetyNeedUpdate = false;
					break;
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

		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
						
			me.houseCodeDetailsLoaded(me, 0);
		},

		actionSaveItem: function() {			
			var args = ii.args(arguments,{});
			var me = this;			
			var houseCodeUIControls;
			var statisticsUIControls;
			var financialUIControls;
			var payrollUIControls;
			var safetyUIControls;

			if (me.houseCodeReadOnly || me.tabHouseCodeReadOnly) return;
			
			if (me.status == false || parent.fin.appUI.houseCodeId <= 0) {
				alert("House Code information not loaded properly. Please reload.");
				return false;
			}
			
			houseCodeUIControls = $("iframe")[0].contentWindow.fin.hcmHouseCodeUi;

			me.houseCodeDetails[0].appSiteId = (houseCodeUIControls.site.indexSelected < 0 ? 0 : houseCodeUIControls.siteTypes[houseCodeUIControls.site.indexSelected].id);		
			me.houseCodeDetails[0].jdeCompanyId = (houseCodeUIControls.jdeCompany.indexSelected <= 0 ? "0" : houseCodeUIControls.jdeCompanys[houseCodeUIControls.jdeCompany.indexSelected].id.toString());		
			me.houseCodeDetails[0].startDate = houseCodeUIControls.startDate.lastBlurValue;
			me.houseCodeDetails[0].serviceTypeId = (houseCodeUIControls.primaryService.indexSelected < 0 ? 0 : houseCodeUIControls.jdeServices[houseCodeUIControls.primaryService.indexSelected].id);
			me.houseCodeDetails[0].serviceLineId = (houseCodeUIControls.serviceLine.indexSelected <= 0 ? 0 : houseCodeUIControls.serviceLines[houseCodeUIControls.serviceLine.indexSelected].id);
			me.houseCodeDetails[0].enforceLaborControl = true; //($(houseCodeUIControls.enforceLaborControl).attr("checked").val() == "true" ? true : false)
			me.houseCodeDetails[0].managerName = houseCodeUIControls.managerName.getValue();
			me.houseCodeDetails[0].managerEmail = houseCodeUIControls.managerEmail.getValue();
			me.houseCodeDetails[0].managerPhone = houseCodeUIControls.managerPhone.getValue();
			me.houseCodeDetails[0].managerCellPhone = houseCodeUIControls.managerCellPhone.getValue();
			me.houseCodeDetails[0].managerFax = houseCodeUIControls.managerFax.getValue();
			me.houseCodeDetails[0].managerPager = houseCodeUIControls.managerPager.getValue();
			me.houseCodeDetails[0].managerAssistantName = houseCodeUIControls.managerAssistantName.getValue();
			me.houseCodeDetails[0].managerAssistantPhone = houseCodeUIControls.managerAssistantPhone.getValue();
			me.houseCodeDetails[0].clientFirstName = houseCodeUIControls.clientFirstName.getValue();
			me.houseCodeDetails[0].clientLastName = houseCodeUIControls.clientLastName.getValue();
			me.houseCodeDetails[0].clientTitle = houseCodeUIControls.clientTitle.getValue();
			me.houseCodeDetails[0].clientPhone = houseCodeUIControls.clientPhone.getValue();
			me.houseCodeDetails[0].clientFax = houseCodeUIControls.clientFax.getValue();
			me.houseCodeDetails[0].clientAssistantName = houseCodeUIControls.clientAssistantName.getValue();
			me.houseCodeDetails[0].clientAssistantPhone = houseCodeUIControls.clientAssistantPhone.getValue();

			//Statistics
			if ($("iframe")[1].contentWindow.fin != undefined && me.statisticsNeedUpdate == false) {
				statisticsUIControls = $("iframe")[1].contentWindow.fin.hcmStatisticsUi;
				
				me.houseCodeDetails[0].managedEmployees = statisticsUIControls.managedEmployees.getValue();
				me.houseCodeDetails[0].bedsLicensed = statisticsUIControls.bedsLicensed.getValue();
				me.houseCodeDetails[0].patientDays = statisticsUIControls.patientDays.getValue();
				me.houseCodeDetails[0].avgDailyCensus = statisticsUIControls.avgDailyCensus.getValue();
				me.houseCodeDetails[0].annualDischarges = statisticsUIControls.annualDischarges.getValue();
				me.houseCodeDetails[0].avgBedTurnaroundTime = statisticsUIControls.avgBedTurnAroundTime.getValue();
				me.houseCodeDetails[0].netCleanableSqft = statisticsUIControls.netCleanableSquareFeet.getValue();
				me.houseCodeDetails[0].avgLaundryLbs = statisticsUIControls.avgLaundryLbs.getValue();
				me.houseCodeDetails[0].crothallEmployees = statisticsUIControls.crothallEmployees.getValue();
				me.houseCodeDetails[0].bedsActive = statisticsUIControls.bedsActive.getValue();
				me.houseCodeDetails[0].adjustedPatientDaysBudgeted = statisticsUIControls.adjustedPatientDays.getValue();
				me.houseCodeDetails[0].annualTransfers = statisticsUIControls.annualTransfers.getValue();
				me.houseCodeDetails[0].annualTransports = statisticsUIControls.annualTransports.getValue();
				me.houseCodeDetails[0].mgmtFeeTerminatedHourlyEmployees = statisticsUIControls.mgmtFeeTerminatedHourlyEmployees.getValue();
				me.houseCodeDetails[0].mgmtFeeActiveHourlyEmployees = statisticsUIControls.mgmtFeeActiveHourlyEmployees.getValue();
				me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborHoursWorked = statisticsUIControls.mgmtFeeTotalProductiveLaborHoursWorked.getValue();
				me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborHours = statisticsUIControls.mgmtFeeTotalNonProductiveLaborHours.getValue();
				me.houseCodeDetails[0].mgmtFeeTotalProductiveLaborDollarsPaid = statisticsUIControls.mgmtFeeTotalProductiveLaborDollarsPaid.getValue();
				me.houseCodeDetails[0].mgmtFeeTotalNonProductiveLaborDollarsPaid = statisticsUIControls.mgmtFeeTotalNonProductiveLaborDollarsPaid.getValue();
				me.houseCodeDetails[0].hospitalPaidJanitorialPaperPlasticSupplyCost = statisticsUIControls.hospitalPaidJanitorialPaperPlasticSupplyCost.getValue();
				me.houseCodeDetails[0].buildingPopulation = statisticsUIControls.buildingPopulation.getValue();
				me.houseCodeDetails[0].maintainableAcres = statisticsUIControls.maintainableAcres.getValue();
				me.houseCodeDetails[0].scientists = statisticsUIControls.scientists.getValue();
				me.houseCodeDetails[0].managedRooms = statisticsUIControls.managedRooms.getValue();
				me.houseCodeDetails[0].siteType = (statisticsUIControls.siteType.indexSelected <= 0 ? 0 : statisticsUIControls.siteTypes[statisticsUIControls.siteType.indexSelected].id);
				me.houseCodeDetails[0].integrator = statisticsUIControls.integrator.check.checked;
				me.houseCodeDetails[0].integratorName = statisticsUIControls.integratorName.getValue();
				me.houseCodeDetails[0].auditScore = statisticsUIControls.auditScore.getValue();
				me.houseCodeDetails[0].standardizationScore = statisticsUIControls.standardizationScore.getValue();
			}

			//Financial
			if ($("iframe")[2].contentWindow.fin != undefined && me.financialNeedUpdate == false) {
				financialUIControls = $("iframe")[2].contentWindow.fin.hcmFinancialUi;
				
				me.houseCodeDetails[0].shippingAddress1 = financialUIControls.shippingAddress1.getValue();
				me.houseCodeDetails[0].shippingAddress2 = financialUIControls.shippingAddress2.getValue();
				me.houseCodeDetails[0].shippingCity = financialUIControls.shippingCity.getValue();
				me.houseCodeDetails[0].shippingZip = financialUIControls.shippingZip.getValue();
				me.houseCodeDetails[0].shippingState = (financialUIControls.shippingState.indexSelected <= 0 ? 0 : financialUIControls.stateTypes[financialUIControls.shippingState.indexSelected].id);
				me.houseCodeDetails[0].remitToLocationId = (financialUIControls.remitTo.indexSelected <= 0 ? 0 : financialUIControls.remitTos[financialUIControls.remitTo.indexSelected].id);
				me.houseCodeDetails[0].contractTypeId = (financialUIControls.contractType.indexSelected <= 0 ? 0 : financialUIControls.contractTypes[financialUIControls.contractType.indexSelected].id);
				me.houseCodeDetails[0].termsOfContractTypeId = (financialUIControls.termsOfContract.indexSelected <= 0 ? 0 :financialUIControls.termsOfContractTypes[financialUIControls.termsOfContract.indexSelected].id);
				me.houseCodeDetails[0].billingCycleFrequencyTypeId = (financialUIControls.billingCycleFrequency.indexSelected <= 0 ? 0 : financialUIControls.billingCycleFrequencys[financialUIControls.billingCycleFrequency.indexSelected].id);
				me.houseCodeDetails[0].financialEntityId = (financialUIControls.financialEntity.indexSelected < 0 ? 0 : financialUIControls.financialEntities[financialUIControls.financialEntity.indexSelected].id);
				me.houseCodeDetails[0].bankCodeNumber = financialUIControls.bankCodeNumber.getValue();
				me.houseCodeDetails[0].bankAccountNumber = financialUIControls.bankAccountNumber.getValue();
				me.houseCodeDetails[0].bankName = financialUIControls.bankName.getValue();
				me.houseCodeDetails[0].bankContact = financialUIControls.bankContact.getValue();
				me.houseCodeDetails[0].bankAddress1 = financialUIControls.bankAddress1.getValue();
				me.houseCodeDetails[0].bankAddress2 = financialUIControls.bankAddress2.getValue();
				me.houseCodeDetails[0].bankCity = financialUIControls.bankCity.getValue();
				me.houseCodeDetails[0].bankState = (financialUIControls.bankState.indexSelected <= 0 ? 0 : financialUIControls.stateTypes[financialUIControls.bankState.indexSelected].id);
				me.houseCodeDetails[0].bankZip = financialUIControls.bankZip.getValue();
				me.houseCodeDetails[0].bankPhone = financialUIControls.bankPhone.getValue();
				me.houseCodeDetails[0].bankFax = financialUIControls.bankFax.getValue();
				me.houseCodeDetails[0].bankEmail = financialUIControls.bankEmail.getValue();
				me.houseCodeDetails[0].invoiceLogoTypeId = (financialUIControls.invoiceLogo.indexSelected < 0 ? 0 : financialUIControls.invoiceLogoTypes[financialUIControls.invoiceLogo.indexSelected].id);
				me.houseCodeDetails[0].budgetTemplateId = (financialUIControls.budgetTemplate.indexSelected < 0 ? 0 : financialUIControls.budgetTemplates[financialUIControls.budgetTemplate.indexSelected].id);
				me.houseCodeDetails[0].budgetLaborCalcMethod = (financialUIControls.budgetLaborCalcMethod.indexSelected < 0 ? 0 : financialUIControls.budgetLaborCalcMethods[financialUIControls.budgetLaborCalcMethod.indexSelected].id);
				me.houseCodeDetails[0].budgetComputerRelatedCharge = (financialUIControls.budgetComputerRelatedCharge.check.checked ? 1 : 0);
			}
			
			//Payroll			
			if ($("iframe")[3].contentWindow.fin != undefined && me.payrollNeedUpdate == false) {
				payrollUIControls = $("iframe")[3].contentWindow.fin.hcmPayrollCodeUi;
				
				me.houseCodeDetails[0].payrollProcessingLocationTypeId = (payrollUIControls.payrollProcessing.indexSelected <= 0 ? 0 : payrollUIControls.payrollProcessings[payrollUIControls.payrollProcessing.indexSelected].id);
				me.houseCodeDetails[0].timeAndAttendance = payrollUIControls.payrollTimeAttendance;
				me.houseCodeDetails[0].defaultLunchBreak = payrollUIControls.payrollDefaultLunchBreak;
				
				if (me.houseCodeDetails[0].defaultLunchBreak == 0) {
					me.houseCodeDetails[0].defaultLunchBreak = payrollUIControls.breakOthers.getValue();
				}
				
				me.houseCodeDetails[0].lunchBreakTrigger = payrollUIControls.payrollLunchBreakTrigger;

				if (me.houseCodeDetails[0].lunchBreakTrigger == 0) {
					me.houseCodeDetails[0].lunchBreakTrigger = payrollUIControls.breakTrigger.getValue();
				}
					
				me.houseCodeDetails[0].houseCodeTypeId = payrollUIControls.payrollHouseCodeType;
				me.houseCodeDetails[0].roundingTimePeriod = payrollUIControls.payrollRoundingTimePeriod;
				me.houseCodeDetails[0].ePaySite = payrollUIControls.ePaySiteSelect;
				me.houseCodeDetails[0].ePayGroupType = (payrollUIControls.ePayPayGroup.indexSelected <= 0 ? 0 : payrollUIControls.ePayGroupTypes[payrollUIControls.ePayPayGroup.indexSelected].id);
				me.houseCodeDetails[0].ePayTask = (payrollUIControls.ePayTask.check.checked ? 1 : 0);
			}
			
			//Safety
			if ($("iframe")[4].contentWindow.fin != undefined && me.safetyNeedUpdate == false) {
				safetyUIControls = $("iframe")[4].contentWindow.fin.hcmSafetyUi;
				
				me.houseCodeDetails[0].incidentFrequencyRate = safetyUIControls.incidentFrequencyRate.getValue();
				me.houseCodeDetails[0].trir = safetyUIControls.trir.getValue();
				me.houseCodeDetails[0].lostDays = safetyUIControls.lostDays.getValue();
				me.houseCodeDetails[0].reportedClaims = safetyUIControls.reportedClaims.getValue();
				me.houseCodeDetails[0].nearMisses = safetyUIControls.nearMisses.getValue();
				me.houseCodeDetails[0].oshaRecordable = safetyUIControls.oshaRecordable.getValue();
			}
			
			if (me.houseCodeDetails[0].jdeCompanyId == 0) {
				alert("[JDE Company] is a required field. Please select it on HouseCode Tab.");	
				return;
			}
						
			if (me.houseCodeDetails[0].appSiteId == 0) {
				alert("[Site] is a required field. Please select it on HouseCode Tab.");	
				return;
			}
						
			if (me.houseCodeDetails[0].startDate == "") {
				alert("[Start Date] is required in order for TeamFin to recognize the House Code throughout the application. Please select it on HouseCode Tab.");
				me.houseCodeDetails[0].startDate = "01/01/1900";
				return;
			}
			
			if (me.houseCodeDetails[0].serviceTypeId < 0) {
				alert("[Primary Service] Provided is required for accurate reporting. Please select it on HouseCode Tab.");
				return;
			}			
			
			if (me.houseCodeDetails[0].integrator && me.houseCodeDetails[0].integratorName == "") {
				alert("[Integrator Name] is a required field. Please select it on Statistics Tab.");
				return false;
			}
			
			if (me.houseCodeDetails[0].remitToLocationId <= 0) {
				alert("[Remit To] is a required field. Please select it on Financial Tab.");
				return false;
			}
			
			if (me.houseCodeDetails[0].contractTypeId <= 0) {
				alert("[Contract Type] is a required field. Please select it on Financial Tab.");
				return false;
			}

			if (me.houseCodeDetails[0].defaultLunchBreak  == "" && me.houseCodeDetails[0].timeAndAttendance == true) {
				alert("[Default Lunch Break] enter data for others option. Please select it on Payroll Tab.");
				return false;
			}
			
			if (me.houseCodeDetails[0].lunchBreakTrigger == "" && me.houseCodeDetails[0].timeAndAttendance == true) {
				alert("[Lunch Break Trigger] enter data for others option. Please select it on Payroll Tab.");
				return false;
			}
			
			var item = new fin.hcm.master.HouseCodeDetail(
				parent.fin.appUI.houseCodeId
				, parent.fin.appUI.hirNode
				, parent.fin.appUI.unitId.toString()
				, me.houseCodeDetails[0].appSiteId
				, me.houseCodeDetails[0].jdeCompanyId
				, me.houseCodeDetails[0].startDate
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
				, me.houseCodeDetails[0].buildingPopulation == "" ? 0 : parseFloat(me.houseCodeDetails[0].buildingPopulation)
				, me.houseCodeDetails[0].maintainableAcres
				, me.houseCodeDetails[0].scientists
				, me.houseCodeDetails[0].managedRooms
				, me.houseCodeDetails[0].siteType
				, me.houseCodeDetails[0].integrator
				, me.houseCodeDetails[0].integratorName
				, me.houseCodeDetails[0].auditScore
				, me.houseCodeDetails[0].standardizationScore
				
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
		
		saveXmlBuild: function() {
			var args = ii.args(arguments, {
				item: {type: fin.hcm.master.HouseCodeDetail}
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

			if ($("iframe")[0].contentWindow.fin != undefined) {
			
				var houseCodeUIControls = $("iframe")[0].contentWindow.fin.hcmHouseCodeUi;
				var serviceNames = "";
				for (var index in houseCodeUIControls.serviceGroup.selectedItems) {
					if (index >= 0) {
						xml += '<houseCodeService id="0" houseCodeId="' + item.id + '" serviceTypeId="' + houseCodeUIControls.serviceGroup.selectedItems[index].id + '" clientId="' + ++clientId + '"/>';
					}					
				}				
			}	
			
			//Payroll - Ceridian Company Options
			if ($("iframe")[3].contentWindow.fin != undefined && me.payrollNeedUpdate == false) {
				var payrollUIControls = $("iframe")[3].contentWindow.fin.hcmPayrollCodeUi;
				
				xml += '<houseCodePayrollCompany';
				xml += ' id="0"';
				xml += ' payrollCompanyId="' + (payrollUIControls.ceridianCompanySalaried.indexSelected >= 0 ? payrollUIControls.payPayrollCompanys[payrollUIControls.ceridianCompanySalaried.indexSelected].id : 0) + '"';
				xml += ' houseCodeId="' + item.id.toString() + '"';
				xml += ' salary="1"';					
				xml += '/>';
				
				xml += '<houseCodePayrollCompany';
				xml += ' id="0"';
				xml += ' payrollCompanyId="' + (payrollUIControls.ceridianCompanyHourly.indexSelected >= 0 ? payrollUIControls.payPayrollCompanys[payrollUIControls.ceridianCompanyHourly.indexSelected].id : 0) + '"';
				xml += ' houseCodeId="' + item.id.toString() + '"';
				xml += ' hourly="1"';
				xml += '/>';					
			}
				
			xml += '</houseCode>';
			
			return xml;
		},
		
		/* @iiDoc {Method}
		* Handles the server's response to a save transaction.
		*/
		saveResponse: function(){
			var args = ii.args(arguments, {
				transaction: { type: ii.ajax.TransactionMonitor.Transaction }, // The transaction that was responded to.
				xmlNode: { type: "XmlNode:transaction" } // The XML transaction node associated with the response.
			});						
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			
			if (status == "success") {
				me.modified(false);	
				if ($("iframe")[0].contentWindow.fin != undefined) {
					$("iframe")[0].contentWindow.fin.hcmHouseCodeUi.reloadHouseCodeServices();
				}
			}
			else {
				alert("[SAVE FAILURE] Error while updating House Code details: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").hide();
		}
	}
});

function main() {

	fin.hcmMasterUi = new fin.hcm.master.UserInterface();
	fin.hcmMasterUi.resize();
	fin.houseCodeSearchUi = fin.hcmMasterUi;
}
ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.emp.employeeGeneral.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearchEmployee" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.dropDown" , 6);
ii.Style( "fin.cmn.usr.dateDropDown" , 7);

ii.Class({
    Name: "fin.emp.UserInterface",
	Extends: "ui.lay.HouseCodeSearchEmployee",
    Definition: {
		
        init: function fin_emp_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;
			var queryStringArgs = {}; 
			var queryString = location.search.substring(1); 
			var pairs = queryString.split("&"); 
			
			for(var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 

			me.personId = queryStringArgs["personId"];
			me.employeeGeneralId = 0;
			me.employeePersonalId = 0;
			me.employeeNumberNew = 0;
			me.houseCodeId = 0;
			me.hirNode = 0;
			me.status = "";
			me.houseCodeChangedFlag = false;
			me.houseCodeJobChanged = false;
			me.employeeActiveChanged = false;
			me.employeeGenderChanged = false;
			me.employeeGeneralAreaChanged = false;
			me.isPageLoaded = false; //validation for multiple popup	
			me.houseCodeTitleValue = "";
			me.newStatusTypes = [];
			me.payFrequencyType = 0;
			me.scheduledHoursValue = 0;
			me.employeePayRateValue = 0;			
			me.payPeriodStartDate = "";
			me.payPeriodEndDate = "";
			me.payRollEntries = 0;
			me.newEmployeeNumber = 0;
						
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
			
			me.validator = new ui.ctl.Input.Validation.Master();
				
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Employees";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();			

			me.houseCodeSearch = new ui.lay.HouseCodeSearchEmployee();

			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);

			// Disable the context menu but not on localhost because its used for debugging
			if( location.hostname != "localhost" ){
				$(document).bind("contextmenu", function(event){
					return false;
				});
			}
			
			$("input[type=radio]").click(function() {
				
				switch (this.id) {
					case "HourlyRateYes":
						$("#PayRateLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Hourly Pay Rate");
						break;
						
					case "HourlyRateNo":
						$("#PayRateLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Annual Salary");
						me.payRateTypeChanged();
						break;
						
					case "UnionYes":
						$("#LabelUnion").html("<span class='requiredFieldIndicator'>&#149;</span>Union:");
						break;
					case "EmployeeActiveNo":
							me.employeeActiveChanged = true;
							me.employeeActiveChangedNo();
							me.employeeEffectiveDate.setValue(me.currentDate());
						break;
					case "EmployeeActiveYes":
							me.employeeActiveChanged = false;
							me.employeeStatusType.setData(me.statusTypes);	
							me.employeeEffectiveDate.setValue(me.currentDate());					
						break;	
					case "CrothallEmployeeYes": 
							me.employeeEffectiveDate.setValue(me.currentDate());
						break;	
					case "CrothallEmployeeNo": 
							me.employeeEffectiveDate.setValue(me.currentDate());	
						break;		
						
					case "UnionNo":
						$("#LabelUnion").html("<span id='nonRequiredFieldIndicator'>Union:</span>");
						me.employeeUnion.resetValidation(false);
						me.employeeUnion.updateStatus();
						me.employeeUnion.select(0, me.employeeUnion.focused);
						break;
				}

				if (this.id == "HourlyRateYes" || this.id == "HourlyRateNo" 
					|| this.id == "UnionYes" || this.id == "UnionNo"
					|| this.id == "PTOSetupAutomatic" || this.id == "PTOSetupManual") {
					fin.empGeneralUi.actionPerPayPeriodReset();
					fin.empGeneralUi.actionPTOSetupReset(this.id);					
				}				
			});
			
			me.ssnLookUp = false;
			
			$("#SSNLookUp").click(function() {

				if(fin.empGeneralUi.employeeSSN.getValue() == '') {
					alert("Please enter SSN for Look-Up.");
					if(fin.empGeneralUi.sgSSNShow && !fin.empGeneralUi.sgSSNReadOnly) fin.empGeneralUi.employeeSSN.text.focus();
					return;
				}
				
				fin.empGeneralUi.ssnLookUp = true;
				fin.empGeneralUi.validateAttribute = 'SSN';	//validation for multiple popup			
				fin.empGeneralUi.validateEmployeeDetails();
			});
			
			//fetch all type tables
			me.fetchData();
        },
		
		authorizationProcess: function fin_emp_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if (!me.isAuthorized) {
				$("#messageToUser").text("Load Failed");
				$("#pageLoading").show();
				return;
			}

			me.employeeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.employeeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			me.tabGeneralShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabGeneral");
			me.tabGeneralWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\Write");
			me.tabGeneralReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\Read");

			me.sectionGeneralShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabGeneral\\SectionGeneral");
			me.sectionJobShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabGeneral\\SectionJob");
			me.sectionCompensationShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabGeneral\\SectionCompensation");
			me.sectionPTOShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabGeneral\\SectionPTO");

			me.sectionGeneralWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Write");
			me.sectionJobWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionJob\\Write");
			me.sectionCompensationWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionCompensation\\Write");
			me.sectionPTOWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionPTO\\Write");

			me.sectionGeneralReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Read");
			me.sectionJobReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionJob\\Read");
			me.sectionCompensationReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionCompensation\\Read");
			me.sectionPTOReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabGeneral\\SectionPTO\\Read");
			
			//sg=sectionGeneral
			me.sgBriefShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Brief", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgSSNShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SSN", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgHouseCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\HouseCode", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgCeridianCompanyShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CeridianCompany", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgEmployeeNumberShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\EmployeeNumber", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgGenderShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Gender", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgBirthDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\BirthDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgMaritalStatusShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\MaritalStatus", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgEthnicityShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Ethnicity", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgI9StatusShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\I9Status", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgEmployeeActiveShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Active", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgVets100StatusShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Vets100Status", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgEmployeeStatusShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Status", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgCrothallEmployeeShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CrothallEmployee", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgCurrentHireDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CurrentHireDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgStatusCategoryShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\StatusCategory", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgOriginalHireDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\OriginalHireDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgEffectiveDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\EffectiveDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgTerminationDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\TerminationDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgSeniorityDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SeniorityDate", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgTerminationReasonShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\TerminationReason", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));
			me.sgSeparationCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SeparationCode", me.sectionGeneralShow, (me.sectionGeneralWrite || me.sectionGeneralReadOnly));

			me.sgBriefReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Brief\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgSSNReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SSN\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgHouseCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\HouseCode\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgCeridianCompanyReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CeridianCompany\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgEmployeeNumberReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\EmployeeNumber\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgGenderReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Gender\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgBirthDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\BirthDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgMaritalStatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\MaritalStatus\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgEthnicityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Ethnicity\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgI9StatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\I9Status\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgEmployeeActiveReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Active\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgVets100StatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Vets100Status\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgEmployeeStatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\Status\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgCrothallEmployeeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CrothallEmployee\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgCurrentHireDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\CurrentHireDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgStatusCategoryReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\StatusCategory\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgOriginalHireDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\OriginalHireDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgEffectiveDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\EffectiveDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgTerminationDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\TerminationDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgSeniorityDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SeniorityDate\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgTerminationReasonReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\TerminationReason\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);
			me.sgSeparationCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionGeneral\\SeparationCode\\Read", me.sectionGeneralWrite, me.sectionGeneralReadOnly);

			//sj=sectionJob
			me.sjEffectiveDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\EffectiveDate", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjJobChangeReasonShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\JobChangeReason", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjEmployeeJobCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\JobCode", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjDefaultHouseCodeJobShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\HouseCodeJob", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjUnionShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\Union", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjExemptShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\Exempt", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjBackgroundCheckDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\BackGroundCheckDate", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			me.sjEmployeeUnionShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionJob\\EmployeeUnion", me.sectionJobShow, (me.sectionJobWrite || me.sectionJobReadOnly));
			
			me.sjEffectiveDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\EffectiveDate\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjJobChangeReasonReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\JobChangeReason\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjEmployeeJobCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\JobCode\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjDefaultHouseCodeJobReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\HouseCodeJob\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjUnionReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\Union\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjExemptReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\Exempt\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjBackgroundCheckDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\BackGroundCheckDate\\Read", me.sectionJobWrite, me.sectionJobReadOnly);
			me.sjEmployeeUnionReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionJob\\EmployeeUnion\\Read", me.sectionJobWrite, me.sectionJobReadOnly);

			//sc=sectionCompensation
			me.scEffectiveDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\EffectiveDate", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scRateChangeReasonShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\RateChangeReason", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scHourlyRateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\HourlyPayRate", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			//label only
			me.scPayFrequencyTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\PayFrequencyType", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scPayRateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\PayRate", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scScheduledHoursShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\ScheduledHours", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scReviewDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\ReviewDate", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			//label only
			me.scDollarPerPayPeriodShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\DollarPerPayPeriod", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scWorkShiftShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\WorkShift", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scBenefitsPercentageShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\CompanyPaidBenefit", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scAlternatePayRateAShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateA", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scAlternatePayRateBShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateB", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scAlternatePayRateCShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateC", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scAlternatePayRateDShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateD", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			me.scDeviceGroupShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\DeviceGroup", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));
			//label only
			me.scEmployeeRateChangeDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionCompensation\\EmployeeRateChangeDate", me.sectionCompensationShow, (me.sectionCompensationWrite || me.sectionCompensationReadOnly));

			me.scEffectiveDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\EffectiveDate\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scRateChangeReasonReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\RateChangeReason\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scHourlyRateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\HourlyPayRate\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scPayRateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\PayRate\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scScheduledHoursReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\ScheduledHours\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scReviewDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\ReviewDate\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scWorkShiftReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\WorkShift\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scBenefitsPercentageReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\CompanyPaidBenefit\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scAlternatePayRateAReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateA\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scAlternatePayRateBReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateB\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scAlternatePayRateCReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateC\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scAlternatePayRateDReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\AlternatePayRateD\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			me.scDeviceGroupReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionCompensation\\DeviceGroup\\Read", me.sectionCompensationWrite, me.sectionCompensationReadOnly);
			//sp=sectionPTO
			me.spAccrualHoursEntryShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionPTO\\AccrualHoursEntry", me.sectionPTOShow, (me.sectionPTOShow || me.sectionPTOReadOnly));
			me.spStartDateShow = me.isCtrlVisible(me.authorizePath + "\\TabGeneral\\SectionPTO\\StateDate", me.sectionPTOShow, (me.sectionPTOShow || me.sectionPTOReadOnly));
			
			me.spAccrualHoursEntryReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionPTO\\AccrualHoursEntry\\Read", me.sectionPTOWrite, me.sectionPTOReadOnly);
			me.spStartDateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabGeneral\\SectionPTO\\StartDate\\Read", me.sectionPTOWrite, me.sectionPTOReadOnly);

			me.resetUIElements();
			
			$("#pageLoading").hide();	
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_emp_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},

		isCtrlVisible: function fin_emp_UserInterface_isCtrlVisible(){ 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if(me.employeeWrite || me.employeeReadOnly)
				return true;
			
			if(me.tabGeneralWrite || me.tabGeneralReadOnly)
				return true;

			if(args.sectionReadWrite)
				return true;

			if(args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_emp_UserInterface_isCtrlReadOnly(){ 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});
			
			var me = this;

			if(args.sectionWrite && !me.tabGeneralReadOnly && !me.employeeReadOnly)
				return false;

			if(me.tabGeneralWrite && !me.employeeReadOnly)
				return false;

			if(me.employeeWrite)
				return false;
			
			if(me.employeeReadOnly) return true;
			if(me.tabGeneralReadOnly) return true;
			if(args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_emp_UserInterface_resetUIElements() {
			var me = this;			
			
			me.setControlState("EmployeeBrief", me.sgBriefReadOnly, me.sgBriefShow);
			//me.setControlState("EmployeeSSN", me.sgSSNReadOnly, me.sgSSNShow);

			if(me.sgHouseCodeReadOnly){
				$("#houseCodeText").attr('disabled', true);
				$("#houseCodeTextDropImage").removeClass("HouseCodeDropDown");
			} 
			if(!me.sgHouseCodeShow){
				$("#houseCodeContainer").hide();
				$("#houseCodeText").hide();
				$("#houseCodeTextDropImage").removeClass("HouseCodeDropDown");
				} 

			me.setControlState("EmployeePayrollCompany", me.sgCeridianCompanyReadOnly, me.sgCeridianCompanyShow);
			me.setControlState("EmployeeNumber", me.sgEmployeeNumberReadOnly, me.sgEmployeeNumberShow);
			me.setControlState("Gender", me.sgGenderReadOnly, me.sgGenderShow, "Radio", "LabelGeneralRadioButtonGender");
			me.setControlState("EmployeeBirthDate", me.sgBirthDateReadOnly, me.sgBirthDateShow);
			me.setControlState("EmployeeMaritalStatus", me.sgMaritalStatusReadOnly, me.sgMaritalStatusShow);
			me.setControlState("EmployeeEthnicity", me.sgEthnicityReadOnly, me.sgEthnicityShow);
			me.setControlState("EmployeeI9Status", me.sgI9StatusReadOnly, me.sgI9StatusShow);
			me.setControlState("EmployeeActive", me.sgEmployeeActiveReadOnly, me.sgEmployeeActiveShow, "Radio", "LabelGeneralRadioButtonEmployeeActive");
			me.setControlState("EmployeeVETSStatus", me.sgVets100StatusReadOnly, me.sgVets100StatusShow);
			me.setControlState("EmployeeStatusType", me.sgEmployeeStatusReadOnly, me.sgEmployeeStatusShow);
			me.setControlState("CrothallEmployee", me.sgCrothallEmployeeReadOnly, me.sgCrothallEmployeeShow, "Radio", "LabelGeneralRadioButtonCrothallEmployee");
			//conflict with other logic TODO
			me.setControlState("EmployeeHireDate", me.sgCurrentHireDateReadOnly, me.sgCurrentHireDateShow);
			me.setControlState("EmployeeStatusCategoryType", me.sgStatusCategoryReadOnly, me.sgStatusCategoryShow);
			me.setControlState("EmployeeOriginalHireDate", me.sgOriginalHireDateReadOnly, me.sgOriginalHireDateShow);
			//conflict with other logic TODO
			me.setControlState("EmployeeEffectiveDate", me.sgEffectiveDateReadOnly, me.sgEffectiveDateShow);
			me.setControlState("EmployeeTerminationDate", me.sgTerminationDateReadOnly, me.sgTerminationDateShow);
			me.setControlState("EmployeeSeniorityDate", me.sgSeniorityDateReadOnly, me.sgSeniorityDateShow);
			me.setControlState("EmployeeTerminationReason", me.sgTerminationReasonReadOnly, me.sgTerminationReasonShow);
			me.setControlState("SeparationCode", me.sgSeparationCodeReadOnly, me.sgSeparationCodeShow);
			//End of Section General
			
			//sj=Section Job
			me.setControlState("JobEffectiveDate", me.sjEffectiveDateReadOnly, me.sjEffectiveDateShow);
			me.setControlState("JobChangeReason", me.sjJobChangeReasonReadOnly, me.sjJobChangeReasonShow);
			me.setControlState("EmployeeJobCode", me.sjEmployeeJobCodeReadOnly, me.sjEmployeeJobCodeShow);
			me.setControlState("DefaultHouseCodeJob", me.sjDefaultHouseCodeJobReadOnly, me.sjDefaultHouseCodeJobShow);
			me.setControlState("Union", me.sjUnionReadOnly, me.sjUnionShow, "Radio", "LabelGeneralRadioButtonUnion");
			me.setControlState("Exempt", me.sjExemptReadOnly, me.sjExemptShow, "Radio", "LabelGeneralRadioButtonExempt");
			me.setControlState("EmployeeBackgroundCheckDate", me.sjBackgroundCheckDateReadOnly, me.sjBackgroundCheckDateShow);
			me.setControlState("EmployeeUnion", me.sjEmployeeUnionReadOnly, me.sjEmployeeUnionShow);
			//End of Section Job
			
			//sc=Section Compensation
			me.setControlState("CompensationEffectiveDate", me.scEffectiveDateReadOnly, me.scEffectiveDateShow);
			me.setControlState("EmployeeRateChangeReason", me.scRateChangeReasonReadOnly, me.scRateChangeReasonShow);
			me.setControlState("HourlyRate", me.scHourlyRateReadOnly, me.scHourlyRateShow, "Radio", "LabelGeneralRadioButtonHourly");
			//payFrequency Readonly label
			me.setControlState("PayFrequencyType", false, me.scPayFrequencyTypeShow);
			me.setControlState("EmployeePayRate", me.scPayRateReadOnly, me.scPayRateShow);
			me.setControlState("EmployeeScheduledHours", me.scScheduledHoursReadOnly, me.scScheduledHoursShow);
			me.setControlState("EmployeeReviewDate", me.scReviewDateReadOnly, me.scReviewDateShow);
			//pay per payPeriod label
			me.setControlState("DollarPerPayPeriodLabel", false, me.scDollarPerPayPeriodShow);
			me.setControlState("EmployeeWorkShift", me.scWorkShiftReadOnly, me.scWorkShiftShow);
			me.setControlState("EmployeeBenefitsPercentage", me.scBenefitsPercentageReadOnly, me.scBenefitsPercentageShow);
			me.setControlState("EmployeeAlternatePayRateA", me.scAlternatePayRateAReadOnly, me.scAlternatePayRateAShow);
			me.setControlState("EmployeeAlternatePayRateB", me.scAlternatePayRateBReadOnly, me.scAlternatePayRateBShow);
			me.setControlState("EmployeeAlternatePayRateC", me.scAlternatePayRateCReadOnly, me.scAlternatePayRateCShow);
			me.setControlState("EmployeeAlternatePayRateD", me.scAlternatePayRateDReadOnly, me.scAlternatePayRateDShow);
			me.setControlState("EmployeeDeviceGroup", me.scDeviceGroupReadOnly, me.scDeviceGroupShow);
			//EmployeeRateChangeDate label
			me.setControlState("EmployeeRateChangeDate", false, me.scEmployeeRateChangeDateShow);
			//End of Section Compensation

			me.setControlState("PTOSetup", me.spAccrualHoursEntryReadOnly, me.spAccrualHoursEntryShow, "Radio", "LabelGeneralRadioButtonPTO");
			me.setControlState("PTOStartDate", me.spStartDateReadOnly, me.spStartDateShow);
			//End of Section PTO
		},
		
		setControlState: function(){
			var args = ii.args(arguments, {
				ctrlName: {type: String},
				ctrlReadOnly: {type: Boolean, defaultValue: false}, 
				ctrlShow: {type: Boolean, required: false, defaultValue: false}, 
				ctrlType: {type: String, required: false, defaultValue: ""}, //DropList, Date, Text, Radio
				ctrlDiv: {type: String, required: false} //parent Div name for Radio button
			});
			var me = this;
			
			if(args.ctrlReadOnly && args.ctrlType != "Radio"){
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if(!args.ctrlShow && args.ctrlType != "Radio"){
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
				
				if(args.ctrlName == "EmployeeSSN") $("#SSNLookUp").hide();
			}
		
			if(args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName != "PTOSetup"){
				$("#" + args.ctrlName + "Yes").attr('disabled', true);
				$("#" + args.ctrlName + "No").attr('disabled', true);
			} 
			if(args.ctrlReadOnly && args.ctrlType == "Radio" && args.ctrlName == "PTOSetup"){
				window.setInterval(function(){
					$("#" + args.ctrlName + "Automatic").attr('disabled', true);
					$("#" + args.ctrlName + "Manual").attr('disabled', true);
				}, 50);
			} 
			if(!args.ctrlShow && args.ctrlType == "Radio"){
				$("#" + args.ctrlDiv).hide();
			} 
		},

		resize: function() {
			var me = this;
			
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.employeeBrief = new ui.ctl.Input.Text({
		        id: "EmployeeBrief" ,
				changeFunction: function(){ me.employeeEffectiveDateChanged();},
		        maxLength : 16
		    });
			me.employeeBrief.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );
			
			me.employeeSSN = new ui.ctl.Input.Text({
		        id: "EmployeeSSN" ,
				changeFunction: function(){ me.employeeEffectiveDateChanged();},
		        maxLength : 11
		    });

			me.employeeSSN.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeSSN.getValue();
					
					if(enteredText == '') return;

					me.employeeSSN.text.value = fin.cmn.text.mask.ssn(enteredText);
					enteredText = me.employeeSSN.text.value;
					
					if(/^(?!000)^([0-8]\d{2})([ -]?)((?!00)\d{2})([ -]?)((?!0000)\d{4})$/.test(enteredText) == false)
						this.setInvalid("Please enter valid Social Security Number. Example: 001-01-0001, 899-99-9999.");
			});
				
			me.employeePayrollCompany = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeePayrollCompany", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(index) {
					me.employeeNumberChange();
					fin.empGeneralUi.actionPerPayPeriodReset();
					me.actionPTOSetupReset();
					me.actionHoursReset();
					me.payFrequencyChanged();
				},
				required : false
		    });			
			me.employeePayrollCompany.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					//if (me.employeePayrollCompany.text.value == "" && me.isPageLoaded == true)
					if ((this.focused || this.touched) && me.employeePayrollCompany.text.value == "")
						this.setInvalid("Please select the correct Ceridian Company.");
			});	
			
			me.employeeNumber = new ui.ctl.Input.Text({
		        id: "EmployeeNumber",
		        maxLength : 7
		    });
			me.employeeNumber.makeEnterTab()
				.setValidationMaster( me.validator );
			$("#EmployeeNumberText").attr('readonly', true);
			
			me.employeeBirthDate = new ui.ctl.Input.Date({ 
				id: "EmployeeBirthDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			}); 			
			me.employeeBirthDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {					

					var enteredText = me.employeeBirthDate.text.value;
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return;
					}

					var today = new Date();
					var birthDate = new Date(me.employeeBirthDate.text.value);					

					if (birthDate > today) 
						this.setInvalid("The Birth Date cannot be after current date.");	
											
			});
			
			me.employeeMaritalStatus = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeMaritalStatus",
				formatFunction: function( type ) { return type.name; }, 
				required : false
		    });
			
			me.employeeMaritalStatus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeMaritalStatus.getValue();

					if(enteredText == '') return;
				
					if (me.employeeMaritalStatus.text.value == '' && me.isPageLoaded == true){
						valid = false;
						this.setInvalid("Please select the correct Marital Status.");
						return false;
					}
						
			});
				
			me.employeeEthnicity = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeEthnicity", 
				formatFunction: function( type ) { return type.name; },
				required : false
		    });
			me.employeeEthnicity.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.employeeEthnicity.text.value == '' && me.isPageLoaded == true )
						this.setInvalid("Please select the correct Ethnicity.");
			});
				
			me.employeeI9Status = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeI9Status", 
				formatFunction: function( type ) { return type.name; },				
				required : false
		    });
			me.employeeI9Status.makeEnterTab()
				.setValidationMaster( me.validator );
				
			me.employeeVETSStatus = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeVETSStatus", 
				formatFunction: function( type ) { return type.name; },
				required : false
		    });
			me.employeeVETSStatus.makeEnterTab()
				.setValidationMaster( me.validator );			
			
			me.employeeStatusType = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeStatusType", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(){ me.actionEmployeeStatusChanged(); },
				required : false
		    });			
			me.employeeStatusType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeStatusType.indexSelected == -1) {
						this.setInvalid("Please select the correct Status.");
						return;
					}
					
					if(me.employeeStatusType.text.value != "Terminated"){
						fin.empGeneralUi.employeeTerminationDate.text.value = '';
						fin.empGeneralUi.employeeTerminationReason.select(0, fin.empGeneralUi.employeeTerminationReason.focused);
					}					
			});
				
			me.employeeHireDate = new ui.ctl.Input.Date({ 
				id: "EmployeeHireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy");},
				changeFunction: function(){ me.employeeEffectiveDateChanged();}
			}); 
			me.employeeHireDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeeHireDate.text.value;
					
					if(enteredText == '') return;	
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false) {
						this.setInvalid("Please enter valid date.");
						return false;
					}
					//see if employee is hired or terminated.
					if(me.payPeriodStartDate != "" && (me.isEmployeeNewhired() || me.isEmployeeRehired())) {
						if (me.compareDate(enteredText, me.payPeriodStartDate) == -1 || me.compareDate(enteredText, me.payPeriodEndDate) == 1) {
							this.setInvalid("Please enter valid date which is in range of current pay Period.");
							return false;
						}
					}

					if(me.employeeOriginalHireDate.text.value == '')
						me.employeeOriginalHireDate.setValue(me.employeeHireDate.text.value + '');
							
					me.setSeniorityDate();
					
					//if terminated employee is rehired then set effective dates as per hirDate.
					if (me.employeeGeneralId > 0) {
						if (me.employeeStatusType.text.value.toLowerCase() == 'active' &&
						me.employeeGenerals[0].terminationDate.toString() != "") {
						
							me.jobEffectiveDate.setValue(me.employeeHireDate.text.value);
							me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value);
						}
					}		
					
					if(me.employeePayrollCompany.text.value == '' && me.isPageLoaded == true){
						this.setInvalid("Please select Ceridian Company.");
						return false;
					}				
			});			

			me.employeeStatusCategoryType = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeStatusCategoryType", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(){ me.employeeEffectiveDateChanged();},
				required : false
		    });			
			me.employeeStatusCategoryType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeStatusType.text.value == "" && me.isPageLoaded == true) {
						this.setInvalid("Please select the correct Status Category.");
						return;
					}				
			});

			me.employeeOriginalHireDate = new ui.ctl.Input.Date({ 
				id: "EmployeeOriginalHireDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});
			me.employeeOriginalHireDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeOriginalHireDate.text.value;
					
					fin.empGeneralUi.actionPTOSetupReset();

					if (enteredText == '') {
						if (me.employeeHireDate.text.value != '') {
							me.employeeOriginalHireDate.setValue(me.employeeHireDate.text.value + '');
						}
						return;
					}

					var hireDate = new Date(me.employeeHireDate.text.value);
					var originalDate = new Date(me.employeeOriginalHireDate.text.value);
					
					if (me.employeeOriginalHireDate.text.value != '') {

						if (originalDate > hireDate)
							this.setInvalid("The Original Hire Date cannot be after the most recent hire date.");
					}
					
					me.setSeniorityDate();
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
					
					fin.empGeneralUi.actionPTOSetupReset();

					if (enteredText == '') {
						if(me.employeeHireDate.text.value != '')
							me.employeeEffectiveDate.setValue(me.employeeHireDate.text.value + '');
						return;
					}

					var hireDate = new Date(me.employeeHireDate.text.value);
					var effectiveDate = new Date(me.employeeEffectiveDate.text.value);
					
					if (me.employeeEffectiveDate.text.value != '') {

						if (effectiveDate < hireDate)
							this.setInvalid("The Effective Date cannot be before the most recent hire date.");
					}
					
					//see if employee is hired or terminated.
					if (me.payPeriodStartDate != "" && (me.isEmployeeNewhired() || me.isEmployeeRehired())) {
						if (me.compareDate(enteredText, me.payPeriodStartDate) == -1 || me.compareDate(enteredText, me.payPeriodEndDate) == 1) {
							this.setInvalid("Please enter valid date which is in range of current pay Period.");
							return false;
						}
					}
			});
				
			me.employeeTerminationDate = new ui.ctl.Input.Date({ 
				id: "EmployeeTerminationDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			}); 			
			me.employeeTerminationDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var message = "";
					var valid = true;
					var enteredText = me.employeeTerminationDate.text.value;
					
					if (enteredText == '' && me.employeeStatusType.text.value == 'Terminated') {
						valid = false;
						message = 'Please enter valid date.';
					}

					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false){
						valid = false;
						message = 'Please enter valid date.';
					}
					
					var hireDate = new Date(me.employeeHireDate.text.value);
					var terminationDate;
					var currentDate = new Date();
					
					if (me.employeeTerminationDate.text.value != '') {

						terminationDate = new Date(me.employeeTerminationDate.text.value);
						me.employeeEffectiveDate.text.value = me.employeeTerminationDate.text.value;

						if (terminationDate > currentDate) {
							valid = false;
							message = "Termination cannot be future dated.";
						}

						if (terminationDate <= hireDate) {
							valid = false;
							message = "Termination Date cannot be less than or equal to the Date of Currrent Hire.";
						}
					}

					if(!valid){
						this.setInvalid( message );
					}
			});					
			
			me.employeeSeniorityDate = new ui.ctl.Input.Date({ 
				id: "EmployeeSeniorityDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			});			
			me.employeeSeniorityDate.text.readOnly = true;
			$("#EmployeeSeniorityDateAction").removeClass("iiInputAction");
			
			me.employeeTerminationReason = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeTerminationReason", 
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(){ me.actionEmployeeTerminationChanged(); },
				required : false
		    });
			me.employeeTerminationReason.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var message = "";
					var valid = true;

					if (me.employeeTerminationReason.indexSelected > 0 && me.employeeStatusType.text.value != 'Terminated') {
						valid = false;
						message = 'Please unselect Termination Reason.';
					}
					else if(me.employeeTerminationReason.indexSelected <= 0 && me.employeeStatusType.text.value == 'Terminated') {
						valid = false;
						message = 'Please select valid Termination Reason.';
					}
					else
						return;

					if(!valid) {
						this.setInvalid( message );
					}
			});
				
			me.separationCode = new ui.ctl.Input.DropDown.Filtered({
				id : "SeparationCode",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function(){ me.employeeEffectiveDateChanged();},
				required : false
		    });
			me.separationCode.makeEnterTab()
				.setValidationMaster( me.validator );
//Job Information

			me.jobEffectiveDate = new ui.ctl.Input.Date({ 
				id: "JobEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
			}); 			
			me.jobEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.jobEffectiveDate.text.value;
					
					//fin.empGeneralUi.actionPTOSetupReset();

					if (enteredText == '') {
						if(me.employeeHireDate.text.value != '')
							me.jobEffectiveDate.setValue(me.employeeHireDate.text.value + '');
						return;
					}

					var hireDate = new Date(me.employeeHireDate.text.value);
					var jobEffectiveDate = new Date(me.jobEffectiveDate.text.value);
					
					if (me.jobEffectiveDate.text.value != '') {

						if (jobEffectiveDate < hireDate)
							this.setInvalid("The Compensation Effective Date cannot be before the most recent hire date.");
					}
			});
			
			me.jobChangeReason = new ui.ctl.Input.DropDown.Filtered({
				id : "JobChangeReason",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function(){ me.jobChangeReasonChanged(); },
				required : false
		    });
			me.jobChangeReason.makeEnterTab()
				.setValidationMaster( me.validator )
			
			me.employeeJobCode = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeJobCode",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function(){ me.actionEmployeeJobCodeChanged(); },
				required : false
		    });	
			me.employeeJobCode.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.employeeJobCode.text.value == '' && me.isPageLoaded == true)
						this.setInvalid("Please select the correct Job Code.");
			});
			
			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "DefaultHouseCodeJob",
				formatFunction: function(type) { return type.jobNumber + " - " + type.jobTitle; },
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
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");					
			});
			
			me.employeeUnion = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeUnion",
				formatFunction: function( type ) { return type.name; }, 
				required : false
		    });			
			me.employeeUnion.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if($("input[name='Union']:checked").val() == "true" && me.employeeUnion.indexSelected <= 0)
						this.setInvalid("Please select the correct Union.");
					else
						this.valid = true;							
			});

//Compensation 

			me.compensationEffectiveDate = new ui.ctl.Input.Date({ 
				id: "CompensationEffectiveDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy");}
			}); 			
			me.compensationEffectiveDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.compensationEffectiveDate.text.value;
					
					//fin.empGeneralUi.actionPTOSetupReset();

					if (enteredText == '') {
						if(me.employeeHireDate.text.value != '')
							me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value + '');
						return;
					}

					var hireDate = new Date(me.employeeHireDate.text.value);
					var compensationEffectiveDate = new Date(me.compensationEffectiveDate.text.value);
					
					if (me.compensationEffectiveDate.text.value != '') {

						if (compensationEffectiveDate < hireDate)
							this.setInvalid("The Compensation Effective Date cannot be before the most recent hire date.");
					}
			});
			
			me.employeeRateChangeReason = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeRateChangeReason", 
				formatFunction: function( type ) { return type.name; },
				required : false
		    });	
			me.employeeRateChangeReason.makeEnterTab()
				.setValidationMaster( me.validator );
				
			me.employeePayRate = new ui.ctl.Input.Text({
		        id: "EmployeePayRate" ,
				changeFunction: function(){ me.payRateChanged();},
		        maxLength : 8
		    });
			me.employeePayRate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.employeePayRate.getValue();
					
					if(enteredText == '') return;
					
					if (ui.cmn.text.validate.generic(enteredText, "^\\d+(\\.\\d{1,2})?$") == false) 
						this.setInvalid("Please enter numeric data.");
					else {
						fin.empGeneralUi.actionPerPayPeriodReset();
						
						if($("input[name='HourlyRate']:checked").val() == "true"){
							if(enteredText > 99.99){
								this.setInvalid("Please enter valid Pay Rate. Max value for Hourly is 99.99.");
							} 
						}
					}
			});																						
			
			me.employeeScheduledHours = new ui.ctl.Input.Text({
		        id: "EmployeeScheduledHours",
				changeFunction: function(){ me.scheduledHoursChanged(); },
		        maxLength : 3
		    });
			me.employeeScheduledHours.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeScheduledHours.getValue();
					var index = me.employeePayrollCompany.indexSelected;

					if(enteredText == '') return;
					
					if(ui.cmn.text.validate.generic(enteredText, "^\\d+$") == false) {
						this.setInvalid("Please enter valid Scheduled hours.");
						return;
					}
					
					if (me.houseCodePayrollCompanys.length > 0 && index >= 0) {
						if (me.houseCodePayrollCompanys[index].payFrequencyType == "Weekly") {
							if (enteredText > 40) {
								this.setInvalid("Schedule Hours should not be greater than 40 hours for the Weekly Pay Frequency.");
								return;
							}
						}
						else if (me.houseCodePayrollCompanys[index].payFrequencyType == "Bi-Weekly") {
							if (enteredText > 80) {
								this.setInvalid("Schedule Hours should not be greater than 80 hours for the Bi-Weekly Pay Frequency.");
								return;
							}
						}
					}	
					
					if(parseInt(enteredText) < (30 * fin.empGeneralUi.payPeriodWeeks)) {
						if (me.isPageLoaded == true) { //validation for multiple popup	
							alert('Warning: Individual will work less than 30 hours a week and therefore not eligible for full-time benefits. Minimum eligible hours:' + (30 * fin.empGeneralUi.payPeriodWeeks));
						}
					}
					else
					{
						fin.empGeneralUi.actionPerPayPeriodReset();
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
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
			});			
			
			me.employeeWorkShift = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeWorkShift",
				formatFunction: function( type ) { return type.name; }, 
				required : false
		    });
			me.employeeWorkShift.makeEnterTab()
				.setValidationMaster( me.validator )
			
			me.employeeBenefitsPercentage = new ui.ctl.Input.Text({
		        id: "EmployeeBenefitsPercentage" ,
		        maxLength : 2
		    });			
			me.employeeBenefitsPercentage.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
	
					var enteredText = me.employeeBenefitsPercentage.getValue();
					
					if(enteredText == '') return;
					
					if(ui.cmn.text.validate.generic(enteredText, "^\\d+$") == false) {
						this.setInvalid("Please enter numeric data.");
						return;
					}
					
					//validation for multiple popup	
					if((parseInt(me.employeeBenefitsPercentage.getValue()) != 60 && $("#pageLoading").is(':visible') == false) && me.isPageLoaded == true) {
						alert("Notice: The employee's benefit percentage no longer matches the corporate standard (60%).");
					}
			});						
			
			me.employeeAlternatePayRateA = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateA" ,
		        maxLength : 9
		    });				
			me.employeeAlternatePayRateA.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateA.getValue();
					
					if(enteredText == '') return;
					
					if(/^\d{1,6}(\.\d{1,2})?$/.test(enteredText) == false) {
						this.setInvalid("Please enter valid amount.");
					}
			});		
				
			me.employeeAlternatePayRateB = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateB" ,
		        maxLength : 9
		    });				
			me.employeeAlternatePayRateB.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateB.getValue();
					
					if(enteredText == '') return;

					if(/^\d{1,6}(\.\d{1,2})?$/.test(enteredText) == false) {
						this.setInvalid("Please enter valid amount.");
					}
			});	
					
			me.employeeAlternatePayRateC = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateC" ,
		        maxLength : 9
		    });				
			me.employeeAlternatePayRateC.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateC.getValue();
					
					if(enteredText == '') return;

					if(/^\d{1,6}(\.\d{1,2})?$/.test(enteredText) == false) {
						this.setInvalid("Please enter valid amount.");
					}
			});
							
			me.employeeAlternatePayRateD = new ui.ctl.Input.Text({
		        id: "EmployeeAlternatePayRateD" ,
		        maxLength : 9
		    });	
			me.employeeAlternatePayRateD.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.employeeAlternatePayRateD.getValue();
					
					if(enteredText == '') return;

					if(/^\d{1,6}(\.\d{1,2})?$/.test(enteredText) == false) {
						this.setInvalid("Please enter valid amount.");
					}
				});
						
			me.employeeDeviceGroup = new ui.ctl.Input.DropDown.Filtered({
				id : "EmployeeDeviceGroup",
				formatFunction: function( type ) { return type.name; }, 
				required : false
		    });	
			me.employeeDeviceGroup.makeEnterTab()
				.setValidationMaster( me.validator )
			
			me.ptoStartDate = new ui.ctl.Input.Date({ 
				id: "PTOStartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy");}
			}); 			
			me.ptoStartDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
					
					var enteredText = me.ptoStartDate.text.value;
					
					if(enteredText == '') return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
			});
				
			me.setTabIndexes();	
		},
		
		setTabIndexes: function() {
			var me = this;

			me.employeeBrief.text.tabIndex = 4;
			me.employeeSSN.text.tabIndex = 5;
			$("#houseCodeText").attr("tabindex", 7);
			me.employeePayrollCompany.text.tabIndex = 8;
			me.employeeNumber.text.tabIndex = 9;
			//$("#GenderYes").attr("tabindex", 10);
			//$("#GenderNo").attr("tabindex", 11);
			me.employeeBirthDate.text.tabIndex = 12;
			//$("#EmployeeMaritalStatusText").attr("tabindex", 13);
			me.employeeMaritalStatus.text.tabIndex = 13;
			me.employeeEthnicity.text.tabIndex = 14;
			me.employeeI9Status.text.tabIndex = 15;
			//$("#EmployeeActiveYes").attr("tabindex", 16);
			//$("#EmployeeActiveNo").attr("tabindex", 17);
			me.employeeVETSStatus.text.tabIndex = 18;
			me.employeeStatusType.text.tabIndex = 19;
			//$("#CrothallEmployeeYes").attr("tabindex", 20);
			//$("#CrothallEmployeeNo").attr("tabindex", 21);
			me.employeeHireDate.text.tabIndex = 22;
			me.employeeStatusCategoryType.text.tabIndex = 23;
			me.employeeOriginalHireDate.text.tabIndex = 24;
			me.employeeEffectiveDate.text.tabIndex = 25;
			me.employeeTerminationDate.text.tabIndex = 26;
			me.employeeSeniorityDate.text.tabIndex = 27;
			me.employeeTerminationReason.text.tabIndex = 28;
			me.separationCode.text.tabIndex = 29;
			
			me.jobEffectiveDate.text.tabIndex = 30;
			me.jobChangeReason.text.tabIndex = 31;
			me.employeeJobCode.text.tabIndex = 32;
			me.job.text.tabIndex = 33;
			//$("#UnionYes").attr("tabindex", 34);
			//$("#UnionNo").attr("tabindex", 35);
			
			//$("#ExemptYes").attr("tabindex", 36);
			//$("#ExemptNo").attr("tabindex", 37);
			me.employeeBackgroundCheckDate.text.tabIndex = 38;
			me.employeeUnion.text.tabIndex = 39;
			me.compensationEffectiveDate.text.tabIndex = 40;	
			me.employeeRateChangeReason.text.tabIndex = 41;	
			
			//$("#HourlyRateYes").attr("tabindex", 42);
			//$("#HourlyRateNo").attr("tabindex", 43);	
			//me.payFrequencyType.text.tabIndex = 44;
			me.employeePayRate.text.tabIndex = 45;
			me.employeeScheduledHours.text.tabIndex = 46;
			me.employeeReviewDate.text.tabIndex = 47;
			me.employeeWorkShift.text.tabIndex = 48;	
			me.employeeBenefitsPercentage.text.tabIndex = 49;	
			me.employeeAlternatePayRateA.text.tabIndex = 50;
			me.employeeAlternatePayRateB.text.tabIndex = 51;
			me.employeeAlternatePayRateC.text.tabIndex = 52;
			me.employeeAlternatePayRateD.text.tabIndex = 53;
			me.employeeDeviceGroup.text.tabIndex = 54;	
			//$("#PTOSetupAutomatic").attr("tabindex", 55);
			//$("#PTOSetupManual").attr("tabindex", 56);
			me.ptoStartDate.text.tabIndex = 57;
			
			
		},
		
		resizeControls: function() {
			var me = this;
			
			me.employeeBrief.resizeText();
			me.employeeSSN.resizeText();
			//me.houseCodeText.resizeText();
			me.employeePayrollCompany.resizeText();
			me.employeeNumber.resizeText();
			me.employeeBirthDate.resizeText();
			me.employeeMaritalStatus.resizeText();
			me.employeeEthnicity.resizeText();
			me.employeeI9Status.resizeText();
			me.employeeVETSStatus.resizeText();
			me.employeeStatusType.resizeText();
			me.employeeHireDate.resizeText();
			me.employeeStatusCategoryType.resizeText();
			me.employeeOriginalHireDate.resizeText();
			me.employeeEffectiveDate.resizeText();
			me.employeeTerminationDate.resizeText();
			me.employeeSeniorityDate.resizeText();
			me.employeeTerminationReason.resizeText();
			me.separationCode.resizeText();
			me.jobEffectiveDate.resizeText();
			me.jobChangeReason.resizeText();
			me.employeeJobCode.resizeText();
			me.job.resizeText();
			me.employeeBackgroundCheckDate.resizeText();
			me.employeeUnion.resizeText();
			me.compensationEffectiveDate.resizeText();
			me.employeeRateChangeReason.resizeText();
			me.employeePayRate.resizeText();
			me.employeeScheduledHours.resizeText();
			me.employeeReviewDate.resizeText();
			me.employeeWorkShift.resizeText();
			me.employeeBenefitsPercentage.resizeText();
			me.employeeAlternatePayRateA.resizeText();
			me.employeeAlternatePayRateB.resizeText();
			me.employeeAlternatePayRateC.resizeText();
			me.employeeAlternatePayRateD.resizeText();
			me.employeeDeviceGroup.resizeText();
			me.ptoStartDate.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;		
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.emp.HirNode,
				itemConstructorArgs: fin.emp.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.statusTypes = [];
			me.statusTypeStore = me.cache.register({
				storeId: "employeeGeneralMasters",
				itemConstructor: fin.emp.StatusType,
				itemConstructorArgs: fin.emp.statusTypeArgs,
				injectionArray: me.statusTypes	
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.emp.HouseCode,
				itemConstructorArgs: fin.emp.houseCodeArgs,
				injectionArray: me.houseCodes
			});			
		
			me.houseCodePayrollCompanys = [];
			me.houseCodePayrollCompanyStore = me.cache.register({
				storeId: "houseCodePayrollCompanys",
				itemConstructor: fin.emp.HouseCodePayrollCompany,
				itemConstructorArgs: fin.emp.houseCodePayrollCompanyArgs,
				injectionArray: me.houseCodePayrollCompanys
			});			
		
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
			
			me.employeePersonals = [];
			me.employeePersonalStore = me.cache.register({ 
				storeId: "employeePersonals",
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
			
			me.employeeValidations = [];
			me.employeeValidationStore = me.cache.register({
				storeId: "employeeValidations",
				itemConstructor: fin.emp.EmployeeValidation,
				itemConstructorArgs: fin.emp.employeeValidationArgs,
				injectionArray: me.employeeValidations	
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
			
			me.empEmployeeNumberValidations = [];
			me.empEmployeeNumberValidationStore = me.cache.register({
				storeId: "empEmployeeNumberValidations",
				itemConstructor: fin.emp.EmpEmployeeNumberValidation,
				itemConstructorArgs: fin.emp.empEmployeeNumberValidationArgs,
				injectionArray: me.empEmployeeNumberValidations
			});
			
			me.basicLifeIndicatorTypes = [];
			me.basicLifeIndicatorTypeStore = me.cache.register({
				storeId: "basicLifeIndicatorTypes",
				itemConstructor: fin.emp.BasicLifeIndicatorType,
				itemConstructorArgs: fin.emp.basicLifeIndicatorTypeArgs,
				injectionArray: me.basicLifeIndicatorTypes
			});
		},
		
		fetchData: function() {
			var me = this;			
			
			me.employeeStatusType.fetchingData();
			me.employeeStatusCategoryType.fetchingData();
			me.employeeWorkShift.fetchingData();
			me.employeeJobCode.fetchingData();
			me.employeeDeviceGroup.fetchingData();
			me.employeeRateChangeReason.fetchingData();
			me.employeeTerminationReason.fetchingData();
			me.employeeEthnicity.fetchingData();
			me.employeeUnion.fetchingData();
			me.employeeI9Status.fetchingData();
			me.employeeVETSStatus.fetchingData();
			me.employeeMaritalStatus.fetchingData();
			me.jobChangeReason.fetchingData();
			
			me.statusTypeStore.fetch("userId:[user],personId:" + me.personId + ",", me.statusTypesLoaded, me);
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
			else
				me.employeeSeniorityDate.setValue(me.employeeOriginalHireDate.text.value);
		},

		isEmployeeNewhired: function(){
			var me = this;
			
			return (me.jobChangeReason.text.value.toLowerCase() == 'new hire'
				&& me.employeeGeneralId == 0)
		},

		isEmployeeRehired: function(){
			var me = this;
			
			return (me.jobChangeReason.text.value.toLowerCase() == 'rehire')
		},
		/*	
		isEmployeeTerminated: function(){
			var me = this;
			
			return ((me.employeeStatusType.text.value.toLowerCase() == 'terminated'
				|| me.employeeStatusType.text.value.toLowerCase() == 'severance')
				&& me.jobChangeReason.indexSelected != -1)
		},
		*/
		setDropListSelectedValueById: function(){
			var args = ii.args(arguments, {
				listType: {type: String},
				id: {type: Number}
			});
			var me = this;
			me.setDropListSelectedValue(args.listType, args.id, null);
		},
		
		setDropListSelectedValueByTitle: function(){
			var args = ii.args(arguments, {
				listType: {type: String},
				title: {type: String}
			});
			var me = this;
			me.setDropListSelectedValue(args.listType, null, args.title);
		},
		
		setDropListSelectedValue: function(){
			var args = ii.args(arguments, {
				listType: {type: String},
				id: {type: Number, required: false},
				title: {type: String, required: false}
			});
			
			var me = this;
			var index = 0;
			
			if (args.listType == "rateChange") {
				if(args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.rateChangeReasons);
				if(args.title) index = me.findIndexByTitle(args.title, me.rateChangeReasons);
				me.employeeRateChangeReason.select(index, me.employeeRateChangeReason.focused);
			}
			
			if (args.listType == "jobStartChange") {
				if(args.id) index = ii.ajax.util.findIndexById(args.id.toString(), me.jobStartReasonTypes);
				if(args.title) index = me.findIndexByTitle(args.title, me.jobStartReasonTypes);
				me.jobChangeReason.select(index, me.jobChangeReason.focused);
			}
			
			//can move other DropLists selection here..
		},
		
		compareDate: function(){
			var args = ii.args(arguments, {
				date2Compare : {type: String},
				date2CompareWith : {type: String, required: false}
			});
			//user this function in other place in this code.
			var me = this;
			
			if(!args.date2CompareWith)
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
		
		currentDate: function() {
			var currentTime = new Date();
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
		
		statusTypesLoaded: function(me, activeId) {
			
			me.employeeStatusType.reset();
			me.employeeStatusType.setData(me.statusTypes);

			me.employeeStatusCategoryType.reset();
			me.employeeStatusCategoryType.setData(me.statusCategoryTypes);

			me.employeeWorkShift.reset();
			me.workShifts.unshift(new fin.emp.WorkShift({ id: 0, number: 0, name: "None" }));
			me.employeeWorkShift.setData(me.workShifts);

			me.employeeJobCode.reset();
			me.jobCodeTypes.unshift(new fin.emp.JobCodeType({ id: 0, number: 0, name: "None" }));
			me.employeeJobCode.setData(me.jobCodeTypes);
			
			me.employeeDeviceGroup.reset();
			me.deviceGroupTypes.unshift(new fin.emp.DeviceGroupType({ id: 0, number: 0, name: "None" }));
			me.employeeDeviceGroup.setData(me.deviceGroupTypes);

			me.employeeRateChangeReason.reset();
			me.rateChangeReasons.unshift(new fin.emp.RateChangeReasonType({ id: 0, number: 0, name: "None" }));
			me.employeeRateChangeReason.setData(me.rateChangeReasons);

			me.employeeTerminationReason.reset();
			me.terminationReasons.unshift(new fin.emp.TerminationReasonType({ id: 0, number: 0, name: "None" }));
			me.employeeTerminationReason.setData(me.terminationReasons);

			me.employeeEthnicity.reset();
			me.ethnicityTypes.unshift(new fin.emp.EthnicityType({id:0, number: 0, name: "None"}));
			me.employeeEthnicity.setData(me.ethnicityTypes);

			me.employeeUnion.reset();
			me.unionTypes.unshift(new fin.emp.UnionType({ id: 0, number: 0, name: "None" }));
			me.employeeUnion.setData(me.unionTypes);
			
			me.employeeI9Status.reset();
			me.i9Types.unshift(new fin.emp.I9Type({ id: 0, number: 0, name: "None" }));
			me.employeeI9Status.setData(me.i9Types);
			
			me.employeeVETSStatus.reset();
			me.vetTypes.unshift(new fin.emp.VetType({ id: 0, number: 0, name: "None" }));
			me.employeeVETSStatus.setData(me.vetTypes);
			
			me.employeeMaritalStatus.reset();
			me.maritalStatusTypes.unshift(new fin.emp.MaritalStatusType({id:0, number: 0, name: "None"}));
			me.employeeMaritalStatus.setData(me.maritalStatusTypes);
			
			me.jobChangeReason.reset();
			me.jobChangeReason.setData(me.jobStartReasonTypes);
			
			ii.trace( "Employee General: Type Tables Loaded.", ii.traceTypes.information, "Information");
			
			me.payFrequencyTypeStore.fetch("userId:[user]", me.payFrequencyTypesLoaded, me);
			
			me.resizeControls();					
		},
		
		payFrequencyTypesLoaded: function(me, activeId) {
			
			ii.trace( "Employee General: PayFrequencyTypes Loaded.", ii.traceTypes.information, "Information");
			
			me.separationCodeStore.fetch("userId:[user],terminationType:0,", me.separationCodesLoaded, me);						
		},
		
		separationCodesLoaded: function(me, activeId) {			
			
			me.separationCode.reset();
			me.separationCodes.unshift(new fin.emp.SeparationCode({ id: 0, number: 0, name: "None" }));
			me.separationCode.setData(me.separationCodes);	
					
			ii.trace( "Employee General: Separation Codes Loaded.", ii.traceTypes.information, "Information");
			
			if (me.personId != "0"){
				me.employeeGeneralsLoaded(me, 0);
			}
			else {
				if(me.sgBriefShow && !me.sgBriefReadOnly) me.employeeBrief.text.focus();
				me.validator.reset();
            	$("#pageLoading").hide();
			}
		},

		employeeGeneralsLoaded: function(me, activeId) {
			var index = 0;
			me.status = "loading";
			
			if (me.employeeGenerals.length > 0) {
				me.employeeGeneralId = me.employeeGenerals[0].id;
				me.personId = me.employeeGenerals[0].personId;
				ii.trace("Employee General: Loading.", ii.traceTypes.information, "Information");				
				
				//Employee General Section - Start
				me.employeeBrief.setValue(me.employeeGenerals[0].brief);

				me.employeeSSN.setValue(me.employeeGenerals[0].ssn);
				me.setControlState("EmployeeSSN", me.sgSSNReadOnly, me.sgSSNShow);
				
				me.houseCodeId = me.employeeGenerals[0].hcmHouseCode;
				me.houseCodeStore.fetch("userId:[user],hcmHouseCodeId:" + me.houseCodeId + ",", me.houseCodesLoaded, me);
				me.employeePayrollCompany.fetchingData();
				me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.employeeGenerals[0].hcmHouseCode + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
				
				me.employeeNumber.setValue(me.employeeGenerals[0].employeeNumber);

				if(me.employeeGenerals[0].genderType == 1)
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
				
				if(me.employeeGenerals[0].active)
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
				
				if (me.employeeGenerals[0].terminationReason > 0) {
					me.separationCodeStore.fetch("userId:[user],terminationType:" + me.employeeGenerals[0].terminationReason.toString() + ",", me.terminationReasonChangedLoaded, me);
				}
								
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
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId + ",module:Employee", me.houseCodeJobsLoaded, me);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].unionType.toString(), me.unionTypes);
				if (index != undefined) 
					me.employeeUnion.select(index, me.employeeUnion.focused);
				
				if(me.employeeGenerals[0].exempt)
					$('#ExemptYes').attr('checked', true);
				else
					$('#ExemptNo').attr('checked', true);
				
				if (me.employeeGenerals[0].backGroundCheckDate == "") 
					me.employeeBackgroundCheckDate.setValue("");
				else 
					me.employeeBackgroundCheckDate.setValue(me.employeeGenerals[0].backGroundCheckDate);
	
				if(me.employeeGenerals[0].unionEmployee)			
					$('#UnionYes').attr('checked', true);
				else
					$('#UnionNo').attr('checked', true);
				
				if (me.employeeGenerals[0].unionEmployee) 
					$('#UnionYes').click();
				
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
				
				if (me.employeeGenerals[0].hourly) {
					$('#HourlyRateYes').attr('checked', true);
					$('#HourlyRateYes').click();
				}
				else {
					$('#HourlyRateNo').attr('checked', true);
					$('#HourlyRateNo').click();
				}
				
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
				
				me.employeeBenefitsPercentage.setValue(me.employeeGenerals[0].benefitsPercentage);
				
				me.employeeAlternatePayRateA.setValue(me.employeeGenerals[0].alternatePayRateA);
				me.employeeAlternatePayRateB.setValue(me.employeeGenerals[0].alternatePayRateB);
				me.employeeAlternatePayRateC.setValue(me.employeeGenerals[0].alternatePayRateC);
				me.employeeAlternatePayRateD.setValue(me.employeeGenerals[0].alternatePayRateD);
				
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].deviceGroup.toString(), me.deviceGroupTypes)
				if (index != undefined) 
					me.employeeDeviceGroup.select(index, me.employeeDeviceGroup.focused);
				
				$("#EmployeeRateChangeDate").text(me.employeeGenerals[0].rateChangeDate);
				
				//Compensation Section - End
				
				//PTO Section - Start
				if(me.employeeGenerals[0].ptoAccruedHourEntryAutomatic)
					$('#PTOSetupAutomatic').attr('checked', true);
				else
					$('#PTOSetupManual').attr('checked', true);
				
				if (me.employeeGenerals[0].ptoStartDate == "") {
					me.ptoStartDate.setValue("");
				}
				else {
					me.ptoStartDate.setValue(me.employeeGenerals[0].ptoStartDate);
				}
				
				//PTO Section - End
				
				me.validateEmployeeDetails();	
				
				me.hireDateAccessSetup();	
				me.effectiveDateAccessSetup();
			}					
			
			me.actionPTOSetupReset();
			
			if(me.sgBriefShow && !me.sgBriefReadOnly) me.employeeBrief.text.focus();			
			me.isPageLoaded = true; //validation for multiple popup	

			if (me.employeeGeneralId <= 0) {
				
				me.actionNewEmployeeGeneral();
				
				me.actionEmployeeStatusChanged(); //also get corresponding Status Category.
				
				me.setDropListSelectedValueByTitle("jobStartChange", "new hire");
				me.setDropListSelectedValueByTitle("rateChange", "new hire");
				$("#JobChangeReasonText").attr('disabled', true);
				$("#JobChangeReasonAction").removeClass("iiInputAction");					
			}
			else{
				$("#JobChangeReasonText").attr('disabled', false);
				$("#JobChangeReasonAction").addClass("iiInputAction");
			}

			me.status = "";	
		},
		
		houseCodeChanged: function() {
			var me = this;
			
			if(me.employeeGeneralId > 0){
				if(me.employeeGenerals[0].hcmHouseCode != me.houseCodeId){
					me.houseCodeChangedFlag = true;
					ii.trace("Employee General: HouseCode Changed.", ii.traceTypes.information, "Information");
				}
				else{
					me.houseCodeChangedFlag = false;
					ii.trace("Employee General: HouseCode Reset.", ii.traceTypes.information, "Information");
				}
			}
			else{
				me.houseCodeChangedFlag = false;
			}	
				
			me.hirNode = me.houseCodes[0].hirNode;	
			
			me.job.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId + ",module:Employee", me.houseCodeJobsLoaded, me);
			
			me.employeePayrollCompany.fetchingData();
			me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
			
			me.employeeEffectiveDate.setValue(me.currentDate());
			me.jobEffectiveDate.setValue(me.currentDate());
			//me.compensationEffectiveDate.setValue(me.currentDate());
		},
		
		houseCodeJobsLoaded: function(me, activeId) {

			me.houseCodeJobs.unshift(new fin.emp.HouseCodeJob({ id: 0, jobNumber: "0", jobTitle: "None" }));
			me.job.reset();
			me.job.setData(me.houseCodeJobs);
			
			if (me.employeeGenerals.length > 0) {
				var index = ii.ajax.util.findIndexById(me.employeeGenerals[0].houseCodeJob.toString(), me.houseCodeJobs)
				if (index != undefined) 
					me.job.select(index, me.job.focused);
			}	
			
			me.jobStartReasonChange();
		},
		
		payRateChanged: function(){
			var me = this;
						
			if(me.employeeGenerals.length > 0){
				if(me.employeeGenerals[0].payRate != parseInt(me.employeePayRate.getValue()))
					me.payRateChangeReasonsUpdate("payRateChange");
				else
					me.payRateChangeReasonsUpdate("");
			}
		},
		
		payRateTypeChanged: function(){
			var me = this;

			if (me.employeeGenerals.length == 0 || me.employeePayrollCompany.indexSelected < 0) return;
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly &&
			me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
			
				if(me.employeeGenerals[0].hourly && $("input[name='HourlyRate']:checked").val())
					//changed from Hourly to Salaried
					me.payRateChangeReasonsUpdate("payRateTypeChange");
				}
		},
		
		payFrequencyChanged: function(){
			var me = this;
			
			if (me.employeePayrollCompany.indexSelected >= 0) {
				if (me.employeeGeneralId > 0) {
					me.compensationEffectiveDate.setValue(me.currentDate());
				}else{
					me.compensationEffectiveDate.setValue(me.employeeHireDate.text.value);
				}
			
				//me.employeeEffectiveDate.setValue(me.currentDate());	
				me.validateAttribute = 'payPeriod'; //validation for multiple popup	
				me.validateEmployeeDetails(); //introduced to get PayPeriod for selected Company payFrequency.			
			}			
			
			if (me.employeeGenerals.length == 0 || me.employeePayrollCompany.indexSelected < 0) return;
						
			var index = me.findIndexByTitle(me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType, me.payFrequencyTypes);
			
			if(parseInt(me.employeeGenerals[0].frequencyType) != me.payFrequencyTypes[index].id)
				me.payRateChangeReasonsUpdate("payFrequencyChange");
			else
				me.payRateChangeReasonsUpdate("");	
						
			
		},
		
		scheduledHoursChanged: function(){
			var me = this;
						
			if(me.employeeGenerals.length > 0){
				if(me.employeeGenerals[0].scheduledHours > parseInt(me.employeeScheduledHours.getValue()))
					me.payRateChangeReasonsUpdate("scheduledHoursDecrease");
				else if(me.employeeGenerals[0].scheduledHours < parseInt(me.employeeScheduledHours.getValue()))
					me.payRateChangeReasonsUpdate("scheduledHoursIncrease");
				else
					me.payRateChangeReasonsUpdate("");
			}
		},
		
		actionEmployeeJobCodeChanged: function(){
			var me = this;
			
			if(me.employeeGeneralId > 0){ //if not a NEW Employee
				
				if (me.employeeGenerals[0].jobCode != me.jobCodeTypes[me.employeeJobCode.indexSelected].id) {
					me.houseCodeJobChanged = true;
					me.jobStartReasonChange();
					ii.trace("Employee General: Job Code Changed.", ii.traceTypes.information, "Information");
				}
				else {
					me.houseCodeJobChanged = false;
					ii.trace("Employee General: Job Code Reset.", ii.traceTypes.information, "Information");
				}
			}
		},
		
		findIndexByTitle: function ii_ajax_util_findIndexByTitle(){
			var args = ii.args(arguments, {
				title: {type: String},	// The id to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});
		
			var title = args.title;
			var data = args.data;
			
			for(var index = 0; index < data.length; index++ ){
				if(data[index].name.toLowerCase() == title.toLowerCase()){
					return index; 
				}
			}
			
			return null;
		},
		
		//TODO tobe removed
		findIdByTitle: function ii_ajax_util_findIdByTitle(){
			var args = ii.args(arguments, {
				title: {type: String},		// The id to use to find the object.
				data: {type: [Object]}	// The data array to be searched.
			});
		
			var title = args.title;
			var data = args.data;
			
			for(var index = 0; index < data.length; index++ ){
				if(data[index].name == title){
					return data[index].id;
				}
			}
			return null;
		},
		
		jobStartReasonChange: function(){
			var args = ii.args(arguments, {
				reset: {type: Boolean, required:false}
			});
			
			var me = this;
			
			if (me.houseCodeChangedFlag == true && me.houseCodeJobChanged == true) {
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:HousecodeJobcodeChange", me.jobStartReasonsLoaded, me);
			}
			else if(me.houseCodeChangedFlag == true){
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:HousecodeChange", me.jobStartReasonsLoaded, me);				
			}
			else if(me.houseCodeJobChanged == true){
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],changeReason:JobcodeChange", me.jobStartReasonsLoaded, me);				
			}
			else if(args.reset){
				me.jobChangeReason.fetchingData();
				me.jobStartReasonTypeStore.fetch("userId:[user],", me.jobStartReasonsLoaded, me);				
			}
			else{
				me.jobStartReasonsLoaded(me, 0);
			}
		},
		
		jobStartReasonsLoaded: function(me, activeId){
			me.jobChangeReason.reset();
			me.jobChangeReason.setData(me.jobStartReasonTypes);

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
					//$('#EmployeeActiveNo').attr('checked', false);						
				}
				
				me.hireDateAccessSetup();				
		},
		
		hireDateAccessSetup: function(){
			var me = this;			
	
			if (me.jobChangeReason.text.value == 'New hire'){
				$("#EmployeeHireDateAction").show();
				$("#EmployeeHireDateText").attr('disabled', false);				
			}			
			else if (me.jobChangeReason.text.value == 'Rehire' && me.employeeGeneralId > 0){
				//2 = FMLA_LOA, 5 = Severance, 6 = Terminated
				if (me.employeeGenerals[0].statusType == 2 || me.employeeGenerals[0].statusType == 5 || me.employeeGenerals[0].statusType == 6) { 
					
					$("#EmployeeHireDateText").attr('disabled', false);
					$("#EmployeeHireDateAction").show();						
				}
				else {					
					$("#EmployeeHireDateText").attr('disabled', true);	
					$("#EmployeeHireDateAction").hide();					
				}			
			}			
			else{				
				$("#EmployeeHireDateText").attr('disabled', true);	
				$("#EmployeeHireDateAction").hide();				
			}
			
			me.employeeHireDate.resizeText();	
		},
		
		effectiveDateAccessSetup: function(){
			var me = this;

			if ((me.employeeGeneralAreaChanged == true && me.employeeGeneralId > 0) 
				|| me.employeeGeneralId == 0) {
				$("#EmployeeEffectiveDateText").attr('disabled', false);
				$("#EmployeeEffectiveDateAction").show();
				me.employeeGeneralAreaChanged = false;
			}
			else {
				$("#EmployeeEffectiveDateAction").hide();
				$("#EmployeeEffectiveDateText").attr('disabled', true);
			}
			
			me.employeeEffectiveDate.resizeText();			
		},
		
		houseCodePayrollCompanysLoaded: function(me, activeId) {
			var index = 0;
			me.employeePayrollCompany.reset();
			me.employeePayrollCompany.setData(me.houseCodePayrollCompanys);
			
			ii.trace( "Employee General: Payroll Company Loaded.", ii.traceTypes.information, "Information");	
			
			if (me.employeeGenerals.length > 0) {
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].payrollCompany.toString(), me.houseCodePayrollCompanys)
				if (index != undefined) 
					me.employeePayrollCompany.select(index, me.employeePayrollCompany.focused);
			}
			
			me.actionPerPayPeriodReset();
		},
		
		actionEmployeeStatusChanged: function() {
			var me = this;			
			
			if(me.employeeStatusType.indexSelected < 0) return;
			
			me.setSeniorityDate();
			//me.employeeEffectiveDate.setValue(me.currentDate());
			
			if (me.employeeActiveChanged == true) {				
				me.employeeStatusCategoryType.fetchingData();
				me.statusCategoryTypeStore.fetch("userId:[user],statusTypeId:" + me.newStatusTypes[me.employeeStatusType.indexSelected].id + ",", me.employeeStatusCategorysLoaded, me);
			}
			else
			{
				me.separationCode.select(0, me.separationCode.focused); 
				me.employeeStatusCategoryType.fetchingData();
				me.statusCategoryTypeStore.fetch("userId:[user],statusTypeId:" + me.statusTypes[me.employeeStatusType.indexSelected].id + ",", me.employeeStatusCategorysLoaded, me);
			}
			
			if (me.statusTypes[me.employeeStatusType.indexSelected].name == 'Terminated') {
				//$('#EmployeeActiveYes').attr('checked', false);
				$('#EmployeeActiveNo').attr('checked', true);

				//Warn ..if User try to Terminate an Employee who was hired in same Pay Period..
				if(me.compareDate(me.employeeHireDate.text.value, me.payPeriodStartDate) >= 0 
					&& me.compareDate(me.employeeHireDate.text.value, me.payPeriodEndDate) <= 0
					&& me.employeeGeneralId > 0
					&& me.isPageLoaded)  //validation for multiple popup	
					{
					alert('Employee was Hired in the same Pay Period. Please verify before Termination.');
				}
			}
			else {
				$('#EmployeeActiveYes').attr('checked', true);
				//$('#EmployeeActiveNo').attr('checked', false);
				
				if(me.employeeGeneralId <= 0) return;
				
				//if status is changed from FMLA_LOA/Terminated to Active
				//clear HireDate and prompt user to assign new date within current period.
				if (me.employeeStatusType.text.value.toLowerCase() == 'active'
					&& (me.employeeGenerals[0].statusType == "2" || me.employeeGenerals[0].statusType == "6")) {

					me.employeeHireDate.setValue("");
					me.jobEffectiveDate.setValue("");
					me.compensationEffectiveDate.setValue(""); 
					
					//Warn ..if User try to Rehire an Employee who was Terminated in same Pay Period..
					if (me.employeeGenerals[0].terminationDate.toString() != "" &&
						me.compareDate(me.employeeGenerals[0].terminationDate.toString(), me.payPeriodStartDate) >= 0 &&
						me.compareDate(me.employeeGenerals[0].terminationDate.toString(), me.payPeriodEndDate) <= 0
						&& me.isPageLoaded) {
						alert('Employee was Terminated in the same Pay Period. Please verify before Rehire.');
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
				index = ii.ajax.util.findIndexById(me.employeeGenerals[0].statusCategoryType.toString(), me.statusCategoryTypes)
				if (index != undefined) 
					me.employeeStatusCategoryType.select(index, me.employeeStatusCategoryType.focused);
			}
		},
		
		actionEmployeeTerminationChanged: function() {
			var me =  this;
			
			if (me.employeeTerminationReason.indexSelected < 0) return;
			
			me.separationCode.fetchingData();
			//me.employeeEffectiveDate.setValue(me.currentDate());
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
		
		payRateChangeReasonsUpdate: function(){
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
		
		rateChangeReasonsLoaded: function(me, activeId){ //TODO read this from DB
			
			me.employeeRateChangeReason.reset();
			me.employeeRateChangeReason.setData(me.rateChangeReasons);
		},
		
		actionHoursReset: function() {
			var me = this;
			var hours = 40;
			
			hours = me.payPeriodWeeks * 40;
			me.employeeScheduledHours.setValue(hours + "");
			me.scheduledHoursValue = hours;
		},
		
		employeeActiveChangedNo: function(){
			var me = this; 
			
			me.newStatusTypes = [];
			
			if (me.statusTypes.length > 0) {  //TODO read this from DB
				
				me.newStatusTypes.unshift(new fin.emp.StatusType({
					id: me.findIdByTitle("Terminated", me.statusTypes),
					number: me.findIdByTitle("Terminated", me.statusTypes),
					name: "Terminated"
				}));
				/*
				me.newStatusTypes.unshift(new fin.emp.StatusType({
					id: me.findIdByTitle("Severance", me.statusTypes),
					number: me.findIdByTitle("Severance", me.statusTypes),
					name: "Severance"
				}));
				*/
				me.employeeStatusType.reset();
				me.employeeStatusType.setData(me.newStatusTypes);
				me.employeeStatusType.select(0, me.employeeStatusType.focused);
				
				me.employeeStatusCategoryType.fetchingData();		
				me.statusCategoryTypeStore.fetch("userId:[user],statusTypeId:" + me.newStatusTypes[me.employeeStatusType.indexSelected].id + ",", me.employeeStatusCategorysLoaded, me);
			}
			
		},
		
		actionPerPayPeriodReset: function(){
			var me = this;
			var dollarPerPayPeriod = 0.00;
			var numberOfSalariesPerYear = 0;
			me.employeeRateChangeReason.setData(me.rateChangeReasons);
			
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
			else 
				if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType == 'Bi-Weekly') {
					numberOfSalariesPerYear = 26;
					me.payPeriodWeeks = 2;
					index = me.findIndexByTitle("Bi-Weekly", me.payFrequencyTypes);
					$("#PayFrequencyType").text(me.payFrequencyTypes[index].name);
					me.payFrequencyType = me.payFrequencyTypes[index].id;					
				}	
			
				
			$("#PayFrequencyType").text(me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].payFrequencyType);	
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly &&
			me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary == false) {
				$('#HourlyRateYes').attr('checked', true);
				$("#PayRateLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Hourly Pay Rate");
				me.payRateHourlySalary = "";
				//alert('Selected Payroll Company is Hourly.');		
				//$("#EmployeeNumberText").attr('readonly', true);		
			}
			
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly == false &&
			me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {
				$('#HourlyRateNo').attr('checked', true);
				$("#PayRateLabel").html("<span class='requiredFieldIndicator'>&#149;</span>Annual Salary");
				//alert('Selected Payroll Company is Salaried.');
				
			}
			
			//if ($("#HourlyRateYes").attr('checked') == true) {
			if($("input[name='HourlyRate']:checked").val() == "true"){
				dollarPerPayPeriod = (parseFloat('0' + me.employeePayRate.getValue()) * parseFloat('0' + me.employeeScheduledHours.getValue()));
			}
			else 
				dollarPerPayPeriod = parseFloat(me.employeePayRate.getValue()) / numberOfSalariesPerYear;
			
			$("#DollarPerPayPeriodLabel").html("$" + dollarPerPayPeriod.toFixed(2));			
			
		},
		
		employeeNumberChange: function(){
			var me = this;
						
			if (me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].hourly == false &&
			me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected].salary) {								
				//Employee Number change - Start with 6.
				
				salNumber = $("#EmployeeNumberText").val();
				if (salNumber.substring(0, 1) == 6) return;
				me.employeeNewNumber = 6 + salNumber.substring(1, 10);				
				me.empEmployeeNumberValidationStore.fetch("userId:[user],employeeNumber:" + me.employeeNewNumber + ",", me.employeeNewNumberLoaded, me);										
			}
			
		},
		
		employeeNewNumberLoaded: function(me, activeId) {

			if (me.empEmployeeNumberValidations.length > 0) {
				me.employeeNumber.setValue(me.employeeNewNumber);
				alert(me.employeeNewNumber + ' Employee Number already exists.');
			}
			else {
				me.employeeNumber.setValue(me.employeeNewNumber);
				//$("#EmployeeNumberText").attr('readonly', false);
				//alert(employeeNewSalaryNumebr);
				me.employeeEffectiveDateChanged();
			}			
		},
		
		actionPTOSetupReset: function() {
			var args = ii.args(arguments, {
				buttonId: {type: String, required: false}
			});
			
			var me = this;
			
			fin.empGeneralUi.validateAttribute = 'PTOSetup'; //validation for multiple popup		
			if ($("input[name='Union']:checked").val() == "true" &&
					$("input[name='HourlyRate']:checked").val() == "true") {

				$("#PTOSetupManual").attr('checked', true);
				$("#PTOSetupManual").attr('disabled', true);
				$("#PTOSetupAutomatic").attr('disabled', true);
			}
			else {
				$("#PTOSetupManual").attr('disabled', false);
				$("#PTOSetupAutomatic").attr('disabled', false);
			}

			if ($("input[name='PTOSetup']:checked").val() == "true") {
				
				$("#PTOStartDate").show();
				$("#PTOStartDateLabel").show();
				me.setControlState("PTOStartDate", me.spStartDateReadOnly, me.spStartDateShow);
				
				if(me.employeeSeniorityDate.text.value != "")
					me.ptoStartDate.setValue(me.employeeSeniorityDate.text.value);
				else
					if(me.status != "loading")
						me.validateEmployeeDetails();
			}
			else {
				$("#PTOStartDate").hide();
				$("#PTOStartDateLabel").hide();
			}
		},

		validateEmployeeDetails: function(){
			var me = this;
			
			me.employeeValidationStore.fetch("userId:[user]" 
				+ ",hireDate:" + me.employeeHireDate.text.value 
				+ ",employeeId:" + me.employeeGeneralId
				+ ",ssn:" + me.employeeSSN.getValue().replace(/-/g,'')
				+ ",payFrequencyTypeId:" + me.payFrequencyType
				+ "," 
				, me.validationsLoaded, me);
		},

		validationsLoaded: function(me, activeId) {	

			if (me.employeeValidations.length <= 0) return;
			
			me.ptoStartDate.setValue(me.employeeValidations[0].ptoStartDate + '');
			
			if (me.employeeValidations[0].validSSN == false && me.validateAttribute == 'SSN') //validation for multiple popup	
				alert("Employee with Social Security Number: " + me.employeeSSN.getValue() + " already exists in House Code " + me.employeeValidations[0].ssnHouseCode + "; contact payroll if assistance is needed.");
			else {
				if (me.ssnLookUp) 
					alert("SSN " + me.employeeSSN.getValue() + " does not exist in any other house code.");
			}
			
			me.ssnLookUp = false;
			me.payPeriodStartDate = me.employeeValidations[0].payPeriodStartDate;
			me.payPeriodEndDate = me.employeeValidations[0].payPeriodEndDate;
			me.payRollEntries = me.employeeValidations[0].dailyPayrollEntries;
		},
		
		employeeEffectiveDateChanged: function(){
			var me = this;
			me.employeeGeneralAreaChanged = false;
			
			if(me.employeeStatusCategoryType.indexSelected >= 0 
				|| me.separationCode.indexSelected >= 0
				)
			{					
				me.employeeEffectiveDate.setValue(me.currentDate());				
				me.employeeGeneralAreaChanged = true;
			}
			
			if(me.employeeGenerals.length > 0){
				if(me.employeeHireDate.text.value != me.employeeGenerals[0].hireDate
					||me.employeeSSN.text.value != me.employeeGenerals[0].ssn
					||me.employeeBrief.text.value != me.employeeGenerals[0].brief
					||me.employeeNumber.text.value != me.employeeGenerals[0].employeeNumebr
					){
					me.employeeEffectiveDate.setValue(me.currentDate());
					me.employeeGeneralAreaChanged = true;
				}				
			}
			
			me.effectiveDateAccessSetup();		
		},
		
		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}	// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if( event.ctrlKey ) {
				
				switch( event.keyCode ) {
					case 83: // Ctrl+S
						if (window.frames.frameElement.id == "iFrameEsmEmployee")
							parent.esm.pplMasterUi.actionSaveItem();
						else
							parent.fin.empMasterUi.actionSaveItem();
						
						processed = true;
						break;

					case 78: //Ctrl+N 
						if (window.frames.frameElement.id == "iFrameEsmEmployee")
							parent.esm.pplMasterUi.actionNewItem();
						else
							parent.fin.empMasterUi.actionNewItem();
							
						processed = true;
						break;
						
					case 85: //Ctrl+U
						if (window.frames.frameElement.id == "iFrameEsmEmployee")
							parent.esm.pplMasterUi.actionUndoItem();
						else
							parent.fin.empMasterUi.actionUndoItem();

						processed = true;
						break;
				}
			}
			
			if( processed ) {
				return false;
			}
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.employeeGeneralsLoaded(me, 1);		
		},
		
		actionNewEmployeeGeneral: function() {
			var args = ii.args(arguments,{});			
			var me = this;
			
			me.employeeGeneralId = 0;
			me.employeeBrief.setValue(parent.fin.empMasterUi.getPersonBrief());
			me.employeeSSN.setValue("");			
			me.employeeStatusType.select(0);
			me.employeePayrollCompany.reset();
			me.employeeDeviceGroup.reset();
			$('#ExemptNo').attr('checked', true);
			
			if(parent.fin.empMasterUi.getPersonHirNode() > 0){
				me.houseCodeStore.fetch("userId:[user],hirNodeId:" + parent.fin.empMasterUi.getPersonHirNode(), me.houseCodesLoaded, me);
			}
			
			me.employeeJobCode.reset();
			$('#HourlyRateYes').attr('checked', true);
			me.employeePayRate.setValue("");
			me.employeeHireDate.setValue("");
			me.employeeRateChangeReason.reset();
			//me.employeeRateChangeDate.setValue("");
			//me.employeeSeniorityDate.setValue("");
			me.employeeTerminationDate.setValue("");
			me.employeeTerminationReason.reset();
			me.employeeWorkShift.reset();
			me.employeeBenefitsPercentage.setValue("60");
			me.employeeScheduledHours.setValue("");
			$('#UnionNo').attr('checked', true);
			me.employeePersonalId = 0;
			$('#GenderYes').attr('checked', true);
			me.employeeEthnicity.reset();
			me.employeeBirthDate.setValue("");
			me.employeeReviewDate.setValue("");
			$("#EmployeeCrtdAt").text('');
			$("#EmployeeModAt").text('');
			$("#EmployeeRateChangeDate").text('');
			
			me.validator.reset();
			
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
			
			return true;		

		},
		
		employeeNewResponse: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});

			$("#pageLoading").hide();
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var status = $(args.xmlNode).attr("status");
			
			if(status == "success") {

				//new or updated employee Id					
				me.employeeNumberNew = args.xmlNode.firstChild.attributes[0].nodeValue;
				me.employeeNumber.setValue(args.xmlNode.firstChild.attributes[0].nodeValue);
				
				if (me.employeeNumberNew == 0)
				alert('Please verify the Employee Number range.');
			}
		},
		
		houseCodesLoaded: function(me, activeId) { // House Codes
					
            me.validator.reset();
			me.status = "";

			if (me.houseCodes.length <= 0) {
			
				return me.houseCodeSearchError();
			}			
			
			me.houseCodeParametersUpdate(false, me.houseCodes[0]);			
		
			me.houseCodeTitleValue = me.houseCodeTitle;	
			me.hirNode = me.houseCodes[0].hirNode;

			if(me.employeeGeneralId == 0){//executed for new employee
				//me.houseCodeChangedFlag = true;
				me.employeePayrollCompany.fetchingData();
				me.houseCodePayrollCompanyStore.fetch("userId:[user],houseCodeId:" + me.houseCodes[0].id + ",listAssociatedCompanyOnly:true,", me.houseCodePayrollCompanysLoaded, me);
			}
			
			if(me.sgBriefShow && !me.sgBriefReadOnly) me.employeeBrief.text.focus();
		},
		
		resetUIControls: function() {
			var args = ii.args(arguments,{
				flag: {type: String}
			});
			
			var me = this;
			
			if(args.flag == "1"){
				$("#messageToUser").html("Saving");
				$("#pageLoading").show();
			}
			else if(args.flag == "2"){
				$("#pageLoading").hide();
			}
			else if(args.flag == "3"){
				return '';
			}
		},
		
		effectiveDateChange: function()	{				
			var args = ii.args(arguments,{
				item: {type: fin.emp.EmployeeGeneral}
			});			
			var me = this;
			var item = args.item;
			
			//Effective Date
			if (me.employeeGenerals[0] != undefined) {
			
				if (
				//((me.employeeGenerals[0].effectiveDate != "" ? me.getDateFormat(me.employeeGenerals[0].effectiveDate) : me.employeeGenerals[0].effectiveDate) != item.effectiveDate) 
				 (me.employeeGenerals[0].brief != item.brief) 
				//|| (me.employeeGenerals[0].genderType != item.genderType) 
				//|| (me.employeeGenerals[0].maritalStatusType != item.maritalStatusType) 
				//|| (me.employeeGenerals[0].birthDate != "" ? me.getDateFormat(me.employeeGenerals[0].birthDate) : me.employeeGenerals[0].birthDate != item.birthDate) 
				//|| (me.employeeGenerals[0].ethnicityType != item.ethnicityType) 
				|| (me.employeeGenerals[0].active != item.active) 
				|| (me.employeeGenerals[0].statusType != item.statusType) 
				//|| ((me.employeeGenerals[0].hireDate != "1/1/1900 12:00:00 AM" ? me.getDateFormat(me.employeeGenerals[0].hireDate) : me.employeeGenerals[0].hireDate) != item.hireDate) 
				//|| ((me.employeeGenerals[0].originalHireDate != "1/1/1900 12:00:00 AM" ? me.getDateFormat(me.employeeGenerals[0].originalHireDate) : me.employeeGenerals[0].originalHireDate) != item.originalHireDate) 
				//|| ((me.employeeGenerals[0].terminationDate != "1/1/1900 12:00:00 AM" ? me.getDateFormat(me.employeeGenerals[0].terminationDate) : me.employeeGenerals[0].terminationDate) != item.terminationDate) 
				|| (me.employeeGenerals[0].separationCode != item.separationCode) 
				//|| (me.employeeGenerals[0].ssn != item.ssn.replace(/-/g,'')) 
				|| (me.employeeGenerals[0].payrollCompany != item.payrollCompany) 
				|| (me.employeeGenerals[0].i9Type != item.i9Type) 
				//|| (me.employeeGenerals[0].vetType != item.vetType) 
				|| (me.employeeGenerals[0].statusCategoryType != item.statusCategoryType)
				//|| ((me.employeeGenerals[0].seniorityDate != "" ? me.getDateFormat(me.employeeGenerals[0].seniorityDate) : me.employeeGenerals[0].seniorityDate) != item.seniorityDate) 
				|| (me.employeeGenerals[0].terminationReason != item.terminationReason)
				) 
				{
					if(item.effectiveDate == '' || me.compareDate(item.effectiveDate) == -1)
						item.effectiveDate = me.currentDate();
				}
				
				//Job Effective Date
				if (
				//((me.employeeGenerals[0].effectiveDateJob != "" ? me.getDateFormat(me.employeeGenerals[0].effectiveDateJob) : me.employeeGenerals[0].effectiveDateJob) != item.effectiveDateJob) 
				 (me.employeeGenerals[0].hcmHouseCode != item.hcmHouseCode) 
				|| (me.employeeGenerals[0].jobCode != item.jobCode) 
				|| (me.employeeGenerals[0].unionEmployee != item.unionEmployee) 
				//|| ((me.employeeGenerals[0].backGroundCheckDate != "" ? me.getDateFormat(me.employeeGenerals[0].backGroundCheckDate) : me.employeeGenerals[0].backGroundCheckDate) != item.backGroundCheckDate) 
				|| (me.employeeGenerals[0].jobStartReason != item.jobStartReason) 
				|| (me.employeeGenerals[0].houseCodeJob != item.houseCodeJob) 
				//|| (me.employeeGenerals[0].exempt != item.exempt) 
				//|| (me.employeeGenerals[0].unionType != item.unionType)
				) 
				{
					if(item.effectiveDateJob == '' || me.compareDate(item.effectiveDateJob) == -1)
						item.effectiveDateJob = me.currentDate();
				}
				
				//Compensation Effective Date
				if (
				//((me.employeeGenerals[0].effectiveDateCompensation != "" ? me.getDateFormat(me.employeeGenerals[0].effectiveDateCompensation) : me.employeeGenerals[0].effectiveDateCompensation) != item.effectiveDateCompensation) 
				 (me.employeeGenerals[0].payrollCompany != item.payrollCompany) 
				|| (me.employeeGenerals[0].hourly != item.hourly) 
				|| (me.employeeGenerals[0].payRate != item.payRate) 
				//|| ((me.employeeGenerals[0].reviewDate != "" ? me.getDateFormat(me.employeeGenerals[0].reviewDate) : me.employeeGenerals[0].reviewDate) != item.reviewDate) 
				|| (me.employeeGenerals[0].workShift != item.workShift) 
				|| (me.employeeGenerals[0].alternatePayRateA != item.alternatePayRateA) 
				|| (me.employeeGenerals[0].alternatePayRateB != item.alternatePayRateB) 
				|| (me.employeeGenerals[0].alternatePayRateC != item.alternatePayRateC) 
				|| (me.employeeGenerals[0].alternatePayRateD != item.alternatePayRateD) 
				|| (me.employeeGenerals[0].deviceGroup != item.deviceGroup) 
				|| (me.employeeGenerals[0].rateChangeReason != item.rateChangeReason) 
				|| (me.employeeGenerals[0].frequencyType != item.frequencyType) 
				|| (me.employeeGenerals[0].scheduledHours != item.scheduledHours) 
				|| (me.employeeGenerals[0].benefitsPercentage != item.benefitsPercentage)
				
				) {
					if(item.effectiveDateCompensation == '' || me.compareDate(item.effectiveDateCompensation) == -1)
						item.effectiveDateCompensation = me.currentDate();
				}
			}
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});			
			var me = this;
		 	var changeStatusCode = '';
			var payrollStatus = '';
			var previousPayrollStatus = '';
			
			me.message = "";
			
			if(me.employeeReadOnly || me.tabGeneralReadOnly) return;
			
			if(me.employeeValidations.length > 0) {
				
				if (me.employeeValidations[0].hrBlackOutPeriod > 0 && me.employeeValidations[0].hrBlackOutPeriod <= 37) {
					alert("Employee may not be added or modified during the Payroll Blackout. The Payroll Blackout start date is expected to be Sunday at 12 AM and the end date is expected to be 37 hours later. Please visit after [" + me.employeeValidations[0].hrBlackOutPeriod + "] hours.");
					return; //need to remove
				}
			}
			
			if(me.personId <= 0) {
				me.message += "Please select/save corresponding person record.\n";
			}

			if(me.houseCodeId <= 0 || $("#houseCodeText").val() == "") {
				me.message += "Please select House Code for the employee.\n";
			}
			
			if($("#EmployeeNumberText").val() <= 0) {
				me.message += "Please verify the Employee Number range.\n";
			}

			if(me.houseCodePayrollCompanys.length <= 0 || !me.houseCodePayrollCompanys[me.employeePayrollCompany.indexSelected]) {
				me.message += "Please select Ceridian Company.\n";
			}

			if(me.employeeStatusType.text.value == "Terminated"){
				if(me.employeeTerminationDate.text.value == '' || me.employeeTerminationReason.indexSelected == -1) {
					me.message += "Please select Termination Date and Reason for it.\n";
				}
				
				if(me.payRollEntries > 0){ 
					me.message += "This Employee has Payroll hours entered in the current pay period. We can not Terminate this Employee.\n";
				}
			}
			
			if (me.employeeGenerals.length > 0) {
				if ((me.jobChangeReason.indexSelected <= 0) && (me.houseCodeJobChanged == true)) {
					me.message += "Please select Job change reason.\n";
				}
			}

			if (me.employeeGenerals.length > 0) {//any changes to following field results in 'Rate Change Reason' selection Required.
				if ((parseInt(me.employeePayRate.getValue()) != parseInt(me.employeeGenerals[0].payRate)  //payRateChanged
					|| Boolean($("input[name='HourlyRate']:checked").val()) != me.employeeGenerals[0].hourly //payRateTypeChanged
					|| me.payFrequencyType != me.employeeGenerals[0].frequencyType //payFrequencyChanged
					|| parseInt(me.employeeScheduledHours.getValue()) != me.employeeGenerals[0].scheduledHours //scheduledHoursChanged
					) 
					&& (me.employeeRateChangeReason.indexSelected <= 0)
					) {
					me.message += "Please select pay Rate change reason.\n";
				}
			}

			if($("input[name='PTOSetup']:checked").val() == "Automatic"
				&& me.ptoStartDate.text.value == "") {
				me.message += "Please select PTO start date. It is required for 'Automatic' PTO setup.\n";
			}

			if($("input[name='Union']:checked").val() == "true"
				&& me.employeeUnion.indexSelected <= 0) {
				me.message += "Please select Union. It is required field when employee is 'Union' is selected.\n";
			}
			
			me.validator.forceBlur();
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) ) {
				me.message += "In order to save, the errors on General page must be corrected.\n";
			}

			if (me.message.length > 0) {
				alert(me.message);
				return false;
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			//debugger;
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
				if (me.employeeStatusType.text.value == "Terminated"
					|| me.employeeStatusType.text.value == "Severance"
					) 
				{
					if (me.employeeGenerals.length > 0) {
						if (me.employeeGenerals[0].payrollStatus == "T") {
							changeStatusCode = '';
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
					|| (me.employeeStatusType.text.value == 'Leave Of Absence'))
				{						
					changeStatusCode = 'I';
					payrollStatus = 'I';
					previousPayrollStatus = 'A';
				}
				
				//FMLA_LOA, Inactive, Leave of Absence
				//Reactivate
				if (me.employeeGenerals.length > 0) {
					if (me.statusTypes[me.employeeGenerals[0].statusType] != undefined) {
						if (((me.statusTypes[me.employeeGenerals[0].statusType - 1].name == 'FMLA_LOA') ||
						(me.statusTypes[me.employeeGenerals[0].statusType - 1].name == 'Inactive') ||
						(me.statusTypes[me.employeeGenerals[0].statusType - 1].name == 'Leave Of Absence')) &&
						(me.employeeStatusType.text.value) == 'Active') {
							changeStatusCode = 'A';
							payrollStatus = 'A';
							previousPayrollStatus = 'I';
						}
					}
				}	
			}
					
			//changeStatusCode = me.employeeGenerals[0].changeStatusCode;	
			//payrollStatus = me.employeeGenerals[0].payrollStatus;	
			//previousPayrollStatus = me.employeeGenerals[0].previousPayrollStatus;
			
			var updatePersonHouseCode = false;
			if (me.houseCodeChangedFlag || me.employeeNumberNew > 0) {
				updatePersonHouseCode = true;
				ii.trace("Employee General: Update Person HouseCode & Refresh Person Tab.", ii.traceTypes.information, "Information");
			}
			
			var item = new fin.emp.EmployeeGeneral({
				id: me.employeeGeneralId
				, personId: me.personId
				, active: ($("input[name='EmployeeActive']:checked").val() == "true" ? true : false)  // employeeActive
				, crothallEmployee: ($("input[name='CrothallEmployee']:checked").val() == "true" ? true : false)
				, brief: me.employeeBrief.getValue()
				, hcmHouseCode: me.houseCodeId.toString()
				, hirNode: me.hirNode.toString()
				, statusType: (me.employeeStatusType.indexSelected >= 0 ? 
					($("input[name='EmployeeActive']:checked").val() == "true" ? 
						me.statusTypes[me.employeeStatusType.indexSelected].id :
						(me.newStatusTypes[me.employeeStatusType.indexSelected] == undefined ?
							me.statusTypes[me.employeeStatusType.indexSelected].id :
							me.newStatusTypes[me.employeeStatusType.indexSelected].id)
						)
					: 0)								
				, statusCategoryType: (me.employeeStatusCategoryType.indexSelected >= 0 ? me.statusCategoryTypes[me.employeeStatusCategoryType.indexSelected].id : 0)
				, houseCodeJob: (me.job.indexSelected <= 0 ? 0 : me.houseCodeJobs[me.job.indexSelected].id)
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
				, hourly: ($("input[name='HourlyRate']:checked").val() == "true" ? true : false)				
				, payRate: me.employeePayRate.getValue()	
				, rateChangeReason: (me.employeeRateChangeReason.indexSelected >= 0 ? me.rateChangeReasons[me.employeeRateChangeReason.indexSelected].id : 0)
				, rateChangeDate: '' //me.employeeRateChangeDate.getValue()
				, maritalStatusType: me.maritalStatusTypes[me.employeeMaritalStatus.indexSelected].id
				, hireDate: me.employeeHireDate.text.value
				, originalHireDate: me.employeeOriginalHireDate.text.value
				, seniorityDate: me.employeeSeniorityDate.text.value
				, effectiveDate: me.employeeEffectiveDate.text.value
				, effectiveDateJob: me.jobEffectiveDate.text.value
				, effectiveDateCompensation: me.compensationEffectiveDate.text.value
				, terminationDate: me.employeeTerminationDate.text.value
				, terminationReason: (me.employeeTerminationReason.indexSelected >= 0 ? me.terminationReasons[me.employeeTerminationReason.indexSelected].id : 0)
				, workShift: (me.employeeWorkShift.indexSelected >= 0 ? me.workShifts[me.employeeWorkShift.indexSelected].id : 0)
				, benefitsPercentage: me.employeeBenefitsPercentage.getValue()
				, scheduledHours: me.employeeScheduledHours.getValue()
				, unionEmployee: ($("input[name='Union']:checked").val() == "true" ? true : false)
				, unionType: (me.employeeUnion.indexSelected >= 0 ? me.unionTypes[me.employeeUnion.indexSelected].id : 0)
				, i9Type: (me.employeeI9Status.indexSelected >= 0 ? me.i9Types[me.employeeI9Status.indexSelected].id : 0)
				, vetType: (me.employeeVETSStatus.indexSelected >= 0 ? me.vetTypes[me.employeeVETSStatus.indexSelected].id : 0)
				, separationCode: (me.separationCode.indexSelected >= 0 ? me.separationCodes[me.separationCode.indexSelected].id : 0)
				, jobStartReason: (me.jobChangeReason.indexSelected >= 0 ? me.jobStartReasonTypes[me.jobChangeReason.indexSelected].id : 0)
				//Personal
				, genderType: ($("input[name='Gender']:checked").val() == "Male" ? 1 : 2) 		
				, birthDate: me.employeeBirthDate.text.value 		
				, backGroundCheckDate: me.employeeBackgroundCheckDate.text.value 	
				, reviewDate: me.employeeReviewDate.text.value 	
				, ethnicityType: (me.employeeEthnicity.indexSelected >= 0 ? me.ethnicityTypes[me.employeeEthnicity.indexSelected].id : 0) 										
				, deviceGroup: (me.employeeDeviceGroup.indexSelected >= 0 ? me.deviceGroupTypes[me.employeeDeviceGroup.indexSelected].id : 0)
				//PTO
				, ptoAccruedHourEntryAutomatic: ($("input[name='PTOSetup']:checked").val() == "Automatic" ? true : false)
				, ptoStartDate: ($("input[name='PTOSetup']:checked").val() == "Automatic" ? me.ptoStartDate.text.value : '1/1/1900') 
				, houseCodeChanged: updatePersonHouseCode
				//Export update
				, changeStatusCode: changeStatusCode
				, payrollStatus: payrollStatus
				, previousPayrollStatus: previousPayrollStatus	
			});

			var xml = me.saveXmlBuild(item);

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseEmployee,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},

		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: {type: fin.emp.EmployeeGeneral}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
			
			me.effectiveDateChange(item);  //	 effectiveDate
			
			xml += '<employeeGeneral';
			xml += ' id="' + item.id + '"';
			xml += ' personId="' + item.personId + '"';
			xml += ' active="' + item.active + '"';
			xml += ' crothallEmployee="' + item.crothallEmployee + '"';
			xml += ' brief="' + ui.cmn.text.xml.encode(item.brief) + '"';
			xml += ' hcmHouseCode="' + item.hcmHouseCode + '"';		
			xml += ' hirNode="' + item.hirNode + '"';
			xml += ' statusType="' + item.statusType + '"';
			xml += ' statusCategoryType="' + item.statusCategoryType + '"';
			xml += ' houseCodeJob="' + item.houseCodeJob + '"';			
			xml += ' employeeNumber="' + item.employeeNumber + '"';	
			xml += ' ssn="' + item.ssn.replace(/-/g,'') + '"';
			xml += ' exempt="' + item.exempt + '"';
			xml += ' payrollCompany="' + item.payrollCompany + '"';
			xml += ' frequencyType="' + item.frequencyType + '"';
			xml += ' alternatePayRateA="' + item.alternatePayRateA + '"';
			xml += ' alternatePayRateB="' + item.alternatePayRateB + '"';
			xml += ' alternatePayRateC="' + item.alternatePayRateC + '"';
			xml += ' alternatePayRateD="' + item.alternatePayRateD + '"';			
			xml += ' jobCode="' + item.jobCode + '"';
			xml += ' hourly="' + item.hourly + '"';
			xml += ' payRate="' + item.payRate + '"';
			xml += ' rateChangeReason="' + item.rateChangeReason + '"';
			xml += ' rateChangeDate="' + item.rateChangeDate + '"';									
			xml += ' maritalStatusType="' + item.maritalStatusType + '"';
			xml += ' hireDate="' + item.hireDate + '"';
			xml += ' originalHireDate="' + item.originalHireDate + '"';
			xml += ' seniorityDate="' + item.seniorityDate + '"';
			xml += ' effectiveDate="' + item.effectiveDate + '"';
			xml += ' effectiveDateJob="' + item.effectiveDateJob + '"';
			xml += ' effectiveDateCompensation="' + item.effectiveDateCompensation + '"';
			xml += ' terminationDate="' + item.terminationDate + '"';
			xml += ' terminationReason="' + item.terminationReason + '"';
			xml += ' workShift="' + item.workShift + '"';
			xml += ' benefitsPercentage="' + item.benefitsPercentage + '"';
			xml += ' scheduledHours="' + item.scheduledHours + '"';
			xml += ' unionEmployee="' + item.unionEmployee + '"';
			xml += ' unionType="' + item.unionType + '"';
			xml += ' genderType="' + item.genderType + '"';
			xml += ' birthDate="' + item.birthDate + '"';			
			xml += ' backGroundCheckDate="' + item.backGroundCheckDate + '"';	
			xml += ' reviewDate="' + item.reviewDate + '"';
			xml += ' ethnicityType="' + item.ethnicityType + '"';
			xml += ' deviceGroup="' + item.deviceGroup + '"';
			xml += ' i9Type="' + item.i9Type + '"';
			xml += ' vetType="' + item.vetType + '"';
			xml += ' separationCode="' + item.separationCode + '"';
			xml += ' jobStartReason="' + item.jobStartReason + '"';									
			xml += ' ptoAccruedHourEntryAutomatic="' + item.ptoAccruedHourEntryAutomatic + '"';
			xml += ' ptoStartDate="' + item.ptoStartDate + '"';
			xml += ' houseCodeChanged="' + item.houseCodeChanged + '"';
			xml += ' changeStatusCode="' + item.changeStatusCode + '"';
			xml += ' payrollStatus="' + item.payrollStatus + '"';
			xml += ' previousPayrollStatus="' + item.previousPayrollStatus + '"';	
			xml += ' version="1"';			
			xml += '/>';
			
			xml += '<personRole id="0" personId="' + me.personId + '" roleId="2"/>';			
			
			return xml;
		},

		saveResponseEmployee: function(){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});
			
			$("#pageLoading").hide();
			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id = parseInt($(this).attr("id"), 10);
			var clientId = parseInt($(this).attr("clientId"), 10);
			var success = true;
			var errorMessage = "";
			var successMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var itemPersonal;
			var today = new Date();
			
			if (status == "success") {
			
				//new or updated employee Id					
				me.employeeGeneralId = parseInt(args.xmlNode.firstChild.attributes[0].nodeValue);
				me.setControlState("EmployeeSSN", me.sgSSNReadOnly, me.sgSSNShow);
				
				if (me.employeeNumberNew > 0) {
					me.newEmployeeNumber = me.employeeNumberNew;
					$("#EmployeeModAt").text((today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear());
					$("#EmployeeRateChangeDate").text((today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear());
				}
				
				if (me.houseCodeChangedFlag || me.employeeNumberNew > 0) {
					parent.fin.empMasterUi.personNeedUpdate = true;
				}
				
				me.houseCodeChangedFlag = false;
				me.houseCodeJobChanged = false;
				me.employeeActiveChanged = false;
				
				if (me.employeeGenerals.length > 0) {
					if (me.statusTypes[me.employeeStatusType.indexSelected].id != me.employeeGenerals[0].statusType) 
						successMessage += "Employee status updates will be transmitted to Ceridian on Monday at 1:00PM EST.\n";
					else 
						if (me.employeeNumberNew == 0) 
							successMessage += "Notice: Changes will be transmitted to Ceridian on Monday at 1:00 PM EST.\n";
				}
				
				me.jobStartReasonChange(true); // This is commented since double save is clearing export flag. ex-EComp, EJob.
				me.employeeRateChangeReason.reset();
				me.hireDateAccessSetup();
				me.effectiveDateAccessSetup();
				
				$("#EmployeeHireDateText").attr('disabled', true);
				$("#EmployeeHireDateAction").hide();
				
				parent.fin.empMasterUi.showPayrollTab(me.employeeGeneralId);
				
				if (me.employeeGenerals.length <= 0) {
					$("#JobChangeReasonText").attr('disabled', false);
					$("#JobChangeReasonAction").addClass("iiInputAction");
					parent.fin.empMasterUi.tabSelected("TabPayroll");
				}
				
				item.id = me.employeeGeneralId;
				me.employeeGenerals[0] = item;
				me.employeeNumberNew = 0;
				parent.fin.empMasterUi.payrollNeedUpdate = true;
				me.employeeHireDate.resizeText();
				
				if (successMessage.length > 0) 
					alert(successMessage);
			}
			else {
			
				alert("Notice/Error:\n" + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if (status == "invalid") {
					traceType = ii.traceTypes.warning;
				}
				else {
					errorMessage += " [SAVE FAILURE]";
				}
			}
		}
		
	}
});

function main() {
	fin.empGeneralUi = new fin.emp.UserInterface();
	fin.empGeneralUi.resize();
	fin.houseCodeSearchUi = fin.empGeneralUi;
}

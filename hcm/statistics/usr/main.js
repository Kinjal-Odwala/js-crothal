ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.hcm.statistics.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);
ii.Style( "fin.cmn.usr.dateDropDown" , 8);

ii.Class({
    Name: "fin.hcm.statistics.UserInterface",
    Definition: {
	
		init: function (){
			var args = ii.args(arguments, {});
			var me = this;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.houseCodeStatisticsLoaded();
		},
		
		authorizationProcess: function fin_hcm_statistics_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if(me.isAuthorized)
				$("#pageLoading").hide();
			else{
				$("#messageToUser").html("Unauthorized");
				alert("You are not authorized to view this content. Please contact your Administrator.");
				return false;
			}
			//Statistics
			me.statisticsWrite = me.authorizer.isAuthorized(me.authorizePath + '\\Write');
			me.statisticsReadOnly = me.authorizer.isAuthorized(me.authorizePath + '\\Read');
			
			me.tabStatisticsShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabStatistics");
			me.tabStatisticsWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabStatistics\\Write");
			me.tabStatisticsReadOnly = me.authorizer.isAuthorized(me.authorizePath +"\\TabStatistics\\Read");
						
			//ts=tabStatistics
			me.tsManagedEmployeesShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\ManagedEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsCrothallEmployeesShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\CrothallEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedsLicensedShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\BedsLicensed", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedsActiveShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\BedsActive", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsPatientDaysShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\PatientDays", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAdjustedPatientDaysShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\AdjustedPatientDays", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsDailyCensusShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\DailyCensus", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualDischargesShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\AnnualDischarges", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualTransfersShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\AnnualTransfers", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsBedTurnaroundTimeShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\BedTurnaroundTime", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsCleanableSquareFeetShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\CleanableSquareFeet", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsAnnualTransportsShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\AnnualTransports", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));			
			me.tsLundryShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\Lundry", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));

			me.tsMgmtFeeTerminatedHourlyEmployeesShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeTerminatedHourlyEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeActiveHourlyEmployeesShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeActiveHourlyEmployees", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalProductiveLaborHoursWorkedShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborHoursWorked", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalNonProductiveLaborHoursShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborHours", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalProductiveLaborDollarsPaidShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborDollarsPaid", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborDollarsPaid", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			me.tsHospitalPaidJanitorialPaperPlasticSupplyCostShow = me.isCtrlVisible(me.authorizePath + "\\TabStatistics\\HospitalPaidJanitorialPaperPlasticSupplyCost", me.tabStatisticsShow, (me.tabStatisticsWrite || me.tabStatisticsReadOnly));
			
			me.tsManagedEmployeesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\ManagedEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsCrothallEmployeesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\CrothallEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedsLicensedReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\BedsLicensed\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedsActiveReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\BedsActive\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsPatientDaysReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\PatientDays\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAdjustedPatientDaysReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\AdjustedPatientDays\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsDailyCensusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\DailyCensus\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualDischargesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\AnnualDischarges\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualTransfersReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\AnnualTransfers\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsBedTurnaroundTimeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\BedTurnaroundTime\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsCleanableSquareFeetReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\CleanableSquareFeet\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsAnnualTransportsReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\AnnualTransports\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsLundryReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\Lundry\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);

			me.tsMgmtFeeTerminatedHourlyEmployeesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeTerminatedHourlyEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeActiveHourlyEmployeesReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeActiveHourlyEmployees\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalProductiveLaborHoursWorkedReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborHoursWorked\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalNonProductiveLaborHoursReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborHours\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalProductiveLaborDollarsPaidReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalProductiveLaborDollarsPaid\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsMgmtFeeTotalNonProductiveLaborDollarsPaidReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\MgmtFeeTotalNonProductiveLaborDollarsPaid\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			me.tsHospitalPaidJanitorialPaperPlasticSupplyCostReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabStatistics\\HospitalPaidJanitorialPaperPlasticSupplyCost\\Read", me.tabStatisticsWrite, me.tabStatisticsReadOnly);
			
			me.resetUIElements();
			
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_hcm_statistics_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		isCtrlVisible: function fin_hcm_statistics_UserInterface_isCtrlVisible(){ 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionShow: {type: Boolean},
				sectionReadWrite: {type: Boolean}
			});
			
			var me = this;
			var ctrlShow = parent.fin.cmn.util.authorization.isAuthorized(me, args.path);
			var ctrlWrite = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Write");
			var ctrlReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, args.path + "\\Read");
			
			if(me.statisticsWrite || me.statisticsReadOnly)
				return true;
			
			if(me.tabStatisticsWrite || me.tabStatisticsReadOnly)
				return true;

			if(args.sectionReadWrite)
				return true;

			if(args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_hcm_statistics_UserInterface_isCtrlReadOnly(){ 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});
			
			var me = this;

			if(args.sectionWrite && !me.tabStatisticsReadOnly && !me.statisticsReadOnly)
				return false;

			if(me.tabStatisticsWrite && !me.statisticsReadOnly)
				return false;

			if(me.statisticsWrite)
				return false;
			
			if(me.statisticsReadOnly) return true;
			if(me.tabStatisticsReadOnly) return true;
			if(args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_hcm_statistics_UserInterface_resetUIElements() {
			var me = this;			
			
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
			
			if(args.ctrlReadOnly && args.ctrlType != "Radio"){
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if(!args.ctrlShow && args.ctrlType != "Radio"){
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
				
			}
			if(args.ctrlReadOnly && args.ctrlType == "Radio"){
				$("#" + args.ctrlName + "Yes").attr('disabled', true);
				$("#" + args.ctrlName + "No").attr('disabled', true);
			} 
			if(!args.ctrlShow && args.ctrlType == "Radio"){
				$("#" + args.ctrlDiv).hide();
			} 
		},
		
		resize: function(){
			var args = ii.args(arguments, {});
			var me = this;
			
		},
		
		defineFormControls: function(){
			
			var me = this;
			
			 me.managedEmployees = new ui.ctl.Input.Text({
		        id: "ManagedEmployees" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.managedEmployees.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.managedEmployees.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.crothallEmployees = new ui.ctl.Input.Text({
		        id: "CrothallEmployees" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.crothallEmployees.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.crothallEmployees.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.bedsLicensed = new ui.ctl.Input.Text({
		        id: "BedsLicensed" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bedsLicensed.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.bedsLicensed.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.bedsActive = new ui.ctl.Input.Text({
		        id: "BedsActive" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bedsActive.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.bedsActive.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.patientDays = new ui.ctl.Input.Text({
		        id: "PatientDays" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.patientDays.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.patientDays.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.adjustedPatientDays = new ui.ctl.Input.Text({
		        id: "AdjustedPatientDays" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.adjustedPatientDays.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.adjustedPatientDays.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.avgDailyCensus = new ui.ctl.Input.Text({
		        id: "AvgDailyCensus",
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.avgDailyCensus.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.avgDailyCensus.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.annualDischarges = new ui.ctl.Input.Text({
		        id: "AnnualDischarges" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.annualDischarges.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.annualDischarges.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.annualTransfers = new ui.ctl.Input.Text({
		        id: "AnnualTransfers" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.annualTransfers.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.annualTransfers.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.avgBedTurnAroundTime = new ui.ctl.Input.Text({
		        id: "AvgBedTurnaroundTime" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.avgBedTurnAroundTime.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.avgBedTurnAroundTime.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.netCleanableSquareFeet = new ui.ctl.Input.Text({
		        id: "NetCleanableSquareFeet" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.netCleanableSquareFeet.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.netCleanableSquareFeet.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.annualTransports = new ui.ctl.Input.Text({
		        id: "AnnualTransports" ,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
		    
			me.annualTransports.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.annualTransports.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});
				
			me.avgLaundryLbs = new ui.ctl.Input.Text({
		        id: "AvgLaundryLBS" ,
				tabindex:13,
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.avgLaundryLbs.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ){

					var message = "";
					var valid = true;
					var enteredText = me.avgLaundryLbs.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						valid = false;
						message = 'Please enter valid number.';
					}
					
					if(!valid){
						this.setInvalid( message );
					}
				});

			me.mgmtFeeTerminatedHourlyEmployees = new ui.ctl.Input.Text({
		        id: "MgmtFeeTerminatedHourlyEmployees" ,
				tabindex:14,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeTerminatedHourlyEmployees
			.setValidationMaster( me.validator )
			.addValidation( function( isFinal, dataMap ){

				var message = "";
				var valid = true;
				var enteredText = me.mgmtFeeTerminatedHourlyEmployees.getValue();
				
				if(enteredText == '') return;

				if(/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false){
					valid = false;
					message = 'Please enter valid number.';
				}
				
				if(!valid){
					this.setInvalid( message );
				}
			});

			me.mgmtFeeActiveHourlyEmployees = new ui.ctl.Input.Text({
		        id: "MgmtFeeActiveHourlyEmployees" ,
				tabindex:15,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeActiveHourlyEmployees
			.setValidationMaster( me.validator )
			.addValidation( function( isFinal, dataMap ){

				var message = "";
				var valid = true;
				var enteredText = me.mgmtFeeActiveHourlyEmployees.getValue();
				
				if(enteredText == '') return;

				if(/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false){
					valid = false;
					message = 'Please enter valid number.';
				}
				
				if(!valid){
					this.setInvalid( message );
				}
			});

			me.mgmtFeeTotalProductiveLaborHoursWorked = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalProductiveLaborHoursWorked" ,
				tabindex:16,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeTotalProductiveLaborHoursWorked
			.setValidationMaster( me.validator )
			.addValidation( function( isFinal, dataMap ){

				var message = "";
				var valid = true;
				var enteredText = me.mgmtFeeTotalProductiveLaborHoursWorked.getValue();
				
				if(enteredText == '') return;

				if(/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false){
					valid = false;
					message = 'Please enter valid number.';
				}
				
				if(!valid){
					this.setInvalid( message );
				}
			});

			me.mgmtFeeTotalNonProductiveLaborHours = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalNonProductiveLaborHours" ,
				tabindex:17,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeTotalNonProductiveLaborHours
			.setValidationMaster( me.validator )
			.addValidation( function( isFinal, dataMap ){

				var message = "";
				var valid = true;
				var enteredText = me.mgmtFeeTotalNonProductiveLaborHours.getValue();
				
				if(enteredText == '') return;

				if(/^(?:\d*\.\d{1,2}|\d+)$/ .test(enteredText) == false){
					valid = false;
					message = 'Please enter valid number.';
				}
				
				if(!valid){
					this.setInvalid( message );
				}
			});

			me.mgmtFeeTotalProductiveLaborDollarsPaid = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalProductiveLaborDollarsPaid" ,
				tabindex:18,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeTotalProductiveLaborDollarsPaid
			.setValidationMaster( me.validator )
			.addValidation( ui.ctl.Input.Validation.isMoney )
			.addValidation( ui.ctl.Input.Validation.moneyRange, {
						min:-99999999.99,   //@iiDoc {Property:Number} The minimum money value
						max:99999999.99	  //@iiDoc {Property:Number} The maximum money value.
				});

			me.mgmtFeeTotalNonProductiveLaborDollarsPaid = new ui.ctl.Input.Text({
		        id: "MgmtFeeTotalNonProductiveLaborDollarsPaid" ,
				tabindex:19,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.mgmtFeeTotalNonProductiveLaborDollarsPaid
			.setValidationMaster( me.validator )
			.addValidation( ui.ctl.Input.Validation.isMoney )
			.addValidation( ui.ctl.Input.Validation.moneyRange, {
						min:-99999999.99,   //@iiDoc {Property:Number} The minimum money value
						max:99999999.99	  //@iiDoc {Property:Number} The maximum money value.
				});

			me.hospitalPaidJanitorialPaperPlasticSupplyCost = new ui.ctl.Input.Text({
		        id: "HospitalPaidJanitorialPaperPlasticSupplyCost" ,
				tabindex:20,
		        maxLength : 11,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			me.hospitalPaidJanitorialPaperPlasticSupplyCost
			.setValidationMaster( me.validator )
			.addValidation( ui.ctl.Input.Validation.isMoney )
			.addValidation( ui.ctl.Input.Validation.moneyRange, {
						min:-99999999.99,   //@iiDoc {Property:Number} The minimum money value
						max:99999999.99	  //@iiDoc {Property:Number} The maximum money value.
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
		},
		
		resizeControls: function() {
			var me = this;
			
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

			me.resize();
		},
		
		configureCommunications: function (){
			var args = ii.args(arguments, {});
			var me = this;	
			
		},
			
		controlKeyProcessor: function (){
			var args = ii.args(arguments, {
				event: {
					type: Object
				} // The (key) event object
			});
			
			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey){
				
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

		houseCodeStatisticsLoaded: function (me, activeId){
			
			var me = this;
			
			if(parent.fin.hcmMasterUi == undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] == undefined) return;

			var houseCode = parent.fin.hcmMasterUi.houseCodeDetails[0];

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
			
			$("#pageLoading").hide();
			me.resizeControls();
		}
	}
});

function main(){

	fin.hcmStatisticsUi = new fin.hcm.statistics.UserInterface();
	fin.hcmStatisticsUi.resize();
}

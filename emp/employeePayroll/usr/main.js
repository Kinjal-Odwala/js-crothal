ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "fin.emp.employeePayroll.usr.defs" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.dropDown" , 6);
ii.Style( "fin.cmn.usr.dateDropDown" , 7);

ii.Class({
    Name: "fin.emp.PayrollInterface",
    Definition: {
        init: function (){
            
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
			me.payrollCompany = 0;
			
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();			
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Employees";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.defineUserControls();
			me.configureCommunications();

			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);

			// Disable the context menu but not on localhost because its used for debugging
			if( location.hostname != "localhost" ){
				$(document).bind("contextmenu", function(event){
					return false;
				});
			}
			
			me.federalAdjustmentType.fetchingData();
			me.maritalStatusFederalTaxType.fetchingData();
			me.primaryTaxState.fetchingData();
			me.secTaxState.fetchingData();
			me.federalAdjustmentStore.fetch("userId:[user]", me.federalAdjustmentsLoaded, me);		
        },
		
		authorizationProcess: function fin_emp_payrollInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			me.employeeWrite = me.authorizer.isAuthorized(me.authorizePath + "\\Write");
			me.employeeReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");

			me.tabPayrollShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll");
			me.tabPayrollWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabPayroll\\Write");
			me.tabPayrollReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabPayroll\\Read");

			me.sectionFederalTaxShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionFedTax");
			me.sectionStateTaxShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionStateTax");
			me.sectionLocalTaxShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionLocalTax");

			me.sectionFederalTaxWrite = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionFedTax\\Write");
			me.sectionStateTaxWrite = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionStateTax\\Write");
			me.sectionLocalTaxWrite = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionLocalTax\\Write");

			me.sectionFederalTaxReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionFedTax\\Read");
			me.sectionStateTaxReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionStateTax\\Read");
			me.sectionLocalTaxReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabPayroll\\SectionLocalTax\\Read");
			
			//sf=sectionFedTax
			me.sfFedExemptionsShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionFedTax\\FedExemptions", me.sectionFederalTaxShow, (me.sectionFederalTaxWrite || me.sectionFederalTaxReadOnly));
			me.sfTaxStatusShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionFedTax\\TaxStatus", me.sectionFederalTaxShow, (me.sectionFederalTaxWrite || me.sectionFederalTaxReadOnly));
			me.sfAdjustmentTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionFedTax\\AdjustmentType", me.sectionFederalTaxShow, (me.sectionFederalTaxWrite || me.sectionFederalTaxReadOnly));
			me.sfAdjustmentValueShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionFedTax\\AdjustmentValue", me.sectionFederalTaxShow, (me.sectionFederalTaxWrite || me.sectionFederalTaxReadOnly));

			me.sfFedExemptionsReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionFedTax\\Brief\\Read", me.sectionFederalTaxWrite, me.sectionFederalTaxReadOnly);
			me.sfFedExemptionsReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionFedTax\\FedExemptions\\Read", me.sectionFederalTaxWrite, me.sectionFederalTaxReadOnly);
			me.sfTaxStatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionFedTax\\TaxStatus\\Read", me.sectionFederalTaxWrite, me.sectionFederalTaxReadOnly);
			me.sfAdjustmentTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionFedTax\\AdjustmentType\\Read", me.sectionFederalTaxWrite, me.sectionFederalTaxReadOnly);
			me.sfAdjustmentValueReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionFedTax\\AdjustmentValue\\Read", me.sectionFederalTaxWrite, me.sectionFederalTaxReadOnly);
			
			//ss=sectionStateTax
			me.ssPrimaryStateShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\PrimaryState", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssPrimaryStatusShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\PrimaryStatus", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssSecondaryStateShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\SecondaryState", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssSecondaryStatusShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\SecondaryStatus", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssStateExemptionsShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateExemptions", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssStateAdjustmentTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateAdjustmentType", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssStateAdjustmentValueShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateAdjustmentValue", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssStateSDIAdjustmentTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateSDIAdjustmentType", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));
			me.ssStateSDIAdjustmentValueShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateSDIAdjustmentValue", me.sectionStateTaxShow, (me.sectionStateTaxWrite || me.sectionStateTaxReadOnly));

			me.ssPrimaryStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\PrimaryState\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssPrimaryStatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\PrimaryStatus\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssSecondaryStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\SecondaryState\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssSecondaryStatusReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\SecondaryStatus\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssStateExemptionsReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateExemptions\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssStateAdjustmentTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateAdjustmentType\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssStateAdjustmentValueReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateAdjustmentValue\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssStateSDIAdjustmentTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateSDIAdjustmentType\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			me.ssStateSDIAdjustmentValueReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionStateTax\\StateSDIAdjustmentValue\\Read", me.sectionStateTaxWrite, me.sectionStateTaxReadOnly);
			
			//sl=sectionLocalTax
			me.slLocalTaxAdjustmentTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxAdjustmentType", me.sectionLocalTaxShow, (me.sectionLocalTaxWrite || me.sectionLocalTaxReadOnly));
			me.slLocalTaxAdjustmentValueShow = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxAdjustmentValue", me.sectionLocalTaxShow, (me.sectionLocalTaxWrite || me.sectionLocalTaxReadOnly));
			me.slLocalTaxCode1Show = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode1", me.sectionLocalTaxShow, (me.sectionLocalTaxWrite || me.sectionLocalTaxReadOnly));
			me.slLocalTaxCode2Show = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode2", me.sectionLocalTaxShow, (me.sectionLocalTaxWrite || me.sectionLocalTaxReadOnly));
			me.slLocalTaxCode3Show = me.isCtrlVisible(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode3", me.sectionLocalTaxShow, (me.sectionLocalTaxWrite || me.sectionLocalTaxReadOnly));

			me.slLocalTaxAdjustmentTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxAdjustmentType\\Read", me.sectionLocalTaxWrite, me.sectionLocalTaxReadOnly);
			me.slLocalTaxAdjustmentValueReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxAdjustmentValue\\Read", me.sectionLocalTaxWrite, me.sectionLocalTaxReadOnly);
			me.slLocalTaxCode1ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode1\\Read", me.sectionLocalTaxWrite, me.sectionLocalTaxReadOnly);
			me.slLocalTaxCode2ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode2\\Read", me.sectionLocalTaxWrite, me.sectionLocalTaxReadOnly);
			me.slLocalTaxCode3ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabPayroll\\SectionLocalTax\\LocalTaxCode3\\Read", me.sectionLocalTaxWrite, me.sectionLocalTaxReadOnly);

			me.resetUIElements();
			
			$("#pageLoading").hide();
			me.resizeControls();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_emp_payrollInterface_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},

		isCtrlVisible: function fin_emp_payrollInterface_isCtrlVisible(){ 
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

			if(me.tabPayrollWrite || me.tabPayrollReadOnly) //
				return true;

			if(args.sectionReadWrite)
				return true;

			if(args.sectionShow && (ctrlWrite || ctrlReadOnly))
				return true;

			return ctrlShow;
		},

		isCtrlReadOnly: function fin_emp_payrollInterface_isCtrlReadOnly(){ 
			var args = ii.args(arguments, {
				path: {type: String}, // The path to check to see if it is authorized
				sectionWrite: {type: Boolean},
				sectionReadOnly: {type: Boolean}
			});
			
			var me = this;

			if(args.sectionWrite && !me.tabPayrollReadOnly && !me.employeeReadOnly)
				return false;

			if(me.tabPayrollWrite && !me.employeeReadOnly)
				return false;

			if(me.employeeWrite)
				return false;
			
			if(me.employeeReadOnly) return true;
			if(me.tabPayrollReadOnly) return true;
			if(args.sectionReadOnly) return true;
			
			return me.authorizer.isAuthorized(args.path);
		},
		
		resetUIElements: function fin_emp_payrollInterface_resetUIElements() {
			var me = this;			
			
			me.setControlState("EmployeeFedExemptions", me.sfFedExemptionsReadOnly, me.sfFedExemptionsShow);
			me.setControlState("MaritalStatusFederalTaxType", me.sfTaxStatusReadOnly, me.sfTaxStatusShow);
			me.setControlState("EmployeeFederalAdjustment", me.sfAdjustmentTypeReadOnly, me.sfAdjustmentTypeShow);
			me.setControlState("EmployeeFedAdjustmentAmount", me.sfAdjustmentValueReadOnly, me.sfAdjustmentValueShow);

			me.setControlState("PrimaryTaxState", me.ssPrimaryStateReadOnly, me.ssPrimaryStateShow);
			me.setControlState("MaritalStatusStateTaxTypePrimary", me.ssPrimaryStatusReadOnly, me.ssPrimaryStatusShow);
			me.setControlState("SecondaryTaxState", me.ssSecondaryStateReadOnly, me.ssSecondaryStateShow);
			me.setControlState("MaritalStatusStateTaxTypeSecondary", me.ssSecondaryStatusReadOnly, me.ssSecondaryStatusShow);
			me.setControlState("EmployeeStateExemptions", me.ssStateExemptionsReadOnly, me.ssStateExemptionsShow);
			me.setControlState("StateAdjustmentType", me.ssStateAdjustmentTypeReadOnly, me.ssStateAdjustmentTypeShow);
			me.setControlState("EmployeeStateAdjustmentAmount", me.ssStateAdjustmentValueReadOnly, me.ssStateAdjustmentValueShow);
			me.setControlState("EmployeeStateSDIAdjust", me.ssStateSDIAdjustmentTypeReadOnly, me.ssStateSDIAdjustmentTypeShow);
			me.setControlState("EmployeeStateSDIAdjustRate", me.ssStateSDIAdjustmentValueReadOnly, me.ssStateSDIAdjustmentValueShow);

			me.setControlState("EmployeeLocalTaxAdjustmentType", me.slLocalTaxAdjustmentTypeReadOnly, me.slLocalTaxAdjustmentTypeShow);
			me.setControlState("EmployeeLocalTaxAdjustmentAmount", me.slLocalTaxAdjustmentValueReadOnly, me.slLocalTaxAdjustmentValueShow);
			me.setControlState("LocalTaxCode1", me.slLocalTaxCode1ReadOnly, me.slLocalTaxCode1Show);
			me.setControlState("LocalTaxCode2", me.slLocalTaxCode2ReadOnly, me.slLocalTaxCode2Show);
			me.setControlState("LocalTaxCode3", me.slLocalTaxCode3ReadOnly, me.slLocalTaxCode3Show);
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
			
			if(args.ctrlReadOnly){
				$("#" + args.ctrlName + "Text").attr('disabled', true);
				$("#" + args.ctrlName + "Action").removeClass("iiInputAction");
			}
			if(!args.ctrlShow){
				$("#" + args.ctrlName).hide();
				$("#" + args.ctrlName + "Text").hide(); //not required for DropList
			}
		},
		
		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
			$("#divBorder").height($(window).height() - 30);
			$("#navigation").height($(window).height() - 35);
			$("#FederalDiv").height($(window).height() - 106);
			$("#StateDiv").height($(window).height() - 106);
			$("#LocalDiv").height($(window).height() - 106);
		},
		
		defineUserControls: function() {
			var args = ii.args(arguments, {});			
			var me = this;
			
			me.federalExemptions = new ui.ctl.Input.Text({
		        id: "EmployeeFedExemptions" ,
		        maxLength: 16
		    });
			
			me.federalExemptions.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.federalExemptions.getValue();
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						this.setInvalid("Please enter valid number.");
					}
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
					
					if(enteredText == '' || me.federalAdjustmentType.indexSelected <= 0) return;

					if(me.federalAdjustmentType.text.value == "Fixed Amt" || me.federalAdjustmentType.text.value == "Increased Amt") {
						if(/^\d{1,4}$/.test(enteredText) == false)
							this.setInvalid("Please enter valid amount. Example 9999");
					}
					else if((/^\d{1,2}(\.\d\d)?$/.test(enteredText) == false) && (/^\d{1,2}(\.\d)?$/.test(enteredText) == false))
						this.setInvalid("Please enter valid amount. Example 99.9");
				});
				
			me.primaryTaxState = new ui.ctl.Input.DropDown.Filtered({
				id : "PrimaryTaxState",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function() { me.primaryTaxStateSelect(); },
				required : false
		    });
			
			me.primaryTaxState.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.primaryTaxState.indexSelected == -1)
						this.setInvalid("Please select the correct Primary Tax State.");
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
						this.setInvalid("Please select the correct Marital Status.");
				});
				
			me.secTaxState = new ui.ctl.Input.DropDown.Filtered({
				id: "SecondaryTaxState",
				formatFunction: function( type ) { return type.name; }, 
				changeFunction: function() { me.secMaritalStatusSelect(); },
				required: false
		    });
			me.secTaxState.makeEnterTab()
				.setValidationMaster( me.validator );
				
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
					
					if(enteredText == '') return;

					if(/^\d+$/.test(enteredText) == false){
						this.setInvalid("Please enter valid number.");
					}
				});
			
			me.employeeStateAdjustmentType = new ui.ctl.Input.DropDown.Filtered({
				id: "StateAdjustmentType",
				formatFunction: function( type ) { return type.name; }, 
				required: false
		    });
			me.employeeStateAdjustmentType.makeEnterTab()
				.setValidationMaster( me.validator );

			me.stateAdjustmentAmount = new ui.ctl.Input.Text({
		        id: "EmployeeStateAdjustmentAmount" ,
		        maxLength: 4,
				required: false
		    });
			
			me.stateAdjustmentAmount.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {

					var enteredText = me.stateAdjustmentAmount.getValue();
					
					if(enteredText == '' || me.employeeStateAdjustmentType.indexSelected <= 0) return;

					if(me.employeeStateAdjustmentType.text.value == "Fixed Amt" 
						|| me.employeeStateAdjustmentType.text.value == "Increased Amt"
						|| me.employeeStateAdjustmentType.text.value == "Decreased Fixed Amt"
						|| me.employeeStateAdjustmentType.text.value == "NonRes"){
						if(/^\d{1,4}$/.test(enteredText) == false) {
							this.setInvalid("Please enter valid amount. Example 9999");
						}
					}
					else if((/^\d{1,2}(\.\d\d)?$/.test(enteredText) == false) && (/^\d{1,2}(\.\d)?$/.test(enteredText) == false))
						this.setInvalid("Please enter valid amount. Example 99.9");
				});	

			me.stateSDIAdjustType = new ui.ctl.Input.DropDown.Filtered({
				id: "EmployeeStateSDIAdjust",
				formatFunction: function( type ) { return type.name; }, 
				required : false
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
					
					if(enteredText == '') return;
	
					else if((/^\d+(\.\d\d)?$/.test(enteredText) == false) && (/^\d+(\.\d)?$/.test(enteredText) == false)){
						this.setInvalid("Please enter valid number.");
					}
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
				.setValidationMaster( me.validator );
			
			me.localTaxCode3 = new ui.ctl.Input.DropDown.Filtered({
		        id: "LocalTaxCode3" ,
				formatFunction: function( type ) { return type.name; },
				required: false 
		    });	
			me.localTaxCode3.makeEnterTab()
				.setValidationMaster( me.validator );
			
			me.federalExemptions.text.tabIndex = 1;
			me.maritalStatusFederalTaxType.text.tabIndex = 2;
			me.federalAdjustmentType.text.tabIndex = 3;
			me.federalAdjustmentAmount.text.tabIndex = 4;
			me.primaryTaxState.text.tabIndex = 5;
			me.maritalStatusStateTaxTypePrimary.text.tabIndex = 6;
			me.secTaxState.text.tabIndex = 7;
			me.maritalStatusStateTaxTypeSecondary.text.tabIndex = 8;
			me.stateExemptions.text.tabIndex = 9;
			me.employeeStateAdjustmentType.text.tabIndex = 11;
			me.stateAdjustmentAmount.text.tabIndex = 12;
			me.stateSDIAdjustType.text.tabIndex = 13;			
			me.stateSDIAdjustRate.text.tabIndex = 14;			
			me.localTaxAdjustmentType.text.tabIndex = 15;
			me.localTaxAdjustmentAmount.text.tabIndex = 16;
			me.localTaxCode1.text.tabIndex = 17;
			me.localTaxCode2.text.tabIndex = 18;
			me.localTaxCode3.text.tabIndex = 19;
		},
		
		resizeControls: function() {
			var me = this;
			
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
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});			
			var me = this;			
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
			
			me.federalAdjustments = [];
			me.federalAdjustmentStore = me.cache.register({
				storeId: "employeePayrollMasters",
				itemConstructor: fin.emp.FederalAdjustment,
				itemConstructorArgs: fin.emp.federalAdjustmentArgs,
				injectionArray: me.federalAdjustments	
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
			
			me.maritalStatusFederalTaxTypes = [];
			me.maritalStatusFederalTaxTypeStore = me.cache.register({
				storeId: "maritalStatusFederalTaxTypes",
				itemConstructor: fin.emp.MaritalStatusFederalTaxType,
				itemConstructorArgs: fin.emp.maritalStatusFederalTaxTypeArgs,
				injectionArray: me.maritalStatusFederalTaxTypes	
			});
			
			me.taxStates = [];
			me.stateStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.emp.TaxState,
				itemConstructorArgs: fin.emp.taxStateArgs,
				injectionArray: me.taxStates	
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
		},
		
		setReadOnly: function() {
			var me = this;
					
			me.federalExemptions.text.readOnly = true;
			me.maritalStatusFederalTaxType.text.readOnly = true;
			$("#MaritalStatusFederalTaxTypeAction").removeClass("iiInputAction");			
			me.federalAdjustmentType.text.readOnly = true;
			$("#EmployeeFederalAdjustmentAction").removeClass("iiInputAction");
			me.federalAdjustmentAmount.text.readOnly = true;
			me.primaryTaxState.text.readOnly = true;
			$("#PrimaryTaxStateAction").removeClass("iiInputAction");
			me.maritalStatusStateTaxTypePrimary.text.readOnly = true;
			$("#MaritalStatusTypeAction").removeClass("iiInputAction");
			me.secTaxState.text.readOnly = true;
			$("#SecondaryTaxStateAction").removeClass("iiInputAction");			
			me.maritalStatusStateTaxTypeSecondary.text.readOnly = true;
			$("#MaritalStatusStateTaxTypeSecondaryAction").removeClass("iiInputAction");			
			me.stateExemptions.text.readOnly = true;
			me.employeeStateAdjustmentType.text.readOnly = true;
			$("#StateAdjustmentTypeAction").removeClass("iiInputAction");
			me.stateAdjustmentAmount.text.readOnly = true;			
			me.stateSDIAdjustType.text.readOnly = true;
			$("#EmployeeStateSDIAdjustAction").removeClass("iiInputAction");			
			me.stateSDIAdjustRate.text.readOnly = true;			
			me.localTaxAdjustmentType.text.readOnly = true;
			$("#EmployeeLocalTaxAdjustmentTypeAction").removeClass("iiInputAction");
			me.localTaxAdjustmentAmount.text.readOnly = true;
			me.localTaxCode1.text.readOnly = true;
			$("#LocalTaxCode1Action").removeClass("iiInputAction");			
			me.localTaxCode2.text.readOnly = true;
			$("#LocalTaxCode2Action").removeClass("iiInputAction");			
			me.localTaxCode3.text.readOnly = true;
			$("#LocalTaxCode3Action").removeClass("iiInputAction");					
		},

		federalAdjustmentsLoaded: function(me, activeId) {
			me.federalAdjustmentType.reset();
			me.federalAdjustmentType.setData(me.federalAdjustments);

			me.maritalStatusFederalTaxType.reset();
			//me.maritalStatusFederalTaxTypes.unshift(new fin.emp.MaritalStatusFederalTaxType({ id: 0, number:0, name: "None"}));
			me.maritalStatusFederalTaxType.setData(me.maritalStatusFederalTaxTypes);			

			ii.trace("State Type Loaded", ii.traceTypes.information, "Startup");
			me.stateStore.fetch("userId:[user]", me.taxStatesLoaded, me);
		},
	
		taxStatesLoaded: function(me, activeId) {
			me.primaryTaxState.reset();
			me.primaryTaxState.setData(me.taxStates);

			me.secTaxState.reset();
			me.taxStates.unshift(new fin.emp.TaxState({ id: 0, number: 0, name: "None" }));
			me.secTaxState.setData(me.taxStates);
			
			ii.trace("Sec Tax State Loaded", ii.traceTypes.information, "Startup");
			me.employeeGeneralStore.fetch("personId:" + me.personId + ",userId:[user]", me.employeeGeneralsLoaded, me);
		},
		
		employeeGeneralsLoaded: function(me, activeId) {
			var index = 0;
			
			$.each(me.employeeGenerals, function(){ 
				ii.trace( "Employee Start Loaded", ii.traceTypes.information, "Startup");
				me.employeeGeneralId = this.id;
				me.personId = this.personId;
				me.federalExemptions.setValue(this.federalExemptions);
				me.payrollCompany = this.payrollCompany;
				
				index = ii.ajax.util.findIndexById(this.federalAdjustmentType.toString(), me.federalAdjustments);
				if(index <= 0 && index == null)
					me.federalAdjustmentType.select(0, me.federalAdjustmentType.focused);
				else
					me.federalAdjustmentType.select(index, me.federalAdjustmentType.focused);
					
				index = ii.ajax.util.findIndexById(this.maritalStatusFederalTaxType.toString(), me.maritalStatusFederalTaxTypes);
				if(index != undefined)
					me.maritalStatusFederalTaxType.select(index, me.maritalStatusFederalTaxType.focused);	
					
				me.federalAdjustmentAmount.setValue(this.federalAdjustmentAmount);
				me.stateExemptions.setValue(this.stateExemptions);
				
				index = ii.ajax.util.findIndexById(this.primaryState.toString(), me.taxStates);
				if(index >= 0 && index != null)
					me.primaryTaxState.select(index, me.primaryTaxState.focused);
					
				index = ii.ajax.util.findIndexById(this.secondaryState.toString(), me.taxStates);					
				if(index <= 0 && index == null)
					me.secTaxState.select(0, me.secTaxState.focused);
				else
					me.secTaxState.select(index, me.secTaxState.focused);
				
				//me.stateAdjustmentAmount.setValue(this.stateAdjustmentAmount.replace(".0","").replace(".00",""));
				me.stateAdjustmentAmount.setValue(this.stateAdjustmentAmount);
					
				me.stateSDIAdjustRate.setValue(this.sdiRate);
				me.localTaxAdjustmentAmount.setValue(this.localTaxAdjustmentAmount);				
			});	
			
			if(me.employeeGenerals.length <= 0) {

				index = ii.ajax.util.findIndexById(parent.fin.empMasterUi.getPersonState() + '', me.taxStates);
				if (index >= 0 && index != null)				
					me.primaryTaxState.select(index, me.primaryTaxState.focused);
			}
			
			me.primaryTaxStateSelect();				
			
			if  (parseInt(me.employeeGenerals[0].secondaryState) > 0) {
				me.secMaritalStatusSelect();
			}			
			ii.trace( "Employee End Loaded", ii.traceTypes.information, "Startup");
			me.checkValidations();						
		},
		
		primaryTaxStateSelect: function() {	
			var me = this;	
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
			
			if (primaryTaxState == 0) {
				me.secMaritalStatusSelect();				
			}
			
			me.employeeStateAdjustmentType.fetchingData();	
			me.stateAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.stateAdjustmentLoaded, me);
		},
		
		stateAdjustmentLoaded: function(me, activeId) {
			
			ii.trace("Employee State Adjustment Type Loaded", ii.traceTypes.information, "Startup");
			me.employeeStateAdjustmentType.setData([]);

			if(me.stateAdjustmentTypes.length == 0)
				me.stateAdjustmentTypes.unshift(new fin.emp.StateAdjustmentType({id: 0, number: 0, name: "None"}));

			me.employeeStateAdjustmentType.setData(me.stateAdjustmentTypes);
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].stateAdjustmentType.toString(), me.stateAdjustmentTypes);
			if(index <= 0 && index == null) {
				me.employeeStateAdjustmentType.select(0, me.employeeStateAdjustmentType.focused);
			}
			else			
				me.employeeStateAdjustmentType.select(index, me.employeeStateAdjustmentType.focused);	
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
			
			me.maritalStatusStateTaxTypePrimary.fetchingData();
			me.maritalStatusStateTaxTypePrimaryStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.priMaritalStatusLoaded, me);	
		},	
		
		priMaritalStatusLoaded: function(me, activeId) {
			
			me.maritalStatusStateTaxTypePrimary.setData([]);
			
			if(me.maritalStatusStateTaxTypePrimarys.length == 0)
				me.maritalStatusStateTaxTypePrimarys.unshift(new fin.emp.MaritalStatusType({id: 0, number: 0, name: "None"}));
						
			me.maritalStatusStateTaxTypePrimary.setData(me.maritalStatusStateTaxTypePrimarys);
			
			ii.trace("Marital StatusType Primary Loaded", ii.traceTypes.information, "Startup");
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].primaryMaritalStatusType.toString(), me.maritalStatusStateTaxTypePrimarys);
			if (index <= 0 && index == null) {
				me.maritalStatusStateTaxTypePrimary.select(0, me.maritalStatusStateTaxTypePrimary.focused);
			}
			else 
				me.maritalStatusStateTaxTypePrimary.select(index, me.maritalStatusStateTaxTypePrimary.focused);
		
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
			
			me.stateSDIAdjustType.fetchingData();
			me.sdiAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.sdiAdjustmentTypeLoaded, me);	
		},
		
		sdiAdjustmentTypeLoaded: function(me, activeId) {
			me.stateSDIAdjustType.setData([]);
			
			if(me.sdiAdjustmentTypes.length == 0)
				me.sdiAdjustmentTypes.unshift(new fin.emp.SDIAdjustmentType({id: 0, number: 0, name: "None"}));

			me.stateSDIAdjustType.setData(me.sdiAdjustmentTypes);	
			
			ii.trace("State SDI Adjust Type Loaded", ii.traceTypes.information, "Startup");
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].sdiAdjustmentType.toString(), me.sdiAdjustmentTypes);
			if (index <= 0 && index == null) {
				me.stateSDIAdjustType.select(0, me.stateSDIAdjustType.focused);
			}
			else 
				me.stateSDIAdjustType.select(index, me.stateSDIAdjustType.focused);
						
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
			
			me.localTaxAdjustmentType.fetchingData();
			me.localTaxAdjustmentTypeStore.fetch("appState:" + primaryTaxState + ",userId:[user]", me.localTaxAdjustmentTypeLoaded, me);	
		},
		
		localTaxAdjustmentTypeLoaded: function(me, activeId) {
			me.localTaxAdjustmentType.setData([]);
			
			if(me.localTaxAdjustmentTypes.length == 0)
				me.localTaxAdjustmentTypes.unshift(new fin.emp.LocalTaxAdjustmentType({id: 0, number: 0, name: "None"}));

			me.localTaxAdjustmentType.setData(me.localTaxAdjustmentTypes);
			
			ii.trace("Local Tax Adjustment Type Loaded", ii.traceTypes.information, "Startup");
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxAdjustmentType.toString(), me.localTaxAdjustmentTypes);
			if(index <= 0 && index == null){
				me.localTaxAdjustmentType.select(0, me.localTaxAdjustmentType.focused);
			}
			else
				me.localTaxAdjustmentType.select(index, me.localTaxAdjustmentType.focused);
			
			//me.payrollCompany = 1; // dummy need to fetch from EmpEmployeeGenerals
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
			
			me.localTaxCode1.fetchingData();
			me.localTaxCode2.fetchingData();
			me.localTaxCode3.fetchingData();
			me.localTaxCodeStore.fetch("payrollCompany:" + me.payrollCompany + ",appState:" + primaryTaxState + ",userId:[user]", me.localTaxCodesLoaded, me);	
		},
		
		localTaxCodesLoaded: function(me, activeId) {
			
			me.localTaxCode1.setData([]);
			me.localTaxCodes.unshift(new fin.emp.LocalTaxCode({ id: 0, number: 0, name: "None" }));
			me.localTaxCode1.setData(me.localTaxCodes);			
			
			ii.trace("Local Tax Code1 Loaded", ii.traceTypes.information, "Startup");
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode1.toString(), me.localTaxCodes);
			if(index >= 0 && index != null)
				me.localTaxCode1.select(index, me.localTaxCode1.focused);
			else	
				me.localTaxCode1.select(0, me.localTaxCode1.focused);
				
			me.localTaxCode2.setData([]);
			me.localTaxCode2.setData(me.localTaxCodes);			
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode2.toString(), me.localTaxCodes);
			if(index >= 0 && index != null)
				me.localTaxCode2.select(index, me.localTaxCode2.focused);
			else
				me.localTaxCode2.select(0, me.localTaxCode2.focused);	
			
			me.localTaxCode3.setData([]);
			me.localTaxCode3.setData(me.localTaxCodes);
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].localTaxCode3.toString(), me.localTaxCodes);
			if(index >= 0 && index != null)
				me.localTaxCode3.select(index, me.localTaxCode3.focused);
			else
				me.localTaxCode3.select(0, me.localTaxCode3.focused);
			
			$("#pageLoading").hide();
		},
		
		secMaritalStatusSelect: function() {
			var me = this;
			
			primaryTaxState = (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0);
			
			if (primaryTaxState == 0) {
				secTaxState = 0;
				me.secTaxState.select(0, me.secTaxState.focused);
			}
			else {
				secTaxState = (me.secTaxState.indexSelected >= 0 ? me.taxStates[me.secTaxState.indexSelected].id : 0);
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
			
			ii.trace("SecMarital Status Select Loaded", ii.traceTypes.information, "Startup");		
		},
		
		secMaritalStatusLoaded: function(me, activeId) {
			
			me.maritalStatusStateTaxTypeSecondary.setData([]);
			me.maritalStatusStateTaxTypeSecondary.setData(me.maritalStatusStateTaxTypeSecondarys);
			
			ii.trace( "marital StatusType Secondary Loaded", ii.traceTypes.information, "Startup");
			
			index = ii.ajax.util.findIndexById(me.employeeGenerals[0].secondaryMaritalStatusType.toString(), me.maritalStatusStateTaxTypeSecondarys);
			if(index <= 0 && index == null)
				me.maritalStatusStateTaxTypeSecondary.select(0, me.maritalStatusStateTaxTypeSecondary.focused);
			else
				me.maritalStatusStateTaxTypeSecondary.select(index, me.maritalStatusStateTaxTypeSecondary.focused);
			
			$("#pageLoading").hide();
		},
				
		checkValidations: function() {
			var me = this;		
						
			if (parent.fin.empMasterUi.employeeValidations.length > 0) {
				var blackOutPeriod = parent.fin.empMasterUi.employeeValidations[0].hrBlackOutPeriod;
				
				if (blackOutPeriod > 0 && blackOutPeriod <= 37) {
                    alert("Employee may not be added or modified during the Payroll Blackout. The Payroll Blackout start date is expected to be Sunday at 12 AM and the end date is expected to be 37 hours later. Please visit after [" + blackOutPeriod + "] hours.");
                	me.setReadOnly();
					return true;
				}
			}

			return false;		
		},

		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if( event.ctrlKey ) {
				
				switch( event.keyCode )
				{
					case 83: //Ctrl+S
						parent.fin.empMasterUi.actionSaveItem();
						processed = true;
						break;
						
					case 78: //Ctrl+N 
						parent.fin.empMasterUi.actionNewItem();
						processed = true;
						break;
						
					case 85: //Ctrl+U
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
			me.federalExemptions.setValue("");
			me.federalAdjustmentType.reset();
			me.federalAdjustmentAmount.setValue("");
			me.stateExemptions.setValue("");
			me.employeeStateAdjustmentType.reset();
			me.stateAdjustmentAmount.setValue("");
			me.primaryTaxState.reset();
			me.secTaxState.reset();
			me.stateSDIAdjustRate.setValue("");
			me.maritalStatusStateTaxTypePrimary.reset();
						
			me.validator.reset();
		},
		
		resetUIControls: function() {
			var args = ii.args(arguments,{
				flag: {type: String}
			});
			
			if(args.flag == "1"){
				$("#messageToUser").html("Saving");
				$("#pageLoading").show();
			}
			else if(args.flag == "2"){
				$("#pageLoading").hide();
			}
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var message = "";
			
			if(me.employeeReadOnly || me.tabPayrollReadOnly) return;
			
			if (me.checkValidations())
		    	return;
			
			if(me.personId <= 0){
				message += "Please select/save corresponding person record.\n";
			}
			
			if(me.primaryTaxState.indexSelected == 0){
				alert('Please select primary state.');
				return;
			}

			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) ){
				message += "In order to save, the errors on Payroll page must be corrected.\n";
			}
			
			if(message.length > 0) {
				alert(message);
				return false;
			}

			$("#messageToUser").html("Saving");
			$("#pageLoading").show();
			
			var item = new fin.emp.EmployeeGeneral({
				id: me.employeeGeneralId
				, personId: parseInt(me.personId)
				, federalExemptions: me.federalExemptions.getValue()
				, maritalStatusFederalTaxType: (me.maritalStatusFederalTaxType.indexSelected >= 0 ? me.maritalStatusFederalTaxTypes[me.maritalStatusFederalTaxType.indexSelected].id: 0)
				, federalAdjustmentType: (me.federalAdjustmentType.indexSelected >= 0 ? me.federalAdjustments[me.federalAdjustmentType.indexSelected].id : 0)
				, federalAdjustmentAmount: me.federalAdjustmentAmount.getValue()
				, primaryState: (me.primaryTaxState.indexSelected >= 0 ? me.taxStates[me.primaryTaxState.indexSelected].id : 0)
				, secondaryState: (me.secTaxState.indexSelected >= 0 ? me.taxStates[me.secTaxState.indexSelected].id : 0)
				, primaryMaritalStatusType: (me.maritalStatusStateTaxTypePrimary.indexSelected >= 0 ? me.maritalStatusStateTaxTypePrimarys[me.maritalStatusStateTaxTypePrimary.indexSelected].id : 0)
				, secondaryMaritalStatusType: (me.maritalStatusStateTaxTypeSecondary.indexSelected >= 0 ? me.maritalStatusStateTaxTypeSecondarys[me.maritalStatusStateTaxTypeSecondary.indexSelected].id : 0)
				, stateExemptions: me.stateExemptions.getValue()				
				, stateAdjustmentType: (me.employeeStateAdjustmentType.indexSelected >= 0 ? me.stateAdjustmentTypes[me.employeeStateAdjustmentType.indexSelected].id : 0)
				, stateAdjustmentAmount: me.stateAdjustmentAmount.getValue()
				, sdiAdjustmentType: (me.stateSDIAdjustType.indexSelected >= 0 ? me.sdiAdjustmentTypes[me.stateSDIAdjustType.indexSelected].id : 0)
				, sdiRate: me.stateSDIAdjustRate.getValue()
				, localTaxAdjustmentType: (me.localTaxAdjustmentType.indexSelected >= 0 ? me.localTaxAdjustmentTypes[me.localTaxAdjustmentType.indexSelected].id : 0)
				, localTaxAdjustmentAmount: me.localTaxAdjustmentAmount.getValue()
				, localTaxCode1: (me.localTaxCode1.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode1.indexSelected].id : 0)
				, localTaxCode2: (me.localTaxCode2.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode2.indexSelected].id : 0)
				, localTaxCode3: (me.localTaxCode3.indexSelected >= 0 ? me.localTaxCodes[me.localTaxCode3.indexSelected].id : 0)
				, statusType: me.employeeGenerals[0].statusType
				});

			var xml = me.saveXmlBuild(item);

			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
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
			
			xml += '<employeePayroll';
			xml += ' id="' + item.id + '"';
			xml += ' personId="' + me.personId + '"';
			xml += ' federalExemptions="' + item.federalExemptions + '"';
			xml += ' maritalStatusFederalTaxType="' + item.maritalStatusFederalTaxType + '"';
			xml += ' federalAdjustmentType="' + item.federalAdjustmentType + '"';
			xml += ' federalAdjustmentAmount="' + item.federalAdjustmentAmount + '"';
			xml += ' primaryState="' + item.primaryState + '"';
			xml += ' secondaryState="' + item.secondaryState + '"';		
			xml += ' primaryMaritalStatusType="' + item.primaryMaritalStatusType + '"';	
			xml += ' secondaryMaritalStatusType="' + item.secondaryMaritalStatusType + '"';								
			xml += ' stateExemptions="' + item.stateExemptions + '"';
			xml += ' stateAdjustmentType="' + item.stateAdjustmentType + '"';
			xml += ' stateAdjustmentAmount="' + item.stateAdjustmentAmount + '"';
			xml += ' sdiAdjustmentType="' + item.sdiAdjustmentType + '"';
			xml += ' sdiRate="' + item.sdiRate + '"';
			xml += ' localTaxAdjustmentType="' + item.localTaxAdjustmentType + '"';
			xml += ' localTaxAdjustmentAmount="' + item.localTaxAdjustmentAmount + '"';
			xml += ' localTaxCode1="' + item.localTaxCode1 + '"';
			xml += ' localTaxCode2="' + item.localTaxCode2 + '"';
			xml += ' localTaxCode3="' + item.localTaxCode3 + '"';
			xml += ' payrollStatus="T"';
			xml += ' previousPayrollStatus="T"';
			xml += ' transactionStatusType="1"';
			xml += ' statusType="'+ item.statusType +'"';
			xml += '/>';

			return xml;
		},

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id =  parseInt($(this).attr("id"),10);
			var clientId = parseInt($(this).attr("clientId"),10);
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var errorMessage = "";
			
			$("#pageLoading").hide();
			
			if(status == "success") {
				me.employeeGeneralId = parseInt(args.xmlNode.firstChild.attributes[0].nodeValue);
				
				item.id = me.employeeGeneralId;
				me.employeeGenerals[0] = item;
				
				if ($(parent)[0].frames[2].fin != undefined) {
					var empGeneralUi = $(parent)[0].frames[2].fin.empGeneralUi;
					if (empGeneralUi.newEmployeeNumber > 0) {						
						alert("Employee Number " + empGeneralUi.newEmployeeNumber + " has been created and will be transmitted to Ceridian on Monday at 1:00 PM EST.");
						empGeneralUi.newEmployeeNumber = 0;
						empGeneralUi.employeeGenerals[0].primaryState = item.primaryState;
					}					
				}				
			}
			else {
				alert('Error while updating Employee Payroll Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if(status == "invalid") {
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
	fin.empPayrollUi = new fin.emp.PayrollInterface();
	fin.empPayrollUi.resize();
}

ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.hcm.financial.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.dateDropDown", 7 );

ii.Class({
    Name: "fin.hcm.financial.UserInterface",
    Definition: {
	
		init: function () {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.gateway = ii.ajax.addGateway("hcm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.defineFormControls();
			me.configureCommunications();
			me.typesLoaded();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\HouseCodeSetup\\HouseCodes";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			$("#pageBody").show();
			me.chargebackGrid.setHeight(300);
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
		},
		
		authorizationProcess: function fin_hcm_financial_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			if (me.isAuthorized) {
				ii.timer.timing("Page displayed");
				me.session.registerFetchNotify(me.sessionLoaded, me);
				parent.fin.hcmMasterUi.setLoadCount();
				me.shippingState.fetchingData();
				me.bankState.fetchingData();
				me.year.fetchingData();
				me.stateTypeStore.fetch("userId:[user]", me.stateTypesLoaded, me);
				me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
				me.applicationStore.fetch("userId:[user]", me.applicationsLoaded, me);
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
				
			//HouseCode
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
			//SectionChargebacks
			me.sectionChargebacksShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + "\\TabFinancial\\SectionChargebacks");
			me.sectionChargebacksWrite = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionChargebacks\\Write");
			me.sectionChargebacksReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\TabFinancial\\SectionChargebacks\\Read");
			
			//ss=SectionShipping
			me.ssCompanyShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\Company", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssAddress1Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address1", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssAddress2Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address2", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssCityShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\City", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssStateShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\State", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			me.ssPostalCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionShipping\\PostalCode", me.sectionShippingShow, (me.sectionShippingWrite || me.sectionShippingReadOnly));
			
			me.ssCompanyReadOnly = true; //me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\Company\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssAddress1ReadOnly = true; // me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address1\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssAddress2ReadOnly = true; //me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\Address2\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssCityReadOnly = true; //me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\City\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssStateReadOnly = true; //me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\State\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			me.ssPostalCodeReadOnly = true; //me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionShipping\\PostalCode\\Read", me.sectionShippingWrite, me.sectionShippingReadOnly);
			
			//si=SectionInvoices
			me.siRemitToShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\RemitTo", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siTitleShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Title", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siAddress1Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address1", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siAddress2Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address2", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siCityShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\City", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siStateShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\State", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			me.siPostalCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionInvoices\\PostalCode", me.sectionInvoicesShow, (me.sectionInvoicesWrite || me.sectionInvoicesReadOnly));
			
			me.siRemitToReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\RemitTo\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siTitleReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Title\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siAddress1ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address1\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siAddress2ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\Address2\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siCityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\City\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\State\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			me.siPostalCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionInvoices\\PostalCode\\Read", me.sectionInvoicesWrite, me.sectionInvoicesReadOnly);
			
			//sf=SectionFinancial
			me.sfContractTypeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\ContractType", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfTermsOfContractShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\TermsOfContract", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBillingCycleFrequencyShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BillingCycleFrequency", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfFinancialEntityShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\FinancialEntity", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankCode", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankAccountShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankAccount", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBankNameShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankName", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfContactShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Contact", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfAddress1Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address1", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfAddress2Show = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address2", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfCityShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\City", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfStateShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\State", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfPostalCodeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\PostalCode", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfPhoneShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Phone", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfFaxShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Fax", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfEmailShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Email", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfInvoiceLogoShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\InvoiceLogo", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetTemplateShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetTemplate", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetLaborCalcMethodShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetLaborCalcMethod", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));
			me.sfBudgetComputerRelatedChargeShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetComputerRelatedCharge", me.sectionFinancialShow, (me.sectionFinancialWrite || me.sectionFinancialReadOnly));

			me.sfContractTypeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\ContractType\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfTermsOfContractReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\TermsOfContract\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBillingCycleFrequencyReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BillingCycleFrequency\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfFinancialEntityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\FinancialEntity\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankCode\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankAccountReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankAccount\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBankNameReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BankName\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfContactReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Contact\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfAddress1ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address1\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfAddress2ReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Address2\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfCityReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\City\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfStateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\State\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfPostalCodeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\PostalCode\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfPhoneReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Phone\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfFaxReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Fax\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfEmailReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\Email\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfInvoiceLogoReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\InvoiceLogo\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetTemplateReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetTemplate\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetLaborCalcMethodReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetLaborCalcMethod\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);
			me.sfBudgetComputerRelatedChargeReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\BudgetComputerRelatedCharge\\Read", me.sectionFinancialWrite, me.sectionFinancialReadOnly);

			//sc=SectionChargebacks
			me.ssChargebackGridShow = me.isCtrlVisible(me.authorizePath + "\\TabFinancial\\SectionChargebacks\\ChargebackGrid", me.sectionChargebacksShow, (me.sectionChargebacksWrite || me.sectionChargebacksReadOnly));
			me.ssChargebackGridReadOnly = me.isCtrlReadOnly(me.authorizePath + "\\TabFinancial\\SectionFinancial\\ChargebackGrid\\Read", me.sectionChargebacksWrite, me.sectionChargebacksReadOnly);
			me.resetUIElements();
			
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_hcm_financial_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		isCtrlVisible: function fin_hcm_financial_UserInterface_isCtrlVisible(){ 
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

		isCtrlReadOnly: function fin_hcm_financial_UserInterface_isCtrlReadOnly(){ 
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
		
		resetUIElements: function fin_hcm_financial_UserInterface_resetUIElements() {
			var me = this;			
			
			//SectionHouseCode
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
			
			//si=SectionFinancial
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

			if (!me.ssChargebackGridShow)
				$("#ChargebackGridContainer").hide();
			else if (me.ssChargebackGridReadOnly)
				me.createReadOnlyGrid();
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
			
			if (args.ctrlReadOnly && args.ctrlType == "Check") {
				$("#" + args.ctrlName + "Check").attr('disabled', true);
			}
			
			if (!args.ctrlShow && (args.ctrlType == "Radio" || args.ctrlType == "Check")) {
				$("#" + args.ctrlDiv).hide();
			}
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
		},
		
		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.company = new ui.ctl.Input.Text({
		        id: "Company",
		        maxLength: 256,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.shippingAddress1 = new ui.ctl.Input.Text({
		        id: "ShippingAddress1",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.shippingAddress2 = new ui.ctl.Input.Text({
		        id: "ShippingAddress2",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.shippingCity = new ui.ctl.Input.Text({
		        id: "ShippingCity",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.shippingZip = new ui.ctl.Input.Text({
		        id: "ShippingZip",
		        maxLength: 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitTo = new ui.ctl.Input.DropDown.Filtered({
		        id: "RemitTo",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.remitToChanged(); },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitToAddress1 = new ui.ctl.Input.Text({
		        id: "RemitToAddress1",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitToAddress2 = new ui.ctl.Input.Text({
		        id: "RemitToAddress2",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitToCity = new ui.ctl.Input.Text({
		        id: "RemitToCity",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitToState = new ui.ctl.Input.Text({
		        id: "RemitToState",
		        maxLength: 64,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.remitToZip = new ui.ctl.Input.Text({
		        id: "RemitToZip",
		        maxLength: 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
				
			me.contractType = new ui.ctl.Input.DropDown.Filtered({
		        id: "ContractType",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.billingCycleFrequency = new ui.ctl.Input.DropDown.Filtered({
		        id: "BillingCycleFrequency",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.financialEntity = new ui.ctl.Input.DropDown.Filtered({
		        id: "FinancialEntity",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankCodeNumber = new ui.ctl.Input.Text({
		        id: "BankCodeNumber",
		        maxLength: 50,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankAccountNumber = new ui.ctl.Input.Text({
		        id: "BankAccountNumber",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankName = new ui.ctl.Input.Text({
		        id: "BankName",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankContact = new ui.ctl.Input.Text({
		        id: "BankContact",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankAddress1 = new ui.ctl.Input.Text({
		        id: "BankAddress1",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankAddress2 = new ui.ctl.Input.Text({
		        id: "BankAddress2",
		        maxLength: 255,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankCity = new ui.ctl.Input.Text({
		        id: "BankCity",
		        maxLength: 100,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankState = new ui.ctl.Input.DropDown.Filtered({
		        id: "BankState",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.bankZip = new ui.ctl.Input.Text({
		        id: "BankZip",
		        maxLength : 10,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
		        maxLength : 14,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
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
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.budgetTemplate = new ui.ctl.Input.DropDown.Filtered({
		        id: "BudgetTemplate",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.budgetLaborCalcMethod = new ui.ctl.Input.DropDown.Filtered({
		        id: "BudgetLaborCalcMethod",
				formatFunction: function( type ) { return type.name; },
		        required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });
			
			me.budgetComputerRelatedCharge = new ui.ctl.Input.Check({
		        id: "BudgetComputerRelatedCharge",
				required: false,
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); } 
		    });

			me.year = new ui.ctl.Input.DropDown.Filtered({
                id: "Year",
                formatFunction: function( type ) { return type.title; },
                changeFunction: function() { me.yearChanged(); },
                required: false
            });

            me.year.makeEnterTab()
                .setValidationMaster( me.validator )
                .addValidation( ui.ctl.Input.Validation.required )
                .addValidation( function( isFinal, dataMap ) {

                    if (me.year.indexSelected === -1)
                        this.setInvalid("Please select correct Year.");
                });

			me.chargebackGrid = new ui.ctl.Grid({
				id: "ChargebackGrid",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); },
				deleteFunction: function() { return true; }
			});

			me.chargeAmount = new ui.ctl.Input.Text({
				id: "ChargeAmount",
				maxLength: 13,
				appendToId: "ChargebackGridControlHolder",
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
			});
			
			me.chargeAmount.makeEnterTab()
                .setValidationMaster(me.validator)
                .addValidation(ui.ctl.Input.Validation.required)
                .addValidation(function(isFinal, dataMap) {

                    var enteredText = me.chargeAmount.getValue();

                    if (enteredText === "")
                        return;

                    if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,10}(\\.\\d{1,2})?$")))
                        this.setInvalid("Please enter valid amount. Example: 99.99");
                });
				
			me.module = new ui.ctl.Input.DropDown.Filtered({
		        id: "Module",
				appendToId: "ChargebackGridControlHolder",
		        formatFunction: function( type ) { return type.name; },
				changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
		    });			
			
			me.module.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
					if (me.chargebackGrid.activeRowIndex !== -1 && $("#activeInputCheck" + me.chargebackGrid.activeRowIndex)[0].checked
						&& $(me.chargebackGrid.rows[me.chargebackGrid.activeRowIndex].getElement("chargebackRateId")).text() === "TeamLead") {
						if (me.module.indexSelected <= 0)
							this.setInvalid("Please select the correct Module.");
					}
					else
						this.valid = true;
				});
				
			me.startDate = new ui.ctl.Input.Date({
				id: "StartDate",
				appendToId: "ChargebackGridControlHolder",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
                changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
            });

            me.startDate.makeEnterTab()
                .setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
                .addValidation( function( isFinal, dataMap ) {
                    var enteredText = me.startDate.text.value;

					if (me.chargebackGrid.activeRowIndex !== -1) {
						if ($("#activeInputCheck" + me.chargebackGrid.activeRowIndex)[0].checked) {
							if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
	                        	this.setInvalid("Please enter valid date.");
							else if (new Date(enteredText) < me.periodStartDate || new Date(enteredText) > me.periodEndDate)
								this.setInvalid("Start Date should be between Fiscal Year Start and End Date.");
							else if (new Date(enteredText) < new Date(parent.fin.hcmMasterUi.houseCodeDetails[0].startDate))
								this.setInvalid("Start Date should not be less than House Code Start Date.");
						}
						else
							this.valid = true;
					}
                });

			me.endDate = new ui.ctl.Input.Date({
				id: "EndDate",
				appendToId: "ChargebackGridControlHolder",
                formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
                changeFunction: function() { parent.fin.hcmMasterUi.modified(); }
            });

            me.endDate.makeEnterTab()
                .setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
                .addValidation( function( isFinal, dataMap ) {
                    var enteredText = me.endDate.text.value;

					if (me.chargebackGrid.activeRowIndex !== -1) {
						if ($("#activeInputCheck" + me.chargebackGrid.activeRowIndex)[0].checked) {
							if (!(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$")))
	                        	this.setInvalid("Please enter valid date.");
							else if (new Date(enteredText) < new Date(me.startDate.text.value))
								this.setInvalid("End Date should not be less than Start Date.");
							else if (new Date(enteredText) < me.periodStartDate || new Date(enteredText) > me.periodEndDate)
								this.setInvalid("End Date should be between Fiscal Year Start and End Date.");
						}
						else
							this.valid = true;
					}
                });

			me.chargebackGrid.addColumn("chargebackRateId", "chargebackRateId", "Application", "Application", null, function(id) {
				return me.getApplicationTitle(id);
			});
            me.chargebackGrid.addColumn("active", "active", "active", "active", 80, function(active) {
                var rowNumber = me.chargebackGrid.rows.length - 1;
                return "<center><input type=\"checkbox\" id=\"activeInputCheck" + rowNumber + "\" class=\"iiInputCheck\" onchange=\"fin.hcmFinancialUi.actionClickItem(this);\" " + (active ? checked='checked' : '') + "/></center>";
            });
			me.chargebackGrid.addColumn("chargeAmount", "chargeAmount", "Charge Amount", "Charge Amount", 190, null, me.chargeAmount);
			me.chargebackGrid.addColumn("module", "module", "Modules", "Modules", 190, function(type) { 
				if (type.id === -1)
					return "";
				else
					return type.name; 
			}, me.module);
			me.chargebackGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 190, null, me.startDate);
			me.chargebackGrid.addColumn("endDate", "endDate", "End Date", "End Date", 190, null, me.endDate);
			me.chargebackGrid.capColumns();

			me.chargeAmount.active = false;
            me.module.active = false;
            me.startDate.active = false;
            me.endDate.active = false;

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
			me.year.text.tabIndex = 34;
		},

		createReadOnlyGrid: function() {
			var me = this;
			
			$("#ChargebackGrid").html("");
			
			me.chargebackGrid = new ui.ctl.Grid({
				id: "ChargebackGrid",
				appendToId: "divForm",
				allowAdds: false,
				deleteFunction: function() { return true; }
			});
			
			me.chargebackGrid.addColumn("chargebackRateId", "chargebackRateId", "Application", "Application", null, function(id) {
				return me.getApplicationTitle(id);
			});
            me.chargebackGrid.addColumn("active", "active", "active", "active", 80, function(active) {
                var rowNumber = me.chargebackGrid.rows.length - 1;
                return "<center><input type=\"checkbox\" id=\"activeInputCheck" + rowNumber + "\" class=\"iiInputCheck\" disabled " + (active ? checked='checked' : '') + "/></center>";
            });
			me.chargebackGrid.addColumn("chargeAmount", "chargeAmount", "Charge Amount", "Charge Amount", 190);
			me.chargebackGrid.addColumn("module", "module", "Modules", "Modules", 190, function(type) {
				if (type.id === -1)
					return "";
				else
					return type.name;
			});
			me.chargebackGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 190);
			me.chargebackGrid.addColumn("endDate", "endDate", "End Date", "End Date", 190);
			me.chargebackGrid.capColumns();
			me.chargebackGrid.setHeight(300);
		},

		resizeControls: function() {
			var me = this;
			
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
			me.year.resizeText();
			me.resize();
		},
	
		configureCommunications: function fin_hcm_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});			
			var me = this;

			me.stateTypes = [];
			me.stateTypeStore = me.cache.register({
				storeId: "stateTypes",
				itemConstructor: fin.hcm.financial.StateType,
				itemConstructorArgs: fin.hcm.financial.stateTypeArgs,
				injectionArray: me.stateTypes	
			});	

			me.remitTos = [];
			me.remitToStore = me.cache.register({
				storeId: "remitToLocations",
				itemConstructor: fin.hcm.financial.RemitTo,
				itemConstructorArgs: fin.hcm.financial.remitToArgs,
				injectionArray: me.remitTos	
			});

			me.contractTypes = [];
			me.contractTypeStore = me.cache.register({
				storeId: "financialContractMasters",
				itemConstructor: fin.hcm.financial.ContractType,
				itemConstructorArgs: fin.hcm.financial.contractTypeArgs,
				injectionArray: me.contractTypes	
			});

			me.termsOfContractTypes = [];
			me.termsOfContractTypeStore = me.cache.register({
				storeId: "termsOfContractTypes",
				itemConstructor: fin.hcm.financial.TermsOfContractType,
				itemConstructorArgs: fin.hcm.financial.termsOfContractTypeArgs,
				injectionArray: me.termsOfContractTypes	
			});

			me.billingCycleFrequencys = [];
			me.billingCycleFrequencyStore = me.cache.register({
				storeId: "billingCycleFrequencyTypes",
				itemConstructor: fin.hcm.financial.BillingCycleFrequency,
				itemConstructorArgs: fin.hcm.financial.billingCycleFrequencyArgs,
				injectionArray: me.billingCycleFrequencys	
			});			

			me.serviceLines = [];
			me.financialEntityStore = me.cache.register({
				storeId: "serviceLines",
				itemConstructor: fin.hcm.financial.FinancialEntity,
				itemConstructorArgs: fin.hcm.financial.financialEntityArgs,
				injectionArray: me.serviceLines
			});

			me.invoiceLogoTypes = [];
			me.invoiceLogoTypeStore = me.cache.register({
				storeId: "invoiceLogoTypes",
				itemConstructor: fin.hcm.financial.InvoiceLogoType,
				itemConstructorArgs: fin.hcm.financial.invoiceLogoTypeArgs,
				injectionArray: me.invoiceLogoTypes
			});

			me.budgetTemplates = [];
			me.budgetTemplateStore = me.cache.register({
				storeId: "budgetTemplates",
				itemConstructor: fin.hcm.financial.BudgetTemplate,
				itemConstructorArgs: fin.hcm.financial.budgetTemplateArgs,
				injectionArray: me.budgetTemplates
			});
			
			me.budgetLaborCalcMethods = [];
			me.budgetLaborCalcMethodStore = me.cache.register({
				storeId: "budgetLaborCalcMethods",
				itemConstructor: fin.hcm.financial.BudgetLaborCalcMethod,
				itemConstructorArgs: fin.hcm.financial.budgetLaborCalcMethodArgs,
				injectionArray: me.budgetLaborCalcMethods
			});

			me.fiscalYears = [];
            me.fiscalYearStore = me.cache.register({
                storeId: "fiscalYears",
                itemConstructor: fin.hcm.financial.FiscalYear,
                itemConstructorArgs: fin.hcm.financial.fiscalYearArgs,
                injectionArray: me.fiscalYears
            });

			me.fiscalPeriods = [];
			me.fiscalPeriodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.hcm.financial.FiscalPeriod,
				itemConstructorArgs: fin.hcm.financial.fiscalPeriodArgs,
				injectionArray: me.fiscalPeriods
			});

			me.applications = [];
            me.applicationStore = me.cache.register({
                storeId: "applications",
                itemConstructor: fin.hcm.financial.Application,
                itemConstructorArgs: fin.hcm.financial.applicationArgs,
                injectionArray: me.applications
            });

			me.modules = [];
//            me.moduleStore = me.cache.register({
//                storeId: "modules",
//                itemConstructor: fin.hcm.financial.Module,
//                itemConstructorArgs: fin.hcm.financial.moduleArgs,
//                injectionArray: me.modules
//            });

			me.chargebackRates = [];
            me.chargebackRateStore = me.cache.register({
                storeId: "chargebackRates",
                itemConstructor: fin.hcm.financial.ChargebackRate,
                itemConstructorArgs: fin.hcm.financial.chargebackRateArgs,
                injectionArray: me.chargebackRates,
				lookupSpec: {application: me.applications}
            });

			me.appChargebacks = [];
			me.appChargebackStore = me.cache.register({
				storeId: "appChargebacks",
				itemConstructor: fin.hcm.financial.AppChargeback,
				itemConstructorArgs: fin.hcm.financial.appChargebackArgs,
				injectionArray: me.appChargebacks,
				lookupSpec: {module: me.modules}
			});
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

		typesLoaded: function() {
            var me = this;

		    me.modules.push(new fin.hcm.financial.Module(-1, "***Select Module***"));
            me.modules.push(new fin.hcm.financial.Module(0, "Not Used"));
            me.modules.push(new fin.hcm.financial.Module(1, "1"));
			me.modules.push(new fin.hcm.financial.Module(2, "2"));
			me.modules.push(new fin.hcm.financial.Module(3, "3"));
			me.modules.push(new fin.hcm.financial.Module(4, "4"));
            me.module.setData(me.modules);
        },

		stateTypesLoaded: function(me,activeId) {

			me.stateTypes.unshift(new fin.hcm.financial.StateType({ id: 0, name: "None" }));
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

			me.remitTos.unshift(new fin.hcm.financial.RemitTo({ id: 0, name: "None" }));
			me.remitTo.reset();
			me.remitTo.setData(me.remitTos);

			me.contractTypes.unshift(new fin.hcm.financial.ContractType({ id: 0, name: "None" }));
			me.contractType.reset();
			me.contractType.setData(me.contractTypes);

			me.termsOfContractTypes.unshift(new fin.hcm.financial.TermsOfContractType({ id: 0, name: "None" }));
			me.termsOfContract.reset();
			me.termsOfContract.setData(me.termsOfContractTypes);

			me.billingCycleFrequencys.unshift(new fin.hcm.financial.BillingCycleFrequency({ id: 0, name: "None" }));
			me.billingCycleFrequency.reset();
			me.billingCycleFrequency.setData(me.billingCycleFrequencys);

			me.invoiceLogo.reset();
			me.invoiceLogo.setData(me.invoiceLogoTypes);
			
			me.budgetTemplates.unshift(new fin.hcm.financial.BudgetTemplate({ id: 0, name: "None" }));
			me.budgetTemplate.reset();
			me.budgetTemplate.setData(me.budgetTemplates);
			
			me.budgetLaborCalcMethods.unshift(new fin.hcm.financial.BudgetLaborCalcMethod({ id: 0, name: "None" }));
			me.budgetLaborCalcMethod.reset();
			me.budgetLaborCalcMethod.setData(me.budgetLaborCalcMethods);

			me.financialEntities = [];

			for (var index = 0; index < me.serviceLines.length; index++) {
				if (me.serviceLines[index].financialEntity) {
					var item = new fin.hcm.financial.FinancialEntity({ id: me.serviceLines[index].id, name:me.serviceLines[index].name });
					me.financialEntities.push(item);
				}
			}

			me.financialEntity.reset();
			me.financialEntity.setData(me.financialEntities);

			me.houseCodeFinancialsLoaded();
		},
		
		houseCodeFinancialsLoaded: function() {
			var args = ii.args(arguments,{});
			var index = 0;
			var me = this;
			
			if (parent.fin.hcmMasterUi == undefined || parent.fin.hcmMasterUi.houseCodeDetails[0] == undefined) return;

			var houseCode = parent.fin.hcmMasterUi.houseCodeDetails[0];

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
			if(index >= 0 && index != undefined)
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

			parent.fin.hcmMasterUi.checkLoadCount();
			if (parent.parent.fin.appUI.modified)
				parent.fin.hcmMasterUi.setStatus("Edit");
			me.resizeControls();
		},

		fiscalYearsLoaded: function(me, activeId) {

            me.year.setData(me.fiscalYears);
            me.year.select(0, me.year.focused);
			me.yearChanged();
        },

		applicationsLoaded: function(me, activeId) {

        },

		chargebacksLoaded: function(me, activeId) {

			me.appChargebackStore.fetch("userId:[user],houseCodeId:" + parent.parent.fin.appUI.houseCodeId + ",yearId:" + me.fiscalYears[me.year.indexSelected].id, me.appChargebacksLoaded, me);
        },
		
		appChargebacksLoaded: function(me, activeId) {

			for (var index = 0; index < me.chargebackRates.length; index++) {
	            var result = $.grep(me.appChargebacks, function(item) { return item.chargebackRateId === me.chargebackRates[index].id; });
	            if (result.length === 0) {
					var item = new fin.hcm.financial.AppChargeback(0
						, parent.parent.fin.appUI.houseCodeId
						, me.fiscalYears[me.year.indexSelected].id
						, me.chargebackRates[index].id
						, false
						, me.chargebackRates[index].periodCharge
						, me.modules[0]
						, ""
						, ""
						);
					me.appChargebacks.push(item);
				}
      		}

			me.chargebackGrid.setData(me.appChargebacks);
			parent.fin.hcmMasterUi.checkLoadCount();
		},

		yearChanged: function() {
            var me = this;

            if (me.year.indexSelected === -1)
                return;

			if (me.chargebackGrid.activeRowIndex !== -1)
                me.chargebackGrid.body.deselect(me.chargebackGrid.activeRowIndex, true);
			parent.fin.hcmMasterUi.setLoadCount();
			me.fiscalPeriodStore.fetch("userId:[user],fiscalYearId:" + me.fiscalYears[me.year.indexSelected].id, me.fiscalPeriodsLoaded, me);
            me.chargebackRateStore.fetch("userId:[user],yearId:" + me.fiscalYears[me.year.indexSelected].id, me.chargebacksLoaded, me);
        },

		fiscalPeriodsLoaded: function(me, activeId) {

			if (me.fiscalPeriods.length > 0) {
				me.periodStartDate = me.fiscalPeriods[0].startDate;
				me.periodEndDate = me.fiscalPeriods[me.fiscalPeriods.length - 1].endDate;
			}
		},

		getApplicationTitle: function(id) {
			var me = this;

			for (var index = 0; index < me.chargebackRates.length; index++) {
				if (me.chargebackRates[index].id === id) {
					for (var iIndex = 0; iIndex < me.applications.length; iIndex++) {
						if (me.chargebackRates[index].application.id === me.applications[iIndex].id)
							return me.applications[iIndex].title;
					}
				}
			}
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
		
		itemSelect: function() {
	        var args = ii.args(arguments, {
	            index: {type: Number}
	        });
            var me = this;
            var index = args.index;
			var id =  me.chargebackGrid.data[index].chargebackRateId;
			var title = "";
			
			outerLoop:
			for (var index = 0; index < me.chargebackRates.length; index++) {
				if (me.chargebackRates[index].id === id) {
					for (var iIndex = 0; iIndex < me.applications.length; iIndex++) {
						if (me.chargebackRates[index].application.id === me.applications[iIndex].id) {
							title = me.applications[iIndex].title;
							break outerLoop;
						}
					}
				}
			}

			me.chargebackGrid.data[index].modified = true;
			if (title !== "TeamLead")
				$("#Module").hide();
        },
		
		actionClickItem: function(objCheckBox) {
			var me = this;
			var rowNumber = parseInt(objCheckBox.id.replace("activeInputCheck", ""), 10);
    		var title = $(me.chargebackGrid.rows[rowNumber].getElement("chargebackRateId")).text();

			parent.fin.hcmMasterUi.modified();
			me.appChargebacks[rowNumber].active = objCheckBox.checked;
			if (objCheckBox.checked) {
				for (var index = 0; index < me.appChargebacks.length; index++) {
					if (index !== rowNumber) {
						var tempTitle = $(me.chargebackGrid.rows[index].getElement("chargebackRateId")).text();
						if ((title === "TeamFin and TeamCoach" || title === "TeamCoach Only") && (tempTitle === "TeamFin and TeamCoach" || tempTitle === "TeamCoach Only") && $("#activeInputCheck" + index)[0].checked) {
							$("#activeInputCheck" + index)[0].checked = false;
							me.appChargebacks[index].active = false;
							me.appChargebacks[index].modified = true;
						}
					}
				}
			}
		}
	}
});

function main() {
	fin.hcmFinancialUi = new fin.hcm.financial.UserInterface();
	fin.hcmFinancialUi.resize();
}
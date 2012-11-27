ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.bud.contractBilling.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);
ii.Style( "fin.cmn.usr.dateDropDown" , 9);

ii.Class({
    Name: "fin.bud.contractBilling.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;	
			var queryStringArgs = {}; 
			var queryStringHouseCodeInfo = location.search.substring(1); 
			var pairs = queryStringHouseCodeInfo.split("&");
			
			for(var i = 0; i < pairs.length; i++) { 
				var pos = pairs[i].indexOf('='); 
				if (pos == -1) continue; 
				var argName = pairs[i].substring(0, pos); 
				var value = pairs[i].substring(pos + 1); 
				queryStringArgs[argName] = unescape(value); 
			} 
			
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\contractBilling";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.houseCodeId = queryStringArgs["houseCode"];
			me.fiscalYearId = queryStringArgs["fiscalYearId"];
			me.fiscalYearText = queryStringArgs["fiscalYearText"];
			
			me.defineFormControls();				
			me.configureCommunications();							
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			
			me.houseCodeStore.fetch("userId:[user],unitId:" + me.houseCodeId + ",", me.houseCodeBillingContractTypesLoaded, me);		
			me.billingPeriodStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId + ",fiscalYearId:" + me.fiscalYearId + ",", me.billingPeriodLoaded, me);
			me.periodEndDateStore.fetch("userId:[user],fiscalYearId:" + me.fiscalYearId + ",", me.periodEndDatesLoaded, me);
			me.budIncomeTypeStore.fetch("userId:[user],houseCodeId:" + me.houseCodeId + ",fiscalYearId:" + me.fiscalYearId + ",", me.budIncomeTypeLoaded, me);
		},
		
		authorizationProcess: function fin_bud_contractBilling_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_contractBilling_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.rate = new ui.ctl.Input.Text({
				id: "Rate"
			});
			
			me.percent = new ui.ctl.Input.Text({
				id: "Percent"
			});
			
			me.dateEffective = new ui.ctl.Input.Text({
				id: "DateEffective"
			});
			
			me.periodrate = new ui.ctl.Grid({
				id: "Periodrate",
				appendToId: "divForm",
				allowAdds: true
			});
			
			me.periodrate.addColumn("periodEndDate", "periodEndDate", "Period End Rate", "Period End Rate", null);
			me.periodrate.addColumn("period1", "period1", "Period 1", "Period 1", 90);
			me.periodrate.addColumn("period2", "period2", "Period 2", "Period 2", 90);
			me.periodrate.addColumn("period3", "period3", "Period 3", "Period 3", 90);
			me.periodrate.addColumn("period4", "period4", "Period 4", "Period 4", 90);
			me.periodrate.addColumn("period5", "period5", "Period 5", "Period 5", 90);
			me.periodrate.addColumn("period6", "period6", "Period 6", "Period 6", 90);
			me.periodrate.addColumn("period7", "period7", "Period 7", "Period 7", 90);
			me.periodrate.addColumn("period8", "period8", "Period 8", "Period 8", 90);
			me.periodrate.addColumn("period9", "period9", "Period 9", "Period 9", 90);
			me.periodrate.addColumn("period10", "period10", "Period 10", "Period 10", 90);
			me.periodrate.addColumn("period11", "period11", "Period 11", "Period 11", 90);
			me.periodrate.addColumn("period12", "period12", "Period 12", "Period 12", 90);
			me.periodrate.addColumn("period13", "period13", "Period 13", "Period 13", 90);
			me.periodrate.addColumn("period14", "period14", "Period 14", "Period 14", 90);
			me.periodrate.capColumns();
			me.periodrate.setHeight($(me.periodrate.element).parent().height() - 2);			
			
			me.typeIncomCost = new ui.ctl.Grid({
				id: "TypeIncomCost",
				appendToId: "divForm",
				allowAdds: false
			});
			
			me.typeIncomCost.addColumn("description", "description", "Type Of Income Cost", "Type Of Income Cost", null);
			me.typeIncomCost.addColumn("period1Amount", "period1Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period2Amount", "period2Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period3Amount", "period3Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period4Amount", "period4Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period5Amount", "period5Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period6Amount", "period6Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period7Amount", "period7Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period8Amount", "period8Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period9Amount", "period9Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period10Amount", "period10Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period11Amount", "period11Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period12Amount", "period12Amount", " ", " ", 90);
			me.typeIncomCost.addColumn("period13Amount", "period13Amount", " ", " ", 90);		
			me.typeIncomCost.addColumn("period14Amount", "period14Amount", " ", " ", 90);			
			me.typeIncomCost.capColumns();
			me.typeIncomCost.setHeight($(me.typeIncomCost.element).parent().height() - 2);
		},
		
		configureCommunications:function() {			
			var me = this;	
			
			me.billingPeriods = [];
			me.billingPeriodStore = me.cache.register({
				storeId: "budBillingPeriods",
				itemConstructor: fin.bud.contractBilling.BudBillingPeriod,
				itemConstructorArgs: fin.bud.contractBilling.budBillingPeriodArgs,
				injectionArray: me.billingPeriods
			});	
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "houseCodes",
				itemConstructor: fin.bud.contractBilling.HcmHouseCode,
				itemConstructorArgs: fin.bud.contractBilling.hcmHouseCodeArgs,
				injectionArray: me.houseCodes
			});		
			
			me.periodEndDates = [];
			me.periodEndDateStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.bud.contractBilling.PeriodEndDate,
				itemConstructorArgs: fin.bud.contractBilling.periodEndDateArgs,
				injectionArray: me.periodEndDates
			});	
			
			me.budIncomeTypes = [];
			me.budIncomeTypeStore = me.cache.register({
				storeId: "budIncomeTypes",
				itemConstructor: fin.bud.contractBilling.BudIncomeType,
				itemConstructorArgs: fin.bud.contractBilling.budIncomeTypeArgs,
				injectionArray: me.budIncomeTypes
			});				
		},
			
		houseCodeBillingContractTypesLoaded: function(me, activeId) {			
			
			$("#BillingCycleFrequencyType").text(me.houseCodes[0].billingCycleFrequencyType);
		},		
		
		billingPeriodLoaded: function(me, activeId) {	
			 
			var percentIncrease;
			var dateEffect;            
			var increaseInDollars;
			var currentRate;			
			var currDailyRate;
			var currPeriodRate;			 
			var newRate;
			var newDailyRate;
			var newPeriodRate;
            
			if (me.billingPeriods[0] != undefined) {
				
				me.currentRate = me.billingPeriods[0].rate;
				me.percentIncrease = me.billingPeriods[0].percentIncrease;
				me.increaseInDollars = me.currentRate * me.percentIncrease;
				me.dateEffect = me.billingPeriods[0].dateEffective;
				me.newRate = parseFloat(me.currentRate) + parseFloat(me.increaseInDollars);
			}
			else {
				 me.currentRate = 0;
				 me.percentIncrease = 0;
				 me.increaseInDollars = 0;
			 	 me.currentRate = 0;
				 me.currDailyRate = 0;
    	 		 me.currPeriodRate = 0;
		 		 me.newRate = 0;
		 		 me.newDailyRate = 0;
		 		 me.newPeriodRate = 0;
			}
				
			me.rate.setValue(me.currentRate);
			me.percent.setValue(me.percentIncrease);
			me.dateEffective.setValue(me.dateEffect);
			$("#IncreaseDollars").text(me.increaseInDollars);
			$("#NewRate").text(me.newRate);
			
			if ($("#BillingCycleFrequencyType").text == "Monthly") {
			
				me.currDailyRate = me.currentRate * 12 / 365;
	            me.currPeriodRate = me.currDailyRate * 28;
	            me.increaseInDollars = me.currentRate * me.percentIncrease;
	           
	            me.newRate = me.currentRate + me.increaseInDollars;
	            me.newDailyRate =  me.newRate * 12 / 365;
	            me.newPeriodRate =  me.newDailyRate * 28;
			}
			else if ($("#BillingCycleFrequencyType").text == "Period") {
			
				me.currDailyRate = me.currentRate / 28;
	            me.currPeriodRate = me.currDailyRate * 28;
	            me.increaseInDollars = me.currentRate * me.percentIncrease;
	           
	            me.newRate = me.currentRate + me.increaseInDollars;
	            me.newDailyRate =  me.newRate / 28;
	            me.newPeriodRate =  me.newDailyRate * 28;
			}
			else if ($("#BillingCycleFrequencyType").text == "BiWeekly") {
			
				me.currDailyRate = me.currentRate / 14;
	            me.currPeriodRate = me.currDailyRate * 28;
	            me.increaseInDollars = me.currentRate * me.percentIncrease;
	           
	            me.newRate = me.currentRate + me.increaseInDollars;
	            me.newDailyRate =  me.newRate / 14;
	            me.newPeriodRate =  me.newDailyRate * 28;
			}
			else if ($("#BillingCycleFrequencyType").text == "SemiMonthly") {
			
				me.currDailyRate = me.currentRate * 24 / 365;
	            me.currPeriodRate = me.currDailyRate * 28;
	            me.increaseInDollars = me.currentRate * me.percentIncrease;
	           
	            me.newRate = me.currentRate + me.increaseInDollars;
	            me.newDailyRate =  me.newRate * 28 / 365;
	            me.newPeriodRate =  me.newDailyRate * 28;
			}	
		},
			
		periodEndDatesLoaded: function(me, activeId ){
			
			var periods = [];
			var period1;
			var period2;
			var period3;
			var period4;
			var period5;
			var period6;
			var period7;
			var period8;
			var period9;
			var period10;
			var period11;
			var period12;
			var period13;	
			var period14;		
			
			for (var index = 0; index < me.periodEndDates.length; index++) {
				
				if (me.periodEndDates[index].title == 1) 
					period1 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 2) 
					period2 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 3) 
					period3 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 4) 
					period4 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 5) 
					period5 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 6) 
					period6 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 7) 
					period7 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 8) 
					period8 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 9) 
					period9 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 10) 
					period10 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 11) 
					period11 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 12) 
					period12 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 13) 
					period13 = me.periodEndDates[index].endDate;
				else if	(me.periodEndDates[index].title == 14) 
					period14 = me.periodEndDates[index].endDate;					
			}			
			
			 periods = new fin.bud.contractBilling.Period(
				me.fiscalYearText + ' ' + 'Period End Dates'
				, period1
				, period2
				, period3
				, period4
				, period5
				, period6
				, period7
				, period8
				, period9
				, period10
				, period11		
				, period12
				, period13	
				, period14				
				);			
			
			me.periodrate.setData(periods);			
		},		
		
		budIncomeTypeLoaded: function(me, activeId) {
			
			me.typeIncomCost.setData(me.budIncomeTypes);	
			$("#pageLoading").hide();		
		}		
	
	}
});

function main() {
	var contractBillingUI = new fin.bud.contractBilling.UserInterface();
	contractBillingUI.resize();
}

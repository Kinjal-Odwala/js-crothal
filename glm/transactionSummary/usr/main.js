ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );

ii.Import( "fin.glm.transactionSummary.usr.defs" );
ii.Import("fin.cmn.usr.houseCodeSearch");

ii.Class({
    Name: "fin.glm.transactionSummary.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
	Definition: {
		
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;	
			
			me.tsRowId = 0;
			me.totalWeek = 0 ;
			flashRowLength = 0;
			me.actualAmount = 0;
			me.currentPeriod = 0;
			me.PeriodStartEnd = "";
			me.startFiscalYear = 0;
			me.currentFiscalYear = 0;
			me.houseCodeJobIdSelected = 0;

			if(!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "glm\\transactionSummary";
			me.authorizer.authorize(me.authorizePath,
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.session = new ii.Session(me.cache);
			me.session.displaySetStandard();

			me.defineFormControls();			
			me.configureCommunications();		
				
			me.validator = new ui.ctl.Input.Validation.Master();	//@iiDoc {Property:ui.ctl.Input.Validation.Master}

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();

			$(window).bind("resize", me, me.resize);
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
		},
		
		authorizationProcess: function fin_glm_transactionSummary_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			me.session.fetchOnce(me.sessionLoaded, me);
		},	
		
		sessionLoaded: function fin_glm_transactionSummary_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var me = this;
			var width = document.documentElement.clientWidth - 6;
			
			if ($("#TransactionSummaryGrid").width() > width) 
				width = $("#TransactionSummaryGrid").width();
			
			if (document.documentElement.clientWidth < 880) {
				$("#dropDownJobInfo").width(90);
				fin.transactionSummaryUI.jobInfo.resizeText();
			}					
			else
				$("#dropDownJobInfo").width(190);
			
			$("#pageHeader").width(width);
			$("#summaryGrid").height($(window).height() - 90);
		},
		
		defineFormControls: function() {
			var me = this;
						
			me.loadButton = new ui.ctl.buttons.Sizeable({
				id: "LoadButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.transactionSummaryLoaded(); },
				hasHotState: true
			});
			
			me.period = new ui.ctl.Input.DropDown.Filtered({
				id: "Period",
				formatFunction: function( type ) { return type.name; }
			});
			
			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
				id: "FiscalYear",
				formatFunction: function( type ) { return type.name; }
			});	
			
			me.jobInfo = new ui.ctl.Input.DropDown.Filtered({
				id: "JobInfo",
				formatFunction: function( type ) { return (type.jobTitle == "All" ? type.jobTitle : type.jobNumber + " - " + type.jobTitle); },
				changeFunction: function() { 

					me.houseCodeJobIdSelected = 0;
					if(me.jobInfo.indexSelected >= 0)
						me.houseCodeJobIdSelected = me.houseCodeJobs[me.jobInfo.indexSelected].id;
	
						if(me.jobInfo.indexSelected >= 0)
							$("#JobInfoText").attr("title", me.houseCodeJobs[me.jobInfo.indexSelected].jobNumber + " - " + me.houseCodeJobs[me.jobInfo.indexSelected].jobTitle);
				}
			});
					
			me.transactionSummary = new ui.ctl.Grid({
				id: "TransactionSummary",
				appendToId: "divForm",
				allowAdds: false
			});
			
			me.anchorCancel = new ui.ctl.buttons.Sizeable({
				id: "AnchorCancel",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Cancel&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionCancelItem(); },
				hasHotState: true
			});	
			
			$("#JDETransactionSummary").hide();
			$("#JDETransactionDetailSummary").hide();
		},
		
		resizeControls: function() {
			var me = this;
			
			me.period.resizeText();
			me.fiscalYear.resizeText();
			me.jobInfo.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.glm.transactionSummary.HirNode,
				itemConstructorArgs: fin.glm.transactionSummary.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.transactionSummaries = [];
			me.transactionSummaryStore = me.cache.register({
				storeId: "transactionSummarys",
				itemConstructor: fin.glm.transactionSummary.TransactionSummary,
				itemConstructorArgs: fin.glm.transactionSummary.transactionSummaryArgs,
				injectionArray: me.transactionSummaries
			});	
			
			me.jdeTransactionSummaries = [];
			me.jdeTransactionSummaryStore = me.cache.register({
				storeId: "appJDEGLTransactions",
				itemConstructor: fin.glm.transactionSummary.JDETransaction,
				itemConstructorArgs: fin.glm.transactionSummary.jdeTransactionArgs,
				injectionArray: me.jdeTransactionSummaries
			});	
			
			me.jdeTransactionSummaryDetails = [];
			me.jdeTransactionSummaryDetailStore = me.cache.register({
				storeId: "appJDEGLTransactionDetails",
				itemConstructor: fin.glm.transactionSummary.JDETransactionDetail,
				itemConstructorArgs: fin.glm.transactionSummary.jdeTransactionDetailArgs,
				injectionArray: me.jdeTransactionSummaryDetails
			});	
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.glm.transactionSummary.HouseCode,
				itemConstructorArgs: fin.glm.transactionSummary.houseCodeArgs,
				injectionArray: me.houseCodes
			});	

			me.weekPeriodYears = [];
			me.weekPeriodYearStore = me.cache.register({
				storeId: "weekPeriodYears",
				itemConstructor: fin.glm.transactionSummary.WeekPeriodYear,
				itemConstructorArgs: fin.glm.transactionSummary.weekPeriodYearArgs,
				injectionArray: me.weekPeriodYears
			});

			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYearMasters",
				itemConstructor: fin.glm.transactionSummary.FiscalYear,
				itemConstructorArgs: fin.glm.transactionSummary.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});		
				
			me.periods = [];
			me.periodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.glm.transactionSummary.Period,
				itemConstructorArgs: fin.glm.transactionSummary.periodArgs,
				injectionArray: me.periods
			});
			
			me.payPeriods = [];
			me.payPeriodStore = me.cache.register({
				storeId: "houseCodePayPeriods",
				itemConstructor: fin.glm.transactionSummary.PayPeriod,
				itemConstructorArgs: fin.glm.transactionSummary.payPeriodArgs,
				injectionArray: me.payPeriods
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.glm.transactionSummary.HouseCodeJob,
				itemConstructorArgs: fin.glm.transactionSummary.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
		},
		
		houseCodesLoaded: function(me, activeId) { //houseCodes
			
			ii.trace( "Unit - UnitsLoaded", ii.traceTypes.information, "Startup");

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);			
	
			me.fiscalYear.fetchingData();
			me.period.fetchingData();
			me.fiscalYearStore.fetch("userId:[user],", me.yearsLoaded, me);			
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.jobInfo.fetchingData();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
						
			me.houseCodeJobs.unshift(new fin.glm.transactionSummary.HouseCodeJob({ id: 0, jobNumber: "", jobTitle: "All" }));
			
			me.jobInfo.reset();
			me.jobInfo.setData(me.houseCodeJobs);			
			me.jobInfo.select(0, me.jobInfo.focused);
		},
		
		yearsLoaded: function(me, activeId) {
			
			me.fiscalYear.reset();
			me.fiscalYear.setData(me.fiscalYears);
			
			me.period.reset();
			me.period.setData(me.periods);
			
			me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
		},
		
		weekPeriodYearsLoaded: function(me, activeId) {

			var index = 0;
			
			index = ii.ajax.util.findIndexById(me.weekPeriodYears[0].period + '', me.periods);
			
			if (index != undefined)
				me.period.select(index, me.period.focused);
			
			for(index = 0; index < me.fiscalYears.length; index++){
				if (me.weekPeriodYears[0].fiscalYear == me.fiscalYears[index].name) {
					me.fiscalYear.select(index, me.fiscalYear.focused);					
					me.startFiscalYear = me.weekPeriodYears[0].fiscalYear;
					me.totalWeek = me.weekPeriodYears[0].totalWeek;
					
					break;
				}
			}
			
			$("#pageLoading").show();
			//debugger;
			me.currentPeriod = me.period.lastBlurValue;
			me.currentFiscalYear = me.fiscalYears[me.fiscalYear.indexSelected].name;
			
			me.PeriodStartEnd = "Weeks: ("+ me.weekPeriodYears[0].periodStartDate.substring(0,5) + " - "+ me.weekPeriodYears[0].periodEndDate.substring(0,5) +")";
			
			$("#PeriodStartEnd").text(me.PeriodStartEnd);
			
			me.payPeriodStore.fetch("hcmHouseCode:" + parent.fin.appUI.houseCodeId + ",year:" + me.currentFiscalYear + ",period:" + me.currentPeriod + ",week:1,userId:[user]", me.payPeriodLoad, me);
		},		
		
		payPeriodLoad: function(me,activeId) {
			
			me.payPeriodFrequency = me.payPeriods[0].payPeriodFrequency;
			me.payPeriodStartDate = me.payPeriods[0].payPeriodStartDate;
			me.payPeriodEndDate = me.payPeriods[0].payPeriodEndDate;
			me.allowPayrollModification = me.payPeriods[0].allowPayrollModification;

			me.transactionSummaryStore.fetch("hcmHouseCode:" + parent.fin.appUI.houseCodeId + ",houseCodeJob:" + me.houseCodeJobIdSelected + ",fiscalYear:" + me.currentFiscalYear + ",period:" + me.currentPeriod + ",userId:[user]", me.transactionSummaryGridLoaded, me);
		},
		
		transactionSummaryGridLoaded: function(me, activeId) {

			var rowHtml = "";
			var index = 0;			
			
			me.tsRow = [];	
			me.glHeader = "";
			me.fscAcccTitle = "";
			me.wk1Amount = 0;
			me.wk2Amount = 0;
			me.wk3Amount = 0;
			me.wk4Amount = 0;
			me.wk5Amount = 0;
			me.sumWKAmount = 0;
			me.budgetAmount = 0;
			me.variance = 0;
			me.prevPeriodAmount = 0;
			me.forecastAmount = 0;
			me.forecastAmountProj = 0;
			
			me.id = 0;
			me.wk1TAmount = 0;
			me.wk2TAmount = 0;
			me.wk3TAmount = 0;
			me.wk4TAmount = 0;
			me.wk5TAmount = 0;
			me.sumTWKAmount = 0;
			me.budgetTAmount = 0;
			me.varianceT = 0;
			me.prevTPeriodAmount = 0;
			me.forecastTAmount = 0;
			me.forecastTAmountProj = 0;
			
			function checkNeg(amount) {
				if (amount < 0)
					amount = (amount*-1);	
				else
					amount = (amount*-1);		
				
				return amount.toString();			
			};
			
			function changeColor(amount) {
				if (amount < 0)
					amount = -(amount);	
				
				return amount.toString();			
			};
			
			if (me.totalWeek > 4) {
				
				$("#PeriodStartEnd").each(function() { this.width = 305; this.colSpan = 5; });
				
				rowHtml += "<tr>"
				rowHtml += '<td class="grid_header" width="275px">Item(s)</td>';
				rowHtml += '<td class="grid_header" width="50px">Code</td>';
				rowHtml += '<td class="grid_header" width="60px">1</td>';
				rowHtml += '<td class="grid_header" width="60px">2</td>';
				rowHtml += '<td class="grid_header" width="60px">3</td>';
				rowHtml += '<td class="grid_header" width="60px">4</td>';
				rowHtml += '<td id="wk5show" class="grid_header" width="65px">5</td>';
				rowHtml += '<td class="grid_header" width="75px">Total</td>';
				rowHtml += '<td class="grid_header" width="80px">Budget</td>';
				rowHtml += '<td class="grid_header" width="80px">Variance</td>';
				rowHtml += '<td class="grid_header" width="80px" title="Previous Period Actual">Previous Period Actual</td>';
				rowHtml += '<td class="grid_header" width="80px">' + me.currentPeriod + '</td>';
				rowHtml += '<td class="grid_header" width="80px">' + ((parseInt(me.currentPeriod)) != me.period.data.length ? (parseInt(me.currentPeriod) + 1).toString() : 1)  + '</td>';
				rowHtml += "</tr>"
			}	
			else {
				
				$("#PeriodStartEnd").each(function() { this.width = 240; this.colSpan = 4; });
				
				rowHtml += "<tr>"
				rowHtml += '<td class="grid_header" width="275px">Item(s)</td>';
				rowHtml += '<td class="grid_header" width="50px">Code</td>';
				rowHtml += '<td class="grid_header" width="60px">1</td>';
				rowHtml += '<td class="grid_header" width="60px">2</td>';
				rowHtml += '<td class="grid_header" width="60px">3</td>';
				rowHtml += '<td class="grid_header" width="60px">4</td>';
				rowHtml += '<td class="grid_header" width="75px">Total</td>';
				rowHtml += '<td class="grid_header" width="80px">Budget</td>';
				rowHtml += '<td class="grid_header" width="80px">Variance</td>';
				rowHtml += '<td class="grid_header" width="80px" title="Previous Period Actual">Previous Period Actual</td>';
				rowHtml += '<td class="grid_header" width="80px">' + me.currentPeriod + '</td>';
				rowHtml += '<td class="grid_header" width="80px">' + ((parseInt(me.currentPeriod)) != me.period.data.length ? (parseInt(me.currentPeriod) + 1).toString() : 1)  + '</td>';
				rowHtml += "</tr>"
			}		
	
			for(index = 0; index < me.transactionSummaries.length; index++) {
				if (me.transactionSummaries[index] == undefined) 
					return;
								
				if (index > 0) {
					
					if (me.transactionSummaries[index].fscAcccTitle != me.transactionSummaries[index - 1].fscAcccTitle) {
						me.fscAcccTitle = "Total " + me.transactionSummaries[index - 1].fscAcccTitle;
						
						if (me.totalWeek > 4) 
							$("#wk5show").show();
						else
						 	$("#wk5show").hide();
						 
						//Sum Row 
						rowHtml += "<tr>";
						rowHtml += "<td class='textAlignLeftHeader'>" + me.fscAcccTitle.bold() + "</td>";
						rowHtml += "<td class='textAlign'>&nbsp;</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.wk1Amount * -1 ) : formatAmount(me.wk1Amount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.wk2Amount * -1 ) : formatAmount(me.wk2Amount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.wk3Amount * -1 ) : formatAmount(me.wk3Amount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.wk4Amount * -1 ) : formatAmount(me.wk4Amount)) + "</td>";
						(me.totalWeek > 4 ? (rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.wk5Amount * -1 ) : formatAmount(me.wk5Amount)) + "</td>") : rowHtml += "");
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.sumWKAmount * -1) : formatAmount(me.sumWKAmount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.budgetAmount* -1) : formatAmount(me.budgetAmount)) + "</td>";
//						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.variance * -1) : formatAmount(me.variance)) + "</td>";
						(me.variance >= 0 ?
						(rowHtml += "<td class='textAlignGreen'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.variance * -1) : formatAmount(me.variance)) + "</td>")
						:(rowHtml += "<td class='textAlignRed'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.variance * -1) : formatAmount(me.variance)) + "</td>"));
						
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.prevPeriodAmount * -1) : formatAmount(me.prevPeriodAmount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.forecastAmount* -1) : formatAmount(me.forecastAmount)) + "</td>";
						rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index-1].negativeValue == "1" ? formatAmount(me.forecastAmountProj * -1) : formatAmount(me.forecastAmountProj)) + "</td>";
						rowHtml += "</tr>";
						
						me.wk1Amount = 0;	
						me.wk2Amount = 0;	
						me.wk3Amount = 0;	
						me.wk4Amount = 0;	
						me.wk5Amount = 0;	
						me.sumWKAmount = 0;						
						me.budgetAmount = 0;
						me.variance = 0;
						me.prevPeriodAmount = 0;
						me.forecastAmount = 0;
						me.forecastAmountProj = 0;
					}
				}				
				
				((me.transactionSummaries[index].negativeValue == "1") ? me.color = true: me.color = false);
				
				(me.color == true ? me.variance1 = parseInt(me.transactionSummaries[index].variance) * -1 : me.variance1 = parseInt(me.transactionSummaries[index].variance));
				
				rowHtml += "<tr class='transactionGrid'>";
				rowHtml += "<td style='display:none'>" + me.transactionSummaries[index].id + "</td>";
				(parseInt(me.transactionSummaries[index].sumWKAmount) != 0 ? (rowHtml += "<td width='275px' class='textAlignLeftLink'>" + "" + me.transactionSummaries[index].description + "" + "</td>") : rowHtml += "<td width='275px' class='textAlignLeft'>" + me.transactionSummaries[index].description + "</td>");
				rowHtml += "<td class='textAlignCenter'>" + me.transactionSummaries[index].accountCode + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].wkAmount1) * -1) : formatAmount(parseInt(me.transactionSummaries[index].wkAmount1))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].wkAmount2) * -1) : formatAmount(parseInt(me.transactionSummaries[index].wkAmount2))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].wkAmount3) * -1) : formatAmount(parseInt(me.transactionSummaries[index].wkAmount3))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].wkAmount4) * -1) : formatAmount(parseInt(me.transactionSummaries[index].wkAmount4))) + "</td>";
				(me.totalWeek > 4 ? (rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].wkAmount5) * -1) : formatAmount(parseInt(me.transactionSummaries[index].wkAmount5))) + "</td>") : rowHtml += "");
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].sumWKAmount) * -1) : formatAmount(parseInt(me.transactionSummaries[index].sumWKAmount))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].budgetAmount) * -1) : formatAmount(parseInt(me.transactionSummaries[index].budgetAmount))) + "</td>";
				
				
				((me.variance1 >= 0) ?
				(rowHtml += "<td class='textAlignGreen'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].variance) * -1) : formatAmount(parseInt(me.transactionSummaries[index].variance))) + "</td>")
				:(rowHtml += "<td class='textAlignRed'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].variance) * -1) : formatAmount(parseInt(me.transactionSummaries[index].variance))) + "</td>"));
					
//				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].variance) * -1) : formatAmount(parseInt(me.transactionSummaries[index].variance))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].prevPeriodAmount) * -1) : formatAmount(parseInt(me.transactionSummaries[index].prevPeriodAmount))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].forecastAmount) * -1) : formatAmount(parseInt(me.transactionSummaries[index].forecastAmount))) + "</td>";
				rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.transactionSummaries[index].forecastAmountProj) * -1) : formatAmount(parseInt(me.transactionSummaries[index].forecastAmountProj))) + "</td>";
				rowHtml += "</tr>";								
				
				//Sum of Row
				me.wk1Amount += parseInt(me.transactionSummaries[index].wkAmount1);
				me.wk2Amount += parseInt(me.transactionSummaries[index].wkAmount2);
				me.wk3Amount += parseInt(me.transactionSummaries[index].wkAmount3);
				me.wk4Amount += parseInt(me.transactionSummaries[index].wkAmount4);
				me.wk5Amount += parseInt(me.transactionSummaries[index].wkAmount5);
				me.sumWKAmount += parseInt(me.transactionSummaries[index].sumWKAmount);
				me.budgetAmount += parseInt(me.transactionSummaries[index].budgetAmount);
				me.variance += parseInt(me.transactionSummaries[index].variance);
				me.prevPeriodAmount += parseInt(me.transactionSummaries[index].prevPeriodAmount);
				me.forecastAmount += parseInt(me.transactionSummaries[index].forecastAmount);
				me.forecastAmountProj += parseInt(me.transactionSummaries[index].forecastAmountProj);
								
				if (index == me.transactionSummaries.length - 1) { 
					me.fscAcccTitle = "Total " + me.transactionSummaries[index].fscAcccTitle;
					
					if (me.totalWeek > 4) 
					 	$("#wk5show").show();
					 else
					 	$("#wk5show").hide();
					 
					//Sum Row 
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlignLeftHeader'>" + me.fscAcccTitle.bold() + "</td>";
					rowHtml += "<td class='textAlign'>&nbsp;</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.wk1Amount * -1 ) : formatAmount(me.wk1Amount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.wk2Amount * -1 ) : formatAmount(me.wk2Amount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.wk3Amount * -1 ) : formatAmount(me.wk3Amount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.wk4Amount * -1 ) : formatAmount(me.wk4Amount)) + "</td>";
					(me.totalWeek > 4 ? (rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.wk5Amount * -1 ) : formatAmount(me.wk5Amount)) + "</td>") : rowHtml += "");
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.sumWKAmount * -1) : formatAmount(me.sumWKAmount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.budgetAmount* -1) : formatAmount(me.budgetAmount)) + "</td>";
					
					(me.variance > 0 ?
					(rowHtml += "<td class='textAlignRed'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.variance * -1) : formatAmount(me.variance)) + "</td>")
					:(rowHtml += "<td class='textAlignGreen'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.variance * -1) : formatAmount(me.variance)) + "</td>"));
					
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.prevPeriodAmount * -1) : formatAmount(me.prevPeriodAmount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.forecastAmount* -1) : formatAmount(me.forecastAmount)) + "</td>";
					rowHtml += "<td class='textAlign'>" + (me.transactionSummaries[index].negativeValue == "1" ? formatAmount(me.forecastAmountProj * -1) : formatAmount(me.forecastAmountProj)) + "</td>";
					rowHtml += "</tr>";											
				}
				
				//Last Total Sum of Row
				me.id = me.transactionSummaries[index].id;
				me.wk1TAmount += parseInt(me.transactionSummaries[index].wkAmount1);
				me.wk2TAmount += parseInt(me.transactionSummaries[index].wkAmount2);
				me.wk3TAmount += parseInt(me.transactionSummaries[index].wkAmount3);
				me.wk4TAmount += parseInt(me.transactionSummaries[index].wkAmount4);
				me.wk5TAmount += parseInt(me.transactionSummaries[index].wkAmount5);
				me.sumTWKAmount += parseInt(me.transactionSummaries[index].sumWKAmount);
				me.budgetTAmount += parseInt(me.transactionSummaries[index].budgetAmount);
				me.varianceT += parseInt(me.transactionSummaries[index].variance);
				me.prevTPeriodAmount += parseInt(me.transactionSummaries[index].prevPeriodAmount);
				me.forecastTAmount += parseInt(me.transactionSummaries[index].forecastAmount);
				me.forecastTAmountProj += parseInt(me.transactionSummaries[index].forecastAmountProj);
			}
			
			//Last Total Sum Row
			rowHtml += "<tr>";	
			rowHtml += "<td class='textAlignLeftTotal'>" + "Total".bold() + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + "&nbsp;" + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.wk1TAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.wk2TAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.wk3TAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.wk4TAmount)) + "</td>";
			(me.totalWeek > 4 ? (rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.wk5TAmount)) + "</td>") : rowHtml += "");
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.sumTWKAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.budgetTAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.varianceT)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.prevTPeriodAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.forecastTAmount)) + "</td>";
			rowHtml += "<td class='textAlignLeftTotalText'>" + formatAmount(checkNeg(me.forecastTAmountProj)) + "</td>";
			rowHtml += "</tr>";	
							
			$("#TransactionSummaryGrid tbody").html(rowHtml);
			
			$("#TransactionSummaryGrid tr:odd").addClass("grid_row");
        	$("#TransactionSummaryGrid tr:even").addClass("grid_row_alternate");
			
			$("#TransactionSummaryGrid tr").mouseover(function() { 
				$(this).addClass("grid_row_over"); }).mouseout(function() { 
					$(this).removeClass("grid_row_over"); }).click(function() { 
						$(this).toggleClass("grid_row_click"); }); 
			
			$("#transactionSummary tr").click(function() {
				
				if (me.rowSelected) {						
					for(indexnew = 0; indexnew <= flashRowLength;indexnew++) {

						if(!$("#jde_" + me.rowSelected[0].cells[0].innerHTML + '_' + indexnew)) 
							break;
						$("#jde_" + me.rowSelected[0].cells[0].innerHTML + '_' + indexnew).hide();
					}						

					me.rowSelected.removeClass("grid_row_click");
					$("#jde_" + me.rowSelected[0].cells[0].innerHTML).hide();
					
					if (me.rowSelected[0].cells[0].innerHTML == this.cells[0].innerHTML) {
						me.rowSelected = null;
						return;
					}
				}					
				
				me.rowSelected = $(this);
				me.parantRowSelected = $(this);
				
				if (me.totalWeek > 4)
					me.totalAmount = me.rowSelected[0].cells[8].innerHTML;
				else
					me.totalAmount = me.rowSelected[0].cells[7].innerHTML;
					
				if (parseInt(me.totalAmount) != 0) {
					if ($("#jde_" + me.rowSelected[0].cells[0].innerHTML).is(':visible')) {
						$("#jde_" + me.rowSelected[0].cells[0].innerHTML).hide();
						return;
					}
					me.actualAmount = me.rowSelected[0].cells[10].innerHTML;
					
					centerLoading(1);
					$("#gridLoading").show();
				
					me.jdeTransactionSummaryStore.fetch("hcmHouseCode:" + parent.fin.appUI.houseCodeId + ",houseCodeJob:" + me.houseCodeJobIdSelected + ",fscAccount:" + this.cells[0].innerHTML + ",fiscalYear:" + me.currentFiscalYear + ",period:" + me.currentPeriod + ",userId:[user]", me.jdetsLoad, me);
				}				
			});			

			me.resize();
			$("#pageLoading").hide();
			me.resizeControls();
		},
		
		jdetsLoad: function(me,activeId) {
			
			function checkNeg(amount) {
				if (amount < 0)
					amount = -(amount);	
				
				return amount.toString();			
			};
			
			if (me.jdeTransactionSummaries.length > 0) {

				var rowHtml = "";
				var rowMasterId = "jde_" + me.rowSelected[0].cells[0].innerHTML;

				for (index = 0; index < me.jdeTransactionSummaries.length; index++) {
					if (me.jdeTransactionSummaries[index] == undefined) 
						return;

					flashRowLength = me.jdeTransactionSummaries.length;
					
					if (me.jdeTransactionSummaries[index].vendor == "" || me.jdeTransactionSummaries[index].vendor == undefined) {					
						if (me.totalWeek > 4) {
							rowHtml += "<tr id='" + rowMasterId + "_" + index + "' class='jdeDetail" + rowMasterId + "'>";
							rowHtml += "<td class='bordertrLeftTop'>" + me.jdeTransactionSummaries[index].vendor + "&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week5Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week5Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid' colspan='6'>&nbsp;</td>";
							rowHtml += "</tr>";
						}
						else {
							rowHtml += "<tr id='" + rowMasterId + "_" + index + "' class='jdeDetail" + rowMasterId + "'>";
							rowHtml += "<td class='bordertrLeftTop'>" + me.jdeTransactionSummaries[index].vendor + "&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid' colspan='6'>&nbsp;</td>";
							rowHtml += "</tr>";							
						}
					}
					else {
						if (me.totalWeek > 4) {						
							rowHtml += "<tr id='" + rowMasterId + "_" + index + "' class='jdeDetail" + rowMasterId + "'>";
							rowHtml += "<td class='bordertrLeftTop'>" + me.jdeTransactionSummaries[index].vendor + "&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week5Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week5Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid' colspan='6'>&nbsp;</td>";
							rowHtml += "</tr>";
						}
						else {
							rowHtml += "<tr id='" + rowMasterId + "_" + index + "' class='jdeDetail" + rowMasterId + "'>";
							rowHtml += "<td class='bordertrLeftTop'>" + me.jdeTransactionSummaries[index].vendor + "&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>&nbsp;</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week1Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week2Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week3Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid'>" + (me.jdeTransactionSummaries[index].negativeValue == "1" ? formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount) * -1) : formatAmount(parseInt(me.jdeTransactionSummaries[index].week4Amount))) + "</td>";
							rowHtml += "<td class='bordertrLeftTopGrid' colspan='6'>&nbsp;</td>";
							rowHtml += "</tr>";							
						}							
					}
				}
				
				$(me.rowSelected).after(rowHtml);
				
				me.resetGridSetting();
			
				$(".jdeDetail" + rowMasterId + "").click(function() {
					if (me.actualAmount != 0) { // Actual amount is zero.
						centerLoading(2);
						$("#gridLoading").show();					
						me.jdeTransactionDetailGrid();
						$("#JDETransactionDetailSummary").show();
						$("#transaction").hide();
						centerPopup();
						loadPopup();
						$("#popupContact").show();
						me.resize();
						me.jdeTransactionSummaryDetailStore.fetch("hcmHouseCode:" + parent.fin.appUI.houseCodeId + ",fscAccount:" + me.rowSelected[0].cells[0].innerHTML + ",startDate:" + me.weekPeriodYears[0].periodStartDate + ",endDate:" + me.weekPeriodYears[0].periodEndDate + ",userId:[user]", me.jdetsDetailLoad, me);
						me.jdeTransactionDetailSummary.resize();
					}
					else {
						alert('There is no corresponding actual amount.')
					}					
				});				
			}
			else {
				alert('There is no corresponding amount.');
			}
			
			$("#gridLoading").hide();			
		},
		
		transactionSummaryLoaded: function (me, activeId) {
			var args = ii.args(arguments, {});
			var me = this;
			
			if(parent.fin.appUI.houseCodeId <= 0) {
				alert('Please select a House Code.');
				return false;
			}
			
			me.currentPeriod = me.period.lastBlurValue;
			me.currentFiscalYear = me.fiscalYears[me.fiscalYear.indexSelected].name;
			me.rowSelected = null;
			
			$("#pageLoading").show();
			$("#JDETransactionSummary").hide();
			$("#JDETransactionDetailSummary").hide();

			me.weekPeriodYearStore.reset();
			me.weekPeriodYearStore.fetch("week:1,period:" + me.currentPeriod + ",fiscalYear:" + me.currentFiscalYear + ",userId:[user],", me.tsLoad, me);		
		},	
		
		tsLoad: function(me,activeId) {
			me.PeriodStartEnd = "Weeks: (" + me.weekPeriodYears[0].periodStartDate.substring(0,5) + " - " + me.weekPeriodYears[0].periodEndDate.substring(0,5) + ")";
			me.totalWeek = me.weekPeriodYears[0].totalWeek;
			
			$("#PeriodStartEnd").text(me.PeriodStartEnd);
			
			me.transactionSummaryStore.reset();
			me.transactionSummaryStore.fetch("hcmHouseCode:" + parent.fin.appUI.houseCodeId + ",houseCodeJob:" + me.houseCodeJobIdSelected + ",fiscalYear:" + me.currentFiscalYear + ",period:" + me.currentPeriod + ",userId:[user]", me.weekPeriodYearsLoaded, me);
		},		
		
		jdetsDetailLoad: function(me,activeId) {						
				
			me.jdeTransactionDetailGrid();				
			$("#JDETransactionDetailSummary").show();
			me.jdeTransactionDetailSummary.setData(me.jdeTransactionSummaryDetails);				
					
			$("#gridLoading").hide();			
		},
		
		jdeTransactionDetailGrid: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#JDETransactionDetailSummary").html("");	
				
			me.jdeTransactionDetailSummary = new ui.ctl.Grid({
				id: "JDETransactionDetailSummary",
				appendToId: "divForm",
				allowAdds: false
			});
		
			me.jdeTransactionDetailSummary.addColumn("glDate", "glDate", "GL Ticket Date", "GL Ticket Date", 130);
			me.jdeTransactionDetailSummary.addColumn("documentNo", "documentNo", "Doc Number", "Document Number", 100);
			me.jdeTransactionDetailSummary.addColumn("invoiceNo", "invoiceNo", "Invoice Number", "Invoice Number", 150);
			me.jdeTransactionDetailSummary.addColumn("invoiceDate", "invoiceDate", "Invoice Date", "Invoice Date", 130);
			me.jdeTransactionDetailSummary.addColumn("orderNumber", "orderNumber", "PO Number", "PO Number", 100);
			me.jdeTransactionDetailSummary.addColumn("vendor", "vendor", "Vendor", "Vendor", 175);
			me.jdeTransactionDetailSummary.addColumn("description", "description", "Description", "Description", 100);
			me.jdeTransactionDetailSummary.addColumn("amount", "amount", "Amount", "Amount", 100);
			me.jdeTransactionDetailSummary.addColumn("documentType", "documentType", "Doc Type", "Document Type", 80);
			me.jdeTransactionDetailSummary.addColumn("crtdAt", "crtdAt", "Import Date", "Import Date", null);
			me.jdeTransactionDetailSummary.capColumns();			
			me.jdeTransactionDetailSummary.setHeight($("#summaryGrid").height() - 30);			
		},
		
		actionCancelItem: function() {
			var me = this;
			
			disablePopup();
			$("#transaction").show();
			
			if (me.rowSelected) {
				for(indexnew = 0; indexnew <= flashRowLength; indexnew++) {
		
					if(!$("#jde_" + me.rowSelected[0].cells[0].innerHTML + '_' + indexnew)) 
						break;
					$("#jde_" + me.rowSelected[0].cells[0].innerHTML + '_' + indexnew).hide();
				}
			}	
		},
		
		actionImportJDEGLItem: function() {
			var args = ii.args(arguments,{});
			var me = this;		
			
			var xml = "<jdeGLTransactionUpdate id='0'/>";
			
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.importResponse,
				referenceData: {me: me, item: new fin.glm.transactionSummary.Import(0)} //dummy class used
			});
			
			return true;
		},
		
		importResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var errorMessage = "";
			
			$("#pageLoading").hide();
									
			if (status == "success") {
				alert("JDEGL Transaction records Imported from TEXT file.");
			}
			else {
				errorMessage = "Error while JDEGL Transaction records Import: " + $(args.xmlNode).attr("message");
				alert(errorMessage);
			}			
		},
		
		resetGridSetting: function() {
			
			$("#TransactionSummaryGrid tr").removeClass("grid_row");
        	$("#TransactionSummaryGrid tr").removeClass("grid_row_alternate");
			
			$("#TransactionSummaryGrid tr:odd").addClass("grid_row");
        	$("#TransactionSummaryGrid tr:even").addClass("grid_row_alternate");
			
			$("#TransactionSummaryGrid tr").mouseover(function() {
				$(this).addClass("grid_row_over");}).mouseout(function() {
					$(this).removeClass("grid_row_over");}).click(function() {

						var currentRowClicked = this;
						//remove css for the last row selected. 
						$("#TransactionSummaryGrid tr").each(function(){
							if(this != currentRowClicked){
								$(this).removeClass("grid_row_click");
							}
						});
					
						$(this).toggleClass("grid_row_click");
					}); 						
			
		}	
			
	}
});

function formatAmount(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function loadPopup() {
	
	$("#backgroundPopup").css({
		"opacity": "0.5"
	});
	$("#backgroundPopup").fadeIn("slow");
	$("#popupContact").fadeIn("slow");
}

function disablePopup() {

	$("#backgroundPopup").fadeOut("slow");
	$("#popupContact").fadeOut("slow");
}

function centerPopup() {
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var popupWidth = $("#popupContact").width();
	var popupHeight = $("#popupContact").height();
		
	$("#popupContact").css({
		"top": windowHeight/2-popupHeight/2,
		"left": windowWidth/2-popupWidth/2
	});

	$("#backgroundPopup").css({
		"height": windowHeight
	});
}

$("#popupContactClose").click(function() {
	disablePopup();
});

function centerLoading(status) {
	var width = document.documentElement.clientWidth - $("#gridLoading").width();
	var height = document.documentElement.clientHeight - $("#gridLoading").height();
	
	width = width/2;
	
	if (status == 1)
		height = height/2 + document.documentElement.scrollTop;
	else
		height = height/2;

	$("#gridLoading").css({
		"top": height,
		"left": width
	});
}

function main() {
	fin.transactionSummaryUI = new fin.glm.transactionSummary.UserInterface();
	fin.transactionSummaryUI.resize();
	fin.houseCodeSearchUi = fin.transactionSummaryUI;
}

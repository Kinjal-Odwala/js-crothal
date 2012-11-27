ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "jQuery.tabPages.tabsPack" );
ii.Import( "fin.bud.annualizedBudgetMaster.usr.defs" );
ii.Import("fin.cmn.usr.houseCodeSearch");
ii.Import( "ui.ctl.usr.statusBar" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.dropDown" , 7);

ii.Class({
    Name: "fin.bud.annualizedBudgetMaster.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
		
        init: function (){
  			var args = ii.args(arguments, {});
			var me = this;

			me.statusBar = new ui.ctl.StatusBar();
			me.year = 0;
		    me.activeFrameId = 0;
			me.permision = true;
			me.budStartDate = "";
			if(!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.startBudgetNeedUpdate = true;
			me.contractBillingNeedUpdate = true;
			me.staffingNeedUpdate = true;
			
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\annualizedBudgetMaster";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();	
			
			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			
			if (parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad			
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else {
				me.houseCodesLoaded(me, 0);
			}
			
			$("#TabCollection a").click(function() {
				
				switch(this.id) {

					case "TabStartBudget":
					
						if (($("iframe")[1].contentWindow.fin == undefined || me.startBudgetNeedUpdate))
							$("iframe")[1].src = "/fin/bud/StartBudget/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
	
							me.activeFrameId = 0;
							me.startBudgetNeedUpdate = false;
							break;
							
					case "TabContractBilling":
					
						if (($("iframe")[2].contentWindow.fin == undefined || me.contractBillingNeedUpdate))
							$("iframe")[2].src = "/fin/bud/contractBilling/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId + "&fiscalYearId=" + me.year + "&fiscalYearText="+ me.years[me.fiscalYear.indexSelected].name;
	
							me.activeFrameId = 1;
							me.contractBillingNeedUpdate = false;
							break;
				
					case "TabStaffing":
					
						if (($("iframe")[3].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[3].src = "/fin/bud/staffing/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
	
							me.activeFrameId = 2;
							me.staffingNeedUpdate = false;
							break;
					
					case "TabEmployee":
					
						if (($("iframe")[4].contentWindow.fin == undefined || me.staffingNeedUpdate))
							//$("iframe")[4].src = "/fin/bud/employee/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
							$("iframe")[4].src = "/fin/bud/employee/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId+ "&fiscalYearId=" + me.year + "&fiscalYearText="+ me.years[me.fiscalYear.indexSelected].name;
							//$("iframe")[2].src = "/fin/bud/contractBilling/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId + "&fiscalYearId=" + me.year + "&fiscalYearText="+ me.years[me.fiscalYear.indexSelected].name;
							me.activeFrameId = 3;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabManagementHistory":
					
						if (($("iframe")[5].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[5].src = "/fin/bud/managementHistory/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
	
							me.activeFrameId = 4;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabBudgetSummaryAnnualizad":
					
						if (($("iframe")[6].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[6].src = "/fin/bud/budgetSummaryAnnualizad/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
	
							me.activeFrameId = 5;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabLaborCalculation":
					
						if (($("iframe")[7].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[7].src = "/fin/bud/laborCalculations/usr/markup.htm?houseCode=" + parent.fin.appUI.houseCodeId;
	
							me.activeFrameId = 6;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabFinalComputationLabor":
					
						if (($("iframe")[8].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[8].src = "/fin/bud/finalComputationLabor/usr/markup.htm?houseCode=" + me.houseCode;
	
							me.activeFrameId = 7;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabSupplyExpenditures":
					
						if (($("iframe")[9].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[9].src = "/fin/bud/supplyExpenditures/usr/markup.htm?houseCode=" + me.houseCode;
	
							me.activeFrameId = 8;
							me.staffingNeedUpdate = false;
							break;
							
					case "TabCapitalExpenditures":
					
						if (($("iframe")[10].contentWindow.fin == undefined || me.staffingNeedUpdate))
							$("iframe")[10].src = "/fin/bud/capitalExpenditures/usr/markup.htm?houseCode=" + me.houseCode;
	
							me.activeFrameId = 9;
							me.staffingNeedUpdate = false;
							break;
				}		
			});
			
			
			$("#startBudget").hide();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
        },
		
		authorizationProcess: function fin_bud_annualizedBudgetMaster_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_annualizedBudgetMaster_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var offset = 110;
			
			$("#iFrameStartBudget").height($(window).height() - offset);
		    $("#iFrameContractBilling").height($(window).height() - offset);
		    $("#iFrameStaffing").height($(window).height() - offset);
			$("#iFrameEmployee").height($(window).height() - offset);
			$("#iFrameManagementHistory").height($(window).height() - offset);
			$("#iFramebudgetSummaryAnnualizad").height($(window).height() - offset);
			$("#iFrameLaborCalculation").height($(window).height() - offset);
			$("#iFrameFinalComputationLabor").height($(window).height() - offset);
			$("#iFrameSupplyExpenditures").height($(window).height() - offset);
			$("#iFrameCapitalExpenditures").height($(window).height() - offset);				
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)", 
					title: "Save the changes.",
					actionFunction: function(){ me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo (Ctrl+U)", 
					title: "Undo the changes.",
					actionFunction: function(){ me.actionUndoItem(); }
				});
			
			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
		        id: "FiscalYear",
				formatFunction: function( type ){ return type.name; },
				changeFunction: function(){ me.yearChanged(); },
				required : false
		    });
			
			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function(){ me.annualBudgetsLoad(me, 0); },
				hasHotState: true
			});
		},
				
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.bud.annualizedBudgetMaster.HirNode,
				itemConstructorArgs: fin.bud.annualizedBudgetMaster.hirNodeArgs,
				injectionArray: me.hirNodes
			});

			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",  
				itemConstructor: fin.bud.annualizedBudgetMaster.HouseCode,
				itemConstructorArgs: fin.bud.annualizedBudgetMaster.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.annualBudgets = [];
			me.annualBudgetStore = me.cache.register({
				storeId: "budAnnualBudgets",
				itemConstructor: fin.bud.annualizedBudgetMaster.BudAnnualBudget,
				itemConstructorArgs: fin.bud.annualizedBudgetMaster.budAnnualBudgetArgs,
				injectionArray: me.annualBudgets
			});
			
			me.years = [];
			me.yearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.bud.annualizedBudgetMaster.Year,
				itemConstructorArgs: fin.bud.annualizedBudgetMaster.yearArgs,
				injectionArray: me.years
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
						me.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed)
				return false;
		},
		
		houseCodesLoaded: function(me, activeId) { 

			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);			
			
			$('#container-1').tabs(1);        	
			
			me.yearStore.fetch("userId:[user]", me.yearsLoaded, me);
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;
	
			me.startBudgetNeedUpdate = true;
			me.contractBillingNeedUpdate = true;
			me.staffingNeedUpdate = true;
		},
		
		yearsLoaded: function(me, activeId) { //Fiscal Years
						
			me.fiscalYear.setData(me.years);
			me.fiscalYear.select(0, me.fiscalYear.focused);
			me.year = me.years[me.fiscalYear.indexSelected].id;
						
			me.annualBudgetsLoad(me, 0);
			
		},
		
		annualBudgetsLoad: function(me, activeId){
			$("#pageLoading").show();
			
			me.annualBudgetStore.reset();
			me.annualBudgetStore.fetch("hcmHouseCode:"+ parent.fin.appUI.houseCodeId + ",fscYear:" + me.years[me.fiscalYear.indexSelected].id + ",userId:[user]", me.annualBudgetsLoaded, me);				
		},
		
		annualBudgetsLoaded: function(me, activeId){
			
			me.budStartDate = "";		
			
			$.each(me.annualBudgets, function(){				
				me.budStartDate = this.startDate;
			});	
						
			me.actionLoadItem();
			
		},
		yearChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.year = me.years[me.fiscalYear.indexSelected].id;	
		},
		
		actionLoadItem: function() {
			var args = ii.args(arguments,{});
			var me = this;							
			
			var queryString = "hcmHouseCode=" + parent.fin.appUI.houseCodeId 
				+ "&appUnit=" + parent.fin.appUI.unitId
				+ "&fiscalYear=" + me.years[me.fiscalYear.indexSelected].name
				+ "&fscYear=" + me.years[me.fiscalYear.indexSelected].id;
			
			if (me.budStartDate == "") {
			
				$("#startBudget").show();
				$("#container-1").hide();
				$("#container-0").show();
				
				$("iframe")[0].src = "/fin/bud/StartBudget/usr/markup.htm?" + queryString;
			}
			else {
				$("#startBudget").hide();
				$("#container-0").hide();
				$("#container-1").show();
				$("#iFrameStartBudget").show();
				
				switch (me.activeFrameId) {
				
					case 0:
						$("iframe")[1].src = "/fin/bud/StartBudget/usr/markup.htm?" + queryString;
						
						me.startBudgetNeedUpdate = false;
						break;
						
					case 1:
						$("iframe")[2].src = "/fin/bud/contractBilling/usr/markup.htm?" + queryString;
						
						me.contractBillingNeedUpdate = false;
						break;
						
					case 2:
						$("iframe")[3].src = "/fin/bud/staffing/usr/markup.htm?" + queryString;
						
						me.staffingNeedUpdate = false;
						break;
				}
			}
			
			$("#pageLoading").hide();
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;			
			
		},
				
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
		}
    }
});

function main() {
	fin.budMasterUi = new fin.bud.annualizedBudgetMaster.UserInterface();
	fin.budMasterUi.resize();
	fin.houseCodeSearchUi = fin.budMasterUi;
}


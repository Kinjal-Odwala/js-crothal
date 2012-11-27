ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.bud.startBudget.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);

ii.Class({
    Name: "fin.bud.startBudget.UserInterface",
    Definition: {
	
		init: function(){
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hcmHouseCode = 0;
			me.fscYear = 0;
			
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

			me.appUnitId = queryStringArgs["appUnit"];
			me.hcmHouseCode = queryStringArgs["hcmHouseCode"];
			me.fiscalYear = queryStringArgs["fiscalYear"];
			me.fscYear = queryStringArgs["fscYear"];
			if (me.hcmHouseCode == undefined) {
				me.hcmHouseCode = 0;
				me.fscYear = 0;
			}
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);	
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\startBudget";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
						
			me.session = new ii.Session(me.cache);

			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);		
			//me.hcmHouseCode = 216;
			//me.fscYear = 10;
			$("#startBudgetClick").hide();	
			
			$("#BudgetStartButton").click(function(){
				me.startBudgetAction();
			});
			
			me.configureCommunications();
			
			me.annualBudgetStore.fetch("hcmHouseCode:"+ me.hcmHouseCode +",fscYear:"+ me.fscYear +",userId:[user]", me.annualBudgetsLoad, me);	
			
		},
			
		authorizationProcess: function fin_bud_startBudget_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_startBudget_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.annualBudgets = [];
			me.annualBudgetStore = me.cache.register({
				storeId: "budAnnualBudgets",
				itemConstructor: fin.bud.startBudget.BudAnnualBudget,
				itemConstructorArgs: fin.bud.startBudget.budAnnualBudgetArgs,
				injectionArray: me.annualBudgets
			});
			
			me.annualBudgetDetails = [];
			me.annualBudgetDetailStore = me.cache.register({
				storeId: "budAnnualBudgetDetails",
				itemConstructor: fin.bud.startBudget.BudAnnualBudgetDetail,
				itemConstructorArgs: fin.bud.startBudget.budAnnualBudgetDetailArgs,
				injectionArray: me.annualBudgetDetails
			});
			
		},

		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;
		},
			
		annualBudgetsLoad:function(me, activeId){			
			
			var index = 0;

			if (me.annualBudgets.length <= 0){	
			
				$("#BudgetStartTime").text("Not Started");	
				$("#BudgetStartedBy").text("Not Started");							
				$("#startBudgetClick").show();								
			}
					
			$.each(me.annualBudgets, function(){
				
				$("#BudgetStartTime").text(this.startDate);	
				$("#BudgetStartedBy").text(this.startedBy);	
				$("#startBudgetClick").hide();				
			});		
			
			me.annualBudgetDetailStore.reset();
			me.annualBudgetDetailStore.fetch("fscYear:" + me.fscYear + ",userId:[user]", me.annualBudgetDetailsLoad, me);	
		},
		
		annualBudgetDetailsLoad:function(me, activeId){			
			var index = 0;
			
			if(me.annualBudgetDetails.length > 0)				
				$("#TableEditAreaBudgetNote").html(me.annualBudgetDetails[0].announcement);	
			else
				$("#TableEditAreaBudgetNote").html("");	
			
			$("#pageLoading").hide();			
		},
		
		startBudgetAction: function(){
			var args = ii.args(arguments,{});
			var me = this;
						
			me.actionSaveItem();
		},
		
		actionSaveItem: function(){
			var args = ii.args(arguments,{});			
			var me = this;
			
			me.message = "";
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
			
			fin.bud.startBudget.budAnnualBudgetArgs = {
				id: {type: Number},
				crtdAt: {type: String,required: false, defaultValue: ""},
				crtdBy: {type: String,required: false, defaultValue: ""},	
				exported: {type: Boolean},
				fscYear: {type: String},
				hcmHouseCode: {type: String},
				lockedDown: {type: Boolean},
				startDate: {type: String,required: false, defaultValue: ""},
				startedBy: {type: String,required: false, defaultValue: ""}
			};
			
			var item = new fin.bud.startBudget.BudAnnualBudget (
				1
				, '1-1-1900'
				, ''
				, true
				, me.fscYear
				, me.hcmHouseCode
				, true
				, '1-1-1900'
				, ''				
			);

			var xml = me.saveXmlBuild(item);
			
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuild: function (){
			var args = ii.args(arguments,{
				item: {type: fin.bud.startBudget.BudAnnualBudget}
			});
			
			var me = this;
			var item = args.item;
			var xml = "";
			
			xml += '<annualBudget';
			xml += ' hcmHouseCode="' + me.hcmHouseCode + '"';
			xml += ' fscYear="' + me.fscYear + '"';			
			xml += '/>';
			
			return xml;
		},
		
		saveResponse: function (){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});

			$("#pageLoading").hide();

			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var id =  parseInt($(this).attr("id"),10);
			var clientId = parseInt($(this).attr("clientId"),10);
			var success = true;
			var errorMessage = "";
			var successMessage = "";
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			
			
			if(status == "success"){

				//new or updated employee Id					
				//alert('Saved');	
				parent.fin.budMasterUi.annualBudgetsLoad(parent.fin.budMasterUi, 0);
			}
			else{

				alert("Notice/Error:\n" + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if( status == "invalid" ){
					traceType = ii.traceTypes.warning;
				}
				else{
					errorMessage += " [SAVE FAILURE]";
				}
			}
		}
		
			
	}
		
});

function main(){
	fin.startBudgetUI = new fin.bud.startBudget.UserInterface();
	fin.startBudgetUI.resize();
}

ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.pay.processing.usr.defs" );
ii.Import( "jQuery.treeView.treeView" );
ii.Import( "fin.cmn.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);

ii.Class({
    Name: "fin.pay.processing.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodesList = [];
			me.hirNodeSelected = 0;
			me.hirNodePreviousSelected = 0;	
			me.ceridian = -1; 
			me.endDate = "1/1/1900";			
			
			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider); //module id.. like ppl, app, hir etc
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "pay\\processing";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineUserControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			
			$("input[type=radio]").click(function() {

				me.payPeriodEndDate.fetchingData();
				me.payPeriodEndDateStore.fetch("payPeriod:" + $("input[name='PayPeriodRadio']:checked").val(), me.payPeriodEndDatesLoaded, me);
			});
			
			me.payPeriodEndDate.fetchingData();
			me.ceridianCompany.fetchingData();
			me.ceridianCompanyStore.fetch("payPeriod:weekly,userId:[user]", me.ceridianCompanyLoaded, me);
		},
		
		authorizationProcess: function fin_pay_processing_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
			
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},
		
		sessionLoaded: function fin_pay_processing_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		defineUserControls: function(){
			var args = ii.args(arguments, {});
			var me = this;	
			
			$("#ulEdit0").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true
	        });	
			
			me.ceridianCompany = new ui.ctl.Input.DropDown.Filtered({
				id: "CeridianCompany",
				formatFunction: function( type ) { return type.brief; }
			});
			
			me.payPeriodEndDate = new ui.ctl.Input.DropDown.Filtered({
				id: "PayPeriodEndDate",
				formatFunction: function( type ) { return type.endDate; }
			});
			
			me.closePayroll = new ui.ctl.buttons.Sizeable({
				id: "ClosePayroll",
				className: "iiButton",
				text: "<span>Close Payroll</span>",
				hasHotState: true,
				clickFunction: function() { me.actionClosePayroll(); }
			});

			me.openPayroll = new ui.ctl.buttons.Sizeable({
				id: "OpenPayroll",
				className: "iiButton",
				text: "<span>Open Payroll</span>",
				hasHotState: true,
				clickFunction: function() { me.actionOpenPayroll(); }
			});

			me.generateHRExport = new ui.ctl.buttons.Sizeable({
				id: "GenerateHRExport",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;&nbsp;Generate HR Export&nbsp;&nbsp;&nbsp;&nbsp;</span>",
				hasHotState: true,
				clickFunction: function() { me.actionGenerateHRExport(); }
			});

			me.generatePayrollExport = new ui.ctl.buttons.Sizeable({
				id: "GeneratePayrollExport",
				className: "iiButton",
				text: "<span>Generate Payroll Export</span>",
				hasHotState: true,
				clickFunction: function() { me.actionGeneratePayrollExport(); }
			});
		},
		
		resizeControls: function() {
			var me = this;
			
			me.ceridianCompany.resizeText();
			me.payPeriodEndDate.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.pay.processing.HirNode,
				itemConstructorArgs: fin.pay.processing.hirNodeArgs,
				injectionArray: me.hirNodes	
			});
			
			me.ceridianCompanys = [];
			me.ceridianCompanyStore = me.cache.register({
				storeId: "payrollProcessMasters",
				itemConstructor: fin.pay.processing.CeridianCompany,
				itemConstructorArgs: fin.pay.processing.ceridianCompanyArgs,
				injectionArray: me.ceridianCompanys	
			});
			
			me.payPeriodEndDates = [];
			me.payPeriodEndDateStore = me.cache.register({
				storeId: "payPeriodEndDates",
				itemConstructor: fin.pay.processing.PayPeriodEndDate,
				itemConstructorArgs: fin.pay.processing.payPeriodEndDateArgs,
				injectionArray: me.payPeriodEndDates
			});
			
			me.payrollHRExports = [];
			me.payrollHRExportStore = me.cache.register({
				storeId: "payrollHRExports",
				itemConstructor: fin.pay.processing.PayrollProcess,
				itemConstructorArgs: fin.pay.processing.payrollProcessArgs,
				injectionArray: me.payrollHRExports	
			});
			
			me.payrollHeaderExports = [];
			me.payrollHeaderExportStore = me.cache.register({
				storeId: "payrollHeaderExports",
				itemConstructor: fin.pay.processing.PayrollProcess,
				itemConstructorArgs: fin.pay.processing.payrollProcessArgs,
				injectionArray: me.payrollHeaderExports	
			});
			
			me.payrollHoursExports = [];
			me.payrollHoursExportStore = me.cache.register({
				storeId: "payrollHoursExports",
				itemConstructor: fin.pay.processing.PayrollProcess,
				itemConstructorArgs: fin.pay.processing.payrollProcessArgs,
				injectionArray: me.payrollHoursExports	
			});
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			$("#hirContainer").height($(window).height() - 100);
			$("#ulEdit0").height($(window).height() - 100);
			$("#processingBorderArea").height($(window).height() - 90);
		},
		
		ceridianCompanyLoaded: function(me, activeId) {
			
			me.ceridianCompany.reset();
			me.ceridianCompanys.unshift(new fin.pay.processing.CeridianCompany(0, 0, "All"));
			me.ceridianCompany.setData(me.ceridianCompanys);
		
			me.ceridianCompany.select(0, me.ceridianCompany.focused);
			
			me.payPeriodEndDate.reset();
			me.payPeriodEndDate.setData(me.payPeriodEndDates);
			me.payPeriodEndDate.select(0, me.payPeriodEndDate.focused);
		
			$("#hirNodeLoading").show();
			me.hirNodeStore.fetch("userId:[user],hirNodeParent:0", me.hirNodesLoaded, me);
		},
		
		payPeriodEndDatesLoaded: function(me, activeId) {
			
			me.payPeriodEndDate.reset();
			me.payPeriodEndDate.setData(me.payPeriodEndDates);
			me.payPeriodEndDate.select(0, me.payPeriodEndDate.focused);
		},
		
		hirNodesLoaded: function(me, activeId) {
			var index = -1;
		 	var hirNode = 0;
            var hirParentNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;
            var nodeList = "";
            var treeNode = null;
			 
			for (index = 0; index < me.hirNodes.length; index++) {
				hirNode = me.hirNodes[index].id;
				hirParentNode = me.hirNodes[index].nodeParentId;
				hirNodeTitle = me.hirNodes[index].title;
				childNodeCount = me.hirNodes[index].childNodeCount;
				nodeList = "";
				treeNode = null;
				
				//set up the edit tree
                //add the item underneath the parent list
				me.actionNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount);
			}
			
			me.storeHirNodes();
			
			if (me.hirNodePreviousSelected == 0) {
    			me.hirNodeSingleLoaded(me.hirNodes[0].id);
			}
			
			$("#hirNodeLoading").hide();
			me.resizeControls();
		},
		
		actionNodeAppend: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirNodeTitle: {type: String}
				, hirNodeParent: {type: Number}
				, childNodeCount: {type: Number}
			});
			var me = this;
				
            nodeHtml = "<li id=\"liNode" + args.hirNode + "\">"
		                    + "<span id=\"span" + args.hirNode + "\" class='TreeNodeText'>"
			                    + args.hirNodeTitle + "</span>";
            
            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id=\"ulEdit" + args.hirNode + "\"></ul>";
			}

            nodeHtml += "</li>";

			if($("#liNode" + args.hirNodeParent)[0] == undefined)
				args.hirNodeParent = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEdit" + args.hirNodeParent);
            $("#ulEdit0").treeview({add: treeNode});
            
            //link up the node
            $("#span" + args.hirNode).bind("click", function() { 
				me.hirNodeSelect(args.hirNode);
			});
			
		    $("#liNode" + args.hirNode).find(">.hitarea").bind("click", function() { 
				me.hitAreaSelect(args.hirNode);
			});
									           
			return nodeHtml;	
		},
		
		storeHirNodes: function() {
			var me = this;			
			var index = 0;

			for (index = 0; index < me.hirNodes.length; index++) {
				me.hirNodesList.push(me.hirNodes[index]);
			}			
		},
		
		hirNodeSingleLoaded: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
			});           
			var me = this;			
			var index = me.getNodeIndex(args.hirNode);			
			
			me.hirNodeSelected = me.hirNodesList[index].id;
							
			if (me.hirNodePreviousSelected > 0) {
				$("#span" + me.hirNodePreviousSelected).replaceClass("TreeNodeTextSelected", "TreeNodeText");
			}
			
			me.hirNodePreviousSelected = me.hirNodeSelected;
			
			$("#span" + me.hirNodeSelected).replaceClass("TreeNodeText", "TreeNodeTextSelected")
		},
		
		hitAreaSelect: function(nodeId) {        
   			var me = this;
			
			if($("#ulEdit" + nodeId)[0].innerHTML == "") {
				$("#hirNodeLoading").show(); 
			    me.hirNodeStore.fetch("userId:[user],hirNodeParent:" + nodeId + ",", me.hirNodesLoaded, me);
			}
		},
		
		hirNodeSelect: function(nodeId) {        
   			var me = this;
			
			me.hirNodeSingleLoaded(nodeId);
		},
		
		getNodeIndex: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number} 
			});
			var me = this;
			var index = 0;			
			
			for(index = 0; index < me.hirNodesList.length; index++){
				if(me.hirNodesList[index].id == args.hirNode)
					return index;
			}
			
			return 0;
		},
				
		actionGenerateHRExport: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if(! me.validateParameters('Generate HR Export files')) return;

			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();	

		    me.payrollHRExportStore.fetch(
				"hirNode:" + me.hirNodeSelected 
				+ ",payrollCompanyId:" + me.ceridian 
				+ ",periodEndDate:" + me.endDate 
				+ ",payPeriodType:" + $("input[name='PayPeriodRadio']:checked").val()
				+ ",userId:[user]", me.payrollHRExportProcessed, me);
		},
		
		actionGeneratePayrollExport: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if(! me.validateParameters('Generate Payroll Export files')) return;
			
			$("#messageToUser").text("Exporting");
			$("#pageLoading").show();	

		    me.payrollHeaderExportStore.fetch(
				"hirNode:" + me.hirNodeSelected 
				+ ",payrollCompanyId:" + me.ceridian 
				+ ",periodEndDate:" + me.endDate 
				+ ",payPeriodType:" + $("input[name='PayPeriodRadio']:checked").val()
				+ ",userId:[user]", me.payrollHeaderExportProcessed, me);
		},
		
		actionClosePayroll: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if(! me.validateParameters('Close Payroll')) return;
			
			me.actionUpdatePayroll('ClosePayroll');
		},
		
		actionOpenPayroll: function(){
			var args = ii.args(arguments,{});
			var me = this;
			
			if(! me.validateParameters('Open Payroll')) return;
			
			me.actionUpdatePayroll('OpenPayroll');
		},
		
		validateParameters: function() {
			var args = ii.args(arguments,{process: {type:String}});
			var me = this;
			
			if(confirm("Do you wish to '" + args.process + "'?") == false){
				return false;	
			}
			
			if (me.ceridianCompany.data[me.ceridianCompany.indexSelected] != undefined) {
				me.ceridian = me.ceridianCompany.data[me.ceridianCompany.indexSelected].id;
			}
			
			me.endDate = me.payPeriodEndDates[me.payPeriodEndDate.indexSelected].endDate;
			me.startDate = me.payPeriodEndDates[me.payPeriodEndDate.indexSelected].startDate;
		   
			if ((me.hirNodeSelected > 0 && me.ceridian > 0)
				|| (me.hirNodeSelected <= 0 && me.ceridian <= 0)
				){

				alert('You must select either a node in the Hierarchy or a Ceridian Company.');
				 
				$("#span" + me.hirNodeSelected).replaceClass("TreeNodeTextSelected", "TreeNodeText");
				me.hirNodeSelected = 0;
				me.ceridianCompany.select(0, me.ceridianCompanys.focused);
				
				return false;
			}

			return true;
		},
		
		payrollHRExportProcessed: function(me, activeId) {
			
			$("#pageLoading").hide();			
			alert("HR Export files are successfully created. " + me.payrollHRExports.length + " HR records are exported.");
		},
		
		payrollHeaderExportProcessed: function(me, activeId) {

		    me.payrollHoursExportStore.fetch(
				"hirNode:" + me.hirNodeSelected 
				+ ",payrollCompanyId:" + me.ceridian 
				+ ",periodEndDate:" + me.endDate 
				+ ",payPeriodType:" + $("input[name='PayPeriodRadio']:checked").val()
				+ ",userId:[user]", me.payrollHoursExportProcessed, me);
		},
		
		payrollHoursExportProcessed: function(me, activeId) {

			$("#pageLoading").hide();
			alert("Payroll Export files are successfully created. " + me.payrollHeaderExports.length + " Payroll and " + me.payrollHoursExports.length + " Hourly Payroll records are exported.");
		},
		
		actionUpdatePayroll: function() {
			var args = ii.args(arguments,{
				optionSelected: {type:String}
			});
			var me = this;

			$("#messageToUser").text("Updating");
			$("#pageLoading").show();

			var item = new fin.pay.processing.PayrollProcess(
				me.hirNodeSelected
				, me.hirNodeSelected.toString()
				, me.ceridian.toString()
				, me.startDate
				, me.endDate
				, args.optionSelected
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
		
		saveXmlBuild: function() {
			var args = ii.args(arguments,{
				item: {type: fin.pay.processing.PayrollProcess}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
			
			xml += '<payrollProcessUpdate';				
			xml += ' id="' + item.id + '"';
			xml += ' hirNode="' + item.hirNode + '"';
			xml += ' payrollCompanyId="' + item.payPayrollCompanyId + '"';
			xml += ' payPeriodStartDate="' + item.payPeriodStartDate + '"';
			xml += ' payPeriodEndDate="' + item.payPeriodEndDate + '"';
			xml += ' action="' + item.action + '"';
			xml += '/>';
			
			return xml;
		},
		
		saveResponse: function (){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var totalRecords = 0;
			var errorMessage = "";
			
			$("#pageLoading").hide();
			
			if(status == "success") {				
				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "payPayrollProcess":
							totalRecords = parseInt($(this).attr("id"), 10);
						
							break;
					}
				});	
				
				alert(totalRecords + ' Payroll records updated successfully!!');
			}
			else {
				alert('Error while Payroll records update process: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if( status == "invalid" ) {
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
	var payPayrollProcessingUi = new fin.pay.processing.UserInterface();
	payPayrollProcessingUi.resize();
}




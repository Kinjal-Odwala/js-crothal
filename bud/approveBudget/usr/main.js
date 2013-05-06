ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "ui.ctl.usr.hierarchy" );
ii.Import( "fin.cmn.usr.treeView" );
ii.Import( "fin.bud.approveBudget.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.hierarchy", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.treeview", 9 );

ii.Class({
    Name: "fin.bud.approveBudget.UserInterface",
    Definition: {
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodesList = [];
			me.hirNodesTemp = [];
			me.hirNodeSelected = 0;
			me.hirNodePreviousSelected = 0;
			me.fiscalYearId = 0;
			me.jobId = 0;		

			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);
			me.hierarchy = new ii.ajax.Hierarchy( me.gateway );

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\bud\\approveBudget";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
						
			me.defineFormControls();
			me.configureCommunications();
			me.modified(false);
			
			$(window).bind("resize", me, me.resize );
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.fiscalYear.fetchingData();
			me.yearStore.fetch("userId:[user],", me.yearsLoaded, me);
			$("#hirNodeLoading").show();
			ii.trace("Hierarchy Nodes Loading", ii.traceTypes.Information, "Info");
			me.hirNodeStore.fetch("userId:[user],hierarchy:2,", me.hirNodesLoaded, me);			
		},
		
		authorizationProcess: function fin_bud_approveBudget_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			$("#pageLoading").hide();
			
			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_approveBudget_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function fin_bud_approveBudget_UserInterface_resize() {
			var args = ii.args(arguments, {});
			var me = this;
			var offset = 105;
			
			$("#hirContainer").height($(window).height() - offset);
			$("#detailContainer").height($(window).height() - offset);
		},
		
		defineFormControls: function fin_bud_approveBudget_UserInterface_defineFormControls() {
			var me = this;			
			
			$("#ulEdit0").treeview({
		        animated: "medium",
		        persist: "location",
				collapsed: true
	        });	
			
			me.anchorLoad = new ui.ctl.buttons.Sizeable({
				id: "AnchorLoad",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUnitLoad(); },
				hasHotState: true
			});
			
			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.appUnit = new ui.ctl.Input.Text({
		        id: "AppUnit",
				maxLength: 8,
				title: "To search a specific House Code in the following Hierarchy, type-in House Code# (0941, 14244) and press Enter key/click Load button."
		    });			
						
			$("#AppUnitText").bind("keydown", me, me.actionSearchItem);
			
			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
		        id: "FiscalYear",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.actionYearChanged(); },
				required : false
		    });
			
			me.fiscalYear.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.fiscalYear.indexSelected == -1)
						this.setInvalid("Please select the correct Year.");
				});
			
			me.job = new ui.ctl.Input.DropDown.Filtered({
				id: "Job",
				formatFunction: function(type) { return (type.jobTitle == "[ALL]" ? type.jobTitle : type.jobNumber + " - " + type.jobTitle); },
				changeFunction: function() { me.actionJobChanged(); },
				required: false
			});
			
			me.comments = $("#Comments")[0];

			$("#Comments").height(100);
			$("#Comments").keypress(function() {
				if (me.comments.value.length > 1999) {
					me.comments.value = me.comments.value.substring(0, 2000);
					return false;
				}
			});
			$("#Comments").change(function() { me.modified(); });

			ii.trace("Controls Loaded", ii.traceTypes.Information, "Info");
		},
		
		configureCommunications: function fin_bud_approveBudget_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirOrgs = [];
			me.hirOrgStore = me.hierarchy.register( {
				storeId: "hirOrgs",
				itemConstructor: ui.ctl.Hierarchy.Node,
				itemConstructorArgs: ui.ctl.Hierarchy.nodeArgs,
				isRecursive: true,
				addToParentItem: true,
				parentPropertyName: "nodes",
				parentField: "parent",
				multipleFetchesAllowed: true,
				injectionArray: me.hirOrgs
			});
						
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.bud.approveBudget.HirNode,
				itemConstructorArgs: fin.bud.approveBudget.hirNodeArgs,
				injectionArray: me.hirNodes	
			});
			
			me.units = [];
			me.unitStore = me.cache.register({
				storeId: "units",
				itemConstructor: fin.bud.approveBudget.AppUnit,
				itemConstructorArgs: fin.bud.approveBudget.appUnitArgs,
				injectionArray: me.units
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.bud.approveBudget.HouseCode,
				itemConstructorArgs: fin.bud.approveBudget.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.bud.approveBudget.HouseCodeJob,
				itemConstructorArgs: fin.bud.approveBudget.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.years = [];
			me.yearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.bud.approveBudget.Year,
				itemConstructorArgs: fin.bud.approveBudget.yearArgs,
				injectionArray: me.years
			});
			
			me.annualBudgets = [];
			me.annualBudgetStore = me.cache.register({
				storeId: "budAnnualBudgets",
				itemConstructor: fin.bud.approveBudget.AnnualBudget,
				itemConstructorArgs: fin.bud.approveBudget.annualBudgetArgs,
				injectionArray: me.annualBudgets
			});

			ii.trace("Communication Configured", ii.traceTypes.Information, "Info");
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
						//me.actionSaveItem();
						processed = true;
						break;
						
					case 85: // Ctrl+U
						//me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},
		
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;

			parent.parent.fin.appUI.modified = args.modified;
		},
		
		resizeControls: function() {
			var me = this;
			
			me.appUnit.resizeText();
			me.fiscalYear.resizeText();
			me.job.resizeText();
			me.resize();
		},
		
		yearsLoaded: function(me, activeId) {
		
  			me.fiscalYear.setData(me.years);
			me.fiscalYear.select(0, me.fiscalYear.focused);				
			me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
			me.resizeControls();
		},
				
		actionYearChanged: function() {
			var me = this;
			
			if (me.fiscalYear.indexSelected >= 0)
				me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;
			else
				me.fiscalYearId = 0;
				
			me.modified(true);
		},
		
		houseCodeLoaded: function(me, activeId) {
			
			if (me.houseCodes.length > 0) {
				me.job.fetchingData();
				me.houseCodeJobStore.reset();
				me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + me.houseCodes[0].id, me.houseCodeJobsLoaded, me);
			}		
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
			
			me.houseCodeJobs.unshift(new fin.bud.approveBudget.HouseCodeJob({ id: 0, jobNumber: "", jobTitle: "[ALL]", jobId: 0 }));
			me.job.setData(me.houseCodeJobs);
			me.job.select(0, me.job.focused);			
			me.jobId = 0;			
		},
		
		actionJobChanged: function() {
			var me = this;
			
			if (me.job.indexSelected > 0) {
				me.jobId = me.houseCodeJobs[me.job.indexSelected].jobId;
				me.annualBudgetStore.fetch("userId:[user],hcmHouseCode:" + me.houseCodes[0].id + ",fscYear:" + me.fiscalYearId + ",hcmJob:" + me.jobId, me.annualBudgetsLoaded, me);		
			}
			else {
				me.jobId = 0;
				me.anchorApprove.display(ui.cmn.behaviorStates.enabled);
			}
			
			me.modified(true);
		},
		
		annualBudgetsLoaded: function(me, activeId) {

			if (me.annualBudgets.length > 0) {
				if (me.annualBudgets[0].approved)
					me.anchorApprove.display(ui.cmn.behaviorStates.disabled);
				else
					me.anchorApprove.display(ui.cmn.behaviorStates.enabled);
			}
			else
				me.anchorApprove.display(ui.cmn.behaviorStates.disabled);
		},
		
		actionSearchItem: function fin_bud_approveBudget_UserInterface_actionSearchItem() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
				
			if (event.keyCode == 13) {
				me.actionUnitLoad();
			}
		},
		
		actionUnitLoad: function fin_bud_approveBudget_UserInterface_actionUnitLoad() {			
			var me = this;			
			
			if (me.appUnit.getValue() == "") return;			
	
			$("#AppUnitText").addClass("Loading");
			
			me.unitStore.fetch("userId:[user],unitBrief:" + me.appUnit.getValue() + ",", me.actionUnitsLoaded, me);			
		},
		
		actionUnitsLoaded: function fin_bud_approveBudget_UserInterface_actionUnitsLoaded(me, activeId) {

			$("#AppUnitText").removeClass("Loading");

			if (me.units.length <= 0) {
				
				ii.trace("Could not load the said House Code.", ii.traceTypes.Information, "Info");
				alert("There is no corresponding House Code available or you do not have enough permission to access it.");

				return;
			}

			me.appUnit.setValue(me.units[0].description);
			me.hirNodeCurrentId = me.units[0].hirNode;
			
			var found = false;
			
			for (var index = 0; index < me.hirNodesList.length; index++) {
				if (me.hirNodesList[index].id == me.hirNodeCurrentId) {
					found = true;
					break;
				}
			}
			
			if (!found) {
				ii.trace("Hirnodes Loading", ii.traceTypes.Information, "Info");
				$("#hirNodeLoading").show();
				me.hirOrgStore.reset();
				me.hirOrgStore.fetch("userId:[user],hirOrgId:" + me.hirNodeCurrentId + ",hirNodeSearchId:" + me.hirNodeCurrentId + ",ancestors:true", me.hirOrgsLoaded, me);
			}
			else
				me.selectNode();
		},
		
		hirOrgsLoaded: function fin_bud_approveBudget_UserInterface_hirOrgsLoaded(me, activeId) {
			
			var childNodesCount = 0;
			var found = false;
			
			me.hirNodesTemp = [];
			
			for (var index = 0; index < me.hirOrgs.length; index++) {
				if (me.hirOrgs[index].hirLevel != -1) {
					found = false;
					
					for (var nodeIndex = 0; nodeIndex < me.hirNodesList.length; nodeIndex++) {
						if (me.hirNodesList[nodeIndex].id == me.hirOrgs[index].id) {
							found = true;
							break;
						}
					}
					
					if (!found) {
						if (me.hirOrgs[index].hirLevel == 7)
							childNodesCount = 0;
						else
							childNodesCount = 1;

						var item = new fin.bud.approveBudget.HirNode(me.hirOrgs[index].id
							, me.hirOrgs[index].parent.id
							, me.hirOrgs[index].hirLevel
							, me.hirOrgs[index].hirLevelTitle
							, 2
							, me.hirOrgs[index].brief
							, me.hirOrgs[index].title					
							, childNodesCount
							)
						
						me.hirNodesTemp.push(item);
					}
				}
			}
			
			me.actionAddNodes();
			me.selectNode();
			
			ii.trace("Hirnodes Loaded", ii.traceTypes.Information, "Info");
		},
		
		selectNode: function() {
			var me = this;
			var hirNodeId = me.hirNodeCurrentId;
			var found = true;
			
			while (found) {
				for(var index = 0; index < me.hirNodesList.length; index++) {
					if(me.hirNodesList[index].id == hirNodeId) {
						var parentId = me.hirNodesList[index].nodeParentId;
						var parentNode = $("#liNode" + parentId)[0];
						hirNodeId = parentId;

						if (parentNode != undefined) {
							found = true;

							if (parentNode.className == "expandable" || parentNode.className == "expandable lastExpandable")
								$("#liNode" + hirNodeId).find(">.hitarea").click();										
						}

						break;
					}
					else
						found = false;					
				}
			}			
			
			me.hirNodeSingleLoaded(me.hirNodeCurrentId);
			$("#liNode" + me.hirNodeCurrentId).focus();
		},
		
		hirNodesLoaded: function(me, activeId) {
			
			me.hirNodesTemp = me.hirNodes.slice();
			me.actionAddNodes();			
		},
		
		actionAddNodes: function() {
			var me = this;
			var index = -1;
		 	var hirNode = 0;
            var hirParentNode = 0;
            var hirNodeTitle = "";
			var childNodeCount = 0;
            var nodeList = "";
            var treeNode = null;

			for (index = 0; index < me.hirNodesTemp.length; index++) {
				hirNode = me.hirNodesTemp[index].id;
				hirParentNode = me.hirNodesTemp[index].nodeParentId;
				hirNodeTitle = me.hirNodesTemp[index].title;
				childNodeCount = me.hirNodesTemp[index].childNodeCount;
				nodeList = "";
				treeNode = null;
				
				//set up the edit tree
                //add the item underneath the parent list
				me.actionNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount);
			}
			
			me.storeHirNodes();
			
			if (me.hirNodePreviousSelected == 0) {
    			me.hirNodeSingleLoaded(me.hirNodesTemp[0].id);
			}
			
			$("#pageLoading").hide();	
			$("#hirNodeLoading").hide();
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
		    	+ "<span id=\"span" + args.hirNode + "\" class='TreeNodeText'>" + args.hirNodeTitle + "</span>";
            
            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id=\"ulEdit" + args.hirNode + "\"></ul>";
			}

            nodeHtml += "</li>";

			if ($("#liNode" + args.hirNodeParent)[0] == undefined)
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

			for (index = 0; index < me.hirNodesTemp.length; index++) {
				me.hirNodesList.push(me.hirNodesTemp[index]);
			}			
		},
		
		hirNodeSingleLoaded: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
			});           
			var me = this;			
			var index = me.getNodeIndex(args.hirNode);			

			me.jobId = 0;
			me.comments.value = "";
			me.anchorApprove.display(ui.cmn.behaviorStates.enabled);
			me.hirNodeSelected = me.hirNodesList[index].id;
			
			if (me.hirNodesList[index].hirLevel == 7) {				
				$("#divJob").show();
				me.houseCodeStore.fetch("userId:[user],hirNodeId:" + me.hirNodeSelected, me.houseCodeLoaded, me);	
			}
			else
				$("#divJob").hide();
			
			if (me.hirNodePreviousSelected > 0) {
				$("#span" + me.hirNodePreviousSelected).replaceClass("TreeNodeTextSelected", "TreeNodeText");
			}
			
			me.hirNodePreviousSelected = me.hirNodeSelected;
			
			$("#span" + me.hirNodeSelected).replaceClass("TreeNodeText", "TreeNodeTextSelected")
		},
		
		hitAreaSelect: function(nodeId) {        
   			var me = this;
			
			if ($("#ulEdit" + nodeId)[0].innerHTML == "") {
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
			
			for (index = 0; index < me.hirNodesList.length; index++){
				if(me.hirNodesList[index].id == args.hirNode)
					return index;
			}
			
			return 0;
		},		

		actionClearItem: function() {
			var me = this;

			me.anchorApprove.display(ui.cmn.behaviorStates.disabled);
		},

		actionSaveItem: function() {		
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var errorMessage = "";
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				errorMessage += "In order to save, the errors on the page must be corrected.\n";
			}
			
			if (me.comments.value == "") {
				errorMessage += "Comments field is required. Please make an entry.\n";
			}
			
			if (!me.hirNodeSelected) {
				errorMessage += "Please select a node on the left panel.\n";
			}
						
			if (errorMessage != "") {
				alert (errorMessage);
				return false;
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
				
			item = new fin.bud.approveBudget.AnnualBudget(0, "", "", false, 0);
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
				item: {type: fin.bud.approveBudget.AnnualBudget}
			});			
			var me = this;
			var item = args.item;
			var xml = "";			
	
			xml += '<budAnnualBudgetApprove';
			xml += ' id="' + item.id + '"';
			xml += ' hirNode="' + me.hirNodeSelected + '"';
			xml += ' hcmHouseCode="0"';
			xml += ' fscYear="' + me.fiscalYearId + '"';
			xml += ' hcmJob="' + me.jobId + '"';
			xml += ' approved="true"';
			xml += ' comments="' + ui.cmn.text.xml.encode(me.comments.value) + '"';
			xml += '/>';

			ii.trace("Xml Build", ii.traceTypes.Information, "Info");
	
			return xml;
		},
		
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");

			$("#pageLoading").hide();

			if (status == "success") {
				me.actionClearItem();
				me.modified(false);
				ii.trace("Budget Approved", ii.traceTypes.Information, "Info");
			}
			else {
				alert("[SAVE FAILURE] Error while approving the budget information: " + $(args.xmlNode).attr("message"));
			}
		}
	}
});

function main() {
	fin.approveBudgetUi = new fin.bud.approveBudget.UserInterface();
	fin.approveBudgetUi.resize();
}
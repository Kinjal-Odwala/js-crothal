ii.Import( "fin.cmn.usr.treeView" );
ii.Style( "fin.cmn.usr.treeView" , 99);

if( !ui.lay ) {
	ui.lay = {};
}

/* @iiDoc {Class}
 * House Code Selection Template
 */
ii.Class({
	Name: "ui.lay.HouseCodeSearchTemplate",
	Definition: {
		init: function ui_lay_HouseCodeSearchTemplate_init() {
			var me = this;
			
			//pre-condition: parent UI shoud have a DIV named 'houseCodeTemplateContainer'
			//add hirNodeArgs & HirNode definition in parent def.js
			//add store definition to parent main.js
			//ii.Import("fin.cmn.usr.houseCodeSearch"); //import this file in parent main.js.
			//Extends: "ui.lay.HouseCodeSearchTemplate", //add this to class definition
			//me.houseCodeSearchTemplate = new ui.lay.HouseCodeSearchTemplate(); // add this line in parent main.js 'init' method.
			//fin.houseCodeSearchUi = fin.parentUi; add this line to parent main.js main() method.
			//@import url('fin/cmn/usr/treeView.css'); 
			//OPTIONAL: 'houseCodesChanged' event handler in parent main.js.

			me.houseHirNodeSelected = 0;
			me.houseCodeIdTemplate = 0;
			me.hirNodeTemplate = 0;

			$("#houseCodeTemplateContainer").html(
				'<input type="text" id="houseCodeTemplateText" class="HouseCodeText" tabindex="0"/>'
				+ '<div id="houseCodeTemplateTextDropImage" class="HouseCodeDropDown"></div>');
			
			fin.HouseCodeTemplateUI = me;
			
            $("#houseCodeTemplateTextDropImage").click( function() { //show HouseCode List
				if ($("#houseCodeTree").is(':visible')) {
					$("#houseCodeTree").hide();
					
					return;
				}
				
				fin.HouseCodeTemplateUI.houseCodeTreeShow(me.houseHirNodeSelected);
			});
           
			$("#houseCodeTreeClose").click(function() { //hide HouseCode List
				$("#houseCodeTree").hide();
			});
			
			$("#houseCodeTemplateText").keyup(function(event) {

				$("#houseCodeTree").hide();
				if (event.keyCode == 13) {
					fin.HouseCodeTemplateUI.houseCodeFetch(this.value); 
				}
			});			
		},

		houseCodeFetch: function() {
			var args = ii.args(arguments, {
				appUnitBrief: {type: String}				
			});			
			var me = this;
			
			me.houseCodeIdTemplate = 0;	
			me.hirNodeTemplate = 0;		
			$("#houseCodeTemplateTextDropImage").addClass("HouseCodeDropDownLoader");
			fin.houseCodeSearchUi.houseCodeStore.reset();
			fin.houseCodeSearchUi.houseCodeStore.fetch("userId:[user],appUnitBrief:" + args.appUnitBrief + ",", this.houseCodeSearchTemplateLoaded, this);
		},
		
		//on click of drop button show tree drowndown structure 		
		houseCodeTreeShow: function() {
			var args = ii.args(arguments, {
				nodeSelected: {type: Number}
			});			
			var me = this;
			var pos;
			var parentElementHeight;

			pos = $("#houseCodeTemplateContainer").offset();
			parentElementHeight = $("#houseCodeTemplateContainer").outerHeight();

			var left = pos.left + 'px';
			var top = pos.top + parentElementHeight + 'px';

			$("#houseCodeTree").css({
				left: left
				,top: top
			});
			$("#houseCodeTree").show();
			$("#ulEditHouseCode0").html("");	

			me.hirNodeInProcess = args.nodeType; // top, current
			$("#houseCodeLoading").show();
			
			me.houseHirNodeSelected = args.nodeSelected;

			fin.houseCodeSearchUi.hirNodeStore.reset();
			fin.houseCodeSearchUi.hirNodeStore.fetch("userId:[user],hierarchy:2,", this.houseHirNodesTreeLoaded, this);
		},

		//build tree structure
		houseHirNodesTreeLoaded: function(me, activeId) {
		
			var index = -1;
		 	var hirNode = 0;
            var hirNodeTitle = "";
            var hirParentNode = 0;
			var childNodeCount = 0;
			var hirLevel = 0;
			
			if(me.houseHirNodeSelected == 0 && fin.houseCodeSearchUi.hirNodes.length > 0) me.houseHirNodeSelected = fin.houseCodeSearchUi.hirNodes[0].id;
			 
			for (index = 0; index < fin.houseCodeSearchUi.hirNodes.length; index++) {
				hirNode = fin.houseCodeSearchUi.hirNodes[index].id;
				hirParentNode = fin.houseCodeSearchUi.hirNodes[index].nodeParentId;
				hirNodeTitle = fin.houseCodeSearchUi.hirNodes[index].title;
				childNodeCount = fin.houseCodeSearchUi.hirNodes[index].childNodeCount;
				hirLevel = fin.houseCodeSearchUi.hirNodes[index].hirLevel;
				
				//set up the edit tree
                //add the item underneath the parent list
				me.houseHirNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount, hirLevel);
			}			
			
			$("#houseCodeLoading").hide();
		},
		
		houseHirNodeAppend: function() { //Parent DD
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirNodeTitle: {type: String}
				, hirNodeParent: {type: Number}
				, childNodeCount: {type: Number}
				, hirLevel: {type: Number}
			});			
			var me = this;
			
			if (me.hirNode == 0) 
				me.hirNode = args.hirNode;
				
            nodeHtml = "<li id=\"liNode" + args.hirNode + "\">"
		                    + "<span id=\"span" + args.hirNode + "\" class='TreeNodeText'>"
			                    + args.hirNodeTitle + "</span>";
            
            //add a list holder if the node has children
            if (args.childNodeCount != 0) {
            	nodeHtml += "<ul id=\"ulEditHouseCode" + args.hirNode + "\"></ul>";
			}

            nodeHtml += "</li>";

			if($("#liNode" + args.hirNodeParent)[0] == undefined)
				args.hirNodeParent = 0;

            var treeNode = $(nodeHtml).appendTo("#ulEditHouseCode" + args.hirNodeParent);
        	$("#ulEditHouseCode0").treeview({add: treeNode});
            
			me.houseHirNodeEventReset(args.hirNode, args.hirLevel);
												           
			return nodeHtml;	
		},
		
		//reset tree node event handlers
		houseHirNodeEventReset: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirLevel: {type: Number}
			});
			var me = this;
			
            //link up the node
            $("#span" + args.hirNode).bind("click", function() { 
				me.houseHirNodeSelect(args.hirNode, args.hirLevel);
			});
			
		    $("#liNode" + args.hirNode).find(">.hitarea").bind("click", function() { 
				me.houseHirNodeHitAreaSelect(args.hirNode);
			});
		},
		
		// tree node +/- sign click handler
		houseHirNodeHitAreaSelect: function() {
			var args = ii.args(arguments, {
				nodeId: {type: Number}
			});
			var me = this;
			
			if ($("#ulEditHouseCode" + args.nodeId)[0].innerHTML == "") {
				fin.houseCodeSearchUi.hirNodeStore.fetch("userId:[user],hirNodeParent:" + args.nodeId + ",", this.houseHirNodesTreeLoaded, this);
			}
		},
		
		// tree node text click handler
		houseHirNodeSelect: function() {
			var args = ii.args(arguments, {
				hirNode: {type: Number}
				, hirLevel: {type: Number}
			});
			var me = this;

			if (me.houseHirNodeSelected > 0) {
				$("#span" + me.houseHirNodeSelected).replaceClass("TreeNodeTextSelected", "TreeNodeText");
			}
			
			$("#span" + args.hirNode).replaceClass("TreeNodeText", "TreeNodeTextSelected")

			me.houseHirNodeSelected = args.hirNode;

			if (args.hirLevel == 7) {

				$("#houseCodeTree").hide();
				$("#houseCodeTemplateText").val($("#span" + args.hirNode)[0].innerHTML);
				
				me.houseCodeIdTemplate = 0;
				me.hirNodeTemplate = 0;
				fin.houseCodeSearchUi.houseCodeStore.reset();
				fin.houseCodeSearchUi.houseCodeStore.fetch("userId:[user],hirNodeId:" + args.hirNode + ",", this.houseCodeSearchTemplateLoaded, this);
			}
		},		
		
		houseCodeSearchTemplateLoaded: function(me, activeId) {
			
			$("#houseCodeTemplateTextDropImage").removeClass("HouseCodeDropDownLoader");

			if (fin.houseCodeSearchUi.houseCodes.length <= 0) {

				return me.houseCodeSearchTemplateError();
			}			
		
			me.houseCodeIdTemplate = fin.houseCodeSearchUi.houseCodes[0].id;
			me.houseCodeTitleTemplate = fin.houseCodeSearchUi.houseCodes[0].name;
			me.hirNodeTemplate = fin.houseCodeSearchUi.houseCodes[0].hirNode;
			me.houseCodeTemplateParametersUpdate(false);

			//handles change event in parent main.js.			
			if(fin.houseCodeSearchUi.houseCodeTemplateChanged) fin.houseCodeSearchUi.houseCodeTemplateChanged();
			
			$("#pageLoading").hide();
		},
		
		houseCodeSearchTemplateError: function() {
			var me = this;
			
			alert("There is no corresponding HouseCode available or you do not have enough permission to access it.");
			me.houseCodeTemplateParametersUpdate(true);
			
			return false;
		},
		
		houseCodeTemplateParametersUpdate: function(resetParameters) {
			var args = ii.args(arguments, {
				resetParameters: {type: Boolean}, 
				houseCode: {type: Object, required: false, defaultValue: null}
			});
			var me = this;
			
			if (args.resetParameters) {
				me.houseCodeIdTemplate = 0;
				me.hirNodeTemplate = 0;
				me.houseCodeTitleTemplate = "";
				$("#houseCodeTemplateText").val("");
			}
			else {

				if (args.houseCode) {
					me.houseCodeIdTemplate = args.houseCode.id;
					me.houseCodeTitleTemplate = args.houseCode.name;
					me.hirNodeTemplate = args.houseCode.hirNode;					
				}
				
				$("#houseCodeTemplateText").val(me.houseCodeTitleTemplate);				
			}
		}
	}
});